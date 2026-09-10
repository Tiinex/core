import path from 'node:path';
import { enumerateNodeWorkspace } from './handoff.manufacture.enumeration.js';
import { loadNodePortableInput } from '../../input/node.input.js';
import { inspectRecipientFacingV2Topology } from '../../handoff/recipientV2.inspect.js';
import { handoffWorkspaceProviderForId, listHandoffWorkspaceEntries } from '../../handoff/workspaceByteProvider.js';
import { safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import { portableFinding } from '../../findings.js';
import {
  PORTABLE_SOURCE_FRONTIER_SCHEMA_ID,
  compareOrReconcilePortableSourceFrontiers,
  createPortableSourceFrontier
} from '../../comparison/sourceFrontierComparison.js';

export const PORTABLE_NODE_SOURCE_FRONTIER_INPUT_SCHEMA_ID = 'tiinex.portable.node-source-frontier-input.v1';

export async function prepareNodeSourceFrontierComparisonInput(input = {}, options = {}) {
  if (input.base || input.incoming || input.current) {
    if (!input.base || !input.incoming || !input.current) return { base: invalidFrontier('base', 'three-way-input-incomplete'), incoming: invalidFrontier('incoming', 'three-way-input-incomplete'), current: invalidFrontier('current', 'three-way-input-incomplete') };
    const [base, incoming, current] = await Promise.all([
      prepareNodeSourceFrontier(input.base, { ...options, side: 'base' }),
      prepareNodeSourceFrontier(input.incoming, { ...options, side: 'incoming' }),
      prepareNodeSourceFrontier(input.current, { ...options, side: 'current' })
    ]);
    return Object.freeze({ base, incoming, current });
  }
  const [left, right] = await Promise.all([
    prepareNodeSourceFrontier(input.left, { ...options, side: 'left' }),
    prepareNodeSourceFrontier(input.right, { ...options, side: 'right' })
  ]);
  return Object.freeze({ left, right });
}

export async function compareNodeSourceFrontiers(input = {}, options = {}) {
  const normalized = await prepareNodeSourceFrontierComparisonInput(input, options);
  return compareOrReconcilePortableSourceFrontiers(normalized);
}

export async function prepareNodeSourceFrontier(descriptor = {}, options = {}) {
  if (descriptor?.schema === PORTABLE_SOURCE_FRONTIER_SCHEMA_ID) return createPortableSourceFrontier(descriptor);
  const kind = String(descriptor?.kind || '').trim().toLowerCase();
  if (!kind) return invalidFrontier(options.side || '', 'input-kind-required', portableFinding('error', 'portable.source-frontier.node.kind-required', 'Node source-frontier input requires an explicit kind; filesystem/package type is never guessed.', { side: options.side || '' }));
  if (kind === 'local-workspace') return frontierFromLocalWorkspace(descriptor, options);
  if (kind === 'local-frontier') return frontierFromLocalWorkspaceSet(descriptor, options);
  if (kind === 'handoff-package') return frontierFromHandoffPackage(descriptor, options);
  if (kind === 'qualified-workspace-provider') return frontierFromQualifiedProvider(descriptor, options);
  if (kind === 'normalized-frontier') return createPortableSourceFrontier(descriptor.frontier || descriptor.value || {});
  return invalidFrontier(options.side || '', 'input-kind-unsupported', portableFinding('error', 'portable.source-frontier.node.kind-unsupported', 'Node source-frontier input kind is unsupported.', { kind, side: options.side || '' }));
}

async function frontierFromLocalWorkspace(descriptor, options) {
  const rootText = String(descriptor.root || descriptor.path || descriptor.workspaceRoot || '').trim();
  if (!rootText) return invalidFrontier(options.side || '', 'local-workspace-root-required', portableFinding('error', 'portable.source-frontier.node.local-root-required', 'Local Workspace comparison input requires an explicit root path.', { side: options.side || '' }));
  const root = path.resolve(rootText);
  const workspaceId = safeWorkspaceToken(descriptor.workspaceId || descriptor.id || path.basename(root) || 'workspace');
  try {
    const enumeration = await enumerateNodeWorkspace(root, enumerationOptions(descriptor, options, workspaceId));
    if (enumeration.status !== 'qualified-complete') return invalidFrontier(options.side || '', `local-enumeration-${enumeration.status}`, portableFinding('error', 'portable.source-frontier.node.local-enumeration-unqualified', 'Local Workspace source enumeration did not qualify as complete under the shared manufacture snapshot contract.', { workspaceId, status: enumeration.status }));
    return createPortableSourceFrontier({
      id: descriptor.label || `${options.side || 'input'}:${workspaceId}`,
      source: { kind: 'local-workspace', ref: root, snapshotContract: 'shared-handoff-manufacture-node-enumeration-v1' },
      workspaces: [workspaceFromEnumeration(workspaceId, enumeration, root)],
      boundary: 'Local source is enumerated by the same deterministic Node Workspace enumerator used by Handoff manufacture; excluded directories and symlink policy therefore remain shared.'
    });
  } catch (error) {
    return createPortableSourceFrontier({ id: descriptor.label || options.side || '', state: 'qualification-error', source: { kind: 'local-workspace', ref: root }, workspaces: [{ workspaceId, state: 'unavailable', reason: 'local-workspace-read-failed', source: { kind: 'local-workspace', ref: root } }], findings: [portableFinding('error', 'portable.source-frontier.node.local-read-failed', 'Local Workspace source could not be enumerated.', { workspaceId, ref: root, detail: String(error?.message || error || '') })] });
  }
}

async function frontierFromLocalWorkspaceSet(descriptor, options) {
  const specs = Array.isArray(descriptor.workspaces) ? descriptor.workspaces : [];
  if (!specs.length) return invalidFrontier(options.side || '', 'local-frontier-workspaces-required', portableFinding('error', 'portable.source-frontier.node.local-frontier-empty', 'Local multi-Workspace frontier requires at least one explicit Workspace root binding.', { side: options.side || '' }));
  const results = await Promise.all(specs.map(async (spec, index) => {
    const rootText = String(spec.root || spec.path || spec.workspaceRoot || '').trim();
    if (!rootText) return { workspaceId: String(spec.workspaceId || spec.id || `workspace-${index + 1}`), state: 'unavailable', reason: 'local-workspace-root-required', source: { kind: 'local-workspace' }, finding: portableFinding('error', 'portable.source-frontier.node.local-root-required', 'Local frontier Workspace binding requires an explicit root path.', { index }) };
    const root = path.resolve(rootText);
    const workspaceId = safeWorkspaceToken(spec.workspaceId || spec.id || '');
    if (!spec.workspaceId && !spec.id) return { workspaceId: `unresolved-${index + 1}`, state: 'qualification-error', reason: 'workspace-id-required', source: { kind: 'local-workspace', ref: root }, finding: portableFinding('error', 'portable.source-frontier.node.local-frontier-id-required', 'Every local multi-Workspace root requires an explicit Workspace id.', { ref: root }) };
    try {
      const enumeration = await enumerateNodeWorkspace(root, enumerationOptions({ ...descriptor, ...spec }, options, workspaceId));
      if (enumeration.status !== 'qualified-complete') return { workspaceId, state: 'qualification-error', reason: `enumeration-${enumeration.status}`, source: { kind: 'local-workspace', ref: root }, finding: portableFinding('error', 'portable.source-frontier.node.local-enumeration-unqualified', 'Local frontier Workspace did not qualify as a complete manufacture-equivalent snapshot.', { workspaceId, status: enumeration.status }) };
      return workspaceFromEnumeration(workspaceId, enumeration, root);
    } catch (error) {
      return { workspaceId, state: 'unavailable', reason: 'local-workspace-read-failed', source: { kind: 'local-workspace', ref: root }, finding: portableFinding('error', 'portable.source-frontier.node.local-read-failed', 'Local frontier Workspace source could not be enumerated.', { workspaceId, ref: root, detail: String(error?.message || error || '') }) };
    }
  }));
  const findings = results.map((item) => item.finding).filter(Boolean);
  return createPortableSourceFrontier({
    id: descriptor.label || options.side || 'local-frontier',
    state: findings.some((item) => item.severity === 'error') ? 'qualification-error' : 'qualified',
    source: { kind: 'local-frontier', workspaceCount: specs.length, snapshotContract: 'shared-handoff-manufacture-node-enumeration-v1' },
    workspaces: results.map(({ finding, ...workspace }) => workspace),
    findings,
    boundary: 'Explicit local multi-Workspace roots, each enumerated by the shared Handoff-manufacture Workspace snapshot contract. Workspace ids are never inferred across the multi-root boundary.'
  });
}

async function frontierFromHandoffPackage(descriptor, options) {
  const packagePathText = String(descriptor.path || descriptor.packagePath || descriptor.root || '').trim();
  if (!packagePathText) return invalidFrontier(options.side || '', 'handoff-package-path-required', portableFinding('error', 'portable.source-frontier.node.package-path-required', 'Handoff-package comparison input requires an explicit package path.', { side: options.side || '' }));
  const packagePath = path.resolve(packagePathText);
  let material;
  try {
    material = await loadNodePortableInput([packagePath], { maxFiles: descriptor.maxCarrierFiles || options.maxCarrierFiles || 10000, maxTextBytes: descriptor.maxTextBytes || options.maxTextBytes || 16 * 1024 * 1024 });
  } catch (error) {
    return invalidFrontier(options.side || '', 'handoff-package-read-failed', portableFinding('error', 'portable.source-frontier.node.package-read-failed', 'Handoff package could not be read by current trusted Core Tooling.', { ref: packagePath, detail: String(error?.message || error || '') }));
  }
  const loaderErrors = (material.findings || []).filter((item) => item.severity === 'error');
  const inspection = inspectRecipientFacingV2Topology(material);
  if (loaderErrors.length || inspection.status !== 'valid') {
    return createPortableSourceFrontier({
      id: descriptor.label || options.side || '', state: 'qualification-error', source: { kind: 'handoff-package', ref: packagePath, qualification: inspection.status || 'invalid' }, workspaces: [],
      findings: [...loaderErrors, ...(inspection.findings || []).filter((item) => item.severity === 'error').map((item) => portableFinding('error', item.code || 'portable.source-frontier.package-unqualified', item.message || 'Handoff package qualification failed.', { ref: item.path || packagePath }))],
      boundary: 'Received Handoff package failed current trusted Core package qualification; no Workspace source paths are projected for comparison.'
    });
  }

  const availableIds = new Set([...(inspection.workspaces || []).map((item) => String(item.workspaceId || '')), ...(inspection.sealedWorkspaces || []).map((item) => String(item.workspaceId || ''))].filter(Boolean));
  const selectors = normalizeSelectors(descriptor.workspaceIds || descriptor.select || descriptor.workspaces);
  const ids = selectors.length ? selectors : [...availableIds].sort();
  const openedById = new Map((descriptor.openedWorkspaces || []).map((item) => [String(item?.workspaceId || ''), item]).filter(([id]) => id));
  const sealedById = new Map((inspection.sealedWorkspaces || []).map((item) => [String(item.workspaceId || ''), item]).filter(([id]) => id));
  const workspaces = ids.map((workspaceId) => {
    if (!availableIds.has(workspaceId)) return { workspaceId, state: 'unavailable', reason: 'workspace-not-carried', source: { kind: 'handoff-package', ref: packagePath } };
    const sealedBinding = sealedById.get(workspaceId) || null;
    const opened = openedById.get(workspaceId) || null;
    if (sealedBinding && authorizedOpenMatchesSealedBinding(opened, sealedBinding, workspaceId)) {
      const normalized = workspaceFromProvider(workspaceId, opened.provider, { kind: 'authorized-opened-workspace-provider', packageRef: packagePath });
      if (normalized.state === 'qualified') return normalized;
    }
    if (sealedBinding) return { workspaceId, state: 'locked', qualification: 'locked-qualified-sealed-binding', reason: opened ? 'authorized-open-result-does-not-match-sealed-binding' : 'password-sealed-workspace-not-opened', source: { kind: 'handoff-package', ref: packagePath, binding: 'password-sealed-workspace-byte-tree' } };
    return workspaceFromProvider(workspaceId, inspection.workspaceByteProvider, { kind: 'qualified-handoff-package-workspace', packageRef: packagePath });
  });
  return createPortableSourceFrontier({
    id: descriptor.label || options.side || path.basename(packagePath),
    source: { kind: 'handoff-package', ref: packagePath, qualification: 'qualified-current-tooling', format: String(inspection.format || '') },
    workspaces,
    boundary: 'Handoff inputs are inspected by the receiver current trusted Core Tooling. Clear qualified Workspace providers expose exact path/hash source; sealed bindings remain locked unless caller supplies an already-authorized qualified opened provider.'
  });
}

function authorizedOpenMatchesSealedBinding(opened, sealedBinding, workspaceId) {
  if (!opened || opened.state !== 'opened-qualified' || !opened.provider) return false;
  if (String(opened.workspaceId || '') !== String(workspaceId || '')) return false;
  if (String(opened.workspaceArtifactPath || '') !== String(sealedBinding.workspaceArtifactPath || '')) return false;
  if (String(opened.workspaceArtifactSha256 || '').toLowerCase() !== String(sealedBinding.workspaceArtifactSha256 || '').toLowerCase()) return false;
  return true;
}

function frontierFromQualifiedProvider(descriptor, options) {
  const provider = descriptor.provider || descriptor.value || null;
  const providerIds = Array.isArray(provider?.workspaces) ? provider.workspaces.map((item) => String(item?.id || '')).filter(Boolean) : [];
  const selectors = normalizeSelectors(descriptor.workspaceIds || descriptor.select || descriptor.workspaces);
  const ids = selectors.length ? selectors : providerIds.sort();
  if (!provider || !ids.length) return invalidFrontier(options.side || '', 'provider-unavailable', portableFinding('error', 'portable.source-frontier.node.provider-unavailable', 'Qualified Workspace provider input must expose at least one explicit or discoverable Workspace id.', { side: options.side || '' }));
  return createPortableSourceFrontier({ id: descriptor.label || options.side || 'qualified-provider', source: { kind: 'qualified-workspace-provider' }, workspaces: ids.map((id) => workspaceFromProvider(id, provider, { kind: 'qualified-workspace-provider' })) });
}

function workspaceFromEnumeration(workspaceId, enumeration, root) {
  return {
    workspaceId, state: 'qualified', qualification: 'qualified-complete-manufacture-enumeration', source: { kind: 'local-workspace', ref: root },
    entries: (enumeration.materialization?.includedEntries || []).map((entry) => ({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256 })),
    evidence: { ...(enumeration.evidence || {}), sourceSelection: 'enumerateNodeWorkspace' }
  };
}

function workspaceFromProvider(workspaceId, provider, source) {
  const workspace = handoffWorkspaceProviderForId(provider, workspaceId);
  if (!workspace || workspace.state !== 'qualified') return { workspaceId, state: workspace?.state === 'locked' ? 'locked' : 'qualification-error', qualification: String(workspace?.state || 'provider-unresolved'), reason: 'qualified-workspace-provider-unresolved', source };
  const entries = listHandoffWorkspaceEntries(provider, workspaceId);
  return {
    workspaceId, state: 'qualified', qualification: 'qualified-exact-package-provider', source,
    entries: entries.map((entry) => ({ path: entry.path || entry.innerPath, bytes: entry.bytes, sha256: entry.sha256 })),
    evidence: { providerSchema: String(provider.schema || ''), providerState: String(provider.status || ''), workspaceMode: String(workspace.mode || ''), coverage: String(workspace.materialization?.materialization || workspace.binding?.coverage || '') }
  };
}

function enumerationOptions(descriptor, options, workspaceId) {
  return {
    workspaceId,
    workspaceTitle: String(descriptor.workspaceTitle || descriptor.title || workspaceId),
    sourceMetadata: descriptor.sourceMetadata || {},
    excludeDirectories: descriptor.excludeDirectories || options.excludeDirectories,
    maxFiles: descriptor.maxFiles || options.maxFiles
  };
}

function normalizeSelectors(value) {
  const list = Array.isArray(value) ? value : value ? String(value).split(',') : [];
  return [...new Set(list.map((item) => typeof item === 'string' ? item.trim() : String(item?.workspaceId || item?.id || '').trim()).filter(Boolean))].sort();
}

function invalidFrontier(id, reason, finding = null) {
  return createPortableSourceFrontier({ id, state: 'qualification-error', source: { kind: 'unavailable', reason }, workspaces: [], findings: [finding || portableFinding('error', 'portable.source-frontier.node.input-invalid', 'Node source-frontier input is invalid.', { reason })] });
}
