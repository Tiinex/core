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
      bindingPresent: String(authority.holderBinding.state || '') === 'qualified',
      declarationPresent: Boolean(authority.holderBinding.explicit),
      holderId: authority.holderBinding.holderId || '',
      roleLabel: authority.holderBinding.roleLabel || '',
      recipientRoleLabel: authority.holderBinding.recipientRoleLabel || '',
      recipientCompatibility: authority.holderBinding.recipientCompatibility || '',
      source: authority.holderBinding.source || '',
      sourceDetail: authority.holderBinding.sourceDetail ? Object.freeze({ ...(authority.holderBinding.sourceDetail || {}) }) : null,
      authorization: authority.holderBinding.authorization ? Object.freeze({
        ...(authority.holderBinding.authorization || {}),
        provenance: authority.holderBinding.authorization.provenance ? Object.freeze({ ...(authority.holderBinding.authorization.provenance || {}) }) : null
      }) : null,
      durableIdentity: authority.holderBinding.durableIdentity ? Object.freeze({ ...(authority.holderBinding.durableIdentity || {}) }) : Object.freeze({ state: 'not-established' }),
      semanticAuthorityState: authority.holderBinding.sourceDetail?.semanticAuthorityState || 'not-established',
      explicit: Boolean(authority.holderBinding.explicit),
      inferredFromTransport: Boolean(authority.holderBinding.inferredFromTransport),
      provenance: Object.freeze({
        basis: authority.holderBinding.explicit ? 'explicit-consuming-session-holder-binding' : (authority.holderBinding.source === 'qualified-selected-handoff-consumption' && String(authority.holderBinding.state || '') === 'qualified' ? 'qualified-selected-handoff-consumption-binding' : 'unresolved-or-non-explicit-holder-binding'),
        source: authority.holderBinding.source || '',
        sourceKind: authority.holderBinding.sourceDetail?.kind || '',
        sourceLocator: authority.holderBinding.sourceDetail?.locator || '',
        semanticAuthorityState: authority.holderBinding.sourceDetail?.semanticAuthorityState || 'not-established',
        qualifiedMaterialSource: Boolean(authority.holderBinding.sourceDetail?.qualifiedMaterialSource),
        assignmentMode: authority.holderBinding.assertionMode || authority.holderBinding.authorization?.assignmentMode || '',
        routePointerPath: authority.holderBinding.sourceDetail?.routePointerPath || '',
        handoffArtifactPath: authority.holderBinding.sourceDetail?.handoffArtifactPath || '',
        handoffArtifactSha256: authority.holderBinding.sourceDetail?.handoffArtifactSha256 || '',
        roleArtifactPath: authority.holderBinding.sourceDetail?.roleArtifactPath || authority.holderBinding.authorization?.provenance?.roleArtifactPath || '',
        roleArtifactSha256: authority.holderBinding.sourceDetail?.roleArtifactSha256 || authority.holderBinding.authorization?.provenance?.roleArtifactSha256 || '',
        authorizationState: authority.holderBinding.authorization?.state || 'unresolved',
        authorizationBasis: authority.holderBinding.authorization?.provenance?.basis || '',
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
