import path from 'node:path';
import { access, cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { stableFingerprintBytes, utf8Bytes } from '../../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { LINEAGE_MAINTENANCE_PLAN_SCHEMA_ID } from '../../lineage/lineage.maintenance.projection.js';

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
  const workspaceIds = [...new Set((plan.inputs || []).map((item) => String(item.workspaceId || '')))];
  for (const id of workspaceIds) if (!roots.get(id)) findings.push(finding('error', 'lineage-maintenance.apply.workspace-root-missing', `Workspace root is unavailable for ${id}.`, { workspaceId: id }));
  if (findings.length) return blockedEnvelope(plan, findings);

  const current = [];
  for (const input of plan.inputs || []) {
    const root = roots.get(String(input.workspaceId || ''));
    const absolute = safeJoin(root, input.path);
    let markdown;
    try { markdown = await readFile(absolute, 'utf8'); }
    catch (error) { findings.push(finding('error', 'lineage-maintenance.apply.input-missing', `Plan input is unavailable: ${input.workspaceId}::${input.path}`, { message: error?.message || String(error) })); continue; }
    const fingerprint = stableFingerprintBytes(utf8Bytes(markdown));
    if (fingerprint !== input.fingerprint) findings.push(finding('error', 'lineage-maintenance.apply.input-drift', `Plan input changed after projection: ${input.workspaceId}::${input.path}`, { expected: input.fingerprint, actual: fingerprint }));
    current.push({ ...input, absolute, markdown });
  }
  if (findings.length) return blockedEnvelope(plan, findings);

  const fromKeys = new Set((plan.changes || []).map((item) => `${item.workspaceId}::${item.fromPath}`));
  for (const change of plan.changes || []) {
    if (!change.pathChanged && !change.bytesChanged) continue;
    const root = roots.get(change.workspaceId); const target = safeJoin(root, change.toPath); const key = `${change.workspaceId}::${change.toPath}`;
    if (!fromKeys.has(key) && await exists(target)) findings.push(finding('error', 'lineage-maintenance.apply.target-collision', `Projected target already exists outside the input plan: ${key}`, { workspaceId: change.workspaceId, path: change.toPath }));
  }
  if (findings.length) return blockedEnvelope(plan, findings);

  const tempRoots = new Map();
  const backups = [];
  const written = [];
  const affected = (plan.changes || []).filter((item) => item.pathChanged || item.bytesChanged);
  try {
    for (const id of workspaceIds) {
      const root = roots.get(id); const tiinex = path.join(root, '.tiinex'); await mkdir(tiinex, { recursive: true }); tempRoots.set(id, await mkdtemp(path.join(tiinex, 'lineage-maintenance-')));
    }
    for (const change of affected) {
      const temp = tempRoots.get(change.workspaceId); const staged = safeJoin(temp, path.posix.join('stage', change.toPath)); await mkdir(path.dirname(staged), { recursive: true }); await writeFile(staged, change.markdown, 'utf8');
    }
    for (const change of affected) {
      const root = roots.get(change.workspaceId); const source = safeJoin(root, change.fromPath); const temp = tempRoots.get(change.workspaceId); const backup = safeJoin(temp, path.posix.join('backup', change.fromPath));
      if (await exists(source)) { await mkdir(path.dirname(backup), { recursive: true }); await cp(source, backup); backups.push({ source, backup }); }
    }
    const outputKeys = new Set(affected.map((item) => `${item.workspaceId}::${item.toPath}`));
    for (const change of affected) {
      const sourceKey = `${change.workspaceId}::${change.fromPath}`;
      const root = roots.get(change.workspaceId); const source = safeJoin(root, change.fromPath);
      if (change.pathChanged || outputKeys.has(sourceKey)) await rm(source, { force: true });
    }
    for (const change of affected) {
      const root = roots.get(change.workspaceId); const target = safeJoin(root, change.toPath); const temp = tempRoots.get(change.workspaceId); const staged = safeJoin(temp, path.posix.join('stage', change.toPath)); await mkdir(path.dirname(target), { recursive: true }); await rename(staged, target); written.push(target);
    }
  } catch (error) {
    for (const target of written.reverse()) await rm(target, { force: true }).catch(() => {});
    for (const item of backups.reverse()) { await mkdir(path.dirname(item.source), { recursive: true }).catch(() => {}); await cp(item.backup, item.source).catch(() => {}); }
    findings.push(finding('error', 'lineage-maintenance.apply.atomic-write-failed', 'Local lineage maintenance apply failed and rollback was attempted.', { message: error?.message || String(error) }));
    await cleanup(tempRoots);
    return blockedEnvelope(plan, findings);
  }

  for (const change of affected) {
    const root = roots.get(change.workspaceId); const target = safeJoin(root, change.toPath); const markdown = await readFile(target, 'utf8');
    const actual = stableFingerprintBytes(utf8Bytes(markdown));
    if (actual !== change.afterFingerprint) findings.push(finding('error', 'lineage-maintenance.apply.post-byte-mismatch', `Applied output does not match projected bytes: ${change.workspaceId}::${change.toPath}`, { expected: change.afterFingerprint, actual }));
    const self = canonicalC14nV2SelfState(markdown); if (self.state !== 'verified') findings.push(finding('error', 'lineage-maintenance.apply.post-self-unqualified', `Applied output self integrity is not verified: ${change.workspaceId}::${change.toPath}`, { state: self.state }));
    if (change.pathChanged) {
      const old = safeJoin(root, change.fromPath); const oldKey = `${change.workspaceId}::${change.fromPath}`;
      const remainsAsOutput = (plan.changes || []).some((candidate) => `${candidate.workspaceId}::${candidate.toPath}` === oldKey);
      if (!remainsAsOutput && await exists(old)) findings.push(finding('error', 'lineage-maintenance.apply.old-path-remains', `Moved source path still exists after apply: ${oldKey}`));
    }
  }
  const errors = findings.filter((item) => item.severity === 'error').length;
  if (errors) {
    for (const target of written.reverse()) await rm(target, { force: true }).catch(() => {});
    for (const item of backups.reverse()) { await mkdir(path.dirname(item.source), { recursive: true }).catch(() => {}); await cp(item.backup, item.source).catch(() => {}); }
  }
  await cleanup(tempRoots);
  return Object.freeze({
    schema: LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID,
    status: errors ? 'blocked' : 'ready',
    applied: errors === 0,
    planFingerprint: String(plan.planFingerprint || ''),
    operation: plan.operation,
    changes: Object.freeze(affected.map((item) => Object.freeze({ workspaceId: item.workspaceId, fromPath: item.fromPath, toPath: item.toPath, pathChanged: item.pathChanged, bytesChanged: item.bytesChanged, semanticParentChanged: Boolean(item.semanticParent?.changed) }))),
    verification: Object.freeze({ exactProjectedBytes: errors === 0, selfIntegrityVerified: errors === 0, unexpectedRemoteMutation: false }),
    findings: Object.freeze(findings), findingSummary: summarize(findings),
    boundary: Object.freeze({ localFilesystemMutation: true, exactPlanRequired: true, inputDriftFailsClosed: true, rollbackOnWriteFailure: true, rollbackOnVerificationFailure: true, planFingerprintVerified: true, remoteWrite: false, gitMutation: false })
  });
}

function fingerprintPlan(plan) {
  return stableFingerprintBytes(utf8Bytes(JSON.stringify({
    operation: plan.operation,
    inputFingerprint: plan.inputFingerprint,
    outputs: (plan.changes || []).map(({ workspaceId, fromPath, toPath, afterFingerprint }) => ({ workspaceId, fromPath, toPath, afterFingerprint }))
  })));
}
function normalizeRoots(value) { const out = new Map(); if (value instanceof Map) return new Map([...value].map(([k,v])=>[String(k),path.resolve(String(v))])); for (const [k,v] of Object.entries(value || {})) if (v) out.set(String(k), path.resolve(String(v))); return out; }
function safeJoin(root, relative) { const absolute = path.resolve(root, String(relative || '')); const prefix = path.resolve(root) + path.sep; if (absolute !== path.resolve(root) && !absolute.startsWith(prefix)) throw new Error(`lineage-maintenance.path-outside-workspace:${relative}`); return absolute; }
async function exists(target){try{await access(target);return true;}catch{return false;}}
async function cleanup(values){for(const value of values.values())await rm(value,{recursive:true,force:true}).catch(()=>{});}
function blocked(findings, code, message){findings.push(finding('error',code,message));return Object.freeze({schema:LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID,status:'blocked',applied:false,findings:Object.freeze(findings),findingSummary:summarize(findings),boundary:Object.freeze({localFilesystemMutation:false,remoteWrite:false})});}
function blockedEnvelope(plan, findings){return Object.freeze({schema:LINEAGE_MAINTENANCE_APPLY_SCHEMA_ID,status:'blocked',applied:false,planFingerprint:String(plan?.planFingerprint||''),operation:plan?.operation||null,changes:Object.freeze([]),findings:Object.freeze(findings),findingSummary:summarize(findings),boundary:Object.freeze({localFilesystemMutation:false,remoteWrite:false})});}
function finding(severity,code,message,params={}){return Object.freeze({severity,code,message,params:Object.freeze({...params})});}
function summarize(findings){return Object.freeze({error:findings.filter((x)=>x.severity==='error').length,warning:findings.filter((x)=>x.severity==='warning').length,info:findings.filter((x)=>x.severity==='info').length,total:findings.length});}
