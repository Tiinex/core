import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { initializePortableNodeRuntime } from '../src/tooling/portable/adapters/node/portableRuntime.initialize.js';
import { loadPortableSchemaCompanionModules } from '../src/tooling/portable/adapters/node/schemaCompanion.runtime.js';
import { schemaRegistry, installSchemaModules } from '../src/schemas/registry.js';
import { buildArtifactCreationContract, listCreatableArtifactSchemas, renderArtifactCreationCandidateMarkdown, validateArtifactCreationResult } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { qualifySectionScopedRepeatedCreationInputs } from '../src/schemas/creation.repeatedFields.js';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

// The real installed Root companion, without replacing the generic Project
// creation implementation with its separate schema-validation-only companion.
const native = process.env.TIINEX_TEST_NATIVE_ROOT || new URL('../../native/', import.meta.url).pathname;
const q = await discoverLocalTiinexContentSource({ root:native, kind:'explicit-runtime-content-root' });
const init = await initializePortableNodeRuntime({ runtimeRoot:process.cwd(), contentRoots:[native], discoverBundled:false, discoverInstalled:false });
assert.equal(init.status,'ready');
const runtime = await loadPortableSchemaCompanionModules({contentSources:[q],coreRoot:process.cwd(),trustedExecutableSourceIds:[q.source.id]});
installSchemaModules([runtime.modules.find(x=>x.id==='tiinex.root.v1')], {source:'qualified-root-test'});

test('qualified real Project is creatable with distinct repeated fields per section and a valid self seal', () => {
  const c=buildArtifactCreationContract({schemaId:'tiinex.project.v1',transitionType:'create-artifact'});
  assert.equal(c.status,'ready',JSON.stringify(c.findings));
  assert.equal(c.capabilities.create,'implemented');
  assert.ok(listCreatableArtifactSchemas().some(x=>x.target?.schemaId==='tiinex.project.v1'));
  const groups=['Project Identity','Project Purpose And Scope','Coordination State','Milestones And Outcomes'];
  const bindings=c.creation.inputBindings.filter(x=>x.kind==='ordinary-group');
  assert.deepEqual(bindings.map(x=>x.input),groups);
  for(const b of bindings) assert.deepEqual([...b.requiredFields],['Description','Boundary']);
  const values=Object.fromEntries(c.creation.requiredInputs.map(name=>{
    const b=c.creation.inputBindings.find(x=>x.input===name);
    return [name,b.kind==='ordinary-group'?{Description:`Description for ${name}`,Boundary:`Boundary for ${name}`}:'none'];
  }));
  const md=renderArtifactCreationCandidateMarkdown(c,{values,createdAt:'2026-10-11T18:00:00Z',authors:'Anchor',summary:'Project test',why:'Testing generically bound Project creation'});
  assert.equal(canonicalC14nV2SelfState(md).state,'verified');
  for(const name of groups) assert.match(md,new RegExp(`## ${name}\\n\\n- Description: Description for ${name}\\n- Boundary: Boundary for ${name}`));
  const validation=validateArtifactCreationResult({schemaId:'tiinex.project.v1',markdown:md,status:'local',sourceMode:'local-create'},{},{contract:c});
  assert.equal(validation.ok,true,JSON.stringify(validation.findings));
  assert.ok(md.includes('  - Why: Testing generically bound Project creation'));
});

test('a missing repeated section field cannot be silently copied or invented',()=>{
  const c=buildArtifactCreationContract({schemaId:'tiinex.project.v1'});
  const values=Object.fromEntries(c.creation.requiredInputs.map(name=>{
    const b=c.creation.inputBindings.find(x=>x.input===name);
    return [name,b.kind==='ordinary-group'?{Description:`Description ${name}`,Boundary:`Boundary ${name}`}:'none'];
  }));
  delete values['Coordination State'].Boundary;
  assert.throws(()=>renderArtifactCreationDraftMarkdown(c,{values,createdAt:'2026-10-11T18:00:00Z'}),/creation-required-structured-field-missing:Coordination State:Boundary/);
  const missing=qualifySectionScopedRepeatedCreationInputs({requiredInputs:['Description'],inputBindings:[{input:'Description',kind:'unmapped'}]},null,'tiinex.example.v1');
  assert.equal(missing.requiredInputs[0],'Description');
  assert.equal(missing.inputBindings[0].kind,'unmapped');
});
