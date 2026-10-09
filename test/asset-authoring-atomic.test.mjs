import test from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {mkdtemp,mkdir,readFile,writeFile,access,rm} from 'node:fs/promises';
import { inspectPortableAssetRelocationWorkspace } from '../src/tooling/portable/adapters/node/asset.relocation.inspect.js';
import { applyPortableLineageMaintenancePlan } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';
import { recoverPortableLineageMaintenanceTransactions } from '../src/tooling/portable/adapters/node/lineage.maintenance.transaction.js';
import {sealC14nV2Self} from '../src/integrity/integrity.c14nV2.js';
const from='.topics/media/photo.png',directory='.topics/work/evidence',artifactPath=directory+'/001-1-evidence.trace.md';
const original=Buffer.from([137,80,78,71,10,0,1,255,240]);
const markdown=sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.evidence.v1\n  - Created At: 2026-10-09 12:00:00\n  - Summary: asset atomic transaction acceptance\n  - Status: ready/local\n\n---\n\n# Evidence source\n\n## Evidence Material\n\n- Material: [photo](001-1-photo-01.png)\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown;
async function fixture(t){const root=await mkdtemp(path.join(os.tmpdir(),'tix-atomic-author-'));t.after(()=>rm(root,{recursive:true,force:true}));await mkdir(path.join(root,'.topics/media'),{recursive:true});await mkdir(path.join(root,directory),{recursive:true});await writeFile(path.join(root,from),original);return root}
async function plan(root,md=markdown){return inspectPortableAssetRelocationWorkspace({workspaceRoot:root,workspaceId:'w',assetPaths:[from],targetDirectory:directory,lineageDimension:'001-1',artifactCreation:{path:artifactPath,markdown:md}})}
async function exists(f){try{await access(f);return true}catch{return false}}
test('atomic author + relocation commits both outputs with exactly qualified bytes and no source remaining',async t=>{
 const root=await fixture(t),p=await plan(root);
 assert.equal(p.status,'ready',JSON.stringify(p.findings));assert.equal(p.changes.filter(x=>x.kind==='artifact-create').length,1);
 const result=await applyPortableLineageMaintenancePlan(p,{workspaceRoots:{w:root}});
 assert.equal(result.status,'ready',JSON.stringify(result.findings));
 assert.deepEqual(await readFile(path.join(root,directory,'001-1-photo-01.png')),original);
 assert.equal(await readFile(path.join(root,artifactPath),'utf8'),markdown);
 assert.equal(await exists(path.join(root,from)),false);
 assert.equal(await exists(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
});
test('rollback before and after output publication removes newly created artifact and restores file',async t=>{
 for(const phaseName of ['prepared','sources-staged','outputs-written']){
  const root=await fixture(t),p=await plan(root);
  const result=await applyPortableLineageMaintenancePlan(p,{workspaceRoots:{w:root},onPhase:async({phase})=>{if(phase===phaseName)throw Error('injected failure')}});
  assert.equal(result.status,'blocked',phaseName);assert.deepEqual(await readFile(path.join(root,from)),original,phaseName);
  assert.equal(await exists(path.join(root,artifactPath)),false,phaseName);assert.equal(await exists(path.join(root,directory,'001-1-photo-01.png')),false,phaseName);
  assert.equal(await exists(path.join(root,'.tiinex/lineage-maintenance.lock')),false,phaseName);
 }
});
test('source drift, new artifact collision and tampered artifact payload fail closed',async t=>{
 const root=await fixture(t),p=await plan(root);await writeFile(path.join(root,artifactPath),'external file');
 let result=await applyPortableLineageMaintenancePlan(p,{workspaceRoots:{w:root}});assert.equal(result.status,'blocked');
 assert.deepEqual(await readFile(path.join(root,from)),original);await rm(path.join(root,artifactPath));
 const forged={...p,changes:p.changes.map(x=>x.kind==='artifact-create'?{...x,markdown:x.markdown+'\ninjected'}:x)};
 result=await applyPortableLineageMaintenancePlan(forged,{workspaceRoots:{w:root}});assert.equal(result.status,'blocked');
 await writeFile(path.join(root,from),'changed');result=await applyPortableLineageMaintenancePlan(p,{workspaceRoots:{w:root}});assert.equal(result.status,'blocked');
 assert.equal(await exists(path.join(root,artifactPath)),false);
});
test('unsafe authored output rejected during projection',async t=>{
 const root=await fixture(t),p=await plan(root,'not sealed');assert.equal(p.status,'blocked');
 assert.ok(p.findings.some(x=>x.code==='asset-relocation.artifact-creation-unqualified'));
});

test('hard process crash after writing outputs recovers artifact and file via durable journal',async t=>{
 const root=await fixture(t),p=await plan(root);
 const entry=new URL('../src/tooling/portable/adapters/node/lineage.maintenance.apply.js',import.meta.url).href;
 const script=`import { applyPortableLineageMaintenancePlan } from ${JSON.stringify(entry)};
const plan = ${JSON.stringify(p)};
await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{w:${JSON.stringify('__ROOT__')}},onPhase:async ({phase})=>{if(phase==='outputs-written')process.exit(84)}});`;
 const child=spawnSync(process.execPath,['--input-type=module','-e',script.replace('__ROOT__',root)],{encoding:'utf8',timeout:10000});
 assert.equal(child.status,84,child.stderr);
 assert.equal(await exists(path.join(root,from)),false);
 assert.equal(await exists(path.join(root,artifactPath)),true);
 const recovery=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{w:root}});
 assert.equal(recovery.status,'ready',JSON.stringify(recovery.findings));
 assert.deepEqual(await readFile(path.join(root,from)),original);
 assert.equal(await exists(path.join(root,artifactPath)),false);
 assert.equal(await exists(path.join(root,directory,'001-1-photo-01.png')),false);
});
test('two separately named assets receive one common artifact lineage with 01/02 sequence and commit together',async t=>{
 const root=await fixture(t),secondPath='.topics/media/another-image.png',secondBytes=Buffer.from([8,9,10,255]);
 await writeFile(path.join(root,secondPath),secondBytes);
 const doc=sealC14nV2Self(markdown.replace('[photo](001-1-photo-01.png)','[photo](001-1-photo-01.png) and [another](001-1-another-image-02.png)')).markdown;
 const p=await inspectPortableAssetRelocationWorkspace({workspaceRoot:root,workspaceId:'w',assetPaths:[from,secondPath],targetDirectory:directory,lineageDimension:'001-1',artifactCreation:{path:artifactPath,markdown:doc}});
 assert.equal(p.status,'ready',JSON.stringify(p.findings));
 assert.deepEqual(p.changes.filter(x=>x.kind==='binary-asset').map(x=>path.posix.basename(x.toPath)),['001-1-photo-01.png','001-1-another-image-02.png']);
 const receipt=await applyPortableLineageMaintenancePlan(p,{workspaceRoots:{w:root}});
 assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));
 assert.deepEqual(await readFile(path.join(root,directory,'001-1-photo-01.png')),original);
 assert.deepEqual(await readFile(path.join(root,directory,'001-1-another-image-02.png')),secondBytes);
 assert.equal(await readFile(path.join(root,artifactPath),'utf8'),doc);
});
