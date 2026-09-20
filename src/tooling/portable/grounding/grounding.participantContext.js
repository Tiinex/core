const MAX_PARTICIPANTS = 8;
const MAX_ROLES = 8;

export function projectGroundingParticipantContext(authority = null) {
  const participation = authority?.participation || {};
  const semanticParticipants = (participation.participants || []).slice(0, MAX_PARTICIPANTS).map((item) => projectSemanticParticipant(item, authority));
  const roleGrounding = (participation.packageRoleGrounding || participation.packageRoleParticipants || []).slice(0, MAX_ROLES).map((item) => Object.freeze({
    label: String(item.label || item.roleArtifact?.roleLabel || ''),
    pointerPath: String(item.pointerPath || ''),
    roleArtifact: Object.freeze({ ...(item.roleArtifact || {}) }),
    holderAssignmentAuthorization: projectGroundingOnlyAssignmentAuthorization(item),
    groundingOnly: true,
    semanticParticipant: false,
    basis: 'explicit-package-role-grounding-pointer',
    provenance: Object.freeze({
      basis: 'package-role-grounding-pointer',
      pointerPath: String(item.pointerPath || ''),
      boundary: 'This proves only package-local Role grounding availability, including exact Role assignment-mode material when carried. It does not establish semantic participation or a holder occurrence.'
    })
  }));
  const endpoints = (participation.handoffCapacities || []).slice(0, 2).map((item) => Object.freeze({
    direction: String(item.direction || ''),
    label: String(item.label || ''),
    kind: String(item.kind || ''),
    semanticClass: 'handoff-capacity',
    semanticParticipant: false,
    provenance: Object.freeze({
      basis: 'selected-handoff-endpoint',
      boundary: 'Handoff endpoint capacity is not a participant declaration.'
    })
  }));
  const mapState = semanticParticipants.length ? 'explicit-bounded-map' : 'not-established';
  return Object.freeze({
    state: semanticParticipants.length ? 'explicit-semantic-participants' : roleGrounding.length ? 'qualified-role-grounding-only' : 'unresolved',
    participantMapState: mapState,
    semanticParticipants: Object.freeze(semanticParticipants),
    roleGrounding: Object.freeze(roleGrounding),
    endpoints: Object.freeze(endpoints),
    speakerStateBoundary: speakerStateBoundary(),
    unresolved: Object.freeze(semanticParticipants.length ? [] : [{
      code: 'participant-map-not-established',
      detail: 'No explicit semantic participant declaration or authoritative participant Relation is present in the current grounding input. Carried Role pointers, holder bindings and speaker labels remain non-participant evidence.',
      basis: 'absence-of-explicit-semantic-participant-authority',
      nextAuthorityNeeded: 'Provide an explicit qualified participant declaration/projection from semantic authority; do not infer it from Roles, holder state, Handoff endpoints or host speaker state.'
    }]),
    boundary: 'Only explicit semantic participant declarations count as participants here. Exact Role identity, Role assignment-mode authorization, current consuming-session holder binding and semantic participation are projected as independent claims. Package Role grounding pointers and Handoff endpoints never infer participation. Active speaker value remains host-local non-authoritative state outside semantic grounding and cannot create Party identity, Role holding, participation, process applicability, delegation or acceptance.'
  });
}

function projectSemanticParticipant(item = {}, authority = null) {
  const roleIdentity = projectRoleIdentity(item);
  const holderAssignmentAuthorization = projectParticipantAssignmentAuthorization(item, roleIdentity);
  const holderBinding = projectParticipantHolderBinding(item, roleIdentity, authority?.holderBinding || null);
  return Object.freeze({
    id: String(item.id || ''),
    label: String(item.label || ''),
    roles: Object.freeze([...(item.roles || [])].map(String)),
    verification: String(item.verification || 'declared'),
    semanticParticipant: true,
    basis: String(item.basis || 'explicit-participant-declaration'),
    participantAuthority: Object.freeze({
      state: 'qualified',
      basis: String(item.basis || 'explicit-participant-declaration'),
      source: String(item.source || item.provenance?.source || item.provenance?.declarationSourceArtifact?.path || ''),
      provenance: item.provenance ? Object.freeze({ ...(item.provenance || {}) }) : null,
      boundary: 'Semantic participant authority is the explicit current interaction/work relevance claim. It neither requires nor establishes Role holding unless separate exact Role and holder authority qualify.'
    }),
    roleIdentity,
    holderAssignmentAuthorization,
    holderBinding,
    provenance: Object.freeze({
      ...(item.provenance || {}),
      basis: String(item.provenance?.basis || 'explicit-qualified-participation-input'),
      source: String(item.source || item.provenance?.source || item.provenance?.declarationSourceArtifact?.path || ''),
      boundary: String(item.provenance?.boundary || 'Only explicit semantic participant authority is projected as participation.')
    })
  });
}

function projectRoleIdentity(item = {}) {
  const supplied = item.roleIdentity && typeof item.roleIdentity === 'object' ? item.roleIdentity : null;
  const sourceArtifact = supplied?.sourceArtifact || item.roleSourceArtifact || item.provenance?.roleSourceArtifact || null;
  const qualified = Boolean(sourceArtifact
    && /^[0-9a-f]{64}$/iu.test(String(sourceArtifact.sha256 || ''))
    && String(sourceArtifact.schemaId || '') === 'tiinex.party.role.v1');
  if (!qualified) return Object.freeze({
    state: 'not-established',
    label: '',
    kind: '',
    sourceArtifact: null,
    materialResolution: null,
    boundary: 'Semantic participation does not imply Role identity. A participant may be a person/Party or otherwise relevant without one exact qualified Role artifact.'
  });
  return Object.freeze({
    state: 'qualified',
    label: String(supplied?.label || item.roles?.[0] || item.label || ''),
    kind: String(supplied?.kind || ''),
    sourceArtifact: sourceArtifact ? Object.freeze({ ...(sourceArtifact || {}) }) : null,
    materialResolution: supplied?.materialResolution || item.materialResolution ? Object.freeze({ ...(supplied?.materialResolution || item.materialResolution || {}) }) : null,
    boundary: String(supplied?.boundary || 'Exact qualified Role material establishes this Role identity only; it does not establish assignment authorization, a holder occurrence, semantic participation or durable person identity.')
  });
}

function projectParticipantAssignmentAuthorization(item = {}, roleIdentity = null) {
  const supplied = item.holderAssignmentAuthorization && typeof item.holderAssignmentAuthorization === 'object'
    ? item.holderAssignmentAuthorization
    : null;
  if (!supplied || String(roleIdentity?.state || '') !== 'qualified') return Object.freeze({
    state: 'not-established',
    modes: Object.freeze([]),
    holderState: '',
    source: 'none',
    reasonCode: 'participant-role-assignment-mode-authority-not-established',
    provenance: null,
    boundary: 'Semantic participation does not imply Role holder-assignment authorization. Exact qualified Role Assignment Modes are required separately.'
  });
  return Object.freeze({
    state: String(supplied.state || 'unresolved'),
    modes: Object.freeze([...(supplied.modes || [])]),
    holderState: String(supplied.holderState || ''),
    source: String(supplied.source || 'none'),
    reasonCode: String(supplied.reasonCode || ''),
    provenance: supplied.provenance ? Object.freeze({ ...(supplied.provenance || {}) }) : null,
    boundary: String(supplied.boundary || 'Exact Role Assignment Modes authorize only named bounded assignment mechanisms; authorization is not itself a holder occurrence or participation claim.')
  });
}

function projectParticipantHolderBinding(item = {}, roleIdentity = null, holder = null) {
  if (String(roleIdentity?.state || '') !== 'qualified') return noParticipantHolderBinding('participant-role-identity-not-established');
  const roleLabel = String(roleIdentity?.label || '').trim();
  const holderRoleLabel = String(holder?.roleLabel || '').trim();
  if (!holder || !roleLabel || !holderRoleLabel || normalize(roleLabel) !== normalize(holderRoleLabel)) {
    return noParticipantHolderBinding('matching-session-holder-binding-not-established');
  }

  const participantSha = normalizedSha(roleIdentity?.sourceArtifact?.sha256);
  const holderSha = normalizedSha(holder?.sourceDetail?.roleArtifactSha256 || holder?.authorization?.provenance?.roleArtifactSha256);
  if (participantSha && holderSha && participantSha !== holderSha) return noParticipantHolderBinding('session-holder-role-material-mismatch');

  return Object.freeze({
    state: String(holder.state || 'unresolved'),
    bindingPresent: String(holder.state || '') === 'qualified',
    roleLabel: holderRoleLabel,
    holderId: String(holder.holderId || ''),
    assignmentMode: String(holder.assertionMode || holder.authorization?.assignmentMode || ''),
    source: String(holder.source || 'none'),
    authorizationState: String(holder.authorization?.state || 'unresolved'),
    durableIdentityState: String(holder.durableIdentity?.state || 'not-established'),
    provenance: Object.freeze({
      basis: String(holder.sourceDetail?.semanticAuthorityState || '') === 'qualified-bounded-handoff-assignment'
        ? 'qualified-bounded-consuming-session-holder-binding'
        : String(holder.source || 'none'),
      sourceKind: String(holder.sourceDetail?.kind || ''),
      sourceLocator: String(holder.sourceDetail?.locator || ''),
      roleArtifactSha256: holderSha,
      boundary: 'This is the independently qualified current consuming-session holder binding for this exact Role. It neither creates semantic participation nor durable holder identity.'
    }),
    boundary: String(holder.boundary || 'Current consuming-session Role binding only; independent from semantic participation and durable identity.')
  });
}

function noParticipantHolderBinding(reasonCode) {
  return Object.freeze({
    state: 'not-established',
    bindingPresent: false,
    roleLabel: '',
    holderId: '',
    assignmentMode: '',
    source: 'none',
    authorizationState: 'not-established',
    durableIdentityState: 'not-established',
    reasonCode,
    provenance: null,
    boundary: 'No exact current consuming-session holder binding is established for this participant Role. Role identity, assignment-mode authorization and semantic participation remain independently observable.'
  });
}

function projectGroundingOnlyAssignmentAuthorization(item = {}) {
  const relationship = item.holderRelationshipLoaded || {};
  const raw = String(relationship.assignmentModes || '').trim();
  return Object.freeze({
    state: raw ? 'available-role-material' : 'not-projected',
    exactValue: raw,
    semanticParticipant: false,
    boundary: 'Exact Role assignment-mode material may be carried for grounding, but carriage is not assignment authorization for a current assertion and never creates semantic participation or a holder occurrence.'
  });
}

function speakerStateBoundary() {
  return Object.freeze({
    state: 'external-host-local-non-authoritative',
    transported: false,
    consumedAsSemanticAuthority: false,
    boundary: 'Core does not ingest or persist an active-speaker value in semantic grounding. Hosts may display or switch a local speaker label, but mapping that label to a Role requires independent exact Role plus holder binding, and using it as a participant choice additionally requires qualified semantic participant authority.'
  });
}

function normalizedSha(value = '') { const sha = String(value || '').trim().toLowerCase(); return /^[0-9a-f]{64}$/u.test(sha) ? sha : ''; }
function normalize(value = '') { return String(value || '').trim().toLowerCase(); }
