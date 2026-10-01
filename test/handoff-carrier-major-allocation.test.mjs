import assert from 'node:assert/strict';
import test from 'node:test';
import { projectHandoffCarrierMajorAllocation } from '../src/tooling/portable/handoff/carrierMajorAllocation.js';
import { allocateHandoffCarrierMajor } from '../src/tooling/portable/handoff/carrierLineage.js';

test('carrier Major allocation is monotonic and does not require a Parent', () => {
  const result = projectHandoffCarrierMajorAllocation({
    prefix: 'tiinex',
    existingFilenames: [
      'tiinex-001.handoff-package.zip',
      'tiinex-003.handoff-package.zip',
      'other-099.handoff-package.zip',
      'tiinex-003-1.handoff-package.zip',
      'tiinex-002 (1).handoff-package.zip'
    ]
  });
  assert.equal(result.state, 'ready');
  assert.equal(result.highestObservedMajor, 3);
  assert.equal(result.nextMajorDimension, '004');
  assert.equal(result.parentOptional, true);
});


test('collision-suffixed transport filenames still reserve their Major', () => {
  const result = projectHandoffCarrierMajorAllocation({
    prefix: 'tiinex',
    existingFilenames: ['tiinex-001.handoff-package.zip', 'tiinex-002 (1).handoff-package.zip']
  });
  assert.equal(result.highestObservedMajor, 2);
  assert.equal(result.nextMajorDimension, '003');
});

test('parentless Major lineage carries no Parent while preserving the selected Major', () => {
  const lineage = allocateHandoffCarrierMajor('tiinex', '004', 'operator requested next monotonic carrier Major');
  assert.equal(lineage.mode, 'major');
  assert.equal(lineage.prefix, 'tiinex');
  assert.equal(lineage.dimension, '004');
  assert.equal(lineage.parentDimension, '');
  assert.equal(lineage.parentPackageSha256, '');
  assert.equal(lineage.checkpointKind, 'major');
});

test('carrier Major allocation rejects exhaustion and missing prefix', () => {
  assert.equal(projectHandoffCarrierMajorAllocation({ prefix: 'tiinex', existingFilenames: ['tiinex-999.handoff-package.zip'] }).reasonCode, 'transport-major-exhausted');
  assert.equal(projectHandoffCarrierMajorAllocation({ existingFilenames: [] }).reasonCode, 'prefix-required');
});
