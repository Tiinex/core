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
    `${command} read-content --source <catalog-source-id> --path <catalog-source-path>`,
    `${command} init-workspace <new-workspace-dir> --workspace-id <id> --title <title> --authors <authors>`,
    `${command} review-deliverable --artifact <new-output-file> --workspace <local-scratch-dir> [--carrier <produced-carrier.zip>]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> [--holder-role <recipient-role>] [--holder-assignment-mode <mode>] [--recipient]`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --holder-role <recipient-role> [--holder-assignment-mode <mode>] --recipient --continue <workspace-dir>`,
    `${command} qualify-return <continued-workspace-dir> --result <result-path> [--expected <expected-file-path>]`,
    `${command} prepare-return <continued-workspace-dir>`,
    `${command} author <workspace-dir> --schema <schema-id> (--path <workspace-relative-artifact> | --directory <workspace-relative-directory>) --body <body.md> [--parent <workspace-relative-or-qualified-parent>] [--parent-source <local-parent-file>] [--parent-reference <commit-pinned-browse+git-permalink>] [--historical-parent-proof <accepted-repository-read.json>] [--title <title>] [--summary <summary>] [--why <why>] [--authors <author>] [--preflight]`,
    `${command} project-lineage-relation-neighborhood <material-root...> --focus <workspace::path|path> [--workspace-roots <roots.json>] [--coverage complete|bounded|partial|unknown] [--depth <n>]`,
    `${command} qualify-lineage-directory <workspace-or-material-root> --workspace-id <id> --directory <workspace-relative-directory> [--coverage complete|bounded|partial|unknown]`,
    `${command} qualify-lineage-workspace <workspace-or-material-root> --workspace-id <id> [--coverage complete|bounded|partial|unknown]`,
    `${command} project-git-commit-provenance <repository-root> [--label <human-label>] [--message]`,
    `${command} agent-role-sync --workspace <workspace-root> --role <qualified-role.trace.md> --mode plan|check|apply [--approved --expected-after-sha256 <sha256>]`,
    `${command} inspect-asset-relocation-workspace --request <request.json> [--compact]`,
    `${command} qualify-cross-workspace-publication --request <request.json> [--compact]`,
    `${command} inspect-cross-workspace-git-source --request <request.json> [--compact]`,
    `${command} inspect-cross-workspace-continuity --request <request.json> [--compact]`,
    `${command} inspect-historical-schema-source --request <request.json> [--compact]`,
    `${command} qualify-historical-evidence-parent --request <request.json> [--compact]`,
    `${command} plan-cross-workspace-assets --request <two-workspace-request.json> [--compact]`,
    `${command} recheck-cross-workspace-continuity --request <inspection-and-roots.json> [--compact]`,
    `${command} project-lineage-maintenance --request <request.json> [--compact]`,
    `${command} apply-lineage-maintenance --plan <plan.json> (--workspace-roots <roots.json> | --workspace-id <id> --workspace-root <dir>)`,
    `${command} recover-lineage-maintenance (--workspace-roots <roots.json> | --workspace-id <id> --workspace-root <dir>)`,
    `${command} project-transition-catalog [<workspace-or-material-root> ...] [--output-schema <schema-id>] [--input-schema <schema-id>]`,
    `${command} project-transition-neighborhood [<workspace-or-material-root> ...] --output-schema <schema-id> [--input-schema <schema-id>]`,
    `${command} schemas status <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} schemas sync <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} schemas check <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} handoff <workspace-dir> [--output-dir <dir>] [--carrier-prefix <prefix>]`,
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
    '- Relation-neighborhood projection is read-only and invocation-focused. It projects explicit loaded Parent/Relation/Handoff/dependency/currentness edges and bounded negative evidence, but never chooses a governing continuation, upgrades chronology/filenames/status to authority, or treats missing loaded edges as global absence.',
    '- Lineage namespace and maintenance commands treat representation coverage as explicit input. `complete` is required for mutation-ready lineage maintenance; bounded/partial/unknown inputs remain scope-limited observations and cannot establish Workspace-wide Normalize/rebase recommendations.',
    '- Git commit provenance reads only the exact staged Git index for added/modified/renamed trace bytes and HEAD for deleted trace bytes; it never reads working-tree content to derive provenance and performs no Git mutation.',
    '- Local lineage-maintenance apply acquires cooperative Workspace locks and writes durable recovery journals before destructive path changes. A crashed transaction must be recovered explicitly; recovery rolls back uncommitted work, finalizes durably committed work, and fails closed rather than overwriting unexpected concurrent bytes.',
    '- Remote reads/writes remain explicit host concerns. Tooling operation safety does not create or revoke semantic Task/Handoff authority.',
    '',
    'Use `<common-command> --help` for focused common-path usage. Use `operations` deliberately for the advanced/internal operation catalog.'
  ].join('\n');
}

function commonCommandHelp(command, surfaceCommand) {
  if (surfaceCommand === 'plan-cross-workspace-closed-graph') return [
    'Tiinex Core — cross-Workspace qualified closed semantic Parent subtree',
    `${command} plan-cross-workspace-closed-graph --request <two-root-request.json>`,
    `${command} apply-cross-workspace-closed-graph --plan <saved-ready-plan.json>`,
    `${command} recover-cross-workspace-closed-graph --request <journal-and-both-roots.json>`,
    'Only Self+Leaves / Same / Keep Parent for a Parentless root plus exact descendant artifacts/assets with all internal Parent links, verified original integrity and zero outside readers.',
    'Every descendant Parent integrity is updated transitively, all moved links rebound and all artifact self digests re-sealed. Any outside Parent or unresolvable reader BLOCKS.',
    'Two-root durable journal with inode-owned crash rollback; other scopes, Git fallback, third Workspaces and dynamic references still BLOCK.',
    ''
  ];
  if (surfaceCommand === 'plan-cross-workspace-assets') return [
    'Tiinex Core — bounded two-Workspace artifact and opaque asset bundle',
    `${command} plan-cross-workspace-assets --request <two-workspace-request.json>`,
    `${command} apply-cross-workspace-assets --plan <plan.json>`,
    `${command} recover-cross-workspace-assets --request <transaction-and-both-roots.json>`,
    'ONE Parentless artifact + 1–16 exact-dimension assets; Same + Keep Parent only. Explicit two-root inspection and zero incoming readers required.',
    'Real mixed binary/C14n plan, durable mirrored journal, hardlink-exclusive destinations, inode-owned recovery. Parent chains and dynamic/cross-Workspace readers still BLOCK.',
    ''
  ];
  if (surfaceCommand === 'plan-cross-workspace-standalone') return [
    'Tiinex Core — bounded executable Cross-Workspace transfer',
    `${command} plan-cross-workspace-standalone --request <two-workspace-request.json>`,
    `${command} apply-cross-workspace-standalone --plan <saved-plan.json>`,
    `${command} recover-cross-workspace-standalone --request <transaction-and-two-roots.json>`,
    'This experimental executable subset is ONLY Alone + Same + Keep Parent for one verified, parentless, descendantless, reference-free artifact.',
    'Two physically distinct Workspaces and supported local reference inventories required; incoming links, assets, children and Git-dependent Parent block.',
    'Both Workspaces receive durable journals and cooperative locks; unexpected bytes fail closed. No remote mutation or blanket cross-Workspace safety claim.',
    ''
  ];
  if (surfaceCommand === 'qualify-historical-evidence-parent') return [
    'Tiinex Core — independently audited historical Evidence-as-Parent qualification',
    `${command} qualify-historical-evidence-parent --request <request.json> --compact`,
    'Requires {records:[{path,markdown}],reference,historicalSchemaSource:{availableTools,hostPlan,hostReceipt}}.',
    'First use inspect-historical-schema-source and fulfill a read-only exact pinned repository-read action; feed its original plan and normalized receipt.',
    'Only accepted exact historical-schema BYTE EQUIVALENCE to the registered compiled contract may qualify the immutable historical Parent without modifying it.',
    'Distinct versions, absent or contradictory provider receipt, failed artifact validation or immutable Git source mismatch BLOCK. Never migrate historical bytes automatically.',
    'If ready, use the qualified returned parentRecord in normal Core continue-from-record draft creation; no remote writes.',
    ''
  ];
  if (surfaceCommand === 'inspect-historical-schema-source') return [
    'Tiinex Core — read-only historical Current Schema verification',
    `${command} inspect-historical-schema-source --request <request.json> --compact`,
    'Input requires one verified artifact markdown with immutable Current Schema, and optional availableTools with GitHub repository-read.',
    'Obtain a concrete host repository-read receipt for that exact commit/path and resubmit hostPlan plus hostReceipt.',
    'Returns byte-equivalent or historical-distinct and exact SHA-256/Git blob identities. Neither outcome silently edits Parent, grants authoring nor authorizes migration.',
    ''
  ];
  if (surfaceCommand === 'inspect-cross-workspace-continuity') return [
    'Tiinex Core — read-only two-Workspace Move/Rebase reference continuity preflight',
    '',
    `${command} inspect-cross-workspace-continuity --request <request.json> [--compact]`,
    `${command} plan-cross-workspace-assets --request <two-workspace-request.json> [--compact]`,
    '',
    'Pass two distinct absolute roots (sourceWorkspace, targetWorkspace), explicit IDs and scoped-move operation including targetWorkspaceId, selectedPath and targetPath.',
    'Inspects exact physical local file digests in BOTH Workspaces, the selected Parent graph, inbound references, outbound Parents and existing target anchor.',
    'Provides a read-only GitHub repository-read recovery route via available connector tools; immutable commit and matching file bytes are still required.',
    'This is deliberately NOT a cross-Workspace Apply; CLI returns exit 2 and executable=false until dual-Workspace mutation and all reference rewrites qualify.',
    'No remote writes or GitHub publication inference.',
    ''
  ];
  if (surfaceCommand === 'inspect-cross-workspace-git-source') return [
    'Tiinex Core — read-only local Git immutable source candidate inspection',
    '',
    `${command} inspect-cross-workspace-git-source --request <request.json> --compact`,
    'Request: {"workspaceRoot":"/absolute/repo-root","commit":"<40-hex>","sourcePath":".topics/path/parent.trace.md"}',
    'Reads local Git object and github.com origin only. Candidate is NOT proof of remote publication.',
    'If .git or object is unavailable, recover using qualify-cross-workspace-publication plus a read-only GitHub connector or another repository reader.',
    'No branch movement, git fetch, push, checkout or remote write is performed.',
    ''
  ];
  if (surfaceCommand === 'qualify-cross-workspace-publication') return [
    'Tiinex Core — read-only exact Cross-Workspace Git publication qualification',
    '',
    `${command} qualify-cross-workspace-publication --request <request.json> --compact`,
    'Request includes two distinct Workspace IDs, repository owner/name, full 40-hex commit, exact .topics/*.trace.md source path and self-verified markdown bytes.',
    'Optional availableTools advertises GitHub fetch_file or repository-read connectors. Core returns a host repository-read action with exact arguments; the LLM/host may fulfill it through a read-only connector.',
    'Feed hostPlan + matching hostReceipt with pinned repository/commit/path and exact content back into the same request; only an accepted read receipt + matching SHA yields a qualified immutable permalink.',
    'If shell/Git is unavailable, discover GitHub or alternative repository-read connectors; local Git objects, mutable branches, arbitrary URLs and raw search snippets are NOT evidence of published source bytes.',
    'This is a READ-ONLY evidence qualification. It cannot itself relocate assets, grant cross-Workspace Apply authority, or perform remote writes.',
    ''
  ];
  if (surfaceCommand === 'inspect-scoped-move-workspace') return [
    'Tiinex Core — host-independent Workspace reference closure and Move/Rebase',
    '',
    `${command} inspect-scoped-move-workspace --request <request.json> --compact`,
    `${command} apply-lineage-maintenance --plan <saved-plan.json> --workspace-id <id> --workspace-root <absolute-workspace-root>`,
    '',
    'Request: {"workspaceRoot":"/absolute/workspace","workspaceId":"name","operation":{"kind":"scoped-move","workspaceId":"name","selectedPath":".topics/...trace.md","scope":"alone-with-assets","placement":"same","parentPolicy":"keep","targetDirectory":".topics/destination"}}',
    'Inspects every supported local UTF-8 text file, qualifies original artifact integrity, assembles binary+artifact plan, and blocks unrewritable incoming references.',
    'The plan embeds a full local file-snapshot fingerprint, rechecked before and during Apply. Keep request and plan files OUTSIDE the inspected Workspace.',
    'Excluded directories: .git, .tiinex, node_modules. Dynamic/remote references and proprietary binary metadata are not certified. Cross-Workspace/Git moves remain blocked.',
    ''
  ];
  if (surfaceCommand === 'project-lineage-maintenance') return [
    'Tiinex Core — manual standalone Move/Rebase projection and Apply',
    '',
    `${command} project-lineage-maintenance --request <self-contained-request.json> [--compact]`,
    `${command} apply-lineage-maintenance --plan <plan.json> --workspace-id <id> --workspace-root <root>`,
    '',
    'Use an explicitly complete Workspace artifact representation for scoped-move. For binary assets supply assetCoverage: complete, referenceCoverage: complete, the full assetPaths inventory and exact assetMaterials with stable source fingerprint and SHA-256.',
    'Scopes: alone, alone-with-assets, self-and-leaves, branch, tree. Qualified Same, Prepend or Append with the appropriate Keep/New Parent policy execute through ONE durable transaction when the graph and exact numeric anchor qualify.',
    'Use inspect-scoped-move-workspace for Core-owned local reference inspection and a drift-checked receipt; non-Tiinex incoming references and all cross-Workspace/Git movement still block.',
    'Review the projected plan and store it OUTSIDE the target Workspace before Apply. Existing sources and targets are reverified; collided/stale plans block and recover-lineage-maintenance handles interrupted transactions.',
    ''
  ];
  if (surfaceCommand === 'inspect-asset-relocation-workspace') return [
    'Tiinex Core — inspect and plan a local referenced binary asset relocation',
    '',
    `${command} agent-role-sync --workspace <workspace-root> --role <qualified-role.trace.md> --mode plan|check|apply [--approved --expected-after-sha256 <sha256>]`,
    `${command} inspect-asset-relocation-workspace --request <request.json> [--compact]`,
    '',
    'Request JSON:',
    '{',
    '  "workspaceRoot": "/absolute/workspace/path",',
    '  "workspaceId": "native",',
    '  "assetPaths": [".topics/assets/capture.png"],',
    '  "targetDirectory": ".topics/work/evidence",',
    '  "lineageDimension": "001-2"',
    '}',
    '',
    'Returns an exact read-only executable plan if local supported-text references, source bytes and target namespace qualify.',
    'Save the returned JSON OUTSIDE the scanned Workspace, review the exact changes, then apply with:',
    `${command} apply-lineage-maintenance --plan <result.json> --workspace-id <id> --workspace-root <absolute-workspace-root>`,
    'Recover a suspended local transaction with recover-lineage-maintenance; never use an old plan after source/namespace drift.',
    'The request/plan files should not be stored in the inspected Workspace: JSON mentioning the source may itself be flagged as a reference.',
    'Supported: local Markdown inline-link destinations, self-sealed Tiinex artifacts and opaque binary asset files.',
    'Unsupported: ambiguous/unparsed links, arbitrary script/HTML references, text-source files with outgoing links, cross-Workspace references, source symlinks and unknown proprietary file formats.',
    'This is a local Node adapter over Core-owned planning/apply/recovery; filename coordinates never imply semantic Parent authority.',
    ''
  ];
  if (surfaceCommand === 'read-content') return [
    'Tiinex portable tooling — exact selected source read',
    `${command} read-content --source <catalog-source-id> --path <catalog-source-path>`,
    'Read an exact source document shown by catalog. SHA and bytes are verified against the selected bootstrap manifest before projection; no remote fetching or schema/lineage acceptance is implied.',
    'Missing sources and paths remain blocked. Do not infer unselected documentation or work/Role authority.',
    ''
  ];
  if (surfaceCommand === 'review-deliverable') return [
    'Tiinex portable tooling — read-only local deliverable continuity check',
    `${command} review-deliverable --artifact <new-output-file> --workspace <local-scratch-dir> [--carrier <produced-carrier.zip>]`,
    'Run when a reusable file has been created and verified, before claiming a durable next-session continuation. Checks exact artifact bytes and whether they are in the supplied Workspace; detects only unqualified trace candidates. Does not establish source sufficiency, authored Topic qualification or carrier coverage. For trivial, read-only or deliberately noncontinuing work, make an explicit grounded decision rather than creating filler documentation.',
    'Advisory and on-demand only: not a ChatGPT Web output hook and will do nothing unless called.',
    ''
  ];
  if (surfaceCommand === 'init-workspace') return [
    'Tiinex portable tooling — initialize a local Workspace',
    `${command} init-workspace <new-workspace-dir> --workspace-id <id> --title <title> --authors <authors>`,
    'In a user-selected Tiinex working environment, normally initialize a local isolated disposable session scratch Workspace soon after ready route-less orientation if local writes are permitted. It need not await a formal user Project or first iterative task; it is LLM working memory, not a project assignment. No separate project-enrollment request is needed for disposable assistant working files. This creates a qualified Workspace descriptor only, not a Project, Role, Handoff, durable save, or external authority. On a later user turn introducing a bounded reusable direction, constraint, result or meaningful revision, make an explicit document-or-defer decision before finishing the reply: if qualified, run `author --preflight` and `author` for a truthful provisional note; otherwise defer without a placeholder and reconsider on a meaningful change. Follow with qualified `author --preflight` and `author` when meaningful working material exists; do not invent a placeholder Topic. Manufacture and deliver a verified pointerless carrier early after real qualified progress, and continue carrier lineage at meaningful checkpoints. Respect read-only/no-write instructions and owner boundaries; manufacture and verify an explicit carrier before claiming cross-session recovery.',
    ''
  ];
  if (surfaceCommand === 'catalog') return [
    'Tiinex portable tooling — reusable content catalog',
    '',
    `${command} catalog`,
    `${command} catalog --json`,
    '',
    'Reads only exact manifest-declared content bundled with the active bootstrap and projects available reusable Entries, Processes, Scaffolds, and maintained Documentation. Registered discovery-surface membership is availability only; it does not establish applicability, occurrence, work/Role authority, target binding, acceptance, or mutation authority.',
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
    'Discovers bundled Core-native and explicitly supplied external tiinex.transition.definition.v1 artifacts regardless of their workspace-local directory, read-qualifies them against the bundled canonical Transition Definition contract, and prefers exact, fully matched Workspace package material over embedded Native aliases.',
    'Use --no-native to inspect only explicitly supplied external material. Independent packages with distinct bytes or qualified bindings stay separate; a verified byte-identical package alias is represented once, with Workspace priority.',
    'Discovery and target-schema filtering do not imply Semantic Package/Schema Transition Companion attachment, applicability, recommendation, execution, or generation authority.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'schemas') return [
    'Tiinex portable tooling — native schema source lifecycle',
    '',
    `${command} schemas status <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} schemas sync <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} schemas check <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
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
    `${command} qualify-return <continued-workspace-dir> --result <workspace-relative-result> [--expected <workspace-relative-expected-file>]`,
    '',
    'Reads qualified runtime continuation state and the exact selected Handoff return protocol. It pins the exact local result SHA-256/size in runtime-only `.tiinex/return-transition.json`. If --expected is supplied, it also requires byte equality to that local file; this never proves that the expected file is independent or semantically correct. Do not manufacture a duplicate expected file merely to qualify a return. It does not establish Task completion, Task closure, acceptance, or remote-write authority.',
    'After it reports `qualified`, run `prepare-return <continued-workspace-dir>`. Prepare-return rechecks the transition receipt and the result bytes, and also the expected bytes if supplied, and fails closed on change.',
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
    `${command} author <workspace-dir> --schema <schema-id> (--path <workspace-relative-artifact> | --directory <workspace-relative-directory>) --body <body.md> [--parent <workspace-relative-or-qualified-parent>] [--parent-source <local-parent-file>] [--parent-reference <commit-pinned-browse+git-permalink>] [--historical-parent-proof <accepted-repository-read.json>] [--title <title>] [--summary <summary>] [--why <why>] [--authors <author>] [--preflight]`,
    `${command} schemas status <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} schemas sync <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    `${command} schemas check <content-workspace-dir> --docs <docs-workspace-dir> [--docs-commit <immutable-sha> --published] [--require-published]`,
    '',
    'Uses qualified continuation state to infer the ordinary Parent when `--parent` is omitted. Tiinex first-party tooling and LLMs should normally use `--directory` for ordinary Parent continuations so Tooling allocates the conventional child filename from the semantic Parent lineage. `--path` is an intentional exact-path override and remains valid for humans/integrations that deliberately want a custom local coordinate; filename shape never replaces semantic Parent authority. For a Workspace-qualified Parent such as `business::.topics/...`, also supply `--parent-source` for the exact Parent bytes and `--parent-reference` with the commit-pinned browse+git permalink. For an older immutable Parent Current Schema locator that differs from the current registered locator, `--historical-parent-proof` accepts the existing `inspect-historical-schema-source` HostAction plan plus a verified, exact repository-read receipt. It permits only byte-equivalent historical schemas under independent source identity and self-integrity checks; missing receipts, mismatched bytes and genuinely distinct historical schema versions remain blocked. No historical schema rewriting or migration is implied. The `workspace::path` value remains an internal selector only and is never serialized as durable cross-Workspace recovery authority. Authoring seals c14n-v2 self-integrity, audits, stages, and updates continuation state only after qualification. `--preflight` uses that exact qualification path but removes the candidate and leaves continuation state unchanged; use it before the durable author step when validating a filled runtime scaffold. Invalid output is not retained.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'handoff') return [
    'Tiinex portable tooling — handoff',
    '',
    `${command} handoff <workspace-dir> [--output-dir <dir>] [--carrier-prefix <prefix>]`,
    `${command} handoff <workspace-dir> --carrier-mode workspace (--package-parent <intended-predecessor-carrier.zip> | --new-root) [--output-dir <dir>]`,
    '',
    'For pointerless Workspace-carrier manufacture, `--package-parent` means the intended predecessor carrier, not the source package/material origin. Source material may be composed from other qualified packages or local Workspace roots. Omitting `--package-parent` does not silently mean new root; `--new-root` is required for an intentional independent root.',
    'For the first locally authored formal Handoff without a qualified received package parent, give --carrier-prefix <prefix> when writing the new root package to --output-dir <dir>; common-path authoring does not guess a carrier namespace.',
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
