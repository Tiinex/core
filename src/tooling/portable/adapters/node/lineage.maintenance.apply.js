import path from 'node:path';
import { access, lstat, mkdir, readFile, rename } from 'node:fs/promises';
import { stableFingerprintBytes, sha256Hex, utf8Bytes } from '../../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID } from '../../lineage/lineage.maintenance.projection.js';
import { ASSET_RELOCATION_PLAN_SCHEMA_ID, cleanRelative } from '../../lineage/asset.relocation.projection.js';
import { inspectPortableAssetRelocationWorkspace } from './asset.relocation.inspect.js';
import {
  acquireLineageMaintenanceWorkspaceLocks,
  cleanupLineageMaintenanceTransaction,
  createLineageMaintenanceTransactionId,
  initializeLineageMaintenanceTransaction,
  releaseLineageMaintenanceWorkspaceLocks,
  rollbackLineageMaintenanceTransaction,
  transactionBackupPath,
  transactionStagePath,
  updateLineageMaintenanceTransactionPhase,
  writeFileDurable
} from './lineage.maintenance.transaction.js';

export const LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID = 'tiinex.portable.lineage-maintenance-apply-receipt.v1';

export async function applyPortableLineageMaintenancePlan(plan = {}, options = {}) {
  const findings = [];
  const binaryAssetPlan = plan?.schema === ASSET_RELOCATION_PLAN_SCHEMA_ID;
  if ((!binaryAssetPlan && plan?.schema !== LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID) || plan?.status !== 'ready' || plan?.executable !== true) {
    return blocked(findings, 'lineage-maintenance.apply.plan-unqualified', 'Lineage maintenance apply requires one exact ready executable plan.');
  }
  if (binaryAssetPlan) {
    const shape = qualifyBinaryAssetPlanShape(plan);
    if (shape.length) return blockedEnvelope(plan, shape);
  }
  const expectedPlanFingerprint = fingerprintPlan(plan);
  if (!plan.planFingerprint || plan.planFingerprint !== expectedPlanFingerprint) {
    return blockedEnvelope(plan, [finding('error', 'lineage-maintenance.apply.plan-fingerprint-mismatch', 'Lineage maintenance plan fingerprint does not match the exact projected operation and outputs.', { expected: expectedPlanFingerprint, actual: String(plan.planFingerprint || '') })]);
  }
  const roots = normalizeRoots(options.workspaceRoots || options.roots || {});
  const workspaceIds = [...new Set((plan.inputs || []).map((item) => String(item.workspaceId || '')))].sort();
  for (const id of workspaceIds) if (!roots.get(id)) findings.push(finding('error', 'lineage-maintenance.apply.workspace-root-missing', `Workspace root is unavailable for ${id}.`, { workspaceId: id }));
  if (findings.length) return blockedEnvelope(plan, findings);

  await qualifyCurrentInputs(plan, roots, findings);
  if (binaryAssetPlan) await qualifyBinaryAssetPaths(plan, roots, findings);
  if (binaryAssetPlan) await qualifyAssetInspectionCurrent(plan, roots, findings);
  await qualifyTargetCollisions(plan, roots, findings);
  if (findings.length) return blockedEnvelope(plan, findings);

  const affected = (plan.changes || []).filter((item) => item.pathChanged || item.bytesChanged);
  if (!affected.length) return readyEnvelope(plan, affected, findings, { transactionId: '', durableJournal: false, locks: false });

  const transactionId = createLineageMaintenanceTransactionId(plan.planFingerprint);
  const lockResult = await acquireLineageMaintenanceWorkspaceLocks({ workspaceIds, roots, transactionId, planFingerprint: plan.planFingerprint });
  if (lockResult.status !== 'ready') return blockedEnvelope(plan, [...findings, ...lockResult.findings], { transactionId, recoveryRequired: false });
  const locks = [...lockResult.acquired];
  let journals = new Map();
  let releaseLocks = true;
  try {
    findings.length = 0;
    await qualifyCurrentInputs(plan, roots, findings);
    if (binaryAssetPlan) await qualifyBinaryAssetPaths(plan, roots, findings);
    if (binaryAssetPlan) await qualifyAssetInspectionCurrent(plan, roots, findings);
    await qualifyTargetCollisions(plan, roots, findings);
    if (findings.length) throw new ApplyAbort('lineage-maintenance.apply.pre-mutation-requalification-failed');

    journals = await initializeLineageMaintenanceTransaction({ transactionId, plan, roots, workspaceIds, affected });
    await phase(journals, 'initializing', options, transactionId);

    for (const change of affected) {
      const state = journals.get(String(change.workspaceId));
      const staged = transactionStagePath(state, change.toPath);
      const payload = binaryAssetPlan && change.kind === 'binary-asset' ? await readFile(safeJoin(roots.get(String(change.workspaceId)), change.fromPath)) : change.markdown;
      await writeFileDurable(staged, payload);
    }
    await updateLineageMaintenanceTransactionPhase(journals, 'prepared');
    await phase(journals, 'prepared', options, transactionId);
    // The host can still mutate files after the second inspection and before
    // destructive source staging. Recheck after the externally visible prepared
    // checkpoint, while the cooperative lock remains held.
    if (binaryAssetPlan) await qualifyAssetInspectionCurrent(plan, roots, findings);
    if (findings.length) throw new ApplyAbort('asset-relocation.apply.inspection-changed-during-prepared');

    for (const change of affected) {
      if (binaryAssetPlan && change.kind === 'artifact-create') continue; // No pre-existing input to back up.
      const workspaceId = String(change.workspaceId);
      const root = roots.get(workspaceId);
      const source = safeJoin(root, change.fromPath);
      const expected = inputFingerprint(plan, workspaceId, change.fromPath);
      if (!await exists(source)) {
        findings.push(finding('error', 'lineage-maintenance.apply.input-missing-after-lock', `Plan input disappeared after workspace locking: ${workspaceId}::${change.fromPath}`, { workspaceId, path: change.fromPath }));
        throw new ApplyAbort('lineage-maintenance.apply.input-missing-after-lock');
      }
      const actual = await fingerprintFile(source);
      if (binaryAssetPlan && sha256Hex(await readFile(source)) !== inputSha256(plan, workspaceId, change.fromPath)) {
        findings.push(finding('error','asset-relocation.apply.strong-source-drift',`Source SHA-256 changed before mutation: ${workspaceId}::${change.fromPath}`));
        throw new ApplyAbort('asset-relocation.apply.strong-source-drift');
      }
      if (actual !== expected) {
        findings.push(finding('error', 'lineage-maintenance.apply.concurrent-input-drift', `Plan input changed after workspace locking and before destructive mutation: ${workspaceId}::${change.fromPath}`, { workspaceId, path: change.fromPath, expected, actual }));
        throw new ApplyAbort('lineage-maintenance.apply.concurrent-input-drift');
      }
      const state = journals.get(workspaceId);
      const backup = transactionBackupPath(state, change.fromPath);
      await mkdir(path.dirname(backup), { recursive: true });
      await rename(source, backup);
      const backupFingerprint = await fingerprintFile(backup);
      if (binaryAssetPlan && sha256Hex(await readFile(backup)) !== inputSha256(plan, workspaceId, change.fromPath)) {
        findings.push(finding('error','asset-relocation.apply.strong-backup-drift',`Source backup SHA-256 changed: ${workspaceId}::${change.fromPath}`));
        throw new ApplyAbort('asset-relocation.apply.strong-backup-drift');
      }
      if (backupFingerprint !== expected) {
        findings.push(finding('error', 'lineage-maintenance.apply.backup-byte-mismatch', `Atomic source backup does not match projected input bytes: ${workspaceId}::${change.fromPath}`, { workspaceId, path: change.fromPath, expected, actual: backupFingerprint }));
        throw new ApplyAbort('lineage-maintenance.apply.backup-byte-mismatch');
      }
    }
    await updateLineageMaintenanceTransactionPhase(journals, 'sources-staged');
    await phase(journals, 'sources-staged', options, transactionId);

    for (const change of affected) {
      const workspaceId = String(change.workspaceId);
      const root = roots.get(workspaceId);
      const target = safeJoin(root, change.toPath);
      if (binaryAssetPlan) await assertNoSymlinkComponents(root, change.toPath);
      if (await exists(target)) {
        findings.push(finding('error', 'lineage-maintenance.apply.concurrent-target-collision', `Projected target appeared after source staging; apply will not overwrite it: ${workspaceId}::${change.toPath}`, { workspaceId, path: change.toPath }));
        throw new ApplyAbort('lineage-maintenance.apply.concurrent-target-collision');
      }
      const staged = transactionStagePath(journals.get(workspaceId), change.toPath);
      await mkdir(path.dirname(target), { recursive: true });
      await rename(staged, target);
    }
    await updateLineageMaintenanceTransactionPhase(journals, 'outputs-written');
    await phase(journals, 'outputs-written', options, transactionId);

    await verifyAppliedOutputs(plan, affected, roots, findings);
    if (findings.some((item) => item.severity === 'error')) throw new ApplyAbort('lineage-maintenance.apply.post-verification-failed');
    await updateLineageMaintenanceTransactionPhase(journals, 'verified');
    await phase(journals, 'verified', options, transactionId);

    await updateLineageMaintenanceTransactionPhase(journals, 'committed');
    await phase(journals, 'committed', options, transactionId);
    await cleanupLineageMaintenanceTransaction(journals);
    await releaseLineageMaintenanceWorkspaceLocks(locks, transactionId);
    releaseLocks = false;
    return readyEnvelope(plan, affected, findings, { transactionId, durableJournal: true, locks: true });
  } catch (error) {
    if (!(error instanceof ApplyAbort)) findings.push(finding('error', 'lineage-maintenance.apply.atomic-write-failed', 'Local lineage maintenance apply failed; durable rollback was attempted.', { message: error?.message || String(error) }));
    else if (!findings.some((item) => item.severity === 'error')) findings.push(finding('error', error.code, 'Local lineage maintenance apply stopped before commit and durable rollback was attempted.'));
    let rollback = null;
    if (journals.size) {
      rollback = await rollbackLineageMaintenanceTransaction(journals, roots, { transactionId, planFingerprint: plan.planFingerprint });
      if (rollback.status !== 'ready') {
        releaseLocks = false;
        findings.push(...(rollback.findings || []));
        findings.push(finding('error', 'lineage-maintenance.apply.recovery-required', 'Automatic rollback could not complete safely. Preserve the transaction journal and run explicit lineage-maintenance recovery before any further apply.', { transactionId }));
      }
    }
    if (releaseLocks) {
      await releaseLineageMaintenanceWorkspaceLocks(locks, transactionId);
      releaseLocks = false;
    }
    return blockedEnvelope(plan, findings, { transactionId, recoveryRequired: Boolean(rollback && rollback.status !== 'ready'), rollbackDisposition: rollback?.disposition || '' });
  } finally {
    if (releaseLocks) await releaseLineageMaintenanceWorkspaceLocks(locks, transactionId);
  }
}

async function phase(journals, phaseName, options, transactionId) {
  if (typeof options.onPhase === 'function') await options.onPhase(Object.freeze({ transactionId, phase: phaseName, journals }));
}

async function qualifyAssetInspectionCurrent(plan, roots, findings) {
  if (!plan.inspection && !plan.operation?.inspectionMode) return;
  if (!plan.inspection || plan.inspection.mode !== 'local-workspace-supported-text-v1' || plan.operation?.inspectionMode !== plan.inspection.mode) {
    findings.push(finding('error','asset-relocation.apply.inspection-unqualified','Unknown workspace-inspection provenance.')); return;
  }
  const root = roots.get(String(plan.operation?.workspaceId));
  const rescanned = await inspectPortableAssetRelocationWorkspace({ workspaceRoot:root, workspaceId:plan.operation.workspaceId, assetPaths:plan.operation.selectedPaths, targetDirectory:plan.operation.targetDirectory, lineageDimension:plan.operation.lineageDimension, artifactCreation: (plan.changes || []).find(c=>c.kind==='artifact-create') ? { path: (plan.changes || []).find(c=>c.kind==='artifact-create').toPath, markdown: (plan.changes || []).find(c=>c.kind==='artifact-create').markdown } : undefined });
  if (rescanned.status !== 'ready' || rescanned.planFingerprint !== plan.planFingerprint) findings.push(finding('error','asset-relocation.apply.inspection-stale','Workspace reference/namespace discovery changed after the exact plan was inspected.',{currentStatus:rescanned.status}));
}

async function qualifyCurrentInputs(plan, roots, findings) {
  for (const input of plan.inputs || []) {
    const workspaceId = String(input.workspaceId || '');
    const root = roots.get(workspaceId);
    const absolute = safeJoin(root, input.path);
    let bytes;
    try { bytes = await readFile(absolute); }
    catch (error) { findings.push(finding('error', 'lineage-maintenance.apply.input-missing', `Plan input is unavailable: ${workspaceId}::${input.path}`, { message: error?.message || String(error) })); continue; }
    const fingerprint = stableFingerprintBytes(bytes);
    if (fingerprint !== input.fingerprint) findings.push(finding('error', 'lineage-maintenance.apply.input-drift', `Plan input changed after projection: ${workspaceId}::${input.path}`, { expected: input.fingerprint, actual: fingerprint }));
    if (plan.schema === ASSET_RELOCATION_PLAN_SCHEMA_ID && sha256Hex(bytes) !== input.sha256)
      findings.push(finding('error', 'asset-relocation.apply.input-sha256-drift', `Source strong digest differs from the projected bytes: ${workspaceId}::${input.path}`));
  }
}

async function qualifyTargetCollisions(plan, roots, findings) {
  const fromKeys = new Set((plan.changes || []).filter((item)=>item.kind!=='artifact-create').map((item) => `${item.workspaceId}::${item.fromPath}`));
  for (const change of plan.changes || []) {
    if (!change.pathChanged && !change.bytesChanged) continue;
    const root = roots.get(String(change.workspaceId));
    const target = safeJoin(root, change.toPath);
    const key = `${change.workspaceId}::${change.toPath}`;
    if (!fromKeys.has(key) && await exists(target)) findings.push(finding('error', 'lineage-maintenance.apply.target-collision', `Projected target already exists outside the input plan: ${key}`, { workspaceId: change.workspaceId, path: change.toPath }));
  }
}

async function verifyAppliedOutputs(plan, affected, roots, findings) {
  for (const change of affected) {
    const workspaceId = String(change.workspaceId);
    const root = roots.get(workspaceId);
    const target = safeJoin(root, change.toPath);
    let bytes;
    try { bytes = await readFile(target); }
    catch (error) { findings.push(finding('error', 'lineage-maintenance.apply.post-output-missing', `Applied output is unavailable: ${workspaceId}::${change.toPath}`, { message: error?.message || String(error) })); continue; }
    const actual = stableFingerprintBytes(bytes);
    if (actual !== change.afterFingerprint) findings.push(finding('error', 'lineage-maintenance.apply.post-byte-mismatch', `Applied output does not match projected bytes: ${workspaceId}::${change.toPath}`, { expected: change.afterFingerprint, actual }));
    if (plan.schema === ASSET_RELOCATION_PLAN_SCHEMA_ID) {
      if (sha256Hex(bytes) !== change.sha256) findings.push(finding('error','asset-relocation.apply.post-sha256-mismatch',`Asset output SHA-256 differs from plan: ${workspaceId}::${change.toPath}`));
      if (['artifact-create','artifact-reference-rebind'].includes(change.kind) && canonicalC14nV2SelfState(bytes.toString('utf8')).state !== 'verified') findings.push(finding('error','asset-relocation.apply.rebound-self-unqualified',`Rebound Tiinex artifact lost self integrity: ${workspaceId}::${change.toPath}`));
    } else {
      const self = canonicalC14nV2SelfState(bytes.toString('utf8'));
      if (self.state !== 'verified') findings.push(finding('error', 'lineage-maintenance.apply.post-self-unqualified', `Applied output self integrity is not verified: ${workspaceId}::${change.toPath}`, { state: self.state }));
    }
    if (change.pathChanged) {
      const old = safeJoin(root, change.fromPath);
      const oldKey = `${workspaceId}::${change.fromPath}`;
      const remainsAsOutput = (plan.changes || []).some((candidate) => `${candidate.workspaceId}::${candidate.toPath}` === oldKey);
      if (!remainsAsOutput && await exists(old)) findings.push(finding('error', 'lineage-maintenance.apply.old-path-remains', `Moved source path still exists after apply: ${oldKey}`));
    }
  }
}

function qualifyBinaryAssetPlanShape(plan) {
  const findings = [];
  const fail = (code, message) => findings.push(finding('error', `asset-relocation.apply.${code}`, message));
  if (plan.referenceCoverage !== 'complete' || plan.representationCoverage !== 'complete') fail('coverage-required','Asset relocation requires complete namespace and reference qualifications.');
  const op = plan.operation || {};
  if (op.kind !== 'relocate-assets' || !cleanRelative(op.targetDirectory, true) || !/^(?:0*[1-9]\d*)(?:-0*[1-9]\d*)*$/.test(op.lineageDimension || '')) fail('operation-invalid','Operation must specify a safe target directory and numeric lineage.');
  if (!Array.isArray(plan.inputs) || !plan.inputs.length || !Array.isArray(plan.changes) || plan.changes.length !== plan.inputs.length + (plan.changes.some(x=>x.kind==='artifact-create') ? 1 : 0) || !(plan.changes || []).some(x=>x.kind==='binary-asset')) fail('inputs-required','Every asset and reference change must have one qualified input.');
  const sources = new Set(); const targets = new Set();
  for (const change of plan.changes || []) {
    const binary = change.kind === 'binary-asset';
    const ref = ['artifact-reference-rebind','markdown-reference-rebind'].includes(change.kind);
    const created = change.kind === 'artifact-create';
    if ((!binary && !ref && !created) || !cleanRelative(change.fromPath) || !cleanRelative(change.toPath)) fail('change-invalid','Asset relocation contains an unknown or unsafe source change.');
    if (binary) {
      if (!change.pathChanged || change.bytesChanged || change.fromPath.endsWith('.trace.md') || change.toPath.endsWith('.trace.md')) fail('change-invalid','The plan contains a non-binary or unsafe asset change.');
      if (op.targetDirectory !== path.posix.dirname(change.toPath) || !path.posix.basename(change.toPath).startsWith(`${op.lineageDimension}-`)) fail('destination-unqualified','Asset target does not match the plan’s qualified lineage dimension and directory.');
    } else if (created) {
      const bytes = utf8Bytes(change.markdown || '');
      if (change.fromPath !== change.toPath || change.pathChanged || !change.bytesChanged || !change.toPath.endsWith('.trace.md')
        || path.posix.dirname(change.toPath) !== op.targetDirectory || !path.posix.basename(change.toPath).startsWith(`${op.lineageDimension}-`)
        || canonicalC14nV2SelfState(change.markdown || '').state !== 'verified'
        || stableFingerprintBytes(bytes) !== change.afterFingerprint || sha256Hex(bytes) !== change.sha256)
        fail('artifact-invalid', 'Created artifact must have exact qualified bytes, verified integrity and matching allocated lineage.');
    } else {
      if (change.pathChanged || !change.bytesChanged || change.fromPath !== change.toPath || !change.fromPath.endsWith('.md') || (change.kind==='artifact-reference-rebind') !== change.fromPath.endsWith('.trace.md') || typeof change.markdown !== 'string' || stableFingerprintBytes(utf8Bytes(change.markdown)) !== change.afterFingerprint || sha256Hex(utf8Bytes(change.markdown)) !== change.sha256) fail('reference-invalid','Rebound Markdown must be an exact source-bound inplace rewrite with matching projected output bytes.');
      if (change.kind==='artifact-reference-rebind' && canonicalC14nV2SelfState(change.markdown).state !== 'verified') fail('reference-self-invalid','Rebound Tiinex artifact requires valid self integrity.');
    }
    if (op.workspaceId !== change.workspaceId) fail('workspace-unqualified','Change outside the explicitly selected Workspace.');
    if (sources.has(change.fromPath) || targets.has(change.toPath)) fail('duplicate','Asset source or target is duplicated.');
    sources.add(change.fromPath);targets.add(change.toPath);
    const source = (plan.inputs || []).find(x => x.workspaceId === change.workspaceId && x.path === change.fromPath);
    if ((!source && !created) || (created && source) || (!created && (source.fingerprint !== change.beforeFingerprint || (binary && source.fingerprint !== change.afterFingerprint) || (binary && source.sha256 !== change.sha256) || !/^[a-f0-9]{64}$/.test(String(change.sha256)) || !/^[a-f0-9]{64}$/.test(String(source?.sha256 || ''))))) fail('input-binding-invalid','Input fingerprints and strong digests must bind exact source/output bytes.');
  }
  return findings;
}

async function qualifyBinaryAssetPaths(plan, roots, findings) {
  for (const change of plan.changes || []) {
    const root = roots.get(String(change.workspaceId));
    try { if (change.kind !== 'artifact-create') await assertNoSymlinkComponents(root, change.fromPath); await assertNoSymlinkComponents(root, change.toPath); }
    catch (error) { findings.push(finding('error','asset-relocation.apply.symlink-or-path',`Unsafe source or destination filesystem boundary: ${error.message}`)); }
  }
}

async function assertNoSymlinkComponents(root, relative) {
  if (!root || !cleanRelative(relative)) throw new Error('unqualified relative path');
  let current = path.resolve(root);
  for (const component of ['', ...relative.split('/')]) {
    if (component) current = path.join(current, component);
    let stat;
    try { stat = await lstat(current); }
    catch (error) { if (error?.code === 'ENOENT') continue; throw error; }
    if (stat.isSymbolicLink()) throw new Error(`symlink encountered at ${current}`);
    if (component === relative.split('/').at(-1) && stat.isDirectory()) throw new Error(`asset path resolves to a directory: ${current}`);
  }
}

function inputSha256(plan, workspaceId, relativePath) { return String((plan.inputs || []).find((item) => String(item.workspaceId) === workspaceId && item.path === relativePath)?.sha256 || ''); }
function inputFingerprint(plan, workspaceId, relativePath) {
  return String((plan.inputs || []).find((item) => String(item.workspaceId) === workspaceId && item.path === relativePath)?.fingerprint || '');
}
function fingerprintPlan(plan) {
  return stableFingerprintBytes(utf8Bytes(JSON.stringify({
    representationCoverage: plan.representationCoverage,
    operation: plan.operation,
    inputFingerprint: plan.inputFingerprint,
    outputs: (plan.changes || []).map(({ workspaceId, fromPath, toPath, afterFingerprint }) => ({ workspaceId, fromPath, toPath, afterFingerprint }))
  })));
}
function normalizeRoots(value) { const out = new Map(); if (value instanceof Map) return new Map([...value].map(([k,v]) => [String(k), path.resolve(String(v))])); for (const [k,v] of Object.entries(value || {})) if (v) out.set(String(k), path.resolve(String(v))); return out; }
function safeJoin(root, relative) { const absolute = path.resolve(root, String(relative || '')); const prefix = path.resolve(root) + path.sep; if (absolute !== path.resolve(root) && !absolute.startsWith(prefix)) throw new Error(`lineage-maintenance.path-outside-workspace:${relative}`); return absolute; }
async function fingerprintFile(target) { return stableFingerprintBytes(await readFile(target)); }
async function exists(target) { try { await access(target); return true; } catch { return false; } }
function readyEnvelope(plan, affected, findings, transaction) { return Object.freeze({
  schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID,
  status: 'ready', applied: true,
  transaction: Object.freeze({ id: transaction.transactionId, durableJournal: Boolean(transaction.durableJournal), cooperativeWorkspaceLocking: Boolean(transaction.locks) }),
  planFingerprint: String(plan.planFingerprint || ''), operation: plan.operation,
  changes: Object.freeze(affected.map((item) => Object.freeze({ workspaceId: item.workspaceId, fromPath: item.fromPath, toPath: item.toPath, pathChanged: item.pathChanged, bytesChanged: item.bytesChanged, semanticParentChanged: Boolean(item.semanticParent?.changed) }))),
  verification: Object.freeze({ exactProjectedBytes: true, selfIntegrityVerified: plan.schema !== ASSET_RELOCATION_PLAN_SCHEMA_ID || affected.some(x=>x.kind === 'artifact-reference-rebind'), binarySha256Verified: plan.schema === ASSET_RELOCATION_PLAN_SCHEMA_ID, unexpectedRemoteMutation: false }),
  findings: Object.freeze(findings), findingSummary: summarize(findings),
  boundary: Object.freeze({ localFilesystemMutation: Boolean(affected.length), exactPlanRequired: true, inputDriftFailsClosed: true, cooperativeWorkspaceLocking: Boolean(transaction.locks), durableTransactionJournal: Boolean(transaction.durableJournal), crashRecovery: Boolean(transaction.durableJournal), concurrentTargetCollisionFailsClosed: true, rollbackOnWriteFailure: true, rollbackOnVerificationFailure: true, planFingerprintVerified: true, remoteWrite: false, gitMutation: false })
}); }
function blocked(findings, code, message) { findings.push(finding('error', code, message)); return Object.freeze({ schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID, status: 'blocked', applied: false, findings: Object.freeze(findings), findingSummary: summarize(findings), boundary: Object.freeze({ localFilesystemMutation: false, remoteWrite: false }) }); }
function blockedEnvelope(plan, findings, transaction = {}) { return Object.freeze({ schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID, status: 'blocked', applied: false, transaction: Object.freeze({ id: String(transaction.transactionId || ''), recoveryRequired: Boolean(transaction.recoveryRequired), rollbackDisposition: String(transaction.rollbackDisposition || '') }), planFingerprint: String(plan?.planFingerprint || ''), operation: plan?.operation || null, changes: Object.freeze([]), findings: Object.freeze(findings), findingSummary: summarize(findings), boundary: Object.freeze({ localFilesystemMutation: false, durableRecoveryMayRemain: Boolean(transaction.recoveryRequired), remoteWrite: false, gitMutation: false }) }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze({ ...params }) }); }
function summarize(findings) { return Object.freeze({ error: findings.filter((x) => x.severity === 'error').length, warning: findings.filter((x) => x.severity === 'warning').length, info: findings.filter((x) => x.severity === 'info').length, total: findings.length }); }
class ApplyAbort extends Error { constructor(code) { super(code); this.name = 'ApplyAbort'; this.code = code; } }
