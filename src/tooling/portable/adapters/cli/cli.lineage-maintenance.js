import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { applyPortableLineageMaintenancePlan } from '../node/lineage.maintenance.apply.js';
import { recoverPortableLineageMaintenanceTransactions } from '../node/lineage.maintenance.transaction.js';

export async function runLineageMaintenanceApplyCli(parsed, io = console) {
  try {
    const planPath = String(parsed.flags.plan || parsed.positionals[0] || '').trim();
    if (!planPath) throw new Error('portable.cli.lineage-maintenance.plan.required');
    const planValue = JSON.parse(await readFile(path.resolve(planPath), 'utf8'));
    const plan = planValue.plan || planValue.projection || planValue;
    const workspaceRoots = await readWorkspaceRoots(parsed.flags);
    const result = await applyPortableLineageMaintenancePlan(plan, { workspaceRoots });
    io.log(JSON.stringify(result, null, parsed.flags.compact ? 0 : 2));
    return result.status === 'ready' ? 0 : 2;
  } catch (error) {
    io.error(JSON.stringify({ schema: 'tiinex.portable.cli.error.v1', error: String(error?.message || error), command: 'apply-lineage-maintenance' }, null, 2));
    return 1;
  }
}

export async function runLineageMaintenanceRecoveryCli(parsed, io = console) {
  try {
    const workspaceRoots = await readWorkspaceRoots(parsed.flags);
    if (!Object.keys(workspaceRoots).length) throw new Error('portable.cli.lineage-maintenance.workspace-roots.required');
    const result = await recoverPortableLineageMaintenanceTransactions({ workspaceRoots });
    io.log(JSON.stringify(result, null, parsed.flags.compact ? 0 : 2));
    return result.status === 'ready' ? 0 : 2;
  } catch (error) {
    io.error(JSON.stringify({ schema: 'tiinex.portable.cli.error.v1', error: String(error?.message || error), command: 'recover-lineage-maintenance' }, null, 2));
    return 1;
  }
}

async function readWorkspaceRoots(flags = {}) {
  const rootsPath = String(flags['workspace-roots'] || flags.roots || '').trim();
  if (rootsPath) {
    const value = JSON.parse(await readFile(path.resolve(rootsPath), 'utf8'));
    return value.workspaceRoots || value.roots || value;
  }
  const workspaceId = String(flags['workspace-id'] || '').trim();
  const workspaceRoot = String(flags['workspace-root'] || '').trim();
  return workspaceId && workspaceRoot ? { [workspaceId]: workspaceRoot } : {};
}
