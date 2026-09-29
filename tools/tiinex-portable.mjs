#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';
import { portableCanonicalBootstrapRuntime } from '../src/tooling/portable/schema/bootstrap/canonical.pack.js';

const runtime = Object.freeze({
  ...portableCanonicalBootstrapRuntime,
  commandInvocation: Object.freeze({ executable: process.execPath, entrypoint: fileURLToPath(import.meta.url) })
});
const exitCode = await runPortableCli(process.argv.slice(2), console, runtime);
process.exitCode = exitCode;
