import path from 'node:path';
import { constants } from 'node:fs';
import { lstat, open, readdir, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { indexPortableMaterials } from '../../package/material.graph.js';
import { projectPortableTransitionCatalog } from '../../transitions/transition.catalog.js';

export const PORTABLE_WORKSPACE_ARTIFACT_DISCOVERY_SCHEMA_ID = 'tiinex.portable.workspace-artifact-candidates.v1';
const EXCLUDED_PRIVATE_DIRS = new Set(['.git', '.vscode', '.idea', 'node_modules']);
const DEFAULT_LIMITS = Object.freeze({ maxDirectories: 10000, maxCandidateFiles: 12000, maxFileBytes: 4 * 1024 * 1024, maxTotalBytes: 48 * 1024 * 1024 });

/**
 * Enumerate *candidate* Tiinex artifacts from an explicitly selected Workspace.
 * Nothing here grants package participation, schema validity, currentness,
 * Transition applicability or mutation rights. Callers must qualify them.
 *
 * Dot prefixes are irrelevant for candidate identity. Registered import
 * surfaces are a *different* composition contract (contentSource.discovery).
 */
export async function discoverWorkspaceArtifactCandidates(input = {}) {
  const rootToken = String(input.workspaceRoot || input.root || '').trim();
  if (!rootToken) throw new Error('portable.workspace-artifacts.workspace-root.required');
  const root = path.resolve(rootToken);
  const workspaceInfo = await lstat(root);
  if (!workspaceInfo.isDirectory()) throw new Error('portable.workspace-artifacts.workspace-root.not-directory');
  const topics = path.join(root, '.topics');
  let topicsInfo;
  try { topicsInfo = await lstat(topics); } catch (error) { if (error.code === 'ENOENT') return emptyResult(root); throw error; }
  if (!topicsInfo.isDirectory() || topicsInfo.isSymbolicLink()) throw new Error('portable.workspace-artifacts.topics-root.not-directory');
  const actualTopics = await realpath(topics);
  if (actualTopics !== topics && !actualTopics.startsWith(`${root}${path.sep}`)) throw new Error('portable.workspace-artifacts.topics-root.escape');
  const limits = Object.freeze(Object.fromEntries(Object.entries(DEFAULT_LIMITS).map(([key, defaultValue]) => {
    const value = input[key];
    return [key, Number.isSafeInteger(value) && value > 0 ? value : defaultValue];
  })));
  const queue = [topics];
  const files = [];
  let directories = 0;
  let totalBytes = 0;
  while (queue.length) {
    const current = queue.shift();
    if (++directories > limits.maxDirectories) throw new Error('portable.workspace-artifacts.directory-limit');
    const children = await readdir(current, { withFileTypes: true });
    children.sort((a,b) => a.name.localeCompare(b.name));
    for (const entry of children) {
      if (entry.isSymbolicLink()) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_PRIVATE_DIRS.has(entry.name)) queue.push(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.trace.md')) continue;
      if (files.length >= limits.maxCandidateFiles) throw new Error('portable.workspace-artifacts.file-limit');
      // Never follow a replacement symlink at read time. Even escaped links
      // with enticing .trace.md names must not be consumed.
      const handle = await open(full, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
      let data;
      try {
        const info = await handle.stat();
        if (!info.isFile() || info.size > limits.maxFileBytes) throw new Error('portable.workspace-artifacts.file-size-limit');
        if (totalBytes + info.size > limits.maxTotalBytes) throw new Error('portable.workspace-artifacts.total-size-limit');
        data = await handle.readFile();
        if (data.byteLength !== info.size) throw new Error('portable.workspace-artifacts.file-changed-during-read');
      } finally { await handle.close(); }
      const sourcePath = path.relative(root, full).split(path.sep).join('/');
      totalBytes += data.byteLength;
      files.push(Object.freeze({
        path: sourcePath,
        content: data.toString('utf8'),
        representationKey: `workspace:${sourcePath}:${createHash('sha256').update(data).digest('hex')}`,
        sourceMode: 'bounded-workspace-topics-candidate',
        source: Object.freeze({ sourceMode: 'bounded-workspace-topics-candidate', relativePath: sourcePath })
      }));
    }
  }
  const index = indexPortableMaterials(files);
  const artifacts = index.materials.filter((item) => item.schemaId && item.schemaId.startsWith('tiinex.') && !itemIsSchemaDocument(item))
    .map((item) => Object.freeze({ path: item.path, schemaId: item.schemaId, representationKey: item.representationKey, source: item.source, qualification: 'candidate-only' }));
  artifacts.sort((a, b) => a.path.localeCompare(b.path));
  const recognizedKeys = new Set(artifacts.map((item) => item.representationKey));
  const recognized = files.filter((file) => recognizedKeys.has(file.representationKey)).sort((a, b) => a.path.localeCompare(b.path));
  return Object.freeze({
    schema: PORTABLE_WORKSPACE_ARTIFACT_DISCOVERY_SCHEMA_ID,
    status: 'ready',
    workspaceRoot: root,
    searchRoot: '.topics',
    primaryWorkspaceCoordinate: '.topics/.workspaces',
    scannedDirectories: directories,
    scannedTraceFiles: files.length,
    totalBytes,
    candidates: Object.freeze(artifacts),
    files: Object.freeze(recognized),
    boundary: 'candidate-only; never implies artifact validity, primary Workspace, Semantic Package participation, Transition applicability or execution'
  });
}

function itemIsSchemaDocument(item = {}) { return Boolean(item.schemaDocument?.validation?.groups?.length); }
function emptyResult(root) { return Object.freeze({ schema: PORTABLE_WORKSPACE_ARTIFACT_DISCOVERY_SCHEMA_ID, status: 'no-topics', workspaceRoot: root, searchRoot: '.topics', primaryWorkspaceCoordinate: '.topics/.workspaces', scannedDirectories: 0, scannedTraceFiles: 0, totalBytes: 0, candidates: Object.freeze([]), files: Object.freeze([]), boundary: 'candidate-only' }); }

/** Node adapter over Core's portable catalog. Discovery cannot imply execution
 * or schema-companion attachment; those require an independent neighborhood. */
export async function discoverWorkspaceTransitionCatalog(input = {}) {
  const workspace = await discoverWorkspaceArtifactCandidates(input);
  const files = workspace.files.filter((file) => workspace.candidates.some((c) => c.representationKey === file.representationKey && c.schemaId === 'tiinex.transition.definition.v1'));
  const catalog = projectPortableTransitionCatalog({ files, outputSchemaId: input.outputSchemaId || '', inputSchemaId: input.inputSchemaId || '' });
  return Object.freeze({ ...catalog, workspaceDiscovery: Object.freeze({ searchRoot: workspace.searchRoot, primaryWorkspaceCoordinate: workspace.primaryWorkspaceCoordinate, scannedTraceFiles: workspace.scannedTraceFiles, discoveredTypedTransitions: files.length, qualification: 'candidate-only; portable catalog qualifications remain independent' }) });
}
