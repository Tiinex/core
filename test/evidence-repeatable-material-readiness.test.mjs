import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract, validateArtifactCreationResult } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { schemaMarkdown, schemaRegistry } from '../src/schemas/registry.js';
import { validatePortableContractInstance } from '../src/tooling/portable/schema/contract.validate.js';
import { parseDeclarationsAgainstContract } from '../src/tooling/portable/schema/named.declarations.js';
import { parsePortableSchemaDocument } from '../src/tooling/portable/schema/schema.contract.js';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

const entries = [
  { name: 'before', fields: { Material: '[Before](../assets/before.png)', 'Material Kind': 'screenshot', Description: 'Before the edit', 'Material Provenance': 'Original screenshot', 'Material Limits': 'One frame only' } },
  { name: 'after', fields: { Material: '[After](../assets/after.png)', 'Material Kind': 'screenshot', Description: 'After the edit', 'Material Provenance': 'Original screenshot', 'Material Limits': 'Not proof of every machine' } }
];
const values = {
  'Supported Claim Or Question': { 'Supported Claim Or Question': 'Do two captures illustrate the review finding?', 'Evidence Role': 'illustrates' },
  'Known Source': 'Two independently preserved screenshots',
  'Preservation Basis': 'Retained assets and explicit relative links',
  'Provenance Limits': 'One bounded operator session',
  'Evidence Material': entries,
  'Preservation State': 'Originals retained',
  'Fidelity Notes': 'Unmodified captures',
  'Known Losses': 'Unrecorded intermediate states',
  'Does Not Prove': 'Application acceptance',
  'Not Yet Used As': 'Release approval',
  'Must Not Be Treated As': 'Attestation'
};
const contract = () => buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
const render = (v = values) => renderArtifactCreationDraftMarkdown(contract(), { values: v, title: 'Two real materials', createdAt: '2026-10-09T11:30:00Z' });
const compiled = () => schemaRegistry.byId.get('tiinex.evidence.v1').schemaSource.qualify().compiledContract.validationContract;

test('pre-launch Evidence keeps tiinex.evidence.v1 and binds exactly one native-owned repeated material section', () => {
  const c = contract();
  assert.equal(c.status, 'ready', JSON.stringify(c.findings));
  assert.equal(c.target.schemaId, 'tiinex.evidence.v1');
  const material = c.creation.inputBindings.filter((b) => b.section === 'Evidence Material');
  assert.equal(material.length, 1);
  assert.equal(material[0].kind, 'named-declaration-section');
  assert.equal(material[0].input, 'Evidence Material');
  assert.deepEqual(material[0].requiredFields, ['Material', 'Material Kind', 'Description']);
  assert.deepEqual(material[0].optionalFields, ['Material Provenance', 'Material Limits', 'Representation']);
  const picker = c.creation.authoringAffordances.find((a) => a.input === 'Material');
  assert.equal(picker?.append, false);
});

test('Evidence v1 generates, seals, validates, and reads back two distinct source entries with individual metadata', () => {
  const markdown = render();
  assert.equal(canonicalC14nV2SelfState(markdown).state, 'verified');
  assert.match(markdown, /## Evidence Material\n\n- before\n  - Material: \[Before\]/);
  assert.match(markdown, /- after\n  - Material: \[After\]/);
  const result = validateArtifactCreationResult({schemaId:'tiinex.evidence.v1',status:'local',sourceMode:'local-test',markdown}, {}, {contract:contract()});
  assert.equal(result.status, 'valid', JSON.stringify(result.findings));
  const exact = validatePortableContractInstance({ markdown, compiledContract: compiled() });
  assert.equal(exact.status, 'valid', JSON.stringify(exact.findings));
  const declaration = compiled().declarations.find((d) => d.group === 'Evidence Material');
  assert.deepEqual(declaration.targetHeadings, ['## Evidence Material']);
  const parsed = parseDeclarationsAgainstContract(markdown, [declaration])[0].sections[0];
  assert.deepEqual(parsed.entries.map((e) => e.name), ['before', 'after']);
  assert.equal(parsed.entries[0].fields.Description, 'Before the edit');
  assert.equal(parsed.entries[1].fields.Description, 'After the edit');
  assert.notEqual(parsed.entries[0].fields.Material, parsed.entries[1].fields.Material);
  assert.notEqual(parsed.entries[0].fields['Material Limits'], parsed.entries[1].fields['Material Limits']);
});

test('One material entry works; zero entries, duplicate names, missing source/description and unqualified metadata fail closed', () => {
  const single = render({...values,'Evidence Material':[entries[0]]});
  assert.equal(validateArtifactCreationResult({schemaId:'tiinex.evidence.v1',status:'local',sourceMode:'local-test',markdown:single},{},{contract:contract()}).status,'valid');
  assert.throws(() => render({...values,'Evidence Material':[]}), /creation-declaration-list-required/);
  assert.throws(() => render({...values,'Evidence Material':[entries[0],entries[0]]}), /creation-declaration-name-duplicate/);
  assert.throws(() => render({...values,'Evidence Material':[ {name:'x', fields: {'Material Kind':'screenshot', Description:'Missing source'}} ]}), /creation-required-structured-field-missing/);
  assert.throws(() => render({...values,'Evidence Material':[ {name:'x', fields: { Material:'x', 'Material Kind':'photo'}} ]}), /creation-required-structured-field-missing/);
  assert.throws(() => render({...values,'Evidence Material':[ {name:'x', fields: {Material:'x', 'Material Kind':'photo',Description:'valid', Fictional:'unqualified'}} ]}), /creation-structured-field-unqualified/);
});

test('Old scalar Material cannot masquerade as a structured repeated collection or be silently dropped', () => {
  assert.throws(() => render({...values,Material:'[x](x.png)'}),/creation-nested-field-unbound/);
  assert.throws(() => render({...values,'Evidence Material':[['x']]}),/creation-declaration-entry-invalid/);
  assert.throws(() => render({...values,'Evidence Material':[ {name:'x', fields:{Material:['a','b'],'Material Kind':'screenshot',Description:'Unqualified array'}} ]}),/creation-one-line-value-structured-unqualified/);
});

test('Native v1 revision is source-checksummed and explicitly unpublished rather than a fabricated GitHub snapshot', () => {
  const schema = schemaMarkdown('tiinex.evidence.v1');
  const parsed = parsePortableSchemaDocument(schema);
  assert.equal(parsed.schemaId, 'tiinex.evidence.v1');
  assert.ok(parsed.validation.groups.some((group) => group.name === 'Evidence Material' && group.categories.some((cat)=>cat.name === 'Entry Shape')));
  const binding = schemaRegistry.byId.get('tiinex.evidence.v1').binding;
  assert.equal(binding.publicationState, 'qualified-local-unpublished');
  assert.equal(binding.sourceCommit, '');
  assert.equal(schemaRegistry.byId.get('tiinex.evidence.v1').schemaSource.qualify().state, 'qualified');
});
