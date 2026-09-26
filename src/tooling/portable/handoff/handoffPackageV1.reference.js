export function parseHandoffPackageV1Reference(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return Object.freeze({ kind: 'absent', raw });
  const workspace = raw.match(/^([^:\s]+)::(.+)$/);
  if (workspace) return Object.freeze({ kind: 'workspace-coordinate', raw, workspaceId: workspace[1], sourcePath: normalizePath(workspace[2]) });
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:' && url.hostname.toLowerCase() === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 5 && parts[2] === 'blob') {
        const owner = decodeURIComponent(parts[0]);
        const repo = decodeURIComponent(parts[1]);
        const sourceVersion = decodeURIComponent(parts[3]);
        const sourcePath = parts.slice(4).map(decodeURIComponent).join('/');
        return Object.freeze({ kind: 'adapter-reference', raw, adapterId: 'github', sourceIdentity: `${owner}/${repo}`, sourceVersion, sourcePath: normalizePath(sourcePath) });
      }
    }
    return Object.freeze({ kind: 'external-reference', raw, adapterId: '', sourceIdentity: '', sourceVersion: '', sourcePath: '' });
  } catch {}
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return Object.freeze({ kind: 'external-reference', raw, adapterId: '', sourceIdentity: '', sourceVersion: '', sourcePath: '' });
  return Object.freeze({ kind: 'relative-reference', raw, sourcePath: normalizePath(raw.split('#')[0].split('?')[0]) });
}

export function projectHandoffPackageV1CacheIdentity(input = {}) {
  const explicit = adapterCacheSource({
    adapterId: input.adapterId || input.sourceAdapter || '',
    sourceIdentity: input.sourceIdentity || '',
    sourceVersion: input.sourceVersion || '',
    sourcePath: input.sourcePath || ''
  });
  if (explicit) return projectAdapterOwnedCacheIdentity(explicit);

  const parsed = parseHandoffPackageV1Reference(input.referenceTarget || input.reference || '');
  if (parsed.kind === 'adapter-reference') return projectAdapterOwnedCacheIdentity({
    adapterId: parsed.adapterId,
    sourceIdentity: parsed.sourceIdentity,
    sourceVersion: parsed.sourceVersion,
    sourcePath: parsed.sourcePath
  });
  if (parsed.kind === 'workspace-coordinate') return projectNativeWorkspaceCacheIdentity(parsed.workspaceId, parsed.sourcePath);
  if (parsed.kind === 'external-reference') return Object.freeze({
    state: 'unsupported-adapter', sourceAdapter: '', sourceIdentity: '', sourceVersion: '', sourcePath: '', archiveEntry: ''
  });

  const fallbackIdentity = String(input.sourceWorkspaceId || 'workspace');
  const fallbackPath = normalizePath(input.sourcePath || input.name || 'material.trace.md');
  return projectNativeWorkspaceCacheIdentity(fallbackIdentity, fallbackPath);
}

function projectAdapterOwnedCacheIdentity(source = {}) {
  const adapterId = safeAdapterId(source.adapterId || '');
  if (adapterId === 'github') return projectGithubCacheIdentity(source);
  if (adapterId === 'native') return projectNativeWorkspaceCacheIdentity(source.sourceIdentity, source.sourcePath);
  return Object.freeze({
    state: 'unsupported-adapter',
    sourceAdapter: adapterId,
    sourceIdentity: String(source.sourceIdentity || '').trim(),
    sourceVersion: String(source.sourceVersion || '').trim(),
    sourcePath: normalizePath(source.sourcePath || ''),
    archiveEntry: ''
  });
}

function projectGithubCacheIdentity(source = {}) {
  const sourceIdentity = normalizeGithubRepositoryIdentity(source.sourceIdentity || '');
  const sourceVersion = String(source.sourceVersion || '').trim().toLowerCase();
  const sourcePath = normalizePath(source.sourcePath || '');
  if (!sourceIdentity || !/^[a-f0-9]{40}$/.test(sourceVersion) || !sourcePath) return Object.freeze({
    state: 'unqualified',
    sourceAdapter: 'github', sourceIdentity, sourceVersion, sourcePath, archiveEntry: ''
  });
  return Object.freeze({
    state: 'qualified',
    sourceAdapter: 'github', sourceIdentity, sourceVersion, sourcePath,
    archiveEntry: `github/${safeIdentityPath(sourceIdentity)}/${safeIdentitySegment(sourceVersion)}/${safeOriginalPath(sourcePath)}`
  });
}

function projectNativeWorkspaceCacheIdentity(sourceIdentity = '', sourcePath = '') {
  const identity = String(sourceIdentity || '').trim();
  const path = normalizePath(sourcePath || '');
  return Object.freeze({
    state: identity && path ? 'qualified' : 'unqualified',
    sourceAdapter: 'native', sourceIdentity: identity, sourceVersion: '', sourcePath: path,
    archiveEntry: identity && path ? `native/${safeIdentityPath(identity)}/${safeOriginalPath(path)}` : ''
  });
}

function adapterCacheSource(input = {}) {
  const adapterId = safeAdapterId(input.adapterId || '');
  const sourceIdentity = String(input.sourceIdentity || '').trim();
  const sourcePath = normalizePath(input.sourcePath || '');
  if (!adapterId || !sourceIdentity || !sourcePath) return null;
  return Object.freeze({ adapterId, sourceIdentity, sourceVersion: String(input.sourceVersion || '').trim(), sourcePath });
}

function normalizeGithubRepositoryIdentity(value = '') {
  const parts = String(value || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return parts.length === 2 ? `${parts[0]}/${parts[1]}` : '';
}

export function resolveHandoffPackageV1RelativeReference(ownerPath = '', target = '') {
  const raw = String(target || '').trim();
  if (!raw || raw.includes('::') || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//') || raw.startsWith('/')) return '';
  const base = normalizePath(ownerPath).split('/').slice(0, -1);
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); }
    else base.push(part);
  }
  return normalizePath(base.join('/'));
}

export function publicHandoffPackageV1Reference(value = '') {
  const parsed = parseHandoffPackageV1Reference(value);
  return parsed.kind === 'workspace-coordinate' ? '' : String(parsed.raw || '').trim();
}

export function normalizeHandoffPackageV1ReferencePath(value = '') { return normalizePath(value); }

export function isHandoffPackageV1PreHandoffGroundingRequirement(requirement = {}) {
  const text = `${requirement.name || ''} ${requirement.material || ''}`.toLowerCase();
  return /\b(process|policy|procedure|runbook|governance)\b/.test(text);
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function safeAdapterId(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function safeIdentityPath(value = '') { return String(value || '').replace(/\\/g, '/').split('/').filter(Boolean).map(safeIdentitySegment).join('/'); }
function safeIdentitySegment(value = '') { const raw=String(value||'').trim(); if(!raw||raw==='.'||raw==='..')return'_'; return raw.replace(/[\u0000-\u001f<>:"|?*\\/]/g,'_').replace(/[ .]+$/g,'_')||'_'; }
function safeOriginalPath(value = '') { const parts=[]; for(const part of String(value||'').replace(/\\/g,'/').replace(/^\/+/, '').split('/')){if(!part||part==='.')continue;if(part==='..')throw new Error('portable.handoff-package-v1.cache-source-path.unsafe');parts.push(safeIdentitySegment(part));} return parts.join('/'); }
