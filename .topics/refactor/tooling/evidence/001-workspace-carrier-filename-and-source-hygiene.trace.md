# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:58:54
  - Trace: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Origin:
    - [relative](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-11 10:26:59
  - Authors: Anchor
  - Why: Preserve bounded regression evidence for the source and transport fixes needed after Sigma Pack dogfood.
  - Summary: Qualified basename handling, explicit source exclusions and 69 passing Core tests.
  - Status: ready/local

---

# Workspace carrier filename and source hygiene qualification

## Supported Claim Or Question

- Supported Claim Or Question: Can pointerless Workspace package naming remain a presentation label while rejecting unsafe filenames and excluding generated local transport state from complete source carriage?
- Evidence Role: Bounded implementation and regression evidence; not product acceptance or publication approval.

## Provenance

- Known Source: Core Workspace restored through the qualified byte provider from Sigma's tiinex-001.handoff-package(1).zip, followed by the bounded source changes recorded here.
- Preservation Basis: Prior full recovery compared to Sigma's sixteen-Workspace carrier before editing; Core was exact to that recovery. Source is not reconstructed from moving GitHub or npm latest.
- Provenance Limits: The earlier overnight test logs survived, but the earlier mutable source tree did not. The changes were re-applied to the qualified input and independently re-tested in this finalization session. This is not a claim of byte identity to an unavailable earlier worktree.

## Evidence Material

- Material Kind: Executed Node regression tests and embedded-bootstrap qualification.
- Material: [Core validation output](core-validation.txt), [local generated-file removal ledger](local-files-excluded.json).
- Result: npm run validate passed; 69 tests passed, zero failed. Portable smoke and embedded-bootstrap qualification also passed.
- Filename Boundary: The --projected-filename value is a basename-only transport presentation label. A pointerless carrier remains pointerless with dimension 001; a label containing another number does not create Handoff routes or semantic lineage.
- Source Hygiene: Default enumeration excludes .release and .outgoing-handoff-packages directories plus the exact .vscode/link relative path. Ordinary .vscode/tasks.json and ordinary link directories remain source.
- Validation: Reject traversal, separators, Windows device names and colon/ADS-like labels before materializing a projected pointerless output name. This narrow naming check is not complete hostile-archive hardening.

## Preservation And Fidelity

- Preservation State: Substantive source and previous provenance artifacts are retained. Nineteen generated files across the full input were omitted with exact path, size and SHA-256 in the ledger.
- Fidelity Notes: The Workspace package's byte-tree completeness proof covers the declared source boundary with explicit exclusions, not ignored/private local state or registry installation artifacts.
- Known Losses: No npm access was available in this sandbox. No publish, GitHub push or remote repository mutation was performed.

## Interpretation Limits

- Does Not Prove: Windows host acceptance, generic Handoff-authoring acceptance, arbitrary untrusted carrier safety or compatibility of every downstream package with a newly published Core version.
- Not Yet Used As: release permission or a reason to change canonical Core package.json version to match an npm release.
- Must Not Be Treated As: proof that a filename is semantic authority, or that an embedded bootstrap is automatically trusted merely because it has a self-declared digest.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](../001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Value: WOMe5yr432wwydKlPQSPPZs95rGEXQrVoewCbGSt3iU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: j6J5s3KDlrlBQL2yPYBLMHJ0m8Zdg7LfdDijoQNEQ6U