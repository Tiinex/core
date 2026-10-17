import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeHandoffManufactureCliOutput } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
import { projectCommonCliDefaultOutput } from '../src/tooling/portable/adapters/cli/cli.common-output.js';

test('025 a technically valid checkpoint still asks for an isolated recipient source audit',()=>{
 const result={ status:'ready', verification:{ preflight:'qualified',packageInspection:'valid',roundtrip:'passed' }, plan:{ status:'ready',requiredClosureReady:true,workspaceMaterializations:[{id:'review',includedEntries:['topic.md']} ]}, carrierProjection:{status:'ready', mode:'workspace',routes:[]}, findings:[]};
 const output=summarizeHandoffManufactureCliOutput(result,{status:'written',path:'/tmp/checkpoint.zip'},{});
 assert.equal(output.receiverMaterialReview.status,'needs-source-dependency-assessment');
 assert.deepEqual(output.receiverMaterialReview.carriedWorkspaceIds,['review']);
 assert.match(output.receiverMaterialReview.check,/only this ZIP/);
 assert.match(output.receiverMaterialReview.boundary,/not completeness against undeclared external dependencies/);
 const compact=projectCommonCliDefaultOutput(output,{command:'manufacture-handoff-package',surfaceCommand:'handoff',flags:{}},{});
 assert.deepEqual(compact.receiverMaterialReview, output.receiverMaterialReview);
 assert.equal(compact.status,'ready');
});

test('025 audit respects legitimate independent work and incomplete evidence without inventing dependencies',()=>{
 const output=summarizeHandoffManufactureCliOutput({status:'ready',plan:{workspaceMaterializations:[]}}, {}, null);
 assert.deepEqual(output.receiverMaterialReview.carriedWorkspaceIds,[]);
 assert.match(output.receiverMaterialReview.boundary,/Do not infer missing dependencies/);
});
