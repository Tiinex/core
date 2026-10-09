import { mkdir, readFile, lstat, rename, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { projectPortableAgentRoleSync, qualifyPortableRoleAgentTarget } from '../../agent.roleSync.js';

async function readOptional(file) {
  try { return await readFile(file,'utf8'); }
  catch (e) { if (e?.code==='ENOENT') return null; throw e; }
}
async function ensureSafeTarget(workspace, target) {
  const root = path.resolve(workspace);
  const parts = target.split('/');
  if (parts.length !== 3 || parts[0]!=='.github' || parts[1]!=='agents') throw new Error('agent-sync.target-outside-agent-directory');
  const targetPath=path.resolve(root,...parts);
  if (!targetPath.startsWith(root+path.sep)) throw new Error('agent-sync.target-outside-workspace');
  for (const candidate of [root, path.join(root,'.github'),path.join(root,'.github','agents'),targetPath]) {
    try { const stat = await lstat(candidate); if (stat.isSymbolicLink()) throw new Error('agent-sync.symlink-denied'); if (candidate !== targetPath && !stat.isDirectory()) throw new Error('agent-sync.parent-not-directory'); if (candidate === targetPath && !stat.isFile()) throw new Error('agent-sync.target-not-regular-file'); }
    catch(e) { if(e?.code!=='ENOENT') throw e; }
  }
  return targetPath;
}

/** Exact local plan/apply, no remote effects; all source facts read on each call. */
export async function runPortableAgentRoleSyncNode({ workspace='', roleFile='', target='', mode='plan', approved=false, expectedAfterSha256='' } = {}) {
  const denied = code => Object.freeze({schema:'tiinex.portable.agent-role-sync-node.v1', status:'blocked', code});
  if (!['plan','check','apply'].includes(mode)) return denied('agent-sync.mode-unsupported');
  if (!workspace || !roleFile) return denied('agent-sync.input-required');
  let source;
  try {const stat=await lstat(path.resolve(roleFile)); if(!stat.isFile() || stat.isSymbolicLink()) return denied('agent-sync.role-not-regular-file'); source=await readFile(path.resolve(roleFile),'utf8');}
  catch(e){return denied(e?.code==='ENOENT'?'agent-sync.role-missing':'agent-sync.role-read-failed');}
  const effectiveTarget=target || qualifyPortableRoleAgentTarget(source, roleFile);
  if (!effectiveTarget) return denied('agent-sync.role-unqualified');
  let targetPath;
  try { targetPath=await ensureSafeTarget(workspace,effectiveTarget); }
  catch(e) {return denied(e?.message || 'agent-sync.target-unsafe');}
  let current;
  try { current=await readOptional(targetPath); }
  catch {return denied('agent-sync.target-read-failed');}
  const plan=projectPortableAgentRoleSync({roleMarkdown:source,rolePath:roleFile,currentMarkdown:current,targetPath:effectiveTarget});
  if (plan.status!=='ready') return denied(plan.code);
  const result={schema:'tiinex.portable.agent-role-sync-node.v1',status:'ready', mode, action:plan.action,
    target:plan.targetPath, roleLabel:plan.roleLabel, roleSha256:plan.roleSha256,
    beforeSha256:plan.beforeSha256, afterSha256:plan.afterSha256,
    preview:mode==='plan' ? plan.outputMarkdown : undefined,
    boundary:plan.boundary};
  if (mode==='check') return Object.freeze({...result,status:plan.action==='noop'?'ready':'drift'});
  if(mode==='plan'||plan.action==='noop') return Object.freeze(result);
  if (approved !== true) return denied('agent-sync.approval-required');
  if (!/^[0-9a-f]{64}$/.test(expectedAfterSha256) || expectedAfterSha256!==plan.afterSha256) return denied('agent-sync.approved-plan-stale');
  // Re-evaluate input and target immediately before write. Never create extra
  // permissions by silently reusing an out-of-date consent receipt.
  const currentAgain=await readOptional(targetPath);
  const sourceAgain=await readFile(path.resolve(roleFile),'utf8');
  if(currentAgain !== current || sourceAgain !== source) return denied('agent-sync.source-drift');
  try {
    await ensureSafeTarget(workspace,effectiveTarget);
    await mkdir(path.dirname(targetPath),{recursive:true});
    await ensureSafeTarget(workspace,effectiveTarget);
    const temporary=path.join(path.dirname(targetPath),`.tiinex-agent-sync-${randomBytes(12).toString('hex')}.tmp`);
    try { await writeFile(temporary,plan.outputMarkdown,{flag:'wx',mode:0o600}); await rename(temporary,targetPath); }
    finally {await rm(temporary,{force:true}).catch(()=>{});}
    return Object.freeze({...result,applied:true});
  } catch(e){return denied('agent-sync.apply-failed:'+(e?.code||'unknown'));}
}
