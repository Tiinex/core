# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-02 21:27:25
  - Authors: Anchor
  - Why: Make children, leaves, terminal work and unresolved currentness discoverable without lexical status inference.
  - Summary: Compose qualified lineage topology, explicit currentness, and existing lifecycle readiness into one read-only host-neutral projection.
  - Status: ready/local

---

# Lineage Operative State Projection

## Objective

Add one read-only Core projection that composes already-qualified lineage topology, explicit currentness facts, and existing lifecycle-readiness receipts into separate operative-state axes that hosts can consume without inventing completion, supersession, or Reduction semantics.

## Done Criteria

- Core can project root/intermediate/leaf topology and direct children/parents from the loaded qualified lineage graph.
- Currentness remains explicit/fail-closed: current, historical, or superseded states require qualified invocation-provided facts and conflicts remain unresolved.
- Task lifecycle state is consumed from existing `project-lifecycle-readiness` results rather than re-parsed from status text or filenames.
- The projection keeps topology, currentness, and lifecycle as separate axes; it does not infer one synthetic universal state.
- The projection creates no Reduction, destructive eligibility, deletion, Process applicability, or source mutation authority.
- Focused regressions cover current open Task, accepted/closed Task, superseded historical Task, conflicting currentness facts, and non-Task lineage nodes.
- One representative carried lineage is dogfooded to show child/leaf discovery without relying on directory names or lexical `Status`.

## Scope

- Core only for implementation and tests.
- New work resides under `.topics/work/lineage/operative-state/`.
- Reuse existing `resolveLineage`, lineage traversal/search topology, and portable lifecycle readiness semantics.
- Prefer a read-only portable operation usable by CLI, VS Code, LLM and future Runtime consumers.
- Do not add a Docs schema unless implementation reveals a missing semantic contract rather than a projection gap.

## Dependencies

- Existing qualified Parent graph mechanics.
- Existing `project-lifecycle-readiness` fail-closed closure semantics.
- Explicit upstream currentness/supersession facts where those claims are needed.
- Structural Scaffold acceptance is related project context but is not semantic authority for this projection.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3cQAITiZn6bsByyntoTwZY0EHdXRzgPvjNkvS4tY_Sc