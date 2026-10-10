import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {buildArtifactCreationContract} from '../src/schemas/creation.contracts.js';
import {renderArtifactCreationDraftMarkdown} from '../src/schemas/creation.renderer.js';
import {projectPortableAuthoringParent} from '../src/tooling/portable/editor/authoring.parent.js';
import {inspectPortableCrossWorkspaceClosedGraph} from '../src/tooling/portable/adapters/node/lineage.crossWorkspace.graphBundle.js';
import {applyPortableCrossWorkspaceAssetBundle} from '../src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js';
import {canonicalC14nV2SelfState} from '../src/integrity/integrity.c14nV2.js';
import {parseArtifactMarkdown} from '../src/artifacts/artifact.parse.js';
const rootPath='.topics/from/001-root.trace.md';
const childPath='.topics/from/001-1-child.trace.md';
const grandPath='.topics/from/001-1-1-grand.trace.md';
const anchorPath='.topics/to/002-anchor.trace.md';
const imagePath='.topics/from/001-1-photo.png';const png=Buffer.from([137,80,78,71,13,10,26,10,33,44,55]);
const createdAt='2026-10-10 10:00:00';
const c=(transition)=>buildArtifactCreationContract({schemaId:'tiinex.topic.v1',transitionType:transition});
const values=(name,image='')=>({'Current Read':`${name}${image?'\n\n![proof]('+image+')':''}`,'Design Direction':'Move closed graph with exact semantic Parent','Next Artifacts':'none'});
const render=(filename,name,parent=null,image='')=>renderArtifactCreationDraftMarkdown(c(parent?'continue-from-record':'create-artifact'),{
 childPath:filename,title:name,createdAt,values:values(name,image),...(parent?{parentRecord:parent}:{})})+'\n';
const exists=async f=>access(f).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e;});
async function fixture(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-closed-graph-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const src=path.join(dir,'source'),dst=path.join(dir,'target');await mkdir(path.join(src,'.topics/from'),{recursive:true});await mkdir(path.join(dst,'.topics/to'),{recursive:true});
 const root=render(rootPath,'Root');await writeFile(path.join(src,rootPath),root);
 const rootProj=projectPortableAuthoringParent({records:[{path:rootPath,markdown:root}]});assert.equal(rootProj.status,'ready',JSON.stringify(rootProj.findings));
 const child=render(childPath,'Child',rootProj.parentRecord,'001-1-photo.png');await writeFile(path.join(src,childPath),child);
 const childProj=projectPortableAuthoringParent({records:[{path:childPath,markdown:child}]});assert.equal(childProj.status,'ready',JSON.stringify(childProj.findings));
 const grand=render(grandPath,'Grand',childProj.parentRecord);await writeFile(path.join(src,grandPath),grand);
 await writeFile(path.join(src,imagePath),png);await writeFile(path.join(dst,anchorPath),render(anchorPath,'Anchor'));
 return {dir,src,dst,root,child,grand,request:{sourceWorkspace:{workspaceId:'source',workspaceRoot:src},targetWorkspace:{workspaceId:'target',workspaceRoot:dst},
  operation:{kind:'scoped-move',workspaceId:'source',targetWorkspaceId:'target',selectedPath:rootPath,targetPath:anchorPath,scope:'self-and-leaves',placement:'same',parentPolicy:'keep'}}};
}
test('Core qualifies three-layer semantic Parent tree and PNG without any external Parent or reader',async t=>{
 const fx=await fixture(t);const plan=await inspectPortableCrossWorkspaceClosedGraph(fx.request);
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));assert.equal(plan.moves.length,4);
 const names=plan.moves.map(x=>x.toPath).sort();assert.deepEqual(names.sort(),[
 '.topics/to/003-root.trace.md','.topics/to/003-1-child.trace.md','.topics/to/003-1-1-grand.trace.md','.topics/to/003-1-photo.png'].sort());
 const original=[fx.root,fx.child,fx.grand];assert.ok(plan.moves.filter(x=>x.kind==='artifact').every(x=>canonicalC14nV2SelfState(x.outputMarkdown).state==='verified'));
 const receipt=await applyPortableCrossWorkspaceAssetBundle(plan);assert.equal(receipt.status,'ready',JSON.stringify(receipt));assert.equal(receipt.applied,true);
 for(const name of names){assert.equal(await exists(path.join(fx.dst,name)),true);}
 const root=await readFile(path.join(fx.dst,'.topics/to/003-root.trace.md'),'utf8'),child=await readFile(path.join(fx.dst,'.topics/to/003-1-child.trace.md'),'utf8'),grand=await readFile(path.join(fx.dst,'.topics/to/003-1-1-grand.trace.md'),'utf8');
 assert.equal(parseArtifactMarkdown(child).envelope.parent.trace,'003-root.trace.md');assert.equal(parseArtifactMarkdown(grand).envelope.parent.trace,'003-1-child.trace.md');
 assert.ok(child.includes(canonicalC14nV2SelfState(root).declaredValue));assert.ok(grand.includes(canonicalC14nV2SelfState(child).declaredValue));
 assert.ok(child.includes('![proof](003-1-photo.png)'));assert.deepEqual(await readFile(path.join(fx.dst,'.topics/to/003-1-photo.png')),png);
 for(const f of [rootPath,childPath,grandPath,imagePath])assert.equal(await exists(path.join(fx.src,f)),false);
});
test('closed graph incoming reference in target Workspace causes BLOCK without mutation',async t=>{
 const fx=await fixture(t);await mkdir(path.join(fx.dst,'.topics/notes'),{recursive:true});await writeFile(path.join(fx.dst,'.topics/notes/reader.md'),`[reader](source::${childPath})`);
 const bad=await inspectPortableCrossWorkspaceClosedGraph(fx.request);assert.equal(bad.status,'blocked');assert.ok((bad.findings||[]).length);assert.equal(await exists(path.join(fx.src,rootPath)),true);
});
test('SIGKILL-equivalent injected fault after partial multi-file output promotion restores entire original graph',async t=>{
 const fx=await fixture(t);const plan=await inspectPortableCrossWorkspaceClosedGraph(fx.request);assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const fault=await applyPortableCrossWorkspaceAssetBundle(plan,{onPhase:async({phase})=>{if(phase==='outputs-promoted')throw Error('injected-after-full-graph-promotion');}});
 assert.equal(fault.status,'blocked');assert.equal(fault.rollback?.status,'ready',JSON.stringify(fault));
 assert.equal(await readFile(path.join(fx.src,rootPath),'utf8'),fx.root);assert.equal(await readFile(path.join(fx.src,childPath),'utf8'),fx.child);
 assert.equal(await readFile(path.join(fx.src,grandPath),'utf8'),fx.grand);assert.deepEqual(await readFile(path.join(fx.src,imagePath)),png);
 for(const m of plan.moves)assert.equal(await exists(path.join(fx.dst,m.toPath)),false);
});
test('Core standalone CLI PLAN→APPLY and replay BLOCK for moved full semantic subtree',async t=>{
 const fx=await fixture(t);const rq=path.join(fx.dir,'request.json'),pp=path.join(fx.dir,'plan.json');await writeFile(rq,JSON.stringify(fx.request));
 const cli=path.join(process.cwd(),'tools/tiinex-portable.mjs');const run=(op,param,f)=>{
  const r=spawnSync(process.execPath,[cli,op,param,f,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:60000});assert.ok(r.stdout.startsWith('{'),r.stderr||r.stdout);return {exit:r.status,...JSON.parse(r.stdout)};};
 const plan=run('plan-cross-workspace-closed-graph','--request',rq);assert.equal(plan.exit,0,JSON.stringify(plan.findings));
 await writeFile(pp,JSON.stringify(plan));const result=run('apply-cross-workspace-closed-graph','--plan',pp);assert.equal(result.exit,0,JSON.stringify(result.findings));
 const replay=run('apply-cross-workspace-closed-graph','--plan',pp);assert.equal(replay.exit,2);assert.equal(replay.status,'blocked');
});
test('changed child Parent integrity, declared Schema/Created At and wrong percent-encoding BLOCK the complete graph',async t=>{
 const x=await fixture(t);const original=await readFile(path.join(x.src,childPath),'utf8');
 for(const [caseIndex,corrupt] of [
   original.replace(/(  - Towards: \[001-root.trace.md\]\(001-root.trace.md\)\n  - Value: )[^\n]+/, '$1'+ 'A'.repeat(43)),
   original.replace('  - Parent Schema: [tiinex.topic.v1]','  - Parent Schema: [tiinex.evidence.v1]'),
   original.replace('  - Created At: 2026-10-10 10:00:00','  - Created At: 2026-10-09 01:00:00')
 ].entries()) {
  const {sealC14nV2Self}=await import('../src/integrity/integrity.c14nV2.js');
  await writeFile(path.join(x.src,childPath),sealC14nV2Self(corrupt).markdown);
  const result=await inspectPortableCrossWorkspaceClosedGraph(x.request);
  assert.equal(result.status,'blocked',`case=${caseIndex} ${JSON.stringify(result.findings)}`);
  assert.equal(await exists(path.join(x.src,rootPath)),true);
 }
});
test('preview snapshot drift, target collisions and external dynamic files all prevent graph mutation',async t=>{
 const x=await fixture(t);const plan=await inspectPortableCrossWorkspaceClosedGraph(x.request);assert.equal(plan.status,'ready');
 await mkdir(path.join(x.dst,'.topics/notes'),{recursive:true});await writeFile(path.join(x.dst,'.topics/notes/add.md'),'Late reader created after preview');
 const result=await applyPortableCrossWorkspaceAssetBundle(plan);assert.equal(result.status,'blocked');
 assert.equal(await exists(path.join(x.src,rootPath)),true);
});
test('SIGKILL after closed graph outputs promotion is recoverable through direct Core CLI',async t=>{
 const x=await fixture(t);
 const plan=await inspectPortableCrossWorkspaceClosedGraph(x.request);
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const script=`import {applyPortableCrossWorkspaceAssetBundle} from ${JSON.stringify(new URL('../src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js',import.meta.url).href)};`+
  `await applyPortableCrossWorkspaceAssetBundle(JSON.parse(process.env.PLAN),{onPhase:async({phase})=>{if(phase==='outputs-promoted')process.kill(process.pid,'SIGKILL')}});`;
 const dead=spawnSync(process.execPath,['--import','./test/helpers/runtime-content.bootstrap.mjs','--input-type=module','--eval',script],{cwd:process.cwd(),env:{...process.env,PLAN:JSON.stringify(plan)},encoding:'utf8',timeout:60000});
 assert.equal(dead.signal,'SIGKILL',dead.stderr);
 const {readdir}=await import('node:fs/promises');
 const ids=await readdir(path.join(x.src,'.tiinex/cross-workspace-bundles'));
 assert.equal(ids.length,1);
 const rq=path.join(x.dir,'recovery.json');
 await writeFile(rq,JSON.stringify({transactionId:ids[0],sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace}));
 const cli=path.join(process.cwd(),'tools/tiinex-portable.mjs');
 const res=spawnSync(process.execPath,[cli,'recover-cross-workspace-closed-graph','--request',rq,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:60000});
 assert.equal(res.status,0,res.stderr||res.stdout);
 assert.equal(JSON.parse(res.stdout).disposition,'rolled-back');
 for(const [name,expected] of [[rootPath,x.root],[childPath,x.child],[grandPath,x.grand]])
  assert.equal(await readFile(path.join(x.src,name),'utf8'),expected);
 assert.deepEqual(await readFile(path.join(x.src,imagePath)),png);
 for(const m of plan.moves)assert.equal(await exists(path.join(x.dst,m.toPath)),false);
 for(const r of [x.src,x.dst])assert.equal(await exists(path.join(r,'.tiinex/lineage-maintenance.lock')),false);
});
