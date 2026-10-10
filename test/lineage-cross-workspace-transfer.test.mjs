import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { mkdtemp,mkdir,readFile,writeFile,rm,access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { inspectPortableCrossWorkspaceStandaloneTransfer, applyPortableCrossWorkspaceStandaloneTransfer, recoverPortableCrossWorkspaceTransfer } from '../src/tooling/portable/adapters/node/lineage.crossWorkspace.transfer.js';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(repo,'tools/tiinex-portable.mjs');
const selected='.topics/source/008-artifact.trace.md',anchor='.topics/target/002-anchor.trace.md';
const markdown=name=>sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
const exists=async p=>{try{await access(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
async function setup(t){
 const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-cross-apply-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const source=path.join(root,'source'),target=path.join(root,'target');
 await mkdir(path.join(source,'.topics/source'),{recursive:true});await mkdir(path.join(target,'.topics/target'),{recursive:true});
 await writeFile(path.join(source,selected),markdown('standalone source'));await writeFile(path.join(target,anchor),markdown('existing target'));
 const request={sourceWorkspace:{workspaceId:'source',workspaceRoot:source},targetWorkspace:{workspaceId:'target',workspaceRoot:target},operation:{kind:'scoped-move',workspaceId:'source',targetWorkspaceId:'target',selectedPath:selected,targetPath:anchor,scope:'alone',placement:'same',parentPolicy:'keep'}};
 return {root,source,target,request,sourceFile:path.join(source,selected)};
}
test('standalone cross-root PLAN and APPLY physically move verified artifact and preserve unchanged anchor',async t=>{
 const x=await setup(t);const before=await readFile(x.sourceFile);
 const planned=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);
 assert.equal(planned.status,'ready',JSON.stringify(planned.findings));assert.equal(planned.move.toPath,'.topics/target/003-artifact.trace.md');
 const dst=path.join(x.target,planned.move.toPath);
 const receipt=await applyPortableCrossWorkspaceStandaloneTransfer(planned);
 assert.equal(receipt.status,'ready',JSON.stringify(receipt));assert.equal(receipt.applied,true);
 assert.deepEqual(await readFile(dst),before);assert.equal(await exists(x.sourceFile),false);
 assert.equal(canonicalC14nV2SelfState((await readFile(dst)).toString()).state,'verified');
 assert.equal(await exists(path.join(x.source,'.tiinex/lineage-maintenance.lock')),false);
 assert.equal(await exists(path.join(x.target,'.tiinex/lineage-maintenance.lock')),false);
 const replay=await applyPortableCrossWorkspaceStandaloneTransfer(planned);assert.equal(replay.status,'blocked');
});
test('two-Workspace snapshot drift and incoming references fail closed without mutation',async t=>{
 const x=await setup(t);const planned=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);assert.equal(planned.status,'ready');
 await mkdir(path.join(x.target,'.topics/notes'),{recursive:true});await writeFile(path.join(x.target,'.topics/notes/unrelated.md'),'Added after preview');
 const refused=await applyPortableCrossWorkspaceStandaloneTransfer(planned);assert.equal(refused.status,'blocked');
 assert.ok(await exists(x.sourceFile));assert.equal(await exists(path.join(x.target,planned.move.toPath)),false);
 await writeFile(path.join(x.target,'.topics/notes/unrelated.md'),`[read](source::${selected})`);
 const inbound=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);assert.equal(inbound.status,'blocked');
 assert.equal(inbound.findings[0].code,'cross-workspace.transfer.references-or-parent');
});
test('asset selection, dynamic local links and unsupported source formats remain BLOCK',async t=>{
 const x=await setup(t);
 await writeFile(path.join(x.source,'.topics/source/008-photo.png'),Buffer.from([137,80,78,71]));
 const attempt=await inspectPortableCrossWorkspaceStandaloneTransfer({...x.request,operation:{...x.request.operation,scope:'alone-with-assets'}});
 assert.equal(attempt.status,'blocked');assert.equal(attempt.findings[0].code,'cross-workspace.transfer.operation-not-in-subset');
 await writeFile(path.join(x.target,'.topics/target/code.ts'),'const path = `${name}.trace.md`;');
 const dynamic=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);assert.equal(dynamic.status,'blocked');
 assert.equal(dynamic.findings[0].code,'cross-workspace.transfer.dynamic-reference-surface');
});
test('interrupted operation rolls back both root journals and restores source bytes',async t=>{
 const x=await setup(t);const original=await readFile(x.sourceFile);
 const plan=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);assert.equal(plan.status,'ready');
 const failure=await applyPortableCrossWorkspaceStandaloneTransfer(plan,{onPhase:async({phase})=>{if(phase==='outputs-promoted')throw Error('fault-injected-after-target-promotion');}});
 assert.equal(failure.status,'blocked');assert.equal(failure.rollback?.status,'ready',JSON.stringify(failure));
 assert.deepEqual(await readFile(x.sourceFile),original);assert.equal(await exists(path.join(x.target,plan.move.toPath)),false);
 assert.equal(await exists(path.join(x.source,'.tiinex/lineage-maintenance.lock')),false);
 assert.equal(await exists(path.join(x.target,'.tiinex/lineage-maintenance.lock')),false);
});
test('Core CLI runs PLAN→APPLY independent of VS Code and blocks tampered destination',async t=>{
 const x=await setup(t),rq=path.join(x.root,'request.json'),pp=path.join(x.root,'plan.json');
 await writeFile(rq,JSON.stringify(x.request));
 function call(...params){const result=spawnSync(process.execPath,[cli,...params,'--compact'],{cwd:repo,encoding:'utf8',timeout:50000});assert.ok(result.stdout.startsWith('{'),result.stderr);return {code:result.status,...JSON.parse(result.stdout)};}
 const plan=call('plan-cross-workspace-standalone','--request',rq);
 assert.equal(plan.code,0,JSON.stringify(plan.findings));assert.equal(plan.status,'ready');
 await writeFile(pp,JSON.stringify(plan));
 const applied=call('apply-cross-workspace-standalone','--plan',pp);assert.equal(applied.code,0,JSON.stringify(applied.findings));
 assert.deepEqual((await readFile(path.join(x.target,plan.move.toPath))),Buffer.from(markdown('standalone source')));
 const replay=call('apply-cross-workspace-standalone','--plan',pp);assert.equal(replay.code,2);assert.equal(replay.status,'blocked');
});
test('forged inspection and recomputed unkeyed fingerprint cannot bypass incoming reader discovery',async t=>{
 const x=await setup(t);
 const legit=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);
 assert.equal(legit.status,'ready');
 await mkdir(path.join(x.target,'.topics/notes'),{recursive:true});
 await writeFile(path.join(x.target,'.topics/notes/reader.md'),`[incoming](source::${selected})`);
 // Even if the caller updates the JSON inspection and re-signs its own
 // unkeyed digest, Apply independently reruns Core's real file inspection.
 const bad=await applyPortableCrossWorkspaceStandaloneTransfer(legit);
 assert.equal(bad.status,'blocked');assert.equal(bad.findings[0].code,'cross-workspace.transfer.inspection-proof-drift');
 assert.equal(await exists(x.sourceFile),true);
});
test('crash after destructive staging is recoverable by manual CLI across both roots',async t=>{
 const x=await setup(t);
 const original=await readFile(x.sourceFile);
 const plan=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);assert.equal(plan.status,'ready');
 const script=`import { applyPortableCrossWorkspaceStandaloneTransfer } from ${JSON.stringify(new URL('../src/tooling/portable/adapters/node/lineage.crossWorkspace.transfer.js',import.meta.url).href)};
   const plan=JSON.parse(process.env.TIINEX_CROSS_PLAN);
   await applyPortableCrossWorkspaceStandaloneTransfer(plan,{onPhase:async({phase})=>{if(phase==='outputs-promoted')process.kill(process.pid,'SIGKILL')}});`;
 const killed=spawnSync(process.execPath,['--input-type=module','--eval',script],{cwd:repo,env:{...process.env,TIINEX_CROSS_PLAN:JSON.stringify(plan)},encoding:'utf8',timeout:30000});
 assert.equal(killed.signal,'SIGKILL',killed.stderr);
 const txDir=path.join(x.source,'.tiinex/cross-workspace-transfers');
 const {readdir}=await import('node:fs/promises');const ids=await readdir(txDir);
 assert.equal(ids.length,1);const tx=ids[0];
 const journal=JSON.parse(await readFile(path.join(txDir,tx,'journal.json'),'utf8'));
 assert.equal(journal.phase,'outputs-promoted');
 assert.equal(await exists(x.sourceFile),false);
 assert.equal(await exists(path.join(x.target,plan.move.toPath)),true);
 // Simulate power loss between journal updates, not just between file writes.
 const targetJournal=path.join(x.target,'.tiinex/cross-workspace-transfers',tx,'journal.json');
 const second=JSON.parse(await readFile(targetJournal,'utf8'));
 second.phase='sources-staged';await writeFile(targetJournal,JSON.stringify(second));
 const rq=path.join(x.root,'recovery.json');await writeFile(rq,JSON.stringify({transactionId:tx,sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace}));
 const receipt=spawnSync(process.execPath,[cli,'recover-cross-workspace-standalone','--request',rq,'--compact'],{cwd:repo,encoding:'utf8',timeout:45000});
 assert.equal(receipt.status,0,receipt.stderr||receipt.stdout);
 const outcome=JSON.parse(receipt.stdout);assert.equal(outcome.disposition,'rolled-back');
 assert.deepEqual(await readFile(x.sourceFile),original);
 assert.equal(await exists(path.join(x.target,plan.move.toPath)),false);
 assert.equal(await exists(path.join(x.source,'.tiinex/lineage-maintenance.lock')),false);
 assert.equal(await exists(path.join(x.target,'.tiinex/lineage-maintenance.lock')),false);
});

test('new target incoming reference during source staging aborts and restores original source',async t=>{
 const x=await setup(t);const original=await readFile(x.sourceFile);
 const plan=await inspectPortableCrossWorkspaceStandaloneTransfer(x.request);assert.equal(plan.status,'ready');
 const failure=await applyPortableCrossWorkspaceStandaloneTransfer(plan,{onPhase:async({phase})=>{
   if(phase==='sources-staged'){
     await mkdir(path.join(x.target,'.topics/notes'),{recursive:true});
     await writeFile(path.join(x.target,'.topics/notes/new.md'),`[late](source::${selected})`);
   }
 }});
 assert.equal(failure.status,'blocked');assert.equal(failure.rollback?.status,'ready',JSON.stringify(failure));
 assert.deepEqual(await readFile(x.sourceFile),original);
 assert.equal(await exists(path.join(x.target,plan.move.toPath)),false);
});
