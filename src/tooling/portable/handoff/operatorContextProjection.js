import path from 'node:path';
import { projectQualifiedHandoffEndpoints } from './handoffEndpointProjection.js';
import { projectQualifiedHandoffLeaves } from './handoffLeafProjection.js';
import { projectQualifiedWorkspacePackageSources } from './workspacePackageSources.js';

export const PORTABLE_OPERATOR_CONTEXT_SCHEMA_ID = 'tiinex.portable.operator-context.v1';

export function projectPortableOperatorContext(input = {}) {
  const files = Array.isArray(input.files) ? input.files : [];
  const repositories = normalizeRepositories(input.repositories || input.localRepositories || []);
  const roots = normalizeRoots(input.workspaceRoots || input.roots || [], repositories);
  const findings = [];
  const projectedRoots = [];
  const flattenedWorkspaces = [];
  const flattenedLeaves = [];
  const flattenedEndpoints = [];
  const flattenedAuthoringEndpoints = [];
  const flattenedAuthoringReferenceCandidates = [];

  if (!roots.length) {
    findings.push(finding('error', 'portable.operator-context.roots.required', 'Operator context requires explicit Workspace roots; repository basenames or ambient process paths are not semantic Workspace identity.'));
  }

  for (const root of roots) {
    const rootFiles = files.filter((file) => fileBelongsToRoot(file, root.root));
    const workspaceSurfaceFiles = rootFiles.filter((file) => fileBelongsToRootWorkspaceSurface(file, root.root));
    const rootRepositories = repositories.filter((repository) => samePath(repository.root, root.root));
    const sources = projectQualifiedWorkspacePackageSources({ files: workspaceSurfaceFiles, repositories: rootRepositories.length ? rootRepositories : repositories });
    const workspaces = [];
    for (const candidate of sources.candidates || []) {
      const leaves = projectQualifiedHandoffLeaves({ files: rootFiles });
      const endpoints = projectQualifiedHandoffEndpoints({ files: rootFiles, workspaceId: candidate.workspaceId });
      const workspace = freeze({
        ...candidate,
        hostRootId: root.id,
        hostRoot: root.root,
        handoffLeaves: leaves.leaves || [],
        pointerless: leaves.pointerless,
        endpoints: endpoints.candidates || [],
        authoringEndpoints: endpoints.authoringCandidates || [],
        currentRoleEndpoints: endpoints.currentRoleCandidates || [],
        currentRoleAuthoringEndpoints: endpoints.currentRoleAuthoringCandidates || [],
        authoringReferenceCandidates: endpoints.authoringReferenceCandidates || []
      });
      workspaces.push(workspace);
      flattenedWorkspaces.push(workspace);
      for (const leaf of workspace.handoffLeaves) flattenedLeaves.push(freeze({ ...leaf, workspaceId: candidate.workspaceId, hostRootId: root.id, hostRoot: root.root }));
      for (const endpoint of workspace.endpoints) flattenedEndpoints.push(freeze({ ...endpoint, hostRootId: root.id, hostRoot: root.root }));
      for (const endpoint of workspace.authoringEndpoints) flattenedAuthoringEndpoints.push(freeze({ ...endpoint, hostRootId: root.id, hostRoot: root.root }));
      for (const endpoint of workspace.authoringReferenceCandidates) flattenedAuthoringReferenceCandidates.push(freeze({ ...endpoint, hostRootId: root.id, hostRoot: root.root }));
    }
    findings.push(...(sources.findings || []).map((item) => finding(item.severity || 'warning', item.code || 'portable.operator-context.workspace-source', item.message || 'Workspace source projection finding.', { ...(item.context || {}), hostRootId: root.id, hostRoot: root.root })));
    projectedRoots.push(freeze({ id: root.id, root: root.root, repository: rootRepositories[0] || null, workspaces }));
  }

  const workspaceIds = new Map();
  for (const workspace of flattenedWorkspaces) workspaceIds.set(workspace.workspaceId, (workspaceIds.get(workspace.workspaceId) || 0) + 1);
  for (const [workspaceId, count] of workspaceIds.entries()) {
    if (count > 1) findings.push(finding('error', 'portable.operator-context.workspace-id.ambiguous', 'Multiple explicit roots projected the same package-local Workspace identity; the host must not collapse them by repository basename.', { workspaceId, count }));
  }

  const status = findings.some((item) => item.severity === 'error') ? 'blocked' : 'ready';
  const pointerless = freeze({
    selectionLabel: 'No Handoff pointer',
    packageRole: 'recipient-facing-workspace-carrier',
    semanticState: 'qualified-canonical-docs',
    manufactureState: status === 'ready' ? 'ready' : 'blocked',
    blockerCode: status === 'ready' ? '' : 'portable.operator-context.blocked',
    consequence: 'Workspace transport only — no Handoff semantics.'
  });
  return freeze({
    schema: PORTABLE_OPERATOR_CONTEXT_SCHEMA_ID,
    status,
    roots: projectedRoots,
    workspaces: flattenedWorkspaces.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.workspaceTargetPath.localeCompare(b.workspaceTargetPath)),
    handoffLeaves: flattenedLeaves.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.path.localeCompare(b.path)),
    endpoints: dedupeEndpoints(flattenedEndpoints),
    authoringEndpoints: dedupeEndpoints(flattenedAuthoringEndpoints),
    authoringReferenceCandidates: dedupeEndpoints(flattenedAuthoringReferenceCandidates),
    operatorPartyScopes: projectOperatorPartyScopes(dedupeEndpoints(flattenedAuthoringReferenceCandidates)),
    participants: projectParticipantCandidatesFromEndpoints(flattenedEndpoints),
    pointerless,
    findings,
    operationBoundary: { sourceMutation: false, remoteWrite: false, manufacture: false, identityInference: false },
    boundary: 'Projects one multi-root operator context from explicit host roots. Top-level Workspace candidates are limited to direct artifacts on each selected root\'s canonical .topics/.workspaces surface; nested independent .topics surfaces require their own explicit host root. Qualified Workspace artifact identity remains distinct from physical repository identity; exact Role/Party endpoints, readable authoring-assist endpoints, Core-current Party-reference authoring candidates, and Handoff leaves are shared-core projections, and No Handoff pointer remains explicit.'
  });
}

function normalizeRoots(value = [], repositories = []) {
  const supplied = Array.isArray(value) ? value : [];
  const list = supplied.length ? supplied : repositories.map((repository) => ({ id: repository.id || repository.root, root: repository.root }));
  const seen = new Set();
  const roots = [];
  for (const item of list) {
    const root = path.resolve(String(item?.root || item?.path || '')).replace(/\\/g, '/').replace(/\/$/, '');
    if (!root || seen.has(root)) continue;
    seen.add(root);
    roots.push(freeze({ id: String(item?.id || root), root }));
  }
  return roots;
}
function normalizeRepositories(value = []) {
  return (Array.isArray(value) ? value : []).map((item) => freeze({ ...item, id: String(item?.id || item?.root || ''), root: path.resolve(String(item?.root || item?.id || '')).replace(/\\/g, '/').replace(/\/$/, '') })).filter((item) => item.root);
}
function fileBelongsToRoot(file = {}, root = '') {
  const localPath = String(file?.locator?.localPath || '').replace(/\\/g, '/');
  if (!localPath || !root) return false;
  const base = String(root).replace(/\\/g, '/').replace(/\/$/, '');
  return localPath === base || localPath.startsWith(`${base}/`);
}
function fileBelongsToRootWorkspaceSurface(file = {}, root = '') {
  const localPath = String(file?.locator?.localPath || '').replace(/\\/g, '/');
  if (!localPath || !root) return false;
  const base = String(root).replace(/\\/g, '/').replace(/\/$/, '');
  const prefix = `${base}/.topics/.workspaces/`;
  if (!localPath.startsWith(prefix)) return false;
  const relative = localPath.slice(prefix.length);
  return Boolean(relative) && !relative.includes('/');
}
function samePath(a = '', b = '') { return String(a || '').replace(/\\/g, '/').replace(/\/$/, '') === String(b || '').replace(/\\/g, '/').replace(/\/$/, ''); }
export function projectOperatorPartyScopes(candidates = []) {
  const list = dedupeEndpoints(Array.isArray(candidates) ? candidates : []);
  const display = (candidate) => String(candidate?.authoringLabel || candidate?.label || '').trim();
  const norm = (value) => String(value || '').trim().toLocaleLowerCase();
  const organizations = list.filter((candidate) => String(candidate?.schemaId || '') === 'tiinex.party.organization.v1');
  const roles = list.filter((candidate) => String(candidate?.kind || '') === 'role');
  return list.map((candidate) => {
    const labels = new Set([display(candidate)].filter(Boolean));
    const targets = new Set([String(candidate?.target || '').trim()].filter(Boolean));
    const basis = ['selected-workspace-party-artifact'];
    let expansionState = 'self-only';
    if (String(candidate?.kind || '') === 'role') {
      const organizationLabel = String(candidate?.organizationLabel || '').trim();
      if (organizationLabel) {
        const matches = organizations.filter((organization) => organization.workspaceId === candidate.workspaceId && norm(display(organization)) === norm(organizationLabel));
        if (matches.length === 1) {
          labels.add(display(matches[0]));
          targets.add(String(matches[0].target || ''));
          basis.push('role-identity-organization-label-same-workspace');
          expansionState = 'organization-expanded';
        } else if (matches.length > 1) expansionState = 'organization-ambiguous';
        else expansionState = 'organization-unresolved';
      }
    } else if (String(candidate?.schemaId || '') === 'tiinex.party.organization.v1') {
      const organizationLabel = display(candidate);
      const sameLabelOrganizations = organizations.filter((organization) => organization.workspaceId === candidate.workspaceId && norm(display(organization)) === norm(organizationLabel));
      if (sameLabelOrganizations.length > 1) {
        expansionState = 'organization-ambiguous';
      } else {
        for (const role of roles.filter((role) => role.workspaceId === candidate.workspaceId && norm(role.organizationLabel) === norm(organizationLabel))) {
          labels.add(display(role));
          targets.add(String(role.target || ''));
        }
        if (labels.size > 1) { basis.push('organization-current-role-identity-same-workspace'); expansionState = 'current-roles-expanded'; }
      }
    }
    const candidateTargetsForLabel = (label) => list
      .filter((item) => norm(display(item)) === norm(label))
      .map((item) => String(item?.target || '').trim())
      .filter(Boolean);
    const recipientLabelAmbiguities = [...labels].filter(Boolean).filter((label) => {
      const matchingTargets = candidateTargetsForLabel(label);
      return matchingTargets.some((target) => !targets.has(target));
    }).sort((a, b) => a.localeCompare(b));
    const safeLabels = [...labels].filter(Boolean).filter((label) => !recipientLabelAmbiguities.includes(label));
    return freeze({
      target: candidate.target, displayName: display(candidate), kind: candidate.kind, schemaId: candidate.schemaId, workspaceId: candidate.workspaceId, artifactPath: candidate.artifactPath, qualification: candidate.qualification,
      recipientLabels: safeLabels.sort((a, b) => a.localeCompare(b)),
      recipientTargets: [...targets].filter(Boolean).sort((a, b) => a.localeCompare(b)),
      recipientLabelAmbiguities,
      basis, expansionState,
      boundary: 'Recipient visibility scope only. Organization/Role association comes only from explicit Role Identity Organization metadata in the same qualified Workspace; ambiguous display labels outside the selected scope fail closed and this projection does not grant representation, delegation, or Role authority.'
    });
  }).sort((a, b) => String(a.displayName || '').localeCompare(String(b.displayName || '')) || String(a.target || '').localeCompare(String(b.target || '')));
}

export function projectParticipantCandidatesFromEndpoints(candidates = []) {
  return dedupeEndpoints((Array.isArray(candidates) ? candidates : []).filter((candidate) => String(candidate?.kind || '') === 'role'));
}
function dedupeEndpoints(candidates = []) {
  const byTarget = new Map();
  for (const candidate of candidates) byTarget.set(candidate.target, candidate);
  return [...byTarget.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
}
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
