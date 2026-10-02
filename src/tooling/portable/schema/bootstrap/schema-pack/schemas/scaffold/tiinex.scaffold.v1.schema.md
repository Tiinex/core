# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.scaffold.v1](tiinex.scaffold.v1.schema.md)
  - Created At: 2026-10-02 21:00:00
  - Authors: Anchor
  - Why: Define reusable structural scaffolding without conflating filesystem layout with artifact body generation, lifecycle, lineage, or Reduction.
  - Summary: Domain-neutral contract for qualified repository, Workspace, and directory-subtree structure declarations.
  - Status: candidate/local

---

# Structural Scaffold

## Summary

Defines a human-readable, machine-projectable contract for reusable material structure such as repository roots, Workspace roots, and bounded directory subtrees.

A Scaffold declares the structural entries that should exist under one bound target root, the role and requiredness of those entries, safe composition and conflict policy, optional generation authorities for file content, and the validation boundary for planning or applying the structure.

A Scaffold does not itself mutate a filesystem. It is semantic input to a resolver/planner. Core or another qualified mechanism may project a plan; a host may apply an explicitly authorized plan.

## Core Semantics

- Scaffold = reusable desired structural shape, not a filesystem mutation receipt.
- Scaffold owns physical/materialization structure; target schemas own artifact content semantics.
- Schema Generation owns artifact skeleton/content generation and must not be redefined inside Scaffold.
- Transition Definition owns applicability, lifecycle, Parent effects, destination binding, and output placement intent.
- Workspace owns Workspace identity, source/discovery policy, and viewer/runtime Workspace declarations.
- Reduction owns carry-forward/loss/recovery semantics and does not become completion or deletion authority through Scaffold.
- Structure does not create semantic ancestry. Directory nesting never creates Parent, source, authority, ownership, acceptance, currentness, or completion.
- Paths are target-root-relative structural coordinates. They are not repository provenance or recovery locators.
- Unknown or conflicting structure must remain unresolved rather than being guessed or overwritten.

## Schema Validation Contract

### Scaffold Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.scaffold.v1`

Rules

- `tiinex.scaffold.v1` identifies a reusable structural scaffold declaration.
- Scaffold artifacts must preserve identity, target boundary, structural entries, composition, conflict policy, generation bindings, validation boundary, and interpretation limits.
- Scaffold qualification does not prove that any target has been mutated or already conforms.
- Prose outside `Schema Validation Contract` may explain the schema but does not add required validation rules.

### Scaffold Body

Required Shape

- first body heading after the continuity envelope
- `## Scaffold Identity` section
- `## Target Boundary` section
- `## Structural Entries` section
- `## Composition` section
- `## Conflict Policy` section
- `## Generation Bindings` section
- `## Validation Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Rationale
- Examples
- Review Notes
- Migration Notes

Rules

- Required sections must remain readable and machine-extractable.
- Structural entries and generation bindings use repeated named declarations.
- Intentional zero is represented by one literal first-level entry `none` where allowed.
- Scaffold artifacts should prefer explicit bounded declarations over prose-only directory trees.

### Scaffold Identity

Required Fields

- Scaffold Handle
- Scaffold Name
- Scaffold Kind
- Version

Optional Fields

- Purpose
- Owner
- Stability

Allowed Labels

- repository
- workspace
- directory-subtree
- unknown

Rules

- `Scaffold Handle` is a stable readable identifier within the owning catalog or package boundary.
- `Scaffold Name` is the human-readable name.
- `Scaffold Kind` classifies the structural target class and uses `repository`, `workspace`, `directory-subtree`, or `unknown`.
- `Version` is the Scaffold declaration version and does not imply schema version or repository release version.
- Scaffold identity does not establish target identity or select a concrete destination.

### Target Boundary

Required Fields

- Target Kind
- Target Root Meaning
- Root Binding Policy

Optional Fields

- Required Capability
- Source Mutation Boundary
- Notes

Allowed Labels

- repository-root
- workspace-root
- directory-root
- unknown
- explicit-invocation
- transition-destination
- workspace-source-root

Rules

- `Target Kind` uses `repository-root`, `workspace-root`, `directory-root`, or `unknown`.
- `Target Root Meaning` states what the scaffold-relative `.` means.
- `Root Binding Policy` uses `explicit-invocation`, `transition-destination`, `workspace-source-root`, or `unknown`.
- A Scaffold does not infer a concrete target from its own storage location, repository, package membership, filename, or Parent.
- If required target binding cannot be qualified, planning remains unresolved.

### Structural Entry Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Path
- Entry Kind
- Presence
- Entry Role

Optional Fields

- Content Authority
- Content Authority Reference
- Naming Authority Reference
- Notes

Allowed Labels

- directory
- file
- required
- optional
- unknown
- none
- schema-generation
- external-authority
- native-static
- unknown

Rules

- Entries under `## Structural Entries` are named Structural Entry declarations using this shape.
- Declaration names must be unique within the Scaffold.
- `Path` is relative to the bound target root, uses `/` separators, and must not be absolute or contain `.` or `..` path segments.
- `Path` must not be empty.
- `Entry Kind` uses `directory`, `file`, or `unknown`.
- `Presence` uses `required`, `optional`, or `unknown`.
- `Entry Role` is a readable semantic role such as `workspace-entrypoint-root`, `work-root`, `process-root`, `reduction-root`, `domain-root`, `package-source-root`, or another bounded role; role labels do not create separate schema authority.
- `Content Authority`, when present for a file, uses `none`, `schema-generation`, `external-authority`, `native-static`, or `unknown`.
- `Content Authority: schema-generation` requires `Content Authority Reference` to a qualified Schema Generation artifact or target schema generation authority.
- `Content Authority: external-authority` or `native-static` requires an explicit `Content Authority Reference`.
- Directory entries should omit content authority fields.
- `Naming Authority Reference`, when present, points to the authority for a generated/selected file name; it must not replace the structural `Path` declaration.
- The literal entry `none` is not allowed in `## Structural Entries`; every Scaffold must declare at least one structural entry.

### Composition

Required Fields

- Composition Policy

Optional Fields

- Extends
- Extension Order
- Duplicate Entry Policy
- Notes

Allowed Labels

- additive
- unknown
- exact-duplicate-allowed
- conflict-blocked

Rules

- `Composition Policy` uses `additive` or `unknown` in v1.
- `Extends`, when present, is one or more explicit Scaffold references whose exact qualified material is required before composition.
- Additive composition unions compatible entries and must not delete inherited entries.
- Exact duplicate declarations may collapse only when their normalized semantic fields are equivalent.
- Conflicting declarations for the same normalized path are unresolved and block a fully resolved plan.
- Composition order must not silently override conflicting semantics.
- Directory placement or package adjacency does not imply `Extends`.

### Conflict Policy

Required Fields

- Existing Compatible Material
- Existing Conflicting Material
- Unknown Existing Material
- Deletion Policy

Optional Fields

- Replacement Authority
- Notes

Allowed Labels

- preserve
- no-op
- block
- explicit-authority-required
- never
- unknown

Rules

- `Existing Compatible Material` uses `preserve` or `no-op`.
- `Existing Conflicting Material` uses `block` or `explicit-authority-required`.
- `Unknown Existing Material` uses `preserve`, `block`, or `unknown`.
- `Deletion Policy` is `never` for Scaffold v1.
- Scaffold v1 never authorizes deletion, recursive cleanup, historical migration, or replacement merely because target material differs from the declaration.
- Replacement, when a future qualified operation supports it, requires authority outside Scaffold and must remain separately observable.

### Generation Binding Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Structural Entry
- Generation Authority

Optional Fields

- Generation Mode
- Required Inputs
- Notes

Rules

- Entries under `## Generation Bindings` map declared file Structural Entries to explicit artifact/file generation authorities.
- `Structural Entry` resolves to one declared file entry by declaration name.
- `Generation Authority` is a readable resolvable reference to a Schema Generation artifact, target-schema creation authority, Native qualified static material, or another explicit generation authority.
- Generation bindings do not copy the body-generation rules into Scaffold.
- A literal first-level entry `none` is allowed as the sole `## Generation Bindings` entry when the scaffold creates only directories or otherwise requires no generated file content.

### Validation Boundary

Required Fields

- Qualification Rule
- Planning Rule
- Apply Rule
- Failure Policy

Optional Fields

- Required Checks
- Receipt Requirement
- Notes

Rules

- `Qualification Rule` states that Scaffold bytes and every required referenced authority must qualify before the Scaffold can be treated as fully resolved.
- `Planning Rule` must preserve a distinction between `create`, `preserve/no-op`, `blocked-conflict`, and `unresolved` structural outcomes.
- `Apply Rule` must require a separately authorized host/mechanism action; Scaffold qualification alone never authorizes filesystem mutation.
- `Failure Policy` is fail-closed for unresolved required entries, unsafe paths, conflicting composition, unavailable generation authority, or conflicting target material.
- A plan or apply receipt must not claim semantic artifact validity merely because paths were created.

### Interpretation Limits

Required Fields

- Does Not Establish
- Must Not Be Used To Claim

Optional Fields

- Historical Boundary
- Authority Boundary
- Host Boundary

Rules

- Scaffold must not be used to claim Parent ancestry, source provenance, Workspace identity, process applicability, Role authority, acceptance, completion, Reduction, destructive eligibility, deletion authority, or semantic correctness of generated artifacts.
- Scaffold does not make an existing historical layout invalid merely because it differs from a preferred current scaffold.
- Native catalog inclusion does not make a Scaffold applicable to every Workspace.
- Host-specific UI or filesystem APIs remain outside Scaffold semantic authority.

### File Naming

Allowed Shapes

- `<scaffold-slug>-scaffold.trace.md`
- `<lineage>-<scaffold-slug>.trace.md`

Rules

- Reusable catalog Scaffold artifacts should prefer `<scaffold-slug>-scaffold.trace.md`.
- Lineage-local Scaffold artifacts may use lineage-first naming when they are themselves work products.
- Filename and storage location do not establish Scaffold Handle, applicability, target identity, or composition.

## Minimal Example

```md
# Tiinex Workspace Base Scaffold

## Scaffold Identity

- Scaffold Handle: tiinex.native.workspace-base.v1
- Scaffold Name: Tiinex Workspace Base
- Scaffold Kind: workspace
- Version: 1

## Target Boundary

- Target Kind: workspace-root
- Target Root Meaning: root directory of one selected Tiinex Workspace source tree
- Root Binding Policy: explicit-invocation

## Structural Entries

- Workspace entrypoint directory
  - Path: .topics/.workspaces
  - Entry Kind: directory
  - Presence: required
  - Entry Role: workspace-entrypoint-root
- Work directory
  - Path: .topics/work
  - Entry Kind: directory
  - Presence: required
  - Entry Role: work-root
- Process directory
  - Path: .topics/processes
  - Entry Kind: directory
  - Presence: required
  - Entry Role: process-root
- Reduction directory
  - Path: .topics/reductions
  - Entry Kind: directory
  - Presence: required
  - Entry Role: reduction-root

## Composition

- Composition Policy: additive
- Duplicate Entry Policy: exact-duplicate-allowed

## Conflict Policy

- Existing Compatible Material: no-op
- Existing Conflicting Material: block
- Unknown Existing Material: preserve
- Deletion Policy: never

## Generation Bindings

- none

## Validation Boundary

- Qualification Rule: exact Scaffold and required referenced authority qualification
- Planning Rule: project create, preserve/no-op, blocked-conflict, and unresolved outcomes without mutation
- Apply Rule: separately authorized host/mechanism action only
- Failure Policy: fail-closed

## Interpretation Limits

- Does Not Establish: Parent ancestry, Workspace identity, process completion, Reduction, or deletion authority
- Must Not Be Used To Claim: that historical Workspaces not matching this scaffold are invalid or require migration
```

The inherited `# Continuity Integrity` footer is intentionally omitted from the example for readability.

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order used here:
`Summary`, `Core Semantics`, `Schema Validation Contract`, `Minimal Example`, `Validation-Friendly Shape`, `Interpretation Notes`, and `Artifact Creation Contract`.

The required artifact body sections are `Scaffold Identity`, `Target Boundary`, `Structural Entries`, `Composition`, `Conflict Policy`, `Generation Bindings`, `Validation Boundary`, and `Interpretation Limits`.

Repeated Structural Entry and Generation Binding declarations are owned by their local contract shapes; validators must not pair repeated nested fields by document-wide position.

## Interpretation Notes

- canonical schema id: `tiinex.scaffold.v1`
- canonical family: direct Root descendant for reusable physical/materialization structure
- canonical Docs path: `.topics/.schemas/scaffold/tiinex.scaffold.v1.schema.md`
- Schema Generation remains artifact-content authority
- Transition Definition remains lifecycle/destination/output-placement authority
- Workspace remains identity/source/discovery authority
- first-party Scaffold instances are expected to live in Native after qualification
- Scaffold v1 is additive and non-destructive by design
- future Workspace default binding, migration, destructive apply, and operative-state classification are separate concerns

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder

Rules

- The current Scaffold create surface uses version `1`.
- `createTitle` should label the action as `Create Scaffold`.
- `summaryPrompt` should ask for the Scaffold name or structural purpose.
- `summaryPlaceholder` should guide the author toward the bounded target structure rather than implementation details.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Scaffold Identity` section
- `## Target Boundary` section
- `## Structural Entries` section
- `## Composition` section
- `## Conflict Policy` section
- `## Generation Bindings` section
- `## Validation Boundary` section
- `## Interpretation Limits` section

Rules

- Generated Scaffold drafts should preserve explicit unknowns rather than invent target roots, paths, generation authorities, or mutation authority.
- Creation tooling may seed safe v1 defaults `Composition Policy: additive` and `Deletion Policy: never` when those values are explicit in the selected first-party creation authority.
- Creation tooling must not generate file body content except through an explicit Generation Binding authority.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:IKXcPS8IIh_-M5LxpWm4icoSoQ3rA3yJJFpRKwbLEqM
