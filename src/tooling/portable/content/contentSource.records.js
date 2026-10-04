export function portableContentSourceEntries(input = {}, surface = '') {
  const sources = normalizeSources(input);
  const target = String(surface || '').trim();
  const out = [];
  for (const source of sources) {
    const sourceId = String(source?.source?.id || '').trim();
    for (const entry of source?.entries || []) {
      if (target && String(entry?.surface || '') !== target) continue;
      out.push(Object.freeze({
        sourceId,
        sourceKind: String(source?.source?.kind || ''),
        sourcePackage: Object.freeze({ ...(source?.source?.package || {}) }),
        sourceRepresentationSha256: String(source?.representationSha256 || ''),
        surface: String(entry?.surface || ''),
        surfaceRoot: String(entry?.surfaceRoot || ''),
        sourcePath: String(entry?.sourcePath || ''),
        bytes: Number(entry?.bytes || entry?.data?.byteLength || 0),
        sha256: String(entry?.sha256 || ''),
        data: entry?.data instanceof Uint8Array ? entry.data : new Uint8Array()
      }));
    }
  }
  return Object.freeze(out.sort((a, b) => a.sourceId.localeCompare(b.sourceId) || a.sourcePath.localeCompare(b.sourcePath)));
}

export function decodePortableContentText(entry = {}) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(entry?.data || new Uint8Array()); }
  catch { return ''; }
}

function normalizeSources(input = {}) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.contentSources)) return input.contentSources;
  if (Array.isArray(input.sources)) return input.sources;
  return [];
}
