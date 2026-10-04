import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.resolve(here, '../fixtures/native-entries');
const names = ['explore-entry.trace.md', 'resume-entry.trace.md', 'start-entry.trace.md'];

export const nativeEntryMarkdown = Object.freeze(names.map((name) => Object.freeze([
  `.entries/${name}`,
  readFileSync(path.join(fixtureRoot, name), 'utf8')
])));

export function nativeEntryContentSource({ id = '@tiinex/native-fixture' } = {}) {
  const entries = nativeEntryMarkdown.map(([relative, markdown]) => {
    const sourcePath = `.topics/${relative}`;
    const data = new TextEncoder().encode(markdown);
    return Object.freeze({
      sourceId: id,
      surface: '.entries',
      surfaceRoot: '.topics/.entries',
      sourcePath,
      data,
      bytes: data.byteLength,
      sha256: sha256(data)
    });
  });
  const representation = entries.map(({ surface, surfaceRoot, sourcePath, bytes, sha256 }) => ({ surface, surfaceRoot, sourcePath, bytes, sha256 }));
  return Object.freeze({
    schema: 'tiinex.portable.content-source-discovery.v1',
    status: 'ready',
    source: Object.freeze({ id, kind: 'test-fixture', package: Object.freeze({ name: '@tiinex/native', version: 'fixture' }) }),
    surfaces: Object.freeze([Object.freeze({ name: '.entries', path: '.topics/.entries' })]),
    entries: Object.freeze(entries),
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    representationSha256: sha256(JSON.stringify(representation))
  });
}

export function nativeEntryByName(name) {
  return nativeEntryMarkdown.find(([entryPath]) => entryPath.endsWith(`${name}-entry.trace.md`))?.[1] || '';
}

function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
