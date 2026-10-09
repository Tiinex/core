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
  - Created At: 2026-10-09 12:11:53
  - Authors: Anchor
  - Why: Preserve exact implementation claims and test outcomes before a cold Anchor continuation or Sigma decision.
  - Summary: Path-neutral Semantic Package Transition registry and separately bounded typed .topics candidates tested with explicit attachment and negative safety boundaries.
  - Status: ready/local

---

# Core Bounded Topics Discovery And Transition Registry Qualification

## Supported Claim Or Question

- Supported Claim Or Question: Can an explicitly selected Workspace discover schema-typed Transition artifacts across its own `.topics` tree, and can a Semantic Package register those transitions independent of `.transitions` path segments while keeping attachment, applicability and execution separate?
- Evidence Role: supports an implemented, bounded Core candidate-discovery and type-based package registration improvement; not a claim that Save as Transition or Windows UI is already implemented.
- Review Context: Native's accepted `002-recursive-registered-discovery-surface-convention-decision.trace.md` distinguishes general schema-typed `.topics` discovery from registered dot-surface composition. Previously `semantic.package.graph.js` required `.transitions` path during package-local auto-registry.

## Provenance

- Known Source: Core's `src/tooling/portable/package/semantic.package.graph.js`, `semantic.package.js`, `adapters/node/workspaceArtifact.discovery.js`, `src/public/node.js` and `test/workspace-artifact-discovery.test.mjs`, `test/transition-catalog.test.mjs` together with the qualified owner Native Transition and Semantic Package schemas.
- Preservation Basis: exact local Core source and tests are carried byte-for-byte as a qualified owner Workspace in this Tiinex carrier. Native/Docs schema bytes are unchanged.
- Provenance Limits: Core tests exercise JavaScript and bounded temporary Workspace trees, not installed Windows VS Code. Workspace scanner returns candidates only, never independently validates schema integrity/currentness or promotes Context applicability.

## Evidence Material

- path-neutral-semantic-registry
  - Material: `src/tooling/portable/package/semantic.package.graph.js` and `semantic.package.js`.
  - Material Kind: source-correction and executable contract tests
  - Description: Package-local Transition collection now uses `isTransitionArtifact` inside the qualified package boundary rather than a `.transitions` pathname whitelist. Discovery provenance names artifact type, not storage convention. Four allowed layouts and an unselected nested Semantic Package case pass.
  - Material Provenance: Core Transition catalog tests, using Native compiled schemas and actual package manifest/companion projections.
  - Material Limits: Moving a definition still requires exact relative references and corresponding local physical source locator to move consistently. This work does not implement Move/Rebase or silently repair stale links.
- bounded-workspace-type-index
  - Material: `src/tooling/portable/adapters/node/workspaceArtifact.discovery.js` exported via `@tiinex/core/node` and package Node entry.
  - Material Kind: candidate-only Workspace source discovery
  - Description: Only the selected root's `.topics` tree is enumerated. Candidate `.trace.md` material is classified through existing portable schema parsing, including ordinary Process directories and unknown dot directories; `.git/.vscode/.idea/node_modules`, symlinks, non-Markdown assets and material outside `.topics` are excluded. Explicit directory/file/bytes limits fail closed.
  - Material Provenance: four workspace scanner and catalog adapter tests plus exact Native/Core/VS Code local sample measurements.
  - Material Limits: a detected schema ID is not proof of valid artifact integrity, active Package participation or applicable Transition defaults. Existing registered content-source import remains a separate, unchanged mechanism.
- exact-companion-and-generation
  - Material: `test/transition-catalog.test.mjs` qualified neighboring Transition fixtures with relocated definition/companion references and exact source locators.
  - Material Kind: executable positive and negative applicability tests
  - Description: A referenced Transition relocated to an ordinary Process or other safe dot directory still yields explicit Schema Transition Companion attachment and qualified generation defaults when all relative references are updated. Output continues to mark execution unauthorized and applicability not evaluated.
  - Material Provenance: genuine Core transition neighborhood, generation binding and Native contract.
  - Material Limits: this does not establish a Process reference as implicit global preset, and does not create a Transition Definition.
- measured-workspace-enumeration
  - Material: Three consecutive Node timings on carried Native, VS Code and Core `.topics` trees.
  - Material Kind: bounded local performance sample
  - Description: Native 61 candidate artifacts across 152 directories 444.0/241.8/121.8 ms; VS Code 116 artifacts across 19 directories 599.6/277.3/328.1 ms; Core 36 artifacts across 12 directories 96.7/90.4/53 ms. Sample shows bounded scans, not meaningful p95 or Windows latency.
  - Material Provenance: local runtime Node execution of exact portable Workspace scanner.
  - Material Limits: no cold/warm p95 claim, no cache strategy finalized and no assurance that large real Workspaces are equally fast.

## Preservation And Fidelity

- Preservation State: test and production code retained in the Core owner Workspace without altering Native schema meaning or VS Code domain logic.
- Fidelity Notes: exact source identity from SHA-256 and relative path; candidates remain distinct representations even when labels match. Competing Transition identifiers are not silently collapsed during Core discovery.
- Known Losses: host integration, large Workspace cache/refresh strategy, real Evidence authoring Transition and Transition Definition Core renderer remain incomplete.

## Interpretation Limits

- Does Not Prove: complete `.topics` candidate qualification across every host, installed Windows extension or Save as Transition usability.
- Not Yet Used As: Sigma final acceptance or a new v2 schema.
- Must Not Be Treated As: license to promote discovered files into Semantic Packages, infer a schema companion from folder placement, or treat a raw discovered candidate as executable.
- Need For Review: Native/Core must first qualify an authorable Transition Definition and Companion creation contract; preserve the new Core scanner and wrapper rather than duplicating behavior in operatorTrees. Finish broader host and regression gates prior to Sigma.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md](001-unify-scoped-topics-discovery-with-qualified-transition-applicab.trace.md)
  - Value: 7M0tZMnFNoeGVnlykysrqjU6eVrhr8rjIO-F_INgiLM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: g3sgBzr4yDKxdcW736Rf4xrLeHJ_fjDAHQYdqJRTWs8