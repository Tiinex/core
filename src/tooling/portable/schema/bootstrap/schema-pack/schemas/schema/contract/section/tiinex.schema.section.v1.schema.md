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
  - Current Schema: [tiinex.schema.section.v1](tiinex.schema.section.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines section-level contract nodes so schema headings, order, repeatability, and section obligations can be generated and checked without interpreting prose.
  - Summary: Schema section contract for bounded artifact sections and headings.

---


# Schema Section

## Summary

Defines a contract for a section in a schema-guided artifact.

A schema section is a bounded body area such as `## Annotation Target` or `## Interpretation Limits`. It gives humans a clear place to write material and gives tools a stable surface to generate, parse, validate, and display.

Schema section does not define the whole schema by itself. It does not make every sentence in the section deterministic. It declares the section boundary, heading, requirement state, ordering, repeatability, and allowed child contracts.

## Core Semantics

- Schema section = named body boundary with a stable contract role.
- Section heading and section handle should be distinct.
- A section may be required, optional, conditional, repeatable, or forbidden by a rule.
- A section may contain fields, child sections, examples, notes, or free text depending on its contract.
- Section order is guidance unless declared as required.
- Section contract must not silently create field-level semantics that are not declared.

## Schema Validation Contract

### Section Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.section.v1`

Rules

- `tiinex.schema.section.v1` identifies a contract node that describes one artifact section.
- Section artifacts must preserve section identity, target schema, heading, requirement state, and child contract boundary.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Section Body

Required Shape

- first body heading after the continuity envelope
- `## Section Identity` section
- `## Section Target` section
- `## Section Placement` section
- `## Section Requirements` section
- `## Child Contracts` section
- `## Interpretation Limits` section

Optional Sections

- `Section Content Boundary`
- `Generation Hints`
- `Validation Hints`
- `Presentation Hints`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Required sections should identify the section without relying on hidden app state.
- Section contracts should use scoped handles and continuity fingerprints for deterministic tooling while keeping logical section reference distinct from representation fingerprint and human-readable heading.

### Section Identity

Required Fields

- Section Handle
- Section Heading
- Section State

Optional Fields

- Section Kind
- Display Label
- Canonical Heading
- Deprecated Headings
- Aliases

Allowed Labels

- required
- optional
- conditional
- repeatable
- deprecated
- forbidden
- unknown

Rules

- Section Handle is scoped to the owning schema/contract and may remain stable across revisions while it denotes the same semantic section; a changed representation fingerprint does not by itself supersede the Section Handle.
- Section heading should be the human-facing heading expected in the artifact.
- Deprecated headings should be accepted only when the contract says so.

### Section Target

Required Fields

- Target Schema
- Target Scope

Optional Fields

- Parent Section
- Child Of
- Applies To Schema Family
- Applies To Artifact Kind

Rules

- Target schema must identify where the section contract applies.
- Target scope should state whether this is whole-schema, child-schema, artifact-type, or conditional.

### Section Placement

Required Fields

- Heading Level
- Order Policy

Optional Fields

- Order Index
- Before Section
- After Section
- Nesting Policy
- Repeat Key

Allowed Labels

- ordered
- unordered
- preferred-order
- before
- after
- nested
- top-level
- unknown

Rules

- Heading level should describe expected markdown depth or equivalent section depth.
- Order policy should distinguish strict order from preferred order.

### Section Requirements

Required Fields

- Required State

Optional Fields

- Condition
- Minimum Count
- Maximum Count
- Repeatable
- Empty Section Allowed
- Missing Handling

Allowed Labels

- required
- optional
- conditional
- repeatable
- forbidden
- unknown

Rules

- Required state must not be inferred from prose outside the contract node.
- Conditional requirements should reference a condition or rule contract when possible.

### Child Contracts

Required Fields

- Allowed Child Contract Types

Optional Fields

- Required Fields
- Optional Fields
- Allowed Child Sections
- Free Text Allowed
- Example Allowed

Allowed Labels

- field
- section
- rule
- example
- free-text
- note
- unknown

Rules

- Child contracts should describe what may appear inside the section.
- Free text allowed means prose may appear; it does not make that prose machine-executable.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Missing Context
- Tool Boundary

Rules

- Section presence does not guarantee semantic correctness of the section content.
- Section order does not prove chronology or priority unless separately declared.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a section contract when a schema builder, validator, or generator must know that a named section exists, is required, is optional, repeats, or has child contracts.
- Do not create a section contract to describe a one-off paragraph with no reusable contract role.

### Required Inputs

Required Fields

- Section Handle
- Section Heading
- Target Schema
- Required State
- Heading Level
- Child Contract Boundary
- Interpretation Limits

Optional Fields

- Order Index
- Condition
- Repeat Policy
- Generation Hints
- Presentation Hints

Rules

- Prefer a short stable handle and a clear human heading.
- Keep section identity separate from title/display conventions.

### Generation Rules

Rules

- Generate the heading exactly from `Section Heading` unless an override contract exists.
- Generate required sections before optional sections unless order policy says otherwise.
- When a section is conditional and the condition is unknown, mark the section as unknown or ask for input rather than guessing.

## Validation-Friendly Shape

- Section Handle, heading, target schema, requirement state, and heading level should be extractable as field values.
- Conditional requirements should point to `condition` or `schema.rule` where possible.
- Unknown section states must not be treated as pass.

## Minimal Example

```text
# Schema Section: Annotation Target

## Section Identity

Section Handle: annotation-target
Section Heading: Annotation Target
Section State: required

## Section Target

Target Schema: tiinex.annotation.v1
Target Scope: whole-schema

## Section Placement

Heading Level: 2
Order Policy: preferred-order
Order Index: 20

## Section Requirements

Required State: required
Empty Section Allowed: no

## Child Contracts

Allowed Child Contract Types: field, free-text
Required Fields: Target Kind, Target Identifier
Optional Fields: Target Artifact, Target Region, Target Span

## Interpretation Limits

Does Not Mean: the target is valid or true
Must Not Be Used To Claim: annotation value has been verified
```

## Relationship to Other Schemas

- `schema.field` may define fields inside a section.
- `schema.rule` may make section presence conditional.
- `schema.generation` may use section contracts to build artifact skeletons.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: WvQKn9T_BRdSDy-v361mz-ICJttKiIpHH349XYSa90A

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: g9ZhJRz1fgyLMmGaWn159oOVS_tqGRGCWIK81pNaPTE