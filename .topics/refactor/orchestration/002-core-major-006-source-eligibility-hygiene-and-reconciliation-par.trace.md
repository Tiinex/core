# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:34:58
  - Trace: [001-3-6-4-2-1-1-1-1-1-loom-to-anchor-core-major-005-reconciliation-and-manufacture-pro.trace.md](handoffs/001-3-6-4-2-1-1-1-1-1-loom-to-anchor-core-major-005-reconciliation-and-manufacture-pro.trace.md)
  - Origin:
    - [relative](handoffs/001-3-6-4-2-1-1-1-1-1-loom-to-anchor-core-major-005-reconciliation-and-manufacture-pro.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:48:46
  - Authors: Anchor
  - Why: Dogfooding Core Major 005 against the real Site return proved that carried __pycache__ bytecode is currently treated as incoming-only source and blocks a sanitized candidate.
  - Summary: Align source eligibility across manufacture and reconciliation so generated Python cache bytes do not become mandatory durable source.
  - Status: ready/local

---

# Core Major 006 — Source Eligibility Hygiene And Reconciliation Parity

## Objective

Close the source-hygiene blind spot exposed by the first real Core Major 005 reconciliation dogfood: generated Python bytecode/cache state carried by a specialist return must not become mechanically mandatory source merely because it appears as an incoming-only path.

## Done Criteria

- Reproduce the exact observed Site return shape where `tools/__pycache__/browser-smoke.cpython-313.pyc` is present in the returned complete Workspace even though the specialist Evidence declares only three durable Site source files.
- Define one host-neutral source-eligibility/exclusion contract reused by Workspace manufacture, local source enumeration, source-frontier comparison/reconciliation, and reconciliation manufacture proof where those operations claim the same source boundary.
- At minimum, Python bytecode/cache state (`__pycache__/` and compiled Python cache files) is excluded consistently without excluding ordinary Python source.
- A reconciled candidate that preserves all qualified durable incoming/current source but omits source-ineligible generated cache state can become manufacture-ready without a fake semantic deletion disposition.
- Historical carriers that already contain generated cache bytes remain exact transport evidence; the new mechanics must distinguish transport bytes from eligible source instead of rewriting historical packages.
- Do not add broad filename heuristics for operator-authored scripts such as `_author_*.mjs`; those require explicit owner/process disposition rather than generic Tooling deletion.
- Add focused regression coverage using the real failure shape and full Core portable/bootstrap validation before return.

## Scope

Core host-neutral source enumeration, source-frontier eligibility, reconciliation proof, and manufacture requalification mechanics only.

## Starting Evidence

- Core Major 005 correctly proves a current+incoming union and blocks source drift.
- Dogfooding that gate against the Site Major 005 Windows return reports `tools/__pycache__/browser-smoke.cpython-313.pyc` as deterministic `incoming-only` source and therefore rejects a sanitized candidate that omits it.
- Current recovery has also accumulated other generated/scratch state, demonstrating that source eligibility must be solved at the shared mechanical boundary rather than by repeated Anchor cleanup.

## Dependencies

- Accepted Core Major 005 reconciliation/manufacture proof gate.
- Exact Site Major 005 Windows return that reproduces generated Python cache carriage.
- Current Business reconciliation process authority and Docs source/authority boundary.

## Acceptance Boundary

Source eligibility is not semantic merge authority. Tooling may exclude qualified non-source runtime/cache state from source-frontier identity, but must not infer that arbitrary current/incoming files are disposable.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-2-1-1-1-1-1-loom-to-anchor-core-major-005-reconciliation-and-manufacture-pro.trace.md](handoffs/001-3-6-4-2-1-1-1-1-1-loom-to-anchor-core-major-005-reconciliation-and-manufacture-pro.trace.md)
  - Value: V9C20WQQkTZL8nlmBtkuenNcpy2Ox632MLKruVA_xqI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: AygiR7DUogYhjpIy51_tsutLQZfhIFc3vXnf0n4ySQw