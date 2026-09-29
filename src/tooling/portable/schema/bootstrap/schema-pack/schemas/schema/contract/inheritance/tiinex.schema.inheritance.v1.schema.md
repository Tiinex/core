# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.schema.contract.v1](../tiinex.schema.contract.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.schema.contract.v1.schema.md](../tiinex.schema.contract.v1.schema.md)
  - Origin:
    - [relative](../tiinex.schema.contract.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/1669696ea4f498adf8924476c9f3bc8313993689/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.inheritance.v1](tiinex.schema.inheritance.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines parent-child schema merge and override contract nodes so descendants can inherit, add, refine, deprecate, or override contract surfaces without ambiguous prose interpretation.
  - Summary: Schema inheritance contract for parent-child schema behavior and conflict handling.

---


# Schema Inheritance

## Summary

Defines a contract for how one schema relates to a parent schema contract.

Schema inheritance describes which sections, fields, values, rules, generation steps, relations, examples, and interpretation limits are inherited, added, refined, deprecated, overridden, or forbidden by a child schema. It helps schema builders and validators preserve continuity over time without guessing from prose.

Schema inheritance is not object-oriented programming. It is a human-readable provenance contract for parent-child schema behavior.

## Core Semantics

- Schema inheritance = explicit parent-child contract merge behavior.
- A child schema normally inherits parent obligations unless a valid override, refinement, deprecation, or forbiddance is declared.
- Additive change should be distinct from override.
- Conflicts should be reported, not silently resolved.
- Inheritance does not make the parent or child semantically complete by itself.

## Schema Validation Contract

### Inheritance Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.inheritance.v1`

Rules

- `tiinex.schema.inheritance.v1` identifies a contract node for parent-child schema merge behavior.
- Inheritance artifacts must preserve parent schema, child schema, inherited surface, changes, conflict policy, and interpretation limits.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Inheritance Body

Required Shape

- first body heading after the continuity envelope
- `## Inheritance Identity` section
- `## Parent Contract` section
- `## Child Contract` section
- `## Merge Rules` section
- `## Conflict Handling` section
- `## Interpretation Limits` section

Optional Sections

- `Inherited Nodes`
- `Added Nodes`
- `Refined Nodes`
- `Deprecated Nodes`
- `Override Nodes`
- `Forbidden Nodes`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Parent and child schemas should be explicit.
- Merge operations should be declared by operation kind rather than inferred from wording.
- Override must state what is overridden and why.

### Inheritance Identity

Required Fields

- Inheritance Handle
- Inheritance Name
- Inheritance Kind

Optional Fields

- Inheritance Version
- Inheritance State
- Owner

Allowed Labels

- parent-child
- additive-child
- refinement
- override
- deprecation
- migration
- unknown

Rules

- Inheritance kind should describe the broad merge role.

### Parent Contract

Required Fields

- Parent Schema

Optional Fields

- Parent Contract Version
- Parent Contract Nodes
- Parent Source
- Parent Resolution State

Rules

- Parent schema must be explicit.
- If parent contract is unresolved, merged validation should report unknown or unavailable for inherited nodes.

### Child Contract

Required Fields

- Child Schema

Optional Fields

- Child Contract Version
- Child Contract Nodes
- Child Source
- Child Resolution State

Rules

- Child schema must be explicit.
- Child additions should not silently remove parent obligations.

### Merge Rules

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Merge Operation
- Applies To

Optional Fields

- Parent Node
- Child Node
- Reason
- Condition
- Effective Result

Allowed Labels

- inherit
- add
- refine
- override
- deprecate
- forbid
- rename
- migrate
- unknown

Rules

- Each first-level entry is one merge-rule declaration.
- The declaration name must be unique within `## Merge Rules` and must be a readable local description composed from the rule's existing semantic material, such as merge operation plus applies-to scope; it is not a global identifier.
- Merge operation and applies-to remain explicit nested fields and must not be inferred from declaration position.
- Merge operation must be explicit.
- `override` must identify the parent node being overridden.
- `refine` should preserve parent intent while narrowing or clarifying it.
- `add` must not remove inherited obligations.

### Conflict Handling

Required Fields

- Conflict Policy

Optional Fields

- Conflict Severity
- Conflict Message
- Unknown Parent Handling
- Unknown Child Handling
- Review Needed

Allowed Labels

- report-conflict
- parent-wins
- child-wins
- require-review
- unknown

Rules

- Conflict policy must say what happens when parent and child contract nodes disagree.
- Silent conflict resolution is not allowed.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Merge Boundary
- Missing Parent Risk
- Missing Child Risk

Rules

- Inheritance merge does not prove artifact correctness or semantic truth.
- A child schema does not escape root continuity by declaring a new inheritance contract.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a standalone inheritance contract when the parent-child merge relationship itself needs independent provenance, lifecycle, review, migration, audit, or conflict-handling semantics.
- Schema-local compilation authority for explicit inherited replacement comes from the child schema's Root-owned `Inheritance Overrides` declaration; a standalone inheritance artifact is not required merely to make that override executable.
- Do not create an inheritance contract just to restate that a parent exists or to duplicate schema-local override authority when no independent inheritance-record semantics are needed.

### Required Inputs

Required Fields

- Inheritance Handle
- Parent Schema
- Child Schema
- Merge Operation
- Applies To
- Conflict Policy
- Interpretation Limits

Optional Fields

- Parent Node
- Child Node
- Reason
- Condition
- Conflict Severity
- Examples

Rules

- Prefer additive and refinement operations over override when possible.
- Require explicit review for unclear conflicts.

### Generation Rules

Rules

- Resolve parent contract before generating child-specific required surfaces when possible.
- If parent is unavailable, mark inherited surfaces unknown rather than dropping them.
- Apply add/refine/override/deprecate/forbid in declared order when order matters.

## Validation-Friendly Shape

- Parent schema, child schema, merge operation, applies-to, and conflict policy should be extractable as fields.
- Unknown parent or child resolution must not be treated as pass.
- Inheritance examples should include expected merged result when used for tooling tests.

## Minimal Example

```text
# Schema Inheritance: Artifact Annotation extends Annotation

## Inheritance Identity

Inheritance Handle: artifact-annotation-extends-annotation
Inheritance Name: Artifact Annotation extends Annotation
Inheritance Kind: additive-child

## Parent Contract

Parent Schema: tiinex.annotation.v1
Parent Resolution State: resolved

## Child Contract

Child Schema: tiinex.artifact.annotation.v1
Child Resolution State: resolved

## Merge Rules

- inherit all parent required sections
  - Merge Operation: inherit
  - Applies To: all parent required sections
  - Effective Result: artifact.annotation keeps annotation target, value, provenance, state, and limits

- add artifact binding fields
  - Merge Operation: add
  - Applies To: artifact binding fields
  - Child Node: Artifact Binding
  - Effective Result: artifact.annotation adds artifact-specific target fields

## Conflict Handling

Conflict Policy: report-conflict
Conflict Severity: fail

## Interpretation Limits

Does Not Mean: child annotations are verified or evidence
Must Not Be Used To Claim: child schema can ignore annotation boundaries
```

## Relationship to Other Schemas

- `schema.relation` may describe parent-child relation more generally.
- `schema.rule` may enforce inheritance conflict handling.
- `schema.generation` may use inheritance to generate child artifacts from parent surfaces.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.schema.contract.v1.schema.md](https://github.com/Tiinex/docs/blob/1669696ea4f498adf8924476c9f3bc8313993689/.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md)
  - Value: N3HHx97V1jljnruVv5EpxBnQqgJiUUtul7yXWfSuJJ8

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: tX1lPHPl7d55EuPM39wjz5-sbNx6rxVw6Zf_flroCnA
