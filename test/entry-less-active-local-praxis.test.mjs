import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHandoffPackageV1Start } from '../src/tooling/portable/handoff/handoffPackageV1.render.js';
import { portableCliHelpText } from '../src/tooling/portable/adapters/cli/cli.help.js';

test('bootstrap-only Start encourages situation-based Entry selection and qualified local Tiinex use', () => {
  const start = renderHandoffPackageV1Start({ carrierMode: 'bootstrap', createdAt: '2026-10-16T10:00:00.000Z', bootstrapArtifactPath: '001-2-bootstrap.trace.md', bootstrapArchivePath: '001-2-bootstrap.zip' });
  for (const snippet of ['most applicable session working method', 'prefer Getting Started when qualified', 'read-content', 'normally initialize an isolated reversible session scratch Workspace', 'init-workspace', 'author --preflight', 'no-file/no-write request', 'Scratch remains disposable']) {
    assert.ok(start.includes(snippet), `bootstrap Start missing ${snippet}`);
  }
  assert.match(start, /not consent to unrelated project ownership or remote mutation/);
});

test('pointerless multi-Workspace Start adopts early local praxis without assigning carried work', () => {
  const start = renderHandoffPackageV1Start({ carrierMode: 'workspace', createdAt: '2026-10-16T10:00:00.000Z', bootstrapArtifactPath: '001-2-bootstrap.trace.md', bootstrapArchivePath: '001-2-bootstrap.zip' });
  assert.match(start, /qualified carried Workspace\/material projection first/);
  assert.match(start, /first meaningful qualified working state/);
  assert.match(start, /does not bind a carried project/);
  assert.match(start, /no-write request/);
});

test('routed Start does not manufacture a new scratch-work authority or override qualified Handoff', () => {
  const start = renderHandoffPackageV1Start({ carrierMode: 'handoff', createdAt: '2026-10-16T10:00:00.000Z', bootstrapArtifactPath: '001-2-bootstrap.trace.md', bootstrapArchivePath: '001-2-bootstrap.zip' });
  assert.match(start, /selected Continue From pointer/);
  assert.doesNotMatch(start, /isolated local scratch Workspace/);
});

test('init-workspace help distinguishes scratch local authoring from project and Handoff authority', () => {
  const help = portableCliHelpText('node tools/tiinex-portable.mjs', 'init-workspace');
  assert.match(help, /normally initialize a local isolated disposable session scratch Workspace soon after ready route-less orientation/);
  assert.match(help, /not a Project, Role, Handoff, durable save, or external authority/);
  assert.match(help, /Respect read-only\/no-write instructions/);
  assert.doesNotMatch(help, /Only after the human chooses local ongoing-work continuity/);
});


test('entry-less default is a concrete first working operation, not merely a suggestion to consider it', () => {
  const start = renderHandoffPackageV1Start({ carrierMode: 'bootstrap', createdAt: '2026-10-16T10:00:00.000Z', bootstrapArtifactPath: '001-2-bootstrap.trace.md', bootstrapArchivePath: '001-2-bootstrap.zip' });
  assert.match(start, /normally initialize an isolated reversible session scratch Workspace via the `init-workspace` invocation/);
  assert.match(start, /As soon as there is a real bounded goal, state or decision, qualify a Topic/);
  assert.match(start, /Only an actually manufactured, verified and accessible carrier supports cross-session recovery claims/);
  assert.doesNotMatch(start, /scratch Workspace may be initialized/);
});
