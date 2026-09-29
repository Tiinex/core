import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { sha256Hex } from '../../../../export/package.bytes.js';
import { safeWorkspaceToken, serializableMetadata } from './handoff.manufacture.multiRoot.js';
import { selectNodeWorkspaceSourcePaths } from './workspace.sourceSelection.js';
import {
  DEFAULT_PORTABLE_SOURCE_EXCLUDED_DIRECTORIES,
  DEFAULT_PORTABLE_SOURCE_EXCLUDED_RELATIVE_PATHS,
  portableSourceEligibilityPolicy,
  qualifyPortableSourcePath
} from '../../source/sourceEligibility.js';

export const PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID = 'tiinex.portable.node-workspace-enumeration.v1';
export const DEFAULT_HANDOFF_MANUFACTURE_EXCLUDED_DIRECTORIES = DEFAULT_PORTABLE_SOURCE_EXCLUDED_DIRECTORIES;
export const DEFAULT_HANDOFF_MANUFACTURE_EXCLUDED_RELATIVE_PATHS = DEFAULT_PORTABLE_SOURCE_EXCLUDED_RELATIVE_PATHS;
const DEFAULT_MAX_FILES = 10000;

export async function enumerateNodeWorkspace(rootInput = '.', options = {}) {
  const root = path.resolve(String(rootInput || '.'));
  const maxFiles = positiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  const sourceEligibility = portableSourceEligibilityPolicy({
    excludeDirectories: options.excludeDirectories == null ? DEFAULT_HANDOFF_MANUFACTURE_EXCLUDED_DIRECTORIES : options.excludeDirectories,
    excludeRelativePaths: options.excludeRelativePaths == null ? DEFAULT_HANDOFF_MANUFACTURE_EXCLUDED_RELATIVE_PATHS : options.excludeRelativePaths
  });
  const selection = await selectNodeWorkspaceSourcePaths(root);
  const fallback = selection.state === 'qualified' ? null : await enumerateFilesystemFallback(root, sourceEligibility, maxFiles);
  if (selection.state !== 'qualified' && fallback.gitignoreFiles.length) {
    return blockedIgnoreResult(maxFiles, fallback.paths.length, selection.evidence, fallback.gitignoreFiles, selection.reason || 'git-required-for-gitignore');
  }

  const selectedPaths = selection.state === 'qualified' ? selection.selectedPaths : fallback.paths;
  const ignoredEntries = selection.state === 'qualified'
    ? selection.ignoredPaths.filter((relative) => qualifyPortableSourcePath(relative, {
        excludeDirectories: sourceEligibility.excludedDirectories,
        excludeRelativePaths: sourceEligibility.excludedRelativePaths,
        entryKind: 'file'
      }).eligible)
    : [];
  const absoluteFiles = [];
  const skippedSymlinks = [];
  for (const relative of selectedPaths) {
    const eligibility = qualifyPortableSourcePath(relative, {
      excludeDirectories: sourceEligibility.excludedDirectories,
      excludeRelativePaths: sourceEligibility.excludedRelativePaths,
      entryKind: 'file'
    });
    if (!eligibility.eligible) continue;
    const absolute = path.join(root, ...relative.split('/'));
    let info;
    try { info = await lstat(absolute); } catch { continue; }
    if (info.isSymbolicLink()) { skippedSymlinks.push(relative); continue; }
    if (!info.isFile()) continue;
    absoluteFiles.push(absolute);
    if (absoluteFiles.length > maxFiles) {
      return Object.freeze({
        schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID,
        status: 'file-limit-exceeded',
        maxFiles,
        observedFiles: absoluteFiles.length,
        materialization: null,
        evidence: Object.freeze({ state: 'blocked', proof: 'deterministic-node-enumeration-v3', maxFiles, observedFiles: absoluteFiles.length, sourceSelection: selection.evidence })
      });
    }
  }

  absoluteFiles.sort((a, b) => normalizeRelativePath(path.relative(root, a)).localeCompare(normalizeRelativePath(path.relative(root, b))));
  const entries = [];
  const includedEntries = [];
  let totalBytes = 0;
  for (const absolute of absoluteFiles) {
    const relative = normalizeRelativePath(path.relative(root, absolute));
    const data = new Uint8Array(await readFile(absolute));
    const bytes = data.byteLength;
    const sha256 = sha256Hex(data);
    totalBytes += bytes;
    entries.push(Object.freeze({ path: relative, data, bytes, sha256, mediaType: mediaTypeForPath(relative) }));
    includedEntries.push(Object.freeze({ path: relative, bytes, sha256, referenceTarget: '' }));
  }
  const workspaceId = safeWorkspaceToken(options.workspaceId || path.basename(root) || 'workspace');
  const workspaceTitle = String(options.workspaceTitle || '').trim();
  const evidencePayload = Object.freeze({
    schema: 'tiinex.portable.workspace-completeness-evidence.v1',
    state: 'qualified',
    proof: 'deterministic-node-enumeration-v3',
    boundary: selection.state === 'qualified'
      ? 'regular-files-selected-by-git-cached-plus-untracked-minus-repository-local-gitignore-after-core-source-exclusions'
      : 'regular-files-under-workspace-root-after-core-source-exclusions-no-gitignore-material-detected',
    workspaceId,
    entryCount: includedEntries.length,
    totalBytes,
    sourceSelection: selection.evidence,
    exclusions: Object.freeze({
      directories: sourceEligibility.excludedDirectories,
      relativePaths: sourceEligibility.excludedRelativePaths,
      fileSuffixes: sourceEligibility.excludedFileSuffixes,
      gitignoreEntries: Object.freeze([...new Set(ignoredEntries)].sort()),
      symbolicLinks: 'excluded-and-reported',
      sourceEligibilitySchema: sourceEligibility.schema
    }),
    skippedSymlinks: Object.freeze(skippedSymlinks.sort()),
    entriesFingerprint: sha256Text(stableJson(includedEntries))
  });
  return Object.freeze({
    schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID,
    status: 'qualified-complete',
    rootBoundary: '.',
    evidence: evidencePayload,
    materialization: Object.freeze({
      id: workspaceId,
      title: workspaceTitle || workspaceId,
      state: 'complete',
      source: Object.freeze({
        kind: 'node-directory-enumeration',
        workspaceId,
        boundary: '.',
        operatorMetadata: Object.freeze(serializableMetadata(options.sourceMetadata || {})),
        authority: 'none'
      }),
      completenessEvidence: evidencePayload,
      entries: Object.freeze(entries),
      includedEntries: Object.freeze(includedEntries)
    })
  });
}

async function enumerateFilesystemFallback(root, sourceEligibility, maxFiles) {
  const queue = [root];
  const paths = [];
  const gitignoreFiles = [];
  while (queue.length) {
    const current = queue.shift();
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const relative = normalizeRelativePath(path.relative(root, absolute));
      const eligibility = qualifyPortableSourcePath(relative, {
        excludeDirectories: sourceEligibility.excludedDirectories,
        excludeRelativePaths: sourceEligibility.excludedRelativePaths,
        entryKind: entry.isDirectory() ? 'directory' : 'file'
      });
      if (!eligibility.eligible) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile()) {
        paths.push(relative);
        if (path.basename(relative) === '.gitignore') gitignoreFiles.push(relative);
      }
      if (paths.length > maxFiles) break;
    }
    if (paths.length > maxFiles) break;
  }
  return Object.freeze({ paths: Object.freeze(paths.sort()), gitignoreFiles: Object.freeze(gitignoreFiles.sort()) });
}

function blockedIgnoreResult(maxFiles, observedFiles, sourceSelection, gitignoreFiles, reason) {
  return Object.freeze({
    schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID,
    status: 'source-selection-unavailable',
    maxFiles,
    observedFiles,
    materialization: null,
    evidence: Object.freeze({
      state: 'blocked',
      proof: 'deterministic-node-enumeration-v3',
      reason,
      sourceSelection,
      gitignoreFiles: Object.freeze([...new Set(gitignoreFiles)].sort()),
      boundary: 'Workspace enumeration fails closed when eligible .gitignore material exists but shared Git-backed source selection is unavailable.'
    })
  });
}

function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function mediaTypeForPath(value = '') { const lower = String(value).toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function sha256Text(value) { return sha256Hex(new TextEncoder().encode(String(value))); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
