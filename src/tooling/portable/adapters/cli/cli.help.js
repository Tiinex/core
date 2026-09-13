export function portableCliHelpText(commandPrefix = '', surfaceCommand = '') {
  const command = String(commandPrefix || '').trim()
    || (String(process.argv[1] || '').replace(/\\/g, '/').includes('/bin/') ? 'node bin/tiinex-portable.mjs' : 'node tools/tiinex-portable.mjs');
  const common = String(surfaceCommand || '').trim().toLowerCase();
  const specific = commonCommandHelp(command, common);
  if (specific) return specific.join('\n');
  return [
    'Tiinex portable tooling',
    '',
    'Common path (same command for humans and LLMs):',
    `${command} ground <handoff-package.zip> --route <Continue-from> [--holder-role <recipient-role>]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --holder-role <recipient-role> --continue <workspace-dir>`,
    `${command} author <workspace-dir> --schema <schema-id> (--path <workspace-relative-artifact> | --directory <workspace-relative-directory>) --body <body.md> [--parent <workspace-relative-or-qualified-parent>] [--parent-source <local-parent-file>] [--title <title>] [--summary <summary>] [--why <why>]`,
    `${command} handoff <workspace-dir>`,
    `${command} compare --left-kind <kind> --left <path> --right-kind <kind> --right <path> [side selectors]`,
    `${command} reconcile --base-kind <kind> --base <path> --incoming-kind <kind> --incoming <path> --current-kind <kind> --current <path> --reconciled-kind <kind> --reconciled <path> [--dispositions <json-file>]`,
    '',
    `Handoff aliases: ${command} orient <carrier.zip>; ${command} validate <carrier.zip>`,
    `Advanced/internal catalog: ${command} operations`,
    '',
    'Common boundaries:',
    '- `orient`, `ground`, and public `handoff` use compact decision-first default projections; add `--full` on the same command for the complete qualified receipt.',
    '- `ground` is read-only; append `--continue <workspace-dir>` only after `grounded-to-act` to materialize the selected carried Workspace and runtime-only `.tiinex/continuation.json`.',
    '- `author` uses continuation state to infer ordinary Parent continuity, seal c14n-v2 integrity, audit, and stage; invalid artifacts are not retained.',
    '- `handoff` uses continuation state plus the latest qualified authored Handoff to manufacture the canonical return carrier and excludes runtime-only `.tiinex` state. A received `--package-parent` continues carrier lineage only; it never selects parent Workspace source by itself. Advanced manufacture may opt into exact parent snapshots with `--package-parent-workspaces <id,...|all>` and may bind an explicitly selected renamed predecessor with `--package-parent-workspace-aliases`; aliases never infer source identity. Recovery/integration manufacture may require a full `reconcile --full` receipt with `--require-reconciliation-proof --reconciliation-proof <receipt.json>`; manufacture re-enumerates source and fails closed on missing/stale proof. Normal operator completion is one Handoff package plus the exact routing text; markdown-capable hosts render that routing in a fenced code block, and do not emit loose Evidence/Handoff markdown as extra transport payloads.',
    '- Remote reads/writes remain explicit host concerns. Tooling operation safety does not create or revoke semantic Task/Handoff authority.',
    '',
    'Use `<common-command> --help` for focused common-path usage. Use `operations` deliberately for the advanced/internal operation catalog.'
  ].join('\n');
}

function commonCommandHelp(command, surfaceCommand) {
  if (surfaceCommand === 'reconcile' || surfaceCommand === 'prove-source-reconciliation') return [
    'Tiinex portable tooling — prove source reconciliation for manufacture',
    '',
    `${command} reconcile --base-kind <local-workspace|local-frontier|handoff-package> --base <path> --incoming-kind <kind> --incoming <path> --current-kind <kind> --current <path> --reconciled-kind <kind> --reconciled <path> [side ids/selectors/roots] [--dispositions <json-file>]`,
    '',
    'The gate deterministically classifies exact, incoming-only, current-only, same-result-concurrent, deletion-candidate, and conflicting-overlap paths. Deletion/conflict candidates remain blocked until an explicit disposition selects `incoming`, `current`, `base`, `reconciled`, or `delete`. `reconciled` explicitly accepts the candidate bytes at that path and therefore supports a separately decided manual semantic resolution without Tooling deciding that resolution.',
    'The candidate reconciled frontier must preserve every automatically accepted incoming-only/current-only source identity and match every explicit disposition. Extra ungrounded candidate paths fail closed. Local source uses the same enumeration/exclusion contract as Handoff manufacture.',
    'Default output is compact. Use `--full` when saving a proof for `handoff --require-reconciliation-proof --reconciliation-proof <receipt.json>`; manufacture re-enumerates the Workspace and rejects stale or mismatched candidate bytes.',
    'This is mechanical byte/path proof only: no semantic merge correctness, intentional deletion, authority, acceptance, remote acquisition, or source mutation is inferred.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'compare' || surfaceCommand === 'compare-source-frontiers') return [
    'Tiinex portable tooling — compare source frontiers',
    '',
    'Two-way:',
    `${command} compare --left-kind <local-workspace|local-frontier|handoff-package> --left <path> --right-kind <kind> --right <path> [--left-id <workspace-id>] [--right-id <workspace-id>] [--left-select <id,...>] [--right-select <id,...>]`,
    'For local-frontier inputs use `--left-roots <id=path,...>` / `--right-roots <id=path,...>` instead of the side path.',
    '',
    'Three-way child-return reconciliation:',
    `${command} compare --base-kind <kind> --base <path> --incoming-kind <kind> --incoming <path> --current-kind <kind> --current <path> [side ids/selectors/roots]`,
    '',
    'Input kind is mandatory and is never guessed from a path. Local source uses the exact deterministic Workspace enumeration contract shared with Handoff manufacture. Handoff packages are qualified by this current Tooling runtime; package bootstrap code is not executed. Password-sealed Workspaces remain `locked` unless a caller uses the public Node API with an already-authorized opened Workspace provider.',
    'Default output is a compact path-bounded human/LLM projection; add `--full` for the complete machine receipt. Comparison is read-only source-byte evidence only: no merge, semantic diff, staging, commit, push, remote acquisition, authority, or acceptance inference.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'ground') return [
    'Tiinex portable tooling — ground',
    '',
    `${command} ground <handoff-package.zip> --route <Continue-from> [--holder-role <recipient-role>]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --holder-role <recipient-role> --continue <workspace-dir>`,
    '',
    'Reads and qualifies the exact selected Handoff route. The default projection keeps readiness, recipient authority boundary, explicit consuming-session holder binding, Required Context closure, continuity/blockers, current Task identity, and exact next action compact; add `--full` for the full qualified receipt.',
    'Add `--include-required-context <requirement-id,name|all>` and/or `--include-current-work` only when exact body text is needed. `ground --continue` includes the bounded current Task body needed to proceed, retains Required Context counts and continuity/recovery state, and does not repeat qualified Required Context item paths or root-detail receipts unless explicitly requested (or `--full` is used).',
    'For a Role recipient, `--holder-role <recipient-role>` is an explicit consuming-session Role-capacity binding; it is never inferred from route selection, provider identity, or assistant/user position. Without it, the holder remains unresolved and grounding stays discussion-only. After `grounded-to-act`, `--continue` materializes the selected carried Workspace into an empty local directory and writes runtime-only `.tiinex/continuation.json`. The grounding operation itself is non-mutating; downstream work authority comes from qualified Handoff/Task/Role artifacts, not from that operation-safety fact.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'author') return [
    'Tiinex portable tooling — author',
    '',
    `${command} author <workspace-dir> --schema <schema-id> (--path <workspace-relative-artifact> | --directory <workspace-relative-directory>) --body <body.md> [--parent <workspace-relative-or-qualified-parent>] [--parent-source <local-parent-file>] [--title <title>] [--summary <summary>] [--why <why>]`,
    '',
    'Uses qualified continuation state to infer the ordinary Parent when `--parent` is omitted. Supply `--path` for an exact requested coordinate or `--directory` to let Tooling allocate inside that directory-local filename namespace. For a Workspace-qualified Parent such as `business::.topics/...`, also supply `--parent-source` so Tooling reads and seals against the exact Parent bytes without treating the foreign address as a local path. Authoring seals c14n-v2 self-integrity, audits, stages, and updates continuation state only after qualification. Invalid output is not retained.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'handoff') return [
    'Tiinex portable tooling — handoff',
    '',
    `${command} handoff <workspace-dir>`,
    '',
    'Infers the latest qualified authored Handoff, selected Workspace identity/target, received package parent as carrier-lineage evidence, canonical projected filename, and return output directory. When the outgoing Handoff declares `Signal Kind: return`, delegation manufacture is transport-not-ready unless the delegator supplies `--return-package-sibling-index <1..9999>` for the expected non-Major return, or explicitly declares `--return-package-major`; the qualified reservation is carried in the route pointer and later continuation state. A non-major continuation that writes a carrier must supply an explicitly coordinated `--package-sibling-index <1..9999>`; Tooling will not silently discover the next sibling because isolated runtimes cannot prove a globally unique reservation. Distinct explicit sibling indexes preserve same-Major parallelism, while byte-identical duplicate transport at one exact output path is idempotent and divergent bytes fail closed. It does not implicitly carry sibling Workspaces from the received package; advanced manufacture must select exact reusable parent snapshots with `--package-parent-workspaces <id,...|all>`. Recovery/integration manufacture can bind the reconciled byte proof with `--require-reconciliation-proof --reconciliation-proof <full-reconcile-receipt.json>`; missing, non-ready, edited, or source-stale proof blocks package output. The default receipt keeps output identity, routing text, closure/workspace qualification, verification, and actionable findings compact; add `--full` for the complete manufacture receipt. Normal operator completion is exactly one Handoff package plus the adjacent exact routing text. In markdown-capable hosts render that routing in a fenced code block; do not emit canonical Workspace Evidence/Handoff markdown as additional loose transport files. Runtime-only `.tiinex` state is excluded from canonical manufacture.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'orient') return [
    'Tiinex portable tooling — orient',
    '',
    `${command} orient <handoff-package.zip>`,
    '',
    'Read-only recipient orientation for a supplied Handoff carrier. The default projection identifies qualified Workspaces/routes, selection, non-authority, and the exact grounding route; add `--full` for endpoint, closure, and package-detail receipts.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'validate') return [
    'Tiinex portable tooling — validate',
    '',
    `${command} validate <handoff-package.zip>`,
    '',
    'Audits carried Handoff-package context and qualification evidence without mutating source material.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  return null;
}
