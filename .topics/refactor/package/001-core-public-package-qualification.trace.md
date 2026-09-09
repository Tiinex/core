# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:57:56
  - Trace: [001-turn-2-core-shared-boundary-stabilization.trace.md](../001-turn-2-core-shared-boundary-stabilization.trace.md)
  - Origin:
    - [relative](../001-turn-2-core-shared-boundary-stabilization.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:58:55
  - Authors: Anchor
  - Why: Independent repo development requires a small reliable Core contract rather than copied source.
  - Summary: Qualify Core as an independently consumable package over stable public boundaries.
  - Status: ready/local

---

# Core public package qualification

## Objective

Qualify the actual distributable Core surface used by independent repositories without freezing transient internals.

## Done Criteria

- `npm pack` contains only intended runtime/public material.
- A minimal external consumer can import the documented public surface from packed bytes.
- Shared use-case and safety-critical lineage/Handoff tests pass against the candidate source.
- Package qualification records exact source/package inputs and does not misreport registry/network failures as product failures.

## Scope

Core package/distribution boundary only.

## Dependencies

- Parent Core Turn-2 task.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-core-shared-boundary-stabilization.trace.md](../001-turn-2-core-shared-boundary-stabilization.trace.md)
  - Value: 6j47yRSGTy7K4TxV170r_AetTVxFanMBfPOaL-WI7TM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: lQHAcbQWKx1Sfmvxow0ioWAyfJKb9510kJGwG_TuoNI