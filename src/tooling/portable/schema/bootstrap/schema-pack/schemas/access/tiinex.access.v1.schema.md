# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.access.v1](tiinex.access.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for an attempt or outcome around reaching, opening, visiting, reading, observing, contacting, or otherwise gaining access to a bounded target.

---

# Access

- Status: draft schema note

## Summary

Schema for an attempt or outcome around reaching, opening, visiting, reading, observing, contacting, or otherwise gaining access to a bounded target.

This schema is human-first. It should be readable by a person who knows the parent schema but does not know a specialized app, programming language, management tool, calendar tool, or database.

## Schema Validation Contract

### Access Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.access.v1`

Rules

- `tiinex.access.v1` identifies artifacts whose main job is to preserve access semantics.
- An access artifact should state its identity, boundary, state, related targets, and interpretation limits in human-readable form.
- An access artifact must not silently become proof, consent, authority, attendance, allocation, validation, or truth unless those claims are separately supported by the appropriate schema or method.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Access Body

Required Shape

- first body heading after the continuity envelope
- `## Access Target` section
- `## Access Attempt` section
- `## Access Outcome` section
- `## Access Boundary` section
- `## Next Step` section
- `## Interpretation Limits` section

Optional Sections

- Related Artifacts
- References

Rules

- An access artifact should begin with a human-readable title.
- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a reader, tool, or LLM can extract boundaries without guessing.
- Follow-up sections must not replace the declared boundary and interpretation limits.
### Access Target

Required Fields

- Target
- Target Kind

Optional Fields

- Source
- Origin
- Party
- Resource
- Place
- Tool
- Bounded Descriptor

Rules

- `Access Target` must remain human-readable and bounded.
- `Access Target` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Access Target` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Access Attempt

Required Fields

- Attempted Action
- Attempt Context

Optional Fields

- Actor
- Method
- Time Window
- Required Permission

Rules

- `Access Attempt` must remain human-readable and bounded.
- `Access Attempt` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Access Attempt` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Access Outcome

Required Fields

- Outcome State
- Observed Result

Optional Fields

- Reached
- Blocked
- Partial
- Unavailable
- Deferred
- Denied
- Unknown

Rules

- `Access Outcome` must remain human-readable and bounded.
- `Access Outcome` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Access Outcome` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Access Boundary

Required Fields

- What Access Allows
- What Access Does Not Allow

Optional Fields

- Permission Boundary
- Safety Boundary
- Privacy Boundary
- Custody Boundary

Rules

- `Access Boundary` must remain human-readable and bounded.
- `Access Boundary` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Access Boundary` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Next Step

Required Fields

- Recommended Next Step

Optional Fields

- Retry Or Revisit
- Alternative Path
- Human Review
- No Further Action

Rules

- `Next Step` must remain human-readable and bounded.
- `Next Step` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Next Step` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Uncertainty
- Open Questions

Rules

- `Interpretation Limits` must remain human-readable and bounded.
- `Interpretation Limits` must state what is known, what is unknown, and what must not be inferred when those limits matter.
- `Interpretation Limits` may reference relation, evidence, attestation, validation, privacy, source, access, resource, party, event, project, or instrument artifacts when those artifacts own companion semantics.

### Allowed Or Common Shapes

Allowed Shapes

- successful access
- blocked access
- partial access
- deferred access
- denied access
- unsafe access
- unknown access
- permission-limited access

Rules

- Allowed shapes are guidance for common reading and grouping, not an exhaustive vocabulary.
- Local artifacts may use another precise human-readable shape when the declared boundaries remain clear.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-access.trace.md`
- `<lineage>-<access-slug>.trace.md`

Rules

- Artifacts should keep the lineage label first.
- The optional slug should describe the bounded artifact role rather than a low-signal implementation detail.
- Ordinary lineage artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.access.v1` when the main artifact value is the declared access role.
- Do not use `tiinex.access.v1` to replace evidence, attestation, validation, consent, relation, task, decision, event, party, resource, or instrument artifacts when those schemas own the main role.
- Parent remains direct continuity ancestry; related targets should be represented through relation or target fields unless direct continuation is being declared.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Target
- Target Kind
- Attempted Action
- Attempt Context
- Outcome State
- Observed Result
- What Access Allows
- What Access Does Not Allow
- Recommended Next Step
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should keep the artifact human-readable and bounded.
- Creation tools should preserve unknown, partial, contested, private, unsafe, unavailable, or ambiguous state instead of inventing certainty.
## Minimal Example

```md
# Archive Visit Access Attempt

## Access Target

- Target: municipal archive reading room
- Target Kind: place/source

## Access Attempt

- Attempted Action: visit and request one folder
- Attempt Context: planned research pass

## Access Outcome

- Outcome State: blocked
- Observed Result: archive closed during declared visit window

## Access Boundary

- What Access Allows: no material review occurred
- What Access Does Not Allow: no claim about folder contents

## Next Step

- Recommended Next Step: revisit during published opening hours

## Interpretation Limits

- Does Not Prove: absence of material or refusal by archive staff
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Access Target`, `## Access Attempt`, `## Access Outcome`, `## Access Boundary`, `## Next Step`, `## Interpretation Limits`.

## Interpretation Notes

- access records what could or could not be reached
- permission describes right or authority and is not the same as access
- access is not evidence unless preserved material and claim-bearing use are separately declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: eVL01ObBqK8BqwwxTTITnHCAa3inmePZ1PhlX2dMKKg