import assert from 'node:assert/strict';
import test from 'node:test';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { loadNodePortableInput } from '../src/tooling/portable/input/node.input.js';

test('node portable input includePathPrefixes prunes traversal while preserving Workspace-relative .topics paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-node-input-scope-'));
  try {
    await mkdir(path.join(root, '.topics', 'roles'), { recursive: true });
    await mkdir(path.join(root, 'src', 'deep'), { recursive: true });
    await writeFile(path.join(root, '.topics', '001.trace.md'), '# kept\n', 'utf8');
    await writeFile(path.join(root, '.topics', 'roles', '001-role.trace.md'), '# role\n', 'utf8');
    await writeFile(path.join(root, 'src', 'deep', 'ignored.ts'), 'export const ignored = true;\n', 'utf8');
    await writeFile(path.join(root, 'README.md'), '# ignored\n', 'utf8');

    const result = await loadNodePortableInput([root], { includePathPrefixes: ['.topics'] });
    assert.deepEqual(result.files.map((item) => item.path).sort(), [
      '.topics/001.trace.md',
      '.topics/roles/001-role.trace.md'
    ]);
    assert.equal(result.files.every((item) => String(item.locator?.localPath || '').startsWith(path.join(root, '.topics'))), true);
    assert.equal(result.findings.some((item) => item.severity === 'error'), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
