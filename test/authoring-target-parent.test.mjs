import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { projectPortableAuthoringParent } from '../src/tooling/portable/editor/authoring.parent.js';
import { prepareEpistemicMaterialization } from '../src/tooling/portable/materialization/epistemic.plan.js';
import { createPortableLocalDraft } from '../src/tooling/portable/draft/draft.create.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';

const TOPIC = 'tiinex.topic.v1';
const VALUES = Object.freeze({ 'Current Read': 'read', 'Design Direction': 'direction', 'Next Artifacts': 'next' });

function parentMarkdown(path = '.topics/source/001-parent.trace.md') {
  const contract = buildArtifactCreationContract({ schemaId: TOPIC, transitionType: 'create-artifact' });
  return renderArtifactCreationDraftMarkdown(contract, {
    currentSchemaId: TOPIC,
    childPath: path,
    values: VALUES,
    title: 'Parent',
    summary: 'Parent',
    createdAt: '2026-09-18 12:00:00'
  });
}

test('authoring Parent keeps exact canonical declared schema target qualified', () => {
  const markdown = parentMarkdown();
  const result = projectPortableAuthoringParent({ records: [{ path: '.topics/source/001-parent.trace.md', markdown, sourceMode: 'portable-node-local' }] });
  assert.equal(result.status, 'ready');
  assert.equal(result.parentRecord.schemaReferenceAuthority.resolutionState, 'qualified');
  assert.match(result.parentRecord.schemaReferenceAuthority.preferredTarget, /\/tiinex\.topic\.v1\.schema\.md$/);
});

test('materialization keeps target directory independent from same-workspace Parent directory', () => {
  const markdown = parentMarkdown('.topics/source/001-parent.trace.md');
  const projected = projectPortableAuthoringParent({ records: [{ path: '.topics/source/001-parent.trace.md', markdown, sourceMode: 'portable-node-local' }] });
  const plan = prepareEpistemicMaterialization({
    records: [], files: [],
    proposals: [{
      id: 'child', schemaId: TOPIC, title: 'Child', values: VALUES,
      parentRef: '.topics/source/001-parent.trace.md', parentRecord: projected.parentRecord,
      targetDirectory: '.topics/target', mode: 'continue', rationale: 'test', evidenceRefs: ['test']
    }]
  });
  assert.equal(plan.status, 'ready');
  assert.match(plan.proposals[0].path, /^\.topics\/target\/001-child\.trace\.md$/);
});


test('explicit repository-root target directory allocates in the repository root', () => {
  const plan = prepareEpistemicMaterialization({
    records: [], files: [],
    proposals: [{ id: 'root-child', schemaId: TOPIC, title: 'Root Child', values: VALUES, targetDirectory: '.', mode: 'root', rationale: 'test', evidenceRefs: ['test'] }]
  });
  assert.equal(plan.status, 'ready');
  assert.equal(plan.proposals[0].path, '001-root-child.trace.md');
});

test('Workspace-qualified Parent renders and validates clean while child stays in target Workspace directory', () => {
  const markdown = parentMarkdown('.topics/source/001-parent.trace.md');
  const reference = 'business::.topics/source/001-parent.trace.md';
  const projected = projectPortableAuthoringParent({ reference, records: [{ path: '001-parent.trace.md', markdown, sourceMode: 'portable-node-local' }] });
  assert.equal(projected.status, 'ready');
  assert.equal(projected.parentRecord.recoveryMode, 'workspace-qualified');
  assert.equal(projected.parentRecord.path, reference);

  const plan = prepareEpistemicMaterialization({
    records: [], files: [],
    proposals: [{
      id: 'child', schemaId: TOPIC, title: 'Child', values: VALUES,
      parentRef: reference, parentRecord: projected.parentRecord,
      targetDirectory: '.topics/discussions', mode: 'continue', rationale: 'test', evidenceRefs: ['test']
    }]
  });
  assert.equal(plan.status, 'ready');
  assert.equal(plan.proposals[0].path, '.topics/discussions/001-child.trace.md');

  const created = createPortableLocalDraft({
    schemaId: TOPIC,
    transitionType: 'continue-from-record',
    path: plan.proposals[0].path,
    parent: projected.parentRecord,
    values: VALUES,
    title: 'Child',
    materials: []
  });
  assert.equal(created.status, 'created-clean');
  assert.equal(created.findings.some((item) => item.severity === 'error'), false);
  assert.match(created.draft.markdown, /- Trace: \[001-parent\.trace\.md\]\(business::\.topics\/source\/001-parent\.trace\.md\)/);
  assert.match(created.draft.markdown, /- Current Schema: \[tiinex\.topic\.v1\]\(https:\/\/github\.com\/Tiinex\/docs\/blob\//);
});


test('authoring Parent permits direct continuation from exact verified bytes carrying only historical malformed ancestor recovery debt', () => {
  const rootMarkdown = parentMarkdown('.topics/source/001-parent.trace.md');
  const externalReference = 'business::.topics/source/001-parent.trace.md';
  const externalParent = projectPortableAuthoringParent({ reference: externalReference, records: [{ path: '001-parent.trace.md', markdown: rootMarkdown, sourceMode: 'portable-node-local' }] });
  assert.equal(externalParent.status, 'ready');
  const created = createPortableLocalDraft({
    schemaId: TOPIC,
    transitionType: 'continue-from-record',
    path: '.topics/target/001-legacy-child.trace.md',
    parent: externalParent.parentRecord,
    values: VALUES,
    title: 'Legacy Child',
    materials: []
  });
  assert.equal(created.status, 'created-clean');
  const legacy = sealC14nV2Self(created.draft.markdown.replaceAll('](business::', '](../../business::'));
  assert.equal(legacy.state, 'sealed');

  const projected = projectPortableAuthoringParent({
    reference: '.topics/target/001-legacy-child.trace.md',
    records: [{ path: '.topics/target/001-legacy-child.trace.md', markdown: legacy.markdown, sourceMode: 'portable-node-local' }]
  });
  assert.equal(projected.status, 'ready');
  assert.equal(projected.parentRecord.path, '.topics/target/001-legacy-child.trace.md');
  assert.equal(projected.findings.some((item) => item.code === 'portable.authoring-parent.historical-ancestor-recovery-debt'), true);
});

test('editor assistance offers deterministic repair for malformed Workspace-qualified Parent locators on a leaf', () => {
  const rootMarkdown = parentMarkdown('.topics/source/001-parent.trace.md');
  const externalParent = projectPortableAuthoringParent({ reference: 'business::.topics/source/001-parent.trace.md', records: [{ path: '001-parent.trace.md', markdown: rootMarkdown, sourceMode: 'portable-node-local' }] });
  const created = createPortableLocalDraft({
    schemaId: TOPIC,
    transitionType: 'continue-from-record',
    path: '.topics/target/001-legacy-child.trace.md',
    parent: externalParent.parentRecord,
    values: VALUES,
    title: 'Legacy Child',
    materials: []
  });
  const legacy = sealC14nV2Self(created.draft.markdown.replaceAll('](business::', '](../../business::'));
  assert.equal(legacy.state, 'sealed');
  const assistance = projectPortableEditorAssistance({ records: [{ path: '.topics/target/001-legacy-child.trace.md', markdown: legacy.markdown }], focusPath: '.topics/target/001-legacy-child.trace.md' });
  const action = assistance.documents[0].actions.find((item) => item.id === 'repair-qualified-references-and-self-integrity');
  assert.ok(action);
  assert.doesNotMatch(action.replacementMarkdown, /\.\.\/\.\.\/business::/);
  assert.match(action.replacementMarkdown, /\]\(business::\.topics\/source\/001-parent\.trace\.md\)/);
});
