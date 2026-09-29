# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.attestation.v1](tiinex.attestation.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for human, organizational, legal, witness, lab, or role-based attestations with explicit scope and limits.

---

# Attestation

- Status: maintained schema note

## Summary

This schema defines attestation artifacts whose main job is to preserve a scoped
statement made by a person, role, organization, witness, lab, authority, or other
attesting party.

It exists so Tiinex can represent human, social, legal, clinical, organizational,
or review-based trust signals without confusing them with byte integrity,
schema validity, runtime reproducibility, or direct proof of truth.

## Schema Validation Contract

### Attestation Schema Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.attestation.v1`

Rules

- `tiinex.attestation.v1` identifies artifacts whose main job is to preserve a scoped attestation.
- An attestation artifact records that an attesting party attested a statement within a declared role, scope, and boundary.
- An attestation artifact must not imply that the attested statement is technically proven, historically true, consented, or integrity-verified unless that is separately supported by an appropriate method or evidence artifact.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Attestation Body

Required Shape

- first body heading after the continuity envelope
- `## Attestation Statement` section
- `## Attesting Party` section
- `## Attestation Scope` section
- `## Trust Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Basis
- Validation Method
- Related Artifacts
- Consent Context
- Revocation Or Expiry
- References

Rules

- An attestation artifact should begin with a human-readable title.
- `Attestation Statement` must state what is being attested.
- `Attesting Party` must identify the party, role, or authority behind the attestation as specifically as the artifact can safely disclose.
- `Attestation Scope` must state the bounded scope in which the attestation applies.
- `Trust Boundary` must state what authority, context, or process the attestation depends on.
- `Interpretation Limits` must state what the attestation should not be read as proving.

### Attestation Statement

Required Fields

- Statement
- Attestation Type

Optional Fields

- Subject
- Target Artifact
- Claim Reference
- Statement Date
- Effective Date

Allowed Shapes

- review
- approval
- witness-statement
- lab-signoff
- legal-attestation
- organizational-certification
- consent-attestation
- role-attestation
- other

Rules

- `Statement` should preserve the attested statement in readable form.
- `Attestation Type` must use one of the declared shapes so tools can group common attestation classes without treating the vocabulary as exhaustive.
- `Attestation Type` should distinguish review, approval, witness-statement, lab-signoff, legal-attestation, organizational-certification, consent-attestation, role-attestation, or another local attestation class represented as `other`.
- A statement may target a Tiinex artifact, an external payload, a person or role descriptor, a claim, a sample, a process, or a bounded textual target description.
- If the attested target is not directly linkable, the artifact should preserve a bounded target description.

### Attesting Party

Required Fields

- Party
- Role

Optional Fields

- Organization
- Identifier
- Contact Boundary
- Signature Reference
- Delegated Authority

Rules

- `Party` should identify the attesting person, role, group, organization, or authority.
- `Role` should describe why the party is relevant to the attestation.
- When identity cannot be safely disclosed, the artifact should preserve a bounded role or authority descriptor instead of inventing identity.
- Signature references may support an attestation, but an attestation artifact must not treat the existence of a signature as proof of the attested statement's truth unless a validation method declares that scope.

### Attestation Scope

Required Fields

- Scope

Optional Fields

- Expiry
- Revocation

Rules

- `Scope` must state what domain, artifact, claim, process, time window, or authority context the attestation covers.
- `Expiry` and `Revocation` should remain explicit when they materially bound the attestation.

### Trust Boundary

Required Fields

- Trust Boundary

Optional Fields

- Evidence Basis
- Validation Method
- Privacy Boundary

Rules

- `Trust Boundary` must state what authority, process, witness context, institutional role, or external system the attestation relies on.
- An attestation may reference a validation method artifact when the attestation method has explicit verification semantics.
- An attestation may reference evidence artifacts, relation artifacts, external payloads, or privacy boundary artifacts when those artifacts define the attestation context.

### Interpretation Limits

Required Fields

- Interpretation Limits

Rules

- `Interpretation Limits` must state important claims the attestation does not prove.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-attestation.trace.md`
- `<lineage>-<attestation-slug>.trace.md`

Rules

- Attestation artifacts should keep the lineage label first.
- The optional slug should identify the attestation role, target, or bounded statement family.
- Attestation artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.attestation.v1` when the main artifact value is a scoped attestation by a human, role, organization, witness, lab, authority, or similar party.
- Do not use `tiinex.attestation.v1` as a substitute for evidence when the main artifact value is preserved supporting material.
- Do not use `tiinex.attestation.v1` as a substitute for validation method definitions or validation result artifacts.
- Do not use `tiinex.attestation.v1` to imply consent unless consent is explicitly inside the attestation statement and scope.
- Consent-specific schemas may later narrow or complement this schema when consent semantics need stronger local structure.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.attestation.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Lab review attestation for one preserved result package.

---

# Lab Review Attestation

## Attestation Statement

- Statement: the named reviewer attests that the referenced lab result package was reviewed under the stated lab procedure
- Attestation Type: lab-signoff
- Target Artifact: sample-result-payload.trace.md

## Attesting Party

- Party: bounded lab reviewer descriptor
- Role: authorized lab reviewer
- Organization: example lab

## Attestation Scope

- Scope: review of one referenced result package under the local lab procedure

## Trust Boundary

- Trust Boundary: lab review process and reviewer authority
- Evidence Basis: linked lab result payload and review log

## Interpretation Limits

- Interpretation Limits: this attestation does not by itself prove biological truth, patient identity, consent, or byte integrity
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- attestation artifacts preserve scoped human, role, organizational, legal, or witness statements without treating those statements as universal proof
- attestation should remain separate from byte integrity, validation methods, evidence, consent, and privacy boundaries unless those artifacts are explicitly referenced
- this support schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: pbLraIsPRv4uFdGKSd2WlLHd4vgEqOR2V_PdLDKc_S0

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: MUG4XbuVNEFhccyk65Qllz-ghGzeXAGWsQ54yq9vZgo