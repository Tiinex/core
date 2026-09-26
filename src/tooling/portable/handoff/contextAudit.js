import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';

export const PORTABLE_HANDOFF_CONTEXT_AUDIT_SCHEMA_ID = 'tiinex.portable.handoff-context-carriage-audit.v1';

export function auditHandoffPackageContextCarriage(input = {}) {
  const bundle = input.bundle || input.package || input;
  const inspection = inspectHandoffPackageV1(bundle);
  const files = Array.isArray(bundle?.files) ? bundle.files : [];
  const knownPaths = new Set([
    String(inspection.rootArtifact?.path || ''),
    String(inspection.readArtifact?.path || ''),
    String(inspection.bootstrapInspection?.descriptorPath || ''),
    String(inspection.bootstrapInspection?.payloadPath || ''),
    ...(inspection.workspaces || []).flatMap((item) => [String(item.artifactPath || ''), String(item.workspaceArchivePath || item.archivePath || '')]),
    ...(inspection.caches || []).flatMap((item) => [String(item.artifactPath || ''), String(item.archivePath || '')]),
    ...(inspection.endpointRoles || []).map((item) => String(item.pointerPath || '')),
    ...(inspection.participantRoles || []).map((item) => String(item.pointerPath || '')),
    ...(inspection.groundingPointers || []).map((item) => String(item.pointerPath || '')),
    ...(inspection.routes || []).map((item) => String(item.pointerPath || ''))
  ].filter(Boolean));
  const unexplainedCarriers = files
    .map((file) => String(file.path || ''))
    .filter((path) => path && !knownPaths.has(path))
    .map((path) => Object.freeze({ path, reason: 'unexplained-package-v1-root-carrier' }));
  const findings = [...(inspection.findings || [])];
  for (const item of unexplainedCarriers) findings.push(finding('error', 'portable.handoff-context.package-v1.carrier.unexplained', 'Visible Package V1 root carrier is not justified by the direct package contract or selected grounding chain.', item));

  const workspaceMaterializations = (inspection.workspaces || []).map((item) => Object.freeze({
    workspaceId: String(item.workspaceId || ''),
    coverage: 'complete',
    reason: 'complete-workspace-archive-representation',
    qualification: item.archive?.state === 'qualified' ? 'qualified' : 'blocked',
    carrierMode: 'archive',
    workspaceTargetPackagePath: String(item.artifactPath || ''),
    archivePackagePath: String(item.workspaceArchivePath || item.archivePath || ''),
    sourceWorkspaceTargetInnerPath: String(item.sourceWorkspaceTargetInnerPath || item.innerPath || ''),
    sourceWorkspaceTargetSha256: String(item.sourceWorkspaceTargetSha256 || ''),
    entryCount: Number(item.archive?.entries?.length || 0),
    interpretation: 'Exact complete Workspace snapshot carriage. Package presence does not create semantic authority beyond the qualified Workspace bytes.'
  }));

  const allPointers = [...(inspection.endpointRoles || []), ...(inspection.participantRoles || []), ...(inspection.groundingPointers || [])];
  const explicitDetachedMaterial = allPointers
    .filter((item) => String(item.targetCarrierKind || '') === 'bounded-cache-entry' && item.resolution?.state === 'qualified')
    .map((item) => Object.freeze({
      qualification: 'qualified-package-v1-grounding-pointer',
      requirementId: String(item.requirementId || ''),
      referenceTarget: String(item.referenceTarget || ''),
      archivePackagePath: String(item.archivePath || ''),
      archiveEntry: String(item.targetArchiveEntry || ''),
      bytes: Number(item.targetBytes || item.resolution?.bytes || 0),
      sha256: String(item.targetSha256 || item.resolution?.sha256 || ''),
      providerMode: 'cache',
      reason: 'exact-bounded-cache-grounding-pointer'
    }));

  const lineageMaterializations = (inspection.groundingPointers || [])
    .filter((item) => isLineageRequirement(item.requirementId) && String(item.targetCarrierKind || '') === 'bounded-cache-entry' && item.resolution?.state === 'qualified')
    .map((item) => {
      const source = sourceIdentityFromReference(item.referenceTarget, item.targetArchiveEntry);
      return Object.freeze({
        qualification: 'qualified-package-v1-parent-boundary-cache',
        workspaceId: source.workspaceId,
        workspaceRelativePath: source.path,
        sourceWorkspaceId: '',
        sourceWorkspaceRelativePath: '',
        routeWorkspaceId: '',
        routeWorkspaceRelativePath: '',
        requirementId: String(item.requirementId || ''),
        referenceTarget: String(item.referenceTarget || ''),
        archivePackagePath: String(item.archivePath || ''),
        archiveEntry: String(item.targetArchiveEntry || ''),
        bytes: Number(item.targetBytes || item.resolution?.bytes || 0),
        sha256: String(item.targetSha256 || item.resolution?.sha256 || '')
      });
    })
    .filter((item) => item.workspaceId && item.workspaceRelativePath);

  const routeGrounding = (inspection.routes || []).map((route) => Object.freeze({
    routeId: String(route.id || ''),
    workspaceId: String(route.workspaceId || ''),
    handoffPackagePath: String(route.packagePath || ''),
    required: Object.freeze([...(route.requiredClosure?.requirements || [])])
  }));
  const clean = inspection.status === 'valid' && unexplainedCarriers.length === 0;
  const classified = files.length - unexplainedCarriers.length;
  return deepFreeze({
    schema: PORTABLE_HANDOFF_CONTEXT_AUDIT_SCHEMA_ID,
    status: clean ? 'ready' : 'blocked',
    coverage: Object.freeze({ nonControlCarrierCount: files.length, classifiedCarrierCount: classified, unexplainedCarrierCount: unexplainedCarriers.length, state: clean ? 'qualified' : 'incomplete' }),
    workspaceMaterializations: Object.freeze(workspaceMaterializations),
    lineageMaterializations: Object.freeze(lineageMaterializations),
    materialCarriers: Object.freeze([]),
    generatedEntrypoints: Object.freeze([String(inspection.rootArtifact?.path || ''), String(inspection.readArtifact?.path || ''), ...allPointers.map((item) => String(item.pointerPath || '')), ...(inspection.routes || []).map((item) => String(item.pointerPath || ''))].filter(Boolean)),
    namedPackageRequirements: Object.freeze([]),
    explicitDetachedMaterial: Object.freeze(explicitDetachedMaterial),
    unexplainedCarriers: Object.freeze(unexplainedCarriers),
    duplicateByteSummary: Object.freeze({ materialCarriersAlsoPresentInWorkspace: 0, totalMaterialCarriers: explicitDetachedMaterial.length, interpretation: 'Bounded cache material is valid only when exact grounding pointers justify every cache entry and carried Workspace resolution was unavailable.' }),
    routeGrounding: Object.freeze(routeGrounding),
    inspections: Object.freeze({ packageV1: inspection.status, parentBoundaryGrounding: inspection.status === 'valid' ? 'qualified-package-v1' : 'not-projected' }),
    findings: Object.freeze(dedupeFindings(findings)),
    boundary: 'Direct Package V1 carriage audit. Every visible root carrier is classified from human-readable Package V1 artifacts and exact ZIP bytes; no compatibility manifest or alternate recipient representation is consulted.'
  });
}

function isLineageRequirement(value = '') {
  const id = String(value || '');
  return id.startsWith('route-parent:') || id.startsWith('pointer-target:') || id.startsWith('bounded-workspace:');
}
function sourceIdentityFromReference(reference = '', archiveEntry = '') {
  const raw = String(reference || '').trim();
  const qualified = raw.match(/^([^:\s]+)::(.+)$/);
  if (qualified) return Object.freeze({ workspaceId: qualified[1], path: norm(qualified[2]) });
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname.toLowerCase() === 'github.com' && parts.length >= 5 && parts[2] === 'blob') return Object.freeze({ workspaceId: decodeURIComponent(parts[1]), path: norm(parts.slice(4).map(decodeURIComponent).join('/')) });
  } catch {}
  const cached = norm(archiveEntry).match(/^github\/[^/]+\/([^/]+)\/(.+)$/);
  return cached ? Object.freeze({ workspaceId: cached[1], path: cached[2] }) : Object.freeze({ workspaceId: '', path: '' });
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.path || item.requirementId || item.archiveEntry || ''}:${item.message || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
