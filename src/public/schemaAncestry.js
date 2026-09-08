/** Traverses explicit schema declarations supplied by a qualified host/provider.
 * Presence in this array is NOT independent schema-authority qualification. */
export function projectSchemaAncestry(schemaId, declarations = []) {
  const groups = new Map();
  for (const declaration of declarations) {
    if (!declaration?.id) continue;
    const values = groups.get(declaration.id) || [];
    values.push(declaration); groups.set(declaration.id, values);
  }
  const lineage = [], seen = new Set(); let current = String(schemaId || '');
  const done = (status, reason) => Object.freeze({ status, reason, lineage: Object.freeze([...lineage]), basis: 'explicit-provider-schema-parent-declarations' });
  if (!current) return done('unresolved', 'schema-id-missing');
  while (current) {
    if (seen.has(current)) return done('cycle', 'schema-parent-cycle');
    seen.add(current); lineage.push(current);
    const values = groups.get(current) || [];
    if (!values.length) return done('unresolved', 'schema-parent-not-loaded');
    const parents = new Set(values.map(v => Object.hasOwn(v, 'parentSchemaId') ? v.parentSchemaId : undefined));
    if (parents.size !== 1) return done('ambiguous', 'conflicting-schema-parent-declarations');
    const parent = [...parents][0];
    if (parent === null || parent === '') return done('resolved', 'explicit-schema-root');
    if (typeof parent !== 'string') return done('unresolved', 'schema-parent-not-declared');
    current = parent;
  }
  return done('unresolved', 'schema-parent-not-declared');
}
