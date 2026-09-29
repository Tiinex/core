# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.monitoring.v1](../monitoring/tiinex.discovery.monitoring.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.monitoring.v1.schema.md](../monitoring/tiinex.discovery.monitoring.v1.schema.md)
  - Origin:
    - [relative](../monitoring/tiinex.discovery.monitoring.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/discovery/monitoring/tiinex.discovery.monitoring.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.surveillance.v1](tiinex.discovery.surveillance.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for high-impact monitoring artifacts that make authority, necessity, proportionality, minimization, oversight, retention, correction, and stop conditions explicit.

---

# Discovery Surveillance

- Status: maintained schema note

## Summary

This schema narrows monitoring into surveillance: high-impact observation that may involve authority, power asymmetry, sensitive subjects, person or group effects, rights or access consequences, automated scoring, coercive contexts, or other conditions that require stronger accountability.

Surveillance artifacts are intended to create safety and reviewability, not to provide an operational manual for intrusive observation. They should make sensitive monitoring visible, bounded, justified, minimized, reviewable, correctable, and stoppable.

Surveillance may be relevant to public authorities, research, workplaces, schools, platforms, safety operations, compliance, insurance, risk review, or other domains. The schema does not claim legal compliance by itself; legal, policy, consent, attestation, privacy, or evidence artifacts may be required companions.

## Schema Validation Contract

### Surveillance Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.surveillance.v1`

Rules

- `tiinex.discovery.surveillance.v1` identifies artifacts centered on high-impact monitoring that requires explicit authority, boundary, minimization, review, and stop conditions.
- A surveillance artifact should state surveillance purpose, authority basis, affected subjects, surveillance field, collection boundary, minimization, review, retention, correction, and limits.
- Surveillance artifacts must not describe high-impact monitoring as ordinary follow or neutral monitoring when stronger safeguards are required.
- Surveillance artifacts must not claim legal compliance, consent, authority, truth, or decision validity unless those claims are separately supported by appropriate artifacts.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.discovery.surveillance.v1` specializes the inherited `Monitoring Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.discovery.surveillance.v1`.
- `Surveillance Purpose` specializes `Monitoring Purpose`.
- `Surveillance Field`, `Affected Subjects`, and `Collection Boundary` specialize `Monitoring Field` and `Observation Boundary`.
- `Authority Or Permission Basis`, `Minimization And Proportionality`, and `Review And Oversight` add high-impact safeguards required for surveillance-shaped monitoring.
- `Retention And Stop Condition` specializes `Review Or Stop Condition`.
- `Interpretation Limits` preserves inherited monitoring limits and adds safeguards against automated or unsupported decisions.

### Surveillance Body

Required Shape

- first body heading after the continuity envelope
- `## Surveillance Purpose` section
- `## Authority Or Permission Basis` section
- `## Affected Subjects` section
- `## Surveillance Field` section
- `## Collection Boundary` section
- `## Minimization And Proportionality` section
- `## Review And Oversight` section
- `## Retention And Stop Condition` section
- `## Interpretation Limits` section

Optional Sections

- Consent Context
- Privacy Boundary
- Attestation Basis
- Legal Or Policy Context
- Redress Or Correction
- Human Review
- Prohibited Uses
- Findings
- Risk Boundary
- Related Artifacts
- References

Rules

- A surveillance artifact should begin with a human-readable title.
- `Surveillance Purpose` must state why high-impact observation is proposed, active, reviewed, or recorded.
- `Authority Or Permission Basis` must state the claimed mandate, consent, permission, policy, legal basis, research approval, role authority, or explicitly state that the basis is unknown or missing.
- `Affected Subjects` must identify who or what may be affected as specifically as the artifact can safely disclose.
- `Surveillance Field` must state what field, target, process, source, system, place, dataset, or group is in scope and out of scope.
- `Collection Boundary` must state what may be observed or collected and what must not be collected.
- `Minimization And Proportionality` must state why the scope is limited and why less invasive alternatives are insufficient, unknown, or not yet assessed.
- `Review And Oversight` must state who reviews the surveillance, how findings are checked, and what human or organizational oversight exists or is missing.
- `Retention And Stop Condition` must state retention limits, expiry, reauthorization, stopping conditions, or that they are unknown.
- `Interpretation Limits` must state what surveillance findings do not prove and what decisions must not be automated from them without further review.

### Surveillance Triggers

Allowed Shapes

- authority-backed monitoring
- person-affecting monitoring
- group-affecting monitoring
- sensitive-category observation
- rights-or-access-affecting observation
- workplace monitoring
- student monitoring
- research-subject monitoring
- biometric or location-sensitive observation
- platform moderation monitoring
- security or safety surveillance
- automated scoring surveillance
- legal or compliance surveillance
- other high-impact monitoring

Rules

- A surveillance artifact should be used when observation may affect rights, access, treatment, safety, reputation, freedom, opportunities, legal standing, or group vulnerability.
- Surveillance may be required even when the source is public if the observation is systematic, power-asymmetric, or used for high-impact decisions.
- The artifact should preserve uncertainty rather than invent lawful authority, consent, proportionality, or safety.
- Safeguard fields should make the surveillance safer to audit, not easier to expand.
- When subjects can be affected, redress, correction, human review, or appeal paths should be explicit when known.
- `unknown` or missing safeguard information should be preserved as a risk, not treated as permission.
- Surveillance artifacts may reference privacy boundary, consent, attestation, evidence, relation, external payload, validation method, or legal/policy artifacts when those artifacts define the authority or boundary.

### Authority Or Permission Basis

Required Fields

- Basis

Optional Fields

- Status

Rules

- `Basis` must state the claimed mandate, consent, permission, policy, legal basis, research approval, role authority, or explicitly state that the basis is unknown or missing.
- Missing or unknown authority must remain visible and must not be treated as permission.

### Collection Boundary

Required Fields

- May Observe
- Must Not Collect

Optional Fields

- Sensitive Categories

Rules

- `May Observe` and `Must Not Collect` must keep the collection boundary explicit and bounded.

### Minimization And Proportionality

Required Fields

- Minimization
- Proportionality

Rules

- `Minimization` must state how observation is limited.
- `Proportionality` must state why the scope is proportionate, unknown, or still requires review.

### Review And Oversight

Required Fields

- Oversight

Optional Fields

- Audit Path

Rules

- `Oversight` must state what human or organizational review is required or missing.
- Surveillance findings must not become final decisions by themselves.

### Retention And Stop Condition

Required Fields

- Retention
- Stop Condition

Rules

- `Retention` must state a retention boundary or explicit unknown.
- `Stop Condition` must state when surveillance should stop, expire, or require redesign/reauthorization.

### Redress Or Correction

Required Fields

- Redress Or Correction

Optional Fields

- Appeal Path

Rules

- When this optional block is present, it must state the available redress/correction path or explicit unknown.

### Human Review

Required Fields

- Human Review

Rules

- When this optional block is present, it must state the human-review boundary rather than imply automated decision authority.

### Prohibited Uses

Required Fields

- Prohibited Uses

Rules

- When this optional block is present, it must state uses that are outside the surveillance authority or safety boundary.

### Risk Boundary

Required Fields

- Harm Risks

Optional Fields

- False Positive Risks
- Chilling Effect Risk

Rules

- Risk fields must preserve known harms and uncertainty rather than treating missing safeguard information as permission.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-surveillance.trace.md`
- `<lineage>-<surveillance-slug>.trace.md`

Rules

- Surveillance artifacts should keep the lineage label first.
- The optional slug should identify the surveillance field, purpose, or safeguard context.
- Surveillance artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.discovery.surveillance.v1` when the main artifact value is high-impact monitoring and its accountability boundary.
- Do not use `tiinex.discovery.surveillance.v1` as a substitute for legal compliance, consent, privacy boundary, attestation, evidence, decision, or enforcement artifacts.
- Do not use `tiinex.discovery.surveillance.v1` to provide operational collection instructions beyond provenance, boundaries, review, and safeguards.
- Surveillance does not authorize itself; it records claimed authority, scope, safeguards, and limits so they can be reviewed.

## Minimal Example

```md
# High-Impact Monitoring Review

## Surveillance Purpose

- Purpose: review whether an existing monitoring practice could affect access to a service.

## Authority Or Permission Basis

- Basis: internal policy is claimed but not yet independently validated.
- Status: authority basis requires review.

## Affected Subjects

- Subjects: bounded user group descriptor; individual identities not disclosed in this artifact.

## Surveillance Field

- Field: one defined risk-review process
- Out Of Scope: unrelated user activity, private communications, unrelated services

## Collection Boundary

- May Observe: events already declared in the risk-review process
- Must Not Collect: unrelated behavioral data, sensitive attributes not required by the purpose

## Minimization And Proportionality

- Minimization: only process-local events should be considered.
- Proportionality: not yet validated; requires oversight review.

## Review And Oversight

- Oversight: human review required before any access-impacting decision.

## Retention And Stop Condition

- Retention: not declared
- Stop Condition: stop or redesign if authority, minimization, or review cannot be validated.

## Interpretation Limits

- Limits: this artifact does not prove legality, fairness, accuracy, consent, or decision validity.
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

- Surveillance artifacts narrow discovery without replacing parent continuity or origin semantics
- Surveillance artifacts should remain human-readable and provenance-oriented rather than app-runtime configuration
- Surveillance artifacts may lead to evidence, signal, feedback, pointer, relation, task, decision, privacy, consent, or attestation artifacts when those schemas own the later role
- Surveillance artifacts must state what they do not prove or authorize

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

- The current surveillance create surface uses version `1`.
- `createTitle` should label the create action as `Create Surveillance`.
- `summaryPrompt` should ask for the surveillance title.
- `summaryPlaceholder` should guide the user toward the relevant discovery surface.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Surveillance Purpose` section
- `## Authority Or Permission Basis` section
- `## Affected Subjects` section
- `## Surveillance Field` section
- `## Collection Boundary` section
- `## Minimization And Proportionality` section
- `## Review And Oversight` section
- `## Retention And Stop Condition` section
- `## Interpretation Limits` section

Rules

- Generated surveillance artifacts should begin with the title as the first body heading.
- `Surveillance Purpose` should be preserved in generated artifacts.
- `Authority Or Permission Basis` should be preserved in generated artifacts.
- `Affected Subjects` should be preserved in generated artifacts.
- `Surveillance Field` should be preserved in generated artifacts.
- `Collection Boundary` should be preserved in generated artifacts.
- `Minimization And Proportionality` should be preserved in generated artifacts.
- `Review And Oversight` should be preserved in generated artifacts.
- `Retention And Stop Condition` should be preserved in generated artifacts.
- `Interpretation Limits` should be preserved in generated artifacts.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.monitoring.v1.schema.md](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/discovery/monitoring/tiinex.discovery.monitoring.v1.schema.md)
  - Value: rEs6mzJ70vMgf3cS1_V2wEpc4n8rF9jUqMtLvjgFdl4

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: hpWqTl44G4jezMt9rPrcjMNKbHNJbJPkNUhEqRWW9sk