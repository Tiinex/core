import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';

export const HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH = '001-1-READ-BEFORE-PROCEEDING.trace.md';
export const HANDOFF_COLD_CONSUMER_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-cold-consumer-projection.v1';
export const HANDOFF_COLD_CONSUMER_ENTRYPOINT_INSPECTION_SCHEMA_ID = 'tiinex.portable.handoff-cold-consumer-entrypoint.inspection.v1';

export function buildHandoffColdConsumerProjection(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  return inspection.coldConsumerProjection || Object.freeze({ schema: HANDOFF_COLD_CONSUMER_PROJECTION_SCHEMA_ID, status: 'blocked', routes: Object.freeze([]), workspaces: Object.freeze([]), findings: inspection.findings || Object.freeze([]) });
}

export function renderHandoffColdConsumerEntrypoint(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  const path = inspection.readArtifact?.path || HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH;
  const file = (input.bundle?.files || input.package?.files || input.files || []).find((item) => String(item.path || '') === path);
  if (!file) throw new Error('portable.handoff-package-v1.start.unavailable');
  return typeof file.content === 'string' ? file.content : new TextDecoder().decode(file.data || new Uint8Array());
}

export function inspectHandoffColdConsumerEntrypoint(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  return Object.freeze({ schema: HANDOFF_COLD_CONSUMER_ENTRYPOINT_INSPECTION_SCHEMA_ID, status: inspection.status, path: inspection.readArtifact?.path || '', findings: inspection.findings || Object.freeze([]) });
}

export function orientColdConsumerFromHandoffPackage(input = {}) {
  const inspection = inspectHandoffPackageV1(input.bundle || input.package || input);
  const carrierWorkspaceById = new Map((inspection.carrierProjection?.workspaces || []).map((item) => [String(item.workspaceId || item.id || ''), item]));
  return Object.freeze({
    schema: 'tiinex.portable.handoff-cold-consumer-orientation.v1',
    status: inspection.status === 'valid' ? 'ready' : 'blocked',
    rootArtifact: inspection.rootArtifact || null,
    readArtifact: inspection.readArtifact || null,
    routes: inspection.routes || Object.freeze([]),
    workspaces: Object.freeze((inspection.workspaces || []).map((workspace) => projectOrientationWorkspace(workspace, carrierWorkspaceById))),
    caches: Object.freeze((inspection.caches || []).map(projectOrientationCache)),
    endpointRoles: inspection.endpointRoles || Object.freeze([]),
    participantRoles: inspection.participantRoles || Object.freeze([]),
    groundingPointers: inspection.groundingPointers || Object.freeze([]),
    bootstrapInspection: inspection.bootstrapInspection || null,
    carrierProjection: inspection.carrierProjection || null,
    carrierLineage: inspection.carrierProjection?.lineage || inspection.rootArtifact?.carrierLineage || null,
    findings: inspection.findings || Object.freeze([]),
    boundary: 'Direct orientation from readable Handoff Package V1 artifacts and exact carried ZIP bytes. Orientation exposes qualified identities/topology but never serializes carried Workspace/cache payload bytes; grounding re-inspects the untouched package when exact material is required. No alternate recipient format or hidden manifest is consulted.'
  });
}

function projectOrientationWorkspace(workspace = {}, carrierWorkspaceById = new Map()) {
  const workspaceId = String(workspace.workspaceId || workspace.id || '');
  const carrier = carrierWorkspaceById.get(workspaceId) || {};
  const bindingState = String(workspace.bindingState || '');
  return Object.freeze({
    id: workspaceId,
    workspaceId,
    title: String(carrier.title || workspace.title || workspaceId),
    qualification: bindingState === 'verified' ? 'qualified' : bindingState,
    artifactPath: String(workspace.artifactPath || ''),
    archivePath: String(workspace.archivePath || workspace.workspaceArchivePath || ''),
    innerPath: String(workspace.innerPath || workspace.sourceWorkspaceTargetInnerPath || ''),
    archiveSha256: String(workspace.archiveSha256 || ''),
    coverage: String(workspace.coverage || ''),
    bindingState
  });
}

function projectOrientationCache(cache = {}) {
  return Object.freeze({
    cacheId: String(cache.cacheId || ''),
    artifactPath: String(cache.artifactPath || ''),
    archivePath: String(cache.archivePath || ''),
    materialCount: Array.isArray(cache.materials) ? cache.materials.length : 0
  });
}
