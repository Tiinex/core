# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 08:06:35
  - Trace: [002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md](../002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md)
  - Origin:
    - [relative](../002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-12 08:36:59
  - Authors: Loom
  - Why: Anchor delegated Core-owned enforcement of the accepted Axiom per-field exact schema-reference authority rule and required evidence for all six acceptance properties.
  - Summary: Qualify prospective exact per-field schema-reference enforcement, historical warning preservation, resolved contradiction blocking, host-neutral findings, and full Core validation.
  - Status: ready/local

---

# Core Major 007 Per-Field Schema Reference Authority Enforcement Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can Core enforce the accepted Axiom rule independently for each Envelope Schema, Parent Schema, and Current Schema field so qualified immutable exact authority is mandatory for new candidates, unavailable authority remains truthfully plain-id, historical bytes remain preserved with warning-level debt, and positively resolved material contradictions remain blocking
- Evidence Role: qualifies the bounded Core Major 007 shared authoring, validation, audit/editor, manufacture-preflight, regression, portable, and bootstrap implementation delegated by Anchor to Loom

## Provenance

- Known Source: exact Core Workspace materialized from the received qualified Core Major 007 Handoff carrier through Tiinex after Start-qualified bootstrap and explicit Loom holder-role qualification, with the accepted Docs Major 004 disposition projected through the grounded Required Context route
- Preservation Basis: exact carried Core source bytes, existing Core Major 004 schema-reference authority mechanics, accepted Docs Major 004 per-field disposition, deterministic local regressions, full Core validation, and Tiinex-authored continuity artifacts
- Provenance Limits: no Docs canonical byte mutation, no host-specific UI implementation, no historical artifact rewrite, no fabricated immutable target, no Business mutation, no remote fetch, push, publication, release, deployment, or other remote mutation was performed
- Semantic Authority Boundary: exact schema-reference authority is representation-specific and field-specific; schema-id equality, repository presence, an older permalink, lifecycle publication state, or an adjacent stronger field do not establish exact authority for another field

## Evidence Material

- Material: patched Core source/test bytes plus deterministic creation-validation, candidate-audit, historical-audit, editor projection, resolved-contradiction, manufacture-preflight, and bootstrap qualification receipts produced from the qualified carried Workspace
- Material Kind: host-neutral per-field schema-reference authority mechanics, common creation validation/rendering, shared audit/editor findings, Handoff manufacture preflight, focused acceptance regressions, and portable/bootstrap validation
- Per-Field Exact Authority: `src/schemas/schema.reference.js` now exposes `qualifiedExactSchemaReferenceTarget` and renders a Markdown Link only when the preferred locator belongs to the field's qualified exact-target set; `qualifySchemaReferenceValue` can require that exact locator prospectively without changing historical parsing
- Creation Enforcement: `src/schemas/creation.schemaReferences.js` and `src/schemas/creation.contracts.js` require exact link form for new candidates whenever exact authority for that exact field is qualified; explicit stale or material-mismatched authority is downgraded and its locator is not emitted
- Candidate Versus Historical Context: `src/validation/validateArtifact.js` applies one shared per-field policy with context-specific severity: new candidate omission of a qualified exact target is blocking `schema.reference.exact-target-omitted`, while an existing artifact with the same avoidable weak reference receives warning-level `historical-reference-debt` and remains byte-preserved
- Truthful Plain Current Evidence: the registered `tiinex.evidence.v1` Current Schema authority remains unavailable for an immutable exact target, so new Evidence rendering stays plain `tiinex.evidence.v1` and shared audit/editor emit no exact-target omission finding solely because Envelope Schema is linked
- Qualified Exact Current Evidence: a supplied explicit Evidence authority is accepted only when resolution Evidence matches the exact semantic material identity; matching authority renders the exact Current Schema link, while stale/mismatched authority is cleared to unresolved and renders no false link
- Resolved Identity Contradiction: shared validation distinguishes an unresolved historical locator from a target positively qualified as another registered schema; the latter yields blocking `schema.reference.material-identity-contradiction` even in historical audit
- Host-Neutral Finding Ownership: `src/tooling/portable/editor/editor.assistance.js` no longer recreates mixed-link/canonical-target policy; editor assistance projects the same shared Core finding code/severity and deterministic field location from audit, while retaining a no-source-mutation boundary
- Candidate Staging: `src/tooling/portable/draft/draft.operations.js` invokes shared audit with `schemaReferenceContext: candidate`, so prospective draft validation blocks avoidable exact-target omission before acceptance rather than degrading it as historical debt
- Manufacture Preflight: `src/tooling/portable/handoff/schemaReferencePreflight.js` gates only the actively selected local Handoff candidate with candidate semantics; historical carried Workspace artifacts remain preservation inputs and are not reclassified as newly authored candidates by package carriage
- Manufacture Integration: Node Handoff preparation and portable manufacture receipts carry the schema-reference preflight and block package output when the active Handoff candidate has prospective schema-reference errors
- Acceptance Property 1: focused regression proves qualified Root authority renders the exact Root link and forcing bare Root causes both creation-result rejection and candidate draft validation error
- Acceptance Property 2: focused regression proves Current Evidence remains plain with no warning/error when no qualified immutable exact Current target exists
- Acceptance Property 3: focused regression proves exact matching Evidence authority renders its exact Current link while stale/mismatched authority is refused and not emitted
- Acceptance Property 4: focused regression proves a Site-like historical bare Root artifact is unchanged byte-for-byte while shared audit/editor expose the same warning-level exact-target debt
- Acceptance Property 5: focused regression proves a Task Current field pointing at the positively qualified Root target is a blocking resolved material-identity contradiction in historical audit
- Acceptance Property 6: focused regression proves editor presentation preserves the shared Core finding code/severity instead of defining host-local schema-reference policy; manufacture preflight consumes the same prospective Core semantics
- Focused Regression Result: `node --test test/schema-reference-authority.test.mjs test/lineage-safety-hardening.test.mjs` passed 16/16
- Full Core Regression: `npm test` passed 98/98
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified` with manifest SHA-256 `415d80b88efe40154eb18bde476b9ddd49d233d2391d6c3dfad34951cfd98297`, representation SHA-256 `8009fe8e1faab0acf06b90985a1fe122637f27a0231e6792a1ce679ed164b215`, 495 runtime files, and 5,422,742 runtime bytes
- Full Validation Result: `npm run validate` passed after the final per-field exact-reference and resolved-material-identity contradiction changes

## Preservation And Fidelity

- Preservation State: historical artifacts are not rewritten by shared audit/editor or manufacture carriage; only active new candidates are subject to the prospective exact-reference gate
- Fidelity Notes: exact authority is evaluated independently for Envelope, Parent, and Current fields; qualified exact target omission is prospective error or historical warning according to lifecycle context, while unavailable exact authority preserves truthful plain-id representation and positive wrong-material resolution stays blocking
- Existing Authority Preserved: Core Major 004's separation between lifecycle publication state and exact schema-reference authority remains intact; Major 007 strengthens field-level enforcement without treating mixed shapes as a validity class
- Known Losses: none in the bounded Core source surface; no canonical Docs bytes, historical artifact bytes, host UI bytes, or remote state were modified

## Interpretation Limits

- Does Not Prove: that every historical plain schema id is defective, that every repository locator is immutable exact authority, that lifecycle publication implies reference authority, that adjacent linked fields authorize another field, or that hosts may invent their own severity/policy
- Not Yet Used As: authority for Docs canonical wording changes, Site/App/VS Code host UI mutation, historical rewrite, automatic publication, release, deployment, or remote repository action
- Does Prove: Core now applies the accepted exact per-field authority rule prospectively in creation/staging/manufacture, diagnostically without rewrite for historical bytes, truthfully plain when exact authority is absent, and blockingly when a locator resolves to contradictory registered schema material
- Must Not Be Treated As: permission to fabricate exact targets, normalize historical bytes in place, infer immutable authority from schema-id equality or repository presence, or collapse representation authority into publication lifecycle state
- Authority Limits: Core host-neutral authoring, schema-reference qualification, shared audit/editor findings, candidate validation/manufacture preflight, exact local regressions, and portable/bootstrap qualification only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md](../002-1-1-core-major-007-per-field-schema-reference-authority-enforcement.trace.md)
  - Value: Fhgix461yciWBfK4v8JJjHnHcMpdxZ_WXknN9YGyOJs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xrp1ktHYvNuzXNl1l-pbivQ5jhuuq4mOeplAFz6Q5FY