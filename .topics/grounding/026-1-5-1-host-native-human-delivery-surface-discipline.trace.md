# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 00:42:16
  - Trace: [026-1-5-qualified-return-transition-and-human-delivery-discipline.trace.md](026-1-5-qualified-return-transition-and-human-delivery-discipline.trace.md)
  - Origin:
    - [relative](026-1-5-qualified-return-transition-and-human-delivery-discipline.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 10:36:00
  - Authors: Anchor
  - Why: Steward observed that a canary could qualify and return canonically while the assistant still surfaced only a private runtime path instead of a human-accessible file/link.
  - Summary: Separate qualified local Handoff Package bytes from actual host-native human delivery so runtime-local paths can never be mistaken for delivered files.
  - Status: ready/local

---

# Host-Native Human Delivery Surface Discipline

## Objective

Close the remaining handoff-delivery ambiguity discovered after the accepted qualified-return canary: distinguish exact local package manufacture/qualification from actual human delivery so a runtime-local path can never be treated as proof that the human received an accessible Handoff Package.

## Done Criteria

- Common Handoff manufacture output distinguishes exact-byte qualification from host surfacing and does not label a merely local qualified ZIP as human-delivered.
- A canonically manufactured, inspected, roundtrip-qualified carrier projects `qualified-awaiting-host-surface`, not `qualified-for-human-delivery`.
- The same output explicitly states that a runtime-local filesystem path is not human-delivery evidence and that host surfacing remains unproven.
- Machine-readable output requires a host-native human-visible file, attachment, or link mechanism before delivery may be claimed.
- A package that fails canonical manufacture/inspection/roundtrip remains blocked from host surfacing.
- Continued recipient Workspaces carry the same reminder in runtime-only continuation state without creating new semantic authority.
- The embedded LLM bootstrap explicitly forbids presenting `/mnt/data`, temporary, container, or Workspace-local paths as if they were delivered downloads.
- The embedded bootstrap requires the exact qualified bytes to be exposed through the host's native human-visible file/attachment/link mechanism and requires a truthful blocker if that surface is unavailable.
- Existing qualified-return, Package V1, physical roundtrip, operation-selection, and fail-closed behavior remains intact under full Core regression.

## Scope

In scope:

- common CLI Handoff manufacture projection
- runtime-only recipient continuation return-discipline projection
- embedded model-facing bootstrap guidance
- regression tests for qualified-but-not-yet-surfaced and unqualified package outputs
- explicit host-neutral distinction between local artifact, qualified artifact, and human-visible delivery

Out of scope:

- hardcoding ChatGPT-specific `sandbox:` URLs or any provider-specific link grammar
- claiming Core can observe or enforce arbitrary host UI state without a host receipt/integration
- changing Package V1 byte qualification or canonical manufacture semantics
- changing the already accepted approval-to-qualified-return transition semantics from parent Task `026-1-5`
- participant-map semantics

## Dependencies

- Parent Task `026-1-5` and its deterministic qualification Evidence `046`.
- Fresh Pilot acceptance Evidence `047`, which established that the return transition itself no longer reproduced the earlier blocker.
- Steward follow-up observation that a qualified Handoff Package was sometimes represented to the human only by a runtime-local `/mnt/data/...` path rather than a host-native clickable/downloadable artifact.
- Existing Core host-neutrality: Core may specify the required delivery capability and truth boundary but must not invent a provider-specific URL scheme.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-5-qualified-return-transition-and-human-delivery-discipline.trace.md](026-1-5-qualified-return-transition-and-human-delivery-discipline.trace.md)
  - Value: rObt2P9BK-NKZhyW9MZ7i-efWK9gIKPK9PgNS6L4tVI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: NDksHDfkX_DAFRqz0eyejFUwFCkq8uv1oEAjF4Nx930