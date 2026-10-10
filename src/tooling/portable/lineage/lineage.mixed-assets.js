import path from 'node:path';

// Qualified, read-only adapter from the directory-local selection to the
// EXISTING lineage transaction. Never projects bytes or guesses file owners.
export function projectScopedAssetChanges({ input, selection, projected, workspaceId }) {
  const findings=[];
  const fail=(code, message)=>findings.push({severity:'error',code:`lineage-maintenance.${code}`,message});
  const assets=selection.assetPaths;
  if (!assets.length) return {inputs:[],changes:[],relocations:[],findings};
  if (input.referenceCoverage !== 'complete') fail('asset-reference-coverage-required','A complete Workspace reference inventory is required before an artifact and its assets can be moved together.');
  const identity=(p)=>/^([0-9]+(?:-[0-9]+)*)-(.+)$/.exec(path.posix.basename(p));
  const safe=(p)=>typeof p==='string' && p && !p.includes('\\') && !p.startsWith('/') && !p.split('/').some(x=>!x||x==='.'||x==='..') && !p.includes('\0');
  const sourceDirectory=selection.directory;
  const knownAssets=new Set((input.assetPaths||[]).map(x=>typeof x==='string'?x:x?.path));
  const assetMaterials=Array.isArray(input.assetMaterials)?input.assetMaterials:[];
  const byPath=new Map();
  for (const item of assetMaterials) {
    if (!safe(item?.path)||byPath.has(item.path) || item.workspaceId && item.workspaceId !==workspaceId) { fail('asset-material-invalid','Asset materials must have unique exact Workspace-relative identities.');continue; }
    byPath.set(item.path,item);
  }
  if (byPath.size !== assets.length || [...byPath.keys()].some(x=>!assets.includes(x))) fail('asset-inventory-mismatch','Each selected binary asset must have exactly one strong source fingerprint; unrelated inputs are forbidden.');
  const destinations=new Set();
  const changes=[],inputs=[],relocations=[];
  for (const src of assets) {
    const item=byPath.get(src);
    if (!item)continue;
    const old=identity(src);
    const owner=selection.artifactPaths.find(p=>identity(p)?.[1]===old?.[1]);
    if (!old||!owner||!safe(src)||path.posix.dirname(src)!==sourceDirectory || src.endsWith('.trace.md')) {fail('asset-owner-unqualified',`The selected asset has no unique selected artifact sharing its exact dimension: ${src}`);continue;}
    const ext=path.posix.extname(src).toLowerCase();
    if (!['.png','.jpg','.jpeg','.gif','.webp','.pdf','.avif','.bmp','.ico','.mp4','.mov','.wav','.mp3','.zip','.bin'].includes(ext)) {fail('asset-format-unqualified',`The selected file is not a supported opaque binary: ${src}`);continue;}
    if (!/^tixfp1-[a-f0-9]{8}$/.test(item.fingerprint||'')||!/^[a-f0-9]{64}$/.test(item.sha256||'')) {fail('asset-fingerprint-invalid',`Selected binary asset lacks a strong source digest: ${src}`);continue;}
    const toOwner=projected.pathMap.get(`${workspaceId}::${owner}`)||owner;
    const newDimension=identity(toOwner)?.[1];
    if (!newDimension){fail('asset-destination-unqualified',`Selected artifact has no projected dimension: ${owner}`);continue;}
    const dest=path.posix.join(path.posix.dirname(toOwner),`${newDimension}-${old[2]}`);
    if (destinations.has(dest) || (knownAssets.has(dest) && !assets.includes(dest)) || (src!==dest && input.materials?.some(m=>m.path===dest))) {fail('asset-destination-collision',`Asset destination is occupied: ${dest}`);continue;}
    destinations.add(dest);
    inputs.push({workspaceId,path:src,fingerprint:item.fingerprint,sha256:item.sha256});
    changes.push({workspaceId,fromPath:src,toPath:dest,beforeFingerprint:item.fingerprint,afterFingerprint:item.fingerprint,sha256:item.sha256,kind:'binary-asset',pathChanged:src!==dest,bytesChanged:false});
    if (src!==dest)relocations.push({workspaceId,from:src,to:dest});
  }
  return {inputs,changes,relocations,findings};
}
