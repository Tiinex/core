import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';

export const PORTABLE_SOURCE_FRONTIER_SCHEMA_ID = 'tiinex.portable.source-frontier.v1';
export const PORTABLE_SOURCE_FRONTIER_COMPARISON_SCHEMA_ID = 'tiinex.portable.source-frontier-comparison.v1';
export const PORTABLE_SOURCE_FRONTIER_SUMMARY_SCHEMA_ID = 'tiinex.portable.source-frontier-comparison-summary.v1';

const QUALIFIED = 'qualified';
const WORKSPACE_NONQUALIFIED_STATES = new Set(['locked', 'unavailable', 'qualification-error']);

/**
 * Normalize already-selected exact Workspace source into the host-neutral comparison model.
 * This function performs no filesystem/archive discovery and grants no semantic authority.
 */
export function createPortableSourceFrontier(input = {}) {
  const findings = [...(input.findings || [])];
  const workspaces = [];
  const seen = new Set();
  for (const raw of input.workspaces || []) {
    const workspaceId = String(raw?.workspaceId || raw?.id || '').trim();
    if (!workspaceId) {
      findings.push(portableFinding('error', 'portable.source-frontier.workspace-id.required', 'Every normalized source-frontier Workspace requires an explicit Workspace id.'));
      continue;
    }
    if (seen.has(workspaceId)) {
      findings.push(portableFinding('error', 'portable.source-frontier.workspace-id.duplicate', 'Normalized source frontier contains a duplicate Workspace id.', { workspaceId }));
      continue;
    }
    seen.add(workspaceId);
    workspaces.push(normalizeWorkspace(raw, workspaceId, findings));
  }
  workspaces.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId));
  const explicitState = String(input.state || '').trim();
  const state = findings.some((item) => item?.severity === 'error')
    ? 'qualification-error'
    : explicitState === 'qualification-error'
      ? explicitState
      : 'qualified';
  const normalizedFindings = Object.freeze(findings.map((item) => Object.freeze({ ...item })));
  return deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_SCHEMA_ID,
    state,
    id: String(input.id || input.label || '').trim(),
    source: serializableSource(input.source || {}),
    workspaces: Object.freeze(workspaces),
    findings: normalizedFindings,
    findingSummary: summarizePortableFindings(normalizedFindings),
    boundary: String(input.boundary || 'Exact source-byte frontier only. Workspace/path equality does not establish semantic equivalence, authority, acceptance, or merge disposition.')
  });
}

export function createPortableWorkspaceSnapshot(entries = [], evidence = {}) {
  const findings = [];
  const normalized = normalizeEntries(entries, findings);
  if (findings.length) return deepFreeze({ state: 'qualification-error', entries: Object.freeze([]), findings: Object.freeze(findings) });
  const totalBytes = normalized.reduce((sum, entry) => sum + entry.bytes, 0);
  const fingerprint = snapshotFingerprint(normalized);
  return deepFreeze({
    state: QUALIFIED,
    entryCount: normalized.length,
    totalBytes,
    fingerprint,
    fingerprintMethod: 'sha256-path-bytes-sha256-v1',
    entries: Object.freeze(normalized),
    evidence: Object.freeze(serializableObject(evidence)),
    findings: Object.freeze([])
  });
}

/** Two-way exact source-frontier comparison. */
export function comparePortableSourceFrontiers(input = {}) {
  const left = ensureFrontier(input.left, 'left');
  const right = ensureFrontier(input.right, 'right');
  const findings = [...(left.findings || []), ...(right.findings || [])];
  if (left.state === 'qualification-error' || right.state === 'qualification-error') {
    findings.push(portableFinding('error', 'portable.source-frontier.compare.input-unqualified', 'Source-frontier comparison requires qualified normalized inputs; one or both input frontiers are unqualified.'));
  }
  const workspaces = compareWorkspaceUnion(left, right);
  const comparisonState = aggregatePairState(workspaces, findings);
  const normalizedFindings = Object.freeze(dedupeFindings(findings));
  const result = deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_COMPARISON_SCHEMA_ID,
    mode: 'two-way',
    status: normalizedFindings.some((item) => item.severity === 'error') ? 'blocked' : 'ready',
    state: comparisonState,
    inputs: Object.freeze({ left: frontierReceipt(left), right: frontierReceipt(right) }),
    workspaces: Object.freeze(workspaces),
    counts: pairCounts(workspaces),
    findings: normalizedFindings,
    findingSummary: summarizePortableFindings(normalizedFindings),
    operationBoundary: comparisonBoundary(),
    boundary: 'Read-only exact source comparison. Hash/path evidence is used only for byte-source reconciliation; no semantic diff, merge, source mutation, remote acquisition, acceptance, or authority is performed.'
  });
  return result;
}

/** Three-way base -> incoming/current reconciliation evidence without merge behavior. */
export function reconcilePortableSourceFrontiers(input = {}) {
  const base = ensureFrontier(input.base, 'base');
  const incoming = ensureFrontier(input.incoming, 'incoming');
  const current = ensureFrontier(input.current, 'current');
  const findings = [...(base.findings || []), ...(incoming.findings || []), ...(current.findings || [])];
  if ([base, incoming, current].some((frontier) => frontier.state === 'qualification-error')) {
    findings.push(portableFinding('error', 'portable.source-frontier.reconcile.input-unqualified', 'Three-way source-frontier reconciliation requires qualified normalized inputs.'));
  }
  const workspaces = reconcileWorkspaceUnion(base, incoming, current);
  const normalizedFindings = Object.freeze(dedupeFindings(findings));
  const result = deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_COMPARISON_SCHEMA_ID,
    mode: 'three-way',
    status: normalizedFindings.some((item) => item.severity === 'error') ? 'blocked' : 'ready',
    state: aggregateThreeWayState(workspaces, normalizedFindings),
    inputs: Object.freeze({ base: frontierReceipt(base), incoming: frontierReceipt(incoming), current: frontierReceipt(current) }),
    workspaces: Object.freeze(workspaces),
    counts: threeWayCounts(workspaces),
    findings: normalizedFindings,
    findingSummary: summarizePortableFindings(normalizedFindings),
    operationBoundary: comparisonBoundary(),
    boundary: 'Read-only three-way byte/path reconciliation evidence. Conflict candidates are exact source overlaps only; this result performs no merge and makes no semantic or acceptance decision.'
  });
  return result;
}

export function compareOrReconcilePortableSourceFrontiers(input = {}) {
  if (input.base || input.incoming || input.current) {
    if (!input.base || !input.incoming || !input.current) return blockedShape('three-way', 'portable.source-frontier.reconcile.inputs-required', 'Three-way reconciliation requires base, incoming, and current frontiers.');
    return reconcilePortableSourceFrontiers(input);
  }
  if (!input.left || !input.right) return blockedShape('two-way', 'portable.source-frontier.compare.inputs-required', 'Two-way comparison requires left and right frontiers.');
  return comparePortableSourceFrontiers(input);
}

/** Compact human/LLM projection; full machine receipt remains the source of path truth. */
export function projectPortableSourceFrontierComparisonSummary(result = {}, options = {}) {
  const maxPaths = positiveInteger(options.maxPaths, 20);
  const workspaces = (result.workspaces || []).map((workspace) => projectWorkspaceSummary(workspace, maxPaths));
  return deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_SUMMARY_SCHEMA_ID,
    resultSchema: String(result.schema || ''),
    mode: String(result.mode || ''),
    status: String(result.status || ''),
    state: String(result.state || ''),
    inputs: result.inputs ? deepFreeze(Object.fromEntries(Object.entries(result.inputs).map(([key, value]) => [key, projectFrontierSummary(value)]))) : null,
    workspaces: Object.freeze(workspaces),
    counts: result.counts ? Object.freeze({ ...result.counts }) : null,
    findingSummary: result.findingSummary || summarizePortableFindings(result.findings || []),
    actionableFindings: Object.freeze((result.findings || []).filter((item) => item.severity === 'error' || item.severity === 'warning').slice(0, 20).map((item) => Object.freeze({ ...item }))),
    fullReceiptAvailable: true,
    boundary: 'Compact projection only. Path lists are bounded here; use the full machine receipt for complete deterministic deltas and three-way classifications.'
  });
}

function normalizeWorkspace(raw, workspaceId, findings) {
  const requestedState = String(raw?.state || (raw?.snapshot ? QUALIFIED : '')).trim();
  if (WORKSPACE_NONQUALIFIED_STATES.has(requestedState)) {
    return deepFreeze({
      workspaceId,
      state: requestedState,
      qualification: String(raw?.qualification || requestedState),
      reason: String(raw?.reason || ''),
      source: serializableSource(raw?.source || {}),
      snapshot: null
    });
  }
  const snapshot = raw?.snapshot?.state === QUALIFIED && Array.isArray(raw.snapshot.entries)
    ? createPortableWorkspaceSnapshot(raw.snapshot.entries, raw.snapshot.evidence || raw.evidence || {})
    : createPortableWorkspaceSnapshot(raw?.entries || [], raw?.evidence || {});
  if (snapshot.state !== QUALIFIED) {
    findings.push(...(snapshot.findings || []));
    return deepFreeze({ workspaceId, state: 'qualification-error', qualification: 'unqualified-snapshot', reason: 'snapshot-unqualified', source: serializableSource(raw?.source || {}), snapshot: null });
  }
  return deepFreeze({
    workspaceId,
    state: QUALIFIED,
    qualification: String(raw?.qualification || 'qualified-exact-source'),
    source: serializableSource(raw?.source || {}),
    snapshot
  });
}

function normalizeEntries(entries, findings) {
  const out = [];
  const seen = new Set();
  for (const raw of entries || []) {
    const rawPath = String(raw?.path || raw?.innerPath || '').trim();
    const path = normalizePath(rawPath);
    if (unsafeRawPath(rawPath) || !path || unsafePath(path)) {
      findings.push(portableFinding('error', 'portable.source-frontier.entry.path-invalid', 'Comparable source entry has an unsafe or empty Workspace-relative path.', { path: rawPath }));
      continue;
    }
    if (seen.has(path)) {
      findings.push(portableFinding('error', 'portable.source-frontier.entry.path-duplicate', 'Comparable source snapshot contains a duplicate normalized path.', { path }));
      continue;
    }
    seen.add(path);
    const bytes = Number(raw?.bytes ?? raw?.size ?? 0);
    const sha256 = String(raw?.sha256 || '').toLowerCase();
    if (!Number.isSafeInteger(bytes) || bytes < 0 || !/^[0-9a-f]{64}$/.test(sha256)) {
      findings.push(portableFinding('error', 'portable.source-frontier.entry.identity-invalid', 'Comparable source entry requires exact non-negative byte size and SHA-256 evidence.', { path, bytes: raw?.bytes ?? raw?.size ?? null, sha256: String(raw?.sha256 || '') }));
      continue;
    }
    out.push(Object.freeze({ path, bytes, sha256 }));
  }
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

function compareWorkspaceUnion(left, right) {
  const leftById = workspaceMap(left);
  const rightById = workspaceMap(right);
  const ids = [...new Set([...leftById.keys(), ...rightById.keys()])].sort();
  return ids.map((workspaceId) => compareWorkspace(workspaceId, leftById.get(workspaceId), rightById.get(workspaceId)));
}

function compareWorkspace(workspaceId, left, right) {
  if (!left) return deepFreeze({ workspaceId, state: 'only-right', left: null, right: workspaceSide(right), delta: null });
  if (!right) return deepFreeze({ workspaceId, state: 'only-left', left: workspaceSide(left), right: null, delta: null });
  const precedence = exceptionalPairState(left.state, right.state);
  if (precedence) return deepFreeze({ workspaceId, state: precedence, left: workspaceSide(left, { opaque: precedence === 'locked' }), right: workspaceSide(right, { opaque: precedence === 'locked' }), delta: null });
  const leftSnapshot = left.snapshot;
  const rightSnapshot = right.snapshot;
  if (sameSnapshot(leftSnapshot, rightSnapshot)) {
    return deepFreeze({ workspaceId, state: 'exact', left: workspaceSide(left), right: workspaceSide(right), delta: Object.freeze({ added: Object.freeze([]), removed: Object.freeze([]), byteChanged: Object.freeze([]), counts: Object.freeze({ added: 0, removed: 0, byteChanged: 0, total: 0 }), basis: 'qualified-snapshot-fingerprint-fast-path' }) });
  }
  const delta = snapshotDelta(leftSnapshot, rightSnapshot);
  return deepFreeze({ workspaceId, state: delta.counts.total ? 'changed' : 'exact', left: workspaceSide(left), right: workspaceSide(right), delta });
}

function snapshotDelta(left, right) {
  const leftMap = entryMap(left);
  const rightMap = entryMap(right);
  const added = [];
  const removed = [];
  const byteChanged = [];
  for (const path of [...new Set([...leftMap.keys(), ...rightMap.keys()])].sort()) {
    const l = leftMap.get(path);
    const r = rightMap.get(path);
    if (!l) added.push(entryIdentity(r));
    else if (!r) removed.push(entryIdentity(l));
    else if (!sameEntry(l, r)) byteChanged.push(Object.freeze({ path, left: entryIdentity(l), right: entryIdentity(r) }));
  }
  return deepFreeze({
    added: Object.freeze(added),
    removed: Object.freeze(removed),
    byteChanged: Object.freeze(byteChanged),
    counts: Object.freeze({ added: added.length, removed: removed.length, byteChanged: byteChanged.length, total: added.length + removed.length + byteChanged.length }),
    basis: 'workspace-relative-path-plus-qualified-byte-size-and-sha256'
  });
}

function reconcileWorkspaceUnion(base, incoming, current) {
  const baseById = workspaceMap(base);
  const incomingById = workspaceMap(incoming);
  const currentById = workspaceMap(current);
  const ids = [...new Set([...baseById.keys(), ...incomingById.keys(), ...currentById.keys()])].sort();
  return ids.map((workspaceId) => reconcileWorkspace(workspaceId, baseById.get(workspaceId), incomingById.get(workspaceId), currentById.get(workspaceId)));
}

function reconcileWorkspace(workspaceId, base, incoming, current) {
  const sides = { base, incoming, current };
  const present = Object.values(sides).filter(Boolean);
  if (present.length !== 3) {
    const missing = Object.entries(sides).filter(([, value]) => !value).map(([key]) => key);
    return deepFreeze({ workspaceId, state: 'unavailable', base: workspaceSide(base), incoming: workspaceSide(incoming), current: workspaceSide(current), missing: Object.freeze(missing), paths: Object.freeze([]), counts: emptyThreeWayCounts() });
  }
  const exceptional = exceptionalThreeWayState(base.state, incoming.state, current.state);
  if (exceptional) return deepFreeze({ workspaceId, state: exceptional, base: workspaceSide(base, { opaque: exceptional === 'locked' }), incoming: workspaceSide(incoming, { opaque: exceptional === 'locked' }), current: workspaceSide(current, { opaque: exceptional === 'locked' }), paths: Object.freeze([]), counts: emptyThreeWayCounts() });

  const baseMap = entryMap(base.snapshot);
  const incomingMap = entryMap(incoming.snapshot);
  const currentMap = entryMap(current.snapshot);
  const paths = [];
  const counts = { incomingOnly: 0, currentOnly: 0, sameResultConcurrent: 0, conflictCandidate: 0, total: 0 };
  for (const path of [...new Set([...baseMap.keys(), ...incomingMap.keys(), ...currentMap.keys()])].sort()) {
    const b = baseMap.get(path) || null;
    const i = incomingMap.get(path) || null;
    const c = currentMap.get(path) || null;
    const incomingChanged = !sameOptionalEntry(b, i);
    const currentChanged = !sameOptionalEntry(b, c);
    if (!incomingChanged && !currentChanged) continue;
    let classification;
    if (incomingChanged && !currentChanged) classification = 'incoming-only';
    else if (!incomingChanged && currentChanged) classification = 'current-only';
    else if (sameOptionalEntry(i, c)) classification = 'same-result-concurrent';
    else classification = 'conflict-candidate';
    if (classification === 'incoming-only') counts.incomingOnly += 1;
    else if (classification === 'current-only') counts.currentOnly += 1;
    else if (classification === 'same-result-concurrent') counts.sameResultConcurrent += 1;
    else counts.conflictCandidate += 1;
    counts.total += 1;
    paths.push(deepFreeze({
      path,
      classification,
      base: optionalEntryIdentity(b),
      incoming: optionalEntryIdentity(i),
      current: optionalEntryIdentity(c),
      incomingChange: changeKind(b, i),
      currentChange: changeKind(b, c)
    }));
  }
  return deepFreeze({
    workspaceId,
    state: paths.length ? (counts.conflictCandidate ? 'conflict-candidate' : 'changed') : 'exact',
    base: workspaceSide(base), incoming: workspaceSide(incoming), current: workspaceSide(current),
    paths: Object.freeze(paths), counts: Object.freeze(counts),
    basis: 'base-relative-qualified-path-byte-sha256-classification-v1'
  });
}

function exceptionalPairState(leftState, rightState) {
  const states = [leftState, rightState];
  if (states.includes('qualification-error')) return 'qualification-error';
  if (states.includes('locked')) return 'locked';
  if (states.includes('unavailable')) return 'unavailable';
  if (states.some((state) => state !== QUALIFIED)) return 'qualification-error';
  return '';
}

function exceptionalThreeWayState(...states) {
  if (states.includes('qualification-error')) return 'qualification-error';
  if (states.includes('locked')) return 'locked';
  if (states.includes('unavailable')) return 'unavailable';
  if (states.some((state) => state !== QUALIFIED)) return 'qualification-error';
  return '';
}

function aggregatePairState(workspaces, findings) {
  if (findings.some((item) => item.severity === 'error') || workspaces.some((item) => item.state === 'qualification-error')) return 'qualification-error';
  const states = new Set(workspaces.map((item) => item.state));
  if (!workspaces.length) return 'exact';
  if (states.size === 1) return workspaces[0].state;
  if ([...states].some((state) => state === 'changed' || state === 'only-left' || state === 'only-right')) return states.has('locked') || states.has('unavailable') ? 'mixed' : 'changed';
  if (states.has('locked') || states.has('unavailable')) return 'mixed';
  return 'mixed';
}

function aggregateThreeWayState(workspaces, findings) {
  if (findings.some((item) => item.severity === 'error') || workspaces.some((item) => item.state === 'qualification-error')) return 'qualification-error';
  if (workspaces.some((item) => item.state === 'conflict-candidate')) return 'conflict-candidate';
  if (workspaces.some((item) => item.state === 'changed')) return workspaces.some((item) => item.state === 'locked' || item.state === 'unavailable') ? 'mixed' : 'changed';
  if (workspaces.some((item) => item.state === 'locked' || item.state === 'unavailable')) return 'mixed';
  return 'exact';
}

function pairCounts(workspaces) {
  const counts = { exact: 0, changed: 0, onlyLeft: 0, onlyRight: 0, locked: 0, unavailable: 0, qualificationError: 0, workspaces: workspaces.length, pathChanges: 0 };
  for (const workspace of workspaces) {
    if (workspace.state === 'exact') counts.exact += 1;
    else if (workspace.state === 'changed') counts.changed += 1;
    else if (workspace.state === 'only-left') counts.onlyLeft += 1;
    else if (workspace.state === 'only-right') counts.onlyRight += 1;
    else if (workspace.state === 'locked') counts.locked += 1;
    else if (workspace.state === 'unavailable') counts.unavailable += 1;
    else if (workspace.state === 'qualification-error') counts.qualificationError += 1;
    counts.pathChanges += Number(workspace.delta?.counts?.total || 0);
  }
  return Object.freeze(counts);
}

function threeWayCounts(workspaces) {
  const counts = { workspaces: workspaces.length, exact: 0, changed: 0, conflictCandidateWorkspaces: 0, locked: 0, unavailable: 0, qualificationError: 0, incomingOnly: 0, currentOnly: 0, sameResultConcurrent: 0, conflictCandidate: 0, pathChanges: 0 };
  for (const workspace of workspaces) {
    if (workspace.state === 'exact') counts.exact += 1;
    else if (workspace.state === 'changed') counts.changed += 1;
    else if (workspace.state === 'conflict-candidate') counts.conflictCandidateWorkspaces += 1;
    else if (workspace.state === 'locked') counts.locked += 1;
    else if (workspace.state === 'unavailable') counts.unavailable += 1;
    else if (workspace.state === 'qualification-error') counts.qualificationError += 1;
    for (const key of ['incomingOnly', 'currentOnly', 'sameResultConcurrent', 'conflictCandidate']) counts[key] += Number(workspace.counts?.[key] || 0);
    counts.pathChanges += Number(workspace.counts?.total || 0);
  }
  return Object.freeze(counts);
}

function projectFrontierSummary(frontier = {}) {
  return deepFreeze({
    state: String(frontier.state || ''),
    id: String(frontier.id || ''),
    source: serializableSource(frontier.source || {}),
    workspaces: Object.freeze((frontier.workspaces || []).map((workspace) => Object.freeze({
      workspaceId: String(workspace.workspaceId || ''),
      state: String(workspace.state || ''),
      qualification: String(workspace.qualification || ''),
      ...(workspace.snapshot ? { snapshot: Object.freeze({ entryCount: Number(workspace.snapshot.entryCount || 0), totalBytes: Number(workspace.snapshot.totalBytes || 0), fingerprint: String(workspace.snapshot.fingerprint || '') }) } : {})
    })))
  });
}

function projectWorkspaceSummary(workspace, maxPaths) {
  if (workspace.delta) {
    const added = workspace.delta.added || [];
    const removed = workspace.delta.removed || [];
    const changed = workspace.delta.byteChanged || [];
    return deepFreeze({
      workspaceId: workspace.workspaceId,
      state: workspace.state,
      delta: Object.freeze({
        counts: workspace.delta.counts,
        added: Object.freeze(added.slice(0, maxPaths).map((item) => item.path)),
        removed: Object.freeze(removed.slice(0, maxPaths).map((item) => item.path)),
        byteChanged: Object.freeze(changed.slice(0, maxPaths).map((item) => item.path)),
        omitted: Math.max(0, added.length - maxPaths) + Math.max(0, removed.length - maxPaths) + Math.max(0, changed.length - maxPaths)
      })
    });
  }
  if (Array.isArray(workspace.paths)) {
    return deepFreeze({
      workspaceId: workspace.workspaceId,
      state: workspace.state,
      counts: workspace.counts || null,
      paths: Object.freeze(workspace.paths.slice(0, maxPaths).map((item) => Object.freeze({ path: item.path, classification: item.classification, incomingChange: item.incomingChange, currentChange: item.currentChange }))),
      pathsOmitted: Math.max(0, workspace.paths.length - maxPaths)
    });
  }
  return deepFreeze({ workspaceId: workspace.workspaceId, state: workspace.state });
}

function frontierReceipt(frontier) {
  return deepFreeze({
    schema: frontier.schema,
    state: frontier.state,
    id: frontier.id,
    source: serializableSource(frontier.source || {}),
    workspaces: Object.freeze((frontier.workspaces || []).map((workspace) => Object.freeze({
      workspaceId: workspace.workspaceId,
      state: workspace.state,
      qualification: workspace.qualification,
      ...(workspace.state === QUALIFIED ? { snapshot: snapshotReceipt(workspace.snapshot) } : {}),
      ...(workspace.reason ? { reason: workspace.reason } : {})
    })))
  });
}

function snapshotReceipt(snapshot) {
  return Object.freeze({ state: snapshot.state, entryCount: snapshot.entryCount, totalBytes: snapshot.totalBytes, fingerprint: snapshot.fingerprint, fingerprintMethod: snapshot.fingerprintMethod, evidence: Object.freeze(serializableObject(snapshot.evidence || {})) });
}

function workspaceSide(workspace, options = {}) {
  if (!workspace) return null;
  return deepFreeze({
    state: workspace.state,
    qualification: workspace.qualification,
    source: serializableSource(workspace.source || {}),
    ...(!options.opaque && workspace.state === QUALIFIED ? { snapshot: snapshotReceipt(workspace.snapshot) } : {}),
    ...(workspace.reason ? { reason: workspace.reason } : {})
  });
}

function ensureFrontier(frontier, label) {
  if (frontier?.schema === PORTABLE_SOURCE_FRONTIER_SCHEMA_ID && Array.isArray(frontier.workspaces)) return createPortableSourceFrontier(frontier);
  return createPortableSourceFrontier({
    id: label,
    state: 'qualification-error',
    source: { kind: 'unavailable' },
    workspaces: [],
    findings: [portableFinding('error', 'portable.source-frontier.input.invalid', 'Comparison input is not a normalized source frontier.', { side: label })]
  });
}

function blockedShape(mode, code, message) {
  const findings = Object.freeze([portableFinding('error', code, message)]);
  return deepFreeze({ schema: PORTABLE_SOURCE_FRONTIER_COMPARISON_SCHEMA_ID, mode, status: 'blocked', state: 'qualification-error', inputs: Object.freeze({}), workspaces: Object.freeze([]), counts: Object.freeze({ workspaces: 0 }), findings, findingSummary: summarizePortableFindings(findings), operationBoundary: comparisonBoundary(), boundary: 'Comparison did not run because required explicit frontier inputs were absent.' });
}

function snapshotFingerprint(entries) {
  const stable = JSON.stringify(entries.map((entry) => [entry.path, entry.bytes, entry.sha256]));
  return sha256Hex(utf8Bytes(stable));
}

function sameSnapshot(left, right) {
  return Boolean(left && right && left.state === QUALIFIED && right.state === QUALIFIED && left.entryCount === right.entryCount && left.totalBytes === right.totalBytes && left.fingerprint && left.fingerprint === right.fingerprint);
}

function entryMap(snapshot) { return new Map((snapshot?.entries || []).map((entry) => [entry.path, entry])); }
function workspaceMap(frontier) { return new Map((frontier?.workspaces || []).map((workspace) => [workspace.workspaceId, workspace])); }
function sameEntry(left, right) { return Boolean(left && right && left.bytes === right.bytes && left.sha256 === right.sha256); }
function sameOptionalEntry(left, right) { return !left && !right ? true : Boolean(left && right && sameEntry(left, right)); }
function entryIdentity(entry) { return Object.freeze({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256 }); }
function optionalEntryIdentity(entry) { return entry ? Object.freeze({ state: 'present', bytes: entry.bytes, sha256: entry.sha256 }) : Object.freeze({ state: 'absent' }); }
function changeKind(base, value) { if (sameOptionalEntry(base, value)) return 'unchanged'; if (!base && value) return 'added'; if (base && !value) return 'removed'; return 'byte-changed'; }
function emptyThreeWayCounts() { return Object.freeze({ incomingOnly: 0, currentOnly: 0, sameResultConcurrent: 0, conflictCandidate: 0, total: 0 }); }

function normalizePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, ''); }
function unsafeRawPath(value = '') { const raw=String(value||'').trim(); return !raw || /^[\\/]/.test(raw) || /^[A-Za-z]:[\\/]/.test(raw) || raw.includes('\u0000') || /[\\/]$/.test(raw); }
function unsafePath(value = '') { return !value || value.includes('\u0000') || value.endsWith('/') || value.split('/').some((part) => !part || part === '.' || part === '..'); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function comparisonBoundary() { return Object.freeze({ readOnly: true, sourceMutation: false, remoteFetch: false, merge: false, semanticDiff: false, authorityInference: false, acceptanceInference: false }); }
function serializableSource(value = {}) { return Object.freeze(serializableObject(value)); }
function serializableObject(value) {
  if (Array.isArray(value)) return value.map(serializableObject);
  if (!value || typeof value !== 'object') return typeof value === 'undefined' || typeof value === 'function' ? null : value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return null;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'function' || typeof child === 'undefined' || ArrayBuffer.isView(child) || child instanceof ArrayBuffer) continue;
    out[key] = serializableObject(child);
  }
  return out;
}
function dedupeFindings(findings = []) { const seen = new Set(); const out = []; for (const item of findings) { const key = `${item?.severity || ''}\u0000${item?.code || ''}\u0000${item?.message || ''}\u0000${item?.workspaceId || ''}\u0000${item?.path || ''}`; if (seen.has(key)) continue; seen.add(key); out.push(Object.freeze({ ...item })); } return out; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
