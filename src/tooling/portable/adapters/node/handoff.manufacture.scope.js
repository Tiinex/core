import { parseArtifactMarkdown } from '../../../../artifacts/artifact.parse.js';
import { parseWorkspaceQualifiedReference } from '../../handoff/workspaceQualifiedReference.js';
import { safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import {
  decodeUtf8,
  entryFromEnumeration,
  isExternalReference,
  materialCandidateFromWorkspaceEntry,
  normalizeRelativePath,
  resolveRelativeWorkspaceTarget,
  sha256Text,
  stableJson
} from './handoff.manufacture.requirements.js';

export function normalizeWorkspaceTargetBindings(input = {}) {
  const byWorkspace = new Map();
  const push = (workspaceIdValue, pathValue, source) => {
    const workspaceId = safeWorkspaceToken(workspaceIdValue || '');
    const path = String(pathValue || '').replace(/\\/g, '/').trim();
    if (!workspaceId || !path) return;
    const list = byWorkspace.get(workspaceId) || [];
    list.push(Object.freeze({ workspaceId, path, source }));
    byWorkspace.set(workspaceId, list);
  };
  push(input.primaryWorkspaceId, input.primaryTargetPath, 'primary-workspace-target');
  const explicit = input.explicitBindings;
  if (Array.isArray(explicit)) {
    for (const entry of explicit) push(entry?.workspaceId || entry?.workspace || entry?.id, entry?.path || entry?.workspaceTargetPath || entry?.workspaceArtifactPath, 'explicit-workspace-target-binding');
  } else if (explicit && typeof explicit === 'object') {
    for (const [workspaceId, value] of Object.entries(explicit)) push(workspaceId, typeof value === 'string' ? value : value?.path || value?.workspaceTargetPath || value?.workspaceArtifactPath, 'explicit-workspace-target-binding');
  }
  for (const descriptor of input.additionalWorkspaceDescriptors || []) push(descriptor.id || descriptor.workspaceId, descriptor.workspaceTargetPath || descriptor.workspaceArtifactPath || descriptor.targetPath || '', 'additional-workspace-target');
  return Object.freeze([...byWorkspace.values()].flat());
}


export function normalizeWorkspaceScopes(value = []) {
  const map = new Map();
  const items = Array.isArray(value)
    ? value
    : (value && typeof value === 'object' ? Object.entries(value).map(([workspaceId, scope]) => ({ workspaceId, ...(typeof scope === 'object' ? scope : {}) })) : []);
  for (const item of items) {
    const workspaceId = safeWorkspaceToken(item?.workspaceId || item?.workspace || item?.id || '');
    if (!workspaceId) continue;
    const coverage = String(item?.coverage || item?.mode || '').trim();
    if (!coverage) continue;
    if (coverage !== 'bounded' && coverage !== 'complete') throw new Error(`portable.handoff-manufacture.workspace-scope.coverage-invalid:${workspaceId}`);
    const include = [...new Set([...(item?.include || item?.includedEntries || item?.paths || [])].map(normalizeRelativePath).filter(Boolean))].sort();
    map.set(workspaceId, Object.freeze({ workspaceId, coverage, include: Object.freeze(include) }));
  }
  return map;
}

export function projectBoundedWorkspaceMaterialization(materialization = {}, scope = {}, workspaceTargetPath = '') {
  const target = normalizeRelativePath(workspaceTargetPath);
  const selected = new Set([...(scope.include || []).map(normalizeRelativePath).filter(Boolean), target].filter(Boolean));
  if (!selected.size) throw new Error(`portable.handoff-manufacture.workspace-scope.empty:${materialization.id}`);
  const sourceByPath = new Map((materialization.entries || []).map((entry) => [normalizeRelativePath(entry.path), entry]));
  const entries = [];
  const includedEntries = [];
  let totalBytes = 0;
  for (const relative of [...selected].sort()) {
    const source = sourceByPath.get(relative);
    if (!source) throw new Error(`portable.handoff-manufacture.workspace-scope.entry-unresolved:${materialization.id}:${relative}`);
    entries.push(source);
    includedEntries.push(Object.freeze({ path: relative, bytes: Number(source.bytes || 0), sha256: String(source.sha256 || ''), referenceTarget: String(source.referenceTarget || '') }));
    totalBytes += Number(source.bytes || 0);
  }
  const scopeEvidence = Object.freeze({
    schema: 'tiinex.portable.workspace-bounded-scope-evidence.v1',
    state: 'qualified',
    proof: 'explicit-bounded-entry-selection-v1',
    boundary: 'exact-representation-entry-set',
    workspaceId: String(materialization.id || ''),
    scopeBasis: 'exact-representation-entry-set',
    includedEntryAuthority: 'qualified-decoded-entry-set',
    omittedEntryMeaning: 'outside-representation-not-absent-from-workspace',
    sourceMembershipClaim: 'represented-entries-are-workspace-relative-source-bytes',
    recoveryClosureBoundary: 'separate-qualified-closure',
    entryCount: includedEntries.length,
    totalBytes,
    entriesFingerprint: sha256Text(stableJson(includedEntries))
  });
  return Object.freeze({
    ...materialization,
    state: 'bounded',
    source: Object.freeze({ ...(materialization.source || {}), projection: 'explicit-bounded-entry-selection-v1', sourceEnumeration: 'qualified-complete-before-projection' }),
    completenessEvidence: Object.freeze({}),
    scopeEvidence,
    entries: Object.freeze(entries),
    includedEntries: Object.freeze(includedEntries)
  });
}

export function expandBoundedParentBoundaryClosure(input = {}) {
  const requirements = input.requirements || {};
  const dependencies = [...(requirements.dependencies || [])];
  const materials = [...(input.materials || [])];
  const seen = new Set(dependencies.map((item) => String(item.id || '')));
  for (const workspace of input.workspaceMaterializations || []) {
    if (String(workspace.state || workspace.materialization || '') !== 'bounded') continue;
    const workspaceId = String(workspace.id || '');
    const runtime = input.workspaceRuntimeById?.get(workspaceId);
    if (!runtime) continue;
    const included = new Set((workspace.includedEntries || []).map((entry) => normalizeRelativePath(entry.path)));
    for (const entry of workspace.entries || []) {
      const sourcePath = normalizeRelativePath(entry.path || '');
      if (!sourcePath || !/\.md$/i.test(sourcePath)) continue;
      const markdown = decodeUtf8(entry.data);
      if (!markdown) continue;
      let parent;
      try { parent = parseArtifactMarkdown(markdown).envelope?.parent || {}; } catch { continue; }
      const references = [parent.trace, ...(parent.originEntries || []).filter((item) => String(item?.label || '').trim() === 'relative').map((item) => item.target)].filter(Boolean);
      for (const reference of [...new Set(references.map(String))]) {
        if (isExternalReference(reference) || reference.startsWith('#')) continue;
        const parentPath = resolveRelativeWorkspaceTarget(sourcePath, reference);
        if (!parentPath || included.has(parentPath)) continue;
        const parentEntry = entryFromEnumeration(runtime.enumeration, parentPath);
        if (!parentEntry) continue;
        const id = `bounded-parent:${safeWorkspaceToken(workspaceId)}:${sha256Text(`${sourcePath}\0${parentPath}`).slice(0, 20)}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const requirement = Object.freeze({
          id,
          name: `Bounded Parent boundary for ${sourcePath}`,
          classification: 'parent-boundary',
          material: 'exact detached Parent recovery dependency',
          purpose: 'preserve exact Parent recovery outside the bounded Workspace Representation entry set',
          availability: 'declared',
          materialReference: reference,
          reference: Object.freeze({ form: 'parent-relative-target', raw: reference, label: '', target: reference, exactTargetDeclared: true }),
          routeWorkspaceId: workspaceId,
          routePath: sourcePath,
          targetWorkspaceId: workspaceId,
          targetPath: parentPath,
          sourceRequirementId: `bounded-workspace:${workspaceId}:${sourcePath}`,
          fields: Object.freeze({ RouteWorkspace: workspaceId, RoutePath: sourcePath, TargetWorkspace: workspaceId, TargetPath: parentPath, Reference: reference })
        });
        dependencies.push(requirement);
        materials.push(materialCandidateFromWorkspaceEntry(requirement, workspaceId, parentPath, parentEntry, runtime.enumeration, runtime));
      }
    }
  }
  return Object.freeze({
    requirements: Object.freeze({ ...requirements, dependencies: Object.freeze(dependencies), counts: Object.freeze({ ...(requirements.counts || {}), dependencies: dependencies.length }) }),
    materials: Object.freeze(materials)
  });
}

export function expandRouteParentBoundaryClosure(input = {}) {
  const requirements = input.requirements || {};
  const dependencies = [...(requirements.dependencies || [])];
  const materials = [...(input.materials || [])];
  const materializationByWorkspaceId = new Map((input.workspaceMaterializations || []).map((item) => [String(item.id || item.workspaceId || ''), item]));
  const seenRequirementIds = new Set(dependencies.map((item) => String(item.id || '')));
  const seenRouteTargets = new Set(dependencies.map((item) => `${String(item.routeWorkspaceId || '')}\0${normalizeRelativePath(item.routePath || '')}\0${String(item.targetWorkspaceId || '')}\0${normalizeRelativePath(item.targetPath || '')}`));

  for (const route of input.routeSpecs || []) {
    const routeWorkspaceId = String(route.workspaceId || '').trim();
    const routePath = normalizeRelativePath(route.path || route.workspaceRelativePath || '');
    if (!routeWorkspaceId || !routePath) continue;
    let currentWorkspaceId = routeWorkspaceId;
    let currentPath = routePath;
    const visited = new Set();
    for (let depth = 0; depth < 256; depth += 1) {
      const visitKey = `${currentWorkspaceId}\0${currentPath}`;
      if (visited.has(visitKey)) break;
      visited.add(visitKey);
      const runtime = input.workspaceRuntimeById?.get(currentWorkspaceId);
      const currentEntry = runtime ? entryFromEnumeration(runtime.enumeration, currentPath) : null;
      if (!currentEntry) break;
      const markdown = decodeUtf8(currentEntry.data);
      if (!markdown) break;
      let parent;
      try { parent = parseArtifactMarkdown(markdown).envelope?.parent || {}; } catch { break; }
      const reference = String(parent.trace || (parent.originEntries || []).find((item) => String(item?.label || '').trim() === 'relative')?.target || '').trim();
      if (!reference) break;

      let targetWorkspaceId = currentWorkspaceId;
      let targetPath = '';
      const qualified = parseWorkspaceQualifiedReference(reference);
      if (qualified) {
        targetWorkspaceId = qualified.workspaceId;
        targetPath = normalizeRelativePath(qualified.path);
      } else {
        if (isExternalReference(reference) || reference.startsWith('#')) break;
        targetPath = resolveRelativeWorkspaceTarget(currentPath, reference);
      }
      if (!targetWorkspaceId || !targetPath) break;

      const targetRuntime = input.workspaceRuntimeById?.get(targetWorkspaceId);
      const targetEntry = targetRuntime ? entryFromEnumeration(targetRuntime.enumeration, targetPath) : null;
      const targetMaterialization = materializationByWorkspaceId.get(targetWorkspaceId);
      const targetAlreadyCarried = workspaceMaterializationIncludesPath(targetMaterialization, targetPath);
      const routeTargetKey = `${routeWorkspaceId}\0${routePath}\0${targetWorkspaceId}\0${targetPath}`;
      if (!targetAlreadyCarried && !seenRouteTargets.has(routeTargetKey)) {
        seenRouteTargets.add(routeTargetKey);
        const id = `route-parent:${safeWorkspaceToken(routeWorkspaceId)}:${sha256Text(`${routePath}\0${currentWorkspaceId}\0${currentPath}\0${targetWorkspaceId}\0${targetPath}`).slice(0, 20)}`;
        if (!seenRequirementIds.has(id)) {
          seenRequirementIds.add(id);
          const requirement = Object.freeze({
            id,
            name: `Route Parent boundary for ${currentWorkspaceId}:${currentPath}`,
            classification: 'parent-boundary',
            material: 'exact detached Parent continuity dependency',
            purpose: 'preserve selected Handoff route continuity across a Workspace carriage boundary without requiring complete unrelated Workspace carriage',
            availability: 'declared',
            materialReference: reference,
            reference: Object.freeze({ form: qualified ? 'parent-workspace-qualified-target' : 'parent-relative-target', raw: reference, label: '', target: reference, exactTargetDeclared: true }),
            routeWorkspaceId,
            routePath,
            sourceWorkspaceId: currentWorkspaceId,
            sourcePath: currentPath,
            targetWorkspaceId,
            targetPath,
            sourceRequirementId: '',
            fields: Object.freeze({ RouteWorkspace: routeWorkspaceId, RoutePath: routePath, SourceWorkspace: currentWorkspaceId, SourcePath: currentPath, TargetWorkspace: targetWorkspaceId, TargetPath: targetPath, Reference: reference })
          });
          dependencies.push(requirement);
          if (targetEntry) materials.push(materialCandidateFromWorkspaceEntry(requirement, targetWorkspaceId, targetPath, targetEntry, targetRuntime.enumeration, targetRuntime));
        }
      }
      if (!targetEntry) break;
      currentWorkspaceId = targetWorkspaceId;
      currentPath = targetPath;
    }
  }

  return Object.freeze({
    requirements: Object.freeze({ ...requirements, dependencies: Object.freeze(dependencies), counts: Object.freeze({ ...(requirements.counts || {}), dependencies: dependencies.length }) }),
    materials: Object.freeze(materials)
  });
}

function workspaceMaterializationIncludesPath(materialization = null, targetPath = '') {
  if (!materialization) return false;
  const state = String(materialization.state || materialization.materialization || '');
  if (state === 'complete') return true;
  if (state !== 'bounded') return false;
  const normalized = normalizeRelativePath(targetPath);
  return (materialization.includedEntries || materialization.entries || []).some((entry) => normalizeRelativePath(entry.path || '') === normalized);
}
