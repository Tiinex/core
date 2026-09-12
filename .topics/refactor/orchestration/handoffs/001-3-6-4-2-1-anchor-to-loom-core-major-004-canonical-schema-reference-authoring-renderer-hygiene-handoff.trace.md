# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 23:25:38
  - Trace: [001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md](../001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Origin:
    - [relative](../001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 23:25:39
  - Authors: Anchor
  - Why: Fix new schema-reference debt once in shared mechanics instead of teaching hosts or Anchor to patch artifacts after generation.
  - Summary: Delegate the shared schema-reference generation/renderer repair and historical debt disposition to Loom.
  - Status: ready/local

---

# Anchor To Loom — Core Major 004 Canonical Schema Reference Authoring And Renderer Hygiene

## Handoff Parties

- Purpose: repair the shared Core generation blind spot that produces bare schema ids where qualified immutable canonical schema targets are available, and audit portable renderers so new artifacts stop accumulating schema-reference debt.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- common-authoring-schema-reference-repair
  - Transfer Kind: work-and-responsibility
  - Description: implement the controlling Task in shared Core common authoring/renderer mechanics using existing qualified runtime canonical schema-material authority.
  - Controlling Artifact: [Core Major 004 Task](001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Boundary: do not fabricate published locators for local/unpublished schema material.

- portable-renderer-audit
  - Transfer Kind: work-and-responsibility
  - Description: inspect current portable generators for equivalent mixed bare-id/exact-target output and fix the common source or explicitly preserve bounded exceptions with evidence.
  - Controlling Artifact: [Core Major 004 Task](001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Boundary: no historical mass rewrite and no host-private workaround.

- historical-debt-disposition
  - Transfer Kind: work
  - Description: return a concise inventory/disposition for recent degraded artifacts discovered by the audit, distinguishing preserve-as-history from any future correction artifact that is actually required.
  - Controlling Artifact: [Core Major 004 Task](001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Boundary: Loom does not rewrite published history merely to normalize presentation.

## Required Context

- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable shared authoring/rendering implementation.
  - Availability: available

- docs-workspace
  - Material: complete current Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only canonical schema-reference policy and exact schema material.
  - Availability: available

- extension-vscode-workspace
  - Material: complete current Extension VS Code Workspace.
  - Material Reference: [VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: read-only reproduction/diagnostic host context.
  - Availability: available

- business-workspace
  - Material: current Business Workspace with Anchor/Loom Role endpoints and controlling Turn-2 Task material.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact Role and orchestration context.
  - Availability: available

## Reference Context

- sigma-schema-reference-observation
  - Material: Sigma observed newly generated ordinary artifacts whose `Envelope Schema` is a bare id while Parent/Current use exact immutable schema locators; VS Code diagnostic reports canonical target availability rather than clean state.
  - Purpose: human-facing reproduction.
  - Availability: available

## Retained Responsibilities

- canonical-semantics
  - Retained By: Axiom / Docs
  - Responsibility: resolve any genuine ambiguity in published-vs-local schema-reference semantics if Loom finds one; otherwise current Docs policy is read-only authority.

- host-navigation
  - Retained By: Kodax
  - Responsibility: repair VS Code local/Incoming artifact link navigation in its separate lane.

## Exclusions And Dependencies

- docs-semantic-mutation
  - Kind: excluded-scope
  - Description: no Docs semantic edits unless a blocker is returned for separate Axiom delegation.

- vscode-preview-repair
  - Kind: excluded-scope
  - Description: no VS Code host preview/navigation mutation.

- remote-action
  - Kind: excluded-scope
  - Description: no publication, push or release.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return a qualified Core Major 004 checkpoint where common generation and portable renderers use exact canonical schema targets when authority exists, diagnostics and generation agree, tests pass, and historical debt is explicitly dispositioned.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: all historical artifacts are rewritten, local/unpublished schemas need fake permalinks, or a host-specific preview defect is fixed.
- Must Not Be Used To Claim: Docs authority, release permission or historical byte replacement.
- Authority Limits: Loom owns shared mechanical implementation only; Axiom retains semantics and Anchor retains recovery/progression.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md](../001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Value: lFIazLC0k9EQnSrTOQonRxpYDIf0MXH6pw8ShVeCfG0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jmGrTW1zqFyk_djkpC79RX9abG1UFCaqTFYJUU0nKts