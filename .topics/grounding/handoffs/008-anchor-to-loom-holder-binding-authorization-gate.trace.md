# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-14 17:52:35
  - Trace: [007-loom-to-anchor-holder-source-authority-introspection-return.trace.md](007-loom-to-anchor-holder-source-authority-introspection-return.trace.md)
  - Origin:
    - [relative](007-loom-to-anchor-holder-source-authority-introspection-return.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-14 18:30:26
  - Authors: Anchor
  - Why: Post-Test-2 semantic reconciliation requires grounded-to-act for Role recipients to depend on exact holder-assignment authorization, not explicit session input alone.
  - Summary: Delegate the final Core gate separating a matching session Role assertion from qualified authorization for that assignment mode.
  - Status: ready/local

---

# Anchor To Loom — Holder Binding Authorization Gate

## Handoff Parties

- Purpose: implement the final Core holder-binding authorization gate required by the accepted post-Test-2 semantic reconciliation before one focused fresh-Anchor validation.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- holder-binding-authorization-gate
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the bounded Core change defined by Holder Binding Authorization Gate.
  - Controlling Artifact: [Holder Binding Authorization Gate](../005-holder-binding-authorization-gate-task.trace.md)
  - Boundary: exact Role holder-assignment authority must gate the session assertion; no transport/session-input-only authorization and no durable identity invention.

## Required Context

- core-workspace
  - Material: current complete Core Workspace containing the prior holder/source introspection implementation and this follow-up Task/Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: primary writable implementation and regression source for this bounded follow-up.
  - Availability: available

- business-workspace
  - Material: carried Business Workspace containing the exact Anchor/Loom Role artifacts used read-only for Role holder-assignment qualification.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only Role authority source; no Business mutation is delegated.
  - Availability: available

## Reference Context

- prior-qualification
  - Material: prior Holder And Source Authority Grounding Introspection qualification Evidence.
  - Material Reference: [Holder And Source Authority Grounding Introspection Qualification](../evidence/004-holder-and-source-authority-grounding-introspection-qualification.trace.md)
  - Purpose: exact implementation baseline and non-broadening constraints.
  - Availability: available

## Retained Responsibilities

- semantic-contract
  - Retained By: Anchor / Axiom
  - Responsibility: semantic holder/source authority interpretation remains fixed by the accepted reconciliation.
  - Boundary: Loom implements the accepted gate and does not invent new assignment semantics.

- business-integration
  - Retained By: Anchor
  - Responsibility: integrate the return into Full Recovery and run/disposition one focused fresh-Anchor validation.
  - Boundary: Loom does not mutate Business.

## Exclusions And Dependencies

- no-source-authority-reopen
  - Kind: excluded-scope
  - Description: do not reopen implementation-source authority semantics; preserve existing unresolved/pass-through diagnostics.
  - Responsible Party Or Role: Loom.

- no-durable-identity-fabrication
  - Kind: excluded-scope
  - Description: authorized bounded session Role binding does not establish durable holder identity.
  - Responsible Party Or Role: Loom / Anchor.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core implementation, regression Evidence and Loom-to-Anchor Handoff after holder-binding authorization is enforced without broadening Role/session identity.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Loom may change holder/source semantics, Business authority, product acceptance or wider orchestration readiness.
- Must Not Be Used To Claim: durable holder identity, participant/process authority or source mutation authority beyond qualified current-work artifacts.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [007-loom-to-anchor-holder-source-authority-introspection-return.trace.md](007-loom-to-anchor-holder-source-authority-introspection-return.trace.md)
  - Value: lT3b27gGFlUXZswM-MbSmjnb7jwhcBjhYPI42aMd0xI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: zGSYYcul6XtxA1R1n-lNXAqkFn-iMd7DS5GGXb0lTIg