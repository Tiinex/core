import test from 'node:test';
import assert from 'node:assert/strict';
import { defineCompanionProvider, resolveCompanionResources, companionProviderFromWorkspace } from '../src/public/index.js';

const app = defineCompanionProvider({ id: 'app', layer: 'app', resources: [
  { namespace: 'playthings', slot: 'portrait', owner: { kind: 'root' }, path: 'app/default.playthings.portrait.png' },
  { namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.root.v1' }, path: 'app/root.playthings.portrait.png' }
] });
const verse = defineCompanionProvider({ id: 'playthings', layer: 'verse', resources: [
  { namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, path: 'src/schemas/core/task/tiinex.task.v1.playthings.portrait.png' },
  { namespace: 'playthings', slot: 'props', cardinality: 'multiple', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, path: 'src/schemas/core/task/a.playthings.props.png' }
] });
const site = defineCompanionProvider({ id: 'site', layer: 'site', resources: [
  { namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, path: 'src/schemas/core/task/site.playthings.portrait.png' },
  { namespace: 'playthings', slot: 'props', cardinality: 'multiple', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, path: 'src/schemas/core/task/site.playthings.props.png' }
] });

test('specificity resolves before provider precedence', () => {
  const result = resolveCompanionResources({ providers: [app, verse], query: { namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, schemaLineage: ['tiinex.task.v1', 'tiinex.root.v1'] } });
  assert.equal(result.status, 'resolved');
  assert.equal(result.resources[0].providerId, 'playthings');
});

test('same specificity uses deployment override precedence', () => {
  const result = resolveCompanionResources({ providers: [verse, site], query: { namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, schemaLineage: ['tiinex.task.v1', 'tiinex.root.v1'] } });
  assert.equal(result.resources[0].providerId, 'site');
});

test('collection slots append distinct resource keys across provider layers', () => {
  const result = resolveCompanionResources({ providers: [verse, site], query: { namespace: 'playthings', slot: 'props', cardinality: 'multiple', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, schemaLineage: ['tiinex.task.v1'] } });
  assert.equal(result.status, 'resolved');
  assert.equal(result.resources.length, 2);
  assert.deepEqual(new Set(result.resources.map(r => r.providerId)), new Set(['site', 'playthings']));
});

test('equal single-value conflicts fail closed', () => {
  const a = defineCompanionProvider({ id: 'a', layer: 'verse', resources: [{ namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, path: 'a.png' }] });
  const b = defineCompanionProvider({ id: 'b', layer: 'verse', resources: [{ namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, path: 'b.png' }] });
  const result = resolveCompanionResources({ providers: [a, b], query: { namespace: 'playthings', slot: 'portrait', owner: { kind: 'schema', schemaId: 'tiinex.task.v1' }, schemaLineage: ['tiinex.task.v1'] } });
  assert.equal(result.status, 'ambiguous');
  assert.equal(result.resources.length, 0);
});

test('workspace artifact-local companion outranks schema defaults', () => {
  const workspaceResult = companionProviderFromWorkspace({ id: 'w', records: [{ path: '.topics/.relations/r1.trace.md' }], assets: [{ path: '.topics/.relations/r1.playthings.portrait.png' }] });
  const result = resolveCompanionResources({ providers: [app, verse, workspaceResult.provider], query: { namespace: 'playthings', slot: 'portrait', owner: { kind: 'artifact', workspaceId: 'w', artifactPath: '.topics/.relations/r1.trace.md' }, schemaLineage: ['tiinex.relation.v1', 'tiinex.root.v1'] } });
  assert.equal(result.status, 'resolved');
  assert.equal(result.resources[0].providerId, 'workspace:w');
});
