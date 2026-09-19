import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { projectPortableAuthoringParent } from '../src/tooling/portable/editor/authoring.parent.js';
import { prepareEpistemicMaterialization } from '../src/tooling/portable/materialization/epistemic.plan.js';
import { createPortableLocalDraft } from '../src/tooling/portable/draft/draft.create.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { locateFindingLine, projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';

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

test('editor assistance locates child self mismatch on the primary self Value and offers a deterministic reseal Quick Fix', () => {
  const parentPath = '.topics/source/001-parent.trace.md';
  const childPath = '.topics/target/001-child.trace.md';
  const parent = parentMarkdown(parentPath);
  const projected = projectPortableAuthoringParent({ records: [{ path: parentPath, markdown: parent, sourceMode: 'portable-node-local' }] });
  assert.equal(projected.status, 'ready');
  const created = createPortableLocalDraft({
    schemaId: TOPIC,
    transitionType: 'continue-from-record',
    path: childPath,
    parent: projected.parentRecord,
    values: VALUES,
    title: 'Child',
    materials: []
  });
  assert.equal(created.status, 'created-clean');
  const stale = created.draft.markdown.replace('\nread\n', '\nread after an edit\n');
  const records = [
    { path: parentPath, markdown: parent },
    { path: childPath, markdown: stale }
  ];
  const assistance = projectPortableEditorAssistance({ records, focusPath: childPath });
  const doc = assistance.documents[0];
  const lines = stale.split(/\r?\n/);
  const towardsSelf = lines.findIndex((line) => /^\s+-\s+Towards:\s+self\s*$/.test(line));
  const selfValue = lines.findIndex((line, index) => index > towardsSelf && /^\s+-\s+Value\s*:/.test(line));
  const firstValue = lines.findIndex((line) => /^\s+-\s+Value\s*:/.test(line));
  assert.ok(firstValue >= 0 && selfValue > firstValue, 'fixture must contain a Parent digest before the primary self digest');
  for (const code of ['integrity.c14n-v2.mismatch', 'portable.lineage-integrity.child-self-mismatch']) {
    const diagnostic = doc.diagnostics.find((item) => item.code === code);
    assert.equal(diagnostic?.line, selfValue + 1, `${code} must point at the primary self Value`);
    assert.equal(diagnostic?.locationBasis, 'continuity-integrity-primary-self-value');
  }
  const action = doc.actions.find((item) => item.id === 'refresh-primary-self-integrity');
  assert.ok(action, 'self mismatch must expose the deterministic Core reseal action');
  assert.ok(action.diagnosticCodes.includes('portable.lineage-integrity.child-self-mismatch'));
  const repaired = projectPortableEditorAssistance({ records: [{ path: parentPath, markdown: parent }, { path: childPath, markdown: action.replacementMarkdown }], focusPath: childPath });
  assert.equal(repaired.documents[0].diagnostics.some((item) => item.code === 'integrity.c14n-v2.mismatch' || item.code === 'portable.lineage-integrity.child-self-mismatch'), false);
});

test('self-integrity diagnostic ignores generic field:Value evidence and anchors the Towards:self digest', () => {
  const markdown = `# Continuity Context

- Current
  - Current Schema: tiinex.topic.v1

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [parent](parent.trace.md)
  - Value: parent-digest

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: self-digest
`;
  const lines = markdown.split(/\r?\n/);
  const parentValue = lines.findIndex((line) => /Value: parent-digest/.test(line));
  const selfValue = lines.findIndex((line) => /Value: self-digest/.test(line));
  assert.ok(selfValue > parentValue);
  for (const code of ['integrity.c14n-v2.mismatch', 'portable.lineage-integrity.child-self-mismatch']) {
    const located = locateFindingLine({ code, params: { field: 'Value' }, message: 'c14n-v2 self-integrity does not match canonical artifact bytes.' }, markdown);
    assert.equal(located.line, selfValue + 1, `${code} must outrank generic field:Value placement`);
    assert.equal(located.locationBasis || located.basis, 'continuity-integrity-primary-self-value');
  }
});

test('editor assistance validates exact schema permalinks against explicit host resolution evidence and offers latest as warning-only stale Quick Fix', () => {
  const childPath = '.topics/target/001-reference-resolution.trace.md';
  const markdown = parentMarkdown(childPath);
  const target = markdown.match(/- Current Schema: \[tiinex\.topic\.v1\]\((https:\/\/github\.com\/[^)]+)\)/)?.[1] || '';
  assert.ok(target);
  const latestTarget = target.replace(/\/blob\/[^/]+\//, '/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/');
  const stale = projectPortableEditorAssistance({
    records: [{ path: childPath, markdown }], focusPath: childPath,
    referenceResolutions: [{ path: childPath, target, exact: { state: 'resolved', sha256: 'old-bytes' }, latest: { state: 'resolved', target: latestTarget, sha256: 'new-bytes' } }]
  });
  const staleDoc = stale.documents[0];
  const diagnostic = staleDoc.diagnostics.find((item) => item.code === 'reference.permalink.stale');
  assert.equal(diagnostic?.severity, 'warning');
  assert.match(diagnostic?.message || '', /master contains different bytes/i);
  const action = staleDoc.actions.find((item) => item.diagnosticCodes?.includes('reference.permalink.stale'));
  assert.ok(action);
  assert.match(action.title, /Upgrade Current Schema permalink to latest/);
  assert.match(action.replacementMarkdown, new RegExp(latestTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(canonicalC14nV2SelfState(action.replacementMarkdown).state, 'verified');

  const same = projectPortableEditorAssistance({
    records: [{ path: childPath, markdown }], focusPath: childPath,
    referenceResolutions: [{ path: childPath, target, exact: { state: 'resolved', sha256: 'same' }, latest: { state: 'resolved', target: latestTarget, sha256: 'same' } }]
  });
  assert.equal(same.documents[0].diagnostics.some((item) => item.code === 'reference.permalink.stale'), false);
  assert.equal(same.documents[0].actions.some((item) => item.diagnosticCodes?.includes('reference.permalink.stale')), false);
});

test('editor assistance reports an unresolved schema permalink as error and offers master repair only when host resolution proves a latest candidate', () => {
  const childPath = '.topics/target/001-unresolved-reference.trace.md';
  const original = parentMarkdown(childPath);
  const target = original.match(/- Current Schema: \[tiinex\.topic\.v1\]\((https:\/\/github\.com\/[^)]+)\)/)?.[1] || '';
  const brokenTarget = target.replace(/\/blob\/[^/]+\//, '/blob/foobar/');
  const broken = sealC14nV2Self(original.replace(target, brokenTarget));
  assert.equal(broken.state, 'sealed');
  const latestTarget = target.replace(/\/blob\/[^/]+\//, '/blob/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/');
  const assistance = projectPortableEditorAssistance({
    records: [{ path: childPath, markdown: broken.markdown }], focusPath: childPath,
    referenceResolutions: [{ path: childPath, target: brokenTarget, exact: { state: 'missing' }, latest: { state: 'resolved', target: latestTarget, sha256: 'latest' } }]
  });
  const doc = assistance.documents[0];
  const diagnostic = doc.diagnostics.find((item) => item.code === 'reference.permalink.unresolved');
  assert.equal(diagnostic?.severity, 'error');
  const action = doc.actions.find((item) => item.diagnosticCodes?.includes('reference.permalink.unresolved'));
  assert.ok(action);
  assert.match(action.title, /Repair Current Schema permalink to latest/);
  assert.match(action.replacementMarkdown, /\/blob\/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\//);
  assert.equal(canonicalC14nV2SelfState(action.replacementMarkdown).state, 'verified');

  const noLatest = projectPortableEditorAssistance({
    records: [{ path: childPath, markdown: broken.markdown }], focusPath: childPath,
    referenceResolutions: [{ path: childPath, target: brokenTarget, exact: { state: 'missing' }, latest: { state: 'missing' } }]
  });
  assert.equal(noLatest.documents[0].diagnostics.find((item) => item.code === 'reference.permalink.unresolved')?.severity, 'error');
  assert.equal(noLatest.documents[0].actions.some((item) => item.diagnosticCodes?.includes('reference.permalink.unresolved')), false);
});

test('local continuation preserves the exact declared Parent Schema target when its reference authority is unresolved', () => {
  const parentPath = '.topics/source/001-parent.trace.md';
  const parent = parentMarkdown(parentPath);
  const projected = projectPortableAuthoringParent({ records: [{ path: parentPath, markdown: parent, sourceMode: 'portable-node-local' }] });
  assert.equal(projected.status, 'ready');
  const originalTarget = projected.parentRecord.schemaReferenceAuthority.preferredTarget;
  const unresolvedParent = {
    ...projected.parentRecord,
    schemaReferenceAuthority: {
      ...projected.parentRecord.schemaReferenceAuthority,
      resolutionState: 'unresolved'
    }
  };
  const created = createPortableLocalDraft({
    schemaId: TOPIC,
    transitionType: 'continue-from-record',
    path: '.topics/target/001-local-continuity-child.trace.md',
    parent: unresolvedParent,
    values: VALUES,
    title: 'Local Continuity Child',
    materials: []
  });
  assert.equal(created.status, 'created-local-continuity');
  assert.equal(created.findings.some((item) => item.severity === 'error'), false);
  assert.match(created.draft.markdown, new RegExp(`- Parent Schema: \\[tiinex\\.topic\\.v1\\]\\(${originalTarget.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\)`));
  assert.match(created.draft.markdown, /- Trace: \[001-parent\.trace\.md\]\(\.\.\/source\/001-parent\.trace\.md\)/);
  assert.match(created.draft.markdown, /- Origin:\n    - \[relative\]\(\.\.\/source\/001-parent\.trace\.md\)/);
});

test('Feedback continuation composes exact inherited Signal creation bindings and renders a valid child', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.feedback.v1', transitionType: 'continue-from-record' });
  assert.equal(contract.status, 'ready');
  assert.deepEqual(contract.creation.requiredSections, [
    'Observed Signal', 'Source', 'Interpretation', 'Limits', 'Feedback Target', 'Feedback Received', 'Disposition'
  ]);
  for (const input of ['Summary', 'Observed Signal', 'Source', 'Interpretation', 'Limits', 'Feedback Target', 'Feedback Received', 'Disposition']) {
    assert.ok(contract.creation.requiredInputs.includes(input), `missing inherited/child creation input ${input}`);
  }
  const parentPath = '.topics/source/001-parent.trace.md';
  const parent = parentMarkdown(parentPath);
  const projected = projectPortableAuthoringParent({ records: [{ path: parentPath, markdown: parent, sourceMode: 'portable-node-local' }] });
  assert.equal(projected.status, 'ready');
  const created = createPortableLocalDraft({
    schemaId: 'tiinex.feedback.v1',
    transitionType: 'continue-from-record',
    path: '.topics/source/001-1-feedback.trace.md',
    parent: projected.parentRecord,
    values: {
      Summary: 'Feedback test',
      'Observed Signal': 'The selected Parent artifact was reviewed.',
      Source: 'The exact local Parent bytes selected by the operator.',
      Interpretation: 'The feedback is bounded to the selected Parent.',
      Limits: 'No authority beyond this feedback artifact.',
      'Feedback Target': 'The selected Parent artifact.',
      'Feedback Received': 'The operator supplied the feedback.',
      Disposition: 'Record the feedback for the Parent lineage.'
    },
    title: 'Feedback test',
    materials: []
  });
  assert.equal(created.status, 'created-clean');
  assert.equal(created.findings.some((item) => item.severity === 'error'), false);
  for (const heading of ['Observed Signal', 'Source', 'Interpretation', 'Limits', 'Feedback Target', 'Feedback Received', 'Disposition']) {
    assert.match(created.draft.markdown, new RegExp(`^## ${heading}$`, 'm'));
  }
});
