import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runDeliverableContinuityReviewCli } from '../src/tooling/portable/adapters/cli/cli.deliverable-review.js';

test('026: file outside prepared scratch yields factual continuity decision, without modifying the file', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-review-'));
  const scratch = path.join(dir, 'scratch'); await mkdir(scratch);
  const artifact = path.join(dir, 'signal.html'); await writeFile(artifact,'<html>experiment</html>');
  const before = await readFile(artifact);
  const receipt = await runDeliverableContinuityReviewCli({ flags: { artifact, workspace: scratch }, positionals: [] });
  assert.equal(receipt.status,'decision-required');
  assert.equal(receipt.artifact.bytes,before.length);
  assert.equal(receipt.workspace.artifactInWorkspace,false);
  assert.equal(receipt.decision.materialRisk,'artifact-not-within-specified-workspace');
  assert.equal(receipt.carrier.state,'not-provided-or-missing');
  assert.equal(receipt.workspace.qualification,'not-tested');
  assert.equal(receipt.readOnly,true);
  assert.deepEqual(await readFile(artifact),before);
});

test('026: file inside Workspace is not misrepresented as qualified or carried', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tiinex-review-'));
  await mkdir(path.join(dir,'.topics','.workspaces'),{recursive:true});
  await writeFile(path.join(dir,'.topics','.workspaces','session.workspace.md'), 'descriptor');
  await mkdir(path.join(dir,'.topics','ideas'),{recursive:true});
  await writeFile(path.join(dir,'.topics','ideas','draft.trace.md'), 'unqualified placeholder');
  const artifact = path.join(dir,'index.html'); await writeFile(artifact,'hello');
  const receipt=await runDeliverableContinuityReviewCli({flags:{artifact,workspace:dir},positionals:[]});
  assert.equal(receipt.workspace.artifactInWorkspace,true);
  assert.equal(receipt.workspace.artifactRelativePath,'index.html');
  assert.equal(receipt.workspace.traceCandidates.count,1);
  assert.equal(receipt.workspace.qualification,'not-tested');
  assert.equal(receipt.carrier.receiverSourceCoverage,'not-tested');
  assert.equal(receipt.status,'decision-required');
});

test('026: absent output blocks without inventing recovered work',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'tiinex-review-'));
  const receipt=await runDeliverableContinuityReviewCli({flags:{artifact:path.join(dir,'missing.html'),workspace:dir},positionals:[]});
  assert.equal(receipt.status,'blocked');
  assert.equal(receipt.artifact.state,'missing');
});
