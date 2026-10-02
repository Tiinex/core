# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-02 21:27:25
  - Trace: [001-lineage-operative-state-projection-task.trace.md](001-lineage-operative-state-projection-task.trace.md)
  - Origin:
    - [relative](001-lineage-operative-state-projection-task.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-02 21:31:28
  - Authors: Anchor
  - Why: Preserve the exact implementation and dogfood evidence before Reduction work depends on the projection.
  - Summary: Qualify the first read-only Core projection of lineage topology, explicit currentness, and existing lifecycle readiness as separate operative-state axes.
  - Status: ready/local

---

# Lineage Operative State Projection Qualification

## Supported Claim Or Question

- Supported Claim Or Question: Core can expose one host-neutral, read-only operative-state view over loaded lineage material without inventing completion, currentness, supersession, Reduction, or deletion authority.
- Evidence Role: qualifies the first bounded Lineage Operative State projection against the controlling Core Task.
- Target Artifact: [Lineage Operative State Projection](001-lineage-operative-state-projection-task.trace.md)
- Review Context: Core implementation and dogfood qualification before any Reduction automation depends on this view.

## Provenance

- Known Source: Carrier Major 014-1 local Core and Docs Workspace material plus the exact Core source delta and deterministic local test outputs produced from those bytes.
- Preservation Basis: qualified Task, source implementation, focused regression output, Core package dry-run, and direct projection over the qualified Structural Scaffold lineage.
- Provenance Limits: no claim of remote publication, host UI integration, complete Core-suite qualification, or destructive Reduction readiness is made.
- Source Artifact: [Lineage Operative State Projection](001-lineage-operative-state-projection-task.trace.md)

## Evidence Material

- Material: Added `src/tooling/portable/lineage/lineage.operativeState.js`, exposed it through the portable lineage operation catalog as `project-lineage-operative-state`, and exported the module from the Core package surface.
- Material Kind: read-only Core projection and focused regression qualification.
- Description: The projection keeps topology, currentness, and lifecycle as separate axes. Topology is derived only from loaded qualified Parent graph mechanics. Currentness accepts only explicit qualified invocation facts with basis and fails closed on conflicts. Task lifecycle accepts only an existing qualified `project-lifecycle-readiness` receipt. Lexical `Status`, timestamps, filenames, directory placement, or child existence do not establish currentness or closure.
- Direct Regressions: 5/5 passed for child/leaf topology, explicit historical/current axes, explicit supersession preservation, currentness conflict fail-closed behavior, lexical lifecycle non-authority, and portable-operation exposure.
- Impact Batch: 26/26 passed across `lineage-operative-state`, Parent-integrity correctness, lineage safety hardening, and portable CLI capability affordance tests.
- Package Boundary: `npm pack --dry-run` passed and includes the new operative-state module/package export.
- Real Lineage Dogfood: The five qualified Structural Scaffold lineage artifacts project as one root, three intermediates, and one leaf. With no explicit currentness or lifecycle receipts supplied, currentness remains unresolved for all five and the controlling Task lifecycle remains unresolved rather than being inferred from the accepted Decision leaf.

## Preservation And Fidelity

- Preservation State: existing lineage resolution, lifecycle readiness, Reduction preflight, and operation-catalog semantics remain separate and unchanged except for the additive read-only operation/export.
- Fidelity Notes: the dogfood intentionally demonstrates that an accepted child Decision does not automatically close its ancestor Task; explicit lifecycle authority remains required.
- Known Losses: no host UI/CLI command alias was added; consumers can use the portable operation catalog/API. No full Core suite was rerun for this small projection tranche.

## Interpretation Limits

- Does Not Prove: that a lineage is current merely because it is a leaf, that an accepted Decision closes a Task, that historical material is reducible, that a Reduction authorizes deletion, or that Process applicability is established.
- Must Not Be Treated As: a new workflow engine, a replacement for `project-lifecycle-readiness`, a Reduction classifier, or a destructive eligibility receipt.
- Not Yet Used As: authority for automatic Reduction, deletion, host UI behavior, or project-wide currentness classification.
- Next Boundary: Reduction discovery may consume this projection together with separately qualified lifecycle/currentness evidence, but must continue to use existing Reduction preflight and destructive eligibility gates for any removal claim.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-lineage-operative-state-projection-task.trace.md](001-lineage-operative-state-projection-task.trace.md)
  - Value: 3cQAITiZn6bsByyntoTwZY0EHdXRzgPvjNkvS4tY_Sc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: fOhWgS3UzyhEhC82W0fxpujU5UdsoJ6qnusAX6sX4L0