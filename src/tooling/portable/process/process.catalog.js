import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { decodePortableContentText, portableContentSourceEntries } from '../content/contentSource.records.js';

export const PORTABLE_PROCESS_CATALOG_SCHEMA_ID = 'tiinex.portable.process-catalog.v1';

export function projectPortableProcessCatalog(input = {}) {
  const findings = [];
  const processes = [];
  for (const material of portableContentSourceEntries(input, '.processes')) {
    if (!/\.md$/i.test(material.sourcePath) || /\.schema\.md$/i.test(material.sourcePath)) continue;
    const markdown = decodePortableContentText(material);
    if (!markdown) {
      findings.push(finding('warning', 'portable.process-catalog.utf8-unreadable', 'A .processes candidate could not be decoded as UTF-8 Tiinex material.', material));
      continue;
    }
    let artifact;
    try { artifact = parseArtifactMarkdown(markdown); } catch {
      findings.push(finding('warning', 'portable.process-catalog.artifact-unreadable', 'A .processes candidate is not readable as a Tiinex artifact.', material));
      continue;
    }
    const integrity = canonicalC14nV2SelfState(markdown);
    const schemaId = String(artifact?.envelope?.current?.schema?.id || '').trim();
    const qualified = Boolean(artifact?.hasContinuityContext && schemaId && integrity.state === 'verified');
    if (!qualified) {
      findings.push(finding('warning', 'portable.process-catalog.candidate-unqualified', 'A .processes candidate was preserved but is not read-qualified as reusable Tiinex guidance.', material, { schemaId, integrity: integrity.state }));
      continue;
    }
    processes.push(Object.freeze({
      id: `${material.sourceId}::${material.sourcePath}`,
      sourceId: material.sourceId,
      sourceKind: material.sourceKind,
      sourcePackage: material.sourcePackage,
      artifactPath: material.sourcePath,
      surfaceRoot: material.surfaceRoot,
      schemaId,
      title: String(artifact.title || '').trim(),
      summary: String(artifact?.envelope?.current?.summary || '').trim(),
      status: String(artifact?.envelope?.current?.status || '').trim(),
      sha256: material.sha256,
      readQualified: true
    }));
  }
  processes.sort((a, b) => a.title.localeCompare(b.title) || a.sourceId.localeCompare(b.sourceId) || a.artifactPath.localeCompare(b.artifactPath));
  return Object.freeze({
    schema: PORTABLE_PROCESS_CATALOG_SCHEMA_ID,
    status: 'ready',
    processes: Object.freeze(processes),
    findings: Object.freeze(findings),
    boundary: 'Catalogs qualified Tiinex material intentionally offered through registered .processes discovery surfaces. Surface membership is distribution/discovery intent only: it does not create a Process schema type, applicability, current-work authority, Role authority, acceptance, or mutation authority.'
  });
}

function finding(severity, code, message, material = {}, extra = {}) {
  return Object.freeze({ severity, code, message, context: Object.freeze({ sourceId: material.sourceId || '', path: material.sourcePath || '', ...extra }) });
}
