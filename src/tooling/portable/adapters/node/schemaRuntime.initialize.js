import { replaceSchemaRegistry } from '../../../../schemas/registry.js';
import { projectPortableSchemaContentRegistry } from '../../schema/content.registry.js';
import { loadPortableSchemaCompanionModules } from './schemaCompanion.runtime.js';

export const PORTABLE_SCHEMA_RUNTIME_INITIALIZATION_SCHEMA_ID = 'tiinex.portable.schema-runtime-initialization.v1';

export async function initializePortableSchemaRuntime(input = {}) {
  const content = projectPortableSchemaContentRegistry(input);
  const companions = await loadPortableSchemaCompanionModules(input);
  const findings = [...(content.findings || []), ...(companions.findings || [])];
  if (content.status === 'blocked' || companions.status === 'blocked') return result('blocked', [], content, companions, findings, null);

  const byId = new Map((content.modules || []).map((module) => [String(module?.id || ''), module]).filter(([id]) => id));
  for (const module of companions.modules || []) byId.set(String(module.id || ''), module);
  const modules = [...byId.values()];
  const root = byId.get('tiinex.root.v1') || null;
  if (!root) {
    findings.push(Object.freeze({ severity: 'error', code: 'portable.schema-runtime.root.missing', message: 'Selected schema content does not provide tiinex.root.v1.', context: Object.freeze({}) }));
    return result('blocked', modules, content, companions, findings, null);
  }

  const registry = replaceSchemaRegistry({
    modules,
    fallbackSchemaId: 'tiinex.root.v1',
    nativeCatalog: content.catalog,
    material: content.material,
    source: 'portable-content-source-composition'
  });
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  return result(warnings ? 'degraded' : 'ready', modules, content, companions, findings, registry);
}

function result(status, modules, content, companions, findings, registry) {
  return Object.freeze({
    schema: PORTABLE_SCHEMA_RUNTIME_INITIALIZATION_SCHEMA_ID,
    status,
    schemas: Object.freeze({ total: modules.length, specialized: companions.modules?.length || 0, generic: Math.max(0, modules.length - (companions.modules?.length || 0)) }),
    content: Object.freeze({ status: content.status, schemaCount: content.modules?.length || 0 }),
    companions: Object.freeze({ status: companions.status, files: companions.companionFiles || 0, modules: companions.schemaModules || 0, cacheRoot: companions.cacheRoot || '', trustedExecutableSourceIds: companions.trustedExecutableSourceIds || Object.freeze([]) }),
    registry: registry ? Object.freeze({ generation: registry.generation, source: registry.source, fallbackSchemaId: registry.fallback?.id || '' }) : null,
    findings: Object.freeze(findings),
    findingSummary: Object.freeze({ counts: Object.freeze({ error: findings.filter((item) => item.severity === 'error').length, warning: findings.filter((item) => item.severity === 'warning').length, info: findings.filter((item) => item.severity === 'info').length }) }),
    boundary: 'Runtime initialization consumes selected qualified schema content and explicitly trusted executable companions. It does not make content selection, publication, applicability or mutation authority implicit.'
  });
}
