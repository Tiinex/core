import test from 'node:test';
import assert from 'node:assert/strict';
import { projectApplicationData, toPlaythingsStoryRecords, projectSchemaAncestry, defineCompanionProvider, resolveCompanionResources, parseCompanionFilename } from '../src/public/index.js';
import { allocateContinuationPath, allocateDirectoryArtifactPath } from '../src/transitions/record.transitions.js';
import { normalizeParentReference } from '../src/tooling/portable/adapters/cli/cli.common-author.js';
import {
 normalizePackageParentWorkspaceAliases,
 normalizePackageParentWorkspaceSelection,
 packageParentWorkspaceSupersededByCurrent,
 preparePackageParentWorkspaceReuse,
 selectDeclaredPackageParentWorkspaceBindings
} from '../src/tooling/portable/adapters/node/handoff.manufacture.packageParent.js';
import { resolveWorkspaceRequirementMaterials } from '../src/tooling/portable/adapters/node/handoff.manufacture.requirements.js';
import { expandRouteParentBoundaryClosure } from '../src/tooling/portable/adapters/node/handoff.manufacture.scope.js';
import { renderRecipientV2ExternalPayload } from '../src/tooling/portable/handoff/recipientV2.artifacts.js';
import { deriveVisibleFacts } from '../src/tooling/portable/handoff/recipientV2.packageV1.inspect.helpers.js';
const root = '# Continuity Context\n\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-08 10:00:00\n\n---\n\n# Root\n';
test('missing material is not promoted to a semantic root', () => {
 const data=projectApplicationData({workspaces:[{id:'w',records:[{path:'x.md',createdAt:'2026-09-08 10:00:00'}]}]});
 assert.equal(data.records[0].parent.state,'unresolved');
 assert.equal(Object.hasOwn(toPlaythingsStoryRecords(data)[0],'parentId'),false);
});
test('duplicate identity never silently selects last writer or enters story data', () => {
 const data=projectApplicationData({workspaces:[{id:'W',records:[{path:'root.md',markdown:root},{path:'root.md',markdown:root},{path:'child.md',markdown:root,parentRef:'root.md'}]}]});
 assert.equal(data.records.find(r => r.id === 'W::child.md').parent.state,'ambiguous');
 assert.equal(toPlaythingsStoryRecords(data).filter(r=>r.id==='W::root.md').length,0);
});
test('schema fallback follows declarations, reports cycles and never invents ancestry', () => {
 assert.deepEqual(projectSchemaAncestry('task',[{id:'task',parentSchemaId:'root'},{id:'root',parentSchemaId:null}]).lineage,['task','root']);
 assert.equal(projectSchemaAncestry('task',[]).status,'unresolved');
 assert.equal(projectSchemaAncestry('a',[{id:'a',parentSchemaId:'b'},{id:'b',parentSchemaId:'a'}]).status,'cycle');
});
test('dotted artifact stems do not change companion namespace',()=>{
 assert.equal(parseCompanionFilename('tiinex.task.v1.playthings.portrait.png').ownerStem,'tiinex.task.v1');
 assert.equal(parseCompanionFilename('tiinex.task.v1.playthings.portrait.png').namespace,'playthings');
});
test('provider path traversal and unknown owner kinds fail closed',()=>{
 for (const path of ['../x.png','/x.png','C:/x.png']) assert.throws(()=>defineCompanionProvider({id:'p',resources:[{namespace:'p',slot:'x',owner:{kind:'root'},path}]}));
 assert.throws(()=>defineCompanionProvider({id:'p',resources:[{namespace:'p',slot:'x',owner:{kind:'mystery'},path:'x.png'}]}));
});
test('keyed append is stable across registration order and overrides only matching keys',()=>{
 const make=(id,layer,key,path)=>defineCompanionProvider({id,layer,resources:[{key,namespace:'p',slot:'props',owner:{kind:'root'},path}]});
 const providers=[make('app','app','chair','chair.png'),make('site','site','chair','custom-chair.png'),make('verse','verse','desk','desk.png')];
 const query={namespace:'p',slot:'props',owner:{kind:'root'},cardinality:'multiple'};
 const a=resolveCompanionResources({providers,query}); const b=resolveCompanionResources({providers:[...providers].reverse(),query});
 assert.equal(a.status,'resolved');assert.deepEqual(a.resources.map(x=>x.path),['custom-chair.png','desk.png']);assert.deepEqual(a,b);
});


test('directory-local continuation allocation does not import Parent filename lineage across directories',()=>{
 const result=allocateContinuationPath({parentRecord:{path:'.topics/example/001-alpha.trace.md'},targetId:'tiinex.task.v1',targetLabel:'Task',title:'First Subarea Task'},{targetDirectory:'.topics/example/subarea',existingPaths:['.topics/example/001-alpha.trace.md']});
 assert.equal(result.path,'.topics/example/subarea/001-first-subarea-task.trace.md');
 assert.equal(result.policy.kind,'directory-local-continuation');
});

test('directory-local allocation advances only from the target directory namespace',()=>{
 const result=allocateContinuationPath({parentRecord:{path:'.topics/example/009-parent.trace.md'},targetId:'tiinex.task.v1',targetLabel:'Task',title:'Next Local Task'},{targetDirectory:'.topics/example/subarea',existingPaths:['.topics/example/009-parent.trace.md','.topics/other/099-unrelated.trace.md','.topics/example/subarea/001-existing.trace.md']});
 assert.equal(result.path,'.topics/example/subarea/002-next-local-task.trace.md');
});

test('same-directory continuation retains local child progression',()=>{
 const result=allocateContinuationPath({parentRecord:{path:'.topics/example/001-alpha.trace.md'},targetId:'tiinex.task.v1',targetLabel:'Task',title:'Child'},{existingPaths:['.topics/example/001-alpha.trace.md','.topics/example/001-1-existing-child.trace.md']});
 assert.equal(result.path,'.topics/example/001-2-child.trace.md');
 assert.equal(result.policy.kind,'same-parent-directory');
});

test('standalone directory allocation is isolated from sibling directories',()=>{
 const result=allocateDirectoryArtifactPath({targetDirectory:'.topics/example/subarea',targetId:'tiinex.task.v1',targetLabel:'Task',title:'Local Root'},{existingPaths:['.topics/example/007-parent.trace.md','.topics/another/033-other.trace.md']});
 assert.equal(result.path,'.topics/example/subarea/001-local-root.trace.md');
 assert.equal(result.policy.allocationAuthority,'target-directory-local-namespace');
});


test('Workspace-qualified Parent references remain addresses, not local path allocation authority',()=>{
 assert.equal(normalizeParentReference('business::.topics/initiatives/001-task.trace.md'),'business::.topics/initiatives/001-task.trace.md');
 assert.equal(normalizeParentReference('../business/.topics/001.trace.md'),'');
 assert.equal(normalizeParentReference('business::../001.trace.md'),'');
});


test('explicit package-parent Workspace aliases supersede renamed predecessor ids without treating carrier lineage as source authority',()=>{
 const aliases=normalizePackageParentWorkspaceAliases({playthings:'verse-playthings'});
 assert.equal(packageParentWorkspaceSupersededByCurrent('playthings',new Set(['verse-playthings']),aliases),true);
 assert.equal(packageParentWorkspaceSupersededByCurrent('docs',new Set(['verse-playthings']),aliases),false);
 assert.throws(()=>normalizePackageParentWorkspaceAliases({playthings:'verse-playthings',legacy:'verse-playthings'}),/duplicate-target/);
});

test('package-parent carrier lineage does not implicitly select parent Workspace source',()=>{
 const reuse=preparePackageParentWorkspaceReuse({bundle:{files:[{path:'opaque-parent-carrier'}]},currentWorkspaceIds:['core']});
 assert.equal(reuse.state,'not-requested');
 assert.equal(reuse.selectionMode,'none');
 assert.deepEqual(reuse.inherited,[]);
 assert.deepEqual(reuse.requestedWorkspaceIds,[]);
});

test('package-parent Workspace reuse requires exact explicit ids or all',()=>{
 const declared=[{workspaceId:'business'},{workspaceId:'docs'},{workspaceId:'extension-vscode'}];
 const exact=normalizePackageParentWorkspaceSelection(['docs','business','docs']);
 assert.equal(exact.mode,'explicit');
 assert.deepEqual(exact.ids,['business','docs']);
 assert.deepEqual(selectDeclaredPackageParentWorkspaceBindings(declared,exact).map((item)=>item.workspaceId),['business','docs']);
 const all=normalizePackageParentWorkspaceSelection('all');
 assert.equal(all.mode,'all');
 assert.deepEqual(selectDeclaredPackageParentWorkspaceBindings(declared,all).map((item)=>item.workspaceId),['business','docs','extension-vscode']);
 assert.throws(()=>selectDeclaredPackageParentWorkspaceBindings(declared,normalizePackageParentWorkspaceSelection('missing')),/workspace-selection\.unresolved:missing/);
});

test('qualified package-parent Workspace providers supply exact requirement bytes without local-root provenance',async()=>{
 const data=new TextEncoder().encode('# Loom Role\n');
 const workspaceRuntimeById=new Map([['business',{
  id:'business',root:'',provider:'qualified-package-parent-workspace-material-provider',enumeration:{
   evidence:{entriesFingerprint:'provider-fingerprint'},
   materialization:{source:{parentPackagePath:'/received/handoff.zip',parentPackageSha256:'parent-sha',parentWorkspaceArchivePath:'001-3-business.workspace.zip'},entries:[{path:'.topics/roles/001-3-loom-role.trace.md',data,bytes:data.byteLength,sha256:'role-sha',mediaType:'text/markdown'}]}
  }
 }]]);
 const requirements={required:[],reference:[],participantRoles:[],dependencies:[],endpointRoles:[{
  id:'endpoint-role:from',name:'From Role',routeWorkspaceId:'core',routePath:'.topics/handoffs/return.trace.md',targetWorkspaceId:'business',targetPath:'.topics/roles/001-3-loom-role.trace.md',reference:{target:'business::.topics/roles/001-3-loom-role.trace.md'}
 }]};
 const materials=await resolveWorkspaceRequirementMaterials(requirements,workspaceRuntimeById,{});
 assert.equal(materials.length,1);
 assert.equal(materials[0].providerKind,'qualified-package-parent-workspace');
 assert.equal(materials[0].providerId,'package-parent-workspace-enumerator');
 assert.equal(materials[0].provenance.workspaceId,'business');
 assert.equal(materials[0].provenance.parentPackageSha256,'parent-sha');
 assert.equal(materials[0].authority.packageParentWorkspaceQualified,true);
});

test('selected route Parent continuity crosses into provider-only Workspaces as detached exact dependencies',()=>{
 const routePath='.topics/handoffs/return.trace.md';
 const routeMarkdown=`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.task.v1\n  - Created At: 2026-09-09 10:00:00\n  - Trace: [Business Parent](business::.topics/initiatives/parent.trace.md)\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-09-09 11:00:00\n\n---\n\n# Return\n`;
 const parentMarkdown=root;
 const bytes=(text)=>new TextEncoder().encode(text);
 const entry=(path,text)=>({path,data:bytes(text),bytes:bytes(text).byteLength,sha256:`sha:${path}`,mediaType:'text/markdown'});
 const enumeration=(entries,source={})=>({evidence:{entriesFingerprint:'fp'},materialization:{state:'complete',source,entries}});
 const workspaceRuntimeById=new Map([
  ['core',{id:'core',root:'/core',enumeration:enumeration([entry(routePath,routeMarkdown)])}],
  ['business',{id:'business',root:'',provider:'qualified-package-parent-workspace-material-provider',enumeration:enumeration([entry('.topics/initiatives/parent.trace.md',parentMarkdown)],{parentPackageSha256:'parent-sha'})}]
 ]);
 const result=expandRouteParentBoundaryClosure({requirements:{dependencies:[],counts:{}},materials:[],workspaceRuntimeById,workspaceMaterializations:[{id:'core',state:'complete'}],routeSpecs:[{workspaceId:'core',path:routePath}]});
 assert.equal(result.requirements.dependencies.length,1);
 assert.equal(result.requirements.dependencies[0].routeWorkspaceId,'core');
 assert.equal(result.requirements.dependencies[0].routePath,routePath);
 assert.equal(result.requirements.dependencies[0].targetWorkspaceId,'business');
 assert.equal(result.materials.length,1);
 assert.equal(result.materials[0].providerKind,'qualified-package-parent-workspace');
 assert.equal(result.materials[0].provenance.parentPackageSha256,'parent-sha');
});

test('package-v1 cache serialization preserves exact Parent-boundary Workspace coordinates and byte identity',()=>{
 const material={requirementId:'parent-boundary:core:business-parent',classification:'parent-boundary',referenceTarget:'business::.topics/initiatives/parent.trace.md',routeWorkspaceId:'core',routePath:'.topics/handoffs/return.trace.md',sourceWorkspaceId:'core',sourcePath:'.topics/001-extraction-task.trace.md',targetWorkspaceId:'business',targetPath:'.topics/initiatives/parent.trace.md',originalPath:'.topics/initiatives/parent.trace.md',archiveEntry:'material/1-parent-boundary.bin',bytes:123,sha256:'a'.repeat(64)};
 const markdown=renderRecipientV2ExternalPayload({createdAt:'2026-09-09 11:00:00',title:'Workspace Dependency Cache — core',summary:'Exact route-bounded dependency bytes.',label:'core Handoff dependency cache',role:'workspace-scoped Handoff dependency cache',location:'001-3-1-cache.zip',bytes:456,sha256:'b'.repeat(64),materials:[material]});
 const facts=deriveVisibleFacts({markdown,schemaId:'tiinex.external.payload.v1',packageContract:{workspaces:[]},index:new Map()});
 assert.equal(facts.materials.length,1);
 assert.deepEqual(facts.materials[0],material);
});
