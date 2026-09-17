import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortableLocalDraft } from '../src/tooling/portable/draft/draft.create.js';

test('root create-artifact does not require a Parent and uses exact Core renderer when available', () => {
  const result = createPortableLocalDraft({
    schemaId: 'tiinex.task.v1',
    transitionType: 'create-artifact',
    path: '.topics/001-test.trace.md',
    title: 'Test',
    createdAt: '2026-09-17 23:45:00',
    values: {
      Summary: 'Test',
      Objective: 'test',
      'Done Criteria': 'test',
      Scope: 'test',
      Dependencies: 'test'
    }
  });
  assert.equal(result.status, 'created-clean');
  assert.equal(result.qualification.exactCreateToolingApplied, true);
  assert.equal(result.findingSummary.counts.error, 0);
  assert.match(result.draft.markdown, /- Current Schema: \[tiinex\.task\.v1\]\(/);
  assert.doesNotMatch(result.draft.markdown, /^- Parent$/m);
});
