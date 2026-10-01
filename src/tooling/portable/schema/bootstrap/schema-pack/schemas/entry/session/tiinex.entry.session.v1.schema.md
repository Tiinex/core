# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.entry.v1](../tiinex.entry.v1.schema.md)
  - Created At: 2026-10-01 00:00:00
  - Trace: [tiinex.entry.v1.schema.md](../tiinex.entry.v1.schema.md)
  - Origin:
    - [relative](../tiinex.entry.v1.schema.md)
- Current
  - Current Schema: [tiinex.entry.session.v1](tiinex.entry.session.v1.schema.md)
  - Created At: 2026-10-01 00:00:00
  - Summary: Entry specialization for beginning, resuming, or initially orienting within a bounded session while preserving explicit grounding obligations.

---

# Session Entry

- Status: draft schema note

## Summary

This schema specializes `tiinex.entry.v1` for reusable ways of entering a bounded session.

A Session Entry describes how a session should begin, resume, or become sufficiently oriented to proceed. The session may involve one actor or many actors and may be conversational, physical, organizational, creative, scientific, operational, digital, or mixed. Session Entry semantics do not assume software, an LLM, a meeting, or a particular runtime.

A Session Entry is not the session occurrence itself. A domain that needs to preserve a planned, active, or completed bounded activity pass should use an occurrence-owning schema such as `tiinex.event.session.v1` when that meaning fits. A meeting is likewise distinct: `tiinex.event.meeting.v1` preserves a gathering occurrence, while a Session Entry preserves a reusable way of entering a session.

## Schema Validation Contract

### Session Entry Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.entry.session.v1`

Rules

- `tiinex.entry.session.v1` identifies Entry definitions whose target is a bounded session.
- Session Entry inherits the reusable identity, purpose, context, method, optional preparation, presentation, interpretation-limit, and portability semantics of `tiinex.entry.v1`.
- Session Entry does not prove that a session exists, started, resumed, completed, or involved any particular actor.
- Session Entry must not silently become a meeting, event, process, task, route, authority, acceptance, transfer, or occurrence record.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Session Grounding Semantics

Rules

- A Session Entry may declare zero or more Grounding Material references.
- Grounding Material is schema-agnostic. A reference may target any qualified artifact or other bounded material whose own semantics remain independently authoritative.
- A referenced Process, Role, Evidence artifact, Context artifact, source, implementation artifact, specification, policy, previous occurrence, or other material does not gain special authority merely because the Session Entry references it.
- Every declared Grounding Material item is a grounding obligation for this Entry: it must be qualified and read according to its own semantics before the Session Entry is treated as fully grounded.
- `Purpose` on a Grounding Material declaration explains why that referenced material matters to this session and what part of the session grounding it informs. It must not overwrite, reinterpret, strengthen, weaken, or replace the referenced material's own schema semantics or authority.
- When a declared reference cannot be qualified, cannot be accessed, is stale, conflicts with another grounded source, or leaves currentness unresolved, that condition must remain explicit rather than being silently omitted or resolved by convenience.
- Grounding obligations do not require exhaustive reading of unrelated material. They require sufficient qualification and interpretation of each explicitly declared reference to satisfy its stated Purpose without violating the referenced material's own boundaries.

### Session Entry Body

Optional Sections

- Grounding Material

Rules

- `## Grounding Material`, when present, contains repeated named declarations using the Grounding Material shape below.
- Absence of `## Grounding Material` means this Session Entry declares no additional explicit material references beyond inherited Entry semantics.
- Grounding Material declarations supplement inherited Entry semantics; they do not replace the Entry's declared Purpose, Entry Target, Method, or other applicable inherited fields.

### Grounding Material

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Reference
- Purpose

Optional Fields

- Label
- Qualification Notes

Rules

- Entries under `## Grounding Material` are repeated named declarations using this shape.
- Declaration names must be unique within `## Grounding Material` and should be short human-readable descriptions of the material's role in the session.
- `Reference` must identify one explicit recoverable target. Prefer a stable qualified reference or permalink where the environment can provide one; do not invent immutability or source authority when it is unavailable.
- `Purpose` must state why the referenced material is needed for this Session Entry and what part of session grounding it informs.
- `Label`, when present, is presentation only and does not replace target identity.
- `Qualification Notes`, when present, may state bounded access, currentness, provenance, or representation expectations without claiming that qualification has already succeeded.
- A Grounding Material declaration must not encode schema-specific authority by implication. The target's own schema and qualified source own its meaning.

### Relationship To Session Occurrences

Rules

- `tiinex.entry.session.v1` owns the reusable way of entering or resuming a bounded session.
- `tiinex.event.session.v1` owns a bounded session occurrence when an occurrence record is needed.
- One Session Entry may be used by zero, one, or many actual session occurrences.
- An occurrence may use a Session Entry without making the Entry artifact proof of attendance, execution, success, completion, or outcome.
- Meeting semantics remain distinct from session-entry semantics; a meeting may use a Session Entry, but a Session Entry is not thereby a meeting.

### Interpretation Boundaries

Rules

- Session Entry is an Entry specialization, not a generic container for arbitrary session state.
- Grounding Material references are obligations to ground declared material, not permission to broaden discovery without relevance or authority boundaries.
- Reference presence does not make the target true, current, applicable, accepted, controlling, or authoritative by itself.
- Selection or use of a Session Entry does not create a session occurrence, participant authority, Role-holder state, task ownership, route, recipient, acceptance, work transfer, or completion.

### File Naming

Allowed Shapes

- `tiinex.entry.session.v1.md`
- `<session-entry-slug>.entry.md`
- `<session-entry-slug>-entry.md`
- `<lineage>-session-entry.trace.md`
- `<lineage>-<session-entry-slug>.trace.md`

Rules

- `tiinex.entry.session.v1.md` is the reserved base contract filename for the Session Entry family.
- Reusable registry-like Session Entry definitions may use `.entry.md`.
- Lineage-first `.trace.md` names should be used when a Session Entry artifact participates in ordinary local lineage.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Name
- Version
- Canonical Identifier
- Purpose
- Entry Target
- Method

Optional Fields

- Entry Family
- Human Label
- In Scope
- Out Of Scope
- Required Context
- Relevant Context
- Context Exclusions
- Preparation Method
- Reconciliation Policy
- Discovery Breadth
- Currentness Policy
- Uncertainty Policy
- Readiness Boundary
- Stop Conditions
- Escalation Conditions
- Intended Audience
- Presentation Guidance
- Preference Sources
- Interaction Guidance
- Diagnostic Detail Policy
- Does Not Establish
- Must Not Be Inferred
- Portable Semantics
- Environment Assumptions
- Non-Portable Details
- Grounding Material

### Creation Rules

Rules

- Creation tools should use this child schema only when the reusable Entry target is a bounded session.
- Creation tools should not manufacture Grounding Material merely because related artifacts are nearby; explicit references should exist only when their stated Purpose materially contributes to session grounding.
- Each created Grounding Material declaration must preserve separate `Reference` and `Purpose` fields.
- Session Entry creation must keep definition semantics separate from any particular session occurrence.

## Minimal Example

```md
# Research Session Orientation

## Entry Identity

- Name: Research Session Orientation
- Version: 1
- Canonical Identifier: example.research.session.orientation.v1

## Purpose And Scope

- Purpose: Establish the relevant research context before a bounded research pass begins.

## Entry Context

- Entry Target: bounded research session

## Entry Method

- Method: ground the declared material, preserve unresolved seams, and present the current research picture before substantive investigation begins
- Readiness Boundary: every declared Grounding Material reference has been qualified and interpreted for its stated Purpose, with unresolved conflicts preserved

## Grounding Material

- Research question
  - Reference: <qualified-reference-to-research-question>
  - Purpose: Establish the bounded question this session is intended to investigate.

- Prior evidence
  - Reference: <qualified-reference-to-prior-evidence>
  - Purpose: Establish what supporting or challenging material already exists without treating that evidence as truth by itself.
```

The inherited `# Continuity Integrity` footer is intentionally omitted from the example for readability; the example must not be read as a complete root-valid artifact without that inherited footer.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [tiinex.entry.v1](../tiinex.entry.v1.schema.md)
  - Value: ea5SJQIbqVXy7rAFmyZ6L7xkAWQszRI2AWDC0tf5-dA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:PhbU7EuNpabreeR_C5QtROjPwxL4JxpaLmmJnU9Gqws
