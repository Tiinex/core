import test from 'node:test';
import assert from 'node:assert/strict';
import { schemaRegistry } from '../src/schemas/registry.js';
import { qualifyLocalSchemaReferenceAuthority } from '../src/schemas/schema.reference.js';

test('plain-ID local Evidence authority requires exact qualified Docs bytes and forbids published-locator substitution', () => {
  const module = schemaRegistry.byId?.get('tiinex.evidence.v1');
  assert.ok(module, 'Native-qualified Evidence v1 binding must be registered');
  const source = module.schemaSource.qualify();
  assert.equal(source.state, 'qualified');
  assert.equal(source.validationLineageAuthority?.state, 'qualified');
  assert.deepEqual(qualifyLocalSchemaReferenceAuthority(module.binding, source, 'plain-schema-id'), { state: 'qualified', basis: 'qualified-local-docs-exact-snapshot' });
  assert.equal(qualifyLocalSchemaReferenceAuthority(module.binding, source, 'markdown-link').state, 'unavailable');

  const withField = (key, value) => ({ ...module.binding, [key]: value });
  const unqualified = [
    withField('checksum', { value: '0'.repeat(64) }),
    withField('sourceBlobSha', '0'.repeat(40)),
    withField('sourcePath', '.topics/.schemas/other/forged.schema.md'),
    withField('sourceCommit', 'a'.repeat(40)),
    withField('publicationState', 'published'),
    withField('snapshotCompleteness', 'partial-local-snapshot'),
    withField('permalink', 'https://example.invalid/forged.schema.md'),
    withField('sourceRepository', 'Another/docs')
  ];
  for (const binding of unqualified) assert.equal(qualifyLocalSchemaReferenceAuthority(binding, source, 'plain-schema-id').state, 'unavailable');
  assert.equal(qualifyLocalSchemaReferenceAuthority(module.binding, { ...source, state: 'unavailable' }, 'plain-schema-id').state, 'unavailable');
  assert.equal(qualifyLocalSchemaReferenceAuthority(module.binding, { ...source, validationLineageAuthority: { state: 'unresolved' } }, 'plain-schema-id').state, 'unavailable');
});

test('accepted Axiom local authority remains a separate explicitly scoped mode of the same reference qualification', () => {
  const result = qualifyLocalSchemaReferenceAuthority({
    publicationState: 'accepted-local-unpublished',
    snapshotCompleteness: 'exact-axiom-canonical-unpublished-bounded-workspace-contract'
  }, { state: 'qualified' }, 'markdown-link');
  assert.deepEqual(result, { state: 'qualified', basis: 'qualified-workspace-local-authority' });
});
