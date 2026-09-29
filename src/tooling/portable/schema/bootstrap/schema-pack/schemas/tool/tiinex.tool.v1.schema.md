# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/3315351edc6fad7cc81e3fca9c68a3c02851b6f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.tool.v1](tiinex.tool.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for human-readable tool definitions that declare purpose, operating boundaries, action limits, interpretation limits, and portability.

---

# Tool

- Status: draft schema note

## Summary

This schema defines tool-definition artifacts.

A tool is something an actor can use to do work. It may be a physical implement, a social procedure, a written method, a digital viewer, a command-line utility, a runtime component, an adapter, a validator, a map, a checklist, or a spade.

A Tiinex tool definition does not begin by assuming software. It begins by asking a human question: what does this thing help someone do, what boundary does it operate inside, what must it not silently claim, and what should later readers know before trusting its output.

This schema exists so Tiinex tools can be described in a way that is useful to people and LLMs across environments. A browser viewer, a local CLI, a field checklist, an LLM runtime helper, and a physical workflow aid can all declare their purpose and limits without hiding those limits inside implementation code.

## Schema Validation Contract

### Tool Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.tool.v1`

Rules

- `tiinex.tool.v1` identifies artifacts whose main job is to define a reusable tool, tool contract, or tool method.
- A tool definition describes purpose and operating boundaries; it is not the tool run, the tool output, or proof that the tool was used correctly.
- A tool may be physical, procedural, social, digital, runtime-based, or mixed.
- Tool definitions must make purpose, operator boundary, input boundary, output boundary, action boundary, interpretation boundary, failure modes, and portability explicit.
- A tool definition must not silently become a source of truth, a validator result, a runtime log, an adapter result, or an evidence ledger.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Tool Body

Required Shape

- first body heading after the continuity envelope
- `## Tool Identity` section
- `## Purpose And Scope` section
- `## Operating Boundary` section
- `## Inputs And Materials` section
- `## Outputs And Claims` section
- `## Action Boundary` section
- `## Interpretation Boundary` section
- `## Failure Modes` section
- `## Portability Notes` section

Optional Sections

- Operator Model
- Required Context
- Human Use
- Machine Use
- Interface Boundary
- Read Boundary
- Write Boundary
- Safety Boundary
- Privacy Boundary
- Examples
- Related Tools
- Not Recommended For

Rules

- A tool artifact should begin with a human-readable tool name.
- Required sections should be readable by a human without knowing the implementation language.
- Required sections should be structured enough that a tool or LLM can extract tool purpose, limits, and expected outputs.
- A tool definition should distinguish the tool, the actor using the tool, the material acted on, the action performed, and the output or claim produced.
- A tool definition must not claim executable behavior unless it identifies a concrete implementation or operating surface separately from the tool contract.

### Tool Identity

Required Fields

- Name
- Version
- Tool Family
- Canonical Identifier

Optional Fields

- Base Tool
- Supersedes
- Related Tool
- Implementation Surface
- Maintainer Surface

Rules

- `Name` should be stable enough for human-readable UI, review surfaces, and documentation.
- `Canonical Identifier` should be the stable machine-readable tool id used by registries, generated artifacts, and references.
- `Version` should change when purpose, operating boundary, action boundary, interpretation semantics, or failure handling changes.
- `Tool Family` should identify the broad class, such as physical implement, navigation aid, interface, adapter, validator, checklist, runtime helper, authoring aid, or field method.
- `Base Tool` should be used when a concrete tool inherits a broader tool contract.

### Purpose And Scope

Required Fields

- Purpose
- In Scope
- Out Of Scope

Optional Fields

- Intended Users
- Intended Environment
- Non-Goals
- Success Signals

Rules

- `Purpose` must state what work the tool helps an actor do.
- `In Scope` must state what the tool is meant to handle.
- `Out Of Scope` must state important work the tool is not meant to handle.
- A tool definition should avoid becoming a vague capability list; it should keep the intended work bounded.

### Operating Boundary

Required Fields

- Operator
- Operating Environment
- Authority Boundary

Optional Fields

- Required Permissions
- Required Training
- Required Equipment
- Runtime Boundary
- Human Review Boundary

Rules

- `Operator` must state who or what uses the tool, such as a person, team, LLM agent, runtime, app, extension, CLI, or mixed actor.
- `Operating Environment` must state where the tool is used.
- `Authority Boundary` must state what authority the tool does not have by itself.
- A tool must not hide human approval, organizational authority, authentication, write permission, or physical access behind a generic tool label.

### Inputs And Materials

Required Fields

- Inputs
- Materials
- Does Not Require

Optional Fields

- Source Types
- Required Context
- Optional Context
- Material Volatility
- Material Ownership

Rules

- `Inputs` must state the direct inputs the tool needs.
- `Materials` must state what the tool works on or with.
- `Does Not Require` should state common assumptions that are not required.
- Input material should not be treated as preserved evidence unless a preservation artifact or explicit preservation action says so.

### Outputs And Claims

Required Fields

- Outputs
- Claims Made
- Claims Not Made

Optional Fields

- Output Schemas
- Output Surfaces
- Review State
- Confidence Language

Rules

- `Outputs` must state what the tool may produce.
- `Claims Made` must state what positive claim the output can support.
- `Claims Not Made` must state important claims the output must not imply.
- Tool outputs should use scoped language rather than generic trust words.
- A tool output must not imply truth, authorship, consent, identity, safety, legality, or preservation unless those claims are inside the declared output boundary.

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

- `Read Actions` must state what the tool may inspect or observe.
- `Write Actions` must state whether the tool can write, publish, upload, send, mutate, commit, annotate, or record anything.
- `Change Actions` must state whether the tool can change material, environment, social state, runtime state, or physical state.
- `User-Required Actions` must state actions that require explicit human choice.
- Hidden writes, hidden uploads, hidden auth, hidden physical handling, hidden social consent, and hidden destructive actions are not allowed under this schema.

### Interpretation Boundary

Required Fields

- Interpretation Allowed
- Interpretation Not Allowed
- Human Review Needed

Optional Fields

- LLM Limits
- Ambiguity Handling
- Default Status
- Promotion Boundary

Rules

- `Interpretation Allowed` must state what interpretations the tool may make or suggest.
- `Interpretation Not Allowed` must state what the tool must not silently infer.
- `Human Review Needed` must state where user review is required before stronger claims or actions.
- A tool must not fill missing lineage, missing source material, missing consent, missing evidence, missing authority, or missing truth with guesses.

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

Rules

- A tool definition should state known failure modes rather than only describing successful use.
- `Visible Failure Behavior` should explain how the tool should surface gaps, uncertainty, unavailable material, or unsafe conditions.
- Weak tools may still be useful when their boundaries are clear.

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
- `Environment Assumptions` must state what a user, runtime, place, or implementation needs in order to use the tool.
- `Non-Portable Details` must state details that depend on a particular runtime, device, language, organization, source, permission model, body, place, or physical environment.

### File Naming

Allowed Shapes

- `tiinex.tool.v1.md`
- `<tool-slug>.tool.md`
- `<tool-slug>-tool.md`
- `<lineage>-tool.trace.md`
- `<lineage>-<tool-slug>.trace.md`

Rules

- `tiinex.tool.v1.md` is the reserved base tool contract filename for the `tiinex.tool.v1` tool family.
- Tool artifacts should use a slug that identifies the tool or tool family.
- Lineage-first `.trace.md` names should be used when the tool artifact is part of an ordinary local trace lineage.
- Canonical registry-like tool artifacts may use a tool slug without a lineage prefix when the artifact is intentionally maintained as a reusable tool definition.
- Canonical registry-like tool definitions may use `.tool.md` when the artifact is intentionally maintained as a reusable tool contract.
- `.tool.md` files define tool semantics; they are not executable implementations, tool runs, runtime logs, or validation result ledgers.

### Interpretation Boundaries

Rules

- Use `tiinex.tool.v1` to define tool semantics, not to record one tool run.
- A specific tool run may reference a tool definition but should be owned by the schema that records that run.
- Interface, adapter, validator, navigation, runtime helper, and viewer definitions may parent or reference broader tool definitions when that improves portable lineage.
- Tool definitions should stay human-readable and should not become language-specific interface documentation.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Name
- Version
- Tool Family
- Canonical Identifier
- Purpose
- In Scope
- Out Of Scope
- Operator
- Operating Environment
- Authority Boundary
- Inputs
- Materials
- Outputs
- Claims Made
- Claims Not Made
- Read Actions
- Write Actions
- Change Actions
- User-Required Actions
- Interpretation Allowed
- Interpretation Not Allowed
- Human Review Needed
- Failure Modes
- Misuse Risks
- Visible Failure Behavior
- Portable Semantics
- Environment Assumptions
- Non-Portable Details

### Creation Rules

Rules

- Creation tools should prefer scoped, human-readable tool definitions over code-specific interface documentation.
- Creation tools should not imply that a tool definition is proof of a successful tool run.
- Creation tools should require explicit action boundaries before suggesting any tool that can write, send, publish, mutate, authenticate, physically handle, or socially affect material.
- Creation tools should default unknown authority, unknown preservation, unknown evidence, and unknown consent to unknown, not assumed.
## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.tool.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Tool boundary for a human-readable checklist.

---

# Field Checklist Tool

## Tool Identity

- Name: Field checklist tool
- Version: 1
- Tool Family: checklist
- Canonical Identifier: field.checklist.v1

## Purpose And Scope

- Purpose: help a person inspect a bounded field object consistently
- In Scope: visible checklist items and declared observations
- Out Of Scope: proving truth, ownership, consent, or complete context

## Operating Boundary

- Operator: person using the checklist
- Operating Environment: declared inspection setting
- Authority Boundary: the checklist does not grant access, permission, or expertise by itself

## Inputs And Materials

- Inputs: checklist and selected object
- Materials: inspected object and visible conditions
- Does Not Require: software runtime

## Outputs And Claims

- Outputs: completed checklist notes
- Claims Made: observations were recorded according to the checklist
- Claims Not Made: truth, evidence, consent, or complete coverage

## Action Boundary

- Read Actions: inspect visible object state
- Write Actions: write checklist notes
- Change Actions: no object changes by default
- User-Required Actions: any handling or preservation action

## Interpretation Boundary

- Interpretation Allowed: classify checklist item as seen, not seen, unknown, or not applicable
- Interpretation Not Allowed: infer hidden state or missing authority
- Human Review Needed: before treating observations as evidence

## Failure Modes

- Failure Modes: incomplete inspection, ambiguous item, wrong object, poor visibility
- Misuse Risks: treating checklist completion as proof of truth
- Visible Failure Behavior: record unknown or not inspected rather than inventing observations

## Portability Notes

- Portable Semantics: bounded tool purpose, action boundary, and interpretation limits
- Environment Assumptions: person can inspect selected object
- Non-Portable Details: exact form layout, device, language, and local procedure
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

## Interpretation Notes

- tool definitions describe purpose and boundaries, not successful tool use
- a tool can be physical, procedural, digital, social, runtime-based, or mixed
- tool output is not automatically truth, evidence, consent, identity, preservation, validation, or authority
- interface and adapter definitions can specialize the tool family without forcing every tool to be software
- this schema intentionally stays broad enough for a spade, a map, a checklist, a viewer, a CLI, an LLM runtime helper, and an adapter

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/3315351edc6fad7cc81e3fca9c68a3c02851b6f6/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: nguX8EEoH0g84fBHjMds2X0rDahEyc2eEw_b2KJTXmg