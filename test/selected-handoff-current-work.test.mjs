import test from 'node:test';
import assert from 'node:assert/strict';
import { projectSelectedHandoffCurrentWork } from '../src/tooling/portable/grounding/grounding.readiness.support.js';

function task(id, path, title='Task', status='ready/local') {
  return Object.freeze({ id, path, title, declaredStatus: status, objective: 'bounded work' });
}
function record(path, schemaId) {
  return Object.freeze({ id: path, path, schemaId, hasContinuityContext: true, hasIntegrity: true });
}
function authority(transfers=[]) {
  return Object.freeze({
    selectedRoute: Object.freeze({ workspaceId: 'business', workspaceRelativeHandoffPath: '.topics/processes/gpt/grounding/current.trace.md' }),
    handoff: Object.freeze({ transfers: Object.freeze(transfers.map((item) => Object.freeze(item))) })
  });
}

const stale = task('business/.topics/tasks/stale.trace.md','business/.topics/tasks/stale.trace.md','Historical-but-nonterminal Task');

test('explicit selected-Handoff non-Task controls suppress nearest Task promotion', () => {
  const result = projectSelectedHandoffCurrentWork(
    authority([
      { id:'blocker', transferKind:'work-and-responsibility', controllingArtifactTarget:'previous.trace.md' },
      { id:'freeze', transferKind:'responsibility', controllingArtifactTarget:'../../../decisions/freeze.trace.md' }
    ]),
    [
      record('business/.topics/processes/gpt/grounding/previous.trace.md','tiinex.handoff.v1'),
      record('business/.topics/decisions/freeze.trace.md','tiinex.decision.v1'),
      record(stale.path,'tiinex.task.v1')
    ],
    { currentTasks:[stale], currentFrontier:[stale] }
  );
  assert.equal(result.state,'selected-handoff-bounded-work');
  assert.equal(result.mode,'selected-handoff-explicit-control');
  assert.equal(result.actReady,true);
  assert.deepEqual(result.frontier,[]);
  assert.equal(result.contextCandidates.length,1);
  assert.equal(result.contextCandidates[0].path,stale.path);
  assert.equal(result.controls.length,2);
  assert.ok(result.controls.every((item)=>item.state==='qualified'));
  assert.match(result.boundary,/No Task is therefore promoted to current/);
});

test('explicit selected-Handoff Task control selects that Task instead of a nearer unrelated Task', () => {
  const selected = task('business/.topics/tasks/current.trace.md','business/.topics/tasks/current.trace.md','Selected Task');
  const result = projectSelectedHandoffCurrentWork(
    authority([{ id:'work', transferKind:'work-and-responsibility', controllingArtifactTarget:'../../../tasks/current.trace.md' }]),
    [record(selected.path,'tiinex.task.v1'),record(stale.path,'tiinex.task.v1')],
    { currentTasks:[selected,stale], currentFrontier:[stale] }
  );
  assert.equal(result.state,'selected-handoff-task-frontier-resolved');
  assert.equal(result.actReady,true);
  assert.equal(result.frontier.length,1);
  assert.equal(result.frontier[0].path,selected.path);
  assert.equal(result.contextCandidates.length,1);
  assert.equal(result.contextCandidates[0].path,stale.path);
});

test('unresolved explicit selected-Handoff control fails closed and does not fall back to nearest Task', () => {
  const result = projectSelectedHandoffCurrentWork(
    authority([{ id:'missing', transferKind:'work-and-responsibility', controllingArtifactTarget:'missing.trace.md' }]),
    [record(stale.path,'tiinex.task.v1')],
    { currentTasks:[stale], currentFrontier:[stale] }
  );
  assert.equal(result.state,'selected-handoff-current-work-unresolved');
  assert.equal(result.actReady,false);
  assert.deepEqual(result.frontier,[]);
  assert.equal(result.contextCandidates[0].path,stale.path);
  assert.equal(result.unresolved[0].code,'selected-handoff-control-record-not-loaded');
});

test('nearest Task compatibility fallback remains only when selected Handoff declares no controlling artifact', () => {
  const result = projectSelectedHandoffCurrentWork(
    authority([{ id:'work', transferKind:'responsibility', controllingArtifactTarget:'' }]),
    [record(stale.path,'tiinex.task.v1')],
    { currentTasks:[stale], currentFrontier:[stale] }
  );
  assert.equal(result.state,'nearest-task-frontier-resolved');
  assert.equal(result.mode,'nearest-task-ancestor-fallback');
  assert.equal(result.actReady,true);
  assert.equal(result.frontier[0].path,stale.path);
  assert.deepEqual(result.contextCandidates,[]);
});
