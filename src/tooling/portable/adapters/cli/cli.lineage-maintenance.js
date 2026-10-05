import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { applyPortableLineageMaintenancePlan } from '../node/lineage.maintenance.apply.js';

export async function runLineageMaintenanceApplyCli(parsed, io = console) {
  try {
    const planPath = String(parsed.flags.plan || parsed.positionals[0] || '').trim();
    if (!planPath) throw new Error('portable.cli.lineage-maintenance.plan.required');
    const planValue = JSON.parse(await readFile(path.resolve(planPath), 'utf8'));
    const plan = planValue.plan || planValue.projection || planValue;
    const rootsPath = String(parsed.flags['workspace-roots'] || parsed.flags.roots || '').trim();
    let workspaceRoots = {};
    if (rootsPath) {
      const value = JSON.parse(await readFile(path.resolve(rootsPath), 'utf8'));
      workspaceRoots = value.workspaceRoots || value.roots || value;
    } else {
      const workspaceId = String(parsed.flags['workspace-id'] || '').trim();
      const workspaceRoot = String(parsed.flags['workspace-root'] || '').trim();
      if (workspaceId && workspaceRoot) workspaceRoots = { [workspaceId]: workspaceRoot };
    }
    const result = await applyPortableLineageMaintenancePlan(plan, { workspaceRoots });
    io.log(JSON.stringify(result, null, parsed.flags.compact ? 0 : 2));
    return result.status === 'ready' ? 0 : 2;
  } catch (error) {
    io.error(JSON.stringify({ schema: 'tiinex.portable.cli.error.v1', error: String(error?.message || error), command: 'apply-lineage-maintenance' }, null, 2));
    return 1;
  }
}
