import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inferWorkspaceTitle, normalizeAdditionalWorkspaceDescriptors, normalizeTransportRoute, safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import { buildToolingBootstrapTransportFiles, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID } from './handoff.manufacture.bootstrap.js';
import { qualifyToolingRuntimeSourceAlignment } from './handoff.manufacture.runtimeSource.js';
import { normalizeHandoffCarrierLineage } from '../../handoff/carrierLineage.js';
import { normalizeHandoffCarrierProfile } from '../../handoff/carrierProfile.js';
import { enumerateNodeWorkspace, PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID } from './handoff.manufacture.enumeration.js';
import { preparePackageParentExactMaterialProvider, preparePackageParentWorkspaceReuse, projectPackageParentMaterialClosurePreflight, projectRequiredContextWorkspaceSelectionPreflight, resolvePackageParentRequirementMaterials } from './handoff.manufacture.packageParent.js';
import { qualifyPortableSourceReconciliationProofForManufacture } from '../../comparison/sourceFrontierReconciliationProof.js';
import { qualifyPortableManufactureSchemaReferenceCandidate } from '../../handoff/schemaReferencePreflight.js';
import { qualifyDelegationReturnReservation } from '../../handoff/delegationReturnReservation.js';
import {
  assertInside,
  expandPointerDependencyClosure,
  normalizeRelativePath,
  projectManufacturingRequirements,
  resolveWorkspaceRequirementMaterials
} from './handoff.manufacture.requirements.js';
import {
  expandBoundedParentBoundaryClosure,
  expandRouteParentBoundaryClosure,
  normalizeWorkspaceScopes,
  normalizeWorkspaceTargetBindings,
  projectBoundedWorkspaceMaterialization
} from './handoff.manufacture.scope.js';

export { buildToolingBootstrapTransportFiles, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID };
export { enumerateNodeWorkspace, PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID } from './handoff.manufacture.enumeration.js';

export async function prepareNodeHandoffManufacturingInput(input = {}, options = {}) {
  const workspaceRoot = path.resolve(String(input.workspaceRoot || input.workspace || '.'));
  const workspaceId = safeWorkspaceToken(input.workspaceId || path.basename(workspaceRoot) || 'workspace');
  const requestedWorkspaceTitle = String(input.workspaceTitle || input.title || '').trim();
  const handoffPath = normalizeRelativePath(input.handoffPath || input.handoff || '');
  if (!handoffPath) throw new Error('portable.handoff-manufacture.handoff-path.required');
  const absoluteHandoff = path.resolve(workspaceRoot, handoffPath);
  assertInside(workspaceRoot, absoluteHandoff, 'portable.handoff-manufacture.handoff-path.outside-workspace');
  const handoffMarkdownPromise = readFile(absoluteHandoff, 'utf8');
  const toolingBootstrapPromise = buildToolingBootstrapTransportFiles({
    delivery: input.toolingBootstrap || input.bootstrapDelivery || 'embedded',
    runtimeRoot: input.runtimeRoot || options.runtimeRoot,
    expected: input.expectedToolingBootstrap || null,
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  }).then(
    (value) => Object.freeze({ value, error: null }),
    (error) => Object.freeze({ value: null, error })
  );
  const additionalWorkspaceDescriptors = normalizeAdditionalWorkspaceDescriptors(input.additionalWorkspaces || input.workspaceRoots || input.workspaceDescriptors || []);
  const seenWorkspaceIds = new Set([workspaceId]);
  const additionalWorkspaceInputs = additionalWorkspaceDescriptors.map((descriptor) => {
    const id = safeWorkspaceToken(descriptor.id || descriptor.workspaceId || '');
    if (!descriptor.id && !descriptor.workspaceId) throw new Error('portable.handoff-manufacture.additional-workspace.id.required');
    if (seenWorkspaceIds.has(id)) throw new Error(`portable.handoff-manufacture.workspace-id.duplicate:${id}`);
    seenWorkspaceIds.add(id);
    if (!descriptor.root && !descriptor.workspaceRoot && !descriptor.path) throw new Error(`portable.handoff-manufacture.additional-workspace.root.required:${id}`);
    return Object.freeze({
      descriptor,
      id,
      root: path.resolve(String(descriptor.root || descriptor.workspaceRoot || descriptor.path || '')),
      requestedTitle: String(descriptor.title || descriptor.name || descriptor.workspaceTitle || '').trim()
    });
  });
  const packageParentReuse = preparePackageParentWorkspaceReuse({
    bundle: input.packageParentBundle || null,
    currentWorkspaceIds: [...seenWorkspaceIds],
    parentPackagePath: input.packageParentPath || '',
    parentPackageSha256: input.packageParentSha256 || '',
    workspaceIds: input.packageParentWorkspaceIds || input.reusePackageParentWorkspaceIds || [],
    workspaceAliases: input.packageParentWorkspaceAliases || input.workspaceAliases || {}
  });
  const packageParentExactMaterialProvider = preparePackageParentExactMaterialProvider({
    bundle: input.packageParentBundle || null,
    currentWorkspaceIds: [...seenWorkspaceIds],
    parentPackagePath: input.packageParentPath || '',
    parentPackageSha256: input.packageParentSha256 || ''
  });
  const handoffMarkdown = await handoffMarkdownPromise;
  const requiredContextWorkspaceSelectionPreflight = projectRequiredContextWorkspaceSelectionPreflight({
    handoffMarkdown,
    currentWorkspaceIds: [...seenWorkspaceIds],
    packageParentReuse
  });
  if (requiredContextWorkspaceSelectionPreflight.state === 'action-required') {
    throw new Error(`portable.handoff-manufacture.required-context.workspace-selection.required: ${requiredContextWorkspaceSelectionPreflight.nextAction} Missing Workspace ids: ${requiredContextWorkspaceSelectionPreflight.missingWorkspaceIds.join(',')}. Tooling will not auto-select package-parent Workspace source from carrier lineage.`);
  }
  const enumerationPromise = enumerateNodeWorkspace(workspaceRoot, {
    workspaceId,
    workspaceTitle: requestedWorkspaceTitle,
    sourceMetadata: input.workspaceSource || input.sourceMetadata || {},
    excludeDirectories: input.excludeDirectories || options.excludeDirectories,
    excludeRelativePaths: input.excludeRelativePaths || options.excludeRelativePaths,
    maxFiles: input.maxFiles || options.maxFiles
  });
  const additionalEnumerationsPromise = Promise.all(additionalWorkspaceInputs.map(async ({ descriptor, id, root, requestedTitle }) => {
    const enumerated = await enumerateNodeWorkspace(root, {
      workspaceId: id,
      workspaceTitle: requestedTitle,
      sourceMetadata: descriptor.source || descriptor.sourceMetadata || {},
      excludeDirectories: descriptor.excludeDirectories || input.excludeDirectories || options.excludeDirectories,
      excludeRelativePaths: descriptor.excludeRelativePaths || input.excludeRelativePaths || options.excludeRelativePaths,
      maxFiles: descriptor.maxFiles || input.maxFiles || options.maxFiles
    });
    if (enumerated.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${id}.${enumerated.status}`);
    return Object.freeze({ descriptor, id, root, requestedTitle, enumerated });
  }));

  const [enumeration, additionalEnumerations] = await Promise.all([
    enumerationPromise,
    additionalEnumerationsPromise
  ]);
  const handoff = Object.freeze({
    id: handoffPath,
    path: handoffPath,
    semanticStatus: String(input.handoffSemanticStatus || 'unknown'),
    markdown: handoffMarkdown
  });

  const schemaReferencePreflight = qualifyPortableManufactureSchemaReferenceCandidate(handoff);
  const returnCarrierReservationPreflight = qualifyDelegationReturnReservation({ markdown: handoffMarkdown, returnPackageSiblingIndex: input.returnPackageSiblingIndex, returnPackageMajor: input.returnPackageMajor === true });

  if (enumeration.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${enumeration.status}`);
  const workspaceTitle = requestedWorkspaceTitle || inferWorkspaceTitle(enumeration) || workspaceId;
  const primaryMaterialization = Object.freeze({ ...enumeration.materialization, title: workspaceTitle });
  const workspaceMaterializations = [primaryMaterialization];
  const workspaceEnumerations = [Object.freeze({ id: workspaceId, root: workspaceRoot, evidence: enumeration.evidence })];
  const workspaceRuntimeById = new Map([[workspaceId, Object.freeze({ id: workspaceId, root: workspaceRoot, enumeration })]]);
  for (const { id, root, requestedTitle, enumerated } of additionalEnumerations) {
    const title = requestedTitle || inferWorkspaceTitle(enumerated) || id;
    workspaceMaterializations.push(Object.freeze({ ...enumerated.materialization, title }));
    workspaceEnumerations.push(Object.freeze({ id, root, evidence: enumerated.evidence }));
    workspaceRuntimeById.set(id, Object.freeze({ id, root, enumeration: enumerated }));
  }
  for (const inherited of packageParentReuse.inherited || []) {
    const id = safeWorkspaceToken(inherited.id || inherited.enumeration?.materialization?.id || '');
    if (!id || workspaceRuntimeById.has(id)) throw new Error(`portable.handoff-manufacture.package-parent.workspace-precedence.invalid:${id || 'unresolved'}`);
    const inheritedEnumeration = inherited.enumeration;
    workspaceMaterializations.push(inheritedEnumeration.materialization);
    workspaceEnumerations.push(Object.freeze({ id, root: '', evidence: inheritedEnumeration.evidence, provider: 'qualified-package-parent-workspace' }));
    workspaceRuntimeById.set(id, Object.freeze({ id, root: '', enumeration: inheritedEnumeration, provider: 'qualified-package-parent-workspace' }));
  }
  for (const provided of packageParentReuse.providers || []) {
    const id = safeWorkspaceToken(provided.id || provided.enumeration?.materialization?.id || '');
    if (!id || workspaceRuntimeById.has(id)) continue;
    workspaceRuntimeById.set(id, Object.freeze({ id, root: '', enumeration: provided.enumeration, provider: 'qualified-package-parent-workspace-material-provider' }));
  }
  const suppliedTransportRoutes = [...(input.transportRoutes || input.handoffRoutes || [])].map((route) => normalizeTransportRoute(route, workspaceId)).filter(Boolean);
  const reservationProjection = returnCarrierReservationPreflight.state === 'qualified' && returnCarrierReservationPreflight.returnExpected
    && (returnCarrierReservationPreflight.carrierKind === 'major' || Number.isInteger(returnCarrierReservationPreflight.siblingIndex))
    ? Object.freeze({ carrierKind: returnCarrierReservationPreflight.carrierKind, ...(Number.isInteger(returnCarrierReservationPreflight.siblingIndex) ? { siblingIndex: returnCarrierReservationPreflight.siblingIndex } : {}) })
    : null;
  const transportRoutes = Object.freeze((suppliedTransportRoutes.length ? suppliedTransportRoutes : [Object.freeze({ workspaceId, path: handoffPath })]).map((route) => Object.freeze({ ...route, ...(route.path === handoffPath && String(route.workspaceId || '') === workspaceId && reservationProjection ? { returnCarrierReservation: reservationProjection } : {}) })));
  const workspaceTargets = mergeWorkspaceTargetBindings(normalizeWorkspaceTargetBindings({
    primaryWorkspaceId: workspaceId,
    primaryTargetPath: input.workspaceTargetPath || input.workspaceArtifactPath || '',
    explicitBindings: input.workspaceTargets || input.workspaceTargetBindings || [],
    additionalWorkspaceDescriptors
  }), packageParentReuse.workspaceTargets || []);
  const workspaceScopes = normalizeWorkspaceScopes(input.workspaceScopes || input.workspaceScopeBindings || []);
  for (let index = 0; index < workspaceMaterializations.length; index += 1) {
    const materialization = workspaceMaterializations[index];
    const scope = workspaceScopes.get(String(materialization.id || '')) || null;
    if (!scope || scope.coverage !== 'bounded') continue;
    const targets = workspaceTargets.filter((item) => String(item.workspaceId || '') === String(materialization.id || ''));
    if (targets.length !== 1) throw new Error(`portable.handoff-manufacture.workspace-scope.target-${targets.length ? 'ambiguous' : 'required'}:${materialization.id}`);
    workspaceMaterializations[index] = projectBoundedWorkspaceMaterialization(materialization, scope, targets[0].path);
  }
  const hasReconciliationProof = Boolean(input.reconciliationProof && typeof input.reconciliationProof === 'object' && Object.keys(input.reconciliationProof).length);
  const reconciliationProofQualification = qualifyPortableSourceReconciliationProofForManufacture({
    proof: input.reconciliationProof || null,
    requireProof: input.requireReconciliationProof === true,
    workspaceMaterializations,
    requiredWorkspaceIds: hasReconciliationProof || input.requireReconciliationProof === true ? [workspaceId] : []
  });

  const routeSpecs = transportRoutes.length ? transportRoutes : Object.freeze([{ workspaceId, path: handoffPath }]);
  let requirements = await projectManufacturingRequirements({ handoff, workspaceId, handoffPath, routeSpecs, workspaceRuntimeById });
  const packageParentMaterialClosurePreflight = projectPackageParentMaterialClosurePreflight(requirements, packageParentExactMaterialProvider);
  let materials = await resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, input.materialBindings || {});
  materials = appendMissingRequirementMaterials(materials, resolvePackageParentRequirementMaterials(requirements, packageParentExactMaterialProvider));
  const dependencyClosure = await expandPointerDependencyClosure({ requirements, materials, workspaceRuntimeById, bindings: input.materialBindings || {} });
  requirements = dependencyClosure.requirements;
  materials = appendMissingRequirementMaterials(dependencyClosure.materials, resolvePackageParentRequirementMaterials(requirements, packageParentExactMaterialProvider));
  const routeParentBoundaryClosure = expandRouteParentBoundaryClosure({ requirements, materials, workspaceMaterializations, workspaceRuntimeById, routeSpecs, exactMaterialProvider: packageParentExactMaterialProvider });
  requirements = routeParentBoundaryClosure.requirements;
  materials = appendMissingRequirementMaterials(routeParentBoundaryClosure.materials, resolvePackageParentRequirementMaterials(requirements, packageParentExactMaterialProvider));
  const parentBoundaryClosure = expandBoundedParentBoundaryClosure({ requirements, materials, workspaceMaterializations, workspaceRuntimeById });
  requirements = parentBoundaryClosure.requirements;
  materials = appendMissingRequirementMaterials(parentBoundaryClosure.materials, resolvePackageParentRequirementMaterials(requirements, packageParentExactMaterialProvider));
  const toolingBootstrapResult = await toolingBootstrapPromise;
  if (toolingBootstrapResult.error) throw toolingBootstrapResult.error;
  const toolingBootstrap = toolingBootstrapResult.value;
  const runtimeSourceAlignment = await qualifyToolingRuntimeSourceAlignment({
    runtimeIdentity: toolingBootstrap.runtimeIdentity,
    localWorkspaces: [
      Object.freeze({ id: workspaceId, root: workspaceRoot, materialization: primaryMaterialization }),
      ...additionalEnumerations.map(({ id, root, enumerated }) => Object.freeze({ id, root, materialization: enumerated.materialization }))
    ],
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  });
  const orientationBootstrap = input.transportBootstrapContent
    ? Object.freeze({ present: true, path: String(input.transportBootstrapPath || 'tiinex.package/bootstrap.md'), content: String(input.transportBootstrapContent), mediaType: 'text/markdown' })
    : Object.freeze({ present: false });

  return Object.freeze({
    handoff,
    requirements,
    workspace: Object.freeze({ id: workspaceId, name: workspaceTitle, title: workspaceTitle, records: Object.freeze([]), assets: Object.freeze([]) }),
    workspaceMaterializations: Object.freeze(workspaceMaterializations),
    materials: Object.freeze(materials),
    recipient: Object.freeze({ referenceTargets: Object.freeze([...(input.referenceTargets || [])].map(String)) }),
    bootstrap: orientationBootstrap,
    additionalTransportFiles: toolingBootstrap.files,
    transportRoutes,
    workspaceTargets,
    carrierLineage: normalizeHandoffCarrierLineage(input.carrierLineage || null),
    carrierAllocation: input.carrierAllocation ? Object.freeze({ ...input.carrierAllocation }) : null,
    carrierProfile: normalizeHandoffCarrierProfile(input.carrierProfile || null),
    toolingBootstrap: toolingBootstrap.summary,
    reconciliationProofQualification,
    schemaReferencePreflight,
    returnCarrierReservationPreflight,
    manufacturingEvidence: Object.freeze({
      enumeration: enumeration.evidence,
      workspaceEnumerations: Object.freeze(workspaceEnumerations),
      toolingBootstrap: toolingBootstrap.summary,
      runtimeSourceAlignment,
      reconciliationProof: reconciliationProofQualification,
      schemaReferencePreflight,
      returnCarrierReservationPreflight,
      carrierAllocation: input.carrierAllocation ? Object.freeze({ ...input.carrierAllocation }) : null,
      packageParentWorkspaceReuse: Object.freeze({
        state: String(packageParentReuse.state || ''),
        providerState: String(packageParentReuse.providerState || ''),
        inspectionStatus: String(packageParentReuse.inspectionStatus || ''),
        selectionMode: String(packageParentReuse.selectionMode || ''),
        requestedWorkspaceIds: Object.freeze([...(packageParentReuse.requestedWorkspaceIds || [])].map(String)),
        providerWorkspaceIds: Object.freeze([...(packageParentReuse.providerWorkspaceIds || [])].map(String)),
        providerWorkspaceTargets: Object.freeze([...(packageParentReuse.providerWorkspaceTargets || [])].map((item) => Object.freeze({ ...item }))),
        inheritedWorkspaceIds: Object.freeze((packageParentReuse.inherited || []).map((item) => String(item.id || ''))),
        workspaceAliases: Object.freeze([...(packageParentReuse.workspaceAliases || [])].map((item) => Object.freeze({ ...item }))),
        boundary: String(packageParentReuse.boundary || '')
      }),
      packageParentMaterialClosurePreflight,
      requiredContextWorkspaceSelectionPreflight,
      carrierProjection: Object.freeze({ requestedRoutes: transportRoutes.length || 1, carrierLineage: normalizeHandoffCarrierLineage(input.carrierLineage || null), carrierProfile: normalizeHandoffCarrierProfile(input.carrierProfile || null), boundary: 'Routes are qualified later against packaged workspace bytes; adapter text is not authority.' })
    }),
    verifyRoundtrip: input.verifyRoundtrip !== false
  });
}


function appendMissingRequirementMaterials(existing = [], additional = []) {
  const out = [...(existing || [])];
  const alreadyBound = new Set(out.map((item) => String(item.requirementId || '')).filter(Boolean));
  for (const item of additional || []) {
    const id = String(item.requirementId || '');
    if (id && alreadyBound.has(id)) continue;
    out.push(item);
    if (id) alreadyBound.add(id);
  }
  return Object.freeze(out);
}


function mergeWorkspaceTargetBindings(explicit = [], inherited = []) {
  const out = [];
  const seen = new Set();
  for (const item of [...explicit, ...inherited]) {
    const workspaceId = String(item?.workspaceId || '').trim();
    const targetPath = String(item?.path || '').trim();
    if (!workspaceId || !targetPath) continue;
    const key = `${workspaceId}\u0000${targetPath}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(Object.freeze({ ...item, workspaceId, path: targetPath }));
  }
  return Object.freeze(out);
}
