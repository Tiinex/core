# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 22:43:26
  - Trace: [023-canonical-holder-legacy-removal-mechanics.trace.md](../023-canonical-holder-legacy-removal-mechanics.trace.md)
  - Origin:
    - [relative](../023-canonical-holder-legacy-removal-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 22:43:53
  - Authors: Anchor
  - Summary: Delegate final removal of temporary legacy-positive holder authorization after the complete active Role migration.
  - Status: ready/local

---

# Anchor To Loom — Canonical Holder Legacy Removal

## Handoff Parties

- Purpose: complete the canonical holder hard cutover by removing temporary legacy-positive holder authorization from Core after Anchor qualified the complete active Role migration.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- canonical-only-holder-runtime
  - Transfer Kind: work-and-responsibility
  - Description: remove `LEGACY_ROLE_MAPPINGS` and equivalent legacy-positive holder authorization so current binding authority comes only from direct canonical Assignment Modes on qualified current Role material.
  - Controlling Artifact: [Canonical Holder Legacy Removal Mechanics](../023-canonical-holder-legacy-removal-mechanics.trace.md)
  - Boundary: no new holder semantics, Role-specific production branches, prose parsing or executor-specific compatibility.

- legacy-negative-regression-boundary
  - Transfer Kind: work-and-responsibility
  - Description: preserve immutable historical Roles as evidence while making pre-cutover legacy Role material non-authoritative for current holder binding after cutover.
  - Controlling Artifact: [Canonical Holder Active Role Migration Disposition](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-1-canonical-holder-active-role-migration-disposition.trace.md)
  - Boundary: history is preserved; only current runtime authorization changes.

## Required Context

- core-workspace
  - Material: current integrated Core Workspace containing canonical holder mechanics, historical-Parent authoring corrections and the cleanup Task.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation basis.
  - Availability: available

- business-cleanup-task
  - Material: Business Task authorizing final canonical holder legacy removal after complete active Role migration.
  - Material Reference: [Canonical Holder Legacy Removal And Cutover Completion](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md)
  - Purpose: exact organizational scope and done criteria.
  - Availability: available

- business-migration-disposition
  - Material: accepted complete active Role migration disposition with exact canonical Role identities and digests.
  - Material Reference: [Canonical Holder Active Role Migration Disposition](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-1-canonical-holder-active-role-migration-disposition.trace.md)
  - Purpose: exact migration-completion authority and legacy-removal gate.
  - Availability: available

## Reference Context

- prior-correction-task
  - Material: prior Core Task that qualified identifier-only historical Role Parent continuation.
  - Material Reference: [Identifier-Only Historical Role Parent Authoring Correction Mechanics](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Purpose: preserve the historical provenance boundary while cleanup removes compatibility authorization.
  - Availability: available

## Retained Responsibilities

- business-and-role-authority
  - Retained By: Anchor
  - Responsibility: retain Business mutation, active Role-set acceptance, fresh-role acceptance orchestration and final recovery.
  - Boundary: Loom must not mutate Business or declare end-to-end delegation acceptance.

- holder-semantics
  - Retained By: Axiom / Docs
  - Responsibility: retain semantic ownership of the canonical Role holder-assignment contract.
  - Boundary: Loom removes temporary runtime compatibility only; it does not create a new semantic mode or alternate Role representation.

- human-gates
  - Retained By: Sigma
  - Responsibility: remain the retained human transport/acceptance gate where explicitly declared by controlling work.
  - Boundary: this cleanup does not convert runtime technical qualification into human product acceptance.

## Exclusions And Dependencies

- no-new-compatibility-layer
  - Kind: excluded-scope
  - Description: do not replace legacy mappings with prose parsing, fuzzy normalization, Role-name/path exceptions, provider-specific rules or a second compatibility registry.
  - Responsible Party Or Role: Loom.

- no-history-rewrite
  - Kind: excluded-scope
  - Description: preserve historical Role artifacts and provenance exactly; obsolete does not mean mutable.
  - Responsible Party Or Role: Loom / Anchor.

- no-unrelated-hardening
  - Kind: excluded-scope
  - Description: delegation predicates, process discovery, source-authority ergonomics, grounding receipts and authoring UX remain outside this cleanup.
  - Responsible Party Or Role: Anchor.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: canonical-only holder authorization is qualified in Core, legacy-positive runtime support is removed, canonical and negative legacy regressions are green, and one Loom-to-Anchor return carrier is available for reconciliation.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: end-to-end specialist delegation has passed, holder identity is durable, every historical carrier is current-compatible, or product acceptance is granted.
- Must Not Be Used To Claim: participant relevance, process applicability, implementation-source authority, release/publication authority or Sigma acceptance.
- Authority Limits: exact Core cleanup under Task 023 and the accepted Business migration disposition.
- Must Not Be Treated As: authorization for a new holder model, a legacy migration extension, a history rewrite, or broad Tooling refactor.

---

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-canonical-holder-legacy-removal-mechanics.trace.md](../023-canonical-holder-legacy-removal-mechanics.trace.md)
  - Value: CwaNvK8RitWUUPgjgjNZXv2FtjdkrncitheKjFNOJlI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 1N6083zUgiToY9PwYijByxU-0LhWdbMxmwn-LjnslKw