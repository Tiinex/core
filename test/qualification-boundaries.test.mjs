import test from 'node:test';
import assert from 'node:assert/strict';
import { projectApplicationData, toPlaythingsStoryRecords, projectSchemaAncestry, defineCompanionProvider, resolveCompanionResources, parseCompanionFilename } from '../src/public/index.js';
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
