#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';
import { portableCanonicalBootstrapRuntime } from '../src/tooling/portable/schema/bootstrap/canonical.pack.js';
import { initializePortableNodeRuntime } from '../src/tooling/portable/adapters/node/portableRuntime.initialize.js';

const entrypoint = fileURLToPath(import.meta.url);
const initialized = await initializePortableNodeRuntime({ entrypoint, compositionRoot: process.cwd() });
if (initialized.status === 'blocked') {
  console.error(JSON.stringify({ schema: 'tiinex.portable.cli.error.v1', error: 'portable.runtime.initialization.blocked', findings: initialized.findings || [] }, null, 2));
  process.exitCode = 1;
} else {
  const runtime = Object.freeze({
    ...portableCanonicalBootstrapRuntime,
    runtimeInitialization: initialized,
    contentSources: initialized.contentSources || Object.freeze([]),
    commandInvocation: Object.freeze({ executable: process.execPath, entrypoint })
  });
  const exitCode = await runPortableCli(process.argv.slice(2), console, runtime);
  process.exitCode = exitCode;
}
