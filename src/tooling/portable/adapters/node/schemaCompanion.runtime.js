import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { portableContentSourceEntries } from '../../content/contentSource.records.js';

export const PORTABLE_SCHEMA_COMPANION_RUNTIME_SCHEMA_ID = 'tiinex.portable.schema-companion-runtime.v1';

const IMPORT_RE = /((?:\bimport\s+(?:[^'";]+?\s+from\s+)?|\bexport\s+(?:\*|\{[^}]*\})\s+from\s+|\bimport\s*\()\s*)(['"])([^'"]+)\2/g;

export async function loadPortableSchemaCompanionModules(input = {}) {
  const trusted = new Set([...(input.trustedExecutableSourceIds || input.executableSourceIds || [])].map((item) => String(item || '').trim()).filter(Boolean));
  if (input.autoTrustDeclaredSchemaCompanions !== false) {
    for (const source of Array.isArray(input.contentSources) ? input.contentSources : Array.isArray(input.sources) ? input.sources : []) {
      if (source?.source?.capabilities?.executableSchemaCompanions === true) trusted.add(String(source?.source?.id || '').trim());
    }
    trusted.delete('');
  }
  const coreRoot = path.resolve(String(input.coreRoot || input.runtimeRoot || process.cwd()));
  const materials = portableContentSourceEntries(input, '.schemas').filter((item) => trusted.has(String(item.sourceId || '')));
  const findings = [];
  const selected = new Map();

  for (const material of materials) {
    const logicalPath = logicalPathWithinSurface(material);
    if (!logicalPath || !/\.(?:js|json)$/i.test(logicalPath)) continue;
    const existing = selected.get(logicalPath);
    if (existing && existing.sha256 !== material.sha256) {
      findings.push(finding('error', 'portable.schema-companion.logical-path.ambiguous', 'Trusted executable .schemas sources provide different bytes for the same logical companion path.', material, { logicalPath, existingSourceId: existing.sourceId }));
      continue;
    }
    if (!existing) selected.set(logicalPath, Object.freeze({ ...material, logicalPath }));
  }

  if (!selected.size) return Object.freeze({
    schema: PORTABLE_SCHEMA_COMPANION_RUNTIME_SCHEMA_ID,
    status: trusted.size ? 'no-executable-companions' : 'not-authorized',
    modules: Object.freeze([]), findings: Object.freeze(findings), cacheRoot: '',
    boundary: 'Executable schema companions are never inferred from .schemas membership alone. Explicit trusted source selection is required.'
  });

  const errors = findings.filter((item) => item.severity === 'error').length;
  if (errors) return Object.freeze({ schema: PORTABLE_SCHEMA_COMPANION_RUNTIME_SCHEMA_ID, status: 'blocked', modules: Object.freeze([]), findings: Object.freeze(findings), cacheRoot: '', boundary: 'Ambiguous executable companion composition is blocked.' });

  const cacheRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-schema-companions-'));
  const logicalSet = new Set(selected.keys());
  for (const material of [...selected.values()].sort((a, b) => a.logicalPath.localeCompare(b.logicalPath))) {
    const target = path.join(cacheRoot, ...material.logicalPath.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    if (/\.js$/i.test(material.logicalPath)) {
      const raw = new TextDecoder('utf-8', { fatal: true }).decode(material.data);
      const rewritten = rewriteCompanionImports(raw, { logicalPath: material.logicalPath, logicalSet, cacheRoot, coreRoot });
      await writeFile(target, rewritten, 'utf8');
    } else {
      await writeFile(target, material.data);
    }
  }

  const modules = [];
  const entryPaths = [...selected.keys()].filter((logicalPath) => /(?:^|\/)tiinex\.[^/]+(?:\.[^/]+)*\.schema\.js$/i.test(logicalPath)).sort();
  for (const logicalPath of entryPaths) {
    const target = path.join(cacheRoot, ...logicalPath.split('/'));
    let imported;
    try { imported = await import(`${pathToFileURL(target).href}?tiinex=${encodeURIComponent(path.basename(cacheRoot))}`); }
    catch (error) {
      findings.push(finding('error', 'portable.schema-companion.module.import-failed', 'A trusted schema companion module could not be loaded into the composed runtime.', selected.get(logicalPath), { logicalPath, error: String(error?.message || error) }));
      continue;
    }
    const candidates = Object.values(imported || {}).filter((value) => value && typeof value === 'object' && String(value?.id || '').startsWith('tiinex.') && value?.binding);
    if (candidates.length !== 1) {
      findings.push(finding('error', 'portable.schema-companion.module.export-ambiguous', 'A schema companion entry module must expose exactly one schema module object.', selected.get(logicalPath), { logicalPath, candidateCount: candidates.length }));
      continue;
    }
    modules.push(candidates[0]);
  }

  const finalErrors = findings.filter((item) => item.severity === 'error').length;
  return Object.freeze({
    schema: PORTABLE_SCHEMA_COMPANION_RUNTIME_SCHEMA_ID,
    status: finalErrors ? 'blocked' : 'ready',
    modules: Object.freeze(modules),
    findings: Object.freeze(findings),
    cacheRoot,
    trustedExecutableSourceIds: Object.freeze([...trusted].sort()),
    companionFiles: selected.size,
    schemaModules: modules.length,
    boundary: 'Trusted executable schema companions are projected into a process-local runtime cache. Native/content bytes remain authority; the cache is disposable generated execution material and creates no Core→content-package runtime dependency.'
  });
}

function rewriteCompanionImports(text, { logicalPath, logicalSet, cacheRoot, coreRoot }) {
  const virtualSource = path.resolve(coreRoot, 'src', 'schemas', ...logicalPath.split('/'));
  return String(text).replace(IMPORT_RE, (match, prefix, quote, specifier) => {
    if (!String(specifier || '').startsWith('.')) return match;
    const virtualTarget = path.resolve(path.dirname(virtualSource), specifier);
    const schemaRoot = path.resolve(coreRoot, 'src', 'schemas');
    let target;
    if (inside(schemaRoot, virtualTarget)) {
      const relativeSchemaTarget = normalizeRelativePath(path.relative(schemaRoot, virtualTarget));
      target = logicalSet.has(relativeSchemaTarget)
        ? path.join(cacheRoot, ...relativeSchemaTarget.split('/'))
        : virtualTarget;
    } else {
      target = virtualTarget;
    }
    return `${prefix}${quote}${pathToFileURL(target).href}${quote}`;
  });
}

function logicalPathWithinSurface(material = {}) {
  const sourcePath = normalizeRelativePath(material.sourcePath || '');
  const surfaceRoot = normalizeRelativePath(material.surfaceRoot || '');
  if (!surfaceRoot || sourcePath === surfaceRoot || !sourcePath.startsWith(`${surfaceRoot}/`)) return '';
  return sourcePath.slice(surfaceRoot.length + 1);
}
function inside(root, target) { const rel = path.relative(root, target); return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)); }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function finding(severity, code, message, material = {}, extra = {}) { return Object.freeze({ severity, code, message, context: Object.freeze({ sourceId: material?.sourceId || '', path: material?.sourcePath || '', ...extra }) }); }
