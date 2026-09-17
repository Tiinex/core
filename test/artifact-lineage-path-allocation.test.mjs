import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateRootArtifactPath, allocateContinuationPath } from '../src/transitions/record.transitions.js';

test('root artifact allocation uses the directory-local numeric lineage namespace', () => {
  const first = allocateRootArtifactPath({ targetId: 'tiinex.topic.v1', title: 'Tower Havoc' }, { existingPaths: [] });
  assert.equal(first.path, '.topics/001-tower-havoc.trace.md');
  const second = allocateRootArtifactPath({ targetId: 'tiinex.task.v1', title: 'Second' }, { existingPaths: [first.path] });
  assert.equal(second.path, '.topics/002-second.trace.md');
});

test('continuation artifact allocation extends the parent lineage and allocates siblings', () => {
  const parentRecord = { path: '.topics/001-tower-havoc.trace.md', title: 'Tower Havoc', schemaId: 'tiinex.topic.v1' };
  const first = allocateContinuationPath({ parentRecord, targetId: 'tiinex.task.v1', title: 'First task' }, { existingPaths: [parentRecord.path] });
  assert.equal(first.path, '.topics/001-1-first-task.trace.md');
  const second = allocateContinuationPath({ parentRecord, targetId: 'tiinex.task.v1', title: 'Second task' }, { existingPaths: [parentRecord.path, first.path] });
  assert.equal(second.path, '.topics/001-2-second-task.trace.md');
});
