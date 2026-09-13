# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 22:56:27
  - Trace: [010-1-anchor-to-loom-core-major-010-parent-integrity-resolution-correctness.trace.md](010-1-anchor-to-loom-core-major-010-parent-integrity-resolution-correctness.trace.md)
  - Origin:
    - [relative](010-1-anchor-to-loom-core-major-010-parent-integrity-resolution-correctness.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 23:15:36
  - Authors: Loom
  - Why: Core Major 010 is implemented and locally qualified; Anchor needs the exact candidate bytes and evidence for final reconciliation.
  - Summary: Return the qualified shared resolver repair with exact Axiom replay and broad validation evidence.
  - Status: ready/local

---

# Loom To Anchor — Core Major 010 Parent Integrity Resolution Correctness Return

## Handoff Parties

- Purpose: return the qualified Core candidate that repairs method-aware parent-integrity qualification and exact repository/ref Parent handling, together with the exact Axiom reproductions and validation evidence.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Transfers

- core-major-010-candidate
  - Transfer Kind: work-and-responsibility
  - Description: complete carried Core Workspace with the bounded shared resolver repair and regression tests applied.
  - Controlling Artifact: [Core Major 010 — Parent Integrity Resolution Correctness](../010-core-major-010-parent-integrity-resolution-correctness.trace.md)
  - Boundary: candidate is locally qualified only; no release, publication, commit, push or destructive Reduction was performed.

- resolver-correctness-evidence
  - Transfer Kind: responsibility
  - Description: exact pre-change reproduction, root cause, source delta, broad Core/tooling validation and post-change Docs lineage replay recorded below.
  - Boundary: evidence establishes the shared resolver repair; it does not authorize destructive Reduction or redefine Docs semantics.

## Root Cause And Repair

### Method-aware parent integrity

- Pre-change failure: `.topics/.validators/tiinex-reduction-destructive-lineage-eligibility-v1.validator.md` declares `sha256-base64url-c14n-v1` toward `.topics/.schemas/validation/method/tiinex.validation.method.v1.schema.md` with value `zy2VZGF-AMEVjvaFuggR3INb9RHm9veCZDXd1XQKtZY`.
- Axiom reproduction: direct c14n-v1 canonicalization of the carried target bytes is exactly `zy2VZGF-AMEVjvaFuggR3INb9RHm9veCZDXd1XQKtZY`, while the target's unrelated c14n-v2 self value is `C0az3msKICiqcp2tNF5uWe-qN7Mw7LZdbCcZfSDsx1k`.
- Root cause: shared parent qualification discarded the declared integrity method and compared the child value against target self-integrity values, producing a false mismatch across incompatible methods.
- Repair: preserve `{method, value, towards}` expectations. For c14n-v1, canonicalize the resolved exact target bytes directly using the carried validator semantics and compare that digest. For self-referential methods such as c14n-v2, compare only method-compatible target self entries. A declared method with no compatible verification material is unavailable/probable rather than a fabricated mismatch.

### Exact repository/ref Parent identity

- Pre-change failure: `.topics/.schemas/tiinex.workspace.v1.schema.md` pins `https://github.com/Tiinex/docs/blob/cca53fc8c52fd27b92b9429420efd613913a88bd/.topics/.schemas/tiinex.root.v1.schema.md` and declares historical c14n-v1 `EZxpiMk3z_FLLiUY_fZ3TV1ui4zgq34d-gu2TWHVI3g`.
- Axiom reproduction: the resolver substituted current same-path Root material carrying c14n-v2 self `QXbg7uxlhO1ou4PukRaub3fSJ_Ef32mSubsI2ib1LH0`, then reported a false integrity mismatch.
- Root cause: URL target parsing retained repository/path but lost the explicit ref, and source filtering could fall back to unscoped current same-path material. Integrity-hash resolution could also run before exact source identity.
- Repair: parse GitHub file identity as repository + exact ref + path, carry that source constraint through exact/suffix/declared-parent resolution, preserve case-sensitive ref text, disable unscoped fallback when an explicit ref exists, and do not let self-integrity shortcuts outrank explicit repository/ref identity. Exact ref material is selected when present; otherwise the resolver fails visibly instead of aliasing current bytes.

## Source Delta

Relative to the exact carried Core Workspace materialized independently from the inbound package:

- Added `src/integrity/integrity.c14nV1.js` — canonical c14n-v1 target-state/digest implementation from carried Docs validator semantics. Delta: +28 / -0 lines.
- Changed `src/lineage/lineage.integrity.js` — method-preserving Parent expectations and method-aware verification. Delta: +111 / -25 lines.
- Changed `src/lineage/lineage.resolve.js` — propagate method-bearing expectations and explicit target source/ref constraints; prevent explicit-ref identity from being bypassed by hash-first matching. Delta: +22 / -15 lines.
- Changed `src/lineage/lineage.sourceScope.js` — recover repository/ref from source/provenance and require exact ref matches without unscoped fallback. Delta: +41 / -12 lines.
- Changed `src/lineage/lineage.targetKeys.js` — GitHub file identity parser and ref-preserving source keys. Delta: +26 / -7 lines.
- Added `test/lineage-parent-integrity-correctness.test.mjs` — deterministic c14n-v1, direct-target method qualification, and commit-pinned identity regression coverage. Delta: +74 / -0 lines.
- Removed files: none.
- Independent baseline comparison: exactly 2 added files, 4 changed files, 0 removed files outside runtime-only `.tiinex` continuation state.

## Validation Evidence

### Pre-change Axiom replay

Exact carried corrected Docs Workspace resolved with the carried pre-change Core resolver:

- Result: `invalid`.
- Findings: 2 errors, 12 warnings, 14 info, 28 total.
- Protected error 1: workspace schema historical Root declaration `EZxpiMk3z_FLLiUY_fZ3TV1ui4zgq34d-gu2TWHVI3g` was compared against current Root `QXbg7uxlhO1ou4PukRaub3fSJ_Ef32mSubsI2ib1LH0` through a same-path substitution.
- Protected error 2: destructive-lineage validator c14n-v1 `zy2VZGF-AMEVjvaFuggR3INb9RHm9veCZDXd1XQKtZY` was compared against Validation Method c14n-v2 self `C0az3msKICiqcp2tNF5uWe-qN7Mw7LZdbCcZfSDsx1k`.

### Focused regression

`node --test test/lineage-parent-integrity-correctness.test.mjs`

- 3 tests passed, 0 failed.
- c14n-v1 deterministic fixture expected and produced `noePJ5GZQp_41f7brwmdSJYY8859stB0YFrCrqT_ppk`.
- Direct-target c14n-v1 Parent qualification verifies without consulting unrelated c14n-v2 self material.
- Commit-pinned GitHub Parent does not link current same-path material when historical material is absent; when exact historical source/ref material is present, that exact node is selected and verified.

### Coarse and broad Core/tooling health

Final candidate source state:

- `npm test`: 105 tests passed, 0 failed, 0 skipped/cancelled.
- `npm run test:portable`: passed (`portable node surface imports`).
- `npm run test:bootstrap`: passed with status `embedded-qualified`; 498 runtime files, 5,481,114 runtime bytes; manifest SHA-256 `34b83a86fcfc4f409bcfacbc4856542dd6c6e29c4b7afaca373cb8000b03c031`; representation SHA-256 `f8db043af3a57f8523e8f4ffddabee171ca20b4d1230e3ba5872dc01dc2219bf`.

### Final corrected Docs lineage replay

Final candidate resolver against the exact carried corrected Docs Workspace:

- Command surface: portable `resolve-lineage` over the materialized carried Docs Workspace, with no remote fetch or remote write.
- Exit: success.
- Finding summary: `degraded`, 0 errors, 27 warnings, 15 info, 42 total.
- Protected method case: `.topics/.validators/tiinex-reduction-destructive-lineage-eligibility-v1.validator.md` now has a `verified` Parent edge to the carried Validation Method target. Diagnostic method/basis is `sha256-base64url-c14n-v1`; expected and actual are both exactly `zy2VZGF-AMEVjvaFuggR3INb9RHm9veCZDXd1XQKtZY`.
- Protected historical-ref case: `.topics/.schemas/tiinex.workspace.v1.schema.md` no longer links the current same-path Root. Its explicit `cca53fc8c52fd27b92b9429420efd613913a88bd` Parent is reported as missing/unloaded in the supplied current Workspace rather than fabricated as an integrity mismatch.
- Both protected Integrity Major 001 errors are therefore mechanically cleared for the intended reasons.
- The increased warning count is the fail-closed consequence of exact repository/ref preservation across other carried historical pins whose exact historical source bytes are not loaded; current same-path material is no longer silently accepted for those pins.

## Remaining Blockers And Limits

- Core repair blocker: none found in the exact carried scope after the final broad gate.
- Historical-byte availability: portable loaded-only replay cannot verify a repository/ref-pinned Parent when the exact historical artifact is not present with qualified source/ref identity. The resolver now exposes that condition as missing/unloaded. Supplying exact historical bytes must occur through the qualified repository/ref recovery contract; Core must not infer current same-path equivalence.
- Docs semantics: unchanged. No Docs integrity value, schema meaning or canonical declaration was modified by Loom.
- Reduction: not authorized by this return. Anchor/Axiom retain final audit and any destructive Reduction qualification.

## Required Context

- core-workspace
  - Material: complete Core candidate Workspace carried in this return package.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact candidate source bytes and tests.
  - Availability: available

- controlling-task
  - Material: Core Major 010 repair contract.
  - Material Reference: [Core Major 010 — Parent Integrity Resolution Correctness](../010-core-major-010-parent-integrity-resolution-correctness.trace.md)
  - Purpose: scope, done criteria and return boundary.
  - Availability: available

- integrity-classification-evidence
  - Material: Axiom classification evidence for the protected parent-integrity findings.
  - Material Reference: [Integrity Major 001 Classification Evidence](docs::.topics/lineage-integrity/001-1-axiom-docs-parent-integrity-mismatch-classification-evidence.trace.md)
  - Purpose: semantic oracle for the two reproductions.
  - Availability: available

- docs-workspace
  - Material: corrected Docs Workspace carried by the inbound package and used for replay.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: post-repair lineage requalification target.
  - Availability: available

## Reference Context

- inbound-delegation
  - Material: Anchor-to-Loom Core Major 010 handoff.
  - Material Reference: [Anchor To Loom — Core Major 010 Parent Integrity Resolution Correctness](010-1-anchor-to-loom-core-major-010-parent-integrity-resolution-correctness.trace.md)
  - Purpose: exact delegated responsibility and return expectation.
  - Availability: available

## Retained Responsibilities

- canonical-semantics
  - Retained By: Axiom / Docs authority
  - Responsibility: canonical integrity and Parent meaning remain Docs-owned; this candidate only implements carried semantics.

- final-reconciliation
  - Retained By: Anchor
  - Responsibility: audit this return, reconcile accepted Core bytes into the controlling line, and coordinate any wider lineage or Reduction requalification.

- human-role
  - Retained By: Sigma
  - Responsibility: no ordinary debugging or source repair is shifted to Sigma by this return.

## Exclusions And Dependencies

- no-docs-workaround
  - Kind: excluded-scope
  - Description: no Docs semantic weakening, integrity rewrite or path-specific suppression was used.

- no-destructive-reduction
  - Kind: excluded-scope
  - Description: no destructive Reduction, lineage deletion or eligibility claim was performed.

- no-release-or-remote-mutation
  - Kind: excluded-scope
  - Description: no release, publication, deployment, commit, push or remote write was performed.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives the complete qualified Core candidate, exact resolver diagnosis/delta, broad validation evidence and corrected Docs replay needed for final reconciliation.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: all historical repository/ref Parents are now locally loaded, destructive Reduction is eligible, or project-wide lineage is closed.
- Must Not Be Used To Claim: release readiness, remote publication, broad Docs cleanup, or authority beyond shared Core resolver mechanics.
- Authority Limits: Loom returns implementation and technical evidence; Axiom owns canonical semantics; Anchor owns final orchestration and reconciliation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [010-1-anchor-to-loom-core-major-010-parent-integrity-resolution-correctness.trace.md](010-1-anchor-to-loom-core-major-010-parent-integrity-resolution-correctness.trace.md)
  - Value: O8WKfLAtlJB464A60BROELmi8ZRtPz_W5lLounX_qgA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PcQdMNaY7SKdrw9OItMoqi0vQFz8dILdZwPFA7YpqQ8