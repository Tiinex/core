# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.annotation.v1](tiinex.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines target-bound annotation provenance so additional information can be attached to material without mutating the target or silently becoming truth, evidence, validation, preservation, or decision.
  - Summary: General annotation schema for provenance-bearing layers attached to a target.

---


# Annotation

## Summary

Defines a human-readable and machine-extractable annotation artifact.

An annotation is an extra provenance-bearing layer attached to a target. The target may be an artifact, source, region, span, material fragment, coordinate, presentation element, or other bounded object. An annotation may preserve a note, label, coordinate, style warning, validation signal, adapter observation, semantic tag, temporal marker, projection hint, or extracted metadata without changing the target itself.

Annotation does not mean truth, evidence, validation result, preservation, claim, decision, source authority, or artifact mutation. An annotation may later support those artifacts, but it does not become them by itself.

## Core Semantics

- Annotation = target-bound extra information.
- Annotation must identify what is annotated.
- Annotation must identify what value, label, observation, warning, coordinate, or note is attached.
- Annotation must preserve provenance for who or what supplied or derived it when known.
- Annotation must keep target content and annotation content distinct.
- Annotation may be human-created, adapter-observed, validator-derived, tool-generated, imported, or LLM-suggested.
- Annotation must state interpretation limits when the annotation could be overread.
- Annotation must not silently promote itself to evidence, validation, preservation, claim proof, truth, authorship, identity, consent, or source completeness.

## Schema Validation Contract

### Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.annotation.v1`

Rules

- `tiinex.annotation.v1` identifies artifacts whose main job is to attach bounded extra information to a target.
- Annotation artifacts must preserve target, value, provenance, state, and interpretation limits.
- Annotation artifacts must not mutate the annotated target by implication.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Annotation Target` section
- `## Annotation Value` section
- `## Annotation Provenance` section
- `## Annotation State` section
- `## Interpretation Limits` section

Optional Sections

- `Reference Frame`
- `Rendering Hints`
- `Validation Binding`
- `Related Artifacts`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Required sections should be understandable without specialized tooling.
- Required sections should make the target and annotation value distinct.
- Optional sections must not add evidence, validation, preservation, or truth semantics by implication.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Optional Fields

- Annotation ID
- Annotation Type
- Human Label
- Canonical Identifier
- Owner

Allowed Labels

- note
- label
- coordinate
- region
- style-warning
- validation-signal
- adapter-observation
- semantic-tag
- temporal-marker
- projection
- metadata-extraction
- unknown

Rules

- `Annotation Kind` should describe what kind of extra layer is being attached.
- `Annotation State` should describe annotation status, not target validity.
- Human labels must not become semantic authority without a declared value or rule.

### Annotation Target

Required Fields

- Target Kind
- Target Identifier

Optional Fields

- Target Artifact
- Target Source
- Target Region
- Target Span
- Target Selector
- Target Path
- Target Node
- Target Source Anchor

Rules

- Target fields must identify what the annotation applies to as specifically as the workflow requires.
- If the target is a region or span, the region system or selector should be explicit.
- Unknown or unresolved targets should be stated as unknown rather than inferred.

### Annotation Value

Required Fields

- Value Type
- Value

Optional Fields

- Value Format
- Value Unit
- Value Schema
- Value Boundary
- Confidence
- Precision
- Uncertainty

Rules

- Annotation value must remain separate from target content.
- Value type should be specific enough for a person or tool to decide how to read the value.
- Confidence, precision, and uncertainty should be explicit when the value could affect interpretation.

### Annotation Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Created By
- Created At
- Observed At
- Adapter
- Tool
- Method Version
- Import Source
- Human Input Boundary

Rules

- Annotation provenance should disclose whether the value is manual, imported, observed, derived, inferred, or suggested.
- LLM-suggested annotations must remain suggested unless verified by a separate method or artifact.
- Adapter-observed annotations must keep adapter, source, and observation distinct.

### Annotation State

Required Fields

- State

Optional Fields

- Review Needed
- Review Method
- Superseded By
- Staleness Boundary

Allowed Labels

- proposed
- observed
- derived
- verified
- disputed
- stale
- unavailable
- unknown
- not-applicable

Rules

- State describes the annotation, not the target artifact.
- `verified` requires an explicit verification method or linked validation/evidence artifact.
- `stale` should be used when the annotation may no longer match the target or source state.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Overclaim Risk
- Missing Context
- Trust Boundary
- Promotion Path

Rules

- Annotation artifacts must state important claims they do not support.
- Annotation artifacts must not imply target truth, evidence status, validation, preservation, authorship, identity, consent, or source completeness unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create an annotation artifact when extra target-bound information should travel as provenance without changing the target artifact.
- Do not create an annotation artifact when the information is the target artifact itself, a full validation report, evidence artifact, preservation artifact, decision, or claim.
- Use a child schema when the annotation has specialized spatial, temporal, semantic, style, validation, adapter, artifact, or projection semantics.

### Required Inputs

Required Fields

- Target
- Annotation Kind
- Annotation Value
- Annotation Source
- Annotation Method
- Annotation State
- Interpretation Limits

Optional Fields

- Reference Frame
- Region Or Span
- Confidence
- Precision
- Related Artifacts
- Rendering Hints

Rules

- Missing target, value, source, method, or state should be explicit.
- If annotation source or method is unknown, mark it unknown instead of inventing provenance.

### Generation Rules

Rules

- Identify the target first.
- Identify the annotation kind and value.
- Preserve source and method provenance.
- Declare state, confidence, precision, or uncertainty when relevant.
- State what the annotation does not prove.
- Link evidence, validation, claims, preservation, or decisions separately when they exist.

### Suggested Sequence

Rules

- Choose the target.
- Choose the annotation kind.
- Capture the value and reference frame if needed.
- Capture provenance and state.
- Add interpretation limits and related artifacts.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Annotation: Schema title style warning

## Annotation Identity

Annotation Name: Schema title style warning
Annotation Kind: style-warning
Annotation State: derived

## Annotation Target

Target Kind: artifact-region
Target Identifier: tiinex.condition.v1.schema.md#body-h1
Target Artifact: tiinex.condition.v1.schema.md
Target Region: body-h1

## Annotation Value

Value Type: authoring-style-warning
Value: H1 repeats Tiinex prefix, version, and Schema suffix already carried by filename or Continuity Context.
Confidence: high

## Annotation Provenance

Annotation Source: schema-body-title-style-v1
Annotation Method: static authoring lint

## Annotation State

State: derived
Review Needed: no root-valid failure; authoring-style review only

## Interpretation Limits

Does Not Mean: the target artifact is invalid
Must Not Be Used To Claim: schema semantics are wrong, checksum is wrong, or artifact should be rejected
```

## Relationship to Other Schemas

- `artifact.annotation` specializes annotation for artifact and artifact-region targets.
- `validation.report` owns full validation run results.
- `evidence` owns evidence semantics.
- `claim` owns assertions.
- `presentation.surface` may show annotations as chips, overlays, badges, markers, or warnings.
- `schema.module` may declare annotation handlers for a schema family.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: l1F8SSMmgP3UklDpDvh-r4wzuWLaLPRUhIvpM0ykxBQ