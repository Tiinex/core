import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  SECURE_TRANSPORT_V1_PROFILE,
  openPasswordWorkspacePayload,
  qualifySecureTransportV1Envelope,
  replacePasswordWorkspaceRecipients,
  sealPasswordWorkspacePayload,
  secureTransportV1AuthenticatedMetadata
} from '../src/public/index.js';
import { finalizeFile } from '../src/export/package.fileMap.js';
import { packageFileByteView, packageFileBytes, sha256Hex } from '../src/export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../src/export/package.zip.js';
import { qualifiedHandoffFixture } from '../src/tooling/portable/handoff/qualifiedHandoffFixture.js';
import { renderRecipientV2ExternalPayload } from '../src/tooling/portable/handoff/recipientV2.artifacts.js';
import {
  RECIPIENT_V2_PACKAGE_V1_ROOT_PATH,
  RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID,
  RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET,
  buildRecipientFacingV2PackageV1,
  buildRecipientFacingV2PackageV1Secure,
  inspectRecipientV2PackageV1SealedBinding,
  openRecipientV2PackageV1SealedWorkspace,
  replaceRecipientV2PackageV1SealedWorkspaceRecipients
} from '../src/tooling/portable/handoff/recipientV2.packageV1.js';
import { validatePackageFields } from '../src/tooling/portable/handoff/recipientV2.packageV1.contract.js';
import { recipientV2ParentAuthority } from '../src/tooling/portable/handoff/recipientV2.topology.workspaces.js';
import { renderTransportEnvelopeV1, qualifyTransportEnvelopeV1Artifact } from '../src/tooling/portable/handoff/transportEnvelopeV1.js';
import { resolveHandoffWorkspaceEntry } from '../src/tooling/portable/handoff/workspaceByteProvider.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const WORKSPACE_INNER_PATH = '.topics/.workspaces/tiinex-core.workspace.md';
const ROUTE_PATH = '.topics/handoffs/return.trace.md';
const SECRET_PATH = '.topics/context/secret.trace.md';
const PASSWORD_ALPHA = 'correct horse battery staple';
const PASSWORD_BETA = 'alpha recipient independent password';
const WORKSPACE_BYTES = new Uint8Array(await readFile(new URL('../.topics/.workspaces/tiinex-core.workspace.md', import.meta.url)));

function jsonClone(value) { return JSON.parse(JSON.stringify(value)); }
function equalBytes(left, right) { assert.deepEqual([...packageFileByteView({ data: left })], [...packageFileByteView({ data: right })]); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function fileText(file) { return decoder.decode(packageFileBytes(file)); }
function objectKeysDeep(value, out = []) { if (!value || typeof value !== 'object' || ArrayBuffer.isView(value)) return out; for (const [key, child] of Object.entries(value)) { out.push(key); objectKeysDeep(child, out); } return out; }
function forbiddenCrypto(label = 'crypto') {
  const forbidden = () => { throw new Error(`unexpected-${label}-operation`); };
  return { subtle: new Proxy({}, { get: () => forbidden }), getRandomValues: forbidden };
}

function minimalBootstrapFiles() {
  const runtime = encoder.encode('export const bootstrap = true;\n');
  const entries = [{ path: 'runtime/tooling.mjs', bytes: runtime.byteLength, sha256: sha256Hex(runtime) }];
  const manifest = {
    schema: 'tiinex.portable.tooling-bootstrap.manifest.v1',
    delivery: 'embedded',
    entrypoint: 'runtime/tooling.mjs',
    runtime: { entries, representationSha256: sha256Hex(encoder.encode(stableJson(entries))) }
  };
  return [
    { path: 'tiinex.bootstrap/manifest.json', data: encoder.encode(JSON.stringify(manifest)) },
    { path: 'tiinex.bootstrap/runtime/tooling.mjs', data: runtime }
  ];
}

function securePackageFixtureSource() {
  const routeMarkdown = qualifiedHandoffFixture({
    requiredContext: `- Secret Context\n  - Material: sealed workspace material\n  - Purpose: verify locked Required Context\n  - Availability: unavailable\n  - Material Reference: [Secret](sealed::${SECRET_PATH})`
  });
  const routeBytes = encoder.encode(routeMarkdown);
  const secretBytes = encoder.encode('# secret-name-do-not-leak\nclassified fixture bytes\n');
  const coreZip = exportFileMapZipUint8Array([
    { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES },
    { path: ROUTE_PATH, data: routeBytes }
  ]);
  const sealedZip = exportFileMapZipUint8Array([
    { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES },
    { path: SECRET_PATH, data: secretBytes }
  ]);
  const sourceSurface = {
    status: 'ready',
    topology: { workspaces: [
      { workspaceId: 'core', coverage: 'complete', archivePath: 'source-core.zip', sourceWorkspaceTargetInnerPath: WORKSPACE_INNER_PATH },
      { workspaceId: 'sealed', coverage: 'complete', archivePath: 'source-sealed.zip', sourceWorkspaceTargetInnerPath: WORKSPACE_INNER_PATH }
    ] },
    files: [
      { path: 'source-core.zip', data: coreZip },
      { path: 'source-sealed.zip', data: sealedZip }
    ]
  };
  const descriptor = {
    workspaceArchiveBindings: [{ workspaceId: 'core', entryMap: { entries: [{ path: ROUTE_PATH, bytes: routeBytes.byteLength, sha256: sha256Hex(routeBytes) }] } }],
    materialized: [],
    requirements: { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [] }
  };
  const route = {
    state: 'qualified',
    id: `handoff-route:core:${ROUTE_PATH}`,
    workspaceId: 'core',
    workspaceRelativePath: ROUTE_PATH,
    sha256: sha256Hex(routeBytes),
    parties: { from: 'Anchor', to: 'Loom' },
    materialRequirements: { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [] },
    requiredClosure: { requirements: [] }
  };
  return {
    sourceSurface,
    descriptor,
    carrierProjection: { lineage: { dimension: '001', checkpointKind: 'progression' }, routes: [route] },
    bundle: { files: minimalBootstrapFiles() },
    createdAt: '2026-09-10 04:00:00',
    secretBytes,
    sealedZip
  };
}

async function buildSecureFixture() {
  const fixture = securePackageFixtureSource();
  const result = await buildRecipientFacingV2PackageV1Secure({
    ...fixture,
    sealedWorkspaces: [{ workspaceId: 'sealed', recipients: [
      { slotId: 'alpha', password: PASSWORD_ALPHA, recipientHint: 'alpha' },
      { slotId: 'beta', password: PASSWORD_BETA, recipientHint: 'beta' }
    ] }]
  });
  assert.equal(result.status, 'ready', JSON.stringify(result.findings || []));
  assert.equal(result.inspection.status, 'valid', JSON.stringify(result.inspection.findings || []));
  return { fixture, result, bundle: { files: result.files } };
}

function asciiReplaceAll(bytesInput, from, to) {
  assert.equal(from.length, to.length);
  const bytes = new Uint8Array(packageFileByteView({ data: bytesInput }));
  const needle = encoder.encode(from);
  const replacement = encoder.encode(to);
  let replacements = 0;
  for (let i = 0; i <= bytes.length - needle.length; i += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) if (bytes[i + j] !== needle[j]) { match = false; break; }
    if (!match) continue;
    bytes.set(replacement, i);
    i += needle.length - 1;
    replacements += 1;
  }
  assert.ok(replacements >= 2, `expected local+central ZIP filename replacement, got ${replacements}`);
  return bytes;
}

async function replaceSealedPlaintext(bundle, plaintext, password = PASSWORD_ALPHA) {
  const locked = inspectRecipientV2PackageV1SealedBinding(bundle, 'sealed');
  assert.equal(locked.state, 'locked-qualified');
  const target = locked.binding;
  const sealed = await sealPasswordWorkspacePayload({
    plaintext,
    workspaceBindingValue: target.workspaceArtifactSha256,
    recipients: [{ slotId: 'alpha', password }]
  });
  assert.equal(sealed.state, 'sealed');
  const files = [...bundle.files];
  const root = files.find((file) => file.path === RECIPIENT_V2_PACKAGE_V1_ROOT_PATH);
  const parent = recipientV2ParentAuthority(root, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET, '2026-09-10 04:00:00');
  const protectedFile = finalizeFile({ path: target.protectedPayloadPath, mediaType: 'application/octet-stream', data: sealed.protectedPayload });
  const payloadArtifact = finalizeFile({
    path: target.protectedPayloadDescriptorPath,
    mediaType: 'text/markdown',
    content: renderRecipientV2ExternalPayload({
      createdAt: '2026-09-10 04:00:00', parent,
      title: 'Protected Workspace Payload — sealed', summary: 'Adversarial test payload.', label: 'sealed protected Workspace payload',
      kind: 'password-sealed-workspace-ciphertext', mediaType: 'application/octet-stream', format: sealed.envelope.profile.contentEncryptionParameters.binaryFraming,
      role: 'password-sealed Workspace protected payload', workspaceId: 'sealed', location: target.protectedPayloadPath, bytes: protectedFile.bytes, sha256: protectedFile.sha256
    })
  });
  const envelopeArtifact = finalizeFile({
    path: target.transportEnvelopePath,
    mediaType: 'text/markdown',
    content: renderTransportEnvelopeV1({ createdAt: '2026-09-10 04:00:00', parent, workspaceArtifactPath: target.workspaceArtifactPath, protectedPayloadDescriptorPath: target.protectedPayloadDescriptorPath, envelope: sealed.envelope })
  });
  const replacements = new Map([[protectedFile.path, protectedFile], [payloadArtifact.path, payloadArtifact], [envelopeArtifact.path, envelopeArtifact]]);
  return { files: files.map((file) => replacements.get(file.path) || file) };
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

test('sealed Handoff Package bindings reject mixed clear fields and clear package manufacture remains backward compatible', () => {
  const findings = [];
  validatePackageFields({
    packageRole: 'recipient-facing-handoff-carrier', carrierKind: 'self-contained', startPath: 'start.md', bootstrapPath: 'bootstrap.md', bootstrapRule: 'start-then-qualified-bootstrap',
    workspaces: [{
      workspaceId: 'sealed', workspaceArtifactPath: 'sealed.workspace.md', snapshotKind: 'password-sealed-workspace-byte-tree', coverage: 'complete', bindingState: 'sealed',
      protectedPayloadDescriptorPath: 'payload.trace.md', transportEnvelopePath: 'envelope.trace.md', protectionState: 'password-sealed', postOpenCorrelationRule: 'unique-exact-workspace-artifact-byte-match',
      snapshotPath: 'forbidden.zip'
    }],
    routePlacementRule: 'authoritative-workspace-descended', continueFromRule: 'exact-package-local-handoff-pointer', preHandoffClosureRule: 'selected-pointer-carrier-ancestors',
    carrierDimension: '001', carrierCheckpoint: 'progression', receiverQualification: 'reverify-carried-authority-and-bytes', failurePolicy: 'fail-closed', derivedInventoryAuthority: 'none'
  }, findings);
  assert.ok(findings.some((item) => item.code === 'portable.handoff-package-v1.workspace-binding-sealed-clear-fields-forbidden'));

  const fixture = securePackageFixtureSource();
  const clear = buildRecipientFacingV2PackageV1(fixture);
  assert.equal(clear.status, 'ready', JSON.stringify(clear.findings || []));
  assert.equal(clear.inspection.status, 'valid');
  assert.equal(clear.inspection.sealedWorkspaces.length, 0);
  assert.equal(clear.inspection.workspaces.length, 2);
  assert.ok(clear.inspection.workspaces.every((workspace) => workspace.bindingState === 'verified'));
});

test('secure Handoff package keeps sealed Workspace provider inactive until authenticated open and ordinary Workspace qualification succeeds', async () => {
  const { result, bundle, fixture } = await buildSecureFixture();
  const locked = inspectRecipientV2PackageV1SealedBinding(bundle, 'sealed');
  assert.equal(locked.state, 'locked-qualified');
  assert.equal(locked.providerActive, false);
  assert.deepEqual(result.inspection.workspaceByteProvider.workspaces.map((workspace) => workspace.id), ['core']);
  assert.equal(result.inspection.sealedWorkspaces.length, 1);
  assert.equal(result.inspection.carrierProjection.routes[0].state, 'qualified');
  assert.equal(result.inspection.carrierProjection.routes[0].requiredClosure.state, 'blocked');

  const binding = locked.binding;
  const rootMarkdown = fileText(result.files.find((file) => file.path === RECIPIENT_V2_PACKAGE_V1_ROOT_PATH));
  const descriptorMarkdown = fileText(result.files.find((file) => file.path === binding.protectedPayloadDescriptorPath));
  const envelopeMarkdown = fileText(result.files.find((file) => file.path === binding.transportEnvelopePath));
  for (const markdown of [descriptorMarkdown, envelopeMarkdown]) {
    assert.ok(!markdown.includes(WORKSPACE_INNER_PATH));
    assert.ok(!markdown.includes(SECRET_PATH));
    assert.ok(!markdown.includes('classified fixture bytes'));
  }
  const parsedSealedBinding = result.inspection.packageContract.workspaces.find((workspace) => workspace.workspaceId === 'sealed');
  assert.equal(parsedSealedBinding.workspaceArtifactInnerPath, undefined);
  assert.equal(parsedSealedBinding.snapshotPath, undefined);
  assert.equal(parsedSealedBinding.integrityMethod, undefined);
  assert.equal(parsedSealedBinding.integrityValue, undefined);
  assert.ok(!rootMarkdown.includes('classified fixture bytes'));
  assert.ok(result.files.every((file) => !String(file.path).includes('context') && !String(file.path).includes('secret-name-do-not-leak')));
  assert.ok(!result.files.some((file) => file.path === '001-4-sealed.workspace.zip'));

  const wrong = await openRecipientV2PackageV1SealedWorkspace(bundle, { workspaceId: 'sealed', password: 'wrong' });
  assert.equal(wrong.state, 'locked');
  const opened = await openRecipientV2PackageV1SealedWorkspace(bundle, { workspaceId: 'sealed', password: PASSWORD_BETA, slotId: 'beta' });
  assert.equal(opened.state, 'opened-qualified');
  assert.equal(opened.provider.status, 'ready');
  assert.equal(opened.workspaceArtifactInnerPath, WORKSPACE_INNER_PATH);
  assert.equal(opened.archiveSha256, sha256Hex(fixture.sealedZip));
  const secret = resolveHandoffWorkspaceEntry(opened.provider, 'sealed', SECRET_PATH);
  assert.equal(secret.state, 'qualified');
  equalBytes(secret.data, fixture.secretBytes);

  const rewrapped = await replaceRecipientV2PackageV1SealedWorkspaceRecipients(bundle, {
    workspaceId: 'sealed', authorizationPassword: PASSWORD_ALPHA, recipients: [{ slotId: 'replacement', password: 'new package recipient' }]
  });
  assert.equal(rewrapped.state, 'rewrapped');
  assert.equal(rewrapped.protectedPayloadSha256, binding.protectedPayloadSha256);
  equalBytes(rewrapped.protectedPayload, result.files.find((file) => file.path === binding.protectedPayloadPath).data);
});

test('package open fails closed on unsafe recovered ZIP paths and on zero or multiple exact Workspace-artifact correlations', async () => {
  const { bundle } = await buildSecureFixture();

  const unsafeSafePath = 'ok/secret.txt';
  const unsafePath = '../secret.txt';
  const safeZip = exportFileMapZipUint8Array([
    { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES },
    { path: unsafeSafePath, data: encoder.encode('unsafe path payload') }
  ]);
  const unsafeZip = asciiReplaceAll(safeZip, unsafeSafePath, unsafePath);
  const unsafeBundle = await replaceSealedPlaintext(bundle, unsafeZip);
  const unsafe = await openRecipientV2PackageV1SealedWorkspace(unsafeBundle, { workspaceId: 'sealed', password: PASSWORD_ALPHA });
  assert.equal(unsafe.state, 'failed');
  assert.equal(unsafe.reason, 'recovered-archive-unqualified');

  const zeroZip = exportFileMapZipUint8Array([{ path: 'other/file.txt', data: encoder.encode('no visible Workspace artifact bytes here') }]);
  const zeroBundle = await replaceSealedPlaintext(bundle, zeroZip);
  const zero = await openRecipientV2PackageV1SealedWorkspace(zeroBundle, { workspaceId: 'sealed', password: PASSWORD_ALPHA });
  assert.equal(zero.state, 'failed');
  assert.equal(zero.reason, 'workspace-artifact-correlation-unresolved');
  assert.equal(zero.matchCount, 0);

  const duplicateZip = exportFileMapZipUint8Array([
    { path: WORKSPACE_INNER_PATH, data: WORKSPACE_BYTES },
    { path: 'duplicate.workspace.md', data: WORKSPACE_BYTES }
  ]);
  const duplicateBundle = await replaceSealedPlaintext(bundle, duplicateZip);
  const duplicate = await openRecipientV2PackageV1SealedWorkspace(duplicateBundle, { workspaceId: 'sealed', password: PASSWORD_ALPHA });
  assert.equal(duplicate.state, 'failed');
  assert.equal(duplicate.reason, 'workspace-artifact-correlation-ambiguous');
  assert.equal(duplicate.matchCount, 2);
});
