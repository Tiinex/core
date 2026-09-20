import { sha256Hex } from '../../../export/package.bytes.js';
import { parseRoleMaterial } from '../handoff/coldStartQualification.materials.js';

const CURRENT_TASK_SCHEMA = 'tiinex.task.v1';
const ROLE_SCHEMA = 'tiinex.party.role.v1';
const MAX_PARTICIPANTS = 8;

export function projectGroundingParticipantArtifactAuthority({ authority = null, requiredContext = [], records = [], topology = {} } = {}) {
  const currentTasks = currentTaskRecords(records, topology);
  const declarations = currentTasks.flatMap(explicitTaskParticipantDeclarations);
  if (!declarations.length) return empty();

  const grouped = groupDeclarations(declarations);
  if (grouped.size > MAX_PARTICIPANTS) return Object.freeze({
    state: 'not-established',
    participants: Object.freeze([]),
    declarations: Object.freeze(declarations),
    unresolved: Object.freeze([Object.freeze({
      code: 'explicit-participant-cardinality-exceeded',
      detail: `Explicit current-work participant declarations exceed the bounded maximum of ${MAX_PARTICIPANTS}; no participant subset is selected by order or package placement.`,
      count: grouped.size,
      maximum: MAX_PARTICIPANTS
    })]),
    boundary: boundary()
  });

  const roleMaterials = exactRouteRoleMaterials(authority, requiredContext);
  const participants = [];
  const unresolved = [];
  for (const [roleKey, roleDeclarations] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const roleLabel = roleDeclarations[0]?.roleLabel || '';
    if (roleDeclarations.length !== 1) {
      unresolved.push(Object.freeze({
        code: 'explicit-participant-declaration-ambiguous',
        detail: 'Exactly one closed current-work participant declaration must identify a Role.',
        roleLabel,
        declarationCount: roleDeclarations.length,
        sourceArtifacts: Object.freeze(roleDeclarations.map((item) => item.sourceArtifact))
      }));
      continue;
    }
    const candidates = dedupeRoleMaterials(roleMaterials.filter((role) => normalize(role.label) === roleKey));
    if (candidates.length !== 1) {
      unresolved.push(Object.freeze({
        code: candidates.length ? 'explicit-participant-role-material-ambiguous' : 'explicit-participant-role-material-not-established',
        detail: candidates.length
          ? 'The explicitly declared participant Role resolves to more than one distinct exact qualified Role artifact.'
          : 'The explicitly declared participant Role has no exact qualified Role material in the selected route bounded authority/material closure.',
        roleLabel,
        candidateCount: candidates.length,
        declarationSourceArtifact: roleDeclarations[0].sourceArtifact
      }));
      continue;
    }
    participants.push(participantProjection(roleDeclarations[0], candidates[0]));
  }

  return Object.freeze({
    state: participants.length ? (unresolved.length ? 'partially-qualified' : 'explicit-qualified-artifact-participants') : 'not-established',
    participants: Object.freeze(participants),
    declarations: Object.freeze(declarations),
    unresolved: Object.freeze(unresolved),
    provenance: Object.freeze({
      basis: 'exact-current-work-participant-declaration-plus-exact-selected-route-role-material',
      currentWorkArtifacts: Object.freeze(currentTasks.map(sourceArtifactFromRecord)),
      boundary: 'Positive participant authority comes from the exact closed declaration on qualified current work. Exact Role material only qualifies that already-declared Role and never creates participation by carriage.'
    }),
    boundary: boundary()
  });
}

export function explicitTaskParticipantDeclarations(taskRecord = {}) {
  if (String(taskRecord.schemaId || '') !== CURRENT_TASK_SCHEMA || !taskRecord.hasContinuityContext || !taskRecord.hasIntegrity) return Object.freeze([]);
  const objective = section(taskRecord.markdown || '', 'Objective');
  if (!objective) return Object.freeze([]);
  const sourceArtifact = sourceArtifactFromRecord(taskRecord);
  const declarations = [];
  for (const paragraph of objective.split(/\r?\n\s*\r?\n/u).map((item) => item.trim()).filter(Boolean)) {
    if (/^[-*]\s/u.test(paragraph)) continue;
    const match = paragraph.match(/^([A-Za-z0-9][A-Za-z0-9 _/-]{0,79}) is an explicitly required (human )?participant in this current work(?: because ([^.\r\n]{1,240}))?\./u);
    if (!match) continue;
    const roleLabel = match[1].trim();
    const reason = String(match[3] || '').trim();
    const declaration = match[0].trim();
    if (!roleLabel) continue;
    declarations.push(Object.freeze({
      state: 'explicit-current-work-participant-declaration',
      roleLabel,
      participantKind: match[2] ? 'human' : 'role',
      selectorKind: 'explicit-current-work-participant-declaration-sentence',
      section: 'Objective',
      declaration,
      reason,
      sourceArtifact,
      boundary: 'Closed lexical declaration sentence only. Core does not search surrounding prose for Role labels or infer participation from Role/cache inventory, endpoints, filenames, transport, user identity, or chat identity.'
    }));
  }
  return Object.freeze(declarations);
}

function currentTaskRecords(records = [], topology = {}) {
  const byId = new Map((records || []).map((record) => [String(record.id || ''), record]));
  const byPath = new Map((records || []).map((record) => [String(record.path || ''), record]));
  const selected = [];
  for (const item of topology.currentFrontier || []) {
    const record = byId.get(String(item.id || '')) || byPath.get(String(item.path || '')) || byPath.get(String(item.resolvedPath || '')) || null;
    if (!record || String(record.schemaId || '') !== CURRENT_TASK_SCHEMA || !record.hasContinuityContext || !record.hasIntegrity) continue;
    if (!selected.includes(record)) selected.push(record);
  }
  return Object.freeze(selected);
}

function exactRouteRoleMaterials(authority = null, requiredContext = []) {
  const roles = [];
  const recipient = qualifiedEndpointRole(authority?.role || null, authority?.handoff?.toReference || '');
  const sender = qualifiedEndpointRole(authority?.senderRole || null, authority?.handoff?.fromReference || '');
  if (recipient) roles.push(recipient);
  if (sender) roles.push(sender);
  for (const entry of authority?.participation?.packageRoleGrounding || []) {
    const role = qualifiedPackageGroundingRole(entry);
    if (role) roles.push(role);
  }
  for (const entry of requiredContext || []) {
    const role = qualifiedRequiredContextRole(entry);
    if (role) roles.push(role);
  }
  return Object.freeze(dedupeRoleMaterials(roles));
}

function qualifiedEndpointRole(role = null, declaredReference = '') {
  const artifact = role?.material?.artifact || null;
  if (String(role?.state || '') !== 'qualified' || String(role?.material?.state || '') !== 'qualified' || !artifact) return null;
  const sha256 = normalizedSha(artifact.sha256);
  const reference = String(artifact.reference || declaredReference || artifact.path || '').trim();
  const label = String(role?.endpoint?.label || artifact.roleLabel || '').trim();
  if (!sha256 || !reference || !label || String(artifact.schemaId || '') !== ROLE_SCHEMA) return null;
  return Object.freeze({
    label,
    roleKind: String(artifact.roleKind || ''),
    sourceArtifact: sourceArtifactFromReference(reference, sha256, ROLE_SCHEMA),
    materialResolution: Object.freeze({ kind: 'selected-handoff-endpoint-role' })
  });
}


function qualifiedPackageGroundingRole(entry = {}) {
  const artifact = entry?.roleArtifact || null;
  if (!entry?.groundingOnly || String(entry?.materialQualification || '') !== 'qualified' || !artifact) return null;
  const sha256 = normalizedSha(artifact.sha256);
  const reference = String(artifact.reference || artifact.path || '').trim();
  const label = String(artifact.roleLabel || entry.label || '').trim();
  if (!sha256 || !reference || !label || String(artifact.schemaId || '') !== ROLE_SCHEMA) return null;
  return Object.freeze({
    label,
    roleKind: String(artifact.roleKind || ''),
    sourceArtifact: sourceArtifactFromReference(reference, sha256, ROLE_SCHEMA),
    materialResolution: Object.freeze({ kind: 'package-role-grounding-pointer', pointerPath: String(entry.pointerPath || ''), groundingOnly: true })
  });
}

function qualifiedRequiredContextRole(entry = {}) {
  if (String(entry.state || '') !== 'qualified' || String(entry.contentState || '') !== 'hydrated-text' || typeof entry.content !== 'string' || !entry.content) return null;
  const parsed = parseRoleMaterial({ path: String(entry.referenceTarget || entry.innerPath || entry.name || ''), markdown: entry.content, explicit: false });
  if (!parsed || parsed.schemaId !== ROLE_SCHEMA || !parsed.label) return null;
  const expectedSha = normalizedSha(entry.actualSha256 || entry.sha256);
  if (!expectedSha || parsed.sha256 !== expectedSha) return null;
  const reference = String(entry.referenceTarget || crossWorkspaceReference(entry) || parsed.path || '').trim();
  if (!reference) return null;
  return Object.freeze({
    label: parsed.label,
    roleKind: parsed.roleKind,
    sourceArtifact: sourceArtifactFromReference(reference, expectedSha, ROLE_SCHEMA),
    materialResolution: Object.freeze({
      kind: 'selected-handoff-required-context-role',
      requirementId: String(entry.requirementId || ''),
      providerMode: String(entry.providerMode || ''),
      workspaceId: String(entry.workspaceId || ''),
      innerPath: String(entry.innerPath || '')
    })
  });
}

function participantProjection(declaration, role) {
  const roleKey = normalize(role.label).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'role';
  return Object.freeze({
    id: `artifact-participant:${roleKey}`,
    label: role.label,
    roles: Object.freeze([role.label]),
    verification: 'qualified-artifact',
    basis: 'explicit-current-work-participant-declaration',
    source: declaration.sourceArtifact.path,
    declaration,
    roleSourceArtifact: role.sourceArtifact,
    materialResolution: role.materialResolution,
    provenance: Object.freeze({
      basis: 'exact-current-work-participant-declaration-plus-exact-qualified-role-material',
      declarationSourceArtifact: declaration.sourceArtifact,
      roleSourceArtifact: role.sourceArtifact,
      declaration: declaration.declaration,
      selectorKind: declaration.selectorKind,
      materialResolution: role.materialResolution,
      boundary: 'The current-work declaration establishes participation. Exact Role material only qualifies the declared Role; its presence alone is non-participant grounding evidence.'
    })
  });
}

function groupDeclarations(declarations = []) {
  const map = new Map();
  for (const declaration of declarations) {
    const key = normalize(declaration.roleLabel);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(declaration);
  }
  return map;
}

function dedupeRoleMaterials(roles = []) {
  const map = new Map();
  for (const role of roles || []) {
    const key = `${normalize(role?.label)}\u0000${String(role?.sourceArtifact?.sha256 || '')}`;
    if (!map.has(key)) map.set(key, role);
  }
  return [...map.values()];
}

function crossWorkspaceReference(entry = {}) {
  const workspaceId = String(entry.workspaceId || '').trim();
  const innerPath = String(entry.innerPath || '').replace(/^\/+/, '');
  return workspaceId && innerPath ? `${workspaceId}::${innerPath}` : '';
}

function sourceArtifactFromRecord(record = {}) {
  return Object.freeze({
    workspaceId: String(record.path || '').split('/')[0] || '',
    path: String(record.path || ''),
    sha256: sha256Hex(new TextEncoder().encode(String(record.markdown || ''))),
    schemaId: String(record.schemaId || '')
  });
}

function sourceArtifactFromReference(reference, sha256, schemaId) {
  const raw = String(reference || '').trim();
  const cross = raw.match(/^([^:/\\]+)::(.+)$/);
  return Object.freeze({ workspaceId: cross ? cross[1] : '', path: raw, sha256: normalizedSha(sha256), schemaId: String(schemaId || '') });
}

function section(markdown = '', heading = '') {
  const escaped = String(heading || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || '';
}

function normalizedSha(value = '') { const sha = String(value || '').trim().toLowerCase(); return /^[0-9a-f]{64}$/u.test(sha) ? sha : ''; }
function normalize(value = '') { return String(value || '').trim().toLowerCase(); }
function boundary() { return 'Artifact-derived semantic participation is bounded to exact qualified current-work declarations plus exact qualified Role material already available through the selected route. Role/cache carriage, grounding pointers, endpoints, filenames, package placement, user identity and chat identity never create participation.'; }
function empty() { return Object.freeze({ state: 'not-established', participants: Object.freeze([]), declarations: Object.freeze([]), unresolved: Object.freeze([]), provenance: null, boundary: boundary() }); }
