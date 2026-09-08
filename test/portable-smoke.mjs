import assert from 'node:assert/strict';
const core = await import('../src/public/node.js');
assert.equal(typeof core.inspectPortableMaterial, 'function');
assert.equal(typeof core.projectApplicationData, 'function');
console.log('portable node surface imports');
