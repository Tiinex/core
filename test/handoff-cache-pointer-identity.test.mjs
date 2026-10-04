import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveHandoffPackageV1CachePointerMaterial } from '../src/tooling/portable/handoff/handoffPackageV1.manufacture.js';

const shared='../001-processes.trace.md';
const cache=Object.freeze({materials:Object.freeze([
  Object.freeze({requirementId:'native-parent',referenceTarget:shared,archiveEntry:'native/native/.topics/.processes/001-processes.trace.md'}),
  Object.freeze({requirementId:'openai-parent',referenceTarget:shared,archiveEntry:'native/interop-openai/.topics/.processes/001-processes.trace.md'})
])});

test('cache pointer material prefers exact requirement identity over ambiguous shared relative reference text',()=>{
  const native=resolveHandoffPackageV1CachePointerMaterial(cache,{id:'native-parent',reference:{target:shared}});
  const openai=resolveHandoffPackageV1CachePointerMaterial(cache,{id:'openai-parent',reference:{target:shared}});
  assert.equal(native.state,'qualified-exact-requirement');
  assert.equal(openai.state,'qualified-exact-requirement');
  assert.notEqual(native.material.archiveEntry,openai.material.archiveEntry);
});

test('cache pointer reference fallback fails closed when relative reference text is ambiguous',()=>{
  const result=resolveHandoffPackageV1CachePointerMaterial(cache,{id:'unknown-parent',reference:{target:shared}});
  assert.equal(result.state,'ambiguous');
  assert.equal(result.material,null);
  assert.equal(result.matches,2);
});
