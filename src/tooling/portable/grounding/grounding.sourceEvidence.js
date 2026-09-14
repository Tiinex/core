import { parseWorkspaceEntrypoints } from '../handoff/workspaceSourceIdentity.js';
const MAX_WORKSPACES = 8;
const MAX_SOURCES = 8;
const MAX_MATERIALS = 12;
const MAX_BLOCKERS = 8;

export function projectGroundingSourceEvidence({ records = [], contextAudit = null, continuation = null, requiredContext = [], sourceProfiles = [] } = {}) {
  const byPath = new Map((records || []).map((record) => [String(record.path || ''), record]));
  const profiles = profileIndex(sourceProfiles);
  const coverageByWorkspace = new Map();
  const workspaces = (contextAudit?.workspaceMaterializations || []).slice(0, MAX_WORKSPACES).map((workspace) => {
    const workspaceId = String(workspace.workspaceId || '');
    const coverage = normalizeCoverage(workspace);
    if (workspaceId) coverageByWorkspace.set(workspaceId, coverage);
    const innerPath = normalizePath(workspace.sourceWorkspaceTargetInnerPath || '');
    const exactPath = workspaceId && innerPath ? `${workspaceId}/${innerPath}` : '';
    const record = exactPath ? byPath.get(exactPath) : null;
    const declared = record ? parseWorkspaceEntrypoints(record.markdown || '') : [];
    const explicitProfile = profiles.get(workspaceId) || [];
    const sources = declared.length ? declared : explicitProfile;
    const unique = sources.length === 1 ? sources[0] : null;
    const qualifiedArtifact = Boolean(
      String(workspace.qualification || '') === 'qualified'
      && innerPath
      && record
      && record.hasContinuityContext
      && record.hasIntegrity
    );
    if (!qualifiedArtifact && !explicitProfile.length) return Object.freeze({
      workspace: workspaceId,
      state: 'unresolved',
      coverage,
      carrier: String(workspace.reason || ''),
      provenance: Object.freeze({
        basis: 'carried-workspace-materialization-without-qualified-source-declaration',
        sourceArtifactPath: exactPath,
        boundary: 'Workspace carriage alone does not establish repository/source identity.'
      })
    });
    return Object.freeze({
      workspace: workspaceId,
      state: qualifiedArtifact ? 'qualified' : 'explicit-profile',
      coverage,
      carrier: String(workspace.reason || 'qualified-workspace-snapshot'),
      sourceArtifactPath: exactPath,
      sourceArtifactSha256: String(workspace.sourceWorkspaceTargetSha256 || ''),
      repository: String(unique?.repository || ''),
      ref: String(unique?.ref || ''),
      rootPath: String(unique?.rootPath || ''),
      remoteState: String(unique?.remoteState || 'not-checked'),
      sources: Object.freeze(sources.slice(0, MAX_SOURCES)),
      provenance: Object.freeze({
        basis: qualifiedArtifact ? 'exact-qualified-workspace-source-artifact' : 'explicit-source-profile',
        sourceArtifactPath: exactPath,
        sourceArtifactSha256: String(workspace.sourceWorkspaceTargetSha256 || ''),
        coverageBasis: String(workspace.reason || ''),
        boundary: qualifiedArtifact
          ? 'Source identity is projected only from the exact qualified Workspace artifact carried for this Workspace.'
          : 'Source identity is projected only from an explicitly supplied source profile; no repository discovery is implied.'
      })
    });
  });

  const requirements = (requiredContext || []).slice(0, MAX_MATERIALS).map((entry) => projectRequirement(entry, coverageByWorkspace));
  const unavailable = requirements.filter((entry) => entry.availability === 'unavailable');
  const blockers = unavailable.slice(0, MAX_BLOCKERS).map((entry) => Object.freeze({
    code: 'authoritative-material-unavailable',
    requirementId: entry.requirementId,
    name: entry.name,
    requiredMaterial: Object.freeze({
      material: entry.material,
      referenceTarget: entry.referenceTarget,
      workspace: entry.workspace,
      path: entry.path
    }),
    owner: Object.freeze({
      kind: 'selected-handoff-required-context',
      requirementId: entry.requirementId,
      name: entry.name,
      purpose: entry.purpose
    }),
    basis: Object.freeze({
      state: entry.state,
      availability: entry.availability,
      materialClass: entry.materialClass,
      workspaceCoverage: entry.workspaceCoverage,
      providerMode: entry.providerMode,
      kind: entry.kind,
      provenance: entry.provenance
    }),
    blockingReason: 'The exact declared Required Context material is not qualified in current carried/explicit material, so Tooling cannot claim that authority is available.',
    workspace: entry.workspace,
    path: entry.path,
    referenceTarget: entry.referenceTarget,
    request: exactMaterialRequest(entry)
  }));
  const boundedOrCache = requirements.filter((entry) => entry.availability === 'qualified' && ['bounded-workspace', 'cache'].includes(entry.materialClass));
  const contextMaterials = [
    ...(contextAudit?.materialCarriers || []).map((item) => projectAuditMaterial(item, 'requirement-material')),
    ...(contextAudit?.explicitDetachedMaterial || []).map((item) => projectAuditMaterial(item, 'bounded-or-cache-material')),
    ...(contextAudit?.lineageMaterializations || []).map((item) => projectAuditMaterial(item, 'lineage-cache-material'))
  ].slice(0, MAX_MATERIALS);

  return Object.freeze({
    carrier: Object.freeze({
      state: String(contextAudit?.coverage?.state || contextAudit?.status || 'unresolved'),
      workspaceCount: Number(contextAudit?.workspaceMaterializations?.length || 0),
      packageSourcePath: String(continuation?.packageSourcePath || ''),
      completeWorkspaceCount: workspaces.filter((item) => item.coverage === 'complete').length,
      boundedWorkspaceCount: workspaces.filter((item) => item.coverage === 'bounded').length
    }),
    workspaces: Object.freeze(workspaces),
    requirements: Object.freeze(requirements),
    boundedOrCache: Object.freeze(boundedOrCache),
    carriedMaterial: Object.freeze(contextMaterials),
    blockers: Object.freeze(blockers),
    boundary: 'Exact selected Workspace/source declarations and exact qualified Required Context material only. Complete Workspace carriage, bounded Workspace/cache material, explicit requirements, and unavailable authoritative material remain distinct. Missing material never authorizes repository, connector, or network discovery.'
  });
}

function projectRequirement(entry = {}, coverageByWorkspace = new Map()) {
  const state = String(entry.state || 'unresolved');
  const providerMode = String(entry.providerMode || '');
  const workspace = String(entry.workspaceId || '');
  const workspaceCoverage = coverageByWorkspace.get(workspace) || 'unresolved';
  let materialClass = 'explicit-requirement';
  if (state === 'qualified') {
    if (providerMode === 'cache' || String(entry.kind || '') === 'workspace-cache-entry') materialClass = 'cache';
    else if (providerMode === 'archive' && workspaceCoverage === 'bounded') materialClass = 'bounded-workspace';
    else if (providerMode === 'archive' && workspaceCoverage === 'complete') materialClass = 'complete-workspace';
    else if (providerMode === 'archive') materialClass = 'workspace-material';
    else materialClass = 'qualified-material';
  }
  return Object.freeze({
    requirementId: String(entry.requirementId || ''),
    name: String(entry.name || ''),
    material: String(entry.material || ''),
    purpose: String(entry.purpose || ''),
    declaredAvailability: String(entry.declaredAvailability || ''),
    state,
    availability: state === 'qualified' ? 'qualified' : 'unavailable',
    materialClass,
    workspace,
    workspaceCoverage,
    path: String(entry.innerPath || entry.workspaceRelativePath || ''),
    packagePath: String(entry.packagePath || entry.archivePackagePath || ''),
    providerMode,
    kind: String(entry.kind || ''),
    referenceTarget: String(entry.referenceTarget || ''),
    bytes: Number(entry.bytes || 0),
    sha256: String(entry.sha256 || ''),
    provenance: Object.freeze({
      basis: String(entry.provenance?.basis || 'selected-handoff-required-context-and-route-closure'),
      declarationSource: entry.provenance?.declarationSource ? Object.freeze({ ...(entry.provenance.declarationSource || {}) }) : null,
      resolutionKind: String(entry.provenance?.resolutionKind || entry.kind || ''),
      providerMode: String(entry.provenance?.providerMode || providerMode),
      boundary: String(entry.provenance?.boundary || 'Requirement identity comes from the selected Handoff declaration; qualification/material class comes from exact route closure and carried source state.')
    })
  });
}

function projectAuditMaterial(item = {}, classification = '') {
  return Object.freeze({
    classification,
    requirementId: String(item.requirementId || item.requirement?.id || ''),
    name: String(item.requirement?.name || ''),
    workspace: String(item.workspaceId || item.targetWorkspaceId || item.selectedProvider?.workspaceId || ''),
    path: String(item.workspaceRelativePath || item.targetPath || item.originalPath || item.selectedProvider?.workspaceRelativePath || ''),
    packagePath: String(item.path || item.archivePackagePath || ''),
    bytes: Number(item.bytes || item.actualBytes || 0),
    sha256: String(item.sha256 || item.actualSha256 || ''),
    authority: Object.freeze({ ...(item.authority || {}) }),
    provenance: Object.freeze({
      basis: classification,
      carrierPath: String(item.path || item.archivePackagePath || ''),
      boundary: 'Diagnostic carriage evidence only; presence does not create semantic authority beyond the requirement/material it exactly resolves.'
    })
  });
}

function exactMaterialRequest(entry = {}) {
  const target = entry.referenceTarget || [entry.workspace, entry.path].filter(Boolean).join('::') || entry.name || entry.requirementId || 'the declared Required Context material';
  return `Provide exact qualified material for ${target}, or an explicitly qualified bounded Workspace/cache carrier that resolves this declared requirement. Do not substitute GitHub, a connector, a repository checkout, or network discovery without separate authority.`;
}

function normalizeCoverage(workspace = {}) {
  const explicit = String(workspace.coverage || '').trim().toLowerCase();
  if (explicit === 'complete' || explicit === 'bounded') return explicit;
  const reason = String(workspace.reason || '').toLowerCase();
  if (reason.includes('bounded') || reason.includes('partial')) return 'bounded';
  if (reason.includes('complete')) return 'complete';
  return 'unresolved';
}

function profileIndex(value = []) {
  const map = new Map();
  if (!value) return map;
  if (!Array.isArray(value) && typeof value === 'object') {
    for (const [workspaceId, profile] of Object.entries(value)) map.set(String(workspaceId), Object.freeze(normalizeProfileList(profile)));
    return map;
  }
  for (const item of value || []) {
    const workspaceId = String(item?.workspaceId || item?.workspace || '');
    if (!workspaceId) continue;
    const list = map.get(workspaceId) || [];
    list.push(normalizeProfile(item));
    map.set(workspaceId, Object.freeze(list));
  }
  return map;
}
function normalizeProfileList(value) { return (Array.isArray(value) ? value : [value]).filter(Boolean).map(normalizeProfile); }
function normalizeProfile(value = {}) { return Object.freeze({ label: String(value.label || ''), sourceKind: String(value.sourceKind || value.kind || ''), repository: String(value.repository || ''), ref: String(value.ref || ''), rootPath: String(value.rootPath || ''), remoteState: String(value.remoteState || 'not-checked'), basis: 'explicit-source-profile' }); }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, ''); }
