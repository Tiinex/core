import { parseWorkspaceQualifiedRecoveryReference } from '../../../lineage/parentRecoveryReference.js';

export const SHARED_ROUTE_REQUIRED_CONTEXT_BOUNDARY = 'Shared-route recipient grounding proof only. Every Required Context item must resolve to exact carried package bytes; Reference Context is intentionally excluded from this blocking projection.';

export function parseWorkspaceQualifiedReference(value = '') {
  const parsed = parseWorkspaceQualifiedRecoveryReference(value);
  return parsed ? Object.freeze({ workspaceId: parsed.workspaceId, path: parsed.path }) : null;
}
