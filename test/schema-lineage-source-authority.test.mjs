import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { schemaRegistry } from '../src/schemas/registry.js';
import { qualifyCompiledSchemaLineageSourceAuthority } from '../src/schemas/schema.lineageAuthority.js';
import { portableRuntimeValidationAuthorityForRecord, portableRuntimeValidationContractForSchema } from '../src/tooling/portable/schema/qualifiedLocalRoot.runtime.js';

const EXPECTED_MISMATCHED_REGISTERED_SCHEMAS = Object.freeze([
  'tiinex.discovery.finding.v1',
  'tiinex.evidence.v1',
  'tiinex.feedback.v1',
  'tiinex.party.organization.v1',
  'tiinex.workspace.representation.v1'
]);

function moduleFor(schemaId) {
  return (schemaRegistry.modules || []).find((module) => module.id === schemaId);
}

function exactChain({ parentCommit = '1'.repeat(40), childCandidateCommit = parentCommit } = {}) {
  return {
    lineage: ['tiinex.root.v1', 'tiinex.parent.v1', 'tiinex.child.v1'],
    lineageQualification: { state: 'valid', complete: true },
    lineageAuthority: [
      {
        schemaId: 'tiinex.root.v1',
        source: {
          repository: 'Tiinex/docs', commit: 'a'.repeat(40), path: '.topics/.schemas/tiinex.root.v1.schema.md',
          publicationState: 'accepted-local-unpublished', snapshotCompleteness: 'exact-axiom-canonical-unpublished-bounded-workspace-contract'
        },
        parentSchemaId: '', parentSourceCandidates: []
      },
      {
        schemaId: 'tiinex.parent.v1',
        source: { repository: 'Tiinex/docs', commit: parentCommit, path: '.topics/.schemas/parent/tiinex.parent.v1.schema.md' },
        parentSchemaId: 'tiinex.root.v1',
        parentSourceCandidates: [{ repository: 'Tiinex/docs', commit: '0'.repeat(40), path: '.topics/.schemas/tiinex.root.v1.schema.md' }]
      },
      {
        schemaId: 'tiinex.child.v1',
        source: { repository: 'Tiinex/docs', commit: '2'.repeat(40), path: '.topics/.schemas/child/tiinex.child.v1.schema.md' },
        parentSchemaId: 'tiinex.parent.v1',
        parentSourceCandidates: [{ repository: 'Tiinex/docs', commit: childCandidateCommit, path: '.topics/.schemas/parent/tiinex.parent.v1.schema.md' }]
      }
    ]
  };
}

test('registered runtime projections preserve unrelated source-substitution mismatches as qualification contradictions', () => {
  const mismatched = (schemaRegistry.modules || [])
    .flatMap((module) => {
      const qualification = module.schemaSource?.qualify?.();
      return qualification?.validationLineageAuthority?.state === 'contradictory' ? [module.id] : [];
    })
    .sort();
  assert.deepEqual(mismatched, [...EXPECTED_MISMATCHED_REGISTERED_SCHEMAS].sort());
});

test('current Party Role runtime qualifies the exact carried same-snapshot Parent instead of preferring its older browse+git recovery locator', () => {
  const module = moduleFor('tiinex.party.role.v1');
  assert.ok(module);
  const source = module.schemaSource.qualify();
  assert.equal(source.state, 'qualified');
  assert.equal(source.validationLineageAuthority.state, 'qualified', JSON.stringify(source.validationLineageAuthority, null, 2));
  assert.equal(source.validationLineageAuthority.edges.at(-1).state, 'qualified-local-relative-parent-supersession');
  assert.equal(source.validationLineageAuthority.edges.at(-1).reason, 'qualified-local-same-snapshot-relative-parent-authority');

  const runtime = portableRuntimeValidationContractForSchema('tiinex.party.role.v1');
  assert.equal(runtime.state, 'qualified', JSON.stringify(runtime, null, 2));
});

test('actual current canonical Loom Role artifact qualifies against the same-snapshot Role runtime authority', async () => {
  const fixtureUrl = new URL('./fixtures/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md', import.meta.url);
  const markdown = await readFile(fixtureUrl, 'utf8');
  const authority = portableRuntimeValidationAuthorityForRecord({
    path: '.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md',
    markdown,
    schemaId: 'tiinex.party.role.v1',
    currentSchemaId: 'tiinex.party.role.v1'
  });
  assert.equal(authority.state, 'qualified', JSON.stringify(authority, null, 2));
  assert.equal(authority.schemaId, 'tiinex.party.role.v1');
  assert.equal(authority.currentReference.state, 'qualified');
  assert.equal(authority.lineage.at(-1).schemaId, 'tiinex.party.role.v1');
});

test('organization and Evidence exact runtime validation authority fail closed at schema-lineage source qualification', () => {
  for (const schemaId of ['tiinex.party.organization.v1', 'tiinex.evidence.v1']) {
    const module = moduleFor(schemaId);
    assert.ok(module, `registered module required for ${schemaId}`);
    const source = module.schemaSource.qualify();
    assert.equal(source.state, 'qualified', 'leaf bundled source remains structurally qualified');
    assert.equal(source.validationLineageAuthority.state, 'contradictory');
    assert.ok(source.validationLineageAuthority.findings.some((finding) => finding.includes('Compiled lineage substitutes source authority')));

    const runtime = portableRuntimeValidationContractForSchema(schemaId);
    assert.equal(runtime.state, 'unavailable');
    assert.equal(runtime.reason, 'compiled-validation-lineage-source-authority-unqualified');
    assert.ok(runtime.findings.some((finding) => finding.includes('Compiled lineage substitutes source authority')));
  }
});

test('source-coherent compiled inheritance qualifies when the exact declared Parent source is supplied', () => {
  const qualification = qualifyCompiledSchemaLineageSourceAuthority(exactChain());
  assert.equal(qualification.state, 'qualified');
  assert.equal(qualification.complete, true);
  assert.equal(qualification.findings.length, 0);
  assert.equal(qualification.edges.at(-1).state, 'qualified');
});

test('source substitution remains rejected even when schema identity and path are unchanged', () => {
  const qualification = qualifyCompiledSchemaLineageSourceAuthority(exactChain({
    parentCommit: '1'.repeat(40),
    childCandidateCommit: '3'.repeat(40)
  }));
  assert.equal(qualification.state, 'contradictory');
  assert.equal(qualification.complete, false);
  assert.equal(qualification.edges.at(-1).reason, 'compiled-parent-source-substitution');
  assert.match(qualification.findings.at(-1), /declared Tiinex\/docs@3333.+ but compiled Tiinex\/docs@1111/);
});
