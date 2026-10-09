# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 09:16:11
  - Authors: Anchor
  - Why: Preserve pre-launch v1 semantics and automated verification before one Sigma Windows acceptance.
  - Summary: 514 passing Core tests and exact two-material creation, validation and local-source help without data loss.
  - Status: ready/local

---

# Core Evidence-v1 Real Multi-Material Roundtrip And Source Qualification

## Supported Claim Or Question

- Supported Claim Or Question: Does Core materialize, integrity-seal, validate, and read back two separate qualified Evidence-v1 material entries while failing closed on invalid or silently dropped inputs?
- Evidence Role: executable validation and negative-regression result for the locally qualified Evidence-v1 creation contract.

## Provenance

- Known Source: Core renderer `src/schemas/creation.renderer.js`, field-help projection `src/tooling/portable/schema/form.fieldHelp.js`, and targeted `test/evidence-repeatable-material-readiness.test.mjs`, plus Native/Docs exact schema sources.
- Preservation Basis: Full Core source and regression tests carried byte-for-byte; local Core CLI and compiled schema operations were executed with the qualified Native content root.
- Provenance Limits: A complete Windows build is not established; Core source tests do not themselves demonstrate host UI behavior.

## Evidence Material

- independent-materials-roundtrip
  - Material: Core creates `before` and `after` named items each with different screenshot reference, kind, description, provenance and limits; integrity verification, creation validation and exact contract parse all pass.
  - Material Kind: positive executable test
  - Description: The parsed output retains two named entries and distinct field values, rather than one semicolon-delimited Material scalar.
  - Material Provenance: `test/evidence-repeatable-material-readiness.test.mjs` and real creation contract runtime.
  - Material Limits: No claim that the referenced binary image assets are copied or inspected.
- fail-closed-misbound-data
  - Material: Duplicate material labels, zero entries, missing required per-entry values, unrecognized nested fields and obsolete flat scalar material input are rejected.
  - Material Kind: negative executable regression
  - Description: Core does not silently discard unsupported structured values or promote a flat v1 field into the new repeated model.
  - Material Provenance: Renderer test suite and dedicated new v1 tests.
- exact-local-schema-help
  - Material: Field-help projections for required and optional named material subfields carry exact source line/context with a qualified local/unpublished checksum, not a fabricated GitHub permalink.
  - Material Kind: schema provenance regression
  - Description: Separates material meaning from source publication status; published Root/Task authority tests remain covered by their own real published contracts.

## Preservation And Fidelity

- Preservation State: 514 passing Core tests with zero failures and one existing skip in the completed full suite; test suite log retained in the implementation workspace during this batch.
- Fidelity Notes: Both generated material entries remain independent across rendered Markdown and Core parse/validation.
- Known Losses: Current Native local schema is not a published GitHub revision; full Windows build and operator-host acceptance remain separate.

## Interpretation Limits

- Does Not Prove: Windows webview correctness, a durable remote publication commit or general schema-v2 adoption.
- Not Yet Used As: Sigma release clearance.
- Must Not Be Treated As: permission to manufacture other unsupported nested fields or bypass the schema source byte identity.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: rECzqcsCgy9Nq20c1fljGNrFuSnseHGVTscQOKfoTiY