import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
import { canonicalC14nV2SelfState, sealC14nV2Self, verifyC14nV2TargetSelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { projectScaffoldArtifactRelocation } from '../src/scaffolds/scaffold.relocation.js';

const method='sha256-base64url-c14n-v2';
function parentArtifact(title='Parent') {
  const md=`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.task.v1\n\n---\n\n# ${title}\n\n## Objective\n\nFixture parent.\n\n---\n\n# Continuity Integrity\n\n- ${method}\n  - Towards: self\n  - Value: `;
  return sealC14nV2Self(md).markdown+'\n';
}
function childArtifact({title,parentPath,parentMarkdown}) {
  const digest=canonicalC14nV2SelfState(parentMarkdown).declaredValue;
  const label=path.posix.basename(parentPath);
  const md=`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${label}](${parentPath})\n  - Origin:\n    - [relative](${parentPath})\n- Current\n  - Current Schema: tiinex.task.v1\n\n---\n\n# ${title}\n\n## Objective\n\nFixture child.\n\n---\n\n# Continuity Integrity\n\n- ${method}\n  - Towards: [${label}](${parentPath})\n  - Value: ${digest}\n\n- ${method}\n  - Towards: self\n  - Value: `;
  return sealC14nV2Self(md).markdown+'\n';
}
const parent=parentArtifact();
const root=childArtifact({title:'Root',parentPath:'../parent.trace.md',parentMarkdown:parent});
const child=childArtifact({title:'Child',parentPath:'../root.trace.md',parentMarkdown:root});
const sibling=childArtifact({title:'Sibling',parentPath:'../root.trace.md',parentMarkdown:root});
const materials=[
 {workspaceId:'fixture',path:'.topics/parent.trace.md',markdown:parent},
 {workspaceId:'fixture',path:'.topics/refactor/root.trace.md',markdown:root},
 {workspaceId:'fixture',path:'.topics/refactor/sub/child.trace.md',markdown:child},
 {workspaceId:'fixture',path:'.topics/refactor/other/sibling.trace.md',markdown:sibling}
];

test('relocates a subject subtree, rebases external relative Parent references and cascades Parent/self integrity',()=>{
 const plan=projectScaffoldArtifactRelocation({materials,relocations:[{workspaceId:'fixture',from:'.topics/refactor',to:'.topics/work/refactor'}]});
 assert.equal(plan.status,'ready'); assert.equal(plan.summary.moved,3); assert.equal(plan.summary.referenceRewrites,3); assert.equal(plan.summary.parentIntegrityUpdates,2); assert.equal(plan.summary.selfResealed,3); assert.equal(plan.summary.byteChanged,3);
 const byPath=new Map(plan.outputs.map(x=>[x.toPath,x])); const relocatedRoot=byPath.get('.topics/work/refactor/root.trace.md');
 assert.match(relocatedRoot.markdown,/Trace: \[parent\.trace\.md\]\(\.\.\/\.\.\/parent\.trace\.md\)/);
 assert.equal(byPath.get('.topics/parent.trace.md').markdown,parent,'unaffected parent bytes must stay exact');
 for(const output of plan.outputs) assert.equal(canonicalC14nV2SelfState(output.markdown).state,'verified',output.toPath);
 for(const output of plan.outputs){const rec=createRecordFromMarkdown(output.markdown,{path:output.toPath});if(!rec.trace||rec.trace.includes('::')||/^[a-z][a-z0-9+.-]*:/i.test(rec.trace))continue;const target=path.posix.normalize(path.posix.join(path.posix.dirname(output.toPath),rec.trace));const p=byPath.get(target);if(!p)continue;const entry=rec.integrity.entries.find(x=>x.towards!=='self');assert.ok(entry);assert.equal(verifyC14nV2TargetSelfDigest({value:entry.value,targetMarkdown:p.markdown}).state,'verified',output.toPath);}
});

test('workspace-qualified references are retargeted only when their target Workspace path relocates',()=>{
 const source=parent.replace('Fixture parent.','Fixture parent with `site::.topics/viewer/example.trace.md`.');
 const resealed=sealC14nV2Self(source).markdown+'\n';
 const plan=projectScaffoldArtifactRelocation({materials:[{workspaceId:'fixture',path:'.topics/example.trace.md',markdown:resealed}],relocations:[{workspaceId:'site',from:'.topics/viewer',to:'.topics/work/viewer'}]});
 assert.equal(plan.status,'ready');assert.match(plan.outputs[0].markdown,/site::\.topics\/work\/viewer\/example\.trace\.md/);assert.equal(plan.summary.byteChanged,1);
});

test('unaffected local Parent chains do not require representable Parent-integrity entries',()=>{
 const stableParent=parentArtifact('Stable Parent');
 const stableChild=sealC14nV2Self(`# Continuity Context\n\n- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [parent.trace.md](parent.trace.md)\n  - Origin:\n    - [relative](parent.trace.md)\n- Current\n  - Current Schema: tiinex.task.v1\n\n---\n\n# Stable Child\n\n## Objective\n\nUnchanged local Parent relationship without a Parent-integrity entry.\n\n---\n\n# Continuity Integrity\n\n- ${method}\n  - Towards: self\n  - Value: `).markdown+'\n';
 const moved=parentArtifact('Moved');
 const plan=projectScaffoldArtifactRelocation({materials:[
  {workspaceId:'fixture',path:'.topics/stable/parent.trace.md',markdown:stableParent},
  {workspaceId:'fixture',path:'.topics/stable/child.trace.md',markdown:stableChild},
  {workspaceId:'fixture',path:'.topics/move/moved.trace.md',markdown:moved}
 ],relocations:[{workspaceId:'fixture',from:'.topics/move',to:'.topics/moved'}]});
 assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
 const stable=plan.outputs.find((item)=>item.toPath==='.topics/stable/child.trace.md');
 assert.equal(stable.markdown,stableChild);
 assert.equal(plan.summary.parentIntegrityUpdates,0);
 assert.ok(plan.outputs.some((item)=>item.toPath==='.topics/moved/moved.trace.md'));
});
