import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { projectPortableEntryCatalog } from '../entry/entry.catalog.js';
import { projectHandoffHumanOutput } from './carrierProjection.js';

export const WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID = 'tiinex.portable.workspace-entry-projection.v1';

const CUSTOM_ENTRY = Object.freeze({
  id: 'CUSTOM',
  label: 'Custom',
  requiresInstruction: true,
  summary: 'Use an operator-provided session instruction as the requested starting intent.',
  sourceKind: 'runtime'
});

const NO_TARGET_OPTION = Object.freeze({
  id: 'NONE',
  label: 'Generic / no target',
  targetKind: 'none',
  sourceKind: 'runtime',
  summary: 'Apply no environment-specific Target Entry augmentation.'
});

const POINTERLESS_CANONICAL_SHELL = (startPath) => `Handoff package attached.\n\nCold start: read Start directly; follow only its qualified bootstrap extraction instruction.\nStart: ${startPath}\n\nPointerless Workspace carrier: after bootstrap, orient/project the package. No Handoff route, recipient, or work transfer is declared or implied.`;

export function projectWorkspaceCarrierEntry(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  if (inspection.status !== 'valid') return blocked('carrier-invalid', inspection.findings || []);
  const projection = inspection.carrierProjection || {};
  const qualifiedRoutes = (projection.routes || []).filter((route) => String(route?.state || '') === 'qualified');
  const pointerlessWorkspace = projection.mode === 'workspace' && qualifiedRoutes.length === 0;
  const routedHandoff = projection.mode === 'handoff' && qualifiedRoutes.length > 0;
  if (!pointerlessWorkspace && !routedHandoff) return blocked('workspace-or-routed-handoff-carrier-required', inspection.findings || []);

  const entryCatalog = projectPortableEntryCatalog({ inspection, contentSources: input.contentSources || input.sources || [] });
  if (entryCatalog.status !== 'ready') return blocked(entryCatalog.reasonCode || 'entry-catalog-unavailable', [...(inspection.findings || []), ...(entryCatalog.findings || [])]);
  const purposeEntries = Object.freeze((entryCatalog.entries || []).filter((entry) => String(entry.entryKind || 'purpose') !== 'target'));
  const targetEntries = Object.freeze((entryCatalog.entries || []).filter((entry) => String(entry.entryKind || '') === 'target'));
  const modes = Object.freeze([
    ...purposeEntries.map(entryChoice),
    CUSTOM_ENTRY
  ]);
  const targetCatalog = Object.freeze([NO_TARGET_OPTION, ...targetEntries.map(targetChoice)]);

  const requested = String(input.entryId || input.entry || input.mode || '').trim();
  if (!requested) return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'ready',
    state: 'catalog',
    carrierKind: pointerlessWorkspace ? 'pointerless-workspace' : 'routed-handoff',
    modes,
    targets: targetCatalog,
    targetOptional: true,
    entries: Object.freeze(entryCatalog.entries || []),
    purposeEntries,
    targetEntries,
    routes: Object.freeze(qualifiedRoutes.map((route) => Object.freeze({
      routeId: String(route.id || route.routeId || ''),
      pointerPath: String(route.pointerPath || ''),
      workspaceId: String(route.workspaceId || ''),
      handoffPath: String(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || ''),
      from: String(route.from || route.parties?.from || ''),
      to: String(route.to || route.parties?.to || '')
    }))),
    startPath: String(projection.startPath || '001-1-READ-BEFORE-PROCEEDING.trace.md'),
    boundary: pointerlessWorkspace
      ? 'Guided Entry exposes qualified reusable Entry definitions plus an explicit Custom runtime path. Entry selection describes recipient-session intent for a pointerless Workspace carrier; it does not alter the carrier or establish Handoff routing, recipient authority, Role-holder state, participant authority, acceptance, work transfer, or completion.'
      : 'Guided Entry exposes qualified reusable Entry definitions above an already-qualified routed Handoff carrier. Entry selection does not choose or alter Handoff authority: exact route selection remains qualified from the carried Handoff Pointer, and Entry/Role/participant/session choices cannot manufacture routing, recipient authority, acceptance, work transfer, or completion.'
  });

  const customRequested = requested.toLocaleUpperCase() === 'CUSTOM';
  const definition = customRequested ? CUSTOM_ENTRY : resolveRequestedEntry(purposeEntries, requested);
  if (!definition) return blocked('entry-mode-invalid', inspection.findings || [], modes);

  const customInstruction = normalizeInstruction(input.customInstruction || input.instruction || '');
  if (customRequested && !customInstruction) return blocked('custom-instruction-required', inspection.findings || [], modes, targetCatalog);
  if (!customRequested && customInstruction) return blocked('custom-instruction-unexpected', inspection.findings || [], modes, targetCatalog);

  const compatibleTargets = compatibleTargetEntries(targetEntries, customRequested ? null : definition);
  const targetOptions = Object.freeze([NO_TARGET_OPTION, ...compatibleTargets.map(targetChoice)]);
  const requestedTarget = String(input.targetEntryId || input.targetEntry || input.target || input.where || '').trim();
  let targetDefinition = null;
  if (requestedTarget && requestedTarget.toLocaleUpperCase() !== 'NONE') {
    targetDefinition = resolveRequestedEntry(targetEntries, requestedTarget);
    if (!targetDefinition) return blocked('target-entry-invalid', inspection.findings || [], modes, targetOptions);
    if (!compatibleTargets.some((entry) => entry.id === targetDefinition.id)) return blocked('target-entry-incompatible', inspection.findings || [], modes, targetOptions);
  }

  const primaryRole = normalizeSessionIdentity(input.primaryRole || input.role || null);
  let participants;
  try { participants = normalizeParticipants(input.participants || []); }
  catch { return blocked('participant-duplicate', inspection.findings || [], modes, targetOptions); }
  if (primaryRole && participants.some((item) => sameIdentity(item, primaryRole))) return blocked('primary-role-duplicate-participant', inspection.findings || [], modes, targetOptions);

  const bundle = input.bundle || input.package || null;
  const resolvedPrimaryRole = primaryRole ? resolveSessionRoleReference(primaryRole, inspection, bundle) : null;
  if (primaryRole && !resolvedPrimaryRole) return blocked('session-role-material-unresolved', inspection.findings || [], modes, targetOptions);
  const resolvedParticipants = participants.map((participant) => resolveSessionRoleReference(participant, inspection, bundle));
  if (resolvedParticipants.some((item) => !item)) return blocked('participant-role-material-unresolved', inspection.findings || [], modes, targetOptions);

  const startPath = String(projection.startPath || '001-1-READ-BEFORE-PROCEEDING.trace.md');
  let routeId = '';
  let continueFrom = '';
  let shell = POINTERLESS_CANONICAL_SHELL(startPath);
  if (routedHandoff) {
    const routeSelector = String(input.route || input.routeId || input.pointer || '').trim();
    const routed = projectHandoffHumanOutput({ projection, route: routeSelector });
    if (routed.status === 'selection-required') return blocked('handoff-route-required', inspection.findings || [], modes, targetOptions);
    if (routed.status !== 'ready' || !routed.normalInlineRouting?.content || !routed.selectedRoute) return blocked(`handoff-route-${routed.status || 'unavailable'}`, inspection.findings || [], modes, targetOptions);
    routeId = String(routed.selectedRoute.id || routed.normalInlineRouting.routeId || '');
    continueFrom = String(routed.normalInlineRouting.continueFrom || qualifiedRoutes.find((route) => String(route.id || route.routeId || '') === routeId)?.pointerPath || '');
    shell = String(routed.normalInlineRouting.content || '').trimEnd();
  }
  const lines = [shell, ''];
  if (customRequested) {
    lines.push('Entry intent: Custom', '', 'After bootstrap, treat the following operator instruction as session intent. Ground it against the available qualified Workspace material before acting.', '', 'Operator instruction:', customInstruction);
  } else {
    lines.push(`Entry intent: ${definition.label}`, '', ...entryGuidanceLines(definition));
  }
  if (targetDefinition) lines.push('', `Target intent: ${targetDefinition.label}`, '', ...targetGuidanceLines(targetDefinition));
  else lines.push('', 'Target intent: Generic / no target');
  if (resolvedPrimaryRole || resolvedParticipants.length) {
    lines.push('', 'Session context (conversation context only; not package/transfer authority):');
    if (resolvedPrimaryRole) lines.push(`Session Role: ${resolvedPrimaryRole.label} — material ${resolvedPrimaryRole.materialDescription}`);
    for (const participant of resolvedParticipants) lines.push(`Participant: ${participant.label} — material ${participant.materialDescription}`);
    lines.push('Session selections do not establish semantic holder/participant/recipient authority, acceptance, or work transfer.');
  }
  return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'ready',
    state: 'rendered',
    mode: customRequested ? 'CUSTOM' : definition.id,
    entryId: customRequested ? '' : definition.id,
    modeDefinition: customRequested ? CUSTOM_ENTRY : entryChoice(definition),
    entryDefinition: customRequested ? null : definition,
    targetEntryId: targetDefinition ? targetDefinition.id : '',
    targetDefinition,
    targetOption: targetDefinition ? targetChoice(targetDefinition) : NO_TARGET_OPTION,
    targetOptions,
    targetOptional: true,
    carrierKind: pointerlessWorkspace ? 'pointerless-workspace' : 'routed-handoff',
    startPath,
    routeId,
    continueFrom,
    primaryRole: resolvedPrimaryRole ? { label: resolvedPrimaryRole.label, reference: resolvedPrimaryRole.reference } : null,
    participants: Object.freeze(resolvedParticipants.map((item) => ({ label: item.label, reference: item.reference }))),
    transportText: `${lines.join('\n')}\n`,
    boundary: pointerlessWorkspace
      ? 'Guided Entry is a transport/invocation projection over an unchanged pointerless Workspace carrier. Entry, Target Entry, Role, participant, and operator-instruction selection do not mutate the carrier or its semantic lineage and do not independently create authority, routing, acceptance, continuation, work transfer, or completion.'
      : 'Guided Entry is a transport/invocation projection over an unchanged routed Handoff carrier. The exact qualified Handoff transport shell remains authoritative and unchanged; Entry, Target Entry, Role, participant, and operator-instruction selection only adds recipient-session intent and does not create or alter routing, recipient authority, semantic Parent, acceptance, work transfer, or completion.'
  });
}

function entryChoice(entry) {
  return Object.freeze({
    id: String(entry.id || ''),
    label: String(entry.label || entry.name || entry.canonicalIdentifier || ''),
    requiresInstruction: false,
    summary: String(entry.summary || ''),
    sourceKind: String(entry.sourceKind || ''),
    workspaceId: String(entry.workspaceId || ''),
    artifactPath: String(entry.artifactPath || ''),
    canonicalIdentifier: String(entry.canonicalIdentifier || ''),
    version: String(entry.version || ''),
    schemaId: String(entry.schemaId || ''),
    schemaLineage: Object.freeze([...(entry.schemaLineage || [])])
  });
}

function targetChoice(entry) {
  const target = entry?.target || {};
  return Object.freeze({
    id: String(entry?.id || ''),
    label: String(target.humanLabel || entry?.label || entry?.name || target.canonicalIdentifier || ''),
    targetKind: String(target.kind || ''),
    targetHandle: String(target.handle || ''),
    canonicalTargetIdentifier: String(target.canonicalIdentifier || ''),
    provider: String(target.provider || ''),
    host: String(target.host || ''),
    summary: String(entry?.summary || ''),
    sourceKind: String(entry?.sourceKind || ''),
    workspaceId: String(entry?.workspaceId || ''),
    artifactPath: String(entry?.artifactPath || ''),
    canonicalIdentifier: String(entry?.canonicalIdentifier || ''),
    schemaId: String(entry?.schemaId || ''),
    schemaLineage: Object.freeze([...(entry?.schemaLineage || [])]),
    provides: Object.freeze([...(target.provides || [])]),
    limitations: Object.freeze([...(target.limitations || [])])
  });
}

function compatibleTargetEntries(targetEntries = [], entry = null) {
  return Object.freeze(targetEntries.filter((targetEntry) => {
    const target = targetEntry?.target || {};
    const families = target.compatibleEntryFamilies || [];
    if (families.length && (!entry || !families.includes(String(entry.entryFamily || '')))) return false;
    if ((target.requiredEntryCapabilities || []).length) return false;
    return true;
  }));
}

function targetGuidanceLines(entry) {
  const lines = [];
  lines.push(`Qualified Target Entry: ${entry.canonicalIdentifier || entry.label}`);
  if (entry.sourceKind === 'carried') lines.push(`Target material: carried in this package at \`${entry.workspaceId}::${entry.artifactPath}\``);
  else if (entry.sourceKind === 'content-source') lines.push(`Target material: qualified reusable content source \`${entry.sourceId || ''}::${entry.artifactPath}\``);
  else lines.push(`Target material: qualified reusable Target Entry \`${entry.artifactPath}\``);
  lines.push('After the purpose Entry is grounded, qualify and compose that exact Target material as environment adaptation. Do not infer Role/recipient authority, work transfer, Process applicability, or remote-mutation authority from Target selection.');
  return lines;
}

function resolveRequestedEntry(entries, requested) {
  const exact = entries.filter((entry) => String(entry.id || '') === requested || String(entry.canonicalIdentifier || '') === requested);
  if (exact.length === 1) return exact[0];
  const labelMatches = entries.filter((entry) => String(entry.label || '').trim().toLocaleLowerCase() === requested.toLocaleLowerCase());
  return labelMatches.length === 1 ? labelMatches[0] : null;
}

function entryGuidanceLines(entry) {
  const lines = [];
  lines.push(`Qualified Entry: ${entry.canonicalIdentifier || entry.label}`);
  if (entry.sourceKind === 'carried') lines.push(`Entry material: carried in this package at \`${entry.workspaceId}::${entry.artifactPath}\``);
  else if (entry.sourceKind === 'content-source') lines.push(`Entry material: qualified reusable content source \`${entry.sourceId || ''}::${entry.artifactPath}\``);
  else lines.push(`Entry material: qualified reusable Entry \`${entry.artifactPath}\``);
  lines.push('After bootstrap, qualify and apply that exact Entry material within the carrier/session authority boundaries. This transport text intentionally does not restate its procedure or declared grounding material.');
  return lines;
}

function pushSpecializationGroups(lines, groups = []) {
  if (!groups.length) return;
  for (const group of groups) {
    const fields = Object.entries(group.fields || {}).filter(([, value]) => valueText(value));
    if (!fields.length) continue;
    lines.push('', `${group.group}:`);
    for (const [field, value] of fields) lines.push(`- ${field}: ${valueText(value)}`);
  }
}

function pushDeclarationGroups(lines, groups = []) {
  for (const group of groups) {
    if (!(group.entries || []).length) continue;
    lines.push('', `${group.group}:`);
    for (const entry of group.entries || []) {
      lines.push(`- ${entry.name}`);
      for (const [field, value] of Object.entries(entry.fields || {})) {
        if (valueText(value)) lines.push(`  - ${field}: ${valueText(value)}`);
      }
    }
  }
}

function pushGuidance(lines, heading, values = {}, orderedFields = []) {
  const present = orderedFields.filter((field) => valueText(values?.[field]));
  if (!present.length) return;
  lines.push('', `${heading}:`);
  for (const field of present) lines.push(`- ${field}: ${valueText(values[field])}`);
}

function valueText(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean).join('; ');
  return String(value || '').trim();
}

function resolveSessionRoleReference(identity, inspection, bundle = null) {
  const workspaceId = String(identity?.workspaceId || '').trim();
  const artifactPath = normalizePath(identity?.path || identity?.artifactPath || '');
  const label = String(identity?.label || '').trim();
  if (!label || !workspaceId || !artifactPath) return null;
  const local = findCarriedRoleMaterial(inspection, bundle, workspaceId, artifactPath);
  if (local) {
    return Object.freeze({
      label,
      reference: `${workspaceId}::${artifactPath}`,
      materialDescription: `carried in this package at \`${workspaceId}::${artifactPath}\``
    });
  }
  const external = String(identity?.reference || '').trim();
  if (!isQualifiedExternalRoleReference(external)) return null;
  return Object.freeze({
    label,
    reference: external,
    materialDescription: `available at ${markdownLink(label, external)}`
  });
}

function findCarriedRoleMaterial(inspection, bundle, workspaceId, artifactPath) {
  for (const workspace of inspection?.workspaces || []) {
    if (String(workspace?.workspaceId || '') !== workspaceId) continue;
    for (const entry of workspace?.archive?.entries || []) {
      if (normalizePath(entry?.path || '') !== artifactPath) continue;
      try {
        const markdown = new TextDecoder('utf-8', { fatal: true }).decode(entry.data || new Uint8Array());
        const parsed = parseArtifactMarkdown(markdown);
        if (String(parsed?.envelope?.current?.schema?.id || '') === 'tiinex.party.role.v1') return entry;
      } catch { return null; }
    }
  }
  for (const file of bundle?.files || []) {
    if (!/\.trace\.md$/i.test(String(file?.path || ''))) continue;
    if (String(file?.path || '') === artifactPath || String(file?.path || '').endsWith(`/${artifactPath}`)) {
      try {
        const markdown = new TextDecoder('utf-8', { fatal: true }).decode(file.data || new Uint8Array());
        const parsed = parseArtifactMarkdown(markdown);
        if (String(parsed?.envelope?.current?.schema?.id || '') === 'tiinex.party.role.v1') return file;
      } catch { return null; }
    }
  }
  return null;
}

function isQualifiedExternalRoleReference(value) {
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    if (/github\.com$/i.test(url.hostname) || /\.github\.com$/i.test(url.hostname)) {
      const match = url.pathname.match(/\/blob\/([0-9a-f]{40})(?:\/|$)/i);
      return Boolean(match);
    }
    return true;
  } catch { return false; }
}

function markdownLink(label, reference) {
  const safeLabel = label.replaceAll(']', ' ').replace(/[\r\n]+/gu, ' ').trim();
  return `[${safeLabel}](${reference})`;
}

function normalizeSessionIdentity(value = null) {
  if (!value) return null;
  if (typeof value === 'string') {
    const label = String(value).trim();
    return label ? Object.freeze({ label, reference: '' }) : null;
  }
  const label = String(value.label || value.authoringLabel || value.name || '').trim();
  const reference = String(value.reference || value.target || '').trim();
  const workspaceId = String(value.workspaceId || value.workspace || '').trim();
  const path = String(value.path || value.artifactPath || '').trim();
  return label ? Object.freeze({ label, reference, workspaceId, path }) : null;
}

function normalizeParticipants(value = []) {
  const raw = Array.isArray(value) ? value : [value];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const identity = normalizeSessionIdentity(item);
    if (!identity) continue;
    const key = sessionIdentityKey(identity);
    if (seen.has(key)) throw new Error('portable.workspace-entry.participant-duplicate');
    seen.add(key);
    out.push(identity);
  }
  return Object.freeze(out);
}

function sameIdentity(left, right) {
  const a = sessionIdentityKey(left);
  const b = sessionIdentityKey(right);
  return Boolean(a && b && a === b);
}

function sessionIdentityKey(value) {
  const reference = String(value?.reference || '').trim().toLocaleLowerCase();
  if (reference) return reference;
  const workspaceId = String(value?.workspaceId || '').trim().toLocaleLowerCase();
  const artifactPath = normalizePath(value?.path || value?.artifactPath || '').toLocaleLowerCase();
  if (workspaceId && artifactPath) return `${workspaceId}::${artifactPath}`;
  return String(value?.label || '').trim().toLocaleLowerCase();
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }

function normalizeInstruction(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/\r|\n/.test(text)) return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  return text;
}

function blocked(reasonCode, findings = [], modes = Object.freeze([CUSTOM_ENTRY]), targets = Object.freeze([NO_TARGET_OPTION])) {
  return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'blocked',
    state: 'blocked',
    reasonCode,
    modes,
    targets,
    findings: Object.freeze(findings || []),
    boundary: 'Entry and Target Entry discovery/selection do not weaken carrier qualification or create Handoff authority.'
  });
}
