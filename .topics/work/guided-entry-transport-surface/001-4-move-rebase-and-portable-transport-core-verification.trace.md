# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 21:39:37
  - Trace: [001-guided-entry-reference-first-transport-surface.trace.md](001-guided-entry-reference-first-transport-surface.trace.md)
  - Origin:
    - [relative](001-guided-entry-reference-first-transport-surface.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 11:32:27
  - Authors: Anchor
  - Why: Make Core implementation and CLI regression results durable as exact owner evidence rather than a host-only assertion.
  - Summary: Portably projected exact target-guided transport completion and asset-relocation CLI, with runtime and reference-safety boundaries.
  - Status: ready/local

---

# Move/Rebase and Portable Transport Core Verification

## Supported Claim Or Question

- Supported Claim Or Question: Can the move/rebase Core preserve exact carrier routing and binary file identity while projecting a read-only, target-aware transport instruction receipt suitable for all hosts and LLMS?
- Evidence Role: implementation and regression evidence for the local Core owner Tasks, not Windows, agent delegation, or a claim that attached files with references are automatically relocatable.

## Provenance

- Known Source: qualified local Core source in `src/tooling/portable/handoff/transportCompletion.js`, `workspaceEntryProjection.js`, `operation.catalog.package.js`, `lineage/lineage.operations.js`, `adapters/cli/cli.command-input.js`, and `test/transport-completion.test.mjs`, plus earlier Core ordinary-asset relocate/apply tests.
- Preservation Basis: exact workspace source/test bytes in this Handoff package; CLI receipt generated from a real immutable Anchor carrier and an unchanged canonical file name.
- Provenance Limits: Complete Core reference inventory for all possible binary-asset moves is not yet auto-discovered. The asset relocation planner fails closed when references exist or their coverage is not established.

## Evidence Material

- transport-completion-cli
  - Material: `project-transport-completion` provides source-qualified Markdown instructions, exact authoritative route text, canonical carrier basename, optional What/Where Target Entry and separately labelled host next steps. It rejects renamed ZIP basenames, missing routes, unknown targets and invalid packages.
  - Material Kind: executed portable Core/CLI behavioral evidence
  - Description: Result does not modify package bytes or Handoff identity. Multi-route packages require explicit route selection; pointerless packages do not invent recipient or Continue From.
  - Material Provenance: New six-case `test/transport-completion.test.mjs` suite with explicit target/source negative tests.
  - Material Limits: A selected Target Entry only declares environment adaptation, never automatically activates referenced Process.
- ordinary-asset-cli
  - Material: `project-asset-relocation --request <json-file>` now exposes the existing safe binary asset planner; `apply-lineage-maintenance` and recovery reuse the existing cooperative lock and transaction journal with strong source-digest verification.
  - Material Kind: CLI operation and strong-fingerprint transaction evidence
  - Description: The operation is Core-owned and host-neutral, not implemented privately in VS Code.
  - Material Limits: Plan requires explicit complete namespace and reference inventories. Existing referenced files remain blocked pending reference-aware rebinding qualification.
- regression-suite
  - Material: Full pre-final Core suite recorded 528 passing tests, zero failures and one intended skip, with six targeted transport tests additionally passing after host-source specialization.
  - Material Kind: automated local regression
  - Description: Tests include Handoff routing, Entry and Target qualification, ordinary file move/apply/recovery, and default-deny behavior at the host boundary.
  - Material Limits: A full Windows extension compile and installed Copilot acceptance are not established.

## Preservation And Fidelity

- Preservation State: Source and test files included unchanged from the completed local working directories.
- Fidelity Notes: The canonical carrier routing text is taken verbatim from the same Core projector used for Handoff transport. The optional Entry augmentation is separately qualified and does not re-author the route shell.
- Known Losses: None intentionally introduced to carrier bytes; older independent Guided Entry plain text remains available through its own operation, while the new completion projector uses the canonical routing shell.

## Interpretation Limits

- Does Not Prove: Windows UI acceptance, that an LLM with full OS access is sandboxed, current Role assumption from a Handoff To field, or that cross-file relative references are automatically migrated.
- Not Yet Used As: Native Surface or MCP acceptance.
- Must Not Be Treated As: authority to auto-pack, auto-unpack, auto-land or auto-send a carrier without appropriate host-operation approval.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-guided-entry-reference-first-transport-surface.trace.md](001-guided-entry-reference-first-transport-surface.trace.md)
  - Value: i4bMmqd3ZLGO7tn8L28ajWJ8hYKgclPIOs5ANSlq6N0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: LYTFbcGo37pEp-PkWRUyBy_Miov24AvO8Dx1h7YkQk4