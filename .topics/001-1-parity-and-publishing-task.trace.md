# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/8145c280093dff5d0b67db2aa72d5f5c12b6c7cb/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 17:38:00
  - Trace: [001-extraction-task.trace.md](001-extraction-task.trace.md)
  - Origin:
    - [relative](001-extraction-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 20:41:55
  - Authors: Anchor
  - Why: Continue the supplied current source with explicit compatibility, release and qualification boundaries.
  - Summary: Shared master-only npm release capability
  - Status: active/local

---

# Shared master-only npm release capability

## Objective

Continue the existing core extraction frontier with the actual shared package consumer and release contracts requested by Sigma.

## Done Criteria

Package tests and public imports pass; release/host boundary behaviour is tested; exact dependency-equipped browser gates remain explicit until executed. Source is preserved in the complete multi-workspace carrier.

## Scope

Shared master-only npm release capability. No new semantic authority, no remote mutation, no source vendoring and no claim that npm publication has already occurred.

## Dependencies

- [Current Business task](business::.topics/initiatives/001-3-6-3-playthings-parity-master-publishing-task.trace.md).
- [Publishing guide](../docs/NPM-PUBLISH.md).

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-extraction-task.trace.md](001-extraction-task.trace.md)
  - Value: 7lwEzA0IrlB9aJB5Ocw7OaoVVTcjcGBQwel_dRjdGD0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: nJQTd1kPihQwmIpbjL3Tncpo9A-4SxqIgpT-yclCxms