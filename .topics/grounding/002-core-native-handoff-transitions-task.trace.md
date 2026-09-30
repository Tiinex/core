# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-30 11:42:40
  - Trace: [001-core-native-handoff-transition-ownership-discovery.trace.md](001-core-native-handoff-transition-ownership-discovery.trace.md)
  - Origin:
    - [relative](001-core-native-handoff-transition-ownership-discovery.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/668753e47a281db060cb74ef957683f4f773b3a4/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-30 11:43:20
  - Authors: Anchor
  - Summary: Core-native Handoff authoring without App dependency
  - Status: ready/local

---

# Consolidate shared Handoff transition material into Core

## Objective

Move shared Handoff Transition Definitions, their Generation Authorities and Companion/Semantic Package metadata from App to Core-native distribution; preserve standalone Core bootstrap and VS Code Handoff authoring.

## Done Criteria

- A Core-only portable bootstrap projects the three qualified Handoff authoring profiles.
- Additional Workspace-defined transitions still qualify independently without implicit recommendation or execution.
- App no longer owns the three shared Handoff authoring transitions; App React behavior and VS Code bridge regressions remain green.
- Any unrelated Site-specific App artifact cleanup is explicitly deferred without silently deleting it.

## Scope

- Core native Handoff Transition material, portable catalog/CLI/bootstrap, App shared Handoff duplicates and bounded regression tests.
- Excludes Site and Chrome Extension feature work, npm package extension implementation, and deletion of Site-specific transitions without owner qualification.

## Dependencies

- Discovery: [Core-native Handoff transition ownership](001-core-native-handoff-transition-ownership-discovery.trace.md)
- Exact qualified App/Core/VS Code Workspace snapshot from the supplied latest evaluation carrier.
- Existing native Handoff schema/creation contract and portable Transition qualification machinery.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-core-native-handoff-transition-ownership-discovery.trace.md](001-core-native-handoff-transition-ownership-discovery.trace.md)
  - Value: 19MuE0g7L9Uix_WfoRWs0GsxOHZGayDqVG-gS62VtSA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Fddu7m1rLtoPi0CNtgfiV37hSz-kjaftvhj0HnaZa_Y