const ASSIGNMENT_MODE_ORDER = Object.freeze([
  'explicit-session',
  'explicit-user-session',
  'explicit-role-invocation',
  'handoff',
  'explicit-participation'
]);
const ASSIGNMENT_MODE_SET = new Set(ASSIGNMENT_MODE_ORDER);

export function partyRoleValidate(artifact = {}) {
  if (artifact?.envelope?.current?.schema?.id !== 'tiinex.party.role.v1') return [{ severity: 'warning', code: 'party.role.schema.mismatch', messageKey: 'party.role.schema.mismatch', message: 'Party Role validator invoked for a non-Role current schema.', source: 'tiinex.party.role.v1' }];
  const section = sectionBody(String(artifact?.body?.text || ''), 'Holder Relationship');
  const values = fieldValues(section, 'Assignment Modes');
  if (values.length !== 1) return [{ severity: 'error', code: values.length ? 'party.role.assignmentModes.duplicate-field' : 'party.role.assignmentModes.missing', messageKey: values.length ? 'party.role.assignmentModes.duplicate-field' : 'party.role.assignmentModes.missing', message: values.length ? 'Holder Relationship must contain exactly one Assignment Modes field.' : 'Holder Relationship must declare Assignment Modes directly.', source: 'tiinex.party.role.v1', fixability: 'manual' }];
  const raw = values[0];
  if (!raw) return [{ severity: 'error', code: 'party.role.assignmentModes.empty', messageKey: 'party.role.assignmentModes.empty', message: 'Assignment Modes must contain at least one canonical assignment-mode token.', source: 'tiinex.party.role.v1', fixability: 'manual' }];
  const tokens = raw.split(', ');
  const canonical = tokens.length > 0
    && tokens.every((token) => ASSIGNMENT_MODE_SET.has(token))
    && new Set(tokens).size === tokens.length
    && tokens.every((token, index) => index === 0 || ASSIGNMENT_MODE_ORDER.indexOf(tokens[index - 1]) < ASSIGNMENT_MODE_ORDER.indexOf(token))
    && tokens.join(', ') === raw;
  if (!canonical) return [{ severity: 'error', code: 'party.role.assignmentModes.invalid', messageKey: 'party.role.assignmentModes.invalid', message: `Assignment Modes must be plain canonical tokens separated by ", " in canonical order. Allowed values: ${ASSIGNMENT_MODE_ORDER.join(', ')}.`, source: 'tiinex.party.role.v1', fixability: 'manual', params: { field: 'Assignment Modes', allowedValues: ASSIGNMENT_MODE_ORDER.join(', ') } }];
  return [{ severity: 'info', code: 'party.role.assignmentModes.canonical', messageKey: 'party.role.assignmentModes.canonical', message: 'Assignment Modes is present and canonical.', source: 'tiinex.party.role.v1', params: { field: 'Assignment Modes' } }];
}

function sectionBody(markdown = '', heading = '') {
  const escaped = escapeRegExp(heading);
  const match = String(markdown || '').match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`, 'm'));
  return match?.[1] || '';
}
function fieldValues(section = '', label = '') {
  const escaped = escapeRegExp(label);
  return [...String(section || '').matchAll(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.*?)\\s*$`, 'gm'))].map((match) => match[1]);
}
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'); }
