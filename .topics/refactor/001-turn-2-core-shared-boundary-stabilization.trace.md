# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 17:38:00
  - Trace: [001-extraction-task.trace.md](../001-extraction-task.trace.md)
  - Origin:
    - [relative](../001-extraction-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:57:56
  - Authors: Anchor
  - Why: Decompose the cross-repository Turn-2 epic into a Core-owned work lineage without moving implementation work into Business.
  - Summary: Stabilize Core as provider-neutral, host-neutral shared mechanics for the Turn-2 frontier.
  - Status: ready/local

---

# Turn 2 Core shared-boundary stabilization

## Objective

Make Core provider-neutral and host-neutral while preserving canonical lineage, Handoff, grounding, package and deterministic mechanics required by App and hosts.

## Done Criteria

- Core contains no provider-specific product policy that belongs in a first-party provider repository.
- Public package contracts needed by App, VS Code and Verses are explicit and consumable without private cross-repository imports.
- Portable authoring, Handoff and qualification mechanics remain fail-closed and fast enough for repeated Turn-2 use.
- Current package surface and focused contract qualification pass against exact source.

## Scope

Shared mechanics only. Do not absorb Docs semantic authority, concrete provider implementations, Verse presentation, Site deployment policy or VS Code host UX.

## Dependencies

- Controlling Business epic: `business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md`.
- Existing Core extraction boundary: `.topics/001-extraction-task.trace.md`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-extraction-task.trace.md](../001-extraction-task.trace.md)
  - Value: GCTQEKkmomJpU8bKRYyAG4eWNZNUPxDuQLpvJTrhHjk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 6j47yRSGTy7K4TxV170r_AetTVxFanMBfPOaL-WI7TM