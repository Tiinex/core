# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 14:58:54
  - Trace: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Origin:
    - [relative](001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 16:24:45
  - Authors: Anchor
  - Why: Sigma's live VS Code gate reproduced the retained multi-Handoff Pack blocker at a host-owned carrier-lineage preflight seam; shared Core must expose the exact mechanical truth before the host can consume it safely.
  - Summary: Project exact multi-Handoff carrier continuation/allocation from shared Core so hosts stop reimplementing route/dimension inference.
  - Status: ready/local

---

# Multi-Handoff Carrier Allocation And Route Continuation Projection

## Objective

Remove host-owned carrier-lineage inference from the VS Code multi-Handoff Pack path by exposing one exact shared Core projection for ordinary outgoing carrier continuation/allocation from a qualified Incoming parent with one or more Handoff routes.

The live Sigma gate reproduced a blocker in the current VS Code host before shared manufacture: `the primary Handoff does not continue an exact qualified Handoff route in the selected Incoming carrier parent`. Current host code computes expected carrier dimensions by matching draft Parent paths against parent-carrier routes. This Task determines whether existing Core manufacture already owns enough route topology to eliminate that host inference, and if not, adds the smallest host-neutral projection required.

## Done Criteria

- Reproduce the exact live failure shape with a qualified Incoming parent containing multiple Handoff routes and an Outgoing set containing two attached Handoff pointers.
- Classify whether the current failure is entirely host-preflight drift, a missing shared Core allocation/projection primitive, or both. Preserve the distinction in qualification Evidence.
- Expose one host-neutral Core projection that reports the exact ordinary continuation/allocation state for a selected outgoing Handoff against the qualified package parent, including qualified, unresolved/selection-required, invalid-parent-route, and explicit-Major cases as needed by current contracts.
- The projection must derive from qualified carrier route topology and must not infer semantic Parent authority, recipient authority, participant authority, current work, or sibling identity from filenames/path adjacency.
- Preserve existing common-path rules: one selected Pointer derives `-1`; parallel qualified Pointers derive dense local ordinals in Pointer order; consolidation remains explicit and derives N+1 only from qualified common-frontier topology; different carrier prefixes remain independent.
- Ensure a host can submit multiple route inputs without reimplementing carrier-dimension math or rejecting a valid route solely because of host-local path matching.
- If existing manufacture already exposes the needed exact allocation truth, prefer projecting/consuming that truth over adding a second allocation engine.
- Add focused regressions for single-route ordinary continuation, multi-route sibling continuation, explicit Major continuation, invalid/non-parent route, ambiguous route selection, and no semantic-authority widening.
- Keep full Core tests, portable smoke and embedded bootstrap qualification green.
- Produce qualification Evidence and one Loom → Anchor return Handoff.

## Dependencies

- Current accepted Core frontier including qualified participant/session projection and existing carrier-lineage/manufacture mechanics.
- Existing known limitation recorded in Core Major-005/006 evidence: multi-Handoff Transport route projection remains unresolved.
- Sigma live VS Code feedback recorded in the current Extension VS Code Major: two Handoff pointers can trigger a pre-Pack parent-route blocker.

## Required Context

- Current Core Tooling source and carrier-lineage/manufacture contracts.
- Extension VS Code host evidence showing `expectedOutgoingCarrierDimension()` and its pre-Pack blocker are host-owned route/carrier inference today.
- Current Business Anchor orchestration boundary: shared mechanics belong in Core/Loom; host presentation remains in VS Code/Kodax.

## Scope

Core portable carrier allocation/route-continuation projection, manufacture-adjacent shared mechanics, focused tests and embedded bootstrap only.

## Exclusions

- No VS Code UI implementation.
- No new Handoff, Participant, Session or Meeting semantics.
- No change to artifact Parent lineage or filename semantics.
- No destructive cleanup, release publication, remote mutation or unrelated Tooling refactor.

## Acceptance Boundary

Loom owns shared mechanical classification/implementation and qualification. Anchor reconciles the return. Kodax consumes the resulting Core projection in the bounded host lane. Sigma replays the real multi-Handoff Pack flow as the final human gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-portable-tooling-and-allocation-discipline.trace.md](001-turn-2-portable-tooling-and-allocation-discipline.trace.md)
  - Value: WOMe5yr432wwydKlPQSPPZs95rGEXQrVoewCbGSt3iU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8igl95nT7n0RKsfgG7McJtSBOGNXi_Be4avwl76ENkk