import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HANDOFF_CARRIER_CONTINUATION_PROJECTION_SCHEMA_ID,
  projectHandoffCarrierContinuation
} from '../src/public/index.js';

function orientation({ dimension = '002-1', routes = [] } = {}) {
  return {
    schema: 'tiinex.portable.handoff-cold-consumer-orientation.v1',
    status: 'ready',
    carrierLineage: { mode: 'continue', dimension, checkpointKind: 'progression', authority: 'human-progress-projection-only' },
    routes: routes.map((route) => ({ state: 'qualified', workspaceId: 'core', ...route }))
  };
}

const routeA = {
  id: 'route:a',
  routeId: 'route:a',
  pointerPath: '001-4-1-handoff-pointer.trace.md',
  workspaceRelativeHandoffPath: '.topics/handoffs/a.trace.md'
};
const routeB = {
  id: 'route:b',
  routeId: 'route:b',
  pointerPath: '001-4-2-handoff-pointer.trace.md',
  workspaceRelativeHandoffPath: '.topics/handoffs/b.trace.md'
};

test('single qualified parent Pointer derives ordinary -1 continuation without outgoing Parent-path inference', () => {
  const result = projectHandoffCarrierContinuation({
    parentOrientation: orientation({ dimension: '002-1-4', routes: [routeA] }),
    outgoingRoutes: [
      { id: 'out:a', workspaceId: 'core', path: '.topics/handoffs/out-a.trace.md', semanticParentPath: '.topics/tasks/unrelated-a.trace.md' },
      { id: 'out:b', workspaceId: 'core', path: '.topics/handoffs/out-b.trace.md', semanticParentPath: '.topics/tasks/unrelated-b.trace.md' }
    ]
  });

  assert.equal(result.schema, HANDOFF_CARRIER_CONTINUATION_PROJECTION_SCHEMA_ID);
  assert.equal(result.status, 'ready');
  assert.equal(result.state, 'qualified');
  assert.equal(result.selection.state, 'qualified');
  assert.equal(result.selection.pointerPath, routeA.pointerPath);
  assert.equal(result.allocation.siblingIndex, 1);
  assert.equal(result.lineage.dimension, '002-1-4-1');
  assert.equal(result.outgoing.routeCount, 2);
  assert.equal(result.outgoing.routes[0].workspaceRelativeHandoffPath, '.topics/handoffs/out-a.trace.md');
  assert.equal('semanticParentPath' in result.outgoing.routes[0], false, 'outgoing semantic Parent paths are not allocation inputs');
});

test('parallel qualified parent Pointers derive dense local ordinals in Pointer order from explicit parent-route selection', () => {
  const parentOrientation = orientation({ dimension: '006-3', routes: [routeB, routeA] });
  const a = projectHandoffCarrierContinuation({ parentOrientation, selectedParentRouteId: 'route:a' });
  const b = projectHandoffCarrierContinuation({ parentOrientation, selectedParentRoutePointer: routeB.pointerPath });

  assert.equal(a.state, 'qualified');
  assert.equal(a.allocation.siblingIndex, 1);
  assert.equal(a.lineage.dimension, '006-3-1');
  assert.deepEqual(a.allocation.provenance.pointerOrder.map((item) => item.routeId), ['route:a', 'route:b']);

  assert.equal(b.state, 'qualified');
  assert.equal(b.allocation.siblingIndex, 2);
  assert.equal(b.lineage.dimension, '006-3-2');
});


test('Sigma two-Handoff shape stays qualified when selected incoming route is explicit even if outgoing semantic Parent paths do not match parent-carrier routes', () => {
  const result = projectHandoffCarrierContinuation({
    parentOrientation: orientation({ dimension: '002-7', routes: [routeB, routeA] }),
    selectedParentRouteId: 'route:b',
    outgoingRoutes: [
      { id: 'out:one', workspaceId: 'core', path: '.topics/handoffs/out-one.trace.md', semanticParentPath: '.topics/tasks/task-one.trace.md' },
      { id: 'out:two', workspaceId: 'core', path: '.topics/handoffs/out-two.trace.md', semanticParentPath: '.topics/tasks/task-two.trace.md' }
    ]
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.state, 'qualified');
  assert.equal(result.selection.routeId, 'route:b');
  assert.equal(result.outgoing.routeCount, 2);
  assert.equal(result.lineage.dimension, '002-7-2');
  assert.equal(result.allocation.provenance.basis, 'qualified-parent-route-pointer-ordinal');
});

test('parallel topology without an already-selected parent route fails visible as selection-required', () => {
  const result = projectHandoffCarrierContinuation({ parentOrientation: orientation({ routes: [routeA, routeB] }) });
  assert.equal(result.status, 'selection-required');
  assert.equal(result.state, 'selection-required');
  assert.equal(result.reasonCode, 'selected-parent-route-required-for-parallel-topology');
  assert.equal(result.lineage, null);
});

test('supplied non-parent route fails visible as invalid-parent-route rather than matching outgoing paths', () => {
  const result = projectHandoffCarrierContinuation({
    parentOrientation: orientation({ routes: [routeA, routeB] }),
    selectedParentRoutePointer: '001-4-9-handoff-pointer.trace.md',
    outgoingRoutes: [{ id: 'out:a', workspaceId: 'core', path: '.topics/handoffs/a.trace.md' }]
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.state, 'invalid-parent-route');
  assert.equal(result.reasonCode, 'selected-parent-route-pointer-unqualified');
  assert.equal(result.lineage, null);
});

test('ambiguous parent route selector remains selection-required and never guesses from route order', () => {
  const result = projectHandoffCarrierContinuation({
    parentOrientation: orientation({ routes: [
      { ...routeA, id: 'route:duplicate', routeId: 'route:duplicate' },
      { ...routeB, id: 'route:duplicate', routeId: 'route:duplicate' }
    ] }),
    selectedParentRouteId: 'route:duplicate'
  });
  assert.equal(result.status, 'selection-required');
  assert.equal(result.state, 'selection-required');
  assert.equal(result.reasonCode, 'selected-parent-route-id-ambiguous');
});

test('explicit Major continuation is separate from ordinary route allocation and requires no sibling selection', () => {
  const result = projectHandoffCarrierContinuation({
    parentOrientation: orientation({ dimension: '009-4-2', routes: [routeA, routeB] }),
    explicitMajor: true,
    majorReason: 'explicit stabilization after qualified integration'
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.state, 'explicit-major');
  assert.equal(result.selection.state, 'not-applicable');
  assert.equal(result.allocation.allocationMode, 'explicit-major');
  assert.equal(result.allocation.siblingIndex, null);
  assert.equal(result.lineage.dimension, '010');
  assert.equal(result.lineage.parentDimension, '009-4-2');
  assert.equal(result.lineage.checkpointKind, 'major');
});

test('projection fails closed on unavailable parent topology and does not widen semantic authority', () => {
  const result = projectHandoffCarrierContinuation({ parentOrientation: null, parentDimension: '002-1' });
  assert.equal(result.status, 'blocked');
  assert.equal(result.state, 'unresolved');
  assert.equal(result.reasonCode, 'qualified-parent-route-topology-unavailable');
  assert.deepEqual(result.authority, {
    semanticAuthority: 'none',
    semanticParentAuthority: 'none',
    recipientAuthority: 'none',
    participantAuthority: 'none',
    holderAuthority: 'none',
    currentWorkAuthority: 'none',
    filenameAuthority: false,
    dimensionalParentAuthority: false,
    routeSelectionAuthority: 'qualified-parent-route-membership-only'
  });
});
