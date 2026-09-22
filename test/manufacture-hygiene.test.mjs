import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { enumerateNodeWorkspace } from '../src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js';

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
  assert.equal(receipt.humanOutput.normalInlineRouting?.authority, 'none');
  assert.equal(receipt.humanOutput.normalInlineRouting?.content, '');
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

import { projectHandoffHumanOutput, HANDOFF_CARRIER_PROJECTION_SCHEMA_ID } from '../src/tooling/portable/handoff/carrierProjection.js';
test('explicit carrier prefix is preserved for shared multi-Handoff human output without semantic primary authority', () => {
  const projection = {
    schema: HANDOFF_CARRIER_PROJECTION_SCHEMA_ID,
    status: 'ready', mode: 'shared', lineage: { dimension: '004-1' },
    workspace: { id: 'extension-vscode', title: 'Extension VS Code', slug: 'tiinex-vscode' },
    workspaces: [{ id: 'extension-vscode', title: 'Extension VS Code', slug: 'tiinex-vscode', qualification: 'qualified' }],
    routes: [
      { id: 'r1', state: 'qualified', workspaceId: 'extension-vscode', workspaceRelativePath: '.topics/handoffs/one.trace.md', parties: { from: 'Anchor', to: 'Sigma' }, projectedFilename: 'tiinex-vscode-004-1-anchor-to-sigma.handoff-package.zip' },
      { id: 'r2', state: 'qualified', workspaceId: 'extension-vscode', workspaceRelativePath: '.topics/handoffs/two.trace.md', parties: { from: 'Anchor', to: 'Sigma' }, projectedFilename: 'tiinex-vscode-004-1-anchor-to-sigma.handoff-package.zip' }
    ]
  };
  const result = projectHandoffHumanOutput({ projection, route: 'r1', carrierPrefix: 'test-test' });
  assert.equal(result.status, 'ready');
  assert.equal(result.primary.filename, 'test-test-004-1-anchor-to-sigma.handoff-package.zip');
  assert.equal(result.sharedRouting.primary.filename, 'test-test-004-1-anchor-to-sigma.handoff-package.zip');
  assert.equal(result.sharedRouting.routes.length, 2);
  assert.equal(result.sharedRouting.selectionAuthority, 'exact-qualified-route-only');
});
