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
  - Current Schema: [tiinex.style.annotation.v1](tiinex.style.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes artifact annotations for authoring style, naming, display, lint, readability, and presentation-quality warnings without turning style issues into root-valid failures.
  - Summary: Style annotation schema for non-blocking authoring and presentation guidance.

---


# Style Annotation

## Summary

Defines an artifact annotation for style, naming, display, authoring convention, lint, readability, or presentation-quality guidance.

Style annotation is useful for schema body title conventions, display title derivation, spelling, tone, duplicate wording, overly verbose names, presentation noise, or authoring patterns that should be improved without making the artifact invalid.

Style annotation does not mean validation failure unless a separate validation method or report says so.

## Core Semantics

- Style annotation = artifact annotation for authoring or presentation style guidance.
- Style annotation may be shown as a chip, badge, warning, lint row, editor hint, or schema-builder suggestion.
- Style annotation must state rule, severity, message, suggested change or display candidate when available.
- Style annotation must not silently become root-valid failure, semantic invalidity, evidence, decision, or content mutation.

## Schema Validation Contract

### Style Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.style.annotation.v1`

Rules

- `tiinex.style.annotation.v1` identifies annotations whose main value is style or authoring guidance.
- Style annotations inherit artifact annotation semantics from `tiinex.artifact.annotation.v1`.
- Style annotations must distinguish target, rule, severity, message, provenance, suggested remediation, and interpretation limits.

### Style Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Style Target` section
- `## Style Finding` section
- `## Style Provenance` section
- `## Suggested Handling` section
- `## Interpretation Limits` section

Optional Sections

- `Display Candidate`
- `Related Rules`
- `Examples`
- `Relationship to Artifact Annotation`

Rules

- Required sections should make clear whether this is warning, suggestion, or blocker.
- Display candidates are presentation hints, not artifact edits.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Allowed Labels

- style-warning
- style-suggestion
- naming-warning
- display-warning
- readability-warning
- lint-warning
- unknown

Rules

- Style state describes the annotation, not root validity.

### Style Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target Text
- Target Section
- Target Span
- Target Selector

Rules

- Style target should identify the exact region being linted when possible.

### Style Finding

Required Fields

- Rule ID
- Severity
- Message

Optional Fields

- Current Value
- Expected Pattern
- Suggested Value
- Display Candidate
- Rationale

Allowed Labels

- info
- warning
- style-warning
- error
- blocker
- unknown

Rules

- Severity must state whether the style issue is non-blocking or blocking.
- `blocker` should only be used when a validation method or policy makes the style rule mandatory.

### Style Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Rule Version
- Tool
- Created At
- Review Method

Rules

- Style provenance should identify the lint rule or review method that produced the warning.

### Suggested Handling

Required Fields

- Suggested Action
- Mutates Target

Optional Fields

- Auto Fix Available
- Manual Review Needed
- Safe Display Fallback

Rules

- Suggested action should separate display normalization from source mutation.
- `Mutates Target` must be explicit.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- Style annotations must not imply semantic invalidity, checksum failure, evidence status, validation failure, truth, authorship, or consent unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a style annotation when authoring or presentation guidance should be preserved without changing target content.
- Do not create a style annotation for root-valid schema failures, semantic findings, evidence, decisions, or full validation reports when those schemas fit better.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Rule ID
- Severity
- Message
- Annotation Source
- Annotation Method
- Suggested Action
- Interpretation Limits

Rules

- Missing severity or mutation boundary should be explicit.

### Generation Rules

Rules

- Identify target region.
- State rule, severity, and message.
- Provide suggested display or fix when useful.
- State whether source mutation is intended.
- Add limits.

### Suggested Sequence

Rules

- Lint target.
- Create style annotation if non-blocking guidance should persist.
- Show annotation on presentation surfaces as needed.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Style Annotation: Schema body title warning

## Annotation Identity

Annotation Name: Schema body title warning
Annotation Kind: style-warning
Annotation State: derived

## Style Target

Target Artifact: tiinex.condition.v1.schema.md
Target Region: body-h1
Target Text: Tiinex Condition v1 Schema

## Style Finding

Rule ID: schema-body-title-style-v1
Severity: style-warning
Message: Schema H1 repeats Tiinex prefix, version, and Schema suffix already carried by filename or Continuity Context.
Suggested Value: Condition
Display Candidate: Condition

## Style Provenance

Annotation Source: schema title linter
Annotation Method: static authoring-style lint
Rule Version: 1

## Suggested Handling

Suggested Action: show normalized display title and keep source text until authoring tooling edits it
Mutates Target: no
Auto Fix Available: candidate-only

## Interpretation Limits

Does Not Mean: the schema is invalid
Must Not Be Used To Claim: semantic failure, checksum failure, evidence status, or rejection
```

## Relationship to Artifact Annotation

`tiinex.style.annotation.v1` inherits artifact annotation semantics and adds style rule, severity, and suggested handling boundaries.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.artifact.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
  - Value: q3dvqudmEXHS7EXxioWlpGJtHxMkLP5mY8ZCOxDrBpo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Um7rjThhQlYEkPHoWcn83zo5UNbA6OJoTRTGtWjWncA