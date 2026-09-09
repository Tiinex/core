# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 17:38:00
  - Trace: [001-extraction-task.trace.md](001-extraction-task.trace.md)
  - Origin:
    - [relative](001-extraction-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 02:00:00
  - Authors: Anchor
  - Why: Prevent historical Site reduction from dropping still-relevant shared Tooling obligations or assigning host-specific ownership to Core.
  - Summary: Carry shared Tooling and fresh-cold-grounding obligations into Core while leaving final CLI and Interop host contracts unfrozen.
  - Status: ready/local

---

# Portable Tooling carry-forward after repository extraction

## Objective

Preserve the still-relevant shared mechanics from the historical Site-local common-CLI, LLM ergonomics and fresh-cold-grounding work after portable Tooling moved to Core, without turning Core into the final CLI host or external-assistant Interop surface.

## Done Criteria

- Core continues to own host-neutral portable Tooling, grounding, Handoff carrier mechanics and provider-neutral operation contracts needed by multiple hosts.
- Historical Site work around common CLI ergonomics and explicit-root fresh-cold grounding is either represented by current Core mechanics/tests or kept as a visible unresolved prerequisite here.
- CLI-specific interaction/command-host behavior is not frozen until an actual CLI Workspace is qualified.
- External assistant/automation bootstrap, tool exposure and environment adaptation is not frozen until an actual Interop Workspace is qualified.
- Current LLM-facing bootstrap material retained in Core is treated as transitional compatibility material, not permanent Interop ownership.
- A future Core role can work from this task and the repository boundary decision without reopening the Site monolith lineage.

## Scope

Shared Core mechanics only. Do not create a Core-owned CLI product, external-assistant UX, VS Code host behavior or canonical semantic authority. Historical Site artifacts remain recoverable evidence until qualified Reduction lands.

## Dependencies

- [Core extraction task](001-package-extraction-task.trace.md)
- [Turn-2 repository boundary decision](business::.topics/initiatives/001-3-6-4-1-repository-bootstrap-responsibility-boundary-decision.trace.md)
- Historical source signal: `site::.topics/tooling/005-2-common-cli-surface-and-llm-ergonomics-task.trace.md`.
- Historical source signal: `site::.topics/tooling/006-explicit-root-fresh-cold-grounding-closure-task.trace.md`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-extraction-task.trace.md](001-extraction-task.trace.md)
  - Value: GCTQEKkmomJpU8bKRYyAG4eWNZNUPxDuQLpvJTrhHjk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ON5c5XSdHkP-oAWe-jRvKPTIH5wq9_4jLEyMkLQk_U4