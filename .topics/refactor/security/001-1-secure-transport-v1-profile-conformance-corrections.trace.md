# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 01:32:23
  - Trace: [001-secure-transport-v1-core-mechanics.trace.md](001-secure-transport-v1-core-mechanics.trace.md)
  - Origin:
    - [relative](001-secure-transport-v1-core-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 10:39:54
  - Authors: Anchor
  - Why: Close the exact empty-password and mutable-schema-reference conformance gaps without widening the already-qualified Secure Transport V1 mechanics.
  - Summary: Two bounded Core corrections required by the accepted Axiom concrete password-profile decision before downstream adoption.
  - Status: active/local

---

# Secure Transport V1 profile conformance corrections

## Objective

Bring the already-qualified Core Secure Transport V1 implementation into exact conformance with the accepted Axiom/Docs concrete password-profile decision before any CLI or graphical host adopts the profile.

## Done Criteria

- Canonical V1 slot creation and recipient-slot replacement reject the empty string before password derivation or key wrapping. No durable slot or protected result may be produced from an empty password.
- An empty password candidate supplied while opening cannot unlock a password slot and resolves through the existing wrong-password/locked failure semantics; do not introduce a new durable failure vocabulary solely for empty input.
- Non-empty password behavior, `utf8-no-normalization`, the accepted PBKDF2/AES-KW/AES-GCM parameters, authenticated profile/workspace binding, same-content-key recipient rotation and byte-identical protected payload on recipient changes remain unchanged.
- Transport Envelope rendering uses plain `tiinex.transport.envelope.v1` as `Current Schema` while no qualified immutable canonical locator exists. Mutable `blob/main`, `blob/master`, latest-style or equivalent branch locators are not emitted as exact schema-representation authority.
- Focused tests prove empty password cannot create, replace or unlock a canonical V1 password slot and prove the exact plain schema-id renderer form.
- Existing Secure Transport security/roundtrip tests remain green, full Core qualification remains green, portable public surface remains importable, embedded bootstrap qualification remains green and package dry-run remains valid.
- No unrelated cryptographic algorithm, profile id/version, cost, encoding, framing, route-clear, sealed-name-tree, Handoff or Workspace semantic behavior changes.

## Scope

Writable scope is `Tiinex/core` only. This is a bounded conformance correction to the accepted Secure Transport V1 mechanics already returned by Loom.

Do not mutate Docs, Business, CLI, extension-vscode, App, Site, Providers, Verses, Interop or Runtime. Do not introduce password length/composition policy, normalization, ZipCrypto, Passkeys/WebAuthn, biometrics, hardware/security keys, signing, recipient identity or carrier-sealed routing.

## Dependencies

- [Secure Transport V1 Core mechanics](001-secure-transport-v1-core-mechanics.trace.md)
- [Axiom accepted concrete password profile Decision](docs::.topics/refactor/security/001-5-1-1-secure-transport-v1-concrete-password-profile-decision.trace.md)
- [Axiom return Handoff](docs::.topics/refactor/security/001-5-1-2-axiom-to-anchor-secure-transport-v1-concrete-profile-review-retu.trace.md)
- Current Core Secure Transport V1 implementation and qualification evidence from the accepted Loom return.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-secure-transport-v1-core-mechanics.trace.md](001-secure-transport-v1-core-mechanics.trace.md)
  - Value: 4rHf1_w8xTLJ7MwLOGqJwgv8VcSZPq3hXIeiYJvO7xM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DYrUB4LzHOq3T-Z2ED5wXe1dZTlsPU-djd8M8Yy0dc8