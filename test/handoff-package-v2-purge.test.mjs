import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scannedRoots = [
  'src/tooling/portable/handoff',
  'src/tooling/portable/adapters/cli',
  'src/tooling/portable/adapters/node',
  'src/tooling/portable/bootstrap'
];

async function filesUnder(relativeRoot) {
  const root = path.join(repoRoot, relativeRoot);
  const out = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  await walk(root);
  return out;
}

test('active Handoff Package tooling contains no retired alternate-package machinery or hidden Handoff transport truth', async () => {
  const files = (await Promise.all(scannedRoots.map(filesUnder))).flat();
  const packageJson = path.join(repoRoot, 'package.json');
  files.push(packageJson);

  const forbiddenPath = /recipientV2|recipient-v2|archiveV2|archive-v2/i;
  assert.deepEqual(files.filter((file) => forbiddenPath.test(path.relative(repoRoot, file))), []);

  const forbiddenContent = [
    /recipientV2/i,
    /recipient-v2/i,
    /archiveV2/i,
    /archive-v2/i,
    /recipient-facing-handoff-v2/i,
    /handoff-v2-surface/i,
    /legacy-recipient-v2/i,
    /tiinex\.package\/handoff-carrier\.json/i,
    /tiinex\.package\/handoff-closure\.json/i,
    /tiinex\.package\/handoff-companion\.json/i,
    /handoff\.material\//i,
    /material\.bin/i,
    /rebuild-required/i
  ];
  const violations = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const pattern of forbiddenContent) if (pattern.test(text)) violations.push(`${path.relative(repoRoot, file)} :: ${pattern}`);
  }
  assert.deepEqual(violations, []);
});

test('incomplete Handoff manufacture enters the direct Package V1 path and fails closed without a rebuild fallback', () => {
  const result = manufactureRecipientRelativeHandoffPackage({
    handoff: { semanticStatus: 'unknown' },
    materials: [],
    workspaceMaterializations: [],
    workspaceTargets: [],
    recipient: {},
    bootstrap: { present: false },
    additionalTransportFiles: [],
    requirements: { handoff: { semanticStatus: 'unknown' }, required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [], semanticParticipantRoutes: [], findings: [] }
  });
  assert.equal(result.status, 'blocked');
  assert.ok(result.bundle);
  assert.equal(result.bundle.transportFormat, 'tiinex-handoff-package-v1');
  assert.equal(result.verification.manufacturePath, 'direct-qualified-model-to-package-v1');
  assert.equal(result.findings.some((item) => item.code === 'portable.handoff-package-v1.rebuild-required'), false);
  assert.ok(result.findings.some((item) => item.code === 'portable.handoff-package-v1.manufacture.workspaces-missing'));
  assert.ok(result.findings.some((item) => item.code === 'portable.handoff-package-v1.manufacture.bootstrap-missing'));
});

test('c14n-v2 trace integrity remains supported and verifies after Handoff Package purge', () => {
  const unsigned = '# Continuity Context\n\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-24 00:20:00\n\n---\n\n# Integrity fixture\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending';
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  assert.equal(canonicalC14nV2SelfState(sealed.markdown).state, 'verified');
});
