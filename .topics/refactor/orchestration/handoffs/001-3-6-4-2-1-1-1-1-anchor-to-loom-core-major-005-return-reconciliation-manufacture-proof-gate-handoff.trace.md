# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Trace: [001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Origin:
    - [relative](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Authors: Anchor
  - Why: The read-only three-way comparator exists; the remaining need is a qualified mechanical gate with explicit conflict/deletion disposition boundaries.
  - Summary: Delegate the bounded Core reconciliation/manufacture proof gate so concurrent current-only and incoming-only source cannot be silently lost before recovery manufacture.
  - Status: ready/local

---

# Anchor To Loom — Core Major 005 Return Reconciliation And Manufacture Proof Gate

## Handoff Parties

- Purpose: delegate the bounded Core Major 005 implementation that converts current read-only three-way source comparison into a fail-closed reconciliation/manufacture proof gate without giving Tooling semantic merge authority.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- reconciliation-proof-gate
  - Transfer Kind: work-and-responsibility
  - Description: implement the exact Core mechanism required by the controlling Task so base/incoming/current preservation and conflict/deletion disposition become explicit before recovery manufacture can claim a reconciled source frontier.
  - Controlling Artifact: [Core Major 005 Task](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Boundary: classify and prove bytes mechanically; do not decide semantic merge correctness.

- regression-and-bootstrap-qualification
  - Transfer Kind: work-and-responsibility
  - Description: add focused regression for the real complete-return-overlay failure shape, conflict/deletion blocking, source preservation and manufacture/preflight integration; run full Core validation and embedded-bootstrap qualification.
  - Controlling Artifact: [Core Major 005 Task](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Boundary: no host-specific VS Code or Site implementation is transferred.

- anchor-operator-contract
  - Transfer Kind: work
  - Description: return a compact machine/human contract showing what Anchor must provide and what receipt proves before manufacture, including the explicit boundary between mechanical reconciliation evidence and Anchor/owner semantic disposition.
  - Controlling Artifact: [Core Major 005 Task](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Boundary: do not create new generic semantic authority from process convenience.

## Required Context

- core-workspace
  - Material: complete current Core Workspace including Major 004 canonical schema-reference repair and existing three-way source-frontier comparison mechanics.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation source.
  - Availability: available

- business-workspace
  - Material: current Business Workspace containing the evolved Anchor Role and reconciliation process authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only operating/authority boundary for the mechanical proof gate.
  - Availability: available

- docs-workspace
  - Material: current Docs Workspace containing the successor semantic grounding capsule and source-reconciliation semantic distinctions.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only canonical semantic boundary; no Docs changes are authorized.
  - Availability: available

## Reference Context

- prior-core-major-004-return
  - Material: accepted Loom return that closed canonical schema-reference authoring/renderer hygiene.
  - Material Reference: [Core Major 004 Return](001-3-6-4-2-1-1-loom-to-anchor-core-major-004-canonical-schema-reference-authori.trace.md)
  - Purpose: exact predecessor Major closure and Parent continuity.
  - Availability: available

- cross-repository-process
  - Material: Business reconciliation/Major/recovery continuation.
  - Material Reference: [Cross-Repository Work Turn Continuation](business::.topics/processes/002-2-cross-repository-work-turn-reconciliation-major-human-gate-continuation.trace.md)
  - Purpose: explicit process boundary that Tooling should mechanically support without replacing semantic disposition.
  - Availability: available

## Retained Responsibilities

- semantic-and-owner-disposition
  - Retained By: Anchor / owning specialist / Docs authority as applicable
  - Responsibility: decide whether a conflict, deletion or semantic change is acceptable after Tooling exposes it.

- process-authority
  - Retained By: Anchor / Business process owner
  - Responsibility: decide when the proof gate is mandatory in operating process; Loom implements the mechanics only.

## Exclusions And Dependencies

- automatic-byte-union-as-merge
  - Kind: excluded-scope
  - Description: Tooling must not treat union of non-conflicting paths as authority to resolve conflicting semantics or infer intentional deletion.
- docs-semantic-mutation
  - Kind: excluded-scope
  - Description: no canonical schema/policy change is delegated.
- remote-action
  - Kind: excluded-scope
  - Description: no push, npm publication, release, deployment or remote mutation is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns one qualified Core Major 005 implementation/evidence package proving the reconciliation/manufacture gate, preservation semantics, explicit conflict/deletion disposition requirement, and full Core regression/bootstrap qualification.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: Tooling can decide semantic merge correctness, Anchor may skip owner review, or a mechanically reconciled frontier is human/product accepted.
- Must Not Be Used To Claim: automatic semantic merge, intentional deletion inference, cross-repository implementation authority, release readiness or remote mutation permission.
- Authority Limits: Loom owns bounded Core mechanics; Anchor and declared owners retain semantic/integration disposition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Value: QXd_Yj3VRLrMppQF_qK1oNGD2CL28w3_iFgB9XSyCKo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: CKgqRPmXxDZPtXG2eaB8jimdVPU5-934bkVMOqqe4B0