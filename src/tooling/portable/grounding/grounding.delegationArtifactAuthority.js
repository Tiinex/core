import { posix } from 'node:path';
import { sha256Hex } from '../../../export/package.bytes.js';
import { parseRoleMaterial } from '../handoff/coldStartQualification.materials.js';

export function projectGroundingDelegationArtifactAuthority({ authority = null, records = [], topology = {}, sourceEvidence = null, requiredContext = [] } = {}) {
  const unresolved = [];
  const handoff = authority?.handoff || null;
  const recipientRole = authority?.role || null;
  const senderRole = authority?.senderRole || null;
  if (!handoff || String(handoff.schemaId || '') !== 'tiinex.handoff.v1') return empty('selected-qualified-handoff-not-established');

  const transferSelection = selectControllingTransfer(handoff, records, topology);
  if (!transferSelection) unresolved.push('forward-controlling-transfer-not-established');
  const recipient = qualifiedRole(recipientRole, handoff.toReference || '');
  if (!recipient) unresolved.push('exact-recipient-role-authority-not-established');
  const sender = qualifiedRole(senderRole, handoff.fromReference || '');
  if (!sender) unresolved.push('exact-sender-role-authority-not-established');

  const delegateSelection = transferSelection ? selectForwardDelegate(transferSelection.record, authority, requiredContext) : null;
  if (transferSelection && !delegateSelection?.selector) unresolved.push('forward-delegate-selector-not-established');
  if (delegateSelection?.selector && !delegateSelection?.role) unresolved.push('exact-forward-selected-delegate-role-authority-not-established');

  const taskRecord = transferSelection?.record || null;
  const targetWorkspaceId = String(taskRecord?.path || '').split('/')[0] || '';
  const workspaceSource = (sourceEvidence?.workspaces || []).find((item) => String(item.workspace || '') === targetWorkspaceId && ['qualified', 'explicit-profile'].includes(String(item.state || ''))) || null;
  if (!workspaceSource?.repository) unresolved.push('exact-target-repository-authority-not-established');

  const delegateCapabilityAuthority = delegateSelection?.role && delegateSelection?.selector && transferSelection
    ? delegateProjection(delegateSelection.role, handoff, transferSelection, delegateSelection.selector)
    : null;
  if (!delegateCapabilityAuthority) unresolved.push('delegate-capability-artifact-projection-not-established');

  const processApplicability = sender && transferSelection ? processProjection(sender, handoff, transferSelection) : null;
  if (!processApplicability) unresolved.push('delegation-applicability-artifact-projection-not-established');

  const delegationTargetAuthority = taskRecord && workspaceSource && transferSelection
    ? targetProjection(taskRecord, workspaceSource, handoff, transferSelection)
    : null;
  if (!delegationTargetAuthority) unresolved.push('delegation-target-artifact-projection-not-established');

  const implementationSourceAuthority = taskRecord && recipient && transferSelection
    ? sourceProjection(taskRecord, recipient, handoff, transferSelection)
    : null;
  if (!implementationSourceAuthority) unresolved.push('implementation-source-artifact-projection-not-established');

  const delegationReturnReconciliationExpectation = transferSelection
    ? returnProjection(handoff, transferSelection)
    : null;
  if (!delegationReturnReconciliationExpectation) unresolved.push('return-reconciliation-artifact-projection-not-established');

  const ready = Boolean(delegateCapabilityAuthority && processApplicability && delegationTargetAuthority && implementationSourceAuthority && delegationReturnReconciliationExpectation);
  return Object.freeze({
    state: ready ? 'qualified-forward-artifact-closure' : 'not-established',
    delegateCapabilityAuthority,
    processApplicability,
    delegationTargetAuthority,
    implementationSourceAuthority,
    delegationReturnReconciliationExpectation,
    unresolved: Object.freeze([...new Set(unresolved)].map((code) => Object.freeze({ code }))),
    provenance: Object.freeze({
      basis: 'exact-qualified-forward-selected-artifact-chain',
      selectedHandoff: sourceArtifactFromHandoff(handoff),
      controllingTask: taskRecord ? sourceArtifactFromRecord(taskRecord) : null,
      senderRole: sender ? sender.sourceArtifact : null,
      recipientRole: recipient ? recipient.sourceArtifact : null,
      delegateSelector: delegateSelection?.selector || null,
      delegateRole: delegateSelection?.role?.sourceArtifact || null,
      boundary: 'Projection only. The inbound Handoff recipient/current holder and downstream specialist are independent claims. The downstream Role is resolved only after one exact explicit selector declaration on the controlling current Task; route-bounded Role material then qualifies that already-selected Role. Role/cache inventory, endpoint identity, filenames, adjacency and arbitrary prose are never used to choose a delegate.'
    }),
    boundary: 'Artifact-derived delegation closure is available only from the exact selected forward chain. The current-work declaration selects the downstream Role; exact Role material qualifies capability. Inbound recipient/holder identity, Role-cache carriage, process applicability, source permission and return authority remain separate.'
  });
}

function selectControllingTransfer(handoff, records, topology) {
  const handoffPath = qualifiedHandoffPath(handoff);
  const frontierPaths = new Set((topology?.currentFrontier || []).flatMap((item) => [String(item.path || ''), String(item.resolvedPath || '')]).filter(Boolean));
  const candidates = [];
  for (const transfer of handoff.transfers || []) {
    const target = String(transfer.controllingArtifactTarget || '').trim();
    if (!target) continue;
    const resolved = resolveReference(target, handoffPath);
    if (!resolved) continue;
    const matches = (records || []).filter((record) => String(record.path || '') === resolved && String(record.schemaId || '') === 'tiinex.task.v1' && record.hasContinuityContext && record.hasIntegrity);
    if (matches.length !== 1) continue;
    if (frontierPaths.size && !frontierPaths.has(resolved) && !frontierPaths.has(String(matches[0].id || ''))) continue;
    candidates.push(Object.freeze({ transfer, record: matches[0], resolvedPath: resolved }));
  }
  return candidates.length === 1 ? candidates[0] : null;
}

function qualifiedRole(role, declaredReference = '') {
  const artifact = role?.material?.artifact || null;
  if (String(role?.state || '') !== 'qualified' || String(role?.material?.state || '') !== 'qualified' || !artifact) return null;
  const sha256 = String(artifact.sha256 || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/i.test(sha256)) return null;
  const reference = String(artifact.reference || declaredReference || '').trim();
  if (!reference) return null;
  return Object.freeze({
    label: String(role?.endpoint?.label || artifact.roleLabel || ''),
    kind: String(role?.endpoint?.kind || 'role'),
    roleKind: String(artifact.roleKind || ''),
    boundary: Object.freeze({ ...(role.exactBoundaryLoaded || {}) }),
    authority: Object.freeze({ ...(role.authorityBoundaryLoaded || {}) }),
    sourceArtifact: sourceArtifactFromReference(reference, sha256, String(artifact.schemaId || 'tiinex.party.role.v1'))
  });
}

function selectForwardDelegate(taskRecord, authority = {}, requiredContext = []) {
  const selector = explicitTaskSpecialistSelector(taskRecord);
  if (!selector) return Object.freeze({ selector: null, role: null, candidates: Object.freeze([]) });
  const candidates = exactRouteRoleMaterials(authority, requiredContext).filter((role) => normalize(role.label) === normalize(selector.roleLabel));
  const unique = dedupeRoles(candidates);
  return Object.freeze({ selector, role: unique.length === 1 ? unique[0] : null, candidates: Object.freeze(unique) });
}

function explicitTaskSpecialistSelector(taskRecord = {}) {
  if (String(taskRecord.schemaId || '') !== 'tiinex.task.v1' || !taskRecord.hasContinuityContext || !taskRecord.hasIntegrity) return null;
  const objective = section(taskRecord.markdown || '', 'Objective');
  if (!objective) return null;
  const declarations = objective
    .split(/\r?\n\s*\r?\n/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((paragraph) => {
      if (/\r|\n/u.test(paragraph)) return [];
      const match = paragraph.match(/^(.{1,80}?) is the explicitly selected specialist for this (.{1,120}?)\.$/u);
      if (!match) return [];
      const roleLabel = match[1].trim();
      const scope = match[2].trim();
      if (!roleLabel || !scope || /[\r\n]/u.test(roleLabel)) return [];
      return [Object.freeze({
        state: 'explicit-current-work-selector',
        roleLabel,
        selectorKind: 'explicit-specialist-declaration-paragraph',
        section: 'Objective',
        declaration: paragraph,
        scope,
        sourceArtifact: sourceArtifactFromRecord(taskRecord),
        boundary: 'Closed lexical declaration paragraph only. Core does not interpret surrounding prose: no Role label is searched for, guessed from inventory, inferred from endpoint identity, or recovered from near-match text.'
      })];
    });
  return declarations.length === 1 ? declarations[0] : null;
}

function exactRouteRoleMaterials(authority = {}, requiredContext = []) {
  const roles = [];
  const recipient = qualifiedRole(authority?.role || null, authority?.handoff?.toReference || '');
  const sender = qualifiedRole(authority?.senderRole || null, authority?.handoff?.fromReference || '');
  if (recipient) roles.push(recipient);
  if (sender) roles.push(sender);
  for (const item of authority?.participation?.packageRoleGrounding || []) {
    const role = qualifiedPackageGroundingRole(item);
    if (role) roles.push(role);
  }
  for (const entry of requiredContext || []) {
    const role = qualifiedRequiredContextRole(entry);
    if (role) roles.push(role);
  }
  return Object.freeze(dedupeRoles(roles));
}

function qualifiedPackageGroundingRole(entry = {}) {
  const artifact = entry?.roleArtifact || null;
  if (!entry?.groundingOnly || String(entry?.materialQualification || '') !== 'qualified' || !artifact) return null;
  const sha256 = String(artifact.sha256 || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/iu.test(sha256)) return null;
  const reference = String(artifact.reference || artifact.path || '').trim();
  const label = String(artifact.roleLabel || entry.label || '').trim();
  if (!reference || !label || String(artifact.schemaId || '') !== 'tiinex.party.role.v1') return null;
  return Object.freeze({
    label,
    kind: 'role',
    roleKind: String(artifact.roleKind || ''),
    boundary: Object.freeze({ ...(entry.exactBoundaryLoaded || {}) }),
    authority: Object.freeze({ ...(entry.authorityBoundaryLoaded || {}) }),
    sourceArtifact: sourceArtifactFromReference(reference, sha256, String(artifact.schemaId || 'tiinex.party.role.v1')),
    materialResolution: Object.freeze({ pointerPath: String(entry.pointerPath || ''), groundingOnly: true })
  });
}

function qualifiedRequiredContextRole(entry = {}) {
  if (String(entry.state || '') !== 'qualified' || String(entry.contentState || '') !== 'hydrated-text' || typeof entry.content !== 'string' || !entry.content) return null;
  const parsed = parseRoleMaterial({ path: String(entry.referenceTarget || entry.innerPath || entry.name || ''), markdown: entry.content, explicit: false });
  if (!parsed || parsed.schemaId !== 'tiinex.party.role.v1' || !parsed.label) return null;
  const expectedSha = String(entry.actualSha256 || entry.sha256 || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/iu.test(expectedSha) || parsed.sha256 !== expectedSha) return null;
  const reference = String(entry.referenceTarget || crossWorkspaceReference(entry) || parsed.path || '').trim();
  if (!reference) return null;
  return Object.freeze({
    label: parsed.label,
    kind: 'role',
    roleKind: parsed.roleKind,
    boundary: Object.freeze({ ...(parsed.boundary || {}) }),
    authority: Object.freeze({ ...(parsed.authorityBoundary || {}) }),
    sourceArtifact: sourceArtifactFromReference(reference, expectedSha, 'tiinex.party.role.v1'),
    materialResolution: Object.freeze({
      kind: 'selected-handoff-required-context-role',
      requirementId: String(entry.requirementId || ''),
      providerMode: String(entry.providerMode || ''),
      workspaceId: String(entry.workspaceId || ''),
      innerPath: String(entry.innerPath || '')
    })
  });
}

function crossWorkspaceReference(entry = {}) {
  const workspaceId = String(entry.workspaceId || '').trim();
  const innerPath = String(entry.innerPath || '').trim().replace(/^\/+/, '');
  return workspaceId && innerPath ? `${workspaceId}::${innerPath}` : '';
}

function dedupeRoles(roles = []) {
  const map = new Map();
  for (const role of roles) {
    const key = `${normalize(role?.label)}\u0000${String(role?.sourceArtifact?.path || '')}\u0000${String(role?.sourceArtifact?.sha256 || '')}`;
    if (!map.has(key)) map.set(key, role);
  }
  return [...map.values()];
}

function delegateProjection(role, handoff, selected, selector) {
  const capabilities = [
    role.roleKind ? Object.freeze({ kind: 'role-kind', value: role.roleKind }) : null,
    role.boundary.inScope ? Object.freeze({ kind: 'role-in-scope', value: role.boundary.inScope }) : null,
    role.authority.mayDo ? Object.freeze({ kind: 'role-may-do', value: role.authority.mayDo }) : null
  ].filter(Boolean);
  if (!role.label || !capabilities.length) return null;
  return Object.freeze({
    explicit: true,
    qualification: 'qualified',
    delegate: Object.freeze({ label: role.label, kind: role.kind || 'role' }),
    capabilities: Object.freeze(capabilities),
    selection: Object.freeze({ state: 'explicit-forward-selected', forwardSelected: true }),
    sourceArtifact: role.sourceArtifact,
    facts: Object.freeze([
      Object.freeze({ kind: 'current-work-forward-delegate-selector', role: selector.roleLabel, section: selector.section, selectorKind: selector.selectorKind, controllingArtifact: selected.resolvedPath }),
      Object.freeze({ kind: 'exact-forward-selected-role-authority', role: role.label, roleKind: role.roleKind }),
      Object.freeze({ kind: 'selected-handoff-current-work-transfer', handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || ''), transferKind: String(selected.transfer.transferKind || ''), controllingArtifact: selected.resolvedPath })
    ]),
    provenance: Object.freeze({
      source: role.sourceArtifact.path,
      basis: 'exact-controlling-task-explicit-specialist-selector-plus-exact-selected-role-material',
      forwardSelector: selector,
      roleSourceArtifact: role.sourceArtifact,
      materialResolution: role.materialResolution || null,
      currentWorkTransfer: Object.freeze({ handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || ''), controllingArtifact: selected.resolvedPath })
    })
  });
}

function processProjection(role, handoff, selected) {
  const facts = [
    role.authority.delegation ? Object.freeze({ kind: 'sender-role-delegation', value: role.authority.delegation }) : null,
    role.authority.requiredInstrument ? Object.freeze({ kind: 'sender-role-required-instrument', value: role.authority.requiredInstrument }) : null,
    role.authority.mayDo ? Object.freeze({ kind: 'sender-role-may-do', value: role.authority.mayDo }) : null,
    Object.freeze({ kind: 'selected-handoff-work-transfer', transferId: String(selected.transfer.id || ''), transferKind: String(selected.transfer.transferKind || ''), controllingArtifact: selected.resolvedPath })
  ].filter(Boolean);
  if (facts.length < 2) return null;
  return Object.freeze({
    explicit: true,
    qualification: 'qualified',
    facts: Object.freeze(facts),
    source: role.sourceArtifact.path,
    provenance: Object.freeze({ source: role.sourceArtifact.path, sourceArtifact: role.sourceArtifact, basis: 'exact-sender-role-authority-plus-selected-handoff-work-transfer', forwardSelector: Object.freeze({ handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || '') }) })
  });
}

function targetProjection(taskRecord, workspaceSource, handoff, selected) {
  const workspaceId = String(taskRecord.path || '').split('/')[0];
  const relativeTask = String(taskRecord.path || '').slice(workspaceId.length + 1);
  const relativeHandoff = String(handoff.workspaceRelativePath || '').replace(/^\/+/, '');
  return Object.freeze({
    explicit: true,
    qualification: 'qualified',
    target: Object.freeze({
      workspaceId,
      repository: String(workspaceSource.repository || ''),
      rootPath: String(workspaceSource.rootPath || ''),
      taskDirectory: posix.dirname(relativeTask),
      handoffDirectory: posix.dirname(relativeHandoff)
    }),
    sourceArtifact: sourceArtifactFromRecord(taskRecord),
    facts: Object.freeze([
      Object.freeze({ kind: 'controlling-task-placement', path: String(taskRecord.path || '') }),
      Object.freeze({ kind: 'workspace-source-identity', workspaceId, repository: String(workspaceSource.repository || ''), rootPath: String(workspaceSource.rootPath || '') })
    ]),
    provenance: Object.freeze({ source: String(taskRecord.path || ''), basis: 'exact-controlling-task-plus-qualified-workspace-source-identity', forwardSelector: Object.freeze({ handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || '') }) })
  });
}

function sourceProjection(taskRecord, role, handoff, selected) {
  const scope = section(taskRecord.markdown || '', 'Scope');
  const facts = [
    scope ? Object.freeze({ kind: 'controlling-task-scope', value: scope }) : null,
    role.authority.mayDo ? Object.freeze({ kind: 'recipient-role-may-do', value: role.authority.mayDo }) : null,
    role.authority.requiredInstrument ? Object.freeze({ kind: 'recipient-role-required-instrument', value: role.authority.requiredInstrument }) : null,
    Object.freeze({ kind: 'selected-handoff-work-transfer', transferId: String(selected.transfer.id || ''), transferKind: String(selected.transfer.transferKind || ''), controllingArtifact: selected.resolvedPath })
  ].filter(Boolean);
  if (!scope || !role.authority.mayDo) return null;
  return Object.freeze({
    explicit: true,
    qualification: 'qualified',
    sourceArtifact: sourceArtifactFromRecord(taskRecord),
    facts: Object.freeze(facts),
    provenance: Object.freeze({ source: String(taskRecord.path || ''), basis: 'exact-controlling-task-scope-plus-recipient-role-authority-plus-selected-transfer', forwardSelector: Object.freeze({ handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || '') }), recipientRoleSourceArtifact: role.sourceArtifact })
  });
}

function returnProjection(handoff, selected) {
  const completion = handoff.completionExpectation || {};
  const returnTo = String(completion.returnTo || '').trim();
  const retained = (handoff.retainedResponsibilities || []).filter((item) => normalize(item.retainedBy) === normalize(returnTo));
  if (!completion.signalKind || !completion.signalMeaning || !returnTo || retained.length !== 1) return null;
  return Object.freeze({
    explicit: true,
    qualification: 'qualified',
    completionExpectation: Object.freeze({ signalKind: String(completion.signalKind), signalMeaning: String(completion.signalMeaning), returnTo }),
    reconciliation: Object.freeze({ state: 'retained-by-return-target', expectation: String(retained[0].responsibility || '') }),
    sourceArtifact: sourceArtifactFromHandoff(handoff),
    facts: Object.freeze([
      Object.freeze({ kind: 'selected-handoff-completion-expectation', signalKind: String(completion.signalKind), returnTo }),
      Object.freeze({ kind: 'return-target-retained-responsibility', id: String(retained[0].id || ''), retainedBy: returnTo, responsibility: String(retained[0].responsibility || '') })
    ]),
    provenance: Object.freeze({ source: qualifiedHandoffPath(handoff), basis: 'exact-selected-handoff-completion-plus-return-target-retained-responsibility', forwardSelector: Object.freeze({ transferId: String(selected.transfer.id || ''), controllingArtifact: selected.resolvedPath }) })
  });
}

function sourceArtifactFromRecord(record) {
  return Object.freeze({ workspaceId: String(record.path || '').split('/')[0] || '', path: String(record.path || ''), sha256: sha256(record.markdown || ''), schemaId: String(record.schemaId || '') });
}
function sourceArtifactFromHandoff(handoff) {
  return Object.freeze({ workspaceId: String(handoff.workspaceId || ''), path: qualifiedHandoffPath(handoff), sha256: String(handoff.sha256 || '').trim().toLowerCase(), schemaId: String(handoff.schemaId || 'tiinex.handoff.v1') });
}
function sourceArtifactFromReference(reference, sha, schemaId) {
  const raw = String(reference || '').trim();
  const cross = raw.match(/^([^:/\\]+)::(.+)$/);
  return Object.freeze({ workspaceId: cross ? cross[1] : '', path: raw, sha256: String(sha || '').toLowerCase(), schemaId: String(schemaId || '') });
}
function qualifiedHandoffPath(handoff) { return [String(handoff.workspaceId || ''), String(handoff.workspaceRelativePath || '').replace(/^\/+/, '')].filter(Boolean).join('/'); }
function resolveReference(reference, ownerPath) {
  const raw = String(reference || '').split('#')[0].trim().replace(/\\/g, '/');
  const cross = raw.match(/^([^:/\\]+)::(.+)$/);
  const candidate = cross ? `${cross[1]}/${cross[2].replace(/^\/+/, '')}` : raw.startsWith('/') ? raw.slice(1) : posix.join(posix.dirname(ownerPath), raw);
  const normalized = posix.normalize(candidate).replace(/^\.\//, '');
  return !normalized || normalized === '..' || normalized.startsWith('../') ? '' : normalized;
}
function section(markdown = '', heading = '') { const escaped = String(heading || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || ''; }
function sha256(markdown) { return sha256Hex(new TextEncoder().encode(String(markdown || ''))); }
function normalize(value) { return String(value || '').trim().toLowerCase(); }
function empty(code) { return Object.freeze({ state: 'not-established', delegateCapabilityAuthority: null, processApplicability: null, delegationTargetAuthority: null, implementationSourceAuthority: null, delegationReturnReconciliationExpectation: null, unresolved: Object.freeze([Object.freeze({ code })]), provenance: null, boundary: 'No exact selected qualified Handoff authority was available for artifact-derived delegation projection.' }); }
