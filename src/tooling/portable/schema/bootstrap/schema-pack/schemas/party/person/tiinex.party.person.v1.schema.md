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
  - Current Schema: [tiinex.party.person.v1](tiinex.party.person.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a bounded individual person reference without treating the reference as identity proof, consent, authority, employment, or attendance.

---

# Party Person

- Status: draft schema note

## Summary

Schema for a bounded individual person reference without treating the reference as identity proof, consent, authority, employment, or attendance.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Party Person Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.party.person.v1`

Rules

- `tiinex.party.person.v1` identifies artifacts whose main job is to preserve party person semantics.
- A party person artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- A party person artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Party Specialization

Rules

- Party person artifacts specialize the inherited `Party Body` for artifacts whose `Current -> Current Schema` is `tiinex.party.person.v1`.
- The child body replaces the parent party body sections for `tiinex.party.person.v1` artifacts.
- `Person Body` is the local body contract for this child schema.
- Person Reference specializes Party Identity.
- Disclosure Boundary specializes Party Boundary and Reference And Privacy Boundary.
- Role Or Context specializes Role Or Capacity.
- Use Boundary preserves Use With Other Schemas and interpretation boundaries.
- Parent party specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.


### Party Person Body

Required Shape

- first body heading after the continuity envelope
- `## Person Reference` section
- `## Disclosure Boundary` section
- `## Role Or Context` section
- `## Use Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- A party person artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Person Reference

Required Fields

- Person Label
- Reference Kind

Optional Fields

- Alias
- Public Name
- Private Descriptor
- Contact Boundary

Rules

- `Person Reference` must remain human-readable and bounded.
- `Person Reference` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Person Reference` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Disclosure Boundary

Required Fields

- Disclosure Level
- Privacy Boundary

Optional Fields

- Sensitive Context
- Redaction
- Private Contact Handling

Rules

- `Disclosure Boundary` must remain human-readable and bounded.
- `Disclosure Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Disclosure Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Role Or Context

Required Fields

- Context Role
- Relevant Context

Optional Fields

- Organization
- Group
- Project
- Event

Rules

- `Role Or Context` must remain human-readable and bounded.
- `Role Or Context` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Role Or Context` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Use Boundary

Required Fields

- Usable As
- Must Not Be Used As

Optional Fields

- Invitation Target
- Availability Subject
- Attesting Party

Rules

- `Use Boundary` must remain human-readable and bounded.
- `Use Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Use Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Identity Limits

Optional Fields

- Consent Limits
- Authority Limits

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- named person
- alias
- role-described person
- private bounded person descriptor
- anonymous person descriptor

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-party-person.trace.md`
- `<lineage>-<party-person-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.party.person.v1` when the main artifact value is the declared party person role.
- Do not use `tiinex.party.person.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Person Label
- Reference Kind
- Disclosure Level
- Privacy Boundary
- Context Role
- Relevant Context
- Usable As
- Must Not Be Used As
- Does Not Prove
- Identity Limits

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Party Person Example

## Person Reference

- Person Label: example person reference
- Reference Kind: bounded reference

## Disclosure Boundary

- Disclosure Level: minimal necessary disclosure
- Privacy Boundary: do not disclose more than the artifact states

## Role Or Context

- Context Role: example role in this context
- Relevant Context: bounded example context

## Use Boundary

- Usable As: bounded reference in related Tiinex artifacts
- Must Not Be Used As: tiinex.party.person.v1 example must not be treated as proof outside its declared boundary

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Identity Limits: this reference is not identity proof or consent
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Person Reference`, `## Disclosure Boundary`, `## Role Or Context`, `## Use Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- person reference is not identity proof
- use role or bounded descriptors when identity should not be disclosed

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.party.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/party/tiinex.party.v1.schema.md)
  - Value: m-C4EsPECe8ZZ4rJ_99MlV5ougMsI_gIDtCCDk1MLWY

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: JcdPpdI1PCvZCF6voXOl5pv7o3wQ9j3fhSNlmwG82yM