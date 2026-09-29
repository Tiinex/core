import { schemaRegistry } from '../../src/schemas/registry.js';

export function currentSchemaTarget(schemaId) {
  const module = schemaRegistry.byId.get(String(schemaId || ''));
  const target = String(module?.binding?.permalink || '');
  if (!target) throw new Error(`No qualified current schema permalink for ${schemaId}.`);
  return target;
}
