import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { normalizeRepositoryIdentity } from '../../handoff/workspaceSourceIdentity.js';

export const NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID = 'tiinex.portable.node-workspace-source-selection.v1';

export async function inspectNodeWorkspaceSourceIdentity(rootInput = '.') {
  const root = path.resolve(String(rootInput || '.'));
  const repositoryProbe = await probeGitRepository(root);
  if (repositoryProbe.state !== 'repository') {
    return freeze({
      schema: NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID,
      state: 'qualified',
      sourceKind: 'local-directory',
      repository: '',
      ref: '',
      rootPath: '.',
      gitState: repositoryProbe.state,
      boundary: 'No remote repository identity is inferred when Git repository/origin facts are unavailable.'
    });
  }
  const [remote, branch, head] = await Promise.all([
    runGit(['-C', repositoryProbe.root, 'config', '--get', 'remote.origin.url']),
    runGit(['-C', repositoryProbe.root, 'symbolic-ref', '--quiet', '--short', 'HEAD']),
    runGit(['-C', repositoryProbe.root, 'rev-parse', '--verify', 'HEAD^{commit}'])
  ]);
  const repository = remote.code === 0 ? normalizeRepositoryIdentity(remote.stdout.trim()) : '';
  const ref = repository ? (branch.code === 0 && branch.stdout.trim() ? branch.stdout.trim() : (head.code === 0 ? head.stdout.trim() : '')) : '';
  const relative = normalizeRelative(path.relative(repositoryProbe.root, root));
  return freeze({
    schema: NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID,
    state: 'qualified',
    sourceKind: repository ? 'github-tree' : 'local-directory',
    repository,
    ref,
    rootPath: repository ? (relative || '.') : '.',
    gitState: repository ? 'repository-with-origin' : 'repository-without-origin',
    boundary: repository
      ? 'Qualified Git origin identity preserves repository-backed Workspace initialization while the selected directory remains the local source root.'
      : 'A Git checkout without a qualified origin remains a local-directory Workspace source; no remote identity is invented.'
  });
}

/**
 * Project the exact Workspace-relative file paths selected by repository-local
 * `.gitignore` rules. Git owns ignore interpretation; Core owns the surrounding
 * source-safety exclusions and Package V1 completeness boundary.
 *
 * Deliberately excluded from source-selection authority:
 * - global Git excludes / core.excludesFile
 * - repository-local .git/info/exclude
 *
 * Tracked files remain selected even when a later `.gitignore` pattern matches
 * them because the selection is the union of Git's cached + untracked,
 * non-ignored paths.
 */
export async function selectNodeWorkspaceSourcePaths(rootInput = '.') {
  const root = path.resolve(String(rootInput || '.'));
  const probe = await probeGitRepository(root);
  if (probe.state === 'git-unavailable') return unavailableSelection(root, probe.state, 'git-executable-unavailable');

  let scratch = '';
  try {
    const repositoryRoot = probe.state === 'repository' ? probe.root : root;
    const workspacePrefix = probe.state === 'repository' ? normalizeRelative(path.relative(repositoryRoot, root)) : '';
    let prefixArgs = workspacePrefix ? ['--', workspacePrefix] : [];
    let baseArgs;
    let cwd;

    if (probe.state === 'repository') {
      baseArgs = ['-C', repositoryRoot];
      cwd = repositoryRoot;
    } else {
      scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-ignore-'));
      const evaluator = path.join(scratch, 'git-evaluator');
      const init = await runGit(['init', '--quiet', evaluator]);
      if (init.spawnError || init.code !== 0) return unavailableSelection(root, probe.state, 'git-ignore-evaluator-init-failed');
      baseArgs = [`--git-dir=${path.join(evaluator, '.git')}`, `--work-tree=${root}`];
      cwd = root;
      prefixArgs = [];
    }

    const selected = await runGit([
      ...baseArgs,
      'ls-files', '--cached', '--others', '--exclude-per-directory=.gitignore', '-z',
      ...prefixArgs
    ], { cwd });
    if (selected.spawnError || selected.code !== 0) return unavailableSelection(root, probe.state, 'git-source-selection-failed');

    const ignored = await runGit([
      ...baseArgs,
      'ls-files', '--others', '--ignored', '--exclude-per-directory=.gitignore', '-z',
      ...prefixArgs
    ], { cwd });
    if (ignored.spawnError || ignored.code !== 0) return unavailableSelection(root, probe.state, 'git-ignore-evidence-failed');

    const selectedPaths = workspaceRelativeGitPaths(splitZero(selected.stdout), workspacePrefix);
    const ignoredPaths = workspaceRelativeGitPaths(splitZero(ignored.stdout), workspacePrefix);
    return freeze({
      schema: NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID,
      state: 'qualified',
      root,
      repositoryState: probe.state,
      repositoryRoot,
      workspacePrefix,
      selectedPaths,
      ignoredPaths,
      evidence: freeze({
        schema: NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID,
        state: 'qualified',
        provider: 'git-ls-files',
        ignoreSemantics: 'repository-local-.gitignore',
        repositoryState: probe.state,
        workspaceRootWithinRepository: workspacePrefix || '.',
        trackedPathPolicy: probe.state === 'repository' ? 'tracked-paths-preserved-even-when-ignore-pattern-matches' : 'not-applicable',
        ambientIgnoreSources: 'not-consumed',
        selectionRule: 'cached-plus-untracked-minus-repository-local-gitignore',
        boundary: 'Git interprets only repository-local .gitignore files for Workspace source selection. Core applies its own source-safety exclusions after this selection.'
      })
    });
  } finally {
    if (scratch) await rm(scratch, { recursive: true, force: true });
  }
}

function unavailableSelection(root, repositoryState, reason) {
  return freeze({
    schema: NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID,
    state: 'unavailable',
    root,
    repositoryState,
    repositoryRoot: '',
    workspacePrefix: '',
    selectedPaths: [],
    ignoredPaths: [],
    reason,
    evidence: freeze({
      schema: NODE_WORKSPACE_SOURCE_SELECTION_SCHEMA_ID,
      state: 'unavailable',
      provider: 'filesystem-fallback',
      ignoreSemantics: 'unavailable',
      repositoryState,
      workspaceRootWithinRepository: '.',
      trackedPathPolicy: 'not-established',
      ambientIgnoreSources: 'not-consumed',
      reason,
      boundary: 'Git-backed .gitignore evaluation is unavailable; Workspace enumeration may only fall back when no eligible .gitignore material exists.'
    })
  });
}

function workspaceRelativeGitPaths(values, workspacePrefix) {
  const out = new Set();
  for (const value of values) {
    const normalized = normalizeRelative(value);
    if (!normalized) continue;
    if (!workspacePrefix) out.add(normalized);
    else if (normalized.startsWith(`${workspacePrefix}/`)) out.add(normalized.slice(workspacePrefix.length + 1));
  }
  return Object.freeze([...out].sort());
}

async function probeGitRepository(root) {
  const result = await runGit(['-C', root, 'rev-parse', '--show-toplevel']);
  if (result.spawnError) return { state: 'git-unavailable', root: '' };
  if (result.code !== 0 || !result.stdout.trim()) return { state: 'not-a-repository', root: '' };
  return { state: 'repository', root: path.resolve(result.stdout.trim()) };
}

function runGit(args, options = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const child = spawn('git', args, { cwd: options.cwd || undefined, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (spawnError) => {
      if (settled) return;
      settled = true;
      resolve({ code: null, stdout, stderr, spawnError });
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      resolve({ code: typeof code === 'number' ? code : 1, stdout, stderr, spawnError: null });
    });
    if (options.input != null) child.stdin.end(String(options.input));
    else child.stdin.end();
  });
}

function splitZero(value = '') { return String(value || '').split('\0').map((item) => item.trim()).filter(Boolean); }
function normalizeRelative(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
