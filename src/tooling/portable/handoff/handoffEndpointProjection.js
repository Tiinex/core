import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { portableRuntimeValidationAuthorityForRecord } from '../schema/qualifiedLocalRoot.runtime.js';
import { projectQualifiedWorkspacePackageSources } from './workspacePackageSources.js';

export const PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-endpoint-projection.v1';

export function canonicalHandoffEndpointReference(candidate = {}) {
  const qualification = String(candidate?.qualification || '').trim();
  const workspaceId = token(candidate?.workspaceId || '');
  const artifactPath = norm(candidate?.artifactPath || candidate?.path || '');
  const target = String(candidate?.target || candidate?.reference || '').trim();
  const expectedTarget = workspaceId && artifactPath ? `${workspaceId}::${artifactPath}` : '';
  const kind = String(candidate?.kind || '').trim().toLowerCase();
  if (qualification !== 'qualified-exact' || !workspaceId || !artifactPath || !target || target !== expectedTarget || !['role', 'party'].includes(kind)) {
    return freeze({ state: 'blocked', reference: '', reason: 'endpoint-candidate-not-exact-qualified' });
  }
  if (/\s|\)/u.test(target)) return freeze({ state: 'blocked', reference: '', reason: 'endpoint-target-not-markdown-link-safe' });
  const rawLabel = String(candidate?.label || '').replaceAll(']', ' ').replace(/[\r\n]+/gu, ' ').replace(/\s+/gu, ' ').trim();
  const label = rawLabel || (kind === 'role' ? 'Role' : 'Party');
  return freeze({ state: 'qualified', reference: `[${label}](${target})`, target, label, kind, workspaceId, artifactPath, basis: 'exact-qualified-endpoint-candidate' });
}

export function projectQualifiedHandoffEndpoints(input = {}) {
  const workspaceId = token(input.workspaceId || input.workspace || 'workspace') || 'workspace';
  const records = normalizeRecords(input);
  const candidates = [];
  const findings = [];
  const sourceAuthority = qualifyEndpointSourceAuthority(records, workspaceId);
  if (sourceAuthority.state !== 'qualified') {
    findings.push(finding('error', `portable.handoff-endpoint.source-authority.${sourceAuthority.reason || 'unqualified'}`, 'Handoff endpoint projection requires exactly one qualified Workspace authority for the requested workspace id before Role/Party material becomes eligible.', { workspaceId, candidateCount: sourceAuthority.candidateCount || 0 }));
    return freeze({
      schema: PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID,
      status: 'blocked',
      workspaceId,
      sourceAuthority,
      candidates,
      findings,
      operationBoundary: { sourceMutation: false, remoteWrite: false, identityInference: false },
      boundary: 'Endpoint choices are projected only from the bounded .topics material surface owned by the one exact qualified requested Workspace artifact. Nested fixture Workspaces, repository-wide scans, schema/example trees outside that surface, caches, chronology, filenames, and holder labels cannot create endpoint authority.'
    });
  }
  for (const record of records) {
    const path = norm(record.path || record.id || '');
    if (!pathWithinMaterialRoot(path, sourceAuthority.materialRoot)) continue;
    if (!path || !/\.md$/i.test(path)) continue;
    let parsed;
    try { parsed = parseArtifactMarkdown(record.markdown || ''); } catch { continue; }
    const schemaId = String(parsed.envelope?.current?.schema?.id || record.schemaId || '').trim();
    if (!schemaId) continue;
    const audit = auditPortableRecord({ ...record, schemaId, currentSchemaId: schemaId, title: parsed.title || record.title || '' }, { requireExactSchemaAuthority: true });
    if (audit.status !== 'readable' || audit.qualification?.exact !== true || (audit.findings || []).some((item) => item.severity === 'error')) continue;
    const authority = portableRuntimeValidationAuthorityForRecord({ ...record, schemaId, currentSchemaId: schemaId });
    if (authority.state !== 'qualified') continue;
    const lineage = Array.isArray(authority.compiledContract?.lineage) ? authority.compiledContract.lineage.map(String) : [];
    const kind = lineage.includes('tiinex.party.role.v1') || schemaId === 'tiinex.party.role.v1'
      ? 'role'
      : lineage.includes('tiinex.party.v1') || schemaId === 'tiinex.party.v1' || schemaId.startsWith('tiinex.party.')
        ? 'party'
        : '';
    if (!kind) continue;
    const target = `${workspaceId}::${path}`;
    const label = String(parsed.title || record.title || path);
    const canonicalReference = canonicalHandoffEndpointReference({ target, label, kind, workspaceId, artifactPath: path, qualification: 'qualified-exact' });
    if (canonicalReference.state !== 'qualified') continue;
    candidates.push(freeze({
      id: target,
      target,
      reference: target,
      canonicalReference: canonicalReference.reference,
      kind,
      label,
      workspaceId,
      artifactPath: path,
      schemaId,
      qualification: 'qualified-exact'
    }));
  }
  candidates.sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
  return freeze({
    schema: PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID,
    status: 'ready',
    workspaceId,
    sourceAuthority,
    candidates,
    findings,
    operationBoundary: { sourceMutation: false, remoteWrite: false, identityInference: false },
    boundary: 'Projects only exactly qualified Role/Party artifacts from the bounded .topics material surface owned by one exact qualified requested Workspace artifact. target/reference preserves explicit Workspace artifact identity as workspaceId::artifact-path; nested fixture Workspaces, repository-wide scans, caches, chronology, filenames, holder labels, and repository basenames never infer endpoint identity.'
  });
}

function qualifyEndpointSourceAuthority(records = [], workspaceId = '') {
  const sources = projectQualifiedWorkspacePackageSources({ records });
  const qualified = (sources.candidates || []).filter((item) => String(item.workspaceId || '') === workspaceId);
  if (qualified.length !== 1) return freeze({ state: 'blocked', reason: qualified.length > 1 ? 'ambiguous' : 'unresolved', workspaceId, candidateCount: qualified.length, sourceFindings: sources.findings || [] });
  const selected = qualified[0];
  const materialRoot = topicsMaterialRoot(selected.workspaceTargetPath);
  if (!materialRoot) return freeze({ state: 'blocked', reason: 'material-root-unqualified', workspaceId, candidateCount: 1, workspaceTargetPath: selected.workspaceTargetPath });
  return freeze({ state: 'qualified', workspaceId, workspaceTargetPath: selected.workspaceTargetPath, materialRoot, candidateCount: 1, basis: 'exact-qualified-workspace-package-source-material-surface' });
}
function topicsMaterialRoot(workspaceTargetPath = '') {
  const parts = norm(workspaceTargetPath).split('/').filter(Boolean);
  const index = parts.lastIndexOf('.topics');
  return index >= 0 ? parts.slice(0, index + 1).join('/') : '';
}
function pathWithinMaterialRoot(path = '', root = '') {
  const candidate = norm(path);
  const materialRoot = norm(root);
  if (!candidate || !materialRoot || (candidate !== materialRoot && !candidate.startsWith(`${materialRoot}/`))) return false;
  const relative = candidate === materialRoot ? '' : candidate.slice(materialRoot.length + 1);
  return !relative.split('/').filter(Boolean).includes('.topics');
}
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context }); }

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function token(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
