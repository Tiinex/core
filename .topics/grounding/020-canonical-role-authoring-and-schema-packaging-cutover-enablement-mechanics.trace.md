# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:08:32
  - Trace: [001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:09:36
  - Authors: Anchor
  - Why: Axiom accepted the hard cutover, but Master Anchor cannot yet qualify a Role continuation because the pre-migration parent schema locator is unresolved for the new candidate.
  - Summary: Repair portable Role authoring/schema qualification so direct canonical Assignment Modes can be migrated without dual current authority.
  - Status: ready/local

---

# Canonical Role Authoring And Schema Packaging Cutover Enablement Mechanics

## Objective

Repair the portable Role authoring/schema-material path so Master Anchor can revise current Business `tiinex.party.role.v1` artifacts against Axiom's amended canonical holder schema and qualify direct `Assignment Modes` without hand-written envelopes or legacy compatibility authority.

Reproduce the observed candidate failure in which a Role continuation with valid direct canonical Assignment Modes is blocked by `schema.reference.target-unqualified` because the pre-migration parent carries an older schema locator. Preserve exact historical parent provenance while qualifying the current governing Docs Role schema for the new candidate.

## Done Criteria

- Reproduce the exact Role-authoring blocker from a pre-migration qualified Role parent and Axiom's amended current Role schema.
- `author --schema tiinex.party.role.v1` can create/revise a current Role continuation whose exact Parent is the historical Role while the candidate qualifies against the current amended Docs Role contract.
- The candidate directly carries canonical `Holder Relationship -> Assignment Modes`; missing/invalid modes fail closed according to the amended schema.
- Parent historical provenance and current governing schema authority remain distinct and exact; no old schema locator is silently rewritten as historical fact.
- No Role label/path special cases, prose whitelists, fuzzy parsing, hand-authored envelope bypass, second Role format, or permanent compatibility representation are introduced.
- Bootstrap/canonical schema material needed for ordinary Role authoring reflects Axiom's amended Role schema.
- Focused regression evidence demonstrates at least one successful canonical Role continuation and the expected fail-closed invalid/missing-mode cases.
- Return exact evidence and one Loom-to-Anchor Handoff. Do not remove `LEGACY_ROLE_MAPPINGS` yet; final current-runtime legacy removal is gated on Anchor's complete qualified active-Role migration disposition.

## Scope

Core portable authoring, Role schema-material qualification/packaging, parent/current-schema provenance handling and focused tests required to enable the already-accepted hard cutover.

## Dependencies

- Axiom `Canonical Holder Assignment Mode Hard Cutover Semantic Disposition`.
- Amended Docs `.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`.
- Business `Canonical Role Authoring Cutover Enablement` Task.
- Existing canonical holder normalization mechanics, including the temporary exact legacy mapping bridge that remains only until qualified migration is complete.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-canonical-role-authoring-cutover-enablement.trace.md)
  - Value: 6JMU1QVWnVCv9VEH5e_l8uE_G64U5sA5DdtVYiP7zS4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: k8KM1KSErlUTi56RBfESKCsMcCImJ98JaPoQLP0erJQ