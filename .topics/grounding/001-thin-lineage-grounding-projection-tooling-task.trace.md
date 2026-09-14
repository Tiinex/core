# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-14 13:45:00
  - Trace: [Thin-Lineage Anchor Grounding And Orchestration Reliability Epic](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 13:51:00
  - Authors: Anchor
  - Why: Fresh Anchor grounding currently depends too much on rich lineage/manual interpretation because portable Tooling does not cheaply project the participant/source/orchestration facts needed for competent first planning.
  - Summary: Audit and harden portable grounding projection and exact-source blockers without inventing semantics.
  - Status: ready/local

---

# Thin-Lineage Grounding Projection And Source-Blocker Tooling

## Objective

Make current qualified grounding facts cheap and fail-visible for a fresh Anchor: relevant participant/capability context when explicitly represented, source/material availability and authority boundaries, and enough orchestration-readiness evidence to avoid treating route authorization as whole-program understanding.

## Done Criteria

- Audit current portable `orient`, `ground`, recipient endpoint/participant projection, grounding-readiness and Workspace/cache/material-source behavior against the controlling Business Epic and current Docs authority.
- Identify why a qualified package can expose `from`/`to` endpoints while additional relevant participant context is absent from ordinary recipient projection, and implement a general projection only where current semantic authority already supplies an exact binding.
- Do not infer participants from all Role artifacts carried in Business, package adjacency, repository names, chat labels or transport filenames.
- Expose source/material state in a way a recipient can distinguish complete Workspace bytes, qualified bounded/cache material, explicit references/requirements and unavailable authoritative material without assuming Business is present.
- When required authoritative material is unavailable, surface a compact exact blocker/request contract suitable for Anchor/operator presentation; do not automatically select GitHub/connectors merely because host capability exists.
- Keep `grounded-to-act` bounded. If a wider orchestration-readiness projection can be derived from existing qualified facts, expose it as a projection/diagnostic rather than inventing a new semantic lifecycle state.
- Preserve pointerless package orientation behavior. The separately observed VS Code Transport inability to project a pointerless package is out of scope unless the shared Core contract itself is proven to be the blocker.
- Add focused adversarial qualification for false participant inference, Business-absent/cache-carried grounding, missing-authoritative-source blocker behavior and rich-lineage versus thin-lineage projection.
- Run the smallest focused checks during implementation and the appropriate broader Core portable/bootstrap gate before return.

## Parallel Semantic Boundary

Axiom is reviewing participant/source/Role semantics in parallel. Loom may implement mechanics that are already unambiguously supported by current authority. If a desired projection requires a new semantic predicate, participation rule or lifecycle meaning, return the exact blocker instead of encoding a private convention.

## Scope

Core portable/shared Tooling implementation, focused tests and bounded technical Evidence. Docs and Business are read-only authority/evidence inputs.

## Dependencies

- Current Core portable runtime and package/grounding implementation.
- Current Docs Role/Relation/Handoff/Workspace semantics as read-only authority.
- Current Business Epic and Role artifacts as read-only organizational authority.
- Parallel Axiom return when implementation exposes a semantic question not already answered by current authority.

## Exclusions

- No Business mutation.
- No canonical Docs semantic mutation.
- No Extension VS Code source mutation in this Task.
- No connector/network recovery automation.
- No broad unrelated package/Transport UX repair.

## Newly Observed Pointerless Recovery-Basis Gap

- Sigma's current latest snapshot is a pointerless 16-Workspace package that `orient` can qualify as Workspace material, but `audit-recovery-acceptance` rejects it as an accepted basis because it is not independently qualified as a Handoff package.
- A newly manufactured routed Recovery carrier qualifies and grounds cleanly against the current Anchor route, but the built-in Recovery acceptance audit therefore cannot compare it directly to that pointerless latest basis.
- Independent exact byte comparison against the pointerless snapshot shows no durable source removals or modifications: only the intended Business/Docs/Core artifact additions, plus manufacture-time omission of paths already excluded by the portable source-eligibility contract (`.release`, `.vscode/link`, `__pycache__`).
- Determine whether the shared recovery-audit path should support an explicitly qualified pointerless Workspace-package basis, project a more exact blocker/alternate basis contract, or remain Handoff-only. Do not weaken Handoff qualification merely to make the audit pass.

## Return Boundary

Return to Anchor with exact source diff, focused/full qualification, unresolved semantic dependencies, and a recommendation whether a separate host-specific Task is needed after shared Core behavior is qualified.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Thin-Lineage Anchor Grounding And Orchestration Reliability Epic](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Value: f0iMMxJZ5jrOIRd7SjL14TG2K-HriaX17b7g784ItO0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:DzpLz9RZ2HwtZErMpejasMiZlgd_syUbpyNWOeh0ppI
