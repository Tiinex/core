import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { schemaMarkdown, schemaRegistry } from '../../../schemas/registry.js';

export const PORTABLE_SCHEMA_REGISTRY_MATERIAL_SCHEMA_ID = 'tiinex.portable.schema-registry-material.v1';

export function projectPortableSchemaRegistryMaterial() {
  const files = [];
  for (const module of schemaRegistry.modules || []) {
    const schemaId = String(module?.id || '').trim();
    const markdown = schemaMarkdown(schemaId);
    if (!schemaId || !markdown) continue;
    const binding = module?.binding || {};
    const sourcePath = normalizePath(binding.sourcePath || `.topics/.schemas/${schemaId}.schema.md`);
    const bytes = utf8Bytes(markdown);
    files.push(Object.freeze({
      path: sourcePath,
      content: markdown,
      bytes: bytes.byteLength,
      checksum: sha256Hex(bytes),
      sourceMode: 'portable-composed-schema-registry',
      source: Object.freeze({
        providerId: 'composed-schema-registry',
        repository: String(binding.sourceRepository || ''),
        ref: String(binding.sourceCommit || ''),
        commit: String(binding.sourceCommit || ''),
        path: sourcePath,
        authority: String(binding.originTrustRole || 'content-source'),
        qualification: 'exact-composed-schema-registry-byte',
        remoteFetch: false,
        cached: false
      })
    }));
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return Object.freeze({
    schema: PORTABLE_SCHEMA_REGISTRY_MATERIAL_SCHEMA_ID,
    files: Object.freeze(files),
    findings: Object.freeze([]),
    sourceMode: 'portable-composed-schema-registry'
  });
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/{2,}/g, '/'); }
