import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract, renderArtifactCreationCandidateMarkdown, validateArtifactCreationResult, createArtifactDraftMarkdown } from '../src/schemas/creation.contracts.js';
import {renderArtifactCreationDraftMarkdown} from '../src/schemas/creation.renderer.js';
import { parseArtifactMarkdown } from '../src/artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

const createdAt='2026-10-09T13:00:00Z';
const list=(name, fields)=>[{ name, fields }];
function base() {return {
  Name:'Collect an observation',Version:'1.0.0','Canonical Identifier':'tiinex.example.collect-observation.v1',
  Purpose:'Record one observation as a reusable semantic step.', 'Semantic Boundary':'Does not prove that the observation is true.',
  'Input Roles':'none','Output Roles':'none', 'Lifecycle And Continuity Effects':{'Lifecycle Effects':'none','Parent Effects':'none'},
  'Relation Effects':'none','Applicability Meaning':'When a human chooses to record an observation.',
  'Placement Intent':{'Destination Bindings':'none','Output Placements':'none'},
  'Interpretation Limits':{'Does Not Prove':'That any observation occurred.','Must Not Be Inferred':'Execution or authorization.'}
};}
function create(schemaId,values){const contract=buildArtifactCreationContract({schemaId,transitionType:'create-artifact'}); const input={values,createdAt};return {contract,input,markdown:renderArtifactCreationCandidateMarkdown(contract,input)};}
test('real Core Transition Definition and Companion authoring contracts are ready',()=>{
 for(const schemaId of ['tiinex.transition.definition.v1','tiinex.schema.transition.companion.v1']){
  const contract=buildArtifactCreationContract({schemaId,transitionType:'create-artifact'});
  assert.equal(contract.status,'ready',JSON.stringify(contract.findings));
  assert.equal(contract.capabilities.create,'implemented');
  assert.ok(contract.creation.requiredInputs.length);
 }
});
test('minimal legitimate zero-role Transition Definition materializes as exact schema-valid sealed artifact',()=>{
 const {contract,input,markdown}=create('tiinex.transition.definition.v1',base());
 assert.match(markdown,/^### Lifecycle Effects\n\n- none$/m);
 assert.match(markdown,/^### Parent Effects\n\n- none$/m);
 assert.match(markdown,/^### Output Placements\n\n- none$/m);
 assert.equal(canonicalC14nV2SelfState(markdown).state,'verified');
 assert.equal(validateArtifactCreationResult({schemaId:'tiinex.transition.definition.v1',markdown,status:'local',sourceMode:'local-create'}, {},{contract}).ok,true);
 assert.equal(createArtifactDraftMarkdown(contract,input),markdown);
 assert.match(parseArtifactMarkdown(markdown).body.text,/## Transition Identity/);
});
test('unresolved complex Transition stays sealed and readable but fails closed at exact creation qualification',()=>{
 const values=base();
 values['Input Roles']=list('Topic',{Meaning:'An existing Topic to study.','Minimum Count':'1','Maximum Count':'1','Target Kind':'artifact'});
 values['Output Roles']=list('Evidence',{Meaning:'Created evidence record.','Minimum Count':'1','Maximum Count':'1','Target Kind':'artifact','Schema Constraint':'tiinex.evidence.v1'});
 values['Lifecycle And Continuity Effects']={'Lifecycle Effects':list('Create Evidence',{'Target Binding':'Evidence',Effect:'create-new','Required Materialization Operation':'create','Logical Continuity':'new-subject'}),'Parent Effects':list('Parent from Topic',{'Output Binding':'Evidence',Effect:'set','Parent Binding':'Topic'})};
 values['Relation Effects']='none';
 values['Placement Intent']={'Destination Bindings':list('Workspace Topic Root',{Meaning:'Location chosen by the operator.','Required':'yes'}),'Output Placements':list('Evidence Destination',{'Output Binding':'Evidence','Placement Intent':'new-materialization','Destination Binding':'Workspace Topic Root'})};
 const contract=buildArtifactCreationContract({schemaId:'tiinex.transition.definition.v1'});
 const input={values,createdAt};
 const markdown=renderArtifactCreationDraftMarkdown(contract,input);
 const validation=validateArtifactCreationResult({schemaId:'tiinex.transition.definition.v1',markdown,status:'local',sourceMode:'local-create'}, {},{contract});
 assert.equal(validation.ok,false,'unresolved transition applicability is not a valid fully qualified creation receipt');
 assert.ok(validation.findings.some(f=>f.code.startsWith('creation.portable-contract.')));
 assert.equal(canonicalC14nV2SelfState(markdown).state,'verified');
 assert.ok(markdown.includes('  - Target Binding: Evidence'));
 assert.ok(markdown.includes('  - Destination Binding: Workspace Topic Root'));
 assert.equal(createArtifactDraftMarkdown(contract,input),'', 'do not silently promote unresolved semantics to a ready authoring output');
});
test('multiple independent real Input Role entries round-trip as named rows',()=>{
 const values=base();values['Input Roles']=[{name:'Observer',fields:{Meaning:'Person making the observation.','Minimum Count':'1','Maximum Count':'1','Target Kind':'non-artifact'}},{name:'Source',fields:{Meaning:'Observed material.','Minimum Count':'0','Maximum Count':'1','Target Kind':'artifact'}}];
 const {contract,input,markdown}=create('tiinex.transition.definition.v1',values);
 assert.ok(markdown.includes('## Input Roles'));
 assert.ok(markdown.includes('- Observer\n'));
 assert.ok(markdown.includes('- Source\n'));
 assert.equal(validateArtifactCreationResult({schemaId:'tiinex.transition.definition.v1',markdown,status:'local',sourceMode:'local-create'},{},{contract}).ok,true);
 assert.equal(createArtifactDraftMarkdown(contract,input),markdown);
});
test('fail closed on missing, duplicated, invented or flattened structured transition inputs',()=>{
 const c=buildArtifactCreationContract({schemaId:'tiinex.transition.definition.v1'});
 const mk=(values)=>renderArtifactCreationDraftMarkdown(c,{values,createdAt});
 const missing=base();delete missing['Lifecycle And Continuity Effects']['Parent Effects'];
 assert.throws(()=>mk(missing),/creation-required-composite-part-missing/);
 const injected=base();injected['Placement Intent'].Fake='none';
 assert.throws(()=>mk(injected),/creation-composite-part-unqualified/);
 const malformed=base();malformed['Input Roles']='corrupt';
 assert.throws(()=>mk(malformed),/creation-declaration-list-required/);
 const duplicate=base();duplicate['Input Roles']=list('Topic',{Meaning:'Topic','Minimum Count':'0','Maximum Count':'1'}).concat(list('Topic',{Meaning:'Topic','Minimum Count':'0','Maximum Count':'1'}));
 assert.throws(()=>mk(duplicate),/creation-declaration-name-duplicate/);
});
test('Schema Transition Companion empty set and exact attachment create through Core',()=>{
 const values={ 'Schema Reference':'[Evidence schema](../schemas/tiinex.evidence.v1.schema.md)', 'Transition Attachments':'none', 'Interpretation Limits':{'Does Not Mean':'Automatic applicability.','Must Not Be Used To Claim':'Execution.'} };
 const {contract,markdown}=create('tiinex.schema.transition.companion.v1',values);
 assert.ok(markdown.includes('## Transition Attachments\n\n- none'));
 assert.equal(validateArtifactCreationResult({schemaId:'tiinex.schema.transition.companion.v1',markdown,status:'local',sourceMode:'local-create'},{},{contract}).ok,true);
 const linked={...values,'Transition Attachments':list('Observe Evidence',{'Transition Reference':'[Observe](./.transitions/observe.trace.md)','Note':'Explicit only'})};
 const {markdown:attached}=create('tiinex.schema.transition.companion.v1',linked);
 assert.equal(validateArtifactCreationResult({schemaId:'tiinex.schema.transition.companion.v1',markdown:attached,status:'local',sourceMode:'local-create'},{},{contract}).ok,true);
});
