import { deepFreeze, normalizeToken } from '../handoff/coldStartQualification.shared.js';

export const HOLDER_ASSIGNMENT_MODE = deepFreeze({
  EXPLICIT_SESSION: 'explicit-session',
  EXPLICIT_USER_SESSION: 'explicit-user-session',
  EXPLICIT_ROLE_INVOCATION: 'explicit-role-invocation',
  HANDOFF: 'handoff',
  EXPLICIT_PARTICIPATION: 'explicit-participation'
});

const KNOWN_MODES = new Set(Object.values(HOLDER_ASSIGNMENT_MODE));

export function projectHolderAssignmentModeAuthority(role = {}) {
  const endpointKind = normalizeToken(role?.endpoint?.kind || '');
  if (endpointKind !== 'role') return deepFreeze({
    state: 'not-applicable',
    modes: deepFreeze([]),
    holderState: '',
    source: 'none',
    reasonCode: 'recipient-not-role',
    unknownModes: deepFreeze([]),
    provenance: baseProvenance(role, { basis: 'recipient-not-role', field: 'Assignment Modes' }),
    boundary: 'Holder assignment-mode authority applies only to a selected Role recipient.'
  });

  const material = role?.material?.artifact || null;
  const relationship = role?.holderRelationshipLoaded || {};
  const holderState = String(relationship.holderState || '').trim();
  const qualifiedMaterial = String(role?.state || '') === 'qualified'
    && String(role?.material?.state || '') === 'qualified'
    && Boolean(material?.path)
    && /^[0-9a-f]{64}$/i.test(String(material?.sha256 || ''));
  if (!qualifiedMaterial) return unresolved(role, holderState, 'qualified-role-holder-authority-not-established', 'none', {
    basis: 'exact-qualified-role-assignment-mode-authority-not-established', field: 'Assignment Modes'
  });

  const qualification = role?.canonicalQualificationLoaded || role?.canonicalQualification || {};
  if (String(qualification.state || '') !== 'qualified') return unresolved(role, holderState, 'holder-assignment-mode-canonical-qualification-unresolved', 'qualified-recipient-role-material', {
    basis: 'canonical-role-schema-qualification-unresolved',
    field: 'Assignment Modes',
    exactValue: String(qualification.exactAssignmentModesValue || relationship.assignmentModes || ''),
    qualificationFindings: (qualification.findings || []).map((finding) => String(finding?.code || '')).filter(Boolean)
  });

  const modes = [...(qualification.assignmentModes || [])].map((item) => String(item || '').trim()).filter(Boolean);
  const unknown = modes.filter((mode) => !KNOWN_MODES.has(mode));
  if (unknown.length) return unresolved(role, holderState, 'holder-assignment-mode-authority-unsupported-canonical-mode', 'qualified-recipient-role-canonical-projection', {
    basis: 'canonical-role-schema-qualified-assignment-modes', field: 'Assignment Modes', exactValue: String(qualification.exactAssignmentModesValue || ''), unknownModes: unknown
  });
  if (!modes.length) return unresolved(role, holderState, 'holder-assignment-mode-authority-empty', 'qualified-recipient-role-canonical-projection', {
    basis: 'canonical-role-schema-qualified-assignment-modes', field: 'Assignment Modes', exactValue: String(qualification.exactAssignmentModesValue || '')
  });
  return deepFreeze({
    state: 'qualified',
    modes: deepFreeze(modes),
    holderState,
    source: 'qualified-recipient-role-canonical-projection',
    reasonCode: 'holder-assignment-mode-authority-qualified',
    unknownModes: deepFreeze([]),
    provenance: baseProvenance(role, {
      basis: 'canonical-role-schema-qualified-assignment-modes',
      field: 'Assignment Modes',
      exactValue: String(qualification.exactAssignmentModesValue || ''),
      boundary: 'Positive mode authority is consumed only from the canonical Role schema qualification of the exact qualified current Role material. Grounding does not independently reinterpret raw Assignment Modes serialization.'
    }),
    boundary: 'Canonical Role schema qualification is the single truth for Assignment Modes serialization and membership; Core only consumes the qualified projection for bounded holder authorization.'
  });
}

export function isCanonicalHolderAssignmentMode(value = '') {
  return KNOWN_MODES.has(String(value || '').trim());
}

function unresolved(role, holderState, reasonCode, source, details = {}) {
  return deepFreeze({
    state: 'unresolved',
    modes: deepFreeze([]),
    holderState,
    source,
    reasonCode,
    unknownModes: deepFreeze([...(details.unknownModes || [])]),
    provenance: baseProvenance(role, details),
    boundary: 'Positive holder assignment-mode authorization is unresolved. Core does not infer canonical modes from Holder State prose, historical Role compatibility, endpoint labels, package placement, session assertions, filenames, or lexical similarity.'
  });
}

function baseProvenance(role = {}, details = {}) {
  const material = role?.material?.artifact || {};
  return deepFreeze({
    basis: String(details.basis || ''),
    roleArtifactPath: String(material.path || ''),
    roleArtifactSha256: String(material.sha256 || ''),
    roleSchemaId: String(material.schemaId || ''),
    roleLabel: String(material.roleLabel || role?.endpoint?.label || ''),
    section: 'Holder Relationship',
    field: String(details.field || 'Assignment Modes'),
    exactValue: String(details.exactValue || ''),
    exactRoleSourcePath: '',
    exactRoleSha256: '',
    decisionArtifact: null,
    boundary: String(details.boundary || 'Only exact structured Assignment Modes on exact qualified current Role material may establish canonical assignment modes. Holder State and historical compatibility material remain non-authoritative for positive authorization.')
  });
}
