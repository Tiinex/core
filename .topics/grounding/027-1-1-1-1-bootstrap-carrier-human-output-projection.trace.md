# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 14:20:33
  - Trace: [027-1-1-1-bootstrap-only-carrier-export-ergonomics.trace.md](027-1-1-1-bootstrap-only-carrier-export-ergonomics.trace.md)
  - Origin:
    - [relative](027-1-1-1-bootstrap-only-carrier-export-ergonomics.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 14:50:45
  - Authors: Anchor
  - Why: Sigma needs the repository VS Code task to surface only the generated package location and transport text, without losing structured output for LLMs and automation.
  - Summary: Make bootstrap carrier export human-readable by default while preserving explicit JSON machine output.
  - Status: ready/local

---

# Bootstrap Carrier Human Output Projection

## Objective

Make the bootstrap-only carrier convenience human-readable by default while preserving the existing full structured receipt as an explicit machine mode for LLMs and automation.

## Done Criteria

- `npm run bootstrap:carrier` reports only the generated output path and canonical transport text after successful qualification.
- `npm run bootstrap:carrier -- --json` preserves the full structured `tiinex.bootstrap-carrier-export.v1` receipt for machine consumers.
- Human output does not expose byte counts, hashes, internal manufacture receipt fields, finding summaries, or roundtrip diagnostics unless machine mode is explicitly requested.
- The Core repository VS Code task invokes the same npm script in silent mode so npm banner noise does not obscure the output path and transport text.
- Package construction continues to delegate exclusively to canonical `manufacture-handoff-package --carrier-mode bootstrap`; no package semantics move into the output formatter.
- Focused output-projection regression, full Core regression, portable smoke, embedded bootstrap qualification, and npm pack qualification remain green.

## Scope

Bootstrap carrier wrapper output formatting, explicit JSON switch, repository-local VS Code task presentation, and focused regression coverage only.

## Dependencies

- [Bootstrap-Only Carrier Export Ergonomics](027-1-1-1-bootstrap-only-carrier-export-ergonomics.trace.md)
- Existing canonical Package V1 bootstrap-only carrier manufacture.

## Exclusions

- No package-content or Package V1 semantic change.
- No bootstrap payload semantic change.
- No VS Code extension repository mutation.
- No schema-sync, companion, or Workspace Representation change.
- No remote publication, release, commit, push, or deployment.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-1-1-bootstrap-only-carrier-export-ergonomics.trace.md](027-1-1-1-bootstrap-only-carrier-export-ergonomics.trace.md)
  - Value: BasVY-41KyJNkVL3xZ0Qzr-0mOsH0lZg6nhN5zf5oIg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qQ2f3sQzFgoV9__YCWYWOcx7WTugUc1wKZB32AYsh10