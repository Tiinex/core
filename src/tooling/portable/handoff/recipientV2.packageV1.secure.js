import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { openPasswordWorkspacePayload, replacePasswordWorkspaceRecipients } from '../../../transport/secureTransportV1.js';
import { buildHandoffWorkspaceByteProvider, inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { indexRecipientFiles, recipientWorkspaceDescriptor } from './recipientV2.inspect.helpers.js';
import { parseRecipientV2ExternalPayload } from './recipientV2.artifacts.js';
import { inspectRecipientFacingV2PackageV1 } from './recipientV2.packageV1.inspect.js';
import { parseHandoffPackageV1 } from './recipientV2.packageV1.contract.js';
import { parseTransportEnvelopeV1 } from './transportEnvelopeV1.js';
import { currentSchemaId, decodeUtf8, oneFile } from './recipientV2.packageV1.shared.js';

export async function openRecipientV2PackageV1SealedWorkspace(bundle = {}, input = {}) {
  const inspection = inspectRecipientFacingV2PackageV1(bundle);
  if (inspection.status !== 'valid') return frozen({ state: 'failed', reason: 'package-unqualified', findings: inspection.findings || [] });
  const workspaceId = String(input.workspaceId || '').trim();
  const sealed = (inspection.sealedWorkspaces || []).filter((item) => String(item.workspaceId || '') === workspaceId);
  if (sealed.length !== 1) return frozen({ state: 'locked', reason: sealed.length > 1 ? 'sealed-workspace-ambiguous' : 'sealed-workspace-unresolved' });
  const target = sealed[0];
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const index = indexRecipientFiles(files, []);
  const workspaceFile = oneFile(index, target.workspaceArtifactPath);
  const payloadFile = oneFile(index, target.protectedPayloadPath);
  const envelopeFile = oneFile(index, target.transportEnvelopePath);
  if (!workspaceFile || !payloadFile || !envelopeFile) return frozen({ state: 'failed', reason: 'sealed-carrier-material-unresolved' });
  const envelope = parseTransportEnvelopeV1(decodeUtf8(packageFileBytes(envelopeFile)));
  const opened = await openPasswordWorkspacePayload({ protectedPayload: packageFileByteView(payloadFile), envelope, password: input.password, slotId: input.slotId, crypto: input.crypto });
  if (opened.state !== 'opened') return opened;

  const parsed = inspectStoredWorkspaceArchive(opened.plaintext, { ownedBytes: true });
  if (parsed.state !== 'qualified') return frozen({ state: 'failed', reason: 'recovered-archive-unqualified', findings: parsed.findings || [] });
  const workspaceBytes = packageFileByteView(workspaceFile);
  const matches = (parsed.entries || []).filter((entry) => byteEqual(entry.data, workspaceBytes));
  if (matches.length !== 1) return frozen({ state: 'failed', reason: matches.length > 1 ? 'workspace-artifact-correlation-ambiguous' : 'workspace-artifact-correlation-unresolved', matchCount: matches.length });
  const innerPath = String(matches[0].path || '');
  const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: innerPath, targetData: workspaceBytes, entries: parsed.entries || [] });
  if (targetQualification.state !== 'qualified') return frozen({ state: 'failed', reason: 'recovered-workspace-unqualified', findings: targetQualification.reasons || [] });

  const transientArchivePath = `tiinex-transient-opened-${safeToken(workspaceId)}.workspace.zip`;
  const transientArchiveFile = frozen({ path: transientArchivePath, kind: 'transient-opened-workspace-archive', mediaType: 'application/zip', data: opened.plaintext, bytes: opened.plaintext.byteLength, sha256: sha256Hex(opened.plaintext) });
  const descriptorPart = recipientWorkspaceDescriptor({
    workspaceId,
    facts: { providerKind: 'package-local-stored-zip-v1' },
    representation: { workspaceArtifactInnerPath: innerPath, coverage: 'complete' },
    payload: { location: transientArchivePath },
    entries: parsed.entries || [],
    targetMarkdown: decodeUtf8(workspaceBytes),
    targetPackagePath: target.workspaceArtifactPath,
    targetFile: { bytes: workspaceBytes.byteLength, sha256: sha256Hex(workspaceBytes) },
    archiveFile: { path: transientArchivePath, bytes: opened.plaintext.byteLength, sha256: sha256Hex(opened.plaintext) }
  });
  const descriptor = frozen({ schema: 'tiinex.transport.handoff-material-closure-descriptor.v2', version: 2, workspaceMaterializations: [descriptorPart.workspace], workspaceArchiveBindings: [descriptorPart.binding], materialized: [], requirements: { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [] } });
  const provider = buildHandoffWorkspaceByteProvider({ ...bundle, files: frozen([...files, transientArchiveFile]) }, descriptor);
  if (provider.status !== 'ready') return frozen({ state: 'failed', reason: 'recovered-provider-unqualified', findings: provider.findings || [] });
  return frozen({
    state: 'opened-qualified', workspaceId, slotId: opened.slotId, workspaceArtifactPath: target.workspaceArtifactPath,
    workspaceArtifactInnerPath: innerPath, workspaceArtifactSha256: sha256Hex(workspaceBytes), archiveSha256: sha256Hex(opened.plaintext),
    provider, descriptor, targetQualification,
    boundary: 'Authorized plaintext exists only in this in-memory opened provider/descriptor result unless the caller explicitly writes a destination. Decryption alone did not activate the provider; safe archive, unique Workspace-byte correlation, ordinary Workspace conformance, and integrity qualification all completed first.'
  });
}

export async function replaceRecipientV2PackageV1SealedWorkspaceRecipients(bundle = {}, input = {}) {
  const inspection = inspectRecipientFacingV2PackageV1(bundle);
  if (inspection.status !== 'valid') return frozen({ state: 'failed', reason: 'package-unqualified', findings: inspection.findings || [] });
  const workspaceId = String(input.workspaceId || '').trim();
  const target = (inspection.sealedWorkspaces || []).find((item) => String(item.workspaceId || '') === workspaceId) || null;
  if (!target) return frozen({ state: 'locked', reason: 'sealed-workspace-unresolved' });
  const index = indexRecipientFiles(bundle.files || [], []);
  const payloadFile = oneFile(index, target.protectedPayloadPath);
  const envelopeFile = oneFile(index, target.transportEnvelopePath);
  if (!payloadFile || !envelopeFile) return frozen({ state: 'failed', reason: 'sealed-carrier-material-unresolved' });
  const envelope = parseTransportEnvelopeV1(decodeUtf8(packageFileBytes(envelopeFile)));
  const changed = await replacePasswordWorkspaceRecipients({ protectedPayload: packageFileByteView(payloadFile), envelope, authorizationPassword: input.authorizationPassword ?? input.password, recipients: input.recipients || [], crypto: input.crypto });
  if (changed.state !== 'rewrapped') return changed;
  return frozen({ state: 'rewrapped', protectedPayload: changed.protectedPayload, envelope: changed.envelope, workspaceId, protectedPayloadSha256: sha256Hex(changed.protectedPayload), boundary: 'Returns replacement non-secret envelope metadata and the exact unchanged protected payload bytes; it does not rewrite the package automatically because parent/self-integrity resealing remains a separate carrier manufacture action.' });
}

export function inspectRecipientV2PackageV1SealedBinding(bundle = {}, workspaceId = '') {
  const inspection = inspectRecipientFacingV2PackageV1(bundle);
  const matches = (inspection.sealedWorkspaces || []).filter((item) => String(item.workspaceId || '') === String(workspaceId || ''));
  return frozen({ state: inspection.status !== 'valid' ? 'failed' : matches.length === 1 ? 'locked-qualified' : matches.length > 1 ? 'ambiguous' : 'unresolved', binding: matches.length === 1 ? matches[0] : null, providerActive: false, packageStatus: inspection.status, findings: inspection.findings || [] });
}

function byteEqual(a, b) { const left=packageFileByteView({data:a}), right=packageFileByteView({data:b}); if(left.byteLength!==right.byteLength)return false; let diff=0; for(let i=0;i<left.byteLength;i+=1) diff|=left[i]^right[i]; return diff===0; }
function safeToken(value=''){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'workspace';}
function frozen(value){return deepFreeze(value);}
function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;if(ArrayBuffer.isView(value)||value instanceof ArrayBuffer)return value;for(const child of Object.values(value))deepFreeze(child);return Object.freeze(value);}
