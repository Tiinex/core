import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, readFile, writeFile, access, rm } from 'node:fs/promises';
import os from 'node:os';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { projectPortableLineageMaintenance } from '../src/tooling/portable/lineage/lineage.maintenance.projection.js';
import { applyPortableLineageMaintenancePlan } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';

const method='sha256-base64url-c14n-v2';
function artifact({path:artifactPath,title,parent=null}){
  const rel=parent?path.posix.relative(path.posix.dirname(artifactPath),parent.path):'';
  const parentBlock=parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${path.posix.basename(parent.path)}](${rel})\n  - Origin:\n    - [relative](${rel})\n`:'';
  const parentIntegrity=parent?`- ${method}\n  - Towards: [${path.posix.basename(parent.path)}](${rel})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:'';
  const md=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parentBlock}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n## Objective\n\n${title}.\n\n---\n\n# Continuity Integrity\n\n${parentIntegrity}- ${method}\n  - Towards: self\n  - Value: `;
  return {workspaceId:'fixture',path:artifactPath,markdown:sealC14nV2Self(md).markdown+'\n'};
}
async function materialize(root, materials){for(const item of materials){const target=path.join(root,item.path);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,item.markdown,'utf8');}}
async function exists(p){try{await access(p);return true}catch{return false}}

test('local apply writes exact projected Move bytes and removes old paths',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-apply-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});const b=artifact({path:'.topics/a/001-1-child.trace.md',title:'Child',parent:a});
    await materialize(root,[a,b]);
    const plan=projectPortableLineageMaintenance({materials:[a,b],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path,b.path],targetDirectory:'.topics/b'}});
    const receipt=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));assert.equal(receipt.applied,true);
    assert.equal(await exists(path.join(root,a.path)),false);assert.equal(await exists(path.join(root,b.path)),false);
    for(const change of plan.changes){const md=await readFile(path.join(root,change.toPath),'utf8');assert.equal(md,change.markdown);assert.equal(canonicalC14nV2SelfState(md).state,'verified');}
  }finally{await rm(root,{recursive:true,force:true});}
});

test('local apply fails closed on input drift without mutating paths',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-drift-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);
    const plan=projectPortableLineageMaintenance({materials:[a],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path],targetDirectory:'.topics/b'}});
    await writeFile(path.join(root,a.path),a.markdown+'drift\n','utf8');
    const receipt=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'blocked');assert.equal(receipt.applied,false);assert.ok(receipt.findings.some(x=>x.code==='lineage-maintenance.apply.input-drift'));
    assert.equal(await exists(path.join(root,a.path)),true);assert.equal(await exists(path.join(root,'.topics/b/001-root.trace.md')),false);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('local apply blocks an unplanned target collision',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-collision-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);
    const plan=projectPortableLineageMaintenance({materials:[a],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path],targetDirectory:'.topics/b'}});
    const collision=path.join(root,'.topics/b/001-root.trace.md');await mkdir(path.dirname(collision),{recursive:true});await writeFile(collision,'unplanned','utf8');
    const receipt=await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'blocked');assert.ok(receipt.findings.some(x=>x.code==='lineage-maintenance.apply.target-collision'));assert.equal(await readFile(collision,'utf8'),'unplanned');
  }finally{await rm(root,{recursive:true,force:true});}
});


test('local apply rejects a tampered projected plan fingerprint before filesystem mutation',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-tamper-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);
    const plan=projectPortableLineageMaintenance({materials:[a],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path],targetDirectory:'.topics/b'}});
    const tampered={...plan,changes:plan.changes.map((item)=>({...item,toPath:'.topics/b/009-tampered.trace.md'}))};
    const receipt=await applyPortableLineageMaintenancePlan(tampered,{workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'blocked');assert.equal(receipt.applied,false);
    assert.ok(receipt.findings.some((item)=>item.code==='lineage-maintenance.apply.plan-fingerprint-mismatch'));
    assert.equal(await exists(path.join(root,a.path)),true);
    assert.equal(await exists(path.join(root,'.topics/b/009-tampered.trace.md')),false);
  }finally{await rm(root,{recursive:true,force:true});}
});
