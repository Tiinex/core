# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-08 15:00:50
  - Trace: [001-correct-required-ordinary-group-inputs.trace.md](001-correct-required-ordinary-group-inputs.trace.md)
  - Origin:
    - [relative](001-correct-required-ordinary-group-inputs.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-08 15:01:18
  - Authors: Anchor
  - Why: Carry exact failure and bounded verification in owning Core Workspace.
  - Summary: Portable Core required ordinary-group shadow input failed Windows Evidence and is corrected with red-green tests.
  - Status: ready/local

---

# Core Evidence Ordinary Group Materialization Regression

## Supported Claim Or Question

- Supported Claim Or Question: Does the qualified portable Evidence authoring contract accept its grouped `Evidence Role` value without redundantly requiring another top-level input?
- Evidence Role: reproduces the failure, tests the generic repair, and preserves its acceptance limits.

## Provenance

- Known Source: silent Sigma Windows Evidence Create run recorded on 2026-10-08; the carried qualified Core/Native schema and VS Code authoring implementations; direct Core planner reproduction in this continuation.
- Preservation Basis: exact Core source and test modifications are present in this Workspace. The Windows video's bytes are not included; derived error/frame evidence is carried separately with the VS Code Task.
- Provenance Limits: the host video shows a generic materialization code without field names; identifying `Evidence Role` comes from Core planner reproduction, not from reading hidden Windows form state.

## Evidence Material

- Material: Before fix, a complete structured `Supported Claim Or Question` group with both required fields caused Core `prepare-materialization` to return `needs-clarification` with missing `Evidence Role` (top-level). Duplicating `Evidence Role` outside the group made the same proposal `ready`, demonstrating a contradictory requirement.
- Material Kind: reproducible Core materialization projection and red-to-green regression tests.
- Repair: `creationRequiredInputs` now removes redundant unqualified ordinary-group member demands only when the owning group is itself a required creation input; it retains explicitly bound scalar inputs and the group requirement. Core continues to check each required nested field with its qualified group name.
- Verification: the two added targeted Evidence tests were red before the fix, green afterward; 9/9 combined Evidence/Handoff tests passed. Full qualified local Core test suite after providing the carried Native/Business source fixtures: 501 tests, 501 passed, 0 failed. The portable `prepare-materialization` operation returned `ready` and zero clarification needs with the proper nested form representation.

## Preservation And Fidelity

- Preservation State: retained source change, regression tests, and bounded source-attributed test outcomes in the Core Workspace snapshot.
- Fidelity Notes: the regression tests preserve both valid nested input and missing nested input behavior; the fix does not add a field or a hidden Evidence-specific UI default.
- Known Losses: no Windows Extension Host rerun after replacing local Core has yet been observed, and no persisted Evidence child artifact was created by these Core planner checks.

## Interpretation Limits

- Does Not Prove: that actual Windows `Preview`, `Create`, persistence or file reference handling now pass end-to-end; Core test success and host acceptance remain separate.
- Not Yet Used As: release approval, README media completion, remote publication, or final Sigma sign-off.
- Must Not Be Treated As: authorization to bypass missing required inputs or to implement Core validation rules in the VS Code host.
- Need For Review: Sigma applies the canonical package's updated Core Workspace via Incoming Replace, rebuilds VS Code against local Core and retries the parent-bearing Evidence flow.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-correct-required-ordinary-group-inputs.trace.md](001-correct-required-ordinary-group-inputs.trace.md)
  - Value: FLbX7ypyfJjSgVBUMXwSYIVJGYd6Qf3vNHmF09X9kaw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: s9w48_1GumF9FPQqlhHoBVOmb5mEXOhqsGjqOnUlVnw