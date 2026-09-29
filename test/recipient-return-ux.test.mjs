import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPrepareReturnCli } from '../src/tooling/portable/adapters/cli/cli.prepare-return.js';
import { runQualifyReturnCli } from '../src/tooling/portable/adapters/cli/cli.qualify-return.js';
import { runCommonAuthorCli } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const anchorRef='https://github.com/Tiinex/business/blob/a66906eef7f0033eb12893f92910336f82d01afa/.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md';
const sigmaRef='https://github.com/Tiinex/business/blob/a66906eef7f0033eb12893f92910336f82d01afa/.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md';
const exactRuntime=Object.freeze({commandInvocation:Object.freeze({executable:'/usr/bin/node',entrypoint:'/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs'})});

function incomingHandoff(){
  const unsigned=`# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-24 19:00:00
  - Authors: Anchor
  - Summary: Anchor To Anchor — Work
  - Status: ready/local

---

# Anchor To Anchor — Work

## Handoff Parties

- Purpose: do bounded work
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](${anchorRef})
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](${anchorRef})

## Transfers

- work
  - Transfer Kind: work-and-responsibility
  - Description: bounded

## Required Context

- none

## Reference Context

- none

## Retained Responsibilities

- none

## Exclusions And Dependencies

- none

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return result
- Return To: Sigma
- Return To Reference: [Sigma Role](${sigmaRef})

## Interpretation Limits

- Does Not Mean: acceptance
- Must Not Be Used To Claim: publication

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: pending`;
  const sealed=sealC14nV2Self(unsigned);
  assert.equal(sealed.state,'sealed');
  return `${sealed.markdown}\n`;
}

async function fixture(){
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-return-ux-'));
  await mkdir(path.join(root,'.tiinex'),{recursive:true});
  await mkdir(path.join(root,'.topics','handoffs'),{recursive:true});
  const incoming='.topics/handoffs/002-anchor-to-anchor.trace.md';
  await writeFile(path.join(root,incoming),incomingHandoff(),'utf8');
  await writeFile(path.join(root,'.tiinex','continuation.json'),JSON.stringify({schema:'tiinex.portable.ground-continuation-state.v1',version:1,selectedHandoffPath:incoming,selectedRouteId:'fixture-route',roleLabel:'Anchor'},null,2));
  await writeFile(path.join(root,'result.txt'),'bounded-result\n','utf8');
  await writeFile(path.join(root,'expected.txt'),'bounded-result\n','utf8');
  await runQualifyReturnCli({positionals:[root],flags:{result:'result.txt',expected:'expected.txt'}});
  return {root,incoming};
}

test('prepare-return fails closed until a separate exact-result return transition is qualified',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-return-gate-'));
  await mkdir(path.join(root,'.tiinex'),{recursive:true});
  await mkdir(path.join(root,'.topics','handoffs'),{recursive:true});
  const incoming='.topics/handoffs/002-anchor-to-anchor.trace.md';
  await writeFile(path.join(root,incoming),incomingHandoff(),'utf8');
  await writeFile(path.join(root,'.tiinex','continuation.json'),JSON.stringify({schema:'tiinex.portable.ground-continuation-state.v1',version:1,selectedHandoffPath:incoming,selectedRouteId:'fixture-route',roleLabel:'Anchor'},null,2));
  await writeFile(path.join(root,'result.txt'),'bounded-result\n','utf8');
  await writeFile(path.join(root,'expected.txt'),'bounded-result\n','utf8');
  await assert.rejects(runPrepareReturnCli({positionals:[root],flags:{}}),/return-transition\.required/);
  const qualified=await runQualifyReturnCli({positionals:[root],flags:{result:'result.txt',expected:'expected.txt'}},exactRuntime);
  assert.equal(qualified.status,'qualified');
  assert.equal(qualified.transition.state,'qualified');
  assert.equal(qualified.transition.result.path,'result.txt');
  assert.equal(qualified.nextAction.cli, '/usr/bin/node /tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs prepare-return '+root);
  assert.equal(qualified.nextAction.invocation.entrypoint, '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs');
  const prepared=await runPrepareReturnCli({positionals:[root],flags:{}});
  assert.equal(prepared.returnTransition.state,'qualified');
});

test('qualify-return rejects mismatched result bytes and prepare-return rejects a stale qualified result',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-return-stale-'));
  await mkdir(path.join(root,'.tiinex'),{recursive:true});
  await mkdir(path.join(root,'.topics','handoffs'),{recursive:true});
  const incoming='.topics/handoffs/002-anchor-to-anchor.trace.md';
  await writeFile(path.join(root,incoming),incomingHandoff(),'utf8');
  await writeFile(path.join(root,'.tiinex','continuation.json'),JSON.stringify({schema:'tiinex.portable.ground-continuation-state.v1',version:1,selectedHandoffPath:incoming,selectedRouteId:'fixture-route',roleLabel:'Anchor'},null,2));
  await writeFile(path.join(root,'result.txt'),'wrong\n','utf8');
  await writeFile(path.join(root,'expected.txt'),'right\n','utf8');
  await assert.rejects(runQualifyReturnCli({positionals:[root],flags:{result:'result.txt',expected:'expected.txt'}}),/result-byte-verification\.failed/);
  await writeFile(path.join(root,'result.txt'),'right\n','utf8');
  await runQualifyReturnCli({positionals:[root],flags:{result:'result.txt',expected:'expected.txt'}});
  await writeFile(path.join(root,'result.txt'),'changed-after-qualification\n','utf8');
  await assert.rejects(runPrepareReturnCli({positionals:[root],flags:{}}),/return-transition\.result-stale/);
});

test('prepare-return derives exact return endpoints and writes only an incomplete runtime scaffold',async()=>{
  const {root}=await fixture();
  const result=await runPrepareReturnCli({positionals:[root],flags:{}},exactRuntime);
  assert.equal(result.status,'ready');
  assert.equal(result.workspace.state,'writable-local-continuation');
  assert.equal(result.workspace.writable,true);
  assert.equal(result.workspace.sourceSnapshot,'immutable-qualified-carried-input');
  assert.equal(result.authority.from,'Anchor');
  assert.equal(result.authority.fromReference,anchorRef);
  assert.equal(result.authority.to,'Sigma');
  assert.equal(result.authority.toReference,sigmaRef);
  assert.equal(result.scaffold.workspaceRelativePath,'.tiinex/return-handoff.body.md');
  assert.equal(result.scaffold.state,'runtime-only-incomplete-return-body');
  const body=await readFile(result.scaffold.path,'utf8');
  assert.match(body,/From: Anchor/);
  assert.match(body,/To: Sigma/);
  assert.match(body,/<<TIINEX_REQUIRED:RETURN_PURPOSE>>/);
  assert.equal(result.authority.currentWorkControlReference,'002-anchor-to-anchor.trace.md');
  assert.equal(result.authority.currentWorkControl.state,'selected-source-handoff-preserved');
  assert.equal(result.authority.returnedMaterialReference,'../../result.txt');
  assert.equal(result.returnTransition.state,'qualified');
  assert.match(body,/Controlling Artifact: \[selected source Handoff\]\(002-anchor-to-anchor\.trace\.md\)/);
  assert.match(body,/Material Reference: \[returned work\]\(\.\.\/\.\.\/result\.txt\)/);
  assert.match(body,/Retained By: <<TIINEX_REQUIRED:RETAINED_BY>>/);
  assert.match(body,/Retained By Reference: \[retained role\]\(<<TIINEX_REQUIRED:RETAINED_BY_REFERENCE>>\)/);
  assert.deepEqual(result.fieldDomains.exclusionKind,['excluded-scope','unresolved-dependency']);
  assert.deepEqual(result.fieldDomains.signalKind,['acknowledgement','result','disposition','return','none','custom','unknown']);
  assert.match(body,/Allowed Kind values: excluded-scope \| unresolved-dependency/);
  assert.match(body,/Allowed Signal Kind values: acknowledgement \| result \| disposition \| return \| none \| custom \| unknown/);
  assert.match(body,/Kind: <<TIINEX_REQUIRED:EXCLUSION_KIND>>/);
  assert.match(body,/Responsible Party Or Role: <<TIINEX_REQUIRED:EXCLUSION_RESPONSIBLE_PARTY>>/);
  assert.match(body,/Return To: Sigma/);
  assert.doesNotMatch(body,/COMPLETION_RETURN_TO/);
  assert.match(result.nextAction.author.cli,/^\/usr\/bin\/node \/tmp\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs author /);
  assert.match(result.nextAction.author.cli,/author .* --schema tiinex\.handoff\.v1 --directory \.topics\/handoffs --body .*\.tiinex\/return-handoff\.body\.md/);
  assert.equal(result.nextAction.author.invocation.entrypoint,'/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs');
  assert.match(result.nextAction.manufacture.cli,/^\/usr\/bin\/node \/tmp\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs handoff /);
  assert.equal(result.nextAction.preflight.cli, `${result.nextAction.author.cli} --preflight`);
  assert.equal(result.nextAction.preflight.durableWrite,false);
  assert.equal(result.nextAction.author.sealIntegrity,true);
  assert.equal(result.nextAction.manufacture.canonicalTransport,'one-handoff-package-plus-exact-routing-text');
});



test('prepare-return rebases selected-Handoff workspace-relative endpoint Role references to the return authoring directory without changing semantic targets',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-return-rebase-'));
  await mkdir(path.join(root,'.tiinex'),{recursive:true});
  await mkdir(path.join(root,'.topics','processes','gpt','grounding'),{recursive:true});
  await mkdir(path.join(root,'.topics','handoffs'),{recursive:true});
  const incoming='.topics/processes/gpt/grounding/015-selected.trace.md';
  const localRole='../../../roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md';
  const unsigned=incomingHandoff()
    .replace('- Purpose: do bounded work','- Purpose: preserve frozen bounded work without losing endpoint fields after the letter z')
    .replace('- Signal Meaning: return result','- Signal Meaning: return authorized result after frozen replay')
    .replaceAll(anchorRef,localRole)
    .replaceAll(sigmaRef,localRole)
    .replace(/- Return To: Sigma/,'- Return To: Anchor');
  // Re-seal after changing qualified body bytes.
  const withoutSelf=unsigned.replace(/(- Towards: self\n\s+- Value:)\s+[^\n]*/,'$1 pending');
  const sealed=sealC14nV2Self(withoutSelf);
  assert.equal(sealed.state,'sealed');
  await writeFile(path.join(root,incoming),`${sealed.markdown}\n`,'utf8');
  await writeFile(path.join(root,'.tiinex','continuation.json'),JSON.stringify({schema:'tiinex.portable.ground-continuation-state.v1',version:1,selectedHandoffPath:incoming,selectedRouteId:'fixture-route',roleLabel:'Anchor'},null,2));
  await writeFile(path.join(root,'result.txt'),'bounded-result\n','utf8');
  await writeFile(path.join(root,'expected.txt'),'bounded-result\n','utf8');
  await runQualifyReturnCli({positionals:[root],flags:{result:'result.txt',expected:'expected.txt'}});
  const result=await runPrepareReturnCli({positionals:[root],flags:{}});
  assert.equal(result.authority.fromSourceReference,localRole);
  assert.equal(result.authority.toSourceReference,localRole);
  assert.equal(result.authority.fromReference,'../roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md');
  assert.equal(result.authority.toReference,'../roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md');
  assert.equal(result.authority.currentWorkControlReference,'../processes/gpt/grounding/015-selected.trace.md');
  assert.equal(result.authority.referenceProjection.state,'semantic-target-preserved-for-authored-location');
  const body=await readFile(result.scaffold.path,'utf8');
  assert.match(body,/From Reference: \[Anchor Role\]\(\.\.\/roles\/001-1-1-1-1-1-anchor-canonical-holder-cutover-role\.trace\.md\)/);
  assert.match(body,/To Reference: \[Anchor Role\]\(\.\.\/roles\/001-1-1-1-1-1-anchor-canonical-holder-cutover-role\.trace\.md\)/);
  assert.match(body,/Return To Reference: \[Anchor Role\]\(\.\.\/roles\/001-1-1-1-1-1-anchor-canonical-holder-cutover-role\.trace\.md\)/);
  assert.match(body,/Controlling Artifact: \[selected source Handoff\]\(\.\.\/processes\/gpt\/grounding\/015-selected\.trace\.md\)/);
});

test('common author refuses an unfilled prepare-return scaffold before schema or integrity work',async()=>{
  const {root}=await fixture();
  const prepared=await runPrepareReturnCli({positionals:[root],flags:{}});
  await assert.rejects(
    runCommonAuthorCli({positionals:[root],flags:{workspace:root,schema:'tiinex.handoff.v1',directory:'.topics/handoffs',body:prepared.scaffold.path}},{}),
    /return-scaffold\.incomplete/
  );
});



test('prepared return authority-lock fails closed when recipient edits mechanical return endpoints before preflight',async()=>{
  const {root}=await fixture();
  await writeFile(path.join(root,'review.md'),'# Review\n\nBounded result.\n','utf8');
  const prepared=await runPrepareReturnCli({positionals:[root],flags:{}});
  let body=await readFile(prepared.scaffold.path,'utf8');
  const replacements={
    RETURN_PURPOSE:'return the completed bounded review for Sigma human review',
    TRANSFER_DESCRIPTION:'deliver the completed local review result',
    TRANSFER_BOUNDARY:'local review result only; no remote mutation or acceptance claim',
    RETURNED_MATERIAL:'completed local review',
    RETURNED_MATERIAL_REFERENCE:'../../review.md',
    RETURNED_MATERIAL_PURPOSE:'provide the exact bounded work product',
    RETAINED_BY:'Sigma',
    RETAINED_BY_REFERENCE:sigmaRef,
    RETAINED_RESPONSIBILITY:'perform final human review of the returned local result',
    RETAINED_RESPONSIBILITY_BOUNDARY:'human review does not establish remote mutation or publication authority',
    EXCLUSION_KIND:'excluded-scope',
    EXCLUSION_DESCRIPTION:'no remote mutation, publication, release, merge, or acceptance is claimed',
    EXCLUSION_RESPONSIBLE_PARTY:'Sigma',
    SIGNAL_KIND:'result',
    SIGNAL_MEANING:'deliver the completed bounded local review for final human review',
    DOES_NOT_MEAN:'the local result establishes acceptance, merge, release, publication, or remote landing',
    MUST_NOT_CLAIM:'remote state has been reconciled or published'
  };
  for(const [key,value] of Object.entries(replacements)) body=body.replaceAll(`<<TIINEX_REQUIRED:${key}>>`,value);
  body=body
    .replace(/^# Anchor To Sigma — Return$/m,'# Anchor To Anchor — Return')
    .replace(/^- To: Sigma$/m,'- To: Anchor')
    .replace(`- To Reference: [Sigma Role](${sigmaRef})`,`- To Reference: [Anchor Role](${anchorRef})`)
    .replace(/^- Return To: Sigma$/m,'- Return To: Anchor')
    .replace(`- Return To Reference: [Sigma Role](${sigmaRef})`,`- Return To Reference: [Anchor Role](${anchorRef})`);
  await writeFile(prepared.scaffold.path,body,'utf8');
  await assert.rejects(
    runCommonAuthorCli({positionals:[root],flags:{workspace:root,schema:'tiinex.handoff.v1',directory:'.topics/handoffs',body:prepared.scaffold.path,preflight:true}},{}),
    /return-scaffold\.authority-mismatch:to/
  );
  const entries=await (await import('node:fs/promises')).readdir(path.join(root,'.topics','handoffs'));
  assert.deepEqual(entries,['002-anchor-to-anchor.trace.md']);
  const state=JSON.parse(await readFile(path.join(root,'.tiinex','continuation.json'),'utf8'));
  assert.equal(state.returnHandoffPath,undefined);
});



test('all prepared-return mechanical endpoint coordinates are authority-locked independently',async(t)=>{
  const cases=[
    ['from', (body)=>body.replace(/^- From: Anchor$/m,'- From: Sigma')],
    ['fromReference', (body)=>body.replace(`- From Reference: [Anchor Role](${anchorRef})`,`- From Reference: [Anchor Role](https://example.invalid/wrong-anchor)`)],
    ['to', (body)=>body.replace(/^- To: Sigma$/m,'- To: Anchor')],
    ['toReference', (body)=>body.replace(`- To Reference: [Sigma Role](${sigmaRef})`,`- To Reference: [Sigma Role](https://example.invalid/wrong-sigma)`)],
    ['currentWorkControlReference', (body)=>body.replace('Controlling Artifact: [selected source Handoff](002-anchor-to-anchor.trace.md)','Controlling Artifact: [selected source Handoff](../wrong.trace.md)')],
    ['returnTo', (body)=>body.replace(/^- Return To: Sigma$/m,'- Return To: Anchor')],
    ['returnToReference', (body)=>body.replace(`- Return To Reference: [Sigma Role](${sigmaRef})`,`- Return To Reference: [Sigma Role](https://example.invalid/wrong-sigma-return)`) ],
    ['returnedMaterialReference', (body)=>body.replace('Material Reference: [returned work](../../result.txt)','Material Reference: [returned work](../../wrong.txt)')]
  ];
  for(const [field,mutate] of cases){
    await t.test(field,async()=>{
      const {root}=await fixture();
      await writeFile(path.join(root,'review.md'),'# Review\n\nBounded result.\n','utf8');
      const prepared=await runPrepareReturnCli({positionals:[root],flags:{}});
      let body=await readFile(prepared.scaffold.path,'utf8');
      const replacements={RETURN_PURPOSE:'return bounded review',TRANSFER_DESCRIPTION:'deliver bounded result',TRANSFER_BOUNDARY:'local only',RETURNED_MATERIAL:'review',RETURNED_MATERIAL_REFERENCE:'../../review.md',RETURNED_MATERIAL_PURPOSE:'exact work product',RETAINED_BY:'Sigma',RETAINED_BY_REFERENCE:sigmaRef,RETAINED_RESPONSIBILITY:'human review',RETAINED_RESPONSIBILITY_BOUNDARY:'no remote authority',EXCLUSION_KIND:'excluded-scope',EXCLUSION_DESCRIPTION:'no remote mutation',EXCLUSION_RESPONSIBLE_PARTY:'Anchor',SIGNAL_KIND:'result',SIGNAL_MEANING:'return bounded result',DOES_NOT_MEAN:'acceptance',MUST_NOT_CLAIM:'remote reconciliation'};
      for(const [key,value] of Object.entries(replacements)) body=body.replaceAll(`<<TIINEX_REQUIRED:${key}>>`,value);
      body=mutate(body);
      await writeFile(prepared.scaffold.path,body,'utf8');
      await assert.rejects(
        runCommonAuthorCli({positionals:[root],flags:{workspace:root,schema:'tiinex.handoff.v1',directory:'.topics/handoffs',body:prepared.scaffold.path,preflight:true}},{}),
        new RegExp(`return-scaffold\\.authority-mismatch:${field}`)
      );
    });
  }
});

test('prepared return preflight rejects out-of-domain enum values without durable artifact or continuation mutation',async()=>{
  const {root}=await fixture();
  await writeFile(path.join(root,'review.md'),'# Review\n\nBounded result.\n','utf8');
  const prepared=await runPrepareReturnCli({positionals:[root],flags:{}});
  let body=await readFile(prepared.scaffold.path,'utf8');
  const replacements={
    RETURN_PURPOSE:'return the completed bounded review for Sigma human review',
    TRANSFER_DESCRIPTION:'deliver the completed local review result',
    TRANSFER_BOUNDARY:'local review result only; no remote mutation or acceptance claim',
    RETURNED_MATERIAL:'completed local review',
    RETURNED_MATERIAL_REFERENCE:'../../review.md',
    RETURNED_MATERIAL_PURPOSE:'provide the exact bounded work product',
    RETAINED_BY:'Sigma',
    RETAINED_BY_REFERENCE:sigmaRef,
    RETAINED_RESPONSIBILITY:'perform final human review of the returned local result',
    RETAINED_RESPONSIBILITY_BOUNDARY:'human review does not establish remote mutation or publication authority',
    EXCLUSION_KIND:'not-a-qualified-kind',
    EXCLUSION_DESCRIPTION:'no remote mutation, publication, release, merge, or acceptance is claimed',
    EXCLUSION_RESPONSIBLE_PARTY:'Sigma',
    SIGNAL_KIND:'result',
    SIGNAL_MEANING:'deliver the completed bounded local review for final human review',
    DOES_NOT_MEAN:'the local result establishes acceptance, merge, release, publication, or remote landing',
    MUST_NOT_CLAIM:'remote state has been reconciled or published'
  };
  for(const [key,value] of Object.entries(replacements)) body=body.replaceAll(`<<TIINEX_REQUIRED:${key}>>`,value);
  await writeFile(prepared.scaffold.path,body,'utf8');
  const beforeState=await readFile(path.join(root,'.tiinex','continuation.json'),'utf8');
  const result=await runCommonAuthorCli({positionals:[root],flags:{workspace:root,schema:'tiinex.handoff.v1',directory:'.topics/handoffs',body:prepared.scaffold.path,preflight:true}},{});
  assert.equal(result.status,'blocked');
  assert.ok((result.actionableFindings||[]).some((item)=>/Kind|domain|allowed/i.test(`${item.code} ${item.message}`)));
  assert.equal(await readFile(path.join(root,'.tiinex','continuation.json'),'utf8'),beforeState);
  const entries=await (await import('node:fs/promises')).readdir(path.join(root,'.topics','handoffs'));
  assert.deepEqual(entries,['002-anchor-to-anchor.trace.md']);
});

test('filled prepare-return scaffold can be preflighted through exact author qualification without retaining candidate or mutating continuation state',async()=>{
  const {root}=await fixture();
  await writeFile(path.join(root,'review.md'),'# Review\n\nBounded result.\n','utf8');
  const prepared=await runPrepareReturnCli({positionals:[root],flags:{}});
  let body=await readFile(prepared.scaffold.path,'utf8');
  const replacements={
    RETURN_PURPOSE:'return the completed bounded review for Sigma human review',
    TRANSFER_DESCRIPTION:'deliver the completed local review result',
    TRANSFER_BOUNDARY:'local review result only; no remote mutation or acceptance claim',
    RETURNED_MATERIAL:'completed local review',
    RETURNED_MATERIAL_REFERENCE:'../../review.md',
    RETURNED_MATERIAL_PURPOSE:'provide the exact bounded work product',
    RETAINED_BY:'Sigma',
    RETAINED_BY_REFERENCE:sigmaRef,
    RETAINED_RESPONSIBILITY:'perform final human review of the returned local result',
    RETAINED_RESPONSIBILITY_BOUNDARY:'human review does not establish remote mutation or publication authority',
    EXCLUSION_KIND:'excluded-scope',
    EXCLUSION_DESCRIPTION:'no remote mutation, publication, release, merge, or acceptance is claimed',
    EXCLUSION_RESPONSIBLE_PARTY:'Sigma',
    SIGNAL_KIND:'result',
    SIGNAL_MEANING:'deliver the completed bounded local review for final human review',
    DOES_NOT_MEAN:'the local result establishes acceptance, merge, release, publication, or remote landing',
    MUST_NOT_CLAIM:'remote state has been reconciled or published'
  };
  for(const [key,value] of Object.entries(replacements)) body=body.replaceAll(`<<TIINEX_REQUIRED:${key}>>`,value);
  assert.doesNotMatch(body,/<<TIINEX_REQUIRED:/);
  await writeFile(prepared.scaffold.path,body,'utf8');
  const statePath=path.join(root,'.tiinex','continuation.json');
  const beforeState=await readFile(statePath,'utf8');
  const preflight=await runCommonAuthorCli({positionals:[root],flags:{workspace:root,schema:'tiinex.handoff.v1',directory:'.topics/handoffs',body:prepared.scaffold.path,preflight:true}},{});
  assert.equal(preflight.status,'qualified-preflight');
  assert.equal(preflight.artifact.written,false);
  assert.equal(preflight.artifact.preflight,true);
  assert.equal(await readFile(statePath,'utf8'),beforeState);
  const authored=await runCommonAuthorCli({positionals:[root],flags:{workspace:root,schema:'tiinex.handoff.v1',directory:'.topics/handoffs',body:prepared.scaffold.path}},{});
  assert.equal(authored.status,'qualified');
  assert.equal(authored.artifact.written,true);
  const state=JSON.parse(await readFile(statePath,'utf8'));
  assert.equal(state.returnHandoffPath,authored.artifact.path);
});
