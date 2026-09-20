# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 21:36:41
  - Trace: [028-2-pilot-sigma-positive-participant-behavioral-sanity-exact-partici.trace.md](028-2-pilot-sigma-positive-participant-behavioral-sanity-exact-partici.trace.md)
  - Origin:
    - [relative](028-2-pilot-sigma-positive-participant-behavioral-sanity-exact-partici.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 22:06:48
  - Authors: Pilot
  - Why: The real Pilot carrier carried a Sigma participant pointer while fresh Pilot correctly had no semantic participant authority, exposing a final semantic-to-transport coherence gap.
  - Summary: Require ordinary participant transport projection to derive from and exactly match qualified semantic participant authority.
  - Status: ready/local

---

# Semantic Participant To Carrier Projection Coherence

## Objective

Close the final positive-participant behavioral gap: ordinary Handoff manufacture must project participant Role pointers from exact qualified semantic participant authority, and explicit route-level participant Role input must never be able to create a transport participant pointer that is not backed by the same qualified semantic authority.

The repair must preserve the current intentionally closed participant-declaration grammar. If a Task does not establish semantic participation under that grammar, manufacture must not make the carrier appear semantically participant-qualified merely because a caller supplies `participantRoles`.

## Done Criteria

- Reproduce Evidence `041`: Task `028-2` does not establish Sigma semantic participation under the current closed declaration grammar, while the existing carrier can still contain a Sigma participant pointer supplied through route-level manufacture input.
- Ordinary manufacture derives the selected route's participant Role requirements from the exact qualified semantic participant authority of the controlling current-work artifact when that authority is established.
- A normal caller does not need to separately restate the same participant Role through route `participantRoles` merely to obtain participant pointers.
- If explicit route-level participant Role input is supplied, it must match the exact qualified semantic participant set for that route; extra, missing, ambiguous, mismatched, or unqualified Role input fails closed.
- If no semantic participant authority is established, requesting a participant Role pointer through ordinary manufacture fails closed rather than producing transport topology that only looks semantically qualified.
- Participant pointers remain grounding-only material and do not become participant authority themselves.
- Endpoint Roles remain non-participants absent separate explicit participant authority.
- The participant declaration parser/grammar is not broadened as part of this Task.
- Add a positive regression using a controlling Task whose participant declaration satisfies the current grammar and prove ordinary manufacture emits the exact participant pointer without separate participant route input.
- Add the exact negative regression for Task `028-2` / Handoff `069` proving manual route participant input cannot bypass missing semantic authority.
- Preserve negative carriage-only, endpoint-only, pointer-only, near-match prose, missing Role material, and ambiguity cases.
- Keep full Core regression, portable smoke, embedded-bootstrap qualification, carrier numbering, package-parent mechanics, and recipient Role grounding green.
- Produce exact qualification Evidence and one Loom-to-Anchor return Handoff.

## Scope

Core ordinary grounding-to-manufacture participant projection, route requirement qualification, participant transport input validation, focused regressions, and embedded bootstrap only.

## Dependencies

- Evidence `041-participant-semantic-to-transport-coherence-gap.trace.md` is the exact behavioral failure to reproduce.
- Task `029-artifact-derived-semantic-participant-projection.trace.md` remains the accepted semantic-participant authority owner.
- Task `030-selected-delegate-role-qualification-from-required-context.trace.md` remains accepted and must not regress.
- Task `028-2` and Handoff `069` are read-only negative regression specimens.
- Canonical Sigma Role material is read-only qualification material, not participant authority by itself.

## Boundaries

- No broadening or heuristic relaxation of participant declaration prose.
- No participant inference from Role/cache carriage, participant pointers, Handoff endpoints, filenames, package placement, user identity, chat identity, repository adjacency, or transport input alone.
- No Business or Docs semantic rewrite.
- No VS Code, Site, App, Verse, product, release, publication, or external-system work.
- No new participant registry, JSON authority sidecar, host-private database, or parallel semantic source of truth.
- No carrier/artifact-lineage collapse.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [028-2-pilot-sigma-positive-participant-behavioral-sanity-exact-partici.trace.md](028-2-pilot-sigma-positive-participant-behavioral-sanity-exact-partici.trace.md)
  - Value: S7iFCZ4TssmDmtqN1S_8zaawWm8fD6xLDDW0A90FktI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: WyewIrDiU84inyAHdsk9GxErL8afwtk4ZhRqBlFu7k4