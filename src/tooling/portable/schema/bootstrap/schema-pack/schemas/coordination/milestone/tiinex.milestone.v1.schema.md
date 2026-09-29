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
  - Current Schema: [tiinex.milestone.v1](tiinex.milestone.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a meaningful marker in a project, process, expedition, development line, or coordinated effort that may be planned, reached, missed, moved, blocked, replaced, or uncertain.

---

# Milestone

- Status: draft schema note

## Summary

Schema for a meaningful marker in a project, process, expedition, development line, or coordinated effort that may be planned, reached, missed, moved, blocked, replaced, or uncertain.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Milestone Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.milestone.v1`

Rules

- `tiinex.milestone.v1` identifies artifacts whose main job is to preserve milestone semantics.
- A milestone artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A milestone artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Milestone Body

Required Shape

- first body heading after the continuity envelope
- `## Milestone Identity` section
- `## Milestone Meaning` section
- `## Milestone State` section
- `## Related Work` section
- `## Evidence Or Basis` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A milestone artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Milestone Identity

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

- `Milestone Identity` must remain human-readable and bounded.
- `Milestone Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Milestone Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Milestone Meaning

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

- `Milestone Meaning` must remain human-readable and bounded.
- `Milestone Meaning` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Milestone Meaning` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Milestone State

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

- `Milestone State` must remain human-readable and bounded.
- `Milestone State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Milestone State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Related Work

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

- `Related Work` must remain human-readable and bounded.
- `Related Work` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Related Work` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Evidence Or Basis

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

- `Evidence Or Basis` must remain human-readable and bounded.
- `Evidence Or Basis` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Evidence Or Basis` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

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

- planned milestone
- reached milestone
- missed milestone
- moved milestone
- blocked milestone
- replaced milestone
- uncertain milestone

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-milestone.trace.md`
- `<lineage>-<milestone-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.milestone.v1` when the main artifact value is the declared milestone role.
- Do not use `tiinex.milestone.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
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
# Milestone Example

## Milestone Identity

- Description: bounded example for tiinex.milestone.v1
- Boundary: bounded example for tiinex.milestone.v1

## Milestone Meaning

- Description: bounded example for tiinex.milestone.v1
- Boundary: bounded example for tiinex.milestone.v1

## Milestone State

- Description: bounded example for tiinex.milestone.v1
- Boundary: bounded example for tiinex.milestone.v1

## Related Work

- Description: bounded example for tiinex.milestone.v1
- Boundary: bounded example for tiinex.milestone.v1

## Evidence Or Basis

- Description: bounded example for tiinex.milestone.v1
- Boundary: bounded example for tiinex.milestone.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.milestone.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Milestone Identity`, `## Milestone Meaning`, `## Milestone State`, `## Related Work`, `## Evidence Or Basis`, `## Interpretation Limits`.

## Interpretation Notes

- milestone is a meaningful marker, not automatically an event or task
- supporting artifacts should carry proof of whether a milestone was reached

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: QsmNmoQN_2kb4bCAZQNsABmajYBGFaLxtmmJHO_m2TM