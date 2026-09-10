# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 23:48:32
  - Trace: [001-secure-transport-recipient-encryption.trace.md](../../../business::.topics/initiatives/refactor/security/001-secure-transport-recipient-encryption.trace.md)
  - Origin:
    - [relative](../../../business::.topics/initiatives/refactor/security/001-secure-transport-recipient-encryption.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 01:32:23
  - Authors: Anchor
  - Why: Turn the accepted Secure Transport semantics into a bounded Core implementation frontier before CLI or graphical hosts expose encryption behavior.
  - Summary: Host-neutral password-sealed Workspace transport mechanics, qualification and clear-carrier compatibility constrained by the accepted Docs V1 contract.
  - Status: active/local

---

# Secure Transport V1 Core mechanics

## Objective

Implement the smallest host-neutral Core capability that can manufacture, validate, open and requalify password-sealed Workspace transport exactly as declared by the accepted Docs Secure Transport V1 contract, without moving semantic authority or host UX into Core.

## Done Criteria

- Core can parse and validate `tiinex.transport.envelope.v1` and the sealed `tiinex.handoff.package.v1` binding fields with fail-closed diagnostics.
- Core implements one explicitly identified and independently qualified V1 password profile whose content-encryption primitive is AES-256-GCM. Password KDF, key-wrap construction, parameters, salt/nonces and binary framing are explicit and versioned; no hidden host defaults are permitted. If a safe interoperable profile cannot satisfy current browser/Node portability without widening dependencies or changing Docs semantics, return a bounded blocker/review request rather than inventing a silent fallback.
- Each protected Workspace uses a fresh random content key; multiple password recipient slots can independently unlock the same exact encrypted Workspace payload without re-encrypting that payload when slots change.
- Multiple protected Workspaces in one carrier remain cryptographically and operationally isolated, with independent content keys and recipient sets.
- The outer carrier exposes no protected Workspace filename, directory, `.topics` tree, inner Workspace-artifact path or plaintext byte inventory.
- Correct password + authenticated open recovers the exact original complete Workspace byte tree, followed by the ordinary safe-path, complete-coverage, Workspace/schema/integrity qualification path before provider activation.
- Wrong password, missing usable slot, unsupported profile/KDF/wrap, malformed metadata, ciphertext tamper, authenticated-metadata tamper, truncation, unsafe recovered paths, zero/multiple Workspace-artifact correlation matches and incomplete recovery fail closed without plaintext downgrade or partial landing.
- Passwords, derived password keys, wrapping keys and plaintext content keys never enter durable artifacts, logs, receipts, package manifests or continuation state. Recovered plaintext exists only transiently or at an explicit destination.
- V1 preserves the selected authoritative Handoff route Workspace as a clear verified snapshot. A sealed Required Context Workspace remains locked/unresolved until explicitly opened and post-open qualified.
- Existing clear Handoff/Workspace carriers remain backward-compatible and their qualification/roundtrip tests continue to pass.
- Qualification stays use-case-oriented: add the smallest focused tests needed to prove the above security and regression boundaries rather than snapshotting implementation details.

## Scope

Writable scope is `Tiinex/core` only. Work may touch Core schema runtime/registry material, portable Handoff manufacture/orient/ground/open mechanics, encrypted payload representation mechanics, public host-neutral APIs and focused Core tests/evidence.

Do not implement CLI command UX, VS Code/App/Site UI, provider-specific behavior, npm/GitHub publication, Passkeys/WebAuthn, ZipCrypto, hardware/biometric credentials, cryptographic artifact signing, recipient identity attestation or carrier-sealed routing.

The implementation must preserve the ownership split from Docs: Workspace identity stays Workspace-owned; protected ciphertext bytes/location/integrity stay External-Payload-owned; the Transport Envelope owns non-secret crypto profile/slot/open metadata; Handoff Package owns carrier binding/routing only; encryption success never becomes semantic authority.

## Dependencies

- [Business Secure Transport outcome](business::.topics/initiatives/refactor/security/001-secure-transport-recipient-encryption.trace.md)
- [Docs Secure Transport V1 contract qualification](docs::.topics/refactor/security/001-3-password-sealed-workspace-transport-v1-contract-qualification.trace.md)
- [Docs Transport Envelope schema](docs::.topics/.schemas/transport/envelope/tiinex.transport.envelope.v1.schema.md)
- [Docs Handoff Package schema](docs::.topics/.schemas/coordination/handoff/package/tiinex.handoff.package.v1.schema.md)
- Current qualified Core portable Handoff/Workspace packaging and grounding mechanics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-secure-transport-recipient-encryption.trace.md](../../../business::.topics/initiatives/refactor/security/001-secure-transport-recipient-encryption.trace.md)
  - Value: mE5p0IRNHqTZSCit6271ytohhQB8ly1yCGlOpgkPPw8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 4rHf1_w8xTLJ7MwLOGqJwgv8VcSZPq3hXIeiYJvO7xM