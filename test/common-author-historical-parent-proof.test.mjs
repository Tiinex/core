import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,stat} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runCommonAuthorCli} from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import {sealC14nV2Self} from '../src/integrity/integrity.c14nV2.js';
import {inspectPortableHistoricalSchemaSource} from '../src/tooling/portable/schema/schema.historicalSource.inspect.js';
import {PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID} from '../src/tooling/portable/host/tool.bindings.js';
import {schemaMarkdown} from '../src/schemas/registry.js';

const commit='e33bd7ebea209203f8ea41e966ec7b51d1c27f1c';
const sourcePath='.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const historicalLocator=`https://github.com/Tiinex/docs/blob/${commit}/${sourcePath}`;
const taskBody='# Work to preserve\n\n## Objective\n\nCompare an exact historical schema proof before authoring.\n\n## Done Criteria\n\nPreflight must pass only with an accepted byte-equivalent source.\n\n## Dependencies\n\nAn exact historical Parent proof.\n\n## Scope\n\nScratch workspace only.';
const evidenceBody=`# Source Evidence\n\n## Supported Claim Or Question\n\n- Supported Claim Or Question: Is the historical Parent source qualified?\n- Evidence Role: Synthetic test fixture only.\n\n## Provenance\n\n- Known Source: local synthetic tests\n- Preservation Basis: temporary files\n- Provenance Limits: no real remote provider receipt\n\n## Evidence Material\n\n- test\n  - Material: exact synthetic local Parent\n  - Material Kind: Markdown\n  - Description: Parent schema provenance fixture\n\n## Preservation And Fidelity\n\n- Preservation State: local temporary workspace\n- Fidelity Notes: exact bytes\n- Known Losses: none\n\n## Interpretation Limits\n\n- Does Not Prove: publication or real GitHub authority\n- Must Not Be Treated As: runtime production receipt\n- Not Yet Used As: public authority`;
const parentRel='.topics/work/example/001-task.trace.md';
const childRel='.topics/work/example/001-1-evidence.trace.md';
const tool={id:'github-test-fixture',name:'GitHub fetch fixture',description:'Synthetic read in regression only'};
function proof(markdown,content=schemaMarkdown('tiinex.task.v1')) {
  const inspected=inspectPortableHistoricalSchemaSource({markdown,availableTools:[tool]});
  assert.equal(inspected.status,'unresolved');
  const step=inspected.hostAction.steps[0];
  return {availableTools:[tool],hostPlan:inspected.hostAction,hostReceipt:{
    schema:PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,actionId:inspected.hostAction.actionId,action:inspected.hostAction.action,
    steps:[{stepId:step.stepId,toolId:tool.id,status:'completed',normalized:{files:[{path:sourcePath,content,source:{repository:'Tiinex/docs',ref:commit,commit,path:sourcePath}}]}}]
  }};
}
async function fixture(t) {
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-author-historical-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const body=path.join(root,'task-body.md');await writeFile(body,taskBody);
  assert.equal((await runCommonAuthorCli({flags:{workspace:root,schema:'tiinex.task.v1',path:parentRel,body,authors:'Fixture'}},{})).status,'qualified');
  const parent=path.join(root,parentRel);
  const original=await readFile(parent,'utf8');
  const changed=original.replace(/- Current Schema: \[tiinex\.task\.v1\]\([^)]+\)/,`- Current Schema: [tiinex.task.v1](${historicalLocator})`);
  assert.notEqual(changed,original);
  const markdown=sealC14nV2Self(changed).markdown;
  await writeFile(parent,markdown);
  const eBody=path.join(root,'evidence-body.md');await writeFile(eBody,evidenceBody);
  const flags={workspace:root,schema:'tiinex.evidence.v1',path:childRel,body:eBody,parent:parentRel,authors:'Fixture',preflight:true};
  return {root,markdown,flags};
}
test('common author uses accepted historical schema read proof and retains pinned Parent reference',async t=>{
  const x=await fixture(t);const proofFile=path.join(x.root,'proof.json');await writeFile(proofFile,JSON.stringify(proof(x.markdown)));
  const r=await runCommonAuthorCli({flags:{...x.flags,'historical-parent-proof':proofFile}},{});
  assert.equal(r.status,'qualified-preflight',JSON.stringify(r.actionableFindings));
  assert.equal(r.findingSummary.counts.error,0);
  assert.equal(r.artifact.parentSchemaReferenceAuthority.target,historicalLocator);
  await assert.rejects(stat(path.join(x.root,childRel)),{code:'ENOENT'});
});
test('common author blocks unproved and distinct historical schema without leaving an artifact',async t=>{
  const x=await fixture(t);
  await assert.rejects(runCommonAuthorCli({flags:x.flags},{}),/schema-revision-unqualified/);
  const proofFile=path.join(x.root,'proof.json');
  const incomplete=proof(x.markdown);delete incomplete.hostReceipt;
  await writeFile(proofFile,JSON.stringify(incomplete));
  await assert.rejects(runCommonAuthorCli({flags:{...x.flags,'historical-parent-proof':proofFile}},{}),/historical-parent-proof\.unqualified/);
  await writeFile(proofFile,JSON.stringify(proof(x.markdown,schemaMarkdown('tiinex.task.v1')+'\nchanged')));
  await assert.rejects(runCommonAuthorCli({flags:{...x.flags,'historical-parent-proof':proofFile}},{}),/historical-parent-proof\.unqualified/);
  await assert.rejects(stat(path.join(x.root,childRel)),{code:'ENOENT'});
});
