import { resolveSchemaModule as resolveRegisteredSchemaModule } from './resolver.js';
import { inspectCreationRepresentation } from './creation.representation.js';
import { qualifySchemaReferenceMaterialCoherence, qualifySchemaReferenceValue, schemaReferenceAuthorityFromBinding } from './schema.reference.js';

export function schemaReferenceAuthoritiesForCreation(targetModule = null, explicit = null) {
  const defaults = {
    envelope: schemaReferenceAuthorityForRegisteredSchema('tiinex.root.v1'),
    current: schemaReferenceAuthorityForModule(targetModule)
  };
  return Object.freeze({
    envelope: explicitSchemaReferenceAuthority(explicit?.envelope, defaults.envelope),
    current: explicitSchemaReferenceAuthority(explicit?.current, defaults.current)
  });
}

export function schemaReferenceAuthorityForRegisteredSchema(schemaId = '') {
  const id = String(schemaId || '').trim();
  const resolution = resolveRegisteredSchemaModule({ schemaId: id });
  const module = resolution?.fallbackUsed ? null : resolution?.module || null;
  return schemaReferenceAuthorityForModule(module, id);
}

function schemaReferenceAuthorityForModule(module = null, fallbackSchemaId = '') {
  const id = String(module?.id || fallbackSchemaId || '').trim();
  const qualification = qualifiedSourceQualification(module);
  return schemaReferenceAuthorityFromBinding(id, module?.binding || {}, qualification?.authority || null, qualification);
}

export function explicitSchemaReferenceAuthority(value = null, fallback = {}) {
  if (!value) return fallback;
  const schemaId = String(value.schemaId || fallback.schemaId || '').trim();
  const exactTargets = [...new Set([
    ...(Array.isArray(value.exactTargets) ? value.exactTargets : []),
    value.preferredTarget || value.target || ''
  ].map((item) => String(item || '')).filter(Boolean))];
  const preferredTarget = String(value.preferredTarget || value.target || exactTargets[0] || '').trim();
  const fallbackTargets = Object.freeze([...(fallback.exactTargets || [])]);
  const materialBoundTarget = Boolean(preferredTarget && fallback?.materialBoundTarget === true && fallbackTargets.includes(preferredTarget));
  const candidate = Object.freeze({
    ...fallback,
    schemaId,
    exactTargets: Object.freeze(exactTargets),
    preferredTarget,
    targetAuthority: exactTargets.length ? 'explicit-exact-reference' : String(fallback.targetAuthority || 'schema-id-only'),
    resolutionState: String(value.resolutionState || value.state || (materialBoundTarget ? 'qualified' : 'unresolved')),
    resolutionEvidence: Object.freeze({ ...(materialBoundTarget ? fallback.resolutionEvidence || {} : {}), ...(value.resolutionEvidence || value.evidence || {}) }),
    semanticSourceTargets: fallbackTargets,
    materialBoundTarget,
    semanticMaterialIdentity: fallback.semanticMaterialIdentity || Object.freeze({ state: 'unavailable' })
  });
  if (!preferredTarget) return candidate;
  const coherence = qualifySchemaReferenceMaterialCoherence(candidate);
  if (coherence.state === 'qualified') return candidate;
  return Object.freeze({
    ...candidate,
    exactTargets: Object.freeze([]),
    preferredTarget: '',
    resolutionState: 'unresolved',
    rejectedExactTargets: Object.freeze(exactTargets),
    resolutionFindings: Object.freeze([...(coherence.findings || [])])
  });
}

export function qualifyCreationSchemaReferences(markdown = '', contract = {}) {
  const observed = inspectCreationRepresentation(markdown);
  const authorities = contract?.schemaReferences || {};
  const envelopeValue = observed.envelopeSchema.length === 1 ? observed.envelopeSchema[0] : '';
  const currentValue = observed.currentSchema.length === 1 ? observed.currentSchema[0] : '';
  const envelope = qualifyResolvedSchemaReference(envelopeValue, authorities.envelope || { schemaId: 'tiinex.root.v1', exactTargets: [] });
  const current = qualifyResolvedSchemaReference(currentValue, authorities.current || { schemaId: String(contract?.target?.schemaId || ''), exactTargets: [] });
  const findings = Object.freeze([...(envelope.findings || []).map((item) => `Envelope Schema: ${item}`), ...(current.findings || []).map((item) => `Current Schema: ${item}`)]);
  return Object.freeze({ state: findings.length ? 'unavailable' : 'qualified', envelope, current, findings });
}

function qualifyResolvedSchemaReference(value, authority) {
  const lexical = qualifySchemaReferenceValue(value, authority, { requireExactTargetWhenQualified: true });
  const material = qualifySchemaReferenceMaterialCoherence(authority);
  const findings = [...(lexical.findings || []), ...(material.findings || [])];
  return Object.freeze({ ...lexical, state: findings.length ? 'unavailable' : 'qualified', resolutionState: authority?.resolutionState || '', materialCoherence: material, findings: Object.freeze(findings) });
}

function qualifiedSourceQualification(module = null) {
  const qualified = typeof module?.schemaSource?.qualify === 'function' ? module.schemaSource.qualify() : null;
  return qualified?.state === 'qualified' ? qualified : null;
}
