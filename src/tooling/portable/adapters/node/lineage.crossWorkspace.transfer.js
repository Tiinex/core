import path from 'node:path';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import { access, lstat, mkdir, readFile, readdir, rename, rm, link, open } from 'node:fs/promises';
import { stableFingerprintBytes, sha256Hex, utf8Bytes } from '../../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../../../../artifacts/artifact.record.js';
import { inspectPortableCrossWorkspaceContinuity, recheckPortableCrossWorkspaceContinuity } from './lineage.crossWorkspace.inspect.js';
import { inspectPortableWorkspaceReferenceInventory } from './lineage.scoped-move.inspect.js';
import { acquireLineageMaintenanceWorkspaceLocks, releaseLineageMaintenanceWorkspaceLocks, writeFileDurable } from './lineage.maintenance.transaction.js';

export const CROSS_WORKSPACE_TRANSFER_SCHEMA = 'tiinex.portable.cross-workspace-standalone-transfer.v1';
const DIR = '.tiinex/cross-workspace-transfers';
const safe = p => typeof p === 'string' && p.startsWith('.topics/') && !p.includes('\\') && !p.split('/').some(x=>!x||x==='.'||x==='..');
const issue = (code, detail='') => ({severity:'error',code:`cross-workspace.transfer.${code}`,message:detail});
const fp = item => stableFingerprintBytes(utf8Bytes(JSON.stringify(item)));
const location = (root,relative) => {
  if(!safe(relative))throw Error('unsafe-relative-path');
  const out=path.resolve(root,relative); if(!out.startsWith(path.resolve(root)+path.sep))throw Error('outside-root');
  return out;
};
async function exists(p) {try{await access(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function noSymlinks(root,rel) {
  let cursor=path.resolve(root);
  for(const component of rel.split('/')) {
    cursor=path.join(cursor,component);
    try {const x=await lstat(cursor);if(x.isSymbolicLink())throw Error(`symbolic-link:${cursor}`);if(component===rel.split('/').at(-1)&&!x.isFile())throw Error(`not-a-regular-file:${cursor}`);}catch(e){if(e.code!=='ENOENT')throw e;}
  }
}
async function safeTarget(root,rel) {
  let cursor=path.resolve(root);
  for(const component of rel.split('/')) {
    cursor=path.join(cursor,component);
    try{const x=await lstat(cursor);if(x.isSymbolicLink())throw Error(`symbolic-link:${cursor}`);}catch(e){if(e.code!=='ENOENT')throw e;}
  }
}
async function syncDirectory(p){let handle;try{handle=await open(p,'r');await handle.sync();}catch{}finally{await handle?.close().catch(()=>{});}}
async function writeJournal(file,body){const temp=`${file}.tmp-${randomUUID()}`;await writeFileDurable(temp,`${JSON.stringify(body,null,2)}\n`);await rename(temp,file);await syncDirectory(path.dirname(file));}
const journalPath=(root,tx)=>path.join(root,DIR,tx,'journal.json');
const backupPath=(root,tx)=>path.join(root,DIR,tx,'source.backup');
const stagePath=(root,tx)=>path.join(root,DIR,tx,'target.stage');
async function inventoryRecheck(plan){return recheckPortableCrossWorkspaceContinuity({inspection:plan.inspection,sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace});}

/** Strict executable vertical slice. Not a general cross-Workspace move:
 * only a self-verified, parentless, linkless, descendantless standalone .trace
 * artifact with ZERO incoming readers and zero selected assets can change root.
 * Both Workspaces must be physically inspected and we exclude unknown dynamic
 * languages instead of interpreting missing references as proof of absence. */
export async function inspectPortableCrossWorkspaceStandaloneTransfer(input={}) {
  const inspection=await inspectPortableCrossWorkspaceContinuity(input);
  const op=input.operation||{},source=input.sourceWorkspace||{},target=input.targetWorkspace||{};
  const fail=(code,msg)=>({schema:CROSS_WORKSPACE_TRANSFER_SCHEMA,status:'blocked',executable:false,inspection,findings:[issue(code,msg)],boundary:'Only qualified standalone Same + Keep Parent transfers can Apply; all Parent, child, asset, incoming, dynamic or unqualified reference cases remain blocked.'});
  if(inspection.inspectionStatus!=='qualified'||!inspection.workspaceSnapshots?.length)
    return fail('inspection-unqualified','Both source and target Workspace inventories must qualify.');
  if(op.scope!=='alone'||op.placement!=='same'||op.parentPolicy!=='keep')
    return fail('operation-not-in-subset','Only Alone + Same + Keep Parent is implemented for cross-Workspace Apply.');
  if(inspection.selection?.artifactPaths?.length!==1||inspection.selection?.assetPaths?.length)
    return fail('selection-not-standalone','Selection must contain exactly one .trace artifact and no selected assets.');
  if(inspection.inboundReferences.length||inspection.outboundParentDependencies.length)
    return fail('references-or-parent','Any incoming reference or outgoing Parent must be qualified by the future general graph/Publication transaction.');
  const sourceText=await readFile(location(source.workspaceRoot,op.selectedPath),'utf8');
  if(canonicalC14nV2SelfState(sourceText).state!=='verified')return fail('source-self-unqualified','Source self integrity is not verified.');
  if(createRecordFromMarkdown(sourceText,{path:op.selectedPath}).trace)return fail('source-parent-present','Standalone transfer cannot preserve a non-empty Parent.');
  for(const m of sourceText.matchAll(/!?\[[^\]\r\n]*\]\((<[^>\r\n]*>|(?:\\.|[^)\r\n])*)\)/g)) {
    const loc=m[1].replace(/^<|>$/g,'');
    if(!/^(?:https?:\/\/|mailto:)/i.test(loc))return fail('source-reference-unqualified',`Cannot relocate local or dynamic source link: ${loc}`);
  }
  // Other formats may contain dynamic or computed references. No absolute
  // guarantee can be made by scanning them; this slice requires only Markdown
  // or opaque binary material in BOTH Workspaces.
  for(const snap of inspection.workspaceSnapshots) {
    const full=await inspectPortableWorkspaceReferenceInventory({workspaceRoot:snap.root,workspaceId:snap.workspaceId});
    if(full.status!=='ready')return fail('inventory-drift','Physical inspection changed while planning.');
    const unsupported=full.inventory.filter(x=>!x.path.endsWith('.md') && !/\.(?:png|jpe?g|gif|webp|pdf|bmp|avif|ico|bin|mp4|mov|wav|mp3)$/i.test(x.path));
    if(unsupported.length)return fail('dynamic-reference-surface',`Non-Markdown source formats not proven reference-free: ${unsupported[0].path}`);
  }
  const anchor=op.targetPath;
  if(!safe(anchor)||!anchor.endsWith('.trace.md'))return fail('target-anchor-invalid','Target artifact must be a qualified trace.');
  const match=path.posix.basename(anchor).match(/^(\d+(?:-\d+)*)-(.+\.trace\.md)$/);
  const selected=path.posix.basename(op.selectedPath).match(/^\d+(?:-\d+)*-(.+\.trace\.md)$/);
  if(!match||!selected)return fail('numeric-coordinate-invalid','Both artifacts require explicit dimension and slug.');
  const destDir=path.posix.dirname(anchor),prefix=match[1].split('-');
  const srcId=source.workspaceId,dstId=target.workspaceId;
  const destInventory=await inspectPortableWorkspaceReferenceInventory({workspaceRoot:target.workspaceRoot,workspaceId:dstId});
  const existing=destInventory.materials.filter(m=>path.posix.dirname(m.path)===destDir);
  const used=new Set(existing.map(m=>path.posix.basename(m.path).match(/^(\d+(?:-\d+)*)-/)?.[1]).filter(Boolean));
  let n=Math.max(Number(prefix.at(-1)),...existing.map(m=>{
    const dim=path.posix.basename(m.path).match(/^(\d+(?:-\d+)*)-/)?.[1]?.split('-');
    return dim&&dim.length===prefix.length&&dim.slice(0,-1).join('-')===prefix.slice(0,-1).join('-')?Number(dim.at(-1)):0;
  }),0)+1;
  const dimension=[...prefix.slice(0,-1),String(n).padStart(prefix.at(-1).length,'0')].join('-');
  if(used.has(dimension))return fail('dimension-collision','A numeric target coordinate is occupied.');
  const toPath=path.posix.join(destDir,`${dimension}-${selected[1]}`);
  if(await exists(location(target.workspaceRoot,toPath)))return fail('target-collision','Target file already exists.');
  const move={sourceWorkspaceId:srcId,fromPath:op.selectedPath,targetWorkspaceId:dstId,toPath,
    bytesSha256:sha256Hex(utf8Bytes(sourceText)),sourceFingerprint:stableFingerprintBytes(utf8Bytes(sourceText)),bytes:sourceText.length};
  const plan={schema:CROSS_WORKSPACE_TRANSFER_SCHEMA,status:'ready',executable:true,operation:op,
    sourceWorkspace:{workspaceId:srcId,workspaceRoot:path.resolve(source.workspaceRoot)},
    targetWorkspace:{workspaceId:dstId,workspaceRoot:path.resolve(target.workspaceRoot)},inspection,move,
    boundary:{limitedTo:'parentless-reference-free-single-artifact',atomicTwoRoots:true,remoteWrite:false,gitMutation:false}};
  return {...plan,planFingerprint:fp({operation:op,inspectionSnapshots:inspection.workspaceSnapshots,move})};
}

/** Writes one transaction journal in BOTH roots before source backup/target
 * promotion. Recovery refuses unknown bytes, never deletes an unowned target.
 * Locking is shared with existing Core lineage maintenance operations. */
export async function applyPortableCrossWorkspaceStandaloneTransfer(plan={},options={}){
  const fail=(code,msg,extra={})=>({schema:'tiinex.portable.cross-workspace-transfer-receipt.v1',status:'blocked',applied:false,findings:[issue(code,msg)],...extra});
  if(plan.schema!==CROSS_WORKSPACE_TRANSFER_SCHEMA||plan.status!=='ready'||!plan.executable||!plan.inspection||!plan.move)return fail('plan-invalid','An inspected executable transfer plan is required.');
  // A caller may edit a JSON plan and recompute its unkeyed fingerprint.
  // Recompute the entire independently qualified inspection against disk;
  // a forged 'no incoming readers' declaration is never authority to Apply.
  const rebuilt=await inspectPortableCrossWorkspaceStandaloneTransfer({sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace,operation:plan.operation});
  if(rebuilt.status!=='ready'||JSON.stringify(rebuilt.move)!==JSON.stringify(plan.move)||
     JSON.stringify(rebuilt.inspection.workspaceSnapshots)!==JSON.stringify(plan.inspection.workspaceSnapshots))
    return fail('inspection-proof-drift','Core could not reproduce the exact inspected selection, references and target allocation.');
  const expected=fp({operation:plan.operation,inspectionSnapshots:plan.inspection.workspaceSnapshots,move:plan.move});
  if(expected!==plan.planFingerprint)return fail('plan-tampered','The inspected move fingerprint differs from the submitted plan.');
  const src=plan.sourceWorkspace,dst=plan.targetWorkspace,m=plan.move;
  if(!src?.workspaceId||!dst?.workspaceId||src.workspaceId===dst.workspaceId||!src.workspaceRoot||!dst.workspaceRoot||
    path.resolve(src.workspaceRoot)===path.resolve(dst.workspaceRoot)||
    path.resolve(src.workspaceRoot).startsWith(path.resolve(dst.workspaceRoot)+path.sep)||
    path.resolve(dst.workspaceRoot).startsWith(path.resolve(src.workspaceRoot)+path.sep)||
    m.sourceWorkspaceId!==src.workspaceId||m.targetWorkspaceId!==dst.workspaceId||
    m.fromPath!==plan.operation.selectedPath||!safe(m.fromPath)||!safe(m.toPath)||!m.toPath.endsWith('.trace.md'))return fail('plan-roots-invalid','Two qualified immutable root identities are mandatory.');
  if(options.workspaceRoots) {
    if(path.resolve(options.workspaceRoots[src.workspaceId]||'')!==src.workspaceRoot||path.resolve(options.workspaceRoots[dst.workspaceId]||'')!==dst.workspaceRoot)
      return fail('root-mismatch','Provided roots differ from inspected Workspace roots.');
  }
  const roots=new Map([[src.workspaceId,src.workspaceRoot],[dst.workspaceId,dst.workspaceRoot]]);
  let recheck=await inventoryRecheck(plan);
  if(recheck.status!=='ready')return fail('snapshot-drift','Source or target changed after Preview.');
  const srcPath=location(src.workspaceRoot,m.fromPath),destPath=location(dst.workspaceRoot,m.toPath);
  try{
    await noSymlinks(src.workspaceRoot,m.fromPath);await safeTarget(dst.workspaceRoot,m.toPath);
    const original=await readFile(srcPath);
    if(sha256Hex(original)!==m.bytesSha256||stableFingerprintBytes(original)!==m.sourceFingerprint || canonicalC14nV2SelfState(original.toString('utf8')).state!=='verified')return fail('source-drift','Source bytes or C14n integrity changed.');
    if(await exists(destPath))return fail('destination-occupied','Refuse overwrite of destination.');
  }catch(e){return fail('preflight-failed',String(e.message||e));}
  const tx=`${sha256Hex(utf8Bytes(plan.planFingerprint)).slice(0,12)}-${randomUUID()}`;
  const locks=await acquireLineageMaintenanceWorkspaceLocks({workspaceIds:[src.workspaceId,dst.workspaceId],roots,transactionId:tx,planFingerprint:plan.planFingerprint});
  if(locks.status!=='ready')return fail('workspace-lock-failed','Workspace locking blocked.',{lockFindings:locks.findings});
  const state={schema:'tiinex.portable.cross-workspace-transfer-journal.v1',transactionId:tx,phase:'initializing',
    planFingerprint:plan.planFingerprint,participants:[src.workspaceId,dst.workspaceId].sort(),move:m,sourceWorkspace:src,targetWorkspace:dst};
  let journalsStarted=false,keepLocks=false;
  async function writeState(phase){state.phase=phase;for(const r of [src.workspaceRoot,dst.workspaceRoot])await writeJournal(journalPath(r,tx),state);if(options.onPhase)await options.onPhase({phase,transactionId:tx});}
  try{
    await writeState('initializing');journalsStarted=true;
    recheck=await inventoryRecheck(plan);if(recheck.status!=='ready')throw Error('snapshot-drift-under-lock');
    const locked=await inspectPortableCrossWorkspaceStandaloneTransfer({sourceWorkspace:src,targetWorkspace:dst,operation:plan.operation});
    if(locked.status!=='ready'||JSON.stringify(locked.move)!==JSON.stringify(m))throw Error('requalified-plan-mismatch-under-lock');
    if(await exists(destPath))throw Error('destination-occupied-under-lock');
    await safeTarget(dst.workspaceRoot,m.toPath);
    const bytes=await readFile(srcPath);if(sha256Hex(bytes)!==m.bytesSha256)throw Error('source-byte-drift');
    await writeFileDurable(stagePath(dst.workspaceRoot,tx),bytes);
    await writeState('prepared');
    recheck=await inventoryRecheck(plan);if(recheck.status!=='ready')throw Error('snapshot-drift-before-source-staging');
    await rename(srcPath,backupPath(src.workspaceRoot,tx));
    await syncDirectory(path.dirname(srcPath));await syncDirectory(path.dirname(backupPath(src.workspaceRoot,tx)));
    await writeState('sources-staged');
    // Source was deliberately removed to a journaled backup; rechecking its
    // *original* snapshot now would yield a false drift. The target root has
    // not yet been mutated and must STILL exactly match its Preview snapshot.
    const targetCurrent=await inspectPortableWorkspaceReferenceInventory({workspaceRoot:dst.workspaceRoot,workspaceId:dst.workspaceId});
    const targetExpected=plan.inspection.workspaceSnapshots.find(x=>x.workspaceId===dst.workspaceId);
    if(targetCurrent.status!=='ready'||targetCurrent.snapshotSha256!==targetExpected?.snapshotSha256)
      throw Error('target-snapshot-drift-after-source-staging');
    await mkdir(path.dirname(destPath),{recursive:true});
    if(await exists(destPath))throw Error('concurrent-destination');
    // A POSIX rename would overwrite a file created by a noncooperative
    // writer between the final exists() and the rename. A hardlink from the
    // durable stage atomically refuses EEXIST on the SAME target filesystem.
    await link(stagePath(dst.workspaceRoot,tx),destPath);
    await syncDirectory(path.dirname(destPath));
    await rm(stagePath(dst.workspaceRoot,tx));
    await writeState('outputs-promoted');
    const output=await readFile(destPath);
    if(sha256Hex(output)!==m.bytesSha256||canonicalC14nV2SelfState(output.toString('utf8')).state!=='verified')throw Error('post-output-verification-failed');
    if(await exists(srcPath))throw Error('unexpected-source-after-promotion');
    await writeState('committed');
    await cleanupTransfer(tx,[src.workspaceRoot,dst.workspaceRoot]);
    return {schema:'tiinex.portable.cross-workspace-transfer-receipt.v1',status:'ready',applied:true,transactionId:tx,
      move:m,verification:{bytesSha256Verified:true,selfIntegrityVerified:true,sourceRemoved:true,atomicTwoRootJournal:true}};
  }catch(e){
    let recovery;
    if(journalsStarted){recovery=await recoverPortableCrossWorkspaceTransfer({transactionId:tx,sourceWorkspace:src,targetWorkspace:dst,allowCurrentProcess:true});}
    else {await cleanupTransfer(tx,[src.workspaceRoot,dst.workspaceRoot]);recovery={status:'ready',recovered:true};}
    if(recovery.status!=='ready')keepLocks=true;
    return fail('transaction-aborted',String(e.message||e),{transactionId:tx,rollback:recovery,recoveryRequired:keepLocks});
  }finally{if(!keepLocks)await releaseLineageMaintenanceWorkspaceLocks(locks.acquired,tx);}
}
async function cleanupTransfer(tx,roots){for(const r of roots)await rm(path.join(r,DIR,tx),{recursive:true,force:true});}

/** Transaction recovery. Both journals must agree. Unexpected bytes never
 * get replaced or removed. The same owner lock is honored; stale live locks
 * require an explicit operator recovery after process death. */
export async function recoverPortableCrossWorkspaceTransfer({transactionId='',sourceWorkspace={},targetWorkspace={},allowCurrentProcess=false}={}){
  const fail=(code,message)=>({schema:'tiinex.portable.cross-workspace-transfer-recovery.v1',status:'blocked',recovered:false,findings:[issue(code,message)]});
  if(!/^[a-f0-9]{12}-[0-9a-f-]{36}$/.test(transactionId))return fail('recovery-id-invalid','Exact transaction ID is required.');
  const src=sourceWorkspace,dst=targetWorkspace;
  if(!src.workspaceRoot||!dst.workspaceRoot||src.workspaceId===dst.workspaceId||!src.workspaceId||!dst.workspaceId)return fail('recovery-roots-invalid','Both exact participant roots are required.');
  let entries;
  try{entries=await Promise.all([src.workspaceRoot,dst.workspaceRoot].map(r=>readFile(journalPath(r,transactionId),'utf8').then(JSON.parse)));}
  catch(e){return fail('journal-missing',`Both durable journals are required: ${e.message}`);}
  const [a,b]=entries;
  const immutableSame=JSON.stringify({...a,phase:''})===JSON.stringify({...b,phase:''});
  if(a.schema!=='tiinex.portable.cross-workspace-transfer-journal.v1'||!immutableSame||a.transactionId!==transactionId||
    a.sourceWorkspace.workspaceId!==src.workspaceId||a.targetWorkspace.workspaceId!==dst.workspaceId||
    a.sourceWorkspace.workspaceRoot!==src.workspaceRoot||a.targetWorkspace.workspaceRoot!==dst.workspaceRoot)return fail('journal-conflict','Participant journals disagree or root identity changed.');
  const locks = [src,dst].map(x=>({workspaceId:x.workspaceId,root:x.workspaceRoot,lockPath:path.join(x.workspaceRoot,'.tiinex','lineage-maintenance.lock')}));
  for(const lock of locks) {
    const observed=await readFile(lock.lockPath,'utf8').then(JSON.parse).catch(()=>null);
    if(!observed || observed.transactionId!==transactionId)return fail('recovery-lock-unqualified','Both participant locks must be owned by the exact transaction.');
    if(!allowCurrentProcess) {
      if(observed.hostname!==os.hostname() || !Number.isInteger(observed.pid) || observed.pid<=0)
        return fail('recovery-owner-unverifiable','A foreign-host or unknown owner cannot be proven stopped.');
      try{process.kill(observed.pid,0);return fail('recovery-active-process','Refuse recovery while transaction owner is still alive.');}
      catch(err){if(err.code!=='ESRCH')return fail('recovery-owner-unverifiable','Cannot prove transaction owner stopped.');}
    }
  }
  const source=location(src.workspaceRoot,a.move.fromPath),target=location(dst.workspaceRoot,a.move.toPath),backup=backupPath(src.workspaceRoot,transactionId);
  try{await safeTarget(src.workspaceRoot,a.move.fromPath);await safeTarget(dst.workspaceRoot,a.move.toPath);}
  catch(e){return fail('recovery-unsafe-path',String(e.message||e));}
  const sourceExists=await exists(source),targetExists=await exists(target),backupExists=await exists(backup);
  const digest=async p=>sha256Hex(await readFile(p));
  if(sourceExists&&(await digest(source))!==a.move.bytesSha256)return fail('unexpected-source-bytes','Source bytes changed after transaction.');
  if(targetExists&&(await digest(target))!==a.move.bytesSha256)return fail('unexpected-target-bytes','Target bytes are not owned by this transaction.');
  if(backupExists&&(await digest(backup))!==a.move.bytesSha256)return fail('unexpected-backup-bytes','Source backup bytes are unexpected.');
  if(a.phase==='committed'&&b.phase==='committed') {
    if(!targetExists||sourceExists||backupExists===false)return fail('committed-state-inconsistent','Cannot finalize inconsistent committed transaction.');
    await cleanupTransfer(transactionId,[src.workspaceRoot,dst.workspaceRoot]);
    if(!allowCurrentProcess)await releaseLineageMaintenanceWorkspaceLocks(locks,transactionId);
    return {schema:'tiinex.portable.cross-workspace-transfer-recovery.v1',status:'ready',recovered:true,disposition:'finalized-commit'};
  }
  if(!sourceExists&&!backupExists)return fail('original-missing','Neither source nor verified backup is available; recovery must not invent source bytes.');
  if(sourceExists&&backupExists)return fail('duplicate-original','Both source and backup exist; manual qualification is required.');
  if(targetExists)await rm(target);
  if(backupExists){await mkdir(path.dirname(source),{recursive:true});await rename(backup,source);}
  await cleanupTransfer(transactionId,[src.workspaceRoot,dst.workspaceRoot]);
  if(!allowCurrentProcess)await releaseLineageMaintenanceWorkspaceLocks(locks,transactionId);
  return {schema:'tiinex.portable.cross-workspace-transfer-recovery.v1',status:'ready',recovered:true,disposition:'rolled-back'};
}
