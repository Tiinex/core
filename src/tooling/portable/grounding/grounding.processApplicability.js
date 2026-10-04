const MAX_FACTS = 12;

export function projectGroundingProcessApplicability(authority = null, guidanceAuthority = null) {
  const supplied = authority?.processApplicability || null;
  const explicitlyQualified = Boolean(
    supplied
    && supplied.explicit === true
    && String(supplied.qualification || supplied.state || '') === 'qualified'
  );
  if (!explicitlyQualified) {
    const relationProjection = relationBoundProcessApplicability(guidanceAuthority);
    if (relationProjection) return relationProjection;
    return Object.freeze({
      state: 'not-established',
      facts: Object.freeze([]),
      provenance: Object.freeze({
        basis: 'no-upstream-qualified-explicit-process-applicability-projection',
        source: '',
        boundary: 'Core does not discover process inventory or define the semantic declaration pattern. It consumes only upstream-qualified applicability authority, including exact forward-selected Relation bindings projected by the guidance authority surface.'
      }),
      unresolved: Object.freeze([Object.freeze({
        code: 'process-applicability-semantic-authority-not-established',
        detail: 'Current qualified grounding authority contains no explicit applicability projection and no exact qualified forward-selected guidance Relation binding. Do not infer applicability from carried Roles, Handoff endpoints, Required Context membership alone, filenames, folders, process inventory, or repository adjacency.'
      })]),
      boundary: 'Semantics-neutral projection only. Absence stays unresolved; carriage and inventory never become applicability.'
    });
  }

  const facts = Array.isArray(supplied.facts) ? supplied.facts : Array.isArray(supplied.items) ? supplied.items : [];
  return Object.freeze({
    state: 'explicit-qualified-authority',
    facts: Object.freeze(facts.slice(0, MAX_FACTS).map((item) => Object.freeze({ ...(item || {}) }))),
    provenance: Object.freeze({
      basis: 'upstream-qualified-explicit-process-applicability-projection',
      source: String(supplied.source || supplied.provenance?.source || ''),
      upstreamProvenance: supplied.provenance ? Object.freeze({ ...(supplied.provenance || {}) }) : null,
      boundary: 'Facts are passed through without Core interpreting process inventory or inventing process-to-participant semantics.'
    }),
    unresolved: Object.freeze([]),
    boundary: 'Semantics-neutral pass-through only. Core does not define or expand the declaration pattern that established these facts.'
  });
}

function relationBoundProcessApplicability(guidanceAuthority = null) {
  if (String(guidanceAuthority?.state || '') !== 'qualified-forward-selected-guidance-authority') return null;
  const relationItems = (guidanceAuthority?.items || []).filter((item) =>
    String(item?.dimensions?.applicability?.state || '') === 'qualified-relation-binding'
    && item?.relation?.sourceArtifact
  );
  if (!relationItems.length) return null;
  const facts = [];
  for (const item of relationItems) {
    const linked = Array.isArray(item.linkedSelectedAuthority) ? item.linkedSelectedAuthority : [];
    facts.push(Object.freeze({
      applicability: 'qualified-relation-binding',
      target: String(item.dimensions?.applicability?.target || item.relation?.resolvedTarget || ''),
      relation: Object.freeze({ ...(item.relation?.sourceArtifact || {}) }),
      authority: item.authorityArtifact ? Object.freeze({ ...(item.authorityArtifact || {}) }) : null,
      selectedGuidance: Object.freeze(linked.slice(0, MAX_FACTS).map((entry) => Object.freeze({
        workspaceId: String(entry?.workspaceId || ''),
        path: String(entry?.path || ''),
        sha256: String(entry?.sha256 || ''),
        schemaId: String(entry?.schemaId || '')
      })))
    }));
  }
  const source = String(relationItems[0]?.relation?.sourceArtifact?.path || '');
  return Object.freeze({
    state: 'explicit-qualified-authority',
    facts: Object.freeze(facts.slice(0, MAX_FACTS)),
    provenance: Object.freeze({
      basis: 'exact-qualified-forward-selected-guidance-relation-binding',
      source,
      upstreamProvenance: Object.freeze({
        guidanceState: String(guidanceAuthority.state || ''),
        selectedRelationCount: Number(guidanceAuthority.selectedRelationCount || 0)
      }),
      boundary: 'Applicability is projected only from exact qualified Relation material whose target matches current work and whose parent authority plus linked guidance were already forward-selected through exact Required Context. Core does not interpret Relation Type prose or process conditions.'
    }),
    unresolved: Object.freeze([]),
    boundary: 'Exact Relation-bound applicability only. Availability, requiredness, active execution, ownership and completion remain separate dimensions.'
  });
}
