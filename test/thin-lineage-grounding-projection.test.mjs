import test from 'node:test';
import assert from 'node:assert/strict';

import { projectGroundingParticipantContext } from '../src/tooling/portable/grounding/grounding.participantContext.js';
import { projectGroundingSourceEvidence } from '../src/tooling/portable/grounding/grounding.sourceEvidence.js';
import { projectGroundingOrchestrationReadiness } from '../src/tooling/portable/grounding/grounding.orchestrationReadiness.js';
import { projectGroundingProcessApplicability } from '../src/tooling/portable/grounding/grounding.processApplicability.js';
import { projectGroundingImplementationSourceAuthority } from '../src/tooling/portable/grounding/grounding.implementationSourceAuthority.js';
import { projectGroundingDelegationReadiness } from '../src/tooling/portable/grounding/grounding.delegationReadiness.js';
import { projectGroundingDelegationArtifactAuthority } from '../src/tooling/portable/grounding/grounding.delegationArtifactAuthority.js';
import { projectGroundingAuthority } from '../src/tooling/portable/grounding/grounding.readiness.authority.js';
import { projectHolderBindingAuthorization } from '../src/tooling/portable/grounding/grounding.holderBindingAuthorization.js';
import { projectCommonCliDefaultOutput } from '../src/tooling/portable/adapters/cli/cli.common-output.js';
import { composeGroundingReadiness } from '../src/tooling/portable/grounding/grounding.readiness.js';
import { normalizePortableInput } from '../src/tooling/portable/input/portable.input.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';

test('package-carried Role grounding never becomes semantic participation', () => {
  const projected = projectGroundingParticipantContext({
    participation: {
      participants: [],
      packageRoleGrounding: [{
        label: 'Axiom', pointerPath: '001-3-1-role-pointer.trace.md', groundingOnly: true, semanticParticipant: false,
        roleArtifact: { path: 'docs/.topics/roles/axiom-role.trace.md', sha256: 'a'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Axiom', roleKind: 'operational' }
      }],
      handoffCapacities: [{ direction: 'from', label: 'Anchor', kind: 'role' }, { direction: 'to', label: 'Loom', kind: 'role' }]
    }
  });
  assert.equal(projected.state, 'qualified-role-grounding-only');
  assert.equal(projected.participantMapState, 'not-established');
  assert.equal(projected.semanticParticipants.length, 0);
  assert.equal(projected.roleGrounding.length, 1);
  assert.equal(projected.roleGrounding[0].semanticParticipant, false);
  assert.equal(projected.endpoints.every((item) => item.semanticParticipant === false), true);
  assert.equal(projected.unresolved[0].code, 'participant-map-not-established');
});

test('only explicit semantic participant declarations establish the bounded participant map', () => {
  const projected = projectGroundingParticipantContext({
    participation: {
      participants: [{ id: 'participant-1', label: 'Axiom', roles: ['Axiom'], verification: 'declared' }],
      packageRoleGrounding: [{ label: 'Site', pointerPath: 'pointer.trace.md', roleArtifact: { path: 'site-role.trace.md', sha256: 'b'.repeat(64) } }]
    }
  });
  assert.equal(projected.state, 'explicit-semantic-participants');
  assert.equal(projected.participantMapState, 'explicit-bounded-map');
  assert.equal(projected.semanticParticipants[0].semanticParticipant, true);
  assert.equal(projected.roleGrounding[0].semanticParticipant, false);
  assert.deepEqual(projected.unresolved, []);
});

test('source projection preserves complete, bounded, cache, explicit requirement, and unavailable authority states', () => {
  const projected = projectGroundingSourceEvidence({
    contextAudit: {
      status: 'ready', coverage: { state: 'qualified' },
      workspaceMaterializations: [
        { workspaceId: 'core', coverage: 'complete', reason: 'complete-workspace-archive-representation', qualification: 'qualified' },
        { workspaceId: 'business', coverage: 'bounded', reason: 'bounded-workspace-archive-representation', qualification: 'qualified' }
      ],
      explicitDetachedMaterial: [{ workspaceId: 'docs', originalPath: '.topics/.schemas/x.md', archivePackagePath: 'cache.zip', bytes: 7, sha256: 'd'.repeat(64) }]
    },
    requiredContext: [
      { requirementId: 'r1', name: 'Core Task', state: 'qualified', providerMode: 'archive', kind: 'workspace-archive-entry', workspaceId: 'core', innerPath: '.topics/task.trace.md', referenceTarget: 'core::.topics/task.trace.md', bytes: 1, sha256: '1'.repeat(64) },
      { requirementId: 'r2', name: 'Business Epic', state: 'qualified', providerMode: 'archive', kind: 'workspace-archive-entry', workspaceId: 'business', innerPath: '.topics/epic.trace.md', referenceTarget: 'business::.topics/epic.trace.md', bytes: 2, sha256: '2'.repeat(64) },
      { requirementId: 'r3', name: 'Docs Schema', state: 'qualified', providerMode: 'cache', kind: 'workspace-cache-entry', workspaceId: 'docs', innerPath: '.topics/.schemas/x.md', referenceTarget: 'docs::.topics/.schemas/x.md', bytes: 3, sha256: '3'.repeat(64) },
      { requirementId: 'r4', name: 'Missing Authority', state: 'unresolved', workspaceId: 'business', innerPath: '.topics/missing.trace.md', referenceTarget: 'business::.topics/missing.trace.md' }
    ]
  });
  assert.equal(projected.carrier.completeWorkspaceCount, 1);
  assert.equal(projected.carrier.boundedWorkspaceCount, 1);
  assert.deepEqual(projected.requirements.map((item) => item.materialClass), ['complete-workspace', 'bounded-workspace', 'cache', 'explicit-requirement']);
  assert.equal(projected.boundedOrCache.length, 2);
  assert.equal(projected.blockers.length, 1);
  assert.equal(projected.blockers[0].code, 'authoritative-material-unavailable');
  assert.equal(projected.blockers[0].owner.kind, 'selected-handoff-required-context');
  assert.equal(projected.blockers[0].basis.materialClass, 'explicit-requirement');
  assert.match(projected.blockers[0].blockingReason, /exact declared Required Context material is not qualified/);
  assert.match(projected.blockers[0].request, /Provide exact qualified material for business::\.topics\/missing\.trace\.md/);
  assert.match(projected.blockers[0].request, /Do not substitute GitHub, a connector, a repository checkout, or network discovery/);
});

test('orchestration diagnostic keeps grounded-to-act bounded when participant/source landscape is not established', () => {
  const projection = projectGroundingOrchestrationReadiness({
    readinessState: 'grounded-to-act',
    participantContext: { participantMapState: 'not-established' },
    sourceEvidence: { workspaces: [{ workspace: 'core', state: 'qualified', sources: [{ repository: 'Tiinex/core' }] }], blockers: [] },
    topology: { currentFrontier: [{ id: 'task-1' }] }
  });
  assert.equal(projection.boundedActionReadiness, 'grounded-to-act');
  assert.equal(projection.state, 'bounded-route-only');
  assert.equal(projection.widerOrchestration.state, 'not-established');
  assert.deepEqual(projection.widerOrchestration.blockers.map((item) => item.code), ['participant-capability-map-not-established', 'source-authority-scope-bounded', 'process-applicability-semantic-authority-not-established']);
  assert.match(projection.boundary, /not a new lifecycle state/);
});

test('cache-carried authoritative context remains qualified when its whole Workspace is absent', () => {
  const projected = projectGroundingSourceEvidence({
    contextAudit: {
      status: 'ready', coverage: { state: 'qualified' },
      workspaceMaterializations: [{ workspaceId: 'core', coverage: 'complete', reason: 'complete-workspace-archive-representation', qualification: 'qualified' }],
      explicitDetachedMaterial: [{ workspaceId: 'business', originalPath: '.topics/epic.trace.md', archivePackagePath: 'business-cache.zip', bytes: 11, sha256: 'e'.repeat(64) }]
    },
    requiredContext: [{
      requirementId: 'business-epic', name: 'Business Epic', state: 'qualified', providerMode: 'cache', kind: 'workspace-cache-entry',
      workspaceId: 'business', innerPath: '.topics/epic.trace.md', referenceTarget: 'business::.topics/epic.trace.md', bytes: 11, sha256: 'e'.repeat(64)
    }]
  });
  assert.equal(projected.workspaces.some((item) => item.workspace === 'business'), false);
  assert.equal(projected.requirements[0].materialClass, 'cache');
  assert.equal(projected.requirements[0].availability, 'qualified');
  assert.deepEqual(projected.blockers, []);
});

test('rich lineage inventory cannot substitute for missing participant or source authority', () => {
  const participantContext = { participantMapState: 'not-established' };
  const sourceEvidence = { workspaces: [{ workspace: 'core', state: 'qualified', sources: [{ repository: 'Tiinex/core' }] }], blockers: [] };
  const thin = projectGroundingOrchestrationReadiness({ readinessState: 'grounded-to-act', participantContext, sourceEvidence, topology: { currentFrontier: [{ id: 'current' }] } });
  const rich = projectGroundingOrchestrationReadiness({ readinessState: 'grounded-to-act', participantContext, sourceEvidence, topology: {
    currentFrontier: [{ id: 'current' }], roots: Array.from({ length: 20 }, (_, i) => ({ id: `root-${i}` })), currentTasks: Array.from({ length: 20 }, (_, i) => ({ id: `task-${i}` }))
  } });
  assert.equal(thin.state, 'bounded-route-only');
  assert.equal(rich.state, 'bounded-route-only');
  assert.deepEqual(rich.widerOrchestration.blockers.map((item) => item.code), thin.widerOrchestration.blockers.map((item) => item.code));
});

test('process applicability stays unresolved without upstream-qualified explicit semantic authority', () => {
  const absent = projectGroundingProcessApplicability({
    participation: { packageRoleGrounding: [{ label: 'Process Owner' }] },
    processInventory: [{ id: 'process-from-inventory' }]
  });
  assert.equal(absent.state, 'not-established');
  assert.deepEqual(absent.facts, []);
  assert.equal(absent.unresolved[0].code, 'process-applicability-semantic-authority-not-established');
  assert.match(absent.unresolved[0].detail, /do not infer applicability from carried Roles/);

  const explicit = projectGroundingProcessApplicability({ processApplicability: {
    explicit: true,
    qualification: 'qualified',
    facts: [{ processId: 'p1', applicability: 'upstream-declared' }],
    source: 'qualified-semantic-projection'
  } });
  assert.equal(explicit.state, 'explicit-qualified-authority');
  assert.deepEqual(explicit.facts, [{ processId: 'p1', applicability: 'upstream-declared' }]);
  assert.equal(explicit.provenance.source, 'qualified-semantic-projection');
});

test('ground authority explains exact selected route and Handoff transfers without widening authority', () => {
  const projected = projectGroundingAuthority({
    status: 'ready',
    selectedRoute: { id: 'handoff-route:core:x', pointerPath: '001-pointer.trace.md', workspaceId: 'core', workspaceRelativeHandoffPath: '.topics/handoffs/x.trace.md', packagePath: 'core.zip', sha256: 'a'.repeat(64) },
    handoff: {
      purpose: 'bounded work', from: 'Anchor', to: 'Loom', routeId: 'handoff-route:core:x', workspaceId: 'core', workspaceRelativePath: '.topics/handoffs/x.trace.md', packagePath: 'core.zip', sha256: 'a'.repeat(64),
      transfers: [{ id: 'work', transferKind: 'work', description: 'bounded implementation', boundary: 'no semantic widening' }],
      completionExpectation: { signalKind: 'return' }, boundary: 'exact selected Handoff bytes'
    },
    role: { state: 'qualified', endpoint: { label: 'Loom', kind: 'role' } },
    holderBinding: { state: 'qualified', roleLabel: 'Loom', recipientRoleLabel: 'Loom', recipientCompatibility: 'compatible', source: 'explicit-cli-holder-role', explicit: true, inferredFromTransport: false },
    mutationBoundary: { sourceMutation: false, remoteWrite: false }
  }, 'routed-handoff-package');
  assert.equal(projected.route.provenance.basis, 'explicit-qualified-route-selection');
  assert.equal(projected.handoff.provenance.basis, 'exact-selected-handoff-bytes');
  assert.equal(projected.handoff.transfers[0].boundary, 'no semantic widening');
  assert.equal(projected.holderBinding.provenance.basis, 'explicit-consuming-session-holder-binding');
});

test('common ground projection keeps bounded action and wider orchestration separate while exposing declared Required Context purpose', () => {
  const output = projectCommonCliDefaultOutput({
    schema: 'result', operation: 'project-grounding-readiness', resultSchema: 'grounding', status: 'ready',
    readiness: { state: 'grounded-to-act', reasons: [], missingEvidence: [], nextAction: null },
    authority: { state: 'ready', route: { id: 'r', workspaceId: 'core' }, handoff: { purpose: 'p', from: 'Anchor', to: 'Loom', transfers: [] }, role: {}, holderBinding: {}, operationBoundary: {} },
    orchestrationReadiness: { state: 'bounded-route-only', boundedActionReadiness: 'grounded-to-act', widerOrchestration: { state: 'not-established', blockers: [{ code: 'participant-capability-map-not-established', detail: 'missing' }] }, participantMap: 'not-established', sourceScope: 'bounded-current-route', processApplicability: { state: 'not-established', unresolved: [{ code: 'process-applicability-semantic-authority-not-established' }] }, boundary: 'diagnostic only' },
    coverage: { requiredContext: { declared: 1, matchedInWorkspaceSnapshots: 1, missingFromWorkspaceSnapshots: 0, items: [{ requirementId: 'required:docs', name: 'docs-workspace', material: 'current Docs Workspace', purpose: 'read-only semantic boundary', declaredAvailability: 'available', state: 'qualified', workspaceId: 'docs', innerPath: '.topics/.workspaces/tiinex-docs.workspace.md', provenance: { basis: 'selected-handoff-required-context-declaration' } }], itemsOmitted: 0, bodiesProjected: 0, bodiesAvailable: 1 } },
    capsule: null, currentWork: { state: 'current-frontier-resolved', frontier: [], blockers: [] }, continuity: {}, findingSummary: { counts: { error: 0, warning: 0 } }, actionableFindings: [], boundary: 'bounded'
  }, { command: 'project-grounding-readiness', flags: {} });
  assert.equal(output.readiness.state, 'grounded-to-act');
  assert.equal(output.orchestrationReadiness.state, 'bounded-route-only');
  assert.equal(output.orchestrationReadiness.widerOrchestration.state, 'not-established');
  assert.equal(output.requiredContext.items[0].purpose, 'read-only semantic boundary');
  assert.equal(output.requiredContext.items[0].provenance.basis, 'selected-handoff-required-context-declaration');
});


const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const ROLE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';

function boundedActionReadinessFixture({ workspaceQualification = 'qualified', requiredState = 'qualified', holderState = 'qualified', holderAuthorization = 'qualified' } = {}) {
  const seal = (markdown) => {
    const sealed = sealC14nV2Self(markdown);
    assert.equal(sealed.state, 'sealed');
    return `${sealed.markdown}\n`;
  };
  const task = seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})\n  - Created At: 2026-09-14 10:00:00\n  - Authors: Fixture\n  - Why: Exercise bounded readiness.\n  - Summary: Bounded readiness task.\n  - Status: ready/local\n\n---\n\n# Bounded readiness task\n\n## Objective\n\nAct only on exact qualified carried material.\n\n## Done Criteria\n\nThe bounded route is actionable without claiming complete Workspace authority.\n\n## Scope\n\nPortable grounding readiness only.\n\n## Dependencies\n\nNone.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
  const taskDigest = validatedC14nV2PrimarySelfDigest(task).value;
  const role = seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE_SCHEMA_TARGET})\n  - Created At: 2026-09-14 10:00:00\n  - Authors: Fixture\n  - Why: Exercise bounded recipient authority.\n  - Summary: Anchor Role fixture.\n  - Status: active/local\n\n---\n\n# Anchor\n\n## Role Identity\n\n- Role Label: Anchor\n- Role Kind: operational\n\n## Role Boundary\n\n- In Scope: bounded readiness fixture\n- Out Of Scope: wider authority\n\n## Authority And Responsibility Boundary\n\n- May Do: exercise exact bounded action\n- Does Not Authorize: whole-program authority\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n\n## Interpretation Limits\n\n- Does Not Prove: human identity\n- Must Not Be Treated As: broader semantic authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
  const handoff = qualifiedHandoffFixture({
    from: 'Anchor',
    to: 'Anchor',
    parent: { trace: 'task.trace.md', relative: 'task.trace.md', includeBrowseGit: false, targetValue: taskDigest },
    requiredContext: '- Anchor Role\n  - Material: qualified Anchor Role\n  - Purpose: bounded recipient authority\n  - Availability: available\n  - Material Reference: [Anchor](role.trace.md)'
  });
  const material = normalizePortableInput({ files: [
    { path: 'business/task.trace.md', content: task },
    { path: 'business/role.trace.md', content: role },
    { path: 'business/handoff.trace.md', content: handoff }
  ] });
  return composeGroundingReadiness({
    mode: 'routed-handoff-package',
    authority: {
      status: 'ready',
      selectedRoute: { id: 'bounded-route', pointerPath: '001-pointer.trace.md', workspaceId: 'business', workspaceRelativeHandoffPath: 'handoff.trace.md' },
      handoff: { purpose: 'bounded readiness', from: 'Anchor', to: 'Anchor', transfers: [] },
      role: { state: 'qualified', endpoint: { label: 'Anchor', kind: 'role' } },
      holderBinding: {
        state: holderState,
        roleLabel: holderState === 'qualified' || holderState === 'blocked' ? 'Anchor' : '',
        authorization: {
          state: holderAuthorization,
          holderState: holderAuthorization === 'qualified' ? 'assignable per explicit session or Handoff' : '',
          provenance: { roleArtifactPath: 'business/role.trace.md' }
        }
      }
    },
    continuation: { state: 'ready' },
    contextAudit: {
      status: 'ready',
      coverage: { state: 'qualified' },
      workspaceMaterializations: [{ workspaceId: 'business', coverage: 'bounded', reason: 'bounded-workspace-archive-representation', qualification: workspaceQualification }]
    },
    material,
    requiredContext: [{
      requirementId: 'required:anchor-role',
      name: 'Anchor Role',
      material: 'qualified Anchor Role',
      purpose: 'bounded recipient authority',
      declaredAvailability: 'available',
      state: requiredState,
      providerMode: 'archive',
      kind: 'workspace-archive-entry',
      workspaceId: 'business',
      innerPath: 'role.trace.md',
      referenceTarget: 'business::role.trace.md'
    }]
  });
}

test('qualified bounded Workspace carriage can become grounded-to-act without becoming complete or whole-program authority', () => {
  const result = boundedActionReadinessFixture();
  assert.equal(result.readiness.state, 'grounded-to-act');
  assert.equal(result.coverage.workspaceSnapshots.qualified, true);
  assert.equal(result.coverage.workspaceSnapshots.completeCount, 0);
  assert.equal(result.coverage.workspaceSnapshots.boundedCount, 1);
  assert.match(result.coverage.workspaceSnapshots.boundary, /never implies whole-Workspace or whole-program authority/);
  assert.equal(result.orchestrationReadiness.state, 'bounded-route-only');
  assert.equal(result.orchestrationReadiness.widerOrchestration.state, 'not-established');
  assert.ok(result.orchestrationReadiness.widerOrchestration.blockers.some((item) => item.code === 'source-authority-scope-bounded'));
  assert.equal(result.capsule.implementationSourceAuthority.state, 'unresolved');
  assert.equal(result.capsule.implementationSourceAuthority.unresolved[0].code, 'implementation-source-authority-not-established');
  assert.equal(result.readiness.missingEvidence.some((item) => item.code === 'workspace-snapshot-coverage-unqualified'), false);
});


test('matching holder assertion stays discussion-only when exact Role assignment authorization is unresolved', () => {
  const result = boundedActionReadinessFixture({ holderAuthorization: 'unresolved' });
  assert.equal(result.readiness.state, 'grounded-to-discuss');
  assert.ok(result.readiness.reasons.some((item) => item.code === 'session-holder-role-binding-authorization-unresolved'));
  assert.equal(result.readiness.nextAction.kind, 'resolve-session-holder-binding-authorization');
  assert.equal(result.readiness.nextAction.target, 'business/role.trace.md');
});

test('authorized Role assignment without a qualified binding source still requires holder binding evidence', () => {
  const result = boundedActionReadinessFixture({ holderState: 'unresolved', holderAuthorization: 'qualified' });
  assert.equal(result.readiness.state, 'grounded-to-discuss');
  assert.ok(result.readiness.reasons.some((item) => item.code === 'session-holder-role-binding-unresolved'));
  assert.equal(result.readiness.nextAction.kind, 'establish-session-holder-role-binding');
});

test('holder Role mismatch remains blocking even when Role material authorizes the assignment mode', () => {
  const result = boundedActionReadinessFixture({ holderState: 'blocked', holderAuthorization: 'qualified' });
  assert.equal(result.readiness.state, 'insufficient-grounding');
  assert.ok(result.readiness.missingEvidence.some((item) => item.code === 'session-holder-role-binding-blocked'));
});

test('holder-binding authorization consumes structured canonical modes while Holder State remains diagnostic-only', () => {
  const baseRole = {
    state: 'qualified',
    endpoint: { label: 'Fixture', kind: 'role' },
    material: { state: 'qualified', artifact: { path: 'business/.topics/roles/fixture.trace.md', sha256: 'a'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Fixture' } }
  };
  const authorized = projectHolderBindingAuthorization({
    ...baseRole,
    holderRelationshipLoaded: { holderState: 'arbitrary human-readable summary', assignmentModes: 'explicit-session, handoff' }
  });
  assert.equal(authorized.state, 'qualified');
  assert.equal(authorized.assignmentMode, 'explicit-session');
  assert.deepEqual(authorized.authorizedModes, ['explicit-session', 'handoff']);
  assert.equal(authorized.modeAuthority.provenance.field, 'Assignment Modes');
  assert.equal(authorized.modeAuthority.provenance.basis, 'exact-qualified-role-assignment-modes');
  assert.equal(authorized.holderState, 'arbitrary human-readable summary');

  const unknownToken = projectHolderBindingAuthorization({
    ...baseRole,
    holderRelationshipLoaded: { holderState: 'contains session and handoff words', assignmentModes: 'explicit-session, future-magic-mode' }
  });
  assert.equal(unknownToken.state, 'unresolved');
  assert.equal(unknownToken.reasonCode, 'holder-assignment-mode-authority-unknown-token');
});

const ACTIVE_CANONICAL_ROLE_MATRIX = [
  { label: 'Anchor', path: '.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md', sha256: '8302ced51dca642e4f2cc38e76344e0bc5583b988d17d472176d812813f917f3', modes: ['explicit-session', 'handoff'] },
  { label: 'Axiom', path: '.topics/roles/001-2-1-axiom-canonical-holder-cutover-role.trace.md', sha256: '97d00ef1b7263f47703ae2875aba4f58c2f236b32b3fc508d2f4528eefbb0d01', modes: ['explicit-session', 'handoff'] },
  { label: 'Loom', path: '.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md', sha256: 'b6206c9d450c13f2eac24895567255f0afadbd9dc71685b29c668201c78c88ad', modes: ['explicit-session', 'explicit-role-invocation', 'handoff'] },
  { label: 'Sigma', path: '.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md', sha256: '0f5944dc3f0c4c21ea6f29318da92171dad5343b45b18a7a6b5dac59f386cebf', modes: ['explicit-participation'] },
  { label: 'Glimmer', path: '.topics/roles/001-5-1-glimmer-canonical-holder-cutover-role.trace.md', sha256: 'f08a155596381ba8a8d4b7f3dda84a67f53f82c7b777ce8a0dd1312fd8035724', modes: ['explicit-user-session', 'handoff'] },
  { label: 'Kodax', path: '.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md', sha256: '1983edfcc64f136eee8ed3f40fac163b5fb4ecb57edba5068883f77f10db268e', modes: ['explicit-session', 'explicit-role-invocation', 'handoff'] },
  { label: 'Pilot', path: '.topics/roles/001-7-1-pilot-canonical-holder-cutover-role.trace.md', sha256: 'b6ff95c6edc9669ea8c41170a14847b9733bd83c1008d72a23484a2b8a89dd8f', modes: ['explicit-session', 'explicit-role-invocation', 'handoff'] },
  { label: 'Prism', path: '.topics/roles/001-8-1-1-prism-canonical-holder-cutover-role.trace.md', sha256: '590880b05ee3915e8499ed0fbd7e7b7aaf3ab658c14ca98abfac73bf060767ae', modes: ['explicit-session', 'explicit-role-invocation', 'handoff'] }
];

const HISTORICAL_LEGACY_ROLES = [
  ['Anchor', '.topics/roles/001-1-anchor-role.trace.md', 'ea081ef6221fdd13b2e4e3a7691342fba3e0c6615954a90da410b8c4ce6213b3'],
  ['Axiom', '.topics/roles/001-2-axiom-role.trace.md', 'f17e74db07c6a2d1288119c330a20b3b19cd0eb01f6a2c9f207d21102d9488d5'],
  ['Loom', '.topics/roles/001-3-loom-role.trace.md', '8e6afdac36d2596a6c63d1fb6b318260fff728b1a99c4aa29a7253fd36b4a457'],
  ['Sigma', '.topics/roles/001-4-sigma-role.trace.md', '4db1e529e00d855fdf58821a5cfe4c22c7df5d725f0809ce1ba2d7bdb42604ee'],
  ['Glimmer', '.topics/roles/001-5-glimmer-role.trace.md', '376a4fd7284e399bfcb667fe9eabefa518f7e676328d45ff6b72a46f2b1a8b4a'],
  ['Kodax', '.topics/roles/001-6-kodax-role.trace.md', '4c0adf7100f149435a15cb7cc4dd91340b36ead0163fc58eaca352927e78772b'],
  ['Pilot', '.topics/roles/001-7-pilot-role.trace.md', '4c415382817723c5332f8fa37dc28f7ca4cfc577deb219e52e7e9ee86c479331'],
  ['Playthings', '.topics/roles/001-8-playthings-role.trace.md', '99337c48bdaa0025330fe847674905a76c431860d33d3df43b30e4e8c846e9e3'],
  ['Prism', '.topics/roles/001-9-prism-role.trace.md', '2ad9a98d099428a771bc4740896386d02e620fb82a4ffd139a7f8794863171ad']
];

function canonicalRoleFixture({ label, path, sha256, modes, state = 'qualified', materialState = 'qualified', holderState = 'diagnostic only' }) {
  return {
    state,
    endpoint: { label, kind: 'role' },
    material: { state: materialState, artifact: { path: `001-3-business.workspace.zip::${path}`, sha256, schemaId: 'tiinex.party.role.v1', roleLabel: label } },
    holderRelationshipLoaded: { holderState, assignmentModes: modes.join(', ') }
  };
}

test('historical pre-cutover Role artifacts no longer authorize current holder binding without canonical Assignment Modes', () => {
  for (const [label, path, sha256] of HISTORICAL_LEGACY_ROLES) {
    const projected = projectHolderBindingAuthorization({
      state: 'qualified',
      endpoint: { label, kind: 'role' },
      material: { state: 'qualified', artifact: { path: `001-3-business.workspace.zip::${path}`, sha256, schemaId: 'tiinex.party.role.v1', roleLabel: label } },
      holderRelationshipLoaded: { holderState: 'historical diagnostic prose', assignmentModes: '' }
    });
    assert.equal(projected.state, 'unresolved', label);
    assert.equal(projected.reasonCode, 'holder-assignment-mode-authority-missing', label);
    assert.deepEqual(projected.authorizedModes, [], label);
    assert.equal(projected.modeAuthority.provenance.decisionArtifact, null, label);
    assert.equal(projected.modeAuthority.provenance.exactRoleSourcePath, '', label);
  }
});

test('the exact eight active canonical Roles authorize only through direct structured Assignment Modes', () => {
  for (const active of ACTIVE_CANONICAL_ROLE_MATRIX) {
    const role = canonicalRoleFixture(active);
    const primaryMode = active.modes[0];
    const projected = projectHolderBindingAuthorization(role, { assertionMode: primaryMode });
    assert.equal(projected.state, 'qualified', active.label);
    assert.equal(projected.assignmentMode, primaryMode, active.label);
    assert.deepEqual(projected.authorizedModes, active.modes, active.label);
    assert.equal(projected.modeAuthority.source, 'qualified-recipient-role-structured-modes', active.label);
    assert.equal(projected.modeAuthority.provenance.basis, 'exact-qualified-role-assignment-modes', active.label);
    assert.equal(projected.modeAuthority.provenance.roleArtifactSha256, active.sha256, active.label);
    assert.match(projected.modeAuthority.provenance.roleArtifactPath, new RegExp(active.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), active.label);
  }

  const kodax = ACTIVE_CANONICAL_ROLE_MATRIX.find((item) => item.label === 'Kodax');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(kodax), { assertionMode: 'explicit-role-invocation' }).state, 'qualified');
  const pilot = ACTIVE_CANONICAL_ROLE_MATRIX.find((item) => item.label === 'Pilot');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(pilot), { assertionMode: 'explicit-role-invocation' }).state, 'qualified');
  const sigma = ACTIVE_CANONICAL_ROLE_MATRIX.find((item) => item.label === 'Sigma');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(sigma), { assertionMode: 'explicit-session' }).state, 'unresolved');
  const glimmer = ACTIVE_CANONICAL_ROLE_MATRIX.find((item) => item.label === 'Glimmer');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(glimmer), { assertionMode: 'explicit-session' }).state, 'unresolved');
});

test('canonical holder authorization fails closed for missing modes and unqualified current Role material', () => {
  const active = ACTIVE_CANONICAL_ROLE_MATRIX.find((item) => item.label === 'Loom');
  const missing = canonicalRoleFixture({ ...active, modes: [] });
  assert.equal(projectHolderBindingAuthorization(missing).state, 'unresolved');
  assert.equal(projectHolderBindingAuthorization(missing).reasonCode, 'holder-assignment-mode-authority-missing');

  const unqualifiedRole = canonicalRoleFixture({ ...active, state: 'unresolved' });
  assert.equal(projectHolderBindingAuthorization(unqualifiedRole).state, 'unresolved');
  assert.equal(projectHolderBindingAuthorization(unqualifiedRole).reasonCode, 'qualified-role-holder-authority-not-established');

  const unqualifiedMaterial = canonicalRoleFixture({ ...active, materialState: 'unresolved' });
  assert.equal(projectHolderBindingAuthorization(unqualifiedMaterial).state, 'unresolved');
  assert.equal(projectHolderBindingAuthorization(unqualifiedMaterial).reasonCode, 'qualified-role-holder-authority-not-established');
});

test('unknown Holder State prose never self-authorizes without direct structured modes', () => {
  const baseRole = {
    state: 'qualified',
    endpoint: { label: 'Unknown', kind: 'role' },
    material: { state: 'qualified', artifact: { path: '.topics/roles/unknown.trace.md', sha256: 'b'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Unknown' } },
    holderRelationshipLoaded: { holderState: 'explicit session, invocation, Handoff, participation all sound familiar', assignmentModes: '' }
  };
  const projected = projectHolderBindingAuthorization(baseRole);
  assert.equal(projected.state, 'unresolved');
  assert.equal(projected.reasonCode, 'holder-assignment-mode-authority-missing');
  assert.deepEqual(projected.authorizedModes, []);
});


test('token substring punctuation and fuzzy Holder State variants cannot authorize a Role without direct modes', () => {
  const variants = [
    'assignable per explicit session or Handoff',
    'assignable per explicit-session or Handoff!',
    'session invocation handoff',
    'assignable per explicit session, invocation, or Handoff; no permanent holder asserted',
    'approximately assignable for a session and maybe a handoff'
  ];
  for (const holderState of variants) {
    const projected = projectHolderBindingAuthorization({
      state: 'qualified',
      endpoint: { label: 'Unmapped', kind: 'role' },
      material: { state: 'qualified', artifact: { path: '.topics/roles/unmapped.trace.md', sha256: 'c'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Unmapped' } },
      holderRelationshipLoaded: { holderState, assignmentModes: '' }
    });
    assert.equal(projected.state, 'unresolved', holderState);
    assert.equal(projected.reasonCode, 'holder-assignment-mode-authority-missing', holderState);
  }
});

test('bounded Workspace carriage stays blocked when its representation is not independently qualified', () => {
  const result = boundedActionReadinessFixture({ workspaceQualification: 'unresolved' });
  assert.equal(result.readiness.state, 'insufficient-grounding');
  assert.equal(result.coverage.workspaceSnapshots.qualified, false);
  assert.equal(result.coverage.workspaceSnapshots.boundedCount, 1);
  assert.equal(result.coverage.workspaceSnapshots.unqualified[0].qualification, 'unresolved');
  const blocker = result.readiness.missingEvidence.find((item) => item.code === 'workspace-snapshot-coverage-unqualified');
  assert.ok(blocker);
  assert.match(blocker.message, /independently qualified as complete or bounded/);
});

test('bounded Workspace carriage cannot bypass an unqualified exact Required Context item', () => {
  const result = boundedActionReadinessFixture({ requiredState: 'unresolved' });
  assert.equal(result.readiness.state, 'insufficient-grounding');
  assert.ok(result.readiness.missingEvidence.some((item) => item.code === 'required-context-unqualified'));
  assert.equal(result.readiness.missingEvidence.some((item) => item.code === 'workspace-snapshot-coverage-unqualified'), false);
  assert.equal(result.coverage.workspaceSnapshots.boundedCount, 1);
});


test('holder binding projection distinguishes explicit session input from semantic holder-assignment authority', () => {
  const projected = projectGroundingAuthority({
    status: 'ready',
    selectedRoute: { id: 'r', pointerPath: '001-pointer.trace.md', workspaceId: 'core', workspaceRelativeHandoffPath: 'handoff.trace.md' },
    handoff: { purpose: 'p', from: 'Anchor', to: 'Loom', transfers: [] },
    role: { state: 'qualified', endpoint: { label: 'Loom', kind: 'role' } },
    holderBinding: {
      state: 'qualified', roleLabel: 'Loom', recipientRoleLabel: 'Loom', recipientCompatibility: 'matched', source: 'explicit-input', explicit: true, inferredFromTransport: false,
      sourceDetail: { kind: 'operator-session-input', locator: 'cli:--holder-role', authorityClass: 'session-binding-input-only', semanticAuthorityState: 'not-established', qualifiedMaterialSource: false }
    },
    mutationBoundary: { sourceMutation: false, remoteWrite: false }
  }, 'routed-handoff-package');
  assert.equal(projected.holderBinding.bindingPresent, true);
  assert.equal(projected.holderBinding.declarationPresent, true);
  assert.equal(projected.holderBinding.recipientCompatibility, 'matched');
  assert.equal(projected.holderBinding.sourceDetail.locator, 'cli:--holder-role');
  assert.equal(projected.holderBinding.sourceDetail.authorityClass, 'session-binding-input-only');
  assert.equal(projected.holderBinding.semanticAuthorityState, 'not-established');
  assert.equal(projected.holderBinding.provenance.qualifiedMaterialSource, false);
});

test('writable complete Business Workspace and executable Task do not establish implementation-source creation authority', () => {
  const projected = projectGroundingImplementationSourceAuthority({
    authority: { status: 'ready' },
    records: [{
      path: 'business/.topics/.workspaces/tiinex-business.workspace.md',
      hasContinuityContext: true,
      hasIntegrity: true,
      markdown: '# Continuity Context\n\n---\n\n# Business\n\n## Workspace Boundary\n\nImplementation work may be staged in this Workspace when separately authorized.\n\n# Continuity Integrity\n'
    }],
    contextAudit: { workspaceMaterializations: [{ workspaceId: 'business', qualification: 'qualified', coverage: 'complete', sourceWorkspaceTargetInnerPath: '.topics/.workspaces/tiinex-business.workspace.md', sourceWorkspaceTargetSha256: 'a'.repeat(64) }] },
    requiredContext: [{ requirementId: 'business-workspace', state: 'qualified', workspaceId: 'business', purpose: 'writable implementation and regression basis.', provenance: { basis: 'selected-handoff-required-context-declaration', declarationSource: { line: 42, endLine: 46 } } }]
  });
  assert.equal(projected.state, 'unresolved');
  assert.deepEqual(projected.facts, []);
  assert.equal(projected.unresolved[0].code, 'implementation-source-authority-not-established');
  assert.equal(projected.descriptiveFacts.length, 2);
  assert.equal(projected.descriptiveFacts.every((item) => item.authorityEffect === 'descriptive-only'), true);
  assert.match(projected.descriptiveFacts[0].provenance.boundary, /does not reinterpret boundary prose as implementation-source creation permission/);
  assert.match(projected.descriptiveFacts[1].text, /writable implementation and regression basis/);
  assert.match(projected.boundary, /does not define allow\/deny meaning/);
});

test('implementation-source authority accepts only an exact upstream-qualified projection and passes it through without interpretation', () => {
  const qualified = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: {
    explicit: true,
    qualification: 'qualified',
    sourceArtifact: { workspaceId: 'docs', path: '.topics/interpretations/source-authority.trace.md', sha256: 'b'.repeat(64), schemaId: 'tiinex.interpretation.v1' },
    facts: [{ id: 'semantic-owner-fact', disposition: 'upstream-owned' }],
    provenance: { owner: 'semantic-owner' }
  } } });
  assert.equal(qualified.state, 'explicit-qualified-upstream-projection');
  assert.equal(qualified.facts[0].id, 'semantic-owner-fact');
  assert.equal(qualified.provenance.sourceArtifact.path, '.topics/interpretations/source-authority.trace.md');
  assert.deepEqual(qualified.unresolved, []);
  assert.match(qualified.boundary, /upstream semantic owner defines the meaning/);

  const inexact = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: {
    explicit: true,
    qualification: 'qualified',
    sourceArtifact: { path: '.topics/interpretations/source-authority.trace.md', sha256: '' },
    facts: [{ disposition: 'must-not-pass' }]
  } } });
  assert.equal(inexact.state, 'unresolved');
  assert.deepEqual(inexact.facts, []);
});

test('cached Role presence alone never enables qualified delegation authoring', () => {
  const processApplicability = projectGroundingProcessApplicability({
    participation: { packageRoleGrounding: [{ label: 'Site', roleArtifact: { path: 'business/.topics/roles/site.trace.md', sha256: 'a'.repeat(64) } }] }
  });
  const sourceAuthority = projectGroundingImplementationSourceAuthority({ authority: {} });
  const projected = projectGroundingDelegationReadiness({
    authority: { participation: { packageRoleGrounding: [{ label: 'Site' }] } },
    processApplicability,
    implementationSourceAuthority: sourceAuthority
  });
  assert.equal(projected.state, 'not-established');
  assert.equal(projected.plainChatFallbackPermitted, false);
  assert.equal(projected.repositoryScanningFallbackPermitted, false);
  assert.deepEqual(projected.nextOperations, []);
  assert.deepEqual(projected.blockers.map((item) => item.code), [
    'delegate-capability-authority-not-established',
    'delegation-process-applicability-not-established',
    'delegation-target-authority-not-established',
    'delegation-source-authority-not-established',
    'delegation-return-reconciliation-expectation-not-established'
  ]);
  assert.match(projected.blockers[0].request, /Cached Role presence/);
  assert.match(projected.blockers[0].request, /Do not fall back to plain-chat delegation/);
});

test('explicit forward-selected delegate authority plus qualified process target source and return inputs exposes the normal Tooling delegation path', () => {
  const sourceArtifact = (path, sha = 'b'.repeat(64)) => ({ workspaceId: 'business', path, sha256: sha, schemaId: 'tiinex.interpretation.v1' });
  const authority = {
    delegateCapabilityAuthority: {
      explicit: true,
      qualification: 'qualified',
      sourceArtifact: sourceArtifact('.topics/interpretations/delegate-selection.trace.md'),
      selection: { state: 'forward-selected' },
      delegate: { label: 'Site', kind: 'role' },
      capabilities: [{ id: 'site-specialist', relevance: 'upstream-qualified' }]
    },
    delegationTargetAuthority: {
      explicit: true,
      qualification: 'qualified',
      sourceArtifact: sourceArtifact('.topics/interpretations/delegation-target.trace.md', 'c'.repeat(64)),
      target: { workspaceId: 'site', repository: 'Tiinex/site', taskDirectory: '.topics/tasks', handoffDirectory: '.topics/handoffs' }
    },
    delegationReturnReconciliationExpectation: {
      explicit: true,
      qualification: 'qualified',
      sourceArtifact: sourceArtifact('.topics/interpretations/return.trace.md', 'd'.repeat(64)),
      completionExpectation: { signalKind: 'return', signalMeaning: 'return qualified implementation/evidence Handoff', returnTo: 'Anchor' },
      reconciliation: { state: 'required-before-integration', expectation: 'compare and reconcile exact source frontier before integration' }
    }
  };
  const processApplicability = projectGroundingProcessApplicability({ processApplicability: {
    explicit: true,
    qualification: 'qualified',
    source: 'qualified-semantic-projection',
    facts: [{ processId: 'specialist-delegation', applicability: 'explicitly-applicable' }]
  } });
  const sourceAuthority = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: {
    explicit: true,
    qualification: 'qualified',
    sourceArtifact: sourceArtifact('.topics/interpretations/source-authority.trace.md', 'e'.repeat(64)),
    facts: [{ source: 'site', disposition: 'upstream-owned' }]
  } } });
  const projected = projectGroundingDelegationReadiness({ authority, processApplicability, implementationSourceAuthority: sourceAuthority });
  assert.equal(projected.state, 'qualified-for-delegation-authoring');
  assert.deepEqual(projected.blockers, []);
  assert.equal(projected.delegateCapabilityAuthority.delegate.label, 'Site');
  assert.equal(projected.targetAuthority.target.workspaceId, 'site');
  assert.equal(projected.returnReconciliationExpectation.completionExpectation.returnTo, 'Anchor');
  assert.deepEqual(projected.nextOperations.map((item) => item.kind), [
    'author-delegation-task',
    'author-delegation-handoff',
    'manufacture-delegation-carrier'
  ]);
  assert.equal(projected.nextOperations[0].command, 'author');
  assert.equal(projected.nextOperations[0].schemaId, 'tiinex.task.v1');
  assert.equal(projected.nextOperations[0].directory, '.topics/tasks');
  assert.equal(projected.nextOperations[1].recipient.label, 'Site');
  assert.equal(projected.nextOperations[2].command, 'handoff');
  assert.equal(projected.nextOperations[2].carrierAllocation, 'machine-derived-from-qualified-parent-pointer-topology');
  assert.match(projected.boundary, /generates a work plan/);
});

test('delegation readiness fails closed on an individually missing authority slot instead of suggesting discovery or plain chat', () => {
  const exact = { workspaceId: 'business', path: '.topics/authority.trace.md', sha256: 'f'.repeat(64), schemaId: 'tiinex.interpretation.v1' };
  const processApplicability = projectGroundingProcessApplicability({ processApplicability: { explicit: true, qualification: 'qualified', source: 'qualified', facts: [{ applicable: true }] } });
  const sourceAuthority = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: { explicit: true, qualification: 'qualified', sourceArtifact: exact, facts: [{ allowed: 'upstream' }] } } });
  const projected = projectGroundingDelegationReadiness({
    authority: {
      delegateCapabilityAuthority: { explicit: true, qualification: 'qualified', sourceArtifact: exact, selection: { state: 'forward-selected' }, delegate: { label: 'Site' }, capabilities: ['site'] },
      delegationTargetAuthority: { explicit: true, qualification: 'qualified', sourceArtifact: exact, target: { workspaceId: 'site', repository: 'Tiinex/site', taskDirectory: '.topics/tasks', handoffDirectory: '.topics/handoffs' } }
    },
    processApplicability,
    implementationSourceAuthority: sourceAuthority
  });
  assert.equal(projected.state, 'not-established');
  assert.deepEqual(projected.blockers.map((item) => item.code), ['delegation-return-reconciliation-expectation-not-established']);
  assert.match(projected.blockers[0].request, /Provide an explicit upstream-qualified return\/reconciliation projection/);
  assert.match(projected.blockers[0].request, /repository scanning/);
  assert.deepEqual(projected.nextOperations, []);
});


test('delegation readiness requires substantive process and source projections, not empty qualified markers', () => {
  const exact = { workspaceId: 'business', path: '.topics/authority.trace.md', sha256: '1'.repeat(64), schemaId: 'tiinex.interpretation.v1' };
  const authority = {
    delegateCapabilityAuthority: { explicit: true, qualification: 'qualified', sourceArtifact: exact, selection: { state: 'forward-selected' }, delegate: { label: 'Site' }, capabilities: ['site'] },
    delegationTargetAuthority: { explicit: true, qualification: 'qualified', sourceArtifact: exact, target: { workspaceId: 'site', repository: 'Tiinex/site', taskDirectory: '.topics/tasks', handoffDirectory: '.topics/handoffs' } },
    delegationReturnReconciliationExpectation: { explicit: true, qualification: 'qualified', sourceArtifact: exact, completionExpectation: { signalKind: 'return', signalMeaning: 'return qualified result', returnTo: 'Anchor' }, reconciliation: { state: 'not-required' } }
  };
  const processApplicability = projectGroundingProcessApplicability({ processApplicability: { explicit: true, qualification: 'qualified', facts: [], source: '' } });
  const sourceAuthority = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: { explicit: true, qualification: 'qualified', sourceArtifact: exact, facts: [] } } });
  const projected = projectGroundingDelegationReadiness({ authority, processApplicability, implementationSourceAuthority: sourceAuthority });
  assert.equal(projected.state, 'not-established');
  assert.deepEqual(projected.blockers.map((item) => item.code), ['delegation-process-applicability-not-established', 'delegation-source-authority-not-established']);
});

test('current-work selector keeps inbound recipient distinct from downstream delegate', () => {
  const fixture = artifactDelegationFixture();
  const projected = projectGroundingDelegationArtifactAuthority(fixture);
  assert.equal(projected.state, 'qualified-forward-artifact-closure');
  assert.deepEqual(projected.unresolved, []);
  assert.equal(projected.delegateCapabilityAuthority.delegate.label, 'Axiom');
  assert.equal(projected.processApplicability.source, 'business::.topics/roles/anchor.trace.md');
  assert.equal(projected.delegationTargetAuthority.target.repository, 'Tiinex/core');
  assert.equal(projected.implementationSourceAuthority.sourceArtifact.path, 'core/.topics/grounding/task.trace.md');
  assert.equal(projected.delegationReturnReconciliationExpectation.completionExpectation.returnTo, 'Anchor');
  assert.equal(projected.provenance.recipientRole.path, 'business::.topics/roles/anchor.trace.md');
  assert.equal(projected.provenance.delegateRole.path, 'business::.topics/roles/axiom.trace.md');
  assert.equal(projected.delegateCapabilityAuthority.provenance.forwardSelector.roleLabel, 'Axiom');
  assert.equal(projected.delegateCapabilityAuthority.provenance.forwardSelector.sourceArtifact.path, 'core/.topics/grounding/task.trace.md');

  const process = projectGroundingProcessApplicability({ processApplicability: projected.processApplicability });
  const source = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: projected.implementationSourceAuthority } });
  const readiness = projectGroundingDelegationReadiness({
    authority: {
      delegateCapabilityAuthority: projected.delegateCapabilityAuthority,
      delegationTargetAuthority: projected.delegationTargetAuthority,
      delegationReturnReconciliationExpectation: projected.delegationReturnReconciliationExpectation
    },
    processApplicability: process,
    implementationSourceAuthority: source
  });
  assert.equal(readiness.state, 'qualified-for-delegation-authoring');
  assert.deepEqual(readiness.blockers, []);
  assert.equal(readiness.nextOperations.find((item) => item.kind === 'author-delegation-handoff')?.recipient?.label, 'Axiom');
  assert.match(projected.provenance.boundary, /endpoint identity/);

  const changedRecipient = artifactDelegationFixture({ recipient: 'Loom' });
  const changedProjected = projectGroundingDelegationArtifactAuthority(changedRecipient);
  assert.equal(changedProjected.state, 'qualified-forward-artifact-closure');
  assert.equal(changedProjected.provenance.recipientRole.path, 'business::.topics/roles/loom.trace.md');
  assert.equal(changedProjected.delegateCapabilityAuthority.delegate.label, 'Axiom');
});

test('artifact delegation closure fails closed when any required forward authority link is removed', () => {
  const base = artifactDelegationFixture();
  const cases = [
    ['recipient/source authority', { ...base, authority: { ...base.authority, role: null } }, 'exact-recipient-role-authority-not-established'],
    ['sender delegation authority', { ...base, authority: { ...base.authority, senderRole: null } }, 'exact-sender-role-authority-not-established'],
    ['controlling Task selector', { ...base, authority: { ...base.authority, handoff: { ...base.authority.handoff, transfers: [{ ...base.authority.handoff.transfers[0], controllingArtifactTarget: '' }] } } }, 'forward-controlling-transfer-not-established'],
    ['downstream delegate selector', { ...base, records: base.records.map((record) => ({ ...record, markdown: record.markdown.replace('Axiom is the explicitly selected specialist for this review.', 'Obtain an independent specialist review.') })) }, 'forward-delegate-selector-not-established'],
    ['downstream delegate material', { ...base, authority: { ...base.authority, participation: { ...base.authority.participation, packageRoleGrounding: [] } } }, 'exact-forward-selected-delegate-role-authority-not-established'],
    ['target repository authority', { ...base, sourceEvidence: { workspaces: [] } }, 'exact-target-repository-authority-not-established'],
    ['return reconciliation responsibility', { ...base, authority: { ...base.authority, handoff: { ...base.authority.handoff, retainedResponsibilities: [] } } }, 'return-reconciliation-artifact-projection-not-established']
  ];
  for (const [label, input, code] of cases) {
    const projected = projectGroundingDelegationArtifactAuthority(input);
    assert.equal(projected.state, 'not-established', label);
    assert.equal(projected.unresolved.some((item) => item.code === code), true, label);
  }

  const selectorMissing = projectGroundingDelegationArtifactAuthority(cases[3][1]);
  assert.equal(selectorMissing.delegateCapabilityAuthority, null);
  assert.equal(selectorMissing.provenance.delegateRole, null);

  const nearMatchOnly = projectGroundingDelegationArtifactAuthority({
    ...base,
    records: base.records.map((record) => ({
      ...record,
      markdown: record.markdown.replace(
        'Axiom is the explicitly selected specialist for this review.',
        'Axiom is available for this semantic review, but no downstream specialist is explicitly selected.'
      )
    }))
  });
  assert.equal(nearMatchOnly.state, 'not-established');
  assert.equal(nearMatchOnly.delegateCapabilityAuthority, null);
  assert.equal(nearMatchOnly.unresolved.some((item) => item.code === 'forward-delegate-selector-not-established'), true);

  const ambiguousSelector = projectGroundingDelegationArtifactAuthority({
    ...base,
    records: base.records.map((record) => ({
      ...record,
      markdown: record.markdown.replace(
        'Axiom is the explicitly selected specialist for this review.',
        'Axiom is the explicitly selected specialist for this review.\n\nLoom is the explicitly selected specialist for this review.'
      )
    }))
  });
  assert.equal(ambiguousSelector.state, 'not-established');
  assert.equal(ambiguousSelector.delegateCapabilityAuthority, null);
  assert.equal(ambiguousSelector.unresolved.some((item) => item.code === 'forward-delegate-selector-not-established'), true);

  const returnMissing = projectGroundingDelegationArtifactAuthority(cases[6][1]);
  const process = projectGroundingProcessApplicability({ processApplicability: returnMissing.processApplicability });
  const source = projectGroundingImplementationSourceAuthority({ authority: { implementationSourceAuthority: returnMissing.implementationSourceAuthority } });
  const readiness = projectGroundingDelegationReadiness({
    authority: {
      delegateCapabilityAuthority: returnMissing.delegateCapabilityAuthority,
      delegationTargetAuthority: returnMissing.delegationTargetAuthority,
      delegationReturnReconciliationExpectation: returnMissing.delegationReturnReconciliationExpectation
    },
    processApplicability: process,
    implementationSourceAuthority: source
  });
  assert.deepEqual(readiness.blockers.map((item) => item.code), ['delegation-return-reconciliation-expectation-not-established']);
});

function artifactDelegationFixture({ recipient = 'Anchor' } = {}) {
  const taskMarkdown = `# Specialist Task\n\n## Objective\n\nObtain one bounded semantic review.\n\nAxiom is the explicitly selected specialist for this review.\n\n## Scope\n\nCore grounding projection only.\n`;
  const role = (label, reference, sha, { mayDo, requiredInstrument, roleKind = 'specialist', inScope = 'bounded specialist work' } = {}) => ({
    state: 'qualified',
    endpoint: { label, kind: 'role' },
    material: { state: 'qualified', artifact: { reference, sha256: sha, schemaId: 'tiinex.party.role.v1', roleLabel: label, roleKind } },
    exactBoundaryLoaded: { inScope, outOfScope: 'unrelated work', context: 'qualified route only' },
    authorityBoundaryLoaded: { mayDo: mayDo || 'perform explicitly transferred bounded work', requiredInstrument: requiredInstrument || 'use qualified Task and Handoff authority', delegation: '', doesNotAuthorize: 'unrelated work', reviewBoundary: 'return to Anchor' }
  });
  return {
    authority: {
      handoff: {
        schemaId: 'tiinex.handoff.v1', workspaceId: 'core', workspaceRelativePath: '.topics/grounding/handoffs/delegate.trace.md', sha256: 'a'.repeat(64),
        from: 'Anchor', fromKind: 'role', fromReference: 'business::.topics/roles/anchor.trace.md',
        to: recipient, toKind: 'role', toReference: `business::.topics/roles/${recipient.toLowerCase()}.trace.md`,
        transfers: [{ id: 'work', transferKind: 'work-and-responsibility', controllingArtifactTarget: '../task.trace.md' }],
        retainedResponsibilities: [{ id: 'integration', retainedBy: 'Anchor', responsibility: 'reconcile returned qualified work' }],
        completionExpectation: { signalKind: 'return', signalMeaning: 'return qualified work', returnTo: 'Anchor' }
      },
      role: role(recipient, `business::.topics/roles/${recipient.toLowerCase()}.trace.md`, recipient === 'Anchor' ? 'c'.repeat(64) : 'b'.repeat(64)),
      senderRole: role('Anchor', 'business::.topics/roles/anchor.trace.md', 'c'.repeat(64), { mayDo: 'delegate bounded specialist work', requiredInstrument: 'use durable Task and Handoff transfer' }),
      participation: {
        packageRoleGrounding: [{
          label: 'Axiom', groundingOnly: true, semanticParticipant: false, materialQualification: 'qualified', pointerPath: '001-axiom-role-pointer.trace.md',
          roleArtifact: { path: 'cache:axiom', reference: 'business::.topics/roles/axiom.trace.md', sha256: 'd'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Axiom', roleKind: 'semantic reviewer' },
          exactBoundaryLoaded: { inScope: 'bounded semantic review', outOfScope: 'tooling implementation', context: 'selected review only' },
          authorityBoundaryLoaded: { mayDo: 'perform independent semantic review', requiredInstrument: 'use qualified Task and Handoff authority', delegation: '', doesNotAuthorize: 'implementation', reviewBoundary: 'return to Anchor' }
        }]
      }
    },
    records: [{
      id: 'task', path: 'core/.topics/grounding/task.trace.md', schemaId: 'tiinex.task.v1', markdown: taskMarkdown, hasContinuityContext: true, hasIntegrity: true
    }],
    topology: { currentFrontier: [{ path: 'core/.topics/grounding/task.trace.md' }] },
    sourceEvidence: { workspaces: [{ workspace: 'core', state: 'qualified', repository: 'Tiinex/core', rootPath: '.' }] }
  };
}
