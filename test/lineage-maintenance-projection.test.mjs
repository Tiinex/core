import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { sealC14nV2Self, canonicalC14nV2SelfState, verifyC14nV2TargetSelfDigest } from '../src/integrity/integrity.c14nV2.js';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
import { projectPortableLineageMaintenance, qualifyPortableLineageDirectoryNamespace, qualifyPortableLineageWorkspaceNamespaces } from '../src/tooling/portable/lineage/lineage.maintenance.projection.js';
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';

const method='sha256-base64url-c14n-v2';
function artifact({path:artifactPath,title,parent=null}){
  const parentBlock=parent?`- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: [${path.posix.basename(parent.path)}](${path.posix.relative(path.posix.dirname(artifactPath),parent.path)})\n  - Origin:\n    - [relative](${path.posix.relative(path.posix.dirname(artifactPath),parent.path)})\n`:'';
  const parentIntegrity=parent?`- ${method}\n  - Towards: [${path.posix.basename(parent.path)}](${path.posix.relative(path.posix.dirname(artifactPath),parent.path)})\n  - Value: ${canonicalC14nV2SelfState(parent.markdown).declaredValue}\n\n`:'';
  const md=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parentBlock}- Current\n  - Current Schema: tiinex.task.v1\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n## Objective\n\n${title}.\n\n---\n\n# Continuity Integrity\n\n${parentIntegrity}- ${method}\n  - Towards: self\n  - Value: `;
  return {workspaceId:'fixture',path:artifactPath,markdown:sealC14nV2Self(md).markdown+'\n'};
}
function verifyParents(changes){
  const byPath=new Map(changes.map(x=>[x.toPath,x]));
  for(const change of changes){
    assert.equal(canonicalC14nV2SelfState(change.markdown).state,'verified',change.toPath);
    const rec=createRecordFromMarkdown(change.markdown,{path:change.toPath});
    if(!rec.trace||rec.trace.includes('::')||/^[a-z][a-z0-9+.-]*:/i.test(rec.trace))continue;
    const target=path.posix.normalize(path.posix.join(path.posix.dirname(change.toPath),rec.trace));
    const parent=byPath.get(target); if(!parent)continue;
    const entry=rec.integrity.entries.find(x=>x.towards&&x.towards!=='self'); assert.ok(entry,change.toPath);
    assert.equal(verifyC14nV2TargetSelfDigest({value:entry.value,targetMarkdown:parent.markdown}).state,'verified',change.toPath);
  }
}

test('Move relocates a whole coordinate lineage into an empty directory and preserves semantic Parent',()=>{
  const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});
  const b=artifact({path:'.topics/a/001-1-child.trace.md',title:'Child',parent:a});
  const c=artifact({path:'.topics/a/001-1-1-leaf.trace.md',title:'Leaf',parent:b});
  const plan=projectPortableLineageMaintenance({materials:[a,b,c],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path,b.path,c.path],targetDirectory:'.topics/b'}});
  assert.equal(plan.status,'ready');
  const byFrom=new Map(plan.changes.map(x=>[x.fromPath,x]));
  assert.equal(byFrom.get(a.path).toPath,'.topics/b/001-root.trace.md');
  assert.equal(byFrom.get(b.path).toPath,'.topics/b/001-1-child.trace.md');
  assert.equal(byFrom.get(c.path).toPath,'.topics/b/001-1-1-leaf.trace.md');
  assert.equal(plan.summary.semanticParentChanges,0); verifyParents(plan.changes);
});

test('Move middle segment compacts source coordinate tree without manufacturing semantic Parent ancestry',()=>{
  const a=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});
  const b=artifact({path:'.topics/a/001-1-middle.trace.md',title:'Middle',parent:a});
  const c=artifact({path:'.topics/a/001-1-1-middle-two.trace.md',title:'Middle Two',parent:b});
  const d=artifact({path:'.topics/a/001-1-1-1-survivor.trace.md',title:'Survivor',parent:c});
  const plan=projectPortableLineageMaintenance({materials:[a,b,c,d],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[b.path,c.path],targetDirectory:'.topics/b'}});
  assert.equal(plan.status,'ready');
  const byFrom=new Map(plan.changes.map(x=>[x.fromPath,x]));
  assert.equal(byFrom.get(a.path).toPath,'.topics/a/001-root.trace.md');
  assert.equal(byFrom.get(d.path).toPath,'.topics/a/001-1-survivor.trace.md');
  assert.equal(byFrom.get(b.path).toPath,'.topics/b/001-middle.trace.md');
  assert.equal(byFrom.get(c.path).toPath,'.topics/b/001-1-middle-two.trace.md');
  const survivor=createRecordFromMarkdown(byFrom.get(d.path).markdown,{path:byFrom.get(d.path).toPath});
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(byFrom.get(d.path).toPath),survivor.trace)),'.topics/b/001-1-middle-two.trace.md');
  assert.equal(plan.summary.semanticParentChanges,0); verifyParents(plan.changes);
});

test('Move into a non-empty target namespace deterministically compacts target roots before moved roots',()=>{
  const existing=artifact({path:'.topics/b/004-existing.trace.md',title:'Existing'});
  const a=artifact({path:'.topics/a/009-moved.trace.md',title:'Moved'});
  const plan=projectPortableLineageMaintenance({materials:[existing,a],operation:{kind:'move',workspaceId:'fixture',selectedPaths:[a.path],targetDirectory:'.topics/b'}});
  assert.equal(plan.status,'ready');
  const byFrom=new Map(plan.changes.map(x=>[x.fromPath,x]));
  assert.equal(byFrom.get(existing.path).toPath,'.topics/b/001-existing.trace.md');
  assert.equal(byFrom.get(a.path).toPath,'.topics/b/002-moved.trace.md');
});

test('Prepend before a semantic root rewires only the insertion chain and shifts local coordinates deeper',()=>{
  const insert=artifact({path:'.topics/a/009-new-ancestor.trace.md',title:'Ancestor'});
  const target=artifact({path:'.topics/a/001-target.trace.md',title:'Target'});
  const child=artifact({path:'.topics/a/001-1-child.trace.md',title:'Child',parent:target});
  const plan=projectPortableLineageMaintenance({materials:[target,child,insert],operation:{kind:'prepend',workspaceId:'fixture',orderedPaths:[insert.path],targetPath:target.path}});
  assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  const byFrom=new Map(plan.changes.map(x=>[x.fromPath,x]));
  assert.equal(byFrom.get(insert.path).toPath,'.topics/a/001-new-ancestor.trace.md');
  assert.equal(byFrom.get(target.path).toPath,'.topics/a/001-1-target.trace.md');
  assert.equal(byFrom.get(child.path).toPath,'.topics/a/001-1-1-child.trace.md');
  assert.equal(byFrom.get(insert.path).semanticParent.after,'');
  assert.equal(byFrom.get(target.path).semanticParent.after,insert.path);
  assert.equal(plan.summary.semanticParentChanges,2); verifyParents(plan.changes);
});

test('Prepend supports an ordered multi-artifact chain on an existing Parent edge',()=>{
  const root=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});
  const target=artifact({path:'.topics/a/001-1-target.trace.md',title:'Target',parent:root});
  const x=artifact({path:'.topics/a/008-x.trace.md',title:'X'});
  const y=artifact({path:'.topics/a/009-y.trace.md',title:'Y'});
  const plan=projectPortableLineageMaintenance({materials:[root,target,x,y],operation:{kind:'prepend',workspaceId:'fixture',orderedPaths:[x.path,y.path],targetPath:target.path}});
  assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  const byFrom=new Map(plan.changes.map(x=>[x.fromPath,x]));
  const xr=createRecordFromMarkdown(byFrom.get(x.path).markdown,{path:byFrom.get(x.path).toPath});
  const yr=createRecordFromMarkdown(byFrom.get(y.path).markdown,{path:byFrom.get(y.path).toPath});
  const tr=createRecordFromMarkdown(byFrom.get(target.path).markdown,{path:byFrom.get(target.path).toPath});
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(byFrom.get(x.path).toPath),xr.trace)),byFrom.get(root.path).toPath);
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(byFrom.get(y.path).toPath),yr.trace)),byFrom.get(x.path).toPath);
  assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(byFrom.get(target.path).toPath),tr.trace)),byFrom.get(y.path).toPath);
  verifyParents(plan.changes);
});


test('Directory namespace qualification reports drift and projects the normalize-directory recovery without changing semantic Parent',()=>{
  const root=artifact({path:'.topics/processes/example/004-root.trace.md',title:'Root'});
  const child=artifact({path:'.topics/processes/example/004-1-child.trace.md',title:'Child',parent:root});
  const qualified=qualifyPortableLineageDirectoryNamespace({materials:[root,child],workspaceId:'fixture',directory:'.topics/processes/example'});
  assert.equal(qualified.status,'ready');
  assert.equal(qualified.qualification,'drifted');
  assert.equal(qualified.summary.drifted,2);
  assert.deepEqual(qualified.recommendation,{operation:'project-lineage-maintenance',kind:'normalize-directory',workspaceId:'fixture',targetDirectory:'.topics/processes/example'});
  const plan=projectPortableLineageMaintenance({materials:[root,child],operation:{kind:'normalize-directory',workspaceId:'fixture',targetDirectory:'.topics/processes/example'}});
  assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  assert.equal(plan.summary.pathChanges,2);
  assert.equal(plan.summary.semanticParentChanges,0);
  assert.equal(plan.applyContract.command,'apply-lineage-maintenance');
  assert.equal(plan.applyContract.exactPlanFingerprintRequired,true);
  verifyParents(plan.changes);
});

test('Normalize Directory is an explicit no-op for an already compact namespace',()=>{
  const root=artifact({path:'.topics/processes/example/001-root.trace.md',title:'Root'});
  const child=artifact({path:'.topics/processes/example/001-1-child.trace.md',title:'Child',parent:root});
  const qualified=qualifyPortableLineageDirectoryNamespace({materials:[root,child],workspaceId:'fixture',directory:'.topics/processes/example'});
  assert.equal(qualified.status,'ready');
  assert.equal(qualified.qualification,'compact');
  assert.equal(qualified.recommendation,null);
  const plan=projectPortableLineageMaintenance({materials:[root,child],operation:{kind:'normalize-directory',workspaceId:'fixture',targetDirectory:'.topics/processes/example'}});
  assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  assert.equal(plan.summary.pathChanges,0);
  assert.equal(plan.summary.byteChanges,0);
  assert.equal(plan.summary.semanticParentChanges,0);
});

test('Unrelated unqualified Tiinex material does not block a directory-local normalization plan',()=>{
  const drifted=artifact({path:'.topics/a/004-root.trace.md',title:'Drifted'});
  const unrelated=artifact({path:'.topics/b/001-unrelated.trace.md',title:'Unrelated'});
  const broken={...unrelated,markdown:unrelated.markdown.replace(/(\n  - Towards: self\n  - Value:)[^\n]+/,'$1broken')};
  assert.notEqual(canonicalC14nV2SelfState(broken.markdown).state,'verified');
  const plan=projectPortableLineageMaintenance({materials:[drifted,broken],operation:{kind:'normalize-directory',workspaceId:'fixture',targetDirectory:'.topics/a'}});
  assert.equal(plan.status,'ready',JSON.stringify(plan.findings));
  assert.equal(plan.summary.pathChanges,1);
  assert.equal(plan.changes.find((item)=>item.fromPath===broken.path).bytesChanged,false);
});

test('Affected unqualified Tiinex material blocks lineage maintenance fail-closed',()=>{
  const drifted=artifact({path:'.topics/a/004-root.trace.md',title:'Drifted'});
  const broken={...drifted,markdown:drifted.markdown.replace(/(\n  - Towards: self\n  - Value:)[^\n]+/,'$1broken')};
  assert.notEqual(canonicalC14nV2SelfState(broken.markdown).state,'verified');
  const plan=projectPortableLineageMaintenance({materials:[broken],operation:{kind:'normalize-directory',workspaceId:'fixture',targetDirectory:'.topics/a'}});
  assert.equal(plan.status,'blocked');
  assert.equal(plan.executable,false);
  assert.ok(plan.findings.some((item)=>item.code==='lineage-maintenance.self-unqualified'&&item.params?.path===broken.path));
});

test('Workspace namespace qualification discovers compact and drifted numeric directories while excluding mixed Tiinex surfaces',()=>{
  const compact=artifact({path:'.topics/processes/example/001-root.trace.md',title:'Compact'});
  const drifted=artifact({path:'.topics/reductions/workspace/010-reduction.trace.md',title:'Drifted'});
  const mixedNumeric=artifact({path:'.topics/native/001-catalog.trace.md',title:'Catalog'});
  const mixedNamed=artifact({path:'.topics/native/resume-entry.trace.md',title:'Named'});
  const result=qualifyPortableLineageWorkspaceNamespaces({materials:[compact,drifted,mixedNumeric,mixedNamed],workspaceId:'fixture'});
  assert.equal(result.status,'ready',JSON.stringify(result.findings));
  assert.equal(result.qualification,'drifted');
  assert.deepEqual(result.summary,{directories:2,compact:1,drifted:1,blocked:0,skippedMixed:1,artifacts:4});
  assert.equal(result.namespaces.find((item)=>item.directory==='.topics/processes/example').qualification,'compact');
  assert.equal(result.namespaces.find((item)=>item.directory==='.topics/reductions/workspace').qualification,'drifted');
  assert.equal(result.skipped[0].directory,'.topics/native');
  assert.equal(result.skipped[0].state,'not-applicable-mixed');
  assert.deepEqual(result.recommendations,[{operation:'project-lineage-maintenance',kind:'normalize-directory',workspaceId:'fixture',targetDirectory:'.topics/reductions/workspace'}]);
});

test('Workspace namespace qualification reports an unqualified numeric namespace as blocked without rewriting it',()=>{
  const drifted=artifact({path:'.topics/a/004-root.trace.md',title:'Drifted'});
  const broken={...drifted,markdown:drifted.markdown.replace(/(\n  - Towards: self\n  - Value:)[^\n]+/,'$1broken')};
  const result=qualifyPortableLineageWorkspaceNamespaces({materials:[broken],workspaceId:'fixture'});
  assert.equal(result.status,'blocked');
  assert.equal(result.qualification,'blocked');
  assert.equal(result.summary.blocked,1);
  assert.ok(result.findings.some((item)=>item.code==='lineage-workspace-namespace.directory-blocked'));
  assert.equal(result.namespaces[0].status,'blocked');
});

test('Unsupported arbitrary lineage reorder remains fail-closed and non-executable',()=>{
  const root=artifact({path:'.topics/a/001-root.trace.md',title:'Root'});
  const plan=projectPortableLineageMaintenance({materials:[root],operation:{kind:'reorder',workspaceId:'fixture',selectedPaths:[root.path]}});
  assert.equal(plan.status,'blocked');
  assert.equal(plan.executable,false);
  assert.ok(plan.findings.some((item)=>item.code==='lineage-maintenance.operation-unsupported'));
});

test('CLI workspace lineage qualification discovers namespace drift without caller-supplied directory enumeration', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-lineage-workspace-cli-'));
  try {
    const compact = artifact({ path: '.topics/processes/example/001-root.trace.md', title: 'Compact' });
    const drifted = artifact({ path: '.topics/reductions/workspace/010-reduction.trace.md', title: 'Drifted' });
    for (const item of [compact, drifted]) {
      const target = path.join(root, item.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, item.markdown, 'utf8');
    }
    const output = []; const errors = [];
    const code = await runPortableCli([
      'qualify-lineage-workspace', root, '--workspace-id', 'fixture', '--json', '--compact'
    ], { log: (value) => output.push(String(value)), error: (value) => errors.push(String(value)) });
    assert.equal(code, 0, errors.join('\n'));
    const result = JSON.parse(output.at(-1));
    assert.equal(result.status, 'ready');
    assert.equal(result.qualification.qualification, 'drifted');
    assert.equal(result.qualification.summary.drifted, 1);
    assert.equal(result.qualification.recommendations[0].targetDirectory, '.topics/reductions/workspace');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('CLI lineage qualification binds loaded Workspace files to the explicit workspace id', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-lineage-cli-'));
  try {
    const item = artifact({ path: '.topics/processes/example/001-root.trace.md', title: 'Root' });
    const target = path.join(root, item.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, item.markdown, 'utf8');
    const output = [];
    const errors = [];
    const code = await runPortableCli([
      'qualify-lineage-directory', root,
      '--workspace-id', 'fixture',
      '--directory', '.topics/processes/example',
      '--json', '--compact'
    ], { log: (value) => output.push(String(value)), error: (value) => errors.push(String(value)) });
    assert.equal(code, 0, errors.join('\n'));
    const result = JSON.parse(output.at(-1));
    assert.equal(result.status, 'ready');
    assert.equal(result.qualification.qualification, 'compact');
    assert.equal(result.qualification.summary.artifacts, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('CLI lineage maintenance projection uses the same loaded Workspace file binding', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-lineage-cli-plan-'));
  try {
    const item = artifact({ path: '.topics/processes/example/004-root.trace.md', title: 'Root' });
    const target = path.join(root, item.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, item.markdown, 'utf8');
    await writeFile(path.join(root, 'README.md'), '# Supporting repository documentation\n', 'utf8');
    await mkdir(path.join(root, 'test', 'fixtures'), { recursive: true });
    await writeFile(path.join(root, 'test', 'fixtures', 'not-workspace-lineage.trace.md'), '# Fixture without Tiinex integrity\n', 'utf8');
    const output = [];
    const errors = [];
    const code = await runPortableCli([
      'project-lineage-maintenance', root,
      '--kind', 'normalize-directory',
      '--workspace-id', 'fixture',
      '--directory', '.topics/processes/example',
      '--json', '--compact'
    ], { log: (value) => output.push(String(value)), error: (value) => errors.push(String(value)) });
    assert.equal(code, 0, errors.join('\n'));
    const result = JSON.parse(output.at(-1));
    assert.equal(result.status, 'ready');
    assert.equal(result.plan.summary.pathChanges, 1);
    assert.equal(result.plan.changes[0].toPath, '.topics/processes/example/001-root.trace.md');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

