import { buildToolingBootstrapRuntimeIdentity } from './handoff.manufacture.bootstrap.js';

export const PORTABLE_TOOLING_RUNTIME_SOURCE_ALIGNMENT_SCHEMA_ID = 'tiinex.portable.tooling-runtime-source-alignment.v1';
const CORE_PACKAGE_NAME = '@tiinex/core';

export async function qualifyToolingRuntimeSourceAlignment(input = {}) {
  const runtimeIdentity = normalizeIdentity(input.runtimeIdentity);
  if (!runtimeIdentity.sourceRepresentationSha256) throw new Error('portable.tooling-bootstrap.runtime-source.runtime-identity-required');
  const candidates = [];
  for (const item of input.localWorkspaces || input.workspaces || []) {
    const root = String(item?.root || '').trim();
    if (!root) continue;
    const materialization = item?.materialization || item?.enumeration?.materialization || null;
    const packageIdentity = packageIdentityFromMaterialization(materialization);
    if (packageIdentity.name !== CORE_PACKAGE_NAME) continue;
    candidates.push(Object.freeze({
      workspaceId: String(item?.id || materialization?.id || '').trim(),
      root,
      packageIdentity
    }));
  }
  if (!candidates.length) return Object.freeze({
    schema: PORTABLE_TOOLING_RUNTIME_SOURCE_ALIGNMENT_SCHEMA_ID,
    state: 'not-observed',
    coreWorkspaceCount: 0,
    runtime: runtimeIdentity,
    source: null,
    boundary: 'No local Workspace with package identity @tiinex/core was selected, so exact runtime/source equality cannot be asserted from carried source.'
  });
  if (candidates.length !== 1) throw new Error(`portable.tooling-bootstrap.runtime-source.core-workspace-ambiguous:${candidates.map((item) => item.workspaceId || 'unlabeled').join(',')}`);

  const candidate = candidates[0];
  const sourceIdentity = normalizeIdentity(await buildToolingBootstrapRuntimeIdentity({
    runtimeRoot: candidate.root,
    maxFiles: input.maxFiles
  }));
  const evidence = Object.freeze({
    schema: PORTABLE_TOOLING_RUNTIME_SOURCE_ALIGNMENT_SCHEMA_ID,
    state: sourceIdentity.sourceRepresentationSha256 === runtimeIdentity.sourceRepresentationSha256 ? 'qualified-exact-match' : 'mismatch',
    coreWorkspaceCount: 1,
    workspaceId: candidate.workspaceId,
    runtime: runtimeIdentity,
    source: sourceIdentity,
    boundary: 'Exact Tooling runtime source/data equality is required when a local @tiinex/core Workspace is carried. Release-normalized package.json metadata may differ, but matching package names or versions alone are insufficient.'
  });
  if (evidence.state !== 'qualified-exact-match') {
    throw new Error([
      'portable.tooling-bootstrap.runtime-source.mismatch',
      `workspace=${candidate.workspaceId || 'unlabeled'}`,
      `runtimeVersion=${runtimeIdentity.packageVersion || 'unknown'}`,
      `sourceVersion=${sourceIdentity.packageVersion || candidate.packageIdentity.version || 'unknown'}`,
      `runtimeSource=${runtimeIdentity.sourceRepresentationSha256}`,
      `sourceSource=${sourceIdentity.sourceRepresentationSha256}`
    ].join(':'));
  }
  return evidence;
}

function packageIdentityFromMaterialization(materialization) {
  const entry = (materialization?.entries || []).find((item) => String(item?.path || '') === 'package.json');
  if (!entry?.data) return Object.freeze({ name: '', version: '' });
  try {
    const parsed = JSON.parse(new TextDecoder().decode(entry.data));
    return Object.freeze({ name: String(parsed?.name || '').trim(), version: String(parsed?.version || '').trim() });
  } catch {
    return Object.freeze({ name: '', version: '' });
  }
}

function normalizeIdentity(value = {}) {
  return Object.freeze({
    schema: String(value?.schema || 'tiinex.portable.tooling-runtime-identity.v1'),
    packageName: String(value?.packageName || ''),
    packageVersion: String(value?.packageVersion || ''),
    representationSha256: String(value?.representationSha256 || ''),
    sourceRepresentationSha256: String(value?.sourceRepresentationSha256 || ''),
    runtimeFiles: Number(value?.runtimeFiles || 0),
    runtimeBytes: Number(value?.runtimeBytes || 0),
    entrypointSha256: String(value?.entrypointSha256 || ''),
    enumerationPolicySha256: String(value?.enumerationPolicySha256 || '')
  });
}
