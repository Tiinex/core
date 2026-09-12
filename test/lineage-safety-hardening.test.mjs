import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildArtifactCreationContract } from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { rootValidate } from '../src/schemas/tiinex.root.v1.validate.js';
import { parentRecoveryMode, recoverQualifiedRuntimeSchemaReferenceAuthority } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import { resolveArchiveParent } from '../src/tooling/portable/handoff/recipientV2.artifactFirst.closure.js';
import { reserveHandoffSiblingIndex } from '../src/tooling/portable/adapters/cli/cli.handoff-sibling-allocation.js';
import { writeExactRecipientTransportBytes } from '../src/tooling/portable/output/recipientV2.zip.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { sha256Hex } from '../src/export/package.bytes.js';
import { portableCanonicalBootstrapRuntime } from '../src/tooling/portable/schema/bootstrap/canonical.pack.js';
import { buildHandoffPointerEntrypoints } from '../src/tooling/portable/handoff/pointerEntrypoint.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';

const encoder = new TextEncoder();
const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';

function sealedParentMarkdown() {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-11 18:00:00\n  - Summary: Parent\n\n---\n\n# Parent\n\nParent body.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}

function validArtifactEnvelope(parent = {}) {
  return {
    hasContinuityContext: true,
    hasIntegrity: true,
    envelope: {
      envelopeSchema: { id: 'tiinex.root.v1' },
      current: { schema: { id: 'tiinex.task.v1' }, createdAt: '2026-09-11 18:00:00' },
      parent
    }
  };
}

test('common author and renderer preserve a Workspace-qualified Parent as the truthful recovery locator', () => {
  const parentReference = 'business::.topics/initiatives/002-parent.trace.md';
  assert.equal(parentRecoveryMode(parentReference), 'workspace-qualified');
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
  assert.equal(contract.status, 'ready');
  const markdown = renderArtifactCreationDraftMarkdown(contract, {
    currentSchemaId: 'tiinex.task.v1',
    parentRecord: {
      id: parentReference,
      path: parentReference,
      schemaId: 'tiinex.task.v1',
      createdAt: '2026-09-11 18:00:00',
      markdown: sealedParentMarkdown(),
      recoveryMode: 'workspace-qualified',
      schemaReferenceAuthority: contract.schemaReferences.current
    },
    childPath: '.topics/initiatives/002-1-child.trace.md',
    bodyMarkdown: '# Child\n\nChild body.',
    title: 'Child',
    summary: 'Child',
    createdAt: '2026-09-11 18:01:00'
  });
  assert.match(markdown, /- Trace: \[002-parent\.trace\.md\]\(business::\.topics\/initiatives\/002-parent\.trace\.md\)/);
  assert.match(markdown, /- \[relative\]\(business::\.topics\/initiatives\/002-parent\.trace\.md\)/);
  assert.doesNotMatch(markdown, /\.\.\/.*business::/);
});

test('common creation rendering uses the qualified immutable Root schema target instead of generating mixed bare/exact schema references', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  assert.equal(contract.schemaReferences.envelope.resolutionState, 'qualified');
  assert.equal(contract.schemaReferences.envelope.preferredTarget, ROOT_SCHEMA_TARGET);
  const markdown = renderArtifactCreationDraftMarkdown(contract, {
    currentSchemaId: 'tiinex.task.v1',
    childPath: '.topics/initiatives/001-new-task.trace.md',
    bodyMarkdown: '# New Task\n\nTask body.',
    title: 'New Task',
    summary: 'New Task',
    createdAt: '2026-09-12 01:00:00'
  });
  assert.match(markdown, new RegExp(`- Envelope Schema: \\[tiinex\\.root\\.v1\\]\\(${ROOT_SCHEMA_TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`));
  assert.match(markdown, new RegExp(`- Current Schema: \\[tiinex\\.task\\.v1\\]\\(${TASK_SCHEMA_TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`));
  assert.doesNotMatch(markdown, /- Envelope Schema: tiinex\.root\.v1\s*$/m);
});

test('local/unpublished Current schema references remain truthful while editor diagnostics only warn when canonical target authority is actually qualified', () => {
  const evidenceContract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  assert.equal(evidenceContract.schemaReferences.envelope.resolutionState, 'qualified');
  assert.equal(evidenceContract.schemaReferences.current.resolutionState, 'unavailable');
  assert.equal(evidenceContract.schemaReferences.current.preferredTarget, '');
  const localMarkdown = renderArtifactCreationDraftMarkdown(evidenceContract, {
    currentSchemaId: 'tiinex.evidence.v1',
    childPath: '.topics/evidence/001-local-evidence.trace.md',
    bodyMarkdown: '# Local Evidence\n\nLocal evidence body.',
    title: 'Local Evidence',
    summary: 'Local Evidence',
    createdAt: '2026-09-12 01:00:00'
  });
  assert.match(localMarkdown, new RegExp(`- Envelope Schema: \\[tiinex\\.root\\.v1\\]\\(${ROOT_SCHEMA_TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`));
  assert.match(localMarkdown, /^  - Current Schema: tiinex\.evidence\.v1$/m);
  const localAssistance = projectPortableEditorAssistance({ records: [{ path: '.topics/evidence/001-local-evidence.trace.md', markdown: localMarkdown }] });
  assert.equal(localAssistance.documents[0].diagnostics.some((item) => item.code === 'schema.reference.exact-target-omitted'), false);

  const historicalMixed = sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})\n  - Created At: 2026-09-12 01:00:00\n  - Summary: Historical mixed\n\n---\n\n# Historical mixed\n\nHistorical body.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending`);
  assert.equal(historicalMixed.state, 'sealed');
  const mixedAssistance = projectPortableEditorAssistance({ records: [{ path: '.topics/initiatives/001-historical.trace.md', markdown: historicalMixed.markdown }] });
  assert.ok(mixedAssistance.documents[0].diagnostics.some((item) => item.code === 'schema.reference.exact-target-omitted' && item.severity === 'warning' && item.line === 3));
});

test('portable Handoff route Pointer renderer uses the same qualified immutable Root schema target', () => {
  const projection = buildHandoffPointerEntrypoints({
    createdAt: '2026-09-12 01:00:00',
    carrierProjection: {
      status: 'ready',
      routes: [{
        id: 'core:.topics/handoffs/001-return.trace.md',
        state: 'qualified',
        workspaceId: 'core',
        dimension: '004-1',
        workspaceRelativePath: '.topics/handoffs/001-return.trace.md',
        pointerTarget: 'workspaces/core/.topics/handoffs/001-return.trace.md',
        packagePath: 'workspaces/core/.topics/handoffs/001-return.trace.md',
        parties: { to: 'Anchor' }
      }]
    }
  });
  assert.equal(projection.status, 'ready');
  assert.equal(projection.entries.length, 1);
  assert.match(projection.entries[0].markdown, new RegExp(`- Envelope Schema: \\[tiinex\\.root\\.v1\\]\\(${ROOT_SCHEMA_TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`));
  assert.doesNotMatch(projection.entries[0].markdown, /- Envelope Schema: tiinex\.root\.v1\s*$/m);
});

test('common author recovers Parent schema authority only from exact qualified runtime schema material', async () => {
  const authority = await recoverQualifiedRuntimeSchemaReferenceAuthority('tiinex.validation.report.v1', portableCanonicalBootstrapRuntime);
  assert.equal(authority?.resolutionState, 'qualified');
  assert.equal(authority?.targetAuthority, 'qualified-runtime-canonical-schema-material');
  assert.equal(authority?.preferredTarget, 'docs::.topics/.schemas/validation/report/tiinex.validation.report.v1.schema.md');
  assert.equal(authority?.resolutionEvidence?.kind, 'runtime-canonical-schema-byte-match');

  const staleSameId = await recoverQualifiedRuntimeSchemaReferenceAuthority('tiinex.party.role.v1', portableCanonicalBootstrapRuntime);
  assert.equal(staleSameId, null, 'same schema id with non-matching canonical bytes must not become authority');
});

test('runtime Parent schema recovery fails closed on ambiguous qualified representations and writes no Workspace schema copy', async () => {
  const canonicalRoot = portableCanonicalBootstrapRuntime.defaultSchemaMaterialPaths[0];
  const sourceRelative = 'validation/report/tiinex.validation.report.v1.schema.md';
  const exact = await readFile(path.join(canonicalRoot, sourceRelative), 'utf8');
  const alternateRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-runtime-alt-'));
  const alternatePath = path.join(alternateRoot, sourceRelative);
  await mkdir(path.dirname(alternatePath), { recursive: true });
  const mutated = sealC14nV2Self(exact.replace('# Validation Report', '# Validation Report Alternate'));
  assert.equal(mutated.state, 'sealed');
  await writeFile(alternatePath, mutated.markdown, 'utf8');

  const childWorkspace = await mkdtemp(path.join(os.tmpdir(), 'tiinex-author-child-'));
  const before = await readdir(childWorkspace);
  const authority = await recoverQualifiedRuntimeSchemaReferenceAuthority('tiinex.validation.report.v1', {
    ...portableCanonicalBootstrapRuntime,
    defaultSchemaMaterialPaths: [canonicalRoot, alternateRoot]
  });
  const after = await readdir(childWorkspace);
  assert.equal(authority, null);
  assert.deepEqual(after, before, 'schema authority recovery must not copy canonical schema material into the child Workspace');
});

test('Root validation rejects malformed mixed Workspace-qualified Parent recovery locators', () => {
  const malformed = '../../../../business::.topics/initiatives/002-parent.trace.md';
  const findings = rootValidate(validArtifactEnvelope({
    schema: { id: 'tiinex.task.v1' },
    trace: malformed,
    origin: malformed,
    originEntries: [{ label: 'relative', target: malformed }]
  }));
  assert.ok(findings.some((finding) => finding.code === 'root.parent.recovery.workspace-qualified.malformed' && finding.severity === 'error'));

  const qualified = 'business::.topics/initiatives/002-parent.trace.md';
  const qualifiedFindings = rootValidate(validArtifactEnvelope({
    schema: { id: 'tiinex.task.v1' },
    trace: qualified,
    origin: qualified,
    originEntries: [{ label: 'relative', target: qualified }]
  }));
  assert.equal(qualifiedFindings.some((finding) => finding.code === 'root.parent.recovery.workspace-qualified.malformed'), false);
});

test('artifact-first Parent recovery cannot use matching Parent bytes to rescue a malformed locator', () => {
  const markdown = sealedParentMarkdown();
  const data = encoder.encode(markdown);
  const digest = validatedC14nV2PrimarySelfDigest(markdown);
  assert.equal(digest.state, 'verified');
  const candidate = { workspaceId: 'business', workspaceRelativePath: '.topics/initiatives/002-parent.trace.md', data, bytes: data.byteLength, sha256: sha256Hex(data) };
  const malformed = '../../../../business::.topics/initiatives/002-parent.trace.md';
  const bad = resolveArchiveParent('.topics/initiatives/002-1-handoff.trace.md', [], {
    trace: malformed,
    originEntries: [{ label: 'relative', target: malformed }]
  }, { value: digest.value }, [candidate]);
  assert.equal(bad.state, 'unresolved');
  assert.equal(bad.reason, 'parent-workspace-qualified-reference-malformed');

  const qualified = 'business::.topics/initiatives/002-parent.trace.md';
  const good = resolveArchiveParent('.topics/initiatives/002-1-handoff.trace.md', [], {
    trace: qualified,
    originEntries: [{ label: 'relative', target: qualified }]
  }, { value: digest.value }, [candidate]);
  assert.equal(good.state, 'qualified');
  assert.equal(good.basis, 'artifact-first-workspace-qualified-reference');
});

test('parallel carrier manufacture requires an explicit sibling index instead of local next-slot discovery', async () => {
  const first = await mkdtemp(path.join(os.tmpdir(), 'tiinex-sibling-a-'));
  const second = await mkdtemp(path.join(os.tmpdir(), 'tiinex-sibling-b-'));
  const common = { parentPackageSha256: 'a'.repeat(64), parentDimension: '002-2-2', enabled: true };
  await assert.rejects(() => reserveHandoffSiblingIndex({ ...common, parentPackagePath: path.join(first, 'parent.zip') }), /explicit-index-required/);
  await assert.rejects(() => reserveHandoffSiblingIndex({ ...common, parentPackagePath: path.join(second, 'parent.zip') }), /explicit-index-required/);

  const one = await reserveHandoffSiblingIndex({ ...common, parentPackagePath: path.join(first, 'parent.zip'), siblingIndex: 1 });
  const two = await reserveHandoffSiblingIndex({ ...common, parentPackagePath: path.join(second, 'parent.zip'), siblingIndex: 2 });
  assert.equal(one.siblingIndex, 1);
  assert.equal(two.siblingIndex, 2);
  assert.equal(one.state, 'reserved-explicit');
  assert.equal(two.state, 'reserved-explicit');
  const repeated = await reserveHandoffSiblingIndex({ ...common, parentPackagePath: path.join(first, 'parent.zip'), siblingIndex: 1 });
  assert.equal(repeated.state, 'reused-explicit');
});

test('exact carrier output is idempotent for identical bytes and fails closed on divergent bytes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'tiinex-carrier-write-'));
  const target = path.join(directory, 'tiinex-002-2-2-1.handoff-package.zip');
  const firstBytes = Buffer.from('same carrier bytes');
  const differentBytes = Buffer.from('different carrier bytes');
  const first = await writeExactRecipientTransportBytes(target, firstBytes);
  assert.equal(first.status, 'written');
  const repeated = await writeExactRecipientTransportBytes(target, firstBytes);
  assert.equal(repeated.status, 'reused-identical');
  assert.deepEqual(await readFile(target), firstBytes);
  await assert.rejects(() => writeExactRecipientTransportBytes(target, differentBytes), /output-collision-divergent/);
  assert.deepEqual(await readFile(target), firstBytes);
});
