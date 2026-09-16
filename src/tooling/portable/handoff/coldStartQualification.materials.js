import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { portableFinding } from '../findings.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { recipientV2FactsIndex } from './recipientV2.transportManifest.js';
import { deriveRecipientV2ArtifactFirstPhase1Facts } from './recipientV2.artifactFirst.materials.js';
import { parseNamedDeclarationSection } from '../schema/named.declarations.js';
import { resolveColdStartRolePointerMaterial } from './coldStartRolePointers.js';
import {
  decodeUtf8,
  deepFreeze,
  findFile,
  normalizePath,
  sectionField,
  sectionReferenceTarget,
  sectionText
} from './coldStartQualification.shared.js';


export function createColdStartMaterialContext() {
  return {
    workspaceArchives: new WeakMap(),
    recipientFacts: new WeakMap()
  };
}

export function recipientFactsIndexForColdStart(bundle = {}, context = null) {
  if (!context?.recipientFacts || !bundle || typeof bundle !== 'object') return recipientV2FactsIndex(bundle);
  const cached = context.recipientFacts.get(bundle);
  if (cached) return cached;
  const derived = recipientV2FactsIndex(bundle);
  context.recipientFacts.set(bundle, derived);
  return derived;
}

function inspectWorkspaceArchiveForColdStart(file, context = null) {
  if (!file) return null;
  if (!context?.workspaceArchives || typeof file !== 'object') {
    return inspectStoredWorkspaceArchive(packageFileBytes(file), { ownedBytes: true });
  }
  const cached = context.workspaceArchives.get(file);
  if (cached) return cached;
  const inspected = inspectStoredWorkspaceArchive(packageFileBytes(file), { ownedBytes: true });
  context.workspaceArchives.set(file, inspected);
  return inspected;
}

export function collectPackageRoleMaterials(bundle = {}) {
  if (!Array.isArray(bundle?.files)) return [];
  const out = [];
  for (const file of bundle.files) {
    const path = String(file.path || '');
    if (!/\.trace\.md$/i.test(path) || /\.schema\.md$/i.test(path) || path.startsWith('tiinex.package/') || path.startsWith('tiinex.bootstrap/')) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    if (!/Current Schema:\s*(?:\[)?tiinex\.party\.role\.v1\b/i.test(markdown)) continue;
    out.push(Object.freeze({ path, markdown, explicit: false }));
  }
  return out;
}

export function resolveReferencedRoleMaterial(bundle = {}, handoff = {}, orientation = null, selectedRoute = null, findings = [], context = null) {
  return resolveReferencedEndpointRoleMaterial(bundle, handoff, orientation, selectedRoute, findings, context, 'to');
}

export function resolveReferencedEndpointRoleMaterial(bundle = {}, handoff = {}, orientation = null, selectedRoute = null, findings = [], context = null, endpointParty = 'to') {
  const party = String(endpointParty || 'to').trim().toLowerCase() === 'from' ? 'from' : 'to';
  const reference = String(party === 'from' ? handoff.fromReference : handoff.toReference || '').trim();
  if (!reference) return null;
  if (!isExternalReference(reference)) {
    const workspaceZip = findFile(bundle, String(handoff.packagePath || ''));
    if (workspaceZip && /\.zip$/i.test(String(workspaceZip.path || ''))) {
      const archive = inspectWorkspaceArchiveForColdStart(workspaceZip, context);
      if (archive.state === 'qualified') {
        const resolvedPath = resolveRelativeArtifactPath(handoff.workspaceRelativePath || '', reference);
        const matches = resolvedPath ? (archive.entries || []).filter((entry) => normalizePath(entry.path || '') === resolvedPath) : [];
        if (matches.length === 1) {
          const markdown = decodeUtf8(matches[0].data || new Uint8Array());
          if (markdown) return Object.freeze({ path: `${workspaceZip.path}::${resolvedPath}`, markdown, explicit: false, exactReference: reference });
        }
        if (matches.length > 1) findings.push(portableFinding('error', 'portable.cold-start.role.reference-material.ambiguous', 'Handoff endpoint Reference resolves to multiple entries in the selected Workspace archive.', { reference, resolvedPath }));
      }
    }
  }
  const endpointPointerMatches = [];
  const factsIndex = recipientFactsIndexForColdStart(bundle, context).map;
  for (const pointerPath of selectedRoute?.endpointRolePointers || []) {
    const compatibilityFacts = factsIndex.get(String(pointerPath || '')) || null;
    const projectedFacts = (orientation?.endpointRoles || []).find((item) => String(item.pointerPath || '') === String(pointerPath || '')) || null;
    const facts = compatibilityFacts?.role === 'endpoint-role'
      ? compatibilityFacts
      : projectedFacts
        ? { role: 'endpoint-role', ...projectedFacts }
        : {};
    if (facts.role !== 'endpoint-role' || String(facts.endpointParty || '').toLowerCase() !== party) continue;
    if (facts.referenceTarget && String(facts.referenceTarget) !== reference) continue;
    const material = resolveColdStartRolePointerMaterial(bundle, facts, findings, String(pointerPath || ''), 'endpoint-role');
    if (material) endpointPointerMatches.push(Object.freeze({ ...material, exactReference: reference }));
  }
  if (endpointPointerMatches.length === 1) return endpointPointerMatches[0];
  if (endpointPointerMatches.length > 1) {
    findings.push(portableFinding('error', 'portable.cold-start.role.reference-material.ambiguous', 'Handoff endpoint Reference resolves through multiple qualified endpoint Role Pointers.', { reference, count: endpointPointerMatches.length }));
    return null;
  }
  const cacheMatches = [];
  for (const file of bundle.files || []) {
    if (!/\.trace\.md$/i.test(String(file.path || ''))) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    const facts = factsIndex.get(String(file.path || '')) || null;
    if (facts?.role !== 'workspace-dependency-cache' && !/dependency cache/i.test(String(facts?.role || ''))) continue;
    for (const material of facts.materials || []) {
      if (String(material.referenceTarget || '') !== reference) continue;
      const archiveFile = findFile(bundle, String(facts.archivePath || ''));
      if (!archiveFile) continue;
      const archive = inspectWorkspaceArchiveForColdStart(archiveFile, context);
      if (archive.state !== 'qualified') continue;
      const entries = (archive.entries || []).filter((entry) => String(entry.path || '') === String(material.archiveEntry || ''));
      if (entries.length !== 1) continue;
      const roleMarkdown = decodeUtf8(entries[0].data || new Uint8Array());
      if (roleMarkdown) cacheMatches.push(Object.freeze({ path: `${archiveFile.path}::${material.archiveEntry}`, markdown: roleMarkdown, explicit: false, exactReference: reference }));
    }
  }
  if (cacheMatches.length === 1) return cacheMatches[0];
  if (cacheMatches.length > 1) findings.push(portableFinding('error', 'portable.cold-start.role.reference-material.ambiguous', 'Handoff endpoint Reference resolves to multiple cached exact byte carriers.', { reference, count: cacheMatches.length }));
  return null;
}

function resolveRelativeArtifactPath(basePath = '', reference = '') {
  const target = String(reference || '').split('#')[0].trim().replace(/\\/g, '/');
  if (!target || target.startsWith('/') || isExternalReference(target)) return '';
  const base = normalizePath(basePath).split('/'); base.pop();
  for (const part of target.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); }
    else base.push(part);
  }
  return normalizePath(base.join('/'));
}

function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:\/\//i.test(String(value || '').trim()); }

export function normalizeRoleMaterials(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.flatMap((item, index) => {
    if (typeof item === 'string') return [Object.freeze({ path: `explicit-role-${index + 1}.trace.md`, markdown: item, explicit: true })];
    const markdown = String(item?.markdown || item?.content || '');
    if (!markdown) return [];
    return [Object.freeze({ path: String(item.path || `explicit-role-${index + 1}.trace.md`), markdown, explicit: true })];
  });
}

export function dedupeRoleMaterials(entries) {
  const map = new Map();
  for (const entry of entries) {
    const markdown = String(entry.markdown || '');
    const key = `${entry.path}\u0000${markdown}`;
    if (!map.has(key)) map.set(key, entry);
  }
  return [...map.values()];
}

export function parseRoleMaterial(entry) {
  try {
    const parsed = parseArtifactMarkdown(entry.markdown || '');
    const schemaId = String(parsed.envelope?.current?.schema?.id || '');
    if (schemaId !== 'tiinex.party.role.v1') return null;
    const roleSection = sectionText(parsed.body?.text || '', 'Role Identity');
    const boundarySection = sectionText(parsed.body?.text || '', 'Role Boundary');
    const authoritySection = sectionText(parsed.body?.text || '', 'Authority And Responsibility Boundary');
    const holderSection = sectionText(parsed.body?.text || '', 'Holder Relationship');
    const limitsSection = sectionText(parsed.body?.text || '', 'Interpretation Limits');
    const label = sectionField(roleSection, 'Role Label');
    return deepFreeze({
      path: entry.path,
      explicit: Boolean(entry.explicit),
      sha256: sha256Hex(new TextEncoder().encode(entry.markdown || '')),
      schemaId,
      title: parsed.title || '',
      label,
      roleKind: sectionField(roleSection, 'Role Kind'),
      boundary: Object.freeze({ inScope: sectionField(boundarySection, 'In Scope'), outOfScope: sectionField(boundarySection, 'Out Of Scope'), context: sectionField(boundarySection, 'Context') }),
      authorityBoundary: Object.freeze({
        mayDo: sectionField(authoritySection, 'May Do'),
        doesNotAuthorize: sectionField(authoritySection, 'Does Not Authorize'),
        requiredInstrument: sectionField(authoritySection, 'Required Instrument'),
        delegation: sectionField(authoritySection, 'Delegation'),
        reviewBoundary: sectionField(authoritySection, 'Review Boundary')
      }),
      holderRelationship: Object.freeze({
        holderState: sectionField(holderSection, 'Holder State'),
        assignmentModes: sectionField(holderSection, 'Assignment Modes'),
        currentHolder: sectionField(holderSection, 'Current Holder'),
        possibleHolder: sectionField(holderSection, 'Possible Holder'),
        unknownHolder: sectionField(holderSection, 'Unknown Holder'),
        relationArtifact: sectionReferenceTarget(holderSection, 'Relation Artifact')
      }),
      interpretationLimits: Object.freeze({ doesNotProve: sectionField(limitsSection, 'Does Not Prove'), mustNotBeTreatedAs: sectionField(limitsSection, 'Must Not Be Treated As') }),
      parentTrace: String(parsed.envelope?.parent?.trace || ''),
      parentSchemaId: String(parsed.envelope?.parent?.schema?.id || '')
    });
  } catch {
    return null;
  }
}

export function projectGroundedContinuation({ bundle = {}, route = '', grounding = {}, qualification = {}, packageSourcePath = '' } = {}, context = null) {
  const selectedRouteId = String(grounding.selectedRoute?.id || '');
  const requiredContext = Object.freeze((grounding.selectedRoute?.requiredClosure?.requirements || []).map((entry) => hydrateRequiredContextEntry(bundle, entry, context)));
  const unresolvedRequired = requiredContext.filter((entry) => entry.state !== 'qualified');
  const groundingBlocked = String(grounding.status || '') === 'blocked';
  const continuationReady = Boolean(selectedRouteId) && !groundingBlocked && unresolvedRequired.length === 0;
  return deepFreeze({
    state: continuationReady ? 'ready' : 'blocked',
    substantiveWorkMayBegin: continuationReady,
    qualificationState: String(qualification.status || ''),
    selectedRoute: Object.freeze({
      id: selectedRouteId,
      selector: String(route || ''),
      workspaceId: String(grounding.selectedRoute?.workspaceId || ''),
      pointerPath: String(grounding.selectedRoute?.pointerPath || '')
    }),
    transfer: Object.freeze([...(grounding.handoff?.transfers || [])]),
    requiredContext,
    completionExpectation: grounding.handoff?.completionExpectation || Object.freeze({ signalKind: '', signalMeaning: '', returnTo: '' }),
    returnPackage: projectReturnPackageContinuation(grounding, packageSourcePath),
    next: continuationReady
      ? 'Consume the qualified Required Context projection below, then continue substantive work within the grounded Handoff and Role boundaries. No Tooling API discovery is required.'
      : 'Do not begin substantive work until the selected Handoff and every Required Context dependency are qualified.',
    boundary: 'Grounded continuation projection only. Handoff Transfers and Completion Expectation come from exact selected Handoff bytes; Required Context comes from exact route closure and is not inferred from nearby Workspace material.'
  });
}

function projectReturnPackageContinuation(grounding = {}, packageSourcePath = '') {
  const lineage = grounding.orientation?.carrierLineage || {};
  const dimension = String(lineage.dimension || '').trim();
  const expectedChild = dimension ? `${dimension}-1` : '';
  const returnTo = String(grounding.handoff?.completionExpectation?.returnTo || '').trim();
  return Object.freeze({
    expected: Boolean(returnTo),
    returnTo,
    parentDimension: dimension,
    defaultMode: 'continue',
    defaultNextDimension: expectedChild,
    parentPackagePath: String(packageSourcePath || ''),
    manufactureRule: packageSourcePath
      ? `When manufacturing a return Handoff package derived from this carrier, pass --package-parent ${String(packageSourcePath)}. Tooling owns the next child dimension. Use --package-major --major-reason <milestone> only at an explicit self-contained checkpoint.`
      : 'When manufacturing a return Handoff package, pass the received carrier as --package-parent. Tooling owns the next child dimension. Use --package-major --major-reason <milestone> only at an explicit self-contained checkpoint.',
    boundary: 'Return carrier lineage is a human progress/retention projection only. The default is child continuation; major advancement is explicit and requires complete carried Workspace snapshots plus a meaningful closure reason.'
  });
}

function hydrateRequiredContextEntry(bundle = {}, entry = {}, context = null) {
  const resolution = entry.resolution || {};
  const base = {
    requirementId: String(entry.requirementId || ''),
    name: String(entry.name || ''),
    material: String(entry.material || ''),
    purpose: String(entry.purpose || ''),
    declaredAvailability: String(entry.declaredAvailability || ''),
    state: String(entry.state || resolution.state || 'unresolved'),
    referenceTarget: String(entry.referenceTarget || ''),
    kind: String(resolution.kind || ''),
    workspaceId: String(resolution.workspaceId || ''),
    archivePackagePath: String(resolution.archivePackagePath || resolution.packagePath || ''),
    innerPath: String(resolution.innerPath || resolution.workspaceRelativePath || ''),
    packagePath: String(resolution.packagePath || ''),
    providerMode: String(resolution.providerMode || ''),
    bytes: Number(resolution.bytes || 0),
    sha256: String(resolution.sha256 || ''),
    provenance: Object.freeze({
      basis: 'selected-handoff-required-context-declaration',
      declarationSource: entry.declarationSource ? Object.freeze({ ...(entry.declarationSource || {}) }) : null,
      resolutionKind: String(resolution.kind || ''),
      providerMode: String(resolution.providerMode || ''),
      boundary: 'Material/Purpose/Availability are copied from the exact selected Handoff Required Context declaration; qualification and bytes come from exact route closure resolution.'
    })
  };
  if (base.state !== 'qualified') return Object.freeze({ ...base, contentState: 'unavailable', content: '' });
  const hydrated = resolveQualifiedMaterialBytes(bundle, resolution, context, base);
  if (!hydrated.bytes) return Object.freeze({ ...base, state: 'unresolved', contentState: 'unavailable', content: '' });
  const actualSha256 = sha256Hex(hydrated.bytes);
  const identityQualified = (!base.bytes || hydrated.bytes.byteLength === base.bytes) && (!base.sha256 || actualSha256 === base.sha256);
  const text = identityQualified && hydrated.bytes.byteLength <= 65536 ? decodeUtf8(hydrated.bytes) : '';
  return Object.freeze({
    ...base,
    state: identityQualified ? 'qualified' : 'identity-mismatch',
    workspaceId: String(hydrated.workspaceId || base.workspaceId || ''),
    archivePackagePath: String(hydrated.archivePackagePath || base.archivePackagePath || ''),
    innerPath: String(hydrated.innerPath || base.innerPath || ''),
    packagePath: String(hydrated.packagePath || base.packagePath || ''),
    providerMode: String(hydrated.providerMode || base.providerMode || ''),
    kind: String(hydrated.kind || base.kind || ''),
    actualBytes: hydrated.bytes.byteLength,
    actualSha256,
    provenance: Object.freeze({ ...(base.provenance || {}), providerMode: String(hydrated.providerMode || base.providerMode || ''), resolutionKind: String(hydrated.kind || base.kind || '') }),
    contentState: text ? 'hydrated-text' : identityQualified ? 'qualified-locator-only' : 'unavailable',
    content: text
  });
}

function resolveQualifiedMaterialBytes(bundle = {}, resolution = {}, context = null, requirement = {}) {
  const kind = String(resolution.kind || '');
  if (kind === 'workspace-archive-entry' || kind === 'workspace-cache-entry') {
    const archivePath = String(resolution.archivePackagePath || resolution.packagePath || '');
    const innerPath = normalizePath(kind === 'workspace-cache-entry'
      ? (resolution.archiveEntry || resolution.innerPath || '')
      : (resolution.innerPath || resolution.workspaceRelativePath || ''));
    const archiveFile = findFile(bundle, archivePath);
    if (!archiveFile || !innerPath) return Object.freeze({ bytes: null });
    const archive = inspectWorkspaceArchiveForColdStart(archiveFile, context);
    if (archive.state !== 'qualified') return Object.freeze({ bytes: null });
    const matches = (archive.entries || []).filter((candidate) => normalizePath(candidate.path || '') === innerPath);
    return Object.freeze({ bytes: matches.length === 1 ? packageFileBytes({ data: matches[0].data }) : null });
  }
  const packagePath = String(resolution.packagePath || '');
  const file = packagePath ? findFile(bundle, packagePath) : null;
  if (file) return Object.freeze({ bytes: packageFileBytes(file), packagePath });
  if (kind === 'materialized-required-material') {
    const requirementId = String(requirement.requirementId || '');
    const referenceTarget = String(requirement.referenceTarget || '');
    const matches = [];
    const factsIndex = recipientFactsIndexForColdStart(bundle, context).map;
    const visibleFactsIndex = deriveRecipientV2ArtifactFirstPhase1Facts(bundle.files || []);
    for (const candidateFile of bundle.files || []) {
      const candidatePath = String(candidateFile.path || '');
      const facts = factsIndex.get(candidatePath) || visibleFactsIndex.get(candidatePath) || null;
      if (facts?.role !== 'workspace-dependency-cache' && !/dependency cache/i.test(String(facts?.role || ''))) continue;
      for (const material of facts.materials || []) {
        if (requirementId && String(material.requirementId || '') !== requirementId) continue;
        if (referenceTarget && String(material.referenceTarget || '') !== referenceTarget) continue;
        const archivePath = String(facts.archivePath || '');
        const archiveFile = findFile(bundle, archivePath);
        if (!archiveFile) continue;
        const archive = inspectWorkspaceArchiveForColdStart(archiveFile, context);
        if (archive.state !== 'qualified') continue;
        const entries = (archive.entries || []).filter((entry) => String(entry.path || '') === String(material.archiveEntry || ''));
        if (entries.length !== 1) continue;
        const entry = entries[0];
        const data = packageFileBytes({ data: entry.data });
        const actualSha = sha256Hex(data);
        if (Number(material.bytes || 0) && Number(material.bytes || 0) !== data.byteLength) continue;
        if (String(material.sha256 || '') && String(material.sha256 || '') !== actualSha) continue;
        if (Number(resolution.bytes || 0) && Number(resolution.bytes || 0) !== data.byteLength) continue;
        if (String(resolution.sha256 || '') && String(resolution.sha256 || '') !== actualSha) continue;
        matches.push(Object.freeze({
          bytes: data, providerMode: 'cache', kind: 'workspace-cache-entry',
          workspaceId: String(material.targetWorkspaceId || material.sourceWorkspaceId || facts.workspaceId || ''),
          innerPath: String(material.targetPath || material.originalPath || ''),
          archivePackagePath: archivePath, packagePath: archivePath
        }));
      }
    }
    if (matches.length === 1) return matches[0];
  }
  return Object.freeze({ bytes: null });
}

export function parseHandoffGrounding(markdown, route) {
  const parties = sectionText(markdown, 'Handoff Parties');
  const transferSection = parseNamedDeclarationSection(markdown, '## Transfers');
  const retainedSection = parseNamedDeclarationSection(markdown, '## Retained Responsibilities');
  const completion = sectionText(markdown, 'Completion Expectation');
  const transfers = Object.freeze((transferSection.entries || []).filter((entry) => String(entry.name || '').trim().toLowerCase() !== 'none').map((entry) => Object.freeze({
    id: String(entry.name || ''),
    transferKind: String(entry.fields?.['Transfer Kind'] || ''),
    description: String(entry.fields?.Description || ''),
    controllingArtifact: String(entry.fields?.['Controlling Artifact'] || ''),
    controllingArtifactTarget: markdownReferenceTarget(entry.fields?.['Controlling Artifact'] || ''),
    boundary: String(entry.fields?.Boundary || '')
  })));
  const retainedResponsibilities = Object.freeze((retainedSection.entries || []).filter((entry) => String(entry.name || '').trim().toLowerCase() !== 'none').map((entry) => Object.freeze({
    id: String(entry.name || ''),
    retainedBy: String(entry.fields?.['Retained By'] || ''),
    responsibility: String(entry.fields?.Responsibility || ''),
    boundary: String(entry.fields?.Boundary || '')
  })));
  return deepFreeze({
    schemaId: /Current Schema:\s*(?:\[)?tiinex\.handoff\.v1\b/i.test(markdown) ? 'tiinex.handoff.v1' : '',
    purpose: sectionField(parties, 'Purpose'),
    from: sectionField(parties, 'From'),
    fromKind: sectionField(parties, 'From Kind'),
    to: sectionField(parties, 'To'),
    toKind: sectionField(parties, 'To Kind'),
    fromReference: sectionReferenceTarget(parties, 'From Reference'),
    toReference: sectionReferenceTarget(parties, 'To Reference'),
    transfers,
    retainedResponsibilities,
    completionExpectation: Object.freeze({
      signalKind: sectionField(completion, 'Signal Kind'),
      signalMeaning: sectionField(completion, 'Signal Meaning'),
      returnTo: sectionField(completion, 'Return To')
    }),
    routeId: String(route?.id || ''),
    workspaceId: String(route?.workspaceId || ''),
    workspaceRelativePath: String(route?.workspaceRelativeHandoffPath || route?.workspaceRelativePath || ''),
    packagePath: String(route?.packagePath || ''),
    sha256: String(route?.sha256 || ''),
    boundary: 'Exact Handoff parties/purpose/work-transfer/completion expectation read from selected qualified Handoff bytes; transport route labels are not substituted for artifact semantics.'
  });
}

function markdownReferenceTarget(value = '') {
  const text = String(value || '').trim();
  const match = text.match(/\[[^\]]*\]\(([^)]+)\)/);
  return match ? String(match[1] || '').trim() : '';
}

export function emptyHandoffGrounding() {
  return deepFreeze({ schemaId: '', purpose: '', from: '', fromKind: '', fromReference: '', to: '', toKind: '', toReference: '', transfers: Object.freeze([]), retainedResponsibilities: Object.freeze([]), completionExpectation: Object.freeze({ signalKind: '', signalMeaning: '', returnTo: '' }), routeId: '', workspaceId: '', workspaceRelativePath: '', packagePath: '', sha256: '', boundary: 'No Handoff material supplied.' });
}

export function resolveGroundingRouteMarkdown(bundle = {}, selectedRoute = {}, findings = [], context = null) {
  const packagePath = String(selectedRoute.packagePath || '');
  const routeFile = findFile(bundle, packagePath);
  if (!routeFile) {
    findings.push(portableFinding('error', 'portable.cold-start.handoff.route-carrier.missing', 'Selected Handoff route carrier is missing from the received package.'));
    return '';
  }
  const workspaceRelativePath = normalizePath(selectedRoute.workspaceRelativeHandoffPath || selectedRoute.workspaceRelativePath || '');
  if (/\.zip$/i.test(packagePath) && workspaceRelativePath) {
    const archive = inspectWorkspaceArchiveForColdStart(routeFile, context);
    if (archive.state !== 'qualified') {
      findings.push(portableFinding('error', 'portable.cold-start.handoff.route-workspace-archive.invalid', 'Selected recipient-v2 Workspace archive carrier is not a qualified readable ZIP.'));
      return '';
    }
    const matches = (archive.entries || []).filter((entry) => normalizePath(entry.path || '') === workspaceRelativePath);
    if (matches.length !== 1) {
      findings.push(portableFinding('error', 'portable.cold-start.handoff.route-entry.unresolved', 'Selected recipient-v2 Handoff path does not resolve to exactly one entry inside the qualified Workspace archive.'));
      return '';
    }
    const entry = matches[0];
    const expectedSha256 = String(selectedRoute.sha256 || '').trim();
    const observedSha256 = String(entry.sha256 || sha256Hex(entry.data || new Uint8Array())).trim();
    if (expectedSha256 && expectedSha256 !== observedSha256) {
      findings.push(portableFinding('error', 'portable.cold-start.handoff.route-bytes.integrity-mismatch', 'Selected recipient-v2 Handoff archive entry bytes do not match the qualified route digest.'));
      return '';
    }
    const markdown = decodeUtf8(entry.data || new Uint8Array());
    if (!markdown) findings.push(portableFinding('error', 'portable.cold-start.handoff.route-bytes.unreadable', 'Selected recipient-v2 Handoff archive entry is not readable UTF-8 Markdown.'));
    return markdown;
  }
  const markdown = decodeUtf8(packageFileBytes(routeFile));
  if (!markdown) findings.push(portableFinding('error', 'portable.cold-start.handoff.route-bytes.unreadable', 'Selected Handoff route bytes are missing or unreadable.'));
  return markdown;
}

export function selectGroundingRoute(orientation = {}, selector = '') {
  const routes = (orientation.routes || []).filter((route) => route.state === 'qualified');
  const requested = String(selector || '').trim();
  if (!requested) {
    if (routes.length === 1) return Object.freeze({ state: 'qualified', route: routes[0] });
    return Object.freeze({ state: routes.length > 1 ? 'selection-required' : 'unresolved', route: null });
  }
  const normalized = normalizePath(requested);
  const matches = routes.filter((route) => route.id === requested || normalizePath(route.pointerPath || '') === normalized || normalizePath(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || '') === normalized || `${route.workspaceId}:${normalizePath(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || '')}` === requested);
  return Object.freeze({ state: matches.length === 1 ? 'qualified' : matches.length > 1 ? 'ambiguous' : 'unresolved', route: matches.length === 1 ? matches[0] : null });
}
