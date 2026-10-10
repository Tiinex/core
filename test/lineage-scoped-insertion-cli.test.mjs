import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
const core=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(core,'tools','tiinex-portable.mjs');
const dir='.topics/local',workspaceId='manual';
const create=(name)=>({workspaceId,path:`${dir}/${name}`,markdown:sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n'});
function run(args){
 const x=spawnSync(process.execPath,[cli,...args],{cwd:core,encoding:'utf8',env:{...process.env,TIINEX_CONTENT_ROOTS:process.env.TIINEX_CONTENT_ROOTS||''},timeout:40000});
 assert.ok(x.stdout.trim().startsWith('{'),x.stderr||x.stdout);return {exit:x.status,value:JSON.parse(x.stdout)};
}
test('manual CLI offline-compatible Append/Prepend + New Parent executes qualified disk mutation; Apply is replay-safe',async t=>{
 for (const placement of ['append','prepend']) {
  const temp=await mkdtemp(path.join(os.tmpdir(),`tiinex-cli-${placement}-`));t.after(()=>rm(temp,{recursive:true,force:true}));
  const root=path.join(temp,'workspace');await mkdir(path.join(root,dir),{recursive:true});
  const target=create('001-target.trace.md'),insert=create('009-insert.trace.md');
  for(const a of [target,insert])await writeFile(path.join(root,a.path),a.markdown);
  const request={representationCoverage:'complete',materials:[target,insert],assetPaths:[],assetCoverage:'complete',referenceCoverage:'complete',operation:{kind:'scoped-move',workspaceId,selectedPath:insert.path,targetPath:target.path,targetDirectory:dir,scope:'alone',placement,parentPolicy:'new'}};
  const requestPath=path.join(temp,'request.json'),planPath=path.join(temp,'plan.json');await writeFile(requestPath,JSON.stringify(request));
  const result=run(['project-lineage-maintenance','--request',requestPath,'--compact']);
  assert.equal(result.exit,0,JSON.stringify(result.value.findings));
  const plan=result.value.plan;assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  await writeFile(planPath,JSON.stringify(plan));
  const applied=run(['apply-lineage-maintenance','--plan',planPath,'--workspace-id',workspaceId,'--workspace-root',root,'--compact']);
  assert.equal(applied.exit,0,JSON.stringify(applied.value.findings));assert.equal(applied.value.applied,true);
  const bySource=new Map(plan.changes.map(c=>[c.fromPath,c]));
  const selected=bySource.get(insert.path),anchored=bySource.get(target.path);
  assert.equal(placement==='prepend'?selected.toPath:anchored.toPath,target.path.replace('target.trace.md',placement==='prepend'?'insert.trace.md':'target.trace.md'));
  for(const c of plan.changes){const result=await readFile(path.join(root,c.toPath),'utf8');assert.equal(result,c.markdown);assert.equal(canonicalC14nV2SelfState(result).state,'verified');}
  const descendant=placement==='prepend'?anchored:selected;
  const record=createRecordFromMarkdown(descendant.markdown,{path:descendant.toPath});
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(descendant.toPath),record.trace)),placement==='append'?anchored.toPath:selected.toPath);
  await assert.rejects(stat(path.join(root,insert.path)));
  const replay=run(['apply-lineage-maintenance','--plan',planPath,'--workspace-id',workspaceId,'--workspace-root',root,'--compact']);
  assert.equal(replay.exit,2);assert.equal(replay.value.status,'blocked');
 }
});
