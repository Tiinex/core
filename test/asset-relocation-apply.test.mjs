import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {mkdtemp,mkdir,readFile,writeFile,access,symlink,rm} from 'node:fs/promises';
import {projectPortableAssetRelocation as project} from '../src/tooling/portable/lineage/asset.relocation.projection.js';
import {applyPortableLineageMaintenancePlan as apply} from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';
import {recoverPortableLineageMaintenanceTransactions as recover} from '../src/tooling/portable/adapters/node/lineage.maintenance.transaction.js';
import {stableFingerprintBytes,sha256Hex} from '../src/export/package.bytes.js';
const sourcePath='.topics/assets/image.png', directory='.topics/review';
const raw=Buffer.from([0,32,255,130,0,13,10,255,230,18,1,0]);
async function sandbox(t){let root=await mkdtemp(path.join(os.tmpdir(),'tiinex-asset-'));t.after(()=>rm(root,{recursive:true,force:true}));await mkdir(path.join(root,'.topics/assets'),{recursive:true});await mkdir(path.join(root,directory),{recursive:true});await writeFile(path.join(root,sourcePath),raw);return root;}
function plan(){return project({workspaceId:'w',targetDirectory:directory,lineageDimension:'001-1-1',referenceCoverage:'complete',representationCoverage:'complete',targetDirectoryEntries:[],assets:[{path:sourcePath,fingerprint:stableFingerprintBytes(raw),sha256:sha256Hex(raw),referencedBy:[]}]});}
async function present(file){try{await access(file);return true}catch{return false}}
test('binary relocation applies through existing durable journal, preserves bytes, and cleans lock',async t=>{
 const root=await sandbox(t),p=plan();let r=await apply(p,{workspaceRoots:{w:root}});
 assert.equal(r.status,'ready',JSON.stringify(r.findings));assert.equal(r.verification.binarySha256Verified,true);assert.equal(r.verification.selfIntegrityVerified,false);
 const to=p.changes[0].toPath;assert.deepEqual(await readFile(path.join(root,to)),raw);assert.equal(await present(path.join(root,sourcePath)),false);
 assert.equal(await present(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
});
test('source drift, target collision and tampered plan block with unchanged input bytes',async t=>{
 const root=await sandbox(t),p=plan(),target=path.join(root,p.changes[0].toPath);
 let r=await apply({...p,planFingerprint:'fake'}, {workspaceRoots:{w:root}});assert.equal(r.status,'blocked');
 await writeFile(target,Buffer.from('third party'));r=await apply(p,{workspaceRoots:{w:root}});assert.equal(r.status,'blocked');assert.deepEqual(await readFile(target),Buffer.from('third party'));
 await rm(target);await writeFile(path.join(root,sourcePath),Buffer.from('changed'));
 r=await apply(p,{workspaceRoots:{w:root}});assert.equal(r.status,'blocked');assert.equal(await present(target),false);
});
test('post-source-stage injected failure rolls back original binary exactly and cleans transaction',async t=>{
 const root=await sandbox(t),p=plan();let r=await apply(p,{workspaceRoots:{w:root},onPhase:async phase=>{if(phase.phase==='sources-staged')throw Error('synthetic crash');}});
 assert.equal(r.status,'blocked');assert.deepEqual(await readFile(path.join(root,sourcePath)),raw);assert.equal(await present(path.join(root,p.changes[0].toPath)),false);
 assert.equal(await present(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
});
test('source symlink and symlinked destination folder are never followed',async t=>{
 const root=await sandbox(t),p=plan(),real=path.join(root,sourcePath);
 await rm(real);await symlink(path.join(root,'missing.png'),real);
 let r=await apply(p,{workspaceRoots:{w:root}});assert.equal(r.status,'blocked');assert.ok(r.findings.some(x=>x.code==='asset-relocation.apply.symlink-or-path'));
 const root2=await sandbox(t);await rm(path.join(root2,directory),{recursive:true});await symlink(path.join(root2,'.topics/assets'),path.join(root2,directory));
 r=await apply(p,{workspaceRoots:{w:root2}});assert.equal(r.status,'blocked');assert.ok(r.findings.some(x=>x.code==='asset-relocation.apply.symlink-or-path'));
});
test('asset data changed during transaction staging fails before source mutation',async t=>{
 const root=await sandbox(t),p=plan();let r=await apply(p,{workspaceRoots:{w:root},onPhase:async ({phase})=>{if(phase==='prepared')await writeFile(path.join(root,sourcePath),'outside edit');}});
 assert.equal(r.status,'blocked');assert.deepEqual(await readFile(path.join(root,sourcePath)),Buffer.from('outside edit'));
 assert.equal(await present(path.join(root,p.changes[0].toPath)),false);
});
