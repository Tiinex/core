# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-18 19:28:38
  - Trace: [027-compiled-schema-lineage-source-authority-coherence.trace.md](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Origin:
    - [relative](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-18 19:44:33
  - Authors: Loom
  - Why: Task 027 requires qualification Evidence that exact compiled inheritance source authority is checked at the correct mechanical boundary without historical rewrite or validation weakening.
  - Summary: Qualify the Core repair that separates structural schema material from exact compiled inheritance source authority and preserves fail-closed behavior for the six carried contradictions.
  - Status: ready/local

---

# Compiled Schema Lineage Source-Authority Qualification

## Supported Claim Or Question

- Supported Claim Or Question: does Core now qualify exact runtime validation inheritance only when compiled Parent source authority is coherent with the exact source declared by each child schema, while preserving structural schema tooling and failing closed when exact historical source authority is unavailable
- Evidence Role: implementation and regression qualification for Core Task `027-compiled-schema-lineage-source-authority-coherence.trace.md`

## Provenance

- Known Source: the Tiinex-qualified Major 004 Core Workspace materialized from the inbound Anchor-to-Loom handoff carrier for Task `027`
- Preservation Basis: bounded Core source changes plus deterministic local Core tests, portable smoke, embedded-bootstrap qualification, and exact registered runtime-schema authority inspection
- Provenance Limits: no Business or Docs historical artifact mutation, no historical Parent bytes imported into Core, no claim that a current or newer schema representation is byte-equivalent or semantically interchangeable with a child-declared historical Parent revision
- Semantic Authority Boundary: this Evidence qualifies Core Tooling/runtime source-authority mechanics only; it does not revise Docs schema semantics or authorize historical-source substitution

## Evidence Material

- Material: Core schema-lineage source-authority qualification implementation, registered runtime projection inventory, and deterministic qualification regressions
- Material Kind: bounded Core source delta plus deterministic local runtime-schema authority validation
- Mechanical Defect: bundled schema-source qualification previously accepted a compiled validation contract when leaf source/binding identity and schema-id lineage were valid, but it did not independently qualify whether every compiled inherited Parent source tuple matched the exact Parent source authority declared by the child schema
- Repair Boundary: `src/schemas/schema.lineageAuthority.js` now qualifies compiled inheritance source authority separately from leaf structural source qualification; `src/schemas/schema.source.js` exposes that result as `validationLineageAuthority`; `src/tooling/portable/schema/qualifiedLocalRoot.runtime.js` refuses to project exact runtime validation when that inheritance authority is not qualified
- Exact Source Rule: every ordinary inheritance edge requires one complete declared Parent source tuple of repository, 40-hex commit, and path that exactly equals the compiled Parent source tuple; the existing explicitly qualified local-unpublished Parent supersession remains a distinct accepted boundary
- Truthful Unresolved Rule: missing, incomplete, or ambiguous Parent source authority remains unresolved; a compiled tuple that differs from the exact declared tuple is contradictory; neither state is promoted to exact runtime validation authority
- Structural Tooling Separation: the bundled leaf schema source may remain structurally `qualified` for authoring and inspection even when `validationLineageAuthority` is contradictory, so unrelated structural Role/Evidence tooling is not disabled merely because exact inherited runtime validation authority is unavailable
- Registered Runtime Inventory: deterministic registry qualification preserves exactly six contradictory projections and no additional registered contradiction: `tiinex.party.organization.v1`, `tiinex.party.role.v1`, `tiinex.evidence.v1`, `tiinex.feedback.v1`, `tiinex.workspace.representation.v1`, and `tiinex.discovery.finding.v1`
- Organization Regression: `tiinex.party.organization.v1` retains its child-declared `tiinex.party.v1` source at `Tiinex/docs@2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md`; the carried compiled Parent source at `3988951208eb9a8926e84ab42625d4b42fa00c2d` is classified as `compiled-parent-source-substitution` and exact validation remains unavailable
- Additional Chain Regression: `tiinex.evidence.v1` is independently checked through the same qualification path and remains fail-closed because its compiled preservation Parent source differs from its declared Parent source authority
- Positive Qualification Regression: a synthetic inheritance chain with one exact declared Parent source tuple matching the compiled Parent source qualifies with complete source authority
- Negative Substitution Regression: a synthetic chain with the same Parent schema identity and path but a different commit is contradictory and is rejected as `compiled-parent-source-substitution`
- Focused Tests: `test/schema-lineage-source-authority.test.mjs` contains the six-item inventory assertion, organization plus Evidence fail-closed regression, exact-match positive case, and commit-substitution negative case; all four pass
- Existing Authoring/Audit Regressions: `test/schema-reference-authority.test.mjs`, `test/canonical-role-authoring-cutover.test.mjs`, and `test/qualification-boundaries.test.mjs` pass with 33 tests and zero failures, preserving structural historical Role/Evidence behavior
- Full Core Regression: `npm test` passes 184 tests with zero failures
- Portable Smoke: `npm run test:portable` passes and reports `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` passes with status `embedded-qualified`, 513 runtime files, and no persistent verification requirement
- Historical Material Availability: the carried Core package does not provide exact qualified historical Parent material for the six registered contradictions; therefore this repair does not relabel current material as historical authority and those six exact runtime validation chains remain truthfully fail-closed until exact source material is qualified or a semantic owner changes the declaration

## Preservation And Fidelity

- Preservation State: Business and Docs historical artifacts remain byte-untouched; only bounded Core implementation, tests, and this qualification Evidence are newly authored
- Fidelity Notes: the exact six mismatch inventory from the inbound reproduction Evidence remains mechanically observable, but it is now detected at the schema-source qualification boundary before exact runtime validation projection rather than only later during per-record validation authority checking
- Known Losses: none introduced by the repair; unavailable historical Parent bytes remain unavailable and are represented as unresolved or contradictory authority rather than inferred from schema id, path adjacency, current registry material, or newer commit chronology

## Interpretation Limits

- Does Not Prove: that any historical Business artifact is invalid, that the six child schemas should change their Parent locators, that later Docs commits supersede declared historical revisions, or that current carried bytes are exact historical authority
- Not Yet Used As: authority to rewrite Business or Docs history, suppress source-authority diagnostics, or weaken exact source checks
- Must Not Be Treated As: proof that same schema id, same path, byte similarity, repository adjacency, or a newer commit permits source substitution
- Authority Limits: bounded Core schema runtime projection, source qualification, and exact validation-authority mechanics for Task `027` only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-compiled-schema-lineage-source-authority-coherence.trace.md](../027-compiled-schema-lineage-source-authority-coherence.trace.md)
  - Value: xlXmVgz2680XcmIIem56VGQwUuTgFSZZMCvmQEJ4zGQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: KkYFbFZp8UT-uyjcFz0QQ5B422rG7JUWUbWoOBk2Thw