# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.event.v1](tiinex.event.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for something that is planned to occur, may occur, is occurring, occurred, did not occur, was cancelled, was deferred, was missed, or is uncertain within a bounded time, place, context, or participant boundary.

---

# Event

- Status: draft schema note

## Summary

Schema for something that is planned to occur, may occur, is occurring, occurred, did not occur, was cancelled, was deferred, was missed, or is uncertain within a bounded time, place, context, or participant boundary.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Event Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.event.v1`

Rules

- `tiinex.event.v1` identifies artifacts whose main job is to preserve event semantics.
- An event artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An event artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Event Body

Required Shape

- first body heading after the continuity envelope
- `## Event Identity` section
- `## Time And Context Boundary` section
- `## Participants And Targets` section
- `## Event State` section
- `## Related Outcomes` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An event artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Event Identity

Required Fields

- Event Label
- Event Kind

Optional Fields

- Canonical Identifier
- Project
- Milestone
- Source

Rules

- `Event Identity` must remain human-readable and bounded.
- `Event Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Event Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Time And Context Boundary

Required Fields

- Time Boundary
- Context Or Location

Optional Fields

- Place
- Channel
- Window
- Timezone Or Local Time
- Context Limits

Rules

- `Time And Context Boundary` must remain human-readable and bounded.
- `Time And Context Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Time And Context Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Participants And Targets

Required Fields

- Relevant Parties Or Targets
- Target Kinds

Optional Fields

- Required Parties
- Optional Parties
- Required Resources
- Optional Resources
- Room Or Facility
- Tool Or Source

Rules

- `Participants And Targets` must remain human-readable and bounded.
- `Participants And Targets` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Participants And Targets` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Event State

Required Fields

- Event State
- State Basis

Optional Fields

- Planned
- Tentative
- Ongoing
- Occurred
- Cancelled
- Deferred
- Missed
- Unknown

Rules

- `Event State` must remain human-readable and bounded.
- `Event State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Event State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Related Outcomes

Required Fields

- Outcome Relationship

Optional Fields

- Tasks
- Decisions
- Evidence
- Notes
- Follow-Up
- Incident
- Report

Rules

- `Related Outcomes` must remain human-readable and bounded.
- `Related Outcomes` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Related Outcomes` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Attendance Limits
- Consent Limits
- Authority Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- planned event
- tentative event
- occurred event
- cancelled event
- deferred event
- missed event
- uncertain event
- meeting
- session
- deadline
- window
- incident

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-event.trace.md`
- `<lineage>-<event-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.event.v1` when the main artifact value is the declared event role.
- Do not use `tiinex.event.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Event Label
- Event Kind
- Time Boundary
- Context Or Location
- Relevant Parties Or Targets
- Target Kinds
- Event State
- State Basis
- Outcome Relationship
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Project Review Event

## Event Identity

- Event Label: project review
- Event Kind: meeting-like event

## Time And Context Boundary

- Time Boundary: planned Tuesday morning
- Context Or Location: online review channel

## Participants And Targets

- Relevant Parties Or Targets: project reviewer role and meeting room resource
- Target Kinds: party role, resource room

## Event State

- Event State: planned
- State Basis: proposed schedule

## Related Outcomes

- Outcome Relationship: may produce decisions and tasks separately

## Interpretation Limits

- Does Not Prove: attendance, approval, consent, or decision
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Event Identity`, `## Time And Context Boundary`, `## Participants And Targets`, `## Event State`, `## Related Outcomes`, `## Interpretation Limits`.

## Interpretation Notes

- event is not a task, decision, evidence, invitation, availability, consent, or attendance proof by itself
- event targets may be parties, resources, tools, rooms, sources, places, or bounded descriptors

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: vfG9fFsru7TRs8tYJwrT3xY9loI0TSz1BWW39Jzpr-g