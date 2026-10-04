import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parsePortableSchemaDocument } from '../../schema/schema.contract.js';
import { projectSchemaRuntimeFromSnapshot } from '../../schema/runtime.project.js';
import { schemaMaterialIdentitiesEquivalent } from '../../../../schemas/schema.materialIdentity.js';

export const NATIVE_SCHEMA_SYNC_RESULT_SCHEMA_ID = 'tiinex.portable.native-schema-sync-result.v1';
export const NATIVE_SCHEMA_CHECK_RESULT_SCHEMA_ID = 'tiinex.portable.native-schema-check-result.v1';
export const NATIVE_SCHEMA_PACK_SCHEMA_ID = 'tiinex.schema.pack.v1';

const DEFAULT_REPOSITORY = 'Tiinex/docs';
const DEFAULT_SCHEMA_SURFACE = '.topics/.schemas';
const SCHEMA_SUFFIX = '.schema.md';

export async function synchronizeNativeSchemas(options = {}) {
  const plan = await buildNativeSchemaSyncPlan(options);
  if (plan.status !== 'ready') return resultFromPlan(plan, 'sync', false);
  let filesWritten = 0;
  for (const output of plan.outputs) if (await writeOutputIfChanged(output)) filesWritten += 1;
  for (const stalePath of plan.removals) await rm(stalePath, { force: true });
  return resultFromPlan(plan, 'sync', { filesWritten });
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
      findings.push(finding('error', 'schema-sync.generated-drift', `Schema content output is stale or missing: ${relativeDisplay(plan.contentRoot, output.path)}.`, { path: relativeDisplay(plan.contentRoot, output.path) }));
    }
  }
  for (const stalePath of plan.removals) {
    try {
      if ((await stat(stalePath)).isFile()) {
        driftCount += 1;
        findings.push(finding('error', 'schema-sync.stale-canonical-schema-copy', `Schema content surface contains a stale canonical Schema Markdown copy: ${relativeDisplay(plan.contentRoot, stalePath)}.`, { path: relativeDisplay(plan.contentRoot, stalePath) }));
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
    content: Object.freeze({ root: plan.contentRoot, schemaSurfaceRoot: plan.schemaSurfaceRoot }),
    catalog: plan.catalogSummary,
    generated: Object.freeze({ expectedFiles: plan.outputs.length, driftCount, staleCanonicalSchemaCopies: plan.removals.length }),
    findingSummary: Object.freeze({ counts: Object.freeze({ error: errors, warning: warnings, info: findings.length - errors - warnings }) }),
    findings: Object.freeze(findings),
    boundary: 'Read-only deterministic comparison of a local canonical Docs schema snapshot against one explicitly selected Tiinex .schemas content surface. No network access, Core schema ownership, package publication, or remote mutation is implied.'
  });
}

export async function inspectNativeSchemaStatus(options = {}) {
  const check = await checkNativeSchemas(options);
  return Object.freeze({ ...check, schema: 'tiinex.portable.native-schema-status-result.v1', operation: 'schemas-status' });
}

export async function buildNativeSchemaSyncPlan(options = {}) {
  const suppliedContentRoot = String(options.contentRoot || options.nativeRoot || options.coreRoot || '').trim();
  const contentRoot = suppliedContentRoot ? path.resolve(suppliedContentRoot) : '';
  const suppliedDocsRoot = String(options.docsRoot || '').trim();
  const docsRoot = suppliedDocsRoot ? path.resolve(suppliedDocsRoot) : '';
  const repository = String(options.repository || DEFAULT_REPOSITORY).trim();
  const sourceCommit = String(options.sourceCommit || '').trim().toLowerCase();
  const published = options.published === true;
  const schemaSurfaceRoot = contentRoot ? resolveSchemaSurfaceRoot(contentRoot, options.schemaSurfaceRoot) : '';
  const findings = [];

  if (!contentRoot) findings.push(finding('error', 'schema-sync.content-root.required', 'An explicit target content Workspace root is required; schema sync never defaults to Core or the current working directory.'));
  if (!docsRoot || docsRoot === path.parse(docsRoot).root) findings.push(finding('error', 'schema-sync.docs-root.required', 'A local Docs Workspace root is required.'));
  if (published && !/^[0-9a-f]{40}$/.test(sourceCommit)) findings.push(finding('error', 'schema-sync.publication-commit.required', 'Published schema sync requires one exact 40-character immutable Docs commit.'));
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) findings.push(finding('error', 'schema-sync.repository.invalid', 'Schema source repository must be an exact owner/repository identifier.'));
  if (contentRoot && schemaSurfaceRoot && !inside(contentRoot, schemaSurfaceRoot)) findings.push(finding('error', 'schema-sync.surface.outside-content-root', 'The selected .schemas surface must remain inside the selected content Workspace root.', { contentRoot, schemaSurfaceRoot }));
  if (path.basename(schemaSurfaceRoot) !== '.schemas') findings.push(finding('error', 'schema-sync.surface.invalid', 'Schema sync target must be one registered .schemas discovery surface.', { schemaSurfaceRoot }));
  if (findings.some((item) => item.severity === 'error')) return blockedPlan({ contentRoot, schemaSurfaceRoot, docsRoot, repository, sourceCommit, findings });

  const docsSchemaRoot = path.join(docsRoot, '.topics', '.schemas');
  const schemaFiles = (await listFilesRecursive(docsSchemaRoot)).filter((item) => item.endsWith(SCHEMA_SUFFIX)).sort();
  if (!schemaFiles.length) findings.push(finding('error', 'schema-sync.schemas.missing', 'Docs Workspace does not contain canonical .topics/.schemas/**/*.schema.md material.'));

  const entries = [];
  const byId = new Map();
  for (const absolutePath of schemaFiles) {
    const bytes = await readFile(absolutePath);
    const markdown = bytes.toString('utf8');
    const document = parsePortableSchemaDocument(markdown);
    const schemaId = String(document.schemaId || '').trim();
    const sourcePath = normalizePath(path.relative(docsRoot, absolutePath));
    const relativeSchemaPath = normalizePath(path.relative(docsSchemaRoot, absolutePath));
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
      relativeSchemaPath,
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
  if (findings.some((item) => item.severity === 'error')) return blockedPlan({ contentRoot, schemaSurfaceRoot, docsRoot, repository, sourceCommit, findings, entries });

  const existingBindings = await existingSpecializedBindings(schemaSurfaceRoot);
  const existingById = new Map(existingBindings.map((item) => [item.binding.schemaId, item]));
  const existingCatalog = await existingGeneratedCatalog(schemaSurfaceRoot);
  const existingCatalogById = new Map((existingCatalog?.entries || []).map((item) => [String(item?.schemaId || ''), item]));
  const sortedEntries = entries.sort((a, b) => a.schemaId.localeCompare(b.schemaId));
  const bindingById = new Map(sortedEntries.map((entry) => {
    const existing = existingById.get(entry.schemaId) || null;
    const catalogEntry = existingCatalogById.get(entry.schemaId) || null;
    return [entry.schemaId, buildBinding(entry, existing?.binding || catalogEntry?.binding || null, published)];
  }));

  const outputs = [];
  const catalogEntries = [];
  for (const entry of sortedEntries) {
    outputs.push(bufferOutput(path.join(schemaSurfaceRoot, ...entry.relativeSchemaPath.split('/')), Buffer.from(entry.markdown, 'utf8')));
    const lineage = lineageFor(entry.schemaId, byId);
    const effectiveLineageEntries = lineage.map((item) => runtimeEntryWithBinding(item, bindingById.get(item.schemaId)));
    const effectiveSourceEntry = effectiveLineageEntries.at(-1) || runtimeEntryWithBinding(entry, bindingById.get(entry.schemaId));
    const runtimeProjection = projectSchemaRuntimeFromSnapshot({ lineageDocuments: lineage.map((item) => item.document), lineageEntries: effectiveLineageEntries, sourceEntry: effectiveSourceEntry });
    if (runtimeProjection.validationContract?.lineageQualification?.state !== 'valid') findings.push(finding('error', 'schema-sync.lineage.compile-unqualified', `Compiled schema lineage is not valid for ${entry.schemaId}.`, { schemaId: entry.schemaId, findings: runtimeProjection.validationContract?.lineageQualification?.findings || [] }));
    const existing = existingById.get(entry.schemaId) || null;
    const binding = bindingById.get(entry.schemaId);
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
    }
  }

  const preservedSnapshotCommit = published && publishedSnapshotMatchesEntries(existingCatalog, sortedEntries, repository)
    ? String(existingCatalog?.source?.commit || '')
    : '';
  const manifest = buildPackManifest({ repository, sourceCommit: published ? (preservedSnapshotCommit || sourceCommit) : '', published, entries: sortedEntries, catalogEntries });
  outputs.push(jsonOutput(path.join(schemaSurfaceRoot, '.generated', 'native.schema.catalog.json'), Object.freeze({
    schema: 'tiinex.native.schema.catalog.v1',
    source: manifest.source,
    count: catalogEntries.length,
    entries: Object.freeze(catalogEntries)
  })));

  const expectedMarkdown = new Set(sortedEntries.map((entry) => normalizePath(path.resolve(schemaSurfaceRoot, ...entry.relativeSchemaPath.split('/')))));
  const removals = (await listFilesRecursive(schemaSurfaceRoot))
    .filter((item) => item.endsWith(SCHEMA_SUFFIX))
    .filter((item) => !expectedMarkdown.has(normalizePath(path.resolve(item))));

  const errors = findings.filter((item) => item.severity === 'error').length;
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  return Object.freeze({
    status: errors ? 'blocked' : warnings ? 'degraded' : 'ready',
    contentRoot,
    schemaSurfaceRoot,
    // Transitional alias for callers that only use this field for display.
    coreRoot: contentRoot,
    docsRoot,
    docs: Object.freeze({ repository, commit: published ? sourceCommit : '', publicationState: published ? 'published-immutable-canonical' : 'qualified-local-unpublished', schemaCount: entries.length }),
    entries: Object.freeze(entries),
    outputs: Object.freeze(outputs),
    removals: Object.freeze(removals),
    findings: Object.freeze(findings),
    catalogSummary: Object.freeze({ schemaCount: catalogEntries.length, specializedCount: catalogEntries.filter((item) => item.specialized).length, genericCount: catalogEntries.filter((item) => !item.specialized).length, creationRepresentableCount: catalogEntries.filter((item) => item.creationRepresentable).length })
  });
}

function resolveSchemaSurfaceRoot(contentRoot, supplied = '') {
  const value = String(supplied || '').trim();
  if (!value) return path.join(contentRoot, ...DEFAULT_SCHEMA_SURFACE.split('/'));
  return path.isAbsolute(value) ? path.resolve(value) : path.resolve(contentRoot, value);
}

function buildBinding(entry, existing, published) {
  const preservedPublication = publishedBindingMatchesEntry(existing, entry) ? existing : null;
  const sourceCommit = String(preservedPublication?.sourceCommit || (published ? entry.sourceCommit : ''));
  const referencePublished = Boolean(preservedPublication || published);
  const permalink = referencePublished ? `https://github.com/${entry.sourceRepository}/blob/${sourceCommit}/${encodeGithubPath(entry.sourcePath)}` : '';
  const rawUrl = referencePublished ? `https://raw.githubusercontent.com/${entry.sourceRepository}/${sourceCommit}/${encodeGithubPath(entry.sourcePath)}` : '';
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
    sourceCommit,
    sourceBlobSha: entry.gitBlobSha,
    originId: referencePublished ? `tiinex-docs-${sourceCommit.slice(0, 8)}` : 'tiinex-docs-local',
    originTrustRole: String(existing?.originTrustRole || 'canonical-core'),
    checksum: Object.freeze({ algorithm: 'sha256', value: entry.sha256 }),
    capabilityContract: String(existing?.capabilityContract || 'tiinex.schema.module.v1'),
    snapshotCompleteness: referencePublished ? 'exact-canonical-docs-snapshot' : entry.snapshotCompleteness,
    publicationState: referencePublished ? 'published-immutable-canonical' : entry.publicationState,
    schemaReferencePublicationState: referencePublished ? 'published-immutable-canonical' : entry.schemaReferencePublicationState,
    bindingVersion: String(existing?.bindingVersion || 'tiinex.web.schema-binding.v1')
  });
}

function publishedBindingMatchesEntry(existing = null, entry = {}) {
  if (!existing || String(existing?.publicationState || '') !== 'published-immutable-canonical') return false;
  if (String(existing?.schemaReferencePublicationState || '') !== 'published-immutable-canonical') return false;
  const sourceCommit = String(existing?.sourceCommit || '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) return false;
  if (String(existing?.sourceRepository || '') !== String(entry?.sourceRepository || '')) return false;
  if (normalizePath(existing?.sourcePath || '') !== normalizePath(entry?.sourcePath || '')) return false;
  if (String(existing?.schemaId || '') !== String(entry?.schemaId || '')) return false;
  return schemaMaterialIdentitiesEquivalent(
    { schemaId: existing?.schemaId, sha256: existing?.checksum?.value || existing?.checksum, sourceBlobSha: existing?.sourceBlobSha },
    { schemaId: entry?.schemaId, sha256: entry?.sha256, sourceBlobSha: entry?.gitBlobSha, bytes: entry?.bytes }
  );
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
      packPath: normalizePath(entry.relativeSchemaPath),
      bytes: entry.bytes,
      sha256: entry.sha256,
      gitBlobSha: entry.gitBlobSha,
      specialized: Boolean(catalogEntries.find((item) => item.schemaId === entry.schemaId)?.specialized)
    })))
  });
}

async function existingGeneratedCatalog(schemaSurfaceRoot) {
  const catalogPath = path.join(schemaSurfaceRoot, '.generated', 'native.schema.catalog.json');
  try {
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    return catalog && Array.isArray(catalog.entries) ? catalog : null;
  } catch { return null; }
}

function publishedSnapshotMatchesEntries(existingCatalog = null, entries = [], repository = '') {
  if (!existingCatalog || String(existingCatalog?.source?.publicationState || '') !== 'published-immutable-canonical') return false;
  if (String(existingCatalog?.source?.repository || '') !== String(repository || '')) return false;
  if (!/^[0-9a-f]{40}$/.test(String(existingCatalog?.source?.commit || '').trim().toLowerCase())) return false;
  const existingEntries = Array.isArray(existingCatalog?.entries) ? existingCatalog.entries : [];
  if (existingEntries.length !== entries.length) return false;
  const existingById = new Map(existingEntries.map((item) => [String(item?.schemaId || ''), item]));
  return entries.every((entry) => publishedBindingMatchesEntry(existingById.get(entry.schemaId)?.binding || null, entry));
}

function runtimeEntryWithBinding(entry = {}, binding = {}) {
  return Object.freeze({
    ...entry,
    sourceRepository: String(binding?.sourceRepository || entry?.sourceRepository || ''),
    sourceCommit: String(binding?.sourceCommit || ''),
    sourcePath: String(binding?.sourcePath || entry?.sourcePath || ''),
    publicationState: String(binding?.publicationState || entry?.publicationState || ''),
    schemaReferencePublicationState: String(binding?.schemaReferencePublicationState || entry?.schemaReferencePublicationState || ''),
    snapshotCompleteness: String(binding?.snapshotCompleteness || entry?.snapshotCompleteness || '')
  });
}

async function existingSpecializedBindings(schemaSurfaceRoot) {
  const files = (await listFilesRecursive(schemaSurfaceRoot)).filter((item) => item.endsWith('.schema.json') && !normalizePath(item).includes('/.generated/'));
  const out = [];
  for (const file of files) {
    let binding; try { binding = JSON.parse(await readFile(file, 'utf8')); } catch { continue; }
    if (!binding?.schemaId) continue;
    const runtimePath = file.replace(/\.schema\.json$/, '.schema.runtime.json');
    out.push({ path: file, runtimePath, binding });
  }
  return out;
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
  const relative = String(sourcePath).replace(/^\.topics\/\.schemas\//, '').replace(/\.schema\.md$/, '');
  return `tiinex://schemas/${relative}`;
}
function encodeGithubPath(value = '') { return String(value).split('/').map((segment) => encodeURIComponent(segment)).join('/'); }
function digest(algorithm, bytes) { return createHash(algorithm).update(bytes).digest('hex'); }
function normalizePath(value = '') { return String(value).replaceAll('\\', '/'); }
function relativeDisplay(root, target) { return normalizePath(path.relative(root, target)); }
function inside(root, target) { const rel = path.relative(root, target); return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)); }
async function writeOutputIfChanged(output = {}) {
  let existing = null;
  try { existing = await readFile(output.path); } catch {}
  if (existing && existing.equals(output.bytes)) return false;
  await mkdir(path.dirname(output.path), { recursive: true });
  await writeFile(output.path, output.bytes);
  return true;
}
function jsonOutput(target, value) { return bufferOutput(target, Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')); }
function bufferOutput(target, bytes) { return Object.freeze({ path: target, bytes }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze(params) }); }
function blockedPlan({ contentRoot, schemaSurfaceRoot, docsRoot, repository, sourceCommit, findings, entries = [] }) {
  return Object.freeze({ status: 'blocked', contentRoot, schemaSurfaceRoot, coreRoot: contentRoot, docsRoot, docs: Object.freeze({ repository, commit: sourceCommit, schemaCount: entries.length }), entries: Object.freeze(entries), outputs: Object.freeze([]), removals: Object.freeze([]), findings: Object.freeze(findings), catalogSummary: Object.freeze({ schemaCount: entries.length, specializedCount: 0, genericCount: 0, creationRepresentableCount: 0 }) });
}
function resultFromPlan(plan, operation, writeState) {
  const errors = plan.findings.filter((item) => item.severity === 'error').length;
  const warnings = plan.findings.filter((item) => item.severity === 'warning').length;
  const written = writeState !== false;
  const filesWritten = written && typeof writeState === 'object' ? Number(writeState.filesWritten || 0) : written ? plan.outputs.length : 0;
  return Object.freeze({
    schema: NATIVE_SCHEMA_SYNC_RESULT_SCHEMA_ID,
    operation: `schemas-${operation}`,
    status: errors ? 'blocked' : warnings ? 'degraded' : 'ready',
    docs: plan.docs,
    content: Object.freeze({ root: plan.contentRoot, schemaSurfaceRoot: plan.schemaSurfaceRoot }),
    catalog: plan.catalogSummary,
    generated: Object.freeze({ files: plan.outputs.length, filesWritten, unchangedFiles: Math.max(0, plan.outputs.length - filesWritten), removedStaleCanonicalSchemaCopies: written ? plan.removals.length : 0, written }),
    findingSummary: Object.freeze({ counts: Object.freeze({ error: errors, warning: warnings, info: plan.findings.length - errors - warnings }) }),
    findings: plan.findings,
    boundary: 'Local deterministic schema synchronization into one explicitly selected Tiinex .schemas content surface. It does not fetch network resources, make Core the schema owner, publish schemas, or infer publication authority beyond explicitly supplied exact snapshot metadata.'
  });
}
