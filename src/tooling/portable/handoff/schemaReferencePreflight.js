import { runAudit } from '../../../audit/audit.run.js';
import { summarizePortableFindings } from '../findings.js';

export const PORTABLE_HANDOFF_SCHEMA_REFERENCE_PREFLIGHT_SCHEMA_ID = 'tiinex.portable.handoff-schema-reference-preflight.v1';

export function qualifyPortableManufactureSchemaReferenceCandidate(record = {}) {
  const markdown = String(record.markdown || '');
  const path = String(record.path || record.id || '');
  const audit = runAudit({
    record: Object.freeze({ ...record, path, markdown }),
    markdown,
    schemaReferenceContext: 'candidate'
  });
  const findings = Object.freeze((audit.findings || []).filter((finding) => String(finding?.code || '').startsWith('schema.reference.')));
  const findingSummary = summarizePortableFindings(findings);
  const blocked = Number(findingSummary?.counts?.error || 0) > 0;
  return Object.freeze({
    schema: PORTABLE_HANDOFF_SCHEMA_REFERENCE_PREFLIGHT_SCHEMA_ID,
    state: blocked ? 'blocked' : 'qualified',
    status: blocked ? 'blocked' : findingSummary?.counts?.warning ? 'degraded' : 'ready',
    path,
    findings,
    findingSummary,
    boundary: 'Prospective manufacture gate for the actively selected local Handoff candidate only. Existing/historical carried Workspace artifacts remain preservation inputs and are not reclassified as new candidates by package carriage.'
  });
}
