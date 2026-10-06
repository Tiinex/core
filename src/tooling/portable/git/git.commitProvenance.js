export const GIT_COMMIT_PROVENANCE_SCHEMA_ID = 'tiinex.git.commit-provenance.v1';

const STATUS = Object.freeze({
  added: Object.freeze({ code: '+', label: 'Added' }),
  modified: Object.freeze({ code: '~', label: 'Modified' }),
  deleted: Object.freeze({ code: '-', label: 'Deleted' }),
  renamed: Object.freeze({ code: '>', label: 'Renamed' })
});

export function projectTiinexCommitProvenance(input = {}) {
  const repositoryLabel = normalizeRepositoryLabel(input.repositoryLabel || input.label || input.workspaceId || 'repository');
  const sourceEntries = Array.isArray(input.entries) ? input.entries : [];
  const entries = sourceEntries
    .map(normalizeEntry)
    .filter((entry) => entry.path && isTiinexTracePath(entry.path))
    .sort(compareEntryPath);

  const title = `Tiinex: Update ${repositoryLabel}`;
  const tree = entries.length ? renderTree(entries) : '';
  const message = tree ? `${title}\n\nTiinex provenance\n\n${tree}` : title;
  return Object.freeze({
    schema: GIT_COMMIT_PROVENANCE_SCHEMA_ID,
    status: 'ready',
    repositoryLabel,
    title,
    message,
    tree,
    entries: Object.freeze(entries),
    counts: Object.freeze(countStatuses(entries)),
    boundary: Object.freeze({
      projectionOnly: true,
      expectedSource: 'exact-staged-index',
      traceOnly: true,
      schemaLabelPresentationOnly: true,
      semanticAuthority: false,
      currentnessAuthority: false
    })
  });
}

export function humanSchemaLabel(schemaId = '') {
  const raw = String(schemaId || '').trim().toLowerCase();
  if (!raw.startsWith('tiinex.')) return 'Unknown';
  const stripped = raw.replace(/^tiinex\./, '').replace(/\.v\d+$/i, '');
  if (!stripped) return 'Unknown';
  const words = stripped.split(/[._-]+/).map((word) => word.trim()).filter(Boolean);
  return words.length ? words.map(titleWord).join(' ') : 'Unknown';
}

export function extractCurrentSchemaId(markdown = '') {
  const text = String(markdown || '');
  const line = text.split(/\r?\n/).find((item) => /\bCurrent Schema\s*:/i.test(item)) || '';
  const match = line.match(/\b(tiinex\.[a-z0-9._-]+\.v\d+)\b/i);
  return String(match?.[1] || '').toLowerCase();
}

export function isTiinexTracePath(value = '') {
  const path = normalizePath(value);
  return path.startsWith('.topics/') && path.toLowerCase().endsWith('.trace.md');
}

function normalizeEntry(value = {}) {
  const status = normalizeStatus(value.status || value.change || value.kind);
  const path = normalizePath(value.path || value.newPath || value.targetPath);
  const previousPath = normalizePath(value.previousPath || value.oldPath || value.sourcePath);
  const schemaId = String(value.schemaId || extractCurrentSchemaId(value.markdown || value.currentMarkdown || value.previousMarkdown || '')).trim().toLowerCase();
  return Object.freeze({
    status,
    statusCode: STATUS[status].code,
    statusLabel: STATUS[status].label,
    path,
    previousPath,
    schemaId,
    schemaLabel: humanSchemaLabel(schemaId)
  });
}

function normalizeStatus(value = '') {
  const text = String(value || '').trim().toLowerCase();
  if (['a', 'add', 'added'].includes(text)) return 'added';
  if (['d', 'delete', 'deleted', 'remove', 'removed'].includes(text)) return 'deleted';
  if (['r', 'rename', 'renamed', 'move', 'moved'].includes(text)) return 'renamed';
  return 'modified';
}

function renderTree(entries) {
  const root = node();
  for (const entry of entries) insert(root, entry);
  const children = sortedChildren(root);
  const lines = [];
  for (let index = 0; index < children.length; index += 1) {
    renderNode(children[index][0], children[index][1], '', index === children.length - 1, lines);
  }
  return lines.join('\n');
}

function node() { return { children: new Map(), leaves: [] }; }
function insert(root, entry) {
  const parts = entry.path.split('/').filter(Boolean);
  if (!parts.length) return;
  const filename = parts.pop();
  let cursor = root;
  for (const part of parts) {
    if (!cursor.children.has(part)) cursor.children.set(part, node());
    cursor = cursor.children.get(part);
  }
  cursor.leaves.push({ filename, entry });
}

function renderNode(name, value, prefix, last, lines) {
  lines.push(`${prefix}${last ? '└── ' : '├── '}${name}/`);
  const nextPrefix = `${prefix}${last ? '    ' : '│   '}`;
  const children = sortedChildren(value);
  const leaves = [...value.leaves].sort((a, b) => a.filename.localeCompare(b.filename));
  const total = children.length + leaves.length;
  let ordinal = 0;
  for (const [childName, child] of children) {
    ordinal += 1;
    renderNode(childName, child, nextPrefix, ordinal === total, lines);
  }
  for (const leaf of leaves) {
    ordinal += 1;
    lines.push(`${nextPrefix}${ordinal === total ? '└── ' : '├── '}${renderLeaf(leaf.filename, leaf.entry)}`);
  }
}

function renderLeaf(filename, entry) {
  const previous = entry.status === 'renamed' && entry.previousPath && entry.previousPath !== entry.path
    ? ` <- ${entry.previousPath}`
    : '';
  return `[${entry.statusCode}] [${entry.schemaLabel}] ${filename}${previous}`;
}

function sortedChildren(value) { return [...value.children.entries()].sort(([a], [b]) => a.localeCompare(b)); }
function compareEntryPath(a, b) { return a.path.localeCompare(b.path) || a.previousPath.localeCompare(b.previousPath); }
function normalizePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function normalizeRepositoryLabel(value = '') { return String(value || 'repository').trim().replace(/\s+/g, ' ') || 'repository'; }
function titleWord(value = '') { return value ? `${value[0].toUpperCase()}${value.slice(1)}` : ''; }
function countStatuses(entries) {
  const counts = { added: 0, modified: 0, deleted: 0, renamed: 0, total: entries.length };
  for (const entry of entries) counts[entry.status] += 1;
  return counts;
}
