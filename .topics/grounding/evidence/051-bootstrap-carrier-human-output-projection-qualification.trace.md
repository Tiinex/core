# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 14:50:45
  - Trace: [027-1-1-1-1-bootstrap-carrier-human-output-projection.trace.md](../027-1-1-1-1-bootstrap-carrier-human-output-projection.trace.md)
  - Origin:
    - [relative](../027-1-1-1-1-bootstrap-carrier-human-output-projection.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-29 14:51:54
  - Authors: Anchor
  - Why: Preserve exact evidence that the bootstrap export UX can be simplified for humans without weakening LLM automation or Package V1 qualification.
  - Summary: Qualified human-default bootstrap carrier output with explicit full JSON machine mode and unchanged canonical manufacture.
  - Status: ready/local

---

# Bootstrap Carrier Human Output Projection Qualification

## Supported Claim Or Question

- Supported Claim Or Question: whether the bootstrap-only carrier convenience can present only human-relevant output by default while preserving the complete structured receipt for explicit LLM/automation use and continuing to use the single canonical Package V1 manufacturer.
- Evidence Role: qualifies the human-default output formatter, explicit JSON mode, silent repository VS Code task invocation, and non-regression boundary for Task `027-1-1-1-1`.

## Provenance

- Known Source: exact Core Workspace qualified by Handoff 081 and modified locally only for Task `027-1-1-1-1` under Sigma's explicit authorization.
- Preservation Basis: exact local source bytes, direct human-mode and JSON-mode dogfood, focused regression, full Core regression, portable smoke, embedded bootstrap qualification, and npm package dry-run.
- Provenance Limits: no remote mutation, commit, push, npm publication, release, deployment, Docs mutation, or VS Code extension repository mutation was performed.

## Evidence Material

- Material: output-projection and repository-task delta for `tools/build-bootstrap-carrier.mjs`, `.vscode/tasks.json`, and focused regression coverage.
- Material Kind: Core convenience UX, explicit machine-output switch, repository task presentation, and qualification evidence.
- Human Default: `npm run --silent bootstrap:carrier -- --output-dir <temp>` produced only a ready heading, exact output path, and canonical transport text; internal byte count, SHA-256, manufacture receipt, finding summary, Package V1 inspection state, and roundtrip state were not emitted.
- Machine Mode: the same command with `--json` emitted the full `tiinex.bootstrap-carrier-export.v1` receipt including exact output identity, byte count, SHA-256, canonical manufacture verification, finding summary, and transport text.
- Package Authority Boundary: both output modes call the same `buildBootstrapCarrier` function, which continues to delegate package manufacture to portable `manufacture-handoff-package --carrier-mode bootstrap`; formatting changes no carrier bytes or semantics.
- VS Code Task: `Tiinex: Build Bootstrap Handoff Package` now invokes `npm run --silent bootstrap:carrier` from `${workspaceFolder}`, avoiding npm task-provider/banner noise while preserving the same npm-script implementation.
- Focused Regression: `node --test test/bootstrap-carrier-export.test.mjs` passed 3/3, including the assertion that default human output exposes no internal diagnostic fields.
- Full Core Regression: `npm test` passed 306/306 with zero failures and zero skips.
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`.
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `8926021e3a5c0d3ae29b8ca0e971f7415417210bed8bc9a1ce82103adb020a0b`, representation SHA-256 `820f5c12f6ea0548c786c35db014095e085ff1b2f93299d2d539171aaef56f72`, 579 runtime files, and 8,577,184 runtime bytes.
- Npm Package Dry Run: the package candidate contained 621 files, included `tools/build-bootstrap-carrier.mjs`, and contained zero ZIP outputs.

## Preservation And Fidelity

- Preservation State: the existing canonical bootstrap-only carrier manufacture remains unchanged; only presentation of the convenience receipt and the repository-local task invocation changed.
- Fidelity Notes: default human output is a projection of the already-qualified receipt rather than an alternative qualification path; JSON mode exposes the original structured receipt for machines.
- Known Losses: default human output intentionally omits internal diagnostics that remain available through `--json` and underlying Core operations.

## Interpretation Limits

- Not Yet Used As: release authority, publication authority, or downstream VS Code extension change.
- Does Not Prove: that a generated carrier was committed, published, or human-delivered merely because the local export command succeeded.
- Must Not Be Treated As: permission to suppress qualification failures, replace the canonical package manufacturer, or infer semantic authority from the human-friendly presentation.
- Operational Boundary: success output is intentionally minimal for humans; machine consumers requiring receipt detail must opt into `--json`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-1-1-1-bootstrap-carrier-human-output-projection.trace.md](../027-1-1-1-1-bootstrap-carrier-human-output-projection.trace.md)
  - Value: qQ2f3sQzFgoV9__YCWYWOcx7WTugUc1wKZB32AYsh10

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gjU3jEiVdjWjCQIAN3xuDvHH1b7uK5NHrX5Uf1PVzRM