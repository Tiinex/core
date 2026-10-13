import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { currentSchemaTarget } from './helpers/current-schema-targets.mjs';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';

const path='.topics/work/example/001-check-pinned-parent.trace.md';
const parentPath='.topics/initiatives/001-1-3-governing-project.trace.md';
const commit='b9721ff160c2eb31979ecf7bdff3fc4dd3711217';
const url=`https://github.com/Tiinex/business/blob/${commit}/${parentPath}`;
const validator='https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md';
const root=currentSchemaTarget('tiinex.root.v1');
const project=currentSchemaTarget('tiinex.project.v1');
const task=currentSchemaTarget('tiinex.task.v1');
const seal=md=>{const result=sealC14nV2Self(md);assert.equal(result.state,'sealed');assert.equal(canonicalC14nV2SelfState(result.markdown).state,'verified');return result.markdown+'\n'};
const parent=seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${root})\n- Current\n  - Current Schema: [tiinex.project.v1](${project})\n  - Created At: 2026-10-13 17:00:00\n  - Authors: Sample\n  - Summary: Parent test project\n\n---\n\n# Parent test project\n\n## Purpose\n\nOwn simple bounded work.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${validator})\n  - Towards: self\n  - Value: pending\n`);
const parentDigest=canonicalC14nV2SelfState(parent).declaredValue;
function childFor(locator=url,digest=parentDigest){return seal(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${root})\n- Parent\n  - Parent Schema: [tiinex.project.v1](${project})\n  - Created At: 2026-10-13 17:00:00\n  - Trace: [001-1-3-governing-project.trace.md](${locator})\n  - Origin:\n    - [browse + git](${locator})\n- Current\n  - Current Schema: [tiinex.task.v1](${task})\n  - Created At: 2026-10-13 18:00:00\n  - Authors: Sample\n  - Summary: Example task\n\n---\n\n# Example task\n\n## Objective\n\nCreate first workflow.\n\n## Done Criteria\n\n- Has a qualified task.\n\n## Scope\n\n- One task only.\n\n## Dependencies\n\n- Parent.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${validator})\n  - Towards: [001-1-3-governing-project.trace.md](${locator})\n  - Value: ${digest}\n\n- [sha256-base64url-c14n-v2](${validator})\n  - Towards: self\n  - Value: pending\n`)}
const hash=text=>createHash('sha256').update(Buffer.from(text,'utf8')).digest('hex');
const validRead={target:url,repository:'Tiinex/business',commit,path:parentPath,markdown:parent,sha256:hash(parent)};
const run=(markdown,reads,selectedParentUrl='')=>projectPortableEditorAssistance({records:[{path,markdown}],focusPath:path,parentRepositoryReads:reads,selectedParentUrl}).documents[0];
const lineageDiagnosticCodes=d=>d.diagnostics.filter(x=>x.code.startsWith('portable.lineage-integrity.')).map(x=>x.code);

test('Pinned GitHub Parent is qualified with exact host-read bytes and no false parent-unresolved warning',()=>{
 const doc=run(childFor(),[validRead]);
 assert.equal(lineageDiagnosticCodes(doc).includes('portable.lineage-integrity.parent-unresolved'),false,JSON.stringify(lineageDiagnosticCodes(doc)));
 assert.equal(lineageDiagnosticCodes(doc).includes('portable.lineage-integrity.publication-origin-unresolved'),false);
 assert.equal(doc.parentRepairAvailability,null);
});
test('No remote bytes, wrong host hash and wrong commit are never promoted to Parent authority',()=>{
 for(const reads of [[],[{...validRead,sha256:'0'.repeat(64)}],[{...validRead,commit:'a'.repeat(40)}]]) {
  const codes=lineageDiagnosticCodes(run(childFor(),reads));
  assert.ok(codes.includes('portable.lineage-integrity.parent-unresolved'),codes.join(','));
 }
});
test('A self-valid but different published Parent is rejected by child target integrity',()=>{
 const changed=parent.replace('Own simple bounded work.','Own different bounded work.');
 const sealed=sealC14nV2Self(changed.replace(/  - Value: [A-Za-z0-9_-]+/,'  - Value: pending'));
 assert.equal(sealed.state,'sealed');
 const doc=run(childFor(),[{...validRead,markdown:sealed.markdown+'\n',sha256:hash(sealed.markdown+'\n')}]);
 const codes=lineageDiagnosticCodes(doc);
 assert.ok(codes.includes('portable.lineage-integrity.parent-target-mismatch'),codes.join(','));
});
test('Cross-Workspace picker can propose a Core-qualified pinned URL reparent without modifying Parent',()=>{
 const old='https://github.com/Tiinex/business/blob/'+ 'a'.repeat(40) +'/'+ parentPath;
 const result=run(childFor(old),[validRead],url);
 const action=result.actions.find(a=>a.id==='relocate-selected-parent-and-self-seal');
 assert.ok(action,'Expected qualified permalink candidate; got '+JSON.stringify({codes:lineageDiagnosticCodes(result),actions:result.actions.map(a=>a.id)}));
 assert.equal(action.replacementMarkdown.includes(`Trace: [001-1-3-governing-project.trace.md](${url})`),true);
 assert.equal(canonicalC14nV2SelfState(action.replacementMarkdown).state,'verified');
});
