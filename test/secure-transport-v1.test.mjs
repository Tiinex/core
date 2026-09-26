import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SECURE_TRANSPORT_V1_PROFILE,
  openPasswordWorkspacePayload,
  qualifySecureTransportV1Envelope,
  replacePasswordWorkspaceRecipients,
  sealPasswordWorkspacePayload,
  secureTransportV1AuthenticatedMetadata
} from '../src/public/index.js';
import { packageFileByteView, sha256Hex } from '../src/export/package.bytes.js';
import { renderTransportEnvelopeV1, qualifyTransportEnvelopeV1Artifact } from '../src/tooling/portable/handoff/transportEnvelopeV1.js';

const encoder = new TextEncoder();
const PASSWORD_ALPHA = 'correct horse battery staple';
const PASSWORD_BETA = 'alpha recipient independent password';

function jsonClone(value) { return JSON.parse(JSON.stringify(value)); }
function equalBytes(left, right) { assert.deepEqual([...packageFileByteView({ data: left })], [...packageFileByteView({ data: right })]); }
function objectKeysDeep(value, out = []) { if (!value || typeof value !== 'object' || ArrayBuffer.isView(value)) return out; for (const [key, child] of Object.entries(value)) { out.push(key); objectKeysDeep(child, out); } return out; }
function forbiddenCrypto(label = 'crypto') {
  const forbidden = () => { throw new Error(`unexpected-${label}-operation`); };
  return { subtle: new Proxy({}, { get: () => forbidden }), getRandomValues: forbidden };
}

test('Secure Transport V1 profile gives independent password slots over one exact authenticated payload and rotates recipients without re-encryption', async () => {
  const plaintext = encoder.encode('exact protected workspace bytes');
  const workspaceBindingValue = sha256Hex(encoder.encode('visible workspace artifact'));
  const sealed = await sealPasswordWorkspacePayload({
    plaintext,
    workspaceBindingValue,
    recipients: [
      { slotId: 'alpha', password: PASSWORD_ALPHA, recipientHint: 'first' },
      { slotId: 'beta', password: PASSWORD_BETA, recipientHint: 'second' }
    ]
  });
  assert.equal(sealed.state, 'sealed');
  assert.equal(qualifySecureTransportV1Envelope(sealed.envelope).state, 'qualified');
  assert.equal(SECURE_TRANSPORT_V1_PROFILE.contentEncryptionAlgorithm, 'AES-256-GCM');
  assert.equal(SECURE_TRANSPORT_V1_PROFILE.kdfAlgorithm, 'PBKDF2-HMAC-SHA-256');
  assert.equal(SECURE_TRANSPORT_V1_PROFILE.kdfParameters.iterations, 600000);
  assert.equal(SECURE_TRANSPORT_V1_PROFILE.keyWrapAlgorithm, 'AES-256-KW');
  assert.ok(!JSON.stringify(sealed.envelope).includes(PASSWORD_ALPHA));
  assert.ok(!JSON.stringify(sealed.envelope).includes(PASSWORD_BETA));
  const durableKeys = new Set(objectKeysDeep(sealed.envelope));
  for (const forbidden of ['password', 'derivedKey', 'wrappingKey', 'contentKey']) assert.equal(durableKeys.has(forbidden), false);

  const alpha = await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: sealed.envelope, password: PASSWORD_ALPHA, slotId: 'alpha' });
  const beta = await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: sealed.envelope, password: PASSWORD_BETA, slotId: 'beta' });
  assert.equal(alpha.state, 'opened');
  assert.equal(beta.state, 'opened');
  equalBytes(alpha.plaintext, plaintext);
  equalBytes(beta.plaintext, plaintext);
  assert.equal((await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: sealed.envelope, password: 'wrong' })).state, 'locked');
  assert.deepEqual(await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: sealed.envelope, password: PASSWORD_ALPHA, slotId: 'missing' }), { state: 'locked', reason: 'missing-authorized-slot' });

  const before = sha256Hex(sealed.protectedPayload);
  const changed = await replacePasswordWorkspaceRecipients({
    protectedPayload: sealed.protectedPayload,
    envelope: sealed.envelope,
    authorizationPassword: PASSWORD_ALPHA,
    recipients: [{ slotId: 'gamma', password: 'replacement password', recipientHint: 'replacement' }]
  });
  assert.equal(changed.state, 'rewrapped');
  assert.equal(sha256Hex(changed.protectedPayload), before);
  equalBytes(changed.protectedPayload, sealed.protectedPayload);
  assert.equal((await openPasswordWorkspacePayload({ protectedPayload: changed.protectedPayload, envelope: changed.envelope, password: PASSWORD_ALPHA })).state, 'locked');
  assert.equal((await openPasswordWorkspacePayload({ protectedPayload: changed.protectedPayload, envelope: changed.envelope, password: 'replacement password' })).state, 'opened');
});

test('Secure Transport V1 rejects empty passwords before slot derivation/wrapping and empty open candidates remain locked as wrong-password', async () => {
  const plaintext = encoder.encode('empty-password conformance');
  const binding = 'e'.repeat(64);

  const emptyCreate = await sealPasswordWorkspacePayload({
    plaintext,
    workspaceBindingValue: binding,
    recipients: [{ slotId: 'empty', password: '' }],
    crypto: forbiddenCrypto('empty-create')
  });
  assert.equal(emptyCreate.state, 'failed');
  assert.equal(emptyCreate.reason, 'secure-transport.password.empty');
  assert.equal(Object.prototype.hasOwnProperty.call(emptyCreate, 'protectedPayload'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(emptyCreate, 'envelope'), false);

  const mixedCreate = await sealPasswordWorkspacePayload({
    plaintext,
    workspaceBindingValue: binding,
    recipients: [{ slotId: 'valid', password: PASSWORD_ALPHA }, { slotId: 'empty', password: '' }],
    crypto: forbiddenCrypto('mixed-create')
  });
  assert.equal(mixedCreate.state, 'failed');
  assert.equal(mixedCreate.reason, 'secure-transport.password.empty');

  const sealed = await sealPasswordWorkspacePayload({ plaintext, workspaceBindingValue: binding, recipients: [{ slotId: 'alpha', password: PASSWORD_ALPHA }] });
  assert.equal(sealed.state, 'sealed');

  const emptyOpen = await openPasswordWorkspacePayload({
    protectedPayload: sealed.protectedPayload, envelope: sealed.envelope, password: '', crypto: forbiddenCrypto('empty-open')
  });
  assert.deepEqual(emptyOpen, { state: 'locked', reason: 'wrong-password' });

  const emptyReplacement = await replacePasswordWorkspaceRecipients({
    protectedPayload: sealed.protectedPayload,
    envelope: sealed.envelope,
    authorizationPassword: PASSWORD_ALPHA,
    recipients: [{ slotId: 'replacement', password: '' }],
    crypto: forbiddenCrypto('empty-replacement')
  });
  assert.equal(emptyReplacement.state, 'failed');
  assert.equal(emptyReplacement.reason, 'secure-transport.password.empty');
  assert.equal(Object.prototype.hasOwnProperty.call(emptyReplacement, 'protectedPayload'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(emptyReplacement, 'envelope'), false);

  const emptyAuthorization = await replacePasswordWorkspaceRecipients({
    protectedPayload: sealed.protectedPayload,
    envelope: sealed.envelope,
    authorizationPassword: '',
    recipients: [{ slotId: 'replacement', password: 'non-empty replacement' }],
    crypto: forbiddenCrypto('empty-authorization')
  });
  assert.deepEqual(emptyAuthorization, { state: 'locked', reason: 'wrong-password' });
});

test('Transport Envelope V1 renderer emits the plain schema id and no mutable branch locator', async () => {
  const sealed = await sealPasswordWorkspacePayload({
    plaintext: encoder.encode('renderer schema-reference conformance'),
    workspaceBindingValue: 'f'.repeat(64),
    recipients: [{ slotId: 'alpha', password: PASSWORD_ALPHA }]
  });
  assert.equal(sealed.state, 'sealed');
  const markdown = renderTransportEnvelopeV1({
    workspaceArtifactPath: '001-3-protected.workspace.md',
    protectedPayloadDescriptorPath: '001-3-protected-payload.trace.md',
    envelope: sealed.envelope
  });
  assert.ok(markdown.includes('- Current\n  - Current Schema: tiinex.transport.envelope.v1\n  - Created At:'));
  assert.equal(markdown.includes('Current Schema: [tiinex.transport.envelope.v1]('), false);
  assert.equal(markdown.includes('/blob/main/.topics/.schemas/transport/envelope/tiinex.transport.envelope.v1.schema.md'), false);
  assert.equal(qualifyTransportEnvelopeV1Artifact(markdown).status, 'qualified');
});

test('Secure Transport V1 authenticates profile/workspace metadata and fails closed for tamper, truncation, malformed metadata and unsupported profiles', async () => {
  const plaintext = encoder.encode('authenticated protected bytes');
  const sealed = await sealPasswordWorkspacePayload({ plaintext, workspaceBindingValue: 'a'.repeat(64), recipients: [{ slotId: 'alpha', password: PASSWORD_ALPHA }] });
  assert.equal(sealed.state, 'sealed');

  const tamperedPayload = new Uint8Array(sealed.protectedPayload);
  tamperedPayload[Math.floor(tamperedPayload.length / 2)] ^= 1;
  assert.deepEqual(await openPasswordWorkspacePayload({ protectedPayload: tamperedPayload, envelope: sealed.envelope, password: PASSWORD_ALPHA }), { state: 'failed', reason: 'authentication-failed' });
  assert.deepEqual(await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload.slice(0, -1), envelope: sealed.envelope, password: PASSWORD_ALPHA }), { state: 'failed', reason: 'authentication-failed' });

  const metadataTamper = jsonClone(sealed.envelope);
  metadataTamper.workspaceBindingValue = 'b'.repeat(64);
  assert.deepEqual(await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: metadataTamper, password: PASSWORD_ALPHA }), { state: 'failed', reason: 'authentication-failed' });
  assert.ok(secureTransportV1AuthenticatedMetadata(metadataTamper).includes('"workspaceBindingValue":"' + 'b'.repeat(64) + '"'));

  const unsupported = jsonClone(sealed.envelope);
  unsupported.profile.profileId = 'tiinex.unsupported.profile.v1';
  assert.equal((await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: unsupported, password: PASSWORD_ALPHA })).state, 'unsupported');
  const malformed = jsonClone(sealed.envelope);
  malformed.passwordRecipientSlots[0].kdfParameters.iterations = 1;
  const malformedResult = await openPasswordWorkspacePayload({ protectedPayload: sealed.protectedPayload, envelope: malformed, password: PASSWORD_ALPHA });
  assert.equal(malformedResult.state, 'failed');
  assert.equal(malformedResult.reason, 'malformed-metadata');
});

test('Secure Transport V1 uses fresh per-Workspace encryption state and envelope artifacts preserve only non-secret deterministic opening metadata', async () => {
  const plaintext = encoder.encode('same plaintext across two protected workspaces');
  const binding = 'c'.repeat(64);
  const [left, right] = await Promise.all([
    sealPasswordWorkspacePayload({ plaintext, workspaceBindingValue: binding, recipients: [{ slotId: 'alpha', password: PASSWORD_ALPHA }] }),
    sealPasswordWorkspacePayload({ plaintext, workspaceBindingValue: binding, recipients: [{ slotId: 'alpha', password: PASSWORD_ALPHA }] })
  ]);
  assert.equal(left.state, 'sealed');
  assert.equal(right.state, 'sealed');
  assert.notEqual(left.envelope.profile.nonceOrIv, right.envelope.profile.nonceOrIv);
  assert.notEqual(sha256Hex(left.protectedPayload), sha256Hex(right.protectedPayload));
  assert.notEqual(left.envelope.passwordRecipientSlots[0].kdfSalt, right.envelope.passwordRecipientSlots[0].kdfSalt);
  assert.notEqual(left.envelope.passwordRecipientSlots[0].wrappedContentKey, right.envelope.passwordRecipientSlots[0].wrappedContentKey);

  const markdown = renderTransportEnvelopeV1({ workspaceArtifactPath: '001-3-protected.workspace.md', protectedPayloadDescriptorPath: '001-3-protected-payload.trace.md', envelope: left.envelope });
  const qualified = qualifyTransportEnvelopeV1Artifact(markdown);
  assert.equal(qualified.status, 'qualified', JSON.stringify(qualified.findings || []));
  assert.ok(!markdown.includes(PASSWORD_ALPHA));
  assert.ok(!markdown.includes('same plaintext across two protected workspaces'));
  assert.ok(!markdown.includes('Workspace Artifact Inner Path'));
});



