import test from 'node:test';
import assert from 'node:assert/strict';
import { schemaMaterialIdentitiesEquivalent } from '../src/schemas/schema.materialIdentity.js';

test('schema material equivalence is independent of repository commit when cryptographic material identity matches', () => {
  assert.equal(schemaMaterialIdentitiesEquivalent(
    { schemaId: 'tiinex.evidence.v1', sha256: 'a'.repeat(64), sourceBlobSha: 'b'.repeat(40), sourceCommit: '1'.repeat(40) },
    { schemaId: 'tiinex.evidence.v1', sha256: 'a'.repeat(64), sourceBlobSha: 'b'.repeat(40), sourceCommit: '2'.repeat(40) }
  ), true);
});

test('schema material equivalence accepts one shared cryptographic identity but fails closed on contradictory shared evidence', () => {
  assert.equal(schemaMaterialIdentitiesEquivalent({ sha256: 'a'.repeat(64) }, { sha256: 'a'.repeat(64), sourceBlobSha: 'b'.repeat(40) }), true);
  assert.equal(schemaMaterialIdentitiesEquivalent(
    { sha256: 'a'.repeat(64), sourceBlobSha: 'b'.repeat(40) },
    { sha256: 'a'.repeat(64), sourceBlobSha: 'c'.repeat(40) }
  ), false);
});

test('schema material equivalence fails closed without shared cryptographic evidence or across declared schema identities', () => {
  assert.equal(schemaMaterialIdentitiesEquivalent({ bytes: 10 }, { bytes: 10 }), false);
  assert.equal(schemaMaterialIdentitiesEquivalent({ schemaId: 'tiinex.evidence.v1', sha256: 'a'.repeat(64) }, { schemaId: 'tiinex.topic.v1', sha256: 'a'.repeat(64) }), false);
});

test('schema material equivalence normalizes binding checksum objects', () => {
  assert.equal(schemaMaterialIdentitiesEquivalent(
    { checksum: { algorithm: 'sha256', value: 'a'.repeat(64) }, sourceBlobSha: 'b'.repeat(40) },
    { sha256: 'a'.repeat(64), gitBlobSha: 'b'.repeat(40) }
  ), true);
});
