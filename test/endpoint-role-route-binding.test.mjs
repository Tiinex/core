import test from 'node:test';
import assert from 'node:assert/strict';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { projectQualifiedHandoffEndpoints } from '../src/tooling/portable/handoff/handoffEndpointProjection.js';
import { projectHandoffMaterialRequirements } from '../src/tooling/portable/handoff/materialClosure.requirements.js';
import { planRecipientRelativeHandoffMaterialClosure } from '../src/tooling/portable/handoff/materialClosure.plan.js';
import {
  projectManufacturingRequirements,
  resolveWorkspaceRequirementMaterials
} from '../src/tooling/portable/adapters/node/handoff.manufacture.requirements.js';

const routePath = '.topics/handoffs/test.trace.md';
const anchorPath = '.topics/roles/anchor.trace.md';
const sigmaPath = '.topics/roles/sigma.trace.md';

function projectHandoffMaterialRequirementsForRegression(markdown) {
  return projectHandoffMaterialRequirements({ path: routePath, markdown });
}
function planEndpointMaterialClosureForRegression(markdown, requirements) {
  return planRecipientRelativeHandoffMaterialClosure({ handoff: { path: routePath, markdown }, requirements });
}

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
function roleFixture(label, title = `${label} Role`) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${rootSchemaTarget})\n- Current\n  - Current Schema: [tiinex.party.role.v1](${roleSchemaTarget})\n  - Created At: 2026-09-20 20:00:00\n  - Authors: Fixture\n  - Summary: ${label} role.\n  - Status: ready/local\n\n---\n\n# ${title}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: fixture\n\n## Role Boundary\n\n- In Scope: fixture work\n- Out Of Scope: everything else\n\n## Authority And Responsibility Boundary\n\n- May Do: fixture work\n- Does Not Authorize: external mutation\n\n## Holder Relationship\n\n- Holder State: assignable per explicit session or Handoff\n- Assignment Modes: explicit-session, handoff\n\n## Interpretation Limits\n\n- Does Not Prove: durable holder identity\n- Must Not Be Treated As: broader authority\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}
async function put(root, relative, text) {
  const target = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text);
}

test('projects exact Role authoringLabel separately from presentation label for the eight carried-role shapes', async () => {
  const roleSpecs = [
    ['Anchor', '.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md'],
    ['Axiom', '.topics/roles/001-2-1-axiom-canonical-holder-cutover-role.trace.md'],
    ['Loom', '.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md'],
    ['Sigma', '.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md'],
    ['Glimmer', '.topics/roles/001-5-1-glimmer-canonical-holder-cutover-role.trace.md'],
    ['Kodax', '.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md'],
    ['Pilot', '.topics/roles/001-7-1-pilot-canonical-holder-cutover-role.trace.md'],
    ['Prism', '.topics/roles/001-8-1-1-prism-canonical-holder-cutover-role.trace.md']
  ];
  const roleEntries = roleSpecs.map(([label, rolePath]) => [rolePath, roleFixture(label, `${label} Role — Canonical Holder Cutover Continuation`)]);
  const files = [
    { path: '.topics/.workspaces/tiinex-business.workspace.md', content: workspaceFixture('Business', 'Tiinex/business') },
    ...roleEntries.map(([rolePath, content]) => ({ path: rolePath, content }))
  ];

  const projection = projectQualifiedHandoffEndpoints({ files, workspaceId: 'business' });
  assert.equal(projection.status, 'ready', JSON.stringify(projection.findings || [], null, 2));
  assert.equal(projection.candidates.length, 8);
  const byAuthoringLabel = new Map(projection.candidates.map((candidate) => [candidate.authoringLabel, candidate]));
  for (const [expectedLabel, expectedPath] of roleSpecs) {
    const candidate = byAuthoringLabel.get(expectedLabel);
    assert.ok(candidate, `missing projected candidate for ${expectedLabel}`);
    assert.equal(candidate.kind, 'role');
    assert.equal(candidate.authoringLabel, expectedLabel);
    assert.equal(candidate.artifactPath, expectedPath);
    assert.notEqual(candidate.label, candidate.authoringLabel);
    assert.equal(candidate.label, `${expectedLabel} Role — Canonical Holder Cutover Continuation`);
    assert.equal(candidate.workspaceCoordinate, `business::${expectedPath}`);
    assert.equal(candidate.reference, '');
    assert.equal(candidate.referenceQualification, 'none');
    assert.equal(candidate.canonicalReference, '');
  }

});

test('endpoint source eligibility is bounded by the explicitly selected qualified Workspace material root', () => {
  const nestedWorkspacePath = 'test/extension-host/fixtures/source-workspace/.topics/.workspaces/tiinex-source-workspace.workspace.md';
  const files = [
    { path: '.topics/.workspaces/tiinex-extension-vscode.workspace.md', content: workspaceFixture('Extension VS Code', 'Tiinex/extension-vscode') },
    { path: nestedWorkspacePath, content: workspaceFixture('Source Workspace Fixture', 'Tiinex/source-workspace') },
    { path: 'test/extension-host/fixtures/source-workspace/.topics/roles/fixture.trace.md', content: roleFixture('Sigma') },
    { path: 'schemas/examples/bounded-role-example.md', content: roleFixture('Anchor') }
  ];

  const production = projectQualifiedHandoffEndpoints({ files, workspaceId: 'extension-vscode' });
  assert.equal(production.status, 'ready', JSON.stringify(production.findings || [], null, 2));
  assert.equal(production.sourceAuthority.workspaceTargetPath, '.topics/.workspaces/tiinex-extension-vscode.workspace.md');
  assert.equal(production.sourceAuthority.materialRoot, '.topics');
  assert.equal((production.candidates || []).some((item) => item.artifactPath.startsWith('test/')), false);
  assert.equal((production.candidates || []).some((item) => item.artifactPath.startsWith('schemas/')), false);

  const explicitlySelectedFixture = projectQualifiedHandoffEndpoints({ files, workspaceId: 'source-workspace' });
  assert.equal(explicitlySelectedFixture.status, 'ready', JSON.stringify(explicitlySelectedFixture.findings || [], null, 2));
  assert.equal(explicitlySelectedFixture.sourceAuthority.workspaceTargetPath, nestedWorkspacePath);
  assert.equal(explicitlySelectedFixture.sourceAuthority.materialRoot, 'test/extension-host/fixtures/source-workspace/.topics');

  const unqualified = projectQualifiedHandoffEndpoints({ files, workspaceId: 'missing-workspace' });
  assert.equal(unqualified.status, 'blocked');
  assert.equal(unqualified.candidates.length, 0);
  assert.equal(unqualified.findings.some((item) => item.code === 'portable.handoff-endpoint.source-authority.unresolved'), true);
});

test('an explicit endpoint Reference remains required transport closure and fails closed when exact material is absent', () => {
  const markdown = qualifiedHandoffFixture({
    from: 'Sigma', to: 'Anchor',
    fromReference: 'business::.topics/roles/sigma.trace.md',
    toReference: 'business::.topics/roles/anchor.trace.md'
  });
  const requirements = projectHandoffMaterialRequirementsForRegression(markdown);
  assert.deepEqual(requirements.endpointRoles.map((item) => item.closureStrength), ['required', 'required']);
  const plan = planEndpointMaterialClosureForRegression(markdown, requirements);
  assert.equal(plan.status, 'blocked');
  assert.equal(plan.requirements.endpointRoles.every((item) => item.disposition === 'unresolved'), true);
  assert.equal(plan.findings.some((item) => item.severity === 'error' && item.code === 'portable.handoff-material.endpoint-role.unresolved'), true);
});
