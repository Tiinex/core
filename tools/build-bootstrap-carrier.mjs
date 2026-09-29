import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PREFIX = 'bootstrap-';
const SUFFIX = '.handoff-package.zip';

export function nextBootstrapCarrierFilename(names = []) {
  let highest = 0;
  for (const name of names || []) {
    const match = String(name || '').match(/^bootstrap-(\d+)\.handoff-package\.zip$/i);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isSafeInteger(value) && value > highest) highest = value;
  }
  const next = highest + 1;
  return `${PREFIX}${String(next).padStart(3, '0')}${SUFFIX}`;
}

export async function buildBootstrapCarrier({ outputDir = process.cwd() } = {}) {
  const targetDir = path.resolve(String(outputDir || process.cwd()));
  const filename = nextBootstrapCarrierFilename(await readdir(targetDir));
  const cli = path.join(ROOT, 'tools', 'tiinex-portable.mjs');
  const args = [
    cli,
    'manufacture-handoff-package',
    ROOT,
    '--carrier-mode', 'bootstrap',
    '--projected-filename', filename,
    '--output-dir', targetDir,
    '--compact'
  ];
  const result = await run(process.execPath, args, { cwd: ROOT });
  let receipt;
  try { receipt = JSON.parse(result.stdout); }
  catch { throw new Error(`tiinex.bootstrap-carrier.manufacture.invalid-json:${result.stdout.slice(0, 200)}`); }
  if (result.code !== 0 || String(receipt?.status || '') !== 'ready' || String(receipt?.primaryOutput?.status || '') !== 'written') {
    throw new Error(`tiinex.bootstrap-carrier.manufacture.failed:${result.code}:${String(receipt?.status || 'unknown')}:${result.stderr.trim()}`);
  }
  const outputPath = path.resolve(String(receipt.primaryOutput.path || ''));
  if (path.dirname(outputPath) !== targetDir || path.basename(outputPath) !== filename) throw new Error('tiinex.bootstrap-carrier.output.identity-mismatch');
  const bytes = await readFile(outputPath);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  return Object.freeze({
    schema: 'tiinex.bootstrap-carrier-export.v1',
    status: 'ready',
    output: outputPath,
    filename,
    instance: Number(filename.slice(PREFIX.length, -SUFFIX.length)),
    bytes: bytes.byteLength,
    sha256,
    manufacture: Object.freeze({
      operation: String(receipt.operation || ''),
      packageInspection: String(receipt.verification?.packageInspection || ''),
      roundtrip: String(receipt.verification?.roundtrip || ''),
      bootstrapStatus: String(receipt.toolingBootstrap?.status || ''),
      findingSummary: receipt.findingSummary || null
    }),
    transportText: String(receipt.humanOutput?.normalInlineRouting?.content || ''),
    boundary: 'Convenience export only. Package bytes are manufactured by the canonical Package V1 manufacture-handoff-package bootstrap carrier path.'
  });
}

function parseArgs(values = []) {
  const out = { outputDir: process.cwd() };
  for (let i = 0; i < values.length; i += 1) {
    const value = String(values[i] || '');
    if (value === '--output-dir') { out.outputDir = String(values[++i] || ''); continue; }
    throw new Error(`tiinex.bootstrap-carrier.argument.unsupported:${value}`);
  }
  return out;
}

function run(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: Number(code ?? 1), stdout, stderr }));
  });
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  try {
    const result = await buildBootstrapCarrier(parseArgs(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
