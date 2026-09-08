#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2),roots={};for(let i=0;i<args.length;i+=2){if(!['--core','--app','--site','--playthings'].includes(args[i])||!args[i+1])throw Error('Usage: node tools/qualify-source-set.mjs --core <path> --app <path> --site <path> --playthings <path>');roots[args[i].slice(2)]=path.resolve(args[i+1]);}
for(const name of ['core','app','site','playthings'])if(!roots[name])throw Error('Missing --'+name);
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'tiinex-full-qualification-')),receipts=[];
const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(command,argv,cwd){const start=Date.now();const result=spawnSync(command,argv,{cwd,encoding:'utf8',timeout:600000,maxBuffer:32*1024*1024,shell:process.platform==='win32'&&command===npm});receipts.push({command:[command,...argv],cwd,exit:result.status,ms:Date.now()-start,stdout:result.stdout,stderr:result.stderr});if(result.error||result.status!==0)throw Error('Qualification failed: '+argv.join(' ')+'\n'+result.stderr);return result.stdout;}
try {
 for(const [name,root] of Object.entries(roots))await fs.cp(root,path.join(tmp,name),{recursive:true,filter:source=>!path.relative(root,source).split(path.sep).some(p=>['.git','node_modules','.release','.site-publish','.env','.npmrc'].includes(p)||p.startsWith('.env.'))});
 const packs={};for(const name of ['core','app','playthings']){const info=JSON.parse(run(npm,['pack','--ignore-scripts','--json','--pack-destination',tmp],path.join(tmp,name)))[0];packs[info.name]='file:'+path.join(tmp,info.filename);}
 const site=JSON.parse(await fs.readFile(path.join(tmp,'site/package.json'),'utf8'));
 const dependencies={...site.dependencies,...site.devDependencies,...packs};
 await fs.writeFile(path.join(tmp,'package.json'),JSON.stringify({name:'tiinex-isolated-qualification',private:true,type:'module',dependencies},null,2));
 run(npm,['install','--ignore-scripts','--no-audit','--no-fund'],tmp);
 run(npm,['ci','--ignore-scripts','--no-audit','--no-fund'],tmp);
 for(const [name,task] of [['core','validate'],['app','validate'],['playthings','check'],['site','validate']])run(npm,['run',task],path.join(tmp,name));
 run(process.platform==='win32'?'python':'python3',['tools/browser-smoke.py'],path.join(tmp,'site'));
 await fs.writeFile(path.join(tmp,'qualification.json'),JSON.stringify({status:'passed',sourceRoots:roots,receipts},null,2));console.log('FULL PACKAGE/BUILD/BROWSER QUALIFICATION PASSED. Receipt: '+path.join(tmp,'qualification.json'));
} catch(error){await fs.writeFile(path.join(tmp,'qualification.json'),JSON.stringify({status:'failed',sourceRoots:roots,error:error.message,receipts},null,2));console.error(error.message+'\nReceipt and untouched-source staging directory: '+tmp);process.exitCode=1;}
// The explicit scratch directory/receipt remains for inspection. The original roots were never mutated.
