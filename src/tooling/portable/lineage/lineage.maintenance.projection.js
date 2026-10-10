import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { stableFingerprintBytes, utf8Bytes } from '../../../export/package.bytes.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_METHOD_ID } from '../../../integrity/integrity.methodReference.js';
import { projectScaffoldArtifactRelocation } from '../../../scaffolds/scaffold.relocation.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { projectPortableMoveSelection } from './lineage.move-selection.js';
import { projectScopedAssetChanges } from './lineage.mixed-assets.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { verifyC14nV2TargetSelfDigest } from '../../../integrity/integrity.c14nV2.js';

export const LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID = 'tiinex.portable.lineage-maintenance-plan.v1';

export function projectPortableLineageMaintenance(input = {}) {
  const operation = normalizeOperation(input.operation || input);
  const materials = normalizeMaintenanceMaterials(input, operation.workspaceId);
  const findings = [];
  const representationCoverage = normalizeRepresentationCoverage(input);
  if (representationCoverage !== 'complete') findings.push(finding('error', 'lineage-maintenance.workspace-representation-complete-required', 'Lineage maintenance requires an explicitly complete Workspace Representation because directory-local re-dimensioning may depend on omitted siblings or references.', { coverage: representationCoverage }));
  if (!materials.length) findings.push(finding('error', 'lineage-maintenance.materials-required', 'Lineage maintenance requires exact loaded artifact materials.'));
  if (!operation.kind) findings.push(finding('error', 'lineage-maintenance.operation-required', 'Lineage maintenance requires an explicit operation kind.'));
  const duplicateKeys = duplicateMaterialKeys(materials);
  if (duplicateKeys.length) findings.push(finding('error', 'lineage-maintenance.material-duplicate', 'Loaded material contains duplicate Workspace/path identities.', { keys: duplicateKeys }));
  const parsed = materials.map((material) => inspectMaterial(material, findings, { requireSelf: false }));
  if (findings.some((item) => item.severity === 'error')) return blockedPlan(operation, materials, findings);

  // Explicit local scope is qualified by Core, not guessed from file names
  // in a host adapter. Binary companions are not silently omitted from Apply.
  let scopedSelection = null;
  if (operation.kind === 'scoped-move') {
    if (operation.targetWorkspaceId && operation.targetWorkspaceId !== operation.workspaceId) {
      findings.push(finding('error','lineage-maintenance.cross-workspace-git-continuity-unqualified',
        'Cross-Workspace moves require full reference closure and verified Git permalink fallback; this version never silently assumes a same-Workspace move.'));
    }
    if (operation.scope !== 'alone' && (!Array.isArray(input.assetPaths) || input.assetCoverage !== 'complete')) {
      findings.push(finding('error','lineage-maintenance.complete-asset-inventory-required',
        'An explicit complete asset inventory is required for every scope that may include assets.'));
    }
    if (input.referenceCoverage && input.referenceCoverage !== 'complete') {
      findings.push(finding('error','lineage-maintenance.reference-closure-unqualified',
        'Executable scoped Move/Rebase requires qualified complete reference coverage; partial or bounded scans are preview-only.'));
    }
    const familiar = operation.placement === 'same' && operation.parentPolicy === 'keep';
    const semanticInsert = ['append','prepend'].includes(operation.placement) && operation.parentPolicy === 'new';
    const coordinateInsert = ['append','prepend'].includes(operation.placement) && operation.parentPolicy === 'keep';
    if (!familiar && !semanticInsert && !coordinateInsert) {
      findings.push(finding('error','lineage-maintenance.scoped-placement-unqualified',
        'Unsupported placement/Parent Policy combination; Core requires explicit qualified coordinates and preserved Parent identity.'));
    }
    scopedSelection = projectPortableMoveSelection({
      workspaceId: operation.workspaceId, selectedPath: operation.selectedPath,
      scope: operation.scope, materials, assetPaths: input.assetPaths,
      representationCoverage
    });
    if (scopedSelection.status !== 'ready') {
      for (const item of scopedSelection.findings) findings.push(finding('error',item.code,item.detail || item.code));
    }
    if (findings.some(item=>item.severity === 'error')) return blockedPlan(operation,materials,findings);
  }
  let projected;
  if (operation.kind === 'scoped-move') {
    if (operation.placement === 'same') projected = projectMove(parsed, { ...operation, kind: 'move', selectedPaths: scopedSelection.artifactPaths }, findings);
    else projected = operation.parentPolicy === 'keep'
      ? projectKeptParentCoordinateInsertion(parsed, operation, scopedSelection, findings)
      : projectScopedInsertion(parsed, operation, scopedSelection, findings);
  }
  else if (operation.kind === 'move') projected = projectMove(parsed, operation, findings);
  else if (operation.kind === 'normalize-directory') projected = projectNormalizeDirectory(parsed, operation, findings);
  else if (operation.kind === 'prepend') projected = projectPrepend(parsed, operation, findings);
  else findings.push(finding('error', 'lineage-maintenance.operation-unsupported', `Unsupported lineage maintenance operation ${operation.kind}.`, { kind: operation.kind }));
  if (!projected || findings.some((item) => item.severity === 'error')) return blockedPlan(operation, materials, findings, projected);
  if (scopedSelection && operation.placement !== 'same') {
    qualifyScopedInsertionCoordinates(materials, projected, scopedSelection, operation, findings);
    if (findings.some(x=>x.severity==='error')) return blockedPlan(operation,materials,findings,projected);
  }

  const mixedAssets = scopedSelection?.assetPaths.length
    ? projectScopedAssetChanges({ input, selection: scopedSelection, projected, workspaceId: operation.workspaceId })
    : { inputs: [], changes: [], relocations: [], findings: [] };
  for (const item of mixedAssets.findings) findings.push(finding(item.severity,item.code,item.message));
  if (findings.some(x=>x.severity==='error')) return blockedPlan(operation,materials,findings,projected);
  const relocation = projectScaffoldArtifactRelocation({ materials: projected.materials, originalMaterials: materials,
    relocations: [...projected.relocations, ...mixedAssets.relocations] });
  for (const item of relocation.findings || []) findings.push(finding(item.severity || 'error', `lineage-maintenance.${item.code || 'relocation'}`, item.message || 'Artifact relocation projection failed.', item.params || {}));
  if (relocation.status !== 'ready') return blockedPlan(operation, materials, findings, projected);

  const participatingKeys = new Set(projected.pathMap?.keys?.() || []);
  for (const output of relocation.outputs || []) {
    if (output.moved || output.contentChanged) participatingKeys.add(`${output.workspaceId}::${output.fromPath}`);
  }
  for (const material of materials) {
    if (!participatingKeys.has(materialKey(material))) continue;
    const self = canonicalC14nV2SelfState(material.markdown);
    if (self.state !== 'verified') findings.push(finding('error', 'lineage-maintenance.self-unqualified', `Affected artifact self integrity is not verified: ${material.path}`, { path: material.path, state: self.state }));
  }
  if (findings.some((item) => item.severity === 'error')) return blockedPlan(operation, materials, findings, projected);

  const outputBySource = new Map((relocation.outputs || []).map((item) => [`${item.workspaceId}::${item.fromPath}`, item]));
  const changes = materials.map((material) => {
    const output = outputBySource.get(`${material.workspaceId}::${material.path}`);
    const markdown = String(output?.markdown ?? material.markdown);
    const toPath = String(output?.toPath || projected.pathMap.get(`${material.workspaceId}::${material.path}`) || material.path);
    return Object.freeze({
      workspaceId: material.workspaceId,
      fromPath: material.path,
      toPath,
      beforeFingerprint: stableFingerprintBytes(utf8Bytes(material.markdown)),
      afterFingerprint: stableFingerprintBytes(utf8Bytes(markdown)),
      pathChanged: toPath !== material.path,
      bytesChanged: markdown !== material.markdown,
      semanticParent: projected.semanticParentDelta.get(`${material.workspaceId}::${material.path}`) || Object.freeze({ changed: false, before: parentTarget(material), after: parentTarget(material) }),
      markdown
    });
  });
  if (scopedSelection) {
    // The selected semantic Parent must remain the SAME artifact after a move
    // even when its textual relative locator is different. Validate the
    // resolved identity and the exact parent digest BEFORE an executable plan
    // can reach the transaction engine.
    qualifyPreservedParentContinuity(materials, changes, findings);
    if (findings.some(item=>item.severity==='error')) return blockedPlan(operation,materials,findings,projected);
  }
  changes.push(...mixedAssets.changes.map(c=>Object.freeze(c)));
  const collisions = detectOutputCollisions(changes);
  if (collisions.length) {
    findings.push(finding('error', 'lineage-maintenance.output-collision', 'Projected lineage maintenance produces duplicate output paths.', { collisions }));
    return blockedPlan(operation, materials, findings, projected);
  }
  const inputs = [...materials.map((item)=>Object.freeze({ workspaceId:item.workspaceId,path:item.path,fingerprint:stableFingerprintBytes(utf8Bytes(item.markdown)) })), ...mixedAssets.inputs.map(x=>Object.freeze(x))];
  const inputFingerprint = mixedAssets.inputs.length
    ? stableFingerprintBytes(utf8Bytes(JSON.stringify(inputs)))
    : fingerprintMaterials(materials);
  const planFingerprint = stableFingerprintBytes(utf8Bytes(JSON.stringify({ representationCoverage, operation, inputFingerprint, outputs: changes.map(({ workspaceId, fromPath, toPath, afterFingerprint }) => ({ workspaceId, fromPath, toPath, afterFingerprint })) })));
  return Object.freeze({
    schema: LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID,
    status: 'ready',
    executable: true,
    representationCoverage,
    operation,
    inputFingerprint,
    planFingerprint,
    inputs: Object.freeze(inputs),
    ...(mixedAssets.inputs.length ? {assetCoverage:'complete',referenceCoverage:'complete'} : {}),
    changes: Object.freeze(changes),
    summary: Object.freeze({
      materials: materials.length,
      pathChanges: changes.filter((item) => item.pathChanged).length,
      byteChanges: changes.filter((item) => item.bytesChanged).length,
      semanticParentChanges: changes.filter((item) => item.semanticParent?.changed).length,
      preservedSemanticParents: changes.filter((item) => !item.semanticParent?.changed && item.semanticParent?.before).length
    }),
    findings: Object.freeze(findings),
    findingSummary: summarize(findings),
    applyContract: Object.freeze({
      command: 'apply-lineage-maintenance',
      planArgument: '--plan <plan.json>',
      workspaceRootsArgument: '--workspace-roots <roots.json> | --workspace-id <id> --workspace-root <dir>',
      localOnly: true,
      exactPlanFingerprintRequired: true,
      inputDriftFailsClosed: true,
      remoteWrite: false,
      gitMutation: false
    }),
    boundary: Object.freeze({
      readOnlyProjection: true,
      selectionAuthority: 'exact Workspace/path identities only',
      filenameDimensionAuthority: 'directory-local coordinate projection only; never semantic Parent authority',
      workspaceRepresentationCoverage: representationCoverage,
      completeWorkspaceRepresentationRequired: true,
      moveParentSemantics: 'preserve',
      prependParentSemantics: 'explicitly mutate only the declared insertion chain',
      arbitrarySiblingMajorReorder: false,
      remoteWrite: false
    })
  });
}

export function qualifyPortableLineageDirectoryNamespace(input = {}) {
  const workspaceId = String(input.workspaceId || '').trim();
  const materials = normalizeMaintenanceMaterials(input, workspaceId);
  const directory = norm(input.directory || input.targetDirectory || '');
  const findings = [];
  const representationCoverage = normalizeRepresentationCoverage(input);
  const scopeLimited = representationCoverage !== 'complete';
  if (!workspaceId || !directory) findings.push(finding('error', 'lineage-namespace.input-incomplete', 'Directory namespace qualification requires workspaceId and directory.'));
  const entries = materials.filter((item) => item.workspaceId === workspaceId && path.posix.dirname(item.path) === directory).map((item) => inspectMaterial(item, findings));
  if (!entries.length) findings.push(finding('error', 'lineage-namespace.empty', `No artifact material is loaded for ${workspaceId}::${directory}.`));
  for (const item of entries) if (!item.coordinate) findings.push(finding('error', 'lineage-namespace.coordinate-unrepresentable', `Artifact filename has no directory-local numeric coordinate: ${item.path}`, { path: item.path }));
  if (findings.some((item) => item.severity === 'error')) return Object.freeze({ schema: 'tiinex.portable.lineage-directory-namespace-qualification.v1', status: 'blocked', workspaceId, directory, representationCoverage, scopeLimited, drift: Object.freeze([]), findings: Object.freeze(findings), findingSummary: summarize(findings), boundary: 'Read-only directory-local filename namespace qualification. Numeric coordinates are never semantic Parent authority.' });
  const forest = entries.map((item) => ({ ...item, group: `stay:${directory}` }));
  const assigned = assignCoordinateForest(forest);
  const drift = entries.map((item) => {
    const dimension = assigned.get(materialKey(item));
    const expectedPath = path.posix.join(directory, `${renderDimension(dimension)}-${item.coordinate.slug}`);
    return Object.freeze({ workspaceId, path: item.path, expectedPath, currentDimension: renderDimension(item.coordinate.dimension), expectedDimension: renderDimension(dimension), drifted: expectedPath !== item.path, semanticParent: parentTarget(item) });
  }).sort((a,b)=>comparePathCoordinate(a.path,b.path));
  const drifted = drift.filter((item) => item.drifted);
  return Object.freeze({
    schema: 'tiinex.portable.lineage-directory-namespace-qualification.v1',
    status: 'ready', workspaceId, directory, representationCoverage, scopeLimited,
    qualification: scopeLimited ? 'scope-limited' : drifted.length ? 'drifted' : 'compact',
    observedQualification: drifted.length ? 'drifted' : 'compact',
    drift: Object.freeze(drift),
    summary: Object.freeze({ artifacts: drift.length, drifted: drifted.length, compact: drift.length - drifted.length }),
    recommendation: !scopeLimited && drifted.length ? Object.freeze({ operation: 'project-lineage-maintenance', kind: 'normalize-directory', workspaceId, targetDirectory: directory, representationCoverage: 'complete' }) : null,
    findings: Object.freeze(findings), findingSummary: summarize(findings),
    boundary: scopeLimited
      ? 'Read-only scope-limited observation of explicit loaded directory-local filename coordinates. Omitted material is not absent from the Workspace, so no whole-namespace compactness or maintenance recommendation is established.'
      : 'Read-only directory-local filename namespace qualification over an explicitly complete Workspace Representation. It compares explicit loaded artifact coordinates, never infers semantic Parent from filename ancestry, and performs no mutation.'
  });
}


export function qualifyPortableLineageWorkspaceNamespaces(input = {}) {
  const workspaceId = String(input.workspaceId || '').trim();
  const materials = normalizeMaintenanceMaterials(input, workspaceId);
  const findings = [];
  const representationCoverage = normalizeRepresentationCoverage(input);
  const scopeLimited = representationCoverage !== 'complete';
  if (!workspaceId) findings.push(finding('error', 'lineage-workspace-namespace.workspace-id-required', 'Workspace namespace qualification requires an explicit workspaceId.'));
  const local = materials.filter((item) => item.workspaceId === workspaceId);
  if (!local.length) findings.push(finding('error', 'lineage-workspace-namespace.materials-required', `No Tiinex artifact material is loaded for ${workspaceId || 'the requested Workspace'}.`));
  if (findings.some((item) => item.severity === 'error')) return Object.freeze({
    schema: 'tiinex.portable.lineage-workspace-namespace-qualification.v1', status: 'blocked', workspaceId, representationCoverage, scopeLimited,
    qualification: 'blocked', surfaces: Object.freeze([]), namespaces: Object.freeze([]), skipped: Object.freeze([]), recommendations: Object.freeze([]),
    summary: Object.freeze({ surfaces: 0, numericOnly: 0, nonNumericOnly: 0, mixed: 0, directories: 0, compact: 0, drifted: 0, blocked: 0, skippedMixed: 0, artifacts: local.length }),
    findings: Object.freeze(findings), findingSummary: summarize(findings),
    boundary: 'Read-only Workspace-wide discovery of homogeneous directory-local numeric Tiinex filename namespaces. Mixed/non-numeric Tiinex surfaces are reported as outside this namespace qualifier; filename ancestry is never semantic Parent authority.'
  });

  const byDirectory = new Map();
  for (const item of local) {
    const directory = path.posix.dirname(item.path);
    if (!byDirectory.has(directory)) byDirectory.set(directory, []);
    byDirectory.get(directory).push(item);
  }
  const surfaces = [];
  const namespaces = [];
  const skipped = [];
  const recommendations = [];
  for (const directory of [...byDirectory.keys()].sort()) {
    const entries = byDirectory.get(directory);
    const numeric = entries.filter((item) => filenameCoordinate(item.path));
    const nonNumeric = entries.filter((item) => !filenameCoordinate(item.path));
    const surfaceState = numeric.length && nonNumeric.length ? 'mixed' : numeric.length ? 'numeric-only' : 'non-numeric-only';
    surfaces.push(Object.freeze({ directory, state: surfaceState, artifacts: entries.length, numericArtifacts: numeric.length, nonNumericArtifacts: nonNumeric.length }));
    if (!numeric.length) continue;
    if (nonNumeric.length) {
      skipped.push(Object.freeze({ directory, state: 'not-applicable-mixed', numericArtifacts: numeric.length, nonNumericArtifacts: nonNumeric.length, nonNumericPaths: Object.freeze(nonNumeric.map((item) => item.path).sort()) }));
      continue;
    }
    const qualification = qualifyPortableLineageDirectoryNamespace({ materials: entries, workspaceId, directory, representationCoverage });
    namespaces.push(Object.freeze({ directory, status: qualification.status, qualification: qualification.qualification || 'blocked', observedQualification: qualification.observedQualification || qualification.qualification || 'blocked', scopeLimited: Boolean(qualification.scopeLimited), summary: qualification.summary || Object.freeze({ artifacts: entries.length, drifted: 0, compact: 0 }), drift: qualification.drift || Object.freeze([]), findings: qualification.findings || Object.freeze([]), findingSummary: qualification.findingSummary || summarize([]) }));
    if (qualification.status !== 'ready') findings.push(finding('error', 'lineage-workspace-namespace.directory-blocked', `Numeric filename namespace qualification is blocked for ${workspaceId}::${directory}.`, { workspaceId, directory }));
    else if (!scopeLimited && qualification.qualification === 'drifted' && qualification.recommendation) recommendations.push(qualification.recommendation);
  }
  const blocked = namespaces.filter((item) => item.status !== 'ready').length;
  const drifted = namespaces.filter((item) => item.status === 'ready' && item.observedQualification === 'drifted').length;
  const compact = namespaces.filter((item) => item.status === 'ready' && item.observedQualification === 'compact').length;
  const numericOnly = surfaces.filter((item) => item.state === 'numeric-only').length;
  const nonNumericOnly = surfaces.filter((item) => item.state === 'non-numeric-only').length;
  const mixed = surfaces.filter((item) => item.state === 'mixed').length;
  return Object.freeze({
    schema: 'tiinex.portable.lineage-workspace-namespace-qualification.v1',
    status: blocked ? 'blocked' : 'ready', workspaceId, representationCoverage, scopeLimited,
    qualification: blocked ? 'blocked' : scopeLimited ? 'scope-limited' : drifted ? 'drifted' : 'compact',
    observedQualification: blocked ? 'blocked' : drifted ? 'drifted' : 'compact',
    surfaces: Object.freeze(surfaces), namespaces: Object.freeze(namespaces), skipped: Object.freeze(skipped), recommendations: Object.freeze(recommendations),
    summary: Object.freeze({ surfaces: surfaces.length, numericOnly, nonNumericOnly, mixed, directories: namespaces.length, compact, drifted, blocked, skippedMixed: skipped.length, artifacts: local.length }),
    findings: Object.freeze(findings), findingSummary: summarize(findings),
    boundary: scopeLimited
      ? 'Read-only scope-limited discovery over explicit loaded material. Numeric-only, non-numeric-only, and mixed directory surfaces are inventoried without treating omitted entries as absent; no Workspace-wide compactness or Normalize recommendation is established.'
      : 'Read-only Workspace-wide discovery over an explicitly complete Workspace Representation. Numeric-only, non-numeric-only, and mixed directory surfaces are inventoried explicitly; only homogeneous numeric namespaces enter compactness/Normalize qualification, filename ancestry is never semantic Parent authority, and no mutation is performed.'
  });
}

function projectNormalizeDirectory(materials, operation, findings) {
  const workspaceId = operation.workspaceId;
  const directory = operation.targetDirectory;
  if (!workspaceId || !directory) {
    findings.push(finding('error', 'lineage-maintenance.normalize-input-incomplete', 'Normalize Directory requires workspaceId and targetDirectory.'));
    return null;
  }
  const selectedPaths = materials.filter((item) => item.workspaceId === workspaceId && path.posix.dirname(item.path) === directory).map((item) => item.path);
  if (!selectedPaths.length) {
    findings.push(finding('error', 'lineage-maintenance.normalize-empty', `No artifact material is loaded for ${workspaceId}::${directory}.`));
    return null;
  }
  return projectMove(materials, { ...operation, kind: 'move', selectedPaths, targetDirectory: directory }, findings);
}

function projectMove(materials, operation, findings) {
  const workspaceId = operation.workspaceId;
  const selected = new Set(operation.selectedPaths);
  if (!workspaceId || !selected.size || !operation.targetDirectory) {
    findings.push(finding('error', 'lineage-maintenance.move-input-incomplete', 'Move requires workspaceId, exact selectedPaths, and targetDirectory.'));
    return null;
  }
  const inWorkspace = materials.filter((item) => item.workspaceId === workspaceId);
  for (const selectedPath of selected) if (!inWorkspace.some((item) => item.path === selectedPath)) findings.push(finding('error', 'lineage-maintenance.selection-missing', `Selected artifact is unavailable: ${selectedPath}`, { path: selectedPath }));
  if (findings.some((item) => item.severity === 'error')) return null;
  const sourceDirectories = new Set([...selected].map((value) => path.posix.dirname(value)));
  const affectedDirectories = new Set([...sourceDirectories, operation.targetDirectory]);
  const coordinateEntries = [];
  for (const item of inWorkspace) {
    const originalDirectory = path.posix.dirname(item.path);
    if (!affectedDirectories.has(originalDirectory) && !selected.has(item.path)) continue;
    const coordinate = filenameCoordinate(item.path);
    if (!coordinate) {
      findings.push(finding('error', 'lineage-maintenance.coordinate-unrepresentable', `Artifact filename has no directory-local numeric coordinate: ${item.path}`, { path: item.path }));
      continue;
    }
    const moved = selected.has(item.path);
    coordinateEntries.push({ ...item, coordinate, finalDirectory: moved ? operation.targetDirectory : originalDirectory, group: `${moved ? 'move' : 'stay'}:${originalDirectory}` });
  }
  if (findings.some((item) => item.severity === 'error')) return null;
  const pathMap = new Map();
  for (const directory of affectedDirectories) {
    const entries = coordinateEntries.filter((item) => item.finalDirectory === directory);
    const assigned = assignCoordinateForest(entries, { groupOrder: (a, b) => groupPriority(a).localeCompare(groupPriority(b)) });
    for (const [key, dimension] of assigned) {
      const item = entries.find((candidate) => materialKey(candidate) === key);
      pathMap.set(key, path.posix.join(directory, `${renderDimension(dimension)}-${item.coordinate.slug}`));
    }
  }
  const relocations = [...pathMap].map(([key, to]) => {
    const [workspace, ...rest] = key.split('::'); return Object.freeze({ workspaceId: workspace, from: rest.join('::'), to });
  }).filter((item) => item.from !== item.to);
  const semanticParentDelta = new Map(inWorkspace.map((item) => [materialKey(item), Object.freeze({ changed: false, before: parentTarget(item), after: parentTarget(item) })]));
  return { materials: materials.map(stripInspection), relocations, pathMap, semanticParentDelta };
}

/** A semantic Parent rewrite is not itself a numeric placement. Check the
 * operator's exact anchor promise before exposing an executable transaction.
 * Other non-selected siblings must not be silently renumbered. */
function qualifyScopedInsertionCoordinates(materials, projected, selection, operation, findings) {
  const map=projected.pathMap;
  const chosen=new Set(selection.artifactPaths);
  const local=new Map(materials.filter(x=>x.workspaceId===operation.workspaceId && path.posix.dirname(x.path)===selection.directory).map(x=>[x.path,x]));
  const roots=selection.artifactPaths.filter(x=>!chosen.has(resolveLocalParentPath(local.get(x))));
  const root=roots[0];const fromTarget=operation.targetPath;
  const toRoot=map.get(`${operation.workspaceId}::${root}`)||root;
  const toTarget=map.get(`${operation.workspaceId}::${fromTarget}`)||fromTarget;
  const dim=p=>filenameCoordinate(p)?.dimension||[];
  const equals=(a,b)=>a.length===b.length && a.every((v,i)=>v===b[i]);
  if(operation.placement==='prepend' && !equals(dim(toRoot),dim(fromTarget)))
    findings.push(finding('error','lineage-maintenance.prepend-target-dimension-drift',`Prepend must put the selected root at the target's exact original dimension: ${fromTarget}`));
  if(operation.placement==='append' && (!equals(dim(toTarget),dim(fromTarget)) || !equals(dim(toRoot).slice(0,-1),dim(fromTarget))))
    findings.push(finding('error','lineage-maintenance.append-anchor-dimension-drift',`Append must preserve target's original dimension and nest the selection root directly below it: ${fromTarget}`));
  const allowed=new Set(selection.artifactPaths);
  if(operation.placement==='prepend') {
    const byPath=new Map([...local].map(([p,m])=>[p,m]));
    // Target and its existing descendants necessarily follow the newly
    // inserted chain; unrelated siblings do not.
    const children=semanticChildren([...byPath.values()]);
    const visit=p=>{if(allowed.has(p))return;allowed.add(p);for(const child of children.get(p)||[])visit(child.path);};
    visit(fromTarget);
  }
  for (const item of local.values()) {
    const relocated=map.get(materialKey(item))||item.path;
    if(relocated!==item.path && !allowed.has(item.path))
      findings.push(finding('error','lineage-maintenance.insertion-unselected-renumber',`Insertion would renumber an unselected artifact: ${item.path}`,{from:item.path,to:relocated}));
  }
}

/** Pure numeric positioning; do NOT derive semantic Parent from filename
 * ancestry. The existing Parent and all qualified references are rewritten by
 * the shared relocation engine, then independently checked for exact identity
 * and digest continuity before the transaction becomes executable.
 *
 * Only the selection and, for Prepend, the target's own semantic descendants
 * may change path. Every other artifact retains its old numeric coordinate.
 */
function projectKeptParentCoordinateInsertion(materials, operation, selection, findings) {
  const workspaceId = operation.workspaceId;
  const dir = selection.directory;
  const local = materials.filter(m => m.workspaceId === workspaceId && path.posix.dirname(m.path) === dir);
  const byPath = new Map(local.map(m => [m.path, m]));
  const target = byPath.get(operation.targetPath);
  const chosen = new Set(selection.artifactPaths);
  if (!target || chosen.has(operation.targetPath) || operation.targetDirectory !== dir) {
    findings.push(finding('error','lineage-maintenance.keep-parent-target-invalid',
      'Keep Parent insertion requires an exact different artifact anchor in the same source directory.'));
    return null;
  }
  if (selection.shape.roots !== 1 || (operation.placement === 'prepend' && !selection.shape.straight)) {
    findings.push(finding('error','lineage-maintenance.keep-parent-selection-shape',
      'Insertion requires one selected root; Prepend must be a straight chain.'));
    return null;
  }
  const parents = new Map(local.map(m => [m.path, resolveLocalParentPath(m)]));
  const root = selection.artifactPaths.find(p => !chosen.has(parents.get(p)));
  if (!root) {
    findings.push(finding('error','lineage-maintenance.keep-parent-root-missing','A qualified selected root is required.'));
    return null;
  }
  // Do not reorder an ancestor and its own descendant, even if its numeric
  // coordinates happen to look unrelated.
  const followAncestor = (first, sought) => {
    let current = first; const visited = new Set();
    while (current && byPath.has(current)) {
      if (current === sought) return true;
      if (visited.has(current)) return true; // cycle => fail closed
      visited.add(current); current = parents.get(current);
    }
    return false;
  };
  if (followAncestor(operation.targetPath, root) || followAncestor(root, operation.targetPath)) {
    findings.push(finding('error','lineage-maintenance.keep-parent-semantic-overlap',
      'Keep Parent insertion does not reposition an artifact against its own ancestor or descendant.'));
    return null;
  }
  const coords = new Map(local.map(m => [m.path, filenameCoordinate(m.path)]));
  const dimOf = pathname => coords.get(pathname)?.dimension;
  if ([...local].some(m => !dimOf(m.path))) {
    findings.push(finding('error','lineage-maintenance.keep-parent-coordinate-invalid',
      'All directory-local artifact coordinates must be representable.'));
    return null;
  }
  const targetDim = dimOf(operation.targetPath);
  const children = semanticChildren(local);
  const candidate = new Map();
  const visit = (pathname, dimension, allowed, seen = new Set()) => {
    if (seen.has(pathname) || candidate.has(pathname)) return false;
    seen.add(pathname);
    if (!allowed.has(pathname)) return false;
    candidate.set(pathname, dimension);
    const descendants = (children.get(pathname) || []).filter(c => allowed.has(c.path))
      .sort((a,b)=>compareDimension(dimOf(a.path),dimOf(b.path)) || a.path.localeCompare(b.path));
    for (let n = 0; n < descendants.length; n++) {
      if (!visit(descendants[n].path, [...dimension,n + 1],allowed,seen)) return false;
    }
    return true;
  };
  if (operation.placement === 'append') {
    // Do not disturb existing anchor children or unrelated numbered siblings.
    const occupied = [...coords.values()].map(c => c.dimension);
    const direct = occupied.filter(d => d.length === targetDim.length + 1 && targetDim.every((v,i)=>v===d[i]));
    const childNumber = direct.reduce((n,d)=>Math.max(n,d.at(-1)),0) + 1;
    if (!visit(root,[...targetDim,childNumber],chosen)) {
      findings.push(finding('error','lineage-maintenance.keep-parent-selection-not-closed',
        'Cannot derive an exact connected selection under its existing Parent relationships.'));
      return null;
    }
  } else {
    if (!visit(root,targetDim,chosen)) {
      findings.push(finding('error','lineage-maintenance.keep-parent-selection-not-closed',
        'Prepend selection must be a single contiguous Parent chain.'));
      return null;
    }
    const chain = selection.artifactPaths.filter(p => candidate.has(p));
    if (chain.length !== selection.artifactPaths.length) {
      findings.push(finding('error','lineage-maintenance.keep-parent-selection-not-contiguous',
        'Prepend cannot silently detach a selected artifact.'));
      return null;
    }
    const last = selection.artifactPaths.find(p => !(children.get(p) || []).some(c=>chosen.has(c.path)));
    const kept = new Set();
    const collect = p => { if (kept.has(p)) return; kept.add(p); for (const c of children.get(p) || []) collect(c.path); };
    collect(operation.targetPath);
    if (!last || !visit(operation.targetPath,[...candidate.get(last),1],kept)) {
      findings.push(finding('error','lineage-maintenance.keep-parent-target-branch-unqualified',
        'Cannot rebase the target and its own children without losing semantic continuity.'));
      return null;
    }
  }
  if ([...chosen].some(p=>!candidate.has(p)) ||
      (operation.placement === 'prepend' && !candidate.has(operation.targetPath))) {
    findings.push(finding('error','lineage-maintenance.keep-parent-selection-incomplete',
      'Exact selected artifacts or the target were omitted from the coordinate plan.'));
    return null;
  }
  const updated = new Map();
  for (const [oldPath,dim] of candidate) {
    const coordinate = coords.get(oldPath);
    updated.set(`${workspaceId}::${oldPath}`,path.posix.join(dir,`${renderDimension(dim)}-${coordinate.slug}`));
  }
  // A different slug is NOT permission to reuse the same numeric
  // coordinate. Enforce both path and dimension uniqueness across every
  // unchanged sibling and every output before an executable plan exists.
  const existing = new Set(local.filter(m=>!candidate.has(m.path)).map(m=>m.path));
  const existingDimensions = local.filter(m=>!candidate.has(m.path))
    .map(m=>renderDimension(coords.get(m.path).dimension));
  const projected = [...updated.values()];
  const projectedDimensions = projected.map(p=>renderDimension(filenameCoordinate(p).dimension));
  if (new Set(existingDimensions).size !== existingDimensions.length ||
      new Set(projectedDimensions).size !== projectedDimensions.length ||
      projected.some(p=>existing.has(p)) ||
      projectedDimensions.some(d=>existingDimensions.includes(d))) {
    findings.push(finding('error','lineage-maintenance.keep-parent-coordinate-collision',
      'Projected coordinates collide with another artifact, regardless of slug; no sibling is silently renumbered.'));
    return null;
  }
  const relocations = [...updated].map(([k,to])=>({workspaceId,from:k.slice(workspaceId.length+2),to}))
    .filter(x=>x.from!==x.to);
  const semanticParentDelta = new Map(materials.map(m=>[materialKey(m),Object.freeze({
    changed:false,before:parentTarget(m),after:parentTarget(m)
  })]));
  return {materials:materials.map(stripInspection),relocations,pathMap:updated,semanticParentDelta};
}

/** Insert one directory-local semantic selection relative to an artifact anchor.
 * The graph is qualified BEFORE any coordinate rewrite. Keep-Parent insertion
 * is deliberately not approximated by a semantic graph insertion. */
function projectScopedInsertion(materials, operation, selection, findings) {
  const target = materials.find(m=>m.workspaceId===operation.workspaceId && m.path===operation.targetPath);
  if (!target || !operation.targetPath || selection.artifactPaths.includes(operation.targetPath)) {
    findings.push(finding('error','lineage-maintenance.insertion-target-invalid','Choose an exact qualified target outside the selected artifacts.'));
    return null;
  }
  const directory=selection.directory;
  if(path.posix.dirname(operation.targetPath)!==directory || operation.targetDirectory!==directory) {
    findings.push(finding('error','lineage-maintenance.insertion-cross-directory-unqualified','Graph insertion is restricted to the selected artifact directory.'));
    return null;
  }
  if(selection.shape.roots!==1) {
    findings.push(finding('error','lineage-maintenance.insertion-root-ambiguous','An insertion must have exactly one semantic root.'));
    return null;
  }
  const selected=new Set(selection.artifactPaths);
  const byPath=new Map(materials.filter(m=>m.workspaceId===operation.workspaceId).map(m=>[m.path,m]));
  const root=selection.artifactPaths.find(p=>!selected.has(resolveLocalParentPath(byPath.get(p))));
  if (!root) {
    findings.push(finding('error','lineage-maintenance.insertion-root-missing','Cannot establish selected semantic root.'));
    return null;
  }
  // Target descendants may be outside the selection when scope=Alone. Reject
  // any backwards edge that would turn a valid lineage into a cycle.
  let ancestor=operation.targetPath;const seen=new Set();
  while(ancestor && byPath.has(ancestor) && !seen.has(ancestor)) {
    if (selected.has(ancestor)) { findings.push(finding('error','lineage-maintenance.insertion-cycle','Target is a semantic descendant of the selected set.'));return null; }
    seen.add(ancestor);ancestor=resolveLocalParentPath(byPath.get(ancestor));
  }
  if(operation.placement==='prepend') {
    if(!selection.shape.straight || selection.shape.branches!==0) {
      findings.push(finding('error','lineage-maintenance.prepend-selection-branched','Prepend requires one straight selection with one last leaf.'));
      return null;
    }
    const children=semanticChildren(selection.artifactPaths.map(p=>byPath.get(p)));
    const ordered=[];let cursor=root;
    while(cursor && !ordered.includes(cursor)) {
      ordered.push(cursor);
      cursor=(children.get(cursor)||[])[0]?.path || '';
    }
    if(ordered.length!==selection.artifactPaths.length) {
      findings.push(finding('error','lineage-maintenance.prepend-selection-not-contiguous','Prepend selection is not a contiguous semantic chain.'));
      return null;
    }
    return projectPrepend(materials,{...operation,kind:'prepend',orderedPaths:ordered,targetPath:operation.targetPath},findings);
  }
  const working=new Map(materials.map(m=>[materialKey(m),{...stripInspection(m)}]));
  const key=materialKey(byPath.get(root));
  const rebound=rewriteParentBinding(working.get(key).markdown,root,working.get(materialKey(target)));
  if(!rebound.ok){findings.push(finding('error','lineage-maintenance.append-parent-rewrite-blocked',`Cannot link selected root to target: ${rebound.reason}`));return null;}
  working.set(key,{...working.get(key),markdown:rebound.markdown});
  const semanticParentDelta=new Map(materials.map(m=>[materialKey(m),Object.freeze({changed:false,before:parentTarget(m),after:parentTarget(m)})]));
  semanticParentDelta.set(key,Object.freeze({changed:true,before:parentTarget(byPath.get(root)),after:target.path}));
  const local=[...working.values()].filter(m=>m.workspaceId===operation.workspaceId && path.posix.dirname(m.path)===directory).map(m=>inspectMaterial(m,findings));
  if(findings.some(f=>f.severity==='error'))return null;
  const pathMap=assignSemanticDirectoryPaths(local,directory,{lastAppendPath:root,appendToPath:target.path});
  const relocations=[...pathMap].map(([id,to])=>{const [workspace,...rest]=id.split('::');return Object.freeze({workspaceId:workspace,from:rest.join('::'),to});}).filter(x=>x.from!==x.to);
  return {materials:[...working.values()],relocations,pathMap,semanticParentDelta};
}

function projectPrepend(materials, operation, findings) {
  const workspaceId = operation.workspaceId;
  const orderedPaths = operation.orderedPaths;
  const targetPath = operation.targetPath;
  if (!workspaceId || !orderedPaths.length || !targetPath) {
    findings.push(finding('error', 'lineage-maintenance.prepend-input-incomplete', 'Prepend requires workspaceId, orderedPaths, and targetPath.'));
    return null;
  }
  if (new Set(orderedPaths).size !== orderedPaths.length || orderedPaths.includes(targetPath)) {
    findings.push(finding('error', 'lineage-maintenance.prepend-selection-invalid', 'Prepend insertion paths must be unique and exclude the target.'));
    return null;
  }
  const byPath = new Map(materials.filter((item) => item.workspaceId === workspaceId).map((item) => [item.path, item]));
  const target = byPath.get(targetPath);
  const inserts = orderedPaths.map((item) => byPath.get(item));
  if (!target || inserts.some((item) => !item)) {
    findings.push(finding('error', 'lineage-maintenance.prepend-material-missing', 'Prepend target or insertion material is unavailable.'));
    return null;
  }
  const directory = path.posix.dirname(targetPath);
  if (inserts.some((item) => path.posix.dirname(item.path) !== directory)) {
    findings.push(finding('error', 'lineage-maintenance.prepend-cross-directory-unsupported', 'First-version Prepend requires insertion artifacts and target in one directory-local namespace.'));
    return null;
  }
  const children = semanticChildren([...byPath.values()]);
  for (const insert of inserts) {
    const externalChildren = (children.get(insert.path) || []).filter((child) => !orderedPaths.includes(child.path));
    if (externalChildren.length) {
      findings.push(finding('error', 'lineage-maintenance.prepend-insert-has-external-children', `Insertion artifact ${insert.path} has existing children outside the ordered insertion set.`, { path: insert.path, children: externalChildren.map((item) => item.path) }));
    }
  }
  if (findings.some((item) => item.severity === 'error')) return null;
  const priorParentPath = resolveLocalParentPath(target);
  if (priorParentPath && orderedPaths.includes(priorParentPath)) {
    findings.push(finding('error', 'lineage-maintenance.prepend-cycle', 'Insertion selection contains the target prior Parent and would create a cycle.'));
    return null;
  }
  const working = new Map(materials.map((item) => [materialKey(item), { ...stripInspection(item) }]));
  const semanticParentDelta = new Map();
  let previousParent = priorParentPath ? byPath.get(priorParentPath) || null : null;
  for (const insert of inserts) {
    const key = materialKey(insert);
    const rewritten = rewriteParentBinding(working.get(key).markdown, insert.path, previousParent ? working.get(materialKey(previousParent)) : null);
    if (!rewritten.ok) { findings.push(finding('error', 'lineage-maintenance.prepend-parent-rewrite-blocked', `Cannot rewrite Parent for ${insert.path}.`, { path: insert.path, reason: rewritten.reason })); return null; }
    working.set(key, { ...working.get(key), markdown: rewritten.markdown });
    semanticParentDelta.set(key, Object.freeze({ changed: true, before: parentTarget(insert), after: previousParent?.path || '' }));
    previousParent = { ...insert, markdown: rewritten.markdown };
  }
  const targetKey = materialKey(target);
  const rewrittenTarget = rewriteParentBinding(working.get(targetKey).markdown, target.path, previousParent ? working.get(materialKey(previousParent)) || previousParent : null);
  if (!rewrittenTarget.ok) { findings.push(finding('error', 'lineage-maintenance.prepend-target-rewrite-blocked', `Cannot rewrite Parent for target ${target.path}.`, { path: target.path, reason: rewrittenTarget.reason })); return null; }
  working.set(targetKey, { ...working.get(targetKey), markdown: rewrittenTarget.markdown });
  semanticParentDelta.set(targetKey, Object.freeze({ changed: true, before: parentTarget(target), after: previousParent?.path || '' }));
  for (const item of materials) if (!semanticParentDelta.has(materialKey(item))) semanticParentDelta.set(materialKey(item), Object.freeze({ changed: false, before: parentTarget(item), after: parentTarget(item) }));

  const local = [...working.values()].filter((item) => item.workspaceId === workspaceId && path.posix.dirname(item.path) === directory).map((item) => inspectMaterial(item, findings));
  if (findings.some((item) => item.severity === 'error')) return null;
  const pathMap = assignSemanticDirectoryPaths(local, directory, { targetPath, firstInsertPath: orderedPaths[0] });
  const relocations = [...pathMap].map(([key, to]) => { const [workspace, ...rest] = key.split('::'); return Object.freeze({ workspaceId: workspace, from: rest.join('::'), to }); }).filter((item) => item.from !== item.to);
  return { materials: [...working.values()], relocations, pathMap, semanticParentDelta };
}

function assignCoordinateForest(entries, options = {}) {
  const byGroup = new Map();
  for (const item of entries) { if (!byGroup.has(item.group)) byGroup.set(item.group, []); byGroup.get(item.group).push(item); }
  const roots = [];
  const parentByKey = new Map();
  for (const [group, groupEntries] of byGroup) {
    for (const item of groupEntries) {
      const parent = nearestCoordinateAncestor(item, groupEntries);
      parentByKey.set(materialKey(item), parent ? materialKey(parent) : '');
      if (!parent) roots.push({ group, item });
    }
  }
  roots.sort((a, b) => (options.groupOrder?.(a.group, b.group) || 0) || compareDimension(a.item.coordinate.dimension, b.item.coordinate.dimension) || a.item.path.localeCompare(b.item.path));
  const children = new Map();
  for (const item of entries) { const parent = parentByKey.get(materialKey(item)); if (!parent) continue; if (!children.has(parent)) children.set(parent, []); children.get(parent).push(item); }
  for (const values of children.values()) values.sort((a, b) => compareDimension(a.coordinate.dimension, b.coordinate.dimension) || a.path.localeCompare(b.path));
  const out = new Map();
  const visit = (item, dim) => { out.set(materialKey(item), dim); const values = children.get(materialKey(item)) || []; values.forEach((child, index) => visit(child, [...dim, index + 1])); };
  roots.forEach(({ item }, index) => visit(item, [index + 1]));
  return out;
}

function assignSemanticDirectoryPaths(entries, directory, options = {}) {
  const byPath = new Map(entries.map((item) => [item.path, item]));
  const children = new Map(); const roots = [];
  for (const item of entries) {
    const parentPath = resolveLocalParentPath(item);
    if (parentPath && byPath.has(parentPath)) { if (!children.has(parentPath)) children.set(parentPath, []); children.get(parentPath).push(item); }
    else roots.push(item);
  }
  const order = (a, b) => {
    if (a.path === options.firstInsertPath && b.path === options.targetPath) return -1;
    if (b.path === options.firstInsertPath && a.path === options.targetPath) return 1;
    if(a.path===options.lastAppendPath && b.path!==options.lastAppendPath && byPath.get(a.path)?.parsed?.envelope?.parent?.trace) return 1;
    if(b.path===options.lastAppendPath && a.path!==options.lastAppendPath && byPath.get(b.path)?.parsed?.envelope?.parent?.trace) return -1;
    return compareDimension(a.coordinate.dimension, b.coordinate.dimension) || a.path.localeCompare(b.path);
  };
  roots.sort(order); for (const values of children.values()) values.sort(order);
  const out = new Map();
  const visit = (item, dim) => { out.set(materialKey(item), path.posix.join(directory, `${renderDimension(dim)}-${item.coordinate.slug}`)); (children.get(item.path) || []).forEach((child, index) => visit(child, [...dim, index + 1])); };
  roots.forEach((item, index) => visit(item, [index + 1]));
  return out;
}

function rewriteParentBinding(markdown, childPath, parentMaterial) {
  const parsed = parseArtifactMarkdown(markdown);
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const rule = lines.findIndex((line) => /^---\s*$/.test(line));
  if (rule < 0) return { ok: false, reason: 'continuity-envelope-divider-missing' };
  const parentStart = lines.findIndex((line, index) => index < rule && line === '- Parent');
  const currentStart = lines.findIndex((line, index) => index < rule && line === '- Current');
  if (currentStart < 0) return { ok: false, reason: 'current-envelope-block-missing' };
  let parentEnd = parentStart >= 0 ? currentStart : currentStart;
  if (parentStart >= 0) lines.splice(parentStart, parentEnd - parentStart);
  if (parentMaterial) {
    const parentParsed = parseArtifactMarkdown(parentMaterial.markdown);
    const schemaRaw = String(parentParsed.envelope?.current?.schema?.raw || parentParsed.envelope?.current?.schema?.id || '').trim();
    const createdAt = String(parentParsed.envelope?.current?.createdAt || '').trim();
    const relative = path.posix.relative(path.posix.dirname(childPath), parentMaterial.path) || path.posix.basename(parentMaterial.path);
    const block = ['- Parent', `  - Parent Schema: ${schemaRaw}`, ...(createdAt ? [`  - Created At: ${createdAt}`] : []), `  - Trace: [${path.posix.basename(parentMaterial.path)}](${relative})`, '  - Origin:', `    - [relative](${relative})`];
    const insertAt = lines.findIndex((line, index) => index < rule && line === '- Current');
    lines.splice(insertAt, 0, ...block);
  }
  let next = lines.join('\n');
  next = rewritePrimaryParentIntegrity(next, childPath, parentMaterial);
  if (!next) return { ok: false, reason: 'parent-integrity-rewrite-failed' };
  const sealed = sealC14nV2Self(next);
  if (sealed.state !== 'sealed') return { ok: false, reason: `self-reseal-${sealed.reason || sealed.state}` };
  return { ok: true, markdown: sealed.markdown + (String(markdown).endsWith('\n') ? '\n' : '') };
}

function rewritePrimaryParentIntegrity(markdown, childPath, parentMaterial) {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const heading = lines.findIndex((line) => line === '# Continuity Integrity'); if (heading < 0) return '';
  const entries = []; let current = null;
  const flush = (end) => { if (current) { current.end = end; entries.push(current); current = null; } };
  for (let i = heading + 1; i < lines.length; i++) {
    if (/^#\s+/.test(lines[i])) { flush(i); break; }
    if (/^-\s+/.test(lines[i])) { flush(i); current = { start: i, end: lines.length, method: stripLink(lines[i].replace(/^-\s+/, '').trim()), towards: '' }; continue; }
    if (current) { const m = lines[i].match(/^\s+-\s+Towards:\s*(.*?)\s*$/); if (m) current.towards = linkTarget(m[1]); }
  } flush(lines.length);
  const self = entries.find((entry) => entry.method === C14N_V2_METHOD_ID && entry.towards === 'self'); if (!self) return '';
  const parentEntries = entries.filter((entry) => entry.method === C14N_V2_METHOD_ID && entry.towards && entry.towards !== 'self').sort((a,b)=>b.start-a.start);
  for (const entry of parentEntries) lines.splice(entry.start, entry.end - entry.start);
  if (parentMaterial) {
    const state = canonicalC14nV2SelfState(parentMaterial.markdown); if (state.state !== 'verified') return '';
    const relative = path.posix.relative(path.posix.dirname(childPath), parentMaterial.path) || path.posix.basename(parentMaterial.path);
    const selfStart = lines.findIndex((line, index) => index > heading && /^-\s+/.test(line) && stripLink(line.replace(/^-\s+/, '').trim()) === C14N_V2_METHOD_ID && lines.slice(index + 1, Math.min(lines.length, index + 5)).some((candidate) => /^\s+-\s+Towards:\s*self\s*$/.test(candidate)));
    if (selfStart < 0) return '';
    lines.splice(selfStart, 0, `- ${C14N_V2_METHOD_ID}`, `  - Towards: [${path.posix.basename(parentMaterial.path)}](${relative})`, `  - Value: ${state.declaredValue}`, '');
  }
  return lines.join('\n');
}

function qualifyPreservedParentContinuity(materials, changes, findings) {
  const before=new Map(materials.map(m=>[materialKey(m),m]));
  const after=new Map(changes.map(c=>[`${c.workspaceId}::${c.toPath}`,c]));
  const movedByOld=new Map(changes.map(c=>[`${c.workspaceId}::${c.fromPath}`,c]));
  for(const source of materials) {
    const output=movedByOld.get(materialKey(source));
    if(!output || (!output.pathChanged && !output.bytesChanged))continue;
    const current=createRecordFromMarkdown(source.markdown,{path:source.path});
    const revised=createRecordFromMarkdown(output.markdown,{path:output.toPath});
    const former=String(current.trace||'');const latter=String(revised.trace||'');
    if(output.semanticParent?.changed) {
      const desired=String(output.semanticParent.after||'');
      const actual=latter && !/^[a-z][a-z0-9+.-]*:/i.test(latter)
        ? path.posix.normalize(path.posix.join(path.posix.dirname(output.toPath),latter)) : '';
      const desiredOutput=movedByOld.get(`${source.workspaceId}::${desired}`)?.toPath || desired;
      if(!desired) {
        const refs=(revised.integrity?.entries||[]).filter(i=>i.towards && i.towards!=='self');
        if(latter || refs.length) findings.push(finding('error','lineage-maintenance.changed-root-parent-drift',`Root ${source.path} unexpectedly acquired a Parent.`));
        continue;
      }
      const parent=after.get(`${source.workspaceId}::${desiredOutput}`);
      if(!parent || actual!==desiredOutput || !desiredOutput || desiredOutput===output.toPath) {
        findings.push(finding('error','lineage-maintenance.changed-parent-identity-drift',`Changed Parent of ${source.path} does not resolve to its qualified target.`,{desiredOutput,actual}));continue;
      }
      const candidates=(revised.integrity?.entries||[]).filter(i=>i.towards&&i.towards!=='self');
      if(!candidates.some(i=>verifyC14nV2TargetSelfDigest({value:i.value,targetMarkdown:parent.markdown}).state==='verified'))
        findings.push(finding('error','lineage-maintenance.changed-parent-integrity-drift',`Changed Parent digest does not verify: ${source.path}`));
      continue;
    }
    if (!former && !latter) continue;
    if (!former || !latter) {
      findings.push(finding('error','lineage-maintenance.preserved-parent-lost',`Move must not add/remove a Parent: ${source.path}`)); continue;
    }
    // External publication links are immutable custody outside this local
    // complete representation. Never fabricate their current target identity.
    if (/^[a-z][a-z0-9+.-]*:/i.test(former)||former.includes('::')) {
      if (former!==latter) findings.push(finding('error','lineage-maintenance.external-parent-drift',source.path));
      continue;
    }
    const previous=path.posix.normalize(path.posix.join(path.posix.dirname(source.path),former));
    const expected=movedByOld.get(`${source.workspaceId}::${previous}`)?.toPath || previous;
    const actual=path.posix.normalize(path.posix.join(path.posix.dirname(output.toPath),latter));
    if (actual!==expected) {
      findings.push(finding('error','lineage-maintenance.preserved-parent-identity-drift',
        `Parent of ${source.path} resolves to ${actual} rather than ${expected}.`,{before:previous,expected,actual}));continue;
    }
    const parent=after.get(`${source.workspaceId}::${expected}`);
    if(!parent || !before.has(`${source.workspaceId}::${previous}`)) {
      findings.push(finding('error','lineage-maintenance.preserved-parent-material-unavailable',
        `Cannot verify preserved Parent bytes for ${source.path}.`,{parent:expected}));continue;
    }
    const references=(revised.integrity?.entries||[]).filter(i=>i.towards&&i.towards!=='self');
    const qualified=references.some(i=>verifyC14nV2TargetSelfDigest({value:i.value,targetMarkdown:parent.markdown}).state==='verified');
    if(!qualified) findings.push(finding('error','lineage-maintenance.preserved-parent-integrity-drift',
      `Parent digest of ${source.path} no longer verifies after rebase.`,{parent:expected}));
  }
}

function inspectMaterial(material, findings, options = {}) {
  let parsed; try { parsed = parseArtifactMarkdown(material.markdown); } catch (error) { findings.push(finding('error', 'lineage-maintenance.parse-failed', `Artifact parse failed: ${material.path}`, { path: material.path, message: error?.message || String(error) })); return { ...material, parsed: null, coordinate: filenameCoordinate(material.path) }; }
  if (options.requireSelf !== false) {
    const self = canonicalC14nV2SelfState(material.markdown); if (self.state !== 'verified') findings.push(finding('error', 'lineage-maintenance.self-unqualified', `Artifact self integrity is not verified: ${material.path}`, { path: material.path, state: self.state }));
  }
  return { ...material, parsed, coordinate: filenameCoordinate(material.path) };
}
function normalizeRepresentationCoverage(input = {}) {
  const value = String(input.representationCoverage || input.coverage || input.workspaceCoverage || '').trim().toLowerCase();
  if (!value) return 'unknown';
  if (['complete', 'bounded', 'partial', 'unknown'].includes(value)) return value;
  return 'unknown';
}

function normalizeMaintenanceMaterials(input = {}, fallbackWorkspaceId = '') {
  const workspaceId = String(fallbackWorkspaceId || input.workspaceId || input.operation?.workspaceId || '').trim();
  const explicit = Array.isArray(input.materials) && input.materials.length ? input.materials : Array.isArray(input.records) && input.records.length ? input.records : null;
  if (explicit) return normalizeMaterials(explicit.map((item) => ({ ...item, workspaceId: item?.workspaceId || workspaceId })));
  if (!Array.isArray(input.files) || !input.files.length || !workspaceId) return [];
  const portable = normalizePortableInput(input);
  return normalizeMaterials((portable.records || [])
    .filter((record) => record.hasContinuityContext && String(record.path || '').startsWith('.topics/'))
    .map((record) => ({ workspaceId, path: record.path, markdown: record.markdown })));
}

function normalizeMaterials(values) { return (values || []).map((item) => Object.freeze({ workspaceId: String(item.workspaceId || ''), path: norm(item.path), markdown: String(item.markdown || '') })).filter((item) => item.workspaceId && item.path && item.markdown).sort((a,b)=>a.workspaceId.localeCompare(b.workspaceId)||a.path.localeCompare(b.path)); }
function normalizeOperation(value = {}) { const kind = String(value.kind || value.operation || '').trim().toLowerCase(); return Object.freeze({ kind, workspaceId: String(value.workspaceId || '').trim(), selectedPath: norm(value.selectedPath || ''), targetWorkspaceId: String(value.targetWorkspaceId || ''), scope: String(value.scope || 'alone'), placement: String(value.placement || 'same'), parentPolicy: String(value.parentPolicy || 'keep'), selectedPaths: Object.freeze((value.selectedPaths || []).map(norm)), targetDirectory: norm(value.targetDirectory || value.directory || ''), orderedPaths: Object.freeze((value.orderedPaths || value.insertPaths || []).map(norm)), targetPath: norm(value.targetPath || '') }); }
function stripInspection(item) { return { workspaceId: item.workspaceId, path: item.path, markdown: item.markdown }; }
function parentTarget(item) { return String(item.parsed?.envelope?.parent?.trace || parseArtifactMarkdown(item.markdown).envelope?.parent?.trace || ''); }
function resolveLocalParentPath(item) { const trace = parentTarget(item); if (!trace || trace.includes('::') || /^[a-z][a-z0-9+.-]*:/i.test(trace) || trace.startsWith('/')) return ''; return norm(path.posix.join(path.posix.dirname(item.path), trace)); }
function semanticChildren(items) { const byPath = new Map(items.map((item) => [item.path,item])); const out = new Map(); for (const item of items) { const parent = resolveLocalParentPath(item); if (!parent || !byPath.has(parent)) continue; if (!out.has(parent)) out.set(parent,[]); out.get(parent).push(item); } return out; }
function filenameCoordinate(value) { const name = path.posix.basename(value); const match = name.match(/^(\d+(?:-\d+)*)-(.+)$/); if (!match) return null; return { dimension: match[1].split('-').map(Number), slug: match[2] }; }
function nearestCoordinateAncestor(item, entries) { const own = item.coordinate.dimension; let best = null; for (const candidate of entries) { if (candidate === item) continue; const dim = candidate.coordinate.dimension; if (dim.length >= own.length) continue; if (dim.every((part,index)=>part===own[index]) && (!best || dim.length > best.coordinate.dimension.length)) best = candidate; } return best; }
function renderDimension(value) { return value.map((part,index) => index === 0 ? String(part).padStart(3, '0') : String(part)).join('-'); }
function compareDimension(a,b) { const n=Math.min(a.length,b.length); for(let i=0;i<n;i++){if(a[i]!==b[i])return a[i]-b[i];} return a.length-b.length; }
function groupPriority(group) { return group.startsWith('stay:') ? `0:${group}` : `1:${group}`; }
function materialKey(item) { return `${item.workspaceId}::${item.path}`; }
function duplicateMaterialKeys(items) { const seen=new Set(),dup=[]; for(const item of items){const k=materialKey(item); if(seen.has(k))dup.push(k); else seen.add(k);} return dup; }
function detectOutputCollisions(changes){const seen=new Map(),out=[];for(const item of changes){const key=`${item.workspaceId}::${item.toPath}`;if(seen.has(key))out.push(key);else seen.set(key,item);}return [...new Set(out)];}
function fingerprintMaterials(items) { return stableFingerprintBytes(utf8Bytes(JSON.stringify(items.map((item)=>({workspaceId:item.workspaceId,path:item.path,fingerprint:stableFingerprintBytes(utf8Bytes(item.markdown))}))))); }
function comparePathCoordinate(a,b) { const aa=filenameCoordinate(a), bb=filenameCoordinate(b); if(aa&&bb){const d=compareDimension(aa.dimension,bb.dimension); if(d)return d;} return String(a).localeCompare(String(b)); }
function blockedPlan(operation, materials, findings, projected = null) { const representationCoverage = String(findings.find((item) => item.code === 'lineage-maintenance.workspace-representation-complete-required')?.params?.coverage || 'complete'); return Object.freeze({ schema: LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID, status: 'blocked', executable: false, representationCoverage, operation, inputFingerprint: fingerprintMaterials(materials), planFingerprint: '', inputs: Object.freeze([]), changes: Object.freeze([]), summary: Object.freeze({ materials: materials.length, pathChanges: 0, byteChanges: 0, semanticParentChanges: 0, preservedSemanticParents: 0 }), findings: Object.freeze(findings), findingSummary: summarize(findings), applyContract: Object.freeze({ command: 'apply-lineage-maintenance', localOnly: true, exactReadyPlanRequired: true, remoteWrite: false, gitMutation: false }), boundary: Object.freeze({ readOnlyProjection: true, workspaceRepresentationCoverage: representationCoverage, completeWorkspaceRepresentationRequired: true, remoteWrite: false }) }); }
function summarize(findings){return Object.freeze({error:findings.filter((x)=>x.severity==='error').length,warning:findings.filter((x)=>x.severity==='warning').length,info:findings.filter((x)=>x.severity==='info').length,total:findings.length});}
function finding(severity,code,message,params={}){return Object.freeze({severity,code,message,params:Object.freeze({...params})});}
function norm(value=''){const raw=String(value||'').replace(/\\/g,'/').replace(/^\.\//,'');if(!raw)return '';return path.posix.normalize(raw).replace(/^\/+/, '');}
function stripLink(value=''){const s=String(value||'').trim();const m=s.match(/^\[([^\]]+)\]\([^)]+\)$/);return (m?m[1]:s).trim();}
function linkTarget(value=''){const s=String(value||'').trim();const m=s.match(/^\[[^\]]+\]\(([^)]+)\)$/);return (m?m[1]:s).trim();}
