import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { schemaMarkdown, schemaRegistry } from '../../../schemas/registry.js';
import { parsePortableSchemaDocument } from './schema.contract.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export const PORTABLE_FORM_FIELD_HELP_SCHEMA_ID = 'tiinex.portable.form-field-help.v1';

/**
 * Qualified creation fields, enriched with *exact* readable schema context.
 * An absent/unmapped field is never assigned guessed prose or authority.
 * This is a host-neutral projection, not a Form Profile, materializer or validator.
 */
export function projectPortableFormFieldHelp({ schemaId = '', field = '' } = {}) {
  const id = String(schemaId || '').trim();
  const onlyField = String(field || '').trim();
  const module = schemaRegistry.byId.get(id);
  const markdown = schemaMarkdown(id);
  const contract = buildArtifactCreationContract({ schemaId: id });
  const binding = module?.binding || {};
  const document = markdown ? parsePortableSchemaDocument(markdown) : null;
  // Both a qualified published source and a qualified local, unpublished
  // pre-release schema revision may provide exact field help. Never present a
  // local source as a published GitHub commit: require exact loaded bytes.
  const checksum = String(binding.checksum?.value || binding.checksum || '');
  const local = binding.publicationState === 'qualified-local-unpublished' && !binding.sourceCommit;
  const exactLocal = local && checksum && markdown && sha256Hex(utf8Bytes(markdown)) === checksum;
  const qualified = Boolean(
    module && markdown && contract.target?.schemaId === id &&
    document?.schemaId === id && binding.sourcePath &&
    (binding.sourceCommit || exactLocal) && contract.creation?.inputBindings?.length
  );
  const source = Object.freeze({
    schemaId: id,
    schemaPath: String(binding.sourcePath || ''),
    repository: String(binding.sourceRepository || ''),
    commit: String(binding.sourceCommit || ''),
    checksum,
    publicationState: String(binding.publicationState || '')
  });
  if (!qualified) return Object.freeze({ schema: PORTABLE_FORM_FIELD_HELP_SCHEMA_ID, schemaId: id,
    status: 'unavailable', source, fields: Object.freeze([]), findings: Object.freeze(['schema-binding-or-readable-source-unavailable']) });

  // Ordinary groups are authored as one Core binding, but contain distinct
  // required/optional fields in Native's *exact* validation contract. Expose
  // those fields without inventing independent creation inputs or validation.
  // This is presentation/provenance only; the parent creation binding remains
  // the authoritative materialization unit.
  const candidates = (contract.creation.inputBindings || []).flatMap((candidate) => {
    if (!String(candidate.input || '')) return [];
    const bindings = [candidate];
    if (candidate.kind === 'ordinary-group' || candidate.kind === 'named-declaration-section') {
      for (const [items, requirement] of [[candidate.requiredFields || [], 'required'], [candidate.optionalFields || [], 'optional']]) {
        for (const fieldName of items) bindings.push({
          input: fieldName, section: candidate.section, group: candidate.group || candidate.section,
          field: fieldName, kind: candidate.kind === 'named-declaration-section' ? 'declaration-field' : 'ordinary-field', requirement
        });
      }
    }
    return bindings.filter((item) => !onlyField || item.input === onlyField)
      .map((item) => projectField(item, document, source));
  });
  const projected = candidates.filter((item) => item.status === 'qualified');
  return Object.freeze({
    schema: PORTABLE_FORM_FIELD_HELP_SCHEMA_ID,
    schemaId: id,
    status: onlyField && !candidates.length ? 'unavailable' :
      candidates.some((item) => item.status !== 'qualified') ? 'partial' : 'qualified',
    source,
    fields: Object.freeze(candidates),
    findings: Object.freeze(candidates.filter((item) => item.status !== 'qualified').map((item) => `${item.input}:exact-schema-field-unavailable`)),
    counts: Object.freeze({ projected: projected.length, unresolved: candidates.length - projected.length })
  });
}

function projectField(binding = {}, document = {}, source = {}) {
  const input = String(binding.input || '');
  const section = String(binding.section || '');
  const group = String(binding.group || section);
  const field = String(binding.field || '');
  const validationRoot = document.sections.find((item) => item.level === 2 && item.title === 'Schema Validation Contract');
  const nextRootLine = document.sections.find((item) => item.level === 2 && item.line > (validationRoot?.line || Infinity))?.line || Infinity;
  const groupSection = validationRoot && document.sections.find((item) => item.level === 3 && item.title === group && item.line > validationRoot.line && item.line < nextRootLine);
  const exactField = field && groupSection ? exactFieldLine(groupSection, field) : null;
  const match = Boolean(groupSection && (binding.kind === 'ordinary-group' || binding.kind === 'named-declaration-section' || exactField));
  return Object.freeze({
    input, section, group, field,
    kind: String(binding.kind || ''),
    status: match ? 'qualified' : 'unresolved',
    required: binding.requirement === 'required' || (['ordinary-group', 'named-declaration-section'].includes(binding.kind) && (binding.requiredFields || []).length > 0),
    requiredFields: Object.freeze([...(binding.requiredFields || [])]),
    optionalFields: Object.freeze([...(binding.optionalFields || [])]),
    source: match ? Object.freeze({
      ...source,
      groupHeading: group,
      groupLine: groupSection.line,
      fieldLine: exactField?.line || null,
      // The complete rule neighborhood is labelled group context, not falsely
      // promoted as an exact field-specific rule.
      contextScope: 'schema-validation-group',
      // Field-specific guidance only when Native's qualified source contains
      // an explicitly named rule. Other prose remains labelled group context.
      fieldRule: exactField ? exactFieldRule(groupSection.content, field) : '',
      excerpt: groupSection.content.slice(0, 3500)
    }) : null
  });
}

function exactFieldLine(section = {}, field = '') {
  const lines = String(section.content || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Only an exact list item declaration counts as source-field provenance.
    if (lines[i].trim() === `- ${field}`) return { line: section.line + i + 1 };
  }
  return null;
}

function exactFieldRule(content = '', field = '') {
  const literal = `- \`${field}\` `;
  const line = String(content || '').split('\n').find((item) => item.trim().startsWith(literal));
  return line ? line.trim().slice(2) : '';
}
