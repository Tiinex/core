import { parseScaffoldArtifact, normalizeScaffoldPath } from './scaffold.parse.js';

export const SCAFFOLD_PLAN_SCHEMA_ID = 'tiinex.scaffold.plan.v1';

export function projectScaffoldPlan(input = {}) {
  const parsed = input.parsedScaffold || parseScaffoldArtifact(input.scaffoldMarkdown || '');
  const targetBound = input.targetBound === true;
  const existing = normalizeExistingEntries(input.existingEntries || []);
  const generated = new Set((input.generatedEntries || []).map((value) => normalizeScaffoldPath(value).path).filter(Boolean));
  const findings = [...(parsed.findings || [])];
  if (!targetBound) findings.push(finding('error', 'scaffold.target.unbound', 'Scaffold plan requires one explicit target root binding.'));
  if (parsed.composition?.extends) findings.push(finding('error', 'scaffold.composition.extends-unresolved', 'Scaffold Extends requires exact referenced Scaffold material before planning; implicit composition is not allowed.'));
  if (parsed.composition?.policy && parsed.composition.policy !== 'additive') findings.push(finding('error', 'scaffold.composition.policy-unresolved', `Scaffold composition policy ${parsed.composition.policy} is not executable by the v1 planner.`));
  if (parsed.conflict?.deletionPolicy && parsed.conflict.deletionPolicy !== 'never') findings.push(finding('error', 'scaffold.deletion-policy.unsupported', 'Scaffold v1 planner only accepts Deletion Policy: never.'));

  const actions = [];
  if (!findings.some((item) => item.severity === 'error')) {
    for (const entry of parsed.entries || []) {
      const observed = existing.get(entry.path);
      if (observed) {
        if (compatibleKind(entry.kind, observed.kind)) {
          actions.push(action('preserve', entry, { observedKind: observed.kind, reason: 'compatible-existing-material' }));
        } else {
          actions.push(action('blocked-conflict', entry, { observedKind: observed.kind, reason: 'existing-kind-conflict' }));
          findings.push(finding('error', 'scaffold.target.conflict', `Existing target ${entry.path} has kind ${observed.kind}; scaffold requires ${entry.kind}.`, { path: entry.path }));
        }
        continue;
      }
      if (entry.presence === 'optional') {
        actions.push(action('optional-missing', entry, { reason: 'optional-entry-not-present' }));
        continue;
      }
      if (entry.presence !== 'required') {
        actions.push(action('unresolved', entry, { reason: 'entry-presence-unresolved' }));
        findings.push(finding('error', 'scaffold.entry.presence-unresolved', `Required planning cannot resolve Presence for ${entry.path}.`, { path: entry.path }));
        continue;
      }
      if (entry.kind === 'directory') {
        actions.push(action('create-directory', entry, { reason: 'required-directory-missing' }));
        continue;
      }
      if (entry.kind === 'file') {
        if (generated.has(entry.path)) actions.push(action('create-file', entry, { reason: 'required-file-generation-supplied' }));
        else {
          actions.push(action('unresolved', entry, { reason: 'required-file-generation-not-supplied' }));
          findings.push(finding('error', 'scaffold.file.generation-unresolved', `Required file ${entry.path} is missing and no generated entry was supplied.`, { path: entry.path }));
        }
        continue;
      }
      actions.push(action('unresolved', entry, { reason: 'entry-kind-unresolved' }));
      findings.push(finding('error', 'scaffold.entry.kind-unresolved', `Required entry ${entry.path} has unresolved kind ${entry.kind || '(missing)'}.`, { path: entry.path }));
    }
  }

  const errors = findings.filter((item) => item.severity === 'error').length;
  return Object.freeze({
    schema: SCAFFOLD_PLAN_SCHEMA_ID,
    status: errors ? 'blocked' : 'ready',
    executable: errors === 0,
    mutationPerformed: false,
    scaffold: Object.freeze({
      handle: parsed.identity?.handle || '',
      name: parsed.identity?.name || parsed.title || '',
      version: parsed.identity?.version || '',
      kind: parsed.identity?.kind || '',
      selfIntegrity: parsed.integrity?.state || 'unavailable'
    }),
    target: Object.freeze({ bound: targetBound, kind: parsed.target?.kind || '' }),
    actions: Object.freeze(actions),
    findings: Object.freeze(findings),
    findingSummary: Object.freeze({ error: errors, warning: findings.filter((item) => item.severity === 'warning').length, total: findings.length }),
    boundary: 'Read-only scaffold planning. The plan never mutates source, establishes Workspace identity, creates Parent ancestry, applies lifecycle transitions, performs Reduction, or authorizes deletion. Hosts must separately authorize and receipt any filesystem mutation.'
  });
}

function normalizeExistingEntries(entries = []) {
  const map = new Map();
  for (const item of entries || []) {
    const normalized = normalizeScaffoldPath(typeof item === 'string' ? item : item?.path || '');
    if (normalized.state !== 'qualified') continue;
    const kind = String(typeof item === 'string' ? 'unknown' : item?.kind || 'unknown').trim().toLowerCase();
    map.set(normalized.path, Object.freeze({ path: normalized.path, kind }));
  }
  return map;
}
function compatibleKind(required = '', observed = '') { return required === observed || observed === 'unknown'; }
function action(kind, entry = {}, extra = {}) { return Object.freeze({ action: kind, path: entry.path || '', entryKind: entry.kind || '', presence: entry.presence || '', role: entry.role || '', ...extra }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze({ ...params }) }); }
