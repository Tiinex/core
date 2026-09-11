import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { enumerateNodeWorkspace } from '../src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js';

for (const excluded of ['.release/old.tgz', '.outgoing-handoff-packages/old.zip', '.vscode/link/state.json']) {
  test(`manufacture excludes generated ${excluded} but preserves tasks and source`, async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'tiinex-hygiene-'));
    try {
      for (const p of [excluded, '.vscode/tasks.json', 'src/code.js', 'link/real-source.js']) {
        await mkdir(path.dirname(path.join(root, p)), {recursive: true});
        await writeFile(path.join(root, p), '{}');
      }
      const result = await enumerateNodeWorkspace(root);
      assert.equal(result.status, 'qualified-complete');
      assert.deepEqual(result.materialization.entries.map(e => e.path).sort(), ['.vscode/tasks.json','link/real-source.js','src/code.js']);
      assert.deepEqual(result.evidence.exclusions.relativePaths, ['.vscode/link']);
    } finally {await rm(root, {recursive: true, force: true});}
  });
}

import { materializeHandoffManufactureCliOutput } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
test('pointerless filename is a safe transport label and never invents route or lineage', async () => {
  const result = { status: 'ready', carrierProjection: { status: 'ready', mode: 'workspace', lineage: { dimension: '001' }, routes: [] } };
  const receipt = await materializeHandoffManufactureCliOutput(result, { 'projected-filename': 'business-001-7.handoff-package.zip' });
  assert.equal(receipt.humanOutput.primary.filename, 'business-001-7.handoff-package.zip');
  assert.equal(receipt.humanOutput.primary.dimension, '001');
  assert.equal(receipt.humanOutput.normalInlineRouting, null);
  for (const filename of ['../escape.handoff-package.zip', 'CON.handoff-package.zip', 'C:\\bad.handoff-package.zip', 'bad:ads.handoff-package.zip']) {
    await assert.rejects(materializeHandoffManufactureCliOutput(result, { 'projected-filename': filename }), /filename.invalid/);
  }
});
