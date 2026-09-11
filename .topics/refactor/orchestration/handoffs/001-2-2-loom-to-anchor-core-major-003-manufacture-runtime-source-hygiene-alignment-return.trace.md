# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 19:59:25
  - Trace: [001-2-1-anchor-to-loom-core-major-003-manufacture-runtime-source-hygiene-alignment-handoff.trace.md](001-2-1-anchor-to-loom-core-major-003-manufacture-runtime-source-hygiene-alignment-handoff.trace.md)
  - Origin:
    - [relative](001-2-1-anchor-to-loom-core-major-003-manufacture-runtime-source-hygiene-alignment-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 20:21:28
  - Authors: Loom
  - Why: The bounded Core repair is complete and qualified; Anchor now needs the exact mechanics result and the remaining host-owned adoption boundary.
  - Summary: Return the bounded Core runtime/source alignment repair, exact qualification evidence, and explicit read-only host-owner disposition to Anchor.
  - Status: ready/local

---

# Loom to Anchor — Core Major 003 Manufacture Runtime And Source Hygiene Alignment Return

## Handoff Parties

- Purpose: return the bounded Core runtime/source alignment repair, exact qualification evidence, and explicit host-owner disposition to Anchor without mutating extension-vscode, Business, or Docs.
- From: Loom
- From Kind: role
- From Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- core-runtime-source-alignment-repair
  - Transfer Kind: work
  - Description: Core manufacture now derives an exact Tooling runtime identity from the bootstrap dependency graph and, whenever the carried local Workspace has package identity `@tiinex/core`, rebuilds the Tooling source/data identity from that Workspace and requires exact equality before Handoff or pointerless Workspace manufacture can proceed. Matching package name/version alone is insufficient; release-only `package.json` normalization is separated from exact Tooling source/data equality, and full bootstrap representation identity remains exposed as evidence.
  - Controlling Artifact: [Core Major 003 Manufacture Runtime And Source Hygiene Alignment Qualification](../evidence/002-manufacture-runtime-source-hygiene-alignment-qualification.trace.md)
  - Boundary: Core portable manufacture/bootstrap/source-closure mechanics only; no extension-vscode mutation is included.
- host-owner-disposition
  - Transfer Kind: work
  - Description: exact carried read-only extension-vscode source proves Pack resolves and executes its installed `@tiinex/core` dependency; the carried lock pins 0.7.0, while current host binding verifies declaration/lock/installed version agreement but does not independently attest the installed Core file bytes against the simultaneously selected Core Workspace source. The historical full-pack carrier and historical installed node_modules bytes were not carried, so no claim is made about those unavailable bytes.
  - Controlling Artifact: [Core Major 003 Manufacture Runtime And Source Hygiene Alignment Qualification](../evidence/002-manufacture-runtime-source-hygiene-alignment-qualification.trace.md)
  - Boundary: any extension-vscode adoption, dependency update/rebuild, or host-side installed-byte attestation remains separate Anchor/Kodax work under separate authority.

## Required Context

- core-workspace
  - Material: complete current Core Workspace containing the bounded implementation, regression coverage, qualification Evidence, and this return Handoff.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact implementation/result source for Anchor review and integration.
  - Availability: available
- extension-vscode-workspace
  - Material: unchanged carried Extension VS Code Workspace containing the exact reviewed dependency declaration, lock, Core binding, bootstrap loader, and Pack manufacture call chain.
  - Material Reference: [Extension VS Code Workspace](extension-vscode::.topics/.workspaces/tiinex-extension-vscode.workspace.md)
  - Purpose: read-only host-owner context; no source mutation is transferred.
  - Availability: available
- business-workspace
  - Material: unchanged carried Business Workspace containing Anchor and Loom Role endpoints.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint Role authority.
  - Availability: available
- docs-workspace
  - Material: unchanged carried canonical Docs Workspace.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: canonical semantic-boundary context; no Docs change is transferred.
  - Availability: available

## Reference Context

- qualification-evidence
  - Material: exact source/runtime identity, host-loader inspection, fail-closed mismatch regression, hygiene preservation, complete Core validation, and source-frontier evidence.
  - Material Reference: [Core Major 003 Manufacture Runtime And Source Hygiene Alignment Qualification](../evidence/002-manufacture-runtime-source-hygiene-alignment-qualification.trace.md)
  - Purpose: bounded technical qualification of this return and its provenance limits.
  - Availability: available
- focused-regression
  - Material: `node --test test/manufacture-runtime-source-alignment.test.mjs test/manufacture-hygiene.test.mjs` passed 8/8, including same-name/version stale-runtime rejection and retained `.release`, `.outgoing-handoff-packages`, and `.vscode/link` exclusions.
  - Material Reference: [Runtime Source Alignment Tests](../../../../test/manufacture-runtime-source-alignment.test.mjs)
  - Purpose: focused regression coverage for exact runtime/source identity and manufacture hygiene.
  - Availability: available
- full-core-validation
  - Material: `npm test` passed 80/80; `npm run test:portable` passed; `npm run test:bootstrap` returned `embedded-qualified` with patched representation `51e59a86a69a6c962c79fa8288b39cd2423b8c399a687311df3c7c6b66d3ab51`, 490 runtime files, and 5,360,924 runtime bytes.
  - Material Reference: [package.json](../../../../package.json)
  - Purpose: complete Core regression, portable surface, and embedded-bootstrap qualification.
  - Availability: available

## Retained Responsibilities

- host-specific-adoption
  - Retained By: Anchor / Kodax when separately delegated
  - Responsibility: decide whether and how extension-vscode should update/install/rebuild against a Core package containing this repair and whether host-specific installed-byte attestation is additionally required.
  - Boundary: Loom deliberately did not modify extension-vscode or claim host adoption.
- integration
  - Retained By: Anchor
  - Responsibility: reconcile this bounded Core return into the current Core frontier and preserve the fail-closed runtime/source alignment contract in subsequent manufacture/release work.
  - Boundary: no automatic remote publication or host mutation is transferred.

## Exclusions And Dependencies

- extension-vscode-mutation
  - Kind: excluded-scope
  - Description: no extension-vscode source, lockfile, package installation, or UX/integration state was changed.
  - Responsible Party Or Role: Anchor / Kodax under separate authority.
- historical-byte-claim
  - Kind: excluded-scope
  - Description: the absent historical `tiinex-full-001.handoff-package.zip` internal bytes and historical installed `node_modules/@tiinex/core` file bytes were not reconstructed or inferred.
  - Responsible Party Or Role: external acquisition or separately qualified reproduction if later required.
- remote-publication
  - Kind: excluded-scope
  - Description: no GitHub push, npm publication, release, deployment, or other remote mutation was performed.
  - Responsible Party Or Role: Anchor under separate authority.

## Completion Expectation

- Signal Kind: none
- Signal Meaning: the bounded Loom Core implementation, exact qualification Evidence, and explicit host-owner disposition are returned; no further Loom completion signal is required unless Anchor creates a new explicit Handoff.

## Interpretation Limits

- Does Not Mean: the current extension-vscode host already executes this patched Core runtime, that the historical installed 0.7.0 bytes are known, or that lockfile integrity alone certifies installed runtime bytes.
- Must Not Be Used To Claim: extension-vscode acceptance, host adoption, npm release readiness, publication, deployment, or permission to weaken source-completeness/hygiene checks.
- Authority Limits: Core portable manufacture/bootstrap/source-closure mechanics only; Business, Docs, and extension-vscode remain unchanged context.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-1-anchor-to-loom-core-major-003-manufacture-runtime-source-hygiene-alignment-handoff.trace.md](001-2-1-anchor-to-loom-core-major-003-manufacture-runtime-source-hygiene-alignment-handoff.trace.md)
  - Value: Dn0psPQ6Cw2CyQ29w6asRhBpsWkT387B35Y7zA4lb8g

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: bjR4FsX0xC5qtGiUKWQiWmw-vEBAOJdSUmJf6u-MZKw