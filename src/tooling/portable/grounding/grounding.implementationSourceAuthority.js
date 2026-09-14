const MAX_FACTS = 12;
const MAX_WORKSPACE_FACTS = 12;

export function projectGroundingImplementationSourceAuthority({ authority = null, records = [], contextAudit = null, requiredContext = [] } = {}) {
  const supplied = authority?.implementationSourceAuthority || null;
  const exactUpstream = qualifiesExactUpstreamProjection(supplied);
  const descriptiveFacts = projectDescriptiveWorkspaceFacts({ records, contextAudit, requiredContext });

  if (!exactUpstream) return Object.freeze({
    state: 'unresolved',
    facts: Object.freeze([]),
    descriptiveFacts,
    provenance: Object.freeze({
      basis: 'no-exact-upstream-qualified-implementation-source-authority-projection',
      sourceArtifact: null,
      boundary: 'Core does not derive implementation-source creation authority from Workspace carriage, completeness, boundedness, writability language, path adjacency, repository identity, or current Task wording.'
    }),
    unresolved: Object.freeze([Object.freeze({
      code: 'implementation-source-authority-not-established',
      detail: 'No exact upstream-qualified implementation-source authority projection is present. Workspace purpose/boundary facts remain descriptive only; do not infer permission to create or select implementation source from carriage, writability, repository identity, path adjacency, or executable Task presence.'
    })]),
    boundary: 'Semantics-neutral diagnostic only. Core exposes exact upstream authority projections when independently qualified, but does not define allow/deny meaning or manufacture source-creation permission.'
  });

  const facts = Array.isArray(supplied.facts) ? supplied.facts : Array.isArray(supplied.items) ? supplied.items : [];
  return Object.freeze({
    state: 'explicit-qualified-upstream-projection',
    facts: Object.freeze(facts.slice(0, MAX_FACTS).map((item) => Object.freeze({ ...(item || {}) }))),
    descriptiveFacts,
    provenance: Object.freeze({
      basis: 'exact-upstream-qualified-implementation-source-authority-projection',
      sourceArtifact: Object.freeze(projectSourceArtifact(supplied)),
      upstreamProvenance: supplied.provenance ? Object.freeze({ ...(supplied.provenance || {}) }) : null,
      boundary: 'Core passes through the already-qualified upstream projection and exact source-artifact identity without interpreting its semantic allow/deny meaning.'
    }),
    unresolved: Object.freeze([]),
    boundary: 'Semantics-neutral pass-through only. The upstream semantic owner defines the meaning of projected facts; Core neither broadens nor converts them into generic source authority.'
  });
}

function qualifiesExactUpstreamProjection(value = null) {
  if (!value || typeof value !== 'object' || value.explicit !== true) return false;
  if (String(value.qualification || value.state || '').trim().toLowerCase() !== 'qualified') return false;
  const source = projectSourceArtifact(value);
  return Boolean(source.path && /^[0-9a-f]{64}$/i.test(source.sha256));
}

function projectSourceArtifact(value = {}) {
  const source = value.sourceArtifact || value.provenance?.sourceArtifact || {};
  return {
    workspaceId: String(source.workspaceId || source.workspace || ''),
    path: String(source.path || source.workspaceRelativePath || value.provenance?.sourceArtifactPath || ''),
    sha256: String(source.sha256 || value.provenance?.sourceArtifactSha256 || '').trim().toLowerCase(),
    schemaId: String(source.schemaId || '')
  };
}

function projectDescriptiveWorkspaceFacts({ records = [], contextAudit = null, requiredContext = [] } = {}) {
  const byPath = new Map((records || []).map((record) => [String(record.path || ''), record]));
  const out = [];
  for (const workspace of contextAudit?.workspaceMaterializations || []) {
    if (out.length >= MAX_WORKSPACE_FACTS) break;
    if (String(workspace.qualification || '') !== 'qualified') continue;
    const workspaceId = String(workspace.workspaceId || '');
    const innerPath = normalizePath(workspace.sourceWorkspaceTargetInnerPath || '');
    const exactPath = workspaceId && innerPath ? `${workspaceId}/${innerPath}` : '';
    const record = exactPath ? byPath.get(exactPath) : null;
    if (!record || !record.hasContinuityContext || !record.hasIntegrity) continue;
    const boundary = section(record.markdown || '', 'Workspace Boundary');
    if (!boundary) continue;
    out.push(Object.freeze({
      kind: 'workspace-boundary',
      workspace: workspaceId,
      text: compact(boundary, 500),
      authorityEffect: 'descriptive-only',
      provenance: Object.freeze({
        basis: 'exact-qualified-workspace-artifact-section',
        sourceArtifactPath: exactPath,
        sourceArtifactSha256: String(workspace.sourceWorkspaceTargetSha256 || ''),
        section: 'Workspace Boundary',
        boundary: 'Exact carried Workspace metadata is exposed as a fact only; Core does not reinterpret boundary prose as implementation-source creation permission.'
      })
    }));
  }
  for (const entry of requiredContext || []) {
    if (out.length >= MAX_WORKSPACE_FACTS) break;
    if (String(entry.state || '') !== 'qualified' || !String(entry.purpose || '').trim()) continue;
    out.push(Object.freeze({
      kind: 'required-context-purpose',
      workspace: String(entry.workspaceId || ''),
      text: compact(entry.purpose, 500),
      authorityEffect: 'descriptive-only',
      provenance: Object.freeze({
        basis: String(entry.provenance?.basis || 'selected-handoff-required-context-declaration'),
        declarationSource: entry.provenance?.declarationSource ? Object.freeze({ ...(entry.provenance.declarationSource || {}) }) : null,
        requirementId: String(entry.requirementId || ''),
        boundary: 'Selected-Handoff purpose text is exposed verbatim as route context; it is not converted into implementation-source creation authority.'
      })
    }));
  }
  return Object.freeze(out);
}

function section(markdown = '', heading = '') {
  const escaped = String(heading || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || '';
}
function compact(value = '', limit = 500) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, ''); }
