# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 23:53:05
  - Trace: [001-3-6-4-2-1-1-loom-to-anchor-core-major-004-canonical-schema-reference-authori.trace.md](handoffs/001-3-6-4-2-1-1-loom-to-anchor-core-major-004-canonical-schema-reference-authori.trace.md)
  - Origin:
    - [relative](handoffs/001-3-6-4-2-1-1-loom-to-anchor-core-major-004-canonical-schema-reference-authori.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Authors: Anchor
  - Why: A real recovery overlay dropped current-only specialist ancestry; Axiom classified the durable mechanical prevention layer to Core/Loom.
  - Summary: Turn read-only base/incoming/current comparison into a fail-closed reconciliation/manufacture proof gate without granting Tooling semantic merge authority.
  - Status: ready/local

---

# Core Major 005 — Return Reconciliation And Manufacture Proof Gate

## Objective

Turn the existing read-only base/incoming/current source-frontier comparison into a qualified mechanical proof gate that prevents recovery manufacture from silently dropping concurrent current-only or incoming-only source while still refusing to treat byte union as semantic merge authority.

## Done Criteria

- Provide one explicit Tooling operation or manufacture preflight that consumes a qualified base frontier, one incoming specialist return frontier, and the current accepted frontier.
- Classify exact, incoming-only, current-only, same-result concurrent, deletion candidates, and conflicting overlap deterministically.
- Require explicit disposition for conflict/deletion candidates before a reconciled frontier may be treated as manufacture-ready.
- Prove that accepted incoming-only and current-only paths are both preserved in the reconciled source set.
- Do not automatically decide semantic merge correctness, intentional deletion, authority, or acceptance from bytes alone.
- Integrate the proof into a manufacture/recovery workflow strongly enough that Anchor cannot accidentally repeat the complete-return-Workspace overlay bug without Tooling surfacing a blocker.
- Preserve local-first/package-first exact source authority and existing source-hygiene exclusions.
- Add focused regressions plus full Core portable/bootstrap validation before return.

## Scope

Core host-neutral source-reconciliation/manufacture mechanics only. No Docs semantic mutation, no Business process/Role mutation, no repository-specific merge policy, no automatic source conflict resolution, and no remote mutation.

## Starting Evidence

- Existing Core three-way source-frontier comparison already classifies base/incoming/current deltas read-only.
- Recent Anchor recovery work demonstrated a real integration failure where a complete incoming Workspace snapshot was overlaid as replacement and omitted current-only outbound Task/Handoff ancestry.
- Business/Docs now own the process rule that whole-Workspace replacement and automatic byte union are not semantic merge authority; Core should enforce the mechanical proof boundary without inventing semantic disposition.

## Dependencies

- Existing qualified Core three-way base/incoming/current source-frontier comparison mechanics.
- Accepted Business process authority for reconciliation, fixed-Major discipline, recovery, and owner disposition.
- Docs semantic grounding that keeps byte preservation/mechanical proof separate from semantic merge authority.
- Exact prior Core Major 004 return as Parent continuity.

## Acceptance Boundary

Tooling may prove what bytes would be preserved or conflicted and may block manufacture until required dispositions exist. Tooling must not infer whether a conflicting semantic change is correct.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-2-1-1-loom-to-anchor-core-major-004-canonical-schema-reference-authori.trace.md](handoffs/001-3-6-4-2-1-1-loom-to-anchor-core-major-004-canonical-schema-reference-authori.trace.md)
  - Value: kdgj1Kvrps08ga1NYi96Q4cBX8uCJoVfcTu7avsrlQY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: QXd_Yj3VRLrMppQF_qK1oNGD2CL28w3_iFgB9XSyCKo