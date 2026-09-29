# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.schema.contract.v1](../tiinex.schema.contract.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.schema.contract.v1.schema.md](../tiinex.schema.contract.v1.schema.md)
  - Origin:
    - [relative](../tiinex.schema.contract.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.value.v1](tiinex.schema.value.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines value-domain contract nodes so expected value types, formats, units, enumerations, cardinality, and reference boundaries can be checked and generated reliably.
  - Summary: Schema value contract for reusable value domains and constraints.

---


# Schema Value

## Summary

Defines a contract for a value domain used by schema fields and rules.

A schema value contract describes what kind of value may be written, generated, parsed, displayed, or checked. It may describe plain text, numbers, dates, links, references, enums, lists, mappings, coordinates, geometries, severities, states, or other bounded values.

Schema value is not a programming type. It is a provenance-friendly value boundary that humans and tools can share.

## Core Semantics

- Schema value = expected value domain and reading boundary.
- Value kind, format, unit, cardinality, and allowed values should be explicit when needed for reliable tooling.
- Value contracts may be reused by fields and rules.
- A valid-looking value does not prove truth, existence, authority, or verification.
- Unknown value constraints should be explicit rather than guessed.

## Schema Validation Contract

### Value Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.value.v1`

Rules

- `tiinex.schema.value.v1` identifies a contract node for a reusable value domain or value constraint.
- Value artifacts must preserve value identity, value kind, format or domain, cardinality, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Value Body

Required Shape

- first body heading after the continuity envelope
- `## Value Identity` section
- `## Value Domain` section
- `## Value Constraints` section
- `## Interpretation Limits` section

Optional Sections

- `Allowed Values`
- `Reference Boundary`
- `Unit Boundary`
- `Coordinate Boundary`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Required sections should make the value domain clear to humans and tools.
- A value contract should not perform validation beyond the constraints it declares.

### Value Identity

Required Fields

- Value Handle
- Value Label
- Value Kind

Optional Fields

- Value Version
- Reusable Name
- Display Label
- Aliases

Allowed Labels

- text
- markdown
- number
- integer
- decimal
- boolean
- date
- time
- datetime
- uri
- relative-link
- artifact-reference
- schema-reference
- source-reference
- enum
- list
- mapping
- coordinate
- geometry
- severity
- state
- unknown

Rules

- Value Handle should remain stable within the artifact when reused by field or rule contracts.
- Value kind should be specific enough for a tool to choose a parsing/checking strategy when possible.

### Value Domain

Required Fields

- Domain Description

Optional Fields

- Base Kind
- Reference Kind
- Coordinate System
- Unit
- Vocabulary
- Allowed Values
- Unknown Value Policy

Rules

- Domain description must describe the value boundary, not the truth of the value.
- Reference values must identify the reference kind when known.
- Coordinate values must state coordinate system or reference frame when coordinate interpretation matters.

### Value Constraints

Required Fields

- Cardinality

Optional Fields

- Minimum Count
- Maximum Count
- Minimum Value
- Maximum Value
- Pattern
- Format
- Precision
- Required Components
- Forbidden Components

Allowed Labels

- one
- zero-or-one
- one-or-more
- zero-or-more
- list
- mapping
- unknown

Rules

- Cardinality should say how many values may appear.
- Pattern and format constraints are deterministic only when written explicitly.
- Required components should be declared for composite values such as coordinates.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Validation Boundary
- Existence Boundary
- Truth Boundary

Rules

- A value that matches a format does not prove source existence or semantic truth.
- A reference value is unresolved until a source resolution or validation method resolves it.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a value contract when multiple fields or rules need the same value domain or when a value needs deterministic parsing, generation, or validation.
- Do not create a value contract for a one-off free-text note unless the value boundary matters.

### Required Inputs

Required Fields

- Value Handle
- Value Label
- Value Kind
- Domain Description
- Cardinality
- Interpretation Limits

Optional Fields

- Allowed Values
- Format
- Pattern
- Unit
- Reference Kind
- Coordinate System
- Examples

Rules

- Use plain allowed values for enum-like domains.
- State unknown and unavailable policies where a value may be missing.

### Generation Rules

Rules

- Use the value kind to choose a safe default input representation.
- Do not generate values outside declared allowed values for enum domains.
- For unresolved references, generate an explicit unresolved or unknown value rather than a fabricated target.

## Validation-Friendly Shape

- Value Handle, kind, cardinality, allowed values, and format should be extractable as field values.
- Composite values should identify required components.
- Matching a value contract validates only the declared value boundary.

## Minimal Example

```text
# Schema Value: WGS84 coordinate

## Value Identity

Value Handle: wgs84-coordinate
Value Label: WGS84 Coordinate
Value Kind: coordinate

## Value Domain

Domain Description: geographic latitude and longitude in WGS84
Coordinate System: WGS84

## Value Constraints

Cardinality: one
Required Components: Latitude, Longitude
Minimum Value: Latitude -90, Longitude -180
Maximum Value: Latitude 90, Longitude 180

## Interpretation Limits

Does Not Mean: the target was created at this place or depicts this place
Must Not Be Used To Claim: verified location without a separate verification method
```

## Relationship to Other Schemas

- `schema.field` may reference value contracts.
- `spatial.annotation` may use coordinate value contracts.
- `schema.rule` may check value constraints.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: WvQKn9T_BRdSDy-v361mz-ICJttKiIpHH349XYSa90A

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: x1mSMhZ8CxuKLxdT0AD1jq7GSXvlJXLqETBd3DWS0YU