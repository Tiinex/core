import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';

export const OPERATOR_TARGET_GUIDE_SCHEMA_ID = 'tiinex.portable.operator-target-guide.v1';
const SCHEMA = 'tiinex.annotation.v1';
const KIND = 'target-entry';
const VALUE_TYPE = 'operator-only-manual-transport-guidance';

/**
 * An optional, human-only carrier companion: not a recipient Entry, Process,
 * Target Material or Handoff instruction. Discovery is exact and fail-closed.
 * No generic annotation discovery is added to cold-start grounding.
 */
export function projectOperatorTargetGuide(input = {}) {
  const selectedTarget = input.targetDefinition || null;
  const workspaceId = String(selectedTarget?.workspaceId || '');
  const targetPath = cleanPath(selectedTarget?.artifactPath);
  const targetIdentifier = String(selectedTarget?.canonicalIdentifier || '');
  if (selectedTarget?.sourceKind !== 'carried' || !workspaceId || !targetPath || !targetIdentifier) {
    return unavailable('no-carried-target-identity');
  }
  const workspaces = (input.inspection?.workspaces || []).filter(w => w.workspaceId === workspaceId);
  if (workspaces.length !== 1 || workspaces[0]?.archive?.state !== 'qualified') return unavailable('workspace-unqualified');
  const folder = path.posix.dirname(targetPath);
  const candidates = [];
  for (const entry of workspaces[0].archive.entries || []) {
    const file = cleanPath(entry.path);
    if (!file || path.posix.dirname(file) !== folder || !file.endsWith('.trace.md') || !entry.data) continue;
    let markdown;
    try { markdown = new TextDecoder('utf-8', { fatal: true }).decode(entry.data); } catch { continue; }
    let parsed;
    try { parsed = parseArtifactMarkdown(markdown); } catch { continue; }
    if (String(parsed?.envelope?.current?.schema?.id || '') !== SCHEMA) continue;
    // Ignore annotations for other purposes, even if they happen to live next
    // to the selected Target. A nearby filename is never semantic authority.
    const kind = field(markdown, 'Annotation Target', 'Target Kind');
    const identifier = field(markdown, 'Annotation Target', 'Target Identifier');
    const type = field(markdown, 'Annotation Value', 'Value Type');
    if (kind !== KIND || identifier !== targetIdentifier || type !== VALUE_TYPE) continue;
    candidates.push({ file, markdown, parsed });
  }
  if (candidates.length === 0) return unavailable('not-declared');
  // Multiple same-target annotations are allowed only as one verified Parent
  // chain. This preserves the old exact bytes and selects the sole current
  // terminal descendant; parallel siblings never become arbitrary UI choices.
  const chosen = chooseTerminalGuide(candidates, folder, targetPath);
  if (chosen.status !== 'ready') return unavailable(chosen.reasonCode);
  const { file, markdown } = chosen;
  const valueBoundary = field(markdown, 'Annotation Value', 'Value Boundary');
  if (!/human operator/i.test(valueBoundary) || !/no handoff authority/i.test(valueBoundary)) {
    return unavailable('operator-only-boundary-missing');
  }
  const value = section(markdown, 'Annotation Value');
  const firstInstruction = value.search(/^###\s+/m);
  if (firstInstruction < 0) return unavailable('instructions-unavailable');
  const guide = value.slice(firstInstruction).trim();
  if (!guide) return unavailable('instructions-unavailable');
  return Object.freeze({
    schema: OPERATOR_TARGET_GUIDE_SCHEMA_ID, status: 'ready', state: 'operator-only',
    canonicalIdentifier: field(markdown, 'Annotation Identity', 'Canonical Identifier'),
    targetIdentifier, workspaceId, artifactPath: file,
    title: field(markdown, 'Annotation Identity', 'Annotation Name'),
    reviewState: field(markdown, 'Annotation State', 'State') || 'unknown',
    markdown: guide,
    boundary: 'Read-only human presentation. Never append guide to clipboardText, target Entry, recipient grounding, or Handoff authority.'
  });
}

function chooseTerminalGuide(candidates, folder, targetPath) {
  const files = new Map(candidates.map(candidate => [candidate.file, candidate]));
  if (files.size !== candidates.length) return { status: 'unavailable', reasonCode: 'ambiguous-companions' };
  const childCount = new Map(candidates.map(candidate => [candidate.file, 0]));
  const parents = new Map();
  for (const candidate of candidates) {
    const { file, markdown, parsed } = candidate;
    const linked = /^\[[^\]]+\]\(([^)]+)\)$/.exec(field(markdown, 'Annotation Target', 'Target Artifact'))?.[1] || '';
    if (!linked || path.posix.normalize(path.posix.join(folder, linked)) !== targetPath) {
      return { status: 'unavailable', reasonCode: 'target-artifact-mismatch' };
    }
    if (canonicalC14nV2SelfState(markdown).state !== 'verified') {
      return { status: 'unavailable', reasonCode: 'self-integrity-unverified' };
    }
    const parent = cleanPath(parsed?.envelope?.parent?.trace || '');
    if (!parent) continue;
    const parentPath = path.posix.normalize(path.posix.join(folder, parent));
    const predecessor = files.get(parentPath);
    if (!predecessor || parentPath === file) return { status: 'unavailable', reasonCode: 'annotation-parent-unqualified' };
    if (String(parsed.envelope.parent.schema?.id) !== SCHEMA ||
        String(parsed.envelope.parent.createdAt) !== String(predecessor.parsed.envelope.current?.createdAt)) {
      return { status: 'unavailable', reasonCode: 'annotation-parent-identity-mismatch' };
    }
    parents.set(file, parentPath);
    childCount.set(parentPath, childCount.get(parentPath) + 1);
  }
  const leaves = candidates.filter(candidate => childCount.get(candidate.file) === 0);
  if (leaves.length !== 1) return { status: 'unavailable', reasonCode: 'ambiguous-companions' };
  const seen = new Set();
  let current = leaves[0].file;
  while (current && !seen.has(current)) { seen.add(current); current = parents.get(current); }
  if (current || seen.size !== candidates.length) return { status: 'unavailable', reasonCode: 'ambiguous-companions' };
  return { status: 'ready', ...leaves[0] };
}

function section(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(markdown || '').match(new RegExp(`^## ${escaped}\\s*\\n([\\s\\S]*?)(?=^## |^# Continuity Integrity|$(?![\\s\\S]))`, 'm'))?.[1] || '';
}
function field(markdown, heading, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return section(markdown, heading).match(new RegExp(`^\\s*- ${escaped}:\\s*(.*)$`, 'm'))?.[1]?.trim() || '';
}
function cleanPath(value) {
  const result = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();
  return result && result !== '.' && !result.startsWith('../') && !result.startsWith('/') ? path.posix.normalize(result) : '';
}
function unavailable(reasonCode) {
  return Object.freeze({ schema: OPERATOR_TARGET_GUIDE_SCHEMA_ID, status: 'unavailable', reasonCode,
    boundary: 'No operator instructions selected. This never affects recipient transport text or work authority.' });
}
