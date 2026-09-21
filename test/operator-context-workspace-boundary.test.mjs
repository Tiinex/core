import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../src/integrity/integrity.methodReference.js';
import { projectPortableOperatorContext } from '../src/tooling/portable/handoff/operatorContextProjection.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.workspace.v1.schema.md';

function seal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

function workspaceFixture(title, repository) {
  return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-09-21 20:00:00\n  - Authors: Fixture\n  - Why: Exercise explicit-root operator-context Workspace ownership.\n  - Summary: ${title} Workspace.\n  - Status: active/local\n\n---\n\n# ${title}\n\n## Workspace Entrypoints\n\n### Repository source\n\n- Source Kind: local-directory\n- Repository: ${repository}\n- Root Path: .\n- Repo Files Discovery: on\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`);
}

function sourceFile(root, relativePath, content) {
  return {
    path: relativePath,
    content,
    locator: { localPath: path.join(root, ...relativePath.split('/')) }
  };
}

test('operator context exposes only root-owned top-level Workspace artifacts while preserving legitimate siblings', () => {
  const root = path.resolve('/tmp/tiinex-operator-context-extension-root');
  const nested = 'test/extension-host/fixtures/source-workspace/.topics/.workspaces/extension-host-acceptance.workspace.md';
  const files = [
    sourceFile(root, '.topics/.workspaces/tiinex-extension-vscode.workspace.md', workspaceFixture('Extension VS Code', 'Tiinex/extension-vscode')),
    sourceFile(root, '.topics/.workspaces/tiinex-vscode.workspace.md', workspaceFixture('VS Code', 'Tiinex/vscode')),
    sourceFile(root, nested, workspaceFixture('Extension Host Acceptance', 'Tiinex/extension-host-acceptance'))
  ];

  const result = projectPortableOperatorContext({
    files,
    workspaceRoots: [{ id: 'extension-root', root }]
  });

  assert.equal(result.status, 'ready', JSON.stringify(result.findings || [], null, 2));
  assert.deepEqual(result.workspaces.map((item) => item.workspaceId), ['extension-vscode', 'vscode']);
  assert.deepEqual(result.workspaces.map((item) => item.workspaceTargetPath), [
    '.topics/.workspaces/tiinex-extension-vscode.workspace.md',
    '.topics/.workspaces/tiinex-vscode.workspace.md'
  ]);
  assert.equal(result.workspaces.some((item) => item.workspaceTargetPath === nested), false);
});
