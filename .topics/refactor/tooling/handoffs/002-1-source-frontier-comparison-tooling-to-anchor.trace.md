# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 15:21:32
  - Trace: [002-source-frontier-comparison-tooling-to-loom.trace.md](002-source-frontier-comparison-tooling-to-loom.trace.md)
  - Origin:
    - [relative](002-source-frontier-comparison-tooling-to-loom.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-10 16:07:44
  - Authors: Loom
  - Why: Return the bounded qualified Core implementation and exact invocation/evidence surface to Anchor for independent three-way reconciliation.
  - Summary: Loom return for shared exact source-frontier comparison and three-way reconciliation Tooling.
  - Status: ready/local

---

# Source frontier comparison Tooling → Anchor

## Handoff Parties

- Purpose: return the bounded Core source-frontier comparison implementation requested by Anchor, with exact-byte reconciliation receipts, manufacture-equivalent local selection, sealed-Workspace opacity, CLI/public invocation surfaces, and qualification evidence.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- shared-source-frontier-comparison-complete
  - Transfer Kind: work-and-responsibility
  - Description: Core now exposes one normalized host-neutral exact source-frontier model and comparison receipt engine for two-way Workspace/frontier equality, asymmetry and deterministic added/removed/byte-changed paths, plus optional base/incoming/current reconciliation with `incoming-only`, `current-only`, `same-result-concurrent` and `conflict-candidate` classifications. The receipt boundary is explicitly read-only and does not merge, mutate, infer semantic equivalence, acceptance or authority.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: exact Workspace-relative path + byte-size + SHA-256 source evidence only.

- manufacture-equivalent-node-adapters-complete
  - Transfer Kind: work-and-responsibility
  - Description: Node local Workspace and local multi-Workspace adapters reuse `enumerateNodeWorkspace`, the existing Handoff-manufacture enumerator, so `.git`, `.tiinex`, `node_modules`, `.site-publish`, symlink handling, ordering and snapshot evidence remain one shared source-selection contract. Handoff-package adapters use receiver-current trusted package loading/qualification and qualified Workspace byte providers; package bootstrap code is not executed for comparison.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: no second directory walker, no remote source acquisition and no change to manufacture inclusion semantics.

- sealed-workspace-opacity-complete
  - Transfer Kind: work-and-responsibility
  - Description: password-sealed Workspace bindings normalize to `locked` without internal snapshot/path projection. An already-authorized open result may expose recovered exact material only when its Workspace id, visible Workspace-artifact path and Workspace-artifact SHA-256 correlate to the sealed binding in the package being compared; mismatched open results stay locked. Focused tests assert the protected internal path/name never appears in the locked receipt.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: comparison does not perform password acquisition or decryption itself and does not weaken Secure Transport V1 provider activation.

- discoverable-public-and-cli-surface
  - Transfer Kind: work
  - Description: the browser-neutral package root exports normalized comparison/reconciliation and compact-summary functions; `@tiinex/core/node` additionally exports Node frontier preparation/comparison adapters. Portable Tooling registers `compare-source-frontiers` with the common alias `compare`; default CLI output is a bounded human/LLM projection and `--full` returns the complete machine receipt.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: host adoption beyond the shared Core/CLI surface remains Anchor/owning-lane responsibility.

- exact-invocation-contract
  - Transfer Kind: work
  - Description: exact supported CLI forms are: package/package — `node tools/tiinex-portable.mjs compare --left-kind handoff-package --left <left.handoff-package.zip> --right-kind handoff-package --right <right.handoff-package.zip>`; local Workspace/package — `node tools/tiinex-portable.mjs compare --left-kind local-workspace --left <workspace-root> --left-id core --right-kind handoff-package --right <carrier.zip> --right-select core`; local/local — `node tools/tiinex-portable.mjs compare --left-kind local-workspace --left <left-root> --left-id core --right-kind local-workspace --right <right-root> --right-id core`; local multi-Workspace/package — `node tools/tiinex-portable.mjs compare --left-kind local-frontier --left-roots core=<core-root>,docs=<docs-root> --right-kind handoff-package --right <carrier.zip> --right-select core,docs`; child-return three-way — `node tools/tiinex-portable.mjs compare --base-kind handoff-package --base <child-input.zip> --base-select core --incoming-kind handoff-package --incoming <child-return.zip> --incoming-select core --current-kind local-workspace --current <current-core-root> --current-id core`. Programmatic entrypoints are `comparePortableSourceFrontiers` / `reconcilePortableSourceFrontiers` from `@tiinex/core` and `compareNodeSourceFrontiers` / `prepareNodeSourceFrontier` from `@tiinex/core/node`.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: every Node input kind is explicit and never guessed from a path.

- bounded-source-delta
  - Transfer Kind: work
  - Description: dogfood comparison of the received Anchor carrier Core snapshot against the implemented local Core source reports 13 implementation changes before this return Handoff itself: four additions (`src/tooling/portable/comparison/sourceFrontierComparison.js`, `src/tooling/portable/adapters/node/sourceFrontierComparison.js`, `src/tooling/portable/adapters/cli/cli.source-frontier-comparison.js`, `test/source-frontier-comparison.test.mjs`) and nine edits (`package.json`, `src/public/index.js`, `src/public/node.js`, `src/tooling/portable/index.js`, `src/tooling/portable/operation.catalog.js`, `src/tooling/portable/adapters/cli/cli.command-input.js`, `src/tooling/portable/adapters/cli/cli.common-output.js`, `src/tooling/portable/adapters/cli/cli.help.js`, `src/tooling/portable/adapters/cli/cli.run.js`).
  - Controlling Artifact: [Inbound comparison Handoff](002-source-frontier-comparison-tooling-to-loom.trace.md)
  - Boundary: Docs and Business remained read-only; no sibling Workspace source was mutated.

- qualification-evidence
  - Transfer Kind: work
  - Description: `node --test test/source-frontier-comparison.test.mjs` passes 8/8; `npm test` passes 65/65; `npm run test:portable` passes; `npm run test:bootstrap` returns `embedded-qualified` with 488 runtime files / 5,339,323 bytes; `npm pack --dry-run` succeeds for `@tiinex/core@0.1.1`. The focused suite covers exact fast-path equality, add/remove/change deltas, multi-Workspace asymmetry, all four three-way classifications, manufacture exclusions/symlink policy, package/package + local/package + local-frontier/package inputs, invalid carrier/input fail-closed behavior, sealed non-disclosure, authorized-open package correlation and actual Node three-way shape.
  - Controlling Artifact: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Boundary: local qualification evidence does not itself authorize integration, publication or downstream host adoption.

- actual-child-return-reconciliation-proof
  - Transfer Kind: work
  - Description: the newly implemented common `compare` CLI was run on the real return shape with the received Anchor carrier as `base`, the manufactured Loom return carrier as `incoming`, and the implemented local Core Workspace as `current`; it reports 14 `same-result-concurrent` paths, 0 `incoming-only`, 0 `current-only`, 0 conflict candidates, zero findings, and identical incoming/current snapshot fingerprints. This includes the return Handoff itself plus the 13 implementation files.
  - Controlling Artifact: [Inbound comparison Handoff](002-source-frontier-comparison-tooling-to-loom.trace.md)
  - Boundary: this proves exact source reconciliation only; Anchor still owns semantic review and acceptance.

- return-carrier-cold-proof
  - Transfer Kind: work
  - Description: common `handoff` manufacture against the received carrier qualifies with one complete carried Core Workspace, required closure ready, valid package/closure/carrier/pointer/cold-entry/roundtrip/bootstrap checks and zero findings. The candidate carrier was then cold-started from its own declared embedded bootstrap bytes; orientation was clean and exact-pointer grounding with explicit holder Role `Anchor` reached `grounded-to-act`, with declared Parent continuity resolving to `business/.topics/001-tiinex.trace.md`, no blocking continuity issues and no actionable findings.
  - Controlling Artifact: [Inbound comparison Handoff](002-source-frontier-comparison-tooling-to-loom.trace.md)
  - Boundary: package/cold-ground evidence establishes transport readiness, not Anchor acceptance or publication authority.

## Required Context

- core-workspace
  - Material: complete changed Core source containing the source-frontier comparison implementation, adapters, public/CLI integration and focused tests.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: returned implementation Workspace and exact source under Anchor reconciliation.
  - Availability: available

## Reference Context

- docs-workspace
  - Material: canonical Docs semantics carried from the received package parent.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only semantic authority for Workspace/Handoff/package/External Payload and Secure Transport boundaries.
  - Availability: available

- business-workspace
  - Material: Anchor/Loom Role and controlling Turn-2 continuity carried from the received package parent.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only role/scope and integration authority.
  - Availability: available

- controlling-task
  - Material: [Source frontier comparison and reconciliation receipts](../001-1-source-frontier-comparison-and-reconciliation-receipts.trace.md)
  - Purpose: exact implementation Done Criteria and non-goals.
  - Availability: available

- inbound-anchor-handoff
  - Material: [Source frontier comparison Tooling → Loom](002-source-frontier-comparison-tooling-to-loom.trace.md)
  - Purpose: exact transferred scope, exclusions and return expectation.
  - Availability: available

## Retained Responsibilities

- integration-and-acceptance
  - Retained By: Refactor Anchor
  - Responsibility: three-way reconcile this returned Core source against the exact child input and Anchor's current Core frontier, independently qualify the result and decide whether it becomes current.
  - Boundary: Loom qualification and byte-comparison receipts do not auto-accept the work.

- host-adoption
  - Retained By: Refactor Anchor / later owning lanes
  - Responsibility: decide extension-vscode/runtime/other host adoption and operator UX beyond the shared Core/public/CLI surface.
  - Boundary: no sibling host Workspace source was changed here.

- semantic-expansion
  - Retained By: Axiom / Docs semantic authority
  - Responsibility: qualify any future semantic diff, merge-disposition or authority interpretation separately if ever needed.
  - Boundary: this source comparator intentionally carries no semantic inference.

## Exclusions And Dependencies

- automatic-merge
  - Kind: excluded-scope
  - Description: no merge, winner selection, landing, staging, commit, push or source mutation is implemented.
  - Responsible Party Or Role: Refactor Anchor / future separately scoped Tooling.

- semantic-diff
  - Kind: excluded-scope
  - Description: byte/path equality or difference does not establish semantic equivalence, incompatibility, Parent meaning, Task completion, authority or acceptance.
  - Responsible Party Or Role: Axiom / future separately qualified semantic work.

- remote-source-acquisition
  - Kind: excluded-scope
  - Description: comparison never fetches GitHub or other remote source and never treats remote latest state as source authority.
  - Responsible Party Or Role: host/operator source acquisition boundary.

- sealed-credential-acquisition
  - Kind: excluded-scope
  - Description: comparison does not prompt for, persist or derive passwords and does not bypass the existing explicit Secure Transport V1 open operation.
  - Responsible Party Or Role: authorized caller/host boundary.

- publication
  - Kind: excluded-scope
  - Description: no npm, GitHub or other remote publication/mutation occurred.
  - Responsible Party Or Role: Refactor Anchor / Sigma after later qualification.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: reconcile this exact changed Core source using the returned comparison capability itself; if accepted, continue downstream Tooling/host progression under Anchor-owned scope.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: exact source bytes establish semantic truth or acceptance; changed bytes imply semantic conflict; a `conflict-candidate` is a merge decision; locked Workspace contents were inspected; or local package paths confer Workspace identity without qualification.
- Must Not Be Used To Claim: automatic integration, remote source authority, protected filename disclosure while locked, or compact-summary completeness when the full machine receipt is available.
- Authority Limits: bounded Core source-frontier comparison implementation and qualification under the controlling Task only.
- Security Boundary: sealed/locked Workspace comparison remains opaque unless the caller supplies an already-authorized open result correlated to the exact package binding.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-source-frontier-comparison-tooling-to-loom.trace.md](002-source-frontier-comparison-tooling-to-loom.trace.md)
  - Value: Jo-22Gzqm5_QqCYC3C1s0X3qTOjwH2uSEPch1UPF2-E

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: M9qsSxpDuMyWIQmrKPn3hB-GPfUN3ZiXAsnPVUJtdj0