import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { buildHandoffCarrierProjection } from './carrierProjection.js';
import { buildHandoffWorkspaceByteProvider, inspectStoredWorkspaceArchive, resolveHandoffWorkspaceEntry } from './workspaceByteProvider.js';
import { parseWorkspaceQualifiedReference } from './workspaceQualifiedReference.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { inspectRecipientV2Artifact, parseRecipientV2ExternalPayload, parseRecipientV2Facts } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { recipientColdProjection } from './recipientV2.coldProjection.js';
import { buildPackageLocalParentResolver, inspectEndpointRolePointers, inspectParticipantRolePointers, inspectRoutePointers, parentTrace } from './recipientV2.lineage.js';
import { finding } from './recipientV2.topology.materials.js';
import { indexRecipientFiles, recipientWorkspaceDescriptor, virtualCacheMaterial } from './recipientV2.inspect.helpers.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { projectRecipientV2EndpointRoles, projectRecipientV2ParticipantRoles, projectRecipientV2Routes } from './recipientV2.inspect.projection.js';
import { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID } from './recipientV2.packageV1.constants.js';
import { parseHandoffPackageV1, validatePackageFields, WORKSPACE_PACKAGE_ROLE } from './recipientV2.packageV1.contract.js';
import { deriveVisibleFacts, validateRouteClosure } from './recipientV2.packageV1.inspect.helpers.js';
import { workspaceCarrierProjection } from './recipientV2.packageV1.workspaceProjection.js';
import { byteEqual, currentSchemaId, decodeUtf8, dedupeFindings, deepFreeze, oneFile } from './recipientV2.packageV1.shared.js';
import { parseTransportEnvelopeV1, qualifyTransportEnvelopeV1Artifact, TRANSPORT_ENVELOPE_V1_ROLE, TRANSPORT_ENVELOPE_V1_SCHEMA_ID } from './transportEnvelopeV1.js';

export function inspectRecipientFacingV2PackageV1(bundle = {}, options = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const findings = [];
  const index = indexRecipientFiles(files, findings);
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-package-v1.path-nonflat', 'Package v1 carrier root must be flat.', { path: file.path || '' }));
  const packageCandidates = files.filter((file) => currentSchemaId(decodeUtf8(packageFileBytes(file))) === RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID);
  if (packageCandidates.length !== 1) findings.push(finding('error', 'portable.handoff-package-v1.package-artifact-count', 'Carrier must contain exactly one tiinex.handoff.package.v1 artifact.', { count: packageCandidates.length }));
  const packageFile = packageCandidates[0] || null;
  const packageMarkdown = packageFile ? decodeUtf8(packageFileBytes(packageFile)) : '';
  const packageContract = packageFile ? parseHandoffPackageV1(packageMarkdown) : null;
  if (packageFile) {
    if (!/^\d{3}-tiinex-handoff-package\.trace\.md$/.test(String(packageFile.path || ''))) findings.push(finding('error', 'portable.handoff-package-v1.filename-invalid', 'Handoff package artifact filename must expose exactly one numeric package-root dimension.', { path: packageFile.path || '' }));
    const self = canonicalC14nV2SelfState(packageMarkdown);
    if (self.state !== 'verified') findings.push(finding('error', 'portable.handoff-package-v1.integrity-self-invalid', 'Handoff package artifact self-integrity must independently verify.', { reason: self.reason || self.state }));
    validatePackageFields(packageContract, findings);
  }

  const generatedArtifacts = [];
  const resolveParent = buildPackageLocalParentResolver(index);
  for (const file of files) {
    if (!/\.md$/i.test(String(file.path || '')) || file === packageFile) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    const schemaId = currentSchemaId(markdown);
    const facts = file.transportFacts || parseRecipientV2Facts(markdown) || deriveVisibleFacts({ file, markdown, schemaId, packageContract, index });
    if (schemaId === 'tiinex.workspace.v1' && !facts) continue;
    if (schemaId === 'tiinex.party.role.v1') { findings.push(finding('error', 'portable.handoff-package-v1.detached-role-copy', 'Package root must not carry detached Role artifacts; route grounding uses Role Pointers to exact Workspace/cache bytes.', { path: file.path || '' })); continue; }
    if (!facts) { findings.push(finding('error', 'portable.handoff-package-v1.unknown-artifact-role', 'Package root contains Markdown whose semantic carrier role is not justified by package v1.', { path: file.path || '', schemaId })); continue; }
    const artifact = inspectRecipientV2Artifact(file, { facts, resolveParent });
    generatedArtifacts.push(artifact);
    findings.push(...artifact.findings);
  }
  const readArtifact = generatedArtifacts.find((item) => item.path === packageContract?.startPath && item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'recovery-orientation') || null;
  if (!readArtifact) findings.push(finding('error', 'portable.handoff-package-v1.start-unresolved', 'Start Artifact must resolve to one qualified recovery/orientation Pointer.'));
  else if (packageFile && parentTrace(readArtifact) !== packageFile.path) findings.push(finding('error', 'portable.handoff-package-v1.start-parent-mismatch', 'Start Artifact must descend directly from the package artifact.', { observedParent: parentTrace(readArtifact), expectedParent: packageFile.path }));

  const bindings = packageContract?.workspaces || [];
  const workspaceParts = [];
  const workspaceDescriptors = [];
  const virtualWorkspaceTargets = [];
  const sealedWorkspaceBindings = [];
  for (const binding of bindings) {
    const workspaceFile = oneFile(index, binding.workspaceArtifactPath);
    if (!workspaceFile) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-unresolved', 'Workspace Artifact path must resolve exactly once inside the package.', { workspaceId: binding.workspaceId })); continue; }
    const workspaceData = packageFileByteView(workspaceFile);
    const workspaceMarkdown = decodeUtf8(workspaceData);
    if (currentSchemaId(workspaceMarkdown) !== 'tiinex.workspace.v1') findings.push(finding('error', 'portable.handoff-package-v1.workspace-schema-invalid', 'Workspace Artifact must declare tiinex.workspace.v1.', { workspaceId: binding.workspaceId, path: workspaceFile.path || '' }));

    if (String(binding.snapshotKind || '') === 'password-sealed-workspace-byte-tree') {
      const payloadArtifact = generatedArtifacts.find((item) => item.path === binding.protectedPayloadDescriptorPath && item.schemaId === 'tiinex.external.payload.v1' && item.status === 'qualified') || null;
      const envelopeArtifact = generatedArtifacts.find((item) => item.path === binding.transportEnvelopePath && item.schemaId === TRANSPORT_ENVELOPE_V1_SCHEMA_ID && item.status === 'qualified') || null;
      if (!payloadArtifact || !envelopeArtifact) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-binding-unresolved', 'Sealed Workspace binding descriptor and Transport Envelope must each resolve exactly once and qualify.', { workspaceId: binding.workspaceId })); continue; }
      const payload = parseRecipientV2ExternalPayload(payloadArtifact.markdown);
      const payloadFile = oneFile(index, payload.location);
      if (!payloadFile || payload.integrityMethod !== 'sha256' || !/^[0-9a-f]{64}$/.test(String(payload.integrityValue || ''))) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-payload-invalid', 'Protected External Payload descriptor must own one exact package-local ciphertext with SHA-256 integrity.', { workspaceId: binding.workspaceId })); continue; }
      const protectedBytes = packageFileByteView(payloadFile);
      if (sha256Hex(protectedBytes) !== payload.integrityValue || Number(payload.bytes || 0) !== protectedBytes.byteLength) findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-payload-byte-mismatch', 'Protected payload descriptor byte identity diverges from exact carried ciphertext.', { workspaceId: binding.workspaceId }));
      if (binding.byteSize !== null && Number(binding.byteSize) !== protectedBytes.byteLength) findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-size-mismatch', 'Sealed binding Byte Size diverges from protected payload bytes.', { workspaceId: binding.workspaceId }));
      const envelopeQualification = qualifyTransportEnvelopeV1Artifact(envelopeArtifact.markdown);
      if (envelopeQualification.status !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-envelope-invalid', 'Transport Envelope failed Secure Transport V1 qualification.', { workspaceId: binding.workspaceId, causes: envelopeQualification.findings || [] }));
      const envelope = envelopeQualification.parsed || parseTransportEnvelopeV1(envelopeArtifact.markdown);
      if (String(envelope.workspaceArtifactPath || '') !== String(binding.workspaceArtifactPath || '') || String(envelope.protectedPayloadDescriptorPath || '') !== String(binding.protectedPayloadDescriptorPath || '')) findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-envelope-binding-mismatch', 'Transport Envelope must bind the same visible Workspace Artifact and protected External Payload descriptor as the package binding.', { workspaceId: binding.workspaceId }));
      if (String(envelope.workspaceBindingValue || '') !== sha256Hex(workspaceData)) findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-workspace-binding-mismatch', 'Transport Envelope Workspace Binding Value must equal SHA-256 of exact visible Workspace Artifact bytes.', { workspaceId: binding.workspaceId }));
      if (String(payloadArtifact.facts?.workspaceId || '') && String(payloadArtifact.facts.workspaceId) !== String(binding.workspaceId || '')) findings.push(finding('error', 'portable.handoff-package-v1.workspace-sealed-payload-workspace-mismatch', 'Protected payload descriptor Workspace Id diverges from package binding.', { workspaceId: binding.workspaceId }));
      workspaceParts.push({ workspaceId: binding.workspaceId, bindingState: 'sealed', artifact: Object.freeze({ path: workspaceFile.path, sha256: sha256Hex(workspaceData), markdown: workspaceMarkdown }), facts: { workspaceId: binding.workspaceId, sourceWorkspaceTargetInnerPath: '', sourceWorkspaceTargetSha256: sha256Hex(workspaceData) }, archiveFile: null, archive: null, targetQualification: null, protectedPayloadArtifact: payloadArtifact, protectedPayloadFile: payloadFile, transportEnvelopeArtifact: envelopeArtifact });
      sealedWorkspaceBindings.push(Object.freeze({ workspaceId: binding.workspaceId, workspaceArtifactPath: binding.workspaceArtifactPath, workspaceArtifactSha256: sha256Hex(workspaceData), protectedPayloadDescriptorPath: binding.protectedPayloadDescriptorPath, protectedPayloadPath: payload.location, protectedPayloadSha256: payload.integrityValue, protectedPayloadBytes: protectedBytes.byteLength, transportEnvelopePath: binding.transportEnvelopePath, envelope }));
      virtualWorkspaceTargets.push(workspaceFile);
      continue;
    }

    const archiveFile = oneFile(index, binding.snapshotPath);
    if (!archiveFile) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-unresolved', 'Clear Workspace Snapshot path must resolve exactly once inside the package.', { workspaceId: binding.workspaceId })); continue; }
    if (String(binding.snapshotKind || '') !== 'exact-workspace-byte-tree-archive' || String(binding.coverage || '') !== 'complete' || String(binding.bindingState || '') !== 'verified' || String(binding.integrityMethod || '') !== 'sha256') findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-contract-invalid', 'Qualified clear package v1 Workspace binding requires exact complete verified sha256 semantics.', { workspaceId: binding.workspaceId }));
    const archiveData = packageFileByteView(archiveFile);
    const archiveSha = sha256Hex(archiveData);
    if (archiveSha !== binding.integrityValue) findings.push(finding('error', 'portable.handoff-package-v1.workspace-snapshot-digest-mismatch', 'Workspace Snapshot Integrity Value diverges from exact carried bytes.', { workspaceId: binding.workspaceId }));
    if (binding.byteSize !== null && Number(binding.byteSize) !== archiveData.byteLength) findings.push(finding('error', 'portable.handoff-package-v1.workspace-snapshot-size-mismatch', 'Workspace Snapshot Byte Size diverges from exact carried bytes.', { workspaceId: binding.workspaceId }));
    const parsed = inspectStoredWorkspaceArchive(archiveData, { ownedBytes: true });
    if (parsed.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-package-v1.workspace-snapshot-invalid', 'Workspace Snapshot failed safe normalized archive qualification.', { workspaceId: binding.workspaceId })); continue; }
    const inner = (parsed.entries || []).filter((entry) => entry.path === binding.workspaceArtifactInnerPath);
    if (inner.length !== 1) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-inner-unresolved', 'Workspace Artifact Inner Path must resolve exactly once.', { workspaceId: binding.workspaceId, count: inner.length })); continue; }
    const innerData = packageFileByteView({ data: inner[0].data });
    if (!byteEqual(workspaceData, innerData)) findings.push(finding('error', 'portable.handoff-package-v1.workspace-inner-byte-mismatch', 'Carried Workspace Artifact bytes must exactly equal the selected snapshot inner entry.', { workspaceId: binding.workspaceId }));
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: binding.workspaceArtifactInnerPath, targetData: workspaceData, entries: parsed.entries || [] });
    if (targetQualification.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.workspace-target-unqualified', 'Exact bound Workspace Artifact does not qualify.', { workspaceId: binding.workspaceId, reasons: targetQualification.reasons || [] }));
    const descriptorPart = recipientWorkspaceDescriptor({ workspaceId: binding.workspaceId, facts: { providerKind: 'package-local-stored-zip-v1' }, representation: { workspaceArtifactInnerPath: binding.workspaceArtifactInnerPath, coverage: 'complete' }, payload: { location: binding.snapshotPath }, entries: parsed.entries || [], targetMarkdown: workspaceMarkdown, targetPackagePath: binding.workspaceArtifactPath, targetFile: { bytes: workspaceData.byteLength, sha256: sha256Hex(workspaceData) }, archiveFile: { path: archiveFile.path, bytes: archiveData.byteLength, sha256: archiveSha } });
    workspaceDescriptors.push(descriptorPart);
    workspaceParts.push({ workspaceId: binding.workspaceId, bindingState: 'verified', artifact: Object.freeze({ path: workspaceFile.path, sha256: sha256Hex(workspaceData), markdown: workspaceMarkdown }), facts: { workspaceId: binding.workspaceId, sourceWorkspaceTargetInnerPath: binding.workspaceArtifactInnerPath, sourceWorkspaceTargetSha256: sha256Hex(workspaceData) }, archiveFile, archive: { archive: parsed, sha256: archiveSha }, targetQualification });
    virtualWorkspaceTargets.push(workspaceFile);
  }

  const payloadArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.external.payload.v1' && item.status === 'qualified');
  const bootstrapArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'portable Tooling bootstrap runtime for recipient orientation and verification');
  const cacheArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'workspace-scoped Handoff dependency cache');
  const protectedWorkspacePayloadArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'password-sealed Workspace protected payload');
  const forbiddenWorkspacePayloads = payloadArtifacts.filter((item) => item.facts?.role === 'workspace-representation-payload');
  if (forbiddenWorkspacePayloads.length) findings.push(finding('error', 'portable.handoff-package-v1.workspace-payload-redundant', 'Complete package-local Workspace bindings must not carry redundant Workspace External Payload companions.', { count: forbiddenWorkspacePayloads.length }));
  if (generatedArtifacts.some((item) => item.schemaId === 'tiinex.workspace.representation.v1' || item.schemaId === 'tiinex.relation.v1')) findings.push(finding('error', 'portable.handoff-package-v1.workspace-representation-redundant', 'Complete package-local Workspace bindings must not carry redundant Workspace Representation/Relation companions.'));

  let bootstrapInspection = null;
  if (packageContract?.bootstrapPath) {
    const bootstrapArtifact = bootstrapArtifacts.find((item) => item.path === packageContract.bootstrapPath) || null;
    if (!bootstrapArtifact) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-unresolved', 'Tooling Bootstrap Descriptor must resolve to one qualified bootstrap External Payload artifact.'));
    else {
      const payload = parseRecipientV2ExternalPayload(bootstrapArtifact.markdown);
      const zip = oneFile(index, payload.location);
      if (!zip || payload.integrityMethod !== 'sha256' || payload.integrityValue !== (zip ? sha256Hex(packageFileBytes(zip)) : '')) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-payload-invalid', 'Tooling bootstrap descriptor/payload byte identity failed qualification.'));
      else {
        const parsed = inspectStoredWorkspaceArchive(packageFileBytes(zip), { ownedBytes: true });
        if (parsed.state === 'qualified') {
          bootstrapInspection = inspectPortableToolingBootstrap({ files: (parsed.entries || []).map((entry) => Object.freeze({ path: `tiinex.bootstrap/${entry.path}`, data: entry.data })) });
          if (bootstrapInspection.status !== 'valid') findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-runtime-unqualified', 'Tooling bootstrap payload failed embedded runtime qualification.'));
        }
      }
    }
  }

  const caches = [];
  for (const artifact of cacheArtifacts) {
    const payload = parseRecipientV2ExternalPayload(artifact.markdown);
    const file = oneFile(index, payload.location);
    if (!file) { findings.push(finding('error', 'portable.handoff-package-v1.cache-payload-missing', 'Cache descriptor payload location is unresolved.', { path: artifact.path })); continue; }
    const parsed = inspectStoredWorkspaceArchive(packageFileBytes(file), { ownedBytes: true });
    if (parsed.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.cache-payload-invalid', 'Cache payload is not a qualified safe stored ZIP.', { path: file.path }));
    caches.push({ artifact, file, facts: artifact.facts || {}, archive: { archive: parsed, sha256: sha256Hex(packageFileBytes(file)) } });
  }
  const virtualCacheParts = caches.map((cache) => virtualCacheMaterial(cache, findings));
  const virtualCache = { files: Object.freeze(virtualCacheParts.flatMap((item) => item.files || [])), materialized: Object.freeze(virtualCacheParts.flatMap((item) => item.materialized || [])) };

  const descriptor = deepFreeze({ schema: 'tiinex.transport.handoff-material-closure-descriptor.v2', version: 2, workspaceMaterializations: Object.freeze(workspaceDescriptors.map((item) => item.workspace)), workspaceArchiveBindings: Object.freeze(workspaceDescriptors.map((item) => item.binding)), materialized: Object.freeze(virtualCache.materialized), requirements: Object.freeze({ required: Object.freeze([]), reference: Object.freeze([]), endpointRoles: Object.freeze([]), participantRoles: Object.freeze([]), dependencies: Object.freeze([]) }) });
  const semanticBundle = { ...bundle, files: Object.freeze([...files, ...virtualCache.files]) };
  const workspaceByteProvider = buildHandoffWorkspaceByteProvider(semanticBundle, descriptor);
  findings.push(...(workspaceByteProvider.findings || []));

  const routePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'handoff-route' && item.status === 'qualified');
  const endpointRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'endpoint-role' && item.status === 'qualified');
  const participantRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'participant-role' && item.status === 'qualified');
  const lineage = packageContract ? Object.freeze({ dimension: packageContract.carrierDimension, parentDimension: packageContract.parentCarrierDimension, checkpointKind: packageContract.carrierCheckpoint, majorReason: packageContract.majorReason || '' }) : null;
  const workspaceMode = String(packageContract?.packageRole || '') === WORKSPACE_PACKAGE_ROLE;
  let carrierProjection;
  if (workspaceMode) {
    if (routePointers.length || endpointRolePointers.length || participantRolePointers.length || caches.length) findings.push(finding('error', 'portable.handoff-package-v1.workspace-carrier.handoff-surface-present', 'Pointerless Workspace carrier must not expose Handoff route, Role pointer, or Handoff cache carriers.', { routes: routePointers.length, endpointRoles: endpointRolePointers.length, participantRoles: participantRolePointers.length, caches: caches.length }));
    carrierProjection = workspaceCarrierProjection(workspaceParts, lineage);
  } else {
    inspectEndpointRolePointers(endpointRolePointers, workspaceParts, caches, findings);
    inspectParticipantRolePointers(participantRolePointers, workspaceParts, caches, findings);
    const routeSpecs = routePointers.map((pointer) => ({ workspaceId: String(pointer.facts?.workspaceId || ''), path: String(pointer.facts?.workspaceRelativeHandoffPath || ''), purpose: '' }));
    carrierProjection = buildHandoffCarrierProjection({ bundle: semanticBundle, descriptor, workspaceByteProvider, carrierLineage: lineage, routes: routeSpecs });
    if (carrierProjection.status !== 'ready') findings.push(finding('error', 'portable.handoff-package-v1.routes-unqualified', 'Selected Handoff Pointer does not independently resolve to qualified authoritative Handoff bytes.', { causes: carrierProjection.findings || [] }));
    inspectRoutePointers(routePointers, carrierProjection, workspaceParts, endpointRolePointers, participantRolePointers, index, findings);
    validateRouteClosure(routePointers, endpointRolePointers, participantRolePointers, caches, workspaceParts, findings);
    if (routePointers.length !== 1) findings.push(finding('error', 'portable.handoff-package-v1.route-count-invalid', 'Qualified Handoff-carrier package-v1 delivery requires exactly one selected Handoff Pointer.', { count: routePointers.length }));
    const sealedWorkspaceIds = new Set(sealedWorkspaceBindings.map((item) => String(item.workspaceId || '')));
    for (const route of carrierProjection.routes || []) {
      const unresolved = (route.requiredClosure?.requirements || []).filter((requirement) => requirement.state !== 'qualified');
      const lockedOnly = unresolved.length > 0 && unresolved.every((requirement) => {
        const qualified = parseWorkspaceQualifiedReference(String(requirement.referenceTarget || ''));
        return qualified && sealedWorkspaceIds.has(String(qualified.workspaceId || ''));
      });
      if (route.requiredClosure?.state !== 'qualified' && !lockedOnly) findings.push(finding('error', 'portable.handoff-package-v1.required-closure-unqualified', 'Authoritative Handoff Required Context is neither qualified clear material nor an explicitly sealed locked Workspace binding.', { routeId: route.id || '' }));
      for (const requirement of route.requiredClosure?.requirements || []) if (requirement.state === 'qualified' && !['workspace-archive-entry', 'materialized-required-material'].includes(String(requirement.resolution?.kind || ''))) findings.push(finding('error', 'portable.handoff-package-v1.external-closure-asset', 'Selected route closure requires a carrier kind not owned by complete Workspace snapshots or bounded cache.', { routeId: route.id || '', requirementId: requirement.requirementId || '', kind: requirement.resolution?.kind || '' }));
    }
    const allowedCacheRequirementIds = new Set();
    for (const route of carrierProjection.routes || []) for (const requirement of route.requiredClosure?.requirements || []) if (requirement.requirementId) allowedCacheRequirementIds.add(String(requirement.requirementId));
    for (const pointer of endpointRolePointers) if (pointer.facts?.endpointRequirementId) allowedCacheRequirementIds.add(String(pointer.facts.endpointRequirementId));
    for (const pointer of participantRolePointers) if (pointer.facts?.participantRequirementId) allowedCacheRequirementIds.add(String(pointer.facts.participantRequirementId));
    for (const requirementId of qualifyParentBoundaryCacheRequirementIds(caches, workspaceByteProvider, carrierProjection, findings)) allowedCacheRequirementIds.add(requirementId);
    for (const cache of caches) for (const material of cache.facts?.materials || []) {
      const requirementId = String(material.sourceRequirementId || material.requirementId || '');
      if (!requirementId || !allowedCacheRequirementIds.has(requirementId)) findings.push(finding('error', 'portable.handoff-package-v1.cache-over-expansion', 'Workspace dependency cache contains material not required by the selected Handoff route closure.', { cache: cache.artifact.path, requirementId }));
    }
  }

  const knownPaths = new Set([
    packageFile?.path,
    packageContract?.startPath,
    ...(bindings || []).flatMap((binding) => [binding.workspaceArtifactPath, binding.snapshotPath, binding.protectedPayloadDescriptorPath, binding.transportEnvelopePath]),
    ...protectedWorkspacePayloadArtifacts.flatMap((artifact) => [artifact.path, parseRecipientV2ExternalPayload(artifact.markdown).location]),
    ...generatedArtifacts.filter((item) => ['recovery-orientation', 'handoff-route', 'endpoint-role', 'participant-role'].includes(String(item.facts?.role || ''))).map((item) => item.path),
    ...bootstrapArtifacts.flatMap((artifact) => [artifact.path, parseRecipientV2ExternalPayload(artifact.markdown).location]),
    ...caches.flatMap((cache) => [cache.artifact.path, cache.file.path])
  ].filter(Boolean));
  for (const file of files) {
    const filePath = String(file.path || '');
    if (/\.json$/i.test(filePath)) findings.push(finding('error', 'portable.handoff-package-v1.parallel-truth-json', 'Package-v1 carrier must not contain receipt.json, manifest.json, or equivalent root-level JSON parallel semantic truth.', { path: filePath }));
    if (!knownPaths.has(filePath)) findings.push(finding('error', 'portable.handoff-package-v1.unknown-package-artifact', 'Package root contains an artifact whose carrier semantic role is not justified by package-v1 bindings or selected route closure.', { path: filePath }));
  }
  const finalFindings = dedupeFindings(findings);
  const status = finalFindings.some((item) => item.severity === 'error') ? 'invalid' : 'valid';
  const coldConsumerProjection = recipientColdProjection(carrierProjection, RECIPIENT_V2_READ_PATH);
  return deepFreeze({
    schema: 'tiinex.portable.recipient-facing-handoff-package-v1.inspection.v1', detected: Boolean(packageFile), status, format: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID,
    rootArtifact: packageFile ? Object.freeze({ path: packageFile.path, schemaId: RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, sha256: sha256Hex(packageFileBytes(packageFile)), carrierLineage: lineage }) : null,
    readArtifact, workspaces: Object.freeze(workspaceParts.map((item) => Object.freeze({ workspaceId: item.workspaceId, coverage: 'complete', bindingState: item.bindingState || 'verified', workspaceArtifactPath: item.artifact.path, workspaceArchivePath: item.archiveFile?.path || '', sourceWorkspaceTargetInnerPath: item.facts.sourceWorkspaceTargetInnerPath, sourceWorkspaceTargetSha256: item.facts.sourceWorkspaceTargetSha256 }))), sealedWorkspaces: Object.freeze(sealedWorkspaceBindings),
    routes: projectRecipientV2Routes(routePointers, endpointRolePointers, participantRolePointers), endpointRoles: projectRecipientV2EndpointRoles(endpointRolePointers), participantRoles: projectRecipientV2ParticipantRoles(participantRolePointers),
    caches: Object.freeze(caches.map((cache) => Object.freeze({ workspaceId: String(cache.facts?.workspaceId || ''), artifactPath: cache.artifact.path, archivePath: cache.file.path, materials: cache.facts.materials || [] }))),
    bootstrapInspection, transportManifest: null, artifactFacts: Object.freeze(generatedArtifacts.map((item) => Object.freeze({ path: item.path, facts: item.facts }))), descriptor, workspaceByteProvider, carrierProjection, coldConsumerProjection,
    packageContract, findings: Object.freeze(finalFindings), findingSummary: Object.freeze({ errors: finalFindings.filter((item) => item.severity === 'error').length, findings: finalFindings.length }),
    boundary: 'Read-only qualification of tiinex.handoff.package.v1: visible package identity/discovery and complete package-local Workspace bindings are reverified from exact bytes; derived inventories have no authority.'
  });
}

function qualifyParentBoundaryCacheRequirementIds(caches = [], workspaceByteProvider = {}, carrierProjection = {}, findings = []) {
  const parentMaterials = [];
  const targetIndex = new Map();
  for (const cache of caches) for (const item of cache.facts?.materials || []) {
    if (String(item.classification || '') !== 'parent-boundary') continue;
    const entry = (cache.archive?.archive?.entries || []).find((candidate) => String(candidate.path || '') === String(item.archiveEntry || '')) || null;
    const normalized = Object.freeze({ cache, item, entry, targetKey: `${String(item.targetWorkspaceId || '')}\0${normalizeWorkspacePath(item.targetPath || item.originalPath || '')}` });
    parentMaterials.push(normalized);
    const list = targetIndex.get(normalized.targetKey) || [];
    list.push(normalized);
    targetIndex.set(normalized.targetKey, list);
  }
  const allowed = new Set();
  for (const candidate of parentMaterials) {
    const item = candidate.item || {};
    const requirementId = String(item.requirementId || '');
    const routeWorkspaceId = String(item.routeWorkspaceId || '');
    const routePath = normalizeWorkspacePath(item.routePath || '');
    const sourceWorkspaceId = String(item.sourceWorkspaceId || '');
    const sourcePath = normalizeWorkspacePath(item.sourcePath || '');
    const targetWorkspaceId = String(item.targetWorkspaceId || '');
    const targetPath = normalizeWorkspacePath(item.targetPath || item.originalPath || '');
    const referenceTarget = String(item.referenceTarget || '').trim();
    const routeQualified = (carrierProjection.routes || []).some((route) => String(route.state || '') === 'qualified' && String(route.workspaceId || '') === routeWorkspaceId && normalizeWorkspacePath(route.workspaceRelativePath || '') === routePath);
    let reason = '';
    if (!requirementId || !routeQualified || !sourceWorkspaceId || !sourcePath || !targetWorkspaceId || !targetPath || !referenceTarget || !candidate.entry) reason = 'parent-boundary-visible-facts-incomplete';
    if (!reason && targetIndex.get(candidate.targetKey)?.length !== 1) reason = 'parent-boundary-target-ambiguous';
    if (!reason) {
      const alreadyCarried = resolveHandoffWorkspaceEntry(workspaceByteProvider, targetWorkspaceId, targetPath);
      if (alreadyCarried.state === 'qualified') reason = 'parent-boundary-target-redundantly-carried';
    }
    let sourceData = null;
    if (!reason) {
      const sourceCarried = resolveHandoffWorkspaceEntry(workspaceByteProvider, sourceWorkspaceId, sourcePath);
      if (sourceCarried.state === 'qualified') sourceData = sourceCarried.data;
      else {
        const sourceCandidates = targetIndex.get(`${sourceWorkspaceId}\0${sourcePath}`) || [];
        if (sourceCandidates.length === 1 && sourceCandidates[0].entry) sourceData = sourceCandidates[0].entry.data;
        else reason = 'parent-boundary-source-unresolved';
      }
    }
    if (!reason) {
      const markdown = decodeUtf8(packageFileBytes({ data: sourceData }));
      let parent = null;
      try { parent = parseArtifactMarkdown(markdown).envelope?.parent || null; } catch { parent = null; }
      const declared = String(parent?.trace || (parent?.originEntries || []).find((entry) => String(entry?.label || '').trim() === 'relative')?.target || '').trim();
      if (!declared || declared !== referenceTarget) reason = 'parent-boundary-reference-mismatch';
      else {
        const qualified = parseWorkspaceQualifiedReference(declared);
        const expectedWorkspaceId = qualified ? String(qualified.workspaceId || '') : sourceWorkspaceId;
        const expectedPath = qualified ? normalizeWorkspacePath(qualified.path || '') : resolveRelativeWorkspacePath(sourcePath, declared);
        if (!expectedWorkspaceId || !expectedPath || expectedWorkspaceId !== targetWorkspaceId || expectedPath !== targetPath) reason = 'parent-boundary-target-mismatch';
      }
    }
    if (reason) findings.push(finding('error', 'portable.handoff-package-v1.cache-parent-boundary-unqualified', 'Workspace dependency cache Parent-boundary material is not independently justified by the selected route declared Parent chain.', { requirementId, reason }));
    else allowed.add(requirementId);
  }
  return allowed;
}

function resolveRelativeWorkspacePath(sourcePath = '', target = '') {
  let raw;
  try { raw = decodeURIComponent(String(target || '').split('#')[0].split('?')[0]); } catch { return ''; }
  if (!raw || raw.startsWith('/') || raw.startsWith('\\') || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return '';
  const parts = normalizeWorkspacePath(sourcePath).split('/').slice(0, -1);
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) return ''; parts.pop(); }
    else parts.push(part);
  }
  return normalizeWorkspacePath(parts.join('/'));
}

function normalizeWorkspacePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
