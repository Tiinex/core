import { createHash } from 'node:crypto';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { schemaMarkdown } from '../../../schemas/registry.js';
import { planPortableHostAction, acceptPortableHostActionReceipt } from '../host/tool.bindings.js';

export const PORTABLE_HISTORICAL_SCHEMA_SOURCE_INSPECTION_ID='tiinex.portable.historical-schema-source-inspection.v1';
const PINNED=/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/blob\/([a-fA-F0-9]{40})\/(\.topics\/\.schemas\/[\w./-]+\.schema\.md)$/;
const finding=(code,message)=>({severity:'error',code:`schema.historical-source.${code}`,message});
const sha1blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

/** Read-only historical Current Schema comparison. A returned mismatch must
 * never be silently fixed by changing an artifact's schema locator. The
 * current registered local schema is a comparison operand, not the authority
 * of the historical GitHub blob. */
export function inspectPortableHistoricalSchemaSource(input={}){
 const markdown=String(input.markdown||'');const errors=[];
 let parsed=null;
 try{parsed=parseArtifactMarkdown(markdown);}catch{errors.push(finding('artifact-parse-failed','Evidence artifact is not parseable.'));}
 const self=canonicalC14nV2SelfState(markdown);
 if(self.state!=='verified')errors.push(finding('artifact-self-unqualified','Historical source artifact must have verified C14n-v2 self integrity.'));
 const declared=parsed?.envelope?.current?.schema||{};
 const schemaId=String(declared.id||'');const target=String(declared.target||'');
 const match=target.match(PINNED);
 if(!match||declared.form!=='markdown-link')errors.push(finding('source-not-immutable-github','Historical Current Schema must declare one exact immutable GitHub commit and schema path.'));
 const [repository,commit,path]=match?[match[1],match[2].toLowerCase(),match[3]]:['','',''];
 if(!schemaId||!path.endsWith(`/${schemaId}.schema.md`))errors.push(finding('schema-identity-mismatch','Historical path and declared schema identity must agree.'));
 const current=String(schemaMarkdown(schemaId)||'');
 const source= current?{sha256:sha256Hex(utf8Bytes(current)),bytes:utf8Bytes(current).length,gitBlobSha:sha1blob(utf8Bytes(current))}:null;
 // Even without a local compiled schema, an LLM can request the pinned bytes
 // through a read-only connector. Missing local material blocks EQUIVALENCE,
 // not source discovery.

 const request={repository,ref:commit,path,purpose:'compare historical immutable Current Schema bytes before parent continuation or explicit migration',nextOperation:'review-historical-schema-continuity'};
 const action=errors.length?null:planPortableHostAction({action:'repository-read',host:{tools:input.availableTools||[]},request});
 let acceptance=null;
 if(input.hostPlan&&input.hostReceipt){
  const expected=planPortableHostAction({action:'repository-read',host:{tools:input.availableTools||[]},request});
  if(input.hostPlan.actionId!==expected.actionId || input.hostPlan.action!=='repository-read')errors.push(finding('provider-request-mismatch','Supplied host plan is not the exact immutable schema source request.'));
  acceptance=acceptPortableHostActionReceipt({plan:input.hostPlan,receipt:input.hostReceipt});
  if(acceptance.status!=='accepted')errors.push(finding('provider-receipt-rejected','Host repository-read receipt is not accepted.'));
 }
 const material=errors.length?null:(acceptance?.providerResponses||[]).flatMap(x=>x.files||[]).find(x=>x.source?.repository?.toLowerCase()===repository.toLowerCase() && x.source?.commit?.toLowerCase()===commit && x.path===path);
 const historical=material?.content;
 const bytes=typeof historical==='string'?utf8Bytes(historical):null;
 const identity=bytes?{sha256:sha256Hex(bytes),bytes:bytes.length,gitBlobSha:sha1blob(bytes)}:null;
 if(identity&&canonicalC14nV2SelfState(historical).state!=='verified')errors.push(finding('historical-schema-self-unqualified','Exact remote schema source lacks verified C14n-v2 self integrity.')); 
 const expectedBlob=String(input.hostReceipt?.steps?.flatMap(s=>s.normalized?.files||[]).find(f=>f.path===path)?.sha||'').toLowerCase();
 if(identity && expectedBlob && !/^[0-9a-f]{40}$/.test(expectedBlob))errors.push(finding('provider-blob-malformed','Provider-supplied Git blob SHA is malformed.'));
 if(identity && expectedBlob && expectedBlob!==identity.gitBlobSha)errors.push(finding('provider-blob-mismatch','Provider Git blob SHA differs from exact returned UTF-8 content.'));
 const verdict=errors.length?'blocked':!identity?'unresolved':!source?'historical-uncompared':identity.sha256===source.sha256&&identity.gitBlobSha===source.gitBlobSha?'byte-equivalent':'historical-distinct';
 return Object.freeze({schema:PORTABLE_HISTORICAL_SCHEMA_SOURCE_INSPECTION_ID,
  status:verdict,executable:false,source:{schemaId,repository,commit,path,target},
  localCurrentMaterial:source,historicalMaterial:identity,hostAction:action,
  findings:errors,comparison:verdict==='byte-equivalent'?'Exact historical source bytes are identical to registered current material.':'',
  next:verdict==='historical-distinct'?'Keep the pinned historical Current Schema; only separately qualified historical validation or explicit migration can make Parent authoring safe.':verdict==='byte-equivalent'?'Evidence of byte equivalence can enter the existing exact-reference authority workflow; do not silently mutate the Parent.':verdict==='historical-uncompared'?'Pinned source bytes are available, but no Core-registered current schema was loaded. Historical validation and equivalence remain unqualified.':'Obtain a pinned repository-read receipt from an available GitHub connector or request exact manual material.',
  boundary:{readOnly:true,sourceMutation:false,remoteWrite:false,permitsParentAuthoring:false,permitsHistoricalSchemaMigration:false,localMaterialIsNotHistoricalProof:true}});
}
