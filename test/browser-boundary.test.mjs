import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['src/public/index.js','src/public/applicationProjection.js','src/public/companionResources.js','src/artifacts/artifact.parse.js']) {
  test(`browser entry dependency ${file} has no Node builtin import`, () => {
    const text = readFileSync(resolve(root, file), 'utf8');
    assert.equal(/(?:from|import\s*\()\s*['"]node:/.test(text), false);
  });
}
