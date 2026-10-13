# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-13 19:30:31
  - Trace: [001-first-use-acceptance-blank-workspace-to-useful-llm-continuity.trace.md](001-first-use-acceptance-blank-workspace-to-useful-llm-continuity.trace.md)
  - Origin:
    - [relative](001-first-use-acceptance-blank-workspace-to-useful-llm-continuity.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-13 19:30:49
  - Authors: Anchor
  - Summary: Core Native Entry CLI Propagation — Reproduction and Fix Candidate
  - Status: ready/local

---

# Core Native Entry CLI Propagation — Reproduction and Fix Candidate

## Supported Claim Or Question

- Supported Claim Or Question: whether a fresh Workspace carrier surfaces native Start, Explore and Resume entries through the portable CLI and whether the CLI propagates qualified runtime content sources.
- Evidence Role: supports one reproducible CLI wiring omission and a bounded local fix; does not establish a passing installed VSIX or ordinary Copilot chat.

## Provenance

- Known Source: qualified Tiinex Core source snapshot, first-use regression in a disposable sandbox, exact native Entry content from the packaged bootstrap.
- Preservation Basis: this Workspace carries both the modified CLI source and a regression test as exact files, along with this Evidence text.
- Provenance Limits: the original test was run against a portable runtime snapshot, not an installed VSIX; independent fresh-user behavior is unknown. Reproduction and repair are distinct from GitHub publication.

## Evidence Material

- core-cli-command-input
  - Material: [src/tooling/portable/adapters/cli/cli.command-input.js](../../../src/tooling/portable/adapters/cli/cli.command-input.js)
  - Material Kind: local source file
  - Description: both `project-workspace-carrier-entry` and `project-transport-completion` must forward `runtime.contentSources || []` to the Core projection.
- focused-regression
  - Material: [test/guided-entry-cli-content-source.test.mjs](../../../test/guided-entry-cli-content-source.test.mjs)
  - Material Kind: executable regression source
  - Description: tests both CLI input adapters forwarding exactly the qualified runtime content-source list; 2 of 2 passed locally.
- integrated-portable-regression
  - Material: first-use disposable end-to-end portable checks yielded 3/3 passes: init local directory, author Task before descriptor with explicit Authors, and discover/transport Start/Explore/Resume after the two-line runtime fix.
  - Material Kind: bounded test-result summary
  - Description: positive mechanical checks do not prove real VSIX installation or model-guided novice onboarding.

## Preservation And Fidelity

- Preservation State: relevant edited source and regression test carried byte-exact in the Core Workspace; separate disposable runtime/test receipts remain outside the Workspace during this qualification.
- Fidelity Notes: the omission was visible in both exact CLI branches; the source fix forwards the existing qualified runtime contentSources rather than inventing new Entry authority.
- Known Losses: external test console output and transient disposable directories are summarized, not represented as exhaustive audit logs inside this lineage.

## Interpretation Limits

- Does Not Prove: installed Windows VSIX correctness; automatic first-use chat grounding; novice schema choices; Marketplace readiness; completeness of schema companions.
- Must Not Be Treated As: a final acceptance Decision, a deployed or published fix, or permission to modify other repositories.
- Not Yet Used As: attestation, release acceptance, production deployment proof, or broader LLM-onboarding validation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-first-use-acceptance-blank-workspace-to-useful-llm-continuity.trace.md](001-first-use-acceptance-blank-workspace-to-useful-llm-continuity.trace.md)
  - Value: aiZ7q-jw0dChqaKzBCEFkXKql3ox1t7oLHm-Wg6ueUc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: HKelTKNOHQzvoo-6I1ixq-_8MaqbtMOvYe1KNHE8QHw