import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../src/tooling/portable/adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { orientColdConsumerFromHandoffPackage } from '../src/tooling/portable/handoff/coldConsumerEntrypoint.js';
import { groundPortableColdConsumer } from '../src/tooling/portable/handoff/coldStartQualification.grounding.js';
import { projectPortableGroundingReadiness } from '../src/tooling/portable/grounding/grounding.readiness.js';
import { inspectStoredWorkspaceArchive } from '../src/tooling/portable/handoff/workspaceByteProvider.js';
import { packageFileBytes, sha256Hex } from '../src/export/package.bytes.js';
import { preparePackageParentWorkspaceReuse, preparePackageParentExactMaterialProvider } from '../src/tooling/portable/adapters/node/handoff.manufacture.packageParent.js';
import { continueHandoffCarrierLineage, initialHandoffCarrierLineage, parentHandoffCarrierLineageFromBundle } from '../src/tooling/portable/handoff/carrierLineage.js';
import { projectHandoffHumanOutput, projectHandoffCarrierOutputFromPackage } from '../src/tooling/portable/handoff/carrierProjection.js';
import { inspectHandoffPackageV1 } from '../src/tooling/portable/handoff/handoffPackageV1.inspect.js';
import { manufactureHandoffPackageV1Direct } from '../src/tooling/portable/handoff/handoffPackageV1.manufacture.js';
import { finalizeFile } from '../src/export/package.fileMap.js';
import { exportFileMapZipUint8Array } from '../src/export/package.zip.js';
import { handoffPackageV1ZipBytes } from '../src/tooling/portable/handoff/handoffPackageV1.zip.js';
import { loadNodePortableInput } from '../src/tooling/portable/input/node.input.js';
import { groundContinuationOperationInput, materializeGroundWorkspaceCliOutput } from '../src/tooling/portable/adapters/cli/cli.ground-materialize.js';
import { projectHandoffPackageV1CacheIdentity } from '../src/tooling/portable/handoff/handoffPackageV1.reference.js';
import { prepareHandoffManufactureCliCommand, qualifyLegacyCarrierContinuationParent } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';

const ROOT=currentSchemaTarget('tiinex.root.v1');
const WS=currentSchemaTarget('tiinex.workspace.v1');
const TASK=currentSchemaTarget('tiinex.task.v1');
const HANDOFF=currentSchemaTarget('tiinex.handoff.v1');
const ROLE=currentSchemaTarget('tiinex.party.role.v1');
const COMMIT='a66906eef7f0033eb12893f92910336f82d01afa';


test('direct Package V1 Workspace carrier is first-class pointerless transport with Core-owned Start text', () => {
  const workspacePath = '.topics/.workspaces/tiinex-work.workspace.md';
  const workspaceFile = finalizeFile({ path: workspacePath, mediaType: 'text/markdown', content: workspaceMarkdown() });
  const bootstrapFile = finalizeFile({ path: 'runtime/tools/tiinex-portable.mjs', mediaType: 'text/javascript', content: 'export {};\n' });
  const result = manufactureHandoffPackageV1Direct({
    carrierMode: 'workspace',
    carrierLineage: { dimension: '017-2', parentDimension: '017-1', checkpointKind: 'progression' },
    workspaceMaterializations: [{ id: 'work', entries: [workspaceFile] }],
    workspaceTargets: [{ workspaceId: 'work', path: workspacePath }],
    additionalTransportFiles: [bootstrapFile], requirements: {}, handoffRoutes: []
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.inspection.status, 'valid');
  assert.equal(result.inspection.carrierProjection.mode, 'workspace');
  assert.equal(result.inspection.carrierProjection.startPath, '001-1-READ-BEFORE-PROCEEDING.trace.md');
  assert.equal(result.inspection.carrierProjection.lineage.dimension, '017-2');
  assert.deepEqual(result.inspection.carrierProjection.routes, []);
  const root = result.bundle.files.find((file) => file.path === '001-tiinex-handoff-package.trace.md');
  const rootText = new TextDecoder().decode(packageFileBytes(root));
  assert.match(rootText, /Package Role: recipient-facing-workspace-carrier/);
  assert.match(rootText, /Continue-From Rule: none/);
  assert.match(rootText, /Carrier Dimension: 017-2/);
  assert.doesNotMatch(rootText, /Major Reason:/);
  const human = projectHandoffCarrierOutputFromPackage({ bundle: result.bundle, filename: 'business-017-2.handoff-package.zip' });
  assert.equal(human.status, 'ready');
  assert.equal(human.presentation.recipientLabel, '');
  assert.match(human.normalInlineRouting.content, /Start:\n001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.match(human.normalInlineRouting.content, /pointerless Workspace carrier/);
  assert.doesNotMatch(human.normalInlineRouting.content, /Continue from:/i);
});

test('direct Package V1 bootstrap-only carrier stays material- and route-free with generic Core transport', () => {
  const bootstrapFile = finalizeFile({ path: 'runtime/tools/tiinex-portable.mjs', mediaType: 'text/javascript', content: 'export {};\n' });
  const result = manufactureHandoffPackageV1Direct({
    carrierMode: 'bootstrap', carrierLineage: { dimension: '001', checkpointKind: 'progression' },
    workspaceMaterializations: [], workspaceTargets: [], additionalTransportFiles: [bootstrapFile], requirements: {}, handoffRoutes: []
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.inspection.status, 'valid');
  assert.equal(result.inspection.carrierProjection.mode, 'bootstrap');
  assert.deepEqual(result.inspection.carrierProjection.workspaces, []);
  assert.deepEqual(result.inspection.carrierProjection.routes, []);
  const root = result.bundle.files.find((file) => file.path === '001-tiinex-handoff-package.trace.md');
  const rootText = new TextDecoder().decode(packageFileBytes(root));
  assert.match(rootText, /Package Role: recipient-facing-bootstrap-carrier/);
  assert.match(rootText, /Route Placement Rule: none/);
  assert.doesNotMatch(rootText, /Major Reason:/);
  const human = projectHandoffCarrierOutputFromPackage({ bundle: result.bundle, filename: 'tiinex-bootstrap-001.handoff-package.zip' });
  assert.equal(human.status, 'ready');
  assert.match(human.normalInlineRouting.content, /bootstrap-only carrier/);
  assert.doesNotMatch(human.normalInlineRouting.content, /Continue from:/i);
});

function seal(text){const r=sealC14nV2Self(text);assert.equal(r.state,'sealed');return `${r.markdown}\n`;}
async function put(root,rel,text){const p=path.join(root,...rel.split('/'));await mkdir(path.dirname(p),{recursive:true});await writeFile(p,text);return p;}
function workspaceMarkdown(){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WS})\n  - Created At: 2026-09-24 01:00:00\n  - Authors: Fixture\n  - Summary: Direct Package V1 fixture Workspace.\n  - Status: active/local\n\n---\n\n# Work\n\n## Workspace Entrypoints\n\n### Source\n\n- Source Kind: local-directory\n- Repository: Example/work\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}
function taskMarkdown(){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.task.v1](${TASK})\n  - Created At: 2026-09-24 01:01:00\n  - Authors: Fixture\n  - Summary: Direct Package V1 fixture Task.\n  - Status: ready/local\n\n---\n\n# Grounding Task\n\n## Objective\n\nContinue only from exact grounded material.\n\n## Done Criteria\n\n- Exact Handoff and required context resolve.\n\n## Scope\n\n- Package V1 fixture.\n\n## Dependencies\n\n- none\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}
function taskMarkdownNamed(name){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.task.v1](${TASK})\n  - Created At: 2026-09-24 01:01:00\n  - Authors: Fixture\n  - Summary: ${name} Package V1 fixture Task.\n  - Status: ready/local\n\n---\n\n# ${name} Grounding Task\n\n## Objective\n\nContinue only from exact grounded material for ${name}.\n\n## Done Criteria\n\n- Exact Handoff and required context resolve.\n\n## Scope\n\n- Package V1 fixture.\n\n## Dependencies\n\n- none\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}
function taskMarkdownWithParticipant(roleLabel='Sigma'){return seal(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](${ROOT})
- Current
  - Current Schema: [tiinex.task.v1](${TASK})
  - Created At: 2026-09-24 01:01:00
  - Authors: Fixture
  - Summary: Direct Package V1 participant return fixture Task.
  - Status: ready/local

---

# Participant Return Task

## Objective

Continue only from exact grounded material.

${roleLabel} is an explicitly required human participant in this current work because ${roleLabel} owns bounded human review.

## Done Criteria

- Exact Handoff and participant Role material resolve.

## Scope

- Package V1 return fixture.

## Dependencies

- none

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: 
`);}

function returnHandoffMarkdown({parentHandoff,anchorRef,sigmaRef}){
  const digest=validatedC14nV2PrimarySelfDigest(parentHandoff);assert.equal(digest.state,'verified');
  return seal(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](${ROOT})
- Parent
  - Parent Schema: [tiinex.handoff.v1](${HANDOFF})
  - Created At: 2026-09-24 01:02:00
  - Trace: [Parent Handoff](001-handoff.trace.md)
  - Origin:
    - [relative](001-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](${HANDOFF})
  - Created At: 2026-09-24 01:05:00
  - Authors: Fixture
  - Summary: Return bounded result to Sigma.
  - Status: ready/local

---

# Return To Sigma

## Handoff Parties

- Purpose: return bounded fixture work.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](${anchorRef})
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](${sigmaRef})

## Transfers

- return-work
  - Transfer Kind: work-and-responsibility
  - Description: return exact local result

## Required Context

- result-file
  - Material: exact local result
  - Material Reference: [result.md](../../result.md)
  - Purpose: bounded returned work product
  - Availability: available

## Reference Context

- none

## Retained Responsibilities

- none

## Exclusions And Dependencies

- no-remote-write
  - Kind: excluded-scope
  - Description: no remote mutation

## Completion Expectation

- Signal Kind: acknowledgement
- Signal Meaning: Sigma receives bounded result
- Return To: Sigma
- Return To Reference: [Sigma Role](${sigmaRef})

## Interpretation Limits

- Does Not Mean: result accepted or published
- Must Not Be Used To Claim: remote write permission

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: [Parent Handoff](001-handoff.trace.md)
  - Value: ${digest.value}

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: 
`);
}

function roleMarkdown(){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE})\n  - Created At: 2026-09-24 01:03:00\n  - Authors: Fixture\n  - Summary: Anchor fixture Role.\n  - Status: ready/local\n\n---\n\n# Anchor\n\n## Role Identity\n\n- Role Label: Anchor\n- Role Kind: fixture\n\n## Role Boundary\n\n- In Scope: direct Package V1 fixture\n- Out Of Scope: remote mutation\n\n## Authority And Responsibility Boundary\n\n- May Do: execute fixture work\n- Does Not Authorize: remote mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: explicit-session, handoff\n\n## Interpretation Limits\n\n- Does Not Prove: durable holder identity\n- Must Not Be Treated As: broader authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}
function guidanceMarkdown(title,summary){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.task.v1](${TASK})\n  - Created At: 2026-09-24 01:04:00\n  - Authors: Fixture\n  - Summary: ${summary}.\n  - Status: ready/local\n\n---\n\n# ${title}\n\nUse exact material and fail closed.\n\n## Scope\n\n- fixture\n\n## Dependencies\n\n- none\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}
function handoffMarkdown({task, roleRef, processRef='', policyRef='', ordinaryRef='', rawRequired='', title='Handoff'}){
  const digest=validatedC14nV2PrimarySelfDigest(task);assert.equal(digest.state,'verified');
  const required=rawRequired || [processRef?`- execution-process\n  - Material: exact execution process\n  - Material Reference: [Process](${processRef})\n  - Purpose: supplies required execution procedure\n  - Availability: available`:null,policyRef?`- acceptance-policy\n  - Material: exact acceptance policy guidance\n  - Material Reference: [Policy](${policyRef})\n  - Purpose: supplies required review constraints\n  - Availability: available`:null,ordinaryRef?`- supporting-evidence\n  - Material: exact supporting evidence\n  - Material Reference: [Evidence](${ordinaryRef})\n  - Purpose: supplies ordinary post-Handoff review context\n  - Availability: available`:null].filter(Boolean).join('\n\n')||'- none';
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Parent\n  - Parent Schema: [tiinex.task.v1](${TASK})\n  - Created At: 2026-09-24 01:01:00\n  - Trace: [Task](../task.trace.md)\n  - Origin:\n    - [relative](../task.trace.md)\n- Current\n  - Current Schema: [tiinex.handoff.v1](${HANDOFF})\n  - Created At: 2026-09-24 01:02:00\n  - Authors: Fixture\n  - Summary: ${title}.\n  - Status: ready/local\n\n---\n\n# ${title}\n\n## Handoff Parties\n\n- Purpose: exercise direct Package V1 grounding.\n- From: Anchor\n- From Kind: role\n- From Reference: [Anchor Role](${roleRef})\n- To: Anchor\n- To Kind: role\n- To Reference: [Anchor Role](${roleRef})\n\n## Transfers\n\n- execute\n  - Transfer Kind: work-and-responsibility\n  - Description: execute the bounded fixture task\n  - Controlling Artifact: [Task](../task.trace.md)\n\n## Required Context\n\n${required}\n\n## Reference Context\n\n- none\n\n## Retained Responsibilities\n\n- none\n\n## Exclusions And Dependencies\n\n- no-remote-write\n  - Kind: excluded-scope\n  - Description: no remote mutation\n\n## Completion Expectation\n\n- Signal Kind: result\n- Signal Meaning: exact grounded continuation result\n- Return To: Anchor\n- Return To Reference: [Anchor Role](${roleRef})\n\n## Interpretation Limits\n\n- Does Not Mean: transport creates authority\n- Must Not Be Used To Claim: remote write permission\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Task](../task.trace.md)\n  - Value: ${digest.value}\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

async function fixture({external=true,multi=false}={}){
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-test-'));
  const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-material-'));
  const workspace=workspaceMarkdown(); const task=taskMarkdown(); const role=roleMarkdown();
  const roleRef=external?`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-anchor-role.trace.md`:'work::.topics/roles/anchor.trace.md';
  const processRef=external?`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/processes/fixture-process.trace.md`:'';
  const policyRef=external?`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/governance/fixture-policy.trace.md`:'';
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspace); await put(root,'.topics/task.trace.md',task);
  const h1=handoffMarkdown({task,roleRef,processRef,policyRef,title:'Route One'}); await put(root,'.topics/handoffs/001-handoff.trace.md',h1);
  if(multi){const h2=handoffMarkdown({task,roleRef,processRef,policyRef,title:'Route Two'});await put(root,'.topics/handoffs/002-handoff.trace.md',h2);}
  const bindings={};
  if(external){
    const roleFile=await put(ext,'role.trace.md',role); const processFile=await put(ext,'process.trace.md',guidanceMarkdown('Execution Process','Process-like required guidance')); const policyFile=await put(ext,'policy.trace.md',guidanceMarkdown('Acceptance Policy Guidance','Policy-like required guidance'));
    bindings[roleRef]={sourcePath:roleFile,referenceTarget:roleRef,provenance:{workspaceId:'business',path:'.topics/roles/fixture-anchor-role.trace.md'}};
    bindings[processRef]={sourcePath:processFile,referenceTarget:processRef,provenance:{workspaceId:'business',path:'.topics/processes/fixture-process.trace.md'}};
    bindings[policyRef]={sourcePath:policyFile,referenceTarget:policyRef,provenance:{workspaceId:'business',path:'.topics/governance/fixture-policy.trace.md'}};
  } else await put(root,'.topics/roles/anchor.trace.md',role);
  const handoffRoutes=multi?[{workspaceId:'work',path:'.topics/handoffs/001-handoff.trace.md'},{workspaceId:'work',path:'.topics/handoffs/002-handoff.trace.md'}]:[];
  const input=await prepareNodeHandoffManufacturingInput({workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',handoffRoutes,materialBindings:bindings,runtimeRoot:path.resolve('.')});
  return {root,input};
}


test('carrier filename preserves explicit prefix + numeric lineage + exact Handoff route story without improvisation',()=>{
  const projection={status:'ready',mode:'handoff',lineage:{prefix:'my-custom-workspace',dimension:'001-1-4-2',checkpointKind:'progression'},routes:[{
    id:'route',routeId:'route',state:'qualified',pointerPath:'001-3-handoff-pointer.trace.md',workspaceId:'work',workspaceRelativeHandoffPath:'.topics/handoffs/route.trace.md',from:'Loom',to:'Anchor'
  }]};
  const out=projectHandoffHumanOutput({projection});
  assert.equal(out.status,'ready');
  assert.equal(out.primary.filename,'my-custom-workspace-001-1-4-2-loom-to-anchor.handoff-package.zip');
  assert.equal(out.primary.carrierPrefix,'my-custom-workspace');
  assert.equal(out.primary.dimension,'001-1-4-2');
  assert.equal(out.primary.from,'Loom');
  assert.equal(out.primary.to,'Anchor');
  const child=continueHandoffCarrierLineage({prefix:'my-custom-workspace',dimension:'001-1-4-2'},3);
  assert.equal(child.prefix,'my-custom-workspace');
  assert.equal(child.dimension,'001-1-4-2-3');
});

test('grounding readiness recognizes child and deeper Package V1 carrier dimensions',async()=>{
  const {input}=await fixture({external:false});
  const child=continueHandoffCarrierLineage(initialHandoffCarrierLineage('business'),1);
  const grandchild=continueHandoffCarrierLineage(child,2);
  for(const lineage of [child,grandchild]){
    const result=manufactureRecipientRelativeHandoffPackage({...input,carrierLineage:lineage},{verifyRoundtrip:true});
    assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
    assert.equal(result.inspection.status,'valid');
    assert.equal(result.inspection.readArtifact.path,'001-1-READ-BEFORE-PROCEEDING.trace.md');
    assert.equal(result.inspection.carrierProjection.lineage.dimension,lineage.dimension);
    const route=result.inspection.routes[0];
    const readiness=projectPortableGroundingReadiness({bundle:result.bundle,route:route.pointerPath,interactionMode:'execution',includeCurrentWork:true});
    assert.equal(readiness.readiness.state,'grounded-to-act',JSON.stringify(readiness,null,2));
    assert.equal(readiness.authority.state,'qualified');
  }
});


test('legacy pre-correction Package V1 topology may qualify carrier continuation only and never general package validity',()=>{
  const base={status:'invalid',detected:true,rootArtifact:{carrierLineage:{dimension:'017-1-1',prefix:'business'}},carrierProjection:{lineage:{dimension:'017-1-1',prefix:'business'}},routes:[{state:'qualified',pointerPath:'017-1-1-3-1-handoff-pointer.trace.md',routeId:'route'}]};
  const allowed=qualifyLegacyCarrierContinuationParent({...base,findings:[
    {severity:'error',code:'portable.handoff-package-v1.root.package-namespace-invalid'},
    {severity:'error',code:'portable.handoff-package-v1.workspace.sibling-dimension-invalid'},
    {severity:'error',code:'portable.handoff-package-v1.route.workspace-ancestor-mismatch'}
  ]});
  assert.equal(allowed.state,'qualified');
  assert.equal(allowed.allocationInspection.status,'ready');
  assert.equal(allowed.allocationInspection.qualification,'legacy-carrier-continuation-only');
  const denied=qualifyLegacyCarrierContinuationParent({...base,findings:[
    {severity:'error',code:'portable.handoff-package-v1.root.package-namespace-invalid'},
    {severity:'error',code:'portable.handoff-package-v1.workspace.snapshot-integrity-mismatch'}
  ]});
  assert.equal(denied.state,'unqualified');
  const deniedRoute=qualifyLegacyCarrierContinuationParent({...base,routes:[{state:'invalid'}],findings:[{severity:'error',code:'portable.handoff-package-v1.root.package-namespace-invalid'}]});
  assert.equal(deniedRoute.state,'unqualified');
});

test('CLI explicit Major continuation accepts exact qualified parent and also supports parentless Major allocation',async()=>{
  const {root,input}=await fixture({external:false});
  const parent=manufactureRecipientRelativeHandoffPackage({...input,carrierLineage:initialHandoffCarrierLineage('business')},{verifyRoundtrip:true});
  assert.equal(parent.status,'ready');
  const parentPath=path.join(root,'business-001-anchor-to-anchor.handoff-package.zip');
  await writeFile(parentPath,handoffPackageV1ZipBytes(parent.bundle));
  const prepared=await prepareHandoffManufactureCliCommand({
    flags:{
      workspace:root,
      handoff:'.topics/handoffs/001-handoff.trace.md',
      'workspace-id':'work',
      'workspace-target':'.topics/.workspaces/tiinex-work.workspace.md',
      'package-parent':parentPath,
      'package-major':true,
      'major-reason':'stable test checkpoint',
      'carrier-prefix':'business'
    },
    positionals:[]
  },{runtimeRoot:path.resolve('.')});
  assert.equal(prepared.input.carrierLineage.dimension,'002');
  assert.equal(prepared.input.carrierLineage.checkpointKind,'major');
  assert.equal(prepared.input.carrierLineage.parentDimension,'001');
  const majorResult=manufactureRecipientRelativeHandoffPackage(prepared.input,{verifyRoundtrip:true});
  assert.equal(majorResult.status,'ready',JSON.stringify(majorResult.findings||[],null,2));
  assert.equal(majorResult.inspection.packageContract.parentDimension,'001');
  assert.equal(majorResult.inspection.carrierProjection.lineage.mode,'major');
  assert.equal(majorResult.inspection.carrierProjection.lineage.parentDimension,'001');
  const majorOrientation=orientColdConsumerFromHandoffPackage({bundle:majorResult.bundle});
  assert.equal(majorOrientation.carrierLineage.mode,'major');
  assert.equal(majorOrientation.carrierLineage.parentDimension,'001');
  const parentless = await prepareHandoffManufactureCliCommand({flags:{workspace:root,handoff:'.topics/handoffs/001-handoff.trace.md','workspace-id':'work','workspace-target':'.topics/.workspaces/tiinex-work.workspace.md','package-major':true,'major-reason':'independent major','carrier-prefix':'business'},positionals:[]},{runtimeRoot:path.resolve('.')});
  assert.equal(parentless.input.carrierLineage.dimension,'001');
  assert.equal(parentless.input.carrierLineage.parentDimension,'');
  assert.equal(parentless.input.carrierLineage.mode,'major');
  const parentlessResult=manufactureRecipientRelativeHandoffPackage(parentless.input,{verifyRoundtrip:true});
  assert.equal(parentlessResult.status,'ready',JSON.stringify(parentlessResult.findings||[],null,2));
  assert.equal(parentlessResult.inspection.carrierProjection.lineage.mode,'major');
  assert.equal(parentlessResult.inspection.carrierProjection.lineage.parentDimension,'');
});



test('CLI continuation manufacture fails closed when runtime parent-carrier SHA does not match the exact received package bytes',async()=>{
  const {root,input}=await fixture({external:false});
  const parent=manufactureRecipientRelativeHandoffPackage({...input,carrierLineage:initialHandoffCarrierLineage('business')},{verifyRoundtrip:true});
  assert.equal(parent.status,'ready');
  const parentPath=path.join(root,'business-001-anchor-to-anchor.handoff-package.zip');
  await writeFile(parentPath,handoffPackageV1ZipBytes(parent.bundle));
  await mkdir(path.join(root,'.tiinex'),{recursive:true});
  await writeFile(path.join(root,'.tiinex','continuation.json'),JSON.stringify({
    schema:'tiinex.portable.ground-continuation-state.v1',version:1,
    packageParentPath:parentPath,packageParentSha256:'0'.repeat(64),
    selectedRoutePointer:parent.inspection.routes[0].pointerPath,
    selectedRouteId:parent.inspection.routes[0].id,
    returnHandoffPath:'.topics/handoffs/001-handoff.trace.md',
    workspaceId:'work',workspaceTarget:'.topics/.workspaces/tiinex-work.workspace.md',roleLabel:'Anchor'
  },null,2));
  await assert.rejects(
    prepareHandoffManufactureCliCommand({surfaceCommand:'handoff',flags:{workspace:root},positionals:[]},{runtimeRoot:path.resolve('.')}),
    /portable\.cli\.handoff-carrier\.received-package-parent\.identity-mismatch/
  );
});

test('recipient grounding mode requests exact Required Context and bounded current-work bodies in one operation without changing authority inputs',()=>{
  const input={bundle:{files:[]},route:'001-pointer.trace.md',holderRole:'Anchor',includeRequiredContext:'',includeCurrentWork:false,recovery:null};
  const projected=groundContinuationOperationInput(input,{recipient:true});
  assert.equal(projected.includeRequiredContext,'all');
  assert.equal(projected.includeCurrentWork,true);
  assert.equal(projected.route,input.route);
  assert.equal(projected.holderRole,input.holderRole);
  assert.equal(projected.bundle,input.bundle);
});

test('embedded LLM bootstrap teaches one-pass recipient grounding without changing semantic authority',async()=>{
  const text=await readFile(new URL('../src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md',import.meta.url),'utf8');
  assert.match(text,/<extract-root>\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs/);
  assert.match(text,/ground <same-package\.zip> --route <same-Continue-from> --recipient/);
  assert.doesNotMatch(text,/model recipient|Human\/debug callers/);
  assert.match(text,/projection convenience only/);
  assert.match(text,/does not change semantic authority, applicability, readiness/);
  assert.match(text,/normal return is not loose-file delivery/);
  assert.match(text,/qualify-return <continued-workspace-dir> --result <workspace-relative-result> --expected <workspace-relative-expected-file>/);
  assert.match(text,/`prepare-return` fails closed until that receipt exists and remains byte-current/);
  assert.match(text,/run `prepare-return <continued-workspace-dir>` first|normal return is not loose-file delivery: run `prepare-return <continued-workspace-dir>` first/);
  assert.match(text,/run the exact emitted `author` command/);
  assert.match(text,/do not reimplement integrity or inspect Handoff schema source manually/);
  assert.match(text,/exactly one `\.handoff-package\.zip` plus Tooling's exact adjacent routing text/);
  assert.match(text,/must not be emitted as extra loose transport payloads/);
  assert.match(text,/re-evaluate that exact selected authority after every new human turn/);
  assert.match(text,/prior host-tool choice is never authority for the next turn/);
  assert.match(text,/do not call the candidate-producing tool again/);
  assert.match(text,/qualified-awaiting-host-surface/);
  assert.match(text,/runtime-local filesystem path.*never evidence that the human can access the file/);
  assert.match(text,/host's native human-visible file, attachment, or link mechanism/);
  assert.match(text,/Manual ZIP construction.*never qualify either host surfacing or delivery/);
  assert.doesNotMatch(text,/canonical Handoff semantic authoring\/validation or a locked canonical package schema/);
  assert.doesNotMatch(text,/a locked package format/);
  assert.match(text,/canonical Handoff authoring through `author`/);
});

test('direct Package V1 orientation preserves qualified carrier prefix and numeric lineage for recipient continuation',async()=>{
  const {input}=await fixture({external:false});
  const result=manufactureRecipientRelativeHandoffPackage({...input,carrierLineage:initialHandoffCarrierLineage('business')},{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  const orientation=orientColdConsumerFromHandoffPackage({bundle:result.bundle});
  assert.equal(orientation.status,'ready');
  assert.equal(orientation.carrierLineage.prefix,'business');
  assert.equal(orientation.carrierLineage.dimension,'001');
  const startFile=result.bundle.files.find((file)=>file.path==='001-1-READ-BEFORE-PROCEEDING.trace.md');
  const startText=new TextDecoder().decode(packageFileBytes(startFile));
  assert.match(startText,/<extract-root>\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs/);
  assert.match(startText,/orient <original-carrier\.zip>/);
  assert.match(startText,/ground <original-carrier\.zip> --route <Continue-from> --recipient --continue <empty-local-workspace-dir>/);
  assert.doesNotMatch(startText,/For a model recipient/);
  assert.match(startText,/inspect-only recipient grounding/);
  assert.match(startText,/No `--help`, runtime source inspection, or broad package archaeology is required/);
});

test('carrier filename manufacture projection fails closed when prefix or exact route parties are absent',()=>{
  const base={status:'ready',mode:'handoff',lineage:{dimension:'001'},routes:[{id:'r',state:'qualified',pointerPath:'001-3-handoff-pointer.trace.md',workspaceId:'work',workspaceRelativeHandoffPath:'.topics/handoffs/r.trace.md',from:'Anchor',to:'Anchor'}]};
  assert.equal(projectHandoffHumanOutput({projection:base}).status,'prefix-required');
  assert.equal(projectHandoffHumanOutput({projection:{...base,lineage:{prefix:'business',dimension:'001'},routes:[{...base.routes[0],from:'',to:''}]}}).status,'route-parties-required');
  assert.equal(projectHandoffHumanOutput({projection:{...base,lineage:{prefix:'business',dimension:'001'}},carrierPrefix:'other'}).status,'prefix-conflict');
  const qualified=projectHandoffHumanOutput({projection:{...base,lineage:{prefix:'business',dimension:'001'}}});
  assert.deepEqual(qualified.normalEmissionBoundary.allowed,['package-file','exact-adjacent-routing-text']);
  assert.equal(qualified.normalEmissionBoundary.canonicalFilePayloadCount,1);
  assert.ok(qualified.normalEmissionBoundary.forbidden.includes('manually-constructed-package'));
});

test('direct Package V1 keeps already-carried endpoint Role material in Workspace and creates no redundant cache',async()=>{
  const {input}=await fixture({external:false});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready'); assert.equal(result.inspection.status,'valid'); assert.equal(result.roundtrip.status,'passed');
  assert.equal(result.inspection.caches.length,0);
  const route=result.inspection.routes[0]; assert.equal(route.endpointRolePointers.length,2);
  for(const pointerPath of route.endpointRolePointers){const p=result.inspection.endpointRoles.find(x=>x.pointerPath===pointerPath);assert.equal(p.targetCarrierKind,'workspace-archive-entry');assert.equal(p.targetWorkspaceId,'work');assert.equal(p.targetInnerPath,'.topics/roles/anchor.trace.md');}
  assert.deepEqual(result.bundle.files.map(f=>f.path),['001-tiinex-handoff-package.trace.md','001-1-READ-BEFORE-PROCEEDING.trace.md','001-2-bootstrap.trace.md','001-2-bootstrap.zip','001-3-work.workspace.md','001-3-work.workspace.zip','001-3-1-anchor-from-role-pointer.trace.md','001-3-1-1-anchor-to-role-pointer.trace.md','001-3-1-1-1-handoff-pointer.trace.md']);
});

test('direct Package V1 cache uses readable GitHub adapter identity and grounds Process, Policy and endpoint Roles',async()=>{
  const {input}=await fixture({external:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready'); assert.equal(result.inspection.status,'valid'); assert.equal(result.roundtrip.status,'passed');
  assert.equal(result.inspection.caches.length,1);
  const cache=result.inspection.caches[0]; const paths=cache.archive.entries.map(e=>e.path).sort();
  assert.deepEqual(paths,[`github/Tiinex/business/${COMMIT}/.topics/governance/fixture-policy.trace.md`,`github/Tiinex/business/${COMMIT}/.topics/processes/fixture-process.trace.md`,`github/Tiinex/business/${COMMIT}/.topics/roles/fixture-anchor-role.trace.md`]);
  assert.equal(paths.some(p=>p.startsWith('material/')||p.endsWith('.bin')),false);
  const orientation=orientColdConsumerFromHandoffPackage({bundle:result.bundle}); assert.equal(orientation.status,'ready');
  assert.equal(Object.prototype.hasOwnProperty.call(orientation,'workspaceByteProvider'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(orientation.workspaces[0]||{},'archive'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(orientation.caches[0]||{},'archive'),false);
  assert.equal(orientation.workspaces[0].id,'work'); assert.equal(orientation.workspaces[0].qualification,'qualified');
  assert.ok(JSON.stringify(orientation).length<250_000,'orientation receipt must not serialize carried Workspace/cache bytes');
  const route=orientation.routes[0]; assert.equal(route.groundingPointers.length,2); assert.equal(route.endpointRolePointers.length,2); assert.equal(route.requiredClosure.state,'qualified');
  const grounded=groundPortableColdConsumer({bundle:result.bundle,route:route.pointerPath,interactionMode:'execution'}); assert.equal(grounded.status,'ready'); assert.equal(grounded.role.state,'qualified'); assert.equal(grounded.senderRole.state,'qualified'); assert.equal(grounded.holderBinding.state,'qualified');
  const readiness=projectPortableGroundingReadiness({bundle:result.bundle,route:route.pointerPath,interactionMode:'execution',includeCurrentWork:true}); assert.equal(readiness.readiness.state,'grounded-to-act'); assert.equal(readiness.continuity.state,'qualified');
  const pointerKinds=orientation.groundingPointers.map(p=>p.pointerKind).sort(); assert.deepEqual(pointerKinds,['policy','process']);
});


async function ordinaryContextFixture({cached=false}={}){
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-ordinary-'));
  const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-ordinary-material-'));
  const workspace=workspaceMarkdown(); const task=taskMarkdown(); const role=roleMarkdown();
  const refs={role:`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-anchor-role.trace.md`,process:`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/processes/fixture-process.trace.md`,policy:`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/governance/fixture-policy.trace.md`,evidence:cached?`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/evidence/fixture-evidence.trace.md`:'../evidence/fixture-evidence.trace.md'};
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspace); await put(root,'.topics/task.trace.md',task);
  if(!cached) await put(root,'.topics/evidence/fixture-evidence.trace.md',guidanceMarkdown('Machine Evidence','Ordinary supporting evidence'));
  await put(root,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task,roleRef:refs.role,processRef:refs.process,policyRef:refs.policy,ordinaryRef:refs.evidence,title:'Ordinary Context'}));
  const bindings={};
  for(const [ref,file,content,p] of [[refs.role,'role.trace.md',role,'.topics/roles/fixture-anchor-role.trace.md'],[refs.process,'process.trace.md',guidanceMarkdown('Execution Process','Process-like required guidance'),'.topics/processes/fixture-process.trace.md'],[refs.policy,'policy.trace.md',guidanceMarkdown('Acceptance Policy Guidance','Policy-like required guidance'),'.topics/governance/fixture-policy.trace.md']]){const sourcePath=await put(ext,file,content);bindings[ref]={sourcePath,referenceTarget:ref,provenance:{workspaceId:'business',path:p}};}
  if(cached){const sourcePath=await put(ext,'evidence.trace.md',guidanceMarkdown('Machine Evidence','Ordinary supporting evidence'));bindings[refs.evidence]={sourcePath,referenceTarget:refs.evidence,provenance:{workspaceId:'business',path:'.topics/evidence/fixture-evidence.trace.md'}};}
  const input=await prepareNodeHandoffManufacturingInput({workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',materialBindings:bindings,runtimeRoot:path.resolve('.')});
  return {input,refs};
}

test('Required Context without Material Reference preserves an explicit carried-Workspace binding through Package V1 roundtrip',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-reference-absent-'));
  const contextRoot=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-reference-absent-context-'));
  const workspace=workspaceMarkdown(); const task=taskMarkdown(); const role=roleMarkdown();
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspace);
  await put(root,'.topics/task.trace.md',task);
  await put(root,'.topics/roles/anchor.trace.md',role);
  const contextPath='.topics/.workspaces/tiinex-context.workspace.md';
  await put(contextRoot,contextPath,workspaceMarkdown());
  const rawRequired=`- workspace-context\n  - Material: current Context Workspace\n  - Purpose: supplies exact carried Workspace context without requiring source-level transport coordinates\n  - Availability: available`;
  await put(root,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task,roleRef:'work::.topics/roles/anchor.trace.md',rawRequired,title:'Reference-Absent Context'}));
  const input=await prepareNodeHandoffManufacturingInput({
    workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',
    additionalWorkspaces:[{id:'context',root:contextRoot,workspaceTargetPath:contextPath}],
    materialBindings:{'required:workspace-context':{workspaceId:'context',workspacePath:contextPath}},
    runtimeRoot:path.resolve('.')
  });
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  assert.equal(result.inspection.status,'valid');
  assert.equal(result.roundtrip.status,'passed');
  const route=result.inspection.routes[0];
  const requirement=route.requiredClosure.requirements.find((item)=>item.requirementId==='required:workspace-context');
  assert.ok(requirement);
  assert.equal(requirement.referenceTarget,'');
  assert.equal(requirement.state,'qualified');
  assert.equal(requirement.resolution.providerMode,'archive');
  assert.equal(requirement.resolution.workspaceId,'context');
  assert.equal(requirement.resolution.workspaceRelativePath,contextPath);
  const pointer=result.inspection.groundingPointers.find((item)=>item.requirementId==='required:workspace-context');
  assert.ok(pointer,'reference-absent explicit binding must survive as a package-local grounding pointer');
  assert.equal(pointer.referenceTarget,'');
  assert.equal(pointer.targetWorkspaceId,'context');
  assert.equal(pointer.targetInnerPath,contextPath);
});

test('Required Context without Material Reference is not inferred from package placement when no exact binding is supplied',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-reference-absent-unbound-'));
  const contextRoot=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-reference-absent-unbound-context-'));
  const workspace=workspaceMarkdown(); const task=taskMarkdown(); const role=roleMarkdown();
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspace);
  await put(root,'.topics/task.trace.md',task);
  await put(root,'.topics/roles/anchor.trace.md',role);
  const contextPath='.topics/.workspaces/tiinex-context.workspace.md';
  await put(contextRoot,contextPath,workspaceMarkdown());
  const rawRequired=`- workspace-context\n  - Material: current Context Workspace\n  - Purpose: supplies exact carried Workspace context without requiring source-level transport coordinates\n  - Availability: available`;
  await put(root,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task,roleRef:'work::.topics/roles/anchor.trace.md',rawRequired,title:'Reference-Absent Unbound Context'}));
  const input=await prepareNodeHandoffManufacturingInput({
    workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',
    additionalWorkspaces:[{id:'context',root:contextRoot,workspaceTargetPath:contextPath}],
    runtimeRoot:path.resolve('.')
  });
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'blocked');
  assert.equal(result.preflight.state,'blocked');
  assert.equal(result.bundle,null);
  assert.equal(result.inspection,null);
  const planned=(result.plan?.requirements?.required||[]).find((item)=>item.requirementId==='required:workspace-context');
  assert.ok(planned);
  assert.notEqual(planned.disposition,'qualified');
});

test('ordinary carried Required Context resolves after Handoff without becoming a root grounding pointer',async()=>{
  const {input,refs}=await ordinaryContextFixture({cached:false}); const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); const route=result.inspection.routes[0];
  assert.deepEqual(route.groundingPointers.map((p)=>result.inspection.groundingPointers.find((item)=>item.pointerPath===p)?.pointerKind).sort(),['policy','process']);
  assert.equal(result.inspection.groundingPointers.some((p)=>p.referenceTarget===refs.evidence),false);
  const ordinary=route.requiredClosure.requirements.find((item)=>item.referenceTarget===refs.evidence); assert.ok(ordinary); assert.equal(ordinary.state,'qualified'); assert.equal(ordinary.resolution.providerMode,'archive'); assert.equal(ordinary.resolution.workspaceId,'work');
});

test('ordinary cache-only Required Context is justified by Handoff closure without a root pointer',async()=>{
  const {input,refs}=await ordinaryContextFixture({cached:true}); const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); const route=result.inspection.routes[0]; assert.equal(route.requiredClosure.state,'qualified');
  assert.equal(result.inspection.groundingPointers.some((p)=>p.referenceTarget===refs.evidence),false);
  const ordinary=route.requiredClosure.requirements.find((item)=>item.referenceTarget===refs.evidence); assert.ok(ordinary); assert.equal(ordinary.resolution.providerMode,'cache');
  assert.ok(result.inspection.caches[0].archive.entries.map((e)=>e.path).includes(`github/Tiinex/business/${COMMIT}/.topics/evidence/fixture-evidence.trace.md`));
});

test('two Handoff routes share one bounded cache and maximally share qualified pointer ancestry before Handoff divergence',async()=>{
  const {input}=await fixture({external:true,multi:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready'); assert.equal(result.inspection.status,'valid'); assert.equal(result.roundtrip.status,'passed'); assert.equal(result.inspection.caches.length,1); assert.equal(result.inspection.routes.length,2);
  const cachePaths=result.inspection.caches[0].archive.entries.map(e=>e.path).sort(); assert.equal(cachePaths.length,3);
  const [a,b]=result.inspection.routes; assert.notEqual(a.pointerPath,b.pointerPath); assert.match(a.pointerPath,/^001-3-1-1-/); assert.match(b.pointerPath,/^001-3-1-1-/);
  assert.deepEqual(a.groundingPointers,b.groundingPointers); assert.deepEqual(a.endpointRolePointers,b.endpointRolePointers);
  const aParent=a.pointerPath.replace(/-\d+-handoff-pointer\.trace\.md$/,''); const bParent=b.pointerPath.replace(/-\d+-handoff-pointer\.trace\.md$/,''); assert.equal(aParent,bParent);
  assert.match(a.pointerPath,/-1-handoff-pointer\.trace\.md$/); assert.match(b.pointerPath,/-2-handoff-pointer\.trace\.md$/);
  for(const route of result.inspection.routes){assert.equal(route.requiredClosure.state,'qualified');assert.equal(route.endpointRolePointers.length,2);assert.equal(route.groundingPointers.length,2);}
  const archiveFile=result.bundle.files.find(f=>f.path==='001-3-1-cache.zip'); const archive=inspectStoredWorkspaceArchive(packageFileBytes(archiveFile),{ownedBytes:true}); assert.equal(archive.state,'qualified'); assert.equal(archive.entries.length,3);
});


test('direct Package V1 can serve as exact package-parent Workspace/cache provider for continuation manufacture',async()=>{
  const {input}=await fixture({external:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready'); assert.equal(result.inspection.status,'valid');
  const route=result.inspection.routes[0];
  const reuse=preparePackageParentWorkspaceReuse({
    bundle:result.bundle,
    currentWorkspaceIds:[],
    workspaceIds:['work'],
    parentPackagePath:'/received/001-tiinex-handoff-package.zip',
    parentPackageSha256:'a'.repeat(64)
  });
  assert.equal(reuse.state,'qualified');
  assert.equal(reuse.providerState,'qualified');
  assert.deepEqual(reuse.providerWorkspaceIds,['work']);
  assert.equal(reuse.inherited.length,1);
  assert.equal(reuse.inherited[0].enumeration.materialization.state,'complete');
  assert.equal(reuse.inherited[0].enumeration.materialization.entries.some(e=>e.path==='.topics/handoffs/001-handoff.trace.md'),true);

  const exact=preparePackageParentExactMaterialProvider({
    bundle:result.bundle,
    currentWorkspaceIds:[],
    parentPackagePath:'/received/001-tiinex-handoff-package.zip',
    parentPackageSha256:'a'.repeat(64),
    selectedRoutePointer:route.pointerPath
  });
  assert.equal(exact.state,'qualified');
  assert.equal(exact.endpointContext.state,'qualified');
  assert.deepEqual(exact.entries.map(e=>e.referenceTarget).sort(),[
    `https://github.com/Tiinex/business/blob/${COMMIT}/.topics/governance/fixture-policy.trace.md`,
    `https://github.com/Tiinex/business/blob/${COMMIT}/.topics/processes/fixture-process.trace.md`,
    `https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-anchor-role.trace.md`
  ].sort());
  assert.equal(exact.entries.every(e=>e.providerKind==='qualified-package-parent-cache-material'),true);

  const lineage=parentHandoffCarrierLineageFromBundle(result.bundle,{packageSha256:'b'.repeat(64),packageFilename:'001-tiinex-handoff-package.zip'});
  assert.equal(lineage.dimension,'001');
  assert.equal(lineage.packageSha256,'b'.repeat(64));
});



test('Package V1 failure matrix blocks tampered cache/workspace bytes and missing route/grounding pointers without executable routes',async()=>{
  const {input}=await fixture({external:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  const cache=result.bundle.files.find((file)=>String(file.path||'').endsWith('-cache.zip'));
  const workspace=result.bundle.files.find((file)=>String(file.path||'').endsWith('.workspace.zip'));
  const route=result.inspection.routes[0];
  const processPointer=route.groundingPointers[0];
  assert.ok(cache); assert.ok(workspace); assert.ok(route.pointerPath); assert.ok(processPointer);

  const cacheBytes=packageFileBytes(cache); const mutatedCache=new Uint8Array(cacheBytes.length+1); mutatedCache.set(cacheBytes); mutatedCache[mutatedCache.length-1]=0x7f;
  const cacheInspection=inspectHandoffPackageV1(bundleWithFileData(result.bundle,cache.path,mutatedCache));
  assert.equal(cacheInspection.status,'invalid');
  assert.ok(cacheInspection.findings.some((item)=>['portable.handoff-package-v1.cache.bytes-mismatch','portable.handoff-package-v1.cache.sha-mismatch'].includes(item.code)));

  const workspaceBytes=packageFileBytes(workspace); const mutatedWorkspace=new Uint8Array(workspaceBytes.length+1); mutatedWorkspace.set(workspaceBytes); mutatedWorkspace[mutatedWorkspace.length-1]=0x7f;
  const workspaceInspection=inspectHandoffPackageV1(bundleWithFileData(result.bundle,workspace.path,mutatedWorkspace));
  assert.equal(workspaceInspection.status,'invalid');
  assert.ok(workspaceInspection.findings.some((item)=>item.code==='portable.handoff-package-v1.workspace.archive-sha-mismatch'));

  const withoutRoute={...result.bundle,files:result.bundle.files.filter((file)=>file.path!==route.pointerPath)};
  const routeInspection=inspectHandoffPackageV1(withoutRoute);
  assert.equal(routeInspection.status,'invalid');
  assert.ok(routeInspection.findings.some((item)=>item.code==='portable.handoff-package-v1.routes.missing'));

  const withoutProcess={...result.bundle,files:result.bundle.files.filter((file)=>file.path!==processPointer)};
  const processInspection=inspectHandoffPackageV1(withoutProcess);
  assert.equal(processInspection.status,'invalid');
  assert.ok(processInspection.findings.some((item)=>item.code==='portable.handoff-package-v1.required-context.pre-handoff-pointer-missing'));
});

function bundleWithFileData(bundle,filePath,data){
  const bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));
  return {...bundle,files:bundle.files.map(file=>String(file.path||'')===filePath?{...file,data:bytes,bytes:bytes.byteLength,sha256:sha256Hex(bytes)}:file)};
}
function bundleWithRenamedFile(bundle,fromPath,toPath){return {...bundle,files:bundle.files.map(file=>String(file.path||'')===fromPath?{...file,path:toPath}:file)};}
function decodeFile(file){return new TextDecoder().decode(packageFileBytes(file));}

test('Package V1 inspection rejects external carrier lineage leaked into the package-local root coordinate',async()=>{
  const {input}=await fixture({external:false});
  const result=manufactureRecipientRelativeHandoffPackage({...input,carrierLineage:{prefix:'business',dimension:'017-1-4-1-1',checkpointKind:'progression'}},{verifyRoundtrip:true}); assert.equal(result.status,'ready');
  const mutated=bundleWithRenamedFile(result.bundle,'001-tiinex-handoff-package.trace.md','017-1-4-1-1-tiinex-handoff-package.trace.md');
  const inspection=inspectHandoffPackageV1(mutated); assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some((item)=>item.code==='portable.handoff-package-v1.root.package-namespace-invalid'),true);
});

test('Package V1 inspection rejects chained Workspace coordinates instead of accepting one Workspace as another Workspace ancestor',async()=>{
  const {input}=await participantMatrixFixture({participantCarried:true,guidanceCarried:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true}); assert.equal(result.status,'ready');
  const oldArtifact='001-4-business.workspace.md'; const newArtifact='001-3-1-business.workspace.md';
  const oldArchive='001-4-business.workspace.zip'; const newArchive='001-3-1-business.workspace.zip';
  let mutated=bundleWithRenamedFile(result.bundle,oldArtifact,newArtifact); mutated=bundleWithRenamedFile(mutated,oldArchive,newArchive);
  const rootFile=mutated.files.find((file)=>file.path==='001-tiinex-handoff-package.trace.md'); assert.ok(rootFile);
  let rootText=decodeFile(rootFile).replaceAll(oldArtifact,newArtifact).replaceAll(oldArchive,newArchive);
  const resealed=sealC14nV2Self(rootText); assert.equal(resealed.state,'sealed'); mutated=bundleWithFileData(mutated,rootFile.path,`${resealed.markdown}\n`);
  const inspection=inspectHandoffPackageV1(mutated); assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some((item)=>item.code==='portable.handoff-package-v1.workspace.sibling-dimension-invalid'),true);
});

test('Package V1 inspection rejects a Handoff route whose target Workspace differs from its package-local Workspace ancestor',async()=>{
  const {input}=await twoRouteWorkspaceCacheFixture();
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true}); assert.equal(result.status,'ready');
  const workRoute=result.inspection.routes.find((item)=>item.workspaceId==='work'); const businessRoute=result.inspection.routes.find((item)=>item.workspaceId==='business'); assert.ok(workRoute); assert.ok(businessRoute);
  const businessWorkspace=result.inspection.workspaces.find((item)=>item.workspaceId==='business'); assert.ok(businessWorkspace);
  const businessEntry=businessWorkspace.archive.entries.find((entry)=>entry.path===businessRoute.workspaceRelativeHandoffPath); assert.ok(businessEntry);
  const pointerFile=result.bundle.files.find((file)=>file.path===workRoute.pointerPath); assert.ok(pointerFile);
  let pointerText=decodeFile(pointerFile)
    .replace(/^- Target Workspace Id: work$/m,'- Target Workspace Id: business')
    .replace(/^- Target Payload: 001-3-work\.workspace\.zip$/m,'- Target Payload: 001-4-business.workspace.zip')
    .replace(/^- Target Byte Size: \d+$/m,`- Target Byte Size: ${businessEntry.bytes}`)
    .replace(/^- Target SHA-256: [0-9a-f]{64}$/m,`- Target SHA-256: ${businessEntry.sha256}`);
  const resealed=sealC14nV2Self(pointerText); assert.equal(resealed.state,'sealed'); const mutated=bundleWithFileData(result.bundle,pointerFile.path,`${resealed.markdown}\n`);
  const inspection=inspectHandoffPackageV1(mutated); assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some((item)=>item.code==='portable.handoff-package-v1.route.workspace-ancestor-mismatch'),true);
});

test('Package V1 inspection rejects gaps in generated sibling route lineage',async()=>{
  const {input}=await fixture({external:true,multi:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true}); assert.equal(result.status,'ready');
  const [,routeB]=result.inspection.routes; assert.ok(routeB);
  const gapPath=routeB.pointerPath.replace(/-2-handoff-pointer\.trace\.md$/,'-3-handoff-pointer.trace.md'); assert.notEqual(gapPath,routeB.pointerPath);
  const mutated=bundleWithRenamedFile(result.bundle,routeB.pointerPath,gapPath); const inspection=inspectHandoffPackageV1(mutated); assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some((item)=>item.code==='portable.handoff-package-v1.lineage.sibling-density-invalid'),true);
});

test('Package V1 inspection fails closed when a grounding pointer target digest is mutated',async()=>{
  const {input}=await fixture({external:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  const pointerFile=result.bundle.files.find(f=>String(f.path||'').endsWith('execution-process-pointer.trace.md'));
  assert.ok(pointerFile);
  const mutatedText=decodeFile(pointerFile).replace(/^- Target SHA-256: [0-9a-f]{64}$/mi,`- Target SHA-256: ${'0'.repeat(64)}`);
  const resealed=sealC14nV2Self(mutatedText); assert.equal(resealed.state,'sealed');
  const mutated=bundleWithFileData(result.bundle,pointerFile.path,`${resealed.markdown}\n`);
  const inspection=inspectHandoffPackageV1(mutated);
  assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some(f=>f.code==='portable.handoff-package-v1.pointer.target-sha-mismatch'),true);
});

test('Package V1 inspection rejects bounded-cache over-expansion even when cache payload integrity is resealed',async()=>{
  const {input}=await fixture({external:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  const cache=result.inspection.caches[0];
  const extra=new TextEncoder().encode('# Unreferenced cache material\n');
  const zipBytes=exportFileMapZipUint8Array([
    ...cache.archive.entries.map(entry=>({path:entry.path,data:entry.data})),
    {path:'github/Tiinex/business/${COMMIT}/.topics/roles/unreferenced.trace.md',data:extra}
  ],'portable.handoff-package-v1.test-cache.path.invalid');
  let mutated=bundleWithFileData(result.bundle,cache.archivePath,zipBytes);
  const descriptor=mutated.files.find(f=>String(f.path||'')===cache.artifactPath); assert.ok(descriptor);
  let descriptorText=decodeFile(descriptor)
    .replace(/^- Byte Size: \d+$/mi,`- Byte Size: ${zipBytes.byteLength}`)
    .replace(/^- Integrity Value: [0-9a-f]{64}$/mi,`- Integrity Value: ${sha256Hex(zipBytes)}`);
  const resealed=sealC14nV2Self(descriptorText); assert.equal(resealed.state,'sealed');
  mutated=bundleWithFileData(mutated,cache.artifactPath,`${resealed.markdown}\n`);
  const inspection=inspectHandoffPackageV1(mutated);
  assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some(f=>f.code==='portable.handoff-package-v1.cache.over-expansion'),true);
});

function roleMarkdownNamed(label){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE})\n  - Created At: 2026-09-24 01:03:00\n  - Authors: Fixture\n  - Summary: ${label} fixture Role.\n  - Status: ready/local\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: fixture\n\n## Role Boundary\n\n- In Scope: direct Package V1 fixture\n- Out Of Scope: remote mutation\n\n## Authority And Responsibility Boundary\n\n- May Do: execute fixture work\n- Does Not Authorize: remote mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: explicit-session, handoff\n\n## Interpretation Limits\n\n- Does Not Prove: durable holder identity\n- Must Not Be Treated As: broader authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}
function workspaceMarkdownNamed(title,repository){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WS})\n  - Created At: 2026-09-24 01:00:00\n  - Authors: Fixture\n  - Summary: ${title} Package V1 fixture Workspace.\n  - Status: active/local\n\n---\n\n# ${title}\n\n## Workspace Entrypoints\n\n### Source\n\n- Source Kind: local-directory\n- Repository: ${repository}\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);}

async function participantMatrixFixture({ participantCarried=false, guidanceCarried=false }={}) {
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-participant-work-'));
  const business=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-participant-business-'));
  const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-participant-material-'));
  const workspace=workspaceMarkdownNamed('Work','Example/work'); const task=taskMarkdown();
  const anchor=roleMarkdownNamed('Anchor'); const sigma=roleMarkdownNamed('Sigma');
  const anchorRef='work::.topics/roles/anchor.trace.md';
  const processRef=guidanceCarried?'work::.topics/processes/fixture-process.trace.md':`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/processes/fixture-process.trace.md`;
  const policyRef=guidanceCarried?'work::.topics/governance/fixture-policy.trace.md':`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/governance/fixture-policy.trace.md`;
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspace); await put(root,'.topics/task.trace.md',task); await put(root,'.topics/roles/anchor.trace.md',anchor);
  const handoff=handoffMarkdown({task,roleRef:anchorRef,processRef,policyRef,title:'Participant Matrix Route'}); await put(root,'.topics/handoffs/001-handoff.trace.md',handoff);
  const process=guidanceMarkdown('Execution Process','Process-like required guidance'); const policy=guidanceMarkdown('Acceptance Policy Guidance','Policy-like required guidance');
  const bindings={}; const additionalWorkspaces=[];
  if(guidanceCarried){ await put(root,'.topics/processes/fixture-process.trace.md',process); await put(root,'.topics/governance/fixture-policy.trace.md',policy); }
  else {
    const processFile=await put(ext,'process.trace.md',process); const policyFile=await put(ext,'policy.trace.md',policy);
    bindings[processRef]={sourcePath:processFile,referenceTarget:processRef,provenance:{workspaceId:'business',path:'.topics/processes/fixture-process.trace.md'}};
    bindings[policyRef]={sourcePath:policyFile,referenceTarget:policyRef,provenance:{workspaceId:'business',path:'.topics/governance/fixture-policy.trace.md'}};
  }
  const sigmaRef=`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-sigma-role.trace.md`;
  if(participantCarried){
    await put(business,'.topics/.workspaces/tiinex-business.workspace.md',workspaceMarkdownNamed('Business','Tiinex/business'));
    await put(business,'.topics/roles/fixture-sigma-role.trace.md',sigma);
    additionalWorkspaces.push({id:'business',root:business,workspaceTargetPath:'.topics/.workspaces/tiinex-business.workspace.md'});
  } else {
    const sigmaFile=await put(ext,'sigma.trace.md',sigma);
    bindings[sigmaRef]={sourcePath:sigmaFile,referenceTarget:sigmaRef,provenance:{workspaceId:'business',path:'.topics/roles/fixture-sigma-role.trace.md'}};
  }
  const input=await prepareNodeHandoffManufacturingInput({
    workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',
    handoffRoutes:[{workspaceId:'work',path:'.topics/handoffs/001-handoff.trace.md',participantRoles:[{label:'Sigma',workspaceId:'business',path:'.topics/roles/fixture-sigma-role.trace.md',reference:sigmaRef}]}],
    additionalWorkspaces,materialBindings:bindings,runtimeRoot:path.resolve('.')
  });
  return {root,business,input};
}

async function twoRouteWorkspaceCacheFixture(){
  const work=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-work-'));
  const business=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-business-'));
  const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-shared-material-'));
  const processRef=`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/processes/fixture-process.trace.md`;
  const policyRef=`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/governance/fixture-policy.trace.md`;
  const roleRef=`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-anchor-role.trace.md`;
  const task=taskMarkdown(); const businessTask=taskMarkdownNamed('Business');
  await put(work,'.topics/.workspaces/tiinex-work.workspace.md',workspaceMarkdownNamed('Work','Example/work'));
  await put(work,'.topics/task.trace.md',task);
  await put(work,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task,roleRef,processRef,policyRef,title:'Work Route'}));
  await put(business,'.topics/.workspaces/tiinex-business.workspace.md',workspaceMarkdownNamed('Business','Tiinex/business'));
  await put(business,'.topics/task.trace.md',businessTask);
  await put(business,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task:businessTask,roleRef,processRef,policyRef,title:'Business Route'}));
  const roleFile=await put(ext,'role.trace.md',roleMarkdown());
  const processFile=await put(ext,'process.trace.md',guidanceMarkdown('Execution Process','Process-like required guidance'));
  const policyFile=await put(ext,'policy.trace.md',guidanceMarkdown('Acceptance Policy Guidance','Policy-like required guidance'));
  const materialBindings={
    [roleRef]:{sourcePath:roleFile,referenceTarget:roleRef,provenance:{workspaceId:'business',path:'.topics/roles/fixture-anchor-role.trace.md'}},
    [processRef]:{sourcePath:processFile,referenceTarget:processRef,provenance:{workspaceId:'business',path:'.topics/processes/fixture-process.trace.md'}},
    [policyRef]:{sourcePath:policyFile,referenceTarget:policyRef,provenance:{workspaceId:'business',path:'.topics/governance/fixture-policy.trace.md'}}
  };
  const input=await prepareNodeHandoffManufacturingInput({
    workspaceRoot:work,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',
    handoffRoutes:[
      {workspaceId:'work',path:'.topics/handoffs/001-handoff.trace.md'},
      {workspaceId:'business',path:'.topics/handoffs/001-handoff.trace.md'}
    ],
    additionalWorkspaces:[{id:'business',root:business,workspaceTargetPath:'.topics/.workspaces/tiinex-business.workspace.md'}],
    materialBindings,runtimeRoot:path.resolve('.')
  });
  return {input};
}

test('direct Package V1 carries participant Role in a second Workspace without cache duplication and keeps authoritative Handoff in the route Workspace',async()=>{
  const {input}=await participantMatrixFixture({participantCarried:true,guidanceCarried:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready'); assert.equal(result.inspection.status,'valid'); assert.equal(result.roundtrip.status,'passed');
  assert.equal(result.inspection.workspaces.length,2); assert.equal(result.inspection.caches.length,0); assert.equal(result.inspection.routes.length,1);
  assert.deepEqual(result.inspection.workspaces.map((item)=>item.artifactPath),['001-3-work.workspace.md','001-4-business.workspace.md']);
  assert.deepEqual(result.inspection.workspaces.map((item)=>item.archivePath),['001-3-work.workspace.zip','001-4-business.workspace.zip']);
  const route=result.inspection.routes[0]; assert.equal(route.participantRolePointers.length,1); assert.equal(route.endpointRolePointers.length,2); assert.equal(route.groundingPointers.length,2);
  assert.match(route.pointerPath,/^001-3-/); assert.doesNotMatch(route.pointerPath,/^001-4-/);
  const participant=result.inspection.participantRoles.find((item)=>item.pointerPath===route.participantRolePointers[0]); assert.ok(participant); assert.equal(participant.targetCarrierKind,'workspace-archive-entry'); assert.equal(participant.targetWorkspaceId,'business'); assert.equal(participant.targetInnerPath,'.topics/roles/fixture-sigma-role.trace.md');
  for(const pointerPath of route.groundingPointers){const p=result.inspection.groundingPointers.find((item)=>item.pointerPath===pointerPath);assert.equal(p.targetCarrierKind,'workspace-archive-entry');assert.equal(p.targetWorkspaceId,'work');}
  assert.equal(route.workspaceId,'work'); assert.equal(route.workspaceRelativeHandoffPath,'.topics/handoffs/001-handoff.trace.md');
});

test('Package V1 creates at most one local cache per route-owning Workspace and resolves identical detached material through each local branch',async()=>{
  const {input}=await twoRouteWorkspaceCacheFixture();
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); assert.equal(result.inspection.status,'valid'); assert.equal(result.roundtrip.status,'passed');
  assert.deepEqual(result.inspection.workspaces.map((item)=>item.artifactPath),['001-3-work.workspace.md','001-4-business.workspace.md']);
  assert.deepEqual(result.inspection.caches.map((item)=>item.artifactPath),['001-3-1-cache.trace.md','001-4-1-cache.trace.md']);
  assert.deepEqual(result.inspection.caches.map((item)=>item.workspaceId),['work','business']);
  assert.equal(result.inspection.routes.length,2);
  const workRoute=result.inspection.routes.find((item)=>item.workspaceId==='work'); const businessRoute=result.inspection.routes.find((item)=>item.workspaceId==='business'); assert.ok(workRoute); assert.ok(businessRoute);
  assert.match(workRoute.pointerPath,/^001-3-1-/); assert.match(businessRoute.pointerPath,/^001-4-1-/);
  for(const route of [workRoute,businessRoute]){
    assert.equal(route.requiredClosure.state,'qualified'); assert.equal(route.groundingPointers.length,2); assert.equal(route.endpointRolePointers.length,2);
    const grounded=groundPortableColdConsumer({bundle:result.bundle,route:route.pointerPath,interactionMode:'execution'}); assert.equal(grounded.status,'ready',JSON.stringify(grounded.findings||[],null,2));
    const readiness=projectPortableGroundingReadiness({bundle:result.bundle,route:route.pointerPath,interactionMode:'execution',includeCurrentWork:true}); assert.equal(readiness.readiness.state,'grounded-to-act',JSON.stringify(readiness,null,2));
  }
  const cacheEntrySets=result.inspection.caches.map((cache)=>cache.archive.entries.map((entry)=>entry.path).sort()); assert.deepEqual(cacheEntrySets[0],cacheEntrySets[1]); assert.equal(cacheEntrySets[0].length,3);
});

test('direct Package V1 external participant plus endpoint/process/policy closure uses bounded readable cache and grounds from physical bytes',async()=>{
  const {input}=await participantMatrixFixture({participantCarried:false,guidanceCarried:false});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready'); assert.equal(result.inspection.status,'valid'); assert.equal(result.roundtrip.status,'passed'); assert.equal(result.inspection.caches.length,1);
  const route=result.inspection.routes[0]; assert.equal(route.participantRolePointers.length,1); assert.equal(route.endpointRolePointers.length,2); assert.equal(route.groundingPointers.length,2); assert.equal(route.requiredClosure.state,'qualified');
  const participant=result.inspection.participantRoles.find((item)=>item.pointerPath===route.participantRolePointers[0]); assert.ok(participant); assert.equal(participant.targetCarrierKind,'bounded-cache-entry');
  const cachePaths=result.inspection.caches[0].archive.entries.map((entry)=>entry.path).sort();
  assert.deepEqual(cachePaths,[
    `github/Tiinex/business/${COMMIT}/.topics/governance/fixture-policy.trace.md`,
    `github/Tiinex/business/${COMMIT}/.topics/processes/fixture-process.trace.md`,
    `github/Tiinex/business/${COMMIT}/.topics/roles/fixture-sigma-role.trace.md`
  ]);
  assert.equal(cachePaths.some((p)=>p.startsWith('material/')||p.endsWith('.bin')),false);
  const orientation=orientColdConsumerFromHandoffPackage({bundle:result.bundle}); assert.equal(orientation.status,'ready');
  const grounded=groundPortableColdConsumer({bundle:result.bundle,route:orientation.routes[0].pointerPath,interactionMode:'execution'}); assert.equal(grounded.status,'ready');
  const readiness=projectPortableGroundingReadiness({bundle:result.bundle,route:orientation.routes[0].pointerPath,interactionMode:'execution',includeCurrentWork:true}); assert.equal(readiness.readiness.state,'grounded-to-act'); assert.equal(readiness.continuity.state,'qualified');
  assert.equal((readiness.capsule?.participantContext?.roleGrounding||[]).some((item)=>String(item.label||'')==='Sigma'),true);
});


async function multiParticipantFixture({participants=[],carriedLabels=[],overlapAnchor=false}={}){
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-multi-participant-work-'));
  const business=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-multi-participant-business-'));
  const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-multi-participant-ext-'));
  const task=taskMarkdown();
  const refFor=(label,kind='roles')=>`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/${kind}/${label.toLowerCase()}.trace.md`;
  const anchorRef=refFor('anchor'); const processRef=refFor('process','processes'); const policyRef=refFor('policy','governance');
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspaceMarkdownNamed('Work','Example/work')); await put(root,'.topics/task.trace.md',task);
  await put(root,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task,roleRef:anchorRef,processRef,policyRef,title:'Multi Participant Matrix Route'}));
  const specs=[['Anchor',anchorRef,'.topics/roles/anchor.trace.md',roleMarkdownNamed('Anchor')],['Process',processRef,'.topics/processes/process.trace.md',guidanceMarkdown('Execution Process','Process-like required guidance')],['Policy',policyRef,'.topics/governance/policy.trace.md',guidanceMarkdown('Acceptance Policy Guidance','Policy-like required guidance')],...participants.map((label)=>[label,refFor(label),`.topics/roles/${label.toLowerCase()}.trace.md`,roleMarkdownNamed(label)])];
  const carried=new Set(carriedLabels); const bindings={}; let businessUsed=false;
  if(specs.some(([label])=>carried.has(label))){await put(business,'.topics/.workspaces/tiinex-business.workspace.md',workspaceMarkdownNamed('Business','Tiinex/business')); businessUsed=true;}
  for(const [label,reference,p,markdown] of specs){
    const sourcePath=carried.has(label)?await put(business,p,markdown):await put(ext,`${label.toLowerCase()}.trace.md`,markdown);
    bindings[reference]={sourcePath,referenceTarget:reference,provenance:{workspaceId:'business',path:p},source:{adapterId:'github',identity:'Tiinex/business',version:COMMIT,path:p}};
  }
  const participantRoles=participants.map((label)=>({label,workspaceId:'business',path:`.topics/roles/${label.toLowerCase()}.trace.md`,reference:refFor(label)}));
  if(overlapAnchor) participantRoles.push({label:'Anchor',workspaceId:'business',path:'.topics/roles/anchor.trace.md',reference:anchorRef});
  const routeRef=`https://github.com/Example/work/blob/${COMMIT}/.topics/handoffs/001-handoff.trace.md`;
  const input=await prepareNodeHandoffManufacturingInput({workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',handoffRoutes:[{workspaceId:'work',path:'.topics/handoffs/001-handoff.trace.md',reference:routeRef,participantRoles}],additionalWorkspaces:businessUsed?[{id:'business',root:business,workspaceTargetPath:'.topics/.workspaces/tiinex-business.workspace.md'}]:[],materialBindings:bindings,runtimeRoot:path.resolve('.')});
  return {input,refs:{anchorRef,processRef,policyRef,routeRef,participantRefs:Object.fromEntries(participants.map((label)=>[label,refFor(label)]))}};
}

test('Package V1 supports three cache-only participant Roles with stable independent pointers',async()=>{
  const {input,refs}=await multiParticipantFixture({participants:['Sigma','Loom','Axiom']}); const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); const route=result.inspection.routes[0]; assert.equal(route.participantRolePointers.length,3); assert.equal(route.endpointRolePointers.length,2); assert.equal(route.groundingPointers.length,2); assert.equal(route.referenceTarget,refs.routeRef); assert.equal(route.referenceTarget.includes('::'),false);
  const participantPointers=route.participantRolePointers.map((p)=>result.inspection.participantRoles.find((item)=>item.pointerPath===p)); assert.deepEqual(participantPointers.map((p)=>p.roleLabelHint).sort(),['Axiom','Loom','Sigma']); assert.equal(new Set(participantPointers.map((p)=>p.requirementId)).size,3);
  assert.deepEqual(participantPointers.map((p)=>p.referenceTarget).sort(),Object.values(refs.participantRefs).sort()); assert.equal(participantPointers.every((p)=>p.targetCarrierKind==='bounded-cache-entry'),true);
  const cachePaths=result.inspection.caches[0].archive.entries.map((e)=>e.path).sort(); for(const label of ['axiom','loom','sigma']) assert.ok(cachePaths.includes(`github/Tiinex/business/${COMMIT}/.topics/roles/${label}.trace.md`),JSON.stringify(cachePaths));
  const readiness=projectPortableGroundingReadiness({bundle:result.bundle,route:route.pointerPath,interactionMode:'execution'}); assert.equal(readiness.readiness.state,'grounded-to-act');
});

test('Package V1 resolves three permalink participant Roles from carried Workspace without cache duplication',async()=>{
  const labels=['Anchor','Process','Policy','Sigma','Loom','Axiom']; const {input,refs}=await multiParticipantFixture({participants:['Sigma','Loom','Axiom'],carriedLabels:labels}); const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); assert.equal(result.inspection.caches.length,0); assert.equal(result.inspection.workspaces.length,2);
  const route=result.inspection.routes[0]; assert.equal(route.participantRolePointers.length,3); const participantPointers=route.participantRolePointers.map((p)=>result.inspection.participantRoles.find((item)=>item.pointerPath===p)); assert.equal(participantPointers.every((p)=>p.targetCarrierKind==='workspace-archive-entry'&&p.targetWorkspaceId==='business'),true); assert.deepEqual(participantPointers.map((p)=>p.referenceTarget).sort(),Object.values(refs.participantRefs).sort());
  assert.equal(result.bundle.files.some((f)=>String(f.path||'').includes('cache')),false);
});

test('Package V1 endpoint-participant overlap keeps distinct pointer semantics but one exact material copy',async()=>{
  const {input,refs}=await multiParticipantFixture({participants:['Sigma'],overlapAnchor:true}); const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); const route=result.inspection.routes[0]; assert.equal(route.endpointRolePointers.length,2); assert.equal(route.participantRolePointers.length,2);
  const anchorEndpoint=result.inspection.endpointRoles.filter((p)=>p.referenceTarget===refs.anchorRef); const anchorParticipant=result.inspection.participantRoles.filter((p)=>p.referenceTarget===refs.anchorRef); assert.equal(anchorEndpoint.length,2); assert.equal(anchorParticipant.length,1); assert.equal(anchorEndpoint[0].targetArchiveEntry,anchorParticipant[0].targetArchiveEntry); assert.equal(anchorEndpoint[0].targetSha256,anchorParticipant[0].targetSha256);
  const cachePaths=result.inspection.caches[0].archive.entries.map((e)=>e.path); assert.equal(cachePaths.filter((p)=>p===`github/Tiinex/business/${COMMIT}/.topics/roles/anchor.trace.md`).length,1,JSON.stringify(cachePaths));
});

test('Package V1 supports mixed carried and cache participant Roles without duplicating carried bytes',async()=>{
  const {input}=await multiParticipantFixture({participants:['Sigma','Loom','Axiom'],carriedLabels:['Sigma','Process']}); const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2)); const route=result.inspection.routes[0]; assert.equal(route.participantRolePointers.length,3);
  const participants=route.participantRolePointers.map((p)=>result.inspection.participantRoles.find((item)=>item.pointerPath===p)); const sigma=participants.find((p)=>p.roleLabelHint==='Sigma'); const loom=participants.find((p)=>p.roleLabelHint==='Loom'); const axiom=participants.find((p)=>p.roleLabelHint==='Axiom'); assert.equal(sigma.targetCarrierKind,'workspace-archive-entry'); assert.equal(loom.targetCarrierKind,'bounded-cache-entry'); assert.equal(axiom.targetCarrierKind,'bounded-cache-entry');
  const cachePaths=result.inspection.caches[0].archive.entries.map((e)=>e.path); assert.equal(cachePaths.includes(`github/Tiinex/business/${COMMIT}/.topics/roles/sigma.trace.md`),false); assert.equal(cachePaths.includes(`github/Tiinex/business/${COMMIT}/.topics/roles/loom.trace.md`),true,JSON.stringify(cachePaths)); assert.equal(cachePaths.includes(`github/Tiinex/business/${COMMIT}/.topics/roles/axiom.trace.md`),true);
});


test('Package V1 GitHub cache identity isolates the same repository path across distinct exact commits',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-cache-versioned-work-')); const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-cache-versioned-ext-'));
  const task=taskMarkdown(); await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspaceMarkdown()); await put(root,'.topics/task.trace.md',task); await put(root,'.topics/roles/anchor.trace.md',roleMarkdown());
  const otherCommit='b'.repeat(40); const sharedPath='.topics/shared/same.trace.md'; const processRef=`https://github.com/Tiinex/business/blob/${COMMIT}/${sharedPath}`; const policyRef=`https://github.com/Tiinex/business/blob/${otherCommit}/${sharedPath}`;
  await put(root,'.topics/handoffs/001-handoff.trace.md',handoffMarkdown({task,roleRef:'work::.topics/roles/anchor.trace.md',processRef,policyRef,title:'Versioned Cache Identity'}));
  const processFile=await put(ext,'process.trace.md',guidanceMarkdown('Process Version','first exact bytes')); const policyFile=await put(ext,'policy.trace.md',guidanceMarkdown('Policy Version','second distinct exact bytes'));
  const bindings={
    [processRef]:{sourcePath:processFile,referenceTarget:processRef,provenance:{workspaceId:'business',path:sharedPath},source:{adapterId:'github',identity:'Tiinex/business',version:COMMIT,path:sharedPath}},
    [policyRef]:{sourcePath:policyFile,referenceTarget:policyRef,provenance:{workspaceId:'business',path:sharedPath},source:{adapterId:'github',identity:'Tiinex/business',version:otherCommit,path:sharedPath}}
  };
  const input=await prepareNodeHandoffManufacturingInput({workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',materialBindings:bindings,runtimeRoot:path.resolve('.')});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true}); assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  const cachePaths=result.inspection.caches[0].archive.entries.map((entry)=>entry.path).sort();
  assert.deepEqual(cachePaths,[`github/Tiinex/business/${COMMIT}/${sharedPath}`,`github/Tiinex/business/${otherCommit}/${sharedPath}`].sort());
});

test('return manufacture reuses exact immutable participant Role from package-parent cache without inventing a Workspace identity',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-parent-cache-participant-return-'));
  const ext=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-parent-cache-participant-material-'));
  const task=taskMarkdownWithParticipant('Sigma');
  const anchor=roleMarkdownNamed('Anchor'); const sigma=roleMarkdownNamed('Sigma');
  const anchorRef=`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-anchor-role.trace.md`;
  const sigmaRef=`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/roles/fixture-sigma-role.trace.md`;
  await put(root,'.topics/.workspaces/tiinex-work.workspace.md',workspaceMarkdown());
  await put(root,'.topics/task.trace.md',task);
  const parentHandoff=handoffMarkdown({task,roleRef:anchorRef,title:'Participant Parent Route'});
  await put(root,'.topics/handoffs/001-handoff.trace.md',parentHandoff);
  const anchorFile=await put(ext,'anchor.trace.md',anchor); const sigmaFile=await put(ext,'sigma.trace.md',sigma);
  const bindings={
    [anchorRef]:{sourcePath:anchorFile,referenceTarget:anchorRef,source:{adapterId:'github',identity:'Tiinex/business',version:COMMIT,path:'.topics/roles/fixture-anchor-role.trace.md'}},
    [sigmaRef]:{sourcePath:sigmaFile,referenceTarget:sigmaRef,source:{adapterId:'github',identity:'Tiinex/business',version:COMMIT,path:'.topics/roles/fixture-sigma-role.trace.md'}}
  };
  const parentInput=await prepareNodeHandoffManufacturingInput({
    workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-handoff.trace.md',
    handoffRoutes:[{workspaceId:'work',path:'.topics/handoffs/001-handoff.trace.md',participantRoles:[{label:'Sigma',reference:sigmaRef}]}],
    materialBindings:bindings,carrierLineage:initialHandoffCarrierLineage('minimal-coldstart'),runtimeRoot:path.resolve('.')
  });
  const parent=manufactureRecipientRelativeHandoffPackage(parentInput,{verifyRoundtrip:true});
  assert.equal(parent.status,'ready',JSON.stringify(parent.findings||[],null,2));
  assert.equal(parent.inspection.caches.length,1);
  assert.equal(parent.inspection.participantRoles.some((item)=>item.referenceTarget===sigmaRef),true);

  await put(root,'result.md','# Bounded result\n');
  const childHandoff=returnHandoffMarkdown({parentHandoff,anchorRef,sigmaRef});
  await put(root,'.topics/handoffs/001-1-return.trace.md',childHandoff);
  const childInput=await prepareNodeHandoffManufacturingInput({
    workspaceRoot:root,workspaceId:'work',workspaceTargetPath:'.topics/.workspaces/tiinex-work.workspace.md',handoffPath:'.topics/handoffs/001-1-return.trace.md',
    packageParentBundle:parent.bundle,packageParentPath:'/received/minimal-coldstart-001-anchor-to-anchor.handoff-package.zip',packageParentSha256:'c'.repeat(64),packageParentRoutePointer:parent.inspection.routes[0].pointerPath,
    carrierLineage:continueHandoffCarrierLineage(initialHandoffCarrierLineage('minimal-coldstart'),1),runtimeRoot:path.resolve('.')
  });
  const child=manufactureRecipientRelativeHandoffPackage(childInput,{verifyRoundtrip:true});
  assert.equal(child.status,'ready',JSON.stringify(child.findings||[],null,2));
  const route=child.inspection.routes[0];
  const participant=child.inspection.participantRoles.find((item)=>item.referenceTarget===sigmaRef);
  assert.ok(participant);
  assert.equal(participant.targetCarrierKind,'bounded-cache-entry');
  assert.equal(participant.targetWorkspaceId,'');
  assert.equal(route.participantRolePointers.includes(participant.pointerPath),true);
  const human=projectHandoffHumanOutput({projection:child.carrierProjection});
  assert.equal(human.status,'ready');
  assert.equal(human.primary.filename,'minimal-coldstart-001-1-anchor-to-sigma.handoff-package.zip');
});

test('physical Package V1 ZIP alone can be loaded, oriented, grounded and continued into an empty output Workspace',async()=>{
  const {input}=await participantMatrixFixture({participantCarried:false,guidanceCarried:false});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true}); assert.equal(result.status,'ready');
  const temp=await mkdtemp(path.join(tmpdir(),'tiinex-package-v1-zip-only-')); const zipPath=path.join(temp,'handoff-package.zip'); const output=path.join(temp,'continued-workspace');
  await writeFile(zipPath,handoffPackageV1ZipBytes(result.bundle));
  const bundle=await loadNodePortableInput([zipPath]);
  const orientation=orientColdConsumerFromHandoffPackage({bundle}); assert.equal(orientation.status,'ready'); assert.equal(orientation.bootstrapInspection?.status,'valid');
  const route=orientation.routes[0].pointerPath;
  const grounded=groundPortableColdConsumer({bundle,route,interactionMode:'execution'}); assert.equal(grounded.status,'ready');
  const readiness=projectPortableGroundingReadiness({bundle,route,interactionMode:'execution',includeCurrentWork:true}); assert.equal(readiness.readiness.state,'grounded-to-act'); assert.equal(readiness.continuity.state,'qualified');
  const continued=await materializeGroundWorkspaceCliOutput(readiness,{bundle,packageSourcePath:zipPath,route},{continue:output}); assert.equal(continued.continuationMaterialization.state,'materialized'); assert.equal(continued.continuationMaterialization.workspaceId,'work');
  const continuation=JSON.parse(await readFile(path.join(output,'.tiinex','continuation.json'),'utf8')); assert.equal(continuation.selectedHandoffPath,'.topics/handoffs/001-handoff.trace.md'); assert.equal(continuation.workspaceId,'work'); assert.match(continuation.packageParentSha256,/^[0-9a-f]{64}$/); assert.equal(continuation.guidanceOperationSelection.priorHostToolChoiceCarriesAcrossHumanTurn,false); assert.equal(continuation.returnDiscipline.manualPackageConstruction,'forbidden'); assert.equal(continuation.returnDiscipline.deliveryRequiresCanonicalManufactureAndQualification,true); assert.equal(continuation.returnDiscipline.humanDeliveryRequiresHostNativeSurface,true); assert.equal(continuation.returnDiscipline.runtimeLocalPathIsHumanDeliveryEvidence,false); assert.equal(continuation.returnDiscipline.deliveryClaimRequiresHumanVisibleArtifact,true);
  await rm(temp,{recursive:true,force:true});
});

test('Package V1 rejects sibling-route pointer borrowing even when Parent integrity and self integrity are recomputed',async()=>{
  const {input}=await fixture({external:true,multi:true});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true}); assert.equal(result.status,'ready');
  const [routeA,routeB]=result.inspection.routes; const foreignParentPath=routeA.pointerPath; assert.ok(foreignParentPath);
  const childFile=result.bundle.files.find((file)=>file.path===routeB.pointerPath); const parentFile=result.bundle.files.find((file)=>file.path===foreignParentPath); assert.ok(childFile); assert.ok(parentFile);
  const parentText=decodeFile(parentFile); const parentDigest=validatedC14nV2PrimarySelfDigest(parentText); assert.equal(parentDigest.state,'verified');
  let childText=decodeFile(childFile);
  childText=childText.replace(/(- Trace: \[[^\]]+\]\()[^)]+(\))/m,`$1${foreignParentPath}$2`)
    .replace(/(\[relative\]\()[^)]+(\))/m,`$1${foreignParentPath}$2`)
    .replace(/(- Towards: \[[^\]]+\]\()[^)]+(\)\n  - Value: )[A-Za-z0-9_-]+/m,`$1${foreignParentPath}$2${parentDigest.value}`);
  const resealed=sealC14nV2Self(childText); assert.equal(resealed.state,'sealed');
  const mutated=bundleWithFileData(result.bundle,childFile.path,`${resealed.markdown}\n`);
  const inspection=inspectHandoffPackageV1(mutated); assert.equal(inspection.status,'invalid');
  assert.equal(inspection.findings.some((item)=>item.code==='portable.handoff-package-v1.trace.numeric-parent-mismatch'),true);
});

test('Package V1 never exposes Workspace-qualified coordinates as public Pointer Reference values',async()=>{
  const {input}=await fixture({external:false});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  const pointers=result.bundle.files.filter((file)=>String(file.path||'').endsWith('-pointer.trace.md')).map((file)=>decodeFile(file));
  assert.equal(pointers.some((markdown)=>/^- Reference:\s*[^\n]*::/mi.test(markdown)),false);
  const route=result.inspection.routes[0];
  assert.equal(route.referenceTarget,'');
  for(const pointer of result.inspection.endpointRoles) assert.equal(pointer.referenceTarget,'');
});

test('Package V1 preserves adapter-native permalink Reference while using carried Workspace coordinates only for resolution',async()=>{
  const {input,refs}=await multiParticipantFixture({participants:['Sigma'],carriedLabels:['Anchor','Process','Policy','Sigma']});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  const route=result.inspection.routes[0];
  assert.equal(route.referenceTarget,refs.routeRef);
  const sigma=result.inspection.participantRoles.find((item)=>item.roleLabelHint==='Sigma');
  assert.equal(sigma.referenceTarget,refs.participantRefs.Sigma);
  assert.equal(sigma.targetCarrierKind,'workspace-archive-entry');
  assert.equal(sigma.targetWorkspaceId,'business');
  assert.equal(sigma.targetInnerPath,'.topics/roles/sigma.trace.md');
});

test('Package V1 root pointer chain is limited to pre-Handoff grounding plus participants/endpoints/Handoff',async()=>{
  const {input}=await multiParticipantFixture({participants:['Sigma','Loom','Axiom']});
  const result=manufactureRecipientRelativeHandoffPackage(input,{verifyRoundtrip:true});
  assert.equal(result.status,'ready',JSON.stringify(result.findings||[],null,2));
  const route=result.inspection.routes[0];
  assert.equal(route.groundingPointers.length,2);
  assert.deepEqual(route.groundingPointers.map((pointerPath)=>result.inspection.groundingPointers.find((item)=>item.pointerPath===pointerPath)?.pointerKind).sort(),['policy','process']);
  assert.equal(route.participantRolePointers.length,3);
  assert.equal(route.endpointRolePointers.length,2);
  const names=[...route.groundingPointers,...route.participantRolePointers,...route.endpointRolePointers,route.pointerPath];
  assert.equal(names.some((name)=>/task|evidence|workspace-pointer/i.test(String(name||''))),false,JSON.stringify(names,null,2));
});

test('Package V1 cache identity fails closed for unpinned GitHub and unsupported external adapters',()=>{
  const branch=projectHandoffPackageV1CacheIdentity({referenceTarget:'https://github.com/Tiinex/business/blob/main/.topics/roles/anchor.trace.md'});
  assert.equal(branch.state,'unqualified');
  assert.equal(branch.sourceAdapter,'github');
  assert.equal(branch.archiveEntry,'');

  const unsupportedExplicit=projectHandoffPackageV1CacheIdentity({sourceAdapter:'gitlab',sourceIdentity:'Tiinex/business',sourceVersion:'abc',sourcePath:'.topics/roles/anchor.trace.md'});
  assert.equal(unsupportedExplicit.state,'unsupported-adapter');
  assert.equal(unsupportedExplicit.sourceAdapter,'gitlab');
  assert.equal(unsupportedExplicit.archiveEntry,'');

  const unsupportedUrl=projectHandoffPackageV1CacheIdentity({referenceTarget:'https://example.com/Tiinex/business/anchor.trace.md',sourceWorkspaceId:'business',sourcePath:'.topics/roles/anchor.trace.md'});
  assert.equal(unsupportedUrl.state,'unsupported-adapter');
  assert.equal(unsupportedUrl.archiveEntry,'');
});


test('embedded LLM bootstrap teaches qualified carrier naming without turning filename lineage into semantic Parent authority', async()=>{
  const text=await readFile(new URL('../src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md',import.meta.url),'utf8');
  assert.match(text,/Preserve the package-declared Carrier Prefix through continuations/);
  assert.match(text,/<carrier-prefix>-<numeric-dimension>-<from-role>-to-<to-role>\.handoff-package\.zip/);
  assert.match(text,/Do not invent or rename the prefix from chat, folder names, Task titles, test labels, or personal preference/);
  assert.match(text,/never substitute for semantic `Parent`/);
});
