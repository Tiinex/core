import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../src/artifacts/artifact.record.js';
import { c14nV1TargetDigest } from '../src/integrity/integrity.c14nV1.js';
import { sealC14nV2Self } from '../src/integrity/integrity.c14nV2.js';
import { resolveLineage } from '../src/lineage/lineage.resolve.js';

const HISTORICAL_REF = 'cca53fc8c52fd27b92b9429420efd613913a88bd';
const ROOT_PATH = '.topics/.schemas/tiinex.root.v1.schema.md';
const ROOT_URL = `https://github.com/Tiinex/docs/blob/${HISTORICAL_REF}/${ROOT_PATH}`;

function parentMarkdown(title = 'Parent', body = 'Parent body.') {
  const sealed = sealC14nV2Self(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-12 12:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n${body}\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending`);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}

function childMarkdown({ trace, origin = '', value, title = 'Child' }) {
  const originBlock = origin ? `\n  - Origin:\n    - [browse + git](${origin})` : '';
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.task.v1\n  - Created At: 2026-09-12 12:00:00\n  - Trace: [Parent](${trace})${originBlock}\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-12 12:01:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nChild body.\n\n---\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v1\n  - Towards: [Parent](${trace})\n  - Value: ${value}`;
}

function record(markdown, path, extra = {}) {
  return { ...createRecordFromMarkdown(markdown, { path, sourceMode: 'portable-node-local' }), ...extra, path };
}

test('c14n-v1 canonical target digest follows the canonical validator slice rules', () => {
  const markdown = '# A\r\nLine with space  \r\n\r\n---\r\n\r\n# Continuity Integrity\r\n- sha256-base64url-c14n-v1\r\n  - Towards: self\r\n  - Value: ignored\r\n';
  assert.equal(c14nV1TargetDigest(markdown), 'noePJ5GZQp_41f7brwmdSJYY8859stB0YFrCrqT_ppk');
});

test('parent c14n-v1 verification hashes the resolved target directly instead of comparing an unrelated v2 self value', () => {
  const parentPath = '.topics/tests/001-parent.trace.md';
  const childPath = '.topics/tests/001-1-child.trace.md';
  const parent = parentMarkdown();
  const expected = c14nV1TargetDigest(parent);
  const child = childMarkdown({ trace: '001-parent.trace.md', value: expected });
  const result = resolveLineage([record(parent, parentPath), record(child, childPath)]);
  const edge = result.edges.find((item) => item.kind === 'parent' && item.to === childPath);
  assert.ok(edge);
  assert.equal(edge.from, parentPath);
  assert.equal(edge.status, 'verified');
  assert.equal(edge.diagnostics[0]?.method, 'sha256-base64url-c14n-v1');
  assert.equal(edge.diagnostics[0]?.actual, expected);
  assert.equal(result.findings.some((item) => item.code === 'lineage.parent.integrityMismatch' && item.nodeId === childPath), false);
});

test('commit-pinned GitHub parent identity does not collapse to current same-path material and selects exact ref material when available', () => {
  const historicalMarkdown = parentMarkdown('Historical Root', 'Historical bytes.');
  const currentMarkdown = parentMarkdown('Current Root', 'Current bytes.');
  const expected = c14nV1TargetDigest(historicalMarkdown);
  const childPath = '.topics/.schemas/tiinex.workspace.v1.schema.md';
  const child = record(childMarkdown({ trace: ROOT_URL, origin: ROOT_URL, value: expected, title: 'Workspace schema' }), childPath);
  const current = record(currentMarkdown, ROOT_PATH, {
    id: 'current-root',
    source: { id: 'github-current', adapterId: 'github', repository: 'Tiinex/docs', ref: 'master' }
  });

  const withoutHistorical = resolveLineage([current, child]);
  assert.equal(withoutHistorical.edges.some((item) => item.kind === 'parent' && item.to === childPath && item.from === 'current-root'), false);
  assert.ok(withoutHistorical.findings.some((item) => item.code === 'lineage.parent.exactTargetNotLoaded' && item.nodeId === childPath));

  const historical = record(historicalMarkdown, ROOT_PATH, {
    id: 'historical-root',
    recoveredFromUrl: ROOT_URL,
    source: { id: 'github-historical', adapterId: 'github', repository: 'Tiinex/docs', ref: HISTORICAL_REF }
  });
  const withHistorical = resolveLineage([current, historical, child]);
  const edge = withHistorical.edges.find((item) => item.kind === 'parent' && item.to === childPath);
  assert.ok(edge);
  assert.equal(edge.from, 'historical-root');
  assert.equal(edge.status, 'verified');
  assert.equal(edge.diagnostics[0]?.actual, expected);
});
