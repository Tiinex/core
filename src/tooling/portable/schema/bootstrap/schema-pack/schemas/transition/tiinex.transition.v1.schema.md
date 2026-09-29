# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/0709fe80947de6b5b503f7d5202feb0e7fe94430/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.transition.v1](tiinex.transition.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Legacy schema proposal preserved for historical interpretation
  - Why: Defines bounded provenance-bearing transitions so actions such as continue, reference, use as, derive, annotate, validate, preserve, project, split, merge, and promote can be described without hidden app behavior or durable sequential identifiers.
  - Summary: General transition schema for source-to-result changes, uses, moves, and role shifts.
- Repairs
  - Legacy transition authority split
    - Target: schema interpretation and new authoring
    - Note: This schema ID preserves its historical invocation/provenance-shaped transition meaning. New reusable semantic transformation definitions use [tiinex.transition.definition.v1](definition/tiinex.transition.definition.v1.schema.md).
    - Reason: Historical and public Tiinex material already references this schema family and must remain interpretable under the meaning it declared.

---

# Transition

## Summary

Defines a human-readable and machine-extractable legacy transition artifact.

This schema preserves the historical invocation/provenance-shaped transition meaning for artifacts that already declare `tiinex.transition.v1`. It is not the active authority for new reusable transformation definitions; use [`tiinex.transition.definition.v1`](definition/tiinex.transition.definition.v1.schema.md) for new reusable semantic transition authoring.

A transition is a bounded change, move, use, or role shift from one source state, context, role, or artifact toward a result state, context, role, artifact, relation, annotation, report, projection, or view. It preserves what was acted on, what was intended, what method or actor was involved, what result was produced or expected, and what the transition must not be overread to mean.

Transitions cover ordinary human and tooling actions such as continue, reference, use as, derive, annotate, validate, preserve, project, split, merge, promote, repair, refresh, and resolve source. A transition is not automatically proof, evidence, validation, preservation, approval, mutation, replacement, or truth.

Continuity Integrity fingerprints provide durable references to the concrete legacy transition representation or declared continuity target they cover. Human labels, provisional handles, and local anchors are useful for authoring and local reference, but they must not silently become global identity. A changed content-derived fingerprint does not by itself decide whether two revisions belong to the same logical transition artifact.

## Core Semantics

- Transition = bounded source-to-result change, move, use, or role shift.
- Transition must identify the source boundary.
- Transition must identify the transition kind or intent.
- Transition must identify the result boundary or expected result boundary.
- Transition must state whether the source is unchanged, annotated, superseded, copied, transformed, or otherwise affected.
- Transition may be initiated by a person, role, tool, adapter, runtime, validator, schema builder, LLM, import, or other bounded actor.
- Transition may be proposed, applied, failed, skipped, partial, reversed, superseded, or needs-review.
- Transition must preserve interpretation limits when the action could be overread.
- Transition must not introduce durable sequential identifiers merely to compensate for missing representation references or scoped local handles.

## Schema Validation Contract

### Transition Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.transition.v1`

Rules

- `tiinex.transition.v1` identifies artifacts whose main job is to preserve a bounded transition from source boundary to result boundary.
- Transition artifacts must preserve source, intent, method or actor when known, result boundary, state, mutation policy, and interpretation limits.
- Transition artifacts must not imply truth, evidence, validation, preservation, approval, or source mutation unless a separate artifact or explicit result boundary states that role.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Transition Body

Required Shape

- first body heading after the continuity envelope
- `## Transition Identity` section
- `## Source Boundary` section
- `## Transition Intent` section
- `## Transition Method` section
- `## Result Boundary` section
- `## Mutation Policy` section
- `## Transition State` section
- `## Interpretation Limits` section

Optional Sections

- `Preconditions`
- `Postconditions`
- `Reversibility`
- `Validation Binding`
- `Related Artifacts`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Required sections should be understandable without specialized tooling.
- Source boundary and result boundary should be distinct.
- Optional sections must not add truth, validation, evidence, preservation, or mutation semantics by implication.

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
- `Transition Label` should be human-readable.
- `Continuity Fingerprint` should be used for durable reference when available.
- `Provisional Handle` and `Local Anchor` may support authoring, forms, UI actions, and local references before checksum assignment.
- Provisional handles must not silently become global identity.
- Do not introduce durable sequential identifiers such as transition-001, rule-42, or field-7 as a substitute for declared logical continuity, scoped handles, or representation references.

### Source Boundary

Required Fields

- Source Kind
- Source Reference
- Source State

Optional Fields

- Source Region
- Source Span
- Source Schema
- Source Time
- Source Access Boundary
- Source Selection
- Source Confidence

Allowed Labels

- artifact
- artifact-region
- source
- material
- relation
- annotation
- validation-report
- claim
- evidence
- preservation
- view
- projection
- schema-contract
- unknown

Rules

- Source reference should be a continuity fingerprint when available.
- Source reference may be a path, URL, local anchor, selector, or provisional handle during authoring when no fingerprint is available.
- If source state is unknown, mark it unknown instead of inventing provenance.

### Transition Intent

Required Fields

- Intent
- Reason

Optional Fields

- User Facing Action
- Expected Result Kind
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

- Intent should be explicit enough for a builder, validator, form, checklist, or human reviewer to know what action is being requested.
- Button labels such as `Continue`, `Reference`, and `Use as` are presentation labels over transition intent, not the full semantic contract.

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

- Method should say how the transition was proposed, applied, or observed when known.
- LLM assistance does not make the result authoritative without a separate validation or review boundary.

### Result Boundary

Required Fields

- Result Kind
- Result State

Optional Fields

- Result Reference
- Result Schema
- Result Artifact
- Result Relation
- Result Annotation
- Result Report
- Result View
- Result Projection
- Result Confidence

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

- Result reference should be a continuity fingerprint when available.
- Expected result and actual result should be kept distinct when they differ.
- A result artifact does not become true, validated, evidence, or preserved merely because a transition produced it.

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

- Source mutation policy must be explicit when a transition could change, replace, annotate, or supersede a source.
- Default assumption should be source unchanged unless the transition says otherwise.
- Destructive changes require explicit boundary and must not be implied by a label.

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

- State describes transition state, not truth of source or result.
- Failure or skip should preserve why the transition did not produce the intended result when known.

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

- Transition artifacts must state important claims they do not support.
- Transition artifacts must not imply source truth, result truth, evidence status, validation, preservation, consent, authority, or source completeness unless separately supported.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a transition artifact when an action or role shift needs to travel as provenance rather than remain hidden in UI or tool behavior.
- Do not create a transition artifact merely to describe a static relationship with no action, method, source boundary, result boundary, or state.
- Use a child schema when the transition is specifically about artifact-level continue, reference, use-as, derive, annotate, validate, preserve, project, split, merge, or promote actions.

### Required Inputs

Required Fields

- Source Boundary
- Transition Kind
- Transition Intent
- Method
- Result Boundary
- Source Mutation Policy
- Transition State
- Interpretation Limits

Optional Fields

- Continuity Fingerprint
- Provisional Handle
- Preconditions
- Postconditions
- Reversibility
- Actor
- Tool
- Validator
- Related Artifacts

Rules

- Missing source, intent, method, result, state, or mutation policy should be explicit.
- If no continuity fingerprint exists yet, use a provisional handle only as an authoring aid.
- After checksum assignment, references to a concrete representation should prefer the continuity fingerprint when available; that fingerprint does not automatically become immutable logical artifact identity.

### Generation Rules

Rules

- Identify the source boundary first.
- Choose the transition kind.
- Record the method or actor when known.
- Separate expected result from actual result.
- State mutation policy explicitly.
- State what the transition does not prove or authorize.
- Do not generate durable sequential identifiers.

### Suggested Sequence

Rules

- Choose source boundary.
- Choose transition kind and human label.
- Capture method and actor.
- Capture result boundary.
- Capture mutation policy and state.
- Add interpretation limits.
- Bind continuity fingerprint after checksum pass when available.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Transition: Use finding as evidence candidate

## Transition Identity

Transition Label: Use as evidence candidate
Transition Kind: use-as
Transition State: proposed
Provisional Handle: use-finding-as-evidence-candidate

## Source Boundary

Source Kind: artifact
Source Reference: discovery-finding-local-handle-before-checksum
Source State: available

## Transition Intent

Intent: use-as
Reason: evaluate whether the finding should become an evidence candidate in a separate artifact.
User Facing Action: Use as
Expected Result Kind: evidence-candidate

## Transition Method

Method: manual
Actor: reviewer

## Result Boundary

Result Kind: interpretation
Result State: proposed
Result Schema: tiinex.interpretation.v1

## Mutation Policy

Source Mutation Policy: source-unchanged

## Transition State

State: proposed
Review Needed: yes

## Interpretation Limits

Does Not Mean: the finding is evidence or proves the claim
Must Not Be Used To Claim: validation, truth, preservation, or source completeness
Requires Separate Validation: yes
```

## Relationship to Other Schemas

- `artifact.transition` specializes transition for artifact and artifact-region actions.
- `relation` owns ordinary non-parent relationship artifacts.
- `interpretation` owns the resulting reading or role when something is used as something else.
- `derivation` owns derivation rationale and bounded input-output reasoning.
- `annotation` owns attached target-bound extra information.
- `validation.report` owns full validation run results.
- `presentation.surface` may expose transitions as buttons, menu items, cards, badges, or overlays.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/0709fe80947de6b5b503f7d5202feb0e7fe94430/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: xF-jdUHgcYa6UnvXE9ueLSvbBi8fEKi6rsk5oAtD0f0

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 3ajLkhhqHXehRNM8gyHaG8zuuHvGQqyy4VuLLd5tOl8