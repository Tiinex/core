# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 15:00:50
  - Authors: Anchor
  - Why: Unblock Windows Evidence creation with a generic Core-owned schema-guide correction.
  - Summary: Fix Core materialization planner demanding a duplicate Evidence Role outside its qualified ordinary group.
  - Status: ready/local

---

# Correct Core Ordinary-Group Required Input Projection

## Objective

Remove one documented mismatch between a qualified ordinary-group Artifact Creation Contract and the portable materialization schema-guide required-input projection. Evidence `Supported Claim Or Question` is one group: its `Evidence Role` field must not also be demanded at the proposal top level. This is a generic Core planner repair, not an Evidence-specific VS Code fallback.

## Done Criteria

- With the qualified Native Evidence schema loaded, `planPortableArtifact` accepts one complete structured `Supported Claim Or Question` group and does not require a shadow top-level `Evidence Role`.
- When `Evidence Role` is missing *within* that supplied group, Core reports the exact `Supported Claim Or Question.Evidence Role` missing input; it does not hide the requirement.
- Existing Handoff ordinary-group/repeatable requirements are unchanged. Any scalar binding independently required by Core remains required; no generic weakening or assumption of user content.
- Tests demonstrate the failure before the change and PASS after. The complete local Core test suite runs green with the qualified Native and Business content fixtures.
- Windows VS Code Evidence Preview, Create and persisted/reopened Parent + material links are tested after Core Workspace Replace and `npm run dev:build:local`; until then host acceptance is OPEN.

## Scope

- `src/tooling/portable/schema/schema.guide.js` grouped creation input projection and `test/portable-schema-guide-structured-inputs.test.mjs` regressions.
- Current result: local Core projection repairs the mismatch and `prepare-materialization` returns `ready` on a complete structured Evidence values object. Local Core suite 501/501 PASS. No remote write or publication performed.

## Dependencies

- Native-owned Evidence and preservation schema contracts remain unchanged.
- VS Code README Documentation Task owns the active Windows acceptance gate; no extra UI or UX implementation is authorized by this Core repair.
- Sigma is the human Windows host acceptance participant. Incomplete or invalid group values must still fail closed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: FLbX7ypyfJjSgVBUMXwSYIVJGYd6Qf3vNHmF09X9kaw