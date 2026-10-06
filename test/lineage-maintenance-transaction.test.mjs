import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { mkdtemp, mkdir, readFile, writeFile, access, rm, readdir } from 'node:fs/promises';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { projectPortableLineageMaintenance } from '../src/tooling/portable/lineage/lineage.maintenance.projection.js';
import { applyPortableLineageMaintenancePlan } from '../src/tooling/portable/adapters/node/lineage.maintenance.apply.js';
import { recoverPortableLineageMaintenanceTransactions } from '../src/tooling/portable/adapters/node/lineage.maintenance.transaction.js';
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';

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
function planFor(a){return projectPortableLineageMaintenance({representationCoverage:'complete',materials:[a],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path],targetDirectory:'.topics/b'}})}

async function crashApply(root, plan, phase){
  const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-crash-run-'));
  const planPath=path.join(dir,'plan.json');await writeFile(planPath,JSON.stringify(plan),'utf8');
  const moduleUrl=pathToFileURL(path.resolve('src/tooling/portable/adapters/node/lineage.maintenance.apply.js')).href;
  const script=`import {readFile} from 'node:fs/promises';import {applyPortableLineageMaintenancePlan} from ${JSON.stringify(moduleUrl)};const plan=JSON.parse(await readFile(process.env.PLAN,'utf8'));await applyPortableLineageMaintenancePlan(plan,{workspaceRoots:{fixture:process.env.ROOT},onPhase:async({phase})=>{if(phase===process.env.PHASE)process.exit(77);}});process.exit(0);`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:path.resolve('.'),env:{...process.env,PLAN:planPath,ROOT:root,PHASE:phase},encoding:'utf8'});
  await rm(dir,{recursive:true,force:true});
  return result;
}

test('cooperative Workspace lock blocks a second lineage-maintenance apply',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-lock-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);
    const tiinex=path.join(root,'.tiinex');await mkdir(tiinex,{recursive:true});
    await writeFile(path.join(tiinex,'lineage-maintenance.lock'),JSON.stringify({schema:'tiinex.portable.lineage-maintenance-lock.v1',transactionId:'other',planFingerprint:'x',workspaceId:'fixture',pid:process.pid,hostname:os.hostname()})+'\n','utf8');
    const receipt=await applyPortableLineageMaintenancePlan(planFor(a),{workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'blocked');
    assert.ok(receipt.findings.some((item)=>item.code==='lineage-maintenance.apply.workspace-lock-held'));
    assert.equal(await exists(path.join(root,a.path)),true);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('explicit recovery rolls back a process death after atomic source backup',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-crash-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);const plan=planFor(a);
    const child=await crashApply(root,plan,'sources-staged');
    assert.equal(child.status,77,child.stderr);
    assert.equal(await exists(path.join(root,a.path)),false);
    assert.equal(await exists(path.join(root,'.topics/b/001-root.trace.md')),false);
    assert.equal(await exists(path.join(root,'.tiinex/lineage-maintenance.lock')),true);
    const receipt=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));
    assert.equal(receipt.transactions[0].disposition,'rolled-back');
    assert.equal(await readFile(path.join(root,a.path),'utf8'),a.markdown);
    assert.equal(await exists(path.join(root,'.topics/b/001-root.trace.md')),false);
    assert.equal(await exists(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('recovery finalizes a durably committed transaction after process death without rolling it back',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-commit-crash-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);const plan=planFor(a);
    const child=await crashApply(root,plan,'committed');
    assert.equal(child.status,77,child.stderr);
    const target=path.join(root,'.topics/b/001-root.trace.md');
    assert.equal(await exists(path.join(root,a.path)),false);assert.equal(await exists(target),true);
    const expected=plan.changes[0].markdown;assert.equal(await readFile(target,'utf8'),expected);
    const receipt=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));
    assert.equal(receipt.transactions[0].disposition,'finalized-commit');
    assert.equal(await exists(path.join(root,a.path)),false);assert.equal(await readFile(target,'utf8'),expected);
    assert.equal(await exists(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('recovery fails closed and preserves unexpected concurrent target bytes',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-recovery-conflict-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);const plan=planFor(a);
    const child=await crashApply(root,plan,'sources-staged');assert.equal(child.status,77,child.stderr);
    const target=path.join(root,'.topics/b/001-root.trace.md');await mkdir(path.dirname(target),{recursive:true});await writeFile(target,'external-writer\n','utf8');
    const blocked=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{fixture:root}});
    assert.equal(blocked.status,'blocked');
    assert.ok(blocked.findings.some((item)=>item.code==='lineage-maintenance.recovery.path-conflict'));
    assert.equal(await readFile(target,'utf8'),'external-writer\n');
    assert.equal(await exists(path.join(root,a.path)),false);
    await rm(target,{force:true});
    const recovered=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{fixture:root}});
    assert.equal(recovered.status,'ready',JSON.stringify(recovered.findings));
    assert.equal(await readFile(path.join(root,a.path),'utf8'),a.markdown);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('recovery removes a dead orphan lock created before a transaction journal existed',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-orphan-lock-'));
  try{
    const tiinex=path.join(root,'.tiinex');await mkdir(tiinex,{recursive:true});
    await writeFile(path.join(tiinex,'lineage-maintenance.lock'),JSON.stringify({schema:'tiinex.portable.lineage-maintenance-lock.v1',transactionId:'orphan',workspaceId:'fixture',pid:2147483647,hostname:os.hostname()})+'\n','utf8');
    const receipt=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'ready');assert.equal(receipt.orphanLocksRemoved,1);
    assert.equal(await exists(path.join(tiinex,'lineage-maintenance.lock')),false);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('recovery does not clear a lock owned by an unverifiable foreign host',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-foreign-lock-'));
  try{
    const tiinex=path.join(root,'.tiinex');await mkdir(tiinex,{recursive:true});
    const lockPath=path.join(tiinex,'lineage-maintenance.lock');
    await writeFile(lockPath,JSON.stringify({schema:'tiinex.portable.lineage-maintenance-lock.v1',transactionId:'foreign',workspaceId:'fixture',pid:123,hostname:'other-host.example'})+'\n','utf8');
    const receipt=await recoverPortableLineageMaintenanceTransactions({workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'blocked');
    assert.ok(receipt.findings.some((item)=>item.code==='lineage-maintenance.recovery.lock-owner-unverifiable'));
    assert.equal(await exists(lockPath),true);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('CLI recover-lineage-maintenance exposes explicit local crash recovery',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-cli-recovery-'));
  try{
    const output=[];const errors=[];
    const code=await runPortableCli(['recover-lineage-maintenance','--workspace-id','fixture','--workspace-root',root,'--compact'],{log:(value)=>output.push(String(value)),error:(value)=>errors.push(String(value))});
    assert.equal(code,0,errors.join('\n'));
    const receipt=JSON.parse(output.at(-1));
    assert.equal(receipt.status,'ready');
    assert.equal(receipt.boundary.recoveryOnly,true);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('successful apply removes transaction journal and Workspace lock',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-lineage-cleanup-'));
  try{
    const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});await materialize(root,[a]);
    const receipt=await applyPortableLineageMaintenancePlan(planFor(a),{workspaceRoots:{fixture:root}});
    assert.equal(receipt.status,'ready',JSON.stringify(receipt.findings));
    assert.equal(receipt.boundary.cooperativeWorkspaceLocking,true);assert.equal(receipt.boundary.durableTransactionJournal,true);assert.equal(receipt.boundary.crashRecovery,true);
    assert.equal(await exists(path.join(root,'.tiinex/lineage-maintenance.lock')),false);
    const txBase=path.join(root,'.tiinex/lineage-maintenance-transactions');
    const names=await readdir(txBase).catch(()=>[]);assert.deepEqual(names,[]);
  }finally{await rm(root,{recursive:true,force:true});}
});
