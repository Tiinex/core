import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { initializePortableNodeRuntime } from '../src/tooling/portable/adapters/node/portableRuntime.initialize.js';
import { projectPortableEntryCatalog } from '../src/tooling/portable/entry/entry.catalog.js';
import { projectPortableProcessCatalog } from '../src/tooling/portable/process/process.catalog.js';
import { projectPortableScaffoldCatalog } from '../src/scaffolds/scaffold.catalog.js';

const ROOT=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const nativeRoot=path.resolve(String(process.env.TIINEX_TEST_NATIVE_ROOT || path.resolve(ROOT,'..','native')));
const nativeAvailable=existsSync(path.join(nativeRoot,'package.json')) && existsSync(path.join(nativeRoot,'.topics','.schemas'));
const integrationTest=nativeAvailable ? test : test.skip;

test('Core mechanics remain importable and explicit runtime initialization fails closed when no content source is selected',async()=>{
  const publicCore=await import('../src/public/index.js');
  assert.ok(publicCore);
  const runtime=await initializePortableNodeRuntime({runtimeRoot:ROOT,contentSources:[],discoverBundled:false,discoverInstalled:false,environmentContentRoots:''});
  assert.equal(runtime.status,'no-schema-content-source');
  assert.equal(runtime.contentSources.length,0);
  assert.equal(runtime.schemaRuntime,null);
});

integrationTest('Native can be selected normally and replaced by a differently named package carrying the same registered surfaces',async(t)=>{
  const native=await discoverLocalTiinexContentSource({root:nativeRoot});
  assert.equal(native.status,'ready');
  const nativeRuntime=await initializePortableNodeRuntime({runtimeRoot:ROOT,contentSources:[native],discoverBundled:false,discoverInstalled:false,environmentContentRoots:''});
  assert.equal(nativeRuntime.status,'ready');
  assert.equal(nativeRuntime.schemaRuntime.schemas.total,109);
  assert.ok(nativeRuntime.schemaRuntime.schemas.specialized>0);

  const customRoot=await mkdtemp(path.join(os.tmpdir(),'tiinex-custom-content-'));
  t.after(()=>rm(customRoot,{recursive:true,force:true}));
  await writeFile(path.join(customRoot,'package.json'),`${JSON.stringify({
    name:'@example/custom-defaults',version:'1.0.0',files:['.topics'],
    tiinex:{contentSource:{registeredSurfaces:'recursive',executableSchemaCompanions:true,workspaceIds:['custom']}}
  },null,2)}\n`,'utf8');
  await mkdir(path.join(customRoot,'.topics'),{recursive:true});
  for(const surface of ['.schemas','.entries','.processes','.scaffolds']){
    const source=path.join(nativeRoot,'.topics',surface);
    if(existsSync(source)) await cp(source,path.join(customRoot,'.topics',surface),{recursive:true});
  }

  const custom=await discoverLocalTiinexContentSource({root:customRoot});
  assert.equal(custom.status,'ready');
  assert.equal(custom.source.id,'@example/custom-defaults');
  assert.ok((custom.source.capabilities.workspaceIds||[]).includes('custom'));
  const customRuntime=await initializePortableNodeRuntime({runtimeRoot:ROOT,contentSources:[custom],discoverBundled:false,discoverInstalled:false,environmentContentRoots:''});
  assert.equal(customRuntime.status,'ready');
  assert.equal(customRuntime.schemaRuntime.schemas.total,nativeRuntime.schemaRuntime.schemas.total);
  assert.equal(customRuntime.schemaRuntime.schemas.specialized,nativeRuntime.schemaRuntime.schemas.specialized);

  const entries=projectPortableEntryCatalog({contentSources:[custom]});
  const processes=projectPortableProcessCatalog({contentSources:[custom]});
  const scaffolds=projectPortableScaffoldCatalog({contentSources:[custom]});
  assert.equal(entries.status,'ready');
  assert.ok(entries.entries.length>0);
  assert.ok(entries.entries.every((entry)=>entry.sourceId==='@example/custom-defaults'));
  assert.equal(processes.status,'ready');
  assert.ok(processes.processes.length>0);
  assert.ok(processes.processes.every((process)=>process.sourceId==='@example/custom-defaults'));
  assert.equal(scaffolds.status,'ready');
  assert.ok(scaffolds.scaffolds.length>0);
  assert.ok(scaffolds.scaffolds.every((scaffold)=>scaffold.sourceId==='@example/custom-defaults'));
});
