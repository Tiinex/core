import test from 'node:test';
import assert from 'node:assert/strict';
import { qualifyReductionSourceContext } from '../src/tooling/portable/reduction/reduction.sourceContext.js';
import { readFileSync } from 'node:fs';

const section = (content) => `# Reduction\n\n## Source Context\n\n${content}\n\n## Carry-Forward State\n\n- Retained.\n\n## Loss And Uncertainty\n\n- None beyond listed sources.\n\n## Validation\n\n- Not yet accepted.`;
const pinned = 'https://github.com/Tiinex/business/blob/b32b926678aaf8861bcfb756eb65a8df5e49ea71/.topics/executive/002-fresh-start-executive-grounding.trace.md';
const digest = '_qvqmcRgAqpV_pKo0yn9iPJCPGw9MQiANazqewuWoJU';
const github = `- business\n  - [002-fresh-start-executive-grounding.trace.md](${pinned})\n    - sha256-base64url-c14n-v2: \`${digest}\``;
const carrier = '- carrier-only\n  - Source: `tiinex-036-sigma-to-anchor.handoff-package.zip::business::.topics/work/local.trace.md`\n    - sha256: `' + 'a'.repeat(64) + '`';
const binary = '- core\n  - [demo.png](https://github.com/Tiinex/core/blob/0123456789abcdef0123456789abcdef01234567/.topics/assets/demo.png)\n    - sha256: `' + 'b'.repeat(64) + '`';

test('Sigma-like navigable exact published sources pass', () => assert.deepEqual(qualifyReductionSourceContext(section(github)).findings, []));
test('carrier-only source uses exact path and raw digest without fake Git', () => assert.deepEqual(qualifyReductionSourceContext(section(carrier)).findings, []));
test('external-runtime reduction can reference exact runtime snapshot identity and digest', () => assert.deepEqual(qualifyReductionSourceContext(section('- runtime\n  - Source: `runtime::run-20261012/session-1`\n    - sha256: `'+ 'a'.repeat(64) + '`')).findings, []));
test('VS Code Workspace can identify its extension-vscode Git repo', () => assert.deepEqual(qualifyReductionSourceContext(section('- vscode\n  - [asset.png](https://github.com/Tiinex/extension-vscode/blob/0123456789abcdef0123456789abcdef01234567/.topics/assets/asset.png)\n    - sha256: `' + 'a'.repeat(64) + '`')).findings, []));
test('binary published source must use raw sha256', () => assert.deepEqual(qualifyReductionSourceContext(section(binary)).findings, []));
test('legacy path-only/free prose fails for new authors', () => assert.equal(qualifyReductionSourceContext(section('- Source: working notes')).qualified, false));
test('raw ledger fails for new authors', () => assert.equal(qualifyReductionSourceContext(section('- core\n  - .topics/work/old.trace.md | sha256 abc | 100 bytes')).qualified, false));
test('missing digest fails', () => assert.equal(qualifyReductionSourceContext(section('- business\n  - [002-fresh-start-executive-grounding.trace.md](' + pinned + ')')).qualified, false));
test('unpinned Git fails', () => assert.equal(qualifyReductionSourceContext(section(github.replace('b32b926678aaf8861bcfb756eb65a8df5e49ea71','master'))).qualified, false));
test('cross-Workspace spoof fails', () => assert.equal(qualifyReductionSourceContext(section(github.replace('- business','- core'))).qualified, false));
test('wrong label fails', () => assert.equal(qualifyReductionSourceContext(section(github.replace('[002-fresh','[999-fresh'))).qualified, false));
test('git text trace must declare c14n', () => assert.equal(qualifyReductionSourceContext(section(github.replace('sha256-base64url-c14n-v2: `'+digest+'`','sha256: `'+ 'a'.repeat(64)+'`'))).qualified, false));
test('empty grouping cannot qualify', () => assert.equal(qualifyReductionSourceContext(section('- business')).qualified, false));

test('portable draft stage validation also rejects the old free-form Source Context', async () => {
  const { validatePortableDraft } = await import('../src/tooling/portable/draft/draft.operations.js');
  const out = validatePortableDraft({path:'.topics/reductions/test.trace.md', schemaId:'tiinex.reduction.v1', markdown:section('- Source: old opaque text')});
  assert.ok(out.findings.some(x => x.code === 'portable.draft.reduction-source-context.invalid'));
});
