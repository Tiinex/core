import { createHash } from 'node:crypto';
import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256Hex } from '../../../../export/package.bytes.js';
import { resolveSelectedTiinexContentSources } from './contentSource.discovery.js';

export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v3';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_RUNTIME_ROOT = path.resolve(MODULE_DIR, '../../../../..');
const IMPORT_RE = /(?:\bimport\s+(?:[^'";]+?\s+from\s+)?|\bexport\s+(?:\*|\{[^}]*\})\s+from\s+|\bimport\s*\()\s*['"]([^'"]+)['"]/g;

export async function buildToolingBootstrapTransportFiles(input = {}) {
  const delivery = normalizeDelivery(input.delivery);
  const runtimeRoot = path.resolve(String(input.runtimeRoot || DEFAULT_RUNTIME_ROOT));
  const runtime = await enumerateRuntimeDependencyGraph(runtimeRoot, { maxFiles: input.maxFiles });
  const runtimeIdentity = runtimeIdentityFromEnumeration(runtime);
  const content = await enumerateBootstrapContent(input);
  const compositionSha256 = sha256Text(stableJson({ runtime: runtime.representationSha256, content: content.representationSha256 }));
  const builtAt = normalizeBuildTimestamp(input.builtAt || input.buildCreatedAt || new Date().toISOString());
  const manifest = Object.freeze({
    schema: PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID,
    version: 1,
    delivery,
    entrypoint: 'runtime/tools/tiinex-portable.mjs',
    build: Object.freeze({ createdAt: builtAt, meaning: 'bootstrap-bundle-manufacture-time', orderingAuthority: 'none' }),
    core: Object.freeze({ name: runtimeIdentity.packageName, version: runtimeIdentity.packageVersion }),
    composition: Object.freeze({ sha256: compositionSha256, basis: 'exact-manifest-declared-runtime-and-content-representations', timestampIndependent: true, supersessionAuthority: 'none' }),
    qualification: Object.freeze({ authority: 'manifest-declared-exact-runtime-and-content-bytes-only', ordinaryWorkspaceBytesAreBootstrapAuthority: false, filenameOrColocationAuthority: false, registeredSurfaceMembershipCreatesSemanticAuthority: false }),
    runtime: Object.freeze({ files: runtime.entries.length, bytes: runtime.totalBytes, representationSha256: runtime.representationSha256, entries: Object.freeze(runtime.entries.map(({ path: entryPath, bytes, sha256 }) => Object.freeze({ path: `runtime/${entryPath}`, bytes, sha256 }))) }),
    content: Object.freeze({ sources: content.sources.length, surfaces: content.surfaceCount, files: content.entries.length, bytes: content.totalBytes, representationSha256: content.representationSha256, sourceRecords: content.sources, entries: Object.freeze(content.entries.map(({ transportPath, sourceId, surface, surfaceRoot, sourcePath, bytes, sha256 }) => Object.freeze({ path: transportPath, sourceId, surface, surfaceRoot, sourcePath, bytes, sha256 }))) }),
    canonicalSchemaMaterial: Object.freeze({ boundary: 'Schema material is carried only through selected registered .schemas content sources. Canonical schema authority remains the exact artifact/binding authority declared by that content; this bootstrap manifest is transport/composition authority only.' }),
    boundary: 'Portable Tooling bootstrap transport authority only. Build time, Core version, bootstrap hash, and receipt order are comparison facts, not global semantic supersession authority.'
  });
  const manifestBytes = new TextEncoder().encode(`${JSON.stringify(sortJson(manifest), null, 2)}\n`);
  const manifestSha256 = sha256Hex(manifestBytes);
  const persistentVerification = delivery === 'persistent' ? verifyExpectedPersistentBootstrap(input.expected, manifest, manifestSha256) : Object.freeze({ state: 'not-required' });
  const summary = Object.freeze({ schema: 'tiinex.portable.tooling-bootstrap.summary.v1', delivery, manifestSha256, representationSha256: runtime.representationSha256, runtimeRepresentationSha256: runtime.representationSha256, contentRepresentationSha256: content.representationSha256, compositionSha256, runtimeFiles: runtime.entries.length, runtimeBytes: runtime.totalBytes, contentSources: content.sources.length, contentFiles: content.entries.length, contentBytes: content.totalBytes, build: manifest.build, core: manifest.core, status: delivery === 'embedded' ? 'embedded-qualified' : 'persistent-identity-verified', persistentVerification });
  const files = [transportFile('tiinex.bootstrap/manifest.json', manifestBytes, 'tooling-bootstrap-manifest', 'portable-tooling-bootstrap-control')];
  if (delivery === 'embedded') {
    for (const entry of runtime.entries) files.push(transportFile(`tiinex.bootstrap/runtime/${entry.path}`, entry.data, 'tooling-bootstrap-runtime', 'portable-tooling-bootstrap-runtime'));
    for (const entry of content.entries) files.push(transportFile(`tiinex.bootstrap/${entry.transportPath}`, entry.data, 'tooling-bootstrap-content', 'portable-tooling-bootstrap-content'));
  }
  return Object.freeze({ manifest, summary, files: Object.freeze(files), runtimeIdentity, contentIdentity: Object.freeze({ representationSha256: content.representationSha256, sources: content.sources }) });
}

export async function buildToolingBootstrapRuntimeIdentity(input = {}) {
  const runtimeRoot = path.resolve(String(input.runtimeRoot || DEFAULT_RUNTIME_ROOT));
  const runtime = await enumerateRuntimeDependencyGraph(runtimeRoot, { maxFiles: input.maxFiles });
  return runtimeIdentityFromEnumeration(runtime);
}


async function enumerateBootstrapContent(input = {}) {
  const selection = await resolveSelectedTiinexContentSources(input);
  const sources = [...(selection.sources || [])];
  const usedKeys = new Set();
  const sourceRecords = [];
  const entries = [];
  let surfaceCount = 0;
  for (const source of sources) {
    const key = uniqueSourceKey(source.source.id, usedKeys);
    surfaceCount += source.surfaces.length;
    sourceRecords.push(Object.freeze({
      id: source.source.id,
      key,
      kind: source.source.kind,
      package: source.source.package,
      capabilities: Object.freeze({ ...(source.source.capabilities || {}) }),
      representationSha256: source.representationSha256,
      surfaces: Object.freeze(source.surfaces.map((surface) => Object.freeze({ name: surface.name, path: surface.path })))
    }));
    for (const entry of source.entries) entries.push(Object.freeze({
      ...entry,
      transportPath: `content/${key}/${entry.sourcePath}`
    }));
  }
  entries.sort((a, b) => a.transportPath.localeCompare(b.transportPath));
  const representation = entries.map(({ transportPath, sourceId, surface, surfaceRoot, sourcePath, bytes, sha256 }) => ({ path: transportPath, sourceId, surface, surfaceRoot, sourcePath, bytes, sha256 }));
  return Object.freeze({
    sources: Object.freeze(sourceRecords),
    entries: Object.freeze(entries),
    surfaceCount,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    representationSha256: sha256Text(stableJson(representation))
  });
}
function uniqueSourceKey(sourceId, used) {
  const base = String(sourceId || 'source').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'source';
  if (!used.has(base)) { used.add(base); return base; }
  let index = 2;
  while (used.has(`${base}-${index}`)) index += 1;
  const key = `${base}-${index}`;
  used.add(key);
  return key;
}

function runtimeIdentityFromEnumeration(runtime = {}) {
  const runtimeEntries = runtime.entries || [];
  const packageEntry = runtimeEntries.find((entry) => String(entry?.path || '') === 'package.json');
  let packageName = '';
  let packageVersion = '';
  if (packageEntry?.data) {
    try {
      const parsed = JSON.parse(new TextDecoder().decode(packageEntry.data));
      packageName = String(parsed?.name || '').trim();
      packageVersion = String(parsed?.version || '').trim();
    } catch {}
  }
  const shaFor = (entryPath) => String(runtimeEntries.find((entry) => String(entry?.path || '') === entryPath)?.sha256 || '');
  const sourceEntries = runtimeEntries.filter((entry) => String(entry?.path || '') !== 'package.json');
  const sourceRepresentationSha256 = sha256Text(stableJson(sourceEntries.map(({ path: entryPath, bytes, sha256 }) => ({ path: `runtime/${entryPath}`, bytes, sha256 }))));
  return Object.freeze({
    schema: 'tiinex.portable.tooling-runtime-identity.v1',
    packageName,
    packageVersion,
    representationSha256: String(runtime.representationSha256 || ''),
    sourceRepresentationSha256,
    runtimeFiles: Number(runtimeEntries.length),
    runtimeBytes: Number(runtime.totalBytes || 0),
    entrypointSha256: shaFor('tools/tiinex-portable.mjs'),
    enumerationPolicySha256: shaFor('src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js')
  });
}

function verifyExpectedPersistentBootstrap(expected, manifest, manifestSha256) {
  if (!expected || typeof expected !== 'object' || !Object.keys(expected).length) throw new Error('portable.tooling-bootstrap.persistent-verification.required');
  const candidate = expected.manifest && typeof expected.manifest === 'object' ? expected.manifest : expected;
  const expectedRepresentationSha256 = String(candidate.runtime?.representationSha256 || candidate.representationSha256 || expected.representationSha256 || '');
  if (!expectedRepresentationSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.representation-required');
  if (expectedRepresentationSha256 !== manifest.runtime.representationSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.representation-mismatch');
  const expectedFiles = Number(candidate.runtime?.files ?? candidate.runtimeFiles ?? expected.runtimeFiles ?? 0);
  if (expectedFiles && expectedFiles !== manifest.runtime.files) throw new Error('portable.tooling-bootstrap.persistent-verification.file-count-mismatch');
  const expectedBytes = Number(candidate.runtime?.bytes ?? candidate.runtimeBytes ?? expected.runtimeBytes ?? 0);
  if (expectedBytes && expectedBytes !== manifest.runtime.bytes) throw new Error('portable.tooling-bootstrap.persistent-verification.byte-count-mismatch');
  const expectedContentRepresentationSha256 = String(candidate.content?.representationSha256 || expected.contentRepresentationSha256 || '');
  if (expectedContentRepresentationSha256 && expectedContentRepresentationSha256 !== manifest.content.representationSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.content-representation-mismatch');
  const expectedCompositionSha256 = String(candidate.composition?.sha256 || expected.compositionSha256 || '');
  if (expectedCompositionSha256 && expectedCompositionSha256 !== manifest.composition.sha256) throw new Error('portable.tooling-bootstrap.persistent-verification.composition-mismatch');
  const expectedManifestSha256 = String(expected.manifestSha256 || '');
  if (expectedManifestSha256 && expected.delivery === 'persistent' && expectedManifestSha256 !== manifestSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.manifest-mismatch');
  return Object.freeze({ state: 'verified', basis: 'caller-supplied-exact-runtime-and-content-identity', representationSha256: manifest.runtime.representationSha256, contentRepresentationSha256: manifest.content.representationSha256, compositionSha256: manifest.composition.sha256, runtimeFiles: manifest.runtime.files, runtimeBytes: manifest.runtime.bytes, contentFiles: manifest.content.files, contentBytes: manifest.content.bytes, manifestSha256 });
}

async function enumerateRuntimeDependencyGraph(runtimeRoot, options = {}) {
  const maxFiles = positiveInteger(options.maxFiles, 4000);
  const queue = ['tools/tiinex-portable.mjs'];
  const seen = new Set();
  const files = new Map();
  while (queue.length) {
    const relative = normalizeRelativePath(queue.shift());
    if (seen.has(relative)) continue;
    seen.add(relative);
    if (seen.size > maxFiles) throw new Error(`portable.tooling-bootstrap.file-limit:${maxFiles}`);
    const absolute = path.resolve(runtimeRoot, relative);
    assertInside(runtimeRoot, absolute, 'portable.tooling-bootstrap.path.outside-runtime');
    const info = await lstat(absolute);
    if (!info.isFile()) throw new Error(`portable.tooling-bootstrap.dependency.not-file:${relative}`);
    const data = new Uint8Array(await readFile(absolute));
    files.set(relative, data);
    if (!/\.(?:m?js|cjs)$/i.test(relative)) continue;
    const text = new TextDecoder().decode(data);
    for (const specifier of staticRelativeSpecifiers(text)) {
      const resolved = resolveImportRelative(relative, specifier);
      if (resolved) queue.push(resolved);
    }
  }
  for (const explicit of ['package.json', 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md', 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json']) if (!files.has(explicit)) files.set(explicit, new Uint8Array(await readFile(path.resolve(runtimeRoot, explicit))));
  // First-party semantic content is supplied through registered content sources.
  // Runtime enumeration follows executable imports only and never sweeps schema/content directories by location.
  const entries = [...files.entries()].map(([entryPath, data]) => Object.freeze({ path: entryPath, data, bytes: data.byteLength, sha256: sha256Hex(data) })).sort((a, b) => a.path.localeCompare(b.path));
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const representationSha256 = sha256Text(stableJson(entries.map(({ path: entryPath, bytes, sha256 }) => ({ path: `runtime/${entryPath}`, bytes, sha256 }))));
  return Object.freeze({ entries: Object.freeze(entries), totalBytes, representationSha256 });
}

async function enumerateFilesUnder(root, runtimeRoot) {
  const out = [];
  const queue = [root];
  while (queue.length) {
    const current = queue.shift();
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile()) out.push(normalizeRelativePath(path.relative(runtimeRoot, absolute)));
    }
  }
  return out.sort();
}
function staticRelativeSpecifiers(text = '') { const out = []; IMPORT_RE.lastIndex = 0; let match; while ((match = IMPORT_RE.exec(text))) if (String(match[1] || '').startsWith('.')) out.push(match[1]); return out; }
function resolveImportRelative(fromFile, specifier) { const clean = String(specifier || '').split('?')[0].split('#')[0]; if (!clean.startsWith('.')) return ''; let resolved = normalizeRelativePath(path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), clean))); if (!path.posix.extname(resolved)) resolved = `${resolved}.js`; return resolved; }
function transportFile(filePath, data, kind, logicalKind) { return Object.freeze({ path: filePath, data, kind, logicalKind, mediaType: mediaTypeForPath(filePath), boundary: 'Manifest-declared portable Tooling bootstrap transport byte. Co-location does not grant bootstrap authority; exact manifest membership and digest are required.' }); }
function normalizeBuildTimestamp(value = '') {
  const text = String(value || '').trim();
  const date = new Date(text);
  if (!text || Number.isNaN(date.getTime())) throw new Error('portable.tooling-bootstrap.build-time.invalid');
  return date.toISOString();
}

function normalizeDelivery(value) { const delivery = String(value || 'embedded').trim().toLowerCase(); if (!['embedded', 'persistent'].includes(delivery)) throw new Error(`portable.tooling-bootstrap.delivery.unsupported:${delivery}`); return delivery; }
function mediaTypeForPath(value = '') { const lower = String(value).toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
