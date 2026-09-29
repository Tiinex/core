# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.finding.v1](../finding/tiinex.discovery.finding.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.finding.v1.schema.md](../finding/tiinex.discovery.finding.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/discovery/finding/tiinex.discovery.finding.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.breakthrough.v1](tiinex.discovery.breakthrough.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Preserves breakthrough provenance so a frame-shift, Eureka moment, or newly connected solution surface is not hidden inside conversation memory, implementation notes, or later decisions.
  - Summary: Human-first schema for discovered breakthroughs that preserve a change in understanding without turning it into proof, validation, decision, or truth.

---

# Discovery Breakthrough

## Summary

Defines a human-readable and machine-extractable discovery breakthrough artifact.

A breakthrough artifact preserves a discovered change in framing. It records when several previously separate problems, questions, claims, findings, constraints, or implementation paths become connected by a new interpretation, organizing idea, or solution surface.

`Eureka` may be used as a human-friendly title, label, or breakthrough name. The semantic schema remains `tiinex.discovery.breakthrough.v1`.

A breakthrough is not proof. A breakthrough is not a validation result. A breakthrough is not a decision by itself. It may later lead to claims, derivations, tasks, schema changes, validation methods, design decisions, or implementation work, but those follow-up artifacts own their own semantics.

## Core Semantics

- A breakthrough preserves a frame shift that matters enough to be reviewed later.
- A breakthrough may connect questions, findings, claims, conditions, derivations, evidence candidates, interface needs, schema gaps, tool limits, or implementation paths.
- A breakthrough may be called an insight, Eureka, reframing, convergence, architectural breakthrough, research breakthrough, or method breakthrough.
- A breakthrough should make the old frame, new frame, connected problems, unlocked direction, and remaining uncertainty visible.
- A breakthrough should not claim that the new frame is true, complete, validated, adopted, implemented, or universally applicable without separate supporting artifacts.
- A breakthrough specializes discovery finding semantics: it records something discovered and worth triage, while preserving uncertainty about what role it should later play.

## Schema Validation Contract

### Breakthrough Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.breakthrough.v1`

Rules

- `tiinex.discovery.breakthrough.v1` identifies artifacts whose main job is to preserve a discovered change in understanding or framing.
- A breakthrough artifact must keep the breakthrough distinct from proof, validation, decision, implementation, evidence, and truth.
- A breakthrough artifact may reference questions, findings, claims, derivations, evidence, validation reports, schema modules, presentation surfaces, interaction units, or implementation artifacts, but those artifacts own their own semantics.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Finding Specialization

Rules

- `tiinex.discovery.breakthrough.v1` specializes `tiinex.discovery.finding.v1` by narrowing a discovered finding into a frame-shift or connected-solution finding.
- Breakthrough artifacts inherit the finding principle that discovered material is earlier than evidence and must not pretend that being discovered makes something true.
- Breakthrough body sections replace the generic discovery finding body for artifacts whose current schema is `tiinex.discovery.breakthrough.v1`.
- `Discovery Context` preserves the inherited discovery context.
- `Frame Shift` specializes the finding itself.
- `Connected Problems` and `Unlocked Direction` specialize triage and next-artifact meaning.
- `Interpretation Limits` preserves the inherited limit semantics and prevents treating breakthroughs as proof, validation, or decisions by default.
- Parent finding specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Breakthrough Body

Required Shape

- first body heading after the continuity envelope
- `## Breakthrough Identity` section
- `## Discovery Context` section
- `## Prior Frame` section
- `## Frame Shift` section
- `## Connected Problems` section
- `## Unlocked Direction` section
- `## Review Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Eureka Label`
- `Related Questions`
- `Related Findings`
- `Related Claims`
- `Related Derivations`
- `Evidence Candidates`
- `Implementation Candidates`
- `Schema Candidates`
- `Validation Candidates`
- `Decision Candidates`
- `Superseded Frames`
- `Counter-Framing`
- `Follow-Up Tasks`
- `References`
- `Examples`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough for humans, tools, and LLMs to identify the old frame, new frame, connected problems, unlocked direction, and limits without guessing.
- A breakthrough may be candidate, accepted, superseded, disputed, deferred, rejected, or needs-review.
- A breakthrough must not silently become the decision to act on the breakthrough.

### Breakthrough Identity

Required Fields

- Breakthrough Name
- Breakthrough Type
- Breakthrough State
- Canonical Identifier

Optional Fields

- Human Label
- Eureka Label
- Short Label
- Supersedes
- Related Breakthrough

Allowed Labels

- eureka
- insight
- reframing
- convergence
- architectural-breakthrough
- product-breakthrough
- research-breakthrough
- method-breakthrough
- schema-breakthrough
- implementation-breakthrough
- unknown

Rules

- `Breakthrough Name` should be stable enough for a human-readable review list.
- `Breakthrough Type` should identify the role of the breakthrough without implying validation or adoption.
- `Breakthrough State` should describe lifecycle state, not truth.
- `Eureka Label` may be used when the human context calls the breakthrough Eureka, but it must not replace the current schema identity.
- `Canonical Identifier` should be stable enough for relation, audit, and follow-up references.

### Discovery Context

Required Fields

- Discovery Context
- Discovered By Or From
- Discovered During

Optional Fields

- Discovered At
- Source Question
- Source Finding
- Source Conversation
- Source Artifact
- Source Tool
- Source Method
- Presentation Surface
- Schema Module

Rules

- `Discovery Context` must state the situation where the frame shift was noticed.
- `Discovered By Or From` may reference a human, LLM, tool, process, review, conversation, validator, schema builder, or artifact context when known.
- Unknown or unavailable discovery context should be stated as unknown, not invented.
- Discovery context does not by itself prove authority, consent, truth, correctness, or implementation readiness.

### Prior Frame

Required Fields

- Previous Understanding
- Separate Problems
- Previous Limits

Optional Fields

- Previous Assumptions
- Previous Questions
- Previous Implementation Path
- Previous Schema Boundary
- Previous Failure Mode

Rules

- `Previous Understanding` should preserve the frame that existed before the breakthrough.
- `Separate Problems` should identify what previously looked disconnected, duplicated, blocked, or harder than necessary.
- `Previous Limits` should preserve the pain, boundary, blind spot, or uncertainty that made the frame shift meaningful.
- Prior frame description must not mock or erase why the previous framing was reasonable at the time.

### Frame Shift

Required Fields

- New Understanding
- Reframing Statement
- Why It Matters

Optional Fields

- New Unifying Principle
- New Relation
- New Schema Candidate
- New Tooling Path
- New Presentation Path
- New Validation Path
- New Implementation Path

Rules

- `New Understanding` must state what changed in interpretation.
- `Reframing Statement` should be concise enough to travel as a reviewable claim candidate, but it is not a claim artifact by itself.
- `Why It Matters` should explain what the frame shift unlocks or simplifies.
- Frame shift must not imply correctness, completeness, or adoption unless supported by separate artifacts.

### Connected Problems

Required Fields

- Problems Connected
- Shared Surface

Optional Fields

- Connected Questions
- Connected Claims
- Connected Conditions
- Connected Derivations
- Connected Findings
- Connected Evidence Candidates
- Connected Schema Modules
- Connected Presentation Surfaces

Rules

- `Problems Connected` should list the previously separate problems, needs, or blind spots that now appear related.
- `Shared Surface` should describe the common semantic surface or mechanism that connects them.
- Connected artifacts must keep their own schema semantics.
- A breakthrough may connect problems without solving all of them.

### Unlocked Direction

Required Fields

- Unlocked Direction
- Candidate Next Artifacts

Optional Fields

- Candidate Claims
- Candidate Derivations
- Candidate Decisions
- Candidate Tasks
- Candidate Schemas
- Candidate Validation Methods
- Candidate Implementations
- Candidate Risks

Rules

- `Unlocked Direction` should state what becomes easier, possible, or newly visible because of the breakthrough.
- `Candidate Next Artifacts` should name follow-up artifacts without pretending they already exist.
- A breakthrough can motivate implementation, but it must not be treated as implementation itself.
- A breakthrough can motivate a decision, but it must not be treated as the decision itself.

### Review Boundary

Required Fields

- Review Needed
- Review Method
- Current Confidence

Optional Fields

- Review Owner
- Review Status
- Validation Method Candidate
- Evidence Needed
- Counterexample Needed
- Test Needed
- Expiry Or Revisit Trigger

Allowed Labels

- candidate
- accepted
- superseded
- disputed
- deferred
- rejected
- needs-review
- unknown

Rules

- `Review Needed` should state what must be checked before the breakthrough is relied on.
- `Review Method` may reference human review, LLM audit, validation report, derivation, prototype, experiment, implementation test, or another bounded method.
- `Current Confidence` must not be confused with validation result or proof.
- Breakthrough state may change as follow-up artifacts are created.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Inferred

Optional Fields

- Remaining Unknowns
- Overclaim Risks
- Counter-Framing
- Review Notes

Rules

- A breakthrough must not imply that its new frame is true, complete, final, adopted, implemented, validated, or universally applicable.
- A breakthrough must not collapse into evidence, claim, derivation, decision, validation report, or task without a separate supporting artifact.
- A breakthrough may preserve a powerful insight while still requiring proof, validation, implementation, or review.
- The label `Eureka` is allowed as human-facing wording, but it must not reduce the required review boundary.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.discovery.breakthrough.v1` artifact when a change in understanding, framing, or connected solution surface needs to be preserved as provenance.
- Create it when losing the frame shift would make later claims, derivations, schema changes, decisions, validation methods, or implementations harder to interpret.
- Do not create a breakthrough artifact merely because an idea feels exciting if there is no reviewable frame shift, connected problem surface, or follow-up relevance.
- Do not use this schema for ordinary findings, claims, derivations, evidence, validation results, or decisions unless the frame-shift provenance is the main artifact role.

### Required Inputs

Required Fields

- Breakthrough Name
- Discovery Context
- Previous Understanding
- New Understanding
- Problems Connected
- Unlocked Direction
- Review Needed
- Interpretation Limits

Optional Fields

- Eureka Label
- Source Question
- Source Finding
- Related Claims
- Related Derivations
- Candidate Next Artifacts
- Evidence Needed
- Counter-Framing

Rules

- Missing discovery context should be explicit as unknown.
- New understanding should be stated without claiming validation unless validation already exists.
- Related artifacts should be linked without absorbing their semantics.

### Generation Rules

Rules

- Preserve the human-friendly breakthrough label when it matters for continuity.
- Separate the prior frame from the new frame.
- Separate connected problems from solved problems.
- Separate unlocked direction from decision or implementation.
- State remaining unknowns and overclaim risks.
- Link follow-up claims, derivations, evidence, validation reports, tasks, or decisions when they exist.

### Suggested Sequence

Rules

- Identify the frame shift.
- State the discovery context.
- Preserve the prior frame and why it was limited.
- State the new frame and why it matters.
- List the problems or artifacts the new frame connects.
- State what next artifacts or work it unlocks.
- State review boundary and interpretation limits.

## Validation-Friendly Shape

A validator can check this schema family by looking for:

- continuity envelope with `Current Schema: tiinex.discovery.breakthrough.v1`
- parent finding specialization
- required breakthrough body sections
- breakthrough identity fields
- discovery context fields
- prior frame and frame shift fields
- connected problems and unlocked direction fields
- review boundary fields
- interpretation limits
- absence of proof, validation, decision, implementation, evidence, or truth claims inside the breakthrough artifact itself unless separately referenced

## Minimal Example

```md
# Continuity Context

- Current
  - Current Schema: [tiinex.discovery.breakthrough.v1](tiinex.discovery.breakthrough.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Summary: Breakthrough that Tiinex provenance can serve as runtime fuel for LLM, tooling, viewer, form, and audit generation.

---

# Eureka: Provenance Is Runtime Fuel

## Breakthrough Identity

Breakthrough Name: Provenance as runtime fuel
Breakthrough Type: architectural-breakthrough
Breakthrough State: candidate
Canonical Identifier: breakthrough.provenance-runtime-fuel.v1
Eureka Label: Eureka

## Discovery Context

Discovery Context: Schema design conversation about LLM interpretation, validator tooling, interaction units, and generated implementation paths.
Discovered By Or From: Human + LLM co-design loop
Discovered During: Tiinex schema draft audit and schema-builder discussion

## Prior Frame

Previous Understanding: Provenance looked mainly like documentation and audit trail.
Separate Problems: LLM grounding, Python validation, schema authoring, form generation, viewer generation, audit reports, and implementation planning.
Previous Limits: Each implementation path appeared to require separate hidden mapping or app-specific logic.

## Frame Shift

New Understanding: Explicit provenance can act as a shared runtime interpretation surface for humans, LLMs, validators, forms, viewers, and audits.
Reframing Statement: Provenance is not only documentation; it can be runtime fuel.
Why It Matters: It reduces hidden context and lets tooling and LLMs derive safer behavior from the same artifact-borne contracts.

## Connected Problems

Problems Connected: LLM re-grounding, schema validation, form/viewer generation, audit reporting, implementation planning
Shared Surface: Schema Validation Contract, Artifact Creation Contract, interaction units, conditions, claims, derivations, presentation surfaces, schema modules

## Unlocked Direction

Unlocked Direction: Generate or partially generate validators, forms, viewers, audit targets, and implementation scaffolds from schema-borne provenance.
Candidate Next Artifacts: claim, derivation, validation report, schema module, implementation task

## Review Boundary

Review Needed: Validate through schema review, generated tooling, and first implementation pass.
Review Method: External validator audit plus Tiinex/site prototype
Current Confidence: promising candidate

## Interpretation Limits

Does Not Prove: that all implementation can be generated, that the architecture is complete, or that every schema is root-valid
Must Not Be Inferred: that the breakthrough is a decision, validation report, proof, or implementation by itself
```

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.finding.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/discovery/finding/tiinex.discovery.finding.v1.schema.md)
  - Value: mwEgQdSolUjKs5l3BLclSIozGyPq4BRFvDlKmW6c7WQ

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: D_78vBBSbyCxqoFVB9Rdv8d9d84MK5elmtchKnQe6xQ