import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { packageFileBytes } from '../src/export/package.bytes.js';
import { prepareNodeHandoffManufacturingInput } from '../src/tooling/portable/adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { orientColdConsumerFromHandoffPackage } from '../src/tooling/portable/handoff/coldConsumerEntrypoint.js';
import { projectPortableHandoffCarrierOutputFromPackage } from '../src/tooling/portable/handoff/recipientV2.humanOutput.js';
import { groundPortableColdConsumer } from '../src/tooling/portable/handoff/coldStartQualification.grounding.js';
import { auditHandoffPackageContextCarriage } from '../src/tooling/portable/handoff/contextAudit.js';
import { inspectStoredWorkspaceArchive } from '../src/tooling/portable/handoff/workspaceByteProvider.js';
import { projectPortableWorkspaceLandingPlan } from '../src/tooling/portable/handoff/workspaceLandingPlan.js';
import { prepareNodeSourceFrontier } from '../src/tooling/portable/adapters/node/sourceFrontierComparison.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.workspace.v1.schema.md';
const ROLE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';
const CORE_WORKSPACE_PATH = '.topics/.workspaces/tiinex-core.workspace.md';
const BUSINESS_WORKSPACE_PATH = '.topics/.workspaces/tiinex-business.workspace.md';
const ROUTE_PATH = '.topics/handoffs/return.trace.md';
const GOVERNANCE_PATH = '.topics/governance/current.trace.md';
const RECOVERY_PARENT_PATH = '.topics/governance/002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md';
const PRIOR_ANSWER_PATH = '.topics/answers/previous-successor-answer.trace.md';
const ANCHOR_ROLE_PATH = '.topics/roles/anchor-role.trace.md';
const LOOM_ROLE_PATH = '.topics/roles/loom-role.trace.md';

function seal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

function workspaceFixture(title, repository) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-09-12 12:00:00\n  - Authors: Fixture\n  - Why: Exercise bounded Handoff carrier isolation.\n  - Summary: Portable Workspace entrypoint for ${repository}.\n  - Status: active/local\n\n---\n\n# ${title}\n\n## Schema Origins\n\n- [Tiinex docs schemas](https://github.com/Tiinex/docs/tree/master/.topics/.schemas)\n  - Kind: github-tree\n  - Repository: Tiinex/docs\n  - Ref: master\n  - Root Path: .topics/.schemas\n  - Trust Role: canonical-core\n\n## Workspace Entrypoints\n\n### ${title}\n\n- Source Kind: local-directory\n- Repository: ${repository}\n- Root Path: .\n- Repo Files Discovery: on\n\n## Workspace Boundary\n\nBounded carrier regression fixture only.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

function roleFixture(label) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE_SCHEMA_TARGET})\n  - Created At: 2026-09-12 12:00:00\n  - Authors: Fixture\n  - Why: Exercise bounded Handoff endpoint Role projection.\n  - Summary: ${label} Role fixture.\n  - Status: active/local\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: operational\n\n## Role Boundary\n\n- In Scope: bounded Handoff regression\n- Out Of Scope: all other authority\n\n## Authority And Responsibility Boundary\n\n- May Do: exercise the fixture route\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: explicit-session, handoff\n\n## Interpretation Limits\n\n- Does Not Prove: human identity or authority beyond the fixture\n- Must Not Be Treated As: semantic authority outside the declared boundary\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

async function writeWorkspaceFile(root, relativePath, data) {
  const target = path.join(root, ...relativePath.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
}

function fileByPath(bundle, relativePath) {
  return (bundle.files || []).find((file) => String(file.path || '') === relativePath) || null;
}

test('bounded Handoff carrier isolates unrelated answer history while qualifying detached Parent recovery and endpoint Roles', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-core-bounded-carrier-'));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const coreRoot = path.join(fixtureRoot, 'core');
  const businessRoot = path.join(fixtureRoot, 'business');
  await mkdir(coreRoot, { recursive: true });
  await mkdir(businessRoot, { recursive: true });

  const governance = await readFile(new URL('../.topics/refactor/orchestration/003-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md', import.meta.url), 'utf8');
  const recoveryParent = await readFile(new URL('../.topics/refactor/orchestration/002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md', import.meta.url), 'utf8');
  const route = qualifiedHandoffFixture({
    from: 'Anchor',
    to: 'Loom',
    fromReference: `business::${ANCHOR_ROLE_PATH}`,
    toReference: `business::${LOOM_ROLE_PATH}`,
    signalKind: 'acknowledgement',
    requiredContext: `- Business Governance\n  - Material: current governing Business artifact\n  - Purpose: bounded carrier isolation regression\n  - Availability: available\n  - Material Reference: [Business Governance](business::${GOVERNANCE_PATH})`
  });

  await writeWorkspaceFile(coreRoot, CORE_WORKSPACE_PATH, workspaceFixture('Tiinex Core Fixture', 'Tiinex/core'));
  await writeWorkspaceFile(coreRoot, ROUTE_PATH, route);
  await writeWorkspaceFile(businessRoot, BUSINESS_WORKSPACE_PATH, workspaceFixture('Tiinex Business Fixture', 'Tiinex/business'));
  await writeWorkspaceFile(businessRoot, GOVERNANCE_PATH, governance);
  await writeWorkspaceFile(businessRoot, RECOVERY_PARENT_PATH, recoveryParent);
  await writeWorkspaceFile(businessRoot, PRIOR_ANSWER_PATH, '# Prior completed successor answer\n\nThis must remain outside the bounded representation.\n');
  await writeWorkspaceFile(businessRoot, ANCHOR_ROLE_PATH, roleFixture('Anchor'));
  await writeWorkspaceFile(businessRoot, LOOM_ROLE_PATH, roleFixture('Loom'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: coreRoot,
    workspaceId: 'core',
    workspaceTargetPath: CORE_WORKSPACE_PATH,
    handoffPath: ROUTE_PATH,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: BUSINESS_WORKSPACE_PATH }],
    workspaceScopes: [{ workspaceId: 'core', coverage: 'bounded', include: [ROUTE_PATH] }, { workspaceId: 'business', coverage: 'bounded', include: [GOVERNANCE_PATH, ANCHOR_ROLE_PATH, LOOM_ROLE_PATH] }],
    carrierLineage: {
      mode: 'continue',
      dimension: '001-1',
      parentDimension: '001',
      parentPackageSha256: '0'.repeat(64),
      parentPackageFilename: 'parent.zip',
      checkpointKind: 'progression'
    },
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
    verifyRoundtrip: true
  });

  const business = prepared.workspaceMaterializations.find((workspace) => workspace.id === 'business');
  assert.equal(business.state, 'bounded');
  assert.equal(business.scopeEvidence.state, 'qualified');
  assert.equal(business.scopeEvidence.proof, 'explicit-bounded-entry-selection-v1');
  assert.equal(business.scopeEvidence.omittedEntryMeaning, 'outside-representation-not-absent-from-workspace');
  assert.deepEqual(business.includedEntries.map((entry) => entry.path), [
    BUSINESS_WORKSPACE_PATH,
    GOVERNANCE_PATH,
    ANCHOR_ROLE_PATH,
    LOOM_ROLE_PATH
  ].sort());
  assert.equal(business.includedEntries.some((entry) => entry.path === PRIOR_ANSWER_PATH), false);
  assert.equal(business.includedEntries.some((entry) => entry.path === RECOVERY_PARENT_PATH), false);

  const recoveryRequirement = (prepared.requirements.dependencies || []).find((item) => String(item.sourceRequirementId || '').startsWith('bounded-workspace:business:'));
  assert.ok(recoveryRequirement);
  assert.equal(recoveryRequirement.classification, 'parent-boundary');
  assert.equal(recoveryRequirement.routeWorkspaceId, 'business');
  assert.equal(recoveryRequirement.routePath, GOVERNANCE_PATH);
  assert.equal(recoveryRequirement.targetWorkspaceId, 'business');
  assert.equal(recoveryRequirement.targetPath, RECOVERY_PARENT_PATH);

  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.closureInspection, 'valid');
  assert.equal(result.verification.carrierInspection, 'valid');
  assert.equal(result.verification.selectedHandoffConformance, 'qualified');
  assert.equal(result.verification.pointerEntrypointInspection, 'valid');

  const contextAudit = auditHandoffPackageContextCarriage({ bundle: result.bundle });
  assert.equal(contextAudit.status, 'ready');
  assert.equal(contextAudit.coverage.state, 'qualified');
  assert.equal(contextAudit.workspaceMaterializations.find((workspace) => workspace.workspaceId === 'business')?.coverage, 'bounded');
  assert.equal(contextAudit.findings.some((item) => item.code === 'portable.handoff-context.v2.coverage.incomplete'), false);
  assert.equal(result.verification.coldConsumerEntrypointInspection, 'valid');
  assert.equal(result.verification.companionInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal(result.findingSummary.status, 'clean');
  assert.equal(result.inspection.packageContract.packageRole, 'recipient-facing-handoff-carrier');
  assert.equal(result.inspection.packageContract.workspaces.length, 0);
  assert.equal(result.inspection.packageContract.materialRepresentations.length, 2);
  assert.match(result.inspection.packageContract.materialRepresentations[0].workspaceRepresentationPath, /workspace-representation\.trace\.md$/);
  assert.equal(result.inspection.workspaces.find((workspace) => workspace.workspaceId === 'business')?.coverage, 'bounded');

  const exactCoreFrontier = await prepareNodeSourceFrontier({ kind: 'local-workspace', path: coreRoot, workspaceId: 'core' });
  assert.equal(exactCoreFrontier.state, 'qualified');
  const exactLanding = projectPortableWorkspaceLandingPlan({
    bundle: result.bundle,
    workspaceIds: ['core'],
    repositories: [{ id: 'core-target', root: coreRoot, repository: 'Tiinex/core', clean: false, sourceSnapshot: exactCoreFrontier.workspaces[0].snapshot }]
  });
  assert.equal(exactLanding.status, 'ready');
  assert.equal(exactLanding.workspaces[0].state, 'ready');
  assert.equal(exactLanding.workspaces[0].preflight.state, 'exact-safe');
  assert.equal(exactLanding.workspaces[0].preflight.outcome, 'land');
  assert.equal(exactLanding.findings.some((item) => item.code === 'portable.workspace-landing.local-repository-dirty'), false);

  const cleanOnlyLanding = projectPortableWorkspaceLandingPlan({
    bundle: result.bundle,
    workspaceIds: ['core'],
    repositories: [{ id: 'core-target', root: coreRoot, repository: 'Tiinex/core', clean: true }]
  });
  assert.equal(cleanOnlyLanding.status, 'blocked');
  assert.equal(cleanOnlyLanding.workspaces[0].preflight.state, 'unresolved');
  assert.ok(cleanOnlyLanding.findings.some((item) => item.code === 'portable.workspace-landing.target-source-snapshot-required'));

  await writeWorkspaceFile(coreRoot, 'src/current-only-wip.txt', 'current-only WIP\n');
  await writeWorkspaceFile(coreRoot, ROUTE_PATH, `${route}\ncurrent target edit\n`);
  const divergentCoreFrontier = await prepareNodeSourceFrontier({ kind: 'local-workspace', path: coreRoot, workspaceId: 'core' });
  assert.equal(divergentCoreFrontier.state, 'qualified');
  const divergentLanding = projectPortableWorkspaceLandingPlan({
    bundle: result.bundle,
    workspaceIds: ['core'],
    repositories: [{ id: 'core-target', root: coreRoot, repository: 'Tiinex/core', clean: true, sourceSnapshot: divergentCoreFrontier.workspaces[0].snapshot }]
  });
  assert.equal(divergentLanding.status, 'blocked');
  assert.equal(divergentLanding.workspaces[0].state, 'blocked');
  assert.equal(divergentLanding.workspaces[0].preflight.state, 'reconciliation-required');
  assert.equal(divergentLanding.workspaces[0].preflight.outcome, 'stop');
  assert.equal(divergentLanding.workspaces[0].preflight.counts.currentOnly, 2);
  assert.deepEqual(divergentLanding.workspaces[0].preflight.paths.map((item) => [item.path, item.classification, item.currentChange]), [
    [ROUTE_PATH, 'current-only', 'byte-changed'],
    ['src/current-only-wip.txt', 'current-only', 'added']
  ]);
  assert.ok(divergentLanding.findings.some((item) => item.code === 'portable.workspace-landing.reconciliation-required'));

  const humanProjection = projectPortableHandoffCarrierOutputFromPackage({ bundle: result.bundle, route: result.carrierProjection.routes[0].id });
  assert.equal(humanProjection.status, 'ready');
  assert.equal(humanProjection.humanOutput.presentation.recipientLabel, 'Loom');
  assert.equal(humanProjection.humanOutput.presentation.recipientProjectionAuthority, 'qualified-selected-handoff-to-endpoint-only');
  assert.match(humanProjection.humanOutput.normalInlineRouting.content, /Continue from \(do not read native; pass to Tiinex after bootstrap\):/);

  const businessTopology = (result.inspection.workspaces || []).find((workspace) => workspace.workspaceId === 'business');
  assert.ok(businessTopology?.workspaceArchivePath);
  const businessArchiveFile = fileByPath(result.bundle, businessTopology.workspaceArchivePath);
  assert.ok(businessArchiveFile);
  const businessArchive = inspectStoredWorkspaceArchive(packageFileBytes(businessArchiveFile), { ownedBytes: true });
  assert.equal(businessArchive.state, 'qualified');
  const representedPaths = businessArchive.entries.map((entry) => entry.path).sort();
  assert.ok(representedPaths.includes(BUSINESS_WORKSPACE_PATH));
  assert.ok(representedPaths.includes(GOVERNANCE_PATH));
  assert.ok(representedPaths.includes(ANCHOR_ROLE_PATH));
  assert.ok(representedPaths.includes(LOOM_ROLE_PATH));
  assert.equal(representedPaths.includes(PRIOR_ANSWER_PATH), false);
  assert.equal(representedPaths.includes(RECOVERY_PARENT_PATH), false);

  const businessCache = (result.inspection.caches || []).find((cache) => cache.workspaceId === 'business');
  assert.ok(businessCache);
  const recoveredParent = (businessCache.materials || []).find((material) => material.originalPath === RECOVERY_PARENT_PATH || material.targetPath === RECOVERY_PARENT_PATH);
  assert.ok(recoveredParent);
  assert.equal(recoveredParent.classification, 'parent-boundary');
  assert.ok(String(recoveredParent.sourceRequirementId || '').startsWith('bounded-workspace:business:'));

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready');
  assert.equal(orientation.routes.length, 1);
  assert.equal(orientation.routes[0].from, 'Anchor');
  assert.equal(orientation.routes[0].to, 'Loom');
  assert.equal(orientation.routes[0].endpointRolePointers.length, 2);

  const grounding = groundPortableColdConsumer({
    bundle: result.bundle,
    route: orientation.routes[0].id,
    holderRole: 'Loom',
    interactionMode: 'execution',
    participants: [{ id: 'fixture-participant', label: 'Fixture participant', roles: ['Loom'] }]
  });
  assert.equal(grounding.status, 'ready');
  assert.equal(grounding.role.state, 'qualified');
  assert.equal(grounding.holderBinding.state, 'qualified');
  assert.equal(grounding.holderBinding.authorization.state, 'qualified');
  assert.equal(grounding.holderBinding.authorization.assignmentMode, 'explicit-session');
  assert.deepEqual(grounding.holderBinding.authorization.authorizedModes, ['explicit-session', 'handoff']);
  assert.equal(grounding.holderBinding.authorization.provenance.roleArtifactPath.endsWith(LOOM_ROLE_PATH), true);
  assert.equal(grounding.holderBinding.durableIdentity.state, 'not-established');
  assert.equal(grounding.findingSummary.status, 'clean');
});
