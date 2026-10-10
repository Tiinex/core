import { utf8Bytes, sha256Hex } from '../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { planPortableHostAction, acceptPortableHostActionReceipt } from '../host/tool.bindings.js';
import { normalizePublicationProviderReceipts, qualifiedPublicationCandidatesForParent } from './lineage.publicationProviderReceipts.js';

export const CROSS_WORKSPACE_PUBLICATION_SCHEMA_ID = 'tiinex.portable.cross-workspace-publication-qualification.v1';
const SHA=/^[a-f0-9]{40}$/i;
const REPOSITORY=/^[\w.-]+\/[\w.-]+$/;
const safePath=value=>typeof value==='string' && value.startsWith('.topics/') && value.endsWith('.trace.md') && !value.includes('\\') && !value.split('/').some(x=>!x||x==='.'||x==='..');
function finding(code,message){return Object.freeze({severity:'error',code:`lineage.cross-workspace.${code}`,message});}
function route({repository,commit,sourcePath}){return `https://github.com/${repository}/blob/${commit}/${sourcePath.split('/').map(encodeURIComponent).join('/')}`;}

/** Read-only evidence qualification, deliberately distinct from cross-Workspace Apply.
 * A URI, synthetic receipt or local git object cannot establish that a GitHub
 * commit was actually published: the corresponding accepted host action must
 * return the exact pinned bytes before the locator is qualified.
 */
export function qualifyCrossWorkspacePublication(input={}){
  const repository=String(input.repository||'').trim(),commit=String(input.commit||'').trim().toLowerCase();
  const sourcePath=String(input.sourcePath||'').trim();
  const sourceWorkspaceId=String(input.sourceWorkspaceId||'').trim();
  const targetWorkspaceId=String(input.targetWorkspaceId||'').trim();
  const markdown=typeof input.markdown==='string'?input.markdown:'';
  const errors=[];
  if(!REPOSITORY.test(repository)||!SHA.test(commit)||!safePath(sourcePath)) errors.push(finding('immutable-source-invalid','Require exact owner/repository, 40-hex commit and safe Tiinex .trace.md source path. Mutable branches are not permitted.'));
  if(!sourceWorkspaceId || !targetWorkspaceId || sourceWorkspaceId===targetWorkspaceId)errors.push(finding('workspace-pair-invalid','Publication recovery requires two distinct explicit Workspace identities.'));
  const self=canonicalC14nV2SelfState(markdown);
  if(!markdown || self.state!=='verified')errors.push(finding('material-self-unqualified','Requested historical source bytes must be one independently self-verified Tiinex artifact.'));
  const request={repository,ref:commit,path:sourcePath,purpose:'qualify immutable historical cross-Workspace Parent/Browse+Git locator',nextOperation:'review-cross-workspace-continuity'};
  const hostAction=errors.length?null:planPortableHostAction({action:'repository-read',host:{tools:input.availableTools||[]},request});
  const attempts=Object.freeze([
    {priority:1,method:'local-git-read',operation:'git show <40-hex-commit>:<exact-source-path>',qualification:'local-object-only; never establishes GitHub publication'},
    {priority:2,method:'host-repository-read',operation:'use detected GitHub connector/repository-read provider',qualification:'required accepted read receipt bound to commit+path+exact returned bytes'},
    {priority:3,method:'read-only-host-fallback',operation:'ask host/LLM for another repository reader (GitHub fetch_file, GitHub fetch, repository API)',qualification:'feed normalized exact repository-read receipt into this same Core operation'},
    {priority:4,method:'manual-exact-material',operation:'request a read-only provider receipt with complete file bytes and immutable source metadata',qualification:'do not upgrade plain URLs, search snippets or copy/pasted claims to accepted provider evidence'}
  ]);
  // Only an original exact action plan plus its matching normalized receipt
  // can promote host material; a loose 'accepted' object is not sufficient.
  let acceptance=null;
  if(input.hostPlan&&input.hostReceipt){
    acceptance=acceptPortableHostActionReceipt({plan:input.hostPlan,receipt:input.hostReceipt});
    if(acceptance.status!=='accepted')errors.push(finding('host-receipt-rejected','Provided host action response did not pass exact repository/commit/path contract.'));
    // A valid acceptance for some other request is not evidence for this source.
    const expectedPlan=planPortableHostAction({action:'repository-read',host:{tools:input.availableTools||[]},request});
    if(input.hostPlan.actionId!==expectedPlan.actionId)errors.push(finding('host-request-mismatch','Accepted host receipt did not originate from the exact intended immutable source request.'));
  }
  const provider=acceptance?.status==='accepted'?normalizePublicationProviderReceipts({publicationProviderAcceptance:acceptance}):{observations:[],findings:[]};
  const qualified=errors.length?[]:qualifiedPublicationCandidatesForParent(provider,{markdown});
  const expected=errors.length?'':route({repository,commit,sourcePath});
  const match=qualified.find(c=>c.locator===expected);
  const otherExact=qualified.length&&!match;
  if(otherExact)errors.push(finding('host-material-identity-mismatch','Repository read material does not correspond to the exact requested commit and source path.'));
  const sha=markdown?sha256Hex(utf8Bytes(markdown)):'';
  const state=errors.length?'blocked':match?'qualified':'unresolved';
  return Object.freeze({schema:CROSS_WORKSPACE_PUBLICATION_SCHEMA_ID,status:state,executable:false,
    request:Object.freeze({repository,commit,sourcePath,sourceWorkspaceId,targetWorkspaceId,expectedSourceSha256:sha}),
    permalink:match?.locator||'',publicationEvidence:match||null,
    hostAction:hostAction||null,
    attempts,findings:Object.freeze(errors),
    boundary:Object.freeze({readOnly:true,hostConnectorDiscovery:true,localGitIsPublicationProof:false,acceptedRepositoryReadRequired:true,exactBytesRequired:true,versionStable:true,sourceMutation:false,remoteMutation:false,crossWorkspaceApply:false})});
}
