# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.interface.v1](../interface/tiinex.interface.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.interface.v1.schema.md](../interface/tiinex.interface.v1.schema.md)
  - Origin:
    - [relative](../interface/tiinex.interface.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/interface/tiinex.interface.v1.schema.md)
- Current
  - Current Schema: [tiinex.adapter.v1](tiinex.adapter.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Human-readable base schema for adapter definitions that carry material, signal, meaning, or state across a boundary without hiding the boundary.

---

# Adapter

- Status: draft schema note

## Summary

This schema defines adapter-definition artifacts as a specialized interface family.

An adapter is an interface-tool that helps material, meaning, signal, or state cross from one context into another without pretending the boundary disappeared. It may translate, observe, measure, import, normalize, classify, package, route, or present material so it becomes usable in Tiinex while preserving the source boundary and the limits of the crossing.

An adapter does not have to be software. A field intake procedure can adapt notebook observations into discovery findings. A scanner workflow can adapt paper material into external payload candidates. A translator can adapt a spoken answer into reviewable text. A room-booking procedure can adapt a room request into an availability or allocation candidate. A digital issue adapter can adapt issue material into discovery findings.

The adapter's job is not to prove truth. Its job is to make the crossing explicit: what source boundary it has, what may be accessed or handled, what changes during crossing, what remains only temporarily held, what becomes preserved material, and what requires deliberate user interpretation.

## Schema Validation Contract

### Adapter Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.adapter.v1`

Rules

- `tiinex.adapter.v1` identifies artifacts whose main job is to define adapter behavior and boundaries.
- An adapter definition specializes the broader `tiinex.interface.v1` idea for boundary-crossing, translation, intake, normalization, or handoff into Tiinex.
- An adapter definition describes a contract; it is not an executable adapter implementation, adapter run, intake log, preservation result, or evidence artifact by itself.
- Adapter definitions may describe physical, natural, human, social, institutional, digital, procedural, archival, runtime, or mixed adapters.
- Adapter definitions must make source boundary, translation boundary, capability, access and intake discipline, temporary holding, preservation boundary, output mapping, user action boundary, failure handling, and portability explicit.
- Base adapter language should remain human-readable without requiring knowledge of a programming language, network protocol, browser cache, API, or software framework.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Interface Specialization

Rules

- Adapter definitions inherit the interface-definition principle that contact points must declare sides, crossings, transformations, losses, action limits, and failure modes.
- Adapter definitions narrow that principle to source-boundary crossing and material translation into Tiinex-compatible artifacts or candidates.
- The continuity envelope remains inherited from `tiinex.root.v1`; this schema does not replace `Parent`, `Origin`, `Current`, or `Continuity Integrity` semantics.
- Parent interface specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Adapter Body

Required Shape

- first body heading after the continuity envelope
- `## Adapter Identity` section
- `## Source Boundary` section
- `## Translation Boundary` section
- `## Capability Declaration` section
- `## Access And Intake Discipline` section
- `## Holding And Reuse Discipline` section
- `## Preservation Boundary` section
- `## Output Mapping` section
- `## User Action Boundary` section
- `## Failure And Gap Handling` section
- `## Portability Notes` section

Optional Sections

- Materialization Operations
- Adapter Inputs
- Adapter Outputs
- Permission Boundary
- Privacy Boundary
- Preservation Decision
- Recommended UI Language
- Examples
- Related Tools
- Related Interfaces
- Related Adapters
- Related Origins
- Not Recommended For

Rules

- An adapter artifact should begin with a human-readable adapter name.
- Required sections should be readable by a human without knowing the implementation language.
- Required sections should be structured enough that a tool or LLM can extract adapter capabilities, limits, and expected outputs.
- An adapter definition should distinguish source material, adapter result, access attempt, temporary holding, preserved material, discovery finding, evidence, user interpretation, permission-sensitive action, and write action.
- An adapter definition must not claim executable behavior unless it identifies a concrete implementation surface separately from the adapter contract.

### Adapter Identity

Required Fields

- Name
- Version
- Adapter Family
- Canonical Identifier

Optional Fields

- Base Tool
- Base Interface
- Base Adapter
- Supersedes
- Related Adapter
- Implementation Surface
- Maintainer Surface
- Adapter Medium
- Origin Definition

Rules

- `Name` should be stable enough for human-readable UI and review surfaces.
- `Canonical Identifier` should be the stable machine-readable adapter id used by registries, adapter results, and generated artifacts.
- `Version` should change when source interpretation, translation boundary, output mapping, preservation semantics, access discipline, or failure handling changes.
- `Adapter Family` should identify the broad adapter class, such as repository issue discovery, repository file discovery, generic web reference, local folder discovery, bookmark import, external payload intake, field notebook intake, scanner import, translation intake, room booking intake, sensor intake, or runtime log import.
- `Adapter Medium` may identify whether the adapter is digital, physical, procedural, social, instrument-based, runtime-based, or mixed.
- `Origin Definition` may reference a reusable origin artifact when the source-side boundary should be shared across adapters.

### Source Boundary

Required Fields

- Source Type
- Source Inputs
- Access Boundary
- Does Not Access

Optional Fields

- Write Boundary
- Permission Boundary
- User Consent Boundary
- Privacy Boundary
- Source Volatility
- Source Ownership
- Physical Custody Boundary
- Origin Definition

Rules

- `Source Type` must state what kind of source or environment the adapter reads, observes, receives, or interprets.
- `Source Inputs` must state the minimal inputs needed to identify the source, such as a URL, repository, issue number, folder, file, exported payload, physical artifact, interview answer, notebook page, room request, sensor feed, or user-selected object.
- `Access Boundary` must state what the adapter is allowed to access, observe, request, receive, inspect, scan, or handle.
- `Does Not Access` must state important source surfaces the adapter must not access by default.
- `Write Boundary` must state whether writes are impossible, unsupported, explicit user action only, or out of scope.
- An adapter must not hide upload, write, permission use, cross-boundary reach, physical handling, social consent, or environmental reach behind a read-only or intake label.

### Translation Boundary

Required Fields

- From Context
- To Context
- Transformation Allowed
- Transformation Not Allowed
- Losses Or Changes

Optional Fields

- Normalization Rules
- Classification Rules
- Summarization Rules
- Measurement Rules
- Language Boundary
- Format Boundary
- Custody Boundary

Rules

- `From Context` must state the source-side context.
- `To Context` must state the Tiinex-side or target-side context.
- `Transformation Allowed` must state what translation, measurement, observation, extraction, normalization, classification, summarization, or packaging may happen.
- `Transformation Not Allowed` must state transformations the adapter must not silently perform.
- `Losses Or Changes` must state what may be lost, degraded, changed, filtered, normalized, mistranslated, or made uncertain during adaptation.
- The adapter must preserve visibility of the source boundary and translation boundary even when the output becomes easy to use.

### Capability Declaration

Required Fields

- Can Access
- Can Hold Temporarily
- Can Preserve
- Can Suggest Interpretation
- Can Write Back
- Permission Mode

Optional Fields

- Supports Conditional Access
- Supports Limit Signals
- Supports Custody Signals
- Supports Manual Refresh
- Supports Deliberate Revisit
- Supports Offline Reuse
- Supports Progressive Discovery
- Supports Preservation Warnings
- Recommended Handling
- Expected Result Stability

Rules

- `Can Access` must describe what the adapter can access, observe, receive, or handle.
- `Can Hold Temporarily` must describe whether results may be held temporarily for operation, review, transport, staging, or custody.
- `Can Preserve` must describe whether the adapter can create or support explicit preservation artifacts, attachments, snapshots, exports, transcripts, photos, or custody records.
- `Can Suggest Interpretation` must describe whether the adapter can propose stronger artifact types while requiring explicit user action.
- `Can Write Back` must state whether the adapter can change the source environment.
- `Permission Mode` must state whether permission, possession, custody, social authority, organizational authority, or user approval is none, optional, required, user-provided, inherited from runtime, physical possession, or explicit future work.

### Materialization Operations

Required When

- `Can Write Back` declares that the adapter can create, revise, delete, move, tombstone, restore, or otherwise materialize changes in an external or origin-owned environment.

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Support

Optional Fields

- Meaning
- Target Boundary
- Required Permission
- Preconditions
- History Behavior
- Atomicity Boundary
- Failure Boundary
- Notes

Allowed Labels

- supported
- unsupported
- conditional
- unknown
- create
- revise
- delete
- move
- tombstone
- restore

Rules

- Each first-level entry is one named materialization-operation declaration and declaration names must be unique within this section.
- The declaration name is the operation identifier. Recognized S1 operation identifiers are `create`, `revise`, `delete`, `move`, `tombstone`, and `restore`.
- Explicit extension operation identifiers are allowed when their meaning is declared; unknown extensions must remain visible and must not be guessed into a recognized operation.
- `Support` must be one of `supported`, `unsupported`, `conditional`, or `unknown`.
- `History Behavior` describes how the adapter or origin retains, exposes, or does not retain history while performing the declared operation; history support is not automatically a distinct `version` operation.
- `Atomicity Boundary` may describe only guarantees inside this adapter's declared mechanism boundary and must not imply atomicity across other adapters or origins.
- A planner may compare a Transition Definition's required materialization operation against these declarations, but capability support does not change the Transition Definition's semantic meaning.
- An unsupported `revise` must not be silently substituted with `create` or another operation.

### Access And Intake Discipline

Required Fields

- Access Strategy
- Deduplication
- Refresh Or Revisit Behavior
- Broadening Behavior

Optional Fields

- Access Ordering
- Access Budget
- Source Listing Strategy
- Inventory Strategy
- Probe Strategy
- Physical Intake Strategy
- Human Interview Strategy
- Repeat Handling

Rules

- Adapters should avoid blind access probes when a manifest, index, source listing, inventory, declared target, physical label, interview scope, or user-provided object can bound the search.
- Adapters should deduplicate identical in-flight access attempts, intake actions, scans, or repeated observations when the environment permits it.
- Adapters should avoid repeated handling, repeated questioning, or access storms against the same origin or source environment.
- `Refresh Or Revisit Behavior` should reuse safe source instructions, inventory checks, custody records, or human-reviewed revisit paths when available.
- `Broadening Behavior` must state how the adapter expands beyond the initial target and what user action or contract allows that expansion.
- Repeated access, repeated scanning, re-querying, or re-handling must not ignore visible source limits, delay guidance, access boundaries, privacy, safety, consent, or physical handling signals.
- Access discipline should be portable; it should not depend on one browser, one framework, one language-specific interface, one device, or one storage implementation.

### Holding And Reuse Discipline

Required Fields

- Temporary Holding
- Reuse Boundary
- Limit Signal Handling
- Delay Or Revisit Guidance

Optional Fields

- Working Copy Handling
- Runtime Holding
- Source Instruction Handling
- Private Handling
- Local Inventory Handling
- Physical Custody Handling
- Interview Note Handling

Rules

- Adapter definitions must distinguish temporary operational holding from Tiinex artifact preservation.
- Adapter definitions must distinguish transport holding, runtime holding, staging, custody, working notes, and preserved material.
- If an origin or source gives visible access, custody, safety, privacy, delay, lockout, quota, or consent signals, the adapter should respect them when they are visible to the runtime or operator.
- A source instruction against storage or reuse should prevent adapter-level storage of source material unless a user explicitly chooses a preservation action and the artifact records the decision boundary.
- Private or scoped material should be treated as local-user scoped and not as broadly shareable held material.
- Unavailable, inaccessible, unsafe, consent-blocked, limited, physically unavailable, or custody-broken material should become a visible gap, not a silent success or repeated loop.

### Preservation Boundary

Required Fields

- Preservation Policy
- Preservation Warning Reasons
- User Override Behavior

Optional Fields

- Recommended Preservation Schema
- External Payload Behavior
- Evidence Behavior
- Snapshot Behavior
- Attachment Behavior
- Custody Behavior
- Retention Boundary

Rules

- Accessed material is not automatically preserved material.
- Temporarily held material is not automatically preserved material.
- Preserved material requires an explicit artifact boundary, attachment, export, snapshot, transcript, custody record, or user-declared preservation action.
- An adapter must state when preservation is recommended, discouraged, warned, unavailable, or explicit-user-action only.
- Preservation warnings should call out mutable, private, permission-scoped, volatile, unsafe, legally constrained, socially constrained, physically fragile, custody-broken, or lossy material.
- User override behavior must explain how a user can consciously preserve material despite warnings and how that decision should be recorded.

### Output Mapping

Required Fields

- Primary Output Schemas
- Candidate Output Schemas
- Must Not Auto-Claim

Optional Fields

- Output Status Values
- Finding Mapping
- Evidence Mapping
- Task Mapping
- Feedback Mapping
- Resource Need Mapping
- Pointer Mapping
- External Payload Mapping
- Relation Mapping
- Event Mapping
- Access Mapping
- Preservation Mapping
- Interpretation Mapping

Rules

- Adapter definitions must state what artifact schemas they may produce directly.
- Adapter definitions must state what schemas are only candidates for explicit user interpretation.
- Discovery findings must not automatically become feedback, tasks, evidence, resource needs, pointers, acceptance, consent, validation, event attendance, availability, or truth claims.
- `Use as` or equivalent creation actions should be required when a user interprets a finding as a stronger or different artifact type.
- Adapter output should prefer weaker, reviewable artifact types when source material is unavailable, partial, ambiguous, stale, lossy, or unpreserved.

### User Action Boundary

Required Fields

- Access Actions
- Refresh Or Revisit Actions
- Preservation Actions
- Interpretation Actions
- Write Actions
- Permission Actions

Optional Fields

- Retry Or Repeat Actions
- Export Actions
- Open Source Actions
- Review Actions
- Physical Handling Actions
- Social Consent Actions

Rules

- Access actions must stay inside the declared source boundary.
- Refresh, revisit, repeated access, preservation, interpretation, export, permission use, write, publish, send, destructive, physical handling, and social consent actions must be explicit when they carry user risk or authority.
- Adapter definitions must state which actions are automatic, user-initiated, disabled, unsupported, or future work.
- Hidden writes, hidden uploads, hidden permission use, hidden telemetry, hidden cross-context access, hidden physical handling, hidden social consent, and silent stronger interpretation are not allowed under this contract.

### Failure And Gap Handling

Required Fields

- Failure Signals
- Gap Representation
- Fallback Behavior
- User-Visible Status

Optional Fields

- Partial Result Behavior
- Stale Result Behavior
- Deleted Source Behavior
- Mutable Source Behavior
- Limited Source Behavior
- Unsafe Source Behavior
- Physical Loss Behavior
- Consent Failure Behavior
- Custody Failure Behavior

Rules

- Adapter definitions must state how failures, partial results, stale results, deleted sources, mutable sources, unavailable sources, limited sources, unsafe sources, consent failures, and custody failures are represented.
- Known source targets that cannot be loaded, inspected, translated, scanned, or handled should remain visible as gaps when the target identity is known.
- Gaps should not be hidden as empty success.
- Fallback behavior should preserve target identity and failure context without inventing source content.
- User-visible status should distinguish live, held, stale, unavailable, failed, deferred, partial, ambiguous, access-limited, consent-blocked, custody-broken, and fallback states when possible.

### Portability Notes

Required Fields

- Portable Semantics
- Environment Assumptions
- Non-Portable Details

Optional Fields

- Browser Notes
- CLI Notes
- Extension Notes
- Local Runtime Notes
- Server Runtime Notes
- Field Procedure Notes
- Physical Environment Notes
- Social Procedure Notes
- LLM Runtime Notes

Rules

- `Portable Semantics` must state what meaning should survive across implementations or environments.
- `Environment Assumptions` must state what an implementation, operator, source environment, or procedure needs in order to implement the adapter.
- `Non-Portable Details` must state details that depend on a particular runtime, device, source, permission model, language, organization, body, place, custody model, or physical environment.
- Adapter definitions should be useful even when the original app implementation is unavailable.

### File Naming

Allowed Shapes

- `<adapter-slug>.adapter.md`
- `<adapter-slug>-adapter.md`
- `<lineage>-adapter.trace.md`
- `<lineage>-<adapter-slug>.trace.md`

Rules

- Adapter artifacts should use a slug that identifies the adapter or adapter family.
- Lineage-first `.trace.md` names should be used when the adapter artifact is part of an ordinary local trace lineage.
- Canonical registry-like adapter artifacts may use an adapter slug without a lineage prefix when the artifact is intentionally maintained as a reusable adapter definition.
- Canonical registry-like adapter definitions may use `.adapter.md` when the artifact is intentionally maintained as a reusable adapter contract.
- Definition filenames and schema ids are distinct: `tiinex.adapter.v1` is the schema id, while concrete adapter definition filenames may follow repository-local `.adapter.md` conventions.
- `.adapter.md` files define adapter semantics; they are not executable adapter implementations, adapter runs, access logs, intake logs, or validation result ledgers.

### Interpretation Boundaries

Rules

- Use `tiinex.adapter.v1` to define adapter semantics, not to record one adapter result.
- A specific adapter result may reference an adapter definition but should be owned by the schema that records that result.
- Adapter definitions should parent or reference broader interface definitions when that improves portable lineage.
- Adapter definitions may later be narrowed by descendants such as digital adapter, repository adapter, browser adapter, local folder adapter, runtime log adapter, scanner adapter, field notebook adapter, interview adapter, booking adapter, or physical intake adapter schemas if needed.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Name
- Version
- Adapter Family
- Canonical Identifier
- Source Type
- Source Inputs
- Access Boundary
- Does Not Access
- From Context
- To Context
- Transformation Allowed
- Transformation Not Allowed
- Losses Or Changes
- Can Access
- Can Hold Temporarily
- Can Preserve
- Can Suggest Interpretation
- Can Write Back
- Permission Mode
- Access Strategy
- Deduplication
- Refresh Or Revisit Behavior
- Broadening Behavior
- Temporary Holding
- Reuse Boundary
- Limit Signal Handling
- Delay Or Revisit Guidance
- Preservation Policy
- Preservation Warning Reasons
- User Override Behavior
- Primary Output Schemas
- Candidate Output Schemas
- Must Not Auto-Claim
- Access Actions
- Refresh Or Revisit Actions
- Preservation Actions
- Interpretation Actions
- Write Actions
- Permission Actions
- Failure Signals
- Gap Representation
- Fallback Behavior
- User-Visible Status
- Portable Semantics
- Environment Assumptions
- Non-Portable Details

Optional Sections

- Materialization Operations

### Creation Rules

Rules

- Creation tools should prefer boundary-crossing language over software-only adapter language.
- Creation tools should not imply that an adapter definition is proof of a successful adapter run, successful preservation, or successful interpretation.
- Creation tools should require explicit action boundaries before suggesting any adapter that can write, send, publish, mutate, use permission, physically handle, socially affect, or preserve material.
- Creation tools should default unknown authority, unknown preservation, unknown evidence, unknown consent, and unknown interpretation to unknown, not assumed.
- Creation tools should keep `Finding ≠ Feedback/Task/Evidence unless explicitly used as that type` visible in adapter definitions that produce discovery findings.
- When `Can Write Back` declares materialization support, creation tools should include structured `Materialization Operations` declarations rather than relying on `Write Actions` prose alone.

## Minimal Example

```md
# Field Notebook Intake Adapter

## Adapter Identity

- Name: Field notebook intake adapter
- Version: 1
- Adapter Family: field notebook intake
- Canonical Identifier: field.notebook.intake.v1
- Base Interface: tiinex.interface.v1
- Adapter Medium: procedural

## Source Boundary

- Source Type: field notebook page
- Source Inputs: notebook identifier and selected page or entry
- Access Boundary: selected page or entry only
- Does Not Access: unrelated notebook pages, private notes outside the selected entry, or physical material not handed to the operator

## Translation Boundary

- From Context: handwritten field note
- To Context: Tiinex discovery finding candidate
- Transformation Allowed: transcribe visible text and record uncertain words
- Transformation Not Allowed: invent missing words, infer intent, or treat the note as evidence of truth
- Losses Or Changes: handwriting ambiguity, transcription loss, missing surrounding context

## Capability Declaration

- Can Access: selected notebook entry
- Can Hold Temporarily: temporary working transcription
- Can Preserve: explicit scan, photo, transcript, or payload artifact only
- Can Suggest Interpretation: yes, as discovery finding or candidate
- Can Write Back: no by default
- Permission Mode: physical possession or explicit permission

## Access And Intake Discipline

- Access Strategy: bounded intake of selected entry
- Deduplication: avoid duplicate transcription of the same entry unless revisiting is declared
- Refresh Or Revisit Behavior: explicit revisit with time and reason
- Broadening Behavior: requires explicit selection of additional pages or entries

## Holding And Reuse Discipline

- Temporary Holding: working transcript only
- Reuse Boundary: reuse as operational aid, not preserved material
- Limit Signal Handling: respect privacy, custody, and handling limits
- Delay Or Revisit Guidance: repeat handling only when safe and permitted

## Preservation Boundary

- Preservation Policy: preserve only by explicit scan, photo, transcript artifact, or external payload
- Preservation Warning Reasons: private notes, fragile material, incomplete context, uncertain handwriting
- User Override Behavior: user may preserve with visible source, time, custody, and uncertainty notes

## Output Mapping

- Primary Output Schemas: tiinex.discovery.finding.v1
- Candidate Output Schemas: tiinex.evidence.v1, tiinex.feedback.v1, tiinex.task.v1, tiinex.resource.need.v1
- Must Not Auto-Claim: truth, intent, consent, evidence, task, feedback, or complete context

## User Action Boundary

- Access Actions: inspect selected entry
- Refresh Or Revisit Actions: explicit revisit only
- Preservation Actions: explicit scan, photo, transcript, or payload action
- Interpretation Actions: explicit Use as / Create from finding
- Write Actions: none by default
- Permission Actions: physical possession or explicit permission required

## Failure And Gap Handling

- Failure Signals: unreadable handwriting, missing page, no permission, partial page, uncertain date
- Gap Representation: record the selected entry identity and uncertainty
- Fallback Behavior: preserve target identity without inventing text
- User-Visible Status: observed, partial, ambiguous, unavailable, or permission-blocked

## Portability Notes

- Portable Semantics: source boundary, transcription limits, preservation boundary, and interpretation boundary
- Environment Assumptions: operator can inspect selected notebook entry with permission
- Non-Portable Details: notebook format, handwriting, language, custody rules, and capture device
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Adapter Identity`, `## Source Boundary`, `## Translation Boundary`, `## Capability Declaration`, `## Access And Intake Discipline`, `## Holding And Reuse Discipline`, `## Preservation Boundary`, `## Output Mapping`, `## User Action Boundary`, `## Failure And Gap Handling`, `## Portability Notes`.
When `## Materialization Operations` is present, each first-level declaration name is the operation identifier and `Support` is explicit; planners must not infer operation support from prose alone.

## Interpretation Notes

- adapters are specialized interfaces, not software-only connectors
- an adapter may translate, observe, measure, import, normalize, classify, package, route, or present material
- adapter output is not automatically truth, evidence, consent, identity, preservation, validation, attendance, availability, allocation, or authority
- digital transport details belong in digital adapter specializations, not in the base adapter contract

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.interface.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/interface/tiinex.interface.v1.schema.md)
  - Value: X2gjcH_wX5G4Z-aU_MmCYSiSBrs4kfGbYWqSCum-FEU

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Qjmwy4Cbqbpgc3OJEdMqudiqohNUYn5uUifls80Mqb4
