# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 01:32:23
  - Trace: [001-secure-transport-v1-core-mechanics.trace.md](../001-secure-transport-v1-core-mechanics.trace.md)
  - Origin:
    - [relative](../001-secure-transport-v1-core-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 01:32:58
  - Authors: Anchor
  - Why: Parallelize the now-semantically-unblocked Core mechanics while Refactor Anchor retains integration, Docs review and later CLI/host responsibilities.
  - Summary: Bounded Loom implementation of password-sealed Workspace transport mechanics in Core against the accepted Docs V1 contract.
  - Status: ready/local

---

# Core Secure Transport V1 implementation → Loom

## Handoff Parties

- Purpose: implement and qualify the host-neutral Core mechanics required by the accepted password-sealed Workspace transport V1 contract, without expanding into host UX, provider semantics or carrier-sealed routing.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- secure-transport-core-implementation
  - Transfer Kind: work-and-responsibility
  - Description: implement the smallest complete Core surface for schema/runtime validation, password profile execution, Workspace seal/open, recipient-slot wrapping, Handoff-package sealed bindings and post-open ordinary Workspace requalification required by the controlling Core Task.
  - Controlling Artifact: [Secure Transport V1 Core mechanics](001-secure-transport-v1-core-mechanics.trace.md)
  - Boundary: Core host-neutral mechanics only. Keep schema meaning subordinate to exact Docs contracts and keep existing clear carriers compatible.

- concrete-profile-qualification
  - Transfer Kind: work
  - Description: choose and qualify one explicit V1 profile with AES-256-GCM content encryption and an explicit password-KDF/key-wrap construction suitable for the current Core portability boundary. Record exact identifiers and parameters in evidence. If a safe interoperable profile requires widening dependencies or changing the Docs contract, stop and return a bounded review/blocker instead of silently choosing host defaults.
  - Controlling Artifact: [Secure Transport V1 Core mechanics](001-secure-transport-v1-core-mechanics.trace.md)
  - Boundary: implementation/profile qualification may propose a Docs review condition but does not grant Loom semantic-schema authority.

## Required Context

- core-workspace
  - Material: complete current Core source including portable Tooling, Handoff manufacture/orient/ground mechanics, schema runtime, release robustness and existing tests.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: sole writable implementation Workspace.
  - Availability: available

- docs-workspace
  - Material: complete current Docs source containing `tiinex.transport.envelope.v1`, refined `tiinex.handoff.package.v1`, Secure Transport allocation/qualification Decisions and canonical related schemas.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only semantic authority and exact implementation contract.
  - Availability: available

- business-workspace
  - Material: complete current Business source containing the Secure Transport outcome plus Anchor/Loom Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only product scope, authority and return discipline.
  - Availability: available

## Reference Context

- none

## Retained Responsibilities

- docs-semantic-authority
  - Retained By: Axiom / Docs-owning semantic authority and Refactor Anchor
  - Responsibility: decide any required canonical contract refinement exposed by implementation evidence.
  - Boundary: Loom may return a precise finding/proposal but must not silently redefine Docs semantics.

- cli-and-host-consumers
  - Retained By: Refactor Anchor / later owning lanes
  - Responsibility: CLI headless consumer proof and later VS Code/App/Site encryption UX after Core qualification.
  - Boundary: Loom does not mutate CLI, extension-vscode, App or Site.

- integration-and-promotion
  - Retained By: Refactor Anchor
  - Responsibility: three-way reconcile Loom return against this exact input and current frontier, then decide Core acceptance and subsequent CLI delegation.
  - Boundary: child return PASS is not automatic integration or publication authority.

## Exclusions And Dependencies

- non-core-source
  - Kind: excluded-scope
  - Description: do not mutate Docs, Business, CLI, extension-vscode, App, Site, Providers, Verses, Interop or Runtime source.
  - Responsible Party Or Role: Refactor Anchor / owning lanes.

- carrier-sealed-routing
  - Kind: excluded-scope
  - Description: V1 keeps the selected authoritative Handoff route Workspace clear. Do not invent encrypted selected-route discovery, hidden route manifests or carrier-sealed transport.
  - Responsible Party Or Role: future explicitly qualified work only.

- non-v1-credentials-and-signing
  - Kind: excluded-scope
  - Description: no ZipCrypto, Passkeys/WebAuthn, biometrics, hardware/security keys, cryptographic artifact signing or recipient identity attestation.
  - Responsible Party Or Role: future separately scoped work.

- publication
  - Kind: excluded-scope
  - Description: no npm/GitHub publication or remote writes.
  - Responsible Party Or Role: Refactor Anchor / Sigma after later qualification.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one normal Tiinex Handoff carrying complete changed Core source plus exact focused security/roundtrip/backward-compatibility evidence and any bounded Docs review finding. Existing Core qualification must remain green and no sibling Workspace may be changed.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: encryption UX is ready for Sigma, CLI/VS Code/App/Site may expose the feature, Secure Transport V1 is published, or successful authenticated decryption establishes Workspace semantics.
- Must Not Be Used To Claim: semantic authority from cryptographic authentication, recipient identity from a password slot, selected-route encryption support, or permission to mutate read-only carried Workspaces.
- Authority Limits: host-neutral Core implementation and qualification under the controlling Task only.
- Test Boundary: prefer a small high-value security/use-case suite covering exact roundtrip, wrong password/tamper/truncation/unsupported profile, recipient-slot independence, hidden-name-tree carriage, locked Required Context and clear-carrier regression. Do not freeze incidental implementation structure with broad snapshot-style tests.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-secure-transport-v1-core-mechanics.trace.md](../001-secure-transport-v1-core-mechanics.trace.md)
  - Value: 4rHf1_w8xTLJ7MwLOGqJwgv8VcSZPq3hXIeiYJvO7xM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0bq0_kV09Tz1-Xuxk7J2loaYuoAIqQmC6SATI6ALYOM