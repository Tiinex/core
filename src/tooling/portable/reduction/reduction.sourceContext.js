// Authoring-time surface validation. Does NOT reclassify historic Reduction records,
// establish source publication, or authorize destructive Reduction.
const WORKSPACE = /^- ([a-z][a-z0-9-]*)$/;
const GIT_SOURCE = /^  - \[([^\]]+)\]\(https:\/\/github\.com\/Tiinex\/([a-z0-9-]+)\/blob\/([0-9a-f]{40})\/(\.topics\/[^\s)#]+)\)$/;
const REPOSITORY_WORKSPACE = Object.freeze({ 'extension-vscode': 'vscode' });
const CARRIER_SOURCE = /^  - Source: `([^`\s]+\.handoff-package\.zip)::([a-z][a-z0-9-]*)::(\.topics\/[^`\s]+)`$/;
const RUNTIME_SOURCE = /^  - Source: `runtime::([a-zA-Z0-9_.:/-]+)`$/;
const C14N = /^    - sha256-base64url-c14n-v2: `([A-Za-z0-9_-]{43})`$/;
const RAW = /^    - sha256: `([a-f0-9]{64})`$/;

export function qualifyReductionSourceContext(markdown = '') {
  const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
  const indices = lines.flatMap((line, index) => line === '## Source Context' ? [index] : []);
  const findings = [];
  if (indices.length !== 1) return Object.freeze({ qualified: false, findings: Object.freeze(['source-context-heading-not-unique']), sourceCount: 0 });
  const start = indices[0] + 1;
  let end = lines.length;
  for (let i = start; i < lines.length; i++) if (/^#{1,2} /.test(lines[i]) || lines[i] === '---') { end = i; break; }
  let group = ''; let pending = null; let count = 0;
  for (let i = start; i < end; i++) {
    const value = lines[i];
    if (!value.trim()) continue;
    const groupMatch = value.match(WORKSPACE);
    if (groupMatch) {
      if (pending) findings.push(`source-${pending.line}-missing-integrity`);
      group = groupMatch[1]; pending = null; continue;
    }
    const git = value.match(GIT_SOURCE);
    if (git) {
      if (pending) findings.push(`source-${pending.line}-missing-integrity`);
      const [, label, repo, , sourcePath] = git;
      if (!group || group === 'carrier-only' || group === 'runtime' || group !== (REPOSITORY_WORKSPACE[repo] || repo)) findings.push(`line-${i + 1}-workspace-mismatch`);
      if (label !== sourcePath.split('/').pop()) findings.push(`line-${i + 1}-label-path-mismatch`);
      pending = { line: i + 1, kind: sourcePath.endsWith('.trace.md') || sourcePath.endsWith('.schema.md') ? 'trace' : 'binary' };
      count++; continue;
    }
    const carrier = value.match(CARRIER_SOURCE);
    if (carrier) {
      if (pending) findings.push(`source-${pending.line}-missing-integrity`);
      if (group !== 'carrier-only') findings.push(`line-${i + 1}-carrier-group-required`);
      // The declared exact carrier entry and hash remain source assertions: Tooling
      // cannot infer that any unprovided carrier is available or verified.
      pending = { line: i + 1, kind: 'carrier' }; count++;continue;
    }
    const runtime = value.match(RUNTIME_SOURCE);
    if (runtime) {
      if (pending) findings.push(`source-${pending.line}-missing-integrity`);
      if (group !== 'runtime') findings.push(`line-${i + 1}-runtime-group-required`);
      pending = {line: i + 1, kind: 'runtime'}; count++; continue;
    }
    const c14n = value.match(C14N);
    const raw = value.match(RAW);
    if (c14n || raw) {
      if (!pending) { findings.push(`line-${i + 1}-orphan-integrity`); continue; }
      if (pending.kind === 'trace' && !c14n) findings.push(`line-${i + 1}-trace-requires-c14n`);
      if (pending.kind === 'binary' && !raw) findings.push(`line-${i + 1}-binary-requires-sha256`);
      if (pending.kind === 'carrier' && !raw) findings.push(`line-${i + 1}-carrier-requires-raw-sha256`);
      if (pending.kind === 'runtime' && !raw) findings.push(`line-${i + 1}-runtime-requires-raw-sha256`);
      pending = null; continue;
    }
    findings.push(`line-${i + 1}-unrecognized-source`);
  }
  if (pending) findings.push(`source-${pending.line}-missing-integrity`);
  if (count === 0) findings.push('no-qualified-locators');
  return Object.freeze({ qualified: findings.length === 0, findings: Object.freeze(findings), sourceCount: count, boundary: 'Syntax validation only: does not fetch or re-hash published or carrier-only material, decide retention, validate semantic Source ownership, or authorize deletion.' });
}
