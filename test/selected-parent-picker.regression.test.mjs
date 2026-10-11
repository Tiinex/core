import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { discoverLocalTiinexContentSource } from '../src/tooling/portable/adapters/node/contentSource.discovery.js';
import { initializePortableNodeRuntime } from '../src/tooling/portable/adapters/node/portableRuntime.initialize.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';
import { canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';
const native = process.env.TIINEX_TEST_NATIVE_ROOT || path.resolve(process.cwd(), '..', 'native');
const loaded = await discoverLocalTiinexContentSource({ root: native, kind: 'explicit-runtime-content-root' });
const rt = await initializePortableNodeRuntime({ runtimeRoot: process.cwd(), contentRoots: [native], trustedExecutableSourceIds: [loaded.source.id], discoverBundled: false, discoverInstalled: false });
assert.equal(rt.status,'ready');
const dir=path.join(process.env.TIINEX_TEST_BUSINESS_ROOT || path.resolve(process.cwd(), '..', 'business'), '.topics', 'initiatives');
function rec(name) { return {path:'.topics/initiatives/'+name, markdown:fs.readFileSync(path.join(dir,name),'utf8')}; }
const exact=rec('001-initiatives.trace.md');
const child=rec('001-2-public-trust-contribution-governance-task.trace.md');
const project=rec('001-1-tiinex-project.trace.md');
const relative=exact.path;
const picked=(records, selectedParentPath)=>projectPortableEditorAssistance({records,focusPath:child.path,selectedParentPath}).documents[0];
const actionOf=d=>d.actions.find(a=>a.id==='relocate-selected-parent-and-self-seal');
test('explicit exact qualified parent can be selected without mutating the original or any descendant',()=>{
 const originals=[exact,child,project].map(x=>x.markdown);
 const projection=picked([exact,child,project],relative), a=actionOf(projection);
 assert.ok(a,'Core generated a deterministic single-artifact source replacement');
 assert.equal(a.kind,'replace-document');
 assert.equal(a.qualification,'deterministic-shared-core');
 assert.ok(!a.replacements || a.replacements.length <=1);
 assert.equal(canonicalC14nV2SelfState(a.replacementMarkdown).state,'verified');
 assert.match(a.replacementMarkdown,/  - Trace: \[001-initiatives\.trace\.md\]\(001-initiatives\.trace\.md\)/);
 assert.match(a.replacementMarkdown,/    - \[relative\]\(001-initiatives\.trace\.md\)/);
 assert.match(a.replacementMarkdown,/  - Towards: \[001-initiatives\.trace\.md\]\(001-initiatives\.trace\.md\)/);
 assert.deepEqual([exact,child,project].map(x=>x.markdown),originals);
});
test('explicit Parent never follows an unqualified path, unrelated schema, broken self, or self parent',()=>{
 for(const invalid of ['../../secrets.trace.md','.topics/initiatives/not-present.trace.md',child.path])
  assert.equal(actionOf(picked([exact,child,project],invalid)),undefined,invalid);
 assert.equal(actionOf(picked([exact,child,project],project.path)),undefined,'Project parent differs from declared Topic Parent schema');
 const bad={...exact,markdown:exact.markdown.replace('Value:','Value: CORRUPT')};
 assert.equal(actionOf(picked([bad,child],bad.path)),undefined,'broken parent primary integrity blocks reparent');
});
