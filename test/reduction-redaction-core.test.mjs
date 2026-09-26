import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { resolveSchemaModule, schemaIdIsOrDescendsFrom } from '../src/schemas/resolver.js';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { validatePortableDraft } from '../src/tooling/portable/draft/draft.operations.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import {
  isReductionFamilySchemaId,
  locatorFromValue,
  locatorVerifiesRecord,
  resolveRecordReferencePath,
  sha256Text
} from '../src/tooling/portable/reduction/reduction.shared.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const validRedaction = await readFile(path.join(here, 'fixtures/reduction-redaction/redaction-valid.trace.md'), 'utf8');
const COMMIT = 'a66906eef7f0033eb12893f92910336f82d01afa';

function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}

test('Redaction resolves exactly as Reduction -> Root without lexical lookalikes', () => {
  const resolution = resolveSchemaModule({ schemaId: 'tiinex.redaction.v1' });
  assert.equal(resolution.fallbackUsed, false);
  assert.equal(resolution.module.id, 'tiinex.redaction.v1');
  assert.equal(resolution.module.parentSchemaId, 'tiinex.reduction.v1');
  assert.equal(schemaIdIsOrDescendsFrom('tiinex.redaction.v1', 'tiinex.reduction.v1'), true);
  assert.equal(schemaIdIsOrDescendsFrom('tiinex.redaction.v1', 'tiinex.root.v1'), true);
  assert.equal(schemaIdIsOrDescendsFrom('tiinex.reductionish.v1', 'tiinex.reduction.v1'), false);
  assert.equal(isReductionFamilySchemaId('tiinex.redaction.v1'), true);
  assert.equal(isReductionFamilySchemaId('tiinex.reductionish.v1'), false);
});

test('Redaction schema source qualifies while ordinary create remains undeclared', () => {
  const resolution = resolveSchemaModule({ schemaId: 'tiinex.redaction.v1' });
  const source = resolution.module.schemaSource.qualify();
  assert.equal(source.state, 'qualified');
  assert.equal(source.validationLineageAuthority.state, 'qualified');
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.redaction.v1', transitionType: 'create-artifact' });
  const codes = new Set((contract.findings || []).map((item) => item.code));
  assert.ok(codes.has('creation.authority.missing'));
  assert.ok(codes.has('creation.renderer.missing'));
});

test('Tooling-produced Redaction validates and legacy Allowed Shapes domains fail closed', () => {
  const valid = validatePortableDraft({
    path: '.topics/testing/redaction-valid.trace.md',
    schemaId: 'tiinex.redaction.v1',
    markdown: validRedaction
  });
  assert.equal(valid.status, 'clean');
  assert.equal(valid.findingSummary.counts.error, 0);

  const invalid = reseal(validRedaction.replace('- Redaction Type: generalization', '- Redaction Type: banana'));
  const validation = validatePortableDraft({
    path: '.topics/testing/redaction-invalid.trace.md',
    schemaId: 'tiinex.redaction.v1',
    markdown: invalid
  });
  assert.equal(validation.status, 'invalid');
  assert.ok(validation.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid' && item.severity === 'error'));
});

test('Redaction required fields fail closed', () => {
  const invalid = reseal(validRedaction.replace(/^- Redaction Target:.*\n/m, ''));
  const validation = validatePortableDraft({
    path: '.topics/testing/redaction-missing-field.trace.md',
    schemaId: 'tiinex.redaction.v1',
    markdown: invalid
  });
  assert.equal(validation.status, 'invalid');
  assert.ok(validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing' && item.severity === 'error'));
});

test('Reduction creation exposes the qualified exact current schema permalink', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.reduction.v1', transitionType: 'create-artifact' });
  assert.equal(contract.schemaReferences.current.resolutionState, 'qualified');
  assert.match(contract.schemaReferences.current.preferredTarget, /github\.com\/Tiinex\/docs\/blob\/[0-9a-f]{40}\/\.topics\/\.schemas\/reduction\/tiinex\.reduction\.v1\.schema\.md$/);
});

test('relative Reduction Parent references resolve from the artifact directory', () => {
  assert.equal(
    resolveRecordReferencePath('.topics/processes/gpt/reduction-proof/003-real-two-leaf-reduction.trace.md', '../grounding/003-grounding-major.trace.md'),
    '.topics/processes/gpt/grounding/003-grounding-major.trace.md'
  );
  assert.equal(
    resolveRecordReferencePath('.topics/processes/gpt/reduction-proof/003.trace.md', 'business::.topics/processes/gpt/grounding/003.trace.md'),
    '.topics/processes/gpt/grounding/003.trace.md'
  );
});

test('commit-pinned permalink is immutable-address evidence but not byte qualification by itself', () => {
  const locator = locatorFromValue(`https://github.com/Tiinex/business/blob/${COMMIT}/.topics/example.trace.md`);
  assert.equal(locator.qualified, true);
  assert.equal(locator.contentQualified, false);
  assert.equal(locator.blocker, 'immutable-content-binding-unresolved');
});

test('explicit immutable byte evidence qualifies only when the digest matches the supplied record', () => {
  const record = { markdown: '# exact bytes\n' };
  const locator = locatorFromValue({
    repository: 'Tiinex/business',
    commit: COMMIT,
    path: '.topics/example.trace.md',
    digest: sha256Text(record.markdown),
    qualification: 'qualified',
    basis: 'exact test-bound immutable source bytes'
  });
  assert.equal(locator.qualified, true);
  assert.equal(locator.contentQualified, true);
  assert.equal(locatorVerifiesRecord(locator, record), true);
  assert.equal(locatorVerifiesRecord(locator, { markdown: '# different bytes\n' }), false);
});
