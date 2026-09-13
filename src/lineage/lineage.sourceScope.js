import { canonicalPath, githubFileIdentityFromUrl, normalizeRef, normalizeRepoKey } from './lineage.targetKeys.js';

export function exactPathMatches(path, index, constraint = {}, strictSource = false) {
  const source = [
    ...(index.byPath.get(canonicalPath(path)) || []),
    ...(index.bySourcePath.get(canonicalPath(path)) || [])
  ];
  return uniqueNodes(filterBySource(source, constraint, strictSource));
}

export function findPathSuffixMatches(targetPath, pathIndex = new Map(), constraint = {}, strictSource = false) {
  const path = canonicalPath(targetPath);
  if (!path || !path.includes('/')) return [];
  let bestLength = -1;
  let matches = [];
  for (const [candidatePath, nodes] of pathIndex.entries()) {
    if (!candidatePath || path === candidatePath) continue;
    if (!(path.endsWith(`/${candidatePath}`) || path.endsWith(candidatePath) || candidatePath.endsWith(`/${path}`) || candidatePath.endsWith(path))) continue;
    const filtered = filterBySource(nodes, constraint, strictSource);
    if (!filtered.length) continue;
    if (candidatePath.length > bestLength) {
      bestLength = candidatePath.length;
      matches = filtered.slice();
    } else if (candidatePath.length === bestLength) matches.push(...filtered);
  }
  return uniqueNodes(matches);
}

export function sourceConstraintFromNode(node = {}) {
  const record = node?.record || node || {};
  const source = record.source || {};
  const provenance = sourceIdentityFromRecord(record);
  const sourceId = String(source.id || '').trim();
  const adapterId = String(source.adapterId || source.adapter || provenance.adapterId || '').trim().toLowerCase();
  const repo = normalizeRepoKey(source.repo || source.repository || source.config?.repo || provenance.repo || '');
  const ref = normalizeRef(source.commit || source.ref || source.config?.commit || source.config?.ref || provenance.ref || '');
  const isLocal = adapterId === 'local' || sourceId === 'local' || source.kind === 'local-session';
  if (isLocal && !repo && !ref) return { hasConstraint: false, sourceId: '', repo: '', ref: '', adapterId: '', exactRef: false };
  return { hasConstraint: Boolean(sourceId || repo || adapterId || ref), sourceId, repo, ref, adapterId, exactRef: Boolean(ref) };
}

export function sourceConstraintFromTarget(value = '') {
  const identity = githubFileIdentityFromUrl(value);
  if (identity.repo) return { hasConstraint: true, repo: identity.repo, ref: identity.ref, sourceId: '', adapterId: 'github', exactRef: Boolean(identity.ref) };
  const key = normalizeRepoKey(value);
  return { hasConstraint: Boolean(key), repo: key, ref: '', sourceId: '', adapterId: key ? 'github' : '', exactRef: false };
}

function sourceIdentityFromRecord(record = {}) {
  const sourceTarget = record.sourceTarget || {};
  const snapshot = record.snapshot || {};
  const target = snapshot.target || {};
  const values = [
    record.recoveredFromUrl,
    record.sourceOrigin,
    record.rawUrl,
    record.browseUrl,
    sourceTarget.inputTarget,
    sourceTarget.rawUrl,
    sourceTarget.browseUrl,
    snapshot.sourceUrl,
    target.canonicalUrl,
    target.html_url,
    target.url
  ];
  for (const value of values) {
    const identity = githubFileIdentityFromUrl(value);
    if (identity.repo) return { ...identity, adapterId: 'github' };
  }
  return { repo: '', ref: '', path: '', adapterId: '' };
}

function filterBySource(nodes = [], constraint = {}, strictSource = false) {
  const items = Array.isArray(nodes) ? nodes : [];
  if (!constraint?.hasConstraint) return items;
  const filtered = items.filter((node) => nodeMatchesSourceConstraint(node, constraint));
  if (filtered.length) return filtered;
  if (strictSource && !constraint.ref && items.length && items.every((node) => !sourceConstraintFromNode(node).hasConstraint)) return items;
  return [];
}

function nodeMatchesSourceConstraint(node = {}, constraint = {}) {
  const candidate = sourceConstraintFromNode(node);
  if (constraint.sourceId && candidate.sourceId && constraint.sourceId !== candidate.sourceId) return false;
  if (constraint.adapterId && candidate.adapterId && constraint.adapterId !== candidate.adapterId) return false;
  if (constraint.repo && candidate.repo !== constraint.repo) return false;
  if (constraint.ref && candidate.ref !== constraint.ref) return false;
  if (constraint.repo && !candidate.repo) return false;
  if (constraint.adapterId && !candidate.adapterId) return false;
  return true;
}

function uniqueNodes(nodes = []) {
  const seen = new Set();
  const out = [];
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const key = node?.id || node?.path || JSON.stringify(node || {});
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(node);
  }
  return out;
}
