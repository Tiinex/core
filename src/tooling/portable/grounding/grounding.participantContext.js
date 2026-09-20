const MAX_PARTICIPANTS = 8;
const MAX_ROLES = 8;

export function projectGroundingParticipantContext(authority = null) {
  const participation = authority?.participation || {};
  const semanticParticipants = (participation.participants || []).slice(0, MAX_PARTICIPANTS).map((item) => Object.freeze({
    id: String(item.id || ''),
    label: String(item.label || ''),
    roles: Object.freeze([...(item.roles || [])].map(String)),
    verification: String(item.verification || 'declared'),
    semanticParticipant: true,
    basis: String(item.basis || 'explicit-participant-declaration'),
    provenance: Object.freeze({
      ...(item.provenance || {}),
      basis: String(item.provenance?.basis || 'explicit-qualified-participation-input'),
      source: String(item.source || item.provenance?.source || item.provenance?.declarationSourceArtifact?.path || ''),
      boundary: String(item.provenance?.boundary || 'Only explicit semantic participant authority is projected as participation.')
    })
  }));
  const roleGrounding = (participation.packageRoleGrounding || participation.packageRoleParticipants || []).slice(0, MAX_ROLES).map((item) => Object.freeze({
    label: String(item.label || item.roleArtifact?.roleLabel || ''),
    pointerPath: String(item.pointerPath || ''),
    roleArtifact: Object.freeze({ ...(item.roleArtifact || {}) }),
    groundingOnly: true,
    semanticParticipant: false,
    basis: 'explicit-package-role-grounding-pointer',
    provenance: Object.freeze({
      basis: 'package-role-grounding-pointer',
      pointerPath: String(item.pointerPath || ''),
      boundary: 'This proves only package-local Role grounding availability, not semantic participation.'
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
    unresolved: Object.freeze(semanticParticipants.length ? [] : [{
      code: 'participant-map-not-established',
      detail: 'No explicit semantic participant declaration or authoritative participant Relation is present in the current grounding input. Carried Role pointers remain grounding-only.',
      basis: 'absence-of-explicit-semantic-participant-authority',
      nextAuthorityNeeded: 'Provide an explicit qualified participant declaration/projection from semantic authority; do not infer it from Roles or Handoff endpoints.'
    }]),
    boundary: 'Only explicit semantic participant declarations count as participants here. Package Role grounding pointers and Handoff endpoints are projected separately and never infer participation, holder identity, delegation, or relevance from Role inventory, filenames, transport, chat position, or package adjacency.'
  });
}
