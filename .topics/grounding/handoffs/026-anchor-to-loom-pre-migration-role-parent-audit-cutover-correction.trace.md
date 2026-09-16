# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:52:45
  - Trace: [021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Origin:
    - [relative](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 20:53:54
  - Authors: Anchor
  - Why: The first real canonical Role migration still blocks because the historical parent is re-audited under the current Role contract even though the new candidate itself stages cleanly.
  - Summary: Delegate the remaining common-authoring correction exposed by the genuine pre-migration Axiom Role parent.
  - Status: ready/local

---

# Anchor To Loom — Pre-Migration Role Parent Audit Cutover Correction

## Handoff Parties

- Purpose: correct the remaining canonical Role migration defect so ordinary authoring can use genuine pre-migration Role bodies as exact historical Parents without reinterpreting those old bytes as current operational Roles under the amended schema.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- historical-parent-audit-correction
  - Transfer Kind: work-and-responsibility
  - Description: reproduce and repair the common-authoring/audit path that currently stages a valid canonical Role continuation but blocks overall authoring because the genuine pre-migration Parent is revalidated as a current Role and reports missing Assignment Modes.
  - Controlling Artifact: [Pre-Migration Role Parent Audit Cutover Correction Mechanics](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Boundary: preserve exact historical Parent bytes/provenance and strict current-candidate validation; do not solve by editing the parent, skipping all parent validation, adding Role special cases, or restoring dual current authority.

## Required Context

- core-workspace
  - Material: current Core Workspace returned from Task 020, including canonical Role schema packaging, common-author changes, current tests and temporary legacy holder bridge.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation and regression basis.
  - Availability: available

- business-correction-task
  - Material: Business Pre-Migration Role Parent Audit Cutover Correction Task.
  - Material Reference: [Pre-Migration Role Parent Audit Cutover Correction](business::.topics/initiatives/001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md)
  - Purpose: organizational authority and exact correction scope.
  - Availability: available

- exact-pre-migration-axiom-role
  - Material: genuine active pre-migration Axiom Role whose body has no Assignment Modes.
  - Material Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)
  - Purpose: exact regression parent; the previous synthetic fixture did not exercise this body shape.
  - Availability: available

- holder-hard-cutover-decision
  - Material: Axiom Canonical Holder Assignment Mode Hard Cutover Semantic Disposition.
  - Material Reference: [Canonical Holder Assignment Mode Hard Cutover Semantic Disposition](docs::.topics/grounding/015-canonical-holder-assignment-mode-hard-cutover-semantic-dispositi.trace.md)
  - Purpose: semantic authority for historical auditability, direct current Assignment Modes and the no-dual-authority cutover.
  - Availability: available

- current-role-schema
  - Material: amended canonical `tiinex.party.role.v1` schema source.
  - Material Reference: [Party Role Schema](docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: exact current candidate creation/validation contract.
  - Availability: available

## Reference Context

- prior-cutover-qualification
  - Material: Loom Canonical Role Authoring And Schema Packaging Cutover Qualification.
  - Material Reference: [Canonical Role Authoring And Schema Packaging Cutover Qualification](../evidence/014-canonical-role-authoring-and-schema-packaging-cutover-qualificat.trace.md)
  - Purpose: prior implementation evidence and the regression gap to correct.
  - Availability: available

## Retained Responsibilities

- business-role-migration
  - Retained By: Anchor
  - Responsibility: after the correction returns, author and qualify the complete active Business Role migration and declare exact post-migration digests.
  - Boundary: Loom does not infer Business Role-set completeness or mutate Business Roles.

- final-legacy-removal
  - Retained By: Anchor / Loom after qualified migration
  - Responsibility: remove `LEGACY_ROLE_MAPPINGS` and legacy-positive current authorization only after Anchor provides the qualified complete migration disposition.
  - Boundary: this correction must not remove the bridge prematurely or justify keeping it permanently.

## Exclusions And Dependencies

- no-historical-rewrite
  - Kind: excluded-scope
  - Description: do not add Assignment Modes to historical Role bytes in place or rewrite historical schema locators.
  - Responsible Party Or Role: Loom.

- no-current-validation-weakening
  - Kind: excluded-scope
  - Description: current Role continuations remain subject to the amended canonical Assignment Modes contract and fail closed when modes are missing or invalid.
  - Responsible Party Or Role: Loom.

- migration-gate
  - Kind: unresolved-dependency
  - Description: final canonical-only runtime cleanup still depends on Anchor's later qualified complete active Business Role migration disposition.
  - Responsible Party Or Role: Anchor.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core correction and regression evidence proving ordinary authoring succeeds from a genuine pre-migration Role parent while strict current Assignment Modes validation remains intact.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the active Business Role migration or final legacy removal is complete.
- Must Not Be Treated As: authority to rewrite historical Role bytes, weaken current Role validation, retain a second current holder-authority representation, or infer Role-set completeness.
- Authority Limits: Core common-authoring/audit mechanics for historical Parent/current candidate separation only.
- Must Not Be Used To Claim: end-to-end delegation acceptance until Role migration, legacy removal, fresh specialist execution and Anchor reconciliation all qualify.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Value: Oy7kXsMJ4Y2pSZJA2M4T0vufgpRDY562sGeNQHyEaII

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qZrV0sHY8Snz_x4rbj6c5XqluTvI-Dzv77pJpw3yGx4