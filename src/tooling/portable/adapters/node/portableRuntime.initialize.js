import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverBundledTiinexContentSources } from './bootstrapContent.discovery.js';
import { discoverInstalledTiinexContentSources, discoverLocalTiinexContentSource } from './contentSource.discovery.js';
import { initializePortableSchemaRuntime } from './schemaRuntime.initialize.js';

export const PORTABLE_NODE_RUNTIME_INITIALIZATION_SCHEMA_ID = 'tiinex.portable.node-runtime-initialization.v1';

export async function initializePortableNodeRuntime(input = {}) {
  const entrypoint = path.resolve(String(input.entrypoint || fileURLToPath(import.meta.url)));
  const runtimeRoot = path.resolve(String(input.runtimeRoot || inferRuntimeRoot(entrypoint)));
  const findings = [];
  const sources = [];
  let discoveryBasis = 'none';

  for (const source of Array.isArray(input.contentSources) ? input.contentSources : []) if (source?.status === 'ready') sources.push(source);
  for (const root of explicitContentRoots(input)) {
    try {
      const source = await discoverLocalTiinexContentSource({ root, kind: 'explicit-runtime-content-root' });
      if (source.status === 'ready') sources.push(source);
    } catch (error) {
      findings.push(finding('warning', 'portable.runtime.content-root.unavailable', 'An explicitly supplied Tiinex content root could not be discovered.', { root, error: String(error?.message || error) }));
    }
  }
  if (sources.length) discoveryBasis = 'explicit-content-source';

  if (!sources.length && input.discoverBundled !== false) {
    const bundled = await discoverBundledTiinexContentSources({ entrypoint, bootstrapRoot: input.bootstrapRoot });
    if (bundled.status === 'ready') {
      sources.push(...(bundled.sources || []));
      discoveryBasis = 'bootstrap-manifest';
    }
  }

  if (!sources.length && input.discoverInstalled !== false) {
    try {
      const installed = await discoverInstalledTiinexContentSources({
        compositionRoot: path.resolve(String(input.compositionRoot || process.cwd())),
        includeDevDependencies: input.includeDevDependencies !== false,
        maxPackages: input.maxPackages
      });
      sources.push(...(installed.sources || []));
      discoveryBasis = installed.sources?.length ? 'installed-package-graph' : 'none';
      findings.push(...(installed.findings || []));
    } catch (error) {
      if (input.requireInstalledDiscovery === true) throw error;
    }
  }

  const contentSources = dedupeSources(sources);
  const schemaSources = contentSources.filter((source) => (source.entries || []).some((entry) => entry.surface === '.schemas'));
  if (!schemaSources.length) return Object.freeze({
    schema: PORTABLE_NODE_RUNTIME_INITIALIZATION_SCHEMA_ID,
    status: 'no-schema-content-source',
    runtimeRoot,
    discoveryBasis,
    contentSources: Object.freeze(contentSources),
    schemaRuntime: null,
    findings: Object.freeze(findings),
    boundary: 'Core runtime remains usable as mechanics without first-party schema content. Schema-aware operations require an installed, bundled, or explicitly selected qualified .schemas content source.'
  });

  const schemaRuntime = await initializePortableSchemaRuntime({
    contentSources,
    coreRoot: runtimeRoot,
    autoTrustDeclaredSchemaCompanions: input.autoTrustDeclaredSchemaCompanions !== false,
    trustedExecutableSourceIds: input.trustedExecutableSourceIds || []
  });
  findings.push(...(schemaRuntime.findings || []));
  return Object.freeze({
    schema: PORTABLE_NODE_RUNTIME_INITIALIZATION_SCHEMA_ID,
    status: schemaRuntime.status === 'blocked' ? 'blocked' : schemaRuntime.status,
    runtimeRoot,
    discoveryBasis,
    contentSources: Object.freeze(contentSources),
    schemaRuntime,
    findings: Object.freeze(findings),
    boundary: 'Runtime mechanics are initialized from selected content sources. Content presence does not create applicability, publication, Role, work, acceptance, or mutation authority.'
  });
}

function explicitContentRoots(input = {}) {
  const direct = Array.isArray(input.contentRoots) ? input.contentRoots : input.contentRoot ? [input.contentRoot] : [];
  const fromEnv = String(input.environmentContentRoots ?? process.env.TIINEX_CONTENT_ROOTS ?? '').trim();
  return [...direct, ...(fromEnv ? fromEnv.split(path.delimiter) : [])].map((item) => path.resolve(String(item || '').trim())).filter(Boolean);
}

function inferRuntimeRoot(entrypoint) {
  const normalized = path.resolve(entrypoint);
  const toolsDir = path.dirname(normalized);
  return path.basename(toolsDir) === 'tools' ? path.dirname(toolsDir) : path.dirname(path.dirname(normalized));
}

function dedupeSources(sources = []) {
  const byId = new Map();
  for (const source of sources) {
    const id = String(source?.source?.id || '').trim();
    if (!id || source?.status !== 'ready') continue;
    const existing = byId.get(id);
    if (existing && existing.representationSha256 !== source.representationSha256) throw new Error(`portable.runtime.content-source.identity-conflict:${id}`);
    if (!existing) byId.set(id, source);
  }
  return [...byId.values()].sort((a, b) => a.source.id.localeCompare(b.source.id));
}

function finding(severity, code, message, context = {}) { return Object.freeze({ severity, code, message, context: Object.freeze({ ...context }) }); }
