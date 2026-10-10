import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {sha256Hex,utf8Bytes} from '../../../../export/package.bytes.js';
import {sealC14nV2Self,canonicalC14nV2SelfState} from '../../../../integrity/integrity.c14nV2.js';
import {parseArtifactMarkdown} from '../../../../artifacts/artifact.parse.js';
import {auditPortableRecord} from '../../audit/audit.capability.js';
import {inspectPortableCrossWorkspaceContinuity} from './lineage.crossWorkspace.inspect.js';
import {inspectPortableWorkspaceReferenceInventory} from './lineage.scoped-move.inspect.js';
export const CROSS_WORKSPACE_GRAPH_BUNDLE_SCHEMA='tiinex.portable.cross-workspace-closed-lineage-bundle.v1';
const bannedText=/\b(?:src\s*=|href\s*=|url\s*\(|import\s+|require\s*\()/i;
const filename=/^(\d+(?:-\d+)*)-(.+)$/;
const safe=p=>typeof p==='string'&&p.startsWith('.topics/')&&!p.includes('\\')&&!p.includes('\0')&&!p.split('/').some(x=>!x||x==='.'||x==='..');
const deny=(code,message,extra={})=>({schema:CROSS_WORKSPACE_GRAPH_BUNDLE_SCHEMA,status:'blocked',executable:false,
 findings:[{severity:'error',code:`cross-workspace.graph.${code}`,message}],...extra});
const numerals=p=>(path.posix.basename(p).match(filename)||[])[1]||'';
const eq=(a,b)=>a===b;
const prefix=(dim,ancestor)=>dim===ancestor||dim.startsWith(ancestor+'-');
const order=(a,b)=>numerals(a).split('-').length-numerals(b).split('-').length || numerals(a).localeCompare(numerals(b)) || a.localeCompare(b);
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const loc=(r,p)=>path.join(r,p);

/** Closed semantic subtree, read-only qualified. No outside readers or Parent,
 * no root Parent, no ambiguous references, no undeclared Workspace. The exact
 * origin/Parent integrity for every child is verified and recomputed, not
 * inferred from filename numbering alone. */
export async function inspectPortableCrossWorkspaceClosedGraph(input={}) {
 const op=input.operation||{},src=input.sourceWorkspace||{},dst=input.targetWorkspace||{};
 if(Array.isArray(input.additionalWorkspaces)&&input.additionalWorkspaces.length)return deny('third-workspace-unknown','Additional Workspace readers are not proven absent.');
 if(op.scope!=='self-and-leaves'||op.placement!=='same'||op.parentPolicy!=='keep')return deny('operation-unsupported','Only Self + Leaves / Same / Keep Parent qualifies this closed-graph transfer.');
 const inspected=await inspectPortableCrossWorkspaceContinuity(input);
 const fail=(code,message)=>deny(code,message,{inspection:inspected});
 if(inspected.inspectionStatus!=='qualified'||inspected.workspaceSnapshots?.length!==2)return fail('inventory-unqualified','Two exact local Workspace inventories required.');
 const arts=inspected.selection?.artifactPaths||[],assets=inspected.selection?.assetPaths||[];
 if(inspected.selection?.status!=='ready'||arts.length<2||arts.length>24||assets.length>64)return fail('selection-size-unsupported','Require 2–24 selected artifacts with at most 64 owned assets.');
 if(!arts.includes(op.selectedPath))return fail('source-root-missing','Selected source root must be in the exact qualified selection.');
 if(inspected.inboundReferences.length||inspected.outboundParentDependencies.length)return fail('outside-reference','Incoming outside readers or outgoing semantic Parents cannot be moved with this closed graph.');
 const [srcInv,dstInv]=await Promise.all([inspectPortableWorkspaceReferenceInventory({workspaceId:src.workspaceId,workspaceRoot:src.workspaceRoot}),inspectPortableWorkspaceReferenceInventory({workspaceId:dst.workspaceId,workspaceRoot:dst.workspaceRoot})]);
 if(srcInv.status!=='ready'||dstInv.status!=='ready')return fail('scan-drift','Physical inputs changed since inspection.');
 for(const inv of [srcInv,dstInv]) if(inv.inventory.some(x=>!x.path.endsWith('.md')&&!/\.(?:png|jpe?g|gif|webp|pdf|bmp|avif|ico|bin|mp4|mov|wav|mp3|zip)$/i.test(x.path)))
  return fail('dynamic-surface','Unsupported source formats could contain incoming references.');
 const dir=path.posix.dirname(op.selectedPath),targetDir=path.posix.dirname(op.targetPath);
 const rootDim=numerals(op.selectedPath),anchorDim=numerals(op.targetPath);
 if(!rootDim||!anchorDim||!arts.every(p=>path.posix.dirname(p)===dir&&prefix(numerals(p),rootDim))||!assets.every(p=>path.posix.dirname(p)===dir&&prefix(numerals(p),rootDim)))return fail('dimension-scope-invalid','The chosen closed graph must share one source directory and root dimension.');
 const tParts=anchorDim.split('-'),occupied=new Set(dstInv.inventory.filter(x=>path.posix.dirname(x.path)===targetDir).map(x=>numerals(x.path)).filter(Boolean));
 let n=Math.max(Number(tParts.at(-1)),...Array.from(occupied).map(x=>x.split('-')).filter(x=>x.length===tParts.length&&x.slice(0,-1).join('-')===tParts.slice(0,-1).join('-')).map(x=>Number(x.at(-1))),0)+1;
 const newRoot=[...tParts.slice(0,-1),String(n).padStart(tParts.at(-1).length,'0')].join('-');
 const selectedFiles=[...arts,...assets];const map=new Map();const seen=new Set();
 for(const from of selectedFiles){
  const name=path.posix.basename(from).match(filename);if(!name)return fail('filename-invalid','Each selected file needs an exact numeric coordinate.');
  const dim=newRoot+name[1].slice(rootDim.length),to=path.posix.join(targetDir,`${dim}-${name[2]}`);
  if(seen.has(to)||dstInv.inventory.some(x=>x.path===to)||!safe(to))return fail('target-collision','Projected destination overlaps a physical target or another selected item.');
  seen.add(to);map.set(from,to);
 }
 const selectedArts=new Set(arts),byPath=new Map(srcInv.materials.map(x=>[x.path,x.markdown]));
 const resulting=new Map(),moves=[];
 for(const from of [...arts].sort(order)){
  const markdown=byPath.get(from);if(!markdown)return fail('artifact-missing','Selected artifact bytes missing from the scanned Workspace.');
  const self=canonicalC14nV2SelfState(markdown);
  if(self.state!=='verified')return fail('artifact-integrity-invalid','Selected artifact self integrity must verify.');
  const audit=auditPortableRecord({workspaceId:src.workspaceId,path:from,markdown},{requireExactSchemaAuthority:true});
  if(audit.qualification?.exact!==true||audit.schemaValidationAuthority?.state!=='qualified'||audit.findings.some(x=>x.severity==='error'))return fail('artifact-schema-unqualified','Every selected artifact must have qualified source schema authority and audit.');
  if(bannedText.test(markdown))return fail('dynamic-source-reference','Source contains non-Markdown or dynamic potential reference expressions.');
  const parsed=parseArtifactMarkdown(markdown);const declared=parsed.envelope?.parent?.trace||'';
  let parent='',parentDigest='',afterParentDigest='';
  if(from!==op.selectedPath){
   if(!declared||declared.includes('::')||declared.includes('\\')||declared.startsWith('/'))return fail('parent-unqualified','Each selected descendant needs one local exact Parent link.');
   let decodedParent='';try{decodedParent=decodeURIComponent(declared);}catch{return fail('parent-reference-unparseable','Parent locator is not valid percent-encoded local material.');}
   parent=path.posix.normalize(path.posix.join(dir,decodedParent));
   if(!selectedArts.has(parent)||!resulting.has(parent))return fail('parent-outside-selected','Selected descendant references a Parent outside the already-qualified closed semantic graph.');
   const originalParent=parseArtifactMarkdown(byPath.get(parent));
   if(parsed.envelope?.parent?.schema?.id!==originalParent.envelope?.current?.schema?.id ||
      String(parsed.envelope?.parent?.createdAt||'')!==String(originalParent.envelope?.current?.createdAt||''))
     return fail('parent-identity-mismatch','Declared Parent Schema and Created At must match the exact selected Parent bytes.');
   const origin=parsed.envelope?.parent?.originEntries||[];
   let originPath='';try{originPath=path.posix.normalize(path.posix.join(dir,decodeURIComponent(origin[0]?.target||'')));}catch{return fail('parent-origin-unparseable','Parent Origin must be a parseable local reference.');}
   if(origin.length!==1||origin[0].label!=='relative'||originPath!==parent)return fail('parent-origin-unqualified','Each descendant needs one exact local relative origin to the selected Parent.');
   parentDigest=canonicalC14nV2SelfState(byPath.get(parent)).declaredValue;
   afterParentDigest=canonicalC14nV2SelfState(resulting.get(parent)).declaredValue;
  }else if(declared||parsed.envelope?.parent?.schema?.id)return fail('root-parent-outside','Selected root must be Parentless: no outside Parent may be silently detached.');
  let integrityChanges=0;
  let revised=markdown.replace(/(^\s*-\s+Towards:\s*\[[^\]]*\]\(([^)]+)\)\s*\r?\n\s*-\s+Value:\s*)(\S+)/gm,(all,start,target,digest)=>{
   const resolved=path.posix.normalize(path.posix.join(dir,target));
   if(from!==op.selectedPath&&resolved===parent){
    if(digest!==parentDigest){integrityChanges=-100;return all;}
    integrityChanges++;return start+afterParentDigest;
   }
   return all;
  });
  if((from!==op.selectedPath && integrityChanges!==1)||integrityChanges<0)return fail('parent-integrity-mismatch','Original child Parent integrity digest does not match selected Parent bytes.');
  let unsupported='';
  revised=revised.replace(/(!?\[[^\]\r\n]*\]\()(<[^>\r\n]*>|(?:\\.|[^)\r\n])*)(\))/g,(all,start,raw,end)=>{
   if(unsupported)return all;
   const inner=raw.replace(/^<|>$/g,'');
   if(/^(?:https?:\/\/|mailto:)/i.test(inner))return all;
   if(!inner||inner.includes('\\')||inner.startsWith('/')||/^[a-z][a-z0-9+.-]*:/i.test(inner)){unsupported=inner;return all;}
   const base=inner.replace(/[?#].*$/,'');let decoded;try{decoded=decodeURIComponent(base);}catch{unsupported=inner;return all;}
   const sourcePath=path.posix.normalize(path.posix.join(dir,decoded));
   if(!map.has(sourcePath)){unsupported=inner;return all;}
   const suffix=inner.slice(base.length);
   return start+path.posix.basename(map.get(sourcePath))+suffix+end;
  });
  if(unsupported)return fail('unrewritable-internal-link','Source contains a local link outside the selected closed graph: '+unsupported);
  const sealed=sealC14nV2Self(revised);
  if(sealed.state!=='sealed'&&sealed.state!=='unchanged')return fail('reseal-failed','Parent reference changes could not be C14n-v2 resealed.');
  const content=sealed.markdown.endsWith('\n')?sealed.markdown:sealed.markdown+'\n';
  if(canonicalC14nV2SelfState(content).state!=='verified')return fail('output-unverified','Projected artifact self integrity failed verification.');
  resulting.set(from,content);
  moves.push({kind:'artifact',fromPath:from,toPath:map.get(from),sourceSha256:sha256Hex(utf8Bytes(markdown)),outputSha256:sha256Hex(utf8Bytes(content)),outputMarkdown:content});
 }
 for(const from of assets){const bytes=await readFile(loc(src.workspaceRoot,from));moves.push({kind:'binary-asset',fromPath:from,toPath:map.get(from),sourceSha256:sha256Hex(bytes),outputSha256:sha256Hex(bytes)});}
 const plan={schema:CROSS_WORKSPACE_GRAPH_BUNDLE_SCHEMA,status:'ready',executable:true,operation:op,
 sourceWorkspace:{workspaceId:src.workspaceId,workspaceRoot:path.resolve(src.workspaceRoot)},targetWorkspace:{workspaceId:dst.workspaceId,workspaceRoot:path.resolve(dst.workspaceRoot)},
 inspection:inspected,moves,boundary:{scope:'closed-semantic-parent-graph-with-exact-owned-assets',externalParent:false,incomingReaders:false,readOnlyPlan:true,thirdWorkspaces:'not-certified'}};
 const planFingerprint=sha256Hex(utf8Bytes(JSON.stringify({source:plan.sourceWorkspace,target:plan.targetWorkspace,operation:plan.operation,snapshots:plan.inspection.workspaceSnapshots,moves:plan.moves})));
 return {...plan,planFingerprint};
}
