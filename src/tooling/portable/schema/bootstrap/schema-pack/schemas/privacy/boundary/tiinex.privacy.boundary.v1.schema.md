# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.privacy.boundary.v1](tiinex.privacy.boundary.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for privacy, sensitivity, sharing, serialization, and disclosure boundaries around Tiinex artifacts or referenced material.

---

# Privacy Boundary

- Status: maintained schema note

## Summary

This schema defines privacy-boundary artifacts whose main job is to make
sensitivity, sharing, serialization, and disclosure limits explicit for Tiinex
artifacts, payloads, claims, people, cases, samples, or related material.

It exists so privacy and sharing constraints are not hidden inside app defaults,
free-text warnings, or implicit local practice.

## Schema Validation Contract

### Privacy Boundary Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.privacy.boundary.v1`

Rules

- `tiinex.privacy.boundary.v1` identifies artifacts whose main job is to declare privacy, sensitivity, sharing, serialization, or disclosure boundaries.
- A privacy boundary artifact should describe limits on use, sharing, export, serialization, or public display without replacing the artifact's main domain schema.
- A privacy boundary artifact must not claim legal compliance by itself unless a legal or attestation artifact separately supports that claim.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Privacy Boundary Body

Required Shape

- first body heading after the continuity envelope
- `## Boundary Identity` section
- `## Sensitivity Scope` section
- `## Sharing Policy` section
- `## Serialization Policy` section
- `## Interpretation Limits` section

Optional Sections

- Subject Or Target
- Consent Or Authority
- Redaction Notes
- Retention
- Related Artifacts
- External Payloads
- References

Rules

- A privacy boundary artifact should begin with a human-readable boundary title.
- `Boundary Identity` must identify the boundary and its target scope.
- `Sensitivity Scope` must state what kind of sensitive material is in scope or whether sensitivity is unknown.
- `Sharing Policy` must state permitted or restricted sharing behavior.
- `Serialization Policy` must state whether app, URL, hash, export, or draft-state serialization is allowed, limited, or disabled.
- `Interpretation Limits` must state what the boundary does not decide or prove.

### Boundary Identity

Required Fields

- Boundary Name
- Boundary Level
- Applies To

Optional Fields

- Boundary Family
- Target Artifact
- Target Payload
- Target Relation
- Effective Date
- Review Date

Allowed Shapes

- `Boundary Level`: public, internal, private, sensitive, restricted, unknown

Rules

- `Boundary Name` should be stable enough for later artifacts or UI surfaces to reference.
- `Boundary Level` must use one of the allowed shapes declared in this contract.
- `Applies To` should state whether the boundary applies to an artifact, section, payload, person descriptor, sample, case, relation, claim, workspace, or another bounded target.
- `unknown` should be used when sensitivity cannot be determined but should not be treated as safe by default.

### Sensitivity Scope

Required Fields

- Sensitivity Description

Optional Fields

- Data Categories
- Subject Type
- Reidentification Risk
- Consent Required
- Legal Or Policy Context

Rules

- `Sensitivity Description` must state what kind of sensitive or non-sensitive material is in scope.
- `Data Categories` may include personal data, medical data, legal material, internal feedback, security-sensitive material, private payloads, or another local category.
- `Reidentification Risk` should be explicit when summaries, redactions, or descriptors could still identify a subject.
- Sensitivity categories should guide caution but must not pretend to provide full legal classification unless a legal authority or attestation supports that claim.

### Sharing Policy

Required Fields

- Sharing Policy

Optional Fields

- Public Display
- External Sharing
- Internal Sharing
- Requires Consent
- Requires Redaction
- Allowed Recipients
- Prohibited Recipients

Allowed Shapes

- allowed
- summary-only
- restricted
- prohibited
- unknown

Rules

- `Sharing Policy` must state whether sharing is allowed, summary-only, restricted, prohibited, or unknown.
- Public display, external sharing, internal sharing, and recipient limits should be explicit when known.
- `unknown` must not be interpreted as public or unrestricted.
- Privacy boundary artifacts may reference consent, attestation, redaction, relation, or external payload artifacts when sharing policy depends on them.

### Serialization Policy

Required Fields

- Serialization Policy

Optional Fields

- URL Hash Draft State
- Export Policy
- Clipboard Policy
- Local Storage Policy
- Remote Sync Policy
- App Warning

Allowed Shapes

- allowed
- summary-only
- disabled
- restricted
- unknown

Rules

- `Serialization Policy` must state whether serialization is allowed, summary-only, disabled, restricted, or unknown.
- URL hash, export, clipboard, local storage, and remote sync behavior should be stated when they materially affect disclosure risk.
- `disabled` means ordinary tooling should avoid serializing the protected material through that channel.
- `summary-only` means tooling may serialize a bounded summary but should not serialize full sensitive content.
- App warnings may be declared here, but UI behavior still requires explicit app support.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-privacy-boundary.trace.md`
- `<lineage>-<privacy-slug>.trace.md`

Rules

- Privacy boundary artifacts should keep the lineage label first.
- The optional slug should identify the privacy target, boundary level, or sharing context.
- Privacy boundary artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.privacy.boundary.v1` when the main artifact value is an explicit privacy, sensitivity, sharing, serialization, or disclosure boundary.
- Do not use `tiinex.privacy.boundary.v1` as a substitute for redaction records when the main artifact value is what was removed or transformed.
- Do not use `tiinex.privacy.boundary.v1` as a substitute for consent when the main artifact value is permission, revocation, or allowed use.
- Do not use `tiinex.privacy.boundary.v1` to claim legal compliance without a supporting legal, policy, consent, or attestation artifact.
- Redaction and consent schemas may later narrow or complement this schema when those semantics need stronger local structure.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.privacy.boundary.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Privacy boundary for a medical payload reference.

---

# Medical Payload Privacy Boundary

## Boundary Identity

- Boundary Name: medical payload restricted boundary
- Boundary Level: restricted
- Applies To: private lab result archive payload artifact

## Sensitivity Scope

- Sensitivity Description: medical and personal data may be present in the referenced payload
- Data Categories: medical data, personal data
- Reidentification Risk: high if raw payload or detailed sample metadata is shared

## Sharing Policy

- Sharing Policy: restricted
- Public Display: prohibited
- External Sharing: requires explicit authorization
- Requires Redaction: yes for public summaries

## Serialization Policy

- Serialization Policy: summary-only
- URL Hash Draft State: disabled for raw payload details
- Export Policy: restricted
- App Warning: warn before sharing or exporting full content

## Interpretation Limits

- Interpretation Limits: this boundary does not itself prove consent, legal compliance, or clinical correctness
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- privacy boundary artifacts make sharing and serialization limits explicit without turning root into a privacy engine
- privacy boundaries should guide UI caution and schema interpretation, but strict legal or compliance behavior requires explicit support from appropriate companion artifacts and tooling
- this support schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: HXge72d5LxjFlbAKkQ30yj_RsTTn3SjIRieMQYNizwg