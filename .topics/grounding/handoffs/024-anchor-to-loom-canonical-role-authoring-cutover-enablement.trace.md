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
  - Created At: 2026-09-15 20:09:36
  - Authors: Anchor
  - Why: The accepted Axiom hard cutover requires ordinary qualified Role authoring before Anchor can migrate the active Business Role set and before Loom can remove legacy current authorization.
  - Summary: Delegate Core authoring/schema-material enablement required for canonical Business Role migration.
  - Status: ready/local

---

# Anchor To Loom — Canonical Role Authoring Cutover Enablement

## Handoff Parties

- Purpose: enable canonical Business Role migration by making portable Role authoring qualify current candidates against Axiom's amended direct Assignment Modes schema while preserving exact historical parent provenance.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- canonical-role-authoring-enablement
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the Core authoring/schema-material repair required for current canonical Role continuations under Axiom's accepted hard-cutover schema.
  - Controlling Artifact: [Canonical Role Authoring And Schema Packaging Cutover Enablement Mechanics](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Boundary: this enables migration only; it does not declare the Business active-Role set complete and does not yet remove the temporary legacy current-runtime bridge.

## Required Context

- core-workspace
  - Material: current Core Workspace with canonical holder normalization mechanics and temporary exact legacy Role mapping bridge.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation and regression source.
  - Availability: available

- holder-hard-cutover-decision
  - Material: Axiom Canonical Holder Assignment Mode Hard Cutover Semantic Disposition.
  - Material Reference: [Canonical Holder Assignment Mode Hard Cutover Semantic Disposition](docs::.topics/grounding/015-canonical-holder-assignment-mode-hard-cutover-semantic-dispositi.trace.md)
  - Purpose: controlling semantic/schema authority for current direct Assignment Modes, migration gating and post-cutover diagnostics.
  - Availability: available

- current-role-schema
  - Material: amended canonical `tiinex.party.role.v1` schema source.
  - Material Reference: [Party Role Schema](docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: exact current Role creation/validation contract that authoring must consume.
  - Availability: available

- business-enablement-task
  - Material: Business Canonical Role Authoring Cutover Enablement Task.
  - Material Reference: [Canonical Role Authoring Cutover Enablement](business::.topics/initiatives/001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md)
  - Purpose: organizational authority and exact migration-enablement scope.
  - Availability: available

## Reference Context

- prior-holder-decision
  - Material: Axiom Canonical Holder Assignment Mode Semantic Disposition.
  - Material Reference: [Canonical Holder Assignment Mode Semantic Disposition](docs::.topics/grounding/013-canonical-holder-assignment-mode-semantic-disposition.trace.md)
  - Purpose: historical migration translation authority for exact pre-migration Role bytes.
  - Availability: available

## Retained Responsibilities

- business-role-migration
  - Retained By: Anchor
  - Responsibility: declare the complete active operational Business Role set, author the migrated Role continuations, qualify exact post-migration digests and distinguish historical/non-operational Role material.
  - Boundary: Loom must not infer completeness from repository inventory or migrate Business Roles itself.

- final-legacy-removal
  - Retained By: Anchor / Loom after qualified migration
  - Responsibility: final removal of `LEGACY_ROLE_MAPPINGS` and legacy-positive current authorization occurs only after Anchor supplies qualified complete active-Role migration evidence.
  - Boundary: this Handoff is not authority to keep the bridge permanently or to remove it prematurely.

## Exclusions And Dependencies

- no-dual-role-format
  - Kind: excluded-scope
  - Description: do not introduce a compatibility Role format or second current holder-authority representation.
  - Responsible Party Or Role: Loom.

- no-prose-authority
  - Kind: excluded-scope
  - Description: Holder State prose, Role names, paths and historical mapping data remain non-authoritative for new direct current Role authoring.
  - Responsible Party Or Role: Loom.

- migration-gate
  - Kind: unresolved-dependency
  - Description: final legacy runtime removal depends on Anchor's later qualified complete active-Role migration disposition; this enablement should return before that removal.
  - Responsible Party Or Role: Anchor.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return qualified Core authoring/schema-packaging implementation and focused evidence proving a canonical Role continuation can be authored and validated without dual current authority.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the active Business Role migration or final holder hard cutover is already accepted.
- Must Not Be Treated As: permission to retain permanent legacy current authorization, rewrite historical Role bytes, or infer the active Role set from repository inventory.
- Authority Limits: Core authoring/schema-material enablement only.
- Must Not Be Used To Claim: end-to-end delegation acceptance until Anchor migrates Roles, Loom removes the legacy bridge, and fresh-role acceptance passes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md](../020-canonical-role-authoring-and-schema-packaging-cutover-enablement-mechanics.trace.md)
  - Value: k8KM1KSErlUTi56RBfESKCsMcCImJ98JaPoQLP0erJQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: mZ2yrPFXv4ddGTBn8p0dPWkDKGehh2ubcwDw8EjQ81E