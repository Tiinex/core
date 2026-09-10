# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 15:19:40
  - Trace: [001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Origin:
    - [relative](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 15:21:32
  - Authors: Anchor
  - Why: Turn-2 reconciliation repeatedly falls back to ad-hoc scripts for conventional byte/path comparison; make that shared qualified Tooling before more dogfooding depends on it.
  - Summary: Bounded Loom implementation handoff for exact Handoff/local Workspace frontier comparison and three-way reconciliation receipts.
  - Status: ready/local

---

# Source frontier comparison Tooling → Loom

## Handoff Parties

- Purpose: replace repeated Anchor ad-hoc source/Handoff diff scripts with one qualified Core comparison capability that gives LLMs, CLI and future hosts a stable exact-byte reconciliation environment.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- normalized-frontier-comparison
  - Transfer Kind: work-and-responsibility
  - Description: implement the controlling Core Task as one shared normalized two-way/optional-three-way exact source-frontier comparison engine with explicit adapters for Handoff packages and local Workspace/multi-Workspace inputs. Prefer one primary discoverable operation and shared receipt semantics; thin aliases/adapters are acceptable only when they do not fork behavior.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: compare only; no merge, landing, staging, semantic diff or remote source acquisition.

- manufacture-equivalent-local-source
  - Transfer Kind: work-and-responsibility
  - Description: reuse or factor the existing Handoff manufacture Workspace source-selection/snapshot mechanics for local inputs so comparison and manufacture have one definition of comparable source. Do not introduce a second independent directory walker with different ignore/secret/runtime-state behavior.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: preserve existing source inclusion semantics unless an actual shared primitive defect is reproduced and returned explicitly.

- reconciliation-receipt
  - Transfer Kind: work-and-responsibility
  - Description: expose stable machine-readable comparison receipts plus a compact human/LLM projection including Workspace equality/asymmetry, added/removed/byte-changed paths, and optional base/incoming/current overlap classification. Preserve locked/unavailable/invalid states without guessing.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: source-byte evidence does not create semantic authority, acceptance or merge disposition.

## Required Context

- core-workspace
  - Material: complete current Core source including Handoff manufacture/orient/ground, Secure Transport V1 and the controlling comparison Task.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: sole writable Workspace and implementation authority for shared portable Tooling mechanics.
  - Availability: available

- docs-workspace
  - Material: complete current canonical Docs schemas/semantics including Workspace Representation, Handoff package, External Payload and Secure Transport contracts.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only semantic authority; implementation must preserve exactness, opacity and non-authority boundaries.
  - Availability: available

- business-workspace
  - Material: current Business source including Anchor/Loom Roles and controlling Turn-2 Tooling context.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only role/scope and integration authority.
  - Availability: available

## Reference Context

- repeated-refactor-reconciliation
  - Material: the current Task's Done Criteria encode the recurring real integration cases already exercised by Refactor Anchor: child input versus return, return versus current, carried context equality, and local versus carrier source checks.
  - Purpose: optimize Tooling for observed work rather than speculative semantic diff/merge machinery.
  - Availability: available

## Retained Responsibilities

- integration-and-acceptance
  - Retained By: Refactor Anchor
  - Responsibility: three-way reconcile Loom's return against this exact child input and current Core frontier, independently qualify the result, and decide whether it becomes current.
  - Boundary: Loom's local PASS is not automatic integration or release authority.

- host-adoption
  - Retained By: Refactor Anchor / later owning lanes
  - Responsibility: decide when CLI, extension-vscode and runtime-native consume the comparison primitive and what operator UX they expose.
  - Boundary: no sibling Workspace mutation in this lane.

- semantic-expansion
  - Retained By: Axiom / Docs semantic authority
  - Responsibility: resolve any newly discovered canonical semantic requirement that cannot be implemented from current contracts.
  - Boundary: Loom must return a semantic blocker instead of inventing a schema or authority rule.

## Exclusions And Dependencies

- non-core-source
  - Kind: excluded-scope
  - Description: Docs and Business are read-only. CLI, extension-vscode, App, Site, Providers, Verses, Interop and Runtime are out of scope.
  - Responsible Party Or Role: Refactor Anchor / owning lanes.

- automatic-merge
  - Kind: excluded-scope
  - Description: comparison may classify exact path overlap/conflict candidates but must not mutate or merge source, choose winners, stage, commit or push.
  - Responsible Party Or Role: Refactor Anchor / future separately scoped tooling.

- semantic-diff
  - Kind: excluded-scope
  - Description: do not infer semantic equivalence/change, Parent meaning, authority, task completion or acceptance from byte/path comparison.
  - Responsible Party Or Role: future separately qualified semantic work if ever justified.

- remote-source-acquisition
  - Kind: excluded-scope
  - Description: do not use GitHub or other remote state as source authority or add remote fetching to this comparison primitive. Inputs are exact local Workspaces/frontier descriptors or supplied Handoff packages.
  - Responsible Party Or Role: host/operator source acquisition boundary.

- test-economy
  - Kind: excluded-scope
  - Description: test-economy boundary: add a small focused use-case suite that protects comparison truth, non-disclosure and fail-closed behavior. Do not explode permanent tests around incidental implementation structure.
  - Responsible Party Or Role: Loom.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one normal Tiinex Handoff with complete changed Core source, the qualified comparison Task result/evidence, exact public/tooling invocation examples for the four pairwise cases plus the three-way child-return case, focused tests, and full Core/portable/bootstrap/package qualification.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: source comparison automatically authorizes integration; exact bytes establish semantic equivalence; different bytes establish semantic incompatibility; a conflict classifier is a merge engine; or local package paths confer Workspace identity without qualification.
- Must Not Be Used To Claim: GitHub latest is current source, encrypted Workspace contents are comparable while locked, ignored secrets belong to carried source merely because they exist locally, or a compact summary can replace the machine receipt.
- Authority Limits: bounded Core Tooling implementation and qualification under the controlling Task only.
- Security Boundary: comparison of sealed/locked Workspace material must preserve opacity and must not leak protected internal filenames or tree structure.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Value: NXLrSeE_9T_qcq5X1Mi7lcaKl1fpjbrgjr1QAoHxP94

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Jo-22Gzqm5_QqCYC3C1s0X3qTOjwH2uSEPch1UPF2-E