import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
import { preparePortableWorkspaceInitialization } from '../src/tooling/portable/workspace/workspace.initialize.js';

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
  assert.equal(canonicalC14nV2SelfState(result.markdown).state, 'verified');
});
