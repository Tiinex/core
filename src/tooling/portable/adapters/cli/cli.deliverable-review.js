import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';

async function regularFileInfo(file) {
  try {
    const resolved = await realpath(file);
    const info = await stat(resolved);
    if (!info.isFile()) return null;
    const bytes = await readFile(resolved);
    return Object.freeze({ resolved, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function boundedTraceCandidates(root) {
  const base = path.join(root, '.topics');
  const pending = [base];
  const matches = [];
  let inspected = 0;
  while (pending.length) {
    if (inspected >= 1500) return Object.freeze({ count: matches.length, truncated: true, paths: Object.freeze(matches.slice(0, 12)) });
    const dir = pending.pop();
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch (error) { if (error?.code === 'ENOENT') continue; throw error; }
    for (const entry of entries) {
      inspected++;
      if (entry.isSymbolicLink()) continue;
      const item = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.tiinex' || entry.name === 'node_modules') continue;
        pending.push(item);
      } else if (entry.isFile() && entry.name.endsWith('.trace.md')) {
        matches.push(path.relative(root, item).split(path.sep).join('/'));
      }
    }
  }
  matches.sort();
  return Object.freeze({ count: matches.length, truncated: false, paths: Object.freeze(matches.slice(0, 12)) });
}

export async function runDeliverableContinuityReviewCli(parsed = {}) {
  const artifactInput = String(parsed.flags?.artifact || parsed.positionals?.[0] || '').trim();
  const workspaceInput = String(parsed.flags?.workspace || parsed.positionals?.[1] || '').trim();
  if (!artifactInput || !workspaceInput) throw new Error('portable.deliverable-review.artifact-and-workspace-required');
  const artifactPath = path.resolve(artifactInput);
  const workspacePath = path.resolve(workspaceInput);
  const artifact = await regularFileInfo(artifactPath);
  let workspaceRoot = '';
  try { workspaceRoot = await realpath(workspacePath); }
  catch (error) { if (error?.code !== 'ENOENT') throw error; }
  const workspaceFile = workspaceRoot ? await stat(workspaceRoot) : null;
  if (workspaceFile && !workspaceFile.isDirectory()) throw new Error('portable.deliverable-review.workspace-not-directory');
  const relative = artifact && workspaceRoot ? path.relative(workspaceRoot, artifact.resolved) : '';
  const inWorkspace = Boolean(artifact && workspaceRoot && relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
  const records = workspaceRoot ? await boundedTraceCandidates(workspaceRoot) : Object.freeze({count:0,truncated:false,paths:Object.freeze([])});
  const carrierInput = String(parsed.flags?.carrier || '').trim();
  const carrier = carrierInput ? await regularFileInfo(path.resolve(carrierInput)) : null;
  const eligibleForDecision = Boolean(artifact && workspaceRoot);
  const needsMaterialInclusion = Boolean(artifact && !inWorkspace);
  return Object.freeze({
    schema: 'tiinex.portable.operation.result.v1',
    operation: 'review-deliverable-continuity',
    status: eligibleForDecision ? 'decision-required' : 'blocked',
    readOnly: true,
    artifact: Object.freeze({ inputPath: artifactPath, state: artifact ? 'present' : 'missing', bytes: artifact?.bytes || 0, sha256: artifact?.sha256 || '' }),
    workspace: Object.freeze({ inputPath: workspacePath, state: workspaceRoot ? 'present' : 'missing', artifactInWorkspace: inWorkspace, artifactRelativePath: inWorkspace ? relative.split(path.sep).join('/') : '', traceCandidates: records, qualification: 'not-tested' }),
    carrier: Object.freeze({ state: carrier ? 'provided-unverified' : 'not-provided-or-missing', sha256: carrier?.sha256 || '', verification: 'not-tested', receiverSourceCoverage: 'not-tested' }),
    decision: Object.freeze({
      kind: eligibleForDecision ? 'qualify-or-explain-exception-before-declaring-recoverable' : 'resolve-missing-input-before-continuity-decision',
      materialRisk: needsMaterialInclusion ? 'artifact-not-within-specified-workspace' : (artifact ? 'artifact-present-in-workspace-does-not-prove-carrier-inclusion' : 'artifact-not-readable'),
      advice: 'If this artifact establishes a truthful reusable working result and writes are permitted, include the actual file in a qualified Workspace, use author --preflight and author with verified schema/Parent, then manufacture, inspect and deliver the complete carrier. Otherwise state a concrete reason to defer. A technical file check alone cannot determine whether work is worth preserving.',
      receiverTest: 'Check whether a fresh recipient with only the delivered ZIP can recover the original deliverable bytes and any necessary sources. A provided carrier path, trace candidate or package roundtrip is not proof of this.'
    }),
    boundary: 'Read-only local file and trace-candidate inventory. It neither validates trace qualification nor inspects a carrier, monitors future output, changes host delivery behavior, or compels the assistant to invoke this command.'
  });
}
