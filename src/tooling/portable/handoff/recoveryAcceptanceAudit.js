import { comparePortableSourceFrontiers, createPortableSourceFrontier } from '../comparison/sourceFrontierComparison.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { handoffWorkspaceProviderForId, listHandoffWorkspaceEntries } from './workspaceByteProvider.js';

export const PORTABLE_RECOVERY_ACCEPTANCE_AUDIT_SCHEMA_ID = 'tiinex.portable.recovery-acceptance-audit.v1';

export function auditPortableRecoveryAcceptance(input = {}) {
  const basisInspection = inspectRecipientFacingV2Topology(input.basis?.bundle || input.basis || {});
  const candidateInspection = inspectRecipientFacingV2Topology(input.candidate?.bundle || input.candidate || {});
  const findings = [];
  if (String(basisInspection.status || '') !== 'valid') findings.push(finding('error', 'portable.recovery-acceptance.basis-unqualified', 'Recovery acceptance audit requires one independently qualified accepted-basis recipient-facing carrier. A qualified pointerless Workspace package is permitted; Handoff routing is not required for the accepted basis.'));
  if (String(candidateInspection.status || '') !== 'valid') findings.push(finding('error', 'portable.recovery-acceptance.candidate-unqualified', 'Recovery acceptance audit requires one independently qualified candidate recipient-facing carrier. Candidate restart suitability still requires complete selected Workspace coverage.'));
  if (findings.some((item) => item.severity === 'error')) return auditResult('blocked', [], findings, basisInspection, candidateInspection, input);

  const candidateIds = [...new Set((candidateInspection.workspaces || []).map((item) => normalizeId(item.workspaceId)).filter(Boolean))].sort();
  const requestedIds = [...new Set([...(input.workspaceIds || input.selectedWorkspaceIds || [])].map(normalizeId).filter(Boolean))].sort();
  const ids = requestedIds.length ? requestedIds : candidateIds;
  const expectedRemovals = normalizeExpectedRemovals(input.expectedRemovals || {});
  const workspaces = ids.map((workspaceId) => auditWorkspace({ workspaceId, basisInspection, candidateInspection, expectedRemovals, findings }));
  for (const workspaceId of requestedIds) if (!candidateIds.includes(workspaceId)) findings.push(finding('error', 'portable.recovery-acceptance.workspace-unresolved', 'Explicitly requested candidate Workspace is not present in the qualified candidate carrier.', { workspaceId }));
  const status = findings.some((item) => item.severity === 'error') || workspaces.some((item) => item.state !== 'ready') ? 'blocked' : 'ready';
  return auditResult(status, workspaces, findings, basisInspection, candidateInspection, input);
}

function auditWorkspace({ workspaceId, basisInspection, candidateInspection, expectedRemovals, findings }) {
  const basisProvider = handoffWorkspaceProviderForId(basisInspection.workspaceByteProvider, workspaceId);
  const candidateProvider = handoffWorkspaceProviderForId(candidateInspection.workspaceByteProvider, workspaceId);
  const candidateTopology = (candidateInspection.workspaces || []).find((item) => normalizeId(item.workspaceId) === workspaceId) || null;
  const basisTopology = (basisInspection.workspaces || []).find((item) => normalizeId(item.workspaceId) === workspaceId) || null;
  const reasons = [];
  if (basisProvider.state !== 'qualified') {
    reasons.push('basis-workspace-unqualified');
    findings.push(finding('error', 'portable.recovery-acceptance.basis-workspace-unqualified', 'Accepted-basis Workspace bytes are unavailable or unqualified.', { workspaceId, state: String(basisProvider.state || '') }));
  }
  if (candidateProvider.state !== 'qualified') {
    reasons.push('candidate-workspace-unqualified');
    findings.push(finding('error', 'portable.recovery-acceptance.candidate-workspace-unqualified', 'Candidate Workspace bytes are unavailable or unqualified.', { workspaceId, state: String(candidateProvider.state || '') }));
  }
  const coverage = String(candidateTopology?.coverage || '');
  if (coverage !== 'complete') {
    reasons.push('candidate-workspace-not-complete');
    findings.push(finding('error', 'portable.recovery-acceptance.candidate-workspace-not-complete', 'Master Recovery acceptance requires a complete candidate Workspace representation; bounded coverage cannot prove restart suitability.', { workspaceId, coverage }));
  }
  if (reasons.length) return freeze({ workspaceId, state: 'blocked', coverage, reasons: freeze(reasons), comparisonState: 'unavailable', counts: emptyCounts(), unexplainedRemovals: freeze([]), expectedRemovals: freeze([...expectedRemovals.get(workspaceId) || []]), materialization: materializationReceipt(candidateProvider, candidateTopology) });

  const basis = frontierForProvider(workspaceId, basisProvider, 'accepted-basis');
  const candidate = frontierForProvider(workspaceId, candidateProvider, 'candidate-recovery');
  const comparison = comparePortableSourceFrontiers({ left: basis, right: candidate });
  const workspace = (comparison.workspaces || []).find((item) => normalizeId(item.workspaceId) === workspaceId) || null;
  if (comparison.status !== 'ready' || !workspace || !workspace.delta) {
    reasons.push('workspace-comparison-unqualified');
    findings.push(finding('error', 'portable.recovery-acceptance.workspace-comparison-unqualified', 'Accepted-basis to candidate Workspace comparison did not qualify.', { workspaceId, state: String(workspace?.state || comparison.state || '') }));
    return freeze({ workspaceId, state: 'blocked', coverage, reasons: freeze(reasons), comparisonState: String(workspace?.state || comparison.state || ''), counts: emptyCounts(), unexplainedRemovals: freeze([]), expectedRemovals: freeze([...expectedRemovals.get(workspaceId) || []]), materialization: materializationReceipt(candidateProvider, candidateTopology) });
  }

  const removals = (workspace.delta.removed || []).map((entry) => String(entry.path || '')).filter(Boolean);
  const expected = expectedRemovals.get(workspaceId) || new Set();
  const unexplained = removals.filter((path) => !expected.has(path));
  const staleExpected = [...expected].filter((path) => !removals.includes(path));
  if (unexplained.length) {
    reasons.push('unexplained-removals');
    findings.push(finding('error', 'portable.recovery-acceptance.unexplained-removals', 'Candidate Recovery removes accepted-basis source paths without an explicit expected-removal disposition.', { workspaceId, count: unexplained.length, paths: unexplained }));
  }
  if (staleExpected.length) findings.push(finding('warning', 'portable.recovery-acceptance.expected-removal-stale', 'One or more declared expected removals are not removals in the candidate carrier.', { workspaceId, count: staleExpected.length, paths: staleExpected }));
  return freeze({
    workspaceId,
    state: reasons.length ? 'blocked' : 'ready',
    coverage,
    reasons: freeze(reasons),
    basisCoverage: String(basisTopology?.coverage || ''),
    comparisonState: String(workspace.state || ''),
    counts: freeze({
      additions: Number(workspace.delta.counts?.added || 0),
      removals: Number(workspace.delta.counts?.removed || 0),
      byteChanged: Number(workspace.delta.counts?.byteChanged || 0),
      unexplainedRemovals: unexplained.length,
      totalChanges: Number(workspace.delta.counts?.total || 0)
    }),
    unexplainedRemovals: freeze(unexplained),
    expectedRemovals: freeze([...expected]),
    staleExpectedRemovals: freeze(staleExpected),
    materialization: materializationReceipt(candidateProvider, candidateTopology)
  });
}

function auditResult(status, workspaces, findings, basisInspection, candidateInspection, input) {
  const unexplainedRemovalCount = workspaces.reduce((sum, item) => sum + Number(item.counts?.unexplainedRemovals || 0), 0);
  const completeWorkspaceCount = workspaces.filter((item) => item.coverage === 'complete').length;
  const allReady = workspaces.length > 0 && workspaces.every((item) => item.state === 'ready');
  return freeze({
    schema: PORTABLE_RECOVERY_ACCEPTANCE_AUDIT_SCHEMA_ID,
    status,
    state: status === 'ready' && allReady ? 'acceptance-audit-ready' : 'acceptance-audit-blocked',
    basisQualification: String(basisInspection.status || 'invalid'),
    basisCarrierRole: String(basisInspection.packageContract?.packageRole || ''),
    candidateQualification: String(candidateInspection.status || 'invalid'),
    candidateCarrierRole: String(candidateInspection.packageContract?.packageRole || ''),
    selectionMode: (input.workspaceIds || input.selectedWorkspaceIds || []).length ? 'explicit-workspace-set' : 'all-candidate-workspaces',
    workspaces: freeze(workspaces),
    counts: freeze({ workspaces: workspaces.length, readyWorkspaces: workspaces.filter((item) => item.state === 'ready').length, completeWorkspaces: completeWorkspaceCount, unexplainedRemovals: unexplainedRemovalCount }),
    suitability: freeze({
      state: status === 'ready' && allReady && unexplainedRemovalCount === 0 ? 'restart-source-ready' : 'blocked',
      candidateCarrierQualified: String(candidateInspection.status || '') === 'valid',
      exactWorkspaceMaterializationQualified: workspaces.length > 0 && workspaces.every((item) => item.materialization?.state === 'qualified'),
      allSelectedWorkspacesComplete: workspaces.length > 0 && completeWorkspaceCount === workspaces.length,
      unexplainedRemovalCount,
      gitCommitStateProven: false,
      semanticAcceptanceGranted: false
    }),
    findings: freeze(findings),
    boundary: 'Coarse Recovery acceptance audit over already-qualified recipient-facing carrier bytes. The accepted basis may be a routed Handoff carrier or a qualified pointerless Workspace carrier; route authority is not required merely to establish exact basis bytes. It decodes the exact candidate Workspace representations, compares them to one explicit accepted basis, and fails on unexplained source removals or incomplete candidate coverage. It does not inspect a live checkout, prove Git cleanliness/committability, decide semantic correctness, authorize deletion, or grant Master Recovery acceptance; target landing still requires the separate exact source preflight.'
  });
}

function frontierForProvider(workspaceId, provider, label) {
  const entries = listHandoffWorkspaceEntries({ workspaces: [provider] }, workspaceId);
  return createPortableSourceFrontier({ id: `${label}:${workspaceId}`, source: { kind: label, workspaceId }, workspaces: [{ workspaceId, entries: entries.map(entryIdentity) }] });
}
function materializationReceipt(provider, topology) {
  return freeze({ state: provider?.state === 'qualified' ? 'qualified' : 'unqualified', mode: String(provider?.mode || ''), coverage: String(topology?.coverage || ''), entryCount: Array.isArray(provider?.entries) ? provider.entries.length : 0, archivePackagePath: String(provider?.archive?.packagePath || '') });
}
function normalizeExpectedRemovals(value) {
  const source = value?.expectedRemovals && typeof value.expectedRemovals === 'object' ? value.expectedRemovals : value;
  const out = new Map();
  if (Array.isArray(source)) {
    for (const item of source) {
      const workspaceId = normalizeId(item?.workspaceId || item?.workspace || '');
      const path = normalizePath(item?.path || '');
      if (!workspaceId || !path) continue;
      if (!out.has(workspaceId)) out.set(workspaceId, new Set());
      out.get(workspaceId).add(path);
    }
    return out;
  }
  for (const [key, paths] of Object.entries(source || {})) {
    const workspaceId = normalizeId(key);
    if (!workspaceId) continue;
    out.set(workspaceId, new Set((Array.isArray(paths) ? paths : [paths]).map(normalizePath).filter(Boolean)));
  }
  return out;
}
function normalizeId(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').trim(); }
function entryIdentity(entry = {}) { return freeze({ path: String(entry.path || entry.innerPath || ''), bytes: Number(entry.bytes ?? entry.size ?? 0), sha256: String(entry.sha256 || '').toLowerCase() }); }
function emptyCounts() { return freeze({ additions: 0, removals: 0, byteChanged: 0, unexplainedRemovals: 0, totalChanges: 0 }); }
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context: freeze({ ...context }) }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map((item) => freeze(item))); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
