# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 18:39:01
  - Trace: [019-canonical-holder-assignment-mode-normalization-mechanics.trace.md](../019-canonical-holder-assignment-mode-normalization-mechanics.trace.md)
  - Origin:
    - [relative](../019-canonical-holder-assignment-mode-normalization-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 18:39:01
  - Authors: Anchor
  - Why: Axiom supplies exact semantic authority and Loom return-material closure is now integrated enough for the implementation pass.
  - Summary: Delegate Core holder normalization from Axiom canonical Assignment Modes semantics.
  - Status: ready/local

---

# Anchor To Loom — Canonical Holder Assignment Mode Normalization Mechanics

## Handoff Parties

- Purpose: implement and qualify Axiom's accepted canonical Assignment Modes contract in Core so holder authorization is semantic-mode based rather than prose-whitelist based.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- canonical-holder-normalization
  - Transfer Kind: work-and-responsibility
  - Description: implement Canonical Holder Assignment Mode Normalization Mechanics and qualify the exact Role matrix, including the production Kodax explicit-session case.
  - Controlling Artifact: [Canonical Holder Assignment Mode Normalization Mechanics](../019-canonical-holder-assignment-mode-normalization-mechanics.trace.md)
  - Boundary: consume Axiom's exact semantic contract; do not infer modes from arbitrary Holder State prose.

## Required Context

- core-workspace
  - Material: current Core Workspace including qualified blocker-return/cache closure mechanics and all prior grounding/delegation hardening.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation and regression source.
  - Availability: available

- holder-semantic-decision
  - Material: Axiom Canonical Holder Assignment Mode Semantic Disposition.
  - Material Reference: [Canonical Holder Assignment Mode Semantic Disposition](docs::.topics/grounding/013-canonical-holder-assignment-mode-semantic-disposition.trace.md)
  - Purpose: exact semantic authority for canonical modes, legacy mappings, fail-closed rules and acceptance matrix.
  - Availability: available

- business-holder-task
  - Material: Business Canonical Holder Assignment Mode Normalization Task.
  - Material Reference: [Canonical Holder Assignment Mode Normalization](business::.topics/initiatives/001-2-7-5-1-2-canonical-holder-assignment-mode-normalization.trace.md)
  - Purpose: organizational scope and acceptance boundary.
  - Availability: available

## Reference Context

- reconciliation-decision
  - Material: Anchor reconciliation accepting Axiom semantics and Loom return-material closure as the implementation basis.
  - Material Reference: [Canonical Holder Semantics And Blocker-Return Closure Reconciliation](business::.topics/initiatives/001-2-7-5-1-4-holder-semantics-and-return-closure-reconciliation.trace.md)
  - Purpose: exact integration disposition and next-work authorization.
  - Availability: available

## Retained Responsibilities

- semantic-authority
  - Retained By: Axiom / Anchor
  - Responsibility: semantic meaning of Assignment Modes and any later Docs schema amendment remain outside Loom authority.
  - Boundary: Loom implements the accepted mapping/projection contract only.

- acceptance-and-recovery
  - Retained By: Anchor
  - Responsibility: Business acceptance, Full Recovery, fresh Anchor acceptance and production revalidation remain with Anchor.
  - Boundary: Loom does not declare the grounding front complete.

## Exclusions And Dependencies

- no-prose-parser
  - Kind: excluded-scope
  - Description: no whole-sentence whitelist, keyword/substr/fuzzy/embedding/LLM prose interpretation as positive assignment authority.
  - Responsible Party Or Role: Loom.

- no-role-rewrite
  - Kind: excluded-scope
  - Description: do not rewrite Kodax or other historical Role prose merely to satisfy Core.
  - Responsible Party Or Role: Loom.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core implementation, evidence for the exact holder acceptance matrix, distribution qualification and one Loom-to-Anchor Handoff.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: session assertion establishes durable holder identity or any participant/process/delegation/source/acceptance authority.
- Must Not Be Treated As: authority to change Docs semantics or Business state.
- Authority Limits: Core holder normalization and qualification only.
- Must Not Be Used To Claim: end-to-end delegation acceptance until Anchor reconciles the return and reruns the fresh acceptance chain.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [019-canonical-holder-assignment-mode-normalization-mechanics.trace.md](../019-canonical-holder-assignment-mode-normalization-mechanics.trace.md)
  - Value: c4Gl6eT5Vbms3L1I0LqUf5nKtBuXehygtZNxbwYwXZk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8Zea_R7kP7N1f6yY6-rnxz0GSqd2bHmEu_TriOYZ7Ls