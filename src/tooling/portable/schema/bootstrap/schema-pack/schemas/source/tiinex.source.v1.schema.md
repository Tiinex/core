# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/3315351edc6fad7cc81e3fca9c68a3c02851b6f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.source.v1](tiinex.source.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a chosen, configured, or declared source that a piece of work uses without treating that source as proof, permission, origin truth, or preserved material.

---

# Source

- Status: draft schema note

## Summary

Schema for a chosen, configured, or declared source that a piece of work uses without treating that source as proof, permission, origin truth, or preserved material.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Source Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.source.v1`

Rules

- `tiinex.source.v1` identifies artifacts whose main job is to preserve source semantics.
- A source artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A source artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Source Body

Required Shape

- first body heading after the continuity envelope
- `## Source Identity` section
- `## Source Boundary` section
- `## Related Origins And Adapters` section
- `## Access And Use Boundary` section
- `## Source State` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A source artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Source Identity

Required Fields

- Source Label
- Source Kind

Optional Fields

- Canonical Identifier
- Steward Or Holder
- Related Project
- Related Topic

Rules

- `Source Identity` must remain human-readable and bounded.
- `Source Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Source Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Source Boundary

Required Fields

- In Scope
- Out Of Scope
- Boundary Stability

Optional Fields

- Place Or Surface
- Collection Boundary
- Account Or Repository Boundary
- Physical Custody Boundary

Rules

- `Source Boundary` must remain human-readable and bounded.
- `Source Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Source Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Related Origins And Adapters

Required Fields

- Origin Relationship
- Adapter Relationship

Optional Fields

- Related Origin
- Recommended Adapter
- Not Recommended Adapter

Rules

- `Related Origins And Adapters` must remain human-readable and bounded.
- `Related Origins And Adapters` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Related Origins And Adapters` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Access And Use Boundary

Required Fields

- How It May Be Used
- What Use Does Not Prove
- User Action Requirements

Optional Fields

- Permission Boundary
- Privacy Boundary
- Safety Boundary

Rules

- `Access And Use Boundary` must remain human-readable and bounded.
- `Access And Use Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Access And Use Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Source State

Required Fields

- Current State
- Known Limits

Optional Fields

- Unavailable State
- Mutable State
- Freshness Boundary

Rules

- `Source State` must remain human-readable and bounded.
- `Source State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Source State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

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

- archive shelf
- person or role source
- field notebook
- local folder
- repository or community source
- sensor station
- document package
- physical place
- public web surface
- mixed source

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-source.trace.md`
- `<lineage>-<source-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.source.v1` when the main artifact value is the declared source role.
- Do not use `tiinex.source.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Source Label
- Source Kind
- In Scope
- Out Of Scope
- Boundary Stability
- Origin Relationship
- Adapter Relationship
- How It May Be Used
- What Use Does Not Prove
- User Action Requirements
- Current State
- Known Limits
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Project GitHub Source

## Source Identity

- Source Label: Tiinex docs repository source
- Source Kind: repository/community source

## Source Boundary

- In Scope: declared repository and explicitly enabled visible discussion surfaces
- Out Of Scope: unrelated repositories, private accounts, hidden moderation surfaces

## Related Origins And Adapters

- Origin Relationship: uses GitHub origin semantics when relevant
- Adapter Relationship: may use issue or discussion discovery adapters

## Access And Use Boundary

- How It May Be Used: bounded discovery and reference
- What Use Does Not Prove: correctness, maintainer approval, or preservation

## Source State

- Current State: available when visible to the operator
- Known Limits: mutable, access-limited, and policy-scoped

## Interpretation Limits

- Does Not Prove: truth, consent, authority, or evidence by itself
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Source Identity`, `## Source Boundary`, `## Related Origins And Adapters`, `## Access And Use Boundary`, `## Source State`, `## Interpretation Limits`.

## Interpretation Notes

- source is the chosen or configured source used by work
- origin is where material may begin
- adapter is how material crosses a boundary
- source is not proof, consent, permission, or preservation

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/3315351edc6fad7cc81e3fca9c68a3c02851b6f6/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 8jnHzpjh8TMsKvpswE-cbNTLZ_fvedT9XLbBzbwiEbE