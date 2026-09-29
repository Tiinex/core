# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.tool.v1](../tool/tiinex.tool.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.tool.v1.schema.md](../tool/tiinex.tool.v1.schema.md)
  - Origin:
    - [relative](../tool/tiinex.tool.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tool/tiinex.tool.v1.schema.md)
- Current
  - Current Schema: [tiinex.interface.v1](tiinex.interface.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for interface definitions that describe where actors, tools, materials, environments, or systems meet and what may cross that boundary.

---

# Interface

- Status: draft schema note

## Summary

This schema defines interface-definition artifacts as a specialized tool family.

An interface is where two or more contexts meet. It may be a doorway, a form, a map, a field protocol, a translation practice, a sensor surface, a user interface, an API boundary, a checklist handoff, a conversation ritual, or another contact point between actors, materials, tools, environments, or systems.

A Tiinex interface definition does not assume software. It asks: what sides meet here, what may cross, what must remain visible, what is transformed or lost, and what authority does the interface not have by itself.

This schema exists so Tiinex can describe boundary-crossing surfaces before specializing them into adapters, viewers, navigators, instruments, or other tools. It gives adapter definitions a human-readable parent without making every adapter a software connector.

## Schema Validation Contract

### Interface Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.interface.v1`

Rules

- `tiinex.interface.v1` identifies artifacts whose main job is to define a reusable interface, contact boundary, handoff surface, or mediation boundary.
- An interface definition specializes the broader `tiinex.tool.v1` idea for contact points between contexts.
- An interface definition describes a contract; it is not an interface run, a handoff result, a source of truth, an adapter result, or evidence by itself.
- An interface may be physical, procedural, social, digital, runtime-based, or mixed.
- Interface definitions must make sides, contact points, mediation role, allowed crossings, blocked crossings, loss, assumptions, action limits, failure modes, and portability explicit.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Tool Specialization

Rules

- Interface definitions inherit the tool-definition principle that a tool must declare purpose, operating boundary, action boundary, interpretation boundary, and failure modes.
- Interface definitions narrow that principle to places or methods where contexts meet and material, meaning, state, or authority may cross.
- The continuity envelope remains inherited from `tiinex.root.v1`; this schema does not replace `Parent`, `Origin`, `Current`, or `Continuity Integrity` semantics.
- Parent tool specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Interface Body

Required Shape

- first body heading after the continuity envelope
- `## Interface Identity` section
- `## Boundary And Sides` section
- `## Mediation Role` section
- `## Inputs And Contact Points` section
- `## Outputs And Hand-Offs` section
- `## Action Boundary` section
- `## Loss And Assumption Boundary` section
- `## Failure Modes` section
- `## Portability Notes` section

Optional Sections

- Operator Model
- Required Context
- Human Use
- Machine Use
- Physical Surface
- Digital Surface
- Social Surface
- Translation Boundary
- Safety Boundary
- Privacy Boundary
- Examples
- Related Tools
- Related Interfaces
- Not Recommended For

Rules

- An interface artifact should begin with a human-readable interface name.
- Required sections should be readable by a human without knowing the implementation language.
- Required sections should be structured enough that a tool or LLM can extract sides, crossings, limits, and expected handoffs.
- An interface definition should distinguish the sides that meet, the contact point, the operator, the allowed crossing, blocked crossing, transformation, loss, and output.
- An interface definition must not claim executable behavior unless it identifies a concrete implementation or operating surface separately from the interface contract.

### Interface Identity

Required Fields

- Name
- Version
- Interface Family
- Canonical Identifier

Optional Fields

- Base Tool
- Base Interface
- Supersedes
- Related Interface
- Implementation Surface
- Maintainer Surface

Rules

- `Name` should be stable enough for human-readable UI, review surfaces, and documentation.
- `Canonical Identifier` should be the stable machine-readable interface id used by registries, generated artifacts, and references.
- `Version` should change when boundary semantics, crossing rules, mediation role, action boundary, loss handling, or failure handling changes.
- `Interface Family` should identify the broad class, such as physical contact surface, social procedure, translation surface, navigation surface, viewer interface, adapter interface, instrument interface, or runtime interface.
- `Base Tool` should identify the broader tool contract when the interface is intentionally derived from a tool definition.
- `Base Interface` should be used when a concrete interface inherits a broader interface contract.

### Boundary And Sides

Required Fields

- Side A
- Side B
- Boundary Description
- May Cross
- Must Not Cross

Optional Fields

- Additional Sides
- Source Side
- Target Side
- Authority Boundary
- Privacy Boundary
- Safety Boundary

Rules

- `Side A` and `Side B` must identify the primary contexts that meet at the interface.
- `Boundary Description` must state what separates those contexts.
- `May Cross` must state what material, meaning, state, signal, or authority may cross through the interface.
- `Must Not Cross` must state important material, meaning, state, signal, or authority that must not cross by default.
- An interface must not hide authority, consent, access, preservation, or interpretation changes behind a generic contact point.

### Mediation Role

Required Fields

- Mediation Purpose
- Transformation Allowed
- Transformation Not Allowed

Optional Fields

- Translation Role
- Normalization Role
- Observation Role
- Routing Role
- Presentation Role
- Negotiation Role

Rules

- `Mediation Purpose` must state why the interface exists.
- `Transformation Allowed` must state what transformation, translation, normalization, framing, routing, or presentation may happen.
- `Transformation Not Allowed` must state transformations the interface must not silently perform.
- If the interface changes meaning, shape, format, custody, or context, that change should remain visible.

### Inputs And Contact Points

Required Fields

- Inputs
- Contact Points
- Required Context

Optional Fields

- Optional Context
- Material Types
- Source Types
- Access Requirements
- Human Preparation
- Machine Preparation
- Physical Preparation

Rules

- `Inputs` must state what enters the interface.
- `Contact Points` must state where or how contact occurs.
- `Required Context` must state what a later reader, operator, or implementation needs before using the interface.
- Inputs should not be treated as preserved evidence unless a preservation artifact or explicit preservation action says so.

### Outputs And Hand-Offs

Required Fields

- Outputs
- Hand-Off Target
- Claims Made
- Claims Not Made

Optional Fields

- Output Schemas
- Output Surfaces
- Review State
- Confidence Language
- Handoff State

Rules

- `Outputs` must state what the interface may produce or pass onward.
- `Hand-Off Target` must state where output goes next.
- `Claims Made` must state what positive claim the output or handoff can support.
- `Claims Not Made` must state important claims the output or handoff must not imply.
- Interface output must not imply truth, authorship, consent, identity, safety, legality, preservation, or successful interpretation unless those claims are inside the declared boundary.

### Action Boundary

Required Fields

- Read Actions
- Write Actions
- Change Actions
- User-Required Actions

Optional Fields

- Open Actions
- Export Actions
- Auth Actions
- Destructive Actions
- Physical Actions
- Social Actions

Rules

- `Read Actions` must state what the interface may inspect, observe, receive, or expose.
- `Write Actions` must state whether the interface can write, publish, upload, send, mutate, annotate, or record anything.
- `Change Actions` must state whether the interface can change material, environment, social state, runtime state, or physical state.
- `User-Required Actions` must state actions that require explicit human choice.
- Hidden writes, hidden uploads, hidden auth, hidden physical handling, hidden social consent, and hidden destructive actions are not allowed under this schema.

### Loss And Assumption Boundary

Required Fields

- Possible Losses
- Assumptions Made
- Assumptions Not Made

Optional Fields

- Loss Visibility
- Ambiguity Handling
- Degraded Signals
- Uncertain Signals
- Review Needed

Rules

- `Possible Losses` must state what may be lost, compressed, filtered, normalized, mistranslated, misread, or degraded through the interface.
- `Assumptions Made` must state assumptions the interface depends on.
- `Assumptions Not Made` must state tempting assumptions the interface must not silently make.
- Missing context should remain visible as missing context, not silently become settled fact.

### Failure Modes

Required Fields

- Failure Modes
- Misuse Risks
- Visible Failure Behavior

Optional Fields

- Safety Risks
- Privacy Risks
- Data Loss Risks
- Physical Risks
- Social Risks
- Recovery Behavior

Rules

- An interface definition should state known failure modes rather than only describing successful use.
- `Visible Failure Behavior` should explain how the interface should surface blocked crossings, uncertainty, unavailable material, unsafe conditions, or loss.
- Weak or lossy interfaces may still be useful when their boundaries are clear.

### Portability Notes

Required Fields

- Portable Semantics
- Environment Assumptions
- Non-Portable Details

Optional Fields

- Human Procedure Notes
- Digital Runtime Notes
- Physical Environment Notes
- LLM Runtime Notes
- Viewer Notes
- CLI Notes
- Extension Notes

Rules

- `Portable Semantics` must state what meaning should survive across implementations or environments.
- `Environment Assumptions` must state what a user, runtime, place, or implementation needs in order to use the interface.
- `Non-Portable Details` must state details that depend on a particular runtime, device, language, organization, source, permission model, body, place, or physical environment.

### File Naming

Allowed Shapes

- `tiinex.interface.v1.md`
- `<interface-slug>.interface.md`
- `<interface-slug>-interface.md`
- `<lineage>-interface.trace.md`
- `<lineage>-<interface-slug>.trace.md`

Rules

- `tiinex.interface.v1.md` is the reserved base interface contract filename for the `tiinex.interface.v1` interface family.
- Interface artifacts should use a slug that identifies the interface or interface family.
- Lineage-first `.trace.md` names should be used when the interface artifact is part of an ordinary local trace lineage.
- Canonical registry-like interface artifacts may use an interface slug without a lineage prefix when the artifact is intentionally maintained as a reusable interface definition.
- Canonical registry-like interface definitions may use `.interface.md` when the artifact is intentionally maintained as a reusable interface contract.
- `.interface.md` files define interface semantics; they are not executable implementations, interface runs, runtime logs, or validation result ledgers.

### Interpretation Boundaries

Rules

- Use `tiinex.interface.v1` to define interface semantics, not to record one interface use or handoff result.
- A specific interface use may reference an interface definition but should be owned by the schema that records that use.
- Adapter, viewer, navigation, instrument, and runtime-interface definitions may parent or reference broader interface definitions when that improves portable lineage.
- Interface definitions should stay human-readable and should not become language-specific interface documentation.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Name
- Version
- Interface Family
- Canonical Identifier
- Side A
- Side B
- Boundary Description
- May Cross
- Must Not Cross
- Mediation Purpose
- Transformation Allowed
- Transformation Not Allowed
- Inputs
- Contact Points
- Required Context
- Outputs
- Hand-Off Target
- Claims Made
- Claims Not Made
- Read Actions
- Write Actions
- Change Actions
- User-Required Actions
- Possible Losses
- Assumptions Made
- Assumptions Not Made
- Failure Modes
- Misuse Risks
- Visible Failure Behavior
- Portable Semantics
- Environment Assumptions
- Non-Portable Details

### Creation Rules

Rules

- Creation tools should prefer concrete boundary language over vague interface claims.
- Creation tools should not imply that an interface definition is proof of a successful handoff or successful interpretation.
- Creation tools should require explicit action boundaries before suggesting any interface that can write, send, publish, mutate, authenticate, physically handle, socially affect, or preserve material.
- Creation tools should default unknown authority, unknown preservation, unknown evidence, unknown consent, and unknown crossing permission to unknown, not assumed.
## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.interface.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Interface boundary for a map used by a traveler.

---

# Map Interface

## Interface Identity

- Name: Map interface
- Version: 1
- Interface Family: navigation surface
- Canonical Identifier: map.interface.v1
- Base Tool: tiinex.tool.v1

## Boundary And Sides

- Side A: terrain
- Side B: traveler
- Boundary Description: the map represents selected terrain features for traveler use
- May Cross: selected labels, routes, symbols, scale, and orientation cues
- Must Not Cross: complete terrain reality, current hazards, permission, ownership, or lived context unless separately recorded

## Mediation Role

- Mediation Purpose: help the traveler reason about movement through terrain
- Transformation Allowed: represent terrain as symbols and routes
- Transformation Not Allowed: silently claim current ground truth or safe passage

## Inputs And Contact Points

- Inputs: map, declared scale, selected location or route question
- Contact Points: visual map surface and traveler interpretation
- Required Context: map date, scale, legend, and known limits

## Outputs And Hand-Offs

- Outputs: route understanding or navigation decision support
- Hand-Off Target: traveler action or later navigation artifact
- Claims Made: the map represents selected features according to its declared limits
- Claims Not Made: safety, permission, current terrain condition, or complete knowledge

## Action Boundary

- Read Actions: read map symbols and route cues
- Write Actions: no writes by default
- Change Actions: no terrain change
- User-Required Actions: travel decisions and risk acceptance

## Loss And Assumption Boundary

- Possible Losses: scale reduction, omitted details, outdated features, symbol ambiguity
- Assumptions Made: reader can use the legend and orientation cues
- Assumptions Not Made: map is current, complete, safe, or authoritative

## Failure Modes

- Failure Modes: outdated map, wrong scale, wrong location, misunderstood symbol
- Misuse Risks: treating representation as complete terrain truth
- Visible Failure Behavior: mark unknown, uncertain, or out-of-scope information rather than inventing it

## Portability Notes

- Portable Semantics: bounded contact between representation and terrain-facing action
- Environment Assumptions: traveler can inspect the map and understand its legend
- Non-Portable Details: exact map medium, scale system, symbols, language, and local terrain
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

## Interpretation Notes

- interface definitions describe contact boundaries and handoffs, not successful use
- an interface can be physical, procedural, social, digital, runtime-based, or mixed
- interface output is not automatically truth, evidence, consent, identity, preservation, validation, or authority
- adapter definitions can specialize the interface family for boundary-crossing and translation work
- this schema intentionally keeps the human idea of an interface broader than software UI or API interfaces

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.tool.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tool/tiinex.tool.v1.schema.md)
  - Value: RPO2ix1CuC0YqN-nHwraBkf4prt_8WM207uAREfPK0w

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 8775xdn46EP8L5Es2NUPNK_zeHahvkrI0IrglP-uay0