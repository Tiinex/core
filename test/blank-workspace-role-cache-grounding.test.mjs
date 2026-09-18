import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../src/tooling/portable/adapters/node/handoff.manufacture.js';
import { preparePackageParentExactMaterialProvider, projectPackageParentMaterialClosurePreflight } from '../src/tooling/portable/adapters/node/handoff.manufacture.packageParent.js';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { orientColdConsumerFromHandoffPackage } from '../src/tooling/portable/handoff/coldConsumerEntrypoint.js';
import { groundPortableColdConsumer } from '../src/tooling/portable/handoff/coldStartQualification.grounding.js';
import { projectPortableGroundingReadiness } from '../src/tooling/portable/grounding/grounding.readiness.js';
import { inspectRecipientFacingV2PackageV1 } from '../src/tooling/portable/handoff/recipientV2.packageV1.js';
import { inspectRecipientFacingV2Topology } from '../src/tooling/portable/handoff/recipientV2.inspect.js';
import { roleMaterialTarget } from '../src/tooling/portable/handoff/recipientV2.topology.materials.js';
import { packageFileBytes } from '../src/export/package.bytes.js';
import { projectGroundingParticipantContext } from '../src/tooling/portable/grounding/grounding.participantContext.js';
import { projectGroundingProcessApplicability } from '../src/tooling/portable/grounding/grounding.processApplicability.js';
import { projectGroundingImplementationSourceAuthority } from '../src/tooling/portable/grounding/grounding.implementationSourceAuthority.js';
import { projectGroundingSourceEvidence } from '../src/tooling/portable/grounding/grounding.sourceEvidence.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.workspace.v1.schema.md';
const ROLE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';
const HANDOFF_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md';
const TASK_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const CORE_WORKSPACE_PATH = '.topics/.workspaces/tiinex-core.workspace.md';
const BUSINESS_WORKSPACE_PATH = '.topics/.workspaces/tiinex-business.workspace.md';
const DOCS_WORKSPACE_PATH = '.topics/.workspaces/tiinex-docs.workspace.md';
const ROUTE_PATH = '.topics/handoffs/return.trace.md';
const GOVERNANCE_PATH = '.topics/governance/current.trace.md';
const PROCESS_PATH = '.topics/processes/current.trace.md';
const NEARBY_ROLE_PATH = '.topics/roles/unselected-observer-role.trace.md';
const NEARBY_PROCESS_PATH = '.topics/processes/unselected-nearby.trace.md';
const ANCHOR_ROLE_PATH = '.topics/roles/anchor-role.trace.md';
const LOOM_ROLE_PATH = '.topics/roles/loom-role.trace.md';
const AXIOM_ROLE_PATH = '.topics/roles/axiom-role.trace.md';
const PARENT_PATH = '.topics/parent.trace.md';
const BUSINESS_EPIC_PATH = '.topics/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md';
const BUSINESS_TOOLING_PROJECT_PATH = '.topics/001-2-tooling-project.trace.md';

function seal(markdown) { const sealed = sealC14nV2Self(markdown); assert.equal(sealed.state, 'sealed'); return `${sealed.markdown}\n`; }
function workspaceFixture(title, repository) { return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-09-15 00:00:00\n  - Authors: Fixture\n  - Why: Exercise blank/minimal Workspace cache grounding.\n  - Summary: Portable Workspace entrypoint for ${repository}.\n  - Status: active/local\n\n---\n\n# ${title}\n\n## Schema Origins\n\n- [Tiinex docs schemas](https://github.com/Tiinex/docs/tree/master/.topics/.schemas)\n  - Kind: github-tree\n  - Repository: Tiinex/docs\n  - Ref: master\n  - Root Path: .topics/.schemas\n  - Trust Role: canonical-core\n\n## Workspace Entrypoints\n\n### ${title}\n\n- Source Kind: local-directory\n- Repository: ${repository}\n- Root Path: .\n- Repo Files Discovery: on\n\n## Workspace Boundary\n\nBlank/minimal carrier regression fixture only.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`); }
function roleFixture(label, assignmentModes = 'explicit-session, handoff') { return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE_SCHEMA_TARGET})\n  - Created At: 2026-09-15 00:00:00\n  - Authors: Fixture\n  - Why: Exercise cache-carried endpoint Role grounding.\n  - Summary: ${label} Role fixture.\n  - Status: active/local\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: operational\n\n## Role Boundary\n\n- In Scope: blank/minimal cache grounding regression\n- Out Of Scope: all other authority\n\n## Authority And Responsibility Boundary\n\n- May Do: exercise the fixture route\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: ${assignmentModes}\n\n## Interpretation Limits\n\n- Does Not Prove: human identity or authority beyond the fixture\n- Must Not Be Treated As: semantic participation or durable holder identity\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`); }
async function writeWorkspaceFile(root, relativePath, data) { const target = path.join(root, ...relativePath.split('/')); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, data); }

function selectedAxiomTaskFixture({ selectorDeclaration = 'Axiom is the explicitly selected specialist for this review.' } = {}) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})\n  - Created At: 2026-09-16 00:00:00\n  - Authors: Fixture\n  - Why: Exercise downstream delegate selection independently from inbound recipient.\n  - Summary: Anchor-held review task selecting Axiom.\n  - Status: ready/local\n\n---\n\n# Fresh Anchor Delegation Acceptance — Axiom Review\n\n## Objective\n\nObtain one bounded independent semantic review.\n\n${selectorDeclaration}\n\n## Done Criteria\n\n- Axiom receives one bounded semantic-review assignment.\n- Anchor does not substitute its own semantic answer.\n\n## Scope\n\nWritable acceptance surface: Docs \`.topics/grounding/**\` and \`.topics/grounding/handoffs/**\` only.\n\n## Dependencies\n\n- exact qualified Anchor Role material;\n- exact qualified Axiom Role material.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

function lineageTaskFixture({ title, summary, parentReference = '', parentDigest = '', createdAt = '2026-09-16 00:00:00' }) {
  const parentBlock = parentReference ? `- Parent\n  - Parent Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})\n  - Created At: 2026-09-15 23:59:00\n  - Trace: [Parent](${parentReference})\n` : '';
  const parentIntegrity = parentReference ? `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Parent](${parentReference})\n  - Value: ${parentDigest}\n\n` : '';
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n${parentBlock}- Current\n  - Current Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Authors: Fixture\n  - Why: Exercise exact external Parent closure across cache-only material.\n  - Summary: ${summary || title}.\n  - Status: ready/local\n\n---\n\n# ${title}\n\n## Objective\n\nProve exact selected-route Parent closure.\n\n## Done Criteria\n\nThe selected route reaches a qualified semantic root without sibling traversal or repository search.\n\n## Scope\n\nFixture only.\n\n## Dependencies\n\nExact declared Parent material only.\n\n# Continuity Integrity\n\n${parentIntegrity}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

function anchorToAnchorDelegationHandoffFixture(taskPath, taskMarkdown) {
  const digest = validatedC14nV2PrimarySelfDigest(taskMarkdown);
  assert.equal(digest.state, 'verified');
  const taskBasename = path.posix.basename(taskPath);
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Parent\n  - Parent Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})\n  - Created At: 2026-09-16 00:00:00\n  - Trace: [Fresh Anchor Delegation Acceptance](../${taskBasename})\n  - Origin:\n    - [relative](../${taskBasename})\n- Current\n  - Current Schema: [tiinex.handoff.v1](${HANDOFF_SCHEMA_TARGET})\n  - Created At: 2026-09-16 00:01:00\n  - Authors: Fixture\n  - Why: Exercise inbound Anchor/current-holder versus downstream Axiom delegate.\n  - Summary: Anchor to Anchor delegation acceptance fixture.\n  - Status: ready/local\n\n---\n\n# Anchor To Anchor — Blank-Workspace Qualified Delegation Acceptance\n\n## Handoff Parties\n\n- Purpose: continue one bounded Task whose downstream semantic review is assigned to Axiom.\n- From: Anchor\n- From Kind: role\n- From Reference: [Anchor Role](business::${ANCHOR_ROLE_PATH})\n- To: Anchor\n- To Kind: role\n- To Reference: [Anchor Role](business::${ANCHOR_ROLE_PATH})\n\n## Transfers\n\n- delegation-acceptance\n  - Transfer Kind: work-and-responsibility\n  - Description: continue the bounded acceptance task and obtain its selected specialist review.\n  - Controlling Artifact: [Fresh Anchor Delegation Acceptance](../${taskBasename})\n  - Boundary: Anchor remains the current holder; downstream specialist selection stays owned by current work.\n\n## Required Context\n\n- docs-workspace\n  - Material: bounded Docs Workspace acceptance surface.\n  - Material Reference: [Docs Workspace](docs::${DOCS_WORKSPACE_PATH})\n  - Purpose: local acceptance Task/Handoff authoring surface.\n  - Availability: available\n\n## Reference Context\n\n- none\n\n## Retained Responsibilities\n\n- acceptance-reconciliation\n  - Retained By: Anchor\n  - Responsibility: reconcile the returned specialist result.\n  - Boundary: specialist review does not imply acceptance.\n\n## Exclusions And Dependencies\n\n- no-specialist-substitution\n  - Kind: excluded-scope\n  - Description: Anchor must not perform the selected specialist review.\n  - Responsible Party Or Role: Anchor\n\n## Completion Expectation\n\n- Signal Kind: return\n- Signal Meaning: return qualified specialist work\n- Return To: Anchor\n\n## Interpretation Limits\n\n- Does Not Mean: cached Role material selects a delegate.\n- Must Not Be Used To Claim: inbound recipient identity and downstream delegate identity are the same claim.\n- Authority Limits: bounded fixture only.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Fresh Anchor Delegation Acceptance](../${taskBasename})\n  - Value: ${digest.value}\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

async function buildExternalParentCacheSourceCarrier(fixtureRoot, { includeProject }) {
  const coreRoot = path.join(fixtureRoot, includeProject ? 'source-core-complete' : 'source-core-bounded-stop');
  const businessRoot = path.join(fixtureRoot, includeProject ? 'source-business-complete' : 'source-business-bounded-stop');
  await mkdir(coreRoot, { recursive: true });
  await mkdir(businessRoot, { recursive: true });

  const project = lineageTaskFixture({ title: 'Tooling Project', summary: 'Qualified external semantic root for the recipient continuity fixture.', createdAt: '2026-09-15 23:58:00' });
  const projectDigest = validatedC14nV2PrimarySelfDigest(project);
  assert.equal(projectDigest.state, 'verified');
  const epic = lineageTaskFixture({
    title: 'Thin Lineage Anchor Grounding Orchestration Epic',
    summary: 'External Business epic whose declared Parent must remain reachable after cache transport.',
    parentReference: path.posix.basename(BUSINESS_TOOLING_PROJECT_PATH),
    parentDigest: projectDigest.value,
    createdAt: '2026-09-15 23:59:00'
  });
  const epicDigest = validatedC14nV2PrimarySelfDigest(epic);
  assert.equal(epicDigest.state, 'verified');
  const sourceRoutePath = '.topics/handoffs/cache-source.trace.md';
  const projectRequirement = includeProject ? `\n- Business Tooling Project\n  - Material: exact external Business project Parent\n  - Purpose: make the second external ancestor mechanically available to a later selected route\n  - Availability: available\n  - Material Reference: [Business Tooling Project](business::${BUSINESS_TOOLING_PROJECT_PATH})` : '';
  const sourceRoute = qualifiedHandoffFixture({
    title: includeProject ? 'External Parent cache source with complete chain' : 'External Parent cache source with deliberate bounded stop',
    from: 'Anchor', to: 'Loom',
    fromReference: `business::${ANCHOR_ROLE_PATH}`,
    toReference: `business::${LOOM_ROLE_PATH}`,
    requiredContext: `- Business Grounding Epic\n  - Material: exact external Business epic\n  - Purpose: seed exact cache material for later route-parent traversal\n  - Availability: available\n  - Material Reference: [Business Grounding Epic](business::${BUSINESS_EPIC_PATH})${projectRequirement}`
  });

  await writeWorkspaceFile(coreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Cache Source Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(coreRoot, sourceRoutePath, sourceRoute);
  await writeWorkspaceFile(businessRoot, BUSINESS_WORKSPACE_PATH, workspaceFixture('Tiinex Business Cache Source Fixture', 'Tiinex/business'));
  await writeWorkspaceFile(businessRoot, BUSINESS_EPIC_PATH, epic);
  await writeWorkspaceFile(businessRoot, BUSINESS_TOOLING_PROJECT_PATH, project);
  await writeWorkspaceFile(businessRoot, ANCHOR_ROLE_PATH, roleFixture('Anchor'));
  await writeWorkspaceFile(businessRoot, LOOM_ROLE_PATH, roleFixture('Loom'));
  await writeWorkspaceFile(businessRoot, AXIOM_ROLE_PATH, roleFixture('Axiom'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: sourceRoutePath,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [
      { workspaceId: 'core', coverage: 'bounded', include: [sourceRoutePath] },
      { workspaceId: 'business', coverage: 'bounded', include: [] }
    ],
    transportRoutes: [{
      workspaceId: 'core', path: sourceRoutePath,
      participantRoles: [{ label: 'Axiom', workspaceId: 'business', path: AXIOM_ROLE_PATH, reference: `business::${AXIOM_ROLE_PATH}` }]
    }],
    carrierLineage: { mode: 'continue', dimension: includeProject ? '001-1' : '001-2', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.roundtrip?.status, 'passed', JSON.stringify(result.roundtrip?.findings || [], null, 2));
  const cache = (result.inspection.caches || []).find((item) => item.workspaceId === 'core');
  assert.ok(cache);
  assert.ok((cache.materials || []).some((item) => item.targetPath === BUSINESS_EPIC_PATH || item.originalPath === BUSINESS_EPIC_PATH));
  assert.equal((cache.materials || []).some((item) => item.targetPath === BUSINESS_TOOLING_PROJECT_PATH || item.originalPath === BUSINESS_TOOLING_PROJECT_PATH), includeProject);
  return Object.freeze({ result, epicDigest: epicDigest.value, projectDigest: projectDigest.value });
}

test('minimal selected Workspace can ground from exact route-bounded cache Role and Required Context material', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-blank-cache-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const coreRoot = path.join(fixtureRoot, 'core');
  const businessRoot = path.join(fixtureRoot, 'business');
  await mkdir(coreRoot, { recursive: true }); await mkdir(businessRoot, { recursive: true });

  const governance = seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)\n  - Created At: 2026-09-15 00:00:00\n  - Authors: Fixture\n  - Why: exact cache Required Context.\n  - Summary: governance fixture.\n  - Status: ready/local\n\n---\n\n# Governance\n\n## Objective\n\nProvide exact Required Context.\n\n## Done Criteria\n\nQualified bytes are carried.\n\n## Scope\n\nFixture only.\n\n## Dependencies\n\nNone.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
  const parent = seal(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 00:00:01
  - Authors: Fixture
  - Why: exact cache selected Handoff Parent.
  - Summary: route Parent fixture.
  - Status: ready/local

---

# Route Parent

## Objective

Provide exact selected Handoff Parent bytes.

## Done Criteria

Qualified Parent bytes are carried.

## Scope

Fixture only.

## Dependencies

None.

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: 
`);
  const parentDigest = validatedC14nV2PrimarySelfDigest(parent);
  assert.equal(parentDigest.state, 'verified');
  const route = qualifiedHandoffFixture({
    from: 'Anchor', to: 'Loom',
    fromReference: `business::${ANCHOR_ROLE_PATH}`,
    toReference: `business::${LOOM_ROLE_PATH}`,
    parent: { trace: '../parent.trace.md', relative: '../parent.trace.md', towards: '../parent.trace.md', targetValue: parentDigest.value, includeBrowseGit: false },
    requiredContext: `- Business Governance\n  - Material: current governing Business artifact\n  - Purpose: exact cache Required Context regression\n  - Availability: available\n  - Material Reference: [Business Governance](business::${GOVERNANCE_PATH})\n- Process Contract\n  - Material: exact process material\n  - Purpose: prove cache availability remains distinct from process applicability\n  - Availability: available\n  - Material Reference: [Process Contract](business::${PROCESS_PATH})`
  });

  await writeWorkspaceFile(coreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(coreRoot, PARENT_PATH, parent);
  await writeWorkspaceFile(coreRoot, ROUTE_PATH, route);
  await writeWorkspaceFile(businessRoot, BUSINESS_WORKSPACE_PATH, workspaceFixture('Tiinex Business Fixture', 'Tiinex/business'));
  await writeWorkspaceFile(businessRoot, GOVERNANCE_PATH, governance);
  await writeWorkspaceFile(businessRoot, PROCESS_PATH, governance);
  await writeWorkspaceFile(businessRoot, NEARBY_ROLE_PATH, roleFixture('Observer'));
  await writeWorkspaceFile(businessRoot, NEARBY_PROCESS_PATH, governance);
  await writeWorkspaceFile(businessRoot, ANCHOR_ROLE_PATH, roleFixture('Anchor'));
  await writeWorkspaceFile(businessRoot, LOOM_ROLE_PATH, roleFixture('Loom'));
  await writeWorkspaceFile(businessRoot, AXIOM_ROLE_PATH, roleFixture('Axiom'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: ROUTE_PATH,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [
      { workspaceId: 'core', coverage: 'bounded', include: [ROUTE_PATH] },
      { workspaceId: 'business', coverage: 'bounded', include: [] }
    ],
    transportRoutes: [{
      workspaceId: 'core', path: ROUTE_PATH,
      participantRoles: [{ label: 'Axiom', workspaceId: 'business', path: AXIOM_ROLE_PATH, reference: `business::${AXIOM_ROLE_PATH}` }]
    }],
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });

  const business = prepared.workspaceMaterializations.find((workspace) => workspace.id === 'business');
  assert.equal(business.state, 'bounded');
  assert.deepEqual(business.includedEntries.map((entry) => entry.path), [BUSINESS_WORKSPACE_PATH]);
  assert.ok(prepared.materials.some((item) => item.provenance?.workspaceId === 'business' && item.provenance?.path === GOVERNANCE_PATH));
  assert.ok(prepared.materials.some((item) => item.provenance?.workspaceId === 'business' && item.provenance?.path === PROCESS_PATH));
  assert.equal(prepared.materials.some((item) => item.provenance?.path === NEARBY_ROLE_PATH), false);
  assert.equal(prepared.materials.some((item) => item.provenance?.path === NEARBY_PROCESS_PATH), false);
  assert.ok(prepared.materials.some((item) => item.provenance?.workspaceId === 'business' && item.provenance?.path === LOOM_ROLE_PATH));
  assert.ok(prepared.materials.some((item) => item.provenance?.workspaceId === 'business' && item.provenance?.path === AXIOM_ROLE_PATH));

  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.roundtrip?.status, 'passed', JSON.stringify(result.roundtrip?.findings || [], null, 2));
  const routeCache = (result.inspection.caches || []).find((cache) => cache.workspaceId === 'core');
  assert.ok(routeCache);
  assert.ok((routeCache.materials || []).some((item) => item.referenceTarget === `business::${GOVERNANCE_PATH}`));
  const processMaterial = (routeCache.materials || []).find((item) => item.referenceTarget === `business::${PROCESS_PATH}`);
  assert.ok(processMaterial);
  assert.ok((routeCache.materials || []).some((item) => item.referenceTarget === `business::${LOOM_ROLE_PATH}`));
  assert.ok((routeCache.materials || []).some((item) => item.referenceTarget === `business::${AXIOM_ROLE_PATH}`));
  assert.equal((result.inspection.participantRoles || []).length, 1);
  assert.equal(result.inspection.participantRoles[0].roleLabelHint, 'Axiom');
  assert.match(result.inspection.participantRoles[0].requirementId, /^participant-role:/);
  assert.equal(result.inspection.participantRoles[0].archivePath, routeCache.archivePath);
  assert.ok(result.inspection.participantRoles[0].targetArchiveEntry);
  assert.ok((routeCache.materials || []).some((item) => item.classification === 'parent-boundary' && (item.targetPath === PARENT_PATH || item.originalPath === PARENT_PATH)));

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready');
  const grounding = groundPortableColdConsumer({ bundle: result.bundle, route: orientation.routes[0].id, interactionMode: 'execution' });
  assert.notEqual(grounding.status, 'blocked');
  assert.equal(grounding.role.state, 'qualified');
  assert.equal(grounding.holderBinding.authorization.state, 'qualified');
  assert.equal(grounding.holderBinding.authorization.assignmentMode, 'handoff');
  assert.equal(grounding.holderBinding.source, 'qualified-selected-handoff-consumption');
  assert.equal(grounding.holderBinding.explicit, false);
  assert.equal(grounding.holderBinding.inferredFromTransport, false);
  assert.equal(grounding.holderBinding.sourceDetail.qualifiedMaterialSource, true);
  assert.equal(grounding.holderBinding.sourceDetail.routePointerPath, orientation.routes[0].pointerPath);
  assert.equal(grounding.holderBinding.authorization.provenance.roleArtifactPath.includes('cache'), true);
  assert.equal(grounding.holderBinding.durableIdentity.state, 'not-established');
  assert.equal(grounding.participation.participantState, 'unresolved');
  assert.equal(grounding.participation.participants.length, 0);
  assert.equal(grounding.participation.packageRoleGrounding.length, 1);
  assert.equal(grounding.participation.packageRoleGrounding[0].label, 'Axiom');
  assert.equal(grounding.participation.packageRoleGrounding[0].groundingOnly, true);
  assert.equal(grounding.participation.packageRoleGrounding[0].semanticParticipant, false);

  const explicitMismatch = groundPortableColdConsumer({ bundle: result.bundle, route: orientation.routes[0].id, holderRole: 'Anchor', interactionMode: 'execution' });
  assert.equal(explicitMismatch.status, 'blocked');
  assert.equal(explicitMismatch.holderBinding.state, 'blocked');
  assert.equal(explicitMismatch.holderBinding.recipientCompatibility, 'mismatch');
  assert.ok(explicitMismatch.findings.some((item) => item.code === 'portable.cold-start.holder-binding.role-mismatch'));

  await writeWorkspaceFile(businessRoot, LOOM_ROLE_PATH, roleFixture('Loom', 'explicit-session'));
  const noHandoffPrepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: ROUTE_PATH,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [
      { workspaceId: 'core', coverage: 'bounded', include: [ROUTE_PATH] },
      { workspaceId: 'business', coverage: 'bounded', include: [] }
    ],
    transportRoutes: [{
      workspaceId: 'core', path: ROUTE_PATH,
      participantRoles: [{ label: 'Axiom', workspaceId: 'business', path: AXIOM_ROLE_PATH, reference: `business::${AXIOM_ROLE_PATH}` }]
    }],
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const noHandoffResult = manufactureRecipientRelativeHandoffPackage(noHandoffPrepared, { verifyRoundtrip: true });
  assert.equal(noHandoffResult.status, 'ready', JSON.stringify(noHandoffResult.findings, null, 2));
  const noHandoffOrientation = orientColdConsumerFromHandoffPackage({ bundle: noHandoffResult.bundle });
  const noHandoffGrounding = groundPortableColdConsumer({ bundle: noHandoffResult.bundle, route: noHandoffOrientation.routes[0].id, interactionMode: 'execution' });
  assert.notEqual(noHandoffGrounding.status, 'blocked');
  assert.equal(noHandoffGrounding.holderBinding.state, 'unresolved');
  assert.equal(noHandoffGrounding.holderBinding.source, 'qualified-selected-handoff-consumption');
  assert.equal(noHandoffGrounding.holderBinding.authorization.state, 'unresolved');
  assert.equal(noHandoffGrounding.holderBinding.authorization.assignmentMode, 'handoff');
  assert.equal(noHandoffGrounding.holderBinding.inferredFromTransport, false);
  await writeWorkspaceFile(businessRoot, LOOM_ROLE_PATH, roleFixture('Loom'));

  const blockerReturnPath = '.topics/handoffs/blocker-return.trace.md';
  const blockerReturn = qualifiedHandoffFixture({
    title: 'Qualified blocker return',
    parent: { trace: '../parent.trace.md', relative: '../parent.trace.md', towards: '../parent.trace.md', targetValue: parentDigest.value, includeBrowseGit: false },
    from: 'Loom', to: 'Anchor',
    fromReference: `business::${LOOM_ROLE_PATH}`,
    toReference: `business::${ANCHOR_ROLE_PATH}`,
    requiredContext: `- Business Governance\n  - Material: current governing Business artifact\n  - Purpose: exact received-carrier cache closure regression\n  - Availability: available\n  - Material Reference: [Business Governance](business::${GOVERNANCE_PATH})`,
    exclusionsAndDependencies: `- delegation-authority\n  - Kind: unresolved-dependency\n  - Description: semantic delegation authority remains unresolved by design\n  - Responsible Party Or Role: Anchor`,
    purpose: 'return the qualified blocker without synthesizing semantic authority'
  });
  await writeWorkspaceFile(coreRoot, blockerReturnPath, blockerReturn);
  const returnPrepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: blockerReturnPath,
    packageParentBundle: result.bundle, packageParentPath: path.join(fixtureRoot, 'received-parent.zip'), packageParentSha256: '1'.repeat(64),
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const returnResult = manufactureRecipientRelativeHandoffPackage(returnPrepared, { verifyRoundtrip: true });
  assert.equal(returnResult.status, 'ready', JSON.stringify({ findings: returnResult.findings, preflight: returnPrepared.manufacturingEvidence?.packageParentMaterialClosurePreflight }, null, 2));
  assert.equal(returnResult.roundtrip?.status, 'passed');
  assert.equal(returnPrepared.manufacturingEvidence?.packageParentMaterialClosurePreflight?.state, 'ready');
  assert.deepEqual(returnPrepared.manufacturingEvidence?.packageParentMaterialClosurePreflight?.requirements.map((item) => [item.classification, item.referenceTarget, item.state]), [
    ['required', `business::${GOVERNANCE_PATH}`, 'available-qualified'],
    ['endpoint-role', `business::${LOOM_ROLE_PATH}`, 'available-qualified'],
    ['endpoint-role', `business::${ANCHOR_ROLE_PATH}`, 'available-qualified']
  ]);
  assert.equal(returnPrepared.manufacturingEvidence?.packageParentMaterialClosurePreflight?.boundary.includes('does not create semantic authority'), true);
  const returnOrientation = orientColdConsumerFromHandoffPackage({ bundle: returnResult.bundle });
  assert.equal(returnOrientation.status, 'ready');
  const returnReadiness = projectPortableGroundingReadiness({ bundle: returnResult.bundle, route: returnOrientation.routes[0].id, interactionMode: 'execution' });
  assert.equal(returnReadiness.readiness.state, 'grounded-to-act', JSON.stringify({readiness:returnReadiness.readiness, required:returnReadiness.coverage?.requiredContext}, null, 2));
  assert.equal(returnReadiness.coverage.requiredContext.items.every((item) => item.state === 'qualified'), true);
  const returnedGovernance = returnReadiness.coverage.requiredContext.items.find((item) => item.referenceTarget === `business::${GOVERNANCE_PATH}`);
  assert.equal(returnedGovernance?.provenance?.providerMode, 'cache');
  assert.equal(returnedGovernance?.provenance?.resolutionKind, 'workspace-cache-entry');
  assert.equal(returnedGovernance?.workspaceId, 'business');
  assert.equal(returnedGovernance?.innerPath, GOVERNANCE_PATH);

  const unavailableApplicability = projectGroundingProcessApplicability({
    processInventory: [{ id: 'cache-process', providerMode: 'cache', packagePath: routeCache.archivePath, archiveEntry: processMaterial.archiveEntry, sha256: processMaterial.sha256 }]
  });
  assert.equal(unavailableApplicability.state, 'not-established');
  assert.equal(unavailableApplicability.unresolved[0].code, 'process-applicability-semantic-authority-not-established');

  const explicitApplicability = projectGroundingProcessApplicability({ processApplicability: {
    explicit: true, qualification: 'qualified', source: 'qualified-required-context-forward-authority',
    facts: [{ processId: 'fixture-process', applicability: 'required' }],
    provenance: { providerMode: 'cache', packagePath: routeCache.archivePath, archiveEntry: processMaterial.archiveEntry, sha256: processMaterial.sha256 }
  } });
  assert.equal(explicitApplicability.state, 'explicit-qualified-authority');
  assert.deepEqual(explicitApplicability.facts, [{ processId: 'fixture-process', applicability: 'required' }]);
  assert.equal(explicitApplicability.provenance.source, 'qualified-required-context-forward-authority');

  const missingParticipantMaterial = {
    ...prepared,
    materials: Object.freeze(prepared.materials.filter((item) => item.provenance?.path !== AXIOM_ROLE_PATH))
  };
  const missingParticipantResult = manufactureRecipientRelativeHandoffPackage(missingParticipantMaterial, { verifyRoundtrip: true });
  assert.equal(missingParticipantResult.status, 'blocked');
  assert.ok(missingParticipantResult.findings.some((item) => item.code === 'portable.handoff-material.participant-role.unresolved'));

  const cacheArtifactFile = result.bundle.files.find((file) => file.path === routeCache.artifactPath);
  assert.ok(cacheArtifactFile?.transportFacts);
  const overExpandedMaterial = Object.freeze({
    ...(routeCache.materials[0] || {}),
    requirementId: 'unclaimed:participant-role-cache-material',
    sourceRequirementId: 'unclaimed:participant-role-cache-material'
  });
  const overExpandedBundle = {
    ...result.bundle,
    files: result.bundle.files.map((file) => file.path === routeCache.artifactPath
      ? { ...file, transportFacts: { ...file.transportFacts, materials: Object.freeze([...(file.transportFacts.materials || []), overExpandedMaterial]) } }
      : file)
  };
  const overExpandedInspection = inspectRecipientFacingV2PackageV1(overExpandedBundle);
  assert.equal(overExpandedInspection.status, 'invalid');
  assert.ok(overExpandedInspection.findings.some((item) => item.code === 'portable.handoff-package-v1.cache-over-expansion' && item.requirementId === 'unclaimed:participant-role-cache-material'));

  const cacheFile = result.bundle.files.find((file) => file.path === routeCache.archivePath);
  assert.ok(cacheFile);
  const tamperedBytes = packageFileBytes(cacheFile);
  tamperedBytes[Math.max(0, tamperedBytes.length - 1)] ^= 0x01;
  const tampered = { ...result.bundle, files: result.bundle.files.map((file) => file.path === routeCache.archivePath ? { ...file, data: tamperedBytes, content: undefined, markdown: undefined, bytesData: undefined } : file) };
  const tamperedInspection = inspectRecipientFacingV2PackageV1(tampered);
  assert.equal(tamperedInspection.status, 'invalid');
  assert.ok(tamperedInspection.findings.some((item) => ['portable.handoff-package-v1.cache-payload-invalid', 'portable.handoff-v2-surface.external-payload.byte-digest-mismatch', 'portable.handoff-v2-surface.external-payload.byte-size-mismatch'].includes(item.code)));

  const tamperedProvider = preparePackageParentExactMaterialProvider({ bundle: tampered, currentWorkspaceIds: ['core'], parentPackagePath: 'tampered-parent.zip', parentPackageSha256: '2'.repeat(64) });
  const tamperedPreflight = projectPackageParentMaterialClosurePreflight(returnPrepared.requirements, tamperedProvider);
  assert.equal(tamperedPreflight.state, 'action-required');
  assert.ok(tamperedPreflight.requirements.some((item) => item.state === 'present-unqualified'));
  assert.ok(tamperedPreflight.requirements.filter((item) => item.state !== 'available-qualified').every((item) => item.nextAction.includes('Tooling will not scan repositories or infer a source')));

  const absentPreflight = projectPackageParentMaterialClosurePreflight({ required: [{ id: 'missing:return-material', classification: 'required', reference: { target: 'business::.topics/missing.trace.md' } }] }, preparePackageParentExactMaterialProvider({ bundle: result.bundle, currentWorkspaceIds: ['core'] }));
  assert.equal(absentPreflight.state, 'action-required');
  assert.equal(absentPreflight.requirements[0].state, 'absent');
  assert.match(absentPreflight.requirements[0].nextAction, /Supply exact qualified material/);
});

test('normal ground keeps Anchor recipient/holder distinct from forward-selected Axiom delegate', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-delegate-selection-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const docsRoot = path.join(fixtureRoot, 'docs');
  const businessRoot = path.join(fixtureRoot, 'business');
  await mkdir(docsRoot, { recursive: true });
  await mkdir(businessRoot, { recursive: true });

  const taskPath = '.topics/grounding/012-fresh-anchor-delegation-acceptance-axiom-review.trace.md';
  const routePath = '.topics/grounding/handoffs/009-anchor-to-anchor-blank-workspace-qualified-delegation-acceptance.trace.md';
  const task = selectedAxiomTaskFixture();
  const route = anchorToAnchorDelegationHandoffFixture(taskPath, task);

  await writeWorkspaceFile(docsRoot, DOCS_WORKSPACE_PATH, workspaceFixture('Tiinex Docs Fixture', 'Tiinex/docs'));
  await writeWorkspaceFile(docsRoot, taskPath, task);
  await writeWorkspaceFile(docsRoot, routePath, route);
  await writeWorkspaceFile(businessRoot, BUSINESS_WORKSPACE_PATH, workspaceFixture('Tiinex Business Fixture', 'Tiinex/business'));
  await writeWorkspaceFile(businessRoot, ANCHOR_ROLE_PATH, roleFixture('Anchor'));
  await writeWorkspaceFile(businessRoot, AXIOM_ROLE_PATH, roleFixture('Axiom'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: docsRoot,
    workspaceId: 'docs',
    workspaceTargetPath: DOCS_WORKSPACE_PATH,
    handoffPath: routePath,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [
      { workspaceId: 'docs', coverage: 'bounded', include: [taskPath, routePath] },
      { workspaceId: 'business', coverage: 'bounded', include: [] }
    ],
    transportRoutes: [{
      workspaceId: 'docs', path: routePath,
      participantRoles: [{ label: 'Axiom', workspaceId: 'business', path: AXIOM_ROLE_PATH, reference: `business::${AXIOM_ROLE_PATH}` }]
    }],
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
    verifyRoundtrip: true
  });
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready');

  const grounded = projectPortableGroundingReadiness({
    bundle: result.bundle,
    route: orientation.routes[0].id,
    interactionMode: 'execution'
  });
  assert.equal(grounded.readiness.state, 'grounded-to-act', JSON.stringify(grounded.readiness, null, 2));
  assert.equal(grounded.authority.holderBinding.source, 'qualified-selected-handoff-consumption');
  assert.equal(grounded.authority.holderBinding.explicit, false);
  assert.equal(grounded.capsule.roleState.recipient, 'Anchor');
  assert.equal(grounded.capsule.roleState.holder, 'Anchor');
  assert.equal(grounded.capsule.delegationReadiness.state, 'qualified-for-delegation-authoring', JSON.stringify(grounded.capsule.delegationReadiness, null, 2));
  assert.equal(grounded.capsule.delegationReadiness.delegateCapabilityAuthority.delegate.label, 'Axiom');
  assert.equal(grounded.capsule.delegationArtifactAuthority.provenance.recipientRole.path, `business::${ANCHOR_ROLE_PATH}`);
  assert.equal(grounded.capsule.delegationArtifactAuthority.provenance.delegateRole.path, `business::${AXIOM_ROLE_PATH}`);
  assert.equal(grounded.capsule.delegationArtifactAuthority.delegateCapabilityAuthority.provenance.forwardSelector.sourceArtifact.path, `docs/${taskPath}`);
  const handoffOperation = grounded.capsule.delegationReadiness.nextOperations.find((item) => item.kind === 'author-delegation-handoff');
  const taskOperation = grounded.capsule.delegationReadiness.nextOperations.find((item) => item.kind === 'author-delegation-task');
  assert.equal(handoffOperation?.recipient?.label, 'Axiom');
  assert.equal(handoffOperation?.directory, '.topics/grounding/handoffs');
  assert.equal(taskOperation?.directory, '.topics/grounding');
  assert.equal(grounded.capsule.participantContext.roleGrounding.find((item) => item.label === 'Axiom')?.semanticParticipant, false);

  const taskWithoutSelector = selectedAxiomTaskFixture({
    selectorDeclaration: 'Axiom Role material is available for qualification, but this Task does not select a downstream specialist.'
  });
  const routeWithoutSelector = anchorToAnchorDelegationHandoffFixture(taskPath, taskWithoutSelector);
  await writeWorkspaceFile(docsRoot, taskPath, taskWithoutSelector);
  await writeWorkspaceFile(docsRoot, routePath, routeWithoutSelector);
  const preparedWithoutSelector = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: docsRoot,
    workspaceId: 'docs',
    workspaceTargetPath: DOCS_WORKSPACE_PATH,
    handoffPath: routePath,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [
      { workspaceId: 'docs', coverage: 'bounded', include: [taskPath, routePath] },
      { workspaceId: 'business', coverage: 'bounded', include: [] }
    ],
    transportRoutes: [{
      workspaceId: 'docs', path: routePath,
      participantRoles: [{ label: 'Axiom', workspaceId: 'business', path: AXIOM_ROLE_PATH, reference: `business::${AXIOM_ROLE_PATH}` }]
    }],
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
    verifyRoundtrip: true
  });
  const withoutSelectorResult = manufactureRecipientRelativeHandoffPackage(preparedWithoutSelector, { verifyRoundtrip: true });
  assert.equal(withoutSelectorResult.status, 'ready', JSON.stringify(withoutSelectorResult.findings, null, 2));
  const withoutSelectorOrientation = orientColdConsumerFromHandoffPackage({ bundle: withoutSelectorResult.bundle });
  const withoutSelectorGrounded = projectPortableGroundingReadiness({
    bundle: withoutSelectorResult.bundle,
    route: withoutSelectorOrientation.routes[0].id,
    interactionMode: 'execution'
  });
  assert.equal(withoutSelectorGrounded.capsule.roleState.recipient, 'Anchor');
  assert.equal(withoutSelectorGrounded.capsule.participantContext.roleGrounding.find((item) => item.label === 'Axiom')?.semanticParticipant, false);
  assert.equal(withoutSelectorGrounded.capsule.delegationArtifactAuthority.delegateCapabilityAuthority, null);
  assert.equal(withoutSelectorGrounded.capsule.delegationArtifactAuthority.unresolved.some((item) => item.code === 'forward-delegate-selector-not-established'), true);
  assert.equal(withoutSelectorGrounded.capsule.delegationReadiness.state, 'not-established');
  assert.deepEqual(withoutSelectorGrounded.capsule.delegationReadiness.nextOperations, []);
});

test('cache inventory stays availability-only unless explicit semantic authority is independently qualified', () => {
  const participation = projectGroundingParticipantContext({ participation: {
    packageRoleGrounding: [
      { label: 'Loom', pointerPath: '001-role.trace.md', roleArtifact: { path: `cache:${LOOM_ROLE_PATH}`, sha256: 'a'.repeat(64) } },
      { label: 'Observer', pointerPath: 'nearby-role.trace.md', roleArtifact: { path: `cache:${NEARBY_ROLE_PATH}`, sha256: 'b'.repeat(64) } }
    ],
    participants: []
  } });
  assert.equal(participation.participantMapState, 'not-established');
  assert.equal(participation.semanticParticipants.length, 0);
  assert.equal(participation.roleGrounding.every((item) => item.semanticParticipant === false), true);

  const process = projectGroundingProcessApplicability({
    processInventory: [
      { id: 'selected-process', providerMode: 'cache', path: PROCESS_PATH },
      { id: 'nearby-unselected-process', providerMode: 'cache', path: NEARBY_PROCESS_PATH }
    ],
    participation: { packageRoleGrounding: participation.roleGrounding }
  });
  assert.equal(process.state, 'not-established');
  assert.deepEqual(process.facts, []);

  const sourceAuthority = projectGroundingImplementationSourceAuthority({
    authority: { status: 'ready' },
    contextAudit: { workspaceMaterializations: [{ workspaceId: 'business', qualification: 'qualified', coverage: 'bounded', sourceWorkspaceTargetInnerPath: BUSINESS_WORKSPACE_PATH, sourceWorkspaceTargetSha256: 'c'.repeat(64) }] },
    requiredContext: [{ requirementId: 'business', state: 'qualified', workspaceId: 'business', purpose: 'writable implementation staging when separately authorized', provenance: { basis: 'selected-handoff-required-context-declaration' } }]
  });
  assert.equal(sourceAuthority.state, 'unresolved');
  assert.equal(sourceAuthority.unresolved[0].code, 'implementation-source-authority-not-established');

  const omittedSibling = projectGroundingSourceEvidence({
    contextAudit: { status: 'ready', coverage: { state: 'qualified' }, workspaceMaterializations: [{ workspaceId: 'core', qualification: 'qualified', coverage: 'bounded' }] },
    requiredContext: [{ requirementId: 'required:docs', state: 'blocked', workspaceId: 'docs', referenceTarget: 'docs::.topics/processes/adoption.trace.md', purpose: 'omitted sibling regression', reasons: ['exact-required-material-reference-or-binding-unresolved'] }]
  });
  assert.equal(omittedSibling.workspaces.some((item) => item.workspaceId === 'docs' && item.availability === 'qualified'), false);
  const blocker = omittedSibling.blockers.find((item) => item.requirementId === 'required:docs');
  assert.ok(blocker);
  assert.match(blocker.request, /Provide exact qualified material/);
  assert.match(blocker.request, /Do not substitute GitHub, a connector, a repository checkout, or network discovery/);
});


function parentTraceFromCarrierFile(file) {
  if (!file) return '';
  const markdown = new TextDecoder().decode(packageFileBytes(file));
  return String(markdown.match(/^\s*-\s+Trace:\s+\[[^\]]+\]\(([^)]+)\)\s*$/m)?.[1] || '');
}

function carrierAncestorKinds(bundle, inspection, routeProjection) {
  const byPath = new Map((bundle.files || []).map((file) => [String(file.path || ''), file]));
  const participants = new Map((inspection.participantRoles || []).map((item) => [String(item.pointerPath || ''), item]));
  const endpoints = new Map((inspection.endpointRoles || []).map((item) => [String(item.pointerPath || ''), item]));
  const kinds = [];
  let cursor = byPath.get(String(routeProjection.pointerPath || '')) || null;
  const seen = new Set();
  while (cursor) {
    const parent = parentTraceFromCarrierFile(cursor);
    if (!parent || seen.has(parent)) break;
    seen.add(parent);
    if (endpoints.has(parent)) {
      const endpoint = endpoints.get(parent);
      kinds.push(`endpoint:${String(endpoint.endpointParty || '')}`);
    } else if (participants.has(parent)) kinds.push('participant');
    else break;
    cursor = byPath.get(parent) || null;
  }
  return kinds;
}

test('complete route omits cache and projects participants before deterministic From/To endpoints, including overlap', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-no-cache-topology-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const coreRoot = path.join(fixtureRoot, 'core');
  await mkdir(coreRoot, { recursive: true });

  const route = qualifiedHandoffFixture({
    from: 'Anchor', to: 'Loom',
    fromReference: `core::${ANCHOR_ROLE_PATH}`,
    toReference: `core::${LOOM_ROLE_PATH}`
  });
  await writeWorkspaceFile(coreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(coreRoot, ROUTE_PATH, route);
  await writeWorkspaceFile(coreRoot, ANCHOR_ROLE_PATH, roleFixture('Anchor'));
  await writeWorkspaceFile(coreRoot, LOOM_ROLE_PATH, roleFixture('Loom'));
  await writeWorkspaceFile(coreRoot, AXIOM_ROLE_PATH, roleFixture('Axiom'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: ROUTE_PATH,
    transportRoutes: [{
      workspaceId: 'core', path: ROUTE_PATH,
      participantRoles: [
        { label: 'Axiom', workspaceId: 'core', path: AXIOM_ROLE_PATH, reference: `core::${AXIOM_ROLE_PATH}` },
        { label: 'Loom', workspaceId: 'core', path: LOOM_ROLE_PATH, reference: `core::${LOOM_ROLE_PATH}` }
      ]
    }],
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.roundtrip?.status, 'passed');
  assert.equal((result.inspection.caches || []).length, 0);
  assert.equal((result.inspection.participantRoles || []).length, 2);
  assert.deepEqual((result.inspection.endpointRoles || []).map((item) => item.endpointParty).sort(), ['from', 'to']);
  const routeProjection = result.inspection.routes[0];
  assert.deepEqual(carrierAncestorKinds(result.bundle, result.inspection, routeProjection), ['endpoint:to', 'endpoint:from', 'participant', 'participant']);

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  const grounded = projectPortableGroundingReadiness({ bundle: result.bundle, route: orientation.routes[0].id, interactionMode: 'execution' });
  assert.notEqual(grounded.readiness.state, 'blocked', JSON.stringify(grounded.readiness, null, 2));
  assert.equal(grounded.authority.holderBinding.source, 'qualified-selected-handoff-consumption');
  assert.equal(grounded.capsule.participantContext.roleGrounding.some((item) => item.label === 'Loom' && item.semanticParticipant === false), true);
  assert.equal(grounded.capsule.participantContext.roleGrounding.some((item) => item.label === 'Axiom' && item.semanticParticipant === false), true);
});

test('two sibling routes share one bounded cache while each route remains independently ancestor-complete', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-shared-cache-topology-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const coreRoot = path.join(fixtureRoot, 'core');
  const businessRoot = path.join(fixtureRoot, 'business');
  await mkdir(coreRoot, { recursive: true });
  await mkdir(businessRoot, { recursive: true });
  const routeOnePath = '.topics/handoffs/one.trace.md';
  const routeTwoPath = '.topics/handoffs/two.trace.md';
  const requiredContextOne = `- Business Governance\n  - Material: current governing Business artifact\n  - Purpose: shared-cache sibling regression route one\n  - Availability: available\n  - Material Reference: [Business Governance](business::${GOVERNANCE_PATH})`;
  const requiredContextTwo = `- Business Process\n  - Material: current Business process artifact\n  - Purpose: shared-cache sibling regression route two\n  - Availability: available\n  - Material Reference: [Business Process](business::${NEARBY_PROCESS_PATH})`;
  const routeOne = qualifiedHandoffFixture({ from: 'Anchor', to: 'Loom', fromReference: `business::${ANCHOR_ROLE_PATH}`, toReference: `business::${LOOM_ROLE_PATH}`, requiredContext: requiredContextOne, title: 'Sibling route one' });
  const routeTwo = qualifiedHandoffFixture({ from: 'Observer', to: 'Axiom', fromReference: `business::${NEARBY_ROLE_PATH}`, toReference: `business::${AXIOM_ROLE_PATH}`, requiredContext: requiredContextTwo, title: 'Sibling route two', createdAt: '2026-08-23 12:01:00' });

  await writeWorkspaceFile(coreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(coreRoot, routeOnePath, routeOne);
  await writeWorkspaceFile(coreRoot, routeTwoPath, routeTwo);
  await writeWorkspaceFile(businessRoot, BUSINESS_WORKSPACE_PATH, workspaceFixture('Tiinex Business Fixture', 'Tiinex/business'));
  await writeWorkspaceFile(businessRoot, GOVERNANCE_PATH, selectedAxiomTaskFixture({ selectorDeclaration: 'No participant selection is implied by this governance fixture.' }));
  await writeWorkspaceFile(businessRoot, NEARBY_PROCESS_PATH, selectedAxiomTaskFixture({ selectorDeclaration: 'No participant selection is implied by this process fixture.' }));
  await writeWorkspaceFile(businessRoot, ANCHOR_ROLE_PATH, roleFixture('Anchor'));
  await writeWorkspaceFile(businessRoot, LOOM_ROLE_PATH, roleFixture('Loom'));
  await writeWorkspaceFile(businessRoot, NEARBY_ROLE_PATH, roleFixture('Observer'));
  await writeWorkspaceFile(businessRoot, AXIOM_ROLE_PATH, roleFixture('Axiom'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: routeOnePath,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [
      { workspaceId: 'core', coverage: 'bounded', include: [routeOnePath, routeTwoPath] },
      { workspaceId: 'business', coverage: 'bounded', include: [] }
    ],
    transportRoutes: [
      { workspaceId: 'core', path: routeOnePath, participantRoles: [{ label: 'Axiom', workspaceId: 'business', path: AXIOM_ROLE_PATH, reference: `business::${AXIOM_ROLE_PATH}` }] },
      { workspaceId: 'core', path: routeTwoPath, participantRoles: [] }
    ],
    carrierLineage: { mode: 'continue', dimension: '001-1', parentDimension: '001', parentPackageSha256: '0'.repeat(64), parentPackageFilename: 'parent.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.roundtrip?.status, 'passed', JSON.stringify(result.roundtrip?.findings || [], null, 2));
  assert.equal((result.inspection.routes || []).length, 2);
  const coreCaches = (result.inspection.caches || []).filter((item) => item.workspaceId === 'core');
  assert.equal(coreCaches.length, 1);
  const routeFacts = (result.inspection.artifactFacts || []).filter((item) => item.facts?.role === 'handoff-route');
  assert.equal(routeFacts.length, 2);
  assert.equal(new Set(routeFacts.map((item) => item.facts.cacheArtifactPath)).size, 1);
  assert.equal(routeFacts[0].facts.cacheArtifactPath, coreCaches[0].artifactPath);
  const routeWithParticipant = result.inspection.routes.find((item) => item.workspaceRelativeHandoffPath === routeOnePath);
  const routeWithoutParticipant = result.inspection.routes.find((item) => item.workspaceRelativeHandoffPath === routeTwoPath);
  assert.equal(routeWithParticipant.participantRolePointers.length, 1);
  assert.equal(routeWithoutParticipant.participantRolePointers.length, 0);
  assert.equal(routeWithParticipant.endpointRolePointers.length, 2);
  assert.equal(routeWithoutParticipant.endpointRolePointers.length, 2);
  assert.ok(routeWithParticipant.pointerPath !== routeWithoutParticipant.pointerPath);

  const missingOwnAncestor = {
    ...result.bundle,
    files: Object.freeze(result.bundle.files.filter((file) => file.path !== routeWithParticipant.participantRolePointers[0]))
  };
  const missingInspection = inspectRecipientFacingV2Topology(missingOwnAncestor);
  assert.equal(missingInspection.status, 'invalid');
  assert.equal(missingInspection.findings.some((item) => /parent|ancestor|route/i.test(String(item.code || ''))), true);
});

test('fresh Axiom route continues external Parent closure through exact package-parent cache material to a qualified root', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-external-parent-cache-chain-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const source = await buildExternalParentCacheSourceCarrier(fixtureRoot, { includeProject: true });
  const childCoreRoot = path.join(fixtureRoot, 'child-core');
  await mkdir(childCoreRoot, { recursive: true });
  const taskPath = '.topics/grounding/fresh-axiom-review.trace.md';
  const routePath = '.topics/handoffs/fresh-axiom-review.trace.md';
  const task = lineageTaskFixture({
    title: 'Fresh Axiom Delegation Acceptance Review',
    summary: 'Selected recipient Task whose external Business Parent is cache-only.',
    parentReference: `business::${BUSINESS_EPIC_PATH}`,
    parentDigest: source.epicDigest,
    createdAt: '2026-09-16 00:10:00'
  });
  const taskDigest = validatedC14nV2PrimarySelfDigest(task);
  assert.equal(taskDigest.state, 'verified');
  const route = qualifiedHandoffFixture({
    title: 'Anchor to Axiom fresh delegation acceptance review',
    from: 'Anchor', to: 'Axiom',
    fromReference: `business::${ANCHOR_ROLE_PATH}`,
    toReference: `business::${AXIOM_ROLE_PATH}`,
    parent: { trace: '../grounding/fresh-axiom-review.trace.md', relative: '../grounding/fresh-axiom-review.trace.md', towards: '../grounding/fresh-axiom-review.trace.md', targetValue: taskDigest.value, includeBrowseGit: false }
  });
  await writeWorkspaceFile(childCoreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Fresh Axiom Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(childCoreRoot, taskPath, task);
  await writeWorkspaceFile(childCoreRoot, routePath, route);

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: childCoreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: routePath,
    workspaceScopes: [{ workspaceId: 'core', coverage: 'bounded', include: [taskPath, routePath] }],
    packageParentBundle: source.result.bundle,
    packageParentPath: path.join(fixtureRoot, 'received-cache-source.zip'), packageParentSha256: '1'.repeat(64),
    carrierLineage: { mode: 'continue', dimension: '001-1-1', parentDimension: '001-1', parentPackageSha256: '1'.repeat(64), parentPackageFilename: 'received-cache-source.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const parentDependencies = (prepared.requirements.dependencies || []).filter((item) => item.classification === 'parent-boundary');
  assert.equal(parentDependencies.some((item) => item.targetWorkspaceId === 'business' && item.targetPath === BUSINESS_EPIC_PATH), true);
  const projectDependency = parentDependencies.find((item) => item.targetWorkspaceId === 'business' && item.targetPath === BUSINESS_TOOLING_PROJECT_PATH);
  assert.ok(projectDependency, JSON.stringify(parentDependencies, null, 2));
  assert.ok(prepared.materials.some((item) => item.requirementId === projectDependency.id && item.provenance?.workspaceId === 'business' && item.provenance?.path === BUSINESS_TOOLING_PROJECT_PATH));

  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.roundtrip?.status, 'passed', JSON.stringify(result.roundtrip?.findings || [], null, 2));
  const cacheMaterials = (result.inspection.caches || []).flatMap((cache) => cache.materials || []).filter((item) => item.classification === 'parent-boundary');
  assert.equal(cacheMaterials.some((item) => item.targetPath === BUSINESS_EPIC_PATH || item.originalPath === BUSINESS_EPIC_PATH), true);
  assert.equal(cacheMaterials.some((item) => item.targetPath === BUSINESS_TOOLING_PROJECT_PATH || item.originalPath === BUSINESS_TOOLING_PROJECT_PATH), true);

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready');
  const grounded = projectPortableGroundingReadiness({ bundle: result.bundle, route: orientation.routes[0].id, interactionMode: 'execution' });
  assert.equal(grounded.readiness.state, 'grounded-to-act', JSON.stringify({ readiness: grounded.readiness, continuity: grounded.continuity }, null, 2));
  assert.equal(grounded.continuity.state, 'qualified');
  assert.equal((grounded.continuity.proof?.qualifiedRoots || []).some((item) => item.path === `business/${BUSINESS_TOOLING_PROJECT_PATH}`), true, JSON.stringify(grounded.continuity.proof?.qualifiedRoots || [], null, 2));
});

test('external Parent cache bounded stop fails closed when the declared next ancestor is not exact-qualified material', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-external-parent-bounded-stop-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const source = await buildExternalParentCacheSourceCarrier(fixtureRoot, { includeProject: false });
  const childCoreRoot = path.join(fixtureRoot, 'child-core');
  await mkdir(childCoreRoot, { recursive: true });
  const taskPath = '.topics/grounding/fresh-axiom-bounded-stop.trace.md';
  const routePath = '.topics/handoffs/fresh-axiom-bounded-stop.trace.md';
  const task = lineageTaskFixture({
    title: 'Fresh Axiom Delegation Bounded Stop Review',
    summary: 'Selected recipient Task whose first external ancestor is available but whose declared Parent is deliberately omitted.',
    parentReference: `business::${BUSINESS_EPIC_PATH}`,
    parentDigest: source.epicDigest,
    createdAt: '2026-09-16 00:20:00'
  });
  const taskDigest = validatedC14nV2PrimarySelfDigest(task);
  assert.equal(taskDigest.state, 'verified');
  const route = qualifiedHandoffFixture({
    title: 'Anchor to Axiom bounded-stop delegation review',
    from: 'Anchor', to: 'Axiom',
    fromReference: `business::${ANCHOR_ROLE_PATH}`,
    toReference: `business::${AXIOM_ROLE_PATH}`,
    parent: { trace: '../grounding/fresh-axiom-bounded-stop.trace.md', relative: '../grounding/fresh-axiom-bounded-stop.trace.md', towards: '../grounding/fresh-axiom-bounded-stop.trace.md', targetValue: taskDigest.value, includeBrowseGit: false }
  });
  await writeWorkspaceFile(childCoreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Fresh Axiom Bounded Stop Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(childCoreRoot, taskPath, task);
  await writeWorkspaceFile(childCoreRoot, routePath, route);

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: childCoreRoot, workspaceId: 'core', workspaceTargetPath: CORE_WORKSPACE_PATH, handoffPath: routePath,
    workspaceScopes: [{ workspaceId: 'core', coverage: 'bounded', include: [taskPath, routePath] }],
    packageParentBundle: source.result.bundle,
    packageParentPath: path.join(fixtureRoot, 'received-bounded-stop-source.zip'), packageParentSha256: '2'.repeat(64),
    carrierLineage: { mode: 'continue', dimension: '001-2-1', parentDimension: '001-2', parentPackageSha256: '2'.repeat(64), parentPackageFilename: 'received-bounded-stop-source.zip', checkpointKind: 'progression' },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), verifyRoundtrip: true
  });
  const projectDependency = (prepared.requirements.dependencies || []).find((item) => item.classification === 'parent-boundary' && item.targetWorkspaceId === 'business' && item.targetPath === BUSINESS_TOOLING_PROJECT_PATH);
  assert.ok(projectDependency, JSON.stringify(prepared.requirements.dependencies || [], null, 2));
  assert.equal(prepared.materials.some((item) => item.requirementId === projectDependency.id), false);
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'blocked');
  assert.equal(result.findings.some((item) => item.code === 'portable.handoff-material.dependency.unresolved'), true, JSON.stringify(result.findings, null, 2));
});

test('route-scoped Role material ambiguity fails closed instead of borrowing a sibling or nearby match', () => {
  const requirement = { id: 'participant-role:axiom', reference: { target: `business::${AXIOM_ROLE_PATH}` } };
  const duplicate = (suffix) => ({
    requirementId: `material-${suffix}`,
    sourceRequirementId: requirement.id,
    routeWorkspaceId: 'core',
    routePath: ROUTE_PATH,
    carrierKind: 'detached-material',
    referenceTarget: `business::${AXIOM_ROLE_PATH}`,
    bytes: 1,
    sha256: String(suffix).repeat(64).slice(0, 64)
  });
  const resolved = roleMaterialTarget(requirement, { materialized: [duplicate('a'), duplicate('b')] }, new Map(), { materials: [] }, { workspaceId: 'core', workspaceRelativePath: ROUTE_PATH });
  assert.equal(resolved.state, 'ambiguous');
  assert.equal(resolved.reason, 'material-ambiguous');
});
