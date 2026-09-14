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
  - Created At: 2026-09-14 15:31:13
  - Authors: Anchor
  - Why: The clean bounded Test 2 carrier qualifies and orients but grounding currently blocks solely on complete-snapshot coverage.
  - Summary: Allow fully qualified bounded Handoff routes to become actionable without broadening source or orchestration authority.
  - Status: ready/local

---

# Bounded Workspace Grounding Readiness — Thin-Lineage Test 2

## Objective

Make a qualified selected Handoff route carried by an explicitly bounded Workspace representation ground to the correct bounded action readiness when its exact route, recipient Role, current Task, Parent continuity and declared Required Context are all qualified, without pretending the Workspace is complete or broadening source authority.

## Reproduction

The current thin-lineage Test 2 carrier is a valid recipient-v2 Handoff package with:

- one qualified `business` Workspace represented as `bounded`;
- one qualified Anchor→Anchor selected Handoff route;
- the exact current bookkeeping Task and its neutral Epic lineage;
- the baseline Anchor Role as qualified Required Context;
- explicit return reservation;
- valid package, closure, pointer, cold-consumer and roundtrip manufacture verification.

`orient-handoff-package` returns `ready`, but `ground --holder-role Anchor` returns `insufficient-grounding` solely because `project-grounding-readiness` emits `workspace-snapshot-coverage-unqualified` when complete Workspace snapshot coverage is absent. The same grounding result already projects `sourceScope: bounded-current-route`, the Required Context as qualified, and the current Task frontier as resolved.

## Required Outcome

- Preserve `complete` versus `bounded` as distinct source states.
- Do not convert bounded carriage into whole-Workspace or whole-program source authority.
- A bounded route may become `grounded-to-act` only when the exact selected route's action authority and all material required for that bounded action are independently qualified.
- Missing material must still block exactly; bounded carriage must not weaken Required Context, Parent continuity, Role binding, holder binding, route qualification, schema authority or source-evidence checks.
- `orchestrationReadiness` must remain free to report wider participant/source/process context as not established even when the bounded route is actionable.
- Add adversarial regression coverage proving both the allowed bounded case and blocked bounded cases with missing authority/context.
- Keep pointerless Workspace-carrier recovery/comparison semantics separate from Handoff action readiness.

## Scope

Shared portable Core grounding/readiness mechanics and tests only.

## Dependencies

- controlling Business Epic: `business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md`;
- existing qualified thin-lineage grounding projection and grounding-introspection work already present in Core.

## Boundaries

- Do not invent participant or process semantics.
- Do not change Business or Docs.
- Do not make `grounded-to-act` mean whole-program readiness.
- Do not solve the test by requiring complete Workspace carriage.
- Preserve exact-source blocker behavior and current recovery-acceptance semantics.

## Done Criteria

- focused bounded-grounding regression suite is green;
- broad Core qualification remains green;
- Evidence records the exact readiness change and non-broadening boundaries;
- return a qualified Loom→Anchor Handoff package.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Value: f0iMMxJZ5jrOIRd7SjL14TG2K-HriaX17b7g784ItO0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 40dE7OLE3A1ROrLBD8RhiA1lKGyfKDhgxDZST5lmrO4