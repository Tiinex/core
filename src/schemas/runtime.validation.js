import { resolveSchemaModule } from './resolver.js';

export function validateWithRegisteredSchema(schemaId = '', parsed = {}, { unavailableSeverity = 'error', unavailableCode = 'schema.runtime.validator.unavailable' } = {}) {
  const id = String(schemaId || '').trim();
  const resolution = resolveSchemaModule({ schemaId: id });
  const module = resolution?.fallbackUsed ? null : resolution?.module || null;
  if (module && typeof module.validate === 'function') return module.validate(parsed) || [];
  return [Object.freeze({
    severity: unavailableSeverity,
    code: unavailableCode,
    message: `Qualified runtime validator is unavailable for ${id || 'the requested schema'}.`,
    source: 'tiinex.schema.runtime.validation.v1'
  })];
}

export function registeredSchemaModule(schemaId = '') {
  const resolution = resolveSchemaModule({ schemaId: String(schemaId || '').trim() });
  return resolution?.fallbackUsed ? null : resolution?.module || null;
}
