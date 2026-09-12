# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 23:25:38
  - Trace: [001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md](../001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Origin:
    - [relative](../001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-11 23:52:25
  - Authors: Loom
  - Why: Preserve exact implementation, policy-alignment, regression, validation, renderer-audit, and historical-debt evidence for the bounded Loom return.
  - Summary: Qualification evidence for exact canonical schema-reference authoring, portable renderer hygiene, diagnostic alignment, validation, and historical-debt disposition.
  - Status: ready/local

---

# Core Major 004 Canonical Schema Reference Authoring And Renderer Hygiene Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can shared Core generation stop emitting mixed bare/exact schema references when qualified immutable canonical authority exists, while preserving truthful local/unpublished references and avoiding fabricated publication claims
- Evidence Role: qualifies the bounded Core Major 004 implementation, portable-renderer audit, diagnostic alignment, historical-debt disposition, and full validation requested by the Anchor to Loom Handoff

## Provenance

- Known Source: exact Core, Business, Docs, and extension-vscode Workspaces materialized from the received qualified Handoff carrier through Tiinex; Core was writable and the other Workspaces were read-only context
- Preservation Basis: exact carried source bytes, Start-qualified bootstrap bytes, deterministic local Core validation, read-only Tiinex source-frontier comparison, and editor-assistance projections over carried historical artifacts
- Provenance Limits: no network lookup, Docs mutation, extension-vscode mutation, historical artifact rewrite, publication, push, release, or deployment was performed
- Canonical Policy Basis: carried Docs Root policy requires an immutable canonical locator for a different already-published schema representation when available, while allowing truthful local/relative references for local or unpublished schema material and forbidding fabrication of a future immutable locator
- Root Material Identity: carried Core Root semantic material and carried Docs `.topics/.schemas/tiinex.root.v1.schema.md` are byte-identical at sha256 `4ec6d17ef55f51c2305ede8e2f22c8c4a9324c478489114adb86a33664d4d156` and Git blob `0162368365b452ea134b71bf52ced7554a7c5abc`
- Root Immutable Target: `https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md`
- Remote Mutation: none

## Evidence Material

- Material Kind: shared schema-reference authority mechanics, common renderer output, portable Pointer output, editor diagnostic behavior, portable-renderer audit, historical-debt inventory, focused regressions, full Core validation, bootstrap qualification, and source-frontier comparison
- Material: patched Core source/test bytes plus deterministic local receipts produced from the carried Workspaces
- Shared Reference Repair: Root keeps its existing accepted local runtime publication state but now separately declares `schemaReferencePublicationState: published-immutable-canonical`; reference qualification requires the exact immutable GitHub provider tuple, qualified semantic material, exact binding checksum, and exact Git-blob identity before that target can become creation reference authority
- No Fabrication Boundary: the ordinary local/unpublished `tiinex.evidence.v1` Current schema remains `schema-id-only` with unavailable immutable target authority; the repair does not promote local/unpublished schemas merely because another reference in the same artifact is published
- Common Authoring Result: `tiinex.task.v1` creation now renders exact immutable Root and exact immutable Task schema targets through the shared creation contract and renderer instead of bare Root plus exact Current
- Diagnostic Alignment: `portable.editor.schema-reference.canonical-target-available` now warns on a bare schema id only when the shared registered schema-reference authority actually resolves to a qualified immutable target; local/unpublished Current ids no longer receive a false canonical-target-available warning
- Portable Pointer Repair: package-root Handoff route Pointers now obtain the Root reference from the same shared registered authority and render the exact immutable Root target next to the exact Pointer target
- Portable Audit: no remaining bare Root envelope renderer exists in portable source after the Pointer repair
- Local Draft Exception: `draft.create.js` intentionally uses truthful draft-local relative schema locators because it creates local drafts from explicitly supplied readable schema material and must not claim immutable publication
- Secure Transport Exception: `transportEnvelopeV1.js` intentionally retains plain `tiinex.transport.envelope.v1` Current schema because no published immutable canonical locator is qualified; existing secure-transport regression forbids replacing it with a mutable branch/latest locator
- Focused Regression: `node --test test/lineage-safety-hardening.test.mjs` passed 10/10, including exact common Root rendering, local/unpublished diagnostic behavior, portable Pointer rendering, Parent authority recovery, malformed locator rejection, sibling allocation, and carrier collision safety
- Full Core Regression: `npm test` passed 83/83
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified` with manifest sha256 `aab7e63890cb8dbd7764ccc69b2d6e451d43f91dddae7bd3cc5e223c73d336ef`, representation sha256 `0c3e908402d094a10a00ec28fcbe384574750926782d4c0d9117f41beda4193d`, 490 runtime files, and 5,363,539 runtime bytes
- Implementation Source Frontier: before adding qualification artifacts, Tiinex two-way comparison against the received Core snapshot was clean with 8 byte-changed implementation/test paths, 0 additions, 0 removals, and 0 findings

## Preservation And Fidelity

- Preservation State: existing semantic publication state and local/unpublished runtime behavior remain intact; only schema-reference publication authority is separated and qualified for the Root representation already backed by exact immutable Docs material
- Fidelity Notes: immutable reference authority is byte-bound and provider-bound; local/unpublished references remain local/bare unless an independently qualified immutable target exists, and portable bounded exceptions are documented instead of normalized away
- Historical Inventory: a carried read-only scan found 215 trace artifacts across Core, Business, Docs, and extension-vscode with at least one plain schema-id field alongside an exact commit-pinned schema locator; 32 are in Core, 90 in Business, 16 in Docs, and 77 in extension-vscode
- Recent Core Debt: editor projection confirms the preceding historical Parent-recovery Task/return, Major-003 Task/Evidence/return, and the received Major-004 Task/Handoff each remain degraded specifically at line 3 `Envelope Schema`
- Historical Disposition: those artifacts remain unchanged historical bytes; future correction, if semantically necessary, should be represented as a new continuation/correction artifact rather than an in-place mass rewrite that would invalidate continuity integrity and historical identity
- Acceptance Proof: new common-authored output uses the repaired shared Root authority, while the editor diagnostic remains active for historical mixed Root references and does not warn for a truthful local/unpublished Current schema without canonical target authority
- Known Losses: none in the bounded Core implementation; historical debt remains visible by design rather than being rewritten

## Interpretation Limits

- Does Not Prove: that every historical artifact should be corrected, that unpublished schemas have immutable canonical publication targets, or that mutable/latest URLs can substitute for commit-pinned authority
- Not Yet Used As: authority to rewrite historical artifacts, mutate Docs or extension-vscode, publish Core, push commits, perform a release, or claim downstream host adoption
- Does Prove: shared Core generation and shared editor diagnostics now use the same qualified-reference boundary for registered schemas, common Task rendering no longer creates the known mixed Root state, and portable Handoff-route Pointer generation no longer hardcodes a bare Root id
- Must Not Be Treated As: a Docs semantic change, a host-specific VS Code repair, acceptance of historical debt as canonical style, or permission for remote mutation
- Authority Limits: Core common authoring/rendering, portable generated artifact schema-reference hygiene, editor-assistance diagnostic alignment, tests, and bounded local qualification evidence only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md](../001-3-6-4-2-core-major-004-canonical-schema-reference-authoring-renderer-hygiene-task.trace.md)
  - Value: lFIazLC0k9EQnSrTOQonRxpYDIf0MXH6pw8ShVeCfG0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 42zXMlr5sKuuJYLhvHktWgwMsimGVQ8K3yA3cs1yMBI