# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.resource.contribution.v1](../tiinex.resource.contribution.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.resource.contribution.v1.schema.md](../tiinex.resource.contribution.v1.schema.md)
  - Origin:
    - [relative](../tiinex.resource.contribution.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/resource/contribution/tiinex.resource.contribution.v1.schema.md)
- Current
  - Current Schema: [tiinex.resource.contribution.receipt.v1](tiinex.resource.contribution.receipt.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for received-resource contribution records with source, recipient, receipt basis, restrictions, and interpretation limits.

---

# Resource Contribution Receipt

- Status: maintained schema note

## Summary

This schema narrows `tiinex.resource.contribution.v1` for artifacts whose main job is to preserve that a contributed resource was received, partially received, returned, reversed, disputed, or is pending confirmation.

A receipt is a contribution descendant because it inherits contributor, target need, contributed resource, terms, restrictions, and contribution status semantics. It adds stronger receipt-specific state: arrival, custody, confirmed availability, receipt basis, return, reversal, and dispute boundaries.

A receipt is stronger than an offer or pledge because it concerns arrival or confirmed availability. It still does not prove legal ownership, accounting correctness, tax treatment, identity, or compliance by itself.

## Schema Validation Contract

### Resource Contribution Receipt Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.contribution.receipt.v1`

Rules

- `tiinex.resource.contribution.receipt.v1` identifies contribution-derived artifacts centered on received or receipt-pending contributed resources.
- A resource contribution receipt artifact should state what was received, from whom or what source, by whom or what recipient, what contribution or need it relates to, what receipt basis exists, and what restrictions apply.
- Resource contribution receipt artifacts may record funds, hardware, software licenses, compute credits, datasets, materials, facilities, access, permission, time, personnel, expertise, or other resources.
- A receipt artifact must not imply ownership, tax treatment, legal compliance, identity verification, consent, or unrestricted use unless those claims are separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.resource.contribution.receipt.v1` specializes the inherited `Resource Contribution Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.resource.contribution.receipt.v1`.
- `Receipt Statement` specializes `Contribution Statement` and received-state semantics.
- `Received Resource` specializes `Contributed Resource`.
- `Source And Recipient` specializes `Contributor` and target-recipient context.
- `Receipt Basis` and `Restrictions Or Conditions` specialize `Contribution Terms` and `Receipt Or Evidence Boundary`.
- Receipt status specializes `Contribution Status` without turning ordinary contribution artifacts into receipts.
- `Interpretation Limits` preserves inherited contribution limits and adds receipt-specific boundaries.

### Resource Contribution Receipt Body

Required Shape

- first body heading after the continuity envelope
- `## Receipt Statement` section
- `## Received Resource` section
- `## Source And Recipient` section
- `## Receipt Basis` section
- `## Restrictions Or Conditions` section
- `## Interpretation Limits` section

Optional Sections

- Target Need
- Contribution Link
- Financial Instrument
- Allocation Links
- Evidence Basis
- Attestation Basis
- External Payloads
- Privacy Boundary
- Return Or Reversal
- References

Rules

- A resource contribution receipt artifact should begin with a human-readable title.
- `Receipt Statement` must state the receipt state in readable form.
- `Received Resource` must identify the resource kind, amount, unit, form, and relevant identifiers when known.
- `Source And Recipient` must state the source/provider and recipient/holder as specifically as safely possible.
- `Receipt Basis` must state the evidence, attestation, provider report, transaction reference, delivery record, or other basis for the receipt claim.
- `Restrictions Or Conditions` must state known use limits, return obligations, earmarks, expiry, access limits, or unknown restrictions.
- `Interpretation Limits` must state what the receipt artifact does not prove.

### Receipt Statement

Required Fields

- Receipt
- Receipt Status

Optional Fields

- Received At
- Confirmed At
- Target Need
- Related Contribution
- Related Instrument

Allowed Shapes

- `Receipt Status`: received
- `Receipt Status`: partially received
- `Receipt Status`: pending-confirmation
- `Receipt Status`: disputed
- `Receipt Status`: returned
- `Receipt Status`: reversed
- `Receipt Status`: unknown

Rules

- `Receipt` should state the resource arrival, transfer, or confirmed availability.
- `Receipt Status` must use one of the declared shapes.
- Pending or disputed receipts should preserve what remains unconfirmed.
- Returned or reversed receipts should point to return, correction, or evidence artifacts when available.

### Received Resource

Required Fields

- Resource Kind
- Received Amount
- Unit

Optional Fields

- Resource Form
- Currency

Rules

- `Resource Kind` should use broad resource terms such as funds, hardware, software, compute credits, dataset, material, facility, access, permission, time, personnel, expertise, or other.

### Receipt Basis

Required Fields

- Receipt Basis

Optional Fields

- Transaction Reference
- Delivery Reference
- Custody Boundary
- Evidence Artifact
- Attestation Artifact
- External Payload

Rules

- `Receipt Basis` should identify the strongest available receipt support without overstating it.
- A transaction reference, delivery note, screenshot, bank record descriptor, invoice, platform report, or provider statement may support receipt but does not by itself prove lawful ownership, permission, or accounting correctness.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource-receipt.trace.md`
- `<lineage>-contribution-receipt.trace.md`
- `<lineage>-<receipt-slug>.trace.md`

Rules

- Resource contribution receipt artifacts should keep the lineage label first.
- The optional slug should identify the received resource, provider, or receipt event.
- Resource contribution receipt artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.resource.contribution.receipt.v1` when the main artifact value is received, partially received, returned, reversed, or receipt-pending contribution state.
- Do not use `tiinex.resource.contribution.receipt.v1` as a substitute for contribution when the main artifact value is an offer or pledge rather than receipt.
- Do not use `tiinex.resource.contribution.receipt.v1` as a substitute for accounting ledgers, legal contracts, tax records, ownership records, consent records, or evidence bundles.
- Receipt artifacts may reference contribution, financial instrument, evidence, attestation, payload, privacy, budget, allocation, or usage artifacts when those artifacts own companion semantics.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.contribution.receipt.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Receipt record for a hardware contribution.

---

# Workstation Contribution Receipt

## Receipt Statement

- Receipt: temporary access to one workstation was confirmed for validation work
- Receipt Status: received
- Related Contribution: workstation-contribution.trace.md

## Received Resource

- Resource Kind: hardware
- Received Amount: one
- Unit: workstation access
- Resource Form: temporary access

## Source And Recipient

- Source: bounded contributor descriptor
- Recipient: project maintainer descriptor

## Receipt Basis

- Receipt Basis: contributor confirmation message and successful access check

## Restrictions Or Conditions

- Restrictions Or Conditions: temporary access only; no ownership transfer declared

## Interpretation Limits

- Interpretation Limits: this receipt records access availability; it does not prove ownership, tax treatment, or accounting correctness
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

- receipt is a child of contribution because it strengthens a contribution from offered or pledged into received, partially received, returned, reversed, disputed, or pending-confirmation state
- receipt does not replace evidence, attestation, accounting, legal, tax, or ownership records
- receipt artifacts can use v2 self digests so donors, issues, comments, and allocations can refer to the exact received-resource snapshot

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

- The current resource contribution receipt create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource Receipt`.
- `summaryPrompt` should ask for the receipt title.
- `summaryPlaceholder` should guide the user toward the received resource and source.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Receipt Statement` section
- `## Received Resource` section
- `## Source And Recipient` section
- `## Receipt Basis` section
- `## Restrictions Or Conditions` section
- `## Interpretation Limits` section

Rules

- Generated receipt artifacts should begin with the receipt title as the first body heading.
- Generated receipt artifacts should preserve receipt state without implying ownership, accounting correctness, or legal compliance.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.resource.contribution.v1.schema.md](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/resource/contribution/tiinex.resource.contribution.v1.schema.md)
  - Value: 1q6zZVJo7wZ0sihP7nvD2Pq_WtEGou868WS8X-2wxAY

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: _EGAJgI5NXdjAnyr-FVkEmA27n59CALIbIVOaYWsFZs