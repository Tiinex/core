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
  - Current Schema: [tiinex.spatial.annotation.v1](tiinex.spatial.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes artifact annotations for coordinates, geometry, spatial regions, reference frames, and map/canvas/image placement without turning position into truth or evidence.
  - Summary: Spatial annotation schema for coordinates, geometries, regions, and spatial reference frames.

---


# Spatial Annotation

## Summary

Defines an artifact annotation that attaches spatial information to an artifact or artifact region.

A spatial annotation may describe a point, bounding box, polygon, polyline, circle, viewport, image region, canvas region, map region, graph-layout position, or other spatial value. It must state the reference frame or coordinate system used, such as WGS84, Leaflet map CRS, canvas-local pixels, image-natural pixels, normalized coordinates, or graph-layout coordinates.

Spatial annotation does not mean the target artifact was created at that place, depicts that place, is evidence of that place, or has verified location truth.

## Core Semantics

- Spatial annotation = artifact annotation with spatial value and reference frame.
- Spatial annotation must identify the target artifact or region.
- Spatial annotation must identify coordinate system, reference frame, or geometry system.
- Spatial annotation may support map, canvas, image, graph, atlas, or layout rendering.
- Spatial annotation stores the spatial value and provenance; presentation surfaces or tools perform rendering and projection.
- Spatial annotation must not silently become evidence, preservation, validation, geolocation truth, authorship, presence, consent, or depicted-location proof.

## Schema Validation Contract

### Spatial Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.spatial.annotation.v1`

Rules

- `tiinex.spatial.annotation.v1` identifies annotations whose main value is spatial.
- Spatial annotations inherit artifact annotation semantics from `tiinex.artifact.annotation.v1`.
- Spatial annotations must distinguish target, spatial value, reference frame, provenance, precision, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Spatial Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Spatial Target` section
- `## Spatial Value` section
- `## Reference Frame` section
- `## Spatial Provenance` section
- `## Precision And Uncertainty` section
- `## Interpretation Limits` section

Optional Sections

- `Projection Candidates`
- `Rendering Hints`
- `Related Artifacts`
- `Examples`
- `Relationship to Artifact Annotation`

Rules

- Required sections should make the spatial value and reference frame explicit.
- Unknown reference frames should be stated as unknown.
- Render hints must not become the spatial value itself.

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

- coordinate
- geometry
- region
- bounding-box
- map-point
- canvas-position
- image-region
- graph-position
- viewport
- unknown

Rules

- Annotation kind should describe the spatial role of the value.
- Spatial state describes the annotation, not the target artifact.

### Spatial Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target Path
- Target Node ID
- Target Layer
- Target Source Anchor
- Target Selector

Rules

- Spatial target must say whether the value applies to the whole artifact or a region.
- Layer, node, or selector should be explicit when the target is not the whole artifact.

### Spatial Value

Required Fields

- Geometry Type
- Value

Optional Fields

- Latitude
- Longitude
- Altitude
- X
- Y
- Width
- Height
- Radius
- Polygon
- Polyline
- Bounds
- Value Format

Allowed Labels

- point
- bounding-box
- polygon
- polyline
- circle
- viewport
- region
- transform-anchor
- unknown

Rules

- Spatial value must use a declared reference frame.
- WGS84 latitude/longitude should not be treated as canvas coordinates without a projection annotation or transform rule.
- Pixel, normalized, graph, and geographic values must not be silently mixed.

### Reference Frame

Required Fields

- Coordinate System
- Reference Frame

Optional Fields

- CRS
- Datum
- Unit
- Origin
- Axis Order
- Bounds
- Projection Needed

Allowed Labels

- geographic-wgs84
- geographic-crs84
- web-mercator
- leaflet-map-crs
- canvas-local
- image-natural-pixels
- normalized-0-1
- graph-layout
- document-page
- unknown

Rules

- Reference frame must identify how the spatial value should be interpreted.
- Axis order should be explicit when ambiguity may matter.
- Projection or transformation should be represented separately when values are converted between frames.

### Spatial Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Created By
- Created At
- Observed At
- Adapter
- Tool
- Import Source
- Source Metadata Field

Allowed Labels

- manual-input
- exif-observation
- adapter-observation
- imported-geojson
- imported-kml
- derived-transform
- llm-suggestion
- unknown

Rules

- Spatial provenance should disclose whether the coordinate was observed, imported, manually entered, derived, or suggested.
- EXIF-derived coordinates remain metadata observations, not proof of depicted place or creation place.

### Precision And Uncertainty

Required Fields

- Precision
- Confidence

Optional Fields

- Accuracy Radius
- Uncertainty Boundary
- Staleness Boundary
- Verification Method

Rules

- Precision and confidence should be stated when known.
- Approximate or privacy-reduced coordinates should be labeled as approximate.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Overclaim Risk
- Missing Context
- Trust Boundary

Rules

- Spatial annotations must not imply verified location, creation location, depicted location, evidence, authorship, presence, consent, or source truth unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a spatial annotation when spatial value or coordinate provenance should be attached to an artifact or artifact region.
- Do not create a spatial annotation for a full map, atlas, source, evidence artifact, validation report, or truth claim.
- Use projection annotation when converting values between reference frames is the primary subject.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Geometry Type
- Spatial Value
- Coordinate System
- Reference Frame
- Annotation Source
- Annotation Method
- Precision
- Confidence
- Interpretation Limits

Optional Fields

- Projection Candidates
- Rendering Hints
- Related Artifacts

Rules

- Missing coordinate system, frame, source, precision, or confidence should be explicit.
- Geographic coordinates should keep latitude/longitude semantics distinct from canvas or pixel coordinates.

### Generation Rules

Rules

- Identify the target artifact or region.
- Choose geometry type.
- Record the value and coordinate system.
- Record provenance and precision.
- State what the spatial value does not prove.

### Suggested Sequence

Rules

- Pick target and region.
- Pick reference frame.
- Capture value.
- Capture source/method.
- Add precision and limits.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Spatial Annotation: WGS84 source point

## Annotation Identity

Annotation Name: Source location coordinate
Annotation Kind: coordinate
Annotation State: proposed

## Spatial Target

Target Artifact: image-001.trace.md
Target Region: whole-artifact
Target Layer: source-image

## Spatial Value

Geometry Type: point
Value: 55.604981, 13.003822
Latitude: 55.604981
Longitude: 13.003822
Value Format: decimal-degrees

## Reference Frame

Coordinate System: WGS84
Reference Frame: geographic-wgs84
Axis Order: latitude-longitude
Projection Needed: yes

## Spatial Provenance

Annotation Source: user-provided
Annotation Method: manual-input

## Precision And Uncertainty

Precision: city-level
Confidence: proposed

## Interpretation Limits

Does Not Mean: the image content depicts this exact location or was created there
Must Not Be Used To Claim: verified location, evidence status, authorship, presence, consent, or truth
```

## Relationship to Artifact Annotation

`tiinex.spatial.annotation.v1` inherits artifact annotation semantics and adds spatial value, coordinate system, reference frame, precision, and spatial interpretation limits.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.artifact.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
  - Value: q3dvqudmEXHS7EXxioWlpGJtHxMkLP5mY8ZCOxDrBpo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: J4-vCcqK8A4XfA-yZ_E3V2JSugJR1ibcQTEfBtD6Yq8