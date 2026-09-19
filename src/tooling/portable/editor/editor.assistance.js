import { auditPortableRecord } from '../audit/audit.capability.js';
import { C14N_V2_METHOD_ID, canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { sha256Hex } from '../../../export/package.bytes.js';
import { integrityMethodReferenceAuthorityForCreation } from '../../../integrity/integrity.methodReference.js';
import { inspectPortableLineageIntegrity } from '../lineage/lineage.integrity.plan.js';
import { portableFinding } from '../findings.js';
import { qualifyTiinexRouteArtifact } from '../handoff/routeArtifactConformance.js';
import { classifyParentRecoveryReference } from '../../../lineage/parentRecoveryReference.js';

export const PORTABLE_EDITOR_ASSISTANCE_SCHEMA_ID = 'tiinex.portable.editor-assistance.v1';

export function projectPortableEditorAssistance(input = {}) {
  const records = normalizeRecords(input);
  const focusPath = norm(input.focusPath || input.focus || '');
  const selectedRecords = focusPath ? records.filter((record) => norm(record.path || record.id || '') === focusPath) : records;
  const lineageInspection = inspectPortableLineageIntegrity({ records });
  const documents = selectedRecords.map((record) => projectDocument(record, records, lineageInspection));
  const diagnostics = documents.flatMap((item) => item.diagnostics);
  return freeze({
    schema: PORTABLE_EDITOR_ASSISTANCE_SCHEMA_ID,
    status: diagnostics.some((item) => item.severity === 'error') ? 'invalid' : diagnostics.some((item) => item.severity === 'warning') ? 'degraded' : 'clean',
    documents,
    operationBoundary: { sourceMutation: false, remoteWrite: false, automaticRepair: false },
    boundary: 'Adapter-neutral projection of exact shared audit/validator findings plus only deterministic byte replacements. Presentation adapters must not invent finding severity, validator choice, source line, or repair content.'
  });
}

function projectDocument(record = {}, records = [], lineageInspection = null) {
  const audit = auditPortableRecord(record, { requireExactSchemaAuthority: true });
  const markdown = String(record.markdown || '');
  const recordPath = norm(record.path || record.id || '');
  const lineageFindings = findingsForPath(lineageInspection?.findings || [], recordPath);
  const workspaceConformance = String(audit.schemaId || '') === 'tiinex.workspace.v1'
    ? qualifyTiinexRouteArtifact({ markdown, expectedSchemaId: 'tiinex.workspace.v1', requireExactContract: true })
    : null;
  const packageQualifiedWorkspace = workspaceConformance?.status === 'qualified';
  const sharedFindings = [...(audit.findings || []), ...lineageFindings].filter((finding) => !(packageQualifiedWorkspace && String(finding?.code || '') === 'audit.schema-authority.unqualified'));
  const diagnostics = sharedFindings
    .filter((item) => item.severity === 'error' || item.severity === 'warning')
    .map((finding) => projectDiagnostic(finding, markdown));
  const actions = [];
  const workspacePackagingRepair = deterministicWorkspacePackagingRepair(record, audit, markdown);
  if (workspacePackagingRepair.state === 'ready' && workspacePackagingRepair.markdown !== markdown) actions.push(freeze({
    id: 'normalize-workspace-schema-and-self-integrity',
    title: workspacePackagingRepair.schemaReferenceChanged ? 'Repair Workspace schema reference and self integrity' : 'Repair Workspace self integrity',
    kind: 'replace-document',
    qualification: 'deterministic-shared-core',
    sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
    replacementMarkdown: workspacePackagingRepair.markdown,
    diagnosticCodes: workspacePackagingRepair.diagnosticCodes,
    boundary: 'Repairs only a tiinex.workspace.v1 artifact whose replacement independently qualifies through the same exact registered Workspace contract and c14n-v2 self-integrity requirements used by Handoff package manufacture. Existing resolver-capable Current Schema references are preserved; permalink refresh is a separate resolution operation and must not be inferred from integrity repair.'
  }));
  const referenceRepair = deterministicReferenceHygieneRepair(record, audit, markdown);
  const referenceQualification = referenceRepair.state === 'ready'
    ? qualifyReplacementAgainstSharedGuardrails(record, records, referenceRepair.markdown, {
      allowQualifiedExternalParentUnresolved: true,
      allowExistingWarningCodes: (audit.findings || []).filter((item) => item.severity === 'warning').map((item) => String(item.code || ''))
    })
    : { state: 'unavailable' };
  if (referenceRepair.state === 'ready' && referenceRepair.markdown !== markdown && referenceQualification.state === 'qualified') actions.push(freeze({
    id: 'repair-qualified-references-and-self-integrity',
    title: referenceRepair.parentReferenceChanged && referenceRepair.schemaReferenceChanged
      ? 'Repair Tiinex Parent/schema references and self integrity'
      : referenceRepair.parentReferenceChanged
        ? 'Repair Tiinex Parent references and self integrity'
        : 'Repair Tiinex schema reference and self integrity',
    kind: 'replace-document',
    qualification: 'deterministic-shared-core',
    sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
    replacementMarkdown: referenceRepair.markdown,
    diagnosticCodes: referenceRepair.diagnosticCodes,
    boundary: 'Repairs only deterministically malformed Workspace-qualified Parent recovery locators and/or a bare Current Schema id when exact qualified current-schema source authority exists; reseals self integrity and exposes the replacement only after shared audit and loaded-descendant guardrails re-qualify it. External Parent availability is not invented.'
  }));

  const integrityRepair = deterministicIntegrityHygieneRepair(markdown, audit.findings || []);
  const repairQualification = integrityRepair.state === 'ready'
    ? qualifyReplacementAgainstSharedGuardrails(record, records, integrityRepair.markdown)
    : { state: 'unavailable' };
  if (integrityRepair.state === 'ready' && integrityRepair.markdown !== markdown && repairQualification.state === 'qualified') actions.push(freeze({
    id: 'refresh-primary-self-integrity',
    title: integrityRepair.methodReferenceChanged ? 'Refresh Tiinex integrity references and self seal' : 'Refresh Tiinex c14n-v2 self integrity',
    kind: 'replace-document',
    qualification: 'deterministic-shared-core',
    sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
    replacementMarkdown: integrityRepair.markdown,
    diagnosticCodes: integrityRepair.diagnosticCodes,
    boundary: integrityRepair.methodReferenceChanged
      ? 'Rebinds only unqualified c14n-v2 footer method links to the shared qualified maintained target and reseals the existing primary self Value; the replacement is exposed only after the same shared audit and lineage guardrails re-qualify the focused artifact and every loaded digest-bound descendant.'
      : 'Refreshes only the existing primary c14n-v2 self Value through the shared integrity algorithm; the replacement is exposed only after the same shared audit and lineage guardrails re-qualify the focused artifact and every loaded digest-bound descendant.'
  }));
  const validationAuthority = audit.schemaValidationAuthority || null;
  return freeze({
    path: String(record.path || record.id || ''),
    schemaId: String(audit.schemaId || ''),
    validator: {
      state: packageQualifiedWorkspace || (audit.qualification?.exact && validationAuthority?.state === 'qualified') ? 'qualified-exact' : 'degraded',
      requestedSchema: String(audit.qualification?.requestedSchema || audit.schemaId || ''),
      resolvedThrough: String(audit.qualification?.resolvedThrough || ''),
      fallbackUsed: Boolean(audit.qualification?.fallback?.used),
      authorityState: packageQualifiedWorkspace ? 'qualified-package-conformance' : String(validationAuthority?.state || 'unavailable'),
      authorityBasis: packageQualifiedWorkspace ? 'registered-workspace-contract+self-integrity' : String(validationAuthority?.currentReference?.basis || ''),
      authorityFindings: packageQualifiedWorkspace ? [] : [...(validationAuthority?.findings || [])]
    },
    diagnostics,
    actions
  });
}

function findingsForPath(findings = [], path = '') {
  const wanted = norm(path);
  return (findings || []).filter((finding) => norm(finding?.evidencePath || finding?.ref || '') === wanted);
}

function deterministicWorkspacePackagingRepair(record = {}, audit = {}, markdown = '') {
  if (String(audit.schemaId || '') !== 'tiinex.workspace.v1') return freeze({ state: 'unavailable' });
  const source = String(markdown || '');
  if (!source) return freeze({ state: 'unavailable' });
  const currentMatches = [...source.matchAll(/^(\s*-\s+Current Schema:\s*)(.*)$/gm)];
  if (currentMatches.length !== 1) return freeze({ state: 'unavailable' });
  const currentRaw = String(currentMatches[0][2] || '').trim();
  const linked = currentRaw.match(/^\[tiinex\.workspace\.v1\]\(([^)]+)\)$/);
  const bare = currentRaw === 'tiinex.workspace.v1';
  if (!linked && !bare) return freeze({ state: 'unavailable' });

  // Current Schema is portable source identity, not a registry token. Preserve any
  // already-resolvable external permalink; hosts/Core resolution may later offer a
  // separate permalink refresh only when the resolved schema bytes actually changed.
  let candidate = source;
  const schemaReferenceChanged = false;

  const sealed = sealC14nV2Self(candidate);
  if (sealed.state !== 'sealed' && sealed.state !== 'unchanged') return freeze({ state: 'unavailable' });
  candidate = String(sealed.markdown || candidate);
  const conformance = qualifyTiinexRouteArtifact({ markdown: candidate, expectedSchemaId: 'tiinex.workspace.v1', requireExactContract: true });
  if (conformance.status !== 'qualified') return freeze({ state: 'blocked', reasons: (conformance.findings || []).map((item) => String(item.code || '')) });
  const diagnosticCodes = [...new Set([
    ...(audit.findings || []).filter((item) => /schema-authority|integrity/i.test(String(item.code || ''))).map((item) => String(item.code || '')),
    'portable.lineage-integrity.child-self-mismatch'
  ].filter(Boolean))];
  return freeze({ state: 'ready', markdown: candidate, schemaReferenceChanged, diagnosticCodes });
}

function qualifyReplacementAgainstSharedGuardrails(record = {}, records = [], replacementMarkdown = '', options = {}) {
  const focusPath = norm(record.path || record.id || '');
  if (!focusPath || !replacementMarkdown) return freeze({ state: 'unavailable', reason: 'replacement-or-focus-unavailable' });
  const replacedRecords = records.map((item) => norm(item.path || item.id || '') === focusPath ? { ...item, markdown: replacementMarkdown } : item);
  const replacementRecord = replacedRecords.find((item) => norm(item.path || item.id || '') === focusPath);
  if (!replacementRecord) return freeze({ state: 'unavailable', reason: 'focused-record-unavailable' });
  const replacementAudit = auditPortableRecord(replacementRecord, { requireExactSchemaAuthority: true });
  const allowedWarnings = new Set((options.allowExistingWarningCodes || []).map((item) => String(item || '')));
  const auditBlockers = [...(replacementAudit.findings || [])].filter((item) => {
    if (item.severity === 'error') return true;
    if (item.severity !== 'warning') return false;
    return !allowedWarnings.has(String(item.code || ''));
  });
  if (auditBlockers.length) return freeze({ state: 'blocked', reason: 'replacement-shared-audit-not-clean', blockerCodes: auditBlockers.map((item) => String(item.code || '')) });

  const before = inspectPortableLineageIntegrity({ records });
  const after = inspectPortableLineageIntegrity({ records: replacedRecords });
  const beforeFocus = (before.artifacts || []).find((item) => norm(item.path || '') === focusPath);
  const affectedPaths = new Set([focusPath, ...((beforeFocus?.downstreamDescendants || []).map((item) => norm(item.path || '')).filter(Boolean))]);
  const lineageBlockers = (after.artifacts || []).filter((item) => {
    if (!affectedPaths.has(norm(item.path || '')) || item.state === 'healthy') return false;
    if (options.allowQualifiedExternalParentUnresolved === true && norm(item.path || '') === focusPath && item.state === 'parent-unresolved' && hasQualifiedWorkspaceParentReference(replacementMarkdown)) return false;
    return true;
  });
  if (lineageBlockers.length) return freeze({ state: 'blocked', reason: 'replacement-shared-lineage-not-clean', blockers: lineageBlockers.map((item) => ({ path: item.path, state: item.state })) });
  return freeze({ state: 'qualified', affectedPaths: [...affectedPaths] });
}

function deterministicReferenceHygieneRepair(record = {}, audit = {}, markdown = '') {
  const source = String(markdown || '');
  if (!source) return freeze({ state: 'unavailable' });
  let candidate = source;
  let parentReferenceChanged = false;
  let schemaReferenceChanged = false;
  const diagnosticCodes = [];

  const lines = candidate.replace(/\r\n?/g, '\n').split('\n');
  const parentStart = lines.findIndex((line) => /^\s*-\s+Parent\s*$/.test(line));
  if (parentStart >= 0) {
    let parentEnd = lines.length;
    for (let index = parentStart + 1; index < lines.length; index += 1) {
      if (/^-\s+\S/.test(lines[index])) { parentEnd = index; break; }
    }
    for (let index = parentStart + 1; index < parentEnd; index += 1) {
      lines[index] = lines[index].replace(/\]\(([^)]+::[^)]+)\)/g, (whole, target) => {
        const normalized = normalizeMalformedWorkspaceQualifiedTarget(target);
        if (!normalized || normalized === target) return whole;
        parentReferenceChanged = true;
        return `](${normalized})`;
      });
    }
  }
  if (parentReferenceChanged) {
    candidate = lines.join('\n');
    const integrityLines = candidate.replace(/\r\n?/g, '\n').split('\n');
    const integrityStart = integrityLines.findIndex((line) => line.trim() === '# Continuity Integrity');
    if (integrityStart >= 0) {
      for (let index = integrityStart + 1; index < integrityLines.length; index += 1) {
        integrityLines[index] = integrityLines[index].replace(/\]\(([^)]+::[^)]+)\)/g, (whole, target) => {
          const normalized = normalizeMalformedWorkspaceQualifiedTarget(target);
          return normalized && normalized !== target ? `](${normalized})` : whole;
        });
      }
      candidate = integrityLines.join('\n');
    }
    diagnosticCodes.push('root.parent.recovery.workspace-qualified.malformed', 'portable.lineage-integrity.parent-unresolved');
  }

  const exactTarget = String(audit?.schemaValidationAuthority?.currentReference?.target || '').trim();
  const schemaId = String(audit?.schemaId || '').trim();
  const schemaWarning = (audit?.findings || []).some((item) => String(item?.code || '') === 'schema.reference.exact-target-omitted');
  if (schemaWarning && schemaId && exactTarget && audit?.schemaValidationAuthority?.currentReference?.state === 'qualified') {
    const schemaLines = candidate.replace(/\r\n?/g, '\n').split('\n');
    const index = schemaLines.findIndex((line) => /^\s*-\s+Current Schema:\s*/.test(line));
    if (index >= 0) {
      const match = schemaLines[index].match(/^(\s*-\s+Current Schema:\s*)([^\s].*)$/);
      const raw = String(match?.[2] || '').trim();
      if (match && raw === schemaId) {
        schemaLines[index] = `${match[1]}[${schemaId}](${exactTarget})`;
        candidate = schemaLines.join('\n');
        schemaReferenceChanged = true;
        diagnosticCodes.push('schema.reference.exact-target-omitted');
      }
    }
  }

  if (!parentReferenceChanged && !schemaReferenceChanged) return freeze({ state: 'unavailable' });
  const sealed = sealC14nV2Self(candidate);
  if (sealed.state !== 'sealed' && sealed.state !== 'unchanged') return freeze({ state: 'unavailable' });
  return freeze({ state: 'ready', markdown: String(sealed.markdown || candidate), parentReferenceChanged, schemaReferenceChanged, diagnosticCodes: [...new Set(diagnosticCodes)] });
}

function normalizeMalformedWorkspaceQualifiedTarget(value = '') {
  const raw = String(value || '').trim();
  if (classifyParentRecoveryReference(raw).kind !== 'malformed-workspace-qualified') return raw;
  const stripped = raw.replace(/^(?:\.\.\/)+/, '').replace(/^\.\//, '');
  return classifyParentRecoveryReference(stripped).kind === 'workspace-qualified' ? stripped : raw;
}

function hasQualifiedWorkspaceParentReference(markdown = '') {
  const source = String(markdown || '');
  const parentStart = source.split(/\r?\n/).findIndex((line) => /^\s*-\s+Parent\s*$/.test(line));
  if (parentStart < 0) return false;
  const lines = source.split(/\r?\n/);
  let parentEnd = lines.length;
  for (let index = parentStart + 1; index < lines.length; index += 1) if (/^-\s+\S/.test(lines[index])) { parentEnd = index; break; }
  const targets = [];
  for (let index = parentStart + 1; index < parentEnd; index += 1) {
    for (const match of lines[index].matchAll(/\]\(([^)]+)\)/g)) targets.push(String(match[1] || ''));
  }
  return targets.some((target) => classifyParentRecoveryReference(target).kind === 'workspace-qualified');
}

function projectDiagnostic(finding = {}, markdown = '') {
  const located = locateFindingLine(finding, markdown);
  return freeze({
    severity: String(finding.severity || 'warning'),
    code: String(finding.code || 'tiinex.validation.finding'),
    message: String(finding.message || 'Tiinex validation finding.'),
    fixability: String(finding.fixability || 'unknown'),
    line: located.line,
    sourceRange: located.sourceRange,
    locationState: located.state,
    locationBasis: located.basis
  });
}

function locatedLine(lines = [], index = -1, state = 'deterministic', basis = '') {
  if (!Number.isInteger(index) || index < 0 || index >= lines.length) return freeze({ state: 'unresolved', line: null, sourceRange: null, basis: basis || 'line-unavailable' });
  const text = String(lines[index] || '');
  return freeze({
    state,
    line: index + 1,
    sourceRange: { startLine: index + 1, startColumn: 1, endLine: index + 1, endColumn: text.length + 1 },
    basis
  });
}

export function locateFindingLine(finding = {}, markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const params = finding.params || finding;
  const field = String(params.field || '').trim();
  const section = String(params.section || '').trim();
  const heading = String(params.heading || '').replace(/^#{1,6}\s+/, '').trim();
  const group = String(params.group || '').trim();
  if (field) {
    const index = lines.findIndex((line) => new RegExp(`^\\s*-\\s+${escapeRegExp(field)}\\s*:`).test(line));
    if (index >= 0) return locatedLine(lines, index, 'deterministic', `field:${field}`);
  }
  for (const owner of [section, heading, group].filter(Boolean)) {
    const sectionIndex = lines.findIndex((line) => new RegExp(`^#{2,6}\\s+${escapeRegExp(owner)}\\s*$`, 'i').test(line));
    if (sectionIndex >= 0) return locatedLine(lines, sectionIndex, section || heading ? 'deterministic' : 'deterministic-anchor', `${section || heading ? 'section' : 'owning-section'}:${owner}`);
    const envelopeIndex = lines.findIndex((line) => new RegExp(`^\\s*-\\s+${escapeRegExp(owner)}(?:\\s*:.*)?\\s*$`, 'i').test(line));
    if (envelopeIndex >= 0) return locatedLine(lines, envelopeIndex, 'deterministic-anchor', `envelope-owner:${owner}`);
  }
  const code = String(finding.code || '');
  if (code.includes('schema.') || code.endsWith('.schema.mismatch') || code === 'audit.schema-authority.unqualified') {
    const index = lines.findIndex((line) => /^\s*-\s+Current Schema\s*:/.test(line));
    if (index >= 0) return locatedLine(lines, index, 'deterministic', 'current-schema-field');
  }
  if (code === 'integrity.method-reference.unqualified') {
    const headingIndex = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    const methodIndex = lines.findIndex((line, index) => index > headingIndex && /^\s*-\s+\[sha256-base64url-c14n-v2\]\([^)]+\)\s*$/.test(line));
    if (methodIndex >= 0) return locatedLine(lines, methodIndex, 'deterministic', 'continuity-integrity-method-reference');
  }
  if (code.includes('integrity') || /integrity|checksum|digest/i.test(String(finding.message || ''))) {
    const headingIndex = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    if (headingIndex >= 0) {
      const index = lines.findIndex((line, i) => i > headingIndex && /^\s+-\s+Value\s*:/.test(line));
      if (index >= 0) return locatedLine(lines, index, 'deterministic', 'continuity-integrity-value');
      return locatedLine(lines, headingIndex, 'deterministic-anchor', 'continuity-integrity-heading');
    }
  }
  if (/^(portable\.contract\.|root\.|integrity\.)/i.test(code) && (/missing|required|incomplete/i.test(code) || /\bmissing\b|\brequired\b/i.test(String(finding.message || '')))) {
    const bodyHeading = lines.findIndex((line) => /^#\s+\S/.test(line) && !/^#\s+Continuity (?:Context|Integrity)\s*$/.test(line));
    if (bodyHeading >= 0) return locatedLine(lines, bodyHeading, 'deterministic-anchor', section ? `body-heading-for-missing-section:${section}` : field ? `body-heading-for-missing-field:${field}` : 'body-heading-for-missing-required-content');
    const contextHeading = lines.findIndex((line) => line.trim() === '# Continuity Context');
    if (contextHeading >= 0) return locatedLine(lines, contextHeading, 'deterministic-anchor', 'continuity-context-for-missing-required-content');
  }
  if (/\.body\.|body/i.test(code) || /\bbody\b/i.test(String(finding.message || ''))) {
    const bodyHeading = lines.findIndex((line) => /^#\s+\S/.test(line) && !/^#\s+Continuity (?:Context|Integrity)\s*$/.test(line));
    if (bodyHeading >= 0) return locatedLine(lines, bodyHeading, 'deterministic-anchor', 'body-heading-for-body-finding');
  }
  return freeze({ state: 'unresolved', line: null, sourceRange: null, basis: 'shared-finding-has-no-deterministic-line-evidence' });
}

function deterministicIntegrityHygieneRepair(markdown = '', findings = []) {
  const source = String(markdown || '');
  const codes = new Set((findings || []).map((item) => String(item?.code || '')));
  const authority = integrityMethodReferenceAuthorityForCreation(C14N_V2_METHOD_ID);
  const preferredTarget = authority?.resolutionState === 'qualified' ? String(authority?.preferredTarget || '') : '';
  const exactTargets = new Set((authority?.exactTargets || []).map((item) => String(item || '')));
  let methodReferenceChanged = false;
  let repaired = source;
  if (codes.has('integrity.method-reference.unqualified') && preferredTarget) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const heading = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    if (heading >= 0) {
      for (let index = heading + 1; index < lines.length; index += 1) {
        if (/^#\s+/.test(lines[index])) break;
        const match = lines[index].match(/^(\s*-\s+)\[sha256-base64url-c14n-v2\]\(([^)]+)\)(\s*)$/);
        if (!match || exactTargets.has(match[2])) continue;
        lines[index] = `${match[1]}[${C14N_V2_METHOD_ID}](${preferredTarget})${match[3]}`;
        methodReferenceChanged = true;
      }
      if (methodReferenceChanged) repaired = lines.join('\n');
    }
  }

  const integrity = canonicalC14nV2SelfState(repaired);
  const requiresSeal = methodReferenceChanged || integrity.state === 'mismatch' || integrity.state === 'prepared';
  if (!requiresSeal) return freeze({ state: 'unavailable', markdown: source, methodReferenceChanged: false, diagnosticCodes: [] });
  const sealed = sealC14nV2Self(repaired);
  if (sealed.state !== 'sealed') return freeze({ state: 'unavailable', markdown: source, methodReferenceChanged, diagnosticCodes: [] });
  const diagnosticCodes = [
    ...(methodReferenceChanged ? ['integrity.method-reference.unqualified'] : []),
    'integrity.c14n-v2.mismatch',
    'integrity.c14n-v2.ambiguous'
  ];
  return freeze({ state: 'ready', markdown: sealed.markdown, methodReferenceChanged, diagnosticCodes: [...new Set(diagnosticCodes)] });
}

function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => Object.freeze({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
