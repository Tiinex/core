import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { RECIPIENT_V2_ROOT_SCHEMA_TARGET } from './recipientV2.artifacts.js';
import { field, markdownTarget, sectionText, unquote } from './recipientV2.packageV1.shared.js';
import { qualifySecureTransportV1Envelope } from '../../../transport/secureTransportV1.js';

export const TRANSPORT_ENVELOPE_V1_SCHEMA_ID = 'tiinex.transport.envelope.v1';
export const TRANSPORT_ENVELOPE_V1_ROLE = 'password-sealed-workspace-transport-envelope';

// Bounded exception: the Transport Envelope schema is intentionally not assigned a
// published immutable canonical locator. Keep the plain schema id until such authority
// exists; do not substitute a mutable branch/latest URL. Secure-transport regressions
// lock this fail-closed representation choice.

export function renderTransportEnvelopeV1(input = {}) {
  const envelope = input.envelope || {};
  const q = qualifySecureTransportV1Envelope(envelope);
  if (q.state !== 'qualified') throw new Error(`secure-transport.envelope-unqualified:${q.state}`);
  const workspacePath = String(input.workspaceArtifactPath || '').trim();
  const payloadPath = String(input.protectedPayloadDescriptorPath || '').trim();
  if (!workspacePath || !payloadPath) throw new Error('secure-transport.envelope-binding-path-missing');
  const profile = envelope.profile || {};
  const slots = (envelope.passwordRecipientSlots || []).map((slot) => `- ${slot.slotId}\n  - Slot Id: ${slot.slotId}\n  - Slot Kind: ${slot.slotKind}\n  - KDF Algorithm: ${slot.kdfAlgorithm}\n  - KDF Salt Encoding: ${slot.kdfSaltEncoding}\n  - KDF Salt: ${slot.kdfSalt}\n  - KDF Parameters: \`${stableJson(slot.kdfParameters)}\`\n  - Key Wrap Algorithm: ${slot.keyWrapAlgorithm}\n  - Key Wrap Parameters: \`${stableJson(slot.keyWrapParameters)}\`\n  - Wrapped Content Key Encoding: ${slot.wrappedContentKeyEncoding}\n  - Wrapped Content Key: ${slot.wrappedContentKey}\n  - Slot Verification Rule: ${slot.slotVerificationRule}${slot.recipientHint ? `\n  - Recipient Hint: ${slot.recipientHint}` : ''}`).join('\n');
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: ${TRANSPORT_ENVELOPE_V1_SCHEMA_ID}\n  - Created At: ${createdAt}\n  - Summary: Password-sealed Workspace transport envelope with explicit supported profile metadata and independently usable password recipient slots.\n\n---\n\n# Transport Envelope\n\n## Envelope Binding\n\n- Workspace Artifact: [Workspace](${workspacePath})\n- Protected Payload: [Protected Payload](${payloadPath})\n- Envelope Purpose: ${envelope.envelopePurpose}\n- Envelope Version: ${envelope.envelopeVersion}\n- Plaintext Representation Kind: ${envelope.plaintextRepresentationKind}\n- Protected Name Tree: ${envelope.protectedNameTree}\n- Workspace Binding Method: ${envelope.workspaceBindingMethod}\n- Workspace Binding Value: ${envelope.workspaceBindingValue}\n- Content Key Scope: ${envelope.contentKeyScope}\n\n## Payload Protection Profile\n\n- Profile Id: ${profile.profileId}\n- Profile Version: ${profile.profileVersion}\n- Content Encryption Algorithm: ${profile.contentEncryptionAlgorithm}\n- Content Encryption Parameters: \`${stableJson(profile.contentEncryptionParameters)}\`\n- Nonce Or IV Encoding: ${profile.nonceOrIvEncoding}\n- Nonce Or IV: ${profile.nonceOrIv}\n- Payload Authentication Rule: ${profile.payloadAuthenticationRule}\n- Security Metadata Authentication Rule: ${profile.securityMetadataAuthenticationRule}\n- Recipient Change Payload Rule: ${profile.recipientChangePayloadRule}\n\n## Password Recipient Slots\n\n${slots}\n\n## Open And Recovery Contract\n\n- Open Rule: ${envelope.openRule}\n- Wrong Password Result: ${envelope.wrongPasswordResult}\n- Unsupported Profile Result: ${envelope.unsupportedProfileResult}\n- Malformed Metadata Result: ${envelope.malformedMetadataResult}\n- Authentication Failure Result: ${envelope.authenticationFailureResult}\n- Missing Authorized Slot Result: ${envelope.missingAuthorizedSlotResult}\n- Secret Persistence: ${envelope.secretPersistence}\n- Plaintext Persistence: ${envelope.plaintextPersistence}\n- Recovery Rule: ${envelope.recoveryRule}\n- Failure Policy: ${envelope.failurePolicy}\n- Multi-Workspace Isolation: ${envelope.multiWorkspaceIsolation}\n\n## Qualification Boundary\n\n- Payload Byte Integrity Owner: ${envelope.payloadByteIntegrityOwner}\n- Envelope Root Integrity Meaning: ${envelope.envelopeRootIntegrityMeaning}\n- Cryptographic Authentication Meaning: ${envelope.cryptographicAuthenticationMeaning}\n- Provider State While Locked: ${envelope.providerStateWhileLocked}\n- Post-Open Qualification: ${envelope.postOpenQualification}\n- Semantic Authority: ${envelope.semanticAuthority}\n\n## Disclosure Boundary\n\n- Outer Visible Material: ${envelope.outerVisibleMaterial}\n- Must Remain Sealed: ${envelope.mustRemainSealed}\n- Forbidden Durable Secrets: ${envelope.forbiddenDurableSecrets}\n- Privacy Policy Owner: ${envelope.privacyPolicyOwner}\n\n## Interpretation Limits\n\n- Encryption and successful open do not create Workspace identity, Handoff authority, provenance, semantic truth, acceptance, or provider qualification.\n- Passwords, derived keys, wrapping keys, plaintext content keys, and protected Workspace path inventory are not durable envelope material.\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`secure-transport.envelope-self-seal-failed:${sealed.reason || sealed.state}`);
  return `${sealed.markdown}\n`;
}

export function parseTransportEnvelopeV1(markdown = '') {
  const body = String(markdown || '');
  const binding = sectionText(body, 'Envelope Binding');
  const profile = sectionText(body, 'Payload Protection Profile');
  const open = sectionText(body, 'Open And Recovery Contract');
  const qualification = sectionText(body, 'Qualification Boundary');
  const disclosure = sectionText(body, 'Disclosure Boundary');
  return deepFreeze({
    workspaceArtifactPath: markdownTarget(field(binding, 'Workspace Artifact')),
    protectedPayloadDescriptorPath: markdownTarget(field(binding, 'Protected Payload')),
    envelopePurpose: field(binding, 'Envelope Purpose'), envelopeVersion: numberField(binding, 'Envelope Version'), plaintextRepresentationKind: field(binding, 'Plaintext Representation Kind'), protectedNameTree: field(binding, 'Protected Name Tree'), workspaceBindingMethod: field(binding, 'Workspace Binding Method'), workspaceBindingValue: field(binding, 'Workspace Binding Value'), contentKeyScope: field(binding, 'Content Key Scope'),
    profile: {
      profileId: field(profile, 'Profile Id'), profileVersion: numberField(profile, 'Profile Version'), contentEncryptionAlgorithm: field(profile, 'Content Encryption Algorithm'), contentEncryptionParameters: jsonObjectField(profile, 'Content Encryption Parameters'), nonceOrIvEncoding: field(profile, 'Nonce Or IV Encoding'), nonceOrIv: field(profile, 'Nonce Or IV'), payloadAuthenticationRule: field(profile, 'Payload Authentication Rule'), securityMetadataAuthenticationRule: field(profile, 'Security Metadata Authentication Rule'), recipientChangePayloadRule: field(profile, 'Recipient Change Payload Rule')
    },
    passwordRecipientSlots: parseSlots(sectionText(body, 'Password Recipient Slots')),
    openRule: field(open, 'Open Rule'), wrongPasswordResult: field(open, 'Wrong Password Result'), unsupportedProfileResult: field(open, 'Unsupported Profile Result'), malformedMetadataResult: field(open, 'Malformed Metadata Result'), authenticationFailureResult: field(open, 'Authentication Failure Result'), missingAuthorizedSlotResult: field(open, 'Missing Authorized Slot Result'), secretPersistence: field(open, 'Secret Persistence'), plaintextPersistence: field(open, 'Plaintext Persistence'), recoveryRule: field(open, 'Recovery Rule'), failurePolicy: field(open, 'Failure Policy'), multiWorkspaceIsolation: field(open, 'Multi-Workspace Isolation'),
    payloadByteIntegrityOwner: field(qualification, 'Payload Byte Integrity Owner'), envelopeRootIntegrityMeaning: field(qualification, 'Envelope Root Integrity Meaning'), cryptographicAuthenticationMeaning: field(qualification, 'Cryptographic Authentication Meaning'), providerStateWhileLocked: field(qualification, 'Provider State While Locked'), postOpenQualification: field(qualification, 'Post-Open Qualification'), semanticAuthority: field(qualification, 'Semantic Authority'),
    outerVisibleMaterial: field(disclosure, 'Outer Visible Material'), mustRemainSealed: field(disclosure, 'Must Remain Sealed'), forbiddenDurableSecrets: field(disclosure, 'Forbidden Durable Secrets'), privacyPolicyOwner: field(disclosure, 'Privacy Policy Owner')
  });
}

export function qualifyTransportEnvelopeV1Artifact(markdown = '') {
  const parsed = parseTransportEnvelopeV1(markdown);
  const findings = [];
  const self = canonicalC14nV2SelfState(String(markdown || ''));
  if (self.state !== 'verified') findings.push({ severity: 'error', code: 'secure-transport.envelope.integrity-self-invalid', message: 'Transport Envelope self-integrity does not verify.', reason: self.reason || self.state });
  const crypto = qualifySecureTransportV1Envelope(parsed);
  for (const item of crypto.findings || []) findings.push({ severity: item.kind === 'unsupported' ? 'error' : 'error', code: item.code, message: item.message });
  if (!parsed.workspaceArtifactPath || !parsed.protectedPayloadDescriptorPath) findings.push({ severity: 'error', code: 'secure-transport.envelope.binding-links-invalid', message: 'Transport Envelope Workspace Artifact and Protected Payload links are required.' });
  return deepFreeze({ status: findings.length ? (crypto.state === 'unsupported' ? 'unsupported' : 'invalid') : 'qualified', parsed, findings });
}

function parseSlots(text = '') {
  const out = [];
  const re = /^-\s+([^\n]+)\n((?:\s{2}-\s+[^\n]+\n?)*)/gm;
  for (const match of String(text || '').matchAll(re)) {
    const section = String(match[2] || '');
    out.push(deepFreeze({
      slotId: field(section, 'Slot Id'), slotKind: field(section, 'Slot Kind'), kdfAlgorithm: field(section, 'KDF Algorithm'), kdfSaltEncoding: field(section, 'KDF Salt Encoding'), kdfSalt: field(section, 'KDF Salt'), kdfParameters: jsonObjectField(section, 'KDF Parameters'), keyWrapAlgorithm: field(section, 'Key Wrap Algorithm'), keyWrapParameters: jsonObjectField(section, 'Key Wrap Parameters'), wrappedContentKeyEncoding: field(section, 'Wrapped Content Key Encoding'), wrappedContentKey: field(section, 'Wrapped Content Key'), slotVerificationRule: field(section, 'Slot Verification Rule'), ...(field(section, 'Recipient Hint') ? { recipientHint: field(section, 'Recipient Hint') } : {})
    }));
  }
  return Object.freeze(out);
}
function jsonObjectField(section, name) { const raw = unquote(field(section, name)); try { const value = JSON.parse(raw); return value && typeof value === 'object' && !Array.isArray(value) ? value : null; } catch { return null; } }
function numberField(section, name) { const raw = field(section, name); return /^\d+$/.test(raw) ? Number(raw) : null; }
function renderParentEnvelope(parent = null) { if (!parent) return ''; const path=String(parent.path||'').trim(), label=String(parent.label||path||'Parent'), schemaId=String(parent.schemaId||'').trim(), schemaTarget=String(parent.schemaTarget||'').trim(), createdAt=normalizeCreatedAt(parent.createdAt||''); if(!path||!schemaId||!schemaTarget||!String(parent.selfDigest||'').trim()) throw new Error('secure-transport.parent-authority-incomplete'); return `- Parent\n  - Parent Schema: [${schemaId}](${schemaTarget})\n  - Created At: ${createdAt}\n  - Trace: [${label}](${path})\n  - Origin:\n    - [relative](${path})\n`; }
function renderParentIntegrity(parent = null) { if(!parent) return ''; const path=String(parent.path||'').trim(), label=String(parent.label||path||'Parent'), digest=String(parent.selfDigest||'').trim(); if(!path||!digest) throw new Error('secure-transport.parent-integrity-incomplete'); return `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [${label}](${path})\n  - Value: ${digest}\n\n`; }
function normalizeCreatedAt(value=''){const text=String(value||'').trim(); return text ? text.replace('T',' ').replace(/\.\d{3}Z$/,'').replace(/Z$/,'').slice(0,19) : '1970-01-01 00:00:00';}
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;if(ArrayBuffer.isView(value)||value instanceof ArrayBuffer)return value;for(const child of Object.values(value))deepFreeze(child);return Object.freeze(value);}
