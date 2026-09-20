# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 08:52:11
  - Trace: [026-1-4-common-path-specialist-return-parent-material-continuity.trace.md](../026-1-4-common-path-specialist-return-parent-material-continuity.trace.md)
  - Origin:
    - [relative](../026-1-4-common-path-specialist-return-parent-material-continuity.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-19 09:17:00
  - Authors: Loom
  - Why: Close Core Task 026-1-4 with exact implementation and physical regression evidence.
  - Summary: Qualify exact received-parent continuity and unreferenced endpoint Role closure across the ordinary physical specialist return path.
  - Status: ready/local

---

# Common-Path Specialist Return Parent Material Continuity Qualification

## Supported Claim Or Question

- Supported Claim Or Question: does ordinary specialist completion preserve and consume exact received package-parent identity/material strongly enough to close unreferenced Role endpoints through the exact selected parent route, emit a complete physical return, and let a fresh recipient ground to act without manual package-parent or holder-role coaching
- Evidence Role: implementation and physical behavioral qualification evidence for Core Task `026-1-4`

## Provenance

- Known Source: exact grounded Core Workspace, exact read-only failure specimen SHA256 `d046b45a0eb6e70bf88b98434590f9da0e8ab4400010036ff823e1453f718e3d`, and deterministic physical common-path regression output
- Preservation Basis: exact received source bytes remain the implementation authority; the failure specimen remained read-only and was never used as cold-start authority
- Controlling Task: `core/.topics/grounding/026-1-4-common-path-specialist-return-parent-material-continuity.trace.md`
- Controlling Failure Evidence: `core/.topics/grounding/evidence/031-real-fresh-axiom-return-common-path-parent-material-failure.trace.md`
- Exact Failure Specimen SHA256: `d046b45a0eb6e70bf88b98434590f9da0e8ab4400010036ff823e1453f718e3d`
- Exact Failure Specimen Selected Route: `docs:.topics/grounding/handoffs/021-axiom-to-anchor-qualified-role-presence-semantic-review-result.trace.md`
- Failure Specimen Result: zero endpoint Role pointers; fresh Anchor `insufficient-grounding` with `recipient-role-unresolved` and `session-holder-role-binding-unresolved`
- Qualification Surface: Core source plus deterministic physical carrier roundtrip through ordinary `ground --continue`, `author`, and common `handoff`
- Provenance Limits: this Evidence qualifies Core Task `026-1-4` only; it does not claim broader Anchor integration, remote publication, or product readiness

## Evidence Material

- Material: repaired Core portable runtime plus deterministic physical outbound-package → ground/continue → author return → common handoff → physical return → fresh ground regression in `test/blank-workspace-role-cache-grounding.test.mjs`
- Material Kind: executable implementation and physical carrier qualification evidence
- Exact Failure Shape: authoritative return Handoff declares `From: Axiom` / `To: Anchor` with `Kind: role` and no Role References, matching the supplied real failure specimen
- Positive Shape: common completion receives no manual `--package-parent` and no `--holder-role`; exact selected parent-route Role bindings close both return endpoints
- Negative Shapes: exact received parent path substituted with another valid carrier, and exact received parent removed after continuation

## Root Cause

- Endpoint Requirement Projection: a Handoff endpoint declared as `Kind: role` was projected into material-closure requirements only when an explicit Role Reference was present; the real Axiom return had `From: Axiom` and `To: Anchor` Role endpoints but no Role References, so manufacture created zero endpoint Role requirements and could emit a partial return
- Continuation Identity Gap: ordinary `ground --continue` preserved only the received package path, not its physical SHA256/filename, so later common completion could not verify that the path still named the exact received carrier
- Physical Lineage Gap: package-v1 rendered parent carrier dimension but omitted parent package SHA256/filename, so physical reload discarded parent package identity even when manufacture had computed it
- Fresh Consumer Gap: fresh grounding required a Handoff Reference before following endpoint Role material; therefore an exact selected-route endpoint Role Pointer could not qualify an intentionally unreferenced Role endpoint even after manufacture carried the correct bytes

## Repair

- Role Endpoint Closure: every Handoff endpoint with `Kind: role` now creates a blocking endpoint Role material requirement even when the Handoff omits a Reference; absence of a Reference cannot silently erase closure requirements
- Exact Parent Rebinding: missing endpoint References may be rebound only from exact endpoint Role bindings on the exact selected qualified received-parent route, using reverse-return symmetry (`new From` against parent `To`, `new To` against parent `From`); Role labels are compatibility checks after exact route selection and never source-selection authority
- Explicit References Preserved: when the authored Handoff provides an explicit Role Reference, package-parent rebinding does not replace it
- Continuation Provenance: `ground --continue` now records exact received `packageParentPath`, physical `packageParentSha256`, and `packageParentFilename`
- Common Handoff Verification: inferred received-parent completion validates the physical package SHA against continuation state before manufacture and fails closed on substitution
- Missing Parent Failure: if the exact received parent is unavailable, ordinary `handoff` stops before return manufacture with actionable restore-the-exact-received-package guidance
- Physical Carrier Continuity: package-v1 Carrier Continuity now optionally serializes and validates `Parent Package SHA256` and `Parent Package Filename`; physical inspection/reload preserves those fields while historical carriers without them remain valid
- Fresh Endpoint Consumption: when an authoritative Handoff has a Role endpoint but no Reference, fresh grounding may consume exactly one Role Pointer bound to that endpoint party on the exact selected route; nearby Role inventory and labels are never used to select the source

## Deterministic Physical Acceptance

- Sequence: physical qualified Anchor-to-Axiom outbound package → ordinary `ground --continue` → authored Axiom-to-Anchor return Handoff with Role labels/kinds and no Role References → common `handoff` with no `--package-parent` → physical return package → fresh Anchor `ground`
- Parent Identity: continuation records the exact outbound package SHA256 and common completion carries the same identity as the return's parent package provenance
- Endpoint Closure: physical return exposes exactly two endpoint Role pointers and the selected `To` pointer carries exact Anchor Role material through bounded package closure
- Fresh Recipient Result: fresh Anchor reaches `grounded-to-act` with holder source `qualified-selected-handoff-consumption` and no `--holder-role`
- Substitution Negative: replacing the continued parent path with a different valid Handoff carrier blocks ordinary completion with `portable.cli.handoff-carrier.received-package-parent.identity-mismatch`
- Missing Negative: removing the exact received parent after continuation blocks ordinary completion with `portable.cli.handoff-carrier.received-package-parent.unavailable`; no partial return is emitted

## Regression Qualification

- Focused Qualification: `node --test test/blank-workspace-role-cache-grounding.test.mjs test/qualification-boundaries.test.mjs` → 30 tests passed, 0 failed
- Full Core Regression: `npm test` → 186 tests passed, 0 failed
- Portable Smoke: `npm run test:portable` → `portable node surface imports`
- Embedded Bootstrap: `npm run test:bootstrap` → `embedded-qualified`
- Embedded Bootstrap Runtime Files: `513`
- Embedded Bootstrap Manifest SHA256: `97739031a8670d678bf36d3cf2ed6259f5eb70cec5409a9ced4399cc57ba4e9e`
- Embedded Bootstrap Representation SHA256: `2761d802dc64251986a7ccdbde7a9bba5a4adcdea034ac02130c811464393304`

## Preservation And Fidelity

- Preservation State: Task `026-1-3` lower-level endpoint Role/material closure remains green; Role/cache participation separation, external Parent closure, carrier numbering/prefix/N+1 consolidation behavior, and artifact-versus-carrier-lineage separation remain covered by the green Core suite
- Fidelity Notes: the positive regression uses physical package bytes and the exact ordinary command surface; the failure-shape Handoff omits Role References exactly as the supplied real specimen does, while exact parent-route pointers/bytes remain the only rebinding source
- Known Losses: none observed in the qualified Task `026-1-4` Core acceptance surface
- No Semantic Widening: no Business/Docs semantic rewrite, provider/chat identity fallback, endpoint-label source selection, nearby-Workspace Role search, or whole-Business Workspace widening was introduced

## Interpretation Limits

- Does Not Prove: package delivery or Role carriage creates participant membership, durable human identity, or authority outside the selected Handoff/Role/Task boundaries
- Must Not Be Used To Claim: a matching Role label or repository proximity may substitute for exact selected-parent material
- Must Not Be Treated As: semantic participant authority, durable holder identity, generic delegation authority, Business mutation authority, remote integration, release approval, or product readiness
- Not Yet Used As: remote integration evidence or product-wide readiness beyond this Core Task
- Authority Limits: Core portable continuation state, common Handoff manufacture, exact package-parent identity/material closure, package-v1 lineage projection, fresh selected-route endpoint Role consumption, and the stated regressions only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-4-common-path-specialist-return-parent-material-continuity.trace.md](../026-1-4-common-path-specialist-return-parent-material-continuity.trace.md)
  - Value: qjxJPMD3UpEQZRd6G04ywxVq2tmmWWK7wMjX4srUa4g

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: RL6NJ1cuySYSDOe1QwhPLWG482Uz8kgJUChtdWbWkig