import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { schemaRegistry } from '../../../../schemas/registry.js';

const RUNTIME_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const BOOTSTRAP_MANIFEST = path.resolve(RUNTIME_ROOT, '..', 'manifest.json');
const CORE_PACKAGE = path.join(RUNTIME_ROOT, 'package.json');
const SCHEMA_PACK_MANIFEST = path.join(RUNTIME_ROOT, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'schema-pack', 'manifest.json');
const COMPANION_FACETS = Object.freeze(['validate', 'present', 'read', 'capabilities', 'viewActions', 'transitions', 'i18n', 'findings']);

export async function runVersionCli(parsed = {}) {
  const [corePackage, schemaPack, bootstrapManifestRecord] = await Promise.all([
    readJson(CORE_PACKAGE),
    readJson(SCHEMA_PACK_MANIFEST),
    readOptionalJsonWithBytes(BOOTSTRAP_MANIFEST)
  ]);
  const bootstrapManifest = bootstrapManifestRecord?.value || null;
  const bundled = ['tiinex.portable.tooling-bootstrap.manifest.v1', 'tiinex.portable.tooling-bootstrap.manifest.v2'].includes(String(bootstrapManifest?.schema || ''));
  const schemas = Object.freeze((schemaPack?.schemas || []).map((entry) => schemaDependency(entry)));
  const specializedCount = schemas.filter((item) => item.companion.mode === 'specialized').length;
  const genericCount = schemas.length - specializedCount;
  const compositionSha256 = bundled
    ? String(bootstrapManifest?.composition?.sha256 || bootstrapManifest?.runtime?.representationSha256 || '')
    : '';
  return Object.freeze({
    schema: 'tiinex.portable.bootstrap-runtime-version.v1',
    status: 'ready',
    bundle: Object.freeze({
      state: bundled ? 'bundled-bootstrap-runtime' : 'source-runtime-unbundled',
      builtAt: bundled ? String(bootstrapManifest?.build?.createdAt || '') : '',
      manifestSha256: bundled ? sha256Hex(bootstrapManifestRecord.bytes) : '',
      orderingAuthority: bundled ? String(bootstrapManifest?.build?.orderingAuthority || 'none') : 'none'
    }),
    core: Object.freeze({ name: String(corePackage?.name || ''), version: String(corePackage?.version || '') }),
    composition: Object.freeze({
      state: bundled ? 'exact-manifest-runtime-representation' : 'unbundled-source-runtime',
      sha256: compositionSha256,
      runtimeFiles: bundled ? Number(bootstrapManifest?.runtime?.files || 0) : 0,
      runtimeBytes: bundled ? Number(bootstrapManifest?.runtime?.bytes || 0) : 0,
      timestampIndependent: true
    }),
    schemaPacks: Object.freeze([Object.freeze({
      id: 'tiinex-native',
      kind: 'native',
      source: Object.freeze({ ...(schemaPack?.source || {}) }),
      count: Number(schemaPack?.count || schemas.length),
      schemas
    })]),
    companions: Object.freeze({ specialized: specializedCount, generic: genericCount, totalSchemas: schemas.length }),
    comparison: Object.freeze({
      equalCompositionMeaning: 'Exact same manifest-declared runtime representation. Previously interpreted runtime/schema/companion material may be reused when task/source authority has not otherwise changed.',
      differentCompositionMeaning: 'Runtime composition differs. Inspect the reported Core/schema-pack/schema/companion facts; difference alone does not establish which runtime is authoritative.',
      builtAtMeaning: 'Bundle manufacture timestamp only; later time is not semantic succession authority.',
      coreVersionMeaning: 'Declared package version only; version ordering does not by itself supersede forks or differently composed runtimes.',
      arrivalOrderAuthority: 'none',
      globalSupersessionAuthority: 'none'
    }),
    boundary: 'Read-only local bootstrap/runtime composition projection. No network lookup, publication check, semantic supersession decision, or work authority is created by this command.'
  });
}

export function formatVersionHuman(result = {}, { tree = false } = {}) {
  const pack = result.schemaPacks?.[0] || {};
  const source = pack.source || {};
  const lines = [
    'Tiinex Bootstrap Runtime',
    '',
    `Bundle: ${result.bundle?.state || 'unknown'}`,
    `Built At: ${result.bundle?.builtAt || 'not bundled'}`,
    `Core: ${result.core?.name || 'unknown'} ${result.core?.version || 'unknown'}`,
    `Composition SHA-256: ${result.composition?.sha256 || 'not available for unbundled source runtime'}`,
    `Runtime: ${result.composition?.runtimeFiles || 0} files / ${result.composition?.runtimeBytes || 0} bytes`,
    `Schema Pack: ${source.repository || source.provider || 'unknown'}${source.commit ? `@${source.commit}` : ''} (${pack.count || 0} schemas)`,
    `Companions: ${result.companions?.specialized || 0} specialized / ${result.companions?.generic || 0} generic`,
    '',
    'Comparison boundary:',
    '- Equal Composition SHA-256 means the manifest-declared runtime composition is byte-identical; broad runtime/schema/companion re-reading is unnecessary unless other qualified context changed.',
    '- Built At, Core version, ZIP SHA, and arrival order do not by themselves establish semantic supersession.'
  ];
  if (tree) {
    lines.push('', 'Dependency tree:', ...formatSchemaTree(pack.schemas || [], result));
  } else {
    lines.push('', 'Use `version --tree` for the full schema/companion dependency tree or `version --json` for the machine-readable receipt.');
  }
  return lines.join('\n');
}

function schemaDependency(entry = {}) {
  const schemaId = String(entry.schemaId || '');
  const module = schemaRegistry.byId?.get(schemaId) || null;
  const facets = COMPANION_FACETS.filter((facet) => facetPresent(module?.[facet]));
  return Object.freeze({
    schemaId,
    parentSchemaId: String(entry.parentSchemaId || ''),
    sourcePath: String(entry.sourcePath || ''),
    sha256: String(entry.sha256 || ''),
    gitBlobSha: String(entry.gitBlobSha || ''),
    companion: Object.freeze({
      mode: entry.specialized === true ? 'specialized' : 'generic',
      facets: Object.freeze(facets)
    })
  });
}

function formatSchemaTree(schemas = [], result = {}) {
  const byParent = new Map();
  const byId = new Map(schemas.map((item) => [item.schemaId, item]));
  for (const item of schemas) {
    const parent = item.parentSchemaId && byId.has(item.parentSchemaId) ? item.parentSchemaId : '';
    const list = byParent.get(parent) || [];
    list.push(item);
    byParent.set(parent, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.schemaId.localeCompare(b.schemaId));
  const roots = (byParent.get('') || []).length ? byParent.get('') : schemas.filter((item) => item.schemaId === 'tiinex.root.v1');
  const lines = [`└─ ${result.core?.name || '@tiinex/core'} ${result.core?.version || ''}`.trimEnd()];
  const source = result.schemaPacks?.[0]?.source || {};
  lines.push(`   └─ Schema Pack ${source.repository || source.provider || 'unknown'}${source.commit ? `@${source.commit}` : ''}`);
  const seen = new Set();
  const visit = (item, prefix, last) => {
    if (!item || seen.has(item.schemaId)) return;
    seen.add(item.schemaId);
    const marker = last ? '└─' : '├─';
    const facets = item.companion?.facets?.length ? `: ${item.companion.facets.join(',')}` : '';
    lines.push(`${prefix}${marker} ${item.schemaId} [${item.companion?.mode || 'unknown'}${facets}]`);
    const children = byParent.get(item.schemaId) || [];
    children.forEach((child, index) => visit(child, `${prefix}${last ? '   ' : '│  '}`, index === children.length - 1));
  };
  roots.forEach((item, index) => visit(item, '      ', index === roots.length - 1));
  for (const item of schemas) if (!seen.has(item.schemaId)) visit(item, '      ', true);
  return lines;
}

function facetPresent(value) {
  if (typeof value === 'function') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function readOptionalJsonWithBytes(file) {
  try { const bytes = await readFile(file); return { bytes, value: JSON.parse(bytes.toString('utf8')) }; }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}
function sha256Hex(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
