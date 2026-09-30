import test from 'node:test';
import assert from 'node:assert/strict';

import { portableCliHelpText } from '../src/tooling/portable/adapters/cli/cli.help.js';
import { portableCliRuntimeProjection, projectPortableCliOperation } from '../src/tooling/portable/adapters/cli/cli.invocation.js';
import { prepareHandoffManufactureCliCommand } from '../src/tooling/portable/adapters/cli/cli.handoff-manufacture.js';

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
