# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 13:50:29
  - Trace: [003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Origin:
    - [relative](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 13:50:29
  - Authors: Anchor
  - Why: The semantics are now accepted and bounded carrier closure is qualified; Core can implement the general minimal-carrier and transport projection primitive without host special cases.
  - Summary: Delegate the Docs Major 007 package/material/recipient contract implementation to Loom using Core Major 008 as the bounded-carriage foundation.
  - Status: ready/local

---

# Anchor To Loom — Core Major 009 Minimal Carrier And Transport Projection

## Handoff Parties

- Purpose: implement the accepted Docs Major 007 package/material/recipient contract in Core, using Core Major 008 bounded-representation closure as the mechanical foundation and preserving clean human-readable carrier output.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- bootstrap-only-carrier-mechanics
  - Transfer Kind: work-and-responsibility
  - Description: add manufacture/orient/validate support for the Docs-qualified bootstrap-only package role with Start/bootstrap only, explicit zero-material state and no selected Handoff route.
  - Controlling Artifact: [Core Major 009 Task](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Boundary: bootstrap qualification alone must not become Role, recipient, holder, current-work or grounded-to-act authority.

- material-representation-carriage
  - Transfer Kind: work-and-responsibility
  - Description: compose direct complete Workspace bindings with generic complete/bounded Workspace Representation bindings according to the updated package contract, reusing Core Major 008 bounded recipient closure rather than creating a special bounded package model.
  - Controlling Artifact: [Core Major 009 Task](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Boundary: representation scope and provider authority remain owned by existing Workspace Representation/External Payload contracts.

- transport-projection
  - Transfer Kind: work-and-responsibility
  - Description: expose qualified package-level generic transport text and Handoff-route-specific transport text/recipient labels from package truth so hosts can present Copy Package / Copy Transport Text / recipient rows without inventing semantics.
  - Controlling Artifact: [Core Major 009 Task](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Boundary: no host-private JSON or generated inventory may become required top-level carrier authority; recipient labels come only from the selected Handoff To endpoint.

## Required Context

- core-workspace
  - Material: complete current Core Workspace including Core Major 008 bounded Handoff-carrier recipient closure.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation source and exact predecessor mechanics.
  - Availability: available

- docs-workspace
  - Material: complete current Docs Workspace including the accepted Major 007 Decision and updated Handoff Package V1 contract.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only canonical semantic authority for implementation.
  - Availability: available

- business-workspace
  - Material: current Business Workspace containing Anchor and Loom Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint Role context.
  - Availability: available

## Reference Context

- core-major-008-return
  - Material: qualified Core Major 008 Loom return.
  - Material Reference: [Core Major 008 Return](003-1-1-loom-to-anchor-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md)
  - Purpose: exact predecessor bounded-recipient implementation and evidence.
  - Availability: available

- docs-major-007-decision
  - Material: accepted package/material/recipient semantics Decision.
  - Material Reference: [Docs Major 007 Decision](docs::.topics/handoff-package/001-1-1-1-1-1-axiom-minimal-carrier-material-recipient-semantics-decision.trace.md)
  - Purpose: controlling semantics for this mechanics Major.
  - Availability: available

## Retained Responsibilities

- semantics
  - Retained By: Axiom / Docs
  - Responsibility: own Handoff Package V1 semantic meaning; Core must return contradictions rather than silently redefine it.

- transport-host-ui
  - Retained By: Anchor / later Kodax
  - Responsibility: delegate Extension VS Code Transport presentation only after Core projection is qualified.

## Exclusions And Dependencies

- no-vscode-mutation
  - Kind: excluded-scope
  - Description: no Extension VS Code source/UI changes under this Handoff.

- no-json-semantic-sidecar
  - Kind: excluded-scope
  - Description: no new JSON artifact or host-private manifest may become required normal carrier semantic authority or top-level normal package output.

- protected-generic-bounded-material
  - Kind: excluded-scope
  - Description: protected/locked generic bounded representation carriage remains outside current accepted semantics.

- no-remote-action
  - Kind: excluded-scope
  - Description: no publication, release, push or deployment is authorized.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns one qualified Core Major 009 result with bootstrap-only manufacture/orient/validate, generic complete/bounded material carriage, Handoff-only recipient projection, package/route transport-text projection, no opaque semantic sidecars and full regression evidence.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: VS Code Transport UI is implemented, a carried Role is a recipient/holder, generic transport text creates a Handoff, or bootstrap-only carriage creates work authority.
- Must Not Be Used To Claim: product acceptance, remote mutation authority, schema redesign authority or release readiness.
- Authority Limits: Loom owns bounded Core mechanics only; Docs owns semantics; Anchor owns orchestration; later hosts own presentation only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md](../003-1-1-1-core-major-009-minimal-carrier-material-transport-projection.trace.md)
  - Value: DVmEYp_eROzOoBWE7a9OLbW3w3sG1QrnIRgGR7I8DEY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: SRfEBkI6dc5CtQcsondF_PeUc1faQcM89Nnknofb1LU