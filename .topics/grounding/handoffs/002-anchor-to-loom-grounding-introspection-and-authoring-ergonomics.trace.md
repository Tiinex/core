# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 14:26:00
  - Trace: [Grounding Introspection And Authoring Ergonomics](../002-grounding-introspection-and-authoring-ergonomics-task.trace.md)
  - Origin:
    - [relative](../002-grounding-introspection-and-authoring-ergonomics-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-14 14:27:00
  - Authors: Anchor
  - Why: Reuse the now-grounded Loom specialist for a second bounded Core pass that reduces cold-grounding/tooling friction without widening semantics.
  - Summary: Delegate grounding explainability, provenance and authoring/preflight ergonomics to Loom while process applicability remains semantically bounded by Axiom/Anchor.
  - Status: ready/local

---

# Anchor To Loom — Grounding Introspection And Authoring Ergonomics

## Handoff Parties

- Purpose: reduce fresh-role grounding and return-authoring friction in shared Core without converting carried information into semantic authority.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Thin-Lineage Orchestration Discipline Continuation](business::.topics/roles/001-1-1-1-1-anchor-thin-lineage-orchestration-discipline-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- grounding-explainability-and-provenance
  - Transfer Kind: work-and-responsibility
  - Description: expose compact qualified explanations/provenance for holder, route authority, source state, participant facts and bounded-vs-orchestration readiness.
  - Controlling Artifact: [Grounding Introspection And Authoring Ergonomics](../002-grounding-introspection-and-authoring-ergonomics-task.trace.md)
  - Boundary: explanation may expose authority; it may not create it.

- authoring-and-manufacture-ergonomics
  - Transfer Kind: work-and-responsibility
  - Description: make known schema/Parent/Required Context failures actionable earlier while preserving fail-closed validation/manufacture behavior.
  - Controlling Artifact: [Grounding Introspection And Authoring Ergonomics](../002-grounding-introspection-and-authoring-ergonomics-task.trace.md)
  - Boundary: no relaxation of qualification or closure requirements.

- process-projection-boundary
  - Transfer Kind: work
  - Description: keep process applicability unresolved unless explicit current authority already declares it; prepare only semantics-neutral consumption/provenance mechanics if justified.
  - Controlling Artifact: [Grounding Introspection And Authoring Ergonomics](../002-grounding-introspection-and-authoring-ergonomics-task.trace.md)
  - Boundary: Axiom/Docs owns any semantic rule for process applicability.

## Required Context

- core-workspace
  - Material: current integrated Core Workspace containing Loom's first-return implementation, tests and Evidence.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: writable exact implementation basis.
  - Availability: available

- docs-workspace
  - Material: current integrated Docs Workspace containing Axiom's first semantic disposition and current schema/Role/Relation/Handoff authority.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: read-only semantic boundary; Core must not define meaning by implementation convenience.
  - Availability: available

- business-workspace
  - Material: current integrated Business Workspace containing the controlling Epic, Anchor Role continuation, process lineages and second-tranche integration Task.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: read-only organization/process evidence and retained-owner boundary.
  - Availability: available

## Reference Context

- prior-loom-evidence
  - Material: first fresh Loom thin-lineage grounding projection qualification Evidence.
  - Material Reference: [Thin-Lineage Grounding Projection Tooling Qualification](../evidence/001-thin-lineage-grounding-projection-tooling-qualification.trace.md)
  - Purpose: accepted implementation/test baseline and remaining semantic blocker.
  - Availability: available

## Retained Responsibilities

- process-semantics
  - Retained By: Axiom / Docs / Anchor
  - Responsibility: define/select any authoritative process-applicability relation or declaration pattern.
  - Boundary: Loom returns unresolved semantic dependency rather than inventing one.

- business-integration-and-recovery
  - Retained By: Anchor
  - Responsibility: reconcile Axiom/Loom returns, mutate Business, perform full recovery and open later blind validation.
  - Boundary: Loom remains Core-local.

## Exclusions And Dependencies

- no-semantic-invention
  - Kind: excluded-scope
  - Description: do not infer participant or process relevance from Role/process carriage, endpoints, chat labels, filenames, folders or repository inventory.
  - Responsible Party Or Role: Axiom/Anchor for semantics; Loom for preserving the boundary.

- no-host-mutation-by-default
  - Kind: excluded-scope
  - Description: do not mutate Extension VS Code or another host unless a qualified shared-Core blocker proves host-specific work is required.
  - Responsible Party Or Role: Anchor / later host owner if separately delegated.

## Completion Expectation

- Signal Kind: none
- Signal Meaning: return a qualified Core implementation/test/Evidence result plus exact unresolved semantic blockers and a Loom-to-Anchor Handoff.

## Interpretation Limits

- Does Not Mean: explanation/provenance creates authority, grounded-to-act becomes global readiness, process inventory becomes applicability, or Core owns Business/Docs semantics.
- Must Not Be Used To Claim: publication/release authority, remote acquisition authority, host-specific completion or semantic acceptance outside the delegated Core lane.
- Authority Limits: host-neutral Core introspection/projection/authoring/manufacture ergonomics and deterministic local qualification only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Grounding Introspection And Authoring Ergonomics](../002-grounding-introspection-and-authoring-ergonomics-task.trace.md)
  - Value: Mmiu5NfSdIfaOUrcIODFTCTFDrNL1JlEpYeNYu8rzr4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:B-Nijgzy05lQZb4wyf3Z0kHLoi1nukoQeijYVP224ms
