# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 01:06:38
  - Trace: [002-1-loom-to-anchor-core-major-006-source-eligibility-hygiene-and-rec.trace.md](handoffs/002-1-loom-to-anchor-core-major-006-source-eligibility-hygiene-and-rec.trace.md)
  - Origin:
    - [relative](handoffs/002-1-loom-to-anchor-core-major-006-source-eligibility-hygiene-and-rec.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 08:06:35
  - Authors: Anchor
  - Why: Docs Major 004 narrowed the real defect; Core must enforce exact per-field authority consistently across authoring, audit and manufacture.
  - Summary: Implement prospective exact-reference enforcement and historical diagnostic behavior against the accepted Axiom per-field rule.
  - Status: ready/local

---

# Core Major 007 — Per-Field Schema Reference Authority Enforcement

## Objective

Implement the Docs Major 004 per-field exact-reference authority rule across common authoring, staging/audit/editor assistance and manufacture preflight so new artifacts fail closed on avoidable weak schema references while historical bytes remain preservable and diagnosable.

## Done Criteria

- A new artifact with qualified exact Root authority renders the exact Root link; forcing bare Root blocks new-candidate sealing/acceptance/manufacture.
- A schema field with no qualified immutable exact target remains truthfully plain-id without a fabricated warning/error solely because adjacent fields are links.
- Supplying qualified exact authority for the exact current schema bytes causes the field to render that exact link; stale/mismatched authority is rejected.
- Existing historical artifacts remain byte-unchanged while audit/editor assistance may expose avoidable weak references as warning/degraded debt.
- Resolved link identity/material contradiction remains blocking.
- Core exposes host-neutral finding/severity so hosts render policy rather than recreate it.
- Focused regressions cover the six Docs Major 004 acceptance properties and full Core portable/bootstrap validation passes.

## Scope

Core common authoring, schema-reference authority, staging/audit/editor assistance and manufacture-preflight mechanics only.

## Exclusions

No Docs canonical byte mutation, no host-specific UI implementation, no historical artifact rewrite, no false immutable publication/reference target fabrication, and no remote action.

## Dependencies

- Accepted Docs Major 004 per-field schema-reference authority disposition.
- Existing Core Major 004 exact-reference authority mechanics.
- Current Core common authoring, staging/audit/editor and manufacture-preflight surfaces.
- Current Site historical reproduction used only as preserved audit fixture/evidence.

## Acceptance Boundary

The implementation is accepted only if all six Axiom acceptance properties are covered and full Core portable/bootstrap validation passes. Host UI adoption and canonical Docs byte changes remain separate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-1-loom-to-anchor-core-major-006-source-eligibility-hygiene-and-rec.trace.md](handoffs/002-1-loom-to-anchor-core-major-006-source-eligibility-hygiene-and-rec.trace.md)
  - Value: DALKbrstikp8gYS-7P24KlSHId4DMCzM9LgWQoqaMmE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Fhgix461yciWBfK4v8JJjHnHcMpdxZ_WXknN9YGyOJs