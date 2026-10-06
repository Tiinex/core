import { portableOperationResult as operationResult } from '../operation.result.js';
import { searchPortableLineage as searchPortableLineageIndex } from './lineage.search.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { applyPortableLineageIntegrityRepair } from './lineage.integrity.apply.js';
import { buildPortableLineageIntegrityRepairProjection } from './lineage.integrity.projection.js';
import { projectPortableLineageOperativeState as projectPortableLineageOperativeStateProjection } from './lineage.operativeState.js';
import { projectPortableLineageRelationNeighborhood as projectPortableLineageRelationNeighborhoodProjection } from './lineage.relationNeighborhood.js';
import { projectPortableLineageMaintenance as projectPortableLineageMaintenanceProjection, qualifyPortableLineageDirectoryNamespace, qualifyPortableLineageWorkspaceNamespaces } from './lineage.maintenance.projection.js';

export function planPortableLineageIntegrity(input = {}, options = {}) {
  const inspection = inspectPortableLineageIntegrity(input, options);
  return operationResult('lineage-integrity-plan', { status: inspection.status, inspection, repairPlan: inspection.repairPlan, findings: inspection.findings || [] });
}

export function applyPortableLineageIntegrity(input = {}, options = {}) {
  const application = applyPortableLineageIntegrityRepair(input, options);
  return operationResult('lineage-integrity-apply', { status: application.status, application, changeset: application.changeset, receipts: application.receipts, humanReceipt: application.humanReceipt, reAudit: application.reAudit, boundary: application.boundary, findings: application.findings || [] });
}

export function projectPortableLineageIntegrityRepair(input = {}, options = {}) {
  const projection = buildPortableLineageIntegrityRepairProjection(input, options);
  return operationResult('lineage-integrity-project', { status: projection.status, projection, repairPlan: projection.preparedRepairPlan, boundary: projection.boundary, findings: projection.findings || [] });
}

export function projectPortableLineageOperativeState(input = {}, options = {}) {
  const projection = projectPortableLineageOperativeStateProjection(input, options);
  return operationResult('project-lineage-operative-state', { status: projection.status, resultSchema: projection.schema, nodes: projection.nodes, summary: projection.summary, boundary: projection.boundary, findings: projection.findings || [] });
}

export function projectPortableLineageRelationNeighborhood(input = {}, options = {}) {
  const projection = projectPortableLineageRelationNeighborhoodProjection(input, options);
  return operationResult('project-lineage-relation-neighborhood', { status: projection.status, resultSchema: projection.schema, focus: projection.focus, nodes: projection.nodes, edges: projection.edges, categories: projection.categories, negativeEvidence: projection.negativeEvidence, summary: projection.summary, boundary: projection.boundary, findings: projection.findings || [] });
}


export function projectPortableLineageMaintenance(input = {}, options = {}) {
  const projection = projectPortableLineageMaintenanceProjection(input, options);
  return operationResult('project-lineage-maintenance', { status: projection.status, projection, plan: projection, boundary: projection.boundary, findings: projection.findings || [] });
}

export function qualifyPortableLineageDirectory(input = {}, options = {}) {
  const qualification = qualifyPortableLineageDirectoryNamespace(input, options);
  return operationResult('qualify-lineage-directory', { status: qualification.status, qualification, boundary: qualification.boundary, findings: qualification.findings || [] });
}

export function qualifyPortableLineageWorkspace(input = {}, options = {}) {
  const qualification = qualifyPortableLineageWorkspaceNamespaces(input, options);
  return operationResult('qualify-lineage-workspace', { status: qualification.status, qualification, boundary: qualification.boundary, findings: qualification.findings || [] });
}

export function searchPortableLineage(input = {}, options = {}) {
  const search = searchPortableLineageIndex(input, options);
  return operationResult('search-lineage', { boundary: search.boundary, query: search.query, filters: search.filters, scope: search.scope, matches: search.matches, page: search.page, facets: search.facets, findings: search.findings || [] });
}

export const portableLineageOperationDescriptors = Object.freeze([
  Object.freeze({ name: 'project-lineage-relation-neighborhood', description: 'Project an invocation-selected loaded relation neighborhood across explicit Parent, Relation target, Handoff controlling/context, Task dependency, and qualified supersession edges without choosing a governing continuation or semantic winner.', safety: 'read-only', inputSchema: 'tiinex.portable.lineage-relation-neighborhood.request.v1', sourceMutation: false, remoteWrite: false, handler: projectPortableLineageRelationNeighborhood }),
  Object.freeze({ name: 'project-lineage-operative-state', description: 'Compose loaded lineage topology, explicit qualified currentness facts, and existing project-lifecycle-readiness receipts into separate host-neutral operative-state axes without inferring completion, Reduction, or deletion authority.', safety: 'read-only', inputSchema: 'tiinex.portable.lineage-operative-state.request.v1', sourceMutation: false, remoteWrite: false, handler: projectPortableLineageOperativeState }),
  Object.freeze({ name: 'lineage-integrity-plan', description: 'Inspect loaded Parent/self/Parent-target integrity and produce a read-only cascade-aware repair plan without mutating lineage or publication state.', safety: 'planning-only-read-only', inputSchema: 'tiinex.portable.lineage-integrity-plan.request.v1', handler: planPortableLineageIntegrity }),
  Object.freeze({ name: 'lineage-integrity-project', description: 'Project shared lineage repair opportunities, compact human guidance, prepared local-only plan steps, capability boundaries, and export readiness without Viewer/VS Code policy forks or remote writes.', safety: 'planning-only-read-only', inputSchema: 'tiinex.portable.lineage-integrity-projection.request.v1', sourceMutation: false, remoteWrite: false, handler: projectPortableLineageIntegrityRepair }),
  Object.freeze({ name: 'lineage-integrity-apply', description: 'Apply one explicit lineage-integrity repair plan to local material under per-artifact approval, structure-preservation, cascade, semantic-disposition, and no-remote-write gates.', safety: 'local-result-no-source-mutation', inputSchema: 'tiinex.portable.lineage-integrity-apply.request.v1', sourceMutation: false, remoteWrite: false, handler: applyPortableLineageIntegrity }),
  Object.freeze({ name: 'project-lineage-maintenance', description: 'Project exact Move, Normalize Directory, or Prepend lineage maintenance with directory-local re-dimensioning, explicit semantic Parent deltas, exact input fingerprints, collision findings, and no mutation.', safety: 'planning-only-read-only', inputSchema: 'tiinex.portable.lineage-maintenance.request.v1', sourceMutation: false, remoteWrite: false, handler: projectPortableLineageMaintenance }),
  Object.freeze({ name: 'qualify-lineage-directory', description: 'Qualify one explicit directory-local numeric filename namespace for compact coordinate drift without treating filename ancestry as semantic Parent authority.', safety: 'read-only', inputSchema: 'tiinex.portable.lineage-directory-namespace.request.v1', sourceMutation: false, remoteWrite: false, handler: qualifyPortableLineageDirectory }),
  Object.freeze({ name: 'qualify-lineage-workspace', description: 'Discover and qualify every homogeneous directory-local numeric Tiinex filename namespace in one loaded Workspace, reporting compactness, drift, blocked namespaces, and mixed/non-numeric surfaces without mutation.', safety: 'read-only', inputSchema: 'tiinex.portable.lineage-workspace-namespace.request.v1', sourceMutation: false, remoteWrite: false, handler: qualifyPortableLineageWorkspace }),
  Object.freeze({ name: 'search-lineage', description: 'Search and filter loaded lineage by text, schema, source mode, relation role, integrity, continuity, qualification, findings, path, and traversal scope.', safety: 'read-only', inputSchema: 'tiinex.portable.lineage-search.request.v1', handler: searchPortableLineage })
]);
