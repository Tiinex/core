import path from 'node:path';
import { stableFingerprintBytes, utf8Bytes, sha256Hex } from '../../../export/package.bytes.js';
import { projectAssetReferenceRebind } from './asset.reference-rebind.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';

export const ASSET_RELOCATION_PLAN_SCHEMA_ID = 'tiinex.portable.asset-relocation-plan.v1';

/**
 * Plans local relocation of existing *ordinary* files into the numeric
 * coordinate of a qualified target artifact. This is not Tiinex Parent
 * authority and never edits or moves a file. Complete target-directory and
 * reference inventories are mandatory: omitted references are not absence.
 */
export function projectPortableAssetRelocation(input = {}) {
  const findings = [];
  const workspaceId = String(input.workspaceId || '').trim();
  const targetDirectory = cleanRelative(input.targetDirectory, true);
  const dimension = String(input.lineageDimension || '').trim();
  const assets = Array.isArray(input.assets) ? input.assets : [];
  const occupied = Array.isArray(input.targetDirectoryEntries) ? input.targetDirectoryEntries : [];
  const coverage = String(input.representationCoverage || '');
  const referenceCoverage = String(input.referenceCoverage || '');
  if (!workspaceId) error('workspace-required', 'An exact Workspace identity is required.');
  if (!targetDirectory) error('target-directory-invalid', 'The target directory must be a safe Workspace-relative directory.');
  if (!/^(?:0*[1-9]\d*)(?:-0*[1-9]\d*)*$/.test(dimension)) error('dimension-invalid', 'A qualified positive numeric lineage dimension is required.');
  if (coverage !== 'complete') error('namespace-incomplete', 'Exact complete target-directory representation is required.');
  if (referenceCoverage !== 'complete') error('references-incomplete', 'Exact complete reference qualification is required.');
  if (!assets.length) error('assets-required', 'At least one ordinary source file is required.');
  const seenSource = new Set();
  const known = new Set();
  for (const candidate of occupied) {
    const p = cleanRelative(candidate?.path ?? candidate);
    if (!p || path.posix.dirname(p) !== targetDirectory || known.has(p)) error('namespace-invalid', 'Target directory inventory is not exact and unique.');
    else known.add(p);
  }
  const inputs = [];
  const changes = [];
  let nextSequence = 1;
  const referenced = new Map();
  const referenceMaterials = Array.isArray(input.referenceMaterials) ? input.referenceMaterials : [];
  const byRefPath = new Map();
  for (const material of referenceMaterials) {
    const p = cleanRelative(material?.path);
    if (!p || byRefPath.has(p) || !p.endsWith('.md') || typeof material?.markdown !== 'string') error('reference-material-invalid', 'Reference materials require unique safe Markdown source paths.');
    else byRefPath.set(p, material.markdown);
  }
  for (const asset of assets) {
    const source = cleanRelative(asset?.path);
    if (!source || source.endsWith('.trace.md') || seenSource.has(source)) {
      error('source-invalid', `Ordinary source identity is missing, duplicated or an artifact: ${source || ''}`); continue;
    }
    seenSource.add(source);
    const ext = path.posix.extname(source).toLowerCase();
    if (!/^\.[a-z0-9]{1,12}$/.test(ext)) { error('extension-invalid', `Cannot preserve source file extension: ${source}`); continue; }
    // An ordinary *text* file may have outgoing relative references whose basis
    // changes with its own path. Do not treat text as opaque binary custody.
    if (['.md','.txt','.json','.jsonc','.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.htm','.css','.scss','.yaml','.yml','.xml','.svg','.toml','.sh','.ps1'].includes(ext)) { error('text-source-outgoing-references-unqualified', `Source may contain outgoing relative references and cannot be moved as opaque binary: ${source}`); continue; }
    const fp = String(asset?.fingerprint || '');
    const sha256 = String(asset?.sha256 || '');
    if (!/^tixfp1-[a-f0-9]{8}$/.test(fp) || !/^[a-f0-9]{64}$/.test(sha256)) { error('fingerprint-required', `Source requires exact bytes and strong fingerprint: ${source}`); continue; }
    if (!Array.isArray(asset?.referencedBy)) { error('references-unknown', `Referenced-by qualification is not available for ${source}`); continue; }
    if (asset.referencedBy.length) {
      const refs = [...new Set(asset.referencedBy.map(String))];
      if (refs.length !== asset.referencedBy.length || refs.some(ref=>!byRefPath.has(ref))) { error('references-incomplete-material', `Each referenced source must supply exact loaded Markdown: ${source}.`); continue; }
      referenced.set(source,refs);
    }
    const originalStem = path.posix.basename(source, ext);
    const slug = sanitizeSlug(originalStem);
    if (!slug) { error('slug-invalid', `Source filename cannot produce a safe slug: ${source}`); continue; }
    let index = nextSequence, proposed = '';
    do {
      proposed = path.posix.join(targetDirectory, `${dimension}-${slug}-${String(index++).padStart(2, '0')}${ext}`);
    } while (known.has(proposed) && index < 100000);
    if (known.has(proposed)) { error('namespace-exhausted', `Could not assign a non-colliding asset name: ${source}`); continue; }
    if (proposed === source) { error('source-already-target', `No change is necessary for ${source}.`); continue; }
    known.add(proposed);
    nextSequence = index;
    inputs.push(Object.freeze({ workspaceId, path: source, fingerprint: fp, sha256 }));
    changes.push(Object.freeze({ workspaceId, fromPath: source, toPath: proposed, beforeFingerprint: fp, afterFingerprint: fp, sha256, kind: 'binary-asset', pathChanged: true, bytesChanged: false }));
  }
  if (referenced.size) {
    const targets = new Map(changes.map(x=>[x.fromPath,x.toPath]));
    const seenReferences = new Map([...targets.keys()].map(k=>[k,new Set()]));
    for (const [refPath, markdown] of byRefPath) {
      if (seenSource.has(refPath)) { error('reference-source-conflict', 'A Markdown reference source cannot also be an asset.'); continue; }
      const revised = projectAssetReferenceRebind({ markdown, sourcePath:refPath, assetPaths:targets });
      if (revised.status !== 'ready') { for (const reason of revised.findings) error('reference-unqualified',reason); continue; }
      for (const ref of revised.refs) seenReferences.get(ref.assetPath)?.add(refPath);
      if (!revised.refs.length) { error('reference-material-unrelated', `Provided Markdown does not reference any selected asset: ${refPath}`); continue; }
      if (revised.beforeFingerprint === revised.afterFingerprint) continue;
      const kind = refPath.endsWith('.trace.md') ? 'artifact-reference-rebind' : 'markdown-reference-rebind';
      const original = utf8Bytes(markdown);
      inputs.push(Object.freeze({workspaceId,path:refPath,fingerprint:revised.beforeFingerprint,sha256:sha256Hex(original)}));
      changes.push(Object.freeze({workspaceId,fromPath:refPath,toPath:refPath,beforeFingerprint:revised.beforeFingerprint,afterFingerprint:revised.afterFingerprint,sha256:sha256Hex(utf8Bytes(revised.markdown)),kind,pathChanged:false,bytesChanged:true,markdown:revised.markdown}));
    }
    for (const [src,refs] of referenced) {
      const actual=[...(seenReferences.get(src)||[])].sort();
      const expected=[...refs].sort();
      if (JSON.stringify(actual)!==JSON.stringify(expected)) error('reference-inventory-mismatch', `Loaded links differ from explicitly qualified source references: ${src}`,{actual,expected});
    }
  } else if (referenceMaterials.length) error('reference-material-unrelated','Loaded reference materials were provided but none are qualified as referencing selected assets.');
  // The artifact is a *new output* in the same durable transaction, never
  // another mutable source. Core authoring must have rendered and sealed it.
  const artifact = input.artifactCreation;
  if (artifact !== undefined) {
    const artifactPath = cleanRelative(artifact?.path);
    const markdown = typeof artifact?.markdown === 'string' ? artifact.markdown : '';
    const bytes = utf8Bytes(markdown);
    if (!artifactPath || !artifactPath.endsWith('.trace.md') || path.posix.dirname(artifactPath) !== targetDirectory
      || !path.posix.basename(artifactPath).startsWith(`${dimension}-`) || !markdown
      || canonicalC14nV2SelfState(markdown).state !== 'verified') {
      error('artifact-creation-unqualified', 'Combined relocation requires a Core-rendered, self-verified artifact at the exact planned lineage and directory.');
    } else if (known.has(artifactPath) || seenSource.has(artifactPath) || changes.some(change=>change.toPath===artifactPath)) {
      error('artifact-creation-collision', 'The new artifact path is already reserved or occupied.');
    } else {
      known.add(artifactPath);
      changes.push(Object.freeze({ workspaceId, fromPath: artifactPath, toPath: artifactPath, beforeFingerprint: '', afterFingerprint: stableFingerprintBytes(bytes),
        sha256: sha256Hex(bytes), kind: 'artifact-create', pathChanged: false, bytesChanged: true, markdown }));
    }
  }
  const operation = Object.freeze({ kind: 'relocate-assets', workspaceId, targetDirectory, lineageDimension: dimension, selectedPaths: changes.filter(x=>x.kind==='binary-asset').map(x => x.fromPath), ...(input.inspectionMode ? {inspectionMode: String(input.inspectionMode)} : {}) });
  const inputFingerprint = stableFingerprintBytes(utf8Bytes(JSON.stringify(inputs)));
  const planFingerprint = stableFingerprintBytes(utf8Bytes(JSON.stringify({ representationCoverage: coverage, operation, inputFingerprint, outputs: changes.map(({ workspaceId, fromPath, toPath, afterFingerprint }) => ({ workspaceId, fromPath, toPath, afterFingerprint })) })));
  const ready = !findings.length;
  return Object.freeze({ schema: ASSET_RELOCATION_PLAN_SCHEMA_ID, status: ready ? 'ready' : 'blocked', executable: ready,
    representationCoverage: coverage, referenceCoverage, operation, inputFingerprint, planFingerprint,
    inputs: Object.freeze(inputs), changes: Object.freeze(changes), findings: Object.freeze(findings),
    findingSummary: Object.freeze({ error: findings.length, warning: 0, total: findings.length }),
    boundary: Object.freeze({ localOnly: true, noMutationDuringProjection: true, ordinaryFilesOnly: true, completeReferenceInventoryRequired: true, referencedMarkdownReboundAtomically: true, filenameDimensionIsNotSemanticParent: true, collisionsFailClosed: true, remoteWrite: false, gitMutation: false })
  });
  function error(code, message, params = {}) { findings.push(Object.freeze({ severity: 'error', code: `asset-relocation.${code}`, message, params })); }
}

export function sanitizeSlug(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96).replace(/-+$/g, '');
}

/** Reject absolutes, traversal, hidden system trees, Windows drives and NUL. */
export function cleanRelative(value, allowDirectory = false) {
  if (typeof value !== 'string' || !value || value.includes('\0') || value.includes('\\') || value.startsWith('/') || /^[a-zA-Z]:/.test(value) || value.includes('//')) return '';
  const parts = value.split('/');
  if (parts.some(p => !p || p === '.' || p === '..') || parts.some(p => p === '.git' || p === '.tiinex')) return '';
  const normalized = path.posix.normalize(value);
  return normalized === '.' || (!allowDirectory && normalized.endsWith('/')) ? '' : normalized;
}
