# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 11:53:14
  - Trace: [009-bounded-participant-role-cache-transport-mechanics.trace.md](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
  - Origin:
    - [relative](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 11:53:24
  - Authors: Anchor
  - Why: The exact blank/minimal delegation acceptance carrier is blocked only by Core cache-over-expansion when carrying a non-endpoint grounding Role.
  - Summary: Delegate the narrow real-carrier Role-cache over-expansion fix to Loom.
  - Status: ready/local

---

# Anchor To Loom — Bounded Participant Role Cache Transport Mechanics

## Handoff Parties

- Purpose: delegate the narrow Core package/cache fix required for the real blank-Workspace qualified-delegation acceptance carrier.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- bounded-role-cache-transport-mechanics
  - Transfer Kind: work-and-responsibility
  - Description: reproduce and fix the real-carrier `cache-over-expansion` path when a bounded/minimal Workspace package explicitly requests a non-endpoint Role as grounding-only cache material.
  - Controlling Artifact: [Bounded Participant Role Cache Transport Mechanics](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
  - Boundary: preserve existing Role/participant/process/delegation semantics; this is transport/cache mechanics only.

## Required Context

- core-workspace
  - Material: current Core Workspace with accepted blank/minimal Workspace cache, holder/source authority, qualified delegation mechanics and machine-derived allocation.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation/regression basis.
  - Availability: available

- business-cache-transport-task
  - Material: controlling Business acceptance blocker Task.
  - Material Reference: [Blank-Workspace Participant Role Cache Transport Qualification](business::.topics/initiatives/001-2-7-5-1-1-blank-workspace-participant-role-cache-transport-qualification.trace.md)
  - Purpose: organizational root and exact acceptance boundary.
  - Availability: available

## Reference Context

- qualified-delegation-acceptance
  - Material: fresh Anchor acceptance Task whose real carrier exposed the cache-over-expansion defect.
  - Material Reference: [Blank-Workspace Qualified Delegation Acceptance](business::.topics/initiatives/001-2-7-5-1-blank-workspace-qualified-delegation-acceptance.trace.md)
  - Purpose: preserve the intended bounded acceptance shape without exposing evaluator semantics to the eventual test recipient.
  - Availability: available

## Retained Responsibilities

- semantic-disposition
  - Retained By: Axiom / Anchor
  - Responsibility: Role/cache/participant/delegation semantic meaning remains outside Loom authority.
  - Boundary: Loom may change package/cache mechanics and diagnostics only.

- business-and-test-integration
  - Retained By: Anchor
  - Responsibility: Business mutation, acceptance-carrier construction, fresh-Anchor evaluation and Full Recovery.
  - Boundary: Loom performs no Business or Docs mutation.

## Exclusions And Dependencies

- no-semantic-promotion
  - Kind: excluded-scope
  - Description: carrying a Role in cache must not establish semantic participation, current-work relevance, delegate selection, process applicability, holder identity or source authority.
  - Responsible Party Or Role: Core.

- no-full-workspace-workaround
  - Kind: excluded-scope
  - Description: do not solve the acceptance by silently carrying a complete repository snapshot instead of the bounded/blank Workspace representation.
  - Responsible Party Or Role: Core.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one qualified Loom-to-Anchor Handoff with the Core implementation/evidence and any exact remaining blocker.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Role cache presence is semantic participation or delegate authority.
- Must Not Be Treated As: permission to broaden Workspace source scope or to modify Business/Docs semantics.
- Authority Limits: Core package/cache mechanics and diagnostics only.
- Must Not Be Used To Claim: the fresh-Anchor delegation acceptance passed until Anchor rebuilds and runs the bounded acceptance carrier.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-bounded-participant-role-cache-transport-mechanics.trace.md](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
  - Value: tfsG82wvqUr1FTAOq0DC4JuCX3gNadpGE_DCZkL-54k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: rMqYuE-PuG07tC7ddAjnxtTavHKB34ZDzFPFKT9PyNg