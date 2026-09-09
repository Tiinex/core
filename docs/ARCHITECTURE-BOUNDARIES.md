# Core Architecture Boundaries

`@tiinex/core` is the shared host-neutral implementation layer. It implements Tiinex mechanics while canonical semantic/schema authority remains in Tiinex Docs.

## Core owns

- artifact parsing/records and deterministic source-bound projections;
- schema runtime resolution, validation and exact material/provenance checks;
- lineage/Parent traversal and continuity mechanics;
- Handoff grounding, package manufacture, closure and recipient-facing cold-start mechanics;
- companion-provider selection and integrity-aware resource contracts;
- host-neutral Tooling operations used by dedicated hosts;
- the embedded/pinned **carrier/tooling bootstrap runtime** needed for a Handoff to verify and cold-start without requiring another Tiinex package.

## Core does not own

- canonical schema meaning merely because it carries or compiles exact Docs material;
- Viewer/application/React presentation (App);
- web deployment configuration (Site);
- Verse-specific presentation/world logic (for example Playthings);
- final ordinary CLI host UX once the CLI repository is established;
- external-assistant/automation bootstrap experiences and adapters once Interop is established;
- VS Code or Chrome host-specific integration.

## Three meanings of bootstrap

The repository currently contains several things historically called `bootstrap`. They have different responsibilities.

1. **Carrier/tooling bootstrap — Core.** `handoff.manufacture.bootstrap.js`, `toolingBootstrap.js` and related runtime packaging allow a received Handoff package to carry/verify enough Tooling to orient and ground itself. This remains Core mechanics.
2. **Schema material bootstrap — Docs authority, Core runtime mechanics.** `schema/bootstrap/**` contains exact runtime material/projections required by the portable schema provider. Core may package/verify those bytes, but the declared Docs binding remains semantic authority.
3. **External LLM/assistant bootstrap — Interop frontier.** `tooling/portable/bootstrap/tiinex.llm.bootstrap.md` and its pointer are retained here only as transitional compatibility material. They should migrate to the Interop package/repository when that Workspace and its consumers are qualified.

Do not move category 1 to Interop merely because both use the word `bootstrap`. Do not treat category 2 as Core semantic authority. Do not delete category 3 before an actual Interop replacement is qualified.

## Transitional host surfaces

`tools/tiinex-portable.mjs` and the broad Node portable export remain compatibility surfaces while CLI/Interop extraction is unfinished. New consumers should prefer documented public package exports and must not copy Core source into their own repository.
