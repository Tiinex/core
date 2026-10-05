import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { sha256Hex } from '../../../../export/package.bytes.js';

export const PORTABLE_CONTENT_SOURCE_DISCOVERY_SCHEMA_ID = 'tiinex.portable.content-source-discovery.v1';
export const REGISTERED_TIIINEX_DISCOVERY_SURFACES = Object.freeze([
  '.entries',
  '.processes',
  '.scaffolds',
  '.schemas',
  '.workspaces'
]);
export const COMPOSABLE_TIIINEX_CONTENT_SURFACES = Object.freeze([
  '.entries',
  '.processes',
  '.scaffolds',
  '.schemas'
]);

const REGISTERED_SURFACE_SET = new Set(REGISTERED_TIIINEX_DISCOVERY_SURFACES);
const COMPOSABLE_SURFACE_SET = new Set(COMPOSABLE_TIIINEX_CONTENT_SURFACES);
const HARD_BOUNDARY_DIRS = new Set(['.git', 'node_modules']);

export function packageDeclaresTiinexContentSource(packageRecord = {}) {
  const tiinex = packageRecord && typeof packageRecord === 'object' ? packageRecord.tiinex : null;
  if (!tiinex || typeof tiinex !== 'object' || Array.isArray(tiinex)) return false;
  if (!Object.prototype.hasOwnProperty.call(tiinex, 'contentSource')) return false;
  const declaration = tiinex.contentSource;
  return Boolean(declaration && typeof declaration === 'object' && !Array.isArray(declaration));
}

export async function discoverLocalTiinexContentSource(input = {}) {
  const root = path.resolve(String(input.root || input.packageRoot || input.workspaceRoot || ''));
  if (!root) throw new Error('portable.content-source.root.required');
  const rootInfo = await lstat(root);
  if (!rootInfo.isDirectory()) throw new Error('portable.content-source.root.not-directory');
  const packageRecord = await readOptionalPackage(root);
  const sourceId = String(input.id || input.sourceId || packageRecord?.name || path.basename(root)).trim();
  if (!sourceId) throw new Error('portable.content-source.id.required');
  const topicsRoot = path.join(root, '.topics');
  const topicsInfo = await lstatOptional(topicsRoot);
  if (!topicsInfo?.isDirectory()) return freeze({
    schema: PORTABLE_CONTENT_SOURCE_DISCOVERY_SCHEMA_ID,
    status: 'not-content-source',
    source: sourceProjection({ sourceId, packageRecord, kind: input.kind || 'local-root', workspaceIds: input.workspaceIds || input.workspaceAliases || [] }),
    surfaces: [], entries: [], totalBytes: 0, representationSha256: sha256Text('[]'), findings: []
  });

  const surfaceRoots = await discoverRegisteredSurfaceRoots(topicsRoot, root);
  const entries = [];
  const findings = [];
  for (const surface of surfaceRoots.filter((item) => COMPOSABLE_SURFACE_SET.has(item.name))) {
    const files = await enumerateSurfaceFiles({ root, surfaceAbsolute: surface.absolute, registeredSurfaceRoots: new Set(surfaceRoots.map((item) => item.absolute)) });
    for (const sourcePath of files) {
      const absolute = path.resolve(root, sourcePath);
      const data = new Uint8Array(await readFile(absolute));
      entries.push(freeze({
        sourceId,
        surface: surface.name,
        surfaceRoot: surface.path,
        sourcePath,
        data,
        bytes: data.byteLength,
        sha256: sha256Hex(data)
      }));
    }
  }
  entries.sort(compareEntry);
  const representation = entries.map(({ surface, surfaceRoot, sourcePath, bytes, sha256 }) => ({ surface, surfaceRoot, sourcePath, bytes, sha256 }));
  const representationSha256 = sha256Text(stableJson(representation));
  return freeze({
    schema: PORTABLE_CONTENT_SOURCE_DISCOVERY_SCHEMA_ID,
    status: surfaceRoots.some((item) => COMPOSABLE_SURFACE_SET.has(item.name)) ? 'ready' : 'no-composable-surfaces',
    source: sourceProjection({ sourceId, packageRecord, kind: input.kind || 'local-root', workspaceIds: input.workspaceIds || input.workspaceAliases || [] }),
    surfaces: surfaceRoots.map(({ name, path: surfacePath }) => freeze({ name, path: surfacePath })),
    entries,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    representationSha256,
    findings
  });
}

export async function discoverDeclaredLocalTiinexContentSource(input = {}) {
  const root = path.resolve(String(input.root || input.packageRoot || input.workspaceRoot || ''));
  if (!root) throw new Error('portable.content-source.root.required');
  const packageRecord = await readOptionalPackage(root);
  if (!packageDeclaresTiinexContentSource(packageRecord || {})) return freeze({
    schema: PORTABLE_CONTENT_SOURCE_DISCOVERY_SCHEMA_ID,
    status: 'not-declared-content-source',
    source: sourceProjection({ sourceId: String(input.id || input.sourceId || packageRecord?.name || path.basename(root)).trim(), packageRecord, kind: input.kind || 'local-root', workspaceIds: input.workspaceIds || input.workspaceAliases || [] }),
    surfaces: [], entries: [], totalBytes: 0, representationSha256: sha256Text('[]'), findings: []
  });
  return discoverLocalTiinexContentSource({ ...input, root });
}

export async function resolveSelectedTiinexContentSources(input = {}) {
  const explicit = [];
  const supplied = Array.isArray(input.contentSources) ? input.contentSources : Array.isArray(input.contentRoots) ? input.contentRoots : [];
  for (const item of supplied) {
    if (item?.schema === PORTABLE_CONTENT_SOURCE_DISCOVERY_SCHEMA_ID) explicit.push(item);
    else if (typeof item === 'string') explicit.push(await discoverLocalTiinexContentSource({ root: item }));
    else if (item && typeof item === 'object') explicit.push(await discoverLocalTiinexContentSource(item));
  }
  const findings = [];
  if (input.compositionRoot || input.discoverInstalledContentSources === true) {
    const installed = await discoverInstalledTiinexContentSources({
      compositionRoot: input.compositionRoot || process.cwd(),
      includeDevDependencies: input.includeDevContentDependencies !== false,
      maxPackages: input.maxContentPackages
    });
    explicit.push(...installed.sources);
    findings.push(...(installed.findings || []));
  }
  const byId = new Map();
  for (const source of explicit.filter((item) => item?.status === 'ready')) {
    const id = String(source.source?.id || '').trim();
    if (!id) throw new Error('portable.content-source.selection.id-required');
    const previous = byId.get(id);
    if (previous && previous.representationSha256 !== source.representationSha256) throw new Error(`portable.content-source.selection.identity-conflict:${id}`);
    if (!previous) byId.set(id, source);
  }
  return freeze({ schema: 'tiinex.portable.selected-content-sources.v1', status: 'ready', sources: [...byId.values()].sort((a,b) => a.source.id.localeCompare(b.source.id)), findings });
}

export async function discoverInstalledTiinexContentSources(input = {}) {
  const compositionRoot = path.resolve(String(input.compositionRoot || input.root || ''));
  if (!compositionRoot) throw new Error('portable.content-source.composition-root.required');
  const packageRecord = await readOptionalPackage(compositionRoot);
  if (!packageRecord) throw new Error('portable.content-source.composition-package.required');
  const includeDevDependencies = input.includeDevDependencies !== false;
  const seedNames = declaredDependencyNames(packageRecord, { includeDevDependencies });
  const queue = seedNames.map((name) => ({ name, fromRoot: compositionRoot, depth: 0 }));
  const seenRoots = new Set();
  const sources = [];
  const findings = [];
  const maxPackages = positiveInteger(input.maxPackages, 512);

  while (queue.length) {
    if (seenRoots.size >= maxPackages) throw new Error(`portable.content-source.package-limit:${maxPackages}`);
    const candidate = queue.shift();
    const packageRoot = await resolveInstalledPackageRoot(candidate.name, candidate.fromRoot);
    if (!packageRoot) {
      findings.push(freeze({ severity: 'info', code: 'portable.content-source.package.unresolved', packageName: candidate.name, fromRoot: candidate.fromRoot }));
      continue;
    }
    const exactRoot = await realpath(packageRoot);
    if (seenRoots.has(exactRoot)) continue;
    seenRoots.add(exactRoot);
    const childPackage = await readOptionalPackage(exactRoot);
    if (packageDeclaresTiinexContentSource(childPackage || {})) {
      const discovered = await discoverLocalTiinexContentSource({ root: exactRoot, id: candidate.name, kind: 'installed-package' });
      if (discovered.status === 'ready') sources.push(discovered);
    }
    // Dependency traversal is package-graph discovery, not content-surface qualification.
    // An aggregation/Interop package may intentionally expose no reusable .topics surface of its own
    // while depending on packages that do. Follow declared dependencies regardless of whether the
    // intermediate package itself is a Tiinex content source.
    for (const dependencyName of declaredDependencyNames(childPackage || {}, { includeDevDependencies: false })) queue.push({ name: dependencyName, fromRoot: exactRoot, depth: candidate.depth + 1 });
  }
  sources.sort((a, b) => a.source.id.localeCompare(b.source.id));
  return freeze({
    schema: 'tiinex.portable.installed-content-sources.v1',
    status: 'ready',
    composition: freeze({ packageName: String(packageRecord.name || ''), packageVersion: String(packageRecord.version || '') }),
    sources,
    findings
  });
}

async function discoverRegisteredSurfaceRoots(topicsRoot, sourceRoot) {
  const out = [];
  const queue = [topicsRoot];
  while (queue.length) {
    const current = queue.shift();
    const children = await readdir(current, { withFileTypes: true });
    children.sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      if (!child.isDirectory()) continue;
      if (HARD_BOUNDARY_DIRS.has(child.name)) continue;
      const absolute = path.join(current, child.name);
      if (REGISTERED_SURFACE_SET.has(child.name)) {
        out.push({ name: child.name, absolute, path: normalizeRelativePath(path.relative(sourceRoot, absolute)) });
        // Registered surfaces may recur at any depth, including beneath another registered surface.
        // Surface membership is a discovery hint only, so continue walking to find nested registered roots.
        queue.push(absolute);
        continue;
      }
      // Unregistered dot-directories have no Tiinex-specific meaning and are not traversed as
      // package-composition surfaces. This keeps editor/VCS/package-private hidden trees inert.
      if (child.name.startsWith('.')) continue;
      queue.push(absolute);
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

async function enumerateSurfaceFiles({ root, surfaceAbsolute, registeredSurfaceRoots }) {
  const out = [];
  const queue = [surfaceAbsolute];
  while (queue.length) {
    const current = queue.shift();
    const children = await readdir(current, { withFileTypes: true });
    children.sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      const absolute = path.join(current, child.name);
      if (child.isDirectory()) {
        if (HARD_BOUNDARY_DIRS.has(child.name)) continue;
        if (absolute !== surfaceAbsolute && registeredSurfaceRoots.has(absolute)) continue;
        queue.push(absolute);
      } else if (child.isFile()) {
        out.push(normalizeRelativePath(path.relative(root, absolute)));
      }
    }
  }
  return out.sort();
}

async function resolveInstalledPackageRoot(packageName, fromRoot) {
  let current = path.resolve(fromRoot);
  const relativePackagePath = path.join(...String(packageName || '').split('/'));
  while (true) {
    const candidate = path.join(current, 'node_modules', relativePackagePath);
    const packageJson = path.join(candidate, 'package.json');
    const info = await lstatOptional(packageJson);
    if (info?.isFile()) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return '';
    current = parent;
  }
}

function declaredDependencyNames(packageRecord = {}, { includeDevDependencies = false } = {}) {
  const groups = [packageRecord.dependencies, packageRecord.optionalDependencies];
  if (includeDevDependencies) groups.push(packageRecord.devDependencies);
  return [...new Set(groups.flatMap((group) => Object.keys(group || {})))].sort();
}

async function readOptionalPackage(root) {
  try { return JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')); } catch { return null; }
}
async function lstatOptional(target) { try { return await lstat(target); } catch { return null; } }
function sourceProjection({ sourceId, packageRecord, kind, workspaceIds = [] }) {
  const contentSource = packageRecord?.tiinex?.contentSource || {};
  const declaredWorkspaceIds = [...new Set([...(contentSource?.workspaceIds || []), ...(workspaceIds || [])].map((value) => String(value || '').trim()).filter(Boolean))].sort();
  return freeze({
    id: sourceId,
    kind: String(kind || 'local-root'),
    package: freeze({ name: String(packageRecord?.name || ''), version: String(packageRecord?.version || '') }),
    capabilities: freeze({
      declaredContentSource: packageDeclaresTiinexContentSource(packageRecord || {}),
      registeredSurfaces: String(contentSource?.registeredSurfaces || ''),
      executableSchemaCompanions: contentSource?.executableSchemaCompanions === true,
      workspaceIds: declaredWorkspaceIds
    })
  });
}
function compareEntry(a, b) { return a.surfaceRoot.localeCompare(b.surfaceRoot) || a.sourcePath.localeCompare(b.sourcePath); }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || value instanceof Uint8Array || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
