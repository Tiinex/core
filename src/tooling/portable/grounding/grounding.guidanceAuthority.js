import { posix } from 'node:path';
import { sha256Hex } from '../../../export/package.bytes.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';

const MAX_ITEMS = 12;
const MAX_SECTIONS = 8;
const GUIDANCE_HINT = /(?:process|policy|guidance|procedure|runbook|governance|operating\s+contract|adoption\s+decision)/iu;

export function projectGroundingGuidanceAuthority({ authority = null, requiredContext = [], records = [], topology = {} } = {}) {
  const currentTargets = currentWorkTargets(authority, topology);
  const selected = selectedRequiredContextRecords(requiredContext, records);
  const resolutionRecords = mergeResolutionRecords(records, selected.map((item) => item.record));
  const selectedPaths = new Set(selected.map((item) => String(item.record.path || '')));
  const selectedRelationParentPaths = relationParentPaths(selected);
  const items = [];
  const unresolved = [];
  const linkedMaterialPaths = new Set();
  let selectedRelationCount = 0;
  let selectedMaterialCount = 0;

  for (const selectedItem of selected) {
    const record = selectedItem.record;
    if (String(record.schemaId || '') !== 'tiinex.relation.v1') continue;
    const relationItem = relationGuidanceItem(selectedItem, resolutionRecords, selected, currentTargets);
    if (!relationItem) continue;
    selectedRelationCount += 1;
    items.push(relationItem);
    unresolved.push(...relationItem.unresolved);
    for (const linked of relationItem.linkedSelectedAuthority || []) linkedMaterialPaths.add(String(linked.path || ''));
  }

  for (const selectedItem of selected) {
    const record = selectedItem.record;
    if (String(record.schemaId || '') === 'tiinex.relation.v1') continue;
    if (selectedRelationParentPaths.has(String(record.path || ''))) continue;
    if (!looksLikeGuidanceRequirement(selectedItem.requirement, record)) continue;
    selectedMaterialCount += 1;
    if (linkedMaterialPaths.has(String(record.path || ''))) continue;
    items.push(materialOnlyGuidanceItem(selectedItem));
  }

  const incompleteRelation = items.some((item) => String(item.state || '') === 'selected-relation-authority-incomplete');
  const state = incompleteRelation
    ? 'selected-guidance-authority-incomplete'
    : selectedRelationCount
      ? 'qualified-forward-selected-guidance-authority'
      : selectedMaterialCount
        ? 'selected-guidance-material-applicability-unresolved'
        : 'not-declared';

  return Object.freeze({
    state,
    items: Object.freeze(items.slice(0, MAX_ITEMS)),
    selectedRelationCount,
    selectedMaterialCount,
    unresolved: Object.freeze(unresolved.slice(0, MAX_ITEMS)),
    boundary: 'Forward-selection projection only. Required Context supplies discoverability/material closure; package placement does not create applicability. Tooling never reverse-scans Relation inventory, normalizes arbitrary Relation labels into global semantics, upgrades applicability into requiredness/execution/ownership/completion, or evaluates free-text process/policy conditions into a current step.'
  });
}

function relationGuidanceItem(selectedItem, records, selectedItems, currentTargets) {
  const record = selectedItem.record;
  const relation = parseRelation(record);
  const selectedByPath = new Map(selectedItems.map((item) => [String(item.record?.path || ''), item]));
  const resolvedTargets = relation.targets.map((target) => Object.freeze({
    ...target,
    resolvedTarget: resolveReference(target.target, String(record.path || ''))
  })).filter((target) => target.resolvedTarget);
  const currentMatches = resolvedTargets.filter((target) => currentTargets.has(target.resolvedTarget));
  if (currentTargets.size && currentMatches.length !== 1) return null;
  const currentBinding = currentMatches[0] || resolvedTargets[0] || null;
  if (!currentBinding) return null;

  const explicitGuidanceTargets = resolvedTargets.filter((target) => {
    if (target.resolvedTarget === currentBinding.resolvedTarget) return false;
    const candidate = selectedByPath.get(target.resolvedTarget) || null;
    return Boolean(candidate && qualifiedRecord(candidate.record) && looksLikeGuidanceRequirement(candidate.requirement, candidate.record));
  });

  const parentRef = parentTraceTarget(record.markdown || '');
  const parentPath = parentRef ? resolveReference(parentRef, String(record.path || '')) : '';
  const parentRecord = parentPath ? exactRecord(records, parentPath) : null;
  const parentQualified = qualifiedRecord(parentRecord);
  const itemUnresolved = [];
  let linked = [];
  let authority = null;
  let applicabilityBasis = '';

  if (explicitGuidanceTargets.length) {
    linked = explicitGuidanceTargets.map((target) => {
      const selected = selectedByPath.get(target.resolvedTarget);
      return Object.freeze({
        ...authorityArtifact(selected.record),
        selectionBasis: 'exact-selected-required-context-plus-explicit-multi-target-relation'
      });
    });
    authority = authorityArtifact(record);
    applicabilityBasis = 'exact-qualified-multi-target-relation-binds-selected-guidance-to-current-work';
  } else {
    if (!parentRef) itemUnresolved.push(Object.freeze({ code: 'selected-guidance-relation-parent-authority-not-declared' }));
    else if (!parentQualified) itemUnresolved.push(Object.freeze({ code: 'selected-guidance-relation-parent-authority-not-qualified', reference: parentRef, resolvedPath: parentPath }));
    linked = parentQualified ? forwardLinkedSelectedAuthority(parentRecord, records, selectedItems) : [];
    authority = parentQualified ? authorityArtifact(parentRecord) : null;
    applicabilityBasis = itemUnresolved.length ? '' : 'exact-qualified-relation-targets-current-work';
  }

  const processOwnedSections = linked.flatMap((item) => item.candidateSections || []);
  const parentSections = authority ? candidateGuidanceSections(authorityRecordForSections(authority, record, parentRecord)) : [];
  const candidateSections = processOwnedSections.length ? processOwnedSections : parentSections;

  return Object.freeze({
    state: itemUnresolved.length ? 'selected-relation-authority-incomplete' : 'qualified-forward-selected-relation-authority',
    selector: selectorProjection(selectedItem.requirement, 'selected-handoff-required-context-forward-selection'),
    relation: Object.freeze({
      relationType: relation.relationType,
      direction: relation.direction,
      scope: relation.scope,
      target: currentBinding.target,
      resolvedTarget: currentBinding.resolvedTarget,
      targets: Object.freeze(resolvedTargets),
      sourceArtifact: sourceArtifact(record)
    }),
    authorityArtifact: authority,
    linkedSelectedAuthority: Object.freeze(linked),
    dimensions: Object.freeze({
      availability: Object.freeze({ state: 'qualified', basis: 'exact-selected-required-context-relation-material', sourceArtifact: sourceArtifact(record) }),
      applicability: Object.freeze({
        state: itemUnresolved.length ? 'unresolved' : 'qualified-relation-binding',
        basis: itemUnresolved.length ? '' : applicabilityBasis,
        relationType: relation.relationType,
        direction: relation.direction,
        scope: relation.scope,
        target: currentBinding.resolvedTarget,
        provenance: itemUnresolved.length ? null : Object.freeze({ relation: sourceArtifact(record), authority: authority ? sourceArtifactLike(authority) : sourceArtifact(record) }),
        boundary: explicitGuidanceTargets.length
          ? 'Tooling projects only exact target co-membership from this selected qualified multi-target Relation: one target must match current work and other targets must be exact selected guidance Required Context. Relation Type prose is preserved but not normalized into global semantics.'
          : 'Tooling projects this exact local Relation instance and target match only. It does not normalize Relation Type text into a global process/policy predicate.'
      }),
      requiredness: unresolvedDimension('No independent qualified obligation/requiredness declaration was projected from this Relation alone.'),
      activeExecution: unresolvedDimension('Applicability does not establish that a process execution/step is currently active.'),
      ownership: unresolvedDimension('Applicability does not assign Role/holder/participant responsibility.'),
      completion: unresolvedDimension('Applicability does not establish process/policy completion or acceptance evidence.')
    }),
    stepSelection: Object.freeze({
      state: candidateSections.length ? 'recipient-interpretation-required' : 'no-selected-procedure-sections-projected',
      candidateSections: Object.freeze(candidateSections.slice(0, MAX_SECTIONS)),
      boundary: 'Candidate sections are exact text owned by forward-selected authority/material. Tooling does not evaluate their triggers/conditions into a current branch or step. The recipient must match qualified current facts against them and must not claim active execution without separate current-work authority.'
    }),
    unresolved: Object.freeze(itemUnresolved)
  });
}

function authorityRecordForSections(authority, relationRecord, parentRecord) {
  if (parentRecord && String(authority?.path || '') === String(parentRecord.path || '')) return parentRecord.markdown || '';
  if (String(authority?.path || '') === String(relationRecord.path || '')) return relationRecord.markdown || '';
  return '';
}
function sourceArtifactLike(value = {}) { return Object.freeze({ workspaceId: String(value.workspaceId || ''), path: String(value.path || ''), sha256: String(value.sha256 || ''), schemaId: String(value.schemaId || '') }); }

function materialOnlyGuidanceItem(selectedItem) {
  const record = selectedItem.record;
  const sections = candidateGuidanceSections(record.markdown || '');
  return Object.freeze({
    state: 'selected-guidance-material-applicability-unresolved',
    selector: selectorProjection(selectedItem.requirement, 'selected-handoff-required-context-material-selection'),
    relation: null,
    authorityArtifact: authorityArtifact(record),
    linkedSelectedAuthority: Object.freeze([]),
    dimensions: Object.freeze({
      availability: Object.freeze({ state: 'qualified', basis: 'exact-selected-required-context-material', sourceArtifact: sourceArtifact(record) }),
      applicability: unresolvedDimension('The exact process/policy/guidance material is forward-selected and readable, but no independently qualified current-scope applicability binding was projected. Required Context membership alone is not applicability.'),
      requiredness: unresolvedDimension('Required Context membership means the material is required to understand/perform the Handoff; it does not prove the selected guidance itself is mandatory.'),
      activeExecution: unresolvedDimension('Selected guidance material does not establish active execution or a current step.'),
      ownership: unresolvedDimension('Selected guidance material does not assign Role/holder/participant responsibility.'),
      completion: unresolvedDimension('Selected guidance material does not establish completion or acceptance.')
    }),
    stepSelection: Object.freeze({
      state: sections.length ? 'recipient-interpretation-required' : 'no-selected-procedure-sections-projected',
      candidateSections: Object.freeze(sections),
      boundary: 'Tooling may expose process/policy-owned Applicability/Trigger/Sequence/Rule sections after exact forward selection, but does not evaluate them into current applicability or a current step.'
    }),
    unresolved: Object.freeze([])
  });
}

function selectedRequiredContextRecords(requiredContext = [], records = []) {
  const out = [];
  for (const requirement of requiredContext || []) {
    if (String(requirement.state || '') !== 'qualified') continue;
    const workspaceId = String(requirement.workspaceId || '').trim();
    const innerPath = String(requirement.innerPath || requirement.workspaceRelativePath || '').replace(/^\/+/, '');
    const direct = workspaceId && innerPath ? `${workspaceId}/${innerPath}` : '';
    const record = (direct ? exactRecord(records, direct) : null) || qualifiedRequiredContextRecord(requirement);
    if (record) out.push(Object.freeze({ requirement, record }));
  }
  return out;
}

function qualifiedRequiredContextRecord(requirement = {}) {
  const content = typeof requirement.content === 'string' ? requirement.content : '';
  if (!content) return null;
  const referenceTarget = String(requirement.referenceTarget || '').trim();
  const innerPath = String(requirement.innerPath || requirement.workspaceRelativePath || '').replace(/^\/+/, '');
  const path = innerPath || syntheticReferencePath(referenceTarget);
  if (!path) return null;
  const derived = createRecordFromMarkdown(content, { path, name: path, sourceMode: 'qualified-required-context' });
  return Object.freeze({
    ...derived,
    id: String(derived.id || path),
    path,
    referenceTarget,
    requiredContextQualification: 'exact-qualified-selected-required-context',
    source: Object.freeze({ ...externalSourceFromReference(referenceTarget), permalink: /^https:\/\/github\.com\//iu.test(referenceTarget) ? referenceTarget : '' })
  });
}

function syntheticReferencePath(reference = '') {
  const parsed = parseExactGitHubReference(reference);
  return parsed ? `github/${parsed.identity}/${parsed.version}/${parsed.path}` : '';
}

function externalSourceFromReference(reference = '') {
  const parsed = parseExactGitHubReference(reference);
  return parsed ? Object.freeze({ adapterId: 'github', identity: parsed.identity, version: parsed.version, path: parsed.path }) : Object.freeze({ adapterId: 'external', path: '' });
}

function parseExactGitHubReference(reference = '') {
  const m = String(reference || '').match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/blob\/([a-f0-9]{40})\/(.+)$/iu);
  if (!m) return null;
  return Object.freeze({ identity: `${m[1]}/${m[2]}`, version: m[3], path: m[4].replace(/^\/+/, '') });
}

function mergeResolutionRecords(records = [], selectedRecords = []) {
  const out = [];
  const seen = new Set();
  for (const record of [...(records || []), ...(selectedRecords || [])]) {
    const key = String(record?.path || '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(record);
  }
  return out;
}

function relationParentPaths(selected = []) {
  const out = new Set();
  const byPath = new Map(selected.map((item) => [String(item.record?.path || ''), item.record]));
  for (const item of selected) {
    const record = item.record || {};
    if (String(record.schemaId || '') !== 'tiinex.relation.v1') continue;
    const ref = parentTraceTarget(record.markdown || '');
    const resolved = ref ? resolveReference(ref, String(record.path || '')) : '';
    if (resolved && byPath.has(resolved)) out.add(resolved);
  }
  return out;
}

function forwardLinkedSelectedAuthority(parentRecord, records, selectedItems) {
  const selectedPaths = new Set(selectedItems.map((item) => String(item.record?.path || '')));
  const byPath = new Map(selectedItems.map((item) => [String(item.record?.path || ''), item]));
  const links = markdownLinkTargets(parentRecord.markdown || '');
  const out = [];
  for (const target of links) {
    const record = exactSelectedRecordForReference(target, String(parentRecord.path || ''), records, selectedPaths);
    if (!qualifiedRecord(record)) continue;
    const selectedItem = byPath.get(String(record.path || '')) || null;
    if (!selectedItem || !looksLikeGuidanceRequirement(selectedItem.requirement, record)) continue;
    out.push(Object.freeze({
      ...authorityArtifact(record),
      selectionBasis: 'exact-parent-authority-forward-link-plus-selected-required-context'
    }));
  }
  return dedupeByPath(out).slice(0, MAX_ITEMS);
}

function exactSelectedRecordForReference(reference = '', ownerPath = '', records = [], selectedPaths = new Set()) {
  const raw = String(reference || '').split('#')[0].trim();
  if (!raw) return null;
  const resolved = resolveReference(raw, ownerPath);
  if (resolved) return selectedPaths.has(resolved) ? exactRecord(records, resolved) : null;
  if (!/^https:\/\/github\.com\//iu.test(raw)) return null;
  const matches = (records || []).filter((record) => selectedPaths.has(String(record.path || '')) && recordExternalReferences(record).includes(raw));
  return matches.length === 1 ? matches[0] : null;
}

function recordExternalReferences(record = {}) {
  const out = new Set();
  for (const value of [record.referenceTarget, record.providerReference, record.sourceReference?.target, record.source?.permalink, record.locator?.referenceTarget]) {
    const text = String(value || '').trim();
    if (text) out.add(text);
  }
  const adapterId = String(record.source?.adapterId || '').trim().toLowerCase();
  const identity = String(record.source?.identity || record.source?.sourceIdentity || '').trim();
  const version = String(record.source?.version || record.source?.sourceVersion || record.source?.commit || '').trim();
  const sourcePath = String(record.source?.path || record.source?.sourcePath || '').replace(/^\/+/, '').trim();
  if (adapterId === 'github' && /^[^/\s]+\/[^/\s]+$/u.test(identity) && /^[a-f0-9]{40}$/iu.test(version) && sourcePath) out.add(`https://github.com/${identity}/blob/${version}/${sourcePath}`);
  return [...out];
}

function looksLikeGuidanceRequirement(requirement = {}, record = {}) {
  const hint = [requirement.name, requirement.material, requirement.purpose, firstHeading(record.markdown || '')].map(String).join(' ');
  return GUIDANCE_HINT.test(hint);
}

function currentWorkTargets(authority = null, topology = {}) {
  const out = new Set();
  for (const item of topology?.currentFrontier || []) {
    for (const value of [item.path, item.resolvedPath, item.id]) {
      const text = String(value || '').replace(/^\/+/, '');
      if (text) out.add(text);
    }
  }
  const handoff = authority?.handoff || {};
  const ownerPath = qualifiedHandoffPath(handoff);
  for (const transfer of handoff.transfers || []) {
    const target = String(transfer.controllingArtifactTarget || '').trim();
    if (!target || !ownerPath) continue;
    const resolved = resolveReference(target, ownerPath);
    if (resolved) out.add(resolved);
  }
  return out;
}

function parseRelation(record = {}) {
  const markdown = String(record.markdown || '');
  const declaration = section(markdown, 'Relation Declaration');
  const targetSection = section(markdown, 'Relation Target');
  const relationType = field(declaration, 'Relation Type');
  const direction = field(declaration, 'Relation Direction');
  const scope = field(declaration, 'Relation Scope');
  const targets = parseRelationTargets(targetSection, { relationType, direction, scope });
  return Object.freeze({ relationType, direction, scope, target: targets[0]?.target || '', targets: Object.freeze(targets) });
}

function parseRelationTargets(markdown = '', defaults = {}) {
  const text = String(markdown || '');
  const starts = [...text.matchAll(/^\s*-\s+Target:\s*(.+)$/gmu)];
  if (!starts.length) return Object.freeze([]);
  const out = [];
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    const begin = start.index || 0;
    const end = index + 1 < starts.length ? starts[index + 1].index : text.length;
    const block = text.slice(begin, end);
    const rawTarget = String(start[1] || '').trim();
    out.push(Object.freeze({
      target: markdownLinkTarget(rawTarget) || stripMarkdown(rawTarget),
      relationType: field(block, 'Relation Type') || defaults.relationType || '',
      direction: field(block, 'Relation Direction') || defaults.direction || '',
      scope: field(block, 'Relation Scope') || defaults.scope || ''
    }));
  }
  return Object.freeze(out);
}

function candidateGuidanceSections(markdown = '') {
  const preferred = /(?:applicab|condition|trigger|sequence|step|phase|decision|procedure|process|operat|rule|constraint|interpretation|review)/iu;
  const headings = [...String(markdown || '').matchAll(/^##\s+(.+)$/gmu)].map((m) => String(m[1] || '').trim()).filter(Boolean);
  const selected = headings.filter((heading) => preferred.test(heading));
  return selected.slice(0, MAX_SECTIONS).map((heading) => Object.freeze({ heading, text: compact(section(markdown, heading), 1200) }));
}

function authorityArtifact(record = {}) {
  return Object.freeze({
    ...sourceArtifact(record),
    title: firstHeading(record.markdown || ''),
    candidateSections: Object.freeze(candidateGuidanceSections(record.markdown || ''))
  });
}

function selectorProjection(requirement = {}, basis = '') {
  return Object.freeze({
    requirementId: String(requirement.requirementId || requirement.id || ''),
    name: String(requirement.name || ''),
    material: String(requirement.material || ''),
    purpose: String(requirement.purpose || ''),
    basis
  });
}

function unresolvedDimension(detail) { return Object.freeze({ state: 'unresolved-not-declared', detail }); }
function exactRecord(records = [], path = '') { const matches=(records||[]).filter((r)=>String(r.path||'')===String(path||'')); return matches.length===1?matches[0]:null; }
function qualifiedRecord(record) { return Boolean(record && ((record.hasContinuityContext && record.hasIntegrity) || record.requiredContextQualification === 'exact-qualified-selected-required-context')); }
function sourceArtifact(record = {}) { return Object.freeze({ workspaceId: String(record.path || '').split('/')[0] || '', path: String(record.path || ''), sha256: sha256Hex(new TextEncoder().encode(String(record.markdown || ''))), schemaId: String(record.schemaId || '') }); }
function qualifiedHandoffPath(handoff = {}) { return [String(handoff.workspaceId || ''), String(handoff.workspaceRelativePath || '').replace(/^\/+/, '')].filter(Boolean).join('/'); }
function parentTraceTarget(markdown='') { const block=parentContinuityBlock(markdown); return markdownLinkTarget(fieldRaw(block,'Trace')) || field(block,'Trace'); }
function parentContinuityBlock(markdown='') { const m=String(markdown||'').match(/^- Parent\s*$([\s\S]*?)(?=^- Current\s*$|^---\s*$)/mu); return m?m[1]:''; }
function markdownLinkTargets(markdown='') { return [...String(markdown||'').matchAll(/\[[^\]\r\n]+\]\(([^)\s]+)\)/gu)].map((m)=>String(m[1]||'').trim()).filter(Boolean); }
function markdownLinkTarget(value='') { const m=String(value||'').trim().match(/^\[[^\]\r\n]+\]\(([^)\s]+)\)$/u); return m?String(m[1]||'').trim():''; }
function resolveReference(reference, ownerPath) { const raw=String(reference||'').split('#')[0].trim().replace(/\\/g,'/'); if (!raw || /^[a-z][a-z0-9+.-]*:\/\//iu.test(raw)) return ''; const cross=raw.match(/^([^:/\\]+)::(.+)$/u); const candidate=cross?`${cross[1]}/${cross[2].replace(/^\/+/, '')}`:raw.startsWith('/')?raw.slice(1):posix.join(posix.dirname(ownerPath),raw); const normalized=posix.normalize(candidate).replace(/^\.\//,''); return !normalized||normalized==='..'||normalized.startsWith('../')?'':normalized; }
function section(markdown='',heading='') { if(!heading)return ''; const escaped=String(heading).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); return String(markdown||'').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`,'iu'))?.[1]?.trim()||''; }
function fieldRaw(markdown='',label='') { const escaped=String(label).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); return String(markdown||'').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`,'imu'))?.[1]?.trim()||''; }
function field(markdown='',label='') { return stripMarkdown(fieldRaw(markdown,label)); }
function stripMarkdown(value='') { return String(value||'').replace(/^\[([^\]]+)\]\([^)]+\)$/u,'$1').replace(/`([^`]+)`/gu,'$1').trim(); }
function firstHeading(markdown='') { const body=String(markdown||'').split(/^---\s*$/mu).slice(1).join('---'); return stripMarkdown(body.match(/^#\s+(.+)$/mu)?.[1]||String(markdown||'').match(/^#\s+(.+)$/mu)?.[1]||''); }
function compact(value='',max=1200) { const text=String(value||'').replace(/\s+/gu,' ').trim(); return text.length<=max?text:`${text.slice(0,Math.max(0,max-1))}…`; }
function dedupeByPath(items=[]) { const seen=new Set(); return items.filter((item)=>{const key=String(item.path||''); if(!key||seen.has(key))return false; seen.add(key); return true;}); }
