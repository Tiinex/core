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
  - Current Schema: [tiinex.event.meeting.v1](tiinex.event.meeting.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for an event where multiple parties, resources, roles, rooms, channels, or other targets gather or are expected to gather in a shared time or context window.

---

# Event Meeting

- Status: draft schema note

## Summary

Schema for an event where multiple parties, resources, roles, rooms, channels, or other targets gather or are expected to gather in a shared time or context window.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Event Meeting Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.event.meeting.v1`

Rules

- `tiinex.event.meeting.v1` identifies artifacts whose main job is to preserve event meeting semantics.
- An event meeting artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An event meeting artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Event Specialization

Rules

- Event meeting artifacts specialize the inherited `Event Body` for artifacts whose `Current -> Current Schema` is `tiinex.event.meeting.v1`.
- The child body replaces the parent event body sections for `tiinex.event.meeting.v1` artifacts.
- `Meeting Body` is the local body contract for this child schema.
- Meeting Identity specializes Event Identity.
- Meeting Time And Place specializes Time And Context Boundary.
- Participants And Resources specializes Participants And Targets.
- Agenda Or Purpose and Meeting Record Boundary preserve related outcome and interpretation boundaries.
- Parent event specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Event Meeting Body

Required Shape

- first body heading after the continuity envelope
- `## Meeting Identity` section
- `## Meeting Time And Place` section
- `## Participants And Resources` section
- `## Agenda Or Purpose` section
- `## Meeting Record Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An event meeting artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Meeting Identity

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

- `Meeting Identity` must remain human-readable and bounded.
- `Meeting Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Meeting Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Meeting Time And Place

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

- `Meeting Time And Place` must remain human-readable and bounded.
- `Meeting Time And Place` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Meeting Time And Place` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Participants And Resources

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

- `Participants And Resources` must remain human-readable and bounded.
- `Participants And Resources` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Participants And Resources` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Agenda Or Purpose

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

- `Agenda Or Purpose` must remain human-readable and bounded.
- `Agenda Or Purpose` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Agenda Or Purpose` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Meeting Record Boundary

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

- `Meeting Record Boundary` must remain human-readable and bounded.
- `Meeting Record Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Meeting Record Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

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

- meeting
- review meeting
- planning meeting
- standup
- workshop meeting
- remote meeting

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-event-meeting.trace.md`
- `<lineage>-<event-meeting-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.event.meeting.v1` when the main artifact value is the declared event meeting role.
- Do not use `tiinex.event.meeting.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
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
# Event Meeting Example

## Meeting Identity

- Description: bounded example for tiinex.event.meeting.v1
- Boundary: bounded example for tiinex.event.meeting.v1

## Meeting Time And Place

- Description: bounded example for tiinex.event.meeting.v1
- Boundary: bounded example for tiinex.event.meeting.v1

## Participants And Resources

- Description: bounded example for tiinex.event.meeting.v1
- Boundary: bounded example for tiinex.event.meeting.v1

## Agenda Or Purpose

- Description: bounded example for tiinex.event.meeting.v1
- Boundary: bounded example for tiinex.event.meeting.v1

## Meeting Record Boundary

- Description: bounded example for tiinex.event.meeting.v1
- Boundary: bounded example for tiinex.event.meeting.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.event.meeting.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Meeting Identity`, `## Meeting Time And Place`, `## Participants And Resources`, `## Agenda Or Purpose`, `## Meeting Record Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- event meeting specializes event without replacing event boundaries
- event child artifacts are not evidence, consent, authority, attendance, or task completion by themselves

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.event.v1.schema.md](https://github.com/Tiinex/docs/blob/df3260c77a7c14b2ece67456d1a9fe4b3e026a7c/.topics/.schemas/event/tiinex.event.v1.schema.md)
  - Value: dsu97ve8UnEdhMmW7TaOjaiUfqQ-7zupmGGgMbOc3Mw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: NHVFFRJ0fusS1-KKoSAi-dFyAFbqEoso9kVFlD7IFpo