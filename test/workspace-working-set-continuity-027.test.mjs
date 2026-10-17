import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCommonCliDefaultOutput } from '../src/tooling/portable/adapters/cli/cli.common-output.js';
import { summarizeHandoffManufactureCliOutput } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
import { renderHandoffPackageV1Start } from '../src/tooling/portable/handoff/handoffPackageV1.render.js';

const basic = { schema:'r',status:'ready',workspaces:[{id:'capsule',qualification:'qualified'}],routes:[],carrierLineage:{mode:'root',prefix:'',dimension:'001'},findings:[] };
const args = { command:'orient-handoff-package',positionals:['/tmp/capsule.zip'],flags:{} };
test('027 carried workspace orientation prefers existing work without inventing authority or forbidding scratch',()=>{
 const out=projectCommonCliDefaultOutput(basic,args,{});
 assert.deepEqual(out.capabilities.workingSetDecision.receivedWorkspaceIds,['capsule']);
 assert.match(out.capabilities.workingSetDecision.sameWork,/local writable continuation/);
 assert.match(out.capabilities.workingSetDecision.distinctWork,/only for a justified distinct purpose/);
 assert.match(out.capabilities.workingSetDecision.package,/complete qualified necessary Workspace snapshots/);
 assert.equal(out.sessionScratch.carriedWorkspaceContinuity.preferred,'reconcile-qualified-carried-workspaces-before-choosing-new-durable-workspace');
 assert.match(out.sessionScratch.firstCheckpoint,/--package-parent/);
 assert.match(out.sessionScratch.firstCheckpoint,/--new-root only/);
});
test('027 blank bootstrap preserves early disposable scratch without pretending it is a durable project',()=>{
 const out=projectCommonCliDefaultOutput({...basic,workspaces:[]},args,{});
 assert.equal(out.capabilities,null);
 assert.equal(out.sessionScratch.carriedWorkspaceContinuity.preferred,'prepare-disposable-local-scratch');
 assert.match(out.sessionScratch.firstCheckpoint,/--new-root/);
});
test('027 manufacture receipt inventories exact parent workspace disappearance and distinguishes revisions',()=>{
 const receipt=summarizeHandoffManufactureCliOutput({
  status:'ready',plan:{workspaceMaterializations:[{id:'review'}]},
  inspection:{workspaces:[{workspaceId:'capsule',archiveSha256:'abc'},{workspaceId:'review',archiveSha256:'ddd'}]},
  manufacturingEvidence:{predecessorWorkspaceSnapshots:[{id:'capsule',sha256:'abc'},{id:'other',sha256:'z'}]},
  carrierProjection:{mode:'workspace',status:'ready',routes:[]}
 },{status:'written',path:'/tmp/out.zip'},{});
 const coverage=receipt.receiverMaterialReview.predecessorCoverage;
 assert.equal(coverage.state,'missing-previous-workspace-ids-needs-relevance-decision');
 assert.deepEqual(coverage.missingPredecessorWorkspaceIds,['other']);
 assert.deepEqual(coverage.unchangedPredecessorWorkspaceIds,['capsule']);
 assert.deepEqual(coverage.newWorkspaceIds,['review']);
 assert.match(coverage.boundary,/does not prove relevance/);
});
test('027 revision and independent root are not falsely labeled missing',()=>{
 const make=(pre)=>summarizeHandoffManufactureCliOutput({status:'ready',plan:{workspaceMaterializations:[{id:'capsule'}]},inspection:{workspaces:[{workspaceId:'capsule',archiveSha256:'new'}]},manufacturingEvidence:{predecessorWorkspaceSnapshots:pre},carrierProjection:{mode:'workspace',routes:[]}}, {},{}).receiverMaterialReview.predecessorCoverage;
 const continued=make([{id:'capsule',sha256:'old'}]);
 assert.equal(continued.state,'all-previous-workspace-ids-present');
 assert.deepEqual(continued.revisedPredecessorWorkspaceIds,['capsule']);
 const independent=make([]);
 assert.equal(independent.state,'no-qualified-predecessor-snapshot-evidence');
 assert.deepEqual(independent.missingPredecessorWorkspaceIds,[]);
});
test('027 pointerless Start distinguishes scratch from carried workspace and forbids silent partial loss',()=>{
 const start=renderHandoffPackageV1Start({carrierMode:'workspace',createdAt:'2026-10-17 03:00:00',bootstrapArtifactPath:'001-2-bootstrap.trace.md',bootstrapArchivePath:'001-2-bootstrap.zip'});
 assert.match(start,/new durable Workspace only for a distinct purpose/);
 assert.match(start,/do not silently emit partial Workspace subsets/);
 assert.doesNotMatch(renderHandoffPackageV1Start({carrierMode:'handoff',createdAt:'2026-10-17 03:00:00',bootstrapArtifactPath:'001-2-bootstrap.trace.md',bootstrapArchivePath:'001-2-bootstrap.zip'}),/new durable Workspace only for a distinct purpose/);
});
