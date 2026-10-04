# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/8145c280093dff5d0b67db2aa72d5f5c12b6c7cb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.entry.session.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/entry/session/tiinex.entry.session.v1.schema.md)
  - Created At: 2026-10-01 19:51:43
  - Authors: Anchor; Axiom
  - Why: Provide the first-party Resume Session Entry from the Native reusable Entry catalog while preserving its established canonical identifier.
  - Summary: First-party Native Entry for reconstructing available continuity before continuing.
  - Status: active/local

---

# Resume

## Entry Identity

- Name: Resume
- Version: 1
- Canonical Identifier: tiinex.core.entry.resume.v1
- Entry Family: tiinex.guided-entry.native.v1
- Human Label: Resume

## Purpose And Scope

- Purpose: Reconstruct the most relevant available continuity and distinguish verified grounding from uncertainty before continuation.
- In Scope: continuity recovery, current frontier recovery, return/dependency reconciliation, participant-facing resumption context
- Out Of Scope: inventing a continuation route, silently selecting a task, treating historical activity as current, or executing work before grounding is sufficient

## Entry Context

- Entry Target: the qualified carried context from which a receiving session may need to resume prior activity
- Required Context: qualified carrier and Workspace/material projection plus any explicitly selected Session Role or participants
- Relevant Context: current lineage leaves, explicit supersession, recent returns, dependencies, blockers, and implementation changes relevant to the Session Role
- Context Exclusions: historical or active-looking material does not establish current continuation by itself

## Preparation

- Preparation Method: reconstruct available continuity from qualified lineage and relevant current material before deciding what, if anything, should continue
- Reconciliation Policy: reconcile conflicting continuity claims, newer returns, supersession, dependencies, and implementation evidence where they can change the current frontier
- Discovery Breadth: follow continuity far enough across relevant Workspaces to avoid resuming a stale or superseded representation by convenience
- Currentness Policy: treat explicit current lineage, qualified supersession, latest relevant returns, and current implementation as evidence to reconcile; do not use arrival order or status labels as standalone precedence
- Uncertainty Policy: distinguish verified continuity from unresolved assumptions and keep unknown continuation state explicit

## Entry Method

- Method: present the reconstructed current continuity, material uncertainty, and the bounded next continuation choices before substantive work continues
- Readiness Boundary: continuation is grounded well enough that the receiving session is not relying on a known stale, superseded, contradictory, or authority-ambiguous frontier

## Presentation And Interaction

- Intended Audience: the Roles or people participating in the receiving interaction
- Presentation Guidance: lead with the current continuity picture and what materially changed; keep historical and diagnostic detail subordinate unless it affects the decision to continue
- Preference Sources: apply qualified presentation or communication preferences from participating Role material when available
- Diagnostic Detail Policy: do not foreground routine bootstrap or qualification success; surface it only when it affects confidence, currentness, or a continuation decision

## Interpretation Limits

- Does Not Establish: a Handoff Continue From route, recipient authority, Role-holder state, participant authority, acceptance, task ownership, work transfer, or completion
- Must Not Be Inferred: that any previously active task, trace, branch, or implementation remains current merely because it can be recovered

## Portability Notes

- Portable Semantics: reconstruct enough verified continuity to resume without silently relying on stale or invented context
- Environment Assumptions: access to the bounded continuity material needed to assess currentness
- Non-Portable Details: Tiinex carrier commands, host UI, model provider, filesystem paths, and transport controls

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: kf5qnNFykCu4AYDAje6Oe0fgDkMGhfxdOCXCpi8WUYc
