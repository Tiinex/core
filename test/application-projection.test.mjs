import test from 'node:test';
import assert from 'node:assert/strict';
import { projectApplicationData, toPlaythingsStoryRecords } from '../src/public/index.js';

const ROOT = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-08 10:00:00\n  - Authors: Anchor\n  - Summary: Root\n\n---\n\n# Root\n`;
const CHILD = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.task.v1\n  - Created At: 2026-09-08 10:00:00\n  - Trace: [Root](001-root.trace.md)\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: 2026-09-08 10:01:00\n  - Authors: Anchor; Sigma\n  - Summary: Child\n\n---\n\n# Child\n`;
const HANDOFF = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.task.v1\n  - Created At: 2026-09-08 10:01:00\n  - Trace: [Child](002-child.trace.md)\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-09-08 10:02:00\n  - Authors: Anchor\n  - Summary: Handoff\n\n---\n\n# Handoff\n\n## Handoff Parties\n\n- From: Anchor\n- From Kind: role\n- From Reference: [Anchor Role](business::.topics/roles/anchor.trace.md)\n- To: Sigma\n- To Kind: role\n- To Reference: [Sigma Role](business::.topics/roles/sigma.trace.md)\n`;

const data = projectApplicationData({ workspaces: [
  { id: 'site', records: [
    { path: '001-root.trace.md', markdown: ROOT },
    { path: '002-child.trace.md', markdown: CHILD },
    { path: '003-handoff.trace.md', markdown: HANDOFF }
  ] },
  { id: 'business', records: [
    { path: '.topics/roles/anchor.trace.md', markdown: ROOT.replace('# Root', '# Anchor Role') },
    { path: '.topics/roles/sigma.trace.md', markdown: ROOT.replace('# Root', '# Sigma Role') }
  ] }
] });

test('projects exact parent identity without chronology or title inference', () => {
  const child = data.records.find((r) => r.id === 'site::002-child.trace.md');
  assert.equal(child.parent.state, 'resolved');
  assert.equal(child.parent.id, 'site::001-root.trace.md');
});

test('projects handoff endpoints from exact references and never names alone', () => {
  const handoff = data.records.find((r) => r.id === 'site::003-handoff.trace.md');
  assert.deepEqual(handoff.handoff.from, ['business::.topics/roles/anchor.trace.md']);
  assert.deepEqual(handoff.handoff.to, ['business::.topics/roles/sigma.trace.md']);
  assert.equal(handoff.handoff.impliesAcceptance, false);
});

test('produces Playthings-neutral records with unknown actions and exact ancestry', () => {
  const story = toPlaythingsStoryRecords(data);
  const child = story.find((r) => r.id === 'site::002-child.trace.md');
  assert.equal(child.parentId, 'site::001-root.trace.md');
  assert.deepEqual(child.authors, ['Anchor', 'Sigma']);
  assert.equal(child.actionStatus, 'unknown');
});
