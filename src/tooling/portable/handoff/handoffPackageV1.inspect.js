import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState, verifyC14nV2TargetSelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { projectHandoffMaterialRequirements } from './materialClosure.requirements.js';
import { HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION, HANDOFF_PACKAGE_V1_FORMAT_ID, HANDOFF_PACKAGE_V1_INSPECTION_SCHEMA_ID, HANDOFF_PACKAGE_V1_SCHEMA_ID } from './handoffPackageV1.constants.js';
import { isHandoffPackageV1PreHandoffGroundingRequirement, parseHandoffPackageV1Reference, projectHandoffPackageV1CacheIdentity, resolveHandoffPackageV1RelativeReference } from './handoffPackageV1.reference.js';
import { normalizeRepositoryIdentity, parseWorkspaceEntrypoints } from './workspaceSourceIdentity.js';

export function inspectHandoffPackageV1(bundle = {}) {
  const files = Array.isArray(bundle?.files) ? bundle.files : [];
  const findings = [];
  const index = indexFiles(files, findings);
  for (const file of files) {
    const p = String(file.path || '');
    if (p.includes('/')) findings.push(finding('error', 'portable.handoff-package-v1.root.nonflat', 'Handoff Package V1 root must be flat.', { path: p }));
    if (/\.json$/i.test(p)) findings.push(finding('error', 'portable.handoff-package-v1.parallel-json.forbidden', 'Recipient Package V1 root must not expose JSON parallel truth.', { path: p }));
    if (/\.bin$/i.test(p)) findings.push(finding('error', 'portable.handoff-package-v1.binary-indirection.forbidden', 'Recipient Package V1 must not use generic .bin material indirection.', { path: p }));
  }

  const rootCandidates = markdownArtifacts(files).filter(({ parsed }) => String(parsed?.envelope?.current?.schema?.id || '') === HANDOFF_PACKAGE_V1_SCHEMA_ID);
  const root = rootCandidates.length === 1 ? rootCandidates[0] : null;
  if (!root) findings.push(finding('error', 'portable.handoff-package-v1.root.cardinality', 'Package must contain exactly one tiinex.handoff.package.v1 root artifact.', { count: rootCandidates.length }));
  if (root) {
    qualifyTrace(root, null, findings);
    const expectedRootPath = `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-tiinex-handoff-package.trace.md`;
    if (root.path !== expectedRootPath) findings.push(finding('error', 'portable.handoff-package-v1.root.package-namespace-invalid', 'Package V1 artifact namespace must begin at package-local root 001 independently of carrier lineage.', { path: root.path, expected: expectedRootPath }));
  }
  const contract = root ? parsePackageRoot(root.markdown) : null;
  if (root && !packageModeForRole(contract.packageRole)) findings.push(finding('error', 'portable.handoff-package-v1.role.unsupported', 'Package V1 declares an unsupported recipient-facing carrier role.', { observed: contract.packageRole }));

  const startPath = contract?.startPath || '';
  const start = artifactAt(index, startPath);
  if (!start) findings.push(finding('error', 'portable.handoff-package-v1.start.missing', 'Declared Start artifact is missing.', { path: startPath }));
  else if (root) qualifyTrace(start, root, findings);
  const expectedStartPath = `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-1-READ-BEFORE-PROCEEDING.trace.md`;
  if (startPath && startPath !== expectedStartPath) findings.push(finding('error', 'portable.handoff-package-v1.start.package-namespace-invalid', 'Package V1 Start must occupy package-local coordinate 001-1 independently of carrier lineage.', { path: startPath, expected: expectedStartPath }));

  const bootstrapArtifactPath = contract?.bootstrapArtifactPath || '';
  const bootstrapArtifact = artifactAt(index, bootstrapArtifactPath);
  if (!bootstrapArtifact) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap.descriptor-missing', 'Declared bootstrap descriptor is missing.', { path: bootstrapArtifactPath }));
  else if (root) qualifyTrace(bootstrapArtifact, root, findings);
  const expectedBootstrapPath = `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-2-bootstrap.trace.md`;
  if (bootstrapArtifactPath && bootstrapArtifactPath !== expectedBootstrapPath) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap.package-namespace-invalid', 'Package V1 bootstrap descriptor must occupy package-local coordinate 001-2 independently of carrier lineage.', { path: bootstrapArtifactPath, expected: expectedBootstrapPath }));
  const bootstrapFacts = bootstrapArtifact ? parseExternalPayload(bootstrapArtifact.markdown) : null;
  const bootstrapFile = bootstrapFacts ? one(index, bootstrapFacts.location, findings) : null;
  if (bootstrapFacts && bootstrapFile) verifyPayloadFile(bootstrapFacts, bootstrapFile, findings, 'bootstrap');

  const workspaces = [];
  for (const binding of contract?.workspaces || []) {
    const artifact = artifactAt(index, binding.artifactPath);
    const archiveFile = one(index, binding.archivePath, findings);
    if (!artifact) { findings.push(finding('error', 'portable.handoff-package-v1.workspace.artifact-missing', 'Workspace binding artifact is missing.', { workspaceId: binding.workspaceId, path: binding.artifactPath })); continue; }
    qualifyTrace(artifact, null, findings, { requireParent: false, expectedSchema: 'tiinex.workspace.v1' });
    if (!archiveFile) continue;
    const archiveBytes = packageFileBytes(archiveFile);
    const observedArchiveSha = sha256Hex(archiveBytes);
    if (binding.archiveSha256 && binding.archiveSha256 !== observedArchiveSha) findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-sha-mismatch', 'Workspace archive SHA-256 does not match the root binding.', { workspaceId: binding.workspaceId }));
    const archive = inspectStoredWorkspaceArchive(archiveBytes, { ownedBytes: true });
    if (archive.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-invalid', 'Workspace snapshot ZIP is not a qualified readable archive.', { workspaceId: binding.workspaceId }));
    const matches = archive.state === 'qualified' ? (archive.entries || []).filter((e) => norm(e.path) === norm(binding.innerPath)) : [];
    if (matches.length !== 1) findings.push(finding('error', 'portable.handoff-package-v1.workspace.identity-unresolved', 'Workspace artifact inner path does not resolve exactly once in the snapshot.', { workspaceId: binding.workspaceId, innerPath: binding.innerPath, matches: matches.length }));
    else if (sha256Hex(matches[0].data) !== sha256Hex(packageFileBytes(artifact.file))) findings.push(finding('error', 'portable.handoff-package-v1.workspace.identity-byte-mismatch', 'Visible Workspace artifact bytes do not match the exact inner Workspace artifact bytes.', { workspaceId: binding.workspaceId }));
    workspaces.push(Object.freeze({ ...binding, coverage: 'complete', bindingState: 'verified', archive, artifactPath: binding.artifactPath, workspaceArchivePath: binding.archivePath, sourceWorkspaceTargetInnerPath: binding.innerPath, sourceEntrypoints: parseWorkspaceEntrypoints(artifact.markdown) }));
  }

  const caches = [];
  for (const binding of contract?.caches || []) {
    const artifact = artifactAt(index, binding.artifactPath);
    const archiveFile = one(index, binding.archivePath, findings);
    if (!artifact) { findings.push(finding('error', 'portable.handoff-package-v1.cache.descriptor-missing', 'Bounded cache descriptor is missing.', { cacheId: binding.cacheId })); continue; }
    const parent = resolveParentArtifact(index, artifact.markdown);
    qualifyTrace(artifact, parent, findings, { expectedSchema: 'tiinex.external.payload.v1' });
    const owningWorkspace = parent ? workspaces.find((workspace) => workspace.artifactPath === parent.path) || null : null;
    if (!owningWorkspace) findings.push(finding('error', 'portable.handoff-package-v1.cache.workspace-parent-invalid', 'Bounded cache descriptor must be a direct package-local child of exactly one carried Workspace artifact.', { cacheId: binding.cacheId, path: binding.artifactPath, parent: parent?.path || '' }));
    const facts = parseExternalPayload(artifact.markdown);
    if (!archiveFile || !facts) continue;
    verifyPayloadFile(facts, archiveFile, findings, 'cache');
    const archive = inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true });
    if (archive.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.cache.archive-invalid', 'Bounded cache ZIP is not a qualified readable archive.', { cacheId: binding.cacheId }));
    caches.push(Object.freeze({ ...binding, workspaceId: owningWorkspace?.workspaceId || '', artifactPath: binding.artifactPath, archivePath: binding.archivePath, archive, materials: Object.freeze([]) }));
  }

  const pointerArtifacts = markdownArtifacts(files).filter(({ path, parsed }) => String(parsed?.envelope?.current?.schema?.id || '') === 'tiinex.pointer.v1' && String(path || '') !== startPath);
  const endpointRoles = [];
  const participantRoles = [];
  const groundingPointers = [];
  const routes = [];
  for (const pointer of pointerArtifacts) {
    const parent = resolveParentArtifact(index, pointer.markdown);
    qualifyTrace(pointer, parent, findings, { expectedSchema: 'tiinex.pointer.v1' });
    const facts = parsePointerFacts(pointer.markdown);
    if (!facts.pointerKind) continue;
    const material = resolvePointerTarget({ facts, workspaces, caches, index, findings, pointerPath: pointer.path });
    const common = Object.freeze({
      pointerPath: pointer.path,
      requirementId: facts.requirementId,
      referenceTarget: facts.referenceTarget,
      targetCarrierKind: facts.targetCarrierKind,
      targetWorkspaceId: facts.targetWorkspaceId,
      targetInnerPath: facts.targetInnerPath,
      targetArchiveEntry: facts.targetArchiveEntry,
      archivePath: facts.archivePath,
      targetBytes: facts.targetBytes,
      targetSha256: facts.targetSha256,
      roleLabelHint: facts.roleLabelHint,
      endpointParty: facts.endpointParty,
      resolution: material
    });
    if (facts.pointerKind === 'endpoint-role') endpointRoles.push(common);
    else if (facts.pointerKind === 'participant-role') participantRoles.push(common);
    else if (facts.pointerKind === 'handoff') {
      const workspaceId = facts.targetWorkspaceId;
      const workspace = workspaces.find((w) => w.workspaceId === workspaceId) || null;
      routes.push(Object.freeze({
        id: facts.requirementId || `handoff-route:${workspaceId}:${facts.targetInnerPath}`,
        routeId: facts.requirementId || `handoff-route:${workspaceId}:${facts.targetInnerPath}`,
        state: material?.state === 'qualified' ? 'qualified' : 'blocked',
        pointerPath: pointer.path,
        referenceTarget: facts.referenceTarget,
        workspaceId,
        workspaceRelativeHandoffPath: facts.targetInnerPath,
        workspaceRelativePath: facts.targetInnerPath,
        packagePath: workspace?.archivePath || facts.archivePath,
        sha256: facts.targetSha256,
        endpointRolePointers: Object.freeze(pointerAncestors(pointer.path, endpointRoles, index)),
        participantRolePointers: Object.freeze(pointerAncestors(pointer.path, participantRoles, index)),
        groundingPointers: Object.freeze(pointerAncestors(pointer.path, groundingPointers, index)),
        parties: Object.freeze({ from: '', to: '' })
      }));
    } else groundingPointers.push(Object.freeze({ ...common, pointerKind: facts.pointerKind }));
  }

  const cachePointerEntries = new Map();
  for (const pointer of [...endpointRoles, ...participantRoles, ...groundingPointers]) {
    if (pointer.targetCarrierKind !== 'bounded-cache-entry') continue;
    const list = cachePointerEntries.get(pointer.archivePath) || new Set();
    list.add(norm(pointer.targetArchiveEntry));
    cachePointerEntries.set(pointer.archivePath, list);
  }
  // Re-project route pointer ancestor lists after all pointers have been observed and
  // rebuild Required Context closure from the authoritative Handoff. Only material
  // required before following the Handoff needs a root-level grounding Pointer;
  // ordinary Required Context resolves after Handoff selection from carried Workspace
  // bytes first and bounded cache second.
  const projectedRoutes = routes.map((route) => {
    const endpointRolePointers = Object.freeze(pointerAncestors(route.pointerPath, endpointRoles, index));
    const participantRolePointers = Object.freeze(pointerAncestors(route.pointerPath, participantRoles, index));
    const routeGroundingPointers = Object.freeze(pointerAncestors(route.pointerPath, groundingPointers, index));
    const ancestorPaths = new Set([...endpointRolePointers, ...participantRolePointers, ...routeGroundingPointers]);
    const candidates = [...endpointRoles, ...participantRoles, ...groundingPointers].filter((pointer) => ancestorPaths.has(pointer.pointerPath));
    const handoffMarkdown = workspaceEntryMarkdown(workspaces, route.workspaceId, route.workspaceRelativeHandoffPath);
    const projected = handoffMarkdown ? projectHandoffMaterialRequirements({ markdown: handoffMarkdown, path: route.workspaceRelativeHandoffPath }) : { required: [], findings: [] };
    const parties = handoffMarkdown ? Object.freeze({ from: field(section(handoffMarkdown, 'Handoff Parties'), 'From'), to: field(section(handoffMarkdown, 'Handoff Parties'), 'To') }) : Object.freeze({ from: '', to: '' });
    for (const item of projected.findings || []) findings.push(finding(item.severity || 'warning', item.code || 'portable.handoff-package-v1.required-context.parse', item.message || 'Required Context projection reported a finding.', { routeId: route.id }));
    const required = (projected.required || []).map((requirement) => projectRequiredClosureRequirement(requirement, candidates, findings, route, workspaces, caches));
    const requiredReady = required.every((requirement) => requirement.state === 'qualified');
    return Object.freeze({
      ...route,
      from: parties.from,
      to: parties.to,
      parties,
      endpointRolePointers,
      participantRolePointers,
      groundingPointers: routeGroundingPointers,
      requiredClosure: Object.freeze({ state: requiredReady ? 'qualified' : 'blocked', requirements: Object.freeze(required) })
    });
  });

  const declaredCacheEntries = new Map([...cachePointerEntries].map(([archivePath, entries]) => [archivePath, new Set(entries)]));
  for (const route of projectedRoutes) for (const requirement of route.requiredClosure?.requirements || []) {
    if (String(requirement.resolution?.providerMode || '') !== 'cache') continue;
    const archivePath = String(requirement.resolution?.archivePackagePath || requirement.resolution?.packagePath || '');
    const archiveEntry = norm(requirement.resolution?.archiveEntry || requirement.resolution?.innerPath || '');
    if (!archivePath || !archiveEntry) continue;
    const entries = declaredCacheEntries.get(archivePath) || new Set(); entries.add(archiveEntry); declaredCacheEntries.set(archivePath, entries);
  }
  for (const cache of caches) {
    const declared = declaredCacheEntries.get(cache.archivePath) || new Set();
    const actual = new Set((cache.archive?.entries || []).map((entry) => norm(entry.path)));
    for (const path of actual) if (!declared.has(path)) findings.push(finding('error', 'portable.handoff-package-v1.cache.over-expansion', 'Bounded cache contains an entry not justified by the selected Handoff route closure.', { archivePath: cache.archivePath, archiveEntry: path }));
    for (const path of declared) if (!actual.has(path)) findings.push(finding('error', 'portable.handoff-package-v1.cache.required-entry-missing', 'Selected Handoff route closure resolves to a bounded cache entry that is absent.', { archivePath: cache.archivePath, archiveEntry: path }));
  }

  qualifyPackageArtifactTopology({ root, start, bootstrapArtifact, workspaces, caches, pointerArtifacts, projectedRoutes, index }, findings);
  qualifyPackageRoleContract(contract, { workspaces, caches, projectedRoutes, pointerArtifacts }, findings);
  const status = findings.some((f) => f.severity === 'error') ? 'invalid' : 'valid';
  const carrierProjection = Object.freeze({
    schema: 'tiinex.portable.handoff-carrier-projection.v1',
    status: status === 'valid' ? 'ready' : 'blocked',
    mode: packageModeForRole(contract?.packageRole) || 'handoff',
    startPath: contract?.startPath || '',
    bootstrapDescriptorPath: contract?.bootstrapArtifactPath || '',
    lineage: Object.freeze({ mode: contract?.checkpointKind === 'major' && contract?.parentDimension ? 'major' : contract?.dimension?.includes('-') ? 'continue' : 'root', prefix: contract?.prefix || '', dimension: contract?.dimension || '001', parentDimension: contract?.parentDimension || '', checkpointKind: contract?.checkpointKind || 'major', majorReason: contract?.majorReason || '' }),
    workspaces: Object.freeze(workspaces.map((w) => Object.freeze({ id: w.workspaceId, workspaceId: w.workspaceId, title: w.workspaceId, archivePath: w.archivePath }))),
    routes: Object.freeze(projectedRoutes),
    findings: Object.freeze(findings)
  });
  const coldConsumerProjection = Object.freeze({ schema: 'tiinex.portable.handoff-cold-consumer-projection.v1', status: status === 'valid' ? 'ready' : 'blocked', routes: Object.freeze(projectedRoutes), workspaces: carrierProjection.workspaces, findings: Object.freeze(findings) });
  return Object.freeze({
    schema: HANDOFF_PACKAGE_V1_INSPECTION_SCHEMA_ID,
    detected: Boolean(root), status, format: root ? HANDOFF_PACKAGE_V1_FORMAT_ID : '',
    rootArtifact: root ? Object.freeze({ path: root.path, schemaId: HANDOFF_PACKAGE_V1_SCHEMA_ID, sha256: sha256Hex(packageFileBytes(root.file)), carrierLineage: carrierProjection.lineage }) : null,
    readArtifact: start ? Object.freeze({ path: start.path, status: 'qualified' }) : null,
    packageContract: contract,
    workspaces: Object.freeze(workspaces), caches: Object.freeze(caches),
    endpointRoles: Object.freeze(endpointRoles), participantRoles: Object.freeze(participantRoles), groundingPointers: Object.freeze(groundingPointers),
    routes: Object.freeze(projectedRoutes), workspaceByteProvider: workspaceProvider(workspaces), carrierProjection, coldConsumerProjection,
    bootstrapInspection: bootstrapArtifact && bootstrapFile && bootstrapFacts ? Object.freeze({ status: findings.some((f) => String(f.code || '').startsWith('portable.handoff-package-v1.bootstrap') && f.severity === 'error') ? 'invalid' : 'valid', descriptorPath: bootstrapArtifactPath, payloadPath: bootstrapFacts.location }) : null,
    findings: Object.freeze(dedupe(findings)), findingSummary: summarize(findings),
    boundary: 'Direct read-only qualification of the flat human-readable Handoff Package V1 carrier. All route/material truth is recomputed from Markdown artifacts and exact ZIP bytes; no hidden recipient manifest is consulted.'
  });
}


function qualifyPackageArtifactTopology(observed = {}, findings = []) {
  const rootDimension = HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION;
  const { root, start, bootstrapArtifact, workspaces = [], caches = [], pointerArtifacts = [], projectedRoutes = [], index } = observed;

  for (const artifact of markdownArtifacts([...(index ? [...index.values()].flat() : [])])) {
    const dimension = numericPrefix(artifact.path);
    if (dimension && dimension !== artifact.path && dimension !== rootDimension && !dimension.startsWith(`${rootDimension}-`)) {
      findings.push(finding('error', 'portable.handoff-package-v1.artifact.package-namespace-leak', 'Package-local artifact filename leaks a non-package carrier/lineage namespace; Package V1 artifacts must begin at 001.', { path: artifact.path, observedDimension: dimension, packageRootDimension: rootDimension }));
    }
  }

  if (root && numericPrefix(root.path) !== rootDimension) findings.push(finding('error', 'portable.handoff-package-v1.root.dimension-invalid', 'Package root artifact dimension must be exactly 001.', { path: root.path }));
  if (start && numericPrefix(start.path) !== `${rootDimension}-1`) findings.push(finding('error', 'portable.handoff-package-v1.start.dimension-invalid', 'Package Start artifact dimension must be exactly 001-1.', { path: start.path }));
  if (bootstrapArtifact && numericPrefix(bootstrapArtifact.path) !== `${rootDimension}-2`) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap.dimension-invalid', 'Package bootstrap descriptor dimension must be exactly 001-2.', { path: bootstrapArtifact.path }));

  const workspacePrefixById = new Map();
  for (let i = 0; i < workspaces.length; i += 1) {
    const workspace = workspaces[i];
    const expected = `${rootDimension}-${i + 3}`;
    const observedPrefix = numericPrefix(workspace.artifactPath);
    workspacePrefixById.set(String(workspace.workspaceId || ''), observedPrefix);
    if (observedPrefix !== expected) findings.push(finding('error', 'portable.handoff-package-v1.workspace.sibling-dimension-invalid', 'Carried Workspace artifacts must occupy dense package-root sibling coordinates beginning at 001-3.', { workspaceId: workspace.workspaceId, path: workspace.artifactPath, expectedDimension: expected, observedDimension: observedPrefix }));
    if (numericPrefix(workspace.archivePath) !== expected) findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-coordinate-mismatch', 'Workspace archive must share the exact package-local coordinate of its Workspace artifact.', { workspaceId: workspace.workspaceId, artifactPath: workspace.artifactPath, archivePath: workspace.archivePath, expectedDimension: expected }));
  }

  const cacheCountByWorkspace = new Map();
  for (const cache of caches) {
    const workspaceId = String(cache.workspaceId || '');
    const workspacePrefix = workspacePrefixById.get(workspaceId) || '';
    cacheCountByWorkspace.set(workspaceId, Number(cacheCountByWorkspace.get(workspaceId) || 0) + 1);
    if (!workspacePrefix) continue;
    const expected = `${workspacePrefix}-1`;
    if (numericPrefix(cache.artifactPath) !== expected) findings.push(finding('error', 'portable.handoff-package-v1.cache.workspace-coordinate-invalid', 'A Workspace bounded cache must be the first direct package-local child of its owning Workspace.', { workspaceId, path: cache.artifactPath, expectedDimension: expected, observedDimension: numericPrefix(cache.artifactPath) }));
    if (numericPrefix(cache.archivePath) !== expected) findings.push(finding('error', 'portable.handoff-package-v1.cache.archive-coordinate-mismatch', 'Bounded cache payload must share the exact package-local coordinate of its cache descriptor.', { workspaceId, artifactPath: cache.artifactPath, archivePath: cache.archivePath, expectedDimension: expected }));
  }
  for (const [workspaceId, count] of cacheCountByWorkspace) if (workspaceId && count > 1) findings.push(finding('error', 'portable.handoff-package-v1.cache.workspace-cardinality-invalid', 'Each carried Workspace may own at most one Package V1 bounded cache.', { workspaceId, count }));

  for (const route of projectedRoutes) {
    const owner = packageWorkspaceAncestor(route.pointerPath, index, workspaces);
    if (!owner) {
      findings.push(finding('error', 'portable.handoff-package-v1.route.workspace-ancestor-missing', 'Handoff pointer route must descend from one carried Workspace package branch.', { pointerPath: route.pointerPath, targetWorkspaceId: route.workspaceId }));
      continue;
    }
    if (String(owner.workspaceId || '') !== String(route.workspaceId || '')) findings.push(finding('error', 'portable.handoff-package-v1.route.workspace-ancestor-mismatch', 'Handoff pointer route must descend from the same carried Workspace that owns its authoritative Handoff target.', { pointerPath: route.pointerPath, targetWorkspaceId: route.workspaceId, owningWorkspaceId: owner.workspaceId }));
    const workspaceCaches = caches.filter((cache) => String(cache.workspaceId || '') === String(owner.workspaceId || ''));
    if (workspaceCaches.length === 1 && !artifactHasAncestor(route.pointerPath, workspaceCaches[0].artifactPath, index)) findings.push(finding('error', 'portable.handoff-package-v1.route.cache-ancestor-missing', 'When an owning Workspace has a bounded cache, its Handoff route forest must descend through that single cache branch.', { pointerPath: route.pointerPath, workspaceId: owner.workspaceId, cachePath: workspaceCaches[0].artifactPath }));
  }

  qualifyDenseGeneratedChildren({ root, workspaces, caches, pointerArtifacts, start, bootstrapArtifact, index }, findings);
}

function qualifyDenseGeneratedChildren(observed = {}, findings = []) {
  const { root, workspaces = [], caches = [], pointerArtifacts = [], start, bootstrapArtifact, index } = observed;
  const generatedPaths = new Set([
    root?.path, start?.path, bootstrapArtifact?.path,
    ...workspaces.map((item) => item.artifactPath),
    ...caches.map((item) => item.artifactPath),
    ...pointerArtifacts.map((item) => item.path)
  ].filter(Boolean));
  const childrenByParent = new Map();
  for (const childPath of [...generatedPaths]) {
    const child = artifactAt(index, childPath);
    if (!child) continue;
    const declaredParent = parentPath(child.markdown);
    if (!declaredParent || !generatedPaths.has(declaredParent)) continue;
    const list = childrenByParent.get(declaredParent) || [];
    list.push(childPath);
    childrenByParent.set(declaredParent, list);
  }
  for (const [parentPathValue, childPaths] of childrenByParent) {
    const parentDimension = numericPrefix(parentPathValue);
    if (!parentDimension) continue;
    const ordinals = [];
    let structurallyDirect = true;
    for (const childPath of childPaths) {
      const childDimension = numericPrefix(childPath);
      const parts = childDimension.split('-');
      const parentParts = parentDimension.split('-');
      if (parts.length !== parentParts.length + 1 || parts.slice(0, parentParts.length).join('-') !== parentDimension) { structurallyDirect = false; continue; }
      ordinals.push(Number(parts.at(-1)));
    }
    if (!structurallyDirect || !ordinals.length) continue;
    const sorted = [...ordinals].sort((a, b) => a - b);
    const expected = Array.from({ length: sorted.length }, (_, i) => i + 1);
    if (new Set(sorted).size !== sorted.length || sorted.some((value, i) => value !== expected[i])) findings.push(finding('error', 'portable.handoff-package-v1.lineage.sibling-density-invalid', 'Generated package-local siblings must use dense 1..N lineage ordinals without gaps or duplicate numeric coordinates.', { parentPath: parentPathValue, observedOrdinals: sorted, expectedOrdinals: expected }));
  }
}

function packageWorkspaceAncestor(pointerPath = '', index, workspaces = []) {
  const byPath = new Map(workspaces.map((workspace) => [String(workspace.artifactPath || ''), workspace]));
  let current = artifactAt(index, pointerPath);
  let guard = 0;
  while (current && guard++ < 128) {
    const parent = parentPath(current.markdown);
    if (!parent) return null;
    const workspace = byPath.get(parent);
    if (workspace) return workspace;
    current = artifactAt(index, parent);
  }
  return null;
}

function artifactHasAncestor(path = '', ancestorPath = '', index) {
  let current = artifactAt(index, path);
  let guard = 0;
  while (current && guard++ < 128) {
    const parent = parentPath(current.markdown);
    if (!parent) return false;
    if (parent === ancestorPath) return true;
    current = artifactAt(index, parent);
  }
  return false;
}


function packageModeForRole(role = '') {
  if (role === 'recipient-facing-handoff-carrier') return 'handoff';
  if (role === 'recipient-facing-workspace-carrier') return 'workspace';
  if (role === 'recipient-facing-bootstrap-carrier') return 'bootstrap';
  return '';
}

function qualifyPackageRoleContract(contract = {}, observed = {}, findings = []) {
  const mode = packageModeForRole(contract?.packageRole);
  if (!mode) return;
  const routeLess = mode !== 'handoff';
  const expected = routeLess
    ? { routePlacementRule: 'none', continueFromRule: 'none', preHandoffClosureRule: 'none', genericTransportRule: 'start-artifact-instruction', routeTransportRule: 'none', recipientProjectionRule: 'none' }
    : { routePlacementRule: 'authoritative-workspace-descended', continueFromRule: 'exact-package-local-handoff-pointer', preHandoffClosureRule: 'selected-pointer-carrier-ancestors', genericTransportRule: 'start-artifact-instruction', routeTransportRule: 'selected-handoff-route-instruction', recipientProjectionRule: 'qualified-handoff-to-endpoint-only' };
  for (const [key, value] of Object.entries(expected)) {
    if (String(contract?.[key] || '') !== value) findings.push(finding('error', 'portable.handoff-package-v1.role-rule-mismatch', 'Package Role and declared route/transport rules are inconsistent.', { packageRole: contract.packageRole, field: key, expected: value, observed: String(contract?.[key] || '') }));
  }
  const routeCount = observed.projectedRoutes?.length || 0;
  const pointerCount = observed.pointerArtifacts?.length || 0;
  const workspaceCount = observed.workspaces?.length || 0;
  const cacheCount = observed.caches?.length || 0;
  if (mode === 'handoff') {
    if (!routeCount) findings.push(finding('error', 'portable.handoff-package-v1.routes.missing', 'Handoff-carrier Package V1 requires at least one Handoff pointer route.'));
    if (!workspaceCount) findings.push(finding('error', 'portable.handoff-package-v1.handoff-workspace.missing', 'Handoff-carrier Package V1 requires clear qualified Workspace source carriage for its authoritative Handoff route.'));
    return;
  }
  if (routeCount || pointerCount) findings.push(finding('error', 'portable.handoff-package-v1.routeless.pointer-forbidden', 'Pointerless Workspace and bootstrap-only Package V1 roles must not contain package-local Handoff/grounding pointer routes.', { packageRole: contract.packageRole, routeCount, pointerCount }));
  if (mode === 'workspace') {
    if (!workspaceCount && !Number(contract.materialRepresentationCount || 0)) findings.push(finding('error', 'portable.handoff-package-v1.workspace-material.missing', 'Pointerless Workspace carrier requires one or more qualified source-material bindings.'));
    if (cacheCount) findings.push(finding('error', 'portable.handoff-package-v1.workspace-cache.unsupported', 'Package-local bounded Handoff cache must not be reinterpreted as route-less Workspace representation authority.'));
    return;
  }
  if (workspaceCount || Number(contract.materialRepresentationCount || 0) || cacheCount) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-material.forbidden', 'Bootstrap-only carrier must contain no Workspace or source-material binding.', { workspaceCount, materialRepresentationCount: Number(contract.materialRepresentationCount || 0), cacheCount }));
}

function projectRequiredClosureRequirement(requirement = {}, candidates = [], findings = [], route = {}, workspaces = [], caches = []) {
  const referenceTarget = String(requirement.reference?.target || '');
  const matching = candidates.filter((pointer) => String(pointer.requirementId || '') === String(requirement.id || '') || (referenceTarget && String(pointer.referenceTarget || '') === referenceTarget));
  const identities = new Map();
  for (const pointer of matching) {
    const key = `${pointer.targetCarrierKind || ''}\0${pointer.archivePath || ''}\0${pointer.targetWorkspaceId || ''}\0${pointer.targetInnerPath || pointer.targetArchiveEntry || ''}\0${pointer.targetSha256 || ''}`;
    if (!identities.has(key)) identities.set(key, pointer);
  }
  const exact = [...identities.values()];
  if (exact.length > 1) {
    findings.push(finding('error', 'portable.handoff-package-v1.required-context.ambiguous', 'Required Context resolves through multiple distinct package-local pointer targets.', { routeId: route.id || '', requirementId: requirement.id || '', referenceTarget, count: exact.length }));
    return unresolvedRequired(requirement, referenceTarget);
  }
  if (exact.length === 1) {
    const pointer = exact[0]; const resolution = pointerResolution(pointer);
    return requiredResult(requirement, referenceTarget, pointer.resolution?.state === 'qualified' ? 'qualified' : 'unresolved', resolution);
  }
  if (isHandoffPackageV1PreHandoffGroundingRequirement(requirement)) {
    findings.push(finding('error', 'portable.handoff-package-v1.required-context.pre-handoff-pointer-missing', 'Required pre-Handoff grounding material has no exact package-local grounding Pointer.', { routeId: route.id || '', requirementId: requirement.id || '', referenceTarget }));
    return unresolvedRequired(requirement, referenceTarget);
  }
  const resolution = resolveDeclaredRequiredContext(requirement, route, workspaces, caches, findings);
  if (resolution.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.required-context.unresolved', 'Required Context does not resolve exactly from carried Workspace material or bounded cache.', { routeId: route.id || '', requirementId: requirement.id || '', referenceTarget }));
  return requiredResult(requirement, referenceTarget, resolution.state === 'qualified' ? 'qualified' : 'unresolved', resolution);
}
function unresolvedRequired(requirement, referenceTarget) { return requiredResult(requirement, referenceTarget, 'unresolved', Object.freeze({ state: 'unresolved' })); }
function requiredResult(requirement, referenceTarget, state, resolution) { return Object.freeze({ requirementId: String(requirement.id || ''), name: String(requirement.name || ''), material: String(requirement.material || ''), purpose: String(requirement.purpose || ''), declaredAvailability: String(requirement.availability || ''), referenceTarget, state, declarationSource: requirement.source || null, resolution }); }

function resolveDeclaredRequiredContext(requirement = {}, route = {}, workspaces = [], caches = [], findings = []) {
  const referenceTarget = String(requirement.reference?.target || '');
  const parsed = parseHandoffPackageV1Reference(referenceTarget);
  let workspaceCandidates = [];
  if (parsed.kind === 'workspace-coordinate') workspaceCandidates = workspaceEntryCandidates(workspaces.filter((workspace) => workspace.workspaceId === parsed.workspaceId), parsed.sourcePath);
  else if (parsed.kind === 'relative-reference') {
    const relative = resolveHandoffPackageV1RelativeReference(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || '', referenceTarget);
    workspaceCandidates = relative ? workspaceEntryCandidates(workspaces.filter((workspace) => workspace.workspaceId === route.workspaceId), relative) : [];
  } else if (parsed.kind === 'adapter-reference' && parsed.adapterId === 'github') {
    const repository = normalizeRepositoryIdentity(parsed.sourceIdentity);
    const matchingWorkspaces = workspaces.filter((workspace) => (workspace.sourceEntrypoints || []).some((entry) => normalizeRepositoryIdentity(entry.repository) === repository));
    workspaceCandidates = workspaceEntryCandidates(matchingWorkspaces, parsed.sourcePath);
  }
  if (workspaceCandidates.length === 1) return workspaceResolution(workspaceCandidates[0]);
  if (workspaceCandidates.length > 1) {
    findings.push(finding('error', 'portable.handoff-package-v1.required-context.workspace-ambiguous', 'Required Context reference resolves to multiple carried Workspace entries.', { requirementId: requirement.id || '', referenceTarget, count: workspaceCandidates.length }));
    return Object.freeze({ state: 'unresolved' });
  }
  const projectedCache = projectHandoffPackageV1CacheIdentity({ referenceTarget });
  const cacheCandidates = [];
  for (const cache of caches) {
    if (String(cache.workspaceId || '') !== String(route.workspaceId || '')) continue;
    if (cache.archive?.state === 'qualified') for (const entry of cache.archive.entries || []) if (norm(entry.path) === norm(projectedCache.archiveEntry)) cacheCandidates.push({ cache, entry });
  }
  if (cacheCandidates.length === 1) return cacheResolution(cacheCandidates[0]);
  if (cacheCandidates.length > 1) findings.push(finding('error', 'portable.handoff-package-v1.required-context.cache-ambiguous', 'Required Context reference resolves to multiple bounded cache entries.', { requirementId: requirement.id || '', referenceTarget, count: cacheCandidates.length }));
  return Object.freeze({ state: 'unresolved' });
}
function workspaceEntryCandidates(workspaces = [], innerPath = '') { const out=[]; for(const workspace of workspaces){if(workspace.archive?.state!=='qualified')continue; for(const entry of workspace.archive.entries||[]) if(norm(entry.path)===norm(innerPath)) out.push({workspace,entry});} return out; }
function workspaceResolution({ workspace, entry }) { return Object.freeze({ state:'qualified', kind:'workspace-archive-entry', providerMode:'archive', workspaceId:String(workspace.workspaceId||''), archivePackagePath:String(workspace.archivePath||workspace.workspaceArchivePath||''), packagePath:String(workspace.archivePath||workspace.workspaceArchivePath||''), innerPath:norm(entry.path), workspaceRelativePath:norm(entry.path), archiveEntry:'', bytes:Number(entry.bytes||packageFileBytes({data:entry.data}).byteLength), sha256:String(entry.sha256||sha256Hex(packageFileBytes({data:entry.data}))) }); }
function cacheResolution({ cache, entry }) { return Object.freeze({ state:'qualified', kind:'bounded-cache-entry', providerMode:'cache', workspaceId:'', archivePackagePath:String(cache.archivePath||''), packagePath:String(cache.archivePath||''), innerPath:norm(entry.path), workspaceRelativePath:'', archiveEntry:norm(entry.path), bytes:Number(entry.bytes||packageFileBytes({data:entry.data}).byteLength), sha256:String(entry.sha256||sha256Hex(packageFileBytes({data:entry.data}))) }); }
function pointerResolution(pointer = {}) {
  const cache = String(pointer.targetCarrierKind || '') === 'bounded-cache-entry';
  return Object.freeze({
    state: String(pointer.resolution?.state || 'unresolved'),
    kind: String(pointer.targetCarrierKind || ''),
    providerMode: cache ? 'cache' : 'archive',
    workspaceId: String(pointer.targetWorkspaceId || ''),
    archivePackagePath: String(pointer.archivePath || ''),
    packagePath: String(pointer.archivePath || ''),
    innerPath: String(cache ? pointer.targetArchiveEntry : pointer.targetInnerPath || ''),
    workspaceRelativePath: String(pointer.targetInnerPath || ''),
    archiveEntry: String(pointer.targetArchiveEntry || ''),
    bytes: Number(pointer.targetBytes || pointer.resolution?.bytes || 0),
    sha256: String(pointer.targetSha256 || pointer.resolution?.sha256 || '')
  });
}
function workspaceEntryMarkdown(workspaces = [], workspaceId = '', innerPath = '') {
  const workspace = workspaces.find((item) => String(item.workspaceId || '') === String(workspaceId || '')) || null;
  if (!workspace || workspace.archive?.state !== 'qualified') return '';
  const matches = (workspace.archive.entries || []).filter((entry) => norm(entry.path) === norm(innerPath));
  return matches.length === 1 ? decode(matches[0].data) : '';
}

function resolvePointerTarget({ facts, workspaces, caches, findings, pointerPath }) {
  if (facts.targetCarrierKind === 'workspace-archive-entry') {
    const workspace = workspaces.find((w) => w.workspaceId === facts.targetWorkspaceId);
    const matches = workspace?.archive?.state === 'qualified' ? (workspace.archive.entries || []).filter((e) => norm(e.path) === norm(facts.targetInnerPath)) : [];
    if (matches.length !== 1) { findings.push(finding('error', 'portable.handoff-package-v1.pointer.workspace-target-unresolved', 'Pointer target does not resolve exactly once in carried Workspace.', { pointerPath })); return Object.freeze({ state: 'unresolved' }); }
    return verifyTargetIdentity(matches[0].data, facts, findings, pointerPath, 'workspace');
  }
  if (facts.targetCarrierKind === 'bounded-cache-entry') {
    const cache = caches.find((c) => c.archivePath === facts.archivePath || c.artifactPath === facts.archivePath);
    const matches = cache?.archive?.state === 'qualified' ? (cache.archive.entries || []).filter((e) => norm(e.path) === norm(facts.targetArchiveEntry)) : [];
    if (matches.length !== 1) { findings.push(finding('error', 'portable.handoff-package-v1.pointer.cache-target-unresolved', 'Pointer target does not resolve exactly once in bounded cache.', { pointerPath })); return Object.freeze({ state: 'unresolved' }); }
    return verifyTargetIdentity(matches[0].data, facts, findings, pointerPath, 'cache');
  }
  findings.push(finding('error', 'portable.handoff-package-v1.pointer.carrier-kind-invalid', 'Pointer declares unsupported target carrier kind.', { pointerPath, kind: facts.targetCarrierKind }));
  return Object.freeze({ state: 'blocked' });
}
function verifyTargetIdentity(data, facts, findings, pointerPath, providerMode) {
  const bytes = data.byteLength;
  const sha = sha256Hex(data);
  if (facts.targetBytes && Number(facts.targetBytes) !== bytes) findings.push(finding('error', 'portable.handoff-package-v1.pointer.target-bytes-mismatch', 'Pointer target byte length mismatch.', { pointerPath }));
  if (facts.targetSha256 && facts.targetSha256 !== sha) findings.push(finding('error', 'portable.handoff-package-v1.pointer.target-sha-mismatch', 'Pointer target SHA-256 mismatch.', { pointerPath }));
  return Object.freeze({ state: 'qualified', providerMode, bytes, sha256: sha });
}
function workspaceProvider(workspaces) {
  return Object.freeze({ schema: 'tiinex.portable.handoff-workspace-byte-provider.v1', status: workspaces.length && workspaces.every((w) => w.archive?.state === 'qualified') ? 'ready' : 'blocked', workspaces: Object.freeze(workspaces.map((w) => Object.freeze({ state: w.archive?.state === 'qualified' ? 'qualified' : 'blocked', id: w.workspaceId, title: w.workspaceId, mode: 'archive', materialization: Object.freeze({ materialization: 'complete', coverage: 'complete' }), entries: Object.freeze((w.archive?.entries || []).map((e) => Object.freeze({ path: e.path, innerPath: e.path, bytes: e.bytes, sha256: e.sha256, data: e.data, packagePath: w.archivePath, archivePackagePath: w.archivePath }))), archive: Object.freeze({ packagePath: w.archivePath }), reasons: Object.freeze([]) }))), findings: Object.freeze([]) });
}
function pointerAncestors(pointerPath, candidates, index) {
  const ancestorPaths = new Set(); let current = artifactAt(index, pointerPath); let guard = 0;
  while (current && guard++ < 128) { const parent = parentPath(current.markdown); if (!parent) break; ancestorPaths.add(parent); current = artifactAt(index, parent); }
  return candidates.filter((c) => ancestorPaths.has(c.pointerPath)).map((c) => c.pointerPath).sort((a,b) => compareDimension(a,b));
}
function compareDimension(a,b) { return numericPrefix(a).localeCompare(numericPrefix(b), undefined, { numeric: true }); }
function numericPrefix(p='') { return String(p).match(/^(\d{3}(?:-\d+)*)/)?.[1] || p; }
function parsePackageRoot(markdown='') {
  const workspaceDeclarations = parseDeclarations(section(markdown, 'Workspace Snapshot Bindings'));
  const materialDeclarations = parseDeclarations(section(markdown, 'Material Representation Bindings'));
  const wb = workspaceDeclarations.map(({name,fields}) => ({ workspaceId: fields['Workspace Id'] || name, artifactPath: linkTarget(fields['Workspace Artifact']), archivePath: linkTarget(fields['Snapshot Path']), innerPath: fields['Workspace Artifact Inner Path'] || '', archiveSha256: fields['Integrity Value'] || '' }));
  const caches = materialDeclarations.filter((d) => d.fields['Cache Descriptor']).map(({name,fields}) => ({ cacheId: fields['Material Id'] || name, artifactPath: linkTarget(fields['Cache Descriptor']), archivePath: linkTarget(fields['Cache Payload']) }));
  const route = section(markdown,'Route Discovery');
  const transport = section(markdown,'Transport Projection');
  return Object.freeze({
    packageRole: field(section(markdown,'Package Identity'),'Package Role'),
    startPath: linkTarget(field(section(markdown,'Bootstrap Exposure'),'Start Artifact')),
    bootstrapArtifactPath: linkTarget(field(section(markdown,'Bootstrap Exposure'),'Tooling Bootstrap Descriptor')),
    workspaces: Object.freeze(wb), caches: Object.freeze(caches), materialRepresentationCount: materialDeclarations.length,
    routePlacementRule: field(route,'Route Placement Rule'), continueFromRule: field(route,'Continue-From Rule'), preHandoffClosureRule: field(route,'Pre-Handoff Closure Rule'),
    genericTransportRule: field(transport,'Generic Transport Rule'), routeTransportRule: field(transport,'Route Transport Rule'), recipientProjectionRule: field(transport,'Recipient Projection Rule'),
    prefix: field(section(markdown,'Carrier Continuity'),'Carrier Prefix'), dimension: field(section(markdown,'Carrier Continuity'),'Carrier Dimension'), parentDimension: field(section(markdown,'Carrier Continuity'),'Parent Carrier Dimension'), checkpointKind: field(section(markdown,'Carrier Continuity'),'Carrier Checkpoint'), majorReason: field(section(markdown,'Carrier Continuity'),'Major Reason')
  });
}
function parseExternalPayload(markdown='') { const loc=section(markdown,'Payload Location'), integ=section(markdown,'Integrity Reference'), id=section(markdown,'Payload Identity'); return Object.freeze({ location: linkTarget(field(loc,'Location')) || field(loc,'Location'), bytes: Number(field(id,'Byte Size')||0), sha256: field(integ,'Integrity Value') }); }
function parsePointerFacts(markdown='') { const s=section(markdown,'Current Read'); return Object.freeze({ pointerKind: field(s,'Pointer Kind'), requirementId: field(s,'Requirement Id'), referenceTarget: unquote(field(s,'Reference')), targetCarrierKind: field(s,'Target Carrier Kind'), targetWorkspaceId: field(s,'Target Workspace Id'), archivePath: field(s,'Target Payload'), targetInnerPath: field(s,'Target Inner Path'), targetArchiveEntry: field(s,'Target Archive Entry'), targetBytes:Number(field(s,'Target Byte Size')||0), targetSha256:field(s,'Target SHA-256'), endpointParty:field(s,'Endpoint Party'), roleLabelHint:field(s,'Role Label Hint') }); }
function verifyPayloadFile(facts,file,findings,kind) { const data=packageFileBytes(file); if(facts.bytes && facts.bytes!==data.byteLength)findings.push(finding('error',`portable.handoff-package-v1.${kind}.bytes-mismatch`,`${kind} payload byte length mismatch.`)); if(facts.sha256&&facts.sha256!==sha256Hex(data))findings.push(finding('error',`portable.handoff-package-v1.${kind}.sha-mismatch`,`${kind} payload SHA-256 mismatch.`)); }
function qualifyTrace(artifact,parent,findings,opts={}) { const schema=String(artifact.parsed?.envelope?.current?.schema?.id||''); if(opts.expectedSchema&&schema!==opts.expectedSchema)findings.push(finding('error','portable.handoff-package-v1.trace.schema-mismatch','Carrier artifact declares unexpected schema.',{path:artifact.path,expected:opts.expectedSchema,observed:schema})); const self=canonicalC14nV2SelfState(artifact.markdown); if(self.state!=='verified')findings.push(finding('error','portable.handoff-package-v1.trace.self-integrity','Carrier artifact self integrity is not verified.',{path:artifact.path,state:self.state})); const declared=parentPath(artifact.markdown); if(opts.requireParent===false)return; if(declared){ if(!parent)findings.push(finding('error','portable.handoff-package-v1.trace.parent-unresolved','Declared Parent artifact is unavailable.',{path:artifact.path,parent:declared})); else { qualifyNumericCarrierParent(artifact,parent,findings); const entries=artifact.parsed?.integrity?.entries||[]; const target=entries.find((e)=>e.towards&&e.towards!=='self'); if(!target)findings.push(finding('error','portable.handoff-package-v1.trace.parent-integrity-missing','Parent-bearing carrier artifact lacks Parent integrity.',{path:artifact.path})); else { const v=verifyC14nV2TargetSelfDigest({value:target.value,targetMarkdown:parent.markdown}); if(v.state!=='verified')findings.push(finding('error','portable.handoff-package-v1.trace.parent-integrity-mismatch','Parent integrity does not verify against exact parent bytes.',{path:artifact.path,parent:parent.path})); } } } }
function qualifyNumericCarrierParent(artifact,parent,findings){ const child=numericPrefix(artifact.path); const ancestor=numericPrefix(parent.path); if(!child||!ancestor)return; const childParts=child.split('-'); const parentParts=ancestor.split('-'); const direct=childParts.length===parentParts.length+1&&childParts.slice(0,parentParts.length).join('-')===ancestor; if(!direct)findings.push(finding('error','portable.handoff-package-v1.trace.numeric-parent-mismatch','Package-local generated artifact Parent must be the direct numeric lineage parent of its filename dimension.',{path:artifact.path,parent:parent.path,childDimension:child,parentDimension:ancestor})); }
function markdownArtifacts(files){return files.filter((f)=>/\.(?:trace|workspace)\.md$/i.test(String(f.path||''))).map((file)=>{const markdown=decode(packageFileBytes(file));let parsed=null;try{parsed=parseArtifactMarkdown(markdown);}catch{}return {path:String(file.path||''),file,markdown,parsed};}).filter((x)=>x.parsed);}
function indexFiles(files,findings){const m=new Map();for(const f of files){const p=String(f.path||'');if(!m.has(p))m.set(p,[]);m.get(p).push(f);}for(const[p,v]of m)if(v.length>1)findings.push(finding('error','portable.handoff-package-v1.path.duplicate','Duplicate package root path.',{path:p,count:v.length}));return m;}
function one(index,p,findings){const a=index.get(String(p||''))||[];if(a.length!==1){findings.push(finding('error','portable.handoff-package-v1.file.unresolved','Declared package file does not resolve exactly once.',{path:p,count:a.length}));return null;}return a[0];}
function artifactAt(index,p){const a=index.get(String(p||''))||[];if(a.length!==1)return null;const file=a[0];const markdown=decode(packageFileBytes(file));let parsed=null;try{parsed=parseArtifactMarkdown(markdown);}catch{return null;}return {path:String(p||''),file,markdown,parsed};}
function resolveParentArtifact(index,markdown){const p=parentPath(markdown);return p?artifactAt(index,p):null;}
function parentPath(markdown){try{return String(parseArtifactMarkdown(markdown).envelope?.parent?.trace||'').trim();}catch{return '';}}
function section(md,name){const m=new RegExp(`^##\\s+${escapeRe(name)}\\s*$`,'mi').exec(md);if(!m)return'';const rest=md.slice(m.index+m[0].length);const n=/^##\s+/m.exec(rest);return(n?rest.slice(0,n.index):rest).trim();}
function field(text,name){const m=new RegExp(`^-\\s+${escapeRe(name)}:[ \\t]*([^\\r\\n]*)$`,'mi').exec(text);return m?String(m[1]||'').trim():'';}
function parseDeclarations(text=''){if(!text||/^\s*-\s+none\s*$/i.test(text))return[];const lines=String(text).split(/\r?\n/);const out=[];let cur=null;for(const line of lines){const top=line.match(/^-\s+([^\s].*)$/);if(top&&!/^\s{2}/.test(line)){if(cur)out.push(cur);cur={name:top[1].trim(),fields:{}};continue;}const sub=line.match(/^\s{2}-\s+([^:]+):\s*(.*)$/);if(cur&&sub)cur.fields[sub[1].trim()]=sub[2].trim();}if(cur)out.push(cur);return out;}
function linkTarget(v=''){const m=String(v).match(/\[[^\]]*\]\(([^)]+)\)/);return m?m[1].trim():String(v||'').trim();}
function unquote(v=''){const s=String(v||'').trim();return(s.startsWith('`')&&s.endsWith('`'))?s.slice(1,-1):s;}
function decode(data){try{return new TextDecoder('utf-8',{fatal:true}).decode(data);}catch{return'';}}
function norm(v=''){return String(v||'').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\/+/, '');}
function escapeRe(v=''){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function finding(severity,code,message,extra={}){return Object.freeze({severity,code,message,...extra});}
function dedupe(items){const m=new Map();for(const x of items){const k=`${x.severity}:${x.code}:${x.path||''}:${x.pointerPath||''}:${x.workspaceId||''}:${x.archiveEntry||''}`;if(!m.has(k))m.set(k,x);}return[...m.values()];}
function summarize(items){const d=dedupe(items);return Object.freeze({errors:d.filter(x=>x.severity==='error').length,warnings:d.filter(x=>x.severity==='warning').length,findings:d.length});}
