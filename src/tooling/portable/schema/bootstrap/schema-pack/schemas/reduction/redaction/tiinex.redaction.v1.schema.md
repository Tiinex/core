# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.reduction.v1](../tiinex.reduction.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.reduction.v1.schema.md](../tiinex.reduction.v1.schema.md)
  - Origin:
    - [relative](../tiinex.reduction.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/02392a68bb70f9b1656a77c6c65c272582d05ab1/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
- Current
  - Current Schema: [tiinex.redaction.v1](tiinex.redaction.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for observable redaction artifacts that preserve removal, masking, transformation, residual risk, and carry-forward limits.

---

# Redaction

- Status: maintained schema note

## Summary

This schema narrows `tiinex.reduction.v1` for artifacts whose main job is to
make a redaction, masking, removal, omission, generalization, or disclosure
reduction observable.

It exists so Tiinex can distinguish privacy policy from the concrete act of
removing or transforming material, while preserving what now carries forward,
what was lost, and what residual risk remains.

## Schema Validation Contract

### Redaction Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.redaction.v1`

Rules

- `tiinex.redaction.v1` identifies reduction artifacts centered on a concrete redaction or disclosure-limiting transformation.
- A redaction artifact should explain the fuller source context, the redaction action, what carries forward, what was removed or transformed, and what risk remains.
- A redaction artifact must not claim that the remaining material is safe, anonymous, legally compliant, or semantically equivalent unless those claims are separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Redaction Body

Required Shape

- first body heading after the continuity envelope
- `## Source Context` section
- `## Redaction Action` section
- `## Carry-Forward State` section
- `## Loss And Uncertainty` section
- `## Residual Risk` section
- `## Validation` section

Optional Sections

- Redaction Method
- Removed Material
- Transformed Material
- Privacy Boundary
- Consent Context
- Evidence Basis
- Related Artifacts
- References
- Interpretation Limits

Rules

- A redaction artifact should begin with a human-readable title.
- `Source Context` must identify the fuller source, source artifact, payload, section, claim, or bounded context being redacted.
- `Redaction Action` must state what redaction or transformation was performed and why.
- `Carry-Forward State` must state what the redacted artifact or remaining material is allowed to carry forward.
- `Loss And Uncertainty` must state what was removed, masked, transformed, omitted, degraded, or left uncertain.
- `Residual Risk` must state remaining disclosure, reidentification, interpretive, or recovery risk.
- `Validation` must state how the redaction was checked, accepted, limited, or left unverified.
- The body must remain readable without requiring access to the unredacted source.

### Redaction Action

Required Fields

- Redaction Type
- Redaction Reason
- Redaction Target

Optional Fields

- Redaction Method
- Redaction Authority
- Policy Basis
- Privacy Boundary
- Consent Context
- Performed By
- Performed At

Allowed Shapes

- `Redaction Type`: removal
- `Redaction Type`: masking
- `Redaction Type`: generalization
- `Redaction Type`: aggregation
- `Redaction Type`: replacement
- `Redaction Type`: omission
- `Redaction Type`: crop
- `Redaction Type`: blur
- `Redaction Type`: transformation
- `Redaction Type`: other

Rules

- `Redaction Type` must use one of the declared shapes so tools can group common redaction actions without treating the vocabulary as exhaustive.
- `Redaction Reason` must state why the material was removed, masked, generalized, or transformed.
- `Redaction Target` must identify the field, section, payload area, artifact area, claim, or bounded target being redacted as specifically as safe disclosure allows.
- Redaction authority, policy, privacy boundary, or consent context should be explicit when known.

### Carry-Forward State

Required Fields

- Remaining Material
- Carry-Forward Claim
- Redacted Output

Optional Fields

- Output Artifact
- Output Payload
- Output Status
- Allowed Use
- Prohibited Use

Rules

- `Remaining Material` must state what survives the redaction.
- `Carry-Forward Claim` must state what later work may rely on after the redaction.
- `Redacted Output` must identify the redacted artifact, payload, excerpt, summary, or bounded output descriptor.
- A redaction artifact must not present removed or uncertain material as retained fact.
- If the redacted output cannot support the same interpretation as the source, the artifact must say so in `Carry-Forward Claim`, `Loss And Uncertainty`, or `Interpretation Limits`.

### Loss And Uncertainty

Required Fields

- Removed Or Transformed Material
- Loss Description

Optional Fields

- Semantic Drift Risk
- Known Gaps

Rules

- `Removed Or Transformed Material` must describe the removed, masked, generalized, omitted, or transformed material at a safe level of detail.
- `Loss Description` must state the fidelity, context, or interpretation loss created by the redaction.
- A redaction artifact should preserve known gaps rather than implying complete protection.

### Residual Risk

Required Fields

- Residual Disclosure Risk

Optional Fields

- Reidentification Risk
- Recovery Risk

Allowed Shapes

- `Residual Disclosure Risk`: low
- `Residual Disclosure Risk`: medium
- `Residual Disclosure Risk`: high
- `Residual Disclosure Risk`: unknown
- `Reidentification Risk`: low
- `Reidentification Risk`: medium
- `Reidentification Risk`: high
- `Reidentification Risk`: unknown

Rules

- `Residual Disclosure Risk` must use one of the declared shapes and should not be inferred as low from the presence of redaction alone.
- `Reidentification Risk` should be explicit when summaries, partial identifiers, context, or linked artifacts could identify a subject.

### Validation

Required Fields

- Validation Status
- Validation Method

Optional Fields

- Reviewer
- Review Date
- Evidence Basis
- Known Failures
- Validation Limits

Allowed Shapes

- `Validation Status`: reviewed
- `Validation Status`: machine-checked
- `Validation Status`: externally-checked
- `Validation Status`: partial
- `Validation Status`: unvalidated
- `Validation Status`: unknown

Rules

- `Validation Status` must use one of the declared shapes.
- `Validation Method` must state how the redaction was checked or state that the validation method is unknown.
- Redaction validation should not be read as legal compliance, consent, anonymity, or truth unless those claims are inside the declared validation scope.
- Validation method artifacts may be referenced when method semantics are defined elsewhere.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-redaction.trace.md`
- `<lineage>-<redaction-slug>.trace.md`

Rules

- Redaction artifacts should keep the lineage label first.
- The optional slug should identify the redacted target, method, or disclosure boundary.
- Redaction artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.redaction.v1` when the main artifact value is an observable redaction, masking, omission, or disclosure-limiting transformation.
- Do not use `tiinex.redaction.v1` as a substitute for privacy boundary artifacts when the main value is sharing or sensitivity policy.
- Do not use `tiinex.redaction.v1` as a substitute for consent artifacts when the main value is permission or allowed use.
- Do not use `tiinex.redaction.v1` merely because an artifact is short or summarized.
- Redaction is a reduction event when later work depends on the redacted carry-forward state.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.redaction.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Redaction record for public summary of one private lab payload.

---

# Public Summary Redaction Record

## Source Context

- Source: private lab result archive payload artifact
- Source Boundary: restricted medical payload

## Redaction Action

- Redaction Type: generalization
- Redaction Reason: public summary should not expose raw personal or sample-identifying details
- Redaction Target: raw sample identifiers and detailed lab metadata
- Privacy Boundary: medical payload restricted boundary

## Carry-Forward State

- Remaining Material: bounded non-identifying summary of the payload role and review status
- Carry-Forward Claim: later public artifacts may state that a private lab payload exists and was reviewed, but not its raw contents
- Redacted Output: public summary descriptor

## Loss And Uncertainty

- Removed Or Transformed Material: raw identifiers and detailed metadata are not reproduced
- Loss Description: raw payload cannot be reconstructed from the public summary

## Residual Risk

- Residual Disclosure Risk: medium
- Reidentification Risk: unknown

## Validation

- Validation Status: reviewed
- Validation Method: human review against privacy boundary
- Validation Limits: review does not prove legal compliance, consent, or anonymity
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- redaction narrows reduction semantics to observable removal, masking, transformation, and residual-risk preservation
- privacy boundary says what should be protected; redaction says what was actually removed, transformed, or carried forward
- this support schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.reduction.v1.schema.md](https://github.com/Tiinex/docs/blob/02392a68bb70f9b1656a77c6c65c272582d05ab1/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
  - Value: kpMi8eu4V4wN3qcwlrH34hgMRy1g4-XR-wEcfeUceKc

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: mcLMv8UItqR5NQSRhegyIb2CScJ-rtX4es9nEauazME