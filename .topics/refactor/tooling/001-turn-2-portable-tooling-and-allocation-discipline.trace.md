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
  - Created At: 2026-09-09 14:58:54
  - Authors: Anchor
  - Why: Turn-2 execution depends on durable, qualified authoring and Handoff mechanics that reduce manual Sigma integration.
  - Summary: Dogfood and harden portable Tooling without coupling Parent semantics to path allocation.
  - Status: ready/local

---

# Turn 2 portable Tooling and allocation discipline

## Objective

Keep portable authoring, Handoff, source-frontier and allocation mechanics safe and practical while Turn 2 dogfoods them.

## Done Criteria

- Directory-local artifact allocation is qualified independently from semantic Parent lineage.
- Child Handoff/source reconciliation friction discovered during Turn 2 is classified before new Tooling is added.
- Emergency runtime and conversation-successor operating processes can be authored through qualified paths.
- Tooling failures remain fail-closed and do not fabricate Handoff or qualification state.

## Scope

Portable Tooling and operating mechanics only; do not encode project-specific semantics as generic Core authority.

## Dependencies

- Parent Core Turn-2 task.
- Existing portable Tooling carry-forward task `.topics/002-portable-tooling-carry-forward-task.trace.md`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-core-shared-boundary-stabilization.trace.md](../001-turn-2-core-shared-boundary-stabilization.trace.md)
  - Value: 6j47yRSGTy7K4TxV170r_AetTVxFanMBfPOaL-WI7TM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WOMe5yr432wwydKlPQSPPZs95rGEXQrVoewCbGSt3iU