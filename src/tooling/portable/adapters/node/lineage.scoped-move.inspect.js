import path from 'node:path';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { sha256Hex, stableFingerprintBytes } from '../../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { projectPortableLineageMaintenance } from '../../lineage/lineage.maintenance.projection.js';
import { projectPortableMoveSelection } from '../../lineage/lineage.move-selection.js';
import { projectAssetReferenceRebind } from '../../lineage/asset.reference-rebind.js';
import { hasResolvableNonMarkdownReference } from './asset.relocation.inspect.js';
import { qualifyCrossWorkspacePublication } from '../../lineage/lineage.crossWorkspacePublication.js';

const IGNORED = new Set(['.git','.tiinex','node_modules']);
const TEXT = new Set(['.md','.txt','.json','.jsonc','.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.htm','.css','.scss','.yaml','.yml','.xml','.svg','.toml','.sh','.ps1']);
const BIN_LIMIT=128*1024*1024;
const blocked = (code,message,details=[]) => ({
  schema:'tiinex.portable.scoped-move-workspace-inspection.v1',status:'blocked',
  executable:false,findings:[{severity:'error',code,message,details}]
});
const safe = rel=> typeof rel==='string' && !!rel && !rel.includes('\\') && !rel.startsWith('/') && 
  !rel.split('/').some(part=>!part || part==='.' || part==='..');
const fingerprint = manifest => sha256Hex(Buffer.from(JSON.stringify(manifest),'utf8'));
function hasUnquotedWebReference(text,sourcePath,assetPath) {
  const patterns = [
    /\b(?:src|href)\s*=\s*([^\s"'<>]+)/gi,
    /\burl\s*\(\s*([^\s)"'<>]+)/gi
  ];
  for (const pattern of patterns) for (const match of text.matchAll(pattern)) {
    const literal=match[1].replace(/[?#].*$/,'').replace(/\)$/, '');
    if(!literal || literal.includes('\\') || /^[a-z][a-z0-9+.-]*:/i.test(literal))continue;
    let decoded=literal;
    try{decoded=decodeURIComponent(literal);}catch{continue;}
    const candidate=path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath),decoded));
    if(candidate===assetPath || decoded===assetPath)return true;
  }
  return false;
}

/** Read-only, strongly fingerprinted physical inventory shared by single and
 * multi-Workspace inspection. Neither ignored trees nor unknown dynamic source
 * formats receive implicit reference-closure authority. */
export async function inspectPortableWorkspaceReferenceInventory(input={}) {
  const workspaceRoot=typeof input.workspaceRoot==='string'&&path.isAbsolute(input.workspaceRoot)
    ?path.resolve(input.workspaceRoot):'';
  const workspaceId=String(input.workspaceId||'').trim();
  const selectedPath=String(input.selectedPath||'');
  if(!workspaceRoot||!workspaceId)return blocked('scoped-move.inspect.request-invalid','A real absolute Workspace root and identity are required.');
  const findings=[], inventory=[], materials=[], assetPaths=[];
  async function walk(rel='') {
    const target=rel?path.join(workspaceRoot,rel):workspaceRoot;
    for(const entry of (await readdir(target,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(IGNORED.has(entry.name)) continue;
      const child=rel?`${rel}/${entry.name}`:entry.name;
      if(!safe(child)){findings.push(`unsafe-path:${child}`);continue;}
      const full=path.join(workspaceRoot,child);
      const info=await lstat(full);
      if(info.isSymbolicLink()){findings.push(`symlink:${child}`);continue;}
      if(info.isDirectory()){await walk(child);continue;}
      if(!info.isFile()){findings.push(`special:${child}`);continue;}
      if(info.size>BIN_LIMIT){findings.push(`size-limit:${child}`);continue;}
      const buffer=await readFile(full);
      const ext=path.posix.extname(child).toLowerCase();
      let content=null;
      if(TEXT.has(ext)){
        try{content=new TextDecoder('utf-8',{fatal:true}).decode(buffer);}
        catch{findings.push(`invalid-utf8:${child}`);}
      }
      inventory.push({path:child,size:buffer.length,sha256:sha256Hex(buffer)});
      if(child.endsWith('.trace.md')) {
        if(content===null || canonicalC14nV2SelfState(content).state!=='verified') findings.push(`unqualified-artifact:${child}`);
        else materials.push({path:child,workspaceId,markdown:content});
      } else if(path.posix.dirname(child)===path.posix.dirname(selectedPath) && !TEXT.has(ext)) {
        assetPaths.push(child);
      }
    }
  }
  try {
    const stat=await lstat(workspaceRoot);
    if(!stat.isDirectory() || stat.isSymbolicLink()) return blocked('scoped-move.inspect.root-unsafe','Workspace root must be a physical directory.');
    await walk();
  } catch(e) {return blocked('scoped-move.inspect.read-failed',String(e?.message||e));}
  if(findings.length) return blocked('scoped-move.inspect.unsafe-inventory','Workspace inventory has unqualified material.',findings);
  inventory.sort((a,b)=>a.path.localeCompare(b.path));
  return {schema:'tiinex.portable.workspace-reference-inventory.v1',status:'ready',workspaceId,workspaceRoot,inventory,materials,assetPaths,
    snapshotSha256:fingerprint(inventory),excludedTrees:[...IGNORED].sort()};

}

/** Node-only, conservative supported-format reference closure for scoped moves.
 * Core builds both inventory AND exact transaction; the host cannot forge a
 * `referenceCoverage:complete` assertion by merely enumerating one directory.
 * Any supported non-Tiinex text link which cannot be rewritten in the same
 * transaction BLOCKS rather than silently producing a dangling reference.
 */
export async function inspectPortableScopedMoveWorkspace(input={}) {
  const workspaceRoot = typeof input.workspaceRoot==='string' && path.isAbsolute(input.workspaceRoot)
    ? path.resolve(input.workspaceRoot) : '';
  const workspaceId=String(input.workspaceId||'').trim();
  const operation=input.operation || {};
  if (!workspaceRoot || !workspaceId || operation.kind!=='scoped-move' || operation.workspaceId!==workspaceId || !safe(operation.selectedPath))
    return blocked('scoped-move.inspect.request-invalid','Absolute Workspace root and exact Core scoped-move operation are required.');
  const scan=await inspectPortableWorkspaceReferenceInventory({workspaceRoot,workspaceId,selectedPath:operation.selectedPath});
  if(scan.status!=='ready')return scan;
  const {inventory,materials,assetPaths}=scan;
  const findings=[];
  // Cross-Workspace publication can be sought through LLM host connectors
  // even when this sandbox has no Git remote access. This is an evidence
  // recovery route, NEVER an executable cross-Workspace move.
  if(operation.targetWorkspaceId && operation.targetWorkspaceId!==workspaceId) {
    const source=materials.find(m=>m.path===operation.selectedPath);
    const hints=input.publication || {};
    const publication=qualifyCrossWorkspacePublication({
      sourceWorkspaceId:workspaceId,targetWorkspaceId:operation.targetWorkspaceId,
      repository:hints.repository,commit:hints.commit,sourcePath:hints.sourcePath||operation.selectedPath,
      markdown:source?.markdown||'',availableTools:input.availableTools||[],
      hostPlan:input.hostPlan,hostReceipt:input.hostReceipt
    });
    return {...blocked('scoped-move.inspect.cross-workspace-apply-unqualified',
      'A read-only Git publication recovery path is available, but cross-Workspace transaction/reference rewriting is NOT yet qualified.'),publicationRecovery:publication};
  }

  inventory.sort((a,b)=>a.path.localeCompare(b.path));
  const selection=projectPortableMoveSelection({
    workspaceId,selectedPath:operation.selectedPath,scope:operation.scope,materials,
    assetPaths,representationCoverage:'complete'
  });
  if(selection.status!=='ready')return blocked('scoped-move.inspect.selection-blocked','Core scope could not be qualified.',selection.findings);
  const assetMaterials=[];
  for(const asset of selection.assetPaths){
    const bytes=await readFile(path.join(workspaceRoot,asset));
    assetMaterials.push({workspaceId,path:asset,fingerprint:stableFingerprintBytes(bytes),sha256:sha256Hex(bytes)});
  }
  const provisional=projectPortableLineageMaintenance({
    representationCoverage:'complete',assetCoverage:'complete',referenceCoverage:'complete',
    materials,assetPaths,assetMaterials,operation
  });
  if(provisional.status!=='ready')return blocked('scoped-move.inspect.projected-plan-blocked','Core plan did not qualify.',provisional.findings);
  const relocations=new Map(provisional.changes.filter(c=>c.pathChanged).map(c=>[c.fromPath,c.toPath]));
  // All qualified trace materials are included in the Core plan and undergo
  // the same integrity-preserving rewrite. All OTHER formats need explicit
  // rewrite ownership; fail closed if they actually link to a relocated file.
  const unchanged = inventory.filter(f=>TEXT.has(path.posix.extname(f.path).toLowerCase()) && !f.path.endsWith('.trace.md'));
  for(const file of unchanged) {
    const content=(await readFile(path.join(workspaceRoot,file.path))).toString('utf8');
    if(file.path.endsWith('.md')) {
      const check=projectAssetReferenceRebind({markdown:content,sourcePath:file.path,assetPaths:relocations});
      if(check.findings?.length || check.refs?.length)
        findings.push(`unsupported-markdown-reference:${file.path}`);
    } else {
      for(const source of relocations.keys()) {
        if(hasResolvableNonMarkdownReference(content,file.path,source) || hasUnquotedWebReference(content,file.path,source)){
          findings.push(`unsupported-text-reference:${file.path}->${source}`);break;
        }
      }
    }
  }
  if(findings.length)return blocked('scoped-move.inspect.unrewritable-reference','Some incoming references are outside the qualified Core artifact rewrite.',findings);
  const receipt={schema:'tiinex.portable.scoped-move-inspection-receipt.v1',
    workspaceId,root:workspaceRoot,mode:'supported-local-file-inventory-v1',
    excludedTrees:[...IGNORED].sort(),snapshot:inventory,snapshotSha256:fingerprint(inventory)};
  const planFingerprint=stableFingerprintBytes(Buffer.from(JSON.stringify({
    representationCoverage:provisional.representationCoverage,
    operation:provisional.operation,
    inputFingerprint:provisional.inputFingerprint,
    inspectionSnapshotSha256:receipt.snapshotSha256,
    outputs:provisional.changes.map(({workspaceId,fromPath,toPath,afterFingerprint})=>({workspaceId,fromPath,toPath,afterFingerprint}))
  }),'utf8'));
  return {schema:'tiinex.portable.scoped-move-workspace-inspection.v1',
    status:'ready',executable:true,selection,receipt,
    plan:{...provisional,inspectionReceipt:receipt,planFingerprint},
    boundary:'Supported local UTF-8 textual references only. Cross-Workspace, dynamic references, hidden/excluded trees and proprietary binary metadata do NOT gain authority; recheck receipt at Apply.'};
}

/** Recheck COMPLETE input-domain snapshot, including newly added text files,
 * before applying a plan. A materialized `complete` flag alone is insufficient.
 * The inspection root must be the same physical Workspace being mutated.
 */
export async function qualifyScopedMoveInspectionReceipt(plan,roots) {
  const receipt=plan?.inspectionReceipt;
  if(!receipt)return {status:'not-requested'};
  const root=roots[receipt.workspaceId];
  if(!root || path.resolve(root)!==path.resolve(receipt.root))
    return {status:'blocked',code:'scoped-move.inspect.root-drift'};
  const inventory=[];
  async function visit(rel=''){
    for(const entry of (await readdir(rel?path.join(root,rel):root,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
      if(IGNORED.has(entry.name))continue;
      const child=rel?`${rel}/${entry.name}`:entry.name;
      if(!safe(child))throw Error(`unsafe path ${child}`);
      const full=path.join(root,child),stat=await lstat(full);
      if(stat.isSymbolicLink()||(!stat.isDirectory()&&!stat.isFile()))throw Error(`unsafe type ${child}`);
      if(stat.isDirectory())await visit(child);
      else {
        if(stat.size>BIN_LIMIT)throw Error(`oversize ${child}`);
        const bytes=await readFile(full);
        inventory.push({path:child,size:bytes.length,sha256:sha256Hex(bytes)});
      }
    }
  }
  try {
    await visit();
    inventory.sort((a,b)=>a.path.localeCompare(b.path));
    if(!Array.isArray(receipt.snapshot) || fingerprint(inventory)!==receipt.snapshotSha256 ||
       fingerprint(receipt.snapshot)!==receipt.snapshotSha256)
      return {status:'blocked',code:'scoped-move.inspect.snapshot-drift'};
    return {status:'ready'};
  } catch(e){return {status:'blocked',code:'scoped-move.inspect.recheck-failed',detail:String(e?.message||e)};}
}
