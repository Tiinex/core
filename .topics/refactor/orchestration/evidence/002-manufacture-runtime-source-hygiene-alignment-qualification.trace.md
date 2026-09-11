# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 19:59:24
  - Trace: [001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md](../001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Origin:
    - [relative](../001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-11 20:19:36
  - Authors: Loom
  - Why: Preserve exact runtime/source, host-loader, fail-closed, regression, validation, and source-frontier evidence for the bounded Loom Core return.
  - Summary: Exact qualification evidence for Core runtime/source manufacture alignment and the remaining read-only VS Code host boundary.
  - Status: ready/local

---

# Core Major 003 Manufacture Runtime And Source Hygiene Alignment Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can current Core package manufacture fail closed when the Tooling runtime actually executing manufacture differs from the local `@tiinex/core` source being carried, while preserving deterministic exclusion of generated/local state and allowing release-only `package.json` normalization
- Evidence Role: qualifies the bounded Core implementation requested by the Anchor to Loom Core Major 003 Handoff and separates the Core mechanics repair from remaining extension-vscode dependency/loading ownership

## Provenance

- Known Source: exact Core, extension-vscode, Business, and Docs Workspaces materialized from the received qualified Handoff carrier through Tiinex; Core was writable, all other Workspaces were read-only
- Preservation Basis: exact carried source bytes, Start-qualified bootstrap bytes, deterministic local Tooling receipts, and read-only Tiinex source-frontier comparison
- Provenance Limits: the historical full-pack carrier and historical installed extension `node_modules` bytes were not carried, so only their declared/reviewed identities and loader mechanics are asserted here
- Received Core Baseline: a second pristine Core materialization from the same carrier was retained for exact two-way source-frontier comparison
- Received Bootstrap Baseline: the qualified bootstrap runtime extracted only through the Start-declared bootstrap exception was compared with the pristine carried Core source using the Core bootstrap dependency-graph identity contract
- Received Runtime Equality: pristine carried Core and the received bootstrap were exact at bootstrap representation `d779f37ac82fdc3a07e155d576e10e6e975cf056a7f020b7d3365bcb7268d043`, 489 runtime files, 5,353,849 runtime bytes
- Received Entrypoint Digest: pristine Core and received bootstrap `tools/tiinex-portable.mjs` both sha256 `36904d94f595e6bc9da8c1136b34e065b6a91159642af4fc326d30d863c4f41c`
- Received Enumeration Policy Digest: pristine Core and received bootstrap `src/tooling/portable/adapters/node/handoff.manufacture.enumeration.js` both sha256 `8f9f764d390d9c115b4be7fa27479570ab40f6c32e20379f67c059b5d1643589`
- Historical Package Limit: the referenced `tiinex-full-001.handoff-package.zip` and its SHA-256 `5fe85ee4023f96af62aaeee22789e3befe9368d1d4c0ce8db5aac6ac8cdd1652` were not carried in this Handoff, so their internal runtime bytes were not re-inspected here
- Host Installed-Bytes Limit: extension-vscode `node_modules` was not carried, so the exact installed `@tiinex/core` file bytes on the historical host were not available for direct hashing
- Remote Mutation: none; no push, publication, release, deployment, or extension-vscode source mutation occurred

## Evidence Material

- Material Kind: exact source/runtime identity, read-only host-loader inspection, deterministic manufacture regressions, full Core validation, bootstrap qualification, and Tiinex source-frontier comparison
- Material: received/pristine Core and bootstrap identity receipts, exact extension loader/lock source facts, patched manufacture alignment receipts, focused/full validation receipts, and two-way source-frontier comparison
- Extension Lock Identity: exact carried `extension-vscode/package-lock.json` sha256 `7a92c964b2b8e7bf1cc1ad4488d42699d7379a0748370dba4872d7c1480d7adb` pins `@tiinex/core` version `0.7.0`, tarball `https://registry.npmjs.org/@tiinex/core/-/core-0.7.0.tgz`, integrity `sha512-7y37p9tpjgRI+aBCTna8ZQ4WDihQ0j/QDPY1bzDmRdlG/8t+vG8h6nA9dVcaOlbpC3pfd6Tv4LsF0mCzpJDv4g==`
- Host Binding Source: exact carried `extension-vscode/src/host/corePackageBinding.ts` sha256 `2e38f98000a1baf31b9fb78e57a5e1cdf5ce489faaca788e1d8bb31652827ef2`; it verifies declaration/lock/installed package version agreement and deliberately states that it does not certify installed bytes against registry integrity
- Host Runtime Source: exact carried `extension-vscode/src/tiinex/bootstrap.ts` sha256 `bc58573c334128b6460e43b241bcb9354ff5e6d49fc477e43a76503ca0b296c7`; `prepareBundledRuntime` returns the installed dependency root and `portable-entry` resolved by `qualifyInstalledCore`
- Host Manufacture Source: exact carried `extension-vscode/src/packageBuilder.ts` sha256 `96105617306f4a5afe414bd7af809b17e582ffe3073acda55e8649d97ea39b40`; Pack obtains one bundled runtime from `prepareBundledRuntime` and passes that runtime to package-source projection and `manufacture-handoff-package`
- Owner Disposition: the historical host path therefore executes the installed Core dependency, not the simultaneously selected Core Workspace source; the reviewed lock identifies the expected registry package but current host code alone cannot prove the historical installed file bytes were unmodified
- Core Repair: manufacture now derives an exact Tooling runtime identity from the bootstrap dependency graph and, whenever one local Workspace has package identity `@tiinex/core`, rebuilds the same Tooling source/data identity from that carried Core root and requires equality before manufacture proceeds
- Release Normalization Boundary: source/runtime comparison excludes only `package.json` from the equality digest because Core release preparation intentionally rewrites staged npm `package.json` version/release metadata while preserving tracked Tooling source/data bytes; full bootstrap representation digests and package versions remain separately exposed as evidence
- Metadata Insufficiency: matching package name/version is not accepted as byte identity; focused regression keeps package name/version equal while changing enumeration-policy bytes and manufacture fails closed with `portable.tooling-bootstrap.runtime-source.mismatch`
- Runtime Evidence: successful manufacture exposes `tiinex.portable.tooling-runtime-source-alignment.v1` with runtime/source full representation digests, source-representation digests, package versions, entrypoint digest, and enumeration-policy digest
- Hygiene Preservation: real current Core pointerless manufacture remained `qualified-exact-match` and retained exclusion evidence for directories `.release`, `.outgoing-handoff-packages` and relative path `.vscode/link`
- Focused Regression: `node --test test/manufacture-runtime-source-alignment.test.mjs test/manufacture-hygiene.test.mjs` passed 8/8 after the release-normalization case was added
- Full Core Regression: `npm test` passed 80/80
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified` with patched full representation `51e59a86a69a6c962c79fa8288b39cd2423b8c399a687311df3c7c6b66d3ab51`, 490 runtime files, and 5,360,924 runtime bytes
- Patched Source Representation: real current Core manufacture reported exact runtime/source Tooling source representation `cb86a3a2cb49c57e86aaf8cf210a1e0091b91542d1537dd94967fb6d800ac2e3`
- Source Frontier: Tiinex two-way comparison against the exact received pristine Core snapshot was clean with 5 path changes: 2 additions, 3 byte changes, 0 removals, and 0 findings

## Preservation And Fidelity

- Preservation State: current exclusion policy and all previously qualified Core behaviors remain covered by the complete passing validation surface
- Fidelity Notes: source/runtime equality is byte-exact for Tooling source/data entries while intentionally separating release-normalized `package.json` metadata from the equality digest and exposing that metadata independently
- Source Changes: one new runtime/source alignment module, one new focused regression file, and bounded changes to bootstrap identity plus Handoff/Workspace manufacture adapters
- Runtime Contract: a local carried Core Workspace can no longer be silently represented as current by a different Tooling source/data frontier once manufacture is executed by this repaired Core runtime
- Bootstrap Contract: the bootstrap still carries the full exact runtime representation; source equality is an additional manufacture qualification, not a replacement for bootstrap manifest verification
- Host Boundary: extension-vscode remains read-only; adopting a Core package containing this repair and any additional host-side installed-byte attestation remain Anchor/Kodax work if separately delegated
- Known Losses: none in the bounded Core source change; exact historical installed 0.7.0 bytes and the absent historical full-pack carrier cannot be reconstructed from this Handoff without external acquisition and were not invented

## Interpretation Limits

- Does Not Prove: the exact historical `node_modules/@tiinex/core` bytes or the internal bytes of the absent `tiinex-full-001.handoff-package.zip`
- Not Yet Used As: authority to mutate extension-vscode, publish a Core package, or claim the host has adopted the repaired runtime
- Does Prove: the current reviewed extension loader path selects installed `@tiinex/core`; the received current Core source/bootstrap were exact before modification; the repaired Core runtime detects source/data mismatch when a local Core Workspace is carried; and current hygiene exclusions remain qualified
- Must Not Be Treated As: extension-vscode acceptance, npm release readiness, permission to mutate host UX/integration, or evidence that lockfile integrity alone certifies installed bytes
- Authority Limits: Core portable manufacture/bootstrap/source-closure mechanics only; no Docs semantic change, Business Role change, remote write, or release/publication authority

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md](../001-2-core-major-003-manufacture-runtime-source-hygiene-alignment-task.trace.md)
  - Value: 7C4EfHVfJ8suclh3bG8EoJyX1LU52e0qt2-alarylE0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: iH4XKE80LM4NtM-00-gXmE7u44YarqwqLb-xFPkigD4