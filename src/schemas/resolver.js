import { schemaRegistry } from './registry.js';

export function resolveSchemaModule({ schemaId, checksum, registry = schemaRegistry } = {}) {
  if (checksum && registry.byChecksum?.has(checksum)) {
    const module = registry.byChecksum.get(checksum);
    return { module, status: 'checksum-match', fallbackUsed: false };
  }
  if (schemaId && registry.byId?.has(schemaId)) {
    const module = registry.byId.get(schemaId);
    return { module, status: 'schema-id-match', fallbackUsed: false };
  }
  return { module: registry.fallback || null, status: 'root-fallback', fallbackUsed: true, unresolvedSchemaId: schemaId || 'missing' };
}

export function schemaIdIsOrDescendsFrom(schemaId = '', ancestorSchemaId = '', registry = schemaRegistry) {
  const target = String(schemaId || '').trim();
  const ancestor = String(ancestorSchemaId || '').trim();
  if (!target || !ancestor) return false;
  const seen = new Set();
  let current = target;
  while (current && !seen.has(current)) {
    if (current === ancestor) return true;
    seen.add(current);
    const module = registry.byId?.get(current);
    if (!module || String(module.id || '') !== current) return false;
    current = String(module.parentSchemaId || '').trim();
  }
  return false;
}
