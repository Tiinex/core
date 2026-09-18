# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 15:57:46
  - Trace: [026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
  - Origin:
    - [relative](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-17 15:57:53
  - Authors: Anchor
  - Why: Fresh Axiom cold-start remains blocked because required external Parent continuity stops before the qualified root; Loom owns the Core mechanics repair.
  - Summary: Delegate repair of the fresh-recipient external Parent closure gap while preserving bounded cache, holder, participant and carrier mechanics.
  - Status: ready/local

---

# Anchor To Loom — External Parent Closure Grounding Completion

## Handoff Parties

- Purpose: repair the remaining recipient grounding completeness gap proven by the fresh Anchor acceptance carrier without widening cache semantics or regressing the already qualified carrier/holder/participant mechanics.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- external-parent-closure-grounding-completion
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the bounded external Parent closure mechanics required for a selected recipient route to prove cold-start continuity to a qualified root or explicit bounded stop.
  - Controlling Artifact: [External Parent Closure To Qualified Root Mechanics](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
  - Boundary: Core mechanics only; preserve existing semantic owners and do not convert cache/material carriage into authority.

## Required Context

- controlling-core-task
  - Material: exact child Core Task defining the external Parent closure repair.
  - Material Reference: [External Parent Closure To Qualified Root Mechanics](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
  - Purpose: controlling implementation scope.
  - Availability: available

- black-box-failure-evidence
  - Material: exact Anchor Evidence from the fresh Axiom recipient carrier failure.
  - Material Reference: [Fresh Axiom Cold-Start Cache Closure Failure](../evidence/023-fresh-axiom-cold-start-cache-closure-failure.trace.md)
  - Purpose: exact reproduction target and acceptance gap.
  - Availability: available

- parent-cache-grounding-task
  - Material: accepted parent Core cache/grounding mechanics Task.
  - Material Reference: [Recipient Carrier Cache And Grounding Mechanics](../026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Purpose: preserve existing done criteria and boundaries.
  - Availability: available

- prior-cache-qualification
  - Material: Loom qualification Evidence for participant/cache/holder/carrier mechanics.
  - Material Reference: [Recipient Carrier Cache And Participant Projection Qualification](../evidence/021-recipient-carrier-cache-and-participant-projection-qualification.trace.md)
  - Purpose: regression boundary; do not re-open qualified semantics.
  - Availability: available

- anchor-prior-reconciliation
  - Material: Anchor acceptance Evidence for the prior Core implementation tranche.
  - Material Reference: [Anchor Reconciliation — Recipient Carrier Cache And Grounding Mechanics](../evidence/022-anchor-reconciliation-recipient-carrier-cache-and-grounding-mech.trace.md)
  - Purpose: preserve the accepted integration boundary while fixing the newly exposed black-box gap.
  - Availability: available

## Reference Context

- axiom-carrier-semantics
  - Material: accepted Docs carrier/cache semantic disposition remains the semantic boundary.
  - Material Reference: [Carrier-Lineage Cache Grounding Closure Semantic Disposition](docs::.topics/grounding/019-carrier-lineage-cache-grounding-closure-semantic-disposition.trace.md)
  - Purpose: do not widen cache authority or invent new semantics.
  - Availability: available

## Retained Responsibilities

- acceptance-and-retry
  - Retained By: Anchor
  - Responsibility: reconcile Loom's return, remanufacture the fresh acceptance carrier, rerun fresh Anchor -> fresh Axiom without Sigma repair, and decide when the carrier-major becomes stable.
  - Boundary: Loom qualifies Core implementation only; Anchor owns acceptance and carrier progression.

- human-observation
  - Retained By: Sigma
  - Responsibility: observe whether fresh-role grounding and carrier progress remain understandable without manual re-grounding.
  - Boundary: Sigma observation is evidence/input, not Core implementation or semantic authority.

## Exclusions And Dependencies

- no-full-repository-cache
  - Kind: excluded-scope
  - Description: do not solve the missing Parent by mirroring entire repositories or Workspaces when exact bounded closure is sufficient.
  - Responsible Party Or Role: Loom

- no-sidecar-authority
  - Kind: excluded-scope
  - Description: do not introduce JSON/index/checksum/diff helper authority or a new Cache semantic schema.
  - Responsible Party Or Role: Loom

- no-semantic-widening
  - Kind: excluded-scope
  - Description: carried Parent material remains read-only context and must not create process applicability, participation, holder, delegation, source or mutation authority.
  - Responsible Party Or Role: Loom / Core Tooling

- no-product-side-tracks
  - Kind: excluded-scope
  - Description: no Site, VS Code, App, Verse or unrelated product work.
  - Responsible Party Or Role: Loom / Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns exact qualification Evidence plus one Loom-to-Anchor Handoff showing the reproduced fresh-Axiom external Parent closure gap is repaired under current source runtime and embedded bootstrap, with bounded-stop negative coverage and all prior cache/holder/participant/carrier regressions green.
- Return To: Anchor
- Return To Reference: [Anchor Role — Canonical Holder Cutover Continuation](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: every external Parent chain must be copied in full; cache becomes semantic authority; carrier lineage is artifact lineage; or the fresh acceptance is complete before Anchor reruns it.
- Must Not Be Used To Claim: package presence, filenames, provider/chat identity or cached ancestry establish semantic participation, process, delegation, source or mutation authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md](../026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md)
  - Value: qysjTnMeFjMyQLunBsbs9fvHymA1UsbC5Zn7OjHgpJU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: J6LUdoUSts4l28flhn7VqNd9RMFLgMGklDOJjlN-gsk