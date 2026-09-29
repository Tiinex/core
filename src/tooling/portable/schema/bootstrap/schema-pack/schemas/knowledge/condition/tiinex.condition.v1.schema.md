# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/2f5c1eea03aad31a0209f0484e17d2cc37d92dab/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.condition.v1](tiinex.condition.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines condition provenance so human rules, branching logic, validation gates, source-resolution gates, and if/when/unless style boundaries can be recorded without becoming programming-language code.
  - Summary: Human-first schema for bounded conditions and branch outcomes.

---

# Condition

## Summary

Defines a human-readable and machine-extractable condition artifact.

A condition artifact preserves the boundary of an if, when, unless, gate, threshold, prerequisite, or branch. It is not executable code, a programming-language statement, a validator result, or a decision by itself. Software and computation remain valid domains: a condition may describe a branch predicate, loop guard, state-machine gate, recursion boundary, function prerequisite, algorithmic condition, or another computational boundary while keeping the semantic statement readable independently of executable implementation. It records what would need to be true, false, unknown, unavailable, or not applicable before another interpretation, action, validation path, portal resolution, or artifact creation step should be considered.

## Core Semantics

- A condition records a bounded test or prerequisite in human-readable form.
- A condition may support validators, schema builders, form builders, portal resolution, audit workflows, decision support, prompts, checklists, and presentation surfaces.
- A condition may be implemented by software, human review, LLM workflow, paper process, sensor reading, source lookup, laboratory protocol, instrument process, or mixed method.
- A condition may describe semantics inside software or computation, including branch predicates, loop guards, state-machine gates, recursion conditions, function or program prerequisites, and algorithmic boundaries.
- Executable implementations may be referenced separately, but executable code must not become the only semantic authority for understanding the condition.
- A condition does not by itself execute, decide, validate, prove, authorize, or allocate.
- A condition should keep condition statement, evaluation boundary, branch outcomes, state, and interpretation limits distinct.

## Schema Validation Contract

### Condition Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.condition.v1`

Rules

- `tiinex.condition.v1` identifies artifacts whose main job is to preserve condition and branch-boundary semantics.
- A condition artifact must keep a condition distinct from a decision, task, validation result, evidence claim, or executable program.
- A condition may reference validation methods, interaction units, portals, sources, tools, events, tasks, relations, or artifacts when those companion schemas own the relevant semantics.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Condition Body

Required Shape

- first body heading after the continuity envelope
- `## Condition Identity` section
- `## Condition Statement` section
- `## Evaluation Boundary` section
- `## Branch Outcomes` section
- `## Interpretation Limits` section

Optional Sections

- `Evaluation Method`
- `Related Artifacts`
- `Interaction Binding`
- `Validation Binding`
- `Examples`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough for humans, tools, and LLMs to extract the condition and branch boundary without guessing.
- A condition may be evaluated as true, false, unknown, unavailable, not applicable, or not evaluated.
- A condition must not silently become executable code or a decision.

### Condition Identity

Required Fields

- Condition Name
- Condition Kind
- Condition State
- Canonical Identifier

Optional Fields

- Short Label
- Supersedes
- Related Condition

Allowed Labels

- if
- when
- unless
- prerequisite
- gate
- threshold
- presence
- absence
- comparison
- dependency
- fallback
- unknown

Rules

- `Condition Name` should be stable enough for a human-readable checklist, audit report, or schema builder surface.
- `Condition Kind` should describe the role of the condition without making it executable code.
- `Condition State` should describe known evaluation state, not the truth of associated artifacts.
- `Canonical Identifier` should be stable enough for relation, audit, and implementation references.

### Condition Statement

Required Fields

- Condition
- Plain-Language Meaning

Optional Fields

- Original Wording
- Normalized Wording
- Terms
- Assumptions

Rules

- `Condition` must be readable by a person without specialized programming-language knowledge.
- `Plain-Language Meaning` should explain what would count as satisfying or not satisfying the condition.
- Normalization must not silently change the condition boundary.

### Evaluation Boundary

Required Fields

- Evaluation Scope
- Inputs Needed
- Evaluation State

Optional Fields

- Time Window
- Target Artifacts
- Target Sources
- Required Methods
- Required Authority
- Unknowns
- Dependencies

Allowed Labels

- true
- false
- unknown
- unavailable
- not-applicable
- not-evaluated
- superseded

Rules

- `Evaluation Scope` must state what is being evaluated.
- `Inputs Needed` must state what would be needed to evaluate the condition.
- `Evaluation State` must distinguish unknown, unavailable, not applicable, and not evaluated when those differences matter.
- A condition may be evaluated by a validation method, but the validation result belongs in a validation finding or validation report.

### Branch Outcomes

Required Fields

- If Satisfied
- If Not Satisfied
- If Unknown

Optional Fields

- If Unavailable
- If Not Applicable
- Follow-Up Question
- Suggested Relation
- Suggested Action

Rules

- Branch outcomes should describe candidate next interpretations, actions, questions, validations, or artifact roles.
- Branch outcomes must not silently execute, decide, allocate, validate, or claim truth.
- A suggested action or relation must not replace an explicit task, decision, validation, or relation artifact when those semantics need to be preserved.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Inferred

Optional Fields

- Remaining Unknowns
- Overclaim Risks
- Review Notes

Rules

- A condition must not imply that its evaluation has occurred unless `Evaluation State` says so.
- A condition must not imply that a satisfied branch is true, authorized, consented, or complete without separate support.
- A condition must not hide programming-language semantics, tool assumptions, executable implementation references, or runtime requirements when those affect interpretation.
- Describing a computational condition does not make the Condition artifact executable code, and the absence of executable code does not make software/computation an invalid domain.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.condition.v1` artifact when a branch, gate, prerequisite, if/when/unless boundary, validation gate, or fallback rule needs to travel as provenance.
- Do not create a condition artifact for purely local UI logic, CSS state, transient route state, or implementation-only branching that has no artifact-level provenance value.

### Required Inputs

Required Fields

- Condition
- Plain-Language Meaning
- Evaluation Scope
- Inputs Needed
- Branch Outcomes
- Interpretation Limits

Optional Fields

- Evaluation Method
- Related Artifacts
- Interaction Binding
- Validation Binding

Rules

- Missing inputs should be explicit as unknown or unavailable.
- Branch outcomes should remain suggestions or boundaries unless another artifact records the action, decision, or validation result.

### Generation Rules

Rules

- Write the condition in human-readable language before any implementation hint.
- Keep evaluation state separate from branch outcomes.
- Keep conditions separate from decisions, tasks, validation findings, and executable code.
- State what must not be inferred from satisfying or not satisfying the condition.

### Suggested Sequence

Rules

- Identify the condition and why it matters.
- State the plain-language meaning.
- Bound the evaluation scope and required inputs.
- State the branch outcomes for satisfied, not satisfied, and unknown.
- State interpretation limits.
- Link any validation methods, artifacts, portals, tasks, or relations that own companion semantics.

## Validation-Friendly Shape

A validator can check this schema family by looking for:

- continuity envelope with `Current Schema: tiinex.condition.v1`
- required condition body sections
- condition identity fields
- human-readable condition statement
- evaluation boundary
- branch outcomes for satisfied, not satisfied, and unknown
- interpretation limits
- absence of hidden executable-code, decision, validation result, task, or truth claims unless separately referenced

## Minimal Example

```md
# Continuity Context

- Current
  - Current Schema: [tiinex.condition.v1](tiinex.condition.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Summary: Condition for choosing whether a source may be resolved from current web state.

---

# Use current web state only when no historical source anchor is available

## Condition Identity

Condition Name: Current web fallback condition
Condition Kind: fallback
Condition State: not-evaluated
Canonical Identifier: condition.portal.current-web-fallback.v1

## Condition Statement

Condition: If no resolved source snapshot or commit-pinned source anchor is available, current web state may be used only as an explicitly limited fallback.
Plain-Language Meaning: Current web state is allowed only after stronger historical anchors are unavailable or missing.

## Evaluation Boundary

Evaluation Scope: Portal source resolution for a bounded artifact or source target
Inputs Needed: source snapshot, commit-pinned anchor, artifact timestamp, current web access state
Evaluation State: not-evaluated

## Branch Outcomes

If Satisfied: Use current web state as fallback and mark historical completeness unconfirmed.
If Not Satisfied: Use resolved source snapshot or commit-pinned anchor instead.
If Unknown: Ask a follow-up question or create a validation finding with unavailable state.

## Interpretation Limits

Does Not Prove: historical completeness, source truth, authorship, or consent
Must Not Be Inferred: that current web state equals the source state at artifact creation time
```

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2f5c1eea03aad31a0209f0484e17d2cc37d92dab/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: 3pgzWX3ICCeChCyP6dLAc6VCYBpVBHy7BtbVU-QU8PA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 0J1fB6mAcP4hRkTAepUuZoEJMrD6uBPhADuNlMOsYLw