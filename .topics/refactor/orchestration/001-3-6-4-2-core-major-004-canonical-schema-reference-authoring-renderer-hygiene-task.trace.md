# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 23:38:17
  - Trace: [001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md](business::.topics/initiatives/001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 23:25:38
  - Authors: Anchor
  - Why: Sigma surfaced a common-authoring blind spot where Tooling generated a state its own editor diagnostic correctly degrades; this belongs in shared Core mechanics.
  - Summary: Align shared generation with canonical immutable schema-reference authority so new artifacts stop producing mixed bare-id/exact-target envelopes.
  - Status: ready/local

---

# Core Major 004 — Canonical Schema Reference Authoring And Renderer Hygiene

## Objective

Stop new ordinary Tiinex artifacts and portable generated artifacts from mixing bare schema ids with exact immutable schema-reference locators when qualified canonical schema material is already available. Centralize the repair in shared Core authoring/rendering rather than fixing artifacts or hosts one by one.

## Done Criteria

- Common artifact authoring emits `Envelope Schema`, `Parent Schema`, and `Current Schema` using the qualified exact schema-reference authority available to the runtime whenever the referenced schema is already published and an immutable canonical locator is available.
- The behavior preserves the canonical Docs rule: local/unpublished schema material may use a truthful local/relative locator; Tooling must not fabricate an immutable published locator that does not exist.
- A newly authored ordinary non-package artifact through the common author path no longer produces a mixed representation such as bare `Envelope Schema: tiinex.root.v1` while Parent/Current use immutable links.
- Portable artifact renderers are audited for the same blind spot. Any renderer that emits a published schema id without its qualified target while canonical target authority is available is repaired or explicitly documented as a bounded exception.
- The existing editor diagnostic `portable.editor.schema-reference.canonical-target-available` is aligned with generation behavior so Tooling does not knowingly generate the state it later warns about.
- Focused regression covers common authoring with runtime canonical schema material and at least one portable generated Pointer/Handoff-adjacent artifact path.
- Existing local/unpublished schema authoring remains valid and fail-closed; no network lookup is introduced.
- Historical artifacts are not mass-rewritten. The result states which existing recent artifacts are degraded and how future correction should be represented if correction is necessary.
- Full relevant Core portable/bootstrap test suites pass before return.

## Known Reproduction

Sigma opened newly produced Task/Handoff artifacts and VS Code surfaced `portable.editor.schema-reference.canonical-target-available`: `Envelope Schema` used only `tiinex.root.v1` while the same artifact used immutable commit-pinned schema locators for Parent and Current. The current Docs Root policy already requires immutable canonical locators for different already-published schema representations when available.

## Scope

Core common artifact renderer/authoring, portable renderers, diagnostics alignment, tests and bounded Evidence. Docs semantics are read-only unless a genuine semantic ambiguity is returned to Anchor/Axiom.

## Dependencies

- Current canonical Docs Root schema-reference policy.
- Current Core runtime canonical schema-material provenance and common-author recovery support.
- Current editor diagnostic behavior as reproduction evidence.

## Exclusions

- No mass rewrite of historical artifacts.
- No host-specific VS Code preview fix.
- No mutable-branch/latest URL substitution for immutable canonical authority.
- No remote publication.

## Acceptance Boundary

The Major closes only when shared generation and shared diagnostics agree on the same exact-schema-reference policy and a fresh common-authored artifact is clean without host-specific post-processing.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md](business::.topics/initiatives/001-3-6-4-repository-frontiers-lineage-stabilization-turn2-task.trace.md)
  - Value: Z-8KDTRtswJDhg820T7a-hH1kHqlQimQNPz1HECJQSM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: lFIazLC0k9EQnSrTOQonRxpYDIf0MXH6pw8ShVeCfG0