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
  - Current Schema: [tiinex.invitation.v1](tiinex.invitation.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for a request, offer, reservation request, or invitation for a party, resource, room, tool, facility, source, channel, or bounded target to participate, be present, be used, contribute, respond, accept, or decline.

---

# Invitation

- Status: draft schema note

## Summary

Schema for a request, offer, reservation request, or invitation for a party, resource, room, tool, facility, source, channel, or bounded target to participate, be present, be used, contribute, respond, accept, or decline.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Invitation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.invitation.v1`

Rules

- `tiinex.invitation.v1` identifies artifacts whose main job is to preserve invitation semantics.
- An invitation artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An invitation artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Invitation Body

Required Shape

- first body heading after the continuity envelope
- `## Invitation Identity` section
- `## Invitation Target` section
- `## Requested Presence Or Use` section
- `## Response Or Reservation State` section
- `## Invitation Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An invitation artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Invitation Identity

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

- `Invitation Identity` must remain human-readable and bounded.
- `Invitation Identity` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Invitation Identity` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Invitation Target

Required Fields

- Target
- Target Kind

Optional Fields

- Party
- Resource
- Room Or Facility
- Tool
- Source
- Channel
- Bounded Descriptor

Rules

- `Invitation Target` must remain human-readable and bounded.
- `Invitation Target` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Invitation Target` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Requested Presence Or Use

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

- `Requested Presence Or Use` must remain human-readable and bounded.
- `Requested Presence Or Use` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Requested Presence Or Use` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Response Or Reservation State

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

- `Response Or Reservation State` must remain human-readable and bounded.
- `Response Or Reservation State` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Response Or Reservation State` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Invitation Boundary

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

- `Invitation Boundary` must remain human-readable and bounded.
- `Invitation Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Invitation Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

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

- person invitation
- role invitation
- group invitation
- room invitation
- equipment reservation request
- resource invitation
- channel invitation

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-invitation.trace.md`
- `<lineage>-<invitation-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.invitation.v1` when the main artifact value is the declared invitation role.
- Do not use `tiinex.invitation.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Description
- Boundary
- Target
- Target Kind
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Invitation Example

## Invitation Identity

- Description: bounded example for tiinex.invitation.v1
- Boundary: bounded example for tiinex.invitation.v1

## Invitation Target

- Target: example target
- Target Kind: bounded target

## Requested Presence Or Use

- Description: bounded example for tiinex.invitation.v1
- Boundary: bounded example for tiinex.invitation.v1

## Response Or Reservation State

- Description: bounded example for tiinex.invitation.v1
- Boundary: bounded example for tiinex.invitation.v1

## Invitation Boundary

- Description: bounded example for tiinex.invitation.v1
- Boundary: bounded example for tiinex.invitation.v1

## Interpretation Limits

- Does Not Prove: truth, consent, authority, attendance, allocation, or final outcome by itself
- Must Not Be Treated As: tiinex.invitation.v1 example must not be treated as proof outside its declared boundary
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Invitation Identity`, `## Invitation Target`, `## Requested Presence Or Use`, `## Response Or Reservation State`, `## Invitation Boundary`, `## Interpretation Limits`.

## Interpretation Notes

- invitation targets may be parties or resources
- invitation is not consent, attendance, commitment, or allocation by itself

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: ToxDhEaof9oDmj563bXKpqbCyvEAiHAbdfEDn2UrRP8