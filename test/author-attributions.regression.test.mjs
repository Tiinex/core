import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArtifactMarkdown, parseAuthorAttributions, projectApplicationData } from '../src/public/index.js';
import { buildArtifactCreationContract, validateArtifactCreationResult } from '../src/schemas/creation.contracts.js';

const AUTHORS = '[Anchor](https://example.org/role) (ChatGPT Web | GPT-6); [Sigma](https://example.org/role-sigma) ([Olle](https://example.org/identity))';
const envelope = (authors) => `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-10-14 10:00:00\n  - Authors: ${authors}\n  - Summary: Test\n\n---\n\n# Test\n`;

test('optional linked Authors preserve exact markdown and independent entries', () => {
  const current = parseArtifactMarkdown(envelope(AUTHORS)).envelope.current;
  assert.equal(current.authorsRaw, AUTHORS);
  assert.equal(current.authorAttributions.length, 2);
  assert.equal(current.authorAttributions[0].label, 'Anchor');
  assert.equal(current.authorAttributions[0].reference, 'https://example.org/role');
  assert.equal(current.authorAttributions[0].context, '(ChatGPT Web | GPT-6)');
  assert.deepEqual(current.authorAttributions[1].contextReferences.map(x => x.label), ['Olle']);
  assert.equal(current.authorAttributions[1].qualification, 'not-established');
});

test('simple/legacy Authors remain readable and optional', () => {
  assert.deepEqual(parseAuthorAttributions('Anchor; Sigma').map(x => x.label), ['Anchor', 'Sigma']);
  assert.deepEqual(parseAuthorAttributions('Anchor, Sigma').map(x => x.label), ['Anchor', 'Sigma']);
  assert.deepEqual(parseAuthorAttributions(''), []);
});

test('application projection exposes linked Authors without claiming identity', () => {
  const projected = projectApplicationData({workspaces:[{id:'docs',records:[{path:'001-test.trace.md',markdown:envelope(AUTHORS)}]}]});
  assert.deepEqual(projected.records[0].authors, ['Anchor', 'Sigma']);
  assert.equal(projected.records[0].authorsRaw, AUTHORS);
  assert.equal(projected.records[0].authorAttributions[1].contextReferences[0].target, 'https://example.org/identity');
});

test('creation result compares raw Authors rather than normalized display label', () => {
  const contract = buildArtifactCreationContract({schemaId: 'tiinex.topic.v1'});
  const markdown = envelope(AUTHORS);
  const validation = validateArtifactCreationResult({schemaId:'tiinex.topic.v1',markdown}, {}, {contract, expectedAuthors:AUTHORS});
  assert.equal(validation.findings.some(x => x.code === 'creation.current.authors.mismatch'),false);
  const wrong = validateArtifactCreationResult({schemaId:'tiinex.topic.v1',markdown}, {}, {contract, expectedAuthors:'Another author'});
  assert.equal(wrong.findings.some(x => x.code === 'creation.current.authors.mismatch'),true);
});
