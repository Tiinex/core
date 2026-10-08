import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract, validateArtifactCreationResult, listCreatableArtifactSchemas } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';

const evidence = {
  'Supported Claim Or Question': { 'Supported Claim Or Question': 'The screenshots illustrate the documented flow.', 'Evidence Role': 'illustrates the flow' },
  'Known Source': 'Local recording session', 'Preservation Basis': 'A retained source file linked in the same workspace',
  'Provenance Limits': 'One recording, not proof of all environments',
  'Material': '[overview.gif](../presentation/readme/overview.gif); [notes.md](../work/notes.md)',
  'Material Kind': 'screen recording; Markdown notes', 'Preservation State': 'Local assets retained',
  'Fidelity Notes': 'Original captured footage', 'Known Losses': 'None reported',
  'Does Not Prove': 'A release is ready', 'Not Yet Used As': 'Acceptance material', 'Must Not Be Treated As': 'Independent acceptance'
};


test('Evidence continuation is a qualified Core capability when a real Parent is selected in New Artifact', () => {
  const root = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  const continuation = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'continue-from-record' });
  assert.equal(root.status, 'ready');
  assert.equal(continuation.status, 'ready', JSON.stringify(continuation.findings));
  assert.equal(continuation.executionQualification?.state, 'qualified');
  assert.equal(continuation.target?.schemaId, 'tiinex.evidence.v1');
  assert.equal(continuation.transitionType, 'continue-from-record');
  assert.equal(continuation.creation.inputBindings.filter((x) => x.input === 'Supported Claim Or Question').length, 1);
});

test('Evidence is Core-creation-qualified and exposes explicit source-owned reference affordances', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  assert.equal(contract.status, 'ready', JSON.stringify(contract.findings));
  assert.ok(listCreatableArtifactSchemas().some((candidate) => candidate.target?.schemaId === 'tiinex.evidence.v1'));
  assert.equal(contract.creation.inputBindings.filter((input) => input.input === 'Evidence Role').length, 0, 'group members must not be separately required');
  for (const field of ['Material', 'Claim Reference', 'Target Artifact']) {
    const affordance = contract.creation.authoringAffordances.find((item) => item.input === field);
    assert.equal(affordance?.control, 'workspace-file-reference-picker');
    assert.equal(affordance?.manualAllowed, true);
  }
});

test('Evidence creation renders exact structured claim plus relative Markdown asset references and passes validation', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  const markdown = renderArtifactCreationDraftMarkdown(contract, { values: evidence, title: 'README capture evidence', createdAt: '2026-10-08T01:00:00Z' });
  assert.match(markdown, /## Supported Claim Or Question\n\n- Supported Claim Or Question: The screenshots illustrate the documented flow\.\n- Evidence Role: illustrates the flow/);
  assert.match(markdown, /- Material: \[overview\.gif\]\(\.\.\/presentation\/readme\/overview\.gif\); \[notes\.md\]\(\.\.\/work\/notes\.md\)/);
  const verified = validateArtifactCreationResult({ schemaId: 'tiinex.evidence.v1', path: '.topics/work/readme/evidence.trace.md', markdown, sourceMode: 'local-test', status: 'local' }, {}, { contract });
  assert.equal(verified.status, 'valid', JSON.stringify(verified.findings));
});

test('schema group/shadow conflict remains fail closed at renderer boundary', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  assert.throws(() => renderArtifactCreationDraftMarkdown({ ...contract, creation: { ...contract.creation, inputBindings: [...contract.creation.inputBindings, { input: 'Evidence Role', kind: 'ordinary-field', section: 'Supported Claim Or Question', group: 'Supported Claim Or Question', field: 'Evidence Role' }] } }, {
    values: { ...evidence, 'Evidence Role': 'contradicts grouped value' }, title: 'Conflict', createdAt: '2026-10-08T01:00:00Z'
  }), /creation-group-field-shadow-conflict/);
});
