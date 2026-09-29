import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { nextBootstrapCarrierFilename, buildBootstrapCarrier, formatBootstrapCarrierHuman } from '../tools/build-bootstrap-carrier.mjs';
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
    assert.match(result.transportText, /version --json/);
    assert.match(result.transportText, /composition\.sha256/);
    assert.doesNotMatch(result.transportText, /Continue From:/);
    const descriptor = bundle.files.find((file) => file.path === '001-2-bootstrap.trace.md')?.content || '';
    assert.match(descriptor, /- Created At: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    assert.match(descriptor, /- Producer: @tiinex\/core 0\.1\.1/);
    assert.match(descriptor, /- Runtime Composition SHA-256: [a-f0-9]{64}/);
    assert.match(descriptor, /- Comparison Command: node <extract-root>\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs version --json/);
    assert.match(descriptor, /- Ordering Boundary: .*none establish global semantic supersession\./);
    const start = bundle.files.find((file) => file.path === '001-1-READ-BEFORE-PROCEEDING.trace.md')?.content || '';
    assert.match(start, /Optional pre-orientation identity check:/);
    assert.match(start, /composition\.sha256/);
    assert.match(start, /do not by themselves establish semantic supersession/);
    const bytes = await readFile(result.output);
    assert.equal(bytes.byteLength, result.bytes);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});


test('bootstrap carrier human output exposes only output path and transport text by default', () => {
  const text = formatBootstrapCarrierHuman({
    output: '/tmp/bootstrap-001.handoff-package.zip',
    transportText: 'Handoff package attached.\n\nCold start: read Start directly.'
  });
  assert.equal(text, [
    'Bootstrap Handoff Package ready',
    '',
    'Output: /tmp/bootstrap-001.handoff-package.zip',
    '',
    'Transport text:',
    'Handoff package attached.',
    '',
    'Cold start: read Start directly.'
  ].join('\n'));
  for (const hidden of ['sha256', 'bytes', 'findingSummary', 'packageInspection', 'roundtrip']) assert.equal(text.includes(hidden), false);
});
