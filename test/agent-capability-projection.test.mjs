import test from 'node:test';
import assert from 'node:assert/strict';
import { listPortableOperations, runPortableOperation } from '../src/tooling/portable/operation.catalog.js';
import { projectPortableAgentCapabilities } from '../src/tooling/portable/agent.capabilities.js';

test('Core owns agent capability discovery without granting execution or Role authority', async () => {
  const catalog = listPortableOperations();
  const query = await runPortableOperation('inspect-agent-capabilities', { query: 'lineage' });
  assert.equal(query.status, 'ready');
  assert.equal(query.operation, 'inspect-agent-capabilities');
  assert.ok(query.totalMatching > 0);
  assert.ok(query.operations.every(x => x.hostExecution === 'not-qualified' && x.roleAuthorization === 'not-established'));
  assert.ok(query.operations.every(x => catalog.operations.some(d => d.name === x.id && d.safety === x.safety && d.inputSchema === x.inputSchemaId)));
  assert.equal(query.operations.length <= 50, true);
  const all = await runPortableOperation('inspect-agent-capabilities');
  assert.equal(all.truncated, all.totalMatching > 50);
  assert.deepEqual(all.operations.map(x=>x.id), [...all.operations.map(x=>x.id)].sort((a,b)=>a.localeCompare(b)));
});
test('agent discovery rejects excessive inputs without authority escalation',()=>{
  assert.equal(projectPortableAgentCapabilities([{name:'unsafe',safety:'remote-write'}],{query:'x'.repeat(121)}).status,'blocked');
  const unknown = projectPortableAgentCapabilities([{name:'unclassified', description:'Some tool'}]);
  assert.equal(unknown.operations[0].safety,'unqualified');
  assert.equal(unknown.operations[0].hostExecution,'not-qualified');
});
