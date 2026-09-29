# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.question.v1](tiinex.question.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines question provenance so inquiries, prompts, review questions, validation questions, and decision questions can be preserved without hiding conversation flow inside application state or transcript context.
  - Summary: Human-first schema for bounded questions and their response boundaries.

---

# Question

## Summary

Defines a human-readable and machine-extractable question artifact.

A question artifact preserves the provenance of an inquiry. It may ask for information, clarification, validation, discovery, review, creation, decision support, or conditional evaluation. It does not itself answer the question, prove anything, or decide what schema an eventual response must use.

A response to a question may be a finding, evidence artifact, validation report, interpretation, attestation, task, relation, decision input, or another suitable artifact. The question records the response boundary; the response artifact owns its own semantics.

## Core Semantics

- A question records what was asked, by whom or from what context, why it was asked, and what kind of response would be within scope.
- A question may be created by a human, LLM, tool, process, review workflow, paper checklist, schema builder, validator, or conversation.
- A question may be used to preserve conversation flow without treating every answer as evidence or truth.
- A question may be linked to one or more response artifacts through relation, interpretation, validation, evidence, finding, task, or other appropriate schemas.
- A question does not by itself prove that any response is correct, complete, consented, authorized, or historically true.
- A question should keep question text, ask context, response boundary, state, and interpretation limits distinct.

## Schema Validation Contract

### Question Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.question.v1`

Rules

- `tiinex.question.v1` identifies artifacts whose main job is to preserve question provenance and response boundaries.
- A question artifact must keep the asked question distinct from any answer, result, evidence, finding, decision, or validation report.
- A question artifact may reference response artifacts, but those artifacts own their own semantics and claims.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Question Body

Required Shape

- first body heading after the continuity envelope
- `## Question Identity` section
- `## Asked By Or From` section
- `## Question Text` section
- `## Question Boundary` section
- `## Response Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Clarification State`
- `Related Artifacts`
- `Response Candidates`
- `Conversation Context`
- `Validation Binding`
- `Examples`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough for humans, tools, and LLMs to extract the question and its response boundary without guessing.
- A question may be open, answered, partially answered, superseded, withdrawn, deferred, unanswerable, or waiting for clarification.
- A question must not silently become the response to itself.

### Question Identity

Required Fields

- Question Name
- Question Type
- Question State
- Canonical Identifier

Optional Fields

- Short Label
- Supersedes
- Related Question

Allowed Labels

- information-request
- clarification-request
- validation-request
- discovery-request
- review-question
- creation-question
- decision-question
- conditional-question
- follow-up-question
- unknown

Rules

- `Question Name` should be stable enough for a human-readable list or review surface.
- `Question Type` should identify the role of the question without implying the schema of the answer.
- `Question State` should describe the lifecycle state of the question, not the truth of any answer.
- `Canonical Identifier` should be stable enough for relation, audit, and response references.

### Asked By Or From

Required Fields

- Asked By Or From
- Asked Context

Optional Fields

- Asked At
- Asked In
- Tool
- Party
- Source Material
- Interaction Unit
- Presentation Surface
- Conversation Segment

Rules

- `Asked By Or From` may reference a human, LLM, tool, process, checklist, schema module, validation method, interface, or artifact context when known.
- Unknown or unavailable ask context should be stated as unknown, not invented.
- Asking context does not by itself prove authority, consent, identity, or correctness.

### Question Text

Required Fields

- Question

Optional Fields

- Original Wording
- Normalized Wording
- Language
- Terms
- Assumptions

Rules

- `Question` must preserve the inquiry in human-readable form.
- `Original Wording` should be retained when wording itself matters for provenance.
- Normalization must not silently change scope, assumptions, or implied claims.

### Question Boundary

Required Fields

- Scope
- In Scope
- Out Of Scope

Optional Fields

- Time Window
- Target Artifacts
- Target Sources
- Required Context
- Unknowns
- Dependencies

Rules

- `Scope` must bound what the question asks for.
- `Out Of Scope` should state important claims or targets that the question does not ask about.
- A question may ask for evidence, validation, interpretation, or decision support, but it must not claim those outputs already exist.

### Response Boundary

Required Fields

- Expected Response Role
- Acceptable Response Types
- Response State

Optional Fields

- Response Artifacts
- Required Evidence
- Required Validation
- Follow-Up Question
- Rejected Responses

Allowed Labels

- open
- answered
- partially-answered
- superseded
- withdrawn
- deferred
- unanswerable
- needs-clarification
- unknown

Rules

- `Expected Response Role` should describe what would count as a response without forcing a single schema when multiple schemas may be appropriate.
- `Acceptable Response Types` may include finding, evidence, validation report, interpretation, attestation, task, relation, pointer, decision input, or another bounded artifact role.
- A response candidate must not be treated as evidence, validation, consent, authority, or truth unless its own schema and method support that claim.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Inferred

Optional Fields

- Remaining Unknowns
- Overclaim Risks
- Review Notes

Rules

- A question must not imply that an answer exists.
- A question must not imply that any answer is correct, complete, authorized, consented, or historically true.
- A question must not collapse conversation flow into evidence, validation, attestation, or decision without a separate supporting artifact.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.question.v1` artifact when the existence, wording, boundary, or lifecycle of a question needs to be preserved as provenance.
- Do not create a question artifact merely to restate a section heading, label, or UI prompt when no question provenance needs to travel outside the local implementation.

### Required Inputs

Required Fields

- Question
- Asked By Or From
- Scope
- Expected Response Role
- Interpretation Limits

Optional Fields

- Asked At
- Target Artifacts
- Source Material
- Conversation Context
- Response Candidates

Rules

- Missing ask context should be explicit as unknown.
- Expected response role should describe the kind of answer sought without converting the question into that answer.

### Generation Rules

Rules

- Preserve original wording when it affects meaning, accountability, or interpretation.
- Separate normalized wording from original wording.
- Link responses through explicit relation or response artifact references when available.
- Do not claim response completeness unless supported by a response artifact and method.

### Suggested Sequence

Rules

- Identify the question.
- Identify who or what asked it, or mark that context unknown.
- Bound the question scope and out-of-scope claims.
- State what kinds of response artifacts could answer it.
- State interpretation limits.
- Link any existing response artifacts without absorbing their semantics.

## Validation-Friendly Shape

A validator can check this schema family by looking for:

- continuity envelope with `Current Schema: tiinex.question.v1`
- required question body sections
- question identity fields
- ask context fields
- question text
- question boundary
- response boundary
- interpretation limits
- absence of response/evidence/validation claims inside the question artifact itself unless separately referenced

## Minimal Example

```md
# Continuity Context

- Current
  - Current Schema: [tiinex.question.v1](tiinex.question.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Summary: Question about whether a discovered source resolves a historical GitHub state.

---

# Can this portal resolve the source as it existed at the artifact timestamp?

## Question Identity

Question Name: Historical source-state resolution question
Question Type: validation-request
Question State: open
Canonical Identifier: question.github.portal-time-resolution.v1

## Asked By Or From

Asked By Or From: Tiinex/site audit workflow
Asked Context: Portal time validation during source discovery review

## Question Text

Question: Can this portal resolve the source as it existed at the artifact timestamp?

## Question Boundary

Scope: Determine whether the portal has enough source anchors to resolve a bounded historical source state.
In Scope: resolved source anchors, artifact timestamp, portal time boundary
Out Of Scope: truth of the source content, author identity, consent, complete repository history

## Response Boundary

Expected Response Role: validation finding or validation report entry
Acceptable Response Types: validation finding, validation report, interpretation
Response State: open

## Interpretation Limits

Does Not Prove: source truth, authorship, consent, or complete history
Must Not Be Inferred: that a current web view is historically complete
```

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: abwoxgfA6UWoAqYyFVkR9o8V0RCrQafVMF3IGFes_Po