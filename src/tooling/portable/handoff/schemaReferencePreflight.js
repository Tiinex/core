import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState, verifyC14nV2TargetSelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { historicalDeclaredSchemaReferenceAuthority } from '../../../schemas/schema.reference.js';
import { runAudit } from '../../../audit/audit.run.js';
import { summarizePortableFindings } from '../findings.js';

export const PORTABLE_HANDOFF_SCHEMA_REFERENCE_PREFLIGHT_SCHEMA_ID = 'tiinex.portable.handoff-schema-reference-preflight.v1';

export function qualifyPortableManufactureSchemaReferenceCandidate(record = {}, options = {}) {
  const markdown = String(record.markdown || '');
  const path = String(record.path || record.id || '');
  const audit = runAudit({
    record: Object.freeze({ ...record, path, markdown }),
    markdown,
    schemaReferenceAuthorities: options.schemaReferenceAuthorities || record.schemaReferenceAuthorities || null,
    schemaReferenceContext: 'candidate',
    schemaReferenceResolutions: options.schemaReferenceResolutions || record.schemaReferenceResolutions || []
  });
  const findings = Object.freeze((audit.findings || []).filter((finding) => String(finding?.code || '').startsWith('schema.reference.')));
  const findingSummary = summarizePortableFindings(findings);
  const blocked = Number(findingSummary?.counts?.error || 0) > 0;
  return Object.freeze({
    schema: PORTABLE_HANDOFF_SCHEMA_REFERENCE_PREFLIGHT_SCHEMA_ID,
    state: blocked ? 'blocked' : 'qualified',
    status: blocked ? 'blocked' : findingSummary?.counts?.warning ? 'degraded' : 'ready',
    path,
    findings,
    findingSummary,
    boundary: 'Prospective manufacture gate for the actively selected local Handoff candidate only. Existing/historical carried Workspace artifacts remain preservation inputs and are not reclassified as new candidates by package carriage.'
  });
}

export function projectPortableManufactureSchemaReferenceAuthorities(record = {}, options = {}) {
  const markdown = String(record.markdown || '');
  const childPath = normalizeInnerPath(record.path || record.id || '');
  if (!markdown || !childPath) return Object.freeze({});
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); } catch { return Object.freeze({}); }
  const parent = parsed?.envelope?.parent || null;
  if (!parent?.schema?.id) return Object.freeze({});
  const resolved = resolveExactLocalParent({ childPath, parent, entries: options.workspaceEntries || options.entries || [] });
  if (!resolved) return Object.freeze({});
  const self = canonicalC14nV2SelfState(resolved.markdown);
  if (self.state !== 'verified') return Object.freeze({});
  const targetEntry = resolveParentIntegrityEntry(parsed, parent);
  if (!targetEntry) return Object.freeze({});
  const integrity = verifyC14nV2TargetSelfDigest({ value: targetEntry.value, targetMarkdown: resolved.markdown });
  if (integrity.state !== 'verified') return Object.freeze({});
  let parentParsed;
  try { parentParsed = parseArtifactMarkdown(resolved.markdown); } catch { return Object.freeze({}); }
  const currentSchema = parentParsed?.envelope?.current?.schema || {};
  const schemaId = String(currentSchema.id || '').trim();
  if (!schemaId) return Object.freeze({});
  const target = String(currentSchema.target || '').trim();
  return Object.freeze({
    parent: historicalDeclaredSchemaReferenceAuthority(schemaId, target, {
      basis: target ? 'exact-local-parent-current-schema-reference' : 'exact-local-parent-current-schema-identifier',
      parentPath: resolved.path,
      parentIntegrity: String(targetEntry.value || '')
    })
  });
}

function resolveExactLocalParent({ childPath = '', parent = {}, entries = [] } = {}) {
  const refs = [String(parent.trace || ''), ...(parent.originEntries || []).filter((entry) => String(entry?.label || '').trim() === 'relative').map((entry) => String(entry?.target || ''))].filter(Boolean);
  const index = new Map();
  for (const raw of entries) {
    const entryPath = normalizeInnerPath(raw?.path || raw?.innerPath || '');
    if (!entryPath || index.has(entryPath)) continue;
    index.set(entryPath, raw);
  }
  const candidates = new Map();
  for (const ref of refs) {
    const resolvedPath = resolveRelativeReference(childPath, ref);
    if (!resolvedPath) continue;
    const entry = index.get(resolvedPath);
    if (!entry) continue;
    const markdown = decodeUtf8(entry.data);
    if (!markdown) continue;
    candidates.set(resolvedPath, Object.freeze({ path: resolvedPath, markdown }));
  }
  return candidates.size === 1 ? [...candidates.values()][0] : null;
}

function resolveParentIntegrityEntry(parsed = {}, parent = {}) {
  const entries = (parsed?.integrity?.entries || []).filter((entry) => String(entry?.method || '') === 'sha256-base64url-c14n-v2' && String(entry?.towards || '') !== 'self');
  const refs = new Set([String(parent.trace || ''), ...(parent.originEntries || []).map((entry) => String(entry?.target || ''))].filter(Boolean));
  const matches = entries.filter((entry) => refs.has(String(entry?.towards || '')));
  if (matches.length === 1) return matches[0];
  return entries.length === 1 ? entries[0] : null;
}

function resolveRelativeReference(fromPath = '', reference = '') {
  const base = normalizeInnerPath(fromPath);
  const raw = String(reference || '').trim();
  if (!base || !raw || raw.includes('::') || /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return '';
  let clean;
  try { clean = decodeURIComponent(raw.split('#')[0].split('?')[0]); } catch { return ''; }
  if (!clean || clean.startsWith('/') || clean.startsWith('\\') || /^[A-Za-z]:[\\/]/.test(clean)) return '';
  const parts = base.split('/').slice(0, -1);
  for (const part of clean.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) return ''; parts.pop(); continue; }
    if (/^[\u0000-\u001f]+$/.test(part)) return '';
    parts.push(part);
  }
  return normalizeInnerPath(parts.join('/'));
}

function normalizeInnerPath(value = '') {
  const raw = String(value || '');
  if (!raw || raw.includes('\u0000') || /[\u0000-\u001f]/.test(raw)) return '';
  const slashed = raw.replace(/\\/g, '/');
  if (slashed.startsWith('/') || slashed.startsWith('//') || /^[A-Za-z]:\//.test(slashed)) return '';
  const parts = [];
  for (const part of slashed.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') return '';
    parts.push(part);
  }
  return parts.join('/');
}

function decodeUtf8(data) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(data instanceof Uint8Array ? data : new Uint8Array(data || [])); } catch { return ''; }
}
