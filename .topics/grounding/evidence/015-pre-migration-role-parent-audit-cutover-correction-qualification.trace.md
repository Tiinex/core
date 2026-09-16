# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 20:52:45
  - Trace: [021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Origin:
    - [relative](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-15 21:12:02
  - Authors: Loom
  - Why: Record final Core implementation and acceptance evidence for Task 021.
  - Summary: Qualifies exact historical Axiom Role parent continuation while preserving strict current Assignment Modes validation.
  - Status: ready/local

---

# Pre-Migration Role Parent Audit Cutover Correction Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can ordinary portable Role authoring preserve and qualify the exact historical pre-migration Axiom Role parent while validating only the newly authored continuation against the current amended `tiinex.party.role.v1` contract, without rewriting historical bytes, weakening current Assignment Modes requirements, or introducing Role-specific identity exceptions
- Evidence Role: qualifies Loom's Core correction for Task 021 and records the exact real-parent reproduction, generic historical-parent audit boundary, strict current-candidate validation and distribution qualification

## Provenance

- Known Source: exact Core Workspace materialized from the qualified `002-1-1-1-1-1-1` Anchor-to-Loom carrier after Start-qualified Tiinex bootstrap, exact selected route qualification and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md`
- Received Route: `.topics/grounding/handoffs/026-anchor-to-loom-pre-migration-role-parent-audit-cutover-correction.trace.md`
- Exact Regression Parent: `business::.topics/roles/001-2-axiom-role.trace.md`, 4803 bytes, SHA-256 `f17e74db07c6a2d1288119c330a20b3b19cd0eb01f6a2c9f207d21102d9488d5`, supplied as exact qualified Required Context; its body has no `Assignment Modes`
- Semantic Authority: `docs::.topics/grounding/015-canonical-holder-assignment-mode-hard-cutover-semantic-dispositi.trace.md`, SHA-256 `90de2042ce599d6cf1640669912a5c8b440c84c1a77cc28d18f03a78cd403c42`, remained read-only
- Current Role Schema Authority: `docs::.topics/.schemas/party/role/tiinex.party.role.v1.schema.md`, SHA-256 `2887aef16cf827b78fe38c1a2ba97cb5820d79049729d2cf8696ecf1de828871`, remained read-only and continues to govern new current candidates
- Business Boundary: `business::.topics/initiatives/001-2-7-5-1-2-1-1-pre-migration-role-parent-audit-cutover-correction.trace.md`, SHA-256 `7075c530d18ba7332d5cb2516b670a2976c2467c2991f464500b5a2201d48355`, remained read-only and supplied organizational scope/acceptance authority
- Preservation Basis: Core was the only mutated Workspace; Business and Docs were not mutated; the historical Axiom Role was copied byte-for-byte only as a deterministic test fixture and never rewritten as an operational Role
- Provenance Limits: this Evidence qualifies host-neutral Core authoring/audit mechanics only; it does not migrate Business Roles, establish current holder identity, create participant/process/delegation authority, grant source mutation permission or declare Anchor/Business acceptance

## Evidence Material

- Material: common-author historical Parent audit separation, shared audit explicit validation-authority plumbing, exact real Axiom parent fixture and deterministic regression coverage
- Material Kind: host-neutral Core implementation and deterministic tests
- Exact Failure Reproduction: before the correction, a current candidate with valid direct `Assignment Modes` staged without errors but overall `author` blocked because the historical Axiom parent was audited with the current Role machine contract and companion validator, producing both `portable.contract.ordinary.field.required.missing` and `party.role.assignmentModes.missing`
- Corrected Audit Boundary: common `author` now audits the current candidate and historical Parent separately. Parent Root readability, exact declared schema-reference checks and c14n-v2 integrity always run. Current schema-specific machine/companion validation is applied to the Parent only when Parent and current creation contract share exact qualified same-revision schema-reference authority
- Fail-Visible Historical State: when same-revision current authority is not qualified, Parent schema-specific validation is explicitly withheld through an `unavailable` historical-parent schema-validation authority, yielding degraded/warning state rather than silently claiming current validation or producing false current-field errors
- Current Candidate Boundary: stage and candidate audit continue to use the current amended Role contract; direct `Assignment Modes` remains required and invalid/missing canonical values remain blocking
- No Parent Rewrite: the exact pre-migration Axiom Parent remains 4803 bytes with SHA-256 `f17e74db07c6a2d1288119c330a20b3b19cd0eb01f6a2c9f207d21102d9488d5`; the ordinary continuation preserves its cross-Workspace Parent locator and historical schema-reference provenance
- No Audit Bypass: tampering the historical Parent bytes still fails closed at exact Parent integrity before authoring; historical mode does not suppress Root, schema-reference or integrity checks
- No Role Special Case: the correction is keyed to Parent/candidate validation authority and exact schema revision, not Role label, filename, Axiom identity, Holder State prose or Assignment Modes content
- Legacy Mapping Boundary: `LEGACY_ROLE_MAPPINGS` remains unchanged as required by Task 021; this correction neither removes nor expands it
- Focused Qualification: `node --test test/canonical-role-authoring-cutover.test.mjs` passed 6/6 with the exact real Axiom-parent continuation and tamper regression
- Adjacent Qualification: canonical Role cutover plus lineage/schema-reference/qualification regressions passed 40/40 with 0 failures
- Full Core Regression: `npm test` passed 149/149 with 0 failures
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `87cb940036984d30e439fe0b437e98ccf10a7e51da017ca7ff23cd24188ae00b`, representation SHA-256 `749bd73b620f773d4aba8c2de341bde364e4a17e9b573c880efad4e7975aa842`, 508 runtime files and 5633586 runtime bytes

## Implementation Delta

- Updated: `src/tooling/portable/adapters/cli/cli.common-author.js` — separates current-candidate audit from historical-Parent audit, preserves exact Parent schema-reference authority, and permits current schema-specific Parent validation only with exact same-revision authority
- Updated: `src/tooling/portable/audit/audit.capability.js` — accepts explicit per-audit schema-validation authority, schema-reference authority and validation-contract context while preserving default behavior for all existing consumers
- Added: `test/fixtures/roles/001-2-axiom-role.pre-migration.trace.md` — exact 4803-byte qualified Business Axiom Role body used in the failed real migration attempt
- Updated: `test/canonical-role-authoring-cutover.test.mjs` — exact cross-Workspace Axiom parent continuation success, byte/hash identity assertion, tamper fail-closed regression and existing missing/invalid current Assignment Modes cases

## Adversarial Regression Boundary

- Case 1 — Real Parent Identity: fixture byte length is exactly 4803 and SHA-256 is exactly `f17e74db07c6a2d1288119c330a20b3b19cd0eb01f6a2c9f207d21102d9488d5`
- Case 2 — Real Pre-Migration Shape: exact historical Axiom parent contains no direct `Assignment Modes`
- Case 3 — Cross-Workspace Continuation: ordinary `author --schema tiinex.party.role.v1` with `--parent business::.topics/roles/001-2-axiom-role.trace.md` and exact `--parent-source` qualifies a current continuation
- Case 4 — Historical Locator Preservation: generated continuation preserves the exact cross-Workspace Parent reference and historical Parent schema-reference provenance
- Case 5 — Current Contract Strictness: current candidate with direct canonical `explicit-session, handoff` qualifies
- Case 6 — Missing Modes: current candidate without Assignment Modes remains blocked and no invalid durable artifact is retained
- Case 7 — Invalid Modes: current candidate with unknown/noncanonical mode remains blocked and no invalid durable artifact is retained
- Case 8 — Parent Integrity: tampered historical Parent bytes fail closed before durable authoring
- Case 9 — Historical Validation Visibility: absent exact same-revision current authority produces degraded/warning schema-validation state rather than false positive current validation
- Case 10 — Generic Boundary: no Axiom label/path special case, prose interpretation, blanket audit suppression, schema bypass, second Role format or dual current authority is introduced

## Preservation And Fidelity

- Preservation State: exact historical Role Parent bytes/provenance are preserved while current candidate validation remains governed by the amended current Role contract
- Known Losses: none identified in the delegated Core surface; historical Parents without qualified same-revision current schema authority intentionally do not receive current schema-specific body validation and instead expose that limitation fail-visible
- Fidelity Notes: the regression fixture is byte-for-byte identical to the qualified Business Required Context Axiom Role; Parent Root/schema-reference/integrity validation remains active, while only unqualified current-revision-specific body validation is withheld
- Parent Fidelity: historical Axiom Parent identity, bytes, self-integrity, declared schema reference and cross-Workspace locator are preserved exactly; no in-place migration or reinterpretation occurs
- Candidate Fidelity: all newly authored Role candidates still pass through current renderer/stage/current Role machine and companion validation, including direct canonical Assignment Modes enforcement

## Interpretation Limits

- Not Yet Used As: proof that all active Business Roles have migrated to the amended current Role schema or that `LEGACY_ROLE_MAPPINGS` may be removed
- Must Not Be Treated As: authority to rewrite historical Role artifacts, validate historical bytes as if they were current candidates without same-revision authority, weaken direct current Assignment Modes, mutate Business/Docs, release or publish
- Does Not Prove: durable holder identity, participant relevance, process applicability, delegation authority, implementation-source permission or overall Business/Anchor acceptance
- Must Not Be Used To Claim: that a historical Role lacking direct Assignment Modes is itself a valid new current Role candidate merely because its preserved Parent bytes remain qualified as history

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md](../021-pre-migration-role-parent-audit-cutover-correction-mechanics.trace.md)
  - Value: Oy7kXsMJ4Y2pSZJA2M4T0vufgpRDY562sGeNQHyEaII

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: AQT92Bkvsqrqxzk0jlal7kv-YRmVdWfVT9EmYBqk7Xs