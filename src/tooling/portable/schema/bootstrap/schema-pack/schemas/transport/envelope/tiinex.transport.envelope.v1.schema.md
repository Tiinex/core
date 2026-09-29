# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-09-10 03:06:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.transport.envelope.v1](tiinex.transport.envelope.v1.schema.md)
  - Created At: 2026-09-10 03:06:00
  - Authors: Anchor
  - Why: Password-sealed Workspace transport needs one deterministic owner for non-secret cryptographic profile, recipient-slot, open/recovery, and fail-closed qualification metadata without moving payload-byte, Workspace, privacy, Handoff, or semantic authority into encryption.
  - Summary: Canonical V1 transport-envelope contract for password-sealed Workspace payloads with explicit profile metadata, independently usable password recipient slots, runtime-only secrets, and post-open semantic requalification.

---

# Transport Envelope

- Status: maintained schema note

## Summary

`tiinex.transport.envelope.v1` defines the deterministic, non-secret envelope metadata needed to open one password-sealed Workspace representation payload without treating encryption as Workspace identity, Handoff authority, provenance, semantic truth, or payload-byte integrity authority.

The protected ciphertext bytes remain owned by an explicit `tiinex.external.payload.v1` artifact. The referenced `tiinex.workspace.v1` artifact remains Workspace identity. Package-local or generic Workspace-representation contracts remain the owners of Workspace-to-byte-tree representation semantics. `tiinex.privacy.boundary.v1` remains the owner of disclosure and sharing policy when such policy has independent artifact value.

This V1 contract does not choose a universal KDF cost, AEAD algorithm, key-wrap algorithm, binary envelope layout, or host UX. Instead, every concrete envelope must declare the exact profile and algorithm metadata needed by a qualified implementation, and consumers must fail closed when any declared profile surface is unsupported or inconsistent.

## Schema Validation Contract

### Transport Envelope Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.transport.envelope.v1`

Rules

- `tiinex.transport.envelope.v1` identifies artifacts whose main job is to declare one password-sealed Workspace transport envelope around one explicit protected External Payload.
- The envelope is a transport/opening contract. It must not replace the protected External Payload artifact, the Workspace artifact, a Workspace Representation artifact, a Handoff, a Privacy Boundary, an integrity method, or a cryptographic implementation.
- Schema validity does not prove that the password is known, that the payload can be opened, that the ciphertext is authentic, or that recovered Workspace semantics qualify.
- Prose outside `Schema Validation Contract` may explain the envelope, but it does not add required validation rules.

### Transport Envelope Body

Required Shape

- first body heading after the continuity envelope
- `## Envelope Binding` section
- `## Payload Protection Profile` section
- `## Password Recipient Slots` section
- `## Open And Recovery Contract` section
- `## Qualification Boundary` section
- `## Disclosure Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Basis
- Related Artifacts
- References

Rules

- Required sections must remain human-readable and machine-extractable without inspecting ciphertext contents.
- `Password Recipient Slots` uses repeated named declarations.
- The visible envelope must never contain protected Workspace filename/path inventory, plaintext Workspace bytes, passwords, password-derived key material, or plaintext content keys.

### Envelope Binding

Required Fields

- Workspace Artifact
- Protected Payload
- Envelope Purpose
- Envelope Version
- Plaintext Representation Kind
- Protected Name Tree
- Workspace Binding Method
- Workspace Binding Value
- Content Key Scope

Field Value Constraints

- Workspace Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Protected Payload
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Envelope Purpose
  - Allowed Value: password-sealed-workspace-transport
  - Domain Policy: closed
- Envelope Version
  - Allowed Value: 1
  - Domain Policy: closed
- Plaintext Representation Kind
  - Allowed Value: exact-workspace-byte-tree-archive
  - Domain Policy: closed
- Protected Name Tree
  - Allowed Value: sealed
  - Domain Policy: closed
- Workspace Binding Method
  - Allowed Value: sha256-exact-visible-workspace-artifact-bytes
  - Domain Policy: closed
- Content Key Scope
  - Allowed Value: fresh-random-per-protected-workspace
  - Domain Policy: closed

Rules

- `Workspace Artifact` must resolve to exactly one explicit artifact intended to resolve as `tiinex.workspace.v1`. The link is a cryptographic consistency target only and does not let the envelope own or redefine Workspace identity.
- `Protected Payload` must resolve to exactly one explicit artifact intended to resolve as `tiinex.external.payload.v1`. That artifact remains the owner of ciphertext payload identity, location, media/format metadata, exact stored-byte integrity, access, retention, and recovery-reference semantics.
- `Envelope Purpose: password-sealed-workspace-transport` limits V1 to password-based Workspace-sealed transport. Generic encrypted artifacts, field encryption, carrier-sealed routing, cryptographic signing, and identity attestation remain outside this schema.
- `Plaintext Representation Kind: exact-workspace-byte-tree-archive` means a successful open is intended to recover one path-addressable complete Workspace byte-tree archive. It does not assert a maintained Archive or ZIP schema and does not itself prove complete coverage.
- `Protected Name Tree: sealed` means protected Workspace-relative filenames, directory names, `.topics` structure, lineage paths, and inner Workspace-artifact location must not be exposed by the visible envelope or outer carrier inventory.
- `Workspace Binding Method: sha256-exact-visible-workspace-artifact-bytes` requires `Workspace Binding Value` to be the lowercase 64-character SHA-256 digest of the exact visible bytes of `Workspace Artifact` used by the carrier/binding. This digest is a representation-level consistency token, not logical Workspace identity, provenance, semantic authority, or a substitute for Root integrity.
- Security-relevant profile authentication must bind the declared Workspace binding value so successful open cannot silently detach the ciphertext from the exact visible Workspace artifact selected by the surrounding representation/carrier contract.
- `Content Key Scope: fresh-random-per-protected-workspace` requires one independently generated content-encryption key per protected Workspace representation. Reusing one content key across independently protected Workspaces is outside V1 qualification.

### Payload Protection Profile

Required Fields

- Profile Id
- Profile Version
- Content Encryption Algorithm
- Content Encryption Parameters
- Nonce Or IV Encoding
- Nonce Or IV
- Payload Authentication Rule
- Security Metadata Authentication Rule
- Recipient Change Payload Rule

Field Value Constraints

- Profile Version
  - Allowed Shape: positive integer
  - Domain Policy: closed
- Content Encryption Parameters
  - Allowed Shape: JSON object
  - Domain Policy: closed
- Nonce Or IV Encoding
  - Allowed Value: base64url-no-padding
  - Domain Policy: closed
- Payload Authentication Rule
  - Allowed Value: authenticated-encryption-required
  - Domain Policy: closed
- Security Metadata Authentication Rule
  - Allowed Value: authenticate-profile-and-workspace-binding
  - Domain Policy: closed
- Recipient Change Payload Rule
  - Allowed Value: protected-payload-bytes-unchanged
  - Domain Policy: closed

Rules

- `Profile Id` must be a stable implementation-recognizable profile identifier. `Profile Version` versions the interpretation of that profile.
- `Content Encryption Algorithm` and `Content Encryption Parameters` must explicitly identify the authenticated-encryption algorithm and every algorithm parameter needed to interpret the protected payload under the declared profile. Consumers must not supply omitted defaults from host preference.
- `Content Encryption Parameters` must be a JSON object. Duplicate keys, non-object values, or parameters not accepted by the declared qualified profile are invalid.
- `Nonce Or IV` must be the concrete nonce/IV value required for this protected payload, encoded according to `Nonce Or IV Encoding`. Nonce/IV material is non-secret metadata but remains security-relevant.
- `Payload Authentication Rule: authenticated-encryption-required` means a successful password/KDF/key-unwrapping step is insufficient by itself. The recovered candidate content key must authenticate the protected payload before plaintext is accepted.
- `Security Metadata Authentication Rule: authenticate-profile-and-workspace-binding` requires the qualified profile to authenticate, directly or through an equivalent fail-closed construction, the profile/version, content-encryption parameters, nonce/IV semantics, and Workspace binding value used for open. Root/self-integrity alone is not cryptographic authentication.
- `Recipient Change Payload Rule: protected-payload-bytes-unchanged` means adding, replacing, or removing password recipient slots may change envelope/slot material but must not require duplicating or re-encrypting the protected Workspace payload bytes. A profile that cannot preserve this property is outside V1.
- This schema does not choose the global default algorithm, KDF cost, or key-wrap algorithm. Core qualification may support a bounded set of exact profiles, but unsupported or inconsistent declarations must fail closed rather than falling back to another profile.

### Password Recipient Slots

Declaration Shape

- First-Level Hyphen List Item

Required Fields

- Slot Id
- Slot Kind
- KDF Algorithm
- KDF Salt Encoding
- KDF Salt
- KDF Parameters
- Key Wrap Algorithm
- Key Wrap Parameters
- Wrapped Content Key Encoding
- Wrapped Content Key
- Slot Verification Rule

Optional Fields

- Recipient Hint

Field Value Constraints

- Slot Kind
  - Allowed Value: password
  - Domain Policy: closed
- KDF Salt Encoding
  - Allowed Value: base64url-no-padding
  - Domain Policy: closed
- KDF Parameters
  - Allowed Shape: JSON object
  - Domain Policy: closed
- Key Wrap Parameters
  - Allowed Shape: JSON object
  - Domain Policy: closed
- Wrapped Content Key Encoding
  - Allowed Value: base64url-no-padding
  - Domain Policy: closed
- Slot Verification Rule
  - Allowed Value: unwrap-then-authenticate-protected-payload
  - Domain Policy: closed

Rules

- Every slot must have one envelope-local unique `Slot Id`. Slot identifiers are routing/readability handles only and are not recipient identity, Workspace identity, permission, provenance, or semantic authority.
- `Slot Kind: password` is the only recipient kind in V1. Passkeys, WebAuthn, biometrics, hardware/security keys, account-provider credentials, recovery services, and identity attestations remain outside V1.
- `KDF Algorithm`, `KDF Salt`, and `KDF Parameters` must be explicit enough that a qualified implementation can derive the candidate wrapping key without hidden defaults. Unknown or unsupported KDF metadata fails closed.
- `KDF Parameters` and `Key Wrap Parameters` must be JSON objects. Duplicate keys, malformed objects, or parameters not accepted by the declared algorithm/profile are invalid.
- `Key Wrap Algorithm`, `Key Wrap Parameters`, and `Wrapped Content Key` must explicitly define the slot-specific content-key wrapping material needed by a qualified implementation. Unknown or unsupported wrapping metadata fails closed.
- Passwords and password-derived keys must never appear in slot fields, recipient hints, Handoff prose, logs, receipts, persistent continuation state, package manifests, or other durable Tiinex material.
- `Recipient Hint`, when present, must be non-secret and must not be treated as authenticated identity, proof of entitlement, or a password-recovery bypass.
- Every qualified slot must unwrap or derive a candidate for the same Workspace content key used by the protected payload. Different slots authorize independent recovery paths to that same key; they do not define different Workspace identities or duplicate payloads.
- `Slot Verification Rule: unwrap-then-authenticate-protected-payload` means a slot succeeds only when its candidate content key causes the protected payload and required authenticated security metadata to verify. A syntactically successful unwrap without payload authentication is not a successful open.
- Slot addition/removal must preserve the exact protected payload bytes under the V1 recipient-change rule. Changing recipient slots must not silently change Workspace source bytes or semantic lineage.

### Open And Recovery Contract

Required Fields

- Open Rule
- Wrong Password Result
- Unsupported Profile Result
- Malformed Metadata Result
- Authentication Failure Result
- Missing Authorized Slot Result
- Secret Persistence
- Plaintext Persistence
- Recovery Rule
- Failure Policy
- Multi-Workspace Isolation

Field Value Constraints

- Open Rule
  - Allowed Value: any-one-qualified-password-slot
  - Domain Policy: closed
- Wrong Password Result
  - Allowed Value: locked
  - Domain Policy: closed
- Unsupported Profile Result
  - Allowed Value: unsupported
  - Domain Policy: closed
- Malformed Metadata Result
  - Allowed Value: failed
  - Domain Policy: closed
- Authentication Failure Result
  - Allowed Value: failed
  - Domain Policy: closed
- Missing Authorized Slot Result
  - Allowed Value: locked
  - Domain Policy: closed
- Secret Persistence
  - Allowed Value: runtime-only
  - Domain Policy: closed
- Plaintext Persistence
  - Allowed Value: transient-or-explicit-destination-only
  - Domain Policy: closed
- Recovery Rule
  - Allowed Value: no-hidden-bypass
  - Domain Policy: closed
- Failure Policy
  - Allowed Value: fail-closed
  - Domain Policy: closed
- Multi-Workspace Isolation
  - Allowed Value: independent-envelope-content-key-and-recipient-set
  - Domain Policy: closed

Rules

- `Open Rule: any-one-qualified-password-slot` means any one qualified password slot may independently recover the one content key for this protected Workspace payload.
- Wrong password and absence of a usable authorized slot preserve a locked state. They must not trigger plaintext fallback, alternate decoder guessing, partial landing, recipient inference, or hidden recovery.
- Unsupported profile/KDF/wrap/decoder capability, malformed metadata, payload authentication failure, truncated ciphertext, or inconsistent binding metadata fail closed.
- `Secret Persistence: runtime-only` means passwords, derived keys, and plaintext content keys are ephemeral execution secrets and must not become durable Tiinex artifacts or control metadata.
- `Plaintext Persistence: transient-or-explicit-destination-only` means recovered Workspace plaintext may exist transiently for qualification or may be written only to an explicit destination/recovery action. Successful open does not authorize hidden caches or background persistence.
- `Recovery Rule: no-hidden-bypass` means password loss has no implicit recovery path. Recovery comes only from another explicitly usable slot in this envelope or a future separately qualified recovery mechanism.
- `Multi-Workspace Isolation: independent-envelope-content-key-and-recipient-set` means one protected Workspace envelope grants no opening authority for another Workspace, even inside the same outer carrier. Each protected Workspace has its own content key and recipient-slot set.

### Qualification Boundary

Required Fields

- Payload Byte Integrity Owner
- Envelope Root Integrity Meaning
- Cryptographic Authentication Meaning
- Provider State While Locked
- Post-Open Qualification
- Semantic Authority

Field Value Constraints

- Payload Byte Integrity Owner
  - Allowed Value: external-payload
  - Domain Policy: closed
- Envelope Root Integrity Meaning
  - Allowed Value: metadata-continuity-only
  - Domain Policy: closed
- Cryptographic Authentication Meaning
  - Allowed Value: encrypted-representation-and-profile-binding-only
  - Domain Policy: closed
- Provider State While Locked
  - Allowed Value: inactive
  - Domain Policy: closed
- Post-Open Qualification
  - Allowed Value: normal-workspace-representation-and-schema-integrity
  - Domain Policy: closed
- Semantic Authority
  - Allowed Value: none
  - Domain Policy: closed

Rules

- `Payload Byte Integrity Owner: external-payload` preserves exact ciphertext-byte integrity ownership in the referenced External Payload artifact. The envelope must not duplicate or override that artifact merely because it needs the bytes for open.
- `Envelope Root Integrity Meaning: metadata-continuity-only` means Tiinex Root/self integrity can detect representation change relative to a trusted reference but is not password authentication, AEAD authentication, signature, origin proof, or identity attestation.
- `Cryptographic Authentication Meaning: encrypted-representation-and-profile-binding-only` means successful authenticated open proves only that the cryptographic construction accepted the encrypted representation/profile binding under the recovered content key. It does not prove Workspace semantic correctness, Parent truth, provenance, authorship, acceptance, completion, identity, permission, or factual truth.
- `Provider State While Locked: inactive` means the presence of a schema-valid envelope, visible Workspace artifact, valid ciphertext digest, or package inventory is insufficient to activate a complete Workspace source provider before authorized open and post-open qualification.
- `Post-Open Qualification: normal-workspace-representation-and-schema-integrity` means recovered plaintext bytes must pass the ordinary exact-byte, safe-entry, Workspace/representation, schema, integrity, Handoff, and other applicable qualification paths. Encryption success does not bypass them.
- Any mismatch between the envelope's Workspace reference/binding value and the surrounding carrier or representation contract must fail closed.

### Disclosure Boundary

Required Fields

- Outer Visible Material
- Must Remain Sealed
- Forbidden Durable Secrets
- Privacy Policy Owner

Field Value Constraints

- Outer Visible Material
  - Allowed Value: non-secret-envelope-profile-and-slot-metadata
  - Domain Policy: closed
- Must Remain Sealed
  - Allowed Value: workspace-internal-paths-tree-and-plaintext-bytes
  - Domain Policy: closed
- Forbidden Durable Secrets
  - Allowed Value: passwords-derived-keys-and-plaintext-content-key
  - Domain Policy: closed
- Privacy Policy Owner
  - Allowed Value: privacy-boundary-when-needed
  - Domain Policy: closed

Rules

- The visible envelope may expose only the minimum non-secret metadata needed to identify the protected payload, exact profile, password slots, and fail-closed open contract.
- The visible envelope must not serialize protected Workspace filenames, inner paths, directory structure, `.topics` layout, mapping manifests containing those names, or plaintext Workspace bytes.
- Passwords, derived KDF output, wrapping keys, and plaintext content keys are forbidden durable fields.
- `Privacy Policy Owner: privacy-boundary-when-needed` preserves `tiinex.privacy.boundary.v1` as the semantic owner of sharing, disclosure, serialization, sensitivity, or recipient policy that has independent value. Cryptographic access capability is not privacy policy or consent.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Used As
- Algorithm Choice Boundary
- Binary Format Boundary

Rules

- `Does Not Prove` must name semantic, identity, provenance, permission, or truth claims not established by encryption/open success.
- `Must Not Be Used As` must keep the envelope separate from Workspace, Handoff, External Payload, Workspace Representation, Privacy Boundary, consent, identity, provenance, attestation, and semantic authority.
- `Algorithm Choice Boundary` must state that a concrete implementation supports only independently qualified declared profiles; this schema does not silently choose a host default when an algorithm/KDF/wrap declaration is absent or unsupported.
- `Binary Format Boundary` must state that this schema defines semantic metadata and qualification rules, not a particular binary framing or implementation layout. Core may define a host-neutral binary/sidecar representation only if it preserves these fields and fail-closed semantics.

### File Naming

Recommended Shape

- `<lineage>-transport-envelope.trace.md`
- `<lineage>-<protected-workspace>-transport-envelope.trace.md`

Rules

- Envelope filenames are readability aids only and must not become Workspace identity, slot identity, or cryptographic binding authority.
- Protected internal Workspace filenames must not be encoded into the outer envelope filename.

## Artifact Creation Contract

### Creation Scope

Create `tiinex.transport.envelope.v1` only when one password-sealed Workspace representation payload needs durable non-secret profile/slot/open semantics that survive independently from the ciphertext External Payload reference.

Do not create this schema merely because bytes are encrypted or access is restricted.

### Required Inputs

- Workspace Artifact
- Protected Payload
- Envelope Purpose
- Envelope Version
- Plaintext Representation Kind
- Protected Name Tree
- Workspace Binding Method
- Workspace Binding Value
- Content Key Scope
- Profile Id
- Profile Version
- Content Encryption Algorithm
- Content Encryption Parameters
- Nonce Or IV Encoding
- Nonce Or IV
- Payload Authentication Rule
- Security Metadata Authentication Rule
- Recipient Change Payload Rule
- one or more Password Recipient Slots
- Open And Recovery Contract
- Qualification Boundary
- Disclosure Boundary
- Interpretation Limits

### Generation Rules

- Generate only non-secret envelope metadata.
- Require at least one password recipient slot for V1 manufacture.
- Preserve exact external-payload ownership for ciphertext location/integrity and exact Workspace ownership for semantic identity.
- Require a concrete profile, algorithm declarations, nonce/IV, KDF salts/parameters, key-wrap metadata, and wrapped content-key bytes; never rely on host defaults.
- Never serialize password input, derived keys, wrapping keys, or plaintext content keys.
- Keep recipient-slot mutation independent from protected payload bytes.
- Fail closed rather than emit a downgraded/plaintext or partially specified envelope.

## Minimal Example

```md
# Password-sealed Docs Workspace transport envelope

## Envelope Binding

- Workspace Artifact: [Docs Workspace](docs.workspace.md)
- Protected Payload: [Docs protected payload](docs-protected-payload.trace.md)
- Envelope Purpose: password-sealed-workspace-transport
- Envelope Version: 1
- Plaintext Representation Kind: exact-workspace-byte-tree-archive
- Protected Name Tree: sealed
- Workspace Binding Method: sha256-exact-visible-workspace-artifact-bytes
- Workspace Binding Value: <64 lowercase hexadecimal characters>
- Content Key Scope: fresh-random-per-protected-workspace

## Payload Protection Profile

- Profile Id: implementation-qualified-password-workspace-profile
- Profile Version: 1
- Content Encryption Algorithm: implementation-qualified-aead
- Content Encryption Parameters: {}
- Nonce Or IV Encoding: base64url-no-padding
- Nonce Or IV: <base64url nonce or IV>
- Payload Authentication Rule: authenticated-encryption-required
- Security Metadata Authentication Rule: authenticate-profile-and-workspace-binding
- Recipient Change Payload Rule: protected-payload-bytes-unchanged

## Password Recipient Slots

- recipient-1
  - Slot Id: recipient-1
  - Slot Kind: password
  - KDF Algorithm: implementation-qualified-kdf
  - KDF Salt Encoding: base64url-no-padding
  - KDF Salt: <base64url salt>
  - KDF Parameters: {}
  - Key Wrap Algorithm: implementation-qualified-key-wrap
  - Key Wrap Parameters: {}
  - Wrapped Content Key Encoding: base64url-no-padding
  - Wrapped Content Key: <base64url wrapped key>
  - Slot Verification Rule: unwrap-then-authenticate-protected-payload

## Open And Recovery Contract

- Open Rule: any-one-qualified-password-slot
- Wrong Password Result: locked
- Unsupported Profile Result: unsupported
- Malformed Metadata Result: failed
- Authentication Failure Result: failed
- Missing Authorized Slot Result: locked
- Secret Persistence: runtime-only
- Plaintext Persistence: transient-or-explicit-destination-only
- Recovery Rule: no-hidden-bypass
- Failure Policy: fail-closed
- Multi-Workspace Isolation: independent-envelope-content-key-and-recipient-set

## Qualification Boundary

- Payload Byte Integrity Owner: external-payload
- Envelope Root Integrity Meaning: metadata-continuity-only
- Cryptographic Authentication Meaning: encrypted-representation-and-profile-binding-only
- Provider State While Locked: inactive
- Post-Open Qualification: normal-workspace-representation-and-schema-integrity
- Semantic Authority: none

## Disclosure Boundary

- Outer Visible Material: non-secret-envelope-profile-and-slot-metadata
- Must Remain Sealed: workspace-internal-paths-tree-and-plaintext-bytes
- Forbidden Durable Secrets: passwords-derived-keys-and-plaintext-content-key
- Privacy Policy Owner: privacy-boundary-when-needed

## Interpretation Limits

- Does Not Prove: Workspace semantic correctness, Parent truth, provenance, authorship, permission, identity, acceptance, completion, or factual truth
- Must Not Be Used As: Workspace identity, Handoff authority, External Payload integrity owner, generic Workspace Representation, privacy policy, consent, or identity attestation
- Algorithm Choice Boundary: only explicitly declared independently qualified profiles are usable; unsupported or missing profile data fails closed
- Binary Format Boundary: semantic contract only; no binary framing or host-specific implementation is defined here
```

## Validation-Friendly Shape

Keep the schema note in the exact section order used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

The body headings required for artifacts using this schema are: `## Envelope Binding`, `## Payload Protection Profile`, `## Password Recipient Slots`, `## Open And Recovery Contract`, `## Qualification Boundary`, `## Disclosure Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- encrypted payload bytes are External Payload material, not Workspace identity
- a password slot is an opening mechanism, not a person/Role identity or permission artifact
- authenticated open is representation authentication, not semantic truth
- Workspace source becomes provider-ready only after successful open and ordinary post-open qualification
- filename/tree confidentiality applies to protected Workspace internals, not necessarily to outer Workspace inventory or route metadata
- carrier-sealed routing and protected authoritative Handoff routing are outside V1

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Value: QXbg7uxlhO1ou4PukRaub3fSJ_Ef32mSubsI2ib1LH0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: GbwZGMEaMolnbIg_heiJQ4famJpffaWz2E1xuU_PEII