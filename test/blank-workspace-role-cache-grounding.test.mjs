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
import { packageFileBytes } from '../src/export/package.bytes.js';
import { projectGroundingParticipantContext } from '../src/tooling/portable/grounding/grounding.participantContext.js';
import { projectGroundingProcessApplicability } from '../src/tooling/portable/grounding/grounding.processApplicability.js';
import { projectGroundingImplementationSourceAuthority } from '../src/tooling/portable/grounding/grounding.implementationSourceAuthority.js';
import { projectGroundingSourceEvidence } from '../src/tooling/portable/grounding/grounding.sourceEvidence.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.workspace.v1.schema.md';
const ROLE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';
const CORE_WORKSPACE_PATH = '.topics/.workspaces/tiinex-core.workspace.md';
const BUSINESS_WORKSPACE_PATH = '.topics/.workspaces/tiinex-business.workspace.md';
const ROUTE_PATH = '.topics/handoffs/return.trace.md';
const GOVERNANCE_PATH = '.topics/governance/current.trace.md';
const PROCESS_PATH = '.topics/processes/current.trace.md';
const NEARBY_ROLE_PATH = '.topics/roles/unselected-observer-role.trace.md';
const NEARBY_PROCESS_PATH = '.topics/processes/unselected-nearby.trace.md';
const ANCHOR_ROLE_PATH = '.topics/roles/anchor-role.trace.md';
const LOOM_ROLE_PATH = '.topics/roles/loom-role.trace.md';
const AXIOM_ROLE_PATH = '.topics/roles/axiom-role.trace.md';
const PARENT_PATH = '.topics/parent.trace.md';

function seal(markdown) { const sealed = sealC14nV2Self(markdown); assert.equal(sealed.state, 'sealed'); return `${sealed.markdown}\n`; }
function workspaceFixture(title, repository) { return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-09-15 00:00:00\n  - Authors: Fixture\n  - Why: Exercise blank/minimal Workspace cache grounding.\n  - Summary: Portable Workspace entrypoint for ${repository}.\n  - Status: active/local\n\n---\n\n# ${title}\n\n## Schema Origins\n\n- [Tiinex docs schemas](https://github.com/Tiinex/docs/tree/master/.topics/.schemas)\n  - Kind: github-tree\n  - Repository: Tiinex/docs\n  - Ref: master\n  - Root Path: .topics/.schemas\n  - Trust Role: canonical-core\n\n## Workspace Entrypoints\n\n### ${title}\n\n- Source Kind: local-directory\n- Repository: ${repository}\n- Root Path: .\n- Repo Files Discovery: on\n\n## Workspace Boundary\n\nBlank/minimal carrier regression fixture only.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`); }
function roleFixture(label) { return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE_SCHEMA_TARGET})\n  - Created At: 2026-09-15 00:00:00\n  - Authors: Fixture\n  - Why: Exercise cache-carried endpoint Role grounding.\n  - Summary: ${label} Role fixture.\n  - Status: active/local\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: operational\n\n## Role Boundary\n\n- In Scope: blank/minimal cache grounding regression\n- Out Of Scope: all other authority\n\n## Authority And Responsibility Boundary\n\n- May Do: exercise the fixture route\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: explicit-session, handoff\n\n## Interpretation Limits\n\n- Does Not Prove: human identity or authority beyond the fixture\n- Must Not Be Treated As: semantic participation or durable holder identity\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`); }
async function writeWorkspaceFile(root, relativePath, data) { const target = path.join(root, ...relativePath.split('/')); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, data); }

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
  const grounding = groundPortableColdConsumer({ bundle: result.bundle, route: orientation.routes[0].id, holderRole: 'Loom', interactionMode: 'execution' });
  assert.notEqual(grounding.status, 'blocked');
  assert.equal(grounding.role.state, 'qualified');
  assert.equal(grounding.holderBinding.authorization.state, 'qualified');
  assert.equal(grounding.holderBinding.authorization.provenance.roleArtifactPath.includes('cache'), true);
  assert.equal(grounding.holderBinding.durableIdentity.state, 'not-established');
  assert.equal(grounding.participation.participantState, 'unresolved');
  assert.equal(grounding.participation.participants.length, 0);
  assert.equal(grounding.participation.packageRoleGrounding.length, 1);
  assert.equal(grounding.participation.packageRoleGrounding[0].label, 'Axiom');
  assert.equal(grounding.participation.packageRoleGrounding[0].groundingOnly, true);
  assert.equal(grounding.participation.packageRoleGrounding[0].semanticParticipant, false);

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
  const returnReadiness = projectPortableGroundingReadiness({ bundle: returnResult.bundle, route: returnOrientation.routes[0].id, holderRole: 'Anchor', interactionMode: 'execution' });
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
