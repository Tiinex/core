import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  comparePortableSourceFrontiers,
  createPortableSourceFrontier,
  projectPortableSourceFrontierComparisonSummary,
  reconcilePortableSourceFrontiers
} from '../src/public/index.js';
import { compareNodeSourceFrontiers } from '../src/public/node.js';
import { packageFileByteView, sha256Hex } from '../src/export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../src/export/package.zip.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
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

function packageFixtureSource({ includeAux = false, sealed = false } = {}) {
  const routeMarkdown = qualifiedHandoffFixture(sealed ? {
    requiredContext: `- Secret Context\n  - Material: sealed workspace material\n  - Purpose: verify locked comparison opacity\n  - Availability: unavailable\n  - Material Reference: [Secret](sealed::${SECRET_PATH})`
  } : {});
  const routeBytes = encoder.encode(routeMarkdown);
  const coreReadme = encoder.encode('core comparison fixture\n');
  const auxReadme = encoder.encode('aux comparison fixture\n');
  const secretBytes = encoder.encode('# secret-name-do-not-leak\nclassified fixture bytes\n');
  const archives = [{
    workspaceId: 'core', archivePath: 'source-core.zip', data: exportFileMapZipUint8Array([
      { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES }, { path: ROUTE_PATH, data: routeBytes }, { path: 'README.md', data: coreReadme }
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
