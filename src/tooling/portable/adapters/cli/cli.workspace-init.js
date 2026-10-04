import path from 'node:path';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { preparePortableWorkspaceInitialization } from '../../workspace/workspace.initialize.js';
import { inspectNodeWorkspaceSourceIdentity } from '../node/workspace.sourceSelection.js';
import { schemaMarkdown } from '../../../../schemas/registry.js';
import { schemaReferenceAuthorityForRegisteredSchema } from '../../../../schemas/creation.schemaReferences.js';

export async function runCommonWorkspaceInitCli(parsed = {}) {
  const root = path.resolve(String(parsed.positionals?.[0] || '').trim() || '.');
  const flags = parsed.flags || {};
  const schemaMaterialPath = String(flags['schema-material'] || '').trim();
  const explicitSchemaTarget = String(flags['schema-target'] || '').trim();
  const bundledWorkspaceSchema = !schemaMaterialPath && !explicitSchemaTarget
    ? String(schemaMarkdown('tiinex.workspace.v1') || '')
    : '';
  const schemaMarkdown = schemaMaterialPath ? await readFile(path.resolve(schemaMaterialPath), 'utf8') : bundledWorkspaceSchema;
  const schemaTarget = explicitSchemaTarget || (!schemaMaterialPath ? String(schemaReferenceAuthorityForRegisteredSchema('tiinex.workspace.v1')?.preferredTarget || '').trim() : '');
  const explicitRepository = String(flags.repository || '').trim();
  const source = explicitRepository
    ? Object.freeze({ repository: explicitRepository, ref: String(flags.ref || '').trim(), sourceKind: String(flags['source-kind'] || '').trim(), rootPath: String(flags['root-path'] || '.').trim(), gitState: 'operator-supplied' })
    : await inspectNodeWorkspaceSourceIdentity(root);
  const inferredLabel = path.basename(root) || 'workspace';
  const result = preparePortableWorkspaceInitialization({
    title: String(flags.title || flags['workspace-title'] || inferredLabel).trim(),
    workspaceId: String(flags['workspace-id'] || inferredLabel).trim(),
    repository: source.repository,
    ref: String(flags.ref || source.ref || '').trim(),
    sourceKind: String(flags['source-kind'] || source.sourceKind || '').trim(),
    rootPath: String(flags['root-path'] || source.rootPath || '.').trim(),
    authors: String(flags.authors || '').trim(),
    schemaTarget,
    schemaMarkdown,
    sameRepositorySchema: flags['same-repository-schema'] === true
  });
  if (result.status !== 'ready') return Object.freeze({ ...result, root, sourceDetection: source });
  const target = path.resolve(root, ...String(result.path).split('/'));
  const rel = path.relative(root, target);
  if (!rel || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error('portable.workspace-init.target-outside-root');
  try { await access(target); throw new Error(`portable.workspace-init.target-exists:${result.path}`); }
  catch (error) { if (String(error?.message || '').startsWith('portable.workspace-init.target-exists:')) throw error; }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, result.markdown, { encoding: 'utf8', flag: 'wx' });
  return Object.freeze({ ...result, root, sourceDetection: source, writeReceipt: Object.freeze({ path: target, workspaceRelativePath: result.path, bytes: Buffer.byteLength(result.markdown, 'utf8') }) });
}
