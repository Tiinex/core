# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 20:41:55
  - Trace: [001-1-parity-and-publishing-task.trace.md](001-1-parity-and-publishing-task.trace.md)
  - Origin:
    - [relative](001-1-parity-and-publishing-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-08 21:56:00
  - Authors: Anchor
  - Why: Preserve Tiinex Handoff package convention while fixing the Windows-only external tar test dependency.
  - Summary: Return the Core-only Windows release-test portability fix in a complete full-source carrier.
  - Status: ready/local

---

# Windows-safe npm release test handoff

## Handoff Parties

- Purpose: Return the platform-independent Core release-test fix after reproducing Sigma's Windows failure and preserving the current full-source Workspace set.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- Core Windows release-test fix
  - Transfer Kind: work
  - Description: Replace the Core release integration test's external system tar dependency with a Node-only gzip/tar reader. This keeps the tested release archive inspection platform-independent and preserves fail-closed publication behaviour.
  - Controlling Artifact: [Core parity and publishing task](001-1-parity-and-publishing-task.trace.md)
  - Boundary: Only Tiinex/core source changes in this return. The other carried Workspaces are complete recovery/context snapshots and are intentionally unchanged.

## Required Context

- core complete Workspace
  - Material: Core source including the Windows-safe release integration test
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: Repository to replace/update for this return.
  - Availability: available

- business complete Workspace
  - Material: Current organizational and release task context
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Complete unchanged context and role authority.
  - Availability: available

- docs complete Workspace
  - Material: Canonical schema context
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Complete unchanged canonical context.
  - Availability: available

- app complete Workspace
  - Material: Current App package source
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: Complete unchanged package-consumer context.
  - Availability: available

- site complete Workspace
  - Material: Current Site deployment source
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: Complete unchanged deployment context.
  - Availability: available

- playthings complete Workspace
  - Material: Current Playthings source
  - Material Reference: [Playthings Workspace](playthings::.topics/.workspaces/tiinex-playthings.workspace.md)
  - Purpose: Complete unchanged downstream context; Playthings development remains with its separate Anchor.
  - Availability: available

## Reference Context

- Reproduction
  - Material: Sigma's Windows npm release failure: test/release-integration.test.mjs returned process status 128 while invoking external tar, with a clean master worktree and functioning Git identity.
  - Purpose: Explain why the test changed without attributing the failure to npm, Git credentials, or repository cleanliness.
  - Availability: available

## Retained Responsibilities

- Turn 2 refactor continuation
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: Continue the stable Turn 2 reconciliation separately; this hotfix carrier intentionally excludes unfinished Turn 2 changes.

## Exclusions And Dependencies

- npm publication
  - Kind: unresolved-dependency
  - Description: This return does not claim a successful npm publication. After landing Core, Sigma should rerun npm test and only then retry the current one-time npm publish command.
  - Responsible Party Or Role: Sigma

- other repositories
  - Kind: excluded-scope
  - Description: App, Business, Docs, Site and Playthings are carried complete but have no intended source changes in this hotfix return.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Land the Core source, rerun npm test on Windows, and report the result before treating first npm publication as qualified.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: npm publishing has succeeded, Turn 2 is complete, or the carried unchanged repositories need to be recommitted.
- Must Not Be Used To Claim: Sigma has technical release authority or that a transport PASS substitutes for the Windows test result.
- Authority Limits: Docs and Business retain their existing semantic and organizational authority boundaries.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-parity-and-publishing-task.trace.md](001-1-parity-and-publishing-task.trace.md)
  - Value: tYi3w_XuL8oQlWgI9cx3c9lRgT1bGT85FD4us0RRU-k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ur5CRNXzLbsxWNOeMyoP8A6Ynysb7zIlJxzzjIPNL1E