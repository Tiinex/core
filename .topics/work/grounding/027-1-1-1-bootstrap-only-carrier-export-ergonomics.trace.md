# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 11:30:47
  - Trace: [027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md](027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md)
  - Origin:
    - [relative](027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-29 14:20:33
  - Authors: Anchor
  - Why: Sigma wants a fast manual way to patch waiting conversations with current Tooling while preserving one canonical Handoff packaging path.
  - Summary: Add a thin npm and VS Code convenience export for canonical bootstrap-only Package V1 carriers without duplicating manufacture semantics.
  - Status: ready/local

---

# Bootstrap-Only Carrier Export Ergonomics

## Objective

Expose one human/LLM-friendly Core command that exports a canonical bootstrap-only Handoff Package V1 carrier into the current working directory without creating a second package-building implementation.

## Done Criteria

- `npm run bootstrap:carrier` writes the next local `bootstrap-XXX.handoff-package.zip`, starting at `001` and advancing from the highest matching filename in the selected output directory.
- The convenience command delegates package construction to the existing portable `manufacture-handoff-package --carrier-mode bootstrap` path; it owns filename allocation and receipt ergonomics only.
- Exported carriers contain canonical Package V1 bootstrap-only boilerplate with no Workspace material and no Handoff routes.
- Canonical manufacture inspection, physical roundtrip verification, and embedded-bootstrap qualification remain mandatory before an output is reported ready.
- `.gitignore` ignores generated `*.zip` files so ordinary repo-root bootstrap exports do not appear as source changes.
- Core exposes a VS Code task that invokes the same npm script from `${workspaceFolder}` rather than implementing package behavior in editor configuration.
- Filename allocation and canonical bootstrap-only export are covered by executable regression tests.
- Full Core, portable smoke, and embedded bootstrap qualification remain green.

## Scope

Core convenience tooling, npm script, repository VS Code task, generated ZIP ignore rule, and focused regression coverage only.

## Dependencies

- Existing canonical Package V1 direct bootstrap-only carrier manufacture.
- Existing embedded Tooling bootstrap builder and physical roundtrip verification.
- [Native Schema Source Pack And Deterministic Docs-To-Core Sync](027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md)

## Exclusions

- No second ZIP renderer, Package V1 renderer, bootstrap renderer, or alternate package schema.
- No Handoff Package V2 behavior.
- No Workspace carriage in bootstrap-only exports.
- No VS Code extension repository mutation; only the Core repository-local task definition is in scope.
- No release, publication, GitHub mutation, commit, or push.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md](027-1-1-native-schema-source-pack-and-deterministic-docs-to-core-sync.trace.md)
  - Value: JDNvxLy1ANVvfKdKJihVzGtZGAeNiYWVBg0WFFotcQ0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: hw-gUx6hDBGWl-e98v7rHOpDamAFz8Vn57DFIdgz_rM