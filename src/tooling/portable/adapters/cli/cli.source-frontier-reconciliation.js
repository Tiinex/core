import { prepareNodeSourceReconciliationProofInput } from '../node/sourceFrontierReconciliationProof.js';
import { sourceFrontierDescriptorFromFlags } from './cli.source-frontier-comparison.js';

export async function prepareSourceFrontierReconciliationCliInput(flags = {}, dispositions = []) {
  const descriptorOptions = {
    maxFiles: flags['max-files'],
    maxCarrierFiles: flags['max-carrier-files'],
    maxTextBytes: flags['max-text-bytes']
  };
  const request = {
    base: sourceFrontierDescriptorFromFlags('base', flags),
    incoming: sourceFrontierDescriptorFromFlags('incoming', flags),
    current: sourceFrontierDescriptorFromFlags('current', flags),
    reconciled: sourceFrontierDescriptorFromFlags('reconciled', flags),
    dispositions: Array.isArray(dispositions) ? dispositions : dispositions?.dispositions || []
  };
  return { input: await prepareNodeSourceReconciliationProofInput(request, descriptorOptions), options: {} };
}
