import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { planPortableHostAction } from '../host/tool.bindings.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

const PINNED = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/blob\/([a-f0-9]{40})\/(\.topics\/(?:[\w.-]+\/)*[\w.-]+\.trace\.md)$/i;
const TOOL = Object.freeze({ id: 'vscode-github-pinned-read', name: 'GitHub repository file read', capabilities: ['repositoryRead'] });

/** Explicit host-read bytes only. A URL, local Git object, hash claim or
 * unqualified local Workspace material cannot promote remote publication.
 * Core rechecks identity, source hash, self seal and target digest.
 */
export function qualifyEditorExternalParents(reads = [], localRecords = []) {
  const records = [], publicationProviderReceipts = [], locators = new Set();
  const localPaths = new Set(localRecords.map(record => String(record.path || '')));
  for (const read of Array.isArray(reads) ? reads.slice(0, 8) : []) {
    const locator = String(read?.target || '');
    const match = locator.match(PINNED);
    const markdown = typeof read?.markdown === 'string' ? read.markdown : '';
    if (!match || !markdown || locators.has(locator)) continue;
    const [,owner,repo,commit,path] = match;
    const repository = `${owner}/${repo}`;
    if (String(read?.repository || '') !== repository || String(read?.commit || '').toLowerCase() !== commit.toLowerCase() || String(read?.path || '') !== path) continue;
    if (String(read?.sha256 || '').toLowerCase() !== sha256Hex(utf8Bytes(markdown))) continue;
    if (canonicalC14nV2SelfState(markdown).state !== 'verified') continue;
    if (localPaths.has(path)) continue; // Never shadow local material.
    const plan = planPortableHostAction({action:'repository-read',host:{tools:[TOOL]},request:{repository,ref:commit,path,purpose:'read exact pinned Tiinex Parent'}});
    if (plan.status !== 'ready') continue;
    const receipt = {
      schema:'tiinex.portable.host-action-receipt.v1', actionId:plan.actionId, action:'repository-read',
      steps:plan.steps.map(step => ({stepId:step.stepId,toolId:step.tool.id,status:'completed',normalized:{files:[{
        path,content:markdown,source:{repository,ref:commit,commit,path,adapterId:'github',authority:'host-https-read'}
      }]}}))
    };
    records.push({id:`external-parent:${locator}`,path,markdown,sourceMode:'github-pinned-read',source:{adapterId:'github',repository,commit,path,ref:commit,permalink:locator}});
    publicationProviderReceipts.push({plan,receipt});
    locators.add(locator);
  }
  return Object.freeze({records,publicationProviderReceipts});
}
