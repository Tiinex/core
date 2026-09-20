# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 10:53:14
  - Trace: [029-1-qualified-human-session-and-participant-projection.trace.md](../029-1-qualified-human-session-and-participant-projection.trace.md)
  - Origin:
    - [relative](../029-1-qualified-human-session-and-participant-projection.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-20 10:53:53
  - Authors: Anchor
  - Why: Axiom semantics are reconciled; shared host-neutral projection mechanics must qualify before host presentation can proceed.
  - Summary: Delegate the bounded Core projection implementation required before VS Code participant/speaker UX work.
  - Status: ready/local

---

# Anchor To Loom — Qualified Human Session And Participant Projection

## Handoff Parties

- Purpose: implement and qualify the bounded shared Core projection required by the accepted Axiom/Anchor multi-human session semantics before any VS Code participant/speaker UX work proceeds.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- qualified-human-session-participant-projection
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify Core Task `029-1` so shared grounding exposes independent exact qualified/unresolved Role, holder, participant and process dimensions for host consumers while active-speaker state remains non-authoritative.
  - Controlling Artifact: [Qualified Human Session And Participant Projection](../029-1-qualified-human-session-and-participant-projection.trace.md)
  - Boundary: shared Core mechanics only; no VS Code UI implementation, no new participant/session schema, no host-derived semantic authority.

## Required Context

- controlling-core-task
  - Material: exact Core Task defining the bounded implementation and acceptance surface.
  - Material Reference: [Qualified Human Session And Participant Projection](../029-1-qualified-human-session-and-participant-projection.trace.md)
  - Purpose: implementation scope and qualification boundary.
  - Availability: available

- anchor-semantic-reconciliation
  - Material: accepted Anchor reconciliation of Axiom's semantic return.
  - Material Reference: [Anchor Reconciliation — Human Session, Participant And Meeting Semantics](business::.topics/processes/gpt/grounding/001-1-4-1-2-anchor-reconciliation-human-session-participant-and-meeting-sema.trace.md)
  - Purpose: exact semantic/projection contract authorized for implementation.
  - Availability: available

- axiom-semantic-return
  - Material: Axiom To Anchor — Human Session, Participant And Meeting Semantic Return.
  - Material Reference: [Axiom Semantic Return](business::.topics/processes/gpt/grounding/001-1-4-1-1-1-axiom-to-anchor-human-session-participant-and-meeting-semantic-r.trace.md)
  - Purpose: canonical semantic classification behind the Anchor reconciliation.
  - Availability: available

- controlling-business-major
  - Material: Anchor Major 001 — Session, Participant And Operator Continuity Hardening.
  - Material Reference: [Controlling Major Task](business::.topics/processes/gpt/grounding/001-1-4-1-anchor-major-001-session-participant-and-operator-continuity-har.trace.md)
  - Purpose: fixed Major scope, sequencing and final acceptance gates.
  - Availability: available

- existing-participant-task
  - Material: prior accepted Core participant projection Task.
  - Material Reference: [Artifact-Derived Semantic Participant Projection](../029-artifact-derived-semantic-participant-projection.trace.md)
  - Purpose: mechanical base and negative-authority invariants that must be preserved.
  - Availability: available

## Reference Context

- accepted-participant-base
  - Material: prior accepted participant projection qualification and behavioral evidence.
  - Material Reference: [Participant Projection Qualification](../evidence/036-artifact-derived-semantic-participant-projection-qualification.trace.md)
  - Purpose: regression baseline for the existing positive/negative participant mechanics.
  - Availability: available

- process-applicability-basis
  - Material: accepted Business process-applicability disposition.
  - Material Reference: [Process Applicability Decision](business::.topics/initiatives/001-2-7-2-2-second-specialist-reconciliation-and-process-grounding-disposition.trace.md)
  - Purpose: preserve forward-only process applicability and availability/applicability separation.
  - Availability: available

## Retained Responsibilities

- core-return-reconciliation
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: audit Loom's exact source return, reconcile it with the current Major frontier and decide whether the VS Code lane may begin.
  - Boundary: Loom owns bounded implementation qualification only; Anchor owns integration and Major progression.

- host-implementation
  - Retained By: VS Code implementation lane
  - Responsibility: consume the later accepted shared projection for participant/speaker separation and visible long-operation progress.
  - Boundary: no host implementation begins from this Handoff alone.

- human-host-gate
  - Retained By: Sigma
  - Responsibility: exercise the later real VS Code path and return bounded observation/acceptance evidence.
  - Boundary: Sigma live acceptance is downstream and cannot be substituted by Loom tests.

## Exclusions And Dependencies

- no-host-authority
  - Kind: excluded-scope
  - Description: no speaker label, account/display identity, Role/cache inventory, endpoint or host selection may become participant/holder/Party authority.
  - Responsible Party Or Role: Loom

- no-new-schema
  - Kind: excluded-scope
  - Description: do not introduce Participant, Meeting, Conversation or Session schemas for this use case.
  - Responsible Party Or Role: Loom

- no-vscode-source
  - Kind: excluded-scope
  - Description: do not mutate VS Code extension source in this lane.
  - Responsible Party Or Role: Loom

- no-unrelated-refactor
  - Kind: excluded-scope
  - Description: defer unrelated Core cleanup, provider extraction, release/publication and architecture work.
  - Responsible Party Or Role: Loom / Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns exact qualification Evidence and one Loom → Anchor carrier containing the bounded Core source delta, with focused participant/session/process regressions plus full Core/portable/bootstrap qualification green and no host-semantic inference.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: speaker state is semantic authority, Sigma is permanently identified, every meeting requires durable participants, VS Code implementation is authorized, or the Major is complete.
- Must Not Be Used To Claim: participant authority from inventory/endpoints/transport, process applicability from availability, remote mutation authority, product acceptance or release readiness.
- Authority Limits: bounded shared Core implementation/qualification only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [029-1-qualified-human-session-and-participant-projection.trace.md](../029-1-qualified-human-session-and-participant-projection.trace.md)
  - Value: ld1Xgb3nTtuZN38UcmhvsKeicvULt79qI-l1bNkysAc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: P4upsRfj41PXgxluX-XRaY2d7qd4DTcEOY4TvF_L7R8