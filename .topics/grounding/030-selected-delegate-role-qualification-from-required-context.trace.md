# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-19 19:55:54
  - Trace: [038-fresh-anchor-delegate-role-required-context-qualification-gap.trace.md](evidence/038-fresh-anchor-delegate-role-required-context-qualification-gap.trace.md)
  - Origin:
    - [relative](evidence/038-fresh-anchor-delegate-role-required-context-qualification-gap.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 19:55:55
  - Authors: Anchor
  - Why: The real fresh Pilot/Sigma sanity preflight proved Task selection and participant authority are qualified while delegate Role resolution ignores exact Pilot Required Context material.
  - Summary: Qualify an already-selected specialist Role from exact bounded Required Context Role material without allowing Role carriage to select a delegate.
  - Status: ready/local

---

# Selected Delegate Role Qualification From Required Context

## Objective

Close the final real behavioral delegation gap exposed by the fresh Pilot/Sigma sanity preflight.

When an exact controlling Task has one qualified explicit specialist selector and the selected Role's exact canonical Role material is present as qualified Required Context on the selected Handoff, ordinary `ground` must qualify that already-selected Role for delegate/capability projection.

Required Context Role material may qualify a selector result; it must never create or choose a delegate by carriage alone.

## Done Criteria

- Reproduce Evidence `038` exactly: Task `028` selector resolves Pilot, Sigma participant map is qualified, exact Pilot Role Required Context is present, but `delegateRole` is currently null.
- Extend Core delegation artifact authority so the selected Role can resolve from exact route-bounded qualified Required Context Role material in addition to already-supported endpoint/grounding Role material.
- Preserve selector-first semantics: no Required Context Role is considered unless one exact qualified current-Task specialist selector already names that Role.
- Preserve fail-closed ambiguity: zero or multiple exact Role candidates for the selected label leaves delegate capability authority unresolved.
- Preserve non-selection boundaries: Role/cache/Required Context presence, participant pointers, endpoints, filenames, package adjacency, chat/user identity and repository scanning must not select a delegate.
- Preserve positive participant semantics independently: Sigma remains one semantic participant only because Task `028` explicitly declares Sigma; resolving Pilot Role from Required Context must not promote Pilot or Anchor to participant status.
- Add a physical ordinary-ground regression using the real Task `028` / Handoff `062` shape proving `delegateCapabilityAuthority.delegate.label = Pilot` and delegation readiness becomes qualified without manual participant JSON, holder input, endpoint insertion, package-parent repair or synthetic runtime authority input.
- Add negative regressions for selector absent, Required Context Pilot Role absent, near-match Role label, ambiguous duplicate exact Pilot Role material, and unrelated Role Required Context.
- Keep existing Axiom delegation, participant projection, return-recipient/common-path, carrier lineage, full Core regression, portable smoke and embedded-bootstrap qualification green.
- Produce exact qualification Evidence plus one Loom -> Anchor return Handoff.

## Scope

Core ordinary-ground delegation artifact authority, route-bounded Required Context Role qualification, focused regressions and embedded bootstrap only.

## Dependencies

- Evidence `038-fresh-anchor-delegate-role-required-context-qualification-gap` is the exact real behavioral failure.
- Task `028-positive-participant-projection-pilot-sigma-second-specialist-sanity` is the exact post-repair behavioral acceptance target.
- Handoff `062-anchor-to-anchor-positive-participant-repair-accepted-pilot-sanity` supplies exact Pilot and Sigma Role Required Context.
- Existing Core artifact-derived specialist selector semantics remain authoritative and must not be broadened.
- Existing Axiom Decision `020` participant boundary remains authoritative: Role material qualifies already-authorized semantics but does not create participation or selection by presence.

## Boundaries

- No Task `028` rewrite to fit Tooling.
- No Business Role rewrite.
- No participant-sidecar, delegate registry, JSON helper, host-private authority store or repository scan.
- No VS Code, Site, App, Verse or other product work.
- No carrier-lineage or artifact-Parent-lineage redesign.
- No Pilot/Sigma behavioral execution by Loom; Anchor retains that acceptance.

## Acceptance Boundary

This repair is accepted only when the real Task `028` ordinary-ground shape can qualify Pilot from its explicit selector plus exact Required Context Pilot Role material while all carriage-only selection cases remain fail-closed and the full Core qualification surface remains green.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [038-fresh-anchor-delegate-role-required-context-qualification-gap.trace.md](evidence/038-fresh-anchor-delegate-role-required-context-qualification-gap.trace.md)
  - Value: FiCF3UMuzPIr565MmVL-W66WCdR4sg76sM9VKPgT2FQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MOG9OVxnzrdNyryt0jQXNwo4KlmwKSFW-ccl5a_8uqw