# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 17:31:30
  - Trace: [004-holder-and-source-authority-grounding-introspection-task.trace.md](../004-holder-and-source-authority-grounding-introspection-task.trace.md)
  - Origin:
    - [relative](../004-holder-and-source-authority-grounding-introspection-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-14 17:31:30
  - Authors: Anchor
  - Why: Core should expose exact provenance/unresolved state without inventing the semantic contract under review by Axiom.
  - Summary: Delegate Test 2 holder/source authority diagnostics to Loom in parallel with Axiom semantics.
  - Status: ready/local

---

# Anchor To Loom — Holder And Source Authority Grounding Introspection

## Handoff Parties

- Purpose: harden Core diagnostics for the two remaining authority ambiguities exposed by bounded Test 2 while Axiom reviews the semantic contract in parallel.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- holder-source-authority-introspection
  - Transfer Kind: work-and-responsibility
  - Description: implement semantics-neutral provenance/diagnostic mechanics and adversarial tests for holder binding and implementation-source authority ambiguity.
  - Controlling Artifact: [Holder And Source Authority Grounding Introspection](../004-holder-and-source-authority-grounding-introspection-task.trace.md)
  - Boundary: Core may expose qualified facts/unresolved state but must not invent semantic assignment or source-authority rules.

## Required Context

- core-workspace
  - Material: current integrated Core Workspace including bounded Workspace grounding readiness, prior introspection mechanics and this Task/Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation and regression basis.
  - Availability: available

- business-workspace
  - Material: current Business Workspace containing the controlling grounding Epic and Test 2 diagnostic disposition.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only organizational/test evidence; only Anchor mutates Business.
  - Availability: available

## Reference Context

- bounded-readiness-evidence
  - Material: qualified bounded Workspace grounding readiness evidence.
  - Material Reference: [Bounded Workspace Grounding Readiness Qualification](../evidence/003-bounded-workspace-grounding-readiness-qualification.trace.md)
  - Purpose: preserve the accepted bounded/complete distinction and regression basis.
  - Availability: available

## Retained Responsibilities

- semantic-contract
  - Retained By: Axiom / Anchor
  - Responsibility: define and integrate any new holder/source authority semantics.
  - Boundary: Loom must return unresolved semantic dependencies rather than invent them.

- business-integration
  - Retained By: Anchor
  - Responsibility: reconcile Axiom/Loom returns and update Business/recovery.
  - Boundary: Core return alone does not change organizational authority.

## Exclusions And Dependencies

- no-business-docs-mutation
  - Kind: excluded-scope
  - Description: Business and Docs remain read-only context for Loom.
  - Responsible Party Or Role: Loom.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core diagnostics/tests/evidence and any exact semantic dependency still requiring Axiom/Anchor disposition.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Tooling may infer holder identity, participant relevance, process applicability or source-creation authority.
- Must Not Be Used To Claim: whole-program readiness or product/source authority beyond qualified controlling material.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-holder-and-source-authority-grounding-introspection-task.trace.md](../004-holder-and-source-authority-grounding-introspection-task.trace.md)
  - Value: yMPL5IYK-rXwPlRxiTDpNDtAcrGweEjB20GBWKxn9KA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Nm_jfSNv0p760i06Yq7_GiRFKZJYY6LQMVni21rjL9Y