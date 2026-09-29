# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](../tiinex.discovery.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.v1.schema.md](../tiinex.discovery.v1.schema.md)
  - Origin:
    - [relative](../tiinex.discovery.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.monitoring.v1](tiinex.discovery.monitoring.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for recurring or continued observation of a field, system, process, source, or target over time with explicit purpose, cadence, boundaries, and review limits.

---

# Discovery Monitoring

- Status: maintained schema note

## Summary

This schema narrows discovery into monitoring: recurring or continued observation of a field, system, process, source, community, environment, dataset, or target over time.

Monitoring is neutral by itself. It may describe uptime checks, environmental observation, research observation, policy watch, issue tracking, community activity review, or other ongoing observation. It must still declare purpose, field, cadence, boundary, findings, and review or stop conditions.

When monitoring is high-impact, power-asymmetric, sensitive, person- or group-affecting, coercive, rights-affecting, or authority-backed, `tiinex.discovery.surveillance.v1` should own the stronger safeguards.

## Schema Validation Contract

### Monitoring Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.monitoring.v1`

Rules

- `tiinex.discovery.monitoring.v1` identifies artifacts centered on recurring or continued observation over time.
- A monitoring artifact should state monitoring purpose, field, cadence or trigger, observation boundary, review condition, and limits.
- Monitoring may apply to systems, processes, environments, repositories, issues, datasets, policies, communities, or other bounded targets.
- Monitoring must not hide high-impact surveillance behind neutral wording.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.discovery.monitoring.v1` specializes the inherited `Discovery Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.discovery.monitoring.v1`.
- `Monitoring Purpose` specializes `Discovery Intent`.
- `Monitoring Field` specializes `Discovery Field`.
- `Cadence Or Trigger` specializes `Discovery Method` for recurring or triggered observation.
- `Observation Boundary` specializes `Discovery Boundaries`.
- `Review Or Stop Condition` specializes the bounded continuation and outcome review part of `Discovery Outcome`.
- `Interpretation Limits` preserves the inherited uncertainty and overclaiming limits.

### Monitoring Body

Required Shape

- first body heading after the continuity envelope
- `## Monitoring Purpose` section
- `## Monitoring Field` section
- `## Cadence Or Trigger` section
- `## Observation Boundary` section
- `## Review Or Stop Condition` section
- `## Interpretation Limits` section

Optional Sections

- Findings
- Changes
- Absence
- Alert Boundary
- Privacy Boundary
- Consent Or Authority
- Retention
- Related Artifacts
- References

Rules

- A monitoring artifact should begin with a human-readable title.
- `Monitoring Purpose` must state why observation continues over time.
- `Monitoring Field` must state what is observed and what is out of scope.
- `Cadence Or Trigger` must state whether monitoring is manual, event-based, periodic, on-open, or otherwise bounded.
- `Observation Boundary` must state what signals may be noticed and what must not be collected, inferred, or used.
- `Review Or Stop Condition` must state when monitoring should pause, expire, stop, or be reauthorized.
- `Interpretation Limits` must state what monitoring does not prove.

### Monitoring Semantics

Allowed Shapes

- system monitoring
- process monitoring
- environmental monitoring
- research monitoring
- policy monitoring
- issue monitoring
- source monitoring
- community monitoring
- dataset monitoring
- risk monitoring

Rules

- Monitoring should be bounded by purpose and field rather than by open-ended curiosity.
- Monitoring findings should remain findings, signals, evidence candidates, or review inputs until another schema owns stronger interpretation.
- Monitoring should state freshness and retention expectations when they matter.
- If monitoring can affect people, groups, rights, access, treatment, reputation, safety, or legal standing, surveillance or privacy/consent/attestation companion artifacts may be required.

### High-Impact Boundary

Rules

- Use `tiinex.discovery.surveillance.v1` when monitoring involves high-impact observation, coercive or authority-backed power, sensitive categories, person or group effects, automated scoring, rights or access decisions, law-enforcement-like authority, workplace or student observation, research subjects, or other contexts requiring stronger safeguards.
- A monitoring artifact may point to surveillance as a required companion when the boundary is uncertain.
- Monitoring must not imply legal compliance, consent, or authority unless those claims are separately supported.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-monitoring.trace.md`
- `<lineage>-<monitoring-slug>.trace.md`

Rules

- Monitoring artifacts should keep the lineage label first.
- The optional slug should identify the monitored field, source, process, or purpose.
- Monitoring artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.discovery.monitoring.v1` when the main artifact value is recurring or continued observation over time.
- Do not use `tiinex.discovery.monitoring.v1` as a substitute for follow, research, expedition, evidence, decision, privacy, consent, or surveillance.
- Monitoring does not authorize broad collection, access, retention, automated decisions, or high-impact use by itself.

## Minimal Example

```md
# Public Issue Monitoring

## Monitoring Purpose

- Purpose: observe whether a public issue receives lineage-relevant updates.

## Monitoring Field

- Field: one public issue and its visible comments
- Out Of Scope: unrelated repository activity, private material, user activity outside the issue

## Cadence Or Trigger

- Cadence: manual refresh only

## Observation Boundary

- Signals: issue status, visible comments, directly linked targets
- Excluded: unrelated user history, broad repository crawl

## Review Or Stop Condition

- Stop: monitoring ends when the issue is closed or no longer lineage-relevant.

## Interpretation Limits

- Limits: monitoring does not prove acceptance, correctness, permission, or authority.
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

- Monitoring artifacts narrow discovery without replacing parent continuity or origin semantics
- Monitoring artifacts should remain human-readable and provenance-oriented rather than app-runtime configuration
- Monitoring artifacts may lead to evidence, signal, feedback, pointer, relation, task, decision, privacy, consent, or attestation artifacts when those schemas own the later role
- Monitoring artifacts must state what they do not prove or authorize

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
- targetPrompt
- targetPlaceholder
- boundaryPrompt
- boundaryPlaceholder

Rules

- The current monitoring create surface uses version `1`.
- `createTitle` should label the create action as `Create Monitoring`.
- `summaryPrompt` should ask for the monitoring title.
- `summaryPlaceholder` should guide the user toward the relevant discovery surface.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Monitoring Purpose` section
- `## Monitoring Field` section
- `## Cadence Or Trigger` section
- `## Observation Boundary` section
- `## Review Or Stop Condition` section
- `## Interpretation Limits` section

Rules

- Generated monitoring artifacts should begin with the title as the first body heading.
- `Monitoring Purpose` should be preserved in generated artifacts.
- `Monitoring Field` should be preserved in generated artifacts.
- `Cadence Or Trigger` should be preserved in generated artifacts.
- `Observation Boundary` should be preserved in generated artifacts.
- `Review Or Stop Condition` should be preserved in generated artifacts.
- `Interpretation Limits` should be preserved in generated artifacts.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.v1.schema.md](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Value: DOEm9XKixnIUzuGNZ06-NUbtKT-GNCJ2ktmfJnqgHvo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: OUdzjIHcRjRWzV8HXV4U_-buKgsVy_hnKwqgI6DbAw4