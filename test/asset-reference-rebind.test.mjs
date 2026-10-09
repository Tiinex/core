import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, readFile, rm, stat, symlink } from 'node:fs/promises';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { inspectPortableAssetRelocationWorkspace as inspect } from '../src/tooling/portable/adapters/node/asset.relocation.inspect.js';
import { applyPortableLineageMaintenancePlan as apply } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';
import { projectPortableAssetRelocation as project } from '../src/tooling/portable/lineage/asset.relocation.projection.js';
const asset='.topics/source/photo 01.png',directory='.topics/work/evidence',record='.topics/work/notes/001-notes.trace.md';
const binary=Buffer.from([0,255,4,39,128,40,129,0,90]);
const content=`# Evidence\n\nOriginal: ![image](../../source/photo%2001.png)\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending`;
async function fixture(t) {
 const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-rebound-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 for(const p of [asset,record,`${directory}/1-placeholder.txt`])await mkdir(path.dirname(path.join(root,p)),{recursive:true});
 await writeFile(path.join(root,asset),binary);
 const sealed=sealC14nV2Self(content);assert.equal(sealed.state,'sealed');
 await writeFile(path.join(root,record),sealed.markdown);
 await writeFile(path.join(root,`${directory}/1-placeholder.txt`),'occupied');
 return {root,original:sealed.markdown};
}
const req=root=>({workspaceRoot:root,workspaceId:'owner',assetPaths:[asset],targetDirectory:directory,lineageDimension:'001-2'});
async function has(p){try{await stat(p);return true;}catch{return false;}}
test('Core inspects full local supported-text scope, rebinds source links and reseals Tiinex artifact in the SAME durable transaction',async t=>{
 const {root,original}=await fixture(t),p=await inspect(req(root));
 assert.equal(p.status,'ready',JSON.stringify(p.findings));assert.equal(p.changes.length,2);assert.equal(p.inputs.length,2);
 assert.equal(p.changes[1].kind,'artifact-reference-rebind');
 assert.equal(p.changes[1].pathChanged,false);
 assert.equal(p.inspection.mode,'local-workspace-supported-text-v1');
 assert.notEqual(p.changes[1].markdown,original);
 assert.equal(canonicalC14nV2SelfState(p.changes[1].markdown).state,'verified');
 const result=await apply(p,{workspaceRoots:{owner:root}});assert.equal(result.status,'ready',JSON.stringify(result.findings));
 assert.deepEqual(await readFile(path.join(root,p.changes[0].toPath)),binary);
 assert.equal(await has(path.join(root,asset)),false);
 const next=await readFile(path.join(root,record),'utf8');assert.equal(next,p.changes[1].markdown);
 assert.equal(canonicalC14nV2SelfState(next).state,'verified');
 assert.match(next,/!\[image\]\(\.\.\/evidence\/001-2-photo-01-01\.png\)/);
});
test('an interruption rolls back binary and referenced Tiinex artifact together',async t=>{
 const {root,original}=await fixture(t),p=await inspect(req(root));assert.equal(p.status,'ready');
 const result=await apply(p,{workspaceRoots:{owner:root},onPhase:async ({phase})=>{if(phase==='outputs-written')throw Error('interrupt');}});
 assert.equal(result.status,'blocked');assert.deepEqual(await readFile(path.join(root,asset)),binary);
 assert.equal(await readFile(path.join(root,record),'utf8'),original);
 assert.equal(await has(path.join(root,p.changes[0].toPath)),false);
});
test('changed source artifacts and injected target collisions block atomically with no file modifications',async t=>{
 const {root,original}=await fixture(t),p=await inspect(req(root));assert.equal(p.status,'ready');
 await writeFile(path.join(root,record),original+'\nexternal edit');
 let result=await apply(p,{workspaceRoots:{owner:root}});assert.equal(result.status,'blocked');assert.deepEqual(await readFile(path.join(root,asset)),binary);
 await writeFile(path.join(root,record),original);
 await writeFile(path.join(root,p.changes[0].toPath),'occupied');
 result=await apply(p,{workspaceRoots:{owner:root}});assert.equal(result.status,'blocked');assert.deepEqual(await readFile(path.join(root,asset)),binary);
});
test('unqualified text mention, JSON/TS reference, symlink or broken Tiinex integrity blocks projection',async t=>{
 const {root,original}=await fixture(t);
 const extra=path.join(root,'.topics/work/notes/002-notes.md');
 await writeFile(extra,'File photo 01.png is used here outside a qualifying Markdown link.');
 let p=await inspect(req(root));assert.equal(p.status,'blocked');
 await rm(extra);await writeFile(path.join(root,'.topics/work/notes/002-code.ts'),'const source = "photo 01.png";');
 p=await inspect(req(root));assert.equal(p.status,'blocked');
 await rm(path.join(root,'.topics/work/notes/002-code.ts'));
 await writeFile(path.join(root,record),original+'\ninvalid edit');p=await inspect(req(root));assert.equal(p.status,'blocked');
 await writeFile(path.join(root,record),original);
 await symlink('/tmp/no-such-file',extra);p=await inspect(req(root));assert.equal(p.status,'blocked');
});
test('manual unqualified referencedBy inventory cannot claim it has rebound unknown ref material',()=>{
 const p=project({workspaceId:'owner',targetDirectory:directory,lineageDimension:'001-2',representationCoverage:'complete',referenceCoverage:'complete',targetDirectoryEntries:[],assets:[{path:asset,fingerprint:'tixfp1-0f0f0f0f',sha256:'0'.repeat(64),referencedBy:[record]}]});
 assert.equal(p.status,'blocked');assert.ok(p.findings.some(x=>x.code==='asset-relocation.references-incomplete-material'));
});

test('removing inspection evidence cannot bypass requalification through the same plan fingerprint',async t=>{
 const {root,original}=await fixture(t),plan=await inspect(req(root));assert.equal(plan.status,'ready');
 const forged={...plan,inspection:undefined};
 let receipt=await apply(forged,{workspaceRoots:{owner:root}});
 assert.equal(receipt.status,'blocked');assert.ok(receipt.findings.some(x=>x.code==='asset-relocation.apply.inspection-unqualified'));
 assert.deepEqual(await readFile(path.join(root,asset)),binary);
 assert.equal(await readFile(path.join(root,record),'utf8'),original);
});
test('new reference between plan and apply invalidates inspected plan even if original files remain byte-identical',async t=>{
 const {root,original}=await fixture(t),p=await inspect(req(root));assert.equal(p.status,'ready');
 const added=path.join(root,'.topics/work/notes/003-unseen.md');
 await writeFile(added,'![another](../../source/photo%2001.png)');
 const result=await apply(p,{workspaceRoots:{owner:root}});
 assert.equal(result.status,'blocked');
 assert.ok(result.findings.some(x=>x.code==='asset-relocation.apply.inspection-stale'));
 assert.equal(await readFile(path.join(root,record),'utf8'),original);
 assert.deepEqual(await readFile(path.join(root,asset)),binary);
});
test('source bytes modified after prepared (under cooperative lock) are detected before staging',async t=>{
 const {root,original}=await fixture(t),p=await inspect(req(root));assert.equal(p.status,'ready');
 // Inject a source edit after prepared; last pre-mutation inspection blocks it.
 const result=await apply(p,{workspaceRoots:{owner:root},onPhase:async ({phase})=>{
  if(phase==='prepared')await writeFile(path.join(root,record),original+'\nnew user bytes');
 }});
 assert.equal(result.status,'blocked');assert.deepEqual(await readFile(path.join(root,asset)),binary);
 assert.equal(await has(path.join(root,p.changes[0].toPath)),false);
});
test('CLI exposes fully inspected transaction plan and applies it with existing portable command',async t=>{
 const {root}=await fixture(t);
 const {spawnSync}=await import('node:child_process');
 const cli=path.resolve('tools/tiinex-portable.mjs');
 const requestRoot=await mkdtemp(path.join(os.tmpdir(),'tiinex-request-'));t.after(()=>rm(requestRoot,{recursive:true,force:true}));
 const request=path.join(requestRoot,'inspection-request.json');
 await writeFile(request,JSON.stringify(req(root)));
 const run=(args)=>spawnSync(process.execPath,[cli,...args],{cwd:path.dirname(cli)+'/..',encoding:'utf8',timeout:30000,env:{...process.env,TIINEX_CONTENT_ROOTS:process.env.TIINEX_TEST_NATIVE_ROOT||''}});
 let result=run(['inspect-asset-relocation-workspace','--request',request,'--compact']);
 assert.equal(result.status,0,result.stderr+'\n'+result.stdout.slice(0,500));
 const plan=JSON.parse(result.stdout);assert.equal(plan.status,'ready');assert.equal(plan.changes.length,2);
 const planPath=path.join(requestRoot,'inspection-plan.json');await writeFile(planPath,JSON.stringify(plan));
 result=run(['apply-lineage-maintenance','--plan',planPath,'--workspace-id','owner','--workspace-root',root,'--compact']);
 assert.equal(result.status,0,result.stderr+'\n'+result.stdout.slice(0,300));
 assert.equal(JSON.parse(result.stdout).status,'ready');
});
