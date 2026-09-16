# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 12:52:54
  - Trace: [025-downstream-delegate-selection-projection-mechanics.trace.md](../025-downstream-delegate-selection-projection-mechanics.trace.md)
  - Origin:
    - [relative](../025-downstream-delegate-selection-projection-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-16 12:53:22
  - Authors: Anchor
  - Why: The real fresh acceptance preflight proves normal grounding still conflates inbound recipient Anchor with downstream selected specialist Axiom.
  - Summary: Fresh Loom implementation handoff for the recipient-versus-downstream-delegate projection correction.
  - Status: ready/local

---

# Anchor To Loom — Downstream Delegate Selection Projection Mechanics

## Handoff Parties

- Purpose: correct the remaining Core delegation-readiness projection defect that conflates the current inbound Handoff recipient/holder with the downstream specialist selected by current-work authority.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- downstream-delegate-selection-correction
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the bounded Core projection correction and adversarial regressions defined by the controlling Task.
  - Controlling Artifact: [Downstream Delegate Selection Projection Mechanics](../025-downstream-delegate-selection-projection-mechanics.trace.md)
  - Boundary: Core projection mechanics only; semantic ownership remains with qualified Docs/Axiom authority and Business acceptance remains with Anchor.

## Required Context

- core-workspace
  - Material: current qualified Tiinex Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact implementation source and focused/full Core qualification surface.
  - Availability: available

- business-correction-task
  - Material: controlling Business correction Task.
  - Material Reference: [Downstream Delegate Selection Projection Correction](business::.topics/initiatives/001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md)
  - Purpose: exact organizational scope, acceptance boundary and retained Anchor responsibility.
  - Availability: available

- delegation-semantics
  - Material: accepted Axiom qualified-delegation semantic disposition.
  - Material Reference: [Qualified Delegation Grounding Semantic Disposition](docs::.topics/grounding/011-qualified-delegation-grounding-semantic-disposition.trace.md)
  - Purpose: semantic distinction between current holder/recipient, Role relevance, downstream delegate selection, transfer and return/reconciliation.
  - Availability: available

## Retained Responsibilities

- anchor-reconciliation
  - Retained By: Anchor
  - Responsibility: reconcile Loom's qualified return, decide integration/acceptance, build recovery and run the subsequent fresh-role black-box acceptance.
  - Boundary: Loom does not mutate Business/Docs or declare the grounding acceptance complete.

## Exclusions And Dependencies

- no-semantic-rewrite
  - Kind: excluded-scope
  - Description: do not introduce new delegation/participant/process semantics or reinterpret cached Role presence as selection authority.
  - Responsible Party Or Role: Loom

- no-product-work
  - Kind: excluded-scope
  - Description: no Site, Playthings, App or other product implementation work belongs in this tranche.
  - Responsible Party Or Role: Loom

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return qualified Core evidence and one Loom-to-Anchor Handoff proving the real inbound Anchor/current-holder versus downstream Axiom delegate case under normal grounding.
- Return To: Anchor

## Reference Context

- fresh-acceptance-shape
  - Material: bounded blank/minimal Workspace + Role-cache acceptance semantics already established in Docs/Business.
  - Material Reference: [Blank-Workspace Role-Cache Grounding Semantic Disposition](docs::.topics/grounding/009-blank-workspace-role-cache-grounding-semantic-disposition.trace.md)
  - Purpose: preserve the no-cache-promotion acceptance boundary without adding procedural coaching.
  - Availability: available

## Interpretation Limits

- Does Not Mean: Loom may choose a specialist, rewrite Axiom semantics, mutate Business/Docs, or use Role cache as selection authority.
- Must Not Be Treated As: permission to solve the acceptance task itself instead of fixing the projection seam.
- Authority Limits: bounded Core projection implementation and qualification only.
- Must Not Be Used To Claim: fresh-role behavioral acceptance before independent black-box execution.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [025-downstream-delegate-selection-projection-mechanics.trace.md](../025-downstream-delegate-selection-projection-mechanics.trace.md)
  - Value: OT3mrIJRIl9s3KC1bhHvysVrFIxtU7rYqmUTXB2iAyc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: v-IaRcMMxgbPtVE2Yj1g0YUrDm64dUJ3Zn79b1lP_Eg