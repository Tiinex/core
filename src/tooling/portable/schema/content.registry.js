import { parsePortableSchemaDocument } from './schema.contract.js';
import { projectSchemaRuntimeFromSnapshot } from './runtime.project.js';
import { defineBundledSchemaSource } from '../../../schemas/schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../../schemas/generic.artifact.module.js';
import { decodePortableContentText, portableContentSourceEntries } from '../content/contentSource.records.js';

export const PORTABLE_SCHEMA_CONTENT_REGISTRY_SCHEMA_ID = 'tiinex.portable.schema-content-registry.v1';

export function projectPortableSchemaContentRegistry(input = {}) {
  const findings = [];
  const materials = portableContentSourceEntries(input, '.schemas');
  const catalogCandidates = materials.filter((item) => /(?:^|\/)native\.schema\.catalog\.json$/i.test(item.sourcePath));
  const catalogsBySource = selectCatalogsBySource(catalogCandidates, findings);
  const documents = [];
  const byId = new Map();

  for (const material of materials.filter((item) => /\.schema\.md$/i.test(item.sourcePath))) {
    const markdown = decodePortableContentText(material);
    if (!markdown) {
      findings.push(finding('warning', 'portable.schema-content.markdown.unreadable', 'A .schemas canonical Markdown candidate could not be decoded as UTF-8.', material));
      continue;
    }
    let document;
    try { document = parsePortableSchemaDocument(markdown); }
    catch (error) {
      findings.push(finding('warning', 'portable.schema-content.markdown.invalid', 'A .schemas canonical Markdown candidate could not be parsed as a Tiinex schema document.', material, { error: String(error?.message || error) }));
      continue;
    }
    const schemaId = String(document?.schemaId || '').trim();
    if (!schemaId) continue;
    const existing = byId.get(schemaId);
    if (existing && existing.markdown !== markdown) {
      findings.push(finding('error', 'portable.schema-content.schema-id.ambiguous', 'Multiple .schemas candidates declare the same schema id with different bytes.', material, { schemaId, existingPath: existing.material.sourcePath }));
      continue;
    }
    if (existing) continue;
    const record = Object.freeze({ schemaId, parentSchemaId: String(document?.parentSchemaId || '').trim(), document, markdown, material });
    byId.set(schemaId, record);
    documents.push(record);
  }

  for (const record of documents) {
    if (record.parentSchemaId && !byId.has(record.parentSchemaId)) findings.push(finding('error', 'portable.schema-content.parent.missing', 'A schema Parent is not available in the selected .schemas content closure.', record.material, { schemaId: record.schemaId, parentSchemaId: record.parentSchemaId }));
  }

  const projectionCache = new Map();
  const modules = [];
  for (const record of [...documents].sort((a, b) => a.schemaId.localeCompare(b.schemaId))) {
    const catalogEntry = catalogEntryFor(record, catalogsBySource);
    const binding = Object.freeze({ ...(catalogEntry?.binding || fallbackBinding(record)) });
    const schemaSource = defineBundledSchemaSource(binding, () => runtimeProjectionFor(record.schemaId), Object.freeze({ sourceLabel: 'Tiinex composed Schema content source' }));
    modules.push(defineGenericArtifactSchemaModule({
      id: record.schemaId,
      label: String(catalogEntry?.title || record.document?.title || record.schemaId),
      parentSchemaId: record.parentSchemaId,
      summary: String(catalogEntry?.summary || record.document?.summary || ''),
      role: String(binding.role || 'canonical-schema'),
      kind: String(binding.kind || 'structural'),
      binding,
      schemaSource
    }));
  }

  function runtimeProjectionFor(schemaId) {
    if (projectionCache.has(schemaId)) return projectionCache.get(schemaId);
    const lineage = lineageFor(schemaId, byId);
    const lineageEntries = lineage.map((record) => runtimeEntry(record, catalogEntryFor(record, catalogsBySource)?.binding || fallbackBinding(record)));
    const projection = projectSchemaRuntimeFromSnapshot({
      lineageDocuments: lineage.map((record) => record.document),
      lineageEntries,
      sourceEntry: lineageEntries.at(-1)
    });
    projectionCache.set(schemaId, projection);
    return projection;
  }

  const effectiveCatalog = composedCatalog(documents, catalogsBySource);
  const markdownById = Object.freeze(Object.fromEntries([...documents].sort((a, b) => a.schemaId.localeCompare(b.schemaId)).map((record) => [record.schemaId, record.markdown])));
  const companionTextByPath = Object.freeze(Object.fromEntries(materials
    .filter((item) => /\.(?:trace\.md|md|json)$/i.test(item.sourcePath) && !/\.schema\.md$/i.test(item.sourcePath))
    .map((item) => [logicalCompanionPath(item), decodePortableContentText(item)])
    .filter(([logicalPath, text]) => logicalPath && text)));
  const manifest = Object.freeze({
    schema: 'tiinex.schema.pack.v1',
    source: Object.freeze({ ...(effectiveCatalog?.source || {}) }),
    count: documents.length,
    schemas: Object.freeze([...documents].sort((a, b) => a.schemaId.localeCompare(b.schemaId)).map((record) => {
      const catalogEntry = catalogEntryFor(record, catalogsBySource) || {};
      const binding = catalogEntry.binding || fallbackBinding(record);
      return Object.freeze({
        schemaId: record.schemaId,
        parentSchemaId: record.parentSchemaId,
        sourcePath: String(binding.sourcePath || record.material.sourcePath || ''),
        packPath: logicalPackPath(record.material),
        bytes: Number(record.material.bytes || 0),
        sha256: String(binding?.checksum?.value || record.material.sha256 || ''),
        gitBlobSha: String(binding?.sourceBlobSha || ''),
        specialized: Boolean(catalogEntry.specialized)
      });
    }))
  });
  const errors = findings.filter((item) => item.severity === 'error').length;
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  return Object.freeze({
    schema: PORTABLE_SCHEMA_CONTENT_REGISTRY_SCHEMA_ID,
    status: errors ? 'blocked' : warnings ? 'degraded' : 'ready',
    modules: Object.freeze(modules),
    catalog: effectiveCatalog,
    material: Object.freeze({ markdownById, manifest, companionTextByPath }),
    schemaIds: Object.freeze(modules.map((module) => module.id)),
    findings: Object.freeze(findings),
    boundary: 'Schema identity and generic runtime contracts are projected from exact selected .schemas content-source bytes. Specialized executable companions, applicability, publication and mutation authority remain separate.'
  });
}

function selectCatalogsBySource(candidates, findings) {
  const grouped = new Map();
  for (const material of candidates) {
    const sourceId = String(material?.sourceId || '').trim();
    if (!sourceId) continue;
    if (!grouped.has(sourceId)) grouped.set(sourceId, []);
    grouped.get(sourceId).push(material);
  }
  const catalogs = new Map();
  for (const [sourceId, sourceCandidates] of grouped) {
    const parsed = [];
    for (const material of sourceCandidates) {
      try {
        const value = JSON.parse(decodePortableContentText(material));
        if (value && Array.isArray(value.entries)) parsed.push({ material, value });
      } catch {
        findings.push(finding('warning', 'portable.schema-content.catalog.invalid', 'A schema catalog companion is not valid JSON.', material));
      }
    }
    if (!parsed.length) continue;
    const byBytes = new Map(parsed.map((item) => [JSON.stringify(item.value), item]));
    if (byBytes.size !== 1) {
      findings.push(finding('error', 'portable.schema-content.catalog.ambiguous', 'One selected .schemas source provides different schema catalog companions.', parsed[0].material, { sourceId, candidates: parsed.length }));
      continue;
    }
    const catalog = [...byBytes.values()][0].value;
    catalogs.set(sourceId, Object.freeze({
      value: catalog,
      byId: new Map((catalog.entries || []).map((entry) => [String(entry?.schemaId || '').trim(), entry]).filter(([id]) => id))
    }));
  }
  return catalogs;
}

function catalogEntryFor(record, catalogsBySource) {
  return catalogsBySource.get(String(record?.material?.sourceId || ''))?.byId?.get(String(record?.schemaId || '')) || null;
}

function composedCatalog(documents, catalogsBySource) {
  const sourceIds = [...new Set(documents.map((record) => String(record?.material?.sourceId || '')).filter(Boolean))].sort();
  if (sourceIds.length === 1) {
    const single = catalogsBySource.get(sourceIds[0])?.value;
    if (single) return deepFreeze(single);
  }
  const entries = documents
    .map((record) => catalogEntryFor(record, catalogsBySource))
    .filter(Boolean);
  return deepFreeze({
    schema: 'tiinex.composed.schema.catalog.v1',
    source: Object.freeze({ provider: 'content-composition', sourceIds: Object.freeze(sourceIds) }),
    count: documents.length,
    entries: Object.freeze(entries)
  });
}

function lineageFor(schemaId, byId) {
  const out = [];
  const seen = new Set();
  let current = byId.get(String(schemaId || '')) || null;
  while (current) {
    if (seen.has(current.schemaId)) throw new Error(`portable.schema-content.lineage-cycle:${current.schemaId}`);
    seen.add(current.schemaId);
    out.push(current);
    if (!current.parentSchemaId) break;
    current = byId.get(current.parentSchemaId) || null;
  }
  return out.reverse();
}

function runtimeEntry(record, binding = {}) {
  return Object.freeze({
    schemaId: record.schemaId,
    parentSchemaId: record.parentSchemaId,
    sourceRepository: String(binding?.sourceRepository || ''),
    sourceCommit: String(binding?.sourceCommit || ''),
    sourcePath: String(binding?.sourcePath || record.material.sourcePath || ''),
    publicationState: String(binding?.publicationState || ''),
    schemaReferencePublicationState: String(binding?.schemaReferencePublicationState || ''),
    snapshotCompleteness: String(binding?.snapshotCompleteness || ''),
    sha256: String(binding?.checksum?.value || record.material.sha256 || ''),
    gitBlobSha: String(binding?.sourceBlobSha || ''),
    bytes: Number(record.material.bytes || 0)
  });
}

function fallbackBinding(record) {
  return {
    schemaId: record.schemaId,
    kind: 'structural',
    role: 'canonical-schema',
    module: '',
    snapshot: `content-source:${record.schemaId}`,
    canonicalUri: `tiinex://schemas/${record.schemaId}`,
    permalink: '', rawUrl: '',
    sourcePath: record.material.sourcePath,
    sourceRepository: '', sourceCommit: '', sourceBlobSha: '', originId: record.material.sourceId || '',
    originTrustRole: 'content-source',
    checksum: { algorithm: 'sha256', value: record.material.sha256 },
    capabilityContract: 'tiinex.schema.module.v1',
    snapshotCompleteness: 'exact-content-source-representation',
    publicationState: 'qualified-local-unpublished',
    schemaReferencePublicationState: 'qualified-local-unpublished',
    bindingVersion: 'tiinex.web.schema-binding.v1'
  };
}

function logicalPackPath(material = {}) {
  const sourcePath = String(material?.sourcePath || '').replace(/\\/g, '/');
  const surfaceRoot = String(material?.surfaceRoot || '').replace(/\\/g, '/').replace(/\/+$/, '');
  return surfaceRoot && sourcePath.startsWith(`${surfaceRoot}/`) ? `schemas/${sourcePath.slice(surfaceRoot.length + 1)}` : `schemas/${sourcePath.split('/').pop() || ''}`;
}

function logicalCompanionPath(material = {}) {
  const sourcePath = String(material?.sourcePath || '').replace(/\\/g, '/');
  const surfaceRoot = String(material?.surfaceRoot || '').replace(/\\/g, '/').replace(/\/+$/, '');
  return surfaceRoot && sourcePath.startsWith(`${surfaceRoot}/`) ? sourcePath.slice(surfaceRoot.length + 1) : sourcePath.split('/').pop() || '';
}

function finding(severity, code, message, material = {}, extra = {}) {
  return Object.freeze({ severity, code, message, context: Object.freeze({ sourceId: material.sourceId || '', path: material.sourcePath || '', ...extra }) });
}
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; for (const item of Object.values(value)) deepFreeze(item); return Object.freeze(value); }
