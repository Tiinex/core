import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { access, mkdir, open, readFile, readdir, rename, rm } from 'node:fs/promises';
import { stableFingerprintBytes, utf8Bytes } from '../../../../export/package.bytes.js';

export const LINEAGE_MAINTENANCE_TRANSACTION_SCHEMA_ID = 'tiinex.portable.lineage-maintenance-transaction.v1';
export const LINEAGE_MAINTENANCE_RECOVERY_SCHEMA_ID = 'tiinex.portable.lineage-maintenance-recovery-receipt.v1';

const LOCK_NAME = 'lineage-maintenance.lock';
const TRANSACTION_DIR_NAME = 'lineage-maintenance-transactions';
const JOURNAL_NAME = 'journal.json';

export function createLineageMaintenanceTransactionId(planFingerprint = '') {
  const head = String(planFingerprint || 'plan').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16) || 'plan';
  return `${head}-${randomUUID()}`;
}

export async function acquireLineageMaintenanceWorkspaceLocks({ workspaceIds = [], roots = new Map(), transactionId = '', planFingerprint = '' } = {}) {
  const acquired = [];
  const findings = [];
  for (const workspaceId of [...workspaceIds].map(String).sort()) {
    const root = roots.get(workspaceId);
    if (!root) {
      findings.push(finding('error', 'lineage-maintenance.apply.workspace-root-missing', `Workspace root is unavailable for ${workspaceId}.`, { workspaceId }));
      break;
    }
    const tiinex = path.join(root, '.tiinex');
    const lockPath = path.join(tiinex, LOCK_NAME);
    await mkdir(tiinex, { recursive: true });
    const value = Object.freeze({
      schema: 'tiinex.portable.lineage-maintenance-lock.v1',
      transactionId,
      planFingerprint,
      workspaceId,
      pid: process.pid,
      hostname: os.hostname(),
      createdAt: new Date().toISOString()
    });
    try {
      const handle = await open(lockPath, 'wx', 0o600);
      try {
        await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
        await handle.sync();
      } finally { await handle.close(); }
      await syncDirectory(tiinex);
      acquired.push({ workspaceId, root, lockPath, value });
    } catch (error) {
      if (error?.code === 'EEXIST') {
        const existing = await readJson(lockPath).catch(() => null);
        findings.push(finding('error', 'lineage-maintenance.apply.workspace-lock-held', `Workspace ${workspaceId} already has an active or unrecovered lineage-maintenance lock.`, {
          workspaceId,
          lockPath,
          transactionId: String(existing?.transactionId || ''),
          pid: Number(existing?.pid || 0) || null,
          hostname: String(existing?.hostname || '')
        }));
      } else {
        findings.push(finding('error', 'lineage-maintenance.apply.workspace-lock-failed', `Workspace ${workspaceId} lineage-maintenance lock could not be acquired.`, { workspaceId, message: error?.message || String(error) }));
      }
      break;
    }
  }
  if (findings.length) await releaseLineageMaintenanceWorkspaceLocks(acquired, transactionId);
  return Object.freeze({ status: findings.length ? 'blocked' : 'ready', acquired: Object.freeze(acquired), findings: Object.freeze(findings) });
}

export async function releaseLineageMaintenanceWorkspaceLocks(acquired = [], transactionId = '') {
  for (const item of [...acquired].reverse()) {
    const existing = await readJson(item.lockPath).catch(() => null);
    if (String(existing?.transactionId || '') !== String(transactionId || '')) continue;
    await rm(item.lockPath, { force: true }).catch(() => {});
    await syncDirectory(path.dirname(item.lockPath));
  }
}

export async function initializeLineageMaintenanceTransaction({ transactionId, plan, roots, workspaceIds, affected } = {}) {
  const journals = new Map();
  const createdRoots = [];
  const participants = [...workspaceIds].map(String).sort();
  const inputs = new Map((plan.inputs || []).map((item) => [`${item.workspaceId}::${item.path}`, item]));
  try {
    for (const workspaceId of participants) {
      const root = roots.get(workspaceId);
      const txRoot = path.join(root, '.tiinex', TRANSACTION_DIR_NAME, transactionId);
      await mkdir(txRoot, { recursive: true });
      createdRoots.push(txRoot);
      const changes = affected.filter((item) => String(item.workspaceId) === workspaceId).map((item) => {
        const input = inputs.get(`${item.workspaceId}::${item.fromPath}`) || {};
        return Object.freeze({
          fromPath: item.fromPath,
          toPath: item.toPath,
          inputFingerprint: String(input.fingerprint || ''),
          afterFingerprint: String(item.afterFingerprint || ''),
          pathChanged: Boolean(item.pathChanged),
          bytesChanged: Boolean(item.bytesChanged)
        });
      });
      const journal = {
        schema: LINEAGE_MAINTENANCE_TRANSACTION_SCHEMA_ID,
        transactionId,
        planFingerprint: String(plan.planFingerprint || ''),
        representationCoverage: String(plan.representationCoverage || ''),
        workspaceId,
        participants,
        phase: 'initializing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        process: { pid: process.pid, hostname: os.hostname() },
        changes
      };
      const journalPath = path.join(txRoot, JOURNAL_NAME);
      await writeJsonDurable(journalPath, journal);
      journals.set(workspaceId, { root, txRoot, journalPath, journal });
    }
    return journals;
  } catch (error) {
    for (const txRoot of createdRoots.reverse()) await rm(txRoot, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

export async function updateLineageMaintenanceTransactionPhase(journals, phase) {
  for (const [workspaceId, state] of journals) {
    const journal = { ...state.journal, phase: String(phase), updatedAt: new Date().toISOString() };
    await writeJsonDurable(state.journalPath, journal);
    journals.set(workspaceId, { ...state, journal });
  }
}

export function transactionStagePath(state, relative) {
  return safeJoin(state.txRoot, path.posix.join('stage', relative));
}

export function transactionBackupPath(state, relative) {
  return safeJoin(state.txRoot, path.posix.join('backup', relative));
}

export async function cleanupLineageMaintenanceTransaction(journals) {
  for (const state of journals.values()) {
    const parent = path.dirname(state.txRoot);
    await rm(state.txRoot, { recursive: true, force: true }).catch(() => {});
    await syncDirectory(parent);
    try {
      if ((await readdir(parent)).length === 0) await rm(parent, { recursive: true, force: true });
    } catch {}
  }
}

export async function recoverPortableLineageMaintenanceTransactions(options = {}) {
  const roots = normalizeRoots(options.workspaceRoots || options.roots || {});
  const findings = [];
  const discovered = await discoverTransactions(roots);
  const lockOnly = await discoverOrphanLocks(roots, discovered.transactionIds);
  const removedOrphanLocks = [];
  for (const item of lockOnly) {
    const ownerState = classifyLockProcess(item.lock);
    if (ownerState === 'live') {
      findings.push(finding('error', 'lineage-maintenance.recovery.active-lock', `Workspace ${item.workspaceId} has a live lineage-maintenance lock without a recoverable journal.`, { workspaceId: item.workspaceId, transactionId: String(item.lock?.transactionId || ''), pid: item.lock?.pid || null, hostname: item.lock?.hostname || '' }));
      continue;
    }
    if (ownerState !== 'dead') {
      findings.push(finding('error', 'lineage-maintenance.recovery.lock-owner-unverifiable', `Workspace ${item.workspaceId} has a lineage-maintenance lock whose owner cannot be proven dead on this host.`, { workspaceId: item.workspaceId, transactionId: String(item.lock?.transactionId || ''), pid: item.lock?.pid || null, hostname: item.lock?.hostname || '' }));
      continue;
    }
    await rm(item.lockPath, { force: true }).catch(() => {});
    await syncDirectory(path.dirname(item.lockPath));
    removedOrphanLocks.push(item.lockPath);
  }
  const recoveries = [];
  for (const group of discovered.groups.values()) {
    const result = await recoverTransactionGroup(group, roots, options);
    recoveries.push(result);
    findings.push(...result.findings);
  }
  const errors = findings.filter((item) => item.severity === 'error').length;
  return Object.freeze({
    schema: LINEAGE_MAINTENANCE_RECOVERY_SCHEMA_ID,
    status: errors ? 'blocked' : 'ready',
    recovered: errors === 0,
    transactions: Object.freeze(recoveries),
    orphanLocksRemoved: removedOrphanLocks.length,
    findings: Object.freeze(findings),
    findingSummary: summarize(findings),
    boundary: Object.freeze({ localFilesystemMutation: true, recoveryOnly: true, unexpectedBytesFailClosed: true, remoteWrite: false, gitMutation: false })
  });
}

export async function rollbackLineageMaintenanceTransaction(journals, roots, { transactionId = '', planFingerprint = '' } = {}) {
  const group = {
    transactionId,
    planFingerprint,
    journals: new Map([...journals].map(([workspaceId, state]) => [workspaceId, state.journal]))
  };
  return recoverTransactionGroup(group, roots, { allowCurrentProcess: true, keepLock: true });
}

async function recoverTransactionGroup(group, roots, options = {}) {
  const findings = [];
  const journals = group.journals;
  const first = journals.values().next().value || null;
  if (!first) return Object.freeze({ transactionId: group.transactionId, status: 'ready', disposition: 'nothing-to-recover', findings: Object.freeze([]) });
  const participants = [...new Set(first.participants || [])].map(String).sort();
  for (const journal of journals.values()) {
    if (journal.schema !== LINEAGE_MAINTENANCE_TRANSACTION_SCHEMA_ID || String(journal.transactionId || '') !== group.transactionId || String(journal.planFingerprint || '') !== String(first.planFingerprint || '')) {
      findings.push(finding('error', 'lineage-maintenance.recovery.journal-inconsistent', 'Lineage-maintenance transaction journals disagree on transaction identity or plan fingerprint.', { transactionId: group.transactionId, workspaceId: journal.workspaceId }));
    }
    if (JSON.stringify([...(journal.participants || [])].map(String).sort()) !== JSON.stringify(participants)) findings.push(finding('error', 'lineage-maintenance.recovery.participants-inconsistent', 'Lineage-maintenance transaction journals disagree on participant Workspaces.', { transactionId: group.transactionId, workspaceId: journal.workspaceId }));
  }
  for (const workspaceId of participants) {
    if (!roots.get(workspaceId)) findings.push(finding('error', 'lineage-maintenance.recovery.workspace-root-missing', `Recovery requires every participant Workspace root; ${workspaceId} is missing.`, { transactionId: group.transactionId, workspaceId }));
    if (!journals.get(workspaceId)) findings.push(finding('error', 'lineage-maintenance.recovery.journal-missing', `Recovery journal is missing for participant Workspace ${workspaceId}.`, { transactionId: group.transactionId, workspaceId }));
  }
  if (findings.length) return recoveryBlocked(group.transactionId, findings);

  for (const workspaceId of participants) {
    const root = roots.get(workspaceId);
    const lockPath = path.join(root, '.tiinex', LOCK_NAME);
    const lock = await readJson(lockPath).catch(() => null);
    if (lock && String(lock.transactionId || '') !== group.transactionId) findings.push(finding('error', 'lineage-maintenance.recovery.foreign-lock', `Workspace ${workspaceId} is locked by another lineage-maintenance transaction.`, { workspaceId, expectedTransactionId: group.transactionId, actualTransactionId: String(lock.transactionId || '') }));
    else if (lock && !options.allowCurrentProcess) {
      const ownerState = classifyLockProcess(lock);
      if (ownerState === 'live') findings.push(finding('error', 'lineage-maintenance.recovery.transaction-active', `Transaction ${group.transactionId} still appears to be active in Workspace ${workspaceId}.`, { workspaceId, pid: lock.pid || null, hostname: lock.hostname || '' }));
      else if (ownerState !== 'dead') findings.push(finding('error', 'lineage-maintenance.recovery.lock-owner-unverifiable', `Transaction ${group.transactionId} lock owner cannot be proven dead on this host.`, { workspaceId, pid: lock.pid || null, hostname: lock.hostname || '' }));
    }
  }
  if (findings.length) return recoveryBlocked(group.transactionId, findings);

  const phases = new Set([...journals.values()].map((journal) => String(journal.phase || '')));
  if (phases.size > 1) findings.push(finding('info', 'lineage-maintenance.recovery.phase-divergence', 'Participant journals were interrupted at different durable phases; recovery uses the conservative transaction-wide disposition.', { phases: [...phases].sort() }));
  const committed = [...journals.values()].every((journal) => journal.phase === 'committed');
  if (committed) {
    for (const [workspaceId, journal] of journals) {
      const root = roots.get(workspaceId);
      for (const change of journal.changes || []) {
        const target = safeJoin(root, change.toPath);
        if (!await exists(target)) findings.push(finding('error', 'lineage-maintenance.recovery.committed-output-missing', `Committed output is missing: ${workspaceId}::${change.toPath}`, { workspaceId, path: change.toPath }));
        else {
          const actual = await fingerprintFile(target);
          if (actual !== change.afterFingerprint) findings.push(finding('error', 'lineage-maintenance.recovery.committed-output-drift', `Committed output changed before recovery finalization: ${workspaceId}::${change.toPath}`, { workspaceId, path: change.toPath, expected: change.afterFingerprint, actual }));
        }
      }
    }
    if (findings.some((item) => item.severity === 'error')) return recoveryBlocked(group.transactionId, findings);
    await cleanupRecoveredTransaction(group.transactionId, participants, roots, options);
    return Object.freeze({ transactionId: group.transactionId, planFingerprint: first.planFingerprint, status: 'ready', disposition: 'finalized-commit', findings: Object.freeze(findings) });
  }

  const workspaceActions = [];
  for (const [workspaceId, journal] of journals) {
    const root = roots.get(workspaceId);
    const txRoot = path.join(root, '.tiinex', TRANSACTION_DIR_NAME, group.transactionId);
    const inputs = new Map();
    const outputs = new Map();
    const backups = new Map();
    for (const change of journal.changes || []) {
      inputs.set(change.fromPath, change.inputFingerprint);
      outputs.set(change.toPath, change.afterFingerprint);
      const backup = safeJoin(txRoot, path.posix.join('backup', change.fromPath));
      const backupExists = await exists(backup);
      const backupFingerprint = backupExists ? await fingerprintFile(backup) : '';
      if (backupExists && backupFingerprint !== change.inputFingerprint) findings.push(finding('error', 'lineage-maintenance.recovery.backup-drift', `Recovery backup bytes do not match the projected input: ${workspaceId}::${change.fromPath}`, { workspaceId, path: change.fromPath, expected: change.inputFingerprint, actual: backupFingerprint }));
      backups.set(change.fromPath, { path: backup, exists: backupExists, fingerprint: backupFingerprint });
    }
    const pathState = new Map();
    for (const relative of new Set([...inputs.keys(), ...outputs.keys()])) {
      const absolute = safeJoin(root, relative);
      const present = await exists(absolute);
      const fingerprint = present ? await fingerprintFile(absolute) : '';
      const expectedInput = inputs.get(relative) || '';
      const expectedOutput = outputs.get(relative) || '';
      const backup = backups.get(relative);
      let owner = 'absent';
      if (present && expectedOutput && fingerprint === expectedOutput) owner = 'projected-output';
      else if (present && expectedInput && !backup?.exists && fingerprint === expectedInput) owner = 'untouched-input';
      else if (present) {
        owner = 'conflict';
        findings.push(finding('error', 'lineage-maintenance.recovery.path-conflict', `Recovery path contains bytes that are neither the owned projected output nor an untouched projected input: ${workspaceId}::${relative}`, { workspaceId, path: relative, expectedInput, expectedOutput, actual: fingerprint }));
      }
      pathState.set(relative, { absolute, present, fingerprint, owner });
    }
    for (const [relative, expectedInput] of inputs) {
      const backup = backups.get(relative);
      const current = pathState.get(relative);
      if (!backup?.exists && current?.owner !== 'untouched-input') findings.push(finding('error', 'lineage-maintenance.recovery.original-unavailable', `Original input is neither preserved in backup nor present untouched at its source path: ${workspaceId}::${relative}`, { workspaceId, path: relative, expected: expectedInput }));
    }
    workspaceActions.push({ workspaceId, root, inputs, outputs, backups, pathState });
  }
  if (findings.some((item) => item.severity === 'error')) return recoveryBlocked(group.transactionId, findings);

  for (const action of workspaceActions) {
    for (const state of action.pathState.values()) if (state.owner === 'projected-output') await rm(state.absolute, { force: true });
  }
  for (const action of workspaceActions) {
    for (const [relative, backup] of action.backups) {
      if (!backup.exists) continue;
      const source = safeJoin(action.root, relative);
      if (await exists(source)) {
        const current = await fingerprintFile(source);
        if (current !== action.inputs.get(relative)) throw new Error(`lineage-maintenance.recovery.unexpected-source-after-preflight:${action.workspaceId}::${relative}`);
        await rm(source, { force: true });
      }
      await mkdir(path.dirname(source), { recursive: true });
      await rename(backup.path, source);
    }
  }
  for (const action of workspaceActions) {
    for (const [relative, expected] of action.inputs) {
      const source = safeJoin(action.root, relative);
      if (!await exists(source)) {
        findings.push(finding('error', 'lineage-maintenance.recovery.restore-missing', `Recovery did not restore the original source path: ${action.workspaceId}::${relative}`, { workspaceId: action.workspaceId, path: relative }));
        continue;
      }
      const actual = await fingerprintFile(source);
      if (actual !== expected) findings.push(finding('error', 'lineage-maintenance.recovery.restore-byte-mismatch', `Recovered source bytes do not match the projected input: ${action.workspaceId}::${relative}`, { workspaceId: action.workspaceId, path: relative, expected, actual }));
    }
  }
  if (findings.some((item) => item.severity === 'error')) return recoveryBlocked(group.transactionId, findings);
  await cleanupRecoveredTransaction(group.transactionId, participants, roots, options);
  return Object.freeze({ transactionId: group.transactionId, planFingerprint: first.planFingerprint, status: 'ready', disposition: 'rolled-back', findings: Object.freeze(findings) });
}

async function cleanupRecoveredTransaction(transactionId, participants, roots, options) {
  for (const workspaceId of participants) {
    const root = roots.get(workspaceId);
    const txRoot = path.join(root, '.tiinex', TRANSACTION_DIR_NAME, transactionId);
    await rm(txRoot, { recursive: true, force: true }).catch(() => {});
    await syncDirectory(path.dirname(txRoot));
    if (options.keepLock) continue;
    const lockPath = path.join(root, '.tiinex', LOCK_NAME);
    const lock = await readJson(lockPath).catch(() => null);
    if (String(lock?.transactionId || '') === transactionId) await rm(lockPath, { force: true }).catch(() => {});
  }
}

async function discoverTransactions(roots) {
  const groups = new Map();
  const transactionIds = new Set();
  for (const [workspaceId, root] of roots) {
    const base = path.join(root, '.tiinex', TRANSACTION_DIR_NAME);
    let names = [];
    try { names = await readdir(base); } catch { continue; }
    for (const transactionId of names.sort()) {
      const journalPath = path.join(base, transactionId, JOURNAL_NAME);
      const journal = await readJson(journalPath).catch(() => null);
      if (!journal) continue;
      transactionIds.add(transactionId);
      const group = groups.get(transactionId) || { transactionId, planFingerprint: String(journal.planFingerprint || ''), journals: new Map() };
      group.journals.set(workspaceId, journal);
      groups.set(transactionId, group);
    }
  }
  return { groups, transactionIds };
}

async function discoverOrphanLocks(roots, transactionIds) {
  const out = [];
  for (const [workspaceId, root] of roots) {
    const lockPath = path.join(root, '.tiinex', LOCK_NAME);
    const lock = await readJson(lockPath).catch(() => null);
    if (!lock) continue;
    if (!transactionIds.has(String(lock.transactionId || ''))) out.push({ workspaceId, root, lockPath, lock });
  }
  return out;
}

function classifyLockProcess(lock) {
  if (!lock) return 'absent';
  if (!String(lock.hostname || '') || String(lock.hostname || '') !== os.hostname()) return 'unknown';
  const pid = Number(lock.pid || 0);
  if (!Number.isInteger(pid) || pid <= 0) return 'unknown';
  if (pid === process.pid) return 'live';
  try { process.kill(pid, 0); return 'live'; }
  catch (error) {
    if (error?.code === 'ESRCH') return 'dead';
    if (error?.code === 'EPERM') return 'live';
    return 'unknown';
  }
}

async function writeJsonDurable(target, value) {
  await mkdir(path.dirname(target), { recursive: true });
  const temp = `${target}.tmp-${process.pid}-${randomUUID()}`;
  const handle = await open(temp, 'wx', 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await handle.sync();
  } finally { await handle.close(); }
  await rename(temp, target);
  await syncDirectory(path.dirname(target));
}

export async function writeFileDurable(target, value) {
  await mkdir(path.dirname(target), { recursive: true });
  const handle = await open(target, 'wx', 0o600);
  try {
    await handle.writeFile(value, 'utf8');
    await handle.sync();
  } finally { await handle.close(); }
  await syncDirectory(path.dirname(target));
}

async function readJson(target) { return JSON.parse(await readFile(target, 'utf8')); }
async function fingerprintFile(target) { return stableFingerprintBytes(utf8Bytes(await readFile(target, 'utf8'))); }
async function exists(target) { try { await access(target); return true; } catch { return false; } }
async function syncDirectory(directory) { let handle; try { handle = await open(directory, 'r'); await handle.sync(); } catch {} finally { await handle?.close().catch(() => {}); } }
function normalizeRoots(value) { const out = new Map(); if (value instanceof Map) return new Map([...value].map(([k,v]) => [String(k), path.resolve(String(v))])); for (const [k,v] of Object.entries(value || {})) if (v) out.set(String(k), path.resolve(String(v))); return out; }
function safeJoin(root, relative) { const absolute = path.resolve(root, String(relative || '')); const prefix = path.resolve(root) + path.sep; if (absolute !== path.resolve(root) && !absolute.startsWith(prefix)) throw new Error(`lineage-maintenance.path-outside-workspace:${relative}`); return absolute; }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze(params) }); }
function summarize(findings) { const counts = { error: 0, warning: 0, info: 0, total: findings.length }; for (const item of findings) if (counts[item.severity] !== undefined) counts[item.severity] += 1; return Object.freeze({ status: counts.error ? 'error' : counts.warning ? 'warning' : 'clean', counts: Object.freeze(counts) }); }
function recoveryBlocked(transactionId, findings) { return Object.freeze({ transactionId, status: 'blocked', disposition: 'unresolved', findings: Object.freeze(findings), findingSummary: summarize(findings) }); }
