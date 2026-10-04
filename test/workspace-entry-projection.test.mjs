import assert from 'node:assert/strict';
import test from 'node:test';
import { projectWorkspaceCarrierEntry } from '../src/tooling/portable/handoff/workspaceEntryProjection.js';
import { nativeEntryByName, nativeEntryContentSource } from './helpers/native-entry-fixtures.mjs';
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

function sessionEntryFixture() {
  const source = nativeEntryByName('start');
  assert.ok(source);
  let markdown = source
    .replace('- Name: Start\n', '- Name: Grounded Session\n')
    .replace('- Canonical Identifier: tiinex.core.entry.start.v1\n', '- Canonical Identifier: example.grounded.session.v1\n')
    .replace('- Human Label: Start\n', '- Human Label: Grounded Session\n')
    .replace('\n## Interpretation Limits\n', `\n## Grounding Material\n\n- Ownership boundary\n  - Reference: https://example.invalid/ownership\n  - Purpose: Establish the ownership boundary that should shape session interpretation.\n\n## Interpretation Limits\n`)
    .replace(/  - Value:[^\n]*/, '  - Value: ');
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
const reusableEntrySources = Object.freeze([nativeEntryContentSource()]);

// These assertions exercise the pure text/intent projection boundary without
// weakening package inspection; integration coverage supplies a qualified
// pointerless carrier to the public operation.
test('Guided Entry mode catalog uses reusable content sources and remains transport-only', () => {
  const result = projectWorkspaceCarrierEntry({ inspection: { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, findings: [] }, contentSources: reusableEntrySources });
  assert.equal(result.state, 'catalog');
  assert.deepEqual(result.modes.map((mode) => mode.label), ['Explore', 'Resume', 'Start', 'Custom']);
  assert.deepEqual(result.modes.map((mode) => mode.sourceKind), ['content-source', 'content-source', 'content-source', 'runtime']);
  assert.match(result.boundary, /does not alter the carrier/i);
});

test('Core renders Session Entry grounding obligations without VS Code semantics', () => {
  const markdown = sessionEntryFixture();
  const inspection = {
    status: 'valid',
    carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' },
    workspaces: [{ workspaceId: 'business', archive: { state: 'qualified', entries: [
      { path: '.topics/entries/grounded-session.trace.md', data: new TextEncoder().encode(markdown) }
    ] } }],
    findings: []
  };
  const catalog = projectWorkspaceCarrierEntry({ inspection });
  const carried = catalog.modes.find((mode) => mode.canonicalIdentifier === 'example.grounded.session.v1');
  assert.ok(carried);
  assert.equal(carried.schemaId, 'tiinex.entry.session.v1');
  const rendered = projectWorkspaceCarrierEntry({ inspection, entryId: carried.id });
  assert.equal(rendered.status, 'ready');
  assert.match(rendered.transportText, /Entry schema: tiinex\.entry\.session\.v1/);
  assert.match(rendered.transportText, /Grounding material \(required before this Entry is fully grounded\)/);
  assert.match(rendered.transportText, /Reference: https:\/\/example\.invalid\/ownership/);
  assert.match(rendered.transportText, /Purpose: Establish the ownership boundary/);
  assert.match(rendered.transportText, /Qualify and interpret every declared Grounding Material reference/);
});



test('EXPLORE requires current cross-Workspace grounding before participant-facing directions', () => {
  const result = projectWorkspaceCarrierEntry({
    inspection: { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, findings: [] },
    mode: 'EXPLORE',
    contentSources: reusableEntrySources
  });
  assert.equal(result.status, 'ready');
  assert.match(result.transportText, /most current truthful multi-Workspace grounding reasonably available/);
  assert.match(result.transportText, /do not stop at the Workspace containing the Role or at the first plausible active or ready artifact/);
  assert.match(result.transportText, /reconcile lineage, supersession, returns, dependencies, implementation state, and ownership boundaries/);
  assert.match(result.transportText, /duplicated responsibility, ownership drift, scope creep, and missing continuity/);
  assert.match(result.transportText, /present the useful current picture, material seams or contradictions, and plausible directions/);
  assert.match(result.transportText, /presentation or communication preferences from participating Role material/);
  assert.match(result.transportText, /concise, scan-friendly, current-first presentation/);
  assert.doesNotMatch(result.transportText, /TL;DR/i);
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
    contentSources: reusableEntrySources,
    primaryRole: { label: 'Anchor', reference: 'https://github.com/Tiinex/business/blob/' + 'a'.repeat(40) + '/' + anchorPath, workspaceId: 'business', path: anchorPath },
    participants: [{ label: 'Sigma', reference: 'https://github.com/Tiinex/business/blob/' + 'b'.repeat(40) + '/' + sigmaPath, workspaceId: 'business', path: sigmaPath }]
  });
  assert.equal(result.state, 'rendered');
  assert.match(result.transportText, /Cold start: read Start directly; do not enumerate or broadly extract this package/);
  assert.match(result.transportText, /This is a pointerless Workspace carrier/);
  assert.match(result.transportText, /Entry intent: Resume/);
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
  assert.equal(projectWorkspaceCarrierEntry({ inspection, mode: 'RESUME', contentSources: reusableEntrySources, primaryRole: { label: 'Anchor', reference: 'r' }, participants: [{ label: 'Anchor', reference: 'r' }] }).reasonCode, 'primary-role-duplicate-participant');
});


test('Guided Entry uses a commit-pinned external Role reference only when the Role is not carried', () => {
  const inspection = { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, workspaces: [], findings: [] };
  const pinned = projectWorkspaceCarrierEntry({
    inspection,
    mode: 'START',
    contentSources: reusableEntrySources,
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
    contentSources: reusableEntrySources,
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
    contentSources: reusableEntrySources,
    primaryRole: { label: 'Anchor', workspaceId: 'core', path: '.topics/roles/anchor.trace.md', reference: `https://github.com/Tiinex/core/blob/${'a'.repeat(40)}/.topics/roles/anchor.trace.md` },
    participants: [{ label: 'Anchor', workspaceId: 'business', path: '.topics/roles/anchor.trace.md', reference: `https://github.com/Tiinex/business/blob/${'b'.repeat(40)}/.topics/roles/anchor.trace.md` }]
  });
  assert.equal(result.status, 'ready');
  assert.match(result.transportText, /Session Role: Anchor/);
  assert.match(result.transportText, /Participants:\n- Anchor/);
});
