import { createHash } from 'node:crypto';
import path from 'node:path';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { isDiscoveryWorkLeafEligible } from '../../../workspaces/workspace.materialRole.js';
import { schemaIdIsOrDescendsFrom } from '../../../schemas/resolver.js';

export const PORTABLE_REDUCTION_PREFLIGHT_SCHEMA_ID = 'tiinex.portable.reduction-preflight.v1';
export const PORTABLE_REDUCTION_COMPOSITION_SCHEMA_ID = 'tiinex.portable.reduction-composition.v1';
export const PORTABLE_REDUCTION_DESTRUCTIVE_ELIGIBILITY_SCHEMA_ID = 'tiinex.portable.reduction-destructive-eligibility.v1';
export const PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT = Object.freeze({
  id: 'tiinex.portable.reduction-destructive-eligibility.v1',
  version: 1,
  authority: 'shared-tooling-projection-contract',
  canonicalSchemaAuthorityChanged: false
});

export const GITHUB_IMMUTABLE_BLOB_RE = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([0-9a-f]{40})\/(.+)$/i;

export function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
export function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}

export function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '').trim(); }

export function resolveRecordReferencePath(recordPath = '', reference = '') {
  const raw = String(reference || '').trim();
  if (!raw) return '';
  const github = raw.match(GITHUB_IMMUTABLE_BLOB_RE);
  if (github) return normalizePath(github[4]);
  const workspaceQualified = raw.match(/^[a-z0-9._-]+::(.+)$/i);
  if (workspaceQualified) return normalizePath(workspaceQualified[1]);
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return linkPath(raw);
  const withoutFragment = raw.split('#')[0].split('?')[0].replace(/\\/g, '/');
  if (withoutFragment.startsWith('.topics/')) return normalizePath(withoutFragment);
  const baseDirectory = path.posix.dirname(normalizePath(recordPath));
  return normalizePath(path.posix.normalize(path.posix.join(baseDirectory, withoutFragment)));
}

export function safeCode(value = '') { return String(value || 'unresolved').toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, ''); }
export function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function linkPath(value = '') {
  const text = String(value || '').trim();
  const github = text.match(GITHUB_IMMUTABLE_BLOB_RE);
  if (github) return normalizePath(github[4]);
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
    try { return normalizePath(new URL(text).pathname); } catch { return ''; }
  }
  return normalizePath(text.split('#')[0].split('?')[0]);
}

export function identity(record = {}) {
  return Object.freeze({ id: String(record.id || record.path || ''), path: String(record.path || ''), title: String(record.title || ''), schemaId: String(record.schemaId || '') });
}

export function resolveUniqueRecord(records = [], requestedPath = '') {
  const wanted = normalizePath(requestedPath);
  if (!wanted) return Object.freeze({ state: 'missing', record: null });
  const exact = records.filter((record) => normalizePath(record.path) === wanted || normalizePath(record.id) === wanted);
  if (exact.length === 1) return Object.freeze({ state: 'exact', record: exact[0] });
  if (exact.length > 1) return Object.freeze({ state: 'ambiguous', record: null });
  const suffix = records.filter((record) => normalizePath(record.path).endsWith(`/${wanted}`));
  if (suffix.length === 1) return Object.freeze({ state: 'suffix', record: suffix[0] });
  return Object.freeze({ state: suffix.length > 1 ? 'ambiguous' : 'missing', record: null });
}

export function qualifyRecord(record = {}) {
  if (!record) return Object.freeze({ state: 'missing', qualified: false, reasons: Object.freeze(['record-missing']), audit: null });
  const audit = auditPortableRecord(record);
  const reasons = [];
  if (!record.hasContinuityContext) reasons.push('continuity-context-missing');
  if (!record.hasIntegrity) reasons.push('integrity-missing');
  if (audit.qualification?.exact !== true || audit.qualification?.moduleExact !== true) reasons.push('non-exact-schema-validation');
  if (audit.status !== 'readable') reasons.push(`audit-status:${audit.status || 'unknown'}`);
  if ((audit.findings || []).some((finding) => finding.severity === 'error')) reasons.push('audit-error');
  return Object.freeze({ state: reasons.length ? 'unresolved' : 'qualified', qualified: reasons.length === 0, reasons: Object.freeze(reasons), audit });
}

export function isReductionFamilySchemaId(schemaId = '') {
  return schemaIdIsOrDescendsFrom(String(schemaId || '').trim(), 'tiinex.reduction.v1');
}

export function qualifyReductionFamilyRecord(record = {}, records = []) {
  return qualifyReductionLikeRecord(record, records, { family: true });
}

export function qualifyReductionRecord(record = {}, records = []) {
  return qualifyReductionLikeRecord(record, records, { family: false });
}

function qualifyReductionLikeRecord(record = {}, records = [], options = {}) {
  if (!record) return Object.freeze({ qualified: false, state: 'missing', digest: '', parentPath: '', parent: null, reasons: Object.freeze(['reduction-artifact-missing']), audit: null });
  const base = qualifyRecord(record);
  const reasons = [...base.reasons];
  const schemaId = String(record.schemaId || '');
  const schemaQualified = options.family ? isReductionFamilySchemaId(schemaId) : schemaId === 'tiinex.reduction.v1';
  if (!schemaQualified) reasons.push(`schema:${schemaId || 'missing'}`);
  const parentPath = resolveRecordReferencePath(record.path || '', record.trace || '');
  const parentResolution = parentPath ? resolveUniqueRecord(records, parentPath) : { state: 'missing', record: null };
  if (!parentPath) reasons.push('reduction-parent-required');
  else if (parentResolution.state === 'ambiguous') reasons.push('reduction-parent-ambiguous');
  else if (!parentResolution.record) reasons.push('reduction-parent-not-loaded');
  else {
    const parentQualification = qualifyRecord(parentResolution.record);
    if (!isDiscoveryWorkLeafEligible(parentResolution.record)) reasons.push('reduction-parent-not-semantic-work-artifact');
    if (!parentQualification.qualified) reasons.push('reduction-parent-unqualified');
  }
  return Object.freeze({
    qualified: reasons.length === 0,
    state: reasons.length ? 'unresolved' : 'qualified',
    digest: sha256Text(record.markdown || ''),
    parentPath,
    parent: parentResolution.record ? identity(parentResolution.record) : null,
    reasons: Object.freeze([...new Set(reasons)]),
    audit: base.audit
  });
}

export function sectionText(markdown = '', heading = '') {
  const source = String(markdown || '');
  const name = escapeRegExp(heading);
  return String(source.match(new RegExp(`(?:^|\\n)##\\s+${name}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+|$)`, 'i'))?.[1] || '').trim();
}

export function markdownLinks(markdown = '') {
  return Object.freeze([...String(markdown || '').matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => Object.freeze({ label: String(match[1] || '').trim(), target: String(match[2] || '').trim(), path: linkPath(match[2] || '') })));
}

export function parseReductionEntries(markdown = '') {
  const section = String(markdown || '').match(/###\s+Reduced Leaves\s*\/\s*Expansion Boundary\s*\n([\s\S]*?)(?=\n##\s|\n#\s|$)/i)?.[1] || '';
  if (!section) return Object.freeze([]);
  const starts = [...section.matchAll(/^\s*-\s+\*\*(.+?)\*\*\s*$/gm)];
  const entries = [];
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index].index ?? 0;
    const end = index + 1 < starts.length ? starts[index + 1].index ?? section.length : section.length;
    const block = section.slice(start, end);
    const leaf = parseLabeledLink(block, 'Leaf');
    const collapse = parseLabeledLink(block, 'Collapse To');
    entries.push(Object.freeze({
      title: String(starts[index][1] || '').trim(),
      leafLabel: leaf.label,
      leafTarget: leaf.target,
      leafPath: linkPath(leaf.target || leaf.label),
      collapseToLabel: collapse.label,
      collapseToTarget: collapse.target,
      collapseToPath: linkPath(collapse.target || collapse.label),
      disposition: labeledCodeOrText(block, 'Disposition'),
      reason: labeledText(block, 'Why'),
      scope: labeledText(block, 'Expansion Span') || labeledText(block, 'Scope')
    }));
  }
  return Object.freeze(entries);
}

function parseLabeledLink(block, label) {
  const match = block.match(new RegExp(`^\\s*-\\s+${escapeRegExp(label)}:\\s+\\[([^\\]]+)\\]\\(([^)]+)\\)\\s*$`, 'im'));
  return Object.freeze({ label: String(match?.[1] || '').trim(), target: String(match?.[2] || '').trim() });
}
function labeledCodeOrText(block, label) { return labeledText(block, label).replace(/^`|`$/g, '').trim(); }
function labeledText(block, label) { return String(block.match(new RegExp(`^\\s*-\\s+${escapeRegExp(label)}:\\s+(.+?)\\s*$`, 'im'))?.[1] || '').trim(); }

export function locatorFromValue(value = {}) {
  if (typeof value === 'string') {
    const github = value.match(GITHUB_IMMUTABLE_BLOB_RE);
    if (!github) return unqualifiedLocator('immutable-locator-unqualified');
    return Object.freeze({ qualified: true, contentQualified: false, state: 'immutable-git', provider: 'github', repository: `${github[1]}/${github[2]}`, commit: github[3].toLowerCase(), workspace: '', path: normalizePath(github[4]), permalink: value, digest: '', basis: 'explicit-commit-pinned-permalink', evidenceQualification: 'unresolved', blocker: 'immutable-content-binding-unresolved' });
  }
  const repository = String(value.repository || value.repo || '').trim();
  const commit = String(value.commit || value.sha || value.ref || '').trim().toLowerCase();
  const workspace = String(value.workspace || value.workspaceId || '').trim();
  const sourcePath = normalizePath(value.path || value.sourcePath || '');
  const permalink = String(value.permalink || value.url || '').trim();
  const digest = String(value.digest || value.sha256 || '').replace(/^sha256:/, '').trim().toLowerCase();
  const immutable = value.immutable === true || /^[0-9a-f]{40}$/i.test(commit);
  const addressQualified = Boolean(immutable && /^[0-9a-f]{40}$/i.test(commit) && repository && sourcePath);
  const evidenceQualification = String(value.qualification || value.semanticState || '').trim();
  const basis = value.basis || '';
  const contentQualified = Boolean(addressQualified && /^[0-9a-f]{64}$/i.test(digest) && evidenceQualification === 'qualified' && nonEmptyBasis(basis));
  return Object.freeze({ qualified: addressQualified, contentQualified, state: addressQualified ? 'immutable-git' : 'unqualified', provider: String(value.provider || 'explicit'), repository, commit, workspace, path: sourcePath, permalink, digest, basis, evidenceQualification, blocker: !addressQualified ? 'immutable-locator-unqualified' : contentQualified ? '' : 'immutable-content-binding-unresolved' });
}

export function locatorVerifiesRecord(locator = {}, record = {}) {
  if (!locator?.qualified || locator?.contentQualified !== true || !record?.markdown) return false;
  return String(locator.digest || '').toLowerCase() === sha256Text(record.markdown || '').toLowerCase();
}

export function sameImmutableLocatorIdentity(left = {}, right = {}) {
  return Boolean(left?.qualified && right?.qualified
    && String(left.repository || '') === String(right.repository || '')
    && String(left.commit || '').toLowerCase() === String(right.commit || '').toLowerCase()
    && samePath(left.path || '', right.path || ''));
}

export function locatorForRecord(record = {}, supplied = []) {
  const wanted = new Set([normalizePath(record.path), path.basename(normalizePath(record.path))].filter(Boolean));
  const explicit = supplied.find((item) => wanted.has(normalizePath(item.path || item.candidatePath || item.target || '')) || wanted.has(path.basename(normalizePath(item.path || item.candidatePath || item.target || ''))));
  if (explicit) return locatorFromValue(explicit);
  const source = record.source || {};
  if (source.repository && /^[0-9a-f]{40}$/i.test(String(source.commit || source.ref || '')) && source.path) {
    const acceptedPinnedHostReceipt = source.receiptQualification === 'accepted-host-repository-read' && source.provenanceQualification === 'accepted-host-repository-pinned';
    return locatorFromValue({
      repository: source.repository,
      commit: source.commit || source.ref,
      workspace: source.workspace || '',
      path: source.path,
      immutable: true,
      permalink: source.permalink || '',
      digest: acceptedPinnedHostReceipt ? sha256Text(record.markdown || '') : (source.sha256 || source.digest || ''),
      qualification: acceptedPinnedHostReceipt ? 'qualified' : (source.qualification || source.semanticState || source.provenanceQualification || ''),
      basis: acceptedPinnedHostReceipt ? 'accepted pinned host repository-read receipt bound to supplied record bytes' : (source.boundary || source.basis || 'explicit-record-source')
    });
  }
  return unqualifiedLocator('immutable-locator-missing');
}

export function locatorMatchesRecord(locator = {}, record = {}) {
  if (!locator?.qualified || !record) return false;
  const recordPath = normalizePath(record.path || '');
  return Boolean(recordPath === normalizePath(locator.path) || recordPath.endsWith(`/${normalizePath(locator.path)}`) || path.basename(recordPath) === path.basename(normalizePath(locator.path)));
}

export function samePath(a = '', b = '') {
  const left = normalizePath(a); const right = normalizePath(b);
  return Boolean(left && right && (left === right || left.endsWith(`/${right}`) || right.endsWith(`/${left}`)));
}

function unqualifiedLocator(blocker) { return Object.freeze({ qualified: false, contentQualified: false, state: 'missing', provider: '', repository: '', commit: '', workspace: '', path: '', permalink: '', digest: '', basis: '', evidenceQualification: 'unresolved', blocker }); }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
