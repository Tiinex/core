# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.origin.v1](../tiinex.origin.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.origin.v1.schema.md](../tiinex.origin.v1.schema.md)
  - Origin:
    - [relative](../tiinex.origin.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/origin/tiinex.origin.v1.schema.md)
- Current
  - Current Schema: [tiinex.digital.origin.v1](tiinex.digital.origin.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for digital origin definitions such as repositories, public web surfaces, discussions, social platforms, document stores, digital archives, datasets, runtime logs, and digital records of natural or physical contexts.

---

# Digital Origin

- Status: draft schema note

## Summary

This schema defines digital origin artifacts.

A digital origin is an origin whose reusable boundary is formed by digital records, digital surfaces, digital storage, digital identity, digital transport, digital access rules, digital rendering, digital exports, or digital runtime state.

It is not limited to software development. A digital origin may be a repository host, issue tracker, discussion forum, social platform, professional network, public web page, document store, local folder, exported archive, dataset, sensor stream, camera trap archive, satellite image set, museum catalog, chat export, or LLM runtime transcript.

The important boundary is this: a digital origin is a digital place or record surface where material may be encountered. It is not the same thing as the person, community, ecosystem, event, place, object, organization, or truth that the record may discuss or represent.

## Schema Validation Contract

### Digital Origin Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.digital.v1.origin`

Rules

- `tiinex.digital.v1.origin` identifies origin definitions whose boundary is digital or digital-mediated.
- Digital origin definitions inherit ordinary origin boundaries and must keep digital surface, represented subject, access state, material state, preservation state, and interpretation state distinct.
- Digital origin definitions may be referenced by digital adapters, viewers, validators, LLM runtimes, archives, and human review procedures.
- Digital origin definitions are not digital adapter implementations, platform API contracts, evidence ledgers, consent records, identity records, or truth authorities.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Origin Specialization

Rules

- Digital origin definitions inherit the origin-definition principle that identity, access boundary, material boundary, mutability, authority limits, privacy limits, and interpretation limits must remain explicit.
- Digital origin definitions specialize the inherited `Origin Body` for artifacts whose `Current -> Current Schema` is `tiinex.digital.v1.origin`.
- The digital origin body replaces the parent origin body sections for `tiinex.digital.v1.origin` artifacts.
- `Digital Origin Identity` specializes `Origin Identity`.
- `Digital Boundary` specializes `Origin Boundary`.
- `Digital Material Boundary` specializes `Material And Signal Boundary`.
- `Access And Policy Boundary` specializes `Access And Authority Boundary`.
- `Mutability And Rendering` specializes `Mutability And Loss`.
- `Use With Digital Adapters`, `Failure And Ambiguity Handling`, and `Portability Notes` preserve the corresponding parent origin semantics.
- Parent origin specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Digital Origin Body

Required Shape

- first body heading after the continuity envelope
- `## Digital Origin Identity` section
- `## Digital Boundary` section
- `## Digital Material Boundary` section
- `## Access And Policy Boundary` section
- `## Mutability And Rendering` section
- `## Use With Digital Adapters` section
- `## Failure And Ambiguity Handling` section
- `## Portability Notes` section

Optional Sections

- Social Or Community Context
- Natural Or Physical Referent
- Runtime Context
- Archive Or Dataset Context
- Privacy Or Safety Context
- Related Origins
- Examples
- Not Recommended For

Rules

- A digital origin artifact should begin with a human-readable origin name.
- `Digital Origin Identity` must identify the digital origin and version.
- `Digital Boundary` must state what digital surface is in scope and what is out of scope.
- `Digital Material Boundary` must distinguish digital records from the represented subject.
- `Access And Policy Boundary` must state public/private/auth/policy/terms boundaries when relevant.
- `Mutability And Rendering` must state how digital material can change, disappear, personalize, or render differently.
- `Use With Digital Adapters` must state how digital adapters may work with the origin without treating access or cache as preservation.
- `Failure And Ambiguity Handling` must state how unavailable, partial, deleted, private, rate-limited, policy-scoped, or ambiguous digital material is represented.

### Digital Origin Identity

Required Fields

- Name
- Version
- Origin Family
- Canonical Identifier
- Base Origin
- Digital Origin Medium
- Digital Origin Scope

Optional Fields

- Supersedes
- Related Origin
- Parent Origin
- Platform Family
- Host Or Provider
- Account Or Repository Scope
- Community Scope
- Document Scope
- Runtime Scope
- Natural Or Physical Referent

Rules

- `Base Origin` should normally be `tiinex.v1.origin`.
- `Canonical Identifier` should be the stable machine-readable digital origin id.
- `Digital Origin Medium` should state digital, digital-social, digital-archive, digital-runtime, digital-natural-record, digital-institutional, digital-document, or another precise medium.
- `Digital Origin Scope` should define the bounded digital unit being described.
- A digital origin should not imply platform endorsement, identity certainty, consent, ownership, truth, evidence, or preservation.

### Digital Boundary

Required Fields

- In Scope
- Out Of Scope
- Boundary Type
- Scope Broadening Rule

Optional Fields

- Source Surface
- Source Unit
- Host Boundary
- Account Boundary
- Repository Boundary
- Community Boundary
- Search Boundary
- Export Boundary

Rules

- `In Scope` must state the digital surface, collection, account, repository, document, thread, post, file set, dataset, export, runtime, or record boundary included.
- `Out Of Scope` must state nearby digital surfaces that are excluded.
- `Boundary Type` should state whether the boundary is platform-defined, URL-defined, account-defined, repository-defined, document-defined, file-system-defined, export-defined, runtime-defined, API-defined, community-defined, or mixed.
- `Scope Broadening Rule` must state that tools and adapters must not broaden scope without explicit user action or declared contract.

### Digital Material Boundary

Required Fields

- Digital Material
- Represented Subject
- Material Status
- Does Not Prove

Optional Fields

- Raw Form
- Rendered Form
- Export Form
- Metadata
- Reactions Or Signals
- Capture Conditions
- Machine-Generated Risk
- Human-Generated Risk
- Personalization Risk

Rules

- `Digital Material` must state the kinds of digital records, files, pages, posts, comments, payloads, images, logs, exports, metadata, or runtime states that may be encountered.
- `Represented Subject` must keep the subject represented by the material separate from the material itself.
- `Material Status` must state whether material may be observed, unavailable, partial, stale, edited, deleted, cached, preserved, auth-scoped, policy-scoped, or unknown.
- `Does Not Prove` must state important claims the digital material does not automatically prove.
- A digital origin representing nature, places, people, communities, institutions, or events must not collapse the record into the represented subject.

### Access And Policy Boundary

Required Fields

- Access Modes
- Access Limits
- Policy Boundary
- User Action Requirements

Optional Fields

- Public Access
- Private Access
- Authentication Boundary
- Authorization Boundary
- Rate-Limit Boundary
- Terms Boundary
- Privacy Boundary
- Safety Boundary
- Consent Boundary

Rules

- `Access Modes` must state likely access paths such as visible page, API, export, file, scan, local runtime, user-provided capture, or physical capture device.
- `Access Limits` must state important limits and exclusions.
- `Policy Boundary` must state that tools and adapters should respect visible platform, host, archive, institution, runtime, or steward rules.
- `User Action Requirements` must state when authentication, preservation, export, publication, write-back, destructive action, or scope broadening requires explicit approval.
- Hidden credentials, hidden scraping, hidden telemetry, hidden writes, or hidden publication should not be allowed by a digital origin definition.

### Mutability And Rendering

Required Fields

- Mutability
- Rendering Variance
- Staleness Risk
- Loss Modes

Optional Fields

- Edit Risk
- Deletion Risk
- Moderation Risk
- Personalization Risk
- API Drift
- Export Drift
- Runtime Drift
- Versioning Support

Rules

- `Mutability` must state how records may change.
- `Rendering Variance` must state whether different users, devices, APIs, locales, permissions, time windows, or exports may see different material.
- `Staleness Risk` must state how quickly captured understanding may become stale when known.
- `Loss Modes` must state how digital material, context, metadata, access, or meaning may be lost.
- Digital origins must not be treated as stable preserved archives unless preservation, versioning, export, or another method supports that claim.

### Use With Digital Adapters

Required Fields

- Recommended Adapter Use
- Preservation Boundary
- Candidate Output Boundary
- Not Automatic Outputs

Optional Fields

- Discovery Use
- Evidence Candidate Use
- Feedback Candidate Use
- Task Candidate Use
- Resource Need Candidate Use
- Pointer Use
- Relation Use
- Runtime Use

Rules

- `Recommended Adapter Use` should state how digital adapters may approach this origin.
- `Preservation Boundary` must distinguish access, render, fetch, scrape, import, export, cache, transcript context, and durable preservation.
- `Candidate Output Boundary` must state which outputs may be candidates rather than final stronger artifacts.
- `Not Automatic Outputs` must list important claims that must not be created automatically from origin access.
- Discovery findings from digital origins require explicit interpretation before becoming feedback, task, evidence, consent, validation, resource need, pointer, or relation artifacts.

### Failure And Ambiguity Handling

Required Fields

- Failure Modes
- Ambiguity Modes
- Safe Representation

Optional Fields

- Auth Failure
- Policy Failure
- Rate-Limit Failure
- Deleted Or Edited State
- Partial Export
- Personalization Drift
- Bot Or Automation Risk
- Quotation Or Repost Risk

Rules

- `Failure Modes` must state common digital access and interpretation failures.
- `Ambiguity Modes` must state common digital ambiguity cases.
- `Safe Representation` must state how to show gaps and limitations without inventing missing content.
- Private, deleted, unavailable, hidden, rate-limited, policy-scoped, or partial material should remain visible as gap/status, not silent failure.

### File Naming

Allowed Shapes

- `tiinex.digital.v1.origin.md`
- `<digital-origin-slug>.origin.md`
- `<digital-origin-slug>-origin.md`
- `<lineage>-digital-origin.trace.md`
- `<lineage>-<digital-origin-slug>.trace.md`

Rules

- `tiinex.digital.v1.origin.md` is the reserved base digital origin contract filename for the `tiinex.digital.v1.origin` origin family.
- Digital origin artifacts should use a slug that identifies the digital origin family, host, platform, collection, document store, runtime, dataset, archive, or source surface.
- Canonical registry-like digital origin definitions may use `.origin.md` when the artifact is intentionally maintained as a reusable origin definition.
- Trace-lineage digital origin artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.digital.v1.origin` to define digital origin boundaries, not to implement digital adapters.
- Digital adapters may reference digital origin definitions, but adapter behavior remains declared in adapter artifacts.
- Access to a digital origin does not imply preservation, consent, identity, authorship, representativeness, authority, evidence, or truth.
- Digital records about the natural or physical world remain records about the world, not the world itself.

## Artifact Creation Contract

### Creation Intent

Rules

- Create a digital origin artifact when defining a reusable digital source boundary, platform family, repository host, social surface, professional network surface, public web community, document store, archive, dataset, runtime, local file set, or digital record family.
- Do not create a digital origin artifact merely because an artifact contains a URL.

### Parent Selection

Rules

- A base digital origin contract should parent the base origin contract.
- A concrete digital origin should parent the nearest broader digital origin contract.
- A local observation of one digital item should usually be a discovery finding or evidence artifact, not a reusable digital origin definition.

### Creation Checks

Rules

- Declare digital origin identity, boundary, material boundary, access/policy boundary, mutability/rendering, adapter use, and failure handling.
- Keep digital record, represented subject, adapter result, preserved material, evidence, and truth separate.
- Mark public/private/auth/policy/rate-limit/personalization/mutability limits when relevant.

### Recommended Output

Rules

- Use a human-readable origin name.
- Include enough structured fields for adapters and LLMs to avoid silent scope broadening.
- Prefer concrete, bounded origins over vague platform-wide claims.

### Not Recommended

Rules

- Do not use digital origin artifacts as proof of content, truth, authorship, consent, identity, authority, validation, or preservation.
- Do not treat a visible page, post, API response, or export as preserved material unless preservation is explicit.
## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.digital.v1.origin
  - Created At: 2026-06-29 00:00:00
  - Summary: Digital origin boundary for a bounded repository collaboration surface.

---

# Repository Collaboration Digital Origin

## Digital Origin Identity

- Name: repository collaboration digital origin
- Version: 1
- Origin Family: repository collaboration
- Canonical Identifier: repository.collaboration.v1
- Base Origin: tiinex.v1.origin
- Digital Origin Medium: digital-social repository collaboration
- Digital Origin Scope: bounded repository issue, discussion, pull request, or comment surface

## Digital Boundary

- In Scope: declared repository collaboration target
- Out Of Scope: unrelated repositories, unrelated accounts, private data, secrets, hidden organization data, or platform-wide search by default
- Boundary Type: repository-defined and platform-defined digital-social boundary
- Scope Broadening Rule: explicit user action required

## Digital Material Boundary

- Digital Material: visible title, body, comments, metadata, source URL, and availability status
- Represented Subject: project collaboration around a declared repository target
- Material Status: observed, unavailable, partial, stale, cached, preserved, auth-scoped, policy-scoped, or unknown
- Does Not Prove: truth, consent, identity, acceptance, priority, task ownership, evidence, or preservation

## Access And Policy Boundary

- Access Modes: visible page, API, export, or user-provided capture
- Access Limits: bounded target only
- Policy Boundary: respect host access, rate-limit, and policy signals
- User Action Requirements: authentication, preservation, write-back, publication, or scope broadening

## Mutability And Rendering

- Mutability: material can be edited, deleted, hidden, locked, or rate-limited
- Rendering Variance: visibility and rendering may vary by account, permission, API, browser, or time
- Staleness Risk: high for live collaboration material
- Loss Modes: deletion, edit, moderation, API drift, missing context, or access change

## Use With Digital Adapters

- Recommended Adapter Use: create bounded discovery findings and candidates
- Preservation Boundary: cache or render is not preservation
- Candidate Output Boundary: feedback/task/evidence/resource/pointer candidates require review
- Not Automatic Outputs: truth, evidence, consent, identity, priority, task, feedback, or preserved material

## Failure And Ambiguity Handling

- Failure Modes: unavailable, private, forbidden, rate-limited, deleted, stale, partial, or unsupported target
- Ambiguity Modes: quotes, edits, bots, minimization, missing context, or mirrored material
- Safe Representation: visible gap/status with source identity and limits
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

## Interpretation Notes

- digital origins define reusable digital source boundaries
- digital origins include more than software development: communities, archives, public web, documents, runtime logs, datasets, sensor records, scanned paper, and digital records of nature all fit when the origin boundary is digital
- digital adapters should reference digital origins to avoid mixing platform rules with adapter output mapping
- Reddit, LinkedIn, GitHub Discussions, GitHub Issues, forums, document stores, and field-camera archives can share digital-origin discipline while still needing concrete origin definitions later
- a digital record can guide discovery, but it is not automatically preserved material or evidence

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.origin.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/origin/tiinex.origin.v1.schema.md)
  - Value: nEt9xZzJai5nFzzcI7AB_9q9hHWzVt_8KSx6nTllHdA

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: xz-wXUm8VoiFyCTl00dl_DTD57wvLFIeOj6Y5oYpayg