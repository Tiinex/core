import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { createDeterministicStoredZip } from '../output/deterministic.zip.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { isHandoffPackageV1PreHandoffGroundingRequirement, projectHandoffPackageV1CacheIdentity, publicHandoffPackageV1Reference } from './handoffPackageV1.reference.js';
import {
  HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION,
  HANDOFF_PACKAGE_V1_EXTERNAL_PAYLOAD_SCHEMA_TARGET,
  HANDOFF_PACKAGE_V1_FORMAT_ID,
  HANDOFF_PACKAGE_V1_POINTER_SCHEMA_TARGET,
  HANDOFF_PACKAGE_V1_SCHEMA_ID,
  HANDOFF_PACKAGE_V1_SCHEMA_TARGET,
  HANDOFF_PACKAGE_V1_WORKSPACE_SCHEMA_TARGET
} from './handoffPackageV1.constants.js';
import {
  renderExternalPayloadDescriptor,
  renderGroundingPointer,
  renderHandoffPackageV1Root,
  renderHandoffPackageV1Start
} from './handoffPackageV1.render.js';

export function manufactureHandoffPackageV1Direct(input = {}, options = {}) {
  const findings = [];
  const carrierMode = String(input.carrierMode || 'handoff').trim().toLowerCase();
  if (!['handoff', 'workspace', 'bootstrap'].includes(carrierMode)) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.carrier-mode-invalid', 'Package V1 manufacture received an unsupported carrier mode.', { carrierMode }));
  const carrierDimension = String(input.carrierLineage?.dimension || '001').trim() || '001';
  const packageDimension = HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION;
  const createdAt = String(input.createdAt || artifactCreatedAt(input.handoff?.markdown) || '2026-01-01 00:00:00');
  const workspaceTargets = new Map((input.workspaceTargets || []).map((item) => [String(item.workspaceId || ''), String(item.path || '')]));
  const workspaces = [];
  const files = [];

  for (let workspaceIndex = 0; workspaceIndex < (input.workspaceMaterializations || []).length; workspaceIndex += 1) {
    const raw = input.workspaceMaterializations[workspaceIndex];
    const workspaceId = String(raw.id || '').trim();
    const targetPath = workspaceTargets.get(workspaceId) || '';
    const entries = Array.isArray(raw.entries) ? raw.entries : Array.isArray(raw.includedEntries) ? raw.includedEntries : [];
    const targetEntries = entries.filter((entry) => normalizePath(entry.path) === normalizePath(targetPath));
    if (!workspaceId || !targetPath || targetEntries.length !== 1) {
      findings.push(finding('error', 'portable.handoff-package-v1.manufacture.workspace-target-unresolved', 'Workspace target must resolve exactly once before direct Package V1 manufacture.', { workspaceId, targetPath, matches: targetEntries.length }));
      continue;
    }
    const prefix = `${packageDimension}-${workspaceIndex + 3}`;
    const slug = safeToken(workspaceId);
    const artifactPath = `${prefix}-${slug}.workspace.md`;
    const archivePath = `${prefix}-${slug}.workspace.zip`;
    const archiveBytes = createDeterministicStoredZip(entries.map((entry) => ({ name: normalizePath(entry.path), data: packageFileBytes(entry) })));
    const artifactFile = finalizeFile({ path: artifactPath, kind: 'workspace-artifact', logicalKind: 'exact-source-workspace-artifact', mediaType: 'text/markdown', data: packageFileBytes(targetEntries[0]) });
    const archiveFile = finalizeFile({ path: archivePath, kind: 'workspace-snapshot', logicalKind: 'exact-workspace-byte-tree-archive', mediaType: 'application/zip', data: archiveBytes });
    files.push(artifactFile, archiveFile);
    workspaces.push(Object.freeze({
      workspaceId, prefix, artifactPath, archivePath, archiveSha256: archiveFile.sha256, innerPath: targetPath,
      artifactFile, archiveFile, entries: Object.freeze(entries), markdown: decode(packageFileBytes(artifactFile))
    }));
  }

  if (carrierMode !== 'bootstrap' && !workspaces.length) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.workspaces-missing', 'Handoff and pointerless Workspace Package V1 manufacture require at least one carried Workspace.'));
  if (carrierMode === 'bootstrap' && workspaces.length) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.bootstrap-workspaces-forbidden', 'Bootstrap-only Package V1 manufacture must not carry Workspace material.'));

  const bootstrapFiles = input.additionalTransportFiles || [];
  if (!bootstrapFiles.length) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.bootstrap-missing', 'Qualified embedded Tooling bootstrap bytes are required.'));
  const bootstrapArchivePath = `${packageDimension}-2-bootstrap.zip`;
  const bootstrapArtifactPath = `${packageDimension}-2-bootstrap.trace.md`;
  const bootstrapBytes = bootstrapFiles.length ? createDeterministicStoredZip(bootstrapFiles.map((file) => ({ name: normalizePath(file.path), data: packageFileBytes(file) }))) : new Uint8Array();
  const bootstrapFile = finalizeFile({ path: bootstrapArchivePath, kind: 'tooling-bootstrap-payload', logicalKind: 'embedded-qualified-tooling-bootstrap', mediaType: 'application/zip', data: bootstrapBytes });

  const declaredRoutes = Array.isArray(input.transportRoutes) && input.transportRoutes.length ? input.transportRoutes : input.handoff?.path ? [{ workspaceId: workspaces[0]?.workspaceId || '', path: input.handoff.path }] : [];
  if (carrierMode !== 'handoff' && declaredRoutes.length) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.routeless-handoff-route-forbidden', 'Pointerless Workspace and bootstrap-only carriers must not manufacture Handoff routes.'));
  if (carrierMode === 'handoff' && !declaredRoutes.length) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.route-required', 'Handoff carrier manufacture requires one or more exact Handoff routes.'));
  const routes = carrierMode === 'handoff' ? declaredRoutes : [];

  const carriedIndex = buildCarriedIndex(workspaces);
  const materialByRequirement = indexMaterials(input.materials || []);
  const detachedRequired = collectCacheMaterials(input, materialByRequirement, carriedIndex, findings);
  if (carrierMode !== 'handoff' && detachedRequired.length) findings.push(finding('error', 'portable.handoff-package-v1.manufacture.routeless-cache-forbidden', 'Route-less Package V1 manufacture must not reinterpret Handoff closure cache material as generic Workspace representation authority.'));

  const routesByWorkspace = new Map();
  for (const route of routes) {
    const workspaceId = String(route.workspaceId || '');
    const list = routesByWorkspace.get(workspaceId) || [];
    list.push(route);
    routesByWorkspace.set(workspaceId, list);
  }

  const caches = [];
  const cacheByWorkspace = new Map();
  if (carrierMode === 'handoff') {
    for (const workspace of workspaces) {
      const workspaceRoutes = routesByWorkspace.get(workspace.workspaceId) || [];
      if (!workspaceRoutes.length) continue;
      const requiredForCache = collectCacheMaterialsForWorkspace(input, materialByRequirement, carriedIndex, workspace.workspaceId, workspaceRoutes, findings);
      if (!requiredForCache.length) continue;
      const cachePrefix = `${workspace.prefix}-1`;
      const cacheArtifactPath = `${cachePrefix}-cache.trace.md`;
      const cacheArchivePath = `${cachePrefix}-cache.zip`;
      const seenPaths = new Map();
      const cacheMaterials = [];
      for (const item of requiredForCache) {
        const projected = projectCacheIdentity(item);
        const archiveEntry = String(projected.archiveEntry || '');
        if (!archiveEntry || projected.state === 'unqualified' || projected.state === 'unsupported-adapter') {
          findings.push(finding('error', 'portable.handoff-package-v1.manufacture.cache-identity-unqualified', 'Required detached material has no qualified adapter-owned deterministic cache identity.', { requirementId: item.requirementId || '', referenceTarget: item.referenceTarget || '', sourceAdapter: projected.sourceAdapter || '', sourceIdentity: projected.sourceIdentity || '', sourceVersion: projected.sourceVersion || '', sourcePath: projected.sourcePath || '', workspaceId: workspace.workspaceId }));
          continue;
        }
        const existing = seenPaths.get(archiveEntry);
        if (existing && existing.sha256 !== item.sha256) {
          findings.push(finding('error', 'portable.handoff-package-v1.manufacture.cache-path-conflict', 'Two distinct exact materials project to the same cache path.', { archiveEntry, workspaceId: workspace.workspaceId }));
          continue;
        }
        if (!existing) seenPaths.set(archiveEntry, item);
        cacheMaterials.push(Object.freeze({ ...item, ...projected, archiveEntry }));
      }
      const unique = [...seenPaths.entries()].map(([name, item]) => ({ name, data: item.data }));
      const cacheBytes = createDeterministicStoredZip(unique);
      const cacheFile = finalizeFile({ path: cacheArchivePath, kind: 'bounded-cache-payload', logicalKind: 'package-local-bounded-cache', mediaType: 'application/zip', data: cacheBytes });
      const cache = {
        cacheId: `bounded-required-context-${safeToken(workspace.workspaceId)}`,
        workspaceId: workspace.workspaceId,
        prefix: cachePrefix,
        artifactPath: cacheArtifactPath,
        archivePath: cacheArchivePath,
        archiveFile: cacheFile,
        materials: cacheMaterials
      };
      caches.push(cache);
      cacheByWorkspace.set(workspace.workspaceId, cache);
    }
  }

  const rootPath = `${packageDimension}-tiinex-handoff-package.trace.md`;
  const startPath = `${packageDimension}-1-READ-BEFORE-PROCEEDING.trace.md`;
  const rootMarkdown = renderHandoffPackageV1Root({
    createdAt, carrierPrefix: input.carrierLineage?.prefix || '', dimension: carrierDimension, parentDimension: input.carrierLineage?.parentDimension || '', checkpointKind: input.carrierLineage?.checkpointKind || 'major', majorReason: input.carrierLineage?.majorReason || '',
    carrierMode, startPath, bootstrapArtifactPath, workspaces, caches
  });
  const rootFile = finalizeFile({ path: rootPath, kind: 'handoff-package-root', logicalKind: 'tiinex-handoff-package-v1-root', mediaType: 'text/markdown', content: rootMarkdown });
  const rootParent = parentAuthority(rootFile, rootMarkdown, HANDOFF_PACKAGE_V1_SCHEMA_ID, HANDOFF_PACKAGE_V1_SCHEMA_TARGET, createdAt);

  const bootstrapMarkdown = renderExternalPayloadDescriptor({
    createdAt, parent: rootParent, title: 'Portable Tooling Bootstrap', label: 'Package V1 portable Tooling bootstrap', summary: 'Exact embedded Tooling bootstrap payload used before recipient package interpretation.',
    role: 'portable Tooling bootstrap', archivePath: bootstrapArchivePath, bytes: bootstrapFile.bytes, sha256: bootstrapFile.sha256, materials: [],
    payloadCreatedAt: String(input.toolingBootstrap?.build?.createdAt || ''),
    producer: [String(input.toolingBootstrap?.core?.name || ''), String(input.toolingBootstrap?.core?.version || '')].filter(Boolean).join(' '),
    provenance: input.toolingBootstrap ? Object.freeze({
      compositionSha256: String(input.toolingBootstrap?.compositionSha256 || input.toolingBootstrap?.representationSha256 || ''),
      comparisonCommand: 'node <extract-root>/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs version --json',
      orderingBoundary: 'Build timestamp, Core version, bootstrap SHA and receipt order are comparison facts only; none establish global semantic supersession.'
    }) : null
  });
  const bootstrapArtifactFile = finalizeFile({ path: bootstrapArtifactPath, kind: 'tooling-bootstrap-descriptor', logicalKind: 'package-v1-bootstrap-descriptor', mediaType: 'text/markdown', content: bootstrapMarkdown });

  const branchBaseByWorkspace = new Map();
  for (const workspace of workspaces) {
    const workspaceAuthority = workspaceParent(workspace, createdAt);
    const cache = cacheByWorkspace.get(workspace.workspaceId) || null;
    if (!cache) {
      branchBaseByWorkspace.set(workspace.workspaceId, Object.freeze({ dimension: workspace.prefix, parent: workspaceAuthority }));
      continue;
    }
    const cacheMarkdown = renderExternalPayloadDescriptor({
      createdAt, parent: workspaceAuthority, title: 'Bounded Required Context Cache', label: `Bounded required context cache — ${workspace.workspaceId}`, summary: 'Exact required material absent from carried Workspace snapshots for routes owned by this Workspace.',
      role: 'package-local bounded required context cache', archivePath: cache.archivePath, bytes: cache.archiveFile.bytes, sha256: cache.archiveFile.sha256, materials: cache.materials
    });
    const cacheArtifactFile = finalizeFile({ path: cache.artifactPath, kind: 'bounded-cache-descriptor', logicalKind: 'package-v1-bounded-cache-descriptor', mediaType: 'text/markdown', content: cacheMarkdown });
    cache.artifactFile = cacheArtifactFile;
    cache.markdown = cacheMarkdown;
    files.push(cacheArtifactFile, cache.archiveFile);
    branchBaseByWorkspace.set(workspace.workspaceId, Object.freeze({
      dimension: cache.prefix,
      parent: parentAuthority(cacheArtifactFile, cacheMarkdown, 'tiinex.external.payload.v1', HANDOFF_PACKAGE_V1_EXTERNAL_PAYLOAD_SCHEMA_TARGET, createdAt)
    }));
  }

  const routePointerPaths = [];
  const routeFiles = [];
  const routeTreeByWorkspace = new Map();
  for (const workspace of workspaces) {
    const base = branchBaseByWorkspace.get(workspace.workspaceId);
    if (!base) continue;
    routeTreeByWorkspace.set(workspace.workspaceId, routeTreeRoot(base.dimension, base.parent));
  }

  for (const route of routes) {
    const routeWorkspaceId = String(route.workspaceId || '');
    const routePath = normalizePath(route.path || '');
    const routeWorkspace = workspaces.find((item) => item.workspaceId === routeWorkspaceId);
    const routeEntry = carriedEntry(carriedIndex, routeWorkspaceId, routePath);
    if (!routeWorkspace || !routeEntry) {
      findings.push(finding('error', 'portable.handoff-package-v1.manufacture.route-unresolved', 'Selected Handoff route is not exact carried Workspace material.', { workspaceId: routeWorkspaceId, path: routePath }));
      continue;
    }
    const tree = routeTreeByWorkspace.get(routeWorkspaceId);
    if (!tree) {
      findings.push(finding('error', 'portable.handoff-package-v1.manufacture.route-workspace-branch-unresolved', 'Selected Handoff route has no package-local owning Workspace branch.', { workspaceId: routeWorkspaceId, path: routePath }));
      continue;
    }
    const cache = cacheByWorkspace.get(routeWorkspaceId) || null;
    const specs = buildRoutePointerSpecs({ input, route, routeWorkspace, routeEntry, cache, materialByRequirement, carriedIndex, findings });
    if (!specs.length || specs[specs.length - 1].pointerKind !== 'handoff') continue;
    const leaf = insertRouteSpecs(tree, specs);
    routePointerPaths.push(leaf.path);
  }

  for (const workspace of workspaces) {
    const tree = routeTreeByWorkspace.get(workspace.workspaceId);
    if (tree) renderRouteTree(tree, routeFiles, createdAt);
  }

  const startMarkdown = renderHandoffPackageV1Start({ carrierMode, createdAt, parent: rootParent, bootstrapArtifactPath, bootstrapArchivePath, routePointers: routePointerPaths });
  const startFile = finalizeFile({ path: startPath, kind: 'recipient-start', logicalKind: 'package-v1-read-before-proceeding', mediaType: 'text/markdown', content: startMarkdown });

  files.unshift(rootFile, startFile, bootstrapArtifactFile, bootstrapFile);
  files.push(...routeFiles);
  const bundle = Object.freeze({ schema: 'tiinex.portable.handoff-package-v1.bundle.v1', status: findings.some((f) => f.severity === 'error') ? 'blocked' : 'ready', transportFormat: HANDOFF_PACKAGE_V1_FORMAT_ID, files: Object.freeze(files) });
  const inspection = inspectHandoffPackageV1(bundle);
  const roundtrip = options.verifyRoundtrip === false || input.verifyRoundtrip === false ? null : physicalRoundtrip(bundle);
  const status = !findings.some((f) => f.severity === 'error') && inspection.status === 'valid' && (!roundtrip || roundtrip.status === 'passed') ? 'ready' : 'blocked';
  const allFindings = Object.freeze([...findings, ...(inspection.findings || []), ...(roundtrip?.findings || [])]);
  return Object.freeze({ schema: 'tiinex.portable.handoff-package-v1.manufacture.v1', status, bundle: Object.freeze({ ...bundle, status }), inspection, roundtrip, findings: allFindings });
}

function buildRoutePointerSpecs({ input, route, routeWorkspace, routeEntry, cache, materialByRequirement, carriedIndex, findings }) {
  const specs = [];
  const routeEndpointRequirements = routeRequirements(input.requirements?.endpointRoles || [], route);
  const routeParticipantRequirements = routeRequirements(input.requirements?.participantRoles || [], route);
  const roleReferences = new Set([...routeEndpointRequirements, ...routeParticipantRequirements].map((requirement) => String(requirement.reference?.target || '')).filter(Boolean));
  const requiredContextRequirements = routeRequirements(input.requirements?.required || [], route).filter((requirement) => !roleReferences.has(String(requirement.reference?.target || '')));
  const preHandoffRequirements = requiredContextRequirements.filter((requirement) => shouldProjectGenericPointer(requirement, materialByRequirement));
  const dependencyRequirements = preHandoffDependencyRequirements(routeRequirements(input.requirements?.dependencies || [], route), preHandoffRequirements)
    .filter((requirement) => requirementNeedsCachePointer(requirement, materialByRequirement, carriedIndex));
  const genericRequirements = [...preHandoffRequirements, ...dependencyRequirements];

  for (const requirement of genericRequirements) {
    const target = pointerTargetForRequirement(requirement, materialByRequirement, carriedIndex, cache, findings);
    if (!target) continue;
    const pointerKind = pointerKindForRequirement(requirement);
    const slug = safeToken(requirement.name || pointerKind || 'context');
    specs.push(pointerSpec({
      pointerKind,
      requirement,
      requirementId: packageRequirementId(requirement),
      referenceTarget: publicHandoffPackageV1Reference(requirement.reference?.target || ''),
      target,
      suffix: `${slug}-pointer.trace.md`,
      kind: 'grounding-pointer',
      logicalKind: `package-v1-${pointerKind}-pointer`,
      title: `${human(pointerKind)} Pointer — ${requirement.name || slug}`
    }));
  }

  for (const requirement of routeParticipantRequirements) {
    const target = pointerTargetForRequirement(requirement, materialByRequirement, carriedIndex, cache, findings);
    if (!target) continue;
    const slug = safeToken(requirement.roleLabel || requirement.name || 'participant');
    specs.push(pointerSpec({
      pointerKind: 'participant-role',
      requirement,
      requirementId: packageRequirementId(requirement),
      referenceTarget: publicHandoffPackageV1Reference(requirement.reference?.target || ''),
      target,
      roleLabelHint: requirement.roleLabel || '',
      suffix: `${slug}-role-pointer.trace.md`,
      kind: 'participant-role-pointer',
      logicalKind: 'package-v1-participant-role-pointer',
      title: `Participant Role Pointer — ${requirement.roleLabel || requirement.name || slug}`
    }));
  }

  const endpoints = [...routeEndpointRequirements].sort((a, b) => endpointOrdinal(a) - endpointOrdinal(b));
  for (const requirement of endpoints) {
    const target = pointerTargetForRequirement(requirement, materialByRequirement, carriedIndex, cache, findings);
    if (!target) continue;
    const side = String(requirement.id || '').includes(':from') ? 'from' : String(requirement.id || '').includes(':to') ? 'to' : 'endpoint';
    const slug = safeToken(requirement.roleLabel || requirement.name || side);
    specs.push(pointerSpec({
      pointerKind: 'endpoint-role',
      requirement,
      requirementId: packageRequirementId(requirement),
      referenceTarget: publicHandoffPackageV1Reference(requirement.reference?.target || ''),
      target,
      endpointParty: side,
      roleLabelHint: requirement.roleLabel || '',
      suffix: `${slug}-${side}-role-pointer.trace.md`,
      kind: 'endpoint-role-pointer',
      logicalKind: 'package-v1-endpoint-role-pointer',
      title: `${human(side)} Role Pointer — ${requirement.roleLabel || requirement.name || slug}`
    }));
  }

  const routeWorkspaceId = String(route.workspaceId || '');
  const routePath = normalizePath(route.path || '');
  specs.push(pointerSpec({
    pointerKind: 'handoff',
    requirement: null,
    requirementId: `handoff-route:${routeWorkspaceId}:${routePath}`,
    referenceTarget: publicHandoffPackageV1Reference(route.referenceTarget || route.reference || ''),
    target: {
      targetCarrierKind: 'workspace-archive-entry', targetWorkspaceId: routeWorkspaceId, archivePath: routeWorkspace.archivePath, targetInnerPath: routePath,
      targetBytes: routeEntry.bytes, targetSha256: routeEntry.sha256
    },
    suffix: 'handoff-pointer.trace.md',
    kind: 'handoff-pointer',
    logicalKind: 'package-v1-handoff-pointer',
    title: 'Handoff Pointer',
    summary: 'Package-local pointer to the exact authoritative Handoff artifact inside its carried Workspace.',
    routeIdentity: `${routeWorkspaceId}\0${routePath}`
  }));
  return specs;
}

function pointerSpec(input = {}) {
  const requirement = input.requirement || {};
  const target = Object.freeze({ ...(input.target || {}) });
  const semantic = Object.freeze({
    pointerKind: String(input.pointerKind || ''),
    requirementId: String(input.requirementId || ''),
    name: String(requirement.name || ''),
    material: String(requirement.material || ''),
    purpose: String(requirement.purpose || ''),
    referenceTarget: String(input.referenceTarget || ''),
    targetCarrierKind: String(target.targetCarrierKind || ''),
    targetWorkspaceId: String(target.targetWorkspaceId || ''),
    archivePath: String(target.archivePath || ''),
    targetInnerPath: String(target.targetInnerPath || ''),
    targetArchiveEntry: String(target.targetArchiveEntry || ''),
    targetBytes: Number(target.targetBytes || 0),
    targetSha256: String(target.targetSha256 || ''),
    endpointParty: String(input.endpointParty || ''),
    roleLabelHint: String(input.roleLabelHint || ''),
    routeIdentity: String(input.routeIdentity || '')
  });
  return Object.freeze({ ...input, target, shareKey: JSON.stringify(semantic) });
}

function routeTreeRoot(dimension, parent) {
  return { dimension, parent, children: [], childrenByKey: new Map() };
}

function insertRouteSpecs(root, specs = []) {
  let parent = root;
  let leaf = null;
  for (const spec of specs) {
    let node = parent.childrenByKey.get(spec.shareKey) || null;
    if (!node) {
      const dimension = `${parent.dimension}-${parent.children.length + 1}`;
      node = { spec, dimension, path: `${dimension}-${spec.suffix}`, children: [], childrenByKey: new Map(), parent: null, file: null, markdown: '' };
      parent.children.push(node);
      parent.childrenByKey.set(spec.shareKey, node);
    }
    parent = node;
    leaf = node;
  }
  return leaf;
}

function renderRouteTree(root, out, createdAt) {
  for (const child of root.children) renderRouteNode(child, root.parent, out, createdAt);
}

function renderRouteNode(node, parent, out, createdAt) {
  const spec = node.spec;
  const markdown = renderGroundingPointer({
    createdAt,
    parent,
    pointerKind: spec.pointerKind,
    requirementId: spec.requirementId,
    referenceTarget: spec.referenceTarget,
    endpointParty: spec.endpointParty || '',
    roleLabelHint: spec.roleLabelHint || '',
    title: spec.title,
    summary: spec.summary || '',
    ...spec.target
  });
  const file = finalizeFile({ path: node.path, kind: spec.kind, logicalKind: spec.logicalKind, mediaType: 'text/markdown', content: markdown });
  node.file = file;
  node.markdown = markdown;
  out.push(file);
  const authority = parentAuthority(file, markdown, 'tiinex.pointer.v1', HANDOFF_PACKAGE_V1_POINTER_SCHEMA_TARGET, createdAt);
  for (const child of node.children) renderRouteNode(child, authority, out, createdAt);
}

function collectCacheMaterials(input, materialIndex, carriedIndex, findings) {
  const requirements = allRequirements(input);
  const out = new Map();
  for (const requirement of requirements) {
    const item = detachedMaterialForRequirement(requirement, materialIndex, carriedIndex, findings);
    if (!item) continue;
    out.set(`${item.requirementId}\0${item.referenceTarget}\0${item.sha256}`, item);
  }
  return Object.freeze([...out.values()]);
}

function collectCacheMaterialsForWorkspace(input, materialIndex, carriedIndex, workspaceId, routes, findings) {
  const requirements = allRequirements(input).filter((requirement) => requirementAppliesToWorkspaceRoutes(requirement, workspaceId, routes));
  const out = new Map();
  for (const requirement of requirements) {
    const item = detachedMaterialForRequirement(requirement, materialIndex, carriedIndex, findings);
    if (!item) continue;
    out.set(`${item.requirementId}\0${item.referenceTarget}\0${item.sha256}`, item);
  }
  return Object.freeze([...out.values()]);
}

function allRequirements(input) {
  return [
    ...(input.requirements?.required || []), ...(input.requirements?.endpointRoles || []), ...(input.requirements?.participantRoles || []), ...(input.requirements?.dependencies || [])
  ];
}

function requirementAppliesToWorkspaceRoutes(requirement, workspaceId, routes) {
  const routeWorkspaceId = String(requirement.routeWorkspaceId || '');
  const routePath = normalizePath(requirement.routePath || '');
  if (routeWorkspaceId && routeWorkspaceId !== workspaceId) return false;
  if (!routes.length) return false;
  if (!routePath) return true;
  return routes.some((route) => normalizePath(route.path || '') === routePath);
}

function detachedMaterialForRequirement(requirement, materialIndex, carriedIndex, findings) {
  const material = materialForRequirement(materialIndex, requirement);
  if (!material) return null;
  const workspaceId = String(material.provenance?.workspaceId || material.workspaceId || '');
  const sourcePath = normalizePath(material.provenance?.path || material.path || '');
  const carried = carriedEntry(carriedIndex, workspaceId, sourcePath);
  const data = packageFileBytes(material);
  const sha256 = String(material.sha256 || sha256Hex(data));
  if (carried && carried.sha256 === sha256) return null;
  if (!data.byteLength) {
    findings.push(finding('error', 'portable.handoff-package-v1.manufacture.cache-material-bytes-missing', 'Detached required material has no exact bytes.', { requirementId: requirement.id || '' }));
    return null;
  }
  return Object.freeze({ requirementId: requirement.id || '', name: requirement.name || '', referenceTarget: requirement.reference?.target || material.referenceTarget || '', sourceWorkspaceId: workspaceId, sourcePath, bytes: data.byteLength, sha256, data, material });
}

function buildCarriedIndex(workspaces) { const map=new Map(); for(const w of workspaces) for(const entry of w.entries||[]) map.set(`${w.workspaceId}\0${normalizePath(entry.path)}`, Object.freeze({ ...entry, workspaceId:w.workspaceId, archivePath:w.archivePath, data:packageFileBytes(entry), sha256:String(entry.sha256||sha256Hex(packageFileBytes(entry))), bytes:Number(entry.bytes||packageFileBytes(entry).byteLength) })); return map; }
function carriedEntry(index, workspaceId, p) { return index.get(`${String(workspaceId||'')}\0${normalizePath(p)}`) || null; }
function indexMaterials(items) { const map=new Map(); for(const item of items||[]) { const id=String(item.requirementId||''); if(!map.has(id))map.set(id,[]);map.get(id).push(item); } return map; }
function materialForRequirement(index, req) { const candidates=index.get(String(req.id||''))||[]; const target=String(req.reference?.target||''); return candidates.find((m)=>!target||String(m.referenceTarget||'')===target) || candidates[0] || null; }
function pointerTargetForRequirement(requirement, materialIndex, carriedIndex, cache, findings) {
  const material=materialForRequirement(materialIndex,requirement); if(!material){findings.push(finding('error','portable.handoff-package-v1.manufacture.pointer-material-missing','Pointer requirement has no exact qualified material.',{requirementId:requirement.id||''}));return null;}
  const workspaceId=String(material.provenance?.workspaceId||material.workspaceId||''); const sourcePath=normalizePath(material.provenance?.path||material.path||''); const carried=carriedEntry(carriedIndex,workspaceId,sourcePath);
  if(carried) return {targetCarrierKind:'workspace-archive-entry',targetWorkspaceId:workspaceId,archivePath:carried.archivePath,targetInnerPath:sourcePath,targetBytes:carried.bytes,targetSha256:carried.sha256};
  const cachedResolution=resolveHandoffPackageV1CachePointerMaterial(cache,requirement);
  const cached=cachedResolution.material;
  if(cached) return {targetCarrierKind:'bounded-cache-entry',targetWorkspaceId:'',archivePath:cache.archivePath,targetArchiveEntry:cached.archiveEntry,targetBytes:cached.bytes,targetSha256:cached.sha256};
  if(cachedResolution.state==='ambiguous'){findings.push(finding('error','portable.handoff-package-v1.manufacture.pointer-cache-reference-ambiguous','Pointer cache fallback matched multiple materials with the same reference target; exact requirement identity is required.',{requirementId:requirement.id||'',referenceTarget:cachedResolution.referenceTarget,matches:cachedResolution.matches}));return null;}
  findings.push(finding('error','portable.handoff-package-v1.manufacture.pointer-target-unresolved','Pointer requirement is neither carried nor cached in the owning route Workspace branch.',{requirementId:requirement.id||'',routeWorkspaceId:String(requirement.routeWorkspaceId||'')}));return null;
}

export function resolveHandoffPackageV1CachePointerMaterial(cache = null, requirement = {}) {
  const exactRequirementId=String(requirement.id||'');
  const exact=(cache?.materials||[]).find((item)=>exactRequirementId&&String(item.requirementId||'')===exactRequirementId) || null;
  if(exact) return Object.freeze({state:'qualified-exact-requirement',material:exact,referenceTarget:String(requirement.reference?.target||''),matches:1});
  const referenceTarget=String(requirement.reference?.target||'');
  const matches=referenceTarget ? (cache?.materials||[]).filter((item)=>String(item.referenceTarget||'')===referenceTarget) : [];
  if(matches.length===1) return Object.freeze({state:'qualified-unique-reference-fallback',material:matches[0],referenceTarget,matches:1});
  if(matches.length>1) return Object.freeze({state:'ambiguous',material:null,referenceTarget,matches:matches.length});
  return Object.freeze({state:'unresolved',material:null,referenceTarget,matches:0});
}

function projectCacheIdentity(item) {
  return projectHandoffPackageV1CacheIdentity({
    referenceTarget:item.referenceTarget,
    sourceAdapter:item.material?.sourceAdapter||item.material?.adapterId||item.material?.source?.adapterId||'',
    sourceIdentity:item.material?.sourceIdentity||item.material?.source?.identity||'',
    sourceVersion:item.material?.sourceVersion||item.material?.source?.version||item.material?.source?.commit||item.material?.source?.ref||'',
    sourcePath:item.material?.source?.path||item.material?.providerPath||item.sourcePath||'',
    sourceWorkspaceId:item.sourceWorkspaceId,
    name:item.name
  });
}
function routeRequirements(items, route) { const wid=String(route.workspaceId||''); const p=normalizePath(route.path||''); return (items||[]).filter((x)=>{const rw=String(x.routeWorkspaceId||'');const rp=normalizePath(x.routePath||'');return(!rw||rw===wid)&&(!rp||rp===p);}); }

function preHandoffDependencyRequirements(dependencies = [], roots = []) {
  const rootIds = new Set((roots || []).map((item) => String(item.id || '')).filter(Boolean));
  const selected = [];
  const selectedIds = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const dependency of dependencies || []) {
      const id = String(dependency.id || '');
      const sourceId = String(dependency.sourceRequirementId || '');
      if (!id || selectedIds.has(id) || (!rootIds.has(sourceId) && !selectedIds.has(sourceId))) continue;
      selected.push(dependency); selectedIds.add(id); changed = true;
    }
  }
  return selected;
}

function requirementNeedsCachePointer(requirement, materialIndex, carriedIndex) {
  const material = materialForRequirement(materialIndex, requirement);
  if (!material) return false;
  const workspaceId = String(material.provenance?.workspaceId || material.workspaceId || '');
  const sourcePath = normalizePath(material.provenance?.path || material.path || '');
  return !carriedEntry(carriedIndex, workspaceId, sourcePath);
}
function shouldProjectGenericPointer(req, materialIndex) {
  if (isHandoffPackageV1PreHandoffGroundingRequirement(req)) return true;
  return !String(req.reference?.target || '').trim() && Boolean(materialForRequirement(materialIndex, req));
}
function pointerKindForRequirement(req) { const text=`${req.name||''} ${req.material||''}`.toLowerCase(); if(/policy|governance/.test(text))return'policy'; if(/process|procedure|runbook/.test(text))return'process'; return'required-context'; }
function endpointOrdinal(req){const id=String(req.id||'');return id.includes(':from')?0:id.includes(':to')?1:2;}
function packageRequirementId(requirement = {}) {
  const id = String(requirement.id || '');
  const routed = id.match(/^route:[^:]+:[^:]+:(.+)$/);
  if (routed) return routed[1];
  const participant = id.match(/^participant-role:[^:]+:(.+)$/);
  if (participant) return `participant-role:${participant[1]}`;
  return id;
}
function physicalRoundtrip(bundle){
  try { const bytes=createDeterministicStoredZip((bundle.files||[]).map((file)=>({name:file.path,data:packageFileBytes(file)}))); const parsed=inspectStoredWorkspaceArchive(bytes,{ownedBytes:true}); if(parsed.state!=='qualified')return Object.freeze({status:'failed',bytes:bytes.byteLength,findings:Object.freeze([finding('error','portable.handoff-package-v1.roundtrip.zip-invalid','Serialized Package V1 ZIP could not be read back.')])}); const files=(parsed.entries||[]).map((e)=>finalizeFile({path:e.path,data:e.data})); const inspection=inspectHandoffPackageV1({files}); return Object.freeze({status:inspection.status==='valid'?'passed':'failed',bytes:bytes.byteLength,data:new Uint8Array(bytes),inspection,findings:Object.freeze(inspection.status==='valid'?[]:inspection.findings||[])}); } catch(error){return Object.freeze({status:'failed',bytes:0,findings:Object.freeze([finding('error','portable.handoff-package-v1.roundtrip.failed','Physical Package V1 roundtrip failed.',{detail:String(error?.message||error)})])});}
}
function parentAuthority(file,markdown,schemaId,schemaTarget,createdAt){return Object.freeze({path:file.path,markdown,schemaId,schemaTarget,createdAt});}
function workspaceParent(workspace,createdAt){return Object.freeze({path:workspace.artifactPath,markdown:workspace.markdown,schemaId:'tiinex.workspace.v1',schemaTarget:HANDOFF_PACKAGE_V1_WORKSPACE_SCHEMA_TARGET,createdAt:artifactCreatedAt(workspace.markdown)||createdAt});}
function artifactCreatedAt(markdown=''){try{return String(parseArtifactMarkdown(String(markdown||'')).envelope?.current?.createdAt||'');}catch{return'';}}
function normalizePath(v=''){return String(v||'').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\/+/, '').split('/').filter((x)=>x&&x!=='.'&&x!=='..').join('/');}
function safeToken(v=''){return String(v||'').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'workspace';}
function human(v=''){return String(v||'').replace(/(^|-)([a-z])/g,(_,p,c)=>`${p?' ':''}${c.toUpperCase()}`);}
function decode(data){try{return new TextDecoder('utf-8',{fatal:true}).decode(data);}catch{return'';}}
function finding(severity,code,message,extra={}){return Object.freeze({severity,code,message,...extra});}
