import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../node/handoff.manufacture.js';
import { prepareNodeWorkspaceCarrierManufacturingInput } from '../node/workspaceCarrier.manufacture.js';
import { prepareNodeBootstrapCarrierManufacturingInput } from '../node/bootstrapCarrier.manufacture.js';
import { projectHandoffHumanOutput, projectWorkspaceCarrierHumanOutput, projectBootstrapCarrierHumanOutput } from '../../handoff/carrierProjection.js';
import { writePortableRuntimePackageZip } from '../../output/node.zip.js';
import { handoffPackageV1ZipBytes } from '../../handoff/handoffPackageV1.zip.js';
import { inspectHandoffPackageV1 } from '../../handoff/handoffPackageV1.inspect.js';
import { allocateHandoffCarrierMajor, carrierLineageFromCliParent, initialHandoffCarrierLineage, normalizeHandoffCarrierLineage, normalizeHandoffCarrierPrefix, parentHandoffCarrierLineageFromBundle, parentHandoffCarrierProfileFromBundle } from '../../handoff/carrierLineage.js';
import { projectHandoffCarrierMajorAllocation } from '../../handoff/carrierMajorAllocation.js';
import { loadNodePortableInput } from '../../input/node.input.js';
import { resolveHandoffSiblingAllocation } from './cli.handoff-sibling-allocation.js';
import { normalizeHandoffCarrierProfile } from '../../handoff/carrierProfile.js';


const LEGACY_CARRIER_PARENT_TOPOLOGY_CODES = new Set([
  'portable.handoff-package-v1.root.package-namespace-invalid',
  'portable.handoff-package-v1.start.package-namespace-invalid',
  'portable.handoff-package-v1.bootstrap.package-namespace-invalid',
  'portable.handoff-package-v1.artifact.package-namespace-leak',
  'portable.handoff-package-v1.root.dimension-invalid',
  'portable.handoff-package-v1.start.dimension-invalid',
  'portable.handoff-package-v1.bootstrap.dimension-invalid',
  'portable.handoff-package-v1.workspace.sibling-dimension-invalid',
  'portable.handoff-package-v1.workspace.archive-coordinate-mismatch',
  'portable.handoff-package-v1.route.workspace-ancestor-mismatch'
]);

export function qualifyLegacyCarrierContinuationParent(inspection = {}) {
  if (String(inspection.status || '') === 'valid') return Object.freeze({ state: 'not-applicable', allocationInspection: inspection });
  const errors = [...(inspection.findings || [])].filter((finding) => String(finding.severity || '').toLowerCase() === 'error');
  if (!errors.length || errors.some((finding) => !LEGACY_CARRIER_PARENT_TOPOLOGY_CODES.has(String(finding.code || '')))) {
    return Object.freeze({ state: 'unqualified', allocationInspection: null });
  }
  const lineage = inspection.carrierProjection?.lineage || inspection.rootArtifact?.carrierLineage || null;
  const dimension = String(lineage?.dimension || '').trim();
  if (!/^\d{3}(?:-\d+)*$/.test(dimension)) return Object.freeze({ state: 'unqualified', allocationInspection: null });
  if (!(inspection.routes || []).every((route) => String(route.state || 'qualified') === 'qualified')) return Object.freeze({ state: 'unqualified', allocationInspection: null });
  return Object.freeze({
    state: 'qualified',
    allocationInspection: Object.freeze({ ...inspection, status: 'ready', qualification: 'legacy-carrier-continuation-only' }),
    boundary: 'Compatibility qualification for carrier-lineage continuation only. A pre-correction Package V1 may contribute its exact declared carrier lineage and qualified route order when every blocking finding is one of the known package-local namespace/workspace-topology defects corrected by current Core. The legacy package remains invalid as a Package V1 source and is never reused for Workspace or material authority through this qualification.'
  });
}

export async function prepareHandoffManufactureCliCommand(parsed = {}, runtime = {}) {
  const flags = parsed.flags || {};
  const workspaceRoot = flags.workspace || parsed.positionals?.[0] || '.';
  const carrierMode = String(flags['carrier-mode'] || 'handoff').trim().toLowerCase();
  if (!['handoff', 'workspace', 'bootstrap'].includes(carrierMode)) throw new Error(`portable.cli.handoff-carrier.carrier-mode.invalid:${carrierMode}`);
  if (carrierMode === 'workspace') return prepareWorkspaceCarrierCliCommand(flags, workspaceRoot, runtime);
  if (carrierMode === 'bootstrap') return prepareBootstrapCarrierCliCommand(flags, runtime);
  if (flags['package-major'] && flags['package-consolidation']) throw new Error('portable.cli.handoff-carrier.package-major-consolidation-conflict');
  const continuationState = parsed.surfaceCommand === 'handoff'
    ? await readGroundContinuationState(workspaceRoot)
    : {};
  const explicitPackageParentPath = String(flags['package-parent'] || '').trim();
  const continuationPackageParentPath = String(continuationState.packageParentPath || '').trim();
  const continuationPackageParentInferred = parsed.surfaceCommand === 'handoff' && !explicitPackageParentPath && Boolean(continuationPackageParentPath);
  const handoffPath = flags.handoff || parsed.positionals?.[1] || continuationState.returnHandoffPath || '';
  if (!flags['workspace-id'] && continuationState.workspaceId) flags['workspace-id'] = continuationState.workspaceId;
  if (!flags['workspace-target'] && continuationState.workspaceTarget) flags['workspace-target'] = continuationState.workspaceTarget;
  if (!flags['package-parent'] && continuationState.packageParentPath) flags['package-parent'] = continuationState.packageParentPath;
  if (!flags.route && handoffPath) flags.route = handoffPath;
  if (!flags.output && !flags['output-dir'] && parsed.surfaceCommand === 'handoff' && continuationState.returnOutputDir) flags['output-dir'] = continuationState.returnOutputDir;
  const materialBindings = await readOptionalJson(flags['material-bindings'] || flags.materials);
  const schemaReferenceResolutionValue = await readOptionalJson(flags['reference-resolutions']);
  const schemaReferenceResolutions = schemaReferenceResolutionValue.referenceResolutions || (Array.isArray(schemaReferenceResolutionValue) ? schemaReferenceResolutionValue : []);
  const reconciliationProof = await readOptionalJson(flags['reconciliation-proof']);
  const requireReconciliationProof = Boolean(flags['require-reconciliation-proof']);
  const packageParentWorkspaceIds = splitFlag(flags['package-parent-workspaces']);
  if (!packageParentWorkspaceIds.length && flags['package-major'] && String(flags['package-parent'] || '').trim()) packageParentWorkspaceIds.push('all');
  const packageParentWorkspaceAliases = await readOptionalJson(flags['package-parent-workspace-aliases']);
  const operatorCarrierProfile = await readOptionalJson(flags['carrier-profile']);
  const carrierExistingNamesValue = await readOptionalJson(flags['carrier-existing-filenames'] || flags['carrier-existing']);
  const carrierExistingFilenames = carrierExistingNamesValue.existingFilenames || carrierExistingNamesValue.names || (Array.isArray(carrierExistingNamesValue) ? carrierExistingNamesValue : []);
  const expectedToolingBootstrap = await readOptionalJson(flags['tooling-bootstrap-manifest']);
  const workspaceDescriptorValue = await readOptionalJson(flags['workspace-roots'] || flags['workspace-descriptors']);
  const workspaceTargetValue = await readOptionalJson(flags['workspace-targets']);
  const workspaceScopeValue = await readOptionalJson(flags['workspace-scopes']);
  const routeDescriptorValue = await readOptionalJson(flags['workspace-routes'] || flags['handoff-route-descriptors']);
  const additionalWorkspaces = [
    ...splitFlag(flags['additional-workspaces']),
    ...descriptorArray(workspaceDescriptorValue, 'workspaces')
  ];
  const handoffRoutes = [
    ...splitFlag(flags['handoff-routes'] || flags.routes),
    ...descriptorArray(routeDescriptorValue, 'routes')
  ];
  const verifyRoundtrip = !flags['no-roundtrip'];
  const parentPackagePath = String(flags['package-parent'] || '').trim();
  let packageParentBundle = null;
  let packageParentSha256 = '';
  const requestedCarrierPrefix = normalizeHandoffCarrierPrefix(flags['carrier-prefix'] || '');
  let carrierLineage = initialHandoffCarrierLineage(requestedCarrierPrefix);
  let inheritedCarrierProfile = normalizeHandoffCarrierProfile(null);
  let carrierAllocation = Object.freeze({ state: 'root', allocationMode: 'initial-root', siblingIndex: null, provenance: Object.freeze({ basis: 'initial-carrier-root' }) });
  if (parentPackagePath) {
    const resolvedParent = path.resolve(parentPackagePath);
    let parentBytes;
    try { parentBytes = new Uint8Array(await readFile(resolvedParent)); }
    catch (error) {
      if (continuationPackageParentInferred) throw new Error(`portable.cli.handoff-carrier.received-package-parent.unavailable: ${resolvedParent}. Restore the exact received Handoff Package V1 used by ground --continue and rerun handoff; Tooling will not emit a partial return without it.`);
      throw error;
    }
    const parentBundle = await loadNodePortableInput([resolvedParent], { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] });
    const parentInspection = inspectHandoffPackageV1(parentBundle);
    const legacyCarrierParent = qualifyLegacyCarrierContinuationParent(parentInspection);
    if (parentInspection.status !== 'valid' && legacyCarrierParent.state !== 'qualified') throw new Error('portable.cli.handoff-carrier.package-parent.invalid');
    const carrierParentInspection = parentInspection.status === 'valid' ? parentInspection : legacyCarrierParent.allocationInspection;
    packageParentBundle = parentBundle;
    inheritedCarrierProfile = parentHandoffCarrierProfileFromBundle(parentBundle);
    const parentLineage = carrierParentInspection.carrierProjection?.lineage || carrierParentInspection.rootArtifact?.carrierLineage || null;
    const provisionalLineage = carrierLineageFromCliParent({
      bundle: parentBundle,
      parentPath: resolvedParent,
      parentBytes,
      qualifiedParentLineage: parentLineage,
      major: Boolean(flags['package-major']),
      majorReason: flags['major-reason'] || ''
    });
    const expectedContinuationParentSha256 = continuationPackageParentInferred ? String(continuationState.packageParentSha256 || '').trim().toLowerCase() : '';
    if (expectedContinuationParentSha256 && provisionalLineage.parentPackageSha256 !== expectedContinuationParentSha256) {
      throw new Error(`portable.cli.handoff-carrier.received-package-parent.identity-mismatch: expected ${expectedContinuationParentSha256} at ${resolvedParent}, observed ${provisionalLineage.parentPackageSha256}. Restore the exact received package used by ground --continue; Tooling will not substitute a different carrier by path.`);
    }
    if (flags['package-major']) {
      const allocation = projectHandoffCarrierMajorAllocation({
        prefix: requestedCarrierPrefix || provisionalLineage.prefix,
        parentFilename: resolvedParent,
        existingFilenames: carrierExistingFilenames
      });
      if (allocation.state !== 'ready') throw new Error(`portable.cli.handoff-carrier.package-major.allocation-blocked:${allocation.reasonCode || allocation.state}`);
      carrierLineage = allocateHandoffCarrierMajor(requestedCarrierPrefix || provisionalLineage.prefix, allocation.nextMajorDimension, flags['major-reason'] || '', {
        dimension: provisionalLineage.parentDimension,
        packageSha256: provisionalLineage.parentPackageSha256,
        packageFilename: path.basename(resolvedParent)
      });
      carrierAllocation = Object.freeze({
        state: 'qualified', allocationMode: 'monotonic-prefix-major-with-parent', siblingIndex: null, childDimension: carrierLineage.dimension,
        provenance: Object.freeze({ basis: 'highest-observed-prefix-major-plus-one', parentPackagePath: resolvedParent, parentPackageSha256: provisionalLineage.parentPackageSha256, parentDimension: provisionalLineage.parentDimension, highestObservedMajor: allocation.highestObservedMajor, observedCount: allocation.observed.length }),
        boundary: allocation.boundary
      });
    } else {
      const siblingAllocation = await resolveHandoffSiblingAllocation({
        parentInspection: carrierParentInspection,
        parentPackagePath: resolvedParent,
        parentPackageSha256: provisionalLineage.parentPackageSha256,
        parentDimension: provisionalLineage.parentDimension,
        selectedRoutePointer: continuationState.selectedRoutePointer || flags['package-parent-route-pointer'] || '',
        selectedRouteId: continuationState.selectedRouteId || flags['package-parent-route-id'] || '',
        explicitSiblingIndex: flags['package-sibling-index'],
        consolidation: Boolean(flags['package-consolidation']),
        enabled: Boolean(flags.output || flags['output-dir'])
      });
      carrierAllocation = siblingAllocation;
      carrierLineage = carrierLineageFromCliParent({
        bundle: parentBundle,
        parentPath: resolvedParent,
        parentBytes,
        qualifiedParentLineage: parentLineage,
        siblingIndex: siblingAllocation.siblingIndex
      });
    }
    packageParentSha256 = String(carrierLineage.parentPackageSha256 || '');
    const inheritedPrefix = normalizeHandoffCarrierPrefix(carrierLineage.prefix || '');
    if (inheritedPrefix && requestedCarrierPrefix && inheritedPrefix !== requestedCarrierPrefix) throw new Error('portable.cli.handoff-carrier.carrier-prefix.parent-conflict');
    if (!inheritedPrefix && requestedCarrierPrefix) carrierLineage = normalizeHandoffCarrierLineage({ ...carrierLineage, prefix: requestedCarrierPrefix });
  }
  if (!parentPackagePath && flags['package-major']) {
    if (!requestedCarrierPrefix) throw new Error('portable.cli.handoff-carrier.package-major.prefix-required');
    const allocation = projectHandoffCarrierMajorAllocation({ prefix: requestedCarrierPrefix, existingFilenames: carrierExistingFilenames });
    if (allocation.state !== 'ready') throw new Error(`portable.cli.handoff-carrier.package-major.allocation-blocked:${allocation.reasonCode || allocation.state}`);
    carrierLineage = allocateHandoffCarrierMajor(requestedCarrierPrefix, allocation.nextMajorDimension, flags['major-reason'] || '');
    carrierAllocation = Object.freeze({
      state: 'qualified',
      allocationMode: 'monotonic-prefix-major',
      siblingIndex: null,
      childDimension: carrierLineage.dimension,
      provenance: Object.freeze({ basis: 'highest-observed-prefix-major-plus-one', prefix: requestedCarrierPrefix, highestObservedMajor: allocation.highestObservedMajor, observedCount: allocation.observed.length, parentPackagePath: '' }),
      boundary: allocation.boundary
    });
  }
  if (!parentPackagePath && flags['package-consolidation']) throw new Error('portable.cli.handoff-carrier.package-consolidation.parent-required');
  const carrierProfile = selectCarrierProfile({
    operator: operatorCarrierProfile,
    inherited: inheritedCarrierProfile,
    runtime: runtime.defaultCarrierProfile || null
  });
  const explicitContentRoots = splitFlag(flags['content-sources'] || flags['content-roots']);
  const discoverInstalledContentSources = await hasPackageJson(workspaceRoot);
  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    handoffPath,
    handoffRoutes,
    additionalWorkspaces,
    workspaceId: flags['workspace-id'] || '',
    workspaceTitle: flags['workspace-title'] || flags.title || '',
    workspaceTargetPath: flags['workspace-target'] || flags['workspace-artifact'] || '',
    workspaceTargets: workspaceTargetValue,
    workspaceScopes: descriptorArray(workspaceScopeValue, 'scopes').length ? descriptorArray(workspaceScopeValue, 'scopes') : workspaceScopeValue,
    contentSources: [...(runtime.contentSources || []), ...explicitContentRoots],
    compositionRoot: discoverInstalledContentSources ? path.resolve(workspaceRoot) : '',
    discoverInstalledContentSources,
    toolingBootstrap: flags['tooling-bootstrap'] || 'embedded',
    expectedToolingBootstrap,
    materialBindings,
    schemaReferenceResolutions,
    referenceTargets: splitFlag(flags['reference-targets']),
    maxFiles: flags['max-files'],
    bootstrapMaxFiles: flags['bootstrap-max-files'],
    verifyRoundtrip,
    // `--route` selects the recipient-facing human/transport projection. When the host
    // supplies an explicit shared route set, manufacture must carry that whole qualified
    // set; otherwise the presentation selector would silently collapse Pack multi.
    recipientRouteSelector: recipientRouteSelectorForManufacture(flags.route || '', handoffRoutes),
    carrierLineage,
    carrierAllocation,
    carrierProfile,
    packageParentBundle,
    packageParentPath: parentPackagePath ? path.resolve(parentPackagePath) : '',
    packageParentSha256,
    packageParentRoutePointer: continuationState.selectedRoutePointer || flags['package-parent-route-pointer'] || '',
    packageParentRouteId: continuationState.selectedRouteId || flags['package-parent-route-id'] || '',
    packageParentWorkspaceIds,
    packageParentWorkspaceAliases,
    reconciliationProof,
    requireReconciliationProof,
    returnPackageSiblingIndex: flags['return-package-sibling-index'],
    returnPackageMajor: Boolean(flags['return-package-major'])
  }, runtime);
  return {
    input,
    options: {
      verifyRoundtrip,
      packageInput: { builtAt: flags['built-at'] || undefined }
    }
  };
}


export function recipientRouteSelectorForManufacture(route = '', handoffRoutes = []) {
  return Array.isArray(handoffRoutes) && handoffRoutes.length > 1 ? '' : String(route || '').trim();
}

export async function materializeHandoffManufactureCliOutput(result = {}, flags = {}) {
  const carrierMode = String(result.carrierProjection?.mode || '');
  const workspaceMode = carrierMode === 'workspace';
  const bootstrapMode = carrierMode === 'bootstrap';
  const projectedFilename = flags['projected-filename'] || flags.projectedFilename || result?.input?.projectedFilename || '';
  let humanOutput = workspaceMode ? projectWorkspaceCarrierHumanOutput({ projection: result.carrierProjection || {}, filename: projectedFilename, collisionInstance: flags['collision-instance'] || 1 }) : bootstrapMode ? projectBootstrapCarrierHumanOutput({ projection: result.carrierProjection || {}, filename: projectedFilename }) : projectHandoffHumanOutput({
    projection: result.carrierProjection || {},
    route: flags.route || '',
    filename: projectedFilename,
    collisionInstance: flags['collision-instance'] || 1,
    carrierPrefix: flags['carrier-prefix'] || ''
  });
  const wantsWrite = Boolean(flags.output || flags['output-dir']);
  const blocked = result.status === 'blocked' || result.transportExecutable === false || Number(result.findingSummary?.counts?.error || 0) > 0;
  if (!wantsWrite || blocked) return summarizeHandoffManufactureCliOutput(result, {}, humanOutput, null);
  const shared = result.carrierProjection?.mode === 'shared';
  if (wantsWrite && humanOutput.status !== 'ready') {
    if (humanOutput.status === 'selection-required') throw new Error('portable.cli.handoff-carrier.route-selection.required');
    if (humanOutput.status === 'prefix-required') throw new Error('portable.cli.handoff-carrier.carrier-prefix.required');
    if (humanOutput.status === 'prefix-conflict') throw new Error('portable.cli.handoff-carrier.carrier-prefix.conflict');
    if (humanOutput.status === 'route-parties-required') throw new Error('portable.cli.handoff-carrier.route-parties.required');
    throw new Error('portable.cli.handoff-carrier.output.blocked');
  }
  const target = resolveHandoffOutputPath(flags, humanOutput.primary.filename);
  const writeBundle = result.bundle;
  let writeReceipt;
  if (String(writeBundle?.transportFormat || '') === 'tiinex-handoff-package-v1') {
    const bytes = handoffPackageV1ZipBytes(writeBundle);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    writeReceipt = Object.freeze({
      schema: 'tiinex.portable.handoff-package-v1.zip-write.v1',
      status: 'written',
      path: target,
      bytes: bytes.byteLength,
      boundary: Object.freeze({ localFilesystemWrite: true, remoteWrite: false, sourceMutation: false })
    });
  } else {
    writeReceipt = await writePortableRuntimePackageZip(writeBundle, target);
  }
  const transportTextTarget = normalizeTransportTextFlag(flags['transport-text']);
  const transportTextReceipt = transportTextTarget ? await writeTransportTextSidecar(humanOutput, target, transportTextTarget) : null;
  return summarizeHandoffManufactureCliOutput(result, writeReceipt, humanOutput, transportTextReceipt);
}

async function prepareWorkspaceCarrierCliCommand(flags = {}, workspaceRoot = '.', runtime = {}) {
  if (flags.handoff || flags.route || flags.routes || flags['handoff-routes'] || flags['workspace-routes']) throw new Error('portable.cli.workspace-carrier.handoff-route.forbidden');
  const operatorCarrierProfile = await readOptionalJson(flags['carrier-profile']);
  const carrierExistingNamesValue = await readOptionalJson(flags['carrier-existing-filenames'] || flags['carrier-existing']);
  const carrierExistingFilenames = carrierExistingNamesValue.existingFilenames || carrierExistingNamesValue.names || (Array.isArray(carrierExistingNamesValue) ? carrierExistingNamesValue : []);
  const expectedToolingBootstrap = await readOptionalJson(flags['tooling-bootstrap-manifest']);
  const workspaceDescriptorValue = await readOptionalJson(flags['workspace-roots'] || flags['workspace-descriptors']);
  const workspaceTargetValue = await readOptionalJson(flags['workspace-targets']);
  const workspaceScopeValue = await readOptionalJson(flags['workspace-scopes']);
  const additionalWorkspaces = [...splitFlag(flags['additional-workspaces']), ...descriptorArray(workspaceDescriptorValue, 'workspaces')];
  const verifyRoundtrip = !flags['no-roundtrip'];
  const parentPackagePath = String(flags['package-parent'] || '').trim();
  const explicitNewRoot = flags['new-root'] === true;
  const explicitMajor = flags['package-major'] === true;
  if (parentPackagePath && explicitNewRoot) throw new Error('portable.cli.workspace-carrier.root-parent.conflict');
  if (explicitMajor && explicitNewRoot) throw new Error('portable.cli.workspace-carrier.major-root.conflict');
  if (!parentPackagePath && !explicitNewRoot && !explicitMajor) throw new Error('portable.cli.workspace-carrier.root-intent.required');
  let carrierLineage = Object.freeze({ ...initialHandoffCarrierLineage(flags['carrier-prefix'] || ''), checkpointKind: 'progression', majorReason: '' });
  let inheritedCarrierProfile = normalizeHandoffCarrierProfile(null);
  let carrierAllocation = Object.freeze({ state: explicitMajor ? 'unresolved' : explicitNewRoot ? 'root' : 'qualified', allocationMode: explicitMajor ? 'pending-prefix-major' : explicitNewRoot ? 'initial-root' : 'parent-continuation', siblingIndex: null, provenance: Object.freeze({ basis: explicitMajor ? 'pending-prefix-major' : explicitNewRoot ? 'initial-carrier-root' : 'explicit-carrier-parent' }) });
  if (parentPackagePath) {
    const resolvedParent = path.resolve(parentPackagePath);
    const parentBytes = new Uint8Array(await readFile(resolvedParent));
    const parentBundle = await loadNodePortableInput([resolvedParent], { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] });
    inheritedCarrierProfile = parentHandoffCarrierProfileFromBundle(parentBundle);
    const parentLineage = parentHandoffCarrierLineageFromBundle(parentBundle, { packageSha256: '', packageFilename: path.basename(resolvedParent) });
    if (explicitMajor) {
      const requestedPrefix = normalizeHandoffCarrierPrefix(flags['carrier-prefix'] || parentLineage.prefix || '');
      if (!requestedPrefix) throw new Error('portable.cli.workspace-carrier.package-major.prefix-required');
      if (parentLineage.prefix && requestedPrefix !== parentLineage.prefix) throw new Error('portable.cli.workspace-carrier.carrier-prefix.parent-conflict');
      const allocation = projectHandoffCarrierMajorAllocation({
        prefix: requestedPrefix,
        parentFilename: resolvedParent,
        existingFilenames: carrierExistingFilenames
      });
      if (allocation.state !== 'ready') throw new Error(`portable.cli.workspace-carrier.package-major.allocation-blocked:${allocation.reasonCode || allocation.state}`);
      carrierLineage = allocateHandoffCarrierMajor(requestedPrefix, allocation.nextMajorDimension, flags['major-reason'] || '', {
        dimension: parentLineage.dimension,
        packageSha256: parentLineage.packageSha256 || '',
        packageFilename: path.basename(resolvedParent)
      });
      carrierAllocation = Object.freeze({
        state: 'qualified',
        allocationMode: 'monotonic-prefix-major-with-parent',
        siblingIndex: null,
        childDimension: carrierLineage.dimension,
        provenance: Object.freeze({ basis: 'highest-observed-prefix-major-plus-one', prefix: requestedPrefix, highestObservedMajor: allocation.highestObservedMajor, observedCount: allocation.observed.length, parentPackagePath: resolvedParent, parentDimension: parentLineage.dimension }),
        boundary: allocation.boundary
      });
    } else {
      carrierLineage = carrierLineageFromCliParent({
        bundle: parentBundle,
        parentPath: resolvedParent,
        parentBytes,
        qualifiedParentLineage: parentLineage,
        major: false,
        siblingIndex: 1
      });
    }
  } else if (explicitMajor) {
    const requestedPrefix = normalizeHandoffCarrierPrefix(flags['carrier-prefix'] || '');
    if (!requestedPrefix) throw new Error('portable.cli.workspace-carrier.package-major.prefix-required');
    const allocation = projectHandoffCarrierMajorAllocation({ prefix: requestedPrefix, existingFilenames: carrierExistingFilenames });
    if (allocation.state !== 'ready') throw new Error(`portable.cli.workspace-carrier.package-major.allocation-blocked:${allocation.reasonCode || allocation.state}`);
    carrierLineage = allocateHandoffCarrierMajor(requestedPrefix, allocation.nextMajorDimension, flags['major-reason'] || '');
    carrierAllocation = Object.freeze({
      state: 'qualified',
      allocationMode: 'monotonic-prefix-major',
      siblingIndex: null,
      childDimension: carrierLineage.dimension,
      provenance: Object.freeze({ basis: 'highest-observed-prefix-major-plus-one', prefix: requestedPrefix, highestObservedMajor: allocation.highestObservedMajor, observedCount: allocation.observed.length, parentPackagePath: '' }),
      boundary: allocation.boundary
    });
  }
  const carrierProfile = selectCarrierProfile({ operator: operatorCarrierProfile, inherited: inheritedCarrierProfile, runtime: runtime.defaultCarrierProfile || null });
  const projectedFilename = String(flags['projected-filename'] || flags.projectedFilename || '').trim();
  const input = await prepareNodeWorkspaceCarrierManufacturingInput({
    workspaceRoot,
    additionalWorkspaces,
    workspaceId: flags['workspace-id'] || '',
    workspaceTitle: flags['workspace-title'] || flags.title || '',
    workspaceTargetPath: flags['workspace-target'] || flags['workspace-artifact'] || '',
    workspaceTargets: workspaceTargetValue,
    workspaceScopes: descriptorArray(workspaceScopeValue, 'scopes').length ? descriptorArray(workspaceScopeValue, 'scopes') : workspaceScopeValue,
    materialRepresentationWorkspaceIds: splitFlag(flags['material-representation-workspaces'] || flags['generic-material-workspaces']),
    toolingBootstrap: flags['tooling-bootstrap'] || 'embedded',
    expectedToolingBootstrap,
    maxFiles: flags['max-files'],
    bootstrapMaxFiles: flags['bootstrap-max-files'],
    verifyRoundtrip,
    createdAt: flags['built-at'] || undefined,
    projectedFilename,
    carrierLineage,
    carrierAllocation,
    carrierProfile
  }, runtime);
  return { input, options: { verifyRoundtrip, packageInput: { builtAt: flags['built-at'] || undefined } } };
}

async function prepareBootstrapCarrierCliCommand(flags = {}, runtime = {}) {
  if (flags.handoff || flags.route || flags.routes || flags['handoff-routes'] || flags['workspace-routes'] || flags.workspace || flags['workspace-target'] || flags['workspace-targets'] || flags['workspace-roots'] || flags['workspace-descriptors']) throw new Error('portable.cli.bootstrap-carrier.source-material-or-route.forbidden');
  const operatorCarrierProfile = await readOptionalJson(flags['carrier-profile']);
  const expectedToolingBootstrap = await readOptionalJson(flags['tooling-bootstrap-manifest']);
  const verifyRoundtrip = !flags['no-roundtrip'];
  const carrierProfile = selectCarrierProfile({ operator: operatorCarrierProfile, runtime: runtime.defaultCarrierProfile || null });
  const input = await prepareNodeBootstrapCarrierManufacturingInput({
    toolingBootstrap: flags['tooling-bootstrap'] || 'embedded', expectedToolingBootstrap, bootstrapMaxFiles: flags['bootstrap-max-files'], verifyRoundtrip, createdAt: flags['built-at'] || undefined,
    carrierLineage: Object.freeze({ ...initialHandoffCarrierLineage(), checkpointKind: 'progression', majorReason: '' }), carrierProfile
  }, runtime);
  return { input, options: { verifyRoundtrip, packageInput: { builtAt: flags['built-at'] || undefined } } };
}

export function summarizeHandoffManufactureCliOutput(result = {}, writeReceipt = {}, humanOutput = null, transportTextReceipt = null) {
  const summarizeRequirement = (item = {}) => Object.freeze({
    requirementId: String(item.requirementId || ''),
    classification: String(item.classification || ''),
    disposition: String(item.disposition || ''),
    referenceTarget: String(item.referenceTarget || ''),
    selectedPath: String(item.selectedMaterial?.path || ''),
    selectedSha256: String(item.selectedMaterial?.sha256 || ''),
    providerId: String(item.selectedMaterial?.provider?.id || '')
  });
  const summarizeWorkspace = (item = {}) => Object.freeze({
    id: String(item.id || ''),
    materialization: String(item.materialization || ''),
    qualification: String(item.qualification || ''),
    entryCount: Array.isArray(item.includedEntries) ? item.includedEntries.length : 0,
    completenessState: String(item.completenessEvidence?.state || ''),
    completenessProof: String(item.completenessEvidence?.proof || ''),
    scopeState: String(item.scopeEvidence?.state || ''),
    scopeProof: String(item.scopeEvidence?.proof || '')
  });
  const bootstrapInspection = result.toolingBootstrapInspection || {};
  const projection = result.carrierProjection || {};
  const routeSummary = Object.freeze((projection.routes || []).map((route) => Object.freeze({
    id: String(route.id || ''),
    state: String(route.state || ''),
    workspaceId: String(route.workspaceId || ''),
    workspaceRelativePath: String(route.workspaceRelativePath || ''),
    dimension: String(route.dimension || ''),
    from: String(route.parties?.from || ''),
    to: String(route.parties?.to || ''),
    projectedFilename: String(route.projectedFilename || '')
  })));
  return Object.freeze({
    schema: result.schema || 'tiinex.portable.operation.result.v1',
    operation: String(result.operation || 'manufacture-handoff-package'),
    resultSchema: String(result.resultSchema || ''),
    status: String(result.status || 'unknown'),
    executable: Boolean(result.executable),
    transportExecutable: Boolean(result.transportExecutable),
    verification: Object.freeze({ ...(result.verification || {}) }),
    planSummary: Object.freeze({
      status: String(result.plan?.status || 'unknown'),
      requiredClosureReady: Boolean(result.plan?.requiredClosureReady),
      semanticHandoffStatus: String(result.plan?.semanticHandoffStatus || 'unknown'),
      required: Object.freeze((result.plan?.requirements?.required || []).map(summarizeRequirement)),
      reference: Object.freeze((result.plan?.requirements?.reference || []).map(summarizeRequirement)),
      participantRoles: Object.freeze((result.plan?.requirements?.participantRoles || []).map((item = {}) => Object.freeze({
        requirementId: String(item.id || item.requirementId || ''),
        label: String(item.roleLabel || item.name || item.requirementName || ''),
        reference: String(item.materialReference || item.reference?.target || item.referenceTarget || ''),
        workspaceId: String(item.targetWorkspaceId || ''),
        path: String(item.targetPath || '')
      }))),
      semanticParticipantRoutes: Object.freeze((result.plan?.requirements?.semanticParticipantRoutes || []).map((route = {}) => Object.freeze({
        routeWorkspaceId: String(route.routeWorkspaceId || ''),
        routePath: String(route.routePath || ''),
        state: String(route.state || 'not-established'),
        currentTask: route.currentTask ? Object.freeze({ path: String(route.currentTask.path || ''), schemaId: String(route.currentTask.schemaId || '') }) : null,
        participants: Object.freeze((route.participantRoles || []).map((role = {}) => Object.freeze({
          label: String(role.label || ''),
          reference: String(role.reference || ''),
          workspaceId: String(role.workspaceId || ''),
          path: String(role.path || '')
        })))
      }))),
      workspaces: Object.freeze((result.plan?.workspaceMaterializations || []).map(summarizeWorkspace))
    }),
    carrierProjection: Object.freeze({
      status: String(projection.status || 'unknown'),
      mode: String(projection.mode || ''),
      lineage: projection.lineage ? Object.freeze({ ...projection.lineage }) : null,
      workspaces: Object.freeze((projection.workspaces || []).map((workspace) => Object.freeze({ ...workspace }))),
      workspace: Object.freeze({ ...(projection.workspace || {}) }),
      selection: Object.freeze({ ...(projection.selection || {}) }),
      routes: routeSummary
    }),
    humanOutput: humanOutput ? Object.freeze({
      status: humanOutput.status,
      primary: humanOutput.primary,
      normalInlineRouting: humanOutput.normalInlineRouting ? Object.freeze({ ...humanOutput.normalInlineRouting }) : null,
      sharedRouting: humanOutput.sharedRouting ? Object.freeze({ ...humanOutput.sharedRouting, routes: Object.freeze([...(humanOutput.sharedRouting.routes || [])].map((item) => Object.freeze({ ...item }))) }) : null,
      presentation: humanOutput.presentation ? Object.freeze({ ...humanOutput.presentation }) : null,
      normalEmissionBoundary: humanOutput.normalEmissionBoundary ? Object.freeze({ ...humanOutput.normalEmissionBoundary, allowed: Object.freeze([...(humanOutput.normalEmissionBoundary.allowed || [])]) }) : null,
      fallbackTransportText: humanOutput.fallbackTransportText ? Object.freeze({ ...humanOutput.fallbackTransportText, content: undefined }) : null
    }) : null,
    toolingBootstrap: result.toolingBootstrap || null,
    carrierLineage: result.carrierLineage || projection.lineage || null,
    carrierAllocation: result.carrierAllocation || result.manufacturingEvidence?.carrierAllocation || null,
    majorReadiness: result.majorReadiness || null,
    operationBoundary: result.operationBoundary ? Object.freeze({ ...result.operationBoundary }) : null,
    manufacturingEvidence: result.manufacturingEvidence || null,
    toolingBootstrapInspection: Object.freeze({
      schema: String(bootstrapInspection.schema || ''),
      status: String(bootstrapInspection.status || 'unknown'),
      delivery: String(bootstrapInspection.delivery || 'unknown'),
      counts: Object.freeze({ ...(bootstrapInspection.counts || {}) }),
      qualification: Object.freeze({ ...(bootstrapInspection.qualification || {}) })
    }),
    roundtripSummary: result.roundtrip ? Object.freeze({
      schema: String(result.roundtrip.schema || ''),
      status: String(result.roundtrip.status || 'unknown'),
      verification: Object.freeze({ ...(result.roundtrip.verification || {}) }),
      runtimeStatus: String(result.roundtrip.runtime?.status || '')
    }) : null,
    findings: Object.freeze((result.findings || []).map((finding) => Object.freeze({
      severity: String(finding.severity || ''),
      code: String(finding.code || ''),
      message: String(finding.message || '')
    }))),
    findingSummary: result.findingSummary || null,
    boundary: String(result.boundary || ''),
    writeReceipt: writeReceipt?.status ? writeReceipt : null,
    primaryOutput: writeReceipt?.status ? Object.freeze({ ...writeReceipt, projectedFilename: String(humanOutput?.primary?.filename || ''), selectedRoute: String(humanOutput?.primary?.workspaceRelativeHandoffPath || '') }) : null,
    transportTextSidecar: transportTextReceipt
  });
}


function resolveHandoffOutputPath(flags = {}, projectedFilename = '') {
  const filename = String(projectedFilename || '').trim();
  if (!filename) throw new Error('portable.cli.handoff-carrier.output-filename.unresolved');
  if (flags.output) {
    const requested = path.resolve(String(flags.output));
    if (path.basename(requested) !== filename) throw new Error('portable.cli.handoff-carrier.output-filename.mismatch');
    return requested;
  }
  if (!flags['output-dir']) throw new Error('portable.cli.handoff-carrier.output-dir.required');
  return path.resolve(String(flags['output-dir']), filename);
}
function normalizeTransportTextFlag(value) {
  if (value === true) return true;
  if (value === false || value === undefined || value === null) return false;
  const text = String(value).trim();
  if (!text || text.toLocaleLowerCase() === 'false') return false;
  if (text.toLocaleLowerCase() === 'true') return true;
  return text;
}
async function writeTransportTextSidecar(humanOutput, packageTarget, flagValue) {
  const target = flagValue === true
    ? defaultSidecarPath(packageTarget)
    : path.resolve(String(flagValue));
  await mkdir(path.dirname(target), { recursive: true });
  const content = String(humanOutput.fallbackTransportText?.content || '');
  await writeFile(target, content, 'utf8');
  return Object.freeze({ schema: 'tiinex.portable.handoff-transport-text-write.v1', status: 'written', path: target, bytes: Buffer.byteLength(content, 'utf8'), authority: 'none', normalEmission: false });
}
function defaultSidecarPath(packageTarget) {
  const suffix = '.handoff-package.zip';
  return packageTarget.toLowerCase().endsWith(suffix) ? `${packageTarget.slice(0, -suffix.length)}.transport.txt` : `${packageTarget}.transport.txt`;
}
async function readOptionalJson(file = '') { if (!file) return {}; return JSON.parse(await readFile(file, 'utf8')); }
function descriptorArray(value, key) { if (Array.isArray(value)) return value; if (Array.isArray(value?.[key])) return value[key]; return []; }
async function hasPackageJson(root = '.') {
  try { await access(path.join(path.resolve(String(root || '.')), 'package.json')); return true; }
  catch { return false; }
}

function splitFlag(value) { if (!value || value === true) return []; return String(value).split(',').map((item) => item.trim()).filter(Boolean); }


function selectCarrierProfile({ operator = null, inherited = null, runtime = null } = {}) {
  for (const [value, source] of [[operator, 'operator'], [inherited, 'inherited-package'], [runtime, 'runtime-profile']]) {
    const profile = normalizeHandoffCarrierProfile(value, { source });
    if (profile.state === 'qualified') return profile;
  }
  return normalizeHandoffCarrierProfile(null);
}

async function readGroundContinuationState(workspaceRoot = '.') {
  try { return JSON.parse(await readFile(path.join(path.resolve(String(workspaceRoot || '.')), '.tiinex', 'continuation.json'), 'utf8')); }
  catch { return {}; }
}
