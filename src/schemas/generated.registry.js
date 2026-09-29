import catalog from './generated/native.schema.catalog.json' with { type: 'json' };
import { nativeSchemaMarkdownById } from './generated/native.schema.pack.js';
import { parsePortableSchemaDocument } from '../tooling/portable/schema/schema.contract.js';
import { projectSchemaRuntimeFromSnapshot } from '../tooling/portable/schema/runtime.project.js';
import { defineBundledSchemaSource } from './schema.source.js';
import { defineGenericArtifactSchemaModule } from './generic.artifact.module.js';

const entries = Object.freeze([...(catalog?.entries || [])]);
const byId = new Map(entries.map((entry) => [String(entry?.schemaId || ''), entry]));
const documentCache = new Map();
const projectionCache = new Map();

export const generatedNativeSchemaModules = Object.freeze(entries
  .filter((entry) => entry?.specialized !== true)
  .map((entry) => genericModule(entry)));

export const nativeSchemaCatalog = Object.freeze({
  schema: String(catalog?.schema || 'tiinex.native.schema.catalog.v1'),
  source: Object.freeze({ ...(catalog?.source || {}) }),
  count: Number(catalog?.count || entries.length),
  entries
});

function genericModule(entry = {}) {
  const binding = Object.freeze({ ...(entry.binding || {}) });
  const schemaSource = defineBundledSchemaSource(binding, () => runtimeProjectionFor(entry.schemaId), Object.freeze({ sourceLabel: 'Tiinex portable Schema Pack' }));
  return defineGenericArtifactSchemaModule({
    id: String(entry.schemaId || ''),
    label: String(entry.title || entry.schemaId || ''),
    parentSchemaId: String(entry.parentSchemaId || ''),
    summary: String(entry.summary || ''),
    role: String(binding.role || 'canonical-schema'),
    kind: String(binding.kind || 'structural'),
    binding,
    schemaSource
  });
}

function runtimeProjectionFor(schemaId = '') {
  const id = String(schemaId || '');
  if (projectionCache.has(id)) return projectionCache.get(id);
  const lineageEntries = lineageFor(id);
  const projection = projectSchemaRuntimeFromSnapshot({
    lineageDocuments: lineageEntries.map((entry) => documentFor(entry.schemaId)),
    lineageEntries: lineageEntries.map(runtimeEntry),
    sourceEntry: runtimeEntry(lineageEntries.at(-1))
  });
  projectionCache.set(id, projection);
  return projection;
}

function documentFor(schemaId = '') {
  const id = String(schemaId || '');
  if (documentCache.has(id)) return documentCache.get(id);
  const markdown = String(nativeSchemaMarkdownById[id] || '');
  const document = parsePortableSchemaDocument(markdown);
  documentCache.set(id, document);
  return document;
}

function lineageFor(schemaId = '') {
  const out = [];
  const seen = new Set();
  let current = byId.get(String(schemaId || '')) || null;
  while (current) {
    if (seen.has(current.schemaId)) throw new Error(`Generated native schema lineage cycle: ${current.schemaId}`);
    seen.add(current.schemaId);
    out.push(current);
    if (!current.parentSchemaId) break;
    current = byId.get(current.parentSchemaId) || null;
    if (!current) throw new Error(`Generated native schema Parent is unavailable for ${out.at(-1)?.schemaId || schemaId}.`);
  }
  return out.reverse();
}

function runtimeEntry(entry = {}) {
  const binding = entry?.binding || {};
  return Object.freeze({
    schemaId: String(entry?.schemaId || ''),
    parentSchemaId: String(entry?.parentSchemaId || ''),
    sourceRepository: String(binding?.sourceRepository || ''),
    sourceCommit: String(binding?.sourceCommit || ''),
    sourcePath: String(binding?.sourcePath || ''),
    publicationState: String(binding?.publicationState || ''),
    schemaReferencePublicationState: String(binding?.schemaReferencePublicationState || ''),
    snapshotCompleteness: String(binding?.snapshotCompleteness || ''),
    sha256: String(binding?.checksum?.value || ''),
    gitBlobSha: String(binding?.sourceBlobSha || ''),
    bytes: Number(entry?.bytes || 0)
  });
}
