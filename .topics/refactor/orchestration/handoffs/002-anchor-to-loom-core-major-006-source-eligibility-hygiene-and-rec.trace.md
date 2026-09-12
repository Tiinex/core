# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:48:46
  - Trace: [002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md](../002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Origin:
    - [relative](../002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:50:12
  - Authors: Anchor
  - Why: The new proof gate is correct about byte preservation but current source eligibility wrongly elevates generated Python cache state into mandatory durable source.
  - Summary: Delegate the generated-source eligibility blind spot exposed by real Core Major 005 reconciliation dogfood to Loom.
  - Status: ready/local

---

# Anchor To Loom — Core Major 006 Source Eligibility Hygiene And Reconciliation Parity

## Handoff Parties

- Purpose: repair the generated-source eligibility blind spot revealed while dogfooding Core Major 005 against the real Site return, so reconciliation and manufacture use one truthful durable-source boundary without granting Tooling semantic deletion authority.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- source-eligibility-repair
  - Transfer Kind: work-and-responsibility
  - Description: implement one shared source-eligibility/exclusion boundary for generated Python cache/bytecode state across manufacture and source-frontier/reconciliation mechanics where they claim the same durable source identity.
  - Controlling Artifact: [Core Major 006 Task](../002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Boundary: do not generalize into arbitrary automatic deletion or repository-specific policy.

- reconciliation-dogfood-proof
  - Transfer Kind: work-and-responsibility
  - Description: qualify the repair against the real Site Major 005 return failure shape so a source-correct candidate can omit the carried `__pycache__` bytecode while preserving every eligible incoming/current path and remaining manufacture-proof compatible.
  - Controlling Artifact: [Core Major 006 Task](../002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Boundary: historical carrier bytes remain exact evidence and are not rewritten.

## Required Context

- core-workspace
  - Material: complete current Core Workspace including accepted Major 005 reconciliation proof mechanics.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation/source owner.
  - Availability: available
- site-workspace
  - Material: complete current Site Workspace containing the returned Windows harness Evidence/Handoff and the generated-cache reproduction context.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: read-only real-world source-hygiene reproduction context.
  - Availability: available
- business-workspace
  - Material: current Business Workspace containing Anchor/Loom Role and reconciliation process authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint/process authority.
  - Availability: available
- docs-workspace
  - Material: current Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only semantic boundary; no Docs mutation is authorized.
  - Availability: available

## Reference Context

- prior-core-major-005-return
  - Material: accepted Core Major 005 reconciliation/manufacture proof-gate return.
  - Material Reference: [Core Major 005 Return](001-3-6-4-2-1-1-1-1-1-loom-to-anchor-core-major-005-reconciliation-and-manufacture-pro.trace.md)
  - Purpose: exact predecessor mechanics and proof contract being refined.
  - Availability: available
- site-generated-cache-reproduction
  - Material: current Site return containing the incoming-only generated Python cache path that blocks a sanitized reconciliation candidate.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: real dogfood reproduction for the source-eligibility mismatch.
  - Availability: available

## Retained Responsibilities

- semantic-source-disposition
  - Retained By: Anchor / owning repository role
  - Responsibility: decide whether ordinary eligible source is accepted, rejected, deleted or semantically reconciled.
  - Boundary: Core only owns generated-source eligibility mechanics.

## Exclusions And Dependencies

- arbitrary-source-deletion
  - Kind: excluded-scope
  - Description: do not infer that arbitrary temporary-looking source names are disposable; only qualified generic non-source runtime/cache state belongs to this Major.
- historical-package-rewrite
  - Kind: excluded-scope
  - Description: historical carriers containing generated bytes remain immutable evidence.
- remote-action
  - Kind: excluded-scope
  - Description: no push, publication, release or deployment is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns one qualified Core Major 006 result with the shared source-eligibility repair, real Site-return reconciliation regression, manufacture-proof compatibility, and full Core validation.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: Tooling decides semantic merge correctness, arbitrary files can be deleted automatically, historical carriers are rewritten, or source cleanliness equals product acceptance.
- Must Not Be Used To Claim: repository-owner authority, release readiness or permission to widen the Major silently.
- Authority Limits: Core host-neutral source-eligibility/reconciliation mechanics only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md](../002-core-major-006-source-eligibility-hygiene-and-reconciliation-par.trace.md)
  - Value: AygiR7DUogYhjpIy51_tsutLQZfhIFc3vXnf0n4ySQw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: VYj9YF1pKoCRKg_r21IoEM4TwUUeju59Vzc52jZYTkw