import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { projectPortableTransitionCatalog, projectPortableTransitionNeighborhood } from '../src/tooling/portable/transitions/transition.catalog.js';
import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ids = [
  'tiinex.core.handoff.discuss-review.v1',
  'tiinex.core.handoff.open-bounded-conversation.v1',
  'tiinex.core.handoff.perform-bounded-work.v1'
];

test('native Handoff definitions qualify without App while remaining non-executable/non-recommended', () => {
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
    assert.equal(entry.source?.sourceMode, 'portable-core-native');
  }
});

test('external transitions remain separate and native inclusion is explicit in the programmatic API', async () => {
  const fixture = await readFile(resolve(root, 'test/fixtures/transitions/create-task-transition-definition.trace.md'), 'utf8');
  const source = { files: [{ path: '.topics/processes/create-task.trace.md', content: fixture, sourceMode: 'portable-node-local', locator: { kind: 'node-file', localPath: '/org-repo/.topics/processes/create-task.trace.md' } }] };
  const onlyExternal = projectPortableTransitionCatalog(source);
  assert.equal(onlyExternal.counts.discovered, 1);
  const both = projectPortableTransitionCatalog({ ...source, includeNative: true });
  assert.equal(both.counts.discovered, 4);
  assert.ok(both.definitions.some((entry) => entry.source?.locator?.localPath === '/org-repo/.topics/processes/create-task.trace.md'));
});

test('authored Core-native material and compiled projection cannot drift', () => {
  const check = spawnSync(process.execPath, ['tools/build-native-handoff-transitions.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});

test('embedded Core bootstrap carries authored native material independently of App', async () => {
  const bundle = await buildToolingBootstrapTransportFiles({ runtimeRoot: root });
  const paths = bundle.files.map((item) => item.path);
  assert.ok(paths.includes('tiinex.bootstrap/runtime/src/tooling/portable/transitions/native.handoff.generated.js'));
  assert.ok(paths.includes('tiinex.bootstrap/runtime/src/schemas/coordination/handoff/handoff-semantic-package.trace.md'));
  assert.ok(paths.includes('tiinex.bootstrap/runtime/src/schemas/coordination/handoff/.transitions/perform-bounded-work-handoff-transition-definition.trace.md'));
  assert.ok(!paths.some((path) => path.startsWith('tiinex.bootstrap/runtime/../app/')));
  const appDependency = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.ok(!Object.keys(appDependency.dependencies || {}).includes('@tiinex/app'));
});
