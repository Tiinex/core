import { toUint8Array, utf8Bytes } from '../export/package.bytes.js';

export const SECURE_TRANSPORT_V1_PROFILE = deepFreeze({
  profileId: 'tiinex.password.pbkdf2-hmac-sha256.aes-256-kw.aes-256-gcm.v1',
  profileVersion: 1,
  contentEncryptionAlgorithm: 'AES-256-GCM',
  contentEncryptionParameters: {
    keyBits: 256,
    nonceBytes: 12,
    tagBits: 128,
    binaryFraming: 'webcrypto-ciphertext-concatenated-tag'
  },
  nonceOrIvEncoding: 'base64url-no-padding',
  payloadAuthenticationRule: 'authenticated-encryption-required',
  securityMetadataAuthenticationRule: 'authenticate-profile-and-workspace-binding',
  recipientChangePayloadRule: 'protected-payload-bytes-unchanged',
  kdfAlgorithm: 'PBKDF2-HMAC-SHA-256',
  kdfParameters: {
    iterations: 600000,
    saltBytes: 16,
    derivedKeyBits: 256,
    passwordEncoding: 'utf8-no-normalization'
  },
  keyWrapAlgorithm: 'AES-256-KW',
  keyWrapParameters: {
    wrappingKeyBits: 256,
    wrappedKeyFormat: 'raw',
    contentKeyAlgorithm: 'AES-256-GCM'
  },
  kdfSaltEncoding: 'base64url-no-padding',
  wrappedContentKeyEncoding: 'base64url-no-padding',
  slotKind: 'password',
  slotVerificationRule: 'unwrap-then-authenticate-protected-payload'
});

export const SECURE_TRANSPORT_V1_ENVELOPE_CONTRACT = deepFreeze({
  envelopePurpose: 'password-sealed-workspace-transport',
  envelopeVersion: 1,
  plaintextRepresentationKind: 'exact-workspace-byte-tree-archive',
  protectedNameTree: 'sealed',
  workspaceBindingMethod: 'sha256-exact-visible-workspace-artifact-bytes',
  contentKeyScope: 'fresh-random-per-protected-workspace',
  openRule: 'any-one-qualified-password-slot',
  wrongPasswordResult: 'locked',
  unsupportedProfileResult: 'unsupported',
  malformedMetadataResult: 'failed',
  authenticationFailureResult: 'failed',
  missingAuthorizedSlotResult: 'locked',
  secretPersistence: 'runtime-only',
  plaintextPersistence: 'transient-or-explicit-destination-only',
  recoveryRule: 'no-hidden-bypass',
  failurePolicy: 'fail-closed',
  multiWorkspaceIsolation: 'independent-envelope-content-key-and-recipient-set',
  payloadByteIntegrityOwner: 'external-payload',
  envelopeRootIntegrityMeaning: 'metadata-continuity-only',
  cryptographicAuthenticationMeaning: 'encrypted-representation-and-profile-binding-only',
  providerStateWhileLocked: 'inactive',
  postOpenQualification: 'normal-workspace-representation-and-schema-integrity',
  semanticAuthority: 'none',
  outerVisibleMaterial: 'non-secret-envelope-profile-and-slot-metadata',
  mustRemainSealed: 'workspace-internal-paths-tree-and-plaintext-bytes',
  forbiddenDurableSecrets: 'passwords-derived-keys-and-plaintext-content-key',
  privacyPolicyOwner: 'privacy-boundary-when-needed'
});

export function qualifySecureTransportV1Envelope(input = {}) {
  const findings = [];
  const envelope = input && typeof input === 'object' ? input : {};
  for (const [key, expected] of Object.entries(SECURE_TRANSPORT_V1_ENVELOPE_CONTRACT)) exactField(envelope, key, expected, findings);
  const profile = envelope.profile && typeof envelope.profile === 'object' ? envelope.profile : {};
  const supportedProfile = String(profile.profileId || '') === SECURE_TRANSPORT_V1_PROFILE.profileId && Number(profile.profileVersion || 0) === SECURE_TRANSPORT_V1_PROFILE.profileVersion;
  if (!String(profile.profileId || '') || !positiveInteger(profile.profileVersion)) findings.push(problem('invalid', 'secure-transport.profile.identity-invalid', 'Transport profile identity/version is missing or malformed.'));
  if (String(profile.profileId || '') && positiveInteger(profile.profileVersion) && !supportedProfile) findings.push(problem('unsupported', 'secure-transport.profile.unsupported', 'Transport profile is not supported by this Core runtime.', { profileId: String(profile.profileId || ''), profileVersion: Number(profile.profileVersion || 0) }));
  if (supportedProfile) {
    for (const key of ['contentEncryptionAlgorithm', 'contentEncryptionParameters', 'nonceOrIvEncoding', 'payloadAuthenticationRule', 'securityMetadataAuthenticationRule', 'recipientChangePayloadRule']) exactField(profile, key, SECURE_TRANSPORT_V1_PROFILE[key], findings);
  }
  if (!strictBase64Url(String(profile.nonceOrIv || ''), SECURE_TRANSPORT_V1_PROFILE.contentEncryptionParameters.nonceBytes)) findings.push(problem('invalid', 'secure-transport.profile.nonce-invalid', 'Transport profile nonce/IV must be exact base64url-no-padding bytes for the supported profile.'));
  if (!/^[0-9a-f]{64}$/.test(String(envelope.workspaceBindingValue || ''))) findings.push(problem('invalid', 'secure-transport.workspace-binding.invalid', 'Workspace Binding Value must be lowercase SHA-256 hex.'));
  const slots = Array.isArray(envelope.passwordRecipientSlots) ? envelope.passwordRecipientSlots : [];
  if (!slots.length) findings.push(problem('invalid', 'secure-transport.slots.missing', 'At least one password recipient slot is required.'));
  const ids = new Set();
  for (const slot of slots) {
    const slotId = String(slot?.slotId || '').trim();
    if (!slotId || ids.has(slotId)) findings.push(problem('invalid', 'secure-transport.slot.id-invalid', 'Password recipient slot ids must be non-empty and unique.', { slotId }));
    ids.add(slotId);
    if (supportedProfile) {
      const slotExpected = {
        slotKind: SECURE_TRANSPORT_V1_PROFILE.slotKind,
        kdfAlgorithm: SECURE_TRANSPORT_V1_PROFILE.kdfAlgorithm,
        kdfSaltEncoding: SECURE_TRANSPORT_V1_PROFILE.kdfSaltEncoding,
        kdfParameters: SECURE_TRANSPORT_V1_PROFILE.kdfParameters,
        keyWrapAlgorithm: SECURE_TRANSPORT_V1_PROFILE.keyWrapAlgorithm,
        keyWrapParameters: SECURE_TRANSPORT_V1_PROFILE.keyWrapParameters,
        wrappedContentKeyEncoding: SECURE_TRANSPORT_V1_PROFILE.wrappedContentKeyEncoding,
        slotVerificationRule: SECURE_TRANSPORT_V1_PROFILE.slotVerificationRule
      };
      for (const [key, expected] of Object.entries(slotExpected)) exactField(slot || {}, key, expected, findings);
    }
    if (!strictBase64Url(String(slot?.kdfSalt || ''), SECURE_TRANSPORT_V1_PROFILE.kdfParameters.saltBytes)) findings.push(problem('invalid', 'secure-transport.slot.salt-invalid', 'Password recipient slot salt must be exact base64url-no-padding bytes for the supported profile.', { slotId }));
    if (!strictBase64Url(String(slot?.wrappedContentKey || ''), 40)) findings.push(problem('invalid', 'secure-transport.slot.wrapped-key-invalid', 'Wrapped content key must be a 40-byte RFC 3394 AES-KW result encoded as base64url-no-padding.', { slotId }));
    if (Object.prototype.hasOwnProperty.call(slot || {}, 'password') || Object.prototype.hasOwnProperty.call(slot || {}, 'derivedKey') || Object.prototype.hasOwnProperty.call(slot || {}, 'contentKey')) findings.push(problem('invalid', 'secure-transport.slot.secret-field-forbidden', 'Durable envelope metadata must not contain password or key material.', { slotId }));
  }
  const invalid = findings.some((item) => item.kind === 'invalid');
  const unsupported = !invalid && findings.some((item) => item.kind === 'unsupported');
  return deepFreeze({ state: invalid ? 'invalid' : unsupported ? 'unsupported' : 'qualified', findings });
}

export async function sealPasswordWorkspacePayload(input = {}) {
  const runtimeCrypto = resolveCrypto(input.crypto);
  const plaintext = toUint8Array(input.plaintext);
  const binding = String(input.workspaceBindingValue || '');
  const recipients = normalizeRecipients(input.recipients);
  if (!/^[0-9a-f]{64}$/.test(binding)) return failed('secure-transport.workspace-binding.invalid', 'Workspace Binding Value must be lowercase SHA-256 hex.');
  if (!recipients.length) return failed('secure-transport.recipients.missing', 'At least one password recipient is required.');
  if (hasEmptyPasswordRecipient(recipients)) return failed('secure-transport.password.empty', 'Password recipient slots require a non-empty password.');
  const nonce = randomBytes(runtimeCrypto, SECURE_TRANSPORT_V1_PROFILE.contentEncryptionParameters.nonceBytes);
  const contentKey = await runtimeCrypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const envelopeBase = makeEnvelopeBase(binding, nonce);
  const aad = authenticatedMetadataBytes(envelopeBase);
  const encrypted = new Uint8Array(await runtimeCrypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: 128 }, contentKey, plaintext));
  const slots = [];
  for (const recipient of recipients) slots.push(await createSlot(runtimeCrypto, contentKey, recipient));
  const envelope = deepFreeze({ ...envelopeBase, passwordRecipientSlots: Object.freeze(slots) });
  const qualification = qualifySecureTransportV1Envelope(envelope);
  if (qualification.state !== 'qualified') return deepFreeze({ state: 'failed', reason: 'generated-envelope-unqualified', findings: qualification.findings });
  return deepFreeze({ state: 'sealed', protectedPayload: encrypted, envelope, profile: SECURE_TRANSPORT_V1_PROFILE, boundary: 'Ciphertext and non-secret opening metadata only; passwords, derived keys, wrapping keys, and plaintext content keys are not returned.' });
}

export async function openPasswordWorkspacePayload(input = {}) {
  const qualification = qualifySecureTransportV1Envelope(input.envelope || {});
  if (qualification.state === 'unsupported') return deepFreeze({ state: 'unsupported', reason: 'unsupported-profile', findings: qualification.findings });
  if (qualification.state !== 'qualified') return deepFreeze({ state: 'failed', reason: 'malformed-metadata', findings: qualification.findings });
  const runtimeCrypto = resolveCrypto(input.crypto);
  const payload = toUint8Array(input.protectedPayload);
  const password = normalizePassword(input.password);
  const requestedSlotId = String(input.slotId || '').trim();
  const allSlots = input.envelope.passwordRecipientSlots || [];
  const slots = requestedSlotId ? allSlots.filter((slot) => String(slot.slotId || '') === requestedSlotId) : allSlots;
  if (!slots.length) return deepFreeze({ state: 'locked', reason: requestedSlotId ? 'missing-authorized-slot' : 'no-password-slots' });
  if (password.length === 0) return deepFreeze({ state: 'locked', reason: 'wrong-password' });
  const nonce = decodeBase64Url(input.envelope.profile.nonceOrIv);
  const aad = authenticatedMetadataBytes(input.envelope);
  let unwrapped = false;
  for (const slot of slots) {
    let contentKey;
    try {
      const wrappingKey = await deriveWrappingKey(runtimeCrypto, password, slot);
      contentKey = await runtimeCrypto.subtle.unwrapKey('raw', decodeBase64Url(slot.wrappedContentKey), wrappingKey, 'AES-KW', { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      unwrapped = true;
    } catch {
      continue;
    }
    try {
      const plaintext = new Uint8Array(await runtimeCrypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: 128 }, contentKey, payload));
      return deepFreeze({ state: 'opened', plaintext, slotId: String(slot.slotId || ''), workspaceBindingValue: String(input.envelope.workspaceBindingValue || ''), boundary: 'Authenticated plaintext is transient return data; caller chooses whether to persist an explicit destination.' });
    } catch {
      return deepFreeze({ state: 'failed', reason: 'authentication-failed' });
    }
  }
  return deepFreeze({ state: unwrapped ? 'failed' : 'locked', reason: unwrapped ? 'authentication-failed' : 'wrong-password' });
}

export async function replacePasswordWorkspaceRecipients(input = {}) {
  const qualification = qualifySecureTransportV1Envelope(input.envelope || {});
  if (qualification.state === 'unsupported') return deepFreeze({ state: 'unsupported', reason: 'unsupported-profile', findings: qualification.findings });
  if (qualification.state !== 'qualified') return deepFreeze({ state: 'failed', reason: 'malformed-metadata', findings: qualification.findings });
  const runtimeCrypto = resolveCrypto(input.crypto);
  const recipients = normalizeRecipients(input.recipients);
  if (!recipients.length) return failed('secure-transport.recipients.missing', 'At least one replacement password recipient is required.');
  if (hasEmptyPasswordRecipient(recipients)) return failed('secure-transport.password.empty', 'Replacement password recipient slots require a non-empty password.');
  const payload = toUint8Array(input.protectedPayload);
  const password = normalizePassword(input.authorizationPassword ?? input.password);
  if (password.length === 0) return deepFreeze({ state: 'locked', reason: 'wrong-password' });
  const nonce = decodeBase64Url(input.envelope.profile.nonceOrIv);
  const aad = authenticatedMetadataBytes(input.envelope);
  let authorizedKey = null;
  for (const slot of input.envelope.passwordRecipientSlots || []) {
    try {
      const wrappingKey = await deriveWrappingKey(runtimeCrypto, password, slot);
      const key = await runtimeCrypto.subtle.unwrapKey('raw', decodeBase64Url(slot.wrappedContentKey), wrappingKey, 'AES-KW', { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
      await runtimeCrypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: 128 }, key, payload);
      authorizedKey = key;
      break;
    } catch { /* try another slot */ }
  }
  if (!authorizedKey) return deepFreeze({ state: 'locked', reason: 'wrong-password' });
  const slots = [];
  for (const recipient of recipients) slots.push(await createSlot(runtimeCrypto, authorizedKey, recipient));
  const envelope = deepFreeze({ ...input.envelope, passwordRecipientSlots: Object.freeze(slots) });
  const post = qualifySecureTransportV1Envelope(envelope);
  if (post.state !== 'qualified') return deepFreeze({ state: 'failed', reason: 'generated-envelope-unqualified', findings: post.findings });
  return deepFreeze({ state: 'rewrapped', protectedPayload: payload, envelope, boundary: 'Recipient-slot replacement authenticates the existing payload and preserves its exact bytes.' });
}

export function secureTransportV1AuthenticatedMetadata(input = {}) {
  return new TextDecoder().decode(authenticatedMetadataBytes(input));
}

function makeEnvelopeBase(workspaceBindingValue, nonce) {
  return deepFreeze({
    ...SECURE_TRANSPORT_V1_ENVELOPE_CONTRACT,
    workspaceBindingValue,
    profile: deepFreeze({
      profileId: SECURE_TRANSPORT_V1_PROFILE.profileId,
      profileVersion: SECURE_TRANSPORT_V1_PROFILE.profileVersion,
      contentEncryptionAlgorithm: SECURE_TRANSPORT_V1_PROFILE.contentEncryptionAlgorithm,
      contentEncryptionParameters: SECURE_TRANSPORT_V1_PROFILE.contentEncryptionParameters,
      nonceOrIvEncoding: SECURE_TRANSPORT_V1_PROFILE.nonceOrIvEncoding,
      nonceOrIv: encodeBase64Url(nonce),
      payloadAuthenticationRule: SECURE_TRANSPORT_V1_PROFILE.payloadAuthenticationRule,
      securityMetadataAuthenticationRule: SECURE_TRANSPORT_V1_PROFILE.securityMetadataAuthenticationRule,
      recipientChangePayloadRule: SECURE_TRANSPORT_V1_PROFILE.recipientChangePayloadRule
    })
  });
}

async function createSlot(runtimeCrypto, contentKey, recipient) {
  const salt = randomBytes(runtimeCrypto, SECURE_TRANSPORT_V1_PROFILE.kdfParameters.saltBytes);
  const slotTemplate = {
    slotId: recipient.slotId,
    slotKind: SECURE_TRANSPORT_V1_PROFILE.slotKind,
    kdfAlgorithm: SECURE_TRANSPORT_V1_PROFILE.kdfAlgorithm,
    kdfSaltEncoding: SECURE_TRANSPORT_V1_PROFILE.kdfSaltEncoding,
    kdfSalt: encodeBase64Url(salt),
    kdfParameters: SECURE_TRANSPORT_V1_PROFILE.kdfParameters,
    keyWrapAlgorithm: SECURE_TRANSPORT_V1_PROFILE.keyWrapAlgorithm,
    keyWrapParameters: SECURE_TRANSPORT_V1_PROFILE.keyWrapParameters,
    wrappedContentKeyEncoding: SECURE_TRANSPORT_V1_PROFILE.wrappedContentKeyEncoding,
    wrappedContentKey: '',
    slotVerificationRule: SECURE_TRANSPORT_V1_PROFILE.slotVerificationRule,
    ...(recipient.recipientHint ? { recipientHint: recipient.recipientHint } : {})
  };
  const wrappingKey = await deriveWrappingKey(runtimeCrypto, recipient.password, slotTemplate);
  const wrapped = new Uint8Array(await runtimeCrypto.subtle.wrapKey('raw', contentKey, wrappingKey, 'AES-KW'));
  return deepFreeze({ ...slotTemplate, wrappedContentKey: encodeBase64Url(wrapped) });
}

async function deriveWrappingKey(runtimeCrypto, password, slot) {
  const passwordKey = await runtimeCrypto.subtle.importKey('raw', utf8Bytes(password), 'PBKDF2', false, ['deriveKey']);
  return runtimeCrypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: decodeBase64Url(slot.kdfSalt), iterations: SECURE_TRANSPORT_V1_PROFILE.kdfParameters.iterations }, passwordKey, { name: 'AES-KW', length: 256 }, false, ['wrapKey', 'unwrapKey']);
}

function authenticatedMetadataBytes(envelope = {}) {
  const profile = envelope.profile || {};
  const bound = {
    envelopePurpose: envelope.envelopePurpose,
    envelopeVersion: envelope.envelopeVersion,
    plaintextRepresentationKind: envelope.plaintextRepresentationKind,
    protectedNameTree: envelope.protectedNameTree,
    workspaceBindingMethod: envelope.workspaceBindingMethod,
    workspaceBindingValue: envelope.workspaceBindingValue,
    contentKeyScope: envelope.contentKeyScope,
    profileId: profile.profileId,
    profileVersion: profile.profileVersion,
    contentEncryptionAlgorithm: profile.contentEncryptionAlgorithm,
    contentEncryptionParameters: profile.contentEncryptionParameters,
    nonceOrIvEncoding: profile.nonceOrIvEncoding,
    nonceOrIv: profile.nonceOrIv,
    payloadAuthenticationRule: profile.payloadAuthenticationRule,
    securityMetadataAuthenticationRule: profile.securityMetadataAuthenticationRule,
    recipientChangePayloadRule: profile.recipientChangePayloadRule
  };
  return utf8Bytes(stableJson(bound));
}

function normalizeRecipients(input) {
  const source = Array.isArray(input) ? input : [];
  const seen = new Set();
  const out = [];
  for (const item of source) {
    const slotId = String(item?.slotId || '').trim();
    if (!slotId || seen.has(slotId)) continue;
    seen.add(slotId);
    out.push({ slotId, password: normalizePassword(item?.password), recipientHint: String(item?.recipientHint || '').trim() });
  }
  return out;
}
function normalizePassword(value) { return String(value ?? ''); }
function hasEmptyPasswordRecipient(recipients = []) { return recipients.some((recipient) => recipient.password.length === 0); }
function resolveCrypto(candidate) {
  const value = candidate || globalThis.crypto;
  if (!value?.subtle || typeof value.getRandomValues !== 'function') throw new Error('secure-transport.webcrypto-unavailable');
  return value;
}
function randomBytes(runtimeCrypto, length) { const bytes = new Uint8Array(length); runtimeCrypto.getRandomValues(bytes); return bytes; }
function positiveInteger(value) { return Number.isInteger(Number(value)) && Number(value) > 0; }
function exactField(object, key, expected, findings) {
  const observed = object?.[key];
  if (stableJson(observed) !== stableJson(expected)) findings.push(problem('invalid', `secure-transport.field.${key}.invalid`, 'Secure Transport V1 closed-domain field is missing or invalid.', { field: key, expected, observed }));
}
function problem(kind, code, message, extra = {}) { return deepFreeze({ kind, code, message, ...extra }); }
function failed(code, message) { return deepFreeze({ state: 'failed', reason: code, findings: [problem('invalid', code, message)] }); }
function strictBase64Url(value, expectedBytes) {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.includes('=')) return false;
  try { return decodeBase64Url(value).byteLength === expectedBytes && encodeBase64Url(decodeBase64Url(value)) === value; } catch { return false; }
}
function encodeBase64Url(bytesInput) {
  const bytes = toUint8Array(bytesInput);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  const base64 = typeof btoa === 'function' ? btoa(binary) : encodeBase64(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function decodeBase64Url(value) {
  const text = String(value || '');
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) throw new Error('invalid-base64url');
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
    return out;
  }
  return decodeBase64(base64);
}
function encodeBase64(binary) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let index = 0; index < binary.length; index += 3) {
    const a = binary.charCodeAt(index), b = index + 1 < binary.length ? binary.charCodeAt(index + 1) : 0, c = index + 2 < binary.length ? binary.charCodeAt(index + 2) : 0;
    const n = (a << 16) | (b << 8) | c;
    out += alphabet[(n >>> 18) & 63] + alphabet[(n >>> 12) & 63] + (index + 1 < binary.length ? alphabet[(n >>> 6) & 63] : '=') + (index + 2 < binary.length ? alphabet[n & 63] : '=');
  }
  return out;
}
function decodeBase64(base64) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = String(base64 || '').replace(/=+$/g, '');
  let buffer = 0, bits = 0; const out = [];
  for (const char of clean) {
    const index = alphabet.indexOf(char); if (index < 0) throw new Error('invalid-base64');
    buffer = (buffer << 6) | index; bits += 6;
    if (bits >= 8) { bits -= 8; out.push((buffer >>> bits) & 0xff); }
  }
  return Uint8Array.from(out);
}
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
