import { posix } from 'node:path';
import { sha256Hex } from '../../../export/package.bytes.js';

export function projectGroundingDelegationArtifactAuthority({ authority = null, records = [], topology = {}, sourceEvidence = null } = {}) {
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

  const taskRecord = transferSelection?.record || null;
  const targetWorkspaceId = String(taskRecord?.path || '').split('/')[0] || '';
  const workspaceSource = (sourceEvidence?.workspaces || []).find((item) => String(item.workspace || '') === targetWorkspaceId && ['qualified', 'explicit-profile'].includes(String(item.state || ''))) || null;
  if (!workspaceSource?.repository) unresolved.push('exact-target-repository-authority-not-established');

  const delegateCapabilityAuthority = recipient && transferSelection ? delegateProjection(recipient, handoff, transferSelection) : null;
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
      boundary: 'Projection only. Exact Handoff transfer, exact endpoint Role authority, exact controlling Task and exact Workspace source identity are composed mechanically; Role/cache inventory, filenames, adjacency and arbitrary prose are never searched for delegation meaning.'
    }),
    boundary: 'Artifact-derived delegation closure is available only from the exact selected forward chain. It does not select a delegate, invent a process, create source permission, or treat an endpoint alone as delegation authority.'
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

function delegateProjection(role, handoff, selected) {
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
      Object.freeze({ kind: 'selected-handoff-transfer', handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || ''), transferKind: String(selected.transfer.transferKind || ''), controllingArtifact: selected.resolvedPath }),
      Object.freeze({ kind: 'exact-recipient-role-authority', role: role.label, roleKind: role.roleKind })
    ]),
    provenance: Object.freeze({ source: role.sourceArtifact.path, basis: 'selected-handoff-transfer-to-exact-recipient-role-and-controlling-task', forwardSelector: Object.freeze({ handoff: qualifiedHandoffPath(handoff), transferId: String(selected.transfer.id || ''), controllingArtifact: selected.resolvedPath }) })
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
