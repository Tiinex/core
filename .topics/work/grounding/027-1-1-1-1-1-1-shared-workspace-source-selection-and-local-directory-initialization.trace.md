# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 15:14:48
  - Trace: [027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md](027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md)
  - Origin:
    - [relative](027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 17:31:53
  - Authors: Anchor
  - Why: Prevent host-specific Workspace source semantics and make VS Code and LLM sandbox packaging converge on the same canonical source bytes.
  - Summary: Centralize local-directory initialization and repository-local ignore-aware Workspace snapshot selection in Core.
  - Status: ready/local

---

# Shared Workspace Source Selection And Local Directory Initialization

## Objective

Make Workspace initialization and Workspace snapshot source selection shared Core behavior so an ordinary local directory, a Git checkout without origin, VS Code, and an LLM sandbox all observe the same Tiinex Workspace semantics without host-specific Git or ignore implementations.

## Done Criteria

- `init-workspace <directory>` works offline from the native Schema Pack and writes a qualified Workspace for an ordinary non-Git directory.
- Git checkout with a qualified origin preserves repository-backed source identity; Git without origin degrades truthfully to `local-directory` without invented repository/ref authority.
- Canonical Workspace file enumeration is owned by Core and uses Git's tracked/untracked semantics plus repository-local `.gitignore`, not a handwritten ignore parser.
- Tracked files remain carried even if a later `.gitignore` pattern matches them; ignored untracked material is omitted; `.gitignore` negation is honored.
- Ambient machine/global ignore policy is not silently imported into portable Workspace identity.
- If `.gitignore` semantics are required but Git evaluation is unavailable, Core fails closed rather than claiming an unqualified complete snapshot.
- VS Code initialization becomes a thin folder-selection/invocation adapter and Outgoing packaging delegates file selection to the same Core manufacture path.
- Portable CLI and VS Code manufacture the same nested Workspace bytes from the same source root.
- Generated bootstrap Handoff ZIPs matched by `*.zip` remain outside Workspace snapshots without hard-coding ZIP as a forbidden file type.
- Full Core regression, portable/bootstrap/schema qualification, VS Code bridge regression, real non-Git/Git packaging integration, routed package integration, and VSIX runtime packaging qualify.

## Scope

Core portable Workspace initialization, source identity detection, shared Workspace file selection/enumeration and completeness evidence; thin VS Code host adaptation; regression and real integration fixtures required to prove both hosts consume the same behavior.

## Dependencies

- Qualified Handoff 083 Core baseline.
- Native Schema Pack and current schema authority from Task `027-1-1`.
- Existing canonical Package V1 Workspace/Handoff manufacture paths.
- Existing VS Code Outgoing and Discovery surfaces.

## Boundaries

- No second `.gitignore` parser or host-specific Workspace snapshot semantics.
- No Git remote mutation, GitHub mutation, commit, push, npm publication, release, or deployment.
- Git metadata is observational input only; missing origin does not block local Workspace identity.
- `.git/info/exclude` and global excludes are not portable Workspace source authority.
- This Task does not redesign bounded Workspace landing/replace semantics.

## Acceptance Boundary

A host may choose a directory and present Core's result, but Core alone owns whether that directory is a qualified Workspace source and which ordinary files enter its canonical Workspace snapshot.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md](027-1-1-1-1-1-bootstrap-runtime-composition-identity-and-comparison-guidance.trace.md)
  - Value: cqI5pVlf9eYZGQE6EMz5oxOzxb7-NsuhJRwVPP02VeQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: RWcc4dEJj_d6qUvrd-SPuM6LUYoqYSBBfnD1iIDD18Y