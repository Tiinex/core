import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createRecordFromMarkdown } from '../../../../artifacts/artifact.record.js';
import { inspectPortableWorkspaceReferenceInventory } from './lineage.scoped-move.inspect.js';
import { projectPortableMoveSelection } from '../../lineage/lineage.move-selection.js';
import { qualifyCrossWorkspacePublication } from '../../lineage/lineage.crossWorkspacePublication.js';
import { hasResolvableNonMarkdownReference } from './asset.relocation.inspect.js';

export const CROSS_WORKSPACE_CONTINUITY_INSPECTION_SCHEMA_ID='tiinex.portable.cross-workspace-continuity-inspection.v1';
const textExtensions=new Set(['.md','.txt','.json','.jsonc','.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.htm','.css','.scss','.yaml','.yml','.xml','.svg','.toml','.sh','.ps1']);
const safeMaterialPath=p=>typeof p==='string'&&p.startsWith('.topics/')&&!p.includes('\\')&&!p.split('/').some(x=>!x||x==='.'||x==='..');
const sourcePathSafe=p=>safeMaterialPath(p)&&p.endsWith('.trace.md');
const issue=(code,message,context={})=>({severity:'error',code:`cross-workspace.inspect.${code}`,message,...context});
const digest=(scan)=>({workspaceId:scan.workspaceId,root:scan.workspaceRoot,snapshotSha256:scan.snapshotSha256,
  count:scan.inventory.length,excludedTrees:scan.excludedTrees,coverage:'supported-local-snapshot-only'});
const normalizeLink=(link,fromPath)=>{
  const value=link.replace(/[?#].*$/,'');
  // Workspace-qualified locators use :: and must be parsed BEFORE the URI-scheme rule.
  if(value.includes('::')) {
    const match=/^([\w.-]+)::(.+)$/.exec(value);
    if(match){
      let decoded='';try{decoded=decodeURIComponent(match[2]);}catch{return {kind:'unsafe',path:value};}
      if(safeMaterialPath(decoded))return {kind:'workspace',workspaceId:match[1],path:decoded};
    }
    return {kind:'unsafe',path:value};
  }
  if(!value||/^[a-z][a-z0-9+.-]*:/i.test(value))return {kind:'external',path:value};
  if(value.startsWith('/')||value.includes('\\'))return {kind:'unsafe',path:value};
  try{
    const decoded=decodeURIComponent(value);
    if(decoded.includes('\\')||decoded.includes('\0'))return {kind:'unsafe',path:value};
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(fromPath),decoded));
    return resolved.startsWith('.topics/')?{kind:'local',path:resolved}:{kind:'outside',path:resolved};
  }catch{return {kind:'unsafe',path:value};}
};
/** Plain Markdown references, plus a small set of syntactically resolvable
 * non-Markdown literals. A complete source-language dataflow analyzer is NOT
 * claimed. Unsupported/dynamic sources remain an explicit release blocker. */
function crossWorkspaceReferenceEdges({workspaceId,file,text,moving,sourceWorkspaceId}) {
  const edges=[],warnings=[],seen=new Set();
  const emit=(kind,locator)=>{
    const target=normalizeLink(locator,file);
    const incoming=(target.kind==='local'&&workspaceId===sourceWorkspaceId&&moving.has(target.path))||
      (target.kind==='workspace'&&target.workspaceId===sourceWorkspaceId&&moving.has(target.path));
    if(incoming){
      const key=`${kind}:${locator}:${target.path}`;
      if(seen.has(key))return;
      seen.add(key);
      edges.push({fromWorkspaceId:workspaceId,fromPath:file,kind,locator,
        toWorkspaceId:target.workspaceId||workspaceId,toPath:target.path});
    }else if(target.kind==='unsafe'&&[...moving].some(p=>locator.includes(path.posix.basename(p)))){
      warnings.push(`ambiguous-reference:${file}:${locator}`);
    }
  };
  // One conservative reference classifier shared by both executable two-root
  // variants and read-only inspection. Reference definitions and HTML/CSS
  // locators are incoming edges too, even if no inline Markdown link exists.
  for(const match of text.matchAll(/!?\[[^\]\r\n]*\]\((<[^>\r\n]*>|(?:\\.|[^)\r\n])*)\)/g))
    emit('markdown-link',match[1].replace(/^<|>$/g,''));
  if(file.endsWith('.md')){
    for(const match of text.matchAll(/^\s{0,3}\[[^\]\r\n]+\]:\s*(?:<([^>\r\n]+)>|([^\s]+))/gm))
      emit('markdown-reference-definition',match[1]||match[2]);
  }
  for(const match of text.matchAll(/\b(?:src|href)\s*=\s*(?:["']([^"'\r\n]+)["']|([^\s<>"']+))/gi))
    emit('html-attribute',match[1]||match[2]);
  for(const match of text.matchAll(/\burl\s*\(\s*(?:["']([^"'\r\n]+)["']|([^\s)'"<>]+))\s*\)/gi))
    emit('css-url',match[1]||match[2]);
  if(!file.endsWith('.md')){
    for(const movingPath of moving){
      if(workspaceId===sourceWorkspaceId&&hasResolvableNonMarkdownReference(text,file,movingPath))
        emit('non-markdown-path-literal',movingPath);
      // Existing exact workspace-qualified text contract deliberately blocks
      // JSON/YAML/code paths; prose substrings alone have no rewrite owner.
      const token=`${sourceWorkspaceId}::${movingPath}`;
      if(text.includes(token))emit('cross-workspace-qualified-text',token);
    }
  }
  return {edges,warnings};
}

/** Conservative two-Workspace PREVIEW. Never claims an executable Apply:
 * existing journals and scaffold graph rewriting still address one Workspace
 * per change, so a cross-Workspace transfer needs a new qualified multi-root
 * source/destination change model rather than inventing successful mutation.
 */
export async function inspectPortableCrossWorkspaceContinuity(input={}) {
  const source=input.sourceWorkspace||{};
  const target=input.targetWorkspace||{};
  const operation=input.operation||{};
  const findings=[];
  const additional=Array.isArray(input.additionalWorkspaces)?input.additionalWorkspaces:[];
  const participants=[source,target,...additional];
  const ids=participants.map(w=>String(w?.workspaceId||''));
  const roots=participants.map(w=>w?.workspaceRoot?path.resolve(String(w.workspaceRoot)):'');
  if(!source.workspaceId||!target.workspaceId||source.workspaceId===target.workspaceId ||
    !source.workspaceRoot||!target.workspaceRoot ||
    path.resolve(String(source.workspaceRoot))===path.resolve(String(target.workspaceRoot)) ||
    operation.kind!=='scoped-move'||operation.workspaceId!==source.workspaceId||
    operation.targetWorkspaceId!==target.workspaceId||!sourcePathSafe(operation.selectedPath)||
    !sourcePathSafe(operation.targetPath))
    return {schema:CROSS_WORKSPACE_CONTINUITY_INSPECTION_SCHEMA_ID,status:'blocked',executable:false,
      findings:[issue('request-invalid','Two distinct roots and explicit source/target Workspace identities, selected trace and target anchor are required.')]};
  if(participants.some((w,i)=>!w?.workspaceId||!path.isAbsolute(String(w.workspaceRoot||'')) ||
      ids.indexOf(ids[i])!==i || roots.indexOf(roots[i])!==i))
    return {schema:CROSS_WORKSPACE_CONTINUITY_INSPECTION_SCHEMA_ID,status:'blocked',inspectionStatus:'blocked',executable:false,
      findings:[issue('workspace-census-invalid','Each supplied Workspace must have one distinct identity and absolute physical root.')]};
  const scans=await Promise.all(participants.map((w,i)=>inspectPortableWorkspaceReferenceInventory({
    ...w,selectedPath:i===0?operation.selectedPath:i===1?operation.targetPath:''
  })));
  const [sourceScan,targetScan]=scans;
  if(scans.some(scan=>scan.status!=='ready')) {
    return {schema:CROSS_WORKSPACE_CONTINUITY_INSPECTION_SCHEMA_ID,status:'blocked',inspectionStatus:'blocked',executable:false,
      findings:[issue('inventory-unqualified','All supplied Workspace inventories must qualify before further planning.',
        {workspaceFindings:scans.map((scan,i)=>({workspaceId:participants[i]?.workspaceId,findings:scan.findings||[]})).filter(x=>x.findings.length)})]};
  }
  const targetAnchor=targetScan.materials.find(m=>m.path===operation.targetPath);
  if(!targetAnchor)findings.push(issue('anchor-unqualified','The target anchor must exist and be an independently verified Tiinex artifact.'));
  const selection=projectPortableMoveSelection({workspaceId:source.workspaceId,selectedPath:operation.selectedPath,
    scope:operation.scope,materials:sourceScan.materials,assetPaths:sourceScan.assetPaths,representationCoverage:'complete'});
  if(selection.status!=='ready')findings.push(issue('selection-unqualified','Source semantic selection is not qualified.',{sourceFindings:selection.findings}));
  const moved=new Set([...selection.artifactPaths||[],...selection.assetPaths||[]]);
  const edges=[],warnings=[];
  for(const scan of scans) {
    for(const item of scan.inventory) {
      if(!textExtensions.has(path.posix.extname(item.path).toLowerCase()))continue;
      const text=item.path.endsWith('.trace.md')
        ?scan.materials.find(m=>m.path===item.path)?.markdown
        :(await readFile(path.join(scan.workspaceRoot,item.path),'utf8'));
      if(typeof text!=='string')continue;
      const next=crossWorkspaceReferenceEdges({workspaceId:scan.workspaceId,file:item.path,text,
        moving:moved,sourceWorkspaceId:source.workspaceId});
      edges.push(...next.edges);warnings.push(...next.warnings);
    }
  }
  const incoming=edges.filter(e=>e.fromWorkspaceId!==source.workspaceId || !moved.has(e.fromPath));
  // Selected assets/documents may be rewritten ONLY through the Core
  // Markdown-inline rebind that the bundle/graph projector actually owns.
  // A reference definition, raw HTML or CSS URL inside selected material
  // would otherwise survive the coordinate change and silently dangle.
  const unsupportedSelectedReferences=edges.filter(e=>e.fromWorkspaceId===source.workspaceId &&
    moved.has(e.fromPath) && e.kind!=='markdown-link');
  if(unsupportedSelectedReferences.length)findings.push(issue('selected-reference-syntax-unqualified',
    'Selected material contains references outside the supported inline Markdown rewrite surface.',
    {edges:unsupportedSelectedReferences}));
  const outgoing=[];
  for(const item of sourceScan.materials.filter(x=>selection.artifactPaths.includes(x.path))) {
    const record=createRecordFromMarkdown(item.markdown,{path:item.path});
    const raw=String(record.trace||'');
    if(!raw)continue;
    const link=normalizeLink(raw,item.path);
    if(link.kind==='local'&&!moved.has(link.path))outgoing.push({sourcePath:item.path,parentPath:link.path,
      publicationRequired:true,reason:'Parent currently remains in the source Workspace'});
    else if(link.kind==='workspace'||link.kind==='external'||link.kind==='outside'||link.kind==='unsafe')
      outgoing.push({sourcePath:item.path,parentPath:raw,publicationRequired:true,
        reason:'Parent cross-Workspace provenance requires independent qualification'});
  }
  const desired=selection.artifactPaths.map(src=>({fromWorkspaceId:source.workspaceId,fromPath:src,
    toWorkspaceId:target.workspaceId,proposedAnchor:operation.targetPath,coordinate:'pending-target-namespace-allocation'}));
  const hints=input.publication||{};
  const sourceArtifact=sourceScan.materials.find(x=>x.path===operation.selectedPath);
  const publicationRecovery=qualifyCrossWorkspacePublication({
    sourceWorkspaceId:source.workspaceId,targetWorkspaceId:target.workspaceId,
    repository:hints.repository,commit:hints.commit,sourcePath:hints.sourcePath||operation.selectedPath,
    markdown:sourceArtifact?.markdown||'',availableTools:input.availableTools||[],
    hostPlan:input.hostPlan,hostReceipt:input.hostReceipt
  });
  if(incoming.length)findings.push(issue('incoming-references-require-rebind',
    'Incoming references in both Workspaces must be rebound to a qualified live target or immutable published source before Apply.',{edges:incoming}));
  // The selected material and every *left-behind Parent* are different
  // immutable Git objects. Do not reuse a selected-child permalink as proof
  // for its retained parent. Give the host an exact read request for each.
  const parentPublicationRecoveries=outgoing.filter(o=>o.parentPath.startsWith('.topics/'))
    .map(o=>{
      const parent=sourceScan.materials.find(m=>m.path===o.parentPath);
      return {childPath:o.sourcePath,parentPath:o.parentPath,
        recovery:qualifyCrossWorkspacePublication({
          sourceWorkspaceId:source.workspaceId,targetWorkspaceId:target.workspaceId,
          repository:hints.repository,commit:hints.commit,sourcePath:o.parentPath,
          markdown:parent?.markdown||'',availableTools:input.availableTools||[]
        })};
    });
  if(outgoing.length)findings.push(issue('parent-continuity-required',
    'Moved artifacts still depend on Parents outside the moved selection; preserve live identity or qualify immutable Git evidence.',{parents:outgoing}));
  if(warnings.length)findings.push(issue('ambiguous-references','Some source references are not safely parseable.',{warnings}));
  findings.push(issue('cross-workspace-transaction-unqualified',
    'Existing Core transaction cannot yet atomically rebind two Workspace identities. This is a read-only continuation preview; no Apply is authorized.'));
  return {schema:CROSS_WORKSPACE_CONTINUITY_INSPECTION_SCHEMA_ID,status:'blocked',
    inspectionStatus:targetAnchor && selection.status==='ready' && !warnings.length && !unsupportedSelectedReferences.length?'qualified':'blocked',executable:false,
    workspaceSnapshots:scans.map(digest),selection,
    targetAnchor:{workspaceId:target.workspaceId,path:operation.targetPath},
    proposedMoves:desired,assetPaths:selection.assetPaths,
    inboundReferences:incoming,unsupportedSelectedReferences,outboundParentDependencies:outgoing,
    publicationRecovery,parentPublicationRecoveries,findings,
    boundary:{readOnly:true,remoteMutation:false,twoPhysicalWorkspacesInspected:true,allSupportedLocalBytesFingerprint:true,
      inspectedAdditionalWorkspaces:additional.length,
      suppliedWorkspaceCensusOnly:true,ignoredTreesNeedSeparateQualification:true,liveReferenceRewriteMissing:true,
      atomicTwoRootApplyMissing:true,connectorReadRecoveryAvailable:true}};
}

/** Recheck every participant in the exact read-only inspection, including
 * any explicitly supplied external readers. Never grants Apply authority. */
export async function recheckPortableCrossWorkspaceContinuity(input={}) {
  const inspected=input.inspection||{};
  const known=Array.isArray(inspected.workspaceSnapshots)?inspected.workspaceSnapshots:[];
  if(inspected.schema!==CROSS_WORKSPACE_CONTINUITY_INSPECTION_SCHEMA_ID || known.length<2 ||
    inspected.inspectionStatus!=='qualified' || inspected.executable!==false)
    return {schema:'tiinex.portable.cross-workspace-snapshot-recheck.v1',status:'blocked',executable:false,
      findings:[issue('previous-inspection-unqualified','Use one exact previously qualified read-only Workspace inspection.')]};
  const supplied=[input.sourceWorkspace,input.targetWorkspace,...(Array.isArray(input.additionalWorkspaces)?input.additionalWorkspaces:[])];
  const findings=[];
  if(supplied.length!==known.length || new Set(supplied.map(w=>w?.workspaceId)).size!==known.length)
    findings.push(issue('workspace-census-drift','The exact inspected Workspace census is required for recheck.'));
  for(const old of known) {
    const candidate=supplied.find(w=>w?.workspaceId===old.workspaceId);
    if(!candidate || !candidate.workspaceRoot || path.resolve(candidate.workspaceRoot)!==old.root) {
      findings.push(issue('workspace-root-drift','Original inspected Workspace root or identity has changed.',{workspaceId:old.workspaceId}));
      continue;
    }
    const refreshed=await inspectPortableWorkspaceReferenceInventory(candidate);
    if(refreshed.status!=='ready' || refreshed.snapshotSha256!==old.snapshotSha256 || refreshed.inventory.length!==old.count)
      findings.push(issue('workspace-snapshot-drift','An inspected Workspace changed after inspection.',
        {workspaceId:old.workspaceId,oldSnapshot:old.snapshotSha256,newSnapshot:refreshed.snapshotSha256||'',sourceFindings:refreshed.findings||[]}));
  }
  return {schema:'tiinex.portable.cross-workspace-snapshot-recheck.v1',
    status:findings.length?'blocked':'ready',executable:false,readOnly:true,
    snapshots:known.map(x=>({workspaceId:x.workspaceId,snapshotSha256:x.snapshotSha256})),findings,
    boundary:'Every supplied Workspace snapshot digest still matches. This is NOT multi-Workspace mutation authority.'};
}
