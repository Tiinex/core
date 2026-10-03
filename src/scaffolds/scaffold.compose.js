import { parseScaffoldArtifact } from './scaffold.parse.js';
import { projectScaffoldPlan } from './scaffold.plan.js';

export const SCAFFOLD_COMPOSITE_PLAN_SCHEMA_ID = 'tiinex.scaffold.composite-plan.v1';

export function projectCompositeScaffoldPlan(input = {}) {
  const parsed = (input.parsedScaffolds || []).length
    ? input.parsedScaffolds
    : (input.scaffoldMarkdowns || []).map((markdown) => parseScaffoldArtifact(markdown));
  const findings = [];
  if (!parsed.length) findings.push(finding('error', 'scaffold.composite.empty', 'Composite Scaffold planning requires at least one exact Scaffold artifact.'));
  const targetKinds = new Set();
  const byPath = new Map();
  const handles = [];
  for (const scaffold of parsed) {
    handles.push(scaffold.identity?.handle || scaffold.title || '(unidentified)');
    for (const item of scaffold.findings || []) findings.push(item);
    if (scaffold.status && scaffold.status !== 'qualified') findings.push(finding('error', 'scaffold.composite.member-unqualified', `Scaffold ${scaffold.identity?.handle || scaffold.title || '(unidentified)'} is not qualified.`));
    if (scaffold.target?.kind) targetKinds.add(scaffold.target.kind);
    if (scaffold.composition?.extends) findings.push(finding('error', 'scaffold.composite.member-extends-unresolved', `Scaffold ${scaffold.identity?.handle || scaffold.title || '(unidentified)'} declares Extends; exact referenced composition must be resolved before bundle planning.`));
    if (scaffold.composition?.policy && scaffold.composition.policy !== 'additive') findings.push(finding('error', 'scaffold.composite.policy-unresolved', `Scaffold ${scaffold.identity?.handle || scaffold.title || '(unidentified)'} uses non-additive composition.`));
    if (scaffold.conflict?.deletionPolicy && scaffold.conflict.deletionPolicy !== 'never') findings.push(finding('error', 'scaffold.composite.deletion-policy-unsupported', `Scaffold ${scaffold.identity?.handle || scaffold.title || '(unidentified)'} does not preserve Deletion Policy: never.`));
    for (const entry of scaffold.entries || []) {
      if (!entry.path) continue;
      const previous = byPath.get(entry.path);
      if (!previous) byPath.set(entry.path, { entry, owner: scaffold.identity?.handle || scaffold.title || '' });
      else if (!equivalentEntry(previous.entry, entry)) findings.push(finding('error', 'scaffold.composite.path-conflict', `Scaffolds ${previous.owner || '(unknown)'} and ${scaffold.identity?.handle || scaffold.title || '(unknown)'} conflict at ${entry.path}.`, { path: entry.path }));
    }
  }
  if (targetKinds.size > 1) findings.push(finding('error', 'scaffold.composite.target-kind-conflict', `Composite planning requires one semantic Target Kind; observed ${[...targetKinds].join(', ')}.`));
  const preErrors = findings.filter((item) => item.severity === 'error').length;
  if (preErrors) return result('blocked', handles, [...targetKinds], [], findings);

  const merged = Object.freeze({
    status: 'qualified',
    title: 'Composite Scaffold Bundle',
    identity: Object.freeze({ handle: handles.join('+'), name: 'Composite Scaffold Bundle', version: '1', kind: 'composite' }),
    target: Object.freeze({ kind: [...targetKinds][0] || '' }),
    composition: Object.freeze({ policy: 'additive', extends: '' }),
    conflict: Object.freeze({ deletionPolicy: 'never' }),
    integrity: Object.freeze({ state: 'verified' }),
    entries: Object.freeze([...byPath.values()].map((item) => item.entry)),
    findings: Object.freeze([])
  });
  const plan = projectScaffoldPlan({ parsedScaffold: merged, targetBound: input.targetBound === true, existingEntries: input.existingEntries || [], generatedEntries: input.generatedEntries || [] });
  const combined = [...findings, ...(plan.findings || [])];
  return Object.freeze({
    schema: SCAFFOLD_COMPOSITE_PLAN_SCHEMA_ID,
    status: plan.status,
    executable: plan.executable,
    mutationPerformed: false,
    targetKind: [...targetKinds][0] || '',
    scaffolds: Object.freeze(handles),
    actions: plan.actions,
    findings: Object.freeze(combined),
    findingSummary: Object.freeze({ error: combined.filter((item) => item.severity === 'error').length, warning: combined.filter((item) => item.severity === 'warning').length, total: combined.length }),
    boundary: 'Read-only exact Scaffold composition. Members are unioned only when target kind and normalized path semantics are compatible; no source mutation, migration, deletion, or lifecycle authority is created.'
  });
}

function result(status, handles, targetKinds, actions, findings) {
  return Object.freeze({ schema: SCAFFOLD_COMPOSITE_PLAN_SCHEMA_ID, status, executable: false, mutationPerformed: false, targetKind: targetKinds[0] || '', scaffolds: Object.freeze(handles), actions: Object.freeze(actions), findings: Object.freeze(findings), findingSummary: Object.freeze({ error: findings.filter((item) => item.severity === 'error').length, warning: findings.filter((item) => item.severity === 'warning').length, total: findings.length }), boundary: 'Read-only exact Scaffold composition; blocked composition never mutates source.' });
}
function equivalentEntry(a = {}, b = {}) { return a.path === b.path && a.kind === b.kind && a.presence === b.presence && a.role === b.role && a.contentAuthority === b.contentAuthority && a.contentAuthorityReference === b.contentAuthorityReference && a.namingAuthorityReference === b.namingAuthorityReference; }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze({ ...params }) }); }
