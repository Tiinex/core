# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:58:54
  - Trace: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Origin:
    - [relative](001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-10 15:19:40
  - Authors: Anchor
  - Why: Repeated child-return integrations require exact source comparison across Handoff and local frontiers; conventional byte/path diff should be shared Tooling rather than improvised by each LLM or host.
  - Summary: Qualified two-way and three-way source-frontier comparison for Handoff/local Workspace reconciliation without ad-hoc diff scripts.
  - Status: active/local

---

# Source frontier comparison and reconciliation receipts

## Objective

Replace ad-hoc shell/Python byte-diff work during Handoff reconciliation with a qualified Core Tooling capability that compares the exact source representations Tiinex already manufactures and carries, while keeping byte/source comparison separate from semantic interpretation and mutation.

## Done Criteria

- Core exposes one shared comparison engine for exact source-frontier comparison; command/API surface may use one primary operation plus thin explicit adapters where input ergonomics require it, but comparison semantics must not fork by host.
- The capability can compare all currently recurring Refactor cases without reconstructing source from GitHub:
  - Handoff package versus Handoff package.
  - unpacked/local Workspace versus one Workspace carried by a Handoff package.
  - unpacked/local Workspace versus unpacked/local Workspace.
  - unpacked/local multi-Workspace frontier versus a Handoff package.
- An optional three-way mode supports the actual child-return integration pattern: exact child input/base versus returned/incoming source versus Anchor current source. It reports incoming-only changes, current-only changes, same-result concurrent changes and true overlap/conflict candidates without performing a merge.
- Local Workspace comparison reuses or factors the same qualified source-selection/snapshot mechanics used by Handoff manufacture. It must not invent an independent directory walker whose inclusion rules drift from package manufacture; `.git`, host-local state, ignored secrets and other excluded material follow the existing source snapshot contract.
- Handoff inputs are inspected/qualified by the receiver's current trusted Core Tooling. Comparison must not require executing package-carried bootstrap code merely to obtain a diff.
- Exact snapshot equality is fast-pathed from qualified carried byte/hash evidence when possible; changed snapshots reduce to deterministic path-level added/removed/byte-changed results with stable ordering and explicit workspace identity.
- The result distinguishes at minimum `exact`, `changed`, `only-left`, `only-right`, `locked`, `unavailable` and qualification/error states rather than collapsing absence, encryption and invalid input into `changed`.
- Password-sealed Workspaces remain opaque/`locked` unless an already-authorized open path supplies exact recovered Workspace material. The comparison receipt must not leak protected filenames/tree structure.
- Machine-readable receipt and compact human/LLM projection are both available. The receipt records compared inputs/bindings, Workspace states, path deltas, hash basis and optional three-way overlap classification so another host can consume the same truth without reparsing prose.
- Byte/source diff is explicitly not semantic diff. A changed artifact file does not let Tooling infer changed Parent meaning, authority, acceptance, task state or semantic equivalence.
- Comparison is read-only. It performs no landing, merge, staging, commit, push, source replacement or Handoff acceptance.
- Focused qualification covers exact/no-change, add/remove/change, multi-Workspace asymmetry, Handoff/local combinations, three-way non-overlap and conflict cases, excluded local material, invalid carrier/input, and sealed/locked non-disclosure.
- Existing Core Tooling, Handoff manufacture/orientation/grounding, Secure Transport, embedded bootstrap, portable import and package qualification remain green.

## Scope

Core portable Tooling and public/shared mechanics only. Prefer a single normalized internal frontier/snapshot model with explicit input adapters over several unrelated diff implementations. Exact command naming and selector syntax are implementation choices for Loom, but input type selection must be explicit enough to fail closed rather than guess ambiguous filesystem/package meaning.

The V1 output is source/byte comparison and reconciliation evidence. Do not implement automatic merge, semantic artifact diff, remote GitHub acquisition, GUI presentation, VS Code landing, release publication or project-specific Tiinex repository rules.

## Dependencies

- [Turn 2 portable Tooling and allocation discipline](001-turn-2-portable-tooling-and-allocation-discipline.trace.md).
- Current Handoff package manufacture/orient/ground and Workspace snapshot-selection mechanics in Core.
- Current Workspace Representation/package binding and Secure Transport mechanics/semantics from carried Docs/Core.
- Repeated Refactor child-return reconciliation evidence demonstrating the need for exact base -> incoming -> current comparison without whole-carrier overlays.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Value: WOMe5yr432wwydKlPQSPPZs95rGEXQrVoewCbGSt3iU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: NXLrSeE_9T_qcq5X1Mi7lcaKl1fpjbrgjr1QAoHxP94