import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, symlink, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { projectPortableAgentRoleSync } from '../src/tooling/portable/agent.roleSync.js';
import { runPortableAgentRoleSyncNode } from '../src/tooling/portable/adapters/node/agent.roleSync.node.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const ROLE = process.env.TIINEX_TEST_BUSINESS_ROOT
 ? path.join(process.env.TIINEX_TEST_BUSINESS_ROOT,'.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md')
 : '/mnt/data/tiinex-project-business/.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md';
const TARGET = '.github/agents/tiinex-anchor.agent.md';

test('Core Role agent projection does not grant role holder or execute tools; preserves human edits', async () => {
  const role = await readFile(ROLE,'utf8');
  const first=projectPortableAgentRoleSync({roleMarkdown:role,rolePath:ROLE,targetPath:TARGET});
  assert.equal(first.status,'ready'); assert.equal(first.action,'create');
  assert.match(first.outputMarkdown,/user-invocable: false/);
  assert.doesNotMatch(first.outputMarkdown,/^tools:|^handoffs:|^model:/m);
  assert.match(first.outputMarkdown,/does NOT assign a Tiinex holder/);
  assert.equal(projectPortableAgentRoleSync({roleMarkdown:role,rolePath:ROLE,targetPath:TARGET,currentMarkdown:first.outputMarkdown}).action,'noop');
  const withCustom=first.outputMarkdown.replace('user-invocable: false','user-invocable: false\ncustom-extension-key: "hello" # keep').concat('\n## Human notes\nNever overwrite this section.\n');
  const next=projectPortableAgentRoleSync({roleMarkdown:role,rolePath:ROLE,targetPath:TARGET,currentMarkdown:withCustom});
  assert.equal(next.status,'ready'); assert.equal(next.action,'noop'); assert.equal(next.outputMarkdown,withCustom);
  // A genuinely newer exact Role snapshot regenerates only the owned body.
  const changedRole=sealC14nV2Self(role.replace('Role Kind: Tiinex architecture', 'Role Kind: Tiinex bounded architecture'));
  assert.equal(changedRole.state,'sealed');
  const updated=projectPortableAgentRoleSync({roleMarkdown:changedRole.markdown,rolePath:ROLE,targetPath:TARGET,currentMarkdown:withCustom});
  assert.equal(updated.status,'ready'); assert.equal(updated.action,'replace');
  assert.match(updated.outputMarkdown,/Role kind:\*\* Tiinex bounded architecture/);
  assert.match(updated.outputMarkdown,/custom-extension-key: "hello" # keep/);
  assert.match(updated.outputMarkdown,/Never overwrite this section/);
  // Even when Core regenerates its own region, the trailing human text and
  // its CRLF boundary must remain byte-exact, not silently normalized to LF.
  const crlfSuffix='\r\n## User-maintained section\r\ncustom CRLF text\r\n';
  const withCrlf=first.outputMarkdown.replace('<!-- tiinex:agent-role:end -->\n', '<!-- tiinex:agent-role:end -->'+crlfSuffix);
  const refreshed=projectPortableAgentRoleSync({roleMarkdown:changedRole.markdown,rolePath:ROLE,targetPath:TARGET,currentMarkdown:withCrlf});
  assert.equal(refreshed.status,'ready'); assert.equal(refreshed.action,'replace');
  assert.ok(refreshed.outputMarkdown.endsWith(crlfSuffix), 'human CRLF suffix survives Core regenerate verbatim');
  const corrupted=withCustom.replace('Qualified Role presentation only','Authority to execute anything');
  assert.equal(projectPortableAgentRoleSync({roleMarkdown:role,targetPath:TARGET,currentMarkdown:corrupted}).code,'agent-sync.generated-region-edited');
  const granting=withCustom.replace('user-invocable: false','tools: ["execute_shell"]');
  assert.equal(projectPortableAgentRoleSync({roleMarkdown:role,targetPath:TARGET,currentMarkdown:granting}).code,'agent-sync.frontmatter-role-invocation-conflict');
  assert.equal(projectPortableAgentRoleSync({roleMarkdown:role,targetPath:TARGET,currentMarkdown:'# unmanaged existing file'}).code,'agent-sync.frontmatter-invalid');
  assert.equal(projectPortableAgentRoleSync({roleMarkdown:role,targetPath:'.github/agents/my-agent.agent.md'}).code,'agent-sync.target-role-mismatch');
  assert.equal(projectPortableAgentRoleSync({roleMarkdown:'some random unqualified stuff',targetPath:TARGET}).code,'agent-sync.role-unqualified');
});

test('Node plan/check/apply uses exact approved plan hash and rejects unsafe targets and symlink',async (t)=>{
 const folder=await mkdtemp(path.join(os.tmpdir(),'tiinex-agent-sync-test-'));
 t.after(async()=>{await (await import('node:fs/promises')).rm(folder,{recursive:true,force:true});});
 const request={workspace:folder,roleFile:ROLE,target:TARGET};
 const p=await runPortableAgentRoleSyncNode({...request,mode:'plan'});
 assert.equal(p.status,'ready'); assert.equal(p.action,'create');
 const denied=await runPortableAgentRoleSyncNode({...request,mode:'apply',approved:false,expectedAfterSha256:p.afterSha256});
 assert.equal(denied.code,'agent-sync.approval-required');
 assert.equal((await runPortableAgentRoleSyncNode({...request,mode:'apply',approved:true,expectedAfterSha256:'0'.repeat(64)})).code,'agent-sync.approved-plan-stale');
 const applied=await runPortableAgentRoleSyncNode({...request,mode:'apply',approved:true,expectedAfterSha256:p.afterSha256});
 assert.equal(applied.status,'ready'); assert.equal(applied.applied,true);
 assert.equal((await runPortableAgentRoleSyncNode({...request,mode:'check'})).status,'ready');
 const target=path.join(folder,TARGET);
 const content=await readFile(target,'utf8');
 assert.equal(content,p.preview);
 await writeFile(target,content.replace('user-invocable: false','user-invocable: false\ncustom-key: custom')+'\n<!-- User: kept -->\n');
 assert.equal((await runPortableAgentRoleSyncNode({...request,mode:'check'})).status,'ready');
 await writeFile(target,content.replace('## In scope','## In scope changed'));
 assert.equal((await runPortableAgentRoleSyncNode({...request,mode:'check'})).code,'agent-sync.generated-region-edited');
 assert.equal((await readFile(target,'utf8')).includes('changed'),true);
 assert.equal((await runPortableAgentRoleSyncNode({...request,target:'../out-of-workspace.agent.md'})).code,'agent-sync.target-outside-agent-directory');
 const symdir=path.join(folder,'linked'); await mkdir(symdir); await symlink(symdir,path.join(folder,'.github','agents','bad.agent.md'));
 assert.equal((await runPortableAgentRoleSyncNode({...request,target:'.github/agents/bad.agent.md'})).code,'agent-sync.symlink-denied');
});
