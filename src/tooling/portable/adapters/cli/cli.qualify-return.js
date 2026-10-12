import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { projectPortableCliOperation } from './cli.invocation.js';

const STATE_RELATIVE_PATH = '.tiinex/continuation.json';
const TRANSITION_RELATIVE_PATH = '.tiinex/return-transition.json';

export async function runQualifyReturnCli(parsed = {}, runtime = {}) {
  const flags = parsed.flags || {};
  const workspaceRoot = path.resolve(String(flags.workspace || parsed.positionals?.[0] || '.'));
  const state = await readJson(path.join(workspaceRoot, STATE_RELATIVE_PATH));
  if (String(state.schema || '') !== 'tiinex.portable.ground-continuation-state.v1') throw new Error('portable.cli.qualify-return.continuation-state.required');
  const selectedHandoffPath = normalizeWorkspaceRelativePath(state.selectedHandoffPath || '');
  if (!selectedHandoffPath) throw new Error('portable.cli.qualify-return.selected-handoff.required');

  const handoffMarkdown = await readFile(safeWorkspaceTarget(workspaceRoot, selectedHandoffPath), 'utf8');
  const completion = section(handoffMarkdown, 'Completion Expectation');
  const signalKind = field(completion, 'Signal Kind');
  const returnTo = field(completion, 'Return To');
  const returnToReference = referenceTarget(completion, 'Return To Reference');
  if (!signalKind || !returnTo) throw new Error('portable.cli.qualify-return.return-protocol.required');

  const resultRelativePath = normalizeWorkspaceRelativePath(flags.result || '');
  const expectedRelativePath = normalizeWorkspaceRelativePath(flags.expected || flags['expected-file'] || '');
  if (!resultRelativePath) throw new Error('portable.cli.qualify-return.result.required');
  if ((flags.expected || flags['expected-file']) && !expectedRelativePath) throw new Error('portable.cli.qualify-return.expected-file.path.invalid');
  if (expectedRelativePath && expectedRelativePath === resultRelativePath) throw new Error('portable.cli.qualify-return.expected-file.same-as-result');
  if (resultRelativePath.startsWith('.tiinex/') || expectedRelativePath.startsWith('.tiinex/')) throw new Error('portable.cli.qualify-return.runtime-only-path.forbidden');

  const resultBytes = await readFile(safeWorkspaceTarget(workspaceRoot, resultRelativePath));
  const expectedBytes = expectedRelativePath ? await readFile(safeWorkspaceTarget(workspaceRoot, expectedRelativePath)) : null;
  const resultSha256 = sha256Hex(resultBytes);
  const expectedSha256 = expectedBytes ? sha256Hex(expectedBytes) : '';
  if (expectedBytes && !resultBytes.equals(expectedBytes)) throw new Error('portable.cli.qualify-return.result-byte-verification.failed');

  const receipt = Object.freeze({
    schema: 'tiinex.portable.return-transition.v1',
    version: 1,
    state: 'qualified',
    selectedHandoffPath,
    selectedRouteId: String(state.selectedRouteId || ''),
    result: Object.freeze({ path: resultRelativePath, byteSize: resultBytes.byteLength, sha256: resultSha256 }),
    verification: Object.freeze(expectedBytes
      ? { kind: 'exact-byte-match', expectedPath: expectedRelativePath, expectedByteSize: expectedBytes.byteLength, expectedSha256 }
      : { kind: 'result-sha256', boundary: 'Result bytes captured and SHA-256/size pinned for later recheck. No independent expected result was supplied.' }),
    returnProtocol: Object.freeze({ signalKind, returnTo, returnToReference }),
    boundary: expectedBytes
      ? 'Qualifies only the bounded result byte-match against the explicitly supplied local expected file and the selected Handoff return protocol. It does not establish independent expected provenance, Task completion, Task closure, acceptance, semantic correctness, or remote mutation authority.'
      : 'Qualifies only the bounded result SHA-256 and size under the selected Handoff return protocol, with recheck before manufacture. No expected reference or semantic correctness is established. It does not establish Task completion, Task closure, acceptance, or remote mutation authority.'
  });
  const outputPath = safeWorkspaceTarget(workspaceRoot, TRANSITION_RELATIVE_PATH);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return Object.freeze({
    schema: 'tiinex.portable.qualify-return.result.v1',
    operation: 'qualify-return',
    status: 'qualified',
    transition: receipt,
    runtimeReceipt: Object.freeze({ path: outputPath, workspaceRelativePath: TRANSITION_RELATIVE_PATH, written: true, canonicalArtifact: false }),
    nextAction: projectPortableCliOperation(runtime, 'prepare-return', [workspaceRoot]),
    boundary: receipt.boundary
  });
}

export async function readQualifiedReturnTransition(workspaceRoot, state = {}) {
  const root = path.resolve(String(workspaceRoot || '.'));
  let receipt;
  try { receipt = await readJson(path.join(root, TRANSITION_RELATIVE_PATH)); }
  catch { throw new Error('portable.cli.prepare-return.return-transition.required'); }
  if (String(receipt.schema || '') !== 'tiinex.portable.return-transition.v1' || String(receipt.state || '') !== 'qualified') throw new Error('portable.cli.prepare-return.return-transition.unqualified');
  const selectedHandoffPath = normalizeWorkspaceRelativePath(state.selectedHandoffPath || '');
  if (!selectedHandoffPath || String(receipt.selectedHandoffPath || '') !== selectedHandoffPath) throw new Error('portable.cli.prepare-return.return-transition.handoff-mismatch');
  if (String(receipt.selectedRouteId || '') !== String(state.selectedRouteId || '')) throw new Error('portable.cli.prepare-return.return-transition.route-mismatch');
  const resultPath = normalizeWorkspaceRelativePath(receipt.result?.path || '');
  const verificationKind = String(receipt.verification?.kind || '');
  if (!['exact-byte-match', 'result-sha256'].includes(verificationKind)) throw new Error('portable.cli.prepare-return.return-transition.verification-unqualified');
  const expectedPath = normalizeWorkspaceRelativePath(receipt.verification?.expectedPath || '');
  if (!resultPath || (verificationKind === 'exact-byte-match' && !expectedPath) || (verificationKind === 'result-sha256' && expectedPath)) throw new Error('portable.cli.prepare-return.return-transition.material-missing');
  const resultBytes = await readFile(safeWorkspaceTarget(root, resultPath));
  const expectedBytes = verificationKind === 'exact-byte-match' ? await readFile(safeWorkspaceTarget(root, expectedPath)) : null;
  if (sha256Hex(resultBytes) !== String(receipt.result?.sha256 || '') || resultBytes.byteLength !== Number(receipt.result?.byteSize ?? -1)) throw new Error('portable.cli.prepare-return.return-transition.result-stale');
  if (expectedBytes) {
    if (sha256Hex(expectedBytes) !== String(receipt.verification?.expectedSha256 || '') || expectedBytes.byteLength !== Number(receipt.verification?.expectedByteSize ?? -1)) throw new Error('portable.cli.prepare-return.return-transition.expected-stale');
    if (!resultBytes.equals(expectedBytes)) throw new Error('portable.cli.prepare-return.return-transition.byte-match-stale');
  }
  return Object.freeze({ ...receipt, result: Object.freeze({ ...(receipt.result || {}) }), verification: Object.freeze({ ...(receipt.verification || {}) }), returnProtocol: Object.freeze({ ...(receipt.returnProtocol || {}) }) });
}

export function returnTransitionResultReference(resultPath = '', authoredDirectory = '') {
  const normalized = normalizeWorkspaceRelativePath(resultPath);
  const directory = normalizeWorkspaceRelativePath(authoredDirectory);
  if (!normalized || !directory) return '';
  return path.posix.relative(directory, normalized) || path.posix.basename(normalized);
}

async function readJson(filePath) { return JSON.parse(await readFile(filePath, 'utf8')); }
function sha256Hex(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function section(markdown = '', heading = '') { return new RegExp(`^##\\s+${escapeRe(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|^#\\s+Continuity Integrity|(?![\\s\\S]))`, 'mi').exec(String(markdown || ''))?.[1] || ''; }
function field(text = '', name = '') { const m = new RegExp(`^-\\s+${escapeRe(name)}:[ \\t]*([^\\r\\n]*)$`, 'mi').exec(String(text || '')); return m ? String(m[1] || '').trim() : ''; }
function referenceTarget(text = '', name = '') { const value = field(text, name); const m = /\]\(([^)]+)\)/.exec(value); return m ? String(m[1] || '').trim() : ''; }
function escapeRe(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function normalizeWorkspaceRelativePath(value = '') { const raw = String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, ''); if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw)) return ''; const parts = raw.split('/'); if (parts.some((part) => !part || part === '.' || part === '..')) return ''; return parts.join('/'); }
function safeWorkspaceTarget(root, relative) { const target = path.resolve(root, relative); const rel = path.relative(root, target); if (!relative || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error(`portable.cli.qualify-return.path.unsafe:${relative}`); return target; }
