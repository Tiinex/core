# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 23:09:23
  - Authors: Anchor; Sigma
  - Why: Cold Guided Entry dogfood proved plain transport Markdown was entering Tiinex validation and producing false lineage diagnostics.
  - Summary: Gate shared editor and staged validation on the explicit first-line Tiinex continuity envelope so ordinary Markdown is ignored before validation.
  - Status: ready/local

---

# Tiinex Markdown Validation Ingress

## Objective

Make Tiinex editor/staged validation ignore ordinary Markdown unless the document explicitly declares the Tiinex continuity envelope on its first line.

## Done Criteria

- the canonical ingress marker is exactly first-line `# Continuity Context`
- ordinary Markdown such as README, transport, retrospective or notes files is excluded before Core editor audit/lineage/schema validation
- a malformed document that starts with the Tiinex envelope marker is still validated rather than silently ignored
- editor assistance computes lineage only across Tiinex-ingress records
- staged validation uses the same first-line ingress rule
- focused ingress tests and the full Core regression remain green

## Scope

- Core artifact-ingress classification used by editor assistance and staged validation
- no schema semantic change and no relaxation of validation after a document has declared Tiinex ingress
- no general Markdown parser replacement, migration, release or remote mutation

## Dependencies

- canonical Tiinex artifact envelope heading `# Continuity Context`
- existing shared Core editor assistance and staged-validation boundaries
- VS Code host may apply the same marker as a cheap pre-runtime filter, while Core remains authoritative if called directly

## Motivation

Real VS Code dogfood opened a plain generated `transport.md` whose first line was `Handoff package attached.`. The existing editor-assistance path nevertheless audited it as Tiinex material and projected a lineage-integrity warning. This spent runtime/validation work on a non-Tiinex artifact and polluted the editor with a false Tiinex diagnostic.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: _risOuiXhellfzPJqDnMcbxKzHeVUHBjOgIPl--wHhE