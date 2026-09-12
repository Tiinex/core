export const PORTABLE_SOURCE_ELIGIBILITY_SCHEMA_ID = 'tiinex.portable.source-eligibility.v1';

export const PORTABLE_GENERATED_SOURCE_EXCLUDED_DIRECTORY_NAMES = Object.freeze(['__pycache__']);
export const PORTABLE_GENERATED_SOURCE_EXCLUDED_FILE_SUFFIXES = Object.freeze(['.pyc', '.pyo']);
export const DEFAULT_PORTABLE_SOURCE_EXCLUDED_DIRECTORIES = Object.freeze([
  '.git',
  '.tiinex',
  'node_modules',
  '.site-publish',
  '.release',
  '.outgoing-handoff-packages',
  ...PORTABLE_GENERATED_SOURCE_EXCLUDED_DIRECTORY_NAMES
]);
export const DEFAULT_PORTABLE_SOURCE_EXCLUDED_RELATIVE_PATHS = Object.freeze(['.vscode/link']);

/**
 * Host-neutral source eligibility for one Workspace-relative path.
 *
 * This is a mechanical durable-source boundary only. Exclusion means a path is not
 * part of source-frontier identity; it does not grant deletion, merge, acceptance,
 * or semantic authority over bytes carried as historical transport evidence.
 */
export function qualifyPortableSourcePath(pathInput = '', options = {}) {
  const entryKind = String(options.entryKind || 'file').trim().toLowerCase() === 'directory' ? 'directory' : 'file';
  const path = normalizePortableSourcePath(pathInput);
  const policy = portableSourceEligibilityPolicy(options);
  if (!path) return freezeQualification(path, true, 'empty-or-unqualified-path', '', entryKind, policy);

  const segments = path.split('/').filter(Boolean);
  const directorySegments = entryKind === 'directory' ? segments : segments.slice(0, -1);
  for (const name of directorySegments) {
    if (!policy.excludedDirectories.includes(name)) continue;
    return freezeQualification(path, false, 'excluded-directory', name, entryKind, policy);
  }

  for (const relativePath of policy.excludedRelativePaths) {
    if (path === relativePath || path.startsWith(`${relativePath}/`)) {
      return freezeQualification(path, false, 'excluded-relative-path', relativePath, entryKind, policy);
    }
  }

  if (entryKind === 'file') {
    const basename = String(segments.at(-1) || '').toLowerCase();
    for (const suffix of policy.excludedFileSuffixes) {
      if (!basename.endsWith(suffix)) continue;
      return freezeQualification(path, false, 'compiled-python-cache', suffix, entryKind, policy);
    }
  }

  return freezeQualification(path, true, 'eligible-source', '', entryKind, policy);
}

export function isPortableSourceEligiblePath(pathInput = '', options = {}) {
  return qualifyPortableSourcePath(pathInput, options).eligible;
}

export function portableSourceEligibilityPolicy(options = {}) {
  const requestedDirectories = options.excludeDirectories == null
    ? DEFAULT_PORTABLE_SOURCE_EXCLUDED_DIRECTORIES
    : options.excludeDirectories;
  const requestedRelativePaths = options.excludeRelativePaths == null
    ? DEFAULT_PORTABLE_SOURCE_EXCLUDED_RELATIVE_PATHS
    : options.excludeRelativePaths;

  const excludedDirectories = uniqueSorted([
    ...PORTABLE_GENERATED_SOURCE_EXCLUDED_DIRECTORY_NAMES,
    ...iterableStrings(requestedDirectories)
  ]);
  const excludedRelativePaths = uniqueSorted(iterableStrings(requestedRelativePaths).map(normalizePortableSourcePath).filter(Boolean));
  const excludedFileSuffixes = uniqueSorted(PORTABLE_GENERATED_SOURCE_EXCLUDED_FILE_SUFFIXES.map((value) => String(value).toLowerCase()));

  return Object.freeze({
    schema: PORTABLE_SOURCE_ELIGIBILITY_SCHEMA_ID,
    excludedDirectories: Object.freeze(excludedDirectories),
    excludedRelativePaths: Object.freeze(excludedRelativePaths),
    excludedFileSuffixes: Object.freeze(excludedFileSuffixes),
    boundary: 'Mechanical durable-source eligibility only. Historical transport bytes remain evidence; exclusion grants no semantic deletion or merge authority.'
  });
}

export function normalizePortableSourcePath(value = '') {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '');
}

function freezeQualification(path, eligible, reason, matchedRule, entryKind, policy) {
  return Object.freeze({
    schema: PORTABLE_SOURCE_ELIGIBILITY_SCHEMA_ID,
    state: eligible ? 'eligible' : 'excluded',
    eligible,
    path,
    entryKind,
    reason,
    matchedRule,
    policy,
    boundary: 'Path classification is mechanical source eligibility only; it is not a semantic disposition.'
  });
}

function iterableStrings(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value instanceof Set) return [...value].map(String);
  if (value == null) return [];
  return [String(value)];
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort();
}
