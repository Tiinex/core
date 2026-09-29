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
  - Current Schema: [tiinex.validation.annotation.v1](tiinex.validation.annotation.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Specializes artifact annotations for lightweight validation or lint signals that may be shown inline without replacing a full validation report.
  - Summary: Validation annotation schema for bounded inline validation, lint, and status signals.

---


# Validation Annotation

## Summary

Defines an artifact annotation for lightweight validation, lint, check, or status signals attached to an artifact or region.

A validation annotation may power chips such as byte-ok, checksum warning, lint warning, unknown method, skipped validator, or field-level status. It is not a full validation report unless a separate `validation.report` artifact owns the run boundary and findings.

## Core Semantics

- Validation annotation = lightweight target-bound validation or lint signal.
- Validation annotation must identify target, method/check, status, result boundary, provenance, and limits.
- Validation annotation may summarize a result from a validation report or represent a local inline check.
- Validation annotation must not replace validation method semantics or validation report run semantics.

## Schema Validation Contract

### Validation Annotation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.validation.annotation.v1`

Rules

- `tiinex.validation.annotation.v1` identifies annotations whose main value is lightweight validation or lint status.
- Validation annotations inherit artifact annotation semantics from `tiinex.artifact.annotation.v1`.
- Validation annotations must distinguish check, method, status, result boundary, provenance, and interpretation limits.

### Validation Annotation Body

Required Shape

- first body heading after the continuity envelope
- `## Annotation Identity` section
- `## Validation Target` section
- `## Validation Signal` section
- `## Validation Provenance` section
- `## Result Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Related Validation Report`
- `Related Method`
- `Suggested Handling`
- `Examples`
- `Relationship to Artifact Annotation`

Rules

- Required sections should make clear whether the annotation is a summary signal or a full validation result.
- Full validation runs should be represented by `validation.report`.

### Annotation Identity

Required Fields

- Annotation Name
- Annotation Kind
- Annotation State

Allowed Labels

- validation-signal
- lint-signal
- checksum-signal
- byte-status
- field-status
- skipped-check
- unknown-method
- unavailable-check
- unknown

Rules

- Annotation kind should identify the status signal role.

### Validation Target

Required Fields

- Target Artifact
- Target Region

Optional Fields

- Target Field
- Target Section
- Target Method
- Target Source Anchor

Rules

- Target should identify what was checked.

### Validation Signal

Required Fields

- Check ID
- Status
- Message

Optional Fields

- Severity
- Expected
- Actual
- Method ID
- Report ID
- Confidence

Allowed Labels

- pass
- fail
- warning
- skipped
- unavailable
- unknown-method
- not-applicable
- unconfirmed
- unknown

Rules

- Status must describe the check outcome, not target truth.
- `pass` for one check must not imply full artifact validity.

### Validation Provenance

Required Fields

- Annotation Source
- Annotation Method

Optional Fields

- Tool
- Validator
- Method Version
- Run ID
- Run At
- Report Artifact

Rules

- Validation provenance should identify the check or method that produced the signal.

### Result Boundary

Required Fields

- Scope
- Completeness

Optional Fields

- Covered Fields
- Not Covered
- Remaining Limits
- Full Report

Rules

- Result boundary must state what the annotation covers and does not cover.
- A validation annotation must not silently stand in for a full validation report.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- Validation annotations must not imply truth, evidence, preservation, authorship, identity, consent, or full validity unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a validation annotation when a lightweight validation signal should be attached to a target.
- Do not create a validation annotation when a full validation run needs to be preserved; use `validation.report`.
- Do not define method semantics here; use `validation.method`.

### Required Inputs

Required Fields

- Target Artifact
- Target Region
- Check ID
- Status
- Message
- Annotation Source
- Annotation Method
- Scope
- Completeness
- Interpretation Limits

Rules

- Missing scope or method should be explicit.

### Generation Rules

Rules

- Identify target and check.
- Record status and message.
- Preserve method/run provenance if known.
- State result boundary and limits.

### Suggested Sequence

Rules

- Run or observe a check.
- Create annotation only if inline signal is useful.
- Link full validation report when one exists.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.

## Minimal Example

```text
# Validation Annotation: Byte check

## Annotation Identity

Annotation Name: Byte integrity chip
Annotation Kind: byte-status
Annotation State: derived

## Validation Target

Target Artifact: tiinex.claim.v1.schema.md
Target Region: whole-artifact

## Validation Signal

Check ID: byte-size-readable
Status: pass
Message: Artifact text was loaded and byte length could be computed.
Severity: info

## Validation Provenance

Annotation Source: Tiinex browser runtime
Annotation Method: byte-length check

## Result Boundary

Scope: loaded text byte length only
Completeness: single-check
Not Covered: schema validity, semantic validity, evidence status, truth

## Interpretation Limits

Does Not Mean: artifact is valid or true
Must Not Be Used To Claim: full validation, preservation, authorship, consent, or evidence status
```

## Relationship to Artifact Annotation

`tiinex.validation.annotation.v1` inherits artifact annotation semantics and adds lightweight validation signal and result boundary semantics.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.artifact.annotation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/annotation/artifact/tiinex.artifact.annotation.v1.schema.md)
  - Value: q3dvqudmEXHS7EXxioWlpGJtHxMkLP5mY8ZCOxDrBpo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: AzThGWOcP-OfgW092F3S-Q4MhmTgyBCT4zWGTXVzBa8