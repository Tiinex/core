# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.transition.v1](../tiinex.transition.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.transition.v1.schema.md](../tiinex.transition.v1.schema.md)
  - Origin:
    - [relative](../tiinex.transition.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/transition/tiinex.transition.v1.schema.md)
- Current
  - Current Schema: [tiinex.artifact.transition.v1](tiinex.artifact.transition.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Legacy schema proposal preserved for historical interpretation
  - Why: Specializes transitions for artifact and artifact-region actions such as continue, reference, use as, derive, annotate, validate, preserve, project, split, merge, promote, repair, refresh, and source resolution.
  - Summary: Artifact-level transition schema for provenance-bearing transformations and actions.
- Repairs
  - Legacy artifact-transition authority split
    - Target: schema interpretation and new authoring
    - Note: This schema ID preserves historical artifact-bound Continue, Reference, Use as, and invocation/action semantics. New reusable artifact-bound transformations should use [tiinex.transition.definition.v1](../definition/tiinex.transition.definition.v1.schema.md) with artifact/schema/region role constraints.
    - Reason: Historical and public Tiinex material already references this schema ID and must remain interpretable under the meaning it declared.

---

# Artifact Transition

## Summary

Defines a legacy transition artifact for an artifact, artifact region, span, selection, material fragment, schema-guided node, or related artifact-bound target.

This schema preserves historical artifact-specialized invocation/action semantics. It is not the active authority for new reusable artifact-bound transformation definitions; use [`tiinex.transition.definition.v1`](../definition/tiinex.transition.definition.v1.schema.md) and constrain its semantic roles instead.

Artifact transitions make UI and tooling actions explicit. Actions such as Continue, Reference, Use as, Annotate, Validate, Preserve, Project, Split, Merge, Promote, Refresh, and Resolve Source should not be hardcoded as hidden semantic behavior. They should be describable as bounded transitions with source boundary, intent, method, result boundary, mutation policy, state, and interpretation limits.

An artifact transition may create a new artifact, create a relation, attach an annotation, create a validation report, create an interpretation, produce a projection or view, or record that no output was produced. It must not silently claim that the source changed, the result is true, or the action is validated.

Continuity Integrity fingerprints provide durable references to the concrete legacy artifact-transition representation or declared continuity target they cover. Local handles and UI labels support authoring and interaction, but they do not become global identity. A changed content-derived fingerprint does not by itself decide whether two revisions belong to the same logical artifact-transition artifact.

## Core Semantics

- Artifact transition = transition whose source or result is an artifact, artifact region, or artifact-bound object.
- Source artifact and result boundary must be kept distinct.
- Continue is an artifact lineage or creation transition.
- Reference is an artifact relation or binding transition.
- Use as is an interpretive role transition.
- Annotate is an artifact annotation transition.
- Project is a reference-frame or presentation transition, not a claim that projection is truth.
- Split and merge must preserve what was split or merged and what was not carried forward.
- Artifact transition must not introduce durable sequential identifiers merely to compensate for missing representation references or scoped local handles.

## Schema Validation Contract

### Artifact Transition Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.artifact.transition.v1`

Rules

- `tiinex.artifact.transition.v1` identifies transition artifacts for artifact-level or artifact-region actions.
- Artifact transition artifacts must preserve source artifact boundary, action intent, result boundary, source mutation policy, transition state, and interpretation limits.
- Artifact transition artifacts must not imply source mutation, truth, evidence, validation, preservation, or authority unless explicitly produced by a separate bounded artifact.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Artifact Transition Body

Required Shape

- first body heading after the continuity envelope
- `## Transition Identity` section
- `## Source Artifact Boundary` section
- `## Artifact Transition Intent` section
- `## Transition Method` section
- `## Result Boundary` section
- `## Mutation Policy` section
- `## Transition State` section
- `## Interpretation Limits` section

Optional Sections

- `Source Region`
- `Selection Boundary`
- `Preconditions`
- `Postconditions`
- `Reversibility`
- `Validation Binding`
- `Generated Artifact Binding`
- `Related Artifacts`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Required sections should be readable by a person without app-specific knowledge.
- Source artifact and result boundary should be distinct.
- Optional sections must not imply validation, evidence, preservation, or mutation semantics by implication.

### Transition Identity

Required Fields

- Transition Label
- Transition Kind
- Transition State

Optional Fields

- Continuity Fingerprint
- Provisional Handle
- Local Anchor
- Human Label
- Scope

Allowed Labels

- continue
- reference
- use-as
- derive
- annotate
- validate
- preserve
- project
- split
- merge
- promote
- repair
- refresh
- resolve-source
- generate
- unknown

Rules

- `Transition Kind` should describe the action family, not durable identity.
- Durable references should prefer Continuity Integrity fingerprints when available.
- Provisional handles may be used during authoring and UI construction before checksums exist.
- Provisional handles must not silently become global identity.
- Do not introduce durable sequential identifiers for transitions, fields, rules, annotations, or relations as a substitute for declared logical continuity, scoped handles, or representation references.

### Source Artifact Boundary

Required Fields

- Source Artifact
- Source State

Optional Fields

- Source Artifact Fingerprint
- Source Provisional Handle
- Source Region
- Source Span
- Source Selection
- Source Schema
- Source Path
- Source URL
- Source Access Boundary

Allowed Labels

- whole-artifact
- artifact-region
- markdown-section
- line-span
- byte-span
- image-region
- canvas-region
- node
- source-file
- external-material
- unknown

Rules

- Source artifact should be referenced by fingerprint when available.
- Source path, URL, or provisional handle may be used during authoring when no fingerprint exists.
- Source region must be explicit when the transition does not apply to the whole artifact.

### Artifact Transition Intent

Required Fields

- Intent
- Reason

Optional Fields

- User Facing Action
- Result Schema
- Required Inputs
- Preconditions
- Policy Boundary

Allowed Labels

- continue
- reference
- use-as
- derive
- annotate
- validate
- preserve
- project
- split
- merge
- promote
- repair
- refresh
- resolve-source
- generate
- unknown

Rules

- Continue should create or resume lineage without implying source truth or replacement.
- Reference should create or propose a relation or binding without implying parentage, evidence, or authority.
- Use as should create or propose an interpretive role without mutating the source.
- Project should declare the reference frame or projection boundary instead of treating a view as source truth.

### Transition Method

Required Fields

- Method

Optional Fields

- Actor
- Tool
- Adapter
- Runtime
- Schema Builder
- Validator
- LLM Role
- Manual Step
- Method Boundary

Allowed Labels

- manual
- tool-assisted
- adapter-observed
- validator-derived
- schema-builder-generated
- llm-assisted
- imported
- generated
- unknown

Rules

- Method should identify whether the transition was manual, tool-assisted, adapter-observed, validator-derived, schema-builder-generated, imported, or unknown.
- Tooling may perform the transition, but tool behavior must not be the only semantic record when provenance matters.

### Result Boundary

Required Fields

- Result Kind
- Result State

Optional Fields

- Result Fingerprint
- Result Provisional Handle
- Result Schema
- Result Artifact
- Result Relation
- Result Annotation
- Result Report
- Result View
- Result Projection
- Result Path
- Result URL

Allowed Labels

- new-artifact
- existing-artifact
- relation
- annotation
- validation-report
- preservation
- evidence-candidate
- claim-candidate
- interpretation
- projection
- view
- no-output
- unknown

Rules

- Result should be referenced by fingerprint when available.
- Expected result and actual result should be kept distinct when they differ.
- A produced result does not become true, validated, evidence, preserved, accepted, or authoritative merely because a transition produced it.

### Mutation Policy

Required Fields

- Source Mutation Policy

Optional Fields

- Result Mutation Policy
- Append Policy
- Destructive Change Policy
- Reversibility

Allowed Labels

- source-unchanged
- source-annotated
- source-copied
- source-derived-from
- source-superseded
- relation-created
- view-only
- projection-only
- destructive-forbidden
- destructive-applied
- unknown

Rules

- Default source mutation policy should be `source-unchanged` unless the transition explicitly says otherwise.
- Source annotation must be distinguished from source content mutation.
- Destructive changes require explicit boundary and should not be implied by a button label.

### Transition State

Required Fields

- State

Optional Fields

- Started At
- Completed At
- Failed At
- Review Needed
- Failure Reason
- Superseded By

Allowed Labels

- proposed
- applied
- partial
- failed
- skipped
- reversed
- superseded
- needs-review
- unknown

Rules

- State describes the transition, not target validity or result truth.
- Failed or skipped transitions should preserve why no result was produced when known.

### Interpretation Limits

Required Fields

- Does Not Mean

Optional Fields

- Must Not Be Used To Claim
- Requires Separate Validation
- Requires Separate Evidence
- Requires Separate Consent
- Requires Separate Preservation

Rules

- Artifact transitions must state important claims they do not support.
- Artifact transitions must not imply source truth, result truth, evidence status, validation, preservation, consent, authority, or source completeness unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create an artifact transition when an artifact action should be replayable, auditable, reversible, reviewable, or generated without hardcoded app assumptions.
- Do not create an artifact transition merely to display a static badge, relation, or annotation unless the action that produced it needs preservation.
- Use general `transition` when the source or result is not artifact-bound.

### Required Inputs

Required Fields

- Source Artifact
- Transition Kind
- Intent
- Method
- Result Boundary
- Source Mutation Policy
- State
- Interpretation Limits

Optional Fields

- Source Region
- Source Artifact Fingerprint
- Provisional Handle
- Result Schema
- Result Fingerprint
- Preconditions
- Postconditions
- Reversibility
- Actor
- Tool
- Related Artifacts

Rules

- Missing source, intent, method, result, state, or mutation policy should be explicit.
- If no continuity fingerprint exists yet, use a provisional handle only as an authoring aid.
- After checksum assignment, references to a concrete representation should prefer the continuity fingerprint when available; that fingerprint does not automatically become immutable logical artifact identity.

### Generation Rules

Rules

- Identify source artifact and optional region.
- Choose transition kind and human-facing action label.
- Capture method and actor when known.
- Choose result kind and expected schema when known.
- Set source mutation policy explicitly.
- Add interpretation limits before treating the transition as complete.
- Do not generate durable sequential identifiers.

### Suggested Sequence

Rules

- Select artifact or region.
- Choose transition kind.
- Capture intent and method.
- Choose result boundary.
- Set mutation policy and state.
- Add interpretation limits.
- Bind source and result fingerprints after checksum pass when available.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Artifact Transition: Continue discovery finding

## Transition Identity

Transition Label: Continue discovery finding
Transition Kind: continue
Transition State: proposed
Provisional Handle: continue-discovery-finding

## Source Artifact Boundary

Source Artifact: discovery-finding-before-checksum
Source State: available
Source Region: whole-artifact

## Artifact Transition Intent

Intent: continue
Reason: create a follow-up artifact while preserving parent trace.
User Facing Action: Continue
Result Schema: tiinex.discovery.research.v1

## Transition Method

Method: schema-builder-generated
Actor: reviewer

## Result Boundary

Result Kind: new-artifact
Result State: expected
Result Schema: tiinex.discovery.research.v1

## Mutation Policy

Source Mutation Policy: source-unchanged

## Transition State

State: proposed
Review Needed: yes

## Interpretation Limits

Does Not Mean: the source finding is true, complete, validated, or replaced
Must Not Be Used To Claim: evidence, proof, preservation, or decision
Requires Separate Validation: yes
```

## Relationship to Other Schemas

- `transition` is the parent schema for bounded source-to-result transitions.
- `relation` owns ordinary non-parent artifact relationships.
- `interpretation` owns the resulting role or reading for use-as actions.
- `annotation` owns target-bound extra information that may be produced by annotate transitions.
- `projection.annotation` may carry reference-frame details for project transitions.
- `validation.report` owns full validation run results.
- `schema.generation` may declare how artifact transitions generate skeletons, forms, or repair suggestions.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.transition.v1.schema.md](https://github.com/Tiinex/docs/blob/2fd6c18cba67d4848a96a82c631a890a21001ae1/.topics/.schemas/transition/tiinex.transition.v1.schema.md)
  - Value: SKdeUCnRhjQPI93z5Xj3PrmLk2DfLPcQ7oUx1XPos-k

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: kFKBs6ignNkTT9ycVYdPnsN_bHtIVgCVbk6IY_yKtWA