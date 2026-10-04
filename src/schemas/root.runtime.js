import { registeredSchemaModule } from './runtime.validation.js';

const ROOT_SCHEMA_ID = 'tiinex.root.v1';

export function runtimeRootSchemaModule() {
  return registeredSchemaModule(ROOT_SCHEMA_ID);
}

export function runtimeRootValidate(parsed = {}) {
  const module = runtimeRootSchemaModule();
  if (typeof module?.validate === 'function') return module.validate(parsed) || [];
  return [runtimeFinding('error', 'schema.runtime.root.unavailable', 'Qualified tiinex.root.v1 runtime companion is unavailable.')];
}

export function runtimeRootProspectiveValidate(parsed = {}, context = 'historical') {
  const module = runtimeRootSchemaModule();
  if (typeof module?.prospectiveValidate === 'function') return module.prospectiveValidate(parsed, context) || [];
  return String(context || '').trim() === 'candidate'
    ? [runtimeFinding('error', 'schema.runtime.root.prospective-unavailable', 'Candidate validation requires the qualified tiinex.root.v1 runtime companion.')]
    : [];
}

export function runtimeRootFallbackFinding(schemaId = '') {
  const module = runtimeRootSchemaModule();
  if (typeof module?.fallbackFinding === 'function') return module.fallbackFinding(schemaId);
  return runtimeFinding('warning', 'schema.runtime.root.fallback-unavailable', `Schema module unavailable for ${schemaId || 'missing schema'} and the qualified Root fallback companion is not loaded.`);
}

export function runtimeSchemaKey(schemaId = '') {
  const classifier = runtimeRootSchemaModule()?.classification?.schemaKey;
  return typeof classifier === 'function' ? classifier(schemaId) : (schemaId ? 'unknown' : 'plain');
}

export function runtimeSchemaBadgeClass(schemaId = '') {
  const classifier = runtimeRootSchemaModule()?.classification?.schemaBadgeClass;
  return typeof classifier === 'function' ? classifier(schemaId) : (schemaId ? 'unknown' : 'plain');
}

export function runtimeSchemaLabel(schemaId = '') {
  const classifier = runtimeRootSchemaModule()?.classification?.schemaLabel;
  if (typeof classifier === 'function') return classifier(schemaId);
  const id = String(schemaId || '').trim();
  return id || 'Plain material';
}

export function runtimeRootFallbackModel(parsedArtifact = {}, schemaResolution = {}, findings = []) {
  const createModel = runtimeRootSchemaModule()?.fallback?.createModel;
  if (typeof createModel === 'function') return createModel(parsedArtifact, schemaResolution, findings);
  const envelope = parsedArtifact?.envelope || {};
  const schemaId = String(envelope?.current?.schema?.id || '').trim();
  return Object.freeze({
    schema: 'tiinex.root.fallback.unavailable.v1',
    title: String(parsedArtifact?.title || envelope?.current?.summary || 'Untitled artifact'),
    summary: String(envelope?.current?.summary || ''),
    currentSchemaId: schemaId || 'unknown',
    envelopeSchemaId: String(envelope?.envelopeSchema?.id || 'unknown'),
    schemaKey: runtimeSchemaKey(schemaId),
    schemaLabel: runtimeSchemaLabel(schemaId),
    badgeClass: runtimeSchemaBadgeClass(schemaId),
    resolutionStatus: String(schemaResolution?.status || 'runtime-root-unavailable'),
    fallbackUsed: true,
    rootReadable: Boolean(parsedArtifact?.hasContinuityContext && schemaId),
    disclosure: 'runtime-root-unavailable',
    findings: Object.freeze([...(findings || [])])
  });
}

function runtimeFinding(severity, code, message) {
  return Object.freeze({ severity, code, message, source: 'tiinex.schema.runtime.root.v1' });
}
