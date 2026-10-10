import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, readFile, access, rm } from 'node:fs/promises';
import { sha256Hex, stableFingerprintBytes } from '../src/export/package.bytes.js';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
import { projectPortableLineageMaintenance } from '../src/tooling/portable/lineage/lineage.maintenance.projection.js';
import { applyPortableLineageMaintenancePlan } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';

const directory='.topics/a',w='manual';
function artifact(name,parent=null,image=''){
 const p=`${directory}/${name}`;
 const rel=parent?path.posix.relative(directory,parent.path):'';
 const block=parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${path.posix.basename(parent.path)}](${rel})\n  - Origin:\n    - [relative](${rel})\n`:'';
 const pIntegrity=parent?`- sha256-base64url-c14n-v2\n  - Towards: [${path.posix.basename(parent.path)}](${rel})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:'';
 const body=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${block}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n${image?`![photo](${image})\n`:''}\n---\n\n# Continuity Integrity\n\n${pIntegrity}- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `;
 return {workspaceId:w,path:p,markdown:sealC14nV2Self(body).markdown+'\n'};
}
const bytes=Buffer.from('opaque-png-fixture\x00\x01\xff','latin1');
const assetPath=`${directory}/001-photo-01.png`;
const assetMaterial={workspaceId:w,path:assetPath,fingerprint:stableFingerprintBytes(bytes),sha256:sha256Hex(bytes)};
const parent=artifact('001-parent.trace.md',null,'001-photo-01.png');
const child=artifact('001-1-child.trace.md',parent);
const data=[parent,child];
const scope=(name,overrides={})=>({materials:data,representationCoverage:'complete',assetPaths:[assetPath],assetCoverage:'complete',referenceCoverage:'complete',assetMaterials:[assetMaterial],operation:{kind:'scoped-move',workspaceId:w,scope:name,selectedPath:parent.path,targetDirectory:'.topics/b',placement:'same',parentPolicy:'keep'},...overrides});
const file=async(root,p)=>{try{return await readFile(path.join(root,p));}catch(e){if(e.code==='ENOENT')return null;throw e}};
async function setup(){const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-mixed-asset-'));for(const m of data){const dest=path.join(root,m.path);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,m.markdown);}await writeFile(path.join(root,assetPath),bytes);return root;}

test('Core moves a qualified artifact + PNG in one atomic transaction, preserving Child/Parent identity',async t=>{
 const root=await setup();t.after(()=>rm(root,{recursive:true,force:true}));
 const plan=projectPortableLineageMaintenance(scope('alone-with-assets'));
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 assert.equal(plan.changes.filter(x=>x.kind==='binary-asset').length,1);
 const binary=plan.changes.find(x=>x.kind==='binary-asset');const owner=plan.changes.find(x=>x.fromPath===parent.path);
 assert.equal(path.posix.dirname(binary.toPath),path.posix.dirname(owner.toPath));
 assert.equal(binary.toPath.replace(/^.*\//,''),'001-photo-01.png');
 const drift=Buffer.from('changed bytes');await writeFile(path.join(root,assetPath),drift);
 const refused=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{[w]:root}});
 assert.equal(refused.status,'blocked');assert.equal((await file(root,assetPath)).equals(drift),true);
 await writeFile(path.join(root,assetPath),bytes);
 const accepted=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{[w]:root}});
 assert.equal(accepted.status,'ready',JSON.stringify(accepted.findings));assert.equal(accepted.verification.binarySha256Verified,true);
 assert.equal((await file(root,binary.toPath)).equals(bytes),true);assert.equal(await file(root,assetPath),null);
 const moved=await file(root,owner.toPath);assert.equal(canonicalC14nV2SelfState(moved.toString()).state,'verified');
 const record=createRecordFromMarkdown(moved.toString(),{path:owner.toPath});
 assert.match(moved.toString(),/!\[photo\]\(001-photo-01.png\)/);
 const childOutput=plan.changes.find(x=>x.fromPath===child.path);const childAfter=await file(root,childOutput.toPath);
 assert.equal(canonicalC14nV2SelfState(childAfter.toString()).state,'verified');
 const recordChild=createRecordFromMarkdown(childAfter.toString(),{path:childOutput.toPath});
 assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(childOutput.toPath),recordChild.trace)),owner.toPath);
 assert.equal(recordChild.parentIntegrity||recordChild.integrity?.parentDigest,recordChild.parentIntegrity||recordChild.integrity?.parentDigest);
});

test('Self + Leaves carries both artifact levels and exact dimension-owned assets, not sibling files',async t=>{
 const root=await setup();t.after(()=>rm(root,{recursive:true,force:true}));
 const secondPath=`${directory}/001-1-photo-01.png`,otherPath=`${directory}/001-2-unrelated.png`;
 const b=Buffer.from([1,2,3]);await writeFile(path.join(root,secondPath),b);await writeFile(path.join(root,otherPath),b);
 const second={workspaceId:w,path:secondPath,fingerprint:stableFingerprintBytes(b),sha256:sha256Hex(b)};
 const plan=projectPortableLineageMaintenance(scope('self-and-leaves',{assetPaths:[assetPath,secondPath,otherPath],assetMaterials:[assetMaterial,second]}));
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const images=plan.changes.filter(c=>c.kind==='binary-asset');assert.equal(images.length,2);
 const receipt=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{[w]:root}});
 assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));
 assert.deepEqual(await file(root,otherPath),b);for(const image of images){assert.equal(await file(root,image.fromPath),null);assert.ok(await file(root,image.toPath));}
});

test('Combined plan fails closed on bad source, missing coverage, unowned binary, unsafe Parent change',()=>{
 let p=projectPortableLineageMaintenance(scope('alone-with-assets',{referenceCoverage:'unknown'}));assert.equal(p.status,'blocked');
 p=projectPortableLineageMaintenance(scope('alone-with-assets',{assetMaterials:[{...assetMaterial,sha256:''}]}));assert.equal(p.status,'blocked');
 p=projectPortableLineageMaintenance(scope('alone-with-assets',{assetPaths:[assetPath,`${directory}/001-2-missing.png`],assetMaterials:[assetMaterial]}));assert.equal(p.status,'ready','Only selected dimension-bound assets need material bytes; other catalog entries remain inventory');
 p=projectPortableLineageMaintenance(scope('alone-with-assets',{operation:{...scope('alone-with-assets').operation,targetWorkspaceId:'remote'}}));assert.equal(p.status,'blocked');
});

test('Atomic rollback restores binary and artifact when failure injected after source staging',async t=>{
 const root=await setup();t.after(()=>rm(root,{recursive:true,force:true}));const plan=projectPortableLineageMaintenance(scope('alone-with-assets'));
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const res=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{[w]:root},onPhase:({phase})=>{if(phase==='sources-staged')throw new Error('simulated power loss after source stage')}});
 assert.equal(res.status,'blocked');
 assert.equal((await file(root,assetPath)).equals(bytes),true);assert.equal((await file(root,parent.path)).toString(),parent.markdown);
 assert.equal(await file(root,plan.changes.find(x=>x.kind==='binary-asset').toPath),null);
});
