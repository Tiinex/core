# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-03 21:16:05
  - Trace: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Origin:
    - [relative](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 12:05:09
  - Authors: Anchor
  - Why: Qualify the highest-risk remaining Move/Rebase gap with bounded, portable, source-grounded evidence before Windows acceptance.
  - Summary: Atomic binary + qualified Tiinex/Markdown reference relocation, exact local CLI inspection, recheck and rollback with full Core regression.
  - Status: ready/local

---

# Core Asset Reference-Rebinding And CLI End-To-End Verification

## Supported Claim Or Question

- Supported Claim Or Question: Can Core relocate an ordinary binary file that is referenced by one or more local Tiinex/Markdown documents while preserving exact file bytes, rebasing qualified relative Markdown links, retaining Tiinex self integrity, and rolling everything back together if the transaction stops?
- Evidence Role: local automated implementation and negative-regression evidence for the Core-owned Move/Rebase Task, not an assertion that any possible file format or cross-Workspace references are already handled.

## Provenance

- Known Source: Core `src/tooling/portable/lineage/asset.reference-rebind.js`, `asset.relocation.projection.js`, `src/tooling/portable/adapters/node/asset.relocation.inspect.js`, modified existing `lineage.maintenance.apply.js`, `src/tooling/portable/adapters/cli/cli.run.js`, CLI help, and `test/asset-reference-rebind.test.mjs`.
- Preservation Basis: precise Core source and test bytes carried in this Handoff Package; result verified by both direct Core apply tests and CLI subprocess invoking `inspect-asset-relocation-workspace` followed by `apply-lineage-maintenance`.
- Provenance Limits: filesystem inventory is a qualified local supported-UTF8-text and Markdown-link scope, not omniscience about embedded references in unknown binary/proprietary formats or other Workspaces. It excludes `.git`, `.tiinex` and `node_modules` metadata/vendored trees explicitly.

## Evidence Material

- bundled-asset-and-artifact-transaction
  - Material: The same transaction stages a binary source relocation and inplace reference updates to qualified Markdown/Tiinex `.trace.md` sources; Tiinex artifact self integrity is resealed and verified. The new destination path follows a numeric lineage dimension, preserves binary SHA-256 and is not interpreted as semantic Parent authority.
  - Material Kind: executable Core integration test
  - Description: `test/asset-reference-rebind.test.mjs` checks an image reference updates to the generated destination, both source/output bytes are exact, and a forced failure at `outputs-written` rolls back source image and previously self-sealed Tiinex document together.
  - Material Limits: no claim of automatic external or cross-Workspace rebasing, arbitrary URL rewriting, or remote transport.
- exact-supported-text-inspection
  - Material: A new node read-only `inspect-asset-relocation-workspace --request <json>` command inventories local supported-text Markdown links, performs per-source reference qualification and projects a Core asset transaction plan; Core reinspects the same Workspace before/after acquiring locks and immediately before destructive source staging.
  - Material Kind: CLI, byte-check and safety regression
  - Description: CLI end-to-end plan/apply passes, newly added Markdown references invalidate old plans, source drift/target collision are blocked, and unsupported text/HTML/TS/JSON path mentions, symlinks, broken self-integrity or unqualified reference source material cause a fail-closed result.
  - Material Limits: text files with possible outgoing relative references are explicitly excluded as opaque binary sources; these need a separate source-relocation model. Concurrent uncooperative OS-level writes cannot be prevented by a cooperative lock alone.
- full-core-regression
  - Material: Core suite 537 PASS / 0 FAIL / 1 SKIP in a completed full-suite execution after the reference transaction implementation; targeted 17 PASS after the later narrow text-source restriction.
  - Material Kind: executable regression suite
  - Description: Confirms current portable Core/schema/grounding/transport/lineage tests remain green; no changes made to Native Evidence-v1 schema or VS Code form in this branch.
  - Material Limits: Windows VS Code Move/Rebase interaction, binary format-specific references, and a published Git revision remain unqualified.

## Preservation And Fidelity

- Preservation State: Exact file bytes and test sources are retained inside the owner Core Workspace within the handoff package.
- Fidelity Notes: Source image bytes are not re-encoded; local Tiinex artifact links and c14n self integrity are recalculated from the exact revised Markdown. Existing Core durable locking, staging, verification and rollback facilities are reused.
- Known Losses: Deliberately unsupported relocation of Markdown/HTML/SVG as opaque binary sources; generic formats with unqualified outgoing links and cross-Workspace referencing require separate qualification rather than silent rewrite.

## Interpretation Limits

- Does Not Prove: universal reference coverage for proprietary formats, a complete Windows or Copilot operator-panel flow, or permission for unattended apply without an exact reviewed plan.
- Not Yet Used As: Sigma installed-Windows acceptance or Native Agent Surface registration.
- Must Not Be Treated As: blanket approval to rewrite arbitrary bytes using search/replace, to infer Parent ancestry from filename prefixes, or to bypass Core's explicit transaction/plan preconditions.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md](001-deterministic-lineage-maintenance-projection-and-apply-task.trace.md)
  - Value: PY3SeYcMqPM2_xM_lPUmHAbYB1BS2H6FMv5P0bVyAYI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Zozi9gae14A_P9isW5dRyxuxcLLxXogURkFRbuxM8k4