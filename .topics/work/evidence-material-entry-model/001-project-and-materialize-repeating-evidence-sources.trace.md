# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 22:29:14
  - Authors: Anchor
  - Why: Make Add/Remove meaningful through Core materialization and source-provenance continuity.
  - Summary: Core rendering and validation of Native-approved repeatable Evidence materials across hosts.
  - Status: ready/local

---

# Project And Materialize Repeating Evidence Sources

## Objective

After Native qualifies repeated Evidence material entries, expose them through Core's portable `inspect-creation-contract`, schema guide, field help, Preview/Create and validation without changing host-specific semantics.

## Done Criteria

- Core creation contract distinguishes repeated Evidence material entries from ordinary groups, using exact Native-owned field identities.
- Every item has its own reference, material kind, optional description and qualified per-item fields, preserving field-to-item association through preview, creation, re-read and serialization.
- The same contract drives VS Code, Viewer, CLI and LLM authoring; generic host fallback does not invent material metadata.
- Core tests pass for zero/one/multiple entries, duplicate/reference and source qualification, old Evidence representation compatibility, and exact round-trip to created Markdown.
- Accept/Reject/continuation semantics and integrity invariants are unchanged; no file relocation is implied.

## Scope

- Core implements schema-owned repeatability semantics once Native decides the data shape. VS Code provides generic Add/Remove UI only after Core explicitly exposes a repeatable entry contract.

## Dependencies

- [Native Repeatable Evidence Material Task](native::.topics/work/evidence-material-entry-model/001-qualify-repeatable-evidence-material-entries.trace.md)

## Exclusions

- No direct special casing of Evidence or delimiter splitting in VS Code; no executable `forms.js` or custom second validation engine.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ci7GpxWguTTu_nvbrmW1Q9JPSwKzUXisPbvzVcjw3Cs