import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { classifyParentRecoveryReference, isQualifiedVersionStableParentRecoveryReference } from '../../../lineage/parentRecoveryReference.js';
import { buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { inspectPortableHistoricalSchemaSource } from '../schema/schema.historicalSource.inspect.js';
import { portableRuntimeValidationContractForSchema } from '../schema/qualifiedLocalRoot.runtime.js';
import { schemaReferenceAuthorityForRegisteredSchema } from '../../../schemas/creation.schemaReferences.js';
import { qualifySchemaReferenceMaterialCoherence } from '../../../schemas/schema.reference.js';

export const PORTABLE_AUTHORING_PARENT_SCHEMA_ID = 'tiinex.portable.authoring-parent.v1';

export function projectPortableAuthoringParent(input = {}) {
  const records = normalizeRecords(input);
  if (records.length !== 1) return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.exactly-one-required', message: 'Authoring Parent projection requires exactly one local text artifact.' }], operationBoundary: boundary() });
  const record = records[0];
  let parsed;
  try { parsed = parseArtifactMarkdown(record.markdown); }
  catch { return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.parse-failed', message: 'Selected Parent bytes are not a readable Tiinex artifact.' }], operationBoundary: boundary() }); }
  // A historical pinned Current Schema is not authority merely because its
  // URL looks immutable. Independent provider-backed exact byte equivalence
  // may qualify the current registered semantics WITHOUT editing historical
  // bytes. Distinct historical versions stay blocked and require migration.
  const pinnedSchema=String(parsed.envelope?.current?.schema?.target || '');
  const historical = input.historicalSchemaSource || /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/blob\/[0-9a-f]{40}\/\.topics\/\.schemas\//i.test(pinnedSchema)
    ? inspectPortableHistoricalSchemaSource({ ...(input.historicalSchemaSource || {}), markdown: record.markdown }) : null;
  const registeredSchemaId=String(parsed.envelope?.current?.schema?.id || '');
  const schemaTarget=String(parsed.envelope?.current?.schema?.target || '');
  let equivalentAuthority=null;
  if(historical?.status==='byte-equivalent' && historical.source?.schemaId===registeredSchemaId &&
     historical.source?.target===schemaTarget && historical.historicalMaterial?.sha256===historical.localCurrentMaterial?.sha256 &&
     historical.historicalMaterial?.gitBlobSha===historical.localCurrentMaterial?.gitBlobSha) {
    const runtime=portableRuntimeValidationContractForSchema(registeredSchemaId);
    const baseline=schemaReferenceAuthorityForRegisteredSchema(registeredSchemaId);
    const semantic=baseline.semanticMaterialIdentity||{};
    if(runtime.state==='qualified' && semantic.state==='qualified' &&
       semantic.sha256===historical.localCurrentMaterial.sha256 &&
       semantic.sourceBlobSha===historical.localCurrentMaterial.gitBlobSha &&
       semantic.bytes===historical.localCurrentMaterial.bytes &&
       semantic.sourceRepository===historical.source.repository &&
       semantic.sourcePath===historical.source.path) {
      const candidate={...baseline,exactTargets:[schemaTarget],preferredTarget:schemaTarget,
        targetAuthority:'historical-immutable-exact-byte-equivalence',resolutionState:'qualified',
        resolutionEvidence:{state:'qualified',target:schemaTarget,
          evidenceKind:'accepted-repository-read-byte-equivalence',materialIdentity:{...semantic}}};
      if(qualifySchemaReferenceMaterialCoherence(candidate).state==='qualified')
        equivalentAuthority={reference:candidate,validation:{...runtime,schemaId:registeredSchemaId,
          currentReference:{state:'qualified',basis:'accepted-repository-read-byte-equivalence',target:schemaTarget}}};
    }
  }
  const audit = auditPortableRecord({ ...record, title: parsed.title, schemaId: parsed.envelope?.current?.schema?.id, currentSchemaId: parsed.envelope?.current?.schema?.id, parent: parsed.envelope?.parent }, { requireExactSchemaAuthority: true,
    ...(equivalentAuthority?{schemaValidationAuthority:equivalentAuthority.validation,
      schemaReferenceAuthorities:{current:equivalentAuthority.reference}}:{}) });
  const auditErrors = (audit.findings || []).filter((item) => item.severity === 'error');
  const historicalParentRecoveryDebt = auditErrors.length > 0 && auditErrors.every((item) => String(item.code || '') === 'root.parent.recovery.workspace-qualified.malformed');
  const selfIntegrity = canonicalC14nV2SelfState(record.markdown || '');
  const directParentUsableWithHistoricalDebt = historicalParentRecoveryDebt
    && audit.qualification?.exact === true
    && audit.schemaValidationAuthority?.state === 'qualified'
    && selfIntegrity.state === 'verified';
  if ((audit.status !== 'readable' && !directParentUsableWithHistoricalDebt) || audit.qualification?.exact !== true || (auditErrors.length && !directParentUsableWithHistoricalDebt)) {
    const sourceCodes = [...new Set(auditErrors.map(item => String(item.code || '')).filter(Boolean))].slice(0, 6);
    const sourceAuthority = String(audit.schemaValidationAuthority?.state || 'unknown');
    const unavailable = sourceAuthority !== 'qualified';
    return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{
      severity: 'error', code: 'portable.authoring-parent.unqualified',
      message: unavailable
        ? 'Selected Parent is readable but its exact schema authority is unqualified. A historical GitHub schema URL is not proof of current local schema authority. Review the declared Current Schema and use a Core-qualified repair; child-of-Evidence is not categorically forbidden.'
        : 'Selected Parent failed the exact Core audit. Inspect the cited audit findings before authoring a child.',
      sourceSchemaAuthority: sourceAuthority, sourceFindingCodes: sourceCodes,
      remediation: historical?.status==='historical-distinct'
        ? 'Historical pinned schema bytes differ from current compiled material. Preserve existing Evidence and seek exact historical validation or explicit descendant-aware migration; do not silently promote.'
        : unavailable ? 'Qualify the Parent Current Schema source and integrity; use the read-only GitHub repository-read connector or another accepted exact pinned source receipt where available.' : 'Resolve the exact Parent audit findings and retry.'
    }],
      ...(historical ? { historicalSourceRecovery: {status:historical.status,source:historical.source,hostAction:historical.hostAction,
        next:historical.next,boundary:historical.boundary} } : {}),
      operationBoundary: boundary() });
  }
  const schemaId = String(parsed.envelope?.current?.schema?.id || audit.schemaId || '');
  const createdAt = String(parsed.envelope?.current?.createdAt || audit.artifact?.createdAt || '');
  const explicitReference = String(input.reference || '').trim();
  const projectedPath = explicitReference || String(record.path || record.id || '');
  const referenceClassification = classifyParentRecoveryReference(projectedPath);
  if (referenceClassification.kind === 'malformed-workspace-qualified') return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.reference.malformed', message: 'Selected Parent reference is malformed and cannot be used for native authoring.' }], operationBoundary: boundary() });
  const publishedReference = String(input.publishedReference || input.parentPublishedReference || input.browseGitReference || '').trim();
  if (referenceClassification.kind === 'workspace-qualified' && !isQualifiedVersionStableParentRecoveryReference(publishedReference)) return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.published-reference.required', message: 'A Workspace-qualified Parent selector is runtime/material addressing only. Persisted cross-Workspace continuation requires an explicit qualified version-stable Parent recovery locator.' }], operationBoundary: boundary() });
  const recoveryMode = referenceClassification.kind === 'workspace-qualified' ? 'external-versioned' : 'local-relative';
  const canonicalCurrent = buildArtifactCreationContract({ schemaId, transitionType: 'continue-from-record' })?.schemaReferences?.current || null;
  const canonicalTargets = new Set([...(canonicalCurrent?.exactTargets || []), String(canonicalCurrent?.preferredTarget || '')].filter(Boolean));
  const schemaReferenceQualified = Boolean(schemaTarget && canonicalCurrent?.resolutionState === 'qualified' && canonicalTargets.has(schemaTarget));
  const schemaReferenceAuthority = equivalentAuthority?.reference || (schemaReferenceQualified
    ? { ...canonicalCurrent, preferredTarget: schemaTarget, resolutionState: 'qualified', resolutionEvidence: { ...(canonicalCurrent?.resolutionEvidence || {}), basis: 'declared-parent-target-exact-canonical-match' } }
    : { schemaId, preferredTarget: schemaTarget, exactTargets: schemaTarget ? [schemaTarget] : [], resolutionState: 'unresolved', evidence: { basis: 'declared-current-schema-reference-only' } });
  return freeze({
    schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID,
    status: 'ready',
    parentRecord: {
      id: projectedPath, path: projectedPath, schemaId, currentSchemaId: schemaId, currentCreatedAt: createdAt, createdAt, recoveryMode, relativeReference: '',
      ...(recoveryMode === 'external-versioned' ? { publishedReference: { target: publishedReference, state: 'qualified', resolutionState: 'qualified' } } : {}),
      markdown: record.markdown, sourceMode: String(record.sourceMode || 'portable-node-local'),
      schemaReferenceAuthority
    },
    findings: [ ...(equivalentAuthority?[{severity:'info',code:'portable.authoring-parent.historical-schema-exact-equivalence',message:'An accepted immutable repository read proved exact historical schema bytes equivalent to registered current validation material; Parent bytes and pinned locator were preserved.'}]:[]), ...(directParentUsableWithHistoricalDebt ? [{ severity: 'warning', code: 'portable.authoring-parent.historical-ancestor-recovery-debt', message: 'Selected Parent has historical malformed Workspace-qualified recovery references to its own ancestor. Direct child authoring is allowed from the Parent exact current bytes and verified self integrity; that ancestor debt is not repaired, inherited, or upgraded.' }] : []) ],
    operationBoundary: boundary(),
    boundary: directParentUsableWithHistoricalDebt
      ? 'Projects exact supplied Parent current bytes for direct continuation while preserving unresolved historical ancestor-recovery debt on the Parent itself. The child does not inherit or repair that ancestor locator.'
      : 'Projects exact supplied Parent bytes and declared current schema locator into shared draft-authoring input. A declared schema locator remains unresolved and is not upgraded to publication or canonical reference authority.'
  });
}

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function boundary() { return { sourceMutation: false, remoteWrite: false, authoring: false }; }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
