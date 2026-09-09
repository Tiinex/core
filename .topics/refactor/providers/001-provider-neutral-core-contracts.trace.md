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
  - Why: Keep provider extraction scalable without turning Core into a provider switchboard.
  - Summary: Separate provider-neutral Core capabilities from GitHub/native implementation policy.
  - Status: ready/local

---

# Provider-neutral Core contracts

## Objective

Remove GitHub/native provider policy from Core while retaining only provider-neutral capabilities, registration, recovery and source mechanics.

## Done Criteria

- Provider identity is not hard-coded as shared semantic or host policy.
- Generic `relative`, `browse`, `git`, discovery and publication capabilities have explicit ownership boundaries.
- GitHub-specific implementation can move to `provider-github` without copying Core internals.
- Native/local behavior can be implemented through the same provider contract rather than privileged branches.

## Scope

Core contract/mechanics only. No concrete provider repository implementation in this subtask.

## Dependencies

- Parent Core Turn-2 task.
- Controlling Business epic: `business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-core-shared-boundary-stabilization.trace.md](../001-turn-2-core-shared-boundary-stabilization.trace.md)
  - Value: 6j47yRSGTy7K4TxV170r_AetTVxFanMBfPOaL-WI7TM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: O9_D92MpNug1Mnb3J1T8TAWIf2Uj1sT2wgl6c_F96Uw