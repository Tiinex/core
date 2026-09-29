# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.spatial.annotation.v1](../tiinex.spatial.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.spatial.annotation.v1.schema.md](../tiinex.spatial.annotation.v1.schema.md)
  - Origin:
    - [relative](../tiinex.spatial.annotation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/spatial/tiinex.spatial.annotation.v1.schema.md)
- Current
  - Current Schema: [tiinex.projection.annotation.v1](tiinex.projection.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes spatial annotations for declaring a bounded transform or projection between reference frames such as WGS84, Leaflet map CRS, image pixels, and canvas-local coordinates.
  - Summary: Projection annotation schema for reference-frame transforms and renderable coordinate mappings.

---


# Projection Annotation

## Summary

Defines a spatial annotation for a bounded transform or projection between reference frames.

A projection annotation may describe how a WGS84 coordinate should be mapped to a Leaflet map CRS, how a Leaflet point should be mapped to canvas-local coordinates, how image-natural pixels should map to normalized coordinates, or how graph-layout coordinates should be rendered on a presentation surface.

Projection annotation does not render by itself, does not prove the input coordinate is true, and does not replace the original spatial annotation.

## Core Semantics

- Projection annotation = spatial annotation describing a transform between frames.
- Projection annotation must identify source frame, target frame, transform rule, parameters, and limits.
- Projection annotation may support Leaflet, canvas, image, graph, atlas, or layout rendering.
- Projection annotation stores transform provenance and boundary; presentation surfaces or tools perform the actual rendering.
- Projection annotation must not imply coordinate truth, evidence, validation, preservation, or verified geolocation.

## Schema Validation Contract

### Projection Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.projection.annotation.v1`

Rules

- `tiinex.projection.annotation.v1` identifies annotations whose main job is to describe a reference-frame transform.
- Projection annotations inherit spatial annotation semantics from `tiinex.spatial.annotation.v1`.
- Projection annotations must distinguish input value, source frame, target frame, transform method, output boundary, provenance, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Projection Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Projection Target` section
- `## Source Frame` section
- `## Target Frame` section
- `## Transform Rule` section
- `## Projection Provenance` section
- `## Accuracy Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Input Spatial Annotation`
- `Output Value`
- `Rendering Hints`
- `Related Artifacts`
- `Examples`
- `Relationship to Spatial Annotation`

Rules

- Required sections should make both frames and the transform rule clear.
- Projection annotations should not hide transform assumptions inside presentation code.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Optional Fields

- Annotation ID
- Human Label
- Canonical Identifier

Allowed Labels

- projection
- transform
- frame-mapping
- render-mapping
- georeference
- unknown

Rules

- Annotation kind should describe the mapping role.

### Projection Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Input Annotation
- Target Layer
- Target Surface
- Target Selector

Rules

- Projection target must identify what spatial value or region is being projected or mapped.
- Projection target may point to a spatial annotation rather than repeat the coordinate value.

### Source Frame

Required Fields

- Source Reference Frame
- Source Coordinate System

Optional Fields

- Source Value
- Source CRS
- Source Unit
- Source Axis Order

Allowed Labels

- geographic-wgs84
- geographic-crs84
- web-mercator
- leaflet-map-crs
- canvas-local
- image-natural-pixels
- normalized-0-1
- graph-layout
- unknown

Rules

- Source frame must describe how the input value should be interpreted.

### Target Frame

Required Fields

- Target Reference Frame
- Target Coordinate System

Optional Fields

- Target Unit
- Target Origin
- Target Axis Order
- Target Bounds

Allowed Labels

- leaflet-map-crs
- canvas-local
- image-natural-pixels
- normalized-0-1
- graph-layout
- document-page
- unknown

Rules

- Target frame must describe the coordinate space expected by the renderer or consumer.

### Transform Rule

Required Fields

- Transform Method
- Parameters

Optional Fields

- Library Candidate
- Formula Reference
- Zoom Level
- Bounds
- Scale
- Offset
- Rotation
- Distortion Model
- Output Value

Allowed Labels

- leaflet-crs-transform
- affine-transform
- pixel-normalization
- bounds-fit
- graph-layout-transform
- manual-calibration
- unknown

Rules

- Transform method should be named without making a library the semantic authority.
- Library candidates are implementation hints, not schema requirements.
- Parameters needed to reproduce or review the projection should be explicit when known.

### Projection Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Tool
- Adapter
- Library
- Method Version
- Created At
- Calibration Source

Rules

- Projection provenance should disclose whether the transform was manual, library-derived, imported, or adapter-observed.

### Accuracy Boundary

Required Fields

- Accuracy State
- Known Limits

Optional Fields

- Error Estimate
- Valid Bounds
- Valid Zoom Range
- Review Needed

Rules

- Projection accuracy should be explicit when the projection is approximate or display-only.
- A projection can be display-sufficient without being measurement-grade.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Overclaim Risk
- Missing Context

Rules

- Projection annotations must not imply coordinate truth, evidence status, validation, preservation, verified location, or source completeness.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a projection annotation when a reference-frame transform should be preserved as provenance or made reusable across tools.
- Do not create a projection annotation for a raw coordinate alone; use spatial annotation for that.
- Do not create a projection annotation for rendered output alone; use presentation or surface semantics for rendering.

### Required Inputs

Required Fields

- Target Artifact
- Source Frame
- Target Frame
- Transform Method
- Parameters
- Annotation Source
- Annotation Method
- Accuracy Boundary
- Interpretation Limits

Optional Fields

- Input Spatial Annotation
- Output Value
- Rendering Hints
- Library Candidate

Rules

- Missing source frame, target frame, transform method, or accuracy boundary should be explicit.
- Implementation libraries such as Leaflet may be named as candidates without becoming schema authority.

### Generation Rules

Rules

- Identify the input spatial value or annotation.
- Declare source and target frames.
- Declare transform method and parameters.
- Declare provenance, accuracy, and limits.

### Suggested Sequence

Rules

- Start from a spatial annotation or target region.
- Choose target presentation frame.
- Record transform rule and parameters.
- Record accuracy boundary and interpretation limits.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Projection Annotation: WGS84 to Leaflet canvas

## Annotation Identity

Annotation Name: WGS84 to Leaflet canvas projection
Annotation Kind: projection
Annotation State: proposed

## Projection Target

Target Artifact: map-canvas-001.trace.md
Target Region: canvas-layer
Input Annotation: spatial.annotation.source-location.v1

## Source Frame

Source Reference Frame: geographic-wgs84
Source Coordinate System: WGS84
Source Axis Order: latitude-longitude

## Target Frame

Target Reference Frame: canvas-local
Target Coordinate System: canvas-pixels
Target Origin: top-left

## Transform Rule

Transform Method: leaflet-crs-transform
Parameters: map CRS, zoom, viewport bounds, canvas size
Library Candidate: Leaflet

## Projection Provenance

Annotation Source: tool-derived
Annotation Method: leaflet-map-projection

## Accuracy Boundary

Accuracy State: display-sufficient
Known Limits: valid only for the declared map viewport and zoom

## Interpretation Limits

Does Not Mean: the source coordinate is verified or evidence
Must Not Be Used To Claim: geolocation truth, source completeness, preservation, or measurement-grade accuracy
```

## Relationship to Spatial Annotation

`tiinex.projection.annotation.v1` inherits spatial annotation semantics and adds reference-frame transform provenance.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.spatial.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/spatial/tiinex.spatial.annotation.v1.schema.md)
  - Value: 02k-f5jiqqQS5xjKRzOwEPkv3qdLcNrUwPuI5U2QTOg

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: cPzr0_dz_NyqcJSZP2ext7YJgQqLXmFLJgt7vEuTTI8