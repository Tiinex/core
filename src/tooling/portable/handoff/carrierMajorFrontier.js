import { normalizeHandoffCarrierPrefix } from './carrierLineage.js';

export const HANDOFF_CARRIER_MAJOR_FRONTIER_SCHEMA_ID = 'tiinex.portable.handoff-carrier-major-frontier.v1';

/**
 * Select the one qualified same-prefix carrier frontier that may be advanced as
 * an explicit Major. Hosts supply observed candidate files plus Core-projected
 * lineage; Core owns the lineage ordering/ambiguity semantics.
 */
export function projectHandoffCarrierMajorFrontier(input = {}) {
  let prefix = '';
  try { prefix = normalizeHandoffCarrierPrefix(input.prefix || ''); }
  catch {
    return result('blocked', 'prefix-invalid', '', [], null);
  }
  if (!prefix) return result('blocked', 'prefix-required', prefix, [], null);

  const candidates = [...(Array.isArray(input.candidates) ? input.candidates : [])]
    .map((candidate, index) => normalizeCandidate(candidate, index))
    .filter((candidate) => candidate && candidate.prefix === prefix);
  if (!candidates.length) return result('none', '', prefix, [], null);

  const highestMajor = Math.max(...candidates.map((candidate) => candidate.major));
  const frontier = candidates.filter((candidate) => candidate.major === highestMajor);
  const uniqueDimensions = [...new Set(frontier.map((candidate) => candidate.dimension))];
  uniqueDimensions.sort(compareDimensionDepthDesc);
  const headDimension = uniqueDimensions[0] || '';
  if (!headDimension) return result('blocked', 'dimension-unresolved', prefix, frontier, null);

  const incompatible = uniqueDimensions.find((dimension) => !chainCompatible(headDimension, dimension));
  if (incompatible) return result('ambiguous', 'parallel-major-frontiers', prefix, frontier, null);

  const headCandidates = frontier.filter((candidate) => candidate.dimension === headDimension);
  const hashes = new Set(headCandidates.map((candidate) => candidate.packageSha256).filter(Boolean));
  const exactDuplicateBytesEstablished = headCandidates.every((candidate) => Boolean(candidate.packageSha256)) && hashes.size === 1;
  if (headCandidates.length > 1 && !exactDuplicateBytesEstablished) {
    return result('ambiguous', 'duplicate-frontier-bytes-unresolved', prefix, frontier, null);
  }

  headCandidates.sort((a, b) => a.packagePath.localeCompare(b.packagePath) || a.filename.localeCompare(b.filename));
  const selected = headCandidates[0];
  return result('ready', '', prefix, frontier, selected);
}

function normalizeCandidate(value = {}, index = 0) {
  const lineage = value.carrierLineage || value.lineage || {};
  let prefix = '';
  try { prefix = normalizeHandoffCarrierPrefix(lineage.prefix || value.prefix || ''); }
  catch { return null; }
  const dimension = String(lineage.dimension || value.dimension || '').trim();
  const match = dimension.match(/^(\d{3})(?:-\d+)*$/);
  if (!prefix || !match) return null;
  const major = Number.parseInt(match[1], 10);
  if (!Number.isInteger(major) || major < 1 || major > 999) return null;
  const packageSha256 = normalizeSha256(value.packageSha256 || value.sha256 || '');
  return Object.freeze({
    index,
    packagePath: String(value.packagePath || value.path || '').trim(),
    filename: String(value.filename || '').trim(),
    packageSha256,
    prefix,
    dimension,
    major
  });
}

function result(state, reasonCode, prefix, candidates, selected) {
  const nextMajorDimension = selected && selected.major < 999 ? String(selected.major + 1).padStart(3, '0') : '';
  return Object.freeze({
    schema: HANDOFF_CARRIER_MAJOR_FRONTIER_SCHEMA_ID,
    status: state === 'ready' || state === 'none' ? 'ready' : 'blocked',
    state,
    reasonCode,
    prefix,
    candidates: Object.freeze(candidates.map((candidate) => Object.freeze({ ...candidate }))),
    selected: selected ? Object.freeze({ ...selected }) : null,
    nextMajorDimension,
    boundary: 'Hosts discover candidate files and exact stored-byte hashes. Core owns same-prefix carrier lineage ordering, parallel-frontier ambiguity, and the selected Major parent. Final manufacture must still requalify the exact selected parent package bytes.'
  });
}

function compareDimensionDepthDesc(a, b) {
  const aa = a.split('-').map(Number);
  const bb = b.split('-').map(Number);
  if (aa.length !== bb.length) return bb.length - aa.length;
  for (let i = 0; i < Math.max(aa.length, bb.length); i += 1) {
    const delta = (bb[i] || 0) - (aa[i] || 0);
    if (delta) return delta;
  }
  return a.localeCompare(b);
}

function chainCompatible(a, b) {
  return a === b || a.startsWith(`${b}-`) || b.startsWith(`${a}-`);
}

function normalizeSha256(value = '') {
  const text = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(text) ? text : '';
}
