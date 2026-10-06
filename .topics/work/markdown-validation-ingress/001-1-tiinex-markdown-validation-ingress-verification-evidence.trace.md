# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-05 23:09:23
  - Trace: [001-tiinex-markdown-validation-ingress.trace.md](001-tiinex-markdown-validation-ingress.trace.md)
  - Origin:
    - [relative](001-tiinex-markdown-validation-ingress.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-05 23:10:06
  - Authors: Anchor; Sigma
  - Why: Make the validator resource/noise fix and its fail-closed malformed-Tiinex boundary durable in the owning Core Workspace.
  - Summary: Record exact transport.md false-warning reproduction, first-line envelope gating, 455-test Core regression and 148/148 VS Code verification.
  - Status: ready/local

---

# Tiinex Markdown Validation Ingress Verification Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether ordinary Markdown is excluded from shared Tiinex editor/staged validation before audit/lineage/schema work while malformed Tiinex-declared Markdown remains validateable.
- Evidence Role: bounded implementation/regression evidence for Tiinex Markdown Validation Ingress.
- Target Artifact: Tiinex Markdown Validation Ingress.
- Review Context: VS Code cold-test dogfood showed `transport.md` receiving a Tiinex lineage warning despite being ordinary generated Markdown.

## Provenance

- Known Source: exact user-supplied `tiinex-027.handoff-package.zip`, SHA-256 `a39bdd3c698f259888f6cb10aa6039a03fcc7a45325c30ca2b82fb1bed9fc26c`, qualified through its declared Start/bootstrap/orient path.
- Reproduction Input: exact user-supplied `transport.md`, SHA-256 `f5284541ccf54f227a31a5876bc941d0bac719619fbdcf96875adc4bccf64ab4`, whose first line is `Handoff package attached.` rather than `# Continuity Context`.
- Preservation Basis: bounded local Core/VS Code source changes only; no schema contract, Entry/Target semantics, package authority or remote state changed.
- Provenance Limits: cold-test interpretation is based on the exact supplied package/Markdown outputs and local deterministic reproduction; it is not a release or remote-head attestation.

## Evidence Material

- Material: before/after exact editor-assistance projection, new focused ingress tests, full Core regression, Native/OpenAI regressions and VS Code bridge regression.
- Material Kind: implementation and regression evidence.
- Before Fix: Core editor assistance projected `transport.md` as one document with status `degraded` and warning `portable.lineage-integrity.child-self-unavailable`.
- After Fix: the exact same input projects status `clean`, zero documents and zero diagnostics, demonstrating that ordinary Markdown is excluded before Tiinex validation.
- Declared Ingress: `hasTiinexEnvelopeFirstLine` recognizes only a first-line `# Continuity Context` marker (BOM/line-ending tolerant). A later occurrence does not qualify the document for Tiinex validation.
- Malformed Tiinex Boundary: a document beginning with `# Continuity Context` but lacking valid Tiinex envelope fields remains inside validation and produces diagnostics; malformed Tiinex material is not hidden by the optimization.
- Editor Assistance Boundary: non-Tiinex records are removed before lineage inspection and document audit; unrelated ordinary Markdown therefore cannot consume lineage/schema validation work or contribute editor findings.
- Staged Validation Boundary: the same first-line marker classifies staged Tiinex material; ordinary Markdown is recorded as ignored, while malformed declared Tiinex material remains in the staged Tiinex set.
- Focused Core ingress tests: 4/4 pass.
- Full Core regression: 455 distinct tests covered; zero failures. Direct chunks reported 72/72, 132/132, 119 pass + one intended npm-context skip out of 120, and 131/131. The skipped package-surface test passes 1/1 when rerun under `npm exec`, so all 455 distinct Core tests pass in their intended contexts.
- Native regression: 7/7 pass.
- OpenAI Interop regression: 2/2 pass.
- VS Code bridge regression: 148/148 pass after the diagnostics ingress assertion was added.
- The 027 VS Code snapshot also still carried the already-known Local-build task-group verification drift (`test/default` vs the repository test's intended non-default `build` group); the bounded correction was reapplied so the current 148/148 regression is truthful.

## Preservation And Fidelity

- Preservation State: Tiinex documents continue through the same shared Core validation path after ingress; the change only rejects non-Tiinex Markdown earlier.
- Fidelity Notes: first-line envelope presence is an ingress marker, not proof that the artifact is valid. Actual schema/integrity/lineage qualification remains unchanged and occurs after ingress.
- Known Losses: none for Tiinex artifact diagnostics; ordinary Markdown intentionally loses Tiinex diagnostics/actions/status because it is outside the Tiinex artifact domain.

## Interpretation Limits

- Not Yet Used As: release acceptance, extension-host desktop acceptance, Marketplace readiness, or final P1/Task closure.
- Does Not Prove: that every non-editor Core operation should globally ignore all non-Tiinex Markdown; this Evidence covers editor assistance and staged validation where artifact validation is intended.
- Must Not Be Treated As: permission to infer a Tiinex schema merely from the first-line marker or to skip validation of malformed marked artifacts.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-tiinex-markdown-validation-ingress.trace.md](001-tiinex-markdown-validation-ingress.trace.md)
  - Value: _risOuiXhellfzPJqDnMcbxKzHeVUHBjOgIPl--wHhE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: BmMpdt5g6DqjlSsnEpoIu1zITATq6iDqcXg858h1EIU