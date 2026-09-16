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
  - Created At: 2026-09-15 21:12:32
  - Authors: Loom
  - Why: Return final Task 021 implementation and qualification to Anchor.
  - Summary: Return qualified Core historical Parent audit correction with exact real Axiom regression and strict current Assignment Modes validation.
  - Status: ready/local

---

# Loom To Anchor — Pre-Migration Role Parent Audit Cutover Correction Return

## Handoff Parties

- Purpose: return the qualified Core correction that allows ordinary current Role authoring from an exact historical pre-migration Role Parent without revalidating those historical bytes as the amended current Role revision, while preserving strict direct Assignment Modes validation for the new candidate.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- historical-parent-audit-correction
  - Transfer Kind: work-and-responsibility
  - Description: common `author` now audits current candidate and historical Parent separately. Historical Parent Root/schema-reference/integrity validation remains active, while current schema-specific machine/companion validation is applied to the Parent only when exact same-revision authority is qualified.
  - Controlling Artifact: [Pre-Migration Role Parent Audit Cutover Correction Qualification](../evidence/015-pre-migration-role-parent-audit-cutover-correction-qualification.trace.md)
  - Boundary: no historical byte rewrite, blanket audit suppression, Axiom/Role label special case, prose interpretation or dual current authority.

- exact-real-parent-regression
  - Transfer Kind: work-and-responsibility
  - Description: Core now carries a deterministic regression using the exact 4803-byte pre-migration Business Axiom Role parent with SHA-256 `f17e74db07c6a2d1288119c330a20b3b19cd0eb01f6a2c9f207d21102d9488d5`; ordinary cross-Workspace continuation qualifies while a tampered Parent fails closed.
  - Controlling Artifact: [Pre-Migration Role Parent Audit Cutover Correction Qualification](../evidence/015-pre-migration-role-parent-audit-cutover-correction-qualification.trace.md)
  - Boundary: fixture bytes are historical evidence for deterministic testing only and do not become current positive Role or holder authority.

- current-role-validation-preserved
  - Transfer Kind: work-and-responsibility
  - Description: newly authored `tiinex.party.role.v1` candidates continue to use the amended current schema and direct canonical `Assignment Modes`; missing or invalid modes remain blocking and invalid candidates are not retained.
  - Controlling Artifact: [Pre-Migration Role Parent Audit Cutover Correction Qualification](../evidence/015-pre-migration-role-parent-audit-cutover-correction-qualification.trace.md)
  - Boundary: historical Parent qualification cannot substitute for current candidate schema authority or weaken current Role validation.

## Required Context

- core-workspace
  - Material: current integrated Core Workspace containing the historical-parent audit correction, exact Axiom fixture, tests, Evidence and this return Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation basis for Anchor reconciliation and fresh acceptance.
  - Availability: available

- business-correction-task
  - Material: Business Pre-Migration Role Parent Audit Cutover Correction Task carried unchanged from the qualified parent carrier.
  - Material Reference: [Pre-Migration Role Parent Audit Cutover Correction](business::.topics/initiatives/001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md)
  - Purpose: read-only organizational authority and exact correction scope.
  - Availability: available

- exact-pre-migration-axiom-role
  - Material: genuine active pre-migration Axiom Role whose exact body has no direct Assignment Modes.
  - Material Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)
  - Purpose: read-only exact historical regression Parent and acceptance identity.
  - Availability: available

- holder-hard-cutover-decision
  - Material: Axiom Canonical Holder Assignment Mode Hard Cutover Semantic Disposition supplied unchanged from the qualified parent carrier.
  - Material Reference: [Canonical Holder Assignment Mode Hard Cutover Semantic Disposition](docs::.topics/grounding/015-canonical-holder-assignment-mode-hard-cutover-semantic-dispositi.trace.md)
  - Purpose: read-only semantic authority for historical auditability, direct current Assignment Modes and the no-dual-authority boundary.
  - Availability: available

- current-role-schema
  - Material: exact current Axiom-amended `tiinex.party.role.v1` schema source supplied unchanged from the qualified parent carrier.
  - Material Reference: [Current Party Role Schema](docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: read-only exact current candidate creation/validation contract.
  - Availability: available

## Reference Context

- qualification-evidence
  - Material: Loom qualification Evidence for the real pre-migration Parent correction and full Core/distribution regressions.
  - Material Reference: [Pre-Migration Role Parent Audit Cutover Correction Qualification](../evidence/015-pre-migration-role-parent-audit-cutover-correction-qualification.trace.md)
  - Purpose: exact implementation proof, adversarial cases and interpretation limits.
  - Availability: available

- controlling-task
  - Material: delegated Core Task defining the correction objective, done criteria, scope and dependencies.
  - Material Reference: [Pre-Migration Role Parent Audit Cutover Correction Mechanics](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Purpose: exact delegated authority for Loom's Core changes.
  - Availability: available

## Retained Responsibilities

- active-role-migration-and-legacy-removal
  - Retained By: Anchor / Axiom / Business as appropriate
  - Responsibility: complete the qualified active Role migration and make the later explicit disposition for removal of `LEGACY_ROLE_MAPPINGS`.
  - Boundary: Task 021 explicitly keeps the mapping in place and does not claim migration completion.

- semantic-role-schema-ownership
  - Retained By: Axiom / Docs
  - Responsibility: retain semantic ownership of the Role schema, canonical Assignment Modes and future schema amendments.
  - Boundary: Loom changes Core validation/audit mechanics only and does not invent alternate Role semantics.

- integration-and-fresh-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile returned Core source and rerun the real Business Axiom migration/acceptance path.
  - Boundary: Loom does not mutate Business/Docs or declare Business acceptance on Anchor's behalf.

## Exclusions And Dependencies

- no-historical-parent-rewrite
  - Kind: excluded-scope
  - Description: historical Role artifacts, their body shape and declared historical schema provenance are preserved; this correction does not migrate old bytes in place.
  - Responsible Party Or Role: Core preserves exact historical evidence boundaries.

- no-current-validation-downgrade
  - Kind: excluded-scope
  - Description: current Role candidates still require direct canonical Assignment Modes and the amended current schema contract.
  - Responsible Party Or Role: Core / Axiom semantic contract.

- legacy-mapping-final-removal
  - Kind: unresolved-dependency
  - Description: removal of `LEGACY_ROLE_MAPPINGS` remains deferred until Anchor qualifies the complete active Role migration under the accepted hard-cutover disposition.
  - Responsible Party Or Role: Anchor / Axiom / Business as appropriate.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: qualified Core historical-Parent audit correction, exact real Axiom regression evidence, strict current Assignment Modes preservation and one Loom-to-Anchor carrier are returned for Anchor reconciliation and fresh Business migration acceptance.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: every historical or active Role is a valid current Role candidate or has already been migrated to direct Assignment Modes.
- Must Not Be Used To Claim: durable holder identity, participant relevance, process applicability, delegation authority, implementation-source permission, Business acceptance, remote-write authority, release or publication.
- Authority Limits: exact host-neutral Core common-author/audit mechanics and deterministic qualification only; Axiom/Docs retain semantic ownership and Anchor retains integration/acceptance.
- Must Not Be Treated As: permission to rewrite historical Role bytes, bypass Parent integrity/schema-reference validation, accept old Holder State prose as current Assignment Modes, or remove legacy mappings before retained migration disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Value: Oy7kXsMJ4Y2pSZJA2M4T0vufgpRDY562sGeNQHyEaII

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5Z3_m9kfFInzifB1EOgvUeAFgvSeE7-7kqWYgiV6mHg