# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-13 19:30:49
  - Trace: [001-1-core-native-entry-cli-propagation-reproduction-and-fix-candidate.trace.md](001-1-core-native-entry-cli-propagation-reproduction-and-fix-candidate.trace.md)
  - Origin:
    - [relative](001-1-core-native-entry-cli-propagation-reproduction-and-fix-candidate.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/9ef3c2caed38152b1948c93cb45c985786660d91/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-13 20:04:28
  - Authors: Anchor
  - Summary: Commit-Pinned Cross-Workspace Parent — Editor Verification Repair
  - Status: ready/local

---

# Commit-Pinned Cross-Workspace Parent — Editor Verification Repair

## Supported Claim Or Question

- Supported Claim Or Question: whether the VS Code editor should classify a correctly pinned Business Project Parent as unresolved when the local Core Workspace lacks the other Workspace's source bytes, and whether a human may select a cross-Workspace Git-backed Parent without inventing publication authority.
- Evidence Role: records a reproducible false negative in local-only editor material projection, plus a bounded Core/VS Code candidate and regression results.

## Provenance

- Known Source: the qualified Core First-Use Task with direct Business Tooling Project Parent, the currently carried Business Project bytes, Core's portable lineage inspector, and VS Code diagnostics/Locate Parent source.
- Preservation Basis: exact edited Core and VS Code files and executable regression tests are carried in their respective Workspaces; this Evidence records their causal connection.
- Provenance Limits: test runtime is local with Native schema bootstrap; a public GitHub commit was read independently in prior qualification, but the installed Windows VSIX and real consumer network/UI remain untested.

## Evidence Material

- pinned-parent-editor-cli
  - Material: [Core editor source](../../../src/tooling/portable/editor/editor.assistance.js), [external Parent qualification](../../../src/tooling/portable/editor/editor.externalParents.js) and [CLI input](../../../src/tooling/portable/adapters/cli/cli.editor-assistance.js)
  - Material Kind: exact carried Core source
  - Description: an exact commit-pinned host-read Parent is checked for source identity, SHA-256, verified c14n-v2 self, Parent Schema and child Parent target integrity using Core's existing accepted repository-read evidence contract. Missing, contradictory or tampered material cannot qualify.
- pinned-parent-core-regression
  - Material: [test/editor-pinned-parent-resolution.test.mjs](../../../test/editor-pinned-parent-resolution.test.mjs)
  - Material Kind: executable regression source
  - Description: four positive/negative external Parent and explicit permalink selection cases passed; an actual qualified Business→Core editor CLI replay returned clean with zero diagnostics. Focused related Core editor/cross-Workspace suite passed 65/65.
- vscode-local-and-cross-parent
  - Material: Exact Source and regression material co-carried in the separate `vscode` Workspace of the same full-recovery package.
  - Material Kind: exact co-carried independent Workspace source and tests
  - Description: `src/diagnostics.ts`, `src/parentPublication.ts`, `src/tiinex/bootstrap.ts`, and four regression tests. VS Code reads only the immutable GitHub blob, passes full exact bytes through Core for qualification, and supports explicitly selected cross-repository Parents only where Git HEAD, local material and the published pinned remote blob are identical; missing Git/publication blocks safely. Four host behavior tests pass.

## Preservation And Fidelity

- Preservation State: all modified source and test files are carried in the same full 17-Workspace V1 recovery snapshot; test logs remain separate from source to avoid bloat.
- Fidelity Notes: normal editor diagnostics stay read-only; Locate Parent remains a human-selected, single-artifact Core-qualified changeset; no remote writes or inferred Parent authority.
- Known Losses: installed VSIX compile/host acceptance cannot be established by these source tests; external GitHub reachability in private/offline environments may remain unavailable and is reported as unverified rather than proven wrong.

## Interpretation Limits

- Does Not Prove: successful installed Windows VSIX, private GitHub authentication, all multi-Workspace monorepo topologies, all schema companion availability, or full first-use LLM onboarding.
- Must Not Be Treated As: a final release Decision, a GitHub commit/push or authority to invent a GitHub permalink for uncommitted, unpublished or non-Git source.
- Not Yet Used As: release acceptance, published repair, or independent installed-host validation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-core-native-entry-cli-propagation-reproduction-and-fix-candidate.trace.md](001-1-core-native-entry-cli-propagation-reproduction-and-fix-candidate.trace.md)
  - Value: HKelTKNOHQzvoo-6I1ixq-_8MaqbtMOvYe1KNHE8QHw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: LOSOf0KYCe-DDOt3b_BiHHqhQx_ydxPD9zgSrBrYFAY