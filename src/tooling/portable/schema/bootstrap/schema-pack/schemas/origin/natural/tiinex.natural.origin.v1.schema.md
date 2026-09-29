# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.origin.v1](../tiinex.origin.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.origin.v1.schema.md](../tiinex.origin.v1.schema.md)
  - Origin:
    - [relative](../tiinex.origin.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/origin/tiinex.origin.v1.schema.md)
- Current
  - Current Schema: [tiinex.natural.origin.v1](tiinex.natural.origin.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for natural-origin definitions such as places, ecosystems, weather, wildlife, soil, water, geology, organisms, habitats, field sites, and other physical or natural source contexts.

---

# Natural Origin

- Status: draft schema note

## Summary

This schema defines natural origin artifacts.

A natural origin is an origin whose reusable boundary is a natural, physical, environmental, ecological, geological, biological, climatic, spatial, or field-world context.

A natural origin may be a forest, river, field site, garden, watershed, mountain path, coast, soil layer, weather event, habitat, species observation context, laboratory sample context, sensor location, or any other natural or physical context where observations, traces, materials, or signals may be encountered.

A natural origin is not automatically captured by a note, photo, sensor log, map, sample, scan, or digital record. Those are encounters, interfaces, adapters, or preserved materials. The origin remains the world-side boundary.

## Schema Validation Contract

### Natural Origin Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.natural.v1.origin`

Rules

- `tiinex.natural.v1.origin` identifies origin definitions whose boundary is natural, physical, environmental, ecological, biological, geological, climatic, spatial, or field-world.
- Natural origin definitions inherit ordinary origin boundaries and must keep place, event, organism, condition, trace, sample, observation, capture, preservation, and interpretation distinct.
- Natural origin definitions may be referenced by field procedures, sensors, cameras, lab protocols, maps, digital adapters, evidence artifacts, and LLM review workflows.
- Natural origin definitions are not field observations, evidence artifacts, consent records, validation results, sample custody records, or truth ledgers by themselves.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Origin Specialization

Rules

- Natural origin definitions inherit the origin-definition principle that identity, access boundary, material boundary, mutability, authority limits, privacy limits, stewardship limits, and interpretation limits must remain explicit.
- Natural origin definitions specialize the inherited `Origin Body` for artifacts whose `Current -> Current Schema` is `tiinex.natural.v1.origin`.
- The natural origin body replaces the parent origin body sections for `tiinex.natural.v1.origin` artifacts.
- `Natural Origin Identity` specializes `Origin Identity`.
- `Natural Boundary` specializes `Origin Boundary`.
- `Observation And Material Boundary` specializes `Material And Signal Boundary`.
- `Access Safety And Stewardship Boundary` specializes `Access And Authority Boundary`.
- `Change And Loss` specializes `Mutability And Loss`.
- `Use With Tools Interfaces And Adapters`, `Failure And Ambiguity Handling`, and `Portability Notes` preserve the corresponding parent origin semantics.
- Parent origin specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Natural Origin Body

Required Shape

- first body heading after the continuity envelope
- `## Natural Origin Identity` section
- `## Natural Boundary` section
- `## Observation And Material Boundary` section
- `## Access Safety And Stewardship Boundary` section
- `## Change And Loss` section
- `## Use With Tools Interfaces And Adapters` section
- `## Failure And Ambiguity Handling` section
- `## Portability Notes` section

Optional Sections

- Location Context
- Seasonal Or Temporal Context
- Species Or Habitat Context
- Sample Or Specimen Context
- Sensor Or Instrument Context
- Human Or Community Context
- Related Origins
- Examples
- Not Recommended For

Rules

- A natural origin artifact should begin with a human-readable origin name.
- `Natural Origin Identity` must identify the natural origin and version.
- `Natural Boundary` must state what natural or physical boundary is in scope and what is out of scope.
- `Observation And Material Boundary` must distinguish natural conditions or traces from observations, samples, photographs, sensor logs, or claims about them.
- `Access Safety And Stewardship Boundary` must state safety, permissions, stewardship, non-disturbance, and consent-sensitive boundaries where relevant.
- `Change And Loss` must state how the origin, conditions, signals, or access may change or be lost.
- `Use With Tools Interfaces And Adapters` must state how tools and adapters may approach the origin without treating a record as the origin.
- `Failure And Ambiguity Handling` must state how uncertainty, partial observations, unsafe access, misidentification, disturbance risk, or missing context is represented.

### Natural Origin Identity

Required Fields

- Name
- Version
- Origin Family
- Canonical Identifier
- Base Origin
- Natural Origin Medium
- Natural Origin Scope

Optional Fields

- Supersedes
- Related Origin
- Parent Origin
- Location Boundary
- Temporal Boundary
- Stewardship Context
- Species Or Habitat Context
- Physical Sample Context
- Instrument Context

Rules

- `Base Origin` should normally be `tiinex.v1.origin`.
- `Canonical Identifier` should be the stable machine-readable natural origin id.
- `Natural Origin Medium` should state natural, physical, ecological, biological, geological, climatic, field-world, lab-sample-context, or another precise medium.
- `Natural Origin Scope` should define the bounded natural or physical unit being described.
- A natural origin should not imply possession, access permission, sample custody, species certainty, environmental truth, safety, or preservation.

### Natural Boundary

Required Fields

- In Scope
- Out Of Scope
- Boundary Type
- Boundary Stability

Optional Fields

- Location Scope
- Temporal Scope
- Condition Scope
- Habitat Scope
- Sample Scope
- Stewardship Boundary
- Disturbance Boundary

Rules

- `In Scope` must state the natural or physical context included.
- `Out Of Scope` must state nearby natural, social, legal, physical, or interpretive contexts excluded.
- `Boundary Type` should state whether the boundary is spatial, ecological, hydrological, geological, biological, climatic, sample-based, field-site-based, lab-context-based, or mixed.
- `Boundary Stability` must state whether the boundary is stable, seasonal, weather-dependent, mobile, living, changing, uncertain, or human-defined.
- Natural boundaries should not be silently widened from one place, sample, event, or organism to a larger ecosystem, population, property, region, or claim.

### Observation And Material Boundary

Required Fields

- Possible Observation Or Material
- Observation Or Material Status
- Does Not Prove

Optional Fields

- Direct Observation
- Indirect Trace
- Sample Or Specimen
- Photo Or Scan
- Sensor Or Instrument Signal
- Human Report
- Capture Conditions
- Identification Confidence

Rules

- `Possible Observation Or Material` must state what can be observed, measured, sampled, photographed, recorded, reported, or traced.
- `Observation Or Material Status` must state whether material is observed, sampled, reported, photographed, instrumented, preserved, partial, contaminated, stale, unavailable, inferred, or unknown.
- `Does Not Prove` must state important claims the observation or material does not automatically prove.
- A photo, sensor log, sample, or field note is not the natural origin itself.
- Misidentification, sampling bias, disturbance, contamination, seasonal change, and missing context should be acknowledged when relevant.

### Access Safety And Stewardship Boundary

Required Fields

- Access Modes
- Safety Boundary
- Stewardship Boundary
- User Action Requirements

Optional Fields

- Permission Boundary
- Non-Disturbance Boundary
- Conservation Boundary
- Property Boundary
- Community Boundary
- Indigenous Or Local Knowledge Boundary
- Animal Welfare Boundary
- Biosecurity Boundary

Rules

- `Access Modes` must state how the origin may be approached, observed, measured, visited, sampled, photographed, or referenced.
- `Safety Boundary` must state safety limits when relevant.
- `Stewardship Boundary` must state ownership, stewardship, conservation, community, non-disturbance, or ethical limits when relevant.
- `User Action Requirements` must state when explicit approval, permission, safety check, non-disturbance choice, or preservation action is required.
- A natural origin definition should not authorize trespass, disturbance, collection, harm, unsafe access, or extraction.

### Change And Loss

Required Fields

- Change Modes
- Loss Modes
- Staleness Risk

Optional Fields

- Seasonal Change
- Weather Change
- Movement Or Migration
- Decay Or Growth
- Disturbance Risk
- Sample Degradation
- Sensor Drift
- Access Change

Rules

- `Change Modes` must state how the natural or physical origin can change.
- `Loss Modes` must state how observations, traces, samples, access, context, or conditions can be lost.
- `Staleness Risk` must state how quickly observations may become stale when known.
- Natural origins should not be represented as static unless the boundary and time context support that claim.

### Use With Tools Interfaces And Adapters

Required Fields

- Tool Use
- Interface Use
- Adapter Use
- Preservation Boundary

Optional Fields

- Field Tool Use
- Digital Adapter Use
- Evidence Use
- Sample Use
- Map Use
- Runtime Use
- Not Recommended For

Rules

- `Tool Use` should describe physical, procedural, digital, or human tools that may work with the origin.
- `Interface Use` should describe the contact boundary between actor and origin, such as field visit, map, sensor, camera, sample, lab bench, or local report.
- `Adapter Use` should describe how observations or records may become Tiinex-compatible artifacts or candidates.
- `Preservation Boundary` must distinguish encounter, observation, capture, sample, cache, transcription, and durable preservation.
- Digital records of natural origins should reference digital-origin or digital-adapter boundaries when the record boundary matters.

### Failure And Ambiguity Handling

Required Fields

- Failure Modes
- Ambiguity Modes
- Safe Representation

Optional Fields

- Misidentification
- Unsafe Access
- Disturbance Risk
- Incomplete Observation
- Contaminated Sample
- Sensor Failure
- Weather Or Seasonal Drift
- Missing Stewardship Context

Rules

- `Failure Modes` must state common natural-origin access, observation, sampling, or interpretation failures.
- `Ambiguity Modes` must state common ambiguity cases.
- `Safe Representation` must state how to show uncertainty without inventing missing natural state.
- Unsafe, restricted, partial, uncertain, disturbed, contaminated, or unavailable natural-origin state should remain visible as gap/status, not silent success.

### File Naming

Allowed Shapes

- `tiinex.natural.v1.origin.md`
- `<natural-origin-slug>.origin.md`
- `<natural-origin-slug>-origin.md`
- `<lineage>-natural-origin.trace.md`
- `<lineage>-<natural-origin-slug>.trace.md`

Rules

- `tiinex.natural.v1.origin.md` is the reserved base natural origin contract filename for the `tiinex.natural.v1.origin` origin family.
- Natural origin artifacts should use a slug that identifies the place, ecosystem, field context, natural process, sample context, environmental boundary, or natural origin family.
- Canonical registry-like natural origin definitions may use `.origin.md` when the artifact is intentionally maintained as a reusable origin definition.
- Trace-lineage natural origin artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.natural.v1.origin` to define natural-origin boundaries, not to record one observation or sample result.
- Field observations, samples, photographs, sensor logs, and lab results may reference a natural origin definition but should be owned by their own artifact schemas.
- A natural origin definition should not collapse place, observation, sample, sensor record, evidence, claim, or preservation into one thing.
- Natural-origin artifacts should help explorers stay honest about the difference between world, trail, map, note, sample, and claim.

## Artifact Creation Contract

### Creation Intent

Rules

- Create a natural origin artifact when defining a reusable natural, physical, environmental, ecological, field, sample, or place boundary.
- Do not create a natural origin artifact merely to record one observation, photo, or sensor value.

### Parent Selection

Rules

- A base natural origin contract should parent the base origin contract.
- A concrete natural origin should parent the nearest broader natural origin contract.
- A local field observation should usually be a discovery finding, evidence artifact, or field trace rather than a reusable natural origin definition.

### Creation Checks

Rules

- Declare natural origin identity, boundary, observation/material boundary, access/safety/stewardship, change/loss, tool/interface/adapter use, and failure handling.
- Keep natural origin, observation, sample, capture, preservation, evidence, and truth separate.
- Mark safety, permission, stewardship, non-disturbance, uncertainty, and staleness limits when relevant.

### Recommended Output

Rules

- Use a human-readable origin name.
- Include enough structured fields for humans, tools, and LLMs to avoid unsafe or overbroad interpretation.
- Prefer bounded field contexts over vague claims about nature as a whole.

### Not Recommended

Rules

- Do not use natural origin artifacts as permission to access, disturb, collect, sample, publish, or generalize.
- Do not use natural origin artifacts as proof of species, condition, event, environmental claim, evidence, validation, or preservation.
## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.natural.v1.origin
  - Created At: 2026-06-29 00:00:00
  - Summary: Natural-origin boundary for a bounded field observation site.

---

# Field Observation Site Natural Origin

## Natural Origin Identity

- Name: field observation site natural origin
- Version: 1
- Origin Family: field observation site
- Canonical Identifier: field.observation.site.v1
- Base Origin: tiinex.v1.origin
- Natural Origin Medium: natural field-world
- Natural Origin Scope: bounded place and time window for observation

## Natural Boundary

- In Scope: declared field site and observation window
- Out Of Scope: nearby habitats, private property, broader population claims, and unstated seasons
- Boundary Type: spatial and temporal field boundary
- Boundary Stability: changing and weather-dependent

## Observation And Material Boundary

- Possible Observation Or Material: direct observation, traces, photographs, sensor readings, notes, or samples when permitted
- Observation Or Material Status: observed, partial, sampled, photographed, preserved, unavailable, inferred, or unknown
- Does Not Prove: population truth, species certainty, ownership, permission, safety, or environmental conclusion

## Access Safety And Stewardship Boundary

- Access Modes: non-disturbing observation, permitted sampling, camera, sensor, or local report
- Safety Boundary: do not access unsafe conditions silently
- Stewardship Boundary: respect property, conservation, community, and non-disturbance limits
- User Action Requirements: permission, sampling, publication, or preservation when relevant

## Change And Loss

- Change Modes: weather, season, movement, growth, decay, disturbance, or human activity
- Loss Modes: missed observation, degraded sample, sensor failure, lost context, or access change
- Staleness Risk: depends on organism, condition, weather, and time window

## Use With Tools Interfaces And Adapters

- Tool Use: field notebook, map, camera, sensor, sample kit, or viewer
- Interface Use: field visit, camera, sensor, lab bench, or local report
- Adapter Use: convert observations or records into findings/candidates with uncertainty preserved
- Preservation Boundary: encounter or capture is not durable preservation unless explicitly preserved

## Failure And Ambiguity Handling

- Failure Modes: unsafe access, partial observation, misidentification, disturbance, contamination, sensor failure, or missing context
- Ambiguity Modes: similar species, old traces, changing conditions, indirect reports, or biased sampling
- Safe Representation: show uncertainty and limits rather than inventing missing natural state
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

## Interpretation Notes

- natural origins define world-side boundaries, not observations by themselves
- digital records of nature may need both natural-origin and digital-origin boundaries
- field tools, sensors, cameras, notebooks, maps, adapters, and LLM runtimes should keep natural uncertainty visible
- the explorer needs both a map and humility: the map is not the terrain, and one observation is not the whole place

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.origin.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/origin/tiinex.origin.v1.schema.md)
  - Value: nEt9xZzJai5nFzzcI7AB_9q9hHWzVt_8KSx6nTllHdA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: _ZRH4a_EhdyvzQSQYn3dwA2ab9yr1nN7UMkF4c418aQ