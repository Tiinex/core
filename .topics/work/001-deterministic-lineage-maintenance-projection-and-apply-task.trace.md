# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.project.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/project/tiinex.project.v1.schema.md)
  - Created At: 2026-10-03 21:16:05
  - Trace: [004-deterministic-lineage-maintenance-project.trace.md](https://github.com/Tiinex/business/blob/ae82dfd895c4ef59f821f95b0ddd823298af4f7e/.topics/initiatives/004-deterministic-lineage-maintenance-project.trace.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/business/blob/ae82dfd895c4ef59f821f95b0ddd823298af4f7e/.topics/initiatives/004-deterministic-lineage-maintenance-project.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-03 21:16:05
  - Authors: Anchor
  - Why: Replace improvised filesystem lineage maintenance with one deterministic Core contract shared by LLM, CLI, and IDE hosts.
  - Summary: Implement Core-owned Move and Prepend lineage maintenance with directory-local re-dimensioning and explicit Parent semantics.
  - Status: ready/local

---

# Deterministic Lineage Maintenance Projection And Apply

## Objective

Implement one Core-owned lineage-maintenance capability that separates directory-local filename coordinates from semantic Parent ancestry and can safely project/apply the maintenance operations Tiinex now needs: Move with Parent preservation and Prepend/Insert Ancestor with explicit Parent mutation.

## Done Criteria

- Core exposes one host-neutral read-only maintenance projection with exact selected artifacts, source/target coordinates, before/after filename dimensions, semantic Parent-edge delta, reference rewrites, integrity cascade, collision/blocker findings, and an immutable input fingerprint suitable for apply qualification.
- `Move` accepts an exactly qualified artifact selection rather than inferring authority from a filename prefix. It supports at least whole lineage/subtree, a connected semantic segment, and an explicit bounded artifact set when Core can deterministically qualify the resulting coordinate mapping.
- `Move` preserves semantic Parent edges for selected and unselected artifacts unless the operator explicitly chose a graph-changing operation. Moving a middle segment may therefore leave a source artifact whose compacted filename looks locally adjacent to another artifact while its declared Parent remains in the target directory.
- Source and target directories receive deterministic directory-local re-dimensioning. Selection-internal relative ordering/shape is preserved where representable; survivors are compacted only inside the explicitly affected local namespace. Reduction/deletion by itself never triggers automatic renumbering.
- `Prepend` / `Insert Ancestor` accepts one or more ordered artifacts and intentionally rewires exactly the selected Parent edge/root boundary: the first inserted artifact receives the prior Parent (or becomes the semantic root), each following inserted artifact continues the prior inserted artifact, and the previous target artifact becomes child of the last inserted artifact.
- Prepending before a local `001` may project the inserted artifact to local `001` and shift the existing affected lineage deeper (`001` → `001-1`, descendants accordingly) without renumbering unrelated major/sibling roots.
- Arbitrary sibling/major reorder remains out of scope for the first capability; it must not be smuggled into Move or Prepend because its wider cascade and operator intent are materially different.
- Relative/current artifact references, Workspace-qualified current selectors where allowed, Parent recovery paths, c14n-v2 Parent integrity, and self integrity are deterministically rebased/resealed from the qualified graph. Immutable historical Git/recovery references and historical prose are preserved.
- Non-artifact files/assets are never swept in by numeric-prefix heuristics. Any carriage is explicit and byte-qualified or delegated to a separately qualified attachment/bundle rule.
- Apply is local-only, staged/atomic from an exact plan, collision-safe, fail-closed on changed inputs, and emits a verification receipt covering moved paths, preserved/changed Parent edges, reference/integrity updates, unexpected byte changes/removals, and post-apply audit. No remote mutation is performed.
- Core gains a general directory-local filename namespace qualification surface capable of detecting the class of process relocation debt that current `inspect` misses, without falsely treating filename ancestry as semantic Parent ancestry.
- Regression fixtures cover: whole-lineage Move, middle-segment Move leaving a descendant behind, Move to non-empty target namespace, one- and multi-artifact Prepend at a semantic root and on an existing Parent edge, collision/input-drift failure, cross-directory Parent preservation, and no-op/unchanged-history boundaries.
- The current Business process-directory dimension debt is repaired only after the capability qualifies, and that repair is used as dogfood Evidence rather than hand-renamed before tooling exists.

## Scope

- Owner: Core for graph/path semantics, projection, qualification, local apply contract, and receipts.
- Applicable Process: Tiinex Work Lifecycle externally; Development And Acceptance for implementation/verification and acceptance-return semantics.
- Reuse before invention: directory-local allocation from record transitions; declared-parent lineage resolution; semantic segment selection logic; lineage-integrity cascade/apply mechanics; Scaffold relocation reference rewriting where its behavior is generic enough to extract.
- Preserve the invariant `filename dimension != semantic Parent`. Numeric filename shape is navigation/placement metadata, never lineage authority.
- Do not implement arbitrary major/sibling reorder, generic filesystem refactoring, lifecycle completion inference, automatic Reduction, or VS Code-specific policy inside Core.
- Host UX is a dependent work frontier. VS Code should eventually expose simple Move/Prepend flows and previews backed exclusively by the qualified Core plan/apply capability; do not create that host Task until the Core contract is stable enough to consume.

## Dependencies

- Current directory-local allocation semantics and declared-parent resolver must remain backward compatible.
- Existing c14n-v2 integrity qualification and representation-preserving repair boundaries remain authoritative for integrity changes.
- Existing immutable historical recovery/material-equivalence semantics must continue to prevent needless permalink churn.
- The carried discovery Evidence for this Task defines the observed tooling gaps and operation examples; implementation may refine API shape but must not weaken the semantic invariants without an explicit Decision.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-deterministic-lineage-maintenance-project.trace.md](https://github.com/Tiinex/business/blob/ae82dfd895c4ef59f821f95b0ddd823298af4f7e/.topics/initiatives/004-deterministic-lineage-maintenance-project.trace.md)
  - Value: Zee3uAtN8vc5y-r-7p5puHMG-b9ajbl_4JQQQxd2AUg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PY3SeYcMqPM2_xM_lPUmHAbYB1BS2H6FMv5P0bVyAYI
