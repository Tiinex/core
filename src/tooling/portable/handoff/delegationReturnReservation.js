export const PORTABLE_DELEGATION_RETURN_RESERVATION_SCHEMA_ID = 'tiinex.portable.delegation-return-reservation-preflight.v1';

export function qualifyDelegationReturnReservation(input = {}) {
  const markdown = String(input.markdown || input.handoffMarkdown || '');
  const completion = sectionText(markdown, 'Completion Expectation');
  const signalKind = field(completion, 'Signal Kind').toLowerCase();
  const returnExpected = signalKind === 'return';
  const declaredMajor = input.returnPackageMajor === true;
  const rawIndex = firstDefined(input.returnPackageSiblingIndex, reservedSiblingIndexFromHandoff(markdown));
  const findings = [];

  if (!returnExpected) return freeze({
    schema: PORTABLE_DELEGATION_RETURN_RESERVATION_SCHEMA_ID,
    state: 'not-required',
    returnExpected: false,
    carrierKind: 'not-applicable',
    siblingIndex: null,
    findings,
    boundary: boundary()
  });

  if (declaredMajor) {
    if (rawIndex !== undefined && rawIndex !== null && String(rawIndex).trim() !== '') findings.push(finding('error', 'portable.delegation-return-reservation.major-index-conflict', 'A Major return declaration must not also carry a non-Major package sibling index.'));
    return freeze({
      schema: PORTABLE_DELEGATION_RETURN_RESERVATION_SCHEMA_ID,
      state: findings.length ? 'blocked' : 'qualified',
      returnExpected: true,
      carrierKind: 'major',
      siblingIndex: null,
      findings,
      boundary: boundary()
    });
  }

  const rawSupplied = rawIndex !== undefined && rawIndex !== null && String(rawIndex).trim() !== '';
  const siblingIndex = parseSiblingIndex(rawIndex);
  if (rawSupplied && siblingIndex === null) findings.push(finding('error', 'portable.delegation-return-reservation.sibling-index.invalid', 'Explicit return package sibling override must be an integer in the supported range 1..9999.'));
  return freeze({
    schema: PORTABLE_DELEGATION_RETURN_RESERVATION_SCHEMA_ID,
    state: findings.length ? 'blocked' : 'qualified',
    returnExpected: true,
    carrierKind: 'non-major',
    siblingIndex,
    allocationMode: siblingIndex === null ? 'derive-from-qualified-recipient-selected-pointer' : 'explicit-advanced-override',
    findings,
    boundary: boundary()
  });
}

export function parseDelegationReturnReservationPointer(pointer = {}) {
  const siblingIndex = parseSiblingIndex(pointer.returnPackageSiblingIndex);
  const carrierKind = String(pointer.returnPackageCarrierKind || '').trim().toLowerCase();
  if (carrierKind === 'major') return freeze({ state: 'qualified', returnExpected: true, carrierKind: 'major', siblingIndex: null });
  if (carrierKind === 'non-major' && siblingIndex !== null) return freeze({ state: 'qualified', returnExpected: true, carrierKind: 'non-major', siblingIndex });
  return freeze({ state: 'unresolved', returnExpected: false, carrierKind: '', siblingIndex: null });
}


function reservedSiblingIndexFromHandoff(markdown = '') {
  const transfers = sectionText(markdown, 'Transfers');
  if (!transfers) return null;
  const lines = transfers.replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((line) => /^\s*-\s+reserved-return-package-sibling-index\s*$/i.test(line));
  if (start < 0) return null;
  const block = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^-\s+[^\s].*$/.test(lines[index])) break;
    block.push(lines[index]);
  }
  const description = field(block.join('\n'), 'Description');
  const match = description.match(/(?:package\s+sibling\s+index|sibling\s+index|index)\s+`?(\d{1,4})`?/i);
  return match ? match[1] : null;
}
function firstDefined(...values) {
  for (const value of values) if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  return null;
}

function parseSiblingIndex(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  if (!/^\d+$/.test(String(value).trim())) return null;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 9999 ? parsed : null;
}
function sectionText(markdown = '', heading = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'i').test(line));
  if (start < 0) return '';
  const out = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    out.push(lines[index]);
  }
  return out.join('\n');
}
function field(section = '', name = '') {
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRegExp(name)}\\s*:\\s*(.+?)\\s*$`, 'mi'));
  return String(match?.[1] || '').trim();
}
function boundary() { return 'Transport preflight only. Ordinary non-Major return allocation is derived later from the exact qualified selected parent Handoff Pointer ordinal; an explicit return sibling index is an advanced compatibility override only. This projection never promotes transport allocation into semantic Parent, Workspace, Role, acceptance, completion, participant, process, or source authority.'; }
function finding(severity, code, message) { return Object.freeze({ severity, code, message }); }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
