import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCommonAuthorCli } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const TASK = `# Check Publication Boundary\n\n## Objective\n\nTest a bounded schema publication authoring flow.\n\n## Done Criteria\n\nThe comparison is reported without any remote changes.\n\n## Dependencies\n\nNone for this isolated test.\n\n## Scope\n\nLocal scratch workspace only.`;
const EVIDENCE = `# Schema Publication Evidence\n\n## Supported Claim Or Question\n\n- Supported Claim Or Question: Does the Parent use exact current registered Task schema authority?\n- Evidence Role: Local synthetic exact-schema comparison only.\n\n## Provenance\n\n- Known Source: isolated Task created and sealed by the same author operation.\n- Preservation Basis: the exact test Task bytes are preserved in this temporary Workspace.\n- Provenance Limits: simulated local source only.\n\n## Evidence Material\n\n- parent-task\n  - Material: exact local Task artifact in the temporary Workspace.\n  - Material Kind: qualified local Markdown artifact\n  - Description: Current Schema and integrity of the Task Parent are the focus of the comparison.\n\n## Preservation And Fidelity\n\n- Preservation State: exact local bytes held in the temporary Workspace during this test.\n- Fidelity Notes: the Task is read directly from the local original file.\n- Known Losses: none in the local comparison; no remote proof is implied.\n\n## Interpretation Limits\n\n- Does Not Prove: published authority beyond the loaded current registered Task material.\n- Must Not Be Treated As: remote authorization or historical schema promotion.\n- Not Yet Used As: release evidence outside this isolated test.`;

async function author(workspace, body, opts={}) {
  const bodyFile=path.join(workspace, `${opts.schema.replaceAll('.','-')}-${opts.name}.body.md`);
  await writeFile(bodyFile, body, 'utf8');
  return runCommonAuthorCli({flags:{workspace,schema:opts.schema,path:`.topics/work/publication/${opts.name}.trace.md`,body:bodyFile,title:opts.name,summary:`Bounded ${opts.name} test`,authors:'Anchor',...(opts.parent?{parent:opts.parent}:{}) ,...(opts.preflight?{preflight:true}:{})}}, {});
}

test('a qualified Task Parent permits Evidence child without comparing against the Evidence schema', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-schema-parent-'));
  try {
    const t=await author(dir,TASK,{schema:'tiinex.task.v1',name:'001-task'});
    assert.equal(t.status,'qualified',JSON.stringify(t.actionableFindings));
    const e=await author(dir,EVIDENCE,{schema:'tiinex.evidence.v1',name:'001-1-evidence',parent:'.topics/work/publication/001-task.trace.md',preflight:true});
    assert.equal(e.status,'qualified-preflight',JSON.stringify(e.actionableFindings));
    assert.equal(e.findingSummary.counts.error,0);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('a Parent with a different unqualified schema revision still fails closed',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-schema-parent-negative-'));
  try {
    const t=await author(dir,TASK,{schema:'tiinex.task.v1',name:'001-task'});
    assert.equal(t.status,'qualified');
    const parent=path.join(dir,'.topics/work/publication/001-task.trace.md');
    const original=await readFile(parent,'utf8');
    const changed=original.replace(/(Current Schema: \[tiinex\.task\.v1\]\(https:\/\/github\.com\/Tiinex\/docs\/blob\/)[0-9a-f]{40}(\/\.topics\/\.schemas\/core\/task\/tiinex\.task\.v1\.schema\.md\))/, '$1'+ '1111111111111111111111111111111111111111' +'$2');
    assert.notEqual(changed,original);
    const sealed=sealC14nV2Self(changed);
    assert.ok(['sealed','unchanged'].includes(sealed.state));
    await writeFile(parent,sealed.markdown,'utf8');
    await assert.rejects(
      author(dir,EVIDENCE,{schema:'tiinex.evidence.v1',name:'001-1-evidence',parent:'.topics/work/publication/001-task.trace.md',preflight:true}),
      /portable\.cli\.author\.parent\.schema-revision-unqualified/
    );
  } finally {await rm(dir,{recursive:true,force:true});}
});
