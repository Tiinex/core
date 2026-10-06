import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { enumerateNodeWorkspace } from '../src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js';
import { manufactureHandoffPackageV1Direct } from '../src/tooling/portable/handoff/handoffPackageV1.manufacture.js';
import { finalizeFile } from '../src/export/package.fileMap.js';

for (const excluded of ['.release/old.tgz', '.outgoing-handoff-packages/old.zip', '.vscode/link/state.json', 'tools/__pycache__/browser-smoke.cpython-313.pyc', 'tools/browser-smoke.pyc', 'tools/legacy.pyo']) {
  test(`manufacture excludes generated ${excluded} but preserves tasks and source`, async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'tiinex-hygiene-'));
    try {
      for (const p of [excluded, '.vscode/tasks.json', 'src/code.js', 'link/real-source.js', 'tools/browser-smoke.py', 'tools/_author_return.mjs']) {
        await mkdir(path.dirname(path.join(root, p)), {recursive: true});
        await writeFile(path.join(root, p), '{}');
      }
      const result = await enumerateNodeWorkspace(root);
      assert.equal(result.status, 'qualified-complete');
      assert.deepEqual(result.materialization.entries.map(e => e.path).sort(), ['.vscode/tasks.json','link/real-source.js','src/code.js','tools/_author_return.mjs','tools/browser-smoke.py']);
      assert.deepEqual(result.evidence.exclusions.relativePaths, ['.vscode/link']);
      assert.ok(result.evidence.exclusions.directories.includes('__pycache__'));
      assert.deepEqual(result.evidence.exclusions.fileSuffixes, ['.pyc', '.pyo']);
    } finally {await rm(root, {recursive: true, force: true});}
  });
}

import { materializeHandoffManufactureCliOutput, recipientRouteSelectorForManufacture } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
function bootstrapCarrierFixture(source = 'export {};\n') {
  const bootstrapFile = finalizeFile({ path: 'runtime/tools/tiinex-portable.mjs', mediaType: 'text/javascript', content: source });
  const result = manufactureHandoffPackageV1Direct({
    carrierMode: 'bootstrap',
    carrierLineage: { dimension: '001', checkpointKind: 'progression' },
    workspaceMaterializations: [], workspaceTargets: [], additionalTransportFiles: [bootstrapFile], requirements: {}, handoffRoutes: []
  });
  assert.equal(result.status, 'ready');
  return { ...result, carrierProjection: result.inspection.carrierProjection };
}

test('exact carrier output path is idempotent for byte-identical duplicate transport', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-carrier-idempotent-'));
  const filename = 'tiinex-bootstrap-001.handoff-package.zip';
  const target = path.join(root, filename);
  try {
    const result = bootstrapCarrierFixture();
    const first = await materializeHandoffManufactureCliOutput(result, { output: target, 'projected-filename': filename });
    const before = await readFile(target);
    const second = await materializeHandoffManufactureCliOutput(result, { output: target, 'projected-filename': filename });
    const after = await readFile(target);
    assert.equal(first.writeReceipt.status, 'written');
    assert.equal(second.writeReceipt.status, 'already-present-identical');
    assert.deepEqual(after, before);
    assert.equal(second.writeReceipt.boundary.exactPathOverwrite, false);
    assert.equal(second.writeReceipt.boundary.idempotentExistingBytes, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('exact carrier output path fails closed and preserves divergent existing bytes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-carrier-divergent-'));
  const filename = 'tiinex-bootstrap-001.handoff-package.zip';
  const target = path.join(root, filename);
  const existing = Buffer.from('pre-existing divergent carrier bytes');
  try {
    await writeFile(target, existing);
    const result = bootstrapCarrierFixture();
    await assert.rejects(
      materializeHandoffManufactureCliOutput(result, { output: target, 'projected-filename': filename }),
      /portable\.cli\.handoff-carrier\.output-existing-divergent/
    );
    assert.deepEqual(await readFile(target), existing);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('shared explicit Handoff routes keep --route as presentation selection instead of collapsing manufacture', () => {
  assert.equal(recipientRouteSelectorForManufacture('core:.topics/handoffs/one.trace.md', [{ path: 'one' }, { path: 'two' }]), '');
  assert.equal(recipientRouteSelectorForManufacture('core:.topics/handoffs/one.trace.md', [{ path: 'one' }]), 'core:.topics/handoffs/one.trace.md');
  assert.equal(recipientRouteSelectorForManufacture('', [{ path: 'one' }, { path: 'two' }]), '');
});

test('pointerless filename is a safe transport label, exposes only generic transport, and never invents route or lineage', async () => {
  const result = { status: 'ready', carrierProjection: { status: 'ready', mode: 'workspace', lineage: { dimension: '001' }, routes: [] } };
  const receipt = await materializeHandoffManufactureCliOutput(result, { 'projected-filename': 'business-001-7.handoff-package.zip' });
  assert.equal(receipt.humanOutput.primary.filename, 'business-001-7.handoff-package.zip');
  assert.equal(receipt.humanOutput.primary.dimension, '001');
  assert.equal(receipt.humanOutput.normalInlineRouting?.kind, 'transport-text');
  assert.equal(receipt.humanOutput.normalInlineRouting?.authority, 'qualified-package-start-only');
  assert.match(receipt.humanOutput.normalInlineRouting?.content || '', /Start:\n001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.match(receipt.humanOutput.normalInlineRouting?.content || '', /pointerless Workspace carrier/);
  assert.equal(/Continue from:/i.test(receipt.humanOutput.normalInlineRouting?.content || ''), false);
  assert.equal(receipt.humanOutput.presentation?.recipientLabel, '');
  for (const filename of ['../escape.handoff-package.zip', 'CON.handoff-package.zip', 'C:\\bad.handoff-package.zip', 'bad:ads.handoff-package.zip']) {
    await assert.rejects(materializeHandoffManufactureCliOutput(result, { 'projected-filename': filename }), /filename.invalid/);
  }
});

import { summarizeHandoffManufactureCliOutput } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
test('manufacture CLI summary preserves exact semantic participant projection for hosts', () => {
  const summary = summarizeHandoffManufactureCliOutput({
    status: 'ready', executable: true, transportExecutable: true,
    plan: {
      status: 'ready', requiredClosureReady: true, semanticHandoffStatus: 'unknown', workspaceMaterializations: [],
      requirements: {
        required: [], reference: [],
        participantRoles: [{ id: 'participant:1', requirementName: 'Sigma', referenceTarget: 'business::.topics/roles/sigma.trace.md', targetWorkspaceId: 'business', targetPath: '.topics/roles/sigma.trace.md' }],
        semanticParticipantRoutes: [{
          routeWorkspaceId: 'extension-vscode', routePath: '.topics/handoffs/acceptance.trace.md', state: 'qualified',
          currentTask: { path: 'extension-vscode/.topics/task.trace.md', schemaId: 'tiinex.task.v1' },
          participantRoles: [{ label: 'Sigma', reference: 'business::.topics/roles/sigma.trace.md', workspaceId: 'business', path: '.topics/roles/sigma.trace.md' }]
        }]
      }
    },
    carrierProjection: { status: 'ready', mode: 'handoff', routes: [] }, findings: []
  });
  assert.deepEqual(summary.planSummary.semanticParticipantRoutes, [{
    routeWorkspaceId: 'extension-vscode', routePath: '.topics/handoffs/acceptance.trace.md', state: 'qualified',
    currentTask: { path: 'extension-vscode/.topics/task.trace.md', schemaId: 'tiinex.task.v1' },
    participants: [{ label: 'Sigma', reference: 'business::.topics/roles/sigma.trace.md', workspaceId: 'business', path: '.topics/roles/sigma.trace.md' }]
  }]);
  assert.deepEqual(summary.planSummary.participantRoles, [{
    requirementId: 'participant:1', label: 'Sigma', reference: 'business::.topics/roles/sigma.trace.md', workspaceId: 'business', path: '.topics/roles/sigma.trace.md'
  }]);
});

import { planRecipientRelativeHandoffMaterialClosure } from '../src/tooling/portable/handoff/materialClosure.plan.js';
test('closure plan preserves exact semantic participant route projection for host receipts', () => {
  const semantic = [{
    routeWorkspaceId: 'extension-vscode',
    routePath: '.topics/handoffs/acceptance.trace.md',
    state: 'qualified',
    currentTask: { path: 'extension-vscode/.topics/task.trace.md', schemaId: 'tiinex.task.v1' },
    participantRoles: [{ label: 'Sigma', reference: 'business::.topics/roles/sigma.trace.md', workspaceId: 'business', path: '.topics/roles/sigma.trace.md' }]
  }];
  const plan = planRecipientRelativeHandoffMaterialClosure({
    handoff: {},
    requirements: { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [], findings: [], semanticParticipantRoutes: semantic },
    workspaceMaterializations: []
  });
  assert.deepEqual(plan.requirements.semanticParticipantRoutes, semantic);
});
