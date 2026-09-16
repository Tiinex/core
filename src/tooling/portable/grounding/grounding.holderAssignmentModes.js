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

  const structured = parseStructuredModes(relationship.assignmentModes);
  if (!structured.present) return unresolved(role, holderState, 'holder-assignment-mode-authority-missing', 'qualified-recipient-role-material', {
    basis: 'canonical-assignment-modes-missing', field: 'Assignment Modes'
  });
  if (structured.unknown.length) return unresolved(role, holderState, 'holder-assignment-mode-authority-unknown-token', 'qualified-recipient-role-structured-modes', {
    basis: 'exact-qualified-role-assignment-modes', field: 'Assignment Modes', exactValue: structured.raw, unknownModes: structured.unknown
  });
  if (!structured.modes.length) return unresolved(role, holderState, 'holder-assignment-mode-authority-empty', 'qualified-recipient-role-structured-modes', {
    basis: 'exact-qualified-role-assignment-modes', field: 'Assignment Modes', exactValue: structured.raw
  });
  return deepFreeze({
    state: 'qualified',
    modes: deepFreeze(structured.modes),
    holderState,
    source: 'qualified-recipient-role-structured-modes',
    reasonCode: 'holder-assignment-mode-authority-qualified',
    unknownModes: deepFreeze([]),
    provenance: baseProvenance(role, {
      basis: 'exact-qualified-role-assignment-modes',
      field: 'Assignment Modes',
      exactValue: structured.raw,
      boundary: 'Positive mode authority comes only from the exact structured Assignment Modes field on the qualified current Role. Holder State is diagnostic-only; historical compatibility material does not authorize current holder binding.'
    }),
    boundary: 'Exact structured canonical assignment modes authorize only their named bounded mechanisms; they do not establish a holder, durable identity, participation, delegation, process, source, or acceptance authority.'
  });
}

export function isCanonicalHolderAssignmentMode(value = '') {
  return KNOWN_MODES.has(String(value || '').trim());
}

function parseStructuredModes(value) {
  if (Array.isArray(value)) {
    const raw = value.map((item) => String(item || '').trim()).filter(Boolean);
    const tokens = raw.map(stripCode).filter(Boolean);
    return classifyStructured(tokens, raw.join(', '), true);
  }
  const raw = String(value || '').trim();
  if (!raw) return { present: false, raw: '', modes: [], unknown: [] };
  const tokens = raw.split(',').map((item) => stripCode(item.trim())).filter(Boolean);
  return classifyStructured(tokens, raw, true);
}

function classifyStructured(tokens, raw, present) {
  const modes = [];
  const unknown = [];
  for (const token of tokens) {
    if (KNOWN_MODES.has(token)) {
      if (!modes.includes(token)) modes.push(token);
    } else if (!unknown.includes(token)) unknown.push(token);
  }
  return { present, raw, modes, unknown };
}

function stripCode(value) {
  const text = String(value || '').trim();
  return /^`[^`]+`$/.test(text) ? text.slice(1, -1).trim() : text;
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
