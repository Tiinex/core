import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { preparePortableWorkspaceInitialization } from '../src/tooling/portable/workspace/workspace.initialize.js';
import { qualifyHandoffWorkspaceTarget } from '../src/tooling/portable/handoff/workspaceTargetConformance.js';
import { sha256Hex } from '../src/export/package.bytes.js';

const schemaMarkdown = `# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n# Workspace schema\n\n## Schema Validation Contract\n\n### Workspace Scope\n\nApplies To\n\n- artifacts whose Current Schema is tiinex.workspace.v1\n\nRules\n\n- workspace\n`;

test('Workspace initialization requests host schema resolution before writing semantics', () => {
  const result = preparePortableWorkspaceInitialization({ repository: 'Tiinusen/boardgame-tower-havoc', ref: 'master' });
  assert.equal(result.status, 'needs-resolution');
  assert.equal(result.resolutionRequest.schemaId, 'tiinex.workspace.v1');
  assert.equal(result.resolutionRequest.repository, 'Tiinex/docs');
});

test('Workspace initialization preserves a resolvable schema permalink and seals exact bytes', () => {
  const permalink = 'https://github.com/Tiinex/docs/blob/c5c0a8173dcc0816d239a64fa363c7924df216b1/.topics/.schemas/tiinex.workspace.v1.schema.md';
  const result = preparePortableWorkspaceInitialization({
    title: 'Boardgame: Tower Havoc',
    workspaceId: 'tiinusen-boardgame-tower-havoc',
    repository: 'Tiinusen/boardgame-tower-havoc',
    ref: 'master',
    authors: 'Anchor',
    schemaTarget: permalink,
    schemaMarkdown,
    createdAt: '2026-09-17T23:55:00Z'
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.findingSummary.counts.error, 0);
  assert.match(result.markdown, new RegExp(`- Current Schema: \\[tiinex\\.workspace\\.v1\\]\\(${permalink.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\)`));
  assert.match(result.markdown, /- Repository: Tiinusen\/boardgame-tower-havoc/);
  assert.match(result.markdown, /# Boardgame: Tower Havoc\n\n## Workspace Entrypoints/);
  assert.equal(canonicalC14nV2SelfState(result.markdown).state, 'verified');
});

test('Workspace exact bytes remain qualified through source-to-local-to-Pack handoff, while the first host-side byte drift fails self-integrity', async () => {
  const targetPath = '.topics/.workspaces/tiinex-core.workspace.md';
  const source = new Uint8Array(await readFile(new URL(`../${targetPath}`, import.meta.url)));
  const incomingReplace = Uint8Array.from(source);
  const localMode = Uint8Array.from(incomingReplace);

  const sourceSha = sha256Hex(source);
  assert.equal(sha256Hex(incomingReplace), sourceSha);
  assert.equal(sha256Hex(localMode), sourceSha);

  const exact = qualifyHandoffWorkspaceTarget({
    targetPath,
    targetData: localMode,
    entries: [{ path: targetPath, data: localMode, bytes: localMode.byteLength, sha256: sourceSha }]
  });
  assert.equal(exact.state, 'qualified', JSON.stringify(exact.reasons || [], null, 2));
  assert.equal(exact.selfIntegrity.state, 'verified');

  const decoded = new TextDecoder().decode(localMode);
  const tamperedText = decoded.replace('Tiinex/core', 'Tiinex/c0re');
  assert.notEqual(tamperedText, decoded, 'fixture must mutate one exact Workspace body token');
  const tampered = new TextEncoder().encode(tamperedText);
  assert.equal(tampered.byteLength, localMode.byteLength, 'tamper preserves byte length so qualification depends on exact content integrity, not size');
  assert.notEqual(sha256Hex(tampered), sourceSha);

  const rejected = qualifyHandoffWorkspaceTarget({
    targetPath,
    targetData: tampered,
    entries: [{ path: targetPath, data: tampered, bytes: tampered.byteLength, sha256: sha256Hex(tampered) }]
  });
  assert.equal(rejected.state, 'blocked');
  assert.equal(rejected.reasons.includes('workspace-target-self-integrity-mismatch'), true, JSON.stringify(rejected.reasons || [], null, 2));
  assert.equal(rejected.reasons.includes('workspace-target-artifact-conformance-unqualified'), true, JSON.stringify(rejected.reasons || [], null, 2));
});
