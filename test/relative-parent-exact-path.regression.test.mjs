import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
import { resolveLineage } from '../src/lineage/lineage.resolve.js';
import { inspectPortableLineageIntegrity } from '../src/tooling/portable/lineage/lineage.integrity.plan.js';
import { projectPortableEditorAssistance } from '../src/tooling/portable/editor/editor.assistance.js';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../src/integrity/integrity.c14nV2.js';

const business = '/mnt/data/current-diagnostic-probe/business';
function files(folder){return readdirSync(folder,{withFileTypes:true}).flatMap(item => item.isDirectory() ? files(path.join(folder,item.name)) : item.isFile() && item.name.endsWith('.trace.md') ? [path.join(folder,item.name)] : []);}
function sourceRecords(){return files(path.join(business,'.topics')).map(file=>({ path:path.relative(business,file).split(path.sep).join('/'), markdown:readFileSync(file,'utf8') }));}
const childPath = '.topics/initiatives/001-2-1-public-challenge-closure-and-bounty-decision-task.trace.md';
const realParent = '001-2-public-trust-contribution-governance-task.trace.md';
const wrongParent = '001-2-2-public-trust-contribution-governance-task.trace.md';
function modifyChild(records, change, reseal=false){return records.map(r=>r.path===childPath ? {...r,markdown:reseal?sealC14nV2Self(change(r.markdown)).markdown:change(r.markdown)}:r);}
function inspect(records){const result=inspectPortableLineageIntegrity({records});const artifact=result.artifacts.find(a=>a.path===childPath);assert.ok(artifact);return {result,artifact};}

test('an existing relative Parent path resolves to exactly its intended local file',()=>{
 const {artifact}=inspect(sourceRecords());
 assert.equal(artifact.parentAvailability.state,'resolved');
 assert.equal(artifact.exactParent.path,'.topics/initiatives/'+realParent);
});

test('a missing relative Parent cannot be laundered by a matching known checksum or Origin',()=>{
 const records=modifyChild(sourceRecords(),md=>md.replaceAll(realParent,wrongParent));
 const {result,artifact}=inspect(records);
 assert.equal(artifact.state,'parent-unresolved');
 assert.equal(artifact.parentAvailability.state,'unresolved');
 assert.equal(artifact.exactParent.path,'');
 assert.equal(resolveLineage(records).edges.some(e=>e.kind==='parent' && e.to===childPath && e.from),false);
 assert.ok(result.lineage.findings.some(f=>f.code==='lineage.parent.exactTargetNotLoaded' && f.nodeId===childPath));
});

test('even a freshly sealed forged child cannot turn the missing Parent into healthy lineage',()=>{
 const records=modifyChild(sourceRecords(),md=>md.replaceAll(realParent,wrongParent),true);
 const {artifact}=inspect(records);
 assert.equal(artifact.childSelf.state,'verified');
 assert.equal(artifact.state,'parent-unresolved');
 assert.equal(artifact.parentAvailability.state,'unresolved');
});

test('a wrong checksum on the correctly referenced local Parent is a mismatch, never another digest-selected parent',()=>{
 const records=modifyChild(sourceRecords(),md=>md.replace(/(  - Value: )[^\n]+/, '$1not-the-actual-digest'));
 const {artifact}=inspect(records);
 assert.equal(artifact.parentAvailability.state,'resolved');
 assert.equal(artifact.exactParent.path,'.topics/initiatives/'+realParent);
 assert.equal(artifact.state,'parent-target-mismatch');
});


test('editor reports parent-unresolved on the Trace and leaves Locate Parent selection to the operator',()=>{
 const records=modifyChild(sourceRecords(),md=>md.replaceAll(realParent,wrongParent),true);
 const result=projectPortableEditorAssistance({ records, focusPath:childPath });
 const document=result.documents[0];
 assert.ok(document.diagnostics.some(d=>d.code==='portable.lineage-integrity.parent-unresolved'), 'diagnostic must be present for VS Code Quick Fix');
 assert.equal(document.parentRepairAvailability?.reason,'parent-not-resolved');
 assert.equal(document.actions.some(a=>a.id==='refresh-parent-integrity-and-self-seal'),false,'must not offer wrong-parent digest refresh');
});
