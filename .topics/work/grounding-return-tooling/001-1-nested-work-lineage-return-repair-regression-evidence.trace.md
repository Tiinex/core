# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-12 23:58:09
  - Trace: [001-repair-nested-work-lineage-return-qualification.trace.md](001-repair-nested-work-lineage-return-qualification.trace.md)
  - Origin:
    - [relative](001-repair-nested-work-lineage-return-qualification.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-13 00:00:23
  - Authors: Anchor
  - Summary: Nested Work-Lineage Return Repair — Regression Evidence
  - Status: ready/local

---

# Nested Work-Lineage Return Repair — Regression Evidence

## Supported Claim Or Question

- Supported Claim Or Question: Does current Core return preparation allow a selected, qualified Handoff in a nested Task work area, without relaxing its causal Parent guard or recreating the retired global Handoff directory?
- Evidence Role: Local reproduction and regression verification of a bounded implementation fix triggered by grounding-validation batch feedback and the disposable test-004 preflight.

## Provenance

- Known Source: Handoff 037-1-1-1 Sigma→Anchor qualified Core snapshot, Core `src/tooling/portable/adapters/cli/cli.prepare-return.js`, existing `test/recipient-return-ux.test.mjs`, and the separate disposable test-004 smoke continuation.
- Preservation Basis: The exact implementation delta and regression test reside in the same Core workspace; external test-004 return transcript remains outside canonical Core.
- Provenance Limits: The local test-004 smoke is a fixture test, not a public production deployment or independent ChatGPT-model run. Earlier batch feedback establishes the next-work motivation, not the full cause of every possible nested-directory failure.

## Evidence Material

- Previously failing nested return
  - Material: `test/recipient-return-ux.test.mjs` — `prepare-return supports nested Task-local work directories without weakening causal Parent enforcement`.
  - Material Kind: Existing source-tree regression test
  - Description: The added test initially failed with `portable.cli.prepare-return.work-lineage.unqualified`; after the one-line directory predicate correction, it passes and still rejects an unrelated sibling as causal Parent.
- Minimal Core implementation change
  - Material: `src/tooling/portable/adapters/cli/cli.prepare-return.js` — accept `.topics/work/<area>` and qualified nested descendants; keep the rest of `resolveReturnAuthoringLocation` and `assertCausalDescent` unchanged.
  - Material Kind: Directly inspectable local Core source delta
  - Description: Existing guards against retired `.topics/handoffs/` and unrelated same-directory descendants remain in place; no second return mechanism is introduced.
- Adjacent regression checks
  - Material: 103/103 passing tests from seven existing Core test suites (`recipient-return-ux`, `handoff-package-v1`, `author-filename-convention`, `authoring-target-parent`, `selected-handoff-current-work`, `portable-cli-capability-affordance`, `lineage-parent-integrity-correctness`).
  - Material Kind: Local Node test-run observations
  - Description: All relevant checks passed using the separately qualified Native schema root; this is not a claim that all possible Core tests or downstream providers were exercised.
- Real pre-batch-004 continuation
  - Material: Disposable test-004 `Business` continuation `prepare-return` projection; status `ready`, return directory `.topics/work/grounding-validation/004-integrated-continuation`, causal Parent `001-1-1-integrated-source-review-local-smoke-evidence.trace.md`.
  - Material Kind: Local smoke-test projection
  - Description: Demonstrates the originally blocked integration path prepares successfully after the Core fix, without writing an additional canonical source file.

## Preservation And Fidelity

- Preservation State: Source code, regression test, and this Evidence are held in one local Core Workspace snapshot; test run logs and disposable test-004 fixture remain external and not in Tiinex Workspace lineages.
- Fidelity Notes: The code delta is one changed regular-expression predicate; regression coverage extends an existing test file. Full test counts and smoke paths were observed directly.
- Known Losses: Interactive platform behavior and multi-model cold-start effects are not established by local Node tests. Runtime logs are not reproduced verbatim in the durable Evidence.

## Interpretation Limits

- Does Not Prove: That semantic correctness, human acceptance, all other nested-worklineage shapes, a full independent 004 recipient run, or global release of Core are established.
- Must Not Be Treated As: Approval to mutate remote repositories, authorization to rewrite Business feedback, proof of unrelated Process/Scaffold execution, or a substitute for V1 Handoff qualification.
- Not Yet Used As: A final grounding acceptance or published release of Core.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-repair-nested-work-lineage-return-qualification.trace.md](001-repair-nested-work-lineage-return-qualification.trace.md)
  - Value: s7kWJHXGl_Gv1xpa0C0NnTcJxZpUplCSwsArHPdixro

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: QQ9g8-KjhE4fRbXepMScxxFHE0MsqG0z0lJOKfkm5o8