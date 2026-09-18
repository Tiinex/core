# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-16 20:10:03
  - Trace: [026-qualified-handoff-recipient-holder-projection-mechanics.trace.md](026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Origin:
    - [relative](026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:35:17
  - Authors: Anchor
  - Why: Axiom accepted the carrier projection contract and fresh grounding still exposes holder-binding and participant-pointer mechanics defects before specialist acceptance can be trusted.
  - Summary: Implement ancestor-complete bounded cache carrier projection, participant-first pointer order, participant-pointer grounding repair and no-manual-holder cold start without semantic leakage.
  - Status: ready/local

---

# Recipient Carrier Cache And Grounding Mechanics

## Objective

Implement the accepted carrier-lineage grounding projection for bounded external material while preserving the existing semantic owners and closing the remaining normal cold-start holder-binding gap needed for a fresh recipient to continue without Sigma re-grounding.

This Task is Core/Tooling implementation work. It must not reinterpret carrier lineage as source-artifact lineage or introduce a new cache semantic authority.

## Done Criteria

- Preserve and complete the existing qualified Handoff recipient holder projection work so a fresh selected Handoff whose exact recipient Role authorizes `handoff` can reach `grounded-to-act` without conversational acknowledgement or self-supplied `--holder-role`.
- Manufacture recipient-facing carrier topology as `Workspace -> [Cache] -> [qualified participant Role Pointer(s)] -> [From Role Pointer] -> [To Role Pointer] -> Handoff Pointer` for routes where those projections are qualified and needed.
- Omit Cache when the route closure is satisfied entirely by carried Workspace material.
- Build Cache only as one human-readable Workspace-scoped projection over qualified bounded external material; preserve Workspace Representation / External Payload ownership for scope, provenance, integrity and correlation.
- Select cache scope by exact dependency/continuation necessity, not artifact-type allowlists. One artifact, partial lineage, whole lineage or a deduplicated multi-route union are all possible only when qualified route dependencies require them.
- Support multiple Handoff route branches as siblings beneath one Workspace/Cache while keeping every selected route independently ancestor-complete.
- Verify that every mandatory pre-Handoff grounding projection for the selected route is reachable through that Handoff Pointer's own carrier-local ancestors. Mandatory sibling traversal, repository-global search or host-private indexes must fail closed.
- Participant Role Pointers may be projected only from explicit qualified forward selection. Cached Role inventory, endpoint status, sibling routes, reverse scans or package proximity must not create participation.
- `From` and `To` remain authoritative only from the Handoff. Pointer order is deterministic navigation/grounding projection and creates no semantic priority or authority.
- Preserve material availability versus applicability/current relevance in grounding output. Cached Process/Role/Decision/Relation presence alone must remain non-establishing until the qualified current-work chain selects it.
- Repair the current participant-pointer grounding crash (`recipientV2FactsIndex` missing import/path) so a qualified participant Role Pointer can be consumed by normal `ground` without bootstrap/runtime failure.
- Add deterministic coverage for: no-cache route; one bounded-cache route; two sibling routes sharing one cache; no participants; multiple participants; participant/endpoint overlap; missing/ambiguous/intentional omission; sibling-only recoverability; nearby unselected cached Role/Process material; and fresh Anchor/Loom holder binding without explicit holder input.
- Keep portable smoke, Core suite, manufacture/orient/ground qualification and embedded bootstrap qualification green.
- Produce exact qualification evidence and one Loom-to-Anchor return Handoff.

## Scope

Core portable Tooling grounding, recipient-v2 carrier manufacture/qualification, holder binding and focused tests only.

## Dependencies

- Docs `Carrier-Lineage Cache Grounding Closure Semantic Disposition` (accepted).
- Existing Core Task `Qualified Handoff Recipient Holder Projection Mechanics` remains an active dependency and retains its independent artifact lineage.
- Existing Handoff Package V1 / Workspace Representation / External Payload / Pointer / Role / Handoff owners.
- Current portable Tooling implementation and focused failing participant-pointer cold-start specimen.

## Boundaries

- No new Cache schema or semantic sidecar.
- No JSON/index/checksum/diff helper authority.
- No artifact-lineage rewrite to mirror carrier lineage.
- No Business, Docs, Site, VS Code, App or Verse implementation changes.
- No automatic widening of cache closure because an artifact has a familiar type.
- No inference of participant, process applicability, endpoint, holder, delegation or mutation authority from cache/package placement.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-qualified-handoff-recipient-holder-projection-mechanics.trace.md](026-qualified-handoff-recipient-holder-projection-mechanics.trace.md)
  - Value: 4Nnw4pc2qgr2vlt6JQ5PKlpdptJHXVzgh3IUjbyHGUA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qUmfFdL2S-deGs5deVJRIGQCLb8CpQ-1u8Xc85B7D_k