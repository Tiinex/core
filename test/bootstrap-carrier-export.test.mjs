import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { nextBootstrapCarrierFilename, buildBootstrapCarrier } from '../tools/build-bootstrap-carrier.mjs';
import { loadNodePortableInput } from '../src/tooling/portable/input/node.input.js';
import { inspectHandoffPackageV1 } from '../src/tooling/portable/handoff/handoffPackageV1.inspect.js';

test('bootstrap carrier filename allocation starts at 001 and advances from the highest local carrier', () => {
  assert.equal(nextBootstrapCarrierFilename([]), 'bootstrap-001.handoff-package.zip');
  assert.equal(nextBootstrapCarrierFilename(['bootstrap-001.handoff-package.zip', 'ignore.zip', 'bootstrap-007.handoff-package.zip']), 'bootstrap-008.handoff-package.zip');
});

test('bootstrap carrier export reuses canonical Package V1 manufacture and carries no Workspace or route', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-bootstrap-export-'));
  try {
    await writeFile(path.join(dir, 'bootstrap-001.handoff-package.zip'), new Uint8Array());
    const result = await buildBootstrapCarrier({ outputDir: dir });
    assert.equal(result.status, 'ready');
    assert.equal(result.filename, 'bootstrap-002.handoff-package.zip');
    assert.equal(result.manufacture.operation, 'manufacture-handoff-package');
    assert.equal(result.manufacture.packageInspection, 'valid');
    assert.equal(result.manufacture.roundtrip, 'passed');
    assert.equal(result.manufacture.bootstrapStatus, 'embedded-qualified');
    const bundle = await loadNodePortableInput([result.output]);
    const inspection = inspectHandoffPackageV1(bundle);
    assert.equal(inspection.status, 'valid');
    assert.equal(inspection.carrierProjection.mode, 'bootstrap');
    assert.deepEqual(inspection.carrierProjection.workspaces, []);
    assert.deepEqual(inspection.carrierProjection.routes, []);
    assert.deepEqual(bundle.files.map((file) => file.path).sort(), [
      '001-1-READ-BEFORE-PROCEEDING.trace.md',
      '001-2-bootstrap.trace.md',
      '001-2-bootstrap.zip',
      '001-tiinex-handoff-package.trace.md'
    ]);
    const bytes = await readFile(result.output);
    assert.equal(bytes.byteLength, result.bytes);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
