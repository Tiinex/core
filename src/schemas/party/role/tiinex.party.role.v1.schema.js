import { defineSchemaModule } from '../../contracts.js';
import { genericArtifactCreationImplementation } from '../../creation.renderer.js';
import { defineArtifactCreationCapability } from '../../creation.capability.js';
import binding from './tiinex.party.role.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.party.role.v1.schema.source.js';
import { partyRoleValidate } from './tiinex.party.role.v1.validate.js';

export const partyRoleSchemaModule = defineSchemaModule({
  id: 'tiinex.party.role.v1',
  label: 'Party Role',
  kind: 'concrete',
  role: 'party-role-artifact',
  parentSchemaId: 'tiinex.party.v1',
  summary: "Schema for a bounded role, capacity, responsibility, or authority-facing position without treating the role as proof that a particular person holds it.",
  binding,
  schemaSource,
  artifactCreation: defineArtifactCreationCapability(binding, Object.freeze({ ...genericArtifactCreationImplementation, transitionTypes: Object.freeze(['create-artifact', 'continue-from-record']) })),
  validate: partyRoleValidate,
  capabilities: Object.freeze({
    supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
    canRenderFallback: true,
    boundaries: Object.freeze(['Read companion only; canonical Docs schema bytes remain semantic authority.'])
  }),
  read: Object.freeze({
    label: 'Party Role',
    sections: Object.freeze(['Role Identity', 'Role Boundary', 'Authority And Responsibility Boundary', 'Holder Relationship', 'Interpretation Limits'])
  }),
  viewActions: Object.freeze({
    lineage: Object.freeze(['record.open', 'record.markdown', 'record.source'])
  })
});
