# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.schema.transition.companion.v1
  - Created At: 2026-09-30 00:00:00
  - Summary: Explicit Handoff schema Transition attachment projection.

---

# Handoff Schema Transition Companion

## Schema Binding

- Schema Reference: [tiinex.handoff.v1](tiinex.handoff.v1.schema.md)

## Transition Attachments

- bounded-work-handoff
  - Transition Reference: [Perform bounded work](.transitions/perform-bounded-work-handoff-transition-definition.trace.md)

- bounded-conversation-handoff
  - Transition Reference: [Open bounded conversation](.transitions/open-bounded-conversation-handoff-transition-definition.trace.md)

- bounded-review-handoff
  - Transition Reference: [Discuss or review](.transitions/discuss-review-handoff-transition-definition.trace.md)

## Interpretation Limits

- Does Not Mean: applicability, execution, recommendation, ordering, or recipient authority by itself
- Must Not Be Used To Claim: that any attached Handoff transition is appropriate for the current user intent without explicit selection

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: ms80laHsM8O7b3VL_6kl-voE5k7vwB2xPxpbS4s-w7g
