# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](../../../core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-06-05 01:00:00
  - Trace: [tiinex.decision.v1.schema.md](../../../core/decision/tiinex.decision.v1.schema.md)
  - Origin:
    - [relative](../../../core/decision/tiinex.decision.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
- Current
  - Current Schema: [tiinex.lineage.upgrade.deferral.v1](tiinex.lineage.upgrade.deferral.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Schema for decisions that acknowledge but defer a known lineage repair or latest upgrade.

---

# Lineage Upgrade Deferral

- Status: maintained schema note

## Summary

This schema narrows decision into a machine-readable decision to acknowledge a
known lineage repair, latest replacement, or upstream upgrade without adopting
it for the current lineage range.

It is for traceable non-adoption, deferral, or partial adoption decisions that
audit, update, or repair tooling should be able to detect.

## Schema Validation Contract

### Lineage Upgrade Deferral Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.lineage.upgrade.deferral.v1`

Rules

- `tiinex.lineage.upgrade.deferral.v1` identifies artifacts centered on a decision to not fully adopt a known lineage upgrade.
- The schema extends decision semantics for a specific upgrade-deferral use case.
- A lineage upgrade deferral artifact should identify the known issue, repair, latest replacement, or upstream upgrade being acknowledged.
- A lineage upgrade deferral artifact should identify the local lineage range affected by the deferral.
- A lineage upgrade deferral artifact should state how audit, update, or repair tooling should treat the acknowledged upgrade.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Deferral Body

Required Shape

- first body heading after the continuity envelope
- `## Decision` section
- `## Deferral` section
- `## Basis` section
- `## Consequences` section

Optional Sections

- Review Conditions
- Supersession
- Linked Artifacts
- Validation
- Immediate Next Questions

Rules

- A lineage upgrade deferral artifact should begin with a human-readable title.
- `Decision` should state the operative decision and decision state.
- `Deferral` should expose machine-readable fields for the known upgrade and local treatment.
- `Basis` should explain why the upgrade is not being fully adopted now.
- `Consequences` should state what now follows for local lineage readers and tools.
- Follow-up sections must not replace the machine-readable `Deferral` surface.
- If the artifact is only discussing possible deferral without deciding anything, a topic artifact should own it instead.
- If the artifact repairs the upstream issue itself rather than deciding local non-adoption, a repair note or another artifact should own that repair.

### Deferral Surface

Instance Target

- `## Deferral`

Required Fields

- Deferral Type
- Known Issue
- Deferred Upgrade
- Affected Local Range
- Adoption Decision
- Material Impact
- Warning Policy

Optional Fields

- Review Condition
- Evidence
- Supersedes
- Expires When
- Notes

Rules

- `Deferral Type` should identify the deferral family, such as `lineage-upgrade`.
- `Known Issue` should identify the upstream repair, defect, superseded leaf, or latest replacement being acknowledged.
- `Deferred Upgrade` should identify the upgrade, repair target, or latest leaf not being fully adopted.
- `Affected Local Range` should identify the descendant leaf, branch, range, or lineage scope covered by the decision.
- `Adoption Decision` should state whether the upgrade is `not-adopted`, `deferred`, or `partial-adoption`.
- `Material Impact` should state whether the impact is `none`, `low`, `medium`, `high`, or `unknown`.
- `Warning Policy` should state whether tooling should `suppress`, `downgrade`, `keep-warning`, or `escalate`.
- `Review Condition` should state when the decision should be revisited when known.
- Required fields may use markdown links, relative paths, absolute URLs, or bounded plain text target identifiers.
- Deferral does not erase the existence of the upstream repair or latest replacement.
- Deferral does not prove that the local lineage is correct; it records the local decision and its stated basis.
- Tooling should not suppress warnings unless the deferral matches the known issue, deferred upgrade, and affected local range.

### Decision Inheritance

Rules

- This schema preserves the decision role of stating what now governs.
- This schema narrows decision into the specific case of lineage upgrade deferral.
- The artifact should remain readable as a decision even when tooling consumes the structured deferral fields.
- If a later artifact adopts the deferred upgrade, it should supersede or reference the deferral.

### Lineage Upgrade Deferral Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Origin`
- parent signal when the deferral continues, refines, or supersedes an earlier decision

Rules

- Lineage upgrade deferral artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Parent signal should be used when the deferral continues or supersedes an earlier local decision.
- Envelope metadata should support, not replace, the decision and deferral surfaces.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-lineage-upgrade-deferral.trace.md`
- `<lineage>-deferral.trace.md`

Rules

- Lineage upgrade deferral artifacts should keep the lineage label first.
- The optional slug should make the deferral role obvious.
- Lineage upgrade deferral artifacts should prefer stable human-readable slugs.
- Lineage upgrade deferral artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.lineage.upgrade.deferral.v1` when a lineage knowingly acknowledges but does not fully adopt a repair, replacement, or latest upstream leaf.
- Do not use `tiinex.lineage.upgrade.deferral.v1` for ordinary product or task deferrals.
- Do not use `tiinex.lineage.upgrade.deferral.v1` for weak observations or feedback.
- Do not use `tiinex.lineage.upgrade.deferral.v1` to hide unresolved integrity failures.
- If material impact is unknown, the artifact should say `unknown` rather than implying safety.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.lineage.upgrade.deferral.v1
  - Created At: 2026-06-14 00:00:00
  - Summary: Deferral for a known upstream lineage repair.

---

# Lineage Upgrade Deferral

## Decision

- State: accepted
- Decision: do not adopt the known upstream repair for this local branch yet

## Deferral

- Deferral Type: lineage-upgrade
- Known Issue: parent origin repair exists upstream
- Deferred Upgrade: 001-2.trace.md
- Affected Local Range: 001-1 and descendants
- Adoption Decision: deferred
- Material Impact: low
- Warning Policy: downgrade
- Review Condition: revisit if this branch later depends on the repaired claim

## Basis

- The repaired upstream claim does not materially affect the local branch's current reasoning.

## Consequences

- Tooling may downgrade latestness warnings for this range while preserving traceability to the upstream repair.
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

- deferral is not denial; it acknowledges the upgrade while recording a local choice not to adopt it now
- tooling should match the structured fields before suppressing warnings
- deferral should remain reversible through a later adoption or supersession decision
- material impact should be honest and may be unknown

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

Rules

- The current lineage upgrade deferral create surface uses version `1`.
- `createTitle` should label the create action as `Create Lineage Upgrade Deferral`.
- `summaryPrompt` should ask for the deferral title.
- `summaryPlaceholder` should guide the user toward the known upstream repair or latest replacement being deferred.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Decision` section
- `## Deferral` section
- `## Basis` section
- `## Consequences` section

Rules

- Generated lineage upgrade deferral artifacts should begin with the deferral title as the first body heading.
- `Decision` should state the operative decision.
- `Deferral` should expose the machine-readable deferral fields.
- `Basis` should explain why the upgrade is not adopted now.
- `Consequences` should state how local readers and tools should treat the decision.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.decision.v1.schema.md](https://github.com/Tiinex/docs/blob/40aa94d7e52a348f9d9fa84754dedff422373689/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Value: NC4HZt0foE58RRbxajb5_6dFDyBCNTLwT8R21lYlMAw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: 2tNtcOqrm3FxtK8_e0GYMhCqPY79c7Jb1irPz80VyKc