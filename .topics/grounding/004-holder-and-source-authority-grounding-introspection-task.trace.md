# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-14 13:45:00
  - Trace: [001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 17:31:30
  - Authors: Anchor
  - Why: Bounded Test 2 showed remaining authority ambiguity after participant/process grounding improved.
  - Summary: Expose holder-binding provenance and implementation-source authority gaps without semantic invention.
  - Status: ready/local

---

# Holder And Source Authority Grounding Introspection

## Objective

Harden Core grounding/introspection so a cold recipient can see exactly what authority is and is not established for consuming-session Role binding and implementation-source use/creation, while remaining semantics-neutral and compatible with the parallel Axiom semantic review.

## Evidence Basis

Bounded Test 2 showed that current grounding correctly leaves participant maps and process applicability unresolved, but the fresh Anchor still supplied its own holder Role declaration and interpreted a writable bounded Business Workspace as sufficient basis to create new implementation source.

## Required Outcome

- Make holder-binding provenance maximally explicit in grounding receipts:
  - recipient Role compatibility;
  - whether a holder binding exists;
  - the exact source of the holder declaration/assignment;
  - whether that source is merely operator/session input versus semantic authority carried by qualified material.
- Expose implementation-source authority as fail-visible diagnostics only when exact upstream semantic authority exists; otherwise preserve `unresolved` rather than deriving permission from Workspace carriage, completeness, writability, path adjacency or current Task wording alone.
- Where current Workspace metadata already declares purpose/boundary facts, expose those facts with provenance without converting them into source-creation permission.
- Add preflight/tests for the Test 2 class of ambiguity: organizational Business Workspace present, executable Task present, but no explicit implementation-source creation authority.
- Preserve bounded Workspace action-readiness, exact-source blocker behavior, participant/process non-inference and existing Recovery semantics.
- If the final semantic state model depends on Axiom's parallel disposition, return the mechanical boundary and test harness without inventing enum/state meaning; Anchor will reconcile and issue follow-up if needed.

## Scope

Shared portable Core grounding/introspection mechanics and regression tests only.

## Dependencies

- controlling Business Epic: `business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md`;
- Test 2 diagnostic disposition in Business;
- current qualified bounded Workspace readiness implementation;
- parallel Axiom semantic review for any new semantic state contract.

## Boundaries

- Do not mutate Business or Docs.
- Do not infer holder assignment from Handoff recipient or transport identity.
- Do not define semantic implementation-source authority in Core.
- Do not weaken `grounded-to-act`, Required Context, Parent continuity, Role qualification or source-evidence gates.
- Do not solve by embedding evaluator/task-specific bookkeeping logic.

## Done Criteria

- focused regression tests distinguish holder-binding provenance and source-authority unresolved behavior;
- broad Core qualification remains green;
- Evidence records exact non-broadening boundaries;
- qualified Loom-to-Anchor return Handoff.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Value: f0iMMxJZ5jrOIRd7SjL14TG2K-HriaX17b7g784ItO0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: yMPL5IYK-rXwPlRxiTDpNDtAcrGweEjB20GBWKxn9KA