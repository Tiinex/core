# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.adapter.v1](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/adapter/tiinex.adapter.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Trace: [tiinex.adapter.v1.schema.md](../tiinex.adapter.v1.schema.md)
  - Origin:
    - [relative](../tiinex.adapter.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/adapter/tiinex.adapter.v1.schema.md)
- Current
  - Current Schema: [tiinex.digital.adapter.v1](tiinex.digital.adapter.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for digital adapter definitions that declare digital-source boundaries, transport constraints, access discipline, preservation limits, and interpretation boundaries.

---

# Digital Adapter

- Status: draft schema note

## Summary

This schema defines digital adapter artifacts.

A digital adapter is an adapter whose boundary crosses a digital surface, digital record, digital platform, digital transport, digital identity, digital storage, digital export, or digital runtime.

It is not a software-development-only concept. A digital adapter may support a repository issue tracker, public discussion forum, professional network, web page, exported archive, scanned paper, camera image, sensor log, satellite image, field recorder, museum catalog, dataset, document store, or LLM runtime transcript.

The important boundary is this: a digital adapter works with digital material about something. It must not silently treat the digital material as the thing itself. A camera record of a forest is not the forest. A sensor log of a river is not the river. A social post about a person is not the person. A GitHub comment about work is not automatically feedback, evidence, consent, or task ownership.

## Schema Validation Contract

### Digital Adapter Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.digital.v1.adapter`

Rules

- `tiinex.digital.v1.adapter` identifies adapter definitions whose source boundary, operating boundary, or transport boundary is digital.
- Digital adapter artifacts inherit the ordinary adapter boundary: fetched, accessed, cached, rendered, or held material is not automatically preserved material.
- Digital adapter artifacts must keep digital-source identity, access method, material status, preservation status, and interpretation status distinct.
- Digital adapters should be usable by humans, LLMs, browser apps, CLIs, extensions, runtimes, field workflows, research workflows, and review tools without requiring one programming language.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Adapter Specialization

Rules

- Digital adapter definitions inherit the adapter-definition principle that source boundaries, translation boundaries, access discipline, holding, preservation, output mapping, user action, failure handling, and portability must remain explicit.
- Digital adapter definitions specialize the inherited `Adapter Body` for artifacts whose `Current -> Current Schema` is `tiinex.digital.v1.adapter`.
- The digital adapter body replaces the parent adapter body sections for `tiinex.digital.v1.adapter` artifacts.
- `Digital Adapter Identity` specializes `Adapter Identity`.
- `Digital Source Boundary` and `Digital Material Boundary` specialize `Source Boundary` and `Translation Boundary`.
- `Transport And Access Discipline` specializes `Access And Intake Discipline`.
- `Cache And Preservation Boundary` specializes `Holding And Reuse Discipline` and `Preservation Boundary`.
- `Output Mapping`, `User Action Boundary`, `Failure And Gap Handling`, and `Portability Notes` preserve the corresponding parent adapter semantics.
- Parent adapter specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Digital Adapter Body

Required Shape

- first body heading after the continuity envelope
- `## Digital Adapter Identity` section
- `## Digital Source Boundary` section
- `## Transport And Access Discipline` section
- `## Digital Material Boundary` section
- `## Cache And Preservation Boundary` section
- `## Output Mapping` section
- `## User Action Boundary` section
- `## Failure And Gap Handling` section
- `## Portability Notes` section

Optional Sections

- Platform Policy Boundary
- Authentication Boundary
- Pagination Or Windowing
- Rate-Limit Discipline
- Privacy Boundary
- Human Review Boundary
- Natural Or Physical World Boundary
- Social Or Community Boundary
- Related Origins
- Examples
- Not Recommended For

Rules

- A digital adapter artifact should begin with a human-readable adapter name.
- `Digital Adapter Identity` must identify the digital adapter and version.
- `Digital Source Boundary` must state what digital origin, source surface, record type, or platform is in scope.
- `Transport And Access Discipline` must state how access is bounded and what kind of transport or runtime surface may be used.
- `Digital Material Boundary` must distinguish digital records from the real-world, social, natural, or runtime events they may describe.
- `Cache And Preservation Boundary` must distinguish operational holding from durable preservation.
- `Output Mapping` must state which Tiinex artifact types may be produced, suggested, or explicitly not produced automatically.
- `User Action Boundary` must state which actions require explicit user approval.
- `Failure And Gap Handling` must state how unavailable, partial, stale, private, deleted, rate-limited, auth-scoped, or policy-restricted material is represented.

### Digital Adapter Identity

Required Fields

- Name
- Version
- Adapter Family
- Canonical Identifier
- Base Tool
- Base Interface
- Base Adapter
- Digital Adapter Medium
- Implementation Surface

Optional Fields

- Supersedes
- Related Adapter
- Platform Family
- Source Medium
- Capture Medium
- Transport Medium
- Origin Class
- Origin Definition
- Base Digital Origin

Rules

- `Canonical Identifier` should be the stable machine-readable digital adapter id.
- `Base Tool` should normally be `tiinex.tool.v1`.
- `Base Interface` should normally be `tiinex.interface.v1`.
- `Base Adapter` should normally be `tiinex.v1.adapter`.
- `Digital Adapter Medium` should state digital, mixed digital-physical, digital-social, digital-natural, digital-runtime, or another precise medium.
- `Implementation Surface` should name allowed implementation surfaces without requiring a specific programming language.
- `Origin Class` may identify broad origin families such as repository, forum, professional network, social platform, document store, archive, sensor stream, camera capture, local file set, dataset, runtime transcript, message channel, or field record.
- `Origin Definition` may reference a reusable origin artifact such as `github.v1.origin.md`, `tiinex.digital.v1.origin.md`, or another concrete origin boundary.
- `Base Digital Origin` may be `tiinex.digital.v1.origin` when the adapter is designed to work with digital origins.

### Digital Source Boundary

Required Fields

- Digital Source Type
- Source Inputs
- Access Boundary
- Does Not Access
- Origin Mutability

Optional Fields

- Platform Or Host
- Source Owner Or Maintainer
- Public Or Private Scope
- Terms Or Policy Boundary
- Origin Definition
- Natural Or Physical Referent
- Social Referent
- Capture Conditions

Rules

- `Digital Source Type` must state what kind of digital source is being adapted.
- `Source Inputs` must state the minimum target identity needed to operate the adapter.
- `Access Boundary` must state what the adapter may read, observe, request, receive, scan, parse, import, or render.
- `Does Not Access` must state important out-of-scope digital surfaces.
- `Origin Mutability` must state whether the source can change, be edited, be deleted, be personalized, be rate-limited, or be rendered differently over time.
- Platform policy, terms, privacy, authentication, and access limits should be explicit when relevant.

### Transport And Access Discipline

Required Fields

- Access Strategy
- Request Or Intake Discipline
- Retry Or Repeat Policy
- Scope Broadening Policy

Optional Fields

- Network Boundary
- API Boundary
- Web Page Boundary
- Export Boundary
- File Boundary
- Sensor Boundary
- Pagination Or Windowing
- Rate-Limit Discipline
- Offline Behavior

Rules

- Digital adapters must avoid unbounded crawling, blind probing, hidden scraping, hidden telemetry, hidden authentication, or hidden write behavior.
- Digital adapters should prefer declared targets over guessed targets.
- Digital adapters must not broaden from one source target to a larger account, platform, repository, group, folder, environment, person, or place without explicit scope.
- Retry behavior must be bounded and should respect visible retry, rate-limit, lockout, policy, or failure signals.
- Pagination, cursoring, chunking, sampling, and windowing should be declared when source material may exceed one read.

### Digital Material Boundary

Required Fields

- Digital Material
- Represented Subject
- Material Status
- Does Not Prove

Optional Fields

- Rendered Form
- Raw Form
- Canonical Form
- Capture Time
- Observation Time
- Edit State
- Deletion State
- Personalization Risk
- Machine-Generated Risk

Rules

- `Digital Material` must state the actual digital record, page, payload, export, file, media, message, scan, log, or runtime state being handled.
- `Represented Subject` should state what the material appears to be about, while keeping that subject separate from the material.
- `Material Status` must say whether material is observed, partial, unavailable, stale, auth-scoped, policy-scoped, cached, preserved, or candidate-only when known.
- `Does Not Prove` must state important claims that digital material does not automatically prove.
- For natural or physical referents, the adapter must not treat a digital record as direct possession of the natural or physical event.
- For social referents, the adapter must not treat a digital post as identity, consent, intent, authority, or representative truth unless separately established.

### Cache And Preservation Boundary

Required Fields

- Operational Holding
- Cache Boundary
- Preservation Boundary
- Preservation Action

Optional Fields

- Retention Behavior
- Export Behavior
- Redaction Behavior
- Privacy Warning
- Replayability
- Evidence Candidate Boundary

Rules

- `Operational Holding` must state any temporary holding needed for the adapter to operate.
- `Cache Boundary` must state whether cache is best-effort, runtime-local, browser-controlled, file-backed, user-visible, or unavailable.
- `Preservation Boundary` must state what is and is not durably preserved.
- `Preservation Action` must state what explicit user or workflow action is required before material becomes preserved.
- Cache, preview, page load, API result, screenshot view, or LLM context must not be treated as preservation by default.

### Output Mapping

Required Fields

- Primary Output
- Candidate Outputs
- Not Automatic Outputs
- Interpretation Required

Optional Fields

- Use As Candidates
- Gap Outputs
- Relation Candidates
- Evidence Candidate Rules
- Resource Need Candidate Rules
- Pointer Candidate Rules

Rules

- Digital adapter output should normally enter Tiinex as a bounded finding, pointer, candidate, gap, preserved material reference, or other explicitly declared artifact type.
- Digital adapter output must not silently become feedback, task, evidence, consent, acceptance, validation, proof, authorship, identity, priority, ownership, or truth.
- Stronger use requires explicit interpretation, such as `Use as` or `Create from finding`, unless the concrete adapter schema declares a stricter human-reviewed flow.
- Output mapping should preserve status labels such as observed, unavailable, partial, stale, rate-limited, auth-scoped, policy-scoped, or needs review.

### User Action Boundary

Required Fields

- User-Required Actions
- Read Boundary
- Write Boundary
- Authentication Boundary
- Destructive Boundary

Optional Fields

- Share Boundary
- Export Boundary
- Preserve Boundary
- Consent Boundary
- Physical Handling Boundary
- Social Contact Boundary

Rules

- Auth, write, publish, reply, delete, preserve, export, broaden-scope, social contact, physical handling, and destructive actions require explicit user action unless the concrete adapter contract states a narrower already-approved workflow.
- Digital adapters must not silently use ambient identity, tokens, cookies, account state, local files, browser tabs, private exports, or device resources outside the declared boundary.
- Write-capable digital adapters must keep read mode and write mode visibly distinct.

### Failure And Gap Handling

Required Fields

- Failure Modes
- Gap Representation
- User-Visible Status
- Safe Fallback

Optional Fields

- Retry Advice
- Partial Material Handling
- Stale Material Handling
- Auth Failure Handling
- Policy Failure Handling
- Deleted Material Handling
- Conflict Handling

Rules

- Digital adapters must represent unavailable, rate-limited, forbidden, deleted, stale, partial, paginated-away, policy-blocked, auth-scoped, malformed, or ambiguous sources as visible status or gaps.
- A known target that cannot be read should remain a target/gap, not disappear silently.
- A failed digital read must not be replaced with guessed content.
- If source material is only partially observed, the output should say partial rather than complete.

### Portability Notes

Required Fields

- Portable Contract
- Implementation Freedom
- Human Readability
- Machine Readability

Optional Fields

- Browser Notes
- CLI Notes
- Extension Notes
- Runtime Notes
- Offline Notes
- Field Workflow Notes

Rules

- Digital adapter definitions must remain readable by people without requiring access to the implementation code.
- Implementations may vary by app, CLI, extension, runtime, notebook, field workflow, or review tool if they preserve the declared boundaries.
- A digital adapter definition is not executable code and is not a log of one adapter run.

### File Naming

Allowed Shapes

- `tiinex.digital.v1.adapter.md`
- `<digital-adapter-slug>.adapter.md`
- `<origin>.<capability>.v1.adapter.md`
- `<origin>.<surface>.<capability>.v1.adapter.md`
- `<lineage>-digital-adapter.trace.md`
- `<lineage>-<digital-adapter-slug>.trace.md`

Rules

- `tiinex.digital.v1.adapter.md` is the reserved base digital adapter contract filename for the `tiinex.digital.v1.adapter` family.
- Digital adapter artifacts should use a slug that identifies the origin, surface, or capability without hiding the adapter role.
- Concrete origin adapters may use `.adapter.md` when they are intentionally maintained as reusable adapter definitions.
- Trace-lineage digital adapter artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.digital.v1.adapter` to define digital adapter behavior, not to record one adapter run.
- A specific adapter run may reference a digital adapter artifact but should be recorded by a runtime, traversal, discovery, or other result-owning schema.
- Digital adapter definitions should not become platform-specific policy mirrors; they should declare the boundary and point to source-specific docs when needed.
- Platform-specific adapters should inherit digital adapter constraints and then narrow the origin surface.

## Artifact Creation Contract

### Creation Scope

Rules

- Create `tiinex.digital.v1.adapter` artifacts when defining a reusable digital adapter contract or a concrete digital adapter that inherits the digital boundary.
- Do not create `tiinex.digital.v1.adapter` artifacts merely to record that a digital source was visited, viewed, cached, or fetched.

### Creation Inputs

Required Fields

- adapter name
- version
- canonical identifier
- base adapter reference
- digital source boundary
- transport and access discipline
- cache and preservation boundary
- output mapping
- user action boundary
- failure and gap handling

### Default Behaviors

Rules

- adapters are read-only unless write behavior is explicitly declared
- access is bounded by declared source inputs
- preservation requires explicit user action
- stronger interpretation requires explicit use-as or human review
- unavailable material remains visible as a gap

### Creation Warnings

Rules

- do not collapse source URL, fetched material, cached material, preserved material, and evidence into one field
- do not treat social-platform posts as consent, identity, or representative truth
- do not treat digital nature records as the natural event itself
- do not infer unseen comments, hidden posts, private material, deleted edits, or missing pages
- do not encode one platform-specific quirk as a universal digital adapter rule unless it is truly medium-wide
## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.digital.v1.adapter
  - Created At: 2026-06-29 00:00:00
  - Summary: Digital adapter contract for a bounded public discussion thread intake.

---

# Public Discussion Thread Adapter

## Digital Adapter Identity

- Name: Public discussion thread adapter
- Version: 1
- Adapter Family: public community discussion intake
- Canonical Identifier: public.discussion.thread.v1
- Base Tool: tiinex.tool.v1
- Base Interface: tiinex.interface.v1
- Base Adapter: tiinex.v1.adapter
- Digital Adapter Medium: digital-social
- Implementation Surface: browser, CLI, extension, runtime helper, or human review procedure

## Digital Source Boundary

- Digital Source Type: public discussion thread and visible replies
- Source Inputs: declared thread URL or platform-specific thread identifier
- Access Boundary: declared thread and visible replies only
- Does Not Access: unrelated threads, private messages, hidden user data, broader account surfaces, or platform-wide search by default
- Origin Mutability: mutable external platform material

## Transport And Access Discipline

- Access Strategy: bounded read of declared target
- Request Or Intake Discipline: avoid unbounded crawling or blind broadening
- Retry Or Repeat Policy: no automatic retry storms
- Scope Broadening Policy: explicit user action only

## Digital Material Boundary

- Digital Material: visible digital posts and metadata when available
- Represented Subject: social discussion content
- Material Status: observed, partial, unavailable, stale, or preserved as declared by the run
- Does Not Prove: identity, consent, truth, intent, representative opinion, or preserved evidence

## Cache And Preservation Boundary

- Operational Holding: temporary runtime or browser holding
- Cache Boundary: operational convenience only
- Preservation Boundary: not preserved unless explicit action captures material
- Preservation Action: explicit preserve/export action

## Output Mapping

- Primary Output: tiinex.discovery.finding.v1
- Candidate Outputs: pointer, feedback candidate, task candidate, evidence candidate, resource need candidate
- Not Automatic Outputs: evidence, task, feedback, consent, acceptance, proof, truth, identity
- Interpretation Required: yes

## User Action Boundary

- User-Required Actions: preserve, export, authenticate, write, reply, broaden target, or use as stronger artifact
- Read Boundary: declared thread only
- Write Boundary: none by default
- Authentication Boundary: no hidden auth
- Destructive Boundary: none

## Failure And Gap Handling

- Failure Modes: unavailable, deleted, private, rate-limited, stale, partial, malformed, or policy-scoped target
- Gap Representation: visible discovery gap
- User-Visible Status: show status and limits
- Safe Fallback: preserve target identity without inventing content

## Portability Notes

- Portable Contract: usable without one implementation language
- Implementation Freedom: app, CLI, extension, runtime, human review procedure, or field workflow
- Human Readability: required
- Machine Readability: structured fields should stay stable
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- digital adapters are medium-specific adapters, not software-development-only adapters
- digital records may describe physical, natural, social, legal, runtime, or project events without becoming those events
- platform community origins such as GitHub Discussions, Reddit, LinkedIn, forums, chat exports, and public comment systems should share digital adapter constraints before adding origin-specific rules
- natural-world origins such as wildlife cameras, field sensors, satellite imagery, lab instruments, and citizen-science observations may also use digital adapter constraints when the intake crosses a digital record boundary
- concrete digital adapters should be narrow about source scope and generous about human readability
- do not silently promote digital findings into feedback, tasks, evidence, consent, or truth

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.adapter.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/adapter/tiinex.adapter.v1.schema.md)
  - Value: OvGT-7pGQju2wqKQrY56PgivAarT065N8Ik4ZGIVY68

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: a4JqJeIQVxF9pqhJ5MfM5n4Q0ei2eYO8eJN31CeGTns