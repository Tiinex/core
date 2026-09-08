import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const policy = JSON.parse(readFileSync('.github/release-policy.json', 'utf8'));
if (policy.qualified !== true) throw new Error('Release is disabled: finish the declared qualification gates first.');
for (const [name, version] of Object.entries(pkg.dependencies || {})) {
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) throw new Error(`Dependency must be an exact registry version: ${name}`);
}
function npm(args) { const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',args,{encoding:'utf8',shell:process.platform==='win32'}); if(result.error) throw result.error; return result; }
mkdirSync('.release',{recursive:true});
const packed=npm(['pack','--ignore-scripts','--json','--pack-destination','.release']);
if(packed.status!==0)throw new Error(packed.stderr);
const file=JSON.parse(packed.stdout)[0];
const remote=npm(['view',`${pkg.name}@${pkg.version}`,'dist.integrity','--json']);
let publish=false;
if(remote.status===0) {
  if(JSON.parse(remote.stdout)!==file.integrity)throw new Error('Version exists with different package bytes. Increment the package version.');
} else {
  let error; try {error=JSON.parse(remote.stdout || remote.stderr);} catch {throw new Error('Registry check failed; publication is blocked.');}
  if(error.error?.code!=='E404')throw new Error('Registry check failed; publication is blocked: '+remote.stderr);
  publish=true;
}
const plan={name:pkg.name,version:pkg.version,publish,file:'.release/'+file.filename,integrity:file.integrity};
writeFileSync('.release/plan.json',JSON.stringify(plan,null,2)+'\n');
if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`publish=${publish}\nfile=${plan.file}\n`);
console.log(JSON.stringify(plan));
