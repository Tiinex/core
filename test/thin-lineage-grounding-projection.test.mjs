import test from 'node:test';
import assert from 'node:assert/strict';

import { projectGroundingParticipantContext } from '../src/tooling/portable/grounding/grounding.participantContext.js';
import { projectGroundingSourceEvidence } from '../src/tooling/portable/grounding/grounding.sourceEvidence.js';
import { projectGroundingOrchestrationReadiness } from '../src/tooling/portable/grounding/grounding.orchestrationReadiness.js';
import { projectGroundingProcessApplicability } from '../src/tooling/portable/grounding/grounding.processApplicability.js';
import { projectGroundingAuthority } from '../src/tooling/portable/grounding/grounding.readiness.authority.js';
import { projectCommonCliDefaultOutput } from '../src/tooling/portable/adapters/cli/cli.common-output.js';

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
