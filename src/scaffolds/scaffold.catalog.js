import { portableContentSourceEntries, decodePortableContentText } from '../tooling/portable/content/contentSource.records.js';
import { parseScaffoldArtifact } from './scaffold.parse.js';

export const PORTABLE_SCAFFOLD_CATALOG_SCHEMA_ID = 'tiinex.portable.scaffold-catalog.v1';

export function projectPortableScaffoldCatalog(input = {}) {
  const findings = [];
  const byHandle = new Map();
  for (const material of portableContentSourceEntries(input, '.scaffolds')) {
    if (!/\.md$/i.test(material.sourcePath) || /\.schema\.md$/i.test(material.sourcePath)) continue;
    const markdown = decodePortableContentText(material);
    if (!markdown) continue;
    let parsed;
    try { parsed = parseScaffoldArtifact(markdown); } catch { parsed = null; }
    if (!parsed || parsed.status !== 'qualified' || !parsed.identity?.handle) {
      findings.push(finding('warning', 'portable.scaffold-catalog.candidate-unqualified', 'A .scaffolds candidate is not a qualified Scaffold and was not activated in the catalog.', material));
      continue;
    }
    const handle = String(parsed.identity.handle).trim();
    const previous = byHandle.get(handle);
    const record = Object.freeze({
      id: handle,
      handle,
      name: String(parsed.identity.name || parsed.title || '').trim(),
      version: String(parsed.identity.version || '').trim(),
      kind: String(parsed.identity.kind || '').trim(),
      targetKind: String(parsed.target?.kind || '').trim(),
      extends: String(parsed.composition?.extends || '').trim(),
      sourceId: material.sourceId,
      sourcePackage: material.sourcePackage,
      artifactPath: material.sourcePath,
      surfaceRoot: material.surfaceRoot,
      sha256: material.sha256,
      parsed,
      readQualified: true
    });
    if (!previous) byHandle.set(handle, record);
    else if (previous.sha256 !== record.sha256) {
      findings.push(Object.freeze({ severity: 'error', code: 'portable.scaffold-catalog.handle-conflict', message: 'Two qualified Scaffold candidates claim the same handle with different exact bytes.', context: Object.freeze({ handle, firstSourceId: previous.sourceId, secondSourceId: record.sourceId, firstPath: previous.artifactPath, secondPath: record.artifactPath }) }));
    }
  }
  const scaffolds = [...byHandle.values()].sort((a, b) => a.handle.localeCompare(b.handle));
  const errors = findings.filter((item) => item.severity === 'error').length;
  return Object.freeze({
    schema: PORTABLE_SCAFFOLD_CATALOG_SCHEMA_ID,
    status: errors ? 'blocked' : 'ready',
    scaffolds: Object.freeze(scaffolds),
    findings: Object.freeze(findings),
    boundary: 'Catalog presence means only that an exact qualified Scaffold is available from a selected content source. It does not make the Scaffold applicable, bind a target, authorize composition/apply, or grant filesystem mutation authority.'
  });
}

function finding(severity, code, message, material = {}) {
  return Object.freeze({ severity, code, message, context: Object.freeze({ sourceId: material.sourceId || '', path: material.sourcePath || '' }) });
}
