export function projectGroundingOrchestrationReadiness({ readinessState = '', participantContext = null, processApplicability = null, sourceEvidence = null, topology = {} } = {}) {
  const boundedAction = String(readinessState || '');
  const participantMap = String(participantContext?.participantMapState || 'not-established');
  const unavailableSources = sourceEvidence?.blockers || [];
  const sourceScope = sourceScopeState(sourceEvidence);
  const processState = String(processApplicability?.state || 'not-established');
  const blockers = [];
  if (participantMap !== 'explicit-bounded-map') blockers.push(Object.freeze({ code: 'participant-capability-map-not-established', detail: 'Current route grounding does not establish a semantic participant/capability map. Grounding-only Role pointers and endpoint labels are insufficient.' }));
  if (unavailableSources.length) blockers.push(...unavailableSources.map((item) => Object.freeze({ code: item.code || 'authoritative-material-unavailable', detail: item.request || item.name || item.referenceTarget || '' })));
  if (sourceScope !== 'explicit-multi-source') blockers.push(Object.freeze({ code: 'source-authority-scope-bounded', detail: 'Source evidence is bounded to exact carried/current-route material and does not establish whole-program source authority.' }));
  if (processState !== 'explicit-qualified-authority') blockers.push(Object.freeze({
    code: 'process-applicability-semantic-authority-not-established',
    detail: String(processApplicability?.unresolved?.[0]?.detail || 'Current grounding does not contain an explicit upstream-qualified process-applicability projection; process inventory and Role carriage are not substitutes.')
  }));
  if (!(topology.currentFrontier || []).length) blockers.push(Object.freeze({ code: 'current-work-frontier-unresolved', detail: 'No exact current Task frontier is resolved for orchestration.' }));
  return Object.freeze({
    state: blockers.length ? 'bounded-route-only' : 'sufficiently-grounded-for-current-orchestration-scope',
    boundedActionReadiness: boundedAction,
    widerOrchestration: Object.freeze({ state: blockers.length ? 'not-established' : 'bounded-established', blockers: Object.freeze(blockers.slice(0, 8)) }),
    participantMap,
    sourceScope,
    processApplicability: processApplicability || Object.freeze({ state: processState, unresolved: Object.freeze([]) }),
    boundary: 'Diagnostic projection only; this is not a new lifecycle state and does not weaken or broaden grounded-to-act. Route authorization is not treated as whole-program understanding.'
  });
}

function sourceScopeState(sourceEvidence = {}) {
  const workspaces = sourceEvidence?.workspaces || [];
  const qualified = workspaces.filter((item) => ['qualified', 'explicit-profile'].includes(String(item.state || '')));
  if (qualified.length > 1 && qualified.every((item) => item.sources?.length || item.repository || item.rootPath)) return 'explicit-multi-source';
  if (qualified.length) return 'bounded-current-route';
  return 'unresolved';
}
