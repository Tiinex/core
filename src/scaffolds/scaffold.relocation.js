import path from 'node:path';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../integrity/integrity.c14nV2.js';
import { parseWorkspaceQualifiedRecoveryReference, classifyParentRecoveryReference } from '../lineage/parentRecoveryReference.js';

export const SCAFFOLD_RELOCATION_PLAN_SCHEMA_ID = 'tiinex.scaffold.relocation-plan.v1';

export function projectScaffoldArtifactRelocation(input = {}) {
  const materials = (input.materials || []).map((item) => ({ workspaceId: String(item.workspaceId || ''), path: norm(item.path), markdown: String(item.markdown || '') }));
  const relocations = normalizeRelocations(input.relocations || []);
  const findings = [];
  const key=(w,p)=>`${w}::${norm(p)}`;
  const sourceByKey=new Map(materials.map((m)=>[key(m.workspaceId,m.path),m]));
  const relocatedPath=(w,p)=>mapPath(relocations,w,norm(p));
  const drafts=new Map();
  for(const material of materials){
    const toPath=relocatedPath(material.workspaceId,material.path);
    const rewritten=rewriteReferences(material.markdown,{workspaceId:material.workspaceId,fromPath:material.path,toPath,relocations});
    drafts.set(key(material.workspaceId,toPath),{workspaceId:material.workspaceId,fromPath:material.path,toPath,originalMarkdown:material.markdown,markdown:rewritten.markdown,referenceRewrites:rewritten.count,moved:toPath!==material.path,referenceChanged:rewritten.markdown!==material.markdown});
  }

  const parentByKey=new Map();
  for(const draft of drafts.values()){
    const record=createRecordFromMarkdown(draft.markdown,{path:draft.toPath,sourceMode:'scaffold-relocation-projection'});
    const trace=String(record.trace||'').trim();
    if(!trace){parentByKey.set(key(draft.workspaceId,draft.toPath),null);continue;}
    const classification=classifyParentRecoveryReference(trace);
    if(classification.kind==='malformed-workspace-qualified'){
      findings.push(finding('error','scaffold.relocation.parent-reference.malformed',`Relocated artifact ${draft.workspaceId}::${draft.toPath} carries malformed Workspace-qualified Parent recovery reference ${trace}.`,{workspaceId:draft.workspaceId,path:draft.toPath,trace}));
      parentByKey.set(key(draft.workspaceId,draft.toPath),null); continue;
    }
    const qualified=parseWorkspaceQualifiedRecoveryReference(trace);
    if(qualified){
      const targetPath=relocatedPath(qualified.workspaceId,qualified.path);
      const targetKey=key(qualified.workspaceId,targetPath);
      parentByKey.set(key(draft.workspaceId,draft.toPath),drafts.has(targetKey)?targetKey:null);
      continue;
    }
    if(isUrlLike(trace)){parentByKey.set(key(draft.workspaceId,draft.toPath),null);continue;}
    const targetPath=norm(path.posix.join(path.posix.dirname(draft.toPath),trace));
    const targetKey=key(draft.workspaceId,targetPath);
    parentByKey.set(key(draft.workspaceId,draft.toPath),drafts.has(targetKey)?targetKey:null);
  }

  const finalized=new Map(); const visiting=new Set();
  const finalize=(k)=>{
    if(finalized.has(k))return finalized.get(k);
    if(visiting.has(k)){findings.push(finding('error','scaffold.relocation.parent-cycle','Relocation reseal encountered a local Parent cycle.',{key:k}));return null;}
    visiting.add(k); const draft=drafts.get(k); if(!draft){visiting.delete(k);return null;}
    let markdown=draft.markdown; let parentIntegrityUpdated=false;
    const parentKey=parentByKey.get(k);
    if(parentKey){
      const parent=finalize(parentKey);
      if(parent?.contentChanged){
        const state=canonicalC14nV2SelfState(parent.markdown);
        if(state.state!=='verified')findings.push(finding('error','scaffold.relocation.parent-self-unqualified',`Relocated Parent ${parentKey} is not self-qualified before child reseal.`,{parentKey,state:state.state}));
        else {
          const updated=replacePrimaryParentIntegrityValue(markdown,state.declaredValue);
          if(updated.state!=='updated')findings.push(finding('error','scaffold.relocation.parent-integrity-unrepresentable',`Artifact ${k} could not bind its local Parent self digest during relocation.`,{key:k,reason:updated.reason}));
          else {markdown=updated.markdown;parentIntegrityUpdated=updated.changed;}
        }
      }
    }
    const contentChanged=draft.referenceChanged||parentIntegrityUpdated;
    let selfResealed=false;
    if(contentChanged){
      const sealed=sealC14nV2Self(markdown);
      if(sealed.state!=='sealed')findings.push(finding('error','scaffold.relocation.self-reseal-failed',`Artifact ${k} could not be self-resealed after relocation.`,{key:k,state:sealed.state,reason:sealed.reason||''}));
      else {markdown=sealed.markdown+(draft.originalMarkdown.endsWith('\n')?'\n':'');selfResealed=true;}
    } else markdown=draft.originalMarkdown;
    const out=Object.freeze({...draft,markdown,parentIntegrityUpdated,selfResealed,contentChanged}); finalized.set(k,out);visiting.delete(k);return out;
  };
  for(const k of drafts.keys())finalize(k);
  const outputs=[...finalized.values()].sort((a,b)=>a.workspaceId.localeCompare(b.workspaceId)||a.toPath.localeCompare(b.toPath));
  const errors=findings.filter((x)=>x.severity==='error').length;
  return Object.freeze({schema:SCAFFOLD_RELOCATION_PLAN_SCHEMA_ID,status:errors?'blocked':'ready',executable:errors===0,mutationPerformed:false,outputs:Object.freeze(outputs),relocations:Object.freeze(relocations),findings:Object.freeze(findings),findingSummary:Object.freeze({error:errors,warning:findings.filter(x=>x.severity==='warning').length,total:findings.length}),summary:Object.freeze({materials:materials.length,moved:outputs.filter(x=>x.moved).length,referenceRewrites:outputs.reduce((n,x)=>n+x.referenceRewrites,0),parentIntegrityUpdates:outputs.filter(x=>x.parentIntegrityUpdated).length,selfResealed:outputs.filter(x=>x.selfResealed).length,byteChanged:outputs.filter(x=>x.contentChanged).length}),boundary:'Read-only projectable relocation transform. It rebases relative/Workspace-qualified artifact references, updates locally resolvable Parent integrity digests in Parent-first order, and self-reseals outputs. It never writes, deletes, commits, or infers lifecycle authority.'});
}

function rewriteReferences(markdown,{workspaceId,fromPath,toPath,relocations}){
  let count=0;
  let out=String(markdown||'').replace(/\[([^\]]*)\]\(([^)]+)\)/g,(full,label,target)=>{
    const next=rewriteTarget(target,{workspaceId,fromPath,toPath,relocations}); if(next!==target){count++;return `[${label}](${next})`;} return full;
  });
  out=out.replace(/\b([A-Za-z0-9._-]+)::((?:\.topics|src|test|tools|docs)\/[^\s)`\]>,;]+)/g,(full,targetWs,targetPath)=>{
    const next=mapPath(relocations,targetWs,norm(targetPath)); if(next!==norm(targetPath)){count++;return `${targetWs}::${next}`;}return full;
  });
  return {markdown:out,count};
}
function rewriteTarget(target,{workspaceId,fromPath,toPath,relocations}){
  const raw=String(target||''); if(!raw||raw.startsWith('#')||raw.startsWith('/')||isUrlLike(raw))return raw;
  const q=parseWorkspaceQualifiedRecoveryReference(raw); if(q){const next=mapPath(relocations,q.workspaceId,q.path);return next===q.path?raw:`${q.workspaceId}::${next}`;}
  if(raw.includes('::'))return raw;
  const suffixIndex=Math.min(...[raw.indexOf('#'),raw.indexOf('?')].filter(x=>x>=0),raw.length); const core=raw.slice(0,suffixIndex);const suffix=raw.slice(suffixIndex); if(!core)return raw;
  const oldTarget=norm(path.posix.join(path.posix.dirname(fromPath),core)); const newTarget=mapPath(relocations,workspaceId,oldTarget); if(fromPath===toPath&&oldTarget===newTarget)return raw;
  const next=path.posix.relative(path.posix.dirname(toPath),newTarget)||path.posix.basename(newTarget); return next+suffix;
}
function replacePrimaryParentIntegrityValue(markdown,value){
  const lines=String(markdown||'').replace(/\r\n?/g,'\n').split('\n'); const start=lines.findIndex(l=>l==='# Continuity Integrity'); if(start<0)return {state:'blocked',reason:'integrity-footer-missing',markdown};
  let inEntry=false,isC14n=false,towards='',valueIndex=-1; const candidates=[];
  const flush=()=>{if(inEntry&&isC14n&&towards&&towards!=='self'&&valueIndex>=0)candidates.push(valueIndex);inEntry=false;isC14n=false;towards='';valueIndex=-1;};
  for(let i=start+1;i<lines.length;i++){
    if(/^#\s+/.test(lines[i])){flush();break;}
    const top=lines[i].match(/^-\s+(.+?)\s*$/); if(top){flush();inEntry=true;isC14n=stripLink(top[1])==='sha256-base64url-c14n-v2';continue;}
    if(!inEntry)continue; const t=lines[i].match(/^\s+-\s+Towards:\s*(.*?)\s*$/); if(t)towards=stripLink(t[1]); const v=lines[i].match(/^(\s+-\s+Value:)([ \t]*)(.*)$/); if(v)valueIndex=i;
  } flush();
  if(candidates.length!==1)return {state:'blocked',reason:candidates.length?'multiple-parent-integrity-entries':'parent-integrity-entry-missing',markdown};
  const i=candidates[0];const m=lines[i].match(/^(\s+-\s+Value:)([ \t]*)(.*)$/);const current=m?.[3]?.trim()||'';lines[i]=`${m[1]}${m[2]}${value}`;return {state:'updated',changed:current!==value,markdown:lines.join('\n')};
}
function normalizeRelocations(values){return values.map(x=>Object.freeze({workspaceId:String(x.workspaceId||''),from:norm(x.from),to:norm(x.to)})).filter(x=>x.workspaceId&&x.from&&x.to).sort((a,b)=>b.from.length-a.from.length);}
function mapPath(relocations,workspaceId,p){for(const r of relocations){if(r.workspaceId!==workspaceId)continue;if(p===r.from||p.startsWith(r.from+'/'))return r.to+p.slice(r.from.length);}return p;}
function norm(v=''){return path.posix.normalize(String(v||'').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\/+/,''));}
function isUrlLike(v=''){return /^[a-z][a-z0-9+.-]*:/i.test(String(v||''));}
function stripLink(v=''){const s=String(v||'').trim();const m=s.match(/^\[([^\]]+)\]\([^)]+\)$/);return (m?m[1]:s).trim();}
function finding(severity,code,message,params={}){return Object.freeze({severity,code,message,params:Object.freeze({...params})});}
