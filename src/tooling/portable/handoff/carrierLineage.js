import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { normalizeHandoffCarrierProfile } from './carrierProfile.js';
import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';

export const HANDOFF_CARRIER_LINEAGE_SCHEMA_ID = 'tiinex.portable.handoff-carrier-lineage.v1';

export function initialHandoffCarrierLineage(prefix = '') {
  return freezeLineage({ mode: 'root', prefix: normalizeCarrierPrefix(prefix), dimension: '001', parentDimension: '', parentPackageSha256: '', parentPackageFilename: '', major: '001', majorReason: 'initial carrier root', checkpointKind: 'major' });
}

export function continueHandoffCarrierLineage(parent = {}, siblingIndex = 1) {
  const normalized = normalizeParentLineage(parent);
  if (!normalized.dimension) throw new Error('portable.handoff-carrier-lineage.parent.unresolved');
  const childIndex = normalizeSiblingIndex(siblingIndex);
  return freezeLineage({
    mode: 'continue',
    prefix: normalized.prefix,
    dimension: `${normalized.dimension}-${childIndex}`,
    parentDimension: normalized.dimension,
    parentPackageSha256: normalized.packageSha256,
    parentPackageFilename: normalized.packageFilename,
    major: majorSegment(normalized.dimension),
    majorReason: '',
    checkpointKind: 'progression'
  });
}

export function advanceHandoffCarrierMajor(parent = {}, reason = '') {
  const normalized = normalizeParentLineage(parent);
  if (!normalized.dimension) throw new Error('portable.handoff-carrier-lineage.parent.unresolved');
  const majorReason = String(reason || '').trim();
  if (!majorReason) throw new Error('portable.handoff-carrier-lineage.major-reason.required');
  const currentMajor = Number.parseInt(majorSegment(normalized.dimension), 10);
  if (!Number.isFinite(currentMajor) || currentMajor < 1 || currentMajor >= 999) throw new Error('portable.handoff-carrier-lineage.major.invalid');
  const nextMajor = String(currentMajor + 1).padStart(3, '0');
  return freezeLineage({
    mode: 'major',
    prefix: normalized.prefix,
    dimension: nextMajor,
    parentDimension: normalized.dimension,
    parentPackageSha256: normalized.packageSha256,
    parentPackageFilename: normalized.packageFilename,
    major: nextMajor,
    majorReason,
    checkpointKind: 'major'
  });
}

export function normalizeHandoffCarrierLineage(value = null) {
  if (!value || typeof value !== 'object') return initialHandoffCarrierLineage();
  const dimension = normalizeDimension(value.dimension || '');
  if (!dimension) return initialHandoffCarrierLineage();
  const mode = ['root', 'continue', 'major'].includes(String(value.mode || '')) ? String(value.mode) : dimension.includes('-') ? 'continue' : 'root';
  return freezeLineage({
    mode,
    prefix: normalizeCarrierPrefix(value.prefix || ''),
    dimension,
    parentDimension: normalizeDimension(value.parentDimension || ''),
    parentPackageSha256: normalizeSha256(value.parentPackageSha256 || ''),
    parentPackageFilename: String(value.parentPackageFilename || ''),
    major: majorSegment(dimension),
    majorReason: String(value.majorReason || ''),
    checkpointKind: String(value.checkpointKind || (mode === 'continue' ? 'progression' : 'major'))
  });
}

export function parentHandoffCarrierLineageFromBundle(bundle = {}, options = {}) {
  const inspection = inspectHandoffPackageV1(bundle);
  if (inspection.status !== 'valid') throw new Error('portable.handoff-carrier-lineage.package-parent.invalid');
  const lineage = inspection.carrierProjection?.lineage || inspection.rootArtifact?.carrierLineage || null;
  const dimension = normalizeDimension(lineage?.dimension || '');
  if (!dimension) throw new Error('portable.handoff-carrier-lineage.package-parent.dimension-unresolved');
  return Object.freeze({
    ...normalizeHandoffCarrierLineage({ ...lineage, dimension }),
    packageSha256: normalizeSha256(options.packageSha256 || ''),
    packageFilename: String(options.packageFilename || '')
  });
}

export function parentHandoffCarrierProfileFromBundle() {
  return normalizeHandoffCarrierProfile(null);
}

export function qualifyMajorCarrierReadiness(input = {}, lineage = {}) {
  const profile = normalizeHandoffCarrierProfile(input.carrierProfile || null);
  if (String(lineage.checkpointKind || '') !== 'major') return Object.freeze({
    state: 'not-applicable',
    profile,
    completeWorkspaceCount: 0,
    workspaceCount: 0,
    requiredWorkspaceIds: profile.requiredMajorWorkspaceIds,
    missingWorkspaceIds: Object.freeze([]),
    reason: ''
  });
  const workspaces = [...(input.workspaceMaterializations || [])];
  const requiredWorkspaceIds = profile.requiredMajorWorkspaceIds;
  const completeWorkspaceIds = new Set(workspaces
    .filter((workspace) => String(workspace.state || '') === 'complete' && String(workspace.completenessEvidence?.state || '') === 'qualified')
    .map((workspace) => String(workspace.id || workspace.workspaceId || '').trim().toLowerCase())
    .filter(Boolean));
  const missingWorkspaceIds = Object.freeze(requiredWorkspaceIds.filter((workspaceId) => !completeWorkspaceIds.has(workspaceId)));
  const complete = workspaces.filter((workspace) => String(workspace.state || '') === 'complete' && String(workspace.completenessEvidence?.state || '') === 'qualified').length;
  const profileReady = profile.state === 'qualified';
  const ready = workspaces.length > 0 && complete === workspaces.length && missingWorkspaceIds.length === 0;
  return Object.freeze({
    state: ready ? 'qualified' : 'blocked',
    profile,
    workspaceCount: workspaces.length,
    completeWorkspaceCount: complete,
    requiredWorkspaceIds,
    missingWorkspaceIds,
    reason: ready
      ? (profileReady ? 'major-carrier-satisfies-explicit-carrier-profile' : 'major-carrier-has-complete-carried-workspaces-without-named-profile-requirements')
      : 'major-carrier-requires-complete-carried-and-profile-declared-workspaces',
    semanticClosure: lineage.mode === 'major' ? 'explicit-major-reason-caller-declared' : 'initial-root'
  });
}

export function carrierLineageFromCliParent({ bundle = {}, parentPath = '', parentBytes = null, routeDimensions = [], qualifiedParentLineage = null, major = false, majorReason = '', siblingIndex = 1 } = {}) {
  const bytes = parentBytes ? packageFileBytes({ data: parentBytes }) : new Uint8Array();
  const packageIdentity = Object.freeze({
    packageSha256: bytes.byteLength ? sha256Hex(bytes) : '',
    packageFilename: parentPath ? portableBasename(parentPath) : ''
  });
  const qualifiedDimension = normalizeDimension(qualifiedParentLineage?.dimension || '');
  const parent = qualifiedDimension
    ? Object.freeze({ ...normalizeHandoffCarrierLineage(qualifiedParentLineage), ...packageIdentity })
    : parentHandoffCarrierLineageFromBundle(bundle, { routeDimensions, ...packageIdentity });
  return major ? advanceHandoffCarrierMajor(parent, majorReason) : continueHandoffCarrierLineage(parent, siblingIndex);
}

function normalizeParentLineage(parent = {}) {
  return Object.freeze({
    prefix: normalizeCarrierPrefix(parent.prefix || ''),
    dimension: normalizeDimension(parent.dimension || ''),
    packageSha256: normalizeSha256(parent.packageSha256 || parent.parentPackageSha256 || ''),
    packageFilename: String(parent.packageFilename || parent.parentPackageFilename || '')
  });
}

export function normalizeHandoffCarrierPrefix(value = '') {
  return normalizeCarrierPrefix(value);
}

function normalizeCarrierPrefix(value = '') {
  const text = String(value || '').trim().replace(/-+$/u, '');
  if (!text) return '';
  if (text.length > 120 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(text)) throw new Error('portable.handoff-carrier-lineage.prefix.invalid');
  return text;
}

function freezeLineage(value) { return Object.freeze({ schema: HANDOFF_CARRIER_LINEAGE_SCHEMA_ID, ...value }); }
function normalizeDimension(value = '') {
  const text = String(value || '').trim();
  return /^\d{3}(?:-\d+)*$/.test(text) ? text : '';
}
function normalizeSha256(value = '') {
  const text = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(text) ? text : '';
}
function normalizeSiblingIndex(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 999999) throw new Error('portable.handoff-carrier-lineage.sibling-index.invalid');
  return n;
}
function majorSegment(dimension = '') { return String(dimension || '').split('-')[0] || ''; }
function portableBasename(value = '') {
  const normalized = String(value || '').replace(/\\/g, '/');
  return normalized.split('/').pop() || normalized;
}
