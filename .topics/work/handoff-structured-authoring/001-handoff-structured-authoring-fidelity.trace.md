# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-06 19:48:45
  - Authors: Anchor; Sigma
  - Why: Fix the Core-owned authoring seam exposed by VS Code Handoff-form dogfood.
  - Summary: Preserve structured Handoff creation inputs through complete loaded schema-lineage projection instead of top-level field duplication.
  - Status: ready/local

---

# Handoff Structured Authoring Fidelity

## Objective

Make portable Handoff creation preserve structured ordinary-group and repeatable declaration semantics without duplicating nested required fields as independent top-level authoring inputs.

## Done Criteria

- complete loaded schema lineage supplies exact portable creation bindings when runtime capability resolution is unavailable
- ordinary-group required fields are reported under their owning input
- repeatable declaration required fields are reported with declaration index
- literal `none` remains valid where the schema allows it
- representative Handoff draft creation is clean
- focused Core authoring/Handoff regression suite remains green

## Scope

- Core portable schema guide and artifact planning only
- no new currentness authority
- no Handoff schema semantic rewrite
- no host-specific field semantics in Core

## Dependencies

- maintained Root + Handoff schema lineage from Native
- generic schema runtime projection and creation renderer

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dslVzTVQf6zEsMjZJGNWlJs46H0H-hE6HANPWLIsdZM