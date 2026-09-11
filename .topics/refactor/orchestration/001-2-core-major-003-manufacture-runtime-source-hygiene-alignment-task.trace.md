# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 16:58:53
  - Trace: [001-core-repository-local-orchestration-frontier.trace.md](001-core-repository-local-orchestration-frontier.trace.md)
  - Origin:
    - [relative](001-core-repository-local-orchestration-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 19:59:24
  - Authors: Anchor
  - Why: The real tiinex-full-001 pack structurally passed yet carried generated/local state excluded by current Core source, proving a runtime/source frontier mismatch worth a bounded Core major.
  - Summary: Align the runtime actually used for package manufacture with current Core source hygiene and expose or fail closed on stale-runtime mismatch.
  - Status: ready/local

---

# Core Major 003 — Manufacture Runtime And Source Hygiene Alignment

## Objective

Make Handoff/Workspace package manufacture use and expose a Tooling/runtime frontier whose source-enumeration behavior is consistent with the current qualified Core source, so generated/local state is not silently carried by a runtime that is older than the source contract being presented.

## Done Criteria

- Reproduce and explain the observed `tiinex-full-001.handoff-package.zip` behavior from the current carried source set: generated `.release/**` material and `extension-vscode/.vscode/link/state.json` were carried even though current Core manufacture enumeration excludes `.release`, `.outgoing-handoff-packages`, and `.vscode/link`.
- Prove which exact runtime/tooling bytes drive manufacture in the affected host path and how they relate to the carried Core source bytes.
- Ensure the Core-owned manufacture/bootstrap mechanics either use the qualified current behavior or fail closed/report a source/runtime mismatch strongly enough that a host cannot present stale enumeration as current closure.
- Preserve deterministic exclusion of generated/package/local-link state with focused regression coverage.
- Run the full relevant Core portable/bootstrap qualification before return.
- If the remaining defect is host-specific dependency/loading state owned by `extension-vscode`, return the exact bounded blocker to Anchor instead of editing the extension under Core authority.

## Scope

Core portable manufacture/bootstrap/source-closure mechanics only. No Docs semantic change, no Business Role change, no VS Code UX redesign, no release/publication, and no broad package-format redesign.

## Reproduction Anchor

- Observed package: `tiinex-full-001.handoff-package.zip`
- Observed SHA-256: `5fe85ee4023f96af62aaeee22789e3befe9368d1d4c0ce8db5aac6ac8cdd1652`
- The package structurally qualified as a 16-Workspace pointerless carrier, but its Workspace payloads included generated/local material excluded by the current carried Core source enumerator.

## Dependencies

- Current Core repository-local orchestration frontier.
- Current Core manufacture-hygiene implementation/tests.
- Exact current extension-vscode source as read-only host integration context.

## Acceptance Boundary

A passing Core test suite alone is insufficient if the affected host can still silently run different enumeration bytes. The result must make the runtime/source relationship observable or fail closed at the correct boundary.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-core-repository-local-orchestration-frontier.trace.md](001-core-repository-local-orchestration-frontier.trace.md)
  - Value: jzkpAJ9auJ50Q8nu7n1KXxEeU10cYMwklxcLcLZg2nk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7C4EfHVfJ8suclh3bG8EoJyX1LU52e0qt2-alarylE0