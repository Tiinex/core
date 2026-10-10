import test from 'node:test';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { applyPortableLineageMaintenancePlan } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';
import assert from 'node:assert/strict';
import path from 'node:path';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
import { projectPortableMoveSelection } from '../src/tooling/portable/lineage/lineage.move-selection.js';
import { projectPortableLineageMaintenance } from '../src/tooling/portable/lineage/lineage.maintenance.projection.js';
const method='sha256-base64url-c14n-v2',dir='.topics/a';
function artifact(name,parent=null){
 const p=`${dir}/${name}`;
 const relative=parent?path.posix.relative(dir,parent.path):'';
 const pb=parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${path.posix.basename(parent.path)}](${relative})\n  - Origin:\n    - [relative](${relative})\n`:'';
 const pi=parent?`- ${method}\n  - Towards: [${path.posix.basename(parent.path)}](${relative})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:'';
 const md=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${pb}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n---\n\n# Continuity Integrity\n\n${pi}- ${method}\n  - Towards: self\n  - Value: `;
 return {workspaceId:'w',path:p,markdown:sealC14nV2Self(md).markdown+'\n'};
}
const root=artifact('001-root.trace.md');
const fork=artifact('001-1-fork.trace.md',root);
const branch=artifact('001-1-1-branch.trace.md',fork);
const leaf=artifact('001-1-1-1-leaf.trace.md',branch);
const other=artifact('001-1-2-other.trace.md',fork);
const edge=artifact('001-2-edge.trace.md',root);
const material=[root,fork,branch,leaf,other,edge];
const assetPaths=[`${dir}/001-1-1-picture-01.png`,`${dir}/001-1-1-1-picture-01.png`,`${dir}/001-1-2-other.png`,`${dir}/001-2-extra.png`];
const request=(scope,selectedPath=branch.path,materials=material,assets=assetPaths)=>({scope,selectedPath,materials,assetPaths:assets,workspaceId:'w',representationCoverage:'complete'});
test('five directory-only scopes use real Parent graph, never numeric lookalike children',()=>{
 let a=projectPortableMoveSelection(request('alone'));assert.equal(a.status,'ready');assert.deepEqual(a.artifactPaths,[branch.path]);assert.deepEqual(a.assetPaths,[]);
 a=projectPortableMoveSelection(request('alone-with-assets'));assert.deepEqual(a.artifactPaths,[branch.path]);assert.deepEqual(a.assetPaths,[assetPaths[0]]);
 a=projectPortableMoveSelection(request('self-and-leaves'));assert.deepEqual(a.artifactPaths,[branch.path,leaf.path].sort());assert.deepEqual(a.assetPaths,[assetPaths[0],assetPaths[1]].sort());assert.equal(a.placements.prepend,true);
 a=projectPortableMoveSelection(request('branch'));assert.deepEqual(a.artifactPaths,[branch.path,leaf.path].sort());assert.equal(a.shape.straight,true); // fork node excluded
 a=projectPortableMoveSelection(request('tree'));assert.deepEqual(a.artifactPaths,[root.path,fork.path,branch.path,leaf.path,other.path,edge.path].sort());assert.equal(a.placements.prepend,false);assert.equal(a.shape.branches,2);
});
test('ordinary non-Tiinex asset may select only Alone, without extra prompt',()=>{
 const alone=projectPortableMoveSelection(request('alone',assetPaths[0]));assert.equal(alone.status,'ready');assert.deepEqual(alone.assetPaths,[assetPaths[0]]);assert.deepEqual(alone.artifactPaths,[]);
 assert.equal(projectPortableMoveSelection(request('tree',assetPaths[0])).status,'blocked');
});
test('missing selection, unknown coverage and parent cycles fail closed',()=>{
 const unknown=projectPortableMoveSelection({...request('branch'),representationCoverage:'bounded'});assert.equal(unknown.status,'blocked');
 assert.equal(projectPortableMoveSelection(request('alone','.topics/a/999-not-here.trace.md')).status,'blocked');
 const t=artifact('001-3-temp.trace.md');const unsafe={...t,markdown:t.markdown.replace('  - Summary:', '  - Summary:')};
 assert.equal(projectPortableMoveSelection(request('tree',t.path,[...material,unsafe])).status,'ready');
});
test('scoped move preserving Parent rebases the exact reference and digest',()=>{
 const plan=projectPortableLineageMaintenance({representationCoverage:'complete',materials:material,assetPaths:[],operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'alone',targetDirectory:'.topics/b'}});
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const bySource=new Map(plan.changes.map(c=>[c.fromPath,c]));
 const child=bySource.get(branch.path);const parent=bySource.get(fork.path);const grandson=bySource.get(leaf.path);
 assert.equal(child.semanticParent.changed,false); assert.equal(grandson.semanticParent.changed,false);
 const childRecord=createRecordFromMarkdown(child.markdown,{path:child.toPath});
 assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(child.toPath),childRecord.trace)),parent.toPath);
 const grandsonRecord=createRecordFromMarkdown(grandson.markdown,{path:grandson.toPath});
 assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(grandson.toPath),grandsonRecord.trace)),child.toPath);
 for(const c of plan.changes)assert.equal(canonicalC14nV2SelfState(c.markdown).state,'verified',c.toPath);
});
test('scoped move blocks incomplete asset transactions instead of silently omitting a selected PNG',()=>{
 const plan=projectPortableLineageMaintenance({representationCoverage:'complete',materials:material,assetCoverage:'complete',assetPaths,operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'alone-with-assets',targetDirectory:'.topics/b'}});
 assert.equal(plan.status,'blocked');assert.ok(plan.findings.some(f=>f.code==='lineage-maintenance.asset-reference-coverage-required'));
});
test('scoped move refuses to break out of complete Parent material and integrity',()=>{
 const plan=projectPortableLineageMaintenance({representationCoverage:'complete',materials:[branch,leaf],assetPaths:[],operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'alone',targetDirectory:'.topics/b'}});
 assert.equal(plan.status,'blocked');assert.ok(plan.findings.some(f=>f.code==='lineage-maintenance.preserved-parent-material-unavailable'));
});

test('new placement requires a qualified anchor and Same cannot silently become New Parent',()=>{
 for(const operation of [{placement:'prepend',parentPolicy:'keep'},{placement:'append',parentPolicy:'keep'},{placement:'same',parentPolicy:'new'}]) {
  const result=projectPortableLineageMaintenance({representationCoverage:'complete',materials:material,operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'alone',targetDirectory:'.topics/b',...operation}});
  assert.equal(result.status,'blocked');
  assert.ok(result.findings.some(f=>operation.parentPolicy==='new'
    ? f.code==='lineage-maintenance.scoped-placement-unqualified'
    : f.code==='lineage-maintenance.keep-parent-target-invalid'));
 }
});
test('Unanchored insertion cannot silently renumber target or unrelated siblings',()=>{
 for (const placement of ['append','prepend']) {
  const req={representationCoverage:'complete',materials:material,assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'self-and-leaves',targetPath:other.path,targetDirectory:dir,placement,parentPolicy:'new'}};
  const plan=projectPortableLineageMaintenance(req);
  assert.equal(plan.status,'blocked');
  assert.ok(plan.findings.some(f=>f.code.includes('target-dimension-drift') || f.code.includes('anchor-dimension-drift')));
 }
 const branched=projectPortableLineageMaintenance({representationCoverage:'complete',materials:material,assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId:'w',selectedPath:fork.path,scope:'self-and-leaves',targetPath:edge.path,targetDirectory:dir,placement:'prepend',parentPolicy:'new'}});
 assert.equal(branched.status,'blocked');assert.ok(branched.findings.some(f=>f.code==='lineage-maintenance.prepend-selection-branched'));
});

test('Scoped Append and Prepend + New Parent apply exactly anchored dimensions, assets, and Parent integrity',async t=>{
 const selected=artifact('009-insert.trace.md');
 const leaf=artifact('009-1-leaf.trace.md',selected);
 const target=artifact('001-target.trace.md');
 const targetChild=artifact('001-1-child.trace.md',target);
 const materials=[target,targetChild,selected,leaf];
 for (const placement of ['append','prepend']) {
  const work=await mkdtemp(path.join(os.tmpdir(),`tiinex-${placement}-anchored-`));t.after(()=>rm(work,{recursive:true,force:true}));
  for(const item of materials){const filename=path.join(work,item.path);await mkdir(path.dirname(filename),{recursive:true});await writeFile(filename,item.markdown);}
  const asset=`${dir}/009-image-01.png`;const bytes=Buffer.from([0,255,1,13]);await writeFile(path.join(work,asset),bytes);
  const {sha256Hex,stableFingerprintBytes}=await import('../src/export/package.bytes.js');
  const request={representationCoverage:'complete',materials,assetPaths:[asset],assetCoverage:'complete',referenceCoverage:'complete',assetMaterials:[{workspaceId:'w',path:asset,fingerprint:stableFingerprintBytes(bytes),sha256:sha256Hex(bytes)}],operation:{kind:'scoped-move',workspaceId:'w',selectedPath:selected.path,scope:'self-and-leaves',targetPath:target.path,targetDirectory:dir,placement,parentPolicy:'new'}};
  const plan=projectPortableLineageMaintenance(request);
  assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  const bySource=new Map(plan.changes.map(c=>[c.fromPath,c]));
  const inserted=bySource.get(selected.path);
  assert.ok(placement==='prepend' ? inserted.toPath.startsWith(`${dir}/001-`) : inserted.toPath.startsWith(`${dir}/001-2-`));
  assert.equal(bySource.get(target.path).toPath,placement==='append'?target.path:`${dir}/001-1-1-target.trace.md`);
  const movedAsset=bySource.get(asset);
  assert.equal(movedAsset.kind,'binary-asset');
  await writeFile(path.join(work,asset),Buffer.from([10,11,12]));
  const drift=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{w:work}});assert.equal(drift.status,'blocked');
  await writeFile(path.join(work,asset),bytes);
  const applied=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{w:work}});
  assert.equal(applied.status,'ready',JSON.stringify(applied.findings));
  assert.deepEqual(await readFile(path.join(work,movedAsset.toPath)),bytes);
  for(const change of plan.changes.filter(c=>c.kind!=='binary-asset')){
   const md=await readFile(path.join(work,change.toPath),'utf8');assert.equal(md,change.markdown);
   assert.equal(canonicalC14nV2SelfState(md).state,'verified');
   const rec=createRecordFromMarkdown(md,{path:change.toPath});
   if(!rec.trace)continue;
   const destination=path.posix.normalize(path.posix.join(path.posix.dirname(change.toPath),rec.trace));
   const matching=plan.changes.find(c=>c.toPath===destination);
   assert.ok(matching,`Missing parent for ${change.toPath}`);
   assert.ok(rec.integrity.entries.some(e=>e.towards&&e.towards!=='self'),`Missing Parent integrity for ${change.toPath}`);
  }
 }
});

test('Scoped Prepend never invents a root Parent',()=>{
 const standalone=artifact('001-target.trace.md');const insertion=artifact('009-insert.trace.md');
 const result=projectPortableLineageMaintenance({representationCoverage:'complete',materials:[standalone,insertion],assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId:'w',selectedPath:insertion.path,scope:'alone',targetPath:standalone.path,targetDirectory:dir,placement:'prepend',parentPolicy:'new'}});
 assert.equal(result.status,'ready',JSON.stringify(result.findings));
 const rootOut=result.changes.find(c=>c.fromPath===insertion.path);
 assert.equal(createRecordFromMarkdown(rootOut.markdown,{path:rootOut.toPath}).trace||'','');
 assert.equal(rootOut.toPath,`${dir}/001-insert.trace.md`);
});

test('Core applies approved Same + Keep-Parent with references intact; drift blocks before mutation',async t=>{
 const rootdir=await mkdtemp(path.join(os.tmpdir(),'tiinex-scoped-move-'));
 t.after(()=>rm(rootdir,{recursive:true,force:true}));
 for(const m of material){const filename=path.join(rootdir,m.path);await mkdir(path.dirname(filename),{recursive:true});await writeFile(filename,m.markdown);}
 const req=()=>({representationCoverage:'complete',materials:material,assetPaths:[],operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'alone',targetDirectory:'.topics/b',parentPolicy:'keep',placement:'same'}});
 const plan=projectPortableLineageMaintenance(req());assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const touched=plan.changes.find(c=>c.fromPath===branch.path);
 await writeFile(path.join(rootdir,branch.path),branch.markdown+'external drift');
 let result=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{w:rootdir}});
 assert.equal(result.status,'blocked');assert.equal((await readFile(path.join(rootdir,branch.path),'utf8')).endsWith('external drift'),true);
 await writeFile(path.join(rootdir,branch.path),branch.markdown);
 result=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{w:rootdir}});
 assert.equal(result.status,'ready',JSON.stringify(result.findings));
 const bySource=new Map(plan.changes.map(x=>[x.fromPath,x]));
 for (const [oldPath,change] of bySource){
  const updated=await readFile(path.join(rootdir,change.toPath),'utf8');
  assert.equal(updated,change.markdown);
  const p=createRecordFromMarkdown(updated,{path:change.toPath});
  const original=createRecordFromMarkdown(material.find(m=>m.path===oldPath).markdown,{path:oldPath});
  if (!original.trace)continue;
  const former=path.posix.normalize(path.posix.join(path.posix.dirname(oldPath),original.trace));
  const newParent=bySource.get(former)?.toPath||former;
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(change.toPath),p.trace)),newParent,oldPath);
 }
 await assert.rejects(stat(path.join(rootdir,branch.path)));
 assert.equal((await readFile(path.join(rootdir,touched.toPath),'utf8')).includes('..'),true);
});

test('scope and cross-workspace requests fail closed without complete asset/Git continuity evidence',()=>{
 const unqualified=projectPortableLineageMaintenance({representationCoverage:'complete',materials:material,operation:{kind:'scoped-move',workspaceId:'w',selectedPath:branch.path,scope:'self-and-leaves',targetDirectory:'.topics/b'}});
 assert.equal(unqualified.status,'blocked');assert.ok(unqualified.findings.some(f=>f.code==='lineage-maintenance.complete-asset-inventory-required'));
 const crossing=projectPortableLineageMaintenance({representationCoverage:'complete',materials:material,operation:{kind:'scoped-move',workspaceId:'w',targetWorkspaceId:'another',selectedPath:branch.path,scope:'alone',targetDirectory:'.topics/b'}});
 assert.equal(crossing.status,'blocked');assert.ok(crossing.findings.some(f=>f.code==='lineage-maintenance.cross-workspace-git-continuity-unqualified'));
});
