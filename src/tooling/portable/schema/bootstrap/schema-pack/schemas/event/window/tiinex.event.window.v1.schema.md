# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.event.v1](../tiinex.event.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Trace: [tiinex.event.v1.schema.md](../tiinex.event.v1.schema.md)
  - Origin:
    - [relative](../tiinex.event.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/event/tiinex.event.v1.schema.md)
- Current
  - Current Schema: [tiinex.event.window.v1](tiinex.event.window.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a bounded period or condition window where something is open, possible, valid, observable, available, or allowed without treating the window as permission or availability proof by itself.

---

# Event Window

- Status: draft schema note

## Summary

Schema for a bounded period or condition window where something is open, possible, valid, observable, available, or allowed without treating the window as permission or availability proof by itself.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Event Window Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.event.window.v1`

Rules

- `tiinex.event.window.v1` identifies artifacts whose main job is to preserve event window semantics.
- An event window artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An event window artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Event Specialization

Rules

- Event window artifacts specialize the inherited `Event Body` for artifacts whose `Current -> Current Schema` is `tiinex.event.window.v1`.
- The child body replaces the parent event body sections for `tiinex.event.window.v1` artifacts.
- `Window Body` is the local body contract for this child schema.
- Window Identity specializes Event Identity.
- Window Boundary specializes Time And Context Boundary.
- What Is Open Or Possible and Related Targets specialize Participants And Targets and related outcome boundaries.
- Window State preserves the parent event state boundary.
- Parent event specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Event Window Body

Required Shape

- first body heading after the continuity envelope
- `## Window Identity` section
- `## Window Boundary` section
- `## What Is Open Or Possible` section
- `## Window State` section
- `## Related Targets` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An event window artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Window Identity

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

- `Window Identity` must remain human-readable and bounded.
- `Window Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Window Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Window Boundary

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

- `Window Boundary` must remain human-readable and bounded.
- `Window Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Window Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### What Is Open Or Possible

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

- `What Is Open Or Possible` must remain human-readable and bounded.
- `What Is Open Or Possible` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `What Is Open Or Possible` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Window State

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

- `Window State` must remain human-readable and bounded.
- `Window State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Window State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Related Targets

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

- `Related Targets` must remain human-readable and bounded.
- `Related Targets` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Related Targets` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

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

- application window
- observation window
- visit window
- publishing window
- maintenance window
- access window

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-event-window.trace.md`
- `<lineage>-<event-window-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.event.window.v1` when the main artifact value is the declared event window role.
- Do not use `tiinex.event.window.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
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
# Event Window Example

## Window Identity

- Description: bounded example for tiinex.event.window.v1
- Boundary: bounded example for tiinex.event.window.v1

## Window Boundary

- Description: bounded example for tiinex.event.window.v1
- Boundary: bounded example for tiinex.event.window.v1

## What Is Open Or Possible

- Description: bounded example for tiinex.event.window.v1
- Boundary: bounded example for tiinex.event.window.v1

## Window State

- Description: bounded example for tiinex.event.window.v1
- Boundary: bounded example for tiinex.event.window.v1

## Related Targets

- Description: bounded example for tiinex.event.window.v1
- Boundary: bounded example for tiinex.event.window.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.event.window.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Window Identity`, `## Window Boundary`, `## What Is Open Or Possible`, `## Window State`, `## Related Targets`, `## Interpretation Limits`.

## Interpretation Notes

- event window specializes event without replacing event boundaries
- event child artifacts are not evidence, consent, authority, attendance, or task completion by themselves

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.event.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/event/tiinex.event.v1.schema.md)
  - Value: ucMbtDfGL3hdEG7-I4QELLYsjY5jTBjuNll9FE2R2FA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 5NlPIJaGR3UakPrNW1Ja66b5jSQNxJTpbAmm5zUXBCg