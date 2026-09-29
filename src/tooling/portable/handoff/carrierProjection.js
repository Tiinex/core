import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { normalizeHandoffCarrierPrefix } from './carrierLineage.js';
import { HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION } from './handoffPackageV1.constants.js';

export const HANDOFF_CARRIER_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-carrier-projection.v1';
export const HANDOFF_CARRIER_PROJECTION_PATH = '';
export const HANDOFF_HUMAN_OUTPUT_SCHEMA_ID = 'tiinex.portable.handoff-human-output.v1';

export function buildHandoffCarrierProjection(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  return inspection.carrierProjection || Object.freeze({
    schema: HANDOFF_CARRIER_PROJECTION_SCHEMA_ID,
    status: 'blocked',
    mode: 'handoff',
    startPath: '',
    routes: Object.freeze([]),
    workspaces: Object.freeze([]),
    findings: Object.freeze(inspection.findings || []),
    boundary: 'Carrier projection is derived only from direct Handoff Package V1 inspection.'
  });
}

export function inspectHandoffCarrierProjection(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  return Object.freeze({
    schema: `${HANDOFF_CARRIER_PROJECTION_SCHEMA_ID}.inspection`,
    status: inspection.status === 'valid' ? 'valid' : 'invalid',
    projection: inspection.carrierProjection || null,
    findings: Object.freeze(inspection.findings || []),
    boundary: 'Read-only projection inspection derived from the direct Handoff Package V1 inspector; no serialized companion authority exists.'
  });
}

export function projectHandoffHumanOutput(input = {}) {
  const projection = input.projection || input.carrierProjection || {};
  const routes = Array.isArray(projection.routes) ? projection.routes : [];
  const readyRoutes = routes.filter((route) => String(route.state || '') === 'qualified');
  const dimension = String(projection.lineage?.dimension || '001');
  const startPath = String(projection.startPath || `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-1-READ-BEFORE-PROCEEDING.trace.md`);
  const lineagePrefix = normalizeHandoffCarrierPrefix(projection.lineage?.prefix || '');
  const requestedPrefix = normalizeHandoffCarrierPrefix(input.carrierPrefix || '');
  const prefixConflict = Boolean(lineagePrefix && requestedPrefix && lineagePrefix !== requestedPrefix);
  const carrierPrefix = lineagePrefix || requestedPrefix;
  const routeSelector = String(input.route || '').trim();
  const selected = routeSelector
    ? readyRoutes.find((route) => [route.id, route.routeId, route.pointerPath, route.workspaceRelativePath, route.workspaceRelativeHandoffPath].map(String).includes(routeSelector)) || null
    : readyRoutes.length === 1 ? readyRoutes[0] : null;
  const partiesReady = Boolean(selected && safeCarrierRoleToken(selected.from || selected.parties?.from) && safeCarrierRoleToken(selected.to || selected.parties?.to));
  const status = projection.status !== 'ready'
    ? 'blocked'
    : prefixConflict
      ? 'prefix-conflict'
      : readyRoutes.length > 1 && !selected
        ? 'selection-required'
        : readyRoutes.length && !carrierPrefix
          ? 'prefix-required'
          : readyRoutes.length && !partiesReady
            ? 'route-parties-required'
            : readyRoutes.length ? 'ready' : 'blocked';
  const collisionInstance = normalizeCarrierCollisionInstance(input.collisionInstance || 1);
  const baseFilename = status === 'ready' ? transportFilename(input.filename, carrierFilename(carrierPrefix, dimension, selected)) : '';
  const filename = status === 'ready' ? carrierFilenameForInstance(baseFilename, collisionInstance) : '';
  const continueFrom = String(selected?.pointerPath || '');
  const transportText = status === 'ready' ? routedTransportText(startPath, continueFrom) : '';
  return Object.freeze({
    schema: HANDOFF_HUMAN_OUTPUT_SCHEMA_ID,
    status,
    primary: status === 'ready' ? Object.freeze({
      kind: 'handoff-package',
      filename,
      carrierPrefix,
      dimension,
      startPath,
      routeId: String(selected?.id || selected?.routeId || ''),
      workspaceId: String(selected?.workspaceId || ''),
      workspaceRelativeHandoffPath: String(selected?.workspaceRelativeHandoffPath || selected?.workspaceRelativePath || ''),
      from: String(selected?.from || selected?.parties?.from || ''),
      to: String(selected?.to || selected?.parties?.to || ''),
      collisionInstance,
      singleHumanTransportChoice: true
    }) : null,
    routes: Object.freeze(readyRoutes.map((route) => {
      const routeFilename = carrierPrefix && safeCarrierRoleToken(route.from || route.parties?.from) && safeCarrierRoleToken(route.to || route.parties?.to)
        ? carrierFilename(carrierPrefix, dimension, route)
        : '';
      return Object.freeze({
        routeId: String(route.id || route.routeId || ''),
        pointerPath: String(route.pointerPath || ''),
        workspaceId: String(route.workspaceId || ''),
        workspaceRelativeHandoffPath: String(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || ''),
        from: String(route.from || route.parties?.from || ''),
        to: String(route.to || route.parties?.to || ''),
        projectedFilename: routeFilename,
        transportText: routedTransportText(startPath, String(route.pointerPath || ''))
      });
    })),
    presentation: Object.freeze({
      kind: 'handoff-package-v1',
      label: 'Tiinex Handoff Package',
      recipientLabel: String(selected?.to || selected?.parties?.to || ''),
      recipientProjectionAuthority: selected ? 'qualified-handoff-to-endpoint-only' : 'none',
      copyableSurfaceRequired: true,
      exactContentRequired: true,
      fencedCodeBlockWhenSupported: 'required-for-routing-text',
      markdownCapableHostRendering: 'one package attachment plus exact adjacent Tooling-projected routing text',
      wrapperAuthority: 'none'
    }),
    normalEmissionBoundary: Object.freeze({
      allowed: Object.freeze(['package-file', 'exact-adjacent-routing-text']),
      forbidden: Object.freeze(['loose-result-file', 'loose-evidence-file', 'loose-handoff-markdown', 'workspace-archive', 'manually-constructed-package', 'manually-reconstructed-routing', 'semantic-work-summary-prose']),
      canonicalFilePayloadCount: 1,
      workspaceArtifactsAsLooseTransportFiles: false,
      semanticWorkSummaryProse: false,
      helperArtifacts: false,
      manuallyReconstructedRouting: false,
      duplicateNormalFileChoices: false
    }),
    normalInlineRouting: selected ? Object.freeze({ kind: 'transport-text', routeId: String(selected.id || selected.routeId || ''), continueFrom, content: transportText, normalEmission: true, requiredForHumanCompletion: true, placement: 'adjacent-to-primary', authority: 'qualified-selected-handoff-route' }) : null,
    sharedRouting: readyRoutes.length > 1 ? Object.freeze({ selectionRequired: !selected, routes: Object.freeze(readyRoutes.map((route) => Object.freeze({ routeId: String(route.id || route.routeId || ''), continueFrom: String(route.pointerPath || ''), transportText: routedTransportText(startPath, String(route.pointerPath || '')) }))) }) : null,
    fallbackTransportText: status === 'ready' ? Object.freeze({ supported: true, filename: filename.replace(/\.handoff-package\.zip$/i, '.transport.txt'), content: transportText, normalEmission: false, requiredForHumanCompletion: false, authority: 'qualified-selected-handoff-route' }) : null,
    selectedRoute: selected ? Object.freeze({ id: String(selected.id || selected.routeId || ''), workspaceId: String(selected.workspaceId || ''), workspaceRelativePath: String(selected.workspaceRelativeHandoffPath || selected.workspaceRelativePath || ''), parties: Object.freeze({ from: String(selected.from || selected.parties?.from || ''), to: String(selected.to || selected.parties?.to || '') }) }) : null,
    findings: Object.freeze(projection.findings || []),
    boundary: 'Carrier filenames project qualified carrier lineage plus exact Handoff endpoint semantics. Generic Start and route-specific Continue From text are projected from the qualified carrier contract; hosts do not author Tiinex transport semantics.'
  });
}

export function projectWorkspaceCarrierHumanOutput(input = {}) {
  const projection = input.projection || input.carrierProjection || {};
  const ready = projection.status === 'ready' && projection.mode === 'workspace' && (projection.routes || []).length === 0;
  const dimension = String(projection.lineage?.dimension || '001');
  const lineagePrefix = normalizeHandoffCarrierPrefix(projection.lineage?.prefix || '');
  const startPath = String(projection.startPath || `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-1-READ-BEFORE-PROCEEDING.trace.md`);
  const collisionInstance = normalizeCarrierCollisionInstance(input.collisionInstance || 1);
  const canonicalFilename = `${lineagePrefix || 'tiinex'}-${dimension}.handoff-package.zip`;
  const baseFilename = transportFilename(input.filename, canonicalFilename);
  const filename = carrierFilenameForInstance(baseFilename, collisionInstance);
  const content = ready ? routeLessTransportText(startPath, 'workspace') : '';
  return Object.freeze({
    schema: HANDOFF_HUMAN_OUTPUT_SCHEMA_ID,
    status: ready ? 'ready' : 'blocked',
    primary: ready ? Object.freeze({ kind: 'workspace-package', filename, carrierPrefix: lineagePrefix, dimension, startPath, parentDimension: String(projection.lineage?.parentDimension || ''), checkpointKind: String(projection.lineage?.checkpointKind || ''), routeId: '', workspaceId: '', workspaceRelativeHandoffPath: '', collisionInstance, singleHumanTransportChoice: true }) : null,
    routes: Object.freeze([]),
    normalInlineRouting: ready ? Object.freeze({ kind: 'transport-text', content, normalEmission: true, requiredForHumanCompletion: true, placement: 'adjacent-to-primary', authority: 'qualified-package-start-only' }) : null,
    sharedRouting: null,
    presentation: Object.freeze({ kind: 'pointerless-workspace-carrier', label: 'Workspace carrier', authority: 'none', recipientLabel: '', recipientProjectionAuthority: 'none' }),
    normalEmissionBoundary: Object.freeze({ allowed: Object.freeze(['package-file', 'generic-start-transport-text']), forbidden: Object.freeze(['route-specific-continue-from', 'recipient-label-from-material']) }),
    fallbackTransportText: ready ? Object.freeze({ supported: true, filename: filename.replace(/\.handoff-package\.zip$/i, '.transport.txt'), content, normalEmission: false, requiredForHumanCompletion: false, authority: 'qualified-package-start-only' }) : null,
    selectedRoute: null,
    findings: Object.freeze(projection.findings || []),
    boundary: 'Pointerless Workspace-carrier output projection. Exact Start transport text is allowed; Handoff Continue From and recipient projection remain absent.'
  });
}

export function projectBootstrapCarrierHumanOutput(input = {}) {
  const projection = input.projection || input.carrierProjection || {};
  const ready = projection.status === 'ready' && projection.mode === 'bootstrap' && (projection.routes || []).length === 0 && (projection.workspaces || []).length === 0;
  const dimension = String(projection.lineage?.dimension || '001');
  const startPath = String(projection.startPath || `${HANDOFF_PACKAGE_V1_ARTIFACT_ROOT_DIMENSION}-1-READ-BEFORE-PROCEEDING.trace.md`);
  const filename = transportFilename(input.filename, `tiinex-${dimension}.handoff-package.zip`);
  const content = ready ? routeLessTransportText(startPath, 'bootstrap') : '';
  return Object.freeze({
    schema: HANDOFF_HUMAN_OUTPUT_SCHEMA_ID,
    status: ready ? 'ready' : 'blocked',
    primary: ready ? Object.freeze({ kind: 'bootstrap-package', filename, dimension, startPath, parentDimension: String(projection.lineage?.parentDimension || ''), checkpointKind: String(projection.lineage?.checkpointKind || ''), routeId: '', workspaceId: '', workspaceRelativeHandoffPath: '', collisionInstance: 1, singleHumanTransportChoice: true }) : null,
    routes: Object.freeze([]),
    normalInlineRouting: ready ? Object.freeze({ kind: 'transport-text', content, normalEmission: true, requiredForHumanCompletion: true, placement: 'adjacent-to-primary', authority: 'qualified-package-start-only' }) : null,
    sharedRouting: null,
    presentation: Object.freeze({ kind: 'bootstrap-only-carrier', label: 'Bootstrap carrier', authority: 'none', recipientLabel: '', recipientProjectionAuthority: 'none' }),
    normalEmissionBoundary: Object.freeze({ allowed: Object.freeze(['package-file', 'generic-start-transport-text']), forbidden: Object.freeze(['workspace-label', 'route-specific-continue-from', 'recipient-label', 'holder-label', 'current-work-label']) }),
    fallbackTransportText: ready ? Object.freeze({ supported: true, filename: filename.replace(/\.handoff-package\.zip$/i, '.transport.txt'), content, normalEmission: false, requiredForHumanCompletion: false, authority: 'qualified-package-start-only' }) : null,
    selectedRoute: null,
    findings: Object.freeze(projection.findings || []),
    boundary: 'Bootstrap-only carrier output projection. Exact Start transport text only; no Workspace, Handoff route, recipient, holder, Role, or work projection exists.'
  });
}

function carrierFilename(prefix, dimension, route = {}) {
  return `${normalizeHandoffCarrierPrefix(prefix)}-${dimension}-${safeCarrierRoleToken(route.from || route.parties?.from)}-to-${safeCarrierRoleToken(route.to || route.parties?.to)}.handoff-package.zip`;
}

function safeCarrierRoleToken(value = '') {
  return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-z0-9._-]+/gu, '-').replace(/^-+|-+$/gu, '').slice(0, 80);
}

function transportFilename(candidate = '', fallback = '') {
  const raw = String(candidate || '');
  const value = raw.trim();
  if (!value) return fallback;
  if (raw !== value || !value.endsWith('.handoff-package.zip') || /[<>:"/\\|?*\x00-\x1f\x7f]/.test(value) || /[. ]$/.test(value) || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value) || new TextEncoder().encode(value).byteLength > 255) {
    throw new Error('portable.handoff-carrier.filename.invalid');
  }
  return value;
}

function coldStartInstruction(startPath = '') {
  return `Handoff package attached.\n\nCold start: read Start directly; do not enumerate or broadly extract this package. Follow only Start's qualified bootstrap extraction instruction.\n\nStart:\n${startPath}`;
}

function routedTransportText(startPath = '', continueFrom = '') {
  return `${coldStartInstruction(startPath)}\n\nContinue from (do not read native; pass to Tiinex after bootstrap):\n${continueFrom}\n`;
}

function routeLessTransportText(startPath = '', mode = 'workspace') {
  const boundary = mode === 'bootstrap'
    ? 'This is a bootstrap-only carrier. After bootstrap, pass the package to Tiinex orientation. No Workspace material, Handoff Continue From route, recipient, or work authority is declared or implied.'
    : 'This is a pointerless Workspace carrier. After bootstrap, pass the package to Tiinex orientation/material projection. No Handoff Continue From route, recipient, or work transfer is declared or implied.';
  const reuse = mode === 'bootstrap'
    ? '\nRuntime reuse check: after extracting the declared bootstrap, run `node <extract-root>/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs version --json` before broad runtime/schema/companion re-reading. If `composition.sha256` equals the already-active Tiinex runtime, the manifest-declared runtime composition is byte-identical and prior interpretation may be reused. Different composition, later Build At, different Core version, different ZIP SHA, or later arrival does not by itself establish semantic supersession.'
    : '';
  return `${coldStartInstruction(startPath)}\n\n${boundary}${reuse}\n`;
}

export function projectHandoffCarrierOutputFromPackage(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  const projection = inspection.carrierProjection || {};
  const common = { projection, filename: input.filename || input.transportFilename || '', collisionInstance: input.collisionInstance || 1 };
  if (projection.mode === 'workspace') return projectWorkspaceCarrierHumanOutput(common);
  if (projection.mode === 'bootstrap') return projectBootstrapCarrierHumanOutput(common);
  return projectHandoffHumanOutput({ ...common, route: input.route || input.pointer || '' });
}

export function projectHandoffCarrierOutputCollision(input = {}) {
  let filename = '';
  try { filename = transportFilename(input.filename || input.baseFilename || '', ''); }
  catch {
    return Object.freeze({
      schema: 'tiinex.portable.handoff-carrier-output-collision.v1',
      status: 'blocked',
      state: 'blocked',
      reasonCode: 'filename-invalid',
      filename: '',
      collisionInstance: 0,
      boundary: 'Hosts report observed destination filenames. Core owns transport-only collision naming; collision markers never alter carrier lineage.'
    });
  }
  if (!filename) return Object.freeze({
    schema: 'tiinex.portable.handoff-carrier-output-collision.v1',
    status: 'blocked',
    state: 'blocked',
    reasonCode: 'filename-required',
    filename: '',
    collisionInstance: 0,
    boundary: 'Hosts report observed destination filenames. Core owns transport-only collision naming; collision markers never alter carrier lineage.'
  });
  const observed = new Set((Array.isArray(input.existingFilenames) ? input.existingFilenames : [])
    .map((value) => String(value || '').trim().toLocaleLowerCase())
    .filter(Boolean));
  for (let collisionInstance = 1; collisionInstance < 1000; collisionInstance += 1) {
    const candidate = carrierFilenameForInstance(filename, collisionInstance);
    if (!observed.has(candidate.toLocaleLowerCase())) return Object.freeze({
      schema: 'tiinex.portable.handoff-carrier-output-collision.v1',
      status: 'ready',
      state: collisionInstance === 1 ? 'canonical-free' : 'collision-suffixed',
      reasonCode: '',
      filename: candidate,
      collisionInstance,
      boundary: 'Hosts report observed destination filenames. Core owns transport-only collision naming; collision markers never alter carrier lineage.'
    });
  }
  return Object.freeze({
    schema: 'tiinex.portable.handoff-carrier-output-collision.v1',
    status: 'blocked',
    state: 'blocked',
    reasonCode: 'collision-space-exhausted',
    filename: '',
    collisionInstance: 0,
    boundary: 'Hosts report observed destination filenames. Core owns transport-only collision naming; collision markers never alter carrier lineage.'
  });
}

export function carrierFilenameForInstance(filename = '', instance = 1) {
  const text = String(filename || '').trim();
  const n = normalizeCarrierCollisionInstance(instance);
  if (!text || n <= 1) return text;
  const suffix = '.handoff-package.zip';
  const duplicateOrdinal = n - 1;
  return text.toLowerCase().endsWith(suffix)
    ? `${text.slice(0, -suffix.length)} (${duplicateOrdinal})${suffix}`
    : `${text} (${duplicateOrdinal})`;
}

function normalizeCarrierCollisionInstance(value = 1) {
  const n = Number(value || 1);
  if (!Number.isInteger(n) || n < 1 || n > 999999) throw new Error('portable.handoff-carrier.collision-instance.invalid');
  return n;
}
