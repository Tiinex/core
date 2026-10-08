import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { nativeEntryByName } from './helpers/native-entry-fixtures.mjs';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const coreRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function write(target, content = '') { await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); }

async function writeBootstrap(root, bootstrap) {
  for (const file of bootstrap.files || []) await write(path.join(root, file.path), file.data);
}

test('embedded bootstrap catalog exposes Process and Scaffold content and keeps Entry discovery fail-closed without its schema contract', async () => {
  const contentRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-content-source-'));
  const extractionRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-extract-'));
  try {
    await write(path.join(contentRoot, 'package.json'), `${JSON.stringify({ name: '@example/bootstrap-content', version: '1.0.0' }, null, 2)}\n`);
    await write(path.join(contentRoot, '.topics', 'session', '.entries', 'start-entry.trace.md'), nativeEntryByName('start'));
    await write(path.join(contentRoot, '.topics', 'session', '.processes', 'grounding.trace.md'), qualifiedProcess());
    await write(path.join(contentRoot, '.topics', 'workspace', '.scaffolds', 'workspace.trace.md'), qualifiedScaffold());

    const contentSource = await discoverLocalTiinexContentSource({ root: contentRoot });
    assert.equal(contentSource.status, 'ready');
    const bootstrap = await buildToolingBootstrapTransportFiles({ runtimeRoot: coreRoot, contentSources: [contentSource], builtAt: '2026-10-04T12:00:00.000Z' });
    await writeBootstrap(extractionRoot, bootstrap);

    const entrypoint = path.join(extractionRoot, 'tiinex.bootstrap', 'runtime', 'tools', 'tiinex-portable.mjs');
    const run = spawnSync(process.execPath, [entrypoint, 'catalog', '--json'], { encoding: 'utf8', timeout: 30_000, env: { ...process.env, TIINEX_CONTENT_ROOTS: '' } });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    const catalog = JSON.parse(run.stdout);
    assert.equal(catalog.status, 'ready');
    assert.equal(catalog.discovery.sources, 1);
    assert.equal(catalog.entries.status, 'blocked');
    assert.equal(catalog.entries.reasonCode, 'entry-contract-unavailable');
    assert.equal(catalog.entries.entries.length, 0);
    assert.equal(catalog.processes.processes.length, 1);
    assert.equal(catalog.processes.processes[0].title, 'Portable Test Process');
    assert.equal(catalog.scaffolds.scaffolds.length, 1);
    assert.equal(catalog.schemas.state, 'not-present');
    assert.equal(catalog.schemas.total, 0);
    assert.equal(catalog.scaffolds.scaffolds[0].handle, 'example.workspace.v1');
    assert.equal(catalog.capabilities.scaffoldCatalog, true);
    assert.equal(catalog.capabilities.scaffoldPlanSchema, 'tiinex.scaffold.plan.v1');
    assert.equal(catalog.capabilities.scaffoldCompositePlanSchema, 'tiinex.scaffold.composite-plan.v1');
  } finally {
    await rm(contentRoot, { recursive: true, force: true });
    await rm(extractionRoot, { recursive: true, force: true });
  }
});


test('embedded bootstrap catalog reports initialized Schema content without archive archaeology', async () => {
  const contentRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-schema-source-'));
  const extractionRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-schema-extract-'));
  try {
    await write(path.join(contentRoot, 'package.json'), `${JSON.stringify({ name: '@example/bootstrap-schema-content', version: '1.0.0' }, null, 2)}\n`);
    await write(path.join(contentRoot, '.topics', 'schema', '.schemas', 'tiinex.root.v1.schema.md'), minimalRootSchema());
    const contentSource = await discoverLocalTiinexContentSource({ root: contentRoot });
    const bootstrap = await buildToolingBootstrapTransportFiles({ runtimeRoot: coreRoot, contentSources: [contentSource], builtAt: '2026-10-04T12:01:00.000Z' });
    await writeBootstrap(extractionRoot, bootstrap);
    const entrypoint = path.join(extractionRoot, 'tiinex.bootstrap', 'runtime', 'tools', 'tiinex-portable.mjs');
    const run = spawnSync(process.execPath, [entrypoint, 'catalog', '--json'], { encoding: 'utf8', timeout: 30_000, env: { ...process.env, TIINEX_CONTENT_ROOTS: '' } });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    const catalog = JSON.parse(run.stdout);
    assert.equal(catalog.status, 'ready');
    assert.equal(catalog.schemas.state, 'ready');
    assert.equal(catalog.schemas.total, 1);
    assert.equal(catalog.schemas.specialized, 0);
    assert.equal(catalog.schemas.registrySource, 'portable-content-source-composition');
  } finally {
    await rm(contentRoot, { recursive: true, force: true });
    await rm(extractionRoot, { recursive: true, force: true });
  }
});



test('mechanics-only bootstrap stays valid but fails closed on schema-aware authoring without a qualified content source', async () => {
  const extractionRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-mechanics-author-'));
  const workspaceRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-mechanics-workspace-'));
  try {
    const bootstrap = await buildToolingBootstrapTransportFiles({ runtimeRoot: coreRoot, builtAt: '2026-10-08T00:00:00.000Z' });
    assert.equal(bootstrap.manifest.content.sources, 0);
    await writeBootstrap(extractionRoot, bootstrap);
    const entrypoint = path.join(extractionRoot, 'tiinex.bootstrap', 'runtime', 'tools', 'tiinex-portable.mjs');
    const bodyPath = path.join(workspaceRoot, 'body.md');
    await writeFile(bodyPath, '# Mechanics Only Probe\n\nNo schema content is bundled.\n', 'utf8');
    const authorRun = spawnSync(process.execPath, [entrypoint, 'author', workspaceRoot, '--schema', 'tiinex.topic.v1', '--directory', '.topics/probe', '--body', bodyPath, '--title', 'Mechanics Only Probe', '--authors', 'Anchor', '--preflight', '--json'], { encoding: 'utf8', timeout: 30_000, env: { ...process.env, TIINEX_CONTENT_ROOTS: '' } });
    assert.notEqual(authorRun.status, 0);
    const error = JSON.parse(authorRun.stdout || authorRun.stderr);
    assert.match(String(error.error || ''), /portable\.cli\.author\.schema-content-source\.required/);
  } finally {
    await rm(extractionRoot, { recursive: true, force: true });
    await rm(workspaceRoot, { recursive: true, force: true });
  }
});

test('content-composed bootstrap supports black-box schema-aware authoring from its own bundled Native content', async (t) => {
  const nativeRoot = path.resolve(process.env.TIINEX_TEST_NATIVE_ROOT || path.join(coreRoot, '..', 'native'));
  try { await access(path.join(nativeRoot, '.topics', '.schemas')); } catch { t.skip('Native reusable content source is not present beside the Core test checkout.'); return; }
  const extractionRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-native-author-'));
  const workspaceRoot = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-native-workspace-'));
  try {
    const nativeSource = await discoverLocalTiinexContentSource({ root: nativeRoot });
    assert.equal(nativeSource.status, 'ready');
    const bootstrap = await buildToolingBootstrapTransportFiles({ runtimeRoot: coreRoot, contentSources: [nativeSource], builtAt: '2026-10-08T00:00:00.000Z' });
    assert.equal(bootstrap.manifest.content.sources, 1);
    await writeBootstrap(extractionRoot, bootstrap);
    const entrypoint = path.join(extractionRoot, 'tiinex.bootstrap', 'runtime', 'tools', 'tiinex-portable.mjs');

    const versionRun = spawnSync(process.execPath, [entrypoint, 'version', '--json'], { encoding: 'utf8', timeout: 30_000, env: { ...process.env, TIINEX_CONTENT_ROOTS: '' } });
    assert.equal(versionRun.status, 0, versionRun.stderr || versionRun.stdout);
    const version = JSON.parse(versionRun.stdout);
    assert.equal(version.status, 'ready');
    assert.equal(version.composition?.contentSources, 1);

    const catalogRun = spawnSync(process.execPath, [entrypoint, 'catalog', '--json'], { encoding: 'utf8', timeout: 30_000, env: { ...process.env, TIINEX_CONTENT_ROOTS: '' } });
    assert.equal(catalogRun.status, 0, catalogRun.stderr || catalogRun.stdout);
    const catalog = JSON.parse(catalogRun.stdout);
    assert.equal(catalog.status, 'ready');
    assert.ok(catalog.schemas.total > 0);
    assert.ok(catalog.processes.processes.length > 0);

    const bodyPath = path.join(workspaceRoot, 'body.md');
    await writeFile(bodyPath, '# Cold Bootstrap Author Probe\n\nBounded standalone authoring probe.\n\n## Current Read\n\nThe content-composed bootstrap is active.\n\n## Design Direction\n\nAuthor locally through the bundled content contract.\n\n## Next Artifacts\n\nnone\n', 'utf8');
    const authorRun = spawnSync(process.execPath, [entrypoint, 'author', workspaceRoot, '--schema', 'tiinex.topic.v1', '--directory', '.topics/probe', '--body', bodyPath, '--title', 'Cold Bootstrap Author Probe', '--authors', 'Anchor', '--preflight', '--json'], { encoding: 'utf8', timeout: 60_000, env: { ...process.env, TIINEX_CONTENT_ROOTS: '' } });
    assert.equal(authorRun.status, 0, authorRun.stderr || authorRun.stdout);
    const authored = JSON.parse(authorRun.stdout);
    assert.equal(authored.status, 'qualified-preflight');
    assert.equal(authored.artifact.written, false);
    assert.match(authored.artifact.path, /^\.topics\/probe\/001-cold-bootstrap-author-probe\.trace\.md$/);
  } finally {
    await rm(extractionRoot, { recursive: true, force: true });
    await rm(workspaceRoot, { recursive: true, force: true });
  }
});

function qualifiedProcess() {
  return sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-10-04 00:00:00\n  - Summary: reusable test process guidance\n  - Status: ready/local\n\n---\n\n# Portable Test Process\n\n## When This Process Applies\n\nUse only when explicitly selected.\n\n## Process\n\nGround before acting.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown;
}

function qualifiedScaffold() {
  return sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.scaffold.v1\n  - Created At: 2026-10-04 00:00:00\n  - Summary: reusable test scaffold\n\n---\n\n# Example Workspace Scaffold\n\n## Scaffold Identity\n\n- Scaffold Handle: example.workspace.v1\n- Scaffold Name: Example Workspace\n- Scaffold Kind: workspace\n- Version: 1\n\n## Target Boundary\n\n- Target Kind: workspace-root\n- Target Root Meaning: selected workspace root\n- Root Binding Policy: explicit-invocation\n\n## Structural Entries\n\n- Topics\n  - Path: .topics\n  - Entry Kind: directory\n  - Presence: required\n  - Entry Role: topics-root\n\n## Composition\n\n- Composition Policy: additive\n- Duplicate Entry Policy: exact-duplicate-allowed\n\n## Conflict Policy\n\n- Existing Compatible Material: no-op\n- Existing Conflicting Material: block\n- Unknown Existing Material: preserve\n- Deletion Policy: never\n\n## Generation Bindings\n\n- none\n\n## Validation Boundary\n\n- Qualification Rule: exact bytes qualify\n- Planning Rule: read-only\n- Apply Rule: separately authorized\n- Failure Policy: fail-closed\n\n## Interpretation Limits\n\n- Does Not Establish: applicability or target identity\n- Must Not Be Used To Claim: mutation authority\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown;
}

function minimalRootSchema() {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.root.v1\n  - Created At: 2026-10-04 00:00:00\n  - Summary: minimal root schema fixture\n\n---\n\n# Root\n\n## Summary\n\nMinimal root fixture.\n\n## Schema Validation Contract\n\n### Root\n\nRules\n\n- Fixture only.\n\n## Artifact Creation Contract\n\n### Root\n\nRules\n\n- Fixture only.\n`;
}
