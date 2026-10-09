# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-09 12:11:51
  - Trace: [001-1-qualify-portable-transition-definition-and-companion-creation-co.trace.md](001-1-qualify-portable-transition-definition-and-companion-creation-co.trace.md)
  - Origin:
    - [relative](001-1-qualify-portable-transition-definition-and-companion-creation-co.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-10-09 15:35:01
  - Authors: Anchor
  - Why: Preserve exact qualified proof before Sigma Windows acceptance rather than requiring user debugging.
  - Summary: Real Transition Definition/Companion creation plus nested generated-webview browser-to-Core tests and full Core/VS Code/Interop regressions.
  - Status: ready/local

---

# Core Transition-v1 Authoring And Browser-to-Markdown Qualification

## Supported Claim Or Question

- Supported Claim Or Question: Does the actual portable Core creation contract accept valid minimal and nested Transition Definition/Companion inputs, and does the generated VS Code form preserve the same structured values through Chromium interactions, host callbacks, sealed Markdown and validation?
- Evidence Role: supports tested portable Core and local VS Code browser/host integration, with explicit Windows host limitations.
- Review Context: Both Transition Definition and Schema Transition Companion were previously `creation.renderer.missing`, although schemas existed. The fix is a **generic Core authoring projection**, not a host-owned special renderer or a schema-v2.

## Provenance

- Known Source: qualified Native/Docs Transition-v1 schemas; local Core/VS Code source, Core creation/validation/schema-sync/test receipts and Chromium Playwright interactions with the actual generated extension webviews.
- Preservation Basis: all code, receipts, two exact browser payloads and their corresponding rendered Markdown are carried in this owner Core Workspace via the canonical Handoff carrier.
- Provenance Limits: Chromium simulates VS Code message transport, not installed Windows VS Code. Full npm-backed TypeScript build, Windows Explorer activation and user-specific filesystem permission cases remain the explicit Sigma gate.

## Evidence Material

- full-core-regression
  - Material: [Full Core regression](transition-acceptance-verification/001-transition-core-full-01.log)
  - Material Kind: executable Core test receipt
  - Description: 552 PASS, 0 FAIL, 1 SKIP against carried Native/Business schema sources. Core Transition-v1 generic creation, renderer and execution-snapshot preservation includes a negative semantic-currentness case.
  - Material Provenance: `node --import test/helpers/runtime-content.bootstrap.mjs --test --test-concurrency=4 test/*.test.mjs` on this carried Core checkout.
  - Material Limits: one explicit pre-existing skip; Node validation does not certify installed Windows host.
- browser-host-source-regression
  - Material: [VS Code host regression](transition-acceptance-verification/001-transition-vscode-host-02.log)
  - Material Kind: source-owned host test receipt
  - Description: 192 individually completed host checks against transpiled current extension source and qualified Core/Native, including new Transition/Companion composite-form contract projection.
  - Material Provenance: actual VS Code source transpilation and `test/run.mjs`; no additional host-owned schema rules.
  - Material Limits: full dependency-backed TypeScript `tsc` and Windows build still unverified.
- chromium-preview-and-second-form
  - Material: [Chromium real-webview interaction transcript](transition-acceptance-verification/001-transition-chromium-05.log)
  - Material Kind: manual Chromium UI behavior replay
  - Description: Two composite sections contain four independent nested repeatables, each supports None/Add and unique named entries; a real Preview captures nested structured payloads while controls are frozen and late file attachment is ignored; a partial Evidence authoring form opens Save as Transition without requiring Evidence creation. No page errors observed.
  - Material Provenance: Chromium headless executing generated webview HTML from production VS Code source and mocked `acquireVsCodeApi` message bridge.
  - Material Limits: user interface driver is simulated, not a Windows extension-host invocation.
- core-roundtrip-minimal
  - Material: [Minimal Transition from browser payload](transition-acceptance-verification/001-transition-browser-created-minimal-11.trace.md)
  - Material Kind: actual Core-rendered self-sealed artifact
  - Description: Actual Chromium Preview values rendered by the real Transition Definition Core contract, integrity-checked, exactly schema-validated and read back with explicit `none` for nested declaration sections.
  - Material Provenance: [Captured minimal browser input](transition-acceptance-verification/001-transition-browser-payload-minimal-09.json) and qualified Core creation/validation receipt.
  - Material Limits: synthetic user field values, not an authorized reusable operational Transition for a real Process.
- core-roundtrip-nested
  - Material: [Nested Transition from browser payload](transition-acceptance-verification/001-transition-browser-created-nested-12.trace.md)
  - Material Kind: actual Core-rendered self-sealed artifact
  - Description: `Placement Intent → Destination Bindings` independently preserves a named record with its own Meaning while Output Placements and other parts remain explicitly none. Core accepted the exact UI-shaped payload and validated the generated artifact.
  - Material Provenance: [Captured nested browser input](transition-acceptance-verification/001-transition-browser-payload-nested-10.json) and Core materialization verification.
  - Material Limits: does not imply Process applicability, an authorized generation binding or an automatically reusable Evidence preset.
- crossdomain-negative-boundaries
  - Material: [Core Move/Rebase + Transition 54 tests](transition-acceptance-verification/001-transition-targeted-crossdomain-04.log)
  - Material Kind: focused positive/negative regression
  - Description: 54 PASS and no failures across move/rebase, asset-reference rebind, lineage and Transition creation. A semantically unresolved Transition cannot be promoted to qualified merely by producing syntactically plausible Markdown.
  - Material Provenance: real portable Core tests and local Native/Business source.
  - Material Limits: opaque/binary Move/Rebase formats, Windows host UI and arbitrary external paths are outside the supported proof.
- source-and-transport-qualification
  - Material: [Schema currentness](transition-acceptance-verification/001-transition-schema-check-07.json)
  - Material Kind: Docs/Native schema qualification
  - Description: Source-owned local v1 schemas sync, `schemas-check` ready, 0 error/warning. Interop OpenAI tests 4/4 PASS; VS Code release audit ready with no reported warnings.
  - Material Provenance: qualified current Docs/Native and [Interop tests](transition-acceptance-verification/001-transition-interop-03.log).
  - Material Limits: local unpublished schema revisions are not remote GitHub publication; do not invent permalink.

## Preservation And Fidelity

- Preservation State: source, test receipts, exact browser payloads and created Transition Markdown are included in Core's fully transported Workspace.
- Fidelity Notes: the same nested JS values used in Chromium Preview were sent unchanged to Core; the generic renderer preserves declaration semantics without inventing roles, conditions or Transition execution authority.
- Known Losses: no real Windows extension `tsc` compilation, no installed Windows Explorer integration test, no generation binding/companion auto-attachment proof for Evidence-specific presets.

## Interpretation Limits

- Does Not Prove: final Sigma Windows acceptance, fully automatic Evidence Transition presets, arbitrary Move/Rebase references or CLI/LLM Native Surface parity.
- Not Yet Used As: launch clearance or claims of remote published schema source.
- Must Not Be Treated As: permission to expose an unqualified Transition as executable or to fabricate missing generation/Process context.
- Need For Review: Sigma Windows should Build+Reload first, then run a contiguous Evidence → Save as Transition → Transition Definition/Companion → Move/Rebase → Handoff/Outgoing session. If Build fails, stop with the error rather than debugging interactively.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-qualify-portable-transition-definition-and-companion-creation-co.trace.md](001-1-qualify-portable-transition-definition-and-companion-creation-co.trace.md)
  - Value: aJeR7E4drDo6ykbKI7IfitcCRZYOeys1Gf1BUvSabgY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: kN2F20v72bV4cCqLlI3EJMLC6i6krP4cvBQLRCBo2Ek