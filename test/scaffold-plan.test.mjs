import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { projectScaffoldPlan } from '../src/scaffolds/scaffold.plan.js';

const scaffoldMarkdown = qualifiedWorkspaceScaffold();

test('qualified workspace scaffold projects only required directory creation for an empty target', () => {
  const plan = projectScaffoldPlan({ scaffoldMarkdown, targetBound: true, existingEntries: [] });
  assert.equal(plan.status, 'ready');
  assert.equal(plan.mutationPerformed, false);
  assert.deepEqual(plan.actions.map((item) => [item.action, item.path]), [
    ['create-directory','.topics'],
    ['create-directory','.topics/.workspaces'],
    ['create-directory','.topics/work'],
    ['create-directory','.topics/processes'],
    ['create-directory','.topics/reductions']
  ]);
});

test('scaffold planning preserves compatible existing directories and creates only missing roots', () => {
  const plan = projectScaffoldPlan({
    scaffoldMarkdown,
    targetBound: true,
    existingEntries: [
      { path: '.topics', kind: 'directory' },
      { path: '.topics/.workspaces', kind: 'directory' }
    ]
  });
  assert.equal(plan.status, 'ready');
  assert.equal(plan.actions.filter((item) => item.action === 'preserve').length, 2);
  assert.deepEqual(plan.actions.filter((item) => item.action === 'create-directory').map((item) => item.path), ['.topics/work','.topics/processes','.topics/reductions']);
});

test('scaffold planning fails closed on target kind conflict', () => {
  const plan = projectScaffoldPlan({ scaffoldMarkdown, targetBound: true, existingEntries: [{ path: '.topics/work', kind: 'file' }] });
  assert.equal(plan.status, 'blocked');
  assert.ok(plan.findings.some((item) => item.code === 'scaffold.target.conflict'));
});

test('scaffold planning requires explicit target binding', () => {
  const plan = projectScaffoldPlan({ scaffoldMarkdown, targetBound: false, existingEntries: [] });
  assert.equal(plan.status, 'blocked');
  assert.ok(plan.findings.some((item) => item.code === 'scaffold.target.unbound'));
});

test('host-like dogfood can apply create-directory actions then replan to pure preserve/no-op', async () => {
  const root = await mkdtemp(path.join(tmpdir(),'tiinex-scaffold-'));
  const initial = projectScaffoldPlan({ scaffoldMarkdown, targetBound: true, existingEntries: [] });
  assert.equal(initial.status, 'ready');
  for (const step of initial.actions.filter((item) => item.action === 'create-directory')) await mkdir(path.join(root, step.path), { recursive: true });
  const observed = [];
  for (const step of initial.actions) {
    if (step.action !== 'create-directory') continue;
    const s = await stat(path.join(root, step.path));
    observed.push({ path: step.path, kind: s.isDirectory() ? 'directory' : 'file' });
  }
  const after = projectScaffoldPlan({ scaffoldMarkdown, targetBound: true, existingEntries: observed });
  assert.equal(after.status, 'ready');
  assert.equal(after.actions.every((item) => item.action === 'preserve'), true);
});

function qualifiedWorkspaceScaffold() {
  const prepared = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.scaffold.v1
  - Created At: 2026-10-02 00:00:00
  - Summary: test scaffold

---

# Test Workspace Scaffold

## Scaffold Identity

- Scaffold Handle: test.workspace.v1
- Scaffold Name: Test Workspace
- Scaffold Kind: workspace
- Version: 1

## Target Boundary

- Target Kind: workspace-root
- Target Root Meaning: selected workspace root
- Root Binding Policy: explicit-invocation

## Structural Entries

- Topics root
  - Path: .topics
  - Entry Kind: directory
  - Presence: required
  - Entry Role: tiinex-topics-root
- Workspace root
  - Path: .topics/.workspaces
  - Entry Kind: directory
  - Presence: required
  - Entry Role: workspace-entrypoint-root
- Work root
  - Path: .topics/work
  - Entry Kind: directory
  - Presence: required
  - Entry Role: work-root
- Process root
  - Path: .topics/processes
  - Entry Kind: directory
  - Presence: required
  - Entry Role: process-root
- Reduction root
  - Path: .topics/reductions
  - Entry Kind: directory
  - Presence: required
  - Entry Role: reduction-root

## Composition

- Composition Policy: additive
- Duplicate Entry Policy: exact-duplicate-allowed

## Conflict Policy

- Existing Compatible Material: no-op
- Existing Conflicting Material: block
- Unknown Existing Material: preserve
- Deletion Policy: never

## Generation Bindings

- none

## Validation Boundary

- Qualification Rule: exact scaffold qualification
- Planning Rule: read-only projection
- Apply Rule: separate host action
- Failure Policy: fail-closed

## Interpretation Limits

- Does Not Establish: semantic authority outside structural shape
- Must Not Be Used To Claim: completion or deletion authority

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: `;
  const sealed = sealC14nV2Self(prepared);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
