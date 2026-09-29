# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.party.v1](../tiinex.party.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Trace: [tiinex.party.v1.schema.md](../tiinex.party.v1.schema.md)
  - Origin:
    - [relative](../tiinex.party.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md)
- Current
  - Current Schema: [tiinex.party.group.v1](tiinex.party.group.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a group, team, community, working group, cohort, or informal collective without treating the reference as membership proof or consent from members.

---

# Party Group

- Status: draft schema note

## Summary

Schema for a group, team, community, working group, cohort, or informal collective without treating the reference as membership proof or consent from members.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Party Group Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.party.group.v1`

Rules

- `tiinex.party.group.v1` identifies artifacts whose main job is to preserve party group semantics.
- A party group artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A party group artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Party Specialization

Rules

- Party group artifacts specialize the inherited `Party Body` for artifacts whose `Current -> Current Schema` is `tiinex.party.group.v1`.
- The child body replaces the parent party body sections for `tiinex.party.group.v1` artifacts.
- `Group Body` is the local body contract for this child schema.
- Group Identity specializes Party Identity.
- Group Boundary specializes Party Boundary.
- Membership Boundary specializes Role Or Capacity and Reference And Privacy Boundary.
- Use Boundary preserves use and interpretation boundaries without proving membership or consent.
- Parent party specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Party Group Body

Required Shape

- first body heading after the continuity envelope
- `## Group Identity` section
- `## Group Boundary` section
- `## Membership Boundary` section
- `## Use Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A party group artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Group Identity

Required Fields

- Group Label
- Group Kind

Optional Fields

- Canonical Identifier
- Community Surface
- Organization

Rules

- `Group Identity` must remain human-readable and bounded.
- `Group Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Group Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Group Boundary

Required Fields

- In Scope
- Out Of Scope

Optional Fields

- Open Group
- Closed Group
- Informal Group
- Project Team

Rules

- `Group Boundary` must remain human-readable and bounded.
- `Group Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Group Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Membership Boundary

Required Fields

- Membership State
- What Membership Does Not Prove

Optional Fields

- Member List
- Membership Evidence
- Relation Artifact

Rules

- `Membership Boundary` must remain human-readable and bounded.
- `Membership Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Membership Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Use Boundary

Required Fields

- Usable As
- Must Not Be Used As

Optional Fields

- Invitation Target
- Event Participant
- Availability Subject

Rules

- `Use Boundary` must remain human-readable and bounded.
- `Use Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Use Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Consent Limits
- Representativeness Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- project team
- community
- working group
- review group
- household
- class
- informal collective

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-party-group.trace.md`
- `<lineage>-<party-group-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.party.group.v1` when the main artifact value is the declared party group role.
- Do not use `tiinex.party.group.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Group Label
- Group Kind
- In Scope
- Out Of Scope
- Membership State
- What Membership Does Not Prove
- Usable As
- Must Not Be Used As
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Party Group Example

## Group Identity

- Group Label: bounded example for tiinex.party.group.v1
- Group Kind: bounded example for tiinex.party.group.v1

## Group Boundary

- In Scope: bounded example for tiinex.party.group.v1
- Out Of Scope: bounded example for tiinex.party.group.v1

## Membership Boundary

- Membership State: bounded example for tiinex.party.group.v1
- What Membership Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself

## Use Boundary

- Usable As: bounded reference in related Tiinex artifacts
- Must Not Be Used As: tiinex.party.group.v1 example must not be treated as proof outside its declared boundary

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.party.group.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Group Identity`, `## Group Boundary`, `## Membership Boundary`, `## Use Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- group reference is not membership proof
- group reference is not consent from members

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.party.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md)
  - Value: m-C4EsPECe8ZZ4rJ_99MlV5ougMsI_gIDtCCDk1MLWY

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: eUCCj45Y1tVqGKlvxFs0BuiVpQk8HVjrjNpfFh-i1j8