import { schemaMarkdown, schemaRegistry } from '../../src/schemas/registry.js';

export function currentSchemaTarget(schemaId) {
  const module = schemaRegistry.byId?.get(String(schemaId || '')) || null;
  const target = String(module?.binding?.permalink || '').trim();
  if (!target) throw new Error(`No qualified test-runtime schema permalink for ${schemaId}. Did the Core test runtime bootstrap select Native content?`);
  return target;
}

export function currentSchemaMarkdown(schemaId) {
  const markdown = String(schemaMarkdown(String(schemaId || '')) || '');
  if (!markdown) throw new Error(`No qualified test-runtime schema bytes for ${schemaId}. Did the Core test runtime bootstrap select Native content?`);
  return markdown;
}

export function currentSchemaSourcePath(schemaId) {
  const module = schemaRegistry.byId?.get(String(schemaId || '')) || null;
  const sourcePath = String(module?.binding?.sourcePath || '').trim();
  if (!sourcePath) throw new Error(`No qualified test-runtime schema source path for ${schemaId}.`);
  return sourcePath;
}
