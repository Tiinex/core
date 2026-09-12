# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Trace: [001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Origin:
    - [relative](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-12 00:34:35
  - Authors: Loom
  - Why: Preserve exact implementation, regression, manufacture-preflight, bootstrap, and authority-boundary evidence for the bounded Loom return.
  - Summary: Qualification evidence for the fail-closed source reconciliation proof gate, manufacture binding, preservation semantics, operator contract, and full Core validation.
  - Status: ready/local

---

# Core Major 005 Reconciliation Manufacture Proof Gate Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can Core mechanically prove a reconciled source frontier preserves qualified base/incoming/current source identities, block deletion/conflict ambiguity until an explicit caller disposition exists, and bind that proof to manufacture without granting Tooling semantic merge or acceptance authority
- Evidence Role: qualifies the bounded Core Major 005 implementation, operator contract, focused regressions, manufacture preflight integration, and full portable/bootstrap validation requested by the Anchor to Loom Handoff

## Provenance

- Known Source: exact Core Workspace materialized from the received qualified Major 005 Handoff carrier through Tiinex after Start-qualified bootstrap and explicit Loom holder-role qualification
- Preservation Basis: exact carried source bytes, existing shared Node manufacture enumeration/exclusion policy, deterministic local tests, and Tiinex-authored continuity artifacts
- Provenance Limits: no Docs mutation, Business mutation, repository-specific semantic merge policy, remote fetch, push, publication, release, deployment, or other remote mutation was performed
- Semantic Authority Boundary: byte/path identity can establish mechanical preservation or conflict, but cannot establish semantic merge correctness, intentional deletion, authority, owner acceptance, or product acceptance

## Evidence Material

- Material: patched Core source/test bytes plus deterministic reconciliation/manufacture proof and validation receipts produced from the qualified carried Workspace
- Material Kind: host-neutral reconciliation proof operation, Node source adapters, CLI/operator surface, manufacture qualification, regressions, and bootstrap validation
- New Proof Operation: `prove-source-reconciliation` with common alias `reconcile` consumes qualified `base`, `incoming`, `current`, and explicit candidate `reconciled` frontiers and emits schema `tiinex.portable.source-frontier-reconciliation-proof.v1`
- Deterministic Classifications: every qualified source-union path is classified as `exact`, `incoming-only`, `current-only`, `same-result-concurrent`, `deletion-candidate`, or `conflicting-overlap`
- Explicit Risk Disposition: deletion/conflict candidates remain blocked until a caller supplies a path-scoped disposition selecting `incoming`, `current`, `base`, `reconciled`, or `delete`; the `reconciled` action accepts candidate bytes chosen elsewhere and does not make Tooling the semantic decider
- Preservation Proof: manufacture-ready receipts separately count and prove preservation of every automatically accepted incoming-only and current-only identity; candidate paths outside the qualified base/incoming/current union fail closed
- Exact Binding: each full proof receipt carries a SHA-256 `proofFingerprint` over a stable proof basis plus exact candidate reconciled Workspace snapshot fingerprints; compact summaries explicitly cannot satisfy manufacture qualification
- Manufacture Preflight: Node Handoff manufacture consumes `reconciliationProof` / `requireReconciliationProof`, re-enumerates the exact final Workspace materialization through the shared manufacture enumerator, and blocks missing, non-ready, edited, mismatched, or source-stale proof before package carriage
- Manufacture Facade: blocked reconciliation qualification is projected into package status/findings/verification so downstream manufacture cannot silently ignore a required proof
- Source Hygiene: local reconciliation inputs reuse `enumerateNodeWorkspace`, preserving existing deterministic exclusions for runtime state, generated output, dependencies, and symlink policy instead of inventing a second source-selection rule
- Public Surface: host-neutral proof/summary/manufacture-qualification exports are available from the portable/browser-safe public surface; Node preparation/proof adapters are exposed from the Node public surface
- Operator Contract: run `tiinex-portable reconcile` with explicit source kinds/locations and matching Workspace ids; save `--full` output when it is manufacture-ready; pass that receipt to `tiinex-portable handoff ... --require-reconciliation-proof --reconciliation-proof <receipt.json>`; any source change after proof causes manufacture preflight to block and requires a fresh proof

## Regression And Validation Evidence

- Real Overlay Regression: focused test reproduces the complete-return-overlay failure shape where a candidate built from the incoming snapshot omits a concurrent current-only ancestry path; proof returns `reconciled-frontier-mismatch`, records current-only preservation failure, and the corrected union qualifies
- Conflict And Deletion Regression: focused test proves conflict/deletion candidates block in `disposition-required` state until explicit caller dispositions are present, after which the exact candidate may qualify
- Ungrounded Candidate Regression: candidate source not present in the qualified three-way union fails closed
- Full Receipt Regression: compact operation output is rejected for manufacture because it lacks the full proof basis required for fingerprint verification
- Manufacture Drift Regression: Handoff manufacture preflight accepts an exact full receipt, then rejects the same receipt after source bytes change with `portable.handoff-manufacture.reconciliation-proof.source-drift`
- Focused Regression Result: `node --test test/source-frontier-comparison.test.mjs` passed 12/12
- Full Core Regression: `npm test` passed 87/87
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified` with manifest SHA-256 `023521c0f68e10eddbf0f6a84d5f6c24c8409e7b8877962aa8dfe2b15a9a21fe`, representation SHA-256 `ba43ba9535a1c776829031dc14629fe0bb4eeef0aed8a984e56d4c39e596972a`, 493 runtime files, and 5,408,203 runtime bytes
- Full Validation Result: `npm run validate` passed after the final manufacture-preflight regression was added
- CLI Exercise: a local bad candidate that dropped one current-only file exited blocked with `reconciled-frontier-mismatch`; the corrected candidate exited ready with `manufacture-ready` and a full fingerprinted receipt

## Preservation And Fidelity

- Preservation State: existing read-only two-way/three-way comparison semantics remain backward-compatible; the proof gate is an additional explicit layer and manufacture binding is opt-in/required only when the caller supplies or requires reconciliation proof
- Fidelity Notes: automatic mechanical selection is limited to identities that are unambiguous under the qualified three-way source relation; risky deletion/conflict paths never become manufacture-ready without explicit external disposition
- Existing Manufacture Authority: package/local source authority, package qualification, sealed-source opacity, shared source enumeration exclusions, and runtime/source bootstrap alignment remain intact
- Known Losses: none in the bounded Core source frontier; semantic owner review remains intentionally outside Tooling

## Interpretation Limits

- Does Not Prove: that a conflict resolution is semantically correct, a deletion is intentional, an owner accepted the result, a mechanically preserved union is product-correct, or a package should be released
- Not Yet Used As: authority for remote merge, repository mutation outside this Core Workspace, Docs policy change, Business process change, npm publication, release, deployment, or host adoption
- Does Prove: exact source identities selected by the proof are mechanically preserved in the candidate and remain byte-identical at manufacture preflight time, while required conflict/deletion dispositions are explicit and auditable
- Must Not Be Treated As: automatic semantic merge, automatic byte-union authority, acceptance inference, deletion inference, or replacement for Anchor/owner disposition
- Authority Limits: Core host-neutral reconciliation/manufacture mechanics, CLI/operator contract, exact local qualification, tests, and bootstrap evidence only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md](../001-3-6-4-2-1-1-1-core-major-005-return-reconciliation-manufacture-proof-gate-task.trace.md)
  - Value: QXd_Yj3VRLrMppQF_qK1oNGD2CL28w3_iFgB9XSyCKo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 6ZUytqFWpO8wA6SXGEVVGnLzhkLCUEcT2VdhGjpeK80