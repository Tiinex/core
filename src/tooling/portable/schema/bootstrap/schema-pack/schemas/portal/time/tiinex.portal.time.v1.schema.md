# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.portal.v1](../tiinex.portal.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Trace: [tiinex.portal.v1.schema.md](../tiinex.portal.v1.schema.md)
  - Origin:
    - [relative](../tiinex.portal.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/portal/tiinex.portal.v1.schema.md)
- Current
  - Current Schema: [tiinex.portal.time.v1](tiinex.portal.time.v1.schema.md)
  - Created At: 2026-07-02 00:00:00
  - Status: Draft schema proposal
  - Why: Defines a time-specialized portal for requesting or resolving source state at or around a bounded time.
  - Summary: Time portal schema for as-of source views, source snapshots, and historical resolution boundaries.

---

# Portal Time

## Summary

Defines a portal for viewing a source as of a requested moment or bounded time window.

A time portal records the requested temporal view, the target source, the resolution policy, and the resolved source anchor if available. For Git-backed sources, the resolved anchor may be a full commit SHA, tree URL, tag, or comparable source-state identifier. For archive or mirror-backed sources, the anchor may be an archive timestamp, mirror snapshot, or equivalent source-state identifier.

## Core Semantics

- A time portal is a child specialization of `tiinex.portal.v1`.
- A time portal asks to view a source through an as-of moment, before/after boundary, or bounded time window.
- Artifact `Created At` is fallback projection metadata when source-state history is not available.
- Resolved source-state anchors take precedence over artifact `Created At` for source existence or source content claims.
- Current web state must not claim historical completeness.
- A time portal does not preserve source material by itself.
- If a source needs user input to resolve without API/auth, the portal should be `needs-input`, not `failed`.
- API, authentication, paygated, or private resolution paths must be explicit user-invoked capabilities.

## Schema Validation Contract

### Portal Time Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.portal.time.v1`

Rules

- `tiinex.portal.time.v1` identifies artifacts whose main job is to define or record a time-bounded source-resolution portal.
- A time portal inherits portal semantics from `tiinex.portal.v1` and adds requested time, time resolution policy, source-state anchor, and temporal interpretation boundaries.
- A time portal must not use artifact `Created At` as proof of source state when a resolved source anchor is unavailable or contradictory.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Portal Time Body

Required Shape

- first body heading after the continuity envelope
- `## Portal Intent` section
- `## Requested Time` section
- `## Target Source` section
- `## Time Resolution Policy` section
- `## Resolution State` section
- `## Result Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Resolved Source State`
- `Discovery Scope`
- `User Input Boundary`
- `Follow-up Actions`
- `Related Artifacts`
- `Examples`
- `Relationship to Portal Base`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should make the temporal request, resolution boundary, result state, and interpretation limits clear.
- Optional sections must not imply historical completeness unless backed by a resolved source-state anchor or appropriate method.

### Portal Intent

Required Fields

- Portal Type
- Reason

Optional Fields

- Portal ID
- Intended Reader
- Intended Use
- Not For

Rules

- `Portal Type` should be `time` or a clear time-specialized child value.
- `Reason` should state why a time-bounded source view is needed.
- A time portal must remain a source-resolution boundary, not a generic timeline or UI state.

### Requested Time

Required Fields

- Requested Time
- Timezone
- Interpretation

Optional Fields

- Time Window Start
- Time Window End
- Precision
- Source Clock
- User Local Time
- Artifact Created At Fallback

Allowed Labels

- at
- at-or-before
- at-or-after
- before
- after
- between
- nearest-before
- nearest-after
- current-state-fallback

Rules

- Requested time must be human-readable.
- Timezone or unknown timezone state must be explicit.
- If the requested time is approximate, precision must be stated.
- Artifact `Created At` may be used as fallback projection metadata, not as proof of source state.

### Target Source

Required Fields

- Source Kind
- Source Identifier

Optional Fields

- Repository
- Ref
- Branch
- Root Path
- Source URL
- Source Schema
- Source Artifact
- Source Trust Boundary

Rules

- Target source identifies the source whose temporal state is requested.
- Target source does not prove temporal availability, completeness, evidence status, or preservation.

### Time Resolution Policy

Required Fields

- Resolution Mode
- Required Inputs
- Fallback Behavior

Optional Fields

- Historical Source Capability
- No API Policy
- Accepted User Inputs
- User-Invoked Source UI
- Resolver
- Completeness Policy
- Failure Policy
- Source Access Mode
- Git Ref Policy
- Local Git Archive Boundary
- Browser Remote Git Boundary
- Service Boundary

Allowed Labels

- git-commit-at-or-before
- git-tree-url
- git-local-log
- git-local-blob-read
- git-remote-shallow-fetch
- archive-snapshot
- mirror-snapshot
- source-timestamp
- user-supplied-anchor
- current-state-fallback
- no-api-manual-ref
- unavailable
- web-surface
- local-working-tree
- local-git-archive
- browser-remote-git
- service-backed-git

Rules

- Resolution mode must state how the requested time may be translated into a source-state anchor.
- Git-backed time resolution may use `web-surface`, `local-working-tree`, `local-git-archive`, `browser-remote-git`, or `service-backed-git`, but the access mode must remain separate from the time-resolution result.
- `local-git-archive` should mean an explicitly user-provided local repository containing Git history; it must not imply hidden upload, hidden network access, source completeness, evidence status, or preservation.
- `browser-remote-git` should state shallow, branch, checkout, CORS, authentication, browser storage, memory, and repository-size boundaries when they affect resolution.
- `service-backed-git` should state service trust, authentication, privacy, and disclosure boundaries when they affect resolution.
- If a full source-state anchor is required but missing, `needs-input` should be used instead of `failed`.
- A user-supplied anchor must remain labeled as user-supplied unless independently resolved or verified.
- Short commit labels may be displayed, but full commit SHAs should be preferred when available.
- A resolved commit, tree, or blob is a source-state anchor; it does not by itself create evidence, validation, preservation, or truth.

### Resolution State

Required Fields

- State
- Resolved By

Optional Fields

- Resolver
- Resolved At
- Resolution Confidence
- User Input Used
- Missing Inputs
- Failure Reason

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

- Resolution state describes time-portal resolution, not artifact validity or evidence status.
- `needs-input` means the portal needs more input; it is not a failure state.
- `resolved` should identify a source-state anchor or explain why the resolution is current-state-only.

### Resolved Source State

Required Fields

- Anchor Kind
- Anchor

Optional Fields

- Commit SHA
- Short Label
- Tree URL
- Archive URL
- Mirror ID
- Snapshot ID
- Source Timestamp
- Observed At
- Resolution Confidence

Rules

- Resolved anchors should be stable enough to revisit or audit when the source supports stable anchors.
- Full commit SHAs should be recorded when available; short SHAs may be used as display labels only.
- A resolved source state does not by itself preserve source material.

### Result Boundary

Required Fields

- Snapshot Boundary
- Completeness
- Preservation State
- Evidence State

Optional Fields

- Historical Guarantee
- Known Limits
- Fallback Semantics
- Promotable To Finding
- Promotable To Evidence

Rules

- Snapshot boundary must state whether the result is source-ref-bounded, current-web-state-only, user-supplied-anchor, manifest-bounded, partial, or unknown.
- Preservation and evidence state must remain distinct from source resolution.
- Current web state must not be presented as a historical snapshot.

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

- A time portal must disclose what the temporal view cannot prove.
- A time portal must not claim historical completeness, source completeness, evidence status, preservation, truth, authorship, consent, or validation unless supported elsewhere.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.portal.time.v1` artifact when a time-bounded or as-of source view must be requested, resolved, reviewed, or preserved as provenance.
- Do not create this artifact for generic chronology, event records, artifact creation time, UI route history, evidence promotion, preservation records, or validation reports.
- A temporal portal should keep artifact-created-at metadata separate from source-state time.

### Required Inputs

Required Fields

- Temporal Question
- Requested Time Or Window
- Timezone Or Unknown Timezone State
- Target Source
- Time Resolution Mode
- Required Inputs
- Fallback Behavior
- Current Resolution State
- Result Boundary
- Interpretation Limits

Optional Fields

- Source Access Mode
- Resolved Source-State Anchor
- Full Commit SHA
- Short Display Label
- Current Web State
- Projection Metadata
- Related Portal
- Related Discovery

Rules

- Missing timezone, missing historical access, unavailable history, partial history, and fallback projections should be explicit.
- Resolved source snapshots and source-state anchors should take precedence over artifact creation time when interpreting source state.
- Git history resolution may identify a ref, commit, tree, or blob, but it does not by itself create preservation, evidence, validation, claim proof, or truth.

### Generation Rules

Rules

- State the temporal question in human-readable form.
- Record the requested time and interpretation rule.
- Identify the target source.
- Declare the resolution mode and required inputs.
- Record whether the portal is resolved, needs input, partial, failed, unavailable, skipped, or deferred.
- If resolved, record the most stable full source-state anchor available.
- Declare result boundaries and interpretation limits.
- Keep artifact creation time separate from source-state time.

### Suggested Sequence

Rules

- Identify why a time-bounded source view is needed.
- Identify the requested time or window.
- Identify the source and resolution mode.
- Resolve or mark the source-state anchor explicitly.
- Record fallback behavior and interpretation limits.
- Link resulting findings, evidence, preservation, claims, or derivations separately when they are created.

## Validation-Friendly Shape

- Machine-facing contract sections should use root-known category labels such as `Required Shape`, `Required Fields`, `Optional Fields`, `Allowed Labels`, and `Rules`.
- Allowed labels should be plain text values that a validator can compare without interpreting prose.
- Creation guidance should be derived from the same required sections, fields, labels, and rules whenever possible.
- Examples are illustrative and must not add required validation rules beyond the `Schema Validation Contract`.
- Unknown or unavailable child-specific validators must be reported as unknown, unavailable, skipped, or unconfirmed rather than silently treated as pass.

## Minimal Example

```text
# Tiinex/docs as of a known source commit

## Portal Intent

Portal Type: time
Reason: Inspect the docs repository as it looked at a bounded Git source state.

## Requested Time

Requested Time: 2026-07-02 00:00:00
Timezone: UTC
Interpretation: at-or-before
Precision: day

## Target Source

Source Kind: GitHub repository
Source Identifier: Tiinex/docs
Repository: Tiinex/docs
Ref: default branch
Root Path: .topics

## Time Resolution Policy

Resolution Mode: git-tree-url
Required Inputs: full commit SHA or tree URL
Fallback Behavior: if no source-state anchor is provided, treat result as current-web-state-only
No API Policy: public web only
Accepted User Inputs: full commit SHA, commit URL, tree URL
User-Invoked Source UI: GitHub commits page

## Resolution State

State: resolved
Resolved By: user-supplied source reference
Resolver: github-web-tree-url
Resolution Confidence: user-supplied-source-ref

## Resolved Source State

Anchor Kind: git-commit
Commit SHA: e4173f1faca1f4de8ed923220a6aa87438affae2
Short Label: e4173f1
Tree URL: https://github.com/Tiinex/docs/tree/e4173f1faca1f4de8ed923220a6aa87438affae2

## Discovery Scope

Root Path: .topics
Enumeration Method: seed-path-manifest
Fetch Method: raw-url

## Result Boundary

Snapshot Boundary: source-ref-bounded
Completeness: manifest-bounded
Preservation State: fetched-not-preserved
Evidence State: observation-only
Historical Guarantee: bounded to resolved Git commit only

## Interpretation Limits

Does Not Mean: the source state is preserved, complete beyond the declared scope, true, authored by a verified party, or evidence
Must Not Be Used To Claim: historical completeness outside the resolved anchor, evidence status, preservation, consent, or validation
```

## Relationship to Portal Base

`tiinex.portal.time.v1` inherits the portal distinction between source, adapter, portal, finding, evidence, preservation, and view. It adds explicit temporal intent and source-state resolution semantics.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.portal.v1.schema.md](https://github.com/Tiinex/docs/blob/3b0eec3ee450c31078e1c485a769e57d2ce43258/.topics/.schemas/portal/tiinex.portal.v1.schema.md)
  - Value: nLFPkL5Bq-rsKiFpcmXFXvCnwMylUFgcpSMpaVJi8bk

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: VbsArNwVS2lJA0l4BrnaMBzCWKM6WJUgPGlbFAKnH84