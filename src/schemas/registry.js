const EMPTY_MATERIAL = Object.freeze({
  markdownById: Object.freeze({}),
  companionTextByPath: Object.freeze({}),
  manifest: Object.freeze({ schema: 'tiinex.schema.pack.v1', source: Object.freeze({}), count: 0, schemas: Object.freeze([]) })
});

const state = {
  modules: Object.freeze([]),
  byId: new Map(),
  byChecksum: new Map(),
  fallback: null,
  nativeCatalog: null,
  material: EMPTY_MATERIAL,
  generation: 0,
  source: 'uninitialized-content-source'
};

export const schemaRegistry = Object.freeze({
  get modules() { return state.modules; },
  get byId() { return state.byId; },
  get byChecksum() { return state.byChecksum; },
  get fallback() { return state.fallback; },
  get nativeCatalog() { return state.nativeCatalog; },
  get material() { return state.material; },
  get generation() { return state.generation; },
  get source() { return state.source; }
});

export function replaceSchemaRegistry({ modules = [], fallbackSchemaId = 'tiinex.root.v1', nativeCatalog: catalog = null, material = null, source = 'external-composition' } = {}) {
  const normalized = uniqueSchemaModules(modules);
  const byId = new Map(normalized.map((module) => [String(module.id || ''), module]));
  const byChecksum = new Map();
  for (const module of normalized) {
    const checksum = String(module?.binding?.checksum?.value || module?.binding?.checksum || '').trim();
    if (checksum && !byChecksum.has(checksum)) byChecksum.set(checksum, module);
  }
  state.modules = Object.freeze(normalized);
  state.byId = byId;
  state.byChecksum = byChecksum;
  state.fallback = byId.get(String(fallbackSchemaId || '').trim()) || null;
  state.nativeCatalog = catalog || null;
  state.material = material || EMPTY_MATERIAL;
  state.generation += 1;
  state.source = String(source || 'external-composition');
  return schemaRegistrySnapshot();
}

export function installSchemaModules(modules = [], { replaceExisting = true, fallbackSchemaId = 'tiinex.root.v1', nativeCatalog: catalog = undefined, material = undefined, source = 'external-composition' } = {}) {
  const merged = new Map(state.modules.map((module) => [String(module.id || ''), module]));
  for (const module of uniqueSchemaModules(modules)) {
    const id = String(module.id || '');
    if (!replaceExisting && merged.has(id)) continue;
    merged.set(id, module);
  }
  return replaceSchemaRegistry({ modules: [...merged.values()], fallbackSchemaId, nativeCatalog: typeof catalog === 'undefined' ? state.nativeCatalog : catalog, material: typeof material === 'undefined' ? state.material : material, source });
}

export function clearSchemaRegistry({ source = 'uninitialized-content-source' } = {}) {
  return replaceSchemaRegistry({ modules: [], nativeCatalog: null, material: EMPTY_MATERIAL, source });
}

export function schemaRegistrySnapshot() {
  return Object.freeze({ modules: state.modules, byId: state.byId, byChecksum: state.byChecksum, fallback: state.fallback, nativeCatalog: state.nativeCatalog, material: state.material, generation: state.generation, source: state.source });
}

export function schemaMarkdown(schemaId = '') { return String(state.material?.markdownById?.[String(schemaId || '')] || ''); }
export function schemaPackManifest() { return state.material?.manifest || EMPTY_MATERIAL.manifest; }
export function schemaCompanionTextEntries() { return Object.freeze(Object.entries(state.material?.companionTextByPath || {}).map(([path, content]) => Object.freeze([path, String(content || '')]))); }

export function resolveSchemaModule({ schemaId, checksum } = {}) {
  if (checksum && state.byChecksum.has(checksum)) return state.byChecksum.get(checksum);
  if (schemaId && state.byId.has(schemaId)) return state.byId.get(schemaId);
  return state.fallback;
}

function uniqueSchemaModules(modules = []) {
  const byId = new Map();
  for (const module of modules || []) {
    const id = String(module?.id || '').trim();
    if (!id || !module || typeof module !== 'object') continue;
    byId.set(id, module);
  }
  return [...byId.values()];
}
