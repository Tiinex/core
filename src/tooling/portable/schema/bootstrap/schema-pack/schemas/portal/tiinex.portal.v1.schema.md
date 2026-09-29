# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.portal.v1](tiinex.portal.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines a bounded source-resolution doorway so tools and people can request or resolve a view into a source without collapsing source, adapter, portal, finding, evidence, or preservation.
  - Summary: Portal schema for source-resolution boundaries and bounded source views.

---

# Portal

## Summary

Defines a human-readable and machine-extractable source-resolution boundary.

A portal is a bounded doorway into a source. It records what source or source region is being requested, why it is being opened, what access or resolution method is allowed, what state was resolved, and what must not be inferred from the portal result.

Portal does not mean user interface view, layout, generic navigation state, source, adapter, discovery finding, evidence, or preservation. A portal may be exposed by an interface or tool, may use an adapter, may observe a source, may produce findings, and may later support evidence or preservation workflows, but it does not become any of those things by itself.

## Core Semantics

- Portal = source-resolution boundary.
- Verse = bounded artifact universe.
- Atlas = spatial projection or navigational view over artifacts or relations.
- View = presentation, layout, filter, selection, or route state.
- A portal asks for or records a bounded way to look into a source.
- A portal must keep source, adapter, portal, finding, evidence, and preservation distinct.
- A portal may be unresolved, user-invoked, resolved, failed, unavailable, or intentionally deferred.
- A portal may be used by humans, LLMs, CLI tools, browser tools, paper workflows, or software environments.
- A portal must not imply source completeness, historical completeness, evidence status, preservation, truth, consent, authorship, or validation unless those claims are supported by the appropriate artifact or method.

## Schema Validation Contract

### Portal Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.portal.v1`

Rules

- `tiinex.portal.v1` identifies artifacts whose main job is to define a bounded source-resolution doorway.
- A portal must distinguish portal identity, target source, access boundary, trigger semantics, resolution policy, resolution state, result boundary, and interpretation limits.
- A portal must not silently become a source, adapter, discovery finding, evidence artifact, preservation artifact, validation result, UI route, or presentation surface.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Portal Body

Required Shape

- first body heading after the continuity envelope
- `## Portal Identity` section
- `## Target Source` section
- `## Access Boundary` section
- `## Trigger Boundary` section
- `## Resolution Policy` section
- `## Resolution State` section
- `## Result Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Resolved Source Anchor`
- `Discovery Scope`
- `User Input Boundary`
- `Adapter Binding`
- `Related Artifacts`
- `Examples`
- `Relationship to Other Schemas`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should be structured enough that a person, LLM, or validator can extract portal boundaries without guessing.
- Optional sections must not replace declared portal identity, resolution policy, result boundary, or interpretation limits.

### Portal Identity

Required Fields

- Portal Name
- Portal ID
- Portal Type
- Portal Status

Optional Fields

- Portal Version
- Owner Schema
- Owner Module
- Related Portal

Allowed Labels

- source
- time
- path
- query
- search
- manual-input
- external-event
- composite
- draft
- requested
- needs-input
- resolving
- resolved
- failed
- unavailable
- deferred
- deprecated

Rules

- `Portal ID` should be stable enough for tools, reports, and users to reference.
- `Portal Type` must describe the source-resolution boundary, not the UI layout.
- `Portal Status` must not imply success, evidence, or preservation unless supported elsewhere.

### Target Source

Required Fields

- Source Kind
- Source Identifier

Optional Fields

- Source Schema
- Source Artifact
- Source URL
- Repository
- Ref
- Root Path
- Source Owner
- Source Trust Boundary

Rules

- `Target Source` identifies what source or source region the portal is about.
- Target source fields must not be used to claim that the source was fully accessed, preserved, verified, or interpreted.
- If the source identity is unknown or unresolved, that state must be explicit.

### Access Boundary

Required Fields

- Access Method
- Access Authority

Optional Fields

- Adapter
- Tool
- Interface
- Authentication
- Network Requirement
- Privacy Boundary
- Rate Limit Boundary
- User-Invoked Source UI
- Source Access Mode
- Local Storage Boundary
- Browser Remote Git Boundary
- Service Boundary

Allowed Labels

- public
- local
- user-provided
- user-invoked
- authenticated
- unavailable
- unknown
- web-surface
- local-working-tree
- local-git-archive
- browser-remote-git
- service-backed-git

Rules

- `Access Method` must state how the portal may attempt to view or resolve the source.
- `Source Access Mode`, when present, should use a bounded mode such as `web-surface`, `local-working-tree`, `local-git-archive`, `browser-remote-git`, or `service-backed-git`.
- `web-surface` describes lightweight web/API/document access and must not imply full source history.
- `local-working-tree` describes explicit user-provided local material without requiring Git history.
- `local-git-archive` describes explicit user-provided local material whose `.git` history may be inspected locally; it must not imply upload, telemetry, network access, evidence, preservation, or source completeness.
- `browser-remote-git` describes browser-side clone, fetch, pull, or log capability and must state CORS, authentication, browser storage, memory, and repository-size boundaries when they matter.
- `service-backed-git` describes a helper or service-backed access boundary and must keep service trust, authentication, privacy, and disclosure limits explicit.
- API, authentication, paywalled, private, or rate-limited access must be explicit.
- A portal must not hide source access assumptions in application code.
- Git access may resolve refs, commits, trees, or blobs as source-state anchors, but it does not by itself preserve material, validate artifacts, prove claims, or create evidence.
- `User-Invoked Source UI` should be used for explicit user-scoped opening of external source interfaces; avoid `auto` language unless the source UI truly opens without explicit user action.

### Trigger Boundary

Required Fields

- Allowed Triggers
- Trigger Limits

Optional Fields

- User Confirmation
- Cadence
- External Event Source
- Manual Input Shape

Allowed Labels

- workspace-init
- artifact-open
- explicit-refresh
- discover-visible
- follow-cadence
- monitoring-cadence
- external-event
- manual-input

Rules

- `Allowed Triggers` must describe when a portal may be invoked or refreshed.
- `discover-visible` should be used when visible discoverable material may be refreshed by a user-facing discover action.
- `manual-input` should describe a person-provided resolution path, not a hidden source access action.
- A trigger must not imply source completeness or preservation.

### Resolution Policy

Required Fields

- Resolution Mode
- Required Inputs
- Fallback Behavior

Optional Fields

- Resolver
- Accepted User Inputs
- No API Policy
- Historical Policy
- Completeness Policy
- Error Policy

Rules

- `Resolution Mode` must state how a portal should attempt to resolve the source boundary.
- If user input is required, `needs-input` should be preferred over `failed`.
- Fallback behavior must state what remains true when resolution is partial, unavailable, or user-supplied.

### Resolution State

Required Fields

- State
- Resolved By

Optional Fields

- Resolver
- Resolved At
- Confidence
- User Input Used
- Failure Reason
- Missing Inputs

Allowed Labels

- not-started
- needs-input
- resolving
- resolved
- partial
- failed
- unavailable
- skipped
- deferred

Rules

- `State` describes portal resolution, not artifact validity or evidence status.
- `needs-input` means required input is missing; it does not mean resolution failed.
- User-provided anchors must be disclosed as user-provided unless independently resolved by another method.

### Result Boundary

Required Fields

- Completeness
- Evidence State
- Preservation State

Optional Fields

- Historical Guarantee
- Snapshot Boundary
- Known Limits
- Fallback Semantics
- Promotable To Finding
- Promotable To Evidence

Allowed Labels

- unknown
- source-state-bounded
- current-web-state-only
- manifest-bounded
- partial
- observation-only
- candidate-finding
- fetched-not-preserved
- preserved-elsewhere
- not-evidence

Rules

- Fetched material is not preserved unless a preservation artifact or method supports that claim.
- Observed material is not evidence unless promoted by user action or policy and represented by the appropriate artifact.
- Current web state must not be used to claim historical completeness unless the source provides a bounded historical anchor.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Known Ambiguities
- Trust Boundary
- Overclaim Risk
- Missing Context

Rules

- A portal must state important claims it does not support.
- A portal must not imply truth, authorship, consent, identity, source completeness, evidence status, preservation, or validation unless those claims are explicitly supported elsewhere.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.portal.v1` artifact when a bounded source-resolution doorway must be named, invoked, reviewed, or reused as provenance.
- Do not create a portal artifact for the source itself, an adapter definition, a discovery finding, an evidence artifact, a preservation artifact, or a generic UI view, route, layout, or component.
- A portal artifact should preserve source-resolution boundaries without claiming that the target source has been fully observed.

### Required Inputs

Required Fields

- Portal Name
- Portal Type
- Target Source Kind
- Target Source Identifier
- Access Method
- Access Authority
- Allowed Triggers
- Resolution Mode
- Required Inputs
- Fallback Behavior
- Current Resolution State
- Result Completeness Boundary
- Evidence State
- Preservation State
- Interpretation Limits

Optional Fields

- Source Access Mode
- User-Invoked Source UI
- Resolved Anchors
- Full Commit SHA
- Short Display Label
- Related Adapter
- Related Discovery

Rules

- Unknown source identity, missing access details, unresolved anchors, and partial result boundaries should be explicit.
- Git refs, commits, trees, or blobs may be recorded as source-state anchors when actually resolved, but they do not by themselves create preservation, evidence, validation, claim proof, or truth.

### Generation Rules

Rules

- Name the portal in human-readable terms.
- Identify the target source without claiming that it has been fully observed.
- Declare how access is allowed and who or what may invoke it.
- Declare trigger boundaries using the allowed trigger vocabulary when possible.
- Declare resolution policy and fallback behavior.
- Record the current resolution state.
- Record result boundaries and interpretation limits.
- Add resolved anchors only when they are actually known.
- Leave evidence, preservation, validation, and findings to their own artifacts.

### Suggested Sequence

Rules

- Identify the source-resolution doorway.
- Identify the target source kind and identifier, or mark them unknown.
- Declare access authority and trigger boundaries.
- Declare resolution and fallback behavior.
- Record current state, result boundary, and interpretation limits.
- Link adapters, discoveries, or preserved material without absorbing their semantics.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Creation guidance should be derived from the same required sections, fields, labels, and rules whenever possible.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Tiinex/docs Source Portal

## Portal Identity

Portal Name: Tiinex/docs repository portal
Portal ID: tiinex.portal.docs-source.v1
Portal Type: source
Portal Status: resolved

## Target Source

Source Kind: GitHub repository
Source Identifier: Tiinex/docs
Repository: Tiinex/docs
Root Path: .topics

## Access Boundary

Access Method: public GitHub web and raw file fetch
Access Authority: public
Adapter: github.repository.discovery.v1
User-Invoked Source UI: GitHub repository page

## Trigger Boundary

Allowed Triggers: workspace-init, explicit-refresh, discover-visible, manual-input
Trigger Limits: refresh only visible or configured source material unless a follow or monitoring artifact expands scope

## Resolution Policy

Resolution Mode: public-git-ref
Required Inputs: repository identifier and optional ref/path
Fallback Behavior: if no ref is supplied, current default branch may be shown as current-web-state-only

## Resolution State

State: resolved
Resolved By: public source reference
Resolver: github-public-web

## Resolved Source Anchor

Anchor Kind: git-commit
Commit SHA: e4173f1faca1f4de8ed923220a6aa87438affae2
Short Label: e4173f1
Anchor URL: https://github.com/Tiinex/docs/tree/e4173f1faca1f4de8ed923220a6aa87438affae2

## Result Boundary

Completeness: source-state-bounded
Evidence State: observation-only
Preservation State: fetched-not-preserved
Historical Guarantee: bounded to resolved git commit when commit is supplied

## Interpretation Limits

Does Not Mean: the repository content is true, preserved, complete beyond the resolved ref, or validated
Must Not Be Used To Claim: evidence status, authorship, consent, or full historical completeness
```

## Relationship to Other Schemas

- `source` identifies where material lives.
- `adapter` identifies how material may be accessed.
- `portal` identifies which bounded view into the source is being requested or resolved.
- `discovery finding` records what was observed.
- `evidence` records material promoted to evidence.
- `preservation` records preservation semantics.
- `interface` may expose a portal to a user or tool.
- `presentation.surface` may show a portal or portal result inside a bounded surface.
- `schema.module` may declare portal capabilities for a schema family or tool workflow.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fQKO3avSlTJmWmyUhnGB8-TSFQjFQgQtWxyHB9u_Wzg