import { finalizeFile } from '../../../export/package.fileMap.js';
import { summarizePortableFindings } from '../findings.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { renderRecipientV2Pointer } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH, RECIPIENT_V2_FORMAT_ID } from './recipientV2.topology.js';
import { recipientV2BootstrapEntryCurrentRead } from './recipientV2.entryContract.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { buildRecipientV2BootstrapCarrier, recipientV2ParentAuthority } from './recipientV2.topology.workspaces.js';
import { RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
import { BOOTSTRAP_PACKAGE_ROLE, renderHandoffPackageV1 } from './recipientV2.packageV1.contract.js';
import { deepFreeze } from './recipientV2.packageV1.shared.js';
import { inspectRecipientFacingV2Topology, roundTripRecipientFacingV2Topology } from './recipientV2.inspect.js';

export function manufactureRecipientRelativeBootstrapPackage(input = {}) {
  const findings = [];
  const createdAt = String(input.createdAt || '1970-01-01 00:00:00');
  const bootstrapSource = (input.additionalTransportFiles || []).filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/'));
  const sourceInspection = inspectPortableToolingBootstrap({ files: bootstrapSource });
  if (sourceInspection.status !== 'valid') findings.push(...(sourceInspection.findings || []));
  if (!bootstrapSource.length) findings.push(Object.freeze({ severity: 'error', code: 'portable.bootstrap-carrier.bootstrap-missing', message: 'Bootstrap-only carrier requires one qualified portable Tooling bootstrap source.' }));
  const packageFile = finalizeFile({
    path: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH,
    kind: 'tiinex-handoff-package-artifact', logicalKind: 'recipient-v2-package-v1-root', mediaType: 'text/markdown',
    content: renderHandoffPackageV1({ createdAt, packageRole: BOOTSTRAP_PACKAGE_ROLE, workspaces: [], materialRepresentations: [], carrierLineage: input.carrierLineage || {}, carrierProfile: input.carrierProfile || null, startPath: RECIPIENT_V2_READ_PATH, bootstrapPath: '001-2-bootstrap.trace.md' })
  });
  const packageParent = recipientV2ParentAuthority(packageFile, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET, createdAt);
  const files = [packageFile];
  const bootstrap = bootstrapSource.length ? buildRecipientV2BootstrapCarrier(bootstrapSource, createdAt, findings, packageParent) : null;
  if (bootstrap) files.push(bootstrap.artifact, bootstrap.payload);
  const readFacts = recipientV2TransportFacts('recovery-orientation', {
    format: 'tiinex-recipient-facing-handoff-package-v1', packageRole: BOOTSTRAP_PACKAGE_ROLE,
    packageRootPath: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, entryArtifactPath: RECIPIENT_V2_READ_PATH,
    artifactSurface: 'tiinex.handoff.package.v1-plus-qualified-bootstrap-only', routeAuthority: 'none', routeSelectionAuthority: 'none', siblingRouteInference: false,
    carrierLineage: input.carrierLineage || null, pathParentProjection: true, pathAuthority: false
  });
  const readFile = finalizeFile({
    path: RECIPIENT_V2_READ_PATH, kind: 'handoff-recovery-pointer', logicalKind: 'recipient-v2-package-v1-bootstrap-recovery-orientation', mediaType: 'text/markdown', transportFacts: readFacts,
    content: renderRecipientV2Pointer({ createdAt, parent: packageParent, role: 'recovery-orientation', title: 'READ BEFORE PROCEEDING — Tiinex Bootstrap Carrier', summary: 'Qualified recovery/orientation Pointer for a bootstrap-only package-v1 carrier.', prose: 'Read this Start artifact first and qualify the declared Tooling bootstrap. This carrier intentionally contains no project/source Workspace material and no Handoff route. Do not infer recipient, holder, Role, current-work, participation, delegation, or grounded-to-act authority from transport.', currentRead: [...recipientV2BootstrapEntryCurrentRead(), { label: 'Package Artifact', value: `[Bootstrap Package](${RECIPIENT_V2_PACKAGE_V1_ROOT_PATH})` }, { label: 'Carrier Dimension', value: `\`${String(input.carrierLineage?.dimension || '001')}\`` }], destinations: [{ label: 'Bootstrap Package contract', target: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH }, ...(bootstrap ? [{ label: 'Portable Tooling bootstrap', target: bootstrap.projection.artifactPath }] : [])], facts: readFacts })
  });
  files.push(readFile);
  const sortedFiles = Object.freeze([...files].sort((a, b) => String(a.path || '').localeCompare(String(b.path || ''))));
  const bundle = deepFreeze({ status: 'ready', files: sortedFiles, handoffClosure: null, transportFormat: RECIPIENT_V2_FORMAT_ID, boundary: 'Bootstrap-only recipient carrier. Start/bootstrap qualification creates no Workspace, Role, Handoff, recipient, holder, work, or action authority.' });
  const inspection = inspectRecipientFacingV2Topology(bundle);
  const roundtrip = input.verifyRoundtrip === false ? null : roundTripRecipientFacingV2Topology(bundle, inspection);
  const toolingBootstrapInspection = inspection.bootstrapInspection || sourceInspection;
  const allFindings = [...findings, ...(inspection.findings || []), ...(roundtrip?.findings || [])];
  const ready = inspection.status === 'valid' && inspection.carrierProjection?.mode === 'bootstrap' && inspection.carrierProjection?.status === 'ready' && (!roundtrip || roundtrip.status === 'passed') && toolingBootstrapInspection.status === 'valid' && !allFindings.some((item) => item.severity === 'error');
  return deepFreeze({
    schema: 'tiinex.portable.handoff-manufacturing.v2', status: ready ? 'ready' : 'blocked', executable: ready, transportExecutable: ready,
    verification: Object.freeze({ baselineManufacture: 'ready', manufacturePath: 'qualified-bootstrap-to-zero-material-package-v1', packageInspection: inspection.status, closureInspection: 'not-applicable', carrierInspection: inspection.status, selectedHandoffConformance: 'not-applicable', pointerEntrypointInspection: 'not-applicable', coldConsumerEntrypointInspection: inspection.status, companionInspection: 'not-applicable', roundtrip: roundtrip?.status || 'not-requested', toolingBootstrap: toolingBootstrapInspection.status }),
    plan: Object.freeze({ status: ready ? 'ready' : 'blocked', requiredClosureReady: true, semanticHandoffStatus: 'not-declared', workspaceMaterializations: Object.freeze([]), requirements: Object.freeze({ required: Object.freeze([]), reference: Object.freeze([]) }) }),
    bundle, inspection, carrierProjection: inspection.carrierProjection, roundtrip, toolingBootstrapInspection, toolingBootstrap: input.toolingBootstrap || null, carrierLineage: input.carrierLineage || inspection.carrierProjection?.lineage || null, manufacturingEvidence: input.manufacturingEvidence || null,
    findings: Object.freeze(allFindings), findingSummary: summarizePortableFindings(allFindings), operationBoundary: Object.freeze({ sourceMutation: false, remoteWrite: false, handoffSemantics: false, recipientAuthority: false, holderAuthority: false, workAuthority: false }),
    boundary: 'Canonical bootstrap-only carrier manufacture. Qualified Start/bootstrap mechanics only; no project/source material or Handoff/Role/recipient/holder/work authority is created.'
  });
}
