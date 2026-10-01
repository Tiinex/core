import test from 'node:test';
import assert from 'node:assert/strict';
import { projectHandoffCarrierOutputCollision, projectHandoffCarrierTransportName, projectHandoffHumanOutput } from '../src/tooling/portable/handoff/carrierProjection.js';
import { projectHandoffCarrierMajorFrontier } from '../src/tooling/portable/handoff/carrierMajorFrontier.js';

function routedProjection(dimension = '001') {
  return {
    status: 'ready',
    mode: 'handoff',
    lineage: { prefix: 'tiinex-core', dimension },
    routes: [{
      id: 'route-1',
      state: 'qualified',
      pointerPath: '001-3-1-handoff-pointer.trace.md',
      workspaceId: 'core',
      workspaceRelativeHandoffPath: '.topics/handoffs/001-anchor-to-anchor.trace.md',
      from: 'Anchor',
      to: 'Anchor'
    }]
  };
}

test('Core owns transport-only collision naming without changing carrier lineage', () => {
  const base = projectHandoffHumanOutput({ projection: routedProjection() });
  const duplicate = projectHandoffHumanOutput({ projection: routedProjection(), collisionInstance: 2 });
  assert.equal(base.status, 'ready');
  assert.equal(base.primary.filename, 'tiinex-core-001-anchor-to-anchor.handoff-package.zip');
  assert.equal(base.primary.dimension, '001');
  assert.equal(base.primary.collisionInstance, 1);
  assert.equal(duplicate.primary.filename, 'tiinex-core-001-anchor-to-anchor (1).handoff-package.zip');
  assert.equal(duplicate.primary.dimension, '001');
  assert.equal(duplicate.primary.collisionInstance, 2);
  const overridden = projectHandoffHumanOutput({ projection: routedProjection(), filename: 'custom-output.handoff-package.zip', collisionInstance: 2 });
  assert.equal(overridden.primary.filename, 'custom-output (1).handoff-package.zip');
});

test('Core allocates first free collision filename from host-observed names', () => {
  const filename = 'tiinex-core-001-anchor-to-anchor.handoff-package.zip';
  const first = projectHandoffCarrierOutputCollision({ filename, existingFilenames: [] });
  assert.equal(first.status, 'ready');
  assert.equal(first.collisionInstance, 1);
  assert.equal(first.filename, filename);

  const second = projectHandoffCarrierOutputCollision({ filename, existingFilenames: [filename] });
  assert.equal(second.status, 'ready');
  assert.equal(second.collisionInstance, 2);
  assert.equal(second.filename, 'tiinex-core-001-anchor-to-anchor (1).handoff-package.zip');

  const third = projectHandoffCarrierOutputCollision({ filename, existingFilenames: [filename, second.filename] });
  assert.equal(third.collisionInstance, 3);
  assert.equal(third.filename, 'tiinex-core-001-anchor-to-anchor (2).handoff-package.zip');
});



test('transport filename continuation never reads or reproduces internal carrier lineage', () => {
  const result = projectHandoffCarrierTransportName({
    mode: 'continuation',
    parentFilename: 'tiinex-core-vscode-003-1.handoff-package.zip',
    ordinal: 1,
    carrierLineage: { prefix: 'totally-different', dimension: '001-1-1-1-1-1-1' }
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.filename, 'tiinex-core-vscode-003-1-1.handoff-package.zip');
  assert.match(result.boundary, /independent from qualified carrier lineage/);
});

test('transport Major progression uses only transport filenames and host-observed names', () => {
  const result = projectHandoffCarrierTransportName({
    mode: 'major',
    parentFilename: 'tiinex-core-vscode-003-1.handoff-package.zip',
    existingFilenames: [
      'tiinex-core-vscode-001.handoff-package.zip',
      'tiinex-core-vscode-004-anchor-to-anchor.handoff-package.zip',
      'other-099.handoff-package.zip'
    ],
    carrierLineage: { prefix: 'internal-prefix', dimension: '777-9' }
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.prefix, 'tiinex-core-vscode');
  assert.equal(result.ordinalOrMajor, 5);
  assert.equal(result.filename, 'tiinex-core-vscode-005.handoff-package.zip');
});

test('transport Major progression counts collision-suffixed observations as their existing Major', () => {
  const result = projectHandoffCarrierTransportName({
    mode: 'major',
    parentFilename: 'tiinex-core-vscode-002.handoff-package.zip',
    existingFilenames: ['tiinex-core-vscode-003 (1).handoff-package.zip']
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.ordinalOrMajor, 4);
  assert.equal(result.filename, 'tiinex-core-vscode-004.handoff-package.zip');
});

test('Core selects one same-prefix Major frontier and exposes the next Major dimension', () => {
  const result = projectHandoffCarrierMajorFrontier({
    prefix: 'tiinex-core',
    candidates: [
      { packagePath: '/out/001.zip', filename: 'ignored.zip', packageSha256: '1'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '001' } },
      { packagePath: '/out/002.zip', filename: 'ignored.zip', packageSha256: '2'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '002' } },
      { packagePath: '/out/002-1.zip', filename: 'ignored.zip', packageSha256: '3'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '002-1' } }
    ]
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.state, 'ready');
  assert.equal(result.selected.dimension, '002-1');
  assert.equal(result.nextMajorDimension, '003');
});

test('Core blocks automatic Major advancement across parallel same-Major frontiers', () => {
  const result = projectHandoffCarrierMajorFrontier({
    prefix: 'tiinex-core',
    candidates: [
      { packagePath: '/out/a.zip', packageSha256: 'a'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '002-1' } },
      { packagePath: '/out/b.zip', packageSha256: 'b'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '002-2' } }
    ]
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.state, 'ambiguous');
  assert.equal(result.reasonCode, 'parallel-major-frontiers');
});

test('Core accepts duplicate frontier observations only when exact stored bytes agree', () => {
  const shared = 'f'.repeat(64);
  const ready = projectHandoffCarrierMajorFrontier({
    prefix: 'tiinex-core',
    candidates: [
      { packagePath: '/out/a.zip', packageSha256: shared, carrierLineage: { prefix: 'tiinex-core', dimension: '002' } },
      { packagePath: '/out/b.zip', packageSha256: shared, carrierLineage: { prefix: 'tiinex-core', dimension: '002' } }
    ]
  });
  assert.equal(ready.state, 'ready');
  const blocked = projectHandoffCarrierMajorFrontier({
    prefix: 'tiinex-core',
    candidates: [
      { packagePath: '/out/a.zip', packageSha256: 'a'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '002' } },
      { packagePath: '/out/b.zip', packageSha256: 'b'.repeat(64), carrierLineage: { prefix: 'tiinex-core', dimension: '002' } }
    ]
  });
  assert.equal(blocked.state, 'ambiguous');
  assert.equal(blocked.reasonCode, 'duplicate-frontier-bytes-unresolved');
  const missingHash = projectHandoffCarrierMajorFrontier({
    prefix: 'tiinex-core',
    candidates: [
      { packagePath: '/out/a.zip', packageSha256: shared, carrierLineage: { prefix: 'tiinex-core', dimension: '002' } },
      { packagePath: '/out/b.zip', carrierLineage: { prefix: 'tiinex-core', dimension: '002' } }
    ]
  });
  assert.equal(missingHash.state, 'ambiguous');
  assert.equal(missingHash.reasonCode, 'duplicate-frontier-bytes-unresolved');
});
