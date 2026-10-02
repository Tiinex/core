import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableLineageOperativeState } from '../src/tooling/portable/lineage/lineage.operativeState.js';
import { portableOperationCatalog } from '../src/tooling/portable/operation.catalog.js';

function record(path, schemaId, trace = '') {
  return { id: path, path, title: path.split('/').pop(), schemaId, trace, hasContinuityContext: true, hasIntegrity: true, markdown: '' };
}
function lifecycle(target, closure, readiness = 'not-applicable') {
  return { target, projection: { status: 'qualified-projection', closure: { state: closure }, readiness: { state: readiness }, retest: { state: closure === 'closed' ? 'passed' : 'not-observed' }, nextAction: { kind: closure === 'closed' ? 'none-unless-authoritatively-reopened' : 'invoke-authorized-retest' } } };
}

const root = 'work/foo/001-task.trace.md';
const child = 'work/foo/001-1-task.trace.md';
const evidence = 'work/foo/001-1-1-evidence.trace.md';
const records = [
  record(root, 'tiinex.task.v1'),
  record(child, 'tiinex.task.v1', '001-task.trace.md'),
  record(evidence, 'tiinex.evidence.v1', '001-1-task.trace.md')
];

test('projects children, leaves, explicit currentness, and lifecycle as separate axes', () => {
  const result = projectPortableLineageOperativeState({ records, currentness: [
    { target: root, state: 'historical', qualification: 'qualified', basis: 'explicit frontier receipt' },
    { target: child, state: 'current', qualification: 'qualified', basis: 'selected current work receipt' }
  ], lifecycle: [lifecycle(root, 'closed'), lifecycle(child, 'open', 'ready-for-retest')] });
  const byPath = new Map(result.nodes.map((node) => [node.path, node]));
  assert.deepEqual(byPath.get(root).topology.children, [child]);
  assert.equal(byPath.get(root).topology.role, 'root');
  assert.equal(byPath.get(child).topology.role, 'intermediate');
  assert.equal(byPath.get(evidence).topology.role, 'leaf');
  assert.equal(byPath.get(root).currentness.state, 'historical');
  assert.equal(byPath.get(root).lifecycle.state, 'closed');
  assert.equal(byPath.get(child).currentness.state, 'current');
  assert.equal(byPath.get(child).lifecycle.state, 'open');
  assert.equal(byPath.get(evidence).currentness.state, 'unresolved');
  assert.equal(byPath.get(evidence).lifecycle.state, 'not-applicable');
});

test('superseded currentness requires explicit qualified fact and preserves successor', () => {
  const result = projectPortableLineageOperativeState({ records: [record(root, 'tiinex.task.v1')], currentness: [{ target: root, state: 'superseded', qualification: 'qualified', basis: 'qualified supersession receipt', supersededBy: 'work/foo/002-task.trace.md' }] });
  assert.equal(result.nodes[0].currentness.state, 'superseded');
  assert.equal(result.nodes[0].currentness.supersededBy, 'work/foo/002-task.trace.md');
  assert.equal(result.nodes[0].lifecycle.state, 'unresolved');
});

test('conflicting qualified currentness facts fail closed instead of using order', () => {
  const result = projectPortableLineageOperativeState({ records: [record(root, 'tiinex.task.v1')], currentness: [
    { target: root, state: 'current', qualification: 'qualified', basis: 'receipt A' },
    { target: root, state: 'historical', qualification: 'qualified', basis: 'receipt B' }
  ] });
  assert.equal(result.nodes[0].currentness.state, 'unresolved');
  assert.ok(result.findings.some((finding) => finding.code === 'lineage.operative-state.currentness.conflict'));
});

test('lexical lifecycle/status fields do not establish currentness or closure', () => {
  const result = projectPortableLineageOperativeState({ records: [{ ...record(root, 'tiinex.task.v1'), status: 'done', currentStatus: 'accepted', lifecycleStatus: 'closed' }] });
  assert.equal(result.nodes[0].currentness.state, 'unresolved');
  assert.equal(result.nodes[0].lifecycle.state, 'unresolved');
});

test('portable operation catalog exposes the read-only operative-state projection', () => {
  const op = portableOperationCatalog['project-lineage-operative-state'];
  assert.ok(op);
  assert.equal(op.safety, 'read-only');
  const result = op.handler({ records: [record(root, 'tiinex.task.v1')] });
  assert.equal(result.operation, 'project-lineage-operative-state');
  assert.equal(result.resultSchema, 'tiinex.portable.lineage-operative-state.v1');
});
