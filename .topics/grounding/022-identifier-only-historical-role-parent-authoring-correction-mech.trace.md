# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 21:59:25
  - Trace: [001-2-7-5-1-2-1-1-1-1-identifier-only-historical-role-parent-authoring-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-identifier-only-historical-role-parent-authoring-correction.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-identifier-only-historical-role-parent-authoring-correction.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 21:59:50
  - Authors: Anchor
  - Why: Axiom accepted direct continuation with identifier-only historical Parent schema authority; current common authoring must preserve that weaker truth so the final active Role migration can complete.
  - Summary: Implement the canonical identifier-only historical Role Parent author/reference rule generically for Anchor and Prism without schema-revision inference or compatibility authority.
  - Status: ready/local

---

# Identifier-Only Historical Role Parent Authoring Correction Mechanics

## Objective

Implement Axiom's accepted identifier-only historical Role Parent continuation rule in Core's common author/reference-authority path so the active Anchor and Prism Roles can continue directly from exact immutable historical Parents whose own `Current Schema` declares only `tiinex.party.role.v1` without an exact historical target.

Preserve the weaker historical truth exactly: qualify Parent artifact identity/integrity and schema identifier, keep exact historical schema revision unresolved, render the child `Parent Schema` as the plain identifier, and validate only the new child against the exact current canonical Role schema and direct `Assignment Modes`.

## Done Criteria

- Reproduce the real active Anchor historical Parent and real active Prism historical Parent identifier-only cases.
- Ordinary Role authoring qualifies direct canonical children from both exact Parents without rewriting them or substituting today's current schema target as historical provenance.
- Historical Parent exact bytes, self-integrity, declared schema identifier and truthful recovery route remain blocking requirements.
- Identifier-only historical authority is represented distinctly from exact historical schema-revision authority in diagnostics/receipts.
- Exact same-revision matching remains false for identifier-only historical authority; current schema-specific Parent-body validation is withheld/degraded rather than falsely passed or failed.
- New children remain strictly validated against the exact current amended `tiinex.party.role.v1` contract, including direct canonical `Assignment Modes`.
- Fail closed on missing Parent schema id, failed Parent integrity, contradictory/mismatched declared historical target, invalid recovery route, unavailable current child schema authority, or invalid current candidate.
- No Role/path/label special case, no inference from today's canonical schema bytes, no history rewrite, no second active Role representation, no prose parser, and no permanent compatibility authority.
- Focused adversarial regressions cover Anchor, Prism and the case where today's exact canonical schema material is present but must not upgrade identifier-only historical provenance.
- Full Core tests, portable smoke and embedded bootstrap qualification remain green.
- Return exact qualification Evidence and one Loom-to-Anchor Handoff.
- Keep `LEGACY_ROLE_MAPPINGS` in place; final removal remains gated on Anchor qualifying the complete active Role migration.

## Scope

Core common Role authoring/reference-authority treatment of exact identifier-only historical Role Parents plus regression coverage. No Business or Docs mutation by Loom.

## Dependencies

- Business `Identifier-Only Historical Role Parent Authoring Correction`.
- Axiom `Identifier-Only Historical Role Parent Cutover Semantic Disposition`.
- Existing Loom historical-parent audit split and current canonical holder hard-cutover mechanics.
- Exact active Anchor and Prism historical Role Parents carried from Business.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-5-1-2-1-1-1-1-identifier-only-historical-role-parent-authoring-correction.trace.md](business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-identifier-only-historical-role-parent-authoring-correction.trace.md)
  - Value: J6vISAbZ5HdMLrD25emWRHWNGgl6hlL9iZJV_IGMufg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3I0XukSWhSHgiF6BEzyDK59l3STRjxSh9nEB95HLTOk