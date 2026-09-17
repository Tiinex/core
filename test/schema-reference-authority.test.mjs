import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildArtifactCreationContract,
  validateArtifactCreationResult
} from '../src/schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../src/schemas/creation.renderer.js';
import { validatePortableDraft } from '../src/tooling/portable/draft/draft.operations.js';
import { auditPortableRecord } from '../src/tooling/portable/audit/audit.capability.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';
import { qualifyPortableManufactureSchemaReferenceCandidate } from '../src/tooling/portable/handoff/schemaReferencePreflight.js';
import { qualifyTiinexRouteArtifact } from '../src/tooling/portable/handoff/routeArtifactConformance.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const EVIDENCE_EXACT_TARGET = 'docs::.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md';

function render(schemaId, contract = buildArtifactCreationContract({ schemaId, transitionType: 'create-artifact' }), bodyMarkdown = '# Body\n\nBody.') {
  return renderArtifactCreationDraftMarkdown(contract, {
    currentSchemaId: schemaId,
    childPath: `.topics/testing/${schemaId}.trace.md`,
    bodyMarkdown,
    title: 'Schema reference test',
    summary: 'Schema reference test',
    createdAt: '2026-09-12 02:00:00'
  });
}

function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}

function exactEvidenceAuthority(base, { stale = false } = {}) {
  const material = base.semanticMaterialIdentity;
  const sha256 = stale ? '0'.repeat(64) : material.sha256;
  return {
    schemaId: 'tiinex.evidence.v1',
    resolutionState: 'qualified',
    exactTargets: [EVIDENCE_EXACT_TARGET],
    preferredTarget: EVIDENCE_EXACT_TARGET,
    resolutionEvidence: {
      state: 'qualified',
      target: EVIDENCE_EXACT_TARGET,
      kind: 'test-qualified-exact-material',
      materialIdentity: {
        state: 'qualified',
        schemaId: 'tiinex.evidence.v1',
        sha256,
        sourceBlobSha: material.sourceBlobSha,
        bytes: material.bytes
      }
    }
  };
}

test('prospective creation and draft staging require exact Root target when exact authority is qualified', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  const canonical = render('tiinex.task.v1', contract);
  assert.match(canonical, new RegExp(`- Envelope Schema: \\[tiinex\\.root\\.v1\\]\\(${ROOT_SCHEMA_TARGET.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\)`));

  const forcedBare = reseal(canonical.replace(`- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})`, '- Envelope Schema: tiinex.root.v1'));
  const creation = validateArtifactCreationResult({
    schemaId: 'tiinex.task.v1',
    status: 'local',
    sourceMode: 'local-create',
    path: '.topics/testing/task.trace.md',
    markdown: forcedBare
  }, {}, { contract, childPath: '.topics/testing/task.trace.md' });
  assert.equal(creation.ok, false);
  assert.ok(creation.findings.some((item) => String(item.code).startsWith('creation.schema-reference.') && item.severity === 'error'));

  const staged = validatePortableDraft({ path: '.topics/testing/task.trace.md', schemaId: 'tiinex.task.v1', markdown: forcedBare });
  assert.equal(staged.status, 'invalid');
  assert.ok(staged.findings.some((item) => item.code === 'schema.reference.exact-target-omitted' && item.severity === 'error'));
});

test('plain Current Evidence is truthful when no qualified exact current target exists', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  assert.equal(contract.schemaReferences.current.resolutionState, 'unavailable');
  const markdown = render('tiinex.evidence.v1', contract);
  assert.match(markdown, /^  - Current Schema: tiinex\.evidence\.v1$/m);
  const audit = auditPortableRecord({ path: '.topics/testing/evidence.trace.md', markdown, schemaId: 'tiinex.evidence.v1' });
  assert.equal(audit.findings.some((item) => item.code === 'schema.reference.exact-target-omitted' && item.params?.field === 'Current Schema'), false);
  const editor = projectPortableEditorAssistance({ records: [{ path: '.topics/testing/evidence.trace.md', markdown, schemaId: 'tiinex.evidence.v1' }] });
  assert.equal(editor.documents[0].diagnostics.some((item) => item.code === 'schema.reference.exact-target-omitted' && item.line === 5), false);
});

test('qualified exact Evidence material renders an exact Current link while stale material authority is refused', () => {
  const base = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  const qualified = buildArtifactCreationContract({
    schemaId: 'tiinex.evidence.v1',
    transitionType: 'create-artifact',
    schemaReferences: { current: exactEvidenceAuthority(base.schemaReferences.current) }
  });
  assert.equal(qualified.schemaReferences.current.resolutionState, 'qualified');
  assert.equal(qualified.schemaReferences.current.preferredTarget, EVIDENCE_EXACT_TARGET);
  assert.match(render('tiinex.evidence.v1', qualified), new RegExp(`Current Schema: \\[tiinex\\.evidence\\.v1\\]\\(${EVIDENCE_EXACT_TARGET.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\)`));

  const stale = buildArtifactCreationContract({
    schemaId: 'tiinex.evidence.v1',
    transitionType: 'create-artifact',
    schemaReferences: { current: exactEvidenceAuthority(base.schemaReferences.current, { stale: true }) }
  });
  assert.equal(stale.schemaReferences.current.resolutionState, 'unresolved');
  assert.equal(stale.schemaReferences.current.preferredTarget, '');
  assert.match(render('tiinex.evidence.v1', stale), /^  - Current Schema: tiinex\.evidence\.v1$/m);
  assert.doesNotMatch(render('tiinex.evidence.v1', stale), new RegExp(EVIDENCE_EXACT_TARGET.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
});

test('historical bare Root bytes are preserved while shared audit and editor project the same warning severity', () => {
  const canonical = render('tiinex.task.v1');
  const historical = reseal(canonical.replace(`- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})`, '- Envelope Schema: tiinex.root.v1'));
  const before = historical;
  const record = { path: '.topics/testing/historical-site-like.trace.md', markdown: historical, schemaId: 'tiinex.task.v1' };
  const audit = auditPortableRecord(record);
  const shared = audit.findings.find((item) => item.code === 'schema.reference.exact-target-omitted' && item.params?.field === 'Envelope Schema');
  assert.equal(shared?.severity, 'warning');
  const editor = projectPortableEditorAssistance({ records: [record] });
  const diagnostic = editor.documents[0].diagnostics.find((item) => item.code === 'schema.reference.exact-target-omitted' && item.line === 3);
  assert.equal(diagnostic?.severity, shared?.severity);
  assert.equal(record.markdown, before, 'audit/editor assistance must not rewrite historical bytes');
  assert.equal(editor.operationBoundary.sourceMutation, false);
});

test('resolved link material identity contradiction remains blocking even in historical audit', () => {
  const canonical = render('tiinex.task.v1');
  const contradictory = reseal(canonical.replace(`- Current Schema: [tiinex.task.v1](${TASK_SCHEMA_TARGET})`, `- Current Schema: [tiinex.task.v1](${ROOT_SCHEMA_TARGET})`));
  const audit = auditPortableRecord({ path: '.topics/testing/contradiction.trace.md', markdown: contradictory, schemaId: 'tiinex.task.v1' });
  const finding = audit.findings.find((item) => item.code === 'schema.reference.material-identity-contradiction');
  assert.equal(finding?.severity, 'error');
  assert.match(finding?.message || '', /positively qualified as tiinex\.root\.v1/);
});

test('manufacture preflight gates active Handoff candidate prospectively without reclassifying carried history', () => {
  const handoff = render('tiinex.handoff.v1');
  const forcedBare = reseal(handoff.replace(`- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})`, '- Envelope Schema: tiinex.root.v1'));
  const preflight = qualifyPortableManufactureSchemaReferenceCandidate({ path: '.topics/handoffs/001-return.trace.md', markdown: forcedBare, schemaId: 'tiinex.handoff.v1' });
  assert.equal(preflight.state, 'blocked');
  assert.ok(preflight.findings.some((item) => item.code === 'schema.reference.exact-target-omitted' && item.severity === 'error'));
  assert.match(preflight.boundary, /actively selected local Handoff candidate only/);
});


test('workspace editor assistance preserves resolver-capable Current Schema permalink while resealing exact package conformance', () => {
  const unqualifiedWorkspaceTarget = 'https://github.com/Tiinex/docs/blob/c5c0a8173dcc0816d239a64fa363c7924df216b1/.topics/.schemas/tiinex.workspace.v1.schema.md';
  let markdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${unqualifiedWorkspaceTarget})\n  - Created At: 2026-09-17 15:30:00\n  - Authors: Sigma\n  - Why: External private-repository dogfood Workspace.\n  - Summary: Minimal Workspace used to qualify pointerless package manufacture.\n  - Status: active/local\n\n---\n\n# Private Workspace\n\n## Workspace Entrypoints\n\n### Repository source\n\n- Source Kind: local-directory\n- Repository: Tiinusen/boardgame-tower-havoc\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)\n  - Towards: self\n  - Value: stale\n`;
  const record = { path: '.topics/.workspaces/private.workspace.md', markdown, schemaId: 'tiinex.workspace.v1' };
  const editor = projectPortableEditorAssistance({ records: [record] });
  const schemaDiagnostic = editor.documents[0].diagnostics.find((item) => item.code === 'audit.schema-authority.unqualified');
  const integrityDiagnostic = editor.documents[0].diagnostics.find((item) => item.code === 'integrity.c14n-v2.mismatch');
  assert.equal(schemaDiagnostic?.locationBasis, 'field:Current Schema');
  assert.ok(Number(schemaDiagnostic?.sourceRange?.startLine || 0) > 1);
  assert.equal(schemaDiagnostic?.sourceRange?.startLine, schemaDiagnostic?.line);
  assert.equal(integrityDiagnostic?.locationBasis, 'continuity-integrity-value');
  assert.ok(Number(integrityDiagnostic?.sourceRange?.startLine || 0) > Number(schemaDiagnostic?.sourceRange?.startLine || 0));
  const action = editor.documents[0].actions.find((item) => item.id === 'normalize-workspace-schema-and-self-integrity');
  assert.ok(action, 'workspace package-conformance repair must be projected');
  assert.match(action.replacementMarkdown, new RegExp(`^  - Current Schema: \\[tiinex\\.workspace\\.v1\\]\\(${unqualifiedWorkspaceTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)$`, 'm'));
  assert.equal(action.title, 'Repair Workspace self integrity');
  const conformance = qualifyTiinexRouteArtifact({ markdown: action.replacementMarkdown, expectedSchemaId: 'tiinex.workspace.v1', requireExactContract: true });
  assert.equal(conformance.status, 'qualified');
  assert.equal(conformance.selfIntegrity.state, 'verified');
  const repairedEditor = projectPortableEditorAssistance({ records: [{ ...record, markdown: action.replacementMarkdown }] });
  assert.equal(repairedEditor.documents[0].diagnostics.length, 0, 'the exact packable replacement must also be clean in editor assistance');
  assert.equal(repairedEditor.documents[0].validator.state, 'qualified-exact');
  assert.equal(repairedEditor.documents[0].validator.authorityState, 'qualified-package-conformance');
});
