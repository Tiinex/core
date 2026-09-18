import assert from 'node:assert/strict';
import test from 'node:test';
import { projectPortableBootstrapRecovery } from '../src/tooling/portable/handoff/bootstrapRecovery.js';

const enc = new TextEncoder();
function file(path, text) { return { path, data: enc.encode(text) }; }

function baseBundle() {
  return { files: [
    file('001-root.trace.md', '- Tooling Bootstrap Descriptor: [Bootstrap](001-2-bootstrap.trace.md)'),
    file('001-start.trace.md', '- Portable Tooling bootstrap: [Bootstrap](001-2-bootstrap.trace.md)'),
    file('001-2-bootstrap.trace.md', '- Payload Path: `001-2-bootstrap.zip`'),
    { path: '001-2-bootstrap.zip', data: new Uint8Array([1, 2, 3]) }
  ] };
}

function baseInspection(extra = {}) {
  return {
    rootArtifact: { path: '001-root.trace.md' },
    readArtifact: { path: '001-start.trace.md' },
    carrierProjection: { status: 'ready' },
    ...extra
  };
}

test('bootstrap recovery derives explicit Start/root bootstrap ownership when package contract cannot qualify', () => {
  const result = projectPortableBootstrapRecovery(baseBundle(), baseInspection({
    packageContract: null,
    findings: [
      { severity: 'error', code: 'portable.route-artifact.integrity.self.unverified', path: '001-2-bootstrap.trace.md' },
      { severity: 'error', code: 'portable.handoff-v2-surface.payload.field-missing', path: '001-2-bootstrap.trace.md' },
      { severity: 'error', code: 'portable.handoff-package-v1.unknown-package-artifact', path: '001-2-bootstrap.zip' }
    ]
  }));
  assert.equal(result.state, 'eligible');
  assert.equal(result.eligibleWithQualifiedHostBootstrap, true);
  assert.equal(result.packageBootstrap.artifactPath, '001-2-bootstrap.trace.md');
  assert.equal(result.packageBootstrap.payloadPath, '001-2-bootstrap.zip');
  assert.deepEqual(result.blockingFindingCodes, []);
});

test('bootstrap recovery does not erase non-bootstrap blockers', () => {
  const result = projectPortableBootstrapRecovery(baseBundle(), baseInspection({
    findings: [
      { severity: 'error', code: 'portable.route-artifact.integrity.self.unverified', path: '001-2-bootstrap.trace.md' },
      { severity: 'error', code: 'portable.handoff-package-v1.workspace-target-unqualified', path: '001-3-workspace.md' }
    ]
  }));
  assert.equal(result.state, 'ineligible');
  assert.deepEqual(result.blockingFindingCodes, ['portable.handoff-package-v1.workspace-target-unqualified']);
});
