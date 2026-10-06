import test from 'node:test';
import assert from 'node:assert/strict';
import { hasTiinexEnvelopeFirstLine } from '../src/artifacts/artifact.parse.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';
import { projectPortableStagedValidation } from '../src/tooling/portable/editor/staged.validation.js';

test('Tiinex Markdown ingress is declared only by the first-line Continuity Context envelope marker', () => {
  assert.equal(hasTiinexEnvelopeFirstLine('# Continuity Context\n\n- Current\n'), true);
  assert.equal(hasTiinexEnvelopeFirstLine('\ufeff# Continuity Context\r\n\r\n- Current\r\n'), true);
  assert.equal(hasTiinexEnvelopeFirstLine('# README\n\n# Continuity Context\n'), false);
  assert.equal(hasTiinexEnvelopeFirstLine('Handoff package attached.\n\n# Continuity Context\n'), false);
  assert.equal(hasTiinexEnvelopeFirstLine(''), false);
});

test('editor assistance ignores ordinary Markdown before audit, lineage and schema validation', () => {
  const result = projectPortableEditorAssistance({
    records: [{ path: 'transport.md', markdown: 'Handoff package attached.\n\nEntry intent: Resume\n' }],
    focusPath: 'transport.md'
  });
  assert.equal(result.status, 'clean');
  assert.deepEqual(result.documents, []);
});

test('editor assistance still validates malformed Markdown that explicitly declares the Tiinex envelope marker', () => {
  const path = '.topics/testing/malformed.trace.md';
  const result = projectPortableEditorAssistance({
    records: [{ path, markdown: '# Continuity Context\n\nThis intentionally lacks a Current Schema.\n' }],
    focusPath: path
  });
  assert.equal(result.documents.length, 1);
  assert.ok(result.documents[0].diagnostics.length > 0, 'declared Tiinex ingress must not be silently ignored merely because the artifact is malformed');
});

test('staged validation ignores ordinary Markdown but includes malformed first-line Tiinex artifacts', () => {
  const plain = projectPortableStagedValidation({
    records: [{ path: 'notes.md', markdown: '# Notes\n\nordinary Markdown\n' }],
    stagedPaths: ['notes.md']
  });
  assert.equal(plain.state, 'no-staged-tiinex');
  assert.deepEqual(plain.stagedTiinexPaths, []);
  assert.deepEqual(plain.ignoredStagedPaths, ['notes.md']);

  const malformedPath = '.topics/testing/malformed.trace.md';
  const malformed = projectPortableStagedValidation({
    records: [{ path: malformedPath, markdown: '# Continuity Context\n\nmalformed Tiinex artifact\n' }],
    stagedPaths: [malformedPath]
  });
  assert.deepEqual(malformed.stagedTiinexPaths, [malformedPath]);
  assert.notEqual(malformed.state, 'no-staged-tiinex');
  assert.equal(malformed.documents.length, 1);
});
