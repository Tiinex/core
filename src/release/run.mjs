import {readFile,writeFile,mkdir,rm,cp,realpath,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {assertPublishContext,readRegistry,releasePlan,compareVersion} from './plan.mjs';
import {parseSemver} from './policy.mjs';
const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(command,args,cwd,{allowFailure=false}={}) {const r=spawnSync(command,args,{cwd,encoding:'utf8',timeout:180000,maxBuffer:32*1024*1024,shell:process.platform==='win32'&&command===npm});if(r.error||(!allowFailure&&r.status!==0))throw Error(`${command} ${args[0]} failed: ${r.error?.message||r.stderr||r.stdout}`);return r;}
/** Release state is registry metadata, not mutable package.json commits or movable tags.
 * Staging changes only version metadata. The tested source commit is recorded in the tarball.
 * Caller may invoke prepare for preview; publish independently rechecks master and digest.
 */
export async function runRelease({cwd=process.cwd(),argv=process.argv.slice(2),env=process.env}={}) {
 cwd=await realpath(cwd);const command=argv[0]||'preview';
 if(!['preview','prepare','publish','bootstrap'].includes(command))throw Error('Use preview, prepare, publish or bootstrap.');
 const pkg=JSON.parse(await readFile(path.join(cwd,'package.json'),'utf8'));
 const policy=JSON.parse(await readFile(path.join(cwd,'.github/release-policy.json'),'utf8'));
 const repository=policy.repository;
 if(pkg.repository?.url!==`git+https://github.com/${repository}.git`||!repository.startsWith('Tiinex/'))throw Error('release.repository.mismatch');
 const git=(args,opts)=>run('git',args,cwd,opts);
 const head=git(['rev-parse','HEAD']).stdout.trim();
 if(command==='publish') {
  assertPublishContext(env,repository);
  const p=JSON.parse(await readFile(path.join(cwd,'.release/plan.json'),'utf8'));
  if(p.sourceCommit!==head||env.GITHUB_SHA!==head)throw Error('release.commit-changed');
  if(p.action==='skip'){console.log(JSON.stringify(p));return p;}
  const file=path.resolve(cwd,p.file);if(path.dirname(file)!==path.join(cwd,'.release'))throw Error('release.archive-path');
  const bytes=await readFile(file);if(createHash('sha512').update(bytes).digest('base64')!==p.integrity.slice(7))throw Error('release.archive-tampered');
  const meta=await readRegistry(pkg.name);const existing=meta.versions[p.version];
  if(existing){if(existing.dist?.integrity!==p.integrity)throw Error('release.version.collision');console.log('Already published exact archive');return p;}
  const latest=Object.values(meta.versions).filter(v=>!parseSemver(v.version).prerelease).sort((a,b)=>compareVersion(a.version,b.version)).at(-1);
  if(latest&&compareVersion(latest.version,p.version)>=0)throw Error('release.newer-version-already-published');
  const result=run(npm,['publish',file,'--ignore-scripts','--access','public','--tag','latest','--provenance'],cwd,{allowFailure:true});
  if(result.status!==0){const check=await readRegistry(pkg.name);if(check.versions[p.version]?.dist?.integrity!==p.integrity)throw Error('release.publish.failed: '+result.stderr);}
  console.log(JSON.stringify({...p,published:true}));return p;
 }
 if(command==='prepare') {assertPublishContext(env,repository);if(env.GITHUB_SHA!==head)throw Error('release.checkout-is-not-event-commit');}
 if(command==='bootstrap' && git(['branch','--show-current']).stdout.trim()!=='master')throw Error('release.bootstrap.master-only');
 if(git(['status','--porcelain','--untracked-files=no']).stdout.trim())throw Error('release.dirty-source');
 const metadata=await readRegistry(pkg.name);
 if(command==='bootstrap'&&Object.keys(metadata.versions).length)throw Error('Package exists: configure OIDC and use the master workflow, not bootstrap.');
 if(command==='bootstrap') { const check=pkg.scripts?.validate?'validate':pkg.scripts?.check?'check':'test'; run(npm,['run',check],cwd); }
 const previous=Object.values(metadata.versions).filter(v=>!parseSemver(v.version).prerelease).sort((a,b)=>compareVersion(a.version,b.version)).at(-1);
 let messages=[], previousCommit=previous?.tiinexRelease?.sourceCommit||previous?.gitHead;
 if(previous) {
  if(!previousCommit||!/^[a-f0-9]{40,64}$/.test(previousCommit))throw Error('release.previous-source-unavailable: migrate registry/git baseline explicitly');
  const ancestor=git(['merge-base','--is-ancestor',previousCommit,head],{allowFailure:true});
  if(ancestor.status!==0){
   const superseded=git(['merge-base','--is-ancestor',head,previousCommit],{allowFailure:true});
   if(superseded.status===0){const skipped={action:'skip',reason:'superseded-master-commit',sourceCommit:head,version:previous.version};await mkdir(path.join(cwd,'.release'),{recursive:true});await writeFile(path.join(cwd,'.release/plan.json'),JSON.stringify(skipped,null,2));return skipped;}
   throw Error('release.divergent-or-shallow-history: full history containing registry source is required');
  }
  messages=git(['log','--format=%B%x00',`${previousCommit}..${head}`]).stdout.split('\0').filter(Boolean);
 } else messages=git(['log','-1','--format=%B']).stdout.split('\0');
 const plan=releasePlan({pkg,metadata,sourceCommit:head,messages});
 if(command==='preview'){console.log(JSON.stringify(plan,null,2));return plan;}
 const dir=path.join(cwd,'.release');await rm(dir,{recursive:true,force:true});await mkdir(dir);
 if(plan.action==='skip'){await writeFile(path.join(dir,'plan.json'),JSON.stringify(plan,null,2));console.log(JSON.stringify(plan));return plan;}
 const stage=path.join(dir,'stage');await mkdir(stage);
 // Excludes ignored/untracked work by definition, and never uses a dirty worktree.
 const files=git(['ls-files','-z']).stdout.split('\0').filter(Boolean);
 for(const rel of files){if(rel.startsWith('.release/')||rel.startsWith('node_modules/')||rel.startsWith('.git/'))continue;const from=path.resolve(cwd,rel),to=path.resolve(stage,rel);if(!to.startsWith(stage+path.sep))throw Error('release.path-escape');await mkdir(path.dirname(to),{recursive:true});await cp(from,to,{dereference:false});}
 const staged={...pkg,version:plan.version,gitHead:head,tiinexRelease:{policy:plan.policy,sourceCommit:head,sourceTree:git(['rev-parse','HEAD^{tree}']).stdout.trim(),repository,previousVersion:plan.previousVersion}};
 await writeFile(path.join(stage,'package.json'),JSON.stringify(staged,null,2)+'\n');
 const lockPath=path.join(stage,'package-lock.json');try{const lock=JSON.parse(await readFile(lockPath,'utf8'));lock.version=plan.version;if(lock.packages?.[''])lock.packages[''].version=plan.version;await writeFile(lockPath,JSON.stringify(lock,null,2)+'\n');}catch(e){if(e.code!=='ENOENT')throw e;}
 const packed=JSON.parse(run(npm,['pack','--ignore-scripts','--json','--pack-destination',dir],stage).stdout)[0];
 const receipt={...plan,file:'.release/'+packed.filename,integrity:packed.integrity,bytes:packed.size};
 await writeFile(path.join(dir,'plan.json'),JSON.stringify(receipt,null,2)+'\n');await rm(stage,{recursive:true,force:true});
 if(command==='bootstrap') {
  console.log('One-time manual publication under latest dist-tag; requires npm login and 2FA.');
  const r=spawnSync(npm,['publish',path.join(cwd,receipt.file),'--ignore-scripts','--access','public','--tag','latest','--provenance=false'],{cwd,stdio:'inherit',shell:process.platform==='win32'});if(r.status!==0)throw Error('release.bootstrap.publish-failed');
 }
 console.log(JSON.stringify(receipt,null,2));return receipt;
}
