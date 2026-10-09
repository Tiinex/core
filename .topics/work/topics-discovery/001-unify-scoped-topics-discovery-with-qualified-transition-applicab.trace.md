# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 11:43:37
  - Authors: Anchor
  - Why: Prevent missed valid Transitions and inappropriate presets from arbitrary paths.
  - Summary: Replace path-dependent Transition candidate discovery with type-qualified .topics traversal while preserving explicit package and applicability rules.
  - Status: ready/local

---

# Unify Scoped Topics Discovery With Qualified Transition Applicability

## Objective

Implement and regression-test Core's portable artifact candidate discovery **only within each selected Workspace `.topics`**, separating path-neutral artifact indexing from qualified Transition applicability and content-source import composition. No VS Code/Viewer-specific Transition parser and no full-repository scan.

## Baseline And Root Causes

- `src/tooling/portable/package/semantic.package.graph.js` currently filters `localTransitionKeys` with `transitionPathIsAutoDiscovered()` requiring a `.transitions` path segment; direct references outside that segment may work, but automatic package-local discovery is narrower than the already-accepted Native decision.
- `src/tooling/portable/adapters/node/contentSource.discovery.js` registers `.entries/.processes/.scaffolds/.schemas/.workspaces` surfaces, enumerates only composable surface roots and skips unknown dot directories in registered-surface discovery; this should not be conflated with general Workspace artifact indexing.
- Current `transition-catalog.test.mjs` already has an explicit outside-`.transitions` case; it is not proof that **automatic package discovery** is path-neutral.

## Done Criteria

- A qualified Transition Definition appears in the applicable package-local discovered candidate registry regardless of directory position under the allowed `.topics` and active package boundary, including `.transitions`, ordinary Process-local directories and safe unregistered dot dirs.
- Candidate discovery does **not** silently traverse escaped symlinks, recurse through hidden editor/VCS caches, promote `.topics/.workspaces` into ordinary authoring presets, or absorb unselected/nested/external Semantic Packages. No file is interpreted merely because a name/path resembles a Transition.
- Import/composition retains declared content source, exact provenance, package boundaries, duplicate/ambiguity findings and stable determinism. Prefer bounded candidate enumeration with metadata/type prefiltering and cached identity; do not load arbitrary binary assets into memory to discover a Transition.
- Distinguish three outputs: discovered qualified candidates, qualified schema-companion attachment, and currently applicable/usable generation defaults. Only Core can authorize defaults/selection; a Process referring to a Transition is context, not an automatic global preset. Preserve explicit attachment dependency when Native requires it.
- Collision and ambiguity resolution use exact source identity. Duplicate equal candidates deduplicate; competing same-name candidates fail closed with an intelligible finding rather than choosing one by path order.
- Regression fixtures cover path permutations, hidden directories, nested package explicit-only, selected/unselected Workspace, symlink escape, duplicate definitions, invalid schema/integrity, legitimate Process references, and large `.topics` performance budget. Measure p50/p95 candidate-index/discovery and form preset latency before and after; never weaken qualification to win speed.
- `schemas-check`, Core full test suite, real Transition neighborhood and at least one generic form projection PASS before host handoff. Real workspace + host integration remains a separate gate.

## Execution Plan

**Effective run 1:** Nail the Native invariant and catalog tests; change the minimum Core source index/filter. Prefer one shared portable material index reused by semantic packages and form discovery rather than two recursive walkers.

**Effective run 2:** Resolve package composition / companion applicability boundaries; add explicit negative tests and Source/Process reference fixtures. Qualify a reusable Evidence authoring Transition only if Native gives true generation defaults and attachment authority; absence is not license to fabricate one.

**Effective run 3:** End-to-end test `schema-guide / inspect-creation-contract / Transition discovery / form / Preview / Create` and cold transport, with perf/allocations and recovery tests. If full dependency-backed Windows extension build remains inaccessible, label it Sigma's first gate, not a local PASS.

## Scope

- Qualified Workspace `.topics` artifact candidate discovery and semantic-package-local Transition index; portable Core contracts and test fixtures. No indexing outside selected content roots or uncontrolled binary reading.

## Risks And Exclusions

- No broad host-owned Transition rules, binary file migration, repository-wide scans, or invisible import of arbitrary unknown dot-folder contents.
- Old registered-surface import may be independently useful; do not delete it simply to satisfy Workspace indexing.
- Preserve the post-2026-10-09 Core corrections for `qualified-local-unpublished` schema authority and checksum/sourceBlob qualification; do not regress Evidence-v1 validation.

## Dependencies

- `native::.topics/decisions/002-recursive-registered-discovery-surface-convention-decision.trace.md`
- New owner Native bounded discovery Task in this package.
- Existing `schema.transition.companion.v1` and `transition.definition.v1`, Semantic Package discovery policies, portable content-source bootstrap, and all 17 carried Workspace definitions.

## Completion Signal

Deterministic Core discovery finds identical qualified Transition candidates at allowed different paths without granting any unqualified Transition preset; full regression and rooted performance results accompany one consolidated pre-Sigma Handoff.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7M0tZMnFNoeGVnlykysrqjU6eVrhr8rjIO-F_INgiLM