# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:09:36
  - Trace: [020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Origin:
    - [relative](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-15 20:39:51
  - Authors: Loom
  - Why: Return final Task 020 Core implementation and qualification to Anchor.
  - Summary: Return qualified Core Role authoring/schema cutover with direct Assignment Modes and exact historical Parent/current schema authority separation.
  - Status: ready/local

---

# Loom To Anchor — Canonical Role Authoring And Schema Packaging Cutover Return

## Handoff Parties

- Purpose: return the qualified Core implementation of portable current Role authoring against Axiom's amended `tiinex.party.role.v1` schema while preserving exact historical Role Parent provenance and requiring direct canonical Assignment Modes.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- current-role-authoring-cutover
  - Transfer Kind: work-and-responsibility
  - Description: Core now exposes ordinary Role create/continuation authoring from the current bundled Axiom-amended Role schema; current candidates require direct Holder Relationship Assignment Modes and exact canonical mode serialization.
  - Controlling Artifact: [Canonical Role Authoring And Schema Packaging Cutover Qualification](../evidence/014-canonical-role-authoring-and-schema-packaging-cutover-qualificat.trace.md)
  - Boundary: no second Role format, prose whitelist, fuzzy parsing, Role label/path inference or hand-authored envelope bypass.

- historical-parent-schema-reference-separation
  - Transfer Kind: work-and-responsibility
  - Description: common authoring carries a qualified historical Parent's exact schema-reference authority into candidate staging only for Parent Schema validation, allowing the old Parent locator to remain unchanged while Current Schema validation uses the amended current Role authority.
  - Controlling Artifact: [Canonical Role Authoring And Schema Packaging Cutover Qualification](../evidence/014-canonical-role-authoring-and-schema-packaging-cutover-qualificat.trace.md)
  - Boundary: historical Parent representation authority does not become current candidate schema authority and is never silently rewritten.

- role-schema-packaging
  - Transfer Kind: work-and-responsibility
  - Description: Core's canonical bundled Role schema snapshot, binding identity and runtime creation/validation projection now reflect the exact qualified Docs amendment with direct Assignment Modes.
  - Controlling Artifact: [Canonical Role Authoring And Schema Packaging Cutover Qualification](../evidence/014-canonical-role-authoring-and-schema-packaging-cutover-qualificat.trace.md)
  - Boundary: semantic meaning remains owned by Axiom/Docs; Core packages and enforces the accepted contract only.

## Required Context

- core-workspace
  - Material: current integrated Core Workspace containing the Role schema snapshot/binding/runtime projection, common-author repair, Role validator, tests, Evidence and this return Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation basis for Anchor reconciliation and fresh acceptance.
  - Availability: available

- holder-hard-cutover-decision
  - Material: Axiom Canonical Holder Assignment Mode Hard Cutover Semantic Disposition supplied unchanged from the qualified parent carrier.
  - Material Reference: [Canonical Holder Assignment Mode Hard Cutover Semantic Disposition](docs::.topics/grounding/015-canonical-holder-assignment-mode-hard-cutover-semantic-dispositi.trace.md)
  - Purpose: read-only semantic authority for direct Assignment Modes and fail-closed holder authoring semantics.
  - Availability: available

- current-role-schema
  - Material: exact current Axiom-amended `tiinex.party.role.v1` schema used as the canonical bundled Role schema source for this implementation.
  - Material Reference: [Current Party Role Schema](docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: read-only exact current schema authority and byte identity for fresh acceptance.
  - Availability: available

- business-enablement-task
  - Material: Business Canonical Role Authoring Cutover Enablement Task carried unchanged from the qualified parent carrier.
  - Material Reference: [Canonical Role Authoring Cutover Enablement](business::.topics/initiatives/001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md)
  - Purpose: read-only organizational scope and acceptance boundary; Loom performed no Business mutation.
  - Availability: available

## Reference Context

- qualification-evidence
  - Material: exact Loom qualification Evidence for current schema packaging, Role authoring continuation, canonical mode validation and regression/distribution qualification.
  - Material Reference: [Canonical Role Authoring And Schema Packaging Cutover Qualification](../evidence/014-canonical-role-authoring-and-schema-packaging-cutover-qualificat.trace.md)
  - Purpose: implementation proof and interpretation limits.
  - Availability: available

- controlling-task
  - Material: delegated Core Task defining the exact authoring/schema cutover objective, done criteria, scope and dependencies.
  - Material Reference: [Canonical Role Authoring And Schema Packaging Cutover Enablement Mechanics](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Purpose: exact delegated authority for Loom's Core changes.
  - Availability: available

## Retained Responsibilities

- semantic-role-schema-ownership
  - Retained By: Axiom / Docs
  - Responsibility: retain semantic ownership of Role Assignment Modes, Role schema meaning and any future schema amendment.
  - Boundary: Loom implemented the exact qualified current schema and does not invent future tokens, aliases or semantic mappings.

- active-role-migration-and-legacy-removal
  - Retained By: Anchor / Axiom / Business as appropriate
  - Responsibility: complete qualified migration of active Roles and make the explicit later disposition for removal of `LEGACY_ROLE_MAPPINGS`.
  - Boundary: Task 020 explicitly does not remove the mapping or claim migration complete.

- integration-and-fresh-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile returned Core source and run the next fresh acceptance path for current Business Role authoring/migration.
  - Boundary: Loom does not mutate Business/Docs or declare overall Business acceptance on Anchor's behalf.

## Exclusions And Dependencies

- no-historical-rewrite
  - Kind: excluded-scope
  - Description: historical Role artifacts and their historical schema locators are preserved; current cutover does not rewrite old bytes in place.
  - Responsible Party Or Role: Core preserves historical provenance boundaries.

- no-prose-authority
  - Kind: excluded-scope
  - Description: Holder State prose, aliases, fuzzy wording and lexical similarity are not substitutes for direct current Assignment Modes in Role authoring.
  - Responsible Party Or Role: Core / Axiom semantic contract.

- legacy-mapping-final-removal
  - Kind: unresolved-dependency
  - Description: removal of `LEGACY_ROLE_MAPPINGS` remains deferred until Anchor confirms complete qualified active-Role migration under the accepted hard-cutover disposition.
  - Responsible Party Or Role: Anchor / Axiom / Business as appropriate.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: qualified Core implementation, exact current Role schema packaging, historical Parent/current schema authority separation, canonical Assignment Modes fail-closed regression evidence and one Loom-to-Anchor carrier are returned for Anchor reconciliation and fresh acceptance.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: every historical or active Role has already been migrated to direct Assignment Modes.
- Must Not Be Used To Claim: durable holder identity, participant relevance, process applicability, delegation authority, implementation-source permission, Business acceptance, remote-write authority, release or publication.
- Authority Limits: exact host-neutral Core Role authoring/schema packaging mechanics and deterministic qualification only; Axiom/Docs retain semantic ownership and Anchor retains integration/acceptance.
- Must Not Be Treated As: permission to rewrite historical Role bytes, reuse historical Parent schema locator as current schema authority, accept aliases/prose as Assignment Modes, or remove legacy mappings before the retained migration disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Value: k8KM1KSErlUTi56RBfESKCsMcCImJ98JaPoQLP0erJQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: cnYuA95zdLRSURTWJwIWXzuRWvO2b7CsJTFSWsbkWB0