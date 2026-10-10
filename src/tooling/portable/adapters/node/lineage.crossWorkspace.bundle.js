import path from 'node:path';
import os from 'node:os';
import {randomUUID} from 'node:crypto';
import {access, lstat, mkdir, readFile, rename, rm, link, open, stat} from 'node:fs/promises';
import {sealC14nV2Self, canonicalC14nV2SelfState} from '../../../../integrity/integrity.c14nV2.js';
import {sha256Hex, stableFingerprintBytes, utf8Bytes} from '../../../../export/package.bytes.js';
import {createRecordFromMarkdown} from '../../../../artifacts/artifact.record.js';
import {inspectPortableCrossWorkspaceContinuity, recheckPortableCrossWorkspaceContinuity} from './lineage.crossWorkspace.inspect.js';
import {CROSS_WORKSPACE_GRAPH_BUNDLE_SCHEMA,inspectPortableCrossWorkspaceClosedGraph} from './lineage.crossWorkspace.graphBundle.js';
import {inspectPortableWorkspaceReferenceInventory} from './lineage.scoped-move.inspect.js';
import {acquireLineageMaintenanceWorkspaceLocks, releaseLineageMaintenanceWorkspaceLocks, writeFileDurable} from './lineage.maintenance.transaction.js';

export const CROSS_WORKSPACE_BUNDLE_SCHEMA='tiinex.portable.cross-workspace-standalone-asset-bundle.v1';
const JOURNAL='.tiinex/cross-workspace-bundles';
const safe=p=>typeof p==='string'&&p.startsWith('.topics/')&&!p.includes('\\')&&!p.includes('\0')&&!p.split('/').some(s=>!s||s==='.'||s==='..');
const loc=(root,p)=>{if(!safe(p))throw Error('unsafe relative path');const t=path.resolve(root,p);if(!t.startsWith(path.resolve(root)+path.sep))throw Error('outside root');return t;};
const err=(code,message)=>({severity:'error',code:`cross-workspace.bundle.${code}`,message});
const blocked=(code,message,extra={})=>({schema:CROSS_WORKSPACE_BUNDLE_SCHEMA,status:'blocked',executable:false,findings:[err(code,message)],...extra});
const exists=async p=>access(p).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e;});
async function safeComponents(root,p){let current=path.resolve(root);for(const segment of p.split('/')){current=path.join(current,segment);try{const st=await lstat(current);if(st.isSymbolicLink())throw Error('symlink path: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}}
async function syncDirectory(dir){let f;try{f=await open(dir,'r');await f.sync();}catch{}finally{await f?.close().catch(()=>{});}}
async function journalWrite(p,value){const t=`${p}.tmp-${randomUUID()}`;await writeFileDurable(t,JSON.stringify(value));await rename(t,p);await syncDirectory(path.dirname(p));}
const txDir=(root,id)=>path.join(root,JOURNAL,id);
const journal=(root,id)=>path.join(txDir(root,id),'journal.json');
const staging=(root,id,i)=>path.join(txDir(root,id),`staged-${i}`);
const backup=(root,id,i)=>path.join(txDir(root,id),`original-${i}`);
const fingerprint=plan=>sha256Hex(utf8Bytes(JSON.stringify({source:plan.sourceWorkspace,target:plan.targetWorkspace,operation:plan.operation,snapshots:plan.inspection.workspaceSnapshots,moves:plan.moves})));

/** Executable strict vertical slice. Parentless single artifact plus 1–16
 * same-dimension opaque binary assets, no incoming readers or descendants,
 * and only local references to those moved assets or true external URLs.
 * Every other reference/Parent case stays blocked. */
export async function inspectPortableCrossWorkspaceAssetBundle(input={}){
 const inspection=await inspectPortableCrossWorkspaceContinuity(input);
 const op=input.operation||{},src=input.sourceWorkspace||{},dst=input.targetWorkspace||{};
 const fail=(code,message)=>blocked(code,message,{inspection});
 if(Array.isArray(input.additionalWorkspaces) && input.additionalWorkspaces.length) return fail('additional-workspaces-unqualified','This bundle cannot certify reference closure in a third Workspace.');
 if(inspection.inspectionStatus!=='qualified'||inspection.workspaceSnapshots?.length!==2)return fail('inspection-unqualified','Both Workspace snapshots must qualify.');
 if(op.scope!=='alone-with-assets'||op.placement!=='same'||op.parentPolicy!=='keep')return fail('operation-unsupported','Only Alone + Assets / Same / Keep Parent is supported.');
 if(inspection.selection?.artifactPaths?.length!==1||!inspection.selection.assetPaths?.length||inspection.selection.assetPaths.length>16)return fail('selection-unsupported','Exactly one selected artifact and 1–16 own assets required.');
 if(inspection.inboundReferences.length||inspection.outboundParentDependencies.length)return fail('references-unsupported','Incoming readers or external Parents require a broader transaction.');
 const [srcScan,dstScan]=await Promise.all([
  inspectPortableWorkspaceReferenceInventory({workspaceRoot:src.workspaceRoot,workspaceId:src.workspaceId}),
  inspectPortableWorkspaceReferenceInventory({workspaceRoot:dst.workspaceRoot,workspaceId:dst.workspaceId})]);
 if(srcScan.status!=='ready'||dstScan.status!=='ready')return fail('inventory-drift','One Workspace inventory became unsafe.');
 for(const scan of [srcScan,dstScan]){
  if(scan.inventory.some(f=>!f.path.endsWith('.md')&&!/\.(?:png|jpe?g|gif|webp|pdf|bmp|avif|ico|bin|mp4|mov|wav|mp3)$/i.test(f.path)))
   return fail('dynamic-reference-surface','Unqualified programmable/text reference surface in a Workspace.');
 }
 const artifactPath=op.selectedPath;
 const sourceMarkdown=await readFile(loc(src.workspaceRoot,artifactPath),'utf8');
 if(canonicalC14nV2SelfState(sourceMarkdown).state!=='verified')return fail('source-self-invalid','Source artifact integrity must verify.');
 if(createRecordFromMarkdown(sourceMarkdown,{path:artifactPath}).trace)return fail('parent-exists','A Parent cannot be preserved by this standalone bundle.');
 const targetMatch=path.posix.basename(op.targetPath||'').match(/^(\d+(?:-\d+)*)-(.+\.trace\.md)$/);
 const ownerMatch=path.posix.basename(artifactPath).match(/^(\d+(?:-\d+)*)-(.+\.trace\.md)$/);
 if(!targetMatch||!ownerMatch)return fail('coordinate-invalid','Qualified numerical anchor and source dimensions required.');
 const tParts=targetMatch[1].split('-'),targetDir=path.posix.dirname(op.targetPath);
 const occupied=dstScan.materials.filter(m=>path.posix.dirname(m.path)===targetDir).map(m=>path.posix.basename(m.path).match(/^(\d+(?:-\d+)*)-/)?.[1]);
 const numerics=occupied.filter(Boolean).map(x=>x.split('-')).filter(x=>x.length===tParts.length&&x.slice(0,-1).join('-')===tParts.slice(0,-1).join('-')).map(x=>Number(x.at(-1)));
 const next=Math.max(Number(tParts.at(-1)),...numerics,0)+1;
 const targetDim=[...tParts.slice(0,-1),String(next).padStart(tParts.at(-1).length,'0')].join('-');
 if(occupied.includes(targetDim))return fail('coordinate-collision','Target dimension already occupied.');
 const ownerTo=path.posix.join(targetDir,`${targetDim}-${ownerMatch[2]}`);
 const assets=new Map();const moves=[];
 for(const [index,a] of inspection.selection.assetPaths.entries()){
  const m=path.posix.basename(a).match(/^(\d+(?:-\d+)*)-(.+)$/);
  if(!m||m[1]!==ownerMatch[1]||path.posix.dirname(a)!==path.posix.dirname(artifactPath)||a.endsWith('.trace.md'))return fail('asset-owner-mismatch','Each asset must share the exact source dimension and directory.');
  const to=path.posix.join(targetDir,`${targetDim}-${m[2]}`);
  const bytes=await readFile(loc(src.workspaceRoot,a));const sha=sha256Hex(bytes);
  assets.set(a,{to,index,sha,bytes});moves.push({kind:'binary-asset',fromPath:a,toPath:to,sourceSha256:sha,outputSha256:sha});
 }
 let unqualified='';
 const pattern=/(!?\[[^\]\r\n]*\]\()(<[^>\r\n]*>|(?:\\.|[^)\r\n])*)(\))/g;
 const adjusted=sourceMarkdown.replace(pattern,(full,left,raw,right)=>{
  if(unqualified)return full;
  let value=raw.replace(/^<|>$/g,'');
  if(/^(?:https?:\/\/|mailto:)/i.test(value))return full;
  if(!value||value.startsWith('/')||value.includes('\\')||/^[a-z][a-z\d+.-]*:/i.test(value)){unqualified=value;return full;}
  let decoded;try{decoded=decodeURIComponent(value.split(/[?#]/)[0]);}catch{unqualified=value;return full;}
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(artifactPath),decoded));
  const reference=assets.get(resolved);
  if(!reference){unqualified=value;return full;}
  return left+path.posix.basename(reference.to)+right;
 });
 if(unqualified)return fail('other-local-reference',`Source has a non-owned or dynamic local link: ${unqualified}`);
 // Local links in raw HTML, CSS or a dynamic expression are not in the
 // Markdown rewrite closure; only genuine simple Markdown links qualify.
 if(/(?:\bsrc\s*=|\bhref\s*=|\burl\s*\(|\bimport\s+|\brequire\s*\()/i.test(sourceMarkdown))return fail('dynamic-source-reference','Source contains an unsupported potential reference.');
 const sealed=sealC14nV2Self(adjusted);
 if(sealed.state!=='sealed'||canonicalC14nV2SelfState(sealed.markdown).state!=='verified')return fail('rebind-self-invalid','Source link rebind cannot be independently sealed.');
 const output=sealed.markdown.endsWith('\n')?sealed.markdown:sealed.markdown+'\n';
 if(canonicalC14nV2SelfState(output).state!=='verified')return fail('output-self-invalid','Sealed output not verified.');
 moves.unshift({kind:'artifact',fromPath:artifactPath,toPath:ownerTo,
  sourceSha256:sha256Hex(utf8Bytes(sourceMarkdown)),outputSha256:sha256Hex(utf8Bytes(output)),outputMarkdown:output});
 for(const m of moves){await safeComponents(src.workspaceRoot,m.fromPath);await safeComponents(dst.workspaceRoot,m.toPath);
  if(await exists(loc(dst.workspaceRoot,m.toPath)))return fail('destination-collision',`Target exists: ${m.toPath}`);}
 const result={schema:CROSS_WORKSPACE_BUNDLE_SCHEMA,status:'ready',executable:true,inspection,operation:op,
  sourceWorkspace:{workspaceId:src.workspaceId,workspaceRoot:path.resolve(src.workspaceRoot)},
  targetWorkspace:{workspaceId:dst.workspaceId,workspaceRoot:path.resolve(dst.workspaceRoot)},moves,
  boundary:{supported:'one-parentless-artifact-and-dimension-owned-assets',atomicTwoRoots:true,otherParents:false,referenceClosure:'only-both-supplied-supported-local-workspaces',thirdWorkspaceReaders:'not-inspected',gitPublication:'not-qualified'}};
 return {...result,planFingerprint:fingerprint(result)};
}

async function cleanup(tx,roots){for(const r of roots)await rm(txDir(r,tx),{recursive:true,force:true});}
/** Atomic bundle apply. Exactly one lock pair and mirrored journal. Promoted
 * files remain hardlinked to their staged inode until commit/cleanup, allowing
 * recovery to distinguish our outputs from identical external content. */
export async function applyPortableCrossWorkspaceAssetBundle(plan={},options={}){
 const fail=(code,message,extra={})=>({schema:'tiinex.portable.cross-workspace-bundle-apply.v1',status:'blocked',applied:false,findings:[err(code,message)],...extra});
 if(![CROSS_WORKSPACE_BUNDLE_SCHEMA,CROSS_WORKSPACE_GRAPH_BUNDLE_SCHEMA].includes(plan.schema)||plan.status!=='ready'||!plan.executable)return fail('plan-invalid','Exact qualified plan required.');
 const src=plan.sourceWorkspace,dst=plan.targetWorkspace,roots=[src.workspaceRoot,dst.workspaceRoot];
 const reread=await (plan.schema===CROSS_WORKSPACE_GRAPH_BUNDLE_SCHEMA?inspectPortableCrossWorkspaceClosedGraph:inspectPortableCrossWorkspaceAssetBundle)({sourceWorkspace:src,targetWorkspace:dst,operation:plan.operation});
 if(reread.status!=='ready'||reread.planFingerprint!==plan.planFingerprint||JSON.stringify(reread.moves)!==JSON.stringify(plan.moves))return fail('inspection-drift','Both Workspace representations must independently reproduce the exact plan.');
 const snapshot=await recheckPortableCrossWorkspaceContinuity({inspection:plan.inspection,sourceWorkspace:src,targetWorkspace:dst});
 if(snapshot.status!=='ready')return fail('snapshot-drift','Source or target changed after Preview.');
 const tx=`${plan.planFingerprint.slice(0,12)}-${randomUUID()}`;
 const locks=await acquireLineageMaintenanceWorkspaceLocks({workspaceIds:[src.workspaceId,dst.workspaceId],roots:new Map([[src.workspaceId,src.workspaceRoot],[dst.workspaceId,dst.workspaceRoot]]),transactionId:tx,planFingerprint:plan.planFingerprint});
 if(locks.status!=='ready')return fail('locks-unavailable','Both Workspace locks required.',{lockFindings:locks.findings});
 const state={schema:'tiinex.portable.cross-workspace-bundle-journal.v1',transactionId:tx,phase:'initializing',
  planFingerprint:plan.planFingerprint,sourceWorkspace:src,targetWorkspace:dst,moves:plan.moves};
 let initialized=false,keepLocks=false;
 const setPhase=async phase=>{state.phase=phase;for(const r of roots)await journalWrite(journal(r,tx),state);try{await options.onPhase?.({phase,transactionId:tx});}catch(e){if(phase!=='committed')throw e;}};
 try{
  for(const r of roots)await mkdir(txDir(r,tx),{recursive:true});
  await setPhase('initializing');initialized=true;
  const now=await recheckPortableCrossWorkspaceContinuity({inspection:plan.inspection,sourceWorkspace:src,targetWorkspace:dst});
  if(now.status!=='ready')throw Error('snapshot-drift-under-lock');
  for(const [i,m] of plan.moves.entries()){
   await safeComponents(src.workspaceRoot,m.fromPath);await safeComponents(dst.workspaceRoot,m.toPath);
   const bytes=await readFile(loc(src.workspaceRoot,m.fromPath));
   if(sha256Hex(bytes)!==m.sourceSha256)throw Error('source-digest-drift:'+m.fromPath);
   if(await exists(loc(dst.workspaceRoot,m.toPath)))throw Error('destination-occupied:'+m.toPath);
   const targetBytes=m.kind==='artifact'?utf8Bytes(m.outputMarkdown):bytes;
   if(sha256Hex(targetBytes)!==m.outputSha256)throw Error('output-digest-drift:'+m.toPath);
   await writeFileDurable(staging(dst.workspaceRoot,tx,i),targetBytes);
  }
  await setPhase('prepared');
  const locked=await recheckPortableCrossWorkspaceContinuity({inspection:plan.inspection,sourceWorkspace:src,targetWorkspace:dst});
  if(locked.status!=='ready')throw Error('snapshot-drift-before-stage');
  for(const [i,m] of plan.moves.entries())await rename(loc(src.workspaceRoot,m.fromPath),backup(src.workspaceRoot,tx,i));
  await setPhase('sources-staged');
  const targetSnapshot=plan.inspection.workspaceSnapshots.find(s=>s.workspaceId===dst.workspaceId);
  const targetScan=await inspectPortableWorkspaceReferenceInventory({workspaceRoot:dst.workspaceRoot,workspaceId:dst.workspaceId});
  if(targetScan.status!=='ready'||targetScan.snapshotSha256!==targetSnapshot?.snapshotSha256)throw Error('target-changed-after-staging');
  for(const [i,m] of plan.moves.entries()){
   const dest=loc(dst.workspaceRoot,m.toPath);await mkdir(path.dirname(dest),{recursive:true});
   await safeComponents(dst.workspaceRoot,m.toPath);
   await link(staging(dst.workspaceRoot,tx,i),dest); // EEXIST never overwrites
   await syncDirectory(path.dirname(dest));
  }
  await setPhase('outputs-promoted');
  for(const [i,m] of plan.moves.entries()){
   const dest=loc(dst.workspaceRoot,m.toPath);
   if(sha256Hex(await readFile(dest))!==m.outputSha256||await exists(loc(src.workspaceRoot,m.fromPath)))throw Error('output-integrity-failed');
   if(m.kind==='artifact'&&canonicalC14nV2SelfState(await readFile(dest,'utf8')).state!=='verified')throw Error('output-c14n-unqualified');
  }
  await setPhase('committed');
  // Once both durable journals say COMMITTED, no further file mutation is
  // needed. Release locks before deleting receipts so a crash in cleanup
  // cannot strand an active-looking transaction lock.
  await releaseLineageMaintenanceWorkspaceLocks(locks.acquired,tx);
  let cleanupPending=false;
  try{await cleanup(tx,roots);}catch{cleanupPending=true;}
  return {schema:'tiinex.portable.cross-workspace-bundle-apply.v1',status:'ready',applied:true,transactionId:tx,moves:plan.moves.map(({outputMarkdown,...m})=>m),verification:{artifactC14n:true,binarySha256:true,sourceRemoved:true,atomicTwoRootJournal:true,cleanupPending}};
 }catch(e){
  const recovery=initialized?await recoverPortableCrossWorkspaceAssetBundle({transactionId:tx,sourceWorkspace:src,targetWorkspace:dst,allowCurrentProcess:true})
   :{status:'ready',recovered:true};
  if(!initialized)await cleanup(tx,roots);
  keepLocks=recovery.status!=='ready';
  return fail('transaction-aborted',String(e.message||e),{rollback:recovery,transactionId:tx,recoveryRequired:keepLocks});
 }finally{if(!keepLocks)await releaseLineageMaintenanceWorkspaceLocks(locks.acquired,tx);}
}
/** Exact manual crash recovery. Never removes a destination unless it is the
 * verified hardlink of our durable target stage inode. */
export async function recoverPortableCrossWorkspaceAssetBundle({transactionId='',sourceWorkspace={},targetWorkspace={},allowCurrentProcess=false}={}){
 const fail=(code,message)=>({schema:'tiinex.portable.cross-workspace-bundle-recovery.v1',status:'blocked',recovered:false,findings:[err(code,message)]});
 if(!/^[a-f0-9]{12}-[a-f0-9-]{36}$/.test(transactionId))return fail('transaction-id-invalid','Exact transaction ID required.');
 const src=sourceWorkspace,dst=targetWorkspace;
 if(!src.workspaceRoot||!dst.workspaceRoot||src.workspaceId===dst.workspaceId)return fail('participants-invalid','Both exact Workspace identities required.');
 let a,b;try{[a,b]=await Promise.all([readFile(journal(src.workspaceRoot,transactionId),'utf8').then(JSON.parse),readFile(journal(dst.workspaceRoot,transactionId),'utf8').then(JSON.parse)]);}catch(e){return fail('journals-incomplete',String(e.message||e));}
 const clean=j=>JSON.stringify({...j,phase:''});
 if(a.schema!=='tiinex.portable.cross-workspace-bundle-journal.v1'||clean(a)!==clean(b)||a.transactionId!==transactionId||a.sourceWorkspace.workspaceRoot!==src.workspaceRoot||a.targetWorkspace.workspaceRoot!==dst.workspaceRoot)return fail('journals-disagree','Both journals must agree on immutable transaction content.');
 const committed=a.phase==='committed'&&b.phase==='committed';
 const locks=[src,dst].map(w=>({workspaceId:w.workspaceId,root:w.workspaceRoot,lockPath:path.join(w.workspaceRoot,'.tiinex','lineage-maintenance.lock')}));
 for(const l of locks){let observed;try{observed=JSON.parse(await readFile(l.lockPath,'utf8'));}catch{if(!committed)return fail('lock-missing','Both locks required for uncommitted recovery.');else continue;}
  if(observed.transactionId!==transactionId)return fail('lock-owner-drift','Wrong transaction lock owner.');
  if(!allowCurrentProcess){if(observed.hostname!==os.hostname())return fail('foreign-host','Cannot prove host owner gone.');
   try{process.kill(observed.pid,0);return fail('owner-active','Cannot recover active transaction.');}catch(e){if(e.code!=='ESRCH')return fail('owner-unverified',String(e.message||e));}}
 }
 const files=[];
 for(const [i,m] of a.moves.entries()){
  const source=loc(src.workspaceRoot,m.fromPath),dest=loc(dst.workspaceRoot,m.toPath),orig=backup(src.workspaceRoot,transactionId,i),stage=staging(dst.workspaceRoot,transactionId,i);
  try{await safeComponents(src.workspaceRoot,m.fromPath);await safeComponents(dst.workspaceRoot,m.toPath);}catch(e){return fail('unsafe-path',String(e.message||e));}
  const hasSource=await exists(source),hasDest=await exists(dest),hasBackup=await exists(orig),hasStage=await exists(stage);
  if(hasSource&&sha256Hex(await readFile(source))!==m.sourceSha256)return fail('source-byte-drift','Unexpected source bytes.');
  if(hasBackup&&sha256Hex(await readFile(orig))!==m.sourceSha256)return fail('backup-byte-drift','Unexpected original backup bytes.');
  if(hasStage&&sha256Hex(await readFile(stage))!==m.outputSha256)return fail('stage-byte-drift','Unexpected staged bytes.');
  if(hasDest){if(!hasStage)return fail('unowned-target','Target has no journal-owned durable staging inode.');
   const ds=await stat(dest),ss=await stat(stage);
   if(ds.dev!==ss.dev||ds.ino!==ss.ino||sha256Hex(await readFile(dest))!==m.outputSha256)return fail('unowned-target','Target inode or bytes are not owned by journal.');}
  if(hasSource&&hasBackup)return fail('duplicate-original','Source and backup both exist.');
  if(!hasSource&&!hasBackup)return fail('missing-original','Neither source nor backup available.');
  files.push({source,dest,orig,hasDest,hasBackup});
 }
 if(committed){if(files.some(x=>!x.hasDest||!x.hasBackup))return fail('committed-state-invalid','Incomplete commit cannot be finalized.');
  await cleanup(transactionId,[src.workspaceRoot,dst.workspaceRoot]);if(!allowCurrentProcess)await releaseLineageMaintenanceWorkspaceLocks(locks,transactionId);
  return {schema:'tiinex.portable.cross-workspace-bundle-recovery.v1',status:'ready',recovered:true,disposition:'finalized-commit'};}
 for(const x of [...files].reverse()){if(x.hasDest)await rm(x.dest);if(x.hasBackup){await mkdir(path.dirname(x.source),{recursive:true});await rename(x.orig,x.source);}}
 await cleanup(transactionId,[src.workspaceRoot,dst.workspaceRoot]);if(!allowCurrentProcess)await releaseLineageMaintenanceWorkspaceLocks(locks,transactionId);
 return {schema:'tiinex.portable.cross-workspace-bundle-recovery.v1',status:'ready',recovered:true,disposition:'rolled-back'};
}
