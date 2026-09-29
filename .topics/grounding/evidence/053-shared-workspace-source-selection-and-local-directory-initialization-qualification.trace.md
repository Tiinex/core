# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 17:31:53
  - Trace: [027-1-1-1-1-1-1-shared-workspace-source-selection-and-local-directory-initialization.trace.md](../027-1-1-1-1-1-1-shared-workspace-source-selection-and-local-directory-initialization.trace.md)
  - Origin:
    - [relative](../027-1-1-1-1-1-1-shared-workspace-source-selection-and-local-directory-initialization.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-29 17:32:48
  - Authors: Anchor
  - Why: Preserve exact evidence that source-selection semantics are centralized and behave correctly beyond unit tests.
  - Summary: Qualify shared Core source identity, ignore-aware Workspace enumeration, thin VS Code delegation, and cross-host package equivalence.
  - Status: ready/local

---

# Shared Workspace Source Selection And Local Directory Initialization Qualification

## Supported Claim Or Question

- Supported Claim Or Question: whether Workspace initialization and `.gitignore`-aware snapshot selection can be owned once by Core and consumed identically by VS Code and portable/LLM hosts without duplicating behavior or silently dropping tracked content.
- Evidence Role: qualifies Task `027-1-1-1-1-1-1` across shared Core semantics, thin VS Code adaptation, real package manufacture, and non-regression.

## Provenance

- Known Source: exact Handoff 083 Core Workspace plus the current Extension: VSCode Workspace, modified locally only for Task `027-1-1-1-1-1-1`.
- Preservation Basis: focused Core tests; full Core regression; portable smoke; embedded bootstrap qualification; native schema drift check; VS Code bridge regression; actual non-Git and Git-without-origin initialization; actual Workspace Package V1 manufacture through both portable Core and VS Code; byte comparison of nested Workspace archives; routed package integration; and VSIX packaging using the modified Core runtime.
- Provenance Limits: no GitHub write, remote Git mutation, commit, push, npm publication, VS Code marketplace publication, or downstream deployment was performed.

## Evidence Material

- Material: shared Workspace source-selection implementation, VS Code adapter integration, package fixtures, and qualification receipts described below.
- Material Kind: source implementation, exact package bytes, integration receipts, and regression results.
- Shared Source Identity: Core now distinguishes Git+origin repository-backed sources from Git-without-origin and non-Git `local-directory` sources without fabricating repository/ref facts.
- Offline Initialization: `init-workspace` consumes the native `tiinex.workspace.v1` Schema Pack material and canonical schema authority when the caller does not supply external schema material; VS Code no longer fetches Workspace schema bytes from GitHub.
- Shared Ignore Semantics: Core enumerates Workspace files through Git `cached + untracked - repository-local .gitignore` semantics. It does not implement its own glob parser and does not consume ambient global or `.git/info/exclude` state as portable source authority.
- Tracked Preservation: a tracked `*.zip` remains selected even when `*.zip` is ignored, while an untracked ignored ZIP is omitted.
- Negation: repository-local `.gitignore` negation retains an explicitly unignored file.
- Non-Git Directory: Core uses temporary Git metadata only as the shared `.gitignore` evaluator against the selected directory; the directory itself is not converted into a semantic Git repository.
- Failure Boundary: when repository-local ignore semantics are required but cannot be evaluated, Core does not claim a complete canonical source snapshot.
- Screenshot Reproduction: a generated `bootstrap-999.handoff-package.zip` matched by `*.zip` was absent from the nested Workspace ZIP while `.gitignore` and ordinary source files remained present; ZIP is not hard-coded as excluded.
- Cross-Host Equivalence: the real VS Code package builder and direct portable Core manufacture produced byte-identical nested Workspace ZIP bytes from the same non-Git root.
- VS Code Thin Adapter: Workspace initialization passes the selected directory directly to `init-workspace`; packaging does not contain `check-ignore`, host-computed Workspace exclusions, repository-origin derivation, or duplicate source-selection semantics.
- Core Focused Regression: local-directory/source-selection tests and Workspace initialization tests passed.
- Core Full Regression: 38 Core test files qualified for 314/314 reported tests with zero failures; the long Package V1 suite passed 40/40 separately after the bounded parallel run.
- Core Portable/Bootstrap: portable smoke passed and embedded bootstrap qualified.
- Native Schema Check: exact `Tiinex/docs@668753e47a281db060cb74ef957683f4f773b3a4` snapshot reported 106 schemas, 184 expected generated outputs, zero drift and zero findings.
- VS Code Bridge: 125/125 bridge cases passed against the modified Core runtime; the installed-package binding assertion was exercised with a temporary local installed-Core mirror matching the lockfile and then restored to local-Core mode.
- Real Local Directory Integration: 5/5 scenarios passed: ordinary-folder initialization, Discovery visibility, ignore/negation packaging, portable-vs-VS Code byte equivalence, and Git-without-origin tracked/untracked behavior.
- Package Integration: 6/6 real package scenarios passed after updating the repository-owned acceptance fixture to current schema-source authority: pointerless manufacture, re-orientation, embedded bootstrap start, multi-route Role pointers, immutable output collision behavior, and extracted VSIX runtime execution.
- VSIX Packaging: `scripts/package-vsix.mjs` returned `ready` and packaged the modified sibling Core runtime into the VSIX.

## Preservation And Fidelity

- Preservation State: exact local implementation and tests remain in the carried Core and Extension: VSCode Workspaces.
- Fidelity Notes: implementation facts and test outcomes are reported at the exact strength observed; GUI-only Windows interaction is not represented as executed.
- Transformation: historical Extension Host acceptance fixture schema links were updated to the current canonical Docs commit and resealed; fixture semantics were otherwise preserved.
- Known Losses: Windows GUI interaction itself was not executed in this Linux qualification host; VS Code host behavior was exercised through its real adapter/package-builder modules and VSIX packaging.

## Interpretation Limits

- Not Yet Used As: bounded Workspace landing redesign, remote publication authority, or a substitute for host-specific UI acceptance.
- Does Not Prove: that arbitrary non-Git tools can evaluate `.gitignore` without Git, that ambient global ignore configuration is portable authority, or that bounded Workspace replace semantics are solved.
- Must Not Be Treated As: permission for VS Code or another host to add its own competing ignore/source-selection implementation.
- Operational Boundary: hosts choose local directories and invoke Core; Core owns source identity, canonical file selection, completeness evidence, and Package V1 snapshot bytes.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-1-1-1-1-1-shared-workspace-source-selection-and-local-directory-initialization.trace.md](../027-1-1-1-1-1-1-shared-workspace-source-selection-and-local-directory-initialization.trace.md)
  - Value: 0m-HCYv_aZ77Yx1ZcXmG2aZTtRUnJy2RqjQ_WyCk6wk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 9fj-Zyq8QCJa1A8Z_PHnFLQV-djuXAOlrwy5sq3RHXI