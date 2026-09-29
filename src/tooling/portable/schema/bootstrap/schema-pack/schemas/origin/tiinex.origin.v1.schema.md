# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.origin.v1](tiinex.origin.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for origin definitions that declare where material, signal, observation, or context may come from without treating that origin as automatic truth, evidence, consent, identity, or preservation.

---

# Origin

- Status: draft schema note

## Summary

This schema defines origin artifacts.

An origin is a declared place, source, environment, platform, person-facing surface, natural system, archive, instrument context, institution, repository, dataset, conversation surface, or other starting point from which material, signal, observation, context, or claims may be encountered.

An origin definition does not prove that any particular artifact came from that origin. It defines how that origin should be named, scoped, approached, and bounded when tools, interfaces, adapters, validators, humans, or LLM runtimes work with it.

The human rule is simple: an origin is where the trail may begin, not what the trail proves. A coast is not the map. A forest is not the photograph. A person is not their post. A platform is not truth. A repository is not evidence by itself.

## Schema Validation Contract

### Origin Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.v1.origin`

Rules

- `tiinex.v1.origin` identifies origin definitions that declare a reusable source or starting context boundary.
- Origin definitions must keep origin identity, access boundary, material boundary, mutability, authority limits, privacy limits, and interpretation limits distinct.
- Origin definitions may describe physical, natural, human, social, institutional, digital, procedural, archival, runtime, or mixed origins.
- Origin definitions are not adapter definitions, validation methods, evidence artifacts, consent artifacts, or truth ledgers.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Origin Body

Required Shape

- first body heading after the continuity envelope
- `## Origin Identity` section
- `## Origin Boundary` section
- `## Material And Signal Boundary` section
- `## Access And Authority Boundary` section
- `## Mutability And Loss` section
- `## Use With Tools And Adapters` section
- `## Failure And Ambiguity Handling` section
- `## Portability Notes` section

Optional Sections

- Natural Or Physical Context
- Social Or Community Context
- Digital Context
- Institutional Context
- Privacy Or Safety Context
- Stewardship Or Ownership
- Related Origins
- Examples
- Not Recommended For

Rules

- An origin artifact should begin with a human-readable origin name.
- `Origin Identity` must identify the origin and version.
- `Origin Boundary` must state what is in scope and what is out of scope.
- `Material And Signal Boundary` must state what can be encountered from the origin and what that material or signal does not prove by itself.
- `Access And Authority Boundary` must state who or what may access the origin and what authority is not implied by access.
- `Mutability And Loss` must state how material, access, context, or conditions may change or disappear.
- `Use With Tools And Adapters` must state how tools, interfaces, and adapters may approach the origin without collapsing origin into evidence or truth.
- `Failure And Ambiguity Handling` must state how unknown, unavailable, contested, partial, private, unsafe, or ambiguous origin states should be represented.

### Origin Identity

Required Fields

- Name
- Version
- Origin Family
- Canonical Identifier
- Origin Medium
- Origin Scope

Optional Fields

- Supersedes
- Related Origin
- Parent Origin
- Child Origin
- Steward Or Maintainer
- Region Or Host
- Natural Or Physical Referent
- Digital Surface
- Social Surface
- Institutional Surface

Rules

- `Canonical Identifier` should be the stable machine-readable origin id.
- `Origin Family` should describe the broad family, such as natural place, physical object, person-facing surface, social platform, repository host, public web, archive, institution, dataset, instrument source, runtime surface, local file set, or mixed origin.
- `Origin Medium` should state physical, natural, human, social, digital, institutional, procedural, archival, runtime, mixed, or another precise medium.
- `Origin Scope` should define the bounded unit being described.
- An origin definition should not imply ownership, authorship, consent, authority, or truth unless that is separately established by another artifact or method.

### Origin Boundary

Required Fields

- In Scope
- Out Of Scope
- Boundary Type
- Boundary Stability

Optional Fields

- Scope Unit
- Scope Examples
- Exclusion Examples
- Boundary Owner
- Boundary Steward
- Boundary Risk

Rules

- `In Scope` must state what the origin definition includes.
- `Out Of Scope` must state important nearby things the origin definition does not include.
- `Boundary Type` should state whether the boundary is natural, physical, social, platform-defined, institutional, file-system-based, account-based, repository-based, document-based, runtime-based, procedural, or mixed.
- `Boundary Stability` must state whether the boundary is stable, mutable, policy-defined, socially fluid, physically changing, seasonally changing, or unknown.
- Boundaries should be narrow enough that a tool or adapter can avoid silent scope broadening.

### Material And Signal Boundary

Required Fields

- Possible Material Or Signal
- Material Or Signal Status
- Does Not Prove

Optional Fields

- Direct Observation
- Indirect Observation
- Digital Representation
- Human Statement
- Instrument Signal
- Environmental Condition
- Capture Conditions
- Context Needed

Rules

- `Possible Material Or Signal` must state what kinds of material, signal, observation, message, record, trace, or condition may be encountered from the origin.
- `Material Or Signal Status` must state whether material may be direct, indirect, observed, reported, digital, physical, preserved, cached, partial, stale, unavailable, contested, sampled, inferred, or unknown.
- `Does Not Prove` must state important claims that material or signal from the origin does not automatically prove.
- Digital representations of natural, physical, social, or human origins must not be treated as the origin itself.
- Human or community statements must not be treated as consent, identity, authority, intent, representativeness, or truth by default.

### Access And Authority Boundary

Required Fields

- Access Modes
- Authority Limits
- User Action Requirements

Optional Fields

- Public Access
- Private Access
- Permission Boundary
- Authentication Boundary
- Physical Access Boundary
- Safety Boundary
- Legal Or Policy Boundary
- Consent Boundary

Rules

- `Access Modes` must state how the origin may be approached, observed, read, visited, requested, measured, imported, or referenced.
- `Authority Limits` must state what access does not authorize or prove.
- `User Action Requirements` must state which actions require explicit human approval.
- Private, restricted, unsafe, consent-sensitive, policy-limited, or physically intrusive access must be declared rather than assumed.
- Origins involving people, communities, places, wildlife, or sensitive environments should be explicit about privacy, consent, safety, and stewardship boundaries.

### Mutability And Loss

Required Fields

- Mutability
- Loss Modes
- Staleness Risk

Optional Fields

- Deletion Risk
- Edit Risk
- Seasonal Change
- Environmental Change
- Moderation Risk
- Policy Change
- Personalization Risk
- Access Drift

Rules

- `Mutability` must state whether the origin, its material, or the conditions around it can change.
- `Loss Modes` must state how material, access, context, conditions, or meaning may be lost.
- `Staleness Risk` must state how quickly an observation or record may become stale when known.
- Mutable origins must not be represented as stable records unless preservation, timestamping, or another method supports that claim.

### Use With Tools And Adapters

Required Fields

- Tool Use
- Interface Use
- Adapter Use
- Preservation Boundary

Optional Fields

- Navigation Use
- Validation Use
- Evidence Use
- Discovery Use
- Runtime Use
- Recommended Adapter Families
- Not Recommended For

Rules

- `Tool Use` should describe how tools may work with this origin family.
- `Interface Use` should describe the contact boundary between the actor and origin.
- `Adapter Use` should describe how material or signal may be carried into Tiinex-compatible artifacts or candidates.
- `Preservation Boundary` must distinguish encounter, access, observation, capture, cache, transcription, and durable preservation.
- An origin definition may guide adapters, but it must not silently create adapter outputs.
- Evidence, feedback, task, resource need, consent, validation, and truth claims require explicit downstream schemas or methods.

### Failure And Ambiguity Handling

Required Fields

- Failure Modes
- Ambiguity Modes
- Safe Representation

Optional Fields

- Unknown Origin
- Contested Origin
- Missing Context
- Partial Access
- Unsafe Access
- Private Or Restricted State
- Policy Or Stewardship Conflict

Rules

- `Failure Modes` must state how access, observation, interpretation, or preservation can fail.
- `Ambiguity Modes` must state common ambiguous cases.
- `Safe Representation` must state how tools and adapters should represent uncertainty without inventing missing origin state.
- Unknown, partial, unavailable, contested, private, unsafe, or policy-restricted origins should remain visible as gaps, not silent success.

### File Naming

Allowed Shapes

- `tiinex.v1.origin.md`
- `<origin-slug>.origin.md`
- `<origin-slug>-origin.md`
- `<lineage>-origin.trace.md`
- `<lineage>-<origin-slug>.trace.md`

Rules

- `tiinex.v1.origin.md` is the reserved base origin contract filename for the `tiinex.v1.origin` origin family.
- Origin artifacts should use a slug that identifies the origin family, platform, environment, place, institution, dataset, source surface, or origin boundary.
- Canonical registry-like origin definitions may use `.origin.md` when the artifact is intentionally maintained as a reusable origin definition.
- Trace-lineage origin artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.v1.origin` to define origin boundaries, not to prove a specific artifact's provenance.
- Root-envelope `Origin` entries may point to concrete locations, paths, URLs, or recovery surfaces; origin definition artifacts explain reusable origin semantics.
- An adapter may reference an origin definition, but adapter output remains separate from origin truth.
- An origin definition should not collapse source, adapter result, discovery finding, evidence, consent, validation, or preservation into one claim.

## Artifact Creation Contract

### Creation Intent

Rules

- Create an origin artifact when defining a reusable origin boundary, source family, platform family, environment, archive, physical or natural source context, dataset, institution, repository host, public surface, or runtime surface.
- Do not create an origin artifact merely to record that one artifact has a URL or parent.

### Parent Selection

Rules

- A base origin contract may parent the origin schema note.
- A specialized origin may parent the nearest broader origin contract.
- A local origin observation or investigation may parent an ordinary trace artifact if it is part of a local lineage rather than a reusable origin definition.

### Creation Checks

Rules

- Declare origin identity, scope, material/signal boundary, access boundary, mutability, use with tools/adapters, and failure handling.
- Keep origin definition separate from adapter implementation and evidence claims.
- Mark unknown, restricted, mutable, unsafe, or contested origin state explicitly.

### Recommended Output

Rules

- Use a human-readable origin name.
- Include enough structured fields for tools and LLMs to identify the boundary without guessing.
- Prefer narrow origin definitions over broad platform or environment claims when practical.

### Not Recommended

Rules

- Do not use origin artifacts as proof that material came from that origin.
- Do not use origin artifacts as consent, identity, authority, truth, evidence, validation, or preservation artifacts.
- Do not broaden a person's, community's, platform's, place's, archive's, or ecosystem's scope without explicit boundary.
## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.v1.origin
  - Created At: 2026-06-29 00:00:00
  - Summary: Origin boundary for a bounded public web community surface.

---

# Public Web Community Origin

## Origin Identity

- Name: public web community origin
- Version: 1
- Origin Family: public web community
- Canonical Identifier: public.web.community.v1
- Origin Medium: digital-social
- Origin Scope: bounded public community surface

## Origin Boundary

- In Scope: declared public community page, thread, post, or comment surface
- Out Of Scope: private messages, unrelated accounts, unrelated communities, hidden moderation surfaces, and platform-wide search
- Boundary Type: platform-defined social-digital boundary
- Boundary Stability: mutable and policy-defined

## Material And Signal Boundary

- Possible Material Or Signal: visible posts, comments, metadata, links, reactions, and availability status
- Material Or Signal Status: observed, unavailable, partial, stale, deleted, moderated, cached, preserved, or unknown
- Does Not Prove: truth, identity, consent, intent, representativeness, authority, evidence, or preservation

## Access And Authority Boundary

- Access Modes: declared read, export, or user-provided material
- Authority Limits: access does not authorize broad crawling, writes, identity claims, or consent claims
- User Action Requirements: authentication, preservation, publication, write-back, or scope broadening

## Mutability And Loss

- Mutability: posts and visibility may change
- Loss Modes: deletion, edits, moderation, rate limits, access changes, or missing context
- Staleness Risk: high for live public web material

## Use With Tools And Adapters

- Tool Use: viewers and runtimes may show boundary and uncertainty
- Interface Use: public page, export, API, or user-supplied capture
- Adapter Use: create discovery findings or candidates, not automatic truth
- Preservation Boundary: a visible page is not preserved until an explicit snapshot/export/artifact exists

## Failure And Ambiguity Handling

- Failure Modes: unavailable, private, deleted, partial, blocked, rate-limited, or policy-scoped material
- Ambiguity Modes: quoted text, reposts, bots, edits, impersonation, missing context
- Safe Representation: show visible gap and limitation rather than inventing missing content
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

## Interpretation Notes

- origins define reusable source boundaries, not proof of provenance
- root-envelope origin entries can name concrete recovery paths while origin definition artifacts describe reusable boundary semantics
- tools and adapters may reference origin definitions to avoid scope drift
- digital, natural, social, institutional, archive, dataset, and runtime origins can share origin discipline while remaining different domains
- a person, community, platform, forest, river, instrument, repository, or archive is never reduced to one fetched or observed record
- origin definitions should help explorers carry a map without pretending the map is the land

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/2a40646640f7468bcd250df6988b69e9f047f1bb/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: WqxdfT487yJPP10-k6EPbAe3lhoLNhaR6s-O4lTX-dE