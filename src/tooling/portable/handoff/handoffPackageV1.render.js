import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import {
  HANDOFF_PACKAGE_V1_EXTERNAL_PAYLOAD_SCHEMA_TARGET,
  HANDOFF_PACKAGE_V1_POINTER_SCHEMA_TARGET,
  HANDOFF_PACKAGE_V1_ROOT_SCHEMA_TARGET,
  HANDOFF_PACKAGE_V1_SCHEMA_TARGET
} from './handoffPackageV1.constants.js';

export function renderHandoffPackageV1Root(input = {}) {
  const mode = normalizeCarrierMode(input.carrierMode);
  const contract = carrierContract(mode);
  const workspaceBindings = (input.workspaces || []).map((w) => `- ${w.workspaceId}\n  - Workspace Id: ${w.workspaceId}\n  - Workspace Artifact: [${w.workspaceId} Workspace](${w.artifactPath})\n  - Snapshot Path: [${w.workspaceId} Snapshot](${w.archivePath})\n  - Workspace Artifact Inner Path: ${w.innerPath}\n  - Snapshot Kind: exact-workspace-byte-tree-archive\n  - Coverage: complete\n  - Binding State: verified\n  - Integrity Method: sha256\n  - Integrity Value: ${w.archiveSha256}`).join('\n\n') || '- none';
  const cacheBindings = (input.caches || []).map((c) => `- ${c.cacheId}\n  - Material Id: ${c.cacheId}\n  - Cache Descriptor: [${c.cacheId} Cache](${c.artifactPath})\n  - Cache Payload: [${c.cacheId} Cache Payload](${c.archivePath})\n  - Carriage State: verified`).join('\n\n') || '- none';
  const checkpointKind = String(input.checkpointKind || 'major').trim() || 'major';
  const majorReasonLine = checkpointKind === 'major' ? `- Major Reason: ${input.majorReason || 'direct Package V1 carrier'}\n` : '';
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${HANDOFF_PACKAGE_V1_ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.handoff.package.v1](${HANDOFF_PACKAGE_V1_SCHEMA_TARGET})\n  - Created At: ${input.createdAt}\n  - Authors: Tiinex Core\n  - Why: Carry one exact recipient-facing Handoff Package V1 without alternate recipient representations.\n  - Summary: ${contract.summary}\n  - Status: ready/local\n\n---\n\n# Handoff Package\n\n## Package Identity\n\n- Package Role: ${contract.packageRole}\n- Carrier Kind: self-contained\n\n## Bootstrap Exposure\n\n- Start Artifact: [Start](${input.startPath})\n- Tooling Bootstrap Descriptor: [Bootstrap](${input.bootstrapArtifactPath})\n- Bootstrap Rule: start-then-qualified-bootstrap\n\n## Workspace Snapshot Bindings\n\n${workspaceBindings}\n\n## Material Representation Bindings\n\n${cacheBindings}\n\n## Route Discovery\n\n- Route Placement Rule: ${contract.routePlacementRule}\n- Continue-From Rule: ${contract.continueFromRule}\n- Pre-Handoff Closure Rule: ${contract.preHandoffClosureRule}\n\n## Transport Projection\n\n- Generic Transport Rule: start-artifact-instruction\n- Route Transport Rule: ${contract.routeTransportRule}\n- Recipient Projection Rule: ${contract.recipientProjectionRule}\n\n## Carrier Continuity\n\n- Carrier Mode: ${mode}\n- Carrier Prefix: ${input.carrierPrefix || ''}\n- Carrier Dimension: ${input.dimension}\n${input.parentDimension ? `- Parent Carrier Dimension: ${input.parentDimension}\n` : ''}- Carrier Checkpoint: ${checkpointKind}\n${majorReasonLine}\n## Qualification Boundary\n\n- Receiver Qualification: reverify-carried-authority-and-bytes\n- Failure Policy: fail-closed\n- Derived Inventory Authority: none\n\n## Interpretation Limits\n\n- Does Not Mean: ${contract.doesNotMean}\n- Must Not Be Used To Claim: ${contract.mustNotClaim}\n- Generic Payload Boundary: bootstrap/cache payload identity and integrity remain under their readable package-local descriptors.\n- Generic Representation Boundary: ${contract.representationBoundary}\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`;
  return seal(unsigned);
}

export function renderHandoffPackageV1Start(input = {}) {
  const mode = normalizeCarrierMode(input.carrierMode);
  const parent = parentEnvelope(input.parent);
  const routePointers = (input.routePointers || []).map(String).filter(Boolean);
  const routes = routePointers.length ? routePointers.map((p) => `- Continue From: [${p}](${p})`).join('\n') : '- Continue From: none';
  const intro = mode === 'handoff'
    ? 'This is a Tiinex Handoff Package V1 carrier. Read and qualify the embedded bootstrap before following a Handoff route. Do not infer continuation from ZIP ordering and do not invent missing material.'
    : mode === 'workspace'
      ? 'This is a pointerless Tiinex Handoff Package V1 Workspace carrier. Read and qualify the embedded bootstrap, then let Tiinex Tooling orient the carried Workspace material. No Handoff route, recipient, or work transfer is implied.'
      : 'This is a bootstrap-only Tiinex Handoff Package V1 carrier. Read and qualify the embedded bootstrap, then let Tiinex Tooling orient the carrier. No Workspace material, Handoff route, recipient, or work authority is implied.';
  const routeNotes = mode === 'handoff'
    ? `- For a recipient intending to perform the bounded local work, pass the exact selected Continue From pointer directly to one-pass recipient grounding plus writable continuation: \`node <extract-root>/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs ground <original-carrier.zip> --route <Continue-from> --recipient --continue <empty-local-workspace-dir>\`.\n- For inspect-only recipient grounding, use the same command without \`--continue\`; \`--recipient\` still projects exact qualified Required Context and bounded current-work bodies in that single grounding receipt.`
    : mode === 'workspace'
      ? '- This carrier is pointerless. After orientation, use Tiinex Workspace/material projection or landing operations as appropriate; do not pass a Handoff route and do not infer a recipient from carried material.'
      : '- This carrier is bootstrap-only. After orientation, do not infer Workspace material, a Handoff route, recipient identity, holder state, or current work.';
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${HANDOFF_PACKAGE_V1_ROOT_SCHEMA_TARGET})\n${parent}- Current\n  - Current Schema: [tiinex.pointer.v1](${HANDOFF_PACKAGE_V1_POINTER_SCHEMA_TARGET})\n  - Created At: ${input.createdAt}\n  - Summary: Cold-start entrypoint for one direct Handoff Package V1 carrier.\n\n---\n\n# READ BEFORE PROCEEDING\n\n${intro}\n\n## Current Read\n\n- Package Format: tiinex-handoff-package-v1\n- Bootstrap Descriptor: ${input.bootstrapArtifactPath}\n- Bootstrap Payload: ${input.bootstrapArchivePath}\n- Resolution Rule: carried qualified Workspace first; bounded cache second; read-only host/provider request third; explicit manual input otherwise; verify returned bytes before use\n- Remote Mutation: forbidden\n\n## Destinations\n\n- Portable Tooling bootstrap: [${input.bootstrapArtifactPath}](${input.bootstrapArtifactPath})\n${routes}\n\n## Interpretation Notes\n\n- Extract only the declared bootstrap payload into a writable runtime location. The executable is exactly \`<extract-root>/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs\`; do not list/search the extracted runtime to discover it.\n- Optional pre-orientation identity check: \`node <extract-root>/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs version --json\`. Compare \`composition.sha256\` with any already-active Tiinex bootstrap before broad runtime/schema/companion re-reading; equal composition means the manifest-declared runtime representation is byte-identical. Build time, Core version, bootstrap SHA, and arrival order do not by themselves establish semantic supersession.\n- First semantic command: \`node <extract-root>/tiinex.bootstrap/runtime/tools/tiinex-portable.mjs orient <original-carrier.zip>\`.\n${routeNotes}\n- No \`--help\`, runtime source inspection, or broad package archaeology is required before those commands; use diagnostic discovery only if the declared path/command actually fails.\n- GitHub/provider recovery is read-only. If the host cannot fetch, use the Tooling manual-input path.\n\n# Continuity Integrity\n\n${parentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`;
  return seal(unsigned);
}

function normalizeCarrierMode(value = '') {
  const mode = String(value || 'handoff').trim().toLowerCase();
  return ['handoff', 'workspace', 'bootstrap'].includes(mode) ? mode : 'handoff';
}

function carrierContract(mode) {
  if (mode === 'workspace') return Object.freeze({
    packageRole: 'recipient-facing-workspace-carrier',
    summary: 'Direct Package V1 pointerless Workspace carrier with readable Start, embedded Tooling, and exact qualified Workspace material without synthetic Handoff semantics.',
    routePlacementRule: 'none', continueFromRule: 'none', preHandoffClosureRule: 'none', routeTransportRule: 'none', recipientProjectionRule: 'none',
    doesNotMean: 'package placement, Workspace presence, carrier naming, or transport delivery creates a Handoff, recipient, holder, participant, acceptance, or work-transfer relation.',
    mustNotClaim: 'recipient identity, work transfer, current Task, completion, source mutation authority, or hidden provider semantics.',
    representationBoundary: 'carried Workspace material preserves its own Workspace identity and representation authority; route-less carriage does not create Handoff semantics.'
  });
  if (mode === 'bootstrap') return Object.freeze({
    packageRole: 'recipient-facing-bootstrap-carrier',
    summary: 'Direct Package V1 bootstrap-only carrier with readable Start and embedded qualified Tooling, without project/source Workspace material or Handoff semantics.',
    routePlacementRule: 'none', continueFromRule: 'none', preHandoffClosureRule: 'none', routeTransportRule: 'none', recipientProjectionRule: 'none',
    doesNotMean: 'package placement, carrier naming, or transport delivery creates Workspace, Handoff, Role, recipient, holder, participant, project, or work authority.',
    mustNotClaim: 'source-material carriage, recipient identity, work transfer, current work, completion, or source mutation authority.',
    representationBoundary: 'no Workspace Representation or project/source material is asserted by this bootstrap-only package.'
  });
  return Object.freeze({
    packageRole: 'recipient-facing-handoff-carrier',
    summary: 'Direct Package V1 Handoff carrier with readable Start, embedded Tooling, exact Workspace snapshots, bounded route closure, and package-local grounding pointers.',
    routePlacementRule: 'authoritative-workspace-descended', continueFromRule: 'exact-package-local-handoff-pointer', preHandoffClosureRule: 'selected-pointer-carrier-ancestors', routeTransportRule: 'selected-handoff-route-instruction', recipientProjectionRule: 'qualified-handoff-to-endpoint-only',
    doesNotMean: 'package placement, cache presence, pointer naming, or transport delivery creates Handoff, Role, participant, process, policy, holder, acceptance, or source authority.',
    mustNotClaim: 'recipient identity beyond the exact selected Handoff endpoint, completion, source mutation authority, or hidden provider semantics.',
    representationBoundary: 'package-local bounded cache is transport closure only and does not create a generic Workspace Representation relation.'
  });
}

export function renderExternalPayloadDescriptor(input = {}) {
  const parent = parentEnvelope(input.parent);
  const payloadCreatedAt = String(input.payloadCreatedAt || '').trim();
  const producer = String(input.producer || '').trim();
  const provenance = input.provenance && typeof input.provenance === 'object' ? input.provenance : null;
  const provenanceSection = provenance ? `## Provenance\n\n- Runtime Composition SHA-256: ${String(provenance.compositionSha256 || '')}\n- Comparison Command: ${String(provenance.comparisonCommand || '')}\n- Ordering Boundary: ${String(provenance.orderingBoundary || '')}\n\n` : '';
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${HANDOFF_PACKAGE_V1_ROOT_SCHEMA_TARGET})\n${parent}- Current\n  - Current Schema: [tiinex.external.payload.v1](${HANDOFF_PACKAGE_V1_EXTERNAL_PAYLOAD_SCHEMA_TARGET})\n  - Created At: ${input.createdAt}\n  - Summary: ${input.summary}\n\n---\n\n# ${input.title}\n\n## Payload Identity\n\n- Payload Label: ${input.label}\n- Payload Kind: zip export\n- Media Type: application/zip\n- Format: deterministic stored ZIP\n- Byte Size: ${input.bytes}\n${payloadCreatedAt ? `- Created At: ${payloadCreatedAt}\n` : ''}${producer ? `- Producer: ${producer}\n` : ''}- Payload Role: ${input.role}\n\n## Payload Location\n\n- Location: [${input.archivePath}](${input.archivePath})\n- Location Type: local\n- Access Method: read exact package-local payload bytes after this descriptor qualifies\n- Storage Boundary: this Handoff Package V1 carrier only\n\n## Integrity Reference\n\n- Integrity Status: verified\n- Integrity Method: sha256\n- Integrity Value: ${input.sha256}\n- Integrity Target: exact payload bytes at the declared package-local Location\n- Validation Method: recompute SHA-256 before use\n\n## Access Boundary\n\n- Access Boundary: recipient-local package read\n- Publicly Shareable: unknown\n- Retention Policy: preserve with the carrier until superseded by a qualified continuation\n\n${provenanceSection}## Interpretation Limits\n\n- Does Not Prove: payload contents create semantic authority, provider authority, Handoff acceptance, Role holder state, or remote mutation permission\n- Must Not Be Used As: a hidden recipient manifest or alternate package truth\n\n# Continuity Integrity\n\n${parentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`;
  return seal(unsigned);
}

export function renderGroundingPointer(input = {}) {
  const parent = parentEnvelope(input.parent);
  const fields = [
    ['Pointer Kind', input.pointerKind || 'required-context'],
    ['Requirement Id', input.requirementId || ''],
    ['Reference', input.referenceTarget || ''],
    ['Target Carrier Kind', input.targetCarrierKind || ''],
    ['Target Workspace Id', input.targetWorkspaceId || ''],
    ['Target Payload', input.archivePath || ''],
    ['Target Inner Path', input.targetInnerPath || ''],
    ['Target Archive Entry', input.targetArchiveEntry || ''],
    ['Target Byte Size', input.targetBytes || 0],
    ['Target SHA-256', input.targetSha256 || ''],
    ['Endpoint Party', input.endpointParty || ''],
    ['Role Label Hint', input.roleLabelHint || '']
  ].filter(([,v]) => String(v ?? '').trim() !== '').map(([k,v]) => `- ${k}: ${v}`).join('\n');
  const destination = input.referenceTarget || input.archivePath || input.targetInnerPath || input.targetArchiveEntry;
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${HANDOFF_PACKAGE_V1_ROOT_SCHEMA_TARGET})\n${parent}- Current\n  - Current Schema: [tiinex.pointer.v1](${HANDOFF_PACKAGE_V1_POINTER_SCHEMA_TARGET})\n  - Created At: ${input.createdAt}\n  - Summary: ${input.summary || 'Package-local grounding pointer to one exact required artifact.'}\n\n---\n\n# ${input.title || 'Grounding Pointer'}\n\nThis pointer is recipient grounding/navigation only. Semantic authority remains with the exact referenced artifact and its owning declarations.\n\n## Current Read\n\n${fields}\n- Resolution Rule: carried qualified Workspace first; bounded cache second; read-only host/provider request third; explicit manual input otherwise; verify exact returned bytes before use\n\n## Destinations\n\n- Exact target: ${destination}\n\n## Interpretation Notes\n\n- Pointer placement and naming do not create participation, holder state, process/policy applicability, delegation, or Handoff semantics.\n- GitHub/provider resolution on recovery is read-only; remote mutation is forbidden.\n\n# Continuity Integrity\n\n${parentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`;
  return seal(unsigned);
}

function parentEnvelope(parent) {
  if (!parent?.path || !parent?.schemaId || !parent?.markdown) return '';
  return `- Parent\n  - Parent Schema: [${parent.schemaId}](${parent.schemaTarget || parent.path})\n  - Created At: ${parent.createdAt || ''}\n  - Trace: [${parent.path}](${parent.path})\n  - Origin:\n    - [relative](${parent.path})\n`;
}
function parentIntegrity(parent) {
  if (!parent?.path || !parent?.markdown) return '';
  const digest = validatedC14nV2PrimarySelfDigest(parent.markdown);
  if (digest.state !== 'verified') throw new Error(`portable.handoff-package-v1.parent-integrity.unqualified:${parent.path}:${digest.state}`);
  return `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [${parent.path}](${parent.path})\n  - Value: ${digest.value}\n\n`;
}
function seal(unsigned) {
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`portable.handoff-package-v1.trace-seal.failed:${sealed.reason || sealed.state}`);
  return `${sealed.markdown}\n`;
}
