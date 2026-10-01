import assert from 'node:assert/strict';
import test from 'node:test';
import { projectWorkspaceCarrierEntry } from '../src/tooling/portable/handoff/workspaceEntryProjection.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';

const ROOT_SCHEMA_TARGET = currentSchemaTarget('tiinex.root.v1');
const ROLE_SCHEMA_TARGET = currentSchemaTarget('tiinex.party.role.v1');

function roleFixture(label) {
  const sealed = sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE_SCHEMA_TARGET})\n  - Created At: 2026-10-01 00:00:00\n  - Authors: Fixture\n  - Summary: ${label} role.\n  - Status: active/local\n\n---\n\n# ${label} Role\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: fixture\n\n## Role Boundary\n\n- In Scope: fixture work\n- Out Of Scope: everything else\n\n## Authority And Responsibility Boundary\n\n- May Do: fixture work\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session\n- Assignment Modes: explicit-session\n\n## Interpretation Limits\n\n- Does Not Prove: durable holder identity\n- Must Not Be Treated As: broader authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
// These assertions exercise the pure text/intent projection boundary without
// weakening package inspection; integration coverage supplies a qualified
// pointerless carrier to the public operation.
test('Guided Entry mode catalog is Core-owned and transport-only', () => {
  const result = projectWorkspaceCarrierEntry({ inspection: { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, findings: [] } });
  assert.equal(result.state, 'catalog');
  assert.deepEqual(result.modes.map((mode) => mode.id), ['START', 'RESUME', 'EXPLORE', 'CUSTOM']);
  assert.match(result.boundary, /do not alter the carrier/i);
});

test('Guided Entry renders canonical cold-start shell plus RESUME intent and session context', () => {
  const anchorPath = '.topics/roles/anchor.trace.md';
  const sigmaPath = '.topics/roles/sigma.trace.md';
  const result = projectWorkspaceCarrierEntry({
    inspection: {
      status: 'valid',
      carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' },
      workspaces: [{ workspaceId: 'business', archive: { state: 'qualified', entries: [
        { path: anchorPath, data: new TextEncoder().encode(roleFixture('Anchor')) },
        { path: sigmaPath, data: new TextEncoder().encode(roleFixture('Sigma')) }
      ] } }],
      findings: []
    },
    mode: 'RESUME',
    primaryRole: { label: 'Anchor', reference: 'https://github.com/Tiinex/business/blob/' + 'a'.repeat(40) + '/' + anchorPath, workspaceId: 'business', path: anchorPath },
    participants: [{ label: 'Sigma', reference: 'https://github.com/Tiinex/business/blob/' + 'b'.repeat(40) + '/' + sigmaPath, workspaceId: 'business', path: sigmaPath }]
  });
  assert.equal(result.state, 'rendered');
  assert.match(result.transportText, /Cold start: read Start directly; do not enumerate or broadly extract this package/);
  assert.match(result.transportText, /This is a pointerless Workspace carrier/);
  assert.match(result.transportText, /Entry intent: RESUME/);
  assert.match(result.transportText, /Session Role: Anchor/);
  assert.match(result.transportText, /The receiving LLM session operates as the Session Role established above\./);
  assert.match(result.transportText, /Role material: carried in this package at `business::\.topics\/roles\/anchor\.trace\.md`/);
  assert.match(result.transportText, /Participants:\n- Sigma/);
  assert.match(result.transportText, /Participants are other Roles participating in the same conversation\. They are not the Session Role\./);
  assert.match(result.transportText, /Role material: carried in this package at `business::\.topics\/roles\/sigma\.trace\.md`/);
  assert.match(result.transportText, /No Handoff Continue From route, recipient, or work transfer is declared or implied\./);
});

test('Guided Entry rejects duplicate Primary Role participant and missing CUSTOM instruction', () => {
  const inspection = { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, findings: [] };
  assert.equal(projectWorkspaceCarrierEntry({ inspection, mode: 'CUSTOM' }).reasonCode, 'custom-instruction-required');
  assert.equal(projectWorkspaceCarrierEntry({ inspection, mode: 'RESUME', primaryRole: { label: 'Anchor', reference: 'r' }, participants: [{ label: 'Anchor', reference: 'r' }] }).reasonCode, 'primary-role-duplicate-participant');
});


test('Guided Entry uses a commit-pinned external Role reference only when the Role is not carried', () => {
  const inspection = { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, workspaces: [], findings: [] };
  const pinned = projectWorkspaceCarrierEntry({
    inspection,
    mode: 'START',
    primaryRole: {
      label: 'Anchor',
      workspaceId: 'business',
      path: '.topics/roles/anchor.trace.md',
      reference: `https://github.com/Tiinex/business/blob/${'a'.repeat(40)}/.topics/roles/anchor.trace.md`
    }
  });
  assert.equal(pinned.status, 'ready');
  assert.match(pinned.transportText, /Session Role: Anchor/);
  assert.match(pinned.transportText, /\[Anchor\]\(https:\/\/github\.com\/Tiinex\/business\/blob\/[a]{40}\/\.topics\/roles\/anchor\.trace\.md\)/);

  const floating = projectWorkspaceCarrierEntry({
    inspection,
    mode: 'START',
    primaryRole: {
      label: 'Anchor',
      workspaceId: 'business',
      path: '.topics/roles/anchor.trace.md',
      reference: 'https://github.com/Tiinex/business/blob/main/.topics/roles/anchor.trace.md'
    }
  });
  assert.equal(floating.status, 'blocked');
  assert.equal(floating.reasonCode, 'session-role-material-unresolved');
});

test('Guided Entry deduplicates Roles by exact identity rather than human label alone', () => {
  const inspection = { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, workspaces: [], findings: [] };
  const result = projectWorkspaceCarrierEntry({
    inspection,
    mode: 'START',
    primaryRole: { label: 'Anchor', workspaceId: 'core', path: '.topics/roles/anchor.trace.md', reference: `https://github.com/Tiinex/core/blob/${'a'.repeat(40)}/.topics/roles/anchor.trace.md` },
    participants: [{ label: 'Anchor', workspaceId: 'business', path: '.topics/roles/anchor.trace.md', reference: `https://github.com/Tiinex/business/blob/${'b'.repeat(40)}/.topics/roles/anchor.trace.md` }]
  });
  assert.equal(result.status, 'ready');
  assert.match(result.transportText, /Session Role: Anchor/);
  assert.match(result.transportText, /Participants:\n- Anchor/);
});
