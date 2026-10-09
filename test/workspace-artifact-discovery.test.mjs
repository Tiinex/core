import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { discoverWorkspaceArtifactCandidates, discoverWorkspaceTransitionCatalog } from '../src/tooling/portable/adapters/node/workspaceArtifact.discovery.js';
import { projectPortableTransitionCatalog } from '../src/tooling/portable/transitions/transition.catalog.js';
import { readFile } from 'node:fs/promises';
const transition=await readFile(new URL('fixtures/transitions/create-task-transition-definition.trace.md',import.meta.url),'utf8');
const write=async(root,rel,content)=>{const p=path.join(root,rel);await mkdir(path.dirname(p),{recursive:true});await writeFile(p,content)};
const temporary=async(work)=>{const root=await mkdtemp(path.join(tmpdir(),'tiinex-workspace-topics-'));try{await work(root)}finally{await rm(root,{recursive:true,force:true})}};

test('typed artifact candidates are found across .topics, never by dot folder convention or whole-workspace search',async()=>temporary(async(root)=>{
  for(const target of ['.topics/.transitions/a.trace.md','.topics/work/process-a/b.trace.md','.topics/.custom/preset/c.trace.md','.topics/other/d.trace.md'])await write(root,target,transition);
  await write(root,'.topics/.workspaces/primary.workspace.md','Workspace identity marker');
  await write(root,'.topics/.vscode/ignored.trace.md',transition);
  await write(root,'outside.trace.md',transition);
  await write(root,'.topics/private.png',Buffer.from([0x89,0x50]));
  const result=await discoverWorkspaceArtifactCandidates({root});
  assert.equal(result.status,'ready');assert.equal(result.scannedTraceFiles,4);
  assert.deepEqual(result.candidates.map(x=>x.path),['.topics/.transitions/a.trace.md','.topics/.custom/preset/c.trace.md','.topics/other/d.trace.md','.topics/work/process-a/b.trace.md'].sort((a,b)=>a.localeCompare(b)));
  assert.ok(result.candidates.every(x=>x.schemaId==='tiinex.transition.definition.v1'&&x.qualification==='candidate-only'));
  const catalog=projectPortableTransitionCatalog({files:result.files,outputSchemaId:'tiinex.task.v1'});
  assert.equal(catalog.counts.discovered,4);
  assert.ok(catalog.candidates.every(x=>x.boundary.executable===false));
  const second=await discoverWorkspaceArtifactCandidates({root});
  assert.deepEqual(second.candidates,result.candidates);
}));

test('Workspace scanner fails closed on symlink escape and explicit resource limits',async()=>temporary(async(root)=>{
  await write(root,'.topics/work/a.trace.md',transition);
  await write(root,'elsewhere/out.trace.md',transition);
  await symlink(path.join(root,'elsewhere'),path.join(root,'.topics/escaped'));
  await symlink(path.join(root,'elsewhere/out.trace.md'),path.join(root,'.topics/work/linked.trace.md'));
  const result=await discoverWorkspaceArtifactCandidates({root});
  assert.equal(result.candidates.length,1);
  await assert.rejects(discoverWorkspaceArtifactCandidates({root,maxCandidateFiles:1,maxFileBytes:64}),/file-size-limit/);
  await assert.rejects(discoverWorkspaceArtifactCandidates({root,maxDirectories:1}),/directory-limit/);
  await assert.rejects(discoverWorkspaceArtifactCandidates({root,maxTotalBytes:64}),/total-size-limit/);
}));

test('untyped prose remains unqualified and nested .workspaces never auto-selects primary authority',async()=>temporary(async(root)=>{
  await write(root,'.topics/processes/typed.trace.md',transition);
  await write(root,'.topics/nested/.workspaces/untyped.trace.md','# A Workspace-looking file without Current Schema');
  const result=await discoverWorkspaceArtifactCandidates({root});
  assert.equal(result.candidates.length,1);
  assert.equal(result.primaryWorkspaceCoordinate,'.topics/.workspaces');
  assert.equal(result.scannedTraceFiles,2);
}));

test('Node adapter projects typed Transition catalog without implying applicable preset',async()=>temporary(async(root)=>{
  await write(root,'.topics/some-process/a.trace.md',transition);
  const result=await discoverWorkspaceTransitionCatalog({root,outputSchemaId:'tiinex.task.v1'});
  assert.equal(result.workspaceDiscovery.discoveredTypedTransitions,1);
  assert.equal(result.counts.readQualified,1);
  assert.equal(result.candidates[0].boundary.applicability,'not-evaluated');
  assert.equal(result.candidates[0].boundary.executable,false);
}));
