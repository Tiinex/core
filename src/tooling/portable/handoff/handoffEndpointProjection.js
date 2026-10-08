import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { portableRuntimeValidationAuthorityForRecord } from '../schema/qualifiedLocalRoot.runtime.js';
import { projectQualifiedWorkspacePackageSources } from './workspacePackageSources.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { schemaIdForRecord } from '../../../schemas/schema.identity.js';
import { sectionField, sectionText } from './coldStartQualification.shared.js';
import { isSchemaDefinitionRecord } from '../../../workspaces/workspace.materialRole.js';

export const PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-endpoint-projection.v1';

function canonicalWorkspaceHandoffEndpointReference(candidate = {}) {
  const workspaceId = token(candidate?.workspaceId || '');
  const artifactPath = norm(candidate?.artifactPath || candidate?.path || '');
  const target = String(candidate?.target || '').trim();
  const expectedTarget = workspaceId && artifactPath ? `${workspaceId}::${artifactPath}` : '';
  const kind = String(candidate?.kind || '').trim().toLowerCase();
  if (!workspaceId || !artifactPath || !target || target !== expectedTarget || !['role', 'party'].includes(kind)) {
    return freeze({ state: 'blocked', reference: '', referenceTarget: '', reason: 'endpoint-workspace-coordinate-unqualified' });
  }
  if (/\s|\)/u.test(target)) return freeze({ state: 'blocked', reference: '', referenceTarget: '', reason: 'endpoint-reference-not-markdown-link-safe' });
  const rawLabel = String(candidate?.label || '').replaceAll(']', ' ').replace(/[\r\n]+/gu, ' ').replace(/\s+/gu, ' ').trim();
  const label = rawLabel || (kind === 'role' ? 'Role' : 'Party');
  return freeze({
    state: 'qualified',
    reference: `[${label}](${target})`,
    referenceTarget: target,
    target, label, kind, workspaceId, artifactPath,
    basis: 'qualified-workspace-coordinate-reference'
  });
}

export function canonicalHandoffEndpointReference(candidate = {}) {
  const qualification = String(candidate?.qualification || '').trim();
  if (qualification !== 'qualified-exact') return freeze({ state: 'blocked', reference: '', referenceTarget: '', reason: 'endpoint-candidate-not-exact-qualified' });
  const workspaceReference = canonicalWorkspaceHandoffEndpointReference(candidate);
  if (workspaceReference.state !== 'qualified') return workspaceReference;
  const providerReference = String(candidate?.referenceTarget || candidate?.externalReference || candidate?.providerReference || '').trim();
  const providerQualified = !providerReference || String(candidate?.referenceQualification || candidate?.providerReferenceQualification || '') === 'qualified-exact';
  if (!providerQualified) return freeze({ state: 'blocked', reference: '', referenceTarget: '', reason: 'endpoint-candidate-not-exact-qualified' });
  if (!providerReference) return workspaceReference;
  if (/\s|\)/u.test(providerReference)) return freeze({ state: 'blocked', reference: '', referenceTarget: '', reason: 'endpoint-reference-not-markdown-link-safe' });
  return freeze({
    ...workspaceReference,
    reference: `[${workspaceReference.label}](${providerReference})`,
    referenceTarget: providerReference,
    basis: 'exact-qualified-provider-reference-plus-workspace-coordinate'
  });
}

export function projectQualifiedHandoffEndpoints(input = {}) {
  const workspaceId = token(input.workspaceId || input.workspace || 'workspace') || 'workspace';
  const records = normalizeRecords(input);
  const candidates = [];
  const authoringCandidates = [];
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
    if (isSchemaDefinitionRecord(record)) continue;
    const path = norm(record.path || record.id || '');
    if (!pathWithinMaterialRoot(path, sourceAuthority.materialRoot)) continue;
    if (!path || !/\.md$/i.test(path)) continue;
    let parsed;
    try { parsed = parseArtifactMarkdown(record.markdown || ''); } catch { continue; }
    const schemaId = String(parsed.envelope?.current?.schema?.id || record.schemaId || '').trim();
    if (!schemaId) continue;
    const audit = auditPortableRecord({ ...record, schemaId, currentSchemaId: schemaId, title: parsed.title || record.title || '' }, { requireExactSchemaAuthority: true });
    if (audit.status !== 'readable' || (audit.findings || []).some((item) => item.severity === 'error' && !['schema-reference-unresolved', 'schema-authority-unresolved'].includes(String(item.code || '')))) continue;
    const authority = portableRuntimeValidationAuthorityForRecord({ ...record, schemaId, currentSchemaId: schemaId });
    const lineage = Array.isArray(authority.compiledContract?.lineage) ? authority.compiledContract.lineage.map(String) : [];
    const kind = lineage.includes('tiinex.party.role.v1') || schemaId === 'tiinex.party.role.v1' || schemaId.startsWith('tiinex.party.role.')
      ? 'role'
      : lineage.includes('tiinex.party.v1') || schemaId === 'tiinex.party.v1' || schemaId.startsWith('tiinex.party.')
        ? 'party'
        : '';
    if (!kind) continue;
    const target = `${workspaceId}::${path}`;
    const label = String(parsed.title || record.title || path);
    const bodyText = String(parsed.body?.text || '');
    const authoringLabel = partyAuthoringLabel(schemaId, kind, bodyText) || label;
    const organizationLabel = partyOrganizationLabel(schemaId, kind, bodyText);
    const providerReference = exactQualifiedProviderReference(record);
    if (authority.state === 'qualified' && audit.qualification?.exact === true) {
      const canonicalReference = canonicalHandoffEndpointReference({ target, label, kind, workspaceId, artifactPath: path, qualification: 'qualified-exact', ...(providerReference ? { referenceTarget: providerReference.target, referenceQualification: providerReference.qualification } : {}) });
      if (canonicalReference.state !== 'qualified') continue;
      candidates.push(freeze({
        id: target,
        target,
        workspaceCoordinate: target,
        reference: canonicalReference.referenceTarget,
        referenceQualification: providerReference?.qualification || 'qualified-workspace-coordinate',
        canonicalReference: canonicalReference.reference,
        kind,
        label,
        ...(authoringLabel ? { authoringLabel } : {}),
        ...(organizationLabel ? { organizationLabel } : {}),
        workspaceId,
        artifactPath: path,
        schemaId,
        qualification: 'qualified-exact'
      }));
    } else {
      const workspaceReference = canonicalWorkspaceHandoffEndpointReference({ target, label, kind, workspaceId, artifactPath: path });
      if (workspaceReference.state !== 'qualified') continue;
      authoringCandidates.push(freeze({
        id: target,
        target,
        workspaceCoordinate: target,
        reference: workspaceReference.referenceTarget,
        referenceQualification: 'qualified-workspace-coordinate',
        canonicalReference: workspaceReference.reference,
        kind,
        label,
        ...(authoringLabel ? { authoringLabel } : {}),
        ...(organizationLabel ? { organizationLabel } : {}),
        workspaceId,
        artifactPath: path,
        schemaId,
        qualification: 'authoring-assist',
        qualificationBoundary: 'Readable Role/Party material does not establish semantic endpoint authority, but its exact bounded Workspace/path coordinate is qualified as an internal Handoff resolution Reference.'
      }));
    }
  }
  candidates.sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
  authoringCandidates.sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
  const currentRoleLeafPaths = projectCurrentRoleLeafPaths(records);
  const currentRoleCandidates = projectCurrentRoleCandidates(candidates, currentRoleLeafPaths);
  const currentRoleAuthoringCandidates = projectCurrentRoleCandidates(authoringCandidates, currentRoleLeafPaths);
  const authoringReferenceCandidates = [
    ...candidates.filter((candidate) => String(candidate.kind || '') !== 'role'),
    ...currentRoleCandidates,
    ...authoringCandidates.filter((candidate) => String(candidate.kind || '') !== 'role'),
    ...currentRoleAuthoringCandidates
  ].sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
  return freeze({
    schema: PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID,
    status: 'ready',
    workspaceId,
    sourceAuthority,
    candidates,
    currentRoleCandidates,
    authoringCandidates,
    currentRoleAuthoringCandidates,
    authoringReferenceCandidates,
    findings,
    operationBoundary: { sourceMutation: false, remoteWrite: false, identityInference: false },
    boundary: 'Projects only exactly qualified Role/Party artifacts from the bounded .topics material surface owned by one exact qualified requested Workspace artifact. target/workspaceCoordinate preserves explicit Workspace artifact identity; reference preserves an exact-qualified provider reference when supplied and otherwise uses the exact bounded Workspace/path coordinate as an internal Handoff resolution aid; workspaceCoordinate remains the package-local Workspace/path identity; Role authoringLabel is the exact qualified Role Identity / Role Label semantic value while label remains presentation-only; authoringReferenceCandidates includes Party candidates plus only Core lineage-leaf Role candidates across exact and readable authoring-assist material; nested fixture Workspaces, repository-wide scans, caches, chronology, filenames, holder labels, and repository basenames never infer endpoint identity.'
  });
}


function partyAuthoringLabel(schemaId = '', kind = '', bodyText = '') {
  if (kind === 'role') return sectionField(sectionText(bodyText, 'Role Identity'), 'Role Label');
  const schema = String(schemaId || '').trim();
  const candidates = schema === 'tiinex.party.organization.v1' ? [['Organization Identity', 'Organization Label']]
    : schema === 'tiinex.party.group.v1' ? [['Group Identity', 'Group Label']]
    : schema === 'tiinex.party.person.v1' ? [['Person Identity', 'Person Label']]
    : [['Party Identity', 'Party Label'], ['Identity', 'Identity Label']];
  for (const [section, field] of candidates) {
    const value = sectionField(sectionText(bodyText, section), field);
    if (value) return value;
  }
  return '';
}

function partyOrganizationLabel(schemaId = '', kind = '', bodyText = '') {
  if (kind === 'role') return sectionField(sectionText(bodyText, 'Role Identity'), 'Organization');
  if (String(schemaId || '').trim() === 'tiinex.party.group.v1') return sectionField(sectionText(bodyText, 'Group Identity'), 'Organization');
  return '';
}

function projectCurrentRoleLeafPaths(records = []) {
  const roleRecords = records.filter((record) => {
    if (isSchemaDefinitionRecord(record)) return false;
    const path = norm(record.path || record.id || '');
    if (!path) return false;
    try { return schemaIdForRecord(record) === 'tiinex.party.role.v1'; }
    catch { return false; }
  });
  if (!roleRecords.length) return new Set();
  const resolved = resolveLineage(roleRecords, { depth: 'loaded-workspace' });
  const roleNodeIds = new Set(resolved.nodes.map((node) => String(node.id || '')));
  // resolveLineage parent edges are parent -> child. A current Role is therefore
  // a loaded Role node that is never the `from` side of another loaded Role's
  // parent edge. This remains a Core lineage projection, never chronology/filename inference.
  const parentsWithRoleChildren = new Set(
    (resolved.edges || [])
      .filter((edge) => edge.kind === 'parent' && edge.status !== 'missing' && roleNodeIds.has(String(edge.to || '')) && roleNodeIds.has(String(edge.from || '')))
      .map((edge) => String(edge.from || ''))
  );
  return new Set(
    resolved.nodes
      .filter((node) => !parentsWithRoleChildren.has(String(node.id || '')))
      .map((node) => norm(node.path || node.id || ''))
      .filter(Boolean)
  );
}

function projectCurrentRoleCandidates(candidates = [], leaves = new Set()) {
  return candidates
    .filter((candidate) => String(candidate.kind || '') === 'role' && leaves.has(norm(candidate.artifactPath || '')))
    .map((candidate) => ({ ...candidate, currentLeaf: true }))
    .sort((a, b) => a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
}


function exactQualifiedProviderReference(record = {}) {
  const direct = String(record.referenceTarget || record.providerReference || record.sourceReference?.target || '').trim();
  const qualification = String(record.referenceQualification || record.providerReferenceQualification || record.sourceReference?.qualification || '').trim();
  if (direct && qualification === 'qualified-exact') return freeze({ target: direct, qualification });
  const permalink = String(record.source?.permalink || record.source?.config?.permalink || '').trim();
  const permalinkQualification = String(record.source?.permalinkQualification || record.source?.config?.permalinkQualification || '').trim();
  return permalink && permalinkQualification === 'qualified-exact' ? freeze({ target: permalink, qualification: permalinkQualification }) : null;
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
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => {
    const record = { id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' };
    try {
      const parsed = parseArtifactMarkdown(record.markdown);
      const parent = parsed.envelope?.parent || {};
      return { ...record, title: parsed.title || '', trace: String(parent.trace || parent.traceRaw || ''), origin: String(parent.origin || '') };
    } catch {
      return record;
    }
  });
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function token(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
