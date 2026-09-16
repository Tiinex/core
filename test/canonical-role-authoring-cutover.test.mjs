import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { validateArtifact } from '../src/validation/validateArtifact.js';
import { runCommonAuthorCli } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import binding from '../src/schemas/party/role/tiinex.party.role.v1.schema.json' with { type: 'json' };
import runtimeProjection from '../src/schemas/party/role/tiinex.party.role.v1.schema.runtime.json' with { type: 'json' };

const ROLE_SCHEMA_SHA = '2887aef16cf827b78fe38c1a2ba97cb5820d79049729d2cf8696ecf1de828871';
const EXACT_PRE_MIGRATION_AXIOM_SHA = 'f17e74db07c6a2d1288119c330a20b3b19cd0eb01f6a2c9f207d21102d9488d5';
const EXACT_PRE_MIGRATION_AXIOM_PARENT = new URL('./fixtures/roles/001-2-axiom-role.pre-migration.trace.md', import.meta.url);
const HISTORICAL_SCHEMA_TARGET = 'https://example.invalid/historical/tiinex.party.role.v1.schema.md';
const VALUES = Object.freeze({
  'Role Label': 'Historical Loom',
  'Role Kind': 'bounded role',
  'In Scope': 'bounded work',
  'Out Of Scope': 'everything else',
  'May Do': 'act within bounded work',
  'Does Not Authorize': 'semantic expansion',
  'Holder State': 'assignable only through bounded evidence',
  'Assignment Modes': 'explicit-session, explicit-role-invocation, handoff',
  'Does Not Prove': 'durable identity',
  'Must Not Be Treated As': 'participant proof'
});

function roleBody(assignmentModes = VALUES['Assignment Modes'], includeAssignmentModes = true) {
  return `# Loom Role\n\n## Role Identity\n\n- Role Label: ${VALUES['Role Label']}\n- Role Kind: ${VALUES['Role Kind']}\n\n## Role Boundary\n\n- In Scope: ${VALUES['In Scope']}\n- Out Of Scope: ${VALUES['Out Of Scope']}\n\n## Authority And Responsibility Boundary\n\n- May Do: ${VALUES['May Do']}\n- Does Not Authorize: ${VALUES['Does Not Authorize']}\n\n## Holder Relationship\n\n- Holder State: ${VALUES['Holder State']}${includeAssignmentModes ? `\n- Assignment Modes: ${assignmentModes}` : ''}\n\n## Interpretation Limits\n\n- Does Not Prove: ${VALUES['Does Not Prove']}\n- Must Not Be Treated As: ${VALUES['Must Not Be Treated As']}`;
}

function historicalParentMarkdown() {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.party.role.v1', transitionType: 'create-artifact' });
  assert.equal(contract.status, 'ready');
  const current = renderArtifactCreationDraftMarkdown(contract, { values: VALUES, title: 'Historical Loom', summary: 'Historical Loom', createdAt: '2026-09-01T10:00:00Z' });
  const changed = current.replace('- Current Schema: tiinex.party.role.v1', `- Current Schema: [tiinex.party.role.v1](${HISTORICAL_SCHEMA_TARGET})`);
  const resealed = sealC14nV2Self(changed);
  assert.equal(resealed.state, 'sealed');
  return `${resealed.markdown}\n`;
}

function axiomCurrentRoleBody() {
  return `# Axiom Role

## Role Identity

- Role Label: Axiom
- Role Kind: Tiinex schema recovery, design, and semantic reconciliation role

## Role Boundary

- In Scope: bounded current migration continuation
- Out Of Scope: unrelated authority

## Authority And Responsibility Boundary

- May Do: bounded schema work under supplied controlling artifacts
- Does Not Authorize: unrelated implementation or organizational authority

## Holder Relationship

- Holder State: assignable per explicit session or Handoff; no permanent holder asserted
- Assignment Modes: explicit-session, handoff

## Interpretation Limits

- Does Not Prove: durable holder identity
- Must Not Be Treated As: universal authority or participant proof`;
}

test('bundled Role schema material is the Axiom-amended Assignment Modes revision', async () => {
  assert.equal(binding.checksum.value, ROLE_SCHEMA_SHA);
  assert.equal(runtimeProjection.sourceChecksum, ROLE_SCHEMA_SHA);
  assert.equal(runtimeProjection.bindingChecksum, ROLE_SCHEMA_SHA);
  assert.equal(runtimeProjection.sourceBytes, 13216);
  assert.ok(runtimeProjection.creation.requiredInputs.includes('Assignment Modes'));
  const holder = runtimeProjection.validationContract.validation.ordinaryGroups.find((group) => group.group === 'Holder Relationship');
  assert.deepEqual(holder.requiredFields, ['Holder State', 'Assignment Modes']);
  const snapshot = await readFile(new URL('../src/schemas/party/role/tiinex.party.role.v1.schema.md', import.meta.url), 'utf8');
  assert.match(snapshot, /- Assignment Modes$/m);
});

test('Role Assignment Modes validator accepts only exact canonical serialization', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.party.role.v1', transitionType: 'create-artifact' });
  const render = (modes) => renderArtifactCreationDraftMarkdown(contract, { values: { ...VALUES, 'Assignment Modes': modes }, title: 'Loom Role', summary: 'Loom Role', createdAt: '2026-09-15T20:00:00Z' });
  const good = validateArtifact({ markdown: render('explicit-session, explicit-role-invocation, handoff') });
  assert.equal(good.findings.some((finding) => finding.severity === 'error'), false);
  for (const invalid of ['explicit-role-invocation, explicit-session', 'explicit-session,explicit-role-invocation', '`explicit-session`', 'explicit-session, explicit-session', 'explicit-ish-session']) {
    const result = validateArtifact({ markdown: render(invalid) });
    assert.ok(result.findings.some((finding) => finding.code === 'party.role.assignmentModes.invalid' && finding.severity === 'error'), invalid);
  }
});

test('common author preserves exact historical Role Parent schema locator while validating continuation against current Role schema', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-role-cutover-'));
  try {
    const parentPath = path.join(dir, '.topics', 'roles', '001-historical-role.trace.md');
    const bodyPath = path.join(dir, 'body.md');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(path.dirname(parentPath), { recursive: true }));
    await writeFile(parentPath, historicalParentMarkdown(), 'utf8');
    await writeFile(bodyPath, roleBody(), 'utf8');
    const result = await runCommonAuthorCli({ flags: { workspace: dir, schema: 'tiinex.party.role.v1', path: '.topics/roles/001-1-current-role.trace.md', body: bodyPath, parent: '.topics/roles/001-historical-role.trace.md', 'created-at': '2026-09-15T20:30:00Z', authors: 'Loom' } }, {});
    assert.equal(result.status, 'qualified', JSON.stringify(result.actionableFindings || result.findingSummary));
    const candidate = await readFile(path.join(dir, '.topics', 'roles', '001-1-current-role.trace.md'), 'utf8');
    assert.match(candidate, new RegExp(`Parent Schema: \\[tiinex\\.party\\.role\\.v1\\]\\(${HISTORICAL_SCHEMA_TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`));
    assert.match(candidate, /Current Schema: tiinex\.party\.role\.v1/);
    assert.match(candidate, /- Assignment Modes: explicit-session, explicit-role-invocation, handoff/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('common author qualifies a continuation from the exact pre-migration Axiom Role without revalidating historical bytes as the current Role revision', async () => {
  const parentMarkdown = await readFile(EXACT_PRE_MIGRATION_AXIOM_PARENT, 'utf8');
  assert.equal(Buffer.byteLength(parentMarkdown, 'utf8'), 4803);
  assert.equal(createHash('sha256').update(parentMarkdown, 'utf8').digest('hex'), EXACT_PRE_MIGRATION_AXIOM_SHA);
  assert.doesNotMatch(parentMarkdown, /- Assignment Modes:/);

  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-role-real-pre-migration-'));
  try {
    const bodyPath = path.join(dir, 'body.md');
    await writeFile(bodyPath, axiomCurrentRoleBody(), 'utf8');
    const result = await runCommonAuthorCli({ flags: {
      workspace: dir,
      schema: 'tiinex.party.role.v1',
      path: '.topics/roles/001-2-1-axiom-role.trace.md',
      body: bodyPath,
      parent: 'business::.topics/roles/001-2-axiom-role.trace.md',
      'parent-source': EXACT_PRE_MIGRATION_AXIOM_PARENT.pathname,
      'created-at': '2026-09-15T21:00:00Z',
      authors: 'Loom'
    } }, {});
    assert.equal(result.status, 'qualified', JSON.stringify(result.actionableFindings || result.findingSummary));
    assert.equal(result.artifact.parentPath, 'business::.topics/roles/001-2-axiom-role.trace.md');
    assert.ok(Number(result.findingSummary?.counts?.warning || 0) >= 1, JSON.stringify(result.findingSummary));

    const candidate = await readFile(path.join(dir, '.topics', 'roles', '001-2-1-axiom-role.trace.md'), 'utf8');
    assert.match(candidate, /Trace: \[001-2-axiom-role\.trace\.md\]\(business::\.topics\/roles\/001-2-axiom-role\.trace\.md\)/);
    assert.match(candidate, /- Assignment Modes: explicit-session, handoff/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('common author still fails closed when exact historical Parent bytes are tampered', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-role-real-parent-tamper-'));
  try {
    const exactParent = await readFile(EXACT_PRE_MIGRATION_AXIOM_PARENT, 'utf8');
    const parentSource = path.join(dir, 'tampered-parent.md');
    const bodyPath = path.join(dir, 'body.md');
    await writeFile(parentSource, exactParent.replace('# Axiom Role', '# Axiom Role Tampered'), 'utf8');
    await writeFile(bodyPath, axiomCurrentRoleBody(), 'utf8');
    await assert.rejects(
      runCommonAuthorCli({ flags: {
        workspace: dir,
        schema: 'tiinex.party.role.v1',
        path: '.topics/roles/001-2-1-axiom-role.trace.md',
        body: bodyPath,
        parent: 'business::.topics/roles/001-2-axiom-role.trace.md',
        'parent-source': parentSource,
        'created-at': '2026-09-15T21:00:00Z',
        authors: 'Loom'
      } }, {}),
      /portable\.cli\.author\.parent\.integrity\./
    );
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('common Role authoring fails closed for missing or invalid Assignment Modes', async () => {
  for (const [name, body] of [['missing', roleBody('', false)], ['invalid', roleBody('explicit-session-ish')]]) {
    const dir = await mkdtemp(path.join(tmpdir(), `tiinex-role-${name}-`));
    try {
      const parentPath = path.join(dir, '.topics', 'roles', '001-historical-role.trace.md');
      const bodyPath = path.join(dir, 'body.md');
      await import('node:fs/promises').then(({ mkdir }) => mkdir(path.dirname(parentPath), { recursive: true }));
      await writeFile(parentPath, historicalParentMarkdown(), 'utf8');
      await writeFile(bodyPath, body, 'utf8');
      const result = await runCommonAuthorCli({ flags: { workspace: dir, schema: 'tiinex.party.role.v1', path: '.topics/roles/001-1-current-role.trace.md', body: bodyPath, parent: '.topics/roles/001-historical-role.trace.md', 'created-at': '2026-09-15T20:30:00Z', authors: 'Loom' } }, {});
      assert.equal(result.status, 'blocked');
      assert.ok((result.stage?.findings || []).some((finding) => /Assignment Modes|assignmentModes/.test(`${finding.code} ${finding.message}`)), JSON.stringify(result.stage?.findings || []));
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
});
