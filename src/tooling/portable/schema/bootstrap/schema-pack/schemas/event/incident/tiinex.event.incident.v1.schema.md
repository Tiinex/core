# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.event.v1](../tiinex.event.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Trace: [tiinex.event.v1.schema.md](../tiinex.event.v1.schema.md)
  - Origin:
    - [relative](../tiinex.event.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/df3260c77a7c14b2ece67456d1a9fe4b3e026a7c/.topics/.schemas/event/tiinex.event.v1.schema.md)
- Current
  - Current Schema: [tiinex.event.incident.v1](tiinex.event.incident.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for an unexpected, disruptive, risky, notable, harmful, or otherwise significant occurrence or reported occurrence without making the incident record proof of cause or blame.

---

# Event Incident

- Status: draft schema note

## Summary

Schema for an unexpected, disruptive, risky, notable, harmful, or otherwise significant occurrence or reported occurrence without making the incident record proof of cause or blame.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Event Incident Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.event.incident.v1`

Rules

- `tiinex.event.incident.v1` identifies artifacts whose main job is to preserve event incident semantics.
- An event incident artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An event incident artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Event Specialization

Rules

- Event incident artifacts specialize the inherited `Event Body` for artifacts whose `Current -> Current Schema` is `tiinex.event.incident.v1`.
- The child body replaces the parent event body sections for `tiinex.event.incident.v1` artifacts.
- `Incident Body` is the local body contract for this child schema.
- Incident Identity specializes Event Identity.
- Occurrence Boundary specializes Time And Context Boundary.
- Impact Or Risk specializes Related Outcomes.
- Observed Or Reported Basis and Response Or Follow-Up preserve event state and interpretation boundaries.
- Parent event specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Event Incident Body

Required Shape

- first body heading after the continuity envelope
- `## Incident Identity` section
- `## Occurrence Boundary` section
- `## Impact Or Risk` section
- `## Observed Or Reported Basis` section
- `## Response Or Follow-Up` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An event incident artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Incident Identity

Required Fields

- Description
- Boundary

Optional Fields

- Related Event
- Related Project
- Related Party
- Related Resource
- Evidence Basis
- Follow-Up

Rules

- `Incident Identity` must remain human-readable and bounded.
- `Incident Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Incident Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Occurrence Boundary

Required Fields

- Description
- Boundary

Optional Fields

- Related Event
- Related Project
- Related Party
- Related Resource
- Evidence Basis
- Follow-Up

Rules

- `Occurrence Boundary` must remain human-readable and bounded.
- `Occurrence Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Occurrence Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Impact Or Risk

Required Fields

- Description
- Boundary

Optional Fields

- Related Event
- Related Project
- Related Party
- Related Resource
- Evidence Basis
- Follow-Up

Rules

- `Impact Or Risk` must remain human-readable and bounded.
- `Impact Or Risk` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Impact Or Risk` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Observed Or Reported Basis

Required Fields

- Description
- Boundary

Optional Fields

- Related Event
- Related Project
- Related Party
- Related Resource
- Evidence Basis
- Follow-Up

Rules

- `Observed Or Reported Basis` must remain human-readable and bounded.
- `Observed Or Reported Basis` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Observed Or Reported Basis` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Response Or Follow-Up

Required Fields

- Description
- Boundary

Optional Fields

- Related Event
- Related Project
- Related Party
- Related Resource
- Evidence Basis
- Follow-Up

Rules

- `Response Or Follow-Up` must remain human-readable and bounded.
- `Response Or Follow-Up` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Response Or Follow-Up` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Related Event
- Related Project
- Related Party
- Related Resource
- Evidence Basis
- Follow-Up

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- service incident
- safety incident
- access incident
- data incident
- field incident
- meeting incident
- near miss

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-event-incident.trace.md`
- `<lineage>-<event-incident-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.event.incident.v1` when the main artifact value is the declared event incident role.
- Do not use `tiinex.event.incident.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Description
- Boundary
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Event Incident Example

## Incident Identity

- Description: bounded example for tiinex.event.incident.v1
- Boundary: bounded example for tiinex.event.incident.v1

## Occurrence Boundary

- Description: bounded example for tiinex.event.incident.v1
- Boundary: bounded example for tiinex.event.incident.v1

## Impact Or Risk

- Description: bounded example for tiinex.event.incident.v1
- Boundary: bounded example for tiinex.event.incident.v1

## Observed Or Reported Basis

- Description: bounded example for tiinex.event.incident.v1
- Boundary: bounded example for tiinex.event.incident.v1

## Response Or Follow-Up

- Description: bounded example for tiinex.event.incident.v1
- Boundary: bounded example for tiinex.event.incident.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.event.incident.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Incident Identity`, `## Occurrence Boundary`, `## Impact Or Risk`, `## Observed Or Reported Basis`, `## Response Or Follow-Up`, `## Interpretation Limits`.

## Interpretation Notes

- event incident specializes event without replacing event boundaries
- event child artifacts are not evidence, consent, authority, attendance, or task completion by themselves

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.event.v1.schema.md](https://github.com/Tiinex/docs/blob/df3260c77a7c14b2ece67456d1a9fe4b3e026a7c/.topics/.schemas/event/tiinex.event.v1.schema.md)
  - Value: dsu97ve8UnEdhMmW7TaOjaiUfqQ-7zupmGGgMbOc3Mw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: RkK5HTJ_5j1uSkOZTuFC_06aeO7EEB8-wMFcoVQnUhM