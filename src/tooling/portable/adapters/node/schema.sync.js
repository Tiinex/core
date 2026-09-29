import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parsePortableSchemaDocument } from '../../schema/schema.contract.js';
import { projectSchemaRuntimeFromSnapshot } from '../../schema/runtime.project.js';

export const NATIVE_SCHEMA_SYNC_RESULT_SCHEMA_ID = 'tiinex.portable.native-schema-sync-result.v1';
export const NATIVE_SCHEMA_CHECK_RESULT_SCHEMA_ID = 'tiinex.portable.native-schema-check-result.v1';
export const NATIVE_SCHEMA_PACK_SCHEMA_ID = 'tiinex.schema.pack.v1';

const DEFAULT_REPOSITORY = 'Tiinex/docs';
const SCHEMA_SUFFIX = '.schema.md';

export async function synchronizeNativeSchemas(options = {}) {
  const plan = await buildNativeSchemaSyncPlan(options);
  if (plan.status !== 'ready') return resultFromPlan(plan, 'sync', false);
  for (const output of plan.outputs) {
    await mkdir(path.dirname(output.path), { recursive: true });
    await writeFile(output.path, output.bytes);
  }
  for (const stalePath of plan.removals) await rm(stalePath, { force: true });
  return resultFromPlan(plan, 'sync', true);
}

export async function checkNativeSchemas(options = {}) {
  const plan = await buildNativeSchemaSyncPlan(options);
  if (plan.status !== 'ready') return resultFromPlan(plan, 'check', false);
  const findings = [...plan.findings];
  let driftCount = 0;
  for (const output of plan.outputs) {
    let actual = null;
    try { actual = await readFile(output.path); } catch {}
    if (!actual || !actual.equals(output.bytes)) {
      driftCount += 1;
      findings.push(finding('error', 'schema-sync.generated-drift', `Generated schema output is stale or missing: ${relativeDisplay(plan.coreRoot, output.path)}.`, { path: relativeDisplay(plan.coreRoot, output.path) }));
    }
  }
  for (const stalePath of plan.removals) {
    try {
      if ((await stat(stalePath)).isFile()) {
        driftCount += 1;
        findings.push(finding('error', 'schema-sync.stale-local-schema-copy', `Core contains a stale local schema Markdown copy outside the generated Schema Pack: ${relativeDisplay(plan.coreRoot, stalePath)}.`, { path: relativeDisplay(plan.coreRoot, stalePath) }));
      }
    } catch {}
  }
  const errors = findings.filter((item) => item.severity === 'error').length;
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  return Object.freeze({
    schema: NATIVE_SCHEMA_CHECK_RESULT_SCHEMA_ID,
    operation: 'schemas-check',
    status: errors ? 'blocked' : warnings ? 'degraded' : 'ready',
    docs: plan.docs,
    catalog: plan.catalogSummary,
    generated: Object.freeze({ expectedFiles: plan.outputs.length, driftCount, staleLocalSchemaCopies: plan.removals.length }),
    findingSummary: Object.freeze({ counts: Object.freeze({ error: errors, warning: warnings, info: findings.length - errors - warnings }) }),
    findings: Object.freeze(findings),
    boundary: 'Read-only deterministic comparison of the local canonical Docs schema snapshot against Core generated native schema material. No network access or remote mutation is performed.'
  });
}

export async function inspectNativeSchemaStatus(options = {}) {
  const check = await checkNativeSchemas(options);
  return Object.freeze({ ...check, schema: 'tiinex.portable.native-schema-status-result.v1', operation: 'schemas-status' });
}

export async function buildNativeSchemaSyncPlan(options = {}) {
  const coreRoot = path.resolve(String(options.coreRoot || process.cwd()));
  const docsRoot = path.resolve(String(options.docsRoot || ''));
  const repository = String(options.repository || DEFAULT_REPOSITORY).trim();
  const sourceCommit = String(options.sourceCommit || '').trim().toLowerCase();
  const published = options.published === true;
  const findings = [];
  if (!docsRoot || docsRoot === path.parse(docsRoot).root) findings.push(finding('error', 'schema-sync.docs-root.required', 'A local Docs Workspace root is required.'));
  if (published && !/^[0-9a-f]{40}$/.test(sourceCommit)) findings.push(finding('error', 'schema-sync.publication-commit.required', 'Published schema sync requires one exact 40-character immutable Docs commit.'));
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) findings.push(finding('error', 'schema-sync.repository.invalid', 'Schema source repository must be an exact owner/repository identifier.'));
  if (findings.some((item) => item.severity === 'error')) return blockedPlan({ coreRoot, docsRoot, repository, sourceCommit, findings });

  const schemaRoot = path.join(docsRoot, '.topics', '.schemas');
  const schemaFiles = (await listFilesRecursive(schemaRoot)).filter((item) => item.endsWith(SCHEMA_SUFFIX)).sort();
  if (!schemaFiles.length) findings.push(finding('error', 'schema-sync.schemas.missing', 'Docs Workspace does not contain canonical .topics/.schemas/**/*.schema.md material.'));
  const entries = [];
  const byId = new Map();
  for (const absolutePath of schemaFiles) {
    const bytes = await readFile(absolutePath);
    const markdown = bytes.toString('utf8');
    const document = parsePortableSchemaDocument(markdown);
    const schemaId = String(document.schemaId || '').trim();
    const sourcePath = normalizePath(path.relative(docsRoot, absolutePath));
    if (!schemaId) {
      findings.push(finding('error', 'schema-sync.schema-id.missing', `Canonical schema source has no Current Schema id: ${sourcePath}.`, { sourcePath }));
      continue;
    }
    if (byId.has(schemaId)) {
      findings.push(finding('error', 'schema-sync.schema-id.duplicate', `Canonical schema id is duplicated in Docs snapshot: ${schemaId}.`, { schemaId, sourcePath }));
      continue;
    }
    const sha256 = digest('sha256', bytes);
    const gitBlobSha = digest('sha1', Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]));
    const publicationState = published ? 'published-immutable-canonical' : 'qualified-local-unpublished';
    const entry = Object.freeze({
      schemaId,
      parentSchemaId: String(document.parentSchemaId || '').trim(),
      envelopeSchemaId: String(document.envelopeSchemaId || '').trim(),
      title: String(document.title || schemaId),
      summary: String(document.summary || ''),
      sourceRepository: repository,
      sourceCommit: published ? sourceCommit : '',
      sourcePath,
      gitBlobSha,
      sha256,
      bytes: bytes.length,
      publicationState,
      schemaReferencePublicationState: published ? 'published-immutable-canonical' : 'qualified-local-unpublished',
      snapshotCompleteness: published ? 'exact-canonical-docs-snapshot' : 'exact-local-docs-snapshot',
      markdown,
      document
    });
    entries.push(entry);
    byId.set(schemaId, entry);
  }

  for (const entry of entries) if (entry.parentSchemaId && !byId.has(entry.parentSchemaId)) findings.push(finding('error', 'schema-sync.parent.missing', `Schema ${entry.schemaId} declares unavailable Parent ${entry.parentSchemaId} in this snapshot.`, { schemaId: entry.schemaId, parentSchemaId: entry.parentSchemaId }));
  for (const entry of entries) {
    const cycle = lineageCycle(entry.schemaId, byId);
    if (cycle.length) findings.push(finding('error', 'schema-sync.lineage.cycle', `Schema lineage cycle detected: ${cycle.join(' -> ')}.`, { schemaId: entry.schemaId, cycle }));
  }
  if (findings.some((item) => item.severity === 'error')) return blockedPlan({ coreRoot, docsRoot, repository, sourceCommit, findings, entries });

  const existingBindings = await existingSpecializedBindings(coreRoot);
  const existingById = new Map(existingBindings.map((item) => [item.binding.schemaId, item]));
  const outputs = [];
  const catalogEntries = [];
  for (const entry of entries.sort((a, b) => a.schemaId.localeCompare(b.schemaId))) {
    const lineage = lineageFor(entry.schemaId, byId);
    const runtimeProjection = projectSchemaRuntimeFromSnapshot({ lineageDocuments: lineage.map((item) => item.document), lineageEntries: lineage, sourceEntry: entry });
    if (runtimeProjection.validationContract?.lineageQualification?.state !== 'valid') findings.push(finding('error', 'schema-sync.lineage.compile-unqualified', `Compiled schema lineage is not valid for ${entry.schemaId}.`, { schemaId: entry.schemaId, findings: runtimeProjection.validationContract?.lineageQualification?.findings || [] }));
    const existing = existingById.get(entry.schemaId) || null;
    const binding = buildBinding(entry, existing?.binding || null, published);
    catalogEntries.push(Object.freeze({
      schemaId: entry.schemaId,
      parentSchemaId: entry.parentSchemaId,
      envelopeSchemaId: entry.envelopeSchemaId,
      title: entry.title,
      summary: entry.summary,
      bytes: entry.bytes,
      binding,
      specialized: Boolean(existing),
      creationDeclared: Boolean(runtimeProjection.creation?.declared),
      creationRepresentable: creationRepresentable(runtimeProjection.creation)
    }));
    if (existing) {
      outputs.push(jsonOutput(existing.path, binding));
      outputs.push(jsonOutput(existing.runtimePath, runtimeProjection));
      if (existing.sourceModulePath) outputs.push(textOutput(existing.sourceModulePath, sourceModuleText(existing)));
    }
  }

  const manifest = buildPackManifest({ repository, sourceCommit: published ? sourceCommit : '', published, entries, catalogEntries });
  const generatedRoot = path.join(coreRoot, 'src', 'schemas', 'generated');
  outputs.push(jsonOutput(path.join(generatedRoot, 'native.schema.catalog.json'), Object.freeze({
    schema: 'tiinex.native.schema.catalog.v1',
    source: manifest.source,
    count: catalogEntries.length,
    entries: Object.freeze(catalogEntries)
  })));
  outputs.push(textOutput(path.join(generatedRoot, 'native.schema.pack.js'), generatedPackModuleText(manifest, entries)));

  const bootstrapPackRoot = path.join(coreRoot, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'schema-pack');
  outputs.push(jsonOutput(path.join(bootstrapPackRoot, 'manifest.json'), manifest));
  for (const entry of entries) outputs.push(bufferOutput(path.join(bootstrapPackRoot, 'schemas', ...entry.sourcePath.replace(/^\.topics\/.schemas\//, '').split('/')), Buffer.from(entry.markdown, 'utf8')));

  const removals = (await listFilesRecursive(path.join(coreRoot, 'src', 'schemas'))).filter((item) => item.endsWith(SCHEMA_SUFFIX) && !normalizePath(item).includes('/generated/'));
  const errors = findings.filter((item) => item.severity === 'error').length;
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  return Object.freeze({
    status: errors ? 'blocked' : warnings ? 'degraded' : 'ready',
    coreRoot,
    docsRoot,
    docs: Object.freeze({ repository, commit: published ? sourceCommit : '', publicationState: published ? 'published-immutable-canonical' : 'qualified-local-unpublished', schemaCount: entries.length }),
    entries: Object.freeze(entries),
    outputs: Object.freeze(outputs),
    removals: Object.freeze(removals),
    findings: Object.freeze(findings),
    catalogSummary: Object.freeze({ schemaCount: catalogEntries.length, specializedCount: catalogEntries.filter((item) => item.specialized).length, genericCount: catalogEntries.filter((item) => !item.specialized).length, creationRepresentableCount: catalogEntries.filter((item) => item.creationRepresentable).length })
  });
}

function buildBinding(entry, existing, published) {
  const permalink = published ? `https://github.com/${entry.sourceRepository}/blob/${entry.sourceCommit}/${encodeGithubPath(entry.sourcePath)}` : '';
  const rawUrl = published ? `https://raw.githubusercontent.com/${entry.sourceRepository}/${entry.sourceCommit}/${encodeGithubPath(entry.sourcePath)}` : '';
  return Object.freeze({
    schemaId: entry.schemaId,
    kind: String(existing?.kind || 'structural'),
    role: String(existing?.role || 'canonical-schema'),
    module: String(existing?.module || ''),
    snapshot: `schema-pack:${entry.schemaId}`,
    canonicalUri: String(existing?.canonicalUri || canonicalUri(entry.sourcePath)),
    permalink,
    rawUrl,
    sourcePath: entry.sourcePath,
    sourceRepository: entry.sourceRepository,
    sourceCommit: published ? entry.sourceCommit : '',
    sourceBlobSha: entry.gitBlobSha,
    originId: published ? `tiinex-docs-${entry.sourceCommit.slice(0, 8)}` : 'tiinex-docs-local',
    originTrustRole: String(existing?.originTrustRole || 'canonical-core'),
    checksum: Object.freeze({ algorithm: 'sha256', value: entry.sha256 }),
    capabilityContract: String(existing?.capabilityContract || 'tiinex.schema.module.v1'),
    snapshotCompleteness: entry.snapshotCompleteness,
    publicationState: entry.publicationState,
    schemaReferencePublicationState: entry.schemaReferencePublicationState,
    bindingVersion: String(existing?.bindingVersion || 'tiinex.web.schema-binding.v1')
  });
}

function buildPackManifest({ repository, sourceCommit, published, entries, catalogEntries }) {
  return Object.freeze({
    schema: NATIVE_SCHEMA_PACK_SCHEMA_ID,
    version: 1,
    source: Object.freeze({
      provider: 'docs-workspace',
      repository,
      commit: sourceCommit,
      publicationState: published ? 'published-immutable-canonical' : 'qualified-local-unpublished',
      snapshotCompleteness: published ? 'exact-canonical-docs-snapshot' : 'exact-local-docs-snapshot',
      networkRequired: false
    }),
    count: entries.length,
    schemas: Object.freeze(entries.map((entry) => Object.freeze({
      schemaId: entry.schemaId,
      parentSchemaId: entry.parentSchemaId,
      sourcePath: entry.sourcePath,
      packPath: normalizePath(path.join('schemas', entry.sourcePath.replace(/^\.topics\/.schemas\//, ''))),
      bytes: entry.bytes,
      sha256: entry.sha256,
      gitBlobSha: entry.gitBlobSha,
      specialized: Boolean(catalogEntries.find((item) => item.schemaId === entry.schemaId)?.specialized)
    })))
  });
}

async function existingSpecializedBindings(coreRoot) {
  const files = (await listFilesRecursive(path.join(coreRoot, 'src', 'schemas'))).filter((item) => item.endsWith('.schema.json') && !normalizePath(item).includes('/generated/'));
  const out = [];
  for (const file of files) {
    let binding; try { binding = JSON.parse(await readFile(file, 'utf8')); } catch { continue; }
    if (!binding?.schemaId) continue;
    const runtimePath = file.replace(/\.schema\.json$/, '.schema.runtime.json');
    const sourceModulePath = file.replace(/\.schema\.json$/, '.schema.source.js');
    out.push({ path: file, runtimePath, sourceModulePath, binding });
  }
  return out;
}

function sourceModuleText(existing) {
  const bindingName = path.basename(existing.path);
  const runtimeName = path.basename(existing.runtimePath);
  const normalized = normalizePath(existing.sourceModulePath);
  const marker = '/src/schemas/';
  const index = normalized.lastIndexOf(marker);
  const schemasRoot = index >= 0 ? normalized.slice(0, index + marker.length - 1) : path.dirname(existing.sourceModulePath);
  const sourceImport = relativeImport(path.dirname(existing.sourceModulePath), path.join(schemasRoot, 'schema.source.js'));
  const fromToken = 'fr' + 'om';
  return [
    `import binding ${fromToken} './${bindingName}' with { type: 'json' };`,
    `import projection ${fromToken} './${runtimeName}' with { type: 'json' };`,
    `import { defineBundledSchemaSource } ${fromToken} '${sourceImport}';`,
    '',
    'export const schemaSource = defineBundledSchemaSource(binding, projection, Object.freeze({',
    "  sourceLabel: 'Tiinex portable Schema Pack'",
    '}));',
    ''
  ].join('\n');
}

function generatedPackModuleText(manifest, entries) {
  const sourceMap = Object.fromEntries(entries.map((entry) => [entry.schemaId, entry.markdown]));
  return `// Generated by portable schemas sync. Do not edit by hand.\nexport const nativeSchemaPackManifest = Object.freeze(${JSON.stringify(manifest, null, 2)});\n\nexport const nativeSchemaMarkdownById = Object.freeze(${JSON.stringify(sourceMap, null, 2)});\n\nexport function nativeSchemaMarkdown(schemaId = '') { return nativeSchemaMarkdownById[String(schemaId || '')] || ''; }\n`;
}

function creationRepresentable(creation = {}) {
  if (!creation?.declared) return false;
  const supported = new Set(['section-body', 'root-current-summary-body-title', 'ordinary-field', 'ordinary-group', 'named-declaration-section']);
  return (creation.requiredInputs || []).every((input) => supported.has(String((creation.inputBindings || []).find((item) => item?.input === input)?.kind || '')))
    && (creation.requiredShape || []).every((item) => String(item?.primitive?.kind || 'residual') !== 'residual');
}

function lineageFor(schemaId, byId) {
  const out = [];
  let current = byId.get(schemaId) || null;
  const seen = new Set();
  while (current) {
    if (seen.has(current.schemaId)) throw new Error(`Schema lineage cycle: ${current.schemaId}`);
    seen.add(current.schemaId);
    out.push(current);
    if (!current.parentSchemaId) break;
    current = byId.get(current.parentSchemaId) || null;
  }
  return out.reverse();
}

function lineageCycle(schemaId, byId) {
  const order = [];
  const seen = new Map();
  let current = byId.get(schemaId) || null;
  while (current) {
    if (seen.has(current.schemaId)) return [...order.slice(seen.get(current.schemaId)), current.schemaId];
    seen.set(current.schemaId, order.length);
    order.push(current.schemaId);
    if (!current.parentSchemaId) return [];
    current = byId.get(current.parentSchemaId) || null;
  }
  return [];
}

async function listFilesRecursive(root) {
  const out = [];
  let entries; try { entries = await readdir(root, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...await listFilesRecursive(target));
    else if (entry.isFile()) out.push(target);
  }
  return out;
}

function canonicalUri(sourcePath = '') {
  const relative = String(sourcePath).replace(/^\.topics\/.schemas\//, '').replace(/\.schema\.md$/, '');
  return `tiinex://schemas/${relative}`;
}
function encodeGithubPath(value = '') { return String(value).split('/').map((segment) => encodeURIComponent(segment)).join('/'); }
function digest(algorithm, bytes) { return createHash(algorithm).update(bytes).digest('hex'); }
function normalizePath(value = '') { return String(value).replaceAll('\\', '/'); }
function relativeDisplay(root, target) { return normalizePath(path.relative(root, target)); }
function relativeImport(fromDir, target) { let r = normalizePath(path.relative(fromDir, target)).replace(/\.js$/, '.js'); if (!r.startsWith('.')) r = `./${r}`; return r; }
function jsonOutput(target, value) { return bufferOutput(target, Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')); }
function textOutput(target, value) { return bufferOutput(target, Buffer.from(String(value), 'utf8')); }
function bufferOutput(target, bytes) { return Object.freeze({ path: target, bytes }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze(params) }); }
function blockedPlan({ coreRoot, docsRoot, repository, sourceCommit, findings, entries = [] }) { return Object.freeze({ status: 'blocked', coreRoot, docsRoot, docs: Object.freeze({ repository, commit: sourceCommit, schemaCount: entries.length }), entries: Object.freeze(entries), outputs: Object.freeze([]), removals: Object.freeze([]), findings: Object.freeze(findings), catalogSummary: Object.freeze({ schemaCount: entries.length, specializedCount: 0, genericCount: 0, creationRepresentableCount: 0 }) }); }
function resultFromPlan(plan, operation, written) {
  const errors = plan.findings.filter((item) => item.severity === 'error').length;
  const warnings = plan.findings.filter((item) => item.severity === 'warning').length;
  return Object.freeze({
    schema: NATIVE_SCHEMA_SYNC_RESULT_SCHEMA_ID,
    operation: `schemas-${operation}`,
    status: errors ? 'blocked' : warnings ? 'degraded' : 'ready',
    docs: plan.docs,
    catalog: plan.catalogSummary,
    generated: Object.freeze({ files: plan.outputs.length, removedStaleLocalSchemaCopies: written ? plan.removals.length : 0, written }),
    findingSummary: Object.freeze({ counts: Object.freeze({ error: errors, warning: warnings, info: plan.findings.length - errors - warnings }) }),
    findings: plan.findings,
    boundary: 'Local deterministic native schema synchronization only. It does not fetch network resources, mutate Docs, publish schemas, or infer publication authority beyond explicitly supplied exact snapshot metadata.'
  });
}
