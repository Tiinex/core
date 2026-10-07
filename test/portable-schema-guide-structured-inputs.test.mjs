import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { planPortableArtifact } from '../src/tooling/portable/schema/schema.guide.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(here, '..');
const nativeRoot = process.env.TIINEX_TEST_NATIVE_ROOT || path.resolve(coreRoot, '..', 'native');
const rootSchemaPath = path.join(nativeRoot, '.topics', '.schemas', 'tiinex.root.v1.schema.md');
const handoffSchemaPath = path.join(nativeRoot, '.topics', '.schemas', 'coordination', 'handoff', 'tiinex.handoff.v1.schema.md');
const rootSchemaMarkdown = await readFile(rootSchemaPath, 'utf8');
const handoffSchemaMarkdown = await readFile(handoffSchemaPath, 'utf8');

function handoffValues() {
  return {
    Purpose: 'Transfer bounded work.',
    From: 'Anchor',
    'From Kind': 'role',
    To: 'Sigma',
    'To Kind': 'role',
    Transfers: [{ name: 'execute', fields: { 'Transfer Kind': 'work', Description: 'Execute the bounded work.' } }],
    'Required Context': 'none',
    'Reference Context': 'none',
    'Retained Responsibilities': 'none',
    'Exclusions And Dependencies': 'none',
    'Completion Expectation': { 'Signal Kind': 'result', 'Signal Meaning': 'Return one reviewable result.', 'Return To': 'Anchor' },
    'Interpretation Limits': { 'Does Not Mean': 'Acceptance.', 'Must Not Be Used To Claim': 'Authority beyond the bounded transfer.' }
  };
}

function plan(values) {
  return planPortableArtifact({
    files: [
      { path: '.topics/.schemas/tiinex.root.v1.schema.md', content: rootSchemaMarkdown, sourceMode: 'node-local' },
      { path: '.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md', content: handoffSchemaMarkdown, sourceMode: 'node-local' }
    ],
    schemaId: 'tiinex.handoff.v1',
    task: 'create',
    values
  });
}

test('portable Handoff plan treats ordinary-group values as structured authoring inputs rather than duplicate top-level fields', () => {
  const result = plan(handoffValues());
  assert.equal(result.plan.readyToDraft, true, JSON.stringify(result.plan));
  assert.deepEqual(result.plan.missingInputs, []);
  assert.ok(result.guide.requiredInputs.includes('Completion Expectation'));
  assert.ok(result.guide.requiredInputs.includes('Interpretation Limits'));
  assert.equal(result.guide.requiredInputs.includes('Signal Kind'), false);
  assert.equal(result.guide.requiredInputs.includes('Signal Meaning'), false);
  assert.equal(result.guide.requiredInputs.includes('Does Not Mean'), false);
  assert.equal(result.guide.requiredInputs.includes('Must Not Be Used To Claim'), false);
});

test('portable Handoff plan reports missing required fields inside ordinary groups with their owning input', () => {
  const values = handoffValues();
  delete values['Completion Expectation']['Signal Kind'];
  delete values['Interpretation Limits']['Does Not Mean'];
  const result = plan(values);
  assert.equal(result.plan.readyToDraft, false);
  assert.deepEqual(result.plan.missingInputs, [
    'Completion Expectation.Signal Kind',
    'Interpretation Limits.Does Not Mean'
  ]);
});

test('portable Handoff plan reports missing fields inside repeatable declarations and honors literal none where qualified', () => {
  const values = handoffValues();
  delete values.Transfers[0].fields.Description;
  const result = plan(values);
  assert.equal(result.plan.readyToDraft, false);
  assert.deepEqual(result.plan.missingInputs, ['Transfers[0].Description']);

  const withLiteralNone = handoffValues();
  withLiteralNone['Required Context'] = 'none';
  withLiteralNone['Reference Context'] = 'none';
  withLiteralNone['Retained Responsibilities'] = 'none';
  withLiteralNone['Exclusions And Dependencies'] = 'none';
  const noneResult = plan(withLiteralNone);
  assert.equal(noneResult.plan.readyToDraft, true, JSON.stringify(noneResult.plan));
  assert.deepEqual(noneResult.plan.missingInputs, []);
});
