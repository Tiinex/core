import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { projectPortableEntryCatalog } from '../entry/entry.catalog.js';

export const WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID = 'tiinex.portable.workspace-entry-projection.v1';

const CUSTOM_ENTRY = Object.freeze({
  id: 'CUSTOM',
  label: 'Custom',
  requiresInstruction: true,
  summary: 'Use an operator-provided session instruction as the requested starting intent.',
  sourceKind: 'runtime'
});

const CANONICAL_SHELL = (startPath) => `Handoff package attached.\n\nCold start: read Start directly; do not enumerate or broadly extract this package. Follow only Start's qualified bootstrap extraction instruction.\n\nStart:\n${startPath}\n\nThis is a pointerless Workspace carrier. After bootstrap, pass the package to Tiinex orientation/material projection. No Handoff Continue From route, recipient, or work transfer is declared or implied.`;

export function projectWorkspaceCarrierEntry(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  if (inspection.status !== 'valid') return blocked('carrier-invalid', inspection.findings || []);
  const projection = inspection.carrierProjection || {};
  if (projection.mode !== 'workspace' || (projection.routes || []).length !== 0) return blocked('pointerless-workspace-carrier-required', inspection.findings || []);

  const entryCatalog = projectPortableEntryCatalog({ inspection, includeNative: true });
  if (entryCatalog.status !== 'ready') return blocked(entryCatalog.reasonCode || 'entry-catalog-unavailable', [...(inspection.findings || []), ...(entryCatalog.findings || [])]);
  const modes = Object.freeze([
    ...(entryCatalog.entries || []).map(entryChoice),
    CUSTOM_ENTRY
  ]);

  const requested = String(input.entryId || input.entry || input.mode || '').trim();
  if (!requested) return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'ready',
    state: 'catalog',
    modes,
    entries: Object.freeze(entryCatalog.entries || []),
    startPath: String(projection.startPath || '001-1-READ-BEFORE-PROCEEDING.trace.md'),
    boundary: 'Guided Entry exposes qualified reusable Entry definitions plus an explicit Custom runtime path. Entry selection describes recipient-session intent for a pointerless Workspace carrier; it does not alter the carrier or establish Handoff routing, recipient authority, Role-holder state, participant authority, acceptance, work transfer, or completion.'
  });

  const customRequested = requested.toLocaleUpperCase() === 'CUSTOM';
  const definition = customRequested ? CUSTOM_ENTRY : resolveRequestedEntry(entryCatalog.entries || [], requested);
  if (!definition) return blocked('entry-mode-invalid', inspection.findings || [], modes);

  const customInstruction = normalizeInstruction(input.customInstruction || input.instruction || '');
  if (customRequested && !customInstruction) return blocked('custom-instruction-required', inspection.findings || [], modes);
  if (!customRequested && customInstruction) return blocked('custom-instruction-unexpected', inspection.findings || [], modes);

  const primaryRole = normalizeSessionIdentity(input.primaryRole || input.role || null);
  let participants;
  try { participants = normalizeParticipants(input.participants || []); }
  catch { return blocked('participant-duplicate', inspection.findings || [], modes); }
  if (primaryRole && participants.some((item) => sameIdentity(item, primaryRole))) return blocked('primary-role-duplicate-participant', inspection.findings || [], modes);

  const bundle = input.bundle || input.package || null;
  const resolvedPrimaryRole = primaryRole ? resolveSessionRoleReference(primaryRole, inspection, bundle) : null;
  if (primaryRole && !resolvedPrimaryRole) return blocked('session-role-material-unresolved', inspection.findings || [], modes);
  const resolvedParticipants = participants.map((participant) => resolveSessionRoleReference(participant, inspection, bundle));
  if (resolvedParticipants.some((item) => !item)) return blocked('participant-role-material-unresolved', inspection.findings || [], modes);

  const startPath = String(projection.startPath || '001-1-READ-BEFORE-PROCEEDING.trace.md');
  const lines = [CANONICAL_SHELL(startPath), ''];
  if (customRequested) {
    lines.push('Entry intent: Custom', '', 'After bootstrap, treat the following operator instruction as session intent. Ground it against the available qualified Workspace material before acting.', '', 'Operator instruction:', customInstruction);
  } else {
    lines.push(`Entry intent: ${definition.label}`, '', ...entryGuidanceLines(definition));
  }
  if (resolvedPrimaryRole || resolvedParticipants.length) {
    lines.push('', 'Session context (not package or transfer authority):');
    if (resolvedPrimaryRole) {
      lines.push(`Session Role: ${resolvedPrimaryRole.label}`);
      lines.push('The receiving LLM session operates as the Session Role established above.');
      lines.push(`Role material: ${resolvedPrimaryRole.materialDescription}`);
    }
    if (resolvedParticipants.length) {
      lines.push('Participants:');
      for (const participant of resolvedParticipants) {
        lines.push(`- ${participant.label}`);
        lines.push(`  Role material: ${participant.materialDescription}`);
      }
      lines.push('Participants are other Roles participating in the same conversation. They are not the Session Role.');
    }
    lines.push('These session selections do not establish semantic Role-holder state, participant authority, recipient authority, acceptance, or work transfer.');
  }
  return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'ready',
    state: 'rendered',
    mode: customRequested ? 'CUSTOM' : definition.id,
    entryId: customRequested ? '' : definition.id,
    modeDefinition: customRequested ? CUSTOM_ENTRY : entryChoice(definition),
    entryDefinition: customRequested ? null : definition,
    startPath,
    primaryRole: resolvedPrimaryRole ? { label: resolvedPrimaryRole.label, reference: resolvedPrimaryRole.reference } : null,
    participants: Object.freeze(resolvedParticipants.map((item) => ({ label: item.label, reference: item.reference }))),
    transportText: `${lines.join('\n')}\n`,
    boundary: 'Guided Entry is a transport/invocation projection over an unchanged pointerless Workspace carrier. Entry, Role, participant, and operator-instruction selection do not mutate the carrier or its semantic lineage and do not independently create authority, routing, acceptance, continuation, work transfer, or completion.'
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

function resolveRequestedEntry(entries, requested) {
  const exact = entries.filter((entry) => String(entry.id || '') === requested || String(entry.canonicalIdentifier || '') === requested);
  if (exact.length === 1) return exact[0];
  const labelMatches = entries.filter((entry) => String(entry.label || '').trim().toLocaleLowerCase() === requested.toLocaleLowerCase());
  return labelMatches.length === 1 ? labelMatches[0] : null;
}

function entryGuidanceLines(entry) {
  const lines = [];
  lines.push(`Qualified Entry: ${entry.canonicalIdentifier || entry.label}`);
  lines.push(entry.sourceKind === 'carried'
    ? `Entry material: carried in this package at \`${entry.workspaceId}::${entry.artifactPath}\``
    : `Entry material: qualified Core-native Entry \`${entry.artifactPath}\``);
  const schemaId = String(entry.schemaId || '').trim();
  const lineage = Array.isArray(entry.schemaLineage) ? entry.schemaLineage.map((item) => String(item || '').trim()).filter(Boolean) : [];
  if (schemaId) lines.push(`Entry schema: ${schemaId}${lineage.length > 1 ? ` (${lineage.join(' -> ')})` : ''}`);
  if (entry.summary) lines.push(`Purpose: ${entry.summary}`);
  lines.push('', 'After bootstrap, apply the qualified Entry below within the carrier and session authority boundaries.');
  pushGuidance(lines, 'Preparation', entry.preparation, [
    'Preparation Method', 'Reconciliation Policy', 'Discovery Breadth', 'Currentness Policy', 'Uncertainty Policy'
  ]);
  if ((entry.groundingMaterial || []).length) {
    lines.push('', 'Grounding material (required before this Entry is fully grounded):');
    for (const item of entry.groundingMaterial) {
      lines.push(`- ${item.name || item.label || 'Declared material'}`);
      lines.push(`  - Reference: ${item.reference}`);
      lines.push(`  - Purpose: ${item.purpose}`);
      if (item.qualificationNotes) lines.push(`  - Qualification Notes: ${item.qualificationNotes}`);
    }
    lines.push('Qualify and interpret every declared Grounding Material reference for its stated Purpose. The reference and Purpose do not override the target material\'s own schema semantics or authority; preserve unavailable, stale, conflicting, or unresolved material explicitly.');
  }
  pushGuidance(lines, 'Entry method', entry.method, [
    'Method', 'Readiness Boundary', 'Stop Conditions', 'Escalation Conditions'
  ]);
  pushGuidance(lines, 'Presentation and interaction', entry.presentation, [
    'Presentation Guidance', 'Preference Sources', 'Interaction Guidance', 'Diagnostic Detail Policy'
  ]);
  pushSpecializationGroups(lines, entry.specializationGroups || []);
  pushDeclarationGroups(lines, (entry.declarations || []).filter((group) => String(group.group || '') !== 'Grounding Material Declaration'));
  pushGuidance(lines, 'Interpretation limits', entry.interpretationLimits, [
    'Does Not Establish', 'Must Not Be Inferred'
  ]);
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

function blocked(reasonCode, findings = [], modes = Object.freeze([CUSTOM_ENTRY])) {
  return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'blocked',
    state: 'blocked',
    reasonCode,
    modes,
    findings: Object.freeze(findings || []),
    boundary: 'Guided Entry does not weaken pointerless carrier qualification or create Handoff authority.'
  });
}
