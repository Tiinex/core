export function projectGroundingOrchestrationReadiness({ readinessState = '', participantContext = null, guidanceAuthority = null, sourceEvidence = null, topology = {}, currentWorkAuthority = null } = {}) {
  const boundedAction = String(readinessState || '');
  const participantMap = String(participantContext?.participantMapState || 'not-established');
  const unavailableSources = sourceEvidence?.blockers || [];
  const sourceScope = sourceScopeState(sourceEvidence);
  const guidanceState = String(guidanceAuthority?.state || 'not-declared');
  const blockers = [];
  if (participantMap !== 'explicit-bounded-map') blockers.push(Object.freeze({ code: 'participant-capability-map-not-established', detail: 'Current route grounding does not establish a semantic participant/capability map. Grounding-only Role pointers and endpoint labels are insufficient.' }));
  if (unavailableSources.length) blockers.push(...unavailableSources.map((item) => Object.freeze({ code: item.code || 'authoritative-material-unavailable', detail: item.request || item.name || item.referenceTarget || '' })));
  if (sourceScope !== 'explicit-multi-source') blockers.push(Object.freeze({ code: 'source-authority-scope-bounded', detail: 'Source evidence is bounded to exact carried/current-route material and does not establish whole-program source authority.' }));
  if (guidanceState === 'selected-guidance-authority-incomplete') blockers.push(Object.freeze({
    code: 'selected-guidance-authority-incomplete',
    detail: String(guidanceAuthority?.unresolved?.[0]?.code || 'Current work forward-selects operational guidance authority that could not be qualified completely. Resolve the exact selected Relation/authority chain; do not substitute process/policy inventory or package placement.')
  }));
  if (!(topology.currentFrontier || []).length) blockers.push(Object.freeze({
    code: String(currentWorkAuthority?.state || '') === 'selected-handoff-bounded-work' ? 'current-task-frontier-not-established-for-wider-orchestration' : 'current-work-frontier-unresolved',
    detail: String(currentWorkAuthority?.state || '') === 'selected-handoff-bounded-work'
      ? 'The exact selected Handoff establishes bounded current work through qualified non-Task control artifacts, but no exact current Task frontier is established for wider orchestration. Do not promote nearest Task ancestry.'
      : 'No exact current Task frontier is resolved for orchestration.'
  }));
  return Object.freeze({
    state: blockers.length ? 'bounded-route-only' : 'sufficiently-grounded-for-current-orchestration-scope',
    boundedActionReadiness: boundedAction,
    widerOrchestration: Object.freeze({ state: blockers.length ? 'not-established' : 'bounded-established', blockers: Object.freeze(blockers.slice(0, 8)) }),
    participantMap,
    sourceScope,
    guidanceAuthority: guidanceAuthority || Object.freeze({ state: guidanceState, items: Object.freeze([]), unresolved: Object.freeze([]) }),
    boundary: 'Diagnostic projection only; this is not a new lifecycle state and does not weaken or broaden grounded-to-act. Selected operational guidance is forward-projected only; absence of a guidance selector is not itself a blocker.'
  });
}

function sourceScopeState(sourceEvidence = {}) {
  const workspaces = sourceEvidence?.workspaces || [];
  const qualified = workspaces.filter((item) => ['qualified', 'explicit-profile'].includes(String(item.state || '')));
  if (qualified.length > 1 && qualified.every((item) => item.sources?.length || item.repository || item.rootPath)) return 'explicit-multi-source';
  if (qualified.length) return 'bounded-current-route';
  return 'unresolved';
}
