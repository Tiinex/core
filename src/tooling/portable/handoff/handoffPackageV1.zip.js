import { packageFileBytes } from '../../../export/package.bytes.js';
import { createDeterministicStoredZip } from '../output/deterministic.zip.js';
import { inspectHandoffPackageV1 } from './handoffPackageV1.inspect.js';

export function handoffPackageV1ZipBytes(bundle = {}) {
  const inspection = inspectHandoffPackageV1(bundle);
  if (inspection.status !== 'valid') {
    const error = new Error('portable.handoff-package-v1.zip.bundle.invalid');
    error.inspection = inspection;
    throw error;
  }
  return createDeterministicStoredZip((bundle.files || []).map((file) => ({
    name: String(file.path || ''),
    data: packageFileBytes(file)
  })));
}
