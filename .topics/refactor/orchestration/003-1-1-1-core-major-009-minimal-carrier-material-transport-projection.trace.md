# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 13:25:15
  - Trace: [003-1-1-loom-to-anchor-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md](handoffs/003-1-1-loom-to-anchor-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md)
  - Origin:
    - [relative](handoffs/003-1-1-loom-to-anchor-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 13:50:29
  - Authors: Anchor
  - Why: Core Major 008 closed bounded recipient closure; Docs Major 007 now defines the next mechanical carrier contract for zero-material bootstrap, generic bounded material and recipient-safe transport projection.
  - Summary: Implement Docs Major 007 bootstrap-only, generic material carriage and transport projection semantics in Core without opaque semantic sidecars.
  - Status: ready/local

---

# Core Major 009 — Minimal Carrier, Material Representation, And Transport Projection

## Objective

Implement the accepted Docs Major 007 Handoff Package V1 contract mechanically in Core without adding opaque semantic sidecars or host-specific recipient inference.

## Done Criteria

- `recipient-facing-bootstrap-carrier` can be manufactured, validated and oriented with qualified Start/bootstrap, zero direct Workspace Snapshot Bindings, zero Material Representation Bindings and no Handoff route.
- Bootstrap-only carriers expose generic human transport text derived from the exact Start artifact and do not claim recipient, holder, Role, Workspace, current work or `grounded-to-act` authority.
- `recipient-facing-workspace-carrier` accepts one or more qualified source-material bindings across direct complete Workspace Snapshot Bindings and/or generic complete/bounded `tiinex.workspace.representation.v1` bindings, with no selected Handoff route.
- `recipient-facing-handoff-carrier` accepts a selected route only when its authoritative Handoff is contained by clear qualified carried material, including bounded Workspace Representation material when appropriate.
- Core projects package-level generic transport text for every qualified package and route-specific transport text plus recipient label only from the exact selected Handoff `To` endpoint/capacity semantics.
- Role/material presence never manufactures recipient, holder, participation, delegation or work authority.
- Normal carrier output remains human-readable Tiinex Markdown artifacts plus declared ZIP/payload files. No new top-level JSON artifact, host-private manifest or generated inventory becomes semantic authority or normal package output.
- Existing complete Workspace, sealed complete Workspace and normal Handoff-carrier behavior remains regression-green.
- Full Core tests, portable tests, bootstrap qualification and focused zero-material/bounded/transport-projection tests pass.

## Scope

Core manufacture/orient/validate/recipient-v2/transport-projection mechanics needed to implement the accepted Docs Major 007 contract. Reuse Core Major 008 bounded Workspace Representation recipient-closure mechanics rather than reimplementing bounded semantics.

## Required Semantic Basis

- Docs Major 007 Decision: bootstrap-only carriers, generic complete/bounded material carriage, Handoff-only recipient projection and no opaque package sidecars.
- Updated `tiinex.handoff.package.v1` contract from Docs Major 007.
- Core Major 008 bounded Handoff-carrier recipient closure result.

## Dependencies

- Accepted Docs Major 007 `tiinex.handoff.package.v1` contract update.
- Qualified Core Major 008 bounded Handoff-carrier recipient closure.
- Current Business Role/endpoint material used only as qualified context for recipient/holder tests.

## Exclusions

- No Extension VS Code UI/Transport implementation.
- No new package schema family unless the accepted Docs contract proves mechanically impossible and the exact contradiction is returned to Anchor.
- No Role/Handoff/Workspace Representation semantic redefinition.
- No protected generic bounded-material design beyond current accepted Docs scope.
- No JSON semantic artifact added to normal carrier top-level output.
- No remote publication, release or push.

## Acceptance Boundary

Core owns mechanics only. A mechanically successful package does not create recipient/holder/work authority beyond the exact Docs-owned artifacts. Host Transport UX begins only after this Core projection is qualified.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-1-1-loom-to-anchor-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md](handoffs/003-1-1-loom-to-anchor-core-major-008-bounded-handoff-carrier-isolation-recipient-closure.trace.md)
  - Value: XLc2Ex7YQRcFZOFc0iKnHhcOHXIbzmPPAe-PTtW6xpY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: DVmEYp_eROzOoBWE7a9OLbW3w3sG1QrnIRgGR7I8DEY