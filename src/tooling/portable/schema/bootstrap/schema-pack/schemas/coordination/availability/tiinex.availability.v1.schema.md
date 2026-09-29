# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.availability.v1](tiinex.availability.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for when or under what conditions a party, resource, room, tool, facility, source, channel, system, or bounded target is available, unavailable, limited, reserved, busy, tentative, or unknown.

---

# Availability

- Status: draft schema note

## Summary

Schema for when or under what conditions a party, resource, room, tool, facility, source, channel, system, or bounded target is available, unavailable, limited, reserved, busy, tentative, or unknown.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Availability Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.availability.v1`

Rules

- `tiinex.availability.v1` identifies artifacts whose main job is to preserve availability semantics.
- An availability artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An availability artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Availability Body

Required Shape

- first body heading after the continuity envelope
- `## Availability Subject` section
- `## Availability Window Or Condition` section
- `## Availability State` section
- `## Use Boundary` section
- `## Related Requests Or Allocations` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An availability artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Availability Subject

Required Fields

- Subject
- Subject Kind

Optional Fields

- Party
- Resource
- Room Or Facility
- Tool
- Source
- Channel
- Bounded Descriptor

Rules

- `Availability Subject` must remain human-readable and bounded.
- `Availability Subject` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Availability Subject` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Availability Window Or Condition

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Availability Window Or Condition` must remain human-readable and bounded.
- `Availability Window Or Condition` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Availability Window Or Condition` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Availability State

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Availability State` must remain human-readable and bounded.
- `Availability State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Availability State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Use Boundary

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Use Boundary` must remain human-readable and bounded.
- `Use Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Use Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Related Requests Or Allocations

Required Fields

- Description
- Boundary

Optional Fields

- Related Party
- Related Resource
- Related Event
- Related Task
- Related Project
- Evidence Basis

Rules

- `Related Requests Or Allocations` must remain human-readable and bounded.
- `Related Requests Or Allocations` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Related Requests Or Allocations` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Open Questions
- Review Needed

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- person availability
- room availability
- resource availability
- tool availability
- source availability
- system availability
- conditional availability

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-availability.trace.md`
- `<lineage>-<availability-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.availability.v1` when the main artifact value is the declared availability role.
- Do not use `tiinex.availability.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Subject
- Subject Kind
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
# Availability Example

## Availability Subject

- Subject: example target
- Subject Kind: bounded target

## Availability Window Or Condition

- Description: bounded example for tiinex.availability.v1
- Boundary: bounded example for tiinex.availability.v1

## Availability State

- Description: bounded example for tiinex.availability.v1
- Boundary: bounded example for tiinex.availability.v1

## Use Boundary

- Description: bounded example for tiinex.availability.v1
- Boundary: bounded example for tiinex.availability.v1

## Related Requests Or Allocations

- Description: bounded example for tiinex.availability.v1
- Boundary: bounded example for tiinex.availability.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.availability.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Availability Subject`, `## Availability Window Or Condition`, `## Availability State`, `## Use Boundary`, `## Related Requests Or Allocations`, `## Interpretation Limits`.

## Interpretation Notes

- availability subjects may be parties or resources
- availability is not permission, invitation, allocation, or guaranteed use by itself

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Nysg3Q0T1UHR_SDJ6QZtgM38TRN28F3SZX4iBgsggjA