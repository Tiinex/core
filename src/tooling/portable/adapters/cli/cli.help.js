import { portableCliCommandPrefix } from './cli.invocation.js';

export function portableCliHelpText(runtimeOrPrefix = '', surfaceCommand = '') {
  const command = portableCliCommandPrefix(runtimeOrPrefix);
  const common = String(surfaceCommand || '').trim().toLowerCase();
  const specific = commonCommandHelp(command, common);
  if (specific) return specific.join('\n');
  return [
    'Tiinex portable tooling',
    '',
    'Common path (same command for humans and LLMs):',
    `${command} version [--tree|--json]`,
    `${command} catalog [--json]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> [--holder-role <recipient-role>] [--holder-assignment-mode <mode>] [--recipient]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --holder-role <recipient-role> [--holder-assignment-mode <mode>] --recipient --continue <workspace-dir>`,
    `${command} qualify-return <continued-workspace-dir> --result <result-path> --expected <expected-file-path>`,
    `${command} prepare-return <continued-workspace-dir>`,
    `${command} author <workspace-dir> --schema <schema-id> (--path <workspace-relative-artifact> | --directory <workspace-relative-directory>) --body <body.md> [--parent <workspace-relative-or-qualified-parent>] [--parent-source <local-parent-file>] [--parent-reference <commit-pinned-browse+git-permalink>] [--title <title>] [--summary <summary>] [--why <why>] [--preflight]`,
    `${command} project-transition-catalog [<workspace-or-material-root> ...] [--output-schema <schema-id>] [--input-schema <schema-id>]`,
    `${command} project-transition-neighborhood [<workspace-or-material-root> ...] --output-schema <schema-id> [--input-schema <schema-id>]`,
    `${command} schemas status <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} schemas sync <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} schemas check <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} handoff <workspace-dir>`,
    `${command} handoff <workspace-dir> --carrier-mode workspace (--package-parent <intended-predecessor-carrier.zip> | --new-root) [--output-dir <dir>]`,
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
    '- `handoff` uses continuation state plus the latest qualified authored Handoff to manufacture the canonical return carrier and excludes runtime-only `.tiinex` state. For pointerless Workspace-carrier manufacture, carrier continuity is an explicit choice: use `--package-parent <intended-predecessor-carrier.zip>` to continue that carrier, or `--new-root` to intentionally start an independent root. Carrier parent describes intended carrier continuity and is independent of which qualified package/local Workspace supplied the source material. A received `--package-parent` continues carrier lineage only; it never selects parent Workspace source by itself. Advanced manufacture may opt into exact parent snapshots with `--package-parent-workspaces <id,...|all>` and may bind an explicitly selected renamed predecessor with `--package-parent-workspace-aliases`; aliases never infer source identity. Recovery/integration manufacture may require a full `reconcile --full` receipt with `--require-reconciliation-proof --reconciliation-proof <receipt.json>`; manufacture re-enumerates source and fails closed on missing/stale proof. Normal operator completion is one Handoff package plus the exact routing text; markdown-capable hosts render that routing in a fenced code block, and do not emit loose Evidence/Handoff markdown as extra transport payloads.',
    '- Remote reads/writes remain explicit host concerns. Tooling operation safety does not create or revoke semantic Task/Handoff authority.',
    '',
    'Use `<common-command> --help` for focused common-path usage. Use `operations` deliberately for the advanced/internal operation catalog.'
  ].join('\n');
}

function commonCommandHelp(command, surfaceCommand) {
  if (surfaceCommand === 'catalog') return [
    'Tiinex portable tooling — reusable content catalog',
    '',
    `${command} catalog`,
    `${command} catalog --json`,
    '',
    'Reads only exact manifest-declared content bundled with the active bootstrap and projects available reusable Entries, offered Process guidance, and Scaffolds. Registered discovery-surface membership is availability only; it does not establish applicability, occurrence, work/Role authority, target binding, acceptance, or mutation authority.',
    'No ZIP archaeology, package-name special casing, network lookup, or repository crawl is performed.',
    ''
  ];
  if (surfaceCommand === 'version') return [
    'Tiinex portable tooling — bootstrap/runtime version and composition',
    '',
    `${command} version`,
    `${command} version --tree`,
    `${command} version --json`,
    '',
    'Read-only local projection of bootstrap build time, Core package identity, manifest-declared runtime composition identity, Schema Pack source, and schema/companion dependency facts. `--tree` prints the full human-readable schema/companion tree; `--json` emits the full machine-readable receipt.',
    'Equal composition SHA-256 means the exact manifest-declared runtime representation is byte-identical and broad runtime/schema/companion re-reading is unnecessary unless other qualified context changed. Build timestamp, Core version, ZIP SHA, and arrival order do not by themselves establish semantic supersession.',
    'No network lookup, publication check, or work/selection authority is performed.',
    ''
  ];
  if (surfaceCommand === 'project-transition-neighborhood') return [
    'Tiinex portable tooling — schema-local Transition neighborhood',
    '',
    `${command} project-transition-neighborhood [<workspace-or-material-root> ...] --output-schema <schema-id> [--input-schema <schema-id>]`,
    '',
    'Projects Transition Definitions only when they are explicitly attached by a Schema Transition Companion reached through supplied Semantic Package material.',
    'Core-native Handoff transitions are bundled by default, independently of App; external Workspace material is explicitly supplied. Use --no-native to isolate external material. Package/companion attachment is required; attachment still does not prove current applicability, executability, authorization, recommendation, ordering, or successful invocation.',
    'Independent Transition representations remain independent even when Canonical Identifier + Version text matches.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'project-transition-catalog') return [
    'Tiinex portable tooling — Transition Definition discovery',
    '',
    `${command} project-transition-catalog [<workspace-or-material-root> ...] [--output-schema <schema-id>] [--input-schema <schema-id>]`,
    `${command} project-transition-neighborhood [<workspace-or-material-root> ...] --output-schema <schema-id> [--input-schema <schema-id>]`,
    '',
    'Discovers bundled Core-native and explicitly supplied external tiinex.transition.definition.v1 artifacts regardless of their workspace-local directory, read-qualifies them against the bundled canonical Transition Definition contract, and preserves source representation identity.',
    'Use --no-native to inspect only explicitly supplied external material. Independent supplied representations stay independent; Canonical Identifier + Version text is not treated as universal representation identity.',
    'Discovery and target-schema filtering do not imply Semantic Package/Schema Transition Companion attachment, applicability, recommendation, execution, or generation authority.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'schemas') return [
    'Tiinex portable tooling — native schema source lifecycle',
    '',
    `${command} schemas status <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} schemas sync <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} schemas check <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    '',
    'Uses only local Workspace bytes. Sync deterministically projects canonical Docs schemas into the Core Schema Pack, generated catalog, exact source bindings, and specialized runtime projections. Check is read-only and fails on generated drift or stale local schema Markdown copies.',
    'Without `--published`, source content remains local-qualified and no immutable remote publication authority is claimed. `--published` requires one exact `--docs-commit`; Tooling does not fetch or verify that remote commit and therefore expects the caller to supply already-qualified publication metadata.',
    'Generated material never overwrites handwritten companion implementations. Schemas without specialized companions remain registry-known through the generic Schema Pack runtime and creation stays fail-closed when generic representation is insufficient.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
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
    `${command} ground <handoff-package.zip> --route <Continue-from> [--holder-role <recipient-role>] [--holder-assignment-mode <mode>] [--recipient]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --holder-role <recipient-role> [--holder-assignment-mode <mode>] --recipient --continue <workspace-dir>`,
    '',
    'Reads and qualifies the exact selected Handoff route. The default projection keeps readiness, recipient authority boundary, consuming-session holder binding, Required Context closure, continuity/blockers, current Task identity, and exact next action compact; add `--full` for the full qualified receipt.',
    'Use `--recipient` for one-pass recipient grounding: it projects all exact qualified Required Context bodies plus bounded current-work body text in the same grounding operation. When the recipient intends to act locally, combine it with `--continue <empty-workspace-dir>` in that same command; Tooling materializes only after the same operation reaches `grounded-to-act` while keeping material qualification separate from cognitive interpretation. Add `--include-required-context <requirement-id,name|all>` and/or `--include-current-work` for narrower manual body selection. `ground --continue` includes the bounded current Task body needed to proceed, retains Required Context counts and continuity/recovery state, and does not repeat qualified Required Context item paths or root-detail receipts unless explicitly requested (or `--full` is used).',
    'For a Role recipient, exact qualified consumption of the selected Handoff may establish the bounded consuming-session Role-capacity binding when the exact qualified recipient Role authorizes canonical Assignment Mode `handoff`. `--holder-role <recipient-role>` remains an explicit consuming-session assertion and must match the selected recipient. When that Role requires an explicit canonical assignment mode such as `explicit-participation`, supply it exactly with `--holder-assignment-mode <mode>`; Tooling checks it against the qualified Role authority and never infers a human/LLM-specific mode. Mismatches block and never fall back to Handoff assignment. No binding is inferred from package delivery, route orientation alone, provider identity, or assistant/user position. After `grounded-to-act`, `--continue` materializes the selected carried Workspace into an empty local directory and writes runtime-only `.tiinex/continuation.json`. The grounding operation itself is non-mutating; downstream work authority comes from qualified Handoff/Task/Role artifacts, not from that operation-safety fact.',
    'Recipient completion remains inside the continued Workspace until return manufacture. When the selected Handoff declares a return, first establish a Tooling-qualified return transition for one exact bounded result with `qualify-return`; `prepare-return` fails closed without that byte-current receipt. This transition gate does not establish Task completion/closure. After return authoring qualification, run `handoff <workspace-dir>`. Normal external completion is exactly one `.handoff-package.zip` plus Tooling\'s exact adjacent routing text; do not return loose result/Evidence/Handoff/Workspace files as extra transport payloads.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'qualify-return') return [
    'Tiinex portable tooling — qualify return transition',
    '',
    `${command} qualify-return <continued-workspace-dir> --result <workspace-relative-result> --expected <workspace-relative-expected-file>`,
    '',
    'Reads qualified runtime continuation state and the exact selected Handoff return protocol. It compares the exact local result bytes to one explicit expected local file, writes runtime-only `.tiinex/return-transition.json`, and qualifies only that result-specific return transition when the bytes match. It does not establish Task completion, Task closure, acceptance, or remote-write authority.',
    'After it reports `qualified`, run `prepare-return <continued-workspace-dir>`. Prepare-return rechecks the transition receipt and both byte sets and fails closed if either changed.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'prepare-return') return [
    'Tiinex portable tooling — prepare return',
    '',
    `${command} prepare-return <continued-workspace-dir>`,
    '',
    'Requires a byte-current qualified `.tiinex/return-transition.json` created by `qualify-return`, then reads qualified runtime continuation state plus the exact selected incoming Handoff. It writes one runtime-only `.tiinex/return-handoff.body.md` scaffold with exact From/To Role endpoints and required structural sections. Replace every `<<TIINEX_REQUIRED:...>>` marker with exact supported return semantics. The scaffold already contains complete nested field shapes. Run the emitted `author ... --preflight` command first; it renders, seals, audits, and stages without retaining the candidate or mutating continuation state. After it qualifies, run the emitted `author` command to retain the Handoff. After qualification run the emitted `handoff` command to manufacture exactly one canonical return carrier plus routing text.',
    'The scaffold is runtime-only and excluded from canonical Workspace/Handoff Package manufacture. The exact returned Material Reference is locked to the result qualified by `qualify-return`. The command does not claim Task completion/closure, acceptance, source facts, or remote-write authority.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'author') return [
    'Tiinex portable tooling — author',
    '',
    `${command} author <workspace-dir> --schema <schema-id> (--path <workspace-relative-artifact> | --directory <workspace-relative-directory>) --body <body.md> [--parent <workspace-relative-or-qualified-parent>] [--parent-source <local-parent-file>] [--parent-reference <commit-pinned-browse+git-permalink>] [--title <title>] [--summary <summary>] [--why <why>] [--preflight]`,
    `${command} schemas status <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} schemas sync <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    `${command} schemas check <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published]`,
    '',
    'Uses qualified continuation state to infer the ordinary Parent when `--parent` is omitted. Supply `--path` for an exact requested coordinate or `--directory` to let Tooling allocate inside that directory-local filename namespace. For a Workspace-qualified Parent such as `business::.topics/...`, also supply `--parent-source` for the exact Parent bytes and `--parent-reference` with the commit-pinned browse+git permalink. The `workspace::path` value remains an internal selector only and is never serialized as durable cross-Workspace recovery authority. Authoring seals c14n-v2 self-integrity, audits, stages, and updates continuation state only after qualification. `--preflight` uses that exact qualification path but removes the candidate and leaves continuation state unchanged; use it before the durable author step when validating a filled runtime scaffold. Invalid output is not retained.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'handoff') return [
    'Tiinex portable tooling — handoff',
    '',
    `${command} handoff <workspace-dir>`,
    `${command} handoff <workspace-dir> --carrier-mode workspace (--package-parent <intended-predecessor-carrier.zip> | --new-root) [--output-dir <dir>]`,
    '',
    'For pointerless Workspace-carrier manufacture, `--package-parent` means the intended predecessor carrier, not the source package/material origin. Source material may be composed from other qualified packages or local Workspace roots. Omitting `--package-parent` does not silently mean new root; `--new-root` is required for an intentional independent root.',
    'For routed return manufacture, common-path handoff infers the latest qualified authored Handoff, selected Workspace identity/target, received package parent as carrier-lineage evidence, canonical projected filename, and return output directory. Ordinary non-Major continuation derives its sibling ordinal from the exact qualified selected Handoff Pointer order in the received parent carrier, so common-path `handoff` does not require `--package-sibling-index` or `--return-package-sibling-index`. A single selected Pointer derives `-1`; parallel qualified Pointers derive dense local ordinals in Pointer order, and each returned branch continues from its own carrier. Advanced manufacture may declare `--package-consolidation` against the common pre-batch parent carrier; with N qualified route Pointers it derives consolidation ordinal N+1 and rejects conflicting overrides or missing qualified common-frontier topology. `--package-sibling-index` remains an advanced compatibility override only when qualified route topology is unavailable for ordinary route returns, and must match when topology already proves the value; conflicting or ambiguous topology fails closed. `--return-package-major` remains the explicit Major-return declaration. Different carrier prefixes are never globally coordinated. Byte-identical duplicate transport at one exact output path is idempotent and divergent bytes fail closed. It does not implicitly carry sibling Workspaces from the received package; advanced manufacture must select exact reusable parent snapshots with `--package-parent-workspaces <id,...|all>`. Recovery/integration manufacture can bind the reconciled byte proof with `--require-reconciliation-proof --reconciliation-proof <full-reconcile-receipt.json>`; missing, non-ready, edited, or source-stale proof blocks package output. The default receipt keeps output identity, routing text, closure/workspace qualification, verification, and actionable findings compact; add `--full` for the complete manufacture receipt. Normal operator completion is exactly one Handoff package plus the adjacent exact routing text. In markdown-capable hosts render that routing in a fenced code block; do not emit canonical Workspace Evidence/Handoff markdown as additional loose transport files. Runtime-only `.tiinex` state is excluded from canonical manufacture.',
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
