import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { projectPortableLineageMaintenance } from '../src/tooling/portable/lineage/lineage.maintenance.projection.js';
import { sealC14nV2Self, canonicalC14nV2SelfState, verifyC14nV2TargetSelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
import { sha256Hex, stableFingerprintBytes } from '../src/export/package.bytes.js';
const core=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(core,'tools','tiinex-portable.mjs');
const directory='.topics/keep-parent', workspaceId='fixture', method='sha256-base64url-c14n-v2';
function fixture(name,parent=null) {
 const targetPath=`${directory}/${name}`;
 const rel=parent?path.posix.relative(directory,parent.path):'';
 const md=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${path.posix.basename(parent.path)}](${rel})\n  - Origin:\n    - [relative](${rel})\n`:''}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n${name}\n\n---\n\n# Continuity Integrity\n\n${parent?`- ${method}\n  - Towards: [${path.posix.basename(parent.path)}](${rel})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:''}- ${method}\n  - Towards: self\n  - Value: `;
 return {workspaceId,path:targetPath,markdown:sealC14nV2Self(md).markdown+'\n'};
}
const base=()=>{
 const a=fixture('001-parent-a.trace.md');
 const target=fixture('001-1-target.trace.md',a);
 const targetLeaf=fixture('001-1-1-target-leaf.trace.md',target);
 const b=fixture('002-parent-b.trace.md');
 const selected=fixture('002-1-selected.trace.md',b);
 const leaf=fixture('002-1-1-selected-leaf.trace.md',selected);
 return {a,target,targetLeaf,b,selected,leaf,materials:[a,target,targetLeaf,b,selected,leaf]};
};
function project(input,placement,scope='self-and-leaves') {
 return projectPortableLineageMaintenance({representationCoverage:'complete',materials:input.materials,
   assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',
   operation:{kind:'scoped-move',workspaceId,selectedPath:input.selected.path,scope,
    targetPath:input.target.path,targetDirectory:directory,placement,parentPolicy:'keep'}});
}
function verify(plan,input) {
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const bySource=new Map(plan.changes.map(c=>[c.fromPath,c]));
 const byTarget=new Map(plan.changes.map(c=>[c.toPath,c]));
 for(const source of input.materials) {
  const output=bySource.get(source.path);assert.ok(output,source.path);
  const initial=createRecordFromMarkdown(source.markdown,{path:source.path});
  const revised=createRecordFromMarkdown(output.markdown,{path:output.toPath});
  assert.equal(canonicalC14nV2SelfState(output.markdown).state,'verified',output.toPath);
  assert.equal(output.semanticParent.changed,false);
  if(!initial.trace) {assert.equal(revised.trace,'');continue;}
  const former=path.posix.join(directory,initial.trace);
  const oldParent=bySource.get(former);assert.ok(oldParent,former);
  const expected=oldParent.toPath;
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(output.toPath),revised.trace)),expected,output.toPath);
  const actualParent=byTarget.get(expected);assert.ok(actualParent);
  assert.ok(revised.integrity.entries.some(i=>i.towards&&i.towards!=='self'&&verifyC14nV2TargetSelfDigest({value:i.value,targetMarkdown:actualParent.markdown}).state==='verified'),output.toPath);
 }
 return bySource;
}
test('Append + Keep Parent preserves semantic parents but assigns an available child coordinate with no sibling renumber',()=>{
 const i=base();const plan=project(i,'append');const by=verify(plan,i);
 assert.equal(by.get(i.target.path).toPath,i.target.path);
 assert.equal(by.get(i.targetLeaf.path).toPath,i.targetLeaf.path);
 assert.equal(by.get(i.selected.path).toPath,`${directory}/001-1-2-selected.trace.md`);
 assert.equal(by.get(i.leaf.path).toPath,`${directory}/001-1-2-1-selected-leaf.trace.md`);
 assert.equal(by.get(i.b.path).toPath,i.b.path);
});
test('Prepend + Keep Parent moves target beneath last selected leaf numerically while retaining original semantically qualified Parent',()=>{
 const i=base();const plan=project(i,'prepend');const by=verify(plan,i);
 assert.equal(by.get(i.selected.path).toPath,`${directory}/001-1-selected.trace.md`);
 assert.equal(by.get(i.leaf.path).toPath,`${directory}/001-1-1-selected-leaf.trace.md`);
 assert.equal(by.get(i.target.path).toPath,`${directory}/001-1-1-1-target.trace.md`);
 assert.equal(by.get(i.targetLeaf.path).toPath,`${directory}/001-1-1-1-1-target-leaf.trace.md`);
 assert.equal(by.get(i.a.path).toPath,i.a.path);
 assert.equal(by.get(i.b.path).toPath,i.b.path);
});
test('Keep Parent rewrites references from unchanged external-directory Tiinex artifacts when the anchored target moves',()=>{
 const i=base();
 const observer=fixture('003-observer.trace.md');
 const text=observer.markdown.replace('# 003-observer.trace.md\n\n003-observer.trace.md',
   '# 003-observer.trace.md\n\nSee [target](../keep-parent/001-1-target.trace.md)');
 const sealed=sealC14nV2Self(text);
 assert.equal(sealed.state,'sealed');
 const linked={...observer,path:'.topics/notes/003-observer.trace.md',markdown:sealed.markdown+'\n'};
 const plan=projectPortableLineageMaintenance({representationCoverage:'complete',materials:[...i.materials,linked],
   assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId,
   selectedPath:i.selected.path,scope:'self-and-leaves',targetPath:i.target.path,targetDirectory:directory,placement:'prepend',parentPolicy:'keep'}});
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const output=plan.changes.find(c=>c.fromPath===linked.path);
 assert.equal(output.pathChanged,false);
 assert.match(output.markdown,/\[target\]\(\.\.\/keep-parent\/001-1-1-1-target\.trace\.md\)/);
 assert.equal(canonicalC14nV2SelfState(output.markdown).state,'verified');
});
test('Prepend refuses a numerically ambiguous target namespace despite different filenames',()=>{
 const i=base();
 const sameDimension=fixture('001-1-other.trace.md');
 const plan=projectPortableLineageMaintenance({representationCoverage:'complete',materials:[...i.materials,sameDimension],
   assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId,
   selectedPath:i.selected.path,scope:'self-and-leaves',targetPath:i.target.path,targetDirectory:directory,placement:'prepend',parentPolicy:'keep'}});
 assert.equal(plan.status,'blocked');
 assert.ok(plan.findings.some(x=>x.code==='lineage-move-selection.coordinate-ambiguous'||x.code==='lineage-maintenance.keep-parent-coordinate-collision'),JSON.stringify(plan.findings));
});
test('Partial reference coverage fails closed before Keep Parent moves',()=>{
 const i=base();
 const plan=projectPortableLineageMaintenance({representationCoverage:'complete',materials:i.materials,
  assetPaths:[],assetCoverage:'complete',referenceCoverage:'bounded',operation:{kind:'scoped-move',workspaceId,
  selectedPath:i.selected.path,scope:'self-and-leaves',targetPath:i.target.path,targetDirectory:directory,placement:'append',parentPolicy:'keep'}});
 assert.equal(plan.status,'blocked');
 assert.ok(plan.findings.some(x=>x.code==='lineage-maintenance.reference-closure-unqualified'));
});
test('Keep Parent blocks ancestor/descendant overlap, and is not coerced into New Parent',()=>{
 const i=base();
 const wrong=projectPortableLineageMaintenance({representationCoverage:'complete',materials:i.materials,assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId,selectedPath:i.target.path,scope:'alone',targetPath:i.targetLeaf.path,targetDirectory:directory,placement:'append',parentPolicy:'keep'}});
 assert.equal(wrong.status,'blocked');assert.ok(wrong.findings.some(f=>f.code==='lineage-maintenance.keep-parent-semantic-overlap'));
});
test('Append + Keep Parent moves an exact-dimension PNG in the same atomic journal and rewrites its owner link',async t=>{
 const i=base();
 const asset=`${directory}/002-1-screenshot.png`;
 const photo=Buffer.from([137,80,78,71,13,10,26,10,44,200,0,255]);
 const selected=sealC14nV2Self(i.selected.markdown.replace(/\n---\n\n# Continuity Integrity/,
  `\n![Screenshot](002-1-screenshot.png)\n\n---\n\n# Continuity Integrity`));
 assert.equal(selected.state,'sealed');i.selected={...i.selected,markdown:selected.markdown+'\n'};
 i.leaf=fixture('002-1-1-selected-leaf.trace.md',i.selected);
 i.materials=[i.a,i.target,i.targetLeaf,i.b,i.selected,i.leaf];
 const request={representationCoverage:'complete',materials:i.materials,assetPaths:[asset],assetCoverage:'complete',referenceCoverage:'complete',
  assetMaterials:[{workspaceId,path:asset,fingerprint:stableFingerprintBytes(photo),sha256:sha256Hex(photo)}],
  operation:{kind:'scoped-move',workspaceId,selectedPath:i.selected.path,scope:'self-and-leaves',targetPath:i.target.path,
   targetDirectory:directory,placement:'append',parentPolicy:'keep'}};
 const plan=projectPortableLineageMaintenance(request);assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const binaries=plan.changes.filter(c=>c.kind==='binary-asset');assert.equal(binaries.length,1);
 assert.equal(binaries[0].toPath,`${directory}/001-1-2-screenshot.png`);
 assert.match(plan.changes.find(c=>c.fromPath===i.selected.path).markdown,/!\[Screenshot\]\(001-1-2-screenshot\.png\)/);
 verify(plan,i);
 const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-keep-asset-cli-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 await mkdir(path.join(dir,directory),{recursive:true});
 for(const m of i.materials)await writeFile(path.join(dir,m.path),m.markdown);
 await writeFile(path.join(dir,asset),photo);
 const requestFile=path.join(dir,'request.json'),planFile=path.join(dir,'plan.json');
 await writeFile(requestFile,JSON.stringify(request));
 const result=spawnSync(process.execPath,[cli,'project-lineage-maintenance','--request',requestFile,'--compact'],{cwd:core,encoding:'utf8',env:process.env,timeout:40000});
 assert.equal(result.status,0,result.stderr);const actual=JSON.parse(result.stdout).plan;
 assert.equal(actual.status,'ready',JSON.stringify(actual.findings));
 await writeFile(planFile,JSON.stringify(actual));
 const applied=spawnSync(process.execPath,[cli,'apply-lineage-maintenance','--plan',planFile,'--workspace-id',workspaceId,'--workspace-root',dir,'--compact'],{cwd:core,encoding:'utf8',env:process.env,timeout:40000});
 assert.equal(applied.status,0,applied.stderr||applied.stdout);assert.equal(JSON.parse(applied.stdout).applied,true);
 assert.deepEqual(await readFile(path.join(dir,binaries[0].toPath)),photo);
 for(const c of actual.changes.filter(c=>c.kind!=='binary-asset')) assert.equal(await readFile(path.join(dir,c.toPath),'utf8'),c.markdown);
});
test('Manually operate real standalone Core CLI plan/apply for Keep Parent; stale/replayed plans block',async t=>{
 for(const placement of ['prepend','append']) {
  const i=base(),dir=await mkdtemp(path.join(os.tmpdir(),`tiinex-keep-${placement}-`));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  await mkdir(path.join(dir,directory),{recursive:true});
  for(const m of i.materials)await writeFile(path.join(dir,m.path),m.markdown);
  const request={representationCoverage:'complete',materials:i.materials,assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId,selectedPath:i.selected.path,scope:'self-and-leaves',targetPath:i.target.path,targetDirectory:directory,placement,parentPolicy:'keep'}};
  const requestFile=path.join(dir,'request.json'),planFile=path.join(dir,'plan.json');await writeFile(requestFile,JSON.stringify(request));
  function run(args){const r=spawnSync(process.execPath,[cli,...args],{cwd:core,encoding:'utf8',env:process.env,timeout:40000});assert.ok(r.stdout.trim().startsWith('{'),r.stderr);return {code:r.status,result:JSON.parse(r.stdout)};}
  const r=run(['project-lineage-maintenance','--request',requestFile,'--compact']);assert.equal(r.code,0,JSON.stringify(r.result.findings));
  const plan=r.result.plan;verify(plan,i);await writeFile(planFile,JSON.stringify(plan));
  const a=run(['apply-lineage-maintenance','--plan',planFile,'--workspace-id',workspaceId,'--workspace-root',dir,'--compact']);
  assert.equal(a.code,0,JSON.stringify(a.result.findings));assert.equal(a.result.applied,true);
  for(const c of plan.changes){assert.equal(await readFile(path.join(dir,c.toPath),'utf8'),c.markdown);}
  const replay=run(['apply-lineage-maintenance','--plan',planFile,'--workspace-id',workspaceId,'--workspace-root',dir,'--compact']);
  assert.equal(replay.code,2);assert.equal(replay.result.status,'blocked');
 }
});
