import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import catalog from '../src/schemas/generated/native.schema.catalog.json' with { type: 'json' };
import { nativeSchemaMarkdownById } from '../src/schemas/generated/native.schema.pack.js';
import { resolveSchemaModule } from '../src/schemas/resolver.js';
import { buildNativeSchemaSyncPlan, checkNativeSchemas } from '../src/tooling/portable/adapters/node/schema.sync.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceCommit = String(catalog?.source?.commit || '');

async function materializeDocsSnapshot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-docs-'));
  for (const entry of catalog.entries || []) {
    const target = path.join(root, String(entry.binding.sourcePath || ''));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, String(nativeSchemaMarkdownById[entry.schemaId] || ''), 'utf8');
  }
  return root;
}

test('native schema check reproduces the committed generated catalog from exact local Docs bytes', async (t) => {
  const docsRoot = await materializeDocsSnapshot();
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  const result = await checkNativeSchemas({ coreRoot: repoRoot, docsRoot, sourceCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.catalog.schemaCount, 108);
  assert.equal(result.catalog.specializedCount, 25);
  assert.equal(result.catalog.genericCount, 83);
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
  const result = await checkNativeSchemas({ coreRoot: repoRoot, docsRoot, sourceCommit, repository: 'Tiinex/docs', published: true });
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
