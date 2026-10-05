import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverInstalledTiinexContentSources, discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { prepareNodeWorkspaceCarrierManufacturingInput } from '../src/tooling/portable/adapters/node/workspaceCarrier.manufacture.js';
import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
import { resolveContentSourceRequirementMaterials, expandContentSourceParentBoundaryClosure } from '../src/tooling/portable/adapters/node/handoff.manufacture.requirements.js';
import { inspectPortableToolingBootstrap } from '../src/tooling/portable/handoff/toolingBootstrap.js';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function write(target, content = '') {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

test('registered content surfaces are recursive and unknown dot directories are semantically inert', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-content-source-'));
  try {
    await write(path.join(root, 'package.json'), JSON.stringify({ name: '@example/content', version: '1.2.3' }));
    await write(path.join(root, '.topics', '.workspaces', 'example.workspace.md'), 'primary workspace identity');
    await write(path.join(root, '.topics', 'module-a', '.workspaces', 'module.workspace.md'), 'nested workspace identity');
    await write(path.join(root, '.topics', '.entries', 'start.trace.md'), 'entry root');
    await write(path.join(root, '.topics', 'module-a', '.processes', 'flow.trace.md'), 'process nested');
    await write(path.join(root, '.topics', 'module-b', 'deep', '.scaffolds', 'shape.trace.md'), 'scaffold nested');
    await write(path.join(root, '.topics', 'module-c', '.schemas', 'schema.md'), 'schema nested');
    await write(path.join(root, '.topics', 'module-c', '.vscode', 'settings.json'), '{}');
    await write(path.join(root, '.topics', 'module-c', '.vscode', '.entries', 'ignored.trace.md'), 'not a Tiinex surface through hidden editor state');
    await write(path.join(root, '.topics', 'module-b', 'deep', '.scaffolds', 'nested', '.entries', 'inside-scaffold.trace.md'), 'nested registered entry surface');
    await write(path.join(root, '.topics', 'ordinary', 'local.trace.md'), 'ordinary workspace material');

    const source = await discoverLocalTiinexContentSource({ root });
    assert.equal(source.status, 'ready');
    assert.equal(source.source.capabilities.declaredContentSource, false);
    assert.deepEqual(source.surfaces.map((item) => item.path), [
      '.topics/.entries',
      '.topics/.workspaces',
      '.topics/module-a/.processes',
      '.topics/module-a/.workspaces',
      '.topics/module-b/deep/.scaffolds',
      '.topics/module-b/deep/.scaffolds/nested/.entries',
      '.topics/module-c/.schemas'
    ]);
    assert.deepEqual(source.entries.map((item) => item.sourcePath), [
      '.topics/.entries/start.trace.md',
      '.topics/module-a/.processes/flow.trace.md',
      '.topics/module-b/deep/.scaffolds/shape.trace.md',
      '.topics/module-b/deep/.scaffolds/nested/.entries/inside-scaffold.trace.md',
      '.topics/module-c/.schemas/schema.md'
    ]);
    assert.equal(source.entries.some((item) => item.sourcePath.includes('.workspaces')), false);
    assert.equal(source.entries.some((item) => item.sourcePath.includes('.vscode')), false);
    assert.equal(source.findings.length, 0);

    const plain = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-10-04T10:00:00.000Z' });
    const composed = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-10-04T10:00:00.000Z', contentSources: [{ root }] });
    assert.equal(plain.manifest.runtime.representationSha256, composed.manifest.runtime.representationSha256);
    assert.notEqual(plain.manifest.content.representationSha256, composed.manifest.content.representationSha256);
    assert.notEqual(plain.manifest.composition.sha256, composed.manifest.composition.sha256);
    assert.equal(composed.manifest.content.sources, 1);
    assert.equal(composed.manifest.content.files, 5);
    assert.equal(inspectPortableToolingBootstrap({ files: composed.files }).status, 'valid');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('installed Tiinex content sources follow declared dependencies of discovered content packages', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-content-install-'));
  try {
    await write(path.join(root, 'package.json'), JSON.stringify({ name: 'host', version: '1.0.0', dependencies: { '@example/a': '1.0.0' } }));
    const a = path.join(root, 'node_modules', '@example', 'a');
    const b = path.join(root, 'node_modules', '@example', 'b');
    await write(path.join(a, 'package.json'), JSON.stringify({ name: '@example/a', version: '1.0.0', dependencies: { '@example/b': '1.0.0' }, tiinex: { contentSource: {} } }));
    await write(path.join(a, '.topics', 'module', '.processes', 'a.trace.md'), 'a');
    await write(path.join(b, 'package.json'), JSON.stringify({ name: '@example/b', version: '1.0.0', tiinex: { contentSource: {} } }));
    await write(path.join(b, '.topics', '.entries', 'b.trace.md'), 'b');

    const installed = await discoverInstalledTiinexContentSources({ compositionRoot: root });
    assert.deepEqual(installed.sources.map((item) => item.source.id), ['@example/a', '@example/b']);
    const composed = await buildToolingBootstrapTransportFiles({ runtimeRoot: ROOT, builtAt: '2026-10-04T10:00:00.000Z', compositionRoot: root });
    assert.equal(composed.manifest.content.sources, 2);
    assert.equal(composed.manifest.content.files, 2);
    assert.equal(inspectPortableToolingBootstrap({ files: composed.files }).status, 'valid');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});



test('installed content discovery traverses non-content aggregation packages to reusable dependency sources', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-content-aggregate-'));
  try {
    await write(path.join(root, 'package.json'), JSON.stringify({ name: 'host', version: '1.0.0', dependencies: { '@example/interop': '1.0.0' } }));
    const interop = path.join(root, 'node_modules', '@example', 'interop');
    const defaults = path.join(root, 'node_modules', '@example', 'defaults');
    await write(path.join(interop, 'package.json'), JSON.stringify({ name: '@example/interop', version: '1.0.0', optionalDependencies: { '@example/defaults': '1.0.0' } }));
    await write(path.join(interop, '.topics', '.schemas', 'transport-only.schema.md'), 'must not auto-select undeclared aggregation package content');
    await write(path.join(defaults, 'package.json'), JSON.stringify({ name: '@example/defaults', version: '1.0.0', tiinex: { contentSource: {} } }));
    await write(path.join(defaults, '.topics', '.processes', 'portable.trace.md'), 'portable');
    const installed = await discoverInstalledTiinexContentSources({ compositionRoot: root });
    assert.deepEqual(installed.sources.map((item) => item.source.id), ['@example/defaults']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});


test('carried Workspaces are not implicitly active content sources unless their package declares tiinex.contentSource', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-carried-content-selection-'));
  try {
    const docs = path.join(root, 'docs-like');
    const native = path.join(root, 'native-like');
    await write(path.join(docs, 'package.json'), JSON.stringify({ name: '@example/docs-like', version: '1.0.0' }));
    await write(path.join(docs, '.topics', '.schemas', 'docs.schema.md'), 'docs schema');
    await write(path.join(native, 'package.json'), JSON.stringify({ name: '@example/native-like', version: '1.0.0', tiinex: { contentSource: { registeredSurfaces: 'recursive', workspaceIds: ['native-like'] } } }));
    await write(path.join(native, '.topics', '.schemas', 'native.schema.md'), 'native schema');

    const auto = await prepareNodeWorkspaceCarrierManufacturingInput({
      workspaceRoot: docs,
      workspaceId: 'docs-like',
      additionalWorkspaces: [{ id: 'native-like', root: native }],
      runtimeRoot: ROOT,
      verifyRoundtrip: false
    });
    assert.equal(auto.toolingBootstrap.contentSources, 1);
    const manifestFile = auto.additionalTransportFiles.find((file) => file.path === 'tiinex.bootstrap/manifest.json');
    assert.ok(manifestFile);
    const manifest = JSON.parse(new TextDecoder().decode(manifestFile.data));
    assert.deepEqual(manifest.content.sourceRecords.map((item) => item.id), ['@example/native-like']);
    assert.deepEqual(manifest.content.entries.map((item) => item.sourcePath), ['.topics/.schemas/native.schema.md']);

    const explicit = await prepareNodeWorkspaceCarrierManufacturingInput({
      workspaceRoot: docs,
      workspaceId: 'docs-like',
      additionalWorkspaces: [{ id: 'native-like', root: native }],
      contentSources: [{ id: 'docs-explicit', root: docs, workspaceIds: ['docs-like'] }],
      runtimeRoot: ROOT,
      verifyRoundtrip: false
    });
    const explicitManifestFile = explicit.additionalTransportFiles.find((file) => file.path === 'tiinex.bootstrap/manifest.json');
    const explicitManifest = JSON.parse(new TextDecoder().decode(explicitManifestFile.data));
    assert.deepEqual(explicitManifest.content.sourceRecords.map((item) => item.id), ['@example/native-like', 'docs-explicit']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('workspace-qualified Handoff material resolves from reusable content sources with bounded Parent closure', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-content-workspace-qualified-'));
  try {
    await write(path.join(root, 'package.json'), JSON.stringify({ name: '@example/native-like', version: '1.0.0', tiinex: { contentSource: { registeredSurfaces: 'recursive', workspaceIds: ['native'] } } }));
    const processPath = '.topics/.processes/session-grounding-and-continuity/001-session-grounding-and-continuity-process.trace.md';
    const parentPath = '.topics/.processes/001-processes.trace.md';
    await write(path.join(root, ...parentPath.split('/')), `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-10-04 00:00:00\n  - Summary: Process catalog\n\n---\n\n# Processes\n`);
    await write(path.join(root, ...processPath.split('/')), `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.topic.v1\n  - Created At: 2026-10-04 00:00:00\n  - Trace: ../001-processes.trace.md\n  - Origin:\n    - relative: ../001-processes.trace.md\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-10-04 00:01:00\n  - Summary: Portable process\n\n---\n\n# Portable Process\n`);
    const source = await discoverLocalTiinexContentSource({ root });
    assert.equal(source.status, 'ready');
    assert.ok((source.source.capabilities.workspaceIds || []).includes('native'));
    const requirements = Object.freeze({
      required: Object.freeze([Object.freeze({
        id: 'portable-process',
        name: 'Portable process',
        routeWorkspaceId: 'core',
        routePath: '.topics/work/acceptance-handoff.trace.md',
        reference: Object.freeze({ target: `native::${processPath}` })
      })]),
      reference: Object.freeze([]),
      endpointRoles: Object.freeze([]),
      participantRoles: Object.freeze([]),
      dependencies: Object.freeze([]),
      counts: Object.freeze({ required: 1, reference: 0, endpointRoles: 0, participantRoles: 0, dependencies: 0 }),
      findings: Object.freeze([])
    });

    const materials = resolveContentSourceRequirementMaterials(requirements, [source]);
    assert.equal(materials.length, 1);
    assert.equal(materials[0].providerKind, 'qualified-content-source');
    assert.equal(materials[0].provenance.workspaceId, 'native');
    assert.equal(materials[0].provenance.path, processPath);

    const expanded = expandContentSourceParentBoundaryClosure({ requirements, materials, contentSources: [source] });
    assert.equal(expanded.requirements.dependencies.length, 1);
    assert.equal(expanded.requirements.dependencies[0].targetWorkspaceId, 'native');
    assert.equal(expanded.requirements.dependencies[0].targetPath, parentPath);
    const parent = expanded.materials.find((item) => item.provenance?.path === parentPath);
    assert.ok(parent);
    assert.equal(parent.providerKind, 'qualified-content-source');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
