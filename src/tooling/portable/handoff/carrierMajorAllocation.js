import { normalizeHandoffCarrierPrefix } from './carrierLineage.js';

export const HANDOFF_CARRIER_MAJOR_ALLOCATION_SCHEMA_ID = 'tiinex.portable.handoff-carrier-major-allocation.v1';

/**
 * Allocate the next carrier Major for a transport prefix. Major allocation is
 * monotonic: gaps are never reused. Carrier Parent is optional and is handled
 * separately by lineage/continuation qualification.
 */
export function projectHandoffCarrierMajorAllocation(input = {}) {
  let prefix = '';
  try { prefix = normalizeHandoffCarrierPrefix(input.prefix || ''); }
  catch { return result('blocked', 'prefix-invalid', '', 0, '', []); }
  if (!prefix) return result('blocked', 'prefix-required', prefix, 0, '', []);

  const observed = [];
  for (const value of Array.isArray(input.existingFilenames) ? input.existingFilenames : []) {
    const parsed = parseTransportMajor(value);
    if (parsed && parsed.prefix === prefix) observed.push(parsed);
  }
  const parent = parseTransportMajor(input.parentFilename || '');
  if (parent && parent.prefix === prefix) observed.push(parent);

  const highestObservedMajor = observed.length ? Math.max(...observed.map((item) => item.major)) : 0;
  const nextMajor = highestObservedMajor + 1;
  if (nextMajor > 999) return result('blocked', 'transport-major-exhausted', prefix, highestObservedMajor, '', observed);
  return result('ready', '', prefix, highestObservedMajor, String(nextMajor).padStart(3, '0'), observed);
}

function parseTransportMajor(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  return parseHandoffCarrierTransportMajor(raw);
}

/**
 * Parse the monotonic Major coordinate from a transport filename without
 * consulting carrier lineage. Collision suffixes such as ` (1)` are still
 * observations of the same Major and therefore must not create a reusable gap.
 */
export function parseHandoffCarrierTransportMajor(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const filename = raw.replace(/\\/g, '/').split('/').pop() || raw;
  const stem = filename.replace(/\.handoff-package\.zip$/i, '');
  const prefixed = stem.match(/^(.*?)-(\d{3})(?=(?:-|(?: \(\d+\))?$))/);
  if (prefixed) {
    const prefix = String(prefixed[1] || '').trim().toLocaleLowerCase();
    const major = Number.parseInt(prefixed[2], 10);
    return prefix && Number.isInteger(major) ? { prefix, major } : null;
  }
  const bare = stem.match(/^(\d{3})(?=(?:-|(?: \(\d+\))?$))/);
  if (bare) return { prefix: '', major: Number.parseInt(bare[1], 10) };
  return null;
}

function result(state, reasonCode, prefix, highestObservedMajor, nextMajorDimension, observed) {
  return Object.freeze({
    schema: HANDOFF_CARRIER_MAJOR_ALLOCATION_SCHEMA_ID,
    status: state === 'ready' ? 'ready' : 'blocked',
    state,
    reasonCode,
    prefix,
    highestObservedMajor,
    nextMajorDimension,
    parentOptional: true,
    observed: Object.freeze(observed.map((item) => Object.freeze({ ...item }))),
    boundary: 'Carrier Major allocation is monotonic per transport prefix and independent from carrier Parent qualification. A Parent may be supplied separately for continuity, but missing Parent does not block Major allocation. Gaps are never reused; the next Major is highest observed Major plus one.'
  });
}
