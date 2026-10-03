import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCompositeScaffoldPlan } from '../src/scaffolds/scaffold.compose.js';
import { projectScaffoldMigrationPlan } from '../src/scaffolds/scaffold.migration.js';

const entry=(path, presence='required', role=path)=>Object.freeze({name:role,path,rawPath:path,pathState:'qualified',kind:'directory',presence,role,contentAuthority:'',contentAuthorityReference:'',namingAuthorityReference:''});
const scaffold=(handle,kind,entries)=>Object.freeze({status:'qualified',title:handle,identity:{handle,name:handle,version:'1',kind:'workspace'},target:{kind},composition:{policy:'additive',extends:''},conflict:{deletionPolicy:'never'},integrity:{state:'verified'},entries,findings:[]});

test('composes compatible Workspace capabilities into one deterministic plan',()=>{
 const plan=projectCompositeScaffoldPlan({parsedScaffolds:[scaffold('base','workspace-root',[entry('.topics'),entry('.topics/.workspaces')]),scaffold('work','workspace-root',[entry('.topics/work')])],targetBound:true,existingEntries:[{path:'.topics',kind:'directory'},{path:'.topics/.workspaces',kind:'directory'}]});
 assert.equal(plan.status,'ready'); assert.deepEqual(plan.actions.map(x=>[x.action,x.path]),[['preserve','.topics'],['preserve','.topics/.workspaces'],['create-directory','.topics/work']]);
});

test('exact duplicate entries collapse but conflicting semantics fail closed',()=>{
 const ok=projectCompositeScaffoldPlan({parsedScaffolds:[scaffold('a','workspace-root',[entry('.topics/work')]),scaffold('b','workspace-root',[entry('.topics/work')])],targetBound:true});
 assert.equal(ok.status,'ready'); assert.equal(ok.actions.length,1);
 const bad=projectCompositeScaffoldPlan({parsedScaffolds:[scaffold('a','workspace-root',[entry('.topics/work','required','work')]),scaffold('b','workspace-root',[entry('.topics/work','optional','other')])],targetBound:true});
 assert.equal(bad.status,'blocked'); assert.ok(bad.findings.some(x=>x.code==='scaffold.composite.path-conflict'));
});

test('repository and Workspace target kinds are not silently merged',()=>{
 const plan=projectCompositeScaffoldPlan({parsedScaffolds:[scaffold('workspace','workspace-root',[entry('.topics')]),scaffold('repo','repository-root',[entry('src')])],targetBound:true});
 assert.equal(plan.status,'blocked'); assert.ok(plan.findings.some(x=>x.code==='scaffold.composite.target-kind-conflict'));
});

test('migration projection proposes explicit subject move beneath work without mutating source',()=>{
 const plan=projectScaffoldMigrationPlan({parsedWorkspaceScaffolds:[scaffold('base','workspace-root',[entry('.topics'),entry('.topics/.workspaces')]),scaffold('work','workspace-root',[entry('.topics/work')])],targetBound:true,existingEntries:[{path:'.topics',kind:'directory'},{path:'.topics/.workspaces',kind:'directory'},{path:'.topics/refactor',kind:'directory'}],subjectRoots:['.topics/refactor']});
 assert.equal(plan.status,'ready'); assert.equal(plan.mutationPerformed,false); assert.deepEqual(plan.moves,[{action:'move-directory',from:'.topics/refactor',to:'.topics/work/refactor',reason:'legacy-subject-converges-under-work-root'}]);
});

test('migration projection blocks destination conflict instead of merging subject trees',()=>{
 const plan=projectScaffoldMigrationPlan({parsedWorkspaceScaffolds:[scaffold('base','workspace-root',[entry('.topics')]),scaffold('work','workspace-root',[entry('.topics/work')])],targetBound:true,existingEntries:[{path:'.topics',kind:'directory'},{path:'.topics/work',kind:'directory'},{path:'.topics/refactor',kind:'directory'},{path:'.topics/work/refactor',kind:'directory'}],subjectRoots:['.topics/refactor']});
 assert.equal(plan.status,'blocked'); assert.ok(plan.findings.some(x=>x.code==='scaffold.migration.destination-conflict'));
});
