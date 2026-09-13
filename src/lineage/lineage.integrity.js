import { C14N_V1_METHOD_ID, c14nV1TargetDigest } from '../integrity/integrity.c14nV1.js';
import { C14N_V2_METHOD_ID } from '../integrity/integrity.c14nV2.js';
import { LineageResolutionStatus } from './lineage.model.js';
import { canonicalPath, canonicalToken, provenanceTargetKeysForValue } from './lineage.targetKeys.js';

export function verifiedIntegrityMatch(match = null) {
  if (!match || match.ambiguous || match.selfReference || match.blocked) return match;
  return Object.assign({}, match, {
    status: LineageResolutionStatus.verified,
    diagnostics: [lineageDiagnostic('integrity.verified', 'Loaded parent integrity matches the child declaration.', { basis: 'checksum' })]
  });
}

export function withParentIntegrityStatus(match = null, expectedIntegrity = []) {
  if (!match || !Array.isArray(expectedIntegrity) || !expectedIntegrity.length) return match;
  if (match.ambiguous || match.selfReference || match.blocked) return match;
  if (match.status === LineageResolutionStatus.verified || match.status === LineageResolutionStatus.mismatch || match.status === LineageResolutionStatus.probable) return match;
  const expectations = normalizeIntegrityExpectations(expectedIntegrity);
  if (!expectations.length) return match;
  const checks = expectations.map((expectation) => verifyParentIntegrityExpectation(match, expectation));
  const verified = checks.find((check) => check.state === 'verified');
  if (verified) {
    return Object.assign({}, match, {
      status: LineageResolutionStatus.verified,
      diagnostics: [lineageDiagnostic('integrity.verified', verified.message, { basis: verified.basis, method: verified.method, expected: verified.expected, actual: verified.actual })]
    });
  }
  const comparable = checks.filter((check) => check.state === 'mismatch');
  if (!comparable.length) {
    return Object.assign({}, match, {
      status: LineageResolutionStatus.probable,
      diagnostics: [lineageDiagnostic('integrity.unavailable', 'Declared parent found, but the loaded parent does not expose the method-specific material required to verify the child declaration.', { basis: match.method || '', methods: expectations.map((item) => item.method).filter(Boolean).join(', ') })]
    });
  }
  return Object.assign({}, match, {
    status: LineageResolutionStatus.mismatch,
    diagnostics: comparable.map((check) => lineageDiagnostic('integrity.mismatch', check.message, { basis: check.basis, method: check.method, expected: check.expected, actual: check.actual }))
  });
}

export function parentIntegrityExpectationsForTarget(node = {}, target = '') {
  const targetKeys = lineageTargetComparisonKeys(target);
  if (!targetKeys.length) return [];
  const entries = integrityEntriesForNode(node);
  const expectations = [];
  for (const entry of entries) {
    const towards = String(entry.towards || '').trim();
    if (!towards || /^self$/i.test(towards)) continue;
    const entryKeys = lineageTargetComparisonKeys(towards);
    if (!entryKeys.some((key) => targetKeys.includes(key))) continue;
    const value = canonicalIntegrityValue(entry.value);
    if (!value) continue;
    expectations.push(Object.freeze({ method: canonicalIntegrityMethod(entry.method || entry.declaredMethod || ''), value, towards }));
  }
  return dedupeExpectations(expectations);
}

export function parentIntegrityValuesForTarget(node = {}, target = '') {
  return parentIntegrityExpectationsForTarget(node, target).map((entry) => entry.value);
}

export function selfIntegrityValuesForNode(node = {}) {
  return Array.from(new Set(selfIntegrityEntriesForNode(node).map((entry) => canonicalIntegrityValue(entry.value)).filter(Boolean)));
}

export function selfIntegrityEntriesForNode(node = {}) {
  return integrityEntriesForNode(node)
    .filter((entry) => /^self$/i.test(String(entry.towards || '').trim()))
    .map((entry) => Object.freeze({
      method: canonicalIntegrityMethod(entry.method || entry.declaredMethod || ''),
      value: canonicalIntegrityValue(entry.value),
      towards: 'self'
    }))
    .filter((entry) => entry.value);
}

function verifyParentIntegrityExpectation(match = {}, expectation = {}) {
  const method = canonicalIntegrityMethod(expectation.method || '');
  const expected = canonicalIntegrityValue(expectation.value);
  if (!expected) return unavailableCheck(method, expected, 'integrity-value-missing');
  const markdown = String(match?.record?.markdown || match?.markdown || '');
  if (method === C14N_V1_METHOD_ID) {
    if (!markdown) return unavailableCheck(method, expected, 'target-markdown-unavailable');
    const actual = c14nV1TargetDigest(markdown);
    return Object.freeze({
      state: actual === expected ? 'verified' : 'mismatch',
      method,
      expected,
      actual,
      basis: C14N_V1_METHOD_ID,
      message: actual === expected
        ? 'Declared parent found and direct c14n-v1 canonicalization of the resolved target matches the child declaration.'
        : 'Declared parent found, but direct c14n-v1 canonicalization of the resolved target does not match the child declaration.'
    });
  }

  const selfEntries = selfIntegrityEntriesForNode(match);
  const comparableEntries = method ? selfEntries.filter((entry) => entry.method === method) : selfEntries;
  const actualValues = Array.from(new Set(comparableEntries.map((entry) => entry.value).filter(Boolean)));
  if (!actualValues.length) return unavailableCheck(method, expected, 'target-self-integrity-unavailable');
  const matched = actualValues.includes(expected);
  return Object.freeze({
    state: matched ? 'verified' : 'mismatch',
    method,
    expected,
    actual: actualValues.join(', '),
    basis: method || match.method || 'target-self-integrity',
    message: matched
      ? 'Declared parent found and method-compatible target self-integrity matches the child declaration.'
      : 'Declared parent found, but method-compatible target self-integrity does not match the child declaration.'
  });
}

function unavailableCheck(method = '', expected = '', reason = '') {
  return Object.freeze({ state: 'unavailable', method, expected, actual: '', basis: method || reason, reason, message: 'Method-specific target integrity material is unavailable.' });
}

function normalizeIntegrityExpectations(values = []) {
  const out = [];
  for (const item of values) {
    if (item && typeof item === 'object') {
      const value = canonicalIntegrityValue(item.value);
      if (value) out.push(Object.freeze({ method: canonicalIntegrityMethod(item.method || item.declaredMethod || ''), value, towards: String(item.towards || '') }));
      continue;
    }
    const value = canonicalIntegrityValue(item);
    if (value) out.push(Object.freeze({ method: '', value, towards: '' }));
  }
  return dedupeExpectations(out);
}

function dedupeExpectations(entries = []) {
  const seen = new Set();
  const out = [];
  for (const entry of entries) {
    const key = `${entry.method}\u0000${entry.value}\u0000${entry.towards}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function integrityEntriesForNode(node = {}) {
  const record = node?.record || node || {};
  const entries = Array.isArray(record.integrity?.entries) ? record.integrity.entries : [];
  if (entries.length) return entries;
  return parseIntegrityEntriesFromMarkdown(record.markdown || '');
}

function parseIntegrityEntriesFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const start = text.search(/^#\s+Continuity Integrity\s*$/im);
  if (start === -1) return [];
  const lines = text.slice(start).split('\n');
  const entries = [];
  let current = null;
  const flush = () => {
    if (!current) return;
    const method = current.fields.Method || current.label || '';
    entries.push({
      method: stripMarkdown(method),
      towards: normalizeIntegrityField(current.fields.Towards || ''),
      value: stripMarkdown(current.fields.Value || ''),
      raw: current.lines.join('\n')
    });
    current = null;
  };
  for (const line of lines) {
    const top = line.match(/^-\s+(.+?)\s*$/);
    if (top) {
      flush();
      current = { label: top[1].trim(), fields: {}, lines: [line] };
      continue;
    }
    if (!current) continue;
    current.lines.push(line);
    const field = line.match(/^\s+-\s*([A-Za-z][A-Za-z0-9 _+-]{0,40}):\s*(.+?)\s*$/);
    if (field) current.fields[field[1].trim()] = field[2].trim();
  }
  flush();
  return entries.filter((entry) => entry.method || entry.towards || entry.value);
}

function lineageTargetComparisonKeys(value = '') {
  const raw = String(value || '').trim();
  const keys = [];
  const add = (item = '') => {
    const clean = String(item || '').trim().toLowerCase();
    if (clean && !keys.includes(clean)) keys.push(clean);
  };
  add(canonicalToken(raw));
  add(canonicalPath(raw));
  for (const key of provenanceTargetKeysForValue(raw)) add(key);
  return keys.filter(Boolean);
}

export function canonicalIntegrityValue(value = '') {
  return String(value || '').trim();
}

export function canonicalIntegrityMethod(value = '') {
  return stripMarkdown(String(value || '').trim()).toLowerCase();
}

function normalizeIntegrityField(value = '') {
  const raw = String(value || '').trim();
  const link = raw.match(/^\[([^\]]*)\]\(([^)]+)\)$/);
  if (link) return String(link[2] || link[1] || '').trim();
  return stripMarkdown(raw);
}

function stripMarkdown(value = '') {
  return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').trim();
}

function lineageDiagnostic(code, message, extra = {}) {
  return Object.freeze(Object.assign({ code, message }, extra || {}));
}
