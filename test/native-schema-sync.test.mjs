import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import catalog from '../src/schemas/generated/native.schema.catalog.json' with { type: 'json' };
import { nativeSchemaMarkdownById } from '../src/schemas/generated/native.schema.pack.js';
import { resolveSchemaModule } from '../src/schemas/resolver.js';
import { buildNativeSchemaSyncPlan, checkNativeSchemas, synchronizeNativeSchemas } from '../src/tooling/portable/adapters/node/schema.sync.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceCommit = String(catalog?.source?.commit || '');
const catalogPublished = catalog?.source?.publicationState === 'published-immutable-canonical' && /^[0-9a-f]{40}$/.test(sourceCommit);

async function materializeDocsSnapshot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-docs-'));
  for (const entry of catalog.entries || []) {
    const target = path.join(root, String(entry.binding.sourcePath || ''));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, String(nativeSchemaMarkdownById[entry.schemaId] || ''), 'utf8');
  }
  return root;
}

test('native schema check reproduces the current generated catalog from exact local Docs bytes', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  const result = await checkNativeSchemas({
    coreRoot: repoRoot,
    docsRoot,
    sourceCommit: catalogPublished ? sourceCommit : '',
    repository: 'Tiinex/docs',
    published: catalogPublished
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.catalog.schemaCount, catalog.count);
  assert.equal(result.catalog.specializedCount, catalog.entries.filter((entry) => entry.specialized).length);
  assert.equal(result.catalog.genericCount, catalog.entries.filter((entry) => !entry.specialized).length);
  assert.equal(result.generated.driftCount, 0);
  assert.equal(result.generated.staleLocalSchemaCopies, 0);
  assert.equal(result.findingSummary.counts.error, 0);
});

test('native schema check fails closed when one canonical source byte changes', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  const evidence = catalog.entries.find((entry) => entry.schemaId === 'tiinex.evidence.v1');
  assert.ok(evidence);
  const target = path.join(docsRoot, evidence.binding.sourcePath);
  await writeFile(target, `${await readFile(target, 'utf8')}\n`, 'utf8');
  const result = await checkNativeSchemas({
    coreRoot: repoRoot,
    docsRoot,
    sourceCommit: catalogPublished ? sourceCommit : '',
    repository: 'Tiinex/docs',
    published: catalogPublished
  });
  assert.equal(result.status, 'blocked');
  assert.ok(result.generated.driftCount > 0);
  assert.ok(result.findings.some((finding) => finding.code === 'schema-sync.generated-drift'));
});

test('local-unpublished sync plan preserves content authority without inventing immutable publication locators', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  const evidenceEntry = catalog.entries.find((entry) => entry.schemaId === 'tiinex.evidence.v1');
  assert.ok(evidenceEntry);
  const evidenceSource = path.join(docsRoot, evidenceEntry.binding.sourcePath);
  await writeFile(evidenceSource, `${await readFile(evidenceSource, 'utf8')}\n<!-- local-unpublished-schema-edit -->\n`, 'utf8');
  const plan = await buildNativeSchemaSyncPlan({ coreRoot: repoRoot, docsRoot, repository: 'Tiinex/docs', published: false });
  assert.equal(plan.status, 'ready');
  const evidence = plan.outputs.find((output) => String(output.path).replace(/\\/g, '/').endsWith('/core/evidence/tiinex.evidence.v1.schema.json'));
  assert.ok(evidence);
  const binding = JSON.parse(evidence.bytes.toString('utf8'));
  assert.equal(binding.publicationState, 'qualified-local-unpublished');
  assert.equal(binding.schemaReferencePublicationState, 'qualified-local-unpublished');
  assert.equal(binding.sourceCommit, '');
  assert.equal(binding.permalink, '');
  assert.equal(binding.rawUrl, '');
});

test('published sync does not rewrite generated files when a newer Docs commit carries identical schema material', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  const coreRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-no-rewrite-core-'));
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  t.after(() => rm(coreRoot, { recursive: true, force: true }));
  const firstCommit = 'a'.repeat(40);
  const newerCommit = 'b'.repeat(40);
  const first = await synchronizeNativeSchemas({ coreRoot, docsRoot, sourceCommit: firstCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(first.status, 'ready');
  assert.ok(first.generated.filesWritten > 0);

  const catalogPath = path.join(coreRoot, 'src', 'schemas', 'generated', 'native.schema.catalog.json');
  const marker = new Date('2001-02-03T04:05:06.000Z');
  await utimes(catalogPath, marker, marker);
  const before = await stat(catalogPath);

  const second = await synchronizeNativeSchemas({ coreRoot, docsRoot, sourceCommit: newerCommit, repository: 'Tiinex/docs', published: true });
  const after = await stat(catalogPath);
  assert.equal(second.status, 'ready');
  assert.equal(second.generated.filesWritten, 0);
  assert.equal(second.generated.unchangedFiles, second.generated.files);
  assert.equal(after.mtimeMs, before.mtimeMs);

  const projected = JSON.parse(await readFile(catalogPath, 'utf8'));
  assert.equal(projected.source.commit, firstCommit);
  assert.ok(projected.entries.every((entry) => entry.binding?.sourceCommit === firstCommit));
});

test('published sync is a byte-no-op when a newer Docs commit carries an identical schema snapshot', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  const coreRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-published-noop-core-'));
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  t.after(() => rm(coreRoot, { recursive: true, force: true }));
  const firstCommit = 'a'.repeat(40);
  const newerCommit = 'b'.repeat(40);
  const first = await synchronizeNativeSchemas({ coreRoot, docsRoot, sourceCommit: firstCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(first.status, 'ready');
  const plan = await buildNativeSchemaSyncPlan({ coreRoot, docsRoot, sourceCommit: newerCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(plan.status, 'ready');
  const drift = [];
  for (const output of plan.outputs) {
    let actual = null;
    try { actual = await readFile(output.path); } catch {}
    if (!actual || !actual.equals(output.bytes)) drift.push(path.relative(coreRoot, output.path).replace(/\\/g, '/'));
  }
  assert.deepEqual(drift, []);
});

test('published sync rebinds only materially changed schemas while preserving equivalent immutable schema bindings', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  const coreRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-published-change-core-'));
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  t.after(() => rm(coreRoot, { recursive: true, force: true }));
  const firstCommit = 'a'.repeat(40);
  const newerCommit = 'b'.repeat(40);
  const first = await synchronizeNativeSchemas({ coreRoot, docsRoot, sourceCommit: firstCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(first.status, 'ready');
  const evidenceEntry = catalog.entries.find((entry) => entry.schemaId === 'tiinex.evidence.v1');
  assert.ok(evidenceEntry);
  const evidenceSource = path.join(docsRoot, evidenceEntry.binding.sourcePath);
  await writeFile(evidenceSource, `${await readFile(evidenceSource, 'utf8')}\n<!-- material schema change -->\n`, 'utf8');

  const plan = await buildNativeSchemaSyncPlan({ coreRoot, docsRoot, sourceCommit: newerCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(plan.status, 'ready');
  const catalogOutput = plan.outputs.find((output) => String(output.path).replace(/\\/g, '/').endsWith('/src/schemas/generated/native.schema.catalog.json'));
  assert.ok(catalogOutput);
  const projected = JSON.parse(catalogOutput.bytes.toString('utf8'));
  assert.equal(projected.source.commit, newerCommit);
  assert.equal(projected.entries.find((entry) => entry.schemaId === 'tiinex.evidence.v1')?.binding?.sourceCommit, newerCommit);
  assert.equal(projected.entries.find((entry) => entry.schemaId === 'tiinex.topic.v1')?.binding?.sourceCommit, firstCommit);
  assert.equal(projected.entries.find((entry) => entry.schemaId === 'tiinex.claim.v1')?.binding?.sourceCommit, firstCommit);
});

test('canonical schemas without handwritten companions remain registry-known through generic Schema Pack modules', () => {
  const resolution = resolveSchemaModule({ schemaId: 'tiinex.claim.v1' });
  assert.equal(resolution.status, 'schema-id-match');
  assert.equal(resolution.fallbackUsed, false);
  assert.equal(resolution.module.id, 'tiinex.claim.v1');
  assert.equal(resolution.module.schemaSource.qualify().state, 'qualified');
});

test('specialized runtime projections omit compiler-only merged group trees while retaining normalized validation products', async () => {
  const runtimePath = path.join(repoRoot, 'src/schemas/core/evidence/tiinex.evidence.v1.schema.runtime.json');
  const runtime = JSON.parse(await readFile(runtimePath, 'utf8'));
  assert.equal(Object.prototype.hasOwnProperty.call(runtime.validationContract.validation, 'groups'), false);
  assert.ok(Array.isArray(runtime.validationContract.validation.ordinaryGroups));
  assert.ok(Array.isArray(runtime.validationContract.declarations));
});

test('local-unpublished sync preserves exact previously published schema-reference authority for unchanged specialized schema bytes', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  const coreRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-core-'));
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  t.after(() => rm(coreRoot, { recursive: true, force: true }));
  const topic = catalog.entries.find((entry) => entry.schemaId === 'tiinex.topic.v1');
  assert.ok(topic);
  const commit = 'a'.repeat(40);
  const bindingPath = path.join(coreRoot, 'src/schemas/core/topic/tiinex.topic.v1.schema.json');
  await mkdir(path.dirname(bindingPath), { recursive: true });
  await writeFile(bindingPath, JSON.stringify({
    schemaId: 'tiinex.topic.v1',
    kind: 'concrete',
    role: 'core-topic-artifact',
    module: './tiinex.topic.v1.schema.js',
    canonicalUri: 'tiinex://schemas/core/topic/tiinex.topic.v1',
    sourceRepository: 'Tiinex/docs',
    sourcePath: topic.binding.sourcePath,
    sourceCommit: commit,
    sourceBlobSha: topic.binding.sourceBlobSha,
    checksum: topic.binding.checksum,
    publicationState: 'published-immutable-canonical',
    schemaReferencePublicationState: 'published-immutable-canonical',
    bindingVersion: 'tiinex.web.schema-binding.v1'
  }, null, 2));
  const plan = await buildNativeSchemaSyncPlan({ coreRoot, docsRoot, repository: 'Tiinex/docs', published: false });
  assert.equal(plan.status, 'ready');
  const output = plan.outputs.find((item) => String(item.path).replace(/\\/g, '/').endsWith('/core/topic/tiinex.topic.v1.schema.json'));
  assert.ok(output);
  const binding = JSON.parse(output.bytes.toString('utf8'));
  assert.equal(binding.publicationState, 'published-immutable-canonical');
  assert.equal(binding.schemaReferencePublicationState, 'published-immutable-canonical');
  assert.equal(binding.sourceCommit, commit);
  assert.match(binding.permalink, new RegExp(`/blob/${commit}/\\.topics/\\.schemas/core/topic/tiinex\\.topic\\.v1\\.schema\\.md$`));
});
