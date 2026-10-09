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
  assert.match(result.markdown,/Exact clipboard text/);
  assert.match(result.markdown,/001-3-1-2-sigma-handoff-pointer\.trace\.md/);
  assert.equal(result.targetSource,null);assert.equal(result.clipboardStatus,'not-performed');
});
test('pointerless Workspace has Start but never a fabricated recipient or Continue From',()=>{
 const result=projectPortableTransportCompletion({inspection:pointerless});
 assert.equal(result.status,'ready');assert.equal(result.carrier.routeId,'');
 assert.match(result.clipboardText,/pointerless Workspace carrier/);
 assert.doesNotMatch(result.clipboardText,/Continue from/);
 assert.match(result.markdown,/Recipient: Not declared/);
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
 assert.match(selected.markdown,/Referenced material is context, not an activated Process/);
 assert.match(selected.clipboardText,/Target intent: VS Code \/ Copilot/);
 assert.equal(selected.carrier.routeId,'');
 assert.ok(selected.clipboardText.startsWith(selected.canonicalTransportText.trimEnd()));
});
