# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:58:54
  - Trace: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Origin:
    - [relative](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-09 18:40:30
  - Authors: Anchor
  - Why: Remove Handoff transport friction without making Core absorb VS Code-specific behavior or carrying unrelated parent Workspaces.
  - Summary: Bounded Core Tooling audit and implementation for minimal-context child carriers and the VS Code operator consumer surface.
  - Status: ready/local

---

## Handoff Parties

- Purpose: audit and harden only the generic portable Tooling mechanics that block a minimal-context VS Code Handoff operator flow, without absorbing editor-host behavior into Core.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- minimal-child-carrier-tooling
  - Transfer Kind: work-and-responsibility
  - Description: audit current Handoff manufacture/package-parent behavior and make the smallest generic change needed so a child carrier can preserve carrier lineage without automatically carrying unrelated parent Workspaces.
  - Controlling Artifact: [Core portable Tooling Task](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Boundary: generic portable Tooling only; no VS Code-specific semantics or UI logic.

- vscode-operator-shared-surface-audit
  - Transfer Kind: work
  - Description: verify that public Core operations used by extension-vscode are sufficient for qualified receive/workspace-source selection/manufacture/routing; implement a generic public primitive only when a concrete gap is demonstrated.
  - Controlling Artifact: [Core portable Tooling Task](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Boundary: do not edit extension-vscode; return host-specific needs as findings rather than moving them into Core.

## Required Context

- core-workspace
  - Material: complete current Core source including portable Tooling and focused tests.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable implementation scope.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current extension-vscode source as a read-only real consumer of public Tooling.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: concrete consumer evidence; it is not writable scope.
  - Availability: available

- docs-workspace
  - Material: canonical Handoff, Workspace, Parent and carrier semantic boundaries.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: keep transport optimization from changing semantic meaning.
  - Availability: available

- business-workspace
  - Material: controlling Turn-2 and Loom Role boundaries.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: work authority and return discipline.
  - Availability: available

## Reference Context

- none

## Retained Responsibilities

- extension-vscode-source
  - Retained By: Anchor
  - Responsibility: acceptance/reconciliation of VS Code implementation and coordination with its dedicated Anchor lane.
  - Boundary: Loom does not edit extension-vscode.

- semantic-authority
  - Retained By: Docs/owning semantic surfaces
  - Responsibility: Handoff/Workspace/Parent meaning.
  - Boundary: Tooling follows contracts; it does not redefine them for convenience.

## Exclusions And Dependencies

- broad-tooling-redesign
  - Kind: excluded-scope
  - Description: do not redesign carrier topology or add generalized framework machinery unless required by a reproduced blocker.
  - Responsible Party Or Role: Anchor

- release-publication
  - Kind: excluded-scope
  - Description: no npm/GitHub release mutation.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one normal Tiinex Handoff carrying complete current Core source if changed, exact focused test evidence, and a concise classification of any remaining VS Code-host-only friction.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Core owns VS Code UX, child carriers must always inherit parent source, or a transport optimization changes work/Parent lineage.
- Must Not Be Used To Claim: final Turn-2 stability or extension product acceptance.
- Authority Limits: shared portable Tooling mechanics within the controlling Core Task only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Value: WOMe5yr432wwydKlPQSPPZs95rGEXQrVoewCbGSt3iU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: k_IOWQRJwPDJ32CgDyuCrxsYkSoiJN7XmN9ij-KTy54