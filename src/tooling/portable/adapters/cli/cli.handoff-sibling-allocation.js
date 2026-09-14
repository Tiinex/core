import { mkdir, open, readFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_SIBLING_INDEX = 9999;
const POINTER_PATH_RE = /^(\d{3}(?:-\d+)*)-handoff-pointer\.trace\.md$/;

export function deriveHandoffSiblingAllocation({ parentInspection = null, selectedRoutePointer = '', selectedRouteId = '', explicitSiblingIndex = null, parentPackagePath = '', parentPackageSha256 = '', parentDimension = '' } = {}) {
  const explicit = normalizeSiblingIndex(explicitSiblingIndex);
  const inspection = parentInspection && typeof parentInspection === 'object' ? parentInspection : null;
  if (!inspection || inspection.detected === false) return freeze({
    state: 'unavailable',
    siblingIndex: explicit || null,
    allocationMode: explicit ? 'explicit-override-only' : 'unavailable',
    reasonCode: 'qualified-parent-route-topology-unavailable',
    provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
    boundary: allocationBoundary()
  });
  if (String(inspection.status || '') !== 'valid') return freeze({
    state: 'blocked',
    siblingIndex: null,
    allocationMode: 'blocked',
    reasonCode: 'qualified-parent-route-topology-invalid',
    provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
    boundary: allocationBoundary()
  });

  const routes = [...(inspection.routes || [])].map((route) => ({
    pointerPath: String(route.pointerPath || '').trim(),
    routeId: String(route.routeId || '').trim(),
    workspaceId: String(route.workspaceId || '').trim(),
    workspaceRelativeHandoffPath: String(route.workspaceRelativeHandoffPath || '').trim()
  }));
  if (!routes.length) return blocked('qualified-parent-route-topology-empty');

  const qualified = [];
  const seenDimensions = new Set();
  for (const route of routes) {
    const match = route.pointerPath.match(POINTER_PATH_RE);
    if (!match) return blocked('qualified-parent-route-pointer-order-unresolved');
    const dimension = match[1];
    if (seenDimensions.has(dimension)) return blocked('qualified-parent-route-pointer-order-ambiguous');
    seenDimensions.add(dimension);
    qualified.push({ ...route, pointerDimension: dimension, pointerSegments: dimension.split('-').map((value) => Number.parseInt(value, 10)) });
  }
  qualified.sort(comparePointerOrder);

  const pointerSelector = String(selectedRoutePointer || '').trim();
  const routeIdSelector = String(selectedRouteId || '').trim();
  let selected = null;
  if (pointerSelector) {
    const matches = qualified.filter((route) => route.pointerPath === pointerSelector);
    if (matches.length !== 1) return blocked(matches.length ? 'selected-parent-route-pointer-ambiguous' : 'selected-parent-route-pointer-unqualified');
    selected = matches[0];
  }
  if (routeIdSelector) {
    const matches = qualified.filter((route) => route.routeId === routeIdSelector);
    if (matches.length !== 1) return blocked(matches.length ? 'selected-parent-route-id-ambiguous' : 'selected-parent-route-id-unqualified');
    if (selected && selected.pointerPath !== matches[0].pointerPath) return blocked('selected-parent-route-selector-conflict');
    selected = matches[0];
  }
  if (!selected) {
    if (qualified.length !== 1) return blocked('selected-parent-route-required-for-parallel-topology');
    selected = qualified[0];
  }

  const siblingIndex = qualified.findIndex((route) => route.pointerPath === selected.pointerPath) + 1;
  if (!Number.isInteger(siblingIndex) || siblingIndex < 1 || siblingIndex > MAX_SIBLING_INDEX) return blocked('derived-sibling-index-out-of-range');
  if (explicit && explicit !== siblingIndex) return blocked('explicit-sibling-index-conflicts-with-qualified-topology', { expectedSiblingIndex: siblingIndex });

  return freeze({
    state: 'qualified',
    siblingIndex,
    childDimension: parentDimension ? `${String(parentDimension).trim()}-${siblingIndex}` : '',
    allocationMode: 'qualified-parent-route-pointer-ordinal',
    explicitOverride: explicit ? 'matched-derived-value' : 'not-supplied',
    reasonCode: '',
    provenance: {
      ...provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
      basis: 'qualified-parent-route-pointer-ordinal',
      selectedRoutePointer: selected.pointerPath,
      selectedRouteId: selected.routeId,
      selectedWorkspaceId: selected.workspaceId,
      selectedWorkspaceRelativeHandoffPath: selected.workspaceRelativeHandoffPath,
      routeOrdinal: siblingIndex,
      qualifiedRouteCount: qualified.length,
      pointerOrder: qualified.map((route, index) => Object.freeze({ ordinal: index + 1, pointerPath: route.pointerPath, routeId: route.routeId }))
    },
    boundary: allocationBoundary()
  });

  function blocked(reasonCode, extra = {}) {
    return freeze({
      state: 'blocked', siblingIndex: null, allocationMode: 'blocked', reasonCode, ...extra,
      provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
      boundary: allocationBoundary()
    });
  }
}

export async function resolveHandoffSiblingAllocation(input = {}) {
  const derived = deriveHandoffSiblingAllocation(input);
  if (derived.state === 'qualified') return derived;
  if (derived.state === 'blocked') throw new Error(`portable.cli.handoff-carrier.sibling-allocation.${derived.reasonCode}`);
  const explicit = normalizeSiblingIndex(input.explicitSiblingIndex ?? input.siblingIndex);
  if (!explicit) throw new Error('portable.cli.handoff-carrier.sibling-allocation.explicit-index-required-when-topology-unavailable');
  const legacy = await reserveHandoffSiblingIndex({
    parentPackagePath: input.parentPackagePath,
    parentPackageSha256: input.parentPackageSha256,
    parentDimension: input.parentDimension,
    enabled: input.enabled !== false,
    siblingIndex: explicit
  });
  return freeze({
    ...legacy,
    allocationMode: 'explicit-advanced-override',
    explicitOverride: 'required-because-qualified-topology-unavailable',
    provenance: {
      ...provenanceBase({ ...input, explicitSiblingIndex: explicit }),
      basis: 'explicit-advanced-override-without-qualified-route-topology'
    },
    boundary: allocationBoundary()
  });
}

export async function reserveHandoffSiblingIndex({ parentPackagePath = '', parentPackageSha256 = '', parentDimension = '', enabled = true, siblingIndex = null } = {}) {
  const requestedSiblingIndex = normalizeSiblingIndex(siblingIndex);
  if (!enabled) return Object.freeze({ state: 'not-reserved', siblingIndex: requestedSiblingIndex || 1, allocationPath: '', coordinationRequired: Boolean(requestedSiblingIndex) });
  if (!requestedSiblingIndex) throw new Error('portable.cli.handoff-carrier.sibling-allocation.explicit-index-required');
  const parentPath = path.resolve(String(parentPackagePath || ''));
  const digest = String(parentPackageSha256 || '').trim().toLowerCase();
  const dimension = String(parentDimension || '').trim();
  if (!parentPath || !/^[0-9a-f]{64}$/.test(digest) || !/^\d{3}(?:-\d+)*$/.test(dimension)) throw new Error('portable.cli.handoff-carrier.sibling-allocation.parent-unqualified');
  const allocationDir = path.join(path.dirname(parentPath), '.tiinex-handoff-sibling-allocations');
  await mkdir(allocationDir, { recursive: true });
  const key = `${digest.slice(0, 24)}-${dimension.replace(/[^0-9-]/g, '')}`;
  const allocationPath = path.join(allocationDir, `${key}-${requestedSiblingIndex}.allocation`);
  const record = Object.freeze({
    parentPackageSha256: digest,
    parentDimension: dimension,
    siblingIndex: requestedSiblingIndex,
    childDimension: `${dimension}-${requestedSiblingIndex}`,
    allocationAuthority: 'explicit-caller-coordination'
  });
  try {
    const handle = await open(allocationPath, 'wx');
    try { await handle.writeFile(`${JSON.stringify(record)}\n`, 'utf8'); }
    finally { await handle.close(); }
    return Object.freeze({ state: 'reserved-explicit', siblingIndex: requestedSiblingIndex, allocationPath, coordinationRequired: true });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const prior = await readAllocation(allocationPath);
    if (!sameAllocation(prior, record)) throw new Error('portable.cli.handoff-carrier.sibling-allocation.existing-reservation-conflict');
    return Object.freeze({ state: 'reused-explicit', siblingIndex: requestedSiblingIndex, allocationPath, coordinationRequired: true });
  }
}

function comparePointerOrder(left, right) {
  const a = left.pointerSegments || [], b = right.pointerSegments || [];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (a[index] === undefined) return -1;
    if (b[index] === undefined) return 1;
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return left.pointerPath.localeCompare(right.pointerPath);
}

function provenanceBase({ parentPackagePath = '', parentPackageSha256 = '', parentDimension = '', explicitSiblingIndex = null } = {}) {
  return {
    parentPackagePath: String(parentPackagePath || ''),
    parentPackageSha256: String(parentPackageSha256 || '').trim().toLowerCase(),
    parentDimension: String(parentDimension || '').trim(),
    explicitSiblingIndex: explicitSiblingIndex ? normalizeSiblingIndex(explicitSiblingIndex) : null
  };
}
function allocationBoundary() { return 'Transport-only carrier allocation. A non-Major sibling ordinal may come only from exact qualified package-local Handoff Pointer order for the selected parent route, or from an explicit advanced override when such topology is unavailable. Allocation never creates semantic Parent, Workspace, Role, acceptance, completion, participant, process, or source authority; different carrier prefixes are not coordinated.'; }
function normalizeSiblingIndex(value) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_SIBLING_INDEX) throw new Error('portable.cli.handoff-carrier.sibling-allocation.index-invalid');
  return parsed;
}
async function readAllocation(allocationPath) {
  try { return JSON.parse(await readFile(allocationPath, 'utf8')); }
  catch { throw new Error('portable.cli.handoff-carrier.sibling-allocation.existing-reservation-invalid'); }
}
function sameAllocation(left = {}, right = {}) {
  return String(left.parentPackageSha256 || '') === String(right.parentPackageSha256 || '')
    && String(left.parentDimension || '') === String(right.parentDimension || '')
    && Number(left.siblingIndex || 0) === Number(right.siblingIndex || 0)
    && String(left.childDimension || '') === String(right.childDimension || '');
}
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
