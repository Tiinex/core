# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-14 21:13:57
  - Trace: [006-machine-derived-carrier-allocation-task.trace.md](../006-machine-derived-carrier-allocation-task.trace.md)
  - Origin:
    - [relative](../006-machine-derived-carrier-allocation-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-14 21:25:19
  - Authors: Loom
  - Why: Anchor delegated transport allocation derivation to Core and required executable regression Evidence.
  - Summary: Qualify dense non-Major carrier allocation from exact qualified Handoff Pointer topology without semantic sibling reservation.
  - Status: ready/local

---

# Machine-Derived Carrier Allocation Qualification

## Supported Claim Or Question

- Supported Claim Or Question: can shared Core derive dense ordinary non-Major carrier sibling allocation from exact qualified package-local Handoff Pointer topology, preserve explicit Major creation and collision safeguards, and avoid semantic sibling reservation prose
- Evidence Role: qualifies Loom's Core implementation and regression coverage for Machine-Derived Carrier Allocation

## Provenance

- Known Source: exact Core Workspace materialized from the qualified Anchor-to-Loom carrier after Start-qualified Tiinex bootstrap and explicit `Loom` consuming-session Role binding
- Controlling Task: `.topics/grounding/006-machine-derived-carrier-allocation-task.trace.md`
- Received Route: `.topics/grounding/handoffs/010-anchor-to-loom-machine-derived-carrier-allocation.trace.md`
- Preservation Basis: Core was the only mutated Workspace; Business remained read-only Required Context; no Docs mutation, remote source write, release, publication or deployment occurred
- Provenance Limits: Evidence covers only transport allocation mechanics, projections and deterministic tests plus the exact local parent-carrier proof below; it does not establish semantic Parent, Role, participant, process, source, acceptance or completion authority
- Transport Authority Boundary: only exact qualified parent carrier lineage, exact qualified Handoff Pointer topology and exact selected Pointer/route may derive a non-Major ordinal; filenames, chat/project instance numbers, artifact lineage numbers and cross-prefix observations are non-authoritative

## Evidence Material

- Material: patched portable carrier allocation, Handoff manufacture, recipient route projection, return-reservation preflight, common output/help text and executable regressions
- Material Kind: host-neutral Core implementation and deterministic tests
- Ordinary Return Allocation: one qualified selected parent Pointer derives sibling ordinal `1`, so a received child carrier continues with its own `-1` suffix without `--package-sibling-index`
- Parallel Allocation: qualified parent Pointer paths are ordered by their exact numeric package-local Pointer dimensions; selected route ordinal becomes the dense local sibling index `1..N`
- Prefix Independence: allocation consumes one exact parent carrier at a time and performs no global cross-prefix reservation or discovery
- Explicit Override Boundary: `--package-sibling-index` remains an advanced compatibility path when qualified route topology is unavailable; when topology proves an ordinal, a supplied override must match or manufacture fails closed
- Return Reservation Boundary: an outgoing semantic Handoff with `Signal Kind: return` no longer requires `--return-package-sibling-index`; absent explicit Major/legacy override, return allocation is deferred to the recipient's exact selected parent Pointer topology
- Ambiguity Boundary: invalid parent topology, unresolved Pointer order, conflicting selectors, missing selection for parallel routes or an explicit override conflicting with derived topology fail visibly instead of guessing
- Collision Boundary: exact output remains idempotent for byte-identical repetition and rejects divergent bytes at the same output path
- Manufacture Provenance: allocation result projects parent package path/SHA, parent dimension, exact selected Pointer and route id, local route ordinal, qualified route count and Pointer order; common manufacture output exposes this allocation separately from semantic Handoff authority
- Live Received-Carrier Proof: local patched Core inspected `/mnt/data/tiinex-core-001-1-1-1-1-anchor-to-loom.handoff-package.zip` as valid, parent dimension `001-1-1-1-1`, exact selected Pointer `001-4-1-1-1-handoff-pointer.trace.md`, exact selected route `handoff-route:core:.topics/grounding/handoffs/010-anchor-to-loom-machine-derived-carrier-allocation.trace.md`, one qualified route, derived ordinal `1`, child dimension `001-1-1-1-1-1`, explicit override `not-supplied`
- Focused Qualification: `node --test test/lineage-safety-hardening.test.mjs test/bounded-handoff-carrier.test.mjs test/minimal-carrier-material-transport-projection.test.mjs test/manufacture-hygiene.test.mjs` passed 25/25
- Full Core Regression: `npm test` passed 133/133 with 0 failures and 0 skips
- Portable Smoke: `npm run test:portable` passed with `portable node surface imports`
- Embedded Bootstrap Qualification: `npm run test:bootstrap` returned `embedded-qualified`, manifest SHA-256 `e4664b97c232dde1d3093d459b38ac20a99d126ec93f074bf80b8e5481d0877b`, representation SHA-256 `59aca5edbb013589f11059fe7e34ed22bd13d33b9c2fd5dc114e8aa7a3e0443d`, 505 runtime files and 5,578,188 runtime bytes

## Implementation Delta

- Modified: `src/tooling/portable/adapters/cli/cli.handoff-sibling-allocation.js`
- Modified: `src/tooling/portable/adapters/cli/cli.handoff-manufacture.js`
- Modified: `src/tooling/portable/adapters/cli/cli.common-output.js`
- Modified: `src/tooling/portable/adapters/cli/cli.help.js`
- Modified: `src/tooling/portable/adapters/node/handoff.manufacture.js`
- Modified: `src/tooling/portable/handoff/carrierLineage.js` behavior is reused unchanged for derived child dimensions and explicit Major separation
- Modified: `src/tooling/portable/handoff/delegationReturnReservation.js`
- Modified: `src/tooling/portable/handoff/recipientV2.inspect.projection.js`
- Modified: `src/tooling/portable/handoff/manufacture.js`
- Modified: `test/lineage-safety-hardening.test.mjs`

## Adversarial Regression Boundary

- Single Pointer Case: exact valid parent topology with one qualified Handoff Pointer derives sibling `1` and child suffix `-1` with no manual reservation
- Parallel Pointer Case: three qualified Pointers derive dense ordinals `1`, `2`, `3` from exact Pointer order independent of input array ordering
- Branch Return Case: `001-1` and `001-2` independently return as `001-1-1` and `001-2-1`; continued linear no-fan-out progression remains dense
- Prefix Independence Case: equivalent route topology in differently named carrier prefixes derives the same local ordinal without shared/global allocation state
- Override Match Case: explicit override equal to the proven route ordinal is accepted and reported as `matched-derived-value`
- Override Conflict Case: explicit override unequal to the proven route ordinal blocks with `explicit-sibling-index-conflicts-with-qualified-topology`
- Missing Parallel Selection Case: multiple qualified parent Pointers without an exact selected Pointer/route block instead of selecting heuristically
- Invalid Topology Case: a detected but invalid parent topology remains blocked even when an explicit sibling value is supplied
- Legacy Compatibility Case: the existing explicit local reservation mechanism remains available only when qualified parent route topology is unavailable
- Return Reservation Case: semantic return Handoff transport preflight qualifies with no sibling reservation; malformed explicit legacy override still blocks

## Preservation And Fidelity

- Preservation State: delegated Core machine-derived carrier allocation is implemented and locally qualified; semantic Handoff authority, holder binding, participant/process/source authority, grounded-to-act semantics, explicit Major creation, collision/idempotency, Recovery and bootstrap behavior remain preserved
- Known Losses: none in the delegated Core source surface; ordinary semantic/manual sibling reservation is intentionally no longer required when exact qualified Pointer topology deterministically proves allocation
- Fidelity Notes: carrier dimension remains a transport/human progress projection and is not promoted into artifact Parent or semantic lineage authority
- Allocation Fidelity: derived ordinal is local to one exact parent carrier's qualified Pointer order; no cross-prefix global next-slot discovery occurs
- Override Fidelity: explicit advanced override never silently supersedes deterministic topology
- Collision Fidelity: divergent-byte output protection remains unchanged
- Major Fidelity: `--package-major --major-reason` remains explicit and separate; chain length never causes a Major bump

## Interpretation Limits

- Not Yet Used As: semantic Parent, Workspace, Role, participant, process, source, acceptance, completion, publication, release or deployment authority
- Must Not Be Treated As: permission to infer sibling allocation from filenames alone, repository adjacency, chat/project numbering or observations of another carrier prefix
- Does Not Prove: any global allocator, semantic reservation contract or business-process completion state
- Must Not Be Used To Claim: authority to mutate Business or Docs, weaken exact output collision checks, infer Major checkpoints, or bypass qualified route selection when multiple Pointers exist

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [006-machine-derived-carrier-allocation-task.trace.md](../006-machine-derived-carrier-allocation-task.trace.md)
  - Value: OYgOPGisK-cO4LG8jL5myBD9og6_7CLT5Lw2Jn8-QzY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: _W0kv4wGC4alQmyCt4qexkG0_ggnDawaJsiAFsuyio4