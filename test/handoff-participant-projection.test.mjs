import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPortableHandoffParticipants } from '../src/tooling/portable/handoff/handoffParticipantProjection.js';

test('read-only Handoff participant projection returns exact qualified Core authority', () => {
  const result = projectPortableHandoffParticipants({
    handoff: {},
    requirements: {
      required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [], findings: [],
      semanticParticipantRoutes: [{
        routeWorkspaceId: 'extension-vscode', routePath: '.topics/handoffs/replay.trace.md', state: 'qualified',
        currentTask: { path: 'extension-vscode/.topics/task.trace.md', schemaId: 'tiinex.task.v1' },
        participantRoles: [{ label: 'Sigma', reference: 'business::.topics/roles/sigma.trace.md', workspaceId: 'business', path: '.topics/roles/sigma.trace.md' }]
      }]
    },
    workspaceMaterializations: []
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.participantAuthority.state, 'qualified');
  assert.deepEqual(result.participantAuthority.participants, [{ label: 'Sigma', reference: 'business::.topics/roles/sigma.trace.md', workspaceId: 'business', path: '.topics/roles/sigma.trace.md' }]);
});

test('read-only Handoff participant projection fails closed on blocked closure', () => {
  const result = projectPortableHandoffParticipants({
    handoff: {},
    requirements: { required: [{ id: 'missing', kind: 'required', availability: 'absent' }], reference: [], endpointRoles: [], participantRoles: [], dependencies: [], findings: [{ severity: 'error', code: 'test.missing', message: 'missing' }], semanticParticipantRoutes: [{ routeWorkspaceId: 'extension-vscode', routePath: '.topics/handoffs/bad.trace.md', state: 'blocked', participantRoles: [] }] },
    workspaceMaterializations: []
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.participantAuthority.state, 'blocked');
});
