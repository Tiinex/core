import test from 'node:test';
import assert from 'node:assert/strict';
import {buildArtifactCreationContract} from '../src/schemas/creation.contracts.js';
import {renderArtifactCreationDraftMarkdown} from '../src/schemas/creation.renderer.js';
import {sealC14nV2Self} from '../src/integrity/integrity.c14nV2.js';
import {schemaMarkdown} from '../src/schemas/registry.js';
import {projectPortableAuthoringParent} from '../src/tooling/portable/editor/authoring.parent.js';
import {inspectPortableHistoricalSchemaSource} from '../src/tooling/portable/schema/schema.historicalSource.inspect.js';
import {PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID} from '../src/tooling/portable/host/tool.bindings.js';
import {createPortableLocalDraft} from '../src/tooling/portable/draft/draft.create.js';
import {canonicalC14nV2SelfState} from '../src/integrity/integrity.c14nV2.js';
import {validateArtifact} from '../src/validation/validateArtifact.js';
const currentPath='.topics/work/evidence/001-historical-evidence.trace.md';
const remotePath='.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md';
const commit='302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6';
const locator=`https://github.com/Tiinex/docs/blob/${commit}/${remotePath}`;
const tool={id:'github-fetch-file',name:'GitHub fetch file',description:'read GitHub repository file'};
const values={
 'Supported Claim Or Question': {'Supported Claim Or Question':'An exact illustration is available', 'Evidence Role':'illustration'},
 'Known Source':'Local disposable fixture','Preservation Basis':'Local test material','Provenance Limits':'Disposable source only',
 'Evidence Material':[{name:'sample',fields:{Material:'[sample.png](sample.png)','Material Kind':'PNG image',Description:'sample'}}],
 'Preservation State':'Local source','Fidelity Notes':'no loss','Known Losses':'none',
 'Does Not Prove':'historical release','Not Yet Used As':'Sigma','Must Not Be Treated As':'automatic authorization'
};
function parent(){const base=renderArtifactCreationDraftMarkdown(buildArtifactCreationContract({schemaId:'tiinex.evidence.v1',transitionType:'create-artifact'}),{
 title:'Pinned historical Evidence',createdAt:'2026-10-10 10:00:00',childPath:currentPath,values});
 const changed=base.replace(/- Current Schema: \[tiinex\.evidence\.v1\]\([^)]+\)/,`- Current Schema: [tiinex.evidence.v1](${locator})`);
 assert.notEqual(changed,base);return sealC14nV2Self(changed).markdown;}
function proof(markdown,content){const first=inspectPortableHistoricalSchemaSource({markdown,availableTools:[tool]});assert.equal(first.status,'unresolved');const step=first.hostAction.steps[0];return {availableTools:[tool],hostPlan:first.hostAction,hostReceipt:{
 schema:PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,actionId:first.hostAction.actionId,action:first.hostAction.action,
 steps:[{stepId:step.stepId,toolId:tool.id,status:'completed',normalized:{files:[{path:remotePath,content,
 source:{repository:'Tiinex/docs',commit,ref:commit,path:remotePath}}]}}]}};}
test('old immutable Evidence with accepted EXACT byte equivalent schema can be a Parent without modifying historical bytes',()=>{
 const markdown=parent(),original=markdown;
 const request=proof(markdown,schemaMarkdown('tiinex.evidence.v1'));
 const output=projectPortableAuthoringParent({reference:currentPath,records:[{path:currentPath,markdown}],historicalSchemaSource:request});
 assert.equal(output.status,'ready',JSON.stringify(output.findings));
 assert.equal(output.parentRecord.markdown,original);
 assert.equal(output.parentRecord.schemaId,'tiinex.evidence.v1');
 assert.equal(output.parentRecord.schemaReferenceAuthority.resolutionState,'qualified');
 assert.equal(output.parentRecord.schemaReferenceAuthority.preferredTarget,locator);
 assert.ok(output.findings.some(x=>x.code==='portable.authoring-parent.historical-schema-exact-equivalence'));
});
test('old pinned historical Evidence with distinct schema and no host read still BLOCK, no silent rewrite',()=>{
 const markdown=parent();const absent=projectPortableAuthoringParent({reference:currentPath,records:[{path:currentPath,markdown}]});assert.equal(absent.status,'blocked');
 const old=sealC14nV2Self(schemaMarkdown('tiinex.evidence.v1').replace('# Continuity Context','# Continuity Context\n\n<!-- historic distinction -->')).markdown;
 const different=projectPortableAuthoringParent({reference:currentPath,records:[{path:currentPath,markdown}],historicalSchemaSource:proof(markdown,old)});
 assert.equal(different.status,'blocked');assert.equal(different.historicalSourceRecovery.status,'historical-distinct');assert.match(different.findings[0].remediation,/distinct|differ/i);assert.equal(markdown,parent());
});
test('same remote bytes from a contradictory commit/path are not accepted as historical Parent authority',()=>{
 const markdown=parent();const request=proof(markdown,schemaMarkdown('tiinex.evidence.v1'));
 request.hostReceipt.steps[0].normalized.files[0].source.commit='f'.repeat(40);
 const result=projectPortableAuthoringParent({reference:currentPath,records:[{path:currentPath,markdown}],historicalSchemaSource:request});
 assert.equal(result.status,'blocked');assert.equal(result.historicalSourceRecovery.status,'blocked');
});

test('byte-equivalent historical Evidence can actually author and reopen a verified Evidence child with pinned Parent Schema',()=>{
 const markdown=parent();
 const result=projectPortableAuthoringParent({reference:currentPath,records:[{path:currentPath,markdown}],historicalSchemaSource:proof(markdown,schemaMarkdown('tiinex.evidence.v1'))});
 assert.equal(result.status,'ready',JSON.stringify(result.findings));
 const child=createPortableLocalDraft({schemaId:'tiinex.evidence.v1',transitionType:'continue-from-record',
   path:'.topics/work/evidence/001-1-child-evidence.trace.md',parent:result.parentRecord,values,title:'Child of historic Evidence',materials:[]});
 assert.equal(child.status,'created-clean',JSON.stringify(child.findings));
 assert.equal(canonicalC14nV2SelfState(child.draft.markdown).state,'verified');
 assert.ok(child.draft.markdown.includes(`- Parent Schema: [tiinex.evidence.v1](${locator})`));
 assert.ok(child.draft.markdown.includes('001-historical-evidence.trace.md'));
 const audited=validateArtifact({markdown:child.draft.markdown});
 assert.equal(audited.findings.some(f=>f.severity==='error'),false,JSON.stringify(audited.findings.filter(f=>f.severity==='error')));
});
test('first-class Core CLI historical Evidence Parent is available without VS Code or mutable schema rewrites',async t=>{
 const {spawnSync}=await import('node:child_process');const {mkdtemp,writeFile,rm}=await import('node:fs/promises');const os=await import('node:os');const path=await import('node:path');
 const tmp=await mkdtemp(path.join(os.tmpdir(),'tiinex-historical-parent-cli-'));t.after(()=>rm(tmp,{recursive:true,force:true}));
 const evidence=parent();const args={reference:currentPath,records:[{path:currentPath,markdown:evidence}],historicalSchemaSource:proof(evidence,schemaMarkdown('tiinex.evidence.v1'))};
 const request=path.join(tmp,'request.json');await writeFile(request,JSON.stringify(args));
 const r=spawnSync(process.execPath,[path.join(process.cwd(),'tools/tiinex-portable.mjs'),'qualify-historical-evidence-parent','--request',request,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:50000});
 assert.equal(r.status,0,r.stderr||r.stdout);const qualified=JSON.parse(r.stdout);assert.equal(qualified.status,'ready');assert.equal(qualified.parentRecord.markdown,evidence);
 await writeFile(request,JSON.stringify({...args,historicalSchemaSource:{availableTools:[tool]}}));
 const blocked=spawnSync(process.execPath,[path.join(process.cwd(),'tools/tiinex-portable.mjs'),'qualify-historical-evidence-parent','--request',request,'--compact'],{cwd:process.cwd(),encoding:'utf8',timeout:50000});
 assert.equal(blocked.status,2,blocked.stderr);assert.equal(JSON.parse(blocked.stdout).status,'blocked');
});

test('missing historical provider receipt offers LLM an exact repository-read recovery action rather than a dead-end',()=>{
 const markdown=parent();
 const result=projectPortableAuthoringParent({records:[{path:currentPath,markdown}],reference:currentPath,
   historicalSchemaSource:{availableTools:[tool]}});
 assert.equal(result.status,'blocked');assert.equal(result.historicalSourceRecovery.status,'unresolved');
 assert.equal(result.historicalSourceRecovery.hostAction.status,'ready');
 assert.equal(result.historicalSourceRecovery.hostAction.steps[0].tool.id,tool.id);
 assert.equal(result.historicalSourceRecovery.boundary.remoteWrite,false);
});
