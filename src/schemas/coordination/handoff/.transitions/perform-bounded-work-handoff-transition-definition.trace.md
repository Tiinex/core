# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-09-30 00:00:00
  - Summary: Native Core Handoff authoring transition for Perform bounded work.

---

# Perform bounded work

## Transition Identity

- Name: Perform bounded work
- Version: 1
- Canonical Identifier: tiinex.core.handoff.perform-bounded-work.v1
- Human Label: Perform bounded work
- Transition Family: tiinex.handoff.authoring.v1

## Purpose And Scope

- Purpose: Create one Handoff for an explicitly selected bounded transfer of work or responsibility that expects a qualified return.
- Semantic Boundary: Authoring transition for a bounded work Handoff only; it does not select endpoints, invent work scope, prove authority, or execute the transferred work.

## Input Roles

- none

## Output Roles

- handoff
  - Meaning: Handoff draft created by the explicitly selected authoring transition.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.handoff.v1
  - Generation Binding: [Perform bounded work generation](perform-bounded-work-handoff-generation-authority.trace.md)

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

- Applicability Meaning: Use when the author explicitly intends to transfer bounded work or responsibility and expects a return-facing completion signal.
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
  - Value: eXdp0og36SlXd9oY2DfCU_lnldo361rCUkyEIyGCxhw
