import { deepFreeze, normalizeToken } from '../handoff/coldStartQualification.shared.js';
import {
  HOLDER_ASSIGNMENT_MODE,
  isCanonicalHolderAssignmentMode,
  projectHolderAssignmentModeAuthority
} from './grounding.holderAssignmentModes.js';

export function projectHolderBindingAuthorization(role = {}, options = {}) {
  const endpointKind = normalizeToken(role?.endpoint?.kind || '');
  const requestedMode = String(options.assertionMode || options.assignmentMode || HOLDER_ASSIGNMENT_MODE.EXPLICIT_SESSION).trim();
  if (endpointKind !== 'role') return deepFreeze({
    state: 'not-applicable',
    assignmentMode: '',
    authorizedModes: deepFreeze([]),
    holderState: '',
    source: 'none',
    reasonCode: 'recipient-not-role',
    modeAuthority: projectHolderAssignmentModeAuthority(role),
    provenance: {
      basis: 'recipient-not-role', roleArtifactPath: '', roleArtifactSha256: '', section: 'Holder Relationship', field: 'Assignment Modes', exactValue: '', assertionMode: '', boundary: 'Holder-assignment authorization is only applicable when the selected Handoff recipient is a Role endpoint.'
    },
    boundary: 'No Role assignment authorization is required for a non-Role recipient.'
  });

  const modeAuthority = projectHolderAssignmentModeAuthority(role);
  const holderState = String(modeAuthority.holderState || role?.holderRelationshipLoaded?.holderState || '').trim();
  const provenance = deepFreeze({
    ...(modeAuthority.provenance || {}),
    assertionMode: requestedMode,
    boundary: 'The bounded binding result compares one explicit assertion mechanism to exact qualified canonical assignment-mode authority. Holder State prose remains diagnostic-only.'
  });

  if (modeAuthority.state !== 'qualified') return deepFreeze({
    state: 'unresolved',
    assignmentMode: requestedMode,
    authorizedModes: deepFreeze([]),
    holderState,
    source: modeAuthority.source || 'none',
    reasonCode: modeAuthority.reasonCode || 'holder-assignment-mode-authority-unresolved',
    modeAuthority,
    provenance,
    boundary: 'A matching Role assertion remains unauthorized until exact qualified canonical assignment-mode authority is established.'
  });

  if (!isCanonicalHolderAssignmentMode(requestedMode)) return deepFreeze({
    state: 'unresolved',
    assignmentMode: requestedMode,
    authorizedModes: deepFreeze([...(modeAuthority.modes || [])]),
    holderState,
    source: modeAuthority.source,
    reasonCode: 'holder-binding-assertion-mode-unqualified',
    modeAuthority,
    provenance,
    boundary: 'The asserted binding mechanism is not a canonical mode established by semantic authority. Core does not reinterpret arbitrary assertion labels.'
  });

  if (!(modeAuthority.modes || []).includes(requestedMode)) return deepFreeze({
    state: 'unresolved',
    assignmentMode: requestedMode,
    authorizedModes: deepFreeze([...(modeAuthority.modes || [])]),
    holderState,
    source: modeAuthority.source,
    reasonCode: 'holder-assignment-mode-not-authorized',
    modeAuthority,
    provenance,
    boundary: 'The exact qualified canonical mode set does not authorize the asserted bounded binding mechanism. No widening between session, user-session, invocation, Handoff, or participation modes is permitted.'
  });

  return deepFreeze({
    state: 'qualified',
    assignmentMode: requestedMode,
    authorizedModes: deepFreeze([...(modeAuthority.modes || [])]),
    holderState,
    source: modeAuthority.source,
    reasonCode: 'holder-assignment-mode-authorized',
    modeAuthority,
    provenance,
    boundary: 'Exact qualified canonical assignment-mode authority authorizes only this bounded assertion mechanism; it does not establish durable holder identity or broader participant/process/delegation/source/acceptance authority.'
  });
}
