# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-14 13:45:00
  - Trace: [001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Origin:
    - [relative](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 22:56:50
  - Authors: Anchor
  - Why: Grounded progression requires a fresh Role to recover correctly without a complete repository snapshot; current cache mechanics need an explicit adversarial acceptance pass.
  - Summary: Implement and validate fresh grounding from blank/minimal Workspace carriage plus qualified route-bounded cache and Role material.
  - Status: ready/local

---

# Blank-Workspace Role-Cache Grounding Mechanics

## Objective

Implement and adversarially qualify the portable Handoff mechanics needed for a fresh recipient to ground from an intentionally blank/minimal selected Workspace plus exact route-bounded cache and Role material, while preserving all existing semantic authority boundaries.

The package surface should support the intended ordering and random-access flow: Workspace representation, optional Workspace dependency cache, endpoint/participant Role pointers when semantically declared, then the selected Handoff Pointer. A cache is a byte/provenance provider only.

## Required Outcome

- Support manufacture/orientation/grounding where the selected Workspace contains no substantive repository/project source beyond its qualified Workspace contract and selected-route material is satisfied through exact cache dependencies.
- Preserve cache artifact/payload placement between the Workspace surface and Role-pointer/Handoff-pointer chain where cache material exists.
- Permit recipient Role material required for holder/boundary grounding to resolve from the qualified cache/material surface without turning carried Role material into semantic participation or durable holder identity.
- Consume only explicit upstream-qualified process/participant/source classifications; never infer them from cache membership, Role inventory or filenames.
- Preserve exact states for complete/bounded/blank/minimal/unavailable source and expose provenance sufficient for a fresh Role to understand what is material availability versus semantic authority.
- If a required process/adoption/relation or source-authority declaration is absent, project the exact unresolved/blocker state rather than scanning repositories or widening the cache.
- Ensure ordinary return allocation remains machine-derived and dense under this material shape.

## Adversarial Cases

At minimum cover:

1. blank/minimal selected Workspace + cache containing exact selected Handoff Parent/Required Context and recipient Role material -> route qualifies when semantic authority is otherwise complete;
2. same shape with nearby unselected Role/process material in cache -> no participant/process promotion;
3. required process material available in cache but no forward applicability declaration -> availability only / applicability unresolved;
4. explicit process authority chain carried by cache/Required Context -> applicability/requiredness projects exactly and no reverse scan is needed;
5. missing implementation-source authority -> remains unresolved despite writable host/workspace capability;
6. omitted sibling repository -> remains unavailable/unknown and is not reconstructed;
7. tampered, ambiguous or over-expanded cache material -> fail closed;
8. fresh cold-start and return manufacture work through the embedded bootstrap without manual sibling-index prose.

## Done Criteria

- Focused regression suite covers all adversarial cases above.
- Broad Core qualification, portable smoke and embedded-bootstrap qualification remain green.
- Grounding receipt clearly separates material/cache availability, recipient Role binding/authorization, process applicability, participant relevance and source authority.
- At least one manufactured acceptance carrier demonstrates a blank/minimal Workspace + cache/Role route reaching the correct bounded readiness state without complete-repository privilege.
- Evidence records exact remaining limitations, if any.
- Qualified Loom-to-Anchor return Handoff is manufactured.

## Scope

Shared Core portable Handoff/package/grounding mechanics and tests only.

## Dependencies

- controlling Business Task: Blank-Workspace Role-Cache Grounded Progression Hardening;
- accepted process-applicability semantics already represented in current Business/Core contracts;
- accepted bounded Workspace readiness, holder/source authority and machine-derived carrier allocation mechanics;

## Parallel Context

Axiom is working concurrently on the semantic acceptance contract. That return is not a prerequisite for Loom to execute the mechanical/adversarial work already authorized by accepted semantics. Loom proceeds in parallel and, if a test requires a semantic claim that is not already explicit, reports that exact unresolved input instead of inventing it.

## Boundaries

- No Business or Docs mutation.
- No new semantic process/participant schema in Core.
- No treating cache ordering or Role pointers as semantic authority.
- No broad source discovery or connector recovery.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md](business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md)
  - Value: f0iMMxJZ5jrOIRd7SjL14TG2K-HriaX17b7g784ItO0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: HLEmUI-XVhWhnEQlhCprghlyUTlEIEbeDoOwTDtMIv8