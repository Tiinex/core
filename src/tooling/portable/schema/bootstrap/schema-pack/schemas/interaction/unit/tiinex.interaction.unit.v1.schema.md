# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.interaction.unit.v1](tiinex.interaction.unit.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines a human-first dynamic unit that can be observed, asked, filled, shown, validated, audited, or implemented across environments without hiding provenance inside application code.
  - Summary: Portable interaction unit schema for schema building, form building, viewing, audit targeting, prompts, and presentation surfaces.

---

# Interaction Unit

## Summary

Defines a human-readable and machine-extractable unit of interaction or interpretation.

An interaction unit is not a React component, form widget, validator, viewer, CLI prompt, database column, or code field. It records the meaning of a bounded thing that may need to be observed, asked, entered, shown, validated, audited, transformed, or implemented in different environments.

The same unit may be rendered as a paper checklist row, CLI prompt, React field, viewer badge, audit target, LLM instruction, or spoken question. Those renderings are implementations of the unit; they are not the semantic source of the unit.

## Core Semantics

- An interaction unit describes a bounded semantic unit that can participate in human or tool interaction.
- An interaction unit should be readable by a person without knowing a specific app, framework, programming language, database, or UI toolkit.
- An interaction unit may support schema builders, form builders, viewers, validators, audit reports, adapters, portals, and presentation surfaces.
- An interaction unit does not by itself validate an artifact.
- An interaction unit does not by itself prove truth, authorship, consent, evidence status, source completeness, or preservation.
- An interaction unit may reference validation methods, but validation results belong in validation findings or validation reports.
- Software implementations should treat the unit as a semantic contract, not as a component instruction.

## Schema Validation Contract

### Interaction Unit Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.interaction.unit.v1`

Rules

- `tiinex.interaction.unit.v1` identifies artifacts whose main job is to define the semantics, boundaries, and implementation-neutral affordances of a unit.
- An interaction unit must keep unit identity, semantic role, definition binding, value boundary, interaction boundary, interpretation limits, and optional implementation hints distinct.
- A unit may describe how it can be asked, shown, filled, or audited, but it must not require any particular UI framework, programming language, database, or runtime.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Interaction Unit Body

Required Shape

- first body heading after the continuity envelope
- `## Unit Identity` section
- `## Semantic Role` section
- `## Definition Binding` section
- `## Value Boundary` section
- `## Interaction Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Validation Binding`
- `Presentation Hints`
- `Form Hints`
- `Viewer Hints`
- `Audit Hints`
- `Implementation Notes`
- `Examples`
- `Related Units`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough for humans, tools, and LLMs to extract boundaries without guessing.
- Optional hint sections must not replace semantic role, value boundary, definition binding, or interpretation limits.

### Unit Identity

Required Fields

- Name
- Unit ID
- Unit Kind
- Stability

Optional Fields

- Version
- Owner Schema
- Owner Module
- Parent Unit
- Related Unit

Allowed Labels

- field
- section
- choice
- prompt
- action-target
- audit-target
- relationship
- source-anchor
- presentation-slot
- validation-target
- derived-value
- instruction

Rules

- `Unit ID` should be stable enough for schema builders, form builders, viewers, audit reports, and implementation libraries to reference.
- `Unit Kind` should describe the semantic kind of the unit, not the UI widget used to render it.
- `Stability` should state whether the unit is draft, experimental, maintained, deprecated, or replaced.

### Semantic Role

Required Fields

- Role
- Meaning
- Used For

Optional Fields

- Not Used For
- User Question
- Human Instruction
- Machine Use

Rules

- `Meaning` must describe the unit in human-readable terms.
- `Used For` must state why the unit matters.
- The role must not be defined only by a UI component, CSS class, database column, or code function.

### Definition Binding

Required Fields

- Declared In
- Definition Source

Optional Fields

- Belongs To
- Source Binding
- Source Schema
- Source Section
- Source Field
- Source Artifact
- Source Portal
- Source Adapter
- Derivation
- Generated By

Rules

- `Definition Binding` must explain where the unit's semantics come from or what artifact, schema, module, source, or derivation declares them.
- `Declared In` may point to a schema, schema module, artifact, source, portal, tool, interface, or local draft context.
- `Source Binding` is optional and should be used only when the unit is actually bound to a source in the source-schema sense.
- If the unit is derived rather than directly recorded, `Derivation` should explain the derivation boundary.
- Definition binding must not collapse source, adapter, portal, finding, evidence, validation result, module, or interface into one concept.

### Value Boundary

Required Fields

- Expected Value
- Required State

Optional Fields

- Value Type
- Allowed Values
- Cardinality
- Default
- Empty State
- Unknown State
- Example Values

Allowed Labels

- required
- optional
- conditional
- unknown
- not-applicable
- unavailable
- derived

Rules

- `Expected Value` must be understandable by a human reader.
- `Required State` should distinguish required, optional, conditional, unknown, not-applicable, unavailable, and derived values.
- If allowed values are listed, they should be treated as a controlled vocabulary for the unit unless stated otherwise.

### Interaction Boundary

Required Fields

- May Be Asked As
- May Be Provided By

Optional Fields

- May Be Edited By
- May Be Confirmed By
- May Be Cleared By
- Requires Human Choice
- Requires Tool Capability
- User Input Risk

Rules

- `May Be Asked As` should be a human-readable question or instruction.
- `May Be Provided By` should state whether the unit may come from a person, tool, source, adapter, portal, derivation, schema module, or imported artifact.
- If user input may affect provenance or validation strength, the risk should be explicit.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Known Ambiguities
- Trust Boundary
- Overclaim Risk
- Missing Context

Rules

- `Does Not Mean` must state important claims the unit does not support.
- A unit must not imply validation, evidence, source completeness, preservation, identity, consent, authorship, or truth unless those claims are explicitly owned by another artifact or method.

## Recommended Optional Sections

### Validation Binding

Allowed Labels

- Validation Methods
- Validation Targets
- Audit Relevance
- Report Mapping
- Finding Mapping
- Unavailable Method Behavior

Rules

- Validation binding should reference validation method identities or module-provided implementations when known.
- Validation binding does not itself produce validation results.
- Unknown or unavailable validation methods should be reportable as unknown, unavailable, skipped, or unconfirmed rather than silently ignored.

### Presentation Hints

Allowed Labels

- May Be Shown As
- Surfaces
- Priority
- Compact Label
- Detail Label
- Grouping
- Ordering

Rules

- Presentation hints are advisory unless another artifact declares them mandatory.
- Presentation hints must be implementation-neutral. Prefer `badge`, `metadata row`, `section`, `checklist item`, `prompt`, `timeline item`, or `graph node label` over framework-specific component names.

### Form Hints

Allowed Labels

- Input Shape
- Placeholder
- Help Text
- Multi Value
- Confirmation Step
- Suggested Choices

Rules

- Form hints describe how the unit may be collected, not what UI library must be used.
- Form hints must not change the unit's semantic meaning.

### Viewer Hints

Allowed Labels

- Viewer Role
- Compact Display
- Detail Display
- Disclosure Level
- Redaction Behavior

Rules

- Viewer hints describe possible presentation roles.
- Viewer hints must not hide interpretation limits when the unit is used to support a claim.

### Audit Hints

Allowed Labels

- Audit Target
- Expected Validator
- Missing Value Severity
- Unknown Value Severity
- Overclaim Checks

Rules

- Audit hints help map the unit into validation methods or reports.
- Audit hints do not themselves prove validation success.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.interaction.unit.v1` artifact when a portable semantic unit must be shared across schema building, form building, viewing, audit targeting, prompts, or presentation surfaces.
- Do not create this artifact for a concrete UI component, React prop, component contract, database column by itself, validation result, evidence claim, generic source, or adapter.
- An interaction unit should describe meaning and use boundaries before any framework, component, storage, or implementation mapping.

### Required Inputs

Required Fields

- Unit Name
- Unit Id
- Unit Kind
- Stability
- Semantic Role
- Human-Readable Meaning
- Used-For Boundary
- Definition Binding
- Expected Value
- Required State
- May Be Asked As
- May Be Provided By
- Interpretation Limits

Optional Fields

- Validation Hints
- Presentation Hints
- Form Hints
- Viewer Hints
- Audit Hints
- Related Surface
- Related Module
- Related Condition

Rules

- The definition binding should say where the unit semantics are declared, derived, or constrained.
- Presentation, form, viewer, audit, and implementation hints must remain subordinate to the semantic unit boundary.
- A unit must not silently become evidence, truth, validation, consent, authority, or a framework-specific component.

### Generation Rules

Rules

- Name the unit in human-readable terms.
- Assign a stable unit id.
- State the semantic role without using framework-specific vocabulary as authority.
- Record where the unit is declared or derived from.
- State expected value and required state.
- State how a human or tool may ask for or provide the unit.
- Add validation, presentation, form, viewer, or audit hints only when they clarify implementation-neutral behavior.
- State what the unit does not mean and what must not be claimed from it.

### Suggested Sequence

Rules

- Identify the semantic unit and its stable id.
- State the unit kind, role, and meaning.
- Bind the unit to a schema, module, artifact, derivation, or other definition source.
- Declare expected value and required state.
- Declare asking, providing, presenting, and auditing boundaries.
- Declare interpretation limits.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Creation guidance should be derived from the same required sections, fields, labels, and rules whenever possible.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Current Schema Interaction Unit

## Unit Identity

Name: Current Schema
Unit ID: root.current.schema
Unit Kind: field
Stability: draft
Owner Schema: tiinex.root.v1

## Semantic Role

Role: schema identity
Meaning: Identifies the schema the artifact currently claims to follow.
Used For: continuity interpretation, schema-specific validation, viewer selection, form generation, audit targeting
User Question: Which schema does this artifact currently follow?

## Definition Binding

Declared In: tiinex.root.v1
Definition Source: Continuity Context -> Current -> Current Schema
Belongs To: Current continuity context
Source Schema: tiinex.root.v1

## Value Boundary

Expected Value: stable Tiinex schema identifier
Required State: required
Value Type: schema-id
Example Values: tiinex.discovery.finding.v1, tiinex.validation.report.v1

## Interaction Boundary

May Be Asked As: Which schema should this artifact follow now?
May Be Provided By: person, schema builder, imported artifact, tool-derived draft
Requires Human Choice: when the source artifact does not already declare a current schema

## Presentation Hints

May Be Shown As: metadata row, badge, form field, checklist item, spoken prompt
Surfaces: card, detail, form, audit report, CLI, LLM prompt

## Validation Binding

Validation Methods: root-envelope-shape
Audit Relevance: root continuity validation

## Interpretation Limits

Does Not Mean: the artifact is valid under that schema
Must Not Be Used To Claim: truth, authorship, consent, source completeness, preservation, or evidence status
```

## Relationship to Other Schemas

- `schema.family` may define the family that owns or groups interaction units.
- `schema.module` may declare which units a capability bundle can expose.
- `presentation.surface` may declare where units can be displayed, asked, edited, or audited.
- `validation.method` may define methods that validate units or artifacts containing units.
- `validation.report` may report validation outcomes for units.
- `interface` may describe a user-facing boundary that exposes units.
- `tool` may describe a tool that reads, writes, validates, or renders units.
- `portal` may provide bounded source context from which units are derived or resolved.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: WpscRdDhk2ExMntqslfDnxUaB5Vj7kJg9ObJkTlSvHI