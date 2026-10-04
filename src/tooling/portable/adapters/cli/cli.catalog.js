import { discoverBundledTiinexContentSources } from '../node/bootstrapContent.discovery.js';
import { projectPortableEntryCatalog } from '../../entry/entry.catalog.js';
import { projectPortableProcessCatalog } from '../../process/process.catalog.js';
import { projectPortableScaffoldCatalog } from '../../../../scaffolds/scaffold.catalog.js';
import { SCAFFOLD_PLAN_SCHEMA_ID } from '../../../../scaffolds/scaffold.plan.js';
import { SCAFFOLD_COMPOSITE_PLAN_SCHEMA_ID } from '../../../../scaffolds/scaffold.compose.js';

export async function runCatalogCli(parsed = {}, runtime = {}) {
  const runtimeSources = Array.isArray(runtime?.contentSources) ? runtime.contentSources.filter((source) => source?.status === 'ready') : [];
  const bundled = runtimeSources.length ? null : await discoverBundledTiinexContentSources({ entrypoint: runtime?.commandInvocation?.entrypoint });
  const contentSources = runtimeSources.length ? runtimeSources : (bundled?.sources || []);
  const discovery = runtimeSources.length
    ? Object.freeze({
        status: 'ready',
        sources: Object.freeze(contentSources),
        compositionSha256: String(runtime?.runtimeInitialization?.schemaRuntime?.compositionSha256 || ''),
        contentRepresentationSha256: '',
        basis: String(runtime?.runtimeInitialization?.discoveryBasis || 'runtime-selected-content-sources')
      })
    : bundled;
  const entries = projectPortableEntryCatalog({ contentSources });
  const processes = projectPortableProcessCatalog({ contentSources });
  const scaffolds = projectPortableScaffoldCatalog({ contentSources });
  const schemaRuntime = runtime?.runtimeInitialization?.schemaRuntime || null;
  const schemas = Object.freeze({
    state: schemaRuntime?.status || (contentSources.some((source) => (source.entries || []).some((entry) => entry.surface === '.schemas')) ? 'available-not-initialized' : 'not-present'),
    total: Number(schemaRuntime?.schemas?.total || 0),
    specialized: Number(schemaRuntime?.schemas?.specialized || 0),
    generic: Number(schemaRuntime?.schemas?.generic || 0),
    companionFiles: Number(schemaRuntime?.companions?.files || 0),
    companionModules: Number(schemaRuntime?.companions?.modules || 0),
    registrySource: String(schemaRuntime?.registry?.source || '')
  });
  const errors = [entries, processes, scaffolds].flatMap((catalog) => catalog?.findings || []).filter((finding) => finding?.severity === 'error');
  return Object.freeze({
    schema: 'tiinex.portable.reusable-content-catalog.v1',
    status: discovery.status === 'ready' && !errors.length ? 'ready' : discovery.status === 'not-bundled' ? 'not-bundled' : errors.length ? 'blocked' : discovery.status,
    discovery: Object.freeze({
      state: discovery.status,
      sources: contentSources.length,
      compositionSha256: String(discovery.compositionSha256 || ''),
      contentRepresentationSha256: String(discovery.contentRepresentationSha256 || '')
    }),
    sources: Object.freeze(contentSources.map((source) => Object.freeze({
      id: source.source?.id || '',
      kind: source.source?.kind || '',
      package: source.source?.package || {},
      surfaces: source.surfaces || [],
      files: source.entries?.length || 0,
      representationSha256: source.representationSha256 || ''
    }))),
    entries,
    processes,
    scaffolds,
    schemas,
    capabilities: Object.freeze({
      scaffoldCatalog: true,
      scaffoldPlanSchema: SCAFFOLD_PLAN_SCHEMA_ID,
      scaffoldCompositePlanSchema: SCAFFOLD_COMPOSITE_PLAN_SCHEMA_ID
    }),
    boundary: 'Read-only projection of exact reusable content selected by this runtime, including bundled, installed, or explicitly supplied qualified content sources. Catalog presence does not create applicability, Entry occurrence, Role/work authority, target binding, acceptance, or mutation authority.'
  });
}

export function formatCatalogHuman(result = {}) {
  const lines = [
    'Tiinex Reusable Content',
    '',
    `State: ${result.status || 'unknown'}`,
    `Sources: ${result.discovery?.sources || 0}`,
    `Entries: ${result.entries?.entries?.length || 0}`,
    `Processes: ${result.processes?.processes?.length || 0}`,
    `Scaffolds: ${result.scaffolds?.scaffolds?.length || 0}`,
    `Schemas: ${result.schemas?.total || 0}${result.schemas?.state ? ` (${result.schemas.state})` : ''}`
  ];
  if (result.sources?.length) {
    lines.push('', 'Content sources:');
    for (const source of result.sources) lines.push(`- ${source.id}${source.package?.version ? ` ${source.package.version}` : ''}`);
  }
  if (result.entries?.entries?.length) {
    lines.push('', 'Entries:');
    for (const entry of result.entries.entries) lines.push(`- ${entry.label || entry.id} [${entry.schemaId}] — ${entry.sourceId}`);
  }
  if (result.processes?.processes?.length) {
    lines.push('', 'Processes:');
    for (const process of result.processes.processes) lines.push(`- ${process.title || process.artifactPath} — ${process.sourceId}`);
  }
  if (result.scaffolds?.scaffolds?.length) {
    lines.push('', 'Scaffolds:');
    for (const scaffold of result.scaffolds.scaffolds) lines.push(`- ${scaffold.handle}${scaffold.version ? ` ${scaffold.version}` : ''} — ${scaffold.sourceId}`);
  }
  lines.push('', 'Discovery only: availability does not imply applicability or mutation authority.');
  return lines.join('\n');
}
