// Explicit selection from qualified bootstrap content records; never search arbitrary local files.
export function readPortableSelectedContent({ contentSources = [], sourceId = '', sourcePath = '' } = {}) {
  const id = String(sourceId).trim();
  const selectedPath = String(sourcePath).trim();
  if (!id || !selectedPath) return Object.freeze({ status: 'blocked', reasonCode: 'source-and-path-required' });
  const matches = contentSources.filter((source) => source.status === 'ready' && source.source?.id === id);
  if (matches.length !== 1) return Object.freeze({ status: 'blocked', reasonCode: 'source-unavailable-or-ambiguous', sourceId: id });
  const records = (matches[0].entries || []).filter((record) => record.sourceId === id && record.sourcePath === selectedPath);
  if (records.length !== 1) return Object.freeze({ status: 'blocked', reasonCode: 'material-not-in-selected-source', sourceId: id, sourcePath: selectedPath });
  const record = records[0];
  let content;
  try { content = new TextDecoder('utf-8', { fatal: true }).decode(record.data); }
  catch { return Object.freeze({ status: 'blocked', reasonCode: 'material-not-utf8', sourceId: id, sourcePath: selectedPath }); }
  return Object.freeze({ status: 'ready', sourceId: id, sourcePath: selectedPath, surface: record.surface,
    sha256: record.sha256, bytes: record.bytes, content,
    boundary: 'Exact bytes from the selected locally qualified/bootstrap-manifest-verified content source; transport SHA-256 does not qualify schema, lineage, currency, applicability, Role, work authority, or acceptance.' });
}
