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
import { projectPortableManufactureSchemaReferenceAuthorities, qualifyPortableManufactureSchemaReferenceCandidate } from '../src/tooling/portable/handoff/schemaReferencePreflight.js';
import { qualifyTiinexRouteArtifact } from '../src/tooling/portable/handoff/routeArtifactConformance.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';

const ROOT_SCHEMA_TARGET = currentSchemaTarget('tiinex.root.v1');
const TASK_SCHEMA_TARGET = currentSchemaTarget('tiinex.task.v1');
const EVIDENCE_EXACT_TARGET = 'docs::.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md';
const EVIDENCE_CURRENT_TARGET = EVIDENCE_EXACT_TARGET;

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

test('locally qualified Evidence-v1 refuses a fabricated published source link', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'create-artifact' });
  assert.equal(contract.schemaReferences.current.resolutionState, 'unavailable');
  assert.equal(contract.schemaReferences.current.semanticMaterialIdentity.state, 'qualified');
  assert.equal(contract.schemaReferences.current.semanticMaterialIdentity.sourceCommit, '');
  assert.equal(contract.schemaReferences.current.semanticMaterialIdentity.sourcePath, '.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md');
  assert.equal(contract.schemaReferences.current.preferredTarget, '');
  const markdown = render('tiinex.evidence.v1', contract);
  assert.match(markdown, /^  - Current Schema: tiinex\.evidence\.v1$/m);
  assert.doesNotMatch(markdown, /Current Schema: \[tiinex\.evidence\.v1\]/);
  const audit = auditPortableRecord({ path: '.topics/testing/evidence.trace.md', markdown, schemaId: 'tiinex.evidence.v1' });
  assert.equal(audit.findings.some((item) => item.code === 'schema.reference.exact-target-omitted' && item.params?.field === 'Current Schema' && item.severity === 'error'), false);
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



test('candidate validation treats an older immutable schema locator as qualified when explicit resolution proves byte-equivalent material', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  const material = contract.schemaReferences.current.semanticMaterialIdentity;
  assert.equal(material.state, 'qualified');
  const olderTarget = TASK_SCHEMA_TARGET.replace(/\/blob\/[^/]+\//, '/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/');
  assert.notEqual(olderTarget, TASK_SCHEMA_TARGET);
  const markdown = reseal(render('tiinex.task.v1', contract).replace(TASK_SCHEMA_TARGET, olderTarget));
  const resolutions = [{
    target: olderTarget,
    exact: { state: 'resolved', sha256: material.sha256, sourceBlobSha: material.sourceBlobSha, bytes: material.bytes },
    latest: { state: 'resolved', target: TASK_SCHEMA_TARGET, sha256: material.sha256, sourceBlobSha: material.sourceBlobSha, bytes: material.bytes }
  }];
  const record = { path: '.topics/testing/equivalent-old-schema-locator.trace.md', markdown, schemaId: 'tiinex.task.v1' };
  const audit = auditPortableRecord(record, { requireExactSchemaAuthority: true, schemaReferenceContext: 'candidate', schemaReferenceResolutions: resolutions });
  assert.equal(audit.findings.some((item) => String(item.code || '').startsWith('schema.reference.') && item.severity === 'error'), false);
  assert.equal(audit.findings.some((item) => item.code === 'schema.reference.locator.unresolved'), false);
  assert.equal(audit.schemaValidationAuthority?.state, 'qualified');
  assert.equal(audit.schemaValidationAuthority?.currentReference?.basis, 'declared-current-schema-equivalent-source-target');
  assert.equal(audit.findings.some((item) => item.code === 'audit.schema-authority.unqualified'), false);
  assert.equal(audit.validation?.state, 'exact-schema-validated');
  assert.equal(audit.validation?.semanticContract?.available, true);

  const editor = projectPortableEditorAssistance({ records: [record], focusPath: record.path, referenceResolutions: resolutions });
  assert.equal(editor.documents[0].diagnostics.some((item) => item.code === 'reference.permalink.stale'), false);
  assert.equal(editor.documents[0].actions.length, 0);
  const preflight = qualifyPortableManufactureSchemaReferenceCandidate(record, { schemaReferenceResolutions: resolutions });
  assert.equal(preflight.state, 'qualified');
  assert.equal(preflight.findings.some((item) => item.code === 'schema.reference.target-unqualified'), false);
});

test('candidate validation does not grant authority to byte-identical material at a different canonical source path', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  const material = contract.schemaReferences.current.semanticMaterialIdentity;
  const copiedTarget = TASK_SCHEMA_TARGET.replace('/core/task/tiinex.task.v1.schema.md', '/core/topic/tiinex.task.v1.schema.md');
  assert.notEqual(copiedTarget, TASK_SCHEMA_TARGET);
  const markdown = reseal(render('tiinex.task.v1', contract).replace(TASK_SCHEMA_TARGET, copiedTarget));
  const audit = auditPortableRecord({ path: '.topics/testing/copied-schema-material.trace.md', markdown, schemaId: 'tiinex.task.v1' }, {
    requireExactSchemaAuthority: true,
    schemaReferenceContext: 'candidate',
    schemaReferenceResolutions: [{ target: copiedTarget, exact: { state: 'resolved', sha256: material.sha256, sourceBlobSha: material.sourceBlobSha, bytes: material.bytes } }]
  });
  assert.equal(audit.findings.some((item) => item.code === 'schema.reference.target-unqualified' && item.severity === 'error'), true);
  assert.equal(audit.schemaValidationAuthority?.state, 'unavailable');
  assert.equal(audit.findings.some((item) => item.code === 'audit.schema-authority.unqualified'), true);
});

test('candidate validation still blocks an immutable schema locator when explicit resolution proves different material', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  const material = contract.schemaReferences.current.semanticMaterialIdentity;
  const olderTarget = TASK_SCHEMA_TARGET.replace(/\/blob\/[^/]+\//, '/blob/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/');
  const markdown = reseal(render('tiinex.task.v1', contract).replace(TASK_SCHEMA_TARGET, olderTarget));
  const record = { path: '.topics/testing/mismatched-old-schema-locator.trace.md', markdown, schemaId: 'tiinex.task.v1' };
  const audit = auditPortableRecord(record, {
    requireExactSchemaAuthority: true,
    schemaReferenceContext: 'candidate',
    schemaReferenceResolutions: [{ target: olderTarget, exact: { state: 'resolved', sha256: '0'.repeat(64), sourceBlobSha: material.sourceBlobSha, bytes: material.bytes } }]
  });
  assert.equal(audit.findings.some((item) => item.code === 'schema.reference.target-unqualified' && item.severity === 'error'), true);
  assert.equal(audit.schemaValidationAuthority?.state, 'unavailable');
  assert.equal(audit.findings.some((item) => item.code === 'audit.schema-authority.unqualified'), true);
});

test('candidate validation remains fail-closed for an older immutable schema locator without material-resolution evidence', () => {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
  const olderTarget = TASK_SCHEMA_TARGET.replace(/\/blob\/[^/]+\//, '/blob/cccccccccccccccccccccccccccccccccccccccc/');
  const markdown = reseal(render('tiinex.task.v1', contract).replace(TASK_SCHEMA_TARGET, olderTarget));
  const record = { path: '.topics/testing/unresolved-old-schema-locator.trace.md', markdown, schemaId: 'tiinex.task.v1' };
  const audit = auditPortableRecord(record, { requireExactSchemaAuthority: true, schemaReferenceContext: 'candidate' });
  assert.equal(audit.schemaValidationAuthority?.state, 'unavailable');
  assert.equal(audit.findings.some((item) => item.code === 'schema.reference.target-unqualified' && item.severity === 'error'), true);
  assert.equal(audit.findings.some((item) => item.code === 'audit.schema-authority.unqualified'), true);
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


test('manufacture preflight preserves exact historical Parent Schema authority from the integrity-qualified local Parent while Current Schema stays prospective', () => {
  const parentPath = '.topics/testing/001-parent.trace.md';
  const childPath = '.topics/testing/001-1-handoff.trace.md';
  const olderTaskTarget = TASK_SCHEMA_TARGET.replace(/\/blob\/[^/]+\//, '/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/');
  assert.notEqual(olderTaskTarget, TASK_SCHEMA_TARGET);

  const parentCanonical = renderArtifactCreationDraftMarkdown(buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' }), {
    currentSchemaId: 'tiinex.task.v1',
    childPath: parentPath,
    bodyMarkdown: '# Parent Task\n\nExact historical Parent.',
    title: 'Parent Task',
    summary: 'Parent Task',
    createdAt: '2026-09-12 01:00:00'
  });
  const parentMarkdown = reseal(parentCanonical.replace(TASK_SCHEMA_TARGET, olderTaskTarget));
  const parentRecord = {
    id: parentPath,
    path: parentPath,
    schemaId: 'tiinex.task.v1',
    currentSchemaId: 'tiinex.task.v1',
    currentCreatedAt: '2026-09-12 01:00:00',
    createdAt: '2026-09-12 01:00:00',
    markdown: parentMarkdown,
    schemaReferenceAuthority: { schemaId: 'tiinex.task.v1', exactTargets: [olderTaskTarget], preferredTarget: olderTaskTarget, resolutionState: 'qualified' }
  };
  const childMarkdown = renderArtifactCreationDraftMarkdown(buildArtifactCreationContract({ schemaId: 'tiinex.handoff.v1', transitionType: 'continue-from-record' }), {
    currentSchemaId: 'tiinex.handoff.v1',
    parentRecord,
    childPath,
    bodyMarkdown: '# Handoff\n\nCandidate Handoff.',
    title: 'Handoff',
    summary: 'Handoff',
    createdAt: '2026-09-12 02:00:00'
  });
  const record = { path: childPath, markdown: childMarkdown, schemaId: 'tiinex.handoff.v1' };
  const withoutHistoricalParent = qualifyPortableManufactureSchemaReferenceCandidate(record);
  assert.equal(withoutHistoricalParent.findings.some((item) => item.code === 'schema.reference.target-unqualified' && item.params?.field === 'Parent Schema'), true);

  const authorities = projectPortableManufactureSchemaReferenceAuthorities(record, {
    workspaceEntries: [{ path: parentPath, data: new TextEncoder().encode(parentMarkdown) }]
  });
  assert.equal(authorities.parent?.schemaId, 'tiinex.task.v1');
  assert.equal(authorities.parent?.preferredTarget, olderTaskTarget);
  assert.equal(authorities.parent?.resolutionState, 'qualified');
  const qualified = qualifyPortableManufactureSchemaReferenceCandidate(record, { schemaReferenceAuthorities: authorities });
  assert.equal(qualified.findings.some((item) => item.code === 'schema.reference.target-unqualified' && item.params?.field === 'Parent Schema'), false);
  assert.equal(qualified.state, 'qualified');

  const currentHandoffTarget = currentSchemaTarget('tiinex.handoff.v1');
  const wrongCurrentTarget = currentHandoffTarget.replace(/\/blob\/[^/]+\//, '/blob/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/');
  const wrongCurrent = reseal(childMarkdown.replace(currentHandoffTarget, wrongCurrentTarget));
  const blocked = qualifyPortableManufactureSchemaReferenceCandidate({ ...record, markdown: wrongCurrent }, { schemaReferenceAuthorities: authorities });
  assert.equal(blocked.findings.some((item) => item.code === 'schema.reference.target-unqualified' && item.params?.field === 'Current Schema'), true);
  assert.equal(blocked.state, 'blocked');
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
  assert.equal(integrityDiagnostic?.locationBasis, 'continuity-integrity-primary-self-value');
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
