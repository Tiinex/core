# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 11:43:37
  - Trace: [001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
  - Origin:
    - [relative](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 17:18:08
  - Authors: Anchor
  - Why: Evidence for safer deferred Attach to Form workflow before Windows Sigma acceptance.
  - Summary: Core allocation of prospective lineage and one journaled artifact+asset create, crash recovery, host and browser verification.
  - Status: ready/local

---

# Atomic Core Artifact And Ordinary Attachment Creation Verification

## Supported Claim Or Question

- Supported Claim Or Question: Can a pending ordinary-file attachment use the actual Core-projected artifact lineage at Create and become one durable atomic commit, rather than asking for a guessed coordinate and relocating the source before artifact creation?
- Evidence Role: supports local Core transaction implementation, honest Webview projection and fail-closed recovery. It is not installed Windows Sigma acceptance.

## Provenance

- Known Source: Core `src/tooling/portable/lineage/asset.relocation.projection.js`, Node `asset.relocation.inspect.js`, `lineage.maintenance.apply.js`, `lineage.maintenance.transaction.js`; VS Code `src/core/deferredFormAttachment.ts`, `src/vscode/deferredFormTransaction.ts`, `attachFileToForm.ts`, `lineageMaintenance.ts`, `operatorTrees.ts` and `artifactAuthoringPanel.ts`.
- Preservation Basis: modified source, six atomic Core tests, VS Code tests, temporary-Workspace integration and Chromium browser receipt are transported in the 17-Workspace canonical Tiinex carrier.
- Provenance Limits: local Node 22/Core and generated-browser-webview tests, not a full dependency-backed Windows VS Code extension build; no remote provider mutation.

## Evidence Material

- atomic-created-artifact-and-file
  - Material: [`test/asset-authoring-atomic.test.mjs`](../../../test/asset-authoring-atomic.test.mjs) and [full Core regression receipt](atomic-attachment-verification/001-core-atomic-regression-00.log)
  - Material Kind: real Node Core transaction regression, 6 positive/negative subtests
  - Description: Core asset inspection accepts a separately qualified, self-sealed prospective artifact as a new output in the same transaction as ordinary file relocation and existing supported Markdown reference rebinding. Checks exact sha256 and before/after fingerprints; journal treats creation as a new output with no pre-existing backup. Two assets receive one allocated numeric dimension and suffixes 01/02. No file is moved at Attach or Preview.
  - Material Provenance: temporary physical Workspace, exact source bytes, Core Node inspector and durable transaction apply.
  - Material Limits: does not support arbitrary opaque/proprietary binary references, text-file relocation, unqualified semantic Parent or external file sources.
- physical-crash-and-rollback
  - Material: [focused host-Core integration receipt](atomic-attachment-verification/001-host-core-journal-integration-02.log)
  - Material Kind: actual filesystem mutation, injected error and process-crash recovery
  - Description: On injected failure at prepared, sources-staged and outputs-written phases, Core rollback restores the exact original PNG and deletes the newly created artifact and output PNG. A separate Node child exits the process after writing outputs; next-process `recoverPortableLineageMaintenanceTransactions` restores original bytes and removes incomplete outputs and lock.
  - Material Provenance: source-owned Core test suite, actual fresh temporary directories, durable journal and recovery code.
  - Material Limits: filesystem and OS durability semantics are tested on this host, not a production Windows power failure.
- deferred-host-form-authoring
  - Material: [VS Code authoring host regression](atomic-attachment-verification/001-host-authoring-regression-01.log) and [Core host callback receipt](atomic-attachment-verification/001-host-core-journal-integration-02.log)
  - Material Kind: actual transpiled VS Code source behavior using source-owned callback tests
  - Description: Attach to Form Yes records an existing Workspace-relative link as pending, without asking for a dimension or moving source bytes. At Preview/Create the same Core artifact draft allocates the prospective coordinate, Core inspects exact assets, the form input values are rebound to projected PNG filenames and a new self-verified artifact draft is computed. Create requires user review, applies one Core journaled transaction for artifact and attachments, then hydrates a nonclosing form with the committed links. Removing a link before Create excludes its pending move.
  - Material Provenance: `test/deferredFormTransaction.integration.cjs`, `test/deferredFormAttachment.test.cjs`, `test/lineageMaintenance.integration.cjs`, Node/TypeScript source.
  - Material Limits: local form preview does not move files; changing title/Parent between preparation and Apply may fail a stale plan and require user retry. External/nonlocal Workspaces still fail closed.
- chromium-generated-webview
  - Material: [Chromium real generated Evidence webview check](atomic-attachment-verification/001-chromium-deferred-attachment-06.log)
  - Material Kind: browser-driven interaction with generated HTML/JavaScript
  - Description: A deferred file attaches to the actual repeatable Evidence Material input; the operator sees a human-readable pending message. A committed-references event updates the field without destroying a pre-existing link. The rendered form sends the new reference through Preview with busy-state disabled controls and no JavaScript errors.
  - Material Provenance: real generated `tiinex.evidence.v1` host form from Core authoring model; Chromium in headless mode, DOM clicked/edited, source-owning script executed.
  - Material Limits: browser simulates extension messaging but not Windows VS Code native Webview IPC or installed extension activation.
- cross-owner-qualification
  - Material: [Docs and Native schema check](atomic-attachment-verification/001-schema-check-03.json), [Interop OpenAI receipt](atomic-attachment-verification/001-interop-openai-04.log), [VS Code release audit](atomic-attachment-verification/001-vscode-release-audit-05.log)
  - Material Kind: schema consistency and release-surface tests
  - Description: Native/Docs unchanged, schema-check ready with zero findings; Interop OpenAI 4/4 PASS, VS Code release audit ready. GIF presentation sources remain removed and two cropped PNGs retained without LFS.
  - Material Provenance: qualified local source roots and actual test commands.
  - Material Limits: release-audit is not a Windows `tsc` PASS.

## Preservation And Fidelity

- Preservation State: source bytes and small textual logs are retained in qualified Core owner Workspace; original test PNGs remain temporary and are not shipped as redundant binary evidence.
- Fidelity Notes: the schema ID of Evidence remains `tiinex.evidence.v1`; the file relocation contract remains local-only and requires complete source/reference coverage. Names are assigned from the actual projected artifact path. No Git history rewrite or animated-GIF regression.
- Known Losses: proprietary binary references, true integrated VS Code Windows runtime, cross-Workspace move and full npm-backed host compilation remain outside proven scope.

## Interpretation Limits

- Does Not Prove: arbitrary references can be safely rebound, user-approved Apply can bypass Core qualification, Windows GUI acceptance or complete release readiness.
- Not Yet Used As: final Sigma accept/disposition until first real Windows build, Explorer actions and full Evidence create/reopen succeed.
- Must Not Be Treated As: authority to infer a new Semantic Parent from asset filenames or to rewrite unrelated user fields.
- Need For Review: one Windows Sigma scenario, strict abort on build error and a short silent video showing original source remains until committed Create, 01/02 attachment filenames and final links in generated Evidence.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
  - Value: 7M0tZMnFNoeGVnlykysrqjU6eVrhr8rjIO-F_INgiLM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: D2R6CNiruiqVRGkX5QnTNHtYatjlhTfr1FNGC0XrWOI