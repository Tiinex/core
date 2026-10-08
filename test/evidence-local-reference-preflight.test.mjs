import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCommonAuthorCli } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import { qualifyLocalCreationReferences } from '../src/tooling/portable/adapters/cli/cli.local-creation-references.js';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';

const claim = (reference) => `# Claim Evidence

## Supported Claim Or Question

- Supported Claim Or Question: The capture shows the expected flow.
- Evidence Role: illustrates
- Claim Reference: ${reference}

## Provenance

- Known Source: Local capture
- Preservation Basis: Workspace file
- Provenance Limits: Single recording

## Evidence Material

- Material: Local capture
- Material Kind: screenshot

## Preservation And Fidelity

- Preservation State: retained
- Fidelity Notes: Original local recording
- Known Losses: none

## Interpretation Limits

- Does Not Prove: Deployment readiness
- Not Yet Used As: Independent validation
- Must Not Be Treated As: Independent acceptance
`;

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-evidence-local-'));
  t.after(async () => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, '.topics', 'work');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, '001-parent.trace.md'), 'Existing original source');
  return { root, directory, candidate: '.topics/work/002-evidence.trace.md' };
}

test('Evidence local references resolve relative to authored Evidence path, not workspace root', async (t) => {
  const { root, directory, candidate } = await fixture(t);
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1' });
  assert.equal(contract.status, 'ready');
  const correct = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('[parent](001-parent.trace.md)') });
  assert.equal(correct.state, 'qualified');
  const legacy = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('(parent)(001-parent.trace.md)') });
  assert.equal(legacy.state, 'qualified');
  const invalid = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('(parent)(.topics/work/001-parent.trace.md)') });
  assert.equal(invalid.state, 'blocked');
  assert.equal(invalid.findings[0].code, 'creation.local-reference.missing');
  const remote = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('[document](https://example.org/doc.md)') });
  assert.equal(remote.state, 'qualified');
  const workspaceQualified = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('business::.topics/roles/001-role.trace.md') });
  assert.equal(workspaceQualified.state, 'qualified');
  const traversal = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('[outside](../../../escape.md)') });
  assert.equal(traversal.state, 'blocked');
  assert.equal(traversal.findings[0].code, 'creation.local-reference.outside-workspace');
  const target = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate, markdown: claim('[parent](001-parent.trace.md)') + '\n- Target Artifact: [broken](absent.trace.md)\n' });
  assert.equal(target.state, 'blocked');
  assert.equal(target.findings[0].field, 'Target Artifact');
  await writeFile(path.join(directory, 'capture with spaces.gif'), 'binary fixture');
  const multiple = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate,
    markdown: claim('[parent](001-parent.trace.md)') + '\n- Material: [capture](capture%20with%20spaces.gif); [parent](001-parent.trace.md)\n' });
  assert.equal(multiple.state, 'qualified');
  const mixed = await qualifyLocalCreationReferences({ contract, workspaceRoot: root, artifactRelativePath: candidate,
    markdown: claim('[parent](001-parent.trace.md)') + '\n- Material: [capture](missing.gif); [online](https://example.org/file.gif)\n' });
  assert.equal(mixed.state, 'blocked');
  assert.equal(mixed.findings[0].field, 'Material');
});

test('Common CLI Evidence preflight does not silently qualify a broken local Claim Reference', async (t) => {
  const { root, directory, candidate } = await fixture(t);
  const body = path.join(root, 'evidence-body.md');
  const flags = { workspace: root, schema: 'tiinex.evidence.v1', path: candidate, body, title: 'Evidence return', authors: 'Steward', preflight: true };
  await writeFile(body, claim('(parent)(.topics/work/001-parent.trace.md)'));
  await assert.rejects(() => runCommonAuthorCli({ flags }, {}), /creation.local-reference.missing/);
  await assert.rejects(() => readFile(path.join(directory, '002-evidence.trace.md'), 'utf8'), { code: 'ENOENT' });
  await writeFile(body, claim('[parent](001-parent.trace.md)'));
  const result = await runCommonAuthorCli({ flags }, {});
  assert.equal(result.status, 'qualified-preflight', JSON.stringify(result.findingSummary));
  await assert.rejects(() => readFile(path.join(directory, '002-evidence.trace.md'), 'utf8'), { code: 'ENOENT' });
});
