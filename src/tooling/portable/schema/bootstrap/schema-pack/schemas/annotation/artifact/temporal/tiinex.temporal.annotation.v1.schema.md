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
  - Current Schema: [tiinex.temporal.annotation.v1](tiinex.temporal.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes artifact annotations for timecodes, intervals, as-of markers, temporal spans, durations, and version-time markers without becoming event truth or source history proof.
  - Summary: Temporal annotation schema for attaching bounded time values and temporal regions to artifacts.

---


# Temporal Annotation

## Summary

Defines an artifact annotation that attaches a time value, timecode, interval, duration, frame range, as-of marker, or version-time marker to an artifact or artifact region.

Temporal annotation can identify when a segment occurs in audio/video, which line span relates to a time window, which source state was observed at a time, or which artifact region is associated with a temporal marker. It does not prove historical truth, event occurrence, source completeness, or preservation by itself.

## Core Semantics

- Temporal annotation = artifact annotation with bounded time value or temporal region.
- Temporal annotation must identify target, temporal value, temporal frame, provenance, state, and limits.
- Temporal annotation may refer to wall-clock time, source time, artifact time, media timecode, version time, or as-of time.
- Temporal annotation must keep artifact creation time, source-state time, event time, and media time distinct.

## Schema Validation Contract

### Temporal Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.temporal.annotation.v1`

Rules

- `tiinex.temporal.annotation.v1` identifies annotations whose main value is temporal.
- Temporal annotations inherit artifact annotation semantics from `tiinex.artifact.annotation.v1`.
- Temporal annotations must distinguish target, temporal value, temporal frame, provenance, and interpretation limits.

### Temporal Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Temporal Target` section
- `## Temporal Value` section
- `## Temporal Frame` section
- `## Temporal Provenance` section
- `## Interpretation Limits` section

Optional Sections

- `Precision And Uncertainty`
- `Related Artifacts`
- `Rendering Hints`
- `Examples`
- `Relationship to Artifact Annotation`

Rules

- Required sections should distinguish what time means in context.
- Unknown timezones, clocks, or frames should be explicit.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Allowed Labels

- instant
- interval
- timecode
- frame-range
- duration
- as-of
- version-time
- source-time
- unknown

Rules

- Annotation kind should state the temporal role.

### Temporal Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target Section
- Target Span
- Target Media
- Target Source Anchor

Rules

- Target should identify the artifact or region the temporal value applies to.

### Temporal Value

Required Fields

- Temporal Type
- Value

Optional Fields

- Start
- End
- Duration
- Timezone
- Precision
- Clock
- Frame Rate
- Source Timestamp

Allowed Labels

- instant
- interval
- timecode
- frame-range
- duration
- as-of
- before
- after
- between
- unknown

Rules

- Temporal value must identify whether it is wall-clock time, media time, source time, artifact time, or another temporal frame.
- Timezone or unknown timezone state should be explicit for wall-clock values.

### Temporal Frame

Required Fields

- Time Frame
- Interpretation

Optional Fields

- Source Clock
- Media Clock
- Artifact Clock
- Calendar
- Timezone

Allowed Labels

- wall-clock
- source-state-time
- artifact-created-at
- media-timecode
- version-time
- as-of-time
- unknown

Rules

- Time frame must not silently conflate artifact creation time with source-state time or event time.

### Temporal Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Created By
- Created At
- Observed At
- Tool
- Adapter
- Import Source

Rules

- Temporal provenance should disclose whether the value was manual, imported, observed, derived, or suggested.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- Temporal annotations must not imply event truth, source completeness, preservation, evidence, validation, authorship, or consent unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a temporal annotation when a bounded time value should be attached to an artifact or region.
- Do not create a temporal annotation for a full event record, source history claim, portal time resolution, or validation report when those schemas fit better.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Temporal Type
- Value
- Time Frame
- Annotation Source
- Annotation Method
- Interpretation Limits

Rules

- Missing clock, timezone, precision, or source should be explicit.

### Generation Rules

Rules

- Identify target and temporal value.
- Declare time frame and interpretation.
- Preserve provenance and limits.

### Suggested Sequence

Rules

- Choose target.
- Capture time value.
- Define time frame.
- Capture source/method.
- Add limits.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Temporal Annotation: Video segment

## Annotation Identity

Annotation Name: Comment segment timecode
Annotation Kind: timecode
Annotation State: observed

## Temporal Target

Target Artifact: review-video-001.trace.md
Target Region: media-segment

## Temporal Value

Temporal Type: interval
Value: 00:01:12.500-00:01:19.000
Start: 00:01:12.500
End: 00:01:19.000

## Temporal Frame

Time Frame: media-timecode
Interpretation: segment within the referenced media

## Temporal Provenance

Annotation Source: user-provided
Annotation Method: manual-input

## Interpretation Limits

Does Not Mean: the described event happened at wall-clock time
Must Not Be Used To Claim: source completeness, evidence status, preservation, or truth
```

## Relationship to Artifact Annotation

`tiinex.temporal.annotation.v1` inherits artifact annotation semantics and adds temporal value and time-frame boundaries.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.artifact.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
  - Value: q3dvqudmEXHS7EXxioWlpGJtHxMkLP5mY8ZCOxDrBpo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: I2dFBbH5uy0t6QfDIZ28Edb0y4q6WAyU_b8bMTE_axo