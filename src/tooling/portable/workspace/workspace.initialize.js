import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { sealC14nV2Self, canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { integrityMethodReferenceAuthorityForCreation, C14N_V2_METHOD_ID } from '../../../integrity/integrity.methodReference.js';
import { schemaReferenceAuthorityForRegisteredSchema } from '../../../schemas/creation.schemaReferences.js';
import { compilePortableSchemaContract } from '../schema/contract.compile.js';
import { workspaceValidate } from '../../../schemas/workspace/tiinex.workspace.v1.validate.js';

export const PORTABLE_WORKSPACE_INITIALIZATION_SCHEMA_ID = 'tiinex.portable.workspace-initialization.v1';
export const WORKSPACE_SCHEMA_RESOLUTION_REQUEST = Object.freeze({
  schemaId: 'tiinex.workspace.v1',
  repository: 'Tiinex/docs',
  path: '.topics/.schemas/tiinex.workspace.v1.schema.md',
  resolution: 'latest-commit-permalink-plus-exact-schema-bytes',
  boundary: 'The host resolves bytes; Core validates schema identity and owns rendered Workspace semantics. A commit change alone is not schema-change evidence.'
});

export function preparePortableWorkspaceInitialization(input = {}) {
  const findings = [];
  const title = clean(input.title || input.workspaceId || repositoryLeaf(input.repository) || 'Workspace');
  const workspaceId = slug(input.workspaceId || repositoryLeaf(input.repository) || title);
  const schemaTarget = String(input.schemaTarget || input.schemaResolution?.target || '').trim();
  const schemaMarkdown = String(input.schemaMarkdown || input.schemaResolution?.markdown || '');
  if (!schemaTarget || !schemaMarkdown) return Object.freeze({
    schema: PORTABLE_WORKSPACE_INITIALIZATION_SCHEMA_ID,
    status: 'needs-resolution',
    resolutionRequest: WORKSPACE_SCHEMA_RESOLUTION_REQUEST,
    findingSummary: summary([]),
    findings: Object.freeze([])
  });
  if (!isResolvableSchemaTarget(schemaTarget, input.sameRepositorySchema === true)) findings.push(finding('error', 'workspace.initialize.schema-target.unresolvable', 'Workspace Current Schema must remain resolvable: use a same-repository relative target or an absolute permalink.', { schemaTarget }));
  let compiled = null;
  try { compiled = compilePortableSchemaContract(schemaMarkdown); }
  catch (error) { findings.push(finding('error', 'workspace.initialize.schema-material.invalid', 'Resolved Workspace schema material could not be compiled.', { detail: String(error?.message || error || '') })); }
  if (compiled && String(compiled.schemaId || '') !== 'tiinex.workspace.v1') findings.push(finding('error', 'workspace.initialize.schema-id.mismatch', 'Resolved schema material is not tiinex.workspace.v1.', { observed: compiled.schemaId || '' }));

  const repository = clean(input.repository || '');
  const ref = clean(input.ref || '');
  const sourceKind = clean(input.sourceKind || (repository ? 'github-tree' : 'local-session'));
  const rootPath = clean(input.rootPath || '.');
  const createdAt = timestamp(input.createdAt || new Date());
  const authors = clean(input.authors || 'local-user');
  const envelopeTarget = String(schemaReferenceAuthorityForRegisteredSchema('tiinex.root.v1')?.preferredTarget || '').trim();
  const integrityTarget = String(integrityMethodReferenceAuthorityForCreation(C14N_V2_METHOD_ID)?.preferredTarget || '').trim();
  if (!envelopeTarget) findings.push(finding('error', 'workspace.initialize.root-schema.unresolved', 'Core could not resolve canonical tiinex.root.v1 authority.'));
  if (!integrityTarget) findings.push(finding('error', 'workspace.initialize.integrity-method.unresolved', 'Core could not resolve canonical c14n-v2 validator authority.'));
  if (findings.some((item) => item.severity === 'error')) return blocked(findings);

  const entrypoint = repository ? `\n\n## Workspace Entrypoints\n\n### Repository source\n\n- Source Kind: ${sourceKind}\n- Repository: ${repository}${ref ? `\n- Ref: ${ref}` : ''}\n- Root Path: ${rootPath}\n- Repo Files Discovery: on\n` : '';
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${envelopeTarget})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${schemaTarget})\n  - Created At: ${createdAt}\n  - Authors: ${authors}\n  - Why: Establish an explicit portable Workspace entrypoint for this repository.\n  - Summary: ${title} Workspace.\n  - Status: active/local\n\n---\n\n# ${title}${entrypoint}\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${integrityTarget})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') return blocked([finding('error', 'workspace.initialize.integrity-seal.failed', 'Core could not seal Workspace c14n-v2 self integrity.', { reason: sealed.reason || sealed.state })]);
  const parsed = parseArtifactMarkdown(sealed.markdown);
  for (const item of workspaceValidate(parsed) || []) if (item?.severity === 'error') findings.push(finding('error', item.code || 'workspace.initialize.workspace-validation', item.message || 'Workspace validation failed.'));
  const integrity = canonicalC14nV2SelfState(sealed.markdown);
  if (integrity.state !== 'verified') findings.push(finding('error', 'workspace.initialize.integrity-verification.failed', 'Generated Workspace self integrity did not verify.', { reason: integrity.reason || integrity.state }));
  if (String(parsed?.envelope?.current?.schema?.id || '') !== 'tiinex.workspace.v1') findings.push(finding('error', 'workspace.initialize.current-schema.mismatch', 'Generated Workspace Current Schema identity is not tiinex.workspace.v1.'));
  if (findings.some((item) => item.severity === 'error')) return blocked(findings);
  return Object.freeze({
    schema: PORTABLE_WORKSPACE_INITIALIZATION_SCHEMA_ID,
    status: 'ready',
    workspaceId,
    path: `.topics/.workspaces/${workspaceId}.workspace.md`,
    markdown: sealed.markdown,
    schemaReference: Object.freeze({ schemaId: 'tiinex.workspace.v1', target: schemaTarget }),
    repository: Object.freeze({ repository, ref, sourceKind, rootPath }),
    findingSummary: summary(findings),
    findings: Object.freeze(findings),
    boundary: 'Core owns Workspace artifact semantics, schema-reference preservation, and integrity. Hosts only resolve requested external schema bytes and perform the explicit filesystem write.'
  });
}

function blocked(findings) { return Object.freeze({ schema: PORTABLE_WORKSPACE_INITIALIZATION_SCHEMA_ID, status: 'blocked', resolutionRequest: WORKSPACE_SCHEMA_RESOLUTION_REQUEST, findingSummary: summary(findings), findings: Object.freeze(findings) }); }
function finding(severity, code, message, evidence = {}) { return Object.freeze({ severity, code, message, source: PORTABLE_WORKSPACE_INITIALIZATION_SCHEMA_ID, evidence: Object.freeze({ ...evidence }) }); }
function summary(findings) { const counts={error:0,warning:0,info:0,total:findings.length}; for(const item of findings) if(counts[item.severity]!==undefined) counts[item.severity]+=1; return Object.freeze({status:counts.error?'blocked':counts.warning?'degraded':'clean',counts:Object.freeze(counts)}); }
function clean(value) { return String(value ?? '').trim().replace(/[\r\n]+/g, ' '); }
function slug(value) { const out=clean(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); return out || 'workspace'; }
function repositoryLeaf(value) { const text=clean(value).replace(/\.git$/i,'').replace(/[\\/]+$/,''); return text.split(/[\\/]/).filter(Boolean).at(-1) || ''; }
function timestamp(value) { const date=value instanceof Date?value:new Date(value); if(Number.isNaN(date.getTime())) return clean(value); return date.toISOString().replace('T',' ').replace(/\.\d{3}Z$/,''); }
function isResolvableSchemaTarget(value, sameRepository) { if(sameRepository && !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith('/')) return true; try { const url=new URL(value); return ['https:','http:'].includes(url.protocol); } catch { return false; } }
