# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-18 18:22:57
  - Trace: [049-anchor-to-anchor-integrated-full-recovery-after-parallel-vs-code.trace.md](handoffs/049-anchor-to-anchor-integrated-full-recovery-after-parallel-vs-code.trace.md)
  - Origin:
    - [relative](handoffs/049-anchor-to-anchor-integrated-full-recovery-after-parallel-vs-code.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-18 19:28:38
  - Authors: Anchor
  - Why: VS Code audit surfaced exact validation being withheld because compiled schema lineage substitutes Parent source authority; the defect must be repaired without rewriting historical artifacts or weakening fail-closed validation.
  - Summary: Repair Core runtime schema inheritance authority so compiled Parent material cannot silently substitute a different source revision than the child declares.
  - Status: ready/local

---

# Compiled Schema Lineage Source-Authority Coherence

## Objective

Repair the Core runtime-schema compilation/qualification path so exact validation is withheld only when source authority is genuinely unresolved, not because a compiled inheritance lineage silently substitutes a different parent source revision than the child schema explicitly declares.

The exact reproduced case is `tiinex.party.organization.v1`: the child schema declares `tiinex.party.v1` at Docs commit `2a40646640f7468bcd250df6988b69e9f047f1bb`, while the compiled runtime lineage currently substitutes `tiinex.party.v1` material attributed to Docs commit `3988951208eb9a8926e84ab42625d4b42fa00c2d`. `portableRuntimeValidationAuthorityForRecord` therefore correctly withholds exact validation for Business `.topics/001-tiinex.trace.md`.

## Done Criteria

- Reproduce the exact `audit.schema-authority.unqualified` finding for Business `.topics/001-tiinex.trace.md` without mutating that historical artifact.
- Audit all registered Core runtime schema projections for child-declared Parent source authority versus compiled Parent source authority; preserve an exact inventory of every mismatch relevant to this defect.
- Determine whether the defect is in runtime-schema compilation/material selection, runtime projection generation, packaged schema binding material, or an explicitly qualified Docs schema revision boundary. Do not infer that same schema id or byte similarity permits source substitution.
- Ensure compiled inheritance validation follows the exact qualified Parent source declared by the child when that exact source authority is available.
- If the exact declared historical Parent source material is unavailable, fail closed or surface truthful unresolved authority; do not silently replace it with the current registry representation.
- Preserve historical artifacts byte-exact. Do not rewrite Business/Docs artifacts merely to silence Core diagnostics.
- Preserve the existing distinction between historical locator/reference debt and a compiled lineage source-authority contradiction.
- Add focused regressions for at least `tiinex.party.organization.v1` and one additional affected inheritance chain, plus a negative case proving source substitution remains rejected.
- Keep full Core regression, portable smoke, embedded-bootstrap qualification and current grounding/cache/carrier tests green.
- Produce qualification Evidence and one Loom-to-Anchor return Handoff.

## Scope

Core schema runtime projection/compiler material selection, exact schema validation authority qualification, schema source bindings/projections, focused regressions, and embedded bootstrap only.

## Exclusions

- No Business or Docs historical artifact rewrite.
- No weakening of exact source-authority checks merely to remove warnings.
- No treating repository adjacency, same schema id, current registry bytes, or newer commit as authority to replace a child-declared Parent source revision.
- No new JSON helper/sidecar format beyond existing Core runtime schema projections.
- No Site, VS Code, App, Verse or product behavior changes.
- No carrier-lineage or artifact-Parent-lineage redesign.

## Dependencies

- Core Handoff `049-anchor-to-anchor-integrated-full-recovery-after-parallel-vs-code.trace.md` is the accepted integrated source frontier.
- Current Core `portableRuntimeValidationAuthorityForRecord` fail-closed behavior is diagnostic evidence and must not be weakened without qualified replacement authority.
- Business `.topics/001-tiinex.trace.md` is the exact reproduction artifact; its verified self-integrity and declared Current Schema bytes are read-only evidence.
- Current Docs schema artifacts are read-only semantic/source references unless a separate semantic owner qualifies a revision.

## Acceptance Boundary

This work is accepted only when exact validation authority is source-coherent across compiled inheritance, historical artifact bytes remain untouched, source substitution still fails closed, and the full Core validation surface remains green. A reduction in warnings alone is not acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [049-anchor-to-anchor-integrated-full-recovery-after-parallel-vs-code.trace.md](handoffs/049-anchor-to-anchor-integrated-full-recovery-after-parallel-vs-code.trace.md)
  - Value: kFRshcJvq6A4NXxs45q19xd8iWohFZAfbQDkbaID-uM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xlXmVgz2680XcmIIem56VGQwUuTgFSZZMCvmQEJ4zGQ