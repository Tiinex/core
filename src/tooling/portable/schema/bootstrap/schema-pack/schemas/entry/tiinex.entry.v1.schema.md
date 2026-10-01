# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.entry.v1](tiinex.entry.v1.schema.md)
  - Created At: 2026-10-01 00:00:00
  - Summary: General schema for reusable ways of beginning, entering, resuming, or initially orienting within a bounded context, activity, field, process, or interaction.

---

# Entry

- Status: draft schema note

## Summary

This schema defines reusable Entry artifacts.

An Entry describes a reusable way of beginning, entering, resuming, or initially orienting within something bounded. The target may be a context, activity, field, process, interaction, place, body of material, or another declared domain surface.

Entry semantics do not assume software, an LLM, a user interface, a conversation, a filesystem, a meeting, or a particular runtime. A human procedure, workshop opening, research orientation, shift start, return-after-interruption method, guided exploration, or digital session entry may all use this schema when the same declared meaning fits.

An Entry definition is not evidence that entry occurred. It does not by itself create authority, permission, ownership, transfer, acceptance, continuation, or completion.

## Entry Semantics

An Entry separates the reusable way of entering from any particular occurrence of using that Entry.

The base Entry contract is intentionally lightweight. It requires enough information to identify the reusable Entry, state why and where it applies, and describe the method of entry. Descendant schemas may add grounding, interaction, domain, occurrence-adjacent, or other specialized semantics when those meanings are actually required.

An Entry may include optional preparation, readiness, presentation, interpretation-limit, and portability guidance without making those concerns mandatory for every Entry family.

## Relationship To Occurrence

Selecting, reading, carrying, or applying an Entry artifact does not prove that an Entry occurred.

A domain that needs to preserve one actual occurrence should use an appropriate event, session, trace, activity, evidence, or other occurrence-owning schema rather than treating the reusable Entry definition as the occurrence record.

## Schema Validation Contract

### Entry Body

Required Sections

- Entry Identity
- Purpose And Scope
- Entry Context
- Entry Method

Optional Sections

- Preparation
- Presentation And Interaction
- Interpretation Limits
- Portability Notes

Rules

- Required sections establish the minimum reusable Entry representation.
- Optional sections add guidance only when that concern is meaningful for the Entry.
- Omitting an optional section does not create hidden defaults or weaken semantics declared elsewhere.

### Entry Identity

Required Fields

- Name
- Version
- Canonical Identifier

Optional Fields

- Entry Family
- Human Label

Rules

- `Name` identifies the Entry in human-readable form.
- `Version` identifies the declared Entry-definition version.
- `Canonical Identifier` identifies the Entry definition within its declared authority surface.
- `Human Label`, when present, is presentation only and must not replace canonical identity.

### Purpose And Scope

Required Fields

- Purpose

Optional Fields

- In Scope
- Out Of Scope

Rules

- `Purpose` states why the Entry exists.
- `In Scope`, when present, states initial entering or orientation behavior that belongs to this Entry.
- `Out Of Scope`, when present, states behavior or claims that remain outside the Entry.

### Entry Context

Required Fields

- Entry Target

Optional Fields

- Required Context
- Relevant Context
- Context Exclusions

Rules

- `Entry Target` states what context, activity, field, process, interaction, place, material surface, or other bounded subject is being entered.
- `Required Context`, when present, states context that must be available or established before ordinary activity may proceed under this Entry.
- `Relevant Context`, when present, identifies context that may improve orientation without becoming an unconditional requirement.
- `Context Exclusions`, when present, identifies material or assumptions that must not be treated as entry authority merely because they are nearby or available.

### Preparation

Optional Fields

- Preparation Method
- Reconciliation Policy
- Discovery Breadth
- Currentness Policy
- Uncertainty Policy

Rules

- `Preparation Method`, when present, states how initial grounding, setup, inspection, briefing, orientation, or other preparation should occur.
- `Reconciliation Policy`, when present, states how competing, partial, conflicting, stale, or differently scoped representations should be handled when they can affect the initial picture.
- `Discovery Breadth`, when present, states the intended breadth of initial discovery without requiring exhaustive reading by default.
- `Currentness Policy`, when present, states how currentness should be assessed where time or supersession matters.
- `Uncertainty Policy`, when present, states how unresolved uncertainty should remain visible rather than being silently guessed away.

### Entry Method

Required Fields

- Method

Optional Fields

- Readiness Boundary
- Stop Conditions
- Escalation Conditions

Rules

- `Method` states the reusable way of entering.
- `Readiness Boundary`, when present, states what is sufficient to proceed beyond initial entry or orientation.
- `Stop Conditions`, when present, states conditions under which proceeding should stop rather than silently continue.
- `Escalation Conditions`, when present, states conditions that require stronger review, assistance, or explicit choice.

### Presentation And Interaction

Optional Fields

- Intended Audience
- Presentation Guidance
- Preference Sources
- Interaction Guidance
- Diagnostic Detail Policy

Rules

- `Intended Audience`, when present, states who the entry result or initial orientation is meant to be useful to.
- `Presentation Guidance`, when present, states how the useful result should be presented when presentation is part of the Entry.
- `Preference Sources`, when present, identifies declared actor, participant, audience, accessibility, or domain preferences that should shape presentation without changing semantic authority.
- `Interaction Guidance`, when present, states how involved actors should be engaged during initial entry.
- `Diagnostic Detail Policy`, when present, states when internal qualification, setup, or diagnostic detail belongs in the foreground presentation.
- Presentation fields do not grant authority to an audience or participant merely because they are addressed.

### Interpretation Limits

Optional Fields

- Does Not Establish
- Must Not Be Inferred

Rules

- `Does Not Establish`, when present, states authority, state, occurrence, permission, transfer, acceptance, ownership, completion, or other claims that selection or use of the Entry does not establish by itself.
- `Must Not Be Inferred`, when present, states important interpretations that remain unsupported unless another qualified source establishes them.

### Portability Notes

Optional Fields

- Portable Semantics
- Environment Assumptions
- Non-Portable Details

Rules

- `Portable Semantics`, when present, states the Entry meaning that should survive across suitable implementations, actors, or environments.
- `Environment Assumptions`, when present, states capabilities or conditions required to carry out the Entry.
- `Non-Portable Details`, when present, states runtime, software, physical, organizational, provider, interface, language, or other environment-specific details that are not part of portable Entry meaning.

### File Naming

Allowed Shapes

- `tiinex.entry.v1.md`
- `<entry-slug>.entry.md`
- `<entry-slug>-entry.md`
- `<lineage>-entry.trace.md`
- `<lineage>-<entry-slug>.trace.md`

Rules

- `tiinex.entry.v1.md` is the reserved base Entry contract filename for the `tiinex.entry.v1` family.
- Reusable registry-like Entry definitions may use `.entry.md`.
- Lineage-first `.trace.md` names should be used when an Entry artifact participates in ordinary local lineage.
- Entry artifacts define reusable entry meaning; they are not by themselves records that an entry occurred.

### Interpretation Boundaries

Rules

- Entry does not assume a digital runtime, LLM, conversation, software application, meeting, or Tiinex host.
- Entry selection does not by itself create an occurrence, route, recipient, holder, participant authority, permission, ownership, transfer, acceptance, continuation, or completion state.
- A runtime may project an Entry into environment-specific interaction, but that projection must preserve the Entry's declared meaning and interpretation limits.
- Nearby or carried material does not become controlling merely because an Entry can see or reference it.

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

### Creation Rules

Rules

- Creation tools should describe the reusable way of entering rather than recording a particular occurrence as if it were the definition.
- Creation tools should keep portable Entry meaning separate from software-, runtime-, organization-, provider-, or interface-specific projection details unless those details are intentionally part of the Entry itself.
- Unknown context, currentness, precedence, authority, or readiness must remain unknown rather than being guessed.
- Presentation guidance may adapt to involved actors but must not silently change semantic authority or interpretation limits.
- Entry definitions should be understandable by a human reader without requiring hidden runtime state.

## Minimal Example

```md
# Open Investigation

## Entry Identity

- Name: Open Investigation
- Version: 1
- Canonical Identifier: example.entry.open-investigation.v1

## Purpose And Scope

- Purpose: Begin investigation without committing to a substantive direction before an initial orientation is available.

## Entry Context

- Entry Target: bounded investigation context

## Entry Method

- Method: recover the relevant starting picture, preserve material uncertainty, and identify plausible directions before substantive work begins
```

The inherited `# Continuity Integrity` footer is intentionally omitted from the example for readability; the example must not be read as a complete root-valid artifact without that inherited footer.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Value: QXbg7uxlhO1ou4PukRaub3fSJ_Ef32mSubsI2ib1LH0

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:ea5SJQIbqVXy7rAFmyZ6L7xkAWQszRI2AWDC0tf5-dA
