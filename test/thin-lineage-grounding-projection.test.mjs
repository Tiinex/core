import test from 'node:test';
import assert from 'node:assert/strict';

import { projectGroundingParticipantContext } from '../src/tooling/portable/grounding/grounding.participantContext.js';
import { projectGroundingSourceEvidence } from '../src/tooling/portable/grounding/grounding.sourceEvidence.js';
import { projectGroundingOrchestrationReadiness } from '../src/tooling/portable/grounding/grounding.orchestrationReadiness.js';
import { projectGroundingProcessApplicability } from '../src/tooling/portable/grounding/grounding.processApplicability.js';
import { projectGroundingImplementationSourceAuthority } from '../src/tooling/portable/grounding/grounding.implementationSourceAuthority.js';
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

test('authorized Role assignment still requires an explicit matching session assertion', () => {
  const result = boundedActionReadinessFixture({ holderState: 'unresolved', holderAuthorization: 'qualified' });
  assert.equal(result.readiness.state, 'grounded-to-discuss');
  assert.ok(result.readiness.reasons.some((item) => item.code === 'session-holder-role-binding-unresolved'));
  assert.equal(result.readiness.nextAction.kind, 'declare-explicit-session-holder-role-binding');
});

test('holder Role mismatch remains blocking even when Role material authorizes the assignment mode', () => {
  const result = boundedActionReadinessFixture({ holderState: 'blocked', holderAuthorization: 'qualified' });
  assert.equal(result.readiness.state, 'insufficient-grounding');
  assert.ok(result.readiness.missingEvidence.some((item) => item.code === 'session-holder-role-binding-blocked'));
});

test('holder-binding authorization accepts only exact qualified Role Holder Relationship authority', () => {
  const baseRole = {
    state: 'qualified',
    endpoint: { label: 'Loom', kind: 'role' },
    material: { state: 'qualified', artifact: { path: 'business/.topics/roles/loom.trace.md', sha256: 'a'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Loom' } }
  };
  const authorized = projectHolderBindingAuthorization({ ...baseRole, holderRelationshipLoaded: { holderState: 'assignable per explicit session or Handoff' } });
  assert.equal(authorized.state, 'qualified');
  assert.equal(authorized.assignmentMode, 'explicit-session-or-handoff');
  assert.equal(authorized.provenance.basis, 'exact-qualified-role-holder-relationship');
  assert.equal(authorized.provenance.roleArtifactPath, 'business/.topics/roles/loom.trace.md');

  const currentRoleWording = projectHolderBindingAuthorization({ ...baseRole, holderRelationshipLoaded: { holderState: 'assignable per explicit session, role invocation, or Handoff; no permanent holder asserted' } });
  assert.equal(currentRoleWording.state, 'qualified');
  const anchorRoleWording = projectHolderBindingAuthorization({ ...baseRole, holderRelationshipLoaded: { holderState: 'assignable per explicit session or Handoff; no permanent holder asserted' } });
  assert.equal(anchorRoleWording.state, 'qualified');
  assert.equal(currentRoleWording.assignmentMode, 'explicit-session-or-handoff');

  const silent = projectHolderBindingAuthorization({ ...baseRole, holderRelationshipLoaded: { holderState: '' } });
  assert.equal(silent.state, 'unresolved');
  assert.equal(silent.reasonCode, 'holder-assignment-mode-unresolved');

  const differentInstrument = projectHolderBindingAuthorization({ ...baseRole, holderRelationshipLoaded: { holderState: 'requires signed delegation instrument' } });
  assert.equal(differentInstrument.state, 'unresolved');
  assert.equal(differentInstrument.reasonCode, 'holder-assignment-mode-not-authorized');
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
