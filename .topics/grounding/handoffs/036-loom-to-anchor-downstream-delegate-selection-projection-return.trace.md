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
  - Created At: 2026-09-16 17:19:37
  - Authors: Loom
  - Why: Return the completed bounded Core projection correction for Task 025.
  - Summary: Returns qualified recipient-versus-downstream-delegate mechanics and Evidence 019 to Anchor.
  - Status: ready/local

---

# Loom To Anchor — Downstream Delegate Selection Projection Return

## Handoff Parties

- Purpose: return the qualified Core correction that keeps inbound current recipient/holder authority separate from the downstream specialist selected by exact current-work authority.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- downstream-delegate-selection-result
  - Transfer Kind: work-and-responsibility
  - Description: qualified Core implementation and Evidence 019 proving inbound Anchor recipient/current holder and downstream Axiom delegate remain distinct under normal grounding, with exact selector/Role provenance and fail-closed cache boundaries.
  - Controlling Artifact: [Downstream Delegate Selection Projection Mechanics](../025-downstream-delegate-selection-projection-mechanics.trace.md)
  - Boundary: Loom returns implementation and qualification evidence only; Anchor retains reconciliation, Business acceptance and subsequent fresh-role black-box acceptance.

## Required Context

- business-correction-task
  - Material: controlling Business correction Task defining the recipient-versus-downstream-delegate defect and acceptance boundary.
  - Material Reference: [Downstream Delegate Selection Projection Correction](business::.topics/initiatives/001-2-7-5-1-5-1-downstream-delegate-selection-projection-correction.trace.md)
  - Purpose: exact organizational scope and retained Anchor acceptance authority.
  - Availability: available

- axiom-delegation-semantics
  - Material: accepted Axiom qualified-delegation semantic disposition.
  - Material Reference: [Qualified Delegation Grounding Semantic Disposition](docs::.topics/grounding/011-qualified-delegation-grounding-semantic-disposition.trace.md)
  - Purpose: semantic authority separating current holder/recipient, Role relevance, downstream delegate selection, transfer and return/reconciliation.
  - Availability: available

- downstream-delegate-qualification-evidence
  - Material: final Loom qualification for Task 025 implementation, normal grounding and adversarial boundaries.
  - Material Reference: [Downstream Delegate Selection Projection Qualification](../evidence/019-downstream-delegate-selection-projection-qualification.trace.md)
  - Purpose: exact implementation, regression and distribution evidence for this return.
  - Availability: available

## Reference Context

- fresh-acceptance-target
  - Material: bounded fresh-Anchor Axiom-review acceptance Task whose normal grounding exposed the defect.
  - Material Reference: [Fresh Anchor Delegation Acceptance — Axiom Review](docs::.topics/grounding/012-fresh-anchor-delegation-acceptance-axiom-review.trace.md)
  - Purpose: downstream black-box acceptance target only; not authority for Axiom-specific code or Business/Docs mutation.
  - Availability: available

## Retained Responsibilities

- semantic-ownership
  - Retained By: Axiom
  - Responsibility: delegation, participant, process and source semantics remain exactly as accepted in the qualified semantic dispositions.
  - Boundary: Loom's lexical declaration recognition and projection mechanics do not create new semantic primitives.

- integration-and-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile this qualified Core return, take the next recovery checkpoint and run the subsequent fresh-role black-box delegation acceptance.
  - Boundary: Loom does not declare the fresh-role acceptance passed and does not mutate Business or Docs.

- human-transport
  - Retained By: Sigma
  - Responsibility: transport qualified Handoff packages between isolated Role sessions without reconstructing authority in chat.
  - Boundary: Sigma does not supply missing delegation authority or reinterpret package cache as selection.

## Exclusions And Dependencies

- no-cache-promotion
  - Kind: excluded-scope
  - Description: package or Role-cache presence never selects a delegate or creates semantic participation; exact current-work selection remains mandatory.
  - Responsible Party Or Role: Loom

- no-prose-inference
  - Kind: excluded-scope
  - Description: Core recognizes only the one exact isolated current-Task declaration form; it does not perform natural-language interpretation, keyword search, fuzzy matching, candidate ranking or Role-name branching.
  - Responsible Party Or Role: Loom

- no-reverse-discovery
  - Kind: excluded-scope
  - Description: endpoints, filenames, adjacent Roles, repository inventory, reverse Relations, chat/provider identity or hidden caller JSON must not manufacture downstream delegate authority.
  - Responsible Party Or Role: Loom

- fresh-acceptance-pending
  - Kind: unresolved-dependency
  - Description: final behavioral acceptance still requires Anchor reconciliation and a fresh bounded Anchor-to-Axiom delegation/return run using the corrected Core mechanics.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one qualified carrier containing the Task 025 Core correction and Evidence 019, ready for reconciliation and fresh black-box delegation acceptance.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Loom selected Axiom for unrelated work, executed the Axiom semantic review, established semantic participation, mutated Business/Docs or accepted the downstream result.
- Must Not Be Used To Claim: that cached Role material or inbound recipient identity can substitute for exact current-work specialist selection.
- Authority Limits: bounded Core projection mechanics under Task 025, the exact Business correction Task and Axiom delegation semantic disposition.
- Must Not Be Treated As: a new delegation schema, natural-language planning, Axiom-specific branch, reverse-discovery permission, source-mutation grant or final fresh-role acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [025-downstream-delegate-selection-projection-mechanics.trace.md](../025-downstream-delegate-selection-projection-mechanics.trace.md)
  - Value: OT3mrIJRIl9s3KC1bhHvysVrFIxtU7rYqmUTXB2iAyc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EGOMKzF2Ghv80ntwLaV_o3Law0SsNd014yq7LyuFWx8