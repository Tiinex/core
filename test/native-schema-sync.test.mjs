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
  assert.equal(result.catalog.schemaCount, 106);
  assert.equal(result.catalog.specializedCount, 25);
  assert.equal(result.catalog.genericCount, 81);
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
  const plan = await buildNativeSchemaSyncPlan({ coreRoot: repoRoot, docsRoot, repository: 'Tiinex/docs', published: false });
  assert.equal(plan.status, 'ready');
  const evidence = plan.outputs.find((output) => output.path.endsWith('/core/evidence/tiinex.evidence.v1.schema.json'));
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
