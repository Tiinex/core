import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { extractCurrentSchemaId, humanSchemaLabel, projectTiinexCommitProvenance } from '../src/tooling/portable/git/git.commitProvenance.js';
import { projectNodeGitCommitProvenance } from '../src/tooling/portable/adapters/node/git.commitProvenance.js';
import { portableOperationCatalog } from '../src/tooling/portable/operation.catalog.js';

const artifact=(schema,title='Artifact')=>`# Continuity Context\n\n- Current Schema: [${schema}](https://example.invalid/schema.md)\n\n---\n\n# ${title}\n`;

function git(root,args){
  const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});
  if(r.status!==0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr||r.stdout}`);
  return r.stdout;
}

async function repo(){
  const root=await mkdtemp(path.join(os.tmpdir(),'tiinex-commit-provenance-'));
  git(root,['init','-q']);
  git(root,['config','user.email','tiinex@example.invalid']);
  git(root,['config','user.name','Tiinex Test']);
  return root;
}

test('schema ids project to human labels without changing semantic ids',()=>{
  assert.equal(humanSchemaLabel('tiinex.topic.v1'),'Topic');
  assert.equal(humanSchemaLabel('tiinex.transition.definition.v1'),'Transition Definition');
  assert.equal(humanSchemaLabel('tiinex.workspace.representation.v1'),'Workspace Representation');
  assert.equal(humanSchemaLabel('other.topic.v1'),'Unknown');
  assert.equal(extractCurrentSchemaId(artifact('tiinex.evidence.v1')),'tiinex.evidence.v1');
});

test('commit provenance renders one path-sorted box-drawing tree with metadata only at leaves',()=>{
  const result=projectTiinexCommitProvenance({repositoryLabel:'business',entries:[
    {status:'modified',path:'.topics/work/z/001-task.trace.md',markdown:artifact('tiinex.task.v1')},
    {status:'added',path:'.topics/roles/001-role.trace.md',markdown:artifact('tiinex.role.v1')},
    {status:'deleted',path:'.topics/work/a/001-old.trace.md',markdown:artifact('tiinex.evidence.v1')}
  ]});
  assert.equal(result.title,'Tiinex: Update business');
  assert.equal(result.message,`Tiinex: Update business\n\nTiinex provenance\n\n└── .topics/\n    ├── roles/\n    │   └── [+] [Role] 001-role.trace.md\n    └── work/\n        ├── a/\n        │   └── [-] [Evidence] 001-old.trace.md\n        └── z/\n            └── [~] [Task] 001-task.trace.md`);
});


test('portable operation exposes host-neutral commit provenance projection',async()=>{
  const op=portableOperationCatalog['project-git-commit-provenance'];
  const result=await op.handler({repositoryLabel:'core',entries:[{status:'added',path:'.topics/work/001-e.trace.md',markdown:artifact('tiinex.evidence.v1')}]});
  assert.equal(result.operation,'project-git-commit-provenance');
  assert.equal(result.title,'Tiinex: Update core');
  assert.match(result.tree,/\[\+\] \[Evidence\] 001-e\.trace\.md/);
});

test('Git adapter derives bytes from index, deleted bytes from HEAD, and ignores unstaged working-tree edits',async()=>{
  const root=await repo();
  try{
    await mkdir(path.join(root,'.topics','work'),{recursive:true});
    await writeFile(path.join(root,'.topics','work','001-old.trace.md'),artifact('tiinex.topic.v1','Old'));
    await writeFile(path.join(root,'.topics','work','002-change.trace.md'),artifact('tiinex.task.v1','Initial'));
    git(root,['add','-A']); git(root,['commit','-qm','initial']);

    await writeFile(path.join(root,'.topics','work','003-new.trace.md'),artifact('tiinex.evidence.v1','New'));
    await writeFile(path.join(root,'.topics','work','002-change.trace.md'),artifact('tiinex.task.v1','Staged'));
    git(root,['rm','-q','.topics/work/001-old.trace.md']);
    git(root,['add','.topics/work/002-change.trace.md','.topics/work/003-new.trace.md']);
    // Deliberately diverge the working tree after staging. Provenance must remain index-bound.
    await writeFile(path.join(root,'.topics','work','002-change.trace.md'),artifact('tiinex.role.v1','UNSTAGED'));

    const result=await projectNodeGitCommitProvenance(root,{repositoryLabel:'business'});
    assert.equal(result.boundary.workingTreeContentRead,false);
    assert.deepEqual(result.entries.map((x)=>[x.status,x.schemaLabel,x.path]),[
      ['deleted','Topic','.topics/work/001-old.trace.md'],
      ['modified','Task','.topics/work/002-change.trace.md'],
      ['added','Evidence','.topics/work/003-new.trace.md']
    ]);
    assert.match(result.tree,/\[-\] \[Topic\] 001-old\.trace\.md/);
    assert.match(result.tree,/\[~\] \[Task\] 002-change\.trace\.md/);
    assert.doesNotMatch(result.tree,/\[Role\]/);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('Git adapter renders rename provenance at destination leaf',async()=>{
  const root=await repo();
  try{
    await mkdir(path.join(root,'.topics','old'),{recursive:true});
    await writeFile(path.join(root,'.topics','old','001-a.trace.md'),artifact('tiinex.process.v1','A'));
    git(root,['add','-A']); git(root,['commit','-qm','initial']);
    await mkdir(path.join(root,'.topics','new'),{recursive:true});
    git(root,['mv','.topics/old/001-a.trace.md','.topics/new/001-a.trace.md']);
    const result=await projectNodeGitCommitProvenance(root,{repositoryLabel:'business'});
    assert.equal(result.entries[0].status,'renamed');
    assert.equal(result.entries[0].schemaLabel,'Process');
    assert.match(result.tree,/\[>\] \[Process\] 001-a\.trace\.md <- \.topics\/old\/001-a\.trace\.md/);
  }finally{await rm(root,{recursive:true,force:true});}
});
