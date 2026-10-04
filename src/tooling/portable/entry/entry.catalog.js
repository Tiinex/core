import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { schemaMarkdown as nativeSchemaMarkdown, schemaPackManifest } from '../../../schemas/registry.js';
import { compilePortableSchemaContractChain } from '../schema/contract.compile.js';
import { parsePortableSchemaDocument } from '../schema/schema.contract.js';
import { projectPortableContractInstance } from '../schema/contract.project.js';
import { decodePortableContentText, portableContentSourceEntries } from '../content/contentSource.records.js';

export const ENTRY_SCHEMA_ID = 'tiinex.entry.v1';
export const PORTABLE_ENTRY_CATALOG_SCHEMA_ID = 'tiinex.portable.entry-catalog.v1';
const ROOT_SCHEMA_ID = 'tiinex.root.v1';
const ACCEPTED_VALIDATION_STATES = new Set(['valid', 'valid-with-preserved-unknowns']);
const BASE_ENTRY_GROUPS = new Set([
  'Entry Identity', 'Purpose And Scope', 'Entry Context', 'Preparation', 'Entry Method',
  'Presentation And Interaction', 'Interpretation Limits', 'Portability Notes'
]);
let cachedRootDeclarationGroups = null;

export function projectPortableEntryCatalog(input = {}) {
  const findings = [];
  const schemaIndex = buildEntrySchemaIndex(input.inspection, findings, input.contentSources || input.sources || []);
  const schemaResolutions = new Map();
  const entrySchemaIds = new Set();
  for (const schemaId of schemaIndex.keys()) {
    const resolution = resolveEntrySchemaContract(schemaId, schemaIndex, schemaResolutions);
    if (resolution?.isEntryFamily) entrySchemaIds.add(schemaId);
  }
  if (!entrySchemaIds.has(ENTRY_SCHEMA_ID)) return blockedCatalog('entry-contract-unavailable', findings);

  const representations = [
    ...contentSourceRepresentations(input.contentSources || input.sources || [], entrySchemaIds),
    ...carriedRepresentations(input.inspection, entrySchemaIds)
  ];
  const projected = [];
  for (const material of representations) {
    if (!eligibleEntryPath(material.path)) continue;
    const schemaResolution = resolveEntrySchemaContract(material.schemaId, schemaIndex, schemaResolutions);
    if (!schemaResolution?.isEntryFamily || !schemaResolution.contract) continue;
    const projection = projectPortableContractInstance({ markdown: material.markdown, compiledContract: schemaResolution.contract });
    const validation = String(projection.validation?.status || 'unresolved');
    const entry = projectEntry(material, projection, validation, schemaResolution);
    projected.push(entry);
    if (!entry.readQualified) findings.push(Object.freeze({
      severity: validation === 'structurally-invalid' || validation === 'contradictory' ? 'warning' : 'info',
      code: 'portable.entry-catalog.entry.unqualified',
      message: 'A discovered Entry-family representation was preserved but is not canonically read-qualified.',
      context: Object.freeze({
        id: entry.id,
        schemaId: entry.schemaId,
        path: entry.artifactPath,
        workspaceId: entry.workspaceId,
        qualification: validation
      })
    }));
  }

  const leaves = currentLeafKeys(projected);
  const entries = projected
    .filter((entry) => entry.readQualified && (entry.sourceKind === 'content-source' || leaves.has(entry.id)))
    .map((entry) => Object.freeze({ ...entry, currentLeaf: true }))
    .sort((a, b) => a.label.localeCompare(b.label) || a.sourceKind.localeCompare(b.sourceKind) || a.id.localeCompare(b.id));
  return Object.freeze({
    schema: PORTABLE_ENTRY_CATALOG_SCHEMA_ID,
    status: 'ready',
    state: 'catalog',
    entries: Object.freeze(entries),
    findings: Object.freeze(findings),
    entrySchemaIds: Object.freeze([...entrySchemaIds].sort()),
    contractAuthority: nativeEntryContractAuthority(),
    boundary: 'Projects qualified reusable Entry definitions across tiinex.entry.v1 and qualified descendant schemas. Entry discovery or selection does not establish that entry occurred and does not create routing, recipient authority, Role-holder state, participant authority, acceptance, ownership, task selection, continuation, work transfer, or completion.'
  });
}

function nativeEntryContractAuthority() {
  const descriptor = (schemaPackManifest()?.schemas || []).find((item) => String(item?.schemaId || '') === ENTRY_SCHEMA_ID) || {};
  const source = schemaPackManifest()?.source || {};
  return Object.freeze({
    schemaId: ENTRY_SCHEMA_ID,
    repository: String(source.repository || ''),
    commit: String(source.commit || ''),
    publicationState: String(source.publicationState || ''),
    sourcePath: String(descriptor.sourcePath || '')
  });
}

function blockedCatalog(reasonCode, findings = []) {
  return Object.freeze({
    schema: PORTABLE_ENTRY_CATALOG_SCHEMA_ID,
    status: 'blocked',
    state: 'blocked',
    reasonCode,
    entries: Object.freeze([]),
    findings: Object.freeze(findings),
    boundary: 'Entry discovery is read-only and does not establish invocation, authority, routing, transfer, acceptance, or occurrence.'
  });
}

function buildEntrySchemaIndex(inspection = {}, findings = [], contentSources = []) {
  const candidates = new Map();
  const add = (record) => {
    if (!record?.schemaId || !record.markdown) return;
    if (!candidates.has(record.schemaId)) candidates.set(record.schemaId, []);
    candidates.get(record.schemaId).push(Object.freeze(record));
  };

  for (const descriptor of schemaPackManifest()?.schemas || []) {
    const schemaId = String(descriptor?.schemaId || '').trim();
    const markdown = nativeSchemaMarkdown(schemaId);
    if (!schemaId || !markdown) continue;
    add(schemaRecord({
      schemaId,
      markdown,
      sourceKind: 'native-schema-pack',
      source: schemaPackManifest()?.source || {},
      path: String(descriptor?.sourcePath || '')
    }));
  }

  for (const material of portableContentSourceEntries(contentSources, '.schemas')) {
    const sourcePath = normalizePath(material.sourcePath || '');
    if (!sourcePath || !/\.schema\.md$/i.test(sourcePath)) continue;
    const markdown = decodePortableContentText(material);
    if (!markdown) continue;
    let parsed;
    try { parsed = parsePortableSchemaDocument(markdown); } catch { continue; }
    const schemaId = String(parsed?.schemaId || '').trim();
    if (!schemaId) continue;
    add(schemaRecord({
      schemaId,
      markdown,
      sourceKind: 'content-schema',
      source: { sourceId: material.sourceId, package: material.sourcePackage },
      path: sourcePath
    }));
  }

  for (const workspace of inspection?.workspaces || []) {
    const workspaceId = String(workspace?.workspaceId || '').trim();
    for (const archiveEntry of workspace?.archive?.entries || []) {
      const path = normalizePath(archiveEntry?.path || '');
      if (!path || !/\.schema\.md$/i.test(path) || !archiveEntry?.data) continue;
      let markdown = '';
      try { markdown = new TextDecoder('utf-8', { fatal: true }).decode(archiveEntry.data); } catch { continue; }
      let parsed;
      try { parsed = parsePortableSchemaDocument(markdown); } catch { continue; }
      const schemaId = String(parsed?.schemaId || '').trim();
      if (!schemaId) continue;
      add(schemaRecord({ schemaId, markdown, sourceKind: 'carried-schema', source: { workspaceId }, path, workspaceId }));
    }
  }

  const index = new Map();
  for (const [schemaId, values] of candidates.entries()) {
    const native = values.filter((item) => item.sourceKind !== 'carried-schema');
    if (native.length) {
      const chosen = native[0];
      const nativeConflict = native.some((item) => item.markdown !== chosen.markdown);
      if (nativeConflict) {
        findings.push(Object.freeze({
          severity: 'error',
          code: 'portable.entry-catalog.schema.native-conflict',
          message: 'Core contains contradictory native schema representations for one schema id.',
          context: Object.freeze({ schemaId })
        }));
        continue;
      }
      const carriedConflict = values.some((item) => item.sourceKind === 'carried-schema' && item.markdown !== chosen.markdown);
      if (carriedConflict) findings.push(Object.freeze({
        severity: 'warning',
        code: 'portable.entry-catalog.schema.carried-shadowed',
        message: 'A carried schema representation conflicts with Core-qualified schema material and was not allowed to redefine Entry discovery semantics.',
        context: Object.freeze({ schemaId })
      }));
      index.set(schemaId, chosen);
      continue;
    }
    const uniqueByBytes = new Map(values.map((item) => [item.markdown, item]));
    if (uniqueByBytes.size !== 1) {
      findings.push(Object.freeze({
        severity: 'warning',
        code: 'portable.entry-catalog.schema.carried-ambiguous',
        message: 'Multiple carried schema representations disagree for one schema id; Entry descendant qualification for that schema was withheld.',
        context: Object.freeze({ schemaId, representations: values.length })
      }));
      continue;
    }
    index.set(schemaId, [...uniqueByBytes.values()][0]);
  }
  return index;
}

function schemaRecord({ schemaId = '', markdown = '', sourceKind = '', source = {}, path = '', workspaceId = '' } = {}) {
  let parsed;
  try { parsed = parsePortableSchemaDocument(markdown); } catch { parsed = null; }
  const declared = String(parsed?.schemaId || schemaId || '').trim();
  if (!declared || declared !== String(schemaId || '').trim()) return null;
  return Object.freeze({
    schemaId: declared,
    parentSchemaId: String(parsed?.parentSchemaId || '').trim(),
    markdown,
    sourceKind,
    source: Object.freeze({ ...(source || {}) }),
    path: normalizePath(path),
    workspaceId: String(workspaceId || '').trim()
  });
}

function resolveEntrySchemaContract(schemaId, schemaIndex, cache = new Map()) {
  const requested = String(schemaId || '').trim();
  if (!requested) return null;
  if (cache.has(requested)) return cache.get(requested);
  const visited = new Set();
  const records = [];
  let current = requested;
  let complete = false;
  while (current) {
    if (visited.has(current)) break;
    visited.add(current);
    const record = schemaIndex.get(current);
    if (!record) break;
    records.unshift(record);
    if (current === ROOT_SCHEMA_ID) { complete = true; break; }
    current = String(record.parentSchemaId || '').trim();
  }
  const schemaLineage = records.map((item) => item.schemaId);
  const isEntryFamily = complete && schemaLineage.includes(ENTRY_SCHEMA_ID);
  let contract = null;
  if (isEntryFamily) {
    try {
      const compiled = compilePortableSchemaContractChain(records.map((item) => item.markdown));
      if (compiled?.lineageQualification?.state === 'valid') contract = compiled;
    } catch { contract = null; }
  }
  const resolved = Object.freeze({
    schemaId: requested,
    isEntryFamily: Boolean(isEntryFamily && contract),
    contract,
    schemaLineage: Object.freeze(schemaLineage),
    schemaSource: schemaIndex.get(requested) || null
  });
  cache.set(requested, resolved);
  return resolved;
}

function contentSourceRepresentations(contentSources = [], entrySchemaIds = new Set()) {
  const out = [];
  for (const material of portableContentSourceEntries(contentSources, '.entries')) {
    const artifactPath = normalizePath(material.sourcePath || '');
    if (!eligibleEntryPath(artifactPath)) continue;
    const markdown = decodePortableContentText(material);
    if (!markdown) continue;
    let parsed;
    try { parsed = parseArtifactMarkdown(markdown); } catch { continue; }
    const schemaId = String(parsed?.envelope?.current?.schema?.id || '').trim();
    if (!entrySchemaIds.has(schemaId)) continue;
    out.push(Object.freeze({
      id: `${material.sourceId}::${artifactPath}`,
      sourceKind: 'content-source',
      sourceMode: 'portable-content-source',
      workspaceId: '',
      path: artifactPath,
      markdown,
      schemaId,
      sourceId: material.sourceId,
      sourcePackage: material.sourcePackage,
      lineageRecord: null
    }));
  }
  return out;
}

function carriedRepresentations(inspection = {}, entrySchemaIds = new Set()) {
  const out = [];
  for (const workspace of inspection?.workspaces || []) {
    const workspaceId = String(workspace?.workspaceId || '').trim();
    if (!workspaceId) continue;
    for (const archiveEntry of workspace?.archive?.entries || []) {
      const artifactPath = normalizePath(archiveEntry?.path || '');
      if (!eligibleEntryPath(artifactPath) || !archiveEntry?.data) continue;
      let markdown = '';
      try { markdown = new TextDecoder('utf-8', { fatal: true }).decode(archiveEntry.data); } catch { continue; }
      let parsed;
      try { parsed = parseArtifactMarkdown(markdown); } catch { continue; }
      const schemaId = String(parsed?.envelope?.current?.schema?.id || '').trim();
      if (!entrySchemaIds.has(schemaId)) continue;
      const parent = parsed.envelope?.parent || {};
      const id = `${workspaceId}::${artifactPath}`;
      out.push(Object.freeze({
        id,
        sourceKind: 'carried',
        sourceMode: 'portable-carried-workspace',
        workspaceId,
        path: artifactPath,
        markdown,
        schemaId,
        lineageRecord: Object.freeze({
          id,
          path: artifactPath,
          markdown,
          title: parsed.title || '',
          trace: String(parent.trace || parent.traceRaw || ''),
          origin: String(parent.origin || '')
        })
      }));
    }
  }
  return out;
}

function projectEntry(material, projection, validation, schemaResolution = {}) {
  const identity = ordinaryValues(projection, 'Entry Identity');
  const purpose = ordinaryValues(projection, 'Purpose And Scope');
  const context = ordinaryValues(projection, 'Entry Context');
  const preparation = ordinaryValues(projection, 'Preparation');
  const method = ordinaryValues(projection, 'Entry Method');
  const presentation = ordinaryValues(projection, 'Presentation And Interaction');
  const limits = ordinaryValues(projection, 'Interpretation Limits');
  const portability = ordinaryValues(projection, 'Portability Notes');
  const label = String(identity['Human Label'] || identity.Name || '').trim();
  const rootDeclarations = rootDeclarationGroupNames();
  const declarations = declarationGroups(projection).filter((group) => !rootDeclarations.has(group.group));
  const groundingMaterial = declarations
    .filter((group) => group.group === 'Grounding Material' || group.entries.some((entry) => entry.heading === '## Grounding Material'))
    .flatMap((group) => group.entries)
    .map((entry) => Object.freeze({
      name: entry.name,
      reference: String(entry.fields.Reference || '').trim(),
      purpose: String(entry.fields.Purpose || '').trim(),
      label: String(entry.fields.Label || '').trim(),
      qualificationNotes: String(entry.fields['Qualification Notes'] || '').trim(),
      requiredForEntryGrounding: true
    }));
  return Object.freeze({
    id: material.id,
    schemaId: material.schemaId || ENTRY_SCHEMA_ID,
    entryBaseSchemaId: ENTRY_SCHEMA_ID,
    schemaLineage: Object.freeze([...(schemaResolution.schemaLineage || [])]),
    sourceKind: material.sourceKind,
    sourceMode: material.sourceMode,
    sourceId: String(material.sourceId || ''),
    sourcePackage: Object.freeze({ ...(material.sourcePackage || {}) }),
    workspaceId: material.workspaceId,
    artifactPath: material.path,
    representationQualification: validation,
    readQualified: ACCEPTED_VALIDATION_STATES.has(validation),
    name: String(identity.Name || ''),
    label,
    version: String(identity.Version || ''),
    canonicalIdentifier: String(identity['Canonical Identifier'] || ''),
    entryFamily: String(identity['Entry Family'] || ''),
    summary: String(purpose.Purpose || ''),
    purpose: Object.freeze(purpose),
    context: Object.freeze(context),
    preparation: Object.freeze(preparation),
    method: Object.freeze(method),
    presentation: Object.freeze(presentation),
    interpretationLimits: Object.freeze(limits),
    portability: Object.freeze(portability),
    specializationGroups: Object.freeze(specializationGroups(projection)),
    declarations: Object.freeze(declarations),
    groundingMaterial: Object.freeze(groundingMaterial),
    lineageRecord: material.lineageRecord
  });
}

function ordinaryValues(projection, groupName) {
  const group = (projection.ordinaryGroups || []).find((item) => String(item.group || '') === groupName);
  const out = {};
  for (const field of group?.fields || []) {
    const values = (field.occurrences || []).map((item) => String(item.value || '').trim()).filter(Boolean);
    if (!values.length) continue;
    out[field.label] = values.length === 1 ? values[0] : values;
  }
  return out;
}

function specializationGroups(projection = {}) {
  const groups = [];
  for (const group of projection.ordinaryGroups || []) {
    const name = String(group?.group || '').trim();
    if (!name || BASE_ENTRY_GROUPS.has(name)) continue;
    const fields = {};
    for (const field of group?.fields || []) {
      const values = (field.occurrences || []).map((item) => String(item.value || '').trim()).filter(Boolean);
      if (!values.length) continue;
      fields[String(field.label || '')] = values.length === 1 ? values[0] : values;
    }
    if (Object.keys(fields).length) groups.push(Object.freeze({ group: name, fields: Object.freeze(fields) }));
  }
  return groups;
}

function declarationGroups(projection = {}) {
  const groups = [];
  for (const parsed of projection.validation?.declarations || []) {
    const group = String(parsed?.contract?.group || '').trim();
    if (!group) continue;
    const entries = [];
    for (const section of parsed.sections || []) {
      for (const entry of section.entries || []) {
        if (String(entry.name || '') === 'none') continue;
        entries.push(Object.freeze({
          name: String(entry.name || ''),
          heading: String(section.heading || ''),
          fields: Object.freeze({ ...(entry.fields || {}) })
        }));
      }
    }
    if (entries.length) groups.push(Object.freeze({ group, entries: Object.freeze(entries) }));
  }
  return groups;
}

function rootDeclarationGroupNames() {
  if (cachedRootDeclarationGroups) return cachedRootDeclarationGroups;
  const root = nativeSchemaMarkdown(ROOT_SCHEMA_ID);
  if (!root) return new Set();
  try {
    const contract = compilePortableSchemaContractChain([root]);
    cachedRootDeclarationGroups = new Set((contract.declarations || []).map((item) => String(item.group || '')).filter(Boolean));
  } catch { cachedRootDeclarationGroups = new Set(); }
  return cachedRootDeclarationGroups;
}

function currentLeafKeys(entries) {
  const byWorkspace = new Map();
  for (const entry of entries) {
    if (entry.sourceKind !== 'carried' || !entry.lineageRecord) continue;
    if (!byWorkspace.has(entry.workspaceId)) byWorkspace.set(entry.workspaceId, []);
    byWorkspace.get(entry.workspaceId).push(entry);
  }
  const leaves = new Set();
  for (const group of byWorkspace.values()) {
    const records = group.map((entry) => entry.lineageRecord);
    const lineage = resolveLineage(records, { depth: 'loaded-workspace' });
    const nodeIds = new Set((lineage.nodes || []).map((node) => String(node.id || '')));
    const parentsWithChildren = new Set(
      (lineage.edges || [])
        .filter((edge) => edge.kind === 'parent' && edge.status !== 'missing' && nodeIds.has(String(edge.from || '')) && nodeIds.has(String(edge.to || '')))
        .map((edge) => String(edge.from || ''))
    );
    for (const node of lineage.nodes || []) {
      if (parentsWithChildren.has(String(node.id || ''))) continue;
      const path = normalizePath(node.path || node.id || '');
      const entry = group.find((candidate) => normalizePath(candidate.artifactPath) === path || candidate.id === String(node.id || ''));
      if (entry) leaves.add(entry.id);
    }
  }
  return leaves;
}

function eligibleEntryPath(value = '') {
  const path = normalizePath(value);
  if (!path || !/\.md$/i.test(path) || /\.schema\.md$/i.test(path)) return false;
  return !path.split('/').filter(Boolean).includes('.schemas');
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
