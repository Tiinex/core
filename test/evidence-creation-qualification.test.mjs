import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract, validateArtifactCreationResult, listCreatableArtifactSchemas } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { projectPortableAuthoringParent } from '../src/tooling/portable/editor/authoring.parent.js';
import { createPortableLocalDraft } from '../src/tooling/portable/draft/draft.create.js';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';

const evidence = {
  'Supported Claim Or Question': { 'Supported Claim Or Question': 'The screenshots illustrate the documented flow.', 'Evidence Role': 'illustrates the flow' },
  'Known Source': 'Local recording session', 'Preservation Basis': 'A retained source file linked in the same workspace',
  'Provenance Limits': 'One recording, not proof of all environments',
  'Evidence Material': [
    {name:'recording',fields:{Material:'[overview.gif](../presentation/readme/overview.gif)', 'Material Kind':'screen recording', Description:'Original recording'}},
    {name:'notes',fields:{Material:'[notes.md](../work/notes.md)', 'Material Kind':'Markdown notes', Description:'Related notes'}}
  ], 'Preservation State': 'Local assets retained',
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
  assert.equal(contract.schemaReferences.current.resolutionState, 'qualified');
  assert.match(contract.schemaReferences.current.preferredTarget, /^https:\/\/github\.com\/Tiinex\/docs\/blob\/[0-9a-f]{40}\/\.topics\/\.schemas\/core\/evidence\/tiinex\.evidence\.v1\.schema\.md$/);
  const markdown = renderArtifactCreationDraftMarkdown(contract, { values: evidence, title: 'README capture evidence', createdAt: '2026-10-08T01:00:00Z' });
  assert.ok(markdown.includes(`- Current Schema: [tiinex.evidence.v1](${contract.schemaReferences.current.preferredTarget})`));
  assert.match(markdown, /## Supported Claim Or Question\n\n- Supported Claim Or Question: The screenshots illustrate the documented flow\.\n- Evidence Role: illustrates the flow/);
  assert.match(markdown, /- recording\n  - Material: \[overview\.gif\]/);
  assert.match(markdown, /- notes\n  - Material: \[notes\.md\]/);
  const verified = validateArtifactCreationResult({ schemaId: 'tiinex.evidence.v1', path: '.topics/work/readme/evidence.trace.md', markdown, sourceMode: 'local-test', status: 'local' }, {}, { contract });
  assert.equal(verified.status, 'valid', JSON.stringify(verified.findings));
});

test('schema group/shadow conflict remains fail closed at renderer boundary', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  assert.throws(() => renderArtifactCreationDraftMarkdown({ ...contract, creation: { ...contract.creation, inputBindings: [...contract.creation.inputBindings, { input: 'Evidence Role', kind: 'ordinary-field', section: 'Supported Claim Or Question', group: 'Supported Claim Or Question', field: 'Evidence Role' }] } }, {
    values: { ...evidence, 'Evidence Role': 'contradicts grouped value' }, title: 'Conflict', createdAt: '2026-10-08T01:00:00Z'
  }), /creation-group-field-shadow-conflict/);
});

test('published Evidence Create → Parent qualification → Evidence continuation and deterministic repair', () => {
  const schemaId = 'tiinex.evidence.v1';
  const parentPath = '.topics/evidence/001-observation.trace.md';
  const childPath = '.topics/evidence/001-1-followup.trace.md';
  const contract = buildArtifactCreationContract({ schemaId, transitionType: 'create-artifact' });
  const parent = renderArtifactCreationDraftMarkdown(contract, {
    childPath: parentPath, values: evidence, title: 'First observation', createdAt: '2026-10-10 17:00:00'
  });
  assert.match(parent, /Current Schema: \[tiinex\.evidence\.v1\]\(https:\/\/github\.com\/Tiinex\/docs\/blob\/[0-9a-f]{40}\//);
  const projected = projectPortableAuthoringParent({ records: [{ path: parentPath, markdown: parent, sourceMode: 'portable-node-local' }] });
  assert.equal(projected.status, 'ready', JSON.stringify(projected.findings));
  const created = createPortableLocalDraft({ schemaId, transitionType: 'continue-from-record', path: childPath,
    parent: projected.parentRecord, values: evidence, title: 'Second observation', materials: [] });
  assert.equal(created.status, 'created-clean', JSON.stringify(created.findings));
  assert.match(created.draft.markdown, /Parent Schema: \[tiinex\.evidence\.v1\]\(https:\/\/github\.com\/Tiinex\/docs\/blob\//);
  // Repair the old bare Current Schema without guessed URLs or an independent
  // host-side Markdown patch; Core must also reseal the document atomically.
  const degraded = sealC14nV2Self(parent.replace(/^  - Current Schema: \[tiinex\.evidence\.v1\]\([^)]+\)$/m, '  - Current Schema: tiinex.evidence.v1'));
  assert.equal(degraded.state, 'sealed');
  const assisted = projectPortableEditorAssistance({ records: [{ path: parentPath, markdown: degraded.markdown }], focusPath: parentPath });
  const repair = assisted.documents[0].actions.find((item) => item.id === 'repair-qualified-references-and-self-integrity');
  assert.ok(repair, JSON.stringify(assisted.documents[0].diagnostics));
  assert.match(repair.replacementMarkdown, /Current Schema: \[tiinex\.evidence\.v1\]\(https:\/\/github\.com\/Tiinex\/docs\/blob\//);
  assert.equal(canonicalC14nV2SelfState(repair.replacementMarkdown).state, 'verified');
});
