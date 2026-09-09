import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('published Core package excludes repository-only cases and fixtures', (t) => {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) return t.skip('npm_execpath is required to inspect the actual npm pack surface');
  const run = spawnSync(process.execPath, [npmCli, 'pack', '--dry-run', '--ignore-scripts', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const [pack] = JSON.parse(run.stdout);
  const paths = pack.files.map((entry) => entry.path);
  assert.equal(paths.some((path) => path.endsWith('.case.mjs')), false);
  assert.equal(paths.some((path) => path.includes('/fixtures/') || path.includes('.fixture.')), false);
  assert.ok(paths.includes('src/public/index.js'));
  assert.ok(paths.includes('src/public/node.js'));
});
