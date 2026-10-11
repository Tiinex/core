import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectOperatorTargetGuide } from '../src/tooling/portable/handoff/operatorTargetGuide.js';
import { projectPortableTransportCompletion } from '../src/tooling/portable/handoff/transportCompletion.js';

const entryPath = '.topics/.entries/where/chatgpt-web/001-chatgpt-web-target-entry.trace.md';
const guidePath = '.topics/.entries/where/chatgpt-web/001-chatgpt-web-target-instructions.trace.md';
const continuationPath = '.topics/.entries/where/chatgpt-web/001-1-chatgpt-web-target-instructions.trace.md';
const entry = readFileSync(new URL('./fixtures/chatgpt-web-target.fixture.trace.md', import.meta.url));
const guide = readFileSync(new URL('./fixtures/chatgpt-web-operator-instructions.fixture.trace.md', import.meta.url));
const continuation = readFileSync(new URL('./fixtures/chatgpt-web-operator-instructions-continuation.fixture.trace.md', import.meta.url));
const ws = (entries) => ({ workspaceId: 'interop-openai', archive: { state: 'qualified', entries } });
const target = { sourceKind: 'carried', workspaceId: 'interop-openai', artifactPath: entryPath,
  canonicalIdentifier: 'tiinex.interop.openai.entry.target.chatgpt-web.v1' };
const fixture = { status: 'valid', findings: [], workspaces: [ws([{ path: entryPath, data: entry }, { path: guidePath, data: guide }, { path: continuationPath, data: continuation }])],
  carrierProjection: { status: 'ready', mode: 'handoff', routes: [{id: 'route:operator',state:'qualified',workspaceId:'native',pointerPath:'001-3-1-1-1-handoff-pointer.trace.md',from:'Anchor',to:'Sigma'}],startPath:'001-1-READ-BEFORE-PROCEEDING.trace.md',lineage:{prefix:'tiinex',dimension:'033-1-1'} } };
const selected = { inspection: fixture, route: 'route:operator', target: 'ChatGPT Web' };

test('exact carried target identity projects one operator-only human guide, with verified integrity', () => {
 const actual = projectOperatorTargetGuide({ inspection: fixture, targetDefinition: target });
 assert.equal(actual.status, 'ready', actual.reasonCode);
 assert.equal(actual.state, 'operator-only');
 assert.equal(actual.targetIdentifier, target.canonicalIdentifier);
 assert.match(actual.markdown, /Send your package — manually/);
 assert.match(actual.markdown, /Already continuing an existing conversation?/);
 assert.match(actual.markdown, /OpenAI Terms of Use/);
 assert.equal(actual.artifactPath, continuationPath);
 assert.match(actual.markdown, /Name your project:/);
});

test('selection adds readable guide to CLI/VS Code receipt, never to recipient clipboard', () => {
 const withGuide = projectPortableTransportCompletion(selected);
 const noGuide = projectPortableTransportCompletion({ ...selected, inspection: {...fixture,workspaces:[ws([{path:entryPath,data:entry}])]} });
 assert.equal(withGuide.status,'ready',withGuide.reasonCode);
 assert.equal(noGuide.status,'ready',noGuide.reasonCode);
 assert.equal(withGuide.clipboardText,noGuide.clipboardText);
 assert.equal(withGuide.canonicalTransportText,noGuide.canonicalTransportText);
 assert.equal(withGuide.carrier.selectedRoute.parties.to,'Sigma');
 assert.equal(withGuide.operatorGuide.status,'ready');
 assert.match(withGuide.markdown,/Get ready/);
 assert.match(withGuide.markdown,/Suggested project title:.*tiinex-033 \(Sigma\)/);
 assert.match(withGuide.markdown,/Exact text to paste into the chat/);
 assert.doesNotMatch(withGuide.clipboardText,/Suggested project title|Get ready|Your privacy choices/);
 assert.match(withGuide.markdown,/Send your package — manually/);
 assert.doesNotMatch(withGuide.clipboardText,/Send your package — manually|Improve the model for everyone|Privacy Policy/);
 assert.doesNotMatch(noGuide.markdown,/Send your package — manually/);
 const generic=projectPortableTransportCompletion({inspection:fixture,route:'route:operator'});
 assert.equal(generic.status,'ready');
 assert.equal(generic.operatorGuide,null);
 assert.doesNotMatch(generic.markdown,/Starting a new ChatGPT project?/);
});

test('annotation continuity selects one exact verified terminal descendant; bad siblings and corrupt children fail closed',()=>{
 const options=[
  {label:'duplicate sibling',entries:[{path:guidePath,data:guide},{path:continuationPath,data:continuation},{path:continuationPath.replace('.trace.md','-copy.trace.md'),data:continuation}],reason:'ambiguous-companions'},
  {label:'tampered descendant',entries:[{path:guidePath,data:guide},{path:continuationPath,data:Buffer.from(continuation.toString().replace('Send your package — manually','Send immediately'))}],reason:'self-integrity-unverified'},
  {label:'moved',entries:[{path:continuationPath.replace('/chatgpt-web/','/different-folder/'),data:continuation}],reason:'not-declared'},
  {label:'different target',entries:[{path:continuationPath,data:Buffer.from(continuation.toString().replace('Target Identifier: tiinex.interop.openai.entry.target.chatgpt-web.v1','Target Identifier: other.entry'))}],reason:'not-declared'},
  {label:'missing parent',entries:[{path:continuationPath,data:continuation}],reason:'annotation-parent-unqualified'}
 ];
 const baseline=projectPortableTransportCompletion(selected).clipboardText;
 for (const opt of options) {
   const inspection={...fixture,workspaces:[ws([{path:entryPath,data:entry},...opt.entries]) ]};
   const result=projectOperatorTargetGuide({inspection,targetDefinition:target});
   assert.equal(result.status,'unavailable',opt.label);
   assert.equal(result.reasonCode,opt.reason,opt.label);
   const receipt=projectPortableTransportCompletion({...selected,inspection});
   assert.equal(receipt.status,'ready',opt.label);
   assert.equal(receipt.clipboardText,baseline,opt.label);
   assert.doesNotMatch(receipt.markdown,/Starting a new ChatGPT project\?/,opt.label);
 }
});

test('operator-only discovery is not an Entry-family fallback, role or Process activation',()=>{
 const wrong={...target, canonicalIdentifier:'unknown.elsewhere'};
 assert.equal(projectOperatorTargetGuide({inspection:fixture,targetDefinition:wrong}).reasonCode,'not-declared');
 assert.equal(projectOperatorTargetGuide({inspection:fixture,targetDefinition:{...target,sourceKind:'external'}}).reasonCode,'no-carried-target-identity');
 const badArchive={...fixture,workspaces:[ws([{path:entryPath,data:entry},{path:guidePath,data:guide}]) ]};
 badArchive.workspaces[0].archive.state='unqualified';
 assert.equal(projectOperatorTargetGuide({inspection:badArchive,targetDefinition:target}).reasonCode,'workspace-unqualified');
});
