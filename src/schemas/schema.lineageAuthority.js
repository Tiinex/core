export const SCHEMA_LINEAGE_SOURCE_AUTHORITY_QUALIFICATION_SCHEMA_ID = 'tiinex.core.schema-lineage-source-authority-qualification.v1';

export function qualifyCompiledSchemaLineageSourceAuthority(validationContract = {}) {
  const lineage = Array.isArray(validationContract?.lineage) ? validationContract.lineage.map((item) => String(item || '').trim()) : [];
  const projected = Array.isArray(validationContract?.lineageAuthority) ? validationContract.lineageAuthority : [];
  const findings = [];
  const edges = [];

  if (!lineage.length || validationContract?.lineageQualification?.state !== 'valid') {
    findings.push('Compiled validation lineage is unavailable or not valid.');
  }
  if (projected.length !== lineage.length) {
    findings.push(`Compiled validation lineage source authority cardinality is ${projected.length}; expected ${lineage.length}.`);
  }

  const count = Math.min(projected.length, lineage.length);
  for (let index = 0; index < count; index += 1) {
    const entry = projected[index] || {};
    const expectedSchemaId = lineage[index] || '';
    const actualSchemaId = String(entry?.schemaId || '').trim();
    if (!actualSchemaId || actualSchemaId !== expectedSchemaId) {
      findings.push(`Compiled lineage source authority identity mismatch at index ${index}: expected ${expectedSchemaId || '(missing schema id)'} but observed ${actualSchemaId || '(missing schema id)'}.`);
    }
  }

  for (let index = 1; index < count; index += 1) {
    const parent = projected[index - 1] || {};
    const child = projected[index] || {};
    const parentSchemaId = String(parent?.schemaId || '').trim();
    const childSchemaId = String(child?.schemaId || '').trim();
    const declaredParentSchemaId = String(child?.parentSchemaId || '').trim();
    const parentSource = normalizeSourceTuple(parent?.source || {});
    const candidates = Object.freeze((Array.isArray(child?.parentSourceCandidates) ? child.parentSourceCandidates : []).map(normalizeSourceTuple));

    if (!declaredParentSchemaId || declaredParentSchemaId !== parentSchemaId) {
      findings.push(`Compiled lineage identity is incoherent across ${parentSchemaId || '(unknown parent)'} -> ${childSchemaId || '(unknown child)'}.`);
      edges.push(freezeEdge({ state: 'contradictory', parentSchemaId, childSchemaId, actual: parentSource, candidates, reason: 'parent-schema-identity-mismatch' }));
      continue;
    }

    if (isQualifiedLocalUnpublishedSchemaSource(parent?.source || {})) {
      edges.push(freezeEdge({ state: 'qualified-local-supersession', parentSchemaId, childSchemaId, actual: parentSource, candidates, reason: 'qualified-local-unpublished-parent-authority' }));
      continue;
    }

    const exactCandidates = candidates.filter(completeSourceTuple);
    if (candidates.length !== 1 || exactCandidates.length !== 1) {
      const reason = candidates.length > 1 ? 'ambiguous-parent-source-authority' : 'parent-source-authority-unavailable';
      findings.push(candidates.length > 1
        ? `Declared parent source authority is ambiguous for ${childSchemaId}: ${candidates.length} exact pinned candidates.`
        : `Declared parent source authority is unavailable for ${childSchemaId} -> ${parentSchemaId}.`);
      edges.push(freezeEdge({ state: 'unresolved', parentSchemaId, childSchemaId, actual: parentSource, candidates, reason }));
      continue;
    }

    const expected = exactCandidates[0];
    if (!sameSourceTuple(parentSource, expected)) {
      findings.push(`Compiled lineage substitutes source authority for ${childSchemaId} -> ${parentSchemaId}: declared ${formatSource(expected)} but compiled ${formatSource(parentSource)}.`);
      edges.push(freezeEdge({ state: 'contradictory', parentSchemaId, childSchemaId, actual: parentSource, candidates, reason: 'compiled-parent-source-substitution' }));
      continue;
    }

    edges.push(freezeEdge({ state: 'qualified', parentSchemaId, childSchemaId, actual: parentSource, candidates, reason: 'exact-parent-source-match' }));
  }

  const contradictory = edges.some((edge) => edge.state === 'contradictory') || findings.some((finding) => finding.includes('identity mismatch') || finding.includes('identity is incoherent') || finding.includes('substitutes source authority'));
  const unresolved = !contradictory && (findings.length > 0 || edges.some((edge) => edge.state === 'unresolved'));
  const state = contradictory ? 'contradictory' : unresolved ? 'unresolved' : 'qualified';
  return deepFreeze({
    schema: SCHEMA_LINEAGE_SOURCE_AUTHORITY_QUALIFICATION_SCHEMA_ID,
    state,
    complete: state === 'qualified',
    lineage: Object.freeze([...lineage]),
    edges: Object.freeze(edges),
    findings: Object.freeze(findings),
    boundary: 'Exact runtime validation authority requires source-coherent compiled inheritance. Qualified local unpublished Parent authority may intentionally supersede published Parent locators; all other inheritance edges require one exact declared Parent source tuple matching the compiled Parent material.'
  });
}

export function isQualifiedLocalUnpublishedSchemaSource(source = {}) {
  return String(source?.publicationState || '').trim().toLowerCase() === 'accepted-local-unpublished'
    && String(source?.snapshotCompleteness || '').trim() === 'exact-axiom-canonical-unpublished-bounded-workspace-contract';
}

function normalizeSourceTuple(value = {}) {
  return Object.freeze({
    repository: String(value?.repository || '').trim(),
    commit: String(value?.commit || '').trim().toLowerCase(),
    path: String(value?.path || '').trim()
  });
}

function completeSourceTuple(value = {}) {
  return Boolean(value.repository && /^[0-9a-f]{40}$/.test(value.commit) && value.path);
}

function sameSourceTuple(left = {}, right = {}) {
  return left.repository === right.repository && left.commit === right.commit && left.path === right.path;
}

function formatSource(value = {}) {
  return `${value.repository || '(unknown repo)'}@${value.commit || '(unknown commit)'}/${value.path || '(unknown path)'}`;
}

function freezeEdge(value = {}) {
  return Object.freeze({
    state: String(value.state || 'unresolved'),
    parentSchemaId: String(value.parentSchemaId || ''),
    childSchemaId: String(value.childSchemaId || ''),
    actual: value.actual || Object.freeze({ repository: '', commit: '', path: '' }),
    candidates: value.candidates || Object.freeze([]),
    reason: String(value.reason || '')
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
