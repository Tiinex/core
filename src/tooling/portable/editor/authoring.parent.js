import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { classifyParentRecoveryReference } from '../../../lineage/parentRecoveryReference.js';
import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';

export const PORTABLE_AUTHORING_PARENT_SCHEMA_ID = 'tiinex.portable.authoring-parent.v1';

export function projectPortableAuthoringParent(input = {}) {
  const records = normalizeRecords(input);
  if (records.length !== 1) return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.exactly-one-required', message: 'Authoring Parent projection requires exactly one local text artifact.' }], operationBoundary: boundary() });
  const record = records[0];
  let parsed;
  try { parsed = parseArtifactMarkdown(record.markdown); }
  catch { return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.parse-failed', message: 'Selected Parent bytes are not a readable Tiinex artifact.' }], operationBoundary: boundary() }); }
  const audit = auditPortableRecord({ ...record, title: parsed.title, schemaId: parsed.envelope?.current?.schema?.id, currentSchemaId: parsed.envelope?.current?.schema?.id, parent: parsed.envelope?.parent });
  if (audit.status !== 'readable' || audit.qualification?.exact !== true || (audit.findings || []).some((item) => item.severity === 'error')) return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.unqualified', message: 'Selected Parent must pass exact shared audit before it can be used for native authoring.' }], operationBoundary: boundary() });
  const schemaId = String(parsed.envelope?.current?.schema?.id || audit.schemaId || '');
  const schemaTarget = String(parsed.envelope?.current?.schema?.target || '');
  const createdAt = String(parsed.envelope?.current?.createdAt || audit.artifact?.createdAt || '');
  const explicitReference = String(input.reference || '').trim();
  const projectedPath = explicitReference || String(record.path || record.id || '');
  const referenceClassification = classifyParentRecoveryReference(projectedPath);
  if (referenceClassification.kind === 'malformed-workspace-qualified') return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.reference.malformed', message: 'Selected Parent reference is malformed and cannot be used for native authoring.' }], operationBoundary: boundary() });
  const recoveryMode = referenceClassification.kind === 'workspace-qualified' ? 'workspace-qualified' : 'local-relative';
  const canonicalCurrent = buildArtifactCreationContract({ schemaId, transitionType: 'continue-from-record' })?.schemaReferences?.current || null;
  const canonicalTargets = new Set([...(canonicalCurrent?.exactTargets || []), String(canonicalCurrent?.preferredTarget || '')].filter(Boolean));
  const schemaReferenceQualified = Boolean(schemaTarget && canonicalCurrent?.resolutionState === 'qualified' && canonicalTargets.has(schemaTarget));
  const schemaReferenceAuthority = schemaReferenceQualified
    ? { ...canonicalCurrent, preferredTarget: schemaTarget, resolutionState: 'qualified', resolutionEvidence: { ...(canonicalCurrent?.resolutionEvidence || {}), basis: 'declared-parent-target-exact-canonical-match' } }
    : { schemaId, preferredTarget: schemaTarget, exactTargets: schemaTarget ? [schemaTarget] : [], resolutionState: 'unresolved', evidence: { basis: 'declared-current-schema-reference-only' } };
  return freeze({
    schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID,
    status: 'ready',
    parentRecord: {
      id: projectedPath, path: projectedPath, schemaId, currentSchemaId: schemaId, currentCreatedAt: createdAt, createdAt, recoveryMode, relativeReference: recoveryMode === 'workspace-qualified' ? projectedPath : '',
      markdown: record.markdown, sourceMode: String(record.sourceMode || 'portable-node-local'),
      schemaReferenceAuthority
    },
    findings: [],
    operationBoundary: boundary(),
    boundary: 'Projects exact supplied Parent bytes and declared current schema locator into shared draft-authoring input. A declared schema locator remains unresolved and is not upgraded to publication or canonical reference authority.'
  });
}

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function boundary() { return { sourceMutation: false, remoteWrite: false, authoring: false }; }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
