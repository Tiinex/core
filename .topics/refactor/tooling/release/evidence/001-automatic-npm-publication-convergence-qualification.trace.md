# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 18:11:52
  - Trace: [001-automatic-npm-publication-convergence-and-idempotency.trace.md](../001-automatic-npm-publication-convergence-and-idempotency.trace.md)
  - Origin:
    - [relative](../001-automatic-npm-publication-convergence-and-idempotency.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-09 18:54:58
  - Authors: Anchor
  - Why: Qualify the bounded release convergence fix against the observed post-bootstrap npm failure classes without overstating external publication success.
  - Summary: Bounded registry-lag handling and exact publish-state discrimination pass focused and full Core tests.
  - Status: ready/local

---

## Supported Claim Or Question

- Supported Claim Or Question: does the bounded Core release change distinguish transient npm registry visibility lag from durable package absence, authorization/server failure, exact published-archive idempotency and same-version archive collision without changing release-version planning semantics
- Evidence Role: qualifies the shared release-tooling change against the concrete post-bootstrap failure classes observed during the first multi-repository landing

## Provenance

- Known Source: current Refactor Core Workspace plus read-only GitHub Actions observations captured after Sigma landed and bootstrap-published the new package family
- Preservation Basis: exact current Core source was changed only inside the existing repo-owned release Task; remote GitHub/npm observations are evidence inputs and are not source authority
- Receipt: `evidence/receipts/turn2-npm-release-convergence-qualification-2026-09-09.json`
- Provenance Limits: the local execution environment cannot independently query npm registry DNS, so external publication state is supported only by GitHub Actions/npm output already observed; no remote mutation was performed by Anchor

## Evidence Material

- Material Kind: focused automated tests, complete Core test suite and read-only GitHub Actions failure receipts
- Material: Core release source changes in `src/release/plan.mjs`, `src/release/run.mjs` and `test/master-release.test.mjs`, plus the exact machine-readable qualification receipt and observed GitHub Actions run identifiers below
- Focused Qualification: `node --test test/master-release.test.mjs test/release-integration.test.mjs` passed **19/19**
- Core Qualification: `npm test` passed **44/44**
- Provider Native Observation: workflow run `34384279828` passed validation but npm publish reported an already-published `0.1.0` after the preceding registry planning read had treated the package as bootstrap-absent
- Provider GitHub Observation: workflow run `34384120905` passed validation and prepare, then OIDC npm publish returned `E404` / not-found-or-no-permission
- Runtime Native Observation: workflow run `34383526006` passed validation and prepare, then OIDC npm publish returned `E404` / not-found-or-no-permission
- Verse Playthings Observation: workflow run `34383076970` passed its 219 runtime tests, package/release qualification and 22 adapter tests before OIDC publication returned `E404` / not-found-or-no-permission
- Qualified Change: GitHub Actions registry reads use bounded no-cache retry only for `404`; `401`, `403`, `429`, network and `5xx` remain fail-closed; exact existing archive, same-version collision and absence are explicit separate states; failed publish accepts idempotency only after exact `dist.integrity` equality

## Preservation And Fidelity

- Preservation State: release planning, source-commit binding, prepared archive integrity verification, master-only policy and package-version policy are retained
- Fidelity Notes: the change does not reinterpret npm `404` universally as eventual consistency; retry is bounded and only used in the GitHub Actions release path, while manual bootstrap retains the existing one-time absence gate
- Known Losses: no external npm publish was performed from this runtime; the fix has not yet been observed in a subsequent real GitHub Actions publication run

## Interpretation Limits

- Does Not Prove: that Trusted Publisher configuration is correct for every repository, that all new npm packages currently exist in the registry, or that the next automatic publication will succeed externally
- Not Yet Used As: final npm publication acceptance, Turn-2 stability evidence or authority to publish remotely
- Must Not Be Treated As: permission to retry authorization failures until they pass, permission to overwrite an existing mismatched version, or evidence that a package-specific bootstrap/configuration problem belongs in Core

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-automatic-npm-publication-convergence-and-idempotency.trace.md](../001-automatic-npm-publication-convergence-and-idempotency.trace.md)
  - Value: 7v3huYdUPmDpz_MkI0utMS8C54GOXO8B3wNknmHbMPE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: NhkRwjU6u14yfORsmNbJmKNq6b-msFJ4kgA2cKf3sEI