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
  - Current Schema: [tiinex.schema.relation.v1](tiinex.schema.relation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines relation contract nodes so schemas, sections, fields, values, rules, annotations, and artifacts can express cardinality and dependency relationships without hidden app assumptions.
  - Summary: Schema relation contract for explicit relationships among contract nodes and schema-guided artifacts.

---


# Schema Relation

## Summary

Defines a contract for a relationship between two or more schema contract targets.

A schema relation may connect schemas, sections, fields, values, rules, generation steps, annotations, artifacts, or other bounded nodes. It supports one-to-one, one-to-many, many-to-one, many-to-many, references, contains, depends-on, derives-from, targets, refines, excludes, and related relationships.

Schema relation does not make a database, graph engine, or app registry the semantic authority. It preserves relation intent and cardinality so humans and tools can reason about structure explicitly.

Schema relation does not replace [`tiinex.relation.v1`](../../../relation/tiinex.relation.v1.schema.md). Use `tiinex.relation.v1` for ordinary provenance and domain relations between artifacts, payloads, claims, people, systems, or bounded targets. Use `tiinex.schema.relation.v1` for schema-contract and metamodel relations among schemas, sections, fields, values, rules, examples, generation steps, and related contract nodes.

## Core Semantics

- Schema relation = explicit relationship between schema-contract or metamodel targets.
- Relation endpoints must be named.
- Relation type and cardinality should be explicit when they affect validation, generation, forms, views, or interpretation.
- A relation may require source resolution or validation before it is considered resolved.
- A relation does not prove truth, evidence, preservation, or source completeness by itself.

## Schema Validation Contract

### Relation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.relation.v1`

Rules

- `tiinex.schema.relation.v1` identifies a contract node for a relationship between schema-guided targets.
- Relation artifacts must preserve relation identity, endpoints, relation kind, cardinality, state, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Relation Body

Required Shape

- first body heading after the continuity envelope
- `## Relation Identity` section
- `## Relation Endpoints` section
- `## Relation Semantics` section
- `## Relation Cardinality` section
- `## Relation State` section
- `## Interpretation Limits` section

Optional Sections

- `Resolution Boundary`
- `Validation Binding`
- `Generation Binding`
- `Presentation Binding`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Endpoints should identify contract handles or fingerprints, schema references, artifact references, or selectors where possible.
- Relation semantics should be field-readable rather than hidden in prose.

### Relation Identity

Required Fields

- Relation Handle
- Relation Name
- Relation Kind

Optional Fields

- Relation Version
- Relation Family
- Relation Owner

Allowed Labels

- references
- contains
- targets
- depends-on
- derives-from
- refines
- extends
- excludes
- implies
- parent-of
- child-of
- many-to-one
- one-to-many
- many-to-many
- related
- unknown

Rules

- Relation Handle is scoped to the target contract and should remain unique there; it may remain stable across revisions while it denotes the same semantic contract relation, and checksum/fingerprint changes do not automatically supersede it.
- Relation kind should describe the semantic relationship, not only the visual connection.

### Relation Endpoints

Required Fields

- Source Endpoint
- Target Endpoint

Optional Fields

- Source Endpoint Kind
- Target Endpoint Kind
- Source Selector
- Target Selector
- Intermediate Endpoint
- Endpoint Resolution Method

Allowed Labels

- schema
- section
- field
- value
- rule
- generation
- annotation
- artifact
- source
- region
- unknown

Rules

- Source and target endpoints must be distinguishable.
- Unknown or unresolved endpoints should be explicit.
- Endpoint kind should be stated when relation handling depends on it.

### Relation Semantics

Required Fields

- Relation Meaning

Optional Fields

- Directionality
- Requiredness
- Condition
- Inverse Relation
- Transitive
- Symmetric
- Allows Unresolved Target

Allowed Labels

- directed
- undirected
- bidirectional
- required
- optional
- conditional
- unresolved-allowed
- unknown

Rules

- Directionality must be explicit when source and target roles matter.
- Requiredness should be controlled by a rule contract when it affects validation.

### Relation Cardinality

Required Fields

- Cardinality

Optional Fields

- Minimum Source Count
- Maximum Source Count
- Minimum Target Count
- Maximum Target Count

Allowed Labels

- one-to-one
- one-to-many
- many-to-one
- many-to-many
- zero-or-one
- one-or-more
- zero-or-more
- unknown

Rules

- Cardinality should describe allowed endpoint counts.
- Cardinality does not prove endpoints exist unless resolution succeeds.

### Relation State

Required Fields

- State

Optional Fields

- Resolved At
- Resolution Method
- Staleness Boundary
- Dispute Reason

Allowed Labels

- proposed
- declared
- resolved
- unresolved
- derived
- verified
- disputed
- stale
- unknown

Rules

- State describes the relation artifact, not the truth of endpoint content.
- Resolved requires a method or source boundary.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Overclaim Risk
- Resolution Boundary
- Missing Context

Rules

- A declared relation does not prove endpoint truth or source completeness.
- A visual connection does not replace a relation contract when validation or generation depends on it.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a relation contract when a relationship affects validation, generation, schema building, forms, views, lineage, or interpretation.
- Do not create a relation contract merely to draw a decorative connection with no semantic role.

### Required Inputs

Required Fields

- Relation Handle
- Relation Kind
- Source Endpoint
- Target Endpoint
- Relation Meaning
- Cardinality
- State
- Interpretation Limits

Optional Fields

- Condition
- Resolution Method
- Inverse Relation
- Validation Binding
- Generation Binding

Rules

- Identify endpoints first.
- State relation meaning separately from cardinality.
- Use rule contracts when relation requiredness should fail validation.

### Generation Rules

Rules

- Generate relation endpoints as explicit references or selectors.
- Preserve unresolved endpoints as unresolved rather than inventing targets.
- Do not generate validation failures from relation state unless a rule contract owns that failure.

## Validation-Friendly Shape

- Relation Handle, kind, endpoints, cardinality, and state should be extractable as fields.
- Unknown endpoints or cardinality should be reported as unknown or unresolved.
- Relation contracts may be used by schema builders to create graph-like forms without becoming database schemas.

## Minimal Example

```text
# Schema Relation: Annotation targets artifact

## Relation Identity

Relation Handle: annotation-targets-artifact
Relation Name: Annotation targets artifact
Relation Kind: targets

## Relation Endpoints

Source Endpoint: annotation artifact
Source Endpoint Kind: annotation
Target Endpoint: target artifact
Target Endpoint Kind: artifact

## Relation Semantics

Relation Meaning: an annotation is attached to a target artifact or artifact region
Directionality: directed
Requiredness: required

## Relation Cardinality

Cardinality: many-to-one
Minimum Target Count: 1

## Relation State

State: declared

## Interpretation Limits

Does Not Mean: the annotation value is verified or the target artifact is true
Must Not Be Used To Claim: evidence status, preservation status, or source authority
```

## Relationship to Other Schemas

- `schema.rule` can make a relation required.
- `schema.inheritance` specializes parent-child schema relation handling.
- `artifact.annotation` uses relations to attach annotation to artifact targets.
- `schema.module` may use relation contracts to wire helpers, forms, and viewers.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: WvQKn9T_BRdSDy-v361mz-ICJttKiIpHH349XYSa90A

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Qr46EPkwBevoiHj3moalAaoZXLmoZ7EmLwU3v-GS8ug