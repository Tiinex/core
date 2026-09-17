import path from 'node:path';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { preparePortableWorkspaceInitialization } from '../../workspace/workspace.initialize.js';

export async function runCommonWorkspaceInitCli(parsed = {}) {
  const root = path.resolve(String(parsed.positionals?.[0] || '').trim() || '.');
  const flags = parsed.flags || {};
  const schemaMaterialPath = String(flags['schema-material'] || '').trim();
  const schemaMarkdown = schemaMaterialPath ? await readFile(path.resolve(schemaMaterialPath), 'utf8') : '';
  const result = preparePortableWorkspaceInitialization({
    title: String(flags.title || flags['workspace-title'] || '').trim(),
    workspaceId: String(flags['workspace-id'] || '').trim(),
    repository: String(flags.repository || '').trim(),
    ref: String(flags.ref || '').trim(),
    sourceKind: String(flags['source-kind'] || '').trim(),
    rootPath: String(flags['root-path'] || '.').trim(),
    authors: String(flags.authors || '').trim(),
    schemaTarget: String(flags['schema-target'] || '').trim(),
    schemaMarkdown,
    sameRepositorySchema: flags['same-repository-schema'] === true
  });
  if (result.status !== 'ready') return Object.freeze({ ...result, root });
  const target = path.resolve(root, ...String(result.path).split('/'));
  const rel = path.relative(root, target);
  if (!rel || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error('portable.workspace-init.target-outside-root');
  try { await access(target); throw new Error(`portable.workspace-init.target-exists:${result.path}`); }
  catch (error) { if (String(error?.message || '').startsWith('portable.workspace-init.target-exists:')) throw error; }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, result.markdown, { encoding: 'utf8', flag: 'wx' });
  return Object.freeze({ ...result, root, writeReceipt: Object.freeze({ path: target, workspaceRelativePath: result.path, bytes: Buffer.byteLength(result.markdown, 'utf8') }) });
}
