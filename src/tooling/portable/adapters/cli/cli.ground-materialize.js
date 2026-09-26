import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectHandoffPackageV1 } from '../../handoff/handoffPackageV1.inspect.js';
import { handoffWorkspaceProviderForId } from '../../handoff/workspaceByteProvider.js';
import { sha256Hex } from '../../../../export/package.bytes.js';

export function groundContinuationOperationInput(input = {}, flags = {}) {
  return Object.freeze({
    ...input,
    includeRequiredContext: flags.recipient ? 'all' : (flags['include-required-context'] || (flags.continue && flags.full ? 'all' : input.includeRequiredContext || '')),
    includeCurrentWork: Boolean(flags.recipient || flags['include-current-work'] || flags.continue || input.includeCurrentWork)
  });
}

export async function materializeGroundWorkspaceCliOutput(result = {}, input = {}, flags = {}) {
  const outputValue = stringFlag(flags.continue) || stringFlag(flags['materialize-workspace']) || stringFlag(flags['workspace-output']);
  if (!outputValue) {
    if (flags.continue === true) throw new Error('portable.cli.ground.continue-output.required');
    if (flags['materialize-workspace'] === true) throw new Error('portable.cli.ground.workspace-output.required');
    return result;
  }
  if (String(result?.readiness?.state || '') !== 'grounded-to-act') throw new Error('portable.cli.ground.workspace-materialization.requires-grounded-to-act');
  const inspection = inspectHandoffPackageV1(input.bundle || input.package || input);
  if (String(inspection.status || '') !== 'valid') throw new Error('portable.cli.ground.workspace-materialization.package-unqualified');
  const workspaceId = String(flags.workspace || result?.authority?.route?.workspaceId || '').trim();
  if (!workspaceId) throw new Error('portable.cli.ground.workspace-id.required');
  const workspace = handoffWorkspaceProviderForId(inspection.workspaceByteProvider, workspaceId);
  if (String(workspace.state || '') !== 'qualified') throw new Error(`portable.cli.ground.workspace-unqualified:${workspaceId}`);

  const outputDir = path.resolve(outputValue);
  await ensureEmptyOutputDirectory(outputDir);
  let totalBytes = 0;
  for (const entry of workspace.entries || []) {
    const target = safeTarget(outputDir, String(entry.path || ''));
    await mkdir(path.dirname(target), { recursive: true });
    const data = byteView(entry.data);
    await writeFile(target, data);
    totalBytes += data.byteLength;
  }
  const selectedLeafPath = String(result?.lineage?.selectedRouteLeaves?.[0]?.path || '');
  const selectedHandoffPath = selectedLeafPath.startsWith(`${workspaceId}/`) ? selectedLeafPath.slice(workspaceId.length + 1) : '';
  const workspaceInspection = (inspection.workspaces || []).find((item) => String(item.workspaceId || '') === workspaceId) || {};
  const packageParentPath = path.resolve(String(input.packageSourcePath || ''));
  const packageParentBytes = new Uint8Array(await readFile(packageParentPath));
  const continuationState = Object.freeze({
    schema: 'tiinex.portable.ground-continuation-state.v1',
    version: 1,
    packageParentPath,
    packageParentSha256: sha256Hex(packageParentBytes),
    packageParentFilename: path.basename(packageParentPath),
    selectedRoutePointer: String(result?.authority?.route?.pointerPath || input.route || ''),
    selectedRouteId: String(result?.authority?.route?.id || ''),
    selectedHandoffPath,
    workspaceId,
    workspaceTarget: String(workspaceInspection.sourceWorkspaceTargetInnerPath || ''),
    roleLabel: String(result?.authority?.role?.label || ''),
    completionQualification: projectContinuationCompletionQualification(result?.completionQualification),
    returnOutputDir: path.dirname(path.resolve(String(input.packageSourcePath || outputDir))),
    returnPackageCarrierKind: String((inspection.routes || []).find((item) => String(item.pointerPath || '') === String(result?.authority?.route?.pointerPath || input.route || ''))?.returnCarrierReservation?.carrierKind || ''),
    returnPackageSiblingIndex: String((inspection.routes || []).find((item) => String(item.pointerPath || '') === String(result?.authority?.route?.pointerPath || input.route || ''))?.returnCarrierReservation?.siblingIndex || ''),
    boundary: 'Runtime-only continuation state carried forward from one qualified ground --continue receipt. It is excluded from canonical Workspace manufacture and is not semantic authority.'
  });
  const continuationStatePath = path.join(outputDir, '.tiinex', 'continuation.json');
  await mkdir(path.dirname(continuationStatePath), { recursive: true });
  await writeFile(continuationStatePath, `${JSON.stringify(continuationState, null, 2)}\n`, 'utf8');
  const materialization = Object.freeze({
    schema: 'tiinex.portable.ground-workspace-materialization.v1',
    state: 'materialized',
    workspaceId,
    outputDir,
    workspaceState: 'writable-local-continuation',
    writable: true,
    sourceSnapshotState: 'immutable-qualified-carried-input',
    fileCount: (workspace.entries || []).length,
    totalBytes,
    archivePackagePath: String(workspace.archive?.packagePath || workspace.archive?.location || ''),
    coverage: String(workspace.materialization?.materialization || workspace.materialization?.coverage || 'complete'),
    entriesFingerprint: String(workspace.materialization?.completenessEvidence?.entriesFingerprint || workspace.binding?.completeness?.entriesFingerprint || ''),
    continuationStatePath,
    sourceMutation: false,
    remoteWrite: false,
    nextActionAfterBoundedWork: `qualify-return ${outputDir} --result <result-path> --expected <expected-file-path>`,
    boundary: 'Local exact-byte materialization of one already-qualified carried Workspace as a writable continuation plus runtime-only .tiinex continuation state. The received carried source snapshot and input carrier remain immutable inputs. The runtime state is excluded from canonical Workspace manufacture; no package content is executed, semantic authority is not inferred from filenames or output placement, and the input carrier remains untouched. Return authoring remains fail-closed until qualify-return establishes a byte-current transition for an exact bounded result.'
  });
  return Object.freeze({ ...result, continuationMaterialization: materialization });
}

async function ensureEmptyOutputDirectory(outputDir) {
  await mkdir(outputDir, { recursive: true });
  const existing = await readdir(outputDir);
  if (existing.length) throw new Error(`portable.cli.ground.workspace-output.not-empty:${outputDir}`);
}

function safeTarget(root, relative) {
  const target = path.resolve(root, relative);
  const rel = path.relative(root, target);
  if (!relative || rel === '' || rel.startsWith(`..${path.sep}`) || rel === '..' || path.isAbsolute(rel)) throw new Error(`portable.cli.ground.workspace-path.unsafe:${relative}`);
  return target;
}

function byteView(value) {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  throw new Error('portable.cli.ground.workspace-entry.bytes-unavailable');
}

function projectContinuationCompletionQualification(value = {}) {
  if (!value || typeof value !== 'object') return Object.freeze({ state: 'unavailable', boundary: 'No grounding completion qualification was carried into continuation state.' });
  return Object.freeze({
    state: String(value.state || ''),
    taskLifecycle: String(value.taskLifecycle || ''),
    doneCriteriaEvaluation: String(value.doneCriteriaEvaluation || ''),
    boundedWorkCompletion: String(value.boundedWorkCompletion || ''),
    taskClosure: String(value.taskClosure || ''),
    lifecycleQualificationOperation: String(value.lifecycleQualificationOperation || ''),
    returnExpectation: String(value.returnExpectation || ''),
    returnDisposition: String(value.returnDisposition || ''),
    returnTransition: String(value.returnTransition || ''),
    returnTiming: String(value.returnTiming || ''),
    signalKind: String(value.signalKind || ''),
    returnTo: String(value.returnTo || ''),
    returnToReference: String(value.returnToReference || ''),
    taskStatuses: Object.freeze((value.taskStatuses || []).map((item) => Object.freeze({ path: String(item?.path || ''), status: String(item?.status || '') }))),
    boundary: String(value.boundary || '')
  });
}

function stringFlag(value) { return typeof value === 'string' && value.trim() ? value.trim() : ''; }
