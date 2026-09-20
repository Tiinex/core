# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-19 11:48:45
  - Trace: [035-positive-participant-artifact-projection-gap.trace.md](evidence/035-positive-participant-artifact-projection-gap.trace.md)
  - Origin:
    - [relative](evidence/035-positive-participant-artifact-projection-gap.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 11:48:46
  - Authors: Anchor
  - Why: Second-specialist preflight exposed the last Tooling-first participant gap before succession.
  - Summary: Make ordinary grounding derive positive semantic participants from explicit qualified current-work declarations plus exact Role authority while preserving Role-carriage non-participation.
  - Status: ready/local

---

# Artifact-Derived Semantic Participant Projection

## Objective

Close the final known positive-participant grounding gap before succession: ordinary `ground` must be able to derive a bounded semantic participant map from an explicit qualified current-work participant declaration plus exact qualified Role authority, without inferring participation from Role/cache carriage, participant Role pointers, Handoff endpoints, filenames, transport or chat identity.

The implementation must preserve the accepted negative semantic rule: package/cache Role presence by itself never establishes participant membership.

## Done Criteria

- Reproduce Evidence `035`: Task/Handoff/current work and exact Sigma Role material qualify, but ordinary `ground` currently reports `participant-map-not-established` unless participants are supplied as separate runtime input.
- Define one narrow, human-readable, machine-qualifiable current-work declaration for positive Role participation. Prefer a closed declaration pattern comparable to the existing explicit specialist selector rather than open prose interpretation.
- Project a semantic participant only when exactly one qualified declaration identifies the Role and exact qualified Role material for that declared Role is available through the selected route's bounded authority/material closure.
- Preserve provenance to both the exact participant declaration source artifact and exact Role source artifact.
- Ordinary public `ground` must expose `participantMapState = explicit-bounded-map` and the exact semantic participant when that authority qualifies; no separate manual participants JSON is required on the normal path.
- Package Role grounding pointers remain grounding-only transport/material evidence. Their presence without an explicit semantic declaration must continue to produce no semantic participant.
- Handoff endpoint Role material remains endpoint/holder authority only and must not become participation by presence.
- Role Required Context/cache material without an explicit participant declaration must produce no semantic participant.
- An explicit participant declaration whose exact Role material is missing, ambiguous, or mismatched must fail closed or remain unresolved; do not select from Role inventory, labels, user identity, chat identity, filenames or proximity.
- Support more than one bounded explicit participant declaration without making order or package placement semantic authority; preserve deterministic bounded cardinality.
- Add focused positive coverage using Sigma and negative coverage for: Role-only carriage, grounding pointer only, endpoint-only, declaration with missing Role material, and near-match/free-prose declarations.
- Keep Axiom Decision `020` semantics intact: positive authority comes from the declaration; Role material qualifies the declared Role; carriage alone does not create the declaration.
- Keep full Core regression, portable smoke, embedded-bootstrap qualification, existing delegation/common-path/carrier tests and participant-negative tests green.
- Produce exact qualification Evidence and one Loom -> Anchor return Handoff.

## Scope

Core ordinary grounding authority projection, current-work participant declaration parsing/qualification, exact Role material binding for semantic participants, participant-context projection, focused regressions and embedded bootstrap only.

## Dependencies

- Evidence `035-positive-participant-artifact-projection-gap.trace.md` is the exact reproduction.
- Axiom Decision `docs::.topics/grounding/020-axiom-decision-participant-authority-from-role-cache-presence.trace.md` is accepted semantic input and must not be weakened.
- Existing `participantRoles` carrier requirements remain grounding-only material transport.
- Existing explicit specialist-selector parser is a useful bounded-pattern precedent but is not automatically participant authority.

## Boundaries

- No IDE/VS Code participant semantics.
- No new JSON sidecar, participant database, checksum/index helper, or host-private authority store.
- No participant inference from user/chat identity or package delivery.
- No change to carrier lineage or artifact Parent lineage semantics.
- No Business/Docs historical artifact rewrite.
- No Site, App, Verse or unrelated product work.

## Acceptance Boundary

The repair is accepted only when ordinary artifact-derived grounding can truthfully establish a positive semantic participant map from explicit current-work authority while all Role-carriage-only cases remain non-participant and fail closed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [035-positive-participant-artifact-projection-gap.trace.md](evidence/035-positive-participant-artifact-projection-gap.trace.md)
  - Value: mVcbvo0RXX1X-kc197EWPn3apVJ7yA68E7SZMSQwPyw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 8eK0NzGgHL1X14bu7Qx4bNCv7h95ASEahUZ719SR2iQ