# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](../tiinex.discovery.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.v1.schema.md](../tiinex.discovery.v1.schema.md)
  - Origin:
    - [relative](../tiinex.discovery.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.expedition.v1](tiinex.discovery.expedition.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for exploratory discovery artifacts that preserve route, terrain, encounters, map updates, and uncertainty in partly unknown fields.

---

# Discovery Expedition

- Status: maintained schema note

## Summary

This schema narrows discovery into expedition: exploratory movement through a partly unknown field where the goal is to map terrain, notice encounters, preserve routes, and return with clearer orientation.

Expedition is not colonial claiming, ownership, or authority over a discovered field. It is a provenance shape for exploratory learning where the destination or expected findings are not fully known at the start.

Expedition is less answer-driven than research and more route-driven than a single finding.

## Schema Validation Contract

### Expedition Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.expedition.v1`

Rules

- `tiinex.discovery.expedition.v1` identifies artifacts centered on exploratory movement through a partly unknown field.
- An expedition artifact should state the expedition purpose, terrain, route, encounters, map update, and limits.
- Expedition artifacts may produce findings, pointers, research questions, evidence candidates, relation candidates, or future tasks.
- Expedition artifacts must not imply ownership, authority, extraction rights, or canonical truth over the field.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.discovery.expedition.v1` specializes the inherited `Discovery Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.discovery.expedition.v1`.
- `Expedition Purpose` specializes `Discovery Intent`.
- `Terrain` specializes `Discovery Field`.
- `Route` specializes `Discovery Method`.
- `Encounters` and `Map Update` specialize `Discovery Outcome`.
- `Interpretation Limits` preserves the inherited uncertainty and boundary semantics.

### Expedition Body

Required Shape

- first body heading after the continuity envelope
- `## Expedition Purpose` section
- `## Terrain` section
- `## Route` section
- `## Encounters` section
- `## Map Update` section
- `## Interpretation Limits` section

Optional Sections

- Starting Point
- Equipment Or Sources
- Boundaries
- Hazards
- Dead Ends
- Findings
- Pointers
- Next Artifacts
- References

Rules

- An expedition artifact should begin with a human-readable title.
- `Expedition Purpose` must state why the field is being explored.
- `Terrain` must state the field, domain, repository, community, corpus, system, place, or conceptual area being entered.
- `Route` must state how exploration proceeds, including path, sequence, or traversal choices when known.
- `Encounters` must state notable things seen, missed, blocked, or deferred.
- `Map Update` must state what orientation changed because of the expedition.
- `Interpretation Limits` must state what remains unknown and what the expedition does not prove.

### Expedition Semantics

Allowed Shapes

- exploratory field pass
- first contact with a topic
- repository terrain pass
- corpus walk
- map-making pass
- dead-end exploration
- route comparison
- horizon scan

Rules

- Expedition may begin with curiosity rather than a strict research question.
- Expedition should preserve dead ends and surprises because they help later readers understand the route.
- Expedition should not replace research when the main work is answering a specific question.
- Expedition should not replace monitoring when the main work is repeated observation over time.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-expedition.trace.md`
- `<lineage>-<expedition-slug>.trace.md`

Rules

- Expedition artifacts should keep the lineage label first.
- The optional slug should identify the field, route, or map update.
- Expedition artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.discovery.expedition.v1` when the main artifact value is exploratory route and map-making.
- Do not use `tiinex.discovery.expedition.v1` for final decisions, evidence bundles, directed feedback, bounded monitoring, or high-impact surveillance.
- Expedition does not authorize extraction, access, ownership, or broad collection by itself.

## Minimal Example

```md
# New Repository Terrain Expedition

## Expedition Purpose

- Purpose: understand what kinds of provenance-related material exist in a new repository before choosing a research question.

## Terrain

- Terrain: public repository documentation and visible topic folders
- Out Of Scope: private branches, broad issue crawling, unrelated user activity

## Route

- Route: inspect README, schema folder, and one topic area selected from visible navigation.

## Encounters

- Encounter: a schema family appears to separate parent continuity from relation targets.

## Map Update

- Update: the next useful step is a research pass against the schema family, not a broad crawl.

## Interpretation Limits

- Limits: this expedition maps first impressions and does not prove completeness or maintainer intent.
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- Expedition artifacts narrow discovery without replacing parent continuity or origin semantics
- Expedition artifacts should remain human-readable and provenance-oriented rather than app-runtime configuration
- Expedition artifacts may lead to evidence, signal, feedback, pointer, relation, task, decision, privacy, consent, or attestation artifacts when those schemas own the later role
- Expedition artifacts must state what they do not prove or authorize

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder
- targetPrompt
- targetPlaceholder
- boundaryPrompt
- boundaryPlaceholder

Rules

- The current expedition create surface uses version `1`.
- `createTitle` should label the create action as `Create Expedition`.
- `summaryPrompt` should ask for the expedition title.
- `summaryPlaceholder` should guide the user toward the relevant discovery surface.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Expedition Purpose` section
- `## Terrain` section
- `## Route` section
- `## Encounters` section
- `## Map Update` section
- `## Interpretation Limits` section

Rules

- Generated expedition artifacts should begin with the title as the first body heading.
- `Expedition Purpose` should be preserved in generated artifacts.
- `Terrain` should be preserved in generated artifacts.
- `Route` should be preserved in generated artifacts.
- `Encounters` should be preserved in generated artifacts.
- `Map Update` should be preserved in generated artifacts.
- `Interpretation Limits` should be preserved in generated artifacts.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.v1.schema.md](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Value: DOEm9XKixnIUzuGNZ06-NUbtKT-GNCJ2ktmfJnqgHvo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Eix1RFCzLObQyuAx_OmrX9hrncjhFhWz9-oVwd2lrc4