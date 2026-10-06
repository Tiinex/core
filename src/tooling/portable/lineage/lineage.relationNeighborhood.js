import path from 'node:path';
import { runAudit } from '../../../audit/audit.run.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding } from '../findings.js';
import { portableRuntimeValidationContractForSchema } from '../schema/qualifiedLocalRoot.runtime.js';

export const PORTABLE_LINEAGE_RELATION_NEIGHBORHOOD_SCHEMA_ID = 'tiinex.portable.lineage-relation-neighborhood.v1';
const RELATION_SCHEMA = 'tiinex.relation.v1';
const HANDOFF_SCHEMA = 'tiinex.handoff.v1';
const TASK_SCHEMA = 'tiinex.task.v1';
const NEGATIVE_KINDS = Object.freeze(['successor', 'return', 'supersession', 'dependency']);

export function projectPortableLineageRelationNeighborhood(input = {}) {
  const directWorkspaceRecords = Array.isArray(input.records) && input.records.some((record) => String(record?.workspaceId || '').trim());
  const material = directWorkspaceRecords
    ? { records: input.records, findings: Array.isArray(input.findings) ? input.findings : [] }
    : normalizePortableInput(input.materials || input);
  const records = material.records || [];
  const coverage = normalizeCoverage(input.representationCoverage || input.coverage);
  const findings = [...(material.findings || [])];
  const qualifications = new Map(records.map((record) => [recordKey(record), qualifyRecord(record)]));
  const edges = [];

  for (const record of records) {
    edges.push(...parentEdges(record, records, qualifications, findings));
    if (record.schemaId === RELATION_SCHEMA) edges.push(...relationEdges(record, records, qualifications, findings));
    if (record.schemaId === HANDOFF_SCHEMA) edges.push(...handoffEdges(record, records, qualifications, findings));
    if (record.schemaId === TASK_SCHEMA) edges.push(...dependencyEdges(record, records, qualifications, findings));
  }
  edges.push(...currentnessEdges(input.currentness || input.facts?.currentness || [], records, qualifications, findings));

  const requestedFocus = normalizeList(input.focus || input.focuses || input.controllingArtifact || input.target);
  const focusResolution = resolveFocuses(requestedFocus, records);
  findings.push(...focusResolution.findings);
  const depth = boundedDepth(input.depth);
  const neighborhood = selectNeighborhood(records, edges, focusResolution.resolved, depth);
  const included = neighborhood.records;
  const selectedEdges = neighborhood.edges;
  findings.push(...edgeResolutionFindings(selectedEdges));
  const categories = edgeCategories(selectedEdges, focusResolution.resolved);
  const negativeEvidence = Object.freeze(NEGATIVE_KINDS.map((kind) => Object.freeze({
    kind,
    state: categories[kind] ? 'represented' : 'not-observed-in-loaded-representation',
    qualification: categories[kind]
      ? 'explicit-loaded-edge'
      : coverage === 'complete'
        ? 'qualified-only-within-loaded-representation'
        : 'scope-limited',
    boundary: categories[kind]
      ? 'At least one explicit loaded edge in this category touches the projected neighborhood.'
      : 'No matching explicit edge was observed in the loaded representation. This is never global absence or semantic supersession authority.'
  })));

  const unresolvedFocus = requestedFocus.length && focusResolution.resolved.length !== requestedFocus.length;
  const status = !records.length ? 'empty' : unresolvedFocus ? 'scope-unresolved' : 'ready';
  return Object.freeze({
    schema: PORTABLE_LINEAGE_RELATION_NEIGHBORHOOD_SCHEMA_ID,
    status,
    representationCoverage: coverage,
    focus: Object.freeze({
      requested: Object.freeze(requestedFocus),
      resolved: Object.freeze(focusResolution.resolved.map((record) => node(record, qualifications))),
      unresolved: Object.freeze(focusResolution.unresolved),
      ambiguous: Object.freeze(focusResolution.ambiguous)
    }),
    nodes: Object.freeze(included.map((record) => node(record, qualifications)).sort(compareNode)),
    edges: Object.freeze(selectedEdges.sort(compareEdge)),
    categories: Object.freeze(categories),
    negativeEvidence,
    summary: Object.freeze({
      loadedRecords: records.length,
      projectedNodes: included.length,
      projectedEdges: selectedEdges.length,
      focusRequested: requestedFocus.length,
      focusResolved: focusResolution.resolved.length,
      parent: selectedEdges.filter((edge) => edge.kind === 'parent').length,
      relationTarget: selectedEdges.filter((edge) => edge.kind === 'relation-target').length,
      handoffControllingArtifact: selectedEdges.filter((edge) => edge.kind === 'handoff-controlling-artifact').length,
      handoffRequiredContext: selectedEdges.filter((edge) => edge.kind === 'handoff-required-context').length,
      dependency: selectedEdges.filter((edge) => edge.semanticCategory === 'dependency').length,
      return: selectedEdges.filter((edge) => edge.semanticCategory === 'return').length,
      successor: selectedEdges.filter((edge) => edge.semanticCategory === 'successor').length,
      supersession: selectedEdges.filter((edge) => edge.semanticCategory === 'supersession').length,
      unresolvedTargets: selectedEdges.filter((edge) => edge.resolution.state !== 'resolved').length
    }),
    findings: Object.freeze(findings),
    boundary: Object.freeze({
      loadedMaterialOnly: true,
      representationCoverage: coverage,
      remoteFetch: false,
      sourceMutation: false,
      currentWorkSelection: false,
      semanticWinnerSelection: 'forbidden',
      chronologyAuthority: false,
      filenameAuthority: false,
      lexicalStatusAuthority: false,
      negativeEvidence: 'loaded-representation-only',
      meaning: 'Projects explicit Parent, Relation-target, Handoff controlling/context, Task dependency, and invocation-provided qualified supersession edges without selecting a governing continuation. Missing edges remain bounded to the loaded representation.'
    })
  });
}

function parentEdges(record, records, qualifications, findings) {
  if (!record.trace) return [];
  const resolution = resolveReference(record.trace, record, records, { sameWorkspaceByDefault: true });
  return [edge({
    kind: 'parent',
    semanticCategory: 'parent',
    source: resolution.record || null,
    target: record,
    declaredBy: record,
    reference: record.trace,
    resolution,
    qualifications,
    findings
  })];
}

function relationEdges(record, records, qualifications, findings) {
  const declaration = relationDeclaration(record.markdown);
  const category = classifyDeclaredRelation(declaration.type);
  return relationTargetReferences(record.markdown).map((reference) => {
    const resolution = resolveReference(reference.value, record, records, { sameWorkspaceByDefault: true });
    return edge({
      kind: 'relation-target',
      semanticCategory: category,
      source: record,
      target: resolution.record || null,
      declaredBy: record,
      reference: reference.value,
      resolution,
      qualifications,
      findings,
      declaration
    });
  });
}

function handoffEdges(record, records, qualifications, findings) {
  const out = [];
  for (const reference of handoffFieldReferences(record.markdown, 'Controlling Artifact')) {
    const resolution = resolveReference(reference.value, record, records, { sameWorkspaceByDefault: true });
    out.push(edge({ kind: 'handoff-controlling-artifact', semanticCategory: 'control', source: record, target: resolution.record || null, declaredBy: record, reference: reference.value, resolution, qualifications, findings }));
  }
  for (const reference of handoffFieldReferences(record.markdown, 'Material Reference')) {
    const resolution = resolveReference(reference.value, record, records, { sameWorkspaceByDefault: true });
    out.push(edge({ kind: 'handoff-required-context', semanticCategory: classifyHandoffContext(reference.label), source: record, target: resolution.record || null, declaredBy: record, reference: reference.value, resolution, qualifications, findings }));
  }
  return out;
}

function dependencyEdges(record, records, qualifications, findings) {
  return sectionList(record.markdown, 'Dependencies').flatMap((item) => markdownReferences(item).map((reference) => {
    const resolution = resolveReference(reference.value, record, records, { sameWorkspaceByDefault: true });
    return edge({ kind: 'task-dependency', semanticCategory: 'dependency', source: record, target: resolution.record || null, declaredBy: record, reference: reference.value, resolution, qualifications, findings });
  }));
}

function currentnessEdges(values, records, qualifications, findings) {
  const out = [];
  for (const value of Array.isArray(values) ? values : []) {
    const state = String(value?.state || '').trim().toLowerCase();
    const qualification = String(value?.qualification || value?.semanticState || '').trim().toLowerCase();
    const basis = value?.basis;
    const target = String(value?.target || value?.path || value?.id || '').trim();
    const successor = String(value?.supersededBy || value?.successor || '').trim();
    if (state !== 'superseded' || qualification !== 'qualified' || !target || !successor || !nonEmptyBasis(basis)) continue;
    const sourceResolution = resolveAbsoluteIdentity(target, records);
    const targetResolution = resolveAbsoluteIdentity(successor, records);
    const source = sourceResolution.record || null;
    const targetRecord = targetResolution.record || null;
    out.push(edge({
      kind: 'qualified-currentness-supersession',
      semanticCategory: 'supersession',
      source,
      target: targetRecord,
      declaredBy: source,
      reference: successor,
      resolution: targetResolution,
      qualifications,
      findings,
      declaration: { type: 'qualified supersession fact', direction: 'superseded artifact -> successor', scope: 'invocation-provided explicit currentness fact', family: 'currentness', basis }
    }));
  }
  return out;
}

function edge(input) {
  const from = input.source ? recordKey(input.source) : '';
  const to = input.target ? recordKey(input.target) : '';
  const declaring = input.declaredBy ? recordKey(input.declaredBy) : '';
  const sourceQualification = input.source ? input.qualifications.get(recordKey(input.source)) : null;
  const targetQualification = input.target ? input.qualifications.get(recordKey(input.target)) : null;
  const declaringQualification = input.declaredBy ? input.qualifications.get(recordKey(input.declaredBy)) : null;
  const resolution = input.resolution || unresolvedResolution(input.reference);
  return Object.freeze({
    id: `${input.kind}:${declaring || from || 'unknown'}->${to || `unresolved:${input.reference}`}`,
    kind: input.kind,
    semanticCategory: input.semanticCategory || 'other',
    from,
    to,
    declaredBy: declaring,
    reference: String(input.reference || ''),
    declaration: Object.freeze({
      type: String(input.declaration?.type || ''),
      direction: String(input.declaration?.direction || ''),
      scope: String(input.declaration?.scope || ''),
      family: String(input.declaration?.family || ''),
      ...(input.declaration?.basis ? { basis: input.declaration.basis } : {})
    }),
    resolution: Object.freeze({ state: resolution.state, reason: resolution.reason, candidates: Object.freeze(resolution.candidates || []) }),
    qualification: Object.freeze({
      declaring: declaringQualification?.state || (declaring ? 'not-evaluated' : 'not-applicable'),
      source: sourceQualification?.state || (from ? 'not-evaluated' : 'unresolved'),
      target: targetQualification?.state || (to ? 'not-evaluated' : 'unresolved')
    }),
    boundary: 'Explicit loaded relation/reference projection only. Edge presence does not establish current work, acceptance, completion, or semantic precedence.'
  });
}

function selectNeighborhood(records, edges, focuses, depth) {
  if (!focuses.length) return Object.freeze({ records: [...records], edges: [...edges] });
  const included = new Set(focuses.map(recordKey));
  const selectedEdges = new Set();
  let frontier = new Set(included);
  for (let level = 0; level < depth; level += 1) {
    const next = new Set();
    for (const item of edges) {
      if (!frontier.has(item.from) && !frontier.has(item.to) && !frontier.has(item.declaredBy)) continue;
      selectedEdges.add(item);
      for (const key of [item.from, item.to, item.declaredBy]) if (key && !included.has(key)) next.add(key);
    }
    for (const key of next) included.add(key);
    frontier = next;
    if (!frontier.size) break;
  }
  return Object.freeze({
    records: records.filter((record) => included.has(recordKey(record))),
    edges: edges.filter((item) => selectedEdges.has(item))
  });
}

function resolveFocuses(values, records) {
  const resolved = [];
  const unresolved = [];
  const ambiguous = [];
  const findings = [];
  for (const value of values) {
    const result = resolveAbsoluteIdentity(value, records);
    if (result.state === 'resolved') resolved.push(result.record);
    else if (result.state === 'ambiguous') {
      ambiguous.push(Object.freeze({ reference: value, candidates: Object.freeze(result.candidates) }));
      findings.push(portableFinding('warning', 'lineage.relation-neighborhood.focus.ambiguous', 'Requested focus matches multiple loaded artifacts; no winner was selected.', { ref: value }));
    } else {
      unresolved.push(value);
      findings.push(portableFinding('warning', 'lineage.relation-neighborhood.focus.unresolved', 'Requested focus is not present in the loaded material boundary.', { ref: value }));
    }
  }
  return { resolved: uniqueRecords(resolved), unresolved, ambiguous, findings };
}

function resolveAbsoluteIdentity(reference, records) {
  const parsed = parseTarget(reference, null);
  if (!parsed.resolvable) return unresolvedResolution(reference, 'not-an-exact-artifact-reference');
  return resolveParsedTarget(parsed, records, null);
}

function resolveReference(reference, sourceRecord, records, options = {}) {
  const parsed = parseTarget(reference, sourceRecord);
  if (!parsed.resolvable) return unresolvedResolution(reference, 'not-an-exact-artifact-reference');
  return resolveParsedTarget(parsed, records, options.sameWorkspaceByDefault ? sourceRecord : null);
}

function resolveParsedTarget(parsed, records, defaultWorkspaceRecord) {
  const workspace = parsed.workspaceId || String(defaultWorkspaceRecord?.workspaceId || '').trim();
  const candidates = records.filter((record) => {
    if (workspace && String(record.workspaceId || '').trim() !== workspace) return false;
    const keys = recordIdentityKeys(record);
    return keys.has(parsed.path) || keys.has(parsed.raw);
  });
  if (candidates.length === 1) return Object.freeze({ state: 'resolved', reason: 'unique-exact-loaded-identity', record: candidates[0], candidates: Object.freeze([recordKey(candidates[0])]) });
  if (candidates.length > 1) return Object.freeze({ state: 'ambiguous', reason: 'multiple-exact-loaded-identities', record: null, candidates: Object.freeze(candidates.map(recordKey).sort()) });
  return unresolvedResolution(parsed.raw, 'exact-target-not-loaded');
}

function parseTarget(value, sourceRecord) {
  const rawInput = String(value || '').trim();
  const link = rawInput.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  const raw = unquoteCode(link ? link[2] : rawInput).replace(/\\/g, '/').trim();
  if (!raw || /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(raw) || /[?#]/.test(raw)) return { raw, path: '', workspaceId: '', resolvable: false };
  const qualified = raw.match(/^([A-Za-z0-9._-]+)::(.+)$/);
  if (qualified) return { raw, workspaceId: qualified[1], path: normalizePath(qualified[2]), resolvable: Boolean(normalizePath(qualified[2])) };
  if (raw.startsWith('/')) return { raw, path: '', workspaceId: '', resolvable: false };
  const sourcePath = String(sourceRecord?.path || '').replace(/\\/g, '/');
  const base = sourcePath ? path.posix.dirname(sourcePath) : '';
  const workspaceRooted = raw.startsWith('.topics/');
  const resolved = sourceRecord && !workspaceRooted ? normalizePath(path.posix.normalize(path.posix.join(base, raw))) : normalizePath(raw);
  return { raw, workspaceId: '', path: resolved, resolvable: Boolean(resolved) };
}

function relationDeclaration(markdown = '') {
  const section = sectionText(markdown, 'Relation Declaration');
  return Object.freeze({
    type: field(section, 'Relation Type'),
    direction: field(section, 'Relation Direction'),
    scope: field(section, 'Relation Scope'),
    family: field(section, 'Relation Family')
  });
}

function relationTargetReferences(markdown = '') {
  const section = sectionText(markdown, 'Relation Target');
  const out = [];
  for (const line of section.split('\n')) {
    const match = line.match(/^\s*-\s*Target:\s*(.+?)\s*$/i);
    if (!match) continue;
    for (const ref of markdownReferences(match[1])) out.push(ref);
    if (!markdownReferences(match[1]).length) out.push({ label: '', value: unquoteCode(match[1]) });
  }
  return out;
}

function handoffFieldReferences(markdown = '', name = '') {
  const parsed = parseArtifactMarkdown(markdown || '');
  const body = String(parsed.body?.text || '');
  const re = new RegExp(`^\\s*-\\s*${escapeRegExp(name)}:\\s*(.+?)\\s*$`, 'gim');
  const out = [];
  for (const match of body.matchAll(re)) {
    const refs = markdownReferences(match[1]);
    if (refs.length) out.push(...refs);
    else out.push({ label: '', value: unquoteCode(match[1]) });
  }
  return out;
}

function markdownReferences(value = '') {
  const text = String(value || '').trim();
  const out = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const match of text.matchAll(re)) out.push(Object.freeze({ label: match[1].trim(), value: match[2].trim() }));
  return out;
}

function sectionText(markdown = '', heading = '') {
  const parsed = parseArtifactMarkdown(markdown || '');
  const lines = String(parsed.body?.text || '').split('\n');
  const wanted = String(heading || '').trim().toLowerCase();
  const start = lines.findIndex((line) => {
    const match = line.match(/^##\s+(.+?)\s*$/);
    return match && match[1].trim().toLowerCase() === wanted;
  });
  if (start < 0) return '';
  const out = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    out.push(lines[index]);
  }
  return out.join('\n').trim();
}

function sectionList(markdown = '', heading = '') {
  return sectionText(markdown, heading).split('\n').map((line) => line.trim()).filter((line) => /^[-*]\s+\S/.test(line)).map((line) => line.replace(/^[-*]\s+/, '').trim());
}

function field(section = '', name = '') {
  const match = String(section || '').match(new RegExp(`^\\s*-\\s*${escapeRegExp(name)}:\\s*(.+?)\\s*$`, 'im'));
  return match ? String(match[1] || '').trim() : '';
}

function classifyDeclaredRelation(type = '') {
  const value = String(type || '').trim().toLowerCase();
  if (!value) return 'other';
  if (/supersed/.test(value)) return 'supersession';
  if (/successor/.test(value)) return 'successor';
  if (/return|rework|re-entry|reentry/.test(value)) return 'return';
  if (/depend/.test(value)) return 'dependency';
  return 'other';
}

function classifyHandoffContext(label = '') {
  const value = String(label || '').trim().toLowerCase();
  if (/prior|preced|successor|continuation|frontier/.test(value)) return 'continuity-context';
  if (/depend/.test(value)) return 'dependency';
  return 'context';
}

function edgeResolutionFindings(edges) {
  const findings = [];
  for (const item of edges) {
    if (item.resolution.state === 'ambiguous') findings.push(portableFinding('warning', 'lineage.relation-neighborhood.target.ambiguous', 'An explicit neighborhood reference matches multiple loaded artifacts; no target was selected.', { ref: item.reference }));
    if (item.resolution.state === 'unresolved') findings.push(portableFinding('info', 'lineage.relation-neighborhood.target.unresolved', 'An explicit neighborhood reference is not resolved inside the projected loaded-material neighborhood.', { ref: item.reference }));
  }
  return findings;
}

function edgeCategories(edges, focusRecords) {
  const focusKeys = new Set(focusRecords.map(recordKey));
  const relevant = focusKeys.size ? edges.filter((edge) => focusKeys.has(edge.from) || focusKeys.has(edge.to) || focusKeys.has(edge.declaredBy)) : edges;
  return Object.freeze(Object.fromEntries(['parent', 'control', 'context', 'continuity-context', 'successor', 'return', 'supersession', 'dependency', 'other'].map((kind) => [kind, relevant.filter((edge) => edge.semanticCategory === kind).length])));
}

function node(record, qualifications) {
  return Object.freeze({
    id: recordKey(record),
    workspaceId: String(record.workspaceId || ''),
    path: String(record.path || ''),
    title: String(record.title || record.path || ''),
    schemaId: String(record.schemaId || ''),
    declaredStatus: String(record.lifecycleStatus || ''),
    qualification: qualifications.get(recordKey(record)) || Object.freeze({ state: 'not-evaluated' })
  });
}

function qualifyRecord(record = {}) {
  const runtimeProjection = portableRuntimeValidationContractForSchema(record.schemaId || '');
  const audit = runAudit({ record, markdown: record.markdown || '', validationContractOverride: runtimeProjection.state === 'qualified' ? runtimeProjection.compiledContract : null });
  const findings = Array.isArray(audit.findings) ? audit.findings : [];
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.filter((finding) => finding.severity === 'warning').length;
  const validatorUnavailable = findings.some((finding) => finding.code === 'audit.validator.unavailable');
  const fallbackUsed = Boolean(audit.resolution?.fallbackUsed || audit.artifact?.fallbackUsed);
  const state = errors ? 'blocked' : validatorUnavailable ? 'partial' : fallbackUsed ? 'fallback' : 'exact';
  return Object.freeze({ state, exact: state === 'exact', errors, warnings, hasContinuityContext: Boolean(record.hasContinuityContext), hasIntegrity: Boolean(record.hasIntegrity) });
}

function recordKey(record = {}) {
  const workspace = String(record.workspaceId || '').trim();
  const pathValue = normalizePath(record.path || record.id || '');
  return workspace ? `${workspace}::${pathValue}` : pathValue;
}

function recordIdentityKeys(record = {}) {
  const keys = new Set();
  for (const value of [record.path, record.id, record.source?.path]) {
    const normalized = normalizePath(value);
    if (normalized) keys.add(normalized);
  }
  return keys;
}

function normalizeCoverage(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ['complete', 'bounded', 'partial', 'unknown'].includes(normalized) ? normalized : 'unknown';
}
function normalizeList(value) { return [...new Set((Array.isArray(value) ? value : value ? [value] : []).map((item) => String(item || '').trim()).filter(Boolean))]; }
function boundedDepth(value) { const n = Number.parseInt(value, 10); return Number.isFinite(n) && n >= 0 ? Math.min(n, 6) : 1; }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '').trim(); }
function unquoteCode(value = '') { const text = String(value || '').trim(); return text.startsWith('`') && text.endsWith('`') ? text.slice(1, -1).trim() : text; }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
function unresolvedResolution(reference = '', reason = 'exact-target-not-loaded') { return Object.freeze({ state: 'unresolved', reason, record: null, candidates: Object.freeze([]), reference: String(reference || '') }); }
function uniqueRecords(records) { const map = new Map(); for (const record of records) map.set(recordKey(record), record); return [...map.values()]; }
function compareNode(a, b) { return a.id.localeCompare(b.id); }
function compareEdge(a, b) { return `${a.kind}|${a.from}|${a.to}|${a.reference}`.localeCompare(`${b.kind}|${b.from}|${b.to}|${b.reference}`); }
function escapeRegExp(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
