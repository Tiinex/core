# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 18:30:25
  - Trace: [005-holder-binding-authorization-gate-task.trace.md](005-holder-binding-authorization-gate-task.trace.md)
  - Origin:
    - [relative](005-holder-binding-authorization-gate-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 21:13:57
  - Authors: Anchor
  - Why: Operator carrier topology is pointer-order-derived and dense per prefix; requiring roles to invent or receive sibling indices in semantic prose destroys observability and exposes a transport-tooling gap.
  - Summary: Derive dense non-Major carrier sibling allocation from qualified package-local Handoff Pointer topology instead of manual recipient reservation.
  - Status: ready/local

---

# Machine-Derived Carrier Allocation

## Objective

Remove ordinary return/delegation carrier sibling allocation from recipient prose and manual coordination when qualified package topology already determines the allocation. Carrier dimensions must remain dense and operator-readable within one prefix/discriminator family.

## Accepted Transport Contract

The controlling operator model is:

- carrier prefix/discriminator families are independent; sibling allocation is never globally coordinated across different prefixes;
- within one prefix, sibling ordinals are dense: no empty indices are intentionally reserved;
- when one parent carrier exposes multiple qualified Handoff Pointer routes, each outgoing child allocation is determined by that route's qualified pointer order/ordinal within that parent carrier;
- when a received child carrier has one return route, its ordinary return continues that branch by appending `-1` rather than requiring the recipient to invent or read a sibling number from semantic Handoff text;
- a linear no-fan-out progression may therefore naturally become `001-1-1-1-...` until the Carrier Major's value is complete;
- fan-out within one prefix is operator-readable as e.g. `001-1` / `001-1-1`, `001-2` / `001-2-1`, followed by a dense next sibling such as `001-3` for reconciliation;
- Carrier Major, carrier sibling ordinals and artifact-lineage numbering are distinct concepts;
- package/project/chat instance numbers are unrelated to carrier topology.

## Required Outcome

- Make the normal manufacture path derive the non-Major carrier allocation from qualified package-local route/pointer topology whenever that topology is deterministic.
- A recipient returning one qualified selected route must not need a prose reservation or operator-supplied sibling index merely to append the ordinary return continuation.
- For parent carriers with multiple qualified outgoing Handoff Pointers, derive each child's sibling ordinal from the selected Pointer's qualified order within that parent carrier.
- Keep allocation independent per carrier prefix/discriminator; do not coordinate sibling ordinals across `business-*`, `docs-*`, `tiinex-core-*`, or other prefixes.
- Preserve dense numbering and fail visibly if qualified topology is ambiguous, contradictory, or cannot deterministically establish the allocation.
- Preserve explicit Carrier Major creation as a distinct operation; do not infer a Major bump from chain length.
- Preserve an explicit advanced/manual override only where genuinely required; if supplied, validate it against deterministic topology when topology already proves the expected value, and fail on conflict rather than silently producing a gap.
- Do not encode expected sibling numbers in semantic Task/Handoff markdown as a normal workflow requirement.
- Project enough provenance in manufacture output to explain which parent carrier, selected route/pointer and ordinal produced the derived carrier dimension.

## Scope

Shared portable Core carrier/handoff manufacture, route-pointer projection and regression tests only.

## Dependencies

- controlling Business Epic: `business::.topics/initiatives/001-2-7-thin-lineage-anchor-grounding-orchestration-epic.trace.md`;
- accepted operator clarification that sibling allocation is dense and pointer-order-derived within the same prefix;
- existing qualified package route/pointer topology and carrier-lineage projection;
- current handoff manufacture collision/idempotency safeguards.

## Boundaries

- Do not mutate Business or Docs.
- Do not change semantic Handoff authority, holder binding, participant/process/source authority, or `grounded-to-act` semantics.
- Do not infer allocation across different carrier prefixes.
- Do not treat artifact lineage or ChatGPT project instance numbers as carrier allocation authority.
- Do not weaken divergent-byte collision protection or deterministic transport integrity.
- Do not make a missing semantic Handoff field carry transport allocation data.

## Required Tests

- one selected pointer / ordinary return derives child suffix `-1` without manual sibling input;
- two or more parallel pointer routes derive dense sibling ordinals from their qualified pointer order;
- each parallel branch's return appends its own `-1` continuation;
- different prefixes allocate independently;
- linear no-fan-out continuation remains dense without forcing a Major bump;
- explicit override matching a deterministically derived value is accepted or treated idempotently; conflicting override fails closed;
- ambiguous/unqualified pointer ordering fails visibly rather than guessing;
- existing carrier collision, idempotency, recovery and bootstrap tests remain green.

## Done Criteria

- common-path `handoff` manufacture no longer requires `--package-sibling-index` or `--return-package-sibling-index` when qualified route topology deterministically establishes the non-Major allocation;
- manufacture receipt exposes the derivation/provenance of the allocation;
- broad Core qualification, portable smoke and embedded bootstrap qualification remain green;
- Evidence records exact transport-only boundaries;
- qualified Loom-to-Anchor return Handoff is manufactured using the new machine-derived ordinary return allocation, without a sibling index written into semantic Handoff prose.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [005-holder-binding-authorization-gate-task.trace.md](005-holder-binding-authorization-gate-task.trace.md)
  - Value: 2MuBKyYw-7p-LUSsNs7zKAubbanutpYol0_VeOAeOTY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: OYgOPGisK-cO4LG8jL5myBD9og6_7CLT5Lw2Jn8-QzY