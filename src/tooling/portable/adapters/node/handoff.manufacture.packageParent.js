import { packageFileBytes, sha256Hex } from '../../../../export/package.bytes.js';
import { inspectRecipientFacingV2Topology } from '../../handoff/recipientV2.inspect.js';
import { parseHandoffPackageV1, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH } from '../../handoff/recipientV2.packageV1.js';
import { projectHandoffMaterialRequirements } from '../../handoff/materialClosure.requirements.js';
import { parseWorkspaceQualifiedReference } from '../../handoff/workspaceQualifiedReference.js';
import { inspectStoredWorkspaceArchive } from '../../handoff/workspaceByteProvider.js';

export function preparePackageParentWorkspaceReuse(input = {}) {
  const bundle = input.bundle || null;
  const currentIds = new Set([...(input.currentWorkspaceIds || [])].map(normalizeId).filter(Boolean));
  const workspaceAliases = normalizePackageParentWorkspaceAliases(input.workspaceAliases || input.packageParentWorkspaceAliases || {});
  for (const alias of workspaceAliases.values()) if (!currentIds.has(alias)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-alias.target-unresolved:${alias}`);
  const selection = normalizePackageParentWorkspaceSelection(input.workspaceIds || input.packageParentWorkspaceIds || input.reuseWorkspaceIds || []);
  if (!bundle?.files?.length) return emptyReuse('unavailable', { selection, workspaceAliases });
  const inspection = inspectRecipientFacingV2Topology(bundle);
  const declared = declaredPackageWorkspaceBindings(bundle, inspection);
  if (!declared.length) {
    if (selection.mode !== 'none') throw new Error('portable.handoff-manufacture.package-parent.workspace-selection.parent-surface-unresolved');
    return emptyReuse('not-requested', { selection, workspaceAliases, inspectionStatus: inspection.status, providerState: 'unsupported-parent-surface' });
  }
  if (inspection.status !== 'valid') {
    if (selection.mode !== 'none') throw new Error('portable.handoff-manufacture.package-parent.workspace-provider.invalid');
    return emptyReuse('not-requested', { selection, workspaceAliases, inspectionStatus: inspection.status, providerState: 'invalid' });
  }
  const selected = selectDeclaredPackageParentWorkspaceBindings(declared, selection);
  const missing = selected.filter((item) => !packageParentWorkspaceSupersededByCurrent(item.workspaceId, currentIds, workspaceAliases));

  const providerById = new Map((inspection.workspaceByteProvider?.workspaces || []).map((item) => [normalizeId(item.id), item]));
  const inspectedById = new Map((inspection.workspaces || []).map((item) => [normalizeId(item.workspaceId), item]));
  const providers = [];
  const providerTargetById = new Map();
  for (const binding of declared) {
    const id = normalizeId(binding.workspaceId);
    if (packageParentWorkspaceSupersededByCurrent(id, currentIds, workspaceAliases)) continue;
    const provider = providerById.get(id);
    const inspected = inspectedById.get(id);
    if (!provider || provider.state !== 'qualified' || provider.mode !== 'archive' || provider.materialization?.materialization !== 'complete' || inspected?.coverage !== 'complete') {
      if (selection.mode === 'all' || selection.ids.includes(id)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-provider.unqualified:${id}`);
      continue;
    }
    const targetPath = String(inspected.sourceWorkspaceTargetInnerPath || binding.workspaceArtifactInnerPath || '').trim();
    if (!targetPath) {
      if (selection.mode === 'all' || selection.ids.includes(id)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-target.unresolved:${id}`);
      continue;
    }
    providers.push(buildInheritedEnumeration(provider, {
      parentPackagePath: input.parentPackagePath || '',
      parentPackageSha256: input.parentPackageSha256 || '',
      archivePackagePath: inspected.workspaceArchivePath || binding.snapshotPath || ''
    }));
    providerTargetById.set(id, targetPath);
  }
  const providerEnumerationById = new Map(providers.map((item) => [normalizeId(item.id), item]));
  const inherited = [];
  const workspaceTargets = [];
  for (const binding of missing) {
    const id = normalizeId(binding.workspaceId);
    const inheritedProvider = providerEnumerationById.get(id);
    if (!inheritedProvider) throw new Error(`portable.handoff-manufacture.package-parent.workspace-provider.unqualified:${id}`);
    inherited.push(inheritedProvider);
    workspaceTargets.push(Object.freeze({ workspaceId: id, path: providerTargetById.get(id), source: 'qualified-package-parent-workspace' }));
  }
  const state = selection.mode === 'none' ? 'not-requested' : (missing.length ? 'qualified' : 'not-needed');
  return Object.freeze({
    state,
    providers: Object.freeze(providers),
    providerState: 'qualified',
    providerWorkspaceIds: Object.freeze(providers.map((item) => normalizeId(item.id))),
    providerWorkspaceTargets: Object.freeze([...providerTargetById.entries()].map(([workspaceId, targetPath]) => Object.freeze({ workspaceId, path: targetPath }))),
    inherited: Object.freeze(inherited),
    workspaceTargets: Object.freeze(workspaceTargets),
    inspectionStatus: inspection.status,
    missingWorkspaceIds: Object.freeze(missing.map((item) => normalizeId(item.workspaceId))),
    selectionMode: selection.mode,
    requestedWorkspaceIds: selection.ids,
    workspaceAliases: Object.freeze([...workspaceAliases.entries()].map(([parentWorkspaceId, currentWorkspaceId]) => Object.freeze({ parentWorkspaceId, currentWorkspaceId }))),
    boundary: 'Qualified package-parent Workspace snapshots may serve as read-only exact material providers, but complete Workspace carriage is reused only for explicitly selected package-parent Workspace ids. Package-parent carrier lineage alone never selects Workspace source. Explicit current Workspace roots take precedence by id, and explicit qualified workspace aliases may supersede a renamed parent-carrier Workspace without carrying stale duplicate source. Parent-carrier placement and lineage remain non-semantic.'
  });
}



export function preparePackageParentExactMaterialProvider(input = {}) {
  const bundle = input.bundle || null;
  const currentIds = new Set([...(input.currentWorkspaceIds || [])].map(normalizeId).filter(Boolean));
  if (!bundle?.files?.length) return emptyExactMaterialProvider('unavailable');
  const inspection = inspectRecipientFacingV2Topology(bundle);
  const claims = [];
  for (const cache of inspection.caches || []) {
    const archivePath = String(cache.archivePath || '').trim();
    const matches = (bundle.files || []).filter((file) => String(file.path || '') === archivePath);
    let archive = null;
    if (matches.length === 1) {
      try { archive = inspectStoredWorkspaceArchive(packageFileBytes(matches[0]), { ownedBytes: true }); } catch { archive = null; }
    }
    const byPath = new Map((archive?.entries || []).map((entry) => [String(entry.path || ''), entry]));
    for (const material of cache.materials || []) {
      const referenceTarget = String(material.referenceTarget || '').trim();
      if (!referenceTarget) continue;
      const parsed = parseWorkspaceQualifiedReference(referenceTarget);
      if (parsed && currentIds.has(normalizeId(parsed.workspaceId))) continue;
      const entry = byPath.get(String(material.archiveEntry || '')) || null;
      const declaredSha = String(material.sha256 || '').trim();
      const declaredBytes = Number(material.bytes || 0);
      const entrySha = entry ? String(entry.sha256 || sha256Hex(entry.data || new Uint8Array())) : '';
      const entryBytes = entry ? Number(entry.bytes || packageFileBytes({ data: entry.data }).byteLength) : 0;
      const qualified = inspection.status === 'valid' && archive?.state === 'qualified' && Boolean(entry)
        && (!declaredSha || declaredSha === entrySha) && (!declaredBytes || declaredBytes === entryBytes);
      claims.push(Object.freeze({
        referenceTarget,
        state: qualified ? 'available-qualified' : 'present-unqualified',
        reason: qualified ? '' : inspection.status !== 'valid' ? 'parent-carrier-inspection-invalid' : archive?.state !== 'qualified' ? 'cache-archive-unqualified' : !entry ? 'cache-entry-unresolved' : 'cache-entry-identity-mismatch',
        classification: String(material.classification || ''),
        sourceRequirementId: String(material.requirementId || material.sourceRequirementId || ''),
        workspaceId: String(cache.workspaceId || ''),
        cacheArtifactPath: String(cache.artifactPath || ''),
        cacheArchivePath: archivePath,
        archiveEntry: String(material.archiveEntry || ''),
        targetWorkspaceId: String(material.targetWorkspaceId || parsed?.workspaceId || ''),
        targetPath: String(material.targetPath || material.originalPath || parsed?.path || ''),
        bytes: entryBytes, sha256: entrySha, data: entry?.data || null
      }));
    }
  }
  const byTarget = new Map();
  for (const claim of claims) {
    const list = byTarget.get(claim.referenceTarget) || [];
    list.push(claim); byTarget.set(claim.referenceTarget, list);
  }
  const entries = [];
  for (const [referenceTarget, targetClaims] of byTarget.entries()) {
    const qualified = targetClaims.filter((item) => item.state === 'available-qualified');
    const digests = [...new Set(qualified.map((item) => item.sha256).filter(Boolean))];
    if (digests.length !== 1) continue;
    const same = qualified.filter((item) => item.sha256 === digests[0]);
    if (!same.length) continue;
    const first = same[0];
    entries.push(Object.freeze({
      referenceTarget, data: first.data, bytes: first.bytes, sha256: first.sha256,
      providerId: 'qualified-package-parent-exact-material',
      providerKind: 'qualified-package-parent-cache-material',
      provenance: Object.freeze({
        parentPackagePath: String(input.parentPackagePath || ''), parentPackageSha256: String(input.parentPackageSha256 || ''),
        providerMode: 'qualified-package-parent-cache', cacheArtifactPath: first.cacheArtifactPath, cacheArchivePath: first.cacheArchivePath,
        archiveEntry: first.archiveEntry, sourceRequirementIds: Object.freeze([...new Set(same.map((item) => item.sourceRequirementId).filter(Boolean))].sort()),
        referenceTarget, workspaceId: first.targetWorkspaceId || first.workspaceId, path: first.targetPath, authority: 'none'
      })
    }));
  }
  return Object.freeze({
    state: inspection.status === 'valid' ? 'qualified' : 'present-unqualified', inspectionStatus: String(inspection.status || ''),
    entries: Object.freeze(entries), claims: Object.freeze(claims),
    boundary: 'Exact material already present in a received qualified package cache may satisfy a newly authored return requirement only after exact declared-target and byte-identity qualification. Reuse is mechanical byte closure only: it does not select Workspace source, create semantic authority, infer delegation, or authorize repository discovery.'
  });
}

export function resolvePackageParentRequirementMaterials(requirements = {}, provider = {}) {
  const out = [];
  const byTarget = new Map((provider.entries || []).map((entry) => [String(entry.referenceTarget || ''), entry]));
  for (const requirement of allBlockingRequirements(requirements)) {
    const target = String(requirement.reference?.target || requirement.materialReference || '').trim();
    if (!target) continue;
    const entry = byTarget.get(target);
    if (!entry) continue;
    out.push(Object.freeze({
      requirementId: String(requirement.id || ''), referenceTarget: target, path: String(entry.provenance?.path || ''),
      data: entry.data, bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''),
      providerId: String(entry.providerId || ''), providerKind: String(entry.providerKind || ''),
      provenance: Object.freeze({ ...(entry.provenance || {}), reboundRequirementId: String(requirement.id || ''), reboundClassification: String(requirement.classification || '') }),
      authority: Object.freeze({ packageParentMaterialQualified: true, semanticAuthority: 'none', sourceSelectionAuthority: false })
    }));
  }
  return Object.freeze(out);
}

export function projectPackageParentMaterialClosurePreflight(requirements = {}, provider = {}) {
  const claimsByTarget = new Map();
  for (const claim of provider.claims || []) { const list = claimsByTarget.get(String(claim.referenceTarget || '')) || []; list.push(claim); claimsByTarget.set(String(claim.referenceTarget || ''), list); }
  const entryTargets = new Set((provider.entries || []).map((item) => String(item.referenceTarget || '')));
  const projected = [];
  for (const requirement of allBlockingRequirements(requirements)) {
    const target = String(requirement.reference?.target || requirement.materialReference || '').trim();
    if (!target) continue;
    const claims = claimsByTarget.get(target) || [];
    const state = entryTargets.has(target) ? 'available-qualified' : claims.length ? 'present-unqualified' : 'absent';
    projected.push(Object.freeze({
      requirementId: String(requirement.id || ''), classification: normalizeRequirementClass(requirement.classification), referenceTarget: target, state,
      provenance: Object.freeze(claims.map((claim) => Object.freeze({ cacheArchivePath: claim.cacheArchivePath, archiveEntry: claim.archiveEntry, sha256: claim.sha256, reason: claim.reason }))),
      nextAction: state === 'available-qualified' ? 'No action required; exact parent-carrier bytes are mechanically available.' : `Supply exact qualified material for ${target} through an explicit local binding, qualified Workspace provider, or qualified received-package cache surface. Tooling will not scan repositories or infer a source.`
    }));
  }
  const blockers = projected.filter((item) => item.state !== 'available-qualified');
  return Object.freeze({
    state: blockers.length ? 'action-required' : 'ready', requirements: Object.freeze(projected), blockerCount: blockers.length,
    boundary: 'This preflight classifies exact return-material closure only. Qualified received-package bytes may close declared material requirements, but this does not create semantic authority, select a Workspace source, establish process applicability, or authorize repository/network discovery.'
  });
}

function allBlockingRequirements(requirements = {}) { return [...(requirements.required || []), ...(requirements.endpointRoles || []), ...(requirements.participantRoles || []), ...(requirements.dependencies || [])]; }
function normalizeRequirementClass(value = '') { const v = String(value || ''); return v === 'endpoint-role' || v === 'participant-role' ? v : v || 'required'; }
function emptyExactMaterialProvider(state = 'unavailable') { return Object.freeze({ state, inspectionStatus: '', entries: Object.freeze([]), claims: Object.freeze([]), boundary: 'No qualified received-package exact material provider is available; Tooling will not infer one.' }); }

export function projectRequiredContextWorkspaceSelectionPreflight(input = {}) {
  const reuse = input.packageParentReuse || input.reuse || {};
  const currentWorkspaceIds = new Set([...(input.currentWorkspaceIds || [])].map(normalizeId).filter(Boolean));
  const inheritedWorkspaceIds = new Set((reuse.inherited || []).map((item) => normalizeId(item.id || item.enumeration?.materialization?.id || '')).filter(Boolean));
  const providerTargets = new Map((reuse.providerWorkspaceTargets || []).map((item) => [normalizeId(item.workspaceId), normalizeWorkspacePath(item.path)]));
  const requirements = projectHandoffMaterialRequirements({ markdown: String(input.handoffMarkdown || '') }).required || [];
  const missing = [];
  for (const requirement of requirements) {
    const target = parseWorkspaceQualifiedReference(String(requirement.reference?.target || requirement.materialReference || ''));
    if (!target) continue;
    const workspaceId = normalizeId(target.workspaceId);
    if (!workspaceId || currentWorkspaceIds.has(workspaceId) || inheritedWorkspaceIds.has(workspaceId)) continue;
    const providerTarget = providerTargets.get(workspaceId) || '';
    if (!providerTarget || providerTarget !== normalizeWorkspacePath(target.path)) continue;
    if (!/\bworkspace\b/i.test(String(requirement.material || ''))) continue;
    missing.push(Object.freeze({
      requirementId: String(requirement.id || ''),
      name: String(requirement.name || ''),
      workspaceId,
      material: String(requirement.material || ''),
      purpose: String(requirement.purpose || ''),
      referenceTarget: String(requirement.reference?.target || requirement.materialReference || ''),
      providerWorkspaceTarget: providerTarget,
      basis: 'explicit-required-context-workspace-material-matches-qualified-package-parent-workspace-target'
    }));
  }
  const missingWorkspaceIds = Object.freeze([...new Set(missing.map((item) => item.workspaceId))].sort());
  return Object.freeze({
    state: missingWorkspaceIds.length ? 'action-required' : 'ready',
    missingWorkspaceIds,
    requirements: Object.freeze(missing),
    nextAction: missingWorkspaceIds.length
      ? `Re-run manufacture with --package-parent-workspaces ${missingWorkspaceIds.join(',')} to carry the explicitly required Workspace material from the qualified package parent.`
      : 'No mechanically required package-parent Workspace carriage selection is missing.',
    boundary: 'This preflight fires only when exact Handoff Required Context explicitly describes Workspace material and its workspace-qualified Material Reference exactly matches a qualified package-parent Workspace target. It never auto-selects source, infers Workspace intent from filenames alone, or treats carrier lineage as source authority.'
  });
}

export function normalizePackageParentWorkspaceSelection(value = []) {
  const raw = Array.isArray(value) ? value : [value];
  const tokens = raw.flatMap((item) => String(item || '').split(',')).map((item) => String(item || '').trim()).filter(Boolean);
  if (!tokens.length) return Object.freeze({ mode: 'none', ids: Object.freeze([]) });
  if (tokens.some((item) => ['*', 'all'].includes(item.toLowerCase()))) return Object.freeze({ mode: 'all', ids: Object.freeze([]) });
  return Object.freeze({ mode: 'explicit', ids: Object.freeze([...new Set(tokens.map(normalizeId).filter(Boolean))].sort()) });
}

export function selectDeclaredPackageParentWorkspaceBindings(declared = [], selection = normalizePackageParentWorkspaceSelection()) {
  const normalized = [...(declared || [])]
    .map((item) => Object.freeze({ ...item, workspaceId: normalizeId(item.workspaceId) }))
    .filter((item) => item.workspaceId);
  if (selection.mode === 'none') return Object.freeze([]);
  if (selection.mode === 'all') return Object.freeze(normalized);
  const byId = new Map(normalized.map((item) => [item.workspaceId, item]));
  for (const id of selection.ids || []) if (!byId.has(id)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-selection.unresolved:${id}`);
  return Object.freeze((selection.ids || []).map((id) => byId.get(id)));
}

function declaredPackageWorkspaceBindings(bundle = {}, inspection = null) {
  const roots = (bundle.files || []).filter((file) => String(file.path || '') === RECIPIENT_V2_PACKAGE_V1_ROOT_PATH);
  if (roots.length === 1) {
    try {
      const markdown = new TextDecoder('utf-8', { fatal: true }).decode(packageFileBytes(roots[0]));
      const declared = [...(parseHandoffPackageV1(markdown).workspaces || [])];
      if (declared.length) return declared;
    } catch { /* fall through to independently qualified recipient-v2 inspection */ }
  }
  if (!inspection || inspection.detected !== true || inspection.status !== 'valid') return [];
  return (inspection.workspaces || [])
    .filter((workspace) => String(workspace.coverage || '') === 'complete')
    .map((workspace) => Object.freeze({
      workspaceId: String(workspace.workspaceId || ''),
      workspaceArtifactInnerPath: String(workspace.sourceWorkspaceTargetInnerPath || ''),
      snapshotPath: String(workspace.workspaceArchivePath || '')
    }))
    .filter((workspace) => workspace.workspaceId && workspace.workspaceArtifactInnerPath && workspace.snapshotPath);
}

function buildInheritedEnumeration(provider = {}, source = {}) {
  const entries = Object.freeze([...(provider.entries || [])]
    .map((entry) => Object.freeze({
      path: String(entry.path || ''),
      data: entry.data,
      bytes: Number(entry.bytes || 0),
      sha256: String(entry.sha256 || ''),
      mediaType: mediaTypeForPath(entry.path),
      referenceTarget: String(entry.referenceTarget || '')
    }))
    .sort((a, b) => a.path.localeCompare(b.path)));
  const includedEntries = Object.freeze(entries.map((entry) => Object.freeze({
    path: entry.path,
    bytes: entry.bytes,
    sha256: entry.sha256,
    referenceTarget: entry.referenceTarget
  })));
  const totalBytes = includedEntries.reduce((sum, entry) => sum + entry.bytes, 0);
  const evidence = Object.freeze({
    schema: 'tiinex.portable.workspace-completeness-evidence.v1',
    state: 'qualified',
    proof: 'qualified-package-parent-workspace-reuse-v1',
    boundary: 'exact-qualified-parent-carrier-complete-workspace-entry-set',
    workspaceId: normalizeId(provider.id),
    entryCount: includedEntries.length,
    totalBytes,
    entriesFingerprint: sha256Hex(new TextEncoder().encode(stableJson(includedEntries)))
  });
  const materialization = Object.freeze({
    id: normalizeId(provider.id),
    title: String(provider.title || provider.id || ''),
    state: 'complete',
    source: Object.freeze({
      kind: 'qualified-package-parent-workspace',
      workspaceId: normalizeId(provider.id),
      boundary: '.',
      parentPackagePath: String(source.parentPackagePath || ''),
      parentPackageSha256: String(source.parentPackageSha256 || ''),
      parentWorkspaceArchivePath: String(source.archivePackagePath || ''),
      authority: 'none'
    }),
    completenessEvidence: evidence,
    entries,
    includedEntries
  });
  return Object.freeze({
    id: materialization.id,
    root: '',
    enumeration: Object.freeze({
      schema: 'tiinex.portable.package-parent-workspace-enumeration.v1',
      status: 'qualified-complete',
      rootBoundary: '.',
      evidence,
      materialization
    })
  });
}

export function normalizePackageParentWorkspaceAliases(value = {}) {
  const entries = Array.isArray(value)
    ? value.map((item) => [item?.parentWorkspaceId || item?.parent || item?.from, item?.currentWorkspaceId || item?.current || item?.to])
    : Object.entries(value || {});
  const out = new Map();
  const targets = new Set();
  for (const [parentValue, currentValue] of entries) {
    const parentWorkspaceId = normalizeId(parentValue);
    const currentWorkspaceId = normalizeId(currentValue);
    if (!parentWorkspaceId || !currentWorkspaceId) throw new Error('portable.handoff-manufacture.package-parent.workspace-alias.invalid');
    if (parentWorkspaceId === currentWorkspaceId) throw new Error(`portable.handoff-manufacture.package-parent.workspace-alias.identity:${parentWorkspaceId}`);
    if (out.has(parentWorkspaceId)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-alias.duplicate-parent:${parentWorkspaceId}`);
    if (targets.has(currentWorkspaceId)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-alias.duplicate-target:${currentWorkspaceId}`);
    out.set(parentWorkspaceId, currentWorkspaceId);
    targets.add(currentWorkspaceId);
  }
  return out;
}

export function packageParentWorkspaceSupersededByCurrent(parentWorkspaceId = '', currentWorkspaceIds = new Set(), workspaceAliases = new Map()) {
  const id = normalizeId(parentWorkspaceId);
  if (currentWorkspaceIds.has(id)) return true;
  const replacement = workspaceAliases.get(id) || '';
  return Boolean(replacement && currentWorkspaceIds.has(replacement));
}

function emptyReuse(state, options = {}) {
  const selection = options.selection || normalizePackageParentWorkspaceSelection();
  const workspaceAliases = options.workspaceAliases || new Map();
  return Object.freeze({
    state,
    providers: Object.freeze([]),
    providerState: String(options.providerState || 'unavailable'),
    providerWorkspaceIds: Object.freeze([]),
    providerWorkspaceTargets: Object.freeze([]),
    inherited: Object.freeze([]),
    workspaceTargets: Object.freeze([]),
    inspectionStatus: String(options.inspectionStatus || ''),
    missingWorkspaceIds: Object.freeze([]),
    selectionMode: selection.mode,
    requestedWorkspaceIds: selection.ids,
    workspaceAliases: Object.freeze([...workspaceAliases.entries()].map(([parentWorkspaceId, currentWorkspaceId]) => Object.freeze({ parentWorkspaceId, currentWorkspaceId }))),
    boundary: selection.mode === 'none'
      ? 'Package-parent carrier lineage was supplied without an explicit package-parent Workspace reuse selection; no parent Workspace source was carried. Qualified parent Workspace providers, when available, are read-only requirement-material sources only.'
      : 'No explicitly selected package-parent Workspace provider reuse was required.'
  });
}
function normalizeId(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function normalizeWorkspacePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\/+/, ''); }
function mediaTypeForPath(value = '') { const lower = String(value || '').toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
