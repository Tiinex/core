import { runtimeRootFallbackModel, runtimeSchemaBadgeClass, runtimeSchemaKey } from '../schemas/root.runtime.js';

export function normalizeArtifact(parsedArtifact, schemaResolution, validation = []) {
  const currentSchemaId = parsedArtifact?.envelope?.current?.schema?.id || 'unknown';
  const fallbackModel = runtimeRootFallbackModel(parsedArtifact, schemaResolution, validation);
  return {
    title: parsedArtifact.title,
    schemaId: currentSchemaId,
    envelopeSchemaId: parsedArtifact?.envelope?.envelopeSchema?.id || 'unknown',
    moduleId: schemaResolution?.module?.id || '',
    resolutionStatus: schemaResolution?.status || 'unresolved',
    fallbackUsed: Boolean(schemaResolution?.fallbackUsed),
    createdAt: parsedArtifact?.envelope?.current?.createdAt || 'unknown',
    parentSchemaId: parsedArtifact?.envelope?.parent?.schema?.id || null,
    trace: parsedArtifact?.envelope?.parent?.trace || '',
    traceLabel: parsedArtifact?.envelope?.parent?.traceLabel || '',
    origin: parsedArtifact?.envelope?.parent?.origin || parsedArtifact?.envelope?.origin || '',
    boundary: parsedArtifact?.envelope?.parent?.boundary || parsedArtifact?.envelope?.boundary || '',
    schemaKey: runtimeSchemaKey(currentSchemaId),
    badgeClass: runtimeSchemaBadgeClass(currentSchemaId),
    rootReadable: fallbackModel.rootReadable,
    rootDisclosure: fallbackModel.disclosure,
    fallbackModel,
    sections: parsedArtifact?.body?.sections || [],
    validation
  };
}
