# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.instrument.v1](../tiinex.instrument.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.instrument.v1.schema.md](../tiinex.instrument.v1.schema.md)
  - Origin:
    - [relative](../tiinex.instrument.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/instrument/tiinex.instrument.v1.schema.md)
- Current
  - Current Schema: [tiinex.instrument.consent.v1](tiinex.instrument.consent.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for consent, refusal, withdrawal, permission, restriction, and use-boundary instruments with scope, authority, revocation, and expiry limits.

---

# Consent Instrument

- Status: maintained schema note

## Summary

This schema narrows `tiinex.instrument.v1` for artifacts whose main job is to preserve an explicit consent, permission, refusal, withdrawal, restriction, or use-boundary instrument.

It replaces the earlier PoC placement of consent under attestation by treating consent as a terms-bearing instrument. A consent instrument may still reference attestation when the main value is who witnessed, stated, signed, or vouched for the consent-related statement.

A consent instrument does not prove identity, legal compliance, clinical correctness, provenance, or byte integrity by itself. It preserves the declared permission or refusal boundary so later readers and tools do not infer consent from silence, convenience, or app defaults.

## Schema Validation Contract

### Consent Instrument Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.instrument.consent.v1`

Rules

- `tiinex.instrument.consent.v1` identifies instrument-derived artifacts centered on consent, refusal, withdrawal, permission, restriction, or allowed use.
- A consent instrument artifact records that a party, delegate, guardian, organization, authority, or bounded descriptor made or is represented as making a scoped consent-related statement.
- A consent instrument artifact should state consent type, consent status, consenting party or authority, scope, use boundary, revocation or expiry, and interpretation limits.
- A consent instrument artifact must not imply identity, legal compliance, clinical correctness, provenance, receipt, or byte integrity unless those claims are separately supported by appropriate artifacts or methods.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.instrument.consent.v1` specializes the inherited `Instrument Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.instrument.consent.v1`.
- `Consent Statement` specializes `Instrument Identity`, `Terms Or Permissions`, and consent-related status.
- `Consenting Party` specializes `Parties Or Authorities`.
- `Consent Scope` and `Use Boundary` specialize `Terms Or Permissions` and `Boundaries`.
- `Revocation Or Expiry` specializes `Status And Effect`.
- `Interpretation Limits` preserves inherited limits and prevents treating consent as legal compliance, identity proof, or broad permission by default.

### Consent Instrument Body

Required Shape

- first body heading after the continuity envelope
- `## Consent Statement` section
- `## Consenting Party` section
- `## Consent Scope` section
- `## Use Boundary` section
- `## Revocation Or Expiry` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Basis
- Attestation Basis
- Privacy Boundary
- Related Artifacts
- Related Instrument
- External Payloads
- References

Rules

- A consent instrument artifact should begin with a human-readable title.
- `Consent Statement` must state the consent-related statement being preserved.
- `Consenting Party` must identify the consenting party, role, delegate, guardian, authority, or bounded descriptor as specifically as the artifact can safely disclose.
- `Consent Scope` must state the bounded purpose, target, and allowed or prohibited use.
- `Use Boundary` must state what use, sharing, serialization, retention, or disclosure limits apply.
- `Revocation Or Expiry` must state expiry and revocation status, even when they are unknown or not declared.
- `Interpretation Limits` must state what the consent instrument should not be read as proving.

### Consent Statement

Required Fields

- Statement
- Consent Type
- Consent Status

Optional Fields

- Subject
- Target Artifact
- Target Payload
- Statement Date
- Effective Date
- Evidence Basis
- Attestation Basis

Allowed Shapes

- `Consent Type`: authorization
- `Consent Type`: permission
- `Consent Type`: refusal
- `Consent Type`: withdrawal
- `Consent Type`: restriction
- `Consent Type`: delegated-consent
- `Consent Type`: guardian-consent
- `Consent Type`: research-consent
- `Consent Type`: data-use-consent
- `Consent Type`: other
- `Consent Status`: active
- `Consent Status`: revoked
- `Consent Status`: expired
- `Consent Status`: restricted
- `Consent Status`: refused
- `Consent Status`: unknown

Rules

- `Statement` should preserve the consent-related statement in readable form.
- `Consent Type` must use one of the declared shapes so tools can group consent classes without treating the vocabulary as exhaustive.
- `Consent Status` must use one of the declared shapes and should not be inferred from silence.
- A refusal, withdrawal, or restriction is consent-related even when it denies or limits use.
- Consent instruments should preserve uncertainty through `Consent Status: unknown` or `Interpretation Limits` instead of inventing permission.

### Consenting Party

Required Fields

- Party
- Role Or Authority

Optional Fields

- Subject
- Delegate
- Guardian
- Organization
- Identifier
- Contact Boundary
- Privacy Boundary

Rules

- `Party` should identify the consenting person, role, delegate, guardian, organization, authority, or bounded descriptor.
- `Role Or Authority` must state why the party is allowed, represented, or claimed to make the consent-related statement.
- When identity cannot be safely disclosed, the artifact should preserve a bounded role or authority descriptor instead of exposing sensitive identity.
- A consent instrument must not assume that a party has authority unless the artifact states the authority basis or declares the authority unknown.

### Consent Scope

Required Fields

- Purpose
- Applies To
- Allowed Uses
- Prohibited Uses

Optional Fields

- Jurisdiction Or Policy Context

Rules

- `Purpose` must state the reason, workflow, research use, publication use, processing use, or other bounded purpose.
- `Applies To` must state the artifact, payload, sample, person descriptor, case, relation, claim, workspace, or other target in scope.
- `Allowed Uses` must state permitted uses, or explicitly state that permitted uses are unknown.
- `Prohibited Uses` must state known prohibited uses, or explicitly state that prohibited uses are unknown.

### Use Boundary

Required Fields

- Use Boundary

Optional Fields

- Sharing Boundary
- Serialization Boundary
- Retention Boundary
- Privacy Boundary

Rules

- `Use Boundary` must summarize the practical boundary a later tool or reader should respect.
- Sharing, serialization, retention, and privacy boundaries should be explicit when they materially affect disclosure or use.

### Revocation Or Expiry

Required Fields

- Expiry
- Revocation Status

Optional Fields

- Revocation Path
- Revoked At
- Renewal Required
- Review Date
- Known Gaps

Allowed Shapes

- `Revocation Status`: active
- `Revocation Status`: revoked
- `Revocation Status`: expired
- `Revocation Status`: restricted
- `Revocation Status`: not-declared
- `Revocation Status`: unknown

Rules

- `Expiry` must state a date, condition, `not-declared`, or `unknown`.
- `Revocation Status` must use one of the declared shapes.
- If revocation is possible but the revocation path is unknown, the artifact should say so explicitly.
- Consent should not be treated as permanent unless permanence is inside the declared statement and trust boundary.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-consent.trace.md`
- `<lineage>-consent-instrument.trace.md`
- `<lineage>-<consent-slug>.trace.md`

Rules

- Consent instrument artifacts should keep the lineage label first.
- The optional slug should identify the consent target, purpose, or consent class.
- Consent instrument artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.instrument.consent.v1` when the main artifact value is permission, refusal, withdrawal, restriction, or use-boundary consent semantics.
- Do not use `tiinex.instrument.consent.v1` as a substitute for privacy boundary artifacts when the main value is sensitivity, sharing, or serialization policy.
- Do not use `tiinex.instrument.consent.v1` as a substitute for attestation when the main value is a scoped witness, review, signoff, identity, or authority statement rather than the consent boundary itself.
- Do not use `tiinex.instrument.consent.v1` to claim legal compliance without supporting legal, policy, evidence, or attestation artifacts.
- Consent instruments may reference privacy boundary, attestation, relation, external payload, validation method, or evidence artifacts when those artifacts define the consent context.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.instrument.consent.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Consent boundary for summary-only use of one private lab payload.

---

# Summary-Only Lab Payload Consent Instrument

## Consent Statement

- Statement: the subject-authorized representative permits summary-only use of the referenced lab payload for the stated review workflow
- Consent Type: data-use-consent
- Consent Status: active
- Target Payload: private-lab-result-payload.trace.md

## Consenting Party

- Party: bounded authorized representative descriptor
- Role Or Authority: subject-authorized representative

## Consent Scope

- Purpose: internal review of one lab result package
- Applies To: private lab result payload artifact
- Allowed Uses: bounded internal summary
- Prohibited Uses: public raw payload disclosure

## Use Boundary

- Use Boundary: summary-only internal review; no raw payload serialization into public artifacts
- Sharing Boundary: restricted
- Serialization Boundary: raw payload details disabled

## Revocation Or Expiry

- Expiry: unknown
- Revocation Status: unknown
- Revocation Path: not recorded in this artifact

## Interpretation Limits

- Interpretation Limits: this artifact does not prove legal compliance, subject identity, payload integrity, or clinical correctness
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- consent is now modeled as an instrument child rather than an attestation child in this PoC refactor
- consent instruments preserve permission, refusal, withdrawal, restriction, or allowed-use boundaries
- attestation remains available as a companion artifact when the main value is who vouched, signed, witnessed, or asserted the consent statement
- consent should remain separate from privacy boundary, redaction, evidence, integrity, and legal compliance unless those companion artifacts are explicitly referenced

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder

Rules

- The current consent instrument create surface uses version `1`.
- `createTitle` should label the create action as `Create Consent Instrument`.
- `summaryPrompt` should ask for the consent boundary title.
- `summaryPlaceholder` should guide the user toward the permission, refusal, withdrawal, or use boundary.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Consent Statement` section
- `## Consenting Party` section
- `## Consent Scope` section
- `## Use Boundary` section
- `## Revocation Or Expiry` section
- `## Interpretation Limits` section

Rules

- Generated consent instrument artifacts should begin with the consent title as the first body heading.
- Generated consent instrument artifacts should preserve the consent boundary without inferring permission from silence.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.instrument.v1.schema.md](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/instrument/tiinex.instrument.v1.schema.md)
  - Value: cTDOjKzeDs_d2I6qW-RbSs6KXWeONhVvDUDfH5uJ_uI

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: IfPGUoceCJRio_hNcCTAUPyPGxUBW4svQGWsuJ54qw4