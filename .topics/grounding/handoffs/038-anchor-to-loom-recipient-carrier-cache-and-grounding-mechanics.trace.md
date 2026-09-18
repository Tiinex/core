# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:35:17
  - Trace: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-17 11:35:51
  - Authors: Anchor
  - Why: Axiom semantics are accepted and Anchor has reconciled them; Loom now owns the bounded portable Tooling implementation turn before fresh-recipient acceptance.
  - Summary: Delegate the accepted bounded-cache carrier projection, participant-pointer repair and no-manual-holder grounding mechanics to Loom in Core.
  - Status: ready/local

---

# Anchor To Loom — Recipient Carrier Cache And Grounding Mechanics

## Handoff Parties

- Purpose: implement the accepted recipient-facing carrier-lineage cache grounding projection and close the remaining no-manual-holder / participant-pointer cold-start defects in portable Core Tooling.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- recipient-carrier-cache-grounding-mechanics
  - Transfer Kind: work-and-responsibility
  - Description: implement the Core Task for ancestor-complete bounded cache/material carrier projection, deterministic participant -> From -> To -> Handoff ordering, route-local qualification and fail-closed omission behavior.
  - Controlling Artifact: [Recipient Carrier Cache And Grounding Mechanics](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Boundary: implement the accepted projection only; do not create new semantics, schemas, cache authority or artifact-lineage coupling.

- qualified-handoff-holder-binding-completion
  - Transfer Kind: work-and-responsibility
  - Description: complete the existing canonical handoff-mode holder-binding mechanics so fresh selected Handoffs can reach act-ready without a conversational/self-supplied `--holder-role` bridge when exact Role authority qualifies.
  - Controlling Artifact: [Qualified Handoff Recipient Holder Projection Mechanics](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Boundary: selected-Handoff consumption is bounded assignment evidence only; package delivery, endpoint labels, cache presence and provider/chat identity remain insufficient.

## Required Context

- controlling-core-task
  - Material: exact Core implementation Task for this turn.
  - Material Reference: [Recipient Carrier Cache And Grounding Mechanics](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Purpose: controls implementation scope, tests and done criteria.
  - Availability: available

- existing-holder-binding-task
  - Material: existing holder-binding mechanics Task retained as independent work lineage and dependency.
  - Material Reference: [Qualified Handoff Recipient Holder Projection Mechanics](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Purpose: prevents the new carrier work from bypassing the known no-manual-holder grounding defect.
  - Availability: available

- axiom-semantic-disposition
  - Material: accepted Axiom carrier-lineage/cache grounding semantic disposition.
  - Material Reference: [Carrier-Lineage Cache Grounding Closure Semantic Disposition](docs::.topics/grounding/019-carrier-lineage-cache-grounding-closure-semantic-disposition.trace.md)
  - Purpose: canonical semantic/projection contract Loom must consume rather than infer from current implementation shape.
  - Availability: available

- anchor-reconciliation
  - Material: Anchor reconciliation accepting the Axiom disposition and binding the next implementation frontier.
  - Material Reference: [Anchor Reconciliation — Carrier-Lineage Cache Grounding Closure](docs::.topics/grounding/020-anchor-reconciliation-carrier-lineage-cache-grounding-closure.trace.md)
  - Purpose: exact integration and retained-responsibility boundary for this Loom turn.
  - Availability: available

- foundation-cross-repository-process
  - Material: current Foundation cross-repository work-turn operating process.
  - Material Reference: [Cross-Repository Work Turn](business::.topics/processes/002-cross-repository-work-turn-process.trace.md)
  - Purpose: required operating guidance for this role-bounded cross-repository specialist turn.
  - Availability: available

- foundation-process-adoption
  - Material: accepted adoption authority for the Foundation cross-repository process.
  - Material Reference: [Foundation Cross-Repository Work Turn Adoption](business::.topics/processes/002-1-foundation-cross-repository-work-turn-adoption-decision.trace.md)
  - Purpose: establishes operative effect rather than inferring it from process presence.
  - Availability: available

- foundation-process-applicability
  - Material: explicit Foundation applicability Relation for the adopted process.
  - Material Reference: [Foundation Work-Turn Applicability Relation](business::.topics/processes/002-1-1-foundation-cross-repository-work-turn-applicability-relation.trace.md)
  - Purpose: grounds bounded process applicability for this turn.
  - Availability: available

## Reference Context

- post-major-1-recovery
  - Material: full Anchor recovery checkpoint immediately preceding this new carrier major.
  - Material Reference: [Anchor To Anchor — Post-Major-1 Full Recovery Checkpoint](docs::.topics/grounding/handoffs/014-anchor-to-anchor-post-major-1-full-recovery-checkpoint.trace.md)
  - Purpose: preserves recovery continuity and confirms this Loom turn is a new carrier major rather than semantic Parent authority.
  - Availability: available

## Retained Responsibilities

- integration-and-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile Loom's return, verify exact implementation evidence and decide readiness for fresh Anchor/specialist acceptance.
  - Boundary: Loom does not accept its own implementation into the broader grounding frontier.

- semantic-reopen
  - Retained By: Axiom
  - Responsibility: review only a concrete implementation contradiction matching the accepted disposition's review conditions.
  - Boundary: no semantic reopen is currently required.

- human-grounding-observation
  - Retained By: Sigma
  - Responsibility: provide bounded human observation only when the later fresh-recipient acceptance asks for it.
  - Boundary: Sigma observation is acceptance evidence/input, not semantic or implementation authority.

## Exclusions And Dependencies

- no-product-side-tracks
  - Kind: excluded-scope
  - Description: no Site, VS Code, App, Verse or unrelated product work.
  - Responsible Party Or Role: Loom / Anchor

- no-semantic-helper-debt
  - Kind: excluded-scope
  - Description: do not introduce Cache schemas, semantic JSON/index/checksum/diff registries or other helper-format authority. Existing runtime-private mechanics may remain non-authoritative only where existing contracts already permit them.
  - Responsible Party Or Role: Loom

- no-carrier-artifact-lineage-leakage
  - Kind: excluded-scope
  - Description: carrier major topology, retries and route branches must not be copied into durable artifact Parent lineage unless independently true as work lineage.
  - Responsible Party Or Role: Loom / Anchor

- no-sibling-grounding-dependency
  - Kind: excluded-scope
  - Description: no selected route may require sibling traversal for mandatory grounding closure.
  - Responsible Party Or Role: Loom

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns exact qualification Evidence plus one Loom-to-Anchor Handoff stating implemented changes, tests/fixtures, any blocked review condition and the exact fresh-recipient acceptance readiness state.
- Return To: Anchor
- Return To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: every Workspace needs cache; every route needs participants; cache material is automatically relevant; pointer order creates semantic priority; or this carrier major rewrites the independent Task lineages it bundles.
- Must Not Be Used To Claim: holder assignment from transport alone, participant relevance from Role inventory, process applicability from cache presence, new schema authority, or fresh human/model acceptance before Anchor reconciliation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Value: qUmfFdL2S-deGs5deVJRIGQCLb8CpQ-1u8Xc85B7D_k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gEpkKTL3mlsZTxjHOE5MwK8NvWCM_5vGRz3Rj6mO9HQ