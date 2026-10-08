import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { projectPortableTransitionCatalog, projectPortableTransitionNeighborhood } from '../src/tooling/portable/transitions/transition.catalog.js';
import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { schemaCompanionTextEntries } from '../src/schemas/registry.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nativeRoot = resolve(process.env.TIINEX_TEST_NATIVE_ROOT || resolve(root, '..', 'native'));
const ids = [
  'tiinex.core.handoff.discuss-review.v1',
  'tiinex.core.handoff.open-bounded-conversation.v1',
  'tiinex.core.handoff.perform-bounded-work.v1',
  'tiinex.core.handoff.report-blocker-request-continuation.v1',
  'tiinex.core.handoff.return-bounded-result.v1',
  'tiinex.core.handoff.return-review-disposition.v1'
];

test('Native-composed Handoff definitions qualify without App while remaining non-executable/non-recommended', () => {
  const catalog = projectPortableTransitionCatalog({ includeNative: true, outputSchemaId: 'tiinex.handoff.v1' });
  assert.deepEqual(catalog.candidates.map((entry) => entry.canonicalIdentifier), ids);
  const neighborhood = projectPortableTransitionNeighborhood({ includeNative: true, outputSchemaId: 'tiinex.handoff.v1' });
  assert.deepEqual(neighborhood.candidates.map((entry) => entry.canonicalIdentifier), ids);
  assert.equal(neighborhood.findings.filter((finding) => finding.severity === 'error').length, 0);
  for (const entry of neighborhood.candidates) {
    assert.equal(entry.authoringProfile?.state, 'qualified');
    assert.equal(entry.authoringProfile?.boundary?.recommendation, 'not-projected');
    assert.equal(entry.authoringProfile?.boundary?.executionAuthorized, false);
    assert.equal(entry.boundary?.executable, false);
    assert.ok(Object.keys(entry.authoringProfile?.defaults || {}).length > 0);
    assert.equal(entry.source?.sourceMode, 'portable-composed-schema-content');
  }
});

test('Native zero-input Handoff authoring transitions remain available regardless of Parent schema', () => {
  const neighborhood = projectPortableTransitionNeighborhood({
    includeNative: true,
    outputSchemaId: 'tiinex.handoff.v1',
    inputSchemaId: 'tiinex.evidence.v1'
  });
  assert.deepEqual(neighborhood.candidates.map((entry) => entry.canonicalIdentifier), ids);
  assert.equal(neighborhood.findings.filter((finding) => finding.severity === 'error').length, 0);
  assert.equal(neighborhood.candidates.every((entry) => entry.zeroRequiredInputs === true), true);
});

test('external transitions remain separate and Native inclusion is explicit in the programmatic API', async () => {
  const fixture = await readFile(resolve(root, 'test/fixtures/transitions/create-task-transition-definition.trace.md'), 'utf8');
  const source = { files: [{ path: '.topics/processes/create-task.trace.md', content: fixture, sourceMode: 'portable-node-local', locator: { kind: 'node-file', localPath: '/org-repo/.topics/processes/create-task.trace.md' } }] };
  const onlyExternal = projectPortableTransitionCatalog(source);
  assert.equal(onlyExternal.counts.discovered, 1);
  const both = projectPortableTransitionCatalog({ ...source, includeNative: true });
  assert.equal(both.counts.discovered, 7);
  assert.ok(both.definitions.some((entry) => entry.source?.locator?.localPath === '/org-repo/.topics/processes/create-task.trace.md'));
});

test('Native Handoff transition material is composed from selected schema content, not a generated Core-native copy', () => {
  const entries = schemaCompanionTextEntries().filter(([path]) => /coordination\/handoff\/.*\.trace\.md$/i.test(path));
  const paths = entries.map(([path]) => path);
  assert.ok(paths.some((path) => path.endsWith('coordination/handoff/handoff-semantic-package.trace.md')));
  assert.ok(paths.some((path) => path.endsWith('coordination/handoff/.transitions/perform-bounded-work-handoff-transition-definition.trace.md')));
});

test('embedded bootstrap carries selected Native content independently of App and does not recreate Core-native generated transition files', async () => {
  const native = await discoverLocalTiinexContentSource({ root: nativeRoot });
  assert.equal(native.status, 'ready');
  const bundle = await buildToolingBootstrapTransportFiles({ runtimeRoot: root, contentSources: [native] });
  const paths = bundle.files.map((item) => item.path);
  assert.ok(paths.some((path) => path.includes('/content/') && path.endsWith('/.topics/.schemas/coordination/handoff/handoff-semantic-package.trace.md')));
  assert.ok(paths.some((path) => path.includes('/content/') && path.endsWith('/.topics/.schemas/coordination/handoff/.transitions/perform-bounded-work-handoff-transition-definition.trace.md')));
  assert.ok(!paths.includes('tiinex.bootstrap/runtime/src/tooling/portable/transitions/native.handoff.generated.js'));
  assert.ok(!paths.some((path) => path.startsWith('tiinex.bootstrap/runtime/../app/')));
  const appDependency = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.ok(!Object.keys(appDependency.dependencies || {}).includes('@tiinex/app'));
});
