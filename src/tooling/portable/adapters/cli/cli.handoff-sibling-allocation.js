import { mkdir, open, readFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_SIBLING_INDEX = 9999;

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
