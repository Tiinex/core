import { planRecipientRelativeHandoffMaterialClosure } from './materialClosure.plan.js';

export const PORTABLE_HANDOFF_PARTICIPANT_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-participant-projection.v1';

export function projectPortableHandoffParticipants(input = {}) {
  const plan = planRecipientRelativeHandoffMaterialClosure(input);
  const semanticRoutes = [...(plan.requirements?.semanticParticipantRoutes || [])];
  const findings = dedupeFindings([
    ...(plan.findings || []),
    ...(input.schemaReferencePreflight?.findings || []),
    ...(input.returnCarrierReservationPreflight?.findings || []),
    ...(input.reconciliationProofQualification?.findings || []),
    ...(input.manufacturingEvidence?.packageParentMaterialClosurePreflight?.findings || []),
    ...(input.manufacturingEvidence?.requiredContextWorkspaceSelectionPreflight?.findings || [])
  ]);
  const route = semanticRoutes.length === 1 ? semanticRoutes[0] : null;
  if (semanticRoutes.length !== 1) findings.push(finding('error', 'portable.handoff-participants.route-cardinality', 'Participant projection requires exactly one explicit Handoff route.', { routeCount: semanticRoutes.length }));
  const participants = Object.freeze((route?.participantRoles || []).map((role = {}) => Object.freeze({
    label: String(role.label || ''),
    reference: String(role.reference || ''),
    workspaceId: String(role.workspaceId || ''),
    path: String(role.path || '')
  })));
  const errorCount = findings.filter((item) => item.severity === 'error').length;
  const routeState = String(route?.state || (semanticRoutes.length ? 'blocked' : 'unresolved'));
  const blocked = plan.status !== 'ready' || routeState === 'blocked' || errorCount > 0;
  return deepFreeze({
    schema: PORTABLE_HANDOFF_PARTICIPANT_PROJECTION_SCHEMA_ID,
    status: blocked ? 'blocked' : 'ready',
    route: route ? {
      workspaceId: String(route.routeWorkspaceId || ''),
      path: String(route.routePath || ''),
      currentTask: route.currentTask ? { ...route.currentTask } : null
    } : null,
    participantAuthority: {
      state: blocked ? 'blocked' : routeState,
      participants,
      count: participants.length
    },
    closure: { status: String(plan.status || 'blocked'), requiredClosureReady: Boolean(plan.requiredClosureReady) },
    findings: Object.freeze(findings),
    findingSummary: summarizeFindings(findings),
    boundary: 'Read-only route qualification and semantic participant projection from the same Core manufacture inputs. It creates no participant authority, package, carrier lineage, or host selection.'
  });
}

function finding(severity, code, message, details = {}) { return Object.freeze({ severity, code, message, details: Object.freeze({ ...details }) }); }
function dedupeFindings(items = []) {
  const seen = new Set(); const out = [];
  for (const item of items) {
    const key = `${item?.severity || ''}\u0000${item?.code || ''}\u0000${item?.message || ''}\u0000${JSON.stringify(item?.details || {})}`;
    if (seen.has(key)) continue; seen.add(key); out.push(Object.freeze({ ...(item || {}) }));
  }
  return out;
}
function summarizeFindings(findings = []) {
  const counts = { error: 0, warning: 0, info: 0, total: findings.length };
  for (const item of findings) if (Object.prototype.hasOwnProperty.call(counts, item.severity)) counts[item.severity] += 1;
  return Object.freeze({ status: counts.error ? 'blocked' : counts.warning ? 'attention' : 'clean', counts: Object.freeze(counts) });
}
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
