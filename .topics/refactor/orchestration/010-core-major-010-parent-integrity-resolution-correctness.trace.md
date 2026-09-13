# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 14:30:42
  - Trace: [003-1-1-1-1-1-loom-to-anchor-core-major-009-minimal-carrier-material-represent.trace.md](handoffs/003-1-1-1-1-1-loom-to-anchor-core-major-009-minimal-carrier-material-represent.trace.md)
  - Origin:
    - [relative](handoffs/003-1-1-1-1-1-loom-to-anchor-core-major-009-minimal-carrier-material-represent.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 22:56:27
  - Authors: Anchor
  - Why: Axiom classified two protected Docs findings as one corrected semantic declaration plus two remaining shared resolver defects that block mechanically clean lineage qualification.
  - Summary: Repair method-aware parent-integrity resolution and exact historical repository/ref Parent handling.
  - Status: ready/local

---

# Core Major 010 — Parent Integrity Resolution Correctness

## Objective

Repair the shared portable lineage resolver so parent-integrity qualification respects the declared integrity method and explicit repository/ref identity instead of comparing incompatible target self-integrity values or collapsing historical pins to current same-path material.

## Current Evidence

Integrity Major 001 (Axiom) classified the two protected Docs findings:

- `.topics/.schemas/tiinex.workspace.v1.schema.md`: the original historical Root c14n-v1 declaration was stale and is corrected in Docs, but portable `resolve-lineage` still substitutes current same-path Root material for the explicit historical commit pin.
- `.topics/.validators/tiinex-reduction-destructive-lineage-eligibility-v1.validator.md`: the declared c14n-v1 value exactly matches direct canonicalization of the carried Validation Method parent, yet portable `resolve-lineage` compares it to the parent's c14n-v2 self value and reports a false mismatch.
- Axiom identified the shared implementation seam in `runtime/src/lineage/lineage.integrity.js`: parent qualification currently uses target self-integrity values without preserving method-aware direct-target comparison.

These are mechanically unresolved Tooling defects after semantic classification. Docs must not be weakened to make the resolver green.

## Done Criteria

- Reproduce both exact Integrity Major 001 cases from the carried Docs evidence before changing shared mechanics.
- For a child entry using `sha256-base64url-c14n-v1` toward a Parent, compare against the canonical digest required by that declared method over the resolved exact target bytes; do not substitute an unrelated target self-integrity entry merely because it exists.
- Preserve c14n-v2 and other existing method semantics; make the comparison method-aware rather than special-casing the two affected paths.
- Preserve explicit repository/ref identity. A Parent pinned to a historical repository ref must resolve those exact bytes through the qualified repository/ref recovery contract or fail visibly; current same-path stable-identity material must not silently satisfy the pin.
- Re-run the two Axiom reproductions so the false positives are eliminated for the right reason.
- Run coarse Core/tooling health first, then the broadest existing lineage/portable validation available under the exact repository toolchain. Focused regression evidence supports but does not replace broad health.
- Re-run Docs lineage resolution against the carried corrected Docs Workspace and report whether both protected errors are mechanically cleared.
- Do not change Docs semantics, integrity declarations, or canonical schema meaning from Core.

## Scope

Shared Core portable lineage parent-integrity resolution and the minimum test/evidence surface necessary to prove method-aware digest qualification and exact historical repository/ref Parent handling.

## Dependencies

- Current Core Workspace.
- Integrity Major 001 Axiom evidence and corrected Docs Workspace.
- Canonical integrity method semantics from Docs as carried; Core implements, it does not redefine them.
- Business Role context for Loom/Anchor boundaries.

## Exclusions

- No Docs semantic weakening or broad schema refactor.
- No destructive Reduction apply, lineage deletion, release, publication, push or unrelated Tooling cleanup.
- No dependency substitution or narrow path-specific hacks that only silence the two reported findings.
- No claim that a clean resolver authorizes destructive Reduction; that remains a separate qualification contract.

## Return Boundary

Return one qualified Loom-to-Anchor carrier containing actual Core candidate bytes, exact root-cause explanation, source delta, coarse/broad validation evidence, replay of both Axiom reproductions, Docs lineage requalification result, and any remaining blocker. Do not shift source repair or ordinary debugging to Sigma.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-1-1-1-1-1-loom-to-anchor-core-major-009-minimal-carrier-material-represent.trace.md](handoffs/003-1-1-1-1-1-loom-to-anchor-core-major-009-minimal-carrier-material-represent.trace.md)
  - Value: l7pPO0Q0TZGmNYbfWCq9lmgcb0sCCgpL-Z9Fm12fnfA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: XJQjJW_HrslLzXIHPFWwZJavSlA9A-VBMYCvIKwIZGY