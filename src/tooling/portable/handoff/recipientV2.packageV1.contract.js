import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { finding } from './recipientV2.topology.materials.js';
import { RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROOT_SCHEMA_TARGET } from './recipientV2.artifacts.js';
import { field, markdownTarget, normalizeCreatedAt, sectionText, unquote, validCarrierDimension } from './recipientV2.packageV1.shared.js';
import { normalizeHandoffCarrierProfile, normalizeWorkspaceIds } from './carrierProfile.js';

export const HANDOFF_PACKAGE_ROLE = 'recipient-facing-handoff-carrier';
export const WORKSPACE_PACKAGE_ROLE = 'recipient-facing-workspace-carrier';
export const BOOTSTRAP_PACKAGE_ROLE = 'recipient-facing-bootstrap-carrier';
export const WORKSPACE_CARRIER_CANONICAL_BLOCKER = 'portable.handoff-package-v1.workspace-carrier.canonical-follow-through-required';

const PACKAGE_ROLES = Object.freeze([HANDOFF_PACKAGE_ROLE, WORKSPACE_PACKAGE_ROLE, BOOTSTRAP_PACKAGE_ROLE]);

function roleProfileForRole(role = HANDOFF_PACKAGE_ROLE) {
  return role === HANDOFF_PACKAGE_ROLE
    ? Object.freeze({ routePlacementRule: 'authoritative-workspace-descended', continueFromRule: 'exact-package-local-handoff-pointer', preHandoffClosureRule: 'selected-pointer-carrier-ancestors', routeTransportRule: 'selected-handoff-route-instruction', recipientProjectionRule: 'qualified-handoff-to-endpoint-only' })
    : Object.freeze({ routePlacementRule: 'none', continueFromRule: 'none', preHandoffClosureRule: 'none', routeTransportRule: 'none', recipientProjectionRule: 'none' });
}

export function renderHandoffPackageV1(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const lineage = input.carrierLineage || {};
  const carrierProfile = normalizeHandoffCarrierProfile(input.carrierProfile || null);
  const packageRole = PACKAGE_ROLES.includes(String(input.packageRole || '')) ? String(input.packageRole) : HANDOFF_PACKAGE_ROLE;
  const roleProfile = roleProfileForRole(packageRole);
  const workspaceBlocks = (input.workspaces || []).map((workspace) => renderWorkspaceBinding(workspace)).join('\n');
  const materialBlocks = (input.materialRepresentations || []).map((material) => renderMaterialRepresentationBinding(material)).join('\n');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.handoff.package.v1](${RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: Recipient-facing self-contained carrier identity, Start/bootstrap exposure, qualified source-material bindings, route discovery when declared, and transport projection boundaries.\n\n---\n\n# Handoff Package\n\n## Package Identity\n\n- Package Role: ${packageRole}\n- Carrier Kind: self-contained\n\n## Bootstrap Exposure\n\n- Start Artifact: [Start](${input.startPath || RECIPIENT_V2_READ_PATH})\n${input.bootstrapPath ? `- Tooling Bootstrap Descriptor: [Bootstrap](${input.bootstrapPath})\n` : '- Tooling Bootstrap Descriptor: [Bootstrap](001-2-bootstrap.trace.md)\n'}- Bootstrap Rule: start-then-qualified-bootstrap\n\n## Workspace Snapshot Bindings\n\n${workspaceBlocks || '- none'}\n\n## Material Representation Bindings\n\n${materialBlocks || '- none'}\n\n## Route Discovery\n\n- Route Placement Rule: ${roleProfile.routePlacementRule}\n- Continue-From Rule: ${roleProfile.continueFromRule}\n- Pre-Handoff Closure Rule: ${roleProfile.preHandoffClosureRule}\n\n## Transport Projection\n\n- Generic Transport Rule: start-artifact-instruction\n- Route Transport Rule: ${roleProfile.routeTransportRule}\n- Recipient Projection Rule: ${roleProfile.recipientProjectionRule}\n\n## Carrier Continuity\n\n- Carrier Dimension: ${String(lineage.dimension || '001')}\n${lineage.parentDimension ? `- Parent Carrier Dimension: ${String(lineage.parentDimension)}\n` : ''}- Carrier Checkpoint: ${String(lineage.checkpointKind || 'progression')}\n${lineage.majorReason ? `- Major Reason: ${String(lineage.majorReason)}\n` : ''}- Carrier Profile Id: ${carrierProfile.id || 'none'}\n- Required Major Workspace Ids: ${carrierProfile.requiredMajorWorkspaceIds.length ? carrierProfile.requiredMajorWorkspaceIds.join(', ') : 'none'}\n\n## Qualification Boundary\n\n- Receiver Qualification: reverify-carried-authority-and-bytes\n- Failure Policy: fail-closed\n- Derived Inventory Authority: none\n\n## Interpretation Limits\n\n- Does Not Mean: package placement, discovery ancestry, byte integrity, Role presence, Workspace identity, or transport destination creates Handoff, recipient, holder, participation, acceptance, provenance, Parent, project membership, or work authority\n- Must Not Be Used To Claim: carrier convenience metadata overrides authoritative contained artifacts, exact qualified source bytes, or the selected Handoff To endpoint when recipient projection is permitted\n- Generic Payload Boundary: bootstrap/cache payloads retain explicit External Payload ownership when required; direct complete Workspace snapshot binding is package-local only\n- Generic Representation Boundary: independently selectable complete/bounded Workspace representation semantics remain owned by qualified tiinex.workspace.representation.v1 bindings\n- Carrier Profile Boundary: required Workspace identifiers come only from the explicit carrier profile; literal project Workspace names have no generic semantic meaning\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`portable.handoff-package-v1.integrity.seal-failed:${sealed.reason || sealed.state}`);
  return `${sealed.markdown}\n`;
}

export function parseHandoffPackageV1(markdown = '') {
  const body = String(markdown || '');
  const workspaces = parseWorkspaceBindings(sectionText(body, 'Workspace Snapshot Bindings'));
  const materialRepresentations = parseMaterialRepresentationBindings(sectionText(body, 'Material Representation Bindings'));
  return Object.freeze({
    packageRole: field(sectionText(body, 'Package Identity'), 'Package Role'), carrierKind: field(sectionText(body, 'Package Identity'), 'Carrier Kind'),
    startPath: markdownTarget(field(sectionText(body, 'Bootstrap Exposure'), 'Start Artifact')), bootstrapPath: markdownTarget(field(sectionText(body, 'Bootstrap Exposure'), 'Tooling Bootstrap Descriptor')), bootstrapRule: field(sectionText(body, 'Bootstrap Exposure'), 'Bootstrap Rule'),
    workspaces: Object.freeze(workspaces), materialRepresentations: Object.freeze(materialRepresentations),
    routePlacementRule: field(sectionText(body, 'Route Discovery'), 'Route Placement Rule'), continueFromRule: field(sectionText(body, 'Route Discovery'), 'Continue-From Rule'), preHandoffClosureRule: field(sectionText(body, 'Route Discovery'), 'Pre-Handoff Closure Rule'),
    genericTransportRule: field(sectionText(body, 'Transport Projection'), 'Generic Transport Rule'), routeTransportRule: field(sectionText(body, 'Transport Projection'), 'Route Transport Rule'), recipientProjectionRule: field(sectionText(body, 'Transport Projection'), 'Recipient Projection Rule'),
    carrierDimension: field(sectionText(body, 'Carrier Continuity'), 'Carrier Dimension'), parentCarrierDimension: field(sectionText(body, 'Carrier Continuity'), 'Parent Carrier Dimension'), carrierCheckpoint: field(sectionText(body, 'Carrier Continuity'), 'Carrier Checkpoint'), majorReason: field(sectionText(body, 'Carrier Continuity'), 'Major Reason'), carrierProfileId: normalizeProfileId(field(sectionText(body, 'Carrier Continuity'), 'Carrier Profile Id')), requiredMajorWorkspaceIds: normalizeWorkspaceIds(field(sectionText(body, 'Carrier Continuity'), 'Required Major Workspace Ids')),
    receiverQualification: field(sectionText(body, 'Qualification Boundary'), 'Receiver Qualification'), failurePolicy: field(sectionText(body, 'Qualification Boundary'), 'Failure Policy'), derivedInventoryAuthority: field(sectionText(body, 'Qualification Boundary'), 'Derived Inventory Authority')
  });
}

export function validatePackageFields(value, findings) {
  const packageRole = String(value?.packageRole || '');
  const roleKnown = PACKAGE_ROLES.includes(packageRole);
  if (!roleKnown) findings.push(finding('error', 'portable.handoff-package-v1.field.packageRole.invalid', 'Handoff package v1 Package Role is missing or invalid.', { field: 'packageRole', expected: PACKAGE_ROLES.join('|'), observed: packageRole }));
  const roleProfile = roleProfileForRole(roleKnown ? packageRole : HANDOFF_PACKAGE_ROLE);
  const exact = [
    ['carrierKind', 'self-contained'], ['bootstrapRule', 'start-then-qualified-bootstrap'], ['routePlacementRule', roleProfile.routePlacementRule], ['continueFromRule', roleProfile.continueFromRule], ['preHandoffClosureRule', roleProfile.preHandoffClosureRule], ['genericTransportRule', 'start-artifact-instruction'], ['routeTransportRule', roleProfile.routeTransportRule], ['recipientProjectionRule', roleProfile.recipientProjectionRule], ['receiverQualification', 'reverify-carried-authority-and-bytes'], ['failurePolicy', 'fail-closed'], ['derivedInventoryAuthority', 'none']
  ];
  for (const [key, expected] of exact) if (String(value?.[key] || '') !== expected) findings.push(finding('error', `portable.handoff-package-v1.field.${key}.invalid`, 'Handoff package v1 required closed-domain field is missing or invalid.', { field: key, expected, observed: String(value?.[key] || '') }));
  if (!value?.startPath || !value?.bootstrapPath) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-exposure-invalid', 'Start Artifact and Tooling Bootstrap Descriptor must be package-local links.'));
  for (const binding of value?.workspaces || []) validateWorkspaceBinding(binding, findings);
  for (const binding of value?.materialRepresentations || []) validateMaterialRepresentationBinding(binding, findings);
  const directCount = Array.isArray(value?.workspaces) ? value.workspaces.length : 0;
  const materialCount = Array.isArray(value?.materialRepresentations) ? value.materialRepresentations.length : 0;
  if (packageRole === BOOTSTRAP_PACKAGE_ROLE && (directCount || materialCount)) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-carrier.material-forbidden', 'Bootstrap-only carrier must declare no Workspace Snapshot Bindings and no Material Representation Bindings.', { directCount, materialCount }));
  if ([WORKSPACE_PACKAGE_ROLE, HANDOFF_PACKAGE_ROLE].includes(packageRole) && !(directCount + materialCount)) findings.push(finding('error', 'portable.handoff-package-v1.source-material-bindings-missing', 'Workspace/Handoff carrier requires at least one qualified source-material binding across Workspace Snapshot Bindings and Material Representation Bindings.'));
  if (!validCarrierDimension(value?.carrierDimension)) findings.push(finding('error', 'portable.handoff-package-v1.carrier-dimension-invalid', 'Carrier Dimension must be a canonical numeric hyphen path.', { value: value?.carrierDimension || '' }));
  if (value?.parentCarrierDimension && !validCarrierDimension(value.parentCarrierDimension)) findings.push(finding('error', 'portable.handoff-package-v1.parent-carrier-dimension-invalid', 'Parent Carrier Dimension must be a canonical numeric hyphen path.', { value: value.parentCarrierDimension || '' }));
  if (!['progression', 'major'].includes(String(value?.carrierCheckpoint || ''))) findings.push(finding('error', 'portable.handoff-package-v1.carrier-checkpoint-invalid', 'Carrier Checkpoint must be progression or major.'));
  if (value?.carrierCheckpoint === 'major' && !String(value.majorReason || '').trim()) findings.push(finding('error', 'portable.handoff-package-v1.major-reason-missing', 'Major carrier requires one meaningful Major Reason.'));
  if (value?.carrierCheckpoint === 'major' && (value.requiredMajorWorkspaceIds || []).length && !String(value.carrierProfileId || '').trim()) findings.push(finding('error', 'portable.handoff-package-v1.major-carrier-profile-missing', 'Named Major Workspace requirements require one explicit carrier profile id.'));
}

function parseWorkspaceBindings(text = '') {
  const out = [];
  const re = /^-\s+([^\n]+)\n((?:\s{2}-\s+[^\n]+\n?)*)/gm;
  for (const match of String(text || '').matchAll(re)) {
    if (String(match[1] || '').trim().toLowerCase() === 'none') continue;
    const current = { label: String(match[1] || '').trim() };
    for (const line of String(match[2] || '').split('\n')) {
      const fieldMatch = line.match(/^\s{2}-\s+([^:]+):\s*(.*)$/); if (!fieldMatch) continue;
      const key = fieldMatch[1].trim(); const value = fieldMatch[2].trim();
      if (key === 'Workspace Id') current.workspaceId = value;
      else if (key === 'Workspace Artifact') current.workspaceArtifactPath = markdownTarget(value);
      else if (key === 'Snapshot Path') current.snapshotPath = markdownTarget(value);
      else if (key === 'Protected Payload Descriptor') current.protectedPayloadDescriptorPath = markdownTarget(value);
      else if (key === 'Transport Envelope') current.transportEnvelopePath = markdownTarget(value);
      else if (key === 'Workspace Artifact Inner Path') current.workspaceArtifactInnerPath = unquote(value);
      else if (key === 'Snapshot Kind') current.snapshotKind = value;
      else if (key === 'Coverage') current.coverage = value;
      else if (key === 'Binding State') current.bindingState = value;
      else if (key === 'Integrity Method') current.integrityMethod = value;
      else if (key === 'Integrity Value') current.integrityValue = value;
      else if (key === 'Protection State') current.protectionState = value;
      else if (key === 'Post-Open Correlation Rule') current.postOpenCorrelationRule = value;
      else if (key === 'Byte Size') current.byteSize = /^\d+$/.test(value) ? Number(value) : null;
    }
    out.push(current);
  }
  return out.map((item) => Object.freeze({ ...item, byteSize: item.byteSize ?? null }));
}

function parseMaterialRepresentationBindings(text = '') {
  const out = [];
  const re = /^-\s+([^\n]+)\n((?:\s{2}-\s+[^\n]+\n?)*)/gm;
  for (const match of String(text || '').matchAll(re)) {
    if (String(match[1] || '').trim().toLowerCase() === 'none') continue;
    const current = { label: String(match[1] || '').trim() };
    for (const line of String(match[2] || '').split('\n')) {
      const fieldMatch = line.match(/^\s{2}-\s+([^:]+):\s*(.*)$/); if (!fieldMatch) continue;
      const key = fieldMatch[1].trim(); const value = fieldMatch[2].trim();
      if (key === 'Material Id') current.materialId = value;
      else if (key === 'Workspace Representation') current.workspaceRepresentationPath = markdownTarget(value);
      else if (key === 'Carriage State') current.carriageState = value;
      else if (key === 'Notes') current.notes = value;
    }
    out.push(current);
  }
  return out.map((item) => Object.freeze({ ...item }));
}

function renderWorkspaceBinding(workspace = {}) {
  const sealed = String(workspace.snapshotKind || '') === 'password-sealed-workspace-byte-tree' || String(workspace.bindingState || '') === 'sealed';
  if (sealed) return `- ${workspace.workspaceId}\n  - Workspace Id: ${workspace.workspaceId}\n  - Workspace Artifact: [${workspace.workspaceId} Workspace](${workspace.workspacePath})\n  - Protected Payload Descriptor: [${workspace.workspaceId} Protected Payload](${workspace.protectedPayloadDescriptorPath})\n  - Transport Envelope: [${workspace.workspaceId} Transport Envelope](${workspace.transportEnvelopePath})\n  - Snapshot Kind: password-sealed-workspace-byte-tree\n  - Coverage: complete\n  - Binding State: sealed\n  - Protection State: password-sealed\n  - Post-Open Correlation Rule: unique-exact-workspace-artifact-byte-match`;
  return `- ${workspace.workspaceId}\n  - Workspace Id: ${workspace.workspaceId}\n  - Workspace Artifact: [${workspace.workspaceId} Workspace](${workspace.workspacePath})\n  - Snapshot Path: [${workspace.workspaceId} Snapshot](${workspace.archivePath})\n  - Workspace Artifact Inner Path: \`${workspace.sourceWorkspaceTargetInnerPath}\`\n  - Snapshot Kind: exact-workspace-byte-tree-archive\n  - Coverage: complete\n  - Binding State: verified\n  - Integrity Method: sha256\n  - Integrity Value: ${workspace.archiveSha256}\n  - Byte Size: ${workspace.archiveBytes || ''}`.replace(/\n  - Byte Size: $/, '');
}

function renderMaterialRepresentationBinding(material = {}) {
  const id = String(material.materialId || material.workspaceId || 'material');
  const path = String(material.workspaceRepresentationPath || material.representationArtifactPath || '');
  return `- ${id}\n  - Material Id: ${id}\n  - Workspace Representation: [${id} Workspace Representation](${path})\n  - Carriage State: ${String(material.carriageState || 'verified')}${material.notes ? `\n  - Notes: ${String(material.notes)}` : ''}`;
}

function validateWorkspaceBinding(binding = {}, findings = []) {
  const workspaceId = String(binding.workspaceId || '');
  if (!workspaceId || !binding.workspaceArtifactPath || String(binding.coverage || '') !== 'complete') findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-common-invalid', 'Workspace binding requires Workspace Id, Workspace Artifact, and complete coverage.', { workspaceId }));
  const kind = String(binding.snapshotKind || '');
  if (kind === 'exact-workspace-byte-tree-archive') {
    if (String(binding.bindingState || '') !== 'verified' || !binding.snapshotPath || !binding.workspaceArtifactInnerPath || String(binding.integrityMethod || '') !== 'sha256' || !/^[0-9a-f]{64}$/.test(String(binding.integrityValue || ''))) findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-clear-invalid', 'Clear Workspace binding requires exact complete verified sha256 snapshot fields.', { workspaceId }));
    if (binding.protectedPayloadDescriptorPath || binding.transportEnvelopePath || binding.protectionState || binding.postOpenCorrelationRule) findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-clear-sealed-fields-forbidden', 'Clear Workspace binding must not expose sealed-only binding fields.', { workspaceId }));
    return;
  }
  if (kind === 'password-sealed-workspace-byte-tree') {
    if (String(binding.bindingState || '') !== 'sealed' || !binding.protectedPayloadDescriptorPath || !binding.transportEnvelopePath || String(binding.protectionState || '') !== 'password-sealed' || String(binding.postOpenCorrelationRule || '') !== 'unique-exact-workspace-artifact-byte-match') findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-sealed-invalid', 'Sealed Workspace binding requires exact password-sealed binding fields.', { workspaceId }));
    if (binding.snapshotPath || binding.workspaceArtifactInnerPath || binding.integrityMethod || binding.integrityValue) findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-sealed-clear-fields-forbidden', 'Sealed Workspace binding must not expose clear snapshot path, inner Workspace path, or duplicated payload integrity fields.', { workspaceId }));
    return;
  }
  findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-kind-invalid', 'Workspace binding Snapshot Kind is unsupported.', { workspaceId, snapshotKind: kind }));
}

function validateMaterialRepresentationBinding(binding = {}, findings = []) {
  if (!String(binding.materialId || '').trim() || !String(binding.workspaceRepresentationPath || '').trim() || !['verified', 'unresolved'].includes(String(binding.carriageState || ''))) findings.push(finding('error', 'portable.handoff-package-v1.material-representation-binding-invalid', 'Material Representation binding requires Material Id, Workspace Representation link, and closed-domain Carriage State.', { materialId: String(binding.materialId || ''), carriageState: String(binding.carriageState || '') }));
}

function normalizeProfileId(value = '') { const text = String(value || '').trim(); return text.toLowerCase() === 'none' ? '' : text; }
