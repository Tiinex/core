# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 11:35:17
  - Trace: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Origin:
    - [relative](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-17 23:08:50
  - Authors: Anchor
  - Why: The fresh Axiom semantic review succeeded, but its return carrier omitted exact Anchor Role material and left the end-to-end grounding loop incomplete.
  - Summary: Repair return-carrier recipient Role material closure so fresh specialist-to-Anchor returns ground through the exact selected Handoff without manual holder input or participation leakage.
  - Status: ready/local

---

# Return Recipient Role Closure Symmetry Mechanics

## Objective

Close the remaining end-to-end grounding asymmetry exposed by the fresh Axiom acceptance run: a specialist return Handoff may correctly name a Role recipient while the manufactured return carrier omits the exact qualified recipient Role material needed for selected-Handoff holder assignment, leaving a fresh recipient unable to reach `grounded-to-act` without manual re-grounding.

This is a narrow continuation of Core Task `026-1`. The repair must preserve the accepted semantic boundary that Role/cache availability is grounding material only and does not by itself establish semantic participant membership.

## Done Criteria

- Reproduce the exact fresh Axiom-to-Anchor return failure recorded by Evidence `025`: selected Handoff `Axiom -> Anchor`, exact semantic result carried, root continuity qualified, but recipient Anchor Role assignment-mode authority unavailable from package material.
- Identify the manufacture/projection path that carries endpoint Role material for outbound specialist assignment but omits the required recipient Role grounding closure on specialist returns.
- Ensure a selected Handoff whose recipient is a qualified Role carries the exact bounded recipient Role material required to resolve that Role and its canonical assignment modes when the source Workspace is outside the carried multi-Workspace scope.
- Preserve Handoff authority: `From` and `To` come only from the exact Handoff; cached Role material and endpoint pointers provide grounding/material resolution only.
- Preserve participation separation: recipient Role carriage, endpoint pointer placement, and holder assignment evidence must not create semantic participant membership, generic delegation authority, process applicability, source authority, or mutation authority.
- Preserve current participant-first carrier topology where qualified: `Workspace -> [Cache] -> [participant Role Pointer(s)] -> From Role Pointer -> To Role Pointer -> Handoff Pointer`.
- Preserve ancestor-only reachability for mandatory selected-route grounding material and the repaired external Parent-to-root closure from Task `026-1-2`.
- Add deterministic positive coverage for fresh `Anchor -> Axiom -> Anchor` roundtrip where both the specialist and the fresh return recipient reach `grounded-to-act` through selected-Handoff consumption without `--holder-role`.
- Add negative coverage proving that removing the exact return recipient Role material blocks fresh recipient holder binding rather than falling back to provider/chat identity, endpoint labels, filenames, package proximity, or Role inventory.
- Preserve route-ordinal carrier numbering, prefix preservation, N+1 consolidation mechanics, explicit Major semantics, and separation between carrier lineage and artifact Parent lineage.
- Keep focused grounding/cache tests, full Core regression, portable smoke, embedded-bootstrap qualification, manufacture/orient/ground roundtrip and existing cache/participant regressions green.
- Produce exact qualification Evidence and one Loom-to-Anchor return Handoff.

## Scope

Core portable Tooling recipient-v2 material closure, endpoint Role projection, selected-Handoff holder binding, manufacture/grounding regressions, and embedded bootstrap only.

## Dependencies

- Core Evidence `025-fresh-axiom-return-recipient-role-closure-failure.trace.md` is the exact black-box acceptance failure to reproduce.
- Core Task `026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md` remains the controlling parent mechanics frontier.
- Core Task `026-1-2-external-parent-closure-to-qualified-root-mechanics.trace.md` and Evidence `024` remain qualified dependencies and must not regress.
- Docs Decision `013-axiom-semantic-decision-role-cache-participation-proposition.trace.md` is accepted semantic input: Role/cache presence alone does not establish semantic participant membership.
- Existing Handoff Package / Workspace Representation / bounded cache / Role / Pointer / Handoff owners remain authoritative for their semantics.

## Boundaries

- No new Cache schema, participant schema, endpoint schema, JSON sidecar, checksum/index helper, diff dump, or host-private grounding database.
- No automatic full-Workspace widening merely because a recipient Role is external; carry only the exact bounded qualified material required for the selected route.
- No inference of participation from Role carriage or endpoint pointer placement.
- No artifact-lineage rewrite to mirror carrier lineage.
- No Business, Docs, Site, VS Code, App or Verse implementation changes.
- No weakening of fail-closed holder binding, Parent closure, source selection, or carrier numbering to make the acceptance specimen pass.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md](026-1-recipient-carrier-cache-and-grounding-mechanics.trace.md)
  - Value: qUmfFdL2S-deGs5deVJRIGQCLb8CpQ-1u8Xc85B7D_k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: pa0YSqkuvsGX5P0GsBR-xFEVMMIApwe3WfYi1k29SYw