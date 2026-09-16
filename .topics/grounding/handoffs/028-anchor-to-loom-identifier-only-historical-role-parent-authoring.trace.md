# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 21:59:50
  - Trace: [022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Origin:
    - [relative](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 22:00:35
  - Authors: Anchor
  - Why: Axiom accepted the generic semantic rule and the remaining Anchor/Prism migration is blocked only on Core preserving identifier-only historical schema authority correctly.
  - Summary: Delegate the narrow Core correction for identifier-only historical Role Parent continuation under the canonical holder hard cutover.
  - Status: ready/local

---

# Anchor To Loom — Identifier-Only Historical Role Parent Authoring Correction

## Handoff Parties

- Purpose: implement Axiom's accepted identifier-only historical Role Parent continuation rule in Core so the remaining active Anchor and Prism Role migrations can proceed by ordinary qualified authoring without rewriting historical bytes or inferring an exact historical schema revision.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md)

## Transfers

- identifier-only-parent-authoring-correction
  - Transfer Kind: work-and-responsibility
  - Description: implement the generic common-author/reference-authority correction defined by Axiom for exact historical Role Parents whose own `Current Schema` declares only the Role schema identifier and no exact historical target.
  - Controlling Artifact: [Identifier-Only Historical Role Parent Authoring Correction Mechanics](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Boundary: preserve identifier-only historical provenance as identifier-only; do not substitute today's canonical Role schema target or infer historical revision equality.

- real-anchor-prism-regressions
  - Transfer Kind: work-and-responsibility
  - Description: qualify the exact active Anchor and Prism historical Parent cases and adversarially prove the behavior depends on reference-authority state rather than Role label, filename, repository placement or current schema availability.
  - Controlling Artifact: [Identifier-Only Historical Role Parent Authoring Correction Mechanics](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Boundary: fixtures/evidence do not become current Role authority and no Business Role mutation is delegated to Loom.

## Required Context

- core-workspace
  - Material: current integrated Core Workspace containing the prior historical-parent audit split and holder-cutover mechanics.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation basis for this narrow Core correction.
  - Availability: available

- business-coordination-task
  - Material: Business Task coordinating the identifier-only historical Role Parent authoring correction.
  - Material Reference: [Identifier-Only Historical Role Parent Authoring Correction](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-identifier-only-historical-role-parent-authoring-correction.trace.md)
  - Purpose: read-only organizational scope and retained migration boundary.
  - Availability: available

- axiom-semantic-decision
  - Material: accepted Axiom semantic disposition for identifier-only historical Role Parent continuation.
  - Material Reference: [Identifier-Only Historical Role Parent Cutover Semantic Disposition](docs::.topics/grounding/017-identifier-only-historical-role-parent-cutover-semantic-disposit.trace.md)
  - Purpose: semantic authority for the exact historical/reference split and fail-closed contract.
  - Availability: available

- current-role-schema
  - Material: exact current canonical `tiinex.party.role.v1` schema carrying direct Assignment Modes.
  - Material Reference: [Current Party Role Schema](docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: exact current child validation authority; never substitute this as historical Parent provenance.
  - Availability: available

- active-anchor-parent
  - Material: exact active pre-migration Anchor Role Parent with identifier-only historical `Current Schema`.
  - Material Reference: [Active Anchor Historical Role](business::.topics/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.trace.md)
  - Purpose: read-only exact real migration regression Parent.
  - Availability: available

- active-prism-parent
  - Material: exact active pre-migration Prism Role Parent with identifier-only historical `Current Schema`.
  - Material Reference: [Active Prism Historical Role](business::.topics/roles/001-8-1-prism-role.trace.md)
  - Purpose: read-only second real migration regression proving generic behavior.
  - Availability: available

## Reference Context

- prior-parent-audit-correction
  - Material: Loom's qualified prior correction that separated historical Parent audit from current child validation when exact same-revision authority is absent.
  - Material Reference: [Pre-Migration Role Parent Audit Cutover Correction Qualification](../evidence/015-pre-migration-role-parent-audit-cutover-correction-qualification.trace.md)
  - Purpose: existing mechanics to reuse rather than introducing another compatibility path.
  - Availability: available

## Retained Responsibilities

- business-role-migration
  - Retained By: Anchor
  - Responsibility: author and qualify the remaining active Anchor and Prism canonical Role continuations after Loom returns the Core correction, then reconcile the complete active Role migration set.
  - Boundary: Loom does not mutate Business or declare migration completeness.

- semantic-role-schema-ownership
  - Retained By: Axiom / Docs
  - Responsibility: retain semantic ownership of the Role schema, Assignment Modes, and identifier-only historical Parent rule.
  - Boundary: Loom implements host-neutral mechanics only and must not invent alternate semantics.

- legacy-removal-gate
  - Retained By: Anchor
  - Responsibility: authorize final removal of `LEGACY_ROLE_MAPPINGS` only after the complete active Role migration is qualified.
  - Boundary: this Handoff does not authorize early legacy-positive removal or extension.

## Exclusions And Dependencies

- no-history-rewrite
  - Kind: excluded-scope
  - Description: historical Role bytes, schema declarations and integrity evidence remain immutable.
  - Responsible Party Or Role: Core preserves exact historical evidence boundaries.

- no-schema-revision-inference
  - Kind: excluded-scope
  - Description: today's canonical Role schema target must not be used to upgrade an identifier-only historical Parent into exact-revision authority.
  - Responsible Party Or Role: Loom / Core.

- final-legacy-removal
  - Kind: unresolved-dependency
  - Description: `LEGACY_ROLE_MAPPINGS` remains until Anchor qualifies the complete active Role migration after this correction returns.
  - Responsible Party Or Role: Anchor.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: qualified Core identifier-only historical Parent authoring correction, real Anchor/Prism regression evidence, full Core/distribution qualification and one Loom-to-Anchor return carrier are available for Anchor migration reconciliation.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Anchor or Prism are already migrated, historical schema revision is known, or legacy holder support may already be removed.
- Must Not Be Used To Claim: durable holder identity, participant relevance, broader delegation authority, Business acceptance, remote-write authority, release or publication.
- Authority Limits: exact host-neutral Core author/reference mechanics under the controlling Task and Axiom semantic disposition.
- Must Not Be Treated As: permission to rewrite historical Role artifacts, add Role-name exceptions, parse Holder State prose, branch around the latest active Role, or create a second current Role representation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Value: 3I0XukSWhSHgiF6BEzyDK59l3STRjxSh9nEB95HLTOk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 35P3k06Z5AUu4Gli541O6GpFivJbCTXiICPMrtNr9g4