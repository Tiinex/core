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
  - Current Schema: [tiinex.resource.allocation.v1](tiinex.resource.allocation.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for assigning, reserving, releasing, or returning an available resource for a bounded purpose with use boundaries and accounting limits.

---

# Resource Allocation

- Status: maintained schema note

## Summary

This schema narrows `tiinex.resource.v1` for artifacts whose main job is to preserve allocation: assigning an available, received, or authorized resource to a bounded purpose, plan, task, discovery, expedition, research pass, runtime, or other use.

Allocation is not the same as need or contribution. A resource may be needed but not received; received but not allocated; allocated but not used; used but not recorded through a usage artifact, returned, or released.

## Schema Validation Contract

### Resource Allocation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.allocation.v1`

Rules

- `tiinex.resource.allocation.v1` identifies artifacts centered on assigning or reserving a resource for a bounded use.
- A resource allocation artifact should state the resource source, allocation target, use boundary, allocation state, and accounting or return boundary.
- Allocation artifacts may reference resource need, contribution, contribution receipt, task, discovery, expedition, runtime, privacy, consent instrument, financial instrument, or attestation artifacts as companions.
- An allocation artifact must not imply receipt, authority, ownership, or permission unless those claims are separately supported or explicitly bounded.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.resource.allocation.v1` specializes the inherited `Resource Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.resource.allocation.v1`.
- `Resource Source` specializes `Resource Identity`.
- `Allocation Statement` and `Allocation Target` specialize `Resource Role`.
- `Use Boundary` and `Accounting Or Return` specialize `Resource Boundary`.
- `Allocation State` specializes `Resource State`.
- `Interpretation Limits` preserves inherited resource limits and prevents implying actual usage by default.

### Resource Allocation Body

Required Shape

- first body heading after the continuity envelope
- `## Allocation Statement` section
- `## Resource Source` section
- `## Allocation Target` section
- `## Use Boundary` section
- `## Allocation State` section
- `## Accounting Or Return` section
- `## Interpretation Limits` section

Optional Sections

- Need Basis
- Contribution Basis
- Receipt Basis
- Quantity Or Share
- Time Window
- Access Boundary
- Privacy Boundary
- Consent Instrument Or Authority
- Remaining Resource
- Deallocation
- Evidence Basis
- Related Artifacts
- References

Rules

- An allocation artifact should begin with a human-readable title.
- `Allocation Statement` must state what resource is allocated or reserved.
- `Resource Source` must identify the source, contribution, receipt, inventory, or holder of the allocated resource as far as known.
- `Allocation Target` must identify the bounded purpose, task, discovery, expedition, research, runtime, project, or use receiving the allocation.
- `Use Boundary` must state permitted, prohibited, time-limited, quantity-limited, or unknown use limits.
- `Allocation State` must state whether the resource is reserved, allocated, partially allocated, used, released, returned, expired, blocked, or unknown.
- `Accounting Or Return` must state remaining amount, return condition, reporting boundary, or why accounting is unavailable.
- `Interpretation Limits` must state what the allocation artifact does not prove.

### Allocation Statement

Required Fields

- Statement
- Allocation Type
- Allocation State

Optional Fields

- Allocation Date
- Effective Window
- Quantity
- Unit
- Allocation Share
- Authorized By

Allowed Shapes

- `Allocation Type`: reservation
- `Allocation Type`: assignment
- `Allocation Type`: budget-allocation
- `Allocation Type`: access-allocation
- `Allocation Type`: personnel-allocation
- `Allocation Type`: equipment-allocation
- `Allocation Type`: time-allocation
- `Allocation Type`: other
- `Allocation State`: reserved
- `Allocation State`: allocated
- `Allocation State`: partially-allocated
- `Allocation State`: used
- `Allocation State`: released
- `Allocation State`: returned
- `Allocation State`: expired
- `Allocation State`: blocked
- `Allocation State`: unknown

Rules

- `Statement` should preserve the allocation in readable form.
- `Allocation Type` and `Allocation State` must use the declared shapes.
- Allocation should be scoped to a target use; vague statements that a resource exists should use resource or contribution schemas instead.
- Allocation state should not be inferred from contribution status alone.

### Use Boundary

Required Fields

- Permitted Use
- Prohibited Use
- Boundary Summary

Optional Fields

- Expiry
- Review Date
- Reporting Requirement
- Access Boundary
- Privacy Boundary
- Consent Instrument Or Authority
- Return Requirement
- Deallocation Condition

Rules

- `Permitted Use` must state the intended bounded use or explicitly say it is unknown.
- `Prohibited Use` must state known prohibited uses or explicitly say they are unknown.
- `Boundary Summary` must summarize the practical allocation boundary a later reader or tool should respect.
- Access, privacy, consent, authority, reporting, or return conditions should be explicit when they materially affect use.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource-allocation.trace.md`
- `<lineage>-<allocation-slug>.trace.md`

Rules

- Allocation artifacts should keep the lineage label first.
- The optional slug should identify the resource, source, target use, or allocation state.
- Allocation artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.resource.allocation.v1` when the main artifact value is assigning, reserving, releasing, or returning a resource for a bounded use.
- Use `tiinex.resource.allocation.usage.v1` when the main artifact value is observed, estimated, billed, corrected, or reported use of the allocated resource.
- Do not use `tiinex.resource.allocation.v1` as proof that the resource was originally received or legally available.
- Do not use `tiinex.resource.allocation.v1` as a substitute for accounting, evidence, attestation, consent instrument, privacy, usage, or legal compliance artifacts when those claims require companion support.
- Allocation artifacts should preserve limits so later readers can distinguish planned use, authorized use, actual usage records, and remaining resource state.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.allocation.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Allocation of contributed compute time to one validation pass.

---

# Compute Time Allocation

## Allocation Statement

- Statement: contributed compute time is allocated to one validation pass
- Allocation Type: time-allocation
- Allocation State: allocated

## Resource Source

- Resource Source: bounded contribution artifact reference

## Allocation Target

- Allocation Target: one schema validation and packaging pass

## Use Boundary

- Permitted Use: validation and packaging for the named pass
- Prohibited Use: unrelated workloads
- Boundary Summary: use is limited to the named validation pass

## Allocation State

- Allocation State: allocated

## Accounting Or Return

- Accounting Or Return: remaining compute time is unknown; no return condition declared

## Interpretation Limits

- Limits: this allocation does not prove original receipt, contributor authority, or actual execution.
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

- allocation usage is the descendant for actual drawdown, measured consumption, billing, or estimates
- allocation is a use assignment, not a need and not a contribution
- allocation should preserve practical boundaries so resources do not silently drift into unrelated use
- allocation can be useful for money, hardware, access, people, time, or materials without creating a finance-only schema

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

- The current resource allocation create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource Allocation`.
- `summaryPrompt` should ask for the allocation title.
- `summaryPlaceholder` should guide the user toward the resource and target use.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Allocation Statement` section
- `## Resource Source` section
- `## Allocation Target` section
- `## Use Boundary` section
- `## Allocation State` section
- `## Accounting Or Return` section
- `## Interpretation Limits` section

Rules

- Generated allocation artifacts should begin with the allocation title as the first body heading.
- `Allocation Statement` should state allocation type and state.
- `Resource Source` should identify where the allocated resource came from.
- `Allocation Target` should identify the target use.
- `Use Boundary` should state permitted and prohibited use.
- `Allocation State` should state the known allocation state.
- `Accounting Or Return` should preserve remaining, return, or accounting limits.
- `Interpretation Limits` should prevent overclaiming.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.resource.v1.schema.md](https://github.com/Tiinex/docs/blob/5fb5d130f93492a4e56df5d07397b9dcd5bb1a7c/.topics/.schemas/resource/tiinex.resource.v1.schema.md)
  - Value: rVh90WXAtIe-0j4guafiXLwLMosY09hHcrykdcRVcpk

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 5IovGhzwrmQpIP48EOswrdz2AmM55SfruK1FFIUqF88