import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCommonAuthorCli, sameExactSchemaReferenceAuthority } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { isQualifiedIdentifierOnlyHistoricalSchemaReferenceAuthority, qualifiedIdentifierOnlyHistoricalSchemaReferenceAuthority } from '../src/schemas/schema.reference.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const ROLE_SCHEMA_ID = 'tiinex.party.role.v1';
const ROLE_SCHEMA_SHA = '2887aef16cf827b78fe38c1a2ba97cb5820d79049729d2cf8696ecf1de828871';
const PARENTS = Object.freeze([
  Object.freeze({
    label: 'Anchor',
    reference: 'business::.topics/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.trace.md',
    fixture: new URL('./fixtures/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.identifier-only.trace.md', import.meta.url),
    bytes: 6041,
    sha256: 'a6696ac191fc5cbcbc642bb3fd6bbf13fa392d1762dc6029603501163b4131bc',
    modes: 'explicit-session, handoff'
  }),
  Object.freeze({
    label: 'Prism',
    reference: 'business::.topics/roles/001-8-1-prism-role.trace.md',
    fixture: new URL('./fixtures/roles/001-8-1-prism-role.identifier-only.trace.md', import.meta.url),
    bytes: 7038,
    sha256: '2c537057db40e70db642a4d3615285b56eb457eeca09d1f3c612bf23969f8dc9',
    modes: 'explicit-session, explicit-role-invocation, handoff'
  })
]);

function roleBody(label, modes) {
  return `# ${label} Role

## Role Identity

- Role Label: ${label}
- Role Kind: bounded current Role continuation

## Role Boundary

- In Scope: bounded continuation work
- Out Of Scope: unrelated authority

## Authority And Responsibility Boundary

- May Do: bounded work under supplied controlling artifacts
- Does Not Authorize: semantic or organizational expansion

## Holder Relationship

- Holder State: assignable through bounded explicit authority
- Assignment Modes: ${modes}

## Interpretation Limits

- Does Not Prove: durable holder identity
- Must Not Be Treated As: universal authority or participant proof`;
}

async function authorFromExactParent(parent, overrides = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), `tiinex-id-only-${parent.label.toLowerCase()}-`));
  const bodyPath = path.join(dir, 'body.md');
  await writeFile(bodyPath, roleBody(parent.label, parent.modes), 'utf8');
  const parentSource = overrides.parentSource || parent.fixture.pathname;
  const result = await runCommonAuthorCli({ flags: {
    workspace: dir,
    schema: ROLE_SCHEMA_ID,
    path: `.topics/roles/001-${parent.label.toLowerCase()}-current.trace.md`,
    body: bodyPath,
    parent: parent.reference,
    'parent-source': parentSource,
    'created-at': '2026-09-16T00:15:00Z',
    authors: 'Loom'
  } }, overrides.runtime || {});
  return { dir, bodyPath, result, childPath: path.join(dir, `.topics/roles/001-${parent.label.toLowerCase()}-current.trace.md`) };
}

test('identifier-only historical schema authority is qualified without claiming an exact historical revision', () => {
  const authority = qualifiedIdentifierOnlyHistoricalSchemaReferenceAuthority(ROLE_SCHEMA_ID, { basis: 'test-exact-parent' });
  assert.equal(isQualifiedIdentifierOnlyHistoricalSchemaReferenceAuthority(authority), true);
  assert.equal(authority.resolutionState, 'qualified');
  assert.equal(authority.targetAuthority, 'schema-id-only');
  assert.equal(authority.preferredTarget, '');
  assert.deepEqual(authority.exactTargets, []);
  assert.equal(authority.historicalReferenceAuthority.kind, 'identifier-only');
  assert.equal(authority.historicalReferenceAuthority.exactRevisionState, 'unresolved');
});

test('real active Anchor and Prism identifier-only historical Parents continue directly without current-schema target substitution', async () => {
  const contract = buildArtifactCreationContract({ schemaId: ROLE_SCHEMA_ID, transitionType: 'continue-from-record' });
  assert.equal(contract.status, 'ready');
  assert.equal(contract.target.binding.checksum, ROLE_SCHEMA_SHA, 'current child schema authority must remain the exact amended Role schema snapshot');

  for (const parent of PARENTS) {
    const markdown = await readFile(parent.fixture, 'utf8');
    assert.equal(Buffer.byteLength(markdown, 'utf8'), parent.bytes, parent.label);
    assert.equal(createHash('sha256').update(markdown, 'utf8').digest('hex'), parent.sha256, parent.label);
    assert.match(markdown, /- Current Schema: tiinex\.party\.role\.v1$/m, parent.label);
    assert.doesNotMatch(markdown, /- Current Schema: \[tiinex\.party\.role\.v1\]\(/, parent.label);
    assert.doesNotMatch(markdown, /- Assignment Modes:/, parent.label);

    const authored = await authorFromExactParent(parent);
    try {
      assert.equal(authored.result.status, 'qualified', `${parent.label}: ${JSON.stringify(authored.result.actionableFindings || authored.result.findingSummary)}`);
      assert.deepEqual(authored.result.artifact.parentSchemaReferenceAuthority, {
        state: 'qualified',
        kind: 'identifier-only',
        schemaId: ROLE_SCHEMA_ID,
        target: '',
        exactRevisionState: 'unresolved',
        provenance: {
          state: 'qualified',
          kind: 'historical-declared-schema-identifier-only',
          schemaId: ROLE_SCHEMA_ID,
          basis: 'exact-historical-parent-current-schema-identifier',
          parentPath: parent.reference,
          parentSha256: parent.sha256
        },
        boundary: 'Exact historical Parent artifact identity/integrity and declared schema identifier are qualified; no exact historical schema representation target is claimed or inferred.'
      });
      const child = await readFile(authored.childPath, 'utf8');
      assert.match(child, /  - Parent Schema: tiinex\.party\.role\.v1$/m, parent.label);
      assert.doesNotMatch(child, /  - Parent Schema: \[tiinex\.party\.role\.v1\]\(/, parent.label);
      assert.match(child, new RegExp(`  - Trace: \\[.*?\\]\\(${parent.reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`), parent.label);
      assert.match(child, new RegExp(`    - \\[relative\\]\\(${parent.reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`), parent.label);
      assert.match(child, new RegExp(`- Assignment Modes: ${parent.modes.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), parent.label);
    } finally {
      await rm(authored.dir, { recursive: true, force: true });
    }
  }
});

test('identifier-only historical Parent stays identifier-only even when current exact Role schema material is available to authoring', async () => {
  const parent = PARENTS[0];
  const authored = await authorFromExactParent(parent);
  try {
    assert.equal(authored.result.status, 'qualified');
    assert.equal(authored.result.artifact.parentSchemaReferenceAuthority.kind, 'identifier-only');
    assert.equal(authored.result.artifact.parentSchemaReferenceAuthority.target, '');
    const child = await readFile(authored.childPath, 'utf8');
    assert.match(child, /  - Parent Schema: tiinex\.party\.role\.v1$/m);
    assert.doesNotMatch(child, /Parent Schema: .*docs::\.topics\/\.schemas\/party\/role/);
  } finally { await rm(authored.dir, { recursive: true, force: true }); }
});

test('identifier-only continuation fails closed when exact historical Parent bytes fail self-integrity', async () => {
  const parent = PARENTS[0];
  const dir = await mkdtemp(path.join(os.tmpdir(), 'tiinex-id-only-tamper-'));
  try {
    const exact = await readFile(parent.fixture, 'utf8');
    const tampered = path.join(dir, 'tampered-parent.md');
    await writeFile(tampered, exact.replace('# Anchor Role', '# Anchor Role Tampered'), 'utf8');
    await assert.rejects(authorFromExactParent(parent, { parentSource: tampered }), /portable\.cli\.author\.parent\.integrity\./);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('identifier-only continuation fails closed when historical Current Schema id is missing', async () => {
  const parent = PARENTS[1];
  const dir = await mkdtemp(path.join(os.tmpdir(), 'tiinex-id-only-no-schema-'));
  try {
    const exact = await readFile(parent.fixture, 'utf8');
    const mutated = sealC14nV2Self(exact.replace('- Current Schema: tiinex.party.role.v1', '- Current Schema: '));
    assert.equal(mutated.state, 'sealed');
    const source = path.join(dir, 'no-schema-parent.md');
    await writeFile(source, mutated.markdown, 'utf8');
    await assert.rejects(authorFromExactParent(parent, { parentSource: source }), /portable\.cli\.author\.parent\.schema-authority\.required/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('identifier-only historical authority never upgrades into same-revision target authority by schema-id equality', () => {
  const historical = qualifiedIdentifierOnlyHistoricalSchemaReferenceAuthority(ROLE_SCHEMA_ID, { basis: 'adversarial' });
  const current = buildArtifactCreationContract({ schemaId: ROLE_SCHEMA_ID, transitionType: 'continue-from-record' }).schemaReferences.current;
  assert.equal(historical.schemaId, current.schemaId);
  assert.equal(historical.exactTargets.length, 0);
  assert.equal(historical.preferredTarget, '');
  assert.equal(historical.historicalReferenceAuthority.exactRevisionState, 'unresolved');
  assert.equal(sameExactSchemaReferenceAuthority(historical, current, ROLE_SCHEMA_ID), false, 'same schema id must not become exact same-revision authority');
});


test('identifier-only correction still blocks a declared historical schema target that resolves to another schema identity', async () => {
  const parent = PARENTS[0];
  const dir = await mkdtemp(path.join(os.tmpdir(), 'tiinex-id-only-contradictory-target-'));
  try {
    const exact = await readFile(parent.fixture, 'utf8');
    const contradictoryTarget = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
    const mutated = sealC14nV2Self(exact.replace('- Current Schema: tiinex.party.role.v1', `- Current Schema: [tiinex.party.role.v1](${contradictoryTarget})`));
    assert.equal(mutated.state, 'sealed');
    const source = path.join(dir, 'contradictory-target-parent.md');
    await writeFile(source, mutated.markdown, 'utf8');
    const authored = await authorFromExactParent(parent, { parentSource: source });
    try {
      assert.equal(authored.result.status, 'blocked');
      assert.ok((authored.result.actionableFindings || []).some((finding) => finding.code === 'schema.reference.material-identity-contradiction'));
    } finally { await rm(authored.dir, { recursive: true, force: true }); }
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('identifier-only correction still blocks malformed historical Parent recovery', async () => {
  const parent = PARENTS[0];
  const dir = await mkdtemp(path.join(os.tmpdir(), 'tiinex-id-only-bad-recovery-'));
  try {
    const exact = await readFile(parent.fixture, 'utf8');
    const mutated = sealC14nV2Self(exact
      .replace('  - Trace: [001-1-1-1-anchor-successor-evolution-role.trace.md](001-1-1-1-anchor-successor-evolution-role.trace.md)', '  - Trace: [bad](../../business::.topics/roles/bad.trace.md)')
      .replace('    - [relative](001-1-1-1-anchor-successor-evolution-role.trace.md)', '    - [relative](../../business::.topics/roles/bad.trace.md)'));
    assert.equal(mutated.state, 'sealed');
    const source = path.join(dir, 'bad-recovery-parent.md');
    await writeFile(source, mutated.markdown, 'utf8');
    const authored = await authorFromExactParent(parent, { parentSource: source });
    try {
      assert.equal(authored.result.status, 'blocked');
      assert.ok((authored.result.actionableFindings || []).some((finding) => finding.code === 'root.parent.recovery.workspace-qualified.malformed'));
    } finally { await rm(authored.dir, { recursive: true, force: true }); }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
