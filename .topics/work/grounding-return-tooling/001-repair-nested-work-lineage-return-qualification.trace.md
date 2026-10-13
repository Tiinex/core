# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-10-12 23:10:10
  - Trace: [001-1-batch-003-grounding-feedback.trace.md](https://github.com/Tiinex/business/blob/e292e3c02e4ec579b467c99ddfc297180d9dde28/.topics/work/grounding-validation/003-process-scaffold/001-1-batch-003-grounding-feedback.trace.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/business/blob/e292e3c02e4ec579b467c99ddfc297180d9dde28/.topics/work/grounding-validation/003-process-scaffold/001-1-batch-003-grounding-feedback.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-12 23:58:09
  - Authors: Anchor
  - Summary: Repair Nested Work-Lineage Return Qualification
  - Status: ready/local

---

# Repair Nested Work-Lineage Return Qualification

## Objective

Correct the Core return-preparation path so an already-qualified nested Task work directory under `.topics/work/` can manufacture a causally parented Handoff in that same directory. This bounded implementation is spawned by Business grounding-validation batch feedback and the pre-batch-004 smoke-test failure (`portable.cli.prepare-return.work-lineage.unqualified`).

## Done Criteria

- Existing flat Task-local returns and new nested Task-local returns are admitted only with the same qualified selected-Handoff and sealed causal-parent checks.
- Retired `.topics/handoffs/`, unrelated sibling ancestry, and non-Task work roots cannot silently qualify new return authoring.
- Existing Core tests explicitly exercise nested and flat paths and stay green; V1 Handoff Package manufacture remains unchanged.
- No extra `expected` artifacts, schema formats, or support-file conventions are introduced.
- The bounded regression result is recorded as Evidence here before any Core-to-Sigma handoff.

## Scope

- Implementation owner: Core; repair `cli.prepare-return.js` and existing regression tests only as necessary.
- The parent Business batch Feedback explains why this Core work exists. The pre-batch-004 failure is a local experimental observation, not a published/accepted Business Task result.
- Do not mutate the published Business feedback, historical signed ancestors, other Workspace sources or any remote repository. Test ZIPs remain external and are not imported.

## Dependencies

- Grounding Validation batch 003 Feedback in Business; disposable integrated-continuation test-004 preflight, which found the nested-directory rejection before manual testing.
- Existing `tiinex.task.v1`, `tiinex.evidence.v1`, and Handoff Package V1. No new lineage conventions.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-batch-003-grounding-feedback.trace.md](https://github.com/Tiinex/business/blob/e292e3c02e4ec579b467c99ddfc297180d9dde28/.topics/work/grounding-validation/003-process-scaffold/001-1-batch-003-grounding-feedback.trace.md)
  - Value: wR1MX6jQ0T4Y8_0lyTbCMjNdkLbfROSfUluc-QAeLMI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: s7kWJHXGl_Gv1xpa0C0NnTcJxZpUplCSwsArHPdixro