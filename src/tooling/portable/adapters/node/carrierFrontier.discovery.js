import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { loadNodePortableInput } from '../../input/node.input.js';
import { inspectHandoffPackageV1 } from '../../handoff/handoffPackageV1.inspect.js';
import { listHandoffWorkspaceEntries } from '../../handoff/workspaceByteProvider.js';
import { normalizePortableInput } from '../../input/portable.input.js';
import { projectPortableLineageOperativeState } from '../../lineage/lineage.operativeState.js';
import { projectPortableLineageRelationNeighborhood } from '../../lineage/lineage.relationNeighborhood.js';

export const CARRIER_FRONTIER_DISCOVERY_SCHEMA_ID = 'tiinex.portable.carrier-frontier-discovery.v1';

// A bounded, read-only composition of existing qualified carrier and lineage providers.
// An eligible topology leaf is NOT automatically an active/current work frontier.
export async function discoverCarrierFrontier(input = {}) {
  const carrier = String(input.carrier || input.package || '').trim();
  if (!carrier) return blocked('carrier-path-required');
  const scope = input.scope === undefined || input.scope === '' ? 'topics' : String(input.scope);
  if (scope !== 'topics' && scope !== 'all') return blocked('scope-invalid', 'Expected --scope topics|all.');
  const requestedLimit = input.limit === undefined || input.limit === '' ? 15 : Number(input.limit);
  if (input.full !== true && (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100)) return blocked('limit-invalid', 'Expected --limit integer from 1 to 100.');
  const limit = input.full === true ? Number.MAX_SAFE_INTEGER : requestedLimit;
  if (input.full === true && input.cursor) return blocked('cursor-with-full-invalid', 'Choose either --full or a cursor-paginated view.');
  const focus = String(input.focus || '').trim();
  const compareCarrier = String(input.compareCarrier || '').trim();
  let material;
  try {
    material = await loadNodePortableInput([resolve(carrier)], { maxFiles: 10000, maxTextBytes: 16 * 1024 * 1024 });
  } catch (error) {
    return blocked('carrier-read-failed', String(error?.message || error));
  }
  const inspection = inspectHandoffPackageV1(material);
  if (inspection.status !== 'valid' || (material.findings || []).some((finding) => finding.severity === 'error')) {
    return blocked('carrier-unqualified', '', inspection.findings || []);
  }
  const files = [];
  const workspaceCounts = [];
  for (const workspace of inspection.workspaces || []) {
    const workspaceId = String(workspace.workspaceId || '');
    const entries = listHandoffWorkspaceEntries(inspection.workspaceByteProvider, workspaceId);
    if (!workspaceId || workspace.bindingState !== 'verified') return blocked('workspace-binding-unqualified', workspaceId);
    let count = 0;
    for (const entry of entries) {
      const innerPath = String(entry.path || entry.innerPath || '');
      if (!innerPath.endsWith('.trace.md') && !innerPath.endsWith('.workspace.md')) continue;
      files.push({ path: `${workspaceId}/${innerPath}`, content: Buffer.from(entry.data).toString('utf8') });
      count++;
    }
    workspaceCounts.push({ id: workspaceId, records: count, coverage: 'complete-qualified-carried-snapshot' });
  }
  const parsed = normalizePortableInput({ files });
  const projection = projectPortableLineageOperativeState({ records: parsed.records, findings: parsed.findings });
  const recordsByPath = new Map(parsed.records.map((record) => [record.path, record]));
  const leafNodes = projection.nodes.filter((node) => node.topology.leaf);
  const candidates = leafNodes.filter((node) => scope === 'all' || node.path.includes('/.topics/'))
    .map((node) => {
      const record = recordsByPath.get(node.path) || {};
      const createdAt = String(record.currentCreatedAt || '');
      return {
        workspaceId: node.path.split('/')[0],
        path: node.path.substring(node.path.indexOf('/') + 1),
        title: node.title,
        createdAt,
        schemaId: node.schemaId,
        topology: node.topology.role,
        currentness: node.currentness.state,
        lifecycle: node.lifecycle.state,
        classification: 'topological-leaf-only',
        artifactKind: artifactKind(node.schemaId),
        focusArg: node.path
      };
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || left.workspaceId.localeCompare(right.workspaceId) || left.path.localeCompare(right.path));
  // A cursor is scoped to this exact ordered candidate projection, not merely a
  // filename or wall-clock time. A changed snapshot invalidates old cursors.
  const fingerprint = createHash('sha256').update(JSON.stringify({scope, candidates})).digest('hex');
  const requestedCursor = String(input.cursor || '').trim();
  const cursorState = requestedCursor ? decodeFrontierCursor(requestedCursor) : { offset: 0, fingerprint, scope };
  if (!cursorState || cursorState.scope !== scope || cursorState.fingerprint !== fingerprint
      || !Number.isSafeInteger(cursorState.offset) || cursorState.offset < 0 || (requestedCursor && cursorState.offset >= candidates.length)) {
    return blocked('cursor-invalid-or-stale', 'Cursor must come from this same qualified carrier and scope; restart at the first page after a change.');
  }
  const offset = cursorState.offset;
  const page = candidates.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  const nextCursor = nextOffset < candidates.length ? encodeFrontierCursor({ offset: nextOffset, scope, fingerprint }) : null;
  const latestCandidateByWorkspace = workspaceCounts.map((workspace) => {
    const latest = candidates.find((candidate) => candidate.workspaceId === workspace.id);
    return {
      workspaceId: workspace.id,
      latestCandidate: latest ? { ...latest } : null,
      meaning: latest ? 'latest-qualified-topological-candidate-in-scope' : 'no-topological-candidate-in-selected-scope'
    };
  });
  // Reuse the qualified Core relation projection instead of attempting to
  // infer a controlling Task or a semantic currentness winner from leaf order.
  const focusNeighborhood = focus ? projectPortableLineageRelationNeighborhood({
    records: parsed.records.map((record) => ({ ...record, workspaceId: String(record.path || '').split('/')[0] })),
    findings: parsed.findings,
    focus,
    depth: 2,
    representationCoverage: 'complete'
  }) : null;
  if (focusNeighborhood && focusNeighborhood.status !== 'ready') return blocked('focus-unresolved', focus, focusNeighborhood.findings || []);
  let carrierComparison = null;
  if (compareCarrier) {
    let other;
    try { other = await loadNodePortableInput([resolve(compareCarrier)], { maxFiles: 10000, maxTextBytes: 16 * 1024 * 1024 }); }
    catch (error) { return blocked('comparison-carrier-read-failed', String(error?.message || error)); }
    const otherInspection = inspectHandoffPackageV1(other);
    if (otherInspection.status !== 'valid' || (other.findings || []).some((finding) => finding.severity === 'error')) return blocked('comparison-carrier-unqualified', '', otherInspection.findings || []);
    carrierComparison = compareQualifiedWorkspaceSnapshots(inspection, otherInspection);
  }
  const mismatches = (projection.findings || []).filter((finding) => finding.code === 'lineage.parent.integrityMismatch');
  const materialFindings = (projection.findings || []).filter((finding) => finding.severity === 'error');
  // Relation-neighborhood projection and operative-state integrity findings are
  // independent. Surface matching global Parent mismatches for every focused
  // node instead of allowing an empty neighborhood.findings to imply integrity.
  const focusedNodePaths = new Set((focusNeighborhood?.nodes || []).map((node) => String(node.path || '')));
  const focusIntegrityFindings = focusNeighborhood ? mismatches.filter((finding) => focusedNodePaths.has(finding.nodeId))
    .map((finding) => ({ code: finding.code, nodeId: finding.nodeId, target: finding.target, severity: finding.severity,
      triage: 'requires-exact-parent-material-and-lineage-review; not automatically a current-work blocker' })) : null;
  return {
    schema: CARRIER_FRONTIER_DISCOVERY_SCHEMA_ID,
    status: mismatches.length || materialFindings.length ? 'ready-with-bounded-lineage-findings' : 'ready',
    scope,
    summary: {
      qualifiedWorkspaces: workspaceCounts.length,
      loadedRecords: parsed.records.length,
      topologicalLeaves: leafNodes.length,
      selectedTopologicalLeaves: candidates.length,
      unresolvedCurrentness: projection.summary.unresolvedCurrentness,
      parentIntegrityMismatches: mismatches.length,
      materialErrors: materialFindings.length,
      shown: page.length
    },
    workspaces: workspaceCounts,
    latestCandidateByWorkspace,
    feed: {
      ordering: 'declared-created-at-descending-then-workspace-and-path',
      total: candidates.length, offset, returned: page.length, hasMore: nextCursor !== null, nextCursor,
      candidateKindCounts: candidateKindCounts(candidates),
      visibleWorkspaceDistribution: workspaceDistribution(page),
      interpretation: 'The current page is not an activity rank or a complete view of all workspaces. latestCandidateByWorkspace gives separate coverage; --cursor retrieves later pages.'
    },
    focusNeighborhood,
    focusIntegrityFindings,
    carrierComparison,
    chronology: {
      createdAt: 'declared-artifact-Current.Created-At',
      modifiedAt: 'unavailable-without-a-qualified-version-or-source-comparison',
      semanticCurrentness: 'unresolved-unless-explicit-qualified-facts-are-supplied',
      boundary: 'A newer bootstrap, ZIP timestamp, or implementation source file does not backfill a trace last-modified timestamp.'
    },
    candidates: page,
    integrityFindings: mismatches.map((finding) => ({ code: finding.code, nodeId: finding.nodeId, target: finding.target, severity: finding.severity,
      triage: 'requires-exact-parent-material-and-lineage-review; not automatically a current-work blocker' })),
    boundaries: {
      carrier: 'qualified Package V1 and complete carried Workspace archive bindings only',
      source: 'read-only; no extraction of Workspace trees or remote access',
      ordering: 'declared Created At used for triage only; never semantic currentness; cursor pagination is snapshot-scoped',
      currentness: 'unresolved without separately qualified facts; use --focus <workspace/path> for qualified relation neighborhood before deciding controlling work',
      leaves: 'topological candidates, not active Tasks or controlling lineage; artifactKind is schema-based, not a currentness decision; latestCandidateByWorkspace provides coverage even when the global top-N omits a Workspace',
      findings: 'Global Parent mismatches and focusIntegrityFindings use the operative-state integrity projection; neighborhood.findings alone does not establish Parent integrity. This operation does not repair artifacts',
      comparison: 'When --compare-carrier is supplied, qualified snapshot byte deltas indicate differences between two received snapshots only; they are not last-modified timestamps, global missing-workspace proof or semantic supersession.'
    }
  };
}

function blocked(reason, detail = '', findings = []) {
  return { schema: CARRIER_FRONTIER_DISCOVERY_SCHEMA_ID, status: 'blocked', reason, detail, findings, boundaries: { remoteMutation: false, inferenceAuthority: false } };
}

// Direct comparison of two *independently qualified* carried Workspace snapshots.
// Never promote ZIP metadata/trace chronology to modification or currentness authority.
function compareQualifiedWorkspaceSnapshots(current, reference) {
  const currentMap = new Map((current.workspaces || []).map((ws) => [String(ws.workspaceId || ''), ws]));
  const referenceMap = new Map((reference.workspaces || []).map((ws) => [String(ws.workspaceId || ''), ws]));
  const ids = [...new Set([...currentMap.keys(), ...referenceMap.keys()])].filter(Boolean).sort();
  const workspaces = ids.map((id) => {
    const now = currentMap.get(id), before = referenceMap.get(id);
    const state = !before ? 'present-only-in-current' : !now ? 'present-only-in-reference' : now.archiveSha256 === before.archiveSha256 ? 'byte-identical' : 'changed-snapshot';
    const files = now && before && state === 'changed-snapshot'
      ? diffQualifiedWorkspaceEntries(current.workspaceByteProvider, reference.workspaceByteProvider, id)
      : null;
    return { workspaceId: id, state, files };
  });
  return {
    status: 'qualified-snapshot-comparison',
    currentWorkspaceCount: currentMap.size,
    referenceWorkspaceCount: referenceMap.size,
    workspaces,
    summary: {
      currentOnly: workspaces.filter((w) => w.state === 'present-only-in-current').length,
      referenceOnly: workspaces.filter((w) => w.state === 'present-only-in-reference').length,
      changed: workspaces.filter((w) => w.state === 'changed-snapshot').length,
      byteIdentical: workspaces.filter((w) => w.state === 'byte-identical').length
    },
    boundary: 'Pairwise qualified-carrier comparison, no inferred canonical universe, no deletion/rollback or last-modified authority.'
  };
}
function diffQualifiedWorkspaceEntries(currentProvider, referenceProvider, workspaceId) {
  const entryMap = (provider) => new Map(listHandoffWorkspaceEntries(provider, workspaceId)
    .map((entry) => [String(entry.path || entry.innerPath || ''), createHash('sha256').update(entry.data).digest('hex')]));
  const now = entryMap(currentProvider), before = entryMap(referenceProvider);
  const changed = [...new Set([...now.keys(), ...before.keys()])].sort().filter((path) => now.get(path) !== before.get(path));
  const changedSource = changed.filter((path) => !path.startsWith('.topics/'));
  return {
    changedCount: changed.length,
    changedSourceCount: changedSource.length,
    paths: changed.slice(0, 30).map((path) => ({ path, kind: !before.has(path) ? 'added' : !now.has(path) ? 'absent-from-current-snapshot' : 'byte-changed', surface: path.startsWith('.topics/') ? 'qualified-artifact-or-workspace' : 'source-material' })),
    omittedPaths: Math.max(0, changed.length - 30),
    boundary: 'Byte deltas between two qualified snapshots only; source modification time and semantic currentness are not derivable.'
  };
}

function artifactKind(schemaId = '') {
  const parts = String(schemaId).split('.');
  const value = parts[1] || 'unknown';
  return value === 'evidence' ? 'evidence' : value === 'task' ? 'task' :
    value === 'project' ? 'project' : value === 'reduction' ? 'reduction' :
    value === 'return' ? 'return' : value === 'decision' ? 'decision' :
    value === 'entry' ? 'entry' : value === 'handoff' ? 'handoff' : 'other';
}
function candidateKindCounts(candidates) {
  const counts = {};
  for (const candidate of candidates) counts[candidate.artifactKind] = (counts[candidate.artifactKind] || 0) + 1;
  return counts;
}
function workspaceDistribution(candidates) {
  const counts = {};
  for (const candidate of candidates) counts[candidate.workspaceId] = (counts[candidate.workspaceId] || 0) + 1;
  return counts;
}
function encodeFrontierCursor(value) {
  return Buffer.from(JSON.stringify({v:1, ...value}), 'utf8').toString('base64url');
}
function decodeFrontierCursor(token) {
  if (!/^[A-Za-z0-9_-]{1,1024}$/.test(token)) return null;
  try {
    const result = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    return result?.v === 1 && encodeFrontierCursor({ offset: result.offset, scope: result.scope, fingerprint: result.fingerprint }) === token ? result : null;
  } catch { return null; }
}
