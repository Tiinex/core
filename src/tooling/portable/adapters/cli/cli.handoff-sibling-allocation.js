import { mkdir, open, readFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveHandoffConsolidationAllocation, deriveHandoffSiblingAllocation } from '../../handoff/carrierContinuationProjection.js';

export { deriveHandoffConsolidationAllocation, deriveHandoffSiblingAllocation } from '../../handoff/carrierContinuationProjection.js';

const MAX_SIBLING_INDEX = 9999;

export async function resolveHandoffSiblingAllocation(input = {}) {
  const consolidation = input.consolidation === true;
  const derived = consolidation ? deriveHandoffConsolidationAllocation(input) : deriveHandoffSiblingAllocation(input);
  if (derived.state === 'qualified') return derived;
  if (derived.state === 'blocked') throw new Error(`portable.cli.handoff-carrier.sibling-allocation.${derived.reasonCode}`);
  if (consolidation) throw new Error('portable.cli.handoff-carrier.sibling-allocation.qualified-parent-route-topology-required-for-consolidation');
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

function provenanceBase({ parentPackagePath = '', parentPackageSha256 = '', parentDimension = '', explicitSiblingIndex = null } = {}) {
  return {
    parentPackagePath: String(parentPackagePath || ''),
    parentPackageSha256: String(parentPackageSha256 || '').trim().toLowerCase(),
    parentDimension: String(parentDimension || '').trim(),
    explicitSiblingIndex: explicitSiblingIndex ? normalizeSiblingIndex(explicitSiblingIndex) : null
  };
}
function consolidationBoundary() { return 'Transport-only carrier consolidation allocation. The consolidation sibling is exactly N+1 for N qualified Handoff routes on the common pre-batch carrier frontier. It is never derived from one specialist return, arrival order, retries, output collisions, local allocation files or artifact Parent lineage; explicit Major stabilization remains separate.'; }
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
