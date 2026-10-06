import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableLineageRelationNeighborhood } from '../src/tooling/portable/lineage/lineage.relationNeighborhood.js';
import { portableOperationCatalog } from '../src/tooling/portable/operation.catalog.js';

function record({ workspaceId = 'business', path, schemaId = 'tiinex.task.v1', trace = '', markdown = '', title = '' }) {
  return { id: path, workspaceId, path, title: title || path.split('/').pop(), schemaId, trace, markdown, hasContinuityContext: true, hasIntegrity: true, sourceMode: 'portable-local' };
}

const taskPath = '.topics/work/018-task.trace.md';
const priorPath = '.topics/work/018-13-prior-handoff.trace.md';
const handoffPath = '.topics/work/018-14-current-handoff.trace.md';
const corePath = '.topics/work/guided-entry/001-core-work.trace.md';

const task = record({ path: taskPath, title: 'Task 018' });
const prior = record({ path: priorPath, schemaId: 'tiinex.handoff.v1', trace: taskPath, title: 'Prior Handoff', markdown: `# Continuity Context\n\n---\n\n## Transfers\n\n- continue\n  - Controlling Artifact: [Task](018-task.trace.md)\n` });
const core = record({ workspaceId: 'core', path: corePath, title: 'Core Work' });
const handoff = record({ path: handoffPath, schemaId: 'tiinex.handoff.v1', trace: taskPath, title: 'Current Handoff', markdown: `# Continuity Context\n\n---\n\n## Transfers\n\n- continue\n  - Controlling Artifact: [Task](018-task.trace.md)\n\n## Required Context\n\n- prior-frontier\n  - Material Reference: [Prior](018-13-prior-handoff.trace.md)\n- core-reference\n  - Material Reference: [Core Work](core::.topics/work/guided-entry/001-core-work.trace.md)\n` });

test('projects an explicit focused relation neighborhood without choosing a semantic winner', () => {
  const result = projectPortableLineageRelationNeighborhood({ representationCoverage: 'complete', records: [task, prior, handoff, core], focus: `business::${handoffPath}`, depth: 1 });
  assert.equal(result.status, 'ready');
  assert.equal(result.focus.resolved.length, 1);
  assert.equal(result.boundary.semanticWinnerSelection, 'forbidden');
  const kinds = new Set(result.edges.map((edge) => edge.kind));
  assert.ok(kinds.has('parent'));
  assert.ok(kinds.has('handoff-controlling-artifact'));
  assert.ok(kinds.has('handoff-required-context'));
  assert.ok(result.nodes.some((node) => node.id === `core::${corePath}`));
  assert.equal(result.edges.some((edge) => edge.declaredBy === `business::${priorPath}`), false, 'depth=1 must not pull sibling edges merely because their shared parent entered the projected node set');
  const successor = result.negativeEvidence.find((item) => item.kind === 'successor');
  assert.equal(successor.state, 'not-observed-in-loaded-representation');
  assert.equal(successor.qualification, 'qualified-only-within-loaded-representation');
});

test('depth=2 expands through the first-hop frontier without changing depth=1 semantics', () => {
  const result = projectPortableLineageRelationNeighborhood({ representationCoverage: 'complete', records: [task, prior, handoff, core], focus: `business::${handoffPath}`, depth: 2 });
  assert.ok(result.edges.some((edge) => edge.declaredBy === `business::${priorPath}`));
});

test('unresolved references outside the selected neighborhood do not leak findings into the focused projection', () => {
  const unrelated = record({ path: '.topics/work/999-unrelated.trace.md', schemaId: 'tiinex.handoff.v1', title: 'Unrelated', markdown: `# Continuity Context\n\n---\n\n## Required Context\n\n- missing\n  - Material Reference: [Missing](does-not-exist.trace.md)\n` });
  const result = projectPortableLineageRelationNeighborhood({ representationCoverage: 'complete', records: [task, prior, handoff, core, unrelated], focus: `business::${handoffPath}`, depth: 1 });
  assert.equal(result.findings.some((finding) => finding.code === 'lineage.relation-neighborhood.target.unresolved'), false);
});

test('bounded coverage keeps negative evidence scope-limited', () => {
  const result = projectPortableLineageRelationNeighborhood({ representationCoverage: 'bounded', records: [task, handoff], focus: `business::${handoffPath}` });
  const successor = result.negativeEvidence.find((item) => item.kind === 'successor');
  assert.equal(successor.qualification, 'scope-limited');
  assert.match(successor.boundary, /never global absence/i);
});

test('qualified supersession is explicit invocation input and never inferred from chronology', () => {
  const successorPath = '.topics/work/019-successor.trace.md';
  const successor = record({ path: successorPath, title: 'Successor' });
  const result = projectPortableLineageRelationNeighborhood({ records: [task, successor], focus: `business::${taskPath}`, currentness: [{ target: `business::${taskPath}`, state: 'superseded', qualification: 'qualified', basis: 'explicit receipt', supersededBy: `business::${successorPath}` }] });
  assert.equal(result.categories.supersession, 1);
  const edge = result.edges.find((item) => item.kind === 'qualified-currentness-supersession');
  assert.ok(edge);
  assert.equal(edge.from, `business::${taskPath}`);
  assert.equal(edge.to, `business::${successorPath}`);
});

test('ambiguous focus fails closed instead of selecting by arrival order', () => {
  const duplicate = record({ workspaceId: 'other', path: taskPath, title: 'Duplicate path' });
  const result = projectPortableLineageRelationNeighborhood({ records: [task, duplicate], focus: taskPath });
  assert.equal(result.status, 'scope-unresolved');
  assert.equal(result.focus.resolved.length, 0);
  assert.equal(result.focus.ambiguous.length, 1);
  assert.ok(result.findings.some((finding) => finding.code === 'lineage.relation-neighborhood.focus.ambiguous'));
});

test('portable operation catalog exposes relation-neighborhood projection as read-only', () => {
  const op = portableOperationCatalog['project-lineage-relation-neighborhood'];
  assert.ok(op);
  assert.equal(op.safety, 'read-only');
  const result = op.handler({ records: [task], focus: `business::${taskPath}` });
  assert.equal(result.operation, 'project-lineage-relation-neighborhood');
  assert.equal(result.resultSchema, 'tiinex.portable.lineage-relation-neighborhood.v1');
});
