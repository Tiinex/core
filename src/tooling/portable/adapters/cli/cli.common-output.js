import { projectPortableSourceFrontierComparisonSummary } from '../../comparison/sourceFrontierComparison.js';
import { projectPortableSourceReconciliationProofSummary } from '../../comparison/sourceFrontierReconciliationProof.js';
import { HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION } from '../../handoff/handoffPackageV1.constants.js';

const COMMON_DEFAULT_PROJECTION = 'common-default';

export function projectCommonCliDefaultOutput(result = {}, parsed = {}) {
  if (parsed?.flags?.full === true) return result;
  if (parsed?.command === 'orient-handoff-package') return projectOrientDefault(result, parsed);
  if (parsed?.command === 'project-grounding-readiness') return projectGroundDefault(result, parsed);
  if (parsed?.command === 'manufacture-handoff-package' && parsed?.surfaceCommand === 'handoff') return projectHandoffDefault(result, parsed);
  if (parsed?.command === 'compare-source-frontiers') return projectCompareDefault(result, parsed);
  if (parsed?.command === 'prove-source-reconciliation') return projectReconciliationProofDefault(result, parsed);
  return result;
}

function projectReconciliationProofDefault(result = {}, parsed = {}) {
  const summary = projectPortableSourceReconciliationProofSummary({ ...result, schema: result.resultSchema || result.schema || '' }, { maxPaths: parsed?.flags?.['max-paths'] || 20 });
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'prove-source-reconciliation',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: summary.status,
    state: summary.state,
    counts: summary.counts,
    preservation: summary.preservation,
    workspaces: summary.workspaces,
    proofFingerprint: summary.proofFingerprint,
    manufactureBinding: summary.manufactureBinding,
    findingSummary: summary.findingSummary,
    actionableFindings: summary.actionableFindings,
    detail: Object.freeze({ fullReceipt: Object.freeze({ command: String(parsed.surfaceCommand || 'reconcile'), flag: '--full', requiredForManufacture: true }) }),
    boundary: summary.boundary
  });
}

function projectCompareDefault(result = {}, parsed = {}) {
  const summary = projectPortableSourceFrontierComparisonSummary({ ...result, schema: result.resultSchema || result.schema || '' }, { maxPaths: parsed?.flags?.['max-paths'] || 20 });
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'compare-source-frontiers',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: summary.status,
    state: summary.state,
    mode: summary.mode,
    inputs: summary.inputs,
    workspaces: summary.workspaces,
    counts: summary.counts,
    findingSummary: summary.findingSummary,
    actionableFindings: summary.actionableFindings,
    detail: Object.freeze({ fullReceipt: Object.freeze({ command: String(parsed.surfaceCommand || 'compare'), flag: '--full' }) }),
    boundary: summary.boundary
  });
}

function projectOrientDefault(result = {}, parsed = {}) {
  const projection = result?.entrypoint?.projection || {};
  const routes = (result.routes || projection.routes || []).map(projectOrientRoute);
  const workspaces = (result.workspaces || projection.workspaces || []).map((workspace) => Object.freeze({
    id: String(workspace?.id || workspace?.workspaceId || ''),
    title: String(workspace?.title || workspace?.id || workspace?.workspaceId || ''),
    qualification: String(workspace?.qualification || (workspace?.bindingState === 'verified' ? 'qualified' : workspace?.bindingState || ''))
  }));
  const actionableFindings = actionable(result);
  const selected = routes.find((route) => route.pointerPath) || routes[0] || {};
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'orient-handoff-package',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    workspaces: Object.freeze(workspaces),
    routes: Object.freeze(routes),
    selection: result.selection || projection.selection || null,
    authority: projection.authority ? Object.freeze({ ...projection.authority }) : null,
    carrierLineage: compactCarrierLineage(result.carrierLineage),
    nextAction: result.status === 'ready' && selected.pointerPath && String(selected.state || '') === 'qualified' ? Object.freeze({
      command: 'ground',
      package: sourceArgument(parsed),
      route: selected.pointerPath
    }) : null,
    findingSummary: result.findingSummary || null,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    detail: detailReceipt(parsed),
    boundary: 'Common default orientation projection. It preserves route/workspace qualification, selection, non-authority, actionable findings, and the exact grounding route while moving package topology, endpoint-role, and closure receipts behind --full.'
  });
}

function projectGroundDefault(result = {}, parsed = {}) {
  const required = result?.coverage?.requiredContext || {};
  const currentWork = result?.currentWork || {};
  const continuity = result?.continuity || {};
  const evidence = result?.evidence || {};
  const capsule = result?.capsule || {};
  const actionableFindings = actionable(result);
  const continuing = typeof parsed?.flags?.continue === 'string' && parsed.flags.continue.length > 0;
  const explicitRequiredBodies = typeof parsed?.flags?.['include-required-context'] === 'string' && parsed.flags['include-required-context'].length > 0;
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'project-grounding-readiness',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    readiness: compactReadiness(result.readiness),
    completionQualification: compactCompletionQualification(result.completionQualification),
    authority: compactGroundAuthority(result.authority),
    recipientContract: projectRecipientContract({ result, required, currentWork, continuity, parsed }),
    orchestrationReadiness: compactOrchestrationReadiness(result.orchestrationReadiness),
    delegationReadiness: compactDelegationReadinessSummary(result.delegationReadiness),
    groundingBasis: Object.freeze({
      qualifiedOrKnown: Object.freeze((evidence.known || []).map(compactGroundEvidence)),
      boundedInference: Object.freeze((evidence.inferred || []).map(compactGroundEvidence)),
      unresolved: Object.freeze((evidence.unresolved || []).map(compactGroundEvidence)),
      humanOnly: Object.freeze((evidence.humanOnly || []).map(compactGroundEvidence)),
      authorityMatrix: compactAuthorityMatrix(result.authority),
      participants: compactParticipantContext(capsule.participantContext),
      guidanceAuthority: compactGuidanceAuthority(capsule.guidanceAuthority, { includeSectionText: !parsed?.flags?.recipient }),
      sourceSufficiency: compactSourceSufficiency(capsule.sourceEvidence),
      recipientReading: projectRecipientReading({ required, currentWork, parsed })
    }),
    requiredContext: Object.freeze({
      declared: Number(required.declared || 0),
      matchedInWorkspaceSnapshots: Number(required.matchedInWorkspaceSnapshots || 0),
      missingFromWorkspaceSnapshots: Number(required.missingFromWorkspaceSnapshots || 0),
      items: Object.freeze((continuing && !explicitRequiredBodies ? [] : (required.items || [])).map(projectRequiredContextItem)),
      itemsOmitted: Number(required.itemsOmitted || 0) + (continuing && !explicitRequiredBodies ? (required.items || []).length : 0),
      bodiesProjected: Number(required.bodiesProjected || 0),
      bodiesAvailable: Number(required.bodiesAvailable || 0)
    }),
    currentWork: Object.freeze({
      state: String(currentWork.state || ''),
      authorityMode: String(currentWork.authorityMode || ''),
      frontier: Object.freeze((currentWork.frontier || []).map(projectCurrentWorkItem)),
      frontierOmitted: Number(currentWork.frontierOmitted || 0),
      contextCandidates: Object.freeze((currentWork.contextCandidates || []).slice(0, 20).map(projectCurrentWorkItem)),
      contextCandidatesOmitted: Number(currentWork.contextCandidatesOmitted || 0) + Math.max(0, (currentWork.contextCandidates || []).length - 20),
      handoffContract: currentWork.handoffContract ? Object.freeze({
        selectedHandoff: String(currentWork.handoffContract.selectedHandoff || ''),
        controls: Object.freeze((currentWork.handoffContract.controls || []).slice(0, 20).map((item) => Object.freeze({ ...item }))),
        unresolved: Object.freeze((currentWork.handoffContract.unresolved || []).slice(0, 20).map((item) => Object.freeze({ ...item }))),
        boundary: String(currentWork.handoffContract.boundary || '')
      }) : null,
      bodiesProjected: Number(currentWork.bodiesProjected || 0),
      bodiesAvailable: Number(currentWork.bodiesAvailable || 0),
      blockers: Object.freeze((currentWork.blockers || []).slice(0, 20).map((item) => Object.freeze({ ...item }))),
      blockersOmitted: Number(currentWork.blockersOmitted || 0) + Math.max(0, (currentWork.blockers || []).length - 20)
    }),
    continuity: compactContinuity(continuity, { continuing }),
    deeper: result.deeper ? Object.freeze({ ...result.deeper }) : null,
    ...(result.continuationMaterialization ? { continuationMaterialization: Object.freeze({ ...result.continuationMaterialization }) } : {}),
    findingSummary: result.findingSummary || null,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    detail: detailReceipt(parsed),
    boundary: result.boundary || 'Decision-oriented common default grounding projection. Full qualified receipt remains available with --full.'
  });
}

function projectRecipientContract({ result = {}, required = {}, currentWork = {}, continuity = {}, parsed = {} } = {}) {
  const authority = result.authority || {};
  const handoff = authority.handoff || {};
  const completion = handoff.completionExpectation || {};
  const returnPackage = result.returnPackage || {};
  const flags = parsed?.flags || {};
  const packageArg = sourceArgument(parsed);
  const route = typeof flags.route === 'string' ? flags.route : '';
  const holderRole = typeof flags['holder-role'] === 'string' ? flags['holder-role'] : '';
  const materializeCli = [
    'ground', packageArg,
    route ? '--route' : '', route,
    holderRole ? '--holder-role' : '', holderRole,
    flags.recipient ? '--recipient' : '',
    '--continue', '<empty-workspace-dir>'
  ].filter(Boolean).join(' ');
  const qualifyReturnCli = 'qualify-return <continued-workspace-dir> --result <result-path> --expected <expected-file-path>';
  const prepareReturnCli = 'prepare-return <continued-workspace-dir>';
  const handoffCli = 'handoff <continued-workspace-dir>';
  const knownLosses = continuity?.losses?.blocking === false ? (continuity.losses.items || []) : [];
  const requiredAvailable = Number(required.bodiesAvailable || 0);
  const requiredProjected = Number(required.bodiesProjected || 0);
  const currentAvailable = Number(currentWork.bodiesAvailable || 0);
  const currentProjected = Number(currentWork.bodiesProjected || 0);
  const bodiesReady = requiredProjected >= requiredAvailable && currentProjected >= currentAvailable;
  const rawGuidance = result?.capsule?.guidanceAuthority || {};
  const guidance = projectRecipientGuidanceSummary(rawGuidance);
  const operationSelection = projectRecipientOperationSelection(rawGuidance);
  const sourceBlockers = result?.capsule?.sourceEvidence?.blockers || [];
  const selectedHandoffBoundedWork = String(currentWork.state || '') === 'selected-handoff-bounded-work';
  const selectedHandoff = String(currentWork?.handoffContract?.selectedHandoff || '');
  return Object.freeze({
    state: String(result?.readiness?.state || '') === 'grounded-to-act' ? 'bounded-work-contract-qualified' : 'bounded-work-contract-not-ready',
    workspaceLifecycle: Object.freeze({
      receivedSnapshot: 'immutable-qualified-carried-input',
      continuedWorkspace: 'writable-local-continuation',
      runtimeState: '.tiinex/* is runtime-only and excluded from canonical return manufacture'
    }),
    may: Object.freeze([
      'Materialize the exact selected carried Workspace locally after grounded-to-act, then mutate only within the qualified selected-Handoff bounded-work scope.',
      selectedHandoffBoundedWork ? 'Create or edit local Workspace work-product files only when required by the exact selected Handoff bounded-work contract.' : 'Create or edit local Workspace work-product files required by the exact selected-Handoff-controlled Task.',
      'Author the durable return Handoff as bounded-result transport after producing or verifying the result to be returned; this does not establish Task completion or closure.'
    ]),
    mayNot: Object.freeze([
      'Do not perform remote mutation, publication, release, or other remote write unless separately and explicitly authorized.',
      'Do not broaden beyond the qualified selected-Handoff bounded-work scope or manufacture missing source facts.',
      'Do not treat grounded-to-act, projected Done Criteria text, your own free-text criteria evaluation, or a declared return protocol as proof of bounded-work completion or Task closure.',
      'Do not treat availability of qualify-return/prepare-return, a declared Return To endpoint, or a declared return protocol as evidence that return is the current next action; grounding does not qualify return timing. A separate qualify-return receipt must establish the transition for one exact verified bounded result before prepare-return can run.',
      'Do not treat loose Workspace/result/Evidence/Handoff files as the normal external return transport.'
    ]),
    mustRead: Object.freeze({
      state: bodiesReady ? 'projected-for-recipient-interpretation' : 'body-read-required',
      requiredContext: Object.freeze({ available: requiredAvailable, projected: requiredProjected, pending: Math.max(0, requiredAvailable - requiredProjected) }),
      currentWork: Object.freeze({ available: currentAvailable, projected: currentProjected, pending: Math.max(0, currentAvailable - currentProjected) })
    }),
    currentWorkAuthority: Object.freeze({
      state: String(currentWork.state || ''),
      mode: String(currentWork.authorityMode || ''),
      selectedHandoff,
      taskFrontier: Object.freeze((currentWork.frontier || []).slice(0, 12).map(projectCurrentWorkItem)),
      contextOnlyTaskCandidates: Object.freeze((currentWork.contextCandidates || []).slice(0, 12).map(projectCurrentWorkItem)),
      controlTargets: Object.freeze((currentWork?.handoffContract?.controls || []).slice(0, 12).map((item) => Object.freeze({ transferId: String(item?.id || ''), transferKind: String(item?.transferKind || ''), target: String(item?.controllingArtifactTarget || ''), resolvedPath: String(item?.resolvedPath || ''), state: String(item?.state || ''), schemaId: String(item?.schemaId || '') }))),
      boundary: String(currentWork?.handoffContract?.boundary || '')
    }),
    guidance,
    operationSelection,
    sourceBlockingEvidence: Object.freeze(sourceBlockers.slice(0, 12).map((item) => Object.freeze({ code: String(item?.code || ''), requirementId: String(item?.requirementId || ''), name: String(item?.name || ''), blockingReason: String(item?.blockingReason || ''), request: String(item?.request || '') }))),
    knownMissingNonBlocking: Object.freeze(knownLosses.slice(0, 12).map((item) => Object.freeze({
      kind: String(item?.kind || item?.code || ''),
      target: String(item?.target || item?.path || item?.reference || ''),
      detail: String(item?.detail || item?.message || item?.reason || '')
    }))),
    nextAction: Object.freeze({
      beforeWorkspaceMutation: String(result?.readiness?.state || '') === 'grounded-to-act'
        ? Object.freeze({ command: 'ground', cli: materializeCli, boundary: 'Materialize only the selected qualified Workspace; runtime-only .tiinex continuation state is not semantic authority.' })
        : null,
      boundedWork: result?.readiness?.nextAction ? Object.freeze({ ...result.readiness.nextAction }) : null
    }),
    completion: Object.freeze({
      qualification: compactCompletionQualification(result.completionQualification),
      signalKind: String(completion.signalKind || ''),
      signalMeaning: String(completion.signalMeaning || ''),
      returnTo: String(completion.returnTo || returnPackage.returnTo || ''),
      returnToReference: String(completion.returnToReference || returnPackage.returnToReference || ''),
      returnTransition: String(result?.completionQualification?.returnTransition || ''),
      returnTiming: String(result?.completionQualification?.returnTiming || ''),
      canonicalTransport: returnPackage.expected ? 'one-handoff-package-plus-exact-routing-text' : 'no-qualified-return-package-expectation',
      localWorkProductRule: 'Keep result/work-product files inside the continued Workspace. They are carried by the canonical return Handoff Package; do not emit them as extra loose transport payloads.',
      returnAuthoring: returnPackage.expected ? Object.freeze({
        qualifyTransition: Object.freeze({ command: 'qualify-return', cli: qualifyReturnCli, effect: 'verifies one exact local bounded result against one explicit expected local file and writes runtime-only .tiinex/return-transition.json; this qualifies return timing for that result only and does not establish Task completion/closure' }),
        prepare: Object.freeze({ command: 'prepare-return', cli: prepareReturnCli, effect: 'writes only runtime-only .tiinex/return-handoff.body.md scaffold with exact endpoint defaults and schema-complete nested field shapes' }),
        semanticResponsibility: 'Recipient must first qualify the return transition for the exact bounded result with qualify-return. Prepare-return is fail-closed until that receipt exists and remains byte-current, and the returned Material Reference is mechanically locked to that verified result. This does not establish Task completion/closure; use project-lifecycle-readiness with explicit qualified facts before making such a claim.',
        preflight: 'Run the emitted author --preflight command after filling the scaffold. It uses the exact renderer, c14n-v2 sealing, audit, and staging path without retaining the candidate or mutating continuation state.',
        integrityAndQualification: 'After preflight qualifies, use the emitted author command; Tooling renders canonical envelope continuity, seals sha256-base64url-c14n-v2, audits, stages, and refuses incomplete scaffold markers.',
        manufacture: Object.freeze({ command: 'handoff', cli: handoffCli, canonicalTransport: 'one-handoff-package-plus-exact-routing-text' })
      }) : null,
      returnHandoffRequired: Boolean(returnPackage.expected),
      returnPackage: returnPackage.expected ? Object.freeze({
        carrierPrefix: String(returnPackage.carrierPrefix || ''),
        parentDimension: String(returnPackage.parentDimension || ''),
        defaultNextDimension: String(returnPackage.defaultNextDimension || ''),
        filenamePattern: String(returnPackage.filenamePattern || ''),
        parentPackagePath: String(returnPackage.parentPackagePath || ''),
        manufactureRule: String(returnPackage.manufactureRule || '')
      }) : null,
      protocol: returnPackage.expected ? Object.freeze([
        selectedHandoffBoundedWork ? 'Produce the bounded result defined by the exact selected Handoff contract inside the writable continued Workspace; grounding itself is not completion evidence and does not establish that return is due.' : 'Perform the exact selected-Handoff-controlled Task work needed for the result. Grounding and return-protocol availability do not establish that return is due. Do not convert your own reading of free-text Done Criteria into Task closure; project-lifecycle-readiness is the qualified lifecycle path for any completion/closure claim.',
        'Run `qualify-return <continued-workspace-dir> --result <result-path> --expected <expected-file-path>` only when the exact result and explicit expected local bytes exist. This is the fail-closed transition gate and does not claim Task completion/closure.',
        'After qualify-return reports qualified, run `prepare-return <continued-workspace-dir>`; edit only the runtime scaffold it names and replace every <<TIINEX_REQUIRED:...>> marker with exact supported return semantics. Do not alter the mechanically locked returned Material Reference.',
        'Run the exact emitted `author ... --preflight` command. Tooling validates the filled scaffold through the normal renderer/integrity/audit/stage path without retaining it.',
        'After preflight qualifies, run the exact emitted `author` command. Tooling owns canonical envelope continuity, c14n-v2 sealing, audit, staging, and fail-closed qualification.',
        'Run the exact emitted `handoff` command so continuation state supplies the received parent carrier and Tooling allocates the child carrier dimension.',
        'Return exactly the resulting `.handoff-package.zip` plus Tooling\'s exact adjacent routing text. Do not attach loose result/Evidence/Handoff/Workspace files as additional transport payloads.'
      ]) : Object.freeze([])
    }),
    boundary: 'Recipient execution/return projection only. It exposes the already-qualified Task/Handoff/Role and carrier-continuation contract plus the explicit non-completion qualification from grounding; it creates no new semantic authority, completion, acceptance, or remote-write permission.'
  });
}

function projectRecipientOperationSelection(value = {}) {
  const items = Array.isArray(value?.items) ? value.items : [];
  const selectedGuidance = items.length > 0;
  const activeExecutionStates = [...new Set(items.map((item) => String(item?.dimensions?.activeExecution?.state || '')).filter(Boolean))];
  const stepSelectionStates = [...new Set(items.map((item) => String(item?.stepSelection?.state || '')).filter(Boolean))];
  const activeExecutionQualified = activeExecutionStates.some((state) => state.startsWith('qualified'));
  const interpretationRequired = stepSelectionStates.includes('recipient-interpretation-required');
  const state = !selectedGuidance
    ? 'bounded-work-authority-only'
    : activeExecutionQualified
      ? 'selected-guidance-active-execution-qualified'
      : interpretationRequired
        ? 'selected-guidance-recheck-required-before-host-tool'
        : 'selected-guidance-active-step-not-established';
  return Object.freeze({
    state,
    selectedGuidance,
    recheckAfterEachHumanTurn: selectedGuidance,
    priorHostToolChoiceCarriesAcrossHumanTurn: false,
    activeExecutionStates: Object.freeze(activeExecutionStates),
    stepSelectionStates: Object.freeze(stepSelectionStates),
    allowedNextOperationState: activeExecutionQualified ? 'separately-qualified-active-execution-authority' : selectedGuidance ? 'must-be-resolved-from-exact-selected-guidance-and-current-human-turn' : 'bounded-current-work-only',
    forbiddenFallbacks: Object.freeze(selectedGuidance ? [
      'do-not-repeat-the-previous-host-operation-merely-because-it-was-previously-authorized',
      'do-not-treat-process-applicability-as-proof-that-the-previous-process-step-remains-active',
      'do-not-manually-construct-or-label-a-tiinex-handoff-package',
      'if-an-explicit-selected-guidance-transition-revokes-generation-revision-or-retry-authority-do-not-use-those-operations-after-that-trigger'
    ] : [
      'do-not-broaden-beyond-the-qualified-selected-handoff-bounded-work-scope'
    ]),
    boundary: 'This is a tool-selection discipline projection, not a new Process lifecycle state. Core does not infer active Process state from free text or from applicability. When selected guidance exists, every new human turn must be reconciled against the exact selected guidance/current-work authority before another host tool is chosen; prior tool choice is not authority for the next turn. A host that wants hard prevention must enforce this projected gate when exposing tools.'
  });
}

function projectRecipientGuidanceSummary(value = {}) {
  if (!value || typeof value !== 'object') return null;
  const items = value.items || [];
  const unique = (values) => Object.freeze([...new Set(values.map((item) => String(item || '')).filter(Boolean))]);
  return Object.freeze({
    state: String(value.state || 'not-declared'),
    selectedMaterialCount: Number(value.selectedMaterialCount || 0),
    applicabilityStates: unique(items.map((item) => item?.dimensions?.applicability?.state)),
    activeExecutionStates: unique(items.map((item) => item?.dimensions?.activeExecution?.state)),
    stepSelectionStates: unique(items.map((item) => item?.stepSelection?.state)),
    currentStep: items.some((item) => String(item?.dimensions?.activeExecution?.state || '').startsWith('qualified')) ? 'separately-qualified-active-execution-present' : 'not-established-by-applicability-alone',
    boundary: 'Shallow recipient guidance summary only. Applicability never implies an active process branch/step; Tooling exposes exact authority-owned candidate sections but does not evaluate free-text triggers into execution state.'
  });
}

function canonicalHandoffRoutingText(startPath = '', continueFrom = '') {
  return `Handoff package attached.

Cold start: read Start directly; do not enumerate or broadly extract this package. Follow only Start's qualified bootstrap extraction instruction.

Start:
${startPath}

Continue from (do not read native; pass to Tiinex after bootstrap):
${continueFrom}
`;
}

function compactGroundEvidence(item = {}) {
  return Object.freeze({ code: String(item.code || ''), state: String(item.state || ''), detail: String(item.detail || '') });
}

function compactCompletionQualification(value = {}) {
  if (!value || typeof value !== 'object') return null;
  return Object.freeze({
    state: String(value.state || ''),
    taskLifecycle: String(value.taskLifecycle || ''),
    doneCriteriaEvaluation: String(value.doneCriteriaEvaluation || ''),
    boundedWorkCompletion: String(value.boundedWorkCompletion || ''),
    taskClosure: String(value.taskClosure || ''),
    lifecycleQualificationOperation: String(value.lifecycleQualificationOperation || ''),
    returnExpectation: String(value.returnExpectation || ''),
    returnDisposition: String(value.returnDisposition || ''),
    returnTransition: String(value.returnTransition || ''),
    returnTiming: String(value.returnTiming || ''),
    signalKind: String(value.signalKind || ''),
    returnTo: String(value.returnTo || ''),
    returnToReference: String(value.returnToReference || ''),
    taskStatuses: Object.freeze((value.taskStatuses || []).slice(0, 12).map((item) => Object.freeze({
      path: String(item?.path || ''),
      status: String(item?.status || '')
    }))),
    doneCriteria: Object.freeze((value.doneCriteria || []).slice(0, 12).map((item) => Object.freeze({
      path: String(item?.path || ''),
      text: String(item?.text || '')
    }))),
    boundary: String(value.boundary || '')
  });
}

function compactParticipantContext(value = {}) {
  if (!value || typeof value !== 'object') return null;
  return Object.freeze({
    state: String(value.state || ''),
    participantMapState: String(value.participantMapState || ''),
    semanticParticipants: Object.freeze((value.semanticParticipants || []).map((item) => Object.freeze({
      id: String(item.id || ''),
      label: String(item.label || ''),
      roles: Object.freeze([...(item.roles || [])].map(String)),
      roleIdentityState: String(item.roleIdentity?.state || ''),
      roleLabel: String(item.roleIdentity?.label || ''),
      holderBindingState: String(item.holderBinding?.state || ''),
      holderAssignmentAuthorizationState: String(item.holderAssignmentAuthorization?.state || ''),
      basis: String(item.basis || '')
    }))),
    groundingOnlyRoles: Object.freeze((value.roleGrounding || []).map((item) => Object.freeze({
      label: String(item.label || ''),
      pointerPath: String(item.pointerPath || ''),
      semanticParticipant: false
    }))),
    endpoints: Object.freeze((value.endpoints || []).map((item) => Object.freeze({
      direction: String(item.direction || ''),
      label: String(item.label || ''),
      kind: String(item.kind || ''),
      semanticParticipant: false
    }))),
    unresolved: Object.freeze((value.unresolved || []).map((item) => Object.freeze({ ...item }))),
    boundary: String(value.boundary || '')
  });
}

function compactSourceSufficiency(value = {}) {
  if (!value || typeof value !== 'object') return null;
  const blockers = value.blockers || [];
  return Object.freeze({
    state: blockers.length ? 'unresolved' : String(value.carrier?.state || 'not-established'),
    workspaceCount: Number(value.carrier?.workspaceCount || 0),
    completeWorkspaceCount: Number(value.carrier?.completeWorkspaceCount || 0),
    boundedWorkspaceCount: Number(value.carrier?.boundedWorkspaceCount || 0),
    workspaces: Object.freeze((value.workspaces || []).map((item) => Object.freeze({
      workspace: String(item.workspace || ''),
      state: String(item.state || ''),
      coverage: String(item.coverage || ''),
      repository: String(item.repository || ''),
      ref: String(item.ref || ''),
      remoteState: String(item.remoteState || '')
    }))),
    boundedOrCacheCount: Number((value.boundedOrCache || []).length),
    blockers: Object.freeze(blockers.slice(0, 20).map((item) => Object.freeze({ ...item }))),
    boundary: String(value.boundary || '')
  });
}

function projectRecipientReading({ required = {}, currentWork = {}, parsed = {} } = {}) {
  const requiredAvailable = Number(required.bodiesAvailable || 0);
  const requiredProjected = Number(required.bodiesProjected || 0);
  const currentAvailable = Number(currentWork.bodiesAvailable || 0);
  const currentProjected = Number(currentWork.bodiesProjected || 0);
  const requiredPending = Math.max(0, requiredAvailable - requiredProjected);
  const currentPending = Math.max(0, currentAvailable - currentProjected);
  const pending = requiredPending + currentPending;
  const flags = parsed?.flags || {};
  return Object.freeze({
    mode: flags.recipient ? 'recipient-one-pass' : 'bounded-default',
    state: pending ? 'qualified-material-body-read-required' : (flags.recipient ? 'qualified-body-text-projected-for-recipient-interpretation' : 'qualified-body-text-projected-or-not-required'),
    qualifiedMaterialIsNotProofOfReading: true,
    requiredContextBodies: Object.freeze({ available: requiredAvailable, projected: requiredProjected, pending: requiredPending }),
    currentWorkBodies: Object.freeze({ available: currentAvailable, projected: currentProjected, pending: currentPending }),
    nextAction: pending ? Object.freeze({
      command: 'ground',
      package: sourceArgument(parsed),
      route: typeof flags.route === 'string' ? flags.route : '',
      holderRole: typeof flags['holder-role'] === 'string' ? flags['holder-role'] : '',
      includeRequiredContext: requiredPending ? 'all' : '',
      includeCurrentWork: currentPending > 0,
      boundary: 'Re-run the same exact package/route grounding and read only the qualified bodies required for recipient interpretation; this does not change semantic authority.'
    }) : null,
    boundary: 'Machine qualification or body projection does not prove cognitive reading or understanding. Recipient mode places the exact qualified Required Context/current-work bodies in the same grounding receipt so the recipient can interpret them without a second Tooling round trip.'
  });
}

function projectHandoffDefault(result = {}, parsed = {}) {
  const human = result.humanOutput || {};
  const primary = result.primaryOutput || null;
  const plan = result.planSummary || {};
  const carrier = result.carrierProjection || {};
  const route = (carrier.routes || [])[0] || {};
  const routing = human.normalInlineRouting || null;
  const carrierDimension = String(carrier.lineage?.dimension || result.carrierLineage?.dimension || '');
  const projectedFilename = String(primary?.projectedFilename || human.primary?.filename || '');
  const startPath = String(carrier.startPath || human.primary?.startPath || `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-1-READ-BEFORE-PROCEEDING.trace.md`);
  const routingText = routing?.continueFrom && startPath && projectedFilename ? canonicalHandoffRoutingText(startPath, String(routing.continueFrom || '')) : '';
  const actionableFindings = actionable(result);
  const delivery = projectHandoffDeliveryQualification(result, primary, human);
  return Object.freeze({
    schema: result.schema,
    operation: result.operation || 'manufacture-handoff-package',
    resultSchema: result.resultSchema,
    projection: COMMON_DEFAULT_PROJECTION,
    status: result.status,
    verification: result.verification ? Object.freeze({ ...result.verification }) : null,
    closure: Object.freeze({
      status: String(plan.status || ''),
      requiredClosureReady: Boolean(plan.requiredClosureReady),
      semanticHandoffStatus: String(plan.semanticHandoffStatus || ''),
      requiredCount: Array.isArray(plan.required) ? plan.required.length : 0,
      referenceCount: Array.isArray(plan.reference) ? plan.reference.length : 0,
      workspaces: Object.freeze((plan.workspaces || []).map((workspace) => Object.freeze({
        id: String(workspace.id || ''),
        materialization: String(workspace.materialization || ''),
        qualification: String(workspace.qualification || ''),
        entryCount: Number(workspace.entryCount || 0),
        completenessState: String(workspace.completenessState || '')
      })))
    }),
    carrier: Object.freeze({
      status: String(carrier.status || ''),
      mode: String(carrier.mode || ''),
      lineage: carrier.lineage ? compactCarrierLineage(carrier.lineage) : null,
      allocation: result.carrierAllocation ? Object.freeze({ ...result.carrierAllocation }) : null,
      route: Object.freeze({
        id: String(route.id || ''),
        state: String(route.state || ''),
        workspaceId: String(route.workspaceId || ''),
        workspaceRelativePath: String(route.workspaceRelativePath || ''),
        from: String(route.from || ''),
        to: String(route.to || ''),
        projectedFilename: String(route.projectedFilename || '')
      })
    }),
    transport: Object.freeze({
      primary: primary ? Object.freeze({ ...primary }) : null,
      routing: routing ? Object.freeze({ ...routing }) : null,
      routingText,
      sharedRouting: human.sharedRouting ? Object.freeze({ ...human.sharedRouting, routes: Object.freeze((human.sharedRouting.routes || []).map((item) => Object.freeze({ ...item }))) }) : null,
      presentation: compactHandoffPresentation(human.presentation),
      normalEmission: compactHandoffNormalEmission(human.normalEmissionBoundary),
      delivery
    }),
    roundtripSummary: result.roundtripSummary ? Object.freeze({ ...result.roundtripSummary }) : null,
    toolingBootstrapInspection: result.toolingBootstrapInspection ? Object.freeze({
      status: String(result.toolingBootstrapInspection.status || ''),
      delivery: String(result.toolingBootstrapInspection.delivery || ''),
      counts: Object.freeze({ ...(result.toolingBootstrapInspection.counts || {}) })
    }) : null,
    operationBoundary: result.operationBoundary ? Object.freeze({ ...result.operationBoundary }) : null,
    findingSummary: result.findingSummary || null,
    actionableFindings: Object.freeze(actionableFindings.slice(0, 20)),
    actionableFindingsOmitted: Math.max(0, actionableFindings.length - 20),
    detail: detailReceipt(parsed),
    boundary: 'Common default Handoff manufacture projection. Normal operator completion is one canonical Handoff package plus the exact adjacent routing content; markdown-capable hosts must render that routing in a fenced code block. Canonical Workspace Evidence/Handoff artifacts remain inside the carrier and are not additional loose transport payloads. Full manufacturing evidence remains available behind --full.'
  });
}


function projectHandoffDeliveryQualification(result = {}, primary = null, human = {}) {
  const verification = result.verification || {};
  const normalEmission = human.normalEmissionBoundary || {};
  const packagePath = String(primary?.path || '');
  const packageWritten = String(primary?.status || '') === 'written' && Boolean(packagePath);
  const roundtripPassed = String(verification.roundtrip || '') === 'passed';
  const packageInspectionValid = String(verification.packageInspection || '') === 'valid';
  const preflightQualified = String(verification.preflight || '') === 'qualified';
  const canonicalPayloadCount = Number(normalEmission.canonicalFilePayloadCount || 0);
  const exactNormalEmission = canonicalPayloadCount === 1 && (normalEmission.allowed || []).includes('package-file');
  const qualified = String(result.status || '') === 'ready'
    && packageWritten
    && preflightQualified
    && packageInspectionValid
    && roundtripPassed
    && exactNormalEmission;
  const state = qualified
    ? 'qualified-awaiting-host-surface'
    : packageWritten
      ? 'blocked-unqualified-for-host-surface'
      : 'not-materialized';
  const hostSurface = Object.freeze({
    state: 'not-proven',
    requirement: 'host-native-human-visible-artifact',
    exactQualifiedBytesRequired: true,
    runtimeLocalPathIsDeliveryEvidence: false,
    claimDeliveredAllowed: false,
    nextAction: qualified
      ? 'Surface the exact qualified package bytes through the host-native human-visible file, attachment, or link mechanism before claiming delivery.'
      : 'Do not surface or claim delivery until the exact package bytes qualify for host surfacing.'
  });
  return Object.freeze({
    state,
    qualificationState: qualified ? 'qualified' : packageWritten ? 'blocked' : 'not-materialized',
    packagePath,
    runtimeLocalPath: packagePath,
    runtimeLocalPathIsHumanDeliveryEvidence: false,
    exactPackageBytesQualified: qualified,
    preflight: String(verification.preflight || ''),
    packageInspection: String(verification.packageInspection || ''),
    physicalRoundtrip: String(verification.roundtrip || ''),
    canonicalFilePayloadCount: canonicalPayloadCount,
    allowedHumanEmission: Object.freeze([...(normalEmission.allowed || [])]),
    forbiddenHumanEmission: Object.freeze([...(normalEmission.forbidden || [])]),
    hostSurface,
    boundary: 'Canonical manufacture qualifies exact package bytes for host surfacing; it does not prove human delivery. A runtime-local filesystem path is never delivery evidence. After qualification, the host must expose those exact bytes through its native human-visible file, attachment, or link mechanism before the caller may claim the Handoff Package was delivered. Manual ZIP construction or package-like labeling never qualifies either surfacing or delivery.'
  });
}

function compactHandoffPresentation(presentation = {}) {
  if (!presentation || typeof presentation !== 'object') return null;
  return Object.freeze({
    copyableSurfaceRequired: Boolean(presentation.copyableSurfaceRequired),
    exactContentRequired: Boolean(presentation.exactContentRequired),
    fencedCodeBlockWhenSupported: String(presentation.fencedCodeBlockWhenSupported || ''),
    markdownCapableHostRendering: String(presentation.markdownCapableHostRendering || ''),
    wrapperAuthority: String(presentation.wrapperAuthority || '')
  });
}

function compactHandoffNormalEmission(boundary = {}) {
  if (!boundary || typeof boundary !== 'object') return null;
  return Object.freeze({
    allowed: Object.freeze([...(boundary.allowed || [])]),
    forbidden: Object.freeze([...(boundary.forbidden || [])]),
    canonicalFilePayloadCount: Number(boundary.canonicalFilePayloadCount || 0),
    workspaceArtifactsAsLooseTransportFiles: Boolean(boundary.workspaceArtifactsAsLooseTransportFiles),
    semanticWorkSummaryProse: Boolean(boundary.semanticWorkSummaryProse),
    helperArtifacts: Boolean(boundary.helperArtifacts),
    manuallyReconstructedRouting: Boolean(boundary.manuallyReconstructedRouting),
    duplicateNormalFileChoices: Boolean(boundary.duplicateNormalFileChoices)
  });
}

function projectOrientRoute(route = {}) {
  return Object.freeze({
    id: String(route.id || ''),
    state: String(route.state || ''),
    workspaceId: String(route.workspaceId || ''),
    workspaceRelativeHandoffPath: String(route.workspaceRelativeHandoffPath || ''),
    from: String(route.from || ''),
    to: String(route.to || ''),
    pointerPath: String(route.pointerPath || '')
  });
}

function compactReadiness(readiness = {}) {
  return Object.freeze({
    state: String(readiness.state || ''),
    reasons: Object.freeze((readiness.reasons || []).map((item) => Object.freeze({
      code: String(item?.code || ''),
      message: String(item?.message || '')
    }))),
    missingEvidence: Object.freeze([...(readiness.missingEvidence || [])]),
    nextAction: readiness.nextAction ? Object.freeze({ ...readiness.nextAction }) : null
  });
}

function compactGroundAuthority(authority = {}) {
  const route = authority.route || {};
  const handoff = authority.handoff || {};
  const role = authority.role || {};
  const holderBinding = authority.holderBinding || {};
  const authorization = holderBinding.authorization || {};
  const operationBoundary = authority.operationBoundary || {};
  return Object.freeze({
    state: String(authority.state || ''),
    route: Object.freeze({
      id: String(route.id || ''), pointerPath: String(route.pointerPath || ''), workspaceId: String(route.workspaceId || ''),
      workspaceRelativePath: String(route.workspaceRelativePath || ''), sha256: String(route.sha256 || ''), basis: String(route.provenance?.basis || '')
    }),
    handoff: Object.freeze({
      purpose: String(handoff.purpose || ''), from: String(handoff.from || ''), to: String(handoff.to || ''),
      completionExpectation: handoff.completionExpectation || null,
      transfers: Object.freeze((handoff.transfers || []).map((item) => Object.freeze({
        id: String(item.id || ''), transferKind: String(item.transferKind || ''), controllingArtifactTarget: String(item.controllingArtifactTarget || ''), boundary: String(item.boundary || '')
      }))),
      basis: String(handoff.provenance?.basis || '')
    }),
    role: Object.freeze({ state: String(role.state || ''), label: String(role.label || ''), kind: String(role.kind || '') }),
    holderBinding: Object.freeze({
      state: String(holderBinding.state || ''), roleLabel: String(holderBinding.roleLabel || ''), recipientRoleLabel: String(holderBinding.recipientRoleLabel || ''),
      recipientCompatibility: String(holderBinding.recipientCompatibility || ''), source: String(holderBinding.source || ''), explicit: Boolean(holderBinding.explicit),
      inferredFromTransport: Boolean(holderBinding.inferredFromTransport), semanticAuthorityState: String(holderBinding.semanticAuthorityState || 'not-established'),
      durableIdentityState: String(holderBinding.durableIdentity?.state || 'not-established'),
      authorization: Object.freeze({ state: String(authorization.state || ''), assignmentMode: String(authorization.assignmentMode || ''), reasonCode: String(authorization.reasonCode || ''), basis: String(authorization.provenance?.basis || authorization.modeAuthority?.provenance?.basis || '') })
    }),
    operationBoundary: Object.freeze({ sourceMutation: Boolean(operationBoundary.sourceMutation), remoteWrite: Boolean(operationBoundary.remoteWrite), semanticAuthority: String(operationBoundary.semanticAuthority || ''), boundary: String(operationBoundary.boundary || '') })
  });
}


function compactAuthorityMatrix(authority = {}) {
  const route = authority.route || {};
  const role = authority.role || {};
  const holder = authority.holderBinding || {};
  const authorization = holder.authorization || {};
  const boundary = authority.operationBoundary || {};
  return Object.freeze([
    Object.freeze({ claim: 'selected-route', state: String(route.id ? 'qualified' : 'unresolved'), controllingArtifact: String(route.workspaceRelativePath || route.pointerPath || ''), basis: String(route.provenance?.basis || '') }),
    Object.freeze({ claim: 'recipient-role', state: String(role.state || 'unresolved'), controllingArtifact: String(role.material?.artifact?.reference || role.material?.artifact?.path || role.label || ''), basis: String(role.material?.provenance?.basis || 'qualified-recipient-role') }),
    Object.freeze({ claim: 'consuming-session-role-binding', state: String(holder.state || 'unresolved'), controllingArtifact: String(holder.roleLabel || ''), basis: String(holder.provenance?.basis || holder.source || '') }),
    Object.freeze({ claim: 'holder-assignment-mode', state: String(authorization.state || 'unresolved'), controllingArtifact: String(holder.roleLabel || ''), basis: String(authorization.provenance?.basis || authorization.modeAuthority?.provenance?.basis || '') }),
    Object.freeze({ claim: 'remote-write', state: boundary.remoteWrite ? 'authorized' : 'not-authorized', controllingArtifact: '', basis: String(boundary.boundary || '') })
  ]);
}

function compactGuidanceAuthority(value = {}, options = {}) {
  if (!value || typeof value !== 'object') return null;
  return Object.freeze({
    state: String(value.state || ''),
    selectedRelationCount: Number(value.selectedRelationCount || 0),
    selectedMaterialCount: Number(value.selectedMaterialCount || 0),
    items: Object.freeze((value.items || []).slice(0, 8).map((item) => Object.freeze({
      state: String(item?.state || ''),
      selector: item?.selector ? Object.freeze({ requirementId: String(item.selector.requirementId || ''), name: String(item.selector.name || ''), purpose: String(item.selector.purpose || ''), basis: String(item.selector.basis || '') }) : null,
      relation: item?.relation ? Object.freeze({ relationType: String(item.relation.relationType || ''), direction: String(item.relation.direction || ''), scope: String(item.relation.scope || ''), target: String(item.relation.target || ''), resolvedTarget: String(item.relation.resolvedTarget || ''), sourceArtifact: item.relation.sourceArtifact ? Object.freeze({ ...item.relation.sourceArtifact }) : null }) : null,
      authorityArtifact: item?.authorityArtifact ? Object.freeze({ path: String(item.authorityArtifact.path || ''), schemaId: String(item.authorityArtifact.schemaId || ''), sha256: String(item.authorityArtifact.sha256 || ''), title: String(item.authorityArtifact.title || ''), candidateSections: Object.freeze((item.authorityArtifact.candidateSections || []).slice(0, 6).map((section) => compactGuidanceSection(section, options))) }) : null,
      linkedSelectedAuthority: Object.freeze((item?.linkedSelectedAuthority || []).slice(0, 6).map((linked) => Object.freeze({ path: String(linked.path || ''), schemaId: String(linked.schemaId || ''), sha256: String(linked.sha256 || ''), title: String(linked.title || ''), selectionBasis: String(linked.selectionBasis || ''), candidateSections: Object.freeze((linked.candidateSections || []).slice(0, 6).map((section) => compactGuidanceSection(section, options))) }))),
      dimensions: item?.dimensions ? Object.freeze({
        availability: Object.freeze({ ...item.dimensions.availability }),
        applicability: Object.freeze({ ...item.dimensions.applicability }),
        requiredness: Object.freeze({ ...item.dimensions.requiredness }),
        activeExecution: Object.freeze({ ...item.dimensions.activeExecution }),
        ownership: Object.freeze({ ...item.dimensions.ownership }),
        completion: Object.freeze({ ...item.dimensions.completion })
      }) : null,
      stepSelection: item?.stepSelection ? Object.freeze({ state: String(item.stepSelection.state || ''), candidateSections: Object.freeze((item.stepSelection.candidateSections || []).slice(0, 6).map((section) => compactGuidanceSection(section, options))), boundary: String(item.stepSelection.boundary || '') }) : null,
      unresolved: Object.freeze((item?.unresolved || []).map((entry) => Object.freeze({ ...entry })))
    }))),
    unresolved: Object.freeze((value.unresolved || []).slice(0, 8).map((item) => Object.freeze({ ...item }))),
    boundary: String(value.boundary || '')
  });
}

function compactGuidanceSection(section = {}, options = {}) {
  return Object.freeze({ heading: String(section.heading || ''), ...(options.includeSectionText ? { text: String(section.text || '') } : {}) });
}

function compactProcessApplicability(value = {}) {
  if (!value || typeof value !== 'object') return null;
  return Object.freeze({
    state: String(value.state || ''),
    facts: Object.freeze((value.facts || []).slice(0, 8).map((item) => Object.freeze({ kind: String(item?.kind || ''), transferId: String(item?.transferId || ''), transferKind: String(item?.transferKind || ''), controllingArtifact: String(item?.controllingArtifact || '') }))),
    provenance: value.provenance ? Object.freeze({ basis: String(value.provenance?.basis || ''), source: String(value.provenance?.source || ''), sourceArtifact: value.provenance?.upstreamProvenance?.sourceArtifact ? Object.freeze({ ...value.provenance.upstreamProvenance.sourceArtifact }) : null }) : null,
    unresolved: Object.freeze((value.unresolved || []).slice(0, 8).map((item) => Object.freeze({ code: String(item?.code || ''), detail: String(item?.detail || '') }))),
    boundary: String(value.boundary || '')
  });
}

function compactDelegationReadinessSummary(value = {}) {
  if (!value || typeof value !== 'object') return null;
  const blockers = value.blockers || [];
  const nextOperations = value.nextOperations || [];
  return Object.freeze({
    state: String(value.state || ''),
    blockerCount: blockers.length,
    blockerCodes: Object.freeze(blockers.slice(0, 8).map((item) => String(item?.code || '')).filter(Boolean)),
    nextOperationCount: nextOperations.length,
    detail: 'Delegation internals are diagnostic-only in the default grounding receipt; use --full when delegation/reconciliation work is actually required.'
  });
}

function compactDelegationReadiness(value = {}) {
  if (!value || typeof value !== 'object') return null;
  return Object.freeze({
    state: String(value.state || ''),
    delegateCapabilityAuthority: value.delegateCapabilityAuthority ? Object.freeze({ ...value.delegateCapabilityAuthority }) : null,
    processApplicability: value.processApplicability ? Object.freeze({ ...value.processApplicability }) : null,
    targetAuthority: value.targetAuthority ? Object.freeze({ ...value.targetAuthority }) : null,
    sourceAuthority: value.sourceAuthority ? Object.freeze({ ...value.sourceAuthority }) : null,
    returnReconciliationExpectation: value.returnReconciliationExpectation ? Object.freeze({ ...value.returnReconciliationExpectation }) : null,
    blockers: Object.freeze((value.blockers || []).slice(0, 8).map((item) => Object.freeze({ ...item }))),
    plainChatFallbackPermitted: Boolean(value.plainChatFallbackPermitted),
    repositoryScanningFallbackPermitted: Boolean(value.repositoryScanningFallbackPermitted),
    nextOperations: Object.freeze((value.nextOperations || []).slice(0, 4).map((item) => Object.freeze({ ...item }))),
    boundary: String(value.boundary || '')
  });
}

function compactOrchestrationReadiness(value = {}) {
  if (!value || typeof value !== 'object') return null;
  const wider = value.widerOrchestration || {};
  const guidance = value.guidanceAuthority || {};
  return Object.freeze({
    state: String(value.state || ''),
    boundedActionReadiness: String(value.boundedActionReadiness || ''),
    widerOrchestration: Object.freeze({
      state: String(wider.state || ''),
      blockerCodes: Object.freeze((wider.blockers || []).slice(0, 8).map((item) => String(item?.code || '')).filter(Boolean))
    }),
    participantMap: String(value.participantMap || ''),
    sourceScope: String(value.sourceScope || ''),
    guidanceAuthority: Object.freeze({
      state: String(guidance.state || ''),
      selectedRelationCount: Number(guidance.selectedRelationCount || 0),
      selectedMaterialCount: Number(guidance.selectedMaterialCount || 0),
      unresolvedCodes: Object.freeze((guidance.unresolved || []).slice(0, 8).map((item) => String(item?.code || '')).filter(Boolean))
    }),
    boundary: 'Decision-facing orchestration summary only; detailed guidance/delegation diagnostics remain available with --full.'
  });
}

function projectRequiredContextItem(item = {}) {
  const contentProjected = Boolean(item.contentProjected && typeof item.content === 'string');
  return Object.freeze({
    requirementId: String(item.requirementId || ''),
    name: String(item.name || ''),
    material: String(item.material || ''),
    purpose: String(item.purpose || ''),
    declaredAvailability: String(item.declaredAvailability || ''),
    state: String(item.state || ''),
    workspaceId: String(item.workspaceId || ''),
    innerPath: String(item.innerPath || ''),
    provenance: item.provenance ? Object.freeze({ basis: String(item.provenance.basis || ''), resolutionKind: String(item.provenance.resolutionKind || ''), providerMode: String(item.provenance.providerMode || '') }) : null,
    contentProjected,
    ...(contentProjected ? { content: item.content } : {})
  });
}

function projectCurrentWorkItem(item = {}) {
  const contentProjected = Boolean(item.contentProjected && typeof item.content === 'string');
  return Object.freeze({
    id: String(item.id || ''),
    path: String(item.path || ''),
    title: String(item.title || ''),
    declaredStatus: String(item.declaredStatus || ''),
    ...(contentProjected ? { contentProjected: true, content: item.content } : { contentProjected: false })
  });
}

function compactContinuity(continuity = {}, options = {}) {
  const proof = continuity.proof || {};
  const roots = proof.roots || [];
  const continuing = Boolean(options.continuing);
  return Object.freeze({
    state: String(continuity.state || ''),
    roots: Object.freeze((continuing ? [] : roots).map((root) => Object.freeze({
      id: String(root.id || ''),
      path: String(root.path || ''),
      title: String(root.title || ''),
      schemaId: String(root.schemaId || ''),
      declaresParent: Boolean(root.declaresParent),
      hasContinuityContext: Boolean(root.hasContinuityContext),
      hasIntegrity: Boolean(root.hasIntegrity)
    }))),
    ...(continuing ? { rootsOmitted: roots.length } : {}),
    blockingIssues: Object.freeze([...(continuity.blockingIssues || [])]),
    blockingIssuesOmitted: Number(continuity.blockingIssuesOmitted || 0),
    recovery: continuity.recovery ? Object.freeze({ ...continuity.recovery }) : null,
    losses: continuity.losses ? Object.freeze({
      state: String(continuity.losses.state || ''),
      blocking: Boolean(continuity.losses.blocking),
      items: Object.freeze([...(continuity.losses.items || [])]),
      itemsOmitted: Number(continuity.losses.itemsOmitted || 0)
    }) : null
  });
}

function compactCarrierLineage(lineage = {}) {
  if (!lineage || typeof lineage !== 'object') return null;
  return Object.freeze({
    prefix: String(lineage.prefix || ''),
    mode: String(lineage.mode || ''),
    dimension: String(lineage.dimension || ''),
    parentDimension: String(lineage.parentDimension || ''),
    checkpointKind: String(lineage.checkpointKind || ''),
    authority: String(lineage.authority || '')
  });
}

function actionable(result = {}) {
  const explicit = Array.isArray(result.actionableFindings) ? result.actionableFindings : [];
  if (explicit.length) return explicit.map((item) => Object.freeze({ ...item }));
  return (result.findings || [])
    .filter((item) => item?.severity === 'error' || item?.severity === 'warning')
    .map((item) => Object.freeze({ ...item }));
}

function detailReceipt(parsed = {}) {
  const flags = parsed.flags || {};
  return Object.freeze({
    fullReceipt: Object.freeze({
      command: String(parsed.surfaceCommand || parsed.command || ''),
      package: sourceArgument(parsed),
      workspace: parsed?.surfaceCommand === 'handoff' ? sourceArgument(parsed) : '',
      route: typeof flags.route === 'string' ? flags.route : '',
      continue: typeof flags.continue === 'string' ? flags.continue : '',
      flag: '--full'
    })
  });
}

function sourceArgument(parsed = {}) {
  return String(parsed.positionals?.[0] || '');
}
