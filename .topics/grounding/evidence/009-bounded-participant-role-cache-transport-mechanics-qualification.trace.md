# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 11:53:14
  - Trace: [009-bounded-participant-role-cache-transport-mechanics.trace.md](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
  - Origin:
    - [relative](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-15 15:53:36
  - Authors: Loom
  - Why: Anchor delegated the exact real-carrier cache-over-expansion defect and required adversarial Core Evidence.
  - Summary: Qualify exact non-endpoint participant Role cache carriage across physical bounded/minimal package roundtrip without semantic promotion.
  - Status: ready/local

---

# Bounded Participant Role Cache Transport Mechanics Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can shared Core carry one explicitly requested non-endpoint Role through a bounded/minimal route cache across physical package-v1 manufacture, roundtrip, orientation and grounding without `cache-over-expansion`, while keeping that Role grounding-only and preserving exact fail-closed cache/material boundaries
- Evidence Role: qualifies Loom's Core implementation and adversarial coverage for Bounded Participant Role Cache Transport Mechanics

## Provenance

- Known Source: exact Core Workspace materialized from the qualified Anchor-to-Loom carrier after Start-qualified Tiinex bootstrap, exact selected route qualification and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/009-bounded-participant-role-cache-transport-mechanics.trace.md`
- Received Route: `.topics/grounding/handoffs/016-anchor-to-loom-bounded-participant-role-cache-transport-mechanics.trace.md`
- Business Acceptance Boundary: `business::.topics/initiatives/001-2-7-5-1-1-blank-workspace-participant-role-cache-transport-qualification.trace.md` remained read-only and supplied the exact real-carrier acceptance shape
- Preservation Basis: Core was the only mutated Workspace; Business and Docs were not mutated; no repository scan, network discovery, connector recovery, remote source write, publication, release or deployment occurred
- Provenance Limits: this Evidence qualifies host-neutral package/cache transport and cold-start grounding mechanics only; it does not establish semantic participation, current-work relevance, delegate selection, process applicability, durable holder identity, implementation-source permission or whole-program orchestration authority

## Evidence Material

- Material: package-v1 participant Role pointer serialization/projection fixes, cold-start participant Role resolution fix and real bounded/minimal carrier regression coverage
- Material Kind: host-neutral Core implementation and deterministic tests
- Real Failure Reproduction: the acceptance fixture adds an explicit non-endpoint `Axiom` participant Role to the selected route while keeping the target Workspace minimal; before the fix physical package-v1 roundtrip failed `portable.handoff-package-v1.cache-over-expansion` for the participant Role requirement
- Root Cause 1 — Visible Requirement Identity: participant Role pointer rendering wrote `Grounding Requirement Id` while the parser contract reads `Participant Requirement Id`; physical Markdown serialization therefore lost the participant requirement identity even though in-memory transport facts had it
- Root Cause 2 — Participant Transport Projection: recipient-v2 participant Role projection omitted the byte-target fields required by cold-start package-v1 grounding (`requirementId`, `archivePath`, `targetArchiveEntry`, `targetBytes`), unlike endpoint Role projection
- Root Cause 3 — Cold-Start Facts Helper: package participant Role resolution called an undefined `recipientV2FactsIndex`; it now uses the established cold-start facts index/cache helper and receives the existing material context
- Transport Fix: participant Role pointers now preserve the parser's exact visible requirement field and project the same route/cache byte-target provenance needed to resolve the requested Role after physical roundtrip
- Grounding-Only Boundary: the exact Axiom Role is present in `packageRoleGrounding` with `groundingOnly:true` and `semanticParticipant:false`; semantic participants remain empty/unresolved and no current-work/delegation relevance is inferred
- Fail-Closed Missing Material: removing the requested Axiom material blocks manufacture with `portable.handoff-material.participant-role.unresolved`; no sibling scan, nearby Role substitution or cache widening occurs
- Fail-Closed Over-Expansion: injecting a genuinely unclaimed cache material still makes package-v1 inspection invalid with `portable.handoff-package-v1.cache-over-expansion`; the fix recognizes only the exact declared participant requirement
- Cache Integrity Boundary: physical cache byte tamper remains invalid/fail-closed under existing ZIP/hash qualification
- Preservation Boundary: endpoint Role grounding, holder authorization, process applicability, source authority, delegation readiness, bounded-vs-complete Workspace state and machine-derived carrier allocation are unchanged
- Focused Qualification: `node --test test/blank-workspace-role-cache-grounding.test.mjs test/bounded-handoff-carrier.test.mjs test/minimal-carrier-material-transport-projection.test.mjs test/qualification-boundaries.test.mjs test/thin-lineage-grounding-projection.test.mjs` passed 49/49
- Full Core Regression: `npm test` passed 139/139 with 0 failures
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `3db472d638d0640071eb5d80612585f008f0281596b2bae8876a79c979cc8a51`, representation SHA-256 `fd13c84c93736700dda70359bce72cec1a03969ed920fcaec8bf90e33eb3d603`, 506 runtime files and 5,599,605 runtime bytes

## Implementation Delta

- Modified: `src/tooling/portable/handoff/recipientV2.endpointRolePointers.js`
- Modified: `src/tooling/portable/handoff/coldStartQualification.grounding.js`
- Modified: `src/tooling/portable/handoff/recipientV2.inspect.projection.js`
- Modified: `test/blank-workspace-role-cache-grounding.test.mjs`

## Adversarial Regression Boundary

- Case 1 — Real Participant Role Roundtrip: bounded/minimal package declares non-endpoint Axiom as one explicit participant Role; manufacture, physical roundtrip, orientation and ground all qualify without cache-over-expansion
- Case 2 — Grounding Only: the carried Axiom Role is visible only as package Role grounding and is explicitly not a semantic participant; participant state remains unresolved
- Case 3 — Missing Requested Role Bytes: removing exact Axiom material blocks manufacture with the exact unresolved participant Role finding rather than widening Workspace/cache scope
- Case 4 — Genuine Cache Over-Expansion: an undeclared cache requirement remains invalid and reports the exact unclaimed requirement identifier
- Case 5 — Cache Tamper: altered physical cache bytes remain invalid/fail-closed under existing integrity qualification
- Case 6 — Nearby Role Exclusion: unrelated nearby Role material is not pulled into the selected route cache merely because it is present in the source Workspace
- Case 7 — Existing Authority Separation: holder authorization can remain qualified while semantic participation, process applicability, implementation-source authority and delegation readiness remain separately unresolved
- Case 8 — Existing Carrier Mechanics: bounded/minimal Workspace handling and machine-derived return allocation remain unchanged and qualified

## Preservation And Fidelity

- Preservation State: delegated Core participant Role cache transport mechanics are implemented and locally qualified; existing cache over-expansion protection, exact material resolution, bounded/minimal Workspace semantics, endpoint Role/holder authorization, participant/process/source/delegation authority separation and machine-derived allocation remain preserved
- Known Losses: none identified in the delegated Core source surface; the change restores transport identity/provenance that physical serialization had previously dropped
- Fidelity Notes: only the exact declared participant Role requirement is admitted through the existing bounded route cache; no cache inventory, Role presence or transport adjacency is promoted into semantic authority
- Workspace Fidelity: the target Workspace may remain bounded/minimal; exact cached Role material does not upgrade it to complete
- Role Fidelity: participant Role carriage supplies exact grounding bytes/provenance only and does not establish semantic participation, current-work relevance, capability relevance or delegation applicability
- Cache Fidelity: cache still rejects undeclared materials and tampered bytes; the fix does not relax over-expansion or integrity checks
- Authority Fidelity: writable Workspace presence, cached Role presence and holder/session binding remain separate from process/source/delegation authority

## Interpretation Limits

- Not Yet Used As: semantic participant selection, delegate/capability selection, process applicability, current-work relevance, implementation-source permission, Business/Docs disposition, release, publication or deployment authority
- Must Not Be Treated As: permission to infer Axiom relevance from cache presence, carry nearby Role inventory, widen a bounded Workspace to a complete repository snapshot, or bypass exact requirement/hash qualification
- Does Not Prove: that any non-endpoint Role is relevant to current work beyond the explicit grounding-only transport request
- Must Not Be Used To Claim: that a qualified participant Role pointer creates participant semantics or that fixing the real carrier transport defect completes Anchor's fresh acceptance on its behalf

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [009-bounded-participant-role-cache-transport-mechanics.trace.md](../009-bounded-participant-role-cache-transport-mechanics.trace.md)
  - Value: tfsG82wvqUr1FTAOq0DC4JuCX3gNadpGE_DCZkL-54k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oL47uEEehvCGZ31k_iIokeixs7AxPbEYo5dBqx96P2Q