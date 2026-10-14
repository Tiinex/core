import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { initializePortableNodeRuntime } from '../src/tooling/portable/adapters/node/portableRuntime.initialize.js';
import { projectPortableEntryCatalog } from '../src/tooling/portable/entry/entry.catalog.js';
import { projectPortableProcessCatalog } from '../src/tooling/portable/process/process.catalog.js';
import { projectPortableScaffoldCatalog } from '../src/scaffolds/scaffold.catalog.js';
import { runCatalogCli } from '../src/tooling/portable/adapters/cli/cli.catalog.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

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
  assert.equal(nativeRuntime.schemaRuntime.schemas.total,111);
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


integrationTest('an unfamiliar user schema becomes discoverable from qualified composed content, without a hardcoded manual entry', async (t) => {
  const customRoot=await mkdtemp(path.join(os.tmpdir(),'tiinex-imported-playtest-'));
  t.after(()=>rm(customRoot,{recursive:true,force:true}));
  await writeFile(path.join(customRoot,'package.json'),JSON.stringify({name:'@example/playtest-content',version:'1.0.0',tiinex:{contentSource:{registeredSurfaces:'recursive'}}}));
  await cp(path.join(nativeRoot,'.topics','.schemas'),path.join(customRoot,'.topics','.schemas'),{recursive:true});
  const basePath=path.join(nativeRoot,'.topics','.schemas','core','topic','tiinex.topic.v1.schema.md');
  const targetPath=path.join(customRoot,'.topics','.schemas','core','topic','example.playtest.v1.schema.md');
  const base=await readFile(basePath,'utf8');
  const changed=base.replaceAll('tiinex.topic.v1','example.playtest.v1').replace('Schema for bounded topic-oriented lineage artifacts.','Schema for one bounded playtest record.');
  const sealed=sealC14nV2Self(changed);
  assert.equal(sealed.state,'sealed');
  await writeFile(targetPath,sealed.markdown,'utf8');
  const selected=await discoverLocalTiinexContentSource({root:customRoot});
  assert.equal(selected.status,'ready');
  const runtime=await initializePortableNodeRuntime({runtimeRoot:ROOT,contentSources:[selected],discoverBundled:false,discoverInstalled:false,environmentContentRoots:''});
  assert.equal(runtime.status,'ready',JSON.stringify(runtime.findings));
  const catalog=await runCatalogCli({flags:{query:'playtest'}},{runtimeInitialization:runtime,contentSources:runtime.contentSources});
  assert.equal(catalog.status,'ready');
  assert.equal(catalog.schemas.total,112);
  assert.deepEqual(catalog.schemas.entries.map(x=>x.schemaId),['example.playtest.v1']);
  assert.equal(catalog.schemas.entries[0].sourcePath.includes('example.playtest.v1.schema.md'),true);
});
