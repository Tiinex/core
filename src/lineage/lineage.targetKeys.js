export function provenanceTargetKeysForValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return [];
  const keys = [];
  const add = (item = '') => {
    const clean = String(item || '').trim().toLowerCase();
    if (clean && !keys.includes(clean)) keys.push(clean);
  };
  add(`raw:${raw}`);
  const commentId = raw.match(/(?:issuecomment-|issues\/comments\/)(\d+)/i)?.[1] || '';
  if (commentId) add(`github-comment:${commentId}`);
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    const hash = url.hash || '';
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && parts[2] === 'issues') {
      const repo = normalizeRepoKey(`${parts[0]}/${parts[1]}`);
      const number = String(parts[3] || '').trim();
      if (repo && number) {
        add(`github-issue:${repo}#${number}`);
        if (hash) add(`github-issue:${repo}#${number}${hash.toLowerCase()}`);
      }
    }
    if (host === 'api.github.com' && parts.length >= 5 && parts[0] === 'repos' && parts[3] === 'issues') {
      const repo = normalizeRepoKey(`${parts[1]}/${parts[2]}`);
      const number = String(parts[4] || '').trim();
      if (repo && number) add(`github-issue:${repo}#${number}`);
    }
  } catch (error) {
  }
  return keys;
}

export function githubFileIdentityFromUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    if (host === 'raw.githubusercontent.com' && parts.length >= 4) {
      return Object.freeze({ repo: normalizeRepoKey(`${parts[0]}/${parts[1]}`), ref: normalizeRef(parts[2]), path: normalizePathParts(parts.slice(3)) });
    }
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 5 && parts[2] === 'blob') {
      return Object.freeze({ repo: normalizeRepoKey(`${parts[0]}/${parts[1]}`), ref: normalizeRef(parts[3]), path: normalizePathParts(parts.slice(4)) });
    }
  } catch (_) {}
  return Object.freeze({ repo: '', ref: '', path: '' });
}

export function githubRepoRelativePathFromUrl(value = '') {
  return githubFileIdentityFromUrl(value).path;
}

export function sourceKeyFromTarget(value = '') {
  const identity = githubFileIdentityFromUrl(value);
  if (identity.repo) return identity.repo;
  try {
    const url = new URL(String(value || ''));
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 2) return normalizeRepoKey(`${parts[0]}/${parts[1]}`);
    if (url.hostname.endsWith('github.com') && parts.length >= 2) return normalizeRepoKey(`${parts[0]}/${parts[1]}`);
  } catch (error) {
  }
  return '';
}
export function normalizeRepoKey(value = '') {
  const parts = String(value || '').trim().toLowerCase().split('/').filter(Boolean);
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '';
}
export function normalizeRef(value = '') {
  return String(value || '').trim();
}
export function canonicalToken(value = '') {
  return String(value || '').trim().replace(/^record:/i, 'record:').replace(/\s+/g, '');
}
export function canonicalPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/^record:/i, '');
  const githubPath = githubRepoRelativePathFromUrl(raw);
  if (githubPath) raw = githubPath;
  else {
    try {
      const url = new URL(raw);
      raw = url.pathname.replace(/^\/+/, '');
    } catch (e) {}
  }
  return normalizePathParts(raw.replace(/\\/g, '/').split('/'));
}

function normalizePathParts(parts = []) {
  const out = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}
