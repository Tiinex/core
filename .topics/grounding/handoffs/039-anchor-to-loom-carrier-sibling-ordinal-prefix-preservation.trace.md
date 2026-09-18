# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:57:14
  - Trace: [026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-17 11:57:38
  - Authors: Anchor
  - Why: The previous Loom carrier exposed a false 002-1-3 lineage caused by retry allocation; the corrected 003 must preserve the real 002-1 parent and make the defect part of Loom implementation scope.
  - Summary: Delegate the carrier sibling ordinal/prefix correction together with the accepted cache/grounding mechanics to Loom.
  - Status: ready/local

---

# Anchor To Loom — Carrier Sibling Ordinal And Prefix Preservation

## Handoff Parties

- Purpose: implement the already accepted cache/grounding mechanics together with the newly isolated carrier sibling-ordinal and prefix-preservation correction.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- carrier-sibling-ordinal-prefix-preservation
  - Transfer Kind: work-and-responsibility
  - Description: correct carrier continuation numbering so real Handoff route ordinals and explicit consolidation/stabilization determine visible lineage, never retries or local allocation attempts.
  - Controlling Artifact: [Carrier Sibling Ordinal And Prefix Preservation Mechanics](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Boundary: carrier progress projection only; do not rewrite artifact lineage or invent semantic authority.

- recipient-carrier-cache-grounding-mechanics
  - Transfer Kind: work-and-responsibility
  - Description: retain the parent Core Task for ancestor-complete bounded cache projection, participant -> From -> To -> Handoff ordering, participant-pointer repair and no-manual-holder grounding.
  - Controlling Artifact: [Recipient Carrier Cache And Grounding Mechanics](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Boundary: implement accepted projection semantics only.

## Required Context

- carrier-sibling-ordinal-task
  - Material: exact Core correction Task for carrier sibling ordinal and prefix preservation.
  - Material Reference: [Carrier Sibling Ordinal And Prefix Preservation Mechanics](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Purpose: controls the newly isolated Tooling correction.
  - Availability: available

- recipient-carrier-cache-task
  - Material: parent Core implementation Task for cache/grounding mechanics.
  - Material Reference: [Recipient Carrier Cache And Grounding Mechanics](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Purpose: retains the accepted cache, participant pointer and holder-binding implementation scope.
  - Availability: available

- axiom-semantic-disposition
  - Material: accepted Axiom carrier-lineage/cache grounding semantic disposition.
  - Material Reference: [Carrier-Lineage Cache Grounding Closure Semantic Disposition](docs::.topics/grounding/019-carrier-lineage-cache-grounding-closure-semantic-disposition.trace.md)
  - Purpose: canonical semantic/projection contract for cache and grounding mechanics.
  - Availability: available

- anchor-reconciliation
  - Material: Anchor reconciliation accepting Axiom's disposition.
  - Material Reference: [Anchor Reconciliation — Carrier-Lineage Cache Grounding Closure](docs::.topics/grounding/020-anchor-reconciliation-carrier-lineage-cache-grounding-closure.trace.md)
  - Purpose: preserves the accepted integration boundary.
  - Availability: available

- foundation-cross-repository-process
  - Material: current Foundation cross-repository work-turn operating process.
  - Material Reference: [Cross-Repository Work Turn](business::.topics/processes/002-cross-repository-work-turn-process.trace.md)
  - Purpose: required operating guidance for this specialist turn.
  - Availability: available

- foundation-process-adoption
  - Material: accepted adoption authority for the process.
  - Material Reference: [Foundation Cross-Repository Work Turn Adoption](business::.topics/processes/002-1-foundation-cross-repository-work-turn-adoption-decision.trace.md)
  - Purpose: establishes operative effect.
  - Availability: available

- foundation-process-applicability
  - Material: explicit Foundation applicability Relation.
  - Material Reference: [Foundation Work-Turn Applicability Relation](business::.topics/processes/002-1-1-foundation-cross-repository-work-turn-applicability-relation.trace.md)
  - Purpose: grounds bounded process applicability.
  - Availability: available

## Reference Context

- prior-holder-binding-task
  - Material: earlier qualified holder-binding mechanics Task.
  - Material Reference: [Qualified Handoff Recipient Holder Projection Mechanics](../026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Purpose: retained dependency for no-manual-holder cold start.
  - Availability: available

## Retained Responsibilities

- integration-and-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile Loom's return and decide readiness for fresh-recipient acceptance.
  - Boundary: Loom does not accept its own implementation into the broader grounding frontier.

- human-observation
  - Retained By: Sigma
  - Responsibility: later provide bounded human observation of whether carrier progress remains legible and fresh grounding no longer needs manual repair.
  - Boundary: observation is evidence/input, not implementation or semantic authority.

## Exclusions And Dependencies

- no-artifact-lineage-mirroring
  - Kind: excluded-scope
  - Description: carrier dimensions, majors, returns, consolidation and sibling ordinals must not be copied into durable artifact Parent lineage unless independently true.
  - Responsible Party Or Role: Loom / Anchor

- no-retry-visible-siblings
  - Kind: excluded-scope
  - Description: failed manufacture attempts, output collisions and local allocation files must not consume human-visible carrier sibling ordinals.
  - Responsible Party Or Role: Loom

- no-sidecar-authority
  - Kind: excluded-scope
  - Description: do not add JSON/index/checksum/diff sidecars as carrier semantic authority.
  - Responsible Party Or Role: Loom

- no-product-side-tracks
  - Kind: excluded-scope
  - Description: no Site, VS Code, App, Verse or unrelated product work.
  - Responsible Party Or Role: Loom / Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns exact qualification evidence plus one Loom-to-Anchor Handoff stating carrier numbering/prefix behavior, cache/grounding changes, tests, any blocker and fresh-recipient readiness.
- Return To: Anchor
- Return To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: carrier lineage is semantic work lineage; every consolidation requires a major bump; every package has multiple routes; or a Role becomes relevant because it is carried.
- Must Not Be Used To Claim: semantic authority from route ordinal, retry state, carrier filename, package placement or carrier major identity.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md](../026-1-1-carrier-sibling-ordinal-and-prefix-preservation-mechanics.trace.md)
  - Value: UEn1EdhKu6_zDQI6_lta2d_35rdQgog4SYfuVCQ6iCc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: c2CH0BR44lhz_0t0A4EN1hJM0eb92osDOY8PLkgs4iA