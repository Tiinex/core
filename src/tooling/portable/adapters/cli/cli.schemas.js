import path from 'node:path';
import { checkNativeSchemas, inspectNativeSchemaStatus, synchronizeNativeSchemas } from '../node/schema.sync.js';

export async function runSchemasCli(parsed = {}) {
  const suppliedTarget = String(parsed.flags.content || parsed.flags.native || parsed.positionals?.[0] || '').trim();
  const docsRoot = parsed.flags.docs ? path.resolve(String(parsed.flags.docs)) : '';
  const sourceCommit = String(parsed.flags['docs-commit'] || '').trim();
  const repository = String(parsed.flags['docs-repository'] || 'Tiinex/docs').trim();
  const published = parsed.flags.published === true || String(parsed.flags.published || '').toLowerCase() === 'true';
  const schemaSurfaceRoot = String(parsed.flags['schema-surface'] || '').trim();
  const options = {
    contentRoot: suppliedTarget ? path.resolve(suppliedTarget) : '',
    docsRoot,
    sourceCommit,
    repository,
    published,
    schemaSurfaceRoot
  };
  if (parsed.command === 'schemas-sync') return synchronizeNativeSchemas(options);
  if (parsed.command === 'schemas-check') return checkNativeSchemas(options);
  return inspectNativeSchemaStatus(options);
}
