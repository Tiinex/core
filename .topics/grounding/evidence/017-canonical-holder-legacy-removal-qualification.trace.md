# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-15 22:43:26
  - Trace: [023-canonical-holder-legacy-removal-mechanics.trace.md](../023-canonical-holder-legacy-removal-mechanics.trace.md)
  - Origin:
    - [relative](../023-canonical-holder-legacy-removal-mechanics.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-16 10:59:19
  - Authors: Loom
  - Why: Record final Core implementation and acceptance evidence for Task 023.
  - Summary: Qualifies canonical-only holder authorization after full removal of temporary legacy-positive runtime support.
  - Status: ready/local

---

# Canonical Holder Legacy Removal Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can Core complete the canonical holder hard cutover so current holder-assignment authorization derives only from direct canonical `Assignment Modes` on exact qualified current Role material, while immutable pre-cutover Roles remain non-authoritative historical evidence
- Evidence Role: qualifies Loom's Core implementation for Task 023 and records the exact active Role migration gate, full legacy-positive runtime removal, canonical-only regressions, negative historical regressions and distribution qualification

## Provenance

- Known Source: exact Core Workspace materialized from the qualified `002-1-1-1-1-1-1-1-1-1-1` Anchor-to-Loom carrier after Start-qualified Tiinex bootstrap, exact selected route qualification and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/023-canonical-holder-legacy-removal-mechanics.trace.md`
- Received Route: `.topics/grounding/handoffs/031-anchor-to-loom-canonical-holder-legacy-removal.trace.md`
- Business Cleanup Task: `business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-2-canonical-holder-legacy-removal-and-cutover-completion.trace.md`, SHA-256 `f1a9f1174861f01b3c2f31f12aa89de6a05e29024905ccddc50df6099751e9d8`, remained read-only
- Business Migration Disposition: `business::.topics/initiatives/001-2-7-5-1-2-1-1-1-1-1-canonical-holder-active-role-migration-disposition.trace.md`, SHA-256 `ccda75ec7a728fac0097f994a2c6155bc6033d28be1a612462398e9adca392bb`, remained read-only and is the exact active-set/legacy-removal gate
- Preservation Basis: Core was the only mutated Workspace; Business and Docs were not mutated; historical Role identities are used only as deterministic negative regression evidence
- Provenance Limits: this Evidence qualifies host-neutral Core holder-assignment authorization mechanics only; it does not mutate Business Roles, establish durable holder identity, create participant/process/delegation authority, grant release/publication authority or declare Anchor/Sigma acceptance

## Evidence Material

- Material: canonical-only holder assignment-mode projection, exact Business-declared active Role identity matrix, negative historical compatibility matrix and focused/full/distribution tests
- Material Kind: host-neutral Core implementation and deterministic regressions
- Runtime Cutover: `LEGACY_ROLE_MAPPINGS`, exact-role compatibility lookup, Axiom legacy-mapping Decision provenance and equivalent positive legacy normalization are removed from active runtime behavior
- Canonical Positive Authority: only direct structured `Assignment Modes` on exact qualified current Role material can produce positive holder-assignment mode authority
- Missing Canonical Modes: qualified Role material without direct `Assignment Modes` now returns `holder-assignment-mode-authority-missing`; historical path/SHA/prose similarity cannot substitute
- Holder State Boundary: `Holder State` remains diagnostic/human-readable only and is never parsed, matched or fuzzily normalized to authorize
- Current Material Boundary: unqualified Role state or unqualified Role material remains blocking even when canonical-looking modes are supplied in the projection fixture
- Historical Preservation: pre-cutover Role artifacts remain untouched audit evidence; removal changes runtime acceptance only
- No Compatibility Replacement: no Role-name, path, provider, model, chat, executor or prose-specific positive branch replaces the deleted mapping registry

## Active Canonical Role Gate

- Anchor: `.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md`; SHA-256 `8302ced51dca642e4f2cc38e76344e0bc5583b988d17d472176d812813f917f3`; canonical modes regression `explicit-session, handoff`
- Axiom: `.topics/roles/001-2-1-axiom-canonical-holder-cutover-role.trace.md`; SHA-256 `97d00ef1b7263f47703ae2875aba4f58c2f236b32b3fc508d2f4528eefbb0d01`; canonical modes regression `explicit-session, handoff`
- Loom: `.topics/roles/001-3-1-loom-canonical-holder-cutover-role.trace.md`; SHA-256 `b6206c9d450c13f2eac24895567255f0afadbd9dc71685b29c668201c78c88ad`; canonical modes regression `explicit-session, explicit-role-invocation, handoff`
- Sigma: `.topics/roles/001-4-1-sigma-canonical-holder-cutover-role.trace.md`; SHA-256 `0f5944dc3f0c4c21ea6f29318da92171dad5343b45b18a7a6b5dac59f386cebf`; canonical modes regression `explicit-participation`
- Glimmer: `.topics/roles/001-5-1-glimmer-canonical-holder-cutover-role.trace.md`; SHA-256 `f08a155596381ba8a8d4b7f3dda84a67f53f82c7b777ce8a0dd1312fd8035724`; canonical modes regression `explicit-user-session, handoff`
- Kodax: `.topics/roles/001-6-1-kodax-canonical-holder-cutover-role.trace.md`; SHA-256 `1983edfcc64f136eee8ed3f40fac163b5fb4ecb57edba5068883f77f10db268e`; canonical modes regression `explicit-session, explicit-role-invocation, handoff`
- Pilot: `.topics/roles/001-7-1-pilot-canonical-holder-cutover-role.trace.md`; SHA-256 `b6ff95c6edc9669ea8c41170a14847b9733bd83c1008d72a23484a2b8a89dd8f`; canonical modes regression `explicit-session, explicit-role-invocation, handoff`
- Prism: `.topics/roles/001-8-1-1-prism-canonical-holder-cutover-role.trace.md`; SHA-256 `590880b05ee3915e8499ed0fbd7e7b7aaf3ab658c14ca98abfac73bf060767ae`; canonical modes regression `explicit-session, explicit-role-invocation, handoff`
- Gate Basis: exact identities/digests above are copied from the qualified accepted Business migration disposition; the regression matrix exercises direct canonical modes only and does not create Role-specific production branches

## Implementation Delta

- Updated: `src/tooling/portable/grounding/grounding.holderAssignmentModes.js` — removes `LEGACY_ROLE_MAPPINGS`, Axiom legacy-mapping Decision constant, exact legacy lookup/path normalization and all positive legacy authorization; missing direct canonical modes now fail closed
- Updated: `test/thin-lineage-grounding-projection.test.mjs` — replaces legacy-positive assertions with exact eight-Role canonical matrix, negative historical-role matrix including obsolete Playthings compatibility identity, missing/unqualified current material checks and retained prose/fuzzy negative boundaries
- Unchanged Semantic Contract: canonical assignment tokens remain schema-owned; Core does not add a new assignment mode or reinterpret `Holder State`

## Adversarial Regression Boundary

- Case 1 — Exact Active Set: all eight Business-declared canonical active Role paths and SHA-256 identities are bound into the canonical-only regression matrix
- Case 2 — Canonical Modes Only: each active fixture qualifies only through its direct structured canonical modes
- Case 3 — Kodax/Pilot Invocation: `explicit-role-invocation` remains qualified for canonical Kodax and Pilot
- Case 4 — Sigma Isolation: canonical Sigma rejects `explicit-session` and qualifies `explicit-participation`
- Case 5 — Glimmer Isolation: canonical Glimmer rejects `explicit-session` and qualifies `explicit-user-session`
- Case 6 — Missing Modes: exact qualified Role material without direct modes fails closed with `holder-assignment-mode-authority-missing`
- Case 7 — Unqualified Material: Role/material qualification failure blocks positive holder authority
- Case 8 — Historical Active Roles: old Anchor, Axiom, Loom, Sigma, Glimmer, Kodax, Pilot and Prism Role identities no longer authorize without direct modes
- Case 9 — Obsolete Registry Entry: old Playthings compatibility identity no longer authorizes
- Case 10 — Prose/Fuzzy Inputs: exact words, punctuation variants, substrings and familiar Holder State prose cannot authorize without direct modes
- Case 11 — Live Route: the received canonical Loom Role still reaches `grounded-to-act` with source `qualified-recipient-role-structured-modes` after legacy removal
- Case 12 — No Legacy Symbols: repository-wide search across `src` and tests finds no `LEGACY_ROLE_MAPPINGS`, `findExactLegacyMapping` or `axiom-exact-qualified-legacy-role-mapping`
- Focused Qualification: holder/cutover/authoring focused suite passed 42/42 before final negative-matrix hardening; final holder projection suite passed 28/28 after adding obsolete Playthings negative coverage
- Full Core Regression: `npm test` passed 158/158 with 0 failures
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `96eeec65d1c7c7a5671f9b4833a0091cebd05edb79d32c7924f9ec42238c42d0`, representation SHA-256 `1658cb7ab170ce63f67101d9090f04ccab3f2d3e440a6765bc5c35d04ed3a7c6`, 508 runtime files and 5633969 runtime bytes

## Preservation And Fidelity

- Preservation State: historical Role artifacts and their provenance remain unchanged; only current runtime authorization fallback was removed
- Known Losses: intentional loss of temporary legacy-positive compatibility authorization; this is the delegated hard-cutover outcome, not evidence loss
- Fidelity Notes: active canonical Role identities/digests are copied from the exact qualified Business migration disposition; current positive authorization is represented only by direct schema-owned `Assignment Modes`
- Parent Fidelity: Task `023` remains the direct controlling Parent for this qualification Evidence

## Interpretation Limits

- Does Not Prove: end-to-end specialist delegation acceptance, durable holder identity, semantic participant relevance, process applicability, source authority, publication or human product acceptance
- Must Not Be Used To Claim: that historical Role bytes were rewritten, that old carriers become current-compatible, or that a new holder semantic mode was created
- Authority Limit: exact Core holder hard-cutover mechanics delegated by Task `023` under the accepted Business migration disposition
- Must Not Be Treated As: permission to reintroduce compatibility mappings, parse Holder State prose, add Role/path/provider special cases, mutate Business/Docs or widen unrelated Tooling behavior
- Not Yet Used As: Anchor reconciliation, Full Recovery, fresh representative holder re-grounding, specialist delegation acceptance, release or publication proof

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-canonical-holder-legacy-removal-mechanics.trace.md](../023-canonical-holder-legacy-removal-mechanics.trace.md)
  - Value: CwaNvK8RitWUUPgjgjNZXv2FtjdkrncitheKjFNOJlI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7WTYqa9MU5Y7rTBzfVLgh2N1vzIZMAE60oDgd425DaU