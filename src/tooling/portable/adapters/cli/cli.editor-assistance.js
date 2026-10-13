import { readFile } from 'node:fs/promises';

export async function prepareEditorAssistanceCliInput(material = {}, flags = {}) {
  const focusPath = norm(flags.focus || flags.path || '');
  const selectedParentPath = norm(flags['selected-parent'] || '');
  const includeDescendantRepair = flags['include-descendant-repair'] === true;
  const parentRepositoryReads = flags['parent-repository-reads'] ? JSON.parse(await readFile(String(flags['parent-repository-reads']), 'utf8')) : [];
  const selectedParentUrl = String(flags['selected-parent-url'] || '').trim();
  const referenceResolutions = flags['reference-resolutions']
    ? JSON.parse(await readFile(String(flags['reference-resolutions']), 'utf8'))
    : [];
  if (!focusPath || !flags.overlay) return { input: { ...material, focusPath, referenceResolutions, selectedParentPath, selectedParentUrl, parentRepositoryReads, includeDescendantRepair }, options: {} };
  const overlayMarkdown = await readFile(String(flags.overlay), 'utf8');
  const files = (material.files || []).map((file) => norm(file.path || '') === focusPath ? { ...file, content: overlayMarkdown } : file);
  const input = { ...material, files, focusPath, referenceResolutions, selectedParentPath, selectedParentUrl, parentRepositoryReads, includeDescendantRepair };
  if (Array.isArray(material.records)) input.records = material.records.map((record) => norm(record.path || record.id || '') === focusPath ? { ...record, markdown: overlayMarkdown } : record);
  return { input, options: {} };
}

function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, ''); }
