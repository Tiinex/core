# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-03 21:16:05
  - Trace: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Origin:
    - [relative](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-03 21:17:23
  - Authors: Anchor; Sigma
  - Why: Give the next Anchor one bounded first implementation step and prevent host/filesystem mutation from outrunning semantic qualification.
  - Summary: Define and test the read-only Move/Prepend lineage-maintenance plan contract before any general apply capability.
  - Status: ready/local

---

# Qualify Lineage Maintenance Projection Contract

## Objective

Design and qualify the read-only Core projection contract for deterministic lineage Move and Prepend before any general path-mutation apply capability is implemented.

## Done Criteria

- Define the exact request/plan schema for operation kind, selected artifacts, source/target directory, insertion target/edge where relevant, explicit ordering for multi-artifact prepend, and expected input material fingerprint.
- Define selection qualification for whole lineage/subtree, connected semantic segment, and explicit bounded artifact sets without granting authority to filename-prefix heuristics.
- Define deterministic directory-local re-dimension projection for both source survivors and target material, including the observed middle-segment case where a compacted source filename remains semantically parented to an artifact that moved away.
- Define Prepend/Insert Ancestor projection for one and multiple artifacts at a semantic root and on an existing Parent edge, including exact Parent-edge delta and affected local filename-depth changes.
- Project every affected path as before → after together with preserved/changed Parent edges, current-reference rewrites, integrity cascade candidates, collisions, ambiguous mappings, and explicit non-artifact carriage requirements.
- Bind the plan to exact current input bytes/paths so a future apply capability can fail closed on drift rather than recomputing silently.
- Add focused Core tests for the user-observed examples and for blocked ambiguous/collision cases. Tests prove read-only projection only; no filesystem/source mutation capability is added in this child Task.
- Confirm arbitrary sibling/major reorder remains outside the contract and cannot be requested accidentally through Move or Prepend.
- Produce qualified Evidence suitable for acceptance review before spawning the local apply implementation Task.

## Scope

- Core only; host-neutral semantic/projectable behavior.
- Reuse declared-parent lineage resolution, directory-local path allocation semantics, segment selection, integrity cascade analysis, and generic reference-rewrite behavior where appropriate.
- Do not repair the current Business process-directory filename debt in this Task; preserve it as later dogfood input.
- Do not add VS Code commands, CLI mutation commands, remote writes, automatic Reduction, arbitrary Reparent, or sibling/major reorder.

## Dependencies

- Parent Task: Deterministic Lineage Maintenance Projection And Apply.
- Discovery/contract Evidence: Lineage Maintenance Capability Discovery And Operation Contract Evidence.
- Tiinex Work Lifecycle governs spawning/disposition; Development And Acceptance governs implementation verification and acceptance-return semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Value: G--qz_7mSRK2W3zhf4JetwiGUlEnWnhkgLbSdl8nzCU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: iluVnLsuDkj6FYhhovc7CO4yfltvTUglLDyg6g_14YM