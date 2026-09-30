# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-09-30 00:00:00
  - Summary: Native Core Handoff authoring transition for Discuss / review.

---

# Discuss / review

## Transition Identity

- Name: Discuss / review
- Version: 1
- Canonical Identifier: tiinex.core.handoff.discuss-review.v1
- Human Label: Discuss / review
- Transition Family: tiinex.handoff.authoring.v1

## Purpose And Scope

- Purpose: Create one Handoff for a bounded discussion or review that expects a disposition without implying implementation authority.
- Semantic Boundary: Review/discussion Handoff authoring only; it does not transfer implementation authority, prove acceptance, or execute follow-up work.

## Input Roles

- none

## Output Roles

- handoff
  - Meaning: Handoff draft created by the explicitly selected authoring transition.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.handoff.v1
  - Generation Binding: [Discuss / review generation](discuss-review-handoff-generation-authority.trace.md)

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-handoff
  - Target Binding: handoff
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- none

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: Use when the author explicitly intends bounded discussion or review and expects a disposition, findings, or unresolved questions rather than implementation.
- Failure Meaning: Authoring remains unavailable when the Handoff schema, exact generation authority, destination, or required endpoint inputs cannot be qualified.
- Unknown Meaning: Unknown user intent or unavailable authority remains unresolved and must not be guessed.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- workspace-draft
  - Meaning: Explicit local Workspace selected by this invocation.
  - Required: yes

### Output Placements

- handoff-placement
  - Output Binding: handoff
  - Destination Binding: workspace-draft
  - Placement Intent: new-materialization
  - Naming Authority: explicit-binding
  - Explicit Override Allowed: no

## Interpretation Limits

- Does Not Prove: endpoint authority, recipient acceptance, work completion, transition recommendation, or execution.
- Must Not Be Inferred: that this transition is appropriate unless explicitly selected for the current authoring intent.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: tTnZ5gFJ6e-XkbZbP4_hzID_RNeMs3ERBfCe1yIiUCg
