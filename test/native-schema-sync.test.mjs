import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildNativeSchemaSyncPlan, checkNativeSchemas, synchronizeNativeSchemas } from '../src/tooling/portable/adapters/node/schema.sync.js';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { initializePortableNodeRuntime } from '../src/tooling/portable/adapters/node/portableRuntime.initialize.js';

async function write(target, content = '') {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function fixtureRoots(t) {
  const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-docs-'));
  const contentRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-content-'));
  t.after(() => rm(docsRoot, { recursive: true, force: true }));
  t.after(() => rm(contentRoot, { recursive: true, force: true }));
  await write(path.join(contentRoot, 'package.json'), `${JSON.stringify({ name: '@example/schema-content', version: '1.0.0', tiinex: { contentSource: { registeredSurfaces: 'recursive' } } }, null, 2)}\n`);
  await write(path.join(docsRoot, '.topics', '.schemas', 'tiinex.root.v1.schema.md'), rootSchema());
  await write(path.join(docsRoot, '.topics', '.schemas', 'core', 'topic', 'tiinex.topic.v1.schema.md'), topicSchema());
  return { docsRoot, contentRoot };
}

test('schema sync requires an explicit content Workspace and never defaults to Core/cwd ownership', async () => {
  const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-sync-docs-only-'));
  try {
    await write(path.join(docsRoot, '.topics', '.schemas', 'tiinex.root.v1.schema.md'), rootSchema());
    const plan = await buildNativeSchemaSyncPlan({ docsRoot });
    assert.equal(plan.status, 'blocked');
    assert.ok(plan.findings.some((item) => item.code === 'schema-sync.content-root.required'));
  } finally {
    await rm(docsRoot, { recursive: true, force: true });
  }
});

test('schema sync/check materializes canonical schema authority into the selected .schemas content surface', async (t) => {
  const { docsRoot, contentRoot } = await fixtureRoots(t);
  const sync = await synchronizeNativeSchemas({ contentRoot, docsRoot, repository: 'Tiinex/docs', published: false });
  assert.equal(sync.status, 'ready');
  assert.ok(sync.generated.filesWritten > 0);
  assert.equal(await readFile(path.join(contentRoot, '.topics', '.schemas', 'tiinex.root.v1.schema.md'), 'utf8'), rootSchema());
  assert.equal(await readFile(path.join(contentRoot, '.topics', '.schemas', 'core', 'topic', 'tiinex.topic.v1.schema.md'), 'utf8'), topicSchema());
  const catalog = JSON.parse(await readFile(path.join(contentRoot, '.topics', '.schemas', '.generated', 'native.schema.catalog.json'), 'utf8'));
  assert.equal(catalog.count, 2);
  assert.deepEqual(catalog.entries.map((item) => item.schemaId), ['tiinex.root.v1', 'tiinex.topic.v1']);
  assert.equal(catalog.source.publicationState, 'qualified-local-unpublished');

  const check = await checkNativeSchemas({ contentRoot, docsRoot, repository: 'Tiinex/docs', published: false });
  assert.equal(check.status, 'ready');
  assert.equal(check.generated.driftCount, 0);
  assert.equal(check.generated.staleCanonicalSchemaCopies, 0);

  const source = await discoverLocalTiinexContentSource({ root: contentRoot });
  const runtime = await initializePortableNodeRuntime({ contentSources: [source], discoverBundled: false, discoverInstalled: false });
  assert.equal(runtime.status, 'ready');
  assert.equal(runtime.schemaRuntime.schemas.total, 2);
  assert.equal(runtime.schemaRuntime.registry.source, 'portable-content-source-composition');
});

test('schema sync preserves collocated executable companions while updating their generated binding/runtime projections', async (t) => {
  const { docsRoot, contentRoot } = await fixtureRoots(t);
  const surface = path.join(contentRoot, '.topics', '.schemas');
  const companionRoot = path.join(surface, 'core', 'topic');
  const moduleText = 'export const untouchedCompanion = true;\n';
  await write(path.join(companionRoot, 'tiinex.topic.v1.schema.js'), moduleText);
  await write(path.join(companionRoot, 'tiinex.topic.v1.schema.json'), `${JSON.stringify({ schemaId: 'tiinex.topic.v1', kind: 'structural', role: 'canonical-schema', module: './tiinex.topic.v1.schema.js', originTrustRole: 'canonical-core' }, null, 2)}\n`);
  await write(path.join(companionRoot, 'tiinex.topic.v1.schema.runtime.json'), '{}\n');

  const sync = await synchronizeNativeSchemas({ contentRoot, docsRoot, repository: 'Tiinex/docs', published: false });
  assert.equal(sync.status, 'ready');
  assert.equal(await readFile(path.join(companionRoot, 'tiinex.topic.v1.schema.js'), 'utf8'), moduleText);
  const binding = JSON.parse(await readFile(path.join(companionRoot, 'tiinex.topic.v1.schema.json'), 'utf8'));
  const runtime = JSON.parse(await readFile(path.join(companionRoot, 'tiinex.topic.v1.schema.runtime.json'), 'utf8'));
  const catalog = JSON.parse(await readFile(path.join(surface, '.generated', 'native.schema.catalog.json'), 'utf8'));
  assert.equal(binding.schemaId, 'tiinex.topic.v1');
  assert.equal(binding.publicationState, 'qualified-local-unpublished');
  assert.ok(runtime.validationContract);
  assert.equal(catalog.entries.find((item) => item.schemaId === 'tiinex.topic.v1')?.specialized, true);
});

test('published sync preserves exact immutable bindings for unchanged schema bytes and advances only changed schemas', async (t) => {
  const { docsRoot, contentRoot } = await fixtureRoots(t);
  const firstCommit = 'a'.repeat(40);
  const nextCommit = 'b'.repeat(40);
  const first = await synchronizeNativeSchemas({ contentRoot, docsRoot, sourceCommit: firstCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(first.status, 'ready');

  const unchangedPlan = await buildNativeSchemaSyncPlan({ contentRoot, docsRoot, sourceCommit: nextCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(unchangedPlan.status, 'ready');
  const unchangedCatalogOutput = unchangedPlan.outputs.find((item) => item.path.endsWith(path.join('.generated', 'native.schema.catalog.json')));
  const unchangedCatalog = JSON.parse(unchangedCatalogOutput.bytes.toString('utf8'));
  assert.equal(unchangedCatalog.source.commit, firstCommit);
  assert.ok(unchangedCatalog.entries.every((item) => item.binding.sourceCommit === firstCommit));

  const topicPath = path.join(docsRoot, '.topics', '.schemas', 'core', 'topic', 'tiinex.topic.v1.schema.md');
  await writeFile(topicPath, `${topicSchema()}\n<!-- changed -->\n`, 'utf8');
  const changedPlan = await buildNativeSchemaSyncPlan({ contentRoot, docsRoot, sourceCommit: nextCommit, repository: 'Tiinex/docs', published: true });
  assert.equal(changedPlan.status, 'ready');
  const changedCatalogOutput = changedPlan.outputs.find((item) => item.path.endsWith(path.join('.generated', 'native.schema.catalog.json')));
  const changedCatalog = JSON.parse(changedCatalogOutput.bytes.toString('utf8'));
  assert.equal(changedCatalog.source.commit, nextCommit);
  assert.equal(changedCatalog.entries.find((item) => item.schemaId === 'tiinex.root.v1')?.binding.sourceCommit, firstCommit);
  assert.equal(changedCatalog.entries.find((item) => item.schemaId === 'tiinex.topic.v1')?.binding.sourceCommit, nextCommit);
});

function rootSchema() {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.root.v1\n  - Created At: 2026-10-04 00:00:00\n  - Summary: Root fixture\n\n---\n\n# Root\n\n## Summary\n\nRoot fixture.\n\n## Schema Validation Contract\n\n### Root\n\nRules\n\n- Fixture only.\n\n## Artifact Creation Contract\n\n### Root\n\nRules\n\n- Fixture only.\n`;
}

function topicSchema() {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.root.v1\n  - Created At: 2026-10-04 00:00:00\n  - Trace: tiinex.root.v1.schema.md\n  - Origin:\n    - relative: tiinex.root.v1.schema.md\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-10-04 00:01:00\n  - Summary: Topic fixture\n\n---\n\n# Topic\n\n## Summary\n\nTopic fixture.\n\n## Schema Validation Contract\n\n### Topic\n\nRules\n\n- Fixture only.\n\n## Artifact Creation Contract\n\n### Topic\n\nRules\n\n- Fixture only.\n`;
}
