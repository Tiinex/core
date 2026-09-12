import { buildToolingBootstrapTransportFiles } from './handoff.manufacture.bootstrap.js';
import { normalizeHandoffCarrierLineage } from '../../handoff/carrierLineage.js';
import { normalizeHandoffCarrierProfile } from '../../handoff/carrierProfile.js';

export async function prepareNodeBootstrapCarrierManufacturingInput(input = {}, options = {}) {
  const toolingBootstrap = await buildToolingBootstrapTransportFiles({
    delivery: input.toolingBootstrap || input.bootstrapDelivery || 'embedded',
    runtimeRoot: input.runtimeRoot || options.runtimeRoot,
    expected: input.expectedToolingBootstrap || null,
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  });
  return Object.freeze({
    carrierMode: 'bootstrap', createdAt: String(input.createdAt || ''), workspaceMaterializations: Object.freeze([]), workspaceTargets: Object.freeze([]),
    additionalTransportFiles: toolingBootstrap.files,
    carrierLineage: normalizeHandoffCarrierLineage(input.carrierLineage || null), carrierProfile: normalizeHandoffCarrierProfile(input.carrierProfile || null),
    toolingBootstrap: toolingBootstrap.summary, manufacturingEvidence: Object.freeze({ toolingBootstrap: toolingBootstrap.summary }), verifyRoundtrip: input.verifyRoundtrip !== false
  });
}
