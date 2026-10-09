import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';

test('Transition Definition and Companion expose exact Core-owned creation without granting host execution authority', () => {
  for (const schemaId of ['tiinex.transition.definition.v1','tiinex.schema.transition.companion.v1']) {
    const contract=buildArtifactCreationContract({schemaId,transitionType:'create-artifact'});
    assert.equal(contract.status,'ready',schemaId);
    assert.equal(contract.capabilities.create,'implemented',schemaId);
    assert.equal(contract.resultBoundary.remoteWrite,false);
  }
  const evidence=buildArtifactCreationContract({schemaId:'tiinex.evidence.v1',transitionType:'create-artifact'});
  assert.equal(evidence.status,'ready');
  assert.equal(evidence.capabilities.create,'implemented');
});
