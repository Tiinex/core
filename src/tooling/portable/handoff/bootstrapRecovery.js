import { packageFileBytes } from '../../../export/package.bytes.js';

const BOOTSTRAP_CODE_PREFIXES = Object.freeze([
  'portable.handoff-package-v1.bootstrap-',
  'portable.handoff-v2-surface.bootstrap.',
  'portable.tooling-bootstrap.'
]);

export function projectPortableBootstrapRecovery(bundle = {}, inspection = {}) {
  const findings = Array.isArray(inspection.findings) ? inspection.findings : [];
  const errors = findings.filter((item) => String(item?.severity || '') === 'error');
  const bootstrapPaths = recoveryBootstrapArtifactPaths(bundle, inspection);
  const packageBootstrapValid = String(inspection.bootstrapInspection?.status || '') === 'valid';
  if (packageBootstrapValid) return freeze({
    schema: 'tiinex.portable.bootstrap-recovery.v1',
    state: 'not-needed',
    eligibleWithQualifiedHostBootstrap: false,
    packageBootstrap: Object.freeze({ state: 'qualified', artifactPath: bootstrapPaths[0] || '' }),
    ignoredFindingCodes: Object.freeze([]),
    blockingFindingCodes: Object.freeze([]),
    boundary: boundary()
  });

  const bootstrapArtifacts = bootstrapPaths.map((artifactPath) => Object.freeze({ artifactPath, file: findFile(bundle, artifactPath) })).filter((item) => item.artifactPath);
  const payloadPaths = [...new Set(bootstrapArtifacts.flatMap((item) => {
    if (!item.file) return [];
    const markdown = decodeUtf8(packageFileBytes(item.file));
    const target = recoveryPayloadPath(markdown);
    return target ? [target] : [];
  }))];
  const bootstrapOwnedPaths = new Set([...bootstrapPaths, ...payloadPaths].filter(Boolean));
  const ignored = [];
  const blocking = [];
  for (const item of errors) {
    const code = String(item?.code || '');
    const findingPath = String(item?.path || item?.packagePath || '').trim();
    const bootstrapScoped = BOOTSTRAP_CODE_PREFIXES.some((prefix) => code.startsWith(prefix)) || (findingPath && bootstrapOwnedPaths.has(findingPath));
    (bootstrapScoped ? ignored : blocking).push(item);
  }

  const packageStructurePresent = Boolean(inspection.rootArtifact && inspection.readArtifact && inspection.carrierProjection);
  const carrierReady = String(inspection.carrierProjection?.status || '') === 'ready';
  const eligible = packageStructurePresent && carrierReady && ignored.length > 0 && blocking.length === 0;
  const primaryPath = bootstrapPaths.find((artifactPath) => Boolean(findFile(bundle, artifactPath))) || bootstrapPaths[0] || '';
  return freeze({
    schema: 'tiinex.portable.bootstrap-recovery.v1',
    state: eligible ? 'eligible' : 'ineligible',
    eligibleWithQualifiedHostBootstrap: eligible,
    packageBootstrap: Object.freeze({
      state: primaryPath ? (findFile(bundle, primaryPath) ? 'unqualified' : 'missing') : 'undeclared',
      artifactPath: primaryPath,
      artifactCandidates: Object.freeze([...bootstrapPaths]),
      payloadPath: payloadPaths[0] || '',
      payloadCandidates: Object.freeze([...payloadPaths])
    }),
    ignoredFindingCodes: Object.freeze(ignored.map((item) => String(item?.code || '')).filter(Boolean)),
    blockingFindingCodes: Object.freeze(blocking.map((item) => String(item?.code || '')).filter(Boolean)),
    boundary: boundary()
  });
}

function recoveryBootstrapArtifactPaths(bundle = {}, inspection = {}) {
  const out = [];
  const declared = String(inspection.packageContract?.bootstrapPath || '').trim();
  if (declared) out.push(declared);

  // Recovery may need to operate precisely when the bootstrap External Payload
  // no longer qualifies strongly enough to reach normal package-contract
  // projection. Use only explicit package-local bootstrap references from the
  // already-identified package root/Start artifacts as recovery hints. These
  // hints bound malformed bootstrap bytes; they do not grant bootstrap authority.
  const candidates = [inspection.rootArtifact?.path, inspection.readArtifact?.path]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  for (const artifactPath of candidates) {
    const file = findFile(bundle, artifactPath);
    if (!file) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    for (const target of explicitBootstrapMarkdownTargets(markdown)) out.push(target);
  }
  return Object.freeze([...new Set(out.filter(Boolean))]);
}

function explicitBootstrapMarkdownTargets(markdown = '') {
  const out = [];
  for (const line of String(markdown || '').split(/\r?\n/)) {
    if (!/bootstrap/i.test(line)) continue;
    for (const match of line.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/ig)) if (match?.[1]) out.push(match[1].trim());
  }
  return [...new Set(out.filter(Boolean))];
}

function recoveryPayloadPath(markdown = '') {
  const lines = String(markdown || '').split(/\r?\n/);
  for (const line of lines) {
    if (!/(?:payload|location)/i.test(line)) continue;
    const link = line.match(/\[[^\]]+\]\(([^)]+\.zip)\)/i);
    if (link?.[1]) return link[1].trim();
    const field = line.match(/(?:Payload Path|Payload|Location|Bootstrap Payload)\s*:\s*`?([^`\s]+\.zip)`?/i);
    if (field?.[1]) return field[1].trim();
  }
  return '';
}

function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function boundary() { return 'Host-bootstrap recovery is a read-only execution fallback only. It does not rewrite package bytes, qualify a broken package bootstrap, erase original findings, or create Handoff/Workspace/semantic authority.'; }
function freeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; for (const child of Object.values(value)) freeze(child); return Object.freeze(value); }
