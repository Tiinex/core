# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-19 11:48:46
  - Trace: [029-artifact-derived-semantic-participant-projection.trace.md](029-artifact-derived-semantic-participant-projection.trace.md)
  - Origin:
    - [relative](029-artifact-derived-semantic-participant-projection.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-20 10:53:14
  - Authors: Anchor
  - Why: Axiom's accepted multi-human semantic return requires a bounded shared projection before VS Code can safely expose participant and speaker UX.
  - Summary: Extend existing Core participant grounding to expose exact qualified/unresolved session, holder, participant and process dimensions for hosts without authority inference.
  - Status: ready/local

---

# Qualified Human Session And Participant Projection

## Objective

Extend the existing artifact-derived participant grounding mechanics only as required by the accepted Business/Axiom semantic reconciliation so shared Core can expose independent qualified/unresolved dimensions for Role identity, holder assignment/binding, semantic participant authority and process applicability without manufacturing authority from host/session state.

The existing participant projection remains the base. This Task is a bounded continuation, not a replacement or schema redesign.

## Done Criteria

- Preserve existing negative rule: Role/cache carriage, Handoff endpoint presence, holder binding, filenames, package placement, account/display identity, chat position and speaker labels do not create semantic participant authority.
- Expose participant/relevance state only from exact forward-qualified current-work/Handoff/Decision/process/Relation authority, preserving exact source provenance and unresolved/absent states.
- Keep Role identity, holder-assignment authorization, bounded session holder binding and semantic participant authority independently observable; no state silently implies another.
- Preserve Sigma `explicit-participation` as holder-assignment authorization only; Core must not treat a host speaker label or Role presence as the assignment occurrence.
- Expose applicable interaction/process authority independently using the existing forward process-applicability hook; process availability alone remains non-applicable.
- Define a host-neutral non-authoritative speaker-state boundary suitable for hosts to display/switch labels without Core promoting it into Party identity, Role holding or participation. If no shared transport field is mechanically necessary, keep speaker state outside semantic grounding rather than adding one by convenience.
- Project enough exact qualified/unresolved facts for VS Code to render semantic participant choices only when qualified and to render unresolved state otherwise.
- Add focused regressions for: qualified semantic participant + qualified Role/binding; qualified Role/binding without participant authority; participant authority with missing/mismatched Role material; speaker label only; process available but not applicable; qualified forward process applicability; and multiple bounded participants without order-derived authority.
- Keep full Core regression, portable smoke, embedded-bootstrap qualification and the existing carrier/grounding/delegation tests green.
- Produce exact qualification Evidence and one Loom → Anchor return Handoff.

## Dependencies

- Accepted Business controlling Major and Anchor semantic reconciliation.
- Axiom semantic return `business::.topics/processes/gpt/grounding/001-1-4-1-1-1-axiom-to-anchor-human-session-participant-and-meeting-semantic-r.trace.md`.
- Existing Core participant projection mechanics and accepted qualification/behavioral evidence from Task `029`.

## Required Context

- Business controlling Major and Anchor reconciliation: `business::.topics/processes/gpt/grounding/001-1-4-1-anchor-major-001-session-participant-and-operator-continuity-har.trace.md` and `business::.topics/processes/gpt/grounding/001-1-4-1-2-anchor-reconciliation-human-session-participant-and-meeting-sema.trace.md`.
- Axiom semantic return: `business::.topics/processes/gpt/grounding/001-1-4-1-1-1-axiom-to-anchor-human-session-participant-and-meeting-semantic-r.trace.md`.
- Existing Core Task `029-artifact-derived-semantic-participant-projection.trace.md` and its accepted qualification/behavioral evidence.

## Scope

Core grounding/capsule participant and process projections, exact provenance, host-neutral projection boundary, focused tests and embedded bootstrap only.

## Exclusions

- No VS Code UI implementation.
- No new Participant, Meeting, Conversation or Session semantic schema.
- No durable person identity inference or transcript provenance.
- No carrier-lineage, artifact-lineage or package filename semantic changes.
- No unrelated architecture cleanup or release publication.

## Acceptance Boundary

Loom qualifies shared mechanics only. Anchor reconciles the return; VS Code consumes the qualified projection in a later bounded host lane; Sigma remains the final real operator gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [029-artifact-derived-semantic-participant-projection.trace.md](029-artifact-derived-semantic-participant-projection.trace.md)
  - Value: 8eK0NzGgHL1X14bu7Qx4bNCv7h95ASEahUZ719SR2iQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ld1Xgb3nTtuZN38UcmhvsKeicvULt79qI-l1bNkysAc