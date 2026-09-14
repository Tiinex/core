const MAX_FACTS = 12;

export function projectGroundingProcessApplicability(authority = null) {
  const supplied = authority?.processApplicability || null;
  const explicitlyQualified = Boolean(
    supplied
    && supplied.explicit === true
    && String(supplied.qualification || supplied.state || '') === 'qualified'
  );
  if (!explicitlyQualified) return Object.freeze({
    state: 'not-established',
    facts: Object.freeze([]),
    provenance: Object.freeze({
      basis: 'no-upstream-qualified-explicit-process-applicability-projection',
      source: '',
      boundary: 'Core does not discover process inventory or define the semantic declaration pattern. It consumes only an upstream projection already marked explicit and qualified by semantic authority.'
    }),
    unresolved: Object.freeze([Object.freeze({
      code: 'process-applicability-semantic-authority-not-established',
      detail: 'Current qualified grounding authority contains no explicit, upstream-qualified process-applicability projection. Supply semantic-owner-qualified applicability authority; do not infer applicability from carried Roles, Handoff endpoints, filenames, folders, process inventory, or repository adjacency.'
    })]),
    boundary: 'Semantics-neutral pass-through only. Absence stays unresolved; carriage and inventory never become applicability.'
  });

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
