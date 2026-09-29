import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { runCommonWorkspaceInitCli } from '../src/tooling/portable/adapters/cli/cli.workspace-init.js';
import { enumerateNodeWorkspace } from '../src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js';
import { inspectNodeWorkspaceSourceIdentity } from '../src/tooling/portable/adapters/node/workspace.sourceSelection.js';
import { projectQualifiedWorkspacePackageSources } from '../src/tooling/portable/handoff/workspacePackageSources.js';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const WORKSPACE_SCHEMA = path.join(ROOT, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'schema-pack', 'schemas', 'tiinex.workspace.v1.schema.md');
const WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.workspace.v1.schema.md';

async function git(root, ...args) { return (await run('git', args, { cwd: root })).stdout; }

test('init-workspace turns an ordinary non-Git directory into a discoverable local-directory Workspace', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-local-directory-init-'));
  const schemaCopy = path.join(root, 'workspace.schema.md');
  try {
    await writeFile(schemaCopy, await readFile(WORKSPACE_SCHEMA, 'utf8'), 'utf8');
    const created = await runCommonWorkspaceInitCli({ positionals: [root], flags: { authors: 'Fixture' } });
    assert.equal(created.sourceDetection.sourceKind, 'local-directory');
    assert.equal(created.sourceDetection.repository, '');
    assert.equal(created.sourceDetection.gitState, 'not-a-repository');
    assert.equal(created.schemaReference.target, WORKSPACE_SCHEMA_TARGET);
    assert.equal(created.status, 'ready', JSON.stringify(created.findings || [], null, 2));
    assert.equal(created.workspaceId, path.basename(root).toLowerCase());
    const markdown = await readFile(created.writeReceipt.path, 'utf8');
    assert.match(markdown, /## Workspace Entrypoints\n\n### Local directory source/);
    assert.match(markdown, /- Source Kind: local-directory/);
    assert.match(markdown, /- Root Path: \./);
    assert.doesNotMatch(markdown, /- Repository:/);

    const projected = projectQualifiedWorkspacePackageSources({ records: [{ path: created.writeReceipt.workspaceRelativePath, markdown }] });
    assert.equal(projected.status, 'ready');
    assert.equal(projected.candidates.length, 1);
    assert.equal(projected.candidates[0].sourceKind, 'local-directory');
    assert.equal(projected.candidates[0].repository, '');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Git checkout without origin remains local-directory while an origin is optional enrichment', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-local-git-init-'));
  try {
    await git(root, 'init', '-q');
    await git(root, 'config', 'user.name', 'Tiinex Test');
    await git(root, 'config', 'user.email', 'tiinex@example.invalid');
    await writeFile(path.join(root, 'README.md'), '# fixture\n');
    await git(root, 'add', 'README.md');
    await git(root, 'commit', '-qm', 'fixture');

    const local = await inspectNodeWorkspaceSourceIdentity(root);
    assert.equal(local.sourceKind, 'local-directory');
    assert.equal(local.repository, '');
    assert.equal(local.ref, '');
    assert.equal(local.gitState, 'repository-without-origin');

    await git(root, 'remote', 'add', 'origin', 'git@github.com:Tiinex/example-workspace.git');
    const enriched = await inspectNodeWorkspaceSourceIdentity(root);
    assert.equal(enriched.sourceKind, 'github-tree');
    assert.equal(enriched.repository, 'tiinex/example-workspace');
    assert.ok(enriched.ref);
    assert.equal(enriched.rootPath, '.');
    assert.equal(enriched.gitState, 'repository-with-origin');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('shared Workspace enumeration applies .gitignore in a non-Git directory without hard-coded ZIP behavior', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-local-ignore-'));
  try {
    await writeFile(path.join(root, '.gitignore'), '*.zip\n!assets/keep.zip\n', 'utf8');
    await writeFile(path.join(root, 'bootstrap-001.handoff-package.zip'), 'ignored carrier', 'utf8');
    await writeFile(path.join(root, 'README.md'), 'visible', 'utf8');
    await mkdir(path.join(root, 'assets'), { recursive: true });
    await writeFile(path.join(root, 'assets', 'keep.zip'), 'explicitly re-included', 'utf8');

    const result = await enumerateNodeWorkspace(root, { workspaceId: 'fixture' });
    assert.equal(result.status, 'qualified-complete', JSON.stringify(result.evidence || {}, null, 2));
    assert.deepEqual(result.materialization.entries.map((item) => item.path), ['.gitignore', 'assets/keep.zip', 'README.md']);
    assert.equal(result.evidence.sourceSelection.provider, 'git-ls-files');
    assert.equal(result.evidence.sourceSelection.repositoryState, 'not-a-repository');
    assert.equal(result.evidence.sourceSelection.ignoreSemantics, 'repository-local-.gitignore');
    assert.deepEqual(result.evidence.exclusions.gitignoreEntries, ['bootstrap-001.handoff-package.zip']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('shared Workspace enumeration preserves tracked files even when .gitignore matches them', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-git-ignore-tracked-'));
  try {
    await git(root, 'init', '-q');
    await git(root, 'config', 'user.name', 'Tiinex Test');
    await git(root, 'config', 'user.email', 'tiinex@example.invalid');
    await writeFile(path.join(root, '.gitignore'), '*.zip\nignored/\n', 'utf8');
    await writeFile(path.join(root, 'tracked.zip'), 'tracked', 'utf8');
    await git(root, 'add', '.gitignore');
    await git(root, 'add', '-f', 'tracked.zip');
    await git(root, 'commit', '-qm', 'fixture');
    await writeFile(path.join(root, 'generated.zip'), 'ignored', 'utf8');
    await mkdir(path.join(root, 'ignored'), { recursive: true });
    await writeFile(path.join(root, 'ignored', 'generated.txt'), 'ignored dir', 'utf8');

    const result = await enumerateNodeWorkspace(root, { workspaceId: 'fixture' });
    assert.equal(result.status, 'qualified-complete');
    assert.deepEqual(result.materialization.entries.map((item) => item.path), ['.gitignore', 'tracked.zip']);
    assert.equal(result.evidence.sourceSelection.repositoryState, 'repository');
    assert.equal(result.evidence.sourceSelection.trackedPathPolicy, 'tracked-paths-preserved-even-when-ignore-pattern-matches');
    assert.deepEqual(result.evidence.exclusions.gitignoreEntries, ['generated.zip', 'ignored/generated.txt']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
