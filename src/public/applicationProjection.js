import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';

export const APPLICATION_DATA_SCHEMA_ID = 'tiinex.core.application-data.v1';

export function projectApplicationData(input = {}) {
  const workspaces = Array.isArray(input) ? input : Array.isArray(input.workspaces) ? input.workspaces : [];
  const findings = [];
  const projectedWorkspaces = workspaces.map((workspace, index) => projectWorkspace(workspace, index, findings));
  const locator = buildLocator(projectedWorkspaces);

  const records = projectedWorkspaces.flatMap((workspace) => workspace.records.map((record) => finalizeRecord(record, workspace, locator, findings)));
  const byWorkspace = new Map();
  for (const record of records) {
    if (!byWorkspace.has(record.workspaceId)) byWorkspace.set(record.workspaceId, []);
    byWorkspace.get(record.workspaceId).push(record);
  }
  const finalizedWorkspaces = projectedWorkspaces.map((workspace) => freeze({
    ...workspace,
    records: freeze((byWorkspace.get(workspace.id) || []).sort(compareHistorical))
  }));

  return freeze({
    schema: APPLICATION_DATA_SCHEMA_ID,
    workspaces: finalizedWorkspaces,
    records: freeze([...records].sort(compareHistorical)),
    relations: freeze(records.flatMap((record) => record.relation ? [record.relation] : [])),
    findings,
    boundary: 'Read-only declared-data projection; parsing and exact-reference resolution do not certify schema validity or authority. Parent and endpoint links use exact declared references only; titles, filenames, chronology and repository basenames never infer semantic relations or authority.'
  });
}

export function toPlaythingsStoryRecords(applicationData = {}) {
  const records = Array.isArray(applicationData.records) ? applicationData.records : [];
  const counts = new Map();
  for (const record of records) counts.set(record.id, (counts.get(record.id) || 0) + 1);
  return freeze(records.flatMap((record) => {
    if (!Number.isFinite(record.historicalTimeMs) || counts.get(record.id) !== 1) return [];
    const story = {
      id: record.id,
      historicalTimeMs: record.historicalTimeMs,
      authors: record.authors,
      actionStatus: record.actionStatus || 'unknown'
    };
    if (record.parent.state === 'resolved') story.parentId = record.parent.id;
    else if (record.parent.state === 'root') story.parentId = null;
    // Unknown/unresolved Parent deliberately omits parentId.
    if (record.participants !== undefined) story.participants = record.participants;
    if (record.handoff) story.handoff = { from: record.handoff.from, to: record.handoff.to };
    return [freeze(story)];
  }));
}

function projectWorkspace(workspace = {}, index, findings) {
  const id = text(workspace.id || workspace.workspaceId);
  if (!id || id.includes('::')) throw new TypeError('An explicit unambiguous Workspace id is required.');
  const title = text(workspace.title || workspace.name || id);
  const sourceIdentity = freeze({
    workspaceId: id,
    repository: text(workspace.repository || workspace.repo || workspace.source?.repository || ''),
    revision: text(workspace.revision || workspace.commit || workspace.source?.revision || ''),
    sourceMode: text(workspace.sourceMode || workspace.source?.adapterId || ''),
    origin: text(workspace.origin || workspace.source?.origin || '')
  });
  const rawRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const records = rawRecords.map((record, recordIndex) => projectRecord(record, { id, title, sourceIdentity }, recordIndex, findings));
  return freeze({ id, title, sourceIdentity, records, assets: freeze(Array.isArray(workspace.assets) ? workspace.assets.map(safeAssetProjection) : []) });
}

function projectRecord(record = {}, workspace, index, findings) {
  const path = normPath(record.path || record.id);
  if (!path) throw new TypeError('An explicit artifact path or id is required.');
  const id = `${workspace.id}::${path}`;
  let parsed = null;
  if (typeof record.markdown === 'string' && record.markdown.trim()) {
    try { parsed = parseArtifactMarkdown(record.markdown); }
    catch (error) { findings.push(finding('warning', 'application-data.parse.failed', 'Artifact Markdown could not be projected.', { id, message: String(error?.message || error) })); }
  }
  const schemaId = text(parsed?.envelope?.current?.schema?.id || record.currentSchemaId || record.schemaId || record.kind || '');
  const createdAt = text(record.currentCreatedAt || record.createdAt || parsed?.envelope?.current?.createdAt || '');
  const historicalTimeMs = createdAt ? Date.parse(createdAt.replace(' ', 'T') + (/Z$|[+-]\d\d:?\d\d$/.test(createdAt) ? '' : 'Z')) : NaN;
  if (createdAt && !Number.isFinite(historicalTimeMs)) findings.push(finding('warning', 'application-data.created-at.invalid', 'Created At is present but cannot be represented as a deterministic historical timestamp.', { id, createdAt }));
  const authors = splitIdentities(record.authors ?? parsed?.envelope?.current?.authors ?? '');
  const parentTarget = text(parsed?.envelope?.parent?.trace || record.parentRef || record.trace || '');
  const explicitParticipants = Array.isArray(record.participants) ? freeze(record.participants.map(identityString).filter(Boolean)) : undefined;
  const actionStatus = ['unknown', 'planned', 'occurred', 'cancelled'].includes(text(record.actionStatus).toLowerCase()) ? text(record.actionStatus).toLowerCase() : 'unknown';
  return freeze({
    id,
    workspaceId: workspace.id,
    path,
    title: text(record.title || parsed?.title || path),
    schemaId,
    createdAt,
    historicalTimeMs: Number.isFinite(historicalTimeMs) ? historicalTimeMs : null,
    authors,
    participants: explicitParticipants,
    actionStatus,
    parentTarget,
    parentDeclared: Boolean(parsed?.hasContinuityContext && /^\s*- Parent\s*$/m.test(record.markdown || '')),
    hasEnvelope: Boolean(parsed?.hasContinuityContext),
    parsed,
    source: freeze({ ...workspace.sourceIdentity, recordSourceMode: text(record.sourceMode || record.source?.adapterId || '') }),
    raw: record
  });
}

function finalizeRecord(record, workspace, locator, findings) {
  const parent = resolveParent(record, workspace, locator, findings);
  const handoff = record.schemaId === 'tiinex.handoff.v1' ? projectHandoff(record, workspace, locator, findings) : null;
  const relation = record.schemaId === 'tiinex.relation.v1' ? projectRelation(record, workspace, locator, findings) : null;
  const result = {
    id: record.id,
    workspaceId: record.workspaceId,
    path: record.path,
    title: record.title,
    schemaId: record.schemaId,
    createdAt: record.createdAt,
    historicalTimeMs: record.historicalTimeMs,
    authors: record.authors,
    actionStatus: record.actionStatus,
    parent,
    source: record.source,
    qualification: { schema: 'not-validated-by-this-projection', integrity: 'not-checked-by-this-projection' },
    handoff,
    relation
  };
  if (record.participants !== undefined) result.participants = record.participants;
  return freeze(result);
}

function buildLocator(workspaces) {
  const exact = new Map();
  for (const workspace of workspaces) {
    for (const record of workspace.records) { const matches = exact.get(record.id) || []; matches.push(record); exact.set(record.id, matches); }
  }
  return { exact };
}

function resolveParent(record, workspace, locator, findings) {
  if (!record.parentTarget) return freeze({ state: record.hasEnvelope && !record.parentDeclared ? 'root' : 'unresolved', id: null, target: '', basis: 'declared-envelope-not-semantic-qualification' });
  const resolved = resolveReference(record.parentTarget, record, workspace, locator);
  if (resolved.state === 'resolved') return freeze({ state: 'resolved', id: resolved.record.id, target: record.parentTarget, method: resolved.method });
  findings.push(finding(resolved.state === 'ambiguous' ? 'error' : 'warning', `application-data.parent.${resolved.state}`, 'Declared Parent reference did not resolve to exactly one loaded artifact.', { id: record.id, target: record.parentTarget, candidates: resolved.candidates || [] }));
  return freeze({ state: resolved.state, id: null, target: record.parentTarget });
}

function projectHandoff(record, workspace, locator, findings) {
  const body = record.parsed?.body?.text || '';
  const from = field(body, 'From');
  const to = field(body, 'To');
  const fromRef = markdownTarget(field(body, 'From Reference'));
  const toRef = markdownTarget(field(body, 'To Reference'));
  const fromProjection = resolveEndpoint(from, fromRef, record, workspace, locator, findings, 'from');
  const toProjection = resolveEndpoint(to, toRef, record, workspace, locator, findings, 'to');
  return freeze({
    declaration: freeze({ from: text(from), to: text(to), fromReference: fromRef, toReference: toRef }),
    from: freeze(fromProjection.ids),
    to: freeze(toProjection.ids),
    endpoints: freeze([fromProjection, toProjection]),
    impliesAcceptance: false
  });
}

function resolveEndpoint(label, reference, record, workspace, locator, findings, side) {
  if (!reference) return freeze({ side, state: 'unresolved', ids: [], label: text(label), reference: '' });
  const resolved = resolveReference(reference, record, workspace, locator);
  if (resolved.state === 'resolved') return freeze({ side, state: 'resolved', ids: [resolved.record.id], label: text(label), reference, artifactId: resolved.record.id });
  findings.push(finding(resolved.state === 'ambiguous' ? 'error' : 'warning', `application-data.handoff.${side}.${resolved.state}`, 'Handoff endpoint reference did not resolve to exactly one loaded artifact. Display name was not used as identity.', { id: record.id, reference }));
  return freeze({ side, state: resolved.state, ids: [], label: text(label), reference });
}

function projectRelation(record, workspace, locator, findings) {
  const body = record.parsed?.body?.text || '';
  const sourceRef = markdownTarget(field(body, 'Source'));
  const targetRef = markdownTarget(field(body, 'Target'));
  const source = sourceRef ? resolveReference(sourceRef, record, workspace, locator) : { state: 'unresolved' };
  const target = targetRef ? resolveReference(targetRef, record, workspace, locator) : { state: 'unresolved' };
  if (sourceRef && source.state !== 'resolved') findings.push(finding('warning', `application-data.relation.source.${source.state}`, 'Relation Source did not resolve exactly in loaded application data.', { id: record.id, reference: sourceRef }));
  if (targetRef && target.state !== 'resolved') findings.push(finding('warning', `application-data.relation.target.${target.state}`, 'Relation Target did not resolve exactly in loaded application data.', { id: record.id, reference: targetRef }));
  return freeze({
    id: record.id,
    type: text(field(body, 'Relation Type')),
    direction: text(field(body, 'Relation Direction')),
    scope: text(field(body, 'Relation Scope')),
    source: freeze({ reference: sourceRef, state: source.state, artifactId: source.record?.id || null }),
    target: freeze({ reference: targetRef, state: target.state, artifactId: target.record?.id || null })
  });
}

function resolveReference(value, record, workspace, locator) {
  const target = text(value);
  if (!target) return { state: 'unresolved', candidates: [] };
  const workspaceQualified = target.match(/^([^:]+)::(.+)$/);
  if (workspaceQualified) {
    const id = `${text(workspaceQualified[1])}::${normPath(workspaceQualified[2])}`;
    const hit = locator.exact.get(id);
    return exactCandidateResult(hit || [], 'workspace-qualified');
  }
  if (/^[a-z]+:\/\//i.test(target)) {
    const candidates = [...locator.exact.values()].flat().filter((candidate) => [candidate.raw?.browseUrl, candidate.raw?.rawUrl, candidate.raw?.sourceUrl, candidate.raw?.source?.url].map(text).includes(target));
    return exactCandidateResult(candidates, 'exact-url');
  }
  const resolvedPath = target.startsWith('/') ? normPath(target) : resolveRelative(record.path, target);
  const hit = locator.exact.get(`${workspace.id}::${resolvedPath}`);
  return exactCandidateResult(hit || [], 'relative-path');
}

function exactCandidateResult(candidates, method) {
  if (candidates.length === 1) return { state: 'resolved', record: candidates[0], method };
  if (candidates.length > 1) return { state: 'ambiguous', candidates: candidates.map((candidate) => candidate.id) };
  return { state: 'unresolved', candidates: [] };
}

function resolveRelative(currentPath, target) {
  const base = normPath(currentPath).split('/'); base.pop();
  for (const part of normPath(target).split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); } else base.push(part);
  }
  return base.join('/');
}

function field(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  return match?.[1]?.trim() || '';
}
function markdownTarget(value) { const match = text(value).match(/^\[[^\]]+\]\(([^)]+)\)$/); return match ? match[1].trim() : text(value); }
function splitIdentities(value) { if (Array.isArray(value)) return freeze(value.map(identityString).filter(Boolean)); return freeze(text(value).split(/[;,]/).map(identityString).filter(Boolean)); }
function identityString(value) { if (value && typeof value === 'object') return text(value.id || value.reference || value.target || value.label); return text(value); }
function safeAssetProjection(asset = {}) { return freeze({ id: text(asset.id || asset.path), path: normPath(asset.path || asset.id), mediaType: text(asset.mediaType || asset.type || ''), ownerArtifactPath: normPath(asset.ownerArtifactPath || ''), sha256: text(asset.sha256 || '') }); }
function compareHistorical(a, b) { const ta = Number.isFinite(a.historicalTimeMs) ? a.historicalTimeMs : Number.POSITIVE_INFINITY; const tb = Number.isFinite(b.historicalTimeMs) ? b.historicalTimeMs : Number.POSITIVE_INFINITY; return ta - tb || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); }
function normPath(value = '') { return text(value).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function token(value = '') { return text(value).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function text(value) { return String(value ?? '').trim(); }
function finding(severity, code, message, details = {}) { return freeze({ severity, code, message, details }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
