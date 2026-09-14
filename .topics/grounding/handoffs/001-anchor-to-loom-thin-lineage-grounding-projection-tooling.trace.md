# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 13:51:00
  - Trace: [Thin-Lineage Grounding Projection And Source-Blocker Tooling](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
  - Origin:
    - [relative](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-14 13:52:00
  - Authors: Anchor
  - Why: Loom should own portable grounding mechanics while Anchor retains orchestration and Axiom independently reviews semantic boundaries.
  - Summary: Delegate thin-lineage participant/source projection, blockers and bounded orchestration-readiness mechanics to Loom.
  - Status: ready/local

---

# Anchor To Loom — Thin-Lineage Grounding Projection Tooling

## Handoff Parties

- Purpose: harden the portable grounding/projection mechanics required by the Thin-Lineage Anchor Grounding Epic without creating private semantic meaning in Core.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- participant-projection-audit-and-hardening
  - Transfer Kind: work-and-responsibility
  - Description: audit current endpoint/participant grounding projection and implement only general projections backed by exact current Role/Relation/Handoff authority.
  - Controlling Artifact: [Thin-Lineage Grounding Projection Tooling Task](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
  - Boundary: no inference from Role inventory, chat identity, package adjacency or filename labels.

- source-state-and-blocker-projection
  - Transfer Kind: work-and-responsibility
  - Description: make complete Workspace, bounded/cache material, explicit requirement/reference and unavailable-source states fail-visible to recipients, including an exact blocker surface for missing authoritative material.
  - Controlling Artifact: [Thin-Lineage Grounding Projection Tooling Task](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
  - Boundary: do not auto-select remote/connectors as substitute authority.

- pointerless-recovery-basis-audit
  - Transfer Kind: work-and-responsibility
  - Description: inspect why the current pointerless latest package can orient complete Workspace material but cannot serve as `audit-recovery-acceptance` basis; preserve fail-closed Handoff qualification while making the exact recovery boundary/blocker mechanically usable.
  - Controlling Artifact: [Thin-Lineage Grounding Projection Tooling Task](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
  - Boundary: do not redefine a pointerless Workspace package as a Handoff merely to satisfy the audit.

- orchestration-readiness-projection
  - Transfer Kind: work
  - Description: determine whether existing qualified facts can expose a bounded orchestration-readiness diagnostic distinct from route authorization without inventing a new semantic lifecycle state.
  - Controlling Artifact: [Thin-Lineage Grounding Projection Tooling Task](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
  - Boundary: return semantic gaps to Anchor/Axiom.

## Required Context

- core-workspace
  - Material: complete current Core Workspace including portable grounding, package, cache/material and recipient projection source.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable shared Tooling implementation source.
  - Availability: available

- docs-workspace
  - Material: complete current Docs Workspace including Role/Relation/Handoff/Workspace semantics.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only canonical authority; semantic contradictions must be returned, not guessed.
  - Availability: available

- business-workspace
  - Material: current Business Workspace including the controlling Epic and Anchor/Loom/Axiom/Sigma Role authority.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only organizational purpose, endpoint roles and operating constraints.
  - Availability: available

## Reference Context

- current-vscode-workspace
  - Material: current Extension VS Code Workspace.
  - Material Reference: [VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: optional read-only host evidence when determining whether a remaining gap is shared Core or host-local; no source mutation is transferred.
  - Availability: available

## Retained Responsibilities

- semantic-disposition
  - Retained By: Axiom / Anchor
  - Responsibility: settle any participant/source semantic gap discovered during implementation.
  - Boundary: Core must remain fail-closed until authority exists.

- business-orchestration-and-recovery
  - Retained By: Anchor
  - Responsibility: reconcile parallel returns, mutate Business if accepted and issue full recovery/fresh validation carriers.
  - Boundary: Loom does not self-close the Business Epic.

- host-specific-implementation
  - Retained By: Anchor / later routed Role
  - Responsibility: open an Extension VS Code or other host Task only if shared qualification proves a host-local defect.
  - Boundary: no extension source mutation in this Handoff.

## Exclusions And Dependencies

- docs-semantic-write
  - Kind: excluded-scope
  - Description: no canonical semantic change under Loom authority.
  - Responsible Party Or Role: Axiom

- business-source-write
  - Kind: excluded-scope
  - Description: no Business mutation under Loom authority.
  - Responsible Party Or Role: Anchor

- remote-recovery
  - Kind: excluded-scope
  - Description: no automatic GitHub/connector source acquisition when local qualified authority is missing.
  - Responsible Party Or Role: Anchor/operator under explicit authority

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one qualified Loom result with exact implementation/audit delta, tests, unresolved semantic blockers and whether any host-specific follow-on remains.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: every carried Role becomes a participant, Core owns canonical participant semantics, Business must be present in every package, or `grounded-to-act` becomes global project grounding.
- Must Not Be Used To Claim: VS Code host acceptance, fresh-Anchor acceptance, remote recovery authority or Business Epic closure.
- Authority Limits: Loom owns bounded shared mechanics; Axiom owns semantic meaning; Anchor owns orchestration/integration/recovery.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Thin-Lineage Grounding Projection And Source-Blocker Tooling](../001-thin-lineage-grounding-projection-tooling-task.trace.md)
  - Value: DzpLz9RZ2HwtZErMpejasMiZlgd_syUbpyNWOeh0ppI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:JaLg4xqb6V_X513hkrQhPYukf1kwrIrTF7f0Qc1eLdM
