# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.resource.v1](tiinex.resource.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for resource-enablement artifacts that preserve needed, available, contributed, received, allocated, blocked, or bounded resources without making money the base concept.

---

# Resource

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to preserve resource-enablement context: what is needed, available, promised, received, allocated, blocked, returned, or no longer available for a plan, task, discovery, expedition, research pass, project, or other bounded work.

A resource is not only money. It may be funds, hardware, software, compute, data, materials, facilities, transport, access, permission, time, personnel, expertise, organizational support, legal review, policy approval, or another bounded enabler.

Resource artifacts exist so plans do not hide the practical reason work can or cannot proceed, and so later readers can trace need, contribution, receipt, allocation, and use without turning every resource into finance.

## Schema Validation Contract

### Resource Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.v1`

Rules

- `tiinex.resource.v1` identifies artifacts centered on a bounded resource or resource-enablement state.
- A resource artifact should state what resource is involved, what role it plays, who or what it relates to, what boundary applies, and what state is known.
- Resource artifacts may describe financial, physical, digital, human, permission, access, time, facility, or support resources without making money the base concept.
- Resource artifacts must not claim receipt, ownership, consent, legal authority, identity, or compliance unless those claims are separately supported or explicitly bounded.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Resource Body

Required Shape

- first body heading after the continuity envelope
- `## Resource Identity` section
- `## Resource Role` section
- `## Resource Boundary` section
- `## Resource State` section
- `## Interpretation Limits` section

Optional Sections

- Required For
- Provider Or Holder
- Recipient Or Beneficiary
- Need Basis
- Contribution Basis
- Receipt Basis
- Allocation Basis
- Access Or Permission Basis
- Evidence Basis
- Attestation Basis
- Consent Instrument
- Privacy Boundary
- Related Artifacts
- External Payloads
- References

Rules

- A resource artifact should begin with a human-readable title.
- `Resource Identity` must identify the resource or resource class.
- `Resource Role` must state whether the artifact concerns need, availability, contribution, receipt, allocation, access, blocker, return, or another bounded resource role.
- `Resource Boundary` must state limits on use, transfer, access, ownership, sharing, expiry, or authority when known.
- `Resource State` must state whether the resource is needed, missing, available, pledged, received, allocated, used, returned, expired, blocked, or unknown.
- `Interpretation Limits` must state what the artifact does not prove.

### Resource Identity

Required Fields

- Resource Label
- Resource Kind

Optional Fields

- Resource Quantity
- Unit
- Resource Quality
- Resource Source
- Resource Holder
- Resource Format
- Target Need
- Related Task
- Related Discovery
- Related Expedition

Rules

- `Resource Label` should be stable enough for later artifacts to reference.
- `Resource Kind` should state the broad class, such as funds, hardware, software, compute, dataset, material, facility, transport, access, permission, time, personnel, expertise, organizational support, legal review, policy approval, or other.
- Quantity, unit, quality, format, and source should be present when they materially affect whether the resource can satisfy a need.
- Money may be represented as a resource kind, but resource schemas should not become finance-specific unless a later finance descendant is explicitly created.

### Resource Role And State

Allowed Shapes

- need
- availability
- offer
- pledge
- contribution
- receipt
- allocation
- use
- return
- blocker
- access
- permission
- withdrawal
- expiry
- unknown

Rules

- `Resource Role` should use a readable role that distinguishes required, offered, received, allocated, used, returned, missing, or blocked resources.
- `Resource State` should not infer availability, receipt, authority, or ownership from a plan alone.
- A promised resource is not a received resource unless receipt is explicitly stated and bounded.
- A received resource is not necessarily allocated to a particular use unless allocation is explicitly stated.
- Permission or access resources should reference consent, attestation, policy, legal, or authority artifacts when those semantics matter.

### Resource Family Boundary

Rules

- Use `tiinex.resource.v1` when the main artifact value is broad resource-enablement context.
- Use `tiinex.resource.need.v1` when the main artifact value is a needed or missing resource and its execution impact.
- Use `tiinex.resource.budget.v1` when the main artifact value is a resource budget, quota, cap, limit, reserve, or runway boundary.
- Use `tiinex.resource.allocation.usage.v1` when the main artifact value is observed, estimated, billed, corrected, or reported use of an allocated or budgeted resource.
- Use `tiinex.resource.contribution.receipt.v1` when the main artifact value is received, partially received, returned, reversed, or receipt-pending contribution state.
- Use `tiinex.instrument.financial.v1` when the main artifact value is the finance-shaped instrument governing a resource flow.
- Use `tiinex.resource.contribution.v1` when the main artifact value is an offered, pledged, donated, transferred, or received contribution.
- Use `tiinex.resource.allocation.v1` when the main artifact value is assigning an available or received resource to a bounded use.
- Resource artifacts may reference task, discovery, expedition, evidence, relation, attestation, instrument, consent instrument, external payload, privacy boundary, or validation artifacts when those artifacts own companion semantics.
- Resource artifacts must not replace evidence when the main value is proof material, relation when the main value is a typed relationship, or attestation when the main value is a scoped human or organizational statement.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource.trace.md`
- `<lineage>-<resource-slug>.trace.md`

Rules

- Resource artifacts should keep the lineage label first.
- The optional slug should identify the resource, need, contribution, allocation, or blocker.
- Resource artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Resource artifacts preserve enablement context; they do not prove truth, ownership, receipt, authority, compliance, or permission by themselves.
- A resource need should not be read as a claim that someone is obligated to satisfy it.
- A resource contribution should not be read as received unless its state says received and its limits preserve receipt uncertainty.
- Resource artifacts should make conflicts of interest, conditions, restrictions, and expiry explicit when known.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Resource context for a blocked expedition plan.

---

# Expedition Compute Resource Context

## Resource Identity

- Resource Label: dedicated analysis workstation
- Resource Kind: hardware
- Resource Quantity: one capable workstation

## Resource Role

- Resource Role: blocker
- Required For: planned expedition analysis pass

## Resource Boundary

- Resource Boundary: no hardware is currently available for the planned workload.

## Resource State

- Resource State: missing

## Interpretation Limits

- Limits: this artifact records an enablement gap; it does not prove cost, procurement approval, or entitlement to receive hardware.
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

- resource is an enablement primitive, not a finance-only primitive
- resource need, budget, contribution, contribution receipt, allocation, allocation usage, and instrument semantics are different states and should not be collapsed
- resource artifacts can make practical blockers visible without converting them into tasks or decisions
- self digests are useful for donor, issue, comment, runtime, budget, contribution receipt, and allocation usage references because they identify a resource snapshot without inventing a central sequence number

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

- The current resource create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource`.
- `summaryPrompt` should ask for the resource title.
- `summaryPlaceholder` should guide the user toward the needed, available, provided, or allocated resource.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Resource Identity` section
- `## Resource Role` section
- `## Resource Boundary` section
- `## Resource State` section
- `## Interpretation Limits` section

Rules

- Generated resource artifacts should begin with the resource title as the first body heading.
- `Resource Identity` should identify the resource or resource class.
- `Resource Role` should state the role the resource plays.
- `Resource Boundary` should state limits on use, access, transfer, ownership, or authority.
- `Resource State` should state the known resource state.
- `Interpretation Limits` should prevent overclaiming what the resource artifact proves.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/e739f7876950c3bdf08066886103690bddc7b706/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: nmuTPcE6xYXz6d6Cwca8MdbbGI1BZnt3PXCQdl_YGdM