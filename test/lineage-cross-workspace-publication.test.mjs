import test from 'node:test';
import assert from 'node:assert/strict';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { qualifyCrossWorkspacePublication } from '../src/tooling/portable/lineage/lineage.crossWorkspacePublication.js';
import { planPortableHostAction, PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID } from '../src/tooling/portable/host/tool.bindings.js';

const repo='Tiinex/business', sha='abcdefabcdefabcdefabcdefabcdefabcdefabcd', sourcePath='.topics/roles/001-parent.trace.md';
const md=sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: parent\n\n---\n\n# Parent\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: `).markdown+'\n';
const tool={id:'github-fetch-file',name:'GitHub fetch file',description:'read GitHub repository file'};
const basic={sourceWorkspaceId:'business',targetWorkspaceId:'vscode',repository:repo,commit:sha,sourcePath,markdown:md,availableTools:[tool]};
function receipt({content=md,commit=sha,repository=repo,sourcePath:sp=sourcePath}={}){
 const plan=planPortableHostAction({host:{tools:[tool]},action:'repository-read',request:{repository:repo,ref:sha,path:sourcePath,purpose:'qualify immutable historical cross-Workspace Parent/Browse+Git locator',nextOperation:'review-cross-workspace-continuity'}});
 return {hostPlan:plan,hostReceipt:{schema:PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,action:plan.action,actionId:plan.actionId,steps:[{stepId:plan.steps[0].stepId,toolId:tool.id,status:'completed',normalized:{files:[{path:sp,content,source:{repository,ref:commit,commit,path:sp,authority:'remote-repository-unverified'}}]}}]}};
}
test('without local Git, a discovered GitHub read connector yields a read-only action, NOT a qualified permalink',()=>{
 const r=qualifyCrossWorkspacePublication(basic);
 assert.equal(r.status,'unresolved');assert.equal(r.permalink,'');assert.equal(r.hostAction.status,'ready');
 assert.equal(r.hostAction.steps[0].tool.id,tool.id);assert.equal(r.attempts[1].method,'host-repository-read');
 assert.equal(r.boundary.remoteMutation,false);assert.equal(r.boundary.crossWorkspaceApply,false);
});
test('accepted commit/path/bytes-matched provider read qualifies one exact immutable permalink (still no Apply)',()=>{
 const r=qualifyCrossWorkspacePublication({...basic,...receipt()});
 assert.equal(r.status,'qualified',JSON.stringify(r.findings));
 assert.equal(r.permalink,`https://github.com/${repo}/blob/${sha}/${sourcePath}`);
 assert.ok(r.publicationEvidence.materialIdentity.sha256);assert.equal(r.executable,false);
});
test('wrong bytes, wrong commit, wrong path and mutable refs cannot become publication authority',()=>{
 for(const delta of [
  {content:md+'modified'}, {commit:'f'.repeat(40)}, {sourcePath:'.topics/other.trace.md'},
  {repository:'Unknown/repo'}
 ]){
  const r=qualifyCrossWorkspacePublication({...basic,...receipt(delta)});
  assert.notEqual(r.status,'qualified',JSON.stringify(delta));assert.equal(r.permalink,'');
 }
 const moving=qualifyCrossWorkspacePublication({...basic,commit:'main',...receipt()});
 assert.equal(moving.status,'blocked');
});
test('sandbox without a repository connector recommends alternates but keeps evidence unresolved',()=>{
 const r=qualifyCrossWorkspacePublication({...basic,availableTools:[]});
 assert.equal(r.status,'unresolved');assert.equal(r.hostAction.status,'blocked');
 assert.ok(r.attempts.some(x=>x.method==='read-only-host-fallback'));
});
