import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256Hex } from '../../../../export/package.bytes.js';

export const PORTABLE_BUNDLED_CONTENT_DISCOVERY_SCHEMA_ID = 'tiinex.portable.bundled-content-discovery.v1';
const MANIFEST_SCHEMA = 'tiinex.portable.tooling-bootstrap.manifest.v3';

export async function discoverBundledTiinexContentSources(input = {}) {
  const entrypoint = path.resolve(String(input.entrypoint || fileURLToPath(import.meta.url)));
  const bootstrapRoot = input.bootstrapRoot
    ? path.resolve(String(input.bootstrapRoot))
    : inferBootstrapRoot(entrypoint);
  const manifestPath = path.join(bootstrapRoot, 'manifest.json');
  let manifest;
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); }
  catch (error) {
    if (error?.code === 'ENOENT') return Object.freeze({
      schema: PORTABLE_BUNDLED_CONTENT_DISCOVERY_SCHEMA_ID,
      status: 'not-bundled',
      bootstrapRoot,
      sources: Object.freeze([]),
      findings: Object.freeze([]),
      boundary: 'No adjacent bundled bootstrap manifest was found. No content source is inferred from source checkout layout.'
    });
    throw error;
  }
  if (String(manifest?.schema || '') !== MANIFEST_SCHEMA) return Object.freeze({
    schema: PORTABLE_BUNDLED_CONTENT_DISCOVERY_SCHEMA_ID,
    status: 'unsupported-bootstrap-manifest',
    bootstrapRoot,
    sources: Object.freeze([]),
    findings: Object.freeze([]),
    boundary: 'Only bootstrap manifest v3 declares exact reusable content-source membership.'
  });

  const entriesBySource = new Map();
  for (const declared of manifest?.content?.entries || []) {
    const sourceId = String(declared?.sourceId || '').trim();
    if (!sourceId) throw new Error('portable.bundled-content.entry.source-id-required');
    const transportPath = normalizeRelativePath(declared?.path || '');
    if (!transportPath.startsWith('content/')) throw new Error(`portable.bundled-content.entry.path-invalid:${transportPath}`);
    const absolute = path.resolve(bootstrapRoot, transportPath);
    assertInside(bootstrapRoot, absolute, 'portable.bundled-content.entry.outside-bootstrap');
    const data = new Uint8Array(await readFile(absolute));
    const sha256 = sha256Hex(data);
    if (sha256 !== String(declared?.sha256 || '')) throw new Error(`portable.bundled-content.entry.digest-mismatch:${transportPath}`);
    if (data.byteLength !== Number(declared?.bytes || -1)) throw new Error(`portable.bundled-content.entry.byte-count-mismatch:${transportPath}`);
    const item = Object.freeze({
      sourceId,
      surface: String(declared?.surface || ''),
      surfaceRoot: normalizeRelativePath(declared?.surfaceRoot || ''),
      sourcePath: normalizeRelativePath(declared?.sourcePath || ''),
      data,
      bytes: data.byteLength,
      sha256
    });
    if (!entriesBySource.has(sourceId)) entriesBySource.set(sourceId, []);
    entriesBySource.get(sourceId).push(item);
  }

  const sources = [];
  for (const record of manifest?.content?.sourceRecords || []) {
    const id = String(record?.id || '').trim();
    if (!id) throw new Error('portable.bundled-content.source.id-required');
    const entries = (entriesBySource.get(id) || []).sort(compareEntry);
    const representation = entries.map(({ surface, surfaceRoot, sourcePath, bytes, sha256 }) => ({ surface, surfaceRoot, sourcePath, bytes, sha256 }));
    const representationSha256 = sha256Text(stableJson(representation));
    if (representationSha256 !== String(record?.representationSha256 || '')) throw new Error(`portable.bundled-content.source.representation-mismatch:${id}`);
    sources.push(Object.freeze({
      schema: 'tiinex.portable.content-source-discovery.v1',
      status: 'ready',
      source: Object.freeze({
        id,
        kind: String(record?.kind || 'bootstrap-content'),
        package: Object.freeze({ ...(record?.package || {}) }),
        capabilities: Object.freeze({ ...(record?.capabilities || {}) })
      }),
      surfaces: Object.freeze((record?.surfaces || []).map((surface) => Object.freeze({ name: String(surface?.name || ''), path: normalizeRelativePath(surface?.path || '') }))),
      entries: Object.freeze(entries),
      totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
      representationSha256,
      findings: Object.freeze([])
    }));
  }
  sources.sort((a, b) => a.source.id.localeCompare(b.source.id));
  const declaredIds = new Set(sources.map((source) => source.source.id));
  for (const sourceId of entriesBySource.keys()) if (!declaredIds.has(sourceId)) throw new Error(`portable.bundled-content.entry.undeclared-source:${sourceId}`);

  return Object.freeze({
    schema: PORTABLE_BUNDLED_CONTENT_DISCOVERY_SCHEMA_ID,
    status: 'ready',
    bootstrapRoot,
    compositionSha256: String(manifest?.composition?.sha256 || ''),
    contentRepresentationSha256: String(manifest?.content?.representationSha256 || ''),
    sources: Object.freeze(sources),
    findings: Object.freeze([]),
    boundary: 'Exact manifest-declared bootstrap content only. Discovery does not create semantic authority, applicability, invocation, ownership, or mutation authority.'
  });
}

function inferBootstrapRoot(entrypoint) {
  const normalized = path.resolve(entrypoint);
  const runtimeDir = path.dirname(path.dirname(normalized));
  if (path.basename(runtimeDir) !== 'runtime') return path.resolve(runtimeDir, '..');
  return path.dirname(runtimeDir);
}
function compareEntry(a, b) { return a.surfaceRoot.localeCompare(b.surfaceRoot) || a.sourcePath.localeCompare(b.sourcePath); }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
