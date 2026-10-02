import { auditPortableRecord } from '../audit/audit.capability.js';
import { C14N_V2_METHOD_ID, canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { parsePortableSchemaDocument } from '../schema/schema.contract.js';
import { compilePortableSchemaContractChain } from '../schema/contract.compile.js';
import { nativeSchemaMarkdown } from '../../../schemas/generated/native.schema.pack.js';
import { sha256Hex } from '../../../export/package.bytes.js';
import { integrityMethodReferenceAuthorityForCreation } from '../../../integrity/integrity.methodReference.js';
import { inspectPortableLineageIntegrity } from '../lineage/lineage.integrity.plan.js';
import { portableFinding } from '../findings.js';
import { qualifyTiinexRouteArtifact } from '../handoff/routeArtifactConformance.js';

export const PORTABLE_EDITOR_ASSISTANCE_SCHEMA_ID = 'tiinex.portable.editor-assistance.v1';

export function projectPortableEditorAssistance(input = {}) {
  const records = normalizeRecords(input);
  const focusPath = norm(input.focusPath || input.focus || '');
  const selectedRecords = focusPath ? records.filter((record) => norm(record.path || record.id || '') === focusPath) : records;
  const lineageInspection = inspectPortableLineageIntegrity({ records });
  const documents = selectedRecords.map((record) => projectDocument(record, records, lineageInspection, referenceResolutionsForRecord(input.referenceResolutions || [], record)));
  const diagnostics = documents.flatMap((item) => item.diagnostics);
  return freeze({
    schema: PORTABLE_EDITOR_ASSISTANCE_SCHEMA_ID,
    status: diagnostics.some((item) => item.severity === 'error') ? 'invalid' : diagnostics.some((item) => item.severity === 'warning') ? 'degraded' : 'clean',
    documents,
    operationBoundary: { sourceMutation: false, remoteWrite: false, automaticRepair: false },
    boundary: 'Adapter-neutral projection of exact shared audit/validator findings plus only deterministic byte replacements. Presentation adapters must not invent finding severity, validator choice, source line, or repair content.'
  });
}

function projectDocument(record = {}, records = [], lineageInspection = null, referenceResolutions = []) {
  if (isCanonicalSchemaSourceRecord(record)) return projectSchemaSourceDocument(record, records);
  const audit = auditPortableRecord(record, { requireExactSchemaAuthority: true, schemaReferenceResolutions: referenceResolutions });
  const markdown = String(record.markdown || '');
  const recordPath = norm(record.path || record.id || '');
  const lineageFindings = findingsForPath(lineageInspection?.findings || [], recordPath);
  const workspaceConformance = String(audit.schemaId || '') === 'tiinex.workspace.v1'
    ? qualifyTiinexRouteArtifact({ markdown, expectedSchemaId: 'tiinex.workspace.v1', requireExactContract: true })
    : null;
  const packageQualifiedWorkspace = workspaceConformance?.status === 'qualified';
  const reachabilityFindings = schemaReferenceReachabilityFindings(record, records, audit, markdown);
  const sharedFindings = [...(audit.findings || []), ...lineageFindings, ...reachabilityFindings].filter((finding) => !(packageQualifiedWorkspace && String(finding?.code || '') === 'audit.schema-authority.unqualified'));
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
  const referenceRepair = deterministicReferenceHygieneRepair(record, records, audit, markdown);
  const referencePlan = referenceRepair.state === 'ready'
    ? deterministicReferenceRepairChangeset(record, records, lineageInspection, referenceRepair)
    : { state: 'unavailable' };
  if (referencePlan.state === 'ready' && referencePlan.replacements.length) {
    const dependentCount = Math.max(0, referencePlan.replacements.length - 1);
    actions.push(freeze({
      id: 'repair-qualified-references-and-self-integrity',
      title: dependentCount
        ? `Repair Tiinex references and refresh ${dependentCount} dependent lineage artifact${dependentCount === 1 ? '' : 's'}`
        : referenceRepair.parentReferenceChanged && referenceRepair.schemaReferenceChanged
          ? 'Repair Tiinex Parent/schema references and self integrity'
          : referenceRepair.parentReferenceChanged
            ? 'Repair Tiinex Parent references and self integrity'
            : 'Repair Tiinex schema reference and self integrity',
      kind: dependentCount ? 'replace-record-set' : 'replace-document',
      qualification: 'deterministic-shared-core',
      sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
      replacementMarkdown: referencePlan.focusReplacement,
      replacements: referencePlan.replacements,
      diagnosticCodes: referenceRepair.diagnosticCodes,
      boundary: dependentCount
        ? 'Core selected exact schema-reference locators and produced one deterministic loaded-lineage changeset. Each changed descendant receives only the required Parent digest refresh and self reseal, plus independently-qualified schema-reference hygiene. Presentation hosts may apply this changeset only when every source document still matches its qualified source hash.'
        : 'Repairs deterministic Parent/schema references using Core-owned source-resolution policy, preferring an exact immutable published target when it denotes the same local schema bytes, otherwise a same-Workspace relative schema target when available; reseals self integrity. Cross-Workspace unpublished references remain unresolved rather than fabricated.'
    }));
  }

  const referenceResolution = projectReferenceResolutionAssistance(markdown, referenceResolutions);
  diagnostics.push(...referenceResolution.diagnostics);
  actions.push(...referenceResolution.actions);

  const lineageArtifact = (lineageInspection?.artifacts || []).find((item) => norm(item?.path || '') === recordPath) || null;
  const parentIntegrityRepair = deterministicParentIntegrityRepair(markdown, lineageArtifact);
  const parentRepairQualification = parentIntegrityRepair.state === 'ready'
    ? qualifyReplacementAgainstSharedGuardrails(record, records, parentIntegrityRepair.markdown, {
      allowExistingWarningCodes: sharedFindings.filter((item) => item.severity === 'warning').map((item) => String(item.code || ''))
    })
    : { state: 'unavailable' };
  if (parentIntegrityRepair.state === 'ready' && parentIntegrityRepair.markdown !== markdown && parentRepairQualification.state === 'qualified') actions.push(freeze({
    id: 'refresh-parent-integrity-and-self-seal',
    title: 'Refresh Tiinex Parent integrity and self seal',
    kind: 'replace-document',
    qualification: 'deterministic-shared-core',
    sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
    replacementMarkdown: parentIntegrityRepair.markdown,
    diagnosticCodes: ['portable.lineage-integrity.parent-target-mismatch', 'integrity.c14n-v2.mismatch', 'portable.lineage-integrity.child-self-mismatch'],
    boundary: 'Refreshes only an existing Parent integrity digest whose declared locator already matches the exact resolved Parent and whose verified Parent self digest is available locally; the focused artifact is resealed and the action is withheld when loaded descendants would become inconsistent.'
  }));

  const integrityRepair = deterministicIntegrityHygieneRepair(markdown, sharedFindings);
  const repairQualification = integrityRepair.state === 'ready'
    ? qualifyReplacementAgainstSharedGuardrails(record, records, integrityRepair.markdown, {
      allowExistingWarningCodes: sharedFindings.filter((item) => item.severity === 'warning').map((item) => String(item.code || ''))
    })
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


function isCanonicalSchemaSourceRecord(record = {}) {
  const path = norm(record.path || record.id || '');
  return /(?:^|\/)\.topics\/\.schemas\/.+\.schema\.md$/i.test(path) || /\.schema\.md$/i.test(path);
}

function projectSchemaSourceDocument(record = {}, records = []) {
  const markdown = String(record.markdown || '');
  const recordPath = norm(record.path || record.id || '');
  const findings = [];
  let document = null;
  try { document = parsePortableSchemaDocument(markdown); }
  catch (error) {
    findings.push(schemaSourceFinding('error', 'schema-source.parse.invalid', error?.message || 'Schema source could not be parsed.', { line: 1 }));
  }
  const schemaId = String(document?.schemaId || '').trim();
  if (document && !schemaId) findings.push(schemaSourceFinding('error', 'schema-source.schema-id.missing', 'Schema source has no Current Schema identifier.', { field: 'Current Schema' }));

  const index = schemaSourceIndex(records);
  if (schemaId && markdown) index.set(schemaId, Object.freeze({ path: recordPath, markdown, document }));
  const lineage = schemaId ? schemaSourceLineage(schemaId, index) : { state: 'blocked', records: [], reason: 'schema-id-missing', missingSchemaId: '' };
  if (lineage.state === 'missing-parent') findings.push(schemaSourceFinding('error', 'schema-source.parent.missing', `Schema ${schemaId} declares unavailable Parent ${lineage.missingSchemaId}.`, { field: 'Parent Schema' }));
  else if (lineage.state === 'cycle') findings.push(schemaSourceFinding('error', 'schema-source.lineage.cycle', `Schema lineage cycle detected: ${lineage.cycle.join(' -> ')}.`, { field: 'Parent Schema' }));
  else if (lineage.state === 'ready') {
    try {
      const compiled = compilePortableSchemaContractChain(lineage.records.map((item) => item.markdown));
      if (compiled?.lineageQualification?.state !== 'valid') findings.push(schemaSourceFinding('error', 'schema-source.lineage.compile-unqualified', `Compiled schema lineage is not valid for ${schemaId}. ${(compiled?.lineageQualification?.findings || []).join(' ')}`.trim(), { field: 'Current Schema' }));
    } catch (error) {
      findings.push(schemaSourceFinding('error', 'schema-source.contract.compile-failed', error?.message || `Schema contract compilation failed for ${schemaId}.`, { field: 'Current Schema' }));
    }
  }

  const self = canonicalC14nV2SelfState(markdown);
  if (self.state === 'mismatch') findings.push(schemaSourceFinding('error', 'integrity.c14n-v2.mismatch', 'c14n-v2 self-integrity does not match the current canonical schema bytes.'));
  else if (self.state === 'unavailable') findings.push(schemaSourceFinding('error', 'schema-source.integrity.self-missing', 'Schema source has no primary c14n-v2 self-integrity entry.'));
  else if (self.state === 'ambiguous') findings.push(schemaSourceFinding('error', 'integrity.c14n-v2.ambiguous', 'Schema source self-integrity is ambiguous and cannot be deterministically validated.'));
  else if (self.state === 'prepared') findings.push(schemaSourceFinding('warning', 'schema-source.integrity.self-unsealed', 'Schema source self-integrity is prepared but not sealed.'));

  let parentDigestRepairRequired = false;
  let parentDigestCode = '';
  let parentDigest = '';
  if (document?.parentSchemaId && lineage.state === 'ready' && lineage.records.length >= 2) {
    const parentRecord = lineage.records.at(-2);
    const parentSelf = canonicalC14nV2SelfState(parentRecord.markdown);
    const declared = primaryParentIntegrityValue(markdown);
    const declaredTarget = primaryParentIntegrityTarget(markdown);
    const targetIsLocal = Boolean(declaredTarget) && !/^(?:https?:\/\/|[A-Za-z][A-Za-z0-9+.-]*:|[^/]+::)/i.test(declaredTarget);
    if (targetIsLocal) {
      if (parentSelf.state !== 'verified') findings.push(schemaSourceFinding('error', 'schema-source.parent.integrity-unavailable', `Parent schema ${document.parentSchemaId} does not expose verified c14n-v2 self-integrity.`, { field: 'Parent Schema' }));
      else if (!declared) {
        parentDigestRepairRequired = true;
        parentDigestCode = 'schema-source.parent.integrity-missing';
        parentDigest = parentSelf.declaredValue;
        findings.push(schemaSourceFinding('error', 'schema-source.parent.integrity-missing', `Schema source does not declare Parent integrity for ${document.parentSchemaId}.`, { field: 'Value' }));
      } else if (declared !== parentSelf.declaredValue) {
        parentDigestRepairRequired = true;
        parentDigestCode = 'portable.lineage-integrity.parent-target-mismatch';
        parentDigest = parentSelf.declaredValue;
        findings.push(schemaSourceFinding('error', 'portable.lineage-integrity.parent-target-mismatch', `Declared local Parent integrity does not match the loaded ${document.parentSchemaId} schema source.`));
      }
    }
  }

  const diagnostics = findings.map((finding) => projectDiagnostic(finding, markdown));
  const actions = [];
  const repair = deterministicSchemaSourceIntegrityRepair(markdown, { parentDigestRepairRequired, parentDigestCode, parentDigest, findings });
  if (repair.state === 'ready' && qualifySchemaSourceReplacement(repair.markdown, record, records).state === 'qualified') actions.push(freeze({
    id: 'repair-schema-source-integrity',
    title: parentDigestRepairRequired ? 'Refresh schema Parent integrity and self seal' : 'Refresh schema self integrity',
    kind: 'replace-document',
    qualification: 'deterministic-shared-core',
    sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
    replacementMarkdown: repair.markdown,
    diagnosticCodes: repair.diagnosticCodes,
    boundary: 'Repairs only deterministic c14n-v2 integrity over the current schema source bytes and, when exact loaded Parent schema bytes are available, the declared Parent digest. It does not rewrite schema semantics, select a different Parent, publish authority, or invent source identity.'
  }));

  return freeze({
    path: String(record.path || record.id || ''),
    schemaId,
    validator: {
      state: findings.some((item) => item.severity === 'error') ? 'schema-source-invalid' : findings.some((item) => item.severity === 'warning') ? 'schema-source-degraded' : 'qualified-local-schema-source',
      requestedSchema: schemaId,
      resolvedThrough: schemaId,
      fallbackUsed: false,
      authorityState: 'schema-source-local',
      authorityBasis: 'loaded-schema-source+compiled-inheritance+integrity',
      authorityFindings: findings.map((item) => item.message)
    },
    diagnostics,
    actions
  });
}

function schemaSourceFinding(severity, code, message, params = {}) {
  return Object.freeze({ severity, code, message, params: Object.freeze({ ...(params || {}) }) });
}

function schemaSourceIndex(records = []) {
  const index = new Map();
  for (const record of records || []) {
    if (!isCanonicalSchemaSourceRecord(record)) continue;
    const markdown = String(record.markdown || '');
    let document; try { document = parsePortableSchemaDocument(markdown); } catch { continue; }
    const schemaId = String(document?.schemaId || '').trim();
    if (!schemaId || index.has(schemaId)) continue;
    index.set(schemaId, Object.freeze({ path: norm(record.path || record.id || ''), markdown, document }));
  }
  return index;
}

function schemaSourceLineage(schemaId = '', index = new Map()) {
  const records = [];
  const seen = new Map();
  let current = String(schemaId || '').trim();
  while (current) {
    if (seen.has(current)) return Object.freeze({ state: 'cycle', records: Object.freeze(records), cycle: Object.freeze([...records.slice(seen.get(current)).map((item) => item.document.schemaId), current]), missingSchemaId: '' });
    seen.set(current, records.length);
    let record = index.get(current) || null;
    if (!record) {
      const markdown = nativeSchemaMarkdown(current);
      if (markdown) {
        try { record = Object.freeze({ path: '', markdown, document: parsePortableSchemaDocument(markdown) }); } catch { record = null; }
      }
    }
    if (!record) return Object.freeze({ state: 'missing-parent', records: Object.freeze(records), cycle: Object.freeze([]), missingSchemaId: current });
    records.unshift(record);
    const parentSchemaId = String(record.document?.parentSchemaId || '').trim();
    if (!parentSchemaId) break;
    current = parentSchemaId;
  }
  return Object.freeze({ state: 'ready', records: Object.freeze(records), cycle: Object.freeze([]), missingSchemaId: '' });
}

function primaryParentIntegrityValue(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const index = primaryParentIntegrityValueLine(lines);
  if (index < 0) return '';
  const match = String(lines[index] || '').match(/^\s*-\s+Value\s*:\s*(.*?)\s*$/i);
  return String(match?.[1] || '').trim();
}

function primaryParentIntegrityTarget(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const headingIndex = lines.findIndex((line) => String(line || '').trim() === '# Continuity Integrity');
  if (headingIndex < 0) return '';
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const match = String(lines[index] || '').match(/^\s*-\s+Towards\s*:\s*(?:\[[^\]]+\]\(([^)]+)\)|(\S.*?))\s*$/i);
    if (!match) continue;
    const target = String(match[1] || match[2] || '').trim();
    if (target && target.toLowerCase() !== 'self') return target;
  }
  return '';
}

function deterministicSchemaSourceIntegrityRepair(markdown = '', state = {}) {
  const source = String(markdown || '');
  let candidate = source;
  const diagnosticCodes = [];
  if (state.parentDigestRepairRequired && state.parentDigest) {
    const lines = candidate.replace(/\r\n?/g, '\n').split('\n');
    const index = primaryParentIntegrityValueLine(lines);
    if (index < 0) return freeze({ state: 'unavailable', markdown: source, diagnosticCodes: [] });
    const match = lines[index].match(/^(\s*-\s+Value\s*:\s*)(.*)$/i);
    if (!match) return freeze({ state: 'unavailable', markdown: source, diagnosticCodes: [] });
    lines[index] = `${match[1]}${state.parentDigest}`;
    candidate = lines.join('\n');
    diagnosticCodes.push(String(state.parentDigestCode || 'portable.lineage-integrity.parent-target-mismatch'));
  }
  const self = canonicalC14nV2SelfState(candidate);
  const selfRepairable = self.state === 'mismatch' || self.state === 'prepared' || state.parentDigestRepairRequired;
  if (!selfRepairable) return freeze({ state: 'unavailable', markdown: source, diagnosticCodes: [] });
  const sealed = sealC14nV2Self(candidate);
  if (sealed.state !== 'sealed') return freeze({ state: 'unavailable', markdown: source, diagnosticCodes: [] });
  diagnosticCodes.push('integrity.c14n-v2.mismatch', 'schema-source.integrity.self-unsealed');
  return freeze({ state: 'ready', markdown: sealed.markdown, diagnosticCodes: [...new Set(diagnosticCodes)] });
}

function qualifySchemaSourceReplacement(markdown = '', record = {}, records = []) {
  const replacement = { ...record, markdown };
  const index = schemaSourceIndex(records.map((item) => norm(item.path || item.id || '') === norm(record.path || record.id || '') ? replacement : item));
  let document; try { document = parsePortableSchemaDocument(markdown); } catch { return freeze({ state: 'blocked', reason: 'parse-invalid' }); }
  const schemaId = String(document?.schemaId || '').trim();
  if (!schemaId) return freeze({ state: 'blocked', reason: 'schema-id-missing' });
  index.set(schemaId, Object.freeze({ path: norm(record.path || record.id || ''), markdown, document }));
  const lineage = schemaSourceLineage(schemaId, index);
  if (lineage.state !== 'ready') return freeze({ state: 'blocked', reason: lineage.state });
  let compiled; try { compiled = compilePortableSchemaContractChain(lineage.records.map((item) => item.markdown)); } catch { return freeze({ state: 'blocked', reason: 'compile-failed' }); }
  if (compiled?.lineageQualification?.state !== 'valid') return freeze({ state: 'blocked', reason: 'lineage-unqualified' });
  const self = canonicalC14nV2SelfState(markdown);
  if (self.state !== 'verified') return freeze({ state: 'blocked', reason: 'self-integrity-unverified' });
  if (document.parentSchemaId && lineage.records.length >= 2) {
    const declaredTarget = primaryParentIntegrityTarget(markdown);
    const targetIsLocal = Boolean(declaredTarget) && !/^(?:https?:\/\/|[A-Za-z][A-Za-z0-9+.-]*:|[^/]+::)/i.test(declaredTarget);
    if (targetIsLocal) {
      const parentSelf = canonicalC14nV2SelfState(lineage.records.at(-2).markdown);
      if (parentSelf.state !== 'verified' || primaryParentIntegrityValue(markdown) !== parentSelf.declaredValue) return freeze({ state: 'blocked', reason: 'parent-integrity-unverified' });
    }
  }
  return freeze({ state: 'qualified' });
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
    return true;
  });
  if (lineageBlockers.length) return freeze({ state: 'blocked', reason: 'replacement-shared-lineage-not-clean', blockers: lineageBlockers.map((item) => ({ path: item.path, state: item.state })) });
  return freeze({ state: 'qualified', affectedPaths: [...affectedPaths] });
}

function deterministicReferenceHygieneRepair(record = {}, records = [], audit = {}, markdown = '') {
  const source = String(markdown || '');
  if (!source) return freeze({ state: 'unavailable' });
  let candidate = source;
  let parentReferenceChanged = false;
  let schemaReferenceChanged = false;
  const diagnosticCodes = [];


  const exactTargetByField = new Map((audit?.findings || [])
    .filter((item) => String(item?.code || '') === 'schema.reference.exact-target-omitted')
    .map((item) => [String(item?.params?.field || '').trim(), String(item?.params?.exactTarget || '').trim()]));
  const schemaLines = candidate.replace(/\r\n?/g, '\n').split('\n');
  const fields = [
    Object.freeze({ field: 'Envelope Schema', pattern: /^\s*-\s+Envelope Schema:\s*/ }),
    Object.freeze({ field: 'Parent Schema', pattern: /^\s*-\s+Parent Schema:\s*/ }),
    Object.freeze({ field: 'Current Schema', pattern: /^\s*-\s+Current Schema:\s*/ })
  ];
  const changedSchemaFields = [];
  for (const descriptor of fields) {
    const index = schemaLines.findIndex((line) => descriptor.pattern.test(line));
    if (index < 0) continue;
    const prefixMatch = schemaLines[index].match(new RegExp(`^(\\s*-\\s+${descriptor.field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*)(.*)$`));
    if (!prefixMatch) continue;
    const raw = String(prefixMatch[2] || '').trim();
    if (!isBareSchemaId(raw)) continue;
    const schemaId = raw;
    const target = preferredSchemaReferenceTarget(record, records, schemaId, exactTargetByField.get(descriptor.field) || '');
    if (!target?.target) continue;
    schemaLines[index] = `${prefixMatch[1]}[${schemaId}](${target.target})`;
    schemaReferenceChanged = true;
    changedSchemaFields.push(Object.freeze({ field: descriptor.field, schemaId, target: target.target, targetKind: target.kind }));
    diagnosticCodes.push(target.kind === 'workspace-relative' ? 'schema.reference.local-target-omitted' : 'schema.reference.exact-target-omitted');
  }
  if (schemaReferenceChanged) candidate = schemaLines.join('\n');

  if (!parentReferenceChanged && !schemaReferenceChanged) return freeze({ state: 'unavailable' });
  const sealed = sealC14nV2Self(candidate);
  if (sealed.state !== 'sealed' && sealed.state !== 'unchanged') return freeze({ state: 'unavailable' });
  return freeze({
    state: 'ready',
    markdown: String(sealed.markdown || candidate),
    parentReferenceChanged,
    schemaReferenceChanged,
    changedSchemaFields: Object.freeze(changedSchemaFields),
    diagnosticCodes: [...new Set(diagnosticCodes)]
  });
}

function schemaReferenceReachabilityFindings(record = {}, records = [], audit = {}, markdown = '') {
  const source = String(markdown || '');
  if (!source) return [];
  const exactTargetFields = new Set((audit?.findings || [])
    .filter((item) => String(item?.code || '') === 'schema.reference.exact-target-omitted')
    .map((item) => String(item?.params?.field || '').trim()));
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const fields = [
    ['Envelope Schema', /^\s*-\s+Envelope Schema:\s*(.*)$/],
    ['Parent Schema', /^\s*-\s+Parent Schema:\s*(.*)$/],
    ['Current Schema', /^\s*-\s+Current Schema:\s*(.*)$/]
  ];
  const findings = [];
  for (const [field, pattern] of fields) {
    if (exactTargetFields.has(field)) continue;
    const line = lines.find((value) => pattern.test(value));
    if (!line) continue;
    const match = line.match(pattern);
    const raw = String(match?.[1] || '').trim();
    if (!isBareSchemaId(raw)) continue;
    const selected = preferredSchemaReferenceTarget(record, records, raw, '');
    if (selected?.kind !== 'workspace-relative') continue;
    findings.push(Object.freeze({
      severity: 'warning',
      code: 'schema.reference.local-target-omitted',
      message: `${field}: local schema source ${raw} is available in this Workspace but the artifact carries only the schema id; use the resolvable same-Workspace relative target until exact published bytes are available.`,
      source: 'tiinex.schema.reference.reachability.v1',
      params: Object.freeze({ field, schemaId: raw, exactTarget: selected.target })
    }));
  }
  return findings;
}

function preferredSchemaReferenceTarget(record = {}, records = [], schemaId = '', publishedExactTarget = '') {
  const id = String(schemaId || '').trim();
  if (!id) return null;
  const recordPath = norm(record.path || record.id || '');
  const local = schemaSourceIndex(records).get(id) || null;
  const published = String(publishedExactTarget || '').trim();
  if (local?.path) {
    const native = nativeSchemaMarkdown(id);
    const localMatchesRegistered = Boolean(native) && normalizeMarkdownBytes(local.markdown) === normalizeMarkdownBytes(native);
    if (published && localMatchesRegistered) return freeze({ target: published, kind: 'published-immutable-exact' });
    const relative = relativePortableReference(recordPath, local.path);
    if (relative) return freeze({ target: relative, kind: 'workspace-relative' });
  }
  if (published) return freeze({ target: published, kind: 'published-immutable-exact' });
  return null;
}

function deterministicReferenceRepairChangeset(record = {}, records = [], lineageInspection = null, focusRepair = {}) {
  const focusPath = norm(record.path || record.id || '');
  if (!focusPath || focusRepair.state !== 'ready' || !focusRepair.markdown) return freeze({ state: 'unavailable', replacements: Object.freeze([]) });
  const recordByPath = new Map((records || []).map((item) => [norm(item.path || item.id || ''), item]).filter(([path]) => Boolean(path)));
  if (!recordByPath.has(focusPath)) return freeze({ state: 'unavailable', replacements: Object.freeze([]) });
  const lineageByPath = new Map((lineageInspection?.artifacts || []).map((item) => [norm(item?.path || ''), item]).filter(([path]) => Boolean(path)));
  const focusLineage = lineageByPath.get(focusPath) || null;
  const descendants = [...(focusLineage?.downstreamDescendants || [])]
    .filter((item) => recordByPath.has(norm(item?.path || '')))
    .sort((a, b) => Number(a?.depth || 0) - Number(b?.depth || 0) || norm(a?.path || '').localeCompare(norm(b?.path || '')));
  const orderedPaths = [focusPath, ...descendants.map((item) => norm(item.path || ''))];
  const working = new Map((records || []).map((item) => [norm(item.path || item.id || ''), String(item.markdown || '')]));
  working.set(focusPath, String(focusRepair.markdown || ''));

  for (const path of orderedPaths.slice(1)) {
    const original = recordByPath.get(path);
    if (!original) return freeze({ state: 'blocked', reason: `descendant-record-missing:${path}`, replacements: Object.freeze([]) });
    let current = working.get(path) || String(original.markdown || '');
    const currentRecord = { ...original, markdown: current };
    const currentAudit = auditPortableRecord(currentRecord, { requireExactSchemaAuthority: true });
    const refRepair = deterministicReferenceHygieneRepair(currentRecord, records, currentAudit, current);
    if (refRepair.state === 'ready') current = String(refRepair.markdown || current);

    const lineageArtifact = lineageByPath.get(path) || null;
    const parentPath = norm(lineageArtifact?.exactParent?.path || '');
    if (!parentPath || !working.has(parentPath)) return freeze({ state: 'blocked', reason: `loaded-parent-unavailable:${path}`, replacements: Object.freeze([]) });
    const parentMarkdown = working.get(parentPath) || '';
    const refreshed = refreshLoadedParentDigest(current, parentMarkdown);
    if (refreshed.state !== 'ready' && refreshed.state !== 'unchanged') return freeze({ state: 'blocked', reason: `parent-digest-refresh-unavailable:${path}`, replacements: Object.freeze([]) });
    current = String(refreshed.markdown || current);
    working.set(path, current);
  }

  const replacements = orderedPaths
    .map((path) => {
      const original = String(recordByPath.get(path)?.markdown || '');
      const replacementMarkdown = String(working.get(path) || original);
      if (replacementMarkdown === original) return null;
      return freeze({ path, sourceSha256: sha256Hex(new TextEncoder().encode(original)), replacementMarkdown });
    })
    .filter(Boolean);
  if (!replacements.length) return freeze({ state: 'unavailable', replacements: Object.freeze([]) });

  const qualified = qualifyReferenceRepairChangeset(records, replacements, lineageInspection);
  if (qualified.state !== 'qualified') return freeze({ state: 'blocked', reason: qualified.reason || 'changeset-unqualified', replacements: Object.freeze([]) });
  return freeze({ state: 'ready', replacements: Object.freeze(replacements), focusReplacement: String(working.get(focusPath) || focusRepair.markdown || '') });
}

function qualifyReferenceRepairChangeset(records = [], replacements = [], beforeLineage = null) {
  const replacementByPath = new Map((replacements || []).map((item) => [norm(item.path || ''), item]));
  const replacedRecords = (records || []).map((item) => {
    const replacement = replacementByPath.get(norm(item.path || item.id || ''));
    return replacement ? { ...item, markdown: replacement.replacementMarkdown } : item;
  });
  for (const replacement of replacements || []) {
    const path = norm(replacement.path || '');
    const beforeRecord = (records || []).find((item) => norm(item.path || item.id || '') === path);
    const afterRecord = replacedRecords.find((item) => norm(item.path || item.id || '') === path);
    if (!beforeRecord || !afterRecord) return freeze({ state: 'blocked', reason: `record-unavailable:${path}` });
    const beforeAudit = auditPortableRecord(beforeRecord, { requireExactSchemaAuthority: true });
    const afterAudit = auditPortableRecord(afterRecord, { requireExactSchemaAuthority: true });
    const beforeWarnings = new Set((beforeAudit.findings || []).filter((item) => item.severity === 'warning').map((item) => String(item.code || '')));
    const blocker = (afterAudit.findings || []).find((item) => item.severity === 'error' || (item.severity === 'warning' && !beforeWarnings.has(String(item.code || ''))));
    if (blocker) return freeze({ state: 'blocked', reason: `audit:${path}:${String(blocker.code || '')}` });
  }
  const afterLineage = inspectPortableLineageIntegrity({ records: replacedRecords });
  const beforeByPath = new Map((beforeLineage?.artifacts || []).map((item) => [norm(item.path || ''), String(item.state || '')]));
  const afterByPath = new Map((afterLineage?.artifacts || []).map((item) => [norm(item.path || ''), String(item.state || '')]));
  for (const replacement of replacements || []) {
    const path = norm(replacement.path || '');
    const before = beforeByPath.get(path) || '';
    const after = afterByPath.get(path) || '';
    if (after === 'healthy' || after === before) continue;
    return freeze({ state: 'blocked', reason: `lineage:${path}:${before || 'unavailable'}->${after || 'unavailable'}` });
  }
  return freeze({ state: 'qualified' });
}

function refreshLoadedParentDigest(childMarkdown = '', parentMarkdown = '') {
  const parentSelf = canonicalC14nV2SelfState(String(parentMarkdown || ''));
  if (parentSelf.state !== 'verified' || !parentSelf.declaredValue) return freeze({ state: 'unavailable', markdown: childMarkdown });
  const lines = String(childMarkdown || '').replace(/\r\n?/g, '\n').split('\n');
  const index = primaryParentIntegrityValueLine(lines);
  if (index < 0) return freeze({ state: 'unavailable', markdown: childMarkdown });
  const match = lines[index].match(/^(\s*-\s+Value\s*:\s*)(.*)$/i);
  if (!match) return freeze({ state: 'unavailable', markdown: childMarkdown });
  const prior = String(match[2] || '').trim();
  if (prior === parentSelf.declaredValue) {
    const self = canonicalC14nV2SelfState(lines.join('\n'));
    if (self.state === 'verified') return freeze({ state: 'unchanged', markdown: lines.join('\n') });
  }
  lines[index] = `${match[1]}${parentSelf.declaredValue}`;
  const sealed = sealC14nV2Self(lines.join('\n'));
  if (sealed.state !== 'sealed' && sealed.state !== 'unchanged') return freeze({ state: 'unavailable', markdown: childMarkdown });
  return freeze({ state: prior === parentSelf.declaredValue ? 'unchanged' : 'ready', markdown: String(sealed.markdown || lines.join('\n')) });
}

function isBareSchemaId(value = '') {
  return /^tiinex(?:\.[A-Za-z0-9_-]+)+\.v\d+$/.test(String(value || '').trim());
}

function normalizeMarkdownBytes(value = '') {
  return String(value || '').replace(/\r\n?/g, '\n');
}

function relativePortableReference(fromPath = '', toPath = '') {
  const from = norm(fromPath).split('/').filter(Boolean);
  const to = norm(toPath).split('/').filter(Boolean);
  if (!from.length || !to.length) return '';
  from.pop();
  let common = 0;
  while (common < from.length && common < to.length && from[common] === to[common]) common += 1;
  const relative = [...Array(from.length - common).fill('..'), ...to.slice(common)].join('/');
  if (!relative) return './';
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function referenceResolutionsForRecord(resolutions = [], record = {}) {
  const recordPath = norm(record.path || record.id || '');
  return (Array.isArray(resolutions) ? resolutions : []).filter((item) => {
    const itemPath = norm(item?.path || '');
    return !itemPath || itemPath === recordPath;
  });
}

function projectReferenceResolutionAssistance(markdown = '', resolutions = []) {
  const source = String(markdown || '');
  if (!source || !Array.isArray(resolutions) || !resolutions.length) return freeze({ diagnostics: [], actions: [] });
  const byTarget = new Map(resolutions.map((item) => [String(item?.target || '').trim(), item]).filter(([target]) => Boolean(target)));
  const references = versionBearingGitHubReferences(source).filter((item) => byTarget.has(item.target));
  const diagnostics = [];
  const actions = [];
  for (const reference of references) {
    const fact = byTarget.get(reference.target) || {};
    const exact = fact.exact || {};
    const latest = fact.latest || {};
    const exactState = String(exact.state || 'unavailable');
    const latestState = String(latest.state || 'unavailable');
    const exactSha = String(exact.sha256 || '');
    const latestSha = String(latest.sha256 || '');
    const latestTarget = String(latest.target || '').trim();
    let diagnostic = null;
    let actionTitle = '';
    if (exactState === 'missing') {
      diagnostic = {
        severity: 'error',
        code: 'reference.permalink.unresolved',
        message: `${reference.field} permalink does not resolve at its declared revision.`,
        params: { field: reference.field, line: reference.line }
      };
      if (latestState === 'resolved' && latestTarget) actionTitle = `Repair ${reference.field} permalink to latest`;
    } else if (exactState === 'unavailable') {
      diagnostic = {
        severity: 'warning',
        code: 'reference.permalink.verification-unavailable',
        message: `${reference.field} permalink could not be verified from the current host.`,
        params: { field: reference.field, line: reference.line }
      };
      if (latestState === 'resolved' && latestTarget) actionTitle = `Use latest ${reference.field} permalink`;
    } else if (exactState === 'resolved' && latestState === 'resolved' && exactSha && latestSha && exactSha !== latestSha) {
      diagnostic = {
        severity: 'warning',
        code: 'reference.permalink.stale',
        message: `${reference.field} permalink resolves, but master contains different bytes.`,
        params: { field: reference.field, line: reference.line }
      };
      if (latestTarget) actionTitle = `Upgrade ${reference.field} permalink to latest`;
    }
    if (diagnostic) diagnostics.push(projectDiagnostic(diagnostic, source));
    if (!actionTitle || !latestTarget || latestTarget === reference.target) continue;
    const replacement = replaceReferenceTargetAtLine(source, reference, latestTarget);
    if (!replacement || replacement === source) continue;
    const sealed = sealIfSelfIntegrityPresent(replacement);
    if (sealed.state === 'blocked') continue;
    const replacementMarkdown = sealed.markdown;
    actions.push(freeze({
      id: `upgrade-permalink-${reference.field.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${reference.line}`,
      title: actionTitle,
      kind: 'replace-document',
      qualification: 'deterministic-shared-core+explicit-host-resolution',
      sourceSha256: sha256Hex(new TextEncoder().encode(source)),
      replacementMarkdown,
      diagnosticCodes: diagnostic ? [diagnostic.code] : [],
      boundary: 'Uses explicit host-provided resolution evidence for the exact declared GitHub permalink and master candidate. A newer master revision is only offered as an operator-selected Quick Fix; it does not silently replace version-bearing source authority.'
    }));
  }
  return freeze({ diagnostics, actions });
}

function versionBearingGitHubReferences(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const refs = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = String(lines[index] || '');
    const fieldMatch = line.match(/^\s*-\s+(Envelope Schema|Parent Schema|Current Schema)\s*:\s*\[[^\]]+\]\((https:\/\/github\.com\/[^)]+\/blob\/[^)]+)\)\s*$/i);
    if (fieldMatch) refs.push({ field: fieldMatch[1], target: fieldMatch[2], line: index + 1 });
    if (/^\s*-\s+\[sha256-base64url-c14n-v2\]\(/.test(line)) {
      const methodMatch = line.match(/^\s*-\s+\[sha256-base64url-c14n-v2\]\((https:\/\/github\.com\/[^)]+\/blob\/[^)]+)\)\s*$/i);
      if (methodMatch) refs.push({ field: 'Integrity method', target: methodMatch[1], line: index + 1 });
    }
  }
  return refs;
}

function replaceReferenceTargetAtLine(markdown = '', reference = {}, latestTarget = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const index = Number(reference.line || 0) - 1;
  if (index < 0 || index >= lines.length) return '';
  if (!lines[index].includes(reference.target)) return '';
  lines[index] = lines[index].replace(reference.target, latestTarget);
  return lines.join('\n');
}

function sealIfSelfIntegrityPresent(markdown = '') {
  const state = canonicalC14nV2SelfState(markdown);
  if (state.state === 'unavailable') return freeze({ state: 'ready', markdown: String(markdown || '') });
  if (!['verified', 'mismatch', 'prepared'].includes(state.state)) return freeze({ state: 'blocked', markdown: String(markdown || '') });
  const sealed = sealC14nV2Self(markdown);
  return sealed.state === 'sealed' ? freeze({ state: 'ready', markdown: sealed.markdown }) : freeze({ state: 'blocked', markdown: String(markdown || '') });
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
  const code = String(finding.code || '');

  // Integrity findings often carry the generic field name `Value`. That field
  // appears once per integrity relation, so resolve semantically-owned relation
  // locations before generic field lookup.
  if (code === 'portable.lineage-integrity.parent-target-mismatch') {
    const parentValueIndex = primaryParentIntegrityValueLine(lines);
    if (parentValueIndex >= 0) return locatedLine(lines, parentValueIndex, 'deterministic', 'continuity-integrity-primary-parent-value');
  }
  if (code === 'integrity.c14n-v2.mismatch' || code === 'integrity.c14n-v2.ambiguous' || code === 'portable.lineage-integrity.child-self-mismatch' || code === 'portable.lineage-integrity.child-self-unavailable') {
    const selfValueIndex = primarySelfIntegrityValueLine(lines);
    if (selfValueIndex >= 0) return locatedLine(lines, selfValueIndex, 'deterministic', 'continuity-integrity-primary-self-value');
  }
  if (code === 'integrity.method-reference.unqualified') {
    const headingIndex = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    const methodIndex = lines.findIndex((line, index) => index > headingIndex && /^\s*-\s+\[sha256-base64url-c14n-v2\]\([^)]+\)\s*$/.test(line));
    if (methodIndex >= 0) return locatedLine(lines, methodIndex, 'deterministic', 'continuity-integrity-method-reference');
  }

  const explicitLine = Number(params.line || 0);
  if (Number.isInteger(explicitLine) && explicitLine > 0) return locatedLine(lines, explicitLine - 1, 'deterministic', 'explicit-resolution-line');

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
  if (code.includes('schema.') || code.endsWith('.schema.mismatch') || code === 'audit.schema-authority.unqualified') {
    const index = lines.findIndex((line) => /^\s*-\s+Current Schema\s*:/.test(line));
    if (index >= 0) return locatedLine(lines, index, 'deterministic', 'current-schema-field');
  }
  if (code.includes('integrity') || /integrity|checksum|digest/i.test(String(finding.message || ''))) {
    const headingIndex = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    if (headingIndex >= 0) {
      const selfValueIndex = primarySelfIntegrityValueLine(lines);
      if (selfValueIndex >= 0 && /self-integrity|canonical artifact bytes|child-self/i.test(String(finding.message || ''))) return locatedLine(lines, selfValueIndex, 'deterministic', 'continuity-integrity-primary-self-value');
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

function primaryParentIntegrityValueLine(lines = []) {
  const headingIndex = lines.findIndex((line) => String(line || '').trim() === '# Continuity Integrity');
  if (headingIndex < 0) return -1;
  let parentTowards = -1;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = String(lines[index] || '');
    if (index > headingIndex + 1 && /^#\s+/.test(line)) break;
    const towards = line.match(/^\s+-\s+Towards\s*:\s*(.+?)\s*$/i);
    if (towards) {
      parentTowards = String(towards[1] || '').trim().toLowerCase() === 'self' ? -1 : index;
      continue;
    }
    if (parentTowards >= 0 && /^\s+-\s+Value\s*:/.test(line)) return index;
    if (parentTowards >= 0 && /^-\s+/.test(line)) parentTowards = -1;
  }
  return -1;
}

function primarySelfIntegrityValueLine(lines = []) {
  const headingIndex = lines.findIndex((line) => String(line || '').trim() === '# Continuity Integrity');
  if (headingIndex < 0) return -1;
  let selfTowards = -1;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = String(lines[index] || '');
    if (index > headingIndex + 1 && /^#\s+/.test(line)) break;
    if (/^\s+-\s+Towards\s*:\s*self\s*$/i.test(line)) { selfTowards = index; continue; }
    if (selfTowards >= 0 && /^\s+-\s+Value\s*:/.test(line)) return index;
    if (selfTowards >= 0 && /^-\s+/.test(line)) selfTowards = -1;
  }
  return -1;
}

function deterministicParentIntegrityRepair(markdown = '', artifact = null) {
  const source = String(markdown || '');
  if (!source || !artifact || artifact.state !== 'parent-target-mismatch') return freeze({ state: 'unavailable' });
  if (String(artifact?.parentTarget?.reason || '') !== 'target-self-digest-mismatch') return freeze({ state: 'unavailable' });
  if (artifact?.parentAvailability?.state !== 'resolved' || artifact?.parentPrimarySelf?.state !== 'verified') return freeze({ state: 'unavailable' });
  const declaredTarget = String(artifact?.parentTarget?.declaredTarget || '').trim();
  const expectedTarget = String(artifact?.exactParent?.expectedIntegrityTarget || '').trim();
  const digest = String(artifact?.repairCandidate?.candidateTargetDigest || artifact?.parentPrimarySelf?.value || '').trim();
  if (!declaredTarget || !expectedTarget || declaredTarget !== expectedTarget || !digest) return freeze({ state: 'unavailable' });

  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const headingIndex = lines.findIndex((line) => String(line || '').trim() === '# Continuity Integrity');
  if (headingIndex < 0) return freeze({ state: 'unavailable' });
  let targetMatched = false;
  let changed = false;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = String(lines[index] || '');
    if (index > headingIndex + 1 && /^#\s+/.test(line)) break;
    const towards = line.match(/^\s+-\s+Towards\s*:\s*(?:\[[^\]]+\]\(([^)]+)\)|(\S.*))\s*$/i);
    if (towards) {
      const value = String(towards[1] || towards[2] || '').trim();
      targetMatched = value === declaredTarget;
      continue;
    }
    if (targetMatched && /^(\s+-\s+Value\s*:\s*)(.*)$/.test(line)) {
      const match = line.match(/^(\s+-\s+Value\s*:\s*)(.*)$/);
      lines[index] = `${match?.[1] || '  - Value: '}${digest}`;
      changed = String(match?.[2] || '').trim() !== digest;
      break;
    }
  }
  if (!changed) return freeze({ state: 'unavailable' });
  const sealed = sealC14nV2Self(lines.join('\n'));
  if (sealed.state !== 'sealed' && sealed.state !== 'unchanged') return freeze({ state: 'unavailable' });
  return freeze({ state: 'ready', markdown: String(sealed.markdown || lines.join('\n')) });
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
    'integrity.c14n-v2.ambiguous',
    'portable.lineage-integrity.child-self-mismatch',
    'portable.lineage-integrity.child-self-unavailable'
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
