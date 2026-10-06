import path from 'node:path';
import { spawn } from 'node:child_process';
import { extractCurrentSchemaId, isTiinexTracePath, projectTiinexCommitProvenance } from '../../git/git.commitProvenance.js';

export async function projectNodeGitCommitProvenance(rootValue = '.', options = {}) {
  const root = path.resolve(String(rootValue || '.'));
  const staged = await stagedChanges(root);
  const entries = [];
  for (const change of staged) {
    const target = change.status === 'deleted' ? change.previousPath || change.path : change.path;
    if (!isTiinexTracePath(target)) continue;
    const markdown = change.status === 'deleted'
      ? await showOptional(root, `HEAD:${change.path}`)
      : await showOptional(root, `:${change.path}`);
    const fallbackMarkdown = change.status === 'renamed' && !markdown
      ? await showOptional(root, `HEAD:${change.previousPath}`)
      : '';
    const selected = markdown || fallbackMarkdown;
    entries.push({
      ...change,
      markdown: selected,
      schemaId: extractCurrentSchemaId(selected)
    });
  }
  const repositoryLabel = String(options.repositoryLabel || options.label || path.basename(root)).trim() || 'repository';
  return Object.freeze({
    ...projectTiinexCommitProvenance({ repositoryLabel, entries }),
    source: Object.freeze({ kind: 'git-index', root, stagedChangeCount: staged.length, projectedTraceCount: entries.length }),
    boundary: Object.freeze({
      projectionOnly: true,
      source: 'git-index',
      workingTreeContentRead: false,
      deletedContentSource: 'HEAD',
      addedModifiedRenamedContentSource: 'index',
      gitMutation: false,
      remoteWrite: false,
      schemaLabelPresentationOnly: true,
      semanticAuthority: false,
      currentnessAuthority: false
    })
  });
}

async function stagedChanges(root) {
  const result = await runGit(root, ['diff', '--cached', '--name-status', '-z', '-M', '--diff-filter=ACDMR']);
  const tokens = result.stdout.split('\0').filter((item) => item.length > 0);
  const changes = [];
  for (let index = 0; index < tokens.length;) {
    const statusToken = tokens[index++] || '';
    const code = statusToken[0] || '';
    if (code === 'R') {
      const previousPath = normalizePath(tokens[index++] || '');
      const nextPath = normalizePath(tokens[index++] || '');
      changes.push(Object.freeze({ status: 'renamed', path: nextPath, previousPath }));
      continue;
    }
    const target = normalizePath(tokens[index++] || '');
    if (!target) continue;
    changes.push(Object.freeze({ status: code === 'A' ? 'added' : code === 'D' ? 'deleted' : 'modified', path: target, previousPath: '' }));
  }
  return changes.sort((a, b) => a.path.localeCompare(b.path) || a.previousPath.localeCompare(b.previousPath));
}

async function showOptional(root, spec) {
  const result = await runGit(root, ['show', spec], { allowFailure: true });
  return result.code === 0 ? result.stdout : '';
}

function runGit(cwd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      const exit = typeof code === 'number' ? code : 1;
      if (exit !== 0 && !options.allowFailure) return reject(new Error(`tiinex.git.command-failed:${args.join(' ')}:${stderr.trim() || exit}`));
      resolve({ code: exit, stdout, stderr });
    });
  });
}

function normalizePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
