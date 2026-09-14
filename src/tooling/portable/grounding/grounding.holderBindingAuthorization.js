import { deepFreeze, normalizeComparable, normalizeToken } from '../handoff/coldStartQualification.shared.js';

export const EXPLICIT_SESSION_OR_HANDOFF_HOLDER_STATE = 'assignable per explicit session or Handoff';
export const CURRENT_ROLE_EXPLICIT_SESSION_OR_HANDOFF_HOLDER_STATE = 'assignable per explicit session, role invocation, or Handoff; no permanent holder asserted';
export const ANCHOR_EXPLICIT_SESSION_OR_HANDOFF_HOLDER_STATE = 'assignable per explicit session or Handoff; no permanent holder asserted';

const AUTHORIZED_EXPLICIT_SESSION_OR_HANDOFF_STATES = new Set([
  normalizeComparable(EXPLICIT_SESSION_OR_HANDOFF_HOLDER_STATE),
  normalizeComparable(CURRENT_ROLE_EXPLICIT_SESSION_OR_HANDOFF_HOLDER_STATE),
  normalizeComparable(ANCHOR_EXPLICIT_SESSION_OR_HANDOFF_HOLDER_STATE)
]);

export function projectHolderBindingAuthorization(role = {}) {
  const endpointKind = normalizeToken(role?.endpoint?.kind || '');
  if (endpointKind !== 'role') return deepFreeze({
    state: 'not-applicable',
    assignmentMode: '',
    holderState: '',
    source: 'none',
    reasonCode: 'recipient-not-role',
    provenance: {
      basis: 'recipient-not-role',
      roleArtifactPath: '',
      roleArtifactSha256: '',
      section: 'Holder Relationship',
      field: 'Holder State',
      boundary: 'Holder-assignment authorization is only applicable when the selected Handoff recipient is a Role endpoint.'
    },
    boundary: 'No Role assignment authorization is required for a non-Role recipient.'
  });

  const material = role?.material?.artifact || null;
  const relationship = role?.holderRelationshipLoaded || {};
  const holderState = String(relationship.holderState || '').trim();
  const qualifiedMaterial = String(role?.state || '') === 'qualified'
    && String(role?.material?.state || '') === 'qualified'
    && Boolean(material?.path)
    && Boolean(material?.sha256);
  const provenance = {
    basis: qualifiedMaterial ? 'exact-qualified-role-holder-relationship' : 'exact-qualified-role-holder-relationship-not-established',
    roleArtifactPath: String(material?.path || ''),
    roleArtifactSha256: String(material?.sha256 || ''),
    roleSchemaId: String(material?.schemaId || ''),
    roleLabel: String(material?.roleLabel || role?.endpoint?.label || ''),
    section: 'Holder Relationship',
    field: 'Holder State',
    exactValue: holderState,
    boundary: 'Only exact qualified recipient Role material may authorize the bounded session assignment mode. Handoff endpoints, transport identity, explicit session input, filenames, and package placement do not provide this authority.'
  };

  if (!qualifiedMaterial) return deepFreeze({
    state: 'unresolved',
    assignmentMode: '',
    holderState,
    source: 'none',
    reasonCode: 'qualified-role-holder-authority-not-established',
    provenance,
    boundary: 'A matching session Role assertion remains unauthorized until exact qualified Role material establishes the assignment mode.'
  });

  const assignmentAuthorized = AUTHORIZED_EXPLICIT_SESSION_OR_HANDOFF_STATES.has(normalizeComparable(holderState));
  if (!assignmentAuthorized) return deepFreeze({
    state: 'unresolved',
    assignmentMode: '',
    holderState,
    source: 'qualified-recipient-role-material',
    reasonCode: holderState ? 'holder-assignment-mode-not-authorized' : 'holder-assignment-mode-unresolved',
    provenance,
    boundary: 'The exact qualified Role does not establish authorization for explicit-session/Handoff assignment. Core preserves this as unresolved and does not reinterpret other Holder State wording.'
  });

  return deepFreeze({
    state: 'qualified',
    assignmentMode: 'explicit-session-or-handoff',
    holderState,
    source: 'qualified-recipient-role-material',
    reasonCode: 'holder-assignment-mode-authorized',
    provenance,
    boundary: 'Exact qualified Role Holder Relationship authorizes this assignment mode for the bounded current session only; it does not establish durable holder identity or broader participant/process/source authority.'
  });
}
