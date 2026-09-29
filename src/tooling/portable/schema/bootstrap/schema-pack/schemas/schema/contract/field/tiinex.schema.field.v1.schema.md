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
  - Current Schema: [tiinex.schema.field.v1](tiinex.schema.field.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines field-level contract nodes so schema builders and validators can know labels, keys, value types, cardinality, requirement state, and messages without reinterpreting prose.
  - Summary: Schema field contract for individual named values inside schema-guided artifacts.

---


# Schema Field

## Summary

Defines a contract for one named field or input slot in a schema-guided artifact.

A schema field is a bounded place where an author, adapter, validator, LLM, or tool can put a value such as `Target Artifact`, `Annotation Kind`, `Latitude`, `Severity`, or `Parent Schema`. The field contract makes the field readable by humans and extractable by tools.

Schema field does not guarantee that the value is true, verified, complete, or meaningful. It only declares the expected field surface and value boundary.

## Core Semantics

- Schema field = named value slot within a section or contract node.
- Field label is human-facing; field handle is stable; machine key is optional but useful.
- A field may be required, optional, conditional, repeatable, or forbidden by a rule.
- A field should reference a value contract when format, domain, or cardinality matters.
- Field value must remain separate from claims, evidence, validation, or interpretation unless a separate schema owns those semantics.

## Schema Validation Contract

### Field Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.field.v1`

Rules

- `tiinex.schema.field.v1` identifies a contract node for one field in a schema-guided artifact.
- Field artifacts must preserve field identity, target schema, containing section, requirement state, value boundary, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Field Body

Required Shape

- first body heading after the continuity envelope
- `## Field Identity` section
- `## Field Target` section
- `## Field Requirement` section
- `## Value Contract` section
- `## Interpretation Limits` section

Optional Sections

- `Cardinality`
- `Defaulting`
- `Extraction Hints`
- `Generation Hints`
- `Validation Hints`
- `Presentation Hints`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Field contracts should identify a stable field handle and human-facing field label.
- Field contracts should not require hidden application registries for their basic meaning.

### Field Identity

Required Fields

- Field Handle
- Field Label
- Field State

Optional Fields

- Machine Key
- Display Label
- Aliases
- Deprecated Labels
- Field Kind

Allowed Labels

- required
- optional
- conditional
- repeatable
- deprecated
- forbidden
- unknown

Rules

- Field Handle is scoped to the owning schema/contract and may remain stable across revisions while it denotes the same semantic field; a changed representation fingerprint does not by itself supersede the Field Handle.
- Field label should match the artifact-facing label unless a display override is declared.
- Deprecated labels must not be preferred for new generation.

### Field Target

Required Fields

- Target Schema
- Target Section

Optional Fields

- Target Contract
- Applies To Artifact Kind
- Applies To Schema Family
- Parent Field
- Related Field

Rules

- Target schema and target section must state where the field belongs.
- Related fields should not create requirements unless a rule contract states the relation.

### Field Requirement

Required Fields

- Required State

Optional Fields

- Condition
- Missing Handling
- Empty Value Allowed
- Derived Allowed
- Human Input Required

Allowed Labels

- required
- optional
- conditional
- forbidden
- derived
- unknown

Rules

- Required state should be directly extractable.
- Conditional fields should reference a condition or rule contract.
- Derived fields must identify the derivation or method if used for validation or generation.

### Value Contract

Required Fields

- Value Type

Optional Fields

- Value Schema
- Allowed Values
- Value Format
- Value Unit
- Minimum Value
- Maximum Value
- Pattern
- Cardinality
- Default Value
- Example Value

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
- unknown

Rules

- Value type should be specific enough for a tool to choose a form control or validator when possible.
- Allowed values should be plain values when deterministic comparison is expected.
- Pattern and format constraints should be treated as machine-facing only when explicitly declared.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Validation Boundary
- Generation Boundary
- Human Review Boundary

Rules

- Field presence does not prove value truth.
- A value that looks like a reference does not prove the referenced target exists unless resolved by a source or validation method.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a field contract when a named value should be generated, validated, rendered, extracted, or reused reliably.
- Do not create a field contract for a one-off prose phrase with no stable field role.

### Required Inputs

Required Fields

- Field Handle
- Field Label
- Target Schema
- Target Section
- Required State
- Value Type
- Interpretation Limits

Optional Fields

- Machine Key
- Allowed Values
- Cardinality
- Default Value
- Example Value
- Condition

Rules

- Prefer stable field handles and plain labels.
- Keep value type separate from interpretation of the value.

### Generation Rules

Rules

- Generate field labels exactly from `Field Label` unless a display override exists.
- Ask for required human input when no default, derivation, or adapter source is declared.
- For enum fields, present allowed values without inventing extra values.
- For unknown required fields, generate an explicit unknown marker rather than omitting the field silently.

## Validation-Friendly Shape

- Field Handle, label, target section, required state, and value type should be extractable as field values.
- Allowed values should be line-oriented values under a clear field or category.
- Unknown value types must not be treated as valid by default.

## Minimal Example

```text
# Schema Field: Annotation Kind

## Field Identity

Field Handle: annotation-kind
Field Label: Annotation Kind
Field State: required

## Field Target

Target Schema: tiinex.annotation.v1
Target Section: Annotation Identity

## Field Requirement

Required State: required
Empty Value Allowed: no

## Value Contract

Value Type: enum
Allowed Values: note, label, coordinate, region, style-warning, validation-signal, adapter-observation, semantic-tag, temporal-marker, projection, metadata-extraction, unknown
Example Value: coordinate

## Interpretation Limits

Does Not Mean: the annotation value is true
Must Not Be Used To Claim: the annotated target has been validated or preserved
```

## Relationship to Other Schemas

- `schema.section` owns section boundaries.
- `schema.value` may define reusable value domains.
- `schema.rule` may define field dependencies and validation conditions.
- `interaction.unit` may turn field contracts into form or interaction units.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: WvQKn9T_BRdSDy-v361mz-ICJttKiIpHH349XYSa90A

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: syT_j2nw_JS5zeNQT_apF6Ostpf2Co20sU0TEl9XO50