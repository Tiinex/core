import binding from './tiinex.handoff.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.handoff.v1.schema.source.js';
import { defineGenericArtifactSchemaModule } from '../../generic.artifact.module.js';

export const handoffSchemaModule = defineGenericArtifactSchemaModule({
  id: 'tiinex.handoff.v1',
  label: 'Handoff',
  parentSchemaId: 'tiinex.root.v1',
  kind: 'concrete',
  role: 'workflow-handoff-artifact',
  summary: 'Maintained declarative bounded work/responsibility transfer artifact.',
  binding,
  schemaSource,
  authoringAffordances: Object.freeze([
    { input: 'From', displayLabel: 'From', control: 'reference-picker', candidateSource: 'qualified-handoff-endpoints', manualAllowed: true, selectionKey: 'From', fills: { 'From Kind': 'kind', 'From Reference': 'reference' } },
    { input: 'To', displayLabel: 'To', control: 'reference-picker', candidateSource: 'qualified-handoff-endpoints', manualAllowed: true, selectionKey: 'To', fills: { 'To Kind': 'kind', 'To Reference': 'reference' } },
    { input: 'Return To Reference', displayLabel: 'Return To', control: 'reference-picker', candidateSource: 'qualified-handoff-endpoints', manualAllowed: true, selectionKey: 'Return To', fills: { 'Return To Reference': 'reference' } }
  ])
});
