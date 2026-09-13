import { sha256Base64Url } from './integrity.c14nV2.js';

export const C14N_V1_METHOD_ID = 'sha256-base64url-c14n-v1';

export function canonicalC14nV1TargetState(markdown = '') {
  const normalized = normalizeCanonicalSource(markdown);
  const lines = normalized.split('\n');
  const integrityHeading = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
  const canonical = (integrityHeading < 0 ? lines : lines.slice(0, integrityHeading)).join('\n');
  return Object.freeze({
    state: 'computed',
    method: C14N_V1_METHOD_ID,
    canonical,
    computedValue: sha256Base64Url(canonical),
    integrityHeading
  });
}

export function c14nV1TargetDigest(markdown = '') {
  return canonicalC14nV1TargetState(markdown).computedValue;
}

function normalizeCanonicalSource(markdown = '') {
  return String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trimEnd();
}
