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
  - Current Schema: [tiinex.adapter.annotation.v1](tiinex.adapter.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes artifact annotations for adapter-observed metadata such as EXIF, HTTP headers, Git metadata, platform metadata, source anchors, and imported sidecar data without promoting observations to evidence or preservation.
  - Summary: Adapter annotation schema for metadata and observations produced by adapters.

---


# Adapter Annotation

## Summary

Defines an artifact annotation produced from adapter-observed or adapter-imported material.

Adapter annotations may attach EXIF fields, HTTP headers, Git refs, commit metadata, source URLs, platform metadata, file metadata, issue metadata, archive metadata, or imported sidecar values to an artifact or region. They preserve what an adapter observed or imported without claiming that the observation is true, preserved, evidence, complete, or verified.

## Core Semantics

- Adapter annotation = artifact annotation produced by an adapter or import boundary.
- Adapter annotation must identify adapter, source material, observed value, method, observation boundary, and limits.
- Adapter annotation may provide values used by spatial, temporal, semantic, validation, style, or projection annotations.
- Adapter annotation must keep source, adapter, observation, annotation, evidence, preservation, validation, and truth distinct.

## Schema Validation Contract

### Adapter Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.adapter.annotation.v1`

Rules

- `tiinex.adapter.annotation.v1` identifies annotations whose main provenance is adapter observation or import.
- Adapter annotations inherit artifact annotation semantics from `tiinex.artifact.annotation.v1`.
- Adapter annotations must distinguish adapter identity, source material, observed value, observation method, result boundary, and interpretation limits.

### Adapter Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Adapter Target` section
- `## Adapter Observation` section
- `## Source Boundary` section
- `## Observation Provenance` section
- `## Result Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Derived Annotation Candidates`
- `Related Artifacts`
- `Rendering Hints`
- `Examples`
- `Relationship to Artifact Annotation`

Rules

- Required sections should make clear what the adapter observed and from where.
- Adapter observation must not silently become preservation or evidence.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Allowed Labels

- adapter-observation
- metadata-extraction
- exif-field
- http-header
- git-metadata
- platform-metadata
- source-anchor
- imported-sidecar
- unknown

Rules

- Annotation kind should describe the adapter-observed value role.

### Adapter Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target File
- Target Source ID
- Target Source Anchor
- Target Selector

Rules

- Target identifies where the adapter annotation is attached.

### Adapter Observation

Required Fields

- Observed Value Type
- Observed Value

Optional Fields

- Observed Field
- Observed Format
- Raw Value
- Normalized Value
- Confidence

Rules

- Raw and normalized values should be kept distinct when both exist.
- Observed values should not be treated as verified truth without separate validation.

### Source Boundary

Required Fields

- Source Kind
- Source Identifier
- Access Mode

Optional Fields

- Source URL
- Source Ref
- Source Anchor
- Source Timestamp
- Cache State
- Auth Boundary

Allowed Labels

- web-surface
- raw-file-get
- local-working-tree
- local-git-archive
- browser-remote-git
- service-backed-git
- uploaded-file
- imported-archive
- unknown

Rules

- Source boundary should state how the adapter accessed or imported the observed material.
- Access mode does not create evidence, preservation, validation, or truth by itself.

### Observation Provenance

Required Fields

- Adapter
- Annotation Method

Optional Fields

- Adapter Version
- Tool
- Observed At
- Imported At
- Method Version

Rules

- Adapter provenance should make tool and method identity explicit when known.

### Result Boundary

Required Fields

- Completeness
- Preservation State
- Evidence State

Optional Fields

- Known Limits
- Fallback Semantics
- Promotable To Annotation
- Promotable To Evidence

Rules

- Adapter-observed material is not preserved unless a preservation artifact or method supports that claim.
- Adapter-observed material is not evidence unless promoted by policy or artifact.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- Adapter annotations must not imply truth, evidence status, preservation, validation, authorship, identity, consent, source completeness, or historical completeness unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create an adapter annotation when an adapter-observed value should be attached to a target with provenance.
- Do not create an adapter annotation for the source itself, a portal resolution, a full discovery finding, evidence, preservation, validation report, or claim when those schemas fit better.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Adapter
- Observed Value Type
- Observed Value
- Source Kind
- Source Identifier
- Access Mode
- Annotation Method
- Result Boundary
- Interpretation Limits

Rules

- Missing source boundary, adapter identity, or method should be explicit.

### Generation Rules

Rules

- Identify target and source boundary.
- Capture raw and normalized observed values when needed.
- Record adapter and method provenance.
- State result boundary and limits.

### Suggested Sequence

Rules

- Observe or import material through an adapter.
- Attach value to target as an annotation.
- Create downstream specialized annotation only when needed.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Adapter Annotation: EXIF GPS metadata

## Annotation Identity

Annotation Name: EXIF GPS observation
Annotation Kind: exif-field
Annotation State: observed

## Adapter Target

Target Artifact: image-001.trace.md
Target Region: source-image

## Adapter Observation

Observed Value Type: exif-gps-coordinate
Observed Field: GPSLatitude/GPSLongitude
Observed Value: 55.604981, 13.003822
Raw Value: EXIF rational GPS fields
Normalized Value: decimal degrees

## Source Boundary

Source Kind: uploaded-file
Source Identifier: image-001.jpg
Access Mode: uploaded-file

## Observation Provenance

Adapter: exif-reader
Annotation Method: metadata-extraction
Observed At: 2026-07-02 00:00:00

## Result Boundary

Completeness: metadata-field-only
Preservation State: fetched-not-preserved
Evidence State: observation-only

## Interpretation Limits

Does Not Mean: the image depicts this location or was created there
Must Not Be Used To Claim: verified location, evidence status, preservation, authorship, consent, or truth
```

## Relationship to Artifact Annotation

`tiinex.adapter.annotation.v1` inherits artifact annotation semantics and adds adapter/source observation boundaries.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.artifact.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
  - Value: q3dvqudmEXHS7EXxioWlpGJtHxMkLP5mY8ZCOxDrBpo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 2k6mlEmMWAYQ_2k95mpqmmF_ZQ1832UkNBOrXYd1Wiw