import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveSchemaModule } from '../../../../schemas/resolver.js';
import { readQualifiedReturnTransition, returnTransitionResultReference } from './cli.qualify-return.js';
import { projectPortableCliOperation } from './cli.invocation.js';

const STATE_RELATIVE_PATH = '.tiinex/continuation.json';
const SCAFFOLD_RELATIVE_PATH = '.tiinex/return-handoff.body.md';
const RETURN_HANDOFF_DIRECTORY_RELATIVE_PATH = '.topics/handoffs';

export async function runPrepareReturnCli(parsed = {}, runtime = {}) {
  const flags = parsed.flags || {};
  const workspaceRoot = path.resolve(String(flags.workspace || parsed.positionals?.[0] || '.'));
  const state = await readContinuationState(workspaceRoot);
  if (String(state.schema || '') !== 'tiinex.portable.ground-continuation-state.v1') throw new Error('portable.cli.prepare-return.continuation-state.required');
  const returnTransition = await readQualifiedReturnTransition(workspaceRoot, state);
  const authority = await projectPreparedReturnAuthority(workspaceRoot, state, returnTransition);
  const { incomingRelativePath, from, fromReference, to, toReference, currentWorkControlReference, returnedMaterialReference } = authority;

  const scaffoldRelativePath = SCAFFOLD_RELATIVE_PATH;
  const scaffoldPath = safeWorkspaceTarget(workspaceRoot, scaffoldRelativePath);
  const fieldDomains = returnHandoffFieldDomains();
  const scaffold = returnHandoffScaffold({ from, fromReference, to, toReference, currentWorkControlReference, returnedMaterialReference, fieldDomains });
  if (flags['no-write'] !== true) {
    await mkdir(path.dirname(scaffoldPath), { recursive: true });
    await writeFile(scaffoldPath, scaffold, 'utf8');
  }
  const authorCommand = projectPortableCliOperation(runtime, 'author', [workspaceRoot, '--schema', 'tiinex.handoff.v1', '--directory', RETURN_HANDOFF_DIRECTORY_RELATIVE_PATH, '--body', scaffoldPath]);
  const preflightCommand = projectPortableCliOperation(runtime, 'author', [workspaceRoot, '--schema', 'tiinex.handoff.v1', '--directory', RETURN_HANDOFF_DIRECTORY_RELATIVE_PATH, '--body', scaffoldPath, '--preflight']);
  const handoffCommand = projectPortableCliOperation(runtime, 'handoff', [workspaceRoot]);
  return Object.freeze({
    schema: 'tiinex.portable.prepare-return.result.v1',
    operation: 'prepare-return',
    status: 'ready',
    workspace: Object.freeze({
      root: workspaceRoot,
      state: 'writable-local-continuation',
      writable: true,
      sourceSnapshot: 'immutable-qualified-carried-input',
      runtimeState: STATE_RELATIVE_PATH,
      boundary: 'The continued Workspace is a writable local working copy. Its received source snapshot and package remain immutable inputs; runtime-only .tiinex files are excluded from canonical Handoff manufacture.'
    }),
    completionQualification: Object.freeze({
      ...(state.completionQualification || { state: 'unavailable' }),
      returnClaimBoundary: String(state.completionQualification?.taskClosure || '') === 'not-established'
        ? 'bounded-result-return-only; Task completion/closure is not qualified'
        : 'no Task closure qualification is supplied by prepare-return',
      lifecycleQualificationOperation: String(state.completionQualification?.lifecycleQualificationOperation || ''),
      boundary: `${String(state.completionQualification?.boundary || 'No grounding completion qualification was carried into continuation state.')} Prepare-return may scaffold bounded-result transport after the recipient has produced or verified the bounded result, but its availability and invocation do not independently establish that return was the qualified current transition or convert that result into Task completion or closure evidence.`
    }),
    returnTransition,
    authority,
    fieldDomains,
    scaffold: Object.freeze({
      path: scaffoldPath,
      workspaceRelativePath: scaffoldRelativePath,
      written: flags['no-write'] !== true,
      state: 'runtime-only-incomplete-return-body',
      requiredMarkerSyntax: '<<TIINEX_REQUIRED:NAME>>',
      content: flags['include-content'] === true || flags['no-write'] === true ? scaffold : undefined,
      boundary: 'Runtime-only authoring aid, not a Tiinex semantic artifact and never included in canonical Workspace/Handoff Package output. Replace every <<TIINEX_REQUIRED:...>> marker with exact supported return semantics before authoring.'
    }),
    nextAction: Object.freeze({
      edit: `Replace every <<TIINEX_REQUIRED:...>> marker in ${scaffoldPath} with exact supported return semantics. The return transition is already separately qualified for the mechanically locked bounded result reference; do not alter that reference. This return may carry a result while Task closure remains not established. Grounding/return qualification and your own Done Criteria reading do not prove Task completion/closure; use project-lifecycle-readiness with explicit qualified facts before making such a claim. For constrained fields, use only the allowed values projected in fieldDomains / scaffold comments. Do not invent completion, acceptance, source facts, or authority.`,
      preflight: Object.freeze({ ...preflightCommand, durableWrite: false, sealIntegrity: true, audit: true, stage: true, boundary: 'Validate the fully filled scaffold through the same renderer/integrity/audit/stage path without retaining the candidate artifact or updating continuation state.' }),
      author: Object.freeze({ ...authorCommand, sealIntegrity: true, audit: true, stage: true }),
      manufacture: Object.freeze({ ...handoffCommand, canonicalTransport: 'one-handoff-package-plus-exact-routing-text' })
    }),
    boundary: 'Prepare-return is available only after a separate Tooling-qualified return transition for one exact verified bounded result. It projects qualified endpoint/return authority, the carried grounding completion qualification, and a runtime-only schema scaffold with the verified result reference mechanically locked. It does not establish Task completion, Task closure, acceptance, or remote mutation authority.'
  });
}

export async function validatePreparedReturnBodyAuthority({ workspaceRoot = '.', state = {}, bodyPath = '', bodyMarkdown = '' } = {}) {
  const root = path.resolve(String(workspaceRoot || '.'));
  const expectedScaffoldPath = safeWorkspaceTarget(root, SCAFFOLD_RELATIVE_PATH);
  if (path.resolve(String(bodyPath || '')) !== expectedScaffoldPath) return Object.freeze({ applies: false, state: 'not-prepared-return-scaffold' });
  const returnTransition = await readQualifiedReturnTransition(root, state);
  const authority = await projectPreparedReturnAuthority(root, state, returnTransition);
  const parties = section(bodyMarkdown, 'Handoff Parties');
  const transfers = section(bodyMarkdown, 'Transfers');
  const completion = section(bodyMarkdown, 'Completion Expectation');
  const observed = Object.freeze({
    from: field(parties, 'From'),
    fromReference: referenceTarget(parties, 'From Reference'),
    to: field(parties, 'To'),
    toReference: referenceTarget(parties, 'To Reference'),
    currentWorkControlReference: nestedReferenceTarget(transfers, 'Controlling Artifact'),
    returnTo: field(completion, 'Return To'),
    returnToReference: referenceTarget(completion, 'Return To Reference'),
    returnedMaterialReference: nestedReferenceTarget(section(bodyMarkdown, 'Required Context'), 'Material Reference')
  });
  const expected = Object.freeze({
    from: authority.from,
    fromReference: authority.fromReference,
    to: authority.to,
    toReference: authority.toReference,
    currentWorkControlReference: authority.currentWorkControlReference,
    returnTo: authority.to,
    returnToReference: authority.toReference,
    returnedMaterialReference: authority.returnedMaterialReference
  });
  for (const key of Object.keys(expected)) {
    if (String(observed[key] || '').trim() !== String(expected[key] || '').trim()) {
      throw new Error(`portable.cli.author.return-scaffold.authority-mismatch:${key}: expected exact prepared-return authority; rerun prepare-return instead of editing mechanical From/To/Return-To fields.`);
    }
  }
  return Object.freeze({
    applies: true,
    state: 'qualified',
    authority,
    observed,
    boundary: 'Prepared-return mechanical endpoint fields are locked to the exact selected-Handoff recipient Role and Completion Expectation. Substantive Purpose, Transfer, material, responsibility, exclusion, signal meaning, and interpretation claims remain recipient-authored and separately qualified.'
  });
}

async function projectPreparedReturnAuthority(workspaceRoot, state = {}, returnTransition = null) {
  const incomingRelativePath = normalizeWorkspaceRelativePath(state.selectedHandoffPath || '');
  if (!incomingRelativePath) throw new Error('portable.cli.prepare-return.selected-handoff.required');
  const incomingPath = safeWorkspaceTarget(workspaceRoot, incomingRelativePath);
  const incomingMarkdown = await readFile(incomingPath, 'utf8');
  const parties = section(incomingMarkdown, 'Handoff Parties');
  const completion = section(incomingMarkdown, 'Completion Expectation');
  const incomingTo = field(parties, 'To');
  const incomingToReference = referenceTarget(parties, 'To Reference');
  const from = String(state.roleLabel || incomingTo || '').trim();
  const fromSourceReference = normalizeComparable(from) === normalizeComparable(incomingTo) ? incomingToReference : '';
  const to = field(completion, 'Return To');
  const toSourceReference = referenceTarget(completion, 'Return To Reference');
  if (!from || !to) throw new Error('portable.cli.prepare-return.endpoint.required');
  if (!fromSourceReference || !toSourceReference) throw new Error('portable.cli.prepare-return.endpoint-reference.required');
  const fromReference = rebaseReferenceForReturnAuthoring(fromSourceReference, incomingRelativePath);
  const toReference = rebaseReferenceForReturnAuthoring(toSourceReference, incomingRelativePath);
  const currentWorkControlReference = rebaseWorkspaceArtifactForReturnAuthoring(incomingRelativePath);
  const returnedMaterialReference = returnTransitionResultReference(returnTransition?.result?.path || '');
  if (!returnedMaterialReference) throw new Error('portable.cli.prepare-return.return-transition.result-reference.required');
  if (String(returnTransition?.returnProtocol?.returnTo || '') !== to || String(returnTransition?.returnProtocol?.returnToReference || '') !== toSourceReference) throw new Error('portable.cli.prepare-return.return-transition.endpoint-mismatch');
  return Object.freeze({
    sourceHandoff: incomingRelativePath,
    authoredDirectory: RETURN_HANDOFF_DIRECTORY_RELATIVE_PATH,
    from,
    fromReference,
    fromSourceReference,
    to,
    toReference,
    toSourceReference,
    currentWorkControlReference,
    returnedMaterialReference,
    returnTransition: Object.freeze({ state: 'qualified', result: Object.freeze({ ...(returnTransition?.result || {}) }), verification: Object.freeze({ ...(returnTransition?.verification || {}) }), boundary: String(returnTransition?.boundary || '') }),
    currentWorkControl: Object.freeze({ state: 'selected-source-handoff-preserved', sourceHandoff: incomingRelativePath, authoredReference: currentWorkControlReference, boundary: 'The canonical return Handoff explicitly controls the exact selected source Handoff so successor current-work selection does not fall back to unrelated historical Task ancestry.' }),
    referenceProjection: Object.freeze({
      state: 'semantic-target-preserved-for-authored-location',
      boundary: 'Workspace-relative endpoint Role references are resolved against the exact selected source Handoff and rebased to the fixed return-Handoff authoring directory. Adapter-native/absolute references remain unchanged; endpoint authority is not weakened or retargeted.'
    }),
    basis: 'exact-selected-handoff recipient Role plus exact Completion Expectation Return To authority, with location-safe reference rebasing for the authored return Handoff'
  });
}

function rebaseReferenceForReturnAuthoring(reference = '', sourceArtifactPath = '') {
  const raw = String(reference || '').trim().replace(/\\/g, '/');
  if (!raw) return '';
  if (isNonRelativeReference(raw)) return raw;
  const source = normalizeWorkspaceRelativePath(sourceArtifactPath);
  if (!source) throw new Error('portable.cli.prepare-return.source-handoff-path.required');
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(source), raw));
  if (!target || target === '..' || target.startsWith('../') || target.startsWith('/')) {
    throw new Error(`portable.cli.prepare-return.endpoint-reference.outside-workspace:${reference}`);
  }
  const rebased = path.posix.relative(RETURN_HANDOFF_DIRECTORY_RELATIVE_PATH, target);
  return rebased || path.posix.basename(target);
}

function rebaseWorkspaceArtifactForReturnAuthoring(sourceArtifactPath = '') {
  const source = normalizeWorkspaceRelativePath(sourceArtifactPath);
  if (!source) throw new Error('portable.cli.prepare-return.source-handoff-path.required');
  const rebased = path.posix.relative(RETURN_HANDOFF_DIRECTORY_RELATIVE_PATH, source);
  if (!rebased || rebased === '..' || rebased.startsWith('../../') || rebased.startsWith('/')) {
    throw new Error(`portable.cli.prepare-return.current-work-control.outside-workspace:${sourceArtifactPath}`);
  }
  return rebased;
}

function isNonRelativeReference(reference = '') {
  const value = String(reference || '').trim();
  return /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)
    || /^[A-Za-z0-9._-]+::/.test(value)
    || value.startsWith('/')
    || value.startsWith('#');
}

function returnHandoffScaffold({ from, fromReference, to, toReference, currentWorkControlReference, returnedMaterialReference = '', fieldDomains = {} } = {}) {
  return `# ${from} To ${to} — Return

## Handoff Parties

- Purpose: <<TIINEX_REQUIRED:RETURN_PURPOSE>>
- From: ${from}
- From Kind: role
- From Reference: [${from} Role](${fromReference})
- To: ${to}
- To Kind: role
- To Reference: [${to} Role](${toReference})

## Transfers

- return-work
  - Transfer Kind: work-and-responsibility
  - Description: <<TIINEX_REQUIRED:TRANSFER_DESCRIPTION>>
  - Controlling Artifact: [selected source Handoff](${currentWorkControlReference})
  - Boundary: <<TIINEX_REQUIRED:TRANSFER_BOUNDARY>>

## Required Context

- returned-work
  - Material: <<TIINEX_REQUIRED:RETURNED_MATERIAL>>
  - Material Reference: [returned work](${returnedMaterialReference})
  - Purpose: <<TIINEX_REQUIRED:RETURNED_MATERIAL_PURPOSE>>
  - Availability: available

## Reference Context

- none

## Retained Responsibilities

- retained-responsibility
  - Retained By: <<TIINEX_REQUIRED:RETAINED_BY>>
  - Retained By Reference: [retained role](<<TIINEX_REQUIRED:RETAINED_BY_REFERENCE>>)
  - Responsibility: <<TIINEX_REQUIRED:RETAINED_RESPONSIBILITY>>
  - Boundary: <<TIINEX_REQUIRED:RETAINED_RESPONSIBILITY_BOUNDARY>>

## Exclusions And Dependencies

<!-- Allowed Kind values: ${domainText(fieldDomains.exclusionKind)} -->
- return-boundary
  - Kind: <<TIINEX_REQUIRED:EXCLUSION_KIND>>
  - Description: <<TIINEX_REQUIRED:EXCLUSION_DESCRIPTION>>
  - Responsible Party Or Role: <<TIINEX_REQUIRED:EXCLUSION_RESPONSIBLE_PARTY>>

## Completion Expectation

<!-- Allowed Signal Kind values: ${domainText(fieldDomains.signalKind)} -->
- Signal Kind: <<TIINEX_REQUIRED:SIGNAL_KIND>>
- Signal Meaning: <<TIINEX_REQUIRED:SIGNAL_MEANING>>
- Return To: ${to}
- Return To Reference: [${to} Role](${toReference})

## Interpretation Limits

- Does Not Mean: <<TIINEX_REQUIRED:DOES_NOT_MEAN>>
- Must Not Be Used To Claim: <<TIINEX_REQUIRED:MUST_NOT_CLAIM>>
`;
}


function returnHandoffFieldDomains() {
  const resolved = resolveSchemaModule({ schemaId: 'tiinex.handoff.v1' });
  const constraints = resolved?.module?.schemaSource?.runtimeProjection?.validationContract?.constraints || [];
  const domain = (group, field) => Object.freeze([...(constraints.find((item) => item?.kind === 'field-domain' && item?.targetGroup === group && item?.field === field)?.allowedValues || [])].map(String));
  return Object.freeze({
    exclusionKind: domain('Exclusions And Dependencies', 'Kind'),
    signalKind: domain('Completion Expectation', 'Signal Kind'),
    transferKind: domain('Transfers', 'Transfer Kind'),
    requiredContextAvailability: domain('Required Context', 'Availability')
  });
}
function domainText(values = []) { return values.length ? values.join(' | ') : 'qualified schema domain unavailable; preflight before authoring'; }

async function readContinuationState(workspaceRoot) {
  try { return JSON.parse(await readFile(path.join(workspaceRoot, STATE_RELATIVE_PATH), 'utf8')); }
  catch { return {}; }
}

function section(markdown = '', heading = '') {
  const pattern = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|^#\\s+Continuity Integrity|(?![\\s\\S]))`, 'mi');
  return pattern.exec(String(markdown || ''))?.[1] || '';
}
function field(text = '', name = '') {
  const m = new RegExp(`^-\\s+${escapeRe(name)}:[ \\t]*([^\\r\\n]*)$`, 'mi').exec(String(text || ''));
  return m ? String(m[1] || '').trim() : '';
}
function referenceTarget(text = '', name = '') {
  const value = field(text, name);
  const m = /\]\(([^)]+)\)/.exec(value);
  return m ? String(m[1] || '').trim() : '';
}
function nestedReferenceTarget(text = '', name = '') {
  const m = new RegExp(`^\\s*-\\s+${escapeRe(name)}:[ \t]*([^\r\n]*)$`, 'mi').exec(String(text || ''));
  const value = m ? String(m[1] || '').trim() : '';
  const target = /\]\(([^)]+)\)/.exec(value);
  return target ? String(target[1] || '').trim() : '';
}
function normalizeComparable(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function escapeRe(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function normalizeWorkspaceRelativePath(value = '') {
  const raw = String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw)) return '';
  const parts = raw.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) return '';
  return parts.join('/');
}
function safeWorkspaceTarget(root, relative) {
  const target = path.resolve(root, relative);
  const rel = path.relative(root, target);
  if (!relative || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error(`portable.cli.prepare-return.path.unsafe:${relative}`);
  return target;
}
