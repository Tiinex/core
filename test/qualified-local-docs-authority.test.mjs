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
  // Simulate a separate, genuinely unpublished local Docs schema without
  // demoting the now-published first-party Evidence binding in production.
  const localBinding = { ...module.binding, sourceCommit: '', permalink: '', rawUrl: '', publicationState: 'qualified-local-unpublished', schemaReferencePublicationState: 'qualified-local-unpublished', snapshotCompleteness: 'exact-local-docs-snapshot' };
  const localSource = { ...source, materialIdentity: { ...source.materialIdentity, sourceCommit: '' } };
  assert.deepEqual(qualifyLocalSchemaReferenceAuthority(localBinding, localSource, 'plain-schema-id'), { state: 'qualified', basis: 'qualified-local-docs-exact-snapshot' });
  assert.equal(qualifyLocalSchemaReferenceAuthority(localBinding, localSource, 'markdown-link').state, 'unavailable');

  const withField = (key, value) => ({ ...localBinding, [key]: value });
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
  for (const binding of unqualified) assert.equal(qualifyLocalSchemaReferenceAuthority(binding, localSource, 'plain-schema-id').state, 'unavailable');
  assert.equal(qualifyLocalSchemaReferenceAuthority(localBinding, { ...localSource, state: 'unavailable' }, 'plain-schema-id').state, 'unavailable');
  assert.equal(qualifyLocalSchemaReferenceAuthority(localBinding, { ...localSource, validationLineageAuthority: { state: 'unresolved' } }, 'plain-schema-id').state, 'unavailable');
});

test('accepted Axiom local authority remains a separate explicitly scoped mode of the same reference qualification', () => {
  const result = qualifyLocalSchemaReferenceAuthority({
    publicationState: 'accepted-local-unpublished',
    snapshotCompleteness: 'exact-axiom-canonical-unpublished-bounded-workspace-contract'
  }, { state: 'qualified' }, 'markdown-link');
  assert.deepEqual(result, { state: 'qualified', basis: 'qualified-workspace-local-authority' });
});
