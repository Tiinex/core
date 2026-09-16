# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:52:23
  - Trace: [001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:52:45
  - Authors: Anchor
  - Why: The first real Business Axiom migration still blocks because the historical parent is re-audited as a current Role and is incorrectly required to contain Assignment Modes.
  - Summary: Repair common Role authoring so genuine pre-migration Role parents remain historical evidence while canonical continuations validate against the current schema.
  - Status: ready/local

---

# Pre-Migration Role Parent Audit Cutover Correction Mechanics

## Objective

Repair the remaining common Role-authoring/audit defect exposed by Master Anchor's first real Business Axiom migration attempt.

The current canonical candidate stages correctly with direct `Holder Relationship -> Assignment Modes`, but overall ordinary authoring still blocks because the exact historical parent `business::.topics/roles/001-2-axiom-role.trace.md` is re-audited as if it were a current operational Role under the amended schema and therefore reports missing `Assignment Modes`.

Preserve exact historical parent bytes, integrity and schema provenance while ensuring only the new candidate is required to satisfy the current amended Role contract.

## Done Criteria

- Reproduce the exact real pre-migration Axiom parent body lacking `Assignment Modes`, not a synthetic parent rendered from the current Role contract.
- Ordinary `author --schema tiinex.party.role.v1` can qualify a canonical continuation from that exact historical parent without rewriting the parent or downgrading current candidate validation.
- Historical parent validation/provenance remains exact and fail-visible; historical Role bytes are not treated as current positive holder authority.
- New current candidates still require direct canonical `Assignment Modes` and fail closed on missing/invalid values.
- No Role/path/label special case, prose interpretation, blanket audit suppression, schema bypass, second Role format or permanent compatibility authority is introduced.
- Focused regression demonstrates the real migration case plus existing invalid/missing-mode failures.
- Full Core tests, portable smoke and embedded bootstrap qualification remain green.
- Return exact Evidence and one Loom-to-Anchor Handoff. Keep `LEGACY_ROLE_MAPPINGS` until Anchor has qualified the complete active Role migration.

## Scope

Core common authoring/audit treatment of historical Role parents during current-schema migration and focused regression coverage.

## Dependencies

- Business `Pre-Migration Role Parent Audit Cutover Correction`.
- Axiom canonical holder hard-cutover Decision and amended Role schema.
- Loom Task 020 Role authoring/schema packaging implementation.
- Master Anchor's exact failed Business Axiom authoring receipt.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md)
  - Value: 9U7jpleTHQpoQ5tJAkQoC35E3c5G64jXLZjmgAPZuGo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Oy7kXsMJ4Y2pSZJA2M4T0vufgpRDY562sGeNQHyEaII