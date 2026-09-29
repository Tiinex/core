import binding from './tiinex.reduction.v1.schema.json' with { type: 'json' };
import projection from './tiinex.reduction.v1.schema.runtime.json' with { type: 'json' };
import { defineBundledSchemaSource } from '../schema.source.js';

export const schemaSource = defineBundledSchemaSource(binding, projection, Object.freeze({
  sourceLabel: 'Tiinex portable Schema Pack'
}));
