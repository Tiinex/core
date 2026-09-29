# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](../tiinex.discovery.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.v1.schema.md](../tiinex.discovery.v1.schema.md)
  - Origin:
    - [relative](../tiinex.discovery.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.follow.v1](tiinex.discovery.follow.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for bounded follow artifacts that preserve ongoing attention to a track, source, person, issue, community, or artifact family without turning attention into surveillance.

---

# Discovery Follow

- Status: maintained schema note

## Summary

This schema narrows discovery into follow: a lightweight, bounded, and usually low-friction form of ongoing attention.

A follow artifact says that a person, group, runtime, or lineage has an interest in a track and wants future changes or relevant material to remain visible within declared limits. It should preserve the difference between being seen, being followed, and being monitored or surveilled.

Follow is not broad crawling, not authority-sensitive observation, and not automatic canonization of later material.

## Schema Validation Contract

### Follow Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.follow.v1`

Rules

- `tiinex.discovery.follow.v1` identifies artifacts centered on bounded ongoing attention to a track or source.
- A follow artifact should state the follow target, basis, interest boundary, update expectation, and stop condition.
- Follow must not be used to hide monitoring, surveillance, or broad collection when those semantics are present.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.discovery.follow.v1` specializes the inherited `Discovery Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.discovery.follow.v1`.
- `Follow Target` and `Follow Basis` specialize `Discovery Intent` and `Discovery Field`.
- `Interest Boundary` specializes `Discovery Boundaries`.
- `Update Expectation` specializes `Discovery Method` and the expected continuation shape of `Discovery Outcome`.
- `Stop Or Review Condition` preserves the required boundedness and review semantics of `Discovery Boundaries` and `Discovery Outcome`.
- `Interpretation Limits` preserves the inherited limit semantics.

### Follow Body

Required Shape

- first body heading after the continuity envelope
- `## Follow Target` section
- `## Follow Basis` section
- `## Interest Boundary` section
- `## Update Expectation` section
- `## Stop Or Review Condition` section
- `## Interpretation Limits` section

Optional Sections

- Interested In
- Not Interested In
- Source Or Origin
- Related Pointer
- Findings
- Next Artifacts
- References

Rules

- A follow artifact should begin with a human-readable title.
- `Follow Target` must identify the track, source, person descriptor, issue, discussion, community, topic, artifact family, or other bounded target being followed.
- `Follow Basis` must state why following is relevant.
- `Interest Boundary` must state what is and is not of interest.
- `Update Expectation` must state whether updates are manual, on open, event-based, periodic, or not declared.
- `Stop Or Review Condition` must state when following should stop, expire, be reviewed, or be reconsidered.
- `Interpretation Limits` must state what following does not prove, authorize, or imply.

### Follow Semantics

Allowed Shapes

- artifact follow
- issue follow
- discussion follow
- source follow
- person-or-role descriptor follow
- community follow
- topic follow
- pointer destination follow
- explicit linked-target follow

Rules

- A follow artifact may express interest without implying endorsement, approval, surveillance, or ownership.
- A follow artifact should prefer explicit target boundaries over vague labels such as `watch everything`.
- If the follow target becomes high-impact, coercive, authority-backed, sensitive, or person-affecting, monitoring or surveillance schemas should be used instead.
- Follow results may become findings, signals, feedback, pointers, evidence candidates, or relation candidates, but not automatically canonical artifacts.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-follow.trace.md`
- `<lineage>-<follow-slug>.trace.md`

Rules

- Follow artifacts should keep the lineage label first.
- The optional slug should identify the followed track, source, or interest boundary.
- Follow artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.discovery.follow.v1` when the main artifact value is bounded ongoing interest.
- Do not use `tiinex.discovery.follow.v1` for research, broad monitoring, high-impact surveillance, evidence bundles, final decisions, or directed feedback.
- Follow does not authorize access, collection, monitoring, surveillance, or decisions by itself.

## Minimal Example

```md
# GitHub Issue Follow

## Follow Target

- Target: one public GitHub issue URL

## Follow Basis

- Basis: the issue may contain feedback relevant to the current lineage.

## Interest Boundary

- Interested In: new comments that directly address the lineage topic
- Not Interested In: unrelated repository activity or user activity

## Update Expectation

- Expectation: manual revisit or explicit refresh only

## Stop Or Review Condition

- Stop: issue closed with no lineage-relevant follow-up, or interest withdrawn

## Interpretation Limits

- Limits: following this issue does not imply endorsement, surveillance, maintainer approval, or truth.
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- Follow artifacts narrow discovery without replacing parent continuity or origin semantics
- Follow artifacts should remain human-readable and provenance-oriented rather than app-runtime configuration
- Follow artifacts may lead to evidence, signal, feedback, pointer, relation, task, decision, privacy, consent, or attestation artifacts when those schemas own the later role
- Follow artifacts must state what they do not prove or authorize

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder
- targetPrompt
- targetPlaceholder
- boundaryPrompt
- boundaryPlaceholder

Rules

- The current follow create surface uses version `1`.
- `createTitle` should label the create action as `Create Follow`.
- `summaryPrompt` should ask for the follow title.
- `summaryPlaceholder` should guide the user toward the relevant discovery surface.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Follow Target` section
- `## Follow Basis` section
- `## Interest Boundary` section
- `## Update Expectation` section
- `## Stop Or Review Condition` section
- `## Interpretation Limits` section

Rules

- Generated follow artifacts should begin with the title as the first body heading.
- `Follow Target` should be preserved in generated artifacts.
- `Follow Basis` should be preserved in generated artifacts.
- `Interest Boundary` should be preserved in generated artifacts.
- `Update Expectation` should be preserved in generated artifacts.
- `Stop Or Review Condition` should be preserved in generated artifacts.
- `Interpretation Limits` should be preserved in generated artifacts.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.v1.schema.md](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Value: DOEm9XKixnIUzuGNZ06-NUbtKT-GNCJ2ktmfJnqgHvo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: nWOL7I4w_m0rGqC7XlueEFPF9qEGzOSPj6R72aJmhw4