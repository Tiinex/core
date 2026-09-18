import { packageFileBytes } from '../../../export/package.bytes.js';

const BOOTSTRAP_CODE_PREFIXES = Object.freeze([
  'portable.handoff-package-v1.bootstrap-',
  'portable.handoff-v2-surface.bootstrap.',
  'portable.tooling-bootstrap.'
]);

export function projectPortableBootstrapRecovery(bundle = {}, inspection = {}) {
  const findings = Array.isArray(inspection.findings) ? inspection.findings : [];
  const errors = findings.filter((item) => String(item?.severity || '') === 'error');
  const bootstrapPath = String(inspection.packageContract?.bootstrapPath || '').trim();
  const packageBootstrapValid = String(inspection.bootstrapInspection?.status || '') === 'valid';
  if (packageBootstrapValid) return freeze({
    schema: 'tiinex.portable.bootstrap-recovery.v1',
    state: 'not-needed',
    eligibleWithQualifiedHostBootstrap: false,
    packageBootstrap: Object.freeze({ state: 'qualified', artifactPath: bootstrapPath }),
    ignoredFindingCodes: Object.freeze([]),
    blockingFindingCodes: Object.freeze([]),
    boundary: boundary()
  });

  const bootstrapArtifact = bootstrapPath ? findFile(bundle, bootstrapPath) : null;
  const bootstrapMarkdown = bootstrapArtifact ? decodeUtf8(packageFileBytes(bootstrapArtifact)) : '';
  const payloadPath = bootstrapMarkdown ? recoveryPayloadPath(bootstrapMarkdown) : '';
  const bootstrapOwnedPaths = new Set([bootstrapPath, payloadPath].filter(Boolean));
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
  return freeze({
    schema: 'tiinex.portable.bootstrap-recovery.v1',
    state: eligible ? 'eligible' : 'ineligible',
    eligibleWithQualifiedHostBootstrap: eligible,
    packageBootstrap: Object.freeze({
      state: bootstrapPath ? (bootstrapArtifact ? 'unqualified' : 'missing') : 'undeclared',
      artifactPath: bootstrapPath,
      payloadPath
    }),
    ignoredFindingCodes: Object.freeze(ignored.map((item) => String(item?.code || '')).filter(Boolean)),
    blockingFindingCodes: Object.freeze(blocking.map((item) => String(item?.code || '')).filter(Boolean)),
    boundary: boundary()
  });
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
