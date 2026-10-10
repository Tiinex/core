import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { inspectPortableScopedMoveWorkspace } from '../src/tooling/portable/adapters/node/lineage.scoped-move.inspect.js';
import { applyPortableLineageMaintenancePlan } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';
const core=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(core,'tools/tiinex-portable.mjs');
const wid='test-workspace',source='.topics/source',destination='.topics/moved';
function record(name){
 const md=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n![evidence](001-photo-01.png)\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `;
 return sealC14nV2Self(md).markdown+'\n';
}
async function setup(t) {
 const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-reference-closure-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(path.join(root,source),{recursive:true});
 await mkdir(path.join(root,destination),{recursive:true});
 await mkdir(path.join(root,'.topics/notes'),{recursive:true});
 const owner=`${source}/001-owner.trace.md`,image=`${source}/001-photo-01.png`;
 const bytes=Buffer.from([137,80,78,71,0,245,30,16]);
 await writeFile(path.join(root,owner),record('Owner'));
 await writeFile(path.join(root,image),bytes);
 const request={workspaceRoot:root,workspaceId:wid,operation:{
  kind:'scoped-move',workspaceId:wid,selectedPath:owner,scope:'alone-with-assets',placement:'same',
  targetDirectory:destination,parentPolicy:'keep'
 }};
 return {root,owner,image,bytes,request};
}
test('Core-local workspace inspection builds one real mixed plan and Apply preserves bytes, references and self integrity',async t=>{
 const fixture=await setup(t);
 const value=await inspectPortableScopedMoveWorkspace(fixture.request);
 assert.equal(value.status,'ready',JSON.stringify(value.findings));
 assert.equal(value.plan.status,'ready');
 assert.equal(value.plan.inspectionReceipt.snapshotSha256,value.receipt.snapshotSha256);
 assert.ok(value.plan.changes.some(c=>c.kind==='binary-asset'));
 const receipt=await applyPortableLineageMaintenancePlan(value.plan,{workspaceRoots:{[wid]:fixture.root}});
 assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));
 const moved=value.plan.changes.find(x=>x.fromPath===fixture.owner);
 const asset=value.plan.changes.find(x=>x.kind==='binary-asset');
 assert.deepEqual(await readFile(path.join(fixture.root,asset.toPath)),fixture.bytes);
 assert.equal(canonicalC14nV2SelfState(await readFile(path.join(fixture.root,moved.toPath),'utf8')).state,'verified');
 await assert.rejects(readFile(path.join(fixture.root,fixture.image)));
});
test('Unsupported Markdown and non-Tiinex JS incoming references fail CLOSED rather than claiming complete closure',async t=>{
 for(const entry of [
  {name:'.topics/notes/readme.md',content:'Please see [image](../source/001-photo-01.png)'},
  {name:'.topics/notes/main.js',content:'const image = "../source/001-photo-01.png";'}
 ]){
  const fixture=await setup(t);
  await writeFile(path.join(fixture.root,entry.name),entry.content);
  const value=await inspectPortableScopedMoveWorkspace(fixture.request);
  assert.equal(value.status,'blocked');
  assert.equal(value.findings[0].code,'scoped-move.inspect.unrewritable-reference',JSON.stringify(value.findings));
 }
});
test('Unquoted HTML and CSS URLs to a relocated asset block as unsupported reference owners',async t=>{
 for(const e of [{name:'.topics/notes/page.html',content:'<img src=../source/001-photo-01.png>'},
                 {name:'.topics/notes/site.css',content:'.photo{background:url(../source/001-photo-01.png)}'}]) {
   const fx=await setup(t);
   await writeFile(path.join(fx.root,e.name),e.content);
   const out=await inspectPortableScopedMoveWorkspace(fx.request);
   assert.equal(out.status,'blocked',JSON.stringify(out.findings));
   assert.equal(out.findings[0].code,'scoped-move.inspect.unrewritable-reference');
 }
});
test('Workspace inventory snapshots reject new files and modified unrelated links before Apply',async t=>{
 const fixture=await setup(t);
 const value=await inspectPortableScopedMoveWorkspace(fixture.request);
 assert.equal(value.status,'ready');
 const extra='.topics/notes/newfile.md';
 await writeFile(path.join(fixture.root,extra),'Unrelated but created after preview');
 const blocked=await applyPortableLineageMaintenancePlan(value.plan,{workspaceRoots:{[wid]:fixture.root}});
 assert.equal(blocked.status,'blocked');
 assert.ok(blocked.findings.some(x=>x.code==='scoped-move.inspect.snapshot-drift'));
 assert.deepEqual(await readFile(path.join(fixture.root,fixture.image)),fixture.bytes);
});
test('No symlink or invalid text is silently skipped by complete reference inventory',async t=>{
 const fixture=await setup(t);
 await writeFile(path.join(fixture.root,'.topics/notes/invalid.md'),Buffer.from([255,254,255]));
 const value=await inspectPortableScopedMoveWorkspace(fixture.request);
 assert.equal(value.status,'blocked');assert.equal(value.findings[0].code,'scoped-move.inspect.unsafe-inventory');
});
test('CLI inspect-scoped-move-workspace runs manually without VS Code and produces an Apply-compatible plan',async t=>{
 const fixture=await setup(t);
 const temp=await mkdtemp(path.join(os.tmpdir(),'tiinex-cli-inspect-'));
 t.after(()=>rm(temp,{recursive:true,force:true}));
 const rq=path.join(temp,'request.json'),pp=path.join(temp,'plan.json');
 await writeFile(rq,JSON.stringify(fixture.request));
 const cliResult=spawnSync(process.execPath,[cli,'inspect-scoped-move-workspace','--request',rq,'--compact'],{cwd:core,env:process.env,encoding:'utf8',timeout:45000});
 assert.equal(cliResult.status,0,cliResult.stderr||cliResult.stdout.slice(0,1500));
 const result=JSON.parse(cliResult.stdout);
 assert.equal(result.status,'ready',JSON.stringify(result.findings));
 await writeFile(pp,JSON.stringify(result.plan));
 const run=spawnSync(process.execPath,[cli,'apply-lineage-maintenance','--plan',pp,'--workspace-id',wid,'--workspace-root',fixture.root,'--compact'],{cwd:core,env:process.env,encoding:'utf8',timeout:45000});
 assert.equal(run.status,0,run.stderr||run.stdout.slice(0,1500));
 assert.equal(JSON.parse(run.stdout).applied,true);
});

test('Cross-Workspace inspect offers GitHub connector read recovery without authorizing a move',async t=>{
 const fixture=await setup(t);
 const operation={...fixture.request.operation,targetWorkspaceId:'different-workspace'};
 const out=await inspectPortableScopedMoveWorkspace({...fixture.request,operation,publication:{repository:'Tiinex/source',commit:'abcdefabcdefabcdefabcdefabcdefabcdefabcd'},
  availableTools:[{id:'github-fetch-file',name:'GitHub fetch file',description:'read GitHub repository file'}]});
 assert.equal(out.status,'blocked');assert.equal(out.executable,false);
 assert.equal(out.findings[0].code,'scoped-move.inspect.cross-workspace-apply-unqualified');
 assert.equal(out.publicationRecovery.status,'unresolved');
 assert.equal(out.publicationRecovery.hostAction.status,'ready');
 assert.equal(out.publicationRecovery.hostAction.steps[0].tool.id,'github-fetch-file');
 assert.equal(out.publicationRecovery.boundary.remoteMutation,false);
});
