# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 19:59:24
  - Trace: [001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md](../001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Origin:
    - [relative](../001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 19:59:25
  - Authors: Anchor
  - Why: We need truthful replacement-safe carriers before treating Pack as complete; Core must prove or repair its exact mechanics boundary first.
  - Summary: Delegate the bounded runtime/source manufacture mismatch to Loom while keeping VS Code host mutation out of Core authority.
  - Status: ready/local

---

# Anchor To Loom — Core Major 003 Manufacture Runtime And Source Hygiene Alignment

## Handoff Parties

- Purpose: resolve the observed mismatch between current Core manufacture-source hygiene and the runtime/tooling bytes actually used by the full-pack host path, without hiding a host-owned dependency problem inside Core.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- reproduce-runtime-source-mismatch
  - Transfer Kind: work-and-responsibility
  - Description: reproduce the observed package-manufacture hygiene mismatch against the exact carried Core/VS Code source frontier, identify the exact runtime bytes and loader path responsible, and preserve evidence that distinguishes stale-runtime execution from current Core source behavior.
  - Controlling Artifact: [Core Major 003 Task](../001-1-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Boundary: do not infer ownership from package placement; identify it from exact mechanics.

- core-mechanics-repair
  - Transfer Kind: work-and-responsibility
  - Description: implement the smallest Core-owned repair that makes manufacture/bootstrap source hygiene deterministic and prevents a stale runtime from silently masquerading as the current source contract. Add focused regression and full portable/bootstrap qualification.
  - Controlling Artifact: [Core Major 003 Task](../001-1-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Boundary: no extension-vscode source mutation is transferred.

- host-owner-return
  - Transfer Kind: work
  - Description: if exact evidence shows the remaining failure is extension-vscode package loading/install/link state rather than Core mechanics, return the smallest explicit host blocker and required Core contract to Anchor for separate Kodax routing.
  - Controlling Artifact: [Core Major 003 Task](../001-1-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Boundary: Loom must not patch host UX/integration privately.

## Required Context

- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable mechanics source and current manufacture/bootstrap implementation.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: read-only exact host integration/package-loading context for the observed full-pack behavior.
  - Availability: available

- business-workspace
  - Material: current Business Workspace containing Anchor and Loom Role endpoints.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint Role authority.
  - Availability: available

- docs-workspace
  - Material: current Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: canonical semantic boundary context; no Docs change is authorized.
  - Availability: available

## Reference Context

- repository-local-frontier
  - Material: current Core repository-local orchestration frontier.
  - Material Reference: [Core Repository Local Orchestration Frontier](../001-core-repository-local-orchestration-frontier.trace.md)
  - Purpose: preserve Core-owned continuity.
  - Availability: available

- manufacture-hygiene-regression
  - Material: current manufacture-hygiene regression cases.
  - Material Reference: [Manufacture Hygiene Tests](../../../../test/manufacture-hygiene.test.mjs)
  - Purpose: current expected exclusion behavior for `.release`, `.outgoing-handoff-packages`, and `.vscode/link`.
  - Availability: available

## Retained Responsibilities

- host-specific-repair
  - Retained By: Anchor / Kodax when separately delegated
  - Responsibility: modify extension-vscode host integration only if Loom proves the defect remains host-owned after Core mechanics are qualified.

- semantic-boundary
  - Retained By: Axiom / Docs
  - Responsibility: canonical semantics remain unchanged by this mechanics major.

## Exclusions And Dependencies

- no-vscode-private-edit
  - Kind: excluded-scope
  - Description: extension-vscode is read-only context in this Handoff.

- no-format-redesign
  - Kind: excluded-scope
  - Description: do not redesign Handoff Package semantics or carrier lineage to solve a runtime/source mismatch unless an irreducible blocker is proven and returned.

- no-remote-action
  - Kind: excluded-scope
  - Description: no push, npm publication, release or deployment is authorized.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one qualified Loom-to-Anchor Handoff with exact reproduction, owner disposition, bounded Core repair where applicable, focused regression, and full relevant Core portable/bootstrap qualification.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: a clean Core suite proves the VS Code host is using those same bytes, or that a host-local installation state becomes Core semantic authority.
- Must Not Be Used To Claim: extension-vscode acceptance, release readiness, or permission to weaken source completeness/hygiene checks.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md](../001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Value: 7C4EfHVfJ8suclh3bG8EoJyX1LU52e0qt2-alarylE0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Dn0psPQ6Cw2CyQ29w6asRhBpsWkT387B35Y7zA4lb8g