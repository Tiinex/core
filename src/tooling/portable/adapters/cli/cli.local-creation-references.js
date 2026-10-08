import path from 'node:path';
import { lstat, realpath } from 'node:fs/promises';

/**
 * Check explicitly local references at the Node/workspace authoring boundary.
 * This does not prove the material, authenticate an external locator, or
 * redefine schema validation. It prevents a known missing local file from
 * passing the same preflight used for durable local creation.
 */
export async function qualifyLocalCreationReferences({ contract = {}, markdown = '', workspaceRoot = '', artifactRelativePath = '' } = {}) {
  const fields = [...(contract?.creation?.authoringAffordances || [])]
    .filter((item) => item?.localResolutionPolicy === 'must-exist-if-local')
    .map((item) => String(item.input || '').trim())
    .filter(Boolean);
  if (!fields.length) return Object.freeze({ state: 'qualified', findings: Object.freeze([]) });
  const findings = [];
  const root = path.resolve(workspaceRoot);
  const candidate = path.resolve(root, artifactRelativePath);
  const base = path.dirname(candidate);
  if (!inside(root, candidate)) {
    return Object.freeze({ state: 'blocked', findings: Object.freeze([{ code: 'creation.local-reference.artifact-outside-workspace', field: '', reference: artifactRelativePath }]) });
  }
  for (const field of fields) {
    const rows = String(markdown).split(/\r?\n/).filter((line) => {
      const match = line.match(/^\s*-\s+([^:]+):\s*(.*)$/u);
      return match && match[1].trim() === field;
    });
    for (const row of rows) {
      const value = row.replace(/^\s*-\s+[^:]+:\s*/u, '').trim();
      for (const reference of localTargets(value)) {
        let relative;
        try { relative = decodeURIComponent(reference.split(/[?#]/u, 1)[0]); }
        catch { findings.push({ code: 'creation.local-reference.encoding-invalid', field, reference }); continue; }
        if (!relative || relative.includes('\0') || path.isAbsolute(relative) || /^[A-Za-z]:[\\/]/u.test(relative)) {
          findings.push({ code: 'creation.local-reference.path-invalid', field, reference });
          continue;
        }
        const target = path.resolve(base, relative);
        if (!inside(root, target)) {
          findings.push({ code: 'creation.local-reference.outside-workspace', field, reference });
          continue;
        }
        try {
          const stat = await lstat(target);
          if (!stat.isFile()) { findings.push({ code: 'creation.local-reference.not-file', field, reference }); continue; }
          const resolved = await realpath(target);
          if (!inside(root, resolved)) findings.push({ code: 'creation.local-reference.outside-workspace', field, reference });
        } catch {
          findings.push({ code: 'creation.local-reference.missing', field, reference });
        }
      }
    }
  }
  return Object.freeze({ state: findings.length ? 'blocked' : 'qualified', findings: Object.freeze(findings.map((item) => Object.freeze(item))) });
}

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function localTargets(value) {
  // Markdown link targets, including multiple links in an Evidence Material
  // scalar. Legacy `(label)(target)` references are recognized for fail-closed
  // local checking, though Markdown links are the recommended representation.
  const targets = [];
  const matched = [];
  const link = /(?:\[[^\]\r\n]+\]|\([^()\r\n]+\))\(([^()\r\n]+)\)/gu;
  for (const match of value.matchAll(link)) {
    matched.push([match.index, match.index + match[0].length]);
    if (isLocalTarget(match[1])) targets.push(match[1]);
  }
  const remainder = [...value].map((c, index) => matched.some(([start, end]) => index >= start && index < end) ? ' ' : c).join('');
  for (const part of remainder.split(/[;,]/u)) {
    const token = part.trim();
    if (isLocalTarget(token)) targets.push(token);
  }
  return targets;
}

function isLocalTarget(value) {
  const text = String(value || '').trim();
  if (!text || /\s/u.test(text) || text.startsWith('#')) return false;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/u.test(text) && !/^[A-Za-z]:[\\/]/u.test(text)) return false;
  if (text.includes('::') || text.startsWith('//')) return false;
  return /[\\/]/u.test(text) || /\.(?:trace\.md|md|gif|png|jpe?g|webp|mp4|pdf|json|txt|zip)(?:[?#].*)?$/iu.test(text);
}
