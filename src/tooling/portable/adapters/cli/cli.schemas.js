import path from 'node:path';
import { checkNativeSchemas, inspectNativeSchemaStatus, synchronizeNativeSchemas } from '../node/schema.sync.js';

export async function runSchemasCli(parsed = {}) {
  const coreRoot = path.resolve(String(parsed.positionals?.[0] || parsed.flags.core || process.cwd()));
  const docsRoot = parsed.flags.docs ? path.resolve(String(parsed.flags.docs)) : '';
  const sourceCommit = String(parsed.flags['docs-commit'] || '').trim();
  const repository = String(parsed.flags['docs-repository'] || 'Tiinex/docs').trim();
  const published = parsed.flags.published === true || String(parsed.flags.published || '').toLowerCase() === 'true';
  const options = { coreRoot, docsRoot, sourceCommit, repository, published };
  if (parsed.command === 'schemas-sync') return synchronizeNativeSchemas(options);
  if (parsed.command === 'schemas-check') return checkNativeSchemas(options);
  return inspectNativeSchemaStatus(options);
}
