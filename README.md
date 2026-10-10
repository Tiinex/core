# @tiinex/core

`@tiinex/core` is the shared host-neutral implementation core behind Tiinex consumers.
It implements portable artifact interpretation, schema/runtime contracts, validation,
lineage, continuity, grounding, Handoff/package mechanics, deterministic projections,
and companion-resource resolution without assigning canonical semantic authority to a
UI host or repository location.

Canonical schema meaning remains in Tiinex Docs. Core implements those contracts.
Business retains organizational prioritization and human gates. Site, VS Code, Chrome,
CLI and other consumers are hosts rather than independent semantic engines.

## Public boundaries

- `@tiinex/core` / `@tiinex/core/browser` — browser-safe data projection and companion-resource contracts.
- `@tiinex/core/node` — the browser-safe surface plus portable Tooling for Node hosts.

The browser entrypoint does not import Node built-ins. Package consumers must not import
undocumented internal paths.

## Companion resources

Companion lookup is provider-oriented. Artifact-local Workspace material, deployment
overrides, Verse package defaults and lower-level defaults can participate without
making physical repository placement semantic authority. Specificity is resolved before
provider precedence; unresolved same-level single-value conflicts fail closed.

## Layout

Source paths intentionally follow the same `src/...` conventions used by other Tiinex
repositories where the concepts match. npm distribution preserves this source layout
rather than inventing a second directory vocabulary.

## Current implementation frontier

`@tiinex/core` is a published package boundary; package publication does not by itself establish browser/product acceptance or semantic authority. App/Site/Verse integration remains separately qualified by those consumers.

The explicit package export map exposes the shared module paths used by App. These preserve the mirrored layout, not a second implementation. `tools/tiinex-portable.mjs` remains a transitional compatibility entrypoint while dedicated CLI/Interop hosts are stabilized. See [`docs/ARCHITECTURE-BOUNDARIES.md`](docs/ARCHITECTURE-BOUNDARIES.md) for the carrier-bootstrap, schema-material and external-Interop split.

Application data is a declared-data projection: parsing and exact reference resolution are not schema validation, integrity verification or authority qualification. Missing Parent evidence remains unresolved. Companion byte access belongs to registered host readers, not automatic filesystem or network permissions.


## npm release frontier

Master-only automatic versioning/publication is implemented through the Core Node release helper. See `docs/NPM-PUBLISH.md`. OIDC/Trusted Publisher configuration is an external repository/package setting and remains separate from source qualification.

## Host-independent Move/Rebase tooling (source milestone)

The installed `@tiinex/core` tarball exposes **manual CLI projection and Apply** independently of VS Code:

```sh
node node_modules/@tiinex/core/tools/tiinex-portable.mjs project-lineage-maintenance --request ./request.json > ./projection.json
# Inspect the exact `plan` object, then save it separately as plan.json:
node node_modules/@tiinex/core/tools/tiinex-portable.mjs apply-lineage-maintenance --plan ./plan.json --workspace-id my-workspace --workspace-root /absolute/target/workspace
```

The self-contained request needs qualified artifact `materials`, `representationCoverage: "complete"` and an explicit scoped `operation`. To move same-dimension binary companions in one journal use `assetPaths` (complete source-directory inventory), `assetCoverage: "complete"`, `referenceCoverage: "complete"` and `assetMaterials` (strong SHA-256 + fingerprint for every selected asset). The caller is responsible for genuinely complete reference inventory; the tool must never interpret an incomplete reference set as absence. The executable mixed operation now includes **Same + Keep Parent**, qualified same-directory **Prepend/Append + New Parent**, and separate **Prepend/Append + Keep Parent** numeric positioning. Keep Parent preserves the original semantic Parent identity and self digest: Core rebases relative locators and cascades Parent integrity without fabricating new Parent edges. Prepend is restricted to a straight selected chain; it repositions target and target children numerically after the selected last leaf. Append chooses a free numeric child coordinate without renumbering existing siblings. Selected binary assets participate in the same durable transaction only with a complete artifact, asset and reference inventory, strong SHA-256 and a verified fingerprint. Manual independent `project-lineage-maintenance` and `apply-lineage-maintenance` CLI calls test plan/apply/replay/rollback outside VS Code. **Cross-Workspace/Git fallback, incomplete reference-closure proof, or overlapping Parent branches still fail closed**; this is not a complete Move/Rebase UX release.

Core integration tests exercise executable CLI Plan→Apply, exact binary bytes, Parent self integrity and blocked replay; the same CLI was additionally verified from an offline-packed/installed `.tgz` without VS Code.

### Core-owned local reference closure (manual + VS Code)

A safer standalone entrypoint builds the complete *supported local* representation itself rather than trusting an operator-supplied `referenceCoverage: "complete"` assertion:

```sh
node node_modules/@tiinex/core/tools/tiinex-portable.mjs inspect-scoped-move-workspace --request ./request.json > ./inspection.json
# Extract inspection.plan to a JSON file outside the inspected Workspace.
node node_modules/@tiinex/core/tools/tiinex-portable.mjs apply-lineage-maintenance --plan ./plan.json --workspace-id my-workspace --workspace-root /absolute/workspace
```

It inventories files, verifies Tiinex self-integrity, tests real incoming supported Markdown/JS/HTML/CSS/text references, blocks unrewritable edges, fingerprints the whole supported-local Workspace snapshot, and rechecks it before/under transaction locks. Newly written or edited files after preview block Apply instead of silently escaping reference closure. `.git`, `.tiinex`, `node_modules`, runtime-generated references, remote Workspaces and opaque binary metadata remain explicit **out-of-scope** surfaces. Do not label this global or cross-Workspace closure.

### Cross-Workspace Git continuity: qualified evidence before mutation

A sandboxed LLM may not see the source Git history locally but can still have **read-only GitHub connector tools**. Core therefore offers two standalone read-only paths instead of pretending missing local Git means missing history:

```sh
node node_modules/@tiinex/core/tools/tiinex-portable.mjs inspect-cross-workspace-git-source --request ./local-git-request.json
node node_modules/@tiinex/core/tools/tiinex-portable.mjs qualify-cross-workspace-publication --request ./publication-request.json
```

`inspect-cross-workspace-git-source` requires an absolute Git repository Workspace root, full 40-hex commit, and exact `.trace.md` repository-relative path. It reads the exact Git object, verifies UTF-8/Tiinex self digest and checks the `github.com` origin without making any Git mutation. Its result is **candidate**, not published provenance; a Git remote string never proves that the commit was pushed.

`qualify-cross-workspace-publication` takes source/target Workspace IDs, repository, full commit, source path, self-verified Markdown and optional available host tool descriptions. It returns a `repository-read` host-action plan when a read-only connector (GitHub `fetch_file`, `fetch`, or another repository reader) is available. A host/LLM can fulfill the plan and supply the original plan plus an exact normalized host receipt. Core checks action ID, repository, commit, path and SHA-256 of the bytes against the source artifact before emitting an immutable `https://github.com/<owner>/<repo>/blob/<commit>/<path>` locator. If a tool is missing, the response gives alternate read routes rather than guessing. Search snippets, mutable branch URLs, local-only Git objects and unverified provider responses cannot qualify a published permalink.

**Boundary:** This is a *publication-evidence qualification*, not executable cross-Workspace Move/Rebase. Moving across Workspaces still requires joint reference closure, verified destination and an atomic two-Workspace journal. `inspect-scoped-move-workspace` currently returns a blocked cross-Workspace plan with an optional publication-recovery recipe; it does not move files on the strength of a permalink alone. No remote network access or remote mutation is performed by these commands.

### Two-Workspace reference and Git continuity preflight

`node node_modules/@tiinex/core/tools/tiinex-portable.mjs inspect-cross-workspace-continuity --request ./cross-workspace-request.json --compact` scans **two physically present local Workspaces**, compares exact file snapshots, identifies selected descendants/assets, detects inbound references and Parents that must remain accessible, and surfaces a read-only GitHub connector recovery action when an immutable published source can be requested. It **never** returns an Apply-ready Cross-Workspace plan; source/destination identity changes and two-root rollback are not yet qualified. A read-only Git receipt is not publication by itself. Unknown runtime/binary reference schemes and excluded directories remain explicit blockers.

For a previous read-only cross-Workspace inspection, the separately exposed `recheck-cross-workspace-continuity --request ./recheck.json` operation re-fingerprints both physical local roots. Its request is `{ "inspection": <exact previous inspector result>, "sourceWorkspace": {"workspaceId":"...", "workspaceRoot":"/..."}, "targetWorkspace": {"workspaceId":"...", "workspaceRoot":"/..."} }`. A passing snapshot recheck **does not** authorize Apply. Connector repository reads require an accepted exact commit/path/blob receipt, including for each left-behind historical Parent.

### First executable Cross-Workspace two-root transfer (bounded)

The independent Core CLI now exposes a **deliberately narrow** two-root Move/Rebase slice:

```sh
node node_modules/@tiinex/core/tools/tiinex-portable.mjs plan-cross-workspace-standalone --request ./two-roots.json --compact > ./plan-response.json
# Review the ready plan and save its JSON body as plan.json OUTSIDE both roots.
node node_modules/@tiinex/core/tools/tiinex-portable.mjs apply-cross-workspace-standalone --plan ./plan.json --compact
# If a process was interrupted: supply transactionId and both exact Workspace roots.
node node_modules/@tiinex/core/tools/tiinex-portable.mjs recover-cross-workspace-standalone --request ./recovery.json --compact
```

**Only `Alone + Same + Keep Parent`** for one qualified **parentless, reference-free, descendantless `.trace.md`**, without selected assets, is executable. Both physical Workspace reference inventories must qualify; supported incoming links, local source links, non-Tiinex dynamic source formats, and any retained Parent/child/binary selection **block before mutation**. The target artifact is an anchor for choosing a free numeric *sibling* coordinate; it does **not** become a semantic Parent. This is not the full five-scope Move/Rebase operation.

Core re-inspects sources and targets before and after obtaining cooperative locks, checks both Workspace snapshots, writes durable journals to BOTH roots, stages bytes locally, moves the source into its own journaled backup, and promotes the target via a non-overwriting filesystem hardlink. Postconditions verify SHA-256/C14n-v2 and absence of the old source. If interrupted, recovery verifies exact journal identities, lock ownership and original/output bytes before rolling back; unexpected bytes are not overwritten. Because two independent filesystems cannot provide one global filesystem rename, this is a **journaled compensating transaction**, not a claim of instantaneous visibility across Workspaces.

A sandboxed LLM can still pursue the existing read-only GitHub connector publication path for Parents or links excluded from this first executable subset. A connector search/result does not itself authorize Apply; it must deliver qualified commit/path/bytes receipts to the relevant Core verifier. Source/target roots with other dynamic formats, selected PNGs, children, Parent dependencies or incoming links remain **read-only Preview/BLOCK** until general two-root reference rewriting is implemented. No Git remote write occurs.

### Bounded two-Workspace artifact + asset transaction (manual CLI)

`plan-cross-workspace-assets --request <two-workspace-request.json>` produces a read-only plan for **exactly one parentless, reference-free artifact plus 1–16 same-directory, same-dimension assets**. Only `Alone + Assets`, `Same` and `Keep Parent` qualify. It refuses outside readers, other local links, unsupported executable source formats, child artifacts or external Parent dependencies.

`apply-cross-workspace-assets --plan <plan.json>` reconstructs Core's plan independently, locks both Workspaces, binds exact source and transformed SHA-256, stages all artifacts/assets under mirrored journals, then promotes files exclusively (hardlink, no overwrite). `recover-cross-workspace-assets --request <recovery.json>` restores an interrupted uncommitted operation only when each target still matches the exact staging inode. No Git remote write, no invented permalink. Future Parent/children moves require a broader graph transaction.

### Historical Evidence-as-Parent with verified exact schema equivalence

`inspect-historical-schema-source --request <json>` returns a *read-only* GitHub repository-read host action for the **exact immutable** `Current Schema` commit/path declared in the historical parent. A sandboxed LLM can seek a compatible GitHub connector or another accepted repository reader when local `.git` material is absent. A copied URL or synthetic, unauthenticated snippet is not publication proof.

`qualify-historical-evidence-parent --request <json>` then accepts `{ "records": [{ "path": ".topics/...trace.md", "markdown": "..." }], "reference": ".topics/...trace.md", "historicalSchemaSource": { "availableTools": [...], "hostPlan": {...}, "hostReceipt": {...} } }`. The Core owner **revalidates** the original host action/receipt, the pinned commit/path, Git blob SHA and SHA-256 bytes, existing artifact self integrity, local compiled validation material and schema-coherent exact reference authority. If the historic schema bytes equal the trusted registered material **exactly**, it can qualify the historical Parent without rewriting it; the returned `parentRecord` is usable with the existing Core `continue-from-record` authoring path. For an actual different historical schema it remains **BLOCK** pending full exact historical validation or explicitly approved descendant-aware migration. No user Workspace or Git remote is mutated by the qualification step.

This byte-equivalent Evidence continuation has a Core test that creates a real child, reopens it, checks C14n-v2, the original Parent's exact schema locator, and parent integrity. An offline-installed Core CLI test also covers the interface. These test receipts include *synthetic* normalized repository-read responses as fixtures and do **not** assert actual public GitHub publication of those fixture commits.

### Cross-Workspace closed semantic graph, standalone Core CLI

For **a fully contained Parentless root and its actual selected descendants** (and their dimension-owned assets), use:

```sh
node node_modules/@tiinex/core/tools/tiinex-portable.mjs plan-cross-workspace-closed-graph --request ./request.json --compact > ./plan.json
node node_modules/@tiinex/core/tools/tiinex-portable.mjs apply-cross-workspace-closed-graph --plan ./plan.json --compact
# After a proven crash, with the transactionId and both physical roots:
node node_modules/@tiinex/core/tools/tiinex-portable.mjs recover-cross-workspace-closed-graph --request ./recovery.json --compact
```

Only `Self + Leaves → Same → Keep Parent` is currently executable, with 2–24 original-schema-qualified artifacts, at most 64 owned opaque assets, one source directory and two inspected physical local Workspace roots. Each descendant's original Parent reference, Origin, creation identity and declared Parent integrity must agree with the actual original Parent; all moved local links and Parent integrity are rebound and each artifact C14n-v2 is re-sealed topologically. Preview is blocked for outside Parents, incoming readers, invalid dynamic reference sources, missing schema authority, unsound origin/byte-digests or target collisions. Apply uses the same mirrored two-root durable Core bundle journal, verifies exact bytes and refuses overwriting existing targets. A **real process crash** after file promotion can be recovered by the direct CLI using exact transaction journals, not by guessing which files to delete. This does **not** prove reader closure in unknown third Workspaces, automatic Git permalink migration, general Branch/Tree, Prepend/Append or an instantaneous cross-filesystem atomic rename.

### Evidence historical Current Schema

`inspect-historical-schema-source` and `qualify-historical-evidence-parent` offer read-only exact pinned GitHub provider-read recovery. Only a host-accepted commit/path/material receipt which proves historical schema bytes **identical** to the qualified registered local schema can let an unchanged historical Evidence artifact become a native Parent. A genuinely different historical version remains **BLOCKED** until qualified historical validation or explicitly reviewed descendant-aware migration. Do not rewrite a pinned Current Schema merely to placate the latest auditor. These read-only actions are independent of VS Code and usable with connected read-only GitHub tools.

### Cross-Workspace reference-closure input formats

Before an executable two-root Move/Rebase plan can be produced, Core's **shared**
`inspectPortableCrossWorkspaceContinuity` scan searches incoming references to
selected `.trace.md` artifacts **and ordinary binary assets** in both physically
supplied Workspaces. It recognizes regular Markdown links, Markdown reference
*definitions* (`[name]: path`), HTML `src`/`href` (quoted or unquoted), CSS
`url(...)`, explicitly Workspace-qualified paths (including percent encoding),
and conservative resolvable non-Markdown source literals. A reference from any
file outside the selection **blocks** until the owner can actually rebind it.
A non-inline link to moved material inside the selection also **blocks**:
asset and closed-graph writers can currently rewrite inline Markdown links,
not arbitrary reference definitions/HTML/CSS. Neither a source-directory
filename search nor a `referenceCoverage: complete` flag confers authority.

This is deliberately not certification of unseen third Workspaces, dynamic
runtime expressions or ignored/proprietary binary metadata. Such evidence must
be acquired and qualified through read-only host/connector tools before
changing any externally referenced material.
