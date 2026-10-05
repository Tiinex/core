import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';
import { currentSchemaMarkdown } from './helpers/current-schema-targets.mjs';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

const ROOT_PATH = '.topics/.schemas/tiinex.root.v1.schema.md';
const ENTRY_PATH = '.topics/.schemas/entry/tiinex.entry.v1.schema.md';
const EVIDENCE_PATH = '.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md';

function record(path, schemaId) {
  const markdown = currentSchemaMarkdown(schemaId);
  assert.ok(markdown, `native schema ${schemaId} must be available`);
  return { path, markdown };
}

function mutateBody(markdown, needle, replacement) {
  assert.match(markdown, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  return markdown.replace(needle, replacement);
}

function mutatePrimaryParentDigest(markdown, value = 'deliberately-stale-parent-digest') {
  const lines = markdown.split(/\r?\n/);
  const heading = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
  assert.ok(heading >= 0);
  let parent = false;
  for (let i = heading + 1; i < lines.length; i += 1) {
    if (/^\s*-\s+Towards:\s*self\s*$/i.test(lines[i])) { parent = false; continue; }
    if (/^\s*-\s+Towards:\s*/i.test(lines[i])) { parent = true; continue; }
    if (parent && /^\s*-\s+Value\s*:/.test(lines[i])) {
      lines[i] = lines[i].replace(/^(\s*-\s+Value\s*:\s*).*$/, `$1${value}`);
      return lines.join('\n');
    }
  }
  assert.fail('fixture has no Parent integrity Value');
}

test('clean canonical schema source is locally qualified without instance-style schema-authority warnings', () => {
  const root = record(ROOT_PATH, 'tiinex.root.v1');
  const result = projectPortableEditorAssistance({ records: [root], focusPath: ROOT_PATH });
  assert.equal(result.status, 'clean');
  assert.equal(result.documents[0].validator.state, 'qualified-local-schema-source');
  assert.equal(result.documents[0].validator.authorityState, 'schema-source-local');
  assert.equal(result.documents[0].diagnostics.length, 0);
  assert.equal(result.documents[0].actions.length, 0);
});

test('schema source self mismatch exposes deterministic schema integrity repair', () => {
  const root = record(ROOT_PATH, 'tiinex.root.v1');
  const mutated = mutateBody(root.markdown, 'Root defines how extensions are introduced.', 'Root defines how extensions are introduced and locally edited.');
  const result = projectPortableEditorAssistance({ records: [{ ...root, markdown: mutated }], focusPath: ROOT_PATH });
  const doc = result.documents[0];
  assert.ok(doc.diagnostics.some((item) => item.code === 'integrity.c14n-v2.mismatch'));
  const action = doc.actions.find((item) => item.id === 'repair-schema-source-integrity');
  assert.ok(action, 'schema source self mismatch must expose deterministic repair');
  assert.equal(action.title, 'Refresh schema self integrity');
  assert.equal(canonicalC14nV2SelfState(action.replacementMarkdown).state, 'verified');
  const repaired = projectPortableEditorAssistance({ records: [{ ...root, markdown: action.replacementMarkdown }], focusPath: ROOT_PATH });
  assert.equal(repaired.status, 'clean');
  assert.equal(repaired.documents[0].validator.state, 'qualified-local-schema-source');
});

test('local schema Parent digest mismatch is repaired together with the child self seal', () => {
  const root = record(ROOT_PATH, 'tiinex.root.v1');
  const entry = record(ENTRY_PATH, 'tiinex.entry.v1');
  const mutated = mutatePrimaryParentDigest(entry.markdown);
  const result = projectPortableEditorAssistance({ records: [root, { ...entry, markdown: mutated }], focusPath: ENTRY_PATH });
  const doc = result.documents[0];
  assert.ok(doc.diagnostics.some((item) => item.code === 'portable.lineage-integrity.parent-target-mismatch'));
  const action = doc.actions.find((item) => item.id === 'repair-schema-source-integrity');
  assert.ok(action, 'local Parent mismatch must expose deterministic schema repair');
  assert.equal(action.title, 'Refresh schema Parent integrity and self seal');
  assert.ok(action.diagnosticCodes.includes('portable.lineage-integrity.parent-target-mismatch'));
  const repaired = projectPortableEditorAssistance({ records: [root, { ...entry, markdown: action.replacementMarkdown }], focusPath: ENTRY_PATH });
  assert.equal(repaired.status, 'clean');
  assert.equal(repaired.documents[0].validator.state, 'qualified-local-schema-source');
});

test('missing local schema Parent digest is repairable rather than a silent no-op', () => {
  const root = record(ROOT_PATH, 'tiinex.root.v1');
  const entry = record(ENTRY_PATH, 'tiinex.entry.v1');
  const mutated = mutatePrimaryParentDigest(entry.markdown, '');
  const result = projectPortableEditorAssistance({ records: [root, { ...entry, markdown: mutated }], focusPath: ENTRY_PATH });
  const doc = result.documents[0];
  assert.ok(doc.diagnostics.some((item) => item.code === 'schema-source.parent.integrity-missing'));
  const action = doc.actions.find((item) => item.id === 'repair-schema-source-integrity');
  assert.ok(action, 'missing local Parent digest must expose deterministic schema repair');
  assert.ok(action.diagnosticCodes.includes('schema-source.parent.integrity-missing'));
  const repaired = projectPortableEditorAssistance({ records: [root, { ...entry, markdown: action.replacementMarkdown }], focusPath: ENTRY_PATH });
  assert.equal(repaired.status, 'clean');
});

test('externally pinned schema Parent integrity is preserved while self integrity remains repairable', () => {
  const evidence = record(EVIDENCE_PATH, 'tiinex.evidence.v1');
  assert.match(evidence.markdown, /Towards: \[[^\]]+\]\(https:\/\/github\.com\/Tiinex\/docs\/blob\/[0-9a-f]{40}\//i);
  const originalParentLine = evidence.markdown.split(/\r?\n/).find((line) => /Towards: .*https:\/\/github\.com\/Tiinex\/docs\/blob\//i.test(line));
  const mutated = mutateBody(evidence.markdown, 'evidence is preservation with claim-bearing use', 'evidence is preservation with claim-bearing use for this local edit');
  const result = projectPortableEditorAssistance({ records: [{ ...evidence, markdown: mutated }], focusPath: EVIDENCE_PATH });
  const doc = result.documents[0];
  assert.ok(doc.diagnostics.some((item) => item.code === 'integrity.c14n-v2.mismatch'));
  assert.equal(doc.diagnostics.some((item) => item.code === 'portable.lineage-integrity.parent-target-mismatch' || item.code === 'schema-source.parent.integrity-missing'), false);
  const action = doc.actions.find((item) => item.id === 'repair-schema-source-integrity');
  assert.ok(action, 'external Parent must not block deterministic self repair');
  const repairedParentLine = action.replacementMarkdown.split(/\r?\n/).find((line) => /Towards: .*https:\/\/github\.com\/Tiinex\/docs\/blob\//i.test(line));
  assert.equal(repairedParentLine, originalParentLine, 'repair must preserve pinned external Parent reference exactly');
  const repaired = projectPortableEditorAssistance({ records: [{ ...evidence, markdown: action.replacementMarkdown }], focusPath: EVIDENCE_PATH });
  assert.equal(repaired.status, 'clean');
});
