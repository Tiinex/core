# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-03 21:16:05
  - Trace: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Origin:
    - [relative](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-09 12:07:17
  - Authors: Anchor
  - Why: Preserve one canonical, cold-groundable continuation that carries full source, negative tests, bounded safety limitations and prior transport Tasks.
  - Summary: Core local reference-aware binary asset relocation and CLI verification; one Move/Rebase controlling Task with host integration and Sigma gate still open.
  - Status: ready/local

---

# Anchor Reference-Aware Move/Rebase CLI And Operator Surface Continuation

## Handoff Parties

- Purpose: Transfer the new Core-owned atomic binary/Markdown reference relocation and local CLI Workspace inspection with the prior Move/Rebase and guided VS Code transport work, preserving full carrier lineage and precise remaining host acceptance boundaries.
- From: Anchor
- From Kind: role
- From Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Transfers

- continue-exact-core-move-rebase-host-projection
  - Transfer Kind: work
  - Description: Continue the single Core owner Task for Move/Rebase. Newly implemented `inspect-asset-relocation-workspace --request <request.json>` inspects a physical Workspace and produces an exact asset-plus-referencing-Markdown transaction plan. The same existing `apply-lineage-maintenance` stages binary relocation and qualified Markdown/Tiinex artifact reference rewrites, reseals Tiinex artifacts, checks source SHA and plan fingerprint, re-inspects before/after lock and before source staging, commits atomically, and supports durable rollback/recovery. Tests prove a previously referenced image can move with the referencing Tiinex artifact remaining verified. This is a *bounded* supported-text case, not arbitrary file/format rewrite: outgoing links inside text sources, unsupported/ambiguous formats, and cross-Workspace references remain explicitly blocked or unresolved. Deliver a generic host plan/review/apply/recover panel consuming Core/CLI, with no VS Code-owned mutation policy and no additional domain logic inside operatorTrees.
  - Controlling Artifact: [Deterministic Lineage Maintenance Projection And Apply](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Boundary: a numeric file prefix is a namespace coordinate, never semantic Parent authority; plan application requires the same qualified local filesystem and explicit review/approval; no published or remote write is inferred.

## Required Context

- new-atomic-reference-evidence
  - Material: exact owner-qualified code paths and tests for already-referenced binary asset relocation
  - Material Reference: [Core Asset Reference-Rebinding And CLI End-To-End Verification](001-9-core-asset-reference-rebinding-and-cli-end-to-end-verification.trace.md)
  - Purpose: establishes current executable baseline and all deliberate format/coverage exclusions
  - Availability: available

- previous-core-transport-task
  - Material: separate owner Task for portable target-aware transport completion and exact carrier-name preservation
  - Material Reference: [Portable Target-Guided Transport Completion Projection](guided-entry-transport-surface/001-3-portable-target-guided-transport-completion-projection.trace.md)
  - Purpose: keep the distinct transport Task as context instead of incorrectly selecting two controlling current-work Tasks
  - Availability: available

- previous-core-transport-evidence
  - Material: CLI target instructions, What/Where Entry and narrow asset baseline
  - Material Reference: [Move/Rebase and Portable Transport Core Verification](guided-entry-transport-surface/001-4-move-rebase-and-portable-transport-core-verification.trace.md)
  - Purpose: preserve prior tested implementation and transport constraints
  - Availability: available

- vscode-existing-integration
  - Material: VS Code transport-tab and delegated Copilot-panel policy source/verification
  - Material Reference: [VS Code Target Transport Tab and Copilot Panel Delegation Verification](vscode::.topics/work/native-agent-surface/001-3-vs-code-target-transport-tab-and-copilot-panel-delegation-verifi.trace.md)
  - Purpose: maintain host boundary and Windows verification obligations without introducing parallel semantics
  - Availability: available

- vscode-panel-task
  - Material: existing VS Code transport instruction and agent panel action Task
  - Material Reference: [VS Code Target Entry Copilot Panel Actions And Transport Instruction Tab](vscode::.topics/work/native-agent-surface/001-2-vs-code-target-entry-copilot-panel-actions-and-transport-instruc.trace.md)
  - Purpose: retain exactly three delegated panel-action levels and exclude default destructive Incoming actions
  - Availability: available

## Reference Context

- host-target-entry
  - Material: existing VS Code Copilot target-specific Entry
  - Material Reference: [VS Code Copilot Execution Target](vscode::.topics/.entries/where/vscode-copilot/001-vs-code-copilot-execution-target.trace.md)
  - Purpose: preserve What/Where/Role authority separation
  - Availability: available

- future-copilot-agent
  - Material: future Native VS Code Copilot agent tool and session-grounding adapter, not implemented by this handoff
  - Material Reference: [VS Code Native Agent Tools And Generated Customizations Adapter](vscode::.topics/work/native-agent-surface/001-vs-code-native-agent-tools-and-generated-customizations-adapter.trace.md)
  - Purpose: CLI/Core parity must precede future native agent registration
  - Availability: available

## Retained Responsibilities

- pending-host-gates
  - Retained By: Anchor
  - Responsibility: Implement and verify interactive VS Code asset Move/Rebase plan/review/apply/recover, before/after and numeric-dimension placement, multi-source and cross-Workspace reference policies, and the installed Windows Sigma gate. Native Agent Surface tool registration, managed skills/agents, and per-Copilot panel access levels remain separate follow-up work.
  - Boundary: Linux/Node Core regression and Webview models are not Windows installed-extension or real Copilot acceptance.

## Exclusions And Dependencies

- no-evidence-branch-conflation
  - Kind: excluded-scope
  - Description: Do not mutate Evidence-v1 schema, renderer/host forms, or attempt versioned Evidence-v2 in this Move/Rebase branch; Evidence owner fork may have diverged since our shared baseline.
  - Responsible Party Or Role: Anchor

- supported-reference-grammar-only
  - Kind: unresolved-dependency
  - Description: Current atomic rebinding qualifies local Markdown inline destinations and self-sealed Tiinex files. It intentionally blocks opaque binary metadata, arbitrary script/HTML/string references, source text files with outgoing references, symlinked Workspace objects, and unknown/cross-Workspace reference claims. The local scanner excludes `.git`, `.tiinex` and `node_modules` system/vendor trees. Never advertise unrestricted arbitrary-file rebasing without format-specific qualification and tests.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: disposition
- Signal Meaning: Continue remaining Core source/target qualification and VS Code host plan/review/apply UX through an owner-correct Task. Core's full regression reached 537 PASS / 0 FAIL / 1 SKIP with 17 focused PASS after the final safe-source restrictions; maintain exact canonical carrier name and repeat cold `orient`/`ground` with one selected Task. Request one meaningful Sigma Windows acceptance only when the host implementation is sufficiently complete.
- Return To: Anchor
- Return To Reference: [Anchor](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)

## Interpretation Limits

- Does Not Mean: complete arbitrary file format support, cross-Workspace cleanup, source publication, operator-panel installed Windows PASS, or permission to give Copilot unexpected transport powers.
- Must Not Be Used To Claim: an LLM can safely execute any workspace filesystem operation solely because `inspect-asset-relocation-workspace` returned an exact plan for a supported local case.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Value: PY3SeYcMqPM2_xM_lPUmHAbYB1BS2H6FMv5P0bVyAYI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: euGmu8x7FCbWqoknW4ge5G8oC2pt6p_8nLneulDFAYo