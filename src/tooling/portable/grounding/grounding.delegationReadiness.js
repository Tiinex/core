const MAX_CAPABILITIES = 12;
const MAX_FACTS = 12;

export function projectGroundingDelegationReadiness({ authority = null, processApplicability = null, implementationSourceAuthority = null } = {}) {
  const delegateCapabilityAuthority = projectDelegateCapabilityAuthority(authority?.delegateCapabilityAuthority || authority?.delegationContext?.delegateCapabilityAuthority || null);
  const targetAuthority = projectDelegationTargetAuthority(authority?.delegationTargetAuthority || authority?.delegationContext?.targetAuthority || authority?.delegationContext?.delegationTargetAuthority || null);
  const returnReconciliationExpectation = projectDelegationReturnReconciliationExpectation(authority?.delegationReturnReconciliationExpectation || authority?.delegationContext?.returnReconciliationExpectation || authority?.delegationContext?.delegationReturnReconciliationExpectation || null);
  const process = processApplicability || Object.freeze({ state: 'not-established', unresolved: Object.freeze([]) });
  const source = implementationSourceAuthority || Object.freeze({ state: 'unresolved', unresolved: Object.freeze([]) });
  const blockers = [];

  if (delegateCapabilityAuthority.state !== 'explicit-qualified-forward-selection') blockers.push(blocker(
    'delegate-capability-authority-not-established',
    delegateCapabilityAuthority.unresolved?.[0]?.detail || 'No explicit upstream-qualified forward-selected delegate/capability authority is established.',
    'Provide an explicit upstream-qualified forward-selected delegate/capability projection with exact source-artifact identity. Cached Role presence, participant inventory, Handoff endpoint labels, filenames and chat position are not delegate selection authority.'
  ));
  const processReady = String(process.state || '') === 'explicit-qualified-authority' && Array.isArray(process.facts) && process.facts.length > 0 && Boolean(String(process.provenance?.source || process.provenance?.upstreamProvenance?.source || '').trim());
  if (!processReady) blockers.push(blocker(
    'delegation-process-applicability-not-established',
    process.unresolved?.[0]?.detail || 'Delegation/process applicability is not explicitly established by upstream semantic authority.',
    'Provide the explicit upstream-qualified process/delegation applicability projection. Do not infer applicability from Role/cache inventory or repository adjacency.'
  ));
  if (targetAuthority.state !== 'explicit-qualified-target-authority') blockers.push(blocker(
    'delegation-target-authority-not-established',
    targetAuthority.unresolved?.[0]?.detail || 'Target repository/workspace authority and repo-local Task/Handoff placement are not explicitly established.',
    'Provide an explicit upstream-qualified delegation target projection naming repository, workspaceId, taskDirectory and handoffDirectory with exact source-artifact identity.'
  ));
  const sourceReady = String(source.state || '') === 'explicit-qualified-upstream-projection' && Array.isArray(source.facts) && source.facts.length > 0;
  if (!sourceReady) blockers.push(blocker(
    'delegation-source-authority-not-established',
    source.unresolved?.[0]?.detail || 'Implementation/source authority is not explicitly established by upstream semantic authority.',
    'Provide the exact upstream-qualified implementation-source authority projection. Workspace carriage, writability text, repository identity and executable Task presence remain descriptive only.'
  ));
  if (returnReconciliationExpectation.state !== 'explicit-qualified-return-reconciliation') blockers.push(blocker(
    'delegation-return-reconciliation-expectation-not-established',
    returnReconciliationExpectation.unresolved?.[0]?.detail || 'Return/reconciliation responsibility is not explicitly established.',
    'Provide an explicit upstream-qualified return/reconciliation projection with Completion Expectation and an explicit reconciliation state/expectation.'
  ));

  const ready = blockers.length === 0;
  return Object.freeze({
    state: ready ? 'qualified-for-delegation-authoring' : 'not-established',
    delegateCapabilityAuthority,
    processApplicability: process,
    targetAuthority,
    sourceAuthority: source,
    returnReconciliationExpectation,
    blockers: Object.freeze(blockers),
    plainChatFallbackPermitted: false,
    repositoryScanningFallbackPermitted: false,
    nextOperations: ready ? projectNextOperations({ delegateCapabilityAuthority, targetAuthority, returnReconciliationExpectation }) : Object.freeze([]),
    boundary: 'Mechanical delegation qualification only. Core consumes already-explicit, already-qualified semantic projections and exposes the normal Task -> Handoff -> carrier Tooling path; it never selects a delegate, invents process applicability, generates a work plan, grants source authority, or treats cached Role presence as delegation authority.'
  });
}

export function projectDelegateCapabilityAuthority(value = null) {
  const base = qualifyExplicitProjection(value);
  if (!base.qualified) return unresolvedProjection('delegate-capability-authority-not-established', 'No exact upstream-qualified explicit delegate/capability projection is present.');
  const delegate = value?.delegate || value?.selectedDelegate || {};
  const label = String(delegate.label || delegate.roleLabel || value?.delegateLabel || '').trim();
  const kind = String(delegate.kind || value?.delegateKind || 'role').trim();
  const capabilities = Array.isArray(value?.capabilities) ? value.capabilities : Array.isArray(delegate.capabilities) ? delegate.capabilities : [];
  const selectionState = String(value?.selection?.state || value?.selectionState || '').trim().toLowerCase();
  const forwardSelected = value?.selection?.forwardSelected === true || value?.forwardSelected === true || ['forward-selected', 'explicit-forward-selected'].includes(selectionState);
  if (!label || !capabilities.length || !forwardSelected) return unresolvedProjection(
    'delegate-capability-authority-incomplete',
    'The upstream delegate/capability projection is marked qualified but does not expose one explicit forward-selected delegate label plus at least one capability.'
  );
  return Object.freeze({
    state: 'explicit-qualified-forward-selection',
    delegate: Object.freeze({ label, kind }),
    capabilities: Object.freeze(capabilities.slice(0, MAX_CAPABILITIES).map((item) => freezeValue(item))),
    sourceArtifact: Object.freeze(base.sourceArtifact),
    facts: Object.freeze(projectFacts(value)),
    provenance: Object.freeze({
      basis: 'exact-upstream-qualified-forward-selected-delegate-capability-projection',
      sourceArtifact: Object.freeze(base.sourceArtifact),
      upstreamProvenance: value?.provenance ? Object.freeze({ ...(value.provenance || {}) }) : null,
      boundary: 'Delegate relevance/capability is passed through from explicit upstream authority. Core does not select a Role from cache or participant inventory.'
    }),
    unresolved: Object.freeze([]),
    boundary: 'Forward selection is semantic input, not a Role-discovery result.'
  });
}

export function projectDelegationTargetAuthority(value = null) {
  const base = qualifyExplicitProjection(value);
  if (!base.qualified) return unresolvedProjection('delegation-target-authority-not-established', 'No exact upstream-qualified delegation target projection is present.');
  const target = value?.target || value?.placement || {};
  const workspaceId = String(target.workspaceId || value?.workspaceId || '').trim();
  const repository = String(target.repository || value?.repository || '').trim();
  const taskDirectory = normalizeDirectory(target.taskDirectory || value?.taskDirectory || '');
  const handoffDirectory = normalizeDirectory(target.handoffDirectory || value?.handoffDirectory || '');
  if (!workspaceId || !repository || !taskDirectory || !handoffDirectory) return unresolvedProjection(
    'delegation-target-authority-incomplete',
    'The upstream delegation target projection is marked qualified but does not expose repository, workspaceId, taskDirectory and handoffDirectory.'
  );
  return Object.freeze({
    state: 'explicit-qualified-target-authority',
    target: Object.freeze({ workspaceId, repository, taskDirectory, handoffDirectory, rootPath: String(target.rootPath || value?.rootPath || '').trim() }),
    sourceArtifact: Object.freeze(base.sourceArtifact),
    facts: Object.freeze(projectFacts(value)),
    provenance: Object.freeze({
      basis: 'exact-upstream-qualified-delegation-target-projection',
      sourceArtifact: Object.freeze(base.sourceArtifact),
      upstreamProvenance: value?.provenance ? Object.freeze({ ...(value.provenance || {}) }) : null,
      boundary: 'Repository/Workspace identity and repo-local Task/Handoff placement are passed through from upstream authority; Core does not discover or choose a repository.'
    }),
    unresolved: Object.freeze([]),
    boundary: 'Target placement is explicit authority input only; source mutation permission is separate.'
  });
}

export function projectDelegationReturnReconciliationExpectation(value = null) {
  const base = qualifyExplicitProjection(value);
  if (!base.qualified) return unresolvedProjection('delegation-return-reconciliation-expectation-not-established', 'No exact upstream-qualified return/reconciliation projection is present.');
  const completion = value?.completionExpectation || value?.returnExpectation || {};
  const signalKind = String(completion.signalKind || '').trim();
  const signalMeaning = String(completion.signalMeaning || '').trim();
  const returnTo = String(completion.returnTo || '').trim();
  const reconciliation = normalizeReconciliation(value?.reconciliation || value?.reconciliationExpectation || null);
  if (!signalKind || !signalMeaning || !returnTo || !reconciliation.state) return unresolvedProjection(
    'delegation-return-reconciliation-expectation-incomplete',
    'The upstream return/reconciliation projection is marked qualified but does not expose a complete Completion Expectation and an explicit reconciliation state/expectation.'
  );
  return Object.freeze({
    state: 'explicit-qualified-return-reconciliation',
    completionExpectation: Object.freeze({ signalKind, signalMeaning, returnTo }),
    reconciliation,
    sourceArtifact: Object.freeze(base.sourceArtifact),
    facts: Object.freeze(projectFacts(value)),
    provenance: Object.freeze({
      basis: 'exact-upstream-qualified-return-reconciliation-projection',
      sourceArtifact: Object.freeze(base.sourceArtifact),
      upstreamProvenance: value?.provenance ? Object.freeze({ ...(value.provenance || {}) }) : null,
      boundary: 'Return and reconciliation responsibility are passed through exactly; Core does not invent acceptance, completion or merge semantics.'
    }),
    unresolved: Object.freeze([]),
    boundary: 'Completion and reconciliation expectations are semantic-owner inputs; carrier manufacture remains a separate mechanical operation.'
  });
}

function projectNextOperations({ delegateCapabilityAuthority, targetAuthority, returnReconciliationExpectation }) {
  const target = targetAuthority.target;
  const delegate = delegateCapabilityAuthority.delegate;
  return Object.freeze([
    Object.freeze({
      kind: 'author-delegation-task',
      command: 'author',
      schemaId: 'tiinex.task.v1',
      workspaceId: target.workspaceId,
      repository: target.repository,
      directory: target.taskDirectory,
      bodyAuthority: 'caller/upstream-authored-work-semantics-required',
      boundary: 'Mechanical authoring coordinate only. Core does not generate the Task objective, Done Criteria, scope or work plan.'
    }),
    Object.freeze({
      kind: 'author-delegation-handoff',
      command: 'author',
      schemaId: 'tiinex.handoff.v1',
      workspaceId: target.workspaceId,
      repository: target.repository,
      directory: target.handoffDirectory,
      parent: 'newly-authored-qualified-task',
      recipient: Object.freeze({ ...delegate }),
      completionExpectation: Object.freeze({ ...(returnReconciliationExpectation.completionExpectation || {}) }),
      boundary: 'Author the Handoff through normal Tooling with the qualified Task as Parent and the upstream-selected delegate/return semantics; Core does not synthesize transfer semantics.'
    }),
    Object.freeze({
      kind: 'manufacture-delegation-carrier',
      command: 'handoff',
      workspaceId: target.workspaceId,
      recipient: Object.freeze({ ...delegate }),
      carrierAllocation: 'machine-derived-from-qualified-parent-pointer-topology',
      reconciliation: returnReconciliationExpectation.reconciliation,
      boundary: 'Manufacture only after the Task and Handoff qualify. Carrier topology is transport-only and does not create semantic delegation authority.'
    })
  ]);
}

function qualifyExplicitProjection(value = null) {
  if (!value || typeof value !== 'object' || value.explicit !== true) return { qualified: false, sourceArtifact: emptySourceArtifact() };
  if (String(value.qualification || value.state || '').trim().toLowerCase() !== 'qualified') return { qualified: false, sourceArtifact: emptySourceArtifact() };
  const sourceArtifact = projectSourceArtifact(value);
  if (!sourceArtifact.path || !/^[0-9a-f]{64}$/i.test(sourceArtifact.sha256)) return { qualified: false, sourceArtifact };
  return { qualified: true, sourceArtifact };
}

function projectSourceArtifact(value = {}) {
  const source = value.sourceArtifact || value.provenance?.sourceArtifact || {};
  return Object.freeze({
    workspaceId: String(source.workspaceId || source.workspace || '').trim(),
    path: String(source.path || source.workspaceRelativePath || value.provenance?.sourceArtifactPath || '').trim(),
    sha256: String(source.sha256 || value.provenance?.sourceArtifactSha256 || '').trim().toLowerCase(),
    schemaId: String(source.schemaId || '').trim()
  });
}

function unresolvedProjection(code, detail) {
  return Object.freeze({
    state: 'not-established',
    facts: Object.freeze([]),
    sourceArtifact: Object.freeze(emptySourceArtifact()),
    unresolved: Object.freeze([Object.freeze({ code, detail })]),
    boundary: 'No semantic meaning is inferred from Role/cache inventory, Handoff endpoints, filenames, repository adjacency or transport placement.'
  });
}

function blocker(code, detail, request) {
  return Object.freeze({
    code,
    detail: String(detail || ''),
    request: `${String(request || '')} Do not fall back to plain-chat delegation, repository scanning, network discovery, or selecting a Role merely because it is carried.`
  });
}

function projectFacts(value = {}) {
  const facts = Array.isArray(value.facts) ? value.facts : Array.isArray(value.items) ? value.items : [];
  return facts.slice(0, MAX_FACTS).map((item) => freezeValue(item));
}

function freezeValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return Object.freeze({ ...value });
  if (Array.isArray(value)) return Object.freeze([...value]);
  return value;
}

function normalizeDirectory(value = '') {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '').trim();
}

function normalizeReconciliation(value = null) {
  if (typeof value === 'string') return Object.freeze({ state: String(value || '').trim(), expectation: '' });
  if (!value || typeof value !== 'object') return Object.freeze({ state: '', expectation: '' });
  return Object.freeze({
    state: String(value.state || value.disposition || '').trim(),
    expectation: String(value.expectation || value.description || '').trim()
  });
}

function emptySourceArtifact() { return { workspaceId: '', path: '', sha256: '', schemaId: '' }; }
