import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderHandoffPackageV1Start } from '../src/tooling/portable/handoff/handoffPackageV1.render.js';
import { projectCommonCliDefaultOutput } from '../src/tooling/portable/adapters/cli/cli.common-output.js';

const render = (carrierMode) => renderHandoffPackageV1Start({ carrierMode, createdAt:'2026-10-16T18:00:00.000Z', bootstrapArtifactPath:'001-2-bootstrap.trace.md',bootstrapArchivePath:'001-2-bootstrap.zip' });

test('024 early first-content gate present in bootstrap-only and pointerless Start, not routed Start', () => {
  for (const mode of ['bootstrap','workspace']) {
    const start=render(mode);
    assert.match(start,/before finishing the reply/);
    assert.match(start,/no placeholder Topic/);
    assert.match(start,/not an automatic host event hook/);
    assert.match(start,/verify and deliver a pointerless carrier/);
  }
  assert.doesNotMatch(render('handoff'),/per-turn assistant decision rule/);
});

test('024 route-less orient projects a bounded first work decision, without claiming persistence', () => {
  const out=projectCommonCliDefaultOutput({schema:'t',status:'ready',workspaces:[],routes:[],entrypoint:{projection:{}}},{command:'orient-handoff-package',positionals:['fixture.zip']},{});
  const assessment=out.sessionScratch?.firstWorkDecision;
  assert.equal(assessment.trigger, 'on-a-later-user-turn-with-bounded-reusable-working-content-or-at-natural-stop');
  assert.match(assessment.positive,/author --preflight/);
  assert.match(assessment.negative,/do not author a placeholder/);
  assert.match(assessment.boundary,/does not watch later messages/);
  assert.equal(out.nextAction.kind,'prepare-local-session-scratch');
});

test('024 does not inject scratch into unsuccessful or routed orientation', () => {
  const base={schema:'t',workspaces:[],entrypoint:{projection:{}}};
  const parsed={command:'orient-handoff-package',positionals:['fixture.zip']};
  assert.equal(projectCommonCliDefaultOutput({...base,status:'blocked',routes:[]},parsed,{}).sessionScratch,null);
  assert.equal(projectCommonCliDefaultOutput({...base,status:'ready',routes:[{pointerPath:'pointer',state:'qualified'}]},parsed,{}).sessionScratch,null);
});

test('024 qualified authoring source contains first-content turn decision with explicit provisional boundaries', () => {
  const text=readFileSync(new URL('../../native/.topics/.entries/what/getting-started/001-1-1-1-1-1-1-1-1-getting-started-evidence-informed-work-selection.trace.md',import.meta.url),'utf8');
  for(const part of ['First-content-turn gate','before completing the ordinary reply','a greeting, an isolated ambiguous phrase','per-later-turn decision discipline','author --preflight','reassess']) assert.ok(text.includes(part),part);
});
