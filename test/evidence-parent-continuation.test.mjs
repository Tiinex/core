import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { projectPortableAuthoringParent } from '../src/tooling/portable/editor/authoring.parent.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const path = '.topics/work/testing/001-parent-evidence.trace.md';
const evidence = {
  'Supported Claim Or Question': { 'Supported Claim Or Question': 'The first sample is visible', 'Evidence Role': 'illustration' },
  'Known Source': 'Local disposable fixture', 'Preservation Basis': 'Local test file', 'Provenance Limits': 'Single test fixture',
  'Evidence Material': [{name:'sample',fields:{Material:'[a.png](./a.png)','Material Kind':'PNG image',Description:'sample image'}}],
  'Preservation State':'Source test', 'Fidelity Notes':'sample', 'Known Losses':'none reported',
  'Does Not Prove':'release readiness', 'Not Yet Used As':'Sigma acceptance', 'Must Not Be Treated As':'general verification'
};
function parent(){return renderArtifactCreationDraftMarkdown(buildArtifactCreationContract({schemaId:'tiinex.evidence.v1',transitionType:'create-artifact'}), {
  title:'Parent evidence',createdAt:'2026-10-09 20:00:00',childPath:path,values:evidence
});}
test('fresh qualified Evidence may become Evidence Parent, no schema-type ban',()=>{
  const current=parent();
  assert.match(current,/- Current Schema: tiinex\.evidence\.v1/);
  const result=projectPortableAuthoringParent({records:[{path,markdown:current}],reference:path});
  assert.equal(result.status,'ready',JSON.stringify(result.findings));
  assert.equal(result.parentRecord.schemaId,'tiinex.evidence.v1');
  assert.equal(buildArtifactCreationContract({schemaId:'tiinex.evidence.v1',transitionType:'continue-from-record'}).status,'ready');
});
test('historical unqualified schema URL blocks a Parent with actionable cause, never silent promotion',()=>{
  const original=parent();
  const replaced=original.replace('- Current Schema: tiinex.evidence.v1',`- Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/${'f'.repeat(40)}/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)`);
  const sealed=sealC14nV2Self(replaced);assert.equal(sealed.state,'sealed');
  const result=projectPortableAuthoringParent({records:[{path,markdown:sealed.markdown}],reference:path});
  assert.equal(result.status,'blocked');
  const finding=result.findings.find(item=>item.code==='portable.authoring-parent.unqualified');
  assert.match(finding.message,/schema authority is unqualified/i);
  assert.match(finding.message,/child-of-Evidence is not categorically forbidden/i);
});
