import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView, sha256Hex } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET, renderRecipientV2ExternalPayload, renderRecipientV2Pointer } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, recipientV2EntryCurrentRead } from './recipientV2.entryContract.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { buildRecipientV2BootstrapCarrier, buildRecipientV2WorkspaceCarriers, recipientV2ParentAuthority } from './recipientV2.topology.workspaces.js';
import { buildEndpointRolePointerChain, buildParticipantRolePointerChain } from './recipientV2.endpointRolePointers.js';
import { bindingForWorkspace, boundedWorkspaceClaimsDetachedRecovery, coalesceDetachedCacheMaterials, detachedCacheArchiveEntryPath, detachedMaterial, duplicates, finding, roleMaterialTarget, routeClaimsDetachedMaterial, safeToken, uniqueFileIndex } from './recipientV2.topology.materials.js';
import { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
import { renderHandoffPackageV1 } from './recipientV2.packageV1.contract.js';
import { inspectRecipientFacingV2PackageV1 } from './recipientV2.packageV1.inspect.js';
import { blocked, deepFreeze, exactFile, workspaceSchemaTarget } from './recipientV2.packageV1.shared.js';
import { sealPasswordWorkspacePayload } from '../../../transport/secureTransportV1.js';
import { renderTransportEnvelopeV1, TRANSPORT_ENVELOPE_V1_ROLE } from './transportEnvelopeV1.js';

export function buildRecipientFacingV2PackageV1(input = {}) { return buildRecipientFacingV2PackageV1Prepared(input, new Map()); }

export async function buildRecipientFacingV2PackageV1Secure(input = {}) {
  const prepared = await prepareSealedWorkspaceBindings(input);
  if (prepared.status !== 'ready') return prepared;
  return buildRecipientFacingV2PackageV1Prepared(input, prepared.byWorkspaceId);
}

function buildRecipientFacingV2PackageV1Prepared(input = {}, sealedByWorkspaceId = new Map()) {
  const sourceSurface = input.sourceSurface || null;
  const descriptor = input.descriptor || input.bundle?.handoffClosure || {};
  const carrier = input.carrierProjection || {};
  const createdAt = input.createdAt || input.bundle?.manifest?.createdAt || input.bundle?.builtAt || '';
  const findings = [];
  if (!sourceSurface || sourceSurface.status !== 'ready') return blocked('source-surface-unready', sourceSurface?.findings || []);
  const routes = (carrier.routes || []).filter((route) => route.state === 'qualified');
  const selector = String(input.routeSelector || input.routeId || '').trim();
  const selected = selector ? routes.filter((route) => route.id === selector || route.workspaceRelativePath === selector || `${String(route.workspaceId || '')}:${String(route.workspaceRelativePath || '')}` === selector || `handoff-route:${String(route.workspaceId || '')}:${String(route.workspaceRelativePath || '')}` === selector) : routes;
  if (selected.length !== 1) return blocked('route-selection-unresolved', [finding('error', 'portable.handoff-package-v1.route-selection-unresolved', 'Package v1 manufacture requires exactly one qualified selected Handoff route.', { count: selected.length })]);
  const route = selected[0];
  const sourceWorkspaceById = new Map((sourceSurface.topology?.workspaces || []).map((item) => [String(item.workspaceId || ''), item]));
  const sourceByPath = new Map((sourceSurface.files || []).map((file) => [String(file.path || ''), file]));
  const descriptorBindingById = new Map((descriptor.workspaceArchiveBindings || []).map((binding) => [String(binding.workspaceId || ''), binding]));
  const forcedMaterialWorkspaceIds = new Set([...(input.materialRepresentationWorkspaceIds || []), ...(input.genericMaterialWorkspaceIds || [])].map((value) => String(value || '')));
  for (const binding of descriptor.workspaceArchiveBindings || []) if (String(binding.coverage || '') === 'bounded' || String(binding.representation?.kind || '') === 'bounded-workspace-snapshot') forcedMaterialWorkspaceIds.add(String(binding.workspaceId || ''));
  const workspaceIds = [...new Set([...sourceWorkspaceById.keys(), ...descriptorBindingById.keys()])].filter(Boolean).sort();
  const workspacePlans = workspaceIds.map((workspaceId, index) => Object.freeze({ workspaceId, ordinal: index + 3, prefix: `001-${index + 3}`, slug: safeToken(workspaceId) }));
  const files = [];
  const topology = { root: null, read: null, workspaces: [], materialRepresentations: [], caches: [], endpointRoles: [], participantRoles: [], routes: [], bootstrap: null };
  const workspaceById = new Map();
  const directWorkspaceProjections = [];
  const materialPlans = [];

  for (const plan of workspacePlans) {
    const source = sourceWorkspaceById.get(plan.workspaceId);
    const descriptorBinding = descriptorBindingById.get(plan.workspaceId);
    const useMaterialRepresentation = forcedMaterialWorkspaceIds.has(plan.workspaceId);
    if (useMaterialRepresentation) {
      if (!descriptorBinding) { findings.push(finding('error', 'portable.handoff-package-v1.material.workspace-binding-missing', 'Generic Material Representation selection requires one qualified source Workspace representation binding.', { workspaceId: plan.workspaceId })); continue; }
      materialPlans.push(Object.freeze({
        ...plan, binding: descriptorBinding,
        workspacePath: `${plan.prefix}-${plan.slug}.workspace.md`,
        archivePath: `${plan.prefix}-${plan.slug}.workspace.zip`,
        payloadArtifactPath: `${plan.prefix}-1-workspace-representation-payload.trace.md`,
        representationArtifactPath: `${plan.prefix}-2-workspace-representation.trace.md`
      }));
      continue;
    }
    if (!source || String(source.coverage || '') !== 'complete') { findings.push(finding('error', 'portable.handoff-package-v1.workspace.complete-required', 'Package-local direct Workspace binding requires one complete source snapshot; bounded material must use Material Representation Bindings.', { workspaceId: plan.workspaceId })); continue; }
    const sourceArchive = sourceByPath.get(String(source.archivePath || ''));
    if (!sourceArchive) { findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-missing', 'Selected complete Workspace archive is unavailable.', { workspaceId: plan.workspaceId })); continue; }
    const archiveData = packageFileByteView(sourceArchive);
    const parsed = inspectStoredWorkspaceArchive(archiveData, { ownedBytes: true });
    if (parsed.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-invalid', 'Selected complete Workspace snapshot bytes do not qualify.', { workspaceId: plan.workspaceId })); continue; }
    const innerPath = String(source.sourceWorkspaceTargetInnerPath || '');
    const matches = (parsed.entries || []).filter((entry) => entry.path === innerPath);
    if (matches.length !== 1) { findings.push(finding('error', 'portable.handoff-package-v1.workspace.target-unresolved', 'Workspace artifact inner path must resolve exactly once inside the complete snapshot.', { workspaceId: plan.workspaceId, innerPath, count: matches.length })); continue; }
    const targetData = packageFileByteView({ data: matches[0].data });
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: innerPath, targetData, entries: parsed.entries || [] });
    if (targetQualification.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-package-v1.workspace.target-unqualified', 'Exact Workspace artifact bytes inside the snapshot do not qualify.', { workspaceId: plan.workspaceId, reasons: targetQualification.reasons || [] })); continue; }
    const workspacePath = `${plan.prefix}-${plan.slug}.workspace.md`;
    const workspaceFile = exactFile(workspacePath, targetData, 'recipient-v2-package-v1-exact-workspace-artifact', 'text/markdown');
    files.push(workspaceFile);
    const parent = recipientV2ParentAuthority(workspaceFile, 'tiinex.workspace.v1', workspaceSchemaTarget(targetQualification), createdAt);
    const sealedPrepared = sealedByWorkspaceId.get(plan.workspaceId) || null;
    let projection;
    if (sealedPrepared) {
      projection = Object.freeze({ workspaceId: plan.workspaceId, ordinal: plan.ordinal, workspacePath, workspaceSha256: workspaceFile.sha256, snapshotKind: 'password-sealed-workspace-byte-tree', bindingState: 'sealed', protectedPayloadPath: `${plan.prefix}-${plan.slug}.protected.bin`, protectedPayloadDescriptorPath: `${plan.prefix}-${plan.slug}.protected-payload.trace.md`, transportEnvelopePath: `${plan.prefix}-${plan.slug}.transport-envelope.trace.md`, protectedPayloadBytes: sealedPrepared.protectedPayload.byteLength, sourceWorkspaceTargetSha256: workspaceFile.sha256, sourceWorkspaceTargetBytes: workspaceFile.bytes, coverage: 'complete' });
    } else {
      const archivePath = `${plan.prefix}-${plan.slug}.workspace.zip`;
      const archiveFile = exactFile(archivePath, archiveData, 'recipient-v2-package-v1-complete-workspace-snapshot', 'application/zip');
      files.push(archiveFile);
      projection = Object.freeze({ workspaceId: plan.workspaceId, ordinal: plan.ordinal, workspacePath, workspaceSha256: workspaceFile.sha256, archivePath, archiveSha256: archiveFile.sha256, archiveBytes: archiveFile.bytes, sourceWorkspaceTargetInnerPath: innerPath, sourceWorkspaceTargetSha256: workspaceFile.sha256, sourceWorkspaceTargetBytes: workspaceFile.bytes, coverage: 'complete' });
    }
    topology.workspaces.push(projection); directWorkspaceProjections.push(projection);
    workspaceById.set(plan.workspaceId, { ...projection, file: workspaceFile, parent, sealed: Boolean(sealedPrepared) });
  }

  if (findings.some((item) => item.severity === 'error')) return blocked('workspace-binding-blocked', findings);
  const materialBindingsForContract = materialPlans.map((plan) => Object.freeze({ materialId: `workspace-${plan.workspaceId}`, workspaceId: plan.workspaceId, representationArtifactPath: plan.representationArtifactPath, carriageState: 'verified' }));
  const packageFile = finalizeFile({
    path: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH,
    kind: 'tiinex-handoff-package-artifact',
    logicalKind: 'recipient-v2-package-v1-root',
    mediaType: 'text/markdown',
    content: renderHandoffPackageV1({ createdAt, packageRole: input.packageRole || undefined, workspaces: directWorkspaceProjections, materialRepresentations: materialBindingsForContract, carrierLineage: carrier.lineage || {}, carrierProfile: input.carrierProfile || null, startPath: RECIPIENT_V2_READ_PATH, bootstrapPath: hasBootstrap(input.bundle) ? '001-2-bootstrap.trace.md' : '' })
  });
  files.push(packageFile);
  topology.root = Object.freeze({ path: packageFile.path, sha256: packageFile.sha256 });
  const packageParent = recipientV2ParentAuthority(packageFile, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET, createdAt);
  if (materialPlans.length) {
    const materialWorkspaceById = buildRecipientV2WorkspaceCarriers({ workspacePlans: materialPlans, byPath: uniqueFileIndex(input.bundle?.files || [], findings), findings, createdAt, rootParent: packageParent, files, topology });
    for (const [workspaceId, workspace] of materialWorkspaceById) workspaceById.set(workspaceId, workspace);
    topology.materialRepresentations.push(...materialBindingsForContract);
  }


  for (const workspace of topology.workspaces.filter((item) => item.bindingState === 'sealed')) {
    const prepared = sealedByWorkspaceId.get(workspace.workspaceId);
    const protectedFile = exactFile(workspace.protectedPayloadPath, prepared.protectedPayload, 'recipient-v2-package-v1-password-sealed-workspace-payload', 'application/octet-stream');
    const payloadFacts = recipientV2TransportFacts('password-sealed Workspace protected payload', { workspaceId: workspace.workspaceId, archivePath: protectedFile.path, archiveBytes: protectedFile.bytes, archiveSha256: protectedFile.sha256 });
    const payloadArtifact = finalizeFile({ path: workspace.protectedPayloadDescriptorPath, kind: 'protected-workspace-payload-descriptor', logicalKind: 'recipient-v2-package-v1-password-sealed-payload-descriptor', mediaType: 'text/markdown', transportFacts: payloadFacts, content: renderRecipientV2ExternalPayload({ createdAt, parent: packageParent, title: `Protected Workspace Payload — ${workspace.workspaceId}`, summary: 'Exact password-sealed Workspace ciphertext. Protected Workspace filenames, directories, inner artifact paths, and plaintext inventory remain encrypted.', label: `${workspace.workspaceId} protected Workspace payload`, kind: 'password-sealed-workspace-ciphertext', mediaType: 'application/octet-stream', format: prepared.envelope.profile.contentEncryptionParameters.binaryFraming, role: 'password-sealed Workspace protected payload', workspaceId: workspace.workspaceId, location: protectedFile.path, bytes: protectedFile.bytes, sha256: protectedFile.sha256 }) });
    const envelopeArtifact = finalizeFile({ path: workspace.transportEnvelopePath, kind: 'password-sealed-workspace-transport-envelope', logicalKind: 'recipient-v2-package-v1-transport-envelope', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts(TRANSPORT_ENVELOPE_V1_ROLE, { workspaceId: workspace.workspaceId, workspaceArtifactPath: workspace.workspacePath, protectedPayloadDescriptorPath: workspace.protectedPayloadDescriptorPath, workspaceBindingValue: prepared.envelope.workspaceBindingValue, profileId: prepared.envelope.profile.profileId, profileVersion: prepared.envelope.profile.profileVersion }), content: renderTransportEnvelopeV1({ createdAt, parent: packageParent, workspaceArtifactPath: workspace.workspacePath, protectedPayloadDescriptorPath: workspace.protectedPayloadDescriptorPath, envelope: prepared.envelope }) });
    files.push(payloadArtifact, envelopeArtifact, protectedFile);
  }

  const bootstrapSource = (input.bundle?.files || []).filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/'));
  if (bootstrapSource.length) {
    const bootstrap = buildRecipientV2BootstrapCarrier(bootstrapSource, createdAt, findings, packageParent);
    if (bootstrap) { files.push(bootstrap.artifact, bootstrap.payload); topology.bootstrap = bootstrap.projection; }
  }

  const byPath = uniqueFileIndex(input.bundle?.files || [], findings);
  const detached = detachedMaterial(descriptor, byPath, findings);
  const cachePlanByWorkspace = new Map();
  for (const plan of workspacePlans) {
    const workspace = workspaceById.get(plan.workspaceId);
    if (!workspace) continue;
    const binding = bindingForWorkspace(descriptor, workspace.workspaceId);
    const materials = coalesceDetachedCacheMaterials(detached.filter((item) => (workspace.workspaceId === String(route.workspaceId || '') && routeClaimsDetachedMaterial(route, item)) || boundedWorkspaceClaimsDetachedRecovery(binding, item)));
    if (!materials.length) continue;
    const artifactPath = `${plan.prefix}-1-cache.trace.md`;
    const archivePath = `${plan.prefix}-1-cache.zip`;
    const cacheEntries = materials.map((item, index) => ({ path: detachedCacheArchiveEntryPath(item, index), data: item.data }));
    const cacheBytes = exportFileMapZipUint8Array(cacheEntries, 'portable.handoff-package-v1.cache.path.invalid');
    const cacheFile = finalizeFile({ path: archivePath, kind: 'handoff-material-cache', logicalKind: 'recipient-v2-package-v1-workspace-dependency-cache', mediaType: 'application/zip', data: cacheBytes });
    const cacheFacts = {
      workspaceId: workspace.workspaceId, archivePath, archiveBytes: cacheFile.bytes, archiveSha256: cacheFile.sha256,
      materials: materials.map((item, index) => ({ requirementId: item.requirementId, classification: item.classification, referenceTarget: item.referenceTarget, routeWorkspaceId: item.routeWorkspaceId, routePath: item.routePath, sourceRequirementId: item.sourceRequirementId, sourceWorkspaceId: item.sourceWorkspaceId, sourcePath: item.sourcePath, targetWorkspaceId: item.targetWorkspaceId, targetPath: item.targetPath, originalPath: item.originalPath, mediaType: item.mediaType, archiveEntry: cacheEntries[index].path, bytes: item.bytes, sha256: item.sha256 }))
    };
    const cacheArtifact = finalizeFile({ path: artifactPath, kind: 'tiinex-external-payload-artifact', logicalKind: 'recipient-v2-package-v1-workspace-dependency-cache-reference', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('workspace-scoped Handoff dependency cache', cacheFacts), content: renderRecipientV2ExternalPayload({ createdAt, parent: workspace.parent, title: `Workspace Dependency Cache — ${workspace.workspaceId}`, summary: 'Exact route-bounded or bounded-Workspace recovery dependency bytes outside the carried Workspace representation.', label: `${workspace.workspaceId} Handoff dependency cache`, kind: 'zip export', role: 'workspace-scoped Handoff dependency cache', location: archivePath, bytes: cacheFile.bytes, sha256: cacheFile.sha256, materials: cacheFacts.materials }) });
    files.push(cacheArtifact, cacheFile);
    const cache = { workspaceId: workspace.workspaceId, artifactPath, archivePath, materials: cacheFacts.materials, parent: recipientV2ParentAuthority(cacheArtifact, 'tiinex.external.payload.v1', RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET, createdAt) };
    topology.caches.push(Object.freeze({ workspaceId: cache.workspaceId, artifactPath, archivePath, materials: cache.materials }));
    cachePlanByWorkspace.set(workspace.workspaceId, cache);
  }
  const owningWorkspace = workspaceById.get(String(route.workspaceId || ''));
  const cache = owningWorkspace ? (cachePlanByWorkspace.get(owningWorkspace.workspaceId) || null) : null;

  if (!owningWorkspace) findings.push(finding('error', 'portable.handoff-package-v1.route.workspace-unresolved', 'Selected Handoff route owning Workspace is not carried.'));
  else if (owningWorkspace.sealed) findings.push(finding('error', 'portable.handoff-package-v1.route.workspace-sealed-forbidden', 'Selected authoritative Handoff route must remain inside clear qualified carried material in Secure Transport V1.', { workspaceId: owningWorkspace.workspaceId }));
  else {
    const plan = workspacePlans.find((item) => item.workspaceId === owningWorkspace.workspaceId);
    const binding = bindingForWorkspace(descriptor, owningWorkspace.workspaceId);
    let lineageParent = cache?.parent || owningWorkspace.parent;
    let nextDimension = cache ? `${plan.prefix}-1-1` : `${plan.prefix}-1`;
    const participantChain = buildParticipantRolePointerChain({ requirements: route.materialRequirements?.participantRoles || [], descriptor, workspaceById, cache, workspace: owningWorkspace, route, createdAt, lineageParent, nextDimension, resolveRoleMaterialTarget: roleMaterialTarget, parentAuthority: recipientV2ParentAuthority });
    files.push(...participantChain.files); topology.participantRoles.push(...participantChain.roles); findings.push(...participantChain.findings); lineageParent = participantChain.lineageParent; nextDimension = participantChain.nextDimension;
    const endpointChain = buildEndpointRolePointerChain({ requirements: route.materialRequirements?.endpointRoles || [], descriptor, workspaceById, cache, workspace: owningWorkspace, route, createdAt, lineageParent, nextDimension, resolveRoleMaterialTarget: roleMaterialTarget, parentAuthority: recipientV2ParentAuthority });
    files.push(...endpointChain.files); topology.endpointRoles.push(...endpointChain.roles); findings.push(...endpointChain.findings); lineageParent = endpointChain.lineageParent; nextDimension = endpointChain.nextDimension;
    const pointerPath = `${nextDimension}-handoff-pointer.trace.md`;
    const routeEntry = (binding?.entryMap?.entries || []).find((entry) => String(entry.path || '') === String(route.workspaceRelativePath || ''));
    const pointerFacts = {
      workspaceId: owningWorkspace.workspaceId, workspaceArtifactPath: owningWorkspace.workspacePath, workspaceArtifactSha256: owningWorkspace.workspaceSha256,
      archivePath: owningWorkspace.archivePath, archiveSha256: owningWorkspace.archiveSha256, sourceWorkspaceTargetInnerPath: owningWorkspace.sourceWorkspaceTargetInnerPath,
      sourceWorkspaceTargetSha256: owningWorkspace.sourceWorkspaceTargetSha256, workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), handoffBytes: Number(routeEntry?.bytes || 0), handoffSha256: String(route.sha256 || ''), routeId: String(route.id || ''), parties: route.parties || {}, cacheArtifactPath: cache?.artifactPath || '',
      returnCarrierReservation: route.returnCarrierReservation || null,
      requiredContextBindings: Object.freeze((route.requiredClosure?.requirements || []).filter((entry) => entry.state === 'qualified' && entry.resolution?.kind === 'workspace-archive-entry').map((entry) => Object.freeze({ requirementId: String(entry.requirementId || ''), name: String(entry.name || ''), referenceTarget: String(entry.referenceTarget || ''), workspaceId: String(entry.resolution?.workspaceId || ''), workspaceRelativePath: String(entry.resolution?.workspaceRelativePath || entry.resolution?.innerPath || ''), bytes: Number(entry.resolution?.bytes || 0), sha256: String(entry.resolution?.sha256 || '') })))
    };
    const pointer = finalizeFile({ path: pointerPath, kind: 'handoff-route-pointer', logicalKind: 'recipient-v2-package-v1-handoff-route-pointer', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('handoff-route', pointerFacts), content: renderRecipientV2Pointer({ createdAt, parent: lineageParent, role: 'handoff-route', title: `Handoff Route Pointer — ${String(route.parties?.to || owningWorkspace.workspaceId || 'recipient')}`, summary: 'Qualified package-local Pointer to one authoritative Handoff inside one qualified carried Workspace representation.', prose: 'Follow only this Pointer carrier-ancestor closure for pre-Handoff package grounding, then resolve the authoritative Handoff path against the exact qualified carried Workspace representation.', currentRead: [{ label: 'Workspace Id', value: `\`${owningWorkspace.workspaceId}\`` }, { label: 'Workspace', value: `[${owningWorkspace.workspaceId}](${owningWorkspace.workspacePath})` }, { label: 'Route Id', value: `\`${String(route.id || '')}\`` }, ...(pointerFacts.cacheArtifactPath ? [{ label: 'Workspace Dependency Cache', value: `[cache](${pointerFacts.cacheArtifactPath})` }] : []), { label: 'Handoff Workspace Path', value: `\`${String(route.workspaceRelativePath || '')}\`` }, ...(route.returnCarrierReservation ? [{ label: 'Return Package Carrier Kind', value: `\`${String(route.returnCarrierReservation.carrierKind || '')}\`` }, ...(route.returnCarrierReservation.carrierKind === 'non-major' ? [{ label: 'Return Package Sibling Index', value: `\`${String(route.returnCarrierReservation.siblingIndex || '')}\`` }] : [])] : [])], destinations: [{ label: 'Workspace representation containing the qualified Handoff route', display: `${owningWorkspace.archivePath} :: ${String(route.workspaceRelativePath || '')}`, target: owningWorkspace.archivePath }], facts: pointerFacts }) });
    files.push(pointer);
    topology.routes.push(Object.freeze({ pointerPath, workspaceId: owningWorkspace.workspaceId, workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), routeId: String(route.id || ''), sha256: String(route.sha256 || ''), returnCarrierReservation: route.returnCarrierReservation || null }));
  }

  const readFacts = { format: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, packageRootPath: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, entryArtifactPath: RECIPIENT_V2_READ_PATH, artifactSurface: 'tiinex.handoff.package.v1-plus-qualified-carried-material', routeAuthority: 'qualified-handoff-route-pointer-plus-exact-qualified-carried-handoff-bytes', routeSelectionAuthority: RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, siblingRouteInference: RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, carrierLineage: carrier.lineage || null, pathParentProjection: true, pathAuthority: false };
  const readFile = finalizeFile({ path: RECIPIENT_V2_READ_PATH, kind: 'handoff-recovery-pointer', logicalKind: 'recipient-v2-package-v1-recovery-orientation', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('recovery-orientation', readFacts), content: renderRecipientV2Pointer({ createdAt, parent: packageParent, role: 'recovery-orientation', title: 'READ BEFORE PROCEEDING — Tiinex Handoff Carrier', summary: 'Qualified recovery/orientation Pointer for the package-v1 recipient carrier.', prose: 'Read this Start artifact first, qualify the declared Tooling bootstrap, then continue from the exact supplied Handoff Pointer path. Do not infer sibling routes or derive semantic authority from package placement.', currentRead: [...recipientV2EntryCurrentRead(), { label: 'Package Artifact', value: `[Handoff Package](${RECIPIENT_V2_PACKAGE_V1_ROOT_PATH})` }, { label: 'Carrier Dimension', value: `\`${String(carrier.lineage?.dimension || '001')}\`` }, ...(carrier.lineage?.parentDimension ? [{ label: 'Parent Carrier Dimension', value: `\`${String(carrier.lineage.parentDimension)}\`` }] : []), { label: 'Carrier Checkpoint', value: String(carrier.lineage?.checkpointKind || 'progression') }], destinations: [{ label: 'Handoff Package contract', target: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH }, ...(topology.bootstrap ? [{ label: 'Portable Tooling bootstrap', target: topology.bootstrap.artifactPath }] : []), ...topology.workspaces.map((workspace) => ({ label: `Workspace ${workspace.workspaceId}`, target: workspace.workspacePath })), ...topology.routes.map((item) => ({ label: `Selected Handoff route ${item.routeId || item.workspaceRelativeHandoffPath}`, target: item.pointerPath }))], facts: readFacts }) });
  files.push(readFile); topology.read = Object.freeze({ path: readFile.path, sha256: readFile.sha256 });

  for (const duplicate of duplicates(files.map((file) => file.path))) findings.push(finding('error', 'portable.handoff-package-v1.path-duplicate', 'Package v1 generated duplicate package-local paths.', { path: duplicate }));
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-package-v1.path-nonflat', 'Package v1 root surface must remain flat.', { path: file.path || '' }));
  const sortedFiles = [...files].sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
  const bundle = { ...(input.bundle || {}), files: Object.freeze(sortedFiles), handoffClosure: null, transportFormat: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID };
  const inspection = inspectRecipientFacingV2PackageV1(bundle);
  return Object.freeze({ status: inspection.status === 'valid' && !findings.some((item) => item.severity === 'error') ? 'ready' : 'blocked', files: Object.freeze(sortedFiles), topology: deepFreeze(topology), inspection, findings: Object.freeze([...findings, ...(inspection.findings || [])]), boundary: 'Recipient-facing tiinex.handoff.package.v1 carrier with direct complete Workspace bindings and/or generic complete/bounded Workspace Representation bindings; bootstrap/cache ownership is explicit and transport projection creates no semantic authority.' });
}


async function prepareSealedWorkspaceBindings(input = {}) {
  const protections = Array.isArray(input.sealedWorkspaces) ? input.sealedWorkspaces : [];
  if (!protections.length) return Object.freeze({ status: 'ready', byWorkspaceId: new Map() });
  const sourceSurface = input.sourceSurface || null;
  const carrier = input.carrierProjection || {};
  if (!sourceSurface || sourceSurface.status !== 'ready') return blocked('source-surface-unready', sourceSurface?.findings || []);
  const routes = (carrier.routes || []).filter((route) => route.state === 'qualified');
  const selector = String(input.routeSelector || input.routeId || '').trim();
  const selected = selector ? routes.filter((route) => route.id === selector || route.workspaceRelativePath === selector || `${String(route.workspaceId || '')}:${String(route.workspaceRelativePath || '')}` === selector || `handoff-route:${String(route.workspaceId || '')}:${String(route.workspaceRelativePath || '')}` === selector) : routes;
  if (selected.length !== 1) return blocked('route-selection-unresolved', [finding('error', 'portable.handoff-package-v1.route-selection-unresolved', 'Secure package manufacture requires exactly one selected Handoff route.', { count: selected.length })]);
  const routeWorkspaceId = String(selected[0].workspaceId || '');
  const sourceWorkspaceById = new Map((sourceSurface.topology?.workspaces || []).map((item) => [String(item.workspaceId || ''), item]));
  const sourceByPath = new Map((sourceSurface.files || []).map((file) => [String(file.path || ''), file]));
  const byWorkspaceId = new Map();
  const findings = [];
  for (const protection of protections) {
    const workspaceId = String(protection?.workspaceId || '').trim();
    if (!workspaceId || byWorkspaceId.has(workspaceId)) { findings.push(finding('error', 'secure-transport.manufacture.workspace-id-invalid', 'Each sealed Workspace selection must identify one unique carried Workspace.', { workspaceId })); continue; }
    if (workspaceId === routeWorkspaceId) { findings.push(finding('error', 'secure-transport.manufacture.route-workspace-must-remain-clear', 'Secure Transport V1 does not permit sealing the authoritative selected Handoff route Workspace.', { workspaceId })); continue; }
    const source = sourceWorkspaceById.get(workspaceId);
    const sourceArchive = source ? sourceByPath.get(String(source.archivePath || '')) : null;
    if (!source || String(source.coverage || '') !== 'complete' || !sourceArchive) { findings.push(finding('error', 'secure-transport.manufacture.workspace-unresolved', 'Selected sealed Workspace must resolve to one complete qualified source snapshot.', { workspaceId })); continue; }
    const archiveData = packageFileByteView(sourceArchive);
    const parsed = inspectStoredWorkspaceArchive(archiveData, { ownedBytes: true });
    const innerPath = String(source.sourceWorkspaceTargetInnerPath || '');
    const targetMatches = (parsed.entries || []).filter((entry) => entry.path === innerPath);
    if (parsed.state !== 'qualified' || targetMatches.length !== 1) { findings.push(finding('error', 'secure-transport.manufacture.workspace-source-unqualified', 'Selected sealed Workspace source archive/Workspace artifact correlation does not qualify.', { workspaceId })); continue; }
    const targetData = packageFileByteView({ data: targetMatches[0].data });
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: innerPath, targetData, entries: parsed.entries || [] });
    if (targetQualification.state !== 'qualified') { findings.push(finding('error', 'secure-transport.manufacture.workspace-target-unqualified', 'Selected sealed Workspace artifact does not qualify before encryption.', { workspaceId, reasons: targetQualification.reasons || [] })); continue; }
    const sealed = await sealPasswordWorkspacePayload({ plaintext: archiveData, workspaceBindingValue: sha256Hex(targetData), recipients: protection.recipients || [], crypto: input.crypto });
    if (sealed.state !== 'sealed') { findings.push(finding('error', 'secure-transport.manufacture.seal-failed', 'Selected Workspace could not be sealed under the supported V1 profile.', { workspaceId, reason: sealed.reason || sealed.state })); continue; }
    byWorkspaceId.set(workspaceId, sealed);
  }
  return findings.some((item) => item.severity === 'error') ? blocked('secure-workspace-preparation-blocked', findings) : Object.freeze({ status: 'ready', byWorkspaceId, findings: Object.freeze(findings) });
}

function hasBootstrap(bundle = {}) { return (bundle.files || []).some((file) => String(file.path || '').startsWith('tiinex.bootstrap/')); }
