import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { projectPortableOperatingOverview } from '../overview/operatingOverview.js';
import { summarizePortableFindings } from '../findings.js';
import { directedLineageCone, isRoutedHandoffBundle, materializeQualifiedDetachedLineage, materializeQualifiedWorkspaceSnapshot, normalizeSelectors, projectBlockers, projectRelevantTopology, projectRequiredContext, projectSelectedHandoffCurrentWork, relevantLineageIssues, resolveRequiredContextRecords, resolveSelectedRouteRecords } from './grounding.readiness.support.js';
import { groundPortableColdConsumer } from '../handoff/coldStartQualification.grounding.js';
import { createColdStartMaterialContext, projectGroundedContinuation } from '../handoff/coldStartQualification.materials.js';
import { auditHandoffPackageContextCarriage } from '../handoff/contextAudit.js';
import { acceptedRecoveryMaterial, projectColdStartContinuity, projectExactReferenceRecovery } from './grounding.continuity.js';
import { projectGroundingAuthority } from './grounding.readiness.authority.js';
import { projectGroundingCapsule } from './grounding.capsule.js';
import { projectGroundingOrchestrationReadiness } from './grounding.orchestrationReadiness.js';

export const PORTABLE_GROUNDING_READINESS_SCHEMA_ID = 'tiinex.portable.grounding-readiness.v1';

const MAX_ITEMS = 12;

export function projectPortableGroundingReadiness(input = {}, options = {}) {
  const bundle = input.bundle || input.package || input;
  const handoffMode = isRoutedHandoffBundle(bundle);
  if (!handoffMode) {
    const material = normalizePortableInput(input.materials || input);
    return composeGroundingReadiness({
      mode: 'loaded-material',
      authority: null,
      continuation: null,
      contextAudit: null,
      material,
      requiredContext: [],
      findings: [...(material.findings || [])]
    });
  }

  const route = String(input.route || input.routeId || input.routePath || '').trim();
  const materialContext = createColdStartMaterialContext();
  const grounding = groundPortableColdConsumer({
    ...input,
    bundle,
    package: bundle,
    ingressKind: 'routed-handoff-package',
    route,
    toolingAvailable: true
  }, { ...options, coldStartMaterialContext: materialContext });
  const authority = withExplicitGroundingAuthorityInputs(grounding, input);
  const continuation = projectGroundedContinuation({
    bundle,
    route,
    grounding,
    qualification: { status: 'not-assessed-by-ground' },
    packageSourcePath: String(input.packageSourcePath || '')
  }, materialContext);
  const contextAudit = auditHandoffPackageContextCarriage({ bundle });
  const snapshot = materializeQualifiedWorkspaceSnapshot(bundle, contextAudit, {
    includeLegacyTopics: Boolean(input.includeLegacyTopics || options.includeLegacyTopics)
  });
  const detachedLineage = materializeQualifiedDetachedLineage(bundle, contextAudit, {
    includeLegacyTopics: Boolean(input.includeLegacyTopics || options.includeLegacyTopics)
  });
  const recoveryMaterial = acceptedRecoveryMaterial(input.recoveryAcceptance || input.recovery || input.recoveredMaterial || {});
  const material = normalizePortableInput({
    files: [...snapshot.files, ...detachedLineage.files, ...recoveryMaterial.files],
    findings: [...snapshot.findings, ...detachedLineage.findings, ...recoveryMaterial.findings]
  });
  return composeGroundingReadiness({
    mode: 'routed-handoff-package',
    authority,
    continuation,
    contextAudit,
    material,
    requiredContext: continuation.requiredContext || [],
    requiredContextSelectors: normalizeSelectors(input.includeRequiredContext || options.includeRequiredContext),
    includeCurrentWork: Boolean(input.includeCurrentWork || options.includeCurrentWork),
    findings: [
      ...(grounding.findings || []),
      ...(contextAudit.findings || []),
      ...(snapshot.findings || []),
      ...(detachedLineage.findings || []),
      ...(material.findings || [])
    ]
  });
}

export function composeGroundingReadiness({ mode = 'loaded-material', authority = null, continuation = null, contextAudit = null, material = {}, requiredContext = [], requiredContextSelectors = [], includeCurrentWork = false, findings = [] } = {}) {
  const records = Array.isArray(material.records) ? material.records : [];
  const lineage = resolveLineage(records, { depth: 'portable-grounding-readiness' });
  const requiredRecordResolution = resolveRequiredContextRecords(requiredContext, records);
  const requiredContextProjection = projectRequiredContext(requiredContext, requiredContextSelectors);
  const handoffMode = mode === 'routed-handoff-package';
  const routeRecordIds = resolveSelectedRouteRecords(authority, records);
  const relevantIds = handoffMode
    ? directedLineageCone(lineage, routeRecordIds)
    : new Set((lineage.nodes || []).map((node) => node.id));
  const relevantRecords = records.filter((record) => relevantIds.has(record.id));
  const overview = projectPortableOperatingOverview({ records: relevantRecords });
  const topology = projectRelevantTopology(lineage, relevantIds, overview.frontierCandidates || [], routeRecordIds);
  const currentWorkAuthority = projectSelectedHandoffCurrentWork(authority, records, topology);
  const effectiveTopology = Object.freeze({ ...topology, currentFrontier: currentWorkAuthority.frontier });
  const continuity = projectColdStartContinuity({ mode, lineage, routeRecordIds, authority, material });
  const lineageIssues = filterQualifiedRecoveryBoundaryIssues(relevantLineageIssues(lineage, relevantIds), continuity);
  const routeBlockingLineageIssues = filterQualifiedRecoveryBoundaryIssues(relevantLineageIssues(lineage, routeRecordIds), continuity);
  const combinedFindings = projectGroundingFindings(dedupeFindings([
    ...findings,
    ...filterFindingsForIds(lineage.findings || [], relevantIds),
    ...(overview.findings || [])
  ]), continuity);

  const missingEvidence = [];
  const reasons = [];
  const known = [];
  const inferred = [];
  const unresolved = [];
  const humanOnly = [];
  let holderBindingActReady = !handoffMode;

  if (handoffMode) {
    const route = authority?.selectedRoute || null;
    const roleState = String(authority?.role?.state || 'unresolved');
    const holderState = String(authority?.holderBinding?.state || 'unresolved');
    const holderAuthorizationState = String(authority?.holderBinding?.authorization?.state || (holderState === 'not-applicable' ? 'not-applicable' : 'unresolved'));
    if (!route || String(authority?.status || '') === 'blocked') missing(missingEvidence, unresolved, 'authority-route-unqualified', 'The selected Handoff route is not qualified for this grounding result.');
    else known.push(evidence('qualified-handoff-route', 'qualified', route.id || route.pointerPath || 'selected-route'));
    if (roleState === 'qualified' || roleState === 'not-applicable') known.push(evidence('recipient-role-boundary', roleState, authority?.role?.endpoint?.label || 'recipient'));
    else if (roleState === 'blocked') missing(missingEvidence, unresolved, 'recipient-role-blocked', 'The Handoff recipient Role boundary is blocked or contradictory.');
    else missing(missingEvidence, unresolved, 'recipient-role-unresolved', 'The Handoff recipient Role boundary is not qualified for act-ready grounding.');

    if (holderState === 'qualified' || holderState === 'not-applicable') {
      known.push(evidence('session-holder-role-binding', holderState, authority?.holderBinding?.roleLabel || authority?.role?.endpoint?.label || 'recipient'));
    } else if (holderState === 'blocked') {
      holderBindingActReady = false;
      missing(missingEvidence, unresolved, 'session-holder-role-binding-blocked', 'The explicit consuming-session holder Role contradicts the selected Handoff recipient Role.');
    } else {
      holderBindingActReady = false;
      unresolved.push(evidence('session-holder-role-binding', 'unresolved', `recipient Role ${authority?.role?.endpoint?.label || authority?.handoff?.to || 'recipient'} is qualified separately from the consuming session`));
      reasons.push(reason('session-holder-role-binding-unresolved', 'The selected recipient Role is not yet bound to this consuming session. Exact qualified selected-Handoff consumption may bind it only when the exact recipient Role authorizes Assignment Mode `handoff`; otherwise supply an explicit matching session holder Role binding authorized by that Role.'));
    }

    if (holderState === 'not-applicable') {
      holderBindingActReady = true;
      known.push(evidence('session-holder-role-binding-authorization', 'not-applicable', 'selected Handoff recipient is not a Role endpoint'));
    } else if (holderState === 'qualified') {
      if (holderAuthorizationState === 'qualified') {
        holderBindingActReady = true;
        known.push(evidence('session-holder-role-binding-authorization', 'qualified', authority?.holderBinding?.authorization?.provenance?.roleArtifactPath || authority?.role?.endpoint?.label || 'recipient Role material'));
      } else {
        holderBindingActReady = false;
        unresolved.push(evidence('session-holder-role-binding-authorization', holderAuthorizationState || 'unresolved', authority?.holderBinding?.authorization?.reasonCode || 'exact qualified canonical assignment-mode authority does not authorize the asserted binding mechanism'));
        reasons.push(reason('session-holder-role-binding-authorization-unresolved', 'The consuming-session Role binding matches the selected recipient Role, but exact qualified canonical assignment-mode authority does not authorize the asserted mechanism. Matching session input or Handoff selection alone cannot make the route act-ready.'));
      }
    }

    const required = Array.isArray(requiredContext) ? requiredContext : [];
    const unresolvedRequired = required.filter((entry) => entry.state !== 'qualified');
    if (unresolvedRequired.length) missing(missingEvidence, unresolved, 'required-context-unqualified', `${unresolvedRequired.length} declared Required Context item(s) are not exact-qualified.`);
    else known.push(evidence('required-context-closure', 'qualified', `${required.length} item(s)`));
    if (String(continuation?.state || '') !== 'ready') missing(missingEvidence, unresolved, 'continuation-not-ready', 'The grounded continuation is not ready for substantive work.');
    const returnPackage = continuation?.returnPackage || {};
    if (returnPackage.expected) {
      const returnTo = String(returnPackage.returnTo || '').trim();
      const returnToReference = String(returnPackage.returnToReference || '').trim();
      if (returnToReference) {
        known.push(evidence('return-endpoint-reference', 'qualified', returnToReference));
      } else if (returnTo) {
        known.push(evidence('return-endpoint-readable', 'declared', returnTo));
        unresolved.push(evidence('return-endpoint-reference', 'not-supplied-nonblocking', 'Return To Reference is an optional resolution aid. Exact canonical return authoring may require additional endpoint resolution later, but its absence does not block unrelated bounded work from becoming act-ready.'));
      } else {
        missing(missingEvidence, unresolved, 'return-endpoint-unqualified', 'Completion Expectation requires a return-facing endpoint, but no readable Return To target is available.');
      }
    }
    const workspaceCoverage = projectWorkspaceActionCoverage(contextAudit);
    if (!workspaceCoverage.qualified) missing(missingEvidence, unresolved, 'workspace-snapshot-coverage-unqualified', workspaceCoverage.message);
    else known.push(evidence('workspace-snapshot-coverage', 'qualified', `${workspaceCoverage.count} workspace representation(s): ${workspaceCoverage.completeCount} complete, ${workspaceCoverage.boundedCount} bounded`));
    for (const item of requiredRecordResolution.missing) missing(missingEvidence, unresolved, 'required-context-not-in-snapshot', item);
    if (!routeRecordIds.size) missing(missingEvidence, unresolved, 'selected-route-not-in-snapshot', 'The qualified selected Handoff route was not found at its exact carried Workspace path.');
  } else {
    unresolved.push(evidence('bounded-handoff-authority', 'not-supplied', 'loaded material only'));
    reasons.push(reason('discussion-only-without-handoff', 'Loaded material can support bounded discussion, but no Handoff authority/Required Context closure was supplied for act-ready grounding.'));
  }

  if (!records.length) missing(missingEvidence, unresolved, 'no-artifact-records', 'No readable Tiinex artifact records were loaded for grounding.');
  else known.push(evidence('loaded-artifact-records', 'known', `${records.length} record(s)`));

  inferred.push(evidence('relevant-lineage-scope', 'bounded-inference', handoffMode ? 'directed declared-Parent cone around the exact selected Handoff route within qualified carried Workspace representations (complete or bounded as declared) plus independently qualified exact detached Parent-boundary cache records' : 'all loaded records'));
  inferred.push(evidence('lineage-leaf-role', 'bounded-inference', 'derived only from declared Parent edges in the shared resolver'));

  if (handoffMode) {
    if (routeBlockingLineageIssues.length) {
      missing(missingEvidence, unresolved, 'selected-route-lineage-unresolved', `${routeBlockingLineageIssues.length} Parent-lineage ambiguity/missing/integrity issue(s) affect the selected Handoff route itself.`);
    } else if (topology.routeLeaves.length) {
      known.push(evidence('selected-route-parent-lineage-leaf', 'resolved', `${topology.routeLeaves.length} selected-route leaf/leaves`));
    } else {
      missing(missingEvidence, unresolved, 'selected-route-lineage-leaf-missing', 'The selected Handoff route is not a resolved Parent-lineage leaf in the qualified carried Workspace material.');
    }
    if (lineageIssues.length > routeBlockingLineageIssues.length) unresolved.push(evidence('upstream-lineage-diagnostics', continuity.state === 'qualified' ? 'degraded-nonblocking' : 'blocking-for-cold-start-continuity', `${lineageIssues.length - routeBlockingLineageIssues.length} upstream Parent-lineage issue(s) remain outside the selected-route edge boundary.`));
  } else if (lineageIssues.length) {
    missing(missingEvidence, unresolved, 'loaded-lineage-unresolved', `${lineageIssues.length} loaded Parent-lineage ambiguity/missing/integrity issue(s) remain.`);
  } else if (topology.leaves.length) {
    known.push(evidence('loaded-parent-lineage-leaves', 'resolved', `${topology.leaves.length} loaded leaf/leaves`));
  } else {
    missing(missingEvidence, unresolved, 'loaded-lineage-leaf-missing', 'No resolved Parent-lineage leaf is available in the loaded material.');
  }

  if (handoffMode) {
    if (continuity.state === 'qualified') known.push(evidence('cold-start-root-continuity', 'qualified', `${continuity.proof.qualifiedRoots.length} qualified root/recovery boundary item(s); ${continuity.proof.ancestorRecordsChecked} ancestor record(s) checked without projecting ancestor bodies.`));
    else missing(missingEvidence, unresolved, 'cold-start-root-continuity-unproven', `Cold-start continuity to a qualified root or exact recovery boundary is unproven; ${continuity.blockingIssues.length} blocking Parent/root issue(s) remain.`);
  }

  if (topology.currentTasks.length) known.push(evidence('declared-current-work-candidates', 'qualified-candidates', `${topology.currentTasks.length} exact-qualified nonterminal Task candidate(s) are present on the selected route lineage; candidate presence alone does not establish selected-Handoff currentness.`));
  else unresolved.push(evidence('declared-current-work-candidates', 'unresolved', 'no exact-qualified nonterminal Task candidate on the selected route lineage'));

  if (currentWorkAuthority.state === 'selected-handoff-task-frontier-resolved') {
    known.push(evidence('selected-handoff-current-task', 'resolved', `${currentWorkAuthority.frontier.length} exact Task control target(s) selected by the current Handoff.`));
  } else if (currentWorkAuthority.state === 'selected-handoff-bounded-work') {
    known.push(evidence('selected-handoff-bounded-work', 'resolved', 'The selected Handoff explicitly controls current bounded work through qualified non-Task artifacts; nearest Task ancestry remains context-only.'));
  } else if (currentWorkAuthority.state === 'nearest-task-frontier-resolved') {
    known.push(evidence('declared-current-frontier', 'resolved-fallback', `${currentWorkAuthority.frontier.length} nearest current Task anchor(s) are used only because the selected Handoff declares no Controlling Artifact target.`));
  } else {
    reasons.push(reason('current-frontier-not-resolved', 'Selected-Handoff current-work control is not qualified enough for bounded action. Explicit Handoff control declarations fail closed and cannot be replaced by nearest-Task ancestry.'));
  }
  if ((currentWorkAuthority.contextCandidates || []).length) inferred.push(evidence('nearest-task-context-only', 'context-only', `${currentWorkAuthority.contextCandidates.length} nearest Task ancestor(s) remain visible as context but are not selected current work.`));

  const frontierTaskIds = new Set((currentWorkAuthority.frontier || []).map((item) => String(item.id || '')));
  const blockers = projectBlockers(overview.blockerSignals || [], frontierTaskIds);
  const currentWorkProjection = projectCurrentWork(currentWorkAuthority, records, includeCurrentWork);
  const completionQualification = projectCurrentWorkCompletionQualification({ currentWorkAuthority, records, authority, handoffMode });
  const capsule = projectGroundingCapsule({ authority, continuation, contextAudit, requiredContext, records, topology: effectiveTopology, blockers, currentWorkAuthority });
  if (continuity.losses?.items?.length) unresolved.push(evidence('non-critical-material-loss', 'degraded-nonblocking', `${continuity.losses.items.length} unavailable non-lineage asset/reference item(s) remain visible without blocking unrelated work.`));
  const externalHumanGates = Array.isArray(authority?.humanOnlyGates) ? authority.humanOnlyGates : [];
  for (const gate of externalHumanGates) humanOnly.push(evidence('human-only-gate', 'declared', String(gate?.label || gate || 'human gate')));

  let state = 'grounded-to-act';
  if (missingEvidence.length) state = 'insufficient-grounding';
  else if (!handoffMode || !holderBindingActReady || !currentWorkAuthority.actReady || humanOnly.length) state = 'grounded-to-discuss';
  if (state === 'grounded-to-act') reasons.push(reason('bounded-act-ready', 'Selected Handoff authority, explicit consuming-session holder Role binding, exact qualified holder-assignment authorization where the recipient is a Role, exact Required Context, qualified carried Workspace coverage (complete or bounded as declared), cold-start continuity to a qualified root or exact recovery boundary, the selected-route Parent-lineage leaf, and selected-Handoff current-work control are all resolved enough for the next bounded action.'));
  const orchestrationReadiness = projectGroundingOrchestrationReadiness({ readinessState: state, participantContext: capsule.participantContext, guidanceAuthority: capsule.guidanceAuthority, sourceEvidence: capsule.sourceEvidence, topology: effectiveTopology, currentWorkAuthority });

  return Object.freeze({
    schema: PORTABLE_GROUNDING_READINESS_SCHEMA_ID,
    status: state === 'insufficient-grounding' ? 'blocked' : 'ready',
    readiness: Object.freeze({
      state,
      reasons: Object.freeze(reasons.slice(0, MAX_ITEMS)),
      missingEvidence: Object.freeze(missingEvidence.slice(0, MAX_ITEMS)),
      nextAction: nextActionFor(state, topology, currentWorkAuthority, continuity, authority, capsule)
    }),
    authority: projectGroundingAuthority(authority, mode),
    coverage: Object.freeze({
      mode,
      loadedRecords: records.length,
      relevantRecords: relevantIds.size,
      requiredContext: Object.freeze({
        declared: requiredContext.length,
        matchedInWorkspaceSnapshots: requiredRecordResolution.matched,
        missingFromWorkspaceSnapshots: requiredRecordResolution.missing.length,
        items: requiredContextProjection.items,
        itemsOmitted: requiredContextProjection.itemsOmitted,
        bodiesProjected: requiredContextProjection.bodiesProjected,
        bodiesAvailable: requiredContextProjection.bodiesAvailable,
        requestedSelectors: requiredContextProjection.requestedSelectors,
        unmatchedSelectors: requiredContextProjection.unmatchedSelectors
      }),
      workspaceSnapshots: contextAudit ? projectWorkspaceActionCoverage(contextAudit) : Object.freeze({ state: 'not-supplied', qualified: false, count: 0, completeCount: 0, boundedCount: 0, unqualified: Object.freeze([]), message: 'No carried Workspace context audit was supplied.' })
    }),
    lineage: Object.freeze({
      state: handoffMode ? (routeBlockingLineageIssues.length ? 'unresolved' : topology.routeLeaves.length ? (lineageIssues.length ? 'resolved-with-upstream-degradation' : 'resolved') : 'missing-leaf') : (lineageIssues.length ? 'unresolved' : topology.leaves.length ? 'resolved' : 'missing-leaf'),
      basis: 'declared-parent-only',
      filenameDimensionsUsed: false,
      carrierDimensionsUsed: false,
      roots: Object.freeze(topology.roots.slice(0, MAX_ITEMS)),
      rootsOmitted: Math.max(0, topology.roots.length - MAX_ITEMS),
      leaves: Object.freeze(topology.leaves.slice(0, MAX_ITEMS)),
      leavesOmitted: Math.max(0, topology.leaves.length - MAX_ITEMS),
      selectedRouteLeaves: Object.freeze(topology.routeLeaves.slice(0, MAX_ITEMS)),
      selectedRouteLeavesOmitted: Math.max(0, topology.routeLeaves.length - MAX_ITEMS),
      blockingIssues: Object.freeze(routeBlockingLineageIssues.slice(0, MAX_ITEMS)),
      blockingIssuesOmitted: Math.max(0, routeBlockingLineageIssues.length - MAX_ITEMS),
      diagnosticIssues: Object.freeze(lineageIssues.slice(0, MAX_ITEMS)),
      diagnosticIssuesOmitted: Math.max(0, lineageIssues.length - MAX_ITEMS),
      boundary: 'Leaf/root roles are derived only from loaded declared Parent edges produced by the shared lineage resolver. Filename numbering, carrier dimensions, directory depth, branch names, and Task lifecycle labels are never substituted for Parent topology.'
    }),
    continuity,
    returnPackage: continuation?.returnPackage || null,
    completionQualification,
    orchestrationReadiness,
    delegationReadiness: capsule.delegationReadiness,
    capsule,
    currentWork: Object.freeze({
      state: currentWorkAuthority.state,
      authorityMode: currentWorkAuthority.mode,
      frontier: currentWorkProjection.frontier,
      frontierOmitted: Math.max(0, (currentWorkAuthority.frontier || []).length - MAX_ITEMS),
      candidates: Object.freeze(topology.currentTasks.slice(0, MAX_ITEMS)),
      candidatesOmitted: Math.max(0, topology.currentTasks.length - MAX_ITEMS),
      contextCandidates: Object.freeze((currentWorkAuthority.contextCandidates || []).slice(0, MAX_ITEMS)),
      contextCandidatesOmitted: Math.max(0, (currentWorkAuthority.contextCandidates || []).length - MAX_ITEMS),
      handoffContract: Object.freeze({
        selectedHandoff: String(currentWorkAuthority.selectedHandoff || ''),
        controls: Object.freeze((currentWorkAuthority.controls || []).slice(0, MAX_ITEMS)),
        unresolved: Object.freeze((currentWorkAuthority.unresolved || []).slice(0, MAX_ITEMS)),
        boundary: String(currentWorkAuthority.boundary || '')
      }),
      blockers: Object.freeze(blockers.slice(0, MAX_ITEMS)),
      blockersOmitted: Math.max(0, blockers.length - MAX_ITEMS),
      bodiesProjected: currentWorkProjection.bodiesProjected,
      bodiesAvailable: currentWorkProjection.bodiesAvailable,
      bodyProjectionRequested: Boolean(includeCurrentWork),
      lifecycleIsLineagePosition: false,
      lineageLeafMeansWorkflowFrontier: false
    }),
    evidence: Object.freeze({
      known: Object.freeze(known.slice(0, MAX_ITEMS)),
      inferred: Object.freeze(inferred.slice(0, MAX_ITEMS)),
      unresolved: Object.freeze(unresolved.slice(0, MAX_ITEMS)),
      humanOnly: Object.freeze(humanOnly.slice(0, MAX_ITEMS))
    }),
    findingSummary: summarizePortableFindings(combinedFindings),
    actionableFindings: Object.freeze(combinedFindings.filter((item) => item.severity === 'error' || item.severity === 'warning').slice(0, MAX_ITEMS)),
    actionableFindingsOmitted: Math.max(0, combinedFindings.filter((item) => item.severity === 'error' || item.severity === 'warning').length - MAX_ITEMS),
    deeper: Object.freeze({
      requiredContextBodies: handoffMode ? 'Re-run the same ground command with --include-required-context <requirement-id,name|all> only when exact qualified body text is needed.' : 'not-applicable',
      currentWorkBody: handoffMode ? (currentWorkAuthority.frontier.length ? 'Re-run the same ground command with --include-current-work when the exact selected-Handoff-controlled Task body is needed; --continue <workspace-dir> includes it automatically.' : 'The selected Handoff itself is the bounded current-work contract; no Task body is promoted merely from nearest ancestry.') : 'not-applicable',
      lineage: 'Use resolve-lineage/search-lineage only when the bounded selected-route leaf/current-work pointers above are insufficient.',
      coldStartQualification: handoffMode ? 'Use qualify-cold-start only when cold-start process qualification/evidence is itself required; ground does not claim pre-takeover host observations.' : 'not-applicable'
    }),
    boundary: 'Decision-oriented grounding projection only. Handoff/Role/Task/Parent artifacts retain authority; this projection composes their loaded evidence and fails visible rather than inventing missing currentness or lineage.'
  });
}


function withExplicitGroundingAuthorityInputs(grounding = {}, input = {}) {
  const context = input.delegationContext && typeof input.delegationContext === 'object' ? input.delegationContext : {};
  const selected = {
    delegateCapabilityAuthority: input.delegateCapabilityAuthority || context.delegateCapabilityAuthority || null,
    processApplicability: input.processApplicability || context.processApplicability || null,
    delegationTargetAuthority: input.delegationTargetAuthority || context.delegationTargetAuthority || context.targetAuthority || null,
    implementationSourceAuthority: input.implementationSourceAuthority || context.implementationSourceAuthority || context.sourceAuthority || null,
    delegationReturnReconciliationExpectation: input.delegationReturnReconciliationExpectation || context.delegationReturnReconciliationExpectation || context.returnReconciliationExpectation || null
  };
  const additions = Object.fromEntries(Object.entries(selected).filter(([, value]) => value && typeof value === 'object'));
  return Object.freeze({ ...(grounding || {}), ...additions, ...(Object.keys(context).length ? { delegationContext: Object.freeze({ ...context }) } : {}) });
}

function projectWorkspaceActionCoverage(contextAudit = {}) {
  const workspaces = Array.isArray(contextAudit?.workspaceMaterializations) ? contextAudit.workspaceMaterializations : [];
  const summaries = workspaces.map((workspace) => {
    const coverage = workspaceCoverageState(workspace);
    const qualification = String(workspace?.qualification || '').trim().toLowerCase();
    const qualified = ['complete', 'bounded'].includes(coverage) && qualification === 'qualified';
    return Object.freeze({ workspaceId: String(workspace?.workspaceId || ''), coverage, qualification: qualification || 'unresolved', qualified });
  });
  const aggregateReady = String(contextAudit?.status || '') === 'ready' && String(contextAudit?.coverage?.state || '') === 'qualified';
  const qualified = aggregateReady && summaries.length > 0 && summaries.every((item) => item.qualified);
  const completeCount = summaries.filter((item) => item.coverage === 'complete').length;
  const boundedCount = summaries.filter((item) => item.coverage === 'bounded').length;
  const unqualified = summaries.filter((item) => !item.qualified);
  const message = qualified
    ? `Qualified carried Workspace coverage is established for ${summaries.length} representation(s): ${completeCount} complete, ${boundedCount} bounded.`
    : !aggregateReady
      ? 'Carried Workspace context audit is not qualified for bounded action readiness.'
      : !summaries.length
        ? 'No qualified carried Workspace representation is available for the selected Handoff route.'
        : `Carried Workspace representation qualification is incomplete for ${unqualified.length} workspace(s); bounded carriage is actionable only when each carried representation is independently qualified as complete or bounded.`;
  return Object.freeze({
    state: qualified ? 'qualified' : 'unqualified',
    qualified,
    count: summaries.length,
    completeCount,
    boundedCount,
    unqualified: Object.freeze(unqualified),
    message,
    boundary: 'Complete and bounded carriage remain distinct. Bounded coverage can satisfy current-route action readiness only when the carried representation itself is qualified; it never implies whole-Workspace or whole-program authority.'
  });
}

function workspaceCoverageState(workspace = {}) {
  const explicit = String(workspace?.coverage || workspace?.materialization || '').trim().toLowerCase();
  if (explicit === 'complete' || explicit === 'bounded') return explicit;
  const reason = String(workspace?.reason || '').trim().toLowerCase();
  if (reason.includes('bounded') || reason.includes('partial')) return 'bounded';
  if (reason.includes('complete')) return 'complete';
  return 'unresolved';
}

function projectCurrentWorkCompletionQualification({ currentWorkAuthority = {}, records = [], authority = null, handoffMode = false } = {}) {
  if (!handoffMode) return Object.freeze({
    state: 'not-applicable',
    taskLifecycle: 'not-applicable',
    doneCriteriaEvaluation: 'not-applicable',
    returnExpectation: 'not-applicable',
    taskStatuses: Object.freeze([]),
    doneCriteria: Object.freeze([]),
    boundary: 'Loaded-material grounding without an exact selected Handoff does not project a Handoff completion contract.'
  });

  const completion = authority?.handoff?.completionExpectation || {};
  const signalKind = String(completion.signalKind || '').trim().toLowerCase();
  const returnExpectation = signalKind && !['none', 'unknown'].includes(signalKind) ? 'declared' : 'not-declared';
  const recordById = new Map((records || []).map((record) => [String(record.id || ''), record]));
  const taskStatuses = [];
  const doneCriteria = [];
  for (const item of currentWorkAuthority.frontier || []) {
    const id = String(item.id || '');
    const status = String(item.declaredStatus || '').trim();
    if (status) taskStatuses.push(Object.freeze({ id, path: String(item.path || ''), status }));
    const record = recordById.get(id);
    const criteria = taskDoneCriteria(record?.markdown || '');
    if (criteria) doneCriteria.push(Object.freeze({ id, path: String(item.path || ''), text: compactText(criteria, 600) }));
  }

  const taskFrontierPresent = (currentWorkAuthority.frontier || []).length > 0;
  const boundedNonTask = String(currentWorkAuthority.state || '') === 'selected-handoff-bounded-work';
  const state = taskFrontierPresent || boundedNonTask ? 'not-established' : 'unresolved';
  return Object.freeze({
    state,
    taskLifecycle: taskFrontierPresent ? 'qualified-task-frontier-nonterminal' : boundedNonTask ? 'selected-bounded-work-without-task-terminal' : 'current-work-unresolved',
    doneCriteriaEvaluation: taskFrontierPresent ? 'qualified-lifecycle-evaluation-required' : 'not-machine-evaluated',
    boundedWorkCompletion: taskFrontierPresent || boundedNonTask ? 'not-established' : 'unresolved',
    taskClosure: taskFrontierPresent ? 'not-established' : 'not-applicable',
    lifecycleQualificationOperation: taskFrontierPresent ? 'project-lifecycle-readiness' : '',
    returnExpectation,
    returnDisposition: returnExpectation === 'declared' ? 'bounded-result-return-permitted-without-task-closure' : 'no-return-protocol-declared',
    returnTransition: returnExpectation === 'declared' ? 'not-established-by-grounding' : 'not-applicable',
    returnTiming: returnExpectation === 'declared' ? 'not-qualified-by-grounding' : 'not-applicable',
    signalKind: String(completion.signalKind || ''),
    signalMeaning: String(completion.signalMeaning || ''),
    returnTo: String(completion.returnTo || ''),
    returnToReference: String(completion.returnToReference || ''),
    taskStatuses: Object.freeze(taskStatuses),
    doneCriteria: Object.freeze(doneCriteria),
    boundary: 'Grounding qualifies the exact bounded work and any declared return protocol, but does not evaluate free-text Done Criteria, mutate Task lifecycle, prove bounded-work completion, establish Task closure, or establish that return is the current transition. A declared return protocol and availability of prepare-return define how a bounded result may be returned, not when return is due. A canonical return Handoff may carry a bounded result without closing the controlling Task only after the recipient has produced or verified that bounded result from the qualified work authority. Any Task completion/closure claim requires a separately qualified lifecycle projection (project-lifecycle-readiness) from explicit qualified facts; recipient/model judgment over free-text Done Criteria is not lifecycle authority.'
  });
}

function taskDoneCriteria(markdown = '') {
  const normalized = String(markdown || '').replace(/\r\n?/g, '\n');
  const match = normalized.match(/(?:^|\n)##\s+Done Criteria\s*\n([\s\S]*?)(?=\n##\s+|\n#\s+Continuity Integrity|$)/i);
  return match ? String(match[1] || '').trim() : '';
}

function projectCurrentWork(currentWorkAuthority = {}, records = [], includeCurrentWork = false) {
  const recordById = new Map((records || []).map((record) => [String(record.id || ''), record]));
  const frontier = (currentWorkAuthority.frontier || []).slice(0, MAX_ITEMS).map((item) => {
    const record = recordById.get(String(item.id || ''));
    const available = Boolean(record && typeof record.markdown === 'string' && record.markdown.length > 0);
    return Object.freeze({
      ...item,
      contentProjected: Boolean(includeCurrentWork && available),
      ...(includeCurrentWork && available ? { content: record.markdown } : {})
    });
  });
  const bodiesAvailable = (currentWorkAuthority.frontier || []).filter((item) => {
    const record = recordById.get(String(item.id || ''));
    return Boolean(record && typeof record.markdown === 'string' && record.markdown.length > 0);
  }).length;
  return Object.freeze({
    frontier: Object.freeze(frontier),
    bodiesProjected: frontier.filter((item) => item.contentProjected).length,
    bodiesAvailable
  });
}

function nextActionFor(state, topology, currentWorkAuthority = {}, continuity = {}, authority = null, capsule = null) {
  if (state === 'grounded-to-act') {
    if (currentWorkAuthority.mode === 'selected-handoff-explicit-control') return Object.freeze({
      kind: 'continue-selected-handoff-bounded-work',
      target: currentWorkAuthority.frontier?.length === 1 ? currentWorkAuthority.frontier[0]?.path || currentWorkAuthority.selectedHandoff || '' : currentWorkAuthority.selectedHandoff || '',
      basis: currentWorkAuthority.frontier?.length ? 'exact selected Handoff explicitly controls the qualified nonterminal Task target(s); nearest Task ancestry is context-only; grounding does not establish Task completion or evaluate Done Criteria' : 'exact selected Handoff explicitly controls qualified non-Task work artifacts; no Task is promoted from nearest ancestry; grounding does not establish bounded-work completion'
    });
    return Object.freeze({ kind: 'continue-bounded-handoff-work', target: currentWorkAuthority.frontier?.[0]?.path || topology.currentFrontier[0]?.path || '', basis: 'qualified authority + qualified session holder Role binding + exact Required Context + cold-start continuity + selected-route Parent leaf + compatibility nearest-Task fallback because the selected Handoff declares no explicit Controlling Artifact target' });
  }
  if (state === 'grounded-to-discuss' && String(authority?.holderBinding?.state || 'unresolved') === 'unresolved') return Object.freeze({ kind: 'establish-session-holder-role-binding', target: authority?.role?.endpoint?.label || authority?.handoff?.to || '', basis: 'recipient Role qualification is separate from consuming-session holder binding; exact qualified selected-Handoff consumption may establish `handoff` assignment when authorized, otherwise an explicit authorized binding is required; no transport/provider/assistant-user identity inference is permitted' });
  if (state === 'grounded-to-discuss' && String(authority?.holderBinding?.state || '') === 'qualified' && String(authority?.holderBinding?.authorization?.state || 'unresolved') !== 'qualified') return Object.freeze({
    kind: 'resolve-session-holder-binding-authorization',
    target: authority?.holderBinding?.authorization?.provenance?.roleArtifactPath || authority?.role?.endpoint?.label || authority?.handoff?.to || '',
    basis: 'a matching session Role binding is not semantic authorization by itself; exact qualified recipient Role Holder Relationship authority must establish the selected assignment mode'
  });
  if (state === 'grounded-to-discuss') return Object.freeze({ kind: currentWorkAuthority.mode === 'selected-handoff-explicit-control' ? 'resolve-selected-handoff-current-work-control' : (currentWorkAuthority.frontier?.length ? 'obtain-bounded-action-authority-or-human-gate' : 'resolve-current-work-frontier'), target: currentWorkAuthority.selectedHandoff || currentWorkAuthority.frontier?.[0]?.path || topology.currentTasks[0]?.path || '', basis: 'discussion-ready but selected-Handoff current-work control or another act-readiness condition is unresolved' });
  if (continuity?.state === 'unproven') return Object.freeze({
    kind: continuity.recovery?.state === 'host-action-available' ? 'recover-required-parent-with-host-action' : 'request-exact-required-parent-material',
    target: continuity.recovery?.target || '',
    basis: 'cold-start continuity to a qualified root or exact recovery boundary is required before substantive work',
    recovery: continuity.recovery || null
  });
  const missingContext = (capsule?.sourceEvidence?.blockers || []).find((item) => item.code === 'authoritative-material-unavailable' && String(item.referenceTarget || '').trim());
  if (missingContext) {
    const recovery = projectExactReferenceRecovery(String(missingContext.referenceTarget || ''), authority, {
      materialLabel: `Required Context material ${missingContext.name || missingContext.requirementId || ''}`.trim(),
      whyRequired: String(missingContext.blockingReason || 'Exact declared Required Context material is required before substantive work.'),
      purpose: `recover exact Required Context material ${missingContext.name || missingContext.requirementId || ''}`.trim()
    });
    return Object.freeze({
      kind: recovery.state === 'host-action-available' ? 'recover-required-context-with-host-action' : 'request-exact-required-context-material',
      target: recovery.target || '', basis: 'exact declared Required Context is unresolved; recovery remains read-only and exact-target bounded', recovery
    });
  }
  return Object.freeze({ kind: 'resolve-missing-grounding-evidence', target: '', basis: 'one or more blocking authority/context/lineage conditions remain' });
}

function nodeSummary(node = {}) { return Object.freeze({ id: node.id || '', path: node.path || '', title: node.title || '', schemaId: node.schemaId || '', trace: node.trace || '' }); }
function evidence(code, state, detail) { return Object.freeze({ code, state, detail: compactText(detail, 280) }); }
function reason(code, message) { return Object.freeze({ code, message }); }
function missing(list, unresolved, code, message) { const item = reason(code, message); list.push(item); unresolved.push(evidence(code, 'unresolved', message)); }
function filterQualifiedRecoveryBoundaryIssues(items = [], continuity = {}) {
  const ids = new Set((continuity?.proof?.recoveryBoundaryRoots || []).map((item) => String(item?.id || '')));
  if (!ids.size) return items;
  return items.filter((item) => !(ids.has(String(item?.nodeId || '')) && ['lineage.parent.exactTargetNotLoaded', 'lineage.parent.missing'].includes(String(item?.code || ''))));
}

function projectGroundingFindings(items = [], continuity = {}) {
  const ids = new Set((continuity?.proof?.recoveryBoundaryRoots || []).map((item) => String(item?.id || '')));
  if (!ids.size) return items;
  return items.map((item) => {
    if (!ids.has(String(item?.nodeId || '')) || String(item?.code || '') !== 'lineage.parent.exactTargetNotLoaded') return item;
    return Object.freeze({
      ...item,
      severity: 'info',
      message: 'Historical Parent bytes are not loaded because this artifact qualifies an exact version-stable Parent recovery boundary; fetch is not required for the current bounded grounding.'
    });
  });
}

function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, source: PORTABLE_GROUNDING_READINESS_SCHEMA_ID, params }); }
function compactText(value = '', limit = 240) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, Math.max(0, limit - 1))}…` : text; }
function filterFindingsForIds(items = [], ids = new Set()) { return items.filter((item) => !item?.nodeId || ids.has(item.nodeId)); }
function dedupeFindings(items = []) { return dedupeBy(items, (item) => `${item.severity || ''}:${item.code || ''}:${item.nodeId || ''}:${item.target || ''}:${item.message || ''}`); }
function dedupeBy(items = [], keyFn) { const map = new Map(); for (const item of items) { const key = keyFn(item); if (!map.has(key)) map.set(key, item); } return Object.freeze([...map.values()]); }
