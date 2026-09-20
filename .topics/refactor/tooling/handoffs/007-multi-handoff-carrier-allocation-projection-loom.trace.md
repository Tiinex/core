# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 16:24:45
  - Trace: [001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Origin:
    - [relative](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-20 16:28:37
  - Authors: Anchor
  - Why: Sigma's live gate reproduced a multi-Handoff Pack failure at a host-owned carrier allocation seam; Loom should qualify the shared mechanical truth before Kodax consumes it.
  - Summary: Delegate the shared multi-Handoff carrier allocation/route-continuation projection to Loom without widening semantics.
  - Status: ready/local

---

# Multi-Handoff Carrier Allocation Projection → Loom

## Handoff Parties

- Purpose: eliminate host-owned carrier-lineage/route allocation inference exposed by Sigma's live VS Code multi-Handoff Pack failure and return one qualified shared Core projection for ordinary carrier continuation.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Canonical Holder Cutover Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- shared-allocation-projection
  - Transfer Kind: work-and-responsibility
  - Description: implement the controlling Core Task so hosts can obtain exact ordinary carrier continuation/allocation state from qualified parent route topology instead of reproducing carrier-dimension/path-matching logic.
  - Controlling Artifact: [Multi-Handoff Carrier Allocation And Route Continuation Projection](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Boundary: host-neutral mechanical projection only; no semantic Parent, participant, holder, recipient or current-work authority is created.

- live-failure-classification
  - Transfer Kind: work-and-responsibility
  - Description: reproduce and classify the Sigma-observed two-Handoff Pack failure shape. If existing manufacture already contains the exact necessary truth, expose/reuse it rather than creating a competing allocation engine.
  - Controlling Artifact: [Multi-Handoff Carrier Allocation And Route Continuation Projection](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Boundary: do not mutate VS Code source in this lane; return the exact host-consumption contract to Anchor/Kodax.

## Required Context

- loom-role-authority
  - Material: exact current canonical Loom Role carried by the received Core return as endpoint Role material.
  - Material Reference: [Loom Canonical Holder Cutover Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)
  - Purpose: qualify the recipient Tooling lane; the controlling Core Task is already this Handoff's semantic Parent and travels in the selected complete Core Workspace.
  - Availability: available

## Reference Context

- sigma-live-repro
  - Material: Sigma's real VS Code replay blocked when two Handoff pointers were present with the message `the primary Handoff does not continue an exact qualified Handoff route in the selected Incoming carrier parent`.
  - Purpose: concrete product reproduction target; Loom should reproduce the underlying route/allocation shape from Core tests without depending on chat or video access.
  - Availability: available

- host-drift-seam
  - Material: current VS Code `expectedOutgoingCarrierDimension()` computes a dimension by matching the outgoing draft Parent path against `qualifiedRoutes(parent.orientation)` and blocks before shared manufacture when no match is found.
  - Purpose: identify the host-owned logic that the shared projection should make unnecessary.
  - Availability: available

## Retained Responsibilities

- host-adoption
  - Retained By: Kodax
  - Retained By Reference: [Kodax Canonical Holder Cutover Role](business::.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md)
  - Responsibility: consume the qualified Core projection in VS Code, restore the bounded participant affordance and progress UX, and keep host presentation non-authoritative.

- integration-and-live-gate
  - Retained By: Anchor
  - Retained By Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Responsibility: reconcile Loom and Kodax parallel returns against their exact bases/current frontier and route the integrated candidate back to Sigma.

- human-acceptance
  - Retained By: Sigma
  - Retained By Reference: [Sigma Canonical Holder Cutover Role](business::.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md)
  - Responsibility: replay the real two-Handoff/participant/progress workflow after integration; machine qualification does not close the human gate.

## Exclusions And Dependencies

- vscode-source
  - Kind: excluded-scope
  - Description: Extension VS Code source is not mutated in this Loom lane.
  - Responsible Party Or Role: Kodax

- semantic-redesign
  - Kind: excluded-scope
  - Description: no new Handoff, carrier, Participant, Session or Meeting semantics and no widening of artifact Parent meaning.
  - Responsible Party Or Role: Axiom/Docs if a real semantic gap is demonstrated.

- release-and-cleanup
  - Kind: excluded-scope
  - Description: no release publication, remote mutation, Reduction cleanup or unrelated Tooling refactor.
  - Responsible Party Or Role: Anchor / later bounded work.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns one normal Handoff carrier containing the qualified Core implementation/evidence, exact failure classification, focused regressions and the host-facing projection contract sufficient for Kodax to remove host carrier-lineage inference.
- Return To: Anchor
- Return To Reference: [Anchor Canonical Holder Cutover Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: Core chooses user-facing UX, route topology creates semantic authority, participant state controls carrier allocation, or successful manufacture implies human acceptance.
- Must Not Be Used To Claim: carrier dimension changes artifact Parent lineage, filename matching is authority, Loom may modify VS Code, or a green Core suite closes Major 002.
- Authority Limits: bounded shared Core mechanical projection and qualification under the controlling Task only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md](../001-2-multi-handoff-carrier-allocation-and-route-continuation-projecti.trace.md)
  - Value: 8igl95nT7n0RKsfgG7McJtSBOGNXi_Be4avwl76ENkk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gv29EsZpsGRzlTqcyxK4LB36nxZyOyaAwS7l2WNN5hs