# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 21:59:50
  - Trace: [022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Origin:
    - [relative](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-15 22:30:22
  - Authors: Loom
  - Why: Record final Core implementation and acceptance evidence for Task 022.
  - Summary: Qualifies generic identifier-only historical Role Parent continuation using exact Anchor/Prism regressions while preserving strict current child validation.
  - Status: ready/local

---

# Identifier-Only Historical Role Parent Authoring Correction Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can ordinary portable Role continuation preserve an exact immutable historical Parent whose own `Current Schema` declares only the `tiinex.party.role.v1` identifier, without inventing an exact historical schema revision, while still validating the newly authored child strictly against the exact current canonical Role contract
- Evidence Role: qualifies Loom's Core correction for Task 022 and records real Anchor/Prism parent identity, identifier-only historical authority, fail-closed boundaries, strict current-child validation and distribution qualification

## Provenance

- Known Source: exact Core Workspace materialized from the qualified `002-1-1-1-1-1-1-1-1` Anchor-to-Loom carrier after Start-qualified Tiinex bootstrap, exact selected route qualification and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md`
- Received Route: `.topics/grounding/handoffs/028-anchor-to-loom-identifier-only-historical-role-parent-authoring.trace.md`
- Semantic Authority: `docs::.topics/grounding/017-identifier-only-historical-role-parent-cutover-semantic-disposit.trace.md`, SHA-256 `c5376f6997496605ff8e83634864101cd9ffec1b82f7b3962739d94199827810`, remained read-only
- Current Role Schema Authority: `docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`, SHA-256 `2887aef16cf827b78fe38c1a2ba97cb5820d79049729d2cf8696ecf1de828871`, remained read-only and governs only the current child candidate
- Exact Anchor Historical Parent: `business::.topics/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.trace.md`, 6041 bytes, SHA-256 `a6696ac191fc5cbcbc642bb3fd6bbf13fa392d1762dc6029603501163b4131bc`
- Exact Prism Historical Parent: `business::.topics/roles/001-8-1-prism-role.trace.md`, 7038 bytes, SHA-256 `2c537057db40e70db642a4d3615285b56eb457eeca09d1f3c612bf23969f8dc9`
- Preservation Basis: Core was the only mutated Workspace; Business and Docs were not mutated; Anchor/Prism historical Role bytes were copied byte-for-byte only as deterministic regression fixtures
- Provenance Limits: this Evidence qualifies host-neutral Core author/reference-authority mechanics only; it does not migrate Business Roles, establish durable holder identity, create participant/process/delegation authority, grant Business mutation permission or declare Anchor acceptance

## Evidence Material

- Material: identifier-only historical schema-reference authority, common-author Parent classification/projection, exact Anchor/Prism fixtures and adversarial authoring regressions
- Material Kind: host-neutral Core implementation and deterministic tests
- Corrected Authority Split: a historical Parent with a plain `Current Schema: tiinex.party.role.v1` now qualifies as `schema-id-only` historical reference authority with `exactRevisionState: unresolved`; current runtime schema material cannot upgrade that weaker history into an exact historical target
- Exact-Target Preservation: historical Parents that actually declare an exact schema target retain the existing exact-target path and are not downgraded to identifier-only authority
- Child Rendering: ordinary continuation from the exact Anchor and Prism Parents renders `Parent Schema: tiinex.party.role.v1` as a plain identifier while preserving exact cross-Workspace Parent Trace/Origin identity
- Same-Revision Boundary: schema-id equality alone does not satisfy exact same-revision authority; identifier-only historical authority therefore withholds/degrades schema-revision-specific Parent-body validation instead of falsely passing current validation
- Current Candidate Boundary: newly authored children remain governed by the exact current amended Role contract and direct canonical `Assignment Modes`; missing or invalid current fields remain blocking
- No Historical Rewrite: exact Anchor and Prism Parent bytes/hashes remain unchanged; current canonical schema bytes are never substituted as historical provenance
- Fail-Closed Historical Inputs: missing Parent schema id, Parent integrity failure, contradictory declared historical target, malformed recovery locator and invalid current candidate remain blocking
- No Special Case: correction is generic reference-authority handling, not keyed to Role name, filename, Holder State prose, repository placement or current schema availability
- Legacy Mapping Boundary: `LEGACY_ROLE_MAPPINGS` remains in place exactly as required by Task 022; this correction neither removes nor expands it
- Focused Qualification: identifier-only acceptance and adjacent author/schema-reference/lineage/qualification regressions passed 54/54 with 0 failures
- Full Core Regression: `npm test` passed 157/157 with 0 failures
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `6820354a8bf6c689172f92b14d00b9bb3ad848417bc39546979a8fe8e2a8c8b3`, representation SHA-256 `79e36e923696c48a864cb941c9d8037aef5f9103d56955b9e3bf66d111670bf2`, 508 runtime files and 5638515 runtime bytes

## Implementation Delta

- Updated: `src/schemas/schema.reference.js` — adds a qualified identifier-only historical schema-reference authority with explicit unresolved exact-revision state and a predicate that cannot be satisfied by an exact target or inferred current schema
- Updated: `src/tooling/portable/adapters/cli/cli.common-author.js` — classifies plain historical Parent `Current Schema` as identifier-only instead of recovering today's canonical runtime target, exposes the historical authority kind in receipts and requires exact targets for same-revision matching
- Updated: `src/schemas/creation.contracts.js` — clarifies that exact continuation requires Parent schema-reference authority at the strength actually known: exact target or qualified historical schema identifier
- Added: `test/fixtures/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.identifier-only.trace.md` — exact 6041-byte Anchor Parent fixture
- Added: `test/fixtures/roles/001-8-1-prism-role.identifier-only.trace.md` — exact 7038-byte Prism Parent fixture
- Added: `test/identifier-only-historical-role-parent-authoring.test.mjs` — real Anchor/Prism continuation plus identifier-only, integrity, target-contradiction and recovery fail-closed regressions

## Adversarial Regression Boundary

- Case 1 — Anchor Identity: exact fixture is 6041 bytes with SHA-256 `a6696ac191fc5cbcbc642bb3fd6bbf13fa392d1762dc6029603501163b4131bc`
- Case 2 — Prism Identity: exact fixture is 7038 bytes with SHA-256 `2c537057db40e70db642a4d3615285b56eb457eeca09d1f3c612bf23969f8dc9`
- Case 3 — Real Historical Shape: both Parents declare plain `Current Schema: tiinex.party.role.v1` and do not provide an exact historical schema target
- Case 4 — Direct Continuation: ordinary current Role authoring qualifies children from both exact Parents without rewriting historical bytes
- Case 5 — Plain Parent Schema: generated child `Parent Schema` stays the plain schema identifier and is not linked to today's canonical target
- Case 6 — Current Material Present: even when exact current Role schema material is available, historical Parent authority remains identifier-only and `exactRevisionState: unresolved`
- Case 7 — Same-Revision Refusal: equal schema ids never become exact same-revision authority without exact target authority
- Case 8 — Integrity: tampered historical Parent bytes fail closed
- Case 9 — Missing Schema Id: historical Parent without declared schema id fails closed
- Case 10 — Contradictory Target: a historical declared target that resolves to another schema identity remains blocking
- Case 11 — Recovery: malformed historical Parent recovery remains blocking
- Case 12 — Current Child: direct canonical Assignment Modes remain required and current candidate validation is not weakened by historical continuation

## Preservation And Fidelity

- Preservation State: exact historical Anchor/Prism Parent identity, bytes, integrity, schema identifier and truthful recovery locators are preserved while exact historical schema revision remains explicitly unresolved
- Known Losses: none identified in the delegated Core surface; identifier-only historical Parents intentionally do not acquire an exact revision or current-revision-specific positive validation they never had
- Fidelity Notes: regression fixtures are byte-for-byte identical to qualified Business Required Context; today’s canonical schema is used only as current child authority and is never substituted into historical Parent provenance
- Parent Fidelity: historical Parent authority is represented at its actual strength—qualified identifier-only—not silently upgraded or downgraded
- Candidate Fidelity: new Role candidates continue through current creation, renderer, stage and Role validation, including direct canonical Assignment Modes enforcement

## Interpretation Limits

- Not Yet Used As: proof that Anchor or Prism Business Roles have been migrated or that `LEGACY_ROLE_MAPPINGS` may be removed
- Must Not Be Treated As: authority to rewrite historical Role bytes, infer historical schema revision from today's schema, weaken current Assignment Modes, mutate Business/Docs, release or publish
- Does Not Prove: durable holder identity, participant relevance, process applicability, delegation authority, implementation-source permission or overall Business/Anchor acceptance
- Must Not Be Used To Claim: that identifier-only historical authority is exact revision authority merely because the schema identifier equals the current schema identifier

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md](../022-identifier-only-historical-role-parent-authoring-correction-mech.trace.md)
  - Value: 3I0XukSWhSHgiF6BEzyDK59l3STRjxSh9nEB95HLTOk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0LXCHaqAuLpnUm-lA0aFDWjow6Ft0mvu_Z_V0KFVtnA