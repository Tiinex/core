export function parseWorkspaceQualifiedRecoveryReference(value = '') {
  const rawValue = normalizedReferenceText(value);
  const match = rawValue.match(/^([A-Za-z0-9._-]+)::(.+)$/);
  if (!match) return null;
  const rawPath = referencePathPart(match[2]);
  if (!rawPath || rawPath.startsWith('/') || rawPath.startsWith('\\') || /^[A-Za-z]:[\\/]/.test(rawPath)) return null;
  const parts = rawPath.replace(/\\/g, '/').split('/');
  if (parts.some((part) => !part || part === '..' || hasControlCharacters(part))) return null;
  const path = parts.filter((part) => part !== '.').join('/');
  return path ? Object.freeze({ workspaceId: match[1], path, reference: `${match[1]}::${path}` }) : null;
}

export function classifyParentRecoveryReference(value = '') {
  const raw = normalizedReferenceText(value);
  if (!raw) return Object.freeze({ kind: 'empty', raw: '', workspaceQualified: null });
  const workspaceQualified = parseWorkspaceQualifiedRecoveryReference(raw);
  if (workspaceQualified) return Object.freeze({ kind: 'workspace-qualified', raw, workspaceQualified });
  if (isNetworkOrSchemeReference(raw)) return Object.freeze({ kind: 'external', raw, workspaceQualified: null });
  if (raw.includes('::')) return Object.freeze({ kind: 'malformed-workspace-qualified', raw, workspaceQualified: null });
  return Object.freeze({ kind: 'local-relative', raw, workspaceQualified: null });
}

export function isMalformedWorkspaceQualifiedRecoveryReference(value = '') {
  return classifyParentRecoveryReference(value).kind === 'malformed-workspace-qualified';
}

export function isExternalRecoveryReference(value = '') {
  return classifyParentRecoveryReference(value).kind === 'external';
}

function normalizedReferenceText(value = '') {
  return String(value || '').trim();
}

function referencePathPart(value = '') {
  let decoded;
  try { decoded = decodeURIComponent(String(value || '').split('#')[0].split('?')[0]); }
  catch { return ''; }
  return decoded;
}

function isNetworkOrSchemeReference(value = '') {
  const text = String(value || '');
  return /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(text) || text.startsWith('//') || (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(text) && !text.includes('::'));
}

function hasControlCharacters(value = '') {
  return /[\u0000-\u001f]/.test(String(value || ''));
}
