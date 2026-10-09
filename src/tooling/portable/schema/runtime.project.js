import { compilePortableSchemaContractChain } from './contract.compile.js';

export const SCHEMA_RUNTIME_PROJECTION_GENERATOR = 'schema-runtime-projection-v2-schema-pack';

export function projectSchemaRuntimeFromSnapshot({ lineageDocuments = [], lineageEntries = [], sourceEntry = null } = {}) {
  const compiled = compilePortableSchemaContractChain(lineageDocuments);
  const leaf = sourceEntry || lineageEntries.at(-1) || {};
  const validationContract = Object.freeze({
    schema: compiled.schema,
    schemaId: compiled.schemaId,
    lineage: Object.freeze([...(compiled.lineage || [])]),
    lineageQualification: compiled.lineageQualification,
    inheritanceResolution: compiled.inheritanceResolution,
    validation: projectValidationRuntime(compiled.validation),
    declarations: compiled.declarations,
    constraints: compiled.constraints,
    machineShapes: compiled.machineShapes,
    lineageAuthority: projectSameSnapshotLineageAuthority(lineageEntries)
  });
  const creation = projectCreationRuntime(compiled);
  return Object.freeze({
    schema: 'tiinex.site.schema-runtime-projection.v1',
    generator: SCHEMA_RUNTIME_PROJECTION_GENERATOR,
    schemaId: String(compiled.schemaId || leaf.schemaId || ''),
    sourceChecksum: String(leaf.sha256 || ''),
    sourceBlobSha: String(leaf.gitBlobSha || ''),
    sourceBytes: Number(leaf.bytes || 0),
    bindingChecksum: String(leaf.sha256 || ''),
    validationContract,
    creation
  });
}


function projectValidationRuntime(validation = {}) {
  // The compiler's merged `groups` tree preserves rich source/guidance nodes used
  // while compiling lineage. Runtime validation consumes the normalized products
  // below instead. Keeping the compiler tree in every specialized projection
  // duplicated large parts of the canonical Schema Pack and made bootstrap size
  // grow with lineage depth.
  return Object.freeze({
    requiredSections: Object.freeze([...(validation?.requiredSections || [])]),
    requiredHeadings: Object.freeze([...(validation?.requiredHeadings || [])]),
    optionalSections: Object.freeze([...(validation?.optionalSections || [])]),
    requiredFields: Object.freeze([...(validation?.requiredFields || [])]),
    optionalFields: Object.freeze([...(validation?.optionalFields || [])]),
    requiredEntries: Object.freeze([...(validation?.requiredEntries || [])]),
    conditionalRequirements: Object.freeze([...(validation?.conditionalRequirements || [])]),
    ordinaryFieldAuthority: Object.freeze({ ...(validation?.ordinaryFieldAuthority || {}) }),
    ordinaryGroups: Object.freeze([...(validation?.ordinaryGroups || [])]),
    fieldShapes: Object.freeze([...(validation?.fieldShapes || [])])
  });
}

export function projectCreationRuntime(compiled = {}) {
  const creation = compiled.creation || {};
  const requiredInputs = uniqueStrings(creation.requiredInputs || []);
  const optionalInputs = uniqueStrings(creation.optionalInputs || []).filter((item) => !requiredInputs.includes(item));
  const ordinaryGroups = Array.isArray(compiled.validation?.ordinaryGroups) ? compiled.validation.ordinaryGroups : [];
  const declarations = Array.isArray(compiled.declarations) ? compiled.declarations : [];
  const requiredShape = projectRequiredShape(creation.groups || []);
  const requiredSections = uniqueStrings(creation.requiredSections || []);
  const allInputs = [...requiredInputs, ...optionalInputs];
  const headingShape = Array.isArray(compiled.validation?.requiredHeadings) ? compiled.validation.requiredHeadings : [];
  const inputBindings = allInputs.map((input) => projectInputBinding({ input, requiredInputs, ordinaryGroups, declarations, requiredSections, requiredShape, schemaId: compiled.schemaId, headingShape }));
  const supplementalRequiredFields = projectSupplementalRequiredFields({ requiredInputs, inputBindings, ordinaryGroups, schemaId: compiled.schemaId, creationDeclared: Array.isArray(creation.groups) && creation.groups.length > 0 });
  return Object.freeze({
    declared: Array.isArray(creation.groups) && creation.groups.length > 0,
    groupNames: Object.freeze((creation.groups || []).map((group) => String(group?.name || '')).filter(Boolean)),
    requiredInputs: Object.freeze(requiredInputs),
    optionalInputs: Object.freeze(optionalInputs),
    requiredSections: Object.freeze(requiredSections),
    toolingConfigurationFields: Object.freeze(uniqueStrings(creation.toolingConfigurationFields || [])),
    inputBindings: Object.freeze(inputBindings),
    supplementalRequiredFields: Object.freeze(supplementalRequiredFields),
    requiredShape: Object.freeze(requiredShape)
  });
}

function projectSameSnapshotLineageAuthority(lineageEntries = []) {
  return Object.freeze((lineageEntries || []).map((entry, index) => {
    const parent = index > 0 ? lineageEntries[index - 1] : null;
    return Object.freeze({
      schemaId: String(entry?.schemaId || ''),
      source: Object.freeze({
        repository: String(entry?.sourceRepository || ''),
        commit: String(entry?.sourceCommit || ''),
        path: String(entry?.sourcePath || ''),
        publicationState: String(entry?.publicationState || ''),
        snapshotCompleteness: String(entry?.snapshotCompleteness || '')
      }),
      parentSchemaId: String(entry?.parentSchemaId || ''),
      parentSourceCandidates: Object.freeze(parent ? [Object.freeze({
        provider: 'github',
        repository: String(parent?.sourceRepository || ''),
        commit: String(parent?.sourceCommit || ''),
        path: String(parent?.sourcePath || '')
      })] : [])
    });
  }));
}

function projectInputBinding({ input, requiredInputs, ordinaryGroups, declarations, requiredSections, requiredShape, schemaId, headingShape = [] }) {
  const requirement = requiredInputs.includes(input) ? 'required' : 'optional';
  if (input === 'Summary' && requiredShape.some((item) => item?.primitive?.kind === 'body-title-summary' && item?.primitive?.input === 'Summary')) {
    return Object.freeze({ input, kind: 'root-current-summary-body-title', section: '' });
  }

  const declaration = declarations.find((item) => exact(item?.group) === exact(input) && (item?.targetHeadings || []).length);
  if (declaration) return declarationInputBinding(input, declaration, stripHeading(String(declaration.targetHeadings?.[0] || declaration.group || input)));

  // Structured creation is projected from qualified schema headings and
  // declaration target headings, not from a host-owned per-schema serializer.
  // A heading only qualifies a binding when a named declaration actually owns
  // that exact target and declares all of its fields.
  const namedHeading = headingShape.find((item) => item.level === 2 && exact(item.title) === exact(input));
  const declaredHeading = namedHeading && declarations.find((item) => (item.targetHeadings || []).includes(`## ${namedHeading.title}`));
  if (declaredHeading) return declarationInputBinding(input, declaredHeading, namedHeading.title);
  if (namedHeading) {
    const at = headingShape.indexOf(namedHeading);
    const next = headingShape.slice(at + 1).findIndex((item) => item.level <= 2);
    const children = headingShape.slice(at + 1, next < 0 ? undefined : at + 1 + next)
      .filter((item) => item.level === 3);
    if (children.length) {
      const childBindings = children.map((item) => declarations.find((declaration) => (declaration.targetHeadings || []).includes(`### ${item.title}`)));
      if (childBindings.every(Boolean)) return Object.freeze({ input, kind: 'composite-declaration-section', section: namedHeading.title,
        parts: Object.freeze(children.map((item, index) => declarationInputBinding(item.title, childBindings[index], item.title))) });
    }
  }

  const exactGroup = ordinaryGroups.find((group) => exact(group?.group) === exact(input) && String(group?.qualification || '') === 'valid');
  if (exactGroup) return Object.freeze({
    input,
    kind: 'ordinary-group',
    section: String(exactGroup?.target?.title || exactGroup?.group || input),
    group: String(exactGroup?.group || input),
    requiredFields: Object.freeze([...(exactGroup?.requiredFields || [])]),
    optionalFields: Object.freeze([...(exactGroup?.optionalFields || [])]),
    sourceSchemaIds: Object.freeze(uniqueStrings((exactGroup?.contributors || []).map((item) => item?.sourceSchemaId)))
  });

  const fieldGroups = ordinaryGroups.filter((group) => String(group?.qualification || '') === 'valid' && [...(group?.requiredFields || []), ...(group?.optionalFields || [])].some((field) => exact(field) === exact(input)));
  if (fieldGroups.length === 1) {
    const group = fieldGroups[0];
    return Object.freeze({
      input,
      kind: 'ordinary-field',
      section: String(group?.target?.title || group?.group || ''),
      group: String(group?.group || ''),
      field: input,
      sourceSchemaId: sourceSchemaForField(group, input) || String(schemaId || ''),
      requirement
    });
  }

  const shapeSection = requiredShape.find((item) => item?.primitive?.kind === 'section-body' && exact(item?.primitive?.input) === exact(input));
  if (shapeSection) return Object.freeze({ input, kind: 'section-body', section: String(shapeSection.primitive.section || input) });
  if (requiredSections.some((section) => exact(section) === exact(input))) return Object.freeze({ input, kind: 'section-body', section: input });

  return Object.freeze({ input, kind: 'unmapped', section: '', reason: 'no-qualified-generic-representation' });
}

function declarationInputBinding(input, declaration, section) {
  return Object.freeze({ input, kind: 'named-declaration-section', section,
    headingLevel: (declaration.targetHeadings || []).find((item) => item.endsWith(section))?.match(/^#+/)?.[0]?.length || 2,
    group: String(declaration.group || input), requiredFields: Object.freeze([...(declaration.requiredFields || [])]),
    optionalFields: Object.freeze([...(declaration.optionalFields || [])]), allowLiteralNone: Boolean(declaration.allowLiteralNone) });
}

function sourceSchemaForField(group = {}, field = '') {
  const contributors = (group.contributors || []).filter((item) => [...(item?.requiredFields || []), ...(item?.optionalFields || [])].some((candidate) => exact(candidate) === exact(field)));
  return contributors.at(-1)?.sourceSchemaId || '';
}

function projectSupplementalRequiredFields({ requiredInputs = [], inputBindings = [], ordinaryGroups = [], schemaId = '', creationDeclared = false } = {}) {
  if (!creationDeclared) return [];
  const represented = new Set(inputBindings.flatMap((binding) => {
    if (binding.kind === 'ordinary-field') return [exact(binding.field)];
    if (binding.kind === 'ordinary-group') return [...(binding.requiredFields || []), ...(binding.optionalFields || [])].map(exact);
    return [];
  }));
  const inputs = new Set(requiredInputs.map(exact));
  const representedSections = new Set(inputBindings.map((binding) => exact(binding?.section)).filter(Boolean));
  const out = [];
  for (const group of ordinaryGroups) {
    if (String(group?.qualification || '') !== 'valid') continue;
    for (const field of group?.requiredFields || []) {
      if (represented.has(exact(field)) || inputs.has(exact(field))) continue;
      const section = String(group?.target?.title || group?.group || '').trim();
      if (!section || !representedSections.has(exact(section))) continue;
      const sourceSchemaIds = uniqueStrings((group?.contributors || []).filter((item) => (item?.requiredFields || []).some((candidate) => exact(candidate) === exact(field))).map((item) => item?.sourceSchemaId));
      if (!sourceSchemaIds.length || sourceSchemaIds.includes(String(schemaId || ''))) continue;
      out.push(Object.freeze({
        section,
        group: String(group?.group || section),
        field: String(field || ''),
        sourceSchemaIds: Object.freeze(sourceSchemaIds),
        representation: 'neutral-placeholder',
        value: 'unknown / not supplied at creation'
      }));
    }
  }
  return out;
}

function projectRequiredShape(groups = []) {
  const out = [];
  for (const group of groups || []) {
    for (const category of group?.categories || []) {
      if (exact(category?.name) !== 'Required Shape') continue;
      for (const node of category?.nodes || []) {
        const sourceText = String(node?.value || '').trim();
        const sourceSchemaId = String(group?.contributors?.find((item) => (item?.categories || []).some((candidate) => candidate?.nodes?.some((n) => Number(n?.line || 0) === Number(node?.line || 0) && String(n?.value || '') === sourceText)))?.sourceSchemaId || group?.contributors?.at(-1)?.sourceSchemaId || '');
        out.push(Object.freeze({
          id: `${sourceSchemaId || 'unknown'}#artifact-creation/${String(group?.name || '')}/required-shape/${Number(node?.line || 0)}`,
          sourceSchemaId,
          group: String(group?.name || ''),
          category: 'Required Shape',
          line: Number(node?.line || 0),
          sourceText,
          primitive: Object.freeze(requiredShapePrimitive(sourceText))
        }));
      }
    }
  }
  return out;
}

function requiredShapePrimitive(sourceText = '') {
  const text = String(sourceText || '').trim();
  if (/^first heading uses\s+`#\s+\{\{summary\}\}`$/i.test(text)) return { kind: 'body-title-summary', input: 'Summary' };
  const section = text.match(/^`##\s+([^`]+)`\s+section$/i)?.[1]?.trim();
  if (section) return { kind: 'section-body', section, input: section };
  if (/non-empty unheaded prose block after the first body heading and before the first second-level section/i.test(text)) return { kind: 'body-prose-block', position: 'after-first-body-heading-before-first-second-level-section' };
  return { kind: 'residual' };
}

function stripHeading(value = '') { return String(value || '').replace(/^#{1,6}\s+/, '').trim(); }
function exact(value = '') { return String(value || '').trim(); }
function uniqueStrings(values = []) { return [...new Set((values || []).map((item) => String(item || '').trim()).filter(Boolean))]; }
