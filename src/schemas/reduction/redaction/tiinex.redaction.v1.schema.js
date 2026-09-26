import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.redaction.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.redaction.v1.schema.source.js';

export const redactionSchemaModule = defineSchemaModule({
  id: 'tiinex.redaction.v1',
  label: 'Redaction',
  kind: 'concrete',
  role: 'redaction-artifact',
  parentSchemaId: 'tiinex.reduction.v1',
  summary: 'Schema for observable redaction artifacts that preserve removal, masking, transformation, residual risk, and carry-forward limits.',
  binding,
  schemaSource,
  capabilities: Object.freeze({
    supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
    canRenderFallback: true,
    boundaries: Object.freeze(['Read companion only; canonical Docs schema bytes remain semantic authority.', 'Ordinary Redaction creation is not declared; supplied-body authoring may still be validated against exact schema authority.'])
  }),
  read: Object.freeze({
    label: 'Redaction',
    sections: Object.freeze(['Source Context', 'Redaction Action', 'Carry-Forward State', 'Loss And Uncertainty', 'Residual Risk', 'Validation'])
  }),
  viewActions: Object.freeze({
    lineage: Object.freeze(['record.open', 'record.markdown', 'record.source'])
  })
});
