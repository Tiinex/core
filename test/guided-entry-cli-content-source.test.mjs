import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {commandInput} from '../src/tooling/portable/adapters/cli/cli.command-input.js';

for (const operation of ['project-workspace-carrier-entry','project-transport-completion']) {
 test(`${operation} forwards runtime-qualified native Entry content to projection`,async()=>{
  const folder=await mkdtemp(join(tmpdir(),'tiinex-entry-cli-'));
  try {
   const path=join(folder,'minimal.md');
   await writeFile(path,'# Sample input\n');
   const nativeContentSource={id:'sample-native',roots:['/sample/native/entries'],kind:'content-source'};
   const result=await commandInput({command:operation,positionals:[path],flags:{}},{contentSources:[nativeContentSource]});
   assert.deepEqual(result.input.contentSources,[nativeContentSource]);
   assert.equal(result.input.contentSources[0],nativeContentSource);
   assert.equal(result.input.bundle.findings.filter(x=>x.severity==='error').length,0);
  } finally { await rm(folder,{recursive:true,force:true}); }
 });
}
