import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sha256Hex, stableFingerprintBytes } from '../src/export/package.bytes.js';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
const core=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(core,'tools','tiinex-portable.mjs');
const dir='.topics/manual',workspaceId='manual';
function material(name,parent=null,body='') {
 const filename=`${dir}/${name}`;const rel=parent?path.posix.basename(parent.path):'';
 const parentPart=parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${rel}](${rel})\n  - Origin:\n    - [relative](${rel})\n`:'';
 const digest=parent?`- sha256-base64url-c14n-v2\n  - Towards: [${rel}](${rel})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:'';
 const markdown=sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parentPart}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n${body}\n---\n\n# Continuity Integrity\n\n${digest}- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
 return {workspaceId,path:filename,markdown};
}
function run(args) {const x=spawnSync(process.execPath,[cli,...args],{cwd:core,encoding:'utf8',env:{...process.env,TIINEX_CONTENT_ROOTS:process.env.TIINEX_CONTENT_ROOTS||''},timeout:40000});assert.ok(x.stdout.trim().startsWith('{'),x.stderr||x.stdout);return {exit:x.status,value:JSON.parse(x.stdout)};}
test('actual Core CLI project --request and apply --plan move asset+artifact, keep qualified Parent and block replay',async t=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'tiinex-core-cli-mixed-'));
 t.after(()=>rm(temp,{recursive:true,force:true}));const root=path.join(temp,'workspace');await mkdir(path.join(root,dir),{recursive:true});
 const picture=Buffer.from([137,80,78,71,0,255,99,3]);
 const asset=`${dir}/001-photo-01.png`,parent=material('001-parent.trace.md',null,'![Image](001-photo-01.png)\n'),child=material('001-1-child.trace.md',parent);
 for(const item of [parent,child]) await writeFile(path.join(root,item.path),item.markdown);
 await writeFile(path.join(root,asset),picture);
 const request={representationCoverage:'complete',assetCoverage:'complete',referenceCoverage:'complete',materials:[parent,child],assetPaths:[asset],assetMaterials:[{workspaceId,path:asset,fingerprint:stableFingerprintBytes(picture),sha256:sha256Hex(picture)}],operation:{kind:'scoped-move',workspaceId,selectedPath:parent.path,scope:'alone-with-assets',targetDirectory:'.topics/destination',placement:'same',parentPolicy:'keep'}};
 const requestPath=path.join(temp,'request.json'),planPath=path.join(temp,'plan.json');await writeFile(requestPath,JSON.stringify(request));
 const projection=run(['project-lineage-maintenance','--request',requestPath,'--compact']);assert.equal(projection.exit,0);
 assert.equal(projection.value.plan.status,'ready',JSON.stringify(projection.value.plan.findings));
 const plan=projection.value.plan;await writeFile(planPath,JSON.stringify(plan));
 const receipt=run(['apply-lineage-maintenance','--plan',planPath,'--workspace-id',workspaceId,'--workspace-root',root,'--compact']);
 assert.equal(receipt.exit,0);assert.equal(receipt.value.applied,true);
 const change=plan.changes.find(c=>c.kind==='binary-asset');assert.ok(change);
 assert.deepEqual(await readFile(path.join(root,change.toPath)),picture);
 await assert.rejects(stat(path.join(root,asset)));
 const childChange=plan.changes.find(c=>c.fromPath===child.path);
 const childMarkdown=await readFile(path.join(root,childChange.toPath),'utf8');
 assert.equal(canonicalC14nV2SelfState(childMarkdown).state,'verified');
 const childRecord=createRecordFromMarkdown(childMarkdown,{path:childChange.toPath});
 const qualified=path.posix.normalize(path.posix.join(path.posix.dirname(childChange.toPath),childRecord.trace));
 assert.equal(qualified,plan.changes.find(c=>c.fromPath===parent.path).toPath);
 const replay=run(['apply-lineage-maintenance','--plan',planPath,'--workspace-id',workspaceId,'--workspace-root',root,'--compact']);
 assert.equal(replay.exit,2);assert.equal(replay.value.status,'blocked');
});
