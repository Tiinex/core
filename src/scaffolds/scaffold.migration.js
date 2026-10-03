import { normalizeScaffoldPath } from './scaffold.parse.js';
import { projectCompositeScaffoldPlan } from './scaffold.compose.js';

export const SCAFFOLD_MIGRATION_PLAN_SCHEMA_ID = 'tiinex.scaffold.migration-plan.v1';

export function projectScaffoldMigrationPlan(input = {}) {
  const existing = normalizeExistingEntries(input.existingEntries || []);
  const workspacePlan = projectCompositeScaffoldPlan({
    scaffoldMarkdowns: input.workspaceScaffoldMarkdowns || [],
    parsedScaffolds: input.parsedWorkspaceScaffolds || [],
    targetBound: input.targetBound === true,
    existingEntries: [...existing.values()]
  });
  const repositoryPlan = (input.repositoryScaffoldMarkdowns || []).length || (input.parsedRepositoryScaffolds || []).length
    ? projectCompositeScaffoldPlan({ scaffoldMarkdowns: input.repositoryScaffoldMarkdowns || [], parsedScaffolds: input.parsedRepositoryScaffolds || [], targetBound: input.targetBound === true, existingEntries: [...existing.values()] })
    : null;
  const findings = [...(workspacePlan.findings || []), ...(repositoryPlan?.findings || [])];
  const moves = [];
  if (workspacePlan.status === 'ready' && (!repositoryPlan || repositoryPlan.status === 'ready')) {
    for (const raw of input.subjectRoots || []) {
      const source = normalizeScaffoldPath(raw).path;
      if (!source || !source.startsWith('.topics/') || source === '.topics/work' || source.startsWith('.topics/work/')) {
        findings.push(finding('error', 'scaffold.migration.subject-root.invalid', `Subject root ${raw || '(missing)'} is not a migratable direct .topics subject root.`, { source: raw || '' }));
        continue;
      }
      const tail = source.slice('.topics/'.length);
      if (!tail || tail.includes('/')) {
        findings.push(finding('error', 'scaffold.migration.subject-root.not-direct', `Subject root ${source} must be one direct child of .topics.`, { source }));
        continue;
      }
      if (!existing.has(source)) {
        moves.push(action('unresolved', source, `.topics/work/${tail}`, 'subject-root-not-observed'));
        findings.push(finding('error', 'scaffold.migration.subject-root.missing', `Subject root ${source} is not present in the observed target.`));
        continue;
      }
      const target = `.topics/work/${tail}`;
      if (existing.has(target)) {
        moves.push(action('blocked-conflict', source, target, 'destination-already-exists'));
        findings.push(finding('error', 'scaffold.migration.destination-conflict', `Migration destination ${target} already exists.`));
        continue;
      }
      moves.push(action('move-directory', source, target, 'legacy-subject-converges-under-work-root'));
    }
  }
  const errors = findings.filter((item) => item.severity === 'error').length;
  return Object.freeze({
    schema: SCAFFOLD_MIGRATION_PLAN_SCHEMA_ID,
    status: errors ? 'blocked' : 'ready',
    executable: errors === 0,
    mutationPerformed: false,
    workspacePlan,
    repositoryPlan,
    moves: Object.freeze(moves),
    findings: Object.freeze(findings),
    findingSummary: Object.freeze({ error: errors, warning: findings.filter((item) => item.severity === 'warning').length, total: findings.length }),
    boundary: 'Read-only migration projection. Move actions are proposals only; hosts must separately authorize/apply exact source-to-destination moves and requalify Parent/reference semantics afterwards. No deletion authority is implied.'
  });
}

function normalizeExistingEntries(entries = []) { const out = new Map(); for (const item of entries || []) { const normalized = normalizeScaffoldPath(typeof item === 'string' ? item : item?.path || ''); if (normalized.state !== 'qualified') continue; out.set(normalized.path, Object.freeze({ path: normalized.path, kind: String(typeof item === 'string' ? 'unknown' : item?.kind || 'unknown').trim().toLowerCase() })); } return out; }
function action(kind, from, to, reason) { return Object.freeze({ action: kind, from, to, reason }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze({ ...params }) }); }
