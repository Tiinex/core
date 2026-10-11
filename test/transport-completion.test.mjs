import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableTransportCompletion } from '../src/tooling/portable/handoff/transportCompletion.js';
import { projectHandoffCarrierOutputFromPackage } from '../src/tooling/portable/handoff/carrierProjection.js';
import { nativeEntryContentSource } from './helpers/native-entry-fixtures.mjs';
import { readFileSync } from 'node:fs';

const start = '001-1-READ-BEFORE-PROCEEDING.trace.md';
const routes = [
  { id:'route:anchor', routeId:'route:anchor', state:'qualified', pointerPath:'001-3-1-1-anchor-handoff-pointer.trace.md', workspaceId:'core', workspaceRelativeHandoffPath:'.topics/work/anchor.trace.md', from:'Anchor', to:'Anchor' },
  { id:'route:sigma', routeId:'route:sigma', state:'qualified', pointerPath:'001-3-1-2-sigma-handoff-pointer.trace.md', workspaceId:'vscode', workspaceRelativeHandoffPath:'.topics/work/sigma.trace.md', from:'Anchor', to:'Sigma' }
];
const routed = { status:'valid', findings:[], carrierProjection:{ status:'ready', mode:'handoff', routes, startPath:start, lineage:{prefix:'tiinex',dimension:'001-2'} }, workspaces:[] };
const pointerless = { status:'valid', findings:[], carrierProjection:{ status:'ready', mode:'workspace', routes:[], startPath:start, lineage:{prefix:'tiinex',dimension:'001-3'} }, workspaces:[] };
const caller = { inspection:routed };

test('multi-route carrier never silently chooses one recipient', () => {
  const result=projectPortableTransportCompletion(caller);
  assert.equal(result.status,'blocked'); assert.equal(result.reasonCode,'route-selection-required');
  assert.equal(result.routes.length,2); assert.deepEqual(result.routes.map(x=>x.recipient),['Anchor','Sigma']);
  assert.equal(result.clipboardText,undefined);
});
test('exact route produces byte-identical canonical transport text and unmodified filename', () => {
  const input={...caller,route:'route:sigma'};
  const source=projectHandoffCarrierOutputFromPackage(input);
  const result=projectPortableTransportCompletion(input);
  assert.equal(result.status,'ready'); assert.equal(result.clipboardText,source.normalInlineRouting.content);
  assert.equal(result.canonicalTransportText,source.normalInlineRouting.content);
  assert.equal(result.carrier.filename,source.primary.filename);
  assert.equal(result.carrier.selectedRoute.parties.to,'Sigma');
  assert.match(result.markdown,/Exact text to paste into the chat/);
  assert.match(result.markdown,/001-3-1-2-sigma-handoff-pointer\.trace\.md/);
  assert.equal(result.targetSource,null);assert.equal(result.clipboardStatus,'not-performed');
});
test('pointerless Workspace has Start but never a fabricated recipient or Continue From',()=>{
 const result=projectPortableTransportCompletion({inspection:pointerless});
 assert.equal(result.status,'ready');assert.equal(result.carrier.routeId,'');
 assert.match(result.clipboardText,/pointerless Workspace carrier/);
 assert.doesNotMatch(result.clipboardText,/Continue from/);
 assert.match(result.markdown,/Send to:.*receiving conversation you choose/);
});
test('qualified purpose Entry can augment exact shell without new authority',()=>{
 const result=projectPortableTransportCompletion({inspection:pointerless,entryId:'START',contentSources:[nativeEntryContentSource()]});
 assert.equal(result.status,'ready',result.reasonCode);
 assert.ok(result.clipboardText.startsWith(result.canonicalTransportText.trimEnd()));
 assert.match(result.clipboardText,/Entry intent: Start/);
 assert.equal(result.targetSource,null);
});
test('unsupported Target, missing purpose, forged carrier name, invalid carrier are fail-closed',()=>{
 assert.equal(projectPortableTransportCompletion({inspection:pointerless,target:'unknown'}).reasonCode,'target-requires-purpose-entry');
 assert.equal(projectPortableTransportCompletion({inspection:pointerless,entryId:'START',target:'unknown',contentSources:[nativeEntryContentSource()]}).status,'blocked');
 assert.equal(projectPortableTransportCompletion({inspection:pointerless,filename:'renamed.zip'}).reasonCode,'carrier-filename-invalid');
 assert.equal(projectPortableTransportCompletion({inspection:{status:'invalid',findings:[]}}).reasonCode,'carrier-invalid');
});

test('current qualified VS Code Target Entry projects exact source and bounded host steps only on explicit selection',()=>{
 // Frozen source-qualified host fixture: test-only bytes, never a second active Entry.
 const data=readFileSync(new URL('./fixtures/vscode-copilot-target.fixture.trace.md', import.meta.url));
 const inspection={...pointerless,workspaces:[{workspaceId:'vscode',archive:{state:'qualified',entries:[{path:'.topics/.entries/where/vscode-copilot/001-vs-code-copilot-execution-target.trace.md',data}]}}]};
 const base={inspection,contentSources:[nativeEntryContentSource()],entryId:'START'};
 const generic=projectPortableTransportCompletion(base);
 assert.equal(generic.status,'ready'); assert.doesNotMatch(generic.markdown,/attach the unchanged ZIP to the intended Copilot chat/i);
 const selected=projectPortableTransportCompletion({...base,target:'VS Code / Copilot'});
 assert.equal(selected.status,'ready',selected.reasonCode);
 assert.equal(selected.targetSource.canonicalIdentifier,'tiinex.host.vscode.copilot.target.v1');
 assert.match(selected.markdown,/attach the unchanged ZIP to the intended Copilot chat/i);
 assert.match(selected.markdown,/Linked material is supporting context, not an activated procedure/);
 assert.match(selected.clipboardText,/Target intent: VS Code \/ Copilot/);
 assert.equal(selected.carrier.routeId,'');
 assert.ok(selected.clipboardText.startsWith(selected.canonicalTransportText.trimEnd()));
});


test('formal qualified Handoff Pointer composes WHERE-only Target without inventing WHAT or parties', () => {
 const data=readFileSync(new URL('./fixtures/chatgpt-web-target.fixture.trace.md', import.meta.url));
 const inspection={...routed,workspaces:[{workspaceId:'interop-openai',archive:{state:'qualified',entries:[{path:'.topics/.entries/where/chatgpt-web/001-chatgpt-web-target-entry.trace.md',data}]}}]};
 const canonical=projectPortableTransportCompletion({inspection,route:'route:sigma'});
 const output=projectPortableTransportCompletion({inspection,route:'route:sigma',target:'ChatGPT Web'});
 assert.equal(output.status,'ready',output.reasonCode);
 assert.equal(output.carrier.routeId,canonical.carrier.routeId);
 assert.equal(output.carrier.selectedRoute.parties.to,'Sigma');
 assert.equal(output.canonicalTransportText,canonical.clipboardText);
 assert.ok(output.clipboardText.startsWith(canonical.clipboardText.trimEnd()));
 assert.match(output.clipboardText,/Target intent: ChatGPT Web/);
 assert.doesNotMatch(output.clipboardText,/Entry intent:/);
 assert.match(output.markdown,/Purpose: Defined by the Handoff Pointer/);
 assert.equal(output.entryId,'');
 assert.equal(output.targetSource.canonicalIdentifier,'tiinex.interop.openai.entry.target.chatgpt-web.v1');
 assert.equal(projectPortableTransportCompletion({inspection,route:'route:sigma',target:'not-real'}).status,'blocked');
 assert.equal(projectPortableTransportCompletion({inspection,target:'ChatGPT Web'}).status,'blocked', 'ambiguous multi-route carrier is not implied');
 assert.equal(projectPortableTransportCompletion({inspection:pointerless,target:'ChatGPT Web'}).reasonCode,'target-requires-purpose-entry');
});

test('a Target requiring a separate purpose Entry remains blocked on formal Where-only route', () => {
 const data=readFileSync(new URL('./fixtures/vscode-copilot-target.fixture.trace.md', import.meta.url));
 const inspection={...routed,workspaces:[{workspaceId:'vscode',archive:{state:'qualified',entries:[{path:'.topics/.entries/where/vscode-copilot/001-vs-code-copilot-execution-target.trace.md',data}]}}]};
 const output=projectPortableTransportCompletion({inspection,route:'route:sigma',target:'VS Code / Copilot'});
 assert.equal(output.status,'blocked');
 assert.equal(output.reasonCode,'entry-target-entry-requires-purpose-entry');
});

test('explicit independent Guided Entry over routed carrier selects no Handoff Pointer, including a single available route', () => {
  const base={inspection:routed,filename:'tiinex-033-1-anchor-to-sigma.handoff-package.zip',contentSources:[nativeEntryContentSource()],entryId:'EXPLORE',independentEntry:true};
  const independent=projectPortableTransportCompletion(base);
  assert.equal(independent.status,'ready',independent.reasonCode);
  assert.equal(independent.carrier.kind,'independent-entry');
  assert.equal(independent.carrier.routeId,'');
  assert.equal(independent.carrier.selectedRoute,null);
  assert.equal(independent.markdown.includes('**Send to:** Sigma'),false);
  assert.match(independent.clipboardText,/Independent Guided Entry/);
  assert.match(independent.clipboardText,/Entry intent: Explore/);
  assert.doesNotMatch(independent.clipboardText,/Continue from|001-3-1-2-sigma-handoff-pointer|001-3-1-1-anchor-handoff-pointer/);
  assert.equal(projectPortableTransportCompletion({...base,route:'route:sigma'}).reasonCode,'independent-entry-route-or-purpose-invalid');
  assert.equal(projectPortableTransportCompletion({...base,entryId:''}).reasonCode,'independent-entry-route-or-purpose-invalid');
  assert.equal(projectPortableTransportCompletion({...base,inspection:{...routed,carrierProjection:{...routed.carrierProjection,routes:[routes[1]]}}}).status,'ready');
  const routedSelection=projectPortableTransportCompletion({inspection:routed,route:'route:sigma'});
  assert.equal(routedSelection.status,'ready');
  assert.equal(routedSelection.carrier.selectedRoute.parties.to,'Sigma');
  assert.match(routedSelection.clipboardText,/001-3-1-2-sigma-handoff-pointer/);
});

test('independent Guided Entry uses the selected short Role Label for human project title, preserving the exact session Role identity', () => {
  const fullLabel = 'Anchor Role — Canonical Holder Cutover Continuation';
  const input = {
    inspection: routed,
    filename: 'tiinex-033-1-anchor-to-sigma.handoff-package.zip',
    contentSources: [nativeEntryContentSource()],
    entryId: 'EXPLORE', independentEntry: true,
    primaryRole: {
      label: fullLabel, authoringLabel: 'Anchor', workspaceId: 'business',
      path: '.topics/roles/anchor.trace.md',
      reference: `https://github.com/Tiinex/business/blob/${'a'.repeat(40)}/.topics/roles/anchor.trace.md`
    }
  };
  const selected = projectPortableTransportCompletion(input);
  assert.equal(selected.status, 'ready', selected.reasonCode);
  assert.match(selected.markdown, /\*\*Send to:\*\* Anchor\n/);
  assert.match(selected.markdown, /\*\*Suggested project title:\*\* `tiinex-033 \(Anchor\)`/);
  assert.match(selected.clipboardText, /Session Role: Anchor Role — Canonical Holder Cutover Continuation/);
  assert.doesNotMatch(selected.clipboardText, /Suggested project title|authoringLabel/);
  assert.equal(selected.carrier.routeId, '');
  const withoutAlias = projectPortableTransportCompletion({
    ...input, primaryRole: {...input.primaryRole, authoringLabel: undefined}
  });
  assert.equal(withoutAlias.status, 'ready', withoutAlias.reasonCode);
  assert.equal(selected.clipboardText, withoutAlias.clipboardText, 'preview alias must not change recipient transport');
  assert.equal(selected.canonicalTransportText, withoutAlias.canonicalTransportText);
  assert.doesNotMatch(withoutAlias.markdown, /\*\*Suggested project title:\*\*/);
  const formal = projectPortableTransportCompletion({inspection:routed,route:'route:sigma',filename:input.filename});
  assert.equal(formal.status, 'ready');
  assert.match(formal.markdown,/\*\*Suggested project title:\*\* `tiinex-033 \(Sigma\)`/);
});
