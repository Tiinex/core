import { projectHandoffCarrierOutputFromPackage, projectHandoffHumanOutput } from './carrierProjection.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';


export function recipientV2GenericInvocation(inspection = {}) {
  const startPath = String(inspection.packageContract?.startPath || RECIPIENT_V2_READ_PATH);
  if (!startPath || inspection.status !== 'valid') return '';
  return [
    'Tiinex package attached.',
    '',
    'Cold start: read Start directly; do not list or extract this package.',
    '',
    'Start:',
    startPath,
    ''
  ].join('\n');
}

export function recipientV2StandardInvocation(humanOutput = {}, inspection = {}) {
  const route = humanOutput.selectedRoute || {};
  return recipientV2InvocationForRoute(route, inspection);
}

function recipientV2InvocationForRoute(route = {}, inspection = {}) {
  const routeMeta = (inspection.routes || []).find((item) => String(item.workspaceId || '') === String(route.workspaceId || '') && String(item.workspaceRelativeHandoffPath || '') === String(route.workspaceRelativePath || ''));
  if (!routeMeta?.pointerPath || !route.workspaceRelativePath || !route.workspaceId) return '';
  return [
    'Handoff package attached.',
    '',
    'Cold start: read Start directly; do not list or extract this package.',
    '',
    'Start:',
    String(inspection.packageContract?.startPath || RECIPIENT_V2_READ_PATH),
    'Continue from (do not read native; pass to Tiinex after bootstrap):',
    String(routeMeta.pointerPath),
    ''
  ].join('\n');
}

export function projectRecipientV2HumanOutput(humanOutput = {}, inspection = {}) {
  if (humanOutput.status !== 'ready' && humanOutput.status !== 'selection-required') return humanOutput;
  const routed = String(inspection.packageContract?.packageRole || '') === 'recipient-facing-handoff-carrier';
  const invocation = humanOutput.primary ? (routed ? recipientV2StandardInvocation(humanOutput, inspection) : recipientV2GenericInvocation(inspection)) : '';
  if (humanOutput.primary && !invocation) return Object.freeze({ ...humanOutput, status: 'blocked', findings: Object.freeze([...(humanOutput.findings || []), Object.freeze({ severity: 'error', code: routed ? 'portable.handoff-v2-human-output.route-pointer.unresolved' : 'portable.handoff-v2-human-output.start.unresolved', message: routed ? 'Recipient-v2 human output requires one exact package-local Handoff route pointer for the selected semantic Handoff.' : 'Recipient-v2 generic human output requires one exact qualified package-local Start artifact.' })]) });
  const sharedRoutes = (humanOutput.sharedRouting?.routes || []).map((item) => {
    const route = (inspection.carrierProjection?.routes || []).find((candidate) => String(candidate.id || '') === String(item.routeId || ''))
      || { id: item.routeId, workspaceId: item.workspaceId, workspaceRelativePath: item.workspaceRelativeHandoffPath };
    const transportText = recipientV2InvocationForRoute(route, inspection);
    return transportText ? Object.freeze({ ...item, transportText }) : null;
  });
  if (humanOutput.sharedRouting && sharedRoutes.some((item) => !item)) return Object.freeze({ ...humanOutput, status: 'blocked', findings: Object.freeze([...(humanOutput.findings || []), Object.freeze({ severity: 'error', code: 'portable.handoff-v2-human-output.shared-route-pointer.unresolved', message: 'Recipient-v2 shared human output requires one exact package-local Handoff route pointer for every qualified route.' })]) });
  const sharedRouting = humanOutput.sharedRouting ? Object.freeze({ ...humanOutput.sharedRouting, routes: Object.freeze(sharedRoutes) }) : null;
  const recipientLabel = routed ? String(humanOutput.selectedRoute?.parties?.to || '').trim() : '';
  const presentation = Object.freeze({ ...(humanOutput.presentation || {}), recipientLabel, recipientProjectionAuthority: routed ? 'qualified-selected-handoff-to-endpoint-only' : 'none' });
  return Object.freeze({
    ...humanOutput,
    presentation,
    normalInlineRouting: humanOutput.normalInlineRouting ? Object.freeze({ ...humanOutput.normalInlineRouting, content: invocation }) : null,
    sharedRouting,
    fallbackTransportText: humanOutput.fallbackTransportText ? Object.freeze({ ...humanOutput.fallbackTransportText, content: invocation }) : null,
    boundary: `${String(humanOutput.boundary || '')} Recipient-v2 host-layer transport text is a deterministic projection only: every qualified package may expose its exact Start address; Continue-from and recipient-specific projection exist only for an exact qualified selected Handoff route. Workspace/material/Role presence creates no recipient, holder, participation, delegation, or work authority.`
  });
}

export function projectPortableHandoffCarrierOutputFromPackage(input = {}) {
  const bundle = input.bundle || input;
  const inspection = inspectRecipientFacingV2Topology(bundle);
  if (inspection.detected !== true) return projectHandoffCarrierOutputFromPackage(input);
  const routed = String(inspection.packageContract?.packageRole || '') === 'recipient-facing-handoff-carrier';
  const baseHumanOutput = routed
    ? projectHandoffHumanOutput({ projection: inspection.carrierProjection || {}, route: input.route || input.routePath || input.routeId || '', collisionInstance: input.collisionInstance || input.instance || 1 })
    : genericPackageHumanOutput(inspection, input);
  const humanOutput = projectRecipientV2HumanOutput(baseHumanOutput, inspection);
  const findings = Object.freeze([...(inspection.findings || []), ...(humanOutput.findings || [])]);
  const status = inspection.status === 'valid' && humanOutput.status === 'ready' ? 'ready' : humanOutput.status === 'selection-required' ? 'selection-required' : 'blocked';
  const carrierInspection = boundedRecipientV2Inspection(inspection);
  return deepFreeze({ schema: 'tiinex.portable.handoff-carrier-output-projection.v1', status, carrierInspection, humanOutput, findings, boundary: 'Read-only regeneration of recipient-v2 carrier filename and minimal Start/Continue-from transport address from package-qualified role and route truth. Route-less package roles expose generic Start transport only; package byte/provider internals are intentionally omitted from the human-output projection.' });
}

function genericPackageHumanOutput(inspection = {}, input = {}) {
  const projection = inspection.carrierProjection || {};
  const mode = String(projection.mode || '');
  const ready = inspection.status === 'valid' && projection.status === 'ready' && ['workspace', 'bootstrap'].includes(mode) && (projection.routes || []).length === 0;
  const dimension = String(projection.lineage?.dimension || '001');
  const filename = String(input.filename || input.projectedFilename || `tiinex-${dimension}.handoff-package.zip`);
  return Object.freeze({
    schema: 'tiinex.portable.handoff-human-output.v1', status: ready ? 'ready' : 'blocked',
    primary: ready ? Object.freeze({ kind: `${mode}-package`, filename, dimension, parentDimension: String(projection.lineage?.parentDimension || ''), checkpointKind: String(projection.lineage?.checkpointKind || ''), routeId: '', workspaceId: '', workspaceRelativeHandoffPath: '', collisionInstance: 1, singleHumanTransportChoice: true }) : null,
    normalInlineRouting: ready ? Object.freeze({ kind: 'transport-text', content: '', normalEmission: true, requiredForHumanCompletion: true, placement: 'adjacent-to-primary', authority: 'none' }) : null,
    sharedRouting: null,
    presentation: Object.freeze({ kind: mode === 'bootstrap' ? 'bootstrap-only-carrier' : 'pointerless-workspace-carrier', label: mode === 'bootstrap' ? 'Bootstrap carrier' : 'Workspace carrier', authority: 'none', recipientLabel: '', recipientProjectionAuthority: 'none' }),
    normalEmissionBoundary: Object.freeze({ allowed: Object.freeze(['package-file', 'generic-start-transport-text']), forbidden: Object.freeze(['route-specific-continue-from', 'recipient-label-from-material', 'holder-label', 'current-work-label']) }),
    fallbackTransportText: ready ? Object.freeze({ supported: true, filename: filename.replace(/\.handoff-package\.zip$/i, '.transport.txt'), content: '', normalEmission: false, requiredForHumanCompletion: false, authority: 'none' }) : null,
    selectedRoute: null, findings: Object.freeze([]),
    boundary: 'Route-less recipient-v2 package output projection. Generic Start transport only; material carriage creates no recipient, holder, participation, delegation, or work authority.'
  });
}


function boundedRecipientV2Inspection(inspection = {}) {
  return Object.freeze({
    schema: String(inspection.schema || ''),
    status: String(inspection.status || 'invalid'),
    format: String(inspection.format || ''),
    rootArtifact: inspection.rootArtifact ? Object.freeze({ ...inspection.rootArtifact }) : null,
    entrypoint: inspection.readArtifact ? Object.freeze({ path: String(inspection.readArtifact.path || ''), status: String(inspection.readArtifact.status || '') }) : null,
    workspaces: Object.freeze((inspection.workspaces || []).map((item) => Object.freeze({ workspaceId: String(item.workspaceId || ''), workspaceArtifactPath: String(item.workspaceArtifactPath || ''), workspaceArchivePath: String(item.workspaceArchivePath || '') }))),
    routes: Object.freeze((inspection.routes || []).map((item) => Object.freeze({ pointerPath: String(item.pointerPath || ''), workspaceId: String(item.workspaceId || ''), workspaceRelativeHandoffPath: String(item.workspaceRelativeHandoffPath || '') }))),
    findingSummary: Object.freeze({ ...(inspection.findingSummary || {}) }),
    findings: Object.freeze([...(inspection.findings || [])])
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
