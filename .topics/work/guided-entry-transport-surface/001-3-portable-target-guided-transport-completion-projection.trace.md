# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 21:39:37
  - Trace: [001-guided-entry-reference-first-transport-surface.trace.md](001-guided-entry-reference-first-transport-surface.trace.md)
  - Origin:
    - [relative](001-guided-entry-reference-first-transport-surface.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 11:04:01
  - Authors: Anchor
  - Why: Unify receipt and target-specific transport instructions without diverging Core CLI, VS Code and future Viewer
  - Summary: One Core-projected, CLI-accessible, source-qualified transport instruction receipt with no carrier modification.
  - Status: ready/local

---

# Portable Target-Guided Transport Completion Projection

## Objective

Provide one read-only, portable completion/recipient-instruction projection for all canonical Workspace and Handoff carrier delivery paths. Preserve the exact qualified clipboard shell and canonical carrier basename. A host may render the projection in a transient Markdown tab, CLI, Viewer or another presentation without owning separate transport instructions.

## Owner Boundaries

- Docs/Native own the semantics of Entry/Target Entry and Process; Core qualifies and projects exact Entry/Target material. Existing `tiinex.entry.target.v1` and `project-workspace-carrier-entry` are the starting point: no duplicate transport schema and no host-defined second Entry grammar.
- The operator's selected What Entry and optional Where Target Entry remain separate; an environment Target may describe receipt/attachment/transport steps but cannot create Handoff routing, Role identity, Process applicability, or mutation authority.
- Core owns canonical route/pointer shell, carrier identity and filename, qualified target source reference, transport text, readiness, reason codes and an optional preview-oriented, machine-readable summary. VS Code owns only the transient Markdown editor/preview and clipboard interaction.

## Work Plan

- Qualify the exact existing outgoing carrier and selected single route or explicit multi-route selection; preserve the original `humanOutput` instruction bytes, no rewrite of the outgoing ZIP or canonical transport text.
- Extend an existing qualified transport/Entry projection, or add a small adjacent pure formatter where necessary, to return portable receipt fields: filename/path (presentation-only), exact carrier/route identity, clipboard-ready text, target identity/source, applicable selected Entry identity and qualified human next steps. Non-qualifying Target Material is identified but never rendered as an automatically active Process.
- Present target-specific steps only when a validated Target Entry supplies their qualified source or a source-owned host process is separately qualified. Absent or ambiguous target guidance yields an explicit generic instruction and a source/selection next action, not guessed UI clicks.
- Add a CLI discover/project route so LLMS, Viewer and VS Code receive the same structured receipt. No new imperative shell procedure and no special return values only reachable via the VS Code host.
- Make all transport variants exercise the same projection: pointerless Workspace carrier, one-route/multi-route Handoff carrier, Guided Entry What+Where, recipient transport text copy, and bootstrap replacement where applicable.

## Verification

- Identical carrier and route render exactly identical authoritative transport text before and after UI wrapping; hash and basename unchanged, including long carrier lineage names.
- Explicit target guidance appears only for exact qualified Target Entry and its valid Process context; a wrong, stale, unavailable or unknown target returns generic/bounded guidance without implying authority.
- Multi-route receipts never silently promote a mechanical anchor to the user's primary recipient. A clipboard instruction is not proof of delivery or recipient grounding.
- Unit/CLI tests for external providers and no-host context, schema drift, malformed routes, content source qualification, carrier byte invariance and clear `nextAction` findings.

## Scope And Dependencies

- Core reusable projection over existing What/Where Entry, transport and CLI machinery. VS Code companion Task consumes it.
- Depends on the Core Guided Entry Reference First Transport Surface Task and existing portable schema contract.
- Explicitly excludes Copilot settings, panel permission levels, VS Code Markdown tabs, MCP server implementation, Handoff mutation, and transport publication authority.

## Scope

- Core and CLI only: source-qualified transport completion projection and tests. No VS Code policy or host UI.

## Dependencies

- Existing Guided Entry Reference First Transport Surface Task, Native Target Entry schema, and carried/qualified Entries.

## Done Criteria

- All supported carrier variants produce one Core CLI-accessible source-qualified completion/instruction receipt without modifying carrier bytes, canonical filename, selected route or clipboard instruction. Missing/ambiguous Target Entry is fail-closed, with a usable generic recovery step and exact negative tests.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-guided-entry-reference-first-transport-surface.trace.md](001-guided-entry-reference-first-transport-surface.trace.md)
  - Value: i4bMmqd3ZLGO7tn8L28ajWJ8hYKgclPIOs5ANSlq6N0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MF7Tn8KuKyrN5eV6jvyn10m8t0LA6uWMg3R5hMuYYlc