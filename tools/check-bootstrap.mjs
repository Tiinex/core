import { buildToolingBootstrapTransportFiles } from '../src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js';
const result = await buildToolingBootstrapTransportFiles();
if (result.summary.status !== 'embedded-qualified') throw new Error('Bootstrap build failed');
console.log(JSON.stringify(result.summary));
