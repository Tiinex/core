import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { LineageResolutionStatus } from '../../../lineage/lineage.model.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding } from '../findings.js';

export const PORTABLE_LINEAGE_OPERATIVE_STATE_SCHEMA_ID = 'tiinex.portable.lineage-operative-state.v1';
const TOPOLOGY_STATUSES = new Set([
  LineageResolutionStatus.resolved,
  LineageResolutionStatus.verified,
  LineageResolutionStatus.probable,
  LineageResolutionStatus.mismatch
]);
const CURRENTNESS_STATES = new Set(['current', 'historical', 'superseded']);

export function projectPortableLineageOperativeState(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const resolved = options.resolvedLineage || resolveLineage(material.records, { depth: 'loaded-operative-state' });
  const topology = topologyIndex(resolved);
  const currentnessFacts = normalizeCurrentnessFacts(input.currentness || input.facts?.currentness || []);
  const lifecycleReceipts = normalizeLifecycleReceipts(input.lifecycle || input.facts?.lifecycle || []);
  const findings = [...(material.findings || []), ...(resolved.findings || [])];
  const nodes = [];

  for (const record of material.records || []) {
    const relation = topology.get(record.id) || { root: true, leaf: true, parents: [], children: [] };
    const currentness = currentnessFor(record, currentnessFacts, findings);
    const lifecycle = lifecycleFor(record, lifecycleReceipts, findings);
    nodes.push(Object.freeze({
      id: String(record.id || record.path || ''),
      path: String(record.path || ''),
      title: String(record.title || record.path || ''),
      schemaId: String(record.schemaId || ''),
      topology: Object.freeze({
        role: relation.root && relation.leaf ? 'isolated' : relation.root ? 'root' : relation.leaf ? 'leaf' : 'intermediate',
        root: relation.root,
        leaf: relation.leaf,
        parents: Object.freeze([...relation.parents]),
        children: Object.freeze([...relation.children])
      }),
      currentness,
      lifecycle
    }));
  }

  const unresolvedCurrentness = nodes.filter((node) => node.currentness.state === 'unresolved').length;
  const unresolvedLifecycle = nodes.filter((node) => node.lifecycle.state === 'unresolved').length;
  const taskCount = nodes.filter((node) => node.schemaId === 'tiinex.task.v1').length;
  return Object.freeze({
    schema: PORTABLE_LINEAGE_OPERATIVE_STATE_SCHEMA_ID,
    status: material.records?.length ? 'qualified-projection' : 'empty',
    nodes: Object.freeze(nodes.sort((a, b) => a.path.localeCompare(b.path))),
    summary: Object.freeze({
      records: nodes.length,
      roots: nodes.filter((node) => node.topology.root).length,
      leaves: nodes.filter((node) => node.topology.leaf).length,
      tasks: taskCount,
      current: nodes.filter((node) => node.currentness.state === 'current').length,
      historical: nodes.filter((node) => node.currentness.state === 'historical').length,
      superseded: nodes.filter((node) => node.currentness.state === 'superseded').length,
      unresolvedCurrentness,
      closedTasks: nodes.filter((node) => node.lifecycle.state === 'closed').length,
      openTasks: nodes.filter((node) => node.lifecycle.state === 'open').length,
      unresolvedLifecycle
    }),
    findings: Object.freeze(findings),
    boundary: Object.freeze({
      loadedMaterialOnly: true,
      remoteFetch: false,
      sourceMutation: false,
      lexicalStatusAuthority: false,
      currentnessAuthority: 'explicit-qualified-facts-only',
      lifecycleAuthority: 'existing-project-lifecycle-readiness-receipts-only',
      processApplicabilityInferred: false,
      reductionAuthority: false,
      destructiveEligibility: false,
      deletionAuthority: false,
      meaning: 'Topology, currentness, and lifecycle are projected as separate axes. This projection does not synthesize a universal work state.'
    })
  });
}

function topologyIndex(resolved = {}) {
  const map = new Map((resolved.nodes || []).map((node) => [node.id, { root: true, leaf: true, parents: [], children: [] }]));
  for (const edge of resolved.edges || []) {
    if (edge.kind !== 'parent' || !TOPOLOGY_STATUSES.has(edge.status) || !edge.from || !edge.to) continue;
    const parent = map.get(edge.from);
    const child = map.get(edge.to);
    if (!parent || !child) continue;
    parent.leaf = false;
    child.root = false;
    parent.children.push(edge.to);
    child.parents.push(edge.from);
  }
  return map;
}

function normalizeCurrentnessFacts(values = []) {
  return (Array.isArray(values) ? values : []).map((value, index) => Object.freeze({
    target: normalizeTarget(value.target || value.path || value.id),
    state: CURRENTNESS_STATES.has(String(value.state || '')) ? String(value.state) : 'unresolved',
    qualification: String(value.qualification || value.semanticState || 'unresolved'),
    basis: value.basis || null,
    supersededBy: String(value.supersededBy || value.successor || ''),
    index
  }));
}

function normalizeLifecycleReceipts(values = []) {
  return (Array.isArray(values) ? values : []).map((value, index) => Object.freeze({
    target: normalizeTarget(value.target || value.path || value.id),
    projection: value.projection && typeof value.projection === 'object' ? value.projection : value,
    index
  }));
}

function currentnessFor(record, facts, findings) {
  const matches = facts.filter((fact) => exactTargetMatches(record, fact.target) && fact.qualification === 'qualified' && fact.state !== 'unresolved' && nonEmptyBasis(fact.basis));
  if (!matches.length) return Object.freeze({ state: 'unresolved', basis: Object.freeze([]), supersededBy: '', boundary: 'No qualified explicit currentness fact governs this record.' });
  const states = new Set(matches.map((fact) => fact.state));
  const successors = new Set(matches.filter((fact) => fact.state === 'superseded').map((fact) => fact.supersededBy).filter(Boolean));
  if (states.size !== 1 || (states.has('superseded') && successors.size > 1)) {
    findings.push(portableFinding('warning', 'lineage.operative-state.currentness.conflict', 'Conflicting qualified currentness facts govern the same record; currentness remains unresolved.', { ref: record.path || record.id || '' }));
    return Object.freeze({ state: 'unresolved', basis: Object.freeze(matches.map((fact) => fact.basis)), supersededBy: '', boundary: 'Conflicting qualified currentness facts are never resolved by ordering.' });
  }
  const state = matches[0].state;
  return Object.freeze({ state, basis: Object.freeze(matches.map((fact) => fact.basis)), supersededBy: state === 'superseded' ? [...successors][0] || '' : '', boundary: 'Qualified invocation-provided currentness only; filenames, timestamps, directories, and lexical status are ignored.' });
}

function lifecycleFor(record, receipts, findings) {
  if (String(record.schemaId || '') !== 'tiinex.task.v1') return Object.freeze({ state: 'not-applicable', readiness: '', retest: '', nextAction: null, boundary: 'Task lifecycle readiness is only projected for tiinex.task.v1 records.' });
  const matches = receipts.filter((receipt) => exactTargetMatches(record, receipt.target));
  if (!matches.length) return Object.freeze({ state: 'unresolved', readiness: '', retest: '', nextAction: null, boundary: 'No existing project-lifecycle-readiness receipt governs this Task.' });
  if (matches.length !== 1) {
    findings.push(portableFinding('warning', 'lineage.operative-state.lifecycle.ambiguous', 'Multiple lifecycle readiness receipts target the same Task; lifecycle remains unresolved.', { ref: record.path || record.id || '' }));
    return Object.freeze({ state: 'unresolved', readiness: '', retest: '', nextAction: null, boundary: 'Multiple receipts are not ordered or merged by this projection.' });
  }
  const projection = matches[0].projection || {};
  if (String(projection.status || '') !== 'qualified-projection') return Object.freeze({ state: 'unresolved', readiness: String(projection.readiness?.state || ''), retest: String(projection.retest?.state || ''), nextAction: projection.nextAction || null, boundary: 'Lifecycle receipt is not a qualified project-lifecycle-readiness projection.' });
  const closure = String(projection.closure?.state || '');
  if (closure === 'closed') return Object.freeze({ state: 'closed', readiness: String(projection.readiness?.state || ''), retest: String(projection.retest?.state || ''), nextAction: projection.nextAction || null, boundary: 'Closed is inherited only from the qualified existing lifecycle projection.' });
  if (closure === 'open') return Object.freeze({ state: 'open', readiness: String(projection.readiness?.state || ''), retest: String(projection.retest?.state || ''), nextAction: projection.nextAction || null, boundary: 'Open is inherited only from the qualified existing lifecycle projection.' });
  return Object.freeze({ state: 'unresolved', readiness: String(projection.readiness?.state || ''), retest: String(projection.retest?.state || ''), nextAction: projection.nextAction || null, boundary: 'The existing lifecycle projection did not establish open or closed.' });
}

function exactTargetMatches(record, target = '') {
  const wanted = normalizeTarget(target);
  if (!wanted) return false;
  return [record.id, record.path].map(normalizeTarget).includes(wanted);
}
function normalizeTarget(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').trim(); }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
