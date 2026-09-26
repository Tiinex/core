import { projectParticipantAuthority } from './grounding.participantAuthority.js';
import { projectWorkProvenance } from './grounding.workProvenance.js';
import { projectGroundingSourceEvidence } from './grounding.sourceEvidence.js';
import { projectGroundingPlanningContext } from './grounding.planningContext.js';
import { projectGroundingParticipantContext } from './grounding.participantContext.js';
import { projectGroundingParticipantArtifactAuthority } from './grounding.participantArtifactAuthority.js';
import { projectGroundingProcessApplicability } from './grounding.processApplicability.js';
import { projectGroundingGuidanceAuthority } from './grounding.guidanceAuthority.js';
import { projectGroundingImplementationSourceAuthority } from './grounding.implementationSourceAuthority.js';
import { projectGroundingDelegationReadiness } from './grounding.delegationReadiness.js';
import { projectGroundingDelegationArtifactAuthority } from './grounding.delegationArtifactAuthority.js';

export const PORTABLE_GROUNDING_CAPSULE_SCHEMA_ID = 'tiinex.portable.grounding-capsule.v1';

const MAX_CONTEXT = 8;
const MAX_EXCLUSIONS = 6;

export function projectGroundingCapsule({ authority = null, continuation = null, contextAudit = null, requiredContext = [], records = [], topology = {}, blockers = [], currentWorkAuthority = null } = {}) {
  const routeRecords = selectedRouteRecords(authority, records);
  const workProvenance = projectWorkProvenance({ records, topology });
  const participantAuthority = projectParticipantAuthority(authority);
  const participantArtifactAuthority = projectGroundingParticipantArtifactAuthority({ authority, requiredContext, records, topology });
  const participantContext = projectGroundingParticipantContext(mergeArtifactParticipantAuthority(authority, participantArtifactAuthority));
  const sourceEvidence = projectGroundingSourceEvidence({ records, contextAudit, continuation, requiredContext });
  const delegationArtifactAuthority = projectGroundingDelegationArtifactAuthority({ authority, records, topology, sourceEvidence, requiredContext });
  const effectiveAuthority = mergeArtifactDelegationAuthority(authority, delegationArtifactAuthority);
  const processApplicability = projectGroundingProcessApplicability(effectiveAuthority);
  const guidanceAuthority = projectGroundingGuidanceAuthority({ authority: effectiveAuthority, requiredContext, records, topology });
  const implementationSourceAuthority = projectGroundingImplementationSourceAuthority({ authority: effectiveAuthority, records, contextAudit, requiredContext });
  const delegationReadiness = projectGroundingDelegationReadiness({ authority: effectiveAuthority, processApplicability, implementationSourceAuthority });
  return Object.freeze({
    schema: PORTABLE_GROUNDING_CAPSULE_SCHEMA_ID,
    semanticReductions: Object.freeze(requiredContext.slice(0, MAX_CONTEXT).map(reduceRequiredContext)),
    frontier: projectFrontier(topology, blockers, currentWorkAuthority),
    exclusions: Object.freeze(routeRecords.flatMap((record) => parseExclusions(record.markdown || '')).slice(0, MAX_EXCLUSIONS)),
    sourceEvidence,
    planningContext: projectGroundingPlanningContext(requiredContext),
    roleState: Object.freeze({
      recipient: String(authority?.role?.endpoint?.label || authority?.handoff?.to || ''),
      recipientState: String(authority?.role?.state || 'unresolved'),
      holder: String(authority?.holderBinding?.roleLabel || ''),
      holderState: String(authority?.holderBinding?.state || 'unresolved'),
      compatibility: String(authority?.holderBinding?.recipientCompatibility || 'unresolved'),
      authorizationState: String(authority?.holderBinding?.authorization?.state || (String(authority?.holderBinding?.state || '') === 'not-applicable' ? 'not-applicable' : 'unresolved')),
      authorizationSource: String(authority?.holderBinding?.authorization?.source || ''),
      assertionMode: String(authority?.holderBinding?.assertionMode || authority?.holderBinding?.authorization?.assignmentMode || ''),
      authorizedModes: Object.freeze([...(authority?.holderBinding?.authorization?.authorizedModes || [])]),
      authorizationBasis: String(authority?.holderBinding?.authorization?.modeAuthority?.provenance?.basis || authority?.holderBinding?.authorization?.provenance?.basis || ''),
      durableIdentityState: String(authority?.holderBinding?.durableIdentity?.state || 'not-established')
    }),
    participantAuthority,
    participantArtifactAuthority,
    participantContext,
    processApplicability,
    guidanceAuthority,
    implementationSourceAuthority,
    delegationArtifactAuthority,
    delegationReadiness,
    workProvenance,
    unresolved: Object.freeze([
      ...workProvenance.unresolved,
      ...participantArtifactAuthority.unresolved,
      ...participantContext.unresolved,
      ...guidanceAuthority.unresolved,
      ...processApplicability.unresolved,
      ...implementationSourceAuthority.unresolved,
      ...delegationReadiness.blockers.map((item) => ({ code: item.code, detail: item.request })),
      ...sourceEvidence.blockers.map((item) => ({ code: item.code, detail: item.request }))
    ]),
    boundary: 'Full Required Context bodies remain selector-gated.'
  });
}


function mergeArtifactParticipantAuthority(authority = null, artifact = null) {
  const base = authority && typeof authority === 'object' ? authority : {};
  const participation = base.participation && typeof base.participation === 'object' ? base.participation : {};
  const derived = Array.isArray(artifact?.participants) ? artifact.participants : [];
  if (!derived.length) return base;
  return Object.freeze({
    ...base,
    participation: Object.freeze({
      ...participation,
      participants: Object.freeze([...(participation.participants || []), ...derived])
    })
  });
}

function mergeArtifactDelegationAuthority(authority = null, artifact = null) {
  if (!artifact || typeof artifact !== 'object') return authority || {};
  const base = authority && typeof authority === 'object' ? authority : {};
  return Object.freeze({
    ...base,
    delegateCapabilityAuthority: base.delegateCapabilityAuthority || artifact.delegateCapabilityAuthority,
    processApplicability: base.processApplicability || artifact.processApplicability,
    delegationTargetAuthority: base.delegationTargetAuthority || artifact.delegationTargetAuthority,
    implementationSourceAuthority: base.implementationSourceAuthority || artifact.implementationSourceAuthority,
    delegationReturnReconciliationExpectation: base.delegationReturnReconciliationExpectation || artifact.delegationReturnReconciliationExpectation
  });
}

function reduceRequiredContext(entry = {}) {
  const qualified = String(entry.state || '') === 'qualified';
  const markdown = qualified && typeof entry.content === 'string' ? entry.content : '';
  const signals = markdown ? semanticSignals(markdown) : [];
  return Object.freeze({
    id: String(entry.requirementId || entry.name || ''),
    state: String(entry.state || 'unresolved'),
    workspace: String(entry.workspaceId || ''),
    path: String(entry.innerPath || entry.workspaceRelativePath || ''),
    title: markdown ? firstHeading(markdown) : String(entry.name || ''),
    signals: Object.freeze(signals),
    basis: markdown ? 'exact-qualified-body-reduction' : 'qualified-locator-without-body'
  });
}

function semanticSignals(markdown = '') {
  const preferred = ['Objective', 'Purpose', 'Decision', 'Scope', 'Done Criteria', 'Completion Expectation', 'Dependencies'];
  const out = [];
  for (const heading of preferred) {
    const text = section(markdown, heading);
    if (!text) continue;
    out.push(Object.freeze({ heading, text: compact(sectionMeaning(text), 220) }));
    if (out.length === 2) break;
  }
  if (!out.length) {
    const summary = field(markdown, 'Summary');
    if (summary) out.push(Object.freeze({ heading: 'Summary', text: compact(summary, 220) }));
  }
  return out;
}

function projectFrontier(topology = {}, blockers = [], currentWorkAuthority = null) {
  const selection = currentWorkAuthority && typeof currentWorkAuthority === 'object' ? currentWorkAuthority : null;
  const frontier = (selection?.frontier || topology.currentFrontier || []).slice(0, 4).map((item) => Object.freeze({
    path: String(item.path || ''),
    status: String(item.declaredStatus || ''),
    objective: compact(item.objective || '', 180)
  }));
  const contextOnly = (selection?.contextCandidates || []).slice(0, 4).map((item) => Object.freeze({
    path: String(item.path || ''),
    status: String(item.declaredStatus || ''),
    objective: compact(item.objective || '', 180)
  }));
  let state = frontier.length ? 'resolved' : 'unresolved';
  let rationale = frontier.length ? 'nearest nonterminal Task ancestor(s) to the exact selected Handoff route by declared Parent distance' : 'no exact-qualified nonterminal Task ancestor resolved on the selected route Parent lineage';
  if (selection?.state === 'selected-handoff-task-frontier-resolved') {
    state = 'resolved';
    rationale = 'exact selected Handoff Controlling Artifact declaration(s) resolve to exact-qualified nonterminal Task current work; nearest Task ancestry is context-only when different';
  } else if (selection?.state === 'selected-handoff-bounded-work') {
    state = 'selected-handoff-bounded-work';
    rationale = 'exact selected Handoff explicitly controls current bounded work through qualified non-Task artifacts; no Task is promoted merely from nearest ancestry';
  } else if (selection?.state === 'selected-handoff-current-work-unresolved') {
    state = 'unresolved';
    rationale = 'selected Handoff declares explicit Controlling Artifact current-work authority, but one or more control targets are unresolved/ambiguous/unqualified; nearest Task ancestry cannot substitute';
  } else if (selection?.state === 'nearest-task-frontier-resolved') {
    state = 'resolved-fallback';
    rationale = 'nearest nonterminal Task ancestor fallback is used only because the selected Handoff declares no explicit Controlling Artifact target';
  }
  return Object.freeze({
    state,
    authorityMode: String(selection?.mode || 'nearest-task-ancestor-fallback'),
    rationale,
    selectedHandoff: String(selection?.selectedHandoff || ''),
    items: Object.freeze(frontier),
    contextOnlyCandidates: Object.freeze(contextOnly),
    controls: Object.freeze((selection?.controls || []).slice(0, 6).map((item) => Object.freeze({ ...item }))),
    blockers: Object.freeze((blockers || []).slice(0, 4).map((item) => Object.freeze({ code: String(item.code || item.id || ''), detail: compact(item.detail || item.message || item.label || '', 180) })))
  });
}

function parseExclusions(markdown = '') {
  const body = section(markdown, 'Exclusions And Dependencies');
  if (!body) return [];
  const blocks = body.split(/\n(?=-\s+[^\s])/g).map((item) => item.trim()).filter(Boolean);
  return blocks.map((block) => {
    const id = (block.match(/^-\s+([^\n]+)/) || [])[1] || '';
    return Object.freeze({
      id: id.trim(),
      kind: field(block, 'Kind'),
      description: compact(field(block, 'Description'), 220)
    });
  }).filter((item) => item.id);
}

function selectedRouteRecords(authority = {}, records = []) {
  const workspace = String(authority?.selectedRoute?.workspaceId || '');
  const inner = String(authority?.selectedRoute?.workspaceRelativeHandoffPath || '').replace(/^\/+/, '');
  const expected = workspace && inner ? `${workspace}/${inner}` : '';
  return expected ? records.filter((record) => String(record.path || '') === expected) : [];
}

function section(markdown = '', heading = '') {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'));
  return match ? match[1].trim() : '';
}

function field(markdown = '', label = '') {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`, 'mi'));
  return match ? stripMarkdown(match[1]) : '';
}

function firstHeading(markdown = '') {
  const match = String(markdown || '').match(/^#\s+(.+)$/m);
  return match ? stripMarkdown(match[1]) : '';
}

function sectionMeaning(text = '') {
  const description = field(text, 'Description');
  if (description) return description;
  const purpose = field(text, 'Purpose');
  if (purpose) return purpose;
  return String(text || '').replace(/^\s*-\s+/gm, '').replace(/^\s{2,}-\s+/gm, ' ').replace(/\s+/g, ' ').trim();
}

function stripMarkdown(value = '') { return String(value || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').trim(); }
function compact(value = '', limit = 220) { const text = stripMarkdown(String(value || '').replace(/\s+/g, ' ')); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
