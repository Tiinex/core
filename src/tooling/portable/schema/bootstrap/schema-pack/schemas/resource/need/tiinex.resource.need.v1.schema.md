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
  - Current Schema: [tiinex.resource.need.v1](tiinex.resource.need.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for needed, missing, insufficient, or blocking resources that constrain execution without implying entitlement or receipt.

---

# Resource Need

- Status: maintained schema note

## Summary

This schema narrows `tiinex.resource.v1` for artifacts whose main job is to preserve a bounded resource need: something required, missing, insufficient, expired, unavailable, unauthorized, or otherwise blocking execution.

A resource need may concern money, hardware, people, expertise, data, access, permission, time, materials, facilities, approvals, or other enablers. It should make the need legible without claiming that any party is obligated to satisfy it.

## Schema Validation Contract

### Resource Need Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.need.v1`

Rules

- `tiinex.resource.need.v1` identifies artifacts centered on a needed or missing resource and its execution impact.
- A resource need artifact should state what is needed, why it is needed, what work it enables, what is currently missing, and what limits apply.
- Resource need artifacts may support later contribution, receipt, allocation, task, decision, expedition, or funding artifacts, but do not replace them.
- A resource need artifact must not imply entitlement, procurement approval, obligation, or receipt.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.resource.need.v1` specializes the inherited `Resource Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.resource.need.v1`.
- `Required Resource` specializes `Resource Identity`.
- `Need Statement` and `Required For` specialize `Resource Role`.
- `Fulfillment Boundary` specializes `Resource Boundary`.
- `Constraint Impact` specializes the blocked, insufficient, or degraded portion of `Resource State`.
- `Interpretation Limits` preserves inherited resource limit semantics.

### Resource Need Body

Required Shape

- first body heading after the continuity envelope
- `## Need Statement` section
- `## Required Resource` section
- `## Required For` section
- `## Constraint Impact` section
- `## Fulfillment Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Current Alternatives
- Partial Fulfillment
- Priority
- Deadline Or Window
- Estimated Quantity
- Estimated Cost
- Non-Monetary Value
- Evidence Basis
- Related Plan
- Related Task
- Related Discovery
- Related Expedition
- Contribution Targets
- References

Rules

- A resource need artifact should begin with a human-readable title.
- `Need Statement` must state the need in readable form.
- `Required Resource` must identify the resource kind, quantity, quality, or capability required as specifically as useful.
- `Required For` must identify the plan, task, expedition, research, decision, or bounded work the need enables.
- `Constraint Impact` must state what is blocked, delayed, degraded, risky, or impossible while the need is unmet.
- `Fulfillment Boundary` must state what would satisfy, partially satisfy, or fail to satisfy the need.
- `Interpretation Limits` must state what the need artifact does not prove.

### Need Statement

Required Fields

- Need
- Need State

Optional Fields

- Priority
- Time Window
- Urgency Basis
- Alternative Path
- Known Gap

Allowed Shapes

- `Need State`: needed
- `Need State`: missing
- `Need State`: insufficient
- `Need State`: blocked
- `Need State`: partially satisfied
- `Need State`: expired
- `Need State`: unknown

Rules

- `Need` should state the resource requirement rather than only naming a desired outcome.
- `Need State` must use one of the declared shapes.
- Priority and urgency should be grounded in execution impact, safety, deadline, or opportunity context rather than unsupported pressure.

### Required Resource

Required Fields

- Resource Kind
- Required Capability

Optional Fields

- Quantity
- Unit
- Minimum Acceptable
- Preferred Form
- Excluded Forms
- Access Or Authority Required
- Privacy Boundary
- Consent Or Attestation Needed

Rules

- `Resource Kind` should use broad terms such as funds, hardware, software, compute, dataset, material, facility, transport, access, permission, time, personnel, expertise, organizational support, legal review, policy approval, or other.
- `Required Capability` should describe what the resource must make possible.
- Access, permission, consent, policy, or authority needs should be declared without pretending the need itself grants authority.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource-need.trace.md`
- `<lineage>-<need-slug>.trace.md`

Rules

- Resource need artifacts should keep the lineage label first.
- The optional slug should identify the needed resource or blocker.
- Resource need artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.resource.need.v1` when the main artifact value is the need or missing resource.
- Do not use `tiinex.resource.need.v1` as proof that a contribution was offered, pledged, received, or allocated.
- Do not use `tiinex.resource.need.v1` as a substitute for task, decision, consent, attestation, evidence, or privacy artifacts when those schemas own the main claim.
- A need may be referenced by contributors, donors, providers, reviewers, or later artifacts through a self digest or durable trace locator.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.need.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Resource need for a planned hardware-backed expedition.

---

# Hardware Resource Need

## Need Statement

- Need: access to one capable workstation for local model and artifact validation work
- Need State: missing

## Required Resource

- Resource Kind: hardware
- Required Capability: run local validation and packaging steps without relying on remote services

## Required For

- Required For: planned discovery expedition and validation pass

## Constraint Impact

- Constraint Impact: without the workstation, validation is slower and some local checks remain blocked.

## Fulfillment Boundary

- Fulfillment Boundary: one capable workstation or equivalent temporary compute access would partially satisfy the need.

## Interpretation Limits

- Limits: this need does not prove procurement approval, donor obligation, or receipt of hardware.
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

- resource need is the blocker or requirement, not the contribution
- a need can be referenced by a donor or provider using a trace path, permalink, or v2 self digest
- needs should declare fulfillment boundaries so contributors do not guess what satisfies the need

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

- The current resource need create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource Need`.
- `summaryPrompt` should ask for the need title.
- `summaryPlaceholder` should guide the user toward the missing or required resource.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Need Statement` section
- `## Required Resource` section
- `## Required For` section
- `## Constraint Impact` section
- `## Fulfillment Boundary` section
- `## Interpretation Limits` section

Rules

- Generated need artifacts should begin with the need title as the first body heading.
- `Need Statement` should state the resource need and state.
- `Required Resource` should identify the resource kind and capability.
- `Required For` should identify what the need enables.
- `Constraint Impact` should state what is blocked or degraded.
- `Fulfillment Boundary` should state what would satisfy or partially satisfy the need.
- `Interpretation Limits` should prevent overclaiming.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.resource.v1.schema.md](https://github.com/Tiinex/docs/blob/5fb5d130f93492a4e56df5d07397b9dcd5bb1a7c/.topics/.schemas/resource/tiinex.resource.v1.schema.md)
  - Value: rVh90WXAtIe-0j4guafiXLwLMosY09hHcrykdcRVcpk

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: YqO_WF2FzgK038cyJGfd4ue-i740zgyw9Rp4Rvp7OVY