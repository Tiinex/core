import test from 'node:test';
import assert from 'node:assert/strict';

import { projectGroundingParticipantContext } from '../src/tooling/portable/grounding/grounding.participantContext.js';
import { projectGroundingParticipantArtifactAuthority } from '../src/tooling/portable/grounding/grounding.participantArtifactAuthority.js';
import { projectGroundingSourceEvidence } from '../src/tooling/portable/grounding/grounding.sourceEvidence.js';
import { projectGroundingOrchestrationReadiness } from '../src/tooling/portable/grounding/grounding.orchestrationReadiness.js';
import { projectGroundingProcessApplicability } from '../src/tooling/portable/grounding/grounding.processApplicability.js';
import { projectGroundingGuidanceAuthority } from '../src/tooling/portable/grounding/grounding.guidanceAuthority.js';
import { projectGroundingImplementationSourceAuthority } from '../src/tooling/portable/grounding/grounding.implementationSourceAuthority.js';
import { projectGroundingDelegationReadiness } from '../src/tooling/portable/grounding/grounding.delegationReadiness.js';
import { projectGroundingDelegationArtifactAuthority } from '../src/tooling/portable/grounding/grounding.delegationArtifactAuthority.js';
import { projectGroundingAuthority } from '../src/tooling/portable/grounding/grounding.readiness.authority.js';
import { projectHolderBindingAuthorization } from '../src/tooling/portable/grounding/grounding.holderBindingAuthorization.js';
import { projectCommonCliDefaultOutput } from '../src/tooling/portable/adapters/cli/cli.common-output.js';
import { commandInput } from '../src/tooling/portable/adapters/cli/cli.command-input.js';
import { composeGroundingReadiness } from '../src/tooling/portable/grounding/grounding.readiness.js';
import { normalizePortableInput } from '../src/tooling/portable/input/portable.input.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { sha256Hex } from '../src/export/package.bytes.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';


function participantTaskRecord(objective, path = 'core/.topics/grounding/participant-task.trace.md') {
  return {
    id: path,
    path,
    schemaId: 'tiinex.task.v1',
    hasContinuityContext: true,
    hasIntegrity: true,
    markdown: `# Continuity Context\n\n- Current\n  - Current Schema: tiinex.task.v1\n\n---\n\n# Participant Task\n\n## Objective\n\n${objective}\n\n## Scope\n\nFixture only.\n\n# Continuity Integrity\n\n- Towards: self\n`
  };
}

function participantRoleContext(label, requirementId = `required:${label.toLowerCase()}-role`) {
  const content = `# Continuity Context\n\n- Current\n  - Current Schema: tiinex.party.role.v1\n\n---\n\n# ${label} Role\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: fixture participant\n\n## Role Boundary\n\n- In Scope: bounded participant fixture\n- Out Of Scope: unrelated work\n\n## Authority And Responsibility Boundary\n\n- May Do: participate when explicitly required\n- Does Not Authorize: participation by carriage\n\n## Holder Relationship\n\n- Holder State: explicitly assignable\n- Assignment Modes: explicit-participation\n\n## Interpretation Limits\n\n- Does Not Prove: participation by presence\n- Must Not Be Treated As: participant authority without current-work declaration\n`;
  const sha256 = sha256Hex(new TextEncoder().encode(content));
  return {
    requirementId,
    name: `${label.toLowerCase()}-role`,
    state: 'qualified',
    contentState: 'hydrated-text',
    content,
    workspaceId: 'business',
    innerPath: `.topics/roles/${label.toLowerCase()}.trace.md`,
    referenceTarget: `business::.topics/roles/${label.toLowerCase()}.trace.md`,
    providerMode: 'cache',
    sha256,
    actualSha256: sha256
  };
}

test('artifact-derived participant authority binds closed current-work declarations to exact qualified Role material', () => {
  const task = participantTaskRecord(
    `Sigma is an explicitly required human participant in this current work because one human-visible confirmation is required. Sigma participation remains bounded to this Task.\n\nPilot is an explicitly required participant in this current work because one bounded specialist observation is required.`
  );
  const projected = projectGroundingParticipantArtifactAuthority({
    requiredContext: [participantRoleContext('Pilot'), participantRoleContext('Sigma')],
    records: [task],
    topology: { currentFrontier: [{ id: task.id, path: task.path }] }
  });
  assert.equal(projected.state, 'explicit-qualified-artifact-participants');
  assert.deepEqual(projected.participants.map((item) => item.label), ['Pilot', 'Sigma']);
  assert.equal(projected.participants.every((item) => item.basis === 'explicit-current-work-participant-declaration'), true);
  assert.equal(projected.participants.find((item) => item.label === 'Sigma')?.provenance?.declarationSourceArtifact?.path, task.path);
  assert.equal(projected.participants.find((item) => item.label === 'Sigma')?.provenance?.roleSourceArtifact?.path, 'business::.topics/roles/sigma.trace.md');
  assert.equal(projected.participants.find((item) => item.label === 'Sigma')?.roleIdentity?.state, 'qualified');
  assert.equal(projected.participants.find((item) => item.label === 'Sigma')?.holderAssignmentAuthorization?.state, 'qualified');
  assert.deepEqual(projected.participants.find((item) => item.label === 'Sigma')?.holderAssignmentAuthorization?.modes, ['explicit-participation']);
  assert.deepEqual(projected.unresolved, []);
});

test('artifact-derived participant authority fails closed for carriage-only, endpoint-only, missing material, duplicate declarations, and near-match prose', () => {
  const sigmaRole = participantRoleContext('Sigma');
  const packageGroundingOnly = {
    participation: {
      packageRoleGrounding: [{
        label: 'Sigma', groundingOnly: true, materialQualification: 'qualified', pointerPath: 'sigma-pointer.trace.md',
        roleArtifact: { reference: sigmaRole.referenceTarget, sha256: sigmaRole.sha256, schemaId: 'tiinex.party.role.v1', roleLabel: 'Sigma', roleKind: 'fixture participant' }
      }]
    }
  };
  const endpointOnly = {
    role: {
      state: 'qualified', endpoint: { label: 'Sigma', kind: 'role' }, material: { state: 'qualified', artifact: { reference: sigmaRole.referenceTarget, sha256: sigmaRole.sha256, schemaId: 'tiinex.party.role.v1', roleLabel: 'Sigma' } }
    }
  };
  const noDeclaration = participantTaskRecord('Sigma Role material is available, but no semantic participant is explicitly declared.');
  for (const input of [
    { authority: packageGroundingOnly, requiredContext: [], records: [noDeclaration] },
    { authority: endpointOnly, requiredContext: [], records: [noDeclaration] },
    { authority: null, requiredContext: [sigmaRole], records: [noDeclaration] }
  ]) {
    const projected = projectGroundingParticipantArtifactAuthority({ ...input, topology: { currentFrontier: [{ id: noDeclaration.id, path: noDeclaration.path }] } });
    assert.equal(projected.state, 'not-established');
    assert.deepEqual(projected.participants, []);
    assert.deepEqual(projected.declarations, []);
  }

  const missing = participantTaskRecord('Sigma is an explicitly required human participant in this current work because one bounded confirmation is required.');
  const missingProjected = projectGroundingParticipantArtifactAuthority({ records: [missing], topology: { currentFrontier: [{ id: missing.id, path: missing.path }] } });
  assert.deepEqual(missingProjected.participants, []);
  assert.equal(missingProjected.unresolved[0].code, 'explicit-participant-role-material-not-established');

  const duplicate = participantTaskRecord('Sigma is an explicitly required human participant in this current work because one confirmation is required.\n\nSigma is an explicitly required human participant in this current work because another confirmation is required.');
  const duplicateProjected = projectGroundingParticipantArtifactAuthority({ requiredContext: [sigmaRole], records: [duplicate], topology: { currentFrontier: [{ id: duplicate.id, path: duplicate.path }] } });
  assert.deepEqual(duplicateProjected.participants, []);
  assert.equal(duplicateProjected.unresolved[0].code, 'explicit-participant-declaration-ambiguous');

  const nearMatch = participantTaskRecord('Sigma is a required human participant in this current work because one confirmation is required.');
  const nearMatchProjected = projectGroundingParticipantArtifactAuthority({ requiredContext: [sigmaRole], records: [nearMatch], topology: { currentFrontier: [{ id: nearMatch.id, path: nearMatch.path }] } });
  assert.deepEqual(nearMatchProjected.declarations, []);
  assert.deepEqual(nearMatchProjected.participants, []);

  const mismatched = projectGroundingParticipantArtifactAuthority({ requiredContext: [participantRoleContext('Pilot')], records: [missing], topology: { currentFrontier: [{ id: missing.id, path: missing.path }] } });
  assert.deepEqual(mismatched.participants, []);
  assert.equal(mismatched.unresolved[0].code, 'explicit-participant-role-material-not-established');
});

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
  assert.equal(projected.semanticParticipants[0].participantAuthority.state, 'qualified');
  assert.equal(projected.semanticParticipants[0].roleIdentity.state, 'not-established');
  assert.equal(projected.semanticParticipants[0].holderAssignmentAuthorization.state, 'not-established');
  assert.equal(projected.semanticParticipants[0].holderBinding.state, 'not-established');
  assert.equal(projected.roleGrounding[0].semanticParticipant, false);
  assert.equal(projected.speakerStateBoundary.state, 'external-host-local-non-authoritative');
  assert.equal(projected.speakerStateBoundary.transported, false);
  assert.deepEqual(projected.unresolved, []);
});

test('qualified participant Role assignment authorization and current session holder binding remain independent claims', () => {
  const task = participantTaskRecord('Sigma is an explicitly required human participant in this current work because one bounded operator observation is required.');
  const artifact = projectGroundingParticipantArtifactAuthority({
    requiredContext: [participantRoleContext('Sigma')],
    records: [task],
    topology: { currentFrontier: [{ id: task.id, path: task.path }] }
  });
  const sigma = artifact.participants[0];
  assert.equal(sigma.roleIdentity.state, 'qualified');
  assert.equal(sigma.holderAssignmentAuthorization.state, 'qualified');
  assert.deepEqual(sigma.holderAssignmentAuthorization.modes, ['explicit-participation']);

  const withoutOccurrence = projectGroundingParticipantContext({ participation: { participants: [sigma] } });
  assert.equal(withoutOccurrence.semanticParticipants[0].participantAuthority.state, 'qualified');
  assert.equal(withoutOccurrence.semanticParticipants[0].roleIdentity.state, 'qualified');
  assert.equal(withoutOccurrence.semanticParticipants[0].holderAssignmentAuthorization.state, 'qualified');
  assert.equal(withoutOccurrence.semanticParticipants[0].holderBinding.state, 'not-established');

  const withOccurrence = projectGroundingParticipantContext({
    participation: { participants: [sigma] },
    holderBinding: {
      state: 'qualified', roleLabel: 'Sigma', holderId: 'session-human', assertionMode: 'explicit-participation', source: 'explicit-input',
      authorization: { state: 'qualified', assignmentMode: 'explicit-participation', provenance: { roleArtifactSha256: sigma.roleIdentity.sourceArtifact.sha256 } },
      sourceDetail: { kind: 'operator-session-input', locator: 'fixture.session', semanticAuthorityState: 'qualified-bounded-session-assignment', roleArtifactSha256: sigma.roleIdentity.sourceArtifact.sha256 },
      durableIdentity: { state: 'not-established' },
      boundary: 'fixture bounded consuming-session holder binding'
    }
  });
  assert.equal(withOccurrence.semanticParticipants[0].holderBinding.state, 'qualified');
  assert.equal(withOccurrence.semanticParticipants[0].holderBinding.bindingPresent, true);
  assert.equal(withOccurrence.semanticParticipants[0].holderBinding.assignmentMode, 'explicit-participation');
  assert.equal(withOccurrence.semanticParticipants[0].holderBinding.durableIdentityState, 'not-established');
});

test('qualified Role holder binding without participant authority does not create a semantic participant', () => {
  const projected = projectGroundingParticipantContext({
    participation: {
      participants: [],
      packageRoleGrounding: [{
        label: 'Sigma', pointerPath: 'sigma-role-pointer.trace.md', groundingOnly: true, materialQualification: 'qualified',
        roleArtifact: { path: 'business::.topics/roles/sigma.trace.md', sha256: 'a'.repeat(64), schemaId: 'tiinex.party.role.v1', roleLabel: 'Sigma' },
        holderRelationshipLoaded: { assignmentModes: 'explicit-participation', holderState: 'assignable' }
      }]
    },
    holderBinding: { state: 'qualified', roleLabel: 'Sigma', assertionMode: 'explicit-participation' }
  });
  assert.equal(projected.participantMapState, 'not-established');
  assert.equal(projected.semanticParticipants.length, 0);
  assert.equal(projected.roleGrounding[0].semanticParticipant, false);
  assert.equal(projected.roleGrounding[0].holderAssignmentAuthorization.state, 'available-role-material');
  assert.equal(projected.unresolved[0].code, 'participant-map-not-established');
});

test('speaker labels and contribution speaker state remain outside semantic participant authority', () => {
  const projected = projectGroundingParticipantContext({
    speakerLabel: 'Sigma',
    activeSpeaker: 'Sigma',
    participation: {
      participants: [],
      currentContribution: { state: 'declared-unverified', speakerLabel: 'Sigma', attribution: 'declared' }
    }
  });
  assert.equal(projected.participantMapState, 'not-established');
  assert.deepEqual(projected.semanticParticipants, []);
  assert.equal(projected.speakerStateBoundary.state, 'external-host-local-non-authoritative');
  assert.equal(projected.speakerStateBoundary.consumedAsSemanticAuthority, false);
  assert.match(projected.boundary, /Active speaker value remains host-local non-authoritative state outside semantic grounding/);
});

test('multiple bounded semantic participants preserve deterministic declaration authority without order-derived holder state', () => {
  const task = participantTaskRecord('Sigma is an explicitly required human participant in this current work because one human observation is required.\n\nPilot is an explicitly required participant in this current work because one specialist observation is required.');
  const artifact = projectGroundingParticipantArtifactAuthority({
    requiredContext: [participantRoleContext('Sigma'), participantRoleContext('Pilot')],
    records: [task],
    topology: { currentFrontier: [{ id: task.id, path: task.path }] }
  });
  assert.deepEqual(artifact.participants.map((item) => item.label), ['Pilot', 'Sigma']);
  const projected = projectGroundingParticipantContext({ participation: { participants: artifact.participants } });
  assert.deepEqual(projected.semanticParticipants.map((item) => item.label), ['Pilot', 'Sigma']);
  assert.equal(projected.semanticParticipants.every((item) => item.participantAuthority.state === 'qualified'), true);
  assert.equal(projected.semanticParticipants.every((item) => item.roleIdentity.state === 'qualified'), true);
  assert.equal(projected.semanticParticipants.every((item) => item.holderBinding.state === 'not-established'), true);
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
  assert.deepEqual(projection.widerOrchestration.blockers.map((item) => item.code), ['participant-capability-map-not-established', 'source-authority-scope-bounded']);
  assert.equal(projection.guidanceAuthority.state, 'not-declared');
  assert.match(projection.boundary, /not a new lifecycle state/);
});

test('orchestration blocks only when forward-selected guidance authority exists but is incomplete', () => {
  const projection = projectGroundingOrchestrationReadiness({
    readinessState: 'grounded-to-act',
    participantContext: { participantMapState: 'explicit-bounded-map' },
    sourceEvidence: { workspaces: [{ workspace: 'business', state: 'qualified', repository: 'Tiinex/business' }, { workspace: 'core', state: 'qualified', repository: 'Tiinex/core' }], blockers: [] },
    guidanceAuthority: { state: 'selected-guidance-authority-incomplete', selectedRelationCount: 1, unresolved: [{ code: 'selected-guidance-relation-parent-authority-not-qualified' }] },
    topology: { currentFrontier: [{ id: 'task-1' }] }
  });
  assert.equal(projection.state, 'bounded-route-only');
  assert.deepEqual(projection.widerOrchestration.blockers.map((item) => item.code), ['selected-guidance-authority-incomplete']);
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

test('guidance authority projects only forward-selected Relation/Decision/material authority and keeps state dimensions separate', () => {
  const taskPath='business/.topics/initiatives/current-task.trace.md';
  const decisionPath='business/.topics/processes/operating-contract-adoption.trace.md';
  const processPath='business/.topics/processes/grounding-process.trace.md';
  const relationPath='business/.topics/processes/operating-contract-applicability.trace.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const process={ id:processPath,path:processPath,schemaId:'tiinex.topic.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.topic.v1\n\n---\n\n# Grounding Process\n\n## Applicability\n\nUse after an exact fresh-recipient trigger is established by current authority.\n\n## Preferred Cold-Start Sequence\n\n1. Enter through the exact Start contract.\n2. Ground the selected route.\n\n## Re-Grounding Triggers\n\n- new carrier\n\n# Continuity Integrity\n\n- Towards: self\n` };
  const decision={ id:decisionPath,path:decisionPath,schemaId:'tiinex.decision.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.decision.v1\n\n---\n\n# Grounding Operating Contract Adoption\n\n## Decision\n\n- State: accepted\n- Decision: adopt [Grounding Process](grounding-process.trace.md) for the bounded domain declared here.\n\n# Continuity Integrity\n\n- Towards: self\n` };
  const relation={ id:relationPath,path:relationPath,schemaId:'tiinex.relation.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.decision.v1\n  - Trace: [Grounding Operating Contract Adoption](operating-contract-adoption.trace.md)\n- Current\n  - Current Schema: tiinex.relation.v1\n\n---\n\n# Grounding Applicability Relation\n\n## Relation Declaration\n\n- Relation Type: operational guidance applies to\n- Relation Direction: current adoption -> target context\n- Relation Scope: recipient grounding for this bounded replay\n- Confidence: explicit\n\n## Relation Target\n\n- Target: [Current Task](../initiatives/current-task.trace.md)\n\n# Continuity Integrity\n\n- Towards: self\n` };
  const selected=[
    { requirementId:'required:grounding-applicability-relation',name:'grounding-applicability-relation',purpose:'forward-selected applicability authority',state:'qualified',workspaceId:'business',innerPath:'.topics/processes/operating-contract-applicability.trace.md' },
    { requirementId:'required:grounding-process',name:'grounding-process',material:'Grounding Process',purpose:'exact selected procedure material',state:'qualified',workspaceId:'business',innerPath:'.topics/processes/grounding-process.trace.md' }
  ];
  const projected=projectGroundingGuidanceAuthority({ requiredContext:selected, records:[task,decision,relation,process], topology:{currentFrontier:[{id:taskPath,path:taskPath}]} });
  assert.equal(projected.state,'qualified-forward-selected-guidance-authority');
  assert.equal(projected.selectedRelationCount,1);
  assert.equal(projected.selectedMaterialCount,1);
  const relationItem=projected.items.find((item)=>item.relation);
  assert.equal(relationItem.relation.relationType,'operational guidance applies to');
  assert.equal(relationItem.relation.resolvedTarget,taskPath);
  assert.equal(relationItem.authorityArtifact.path,decisionPath);
  assert.equal(relationItem.linkedSelectedAuthority[0].path,processPath);
  assert.equal(projected.items.length,1);
  assert.equal(relationItem.dimensions.availability.state,'qualified');
  assert.equal(relationItem.dimensions.applicability.state,'qualified-relation-binding');
  assert.equal(relationItem.dimensions.requiredness.state,'unresolved-not-declared');
  assert.equal(relationItem.dimensions.activeExecution.state,'unresolved-not-declared');
  assert.equal(relationItem.dimensions.ownership.state,'unresolved-not-declared');
  assert.equal(relationItem.dimensions.completion.state,'unresolved-not-declared');
  assert.equal(relationItem.stepSelection.state,'recipient-interpretation-required');
  assert.ok(relationItem.stepSelection.candidateSections.some((item)=>item.heading==='Preferred Cold-Start Sequence'));
  assert.match(relationItem.stepSelection.boundary,/does not evaluate/);
});

test('standalone multi-target Relation binds exact selected guidance set to current work without Parent authority', () => {
  const taskPath='core/.topics/work/current-task.trace.md';
  const relationPath='core/.topics/work/guidance-applicability.trace.md';
  const portablePath='native/.topics/processes/session-grounding.trace.md';
  const profilePath='business/.topics/processes/session-profile.trace.md';
  const hostPath='interop-openai/.topics/processes/chatgpt.trace.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const guidance=(path,title)=>({id:path,path,schemaId:'tiinex.topic.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.topic.v1\n\n---\n\n# ${title}\n\n## Purpose\n\nGround the bounded session.\n\n# Continuity Integrity\n`});
  const portable=guidance(portablePath,'Portable Session Process');
  const profile=guidance(profilePath,'Tiinex Session Profile');
  const host=guidance(hostPath,'ChatGPT Host Process');
  const relation={id:relationPath,path:relationPath,schemaId:'tiinex.relation.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.relation.v1\n\n---\n\n# Guidance Applicability\n\n## Relation Declaration\n\n- Relation Type: session grounding applicability bundle\n- Relation Direction: selected guidance set -> bounded current work\n- Relation Scope: acceptance replay\n\n## Relation Target\n\n- Target: [Current Task](current-task.trace.md)\n  - Relation Type: applicability target\n  - Relation Direction: guidance -> task\n  - Relation Scope: current work\n- Target: [Portable](native::.topics/processes/session-grounding.trace.md)\n  - Relation Type: portable guidance member\n  - Relation Direction: bundle -> guidance\n  - Relation Scope: portable\n- Target: [Profile](business::.topics/processes/session-profile.trace.md)\n  - Relation Type: organization guidance member\n  - Relation Direction: bundle -> guidance\n  - Relation Scope: organization\n- Target: [Host](interop-openai::.topics/processes/chatgpt.trace.md)\n  - Relation Type: host guidance member\n  - Relation Direction: bundle -> guidance\n  - Relation Scope: host\n\n## Relation Boundary\n\n- This is not Parent ancestry.\n\n# Continuity Integrity\n`};
  const selected=[
    {requirementId:'required:relation',name:'grounding-guidance-applicability',material:'guidance applicability Relation',purpose:'explicit applicability authority',state:'qualified',workspaceId:'core',innerPath:'.topics/work/guidance-applicability.trace.md'},
    {requirementId:'required:portable',name:'portable-session-grounding-process',material:'Portable Session Process',purpose:'portable process guidance',state:'qualified',workspaceId:'native',innerPath:'.topics/processes/session-grounding.trace.md'},
    {requirementId:'required:profile',name:'tiinex-session-grounding-profile',material:'Tiinex Session Profile',purpose:'Tiinex process guidance',state:'qualified',workspaceId:'business',innerPath:'.topics/processes/session-profile.trace.md'},
    {requirementId:'required:host',name:'chatgpt-host-adaptation',material:'ChatGPT Host Process',purpose:'host process adaptation',state:'qualified',workspaceId:'interop-openai',innerPath:'.topics/processes/chatgpt.trace.md'}
  ];
  const projected=projectGroundingGuidanceAuthority({requiredContext:selected,records:[task,relation,portable,profile,host],topology:{currentFrontier:[{id:taskPath,path:taskPath}]}});
  assert.equal(projected.state,'qualified-forward-selected-guidance-authority');
  const item=projected.items.find((entry)=>entry.relation);
  assert.equal(item.dimensions.applicability.state,'qualified-relation-binding');
  assert.equal(item.relation.resolvedTarget,taskPath);
  assert.deepEqual(item.linkedSelectedAuthority.map((entry)=>entry.path),[portablePath,profilePath,hostPath]);
  assert.equal(item.authorityArtifact.path,relationPath);
  assert.equal(item.unresolved.length,0);
});

test('forward-selected guidance authority resolves exact GitHub permalink to selected cache-backed record without workspace pseudo-reference', () => {
  const taskPath='coldstart/.topics/tasks/001-task.trace.md';
  const decisionPath='coldstart/.topics/decisions/001-guidance-selection.trace.md';
  const relationPath='coldstart/.topics/relations/001-guidance-applicability.trace.md';
  const processPath='business/.topics/processes/gpt/grounding/002-2-1-1-grounding-major-001-operating-reliability-contract.trace.md';
  const processRef='https://github.com/Tiinex/business/blob/a66906eef7f0033eb12893f92910336f82d01afa/.topics/processes/gpt/grounding/002-2-1-1-grounding-major-001-operating-reliability-contract.trace.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const process={ id:processPath,path:processPath,schemaId:'tiinex.decision.v1',hasContinuityContext:true,hasIntegrity:true,source:{adapterId:'github',identity:'Tiinex/business',version:'a66906eef7f0033eb12893f92910336f82d01afa',path:'.topics/processes/gpt/grounding/002-2-1-1-grounding-major-001-operating-reliability-contract.trace.md',permalink:processRef},markdown:'# Continuity Context\n\n- Current\n  - Current Schema: tiinex.decision.v1\n\n---\n\n# Grounding Operating Contract\n\n## Preferred Cold-Start Sequence\n\n1. Ground.\n\n# Continuity Integrity\n' };
  const decision={ id:decisionPath,path:decisionPath,schemaId:'tiinex.decision.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.decision.v1\n\n---\n\n# Guidance Selection\n\n## Decision\n\n- State: accepted\n- Decision: use [Grounding Operating Contract](${processRef}) for this bounded task.\n\n# Continuity Integrity\n` };
  const relation={ id:relationPath,path:relationPath,schemaId:'tiinex.relation.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.decision.v1\n  - Trace: [Guidance Selection](../decisions/001-guidance-selection.trace.md)\n- Current\n  - Current Schema: tiinex.relation.v1\n\n---\n\n# Guidance Applicability\n\n## Relation Declaration\n\n- Relation Type: operational guidance applies to\n- Relation Direction: selected decision -> current task\n- Relation Scope: bounded recipient task\n\n## Relation Target\n\n- Target: [Current Task](../tasks/001-task.trace.md)\n\n## Relation Boundary\n\n- This relation is not Parent ancestry.\n\n# Continuity Integrity\n` };
  const selected=[
    { requirementId:'required:guidance-binding',name:'guidance-binding',purpose:'exact selected applicability relation',state:'qualified',workspaceId:'coldstart',innerPath:'.topics/relations/001-guidance-applicability.trace.md' },
    { requirementId:'required:guidance-selection',name:'guidance-selection',purpose:'exact selected decision authority',state:'qualified',workspaceId:'coldstart',innerPath:'.topics/decisions/001-guidance-selection.trace.md' },
    { requirementId:'required:operating-process',name:'operating-process',material:'operating process',purpose:'exact selected process material',state:'qualified',workspaceId:'business',innerPath:'.topics/processes/gpt/grounding/002-2-1-1-grounding-major-001-operating-reliability-contract.trace.md' }
  ];
  const projected=projectGroundingGuidanceAuthority({ requiredContext:selected, records:[task,decision,relation,process], topology:{currentFrontier:[{id:taskPath,path:taskPath}]} });
  assert.equal(projected.state,'qualified-forward-selected-guidance-authority');
  const relationItem=projected.items.find((item)=>item.relation);
  assert.equal(relationItem.dimensions.applicability.state,'qualified-relation-binding');
  assert.equal(relationItem.linkedSelectedAuthority.length,1);
  assert.equal(relationItem.linkedSelectedAuthority[0].path,processPath);
  assert.equal(relationItem.linkedSelectedAuthority[0].selectionBasis,'exact-parent-authority-forward-link-plus-selected-required-context');
  assert.ok(relationItem.stepSelection.candidateSections.some((item)=>item.heading==='Preferred Cold-Start Sequence'));
});

test('forward-selected guidance authority hydrates exact cache Required Context bodies into runtime records without serializing new package artifacts', () => {
  const taskPath='minimal-coldstart/.topics/tasks/001-task.trace.md';
  const decisionPath='minimal-coldstart/.topics/decisions/001-guidance-selection.trace.md';
  const relationPath='minimal-coldstart/.topics/relations/001-guidance-applicability.trace.md';
  const processRef='https://github.com/Tiinex/business/blob/a66906eef7f0033eb12893f92910336f82d01afa/.topics/processes/gpt/grounding/002-2-1-1-grounding-major-001-operating-reliability-contract.trace.md';
  const policyRef='https://github.com/Tiinex/docs/blob/3e37b0c3498b840ffc69572492636046baff0911/LINEAGE_POLICY.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const decision={ id:decisionPath,path:decisionPath,schemaId:'tiinex.decision.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.decision.v1\n\n---\n\n# Guidance Selection\n\n## Decision\n\n- State: accepted\n- Decision: use [Operating Contract](${processRef}) and [Lineage Policy](${policyRef}).\n\n# Continuity Integrity\n` };
  const relation={ id:relationPath,path:relationPath,schemaId:'tiinex.relation.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.decision.v1\n  - Trace: [Guidance Selection](../decisions/001-guidance-selection.trace.md)\n- Current\n  - Current Schema: tiinex.relation.v1\n\n---\n\n# Guidance Applicability\n\n## Relation Declaration\n\n- Relation Type: operational guidance applies to\n- Relation Direction: selected decision -> current task\n- Relation Scope: bounded task\n\n## Relation Target\n\n- Target: [Current Task](../tasks/001-task.trace.md)\n\n## Relation Boundary\n\n- Not Parent.\n\n# Continuity Integrity\n` };
  const selected=[
    { requirementId:'required:binding',name:'guidance-binding',purpose:'exact applicability relation',state:'qualified',workspaceId:'minimal-coldstart',innerPath:'.topics/relations/001-guidance-applicability.trace.md',contentProjected:true,content:relation.markdown },
    { requirementId:'required:selection',name:'guidance-selection',purpose:'selection authority',state:'qualified',workspaceId:'minimal-coldstart',innerPath:'.topics/decisions/001-guidance-selection.trace.md',contentProjected:true,content:decision.markdown },
    { requirementId:'required:process',name:'operating-process',material:'operating process',purpose:'selected process',state:'qualified',workspaceId:'',innerPath:'github/Tiinex/business/a66906eef7f0033eb12893f92910336f82d01afa/.topics/processes/gpt/grounding/002-2-1-1-grounding-major-001-operating-reliability-contract.trace.md',referenceTarget:processRef,contentProjected:true,content:'# Continuity Context\n\n- Current\n  - Current Schema: tiinex.decision.v1\n\n---\n\n# Operating Contract\n\n## Preferred Cold-Start Sequence\n\n1. Ground.\n\n# Continuity Integrity\n' },
    { requirementId:'required:policy',name:'lineage-policy',material:'lineage policy',purpose:'selected policy',state:'qualified',workspaceId:'',innerPath:'github/Tiinex/docs/3e37b0c3498b840ffc69572492636046baff0911/LINEAGE_POLICY.md',referenceTarget:policyRef,contentProjected:true,content:'# Tiinex Lineage Policy\n\n## Interpretation Rules\n\nPreserve provenance and limits.\n' }
  ];
  const projected=projectGroundingGuidanceAuthority({ requiredContext:selected, records:[task,decision,relation], topology:{currentFrontier:[{id:taskPath,path:taskPath}]} });
  assert.equal(projected.state,'qualified-forward-selected-guidance-authority');
  assert.equal(projected.selectedRelationCount,1);
  assert.equal(projected.selectedMaterialCount,2);
  const relationItem=projected.items.find((item)=>item.relation);
  assert.deepEqual(relationItem.linkedSelectedAuthority.map((item)=>item.title).sort(),['Operating Contract','Tiinex Lineage Policy']);
  assert.equal(projected.items.length,1);
  assert.ok(relationItem.stepSelection.candidateSections.some((item)=>item.heading==='Preferred Cold-Start Sequence'));
  assert.ok(relationItem.stepSelection.candidateSections.some((item)=>item.heading==='Interpretation Rules'));
});

test('selected process or policy material stays readable while applicability remains unresolved without a binding', () => {
  const taskPath='business/.topics/initiatives/current-task.trace.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const process={ id:'business/.topics/processes/process.trace.md',path:'business/.topics/processes/process.trace.md',schemaId:'tiinex.topic.v1',hasContinuityContext:true,hasIntegrity:true,markdown:'# Continuity Context\n\n- Current\n  - Current Schema: tiinex.topic.v1\n\n---\n\n# Review Process\n\n## Applicability\n\nUse only when selected by current authority.\n\n## Steps\n\n1. Review.\n\n# Continuity Integrity\n' };
  const policy={ id:'docs/LINEAGE_POLICY.md',path:'docs/LINEAGE_POLICY.md',schemaId:'',hasContinuityContext:true,hasIntegrity:true,markdown:'# Lineage Policy\n\n## Interpretation Rules\n\nCarrier lineage is not semantic Parent.\n' };
  const selected=[
    { requirementId:'required:process',name:'review-process',material:'review process',purpose:'material selected for recipient review',state:'qualified',workspaceId:'business',innerPath:'.topics/processes/process.trace.md' },
    { requirementId:'required:policy',name:'lineage-policy',material:'lineage policy',purpose:'policy material selected for recipient interpretation',state:'qualified',workspaceId:'docs',innerPath:'LINEAGE_POLICY.md' }
  ];
  const projected=projectGroundingGuidanceAuthority({ requiredContext:selected, records:[task,process,policy], topology:{currentFrontier:[{id:taskPath,path:taskPath}]} });
  assert.equal(projected.state,'selected-guidance-material-applicability-unresolved');
  assert.equal(projected.selectedRelationCount,0);
  assert.equal(projected.selectedMaterialCount,2);
  assert.equal(projected.items.every((item)=>item.dimensions.availability.state==='qualified'),true);
  assert.equal(projected.items.every((item)=>item.dimensions.applicability.state==='unresolved-not-declared'),true);
  assert.equal(projected.items.every((item)=>item.dimensions.requiredness.state==='unresolved-not-declared'),true);
  assert.ok(projected.items.find((item)=>item.authorityArtifact.path.endsWith('process.trace.md')).stepSelection.candidateSections.some((item)=>item.heading==='Steps'));
});

test('guidance authority does not reverse-scan relation inventory or infer applicability from unrelated carried material', () => {
  const taskPath='business/.topics/initiatives/current-task.trace.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const decision={ id:'business/.topics/processes/process.trace.md',path:'business/.topics/processes/process.trace.md',schemaId:'tiinex.decision.v1',hasContinuityContext:true,hasIntegrity:true,markdown:'# Continuity Context\n\n- Current\n  - Current Schema: tiinex.decision.v1\n\n---\n\n# Process\n\n## Decision\n\n- State: accepted\n\n# Continuity Integrity\n' };
  const relation={ id:'business/.topics/processes/relation.trace.md',path:'business/.topics/processes/relation.trace.md',schemaId:'tiinex.relation.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.decision.v1\n  - Trace: [Process](process.trace.md)\n- Current\n  - Current Schema: tiinex.relation.v1\n\n---\n\n# Relation\n\n## Relation Declaration\n\n- Relation Type: operational guidance applies to\n- Relation Direction: current adoption -> target context\n- Relation Scope: fixture\n\n## Relation Target\n\n- Target: [Current Task](../initiatives/current-task.trace.md)\n` };
  const unrelated=[{ requirementId:'required:notes',name:'notes',purpose:'ordinary context',state:'qualified',workspaceId:'business',innerPath:'.topics/notes.trace.md' }];
  const notes={id:'business/.topics/notes.trace.md',path:'business/.topics/notes.trace.md',schemaId:'tiinex.topic.v1',hasContinuityContext:true,hasIntegrity:true,markdown:'# Notes'};
  const projected=projectGroundingGuidanceAuthority({ requiredContext:unrelated, records:[task,decision,relation,notes], topology:{currentFrontier:[{id:taskPath,path:taskPath}]} });
  assert.equal(projected.state,'not-declared');
  assert.equal(projected.selectedRelationCount,0);
  assert.equal(projected.selectedMaterialCount,0);
  assert.deepEqual(projected.items,[]);
});

test('selected guidance relation fails closed when its exact parent authority is not qualified', () => {
  const taskPath='business/.topics/initiatives/current-task.trace.md';
  const task=participantTaskRecord('Independent bounded work.',taskPath);
  const relation={ id:'business/.topics/processes/relation.trace.md',path:'business/.topics/processes/relation.trace.md',schemaId:'tiinex.relation.v1',hasContinuityContext:true,hasIntegrity:true,markdown:`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.decision.v1\n  - Trace: [Missing](missing.trace.md)\n- Current\n  - Current Schema: tiinex.relation.v1\n\n---\n\n# Relation\n\n## Relation Declaration\n\n- Relation Type: operational guidance applies to\n- Relation Direction: current adoption -> target context\n- Relation Scope: fixture\n\n## Relation Target\n\n- Target: [Current Task](../initiatives/current-task.trace.md)\n` };
  const selected=[{ requirementId:'required:relation',name:'relation',purpose:'selected relation',state:'qualified',workspaceId:'business',innerPath:'.topics/processes/relation.trace.md' }];
  const projected=projectGroundingGuidanceAuthority({ requiredContext:selected, records:[task,relation], topology:{currentFrontier:[{id:taskPath,path:taskPath}]} });
  assert.equal(projected.state,'selected-guidance-authority-incomplete');
  assert.equal(projected.items[0].dimensions.applicability.state,'unresolved');
  assert.equal(projected.unresolved[0].code,'selected-guidance-relation-parent-authority-not-qualified');
});

test('process applicability stays unresolved without upstream-qualified explicit semantic authority', () => {
  const absent = projectGroundingProcessApplicability({
    participation: { packageRoleGrounding: [{ label: 'Process Owner' }] },
    processInventory: [{ id: 'process-from-inventory' }]
  });
  assert.equal(absent.state, 'not-established');
  assert.deepEqual(absent.facts, []);
  assert.equal(absent.unresolved[0].code, 'process-applicability-semantic-authority-not-established');
  assert.match(absent.unresolved[0].detail, /do not infer applicability from carried Roles/i);

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

test('process applicability accepts exact qualified forward-selected guidance Relation binding without inferring from carriage', () => {
  const projected = projectGroundingProcessApplicability({}, {
    state: 'qualified-forward-selected-guidance-authority',
    selectedRelationCount: 1,
    items: [{
      relation: { sourceArtifact: { workspaceId: 'core', path: 'core/.topics/work/applicability-relation.trace.md', sha256: 'a'.repeat(64), schemaId: 'tiinex.relation.v1' }, resolvedTarget: 'core/.topics/work/current-task.trace.md' },
      authorityArtifact: { workspaceId: 'core', path: 'core/.topics/work/acceptance-handoff.trace.md', sha256: 'b'.repeat(64), schemaId: 'tiinex.handoff.v1' },
      linkedSelectedAuthority: [
        { workspaceId: 'native', path: 'native/.topics/processes/session-grounding.trace.md', sha256: 'c'.repeat(64), schemaId: 'tiinex.topic.v1' },
        { workspaceId: 'interop-openai', path: 'interop-openai/.topics/processes/chatgpt.trace.md', sha256: 'd'.repeat(64), schemaId: 'tiinex.topic.v1' }
      ],
      dimensions: { applicability: { state: 'qualified-relation-binding', target: 'core/.topics/work/current-task.trace.md' } }
    }]
  });
  assert.equal(projected.state, 'explicit-qualified-authority');
  assert.equal(projected.facts.length, 1);
  assert.equal(projected.facts[0].applicability, 'qualified-relation-binding');
  assert.deepEqual(projected.facts[0].selectedGuidance.map((item) => item.workspaceId), ['native', 'interop-openai']);
  assert.equal(projected.provenance.source, 'core/.topics/work/applicability-relation.trace.md');
  assert.match(projected.provenance.boundary, /does not interpret Relation Type prose/);
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

test('authority projection stays qualified when only non-authority cold-start diagnostics are degraded', () => {
  const projected = projectGroundingAuthority({
    status: 'degraded',
    selectedRoute: { id: 'handoff-route:business:x', pointerPath: '001-pointer.trace.md', workspaceId: 'business', workspaceRelativeHandoffPath: '.topics/handoffs/x.trace.md' },
    handoff: { purpose: 'bounded work', from: 'Anchor', to: 'Anchor', transfers: [] },
    role: { state: 'qualified', endpoint: { label: 'Anchor', kind: 'role' } },
    holderBinding: {
      state: 'qualified', roleLabel: 'Anchor', recipientRoleLabel: 'Anchor', recipientCompatibility: 'matched', source: 'qualified-selected-handoff-consumption', explicit: false, inferredFromTransport: false,
      authorization: { state: 'qualified', reasonCode: 'holder-assignment-mode-authorized' }
    },
    mutationBoundary: { sourceMutation: false, remoteWrite: false }
  }, 'routed-handoff-package');
  assert.equal(projected.state, 'qualified');
  assert.equal(projected.groundingStatus, 'degraded');
});

test('common ground projection separates epistemic basis, semantic participants, and recipient body-reading from internal capsule detail', () => {
  const output = projectCommonCliDefaultOutput({
    schema: 'result', operation: 'project-grounding-readiness', resultSchema: 'grounding', status: 'ready',
    readiness: { state: 'grounded-to-act', reasons: [], missingEvidence: [], nextAction: { kind: 'continue-bounded-handoff-work', target: 'core/.topics/tasks/current.trace.md', basis: 'qualified bounded route' } },
    authority: { state: 'qualified', groundingStatus: 'degraded', route: { id: 'r', workspaceId: 'core' }, handoff: { purpose: 'p', from: 'Anchor', to: 'Anchor', completionExpectation: { signalKind: 'return', signalMeaning: 'return bounded result', returnTo: 'Sigma' }, transfers: [] }, role: {}, holderBinding: {}, operationBoundary: { remoteWrite: false, boundary: 'bounded local work only' } },
    orchestrationReadiness: { state: 'bounded-route-only', boundedActionReadiness: 'grounded-to-act', widerOrchestration: { state: 'not-established', blockers: [{ code: 'capability-map-not-established', detail: 'missing' }] }, participantMap: 'explicit-bounded-map', sourceScope: 'bounded-current-route', processApplicability: { state: 'explicit-qualified-authority', unresolved: [] }, boundary: 'diagnostic only' },
    evidence: {
      known: [{ code: 'qualified-handoff-route', state: 'qualified', detail: 'exact route' }],
      inferred: [{ code: 'relevant-lineage-scope', state: 'bounded-inference', detail: 'bounded lineage' }],
      unresolved: [], humanOnly: []
    },
    coverage: { requiredContext: { declared: 1, matchedInWorkspaceSnapshots: 1, missingFromWorkspaceSnapshots: 0, items: [{ requirementId: 'required:docs', name: 'docs-workspace', material: 'current Docs Workspace', purpose: 'read-only semantic boundary', declaredAvailability: 'available', state: 'qualified', workspaceId: 'docs', innerPath: '.topics/.workspaces/tiinex-docs.workspace.md', provenance: { basis: 'selected-handoff-required-context-declaration' } }], itemsOmitted: 0, bodiesProjected: 0, bodiesAvailable: 1 } },
    capsule: {
      participantContext: {
        state: 'qualified', participantMapState: 'explicit-bounded-map',
        semanticParticipants: [{ id: 'sigma', label: 'Sigma', roles: ['Sigma'], roleIdentity: { state: 'qualified', label: 'Sigma' }, holderBinding: { state: 'not-required' }, holderAssignmentAuthorization: { state: 'not-required' }, basis: 'explicit-task-participant' }],
        roleGrounding: [{ label: 'Anchor', pointerPath: '001-anchor-from-role-pointer.trace.md' }],
        endpoints: [{ direction: 'from', label: 'Anchor', kind: 'role' }, { direction: 'to', label: 'Anchor', kind: 'role' }], unresolved: [], boundary: 'semantic participants remain distinct from package Role grounding'
      },
      sourceEvidence: { carrier: { state: 'qualified', workspaceCount: 3, completeWorkspaceCount: 3, boundedWorkspaceCount: 0 }, workspaces: [{ workspace: 'business', state: 'qualified', coverage: 'complete', repository: 'Tiinex/business', ref: 'abc' }], boundedOrCache: [], blockers: [], boundary: 'exact carried source' },
      guidanceAuthority: { state: 'selected-guidance-authority-qualified', selectedMaterialCount: 2, items: [{ dimensions: { applicability: { state: 'qualified-relation-binding' }, activeExecution: { state: 'unresolved-not-declared' } }, stepSelection: { state: 'recipient-interpretation-required' } }] },
      secretInternalDetail: { mustNotLeak: true }
    },
    currentWork: { state: 'current-frontier-resolved', frontier: [], blockers: [], bodiesProjected: 0, bodiesAvailable: 1 }, continuity: { losses: { state: 'visible-loss', blocking: false, items: [{ kind: 'reference', target: 'missing-parent', detail: 'known unavailable non-blocking material' }] } },
    returnPackage: { expected: true, returnTo: 'Sigma', carrierPrefix: 'business', parentDimension: '001', defaultMode: 'continue', defaultNextDimension: '001-1', filenamePattern: 'business-001-1-<from-role>-to-<to-role>.handoff-package.zip', parentPackagePath: 'carrier.zip', manufactureRule: 'Use the received carrier as package parent; Tooling owns the child dimension.' },
    deeper: { requiredContextBodies: { flag: '--include-required-context all' }, currentWorkBody: { flag: '--include-current-work' } },
    findingSummary: { counts: { error: 0, warning: 0 } }, actionableFindings: [], boundary: 'bounded'
  }, { command: 'project-grounding-readiness', positionals: ['carrier.zip'], flags: { route: '001-handoff-pointer.trace.md', 'holder-role': 'Anchor', recipient: true } }, {
    commandInvocation: { executable: '/usr/bin/node', entrypoint: '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs' },
    runtimeInitialization: { status: 'ready', discoveryBasis: 'bootstrap-manifest' },
    contentSources: [{
      status: 'ready',
      source: { id: '@tiinex/native', kind: 'bootstrap-content', package: { name: '@tiinex/native', version: '0.1.0' } },
      representationSha256: 'abc123'
    }]
  });
  assert.equal(output.readiness.state, 'grounded-to-act');
  assert.equal(output.authority.state, 'qualified');
  assert.equal(output.orchestrationReadiness.participantMap, 'explicit-bounded-map');
  assert.equal(output.runtimeContext.state, 'content-composed');
  assert.equal(output.runtimeContext.discoveryBasis, 'bootstrap-manifest');
  assert.equal(output.runtimeContext.sourceCount, 1);
  assert.deepEqual(output.runtimeContext.contentSources, [{ id: '@tiinex/native', kind: 'bootstrap-content', package: { name: '@tiinex/native', version: '0.1.0' }, representationSha256: 'abc123' }]);
  assert.equal(output.requiredContext.items[0].purpose, 'read-only semantic boundary');
  assert.equal(output.requiredContext.items[0].provenance.basis, 'selected-handoff-required-context-declaration');
  assert.equal(output.groundingBasis.qualifiedOrKnown[0].code, 'qualified-handoff-route');
  assert.equal(output.groundingBasis.boundedInference[0].code, 'relevant-lineage-scope');
  assert.equal(output.groundingBasis.participants.semanticParticipants[0].label, 'Sigma');
  assert.equal(output.groundingBasis.participants.groundingOnlyRoles[0].semanticParticipant, false);
  assert.equal(output.groundingBasis.participants.endpoints[0].semanticParticipant, false);
  assert.equal(output.groundingBasis.sourceSufficiency.workspaceCount, 3);
  assert.equal(output.groundingBasis.recipientReading.state, 'qualified-material-body-read-required');
  assert.equal(output.groundingBasis.recipientReading.qualifiedMaterialIsNotProofOfReading, true);
  assert.equal(output.groundingBasis.recipientReading.requiredContextBodies.pending, 1);
  assert.equal(output.groundingBasis.recipientReading.currentWorkBodies.pending, 1);
  assert.equal(output.recipientContract.state, 'bounded-work-contract-qualified');
  assert.equal(output.recipientContract.workspaceLifecycle.receivedSnapshot, 'immutable-qualified-carried-input');
  assert.equal(output.recipientContract.workspaceLifecycle.continuedWorkspace, 'writable-local-continuation');
  assert.equal(output.recipientContract.mustRead.state, 'body-read-required');
  assert.equal(output.recipientContract.knownMissingNonBlocking[0].target, 'missing-parent');
  assert.equal(output.recipientContract.sourceBlockingEvidence.length,0);
  assert.deepEqual(output.recipientContract.guidance.applicabilityStates,['qualified-relation-binding']);
  assert.deepEqual(output.recipientContract.guidance.activeExecutionStates,['unresolved-not-declared']);
  assert.deepEqual(output.recipientContract.guidance.stepSelectionStates,['recipient-interpretation-required']);
  assert.equal(output.recipientContract.guidance.currentStep,'not-established-by-applicability-alone');
  assert.equal(output.recipientContract.operationSelection.state,'selected-guidance-recheck-required-before-host-tool');
  assert.equal(output.recipientContract.operationSelection.recheckAfterEachHumanTurn,true);
  assert.equal(output.recipientContract.operationSelection.priorHostToolChoiceCarriesAcrossHumanTurn,false);
  assert.equal(output.recipientContract.operationSelection.allowedNextOperationState,'must-be-resolved-from-exact-selected-guidance-and-current-human-turn');
  assert.ok(output.recipientContract.operationSelection.forbiddenFallbacks.includes('do-not-manually-construct-or-label-a-tiinex-handoff-package'));
  assert.match(output.recipientContract.operationSelection.boundary,/A host that wants hard prevention must enforce/i);
  assert.match(output.recipientContract.nextAction.beforeWorkspaceMutation.cli, /ground carrier\.zip .*--recipient --continue <empty-workspace-dir>/);
  assert.equal(output.recipientContract.nextAction.beforeWorkspaceMutation.invocation.entrypoint, '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs');
  assert.equal(output.recipientContract.completion.returnAuthoring.qualifyTransition.invocation.entrypoint, '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs');
  assert.equal(output.recipientContract.completion.returnTo, 'Sigma');
  assert.equal(output.recipientContract.completion.canonicalTransport, 'one-handoff-package-plus-exact-routing-text');
  assert.equal(output.recipientContract.completion.returnPackage.carrierPrefix, 'business');
  assert.equal(output.recipientContract.completion.returnPackage.defaultNextDimension, '001-1');
  assert.match(output.recipientContract.completion.localWorkProductRule, /inside the continued Workspace/);
  assert.equal(output.recipientContract.completion.returnAuthoring.qualifyTransition.command, 'qualify-return');
  assert.equal(output.recipientContract.completion.returnAuthoring.qualifyTransition.cli, '/usr/bin/node /tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs qualify-return <continued-workspace-dir> --result <result-path> --expected <expected-file-path>');
  assert.equal(output.recipientContract.completion.returnAuthoring.prepare.command, 'prepare-return');
  assert.equal(output.recipientContract.completion.returnAuthoring.prepare.cli, '/usr/bin/node /tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs prepare-return <continued-workspace-dir>');
  assert.match(output.recipientContract.completion.returnAuthoring.semanticResponsibility, /qualify-return/);
  assert.match(output.recipientContract.completion.returnAuthoring.semanticResponsibility, /mechanically locked/);
  assert.match(output.recipientContract.completion.returnAuthoring.integrityAndQualification, /sha256-base64url-c14n-v2/);
  assert.equal(output.recipientContract.completion.returnAuthoring.manufacture.command, 'handoff');
  assert.match(output.recipientContract.completion.protocol[1], /qualify-return/);
  assert.match(output.recipientContract.completion.protocol[2], /prepare-return/);
  assert.match(output.recipientContract.completion.protocol[3], /author \.\.\. --preflight/);
  assert.match(output.recipientContract.completion.protocol[4], /Tooling owns canonical envelope continuity/);
  assert.match(output.recipientContract.completion.protocol.at(-1), /Do not attach loose result\/Evidence\/Handoff\/Workspace files/);
  assert.equal(output.groundingBasis.recipientReading.nextAction.command, 'ground');
  assert.equal(output.groundingBasis.recipientReading.nextAction.cli, '/usr/bin/node /tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs ground carrier.zip --route 001-handoff-pointer.trace.md --holder-role Anchor --include-required-context all --include-current-work');
  assert.deepEqual(output.groundingBasis.recipientReading.nextAction.invocation, {
    executable: '/usr/bin/node',
    args: ['/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs', 'ground', 'carrier.zip', '--route', '001-handoff-pointer.trace.md', '--holder-role', 'Anchor', '--include-required-context', 'all', '--include-current-work'],
    entrypoint: '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs',
    state: 'exact-runtime-entrypoint'
  });
  assert.equal(output.groundingBasis.recipientReading.nextAction.package, 'carrier.zip');
  assert.equal(output.groundingBasis.recipientReading.nextAction.route, '001-handoff-pointer.trace.md');
  assert.equal(output.groundingBasis.recipientReading.nextAction.holderRole, 'Anchor');
  assert.equal(output.groundingBasis.recipientReading.nextAction.includeRequiredContext, 'all');
  assert.equal(output.groundingBasis.recipientReading.nextAction.includeCurrentWork, true);
  assert.equal(output.groundingBasis.recipientReading.nextAction.boundary, 'Re-run the same exact package/route grounding through the already-active portable runtime and read only the qualified bodies required for recipient interpretation; this does not change semantic authority.');
  assert.equal(Object.hasOwn(output, 'capsule'), false);
  assert.equal(output.deeper.requiredContextBodies.flag, '--include-required-context all');
});

test('blocked orientation never emits executable ground nextAction even when a route pointer is structurally present', () => {
  const output = projectCommonCliDefaultOutput({
    schema: 'result', operation: 'orient-handoff-package', resultSchema: 'orientation', status: 'blocked',
    carrierLineage: { prefix: 'minimal-coldstart', mode: 'major', dimension: '005', checkpointKind: 'major' },
    workspaces: [{ id: 'minimal-coldstart', qualification: 'qualified' }],
    routes: [{ id: 'r', state: 'qualified', pointerPath: '005-pointer.trace.md', workspaceId: 'minimal-coldstart', from: 'Anchor', to: 'Anchor' }],
    findings: [{ severity: 'error', code: 'cache-integrity-invalid', message: 'cache bytes do not match qualified descriptor' }],
    findingSummary: { status: 'invalid', counts: { error: 1, warning: 0, info: 0, total: 1 } }
  }, { command: 'orient-handoff-package', positionals: ['carrier.zip'], flags: {} });
  assert.equal(output.status, 'blocked');
  assert.equal(output.nextAction, null);
});

test('common orient projection exposes exact carrier prefix with numeric lineage', () => {
  const output = projectCommonCliDefaultOutput({
    schema: 'result', operation: 'orient-handoff-package', resultSchema: 'orientation', status: 'ready',
    carrierLineage: { prefix: 'my-custom-workspace', mode: 'continue', dimension: '001-1-4-2', parentDimension: '001-1-4', checkpointKind: 'progression', authority: 'human-progress-projection-only' },
    workspaces: [], routes: [], findings: []
  }, { command: 'orient-handoff-package', positionals: ['carrier.zip'], flags: {} });
  assert.equal(output.carrierLineage.prefix, 'my-custom-workspace');
  assert.equal(output.carrierLineage.dimension, '001-1-4-2');
});


test('pointerless Workspace orientation projects executable carrier capabilities without inferring parent from source material', () => {
  const runtime = { commandInvocation: { executable: '/usr/bin/node', entrypoint: '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs' } };
  const output = projectCommonCliDefaultOutput({
    schema: 'result', operation: 'orient-handoff-package', resultSchema: 'orientation', status: 'ready',
    carrierLineage: { prefix: 'tiinex-full', mode: 'root', dimension: '001', parentDimension: '', checkpointKind: 'progression', authority: 'human-progress-projection-only' },
    workspaces: [{ id: 'core', qualification: 'qualified' }, { id: 'vscode', qualification: 'qualified' }],
    routes: [], findings: [], findingSummary: { counts: { error: 0, warning: 0 } }
  }, { command: 'orient-handoff-package', positionals: ['/incoming/tiinex-full-001.handoff-package.zip'], flags: {} }, runtime);
  assert.equal(output.status, 'ready');
  assert.equal(output.nextAction.kind, 'select-workspace-carrier-capability');
  assert.equal(output.capabilities.materialSourceIndependentFromCarrierParent, true);
  assert.equal(output.capabilities.carrierContinuityDecision.state, 'explicit-choice-required-for-workspace-manufacture');
  assert.match(output.capabilities.carrierContinuityDecision.boundary, /intended predecessor/i);
  assert.match(output.capabilities.carrierContinuityDecision.boundary, /independent from source\/material provenance/i);
  assert.equal(output.capabilities.carrierContinuityDecision.continueParent.command, 'handoff');
  assert.equal(output.capabilities.carrierContinuityDecision.continueParent.invocation.entrypoint, '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs');
  assert.match(output.capabilities.carrierContinuityDecision.continueParent.cli, /handoff <workspace-dir> --carrier-mode workspace --package-parent <intended-predecessor-carrier\.zip>/);
  assert.match(output.capabilities.carrierContinuityDecision.newRoot.cli, /handoff <workspace-dir> --carrier-mode workspace --new-root/);
  assert.doesNotMatch(output.capabilities.carrierContinuityDecision.continueParent.meaning, /source package must be parent/i);
});


const ROOT_SCHEMA_TARGET = currentSchemaTarget('tiinex.root.v1');
const TASK_SCHEMA_TARGET = currentSchemaTarget('tiinex.task.v1');
const ROLE_SCHEMA_TARGET = currentSchemaTarget('tiinex.party.role.v1');

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
    canonicalQualificationLoaded: { state: 'qualified', schemaId: 'tiinex.party.role.v1', assignmentModes: ['explicit-session', 'handoff'], exactAssignmentModesValue: 'explicit-session, handoff', findings: [] },
    holderRelationshipLoaded: { holderState: 'arbitrary human-readable summary', assignmentModes: 'explicit-session, handoff' }
  });
  assert.equal(authorized.state, 'qualified');
  assert.equal(authorized.assignmentMode, 'explicit-session');
  assert.deepEqual(authorized.authorizedModes, ['explicit-session', 'handoff']);
  assert.equal(authorized.modeAuthority.provenance.field, 'Assignment Modes');
  assert.equal(authorized.modeAuthority.provenance.basis, 'canonical-role-schema-qualified-assignment-modes');
  assert.equal(authorized.holderState, 'arbitrary human-readable summary');

  const unknownToken = projectHolderBindingAuthorization({
    ...baseRole,
    canonicalQualificationLoaded: { state: 'unresolved', schemaId: 'tiinex.party.role.v1', assignmentModes: [], exactAssignmentModesValue: 'explicit-session, future-magic-mode', findings: [{ severity: 'error', code: 'party.role.assignmentModes.invalid' }] },
    holderRelationshipLoaded: { holderState: 'contains session and handoff words', assignmentModes: 'explicit-session, future-magic-mode' }
  });
  assert.equal(unknownToken.state, 'unresolved');
  assert.equal(unknownToken.reasonCode, 'holder-assignment-mode-canonical-qualification-unresolved');
});

const STATIC_CANONICAL_ROLE_FIXTURE_MATRIX = [
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

function canonicalRoleFixture({ label, path, sha256, modes, state = 'qualified', materialState = 'qualified', holderState = 'diagnostic only', canonicalState = null }) {
  const assignmentModes = modes.join(', ');
  const qualificationState = canonicalState || (modes.length ? 'qualified' : 'unresolved');
  return {
    state,
    endpoint: { label, kind: 'role' },
    material: { state: materialState, artifact: { path: `001-3-business.workspace.zip::${path}`, sha256, schemaId: 'tiinex.party.role.v1', roleLabel: label } },
    canonicalQualificationLoaded: { state: qualificationState, schemaId: 'tiinex.party.role.v1', assignmentModes: qualificationState === 'qualified' ? [...modes] : [], exactAssignmentModesValue: assignmentModes, findings: qualificationState === 'qualified' ? [] : [{ severity: 'error', code: 'party.role.assignmentModes.invalid' }] },
    holderRelationshipLoaded: { holderState, assignmentModes }
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
    assert.equal(projected.reasonCode, 'holder-assignment-mode-canonical-qualification-unresolved', label);
    assert.deepEqual(projected.authorizedModes, [], label);
    assert.equal(projected.modeAuthority.provenance.decisionArtifact, null, label);
    assert.equal(projected.modeAuthority.provenance.exactRoleSourcePath, '', label);
  }
});

test('static canonical Role fixtures authorize only through canonical Assignment Modes projections', () => {
  for (const active of STATIC_CANONICAL_ROLE_FIXTURE_MATRIX) {
    const role = canonicalRoleFixture(active);
    const primaryMode = active.modes[0];
    const projected = projectHolderBindingAuthorization(role, { assertionMode: primaryMode });
    assert.equal(projected.state, 'qualified', active.label);
    assert.equal(projected.assignmentMode, primaryMode, active.label);
    assert.deepEqual(projected.authorizedModes, active.modes, active.label);
    assert.equal(projected.modeAuthority.source, 'qualified-recipient-role-canonical-projection', active.label);
    assert.equal(projected.modeAuthority.provenance.basis, 'canonical-role-schema-qualified-assignment-modes', active.label);
    assert.equal(projected.modeAuthority.provenance.roleArtifactSha256, active.sha256, active.label);
    assert.match(projected.modeAuthority.provenance.roleArtifactPath, new RegExp(active.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), active.label);
  }

  const kodax = STATIC_CANONICAL_ROLE_FIXTURE_MATRIX.find((item) => item.label === 'Kodax');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(kodax), { assertionMode: 'explicit-role-invocation' }).state, 'qualified');
  const pilot = STATIC_CANONICAL_ROLE_FIXTURE_MATRIX.find((item) => item.label === 'Pilot');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(pilot), { assertionMode: 'explicit-role-invocation' }).state, 'qualified');
  const sigma = STATIC_CANONICAL_ROLE_FIXTURE_MATRIX.find((item) => item.label === 'Sigma');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(sigma), { assertionMode: 'explicit-session' }).state, 'unresolved');
  const glimmer = STATIC_CANONICAL_ROLE_FIXTURE_MATRIX.find((item) => item.label === 'Glimmer');
  assert.equal(projectHolderBindingAuthorization(canonicalRoleFixture(glimmer), { assertionMode: 'explicit-session' }).state, 'unresolved');
});

test('canonical holder authorization fails closed for missing modes and unqualified current Role material', () => {
  const active = STATIC_CANONICAL_ROLE_FIXTURE_MATRIX.find((item) => item.label === 'Loom');
  const missing = canonicalRoleFixture({ ...active, modes: [] });
  assert.equal(projectHolderBindingAuthorization(missing).state, 'unresolved');
  assert.equal(projectHolderBindingAuthorization(missing).reasonCode, 'holder-assignment-mode-canonical-qualification-unresolved');

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
    canonicalQualificationLoaded: { state: 'unresolved', schemaId: 'tiinex.party.role.v1', assignmentModes: [], exactAssignmentModesValue: '', findings: [{ severity: 'error', code: 'party.role.assignmentModes.missing' }] },
    holderRelationshipLoaded: { holderState: 'explicit session, invocation, Handoff, participation all sound familiar', assignmentModes: '' }
  };
  const projected = projectHolderBindingAuthorization(baseRole);
  assert.equal(projected.state, 'unresolved');
  assert.equal(projected.reasonCode, 'holder-assignment-mode-canonical-qualification-unresolved');
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
      canonicalQualificationLoaded: { state: 'unresolved', schemaId: 'tiinex.party.role.v1', assignmentModes: [], exactAssignmentModesValue: '', findings: [{ severity: 'error', code: 'party.role.assignmentModes.missing' }] },
      holderRelationshipLoaded: { holderState, assignmentModes: '' }
    });
    assert.equal(projected.state, 'unresolved', holderState);
    assert.equal(projected.reasonCode, 'holder-assignment-mode-canonical-qualification-unresolved', holderState);
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

test('current-work delegate selector can qualify its exact selected Role from qualified Required Context without selection by carriage', () => {
  const base = artifactDelegationFixture();
  const authority = { ...base.authority, participation: { ...base.authority.participation, packageRoleGrounding: [] } };
  const axiom = participantRoleContext('Axiom', 'required:axiom-role');
  const projected = projectGroundingDelegationArtifactAuthority({ ...base, authority, requiredContext: [axiom] });
  assert.equal(projected.state, 'qualified-forward-artifact-closure');
  assert.equal(projected.delegateCapabilityAuthority.delegate.label, 'Axiom');
  assert.equal(projected.delegateCapabilityAuthority.sourceArtifact.path, 'business::.topics/roles/axiom.trace.md');
  assert.equal(projected.delegateCapabilityAuthority.provenance.materialResolution.kind, 'selected-handoff-required-context-role');
  assert.equal(projected.delegateCapabilityAuthority.provenance.materialResolution.requirementId, 'required:axiom-role');
});

test('Required Context Role material never selects a delegate and exact selected-role qualification fails closed on missing, near-match, ambiguous, or unrelated material', () => {
  const base = artifactDelegationFixture();
  const authority = { ...base.authority, participation: { ...base.authority.participation, packageRoleGrounding: [] } };
  const noSelectorRecords = base.records.map((record) => ({ ...record, markdown: record.markdown.replace('Axiom is the explicitly selected specialist for this review.', 'Obtain an independent specialist review.') }));
  const axiom = participantRoleContext('Axiom', 'required:axiom-role');
  const noSelector = projectGroundingDelegationArtifactAuthority({ ...base, authority, records: noSelectorRecords, requiredContext: [axiom] });
  assert.equal(noSelector.delegateCapabilityAuthority, null);
  assert.equal(noSelector.unresolved.some((item) => item.code === 'forward-delegate-selector-not-established'), true);

  const missing = projectGroundingDelegationArtifactAuthority({ ...base, authority, requiredContext: [] });
  assert.equal(missing.delegateCapabilityAuthority, null);

  const near = participantRoleContext('Axiom Review', 'required:axiom-near-role');
  const nearMatch = projectGroundingDelegationArtifactAuthority({ ...base, authority, requiredContext: [near] });
  assert.equal(nearMatch.delegateCapabilityAuthority, null);

  const duplicate = { ...axiom, requirementId: 'required:axiom-role-duplicate', innerPath: '.topics/roles/axiom-duplicate.trace.md', referenceTarget: 'business::.topics/roles/axiom-duplicate.trace.md' };
  const ambiguous = projectGroundingDelegationArtifactAuthority({ ...base, authority, requiredContext: [axiom, duplicate] });
  assert.equal(ambiguous.delegateCapabilityAuthority, null);
  assert.equal(ambiguous.unresolved.some((item) => item.code === 'exact-forward-selected-delegate-role-authority-not-established'), true);

  const unrelated = projectGroundingDelegationArtifactAuthority({ ...base, authority, requiredContext: [participantRoleContext('Pilot')] });
  assert.equal(unrelated.delegateCapabilityAuthority, null);
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

test('common handoff projection emits exact adjacent routing text for the canonical return carrier', () => {
  const output = projectCommonCliDefaultOutput({
    schema: 'tiinex.portable.operation.result.v1', operation: 'manufacture-handoff-package', resultSchema: 'tiinex.portable.handoff-manufacturing.v1', status: 'ready',
    verification: { preflight: 'qualified', packageInspection: 'valid', roundtrip: 'passed' },
    planSummary: { status: 'ready', requiredClosureReady: true, semanticHandoffStatus: 'unknown', required: [], reference: [], workspaces: [] },
    carrierProjection: { status: 'ready', mode: 'handoff', lineage: { prefix: 'minimal-coldstart', dimension: '002-1' }, routes: [{ id: 'r', state: 'qualified', workspaceId: 'minimal-coldstart', workspaceRelativePath: '.topics/handoffs/return.trace.md', from: 'Anchor', to: 'Sigma' }] },
    primaryOutput: { status: 'written', path: '/tmp/minimal-coldstart-002-1-anchor-to-sigma.handoff-package.zip', projectedFilename: 'minimal-coldstart-002-1-anchor-to-sigma.handoff-package.zip' },
    humanOutput: { normalInlineRouting: { routeId: 'r', continueFrom: '002-1-3-1-1-1-1-1-handoff-pointer.trace.md' }, presentation: { kind: 'handoff-package-v1' }, normalEmissionBoundary: { allowed: ['package-file','exact-adjacent-routing-text'], forbidden: ['manually-constructed-package'], canonicalFilePayloadCount: 1, workspaceArtifactsAsLooseTransportFiles: false, semanticWorkSummaryProse: false, helperArtifacts: false, manuallyReconstructedRouting: false, duplicateNormalFileChoices: false } },
    findings: [], findingSummary: { counts: { error: 0, warning: 0 } }
  }, { command: 'manufacture-handoff-package', surfaceCommand: 'handoff', flags: {}, positionals: ['/tmp/workspace'] });
  assert.equal(output.transport.routing.continueFrom, '002-1-3-1-1-1-1-1-handoff-pointer.trace.md');
  assert.match(output.transport.routingText, /^Handoff package attached\./);
  assert.match(output.transport.routingText, /Start:\n001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.match(output.transport.routingText, /Continue from \(do not read native; pass to Tiinex after bootstrap\):\n002-1-3-1-1-1-1-1-handoff-pointer\.trace\.md/);
  assert.doesNotMatch(output.transport.routingText, /\/tmp\//);
  assert.equal(output.transport.delivery.state,'qualified-awaiting-host-surface');
  assert.equal(output.transport.delivery.qualificationState,'qualified');
  assert.equal(output.transport.delivery.exactPackageBytesQualified,true);
  assert.equal(output.transport.delivery.runtimeLocalPathIsHumanDeliveryEvidence,false);
  assert.equal(output.transport.delivery.hostSurface.state,'not-proven');
  assert.equal(output.transport.delivery.hostSurface.requirement,'host-native-human-visible-artifact');
  assert.equal(output.transport.delivery.hostSurface.claimDeliveredAllowed,false);
  assert.match(output.transport.delivery.hostSurface.nextAction,/host-native human-visible file, attachment, or link mechanism/);
  assert.equal(output.transport.delivery.canonicalFilePayloadCount,1);
  assert.deepEqual(output.transport.delivery.allowedHumanEmission,['package-file','exact-adjacent-routing-text']);
  assert.ok(output.transport.delivery.forbiddenHumanEmission.includes('manually-constructed-package'));
});



test('common handoff projection blocks human delivery when physical roundtrip is not qualified', () => {
  const output = projectCommonCliDefaultOutput({
    schema: 'tiinex.portable.operation.result.v1', operation: 'manufacture-handoff-package', resultSchema: 'tiinex.portable.handoff-manufacturing.v1', status: 'ready',
    verification: { preflight: 'qualified', packageInspection: 'valid', roundtrip: 'not-run' },
    planSummary: { status: 'ready', requiredClosureReady: true, semanticHandoffStatus: 'unknown', required: [], reference: [], workspaces: [] },
    carrierProjection: { status: 'ready', mode: 'handoff', lineage: { prefix: 'minimal-coldstart', dimension: '002-1' }, routes: [{ id: 'r', state: 'qualified', workspaceId: 'minimal-coldstart', workspaceRelativePath: '.topics/handoffs/return.trace.md', from: 'Anchor', to: 'Sigma' }] },
    primaryOutput: { status: 'written', path: '/tmp/minimal-coldstart-002-1-anchor-to-sigma.handoff-package.zip', projectedFilename: 'minimal-coldstart-002-1-anchor-to-sigma.handoff-package.zip' },
    humanOutput: { normalInlineRouting: { routeId: 'r', continueFrom: '002-1-3-1-1-1-1-1-handoff-pointer.trace.md' }, presentation: { kind: 'handoff-package-v1' }, normalEmissionBoundary: { allowed: ['package-file','exact-adjacent-routing-text'], forbidden: ['manually-constructed-package'], canonicalFilePayloadCount: 1, workspaceArtifactsAsLooseTransportFiles: false, semanticWorkSummaryProse: false, helperArtifacts: false, manuallyReconstructedRouting: false, duplicateNormalFileChoices: false } },
    findings: [], findingSummary: { counts: { error: 0, warning: 0 } }
  }, { command: 'manufacture-handoff-package', surfaceCommand: 'handoff', flags: {}, positionals: ['/tmp/workspace'] });
  assert.equal(output.transport.delivery.state,'blocked-unqualified-for-host-surface');
  assert.equal(output.transport.delivery.qualificationState,'blocked');
  assert.equal(output.transport.delivery.exactPackageBytesQualified,false);
  assert.equal(output.transport.delivery.runtimeLocalPathIsHumanDeliveryEvidence,false);
  assert.equal(output.transport.delivery.hostSurface.state,'not-proven');
  assert.equal(output.transport.delivery.hostSurface.claimDeliveredAllowed,false);
  assert.equal(output.transport.delivery.physicalRoundtrip,'not-run');
  assert.match(output.transport.delivery.boundary,/runtime-local filesystem path is never delivery evidence/);
  assert.match(output.transport.delivery.boundary,/Manual ZIP construction or package-like labeling never qualifies either surfacing or delivery/);
});

test('ground CLI preserves an explicit canonical holder assignment mode without recipient-class inference', async () => {
  const { input } = await commandInput({
    command: 'project-grounding-readiness',
    positionals: ['test/thin-lineage-grounding-projection.test.mjs'],
    flags: {
      route: '001-handoff-pointer.trace.md',
      'holder-role': 'Sigma',
      'holder-assignment-mode': 'explicit-participation',
      recipient: true
    }
  });
  assert.equal(input.holderBinding.roleLabel, 'Sigma');
  assert.equal(input.holderBinding.assignmentMode, 'explicit-participation');
  assert.equal(input.holderBinding.sourceLocator, 'cli:--holder-role,--holder-assignment-mode');
});
