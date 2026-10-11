/**
 * A Creation Contract may declare a required field name used in several
 * distinct validated sections. Do not bind one ambiguous scalar or copy it to
 * unrelated sections. Instead expose one structured input for each exact,
 * qualified ordinary group that owns that required field. This is a generic
 * representation projection of the same schema validation authority, not a
 * schema extension or an artifact-type-specific authoring template.
 */
export function qualifySectionScopedRepeatedCreationInputs(creation = {}, validationContract = null, sourceSchemaId = '') {
  const bindings = [...(creation?.inputBindings || [])];
  const required = [...(creation?.requiredInputs || [])];
  const missing = required.filter((name) => bindings.some((item) => item.input === name && item.kind === 'unmapped'));
  if (!missing.length) return creation;
  const groups = (validationContract?.validation?.ordinaryGroups || []).filter((group) =>
    group.qualification === 'valid' && group.target?.qualification === 'valid' && Number(group.target.level) === 2 &&
    group.target.title === group.group && Array.isArray(group.requiredFields) && group.requiredFields.length);
  const byMissing = new Map();
  for (const name of missing) {
    const matches = groups.filter((group) => group.requiredFields.includes(name));
    if (matches.length < 2) continue; // one missing input is not evidence of repeated-section semantics
    if (new Set(matches.map((item) => item.group)).size !== matches.length) continue;
    byMissing.set(name, matches);
  }
  if (!byMissing.size) return creation;
  const allGroups = [...new Set([...byMissing.values()].flat())];
  // Every new structured group is complete. Do not invent another required
  // field or shadow a field already bound by an independent input.
  if (allGroups.some((group) => group.requiredFields.some((name) => !byMissing.has(name)) ||
    bindings.some((binding) => binding.section === group.group && binding.kind !== 'unmapped'))) return creation;
  const eligible = [...byMissing].filter(([name, matches]) =>
    matches.every((group) => allGroups.includes(group)));
  if (eligible.length !== byMissing.size) return creation;
  const chosenNames = new Set(byMissing.keys());
  const groupBindings = allGroups.map((group) => Object.freeze({
    input: group.group, kind: 'ordinary-group', section: group.group, group: group.group,
    requiredFields: Object.freeze([...group.requiredFields]),
    optionalFields: Object.freeze([...(group.optionalFields || [])]),
    sourceSchemaId, requirement: 'required', authorityBasis: 'qualified-repeated-ordinary-group-projection'
  }));
  if (groupBindings.some((item) => bindings.some((binding) => binding.input === item.input))) return creation;
  const retained = bindings.filter((binding) => !(chosenNames.has(binding.input) && binding.kind === 'unmapped'));
  const headingOrder = (validationContract?.validation?.requiredHeadings || [])
    .filter((heading) => Number(heading.level) === 2).map((heading) => String(heading.title || ''));
  const combined = [...retained, ...groupBindings].sort((a,b) =>
    headingOrder.indexOf(a.section) < 0 ? 1 : headingOrder.indexOf(b.section) < 0 ? -1 : headingOrder.indexOf(a.section)-headingOrder.indexOf(b.section));
  return Object.freeze({
    ...creation,
    requiredInputs: Object.freeze([...required.filter((name) => !chosenNames.has(name)), ...groupBindings.map((item) => item.input)]),
    inputBindings: Object.freeze(combined),
    requiredSections: Object.freeze([...new Set([...creation.requiredSections || [], ...groupBindings.map((item) => item.section)])]),
    representationSections: Object.freeze([...new Set([...creation.representationSections || [], ...groupBindings.map((item) => item.section)])])
  });
}
