# @tiinex/core

`@tiinex/core` is the shared host-neutral implementation core behind Tiinex consumers.
It implements portable artifact interpretation, schema/runtime contracts, validation,
lineage, continuity, grounding, Handoff/package mechanics, deterministic projections,
and companion-resource resolution without assigning canonical semantic authority to a
UI host or repository location.

Canonical schema meaning remains in Tiinex Docs. Core implements those contracts.
Business retains organizational prioritization and human gates. Site, VS Code, Chrome,
CLI and other consumers are hosts rather than independent semantic engines.

## Public boundaries

- `@tiinex/core` / `@tiinex/core/browser` — browser-safe data projection and companion-resource contracts.
- `@tiinex/core/node` — the browser-safe surface plus portable Tooling for Node hosts.

The browser entrypoint does not import Node built-ins. Package consumers must not import
undocumented internal paths.

## Companion resources

Companion lookup is provider-oriented. Artifact-local Workspace material, deployment
overrides, Verse package defaults and lower-level defaults can participate without
making physical repository placement semantic authority. Specificity is resolved before
provider precedence; unresolved same-level single-value conflicts fail closed.

## Layout

Source paths intentionally follow the same `src/...` conventions used by other Tiinex
repositories where the concepts match. npm distribution preserves this source layout
rather than inventing a second directory vocabulary.
