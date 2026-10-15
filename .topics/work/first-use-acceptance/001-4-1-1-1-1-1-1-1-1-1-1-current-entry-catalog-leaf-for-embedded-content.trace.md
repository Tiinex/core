# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-15 11:20:59
  - Trace: [001-4-1-1-1-1-1-1-1-1-1-016-miniquiz-task-and-formal-handoff-diagnostics.trace.md](001-4-1-1-1-1-1-1-1-1-1-016-miniquiz-task-and-formal-handoff-diagnostics.trace.md)
  - Origin:
    - [relative](001-4-1-1-1-1-1-1-1-1-1-016-miniquiz-task-and-formal-handoff-diagnostics.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-15 11:52:44
  - Authors: Anchor
  - Why: Unambiguous unversioned user-facing Entry selection while preserving qualified history
  - Summary: Current Entry catalog from verified embedded lineage, no duplicated version choices
  - Status: ready/local

---

# Embedded Entry Discovery — Current Qualified Parent Leaf

## Supported Claim Or Question

- Supported Claim Or Question: Can the portable Entry catalog present one current reusable Entry to a novice when a qualified content source embeds a genuine Parent-linked Entry revision, without guessing from version numbers or erasing source lineage?
- Evidence Role: bounded Core regression and local catalog observation; not an independent ChatGPT Web acceptance.

## Provenance

- Known Source: qualified 016 17-Workspace recovery carrier and its exact self-contained Core runtime; Native Getting Started Entry v1 and child v2 in the carried Native Workspace; local sources were inspected read-only before editing Core.
- Preservation Basis: existing Entry catalog implementation and schema requirements, local Core source patch, two additional regression tests, fresh catalog invocation against 016 Native source.
- Provenance Limits: package/bootstrap receiver acceptance remains pending for the new candidate; not a remotely published or accepted release.

## Evidence Material

- cause
  - Material: Core `entry.catalog.js` previously restricted current Parent-leaf filtering to carried Workspace Entries while including all qualified reusable content-source Entries. Native embeds parent `tiinex.core.entry.getting-started.v1` and child `tiinex.core.entry.getting-started.v2` with a valid exact Parent and integrity reference.
  - Material Kind: qualified content-source and Core code inspection
  - Description: explains why the previous catalog showed two competing Getting Started versions in the same novice session.
- correction
  - Material: The same catalog now filters embedded reusable Entry branches to current qualified Parent leaves. It requires a resolved same-source relative Parent path, matching Entry name and schema, a verified child/parent self hash, and the child's exact Parent integrity binding. It does not infer supersession from labels, version numbers, filenames or timestamps.
  - Material Kind: Core source patch
  - Description: no new Entry schema, content surface, transport format, or prescribed Getting Started preference.
- verification
  - Material: 23/23 targeted Entry/catalog/CLI regression tests passed. A fresh catalog against the unchanged actual 016 Native content root returned exactly one Getting Started Entry (`tiinex.core.entry.getting-started.v2`) with zero Entry catalog findings.
  - Material Kind: local Node regression and runtime catalog receipts
  - Description: confirms deduplication in the consumer catalog while retaining the original qualified Entry bytes and exact Source references.

## Preservation And Fidelity

- Preservation State: 017 Core-only candidate; historical Native Entry artifacts and their Parent relationships remain byte-identical to 016.
- Fidelity Notes: Entry `Version` and exact `Canonical Identifier` remain internal contract fields as required by existing Entry schemas; the human-facing unique `Getting Started` label is now selectable without a competing v1. Embedded source bytes have not been pruned because the current child references the parent.
- Known Losses: does not remove historical Entry files from the raw bootstrap. A future distribution/publishing policy for compacting raw source lineage would require separate qualified scope and tests.

## Interpretation Limits

- Does Not Prove: spontaneous novice success, an accepted 3x2 test, any change to the semantics of formal Handoff, that all versioned Entries are mutually superseding, or that historical sources may be erased.
- Must Not Be Treated As: authorization to rewrite sealed Native history, relabel a canonical Entry ID without its schema obligations, or hide unrelated independent Entries sharing a label.
- Not Yet Used As: a formal W3C acceptance result.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-4-1-1-1-1-1-1-1-1-1-016-miniquiz-task-and-formal-handoff-diagnostics.trace.md](001-4-1-1-1-1-1-1-1-1-1-016-miniquiz-task-and-formal-handoff-diagnostics.trace.md)
  - Value: _dK27xlrA20JqOLlfSYfs4BU164XFGoUy76f_17ComM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EvS0YXjD7W96yLrkdndQ4u8XnAmBkiB7P2eIditoWIk