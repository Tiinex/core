import { summarizePortableFindings } from '../findings.js';
import { planRecipientRelativeHandoffMaterialClosure } from './materialClosure.plan.js';
import { qualifyHandoffMaterialClosurePlanReadiness } from './materialClosure.readiness.js';
import { manufactureHandoffPackageV1Direct } from './handoffPackageV1.manufacture.js';

export function manufactureRecipientRelativeHandoffPackage(input = {}, options = {}) {
  const preflight = qualifyRecipientRelativeHandoffManufacturePreflight(input, options);
  if (preflight.state === 'blocked') {
    const findings = Object.freeze([...(preflight.findings || [])]);
    return Object.freeze({
      schema: 'tiinex.portable.handoff-manufacturing.v1', status: 'blocked', executable: false, transportExecutable: false,
      verification: Object.freeze({ preflight: preflight.state, manufacturePath: 'preflight-blocked-before-package-v1-assembly', packageInspection: 'not-run', roundtrip: 'not-run' }),
      plan: preflight.plan || null, bundle: null, inspection: null, carrierProjection: null, carrierLineage: input.carrierLineage || null,
      operationBoundary: Object.freeze({ operationClass: 'local-handoff-package-manufacture', sourceMutation: false, remoteMutation: false, hostBehaviorAuthority: 'none' }),
      preflight, findings, findingSummary: summarizePortableFindings(findings),
      boundary: 'Direct Package V1 manufacture fails closed before package assembly when qualified Handoff/material preflight is blocked.'
    });
  }
  const direct = manufactureHandoffPackageV1Direct(input, { ...options, verifyRoundtrip: input.verifyRoundtrip !== false && options.verifyRoundtrip !== false });
  const findings = Object.freeze([...(preflight.findings || []), ...(direct.findings || [])]);
  const ready = direct.status === 'ready';
  return Object.freeze({
    schema: 'tiinex.portable.handoff-manufacturing.v1', status: ready ? 'ready' : 'blocked', executable: ready, transportExecutable: ready,
    verification: Object.freeze({ preflight: preflight.state, manufacturePath: 'direct-qualified-model-to-package-v1', packageInspection: String(direct.inspection?.status || 'not-run'), roundtrip: String(direct.roundtrip?.status || 'not-requested') }),
    plan: preflight.plan || null, bundle: direct.bundle, inspection: direct.inspection, carrierProjection: direct.inspection?.carrierProjection || null, carrierLineage: direct.inspection?.carrierProjection?.lineage || input.carrierLineage || null, roundtrip: direct.roundtrip || null,
    toolingBootstrap: input.toolingBootstrap || null, manufacturingEvidence: input.manufacturingEvidence || null,
    operationBoundary: Object.freeze({ operationClass: 'local-handoff-package-manufacture', sourceMutation: false, remoteMutation: false, hostBehaviorAuthority: 'none', physicalRoundtripVerification: String(direct.roundtrip?.status || 'not-requested') }),
    preflight, findings, findingSummary: summarizePortableFindings(findings),
    boundary: 'One direct tiinex.handoff.package.v1 new-output path from the already-qualified Core model to readable carrier artifacts, exact Workspace/cache ZIP bytes, direct inspection and physical roundtrip verification.'
  });
}

export function qualifyRecipientRelativeHandoffManufacturePreflight(input = {}, options = {}) {
  const plan = input.plan || planRecipientRelativeHandoffMaterialClosure(input, options);
  const planReadiness = qualifyHandoffMaterialClosurePlanReadiness(plan);
  const schemaReferencePreflight = input.schemaReferencePreflight || input.manufacturingEvidence?.schemaReferencePreflight || null;
  const returnCarrierReservationPreflight = input.returnCarrierReservationPreflight || input.manufacturingEvidence?.returnCarrierReservationPreflight || null;
  const reconciliationProofQualification = input.reconciliationProofQualification || input.manufacturingEvidence?.reconciliationProof || null;
  const externalFindings = [
    ...(schemaReferencePreflight?.findings || []),
    ...(returnCarrierReservationPreflight?.findings || []),
    ...(reconciliationProofQualification?.findings || [])
  ];
  const findings = Object.freeze([...(plan.findings || []), ...externalFindings]);
  const findingBlocked = findings.some((item) => String(item?.severity || '').toLowerCase() === 'error');
  const stateBlocked = [schemaReferencePreflight, returnCarrierReservationPreflight, reconciliationProofQualification]
    .some((item) => String(item?.state || '') === 'blocked');
  const closureBlocked = planReadiness.state !== 'qualified' || !planReadiness.expectedRequiredClosureReady;
  return Object.freeze({
    state: findingBlocked || stateBlocked || closureBlocked ? 'blocked' : 'qualified',
    plan,
    planReadiness,
    findings,
    blockers: Object.freeze({ findingBlocked, stateBlocked, closureBlocked }),
    boundary: 'Pure Package V1 manufacture preflight. It may qualify selected work and material closure, but creates no package bytes.'
  });
}
