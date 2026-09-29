export function portableCliRuntimeProjection(runtime = {}) {
  const invocation = runtime?.commandInvocation && typeof runtime.commandInvocation === 'object' ? runtime.commandInvocation : {};
  const executable = String(invocation.executable || '').trim();
  const entrypoint = String(invocation.entrypoint || '').trim();
  const explicitPrefix = String(runtime?.commandPrefix || '').trim();
  const commandPrefix = explicitPrefix || (executable && entrypoint
    ? `${quoteCliToken(executable)} ${quoteCliToken(entrypoint)}`
    : 'node tools/tiinex-portable.mjs');
  return Object.freeze({
    executable,
    entrypoint,
    commandPrefix,
    state: executable && entrypoint ? 'exact-runtime-entrypoint' : explicitPrefix ? 'explicit-command-prefix' : 'portable-source-fallback',
    boundary: 'Execution projection only. The exact runtime entrypoint is host/runtime identity, not semantic authority or package/workspace ancestry.'
  });
}

export function projectPortableCliOperation(runtime = {}, operation = '', args = []) {
  const runtimeProjection = portableCliRuntimeProjection(runtime);
  const command = String(operation || '').trim();
  const normalizedArgs = (Array.isArray(args) ? args : []).map((value) => String(value));
  const cli = [runtimeProjection.commandPrefix, command, ...normalizedArgs.map(quoteCliToken)].filter(Boolean).join(' ');
  const invocation = runtimeProjection.executable && runtimeProjection.entrypoint
    ? Object.freeze({
      executable: runtimeProjection.executable,
      args: Object.freeze([runtimeProjection.entrypoint, command, ...normalizedArgs]),
      entrypoint: runtimeProjection.entrypoint,
      state: 'exact-runtime-entrypoint'
    })
    : Object.freeze({
      commandPrefix: runtimeProjection.commandPrefix,
      args: Object.freeze([command, ...normalizedArgs]),
      state: runtimeProjection.state
    });
  return Object.freeze({
    command,
    cli,
    invocation,
    runtime: runtimeProjection,
    boundary: 'Use the projected invocation/cli through the already-active Tiinex portable runtime. Do not reinterpret the operation name as a standalone PATH executable.'
  });
}

export function portableCliCommandPrefix(runtimeOrPrefix = '') {
  if (runtimeOrPrefix && typeof runtimeOrPrefix === 'object') return portableCliRuntimeProjection(runtimeOrPrefix).commandPrefix;
  const explicit = String(runtimeOrPrefix || '').trim();
  return explicit || 'node tools/tiinex-portable.mjs';
}

function quoteCliToken(value = '') {
  const text = String(value);
  if (/^[A-Za-z0-9_./:@=+,-]+$/.test(text) || /^<[^>\s]+>$/.test(text)) return text;
  return JSON.stringify(text);
}
