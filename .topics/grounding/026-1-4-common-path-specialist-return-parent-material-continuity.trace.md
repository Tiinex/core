# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:35:17
  - Trace: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Origin:
    - [relative](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 08:52:11
  - Authors: Anchor
  - Why: The real fresh Axiom return proves the lower-level endpoint Role mechanics are not enough: the common continuation-to-handoff path can emit a return with parent dimension but without the exact parent material needed by a fresh Anchor.
  - Summary: Repair ordinary fresh specialist return manufacture so exact received package-parent material survives continuation into common handoff completion without manual package-parent coaching.
  - Status: ready/local

---

# Common-Path Specialist Return Parent Material Continuity

## Objective

Close the remaining real-session acceptance gap after Task `026-1-3`: the lower-level package-parent endpoint Role mechanics are qualified, but the ordinary fresh specialist completion sequence can still manufacture a return carrier that retains a parent carrier dimension while losing the exact received package-parent material/provenance required to project the recipient Role.

The repair target is the exact fresh-session path:

`receive qualified Anchor -> Axiom carrier` → `orient/ground` → `ground --continue` → `author specialist Decision/Handoff` → ordinary `handoff` completion → `Axiom -> Anchor return` → fresh Anchor `grounded-to-act`.

No manual `--package-parent`, holder Role, endpoint Role insertion, or Sigma coaching may be required.

## Done Criteria

- Reproduce Evidence `031` using the exact real fresh Axiom return carrier whose SHA256 is `d046b45a0eb6e70bf88b98434590f9da0e8ab4400010036ff823e1453f718e3d` and whose selected return route has zero endpoint Role pointers and blocks fresh Anchor holder binding.
- Reproduce the same defect from a deterministic physical common-path sequence beginning with an exact qualified outbound carrier, not by directly invoking only the lower-level manufacture API with an explicitly supplied package parent.
- Identify where exact received package-parent provenance/material availability is lost between recipient grounding/continuation and ordinary `handoff` completion.
- Ensure ordinary `handoff` can recover/use the exact qualified received parent carrier required for return material closure when that carrier remains available to the continuation session.
- Preserve exact parent package identity/provenance strongly enough that the return carrier's endpoint Role requirements can be rebound only to exact qualified parent material, not merely to a matching Role label or nearby Workspace content.
- If the exact received parent package/material is unavailable at completion time, fail closed with actionable recovery guidance instead of emitting a ready return that lacks required endpoint Role grounding material.
- Add an exact behavioral regression that executes the normal recipient flow: physical outbound package → ground/continue → authored return Handoff → common `handoff` command without manual package-parent flags → physical return package → fresh recipient ground.
- Positive regression must show the physical return carries the exact `To` Anchor endpoint Role material/pointer through bounded cache closure and fresh Anchor reaches `grounded-to-act` without `--holder-role`.
- Negative regression must remove/unavailable the exact received package parent after continuation and prove ordinary `handoff` blocks rather than silently producing a partial return carrier.
- Preserve Task `026-1-3` lower-level positives/negatives, Role/cache participation separation, external Parent closure, carrier numbering/prefix/N+1 consolidation mechanics, and artifact/carrier-lineage separation.
- Keep full Core regression, portable smoke and embedded-bootstrap qualification green.
- Produce exact qualification Evidence and one Loom-to-Anchor return Handoff.

## Scope

Core portable recipient continuation state, common-path `handoff` command inference, exact received package-parent provenance/material provider recovery, Handoff manufacture preflight, physical roundtrip regressions, and embedded bootstrap only.

## Dependencies

- Evidence `031-real-fresh-axiom-return-common-path-parent-material-failure.trace.md` is the controlling real-session acceptance failure.
- Evidence `029-return-recipient-role-closure-symmetry-qualification.trace.md` remains the accepted lower-level endpoint Role/material mechanics baseline and must stay green.
- Evidence `030-anchor-acceptance-return-recipient-role-closure-symmetry.trace.md` remains bounded to the deterministic Core mechanics it accepted; this Task adds the missing real common-path behavioral acceptance surface.
- Task `026-1-3-return-recipient-role-closure-symmetry-mechanics.trace.md` remains the parent mechanics baseline.
- Accepted Docs semantic boundary remains unchanged: Role/cache presence alone does not establish semantic participant membership.

## Boundaries

- No Business/Docs semantic rewrite and no repeat Axiom semantic review.
- No requirement for Sigma/manual `--package-parent` coaching in the successful path.
- No provider/chat identity, endpoint-label, filename, Role-inventory, or package-proximity fallback for exact parent/material authority.
- No new JSON sidecar/cache schema/host-private database; use existing Tiinex continuation/package provenance mechanisms or qualify the minimum native extension if one is genuinely required.
- No whole-Business Workspace widening when exact bounded endpoint Role material is sufficient.
- No Site, VS Code, App, Verse or unrelated product work.
- No weakening of fail-closed recipient holder binding or Task `027` source-authority mechanics.

## Acceptance Boundary

This Task is complete only when the exact ordinary fresh-role completion path — not merely advanced manufacture with explicit package-parent inputs — produces a return that grounds a fresh Anchor to act, while unavailable received-parent material blocks completion before a partial return carrier can be emitted.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Value: qUmfFdL2S-deGs5deVJRIGQCLb8CpQ-1u8Xc85B7D_k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qjxJPMD3UpEQZRd6G04ywxVq2tmmWWK7wMjX4srUa4g