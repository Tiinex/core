# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-29 11:57:00
  - Trace: [027-1-evidence-schema-reference-and-registry-source-binding-drift-discovery.trace.md](027-1-evidence-schema-reference-and-registry-source-binding-drift-discovery.trace.md)
  - Origin:
    - [relative](027-1-evidence-schema-reference-and-registry-source-binding-drift-discovery.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 11:30:47
  - Authors: Anchor
  - Why: Sigma approved the discovery plan and requires an LLM-ergonomic schema maintenance path that remains correct and reproducible inside constrained sandboxes.
  - Summary: Implement offline-first canonical schema packing, deterministic Docs-to-Core synchronization, source/reference authority repair, and registry-wide qualification without network-dependent maintenance.
  - Status: ready/local

---

# Native Schema Source Pack And Deterministic Docs-To-Core Sync

## Objective

Implement an LLM-first, offline-capable native Tiinex schema maintenance path in Core where Tiinex/docs remains canonical schema source, Core consumes one explicit immutable Docs snapshot, bootstrap carries the exact supported canonical schema material, and generated Core schema metadata can be deterministically synchronized and checked without GitHub, npm, CI, or host-private network access.

## Done Criteria

- Core carries one deterministic native Schema Pack containing the exact canonical `*.schema.md` material for the supported Docs snapshot plus a machine-readable manifest with schema identity, Parent identity, exact source path, content digest, Git blob identity, and publication metadata.
- The embedded Tooling bootstrap carries the Schema Pack as ordinary runtime data and can inspect it without network access.
- Node/portable Tooling exposes explicit schema status/sync/check operations that can consume a qualified local Docs Workspace or the embedded Schema Pack; network access is never required for normal qualification.
- Core generated schema bindings/catalog/runtime metadata are derived from exact schema source bytes rather than independently hand-maintained commit/path/blob/checksum tuples.
- Schema checking fails closed on source byte drift, source path drift, Git-blob drift, Parent/source-lineage incoherence, stale generated outputs, bogus bundled source paths, or registry/catalog incoherence.
- Existing native schemas remain available through exact specialized companions where present, while the generated catalog can preserve canonical native schemas without requiring a handwritten companion for every schema.
- Canonical source publication authority is distinct from local content qualification: immutable permalinks are emitted only when exact publication authority is qualified.
- The currently observed Evidence `Current Schema` plain-id symptom is repaired as a consequence of exact canonical Evidence source/reference authority, not by a renderer special case.
- Existing Task 027 fail-closed compiled Parent-source lineage semantics remain intact; schema-reference qualification must not silently weaken inherited validation authority.
- Current registry source drift is inventoried and repaired against the selected Docs snapshot.
- Full Core, portable, bootstrap, and focused schema-sync/reference-authority regressions pass.

## Scope

Core portable schema source/catalog/runtime projection mechanics, deterministic Node filesystem adapter/CLI support, embedded bootstrap Schema Pack material, native registry/reference-authority integration, current native binding regeneration, and focused/full regression coverage. The supplied Docs Workspace is read-only canonical input unless a separately qualified Docs semantic defect is found.

## Dependencies

- [Evidence Schema Reference And Registry Source-Binding Drift Discovery](027-1-evidence-schema-reference-and-registry-source-binding-drift-discovery.trace.md)
- Existing Task 027 compiled schema lineage source-authority qualification mechanics.
- Qualified local Tiinex/docs Workspace supplied by Sigma.
- Existing portable schema parser/compiler and bootstrap runtime enumeration.

## Exclusions

- No companion inheritance/composition redesign in this Task.
- No semantic redesign or removal of `tiinex.workspace.representation.v1` in this Task.
- No Handoff Package V2 semantics or resurrection of removed V2 carrier behavior.
- No npm-based Docs/schema distribution dependency.
- No CI-owned schema synchronization authority.
- No GitHub mutation, commit, push, release, publication, or remote write.
- No guessed future publication commit or permalink.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-evidence-schema-reference-and-registry-source-binding-drift-discovery.trace.md](027-1-evidence-schema-reference-and-registry-source-binding-drift-discovery.trace.md)
  - Value: Q5IqNf8I5Me8mUZHyqSl3EDBGS2IGsQDryvI36Pw2II

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: JDNvxLy1ANVvfKdKJihVzGtZGAeNiYWVBg0WFFotcQ0