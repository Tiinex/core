const LAYER_PRECEDENCE = Object.freeze({
  workspace: 500,
  site: 400,
  verse: 300,
  app: 200,
  core: 100,
  other: 0
});

export const COMPANION_RESOLUTION_SCHEMA_ID = 'tiinex.core.companion-resolution.v1';
export const COMPANION_PROVIDER_SCHEMA_ID = 'tiinex.core.companion-provider.v1';

export function defineCompanionProvider(input = {}) {
  const id = text(input.id);
  if (!id) throw new TypeError('Companion provider id is required.');
  const layer = text(input.layer || 'other').toLowerCase();
  const precedence = finite(input.precedence, LAYER_PRECEDENCE[layer] ?? LAYER_PRECEDENCE.other);
  const resources = freeze((Array.isArray(input.resources) ? input.resources : []).map((resource, index) => normalizeResource(resource, { providerId: id, layer, precedence, index })));
  return freeze({
    schema: COMPANION_PROVIDER_SCHEMA_ID,
    id,
    layer,
    precedence,
    resources,
    boundary: text(input.boundary || 'data-only companion provider; provider presence does not create Tiinex semantic authority')
  });
}

export function resolveCompanionResources(input = {}) {
  const query = normalizeQuery(input.query || input);
  const providers = (Array.isArray(input.providers) ? input.providers : []).map((provider) => provider?.schema === COMPANION_PROVIDER_SCHEMA_ID ? provider : defineCompanionProvider(provider));
  const findings = [];
  const candidates = [];

  for (const provider of providers) {
    for (const resource of provider.resources) {
      if (resource.namespace !== query.namespace || resource.slot !== query.slot) continue;
      const specificity = resourceSpecificity(resource, query);
      if (specificity < 0) continue;
      candidates.push(freeze({ ...resource, specificity }));
    }
  }

  candidates.sort(compareCandidates);
  const bestSpecificity = candidates[0]?.specificity ?? -1;
  const specificityCandidates = candidates.filter((item) => item.specificity === bestSpecificity);
  const bestPrecedence = specificityCandidates[0]?.providerPrecedence ?? -Infinity;
  const finalists = specificityCandidates.filter((item) => item.providerPrecedence === bestPrecedence);
  const cardinality = query.cardinality || finalists[0]?.cardinality || 'single';

  let status = 'missing';
  let resources = [];
  if (!candidates.length) {
    findings.push(finding('info', 'companion.resource.missing', 'No registered companion resource matched the qualified query.', query));
  } else if (cardinality === 'multiple') {
    status = 'resolved';
    const groups = new Map();
    for (const candidate of candidates) { const key = candidate.key || candidate.path || candidate.id; const values = groups.get(key) || []; values.push(candidate); groups.set(key, values); }
    for (const [key, values] of [...groups].sort(([a], [b]) => codePoint(a, b))) {
      const first = values[0];
      const tied = stableUnique(values.filter(v => v.specificity === first.specificity && v.providerPrecedence === first.providerPrecedence), resourceIdentity);
      if (tied.length !== 1) { status = 'ambiguous'; findings.push(finding('error', 'companion.collection.key.ambiguous', 'A collection key has conflicting equally ranked resources.', { key })); }
      else resources.push(tied[0]);
    }
    if (status === 'ambiguous') resources = [];
  } else {
    const unique = stableUnique(finalists, resourceIdentity);
    if (unique.length === 1) {
      status = 'resolved';
      resources = unique;
    } else {
      status = 'ambiguous';
      findings.push(finding('error', 'companion.resource.ambiguous', 'More than one same-specificity, same-precedence single-value companion remains. Resolution failed closed.', {
        namespace: query.namespace,
        slot: query.slot,
        candidateCount: unique.length,
        providerIds: unique.map((item) => item.providerId)
      }));
    }
  }

  const winnerIds = new Set(resources.map(resourceIdentity));
  const shadowed = candidates.filter((item) => !winnerIds.has(resourceIdentity(item)));
  return freeze({
    schema: COMPANION_RESOLUTION_SCHEMA_ID,
    status,
    query,
    resources,
    candidates,
    shadowed,
    findings,
    receipt: {
      specificity: bestSpecificity,
      providerPrecedence: Number.isFinite(bestPrecedence) ? bestPrecedence : null,
      selectedProviders: [...new Set(resources.map((item) => item.providerId))],
      shadowedProviders: [...new Set(shadowed.map((item) => item.providerId))]
    },
    boundary: 'Specificity resolves before provider precedence. Filename order, import order, repository location and display labels never create authority.'
  });
}

export function companionProviderFromWorkspace(workspace = {}, options = {}) {
  const workspaceId = text(workspace.id || workspace.workspaceId || 'workspace');
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const resources = [];
  const findings = [];
  const recordsByPath = new Map(records.map((record) => [normPath(record.path || record.id || ''), record]).filter(([path]) => path));

  for (const asset of assets) {
    const assetPath = normPath(asset.path || asset.id || '');
    if (!assetPath) continue;
    const parsed = parseCompanionFilename(assetPath);
    if (!parsed) continue;
    let ownerArtifactPath = normPath(asset.ownerArtifactPath || '');
    if (!ownerArtifactPath) {
      const siblingCandidates = candidateArtifactPathsForCompanion(assetPath, parsed);
      const matches = siblingCandidates.filter((path) => recordsByPath.has(path));
      if (matches.length === 1) ownerArtifactPath = matches[0];
      else if (matches.length > 1) {
        findings.push(finding('error', 'companion.workspace.owner.ambiguous', 'Artifact-local companion filename matches more than one loaded artifact candidate.', { workspaceId, assetPath, matches }));
        continue;
      }
    }
    if (!ownerArtifactPath) continue;
    if (!recordsByPath.has(ownerArtifactPath)) {
      findings.push(finding('warning', 'companion.workspace.owner.unloaded', 'Companion declares an artifact owner that is not loaded in the Workspace snapshot.', { workspaceId, assetPath, ownerArtifactPath }));
      continue;
    }
    resources.push({
      namespace: parsed.namespace,
      slot: parsed.slot,
      cardinality: parsed.cardinality,
      owner: { kind: 'artifact', workspaceId, artifactPath: ownerArtifactPath },
      path: assetPath,
      mediaType: text(asset.mediaType || asset.type || mimeFromPath(assetPath)),
      sha256: text(asset.sha256 || ''),
      source: freeze({ workspaceId, assetId: text(asset.id || assetPath), sourceMode: text(asset.sourceMode || asset.source?.adapterId || 'workspace') })
    });
  }
  return freeze({ provider: defineCompanionProvider({ id: text(options.id || `workspace:${workspaceId}`), layer: 'workspace', precedence: options.precedence, resources }), findings });
}

export function parseCompanionFilename(path = '') {
  const name = normPath(path).split('/').at(-1) || '';
  const match = name.match(/^(.*)\.([a-z0-9][a-z0-9_-]*)\.([a-z0-9][a-z0-9_-]*)(?:\.(many|multiple))?\.([a-z0-9]+)$/i);
  if (!match) return null;
  // The common form is owner.namespace.slot.ext. Optional cardinality token may be
  // `many`/`multiple`; arbitrary extra tokens are treated as part of the slot so
  // filenames remain forward-compatible without implicit semantics.
  let [, ownerStem, namespace, slot, extra, extension] = match;
  let cardinality = 'single';
  if (extra && ['many', 'multiple'].includes(extra.toLowerCase())) cardinality = 'multiple';
  else if (extra) slot = `${slot}.${extra}`;
  return freeze({ ownerStem, namespace: namespace.toLowerCase(), slot: slot.toLowerCase(), cardinality, extension: extension.toLowerCase() });
}

function normalizeResource(resource = {}, provider = {}) {
  const namespace = text(resource.namespace).toLowerCase();
  const slot = text(resource.slot).toLowerCase();
  if (!namespace || !slot) throw new TypeError('Companion resource namespace and slot are required.');
  const owner = normalizeOwner(resource.owner || {});
  const cardinality = text(resource.cardinality || 'single').toLowerCase() === 'multiple' ? 'multiple' : 'single';
  const path = normPath(resource.path || '');
  if (path.split('/').includes('..') || /^(?:[a-z]:|\/)/i.test(text(resource.path))) throw new TypeError('Companion path must be relative and stay inside its provider.');
  const id = text(resource.id || `${provider.providerId}:${namespace}:${slot}:${ownerIdentity(owner)}:${path || provider.index}`);
  return freeze({
    id,
    key: text(resource.key || ''),
    namespace,
    slot,
    cardinality,
    owner,
    path,
    url: text(resource.url || ''),
    mediaType: text(resource.mediaType || ''),
    sha256: text(resource.sha256 || ''),
    source: resource.source || null,
    providerId: provider.providerId,
    providerLayer: provider.layer,
    providerPrecedence: provider.precedence
  });
}

function normalizeOwner(owner = {}) {
  const kind = text(owner.kind || 'root').toLowerCase();
  if (kind === 'artifact') return freeze({ kind, workspaceId: text(owner.workspaceId), artifactPath: normPath(owner.artifactPath || owner.path || '') });
  if (kind === 'schema') return freeze({ kind, schemaId: text(owner.schemaId || owner.id) });
  if (kind !== 'root') throw new TypeError('Unsupported companion owner kind.');
  return freeze({ kind: 'root', schemaId: text(owner.schemaId || '') });
}

function normalizeQuery(input = {}) {
  const owner = normalizeOwner(input.owner || {});
  return freeze({
    namespace: text(input.namespace).toLowerCase(),
    slot: text(input.slot).toLowerCase(),
    cardinality: text(input.cardinality).toLowerCase() === 'multiple' ? 'multiple' : text(input.cardinality).toLowerCase() === 'single' ? 'single' : '',
    owner,
    schemaLineage: freeze((Array.isArray(input.schemaLineage) ? input.schemaLineage : []).map(text).filter(Boolean))
  });
}

function resourceSpecificity(resource, query) {
  const owner = resource.owner;
  if (owner.kind === 'artifact') {
    return query.owner.kind === 'artifact' && owner.workspaceId === query.owner.workspaceId && owner.artifactPath === query.owner.artifactPath ? 1000 : -1;
  }
  if (owner.kind === 'schema') {
    const schemaId = query.owner.kind === 'schema' ? query.owner.schemaId : query.schemaLineage[0] || '';
    const lineage = query.schemaLineage.length ? query.schemaLineage : schemaId ? [schemaId] : [];
    const index = lineage.indexOf(owner.schemaId);
    return index < 0 ? -1 : 800 - index;
  }
  return 100;
}

function compareCandidates(a, b) {
  return b.specificity - a.specificity || b.providerPrecedence - a.providerPrecedence || codePoint(a.providerId, b.providerId) || codePoint(a.id, b.id);
}

function candidateArtifactPathsForCompanion(assetPath, parsed) {
  const parts = normPath(assetPath).split('/');
  parts.pop();
  const dir = parts.length ? `${parts.join('/')}/` : '';
  return [
    `${dir}${parsed.ownerStem}.trace.md`,
    `${dir}${parsed.ownerStem}.workspace.md`,
    `${dir}${parsed.ownerStem}.md`
  ];
}

function ownerIdentity(owner) {
  if (owner.kind === 'artifact') return `${owner.workspaceId}::${owner.artifactPath}`;
  if (owner.kind === 'schema') return owner.schemaId;
  return 'root';
}
function resourceIdentity(item) { return `${item.providerId}|${item.id}|${item.sha256}|${item.path}|${item.url}`; }
function stableUnique(items, key) { const seen = new Set(); return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; }); }
function normPath(value = '') { return text(value).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function mimeFromPath(path) { const ext = normPath(path).split('.').at(-1)?.toLowerCase(); return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', json: 'application/json', md: 'text/markdown' })[ext] || 'application/octet-stream'; }
function finite(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function text(value) { return String(value ?? '').trim(); }
function codePoint(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function finding(severity, code, message, details = {}) { return freeze({ severity, code, message, details }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
