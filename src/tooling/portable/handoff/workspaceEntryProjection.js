import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

export const WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID = 'tiinex.portable.workspace-entry-projection.v1';

const ENTRY_MODES = Object.freeze([
  Object.freeze({ id: 'START', label: 'START', requiresInstruction: false, summary: 'Establish initial orientation from the carried Workspace material before substantive work.' }),
  Object.freeze({ id: 'RESUME', label: 'RESUME', requiresInstruction: false, summary: 'Reconstruct available continuity, separate verified grounding from uncertainty, and present grounding before continuing.' }),
  Object.freeze({ id: 'EXPLORE', label: 'EXPLORE', requiresInstruction: false, summary: 'Orient against the available material and identify suitable starting directions before committing to substantive work.' }),
  Object.freeze({ id: 'CUSTOM', label: 'CUSTOM', requiresInstruction: true, summary: 'Use an operator-provided session instruction as the requested starting intent.' })
]);

const CANONICAL_SHELL = (startPath) => `Handoff package attached.\n\nCold start: read Start directly; do not enumerate or broadly extract this package. Follow only Start's qualified bootstrap extraction instruction.\n\nStart:\n${startPath}\n\nThis is a pointerless Workspace carrier. After bootstrap, pass the package to Tiinex orientation/material projection. No Handoff Continue From route, recipient, or work transfer is declared or implied.`;

export function projectWorkspaceCarrierEntry(input = {}) {
  const inspection = input.inspection || inspectHandoffPackageV1(input.bundle || input.package || input);
  if (inspection.status !== 'valid') return blocked('carrier-invalid', inspection.findings || []);
  const projection = inspection.carrierProjection || {};
  if (projection.mode !== 'workspace' || (projection.routes || []).length !== 0) return blocked('pointerless-workspace-carrier-required', inspection.findings || []);

  const mode = String(input.mode || '').trim().toUpperCase();
  if (!mode) return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'ready',
    state: 'catalog',
    modes: ENTRY_MODES,
    startPath: String(projection.startPath || '001-1-READ-BEFORE-PROCEEDING.trace.md'),
    boundary: 'Guided Entry modes describe recipient-session intent for a pointerless Workspace carrier. They do not alter the carrier, establish Handoff routing, recipient authority, Role-holder state, acceptance, or work transfer.'
  });
  const definition = ENTRY_MODES.find((item) => item.id === mode);
  if (!definition) return blocked('entry-mode-invalid', inspection.findings || []);

  const customInstruction = normalizeInstruction(input.customInstruction || input.instruction || '');
  if (definition.requiresInstruction && !customInstruction) return blocked('custom-instruction-required', inspection.findings || []);
  if (!definition.requiresInstruction && customInstruction) return blocked('custom-instruction-unexpected', inspection.findings || []);

  const primaryRole = normalizeSessionIdentity(input.primaryRole || input.role || null);
  let participants;
  try { participants = normalizeParticipants(input.participants || []); }
  catch { return blocked('participant-duplicate', inspection.findings || []); }
  if (primaryRole && participants.some((item) => sameIdentity(item, primaryRole))) return blocked('primary-role-duplicate-participant', inspection.findings || []);

  const bundle = input.bundle || input.package || null;
  const resolvedPrimaryRole = primaryRole ? resolveSessionRoleReference(primaryRole, inspection, bundle) : null;
  if (primaryRole && !resolvedPrimaryRole) return blocked('session-role-material-unresolved', inspection.findings || []);
  const resolvedParticipants = participants.map((participant) => resolveSessionRoleReference(participant, inspection, bundle));
  if (resolvedParticipants.some((item) => !item)) return blocked('participant-role-material-unresolved', inspection.findings || []);

  const startPath = String(projection.startPath || '001-1-READ-BEFORE-PROCEEDING.trace.md');
  const lines = [CANONICAL_SHELL(startPath), '', `Entry intent: ${definition.id}`, '', definitionText(definition.id, customInstruction)];
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
    mode: definition.id,
    modeDefinition: definition,
    startPath,
    primaryRole: resolvedPrimaryRole ? { label: resolvedPrimaryRole.label, reference: resolvedPrimaryRole.reference } : null,
    participants: Object.freeze(resolvedParticipants.map((item) => ({ label: item.label, reference: item.reference }))),
    transportText: `${lines.join('\n')}\n`,
    boundary: 'Guided Entry is a transport/invocation projection over an unchanged pointerless Workspace carrier. The carrier ZIP and its semantic lineage are unchanged by mode, Role, participant, or operator instruction selection.'
  });
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

function definitionText(mode, customInstruction) {
  if (mode === 'START') return 'After bootstrap, establish orientation from the available carried Workspace material and identify the initial working context before substantive work.';
  if (mode === 'RESUME') return 'After bootstrap, reconstruct available continuity, distinguish verified grounding from uncertainty, and present grounding before continuing.';
  if (mode === 'EXPLORE') return 'After bootstrap, use the available material through Tiinex orientation/material projection to identify suitable starting directions before committing to substantive work.';
  return `After bootstrap, treat the following operator instruction as session intent. Ground it against the available Workspace material before acting.\n\nOperator instruction:\n${customInstruction}`;
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

function blocked(reasonCode, findings = []) {
  return Object.freeze({
    schema: WORKSPACE_ENTRY_PROJECTION_SCHEMA_ID,
    status: 'blocked',
    state: 'blocked',
    reasonCode,
    modes: ENTRY_MODES,
    findings: Object.freeze(findings || []),
    boundary: 'Guided Entry does not weaken pointerless carrier qualification or create Handoff authority.'
  });
}
