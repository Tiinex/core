import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { isSchemaDefinitionRecord } from '../../../workspaces/workspace.materialRole.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { projectQualifiedWorkspacePackageSources } from './workspacePackageSources.js';
import { sectionField, sectionText } from './coldStartQualification.shared.js';

export const PORTABLE_WORKSPACE_SESSION_ROLE_PROJECTION_SCHEMA_ID = 'tiinex.portable.workspace-session-role-projection.v1';

/**
 * Project current Role lineage leaves for Guided Entry session selection.
 *
 * This is intentionally material discovery, not Handoff endpoint qualification.
 * It can therefore expose a readable current Role whose schema-source revision
 * differs from the current host runtime, while still refusing schema-definition
 * material and without creating holder, recipient, or endpoint authority.
 */
export function projectWorkspaceSessionRoles(input = {}) {
  const workspaceId = String(input.workspaceId || input.workspace || '').trim();
  const records = normalizeRecords(input);
  const findings = [];
  if (!workspaceId) return blocked('workspace-required', findings);

  const workspaceSources = projectQualifiedWorkspacePackageSources({ records });
  const sources = (workspaceSources.candidates || []).filter((candidate) => String(candidate.workspaceId || '') === workspaceId);
  if (sources.length !== 1) {
    return blocked(sources.length > 1 ? 'workspace-ambiguous' : 'workspace-unresolved', [
      ...findings,
      ...(workspaceSources.findings || [])
    ], { workspaceId, candidateCount: sources.length });
  }

  const materialRoot = topicsMaterialRoot(sources[0].workspaceTargetPath);
  if (!materialRoot) return blocked('material-root-unqualified', findings, { workspaceId, workspaceTargetPath: sources[0].workspaceTargetPath });

  const roles = [];
  const roleRecords = [];
  for (const record of records) {
    const artifactPath = norm(record.path || record.id || '');
    if (!pathWithinMaterialRoot(artifactPath, materialRoot) || !/\.md$/i.test(artifactPath)) continue;
    if (isSchemaDefinitionRecord(record)) continue;
    let parsed;
    try { parsed = parseArtifactMarkdown(record.markdown || ''); } catch { continue; }
    if (String(parsed.envelope?.current?.schema?.id || '') !== 'tiinex.party.role.v1') continue;
    const roleLabel = sectionField(sectionText(parsed.body?.text || '', 'Role Identity'), 'Role Label');
    if (!roleLabel) {
      findings.push(finding('warning', 'portable.workspace-session-role.role-label-missing', 'A readable Role artifact was ignored because Role Identity does not expose an explicit Role Label.', { workspaceId, artifactPath }));
      continue;
    }
    roles.push(Object.freeze({
      id: `${workspaceId}::${artifactPath}`,
      target: `${workspaceId}::${artifactPath}`,
      workspaceCoordinate: `${workspaceId}::${artifactPath}`,
      reference: '',
      referenceQualification: 'package-local-or-host-qualified',
      kind: 'role',
      label: roleLabel,
      workspaceId,
      artifactPath,
      schemaId: 'tiinex.party.role.v1',
      qualification: 'session-role-material',
      schemaAuthority: 'identity-readable'
    }));
    roleRecords.push(record);
  }

  const lineage = resolveLineage(roleRecords, { depth: 'loaded-workspace' });
  const nodeIds = new Set((lineage.nodes || []).map((node) => String(node.id || '')));
  const childRoleIds = new Set(
    (lineage.edges || [])
      .filter((edge) => edge.kind === 'parent' && edge.status !== 'missing' && nodeIds.has(String(edge.from || '')) && nodeIds.has(String(edge.to || '')))
      .map((edge) => String(edge.from || ''))
  );
  const leaves = new Set(
    (lineage.nodes || [])
      .filter((node) => !childRoleIds.has(String(node.id || '')))
      .map((node) => norm(node.path || node.id || ''))
      .filter(Boolean)
  );

  const candidates = roles
    .filter((role) => leaves.has(role.artifactPath))
    .map((role) => Object.freeze({ ...role, currentLeaf: true }))
    .sort((a, b) => a.label.localeCompare(b.label) || a.workspaceId.localeCompare(b.workspaceId) || a.artifactPath.localeCompare(b.artifactPath));

  return freeze({
    schema: PORTABLE_WORKSPACE_SESSION_ROLE_PROJECTION_SCHEMA_ID,
    status: 'ready',
    state: 'qualified-material',
    workspaceId,
    workspaceTargetPath: sources[0].workspaceTargetPath,
    materialRoot,
    candidates,
    findings,
    lineage: {
      nodes: (lineage.nodes || []).length,
      resolvedEdges: (lineage.edges || []).filter((edge) => edge.status !== 'missing').length,
      missingEdges: (lineage.edges || []).filter((edge) => edge.status === 'missing').length
    },
    operationBoundary: { sourceMutation: false, remoteWrite: false, identityInference: false, holderInference: false, endpointAuthority: false },
    boundary: 'Projects only current readable Role material from the exact qualified Workspace material surface for recipient-session Role selection. Current means a Role lineage leaf in loaded Role material, not the newest filename or human label. Schema definitions are excluded from this Role/Workspace discovery projection without restricting dedicated schema discovery elsewhere. The projection does not establish Handoff endpoint authority, recipient authority, holder state, participant authority, acceptance, delegation, or work transfer.'
  });
}

function normalizeRecords(input = {}) {
  const source = Array.isArray(input.records)
    ? input.records
    : (Array.isArray(input.files) ? input.files : [])
      .filter((item) => typeof item?.content === 'string')
      .map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
  return source.map((record) => {
    const normalized = { ...record, id: String(record.id || record.path || ''), path: String(record.path || record.id || ''), markdown: String(record.markdown || record.content || '') };
    try {
      const parsed = parseArtifactMarkdown(normalized.markdown);
      const parent = parsed.envelope?.parent || {};
      return { ...normalized, title: parsed.title || '', trace: String(parent.trace || parent.traceRaw || ''), origin: String(parent.origin || '') };
    } catch {
      return normalized;
    }
  });
}

function topicsMaterialRoot(workspaceTargetPath = '') {
  const parts = norm(workspaceTargetPath).split('/').filter(Boolean);
  const index = parts.lastIndexOf('.topics');
  return index >= 0 ? parts.slice(0, index + 1).join('/') : '';
}
function pathWithinMaterialRoot(value = '', root = '') {
  const candidate = norm(value);
  const materialRoot = norm(root);
  if (!candidate || !materialRoot || (candidate !== materialRoot && !candidate.startsWith(`${materialRoot}/`))) return false;
  const relative = candidate === materialRoot ? '' : candidate.slice(materialRoot.length + 1);
  return !relative.split('/').filter(Boolean).includes('.topics');
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function finding(severity, code, message, context = {}) { return Object.freeze({ severity, code, message, context }); }
function blocked(reasonCode, findings = [], extra = {}) {
  return freeze({
    schema: PORTABLE_WORKSPACE_SESSION_ROLE_PROJECTION_SCHEMA_ID,
    status: 'blocked', state: 'blocked', reasonCode, candidates: [], findings, ...extra,
    operationBoundary: { sourceMutation: false, remoteWrite: false, identityInference: false, holderInference: false, endpointAuthority: false },
    boundary: 'Session Role candidate projection is read-only and does not create Handoff endpoint, recipient, holder, participant, acceptance, delegation, or work-transfer authority.'
  });
}
function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)])));
}
