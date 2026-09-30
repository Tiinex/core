import { nativeSchemaMarkdown, nativeSchemaPackManifest } from '../../../schemas/generated/native.schema.pack.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { portableFinding } from '../findings.js';
import { portableInputFiles } from '../input/portable.input.js';
import { indexPortableMaterials, materialIsSchemaDocument } from '../package/material.graph.js';
import { compilePortableSemanticPackage } from '../package/semantic.package.js';
import { GENERATION_AUTHORITY_SCHEMA_ID, qualifyPortableExplicitGenerationBinding } from '../package/generation.binding.js';
import { isPackageManifestArtifact, isTransitionArtifact, SCHEMA_TRANSITION_COMPANION_SCHEMA_ID, SEMANTIC_PACKAGE_SCHEMA_ID, TRANSITION_DEFINITION_SCHEMA_ID } from '../package/semantic.package.types.js';
import { compilePortableSchemaContractChain } from '../schema/contract.compile.js';
import { projectPortableContractInstance } from '../schema/contract.project.js';
import { parsePortableSchemaDocument } from '../schema/schema.contract.js';

export const PORTABLE_TRANSITION_CATALOG_SCHEMA_ID = 'tiinex.portable.transition-catalog.v1';
export const PORTABLE_TRANSITION_DEFINITION_READ_SCHEMA_ID = 'tiinex.portable.transition-definition-read.v1';
export const PORTABLE_TRANSITION_NEIGHBORHOOD_SCHEMA_ID = 'tiinex.portable.transition-neighborhood.v1';

const ROOT_SCHEMA_ID = 'tiinex.root.v1';
const ACCEPTED_VALIDATION_STATES = new Set(['valid', 'valid-with-preserved-unknowns']);

let bundledTransitionContract = null;

/**
 * Discover canonical Transition Definition artifacts from explicitly supplied material.
 *
 * This is intentionally a read/discovery surface only. It does not claim semantic-package
 * attachment, applicability, executability, recommendation, ordering, or generation authority.
 * Those remain separate qualification/planning concerns.
 */
export function projectPortableTransitionNeighborhood(input = {}, options = {}) {
  const outputSchemaId = String(input.outputSchemaId || options.outputSchemaId || '').trim();
  const inputSchemaId = String(input.inputSchemaId || options.inputSchemaId || '').trim();
  const catalog = projectPortableTransitionCatalog({ ...input, outputSchemaId, inputSchemaId }, options);
  const findings = [...(catalog.findings || [])];
  if (!outputSchemaId) {
    findings.push(portableFinding('error', 'portable.transition-neighborhood.output-schema.required', 'Transition neighborhood projection requires an explicit output schema id.'));
    return transitionNeighborhoodResult(catalog, [], findings, { outputSchemaId, inputSchemaId });
  }

  const materials = transitionMaterialInputs(input);
  const candidateByLocator = new Map((catalog.candidates || []).map((definition) => [definitionLocatorKey(definition), definition]).filter(([key]) => Boolean(key)));
  const candidateByOriginPath = new Map((catalog.candidates || []).map((definition) => [`${materialOriginKey(definition)}\u0000${definition.path}`, definition]));
  const projected = new Map();

  for (const group of groupTransitionMaterialsByOrigin(materials)) {
    const materialIndex = indexPortableMaterials(group.materials);
    const manifests = (materialIndex.materials || []).filter(isPackageManifestArtifact);
    if (!manifests.length) continue;
    const contracts = semanticPackageContracts();
    if (!contracts) {
      findings.push(portableFinding('error', 'portable.transition-neighborhood.contracts.unavailable', 'Bundled canonical Semantic Package / Schema Transition Companion / Transition Definition contracts are unavailable.'));
      break;
    }
    for (const manifest of manifests) {
      const compiled = compilePortableSemanticPackage({
        materials: group.materials,
        selectedManifest: manifest.representationKey,
        contracts,
        resolvers: transitionResolvers(materialIndex, input.resolvers || {})
      });
      findings.push(...(compiled.findings || []).map((finding) => Object.freeze({ ...finding, details: Object.freeze({ ...(finding.details || {}), neighborhoodManifest: manifest.path, materialOrigin: group.key }) })));
      if (compiled.status === 'invalid') continue;
      const registryByKey = new Map((compiled.transitionRegistry || []).map((entry) => [entry.representationKey, entry]));
      for (const state of compiled.schemaAttachments || []) {
        if (String(state.schemaId || '') !== outputSchemaId || state.state !== 'declared') continue;
        for (const attachment of state.attachments || []) {
          if (attachment.referenceQualification !== 'resolved' || !attachment.transitionRepresentationKey) continue;
          if (attachment.participation?.qualification === 'contradictory') continue;
          const targetMaterial = materialIndex.byKey.get(attachment.transitionRepresentationKey);
          const registryEntry = registryByKey.get(attachment.transitionRepresentationKey);
          if (!targetMaterial || !registryEntry) continue;
          const locatorKey = materialLocatorKey(targetMaterial);
          const definition = candidateByLocator.get(locatorKey) || candidateByOriginPath.get(`${group.key}\u0000${targetMaterial.path}`);
          if (!definition) continue;
          const representationKey = definitionRepresentationKey(definition);
          const authoringProfile = projectTransitionAuthoringProfile({
            definition,
            targetMaterial,
            materials: group.materials,
            packageGraph: compiled.packageGraph,
            contracts,
            outputSchemaId,
            resolvers: transitionResolvers(materialIndex, input.resolvers || {})
          });
          findings.push(...authoringProfile.findings);
          const provenance = Object.freeze({
            packageManifestPath: manifest.path,
            packageQualification: compiled.status,
            schemaPath: state.path,
            companionRepresentationKeys: Object.freeze([...(state.companions || [])]),
            attachmentName: String(attachment.name || ''),
            attachmentParticipation: String(attachment.participation?.qualification || 'unresolved')
          });
          const existing = projected.get(representationKey);
          if (existing) {
            if (!existing.attachmentProvenance.some((item) => JSON.stringify(item) === JSON.stringify(provenance))) existing.attachmentProvenance.push(provenance);
          } else {
            projected.set(representationKey, { ...definition, attachmentQualification: 'explicit-schema-companion', attachmentProvenance: [provenance], authoringProfile: authoringProfile.profile });
          }
        }
      }
    }
  }

  const candidates = [...projected.values()]
    .map((candidate) => Object.freeze({ ...candidate, attachmentProvenance: Object.freeze([...candidate.attachmentProvenance]) }))
    .sort(compareDefinitions);
  return transitionNeighborhoodResult(catalog, candidates, findings, { outputSchemaId, inputSchemaId });
}

export function projectPortableTransitionCatalog(input = {}, options = {}) {
  const findings = [...(Array.isArray(input.findings) ? input.findings : [])];
  const materialIndex = indexPortableMaterials(transitionMaterialInputs(input));
  for (const conflict of materialIndex.representationKeyConflicts || []) {
    findings.push(portableFinding('warning', 'portable.transition-catalog.representation-key.duplicate', 'One supplied representation key maps to more than one material representation; the conflicting representations are not collapsed.', {
      representationKey: conflict.representationKey,
      candidates: conflict.candidates
    }));
  }

  const contract = transitionDefinitionContract();
  if (!contract) {
    findings.push(portableFinding('error', 'portable.transition-catalog.contract.unavailable', 'The bundled canonical Root → Transition Definition contract is unavailable.'));
    return catalogResult([], findings, input, options);
  }

  const definitions = [];
  for (const material of materialIndex.materials || []) {
    if (!isTransitionArtifact(material)) continue;
    const projection = projectPortableContractInstance({
      markdown: material.markdown,
      compiledContract: contract,
      resolvers: transitionResolvers(materialIndex, input.resolvers || {})
    });
    const definition = projectTransitionDefinition(material, projection, input, options);
    definitions.push(definition);
    if (!definition.canonicalReadQualified) {
      findings.push(portableFinding(
        definition.representationQualification === 'structurally-invalid' || definition.representationQualification === 'contradictory' ? 'warning' : 'info',
        'portable.transition-catalog.definition.unqualified',
        'A discovered Transition Definition is preserved in the catalog but is not canonically read-qualified.',
        {
          ref: definition.path,
          canonicalIdentifier: definition.canonicalIdentifier,
          qualification: definition.representationQualification
        }
      ));
    }
  }

  definitions.sort(compareDefinitions);
  return catalogResult(definitions, findings, input, options);
}

function transitionDefinitionContract() {
  if (bundledTransitionContract) return bundledTransitionContract;
  const root = nativeSchemaMarkdown(ROOT_SCHEMA_ID);
  const transition = nativeSchemaMarkdown(TRANSITION_DEFINITION_SCHEMA_ID);
  if (!root || !transition) return null;
  bundledTransitionContract = compilePortableSchemaContractChain([root, transition]);
  return bundledTransitionContract;
}

function transitionResolvers(materialIndex, suppliedResolvers = {}) {
  const suppliedSchemaAuthorities = new Map();
  for (const material of materialIndex.materials || []) {
    if (!materialIsSchemaDocument(material) || !material.schemaId) continue;
    suppliedSchemaAuthorities.set(material.schemaId, schemaAuthorityFromDocument(material.schemaDocument));
  }
  return Object.freeze({
    ...suppliedResolvers,
    resolveSchemaAuthority: (schemaId) => {
      const id = String(schemaId || '').trim();
      if (!id) return null;
      if (typeof suppliedResolvers.resolveSchemaAuthority === 'function') {
        const resolved = suppliedResolvers.resolveSchemaAuthority(id);
        if (resolved) return resolved;
      }
      if (suppliedResolvers.schemaAuthorities?.[id]) return suppliedResolvers.schemaAuthorities[id];
      if (suppliedSchemaAuthorities.has(id)) return suppliedSchemaAuthorities.get(id);
      const markdown = nativeSchemaMarkdown(id);
      if (!markdown) return null;
      return schemaAuthorityFromDocument(parsePortableSchemaDocument(markdown));
    }
  });
}

function schemaAuthorityFromDocument(document = {}) {
  const creationGroups = Array.isArray(document.creation?.groups) ? document.creation.groups : [];
  return Object.freeze({
    targetKind: 'artifact',
    generation: creationGroups.length > 0
  });
}

function transitionMaterialInputs(input = {}) {
  return portableInputFiles(input)
    .filter((file) => typeof file?.content === 'string' || typeof file?.markdown === 'string' || typeof file?.text === 'string')
    .map((file, index) => ({
      representationKey: String(file.representationKey || file.representationId || file.id || `supplied-transition-material:${index}`),
      path: String(file.path || file.name || ''),
      markdown: String(file.markdown ?? file.content ?? file.text ?? ''),
      reference: file.reference,
      url: file.url,
      href: file.href,
      source: {
        ...(file.source || {}),
        sourceMode: String(file.sourceMode || input.sourceMode || 'portable-local'),
        ...(file.locator ? { locator: file.locator } : {})
      }
    }));
}

function projectTransitionDefinition(material, projection, input = {}, options = {}) {
  const identity = ordinaryValues(projection, 'Transition Identity');
  const purpose = ordinaryValues(projection, 'Purpose And Scope');
  const applicability = ordinaryValues(projection, 'Applicability And Conditions');
  const authoringBindings = ordinaryValues(projection, 'Authoring Bindings');
  const interpretationLimits = ordinaryValues(projection, 'Interpretation Limits');
  const inputRoles = declarationEntries(projection, 'Input Role Declaration');
  const outputRoles = declarationEntries(projection, 'Output Role Declaration');
  const lifecycleEffects = declarationEntries(projection, 'Lifecycle Effect Declaration');
  const parentEffects = declarationEntries(projection, 'Parent Effect Declaration');
  const relationEffects = declarationEntries(projection, 'Relation Effect Declaration');
  const destinationBindings = declarationEntries(projection, 'Destination Binding Declaration');
  const outputPlacements = declarationEntries(projection, 'Output Placement Declaration');
  const representationQualification = String(projection.validation?.status || 'unresolved');
  const outputSchemaIds = unique(outputRoles
    .filter((entry) => String(entry.fields['Target Kind'] || '') === 'artifact')
    .map((entry) => schemaConstraintToken(entry.fields['Schema Constraint']))
    .filter(Boolean));
  const inputSchemaIds = unique(inputRoles
    .filter((entry) => String(entry.fields['Target Kind'] || '') === 'artifact')
    .map((entry) => schemaConstraintToken(entry.fields['Schema Constraint']))
    .filter(Boolean));
  const requiredInputs = inputRoles.filter((entry) => requiredRole(entry));
  const outputSchemaId = String(input.outputSchemaId || options.outputSchemaId || '').trim();
  const inputSchemaId = String(input.inputSchemaId || options.inputSchemaId || '').trim();

  return Object.freeze({
    schema: PORTABLE_TRANSITION_DEFINITION_READ_SCHEMA_ID,
    representationKey: material.representationKey,
    path: material.path,
    source: Object.freeze({ ...(material.source || {}) }),
    schemaId: material.schemaId,
    representationQualification,
    representationSha256: sha256Hex(utf8Bytes(material.markdown)),
    canonicalReadQualified: ACCEPTED_VALIDATION_STATES.has(representationQualification),
    identityQualification: ACCEPTED_VALIDATION_STATES.has(representationQualification) ? 'representation-preserved' : 'unqualified',
    transitionIdentity: Object.freeze(identity),
    name: String(identity.Name || ''),
    humanLabel: String(identity['Human Label'] || identity.Name || ''),
    canonicalIdentifier: String(identity['Canonical Identifier'] || ''),
    version: String(identity.Version || ''),
    transitionFamily: String(identity['Transition Family'] || ''),
    purpose: String(purpose.Purpose || ''),
    semanticBoundary: String(purpose['Semantic Boundary'] || ''),
    applicabilityMeaning: String(applicability['Applicability Meaning'] || ''),
    applicability: Object.freeze(applicability),
    authoringBindings: Object.freeze(authoringBindings),
    interpretationLimits: Object.freeze(interpretationLimits),
    inputRoles: Object.freeze(inputRoles),
    outputRoles: Object.freeze(outputRoles),
    lifecycleEffects: Object.freeze(lifecycleEffects),
    parentEffects: Object.freeze(parentEffects),
    relationEffects: Object.freeze(relationEffects),
    destinationBindings: Object.freeze(destinationBindings),
    outputPlacements: Object.freeze(outputPlacements),
    outputSchemaIds: Object.freeze(outputSchemaIds),
    inputSchemaIds: Object.freeze(inputSchemaIds),
    requiredInputRoleCount: requiredInputs.length,
    zeroRequiredInputs: requiredInputs.length === 0,
    targetProjection: Object.freeze({
      requestedOutputSchemaId: outputSchemaId,
      requestedInputSchemaId: inputSchemaId,
      outputSchemaMatch: outputSchemaId ? outputSchemaIds.includes(outputSchemaId) : null,
      inputSchemaMatch: inputSchemaId ? inputSchemaIds.includes(inputSchemaId) : null
    }),
    boundary: Object.freeze({
      discovery: 'explicit-supplied-material',
      packageAttachment: 'not-evaluated',
      applicability: 'not-evaluated',
      executable: false,
      generationAuthority: 'not-evaluated'
    }),
    diagnostics: Object.freeze([...(projection.validation?.findings || [])])
  });
}

function catalogResult(definitions, findings, input = {}, options = {}) {
  const outputSchemaId = String(input.outputSchemaId || options.outputSchemaId || '').trim();
  const inputSchemaId = String(input.inputSchemaId || options.inputSchemaId || '').trim();
  const qualified = definitions.filter((definition) => definition.canonicalReadQualified);
  const candidates = qualified.filter((definition) => {
    if (outputSchemaId && !definition.outputSchemaIds.includes(outputSchemaId)) return false;
    if (inputSchemaId && !definition.inputSchemaIds.includes(inputSchemaId)) return false;
    return true;
  });
  const schemaEntry = (nativeSchemaPackManifest.schemas || []).find((entry) => entry.schemaId === TRANSITION_DEFINITION_SCHEMA_ID) || null;
  return Object.freeze({
    schema: PORTABLE_TRANSITION_CATALOG_SCHEMA_ID,
    definitions: Object.freeze(definitions),
    candidates: Object.freeze(candidates),
    counts: Object.freeze({ discovered: definitions.length, readQualified: qualified.length, projectedCandidates: candidates.length }),
    request: Object.freeze({ outputSchemaId, inputSchemaId }),
    contractAuthority: schemaEntry ? Object.freeze({
      schemaId: TRANSITION_DEFINITION_SCHEMA_ID,
      repository: nativeSchemaPackManifest.source?.repository || '',
      commit: nativeSchemaPackManifest.source?.commit || '',
      sourcePath: schemaEntry.sourcePath || '',
      sha256: schemaEntry.sha256 || ''
    }) : null,
    boundary: Object.freeze({
      material: 'explicit-supplied-only',
      workspaceGlobalFallback: false,
      semanticPackageAttachment: 'not-evaluated',
      schemaCompanionAttachment: 'not-evaluated',
      applicability: 'not-evaluated',
      execution: 'not-authorized',
      recommendation: 'not-projected',
      ordering: 'not-projected'
    }),
    limitations: Object.freeze([
      'Discovery does not imply Semantic Package or Schema Transition Companion attachment.',
      'Target-schema projection is a read filter over declared role schema constraints; it is not applicability or execution qualification.',
      'Generation semantics remain owned by each Output Role Generation Binding and the referenced target schema/generation authority.',
      'Each supplied Transition representation is preserved independently. Canonical Identifier + Version is not universal representation identity and is not used to collapse or reject independent origins.'
    ]),
    findings: Object.freeze(findings)
  });
}

function transitionNeighborhoodResult(catalog, candidates, findings, request = {}) {
  return Object.freeze({
    schema: PORTABLE_TRANSITION_NEIGHBORHOOD_SCHEMA_ID,
    candidates: Object.freeze(candidates),
    counts: Object.freeze({ discovered: catalog.counts.discovered, readQualified: catalog.counts.readQualified, attachedCandidates: candidates.length }),
    request: Object.freeze({ outputSchemaId: String(request.outputSchemaId || ''), inputSchemaId: String(request.inputSchemaId || '') }),
    contractAuthority: catalog.contractAuthority,
    boundary: Object.freeze({
      material: 'explicit-supplied-only',
      semanticPackageAttachment: 'required',
      schemaCompanionAttachment: 'required',
      applicability: 'not-evaluated',
      execution: 'not-authorized',
      recommendation: 'not-projected',
      ordering: 'not-projected'
    }),
    limitations: Object.freeze([
      'Neighborhood membership means an explicit Schema Transition Companion attachment resolved through a supplied Semantic Package boundary.',
      'Attachment does not prove current applicability, executability, authorization, recommendation, ordering, or successful invocation.',
      'Workspace/source location is preserved as provenance and does not become Transition semantic identity.'
    ]),
    findings: Object.freeze(findings)
  });
}


function projectTransitionAuthoringProfile({ definition = {}, targetMaterial = null, materials = [], packageGraph = null, contracts = {}, outputSchemaId = '', resolvers = {} } = {}) {
  const findings = [];
  const matchingOutputs = (definition.outputRoles || []).filter((entry) => {
    if (String(entry?.fields?.['Target Kind'] || '') !== 'artifact') return false;
    return schemaConstraintToken(entry?.fields?.['Schema Constraint']) === String(outputSchemaId || '').trim();
  });
  if (matchingOutputs.length !== 1) return Object.freeze({ profile: emptyAuthoringProfile(matchingOutputs.length > 1 ? 'ambiguous-output-role' : 'output-role-unresolved'), findings: Object.freeze(findings) });
  const outputRole = matchingOutputs[0];
  const declared = String(outputRole?.fields?.['Generation Binding'] || '').trim();
  if (!declared || declared === 'target-schema') return Object.freeze({ profile: emptyAuthoringProfile(declared === 'target-schema' ? 'target-schema-generation' : 'generation-binding-missing'), findings: Object.freeze(findings) });
  const qualification = qualifyPortableExplicitGenerationBinding({
    transitionMaterial: targetMaterial,
    outputRoleName: String(outputRole.name || ''),
    expectedTargetSchema: String(outputSchemaId || '').trim(),
    materials,
    packageGraph,
    transitionContract: contracts.transitionDefinition,
    generationContract: contracts.generation,
    resolvers
  });
  findings.push(...(qualification.findings || []).map((finding) => Object.freeze({ ...finding, details: Object.freeze({ ...(finding.details || {}), transitionPath: definition.path, authoringProjection: true }) })));
  if (qualification.qualification !== 'qualified' || !qualification.authority) {
    return Object.freeze({ profile: Object.freeze({ ...emptyAuthoringProfile(`explicit-generation-${qualification.qualification || 'unresolved'}`), generationBinding: declared, generationQualification: qualification.qualification || 'unresolved' }), findings: Object.freeze(findings) });
  }
  const projectedDefaults = (qualification.authority.defaultedInputs || []).filter((entry) => entry.qualification === 'qualified' && entry.name);
  const unresolvedDefaults = (qualification.authority.defaultedInputs || []).filter((entry) => entry.qualification !== 'qualified');
  const defaults = {};
  for (const entry of projectedDefaults) defaults[entry.name] = entry.value;
  const state = unresolvedDefaults.length ? 'unresolved-defaults' : projectedDefaults.length ? 'qualified' : 'no-defaults';
  return Object.freeze({
    profile: Object.freeze({
      schema: 'tiinex.portable.transition-authoring-profile.v1',
      state,
      generationBinding: declared,
      generationQualification: qualification.qualification,
      generationAuthority: qualification.authority.selectedRepresentation || null,
      defaults: deepFreeze(defaults),
      defaultedInputs: Object.freeze([...(qualification.authority.defaultedInputs || [])]),
      requiredInputs: Object.freeze([...(qualification.authority.requiredInputs || [])]),
      boundary: Object.freeze({
        explicitSelectionRequired: true,
        recommendation: 'not-projected',
        ordering: 'not-projected',
        transitionApplicability: 'not-evaluated',
        executionAuthorized: false,
        defaultsAreAuthoringGuidance: true
      })
    }),
    findings: Object.freeze(findings)
  });
}

function emptyAuthoringProfile(reason = '') {
  return Object.freeze({
    schema: 'tiinex.portable.transition-authoring-profile.v1',
    state: 'unavailable',
    reason: String(reason || ''),
    generationBinding: '',
    generationQualification: 'not-evaluated',
    generationAuthority: null,
    defaults: Object.freeze({}),
    defaultedInputs: Object.freeze([]),
    requiredInputs: Object.freeze([]),
    boundary: Object.freeze({
      explicitSelectionRequired: true,
      recommendation: 'not-projected',
      ordering: 'not-projected',
      transitionApplicability: 'not-evaluated',
      executionAuthorized: false,
      defaultsAreAuthoringGuidance: true
    })
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return Object.freeze(value.map((item) => deepFreeze(item)));
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = deepFreeze(item);
  return Object.freeze(out);
}

function semanticPackageContracts() {
  const semanticPackage = bundledSchemaContract(SEMANTIC_PACKAGE_SCHEMA_ID);
  const schemaTransitionCompanion = bundledSchemaContract(SCHEMA_TRANSITION_COMPANION_SCHEMA_ID);
  const transitionDefinition = transitionDefinitionContract();
  const generation = bundledSchemaContract(GENERATION_AUTHORITY_SCHEMA_ID);
  return semanticPackage && schemaTransitionCompanion && transitionDefinition && generation
    ? Object.freeze({ semanticPackage, schemaTransitionCompanion, transitionDefinition, generation })
    : null;
}

const bundledSchemaContracts = new Map();
function bundledSchemaContract(schemaId = '') {
  const id = String(schemaId || '').trim();
  if (!id) return null;
  if (bundledSchemaContracts.has(id)) return bundledSchemaContracts.get(id);
  const lineage = bundledNativeSchemaLineage(id);
  const compiled = lineage ? compilePortableSchemaContractChain(lineage) : null;
  bundledSchemaContracts.set(id, compiled);
  return compiled;
}

function bundledNativeSchemaLineage(schemaId = '') {
  const lineage = [];
  const visited = new Set();
  let currentId = String(schemaId || '').trim();
  while (currentId) {
    if (visited.has(currentId)) return null;
    visited.add(currentId);
    const markdown = nativeSchemaMarkdown(currentId);
    if (!markdown) return null;
    lineage.unshift(markdown);
    if (currentId === ROOT_SCHEMA_ID) break;
    const parsed = parsePortableSchemaDocument(markdown);
    currentId = String(parsed?.parentSchemaId || '').trim();
    if (!currentId) return null;
  }
  return lineage.length && currentId === ROOT_SCHEMA_ID ? lineage : null;
}

function groupTransitionMaterialsByOrigin(materials = []) {
  const groups = new Map();
  for (const material of materials) {
    const key = materialOriginKey(material);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(material);
  }
  return [...groups.entries()].map(([key, groupMaterials]) => Object.freeze({ key, materials: Object.freeze(groupMaterials) }));
}

function materialOriginKey(material = {}) {
  const locator = material.source?.locator || {};
  if (locator.kind === 'node-file' && locator.localPath) {
    const local = String(locator.localPath).replace(/\\/g, '/');
    const relative = String(material.path || '').replace(/\\/g, '/').replace(/^\/+/, '');
    if (relative && local.endsWith(`/${relative}`)) return `node-root:${local.slice(0, -(relative.length + 1))}`;
    const slash = local.lastIndexOf('/');
    return `node-root:${slash >= 0 ? local.slice(0, slash) : local}`;
  }
  if (locator.kind === 'node-zip-entry' && locator.archivePath) return `node-zip:${String(locator.archivePath)}`;
  const source = material.source || {};
  return `source:${String(source.repository || source.adapterId || source.sourceMode || 'portable')}@${String(source.commit || source.ref || '')}`;
}

function materialLocatorKey(material = {}) {
  const locator = material.source?.locator || {};
  if (locator.kind === 'node-file' && locator.localPath) return `node-file:${String(locator.localPath).replace(/\\/g, '/')}`;
  if (locator.kind === 'node-zip-entry' && locator.archivePath && locator.entryPath) return `node-zip:${locator.archivePath}#${locator.entryPath}`;
  return '';
}

function definitionLocatorKey(definition = {}) {
  const locator = definition.source?.locator || {};
  if (locator.kind === 'node-file' && locator.localPath) return `node-file:${String(locator.localPath).replace(/\\/g, '/')}`;
  if (locator.kind === 'node-zip-entry' && locator.archivePath && locator.entryPath) return `node-zip:${locator.archivePath}#${locator.entryPath}`;
  return '';
}

function definitionRepresentationKey(definition = {}) {
  return definitionLocatorKey(definition) || `${materialOriginKey(definition)}\u0000${definition.path}\u0000${definition.representationSha256}`;
}

function ordinaryValues(projection = {}, groupName = '') {
  const group = (projection.ordinaryGroups || []).find((item) => String(item.group || '') === groupName);
  if (!group) return {};
  const values = {};
  for (const field of group.fields || []) {
    if (field.qualification !== 'present' || (field.occurrences || []).length !== 1) continue;
    values[String(field.label || '')] = field.occurrences[0].value;
  }
  return values;
}

function declarationEntries(projection = {}, groupName = '') {
  const group = (projection.validation?.declarations || []).find((item) => String(item.contract?.group || '') === groupName);
  if (!group) return [];
  return group.sections.flatMap((section) => (section.entries || [])
    .filter((entry) => String(entry.name || '') !== 'none')
    .map((entry) => Object.freeze({
      name: String(entry.name || ''),
      fields: Object.freeze({ ...(entry.fields || {}) })
    })));
}

function requiredRole(entry = {}) {
  const minimum = String(entry.fields?.['Minimum Count'] ?? '').trim();
  if (!minimum) return true;
  if (minimum === '0') return false;
  if (minimum === 'unknown') return true;
  const numeric = Number.parseInt(minimum, 10);
  return !Number.isFinite(numeric) || numeric > 0;
}

function schemaConstraintToken(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  const match = /^\[[^\]]+\]\(([^)]+)\)$/.exec(text);
  const candidate = match ? match[1] : text;
  if (/^tiinex\.[a-z0-9._-]+$/i.test(candidate)) return candidate;
  const filename = candidate.split('/').pop() || '';
  return filename.replace(/\.schema\.md$/i, '');
}

function unique(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort(compareText);
}

function compareDefinitions(left, right) {
  return compareText(left.canonicalIdentifier, right.canonicalIdentifier)
    || compareText(left.version, right.version)
    || compareText(left.path, right.path)
    || compareText(left.representationKey, right.representationKey);
}

function compareText(left = '', right = '') { return String(left || '').localeCompare(String(right || '')); }
