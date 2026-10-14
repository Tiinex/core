/**
 * Read-only, non-authoritative parsing of the optional Current Authors field.
 * Preserve the authored value. A link is a locator, not proof of actor identity,
 * a Role holder, endorsement, or work authority.
 */
export function parseAuthorAttributions(value = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return Object.freeze([]);
  const units = splitAttributionUnits(raw);
  return Object.freeze(units.map((unit) => {
    const principal = unit.match(/^\[([^\]]+)\]\(([^)]+)\)(?:\s+([\s\S]+))?$/);
    const label = principal ? principal[1].trim() : unit.match(/^(.+?)\s+\((.+)\)$/)?.[1]?.trim() || unit;
    const context = principal ? String(principal[3] || '').trim() : unit.slice(label.length).trim();
    const references = [...context.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => Object.freeze({ label: match[1].trim(), target: match[2].trim(), qualification: 'not-established' }));
    return Object.freeze({
      raw: unit,
      label,
      reference: principal ? principal[2].trim() : '',
      context,
      contextReferences: Object.freeze(references),
      qualification: 'not-established',
      boundary: 'Display and declared references only; neither identity nor Role holder relationship is qualified.'
    });
  }));
}

function splitAttributionUnits(value) {
  const items = [];
  let bracketDepth = 0;
  let parenDepth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === '[') bracketDepth += 1;
    else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    else if (ch === '(') parenDepth += 1;
    else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (ch === ';' && bracketDepth === 0 && parenDepth === 0) {
      if (value.slice(start, i).trim()) items.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (value.slice(start).trim()) items.push(value.slice(start).trim());
  // Historic author metadata sometimes used comma-separated plain names.
  if (items.length === 1 && !/[\[\]()]/.test(value) && value.includes(',')) return Object.freeze(value.split(',').map((s) => s.trim()).filter(Boolean));
  return Object.freeze(items);
}
