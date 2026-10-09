import path from 'node:path';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { stableFingerprintBytes, sha256Hex, utf8Bytes } from '../../../../export/package.bytes.js';
import { cleanRelative, projectPortableAssetRelocation } from '../../lineage/asset.relocation.projection.js';
import { projectAssetReferenceRebind } from '../../lineage/asset.reference-rebind.js';

const IGNORED = new Set(['.git','.tiinex','node_modules']);
const TEXT_EXT = new Set(['.md','.txt','.json','.jsonc','.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.htm','.css','.scss','.yaml','.yml','.xml','.svg','.toml','.sh','.ps1']);
const MAX_TEXT_BYTES = 8 * 1024 * 1024;

/** Local-node inspection, not source/semantic authority: non-text references
 * cannot be inferred. The caller must explicitly accept this format boundary. */
export async function inspectPortableAssetRelocationWorkspace(input={}) {
  const findings=[];
  const root=typeof input.workspaceRoot==='string'&&path.isAbsolute(input.workspaceRoot)?path.resolve(input.workspaceRoot):'';
  const workspaceId=String(input.workspaceId||'').trim();
  const directory=cleanRelative(input.targetDirectory,true);
  const dimension=String(input.lineageDimension||'');
  const requested=Array.isArray(input.assetPaths)?input.assetPaths:[];
  if(!root||!workspaceId||!directory||!requested.length||requested.some(x=>!cleanRelative(x))) return blocked('asset-relocation.inspect.request-unqualified','Require an absolute workspaceRoot, Workspace identity, safe targetDirectory and explicit assetPaths.');
  const assets=[];
  const archive=new Map();
  async function visit(dir='') {
    const abs=dir?path.join(root,dir):root;
    for(const entry of (await readdir(abs,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (IGNORED.has(entry.name))continue;
      const relative=dir?`${dir}/${entry.name}`:entry.name;
      if (!cleanRelative(relative)) {findings.push(`unsafe-path:${relative}`);continue;}
      const stat=await lstat(path.join(root,relative));
      if(stat.isSymbolicLink()){findings.push(`symlink-outside-inventory:${relative}`);continue;}
      if(stat.isDirectory()){await visit(relative);continue;}
      if(!stat.isFile()){findings.push(`special-file:${relative}`);continue;}
      const ext=path.posix.extname(relative).toLowerCase();
      if(!TEXT_EXT.has(ext) && !requested.includes(relative)) continue; // Binary metadata cannot establish path-reference semantics.
      if(stat.size>MAX_TEXT_BYTES && !requested.includes(relative)){findings.push(`text-size-exceeded:${relative}`);continue;}
      archive.set(relative,await readFile(path.join(root,relative)));
    }
  }
  try {
    const rootStat=await lstat(root);
    if (!rootStat.isDirectory()||rootStat.isSymbolicLink())return blocked('asset-relocation.inspect.root-unsafe','Workspace root must be a physical directory.');
    await visit();
  } catch(error) {return blocked('asset-relocation.inspect.workspace-unreadable',String(error?.message||error));}
  const selected=new Set(requested);
  if(selected.size!==requested.length) findings.push('asset-path-duplicate');
  const targetDirectoryEntries=[...archive.keys()].filter(p=>path.posix.dirname(p)===directory);
  // Extra binary target entries must be enumerated without reading their bytes.
  try {
    const entries=await readdir(path.join(root,directory),{withFileTypes:true});
    for(const e of entries) {
      const p=path.posix.join(directory,e.name);
      if(!targetDirectoryEntries.includes(p)) targetDirectoryEntries.push(p);
    }
  }catch(error){if(error?.code!=='ENOENT')findings.push(`target-directory-unreadable:${error?.message||error}`);}
  const targetMap=new Map(requested.map(x=>[x,x]));
  const refs=new Map(requested.map(x=>[x,new Set()]));
  const referenceMaterials=[];
  for(const [relative,bytes] of archive) {
    if (selected.has(relative)) continue;
    const ext=path.posix.extname(relative).toLowerCase();
    if(!TEXT_EXT.has(ext))continue;
    let content;
    try {content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
    catch{findings.push(`invalid-utf8:${relative}`);continue;}
    if(!relative.endsWith('.md')) {
      if(requested.some(x=>content.includes(x)||content.includes(path.posix.basename(x))))findings.push(`non-markdown-reference-possible:${relative}`);
      continue;
    }
    const projected=projectAssetReferenceRebind({markdown:content,sourcePath:relative,assetPaths:targetMap});
    if(projected.findings.length) findings.push(...projected.findings);
    if(projected.refs.length){referenceMaterials.push({path:relative,markdown:content});for(const r of projected.refs) refs.get(r.assetPath)?.add(relative);}
  }
  for(const assetPath of requested){
    let bytes=archive.get(assetPath);
    if(!bytes) { try {
      const stat=await lstat(path.join(root,assetPath));
      if(!stat.isFile()||stat.isSymbolicLink())throw Error('unsafe-file');
      bytes=await readFile(path.join(root,assetPath));
    }catch { findings.push(`source-unavailable:${assetPath}`);continue; }}
    if(assetPath.endsWith('.trace.md')){findings.push(`artifact-not-binary:${assetPath}`);continue;}
    assets.push({path:assetPath,fingerprint:stableFingerprintBytes(bytes),sha256:sha256Hex(bytes),referencedBy:[...(refs.get(assetPath)||[])].sort()});
  }
  const scanEvidence={ mode:'local-workspace-supported-text-v1', scannedTextFiles:archive.size - assets.length, excludedTrees:[...IGNORED].sort(), boundary:'Checks all enumerated supported UTF-8 text and Markdown links; binary/proprietary metadata or arbitrary runtime references are not certified.' };
  if(findings.length)return blocked('asset-relocation.inspect.references-or-source-uncertain','Workspace inventory cannot be safely projected.',{findings,scanEvidence});
  const projected=projectPortableAssetRelocation({workspaceId,targetDirectory:directory,lineageDimension:dimension,assets,referenceMaterials,targetDirectoryEntries,artifactCreation:input.artifactCreation,representationCoverage:'complete',referenceCoverage:'complete',inspectionMode:scanEvidence.mode});
  return Object.freeze({...projected,inspection:scanEvidence});
  function blocked(code,message,detail={}) {return Object.freeze({schema:'tiinex.portable.asset-relocation-workspace-inspection.v1',status:'blocked',executable:false,findings:[{severity:'error',code,message,...detail}],findingSummary:{error:1,warning:0,total:1}});}
}
