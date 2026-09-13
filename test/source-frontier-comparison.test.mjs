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
import { packageFileByteView, sha256Hex } from '../src/export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../src/export/package.zip.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { auditPortableRecoveryAcceptance } from '../src/tooling/portable/handoff/recoveryAcceptanceAudit.js';
import {
  buildRecipientFacingV2PackageV1,
  buildRecipientFacingV2PackageV1Secure,
  openRecipientV2PackageV1SealedWorkspace
} from '../src/tooling/portable/handoff/recipientV2.packageV1.js';

const encoder = new TextEncoder();
const WORKSPACE_INNER_PATH = '.topics/.workspaces/tiinex-core.workspace.md';
const ROUTE_PATH = '.topics/handoffs/return.trace.md';
const SECRET_PATH = '.topics/context/secret.trace.md';
const PASSWORD = 'frontier comparison fixture password';
const WORKSPACE_BYTES = new Uint8Array(await readFile(new URL('../.topics/.workspaces/tiinex-core.workspace.md', import.meta.url)));

function h(text) { const data = encoder.encode(text); return { bytes: data.byteLength, sha256: sha256Hex(data) }; }
function entry(pathname, text) { return { path: pathname, ...h(text) }; }
function frontier(id, workspaces) { return createPortableSourceFrontier({ id, workspaces }); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }

function minimalBootstrapFiles() {
  const runtime = encoder.encode('export const bootstrap = true;\n');
  const entries = [{ path: 'runtime/tooling.mjs', bytes: runtime.byteLength, sha256: sha256Hex(runtime) }];
  const manifest = {
    schema: 'tiinex.portable.tooling-bootstrap.manifest.v1', delivery: 'embedded', entrypoint: 'runtime/tooling.mjs',
    runtime: { entries, representationSha256: sha256Hex(encoder.encode(stableJson(entries))) }
  };
  return [
    { path: 'tiinex.bootstrap/manifest.json', data: encoder.encode(JSON.stringify(manifest)) },
    { path: 'tiinex.bootstrap/runtime/tooling.mjs', data: runtime }
  ];
}

function packageFixtureSource({ includeAux = false, sealed = false, coreFiles = {} } = {}) {
  const routeMarkdown = qualifiedHandoffFixture(sealed ? {
    requiredContext: `- Secret Context\n  - Material: sealed workspace material\n  - Purpose: verify locked comparison opacity\n  - Availability: unavailable\n  - Material Reference: [Secret](sealed::${SECRET_PATH})`
  } : {});
  const routeBytes = encoder.encode(routeMarkdown);
  const coreReadme = encoder.encode('core comparison fixture\n');
  const auxReadme = encoder.encode('aux comparison fixture\n');
  const secretBytes = encoder.encode('# secret-name-do-not-leak\nclassified fixture bytes\n');
  const archives = [{
    workspaceId: 'core', archivePath: 'source-core.zip', data: exportFileMapZipUint8Array([
      { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES }, { path: ROUTE_PATH, data: routeBytes }, { path: 'README.md', data: coreReadme },
      ...Object.entries(coreFiles).map(([entryPath, data]) => ({ path: entryPath, data }))
    ])
  }];
  if (includeAux) archives.push({
    workspaceId: 'aux', archivePath: 'source-aux.zip', data: exportFileMapZipUint8Array([
      { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES }, { path: 'README.md', data: auxReadme }
    ])
  });
  if (sealed) archives.push({
    workspaceId: 'sealed', archivePath: 'source-sealed.zip', data: exportFileMapZipUint8Array([
      { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES }, { path: SECRET_PATH, data: secretBytes }
    ])
  });
  const sourceSurface = {
    status: 'ready',
    topology: { workspaces: archives.map(({ workspaceId, archivePath }) => ({ workspaceId, coverage: 'complete', archivePath, sourceWorkspaceTargetInnerPath: WORKSPACE_INNER_PATH })) },
    files: archives.map(({ archivePath, data }) => ({ path: archivePath, data }))
  };
  const descriptor = {
    workspaceArchiveBindings: [{ workspaceId: 'core', entryMap: { entries: [{ path: ROUTE_PATH, bytes: routeBytes.byteLength, sha256: sha256Hex(routeBytes) }] } }],
    materialized: [], requirements: { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [] }
  };
  const route = {
    state: 'qualified', id: `handoff-route:core:${ROUTE_PATH}`, workspaceId: 'core', workspaceRelativePath: ROUTE_PATH, sha256: sha256Hex(routeBytes),
    parties: { from: 'Anchor', to: 'Loom' }, materialRequirements: { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [] }, requiredClosure: { requirements: [] }
  };
  return {
    sourceSurface, descriptor, carrierProjection: { lineage: { dimension: '001', checkpointKind: 'progression' }, routes: [route] },
    bundle: { files: minimalBootstrapFiles() }, createdAt: '2026-09-10 17:00:00', routeBytes, coreReadme, auxReadme, secretBytes,
    sealedArchive: archives.find((item) => item.workspaceId === 'sealed')?.data || null
  };
}

async function writePackageZip(dir, name, result) {
  const target = path.join(dir, name);
  await writeFile(target, exportFileMapZipUint8Array(result.files));
  return target;
}

async function writeWorkspace(root, files) {
  for (const [relative, data] of Object.entries(files)) {
    const target = path.join(root, ...relative.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
  }
}

function localWorkspaceFiles(routeBytes, readme) {
  return { [WORKSPACE_INNER_PATH]: WORKSPACE_BYTES, [ROUTE_PATH]: routeBytes, 'README.md': readme };
}

function auxWorkspaceFiles(readme) { return { [WORKSPACE_INNER_PATH]: WORKSPACE_BYTES, 'README.md': readme }; }


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



test('Recovery acceptance audit re-materializes qualified candidate bytes and blocks unexplained removals from the accepted basis', () => {
  const basisSource = packageFixtureSource({ coreFiles: {
    'src/keep.txt': encoder.encode('accepted basis keep\n'),
    'src/remove.txt': encoder.encode('accepted basis remove\n')
  } });
  const candidateSource = packageFixtureSource({ coreFiles: {
    'src/keep.txt': encoder.encode('candidate changed keep\n'),
    'src/add.txt': encoder.encode('candidate addition\n')
  } });
  const basisBuilt = buildRecipientFacingV2PackageV1(basisSource);
  const candidateBuilt = buildRecipientFacingV2PackageV1(candidateSource);
  assert.equal(basisBuilt.status, 'ready', JSON.stringify(basisBuilt.findings || []));
  assert.equal(candidateBuilt.status, 'ready', JSON.stringify(candidateBuilt.findings || []));

  const blocked = auditPortableRecoveryAcceptance({
    basis: { files: basisBuilt.files },
    candidate: { files: candidateBuilt.files },
    workspaceIds: ['core']
  });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.state, 'acceptance-audit-blocked');
  assert.equal(blocked.workspaces[0].materialization.state, 'qualified');
  assert.equal(blocked.workspaces[0].coverage, 'complete');
  assert.equal(blocked.workspaces[0].counts.removals, 1);
  assert.equal(blocked.workspaces[0].counts.unexplainedRemovals, 1);
  assert.deepEqual(blocked.workspaces[0].unexplainedRemovals, ['src/remove.txt']);
  assert.equal(blocked.suitability.state, 'blocked');
  assert.equal(blocked.suitability.gitCommitStateProven, false);
  assert.equal(blocked.suitability.semanticAcceptanceGranted, false);

  const explicitlyDisposed = auditPortableRecoveryAcceptance({
    basis: { files: basisBuilt.files },
    candidate: { files: candidateBuilt.files },
    workspaceIds: ['core'],
    expectedRemovals: { core: ['src/remove.txt'] }
  });
  assert.equal(explicitlyDisposed.status, 'ready');
  assert.equal(explicitlyDisposed.state, 'acceptance-audit-ready');
  assert.equal(explicitlyDisposed.workspaces[0].counts.unexplainedRemovals, 0);
  assert.equal(explicitlyDisposed.workspaces[0].counts.additions, 1);
  assert.equal(explicitlyDisposed.workspaces[0].counts.byteChanged, 1);
  assert.equal(explicitlyDisposed.suitability.state, 'restart-source-ready');
  assert.equal(explicitlyDisposed.suitability.semanticAcceptanceGranted, false);
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


test('Node adapter supports package/package, local/package, and local multi-Workspace/package exact comparisons', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-frontier-package-'));
  try {
    const fixture = packageFixtureSource({ includeAux: true });
    const built = buildRecipientFacingV2PackageV1(fixture);
    assert.equal(built.status, 'ready', JSON.stringify(built.findings || []));
    const packageA = await writePackageZip(root, 'a.handoff-package.zip', built);
    const packageB = await writePackageZip(root, 'b.handoff-package.zip', built);
    const coreRoot = path.join(root, 'local-core');
    const auxRoot = path.join(root, 'local-aux');
    await writeWorkspace(coreRoot, localWorkspaceFiles(fixture.routeBytes, fixture.coreReadme));
    await writeWorkspace(auxRoot, auxWorkspaceFiles(fixture.auxReadme));

    const packagePair = await compareNodeSourceFrontiers({
      left: { kind: 'handoff-package', path: packageA }, right: { kind: 'handoff-package', path: packageB }
    });
    assert.equal(packagePair.state, 'exact');
    assert.deepEqual(packagePair.workspaces.map((item) => item.workspaceId), ['aux', 'core']);

    const localPackage = await compareNodeSourceFrontiers({
      left: { kind: 'local-workspace', path: coreRoot, workspaceId: 'core' }, right: { kind: 'handoff-package', path: packageA, workspaceIds: ['core'] }
    });
    assert.equal(localPackage.state, 'exact');

    const frontierPackage = await compareNodeSourceFrontiers({
      left: { kind: 'local-frontier', workspaces: [{ workspaceId: 'core', root: coreRoot }, { workspaceId: 'aux', root: auxRoot }] },
      right: { kind: 'handoff-package', path: packageA }
    });
    assert.equal(frontierPackage.state, 'exact');
    assert.equal(frontierPackage.counts.workspaces, 2);
  } finally { await rm(root, { recursive: true, force: true }); }
});


test('real Site-return cache shape stays transport evidence but is excluded from reconciliation and manufacture source identity', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-frontier-site-cache-return-'));
  const baseRoot = path.join(root, 'base');
  const incomingSanitizedRoot = path.join(root, 'incoming-sanitized');
  const currentRoot = path.join(root, 'current');
  const reconciledRoot = path.join(root, 'reconciled');
  const durableBase = {
    'site/index.html': encoder.encode('<main>site</main>\n'),
    'tools/browser-smoke.py': encoder.encode('print("smoke")\n')
  };
  const durableIncoming = { 'site/returned.txt': encoder.encode('specialist durable return\n') };
  const cachePath = 'tools/__pycache__/browser-smoke.cpython-313.pyc';
  const currentOnly = { '.topics/current-only-ancestry.trace.md': encoder.encode('current ancestry\n') };
  try {
    const fixture = packageFixtureSource({
      coreFiles: {
        ...durableBase,
        ...durableIncoming,
        [cachePath]: new Uint8Array([0x42, 0x0d, 0x0d, 0x0a, 0x00, 0x01])
      }
    });
    const built = buildRecipientFacingV2PackageV1(fixture);
    assert.equal(built.status, 'ready', JSON.stringify(built.findings || []));
    const incomingPackage = await writePackageZip(root, 'site-return.handoff-package.zip', built);
    const controls = localWorkspaceFiles(fixture.routeBytes, fixture.coreReadme);
    await writeWorkspace(baseRoot, { ...controls, ...durableBase });
    await writeWorkspace(incomingSanitizedRoot, { ...controls, ...durableBase, ...durableIncoming });
    await writeWorkspace(currentRoot, { ...controls, ...durableBase, ...currentOnly });
    await writeWorkspace(reconciledRoot, { ...controls, ...durableBase, ...durableIncoming, ...currentOnly });

    const packageVsSanitized = await compareNodeSourceFrontiers({
      left: { kind: 'handoff-package', path: incomingPackage, workspaceIds: ['core'] },
      right: { kind: 'local-workspace', path: incomingSanitizedRoot, workspaceId: 'core' }
    });
    assert.equal(packageVsSanitized.status, 'ready');
    assert.equal(packageVsSanitized.state, 'exact');
    const carriedSnapshot = packageVsSanitized.inputs.left.workspaces[0].snapshot;
    assert.equal(carriedSnapshot.evidence.sourceEligibility.excludedEntryCount, 0);
    assert.equal(carriedSnapshot.evidence.sourceEligibility.upstreamSelection.excludedEntryCount, 1);
    assert.equal(carriedSnapshot.evidence.sourceEligibility.upstreamSelection.excludedByReason['excluded-directory'], 1);
    assert.equal(carriedSnapshot.entryCount + 1, carriedSnapshot.evidence.sourceEligibility.upstreamSelection.inputEntryCount);

    const proof = await proveNodeSourceReconciliation({
      base: { kind: 'local-workspace', path: baseRoot, workspaceId: 'core' },
      incoming: { kind: 'handoff-package', path: incomingPackage, workspaceIds: ['core'] },
      current: { kind: 'local-workspace', path: currentRoot, workspaceId: 'core' },
      reconciled: { kind: 'local-workspace', path: reconciledRoot, workspaceId: 'core' }
    });
    assert.equal(proof.status, 'ready', JSON.stringify(proof.findings || []));
    assert.equal(proof.state, 'manufacture-ready');
    assert.equal(proof.dispositions.length, 0);
    assert.equal(proof.counts.incomingOnly, 1);
    assert.equal(proof.counts.currentOnly, 1);
    assert.equal(proof.counts.deletionCandidate, 0);
    assert.equal(proof.workspaces[0].paths.some((item) => item.path === cachePath), false);
    assert.deepEqual(proof.preservation.incomingOnly, { accepted: 1, preserved: 1, failed: 0 });
    assert.deepEqual(proof.preservation.currentOnly, { accepted: 1, preserved: 1, failed: 0 });

    const manufacture = await prepareNodeHandoffManufacturingInput({
      workspaceRoot: reconciledRoot,
      workspaceId: 'core',
      handoffPath: ROUTE_PATH,
      reconciliationProof: proof,
      requireReconciliationProof: true
    });
    assert.equal(manufacture.reconciliationProofQualification.state, 'qualified');
    assert.equal(manufacture.workspaceMaterializations[0].includedEntries.some((item) => item.path === cachePath), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});


test('invalid package/input fails closed with qualification state and no projected Workspace paths', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-frontier-invalid-'));
  try {
    const malformed = path.join(root, 'malformed.zip');
    await writeFile(malformed, encoder.encode('not a zip'));
    const invalidPackage = await compareNodeSourceFrontiers({
      left: { kind: 'handoff-package', path: malformed }, right: { kind: 'normalized-frontier', frontier: frontier('right', []) }
    });
    assert.equal(invalidPackage.status, 'blocked');
    assert.equal(invalidPackage.state, 'qualification-error');
    assert.equal(invalidPackage.inputs.left.workspaces.length, 0);

    const missingKind = await compareNodeSourceFrontiers({ left: { path: root }, right: { kind: 'normalized-frontier', frontier: frontier('right', []) } });
    assert.equal(missingKind.status, 'blocked');
    assert.ok(missingKind.findings.some((item) => item.code === 'portable.source-frontier.node.kind-required'));
  } finally { await rm(root, { recursive: true, force: true }); }
});


test('sealed package comparison remains opaque while locked and reveals exact paths only through a package-correlated authorized open result', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-frontier-sealed-'));
  try {
    const fixture = packageFixtureSource({ sealed: true });
    const built = await buildRecipientFacingV2PackageV1Secure({ ...fixture, sealedWorkspaces: [{ workspaceId: 'sealed', recipients: [{ slotId: 'recipient', password: PASSWORD }] }] });
    assert.equal(built.status, 'ready', JSON.stringify(built.findings || []));
    const bundle = { files: built.files };
    const packagePath = await writePackageZip(root, 'sealed.handoff-package.zip', built);
    const sealedRoot = path.join(root, 'local-sealed');
    await writeWorkspace(sealedRoot, { [WORKSPACE_INNER_PATH]: WORKSPACE_BYTES, [SECRET_PATH]: fixture.secretBytes });

    const locked = await compareNodeSourceFrontiers({
      left: { kind: 'handoff-package', path: packagePath, workspaceIds: ['sealed'] },
      right: { kind: 'local-workspace', path: sealedRoot, workspaceId: 'sealed' }
    });
    assert.equal(locked.status, 'ready');
    assert.equal(locked.state, 'locked');
    assert.equal(locked.workspaces[0].state, 'locked');
    const lockedJson = JSON.stringify(locked);
    assert.equal(lockedJson.includes(SECRET_PATH), false);
    assert.equal(lockedJson.includes('secret-name-do-not-leak'), false);

    const opened = await openRecipientV2PackageV1SealedWorkspace(bundle, { workspaceId: 'sealed', password: PASSWORD, slotId: 'recipient' });
    assert.equal(opened.state, 'opened-qualified');
    const exact = await compareNodeSourceFrontiers({
      left: { kind: 'handoff-package', path: packagePath, workspaceIds: ['sealed'], openedWorkspaces: [opened] },
      right: { kind: 'local-workspace', path: sealedRoot, workspaceId: 'sealed' }
    });
    assert.equal(exact.status, 'ready');
    assert.equal(exact.state, 'exact');

    const spoofed = { ...opened, workspaceArtifactSha256: '0'.repeat(64) };
    const rejectedSpoof = await compareNodeSourceFrontiers({
      left: { kind: 'handoff-package', path: packagePath, workspaceIds: ['sealed'], openedWorkspaces: [spoofed] },
      right: { kind: 'local-workspace', path: sealedRoot, workspaceId: 'sealed' }
    });
    assert.equal(rejectedSpoof.state, 'locked');
    assert.equal(JSON.stringify(rejectedSpoof).includes(SECRET_PATH), false);
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

