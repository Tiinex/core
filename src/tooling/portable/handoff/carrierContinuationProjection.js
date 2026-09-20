import { advanceHandoffCarrierMajor } from './carrierLineage.js';

export const HANDOFF_CARRIER_CONTINUATION_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-carrier-continuation-projection.v1';

const MAX_SIBLING_INDEX = 9999;
const POINTER_PATH_RE = /^(\d{3}(?:-\d+)*)-handoff-pointer\.trace\.md$/;
const ORIENTATION_SCHEMA_ID = 'tiinex.portable.handoff-cold-consumer-orientation.v1';
const INSPECTION_SCHEMA_ID = 'tiinex.portable.recipient-facing-handoff-v2.inspection.v1';

export function projectHandoffCarrierContinuation(input = {}) {
  const parent = normalizeQualifiedParentTopology(input);
  const parentDimension = normalizeDimension(
    input.parentDimension
      || input.parentLineage?.dimension
      || parent?.carrierLineage?.dimension
      || parent?.carrierProjection?.lineage?.dimension
      || ''
  );
  const parentPackagePath = String(input.parentPackagePath || '').trim();
  const parentPackageSha256 = normalizeSha256(input.parentPackageSha256 || '');
  const outgoingRoutes = normalizeOutgoingRoutes(input.outgoingRoutes || input.routes || input.handoffRoutes || []);
  const explicitMajor = input.explicitMajor === true || input.major === true || input.packageMajor === true;
  const selectedRoutePointer = String(input.selectedParentRoutePointer || input.selectedRoutePointer || '').trim();
  const selectedRouteId = String(input.selectedParentRouteId || input.selectedRouteId || '').trim();

  const common = {
    schema: HANDOFF_CARRIER_CONTINUATION_PROJECTION_SCHEMA_ID,
    version: 1,
    parent: freeze({
      qualification: parent?.qualification || 'unresolved',
      dimension: parentDimension,
      routeCount: Array.isArray(parent?.routes) ? parent.routes.length : 0,
      packagePath: parentPackagePath,
      packageSha256: parentPackageSha256
    }),
    outgoing: freeze({
      routeCount: outgoingRoutes.length,
      routes: outgoingRoutes
    }),
    authority: continuationAuthority(),
    boundary: continuationBoundary()
  };

  if (!parent) return freeze({
    ...common,
    status: 'blocked',
    state: 'unresolved',
    mode: explicitMajor ? 'explicit-major' : 'ordinary-continuation',
    reasonCode: 'qualified-parent-route-topology-unavailable',
    selection: selectionProjection('unresolved', null, selectedRoutePointer, selectedRouteId),
    allocation: null,
    lineage: null
  });

  if (!parentDimension) return freeze({
    ...common,
    status: 'blocked',
    state: 'unresolved',
    mode: explicitMajor ? 'explicit-major' : 'ordinary-continuation',
    reasonCode: 'qualified-parent-carrier-dimension-unresolved',
    selection: selectionProjection('unresolved', null, selectedRoutePointer, selectedRouteId),
    allocation: null,
    lineage: null
  });

  if (explicitMajor) {
    const majorReason = String(input.majorReason || input.packageMajorReason || '').trim();
    if (!majorReason) return freeze({
      ...common,
      status: 'blocked',
      state: 'unresolved',
      mode: 'explicit-major',
      reasonCode: 'explicit-major-reason-required',
      selection: selectionProjection('not-applicable', null, selectedRoutePointer, selectedRouteId),
      allocation: null,
      lineage: null
    });
    let lineage;
    try {
      lineage = advanceHandoffCarrierMajor({ dimension: parentDimension }, majorReason);
    } catch {
      return freeze({
        ...common,
        status: 'blocked',
        state: 'unresolved',
        mode: 'explicit-major',
        reasonCode: 'explicit-major-lineage-invalid',
        selection: selectionProjection('not-applicable', null, selectedRoutePointer, selectedRouteId),
        allocation: null,
        lineage: null
      });
    }
    return freeze({
      ...common,
      status: 'ready',
      state: 'explicit-major',
      mode: 'explicit-major',
      reasonCode: '',
      selection: selectionProjection('not-applicable', null, selectedRoutePointer, selectedRouteId),
      allocation: freeze({
        state: 'qualified',
        allocationMode: 'explicit-major',
        siblingIndex: null,
        childDimension: lineage.dimension,
        explicitOverride: 'explicit-major-request'
      }),
      lineage
    });
  }

  const allocation = deriveHandoffSiblingAllocation({
    parentInspection: parent,
    selectedRoutePointer,
    selectedRouteId,
    explicitSiblingIndex: input.explicitSiblingIndex ?? input.siblingIndex ?? null,
    parentPackagePath,
    parentPackageSha256,
    parentDimension
  });

  if (allocation.state === 'qualified') {
    const selected = selectedRouteFromAllocation(parent.routes, allocation);
    return freeze({
      ...common,
      status: 'ready',
      state: 'qualified',
      mode: 'ordinary-continuation',
      reasonCode: '',
      selection: selectionProjection(selected ? 'qualified' : (parent.routes.length ? 'implicit-single-route' : 'not-applicable'), selected, selectedRoutePointer, selectedRouteId),
      allocation,
      lineage: freeze({
        mode: 'continue',
        dimension: allocation.childDimension,
        parentDimension,
        checkpointKind: 'progression',
        authority: 'human-progress-projection-only'
      })
    });
  }

  const state = continuationStateForReason(allocation.reasonCode, allocation.state);
  return freeze({
    ...common,
    status: state === 'selection-required' ? 'selection-required' : 'blocked',
    state,
    mode: 'ordinary-continuation',
    reasonCode: allocation.reasonCode || 'qualified-parent-route-continuation-unresolved',
    selection: selectionProjection(state, null, selectedRoutePointer, selectedRouteId),
    allocation,
    lineage: null
  });
}

export function deriveHandoffSiblingAllocation({ parentInspection = null, selectedRoutePointer = '', selectedRouteId = '', explicitSiblingIndex = null, parentPackagePath = '', parentPackageSha256 = '', parentDimension = '' } = {}) {
  const explicit = normalizeSiblingIndex(explicitSiblingIndex);
  const inspection = parentInspection && typeof parentInspection === 'object' ? parentInspection : null;
  if (!inspection || inspection.detected === false) return freeze({
    state: 'unavailable',
    siblingIndex: explicit || null,
    allocationMode: explicit ? 'explicit-override-only' : 'unavailable',
    reasonCode: 'qualified-parent-route-topology-unavailable',
    provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
    boundary: allocationBoundary()
  });
  if (!parentTopologyValid(inspection)) return freeze({
    state: 'blocked',
    siblingIndex: null,
    allocationMode: 'blocked',
    reasonCode: 'qualified-parent-route-topology-invalid',
    provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
    boundary: allocationBoundary()
  });

  const routes = [...(inspection.routes || [])].map((route) => ({
    pointerPath: String(route.pointerPath || '').trim(),
    routeId: String(route.routeId || route.id || '').trim(),
    workspaceId: String(route.workspaceId || '').trim(),
    workspaceRelativeHandoffPath: String(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || '').trim()
  }));
  if (!routes.length) {
    const siblingIndex = 1;
    if (explicit && explicit !== siblingIndex) return blocked('explicit-sibling-index-conflicts-with-qualified-pointerless-topology', { expectedSiblingIndex: siblingIndex });
    return freeze({
      state: 'qualified',
      siblingIndex,
      childDimension: parentDimension ? `${String(parentDimension).trim()}-${siblingIndex}` : '',
      allocationMode: 'qualified-parent-pointerless-default',
      explicitOverride: explicit ? 'matched-derived-value' : 'not-supplied',
      reasonCode: '',
      provenance: {
        ...provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
        basis: 'qualified-parent-pointerless-default',
        routeOrdinal: siblingIndex,
        qualifiedRouteCount: 0,
        pointerOrder: []
      },
      boundary: allocationBoundary()
    });
  }

  const qualified = [];
  const seenDimensions = new Set();
  for (const route of routes) {
    const match = route.pointerPath.match(POINTER_PATH_RE);
    if (!match) return blocked('qualified-parent-route-pointer-order-unresolved');
    const dimension = match[1];
    if (seenDimensions.has(dimension)) return blocked('qualified-parent-route-pointer-order-ambiguous');
    seenDimensions.add(dimension);
    qualified.push({ ...route, pointerDimension: dimension, pointerSegments: dimension.split('-').map((value) => Number.parseInt(value, 10)) });
  }
  qualified.sort(comparePointerOrder);

  const pointerSelector = String(selectedRoutePointer || '').trim();
  const routeIdSelector = String(selectedRouteId || '').trim();
  let selected = null;
  if (pointerSelector) {
    const matches = qualified.filter((route) => route.pointerPath === pointerSelector);
    if (matches.length !== 1) return blocked(matches.length ? 'selected-parent-route-pointer-ambiguous' : 'selected-parent-route-pointer-unqualified');
    selected = matches[0];
  }
  if (routeIdSelector) {
    const matches = qualified.filter((route) => route.routeId === routeIdSelector);
    if (matches.length !== 1) return blocked(matches.length ? 'selected-parent-route-id-ambiguous' : 'selected-parent-route-id-unqualified');
    if (selected && selected.pointerPath !== matches[0].pointerPath) return blocked('selected-parent-route-selector-conflict');
    selected = matches[0];
  }
  if (!selected) {
    if (qualified.length !== 1) return blocked('selected-parent-route-required-for-parallel-topology');
    selected = qualified[0];
  }

  const siblingIndex = qualified.findIndex((route) => route.pointerPath === selected.pointerPath) + 1;
  if (!Number.isInteger(siblingIndex) || siblingIndex < 1 || siblingIndex > MAX_SIBLING_INDEX) return blocked('derived-sibling-index-out-of-range');
  if (explicit && explicit !== siblingIndex) return blocked('explicit-sibling-index-conflicts-with-qualified-topology', { expectedSiblingIndex: siblingIndex });

  return freeze({
    state: 'qualified',
    siblingIndex,
    childDimension: parentDimension ? `${String(parentDimension).trim()}-${siblingIndex}` : '',
    allocationMode: 'qualified-parent-route-pointer-ordinal',
    explicitOverride: explicit ? 'matched-derived-value' : 'not-supplied',
    reasonCode: '',
    provenance: {
      ...provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
      basis: 'qualified-parent-route-pointer-ordinal',
      selectedRoutePointer: selected.pointerPath,
      selectedRouteId: selected.routeId,
      selectedWorkspaceId: selected.workspaceId,
      selectedWorkspaceRelativeHandoffPath: selected.workspaceRelativeHandoffPath,
      routeOrdinal: siblingIndex,
      qualifiedRouteCount: qualified.length,
      pointerOrder: qualified.map((route, index) => freeze({ ordinal: index + 1, pointerPath: route.pointerPath, routeId: route.routeId }))
    },
    boundary: allocationBoundary()
  });

  function blocked(reasonCode, extra = {}) {
    return freeze({
      state: 'blocked', siblingIndex: null, allocationMode: 'blocked', reasonCode, ...extra,
      provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
      boundary: allocationBoundary()
    });
  }
}

export function deriveHandoffConsolidationAllocation({ parentInspection = null, explicitSiblingIndex = null, parentPackagePath = '', parentPackageSha256 = '', parentDimension = '' } = {}) {
  const explicit = normalizeSiblingIndex(explicitSiblingIndex);
  const inspection = parentInspection && typeof parentInspection === 'object' ? parentInspection : null;
  if (!inspection || inspection.detected === false) return freeze({
    state: 'unavailable', siblingIndex: null, allocationMode: 'unavailable',
    reasonCode: 'qualified-parent-route-topology-unavailable-for-consolidation',
    provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
    boundary: consolidationBoundary()
  });
  if (!parentTopologyValid(inspection)) return consolidationBlocked('qualified-parent-route-topology-invalid-for-consolidation');
  const routes = [...(inspection.routes || [])];
  if (!routes.length) return consolidationBlocked('qualified-parent-route-topology-empty-for-consolidation');

  const topology = deriveHandoffSiblingAllocation({
    parentInspection: inspection,
    selectedRoutePointer: String(routes[0]?.pointerPath || ''),
    parentPackagePath, parentPackageSha256, parentDimension
  });
  if (topology.state !== 'qualified') return consolidationBlocked(topology.reasonCode || 'qualified-parent-route-pointer-order-unresolved');
  const routeCount = Number(topology.provenance?.qualifiedRouteCount || 0);
  const siblingIndex = routeCount + 1;
  if (!Number.isInteger(siblingIndex) || siblingIndex < 2 || siblingIndex > MAX_SIBLING_INDEX) return consolidationBlocked('derived-consolidation-sibling-index-out-of-range');
  if (explicit && explicit !== siblingIndex) return consolidationBlocked('explicit-sibling-index-conflicts-with-qualified-consolidation-topology', { expectedSiblingIndex: siblingIndex });

  return freeze({
    state: 'qualified', siblingIndex,
    childDimension: parentDimension ? `${String(parentDimension).trim()}-${siblingIndex}` : '',
    allocationMode: 'qualified-parent-route-consolidation-ordinal',
    explicitOverride: explicit ? 'matched-derived-value' : 'not-supplied',
    reasonCode: '',
    provenance: {
      ...provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
      basis: 'qualified-parent-route-consolidation-ordinal',
      qualifiedRouteCount: routeCount,
      consolidationOrdinal: siblingIndex,
      commonFrontierDimension: String(parentDimension || '').trim(),
      pointerOrder: topology.provenance.pointerOrder
    },
    boundary: consolidationBoundary()
  });

  function consolidationBlocked(reasonCode, extra = {}) {
    return freeze({
      state: 'blocked', siblingIndex: null, allocationMode: 'blocked', reasonCode, ...extra,
      provenance: provenanceBase({ parentPackagePath, parentPackageSha256, parentDimension, explicitSiblingIndex: explicit }),
      boundary: consolidationBoundary()
    });
  }
}

function normalizeQualifiedParentTopology(input = {}) {
  const candidate = input.parentOrientation || input.parentInspection || input.packageParent || input.parent || null;
  if (!candidate || typeof candidate !== 'object') return null;
  const schema = String(candidate.schema || '');
  const orientation = schema === ORIENTATION_SCHEMA_ID || String(candidate.status || '') === 'ready';
  const inspection = schema === INSPECTION_SCHEMA_ID || String(candidate.status || '') === 'valid';
  if (!orientation && !inspection) return freeze({ ...candidate, detected: candidate.detected !== false, status: 'invalid', qualification: 'invalid' });
  const rawRoutes = Array.isArray(candidate.routes)
    ? candidate.routes
    : Array.isArray(candidate.pointerEntrypoints?.entries)
      ? candidate.pointerEntrypoints.entries
      : Array.isArray(candidate.carrierProjection?.routes)
        ? candidate.carrierProjection.routes
        : [];
  const routeStatesQualified = rawRoutes.every((route) => !String(route?.state || '') || String(route.state) === 'qualified');
  const statusValid = (orientation && candidate.status === 'ready') || (inspection && candidate.status === 'valid');
  return freeze({
    ...candidate,
    detected: candidate.detected !== false,
    status: statusValid && routeStatesQualified ? 'valid' : 'invalid',
    qualification: statusValid && routeStatesQualified ? 'qualified' : 'invalid',
    routes: rawRoutes,
    carrierLineage: candidate.carrierLineage || candidate.carrierProjection?.lineage || null
  });
}

function parentTopologyValid(inspection = {}) {
  return String(inspection.status || '') === 'valid'
    || (String(inspection.status || '') === 'ready' && (inspection.routes || []).every((route) => String(route.state || 'qualified') === 'qualified'));
}

function continuationStateForReason(reasonCode = '', allocationState = '') {
  if (allocationState === 'unavailable') return 'unresolved';
  if (reasonCode === 'selected-parent-route-required-for-parallel-topology'
    || reasonCode === 'selected-parent-route-pointer-ambiguous'
    || reasonCode === 'selected-parent-route-id-ambiguous') return 'selection-required';
  if (reasonCode === 'selected-parent-route-pointer-unqualified'
    || reasonCode === 'selected-parent-route-id-unqualified'
    || reasonCode === 'selected-parent-route-selector-conflict') return 'invalid-parent-route';
  return 'unresolved';
}

function selectedRouteFromAllocation(routes = [], allocation = {}) {
  const pointer = String(allocation.provenance?.selectedRoutePointer || '');
  const routeId = String(allocation.provenance?.selectedRouteId || '');
  return routes.find((route) => String(route.pointerPath || '') === pointer && (!routeId || String(route.routeId || route.id || '') === routeId)) || null;
}

function selectionProjection(state, route, requestedPointer, requestedRouteId) {
  return freeze({
    state,
    requestedPointer: String(requestedPointer || ''),
    requestedRouteId: String(requestedRouteId || ''),
    pointerPath: String(route?.pointerPath || ''),
    routeId: String(route?.routeId || route?.id || ''),
    workspaceId: String(route?.workspaceId || ''),
    workspaceRelativeHandoffPath: String(route?.workspaceRelativeHandoffPath || route?.workspaceRelativePath || '')
  });
}

function normalizeOutgoingRoutes(value) {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return raw.map((route, index) => freeze({
    ordinal: index + 1,
    routeId: String(route?.routeId || route?.id || ''),
    workspaceId: String(route?.workspaceId || ''),
    workspaceRelativeHandoffPath: String(route?.workspaceRelativeHandoffPath || route?.workspaceRelativePath || route?.path || '')
  }));
}

function continuationAuthority() {
  return freeze({
    semanticAuthority: 'none',
    semanticParentAuthority: 'none',
    recipientAuthority: 'none',
    participantAuthority: 'none',
    holderAuthority: 'none',
    currentWorkAuthority: 'none',
    filenameAuthority: false,
    dimensionalParentAuthority: false,
    routeSelectionAuthority: 'qualified-parent-route-membership-only'
  });
}

function continuationBoundary() {
  return 'Host-neutral mechanical carrier continuation projection. Ordinary child allocation comes only from exact qualified parent Handoff Pointer order and an already-selected qualified parent route; outgoing Handoff Parent paths, filenames, route adjacency, participant state, holder state, recipient labels, and current work never select the parent route or create semantic authority. Explicit Major continuation remains a separate caller-declared operation.';
}

function comparePointerOrder(left, right) {
  const a = left.pointerSegments || [], b = right.pointerSegments || [];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (a[index] === undefined) return -1;
    if (b[index] === undefined) return 1;
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return left.pointerPath.localeCompare(right.pointerPath);
}

function provenanceBase({ parentPackagePath = '', parentPackageSha256 = '', parentDimension = '', explicitSiblingIndex = null } = {}) {
  return {
    parentPackagePath: String(parentPackagePath || ''),
    parentPackageSha256: String(parentPackageSha256 || '').trim().toLowerCase(),
    parentDimension: String(parentDimension || '').trim(),
    explicitSiblingIndex: explicitSiblingIndex ? normalizeSiblingIndex(explicitSiblingIndex) : null
  };
}

function consolidationBoundary() {
  return 'Transport-only carrier consolidation allocation. The consolidation sibling is exactly N+1 for N qualified Handoff routes on the common pre-batch carrier frontier. It is never derived from one specialist return, arrival order, retries, output collisions, local allocation files or artifact Parent lineage; explicit Major stabilization remains separate.';
}

function allocationBoundary() {
  return 'Transport-only carrier allocation. A non-Major sibling ordinal may come only from exact qualified package-local Handoff Pointer order for the selected parent route, or from an explicit advanced override when such topology is unavailable. Allocation never creates semantic Parent, Workspace, Role, acceptance, completion, participant, process, or source authority; different carrier prefixes are not coordinated.';
}

function normalizeSiblingIndex(value) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_SIBLING_INDEX) throw new Error('portable.cli.handoff-carrier.sibling-allocation.index-invalid');
  return parsed;
}

function normalizeDimension(value = '') {
  const dimension = String(value || '').trim();
  return /^\d{3}(?:-\d+)*$/.test(dimension) ? dimension : '';
}

function normalizeSha256(value = '') {
  const digest = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(digest) ? digest : '';
}

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)])));
}
