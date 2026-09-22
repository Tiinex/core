import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { prepareNodeBootstrapCarrierManufacturingInput } from '../src/tooling/portable/adapters/node/bootstrapCarrier.manufacture.js';
import { prepareNodeWorkspaceCarrierManufacturingInput } from '../src/tooling/portable/adapters/node/workspaceCarrier.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { orientColdConsumerFromHandoffPackage } from '../src/tooling/portable/handoff/coldConsumerEntrypoint.js';
import { projectPortableHandoffCarrierOutputFromPackage } from '../src/tooling/portable/handoff/recipientV2.humanOutput.js';
import { BOOTSTRAP_PACKAGE_ROLE, WORKSPACE_PACKAGE_ROLE } from '../src/tooling/portable/handoff/recipientV2.packageV1.contract.js';
import { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID } from '../src/tooling/portable/handoff/recipientV2.packageV1.constants.js';
import { recipientFacingV2PackageZipBuffer } from '../src/tooling/portable/output/recipientV2.zip.js';
import { auditHandoffPackageContextCarriage } from '../src/tooling/portable/handoff/contextAudit.js';
import { auditPortableRecoveryAcceptance } from '../src/tooling/portable/handoff/recoveryAcceptanceAudit.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.workspace.v1.schema.md';
const ROLE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';
const WORKSPACE_PATH = '.topics/.workspaces/tiinex-material-fixture.workspace.md';
const ROLE_PATH = '.topics/roles/loom-role.trace.md';

function seal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

function workspaceFixture() {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-09-12 15:00:00\n  - Authors: Fixture\n  - Why: Exercise generic bounded material carriage.\n  - Summary: Minimal Workspace fixture.\n  - Status: active/local\n\n---\n\n# Minimal Material Workspace\n\n## Schema Origins\n\n- [Tiinex docs schemas](https://github.com/Tiinex/docs/tree/master/.topics/.schemas)\n  - Kind: github-tree\n  - Repository: Tiinex/docs\n  - Ref: master\n  - Root Path: .topics/.schemas\n  - Trust Role: canonical-core\n\n## Workspace Entrypoints\n\n### Minimal Material Workspace\n\n- Source Kind: local-directory\n- Repository: Tiinex/material-fixture\n- Root Path: .\n- Repo Files Discovery: on\n\n## Workspace Boundary\n\nGeneric bounded material transport projection fixture.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

function roleFixture() {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${ROLE_SCHEMA_TARGET})\n  - Created At: 2026-09-12 15:00:00\n  - Authors: Fixture\n  - Why: Prove Role carriage does not create recipient authority.\n  - Summary: Loom Role fixture.\n  - Status: active/local\n\n---\n\n# Loom\n\n## Role Identity\n\n- Role Label: Loom\n- Role Kind: operational\n\n## Role Boundary\n\n- In Scope: fixture only\n- Out Of Scope: all transport authority\n\n## Authority And Responsibility Boundary\n\n- May Do: nothing by carriage alone\n- Does Not Authorize: recipient, holder, participation, delegation, or current work\n\n## Holder Relationship\n\n- Holder State: unbound\n\n## Interpretation Limits\n\n- Does Not Prove: recipient or holder authority\n- Must Not Be Treated As: a Handoff endpoint without an exact selected Handoff\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

const runtimeRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lineage = Object.freeze({ mode: 'new', dimension: '001', parentDimension: '', checkpointKind: 'progression', majorReason: '' });

test('bootstrap-only package qualifies with zero material bindings and projects generic Start without route or recipient authority', async () => {
  const prepared = await prepareNodeBootstrapCarrierManufacturingInput({ runtimeRoot, carrierLineage: lineage, verifyRoundtrip: true });
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal(result.inspection.packageContract.packageRole, BOOTSTRAP_PACKAGE_ROLE);
  assert.equal(result.inspection.packageContract.workspaces.length, 0);
  assert.equal(result.inspection.packageContract.materialRepresentations.length, 0);
  assert.equal(result.inspection.routes.length, 0);
  assert.equal(result.inspection.workspaces.length, 0);
  assert.equal(result.bundle.files.some((file) => /\.json$/i.test(String(file.path || ''))), false);

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready');
  assert.equal(orientation.routes.length, 0);
  assert.equal(orientation.workspaces.length, 0);
  assert.equal(orientation.entrypoint.projection.authority.recipientAuthority, 'none');
  assert.equal(orientation.entrypoint.projection.authority.holderAuthority, 'none');
  assert.equal(orientation.entrypoint.projection.authority.workAuthority, 'none');

  const output = projectPortableHandoffCarrierOutputFromPackage({ bundle: result.bundle });
  assert.equal(output.status, 'ready');
  assert.match(output.humanOutput.normalInlineRouting.content, /^Tiinex package attached\./);
  assert.match(output.humanOutput.normalInlineRouting.content, /Start:\n001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.equal(output.humanOutput.normalInlineRouting.content.includes('Continue from'), false);
  assert.equal(output.humanOutput.presentation.recipientLabel, '');
  assert.equal(output.humanOutput.presentation.recipientProjectionAuthority, 'none');
});

test('pointerless bounded Workspace package uses generic material representation and carried Role creates no recipient authority', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-minimal-material-carrier-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [relative, content] of [[WORKSPACE_PATH, workspaceFixture()], [ROLE_PATH, roleFixture()]]) {
    const target = path.join(root, ...relative.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }

  const prepared = await prepareNodeWorkspaceCarrierManufacturingInput({
    workspaceRoot: root,
    workspaceId: 'material',
    workspaceTargetPath: WORKSPACE_PATH,
    workspaceScopes: [{ workspaceId: 'material', coverage: 'bounded', include: [ROLE_PATH] }],
    runtimeRoot,
    carrierLineage: lineage,
    verifyRoundtrip: true
  });
  assert.equal(prepared.workspaceMaterializations[0].state, 'bounded');
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal(result.inspection.packageContract.packageRole, WORKSPACE_PACKAGE_ROLE);
  assert.equal(result.inspection.packageContract.workspaces.length, 0);
  assert.equal(result.inspection.packageContract.materialRepresentations.length, 1);
  assert.equal(result.inspection.workspaces.length, 1);
  assert.equal(result.inspection.workspaces[0].coverage, 'bounded');
  assert.equal(result.inspection.routes.length, 0);
  assert.equal(result.inspection.format, RECIPIENT_V2_PACKAGE_V1_FORMAT_ID);
  assert.equal(result.bundle.transportFormat, RECIPIENT_V2_PACKAGE_V1_FORMAT_ID);
  assert.ok(recipientFacingV2PackageZipBuffer(result.bundle, { inspection: result.inspection }).byteLength > 0);
  const contextAudit = auditHandoffPackageContextCarriage({ bundle: result.bundle });
  assert.equal(contextAudit.workspaceMaterializations[0].coverage, 'bounded');
  assert.equal(contextAudit.workspaceMaterializations[0].reason, 'bounded-workspace-archive-representation');

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready');
  assert.equal(orientation.routes.length, 0);
  assert.equal(orientation.workspaces.length, 1);
  assert.equal(orientation.entrypoint.projection.authority.recipientAuthority, 'none');
  assert.equal(orientation.entrypoint.projection.authority.holderAuthority, 'none');
  assert.equal(orientation.entrypoint.projection.authority.workAuthority, 'none');

  const output = projectPortableHandoffCarrierOutputFromPackage({ bundle: result.bundle });
  assert.equal(output.status, 'ready');
  assert.match(output.humanOutput.normalInlineRouting.content, /Start:\n001-1-READ-BEFORE-PROCEEDING\.trace\.md/);
  assert.equal(output.humanOutput.normalInlineRouting.content.includes('Continue from'), false);
  assert.equal(output.humanOutput.presentation.recipientLabel, '');
  assert.equal(output.humanOutput.presentation.recipientProjectionAuthority, 'none');
});

test('pointerless Workspace package may mix direct complete and generic complete material bindings without creating a route', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-complete-material-carrier-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspaceTarget = path.join(root, ...WORKSPACE_PATH.split('/'));
  await mkdir(path.dirname(workspaceTarget), { recursive: true });
  await writeFile(workspaceTarget, workspaceFixture());

  const prepared = await prepareNodeWorkspaceCarrierManufacturingInput({
    workspaceRoot: root,
    workspaceId: 'direct',
    workspaceTargetPath: WORKSPACE_PATH,
    additionalWorkspaces: [{ id: 'generic', root, workspaceTargetPath: WORKSPACE_PATH }],
    materialRepresentationWorkspaceIds: ['generic'],
    runtimeRoot,
    carrierLineage: lineage,
    verifyRoundtrip: true
  });
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.inspection.packageContract.packageRole, WORKSPACE_PACKAGE_ROLE);
  assert.equal(result.inspection.packageContract.workspaces.length, 1);
  assert.equal(result.inspection.packageContract.materialRepresentations.length, 1);
  assert.deepEqual(result.inspection.workspaces.map((workspace) => workspace.coverage).sort(), ['complete', 'complete']);
  assert.equal(result.inspection.routes.length, 0);
  const output = projectPortableHandoffCarrierOutputFromPackage({ bundle: result.bundle });
  assert.equal(output.status, 'ready');
  assert.equal(output.humanOutput.normalInlineRouting.content.includes('Continue from'), false);
  assert.equal(output.humanOutput.presentation.recipientLabel, '');

  const acceptance = auditPortableRecoveryAcceptance({ basis: { files: result.bundle.files }, candidate: { files: result.bundle.files }, workspaceIds: ['direct'] });
  assert.equal(acceptance.status, 'ready');
  assert.equal(acceptance.basisCarrierRole, WORKSPACE_PACKAGE_ROLE);
  assert.equal(acceptance.candidateCarrierRole, WORKSPACE_PACKAGE_ROLE);
  assert.equal(acceptance.suitability.state, 'restart-source-ready');
});
