# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.resource.v1](../tiinex.resource.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.resource.v1.schema.md](../tiinex.resource.v1.schema.md)
  - Origin:
    - [relative](../tiinex.resource.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/5fb5d130f93492a4e56df5d07397b9dcd5bb1a7c/.topics/.schemas/resource/tiinex.resource.v1.schema.md)
- Current
  - Current Schema: [tiinex.resource.contribution.v1](tiinex.resource.contribution.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for offered, pledged, donated, transferred, provided, or loaned resources with contributor, target need, terms, status, and receipt boundary.

---

# Resource Contribution

- Status: maintained schema note

## Summary

This schema narrows `tiinex.resource.v1` for artifacts whose main job is to preserve a resource contribution: an offer, pledge, donation, transfer, provision, loan, in-kind support, access grant, or other resource made available toward a bounded need or purpose.

A contribution artifact should distinguish promised from received, restricted from unrestricted, conditional from unconditional, and contribution record from proof material.

## Schema Validation Contract

### Resource Contribution Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.contribution.v1`

Rules

- `tiinex.resource.contribution.v1` identifies artifacts centered on a resource contribution or contribution state.
- A resource contribution artifact should state who or what contributed, what was contributed, what need or purpose it targets, what terms apply, and whether receipt is known.
- Contributions may be monetary, physical, digital, human, access-based, permission-based, time-based, or in-kind.
- A contribution artifact must not imply receipt, ownership, authority, consent, or unrestricted use unless those states are explicitly declared and bounded.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.resource.contribution.v1` specializes the inherited `Resource Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.resource.contribution.v1`.
- `Contributed Resource` specializes `Resource Identity`.
- `Contribution Statement`, `Contributor`, and `Target Need Or Purpose` specialize `Resource Role`.
- `Contribution Terms` and `Receipt Or Evidence Boundary` specialize `Resource Boundary`.
- `Contribution Status` specializes `Resource State`.
- `Interpretation Limits` preserves inherited resource limits and prevents implying receipt or unrestricted use by default.

### Resource Contribution Body

Required Shape

- first body heading after the continuity envelope
- `## Contribution Statement` section
- `## Contributor` section
- `## Contributed Resource` section
- `## Target Need Or Purpose` section
- `## Contribution Terms` section
- `## Contribution Status` section
- `## Receipt Or Evidence Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Provider Relation
- Recipient
- Conditions
- Restrictions
- Expiry
- Return Or Withdrawal
- Conflict Of Interest
- Evidence Basis
- Attestation Basis
- Consent Context
- Privacy Boundary
- Related Artifacts
- External Payloads
- References

Rules

- A contribution artifact should begin with a human-readable title.
- `Contribution Statement` must state what contribution is being preserved.
- `Contributor` must identify the contributor, provider, donor, role, organization, or bounded descriptor as safely as possible.
- `Contributed Resource` must identify the resource kind and relevant quantity, capability, or access being offered or provided.
- `Target Need Or Purpose` must state what need, task, plan, expedition, research, or bounded purpose the contribution targets.
- `Contribution Terms` must state conditions, restrictions, intended use, transfer boundary, or unknown terms.
- `Contribution Status` must state whether the contribution is offered, pledged, received, rejected, withdrawn, returned, expired, or unknown.
- `Receipt Or Evidence Boundary` must state what proof, evidence, attestation, transaction, payload, or uncertainty supports the status.
- `Interpretation Limits` must state what the contribution artifact does not prove.

### Contribution Statement

Required Fields

- Statement
- Contribution Type
- Contribution Status

Optional Fields

- Target Need
- Target Need Digest
- Statement Date
- Effective Date
- Expiry
- Recipient

Allowed Shapes

- `Contribution Type`: offer
- `Contribution Type`: pledge
- `Contribution Type`: donation
- `Contribution Type`: transfer
- `Contribution Type`: provision
- `Contribution Type`: loan
- `Contribution Type`: in-kind-support
- `Contribution Type`: access-grant
- `Contribution Type`: permission-grant
- `Contribution Type`: other
- `Contribution Status`: offered
- `Contribution Status`: pledged
- `Contribution Status`: received
- `Contribution Status`: rejected
- `Contribution Status`: withdrawn
- `Contribution Status`: returned
- `Contribution Status`: expired
- `Contribution Status`: unknown

Rules

- `Statement` should preserve the contribution claim in readable form.
- `Contribution Type` and `Contribution Status` must use the declared shapes.
- A pledge or offer is not receipt.
- Receipt should be supported through `Receipt Or Evidence Boundary`, `tiinex.resource.contribution.receipt.v1`, evidence artifacts, attestation artifacts, external payloads, transaction references, or other bounded proof surfaces when available.
- `Target Need Digest` may use a v2 self digest from a resource need artifact to reference the exact need snapshot without inventing a central sequence number.

### Contributor

Required Fields

- Contributor
- Contributor Role

Optional Fields

- Organization
- Contact Boundary
- Relation Artifact
- Privacy Boundary
- Conflict Of Interest
- Public Attribution

Rules

- `Contributor` should identify the contributor as specifically as the artifact can safely disclose.
- When identity cannot be safely disclosed, the artifact should preserve a bounded descriptor rather than inventing identity.
- Public attribution, anonymity, privacy, or contact boundaries should be explicit when known.
- Contributor identity, authority, or legal status should not be assumed from the contribution artifact alone.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource-contribution.trace.md`
- `<lineage>-<contribution-slug>.trace.md`

Rules

- Contribution artifacts should keep the lineage label first.
- The optional slug should identify the contributor, contributed resource, target need, or contribution state without exposing sensitive details unnecessarily.
- Contribution artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.resource.contribution.v1` when the main artifact value is an offered, pledged, donated, transferred, provided, loaned, or received resource.
- Do not use `tiinex.resource.contribution.v1` as a substitute for evidence when the main value is proof material.
- Do not use `tiinex.resource.contribution.v1` as a substitute for consent instruments, legal attestation, privacy boundary, financial instruments, receipts, or financial accounting when those claims require stronger companion artifacts.
- A contribution artifact can reference a resource need, but it does not by itself prove that the need was fully satisfied.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.contribution.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: In-kind hardware contribution pledge for a resource need.

---

# Workstation Contribution Pledge

## Contribution Statement

- Statement: one contributor pledged temporary access to a workstation for validation work
- Contribution Type: pledge
- Contribution Status: pledged
- Target Need Digest: example-self-digest-placeholder

## Contributor

- Contributor: bounded contributor descriptor
- Contributor Role: prospective in-kind hardware provider

## Contributed Resource

- Resource Kind: hardware
- Resource Capability: temporary workstation access

## Target Need Or Purpose

- Target Need Or Purpose: hardware resource need for validation and packaging work

## Contribution Terms

- Contribution Terms: temporary access only; no ownership transfer declared

## Contribution Status

- Contribution Status: pledged

## Receipt Or Evidence Boundary

- Receipt Or Evidence Boundary: no receipt evidence is preserved in this artifact

## Interpretation Limits

- Limits: this pledge does not prove receipt, ownership, unrestricted use, or legal authority.
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

- contribution is the provider-side or received-resource event, not the original need
- contribution status is central: offered, pledged, and received are different states
- a donor or provider may reference a need by durable trace locator and v2 self digest
- receipt proof should be preserved as evidence, attestation, external payload, or companion artifact when needed

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

- The current resource contribution create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource Contribution`.
- `summaryPrompt` should ask for the contribution title.
- `summaryPlaceholder` should guide the user toward the offered, pledged, provided, or received resource.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Contribution Statement` section
- `## Contributor` section
- `## Contributed Resource` section
- `## Target Need Or Purpose` section
- `## Contribution Terms` section
- `## Contribution Status` section
- `## Receipt Or Evidence Boundary` section
- `## Interpretation Limits` section

Rules

- Generated contribution artifacts should begin with the contribution title as the first body heading.
- `Contribution Statement` should state contribution type and status.
- `Contributor` should identify the contributor safely.
- `Contributed Resource` should identify what was offered, pledged, provided, or received.
- `Target Need Or Purpose` should state what the contribution targets.
- `Contribution Terms` should state conditions and restrictions.
- `Contribution Status` should state the known status.
- `Receipt Or Evidence Boundary` should state the proof or uncertainty boundary.
- `Interpretation Limits` should prevent overclaiming.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.resource.v1.schema.md](https://github.com/Tiinex/docs/blob/5fb5d130f93492a4e56df5d07397b9dcd5bb1a7c/.topics/.schemas/resource/tiinex.resource.v1.schema.md)
  - Value: rVh90WXAtIe-0j4guafiXLwLMosY09hHcrykdcRVcpk

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: s7OfkKOjgyjvcC89M5kQ2C6uW93qr1jQ3QXyZ22MJ7c