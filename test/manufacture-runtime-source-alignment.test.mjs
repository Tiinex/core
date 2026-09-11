import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { enumerateNodeWorkspace } from '../src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js';
import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
import { qualifyToolingRuntimeSourceAlignment } from '../src/tooling/portable/adapters/node/handoff.manufacture.runtimeSource.js';
import { prepareNodeWorkspaceCarrierManufacturingInput } from '../src/tooling/portable/adapters/node/workspaceCarrier.manufacture.js';

async function createCoreRuntimeFixture(policyText, { version = '9.9.9', releaseMetadata = false } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-runtime-source-'));
  const files = {
    'package.json': `${JSON.stringify({ name: '@tiinex/core', version, type: 'module', ...(releaseMetadata ? { gitHead: 'a'.repeat(40), tiinexRelease: { sourceCommit: 'a'.repeat(40), sourceTree: 'b'.repeat(40) } } : {}) }, null, 2)}\n`,
    'tools/tiinex-portable.mjs': "import '../src/runtime.js';\n",
    'src/runtime.js': "import './tooling/portable/adapters/node/handoff.manufacture.enumeration.js';\nexport const ready = true;\n",
    'src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js': `${policyText}\n`,
    'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md': '# fixture bootstrap\n',
    'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json': '{"schema":"fixture"}\n',
    'src/tooling/portable/schema/bootstrap/fixture.schema.md': '# fixture schema\n'
  };
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
  return root;
}

async function localWorkspace(root) {
  const enumeration = await enumerateNodeWorkspace(root, { workspaceId: 'core' });
  assert.equal(enumeration.status, 'qualified-complete');
  return { id: 'core', root, materialization: enumeration.materialization };
}

test('runtime/source alignment qualifies exact Core bootstrap bytes and exposes the policy digest', async () => {
  const root = await createCoreRuntimeFixture("export const excluded = ['.release', '.outgoing-handoff-packages', '.vscode/link'];");
  try {
    const tooling = await buildToolingBootstrapTransportFiles({ runtimeRoot: root });
    const alignment = await qualifyToolingRuntimeSourceAlignment({ runtimeIdentity: tooling.runtimeIdentity, localWorkspaces: [await localWorkspace(root)] });
    assert.equal(alignment.state, 'qualified-exact-match');
    assert.equal(alignment.runtime.packageName, '@tiinex/core');
    assert.equal(alignment.runtime.packageVersion, '9.9.9');
    assert.ok(alignment.runtime.representationSha256);
    assert.equal(alignment.runtime.representationSha256, alignment.source.representationSha256);
    assert.equal(alignment.runtime.sourceRepresentationSha256, alignment.source.sourceRepresentationSha256);
    assert.ok(alignment.runtime.enumerationPolicySha256);
    assert.equal(alignment.runtime.enumerationPolicySha256, alignment.source.enumerationPolicySha256);
  } finally { await rm(root, { recursive: true, force: true }); }
});


test('release-normalized package metadata may differ when exact Tooling source bytes match', async () => {
  const sourceRoot = await createCoreRuntimeFixture("export const excluded = ['.release', '.outgoing-handoff-packages', '.vscode/link'];", { version: '0.1.1' });
  const publishedRuntimeRoot = await createCoreRuntimeFixture("export const excluded = ['.release', '.outgoing-handoff-packages', '.vscode/link'];", { version: '0.7.0', releaseMetadata: true });
  try {
    const publishedTooling = await buildToolingBootstrapTransportFiles({ runtimeRoot: publishedRuntimeRoot });
    const alignment = await qualifyToolingRuntimeSourceAlignment({ runtimeIdentity: publishedTooling.runtimeIdentity, localWorkspaces: [await localWorkspace(sourceRoot)] });
    assert.equal(alignment.state, 'qualified-exact-match');
    assert.notEqual(alignment.runtime.representationSha256, alignment.source.representationSha256);
    assert.equal(alignment.runtime.sourceRepresentationSha256, alignment.source.sourceRepresentationSha256);
    assert.equal(alignment.runtime.packageVersion, '0.7.0');
    assert.equal(alignment.source.packageVersion, '0.1.1');
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
    await rm(publishedRuntimeRoot, { recursive: true, force: true });
  }
});

test('same Core package name/version cannot hide stale runtime policy bytes', async () => {
  const sourceRoot = await createCoreRuntimeFixture("export const excluded = ['.release', '.outgoing-handoff-packages', '.vscode/link'];");
  const staleRuntimeRoot = await createCoreRuntimeFixture("export const excluded = ['node_modules'];");
  try {
    const staleTooling = await buildToolingBootstrapTransportFiles({ runtimeRoot: staleRuntimeRoot });
    await assert.rejects(
      qualifyToolingRuntimeSourceAlignment({ runtimeIdentity: staleTooling.runtimeIdentity, localWorkspaces: [await localWorkspace(sourceRoot)] }),
      /portable\.tooling-bootstrap\.runtime-source\.mismatch:.*runtimeVersion=9\.9\.9:sourceVersion=9\.9\.9/
    );
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
    await rm(staleRuntimeRoot, { recursive: true, force: true });
  }
});

test('pointerless Workspace manufacture fails closed on stale Core runtime/source bytes', async () => {
  const sourceRoot = await createCoreRuntimeFixture("export const excluded = ['.release', '.outgoing-handoff-packages', '.vscode/link'];");
  const staleRuntimeRoot = await createCoreRuntimeFixture("export const excluded = ['node_modules'];");
  try {
    await assert.rejects(
      prepareNodeWorkspaceCarrierManufacturingInput({ workspaceRoot: sourceRoot, workspaceId: 'core', runtimeRoot: staleRuntimeRoot }),
      /portable\.tooling-bootstrap\.runtime-source\.mismatch/
    );
    const current = await prepareNodeWorkspaceCarrierManufacturingInput({ workspaceRoot: sourceRoot, workspaceId: 'core', runtimeRoot: sourceRoot });
    assert.equal(current.manufacturingEvidence.runtimeSourceAlignment.state, 'qualified-exact-match');
    assert.equal(current.manufacturingEvidence.runtimeSourceAlignment.runtime.representationSha256, current.toolingBootstrap.representationSha256);
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
    await rm(staleRuntimeRoot, { recursive: true, force: true });
  }
});
