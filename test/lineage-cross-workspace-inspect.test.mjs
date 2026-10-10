import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {sealC14nV2Self,canonicalC14nV2SelfState} from '../src/integrity/integrity.c14nV2.js';
import {inspectPortableCrossWorkspaceContinuity,recheckPortableCrossWorkspaceContinuity} from '../src/tooling/portable/adapters/node/lineage.crossWorkspace.inspect.js';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(repo,'tools/tiinex-portable.mjs');
const parentPath='.topics/a/001-parent.trace.md',selectedPath='.topics/a/001-1-child.trace.md';
const targetPath='.topics/anchor/002-anchor.trace.md';
const md=(name,parent=null)=>{
  const rel=parent?path.posix.basename(parent.path):'';
  return sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${rel}](${rel})\n  - Origin:\n    - [relative](${rel})\n`:''}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${name}\n\n---\n\n# ${name}\n\n---\n\n# Continuity Integrity\n\n${parent?`- sha256-base64url-c14n-v2\n  - Towards: [${rel}](${rel})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:''}- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
};
async function pair(t,{references=true,withParent=true}={}){
  const base=await mkdtemp(path.join(os.tmpdir(),'tiinex-dual-workspace-'));
  t.after(()=>rm(base,{recursive:true,force:true}));
  const src=path.join(base,'source');const dst=path.join(base,'target');
  await mkdir(path.join(src,'.topics/a'),{recursive:true});await mkdir(path.join(dst,'.topics/anchor'),{recursive:true});
  await mkdir(path.join(dst,'.topics/notes'),{recursive:true});
  const parent={path:parentPath,markdown:md('Parent')};
  const child=md('Child',withParent?parent:null);
  if(withParent)await writeFile(path.join(src,parentPath),parent.markdown);
  await writeFile(path.join(src,selectedPath),child);
  await writeFile(path.join(src,'.topics/a/001-1-image-01.png'),Buffer.from([137,80,78,71,0,241]));
  await writeFile(path.join(dst,targetPath),md('Anchor'));
  if(references)await writeFile(path.join(dst,'.topics/notes/readme.md'),`[child](source::${selectedPath})`);
  return {src,dst,request:{sourceWorkspace:{workspaceRoot:src,workspaceId:'source'},targetWorkspace:{workspaceRoot:dst,workspaceId:'target'},
    operation:{kind:'scoped-move',workspaceId:'source',targetWorkspaceId:'target',selectedPath,targetPath,scope:'alone-with-assets',placement:'append',parentPolicy:'keep'},
    publication:{repository:'Tiinex/example',commit:'a'.repeat(40),sourcePath:selectedPath},availableTools:[{id:'github-fetch-file',name:'GitHub fetch file',description:'read GitHub repository file'}]}};
}
test('two physical Workspaces expose incoming target reader, outgoing preserved Parent, selected image and separate snapshots',async t=>{
 const x=await pair(t);
 const r=await inspectPortableCrossWorkspaceContinuity(x.request);
 assert.equal(r.status,'blocked');assert.equal(r.inspectionStatus,'qualified');assert.equal(r.executable,false);
 assert.equal(r.workspaceSnapshots.length,2);
 assert.equal(r.selection.status,'ready');assert.deepEqual(r.assetPaths,['.topics/a/001-1-image-01.png']);
 assert.equal(r.inboundReferences.length,1);assert.equal(r.inboundReferences[0].fromWorkspaceId,'target');
 assert.equal(r.inboundReferences[0].toWorkspaceId,'source');
 assert.equal(r.outboundParentDependencies.length,1);assert.equal(r.outboundParentDependencies[0].parentPath,parentPath);
 assert.equal(r.parentPublicationRecoveries.length,1);
 assert.equal(r.parentPublicationRecoveries[0].recovery.request.sourcePath,parentPath);
 assert.equal(r.parentPublicationRecoveries[0].recovery.hostAction.status,'ready');
 assert.equal(r.publicationRecovery.status,'unresolved');assert.equal(r.publicationRecovery.hostAction.status,'ready');
 assert.ok(r.findings.some(f=>f.code==='cross-workspace.inspect.cross-workspace-transaction-unqualified'));
 assert.ok(r.boundary.atomicTwoRootApplyMissing);
});
test('even zero incoming/outgoing edges never authorizes cross-Workspace Apply',async t=>{
 const x=await pair(t,{references:false,withParent:false});
 const r=await inspectPortableCrossWorkspaceContinuity(x.request);
 assert.equal(r.inspectionStatus,'qualified');assert.equal(r.inboundReferences.length,0);assert.equal(r.outboundParentDependencies.length,0);
 assert.equal(r.executable,false);assert.equal(r.status,'blocked');
});
test('unqualified target anchor, same roots and symlinks block before any mutation',async t=>{
 const x=await pair(t);
 const bad=await inspectPortableCrossWorkspaceContinuity({...x.request,operation:{...x.request.operation,targetPath:'.topics/anchor/999-missing.trace.md'}});
 assert.equal(bad.status,'blocked');assert.ok(bad.findings.some(f=>f.code==='cross-workspace.inspect.anchor-unqualified'));
 const reused=await inspectPortableCrossWorkspaceContinuity({...x.request,targetWorkspace:{...x.request.targetWorkspace,workspaceRoot:x.src}});
 assert.equal(reused.status,'blocked');assert.equal(reused.findings[0].code,'cross-workspace.inspect.request-invalid');
 await symlink(path.join(x.src,selectedPath),path.join(x.src,'.topics/a/symlink.trace.md'));
 const broken=await inspectPortableCrossWorkspaceContinuity(x.request);
 assert.equal(broken.status,'blocked');assert.equal(broken.findings[0].code,'cross-workspace.inspect.inventory-unqualified');
});
test('actual portable CLI presents blocked inspection and read-only GitHub connector recovery, with unchanged files',async t=>{
 const x=await pair(t);const requestPath=path.join(path.dirname(x.src),'request.json');await writeFile(requestPath,JSON.stringify(x.request));
 const before=await readFile(path.join(x.src,selectedPath));
 const proc=spawnSync(process.execPath,[cli,'inspect-cross-workspace-continuity','--request',requestPath,'--compact'],{cwd:repo,encoding:'utf8',timeout:45000});
 assert.equal(proc.status,2,proc.stderr||proc.stdout.slice(0,600));const output=JSON.parse(proc.stdout);
 assert.equal(output.inspectionStatus,'qualified');assert.equal(output.executable,false);
 assert.equal(output.publicationRecovery.hostAction.status,'ready');
 assert.deepEqual(await readFile(path.join(x.src,selectedPath)),before);
});

test('both source and target physical snapshots must still match; neither recheck nor preview authorizes Apply',async t=>{
 const x=await pair(t);const before=await inspectPortableCrossWorkspaceContinuity(x.request);
 const rq={inspection:before,sourceWorkspace:x.request.sourceWorkspace,targetWorkspace:x.request.targetWorkspace};
 const same=await recheckPortableCrossWorkspaceContinuity(rq);
 assert.equal(same.status,'ready');assert.equal(same.executable,false);
 await writeFile(path.join(x.dst,'.topics/notes/extra.md'),'new reader after inspection');
 const after=await recheckPortableCrossWorkspaceContinuity(rq);assert.equal(after.status,'blocked');
 assert.ok(after.findings.some(x=>x.code==='cross-workspace.inspect.workspace-snapshot-drift'));
 const replaced=await recheckPortableCrossWorkspaceContinuity({...rq,targetWorkspace:{...rq.targetWorkspace,workspaceRoot:x.src}});
 assert.equal(replaced.status,'blocked');
});

test('both Workspace inventories detect reference-style Markdown, HTML and CSS readers to moved PNG and trace',async t=>{
  for(const reference of [
    {kind:'markdown-definition-image',text:'![picture][asset]\n\n[asset]: source::.topics/a/001-1-image-01.png'},
    {kind:'markdown-definition-artifact',text:'[source][ref]\n[ref]: source::.topics/a/001-1-child.trace.md'},
    {kind:'html-quoted-image',text:'<img src="source::.topics/a/001-1-image-01.png">'},
    {kind:'html-unquoted-image',text:'<img src=source::.topics/a/001-1-image-01.png>'},
    {kind:'css-url-image',text:'<style>.photo { background:url(source::.topics/a/001-1-image-01.png) }</style>'},
    {kind:'markdown-url-query',text:'![x](source::.topics/a/001-1-image-01.png?raw=1)'},
    {kind:'percent-encoded-asset',text:'![x](source::.topics/a/001-1-image-01%2Epng)'},
    {kind:'html-encoded-asset',text:'<img src=source::.topics/a/001-1-image-01%2Epng>'}
  ]) {
    await t.test(reference.kind,async t=>{
      const pairInput=await pair(t,{references:false,withParent:false});
      await writeFile(path.join(pairInput.dst,'.topics/notes/readme.md'),reference.text);
      const result=await inspectPortableCrossWorkspaceContinuity(pairInput.request);
      assert.equal(result.inspectionStatus,'qualified',JSON.stringify(result.findings));
      assert.equal(result.inboundReferences.length,1,JSON.stringify(result.inboundReferences));
      assert.equal(result.inboundReferences[0].fromWorkspaceId,'target');
      assert.equal(result.inboundReferences[0].toWorkspaceId,'source');
      assert.equal(result.executable,false);
    });
  }
});

test('source-local Markdown reference definitions outside selected selection remain incoming readers',async t=>{
  const x=await pair(t,{references:false,withParent:false});
  await writeFile(path.join(x.src,'.topics/a/unselected.md'),'[capture]: 001-1-image-01.png');
  const out=await inspectPortableCrossWorkspaceContinuity(x.request);
  assert.equal(out.inboundReferences.length,1,JSON.stringify(out.inboundReferences));
  assert.equal(out.inboundReferences[0].fromPath,'.topics/a/unselected.md');
});

test('third Workspace reader is reported with exact source identity and no mutation authority',async t=>{
 const x=await pair(t,{references:false,withParent:false});
 const third=path.join(path.dirname(x.src),'third');
 await mkdir(path.join(third,'.topics/notes'),{recursive:true});
 const readerPath=path.join(third,'.topics/notes/reader.md');
 const reader=`[retained source](source::${selectedPath})`;
 await writeFile(readerPath,reader);
 const request={...x.request,additionalWorkspaces:[{workspaceId:'third',workspaceRoot:third}]};
 const before=await readFile(path.join(x.src,selectedPath));
 const inspect=await inspectPortableCrossWorkspaceContinuity(request);
 assert.equal(inspect.inspectionStatus,'qualified',JSON.stringify(inspect.findings));
 assert.equal(inspect.executable,false);assert.equal(inspect.workspaceSnapshots.length,3);
 assert.equal(inspect.inboundReferences.length,1,JSON.stringify(inspect.inboundReferences));
 assert.equal(inspect.inboundReferences[0].fromWorkspaceId,'third');
 assert.equal(inspect.inboundReferences[0].toWorkspaceId,'source');
 assert.ok(inspect.findings.some(f=>f.code==='cross-workspace.inspect.incoming-references-require-rebind'));
 const requestPath=path.join(path.dirname(x.src),'third-reader-request.json');
 await writeFile(requestPath,JSON.stringify(request));
 const cliResult=spawnSync(process.execPath,[cli,'inspect-cross-workspace-continuity','--request',requestPath,'--compact'],
   {cwd:repo,encoding:'utf8',timeout:45000});
 assert.equal(cliResult.status,2,cliResult.stderr||cliResult.stdout);
 const received=JSON.parse(cliResult.stdout);assert.equal(received.workspaceSnapshots.length,3);
 assert.equal(received.inboundReferences[0].fromWorkspaceId,'third');
 assert.deepEqual(await readFile(path.join(x.src,selectedPath)),before);
 assert.equal(await readFile(readerPath,'utf8'),reader);
});

test('third Workspace snapshot is independently rechecked, and missing/ambiguous roots BLOCK',async t=>{
 const x=await pair(t,{references:false,withParent:false});
 const third=path.join(path.dirname(x.src),'third');
 await mkdir(path.join(third,'.topics/notes'),{recursive:true});
 const watched=path.join(third,'.topics/notes/report.md');
 await writeFile(watched,'Unrelated local context.');
 const w={workspaceId:'third',workspaceRoot:third};
 const request={...x.request,additionalWorkspaces:[w]};
 const inspected=await inspectPortableCrossWorkspaceContinuity(request);
 assert.equal(inspected.inspectionStatus,'qualified');assert.equal(inspected.inboundReferences.length,0);
 assert.equal(inspected.executable,false);assert.equal(inspected.workspaceSnapshots.length,3);
 assert.equal((await recheckPortableCrossWorkspaceContinuity({inspection:inspected,...request})).status,'ready');
 const missing=await recheckPortableCrossWorkspaceContinuity({inspection:inspected,
   sourceWorkspace:request.sourceWorkspace,targetWorkspace:request.targetWorkspace});
 assert.equal(missing.status,'blocked');
 assert.ok(missing.findings.some(f=>f.code==='cross-workspace.inspect.workspace-root-drift'));
 await writeFile(watched,`[late incoming reader](source::${selectedPath})`);
 const drift=await recheckPortableCrossWorkspaceContinuity({inspection:inspected,...request});
 assert.equal(drift.status,'blocked');
 assert.ok(drift.findings.some(f=>f.workspaceId==='third'&&f.code==='cross-workspace.inspect.workspace-snapshot-drift'));
 const duplicate=await inspectPortableCrossWorkspaceContinuity({...request,additionalWorkspaces:[{...w,workspaceId:'target'}]});
 assert.equal(duplicate.status,'blocked');
 assert.equal(duplicate.findings[0].code,'cross-workspace.inspect.workspace-census-invalid');
});
