# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.relation.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/relation/tiinex.relation.v1.schema.md)
  - Created At: 2026-10-04 04:08:00
  - Authors: Anchor
  - Why: Bind the exact session-grounding guidance selected by the acceptance Handoff to its controlling Core Task without inferring applicability from carriage or Required Context membership alone.
  - Summary: Explicit multi-target applicability relation for the readiness acceptance replay.
  - Status: ready/local

---

# Grounding Readiness Guidance Applicability

## Relation Declaration

- Relation Type: session grounding applicability bundle
- Relation Direction: selected guidance set -> bounded current work
- Relation Scope: Grounding And Continuity Readiness acceptance replay

## Relation Target

- Target: [Repair Formal Handoff Grounding And Recovery](002-repair-formal-handoff-grounding-and-recovery-task.trace.md)
  - Relation Type: applicability target
  - Relation Direction: selected session grounding guidance -> controlling Core Task
  - Relation Scope: current readiness acceptance work
- Target: [Portable Session Grounding And Continuity](native::.topics/.processes/session-grounding-and-continuity/001-session-grounding-and-continuity-process.trace.md)
  - Relation Type: selected portable guidance member
  - Relation Direction: applicability bundle -> portable process authority
  - Relation Scope: host-neutral session grounding and continuity
- Target: [Tiinex Session Grounding And Continuity Profile](business::.topics/processes/session-grounding-and-continuity/001-session-grounding-and-continuity-process.trace.md)
  - Relation Type: selected Tiinex guidance member
  - Relation Direction: applicability bundle -> Tiinex organizational profile
  - Relation Scope: Tiinex Anchor/Sigma readiness boundary
- Target: [ChatGPT Session Continuity And Source Discipline](interop-openai::.topics/.processes/chatgpt-session-continuity/001-chatgpt-session-continuity-and-source-discipline-process.trace.md)
  - Relation Type: selected host guidance member
  - Relation Direction: applicability bundle -> active host adaptation
  - Relation Scope: OpenAI/ChatGPT session target

## Relation Boundary

- The current Task and all three guidance targets must be exact qualified material forward-selected by the acceptance Handoff before this relation can establish current-scope applicability.
- Target co-membership is explicit relation authority; package carriage, Required Context membership alone, Role presence, filenames, or repository adjacency are not applicability.
- This relation does not establish active process execution, ownership, completion, acceptance, or remote-mutation authority.
- Filename dimension keeps this bounded artifact near the acceptance Handoff for navigation; it does not create Parent ancestry.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:uPUPJIvmyyhBJmmUyWWaxE1WbwujbD4QxMgDy4zoPek
