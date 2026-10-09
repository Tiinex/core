# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 22:29:14
  - Trace: [001-project-and-materialize-repeating-evidence-sources.trace.md](001-project-and-materialize-repeating-evidence-sources.trace.md)
  - Origin:
    - [relative](001-project-and-materialize-repeating-evidence-sources.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 23:44:01
  - Authors: Anchor
  - Why: Keep exact source binding mandatory while testing future per-material fidelity with already-qualified Core mechanics.
  - Summary: Core prevents silent structured-input data loss, preserves legacy Evidence, and proves existing named-declaration roundtrip and parser shape.
  - Status: ready/local

---

# Structured Evidence Creation Fidelity And Repeatable Contract Probe

## Supported Claim Or Question

- Supported Claim Or Question: Does Core preserve material fidelity when callers supply unsupported structured Evidence inputs, and can it already roundtrip two individually named declarations under a separate qualified schema?
- Evidence Role: exact source hardening and positive/negative automated test evidence, distinct from Native Evidence v2 authorization.
- Review Context: Existing Evidence v1 uses single ordinary `Material` and `Material Kind`. The requested multiple materials must not silently stringify to one field or disappear while a sealed artifact looks valid.

## Provenance

- Known Source: modified `src/schemas/creation.renderer.js`, new `test/evidence-repeatable-material-readiness.test.mjs`, qualified Native `tiinex.evidence.v1` and `tiinex.entry.session.v1` contracts.
- Preservation Basis: exact Core Workspace snapshot and test source in the canonical Tiinex carrier; Tooling source source-bound to latest qualified Native/Business workspaces.
- Provenance Limits: positive repeated-entry tests exercise **session Grounding Material** rather than Evidence v2; the latter is not an executable Native schema.

## Evidence Material

- Material Kind: Core fidelity correction and qualified explicit compatibility tests.
- Material: `renderArtifactCreationDraftMarkdown` now rejects unbound array/object creation values with `creation-structured-input-unqualified:<input>` instead of discarding them. Its scalar renderer refuses arrays/objects passed as ordinary fields (`creation-one-line-value-structured-unqualified:<input>`) instead of comma-joining or printing `[object Object]`. This affects representational fidelity, not schema ownership or requiredness. A legacy single-material Evidence remains creatable and validates unchanged.
- Description: Seven focused tests PASS for v1 non-repeatability, both kinds of fail-closed structured input, legacy valid creation, existing named-declaration **two independently described entries roundtrip** through rendering plus Core validation, duplicate/missing/unqualified-field rejection, and a **nonoperative parser-only** candidate schema grammar probe. Full-suite result must be reported from the completed final run, not inferred from these focused tests.

## Preservation And Fidelity

- Preservation State: exact Core code/tests carried; published Native evidence and Core parser semantics otherwise unchanged.
- Fidelity Notes: unsupported extra primitive/scalar value handling is not broadened in this correction; only structurally dangerous unbound data is rejected. No synthetic material is treated as a new Evidence authority.
- Known Losses: Native v2 source creation, source binding, Form Profile adoption, host Add/Remove and installed Windows acceptance remain unimplemented.

## Interpretation Limits

- Not Yet Used As: proof of repeatable Evidence creation or schema acceptance.
- Does Not Prove: a named declaration can be substituted for arbitrary Evidence metadata without Native decision; duplicate material references may require a separately qualified policy.
- Must Not Be Treated As: permission to bypass source snapshot checks or silently upgrade old Evidence.
- Need For Review: keep the Core fidelity regression as a permanent launch guard, qualify the actual Native versioned material contract, then rerun full Core and webview creation roundtrips against it before Sigma.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-project-and-materialize-repeating-evidence-sources.trace.md](001-project-and-materialize-repeating-evidence-sources.trace.md)
  - Value: ci7GpxWguTTu_nvbrmW1Q9JPSwKzUXisPbvzVcjw3Cs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Il0nVFQ2TkEoK7z_-JAGtnLHWD1AFsrzdxMXOfT_kWM