import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {runRelease} from '../src/release/run.mjs';
test('release prepares exact source, keeps canonical versions unchanged and detects archive tampering',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'tiinex-release-'));
 const saved=globalThis.fetch;let metadata={name:'@tiinex/fixture',versions:{}};
 const git=(...args)=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
 try{
  await fs.mkdir(path.join(root,'.github'));await fs.mkdir(path.join(root,'src'));
  const original={name:'@tiinex/fixture',version:'0.1.0',type:'module',files:['src'],repository:{url:'git+https://github.com/Tiinex/fixture.git'}};
  await fs.writeFile(path.join(root,'package.json'),JSON.stringify(original));await fs.writeFile(path.join(root,'src/index.js'),'export const ready = true;\n');await fs.writeFile(path.join(root,'.gitignore'),'.release/\n');await fs.writeFile(path.join(root,'.github/release-policy.json'),JSON.stringify({repository:'Tiinex/fixture'}));
  git('init','-b','master');git('config','user.name','Local Test');git('config','user.email','test@example.invalid');git('add','.');git('commit','-m','feat: initial fixture');const commit=git('rev-parse','HEAD');
  globalThis.fetch=async()=>({status:200,ok:true,json:async()=>metadata});
  const env={GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'push',GITHUB_REF:'refs/heads/master',GITHUB_REPOSITORY:'Tiinex/fixture',GITHUB_SHA:commit,TIINEX_ENABLE_NPM_PUBLISH:'true'};
  const plan=await runRelease({cwd:root,argv:['prepare'],env});assert.equal(plan.version,'0.1.0');assert.ok(plan.integrity.startsWith('sha512-'));assert.deepEqual(JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')),original);assert.equal(git('status','--porcelain'),'');
  const tar=path.join(root,plan.file);const listing=spawnSync('tar',['-xOf',tar,'package/package.json'],{encoding:'utf8'});assert.equal(listing.status,0);const packed=JSON.parse(listing.stdout);assert.equal(packed.tiinexRelease.sourceCommit,commit);assert.equal(packed.gitHead,commit);
  metadata.versions['0.1.0']={...packed,dist:{integrity:plan.integrity}};
  const skip=await runRelease({cwd:root,argv:['prepare'],env});assert.equal(skip.action,'skip');
  await fs.writeFile(path.join(root,'src/index.js'),'export const ready = true; export const feature = true;\n');git('add','.');git('commit','-m','feat: second surface');const next=git('rev-parse','HEAD');
  const second=await runRelease({cwd:root,argv:['prepare'],env:{...env,GITHUB_SHA:next}});assert.equal(second.version,'0.2.0');assert.equal(second.previousCommit,commit);
  await fs.appendFile(path.join(root,second.file),'tamper');await assert.rejects(()=>runRelease({cwd:root,argv:['publish'],env:{...env,GITHUB_SHA:next}}),/tampered/);
  await assert.rejects(()=>runRelease({cwd:root,argv:['publish'],env:{...env,GITHUB_REF:'refs/heads/main'}}),/master-only/);
 }finally{globalThis.fetch=saved;await fs.rm(root,{recursive:true,force:true});}
});
