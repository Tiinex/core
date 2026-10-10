import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { inspectNodeCrossWorkspaceGitSource } from '../src/tooling/portable/adapters/node/lineage.gitSource.inspect.js';
const md=sealC14nV2Self('# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: Git parent\n\n---\n\n# Parent\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: ').markdown+'\n';
const pathRel='.topics/test/001-parent.trace.md';
function cmd(dir,args){const r=spawnSync('git',args,{cwd:dir,encoding:'utf8',timeout:12000});assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
test('local immutable Git commit is a candidate only; real GitHub publication still requires read-only connector evidence',async t=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-cross-git-'));
 t.after(()=>rm(dir,{recursive:true,force:true}));
 cmd(dir,['init','--quiet']);cmd(dir,['config','user.name','Test']);cmd(dir,['config','user.email','test@example.invalid']);
 cmd(dir,['remote','add','origin','https://github.com/Tiinex/fixture.git']);
 await mkdir(path.join(dir,'.topics/test'),{recursive:true});await writeFile(path.join(dir,pathRel),md);
 cmd(dir,['add','.topics']);cmd(dir,['commit','--quiet','-m','fixture']);const commit=cmd(dir,['rev-parse','HEAD']);
 const result=await inspectNodeCrossWorkspaceGitSource({workspaceRoot:dir,commit,sourcePath:pathRel});
 assert.equal(result.status,'candidate');assert.equal(result.qualifiedPublication,false);
 assert.equal(result.repository,'Tiinex/fixture');assert.equal(result.markdown,md);
 assert.equal(result.proposedPermalink,`https://github.com/Tiinex/fixture/blob/${commit}/${pathRel}`);
 assert.equal(result.boundary.remoteFetch,false);assert.equal(result.boundary.crossWorkspaceApply,false);
 const denied=await inspectNodeCrossWorkspaceGitSource({workspaceRoot:dir,commit,sourcePath:pathRel,expectedSha256:'0'.repeat(64)});
 assert.equal(denied.status,'blocked');assert.equal(denied.findings[0].code,'git-source.content-mismatch');
});
test('sandbox with no Git checkout is directed to alternative read-only provider',async t=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'tiinex-no-git-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const result=await inspectNodeCrossWorkspaceGitSource({workspaceRoot:dir,commit:'a'.repeat(40),sourcePath:pathRel});
 assert.equal(result.status,'blocked');assert.equal(result.recovery.preferred,'GitHub connector/repository-read');
});
