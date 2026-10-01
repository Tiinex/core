import test from 'node:test';
import assert from 'node:assert/strict';
import { projectWorkspaceSessionRoles } from '../src/tooling/portable/handoff/workspaceSessionRoleProjection.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';

const rootSchemaTarget = currentSchemaTarget('tiinex.root.v1');
const workspaceSchemaTarget = currentSchemaTarget('tiinex.workspace.v1');
const roleSchemaTarget = currentSchemaTarget('tiinex.party.role.v1');

function seal(markdown) {
  const result = sealC14nV2Self(markdown);
  assert.equal(result.state, 'sealed');
  return `${result.markdown}\n`;
}
function workspaceFixture() {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchemaTarget})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${workspaceSchemaTarget})\n  - Created At: 2026-10-01 10:00:00\n  - Authors: Fixture\n  - Summary: Business workspace.\n  - Status: active/local\n\n---\n\n# Business\n\n## Workspace Entrypoints\n\n### Repository source\n\n- Source Kind: local-directory\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}
function roleFixture(label, parentTrace = '') {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchemaTarget})\n${parentTrace ? `- Parent\n  - Parent Schema: [tiinex.party.role.v1](${roleSchemaTarget})\n  - Created At: 2026-10-01 10:00:00\n  - Trace: [Parent](${parentTrace})\n  - Origin:\n    - [relative](${parentTrace})\n` : ''}- Current\n  - Current Schema: [tiinex.party.role.v1](${roleSchemaTarget})\n  - Created At: 2026-10-01 10:01:00\n  - Authors: Fixture\n  - Summary: ${label} role.\n  - Status: ready/local\n\n---\n\n# ${label} Role\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: fixture\n\n## Role Boundary\n\n- In Scope: fixture work\n- Out Of Scope: everything else\n\n## Authority And Responsibility Boundary\n\n- May Do: fixture work\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable\n- Assignment Modes: explicit-session\n\n## Interpretation Limits\n\n- Does Not Prove: durable holder identity\n- Must Not Be Treated As: broader authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

test('Guided Entry session Role projection exposes current leaves and never leaks .schemas Role material', () => {
  const result = projectWorkspaceSessionRoles({ workspaceId: 'business', records: [
    { path: '.topics/.workspaces/tiinex-business.workspace.md', markdown: workspaceFixture() },
    { path: '.topics/roles/001-anchor-role.trace.md', markdown: roleFixture('Anchor') },
    { path: '.topics/roles/001-1-anchor-current-role.trace.md', markdown: roleFixture('Anchor', '001-anchor-role.trace.md') },
    { path: '.topics/roles/001-sigma-role.trace.md', markdown: roleFixture('Sigma') },
    { path: '.topics/.schemas/party/role/tiinex.party.role.v1.schema.md', markdown: roleFixture('Schema Masquerade') }
  ] });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings || [], null, 2));
  assert.deepEqual(result.candidates.map((item) => [item.label, item.artifactPath]), [
    ['Anchor', '.topics/roles/001-1-anchor-current-role.trace.md'],
    ['Sigma', '.topics/roles/001-sigma-role.trace.md']
  ]);
  assert.equal(result.candidates.every((item) => item.currentLeaf === true), true);
  assert.equal(result.candidates.some((item) => item.artifactPath.includes('/.schemas/')), false);
});
