# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/3315351edc6fad7cc81e3fca9c68a3c02851b6f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.family.v1](tiinex.schema.family.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for schema-family metadata, inheritance guidance, and create-flow policy surfaces.

---

# Schema Family

- Status: maintained schema note

## Summary

This schema defines schema-family artifacts that describe how Tiinex schemas are
grouped, extended, created, and interpreted by humans, tools, validators, and
future LLM-assisted maintainers.

It exists so Tiinex can support descendant schemas and sub-schemas without
forcing app code or validators to treat every schema as a flat unrelated choice.

## Schema Validation Contract

### Schema Family Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.family.v1`

Rules

- `tiinex.schema.family.v1` identifies artifacts whose main job is to describe a schema family, inheritance position, and intended extension behavior.
- A schema-family artifact may guide UI grouping, create-flow policy, validator discovery, and LLM extension work.
- A schema-family artifact must not replace the validation contract of the schemas it describes.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Schema Family Body

Required Shape

- first body heading after the continuity envelope
- `## Family Identity` section
- `## Inheritance Model` section
- `## Creatability Policy` section
- `## Extension Guidance` section
- `## Boundary Notes` section

Optional Sections

- Known Children
- Candidate Children
- UI Grouping
- Validator Guidance
- Migration Notes
- References

Rules

- A schema-family artifact should begin with a human-readable family name.
- `Family Identity` must identify the family and its base schema.
- `Inheritance Model` must describe extension direction and intended descendants.
- `Creatability Policy` provides advisory direct/manual authoring guidance; family abstractness is owned by `Family Identity -> Abstract Family`.
- `Extension Guidance` must tell future maintainers where new descendants should be placed.
- `Boundary Notes` must state what the family does not own.

### Family Identity

Required Fields

- Family Name
- Base Schema
- Family Role

Optional Fields

- Abstract Family
- Stable Children
- Candidate Children

Rules

- `Family Name` should be stable enough for UI grouping and documentation.
- `Base Schema` should identify the schema that anchors the family.
- `Family Role` should state why the family exists.
- `Abstract Family` should be explicit when the family is not itself meant to be manually created as ordinary content.

### Inheritance Model

Required Fields

- Extends
- Intended Children

Optional Fields

- Allowed Descendant Pattern
- Disallowed Descendant Pattern
- Override Policy

Rules

- `Extends` should identify the nearest parent schema or family when known.
- `Intended Children` should describe the kinds of descendant schemas expected under the family.
- A schema-family artifact must not silently weaken root or parent-schema contracts.
- Descendant schemas remain responsible for their own validation contracts.

### Creatability Policy

Required Fields

- Manually Creatable

Allowed Shapes

- `Manually Creatable`: yes, no, advanced, abstract
- `Creatable As Continuation`: yes, no, advanced
- `Creatable As Reference`: yes, no, advanced

Optional Fields

- Available Transition Definitions
- Recommended Transition Definitions
- Creatable As Continuation
- Creatable As Reference
- Recommended Contexts
- Available Contexts
- Advanced Contexts
- Not Suitable Contexts
- Rationale

Rules

- Creatability policy is advisory discovery and authoring guidance; it must not become hidden execution authority.
- Creatability fields must use the allowed shapes declared in this contract so UI, validators, and LLMs do not invent local values.
- `Manually Creatable: yes` does not by itself make a schema executable from a global Create surface.
- Direct creation requires an applicable reusable Transition Definition whose required artifact-input roles can be satisfied without an existing artifact; a zero-artifact-input definition is the ordinary direct-creation case.
- Absence of a zero-artifact-input Transition Definition does not by itself mean that the schema or family is abstract.
- `Abstract Family` remains the canonical family-level abstractness signal.
- `Manually Creatable: abstract` is retained only for legacy compatibility and should not be emitted by new schema-family authoring.
- `Available Transition Definitions` and `Recommended Transition Definitions` may point to reusable transition definitions for discovery; their referenced definitions remain semantic authority for behavior.
- `Creatable As Continuation` and `Creatable As Reference` are optional legacy compatibility or presentation guidance only. They must not determine Parent, relation, lifecycle, placement, or result semantics when a Transition Definition is available.
- `Recommended Contexts` should identify where the schema is a good default.
- `Advanced Contexts` should identify allowed but unusual or expert-facing use.
- `Not Suitable Contexts` should explain when the schema should not be offered.
- `advanced` means the schema or family may be created by expert or explicit advanced flows but should not be the default recommendation.

### Extension Guidance

Required Fields

- Add New Descendant When
- Do Not Add Descendant When

Optional Fields

- Prefer Existing Schema
- Required Companion Schema
- Review Questions

Rules

- Extension guidance should help future maintainers avoid creating domain schemas before base primitives exist.
- Extension guidance should prefer narrower descendant schemas over root changes when possible.
- Extension guidance should call out companion primitives such as relation, validation method, evidence, payload, privacy, or attestation when relevant.

### File Naming

Allowed Shapes

- `<family-slug>-schema-family.trace.md`
- `<schema-id>-family.trace.md`

Rules

- Schema-family artifacts should use a slug that identifies the schema family.
- Schema-family artifacts may use registry-like naming because their main role is governance and discovery rather than ordinary lineage narration.
- When a schema-family artifact continues an earlier family note, the filename should preserve enough lineage or version signal for recovery.
- Schema-family artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.schema.family.v1` to describe schema families and extension policy, not ordinary content artifacts.
- Do not use schema-family artifacts to override a child schema's own validation contract.
- Do not treat schema-family creatability policy as a substitute for explicit app or validator support when strict behavior is required.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.schema.family.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Family policy for runtime and traversal descendants.

---

# Runtime Schema Family

## Family Identity

- Family Name: runtime
- Base Schema: tiinex.runtime.v1
- Family Role: preserve execution state, result packages, and runtime interpretation surfaces
- Abstract Family: partial

## Inheritance Model

- Extends: tiinex.root.v1
- Intended Children: machine runtime, AI runtime, traversal runtime, host-specific runtime schemas

## Creatability Policy

- Manually Creatable: advanced
- Recommended Contexts: preserving bounded runtime state or outcome
- Advanced Contexts: traversal, quantum, simulator, or protocol-specific runtime packages

## Extension Guidance

- Add New Descendant When: a runtime family needs stricter body semantics than generic runtime
- Do Not Add Descendant When: the artifact is ordinary evidence, topic reasoning, task planning, or decision state

## Boundary Notes

- Runtime schemas do not replace evidence, relation, validation method, or attestation schemas.
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- schema-family artifacts make schema inheritance and create-flow policy visible instead of burying it in app code
- family metadata can guide UI grouping, but child schemas remain authoritative for validation
- future quantum and medical schemas should be placed through family/primitive reasoning before app-level creation policy is expanded
- schema-family policy should help distinguish recommended, available, advanced, and not-suitable creation contexts
- this support/governance schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/3315351edc6fad7cc81e3fca9c68a3c02851b6f6/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fx0uKsbuJBDdwS35DPw1QR3WFlw2T3AOQJmd22v1DWw
