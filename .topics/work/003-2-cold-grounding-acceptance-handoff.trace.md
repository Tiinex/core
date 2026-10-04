# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-04 15:58:41
  - Trace: [003-cold-grounding-acceptance-task.trace.md](003-cold-grounding-acceptance-task.trace.md)
  - Origin:
    - [relative](003-cold-grounding-acceptance-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-10-04 16:01:35
  - Authors: Anchor
  - Why: Measure grounding from qualified carried state without conversational reconstruction, implementation coaching, or mutation.
  - Summary: Blind read-only Anchor-to-Anchor transfer for cold grounding acceptance before Sigma disposition.
  - Status: ready/local

---

# Cold Grounding Acceptance Handoff

## Handoff Parties

- Purpose: transfer one bounded read-only cold-start grounding acceptance to a fresh Anchor without conversational reconstruction or implementation coaching
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
- Notes: acceptance observation only; this transfer does not authorize implementation repair, mutation, publication, release, or an acceptance claim

## Transfers

- cold-grounding-acceptance
  - Transfer Kind: work-and-responsibility
  - Description: establish a qualified orientation from the supplied carrier and Tooling surfaces, then report the recipient's own understanding of current bounded work, authority boundary, unresolved state, source sufficiency, and intended next action
  - Controlling Artifact: [Cold Grounding Acceptance](003-cold-grounding-acceptance-task.trace.md)
  - Boundary: read-only blind acceptance; do not repair, patch tests, mutate source, manufacture a replacement implementation checkpoint, or use conversational history outside the supplied carrier

## Required Context

- current-core-workspace
  - Material: exact current Core Workspace carried by this acceptance package
  - Material Reference: [Core Workspace](../.workspaces/tiinex-core.workspace.md)
  - Purpose: current bounded work and portable Tooling runtime
  - Availability: available

- grounding-guidance-applicability
  - Material: explicit Relation selecting the applicable grounding guidance for this acceptance Task
  - Material Reference: [Cold Grounding Acceptance Guidance Applicability](003-1-cold-grounding-acceptance-guidance-applicability-relation.trace.md)
  - Purpose: exact current-scope applicability authority; carriage or Required Context membership alone does not establish applicability
  - Availability: available

- portable-grounding-process
  - Material: portable Session Grounding And Continuity process
  - Material Reference: [Portable grounding process](native::.topics/.processes/session-grounding-and-continuity/001-session-grounding-and-continuity-process.trace.md)
  - Purpose: host-neutral cold-start grounding and continuity discipline
  - Availability: available

- tiinex-grounding-profile
  - Material: Tiinex Session Grounding And Continuity Profile
  - Material Reference: [Tiinex grounding profile](business::.topics/processes/session-grounding-and-continuity/001-session-grounding-and-continuity-process.trace.md)
  - Purpose: Tiinex-specific Anchor/Sigma readiness and organizational boundary
  - Availability: available

- chatgpt-host-adaptation
  - Material: ChatGPT Session Continuity And Source Discipline process
  - Material Reference: [ChatGPT continuity process](interop-openai::.topics/.processes/chatgpt-session-continuity/001-chatgpt-session-continuity-and-source-discipline-process.trace.md)
  - Purpose: current-host transport and source discipline
  - Availability: available

- anchor-role
  - Material: canonical Anchor Role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-1-1-1-1-anchor-canonical-holder-cutover-role.trace.md)
  - Purpose: recipient authority and responsibility boundary
  - Availability: available

## Reference Context

- readiness-project
  - Material: Grounding And Continuity Readiness Project
  - Material Reference: [Readiness Project](https://github.com/Tiinex/business/blob/9fc62b5fa91aab00731d4a4f67ac53f495ece38d/.topics/initiatives/007-grounding-and-continuity-readiness-project.trace.md)
  - Purpose: immutable organizational ancestry for this bounded acceptance
  - Availability: available

## Retained Responsibilities

- sigma-human-acceptance
  - Retained By: Sigma
  - Responsibility: preserve the recipient's first substantive result before feedback, run the later non-leading retrospective, and make the final human acceptance or rejection disposition
  - Boundary: Sigma is not hidden grounding memory and must not coach the recipient before the first result is frozen

## Exclusions And Dependencies

- implementation-mutation
  - Kind: excluded-scope
  - Description: implementation repair, source edits, test patches, schema/process changes, and other mutation are outside this acceptance transfer
  - Responsible Party Or Role: Anchor only under a later separately authorized Task

- remote-mutation
  - Kind: excluded-scope
  - Description: commit, push, publication, release, deployment, provider mutation, and other remote writes are not authorized
  - Responsible Party Or Role: Sigma or separately authorized operator after acceptance

- specialist-delegation
  - Kind: excluded-scope
  - Description: specialist delegation remains outside this blind acceptance run
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return the cold recipient's own read-only grounding/orientation assessment for human review
- Return To: Sigma
- Notes: the first substantive result must exist before evaluator feedback or retrospective questioning; this result does not itself establish implementation acceptance or Task closure

## Interpretation Limits

- Does Not Mean: implementation correctness is pre-established, all sources must be read, a particular answer is expected, the recipient should repair anything it discovers, or Sigma has accepted the implementation
- Must Not Be Used To Claim: completion, Task closure, stable-major status, remote-write authority, publication/release readiness, or specialist delegation readiness
- Authority Limits: each carried artifact retains its own semantics; this Handoff transfers only the bounded read-only acceptance work described above
- Transport Limits: only the carrier and exact Tooling-generated transport text are recipient bootstrap inputs; no hand-written transport summary or hidden evaluator hints are part of the transfer

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [003-cold-grounding-acceptance-task.trace.md](003-cold-grounding-acceptance-task.trace.md)
  - Value: 9WQM0EdDrbFvt7Y-xkqFcTLyVGK1LaBkpRKdVlicHpI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3nX6_SpeM3iQ84-imWnpcsMA8I6ZNcQRv7d2N6uKPsM