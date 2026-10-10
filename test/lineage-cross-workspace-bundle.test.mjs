import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {mkdtemp,mkdir,writeFile,readFile,rm,access,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {sealC14nV2Self,canonicalC14nV2SelfState} from '../src/integrity/integrity.c14nV2.js';
import {inspectPortableCrossWorkspaceAssetBundle,applyPortableCrossWorkspaceAssetBundle,recoverPortableCrossWorkspaceAssetBundle} from '../src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js';
const selected='.topics/source/008-example.trace.md';
const asset='.topics/source/008-photo-01.png';
const anchor='.topics/target/002-anchor.trace.md';
const png=Buffer.from([137,80,78,71,13,10,26,10,5,0,255]);
const fixture=()=>sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: sample\n\n---\n\n# Sample\n\n![evidence](008-photo-01.png)\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
const fixtureTarget=()=>sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: target\n\n---\n\n# Target\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
const exists=async p=>access(p).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e;});
async function setup(t){
 const temp=await mkdtemp(path.join(os.tmpdir(),'tiinex-cross-asset-'));t.after(()=>rm(temp,{recursive:true,force:true}));
 const src=path.join(temp,'source'),dst=path.join(temp,'target');
 await mkdir(path.join(src,'.topics/source'),{recursive:true});await mkdir(path.join(dst,'.topics/target'),{recursive:true});
 await writeFile(path.join(src,selected),fixture());await writeFile(path.join(src,asset),png);await writeFile(path.join(dst,anchor),fixtureTarget());
 return {src,dst,request:{sourceWorkspace:{workspaceId:'source',workspaceRoot:src},targetWorkspace:{workspaceId:'target',workspaceRoot:dst},operation:{kind:'scoped-move',workspaceId:'source',targetWorkspaceId:'target',selectedPath:selected,targetPath:anchor,scope:'alone-with-assets',placement:'same',parentPolicy:'keep'}}};
}
test('Cross-Workspace source+PNG qualified projection and physical atomic Apply',async t=>{
 const x=await setup(t);const plan=await inspectPortableCrossWorkspaceAssetBundle(x.request);
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));assert.equal(plan.moves.length,2);
 assert.deepEqual(plan.moves.map(m=>m.toPath).sort(),['.topics/target/003-example.trace.md','.topics/target/003-photo-01.png']);
 const receipt=await applyPortableCrossWorkspaceAssetBundle(plan);
 assert.equal(receipt.status,'ready',JSON.stringify(receipt));
 assert.deepEqual(await readFile(path.join(x.dst,'.topics/target/003-photo-01.png')),png);
 const out=await readFile(path.join(x.dst,'.topics/target/003-example.trace.md'),'utf8');
 assert.equal(canonicalC14nV2SelfState(out).state,'verified');assert.match(out,/!\[evidence\]\(003-photo-01\.png\)/);
 assert.equal(await exists(path.join(x.src,selected)),false);assert.equal(await exists(path.join(x.src,asset)),false);
 const retry=await applyPortableCrossWorkspaceAssetBundle(plan);assert.equal(retry.status,'blocked');
});
test('Cross-Workspace asset rollback restores every source and prevents dangling target output',async t=>{
 const x=await setup(t);const plan=await inspectPortableCrossWorkspaceAssetBundle(x.request);assert.equal(plan.status,'ready');
 const aborted=await applyPortableCrossWorkspaceAssetBundle(plan,{onPhase:async({phase})=>{if(phase==='outputs-promoted')throw Error('fault-after-all-targets');}});
 assert.equal(aborted.status,'blocked');assert.equal(aborted.rollback.status,'ready',JSON.stringify(aborted));
 assert.equal(await readFile(path.join(x.src,selected),'utf8'),fixture());assert.deepEqual(await readFile(path.join(x.src,asset)),png);
 for(const m of plan.moves)assert.equal(await exists(path.join(x.dst,m.toPath)),false);
});
test('Cross-Workspace asset bundle fails closed on incoming reader, Parent or executable source format',async t=>{
 const x=await setup(t);await mkdir(path.join(x.dst,'.topics/notes'),{recursive:true});
 await writeFile(path.join(x.dst,'.topics/notes/reader.md'),`[incoming](source::${selected})`);
 const b=await inspectPortableCrossWorkspaceAssetBundle(x.request);assert.equal(b.status,'blocked');
 await rm(path.join(x.dst,'.topics/notes/reader.md'));
 await writeFile(path.join(x.dst,'.topics/notes/script.ts'),'const f = `${name}.trace.md`;');
 const dynamic=await inspectPortableCrossWorkspaceAssetBundle(x.request);assert.equal(dynamic.status,'blocked');
});
test('Crash during promotion recovers only journal-owned inode links',async t=>{
 const x=await setup(t);const plan=await inspectPortableCrossWorkspaceAssetBundle(x.request);assert.equal(plan.status,'ready');
 const js=`import {applyPortableCrossWorkspaceAssetBundle} from ${JSON.stringify(new URL('../src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js',import.meta.url).href)};await applyPortableCrossWorkspaceAssetBundle(JSON.parse(process.env.PLAN),{onPhase:async({phase})=>{if(phase==='outputs-promoted')process.kill(process.pid,'SIGKILL')}})`;
 const killed=spawnSync(process.execPath,['--input-type=module','--eval',js],{cwd:process.cwd(),env:{...process.env,PLAN:JSON.stringify(plan)},encoding:'utf8',timeout:40000});
 assert.equal(killed.signal,'SIGKILL',killed.stderr);
 const ids=await readdir(path.join(x.src,'.tiinex/cross-workspace-bundles'));assert.equal(ids.length,1);
 const result=await recoverPortableCrossWorkspaceAssetBundle({transactionId:ids[0],sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace});
 assert.equal(result.status,'ready',JSON.stringify(result));assert.equal(result.disposition,'rolled-back');
 assert.deepEqual(await readFile(path.join(x.src,asset)),png);assert.equal(await readFile(path.join(x.src,selected),'utf8'),fixture());
 for(const m of plan.moves)assert.equal(await exists(path.join(x.dst,m.toPath)),false);
});
test('Independent CLI: inspect → Apply → exact-byte verification → replay BLOCK',async t=>{
 const x=await setup(t);const temp=await mkdtemp(path.join(os.tmpdir(),'tiinex-bundle-cli-'));t.after(()=>rm(temp,{recursive:true,force:true}));
 const cli=path.join(process.cwd(),'tools/tiinex-portable.mjs');const rq=path.join(temp,'request.json'),pp=path.join(temp,'plan.json');
 await writeFile(rq,JSON.stringify(x.request));
 const run=(cmd,file)=>{const r=spawnSync(process.execPath,[cli,cmd,cmd.startsWith('plan')?'--request':'--plan',file,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:45000});assert.ok(r.stdout.trim().startsWith('{'),r.stderr);return {code:r.status,...JSON.parse(r.stdout)};};
 const plan=run('plan-cross-workspace-assets',rq);assert.equal(plan.code,0,JSON.stringify(plan.findings));
 await writeFile(pp,JSON.stringify(plan));
 const receipt=run('apply-cross-workspace-assets',pp);assert.equal(receipt.code,0,JSON.stringify(receipt.findings));assert.equal(receipt.applied,true);
 const dst=path.join(x.dst,'.topics/target/003-example.trace.md');assert.equal(canonicalC14nV2SelfState(await readFile(dst,'utf8')).state,'verified');
 assert.deepEqual(await readFile(path.join(x.dst,'.topics/target/003-photo-01.png')),png);
 const replay=run('apply-cross-workspace-assets',pp);assert.equal(replay.code,2);assert.equal(replay.status,'blocked');
});
test('Crash between two output promotions: inode-owned rollback restores both sources',async t=>{
 const x=await setup(t);const plan=await inspectPortableCrossWorkspaceAssetBundle(x.request);assert.equal(plan.status,'ready');
 // Simulate hard process death DURING the second exclusive hardlink. The first
 // promoted output must be recovered without deleting an unowned same-name file.
 const js=`import {applyPortableCrossWorkspaceAssetBundle} from ${JSON.stringify(new URL('../src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js',import.meta.url).href)};`+
 `const plan=JSON.parse(process.env.PLAN);await applyPortableCrossWorkspaceAssetBundle(plan,{onPhase:async({phase})=>{if(phase==='sources-staged'){const p=await import('node:fs/promises');const dest=plan.targetWorkspace.workspaceRoot+'/'+plan.moves[0].toPath;await p.mkdir((await import('node:path')).default.dirname(dest),{recursive:true});const stage=plan.targetWorkspace.workspaceRoot+'/.tiinex/cross-workspace-bundles/'+(await p.readdir(plan.targetWorkspace.workspaceRoot+'/.tiinex/cross-workspace-bundles'))[0]+'/staged-0';await p.link(stage,dest);process.kill(process.pid,'SIGKILL')}}});`;
 const killed=spawnSync(process.execPath,['--input-type=module','--eval',js],{cwd:process.cwd(),env:{...process.env,PLAN:JSON.stringify(plan)},encoding:'utf8',timeout:40000});
 assert.equal(killed.signal,'SIGKILL',killed.stderr);
 const ids=await readdir(path.join(x.src,'.tiinex/cross-workspace-bundles'));assert.equal(ids.length,1);
 const recovery=await recoverPortableCrossWorkspaceAssetBundle({transactionId:ids[0],sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace});
 assert.equal(recovery.status,'ready',JSON.stringify(recovery));assert.deepEqual(await readFile(path.join(x.src,asset)),png);
 for(const m of plan.moves)assert.equal(await exists(path.join(x.dst,m.toPath)),false);
});

test('Explicit additional Workspace cannot be silently ignored or certified as reference-free',async t=>{
 const x=await setup(t);const plan=await inspectPortableCrossWorkspaceAssetBundle({...x.request,additionalWorkspaces:[{workspaceId:'third',workspaceRoot:x.src}]});
 assert.equal(plan.status,'blocked');assert.equal(plan.findings[0].code,'cross-workspace.bundle.additional-workspaces-unqualified');
});
test('Independent manual CLI recovery restores two-root asset bundle after SIGKILL',async t=>{
 const x=await setup(t);const plan=await inspectPortableCrossWorkspaceAssetBundle(x.request);assert.equal(plan.status,'ready');
 const script=`import {applyPortableCrossWorkspaceAssetBundle} from ${JSON.stringify(new URL('../src/tooling/portable/adapters/node/lineage.crossWorkspace.bundle.js',import.meta.url).href)};`+
 `await applyPortableCrossWorkspaceAssetBundle(JSON.parse(process.env.PLAN),{onPhase:async({phase})=>{if(phase==='sources-staged')process.kill(process.pid,'SIGKILL')}});`;
 const killed=spawnSync(process.execPath,['--input-type=module','--eval',script],{cwd:process.cwd(),env:{...process.env,PLAN:JSON.stringify(plan)},encoding:'utf8',timeout:45000});
 assert.equal(killed.signal,'SIGKILL',killed.stderr);
 const ids=await readdir(path.join(x.src,'.tiinex/cross-workspace-bundles'));assert.equal(ids.length,1);
 const temp=await mkdtemp(path.join(os.tmpdir(),'tiinex-bundle-recover-cli-'));t.after(()=>rm(temp,{recursive:true,force:true}));
 const input=path.join(temp,'recovery.json');await writeFile(input,JSON.stringify({transactionId:ids[0],sourceWorkspace:plan.sourceWorkspace,targetWorkspace:plan.targetWorkspace}));
 const cli=path.join(process.cwd(),'tools/tiinex-portable.mjs');
 const r=spawnSync(process.execPath,[cli,'recover-cross-workspace-assets','--request',input,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:45000});
 assert.equal(r.status,0,r.stderr||r.stdout);
 const receipt=JSON.parse(r.stdout);assert.equal(receipt.disposition,'rolled-back');
 assert.deepEqual(await readFile(path.join(x.src,asset)),png);
 assert.equal(await readFile(path.join(x.src,selected),'utf8'),fixture());
 for(const m of plan.moves)assert.equal(await exists(path.join(x.dst,m.toPath)),false);
});
test('Reference-defined Markdown and HTML readers in target Workspace BLOCK artifact+PNG transfer',async t=>{
 for(const content of [
  '[image][x]\n[x]: source::.topics/source/008-photo-01.png',
  '<img src="source::.topics/source/008-photo-01.png">',
  '<img src=source::.topics/source/008-photo-01.png>',
  '<style>.a{background:url(source::.topics/source/008-photo-01.png)}</style>'
 ]){
  await t.test(content.slice(0,24),async t=>{
    const fixture=await setup(t);
    await mkdir(path.join(fixture.dst,'.topics/notes'),{recursive:true});
    await writeFile(path.join(fixture.dst,'.topics/notes/reader.md'),content);
    const plan=await inspectPortableCrossWorkspaceAssetBundle(fixture.request);
    assert.equal(plan.status,'blocked',JSON.stringify(plan));
    assert.equal(plan.inspection.inboundReferences.length,1,JSON.stringify(plan.inspection.inboundReferences));
    assert.equal(await exists(path.join(fixture.src,selected)),true);
    assert.equal(await exists(path.join(fixture.src,asset)),true);
  });
 }
});
test('Selected source artifact with reference-defined owned asset BLOCKS rather than producing stale link',async t=>{
 const x=await setup(t);
 const original=fixture();
 // This source link is not rewritten by the existing inline-Markdown projector.
 const altered=original.replace('![evidence](008-photo-01.png)', '![evidence][image]\n\n[image]: 008-photo-01.png');
 const {sealC14nV2Self}=await import('../src/integrity/integrity.c14nV2.js');
 const revised=sealC14nV2Self(altered).markdown;
 await writeFile(path.join(x.src,selected),revised);
 const plan=await inspectPortableCrossWorkspaceAssetBundle(x.request);
 assert.equal(plan.status,'blocked',JSON.stringify(plan.findings));
 assert.equal(plan.inspection.inspectionStatus,'blocked');
 assert.equal(plan.inspection.unsupportedSelectedReferences[0].kind,'markdown-reference-definition');
 assert.equal(await exists(path.join(x.src,selected)),true);
 assert.equal(await exists(path.join(x.src,asset)),true);
});
