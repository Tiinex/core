import { prepareNodeSourceFrontierComparisonInput } from '../node/sourceFrontierComparison.js';

export async function prepareSourceFrontierComparisonCliInput(parsed = {}, flags = {}) {
  const threeWay = hasAny(flags, ['base', 'base-kind', 'incoming', 'incoming-kind', 'current', 'current-kind']);
  const descriptorOptions = {
    maxFiles: flags['max-files'],
    maxCarrierFiles: flags['max-carrier-files'],
    maxTextBytes: flags['max-text-bytes']
  };
  if (threeWay) {
    const request = {
      base: descriptorFromFlags('base', flags),
      incoming: descriptorFromFlags('incoming', flags),
      current: descriptorFromFlags('current', flags)
    };
    return { input: await prepareNodeSourceFrontierComparisonInput(request, descriptorOptions), options: {} };
  }
  const request = {
    left: descriptorFromFlags('left', flags),
    right: descriptorFromFlags('right', flags)
  };
  return { input: await prepareNodeSourceFrontierComparisonInput(request, descriptorOptions), options: {} };
}

function descriptorFromFlags(prefix, flags) {
  const kind = String(flags[`${prefix}-kind`] || '').trim();
  const root = String(flags[prefix] || '').trim();
  const workspaceId = String(flags[`${prefix}-id`] || flags[`${prefix}-workspace-id`] || '').trim();
  const select = splitFlag(flags[`${prefix}-select`]);
  const roots = parseRootBindings(flags[`${prefix}-roots`]);
  return Object.freeze({
    kind,
    ...(root ? { path: root } : {}),
    ...(workspaceId ? { workspaceId } : {}),
    ...(select.length ? { workspaceIds: select } : {}),
    ...(roots.length ? { workspaces: roots } : {}),
    ...(flags[`${prefix}-label`] ? { label: String(flags[`${prefix}-label`]) } : {})
  });
}

function parseRootBindings(value) {
  const items = splitFlag(value);
  return items.map((item) => {
    const eq = item.indexOf('=');
    if (eq <= 0 || eq === item.length - 1) return Object.freeze({ workspaceId: '', root: item });
    return Object.freeze({ workspaceId: item.slice(0, eq).trim(), root: item.slice(eq + 1).trim() });
  });
}
function splitFlag(value) { return !value || value === true ? [] : String(value).split(',').map((item) => item.trim()).filter(Boolean); }
function hasAny(flags, keys) { return keys.some((key) => Object.prototype.hasOwnProperty.call(flags, key)); }
