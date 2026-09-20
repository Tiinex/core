import test from 'node:test';
import assert from 'node:assert/strict';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import {
  projectManufacturingRequirements,
  resolveWorkspaceRequirementMaterials
} from '../src/tooling/portable/adapters/node/handoff.manufacture.requirements.js';

const routePath = '.topics/handoffs/test.trace.md';
const anchorPath = '.topics/roles/anchor.trace.md';
const sigmaPath = '.topics/roles/sigma.trace.md';

function enumeration(entries = []) {
  const enc = new TextEncoder();
  return {
    evidence: { entriesFingerprint: 'fixture-fingerprint' },
    materialization: {
      entries: entries.map(([path, text]) => {
        const data = enc.encode(text);
        return { path, data, bytes: data.byteLength, sha256: 'a'.repeat(64), mediaType: 'text/markdown' };
      })
    }
  };
}

test('explicit route endpoint Role bindings close exact material when Handoff creation omitted optional endpoint References', async () => {
  const markdown = qualifiedHandoffFixture({ from: 'Sigma', to: 'Anchor' });
  const workspaceRuntimeById = new Map([
    ['core', { id: 'core', root: '', enumeration: enumeration([[routePath, markdown]]) }],
    ['business', { id: 'business', root: '', enumeration: enumeration([
      [sigmaPath, roleFixture('Sigma')],
      [anchorPath, roleFixture('Anchor')]
    ]) }]
  ]);
  const requirements = await projectManufacturingRequirements({
    handoff: { id: routePath, path: routePath, semanticStatus: 'unknown', markdown },
    workspaceId: 'core',
    handoffPath: routePath,
    routeSpecs: [{
      workspaceId: 'core', path: routePath,
      endpointRoles: [
        { party: 'from', label: 'Sigma', workspaceId: 'business', path: sigmaPath, reference: `business::${sigmaPath}` },
        { party: 'to', label: 'Anchor', workspaceId: 'business', path: anchorPath, reference: `business::${anchorPath}` }
      ]
    }],
    workspaceRuntimeById
  });

  assert.equal(requirements.findings.some((item) => item.severity === 'error'), false, JSON.stringify(requirements.findings, null, 2));
  assert.equal(requirements.endpointRoles.length, 2);
  const from = requirements.endpointRoles.find((item) => item.party === 'from');
  const to = requirements.endpointRoles.find((item) => item.party === 'to');
  assert.equal(from.targetWorkspaceId, 'business');
  assert.equal(from.targetPath, sigmaPath);
  assert.equal(to.targetWorkspaceId, 'business');
  assert.equal(to.targetPath, anchorPath);

  const materials = await resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, {});
  assert.equal(materials.filter((item) => item.requirementId.startsWith('endpoint-role:')).length, 2);
  assert.equal(materials.some((item) => item.provenance?.workspaceId === 'business' && item.provenance?.path === sigmaPath), true);
  assert.equal(materials.some((item) => item.provenance?.workspaceId === 'business' && item.provenance?.path === anchorPath), true);
});

test('explicit endpoint Role binding fails closed when its label contradicts the Handoff endpoint', async () => {
  const markdown = qualifiedHandoffFixture({ from: 'Sigma', to: 'Anchor' });
  const workspaceRuntimeById = new Map([
    ['core', { id: 'core', root: '', enumeration: enumeration([[routePath, markdown]]) }]
  ]);
  const requirements = await projectManufacturingRequirements({
    handoff: { id: routePath, path: routePath, semanticStatus: 'unknown', markdown },
    workspaceId: 'core', handoffPath: routePath,
    routeSpecs: [{ workspaceId: 'core', path: routePath, endpointRoles: [{ party: 'from', label: 'Loom', workspaceId: 'business', path: sigmaPath }] }],
    workspaceRuntimeById
  });
  assert.equal(requirements.findings.some((item) => item.code === 'portable.handoff-manufacture.endpoint-role.explicit-label-mismatch'), true, JSON.stringify(requirements.findings, null, 2));
});



test('explicit endpoint Role binding fails closed when exact carried material has a different Role label', async () => {
  const markdown = qualifiedHandoffFixture({ from: 'Sigma', to: 'Anchor' });
  const workspaceRuntimeById = new Map([
    ['core', { id: 'core', root: '', enumeration: enumeration([[routePath, markdown]]) }],
    ['business', { id: 'business', root: '', enumeration: enumeration([[sigmaPath, roleFixture('Loom')]]) }]
  ]);
  const requirements = await projectManufacturingRequirements({
    handoff: { id: routePath, path: routePath, semanticStatus: 'unknown', markdown },
    workspaceId: 'core', handoffPath: routePath,
    routeSpecs: [{ workspaceId: 'core', path: routePath, endpointRoles: [{ party: 'from', label: 'Sigma', workspaceId: 'business', path: sigmaPath, reference: `business::${sigmaPath}` }] }],
    workspaceRuntimeById
  });
  assert.equal(requirements.findings.some((item) => item.code === 'portable.handoff-manufacture.endpoint-role.explicit-material-label-mismatch'), true, JSON.stringify(requirements.findings, null, 2));
});

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../src/tooling/portable/adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from '../src/tooling/portable/handoff/manufacture.js';
import { orientColdConsumerFromHandoffPackage } from '../src/tooling/portable/handoff/coldConsumerEntrypoint.js';
import { projectPortableGroundingReadiness } from '../src/tooling/portable/grounding/grounding.readiness.js';

const rootSchemaTarget = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const workspaceSchemaTarget = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.workspace.v1.schema.md';
const roleSchemaTarget = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';

function seal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
function workspaceFixture(label, repository) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchemaTarget})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${workspaceSchemaTarget})\n  - Created At: 2026-09-20 20:00:00\n  - Authors: Fixture\n  - Summary: ${label} workspace.\n  - Status: active/local\n\n---\n\n# ${label}\n\n## Workspace Entrypoints\n\n### Repository source\n\n- Source Kind: local-directory\n- Repository: ${repository}\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}
function roleFixture(label) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchemaTarget})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${roleSchemaTarget})\n  - Created At: 2026-09-20 20:00:00\n  - Authors: Fixture\n  - Summary: ${label} role.\n  - Status: ready/local\n\n---\n\n# ${label} Role\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: fixture\n\n## Role Boundary\n\n- In Scope: fixture work\n- Out Of Scope: everything else\n\n## Authority And Responsibility Boundary\n\n- May Do: fixture work\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: explicit-session, handoff\n\n## Interpretation Limits\n\n- Does Not Prove: durable holder identity\n- Must Not Be Treated As: broader authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}
async function put(root, relative, text) {
  const target = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text);
}

test('recipient-v2 manufacture succeeds with exact explicit endpoint Role material when the Handoff omits optional endpoint References', async (t) => {
  const scratch = await mkdtemp(path.join(tmpdir(), 'tiinex-endpoint-route-binding-'));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const extensionRoot = path.join(scratch, 'extension-vscode');
  const businessRoot = path.join(scratch, 'business');
  const extensionWorkspacePath = '.topics/.workspaces/tiinex-extension-vscode.workspace.md';
  const businessWorkspacePath = '.topics/.workspaces/tiinex-business.workspace.md';
  await mkdir(extensionRoot, { recursive: true });
  await mkdir(businessRoot, { recursive: true });
  await put(extensionRoot, extensionWorkspacePath, workspaceFixture('Extension VS Code', 'Tiinex/extension-vscode'));
  await put(extensionRoot, routePath, qualifiedHandoffFixture({ from: 'Sigma', to: 'Anchor' }));
  await put(businessRoot, businessWorkspacePath, workspaceFixture('Business', 'Tiinex/business'));
  await put(businessRoot, sigmaPath, roleFixture('Sigma'));
  await put(businessRoot, anchorPath, roleFixture('Anchor'));

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: extensionRoot,
    workspaceId: 'extension-vscode',
    workspaceTargetPath: extensionWorkspacePath,
    handoffPath: routePath,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: businessWorkspacePath }],
    transportRoutes: [{
      workspaceId: 'extension-vscode', path: routePath,
      endpointRoles: [
        { party: 'from', label: 'Sigma', workspaceId: 'business', path: sigmaPath, reference: `business::${sigmaPath}` },
        { party: 'to', label: 'Anchor', workspaceId: 'business', path: anchorPath, reference: `business::${anchorPath}` }
      ]
    }],
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
    verifyRoundtrip: true
  });

  assert.equal((prepared.requirements.findings || []).some((item) => item.severity === 'error'), false, JSON.stringify(prepared.requirements.findings || [], null, 2));
  assert.equal(prepared.requirements.endpointRoles.length, 2);
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal((result.inspection.endpointRoles || []).length, 2);
});


test('two Handoff routes with exact endpoint Role bindings manufacture and each cold-ground independently without endpoint References', async (t) => {
  const scratch = await mkdtemp(path.join(tmpdir(), 'tiinex-two-route-endpoint-binding-'));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const extensionRoot = path.join(scratch, 'extension-vscode');
  const businessRoot = path.join(scratch, 'business');
  const extensionWorkspacePath = '.topics/.workspaces/tiinex-extension-vscode.workspace.md';
  const businessWorkspacePath = '.topics/.workspaces/tiinex-business.workspace.md';
  const routeOnePath = '.topics/handoffs/test-one.trace.md';
  const routeTwoPath = '.topics/handoffs/test-two.trace.md';
  await mkdir(extensionRoot, { recursive: true });
  await mkdir(businessRoot, { recursive: true });
  await put(extensionRoot, extensionWorkspacePath, workspaceFixture('Extension VS Code', 'Tiinex/extension-vscode'));
  await put(extensionRoot, routeOnePath, qualifiedHandoffFixture({ from: 'Sigma', to: 'Anchor', title: 'Test route one' }));
  await put(extensionRoot, routeTwoPath, qualifiedHandoffFixture({ from: 'Sigma', to: 'Anchor', title: 'Test route two', createdAt: '2026-09-20 20:01:00' }));
  await put(businessRoot, businessWorkspacePath, workspaceFixture('Business', 'Tiinex/business'));
  await put(businessRoot, sigmaPath, roleFixture('Sigma'));
  await put(businessRoot, anchorPath, roleFixture('Anchor'));

  const endpointRoles = [
    { party: 'from', label: 'Sigma', workspaceId: 'business', path: sigmaPath, reference: `business::${sigmaPath}` },
    { party: 'to', label: 'Anchor', workspaceId: 'business', path: anchorPath, reference: `business::${anchorPath}` }
  ];
  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: extensionRoot,
    workspaceId: 'extension-vscode',
    workspaceTargetPath: extensionWorkspacePath,
    handoffPath: routeOnePath,
    additionalWorkspaces: [{ id: 'business', root: businessRoot, workspaceTargetPath: businessWorkspacePath }],
    transportRoutes: [
      { workspaceId: 'extension-vscode', path: routeOnePath, endpointRoles },
      { workspaceId: 'extension-vscode', path: routeTwoPath, endpointRoles }
    ],
    runtimeRoot: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
    verifyRoundtrip: true
  });

  assert.equal((prepared.requirements.findings || []).some((item) => item.severity === 'error'), false, JSON.stringify(prepared.requirements.findings || [], null, 2));
  assert.equal(prepared.requirements.endpointRoles.length, 4);
  const result = manufactureRecipientRelativeHandoffPackage(prepared, { verifyRoundtrip: true });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings, null, 2));
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal((result.inspection.routes || []).length, 2);
  assert.equal((result.inspection.endpointRoles || []).length, 4);

  const orientation = orientColdConsumerFromHandoffPackage({ bundle: result.bundle });
  assert.equal(orientation.status, 'ready', JSON.stringify(orientation.findings || [], null, 2));
  assert.equal(orientation.routes.length, 2);
  for (const route of orientation.routes) {
    const grounded = projectPortableGroundingReadiness({ bundle: result.bundle, route: route.id, interactionMode: 'execution' });
    assert.notEqual(grounded.readiness.state, 'blocked', JSON.stringify(grounded.readiness, null, 2));
    assert.equal(grounded.authority.holderBinding?.state, 'qualified', JSON.stringify(grounded.authority.holderBinding || {}, null, 2));
  }
});
