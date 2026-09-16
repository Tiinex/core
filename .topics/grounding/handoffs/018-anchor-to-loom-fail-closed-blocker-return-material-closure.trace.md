# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 17:27:50
  - Trace: [018-fail-closed-blocker-return-material-closure-mechanics.trace.md](../018-fail-closed-blocker-return-material-closure-mechanics.trace.md)
  - Origin:
    - [relative](../018-fail-closed-blocker-return-material-closure-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 17:27:51
  - Authors: Anchor
  - Why: A correctly fail-closed Anchor must be able to return its blocker without Sigma reconstructing transport state.
  - Summary: Delegate bounded-recipient blocker return material-closure mechanics to Loom.
  - Status: ready/local

---

# Anchor To Loom — Fail-Closed Blocker Return Material Closure

## Handoff Parties

- Purpose: make a correctly blocked bounded recipient able to return its qualified blocker carrier without inventing semantic authority or depending on Sigma transport reconstruction.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- blocker-return-material-closure
  - Transfer Kind: work-and-responsibility
  - Description: reproduce, diagnose and fix canonical blocker-return endpoint/dependency material closure for bounded/blank recipients.
  - Controlling Artifact: [Fail-Closed Blocker Return Material Closure Mechanics](../018-fail-closed-blocker-return-material-closure-mechanics.trace.md)
  - Boundary: mechanical closure only; semantic blockers remain semantically blocking.

## Required Context

- core-workspace
  - Material: current Core Workspace including real-carrier bounded Role-cache fix, qualified delegation mechanics and machine-derived allocation.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation/regression basis.
  - Availability: available

- business-return-task
  - Material: controlling Business fail-closed blocker-return Task.
  - Material Reference: [Fail-Closed Blocker Return Material Closure](business::.topics/initiatives/001-2-7-5-1-3-fail-closed-blocker-return-material-closure.trace.md)
  - Purpose: organizational lineage and exact acceptance boundary.
  - Availability: available

## Reference Context

- delegation-acceptance
  - Material: current blank/minimal Workspace delegation acceptance state and observed Anchor-008 blocker return failure.
  - Material Reference: [Blank-Workspace Qualified Delegation Acceptance](business::.topics/initiatives/001-2-7-5-1-blank-workspace-qualified-delegation-acceptance.trace.md)
  - Purpose: concrete real-carrier reproduction target.
  - Availability: available

## Retained Responsibilities

- semantic-authority
  - Retained By: Axiom / Anchor
  - Responsibility: holder/delegation/source/process semantic meaning remains outside Loom authority.
  - Boundary: Loom resolves mechanics/provenance only.

- business-integration
  - Retained By: Anchor
  - Responsibility: reconcile Loom return and stage the next recovery/acceptance run.
  - Boundary: Loom does not mutate Business.

## Exclusions And Dependencies

- no-authority-synthesis
  - Kind: excluded-scope
  - Description: mechanical dependency resolution must not convert a semantic blocker into delegation/source/holder authority.
  - Responsible Party Or Role: Loom.

- no-repository-archaeology
  - Kind: excluded-scope
  - Description: do not search undeclared repositories/connectors/networks to make return transport close.
  - Responsible Party Or Role: Loom.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core implementation/evidence and Loom-to-Anchor Handoff proving or precisely blocking fail-closed return material closure.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the original delegation blockers are semantically resolved.
- Must Not Be Treated As: permission to widen source scope or infer endpoint authority.
- Must Not Be Used To Claim: fresh delegation acceptance passed before the next end-to-end run.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [018-fail-closed-blocker-return-material-closure-mechanics.trace.md](../018-fail-closed-blocker-return-material-closure-mechanics.trace.md)
  - Value: EPp0xLwkQ-00RkGMLjm09WlvCofvzLF5utXBesTChSE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Yy8JSkmRJaaYR5z_UYH47D-_lnE7RHkNVj7d1q2mffM