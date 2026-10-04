import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_PATH = 'tiinex.bootstrap/manifest.json';
export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v3';
export const PORTABLE_TOOLING_BOOTSTRAP_PREVIOUS_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v2';
export const PORTABLE_TOOLING_BOOTSTRAP_LEGACY_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v1';

export function inspectPortableToolingBootstrap(bundle = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const byPath = new Map(files.map((file) => [String(file.path || ''), file]));
  const findings = [];
  const manifestFile = byPath.get(PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_PATH);
  const manifest = parseJsonFile(manifestFile);
  const supportedSchemas = new Set([
    PORTABLE_TOOLING_BOOTSTRAP_LEGACY_MANIFEST_SCHEMA_ID,
    PORTABLE_TOOLING_BOOTSTRAP_PREVIOUS_MANIFEST_SCHEMA_ID,
    PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID
  ]);
  if (!manifest) findings.push(finding('error', 'portable.tooling-bootstrap.manifest.missing', 'Portable Tooling bootstrap manifest is missing or unreadable.'));
  else if (!supportedSchemas.has(String(manifest.schema || ''))) findings.push(finding('error', 'portable.tooling-bootstrap.manifest.schema', 'Portable Tooling bootstrap manifest schema is unsupported.', { actual: manifest.schema || '' }));

  const manifestSchema = String(manifest?.schema || '');
  const comparisonIdentityRequired = [PORTABLE_TOOLING_BOOTSTRAP_PREVIOUS_MANIFEST_SCHEMA_ID, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID].includes(manifestSchema);
  const contentIdentityRequired = manifestSchema === PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID;
  const delivery = String(manifest?.delivery || '');
  const entrypoint = String(manifest?.entrypoint || '').trim();
  const buildCreatedAt = String(manifest?.build?.createdAt || '').trim();
  const buildOrderingAuthority = String(manifest?.build?.orderingAuthority || '').trim();
  const compositionSha256 = String(manifest?.composition?.sha256 || '').trim();
  const coreName = String(manifest?.core?.name || '').trim();
  const coreVersion = String(manifest?.core?.version || '').trim();
  if (manifest && !['embedded', 'persistent'].includes(delivery)) findings.push(finding('error', 'portable.tooling-bootstrap.delivery.unsupported', 'Portable Tooling bootstrap delivery mode is unsupported.', { delivery }));
  if (comparisonIdentityRequired && (!buildCreatedAt || Number.isNaN(Date.parse(buildCreatedAt)))) findings.push(finding('error', 'portable.tooling-bootstrap.build-time.invalid', 'Portable Tooling bootstrap manifest must declare one valid bundle manufacture timestamp.', { createdAt: buildCreatedAt }));
  if (comparisonIdentityRequired && buildOrderingAuthority !== 'none') findings.push(finding('error', 'portable.tooling-bootstrap.build-ordering-authority.invalid', 'Bootstrap build timestamp must not claim semantic ordering authority.', { orderingAuthority: buildOrderingAuthority }));
  if (manifest && !entrypoint) findings.push(finding('error', 'portable.tooling-bootstrap.entrypoint.missing', 'Portable Tooling bootstrap manifest must declare one exact runtime entrypoint.'));
  else if (entrypoint && (!entrypoint.startsWith('runtime/') || entrypoint.includes('..'))) findings.push(finding('error', 'portable.tooling-bootstrap.entrypoint.invalid', 'Portable Tooling bootstrap entrypoint must be one normalized runtime-relative path.', { entrypoint }));

  const declaredRuntime = new Map();
  for (const entry of manifest?.runtime?.entries || []) {
    const relative = String(entry.path || '');
    const packagePath = `tiinex.bootstrap/${relative}`;
    if (!relative.startsWith('runtime/') || declaredRuntime.has(packagePath)) {
      findings.push(finding('error', 'portable.tooling-bootstrap.entry.invalid', 'Bootstrap runtime manifest contains an invalid or duplicate runtime entry.', { path: relative }));
      continue;
    }
    declaredRuntime.set(packagePath, entry);
    if (delivery !== 'embedded') continue;
    verifyEmbeddedEntry({ byPath, packagePath, entry, findings, prefix: 'runtime' });
  }
  const entrypointPackagePath = entrypoint ? `tiinex.bootstrap/${entrypoint}` : '';
  if (entrypointPackagePath && !declaredRuntime.has(entrypointPackagePath)) findings.push(finding('error', 'portable.tooling-bootstrap.entrypoint.unlisted', 'Portable Tooling bootstrap entrypoint is not present in the exact manifest-declared runtime representation.', { entrypoint }));
  const runtimeFiles = files.filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/runtime/'));
  if (delivery === 'embedded') {
    for (const file of runtimeFiles) if (!declaredRuntime.has(String(file.path || ''))) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.unlisted', 'A package byte is colocated under the bootstrap runtime prefix but is not granted bootstrap authority by the manifest.', { path: file.path || '' }));
    if (runtimeFiles.length !== declaredRuntime.size) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.cardinality', 'Embedded Tooling bootstrap runtime cardinality differs from its manifest.', { declared: declaredRuntime.size, supplied: runtimeFiles.length }));
  } else if (delivery === 'persistent' && runtimeFiles.length) findings.push(finding('error', 'portable.tooling-bootstrap.persistent.embedded-bytes', 'Persistent Tooling bootstrap mode must not silently embed runtime bytes.', { supplied: runtimeFiles.length }));

  const runtimeRepresentation = manifest?.runtime?.entries || [];
  const runtimeRepresentationSha256 = sha256Text(stableJson(runtimeRepresentation));
  if (manifest && String(manifest.runtime?.representationSha256 || '') !== runtimeRepresentationSha256) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.representation-mismatch', 'Tooling bootstrap runtime representation digest differs from the declared manifest entries.'));

  const declaredContent = new Map();
  const sourceRecords = Array.isArray(manifest?.content?.sourceRecords) ? manifest.content.sourceRecords : [];
  const declaredSourceIds = new Set(sourceRecords.map((item) => String(item?.id || '')).filter(Boolean));
  if (contentIdentityRequired) {
    if (Number(manifest?.content?.sources || 0) !== sourceRecords.length) findings.push(finding('error', 'portable.tooling-bootstrap.content.source-cardinality', 'Bootstrap content source cardinality differs from its source records.'));
    const declaredSurfaceCount = sourceRecords.reduce((sum, source) => sum + (Array.isArray(source?.surfaces) ? source.surfaces.length : 0), 0);
    if (Number(manifest?.content?.surfaces || 0) !== declaredSurfaceCount) findings.push(finding('error', 'portable.tooling-bootstrap.content.surface-cardinality', 'Bootstrap content surface cardinality differs from its source records.'));
    for (const entry of manifest?.content?.entries || []) {
      const relative = String(entry.path || '');
      const packagePath = `tiinex.bootstrap/${relative}`;
      if (!relative.startsWith('content/') || relative.includes('..') || declaredContent.has(packagePath)) {
        findings.push(finding('error', 'portable.tooling-bootstrap.content.entry.invalid', 'Bootstrap content manifest contains an invalid or duplicate content entry.', { path: relative }));
        continue;
      }
      if (!declaredSourceIds.has(String(entry.sourceId || ''))) findings.push(finding('error', 'portable.tooling-bootstrap.content.source-unlisted', 'Bootstrap content entry references an undeclared content source.', { path: relative, sourceId: entry.sourceId || '' }));
      declaredContent.set(packagePath, entry);
      if (delivery === 'embedded') verifyEmbeddedEntry({ byPath, packagePath, entry, findings, prefix: 'content' });
    }
  }
  const contentFiles = files.filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/content/'));
  if (contentIdentityRequired && delivery === 'embedded') {
    for (const file of contentFiles) if (!declaredContent.has(String(file.path || ''))) findings.push(finding('error', 'portable.tooling-bootstrap.content.unlisted', 'A package byte is colocated under the bootstrap content prefix but is not granted bootstrap authority by the manifest.', { path: file.path || '' }));
    if (contentFiles.length !== declaredContent.size) findings.push(finding('error', 'portable.tooling-bootstrap.content.cardinality', 'Embedded Tooling bootstrap content cardinality differs from its manifest.', { declared: declaredContent.size, supplied: contentFiles.length }));
  } else if (contentIdentityRequired && delivery === 'persistent' && contentFiles.length) findings.push(finding('error', 'portable.tooling-bootstrap.persistent.embedded-content-bytes', 'Persistent Tooling bootstrap mode must not silently embed content bytes.', { supplied: contentFiles.length }));

  const contentRepresentation = contentIdentityRequired ? (manifest?.content?.entries || []) : [];
  const contentRepresentationSha256 = sha256Text(stableJson(contentRepresentation));
  if (contentIdentityRequired && String(manifest.content?.representationSha256 || '') !== contentRepresentationSha256) findings.push(finding('error', 'portable.tooling-bootstrap.content.representation-mismatch', 'Tooling bootstrap content representation digest differs from the declared manifest entries.'));
  const expectedCompositionSha256 = contentIdentityRequired
    ? sha256Text(stableJson({ runtime: runtimeRepresentationSha256, content: contentRepresentationSha256 }))
    : runtimeRepresentationSha256;
  if (comparisonIdentityRequired && compositionSha256 !== expectedCompositionSha256) findings.push(finding('error', 'portable.tooling-bootstrap.composition.identity-mismatch', 'Bootstrap composition identity differs from the exact manifest-declared runtime/content representation.', { declared: compositionSha256, actual: expectedCompositionSha256 }));

  const runtimePackage = parseJsonFile(byPath.get('tiinex.bootstrap/runtime/package.json'));
  if (comparisonIdentityRequired && delivery === 'embedded' && (!runtimePackage || coreName !== String(runtimePackage?.name || '').trim() || coreVersion !== String(runtimePackage?.version || '').trim())) findings.push(finding('error', 'portable.tooling-bootstrap.core.identity-mismatch', 'Bootstrap Core identity must match the exact embedded runtime package.json.', { declaredName: coreName, declaredVersion: coreVersion, actualName: runtimePackage?.name || '', actualVersion: runtimePackage?.version || '' }));
  return Object.freeze({
    schema: 'tiinex.portable.tooling-bootstrap.inspection.v1',
    status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid',
    delivery: delivery || 'unknown',
    manifest,
    entrypoint: entrypoint ? Object.freeze({ path: entrypoint, packagePath: entrypointPackagePath, state: declaredRuntime.has(entrypointPackagePath) ? 'qualified' : 'unqualified' }) : null,
    counts: Object.freeze({ declaredRuntimeFiles: declaredRuntime.size, suppliedRuntimeFiles: runtimeFiles.length, declaredContentFiles: declaredContent.size, suppliedContentFiles: contentFiles.length, findings: findings.length, errors: findings.filter((item) => item.severity === 'error').length }),
    identity: Object.freeze({
      state: comparisonIdentityRequired ? 'declared-comparison-identity' : 'legacy-derived-composition-only',
      builtAt: buildCreatedAt,
      core: Object.freeze({ name: coreName || String(runtimePackage?.name || ''), version: coreVersion || String(runtimePackage?.version || '') }),
      runtimeRepresentationSha256,
      contentRepresentationSha256: contentIdentityRequired ? contentRepresentationSha256 : '',
      compositionSha256: expectedCompositionSha256,
      orderingAuthority: buildOrderingAuthority || 'none'
    }),
    qualification: Object.freeze({ exactManifestMembershipRequired: true, exactEntrypointManifestMembershipRequired: true, filenameOrColocationAuthority: false, ordinaryWorkspaceBytesAreBootstrapAuthority: false, buildTimestampOrderingAuthority: false, compositionIdentityAuthority: contentIdentityRequired ? 'exact-runtime-and-content-representations' : 'exact-runtime-representation-only', registeredSurfaceMembershipCreatesSemanticAuthority: false }),
    findings: Object.freeze(findings)
  });
}

function verifyEmbeddedEntry({ byPath, packagePath, entry, findings, prefix }) {
  const file = byPath.get(packagePath);
  if (!file) {
    findings.push(finding('error', `portable.tooling-bootstrap.${prefix}.missing`, `Embedded Tooling bootstrap ${prefix} entry is missing from package bytes.`, { path: packagePath }));
    return;
  }
  const data = packageFileBytes(file);
  if (Number(entry.bytes || 0) !== data.byteLength) findings.push(finding('error', `portable.tooling-bootstrap.${prefix}.bytes-mismatch`, `Embedded Tooling bootstrap ${prefix} byte length differs from its manifest.`, { path: packagePath }));
  if (String(entry.sha256 || '') !== sha256Hex(data)) findings.push(finding('error', `portable.tooling-bootstrap.${prefix}.sha256-mismatch`, `Embedded Tooling bootstrap ${prefix} digest differs from its manifest.`, { path: packagePath }));
}
function parseJsonFile(file) { if (!file) return null; try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); } catch { return null; } }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function sha256Text(value = '') { const bytes = new TextEncoder().encode(String(value)); return sha256Hex(bytes); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
