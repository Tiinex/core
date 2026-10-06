import path from 'node:path';
import { access, mkdir, readFile, rename } from 'node:fs/promises';
import { stableFingerprintBytes, utf8Bytes } from '../../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID } from '../../lineage/lineage.maintenance.projection.js';
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
  if (plan?.schema !== LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID || plan?.status !== 'ready' || plan?.executable !== true) {
    return blocked(findings, 'lineage-maintenance.apply.plan-unqualified', 'Lineage maintenance apply requires one exact ready executable plan.');
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
    await qualifyTargetCollisions(plan, roots, findings);
    if (findings.length) throw new ApplyAbort('lineage-maintenance.apply.pre-mutation-requalification-failed');

    journals = await initializeLineageMaintenanceTransaction({ transactionId, plan, roots, workspaceIds, affected });
    await phase(journals, 'initializing', options, transactionId);

    for (const change of affected) {
      const state = journals.get(String(change.workspaceId));
      const staged = transactionStagePath(state, change.toPath);
      await writeFileDurable(staged, change.markdown);
    }
    await updateLineageMaintenanceTransactionPhase(journals, 'prepared');
    await phase(journals, 'prepared', options, transactionId);

    for (const change of affected) {
      const workspaceId = String(change.workspaceId);
      const root = roots.get(workspaceId);
      const source = safeJoin(root, change.fromPath);
      const expected = inputFingerprint(plan, workspaceId, change.fromPath);
      if (!await exists(source)) {
        findings.push(finding('error', 'lineage-maintenance.apply.input-missing-after-lock', `Plan input disappeared after workspace locking: ${workspaceId}::${change.fromPath}`, { workspaceId, path: change.fromPath }));
        throw new ApplyAbort('lineage-maintenance.apply.input-missing-after-lock');
      }
      const actual = await fingerprintFile(source);
      if (actual !== expected) {
        findings.push(finding('error', 'lineage-maintenance.apply.concurrent-input-drift', `Plan input changed after workspace locking and before destructive mutation: ${workspaceId}::${change.fromPath}`, { workspaceId, path: change.fromPath, expected, actual }));
        throw new ApplyAbort('lineage-maintenance.apply.concurrent-input-drift');
      }
      const state = journals.get(workspaceId);
      const backup = transactionBackupPath(state, change.fromPath);
      await mkdir(path.dirname(backup), { recursive: true });
      await rename(source, backup);
      const backupFingerprint = await fingerprintFile(backup);
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

async function qualifyCurrentInputs(plan, roots, findings) {
  for (const input of plan.inputs || []) {
    const workspaceId = String(input.workspaceId || '');
    const root = roots.get(workspaceId);
    const absolute = safeJoin(root, input.path);
    let markdown;
    try { markdown = await readFile(absolute, 'utf8'); }
    catch (error) { findings.push(finding('error', 'lineage-maintenance.apply.input-missing', `Plan input is unavailable: ${workspaceId}::${input.path}`, { message: error?.message || String(error) })); continue; }
    const fingerprint = stableFingerprintBytes(utf8Bytes(markdown));
    if (fingerprint !== input.fingerprint) findings.push(finding('error', 'lineage-maintenance.apply.input-drift', `Plan input changed after projection: ${workspaceId}::${input.path}`, { expected: input.fingerprint, actual: fingerprint }));
  }
}

async function qualifyTargetCollisions(plan, roots, findings) {
  const fromKeys = new Set((plan.changes || []).map((item) => `${item.workspaceId}::${item.fromPath}`));
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
    let markdown;
    try { markdown = await readFile(target, 'utf8'); }
    catch (error) { findings.push(finding('error', 'lineage-maintenance.apply.post-output-missing', `Applied output is unavailable: ${workspaceId}::${change.toPath}`, { message: error?.message || String(error) })); continue; }
    const actual = stableFingerprintBytes(utf8Bytes(markdown));
    if (actual !== change.afterFingerprint) findings.push(finding('error', 'lineage-maintenance.apply.post-byte-mismatch', `Applied output does not match projected bytes: ${workspaceId}::${change.toPath}`, { expected: change.afterFingerprint, actual }));
    const self = canonicalC14nV2SelfState(markdown);
    if (self.state !== 'verified') findings.push(finding('error', 'lineage-maintenance.apply.post-self-unqualified', `Applied output self integrity is not verified: ${workspaceId}::${change.toPath}`, { state: self.state }));
    if (change.pathChanged) {
      const old = safeJoin(root, change.fromPath);
      const oldKey = `${workspaceId}::${change.fromPath}`;
      const remainsAsOutput = (plan.changes || []).some((candidate) => `${candidate.workspaceId}::${candidate.toPath}` === oldKey);
      if (!remainsAsOutput && await exists(old)) findings.push(finding('error', 'lineage-maintenance.apply.old-path-remains', `Moved source path still exists after apply: ${oldKey}`));
    }
  }
}

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
async function fingerprintFile(target) { return stableFingerprintBytes(utf8Bytes(await readFile(target, 'utf8'))); }
async function exists(target) { try { await access(target); return true; } catch { return false; } }
function readyEnvelope(plan, affected, findings, transaction) { return Object.freeze({
  schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID,
  status: 'ready', applied: true,
  transaction: Object.freeze({ id: transaction.transactionId, durableJournal: Boolean(transaction.durableJournal), cooperativeWorkspaceLocking: Boolean(transaction.locks) }),
  planFingerprint: String(plan.planFingerprint || ''), operation: plan.operation,
  changes: Object.freeze(affected.map((item) => Object.freeze({ workspaceId: item.workspaceId, fromPath: item.fromPath, toPath: item.toPath, pathChanged: item.pathChanged, bytesChanged: item.bytesChanged, semanticParentChanged: Boolean(item.semanticParent?.changed) }))),
  verification: Object.freeze({ exactProjectedBytes: true, selfIntegrityVerified: true, unexpectedRemoteMutation: false }),
  findings: Object.freeze(findings), findingSummary: summarize(findings),
  boundary: Object.freeze({ localFilesystemMutation: Boolean(affected.length), exactPlanRequired: true, inputDriftFailsClosed: true, cooperativeWorkspaceLocking: Boolean(transaction.locks), durableTransactionJournal: Boolean(transaction.durableJournal), crashRecovery: Boolean(transaction.durableJournal), concurrentTargetCollisionFailsClosed: true, rollbackOnWriteFailure: true, rollbackOnVerificationFailure: true, planFingerprintVerified: true, remoteWrite: false, gitMutation: false })
}); }
function blocked(findings, code, message) { findings.push(finding('error', code, message)); return Object.freeze({ schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID, status: 'blocked', applied: false, findings: Object.freeze(findings), findingSummary: summarize(findings), boundary: Object.freeze({ localFilesystemMutation: false, remoteWrite: false }) }); }
function blockedEnvelope(plan, findings, transaction = {}) { return Object.freeze({ schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID, status: 'blocked', applied: false, transaction: Object.freeze({ id: String(transaction.transactionId || ''), recoveryRequired: Boolean(transaction.recoveryRequired), rollbackDisposition: String(transaction.rollbackDisposition || '') }), planFingerprint: String(plan?.planFingerprint || ''), operation: plan?.operation || null, changes: Object.freeze([]), findings: Object.freeze(findings), findingSummary: summarize(findings), boundary: Object.freeze({ localFilesystemMutation: false, durableRecoveryMayRemain: Boolean(transaction.recoveryRequired), remoteWrite: false, gitMutation: false }) }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze({ ...params }) }); }
function summarize(findings) { return Object.freeze({ error: findings.filter((x) => x.severity === 'error').length, warning: findings.filter((x) => x.severity === 'warning').length, info: findings.filter((x) => x.severity === 'info').length, total: findings.length }); }
class ApplyAbort extends Error { constructor(code) { super(code); this.name = 'ApplyAbort'; this.code = code; } }
