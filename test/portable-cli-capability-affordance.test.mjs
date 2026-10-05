import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { portableCliHelpText } from '../src/tooling/portable/adapters/cli/cli.help.js';
import { portableCliRuntimeContentRoots } from '../src/tooling/portable/adapters/cli/cli.run.js';
import { portableCliRuntimeProjection, projectPortableCliOperation } from '../src/tooling/portable/adapters/cli/cli.invocation.js';
import { prepareHandoffManufactureCliCommand } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';
import { describeSchemaCapabilities } from '../src/schemas/capability.registry.js';

const runtime = Object.freeze({
  commandInvocation: Object.freeze({
    executable: '/usr/bin/node',
    entrypoint: '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs'
  })
});

test('portable operation projection keeps the exact active runtime entrypoint executable', () => {
  const projected = projectPortableCliOperation(runtime, 'qualify-return', ['<continued-workspace-dir>', '--result', '<result-path>']);
  assert.equal(projected.command, 'qualify-return');
  assert.equal(projected.cli, '/usr/bin/node /tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs qualify-return <continued-workspace-dir> --result <result-path>');
  assert.deepEqual(projected.invocation, {
    executable: '/usr/bin/node',
    args: ['/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs', 'qualify-return', '<continued-workspace-dir>', '--result', '<result-path>'],
    entrypoint: '/tmp/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs',
    state: 'exact-runtime-entrypoint'
  });
  assert.equal(portableCliRuntimeProjection(runtime).state, 'exact-runtime-entrypoint');
  assert.match(projected.boundary, /not reinterpret the operation name as a standalone PATH executable/i);
});

test('focused handoff help exposes pointerless Workspace parent-vs-new-root capability through the active runtime', () => {
  const help = portableCliHelpText(runtime, 'handoff');
  assert.match(help, /^Tiinex portable tooling — handoff/m);
  assert.match(help, /\/usr\/bin\/node \/tmp\/tiinex\.bootstrap\/runtime\/tools\/tiinex-portable\.mjs handoff <workspace-dir> --carrier-mode workspace \(--package-parent <intended-predecessor-carrier\.zip> \| --new-root\)/);
  assert.match(help, /intended predecessor carrier, not the source package\/material origin/i);
  assert.match(help, /Omitting `--package-parent` does not silently mean new root/i);
});

test('pointerless Workspace manufacture fails closed until carrier continuity intent is explicit', async () => {
  await assert.rejects(
    prepareHandoffManufactureCliCommand({
      surfaceCommand: 'handoff',
      positionals: ['/does/not/need/to/exist'],
      flags: { 'carrier-mode': 'workspace' }
    }, runtime),
    /portable\.cli\.workspace-carrier\.root-intent\.required/
  );
  await assert.rejects(
    prepareHandoffManufactureCliCommand({
      surfaceCommand: 'handoff',
      positionals: ['/does/not/need/to/exist'],
      flags: { 'carrier-mode': 'workspace', 'package-parent': '/some/parent.zip', 'new-root': true }
    }, runtime),
    /portable\.cli\.workspace-carrier\.root-parent\.conflict/
  );
});


test('Transition discovery help makes workspace-contributed capability discoverable without claiming applicability', () => {
  const help = portableCliHelpText(runtime, 'project-transition-catalog');
  assert.match(help, /project-transition-catalog \[<workspace-or-material-root>/);
  const neighborhoodHelp = portableCliHelpText(runtime, 'project-transition-neighborhood');
  assert.match(neighborhoodHelp, /project-transition-neighborhood \[<workspace-or-material-root>/);
  assert.match(neighborhoodHelp, /explicitly attached by a Schema Transition Companion/i);
  assert.match(neighborhoodHelp, /attachment still does not prove .*applicability.*executability/i);
  assert.match(help, /regardless of their workspace-local directory/i);
  assert.match(help, /Independent supplied representations stay independent/i);
  assert.match(help, /do not imply .*applicability.*execution/i);
});


test('schema capability description fails closed instead of throwing when no schema module is composed', () => {
  const descriptor = describeSchemaCapabilities(null, { unresolvedSchemaId: 'tiinex.handoff.v1' });
  assert.equal(descriptor.moduleId, '');
  assert.equal(descriptor.resolution, null);
  assert.equal(descriptor.availability, 'invalid');
  assert.equal(descriptor.actions.create.status, 'unavailable');
});

test('source CLI authoring without schema content fails closed with an explicit content-source requirement', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-author-no-content-'));
  try {
    const body = path.join(root, 'body.md');
    await writeFile(body, '# No Content Authoring Probe\n', 'utf8');
    const entrypoint = fileURLToPath(new URL('../tools/tiinex-portable.mjs', import.meta.url));
    const env = { ...process.env };
    delete env.TIINEX_CONTENT_ROOTS;
    const result = spawnSync(process.execPath, [entrypoint, 'author', root, '--schema', 'tiinex.topic.v1', '--path', '001-no-content-probe.trace.md', '--body', body, '--preflight', '--compact'], {
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      env,
      encoding: 'utf8'
    });
    assert.equal(result.status, 1);
    const error = JSON.parse(result.stderr);
    assert.equal(error.schema, 'tiinex.portable.cli.error.v1');
    assert.match(error.error, /^portable\.cli\.author\.schema-content-source\.required:tiinex\.topic\.v1:/);
    assert.match(error.error, /qualified \.schemas content source/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});



test('explicit CLI content-source flags initialize source runtime composition before command execution', () => {
  const coreRoot = fileURLToPath(new URL('..', import.meta.url));
  const nativeRoot = process.env.TIINEX_TEST_NATIVE_ROOT || path.resolve(coreRoot, '..', 'native');
  assert.deepEqual(portableCliRuntimeContentRoots(['handoff', '/tmp/workspace', '--content-sources', `${nativeRoot},/tmp/other-content`]), [nativeRoot, '/tmp/other-content']);
  assert.deepEqual(portableCliRuntimeContentRoots(['catalog', '--content-roots', nativeRoot]), [nativeRoot]);

  const entrypoint = fileURLToPath(new URL('../tools/tiinex-portable.mjs', import.meta.url));
  const env = { ...process.env, TIINEX_CONTENT_ROOTS: '' };
  const result = spawnSync(process.execPath, [entrypoint, 'catalog', '--json', '--content-sources', nativeRoot], {
    cwd: coreRoot,
    env,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.status, 'ready');
  assert.ok((receipt.sources || []).some((source) => source.id === '@tiinex/native'));
  assert.equal(receipt.schemas.state, 'ready');
  assert.ok(receipt.schemas.total > 0);
  assert.equal(receipt.schemas.registrySource, 'portable-content-source-composition');
});
