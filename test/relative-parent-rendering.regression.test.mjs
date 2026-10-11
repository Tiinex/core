import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {relativePortableReference} from '../src/tooling/portable/editor/editor.assistance.js';

test('same-directory Parent renders canonical sibling filename (no ./)',()=>{
  assert.equal(relativePortableReference('.topics/initiatives/001-child.trace.md','.topics/initiatives/001-parent.trace.md'), '001-parent.trace.md');
});
test('different-directory Parent retains necessary traversal',()=>{
  assert.equal(relativePortableReference('.topics/initiatives/001-child.trace.md','.topics/projects/001-parent.trace.md'), '../projects/001-parent.trace.md');
  assert.equal(relativePortableReference('.topics/work/deep/001-child.trace.md','.topics/initiatives/001-parent.trace.md'),'../../initiatives/001-parent.trace.md');
});
test('same-file reference is never fabricated as ./',()=>{
  assert.equal(relativePortableReference('.topics/initiatives/001-self.trace.md','.topics/initiatives/001-self.trace.md'),'');
});
test('actual selected-Parent renderer uses canonical helper for Trace, Origin and Towards',()=>{
  const source=fs.readFileSync(new URL('../src/tooling/portable/editor/editor.assistance.js',import.meta.url),'utf8');
  assert.match(source,/const relative = relativePortableReference\(currentPath, selectedPath\)/);
  assert.match(source,/lines\[trace\[0\]\] = `  - Trace: \[\$\{selectedLabel\}\]\(\$\{relative\}\)`/);
  assert.match(source,/lines\[origin\[0\]\] = `    - \[relative\]\(\$\{relative\}\)`/);
  assert.match(source,/lines\[towards\[0\]\] = `  - Towards: \[\$\{selectedLabel\}\]\(\$\{relative\}\)`/);
});
