import test from 'node:test';
import assert from 'node:assert/strict';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { schemaMarkdown } from '../src/schemas/registry.js';
import { inspectPortableHistoricalSchemaSource } from '../src/tooling/portable/schema/schema.historicalSource.inspect.js';
import { PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID } from '../src/tooling/portable/host/tool.bindings.js';
const commit='302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6',repository='Tiinex/docs';
const path='.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md';
const target=`https://github.com/${repository}/blob/${commit}/${path}`;
const markdown=sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: [tiinex.evidence.v1](${target})\n  - Summary: Historical evidence\n\n---\n\n# Historical evidence\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
import {clearSchemaRegistry,replaceSchemaRegistry,schemaRegistrySnapshot} from '../src/schemas/registry.js';
const __registryTesting={clearSchemaRegistry,replaceSchemaRegistry,schemaRegistrySnapshot};
const tool={id:'github-fetch-file',name:'GitHub fetch file',description:'read GitHub repository file'};
const input={markdown,availableTools:[tool]};
function readReceipt(plan,content,override={}){
 const step=plan.steps[0];return {schema:PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,actionId:plan.actionId,action:plan.action,
  steps:[{stepId:step.stepId,toolId:tool.id,status:'completed',normalized:{files:[{path:override.path||path,content,source:{repository:override.repository||repository,commit:override.commit||commit,ref:commit,path:override.path||path}}]}}]};
}
test('historical Evidence source requires exact pinned read, remains blocked for authoring/mutation',()=>{
 const x=inspectPortableHistoricalSchemaSource(input);
 assert.equal(x.status,'unresolved',JSON.stringify(x.findings));
 assert.equal(x.hostAction.status,'ready');assert.equal(x.hostAction.steps[0].tool.id,tool.id);
 assert.equal(x.boundary.permitsParentAuthoring,false);
});
test('historical Evidence same local bytes and different material are distinctly classified',()=>{
 const initial=inspectPortableHistoricalSchemaSource(input);
 const current=schemaMarkdown('tiinex.evidence.v1');assert.ok(current.length>500);
 const equal=inspectPortableHistoricalSchemaSource({...input,hostPlan:initial.hostAction,hostReceipt:readReceipt(initial.hostAction,current)});
 assert.equal(equal.status,'byte-equivalent',JSON.stringify(equal.findings));
 assert.equal(equal.historicalMaterial.gitBlobSha,equal.localCurrentMaterial.gitBlobSha);
 const altered=sealC14nV2Self(current.replace('# Continuity Context','# Continuity Context\n\n<!-- historically different -->')).markdown;
 const distinct=inspectPortableHistoricalSchemaSource({...input,hostPlan:initial.hostAction,hostReceipt:readReceipt(initial.hostAction,altered)});
 assert.equal(distinct.status,'historical-distinct',JSON.stringify(distinct.findings));
 assert.notEqual(distinct.historicalMaterial.sha256,distinct.localCurrentMaterial.sha256);
 assert.equal(distinct.executable,false);assert.equal(distinct.boundary.permitsHistoricalSchemaMigration,false);
});
test('different pinned commit/path and modified self-integrity block instead of laundering a schema URL',()=>{
 const first=inspectPortableHistoricalSchemaSource(input);
 for(const extra of [{commit:'a'.repeat(40)},{path:'.topics/.schemas/core/task/tiinex.task.v1.schema.md'}]){
  const x=inspectPortableHistoricalSchemaSource({...input,hostPlan:first.hostAction,hostReceipt:readReceipt(first.hostAction,schemaMarkdown('tiinex.evidence.v1'),extra)});
  assert.equal(x.status,'blocked');
 }
 const bad=inspectPortableHistoricalSchemaSource({...input,hostPlan:first.hostAction,hostReceipt:readReceipt(first.hostAction,'not qualified historical schema')});
 assert.equal(bad.status,'blocked');
});

test('first-class Core CLI historical schema inspector returns explicit read-only verdict',async t=>{
 const {mkdtemp,writeFile,rm}=await import('node:fs/promises');
 const {spawnSync}=await import('node:child_process');
 const os=await import('node:os');const pathModule=await import('node:path');
 const tmp=await mkdtemp(pathModule.join(os.tmpdir(),'tiinex-schema-inspection-'));
 t.after(()=>rm(tmp,{recursive:true,force:true}));
 const rq=pathModule.join(tmp,'request.json');const cli=pathModule.join(process.cwd(),'tools/tiinex-portable.mjs');
 const run=()=>{const r=spawnSync(process.execPath,[cli,'inspect-historical-schema-source','--request',rq,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:45000});assert.ok(r.stdout.startsWith('{'),r.stderr);return {exit:r.status,...JSON.parse(r.stdout)};};
 await writeFile(rq,JSON.stringify(input));
 const first=run();assert.equal(first.exit,2);assert.equal(first.status,'unresolved');assert.equal(first.hostAction.steps[0].tool.id,tool.id);
 const distinctMaterial=sealC14nV2Self(schemaMarkdown('tiinex.evidence.v1').replace('# Continuity Context','# Continuity Context\n\n<!-- historical version -->')).markdown;
 await writeFile(rq,JSON.stringify({...input,hostPlan:first.hostAction,hostReceipt:readReceipt(first.hostAction,distinctMaterial)}));
 const second=run();assert.equal(second.exit,0,JSON.stringify(second.findings));assert.equal(second.status,'historical-distinct');assert.equal(second.executable,false);
});

test('missing local current-schema material does not suppress read-only connector discovery',()=>{
 const previous=schemaMarkdown('tiinex.evidence.v1');
 const {clearSchemaRegistry,replaceSchemaRegistry,schemaRegistrySnapshot}=__registryTesting;
 const original=schemaRegistrySnapshot();
 try {
  clearSchemaRegistry({source:'isolated-schema-absent-fixture'});
  const first=inspectPortableHistoricalSchemaSource(input);
  assert.equal(first.status,'unresolved');assert.equal(first.hostAction.status,'ready');
  const second=inspectPortableHistoricalSchemaSource({...input,hostPlan:first.hostAction,hostReceipt:readReceipt(first.hostAction,previous)});
  assert.equal(second.status,'historical-uncompared');assert.equal(second.boundary.permitsParentAuthoring,false);
 } finally { replaceSchemaRegistry({modules:original.modules,nativeCatalog:original.nativeCatalog,material:original.material,source:original.source}); }
});
