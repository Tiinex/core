import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';

export const LINEAGE_MOVE_SELECTION_SCHEMA_ID = 'tiinex.portable.lineage-move-selection.v1';
export const MOVE_SELECTION_SCOPES = Object.freeze(['alone', 'alone-with-assets', 'self-and-leaves', 'branch', 'tree']);

/** Pure, qualified, directory-local selection. The caller provides COMPLETE
 * artifact and ordinary-file inventories. This is a *selection* contract, not
 * an executable mixed artifact/binary transaction. Semantic edges only come
 * from exact Parent.Trace identities, never from filename prefix similarity. */
export function projectPortableMoveSelection(input = {}) {
  const issues = [];
  const issue = (code, detail = '') => issues.push(Object.freeze({ severity: 'error', code: `lineage-move-selection.${code}`, detail }));
  const workspaceId = String(input.workspaceId || '');
  const selectedPath = strictPath(input.selectedPath);
  const scope = String(input.scope || 'alone');
  const artifacts = Array.isArray(input.materials) ? input.materials : [];
  const assets = Array.isArray(input.assetPaths) ? input.assetPaths : [];
  const coverage = String(input.representationCoverage || '');
  if (!workspaceId || !selectedPath) issue('selection-required');
  if (coverage !== 'complete') issue('complete-representation-required');
  if (!MOVE_SELECTION_SCOPES.includes(scope)) issue('scope-unsupported');
  const directory = selectedPath ? path.posix.dirname(selectedPath) : '';
  const local = new Map();
  const knownAssets = new Set();
  for (const item of artifacts) {
    const pathname = strictPath(item?.path);
    if (!pathname || typeof item?.markdown !== 'string' || !pathname.endsWith('.trace.md') || String(item?.workspaceId || workspaceId) !== workspaceId || local.has(pathname)) {
      issue('artifact-material-invalid', String(item?.path || '')); continue;
    }
    if (path.posix.dirname(pathname) !== directory) continue;
    const state = canonicalC14nV2SelfState(item.markdown);
    if (state.state !== 'verified') { issue('artifact-self-unqualified', pathname); continue; }
    const parsed = parseArtifactMarkdown(item.markdown);
    const trace = String(parsed.envelope?.parent?.trace || '').trim();
    if (trace && (trace.includes('::') || /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(trace))) {
      // External parent is not a directory-local edge; never follow it.
      local.set(pathname, { path: pathname, markdown:item.markdown, trace, parent: '' });
      continue;
    }
    const parent = trace ? strictPath(path.posix.normalize(path.posix.join(directory, trace))) : '';
    if (trace && !parent) issue('parent-path-unsafe', pathname);
    local.set(pathname, { path: pathname, markdown:item.markdown, trace, parent: parent && path.posix.dirname(parent) === directory ? parent : '' });
  }
  for (const item of assets) {
    const pathname = strictPath(typeof item === 'string' ? item : item?.path);
    if (!pathname || pathname.endsWith('.trace.md') || knownAssets.has(pathname)) { issue('asset-path-invalid-or-duplicate', String(pathname || item)); continue; }
    if (path.posix.dirname(pathname) === directory) knownAssets.add(pathname);
  }
  const selectedArtifact = selectedPath.endsWith('.trace.md');
  if (selectedArtifact && !local.has(selectedPath)) issue('selected-artifact-unqualified', selectedPath);
  if (!selectedArtifact && !knownAssets.has(selectedPath)) issue('selected-asset-unavailable', selectedPath);
  if (!selectedArtifact && scope !== 'alone') issue('ordinary-asset-only-alone');
  const children = new Map();
  for (const record of local.values()) {
    if (!record.parent || !local.has(record.parent)) continue;
    const descendants=children.get(record.parent)||[];
    descendants.push(record.path);
    children.set(record.parent, descendants);
  }
  for (const list of children.values()) list.sort();
  for (const record of local.values()) {
    if (!record.parent || !local.has(record.parent)) continue;
    const visited = new Set([record.path]);let parent=record.parent;
    while (parent && local.has(parent)) {
      if (visited.has(parent)) { issue('parent-cycle', record.path); break; }
      visited.add(parent);parent=local.get(parent).parent;
    }
  }
  // Duplicate namespace coordinates would produce ambiguous asset ownership.
  const coordinateByPath = new Map([...local.keys()].map(p=>[p,dimensionOf(p)]));
  if (selectedArtifact && !coordinateByPath.get(selectedPath)) issue('selected-dimension-missing',selectedPath);
  const chosen = new Set();
  const descend = (p) => { if (chosen.has(p))return;chosen.add(p);for(const c of children.get(p)||[])descend(c); };
  if (selectedArtifact && local.has(selectedPath) && !issues.length) {
    if (scope === 'alone' || scope === 'alone-with-assets') chosen.add(selectedPath);
    else if (scope === 'self-and-leaves') descend(selectedPath);
    else if (scope === 'branch') {
      let root=selectedPath,visited=new Set();
      while (local.get(root)?.parent && local.has(local.get(root).parent)) {
        if(visited.has(root)){issue('parent-cycle',root);break;}visited.add(root);
        const p=local.get(root).parent;
        if((children.get(p)||[]).length !== 1)break; // do not include the fork node
        root=p;
      }
      if(!issues.length)descend(root);
    } else if (scope === 'tree') {
      let root=selectedPath,visited=new Set();
      while (local.get(root)?.parent && local.has(local.get(root).parent)) {
        if(visited.has(root)){issue('parent-cycle',root);break;}visited.add(root);root=local.get(root).parent;
      }
      if(!issues.length)descend(root);
    }
  }
  const dimensionOwners=new Map();
  for (const file of local.keys()) {
    const dim=coordinateByPath.get(file);
    if(!dim)continue;
    if(dimensionOwners.has(dim))issue('coordinate-ambiguous',`${dimensionOwners.get(dim)}, ${file}`);
    dimensionOwners.set(dim,file);
  }
  const chosenAssets=selectedArtifact && scope !== 'alone' ? [...knownAssets].filter(a=>chosen.has(dimensionOwners.get(dimensionOf(a)))) : selectedArtifact?[]:[selectedPath];
  const selectedPaths=[...chosen].sort();
  const selectedAssetPaths=chosenAssets.sort();
  const selectedChildren=new Map(selectedPaths.map(p=>[p,(children.get(p)||[]).filter(c=>chosen.has(c))]));
  const selectedRoots=selectedPaths.filter(p=>!chosen.has(local.get(p)?.parent));
  const selectedLeaves=selectedPaths.filter(p=>!selectedChildren.get(p)?.length);
  const straight=selectedRoots.length===1 && selectedLeaves.length===1 && selectedPaths.every(p=>selectedChildren.get(p).length<=1);
  const ready=!issues.length;
  return Object.freeze({schema:LINEAGE_MOVE_SELECTION_SCHEMA_ID,status:ready?'ready':'blocked',workspaceId,selectedPath,scope,directory,
    artifactPaths:Object.freeze(ready?selectedPaths:[]),assetPaths:Object.freeze(ready?selectedAssetPaths:[]),
    shape:Object.freeze({roots:selectedRoots.length,leaves:selectedLeaves.length,straight:ready&&straight,branches:[...selectedChildren].filter(([,v])=>v.length>1).length}),
    placements:Object.freeze({prepend:ready&&selectedArtifact&&straight,same:ready,append:ready&&selectedArtifact}),
    findings:Object.freeze(issues),
    boundary:'Only exact source-directory files are selected. All affected references may live outside it and MUST be qualified and atomically rewritten at Apply; selected assets require a combined binary+artifact transaction. Keeping Parent requires identity, locator and integrity post-verification.'});
}
function strictPath(value) {
  if(typeof value!=='string' || !value || value.includes('\\') || value.startsWith('/') || /^[A-Za-z]:/.test(value)|| value.includes('\0'))return '';
  const parts=value.split('/');
  if(parts.some(p=>!p || p==='.' || p==='..' || p==='.git' || p==='.tiinex'))return '';
  return path.posix.normalize(value);
}
function dimensionOf(value) {
  const m=path.posix.basename(value).match(/^(\d+(?:-\d+)*)-[^.]+/);
  return m?m[1].split('-').map(Number).join('-'):'';
}
