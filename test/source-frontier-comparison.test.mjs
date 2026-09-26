import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  comparePortableSourceFrontiers,
  createPortableSourceFrontier,
  projectPortableSourceFrontierComparisonSummary,
  reconcilePortableSourceFrontiers,
  provePortableSourceReconciliation,
  projectPortableSourceReconciliationProofSummary,
  qualifyPortableSourceReconciliationProofForManufacture,
  qualifyPortableSourcePath
} from '../src/public/index.js';
import { compareNodeSourceFrontiers, proveNodeSourceReconciliation } from '../src/public/node.js';
import { prepareNodeHandoffManufacturingInput } from '../src/tooling/portable/adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { sha256Hex } from '../src/export/package.bytes.js';

const encoder = new TextEncoder();
function h(text) { const data = encoder.encode(text); return { bytes: data.byteLength, sha256: sha256Hex(data) }; }
function entry(pathname, text) { return { path: pathname, ...h(text) }; }
function frontier(id, workspaces) { return createPortableSourceFrontier({ id, workspaces }); }

async function writeWorkspace(root, files) {
  for (const [relative, data] of Object.entries(files)) {
    const target = path.join(root, ...relative.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
  }
}

test('host-neutral source eligibility excludes Python cache bytes without treating ordinary Python or operator-authored scripts as disposable', () => {
  const pycache = qualifyPortableSourcePath('tools/__pycache__/browser-smoke.cpython-313.pyc');
  const compiled = qualifyPortableSourcePath('tools/browser-smoke.pyc');
  const python = qualifyPortableSourcePath('tools/browser-smoke.py');
  const authored = qualifyPortableSourcePath('tools/_author_site-return.mjs');
  assert.equal(pycache.eligible, false);
  assert.equal(pycache.reason, 'excluded-directory');
  assert.equal(compiled.eligible, false);
  assert.equal(compiled.reason, 'compiled-python-cache');
  assert.equal(python.eligible, true);
  assert.equal(authored.eligible, true);

  const normalized = frontier('eligible-source', [{ workspaceId: 'core', entries: [
    entry('tools/__pycache__/browser-smoke.cpython-313.pyc', 'cache'),
    entry('tools/browser-smoke.pyc', 'compiled-cache'),
    entry('tools/browser-smoke.py', 'print("source")'),
    entry('tools/_author_site-return.mjs', 'export const authored = true;')
  ] }]);
  const snapshot = normalized.workspaces[0].snapshot;
  assert.deepEqual(snapshot.entries.map((item) => item.path), ['tools/_author_site-return.mjs', 'tools/browser-smoke.py']);
  assert.equal(snapshot.evidence.sourceEligibility.inputEntryCount, 4);
  assert.equal(snapshot.evidence.sourceEligibility.excludedEntryCount, 2);
  assert.deepEqual(snapshot.evidence.sourceEligibility.excludedByReason, { 'compiled-python-cache': 1, 'excluded-directory': 1 });
});





test('pure two-way comparison has deterministic exact fast path, add/remove/change deltas, and Workspace asymmetry', () => {
  const exactLeft = frontier('left', [{ workspaceId: 'core', entries: [entry('b.txt', 'b'), entry('a.txt', 'a')] }]);
  const exactRight = frontier('right', [{ workspaceId: 'core', entries: [entry('a.txt', 'a'), entry('b.txt', 'b')] }]);
  const exact = comparePortableSourceFrontiers({ left: exactLeft, right: exactRight });
  assert.equal(exact.status, 'ready');
  assert.equal(exact.state, 'exact');
  assert.equal(exact.workspaces[0].delta.basis, 'qualified-snapshot-fingerprint-fast-path');

  const left = frontier('left', [
    { workspaceId: 'core', entries: [entry('remove.txt', 'old'), entry('change.txt', 'old')] },
    { workspaceId: 'docs', entries: [entry('docs.txt', 'docs')] }
  ]);
  const right = frontier('right', [
    { workspaceId: 'business', entries: [entry('business.txt', 'business')] },
    { workspaceId: 'core', entries: [entry('add.txt', 'new'), entry('change.txt', 'new')] }
  ]);
  const result = comparePortableSourceFrontiers({ left, right });
  assert.equal(result.state, 'changed');
  assert.deepEqual(result.workspaces.map((item) => [item.workspaceId, item.state]), [['business', 'only-right'], ['core', 'changed'], ['docs', 'only-left']]);
  const core = result.workspaces.find((item) => item.workspaceId === 'core');
  assert.deepEqual(core.delta.added.map((item) => item.path), ['add.txt']);
  assert.deepEqual(core.delta.removed.map((item) => item.path), ['remove.txt']);
  assert.deepEqual(core.delta.byteChanged.map((item) => item.path), ['change.txt']);
  assert.deepEqual(core.delta.counts, { added: 1, removed: 1, byteChanged: 1, total: 3 });
});


test('three-way reconciliation classifies incoming-only, current-only, same-result concurrent, and conflict candidates without merging', () => {
  const base = frontier('base', [{ workspaceId: 'core', entries: [entry('a.txt', 'base-a'), entry('b.txt', 'base-b'), entry('c.txt', 'base-c'), entry('d.txt', 'base-d')] }]);
  const incoming = frontier('incoming', [{ workspaceId: 'core', entries: [entry('a.txt', 'incoming-a'), entry('b.txt', 'base-b'), entry('c.txt', 'same-c'), entry('d.txt', 'incoming-d')] }]);
  const current = frontier('current', [{ workspaceId: 'core', entries: [entry('a.txt', 'base-a'), entry('b.txt', 'current-b'), entry('c.txt', 'same-c'), entry('d.txt', 'current-d')] }]);
  const result = reconcilePortableSourceFrontiers({ base, incoming, current });
  assert.equal(result.status, 'ready');
  assert.equal(result.state, 'conflict-candidate');
  const workspace = result.workspaces[0];
  assert.deepEqual(workspace.paths.map((item) => [item.path, item.classification]), [
    ['a.txt', 'incoming-only'], ['b.txt', 'current-only'], ['c.txt', 'same-result-concurrent'], ['d.txt', 'conflict-candidate']
  ]);
  assert.deepEqual(workspace.counts, { incomingOnly: 1, currentOnly: 1, sameResultConcurrent: 1, conflictCandidate: 1, total: 4 });
  assert.equal(result.operationBoundary.merge, false);
  assert.equal(result.operationBoundary.sourceMutation, false);
});


test('normalized comparison rejects absolute/traversal paths and compact summary bounds path projection', () => {
  for (const pathname of ['/absolute.txt', '../escape.txt', 'C:\\absolute.txt']) {
    const value = frontier('unsafe', [{ workspaceId: 'core', entries: [{ path: pathname, bytes: 1, sha256: '0'.repeat(64) }] }]);
    assert.equal(value.state, 'qualification-error', pathname);
  }
  const left = frontier('left', [{ workspaceId: 'core', entries: [entry('a.txt', 'a'), entry('b.txt', 'b'), entry('c.txt', 'c')] }]);
  const right = frontier('right', [{ workspaceId: 'core', entries: [entry('a.txt', 'A'), entry('b.txt', 'B'), entry('c.txt', 'C')] }]);
  const summary = projectPortableSourceFrontierComparisonSummary(comparePortableSourceFrontiers({ left, right }), { maxPaths: 2 });
  assert.equal(summary.workspaces[0].delta.byteChanged.length, 2);
  assert.equal(summary.workspaces[0].delta.omitted, 1);
  assert.equal(summary.fullReceiptAvailable, true);
});


test('local inputs reuse manufacture enumeration exclusions and do not compare local state, dependencies, publish output, or symlink targets', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-frontier-local-'));
  const left = path.join(root, 'left');
  const right = path.join(root, 'right');
  try {
    await writeWorkspace(left, { 'visible.txt': encoder.encode('same\n'), '.git/private': encoder.encode('left'), '.tiinex/session': encoder.encode('left'), 'node_modules/pkg/index.js': encoder.encode('left'), '.site-publish/out': encoder.encode('left') });
    await writeWorkspace(right, { 'visible.txt': encoder.encode('same\n'), '.git/private': encoder.encode('right'), '.tiinex/session': encoder.encode('right'), 'node_modules/pkg/index.js': encoder.encode('right'), '.site-publish/out': encoder.encode('right') });
    await writeFile(path.join(root, 'outside.txt'), 'outside differs');
    try { await symlink(path.join(root, 'outside.txt'), path.join(left, 'linked.txt')); } catch { /* symlink may be unavailable on some test hosts */ }
    const result = await compareNodeSourceFrontiers({
      left: { kind: 'local-workspace', path: left, workspaceId: 'core' },
      right: { kind: 'local-workspace', path: right, workspaceId: 'core' }
    });
    assert.equal(result.status, 'ready');
    assert.equal(result.state, 'exact');
    assert.equal(result.inputs.left.workspaces[0].snapshot.entryCount, 1);
    assert.equal(result.inputs.left.workspaces[0].snapshot.evidence.sourceSelection, 'enumerateNodeWorkspace');
  } finally { await rm(root, { recursive: true, force: true }); }
});










test('three-way Node adapter accepts the actual child-return shape with explicit base/incoming/current kinds', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-frontier-threeway-'));
  try {
    const base = path.join(root, 'base'); const incoming = path.join(root, 'incoming'); const current = path.join(root, 'current');
    await writeWorkspace(base, { 'a.txt': encoder.encode('base'), 'b.txt': encoder.encode('base') });
    await writeWorkspace(incoming, { 'a.txt': encoder.encode('incoming'), 'b.txt': encoder.encode('base') });
    await writeWorkspace(current, { 'a.txt': encoder.encode('base'), 'b.txt': encoder.encode('current') });
    const result = await compareNodeSourceFrontiers({
      base: { kind: 'local-workspace', path: base, workspaceId: 'core' },
      incoming: { kind: 'local-workspace', path: incoming, workspaceId: 'core' },
      current: { kind: 'local-workspace', path: current, workspaceId: 'core' }
    });
    assert.equal(result.mode, 'three-way');
    assert.equal(result.status, 'ready');
    assert.equal(result.state, 'changed');
    assert.deepEqual(result.workspaces[0].paths.map((item) => item.classification), ['incoming-only', 'current-only']);
  } finally { await rm(root, { recursive: true, force: true }); }
});



test('manufacture reconciliation proof classifies exact/non-overlap/concurrent/deletion/conflict paths and requires explicit risky dispositions', () => {
  const base = frontier('base', [{ workspaceId: 'core', entries: [
    entry('exact.txt', 'base-exact'),
    entry('incoming.txt', 'base-incoming'),
    entry('current.txt', 'base-current'),
    entry('same.txt', 'base-same'),
    entry('delete.txt', 'base-delete'),
    entry('conflict.txt', 'base-conflict')
  ] }]);
  const incoming = frontier('incoming', [{ workspaceId: 'core', entries: [
    entry('exact.txt', 'base-exact'),
    entry('incoming.txt', 'incoming-change'),
    entry('current.txt', 'base-current'),
    entry('same.txt', 'same-result'),
    entry('conflict.txt', 'incoming-conflict')
  ] }]);
  const current = frontier('current', [{ workspaceId: 'core', entries: [
    entry('exact.txt', 'base-exact'),
    entry('incoming.txt', 'base-incoming'),
    entry('current.txt', 'current-change'),
    entry('same.txt', 'same-result'),
    entry('delete.txt', 'base-delete'),
    entry('conflict.txt', 'current-conflict')
  ] }]);
  const reconciled = frontier('reconciled', [{ workspaceId: 'core', entries: [
    entry('exact.txt', 'base-exact'),
    entry('incoming.txt', 'incoming-change'),
    entry('current.txt', 'current-change'),
    entry('same.txt', 'same-result'),
    entry('conflict.txt', 'manual-conflict-resolution')
  ] }]);

  const blocked = provePortableSourceReconciliation({ base, incoming, current, reconciled });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.state, 'disposition-required');
  assert.equal(blocked.counts.deletionCandidate, 1);
  assert.equal(blocked.counts.conflictingOverlap, 1);
  assert.equal(blocked.counts.unresolvedDisposition, 2);
  assert.deepEqual(blocked.workspaces[0].paths.map((item) => [item.path, item.classification]), [
    ['conflict.txt', 'conflicting-overlap'],
    ['current.txt', 'current-only'],
    ['delete.txt', 'deletion-candidate'],
    ['exact.txt', 'exact'],
    ['incoming.txt', 'incoming-only'],
    ['same.txt', 'same-result-concurrent']
  ]);

  const ready = provePortableSourceReconciliation({
    base,
    incoming,
    current,
    reconciled,
    dispositions: [
      { workspaceId: 'core', path: 'delete.txt', action: 'delete', note: 'owner explicitly accepted deletion' },
      { workspaceId: 'core', path: 'conflict.txt', action: 'reconciled', note: 'owner explicitly accepted manual resolution bytes' }
    ]
  });
  assert.equal(ready.status, 'ready');
  assert.equal(ready.state, 'manufacture-ready');
  assert.equal(ready.counts.resolvedDisposition, 2);
  assert.deepEqual(ready.preservation.incomingOnly, { accepted: 1, preserved: 1, failed: 0 });
  assert.deepEqual(ready.preservation.currentOnly, { accepted: 1, preserved: 1, failed: 0 });
  assert.equal(ready.operationBoundary.automaticMerge, false);
  assert.equal(ready.operationBoundary.semanticDisposition, false);
  assert.ok(/^[0-9a-f]{64}$/.test(ready.proofFingerprint));

  const summary = projectPortableSourceReconciliationProofSummary(ready, { maxPaths: 2 });
  assert.equal(summary.workspaces[0].paths.length, 2);
  assert.equal(summary.workspaces[0].pathsOmitted, 4);
  assert.equal(summary.fullReceiptRequiredForManufacture, true);

  const qualification = qualifyPortableSourceReconciliationProofForManufacture({
    proof: ready,
    requireProof: true,
    requiredWorkspaceIds: ['core'],
    workspaceMaterializations: [{ id: 'core', includedEntries: reconciled.workspaces[0].snapshot.entries }]
  });
  assert.equal(qualification.state, 'qualified');

  const drifted = reconciled.workspaces[0].snapshot.entries.map((item, index) => index ? item : { ...item, sha256: '0'.repeat(64) });
  const stale = qualifyPortableSourceReconciliationProofForManufacture({
    proof: ready,
    requireProof: true,
    requiredWorkspaceIds: ['core'],
    workspaceMaterializations: [{ id: 'core', includedEntries: drifted }]
  });
  assert.equal(stale.state, 'blocked');
  assert.ok(stale.findings.some((item) => item.code === 'portable.handoff-manufacture.reconciliation-proof.source-drift'));

  const compactRejected = qualifyPortableSourceReconciliationProofForManufacture({
    proof: { schema: 'tiinex.portable.operation.result.v1', resultSchema: ready.schema, status: ready.status, state: ready.state, proofFingerprint: ready.proofFingerprint, manufactureBinding: ready.manufactureBinding },
    requireProof: true,
    requiredWorkspaceIds: ['core'],
    workspaceMaterializations: [{ id: 'core', includedEntries: reconciled.workspaces[0].snapshot.entries }]
  });
  assert.equal(compactRejected.state, 'blocked');
  assert.ok(compactRejected.findings.some((item) => item.code === 'portable.handoff-manufacture.reconciliation-proof.full-receipt-required'));
});


test('reconciliation proof catches the complete-return overlay failure by requiring current-only source preservation', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-reconciliation-overlay-'));
  const baseRoot = path.join(root, 'base');
  const incomingRoot = path.join(root, 'incoming');
  const currentRoot = path.join(root, 'current');
  const badRoot = path.join(root, 'bad-overlay');
  const goodRoot = path.join(root, 'reconciled');
  try {
    await writeWorkspace(baseRoot, { 'shared.txt': encoder.encode('base\n') });
    await writeWorkspace(incomingRoot, { 'shared.txt': encoder.encode('base\n'), '.topics/incoming-return.trace.md': encoder.encode('incoming\n') });
    await writeWorkspace(currentRoot, { 'shared.txt': encoder.encode('base\n'), '.topics/current-only-ancestry.trace.md': encoder.encode('current\n') });
    await writeWorkspace(badRoot, { 'shared.txt': encoder.encode('base\n'), '.topics/incoming-return.trace.md': encoder.encode('incoming\n') });
    await writeWorkspace(goodRoot, {
      'shared.txt': encoder.encode('base\n'),
      '.topics/incoming-return.trace.md': encoder.encode('incoming\n'),
      '.topics/current-only-ancestry.trace.md': encoder.encode('current\n')
    });

    const common = {
      base: { kind: 'local-workspace', path: baseRoot, workspaceId: 'core' },
      incoming: { kind: 'local-workspace', path: incomingRoot, workspaceId: 'core' },
      current: { kind: 'local-workspace', path: currentRoot, workspaceId: 'core' }
    };
    const bad = await proveNodeSourceReconciliation({ ...common, reconciled: { kind: 'local-workspace', path: badRoot, workspaceId: 'core' } });
    assert.equal(bad.status, 'blocked');
    assert.equal(bad.state, 'reconciled-frontier-mismatch');
    const currentOnly = bad.workspaces[0].paths.find((item) => item.path === '.topics/current-only-ancestry.trace.md');
    assert.equal(currentOnly.classification, 'current-only');
    assert.equal(currentOnly.reconciledMatch, 'mismatch');
    assert.deepEqual(bad.preservation.currentOnly, { accepted: 1, preserved: 0, failed: 1 });

    const good = await proveNodeSourceReconciliation({ ...common, reconciled: { kind: 'local-workspace', path: goodRoot, workspaceId: 'core' } });
    assert.equal(good.status, 'ready');
    assert.equal(good.state, 'manufacture-ready');
    assert.deepEqual(good.preservation.incomingOnly, { accepted: 1, preserved: 1, failed: 0 });
    assert.deepEqual(good.preservation.currentOnly, { accepted: 1, preserved: 1, failed: 0 });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});


test('manufacture proof fails closed when required proof is missing or candidate adds ungrounded source', () => {
  const base = frontier('base', [{ workspaceId: 'core', entries: [entry('a.txt', 'base')] }]);
  const incoming = frontier('incoming', [{ workspaceId: 'core', entries: [entry('a.txt', 'incoming')] }]);
  const current = frontier('current', [{ workspaceId: 'core', entries: [entry('a.txt', 'base')] }]);
  const reconciled = frontier('reconciled', [{ workspaceId: 'core', entries: [entry('a.txt', 'incoming'), entry('extra.txt', 'ungrounded')] }]);
  const proof = provePortableSourceReconciliation({ base, incoming, current, reconciled });
  assert.equal(proof.status, 'blocked');
  assert.ok(proof.findings.some((item) => item.code === 'portable.source-frontier.reconciliation.reconciled-path-unexpected'));

  const missing = qualifyPortableSourceReconciliationProofForManufacture({ requireProof: true, requiredWorkspaceIds: ['core'], workspaceMaterializations: [] });
  assert.equal(missing.state, 'blocked');
  assert.ok(missing.findings.some((item) => item.code === 'portable.handoff-manufacture.reconciliation-proof.required'));
});

test('handoff manufacture preflight consumes the full reconciliation receipt and rejects source drift before carriage', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-reconciliation-manufacture-'));
  try {
    await writeWorkspace(root, {
      'handoff.trace.md': encoder.encode('# Handoff\n\n## Required Context\n\nNone\n\n## Reference Context\n\nNone\n'),
      'source.txt': encoder.encode('qualified candidate\n')
    });
    const source = { kind: 'local-workspace', path: root, workspaceId: 'core' };
    const proof = await proveNodeSourceReconciliation({ base: source, incoming: source, current: source, reconciled: source });
    assert.equal(proof.status, 'ready');

    const qualified = await prepareNodeHandoffManufacturingInput({
      workspaceRoot: root,
      workspaceId: 'core',
      handoffPath: 'handoff.trace.md',
      reconciliationProof: proof,
      requireReconciliationProof: true
    });
    assert.equal(qualified.reconciliationProofQualification.state, 'qualified');
    assert.equal(qualified.manufacturingEvidence.reconciliationProof.proofFingerprint, proof.proofFingerprint);

    await writeFile(path.join(root, 'source.txt'), 'drift after proof\n');
    const drifted = await prepareNodeHandoffManufacturingInput({
      workspaceRoot: root,
      workspaceId: 'core',
      handoffPath: 'handoff.trace.md',
      reconciliationProof: proof,
      requireReconciliationProof: true
    });
    assert.equal(drifted.reconciliationProofQualification.state, 'blocked');
    assert.ok(drifted.reconciliationProofQualification.findings.some((item) => item.code === 'portable.handoff-manufacture.reconciliation-proof.source-drift'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

