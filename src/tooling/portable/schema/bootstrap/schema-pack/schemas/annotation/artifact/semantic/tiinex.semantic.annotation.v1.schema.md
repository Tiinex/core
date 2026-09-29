# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.artifact.annotation.v1](../tiinex.artifact.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.artifact.annotation.v1.schema.md](../tiinex.artifact.annotation.v1.schema.md)
  - Origin:
    - [relative](../tiinex.artifact.annotation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
- Current
  - Current Schema: [tiinex.semantic.annotation.v1](tiinex.semantic.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes artifact annotations for tags, classifications, entity labels, topic labels, meaning hints, and controlled vocabulary links without making those labels proof or truth.
  - Summary: Semantic annotation schema for bounded tags, classifications, entities, and meaning labels.

---


# Semantic Annotation

## Summary

Defines an artifact annotation that attaches semantic labels, tags, classifications, entity mentions, topic labels, controlled vocabulary terms, or meaning hints to an artifact or artifact region.

Semantic annotation helps search, filtering, grouping, interpretation, schema-builder guidance, and presentation without claiming that the label is true, verified, canonical, or complete.

## Core Semantics

- Semantic annotation = artifact annotation with meaning-oriented label or classification.
- Semantic annotation must identify target, semantic value, vocabulary or scope, provenance, state, and limits.
- Semantic annotation may be manual, imported, inferred, adapter-observed, validator-derived, or LLM-suggested.
- Semantic annotation is not proof, evidence, validation, decision, or identity verification by itself.

## Schema Validation Contract

### Semantic Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.semantic.annotation.v1`

Rules

- `tiinex.semantic.annotation.v1` identifies annotations whose main value is semantic labeling or classification.
- Semantic annotations inherit artifact annotation semantics from `tiinex.artifact.annotation.v1`.
- Semantic annotations must distinguish label, vocabulary, target, provenance, state, and interpretation limits.

### Semantic Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Semantic Target` section
- `## Semantic Value` section
- `## Vocabulary Boundary` section
- `## Semantic Provenance` section
- `## Interpretation Limits` section

Optional Sections

- `Confidence And Review`
- `Related Artifacts`
- `Rendering Hints`
- `Examples`
- `Relationship to Artifact Annotation`

Rules

- Required sections should state which label applies to which target and under which vocabulary or scope.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Allowed Labels

- tag
- topic-label
- entity-label
- classification
- meaning-hint
- vocabulary-link
- schema-hint
- unknown

Rules

- Annotation kind should describe the semantic role.

### Semantic Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target Section
- Target Span
- Target Selector
- Target Node ID

Rules

- Target must identify what receives the semantic label.

### Semantic Value

Required Fields

- Label
- Label Role

Optional Fields

- Label ID
- Label URI
- Entity Type
- Normalized Value
- Confidence
- Alternative Labels

Rules

- Labels should be distinct from claims about the target.
- Entity labels do not verify real-world identity unless linked to a verification method.

### Vocabulary Boundary

Required Fields

- Vocabulary
- Scope

Optional Fields

- Vocabulary Version
- Schema Source
- Allowed Values
- Unknown Value Policy

Rules

- Vocabulary or scope should explain where the label comes from.
- Unknown or informal vocabularies should be marked informal or unknown.

### Semantic Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Created By
- Created At
- Tool
- Adapter
- Model
- Import Source

Rules

- LLM-suggested semantic annotations must remain suggested unless reviewed or verified.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- Semantic annotations must not imply truth, identity verification, evidence, validation, consent, authorship, or completeness unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a semantic annotation when a label or classification should be attached to an artifact or region without changing its content.
- Do not create a semantic annotation when the correct artifact is a claim, interpretation, validation report, evidence artifact, or decision.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Label
- Label Role
- Vocabulary
- Scope
- Annotation Source
- Annotation Method
- Interpretation Limits

Rules

- Missing vocabulary, source, or confidence should be explicit.

### Generation Rules

Rules

- Identify target.
- Choose label and vocabulary.
- Capture provenance, confidence, and limits.

### Suggested Sequence

Rules

- Select target region.
- Apply label.
- State vocabulary and provenance.
- Add limits.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Semantic Annotation: Topic label

## Annotation Identity

Annotation Name: Schema builder topic label
Annotation Kind: topic-label
Annotation State: proposed

## Semantic Target

Target Artifact: tiinex.annotation.v1.schema.md
Target Region: whole-artifact

## Semantic Value

Label: schema-builder
Label Role: topic
Confidence: medium

## Vocabulary Boundary

Vocabulary: Tiinex workspace topic labels
Scope: local workspace navigation

## Semantic Provenance

Annotation Source: LLM suggestion
Annotation Method: semantic clustering

## Interpretation Limits

Does Not Mean: the artifact is only about schema builders
Must Not Be Used To Claim: truth, validation, evidence status, or canonical taxonomy membership
```

## Relationship to Artifact Annotation

`tiinex.semantic.annotation.v1` inherits artifact annotation semantics and adds semantic label and vocabulary boundaries.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.artifact.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
  - Value: q3dvqudmEXHS7EXxioWlpGJtHxMkLP5mY8ZCOxDrBpo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: sja8LEWS3kFVvyue2qw51ixPrqYswOKn2v1N0hfIvnM