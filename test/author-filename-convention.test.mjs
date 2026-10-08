import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runCommonAuthorCli } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

function body(title) {
  return `# ${title}\n\nThis topic advances one bounded test thread.\n\n## Current Read\n\nCurrent state.\n\n## Design Direction\n\nContinue predictably.\n\n## Next Artifacts\n\nA child.\n`;
}

async function writeBody(root, name, title) {
  const target = path.join(root, name);
  await writeFile(target, body(title), 'utf8');
  return target;
}

test('common author defaults ordinary first-party continuations through directory allocation while exact path remains an intentional override', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tiinex-author-filename-convention-'));
  try {
    await mkdir(path.join(root, '.topics', 'lineage'), { recursive: true });
    const parentBody = await writeBody(root, 'parent-body.md', 'Parent');
    const parent = await runCommonAuthorCli({ positionals: [root], flags: { workspace: root, schema: 'tiinex.topic.v1', path: '.topics/lineage/001-1-1-parent.trace.md', body: parentBody, title: 'Parent', authors: 'Anchor' } }, {});
    assert.equal(parent.status, 'qualified');

    const firstBody = await writeBody(root, 'first-body.md', 'First Child');
    const first = await runCommonAuthorCli({ positionals: [root], flags: { workspace: root, schema: 'tiinex.topic.v1', directory: '.topics/lineage', parent: parent.artifact.path, body: firstBody, title: 'First Child', authors: 'Anchor' } }, {});
    assert.equal(first.status, 'qualified');
    assert.equal(first.artifact.path, '.topics/lineage/001-1-1-1-first-child.trace.md');

    const secondBody = await writeBody(root, 'second-body.md', 'Second Child');
    const second = await runCommonAuthorCli({ positionals: [root], flags: { workspace: root, schema: 'tiinex.topic.v1', directory: '.topics/lineage', parent: parent.artifact.path, body: secondBody, title: 'Second Child', authors: 'Anchor' } }, {});
    assert.equal(second.status, 'qualified');
    assert.equal(second.artifact.path, '.topics/lineage/001-1-1-2-second-child.trace.md');

    const customBody = await writeBody(root, 'custom-body.md', 'Custom Child');
    const custom = await runCommonAuthorCli({ positionals: [root], flags: { workspace: root, schema: 'tiinex.topic.v1', path: '.topics/lineage/001-9-human-custom-child.trace.md', parent: parent.artifact.path, body: customBody, title: 'Custom Child', authors: 'Anchor' } }, {});
    assert.equal(custom.status, 'qualified');
    assert.equal(custom.artifact.path, '.topics/lineage/001-9-human-custom-child.trace.md');
    const markdown = await readFile(path.join(root, custom.artifact.path), 'utf8');
    assert.match(markdown, /- Trace: \[001-1-1-parent\.trace\.md\]\(001-1-1-parent\.trace\.md\)/);
    assert.equal(canonicalC14nV2SelfState(markdown).state, 'verified');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
