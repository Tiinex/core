import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { parseNamedDeclarationSection } from '../tooling/portable/schema/named.declarations.js';

export const SCAFFOLD_SCHEMA_ID = 'tiinex.scaffold.v1';

export function parseScaffoldArtifact(markdown = '') {
  const source = String(markdown || '');
  const artifact = parseArtifactMarkdown(source);
  const identity = fields(sectionText(source, 'Scaffold Identity'));
  const target = fields(sectionText(source, 'Target Boundary'));
  const composition = fields(sectionText(source, 'Composition'));
  const conflict = fields(sectionText(source, 'Conflict Policy'));
  const validation = fields(sectionText(source, 'Validation Boundary'));
  const limits = fields(sectionText(source, 'Interpretation Limits'));
  const structural = parseNamedDeclarationSection(source, 'Structural Entries');
  const generation = parseNamedDeclarationSection(source, 'Generation Bindings');
  const findings = [];
  const schemaId = String(artifact.envelope?.current?.schema?.id || '').trim();
  if (schemaId !== SCAFFOLD_SCHEMA_ID) findings.push(finding('error', 'scaffold.schema-id.mismatch', `Expected ${SCAFFOLD_SCHEMA_ID}, observed ${schemaId || '(missing)'}.`));
  const integrity = canonicalC14nV2SelfState(source);
  if (integrity.state !== 'verified') findings.push(finding('error', 'scaffold.self-integrity.unqualified', `Scaffold self integrity is ${integrity.state}.`));
  if (!structural.present || structural.entries.length === 0) findings.push(finding('error', 'scaffold.structural-entries.missing', 'Scaffold requires at least one Structural Entry.'));
  for (const item of structural.findings || []) findings.push(finding('error', item.code || 'scaffold.declaration.invalid', `${item.entry || 'Structural Entry'}: ${item.field || 'declaration'} is invalid.`));

  const entries = [];
  const byPath = new Map();
  for (const declaration of structural.entries || []) {
    const pathState = normalizeScaffoldPath(declaration.fields?.Path || '');
    const entry = Object.freeze({
      name: String(declaration.name || '').trim(),
      path: pathState.path,
      rawPath: String(declaration.fields?.Path || '').trim(),
      pathState: pathState.state,
      kind: normalizeToken(declaration.fields?.['Entry Kind']),
      presence: normalizeToken(declaration.fields?.Presence),
      role: String(declaration.fields?.['Entry Role'] || '').trim(),
      contentAuthority: normalizeToken(declaration.fields?.['Content Authority']),
      contentAuthorityReference: String(declaration.fields?.['Content Authority Reference'] || '').trim(),
      namingAuthorityReference: String(declaration.fields?.['Naming Authority Reference'] || '').trim(),
      source: declaration.source || null
    });
    if (pathState.state !== 'qualified') findings.push(finding('error', 'scaffold.path.unsafe', `Structural Entry ${entry.name || '(unnamed)'} has unsafe or unrepresentable path ${entry.rawPath || '(missing)'}.`, { entry: entry.name, path: entry.rawPath }));
    if (!['directory','file','unknown'].includes(entry.kind)) findings.push(finding('error', 'scaffold.entry-kind.invalid', `Structural Entry ${entry.name || '(unnamed)'} has unsupported Entry Kind ${entry.kind || '(missing)'}.`));
    if (!['required','optional','unknown'].includes(entry.presence)) findings.push(finding('error', 'scaffold.presence.invalid', `Structural Entry ${entry.name || '(unnamed)'} has unsupported Presence ${entry.presence || '(missing)'}.`));
    if (!entry.role) findings.push(finding('error', 'scaffold.entry-role.missing', `Structural Entry ${entry.name || '(unnamed)'} is missing Entry Role.`));
    if (entry.path) {
      const previous = byPath.get(entry.path);
      if (previous && !equivalentEntry(previous, entry)) findings.push(finding('error', 'scaffold.path.conflict', `Structural Entries ${previous.name} and ${entry.name} conflict at ${entry.path}.`, { path: entry.path }));
      else if (!previous) byPath.set(entry.path, entry);
    }
    entries.push(entry);
  }

  const generationBindings = (generation.entries || []).filter((entry) => normalizeToken(entry.name) !== 'none').map((entry) => Object.freeze({
    name: String(entry.name || '').trim(),
    structuralEntry: String(entry.fields?.['Structural Entry'] || '').trim(),
    generationAuthority: String(entry.fields?.['Generation Authority'] || '').trim(),
    generationMode: String(entry.fields?.['Generation Mode'] || '').trim(),
    source: entry.source || null
  }));

  return Object.freeze({
    schema: 'tiinex.scaffold.parsed.v1',
    status: findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified',
    schemaId,
    title: artifact.title || '',
    integrity: Object.freeze({ state: integrity.state, value: integrity.declaredValue || '' }),
    identity: Object.freeze({
      handle: String(identity['Scaffold Handle'] || '').trim(),
      name: String(identity['Scaffold Name'] || '').trim(),
      kind: normalizeToken(identity['Scaffold Kind']),
      version: String(identity.Version || '').trim()
    }),
    target: Object.freeze({
      kind: normalizeToken(target['Target Kind']),
      rootMeaning: String(target['Target Root Meaning'] || '').trim(),
      rootBindingPolicy: normalizeToken(target['Root Binding Policy'])
    }),
    composition: Object.freeze({
      policy: normalizeToken(composition['Composition Policy']),
      extends: String(composition.Extends || '').trim(),
      duplicateEntryPolicy: normalizeToken(composition['Duplicate Entry Policy'])
    }),
    conflict: Object.freeze({
      existingCompatibleMaterial: normalizeToken(conflict['Existing Compatible Material']),
      existingConflictingMaterial: normalizeToken(conflict['Existing Conflicting Material']),
      unknownExistingMaterial: normalizeToken(conflict['Unknown Existing Material']),
      deletionPolicy: normalizeToken(conflict['Deletion Policy'])
    }),
    validation: Object.freeze({
      qualificationRule: String(validation['Qualification Rule'] || '').trim(),
      planningRule: String(validation['Planning Rule'] || '').trim(),
      applyRule: String(validation['Apply Rule'] || '').trim(),
      failurePolicy: normalizeToken(validation['Failure Policy'])
    }),
    limits: Object.freeze({
      doesNotEstablish: String(limits['Does Not Establish'] || '').trim(),
      mustNotBeUsedToClaim: String(limits['Must Not Be Used To Claim'] || '').trim()
    }),
    entries: Object.freeze(entries),
    generationBindings: Object.freeze(generationBindings),
    findings: Object.freeze(findings)
  });
}

export function normalizeScaffoldPath(value = '') {
  const raw = String(value || '').trim().replace(/\\/g, '/');
  if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw)) return Object.freeze({ state: 'blocked', path: '' });
  const parts = raw.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) return Object.freeze({ state: 'blocked', path: '' });
  return Object.freeze({ state: 'qualified', path: parts.join('/') });
}

function sectionText(markdown = '', heading = '') {
  const escaped = escapeRe(heading);
  return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || '';
}

function fields(section = '') {
  const out = {};
  for (const line of String(section || '').split(/\r?\n/)) {
    const match = line.match(/^-\s+([^:]+):\s*(.*?)\s*$/);
    if (!match) continue;
    out[match[1].trim()] = match[2];
  }
  return out;
}

function normalizeToken(value = '') { return String(value || '').trim().toLowerCase(); }
function escapeRe(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function equivalentEntry(a = {}, b = {}) { return a.path === b.path && a.kind === b.kind && a.presence === b.presence && a.role === b.role && a.contentAuthority === b.contentAuthority && a.contentAuthorityReference === b.contentAuthorityReference && a.namingAuthorityReference === b.namingAuthorityReference; }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, params: Object.freeze({ ...params }) }); }
