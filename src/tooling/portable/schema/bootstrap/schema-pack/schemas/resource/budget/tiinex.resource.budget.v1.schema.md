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
  - Current Schema: [tiinex.resource.budget.v1](tiinex.resource.budget.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for bounded resource budgets, quotas, limits, caps, reserves, and runway controls that constrain planned or automated use without proving receipt or accounting correctness.

---

# Resource Budget

- Status: maintained schema note

## Summary

This schema narrows `tiinex.resource.v1` for artifacts whose main job is to preserve a bounded resource budget, quota, cap, reserve, runway, allowance, or operating limit.

A budget is not only money. It may bound tokens, API calls, compute time, storage, staff time, legal hours, laboratory runs, energy, materials, hardware access, or another measured resource. Monetary budgets are allowed, but money is not the base concept.

Resource budgets exist so plans, runtimes, agents, teams, and external contributors can see what is allowed, capped, reserved, or review-gated before resources are consumed.

## Schema Validation Contract

### Resource Budget Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.resource.budget.v1`

Rules

- `tiinex.resource.budget.v1` identifies artifacts centered on a bounded resource envelope or limit.
- A resource budget artifact should state what resource is bounded, what unit applies, what limit or allowance applies, what uses are authorized, and what review boundary applies.
- Resource budget artifacts may represent monetary limits, token limits, compute quotas, staff-hour budgets, procurement envelopes, or other resource caps without becoming finance-only records.
- A budget artifact must not imply that funds, resources, or authority have been received unless receipt or authority is separately supported.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.resource.budget.v1` specializes the inherited `Resource Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.resource.budget.v1`.
- `Budgeted Resource` specializes `Resource Identity`.
- `Budget Statement` and `Authorized Use` specialize `Resource Role`.
- `Limit Policy` and `Review Boundary` specialize `Resource Boundary`.
- Budget status specializes `Resource State`.
- `Interpretation Limits` preserves inherited resource limits and prevents treating budgets as actual usage, receipt, or accounting correctness.

### Resource Budget Body

Required Shape

- first body heading after the continuity envelope
- `## Budget Statement` section
- `## Budgeted Resource` section
- `## Limit Policy` section
- `## Authorized Use` section
- `## Review Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Source Or Authority
- Target Need
- Allocation Links
- Allocation Usage Links
- Runtime Enforcement
- Alert Thresholds
- Renewal Or Expiry
- Evidence Basis
- Attestation Basis
- Financial Instrument
- References

Rules

- A resource budget artifact should begin with a human-readable title.
- `Budget Statement` must state the budget, quota, cap, reserve, or allowance in readable form.
- `Budgeted Resource` must identify the resource kind, quantity, unit, time window, and target scope when known.
- `Limit Policy` must state whether the limit is hard, soft, alert-only, approval-gated, reserved, or unknown.
- `Authorized Use` must state what the budget may be used for and what is outside scope.
- `Review Boundary` must state when review, renewal, approval, alert, or stop conditions apply.
- `Interpretation Limits` must state what the budget artifact does not prove.

### Budget Statement

Required Fields

- Budget Purpose
- Budget Status

Optional Fields

- Budget Owner
- Budget Source
- Target Need
- Related Runtime
- Effective Window

Allowed Shapes

- `Budget Status`: proposed
- `Budget Status`: approved
- `Budget Status`: active
- `Budget Status`: exhausted
- `Budget Status`: suspended
- `Budget Status`: expired
- `Budget Status`: unknown

Rules

- `Budget Purpose` should state why the limit exists.
- `Budget Status` must use one of the declared shapes.
- Approval or active status should not be inferred from a plan unless the authority or attestation basis is stated.

### Budgeted Resource

Required Fields

- Resource Kind
- Limit Amount
- Unit

Optional Fields

- Time Window

Rules

- `Resource Kind` should use broad resource terms such as funds, tokens, API calls, compute, storage, personnel time, legal review, lab time, hardware access, or other.
- `Limit Amount` and `Unit` should be specific enough that usage can later be compared to the budget.

### Limit Policy

Required Fields

- Limit Policy

Optional Fields

- Alert Threshold
- Stop Threshold
- Renewal Rule
- Approval Required Above
- Hard Stop Behavior
- Soft Limit Behavior
- Runtime Enforcement

Allowed Shapes

- `Limit Policy`: hard-cap
- `Limit Policy`: soft-cap
- `Limit Policy`: alert-only
- `Limit Policy`: approval-required
- `Limit Policy`: reserve
- `Limit Policy`: runway
- `Limit Policy`: unknown

Rules

- `hard-cap` means ordinary tooling should stop or refuse use when the cap is reached.
- `soft-cap` means ordinary tooling should warn or require review when the cap is reached.
- `alert-only` means the budget is informational unless another artifact defines enforcement.
- Runtime enforcement should not be assumed unless the artifact says how enforcement is expected to happen.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-resource-budget.trace.md`
- `<lineage>-<budget-slug>.trace.md`

Rules

- Resource budget artifacts should keep the lineage label first.
- The optional slug should identify the bounded resource, runtime, project, or budget window.
- Resource budget artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.resource.budget.v1` when the main artifact value is a resource budget, quota, cap, limit, reserve, or runway boundary.
- Do not use `tiinex.resource.budget.v1` as proof that a resource was contributed, received, spent, or legally authorized.
- Do not use `tiinex.resource.budget.v1` as a substitute for contribution receipt, allocation usage, allocation, financial instrument, evidence, attestation, or decision artifacts when those schemas own the main claim.
- A runtime token or cost limit may be represented as a resource budget when the unit and enforcement boundary are explicit.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.resource.budget.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Token budget for one bounded AI runtime pass.

---

# Runtime Token Budget

## Budget Statement

- Budget Purpose: prevent one AI runtime pass from consuming unbounded tokens
- Budget Status: active

## Budgeted Resource

- Resource Kind: tokens
- Limit Amount: 200000
- Unit: input and output tokens combined
- Time Window: one runtime pass

## Limit Policy

- Limit Policy: hard-cap
- Alert Threshold: 150000 tokens
- Stop Threshold: 200000 tokens

## Authorized Use

- Authorized Use: schema review and bounded generation for one requested package
- Prohibited Use: open-ended background crawling or unrelated generation

## Review Boundary

- Review Boundary: if the alert threshold is reached, pause and ask for review before continuing.

## Interpretation Limits

- Limits: this budget records a token limit; it does not prove actual usage, model billing, or provider-side enforcement.
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

- this schema is a resource-family specialization, not a replacement for accounting, legal, tax, or securities records
- monetary resources are allowed when money is the resource being bounded, but the schema role remains provenance and enablement
- companion evidence, attestation, consent, privacy, payload, relation, or legal artifacts should carry claims this schema does not own
- v2 self digests may identify exact resource snapshots for issue, comment, runtime, contributor, or external validation references without inventing a central sequence number

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

- The current create surface uses version `1`.
- `createTitle` should label the create action as `Create Resource Budget`.
- `summaryPrompt` should ask for the artifact title.
- `summaryPlaceholder` should guide the user toward the resource limit, quota, cap, or runtime budget being preserved.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Budget Statement` section
- `## Budgeted Resource` section
- `## Limit Policy` section
- `## Authorized Use` section
- `## Review Boundary` section
- `## Interpretation Limits` section

Rules

- Generated artifacts should begin with the title as the first body heading.
- `Budget Statement` should be present in generated artifacts.
- `Budgeted Resource` should be present in generated artifacts.
- `Limit Policy` should be present in generated artifacts.
- `Authorized Use` should be present in generated artifacts.
- `Review Boundary` should be present in generated artifacts.
- `Interpretation Limits` should be present in generated artifacts.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.resource.v1.schema.md](https://github.com/Tiinex/docs/blob/5fb5d130f93492a4e56df5d07397b9dcd5bb1a7c/.topics/.schemas/resource/tiinex.resource.v1.schema.md)
  - Value: rVh90WXAtIe-0j4guafiXLwLMosY09hHcrykdcRVcpk

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: gu49yv_bPNv6CvELTg2Z378nN1wsAu0QmrBotm2CI08