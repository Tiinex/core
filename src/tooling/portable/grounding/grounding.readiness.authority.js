export function projectGroundingAuthority(authority, mode) {
  if (!authority || mode !== 'routed-handoff-package') return Object.freeze({ state: 'not-supplied', route: null, handoff: null, role: null, holderBinding: null, operationBoundary: null });
  const mutationBoundary = authority.mutationBoundary || null;
  const selectedRoute = authority.selectedRoute || null;
  const handoff = authority.handoff || null;
  return Object.freeze({
    state: String(authority.status || ''),
    route: selectedRoute ? Object.freeze({
      id: selectedRoute.id || '',
      pointerPath: selectedRoute.pointerPath || '',
      workspaceId: selectedRoute.workspaceId || '',
      workspaceRelativePath: selectedRoute.workspaceRelativeHandoffPath || selectedRoute.workspaceRelativePath || '',
      sha256: selectedRoute.sha256 || '',
      provenance: Object.freeze({
        basis: 'explicit-qualified-route-selection',
        pointerPath: selectedRoute.pointerPath || '',
        workspaceId: selectedRoute.workspaceId || '',
        workspaceRelativePath: selectedRoute.workspaceRelativeHandoffPath || selectedRoute.workspaceRelativePath || '',
        boundary: 'Route authority is bounded to the exact qualified selected route; nearby package routes and filenames are not substituted.'
      })
    }) : null,
    handoff: handoff ? Object.freeze({
      purpose: handoff.purpose || '',
      from: handoff.from || '',
      to: handoff.to || '',
      transfers: Object.freeze((handoff.transfers || []).map((item) => Object.freeze({ ...item }))),
      completionExpectation: handoff.completionExpectation || null,
      provenance: Object.freeze({
        basis: 'exact-selected-handoff-bytes',
        routeId: handoff.routeId || selectedRoute?.id || '',
        workspaceId: handoff.workspaceId || selectedRoute?.workspaceId || '',
        workspaceRelativePath: handoff.workspaceRelativePath || selectedRoute?.workspaceRelativeHandoffPath || '',
        packagePath: handoff.packagePath || selectedRoute?.packagePath || '',
        sha256: handoff.sha256 || selectedRoute?.sha256 || '',
        boundary: handoff.boundary || 'Exact selected Handoff bytes are semantic authority for Handoff parties, purpose, transfers and completion expectation.'
      })
    }) : null,
    role: authority.role ? Object.freeze({ state: authority.role.state || '', label: authority.role.endpoint?.label || '', kind: authority.role.endpoint?.kind || '' }) : null,
    holderBinding: authority.holderBinding ? Object.freeze({
      state: authority.holderBinding.state || '',
      holderId: authority.holderBinding.holderId || '',
      roleLabel: authority.holderBinding.roleLabel || '',
      recipientRoleLabel: authority.holderBinding.recipientRoleLabel || '',
      recipientCompatibility: authority.holderBinding.recipientCompatibility || '',
      source: authority.holderBinding.source || '',
      explicit: Boolean(authority.holderBinding.explicit),
      inferredFromTransport: Boolean(authority.holderBinding.inferredFromTransport),
      provenance: Object.freeze({
        basis: authority.holderBinding.explicit ? 'explicit-consuming-session-holder-binding' : 'unresolved-or-non-explicit-holder-binding',
        source: authority.holderBinding.source || '',
        boundary: authority.holderBinding.boundary || 'Consuming-session holder identity is never inferred from route transport or recipient position.'
      }),
      boundary: authority.holderBinding.boundary || ''
    }) : null,
    operationBoundary: mutationBoundary ? Object.freeze({
      ...mutationBoundary,
      scope: 'current-grounding-operation-only',
      semanticAuthority: 'Handoff/Task/Role artifacts govern downstream work authority; this operation boundary neither grants nor revokes source-edit authority.',
      boundary: 'Describes the non-mutating behavior and host-safety limits of the current Tooling grounding operation only. It must not be interpreted as a prohibition on separately authorized downstream Workspace work.'
    }) : null
  });
}
