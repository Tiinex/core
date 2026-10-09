import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { currentSchemaMarkdown } from './helpers/current-schema-targets.mjs';
import { projectPortableTransitionCatalog, projectPortableTransitionNeighborhood } from '../src/tooling/portable/transitions/transition.catalog.js';
import { compileSemanticPackageGraph } from '../src/tooling/portable/package/semantic.package.graph.js';
import { indexPortableMaterials } from '../src/tooling/portable/package/material.graph.js';
import { compilePortableSchemaContractChain } from '../src/tooling/portable/schema/contract.compile.js';
import { schemaMarkdown } from '../src/schemas/registry.js';
import { runPortableOperation } from '../src/tooling/portable/operation.catalog.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';

const here = dirname(fileURLToPath(import.meta.url));
const createTask = await readFile(resolve(here, 'fixtures/transitions/create-task-transition-definition.trace.md'), 'utf8');
const topicToTask = await readFile(resolve(here, 'fixtures/transitions/topic-to-task-transition-definition.trace.md'), 'utf8');

function material(path, content, root = '/repo-a') {
  return {
    path,
    content,
    sourceMode: 'portable-node-local',
    locator: { kind: 'node-file', localPath: `${root}/${path}` }
  };
}

function packageFixture(root = '/repo-a', { attach = true } = {}) {
  const integrity = `\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: test-integrity\n`;
  const manifest = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.semantic.package.v1\n  - Created At: 2026-09-30 00:00:00\n  - Summary: Test Task semantic package.\n\n---\n\n# Task Semantic Package\n\n## Package Identity\n\n- Package Name: Task\n- Purpose: Test Task package.\n\n## Package Boundary\n\n- Boundary Root: manifest-directory\n- Discovery Policy: recursive-within-boundary\n- Nested Package Policy: explicit-only\n\n## Included Packages\n\n- none\n\n## External Package Dependencies\n\n- none\n\n## Schema Resolution Bindings\n\n- tiinex.task.v1\n  - Schema Reference: [tiinex.task.v1](tiinex.task.v1.schema.md)\n\n## Interpretation Limits\n\n- Does Not Mean: applicability\n- Must Not Be Used To Claim: execution\n${integrity}`;
  const companion = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.schema.transition.companion.v1\n  - Created At: 2026-09-30 00:00:00\n  - Summary: Test Task Transition companion.\n\n---\n\n# Task Transition Companion\n\n## Schema Binding\n\n- Schema Reference: [tiinex.task.v1](tiinex.task.v1.schema.md)\n\n## Transition Attachments\n\n${attach ? '- topic-to-task\n  - Transition Reference: [Topic to Task](.transitions/topic-to-task-transition-definition.trace.md)' : '- none'}\n\n## Interpretation Limits\n\n- Does Not Mean: applicability\n- Must Not Be Used To Claim: execution\n${integrity}`;
  return [
    material('pkg/task-semantic-package.trace.md', manifest, root),
    material('pkg/tiinex.task.v1.schema.md', currentSchemaMarkdown('tiinex.task.v1'), root),
    material('pkg/tiinex.task.v1-transitions.trace.md', companion, root),
    material('pkg/.transitions/create-task-transition-definition.trace.md', createTask, root),
    material('pkg/.transitions/topic-to-task-transition-definition.trace.md', topicToTask, root)
  ];
}


function explicitGenerationFixture() {
  const files = packageFixture();
  const transitionIndex = files.findIndex((item) => item.path.endsWith('topic-to-task-transition-definition.trace.md'));
  files[transitionIndex] = material(
    files[transitionIndex].path,
    files[transitionIndex].content.replace('- Generation Binding: target-schema', '- Generation Binding: [Task authoring generation](../.generation/task-authoring-generation.trace.md)')
  );
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.schema.generation.v1
  - Created At: 2026-09-30 00:00:00
  - Summary: Test explicit generation authority.

---

# Task Authoring Generation Authority

## Contract Identity Model

- Durable Identity Policy: exact fixture representation
- Provisional Handle Policy: fixture-local only

## Contract Identity

- Contract Name: Task authoring generation fixture
- Contract Kind: generation-contract
- Contract State: test

## Contract Target

- Target Schema: tiinex.task.v1
- Target Scope: test Task draft

## Contract Nodes

- task-generation
  - Contract Node Type: generation
  - Contract Node Label: Task generation fixture
  - Applies To: tiinex.task.v1
  - Required: true

## Contract Boundary

- Deterministic Boundary: declared default input only
- Human Boundary: explicit author selection and review
- Runtime Boundary: read-only projection in this fixture
- Out Of Scope: execution and recommendation

## Generation Identity

- Generation Handle: task-authoring-generation-fixture
- Generation Name: Task authoring generation fixture
- Generation Kind: form-flow

## Generation Target

- Target Schema: tiinex.task.v1
- Target Output: Task artifact draft

## Required Inputs

- Objective
  - Input Source Policy: defaulted-input
  - Defaultable Input: "Review the bounded objective before saving."
  - Unknown Handling: ask-user

- Scope
  - Input Source Policy: defaulted-input
  - Defaultable Input: {"Included":"bounded fixture","Excluded":"execution"}
  - Unknown Handling: ask-user

## Generation Steps

- apply-defaults
  - Step Action: fill-value
  - Step Order: 10
  - Review Needed: yes

## Output Boundary

- Output Kind: filled-draft
- Review State: unreviewed draft
- Mutation Policy: local-draft-only
- Save Policy: caller-owned

## Interpretation Limits

- Does Not Mean: recommendation or execution
- Must Not Be Used To Claim: applicability

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: test-integrity
`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  files.push(material('pkg/.generation/task-authoring-generation.trace.md', sealed.markdown));
  return files;
}

test('workspace Transition Definition catalog discovers explicit supplied representations outside .transitions without granting attachment', () => {
  const result = projectPortableTransitionCatalog({
    files: [material('.topics/processes/custom-create-task.trace.md', createTask)],
    outputSchemaId: 'tiinex.task.v1'
  });
  assert.deepEqual(result.counts, { discovered: 1, readQualified: 1, projectedCandidates: 1 });
  const [definition] = result.candidates;
  assert.equal(definition.canonicalIdentifier, 'tiinex.site.create-task.v1');
  assert.equal(definition.outputSchemaIds[0], 'tiinex.task.v1');
  assert.equal(definition.source.locator.localPath, '/repo-a/.topics/processes/custom-create-task.trace.md');
  assert.equal(definition.boundary.applicability, 'not-evaluated');
  assert.equal(definition.boundary.executable, false);
  assert.equal(result.boundary.semanticPackageAttachment, 'not-evaluated');
  assert.equal(result.boundary.schemaCompanionAttachment, 'not-evaluated');
});

test('transition catalog preserves invalid workspace definitions without projecting them as read-qualified candidates', () => {
  const invalid = createTask.replace('- Name: Create standalone Task\n', '');
  const result = projectPortableTransitionCatalog({
    files: [
      material('valid.trace.md', createTask),
      material('invalid.trace.md', invalid, '/repo-b')
    ],
    outputSchemaId: 'tiinex.task.v1'
  });
  assert.equal(result.counts.discovered, 2);
  assert.equal(result.counts.readQualified, 1);
  assert.equal(result.counts.projectedCandidates, 1);
  assert.equal(result.candidates[0].path, 'valid.trace.md');
  assert.ok(result.definitions.some((definition) => definition.path === 'invalid.trace.md' && definition.canonicalReadQualified === false));
  assert.ok(result.findings.some((finding) => finding.code === 'portable.transition-catalog.definition.unqualified'));
});

test('portable operation catalog exposes host-neutral Transition discovery', async () => {
  const result = await runPortableOperation('project-transition-catalog', {
    files: [material('workspace-defined.trace.md', createTask)],
    outputSchemaId: 'tiinex.task.v1'
  });
  assert.equal(result.operation, 'project-transition-catalog');
  assert.equal(result.counts.projectedCandidates, 1);
  assert.equal(result.candidates[0].humanLabel, 'Task');
  assert.equal(result.findingSummary.counts.error, 0);
});

test('canonical identifier and version do not collapse independent Transition representations', () => {
  const divergent = createTask.replace(
    '- Purpose: Create one browser-local standalone Task in the selected workspace.',
    '- Purpose: Create one deliberately different Task representation from another origin.'
  );
  const result = projectPortableTransitionCatalog({
    files: [
      material('workspace-a/create-task.trace.md', createTask, '/repo-a'),
      material('workspace-b/create-task.trace.md', divergent, '/repo-b')
    ],
    outputSchemaId: 'tiinex.task.v1'
  });
  assert.equal(result.counts.discovered, 2);
  assert.equal(result.counts.readQualified, 2);
  assert.equal(result.counts.projectedCandidates, 2);
  assert.equal(result.candidates.every((definition) => definition.canonicalIdentifier === 'tiinex.site.create-task.v1'), true);
  assert.equal(result.limitations.some((item) => /not universal representation identity/i.test(item)), true);
});

test('Transition neighborhood requires explicit Semantic Package plus Schema Transition Companion attachment', () => {
  const result = projectPortableTransitionNeighborhood({ files: packageFixture(), outputSchemaId: 'tiinex.task.v1' });
  assert.equal(result.counts.discovered, 2);
  assert.equal(result.counts.readQualified, 2);
  assert.equal(result.counts.attachedCandidates, 1);
  assert.equal(result.candidates[0].canonicalIdentifier, 'tiinex.site.topic-to-task.v1');
  assert.equal(result.candidates[0].attachmentQualification, 'explicit-schema-companion');
  assert.equal(result.candidates[0].attachmentProvenance[0].attachmentParticipation, 'consistent');
  assert.equal(result.boundary.applicability, 'not-evaluated');
  assert.equal(result.boundary.execution, 'not-authorized');
});

test('Transition neighborhood does not infer attachment from registry presence', () => {
  const result = projectPortableTransitionNeighborhood({ files: packageFixture('/repo-a', { attach: false }), outputSchemaId: 'tiinex.task.v1' });
  assert.equal(result.counts.discovered, 2);
  assert.equal(result.counts.attachedCandidates, 0);
});

test('Transition neighborhood can filter attached candidates by current input schema without claiming applicability', () => {
  const matched = projectPortableTransitionNeighborhood({ files: packageFixture(), outputSchemaId: 'tiinex.task.v1', inputSchemaId: 'tiinex.topic.v1' });
  assert.equal(matched.counts.attachedCandidates, 1);
  const mismatched = projectPortableTransitionNeighborhood({ files: packageFixture(), outputSchemaId: 'tiinex.task.v1', inputSchemaId: 'tiinex.task.v1' });
  assert.equal(mismatched.counts.attachedCandidates, 0);
});

test('portable operation catalog exposes schema-local Transition neighborhood without upgrading attachment to execution', async () => {
  const result = await runPortableOperation('project-transition-neighborhood', {
    files: packageFixture(),
    outputSchemaId: 'tiinex.task.v1'
  });
  assert.equal(result.operation, 'project-transition-neighborhood');
  assert.equal(result.counts.attachedCandidates, 1);
  assert.equal(result.boundary.execution, 'not-authorized');
  assert.equal(result.findingSummary.counts.error, 0);
});


test('Transition neighborhood can project qualified explicit generation defaults without implying applicability or execution', () => {
  const result = projectPortableTransitionNeighborhood({ files: explicitGenerationFixture(), outputSchemaId: 'tiinex.task.v1' });
  assert.equal(result.counts.attachedCandidates, 1);
  const profile = result.candidates[0].authoringProfile;
  assert.equal(profile.state, 'qualified');
  assert.equal(profile.generationQualification, 'qualified');
  assert.equal(profile.defaults.Objective, 'Review the bounded objective before saving.');
  assert.deepEqual(profile.defaults.Scope, { Included: 'bounded fixture', Excluded: 'execution' });
  assert.equal(profile.boundary.explicitSelectionRequired, true);
  assert.equal(profile.boundary.recommendation, 'not-projected');
  assert.equal(profile.boundary.executionAuthorized, false);
  assert.equal(result.boundary.execution, 'not-authorized');
});


test('semantic package local Transition discovery follows qualified artifact type independent of directory', () => {
  const root = compilePortableSchemaContractChain([schemaMarkdown('tiinex.root.v1'), schemaMarkdown('tiinex.semantic.package.v1')]);
  for (const directory of ['.transitions', 'work/process-a', '.custom/transitions', 'features/nested']) {
    const files = packageFixture('/repo-a', { attach: false });
    const from = 'pkg/.transitions/create-task-transition-definition.trace.md';
    const target = `pkg/${directory}/create-task-transition-definition.trace.md`;
    files.find((file) => file.path === from).path = target;
    // Nested package manifest is excluded regardless of layout, where present.
    const index = indexPortableMaterials(files);
    const manifest = index.materials.find((item) => item.schemaId === 'tiinex.semantic.package.v1');
    const graph = compileSemanticPackageGraph({ selectedManifest: manifest, materialIndex: index, compiledContract: root });
    const node = graph.nodes.find((item) => item.manifestKey === manifest.representationKey);
    assert.equal(node.boundaryQualification, 'valid', directory);
    assert.ok(node.localTransitionKeys.includes(index.materials.find((item) => item.path === target).representationKey), directory);
    assert.equal(node.localTransitionKeys.length, 2, directory);
  }
});

test('package-local discovery never borrows Transition artifacts from unselected nested package', () => {
  const files = packageFixture('/repo-a',{attach:false});
  const from='pkg/.transitions/create-task-transition-definition.trace.md';
  files.find(x=>x.path===from).path='pkg/nested/work/create-task-transition-definition.trace.md';
  const rootManifest=files[0];
  files.push(material('pkg/nested/nested-package.trace.md',rootManifest.content.replace('Package Name: Task','Package Name: Nested Task')));
  const index=indexPortableMaterials(files);
  const contract=compilePortableSchemaContractChain([schemaMarkdown('tiinex.root.v1'),schemaMarkdown('tiinex.semantic.package.v1')]);
  const selected=index.materials.find(x=>x.path==='pkg/task-semantic-package.trace.md');
  const compiled=compileSemanticPackageGraph({selectedManifest:selected,materialIndex:index,compiledContract:contract});
  const node=compiled.nodes.find(x=>x.manifestKey===selected.representationKey);
  assert.equal(node.boundaryQualification,'valid');
  assert.ok(node.nestedPackageRoots.includes('pkg/nested'));
  assert.equal(node.localTransitionKeys.length,1,'nested definition does not join selected package');
});

test('explicit companion attachment and generation profile survive non-dot Transition location, without implicit applicability', () => {
  for (const where of ['.transitions','work/process-a','.extensions/local']) {
    const files=explicitGenerationFixture();
    const old='pkg/.transitions/topic-to-task-transition-definition.trace.md';
    const target=`pkg/${where}/topic-to-task-transition-definition.trace.md`;
    const definition=files.find(item=>item.path===old);definition.path=target;definition.locator.localPath='/repo-a/'+target;
    const companion=files.find(item=>item.path==='pkg/tiinex.task.v1-transitions.trace.md');
    companion.content=companion.content.replace('.transitions/topic-to-task-transition-definition.trace.md', `${where}/topic-to-task-transition-definition.trace.md`);
    // Definition's generation link resolves relative to its new directory;
    // adapt its explicit, non-executable generation reference accordingly.
    const relative=where.split('/').map(()=> '..').join('/') + '/.generation/task-authoring-generation.trace.md';
    definition.content=definition.content.replace('../.generation/task-authoring-generation.trace.md',relative);
    const result=projectPortableTransitionNeighborhood({files,outputSchemaId:'tiinex.task.v1'});
    assert.equal(result.counts.attachedCandidates,1,where);
    assert.equal(result.candidates[0].attachmentQualification,'explicit-schema-companion',where);
    assert.equal(result.candidates[0].authoringProfile?.state,'qualified',where);
    assert.equal(result.candidates[0].authoringProfile?.boundary.executionAuthorized,false);
    assert.equal(result.boundary.applicability,'not-evaluated');
  }
});
