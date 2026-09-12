import { prepareNodeSourceFrontier } from './sourceFrontierComparison.js';
import { provePortableSourceReconciliation } from '../../comparison/sourceFrontierReconciliationProof.js';

export async function prepareNodeSourceReconciliationProofInput(input = {}, options = {}) {
  const [base, incoming, current, reconciled] = await Promise.all([
    prepareNodeSourceFrontier(input.base, { ...options, side: 'base' }),
    prepareNodeSourceFrontier(input.incoming, { ...options, side: 'incoming' }),
    prepareNodeSourceFrontier(input.current, { ...options, side: 'current' }),
    prepareNodeSourceFrontier(input.reconciled, { ...options, side: 'reconciled' })
  ]);
  return Object.freeze({
    base,
    incoming,
    current,
    reconciled,
    dispositions: input.dispositions || []
  });
}

export async function proveNodeSourceReconciliation(input = {}, options = {}) {
  const normalized = await prepareNodeSourceReconciliationProofInput(input, options);
  return provePortableSourceReconciliation(normalized);
}
