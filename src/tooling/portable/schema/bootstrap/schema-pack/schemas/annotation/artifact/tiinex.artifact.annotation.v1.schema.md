# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.annotation.v1](../tiinex.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.annotation.v1.schema.md](../tiinex.annotation.v1.schema.md)
  - Origin:
    - [relative](../tiinex.annotation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/tiinex.annotation.v1.schema.md)
- Current
  - Current Schema: [tiinex.artifact.annotation.v1](tiinex.artifact.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes annotation provenance for artifacts, artifact regions, spans, nodes, files, and material fragments without mutating the artifact itself.
  - Summary: Artifact annotation schema for target-bound layers attached to artifacts or artifact regions.

---


# Artifact Annotation

## Summary

Defines an annotation attached to a Tiinex artifact, artifact region, material fragment, file entry, node, section, span, image region, canvas region, or comparable bounded part of an artifact.

An artifact annotation is useful when a tool, person, adapter, validator, importer, or LLM needs to attach extra information to an artifact without editing the artifact body. It can carry coordinates, regions, style warnings, semantic labels, temporal markers, adapter observations, validation signals, projection hints, or other annotation values.

Artifact annotation does not mean the annotated artifact is true, valid, preserved, evidence, authored, consented to, complete, or changed.

## Core Semantics

- Artifact annotation = annotation whose target is an artifact or artifact-bound region.
- Artifact annotation must identify the target artifact and target region or state that it applies to the whole artifact.
- Artifact annotation must not mutate target artifact content by implication.
- Artifact annotation may be stored inline, externally, in runtime state, in a validation report, in a module output, or as a separate artifact, but the annotation semantics remain separate.
- Artifact annotation may be rendered as a badge, chip, overlay, marker, highlight, map point, graph node label, lint warning, or detail row.
- Rendering an annotation does not make it evidence, validation, preservation, or truth.

## Schema Validation Contract

### Artifact Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.artifact.annotation.v1`

Rules

- `tiinex.artifact.annotation.v1` identifies annotations whose target is an artifact or artifact region.
- Artifact annotations inherit annotation semantics from `tiinex.annotation.v1`.
- Artifact annotations must keep artifact identity, target region, annotation value, provenance, state, and interpretation limits distinct.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Artifact Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Artifact Target` section
- `## Annotation Value` section
- `## Annotation Provenance` section
- `## Attachment Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Region Reference`
- `Reference Frame`
- `Rendering Hints`
- `Validation Binding`
- `Related Artifacts`
- `Examples`
- `Relationship to Annotation Base`

Rules

- Required sections should identify both the artifact and the annotation value.
- Region-bound annotations should identify their coordinate, selector, span, or region system.
- Whole-artifact annotations should explicitly say `Target Region: whole-artifact`.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Optional Fields

- Annotation ID
- Human Label
- Canonical Identifier
- Owner Module

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

- Annotation identity should describe the extra layer, not rename the target artifact.
- Annotation kind should choose a child schema when specialized semantics are needed.

### Artifact Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target Artifact ID
- Target Path
- Target Source ID
- Target Node ID
- Target Schema
- Target Section
- Target Span
- Target Selector
- Target Source Anchor

Allowed Labels

- whole-artifact
- body-h1
- section
- markdown-span
- line-span
- byte-span
- image-region
- canvas-region
- map-region
- graph-node
- source-file
- unknown

Rules

- Target artifact must identify the artifact being annotated.
- Target region should state the region system or use an allowed label when possible.
- Target source anchors should be used when the annotation depends on a particular source snapshot or loaded file state.

### Annotation Value

Required Fields

- Value Type
- Value

Optional Fields

- Value Format
- Value Unit
- Value Schema
- Confidence
- Precision
- Uncertainty
- Suggested Display

Rules

- Annotation value must remain separate from target artifact content.
- Suggested display values are presentation hints, not target content.

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

Rules

- Annotation provenance should disclose whether the annotation is manual, imported, observed, derived, inferred, or suggested.
- Runtime-derived annotations should record the rule, method, or adapter when known.

### Attachment Boundary

Required Fields

- Attachment Mode
- Mutates Target

Optional Fields

- Storage Location
- Runtime Scope
- Export Policy
- Supersession Policy

Allowed Labels

- external-artifact
- inline-section
- runtime-only
- validation-output
- adapter-output
- module-output
- imported-sidecar
- unknown

Rules

- `Mutates Target` should be `no` unless a separate editing workflow explicitly changes the target artifact.
- Runtime-only annotations must not be mistaken for durable artifact content.

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

- Artifact annotations must state important claims they do not support.
- Artifact annotations must not imply artifact validity, evidence status, preservation, truth, authorship, identity, consent, or source completeness unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create an artifact annotation when extra artifact-bound data should travel separately from the artifact body.
- Do not create an artifact annotation when the correct artifact is a validation report, evidence artifact, claim, derivation, decision, preservation artifact, or edited replacement of the target artifact.
- Use child annotation schemas for spatial, temporal, semantic, style, validation, adapter, or projection-specific values.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Annotation Kind
- Annotation Value
- Annotation Source
- Annotation Method
- Attachment Mode
- Interpretation Limits

Optional Fields

- Reference Frame
- Confidence
- Precision
- Related Artifacts
- Rendering Hints

Rules

- Missing target, region, source, method, or attachment boundary should be explicit.
- A target artifact may be identified by path, node id, source anchor, or stable artifact identifier when available.

### Generation Rules

Rules

- Identify the artifact and region being annotated.
- Declare the annotation kind and value.
- Declare provenance and attachment boundary.
- State whether the annotation mutates target content.
- State what the annotation does not prove.

### Suggested Sequence

Rules

- Choose target artifact.
- Choose target region or whole-artifact.
- Choose annotation kind and value.
- Capture provenance and state.
- Add interpretation limits and optional rendering hints.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Artifact Annotation: Display title warning

## Annotation Identity

Annotation Name: Display title warning
Annotation Kind: style-warning
Annotation State: derived

## Artifact Target

Target Artifact: tiinex.claim.v1.schema.md
Target Region: body-h1
Target Path: .topics/.schemas/tiinex.claim.v1.schema.md

## Annotation Value

Value Type: schema-body-title-style-warning
Value: Body H1 repeats schema namespace, version, and file role.
Suggested Display: Claim

## Annotation Provenance

Annotation Source: schema-body-title-style-v1
Annotation Method: static lint

## Attachment Boundary

Attachment Mode: runtime-only
Mutates Target: no

## Interpretation Limits

Does Not Mean: schema is invalid
Must Not Be Used To Claim: checksum failure, semantic failure, or rejection of the artifact
```

## Relationship to Annotation Base

`tiinex.artifact.annotation.v1` inherits target-bound annotation semantics from `tiinex.annotation.v1` and narrows the target to artifacts and artifact regions.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/tiinex.annotation.v1.schema.md)
  - Value: 1q0G_ne5NGyJIAcfwI5mr-KQKxEOonOsHOA_-MVN-ac

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: hrtl5WsLvGWlWJoYGY7E4ROK8VVtMBYZ2eVHMTSU2XU