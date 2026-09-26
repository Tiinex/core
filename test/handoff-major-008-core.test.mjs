import test from 'node:test';
import assert from 'node:assert/strict';

import { parseArtifactMarkdown } from '../src/artifacts/artifact.parse.js';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { canonicalHandoffEndpointReference } from '../src/tooling/portable/handoff/handoffEndpointProjection.js';
import { projectHandoffMaterialRequirements } from '../src/tooling/portable/handoff/materialClosure.requirements.js';

function handoffValues(extra = {}) {
  return {
    Purpose: 'Return one bounded result.',
    From: 'Loom',
    'From Kind': 'role',
    To: 'Anchor',
    'To Kind': 'role',
    Transfers: [{ name: 'return', fields: { 'Transfer Kind': 'work-and-responsibility', Description: 'Return the bounded result.' } }],
    'Required Context': 'none',
    'Reference Context': 'none',
    'Retained Responsibilities': 'none',
    'Exclusions And Dependencies': 'none',
    'Completion Expectation': { 'Signal Kind': 'return', 'Signal Meaning': 'Anchor receives the bounded result.', 'Return To': 'Anchor' },
    'Interpretation Limits': { 'Does Not Mean': 'Acceptance.', 'Must Not Be Used To Claim': 'Authority beyond the bounded transfer.' },
    ...extra
  };
}

function render(values) {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.handoff.v1', transitionType: 'create-artifact' });
  assert.equal(contract.status, 'ready');
  return { contract, markdown: renderArtifactCreationDraftMarkdown(contract, { values, title: 'Loom To Anchor', summary: 'Loom To Anchor', createdAt: '2026-09-22T12:00:00Z' }) };
}

test('Handoff creation exposes canonical endpoint References as optional Core-owned authoring inputs', () => {
  const from = canonicalHandoffEndpointReference({ qualification: 'qualified-exact', kind: 'role', label: 'Loom Role', workspaceId: 'business', artifactPath: '.topics/roles/loom.trace.md', target: 'business::.topics/roles/loom.trace.md' });
  const to = canonicalHandoffEndpointReference({ qualification: 'qualified-exact', kind: 'role', label: 'Anchor Role', workspaceId: 'business', artifactPath: '.topics/roles/anchor.trace.md', target: 'business::.topics/roles/anchor.trace.md' });
  assert.equal(from.state, 'qualified');
  assert.equal(to.state, 'qualified');
  assert.equal(from.target, 'business::.topics/roles/loom.trace.md');
  assert.equal(to.target, 'business::.topics/roles/anchor.trace.md');
  assert.equal(from.reference, '');
  assert.equal(to.reference, '');
  assert.equal(from.referenceTarget, '');
  assert.equal(to.referenceTarget, '');

  const { contract, markdown } = render(handoffValues());
  assert.deepEqual(contract.creation.optionalInputs.filter((item) => item.endsWith('Reference')), ['From Reference', 'To Reference']);
  assert.doesNotMatch(markdown, /^- From Reference:/m);
  assert.doesNotMatch(markdown, /^- To Reference:/m);
  const parsed = parseArtifactMarkdown(markdown);
  assert.equal(parsed.envelope.current.schema.id, 'tiinex.handoff.v1');
  assert.equal(parsed.hasIntegrity, true);
});

test('canonical endpoint authoring keeps exact provider Reference separate from internal Workspace coordinate', () => {
  const permalink = `https://github.com/Tiinex/business/blob/${"a".repeat(40)}/.topics/roles/anchor.trace.md`;
  const projected = canonicalHandoffEndpointReference({ qualification: 'qualified-exact', kind: 'role', label: 'Anchor Role', workspaceId: 'business', artifactPath: '.topics/roles/anchor.trace.md', target: 'business::.topics/roles/anchor.trace.md', referenceTarget: permalink, referenceQualification: 'qualified-exact' });
  assert.equal(projected.state, 'qualified');
  assert.equal(projected.target, 'business::.topics/roles/anchor.trace.md');
  assert.equal(projected.referenceTarget, permalink);
  assert.equal(projected.reference, `[Anchor Role](${permalink})`);
  const unqualifiedProvider = canonicalHandoffEndpointReference({ qualification: 'qualified-exact', kind: 'role', label: 'Anchor Role', workspaceId: 'business', artifactPath: '.topics/roles/anchor.trace.md', target: 'business::.topics/roles/anchor.trace.md', referenceTarget: permalink });
  assert.equal(unqualifiedProvider.state, 'blocked');
});

test('manual identity-less Handoff authoring remains valid when optional endpoint References are omitted', () => {
  const { markdown } = render(handoffValues({ From: 'External reviewer', 'From Kind': 'person', To: 'Anchor', 'To Kind': 'role' }));
  assert.doesNotMatch(markdown, /^- From Reference:/m);
  assert.doesNotMatch(markdown, /^- To Reference:/m);
  assert.match(markdown, /^- From: External reviewer$/m);
  assert.match(markdown, /^- To: Anchor$/m);
});

test('canonical endpoint Reference projection fails closed for non-exact or contradictory candidate identity', () => {
  const unqualified = canonicalHandoffEndpointReference({ qualification: 'candidate', kind: 'role', label: 'Loom', workspaceId: 'business', artifactPath: '.topics/roles/loom.trace.md', target: 'business::.topics/roles/loom.trace.md' });
  const contradictory = canonicalHandoffEndpointReference({ qualification: 'qualified-exact', kind: 'role', label: 'Loom', workspaceId: 'business', artifactPath: '.topics/roles/loom.trace.md', target: 'other::.topics/roles/loom.trace.md' });
  assert.equal(unqualified.state, 'blocked');
  assert.equal(contradictory.state, 'blocked');
});
