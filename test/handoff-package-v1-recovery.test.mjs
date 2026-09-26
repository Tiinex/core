import test from 'node:test';
import assert from 'node:assert/strict';
import { projectColdStartContinuity, projectExactReferenceRecovery } from '../src/tooling/portable/grounding/grounding.continuity.js';
import { planPortableHostAction, acceptPortableHostActionReceipt, PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID } from '../src/tooling/portable/host/tool.bindings.js';
import { describeTiinexLlmEntrypoint } from '../src/tooling/portable/adapters/llm/llm.entrypoint.js';

const COMMIT = 'a66906eef7f0033eb12893f92910336f82d01afa';
const TARGET = `https://github.com/Tiinex/business/blob/${COMMIT}/.topics/processes/required-process.trace.md`;

function continuityAuthority(tool = null) {
  return {
    selectedRoute: { pointerPath: '001-3-1-handoff-pointer.trace.md' },
    capabilities: {
      discovery: {
        profile: {
          toolBindings: {
            repositoryRead: tool ? { selected: { tool } } : { selected: null }
          }
        }
      }
    }
  };
}
function unresolvedLineage() {
  return {
    nodes: [{ id: 'route', path: 'work/.topics/handoffs/001.trace.md', trace: TARGET, hasContinuityContext: true, hasIntegrity: true }],
    edges: [{ kind: 'parent', from: '', to: 'route', status: 'missing', target: TARGET }],
    findings: []
  };
}

test('Package V1 grounding exposes exact manual-input recovery when no repository reader is available', () => {
  const result = projectColdStartContinuity({
    mode: 'routed-handoff-package',
    lineage: unresolvedLineage(),
    routeRecordIds: new Set(['route']),
    authority: continuityAuthority()
  });
  assert.equal(result.state, 'unproven');
  assert.equal(result.recovery.state, 'operator-required');
  assert.equal(result.recovery.target, TARGET);
  assert.match(result.recovery.operatorRequest.request, /exact(?:ly)? the declared Parent material|exact missing Parent/i);
  assert.equal(result.recovery.operatorRequest.semanticJudgmentRequired, false);
  assert.match(result.recovery.resume.note, /accept-host-receipt|recovered material remains candidate/i);
});

test('Package V1 grounding binds an exact read-only GitHub host action when repository read is available', () => {
  const tool = { id: 'github-fetch-file', name: 'GitHub fetch file', description: 'read GitHub repository file' };
  const result = projectColdStartContinuity({
    mode: 'routed-handoff-package',
    lineage: unresolvedLineage(),
    routeRecordIds: new Set(['route']),
    authority: continuityAuthority(tool)
  });
  assert.equal(result.state, 'unproven');
  assert.equal(result.recovery.state, 'host-action-available');
  assert.equal(result.recovery.hostAction.action, 'repository-read');
  assert.deepEqual(result.recovery.hostAction.request, {
    repository: 'Tiinex/business',
    ref: COMMIT,
    path: '.topics/processes/required-process.trace.md',
    purpose: 'recover exact declared Parent for cold-start continuity proof',
    nextOperation: 'ground'
  });
  assert.equal(result.recovery.hostAction.selectedTool.id, 'github-fetch-file');
});

test('read-only recovery receipt can be fed back to Tooling and remains exact pinned candidate material', () => {
  const tool = { id: 'github-fetch-file', name: 'GitHub fetch file', description: 'read GitHub repository file' };
  const request = { repository: 'Tiinex/business', ref: COMMIT, path: '.topics/processes/required-process.trace.md', nextOperation: 'ground' };
  const plan = planPortableHostAction({ host: { tools: [tool] }, action: 'repository-read', request });
  assert.equal(plan.status, 'ready');
  assert.equal(plan.boundary.remoteWrite, false);
  assert.equal(plan.boundary.sourceMutation, false);
  assert.equal(plan.steps.length, 1);
  const receipt = {
    schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
    actionId: plan.actionId,
    action: plan.action,
    steps: [{
      stepId: plan.steps[0].stepId,
      toolId: tool.id,
      status: 'completed',
      normalized: {
        files: [{
          path: request.path,
          content: '# Exact recovered process\n',
          source: { repository: request.repository, ref: request.ref, commit: request.ref, path: request.path, authority: 'remote-repository-unverified' }
        }]
      }
    }]
  };
  const accepted = acceptPortableHostActionReceipt({ plan, receipt });
  assert.equal(accepted.status, 'accepted');
  assert.equal(accepted.providerResponses.length, 1);
  const file = accepted.providerResponses[0].files[0];
  assert.equal(file.path, request.path);
  assert.equal(file.source.repository, request.repository);
  assert.equal(file.source.commit, COMMIT);
  assert.equal(file.source.receiptQualification, 'accepted-host-repository-read');
  assert.equal(file.source.provenanceQualification, 'accepted-host-repository-pinned');
});

test('LLM entrypoint never advertises remote write as a grounding recovery capability', () => {
  const entrypoint = describeTiinexLlmEntrypoint();
  assert.equal(entrypoint.boundary.remoteWrite, false);
  assert.equal(entrypoint.boundary.sourceMutation, false);
  assert.match(entrypoint.boundary.remoteFetch, /host-mediated/i);
});


test('ordinary Required Context recovery binds the exact read-only GitHub target when repository read is available', () => {
  const tool = { id: 'github-fetch-file', name: 'GitHub fetch file', description: 'read GitHub repository file' };
  const recovery = projectExactReferenceRecovery(TARGET, continuityAuthority(tool), {
    materialLabel: 'Required Context material execution-process',
    whyRequired: 'Exact declared Required Context material is required before substantive work.',
    purpose: 'recover exact Required Context material execution-process'
  });
  assert.equal(recovery.state, 'host-action-available');
  assert.equal(recovery.hostAction.action, 'repository-read');
  assert.deepEqual(recovery.hostAction.request, {
    repository: 'Tiinex/business',
    ref: COMMIT,
    path: '.topics/processes/required-process.trace.md',
    purpose: 'recover exact Required Context material execution-process',
    nextOperation: 'ground'
  });
  assert.equal(recovery.hostAction.selectedTool.id, 'github-fetch-file');
  assert.doesNotMatch(JSON.stringify(recovery), /repository-write|remote-write/i);
});

test('ordinary Required Context recovery falls back to exact manual input without semantic substitution', () => {
  const recovery = projectExactReferenceRecovery(TARGET, continuityAuthority(), {
    materialLabel: 'Required Context material execution-process',
    whyRequired: 'Exact declared Required Context material is required before substantive work.',
    purpose: 'recover exact Required Context material execution-process'
  });
  assert.equal(recovery.state, 'operator-required');
  assert.equal(recovery.target, TARGET);
  assert.equal(recovery.operatorRequest.semanticJudgmentRequired, false);
  assert.match(recovery.operatorRequest.request, /exactly the declared Required Context material execution-process bytes/i);
  assert.match(recovery.allowedScope, /exact declared target bytes/i);
});
