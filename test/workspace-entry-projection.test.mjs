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

function targetEntryFixture({ label = 'Example Web', canonicalIdentifier = 'example.entry.target.web.v1' } = {}) {
  const source = nativeEntryByName('start');
  assert.ok(source);
  let markdown = source
    .replace(/  - Current Schema: \[tiinex\.entry\.session\.v1\]\([^\n]+\)\n/, '  - Current Schema: [tiinex.entry.target.v1](tiinex.entry.target.v1.schema.md)\n')
    .replace('# Start\n', `# ${label}\n`)
    .replace('- Name: Start\n', `- Name: ${label}\n`)
    .replace('- Canonical Identifier: tiinex.core.entry.start.v1\n', `- Canonical Identifier: ${canonicalIdentifier}\n`)
    .replace('- Entry Family: tiinex.guided-entry.native.v1\n', '- Entry Family: example.target-entry.v1\n')
    .replace('- Human Label: Start\n', `- Human Label: ${label}\n`)
    .replace('- Purpose: Establish an initial qualified working orientation from the available carried material before substantive work begins.\n', '- Purpose: Augment a purpose Entry with one example web execution environment.\n')
    .replace('\n## Interpretation Limits\n', `\n## Target Identity\n\n- Target Handle: example-web\n- Target Kind: interactive-web-host\n- Canonical Target Identifier: example.web\n- Provider: Example\n- Host: Example Web\n- Human Label: ${label}\n\n## Target Capabilities\n\n- Provides: file upload, conversation branching\n- Limitations: finite context\n\n## Target Compatibility\n\n- Compatible Entry Families: tiinex.guided-entry.native.v1\n- Compatibility Notes: Compatible with the first-party purpose Entry family.\n\n## Target Material\n\n- Example host process\n  - Reference: https://example.invalid/process\n  - Purpose: Supply host-specific continuity guidance.\n\n## Interpretation Limits\n`)
    .replace(/  - Value:[^\n]*/, '  - Value: ');
  const sealed = sealC14nV2Self(markdown);
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

test('Guided Entry catalog separates WHAT purpose Entries from WHERE Target Entries and composes a selected target', () => {
  const targetPath = '.topics/.entries/where/example-web/001-example-web-target-entry.trace.md';
  const inspection = {
    status: 'valid',
    carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' },
    workspaces: [{ workspaceId: 'interop-example', archive: { state: 'qualified', entries: [
      { path: targetPath, data: new TextEncoder().encode(targetEntryFixture()) }
    ] } }],
    findings: []
  };
  const catalog = projectWorkspaceCarrierEntry({ inspection, contentSources: reusableEntrySources });
  assert.equal(catalog.state, 'catalog');
  assert.deepEqual(catalog.modes.map((mode) => mode.label), ['Explore', 'Resume', 'Start', 'Custom']);
  assert.deepEqual(catalog.targets.map((target) => target.label), ['Generic / no target', 'Example Web']);
  assert.equal(catalog.targetEntries.length, 1);
  assert.equal(catalog.targetEntries[0].entryKind, 'target');
  assert.ok(!catalog.modes.some((mode) => mode.label === 'Example Web'));

  const rendered = projectWorkspaceCarrierEntry({
    inspection,
    contentSources: reusableEntrySources,
    mode: 'EXPLORE',
    target: 'Example Web'
  });
  assert.equal(rendered.status, 'ready');
  assert.equal(rendered.targetOption.label, 'Example Web');
  assert.deepEqual(rendered.targetOptions.map((target) => target.label), ['Generic / no target', 'Example Web']);
  assert.match(rendered.transportText, /Entry intent: Explore/);
  assert.match(rendered.transportText, /Target intent: Example Web/);
  assert.match(rendered.transportText, /Qualified Target Entry: example\.entry\.target\.web\.v1/);
  assert.match(rendered.transportText, /qualify and compose that exact Target material as environment adaptation/);
  assert.doesNotMatch(rendered.transportText, /Provides: file upload; conversation branching/);
  assert.equal(rendered.targetDefinition.target.canonicalIdentifier, 'example.web');
  assert.deepEqual(rendered.targetDefinition.target.provides, ['file upload', 'conversation branching']);
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
  assert.match(rendered.transportText, /Qualified Entry: example\.grounded\.session\.v1/);
  assert.match(rendered.transportText, /intentionally does not restate its procedure or declared grounding material/);
  assert.doesNotMatch(rendered.transportText, /Grounding material \(required before this Entry is fully grounded\)/);
  assert.equal(rendered.entryDefinition.schemaId, 'tiinex.entry.session.v1');
  assert.equal(rendered.entryDefinition.groundingMaterial.length, 1);
  assert.equal(rendered.entryDefinition.groundingMaterial[0].reference, 'https://example.invalid/ownership');
  assert.match(rendered.entryDefinition.groundingMaterial[0].purpose, /Establish the ownership boundary/);
});



test('EXPLORE requires current cross-Workspace grounding before participant-facing directions', () => {
  const result = projectWorkspaceCarrierEntry({
    inspection: { status: 'valid', carrierProjection: { mode: 'workspace', routes: [], startPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' }, findings: [] },
    mode: 'EXPLORE',
    contentSources: reusableEntrySources
  });
  assert.equal(result.status, 'ready');
  assert.match(result.transportText, /Entry intent: Explore/);
  assert.match(result.transportText, /Qualified Entry: tiinex\.core\.entry\.explore\.v1/);
  assert.match(result.transportText, /intentionally does not restate its procedure/);
  assert.doesNotMatch(result.transportText, /do not stop at the Workspace containing the Role or at the first plausible active or ready artifact/);
  assert.match(result.entryDefinition.summary, /most current truthful multi-Workspace grounding reasonably available/);
  assert.match(result.entryDefinition.preparation['Discovery Breadth'], /do not stop at the Workspace containing the Role or at the first plausible active or ready artifact/);
  assert.match(result.entryDefinition.preparation['Reconciliation Policy'], /reconcile lineage, supersession, returns, dependencies, implementation state, and ownership boundaries/);
  assert.match(result.entryDefinition.preparation['Currentness Policy'], /duplicated responsibility, ownership drift, scope creep, and missing continuity/);
  assert.match(result.entryDefinition.method.Method, /present the useful current picture, material seams or contradictions, and plausible directions/);
  assert.match(result.entryDefinition.presentation['Preference Sources'], /presentation or communication preferences from participating Role material/);
  assert.match(result.entryDefinition.presentation['Presentation Guidance'], /concise, scan-friendly, current-first presentation/);
  assert.ok(result.transportText.length < 1400, `expected reference-first transport, got ${result.transportText.length} chars`);
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
  assert.match(result.transportText, /Cold start: read Start directly; follow only its qualified bootstrap extraction instruction/);
  assert.match(result.transportText, /Pointerless Workspace carrier: after bootstrap, orient\/project the package/);
  assert.match(result.transportText, /Entry intent: Resume/);
  assert.match(result.transportText, /Session Role: Anchor/);
  assert.match(result.transportText, /Session Role: Anchor — material carried in this package at `business::\.topics\/roles\/anchor\.trace\.md`/);
  assert.match(result.transportText, /Participant: Sigma — material carried in this package at `business::\.topics\/roles\/sigma\.trace\.md`/);
  assert.match(result.transportText, /Session selections do not establish semantic holder\/participant\/recipient authority, acceptance, or work transfer/);
  assert.match(result.transportText, /qualify these exact Role materials and apply declared presentation\/communication preferences as presentation only/);
  assert.doesNotMatch(result.transportText, /TL;DR/i);
  assert.match(result.transportText, /No Handoff route, recipient, or work transfer is declared or implied\./);
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
  assert.match(result.transportText, /Participant: Anchor/);
});
