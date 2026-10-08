import { resolveSchemaCapabilities } from '../../../schemas/capability.registry.js';
import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { schemaRegistry } from '../../../schemas/registry.js';
import { portableFinding } from '../findings.js';
import { selectPortableLoadedSchemaMaterial } from '../providers/schema.providers.js';
import {
  conditionalContractGroups,
  conditionalCreationInputs,
  contractRules,
  parsePortableSchemaDocument,
  readPortableSchemaSections
} from './schema.contract.js';
import { resolvePortableLlmCompanion } from './llm.companion.js';
import { compilePortableSchemaContract, compilePortableSchemaContractChain } from './contract.compile.js';
import { projectCreationRuntime } from './runtime.project.js';
import { findSchemaMaterial } from '../input/portable.input.js';

export const PORTABLE_SCHEMA_GUIDE_SCHEMA_ID = 'tiinex.llm.schema-guide.v1';
export const PORTABLE_SCHEMA_GUIDE_COMPILER_VERSION = '4';

export function buildPortableSchemaGuide(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const task = normalizeTask(input.task || options.task || 'read');
  const detail = normalizeDetail(input.detail || options.detail || 'compact');
  const schemaSelection = selectPortableLoadedSchemaMaterial(input.materials || input, { schemaId });
  const schemaMaterial = schemaSelection.material || null;
  const module = schemaRegistry.byId.get(schemaId) || null;
  const binding = module?.binding || {};
  const markdown = schemaMaterial?.markdown || '';
  const document = markdown ? parsePortableSchemaDocument(markdown) : null;
  const compiledContract = document ? compilePortableSchemaContract(document) : null;
  const capabilityName = capabilityForTask(task);
  const resolution = resolveSchemaCapabilities({ schemaId }, { capability: capabilityName });
  const creationContract = task === 'create' || task === 'continue' ? buildArtifactCreationContract({ schemaId, transitionType: task === 'continue' ? 'continue' : 'create-artifact' }) : null;
  const companionResult = resolvePortableLlmCompanion({ schemaId, task, module, input, options });
  const companion = companionResult.companion;
  const exactReadableContract = Boolean(
    schemaMaterial?.markdown
    && document?.schemaId === schemaId
    && schemaMaterial.qualification?.exactSchemaIdentity === true
    && schemaMaterial.qualification?.sourceQualified === true
    && schemaMaterial.qualification?.representationIntegrity === 'verified'
  );
  const creationRequested = task === 'create' || task === 'continue';
  const requiredSections = compiledContract ? uniqueStrings([
    ...compiledContract.validation.requiredSections,
    ...(creationRequested ? compiledContract.creation.requiredSections : [])
  ]) : [];
  const requiredFields = compiledContract ? [...compiledContract.validation.requiredFields] : [];
  const optionalSections = detail === 'compact' ? [] : compiledContract ? [...compiledContract.validation.optionalSections] : [];
  const optionalFields = detail === 'full' ? (compiledContract ? [...compiledContract.validation.optionalFields] : []) : [];
  const conditionalRequirements = document ? buildConditionalRequirements(document) : [];
  const rules = document ? contractRules(document.validation) : [];
  const creationRules = document ? contractRules(document.creation) : [];
  const loadedLineageContract = creationRequested ? compileLoadedSchemaLineageContract(input.materials || input, schemaId) : null;
  const loadedCreationProjection = loadedLineageContract ? projectCreationRuntime(loadedLineageContract) : null;
  const creationBindings = Array.isArray(creationContract?.creation?.inputBindings) && creationContract.creation.inputBindings.length
    ? creationContract.creation.inputBindings
    : (Array.isArray(loadedCreationProjection?.inputBindings) && loadedCreationProjection.inputBindings.length
      ? loadedCreationProjection.inputBindings
      : (Array.isArray(resolution.descriptor?.factory?.creation?.inputBindings) ? resolution.descriptor.factory.creation.inputBindings : []));
  const creationCoveredFields = creationRequested ? creationBoundFieldNames(creationBindings) : new Set();
  const requiredInputs = creationRequested ? creationRequiredInputs([
    ...(creationContract?.inputs?.required || []),
    ...(compiledContract ? compiledContract.creation.requiredInputs : []),
    ...requiredFields.filter((field) => !creationCoveredFields.has(normalizeKey(field)))
  ], creationBindings) : [];
  const optionalInputs = creationRequested && compiledContract ? [...compiledContract.creation.optionalInputs] : [];
  const toolingConfiguration = creationRequested && compiledContract ? [...compiledContract.creation.toolingConfigurationFields] : [];
  const hardRules = prioritizeRules([...rules, ...creationRules], task, detail);
  const purpose = companion.purpose || document?.summary || module?.label || `Work with ${schemaId || 'an unknown Tiinex schema'}.`;
  const findings = [...schemaSelection.findings, ...companionResult.findings];
  if (!schemaId) findings.push(portableFinding('error', 'portable.schema-guide.schema.required', 'Schema guide generation requires a schema id.'));
  if (!schemaMaterial && !module) findings.push(portableFinding('error', 'portable.schema-guide.schema.unavailable', 'Neither readable schema material nor a registered schema module is available.', { schemaId }));
  if (!schemaMaterial) findings.push(portableFinding('info', 'portable.schema-guide.readable-schema.unavailable', 'The guide is limited to registered runtime metadata because readable schema Markdown was not supplied.', { schemaId }));
  if (schemaMaterial && document?.schemaId && document.schemaId !== schemaId) findings.push(portableFinding('error', 'portable.schema-guide.readable-schema.mismatch', 'Supplied readable schema material declares a different Current Schema than the requested schema.', {
    requestedSchemaId: schemaId,
    declaredSchemaId: document.schemaId,
    ref: schemaMaterial.path
  }));
  if (!companion.available) findings.push(portableFinding('info', 'portable.schema-guide.llm-companion.generic', 'No schema-specific LLM companion hints were registered; the guide was compiled generically from schema contracts and runtime capabilities.', { schemaId }));
  const cacheBasis = binding.checksum?.value || binding.checksum || schemaMaterial?.markdown || `${schemaId}:${module?.id || ''}`;
  const guide = Object.freeze({
    schema: PORTABLE_SCHEMA_GUIDE_SCHEMA_ID,
    schemaId,
    task,
    detail,
    cacheKey: guideCacheKey({ schemaId, task, detail, basis: cacheBasis, companionVersion: companion.version }),
    cacheBasis: Object.freeze({
      schemaChecksum: binding.checksum?.value || binding.checksum || '',
      sourceCommit: binding.sourceCommit || '',
      compilerVersion: PORTABLE_SCHEMA_GUIDE_COMPILER_VERSION,
      companionVersion: companion.version,
      companionSource: companion.source
    }),
    purpose,
    parentSchemaId: document?.parentSchemaId || module?.parentSchemaId || '',
    capability: Object.freeze({
      requested: capabilityName,
      exactModule: Boolean(resolution.descriptor?.moduleId === schemaId && !resolution.fallbackUsed),
      status: exactReadableContract ? 'readable-exact-contract' : (resolution.capability?.status || ''),
      resolvedThrough: exactReadableContract ? schemaId : (resolution.descriptor?.moduleId || 'tiinex.root.v1'),
      fallbackUsed: exactReadableContract ? false : Boolean(resolution.fallbackUsed),
      runtimeStatus: resolution.capability?.status || '',
      runtimeResolvedThrough: resolution.descriptor?.moduleId || 'tiinex.root.v1',
      runtimeFallbackUsed: Boolean(resolution.fallbackUsed)
    }),
    factoryDescriptor: resolution.descriptor?.factory || null,
    creationBindings: Object.freeze(creationBindings.map((binding) => Object.freeze({ ...binding }))),
    requiredInputs: Object.freeze(limitList(requiredInputs, detail === 'compact' ? 18 : 80)),
    requiredStructure: Object.freeze(limitList(requiredSections, detail === 'compact' ? 14 : 80)),
    requiredFields: Object.freeze(limitList(requiredFields, detail === 'compact' ? 24 : 120)),
    declarationContracts: Object.freeze((compiledContract?.declarations || []).map((contract) => Object.freeze({
      group: contract.group,
      targetHeadings: contract.targetHeadings,
      requiredFields: contract.requiredFields,
      optionalFields: detail === 'compact' ? Object.freeze([]) : contract.optionalFields,
      allowLiteralNone: contract.allowLiteralNone
    }))),
    optionalInputs: Object.freeze(limitList(optionalInputs, detail === 'compact' ? 18 : 80)),
    toolingConfiguration: Object.freeze({
      fields: Object.freeze(limitList(toolingConfiguration, detail === 'compact' ? 18 : 80)),
      authoringInputs: false,
      statement: 'Create-surface prompt configuration is tooling metadata, not artifact content.'
    }),
    conditionalRequirements: Object.freeze(conditionalRequirements.slice(0, detail === 'compact' ? 12 : 80)),
    optionalStructure: Object.freeze(optionalSections),
    optionalFields: Object.freeze(optionalFields),
    authoringSteps: Object.freeze(companion.authoringSteps.length ? companion.authoringSteps : defaultAuthoringSteps({ task, schemaId, requiredSections, requiredFields })),
    hardRules: Object.freeze(limitList([...companion.hardRules, ...hardRules], detail === 'compact' ? 18 : 80)),
    questions: Object.freeze(limitList(companion.questions, detail === 'compact' ? 10 : 40)),
    commonFailures: Object.freeze(limitList(companion.commonFailures, detail === 'compact' ? 10 : 40)),
    companion: Object.freeze({
      available: companion.available,
      source: companion.source,
      version: companion.version,
      prioritySections: companion.prioritySections
    }),
    validationPlan: Object.freeze(validationPlan({ schemaId, resolution, document, task })),
    retrieval: Object.freeze({
      recommendedNext: recommendedRetrieval({ task, detail, document, creationContract, companion }),
      availableSections: Object.freeze((document?.outline || []).map((section) => section.title)),
      fullSchemaAvailable: Boolean(schemaMaterial)
    }),
    authority: Object.freeze({
      readableSchemaAvailable: Boolean(schemaMaterial),
      exactReadableContract,
      schemaPath: schemaMaterial?.path || binding.snapshot || '',
      sourcePath: schemaMaterial?.source?.path || binding.sourcePath || '',
      sourceRepository: schemaMaterial?.source?.repository || binding.sourceRepository || '',
      sourceCommit: schemaMaterial?.source?.commit || binding.sourceCommit || '',
      materialQualification: schemaMaterial?.qualification ? Object.freeze({
        authority: schemaMaterial.qualification.authority,
        sourceQualified: schemaMaterial.qualification.sourceQualified,
        representationIntegrity: schemaMaterial.qualification.representationIntegrity,
        runtimeBootstrapProvenance: schemaMaterial.qualification.runtimeBootstrapProvenance,
        registered: schemaMaterial.qualification.registered
      }) : null,
      statement: schemaMaterial ? `resolved readable schema material (${schemaMaterial.qualification?.authority || 'unqualified'})` : 'Registered runtime metadata only; obtain readable canonical schema for prose-bound semantics.'
    })
  });
  return Object.freeze({ guide, findings: Object.freeze(findings) });
}

export function readPortableSchemaGuideSections(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const schemaSelection = selectPortableLoadedSchemaMaterial(input.materials || input, { schemaId });
  const schemaMaterial = schemaSelection.material || null;
  if (!schemaMaterial) return Object.freeze({
    schema: 'tiinex.portable.schema-section.result.v1',
    schemaId,
    selectors: Object.freeze([]),
    matches: Object.freeze([]),
    truncated: false,
    findings: Object.freeze([portableFinding('error', 'portable.schema-section.schema.unavailable', 'Readable schema material is required to read schema sections.', { schemaId })])
  });
  const selectors = input.sections || input.section || options.sections || options.section || [];
  const result = readPortableSchemaSections(schemaMaterial.markdown, selectors, options);
  return Object.freeze({ ...result, findings: Object.freeze(schemaSelection.findings), authority: schemaMaterial.qualification?.authority || '', path: schemaMaterial.path });
}

export function planPortableArtifact(input = {}, options = {}) {
  const guideResult = buildPortableSchemaGuide({ ...input, task: input.task || 'create' }, options);
  const guide = guideResult.guide;
  const rawValues = input.inputs || input.values || {};
  const creationBindings = Array.isArray(guide.creationBindings) ? guide.creationBindings : [];
  const provided = normalizeProvidedInputs(rawValues, creationBindings);
  const missingInputs = uniqueStrings([
    ...guide.requiredInputs.filter((name) => !provided.has(normalizeKey(name))),
    ...missingStructuredCreationInputs(rawValues, creationBindings)
  ]);
  const plan = Object.freeze({
    schema: 'tiinex.llm.artifact-plan.v1',
    schemaId: guide.schemaId,
    task: guide.task,
    cacheKey: guide.cacheKey,
    readyToDraft: missingInputs.length === 0 && guide.authority.readableSchemaAvailable && !guideResult.findings.some((finding) => finding.severity === 'error'),
    conditionReviewRequired: guide.conditionalRequirements.length > 0,
    missingInputs: Object.freeze(missingInputs),
    providedInputs: Object.freeze([...provided.values()]),
    structure: Object.freeze(guide.requiredStructure.map((section, index) => Object.freeze({ order: index + 1, section }))),
    requiredFields: guide.requiredFields,
    authoringSteps: guide.authoringSteps,
    validationPlan: guide.validationPlan,
    conditionalRequirements: guide.conditionalRequirements,
    retrieval: guide.retrieval,
    limitations: Object.freeze([
      ...(guide.authority.readableSchemaAvailable ? [] : ['Readable schema material is unavailable.']),
      ...(guide.capability.fallbackUsed ? ['Runtime capability resolution used fallback.'] : []),
      ...(guide.conditionalRequirements.length ? ['Conditional requirements require trigger-aware review before the draft can be qualified.'] : [])
    ])
  });
  const findings = [...guideResult.findings];
  if (missingInputs.length) findings.push(portableFinding('warning', 'portable.artifact-plan.inputs.missing', 'Required authoring inputs are missing.', { schemaId: guide.schemaId, missingInputs }));
  return Object.freeze({ plan, guide, findings: Object.freeze(findings) });
}

function compileLoadedSchemaLineageContract(input = {}, schemaId = '') {
  const wanted = String(schemaId || '').trim();
  if (!wanted) return null;
  const seen = new Set();
  const documents = [];
  let current = wanted;
  while (current) {
    if (seen.has(current)) return null;
    seen.add(current);
    const material = findSchemaMaterial(current, input);
    if (!material?.markdown) return null;
    let document;
    try { document = parsePortableSchemaDocument(material.markdown); }
    catch { return null; }
    if (String(document?.schemaId || '').trim() !== current) return null;
    documents.push(document);
    const parent = String(document?.parentSchemaId || '').trim();
    if (!parent) break;
    current = parent;
  }
  documents.reverse();
  let compiled;
  try { compiled = compilePortableSchemaContractChain(documents); }
  catch { return null; }
  return compiled?.lineageQualification?.state === 'valid' ? compiled : null;
}

function validationPlan({ resolution = {}, document = null, task = 'read' }) {
  const steps = ['Parse continuity envelope and declared schema identity.'];
  if (document) steps.push('Apply structured requirements compiled from the supplied readable schema contract.');
  if (resolution.capability?.status === 'implemented' && !resolution.fallbackUsed) steps.push(`Run exact registered ${capabilityForTask(task)} capability.`);
  else steps.push('Run available Root/runtime checks and report partial qualification explicitly.');
  if (task === 'create' || task === 'continue') steps.push('Validate the completed local draft before staging or export.');
  return steps;
}

function recommendedRetrieval({ task, detail, document, creationContract, companion }) {
  const next = [];
  if (!document) next.push('supply-readable-schema');
  next.push(...(companion?.prioritySections || []).map((section) => `read:${section}`));
  next.push(...(companion?.retrievalHints || []));
  if (task === 'create' || task === 'continue') {
    if (creationContract?.status !== 'ready') next.push('read:Artifact Creation Contract');
    next.push('read:Minimal Example');
  }
  if (detail === 'compact') next.push('read:relevant-validation-groups-on-demand');
  return Object.freeze(uniqueStrings(next));
}

function buildConditionalRequirements(document = {}) {
  const validation = conditionalContractGroups(document.validation).map((entry) => Object.freeze({
    source: 'validation-contract',
    group: entry.name,
    requiredWhen: entry.requiredWhen,
    requiredSections: entry.requiredSections,
    requiredFields: entry.requiredFields
  }));
  const creation = conditionalCreationInputs(document).map((entry) => Object.freeze({
    source: 'creation-contract',
    group: entry.group,
    requiredWhen: entry.requiredWhen,
    requiredSections: Object.freeze([]),
    requiredFields: entry.fields
  }));
  return Object.freeze([...validation, ...creation]);
}

function prioritizeRules(rules = [], task = 'read', detail = 'compact') {
  const normalized = uniqueStrings(rules);
  const scored = normalized.map((rule) => ({
    rule,
    score: (/\b(must|must not|required|never|do not|should not)\b/i.test(rule) ? 4 : 0)
      + (task === 'create' && /\b(create|generated|artifact|field|section)\b/i.test(rule) ? 2 : 0)
      + (/\b(provenance|parent|origin|boundary|evidence|truth|authority)\b/i.test(rule) ? 1 : 0)
  }));
  scored.sort((a, b) => b.score - a.score || a.rule.localeCompare(b.rule));
  return scored.slice(0, detail === 'compact' ? 16 : 80).map((item) => item.rule);
}

function defaultAuthoringSteps({ task, schemaId, requiredSections, requiredFields }) {
  if (task === 'read') return [
    `Confirm the declared schema is ${schemaId || 'the requested schema'}.`,
    'Read continuity, parent, origin, boundaries, and qualification before interpreting body meaning.',
    'Retrieve only the schema sections needed for the current question.'
  ];
  return [
    'Establish the real continuity parent and origin boundary.',
    ...(requiredSections.length ? ['Create the required body sections in schema order.'] : []),
    ...(requiredFields.length ? ['Collect every required field before claiming the draft is ready.'] : []),
    'Write a local draft without inheriting or guessing source provenance.',
    'Validate the draft and repair only reported findings.'
  ];
}

function guideCacheKey({ schemaId, task, detail, basis, companionVersion }) {
  return [schemaId || 'unknown', task, detail, `schema-${stableHash(basis)}`, `compiler-${PORTABLE_SCHEMA_GUIDE_COMPILER_VERSION}`, `companion-${companionVersion || 'generic'}`].join(':');
}

function stableHash(value = '') {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function normalizeProvidedInputs(values = {}, bindings = []) {
  const map = new Map();
  if (Array.isArray(values)) {
    for (const value of values) {
      const name = typeof value === 'string' ? value : value?.name || value?.field || '';
      if (name) map.set(normalizeKey(name), String(name));
    }
    return map;
  }
  for (const [name, value] of Object.entries(values || {})) {
    if (!creationValuePresent(value)) continue;
    map.set(normalizeKey(name), name);
    const binding = bindings.find((candidate) => normalizeKey(candidate?.input) === normalizeKey(name));
    if (!binding) continue;
    if (binding.kind === 'ordinary-group' && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [field, nested] of Object.entries(value)) {
        if (!creationValuePresent(nested)) continue;
        map.set(normalizeKey(`${name}.${field}`), `${name}.${field}`);
      }
    }
    if (binding.kind === 'named-declaration-section' && Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        const fields = value[index]?.fields;
        if (!fields || typeof fields !== 'object' || Array.isArray(fields)) continue;
        for (const [field, nested] of Object.entries(fields)) {
          if (!creationValuePresent(nested)) continue;
          map.set(normalizeKey(`${name}[${index}].${field}`), `${name}[${index}].${field}`);
        }
      }
    }
  }
  return map;
}

function missingStructuredCreationInputs(values = {}, bindings = []) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return [];
  const missing = [];
  for (const binding of bindings || []) {
    const input = String(binding?.input || '').trim();
    if (!input || !Object.prototype.hasOwnProperty.call(values, input)) continue;
    const value = values[input];
    const requiredFields = uniqueStrings(binding?.requiredFields || []);
    if (!requiredFields.length) continue;
    if (binding.kind === 'ordinary-group') {
      const object = value && typeof value === 'object' && !Array.isArray(value) ? value : null;
      for (const field of requiredFields) if (!object || !creationValuePresent(object[field])) missing.push(`${input}.${field}`);
      continue;
    }
    if (binding.kind === 'named-declaration-section') {
      if (typeof value === 'string' && String(value).trim().toLowerCase() === 'none' && binding.allowLiteralNone === true) continue;
      if (!Array.isArray(value) || !value.length) continue;
      for (let index = 0; index < value.length; index += 1) {
        const fields = value[index]?.fields && typeof value[index].fields === 'object' && !Array.isArray(value[index].fields) ? value[index].fields : null;
        for (const field of requiredFields) if (!fields || !creationValuePresent(fields[field])) missing.push(`${input}[${index}].${field}`);
      }
    }
  }
  return uniqueStrings(missing);
}

function creationBoundFieldNames(bindings = []) {
  const fields = new Set();
  for (const binding of bindings || []) {
    if (binding?.kind === 'ordinary-field' && binding.field) fields.add(normalizeKey(binding.field));
    for (const field of [...(binding?.requiredFields || []), ...(binding?.optionalFields || [])]) fields.add(normalizeKey(field));
  }
  return fields;
}

// A schema lineage may expose a required field both as an inherited scalar
// input and as a member of a qualified ordinary-group binding. Where the
// owning group is itself a required creation input, its structured value is
// the source of truth. Do not demand a second top-level shadow value; nested
// missing fields are checked by missingStructuredCreationInputs instead.
function creationRequiredInputs(rawInputs = [], bindings = []) {
  const requested = uniqueStrings(rawInputs);
  const requestedNames = new Set(requested.map(normalizeKey));
  const requiredGroups = (bindings || []).filter((binding) =>
    binding?.kind === 'ordinary-group' && requestedNames.has(normalizeKey(binding.input)));
  const groupInputs = new Set(requiredGroups.map((binding) => normalizeKey(binding.input)));
  const groupedFields = new Set(requiredGroups.flatMap((binding) =>
    [...(binding.requiredFields || []), ...(binding.optionalFields || [])].map(normalizeKey)));
  const standaloneFields = new Set((bindings || [])
    .filter((binding) => binding?.kind === 'ordinary-field')
    .map((binding) => normalizeKey(binding.field || binding.input)));
  return requested.filter((name) => {
    const normalized = normalizeKey(name);
    return !groupedFields.has(normalized) || groupInputs.has(normalized) || standaloneFields.has(normalized);
  });
}

function creationValuePresent(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function capabilityForTask(task = 'read') {
  if (task === 'create') return 'create';
  if (task === 'continue') return 'continue';
  if (task === 'validate') return 'validate';
  return 'read';
}

function normalizeTask(value = '') {
  const task = String(value || '').toLowerCase().trim();
  return ['read', 'create', 'continue', 'validate', 'repair'].includes(task) ? task : 'read';
}

function normalizeDetail(value = '') {
  const detail = String(value || '').toLowerCase().trim();
  return ['compact', 'standard', 'full'].includes(detail) ? detail : 'compact';
}

function normalizeKey(value = '') {
  return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function limitList(values = [], max = 20) {
  return uniqueStrings(values).slice(0, max);
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean))];
}
