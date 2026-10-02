import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
import { inspectPortableToolingBootstrap } from '../src/tooling/portable/handoff/toolingBootstrap.js';
import { packageFileBytes } from '../src/export/package.bytes.js';

const run = promisify(execFile);
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

test('bootstrap build timestamp is truthful bundle metadata while composition identity stays timestamp-independent', async () => {
  const first = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-09-29T10:00:00.000Z' });
  const second = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-09-29T11:00:00.000Z' });
  assert.equal(first.manifest.schema, 'tiinex.portable.tooling-bootstrap.manifest.v2');
  assert.equal(first.manifest.build.createdAt, '2026-09-29T10:00:00.000Z');
  assert.equal(first.manifest.build.orderingAuthority, 'none');
  assert.equal(second.manifest.build.createdAt, '2026-09-29T11:00:00.000Z');
  assert.equal(first.manifest.composition.sha256, first.manifest.runtime.representationSha256);
  assert.equal(first.manifest.composition.sha256, second.manifest.composition.sha256);
  assert.notEqual(first.summary.manifestSha256, second.summary.manifestSha256);
  assert.equal(first.summary.compositionSha256, second.summary.compositionSha256);
  assert.equal(first.manifest.core.name, '@tiinex/core');
  assert.ok(first.manifest.core.version);
  const inspection = inspectPortableToolingBootstrap({ files: first.files });
  assert.equal(inspection.status, 'valid');
  assert.equal(inspection.identity.state, 'declared-comparison-identity');
  assert.equal(inspection.identity.builtAt, '2026-09-29T10:00:00.000Z');
  assert.equal(inspection.identity.compositionSha256, first.manifest.composition.sha256);
});

test('legacy bootstrap manifest v1 remains inspectable without invented comparison metadata', async () => {
  const built = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-09-29T12:00:00.000Z' });
  const legacyManifest = structuredClone(built.manifest);
  legacyManifest.schema = 'tiinex.portable.tooling-bootstrap.manifest.v1';
  delete legacyManifest.build;
  delete legacyManifest.core;
  delete legacyManifest.composition;
  const legacyFiles = built.files.map((file) => file.path === 'tiinex.bootstrap/manifest.json'
    ? { ...file, content: `${JSON.stringify(legacyManifest, null, 2)}\n`, data: undefined, bytesData: undefined, bytes: undefined }
    : file);
  const inspection = inspectPortableToolingBootstrap({ files: legacyFiles });
  assert.equal(inspection.status, 'valid');
  assert.equal(inspection.identity.state, 'legacy-derived-composition-only');
  assert.equal(inspection.identity.builtAt, '');
  assert.equal(inspection.identity.orderingAuthority, 'none');
  assert.equal(inspection.identity.compositionSha256, legacyManifest.runtime.representationSha256);
  assert.equal(inspection.qualification.buildTimestampOrderingAuthority, false);
});

test('extracted bootstrap version command projects exact local Core, composition, schemas and companions without network', async () => {
  const tooling = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-09-29T12:34:56.000Z' });
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-version-'));
  try {
    for (const file of tooling.files) {
      const target = path.join(dir, ...String(file.path).split('/'));
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, packageFileBytes(file));
    }
    const entrypoint = path.join(dir, 'tiinex.bootstrap', 'runtime', 'tools', 'tiinex-portable.mjs');
    const jsonResult = await run(process.execPath, [entrypoint, 'version', '--json'], { maxBuffer: 16 * 1024 * 1024 });
    const receipt = JSON.parse(jsonResult.stdout);
    assert.equal(receipt.status, 'ready');
    assert.equal(receipt.bundle.state, 'bundled-bootstrap-runtime');
    assert.equal(receipt.bundle.builtAt, '2026-09-29T12:34:56.000Z');
    assert.equal(receipt.bundle.orderingAuthority, 'none');
    assert.equal(receipt.core.name, '@tiinex/core');
    assert.equal(receipt.composition.sha256, tooling.manifest.composition.sha256);
    assert.equal(receipt.schemaPacks[0].count, 108);
    assert.equal(receipt.schemaPacks[0].schemas.length, 108);
    assert.equal(receipt.companions.specialized, 25);
    assert.equal(receipt.companions.generic, 83);
    const evidence = receipt.schemaPacks[0].schemas.find((item) => item.schemaId === 'tiinex.evidence.v1');
    assert.equal(evidence.parentSchemaId, 'tiinex.preservation.v1');
    assert.equal(evidence.companion.mode, 'specialized');
    assert.ok(evidence.companion.facets.includes('validate'));
    const treeResult = await run(process.execPath, [entrypoint, 'version', '--tree'], { maxBuffer: 16 * 1024 * 1024 });
    assert.match(treeResult.stdout, /Dependency tree:/);
    assert.match(treeResult.stdout, /tiinex\.root\.v1 \[specialized/);
    assert.match(treeResult.stdout, /tiinex\.evidence\.v1 \[specialized/);
    assert.match(treeResult.stdout, /Built At, Core version, ZIP SHA, and arrival order do not by themselves establish semantic supersession/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('source-checkout version stays truthful when no bootstrap manifest surrounds the runtime', async () => {
  const result = await run(process.execPath, [path.join(ROOT, 'tools', 'tiinex-portable.mjs'), 'version', '--json'], { maxBuffer: 16 * 1024 * 1024 });
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.bundle.state, 'source-runtime-unbundled');
  assert.equal(receipt.bundle.builtAt, '');
  assert.equal(receipt.composition.state, 'unbundled-source-runtime');
  assert.equal(receipt.composition.sha256, '');
  assert.equal(receipt.schemaPacks[0].count, 108);
});
