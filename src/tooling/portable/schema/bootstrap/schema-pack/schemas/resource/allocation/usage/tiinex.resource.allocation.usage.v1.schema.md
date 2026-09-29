# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.resource.allocation.v1](../tiinex.resource.allocation.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.resource.allocation.v1.schema.md](../tiinex.resource.allocation.v1.schema.md)
  - Origin:
    - [relative](../tiinex.resource.allocation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/02392a68bb70f9b1656a77c6c65c272582d05ab1/.topics/.schemas/resource/allocation/tiinex.resource.allocation.v1.schema.md)
- Current
  - Current Schema: [tiinex.resource.allocation.usage.v1](tiinex.resource.allocation.usage.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for observed, estimated, billed, consumed, spent, or otherwise used allocated resources with meter, evidence, budget impact, and limits.

---

# Resource Allocation Usage

- Status: maintained schema note

## Summary

This schema narrows `tiinex.resource.allocation.v1` for artifacts whose main job is to preserve actual or reported use of an allocated, reserved, or available resource: what was consumed, spent, charged, used, reversed, corrected, or measured during a bounded activity.

Usage is an allocation descendant because it inherits allocation target, use boundary, resource source, remaining-resource, and accounting/return semantics. It adds measured, estimated, billed, observed, or corrected drawdown state.

Usage may be monetary, computational, material, token-based, time-based, staff-hour based, facility-based, or another resource drawdown. It complements `tiinex.resource.budget.v1` and `tiinex.resource.allocation.v1`: budgets define limits, allocations assign resources to a purpose, and usage records what was actually consumed or reported.

## Schema Validation Contract

### Resource Allocation Usage Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.allocation.usage.v1`

Rules

- `tiinex.resource.allocation.usage.v1` identifies allocation-derived artifacts centered on observed, estimated, billed, consumed, charged, spent, reversed, corrected, or reported resource use.
- A resource allocation usage artifact should state what was used, for what purpose, how it was measured or reported, what budget or allocation it affects, and what uncertainty remains.
- Resource allocation usage artifacts may record token usage, API cost, compute time, staff time, materials consumed, funds spent, storage used, or other bounded usage.
- A usage artifact must not claim receipt, authorization, accounting correctness, or legal compliance unless those claims are separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.resource.allocation.usage.v1` specializes the inherited `Resource Allocation Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.resource.allocation.usage.v1`.
- `Usage Statement` specializes `Allocation Statement` and actual drawdown state.
- `Resource Used` specializes `Resource Source`.
- `Usage Basis` specializes `Allocation Target`.
- `Meter Or Evidence` specializes evidence/accounting boundaries without proving accounting correctness by itself.
- `Budget Or Allocation Impact` specializes `Allocation State` and `Accounting Or Return`.
- `Interpretation Limits` preserves inherited allocation limits and adds measurement, estimate, and billing boundaries.

### Resource Allocation Usage Body

Required Shape

- first body heading after the continuity envelope
- `## Usage Statement` section
- `## Resource Used` section
- `## Usage Basis` section
- `## Meter Or Evidence` section
- `## Budget Or Allocation Impact` section
- `## Interpretation Limits` section

Optional Sections

- Runtime Context
- Billing Context
- Estimate Method
- Reversal Or Correction
- Related Budget
- Related Allocation
- Related Receipt
- Evidence Basis
- External Payloads
- References

Rules

- A resource allocation usage artifact should begin with a human-readable title.
- `Usage Statement` must state the usage event or reported usage in readable form.
- `Resource Used` must identify the resource kind, amount, unit, and time window when known.
- `Usage Basis` must state the activity, task, runtime, project, allocation, or need that caused or justified the usage.
- `Meter Or Evidence` must state how usage was measured, estimated, billed, observed, or reported.
- `Budget Or Allocation Impact` must state whether the usage affects a known budget, allocation, receipt, or remaining balance when known.
- `Interpretation Limits` must state uncertainty, estimation limits, billing gaps, or unsupported claims.

### Usage Statement

Required Fields

- Usage
- Usage Status

Optional Fields

- Used At
- Time Window
- Related Runtime
- Related Task
- Related Budget
- Related Allocation

Allowed Shapes

- `Usage Status`: observed
- `Usage Status`: estimated
- `Usage Status`: billed
- `Usage Status`: pending
- `Usage Status`: disputed
- `Usage Status`: corrected
- `Usage Status`: reversed
- `Usage Status`: unknown

Rules

- `Usage` should state the resource drawdown or reported usage.
- `Usage Status` must use one of the declared shapes.
- Estimated usage should preserve the estimate method or uncertainty.
- Billed usage should preserve billing source or evidence when available.

### Resource Used

Required Fields

- Resource Kind
- Amount
- Unit

Optional Fields

- Currency
- Token Count
- Compute Time
- Staff Time
- Material Quantity
- Measurement Window

Rules

- `Resource Kind` should identify the resource class being consumed, spent, or reported.
- `Amount` and `Unit` should state the reported measure and unit when known.
- Token counts, model calls, API costs, compute hours, staff hours, and monetary costs may be recorded as resource usage when the usage boundary is explicit.

### Meter Or Evidence

Required Fields

- Meter Or Source

Optional Fields

- Cost Estimate
- Billing Reference
- Evidence Artifact

Rules

- `Meter Or Source` should identify whether usage is measured by runtime logs, provider billing, estimate method, observation, invoice, manual report, or unknown source.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource-usage.trace.md`
- `<lineage>-allocation-usage.trace.md`
- `<lineage>-<usage-slug>.trace.md`

Rules

- Resource allocation usage artifacts should keep the lineage label first.
- The optional slug should identify the resource, activity, runtime, budget, or usage window.
- Resource allocation usage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.resource.allocation.usage.v1` when the main artifact value is observed, estimated, billed, corrected, or reported use of an allocated or budgeted resource.
- Do not use `tiinex.resource.allocation.usage.v1` as proof of budget approval, receipt, ownership, legal compliance, or accounting correctness.
- Do not use `tiinex.resource.allocation.usage.v1` as a substitute for runtime artifacts when the main value is execution state rather than resource drawdown.
- Usage artifacts may reference runtime, budget, allocation, receipt, evidence, attestation, external payload, or billing artifacts when those artifacts own companion semantics.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.allocation.usage.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Token usage for one bounded research pass.

---

# Research Pass Token Usage

## Usage Statement

- Usage: one research pass used an estimated 120000 tokens
- Usage Status: estimated
- Related Budget: research-pass-token-budget.trace.md
- Related Allocation: research-pass-token-allocation.trace.md

## Resource Used

- Resource Kind: token budget
- Amount: 120000
- Unit: tokens
- Time Window: one bounded research pass

## Usage Basis

- Usage Basis: bounded research pass over selected schema artifacts

## Meter Or Evidence

- Meter Or Source: runtime/provider estimate
- Cost Estimate: unknown

## Budget Or Allocation Impact

- Budget Or Allocation Impact: under the declared 200000 token budget if the estimate is accurate

## Interpretation Limits

- Interpretation Limits: this artifact records estimated token drawdown; it does not prove billing accuracy or runtime correctness
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

- usage is a child of allocation because it strengthens planned or reserved use into observed, estimated, billed, corrected, or reported drawdown
- usage complements budget by showing whether a run is within limit, near threshold, over limit, disputed, or unknown
- token limits, cost limits, API-call limits, compute hours, staff hours, materials, and money spent can all be modeled as resource usage when scoped and bounded

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

- The current resource allocation usage create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource Usage`.
- `summaryPrompt` should ask for the usage title.
- `summaryPlaceholder` should guide the user toward the used resource, activity, and usage window.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Usage Statement` section
- `## Resource Used` section
- `## Usage Basis` section
- `## Meter Or Evidence` section
- `## Budget Or Allocation Impact` section
- `## Interpretation Limits` section

Rules

- Generated usage artifacts should begin with the usage title as the first body heading.
- Generated usage artifacts should record bounded drawdown without claiming billing accuracy or accounting correctness by default.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.resource.allocation.v1.schema.md](https://github.com/Tiinex/docs/blob/02392a68bb70f9b1656a77c6c65c272582d05ab1/.topics/.schemas/resource/allocation/tiinex.resource.allocation.v1.schema.md)
  - Value: I3hcBDWe9EN2zLgKDdgiExuJH6nM7QDWeCHnZcaSm-k

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: TZCzX79HZUJPUFFwvYARAyRAngCiR8Jg61fcBwkby-w