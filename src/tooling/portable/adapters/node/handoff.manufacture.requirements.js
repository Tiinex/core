import { createHash } from 'node:crypto';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { packageFileBytes, sha256Hex } from '../../../../export/package.bytes.js';
import { parseArtifactMarkdown } from '../../../../artifacts/artifact.parse.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../../integrity/integrity.c14nV2.js';
import { taskValidate } from '../../../../schemas/core/task/tiinex.task.v1.validate.js';
import { projectHandoffMaterialRequirements, projectParticipantRoleRequirements } from '../../handoff/materialClosure.requirements.js';
import { explicitTaskParticipantDeclarations } from '../../grounding/grounding.participantArtifactAuthority.js';
import { parseRoleMaterial } from '../../handoff/coldStartQualification.materials.js';
import { safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import { parseWorkspaceQualifiedReference } from '../../handoff/workspaceQualifiedReference.js';

export async function projectManufacturingRequirements({ handoff, workspaceId, handoffPath, routeSpecs, workspaceRuntimeById }) {
  const primary = projectHandoffMaterialRequirements(handoff);
  const combined = { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [], findings: [...(primary.findings || [])] };
  const participantRoleInputs = [];
  const seenRoute = new Set();
  for (const route of routeSpecs || []) {
    const routeWorkspaceId = String(route.workspaceId || workspaceId || '').trim();
    const routePath = normalizeRelativePath(route.path || route.workspaceRelativePath || '');
    const routeKey = `${routeWorkspaceId}\u0000${routePath}`;
    if (!routeWorkspaceId || !routePath || seenRoute.has(routeKey)) continue;
    seenRoute.add(routeKey);
    const runtime = workspaceRuntimeById.get(routeWorkspaceId);
    if (!runtime) throw new Error(`portable.handoff-manufacture.route.workspace-unresolved:${routeWorkspaceId}`);
    const routeMarkdown = routeWorkspaceId === workspaceId && routePath === handoffPath
      ? handoff.markdown
      : await readWorkspaceRuntimeText(runtime, routePath, 'portable.handoff-manufacture.route.path');
    const projected = routeWorkspaceId === workspaceId && routePath === handoffPath
      ? primary
      : projectHandoffMaterialRequirements({ id: routePath, path: routePath, semanticStatus: 'unknown', markdown: routeMarkdown });
    const primaryRoute = routeWorkspaceId === workspaceId && routePath === handoffPath;
    for (const key of ['required', 'reference']) {
      for (const requirement of projected[key] || []) combined[key].push(scopeRouteRequirement(requirement, routeWorkspaceId, routePath, primaryRoute));
    }
    const endpointRoleBindings = bindExplicitRouteEndpointRoles(projected.endpointRoles || [], route.endpointRoles || [], routeWorkspaceId, routePath, combined.findings, workspaceRuntimeById);
    for (const requirement of endpointRoleBindings) combined.endpointRoles.push(scopeRouteRequirement(requirement, routeWorkspaceId, routePath, primaryRoute));
    participantRoleInputs.push(Object.freeze({
      routeWorkspaceId,
      routePath,
      roles: Object.freeze([...(route.participantRoles || route.roles || [])])
    }));
    combined.findings.push(...(projected.findings || []));
  }
  if (!seenRoute.has(`${workspaceId}\u0000${handoffPath}`)) {
    for (const key of ['required', 'reference', 'endpointRoles']) for (const requirement of primary[key] || []) combined[key].push(scopeRouteRequirement(requirement, workspaceId, handoffPath, true));
  }
  return Object.freeze({
    ...primary,
    required: Object.freeze(combined.required),
    reference: Object.freeze(combined.reference),
    endpointRoles: Object.freeze(combined.endpointRoles),
    participantRoles: Object.freeze(combined.participantRoles),
    participantRoleInputs: Object.freeze(participantRoleInputs),
    dependencies: Object.freeze(combined.dependencies),
    counts: Object.freeze({ required: combined.required.length, reference: combined.reference.length, endpointRoles: combined.endpointRoles.length, participantRoles: combined.participantRoles.length, dependencies: combined.dependencies.length }),
    findings: Object.freeze(combined.findings)
  });
}

export function projectSemanticParticipantManufacturingRequirements({ requirements = {}, materials = [], routeSpecs = [], workspaceRuntimeById = new Map() } = {}) {
  const findings = [...(requirements.findings || [])];
  const participantRoles = [];
  const semanticRoutes = [];
  const explicitByRoute = new Map((requirements.participantRoleInputs || []).map((item) => [routeKey(item.routeWorkspaceId, item.routePath), item]));

  for (const route of routeSpecs || []) {
    const routeWorkspaceId = String(route.workspaceId || '').trim();
    const routePath = normalizeRelativePath(route.path || route.workspaceRelativePath || '');
    if (!routeWorkspaceId || !routePath) continue;
    const key = routeKey(routeWorkspaceId, routePath);
    const taskQualification = resolveNearestQualifiedTaskRecord({ workspaceId: routeWorkspaceId, path: routePath, workspaceRuntimeById });
    const task = taskQualification.task || null;
    const declarations = taskQualification.state === 'qualified' && task ? [...explicitTaskParticipantDeclarations(task)] : [];
    const declarationGroups = groupParticipantDeclarations(declarations);
    const routeMaterials = qualifiedRouteRoleMaterials({ requirements, materials, routeWorkspaceId, routePath });
    const derived = [];
    let routeBlocked = taskQualification.state === 'blocked';
    if (taskQualification.state === 'blocked') {
      findings.push(finding('error', 'portable.handoff-manufacture.participant-role.current-task-unqualified', 'Participant authority requires the exact current-work Task to satisfy the canonical Task schema and verified c14n-v2 self-integrity before participant transport requirements can be manufactured.', {
        routeWorkspaceId,
        routePath,
        taskWorkspaceId: taskQualification.candidate?.workspaceId || '',
        taskPath: taskQualification.candidate?.workspaceRelativePath || '',
        expectedSchemaId: taskQualification.expectedSchemaId || 'tiinex.task.v1',
        actualSchemaId: taskQualification.actualSchemaId || '',
        selfIntegrityState: taskQualification.selfIntegrityState || 'unavailable',
        reasons: taskQualification.reasons || []
      }));
    }

    for (const [normalizedLabel, entries] of [...declarationGroups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const label = String(entries[0]?.roleLabel || '').trim();
      if (entries.length !== 1) {
        routeBlocked = true;
        findings.push(finding('error', 'portable.handoff-manufacture.participant-role.semantic-declaration-ambiguous', 'Exactly one closed current-work participant declaration must identify each participant Role before transport requirements can be manufactured.', { routeWorkspaceId, routePath, roleLabel: label, declarationCount: entries.length }));
        continue;
      }
      const candidates = dedupeQualifiedRoleMaterials(routeMaterials.filter((item) => normalizeRoleLabel(item.label) === normalizedLabel));
      if (candidates.length !== 1) {
        routeBlocked = true;
        findings.push(finding('error', candidates.length ? 'portable.handoff-manufacture.participant-role.semantic-role-material-ambiguous' : 'portable.handoff-manufacture.participant-role.semantic-role-material-not-established', candidates.length
          ? 'The explicitly declared participant Role resolves to multiple distinct exact qualified Role artifacts in the selected route bounded material closure.'
          : 'The explicitly declared participant Role has no exact qualified Role material in the selected route bounded material closure.', { routeWorkspaceId, routePath, roleLabel: label, candidateCount: candidates.length }));
        continue;
      }
      derived.push(Object.freeze({ declaration: entries[0], role: candidates[0] }));
    }

    const explicit = explicitByRoute.get(key)?.roles || [];
    if (!declarations.length && explicit.length) {
      routeBlocked = true;
      findings.push(finding('error', 'portable.handoff-manufacture.participant-role.semantic-authority-not-established', 'Route-level participant Role transport input cannot create a participant pointer when the controlling current-work artifact establishes no semantic participant authority.', { routeWorkspaceId, routePath, explicitCount: explicit.length }));
    }

    let semanticDescriptors = [];
    if (declarations.length && !routeBlocked) {
      semanticDescriptors = derived.map(({ declaration, role }) => semanticParticipantDescriptor(routeWorkspaceId, routePath, declaration, role));
      const explicitValidation = validateExplicitParticipantInputs(explicit, semanticDescriptors, routeWorkspaceId, routePath);
      if (!explicitValidation.valid) {
        routeBlocked = true;
        findings.push(...explicitValidation.findings);
      }
      if (!routeBlocked) participantRoles.push(...projectParticipantRoleRequirements(semanticDescriptors, { workspaceId: routeWorkspaceId, routePath }));
    } else if (!declarations.length && explicit.length === 0) {
      // No semantic participant authority and no participant transport request is a valid empty participant set.
    }

    semanticRoutes.push(Object.freeze({
      routeWorkspaceId,
      routePath,
      currentTask: task ? Object.freeze({ path: task.path, schemaId: task.schemaId }) : (taskQualification.candidate ? Object.freeze({ path: taskQualification.candidate.path, schemaId: taskQualification.actualSchemaId || '' }) : null),
      declarations: Object.freeze(declarations),
      participantRoles: Object.freeze(routeBlocked ? [] : semanticDescriptors),
      participantCount: routeBlocked ? 0 : derived.length,
      state: routeBlocked ? 'blocked' : declarations.length ? 'qualified' : 'not-established'
    }));
  }

  return Object.freeze({
    requirements: Object.freeze({
      ...requirements,
      participantRoles: Object.freeze(participantRoles),
      counts: Object.freeze({ ...(requirements.counts || {}), participantRoles: participantRoles.length }),
      findings: Object.freeze(findings),
      semanticParticipantRoutes: Object.freeze(semanticRoutes)
    }),
    semanticRoutes: Object.freeze(semanticRoutes)
  });
}


function bindExplicitRouteEndpointRoles(requirements = [], explicitRoles = [], routeWorkspaceId = '', routePath = '', findings = [], workspaceRuntimeById = new Map()) {
  const byParty = new Map();
  for (const raw of explicitRoles || []) {
    const role = raw && typeof raw === 'object' ? raw : {};
    const party = String(role.party || role.side || '').trim().toLowerCase();
    if (!['from', 'to'].includes(party)) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-party-invalid', 'Explicit route endpoint Role material must identify exactly one `from` or `to` Handoff party.', { routeWorkspaceId, routePath, party }));
      continue;
    }
    if (!byParty.has(party)) byParty.set(party, []);
    byParty.get(party).push(role);
  }
  const projectedParties = new Set((requirements || []).map((item) => String(item.party || '').trim().toLowerCase()).filter(Boolean));
  for (const [party, entries] of byParty.entries()) {
    if (!projectedParties.has(party)) findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.semantic-authority-not-established', 'Explicit endpoint Role material cannot create a Role endpoint when the Handoff does not declare that party as `Kind: role`.', { routeWorkspaceId, routePath, party, explicitCount: entries.length }));
  }
  return Object.freeze((requirements || []).map((requirement) => {
    const party = String(requirement.party || '').trim().toLowerCase();
    const entries = byParty.get(party) || [];
    if (!entries.length) return requirement;
    if (entries.length !== 1) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-binding-ambiguous', 'Exactly one explicit endpoint Role material binding may be supplied for each Role endpoint party.', { routeWorkspaceId, routePath, party, explicitCount: entries.length }));
      return requirement;
    }
    const role = entries[0];
    const explicitLabel = String(role.label || role.roleLabel || '').trim();
    const declaredLabel = String(requirement.roleLabel || requirement.name || '').trim();
    if (explicitLabel && normalizeRoleLabel(explicitLabel) !== normalizeRoleLabel(declaredLabel)) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-label-mismatch', 'Explicit endpoint Role material label contradicts the Handoff endpoint label.', { routeWorkspaceId, routePath, party, handoffRoleLabel: declaredLabel, explicitRoleLabel: explicitLabel }));
      return requirement;
    }
    const targetWorkspaceId = String(role.workspaceId || role.targetWorkspaceId || '').trim();
    const targetPath = normalizeRelativePath(role.path || role.targetPath || '');
    if (!targetWorkspaceId || !targetPath) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-material-unresolved', 'Explicit endpoint Role material binding must identify one exact carried Workspace id and Role artifact path.', { routeWorkspaceId, routePath, party, targetWorkspaceId, targetPath }));
      return requirement;
    }
    const explicitReference = String(role.reference || role.referenceTarget || '').trim();
    const qualifiedReference = explicitReference ? parseWorkspaceQualifiedReference(explicitReference) : null;
    if (qualifiedReference && (qualifiedReference.workspaceId !== targetWorkspaceId || normalizeRelativePath(qualifiedReference.path) !== targetPath)) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-reference-mismatch', 'Explicit endpoint Role reference contradicts its exact carried Workspace/path binding.', { routeWorkspaceId, routePath, party, reference: explicitReference, targetWorkspaceId, targetPath }));
      return requirement;
    }
    const targetRuntime = workspaceRuntimeById.get(targetWorkspaceId);
    const targetEntry = targetRuntime ? entryFromEnumeration(targetRuntime.enumeration, targetPath) : null;
    const targetMarkdown = targetEntry ? decodeUtf8(targetEntry.data) : '';
    const parsedTarget = targetMarkdown ? parseRoleMaterial({ path: targetPath, markdown: targetMarkdown, explicit: false }) : null;
    if (!parsedTarget || parsedTarget.schemaId !== 'tiinex.party.role.v1' || !parsedTarget.label) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-role-material-invalid', 'Explicit endpoint Role material binding must resolve to one exact qualified Role artifact.', { routeWorkspaceId, routePath, party, targetWorkspaceId, targetPath }));
      return requirement;
    }
    if (normalizeRoleLabel(parsedTarget.label) !== normalizeRoleLabel(declaredLabel)) {
      findings.push(finding('error', 'portable.handoff-manufacture.endpoint-role.explicit-material-label-mismatch', 'Exact endpoint Role material contradicts the Handoff endpoint label.', { routeWorkspaceId, routePath, party, handoffRoleLabel: declaredLabel, materialRoleLabel: parsedTarget.label, targetWorkspaceId, targetPath }));
      return requirement;
    }
    return Object.freeze({
      ...requirement,
      targetWorkspaceId,
      targetPath,
      explicitTransportBinding: Object.freeze({
        basis: 'explicit-route-endpoint-role-material-binding',
        routeWorkspaceId,
        routePath,
        party,
        roleLabel: declaredLabel,
        targetWorkspaceId,
        targetPath
      })
    });
  }));
}

function resolveNearestQualifiedTaskRecord({ workspaceId, path: sourcePath, workspaceRuntimeById }) {
  let currentWorkspaceId = String(workspaceId || '').trim();
  let currentPath = normalizeRelativePath(sourcePath);
  let expectedSchemaId = '';
  const visited = new Set();
  for (let depth = 0; depth < 256; depth += 1) {
    const key = routeKey(currentWorkspaceId, currentPath);
    if (!currentWorkspaceId || !currentPath || visited.has(key)) return noQualifiedTask();
    visited.add(key);
    const runtime = workspaceRuntimeById.get(currentWorkspaceId);
    const entry = runtime ? entryFromEnumeration(runtime.enumeration, currentPath) : null;
    if (!entry) return noQualifiedTask();
    const markdown = decodeUtf8(entry.data);
    if (!markdown) return expectedSchemaId === 'tiinex.task.v1'
      ? blockedTaskQualification({ currentWorkspaceId, currentPath, expectedSchemaId, reasons: ['task-target-unreadable'] })
      : noQualifiedTask();
    let parsed;
    try { parsed = parseArtifactMarkdown(markdown); } catch {
      return expectedSchemaId === 'tiinex.task.v1'
        ? blockedTaskQualification({ currentWorkspaceId, currentPath, expectedSchemaId, reasons: ['task-target-unparseable'] })
        : noQualifiedTask();
    }
    const schemaId = String(parsed.envelope?.current?.schema?.id || '');
    if (expectedSchemaId === 'tiinex.task.v1' && schemaId !== 'tiinex.task.v1') {
      return blockedTaskQualification({ currentWorkspaceId, currentPath, expectedSchemaId, actualSchemaId: schemaId, markdown, reasons: ['task-schema-mismatch'] });
    }
    if (schemaId === 'tiinex.task.v1') {
      const self = validatedC14nV2PrimarySelfDigest(markdown);
      const validationFindings = taskValidate(parsed);
      const taskErrors = validationFindings.filter((item) => String(item?.severity || '') === 'error');
      const reasons = [];
      if (!parsed.hasContinuityContext) reasons.push('task-continuity-context-missing');
      if (!parsed.hasIntegrity) reasons.push('task-integrity-section-missing');
      if (String(self.state || '') !== 'verified') reasons.push(`task-self-integrity-${String(self.state || 'unavailable')}`);
      for (const item of taskErrors) reasons.push(`task-schema:${String(item.code || 'validation-error')}`);
      if (reasons.length) {
        return blockedTaskQualification({ currentWorkspaceId, currentPath, expectedSchemaId: expectedSchemaId || 'tiinex.task.v1', actualSchemaId: schemaId, markdown, selfIntegrityState: String(self.state || 'unavailable'), reasons });
      }
      const task = Object.freeze({
        id: `${currentWorkspaceId}/${currentPath}`,
        path: `${currentWorkspaceId}/${currentPath}`,
        workspaceId: currentWorkspaceId,
        workspaceRelativePath: currentPath,
        schemaId,
        markdown,
        hasContinuityContext: true,
        hasIntegrity: true
      });
      return Object.freeze({ state: 'qualified', task, candidate: task, expectedSchemaId: expectedSchemaId || 'tiinex.task.v1', actualSchemaId: schemaId, selfIntegrityState: 'verified', reasons: Object.freeze([]) });
    }
    const parent = parsed.envelope?.parent || {};
    const reference = String(parent.trace || (parent.originEntries || []).find((item) => String(item?.label || '').trim() === 'relative')?.target || '').trim();
    if (!reference) return noQualifiedTask();
    expectedSchemaId = String(parent.schema?.id || '').trim();
    const qualified = parseWorkspaceQualifiedReference(reference);
    if (qualified) {
      currentWorkspaceId = qualified.workspaceId;
      currentPath = normalizeRelativePath(qualified.path);
      continue;
    }
    if (isExternalReference(reference) || reference.startsWith('#')) return noQualifiedTask();
    const resolved = resolveRelativeWorkspaceTarget(currentPath, reference);
    if (!resolved) return noQualifiedTask();
    currentPath = resolved;
  }
  return noQualifiedTask();
}

function noQualifiedTask() {
  return Object.freeze({ state: 'not-established', task: null, candidate: null, expectedSchemaId: '', actualSchemaId: '', selfIntegrityState: 'unavailable', reasons: Object.freeze([]) });
}

function blockedTaskQualification({ currentWorkspaceId = '', currentPath = '', expectedSchemaId = 'tiinex.task.v1', actualSchemaId = '', markdown = '', selfIntegrityState = 'unavailable', reasons = [] } = {}) {
  const candidate = Object.freeze({
    id: currentWorkspaceId && currentPath ? `${currentWorkspaceId}/${currentPath}` : '',
    path: currentWorkspaceId && currentPath ? `${currentWorkspaceId}/${currentPath}` : '',
    workspaceId: currentWorkspaceId,
    workspaceRelativePath: currentPath,
    markdown
  });
  return Object.freeze({ state: 'blocked', task: null, candidate, expectedSchemaId, actualSchemaId, selfIntegrityState, reasons: Object.freeze([...reasons]) });
}

function qualifiedRouteRoleMaterials({ requirements = {}, materials = [], routeWorkspaceId, routePath }) {
  const byId = new Map();
  for (const key of ['required', 'reference', 'endpointRoles']) {
    for (const requirement of requirements[key] || []) {
      if (String(requirement.routeWorkspaceId || '') !== routeWorkspaceId || normalizeRelativePath(requirement.routePath || '') !== routePath) continue;
      byId.set(String(requirement.id || ''), requirement);
    }
  }
  const out = [];
  for (const material of materials || []) {
    const requirement = byId.get(String(material.requirementId || ''));
    if (!requirement) continue;
    const markdown = decodeUtf8(material.data);
    if (!markdown) continue;
    const parsed = parseRoleMaterial({ path: String(material.path || requirement.reference?.target || requirement.name || ''), markdown, explicit: false });
    if (!parsed || parsed.schemaId !== 'tiinex.party.role.v1' || !parsed.label) continue;
    const actualSha = String(material.sha256 || sha256Hex(packageFileBytes(material))).trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/u.test(actualSha) || parsed.sha256 !== actualSha) continue;
    const sourceWorkspaceId = String(material.provenance?.workspaceId || requirement.targetWorkspaceId || '').trim();
    const sourcePath = normalizeRelativePath(material.provenance?.path || requirement.targetPath || material.path || '');
    const reference = String(requirement.reference?.target || (sourceWorkspaceId && sourcePath ? `${sourceWorkspaceId}::${sourcePath}` : '')).trim();
    if (!sourceWorkspaceId || !sourcePath || !reference) continue;
    out.push(Object.freeze({
      label: parsed.label,
      roleKind: parsed.roleKind,
      sha256: actualSha,
      workspaceId: sourceWorkspaceId,
      path: sourcePath,
      reference,
      requirementId: String(requirement.id || ''),
      classification: String(requirement.classification || '')
    }));
  }
  return Object.freeze(out);
}

function semanticParticipantDescriptor(routeWorkspaceId, routePath, declaration, role) {
  return Object.freeze({
    label: role.label,
    workspaceId: role.workspaceId,
    path: role.path,
    reference: role.reference,
    semanticAuthority: Object.freeze({
      basis: 'exact-current-work-participant-declaration-plus-exact-qualified-role-material',
      routeWorkspaceId,
      routePath,
      declarationSourceArtifact: declaration.sourceArtifact,
      declaration: declaration.declaration,
      roleSourceArtifact: Object.freeze({ workspaceId: role.workspaceId, path: role.reference, sha256: role.sha256, schemaId: 'tiinex.party.role.v1' })
    })
  });
}

function validateExplicitParticipantInputs(explicit = [], semantic = [], routeWorkspaceId = '', routePath = '') {
  if (!explicit.length) return Object.freeze({ valid: true, findings: Object.freeze([]) });
  const findings = [];
  if (explicit.length !== semantic.length) findings.push(finding('error', 'portable.handoff-manufacture.participant-role.explicit-set-cardinality-mismatch', 'Explicit route-level participant Role input must match the exact qualified semantic participant set; missing or extra participant Role input is not accepted.', { routeWorkspaceId, routePath, explicitCount: explicit.length, semanticCount: semantic.length }));
  const remaining = [...semantic];
  for (const entry of explicit) {
    const normalized = normalizeExplicitParticipantInput(entry);
    const index = remaining.findIndex((candidate) => explicitMatchesSemantic(normalized, candidate));
    if (index < 0) {
      findings.push(finding('error', 'portable.handoff-manufacture.participant-role.explicit-set-mismatch', 'Explicit route-level participant Role input does not match an exact qualified semantic participant Role artifact for this route.', { routeWorkspaceId, routePath, explicit: normalized }));
      continue;
    }
    remaining.splice(index, 1);
  }
  if (remaining.length) findings.push(finding('error', 'portable.handoff-manufacture.participant-role.explicit-set-missing', 'Explicit route-level participant Role input omits one or more exact qualified semantic participant Roles.', { routeWorkspaceId, routePath, missing: remaining.map((item) => ({ label: item.label, workspaceId: item.workspaceId, path: item.path })) }));
  return Object.freeze({ valid: findings.length === 0, findings: Object.freeze(findings) });
}

function normalizeExplicitParticipantInput(value) {
  const role = typeof value === 'string' ? { reference: value } : (value || {});
  const rawReference = String(role.reference || role.referenceTarget || '').trim();
  const qualified = parseWorkspaceQualifiedReference(rawReference);
  return Object.freeze({
    label: String(role.label || role.roleLabel || '').trim(),
    workspaceId: String(role.workspaceId || role.targetWorkspaceId || qualified?.workspaceId || '').trim(),
    path: normalizeRelativePath(role.path || role.targetPath || qualified?.path || ''),
    reference: rawReference
  });
}

function explicitMatchesSemantic(explicit, semantic) {
  if (explicit.label && normalizeRoleLabel(explicit.label) !== normalizeRoleLabel(semantic.label)) return false;
  if (explicit.workspaceId && explicit.workspaceId !== semantic.workspaceId) return false;
  if (explicit.path && explicit.path !== normalizeRelativePath(semantic.path)) return false;
  if (explicit.reference) {
    const qualified = parseWorkspaceQualifiedReference(explicit.reference);
    if (qualified) return qualified.workspaceId === semantic.workspaceId && normalizeRelativePath(qualified.path) === normalizeRelativePath(semantic.path);
    if (explicit.reference !== semantic.reference) return false;
  }
  return Boolean(explicit.label || explicit.workspaceId || explicit.path || explicit.reference);
}

function groupParticipantDeclarations(declarations = []) {
  const grouped = new Map();
  for (const declaration of declarations || []) {
    const key = normalizeRoleLabel(declaration.roleLabel);
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(declaration);
  }
  return grouped;
}

function dedupeQualifiedRoleMaterials(roles = []) {
  const map = new Map();
  for (const role of roles || []) {
    const key = `${normalizeRoleLabel(role.label)}\u0000${String(role.sha256 || '')}\u0000${String(role.workspaceId || '')}\u0000${normalizeRelativePath(role.path || '')}`;
    if (!map.has(key)) map.set(key, role);
  }
  return [...map.values()];
}

function routeKey(workspaceId = '', routePath = '') { return `${String(workspaceId || '').trim()}\u0000${normalizeRelativePath(routePath)}`; }
function normalizeRoleLabel(value = '') { return String(value || '').trim().toLowerCase(); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }

function scopeRouteRequirement(requirement, routeWorkspaceId, routePath, preserveId = false) {
  return Object.freeze({
    ...requirement,
    id: preserveId ? String(requirement.id || '') : `route:${safeWorkspaceToken(routeWorkspaceId)}:${safeWorkspaceToken(routePath)}:${String(requirement.id || '')}`,
    sourceRequirementId: String(requirement.sourceRequirementId || requirement.id || ''),
    routeWorkspaceId,
    routePath
  });
}

export async function resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, bindings = {}) {
  const out = [];
  for (const requirement of [...(requirements.required || []), ...(requirements.reference || []), ...(requirements.endpointRoles || []), ...(requirements.participantRoles || []), ...(requirements.dependencies || [])]) {
    const explicit = bindingForRequirement(bindings, requirement);
    if (explicit) {
      const workspaceBound = materialCandidateFromWorkspaceBinding(requirement, explicit, workspaceRuntimeById);
      if (workspaceBound) { out.push(workspaceBound); continue; }
      const owner = workspaceRuntimeById.get(String(requirement.routeWorkspaceId || '')) || [...workspaceRuntimeById.values()][0];
      const candidate = await materialCandidateFromBinding(requirement, explicit, owner?.root || '.');
      if (candidate) out.push(candidate);
      continue;
    }
    const targetWorkspaceId = String(requirement.targetWorkspaceId || '').trim();
    const targetPath = normalizeRelativePath(requirement.targetPath || '');
    if (targetWorkspaceId && targetPath) {
      const targetRuntime = workspaceRuntimeById.get(targetWorkspaceId);
      const entry = targetRuntime ? entryFromEnumeration(targetRuntime.enumeration, targetPath) : null;
      if (entry) {
        out.push(materialCandidateFromWorkspaceEntry(requirement, targetWorkspaceId, targetPath, entry, targetRuntime.enumeration, targetRuntime));
        continue;
      }
    }
    const target = String(requirement.reference?.target || '');
    if (!target) continue;
    const workspaceQualified = resolveCarriedWorkspaceQualifiedReference(target, workspaceRuntimeById);
    if (workspaceQualified) {
      const targetRuntime = workspaceRuntimeById.get(workspaceQualified.workspaceId);
      const entry = targetRuntime ? entryFromEnumeration(targetRuntime.enumeration, workspaceQualified.path) : null;
      if (entry) out.push(materialCandidateFromWorkspaceEntry(requirement, workspaceQualified.workspaceId, workspaceQualified.path, entry, targetRuntime.enumeration, targetRuntime));
      continue;
    }
    if (isExternalReference(target) || target.startsWith('#')) continue;
    const routeWorkspaceId = String(requirement.routeWorkspaceId || [...workspaceRuntimeById.keys()][0] || '');
    const runtime = workspaceRuntimeById.get(routeWorkspaceId);
    if (!runtime) continue;
    if (!runtime.root) {
      const relative = resolveRelativeWorkspaceTarget(String(requirement.routePath || ''), target);
      if (!relative) continue;
      const entry = entryFromEnumeration(runtime.enumeration, relative);
      if (!entry) continue;
      out.push(materialCandidateFromWorkspaceEntry(requirement, routeWorkspaceId, relative, entry, runtime.enumeration, runtime));
      continue;
    }
    const handoffDir = path.dirname(path.resolve(runtime.root, String(requirement.routePath || '')));
    const absolute = path.resolve(handoffDir, decodeURIComponent(target.split('#')[0]));
    if (!inside(runtime.root, absolute)) continue;
    const relative = normalizeRelativePath(path.relative(runtime.root, absolute));
    const entry = entryFromEnumeration(runtime.enumeration, relative);
    if (!entry) continue;
    out.push(materialCandidateFromWorkspaceEntry(requirement, routeWorkspaceId, relative, entry, runtime.enumeration, runtime));
  }
  return out;
}


export async function expandPointerDependencyClosure(input = {}) {
  let requirements = input.requirements || {};
  let materials = [...(input.materials || [])];
  const dependencies = [...(requirements.dependencies || [])];
  const findings = [...(requirements.findings || [])];
  const seenSourceTargets = new Set();
  const seenDependencyIds = new Set(dependencies.map((item) => String(item.id || '')));
  const maxDependencies = 128;

  for (let cursor = 0; cursor < materials.length; cursor += 1) {
    const material = materials[cursor];
    const requirement = findRequirement(requirements, material.requirementId, dependencies);
    if (!requirement) continue;
    const markdown = decodeUtf8(material.data);
    if (!isTiinexPointerMarkdown(markdown)) continue;
    const targets = pointerDependencyTargets(markdown);
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const dedupeKey = `${material.sha256 || sha256Hex(packageFileBytes(material))}\u0000${target}`;
      if (seenSourceTargets.has(dedupeKey)) continue;
      seenSourceTargets.add(dedupeKey);
      if (dependencies.length >= maxDependencies) throw new Error('portable.handoff-manufacture.pointer-dependency.limit-exceeded');
      const derived = derivePointerDependencyRequirement({ sourceRequirement: requirement, sourceMaterial: material, target, index, workspaceRuntimeById: input.workspaceRuntimeById });
      if (seenDependencyIds.has(derived.id)) continue;
      seenDependencyIds.add(derived.id);
      dependencies.push(derived);
      const resolved = await resolveDerivedDependencyMaterial(derived, material, input.workspaceRuntimeById, input.bindings || {});
      if (resolved) materials.push(resolved);
    }
  }

  requirements = Object.freeze({
    ...requirements,
    dependencies: Object.freeze(dependencies),
    counts: Object.freeze({ ...(requirements.counts || {}), dependencies: dependencies.length }),
    findings: Object.freeze(findings)
  });
  return Object.freeze({ requirements, materials: Object.freeze(materials) });
}

function findRequirement(requirements = {}, requirementId = '', pendingDependencies = []) {
  const id = String(requirementId || '');
  const pending = (pendingDependencies || []).find((item) => String(item.id || '') === id);
  if (pending) return pending;
  for (const key of ['required', 'reference', 'endpointRoles', 'participantRoles', 'dependencies']) {
    const found = (requirements[key] || []).find((item) => String(item.id || '') === id);
    if (found) return found;
  }
  return null;
}

function derivePointerDependencyRequirement({ sourceRequirement = {}, sourceMaterial = {}, target = '', index = 0, workspaceRuntimeById = new Map() }) {
  const routeWorkspaceId = String(sourceRequirement.routeWorkspaceId || sourceMaterial.provenance?.workspaceId || '').trim();
  const routePath = String(sourceRequirement.routePath || '').trim();
  let targetWorkspaceId = '';
  let targetPath = '';
  const workspaceQualified = resolveCarriedWorkspaceQualifiedReference(target, workspaceRuntimeById);
  if (workspaceQualified) {
    targetWorkspaceId = workspaceQualified.workspaceId;
    targetPath = workspaceQualified.path;
  } else if (!isExternalReference(target) && !String(target).startsWith('#')) {
    const sourceWorkspaceId = String(sourceMaterial.provenance?.workspaceId || '').trim();
    const sourceWorkspacePath = normalizeRelativePath(sourceMaterial.provenance?.path || sourceMaterial.path || '');
    if (sourceWorkspaceId && sourceWorkspacePath && workspaceRuntimeById.has(sourceWorkspaceId)) {
      const relative = resolveRelativeWorkspaceTarget(sourceWorkspacePath, target);
      if (relative) {
        targetWorkspaceId = sourceWorkspaceId;
        targetPath = relative;
      }
    }
  }
  const sourceRequirementId = String(sourceRequirement.id || 'pointer');
  const id = `pointer-target:${safeWorkspaceToken(sourceRequirementId)}:${index + 1}:${sha256Text(target).slice(0, 12)}`;
  return Object.freeze({
    id,
    name: `Pointer target ${index + 1} from ${String(sourceRequirement.name || sourceRequirementId)}`,
    classification: 'pointer-target',
    material: 'exact Pointer target dependency',
    purpose: 'recursive package-local dependency closure for carried Tiinex Pointer material',
    availability: 'declared',
    materialReference: String(target),
    reference: Object.freeze({ form: isExternalReference(target) ? 'external-target' : 'pointer-target', raw: String(target), label: '', target: String(target), exactTargetDeclared: true }),
    routeWorkspaceId,
    routePath,
    targetWorkspaceId,
    targetPath,
    sourceRequirementId,
    source: null,
    fields: Object.freeze({ RouteWorkspace: routeWorkspaceId, RoutePath: routePath, SourceRequirement: sourceRequirementId, TargetWorkspace: targetWorkspaceId, TargetPath: targetPath, Reference: String(target) })
  });
}

async function resolveDerivedDependencyMaterial(requirement, sourceMaterial, workspaceRuntimeById, bindings) {
  const explicit = bindingForRequirement(bindings, requirement);
  if (explicit) {
    const workspaceBound = materialCandidateFromWorkspaceBinding(requirement, explicit, workspaceRuntimeById);
    if (workspaceBound) return workspaceBound;
    const owner = workspaceRuntimeById.get(String(requirement.routeWorkspaceId || '')) || [...workspaceRuntimeById.values()][0];
    return materialCandidateFromBinding(requirement, explicit, owner?.root || '.');
  }
  if (requirement.targetWorkspaceId && requirement.targetPath) {
    const runtime = workspaceRuntimeById.get(String(requirement.targetWorkspaceId));
    const entry = runtime ? entryFromEnumeration(runtime.enumeration, requirement.targetPath) : null;
    if (entry) return materialCandidateFromWorkspaceEntry(requirement, requirement.targetWorkspaceId, requirement.targetPath, entry, runtime.enumeration, runtime);
  }
  const target = String(requirement.reference?.target || '');
  const sourcePath = String(sourceMaterial.provenance?.sourcePath || '').trim();
  if (sourcePath && !isExternalReference(target) && !target.startsWith('#')) {
    const clean = safeDecodeURIComponent(target.split('#')[0].split('?')[0]);
    if (clean && !path.isAbsolute(clean)) {
      const absolute = path.resolve(path.dirname(sourcePath), clean);
      if (await regularFileExists(absolute)) {
        return materialCandidateFromBinding(requirement, { sourcePath: absolute, referenceTarget: target }, '.');
      }
    }
  }
  return null;
}

function bindingForRequirement(bindings = {}, requirement = {}) {
  const target = String(requirement.reference?.target || requirement.referenceTarget || '');
  return bindings[requirement.id] || bindings[requirement.name] || (target ? bindings[target] : null) || null;
}

function isTiinexPointerMarkdown(markdown = '') {
  if (!markdown) return false;
  try { return String(parseArtifactMarkdown(markdown).envelope?.current?.schema?.id || '').trim() === 'tiinex.pointer.v1'; }
  catch { return false; }
}

function pointerDependencyTargets(markdown = '') {
  const out = [];
  for (const heading of ['Destinations', 'Current Origin']) {
    const section = markdownSection(markdown, heading);
    const links = /\[[^\]\r\n]+\]\(([^)\r\n]+)\)/g;
    let match;
    while ((match = links.exec(section))) {
      const target = String(match[1] || '').trim();
      if (target && !target.startsWith('#')) out.push(target);
    }
  }
  return [...new Set(out)];
}

function markdownSection(markdown = '', heading = '') {
  const source = String(markdown || '');
  const match = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'mi').exec(source);
  if (!match) return '';
  const rest = source.slice(match.index + match[0].length);
  const next = /^#{1,2}\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}


function resolveCarriedWorkspaceQualifiedReference(target = '', workspaceRuntimeById = new Map()) {
  const parsed = parseWorkspaceQualifiedReference(target);
  return parsed && workspaceRuntimeById?.has?.(parsed.workspaceId) ? parsed : null;
}

export function resolveRelativeWorkspaceTarget(sourcePath = '', target = '') {
  const raw = safeDecodeURIComponent(String(target || '').split('#')[0].split('?')[0]);
  if (!raw || path.posix.isAbsolute(raw) || raw.startsWith('\\') || raw.includes('::')) return '';
  const base = normalizeRelativePath(sourcePath).split('/').slice(0, -1);
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); }
    else base.push(part);
  }
  return normalizeRelativePath(base.join('/'));
}

async function regularFileExists(absolute) {
  try { await access(absolute); return (await stat(absolute)).isFile(); }
  catch { return false; }
}


export function decodeUtf8(value) { try { return new TextDecoder('utf-8', { fatal: true }).decode(packageFileBytes({ data: value })); } catch { return ''; } }
function safeDecodeURIComponent(value = '') { try { return decodeURIComponent(value); } catch { return ''; } }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function entryFromEnumeration(enumeration = {}, relative = '') {
  const normalized = normalizeRelativePath(relative);
  const matches = (enumeration.materialization?.entries || []).filter((entry) => normalizeRelativePath(entry.path) === normalized);
  return matches.length === 1 ? matches[0] : null;
}

export function materialCandidateFromWorkspaceEntry(requirement, workspaceId, relative, entry, enumeration, runtime = {}) {
  const packageParentProvider = String(runtime.provider || '').startsWith('qualified-package-parent-workspace');
  const materializationSource = enumeration?.materialization?.source || {};
  const provenance = packageParentProvider
    ? Object.freeze({
        workspaceId,
        path: relative,
        boundary: '.',
        parentPackagePath: String(materializationSource.parentPackagePath || ''),
        parentPackageSha256: String(materializationSource.parentPackageSha256 || ''),
        parentWorkspaceArchivePath: String(materializationSource.parentWorkspaceArchivePath || '')
      })
    : Object.freeze({ workspaceId, path: relative, boundary: '.' });
  return Object.freeze({
    requirementId: requirement.id,
    referenceTarget: String(requirement.reference?.target || requirement.referenceTarget || ''),
    path: relative,
    data: entry.data,
    bytes: entry.bytes,
    sha256: entry.sha256,
    mediaType: entry.mediaType,
    providerId: packageParentProvider ? 'package-parent-workspace-enumerator' : 'node-workspace-enumerator',
    providerKind: packageParentProvider ? 'qualified-package-parent-workspace' : 'qualified-local-workspace',
    provenance,
    authority: Object.freeze({
      localIdentityQualified: true,
      packageParentWorkspaceQualified: packageParentProvider,
      completenessEvidenceFingerprint: enumeration.evidence.entriesFingerprint
    })
  });
}


function materialCandidateFromWorkspaceBinding(requirement, binding, workspaceRuntimeById) {
  if (!binding || typeof binding !== 'object') return null;
  const workspaceId = String(binding.workspaceId || binding.targetWorkspaceId || '').trim();
  const relative = normalizeRelativePath(binding.workspacePath || binding.targetPath || (workspaceId ? binding.path : ''));
  if (!workspaceId || !relative) return null;
  const runtime = workspaceRuntimeById.get(workspaceId);
  const entry = runtime ? entryFromEnumeration(runtime.enumeration, relative) : null;
  if (!entry) return null;
  return materialCandidateFromWorkspaceEntry(requirement, workspaceId, relative, entry, runtime.enumeration, runtime);
}

async function materialCandidateFromBinding(requirement, binding, workspaceRoot) {
  if (typeof binding === 'string') {
    const absolute = path.resolve(workspaceRoot, binding);
    assertInside(workspaceRoot, absolute, 'portable.handoff-manufacture.material-binding.outside-workspace');
    const data = new Uint8Array(await readFile(absolute));
    return Object.freeze({ requirementId: requirement.id, referenceTarget: String(requirement.reference?.target || ''), path: normalizeRelativePath(path.relative(workspaceRoot, absolute)), data, providerId: 'node-explicit-material-binding', providerKind: 'qualified-local-workspace', authority: Object.freeze({ localIdentityQualified: true }) });
  }
  if (!binding || typeof binding !== 'object') return null;
  if (binding.sourcePath || binding.absolutePath) {
    const sourcePath = path.resolve(String(binding.sourcePath || binding.absolutePath));
    const data = new Uint8Array(await readFile(sourcePath));
    return Object.freeze({ ...binding, requirementId: requirement.id, referenceTarget: String(binding.referenceTarget || requirement.reference?.target || ''), path: normalizeRelativePath(sourcePath), data, bytes: data.byteLength, sha256: sha256Hex(data), providerId: String(binding.providerId || 'node-explicit-external-material-binding'), providerKind: String(binding.providerKind || 'supplied-external-material'), provenance: Object.freeze({ ...(binding.provenance || {}), sourcePath, boundary: 'explicit-material-binding' }), authority: Object.freeze({ ...(binding.authority || {}), localIdentityQualified: true }) });
  }
  if (binding.path) return materialCandidateFromBinding(requirement, String(binding.path), workspaceRoot);
  const data = packageFileBytes(binding);
  return Object.freeze({ ...binding, requirementId: requirement.id, referenceTarget: String(binding.referenceTarget || requirement.reference?.target || ''), data, providerId: String(binding.providerId || 'node-explicit-material-binding'), providerKind: String(binding.providerKind || 'supplied-material'), authority: Object.freeze({ ...(binding.authority || {}), localIdentityQualified: binding.authority?.localIdentityQualified === true || !requirement.reference?.target }) });
}

async function readWorkspaceText(root, relative, code) {
  const absolute = path.resolve(root, relative);
  assertInside(root, absolute, `${code}.outside-workspace`);
  return readFile(absolute, 'utf8');
}

async function readWorkspaceRuntimeText(runtime, relative, code) {
  if (runtime?.root) return readWorkspaceText(runtime.root, relative, code);
  const entry = entryFromEnumeration(runtime?.enumeration, relative);
  if (!entry) throw new Error(`${code}.unresolved`);
  const markdown = decodeUtf8(entry.data);
  if (!markdown) throw new Error(`${code}.non-text`);
  return markdown;
}


export function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
export function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
export function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:/i.test(String(value || '')) || String(value || '').startsWith('//'); }
export function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
export function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
