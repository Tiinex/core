import path from 'node:path';
import { access, readFile, readdir } from 'node:fs/promises';
import { sha256Hex } from '../../../export/package.bytes.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { parseHandoffPackageV1 } from './recipientV2.packageV1.contract.js';
import { currentSchemaId, decodeUtf8, deepFreeze, dedupeFindings } from './recipientV2.packageV1.shared.js';
import { finding } from './recipientV2.topology.materials.js';

export async function compareSourceFrontiers(input = {}) {
  const leftKind = String(input.leftKind || '').trim();
  const rightKind = String(input.rightKind || '').trim();
  const leftRoot = String(input.left || '').trim();
  const rightPath = String(input.right || '').trim();
  const workspaceId = String(input.rightSelect || input.leftId || '').trim();
  const findings = [];

  if (leftKind !== 'local-workspace') findings.push(finding('error', 'portable.source-frontier.left-kind-invalid', 'Source frontier comparison requires a local workspace on the left side.', { observed: leftKind }));
  if (rightKind !== 'handoff-package') findings.push(finding('error', 'portable.source-frontier.right-kind-invalid', 'Source frontier comparison requires a handoff package on the right side.', { observed: rightKind }));
  if (!leftRoot) findings.push(finding('error', 'portable.source-frontier.left-missing', 'Source frontier comparison requires a local workspace root.', { side: 'left' }));
  if (!rightPath) findings.push(finding('error', 'portable.source-frontier.right-missing', 'Source frontier comparison requires a handoff package path.', { side: 'right' }));
  if (!workspaceId) findings.push(finding('error', 'portable.source-frontier.workspace-id-missing', 'Source frontier comparison requires a selected workspace id.', { side: 'right-select' }));
  if (findings.length) return blocked(findings);

  try {
    await access(leftRoot);
  } catch {
    findings.push(finding('error', 'portable.source-frontier.left-unavailable', 'The local workspace root is not available.', { path: leftRoot }));
    return blocked(findings);
  }

  let packageBytes;
  try {
    packageBytes = await readFile(rightPath);
  } catch {
    findings.push(finding('error', 'portable.source-frontier.right-unavailable', 'The handoff package path is not available.', { path: rightPath }));
    return blocked(findings);
  }

  const packageArchive = inspectStoredWorkspaceArchive(packageBytes, { ownedBytes: true });
  if (packageArchive.state !== 'qualified') {
    findings.push(finding('error', 'portable.source-frontier.package-unqualified', 'The supplied handoff package is not a qualified stored ZIP archive.', { path: rightPath }));
    findings.push(...packageArchive.findings);
    return blocked(findings);
  }

  const rootEntry = (packageArchive.entries || []).find((entry) => currentSchemaId(decodeUtf8(entry.data)) === 'tiinex.handoff.package.v1') || null;
  if (!rootEntry) {
    findings.push(finding('error', 'portable.source-frontier.package-root-missing', 'The handoff package does not expose a readable package-v1 root artifact.', { path: rightPath }));
    return blocked(findings);
  }

  const packageRoot = parseHandoffPackageV1(decodeUtf8(rootEntry.data));
  const binding = (packageRoot.workspaces || []).find((item) => String(item.workspaceId || '') === workspaceId) || null;
  if (!binding) {
    findings.push(finding('error', 'portable.source-frontier.workspace-missing', 'The selected workspace id is not bound by the supplied handoff package.', { workspaceId }));
    return blocked(findings);
  }
  if (!binding.snapshotPath) {
    findings.push(finding('error', 'portable.source-frontier.snapshot-path-missing', 'The selected workspace binding does not declare a snapshot path.', { workspaceId }));
    return blocked(findings);
  }

  const packageEntries = indexEntries(packageArchive.entries || []);
  const snapshotEntry = packageEntries.get(binding.snapshotPath) || null;
  if (!snapshotEntry) {
    findings.push(finding('error', 'portable.source-frontier.snapshot-missing', 'The selected workspace snapshot is not present in the supplied handoff package.', { workspaceId, path: binding.snapshotPath }));
    return blocked(findings);
  }

  const snapshotArchive = inspectStoredWorkspaceArchive(snapshotEntry.data, { ownedBytes: true });
  if (snapshotArchive.state !== 'qualified') {
    findings.push(finding('error', 'portable.source-frontier.snapshot-unqualified', 'The selected workspace snapshot is not a qualified stored ZIP archive.', { workspaceId, path: binding.snapshotPath }));
    findings.push(...snapshotArchive.findings);
    return blocked(findings);
  }

  const localFiles = await collectLocalFiles(leftRoot);
  const snapshotFiles = collectArchiveFiles(snapshotArchive.entries || []);
  const comparison = compareFileSets(localFiles, snapshotFiles);
  const state = comparison.counts.total === 0 ? 'exact' : 'changed';

  return deepFreeze({
    schema: 'tiinex.portable.source-frontier.compare.v1',
    status: 'ready',
    state,
    mode: 'two-way',
    workspaces: Object.freeze([
      Object.freeze({
        workspaceId,
        state,
        delta: Object.freeze({
          counts: Object.freeze(comparison.counts),
          added: Object.freeze(comparison.added),
          removed: Object.freeze(comparison.removed),
          byteChanged: Object.freeze(comparison.byteChanged)
        })
      })
    ]),
    findings: Object.freeze([]),
    boundary: 'Compares one local workspace root against the exact carried workspace snapshot bytes bound by a recipient-facing handoff package. It reports only file addition, removal, and byte-change counts and fails closed when the selected workspace binding or snapshot archive is unavailable.'
  });
}

function blocked(findings = []) {
  const all = dedupeFindings(findings);
  return deepFreeze({
    schema: 'tiinex.portable.source-frontier.compare.v1',
    status: 'blocked',
    state: 'blocked',
    mode: 'two-way',
    workspaces: Object.freeze([]),
    findings: Object.freeze(all),
    boundary: 'Source frontier comparison failed closed before any comparison result was emitted.'
  });
}

async function collectLocalFiles(root, current = root, prefix = '') {
  const files = [];
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (!prefix && entry.name === '.git') continue;
    const relative = normalizePath(prefix ? `${prefix}/${entry.name}` : entry.name);
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectLocalFiles(root, absolute, relative);
      files.push(...nested);
      continue;
    }
    if (!entry.isFile()) continue;
    const data = await readFile(absolute);
    files.push(Object.freeze({ path: relative, bytes: data.byteLength, sha256: sha256Hex(data) }));
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function collectArchiveFiles(entries = []) {
  return entries
    .filter((entry) => !isIgnoredPath(entry.path || ''))
    .map((entry) => Object.freeze({ path: normalizePath(entry.path || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || '').toLowerCase() }))
    .filter((entry) => entry.path)
    .sort((a, b) => a.path.localeCompare(b.path));
}

function compareFileSets(left = [], right = []) {
  const leftByPath = new Map(left.map((entry) => [entry.path, entry]));
  const rightByPath = new Map(right.map((entry) => [entry.path, entry]));
  const paths = [...new Set([...leftByPath.keys(), ...rightByPath.keys()])].sort();
  const added = [];
  const removed = [];
  const byteChanged = [];

  for (const filePath of paths) {
    const local = leftByPath.get(filePath) || null;
    const remote = rightByPath.get(filePath) || null;
    if (!local && remote) { added.push(filePath); continue; }
    if (local && !remote) { removed.push(filePath); continue; }
    if (local && remote && (local.bytes !== remote.bytes || local.sha256 !== remote.sha256)) byteChanged.push(filePath);
  }

  return {
    added,
    removed,
    byteChanged,
    counts: {
      added: added.length,
      removed: removed.length,
      byteChanged: byteChanged.length,
      total: added.length + removed.length + byteChanged.length
    }
  };
}

function indexEntries(entries = []) {
  const index = new Map();
  for (const entry of entries) index.set(normalizePath(entry.path || ''), entry);
  return index;
}

function normalizePath(value = '') {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/g, '').split('/').filter((part) => part && part !== '.').join('/');
}

function isIgnoredPath(value = '') {
  const normalized = normalizePath(value);
  return !normalized || normalized === '.git' || normalized.startsWith('.git/');
}