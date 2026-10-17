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
  - Created At: 2026-10-15 16:57:50
  - Authors: Anchor
  - Why: Correct the historical Parent schema-authority comparison without rewriting qualified Parent records.
  - Summary: Verify source-schema-matched Task-to-Evidence authoring with fail-closed pinned historical revisions.
  - Status: ready/local

---

# Authoring Historical Parent Validation Against Its Own Qualified Schema

## Supported Claim Or Question

- Supported Claim Or Question: Can Core permit a legitimate Task-to-Evidence continuation when the Parent's immutable Current Schema exactly matches its own registered schema authority, while still rejecting fabricated historical schema revision targets?
- Evidence Role: Controlled local reproduction, implementation change and two adversarial unit regressions, not independent recipient or publication acceptance.

## Provenance

- Known Source: 018 Core source and Native/Docs content from the qualified 17-Workspace carrier, Core `cli.common-author.js`, and `common-author-cross-schema-parent-audit.test.mjs`; local Native `schemas sync/check` against immutable Docs commit `e33bd7ebea209203f8ea41e966ec7b51d1c27f1c`.
- Preservation Basis: existing Core source plus one new regression test and this qualified Evidence are retained in the Core Workspace; the exact bounded published schema source is linked at its commit-pinned URL.
- Provenance Limits: no GitHub repository, branch, package repository, or remote state was mutated; tests execute with the candidate local Native source and Core test-bootstrap loader. A real independent LLM has not authored a follow-up Handoff using this correction.

## Evidence Material

- root-cause-and-fix
  - Material: [Core historical Parent audit](../../../src/tooling/portable/adapters/cli/cli.common-author.js), specifically `runHistoricalParentAudit` and its call from common authoring.
  - Material Kind: bounded Core source-code change
  - Description: Previously the historical Parent audit compared the Parent's declared Current Schema authority against the **child's** creation contract. This could block a valid Task-to-Evidence relation. The changed function compares with the registered schema authority for the **Parent's own schema ID**. When a declared pinned Parent revision differs from exact current qualified Parent schema authority, new authoring stops before retaining the child; identifier-only historical Parent compatibility remains a separate bounded rule. All existing Parent bytes and pinned references remain unchanged.
- controlled-regressions
  - Material: [Cross-schema historical Parent regression](../../../test/common-author-cross-schema-parent-audit.test.mjs) and [identifier-only historical Role regression](../../../test/identifier-only-historical-role-parent-authoring.test.mjs).
  - Material Kind: executable local test regression
  - Description: 10/10 focused tests passed after correcting an initial unsafe patch. A valid Task Parent authorizes Evidence-child preflight with 0 errors; a locally resealed Task Parent with a deliberately false commit SHA but matching schema ID is rejected rather than treated as qualification. Existing identifier-only historical Role behavior and a contradictory schema-identity test continue to pass.
- published-source-gate
  - Material: [Immutable Tiinex/docs schema subtree](https://api.github.com/repos/Tiinex/docs/git/trees/136aab1c8876d39bba194ad0e0e2cb3feb583415) in [commit `e33bd7e`](https://github.com/Tiinex/docs/commit/e33bd7ebea209203f8ea41e966ec7b51d1c27f1c), with the exact Native local schema mirror.
  - Material Kind: source identity comparison and schema sync/check receipt summary
  - Description: Local Docs `.topics/.schemas` Git tree equals immutable published subtree hash `136aab1c8876d39bba194ad0e0e2cb3feb583415`. Native sync wrote 8 generated files; `schemas check --published --require-published` qualified all 111 schema records and 164 expected files with 0 drift. A candidate bootstrap-only carrier cold-orientated with 0 findings and authored both Topic and Task with immutable Current Schema links.
- preexisting-other-lineage-drift
  - Material: Read-only local Core first-use lineage qualification receipt against unchanged 018 Workspace material.
  - Material Kind: bounded diagnostic observation (not repair)
  - Description: `qualify-lineage-directory` reports three pre-existing filename-versus-causal-Parent dimension drifts even though 018's carrier orientation reports 0 findings. That directory was not used as the Parent for this Evidence and was not rewritten. This Evidence is placed under compact `.topics/work/grounding-return-tooling/` lineage instead.

## Preservation And Fidelity

- Preservation State: source and test change plus this Evidence are preserved in the Core Workspace candidate; underlying Native published binding evidence is independently qualified in its own Workspace lineage.
- Fidelity Notes: test result summaries are from local Node test-runner and Tiinex qualified author; schema equality uses Git tree identities, not a filename or asserted commit date.
- Known Losses: console output and full test receipts are summarized rather than embedded as verbatim external payloads; no independent cross-session behavior is claimed.

## Interpretation Limits

- Does Not Prove: universal historical-schema equivalence, permission to treat unqualified permalink revisions as current, accepted release status, that a newly created Task's causal Parent is semantically appropriate just because it validates, or that all pre-existing Core work-lineage drift is repaired.
- Must Not Be Treated As: retroactive migration, remote publication, user consent, global Schema supersession, formal Role transfer, or completed 3x2 acceptance testing.
- Not Yet Used As: evidence of production deployment or independent LLM acceptance of a full recovery carrier.
- Need For Review: complete Core and Native qualified Workspace snapshots, manufacture a full continuation carrier with the changed sources, then cold-start the package and run independent semantic and authoring checks before promotion.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-repair-nested-work-lineage-return-qualification.trace.md](001-repair-nested-work-lineage-return-qualification.trace.md)
  - Value: s7kWJHXGl_Gv1xpa0C0NnTcJxZpUplCSwsArHPdixro

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: h0iLlpnV2b9P4OPcWJUtS5khOVmxZWpFYezZBWnSztc