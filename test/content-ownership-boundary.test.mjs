import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(fileURLToPath(new URL('..',import.meta.url)));

async function files(dir){
  const out=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const target=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...await files(target));
    else out.push(target);
  }
  return out;
}

test('Core src contains mechanics rather than maintained first-party Tiinex artifacts',async()=>{
  const srcFiles=await files(path.join(ROOT,'src'));
  const canonical=srcFiles.filter((file)=>/\.(?:trace|workspace)\.md$/i.test(file));
  assert.deepEqual(canonical,[]);
});

test('Core src/schemas contains generic mechanics rather than first-party schema-family files',async()=>{
  const schemaFiles=await files(path.join(ROOT,'src','schemas'));
  const firstParty=schemaFiles.filter((file)=>/tiinex\..*\.schema\.(?:md|js|json)$/i.test(path.basename(file)) || /\.schema\.md$/i.test(file));
  assert.deepEqual(firstParty,[]);
});


test('Core product mechanics do not hardcode replaceable first-party content packages or local recovery paths',async()=>{
  const productFiles=[...(await files(path.join(ROOT,'src'))),...(await files(path.join(ROOT,'tools'))),path.join(ROOT,'package.json')]
    .filter((file)=>/\.(?:js|mjs|cjs|json)$/i.test(file));
  const violations=[];
  for(const file of productFiles){
    const text=await readFile(file,'utf8');
    if(/@tiinex\/(?:native|interop-openai)\b/.test(text) || /\/mnt\/data\//.test(text)) violations.push(path.relative(ROOT,file));
  }
  assert.deepEqual(violations,[]);
});
