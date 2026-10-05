import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializePortableNodeRuntime } from '../../src/tooling/portable/adapters/node/portableRuntime.initialize.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(here, '..', '..');
const candidates = [
  process.env.TIINEX_TEST_NATIVE_ROOT,
  path.resolve(coreRoot, '..', 'native')
].filter(Boolean);
const nativeRoot = candidates[0];
if (!nativeRoot) throw new Error('tiinex.test.native-root.required');
process.env.TIINEX_CONTENT_ROOTS = [nativeRoot, process.env.TIINEX_CONTENT_ROOTS].filter(Boolean).join(path.delimiter);
const runtime = await initializePortableNodeRuntime({ runtimeRoot: coreRoot, contentRoots: [nativeRoot], discoverBundled: false, discoverInstalled: false });
if (!['ready','qualified'].includes(runtime.status)) throw new Error(`tiinex.test.runtime-bootstrap.failed:${runtime.status}:${JSON.stringify(runtime.findings||[])}`);
