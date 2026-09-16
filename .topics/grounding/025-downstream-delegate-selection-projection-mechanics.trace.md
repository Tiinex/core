# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 12:52:29
  - Trace: [001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 12:52:54
  - Authors: Anchor
  - Why: Fresh acceptance preflight deterministically projects Anchor as both current recipient and delegate even though Axiom is the selected specialist.
  - Summary: Separate current Handoff recipient/holder from the downstream specialist selected by exact current-work authority.
  - Status: ready/local

---

# Downstream Delegate Selection Projection Mechanics

## Objective

Correct Core grounding so a selected inbound Handoff recipient/current holder is not reused as the downstream specialist delegate. For the concrete acceptance case, the current recipient remains Anchor while the controlling current work forward-selects Axiom as the specialist whose independent review must be delegated.

The correction must qualify the downstream delegate from exact current-work authority plus exact Role material, while leaving current-session holder qualification, participant/cache grounding, source authority, process applicability and return/reconciliation as separate claims.

## Done Criteria

- Real normal `ground` over an Anchor-to-Anchor bounded acceptance carrier projects current holder/recipient Anchor and downstream delegate Axiom as distinct facts.
- `delegationReadiness.delegateCapabilityAuthority.delegate` is Axiom for that route and its provenance identifies the exact forward current-work selector and exact Axiom Role artifact.
- `nextOperations` targets Axiom for the specialist Handoff and still points to the exact authorized Docs Task/Handoff directories.
- Removing the forward Axiom selector fails closed instead of promoting Axiom from participant Role cache or Role inventory.
- Changing only the inbound Handoff recipient does not silently redefine the downstream specialist selection.
- Existing separate process/target/source/return authority projections remain independently attributable and fail closed when missing.
- No prose/NLP inference, Role-name branch, provider/chat assumption, reverse inventory scan, hidden caller delegation object, or new semantic schema is introduced.
- Full Core suite, focused adversarial regressions, portable smoke and embedded bootstrap qualification are green.
- Return exact Evidence plus one Loom-to-Anchor Handoff.

## Scope

Core grounding delegation-artifact authority projection and focused tests only. No Business/Docs mutation, no holder redesign, no product implementation, no acceptance decision, and no unrelated refactor.

## Dependencies

- Business Downstream Delegate Selection Projection Correction.
- Axiom Qualified Delegation Grounding Semantic Disposition.
- Current canonical Role and holder mechanics.
- Latest Forward-Qualified Delegation Closure Projection implementation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md)
  - Value: yCIqwxGqU4bka7SwoGorNSXFIEWAv_qdzbkyfRgQlCo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: OT3mrIJRIl9s3KC1bhHvysVrFIxtU7rYqmUTXB2iAyc