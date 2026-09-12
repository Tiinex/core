import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import {
  PORTABLE_SOURCE_FRONTIER_SCHEMA_ID,
  createPortableSourceFrontier,
  createPortableWorkspaceSnapshot,
  reconcilePortableSourceFrontiers
} from './sourceFrontierComparison.js';

export const PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_SCHEMA_ID = 'tiinex.portable.source-frontier-reconciliation-proof.v1';
export const PORTABLE_SOURCE_FRONTIER_RECONCILIATION_SUMMARY_SCHEMA_ID = 'tiinex.portable.source-frontier-reconciliation-proof-summary.v1';
export const PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_BASIS_SCHEMA_ID = 'tiinex.portable.source-frontier-reconciliation-proof-basis.v1';

const QUALIFIED = 'qualified';
const DISPOSITION_ACTIONS = new Set(['incoming', 'current', 'base', 'reconciled', 'delete']);

/**
 * Prove one candidate reconciled source frontier against qualified base/incoming/current
 * byte identity. Non-overlap preservation is mechanical. Conflict/deletion paths require an
 * explicit caller disposition and the receipt never treats that disposition as semantic truth.
 */
export function provePortableSourceReconciliation(input = {}) {
  const base = ensureFrontier(input.base, 'base');
  const incoming = ensureFrontier(input.incoming, 'incoming');
  const current = ensureFrontier(input.current, 'current');
  const reconciled = ensureFrontier(input.reconciled, 'reconciled');
  const comparison = reconcilePortableSourceFrontiers({ base, incoming, current });
  const findings = [...(comparison.findings || []), ...(reconciled.findings || [])];
  const dispositions = normalizeDispositions(input.dispositions, findings);
  const dispositionByKey = new Map(dispositions.map((item) => [dispositionKey(item.workspaceId, item.path), item]));
  const usedDispositionKeys = new Set();

  if (!input.reconciled) {
    findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.reconciled-required', 'Manufacture reconciliation proof requires an explicit candidate reconciled frontier.'));
  }

  const baseById = workspaceMap(base);
  const incomingById = workspaceMap(incoming);
  const currentById = workspaceMap(current);
  const reconciledById = workspaceMap(reconciled);
  const sourceIds = [...new Set([...baseById.keys(), ...incomingById.keys(), ...currentById.keys()])].sort();
  for (const workspaceId of reconciledById.keys()) {
    if (sourceIds.includes(workspaceId)) continue;
    findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.workspace-unexpected', 'Candidate reconciled frontier contains a Workspace that is not present in the qualified base/incoming/current source union.', { workspaceId }));
  }

  const workspaces = sourceIds.map((workspaceId) => reconcileWorkspaceForManufacture({
    workspaceId,
    base: baseById.get(workspaceId),
    incoming: incomingById.get(workspaceId),
    current: currentById.get(workspaceId),
    reconciled: reconciledById.get(workspaceId),
    dispositionByKey,
    usedDispositionKeys,
    findings
  }));

  for (const disposition of dispositions) {
    const key = dispositionKey(disposition.workspaceId, disposition.path);
    if (usedDispositionKeys.has(key)) continue;
    findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.disposition-orphan', 'Explicit disposition does not match a conflict/deletion candidate in the qualified source union.', { workspaceId: disposition.workspaceId, path: disposition.path }));
  }

  const normalizedFindings = Object.freeze(dedupeFindings(findings));
  const counts = aggregateProofCounts(workspaces);
  const qualificationFailure = !input.reconciled
    || base.state !== QUALIFIED
    || incoming.state !== QUALIFIED
    || current.state !== QUALIFIED
    || reconciled.state !== QUALIFIED;
  const unresolved = counts.unresolvedDisposition > 0;
  const mismatch = counts.reconciledMismatch > 0 || normalizedFindings.some((item) => item.code === 'portable.source-frontier.reconciliation.reconciled-path-unexpected');
  const otherErrors = normalizedFindings.some((item) => item.severity === 'error');
  const state = qualificationFailure
    ? 'qualification-error'
    : unresolved
      ? 'disposition-required'
      : mismatch || otherErrors
        ? 'reconciled-frontier-mismatch'
        : 'manufacture-ready';
  const status = state === 'manufacture-ready' ? 'ready' : 'blocked';

  const preservation = deepFreeze({
    incomingOnly: Object.freeze({ accepted: counts.incomingOnly, preserved: counts.incomingOnlyPreserved, failed: Math.max(0, counts.incomingOnly - counts.incomingOnlyPreserved) }),
    currentOnly: Object.freeze({ accepted: counts.currentOnly, preserved: counts.currentOnlyPreserved, failed: Math.max(0, counts.currentOnly - counts.currentOnlyPreserved) })
  });
  const proofBasis = deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_BASIS_SCHEMA_ID,
    state,
    inputs: Object.freeze({
      base: frontierBindingReceipt(base),
      incoming: frontierBindingReceipt(incoming),
      current: frontierBindingReceipt(current),
      reconciled: frontierBindingReceipt(reconciled)
    }),
    dispositions: Object.freeze(dispositions.map(dispositionBindingReceipt)),
    workspaces: Object.freeze(workspaces.map(workspaceBindingReceipt)),
    preservation
  });
  const proofFingerprint = sha256Hex(utf8Bytes(stableJson(proofBasis)));
  const manufactureBinding = deepFreeze({
    state: status === 'ready' ? 'qualified' : 'blocked',
    proofFingerprint,
    workspaces: Object.freeze(workspaces.filter((workspace) => workspace.reconciled?.snapshot).map((workspace) => Object.freeze({
      workspaceId: workspace.workspaceId,
      snapshot: Object.freeze({
        entryCount: workspace.reconciled.snapshot.entryCount,
        totalBytes: workspace.reconciled.snapshot.totalBytes,
        fingerprint: workspace.reconciled.snapshot.fingerprint,
        fingerprintMethod: workspace.reconciled.snapshot.fingerprintMethod
      })
    }))),
    boundary: 'Binds this proof to the exact candidate reconciled Workspace snapshot fingerprints. Manufacture must re-enumerate source and match these fingerprints before carriage.'
  });

  return deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_SCHEMA_ID,
    status,
    state,
    comparison: Object.freeze({ schema: comparison.schema, state: comparison.state, counts: comparison.counts }),
    inputs: Object.freeze({
      base: frontierBindingReceipt(base),
      incoming: frontierBindingReceipt(incoming),
      current: frontierBindingReceipt(current),
      reconciled: frontierBindingReceipt(reconciled)
    }),
    workspaces: Object.freeze(workspaces),
    counts,
    preservation,
    dispositions: Object.freeze(dispositions),
    proofBasis,
    proofFingerprint,
    manufactureBinding,
    findings: normalizedFindings,
    findingSummary: summarizePortableFindings(normalizedFindings),
    operationBoundary: Object.freeze({
      sourceMutation: false,
      remoteFetch: false,
      remoteMutation: false,
      automaticMerge: false,
      semanticDisposition: false,
      acceptanceInference: false,
      manufactureGate: true
    }),
    boundary: 'Mechanical base/incoming/current reconciliation proof only. Non-overlap byte preservation is verified; conflict/deletion candidates require explicit caller disposition. A disposition records a decision but does not prove semantic correctness, authority, acceptance, or intentional deletion.'
  });
}

/** Compact projection; full proof is required when a manufacture command consumes the receipt. */
export function projectPortableSourceReconciliationProofSummary(result = {}, options = {}) {
  const maxPaths = positiveInteger(options.maxPaths, 20);
  return deepFreeze({
    schema: PORTABLE_SOURCE_FRONTIER_RECONCILIATION_SUMMARY_SCHEMA_ID,
    resultSchema: String(result.schema || ''),
    status: String(result.status || ''),
    state: String(result.state || ''),
    counts: result.counts ? Object.freeze({ ...result.counts }) : null,
    preservation: result.preservation ? deepFreeze(result.preservation) : null,
    workspaces: Object.freeze((result.workspaces || []).map((workspace) => Object.freeze({
      workspaceId: String(workspace.workspaceId || ''),
      state: String(workspace.state || ''),
      counts: workspace.counts ? Object.freeze({ ...workspace.counts }) : null,
      paths: Object.freeze((workspace.paths || []).slice(0, maxPaths).map((item) => Object.freeze({
        path: item.path,
        classification: item.classification,
        deletionCandidate: Boolean(item.deletionCandidate),
        conflictCandidate: Boolean(item.conflictCandidate),
        dispositionRequired: Boolean(item.dispositionRequired),
        dispositionState: item.dispositionState,
        reconciledMatch: item.reconciledMatch
      }))),
      pathsOmitted: Math.max(0, (workspace.paths || []).length - maxPaths),
      unexpectedReconciledPaths: Object.freeze([...(workspace.unexpectedReconciledPaths || [])].slice(0, maxPaths)),
      unexpectedReconciledPathsOmitted: Math.max(0, (workspace.unexpectedReconciledPaths || []).length - maxPaths)
    }))),
    proofFingerprint: String(result.proofFingerprint || ''),
    manufactureBinding: result.manufactureBinding ? deepFreeze(result.manufactureBinding) : null,
    findingSummary: result.findingSummary || summarizePortableFindings(result.findings || []),
    actionableFindings: Object.freeze((result.findings || []).filter((item) => item.severity === 'error' || item.severity === 'warning').slice(0, 20).map((item) => Object.freeze({ ...item }))),
    fullReceiptRequiredForManufacture: true,
    boundary: 'Compact reconciliation proof projection. Use --full when persisting a proof for manufacture; semantic merge correctness remains outside Tooling.'
  });
}

/**
 * Requalify a full reconciliation proof against the exact Workspace bytes about to be manufactured.
 * This catches stale/missing proof and candidate-source drift without inferring semantic acceptance.
 */
export function qualifyPortableSourceReconciliationProofForManufacture(input = {}) {
  const requireProof = input.requireProof === true;
  const supplied = input.proof || null;
  const findings = [];
  if (!supplied || (typeof supplied === 'object' && !Object.keys(supplied).length)) {
    if (!requireProof) return deepFreeze({ state: 'not-required', findings: Object.freeze([]), findingSummary: summarizePortableFindings([]), boundary: 'No reconciliation proof was requested for this manufacture.' });
    findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.required', 'This manufacture requires a qualified source-reconciliation proof receipt, but none was supplied.'));
    return blockedManufactureQualification(findings);
  }

  const proof = unwrapProof(supplied);
  if (!proof || proof.schema !== PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_SCHEMA_ID) {
    findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.schema-invalid', 'Supplied reconciliation proof is not a full supported source-reconciliation proof receipt.'));
    return blockedManufactureQualification(findings);
  }
  if (proof.status !== 'ready' || proof.state !== 'manufacture-ready' || proof.manufactureBinding?.state !== 'qualified') {
    findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.not-ready', 'Supplied reconciliation proof is not manufacture-ready.', { proofState: String(proof.state || ''), proofStatus: String(proof.status || '') }));
  }
  if (!proof.proofBasis || proof.proofBasis.schema !== PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_BASIS_SCHEMA_ID) {
    findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.full-receipt-required', 'Manufacture requires the full reconciliation proof receipt including its deterministic proof basis; compact projections are insufficient.'));
  } else {
    const expectedFingerprint = sha256Hex(utf8Bytes(stableJson(proof.proofBasis)));
    if (!proof.proofFingerprint || proof.proofFingerprint !== expectedFingerprint || proof.manufactureBinding?.proofFingerprint !== expectedFingerprint) {
      findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.fingerprint-mismatch', 'Reconciliation proof fingerprint does not match its deterministic proof basis.'));
    }
  }

  const materializationById = new Map((input.workspaceMaterializations || []).map((materialization) => [String(materialization?.id || materialization?.workspaceId || ''), materialization]).filter(([id]) => id));
  const bindingById = new Map((proof.manufactureBinding?.workspaces || []).map((binding) => [String(binding?.workspaceId || ''), binding]).filter(([id]) => id));
  const requiredWorkspaceIds = [...new Set((input.requiredWorkspaceIds || []).map(String).filter(Boolean))].sort();
  for (const workspaceId of requiredWorkspaceIds) {
    if (!bindingById.has(workspaceId)) findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.workspace-not-covered', 'Required manufactured Workspace is not covered by the reconciliation proof.', { workspaceId }));
  }
  for (const [workspaceId, binding] of bindingById) {
    const materialization = materializationById.get(workspaceId);
    if (!materialization) {
      findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.workspace-missing', 'Reconciliation proof covers a Workspace that is not present in current manufacture input.', { workspaceId }));
      continue;
    }
    const actual = createPortableWorkspaceSnapshot(materialization.includedEntries || materialization.entries || [], { source: 'handoff-manufacture-requalification' });
    const expected = binding.snapshot || {};
    if (actual.state !== QUALIFIED || actual.fingerprint !== expected.fingerprint || actual.entryCount !== Number(expected.entryCount || 0) || actual.totalBytes !== Number(expected.totalBytes || 0)) {
      findings.push(portableFinding('error', 'portable.handoff-manufacture.reconciliation-proof.source-drift', 'Workspace bytes selected for manufacture do not match the candidate reconciled source fingerprint proven by the supplied receipt.', { workspaceId, expectedFingerprint: String(expected.fingerprint || ''), actualFingerprint: String(actual.fingerprint || '') }));
    }
  }

  const normalizedFindings = Object.freeze(dedupeFindings(findings));
  if (normalizedFindings.some((item) => item.severity === 'error')) return blockedManufactureQualification(normalizedFindings, proof);
  return deepFreeze({
    state: 'qualified',
    proofFingerprint: String(proof.proofFingerprint || ''),
    coveredWorkspaceIds: Object.freeze([...bindingById.keys()].sort()),
    requiredWorkspaceIds: Object.freeze(requiredWorkspaceIds),
    findings: normalizedFindings,
    findingSummary: summarizePortableFindings(normalizedFindings),
    boundary: 'Qualified only for exact source-byte identity at manufacture time. Semantic merge correctness, acceptance, and authority remain external.'
  });
}

function reconcileWorkspaceForManufacture({ workspaceId, base, incoming, current, reconciled, dispositionByKey, usedDispositionKeys, findings }) {
  const sourceSides = { base, incoming, current };
  const missingSides = Object.entries(sourceSides).filter(([, value]) => !value).map(([key]) => key);
  if (missingSides.length) {
    findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.workspace-source-incomplete', 'Reconciliation proof requires the Workspace to be present in base, incoming, and current frontiers.', { workspaceId, missing: missingSides.join(',') }));
    return unavailableWorkspace(workspaceId, sourceSides, reconciled, missingSides);
  }
  const nonqualified = Object.entries({ ...sourceSides, reconciled }).filter(([, value]) => !value || value.state !== QUALIFIED).map(([key, value]) => `${key}:${String(value?.state || 'missing')}`);
  if (nonqualified.length) {
    findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.workspace-unqualified', 'Reconciliation proof requires qualified, non-opaque source snapshots for base, incoming, current, and reconciled Workspace states.', { workspaceId, states: nonqualified.join(',') }));
    return unavailableWorkspace(workspaceId, sourceSides, reconciled, nonqualified, 'qualification-error');
  }

  const baseMap = entryMap(base.snapshot);
  const incomingMap = entryMap(incoming.snapshot);
  const currentMap = entryMap(current.snapshot);
  const reconciledMap = entryMap(reconciled.snapshot);
  const sourcePaths = [...new Set([...baseMap.keys(), ...incomingMap.keys(), ...currentMap.keys()])].sort();
  const sourcePathSet = new Set(sourcePaths);
  const unexpectedReconciledPaths = [...reconciledMap.keys()].filter((path) => !sourcePathSet.has(path)).sort();
  for (const path of unexpectedReconciledPaths) {
    findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.reconciled-path-unexpected', 'Candidate reconciled frontier contains source bytes not justified by any base/incoming/current path.', { workspaceId, path }));
  }

  const paths = [];
  const expectedEntries = [];
  const counts = {
    exact: 0,
    incomingOnly: 0,
    currentOnly: 0,
    sameResultConcurrent: 0,
    deletionCandidate: 0,
    conflictingOverlap: 0,
    dispositionRequired: 0,
    resolvedDisposition: 0,
    unresolvedDisposition: 0,
    reconciledMatch: 0,
    reconciledMismatch: 0,
    incomingOnlyPreserved: 0,
    currentOnlyPreserved: 0,
    totalPaths: sourcePaths.length
  };

  for (const path of sourcePaths) {
    const baseEntry = baseMap.get(path) || null;
    const incomingEntry = incomingMap.get(path) || null;
    const currentEntry = currentMap.get(path) || null;
    const reconciledEntry = reconciledMap.get(path) || null;
    const classified = classifyPath(baseEntry, incomingEntry, currentEntry);
    counts[classified.countKey] += 1;
    if (classified.deletionCandidate && classified.countKey !== 'deletionCandidate') counts.deletionCandidate += 1;
    if (classified.conflictCandidate && classified.countKey !== 'conflictingOverlap') counts.conflictingOverlap += 1;

    const key = dispositionKey(workspaceId, path);
    const disposition = dispositionByKey.get(key) || null;
    let selected = null;
    let selectionState = 'automatic';
    let dispositionState = 'not-required';
    let selectionSource = '';
    let selectionQualified = true;

    if (classified.dispositionRequired) {
      counts.dispositionRequired += 1;
      if (!disposition) {
        counts.unresolvedDisposition += 1;
        selectionState = 'unresolved';
        dispositionState = 'required';
        selectionQualified = false;
        findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.disposition-required', 'Conflict/deletion candidate requires an explicit disposition before manufacture can be ready.', { workspaceId, path, classification: classified.classification }));
      } else {
        usedDispositionKeys.add(key);
        const resolution = resolveDisposition(disposition, { baseEntry, incomingEntry, currentEntry, reconciledEntry });
        selectionQualified = resolution.qualified;
        selected = resolution.entry;
        selectionSource = resolution.source;
        selectionState = resolution.qualified ? 'explicit' : 'invalid';
        dispositionState = resolution.qualified ? 'resolved' : 'invalid';
        if (resolution.qualified) counts.resolvedDisposition += 1;
        else findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.disposition-invalid-for-path', resolution.message, { workspaceId, path, action: disposition.action }));
      }
    } else {
      if (disposition) {
        usedDispositionKeys.add(key);
        findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.disposition-unnecessary', 'Disposition was supplied for a path that is not a conflict/deletion candidate; non-overlap preservation is deterministic and must not be overridden.', { workspaceId, path, action: disposition.action }));
        selectionQualified = false;
      }
      selected = automaticSelection(classified.classification, { baseEntry, incomingEntry, currentEntry });
      selectionSource = automaticSelectionSource(classified.classification);
    }

    let reconciledMatch = 'unverified';
    if (selectionQualified && (!classified.dispositionRequired || disposition)) {
      const matched = sameOptionalEntry(selected, reconciledEntry);
      reconciledMatch = matched ? 'matched' : 'mismatch';
      if (matched) counts.reconciledMatch += 1;
      else {
        counts.reconciledMismatch += 1;
        findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.reconciled-path-mismatch', 'Candidate reconciled source does not match the mechanically selected source identity for this path.', { workspaceId, path, classification: classified.classification, selectionSource }));
      }
      if (selected) expectedEntries.push({ path, bytes: selected.bytes, sha256: selected.sha256 });
    }

    if (classified.classification === 'incoming-only' && reconciledMatch === 'matched') counts.incomingOnlyPreserved += 1;
    if (classified.classification === 'current-only' && reconciledMatch === 'matched') counts.currentOnlyPreserved += 1;

    paths.push(deepFreeze({
      path,
      classification: classified.classification,
      deletionCandidate: classified.deletionCandidate,
      conflictCandidate: classified.conflictCandidate,
      dispositionRequired: classified.dispositionRequired,
      dispositionState,
      disposition: disposition ? dispositionBindingReceipt(disposition) : null,
      selectionState,
      selectionSource,
      base: optionalEntryIdentity(baseEntry),
      incoming: optionalEntryIdentity(incomingEntry),
      current: optionalEntryIdentity(currentEntry),
      reconciled: optionalEntryIdentity(reconciledEntry),
      incomingChange: changeKind(baseEntry, incomingEntry),
      currentChange: changeKind(baseEntry, currentEntry),
      reconciledMatch
    }));
  }

  const expectedSnapshot = counts.unresolvedDisposition === 0 && paths.every((item) => item.selectionState !== 'invalid')
    ? createPortableWorkspaceSnapshot(expectedEntries, { basis: 'qualified-base-incoming-current-plus-explicit-dispositions' })
    : null;
  const state = counts.unresolvedDisposition
    ? 'disposition-required'
    : counts.reconciledMismatch || unexpectedReconciledPaths.length || paths.some((item) => item.selectionState === 'invalid')
      ? 'reconciled-frontier-mismatch'
      : 'reconciled';

  return deepFreeze({
    workspaceId,
    state,
    base: workspaceReceipt(base),
    incoming: workspaceReceipt(incoming),
    current: workspaceReceipt(current),
    reconciled: workspaceReceipt(reconciled),
    expectedSnapshot: expectedSnapshot ? snapshotReceipt(expectedSnapshot) : null,
    paths: Object.freeze(paths),
    unexpectedReconciledPaths: Object.freeze(unexpectedReconciledPaths),
    counts: Object.freeze(counts),
    basis: 'qualified-base-incoming-current-path-byte-sha256-plus-explicit-conflict-deletion-disposition-v1'
  });
}

function classifyPath(base, incoming, current) {
  const incomingChanged = !sameOptionalEntry(base, incoming);
  const currentChanged = !sameOptionalEntry(base, current);
  const deletionCandidate = Boolean(base) && ((incomingChanged && !incoming) || (currentChanged && !current));
  const conflictCandidate = incomingChanged && currentChanged && !sameOptionalEntry(incoming, current);
  if (!incomingChanged && !currentChanged) return { classification: 'exact', countKey: 'exact', deletionCandidate: false, conflictCandidate: false, dispositionRequired: false };
  if (conflictCandidate) return { classification: 'conflicting-overlap', countKey: 'conflictingOverlap', deletionCandidate, conflictCandidate: true, dispositionRequired: true };
  if (deletionCandidate) return { classification: 'deletion-candidate', countKey: 'deletionCandidate', deletionCandidate: true, conflictCandidate: false, dispositionRequired: true };
  if (incomingChanged && !currentChanged) return { classification: 'incoming-only', countKey: 'incomingOnly', deletionCandidate: false, conflictCandidate: false, dispositionRequired: false };
  if (!incomingChanged && currentChanged) return { classification: 'current-only', countKey: 'currentOnly', deletionCandidate: false, conflictCandidate: false, dispositionRequired: false };
  return { classification: 'same-result-concurrent', countKey: 'sameResultConcurrent', deletionCandidate: false, conflictCandidate: false, dispositionRequired: false };
}

function automaticSelection(classification, sides) {
  if (classification === 'exact') return sides.baseEntry || sides.incomingEntry || sides.currentEntry || null;
  if (classification === 'incoming-only') return sides.incomingEntry || null;
  if (classification === 'current-only') return sides.currentEntry || null;
  if (classification === 'same-result-concurrent') return sides.incomingEntry || sides.currentEntry || null;
  return null;
}
function automaticSelectionSource(classification) {
  if (classification === 'exact') return 'exact-common';
  if (classification === 'incoming-only') return 'incoming';
  if (classification === 'current-only') return 'current';
  if (classification === 'same-result-concurrent') return 'same-result-concurrent';
  return '';
}

function resolveDisposition(disposition, sides) {
  const action = disposition.action;
  if (action === 'delete') return { qualified: true, entry: null, source: 'explicit-delete', message: '' };
  if (action === 'incoming') return sides.incomingEntry ? { qualified: true, entry: sides.incomingEntry, source: 'explicit-incoming', message: '' } : { qualified: false, entry: null, source: '', message: 'Disposition selects incoming source, but incoming is absent. Use explicit delete to authorize absence.' };
  if (action === 'current') return sides.currentEntry ? { qualified: true, entry: sides.currentEntry, source: 'explicit-current', message: '' } : { qualified: false, entry: null, source: '', message: 'Disposition selects current source, but current is absent. Use explicit delete to authorize absence.' };
  if (action === 'base') return sides.baseEntry ? { qualified: true, entry: sides.baseEntry, source: 'explicit-base', message: '' } : { qualified: false, entry: null, source: '', message: 'Disposition selects base source, but base is absent.' };
  if (action === 'reconciled') return sides.reconciledEntry ? { qualified: true, entry: sides.reconciledEntry, source: 'explicit-reconciled', message: '' } : { qualified: false, entry: null, source: '', message: 'Disposition selects reconciled source, but candidate reconciled path is absent. Use explicit delete to authorize absence.' };
  return { qualified: false, entry: null, source: '', message: 'Disposition action is unsupported.' };
}

function normalizeDispositions(value, findings) {
  const raw = Array.isArray(value) ? value : Array.isArray(value?.dispositions) ? value.dispositions : [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const workspaceId = String(item?.workspaceId || item?.workspace || '').trim();
    const path = normalizePath(item?.path || item?.innerPath || '');
    const action = String(item?.action || item?.disposition || '').trim().toLowerCase();
    if (!workspaceId || !path || unsafePath(path) || !DISPOSITION_ACTIONS.has(action)) {
      findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.disposition-invalid', 'Every disposition requires an explicit Workspace id, safe Workspace-relative path, and action incoming|current|base|reconciled|delete.', { workspaceId, path: String(item?.path || ''), action }));
      continue;
    }
    const key = dispositionKey(workspaceId, path);
    if (seen.has(key)) {
      findings.push(portableFinding('error', 'portable.source-frontier.reconciliation.disposition-duplicate', 'Only one explicit disposition may be supplied for a Workspace/path candidate.', { workspaceId, path }));
      continue;
    }
    seen.add(key);
    out.push(deepFreeze({ workspaceId, path, action, ...(item?.note ? { note: String(item.note) } : {}) }));
  }
  out.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.path.localeCompare(b.path));
  return Object.freeze(out);
}

function aggregateProofCounts(workspaces) {
  const counts = {
    workspaces: workspaces.length,
    exact: 0,
    incomingOnly: 0,
    currentOnly: 0,
    sameResultConcurrent: 0,
    deletionCandidate: 0,
    conflictingOverlap: 0,
    dispositionRequired: 0,
    resolvedDisposition: 0,
    unresolvedDisposition: 0,
    reconciledMatch: 0,
    reconciledMismatch: 0,
    incomingOnlyPreserved: 0,
    currentOnlyPreserved: 0,
    pathCount: 0
  };
  for (const workspace of workspaces) {
    for (const key of ['exact', 'incomingOnly', 'currentOnly', 'sameResultConcurrent', 'deletionCandidate', 'conflictingOverlap', 'dispositionRequired', 'resolvedDisposition', 'unresolvedDisposition', 'reconciledMatch', 'reconciledMismatch', 'incomingOnlyPreserved', 'currentOnlyPreserved']) counts[key] += Number(workspace.counts?.[key] || 0);
    counts.pathCount += Number(workspace.counts?.totalPaths || 0);
  }
  return Object.freeze(counts);
}

function unavailableWorkspace(workspaceId, sourceSides, reconciled, missing, state = 'unavailable') {
  return deepFreeze({
    workspaceId,
    state,
    base: workspaceReceipt(sourceSides.base),
    incoming: workspaceReceipt(sourceSides.incoming),
    current: workspaceReceipt(sourceSides.current),
    reconciled: workspaceReceipt(reconciled),
    expectedSnapshot: null,
    missing: Object.freeze([...(missing || [])]),
    paths: Object.freeze([]),
    unexpectedReconciledPaths: Object.freeze([]),
    counts: Object.freeze({ exact: 0, incomingOnly: 0, currentOnly: 0, sameResultConcurrent: 0, deletionCandidate: 0, conflictingOverlap: 0, dispositionRequired: 0, resolvedDisposition: 0, unresolvedDisposition: 0, reconciledMatch: 0, reconciledMismatch: 0, incomingOnlyPreserved: 0, currentOnlyPreserved: 0, totalPaths: 0 })
  });
}

function ensureFrontier(frontier, label) {
  if (frontier?.schema === PORTABLE_SOURCE_FRONTIER_SCHEMA_ID && Array.isArray(frontier.workspaces)) return createPortableSourceFrontier(frontier);
  return createPortableSourceFrontier({
    id: label,
    state: 'qualification-error',
    source: { kind: 'unavailable' },
    workspaces: [],
    findings: [portableFinding('error', `portable.source-frontier.reconciliation.${label}-input-invalid`, 'Reconciliation proof input is not a qualified normalized source frontier.', { side: label })]
  });
}

function frontierBindingReceipt(frontier) {
  return deepFreeze({
    schema: String(frontier?.schema || ''),
    state: String(frontier?.state || ''),
    id: String(frontier?.id || ''),
    workspaces: Object.freeze((frontier?.workspaces || []).map((workspace) => Object.freeze({
      workspaceId: String(workspace.workspaceId || ''),
      state: String(workspace.state || ''),
      qualification: String(workspace.qualification || ''),
      ...(workspace.snapshot ? { snapshot: snapshotReceipt(workspace.snapshot) } : {})
    })))
  });
}
function workspaceReceipt(workspace) {
  if (!workspace) return null;
  return deepFreeze({ state: String(workspace.state || ''), qualification: String(workspace.qualification || ''), ...(workspace.snapshot ? { snapshot: snapshotReceipt(workspace.snapshot) } : {}) });
}
function snapshotReceipt(snapshot) {
  return Object.freeze({ state: String(snapshot?.state || ''), entryCount: Number(snapshot?.entryCount || 0), totalBytes: Number(snapshot?.totalBytes || 0), fingerprint: String(snapshot?.fingerprint || ''), fingerprintMethod: String(snapshot?.fingerprintMethod || '') });
}
function workspaceBindingReceipt(workspace) {
  return deepFreeze({
    workspaceId: workspace.workspaceId,
    state: workspace.state,
    expectedSnapshot: workspace.expectedSnapshot,
    reconciledSnapshot: workspace.reconciled?.snapshot || null,
    counts: workspace.counts,
    unresolvedPaths: Object.freeze((workspace.paths || []).filter((item) => item.dispositionState === 'required' || item.dispositionState === 'invalid').map((item) => item.path)),
    mismatchedPaths: Object.freeze((workspace.paths || []).filter((item) => item.reconciledMatch === 'mismatch').map((item) => item.path)),
    unexpectedReconciledPaths: workspace.unexpectedReconciledPaths || Object.freeze([])
  });
}
function dispositionBindingReceipt(disposition) { return Object.freeze({ workspaceId: disposition.workspaceId, path: disposition.path, action: disposition.action }); }

function unwrapProof(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.schema === PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_SCHEMA_ID) return value;
  if (value.schema === 'tiinex.portable.operation.result.v1' && value.resultSchema === PORTABLE_SOURCE_FRONTIER_RECONCILIATION_PROOF_SCHEMA_ID) return { ...value, schema: value.resultSchema };
  return null;
}
function blockedManufactureQualification(findings, proof = null) {
  const normalizedFindings = Object.freeze(dedupeFindings(findings));
  return deepFreeze({ state: 'blocked', proofFingerprint: String(proof?.proofFingerprint || ''), findings: normalizedFindings, findingSummary: summarizePortableFindings(normalizedFindings), boundary: 'Manufacture reconciliation proof failed closed. No semantic merge or acceptance inference is performed.' });
}

function entryMap(snapshot) { return new Map((snapshot?.entries || []).map((entry) => [entry.path, entry])); }
function workspaceMap(frontier) { return new Map((frontier?.workspaces || []).map((workspace) => [workspace.workspaceId, workspace])); }
function sameEntry(left, right) { return Boolean(left && right && left.bytes === right.bytes && left.sha256 === right.sha256); }
function sameOptionalEntry(left, right) { return !left && !right ? true : Boolean(left && right && sameEntry(left, right)); }
function optionalEntryIdentity(entry) { return entry ? Object.freeze({ state: 'present', bytes: entry.bytes, sha256: entry.sha256 }) : Object.freeze({ state: 'absent' }); }
function changeKind(base, value) { if (sameOptionalEntry(base, value)) return 'unchanged'; if (!base && value) return 'added'; if (base && !value) return 'removed'; return 'byte-changed'; }
function dispositionKey(workspaceId, path) { return `${workspaceId}\u0000${path}`; }
function normalizePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, ''); }
function unsafePath(value = '') { return !value || value.includes('\u0000') || /^[\/]/.test(value) || /^[A-Za-z]:[\/]/.test(value) || value.endsWith('/') || value.split('/').some((part) => !part || part === '.' || part === '..'); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, child]) => typeof child !== 'undefined')); }
function dedupeFindings(findings = []) { const seen = new Set(); const out = []; for (const item of findings) { const key = `${item?.severity || ''}\u0000${item?.code || ''}\u0000${item?.message || ''}\u0000${item?.workspaceId || ''}\u0000${item?.path || ''}`; if (seen.has(key)) continue; seen.add(key); out.push(Object.freeze({ ...item })); } return out; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
