import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { finalizeFile } from '../src/export/package.fileMap.js';
import { exportFileMapZipUint8Array } from '../src/export/package.zip.js';
import { compareSourceFrontiers } from '../src/tooling/portable/handoff/sourceFrontierComparison.js';
import { renderHandoffPackageV1, WORKSPACE_PACKAGE_ROLE } from '../src/tooling/portable/handoff/recipientV2.packageV1.contract.js';
import { RECIPIENT_V2_PACKAGE_V1_ROOT_PATH } from '../src/tooling/portable/handoff/recipientV2.packageV1.constants.js';
import { listPortableOperations, runPortableOperation } from '../src/tooling/portable/operation.catalog.js';
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';

test('compare-source-frontiers is published and compares exact or changed workspace snapshots', async () => {
  assert.equal(listPortableOperations().operations.some((item) => item.name === 'compare-source-frontiers'), true);

  const scratch = await mkdtemp(path.join(os.tmpdir(), 'tiinex-core-compare-'));
  try {
    const localRoot = path.join(scratch, 'local');
    await mkdir(path.join(localRoot, 'nested'), { recursive: true });
    await writeFile(path.join(localRoot, 'workspace.md'), '# demo workspace\n', 'utf8');
    await writeFile(path.join(localRoot, 'alpha.txt'), 'alpha\n', 'utf8');
    await writeFile(path.join(localRoot, 'nested', 'beta.txt'), 'beta\n', 'utf8');

    const workspaceMarkdown = '# demo workspace\n';
    const workspaceArchive = exportFileMapZipUint8Array([
      { path: 'workspace.md', data: Buffer.from(workspaceMarkdown, 'utf8') },
      { path: 'alpha.txt', data: Buffer.from('alpha\n', 'utf8') },
      { path: 'nested/beta.txt', data: Buffer.from('beta\n', 'utf8') }
    ], 'source-frontier-compare.test.invalid-path');
    const workspaceArchiveFile = finalizeFile({ path: '001-demo.workspace.zip', data: workspaceArchive });
    const workspaceFile = finalizeFile({ path: '001-demo.workspace.md', data: Buffer.from(workspaceMarkdown, 'utf8') });
    const packageMarkdown = renderHandoffPackageV1({
      createdAt: '2026-09-11 00:00:00',
      packageRole: WORKSPACE_PACKAGE_ROLE,
      carrierLineage: { dimension: '001', checkpointKind: 'progression' },
      workspaces: [{
        workspaceId: 'demo',
        workspacePath: workspaceFile.path,
        archivePath: workspaceArchiveFile.path,
        sourceWorkspaceTargetInnerPath: 'workspace.md',
        archiveSha256: workspaceArchiveFile.sha256,
        archiveBytes: workspaceArchiveFile.bytes
      }]
    });
    const packageRoot = finalizeFile({ path: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, data: Buffer.from(packageMarkdown, 'utf8') });
    const packageZip = exportFileMapZipUint8Array([packageRoot, workspaceFile, workspaceArchiveFile], 'source-frontier-compare.test.invalid-path');
    const packagePath = path.join(scratch, 'incoming.zip');
    await writeFile(packagePath, packageZip);

    const cliOutput = [];
    const exitCode = await runPortableCli([
      'compare-source-frontiers',
      '--left-kind', 'local-workspace',
      '--left', localRoot,
      '--left-id', 'demo',
      '--right-kind', 'handoff-package',
      '--right', packagePath,
      '--right-select', 'demo'
    ], {
      log: (value) => cliOutput.push(String(value)),
      error: (value) => { throw new Error(String(value)); }
    }, {});
    assert.equal(exitCode, 0);
    const exact = JSON.parse(cliOutput.at(-1));
    assert.equal(exact.status, 'ready');
    assert.equal(exact.state, 'exact');
    assert.equal(exact.workspaces[0].delta.counts.total, 0);

    await writeFile(path.join(localRoot, 'alpha.txt'), 'alpha changed\n', 'utf8');
    const changed = await compareSourceFrontiers({
      leftKind: 'local-workspace',
      left: localRoot,
      leftId: 'demo',
      rightKind: 'handoff-package',
      right: packagePath,
      rightSelect: 'demo'
    });
    assert.equal(changed.status, 'ready');
    assert.equal(changed.state, 'changed');
    assert.equal(changed.workspaces[0].delta.counts.byteChanged, 1);
    assert.equal(changed.workspaces[0].delta.counts.total, 1);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});
