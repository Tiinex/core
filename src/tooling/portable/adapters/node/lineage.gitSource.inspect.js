import path from 'node:path';
import { spawn } from 'node:child_process';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { sha256Hex, utf8Bytes } from '../../../../export/package.bytes.js';

const commitRe=/^[a-f0-9]{40}$/i;
const safe=p=>typeof p==='string' && p.startsWith('.topics/') && p.endsWith('.trace.md') && !p.includes('\\') && !p.split('/').some(x=>!x||x==='.'||x==='..');
function githubRepo(url){
  const s=String(url||'').trim();
  const m=/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(s);
  return m?.[1]||'';
}
function git(cwd,args){return new Promise(resolve=>{
  const child=spawn('git',args,{cwd,stdio:['ignore','pipe','pipe'],windowsHide:true});
  const out=[],err=[];
  child.stdout.on('data',b=>out.push(b));child.stderr.on('data',b=>err.push(b));
  child.on('error',e=>resolve({ok:false,message:String(e?.message||e)}));
  child.on('close',code=>resolve({ok:code===0,bytes:Buffer.concat(out),message:Buffer.concat(err).toString('utf8').slice(0,300)}));
});}
/** Local read-only Git source candidate. A local git object is NOT remote GitHub publication. */
export async function inspectNodeCrossWorkspaceGitSource(input={}){
 const root=typeof input.workspaceRoot==='string'&&path.isAbsolute(input.workspaceRoot)?path.resolve(input.workspaceRoot):'';
 const commit=String(input.commit||'').trim().toLowerCase(),sourcePath=String(input.sourcePath||'').trim();
 const blocked=(code,message,extra={})=>({schema:'tiinex.portable.git-source-candidate.v1',status:'blocked',qualifiedPublication:false,findings:[{severity:'error',code,message}],...extra});
 if(!root||!commitRe.test(commit)||!safe(sourcePath))return blocked('git-source.request-invalid','Exact absolute Workspace root, 40-hex commit and .topics/*.trace.md source path are required.');
 const workspace=await git(root,['rev-parse','--show-toplevel']);
 if(!workspace.ok)return blocked('git-source.repository-unavailable','Local Git is unavailable; attempt connector-based repository-read recovery.',{recovery:{action:'qualify-cross-workspace-publication',preferred:'GitHub connector/repository-read',readOnly:true}});
 const top=path.resolve(workspace.bytes.toString('utf8').trim());
 if(top!==root)return blocked('git-source.workspace-not-repository-root','Workspace root does not match Git worktree root; source Git identity is ambiguous.');
 const origin=await git(root,['remote','get-url','origin']);
 const repository=origin.ok?githubRepo(origin.bytes.toString('utf8').trim()):'';
 if(!repository)return blocked('git-source.origin-unqualified','No qualified github.com origin was found; request repository identity through read-only provider evidence.');
 const object=await git(root,['show',`${commit}:${sourcePath}`]);
 if(!object.ok)return blocked('git-source.object-unavailable','The exact pinned Git object is absent locally; try a read-only GitHub connector.',{recovery:{action:'qualify-cross-workspace-publication',repository,commit,sourcePath,readOnly:true}});
 let markdown;
 try{markdown=new TextDecoder('utf-8',{fatal:true}).decode(object.bytes);}catch{return blocked('git-source.encoding-invalid','Git blob is not exact UTF-8 Tiinex material.');}
 if(canonicalC14nV2SelfState(markdown).state!=='verified')return blocked('git-source.self-unqualified','Pinned Git blob has unqualified Tiinex self integrity.');
 if(input.expectedSha256 && sha256Hex(utf8Bytes(markdown))!==input.expectedSha256)return blocked('git-source.content-mismatch','Pinned Git blob does not match expected exact source digest.');
 return {schema:'tiinex.portable.git-source-candidate.v1',status:'candidate',qualifiedPublication:false,
  repository,commit,sourcePath,sha256:sha256Hex(object.bytes),bytes:object.bytes.length,markdown,
  proposedPermalink:`https://github.com/${repository}/blob/${commit}/${sourcePath.split('/').map(encodeURIComponent).join('/')}`,
  next:{action:'qualify-cross-workspace-publication',source:'read-only Github connector or accepted repository-read receipt'},
  boundary:{localGitReadOnly:true,remoteFetch:false,publicationNotProven:true,crossWorkspaceApply:false,remoteWrite:false}};
}
